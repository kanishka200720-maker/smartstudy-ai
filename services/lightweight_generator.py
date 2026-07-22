import re
from .keyword_extractor import extract_keywords
from .summarizer import summarize_text
from .points_extractor import extract_important_points
from .question_generator import generate_questions, generate_mcqs
from .revision_exporter import generate_revision_txt
from .beginner_simplifier import simplify_text

def process_document(text: str) -> dict:
    if not text or not text.strip():
        return {
            "summary": "No text provided.",
            "points": [],
            "keywords": [],
            "questions": [],
            "mcqs": [],
            "revision_notes": ""
        }
        
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    keywords = extract_keywords(text, top_n=10)
    summary = summarize_text(text, num_sentences=3)
    points = extract_important_points(text, num_points=5)
    
    questions = generate_questions(keywords, sentences, num_questions=5)
    mcqs = generate_mcqs(keywords, sentences, num_mcqs=5)
    
    beginner_explanation = simplify_text(summary)
    
    result = {
        "summary": summary,
        "points": points,
        "keywords": keywords,
        "questions": questions,
        "mcqs": mcqs,
        "beginner_explanation": beginner_explanation
    }
    
    result["revision_notes"] = generate_revision_txt(result)
    
    return result
