import random

def generate_questions(keywords: list[str], sentences: list[str], num_questions: int = 3) -> list[dict]:
    if not keywords or not sentences:
        return []
        
    questions = []
    templates = [
        "What is the significance of {kw}?",
        "Explain the role of {kw} in this context.",
        "How would you define {kw}?"
    ]
    
    for i in range(min(num_questions, len(keywords))):
        kw = keywords[i]
        q_text = random.choice(templates).format(kw=kw)
        
        # Find a sentence containing this keyword for the answer
        answer = "Answer not explicitly found."
        for s in sentences:
            if kw.lower() in s.lower():
                answer = s
                break
                
        questions.append({
            "question": q_text,
            "answer": answer
        })
        
    return questions

def generate_mcqs(keywords: list[str], sentences: list[str], num_mcqs: int = 3) -> list[dict]:
    if len(keywords) < 4 or not sentences:
        return []
        
    mcqs = []
    for i in range(min(num_mcqs, len(keywords))):
        kw = keywords[i]
        # Find a sentence
        source_sentence = None
        for s in sentences:
            if kw.lower() in s.lower():
                source_sentence = s
                break
        
        if not source_sentence:
            continue
            
        # Create a fill-in-the-blank question using regex for exact word replacement
        import re
        q_text = re.sub(rf'\b{kw}\b', "_______", source_sentence, count=1, flags=re.IGNORECASE)
        if q_text == source_sentence:
            continue
            
        other_kws = [k for k in keywords if k.lower() != kw.lower()]
        if len(other_kws) < 3:
            continue
            
        options = random.sample(other_kws, 3)
        options.append(kw)
        random.shuffle(options)
        
        mcqs.append({
            "question": q_text,
            "options": options,
            "correct": kw
        })
        
    return mcqs
