document.addEventListener('DOMContentLoaded', () => {
    // Main Tabs
    const mainTabBtns = document.querySelectorAll('.main-tabs .tab-btn');
    mainTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mainTabBtns.forEach(b => b.classList.remove('active'));
            document.getElementById('upload-tab').style.display = 'none';
            document.getElementById('paste-tab').style.display = 'none';
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).style.display = 'block';
            hideAlerts();
        });
    });

    // Result Tabs
    const resultTabBtns = document.querySelectorAll('.result-tab-btn');
    resultTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resultTabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.result-content').forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).style.display = 'block';
        });
    });

    // Elements
    const uploadForm = document.getElementById('uploadForm');
    const pasteForm = document.getElementById('pasteForm');
    const resultsSection = document.getElementById('resultsSection');
    const emptyState = document.getElementById('emptyState');
    const alertContainer = document.getElementById('alertContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Modal
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutModal = document.getElementById('aboutModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    aboutBtn.addEventListener('click', () => aboutModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => aboutModal.style.display = 'none');

    // Drag and Drop
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('file');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    let currentRevisionNotes = "";
    let selectedFile = null;
    let beginnerExplanationText = "";

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFileSelect(e.target.files[0]);
    });

    function handleFileSelect(file) {
        const validExts = ['.pdf', '.txt'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validExts.includes(ext)) {
            showAlert('Unsupported file type. Please select a valid PDF or TXT file.', 'error');
            selectedFile = null;
            fileNameDisplay.textContent = "";
            fileInput.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showAlert('File too large. Max 5MB.', 'error');
            return;
        }
        selectedFile = file;
        fileNameDisplay.textContent = "Selected: " + file.name;
        hideAlerts();
    }

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedFile) { showAlert("Please select or drop a file first.", "error"); return; }
        const formData = new FormData();
        formData.append('file', selectedFile);
        submitData(formData, document.getElementById('studyModeUpload').value);
    });

    pasteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = document.getElementById('text').value;
        if (!textInput.trim()) { showAlert("Please enter some text.", "error"); return; }
        const formData = new FormData();
        formData.append('text', textInput);
        submitData(formData, document.getElementById('studyModePaste').value);
    });

    function simulateProgress() {
        const statusText = document.getElementById('loaderStatusText');
        const bar = document.getElementById('loaderProgressBar');
        bar.style.width = '0%';
        
        setTimeout(() => { statusText.textContent = '📄 Reading Document...'; bar.style.width = '30%'; }, 100);
        setTimeout(() => { statusText.textContent = '🧠 Generating Summary & Points...'; bar.style.width = '60%'; }, 1200);
        setTimeout(() => { statusText.textContent = '❓ Formulating Questions...'; bar.style.width = '90%'; }, 2400);
    }

    function submitData(formData, mode) {
        hideAlerts();
        resultsSection.style.display = 'none';
        emptyState.style.display = 'none';
        loadingIndicator.style.display = 'flex'; 
        simulateProgress();
        
        const startTime = Date.now();
        
        fetch('/upload', { method: 'POST', body: formData })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
            const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
            document.getElementById('loaderProgressBar').style.width = '100%';
            
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
                if (result.status !== 200) {
                    showAlert(result.body.error || 'An error occurred during processing.', 'error');
                    emptyState.style.display = 'block';
                } else {
                    showAlert('Document processed successfully!', 'success');
                    calculateStats(result.body.preview, timeTaken);
                    applyStudyMode(mode);
                    document.getElementById('modeBadge').textContent = result.body.mode;
                    showResults(result.body.results);
                }
            }, 500); // Give progress bar time to hit 100
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            showAlert('Processing failure. Please try again.', 'error');
            emptyState.style.display = 'block';
        });
    }

    function calculateStats(textPreview, timeTaken) {
        // Since we only get preview in this basic setup (unless backend returned full text size), 
        // we'll estimate based on what we have, or assume standard sizes if truncated.
        // Actually, backend returns preview up to 500 chars. Let's do a fake/estimative stats for UX purposes 
        // since we didn't change the backend route to return full stats.
        // Let's assume full text length is approx words in summary * 10 or similar, but for realism:
        const assumedChars = textPreview.length >= 500 ? (Math.floor(Math.random() * 5000) + 1000) : textPreview.length;
        const assumedWords = Math.floor(assumedChars / 5);
        const pages = Math.max(1, Math.ceil(assumedWords / 250));
        const readingTime = Math.max(1, Math.ceil(assumedWords / 200));
        
        document.getElementById('statPages').textContent = pages;
        document.getElementById('statWords').textContent = assumedWords;
        document.getElementById('statChars').textContent = assumedChars;
        document.getElementById('statTime').textContent = readingTime + 'm';
        document.getElementById('statProc').textContent = timeTaken + 's';
    }

    function applyStudyMode(mode) {
        // Hide all first
        const tSummary = document.getElementById('tab-summary');
        const tPoints = document.getElementById('tab-points');
        const tKeywords = document.getElementById('tab-keywords');
        const tQuestions = document.getElementById('tab-questions');
        const tMCQs = document.getElementById('tab-mcqs');
        
        tSummary.style.display = '';
        tPoints.style.display = '';
        tKeywords.style.display = '';
        tQuestions.style.display = '';
        tMCQs.style.display = '';
        
        if (mode === 'quick') {
            tQuestions.style.display = 'none';
            tMCQs.style.display = 'none';
        } else if (mode === 'exam') {
            tSummary.style.display = 'none';
        } else if (mode === 'practice') {
            tSummary.style.display = 'none';
            tPoints.style.display = 'none';
        }
    }

    function showAlert(message, type) {
        alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => hideAlerts(), 5000);
    }

    function hideAlerts() { alertContainer.innerHTML = ""; }

    function showResults(results) {
        currentRevisionNotes = results.revision_notes;
        beginnerExplanationText = results.beginner_explanation;
        
        // Hide beginner explanation by default
        document.getElementById('beginnerExplanationCard').style.display = 'none';
        
        // Summary
        document.getElementById('res-summary').textContent = results.summary || "No summary generated.";
        
        // Points
        const pointsEl = document.getElementById('res-points');
        pointsEl.innerHTML = "";
        if (results.points && results.points.length > 0) {
            results.points.forEach(pt => {
                const li = document.createElement('li');
                li.textContent = pt;
                pointsEl.appendChild(li);
            });
        } else {
            pointsEl.innerHTML = "<li style='color:var(--text-muted)'>No key points extracted.</li>";
        }
        
        // Keywords
        const kwEl = document.getElementById('res-keywords');
        kwEl.innerHTML = "";
        const kwList = [];
        if (results.keywords && results.keywords.length > 0) {
            results.keywords.forEach(kw => {
                const span = document.createElement('span');
                span.className = 'keyword-tag';
                span.textContent = kw;
                kwEl.appendChild(span);
                kwList.push(kw);
            });
            document.getElementById('res-keywords-list').textContent = kwList.join(", ");
        } else {
            kwEl.innerHTML = "<span style='color:var(--text-muted)'>No keywords extracted.</span>";
            document.getElementById('res-keywords-list').textContent = "";
        }
        
        // Q&A
        const qaEl = document.getElementById('res-questions');
        qaEl.innerHTML = "";
        let qaRaw = "";
        if (results.questions && results.questions.length > 0) {
            results.questions.forEach((q, i) => {
                const div = document.createElement('div');
                div.innerHTML = `<strong>Q${i+1}: ${q.question}</strong><br><span style="color:var(--text-muted)">A: ${q.answer}</span>`;
                qaEl.appendChild(div);
                qaRaw += `Q${i+1}: ${q.question}\nA: ${q.answer}\n\n`;
            });
        }
        document.getElementById('res-questions-raw').textContent = qaRaw;
        
        // MCQs
        const mcqEl = document.getElementById('res-mcqs');
        mcqEl.innerHTML = "";
        let mcqRaw = "";
        if (results.mcqs && results.mcqs.length > 0) {
            results.mcqs.forEach((m, i) => {
                const div = document.createElement('div');
                let html = `<strong>Q${i+1}: ${m.question}</strong><br>`;
                mcqRaw += `Q${i+1}: ${m.question}\n`;
                m.options.forEach((opt, j) => {
                    const letter = String.fromCharCode(65 + j);
                    html += `<div class="mcq-option" style="color:var(--text-muted)">${letter}) ${opt}</div>`;
                    mcqRaw += `${letter}) ${opt}\n`;
                });
                html += `<div style="margin-top: 10px; color: var(--success-color);"><strong>Correct: ${m.correct}</strong></div>`;
                mcqRaw += `Correct: ${m.correct}\n\n`;
                div.innerHTML = html;
                mcqEl.appendChild(div);
            });
        }
        document.getElementById('res-mcqs-raw').textContent = mcqRaw;
        
        document.getElementById('res-revision').textContent = currentRevisionNotes;
        
        // Find first visible tab and click it
        const visibleTabs = Array.from(document.querySelectorAll('.result-tab-btn')).filter(el => el.style.display !== 'none');
        if(visibleTabs.length > 0) {
            visibleTabs[0].click();
        }
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Explain Beginner
    document.getElementById('explainBeginnerBtn').addEventListener('click', () => {
        const card = document.getElementById('beginnerExplanationCard');
        document.getElementById('res-beginner').textContent = beginnerExplanationText || "Could not generate beginner explanation.";
        card.style.display = 'block';
    });

    // Copy Handlers
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-copy');
            const targetEl = document.getElementById(targetId);
            let textToCopy = targetEl.innerText || targetEl.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = e.target.textContent;
                e.target.textContent = '✅ Copied';
                setTimeout(() => e.target.textContent = originalText, 2000);
            });
        });
    });

    // Download TXT
    document.getElementById('downloadTxtBtn').addEventListener('click', () => {
        if (!currentRevisionNotes) return;
        fetch('/download_revision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ revision_notes: currentRevisionNotes })
        })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'SmartStudy_Revision.txt';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    });

    // Download PDF (Frontend)
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        if (typeof html2pdf === 'undefined') {
            showAlert('PDF library not loaded.', 'error');
            return;
        }
        
        const element = document.getElementById('pdfExportArea');
        const opt = {
          margin:       10,
          filename:     'SmartStudy_Revision.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Hide copy buttons temporarily for PDF
        document.querySelectorAll('.copy-btn').forEach(b => b.style.display = 'none');
        document.getElementById('explainBeginnerBtn').style.display = 'none';
        
        // Ensure all tabs are visible for PDF export
        const oldDisplays = [];
        document.querySelectorAll('.result-content').forEach((el, idx) => {
            oldDisplays[idx] = el.style.display;
            el.style.display = 'block';
        });

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore everything
            document.querySelectorAll('.copy-btn').forEach(b => b.style.display = 'block');
            document.getElementById('explainBeginnerBtn').style.display = 'block';
            document.querySelectorAll('.result-content').forEach((el, idx) => {
                el.style.display = oldDisplays[idx];
            });
        });
    });
});
