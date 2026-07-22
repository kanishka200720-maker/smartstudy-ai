def generate_revision_txt(data: dict) -> str:
    lines = []
    lines.append("=" * 40)
    lines.append("SmartStudy Lite AI - Revision Notes")
    lines.append("=" * 40)
    lines.append("")
    
    if "summary" in data and data["summary"]:
        lines.append("SUMMARY")
        lines.append("-" * 40)
        lines.append(data["summary"])
        lines.append("")
    
    if "points" in data and data["points"]:
        lines.append("IMPORTANT POINTS")
        lines.append("-" * 40)
        for i, pt in enumerate(data["points"]):
            lines.append(f"{i+1}. {pt}")
        lines.append("")
    
    if "keywords" in data and data["keywords"]:
        lines.append("KEYWORDS")
        lines.append("-" * 40)
        lines.append(", ".join(data["keywords"]))
        lines.append("")
    
    if "questions" in data and data["questions"]:
        lines.append("QUESTIONS & ANSWERS")
        lines.append("-" * 40)
        for i, q in enumerate(data["questions"]):
            lines.append(f"Q{i+1}: {q.get('question')}")
            lines.append(f"A: {q.get('answer')}")
            lines.append("")
            
    if "mcqs" in data and data["mcqs"]:
        lines.append("MULTIPLE CHOICE QUESTIONS")
        lines.append("-" * 40)
        for i, m in enumerate(data["mcqs"]):
            lines.append(f"Q{i+1}: {m.get('question')}")
            for j, opt in enumerate(m.get('options', [])):
                letter = chr(65 + j)
                lines.append(f"   {letter}) {opt}")
            lines.append(f"   Correct Answer: {m.get('correct')}")
            lines.append("")
            
    return "\n".join(lines)
