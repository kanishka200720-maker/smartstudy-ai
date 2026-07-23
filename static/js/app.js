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
            document.querySelectorAll('.result-content-section').forEach(c => c.style.display = 'none');
            
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
    let selectedFiles = [];
    let beginnerExplanationText = "";

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFiles(e.target.files);
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        selectedFiles = [];
        renderFileList();
    });

    function handleFiles(files) {
        const validExts = ['.pdf', '.txt'];
        for (let i = 0; i < files.length; i++) {
            if (selectedFiles.length >= 5) {
                showAlert('Maximum 5 files allowed per request.', 'error');
                break;
            }
            
            const file = files[i];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) continue;
            
            if (!validExts.includes(ext)) {
                showAlert(`Unsupported file type: ${file.name}`, 'error');
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                showAlert(`File too large (${file.name}). Max 10MB per file.`, 'error');
                continue;
            }
            
            let currentTotalSize = selectedFiles.reduce((acc, curr) => acc + curr.size, 0);
            if (currentTotalSize + file.size > 25 * 1024 * 1024) {
                showAlert(`Adding ${file.name} exceeds the 25MB total combined size limit.`, 'error');
                continue;
            }
            
            selectedFiles.push(file);
        }
        renderFileList();
        hideAlerts();
    }
    
    function renderFileList() {
        const listContainer = document.getElementById('fileListContainer');
        const ul = document.getElementById('fileList');
        ul.innerHTML = '';
        
        let totalSize = 0;
        
        if (selectedFiles.length === 0) {
            listContainer.classList.add('hidden');
            fileInput.value = '';
            return;
        }
        
        listContainer.classList.remove('hidden');
        selectedFiles.forEach((file, index) => {
            totalSize += file.size;
            const li = document.createElement('li');
            li.className = 'file-item';
            
            const sizeKB = (file.size / 1024).toFixed(1);
            li.innerHTML = `
                <div class="file-info">
                    <span class="file-name">📄 ${file.name}</span>
                    <span class="file-size">${sizeKB} KB</span>
                </div>
                <button type="button" class="remove-file-btn" onclick="removeFile(${index})">❌</button>
            `;
            ul.appendChild(li);
        });
        
        document.getElementById('totalFileCount').textContent = `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`;
        document.getElementById('totalFileSize').textContent = `${(totalSize / (1024 * 1024)).toFixed(2)} MB total`;
    }
    
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        renderFileList();
    };

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) { showAlert("Please select or drop files first.", "error"); return; }
        const formData = new FormData();
        selectedFiles.forEach(f => formData.append('file', f));
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
        
        setTimeout(() => { statusText.textContent = 'Reading Document...'; }, 100);
        setTimeout(() => { statusText.textContent = 'Generating Summary & Points...'; }, 1200);
        setTimeout(() => { statusText.textContent = 'Formulating Questions...'; }, 2400);
    }

    function submitData(formData, mode) {
        hideAlerts();
        resultsSection.classList.add('hidden');
        emptyState.style.display = 'none';
        loadingIndicator.classList.remove('hidden');
        simulateProgress();
        
        const startTime = Date.now();
        
        fetch('/upload', { method: 'POST', body: formData })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
            const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
            
            setTimeout(() => {
                loadingIndicator.classList.add('hidden');
                
                if (result.body.failed_files && result.body.failed_files.length > 0) {
                    showAlert(`Warning: Failed to process ${result.body.failed_files.join(', ')}`, 'error');
                }
                
                if (result.status !== 200) {
                    if (!result.body.failed_files || result.body.failed_files.length === 0) {
                        showAlert(result.body.error || 'An error occurred during processing.', 'error');
                    }
                    emptyState.style.display = 'block';
                } else {
                    if (!result.body.failed_files || result.body.failed_files.length === 0) {
                        showAlert('Document processed successfully!', 'success');
                    }
                    calculateStats(result.body.stats, timeTaken);
                    applyStudyMode(mode);
                    document.getElementById('modeBadge').textContent = result.body.mode;
                    showResults(result.body.results);
                }
            }, 500); // Give progress bar time to hit 100
        })
        .catch(error => {
            loadingIndicator.classList.add('hidden');
            showAlert('Processing failure. Please try again.', 'error');
            emptyState.style.display = 'block';
        });
    }

    function calculateStats(stats, timeTaken) {
        if (!stats) return;
        document.getElementById('statPages').textContent = stats.total_pages || 0;
        document.getElementById('statWords').textContent = stats.total_words || 0;
        document.getElementById('statChars').textContent = stats.total_characters || 0;
        document.getElementById('statTime').textContent = (stats.total_reading_time || 0) + 'm';
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
        const indContainer = document.getElementById('individualDocsContainer');
        indContainer.innerHTML = '';
        
        let displayResults = results;
        if (results.is_multiple) {
            document.getElementById('summaryTitle').textContent = 'Combined Summary';
            displayResults = results.combined;
            
            results.individual_files.forEach((doc) => {
                const docDiv = document.createElement('div');
                docDiv.className = 'doc-accordion';
                
                const header = document.createElement('div');
                header.className = 'doc-accordion-header';
                header.innerHTML = `<span>📄 ${doc.filename}</span><span>▼</span>`;
                
                const content = document.createElement('div');
                content.className = 'doc-accordion-content';
                content.innerHTML = `
                    <h4 style="margin-top:0;">Summary</h4>
                    <p style="font-size:0.95rem;">${doc.summary || 'No summary generated.'}</p>
                    <h4>Keywords</h4>
                    <div class="keyword-tags">${(doc.keywords || []).map(k => `<span class="keyword-tag">${k}</span>`).join('')}</div>
                `;
                
                header.addEventListener('click', () => {
                    const isHidden = content.style.display === '' || content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    header.querySelector('span:last-child').textContent = isHidden ? '▲' : '▼';
                });
                
                docDiv.appendChild(header);
                docDiv.appendChild(content);
                indContainer.appendChild(docDiv);
            });
        } else {
            document.getElementById('summaryTitle').textContent = 'Summary';
        }

        currentRevisionNotes = displayResults.revision_notes || results.revision_notes;
        beginnerExplanationText = displayResults.beginner_explanation || results.beginner_explanation;
        
        // Hide beginner explanation by default
        document.getElementById('beginnerExplanationCard').classList.add('hidden');
        
        // Summary
        document.getElementById('res-summary').textContent = displayResults.summary || "No summary generated.";
        
        // Points
        const pointsEl = document.getElementById('res-points');
        pointsEl.innerHTML = "";
        if (displayResults.points && displayResults.points.length > 0) {
            displayResults.points.forEach(pt => {
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
        if (displayResults.keywords && displayResults.keywords.length > 0) {
            displayResults.keywords.forEach(kw => {
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
        if (displayResults.questions && displayResults.questions.length > 0) {
            displayResults.questions.forEach((q, i) => {
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
        if (displayResults.mcqs && displayResults.mcqs.length > 0) {
            displayResults.mcqs.forEach((m, i) => {
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
        
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Explain Beginner
    document.getElementById('explainBeginnerBtn').addEventListener('click', () => {
        const card = document.getElementById('beginnerExplanationCard');
        document.getElementById('res-beginner').textContent = beginnerExplanationText || "Could not generate beginner explanation.";
        card.classList.remove('hidden');
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
        document.querySelectorAll('.result-content-section').forEach((el, idx) => {
            oldDisplays[idx] = el.style.display;
            el.style.display = 'block';
        });

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore everything
            document.querySelectorAll('.copy-btn').forEach(b => b.style.display = 'block');
            document.getElementById('explainBeginnerBtn').style.display = 'block';
            document.querySelectorAll('.result-content-section').forEach((el, idx) => {
                el.style.display = oldDisplays[idx];
            });
        });
    });
});
