import re

def clean_extracted_text(raw_text: str) -> str:
    """Removes extra whitespaces, duplicate empty lines, and unprintable chars."""
    if not raw_text:
        return ""
        
    # Replace multiple spaces with a single space
    cleaned = re.sub(r'[ \t]+', ' ', raw_text)
    
    # Replace multiple newlines with a single newline (or at most two)
    cleaned = re.sub(r'\n\s*\n', '\n\n', cleaned)
    
    # Remove leading/trailing whitespaces
    return cleaned.strip()
