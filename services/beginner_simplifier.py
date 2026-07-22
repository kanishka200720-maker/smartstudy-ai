import re

def simplify_text(text: str) -> str:
    """A lightweight heuristic to 'simplify' text for a beginner."""
    if not text:
        return ""
        
    # Dictionary of complex words to simpler alternatives
    simplifications = {
        r'\butlize\b': 'use',
        r'\butilize\b': 'use',
        r'\bdemonstrated\b': 'shown',
        r'\bcommence\b': 'start',
        r'\bterminate\b': 'end',
        r'\bobjective\b': 'goal',
        r'\bsignificant\b': 'big',
        r'\bfundamental\b': 'basic',
        r'\bcomplex\b': 'hard',
        r'\bsufficient\b': 'enough',
        r'\brequire\b': 'need',
        r'\bessential\b': 'important',
        r'\bfacilitate\b': 'help',
        r'\bimplement\b': 'start using',
        r'\belucidate\b': 'explain',
        r'\bcognitive\b': 'thinking',
        r'\bperceive\b': 'see',
        r'\bdetermine\b': 'find out'
    }
    
    simplified = text
    for complex_word, simple_word in simplifications.items():
        simplified = re.sub(complex_word, simple_word, simplified, flags=re.IGNORECASE)
        
    intro = "Here is a simple explanation: "
    return intro + simplified
