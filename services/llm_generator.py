import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

# We will lazy-load the model
_llm = None

def get_llm():
    global _llm
    if _llm is not None:
        return _llm
        
    model_path = os.getenv("LOCAL_MODEL_PATH")
    if not model_path or not os.path.exists(model_path):
        raise ValueError(f"Model path '{model_path}' is invalid or not set in .env")
    if not model_path.lower().endswith('.gguf'):
        raise ValueError("Model path must point to a .gguf file")
        
    try:
        from llama_cpp import Llama
        logging.info(f"Loading local LLM from {model_path}...")
        _llm = Llama(
            model_path=model_path,
            n_ctx=2048,
            n_gpu_layers=0,  # CPU only
            verbose=False
        )
        logging.info("LLM loaded successfully.")
        return _llm
    except Exception as e:
        logging.error(f"Failed to load LLM: {str(e)}")
        raise e

def _generate(prompt: str) -> str:
    llm = get_llm()
    response = llm(
        prompt,
        max_tokens=350,
        temperature=0.3,
        stop=["<|end|>", "User:", "```\n"]
    )
    return response['choices'][0]['text'].strip()

def generate_ai_study_material(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("Empty text provided")
        
    # Limit text to fit within context (very roughly 1200 words)
    words = text.split()
    truncated_text = " ".join(words[:1200])

    prompt_summary = f"Extract a clear, concise summary of the following text.\n\nText:\n{truncated_text}\n\nSummary:\n"
    summary = _generate(prompt_summary)
    
    prompt_points = f"List the 5 most important key points from the following text as bullet points.\n\nText:\n{truncated_text}\n\nKey Points:\n"
    points_raw = _generate(prompt_points)
    points = [p.strip('-* \t') for p in points_raw.split('\n') if p.strip('-* \t')]
    
    prompt_keywords = f"List the 10 most important keywords or terms from the following text, separated by commas.\n\nText:\n{truncated_text}\n\nKeywords:\n"
    keywords_raw = _generate(prompt_keywords)
    keywords = [k.strip() for k in keywords_raw.split(',')]
    
    prompt_questions = f"Generate 5 important study questions based on the following text. Format as JSON array of objects with 'question' and 'answer' keys.\n\nText:\n{truncated_text}\n\nJSON:\n```json\n"
    questions_raw = _generate(prompt_questions)
    try:
        if questions_raw.endswith('```'):
            questions_raw = questions_raw[:-3]
        questions = json.loads(questions_raw)
        if not isinstance(questions, list):
            questions = []
    except:
        questions = []
        
    prompt_mcqs = f"Generate 5 multiple choice questions based on the text. Format as JSON array of objects with 'question', 'options' (array of 4 strings), and 'correct' (the correct option string) keys.\n\nText:\n{truncated_text}\n\nJSON:\n```json\n"
    mcqs_raw = _generate(prompt_mcqs)
    try:
        if mcqs_raw.endswith('```'):
            mcqs_raw = mcqs_raw[:-3]
        mcqs = json.loads(mcqs_raw)
        if not isinstance(mcqs, list):
            mcqs = []
    except:
        mcqs = []
        
    prompt_beginner = f"Explain the core concept of the following text in very simple English, as if explaining to a beginner.\n\nText:\n{truncated_text}\n\nBeginner Explanation:\n"
    beginner = _generate(prompt_beginner)
    
    from .revision_exporter import generate_revision_txt
    result = {
        "summary": summary,
        "points": points,
        "keywords": keywords,
        "questions": questions,
        "mcqs": mcqs,
        "beginner_explanation": beginner
    }
    result["revision_notes"] = generate_revision_txt(result)
    
    return result
