import re
from .keyword_extractor import extract_keywords

def summarize_text(text: str, num_sentences: int = 3) -> str:
    if not text:
        return ""
    
    # Simple sentence splitting
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if len(sentences) <= num_sentences:
        return text
        
    keywords = set(extract_keywords(text, top_n=15))
    
    scored_sentences = []
    for i, sentence in enumerate(sentences):
        words = set(re.findall(r'\b[a-zA-Z]{3,}\b', sentence.lower()))
        score = len(words.intersection(keywords))
        # Add a slight position bias for early sentences
        if i < 3:
            score += 1
        scored_sentences.append((score, i, sentence))
        
    # Sort by score descending
    scored_sentences.sort(key=lambda x: x[0], reverse=True)
    
    # Pick top N and reorder by original position
    top_sentences = scored_sentences[:num_sentences]
    top_sentences.sort(key=lambda x: x[1])
    
    return " ".join([s for _, _, s in top_sentences])
