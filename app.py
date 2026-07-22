import os
import io
from flask import Flask, render_template, request, jsonify, send_file
from config import Config
from services.document_service import extract_text_from_file
from services.text_cleaner import clean_extracted_text
from werkzeug.exceptions import RequestEntityTooLarge

app = Flask(__name__)
app.config.from_object(Config)

@app.errorhandler(RequestEntityTooLarge)
def handle_large_file(e):
    return jsonify({'error': 'File is too large. Maximum size is 5MB.'}), 413

@app.errorhandler(Exception)
def handle_exception(e):
    # Hide internal stack traces from users
    return jsonify({'error': 'An unexpected error occurred during processing.'}), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files and 'text' not in request.form:
        return jsonify({'error': 'No file or text provided'}), 400
        
    combined_text = ""
    is_multiple = False
    individual_files = []
    failed_files = []
    
    total_words = 0
    total_characters = 0
    total_pages = 0
    
    if 'file' in request.files:
        files = request.files.getlist('file')
        # Check if empty upload
        if not files or files[0].filename == '':
            if 'text' not in request.form or not request.form['text'].strip():
                return jsonify({'error': 'No file provided'}), 400
        else:
            if len(files) > 1:
                is_multiple = True
            
            # Limit to 5 files
            files = files[:5]
                
            file_index = 1
            for file in files:
                ext = os.path.splitext(file.filename)[1].lower()
                if ext not in app.config['UPLOAD_EXTENSIONS']:
                    failed_files.append(file.filename)
                    continue
                    
                try:
                    raw_text = extract_text_from_file(file, ext)
                    clean_text = clean_extracted_text(raw_text)
                    if not clean_text.strip():
                        failed_files.append(file.filename)
                        continue
                        
                    total_characters += len(clean_text)
                    total_words += len(clean_text.split())
                    total_pages += max(1, len(clean_text.split()) // 250)
                        
                    combined_text += f"\n\n===== File {file_index}: {file.filename} =====\n\n" + clean_text
                    file_index += 1
                    
                    if is_multiple:
                        try:
                            from services.llm_generator import generate_ai_study_material
                            ind_res = generate_ai_study_material(clean_text)
                        except Exception:
                            from services.lightweight_generator import process_document
                            ind_res = process_document(clean_text)
                            
                        individual_files.append({
                            "filename": file.filename,
                            "summary": ind_res.get("summary", ""),
                            "keywords": ind_res.get("keywords", [])
                        })
                except Exception as e:
                    failed_files.append(file.filename)
            
    if 'text' in request.form and request.form['text'].strip():
        raw_text = request.form['text']
        clean_text = clean_extracted_text(raw_text)
        if clean_text:
            total_characters += len(clean_text)
            total_words += len(clean_text.split())
            total_pages += max(1, len(clean_text.split()) // 250)
            combined_text += "\n\n===== Pasted Text =====\n\n" + clean_text

    if not combined_text.strip():
        if failed_files:
            return jsonify({'error': f'Failed to parse files: {", ".join(failed_files)}'}), 400
        return jsonify({'error': 'No readable text could be extracted'}), 400

    # Process Combined Text
    try:
        from services.llm_generator import generate_ai_study_material
        combined_results = generate_ai_study_material(combined_text)
        mode_used = "🟢 AI Mode"
    except Exception as e:
        print(f"Fallback triggered due to: {e}")
        from services.lightweight_generator import process_document
        combined_results = process_document(combined_text)
        mode_used = "🟡 Lightweight Mode"

    final_results = combined_results
    if is_multiple:
        final_results = {
            "is_multiple": True,
            "individual_files": individual_files,
            "combined": combined_results
        }
        
    stats = {
        "total_files": len(individual_files) if is_multiple else (1 if 'file' in request.files and request.files.getlist('file')[0].filename != '' else 0),
        "total_words": total_words,
        "total_characters": total_characters,
        "total_pages": total_pages,
        "total_reading_time": max(1, total_words // 200)
    }

    return jsonify({
        'message': 'Extraction and processing successful',
        'preview': combined_text[:500] + ('...' if len(combined_text) > 500 else ''),
        'results': final_results,
        'mode': mode_used,
        'stats': stats,
        'failed_files': failed_files
    })

@app.route('/download_revision', methods=['POST'])
def download_revision():
    data = request.json
    if not data or 'revision_notes' not in data:
        return jsonify({'error': 'No revision notes provided'}), 400
        
    notes = data['revision_notes']
    file_bytes = io.BytesIO(notes.encode('utf-8'))
    file_bytes.seek(0)
    
    return send_file(
        file_bytes,
        as_attachment=True,
        download_name='SmartStudy_Revision.txt',
        mimetype='text/plain'
    )

if __name__ == '__main__':
    app.run(debug=True)
