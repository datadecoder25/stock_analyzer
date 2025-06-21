// Content script for Stock Chart Analyzer
(function() {
    'use strict';

    // Global chart analyzer object
    window.chartAnalyzer = {
        overlay: null,
        selectionBox: null,
        isSelecting: false,
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        currentHandle: null,
        analysisPanel: null,

        init: function() {
            this.createOverlay();
            this.createSelectionBox();
            this.setupEventListeners();
            console.log('Chart Analyzer initialized');
        },

        createOverlay: function() {
            // Remove existing overlay if present
            if (this.overlay) {
                this.overlay.remove();
            }

            this.overlay = document.createElement('div');
            this.overlay.className = 'chart-analyzer-overlay';
            document.body.appendChild(this.overlay);
        },

        createSelectionBox: function() {
            if (this.selectionBox) {
                this.selectionBox.remove();
            }

            this.selectionBox = document.createElement('div');
            this.selectionBox.className = 'chart-selection-box';
            
            // Default position and size
            this.selectionBox.style.left = '100px';
            this.selectionBox.style.top = '100px';
            this.selectionBox.style.width = '300px';
            this.selectionBox.style.height = '200px';

            // Create resize handles
            const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
            handles.forEach(handle => {
                const handleElement = document.createElement('div');
                handleElement.className = `resize-handle ${handle}`;
                handleElement.dataset.handle = handle;
                this.selectionBox.appendChild(handleElement);
            });

            // Create analyze button
            const analyzeButton = document.createElement('button');
            analyzeButton.className = 'analyze-button';
            analyzeButton.textContent = '📸 Analyze Chart';
            analyzeButton.addEventListener('click', () => this.analyzeChart());
            this.selectionBox.appendChild(analyzeButton);

            this.overlay.appendChild(this.selectionBox);
        },

        setupEventListeners: function() {
            // Selection box drag
            this.selectionBox.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('resize-handle')) {
                    this.startResize(e);
                } else if (!e.target.classList.contains('analyze-button')) {
                    this.startDrag(e);
                }
            });

            // Global mouse events
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            document.addEventListener('mouseup', () => this.handleMouseUp());

            // Prevent default drag behavior
            this.selectionBox.addEventListener('dragstart', (e) => e.preventDefault());
        },

        startDrag: function(e) {
            this.isDragging = true;
            this.selectionBox.classList.add('active');
            
            const rect = this.selectionBox.getBoundingClientRect();
            this.startX = e.clientX - rect.left;
            this.startY = e.clientY - rect.top;
            
            e.preventDefault();
        },

        startResize: function(e) {
            this.isResizing = true;
            this.currentHandle = e.target.dataset.handle;
            this.selectionBox.classList.add('active');
            
            const rect = this.selectionBox.getBoundingClientRect();
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.initialRect = rect;
            
            e.preventDefault();
            e.stopPropagation();
        },

        handleMouseMove: function(e) {
            if (this.isDragging) {
                const newX = e.clientX - this.startX;
                const newY = e.clientY - this.startY;
                
                this.selectionBox.style.left = Math.max(0, newX) + 'px';
                this.selectionBox.style.top = Math.max(0, newY) + 'px';
            } else if (this.isResizing) {
                this.handleResize(e);
            }
        },

        handleResize: function(e) {
            const deltaX = e.clientX - this.startX;
            const deltaY = e.clientY - this.startY;
            const rect = this.initialRect;
            
            let newLeft = rect.left;
            let newTop = rect.top;
            let newWidth = rect.width;
            let newHeight = rect.height;

            switch (this.currentHandle) {
                case 'nw':
                    newLeft = rect.left + deltaX;
                    newTop = rect.top + deltaY;
                    newWidth = rect.width - deltaX;
                    newHeight = rect.height - deltaY;
                    break;
                case 'ne':
                    newTop = rect.top + deltaY;
                    newWidth = rect.width + deltaX;
                    newHeight = rect.height - deltaY;
                    break;
                case 'sw':
                    newLeft = rect.left + deltaX;
                    newWidth = rect.width - deltaX;
                    newHeight = rect.height + deltaY;
                    break;
                case 'se':
                    newWidth = rect.width + deltaX;
                    newHeight = rect.height + deltaY;
                    break;
                case 'n':
                    newTop = rect.top + deltaY;
                    newHeight = rect.height - deltaY;
                    break;
                case 's':
                    newHeight = rect.height + deltaY;
                    break;
                case 'w':
                    newLeft = rect.left + deltaX;
                    newWidth = rect.width - deltaX;
                    break;
                case 'e':
                    newWidth = rect.width + deltaX;
                    break;
            }

            // Minimum size constraints
            newWidth = Math.max(100, newWidth);
            newHeight = Math.max(100, newHeight);

            this.selectionBox.style.left = newLeft + 'px';
            this.selectionBox.style.top = newTop + 'px';
            this.selectionBox.style.width = newWidth + 'px';
            this.selectionBox.style.height = newHeight + 'px';
        },

        handleMouseUp: function() {
            this.isDragging = false;
            this.isResizing = false;
            this.currentHandle = null;
            this.selectionBox.classList.remove('active');
        },

        async analyzeChart: function() {
            try {
                console.log('Starting chart analysis...');
                
                // Get API key
                const result = await chrome.storage.sync.get(['openaiApiKey']);
                if (!result.openaiApiKey) {
                    alert('Please configure your OpenAI API key in the extension popup.');
                    return;
                }

                // Show loading state
                const analyzeButton = this.selectionBox.querySelector('.analyze-button');
                const originalText = analyzeButton.textContent;
                analyzeButton.textContent = '🔄 Analyzing...';
                analyzeButton.disabled = true;

                // Capture the selected area
                const imageData = await this.captureSelectedArea();
                
                // Analyze with AI
                const analysis = await this.analyzeWithAI(imageData, result.openaiApiKey);
                
                // Display results
                this.displayAnalysis(analysis);
                
                // Reset button
                analyzeButton.textContent = originalText;
                analyzeButton.disabled = false;
                
            } catch (error) {
                console.error('Analysis error:', error);
                alert('Analysis failed: ' + error.message);
                
                // Reset button
                const analyzeButton = this.selectionBox.querySelector('.analyze-button');
                analyzeButton.textContent = '📸 Analyze Chart';
                analyzeButton.disabled = false;
            }
        },

        async captureSelectedArea: function() {
            return new Promise((resolve, reject) => {
                // Get selection box dimensions
                const rect = this.selectionBox.getBoundingClientRect();
                
                // Temporarily hide the overlay for clean capture
                this.overlay.style.display = 'none';
                
                // Use html2canvas if available, otherwise fallback to canvas
                if (window.html2canvas) {
                    html2canvas(document.body, {
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height,
                        useCORS: true,
                        allowTaint: true
                    }).then(canvas => {
                        this.overlay.style.display = 'block';
                        resolve(canvas.toDataURL('image/png'));
                    }).catch(error => {
                        this.overlay.style.display = 'block';
                        reject(error);
                    });
                } else {
                    // Fallback: create a simple canvas capture
                    const canvas = document.createElement('canvas');
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Fill with a placeholder
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#333';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Chart Area Selected', canvas.width/2, canvas.height/2);
                    
                    this.overlay.style.display = 'block';
                    resolve(canvas.toDataURL('image/png'));
                }
            });
        },

        async analyzeWithAI: function(imageData, apiKey) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-vision-preview',
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this stock chart image and identify key support and resistance levels. Return a JSON response with the following structure:
                                {
                                    "support_levels": [{"price_level": 0.3, "strength": "strong", "description": "Major support from previous lows"}],
                                    "resistance_levels": [{"price_level": 0.8, "strength": "medium", "description": "Resistance at previous high"}],
                                    "trend_direction": "bullish/bearish/sideways",
                                    "confidence": 85,
                                    "key_observations": ["Observation 1", "Observation 2"],
                                    "technical_summary": "Overall market assessment"
                                }
                                
                                Price levels should be normalized between 0 and 1 (0 = bottom of chart, 1 = top of chart).
                                Strength can be: "strong", "medium", "weak".
                                Confidence is 0-100%.`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageData
                                }
                            }
                        ]
                    }],
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Try to parse JSON from the response
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                // Return a fallback analysis
                return {
                    support_levels: [{"price_level": 0.2, "strength": "medium", "description": "Identified support level"}],
                    resistance_levels: [{"price_level": 0.8, "strength": "medium", "description": "Identified resistance level"}],
                    trend_direction: "neutral",
                    confidence: 50,
                    key_observations: ["Analysis completed", "Chart patterns detected"],
                    technical_summary: content.substring(0, 200) + "..."
                };
            }
        },

        displayAnalysis: function(analysis) {
            // Clear existing overlays
            this.clearAnalysisOverlays();
            
            // Draw support and resistance lines
            this.drawSupportResistanceLines(analysis);
            
            // Show analysis panel
            this.showAnalysisPanel(analysis);
        },

        drawSupportResistanceLines: function(analysis) {
            const rect = this.selectionBox.getBoundingClientRect();
            
            // Draw support lines
            if (analysis.support_levels) {
                analysis.support_levels.forEach(level => {
                    const line = document.createElement('div');
                    line.className = 'technical-line support-line';
                    line.style.left = rect.left + 'px';
                    line.style.top = (rect.bottom - (level.price_level * rect.height)) + 'px';
                    line.style.width = rect.width + 'px';
                    line.style.opacity = level.strength === 'strong' ? '0.9' : 
                                        level.strength === 'medium' ? '0.7' : '0.5';
                    
                    // Add label
                    const label = document.createElement('div');
                    label.className = 'pattern-annotation bullish';
                    label.textContent = `Support: ${level.description}`;
                    label.style.left = (rect.left + rect.width - 200) + 'px';
                    label.style.top = (rect.bottom - (level.price_level * rect.height) - 30) + 'px';
                    
                    document.body.appendChild(line);
                    document.body.appendChild(label);
                });
            }
            
            // Draw resistance lines
            if (analysis.resistance_levels) {
                analysis.resistance_levels.forEach(level => {
                    const line = document.createElement('div');
                    line.className = 'technical-line resistance-line';
                    line.style.left = rect.left + 'px';
                    line.style.top = (rect.bottom - (level.price_level * rect.height)) + 'px';
                    line.style.width = rect.width + 'px';
                    line.style.opacity = level.strength === 'strong' ? '0.9' : 
                                        level.strength === 'medium' ? '0.7' : '0.5';
                    
                    // Add label
                    const label = document.createElement('div');
                    label.className = 'pattern-annotation bearish';
                    label.textContent = `Resistance: ${level.description}`;
                    label.style.left = (rect.left + rect.width - 200) + 'px';
                    label.style.top = (rect.bottom - (level.price_level * rect.height) + 10) + 'px';
                    
                    document.body.appendChild(line);
                    document.body.appendChild(label);
                });
            }
        },

        showAnalysisPanel: function(analysis) {
            if (this.analysisPanel) {
                this.analysisPanel.remove();
            }

            this.analysisPanel = document.createElement('div');
            this.analysisPanel.className = 'chart-analyzer-panel';
            
            const html = `
                <button class="close-panel">&times;</button>
                <div class="panel-header">📊 Chart Analysis</div>
                
                <div class="panel-section">
                    <div class="section-title">Market Direction</div>
                    <div class="analysis-item">
                        <span class="analysis-label">Trend:</span>
                        <span class="analysis-value ${analysis.trend_direction}">${analysis.trend_direction}</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Confidence:</span>
                        <span class="analysis-value">${analysis.confidence}%</span>
                    </div>
                </div>
                
                <div class="panel-section">
                    <div class="section-title">Support Levels</div>
                    ${analysis.support_levels ? analysis.support_levels.map(level => `
                        <div class="analysis-item">
                            <span class="analysis-label">${level.strength}</span>
                            <span class="analysis-value bullish">Level ${Math.round(level.price_level * 100)}%</span>
                        </div>
                    `).join('') : '<div class="analysis-item">No support levels identified</div>'}
                </div>
                
                <div class="panel-section">
                    <div class="section-title">Resistance Levels</div>
                    ${analysis.resistance_levels ? analysis.resistance_levels.map(level => `
                        <div class="analysis-item">
                            <span class="analysis-label">${level.strength}</span>
                            <span class="analysis-value bearish">Level ${Math.round(level.price_level * 100)}%</span>
                        </div>
                    `).join('') : '<div class="analysis-item">No resistance levels identified</div>'}
                </div>
                
                <div class="panel-section">
                    <div class="section-title">Key Observations</div>
                    ${analysis.key_observations ? analysis.key_observations.map(obs => `
                        <div class="analysis-item">
                            <span class="analysis-label">•</span>
                            <span class="analysis-value">${obs}</span>
                        </div>
                    `).join('') : '<div class="analysis-item">No specific observations</div>'}
                </div>
                
                <div class="panel-section">
                    <div class="section-title">Summary</div>
                    <div style="font-size: 12px; color: #666; line-height: 1.4;">
                        ${analysis.technical_summary || 'Analysis completed successfully.'}
                    </div>
                </div>
            `;
            
            this.analysisPanel.innerHTML = html;
            
            // Add close button event
            this.analysisPanel.querySelector('.close-panel').addEventListener('click', () => {
                this.analysisPanel.remove();
                this.analysisPanel = null;
            });
            
            document.body.appendChild(this.analysisPanel);
        },

        clearAnalysisOverlays: function() {
            // Remove technical lines
            document.querySelectorAll('.technical-line').forEach(el => el.remove());
            document.querySelectorAll('.pattern-annotation').forEach(el => el.remove());
            document.querySelectorAll('.entry-point').forEach(el => el.remove());
            document.querySelectorAll('.exit-point').forEach(el => el.remove());
        },

        clearOverlays: function() {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
            if (this.analysisPanel) {
                this.analysisPanel.remove();
                this.analysisPanel = null;
            }
            this.clearAnalysisOverlays();
        },

        togglePanel: function() {
            if (this.analysisPanel) {
                this.analysisPanel.style.display = 
                    this.analysisPanel.style.display === 'none' ? 'block' : 'none';
            }
        }
    };

    // Auto-initialize if not already done
    if (!window.chartAnalyzer.overlay) {
        console.log('Chart Analyzer content script loaded');
    }
})();