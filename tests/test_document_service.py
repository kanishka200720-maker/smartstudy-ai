import pytest
import io
from services.document_service import extract_text_from_file
from pypdf import PdfWriter

def test_extract_txt_file():
    content = b"Hello, this is a text file."
    file_stream = io.BytesIO(content)
    text = extract_text_from_file(file_stream, '.txt')
    assert text == "Hello, this is a text file."

def test_extract_txt_file_invalid_encoding():
    # Provide something that cannot be decoded via utf-8
    content = b"\xff\xfe\x00\x00" 
    file_stream = io.BytesIO(content)
    text = extract_text_from_file(file_stream, '.txt')
    assert isinstance(text, str)

def test_extract_unsupported_ext():
    file_stream = io.BytesIO(b"")
    with pytest.raises(ValueError, match="Unsupported extension"):
        extract_text_from_file(file_stream, '.jpg')

def test_extract_pdf_file():
    # Create a dummy PDF in memory
    writer = PdfWriter()
    page = writer.add_blank_page(width=72, height=72)
    pdf_bytes = io.BytesIO()
    writer.write(pdf_bytes)
    pdf_bytes.seek(0)
    
    text = extract_text_from_file(pdf_bytes, '.pdf')
    assert isinstance(text, str)
