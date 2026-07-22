import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 5 MB max size
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 5 * 1024 * 1024))
    LOCAL_MODEL_PATH = os.environ.get('LOCAL_MODEL_PATH', '')
    UPLOAD_EXTENSIONS = ['.pdf', '.txt']
