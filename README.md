# SmartStudy Lite AI

**SmartStudy Lite AI** is a lightweight, responsive, and powerful offline AI study assistant. It takes your study materials (PDFs, plain text, or pasted content) and dynamically generates summaries, important points, keywords, study questions, multiple choice questions (MCQs), and beginner explanations.

![Project Banner Placeholder](https://via.placeholder.com/1200x400.png?text=SmartStudy+Lite+AI+Dashboard)

## 🌟 Features
- **Dual Processing Engines**:
  - **🟢 AI Mode**: Connects to a local GGUF model via `llama-cpp-python` for generative AI parsing (Summaries, MCQs, Beginner Explanations).
  - **🟡 Lightweight Mode**: A built-in robust algorithmic fallback that uses heuristics, TF-IDF scoring, and template matching if the AI model is absent or throws an error.
- **Multiple Study Modes**: Filter your results for *Quick Revision*, *Exam Preparation*, *Beginner Learning*, or *Question Practice*.
- **Extensive UI & UX**: Modern glassmorphism dashboard, drag-and-drop file support, simulated animated progress loaders, and native copy-to-clipboard functionality.
- **Export Options**: Download your revision notes instantly as a `.TXT` or a cleanly formatted `.PDF` directly via the browser.

## 🛠 Technologies Used
- **Backend**: Python, Flask, Pytest
- **AI Integration**: `llama-cpp-python` (CPU-optimized)
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (Zero bloated frameworks)
- **PDF Extraction**: `pypdf`
- **PDF Generation**: `html2pdf.js`

## 📂 Folder Structure
See the detailed `architecture.md` file for full layout and UML diagrams.
```text
smartstudy-lite-ai/
├── app.py                     # Main Flask entrypoint
├── services/                  # Core logic, LLM, & Algorithmic Extractors
├── static/                    # CSS & JS assets
├── templates/                 # HTML templates
├── tests/                     # Pytest suite
└── requirements.txt
```

## 🚀 Installation & Running Locally

1. **Clone the repository**
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure the AI Model (Optional)**:
   - Download a small GGUF model from HuggingFace (e.g. TinyLlama).
   - Copy `.env.example` to `.env`.
   - Update `LOCAL_MODEL_PATH="C:/path/to/your/model.gguf"`.
5. **Run the Application**:
   ```bash
   python app.py
   ```
   Open `http://127.0.0.1:5000` in your browser.

## ☁️ Deployment (Render)
This project is configured out-of-the-box for deployment on [Render](https://render.com/).
1. Push your code to GitHub.
2. In the Render Dashboard, create a new **Web Service**.
3. Connect your repository. Render will automatically detect the `render.yaml` configuration.
4. (Optional) If you do not provide a `LOCAL_MODEL_PATH` in Render's environment variables, the app will gracefully run entirely in **🟡 Lightweight Mode**.

## 🔮 Future Enhancements
- Integration of a dedicated Flashcard UI module.
- Expanded support for `.docx` and `.epub` formats.
- Persistent user history and study plan tracking.

---
*Created for Educational Purposes | © 2026*
