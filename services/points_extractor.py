import re

def extract_important_points(text: str, num_points: int = 3) -> list[str]:
    if not text:
        return []
        
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.split()) > 4]
    
    points = []
    # Heuristics for important sentences
    key_phrases = ["is defined as", "means", "refers to", "important", "key", "significant", "must", "always"]
    
    for sentence in sentences:
        lower_s = sentence.lower()
        if any(phrase in lower_s for phrase in key_phrases):
            points.append(sentence)
            if len(points) == num_points:
                break
                
    # Fallback: if we didn't find enough points, just grab a few from the beginning/middle
    if len(points) < num_points:
        for sentence in sentences:
            if sentence not in points:
                points.append(sentence)
            if len(points) == num_points:
                break
                
    return points
