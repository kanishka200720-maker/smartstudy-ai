import pytest
from services.text_cleaner import clean_extracted_text

def test_clean_extracted_text_empty():
    assert clean_extracted_text("") == ""
    assert clean_extracted_text(None) == ""

def test_clean_extracted_text_whitespaces():
    raw = "This   is  some    text."
    assert clean_extracted_text(raw) == "This is some text."

def test_clean_extracted_text_newlines():
    raw = "Line 1\n\n\n\nLine 2\n\nLine 3"
    assert clean_extracted_text(raw) == "Line 1\n\nLine 2\n\nLine 3"

def test_clean_extracted_text_trimming():
    raw = "   Trim me   "
    assert clean_extracted_text(raw) == "Trim me"
