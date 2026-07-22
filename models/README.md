# Local Models Directory

This directory is intended to store the local GGUF models for Generative AI capabilities.

## Setup Instructions

1. Download the required GGUF model (e.g., `qwen2.5-0.5b-instruct-q4_0.gguf`) from HuggingFace or your preferred source.
2. Place the downloaded `.gguf` file inside this `models/` directory.
3. Update the `.env` file with the path to the model:
   ```env
   LOCAL_MODEL_PATH=models/qwen2.5-0.5b-instruct-q4_0.gguf
   ```

**Important**: Do not commit large model files to version control. The `.gitignore` is configured to ignore `*.gguf` files.
