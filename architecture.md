# Architecture Diagrams for SmartStudy Lite AI

## 1. Application Architecture

```mermaid
graph TD
    Client[Web Browser Client]
    
    subgraph Frontend [Frontend: HTML / CSS / Vanilla JS]
        UI[Glassmorphism UI]
        JS[app.js Logic]
        PDFGen[html2pdf.js]
        UI <--> JS
        JS --> PDFGen
    end

    subgraph Backend [Backend: Flask Framework]
        FlaskRouter[/upload]
        DLRoute[/download_revision]
        EnvConfig[.env Configuration]
        
        FlaskRouter <--> EnvConfig
    end

    subgraph Services [Smart Processing Engine]
        DocService[document_service.py\npypdf]
        CleanService[text_cleaner.py]
        
        subgraph Mode [Processing Logic]
            LLMGenerator[llm_generator.py\nGenerative AI]
            LightweightGen[lightweight_generator.py\nAlgorithmic Fallback]
        end
        
        FeatureExtractors[summarizer.py, keyword_extractor.py, \npoints_extractor.py, question_generator.py]
    end
    
    Client -- HTTP POST File/Text --> FlaskRouter
    JS -- Fetch API --> FlaskRouter
    
    FlaskRouter --> DocService
    DocService --> CleanService
    CleanService --> Mode
    
    LLMGenerator -- Try --> LocalModel((Local GGUF Model))
    LLMGenerator -- Fallback on Error --> LightweightGen
    
    LightweightGen --> FeatureExtractors
    
    Mode -- JSON Results --> FlaskRouter
    FlaskRouter -- JSON Response --> JS
```

## 2. Workflow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Flask Route
    participant Processing Engine
    participant LlamaCPP
    
    User->>Frontend: Uploads PDF / Pastes Text
    User->>Frontend: Selects "Exam Preparation" Mode
    Frontend->>Flask Route: POST /upload with form data
    Flask Route->>Processing Engine: Extract & Clean Text
    
    alt If LOCAL_MODEL_PATH is valid & no errors
        Processing Engine->>LlamaCPP: Lazy-load model
        LlamaCPP-->>Processing Engine: Generate Summary, MCQs, etc.
    else Fallback Triggered
        Processing Engine->>Processing Engine: Trigger lightweight_generator.py
        Processing Engine->>Processing Engine: Algorithmic extraction (scoring/heuristics)
    end
    
    Processing Engine-->>Flask Route: Structured JSON output
    Flask Route-->>Frontend: Returns JSON (mode attached)
    
    Frontend->>Frontend: Filter tabs based on Study Mode
    Frontend->>Frontend: Display Success Alert
    Frontend-->>User: Render Glassmorphism Result Tabs
```

## 3. Folder Structure Diagram

```mermaid
graph TD
    Root[smartstudy-lite-ai/]
    
    Root --> App[app.py]
    Root --> Config[config.py]
    Root --> Env[.env / .env.example]
    Root --> Req[requirements.txt]
    Root --> Render[render.yaml & Procfile]
    
    Root --> Services[services/]
    Services --> S1[document_service.py]
    Services --> S2[text_cleaner.py]
    Services --> S3[llm_generator.py]
    Services --> S4[lightweight_generator.py]
    Services --> S5[...other extractors]
    
    Root --> Templates[templates/]
    Templates --> T1[base.html]
    Templates --> T2[index.html]
    
    Root --> Static[static/]
    Static --> CSS[css/style.css]
    Static --> JS[js/app.js]
    
    Root --> Tests[tests/]
    Tests --> Test1[test_document_service.py]
    Tests --> Test2[test_lightweight_generator.py]
```
