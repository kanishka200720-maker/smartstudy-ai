import pypdf
from typing import BinaryIO

def extract_text_from_file(file: BinaryIO, ext: str) -> str:
    """Extracts text from an uploaded file stream (in memory)."""
    text = ""
    if ext == '.pdf':
        try:
            pdf_reader = pypdf.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception:
            raise ValueError("Failed to read PDF file. It might be encrypted or corrupted.")
    elif ext == '.txt':
        try:
            text = file.read().decode('utf-8')
        except UnicodeDecodeError:
            try:
                # Fallback encoding
                file.seek(0)
                text = file.read().decode('latin-1')
            except Exception:
                raise ValueError("Failed to read TXT file. Unsupported encoding.")
    else:
        raise ValueError(f"Unsupported extension: {ext}")
        
    return text
