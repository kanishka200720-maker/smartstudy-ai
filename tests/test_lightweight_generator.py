import pytest
from services.lightweight_generator import process_document
from services.keyword_extractor import extract_keywords
from services.summarizer import summarize_text
from services.points_extractor import extract_important_points

def test_process_empty_document():
    result = process_document("")
    assert result["summary"] == "No text provided."
    assert len(result["points"]) == 0
    assert len(result["keywords"]) == 0

def test_process_document():
    text = "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of intelligent agents: any system that perceives its environment and takes actions that maximize its chance of achieving its goals. Some popular accounts use the term artificial intelligence to describe machines that mimic human cognitive functions, such as learning and problem solving."
    result = process_document(text)
    
    assert "summary" in result
    assert isinstance(result["points"], list)
    assert isinstance(result["keywords"], list)
    assert isinstance(result["questions"], list)
    assert isinstance(result["mcqs"], list)
    assert "revision_notes" in result
    
def test_keyword_extractor():
    text = "Machine learning is a field of inquiry devoted to understanding and building methods that learn. Machine learning is a branch of artificial intelligence."
    kws = extract_keywords(text, top_n=2)
    assert "machine" in kws
    assert "learning" in kws

def test_summarizer_short_text():
    text = "Short sentence one. Short sentence two."
    summary = summarize_text(text, num_sentences=3)
    assert "Short sentence one" in summary
    assert "Short sentence two" in summary

def test_points_extractor():
    text = "This is a normal sentence. The key point is that it works. It is defined as a test."
    points = extract_important_points(text, num_points=2)
    assert any("defined" in p for p in points) or any("key point" in p for p in points)
