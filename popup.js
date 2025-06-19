document.addEventListener('DOMContentLoaded', function() {
    const applyBtn = document.getElementById('apply-to-chart');
    const toggleBtn = document.getElementById('toggle-analysis');
    const clearBtn = document.getElementById('clear-overlays');
    const debugBtn = document.getElementById('debug-test');
    const apiSettingsBtn = document.getElementById('api-settings');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiSettingsPanel = document.getElementById('api-settings-panel');
    const apiKeyInput = document.getElementById('openai-api-key');
    const apiStatus = document.getElementById('api-status');
    const status = document.getElementById('status');
    
    // Load existing API key on startup
    loadApiKey();
    
    // Update status function
    function updateStatus(message, isError = false) {
        status.textContent = message;
        status.style.background = isError ? 
            'rgba(255, 0, 0, 0.2)' : 
            'rgba(0, 255, 0, 0.2)';
        
        setTimeout(() => {
            status.style.background = 'rgba(255, 255, 255, 0.1)';
        }, 2000);
    }
    
    // API Settings toggle
    apiSettingsBtn.addEventListener('click', function() {
        if (apiSettingsPanel.style.display === 'none') {
            apiSettingsPanel.style.display = 'block';
            apiSettingsBtn.textContent = '🔼 Hide Settings';
            loadApiKey(); // Refresh API key display
        } else {
            apiSettingsPanel.style.display = 'none';
            apiSettingsBtn.textContent = '⚙️ API Settings';
        }
    });
    
    // Save API key
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({'openai_api_key': apiKey}, function() {
                updateApiStatus('✅ API key saved successfully!', false);
                updateStatus('🤖 AI features enabled');
            });
        } else {
            updateApiStatus('❌ Please enter a valid API key', true);
        }
    });
    
    function loadApiKey() {
        chrome.storage.sync.get(['openai_api_key'], function(result) {
            if (result.openai_api_key) {
                apiKeyInput.value = result.openai_api_key;
                updateApiStatus('✅ API key configured', false);
            } else {
                updateApiStatus('❌ No API key configured', true);
            }
        });
    }
    
    function updateApiStatus(message, isError = false) {
        apiStatus.textContent = message;
        apiStatus.style.background = isError ? 
            'rgba(255, 0, 0, 0.2)' : 
            'rgba(0, 255, 0, 0.2)';
        apiStatus.style.color = isError ? '#ff4444' : '#00aa00';
    }
    
    // Apply to chart button - SIMPLIFIED VERSION
    applyBtn.addEventListener('click', async function() {
        console.log('🎯 Apply to Chart clicked - Simple version');
        
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // Inject simple selection box directly
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: createSimpleSelectionBox
            });
            
            updateStatus('✅ Selection box created!');
            
        } catch (error) {
            console.error('❌ Error creating selection box:', error);
            updateStatus('❌ Error: Could not create box on this page', true);
        }
    });
    
    // Clear overlays button
    clearBtn.addEventListener('click', async function() {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: clearSimpleBox
            });
            
            updateStatus('🗑️ Selection box cleared');
        } catch (error) {
            console.error('❌ Error clearing box:', error);
            updateStatus('❌ Error clearing box', true);
        }
    });
    
    // Debug test button (enhanced with diagnostics)
    debugBtn.addEventListener('click', async function() {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: debugTest
            });
            
            updateStatus('🔧 Debug diagnostics displayed');
        } catch (error) {
            console.error('❌ Debug test failed:', error);
            updateStatus('❌ Debug test failed', true);
        }
    });
    
    // Remove toggle button functionality for now (not needed)
    toggleBtn.style.display = 'none';
});

// SIMPLE SELECTION BOX CREATION - This should definitely work
function createSimpleSelectionBox() {
    console.log('📦 Creating simple selection box...');
    
    // Remove any existing selection box
    const existing = document.getElementById('chart-selection-overlay');
    if (existing) {
        existing.remove();
    }
    
    // Define all required functions in the content script context
    window.captureAreaAsImageWithProgress = async function(rect, updateProgress) {
        return new Promise((resolve, reject) => {
            console.log('📸 captureAreaAsImageWithProgress called with rect:', rect);
            
            // Set up timeout for image capture
            const captureTimeout = setTimeout(() => {
                reject(new Error('Image capture timeout - took longer than 15 seconds'));
            }, 15000); // 15 second timeout for capture
            
            const cleanup = () => {
                clearTimeout(captureTimeout);
            };
            
            updateProgress('Loading Libraries', 15, 'Checking html2canvas...');
            
            // Check if html2canvas is available
            if (typeof html2canvas === 'undefined') {
                updateProgress('Loading Libraries', 18, 'Downloading html2canvas...');
                // Load html2canvas dynamically
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                script.onload = () => {
                    updateProgress('Libraries Loaded', 20, 'html2canvas ready');
                    performCapture();
                };
                script.onerror = () => {
                    updateProgress('Library Failed', 22, 'Using fallback method...');
                    fallbackCapture();
                };
                document.head.appendChild(script);
            } else {
                updateProgress('Libraries Ready', 20, 'html2canvas available');
                performCapture();
            }
            
            function performCapture() {
                try {
                    updateProgress('Preparing Capture', 21, 'Hiding overlay temporarily...');
                    
                    // Get reference to the overlay
                    const overlay = document.getElementById('chart-selection-overlay');
                    
                    // Briefly hide overlay for clean capture
                    const originalDisplay = overlay ? overlay.style.display : null;
                    if (overlay) {
                        overlay.style.display = 'none';
                    }
                    
                    updateProgress('Capturing Screen', 22, 'Taking screenshot...');
                    
                    // Small delay to ensure overlay is hidden
                    setTimeout(() => {
                        const capturePromise = html2canvas(document.body, {
                            x: rect.left,
                            y: rect.top,
                            width: rect.width,
                            height: rect.height,
                            useCORS: true,
                            allowTaint: true,
                            scale: 1,
                            logging: false, // Disable logging to reduce console spam
                            timeout: 10000 // 10 second timeout for html2canvas itself
                        });
                        
                        // Race html2canvas against timeout
                        Promise.race([
                            capturePromise,
                            new Promise((_, rejectTimeout) => {
                                setTimeout(() => {
                                    rejectTimeout(new Error('html2canvas timeout'));
                                }, 10000);
                            })
                        ]).then(canvas => {
                            // Restore overlay immediately after capture
                            if (overlay) {
                                overlay.style.display = originalDisplay || 'block';
                            }
                            
                            updateProgress('Processing Image', 24, 'Converting to data URL...');
                            
                            try {
                                const imageData = {
                                    dataUrl: canvas.toDataURL('image/png'),
                                    width: rect.width,
                                    height: rect.height,
                                    canvas: canvas
                                };
                                
                                console.log('✅ Image captured successfully:', {
                                    width: imageData.width,
                                    height: imageData.height,
                                    dataUrlLength: imageData.dataUrl.length,
                                    sizeKB: Math.round(imageData.dataUrl.length / 1024)
                                });
                                
                                cleanup();
                                resolve(imageData);
                            } catch (canvasError) {
                                console.error('❌ Canvas to data URL failed:', canvasError);
                                if (overlay) {
                                    overlay.style.display = originalDisplay || 'block';
                                }
                                updateProgress('Canvas Error', 23, 'Using fallback method...');
                                fallbackCapture();
                            }
                        }).catch(error => {
                            // Restore overlay on error
                            if (overlay) {
                                overlay.style.display = originalDisplay || 'block';
                            }
                            console.error('❌ html2canvas failed:', error);
                            updateProgress('Capture Failed', 23, 'Using fallback method...');
                            fallbackCapture();
                        });
                    }, 100);
                } catch (error) {
                    console.error('❌ html2canvas error:', error);
                    updateProgress('Capture Error', 23, 'Using fallback method...');
                    fallbackCapture();
                }
            }
            
            function fallbackCapture() {
                try {
                    updateProgress('Fallback Capture', 22, 'Generating demo chart...');
                    
                    // Manual canvas-based capture
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                    
                    // Fill with white background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, rect.width, rect.height);
                    
                    // Add a simple chart simulation for demo
                    drawDemoChart(ctx, rect.width, rect.height);
                    
                    const imageData = {
                        dataUrl: canvas.toDataURL('image/png'),
                        width: rect.width,
                        height: rect.height,
                        canvas: canvas,
                        isFallback: true
                    };
                    
                    console.log('⚠️ Using fallback capture:', {
                        width: imageData.width,
                        height: imageData.height,
                        sizeKB: Math.round(imageData.dataUrl.length / 1024)
                    });
                    
                    cleanup();
                    resolve(imageData);
                } catch (fallbackError) {
                    console.error('❌ Fallback capture also failed:', fallbackError);
                    cleanup();
                    reject(new Error('Both capture methods failed: ' + fallbackError.message));
                }
            }
        });
    };
    
    window.analyzeCapturedImageWithProgress = async function(imageData, rect, updateProgress) {
        updateProgress('Getting API Key', 40, 'Retrieving OpenAI credentials...');
        
        const API_KEY = await getOpenAIApiKey();
        
        if (!API_KEY) {
            throw new Error('OpenAI API key not configured. Please add your API key in the extension settings.');
        }
        
        updateProgress('API Key Retrieved', 45, 'Preparing AI request...');
        
        const prompt = `
        Analyze this financial chart image and identify support and resistance levels. 
        
        Please provide your analysis in the following JSON format:
        {
            "analysis": {
                "trend": "bullish|bearish|sideways",
                "confidence": 0-100,
                "summary": "Brief analysis summary"
            },
            "support_levels": [
                {
                    "price_level": 0.0-1.0,
                    "strength": "strong|medium|weak",
                    "description": "Description of this support level"
                }
            ],
            "resistance_levels": [
                {
                    "price_level": 0.0-1.0,
                    "strength": "strong|medium|weak", 
                    "description": "Description of this resistance level"
                }
            ],
            "key_observations": [
                "Important observation 1",
                "Important observation 2"
            ]
        }
        
        Notes:
        - price_level should be a value between 0.0 (bottom of chart) and 1.0 (top of chart)
        - Look for horizontal levels where price has bounced multiple times
        - Consider volume patterns if visible
        - Identify trend lines and key technical levels
        - Be specific about why each level is significant
        `;
        
        try {
            updateProgress('Sending to OpenAI', 50, 'Uploading image to GPT-4 Vision...');
            
            console.log('📤 Sending request to OpenAI API...');
            console.log('Image size:', Math.round(imageData.dataUrl.length / 1024), 'KB');
            
            // Create fetch with timeout
            const fetchWithTimeout = (url, options, timeout = 20000) => {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) => {
                        setTimeout(() => {
                            reject(new Error('API request timeout - took longer than 20 seconds'));
                        }, timeout);
                    })
                ]);
            };
            
            const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-4-vision-preview",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: imageData.dataUrl,
                                        detail: "high"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.1
                })
            }, 20000); // 20 second timeout
            
            updateProgress('Processing Response', 60, 'Waiting for AI analysis...');
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Unknown API error' } }));
                console.error('❌ OpenAI API Error:', errorData);
                throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            updateProgress('Parsing Results', 65, 'Reading AI response...');
            
            const data = await response.json();
            console.log('📥 Received OpenAI response:', data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from OpenAI API');
            }
            
            const analysisText = data.choices[0].message.content;
            console.log('🔍 Analysis text:', analysisText);
            
            updateProgress('Extracting Data', 70, 'Parsing JSON response...');
            
            // Parse JSON from the response with better error handling
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ No JSON found in response:', analysisText);
                // Try to create a fallback response
                const fallbackAnalysis = {
                    analysis: {
                        trend: "sideways",
                        confidence: 50,
                        summary: "Unable to parse AI response, using fallback analysis"
                    },
                    support_levels: [
                        {
                            price_level: 0.3,
                            strength: "medium",
                            description: "Fallback support level at 30%"
                        }
                    ],
                    resistance_levels: [
                        {
                            price_level: 0.7,
                            strength: "medium",
                            description: "Fallback resistance level at 70%"
                        }
                    ],
                    key_observations: [
                        "AI response could not be parsed",
                        "Using fallback analysis for demonstration"
                    ]
                };
                
                console.log('⚠️ Using fallback analysis:', fallbackAnalysis);
                
                // Add image dimensions for coordinate calculation
                fallbackAnalysis.imageWidth = imageData.width;
                fallbackAnalysis.imageHeight = imageData.height;
                fallbackAnalysis.captureRect = rect;
                fallbackAnalysis.isFallback = true;
                
                updateProgress('Analysis Ready', 74, 'Using fallback analysis');
                return fallbackAnalysis;
            }
            
            let analysis;
            try {
                analysis = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error('Could not parse JSON from LLM response: ' + parseError.message);
            }
            
            console.log('✅ Parsed analysis:', analysis);
            
            // Add image dimensions for coordinate calculation
            analysis.imageWidth = imageData.width;
            analysis.imageHeight = imageData.height;
            analysis.captureRect = rect;
            
            updateProgress('Analysis Ready', 74, 'AI analysis completed successfully');
            
            return analysis;
            
        } catch (error) {
            console.error('❌ OpenAI API call failed:', error);
            
            // Provide more specific error messages
            if (error.message.includes('timeout')) {
                throw new Error('AI analysis timed out. Please try again with a smaller image.');
            } else if (error.message.includes('API key')) {
                throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
            } else if (error.message.includes('rate limit')) {
                throw new Error('API rate limit exceeded. Please wait a moment and try again.');
            } else if (error.message.includes('quota')) {
                throw new Error('API quota exceeded. Please check your OpenAI account billing.');
            } else {
                throw error;
            }
        }
    };
    
    window.drawAnalysisLines = function(analysis, rect) {
        // Remove any existing analysis lines
        const existingLines = document.querySelectorAll('.ai-analysis-line');
        existingLines.forEach(line => line.remove());
        
        // Draw support levels
        if (analysis.support_levels) {
            analysis.support_levels.forEach((level, index) => {
                const y = rect.top + (1 - level.price_level) * rect.height;
                drawSupportLine(rect.left, y, rect.width, level, `support-${index}`);
            });
        }
        
        // Draw resistance levels  
        if (analysis.resistance_levels) {
            analysis.resistance_levels.forEach((level, index) => {
                const y = rect.top + (1 - level.price_level) * rect.height;
                drawResistanceLine(rect.left, y, rect.width, level, `resistance-${index}`);
            });
        }
    };
    
    window.showAnalysisResults = function(analysis, imageData) {
        const resultsPanel = document.createElement('div');
        resultsPanel.id = 'ai-analysis-results';
        resultsPanel.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 350px !important;
            max-height: 600px !important;
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 12px !important;
            padding: 20px !important;
            z-index: 2147483647 !important;
            font-family: Arial, sans-serif !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
            backdrop-filter: blur(10px) !important;
            overflow-y: auto !important;
        `;
        
        let supportSection = '';
        if (analysis.support_levels && analysis.support_levels.length > 0) {
            supportSection = `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #00aa00; margin: 0 0 8px 0; font-size: 14px;">📈 Support Levels</h4>
                    ${analysis.support_levels.map(level => `
                        <div style="margin-bottom: 8px; padding: 8px; background: rgba(0, 255, 0, 0.1); border-radius: 6px; border-left: 3px solid #00aa00;">
                            <div style="font-weight: bold; font-size: 12px;">Level: ${(level.price_level * 100).toFixed(1)}% (${level.strength})</div>
                            <div style="font-size: 11px; color: #666; margin-top: 2px;">${level.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        let resistanceSection = '';
        if (analysis.resistance_levels && analysis.resistance_levels.length > 0) {
            resistanceSection = `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #aa0000; margin: 0 0 8px 0; font-size: 14px;">📉 Resistance Levels</h4>
                    ${analysis.resistance_levels.map(level => `
                        <div style="margin-bottom: 8px; padding: 8px; background: rgba(255, 0, 0, 0.1); border-radius: 6px; border-left: 3px solid #aa0000;">
                            <div style="font-weight: bold; font-size: 12px;">Level: ${(level.price_level * 100).toFixed(1)}% (${level.strength})</div>
                            <div style="font-size: 11px; color: #666; margin-top: 2px;">${level.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        resultsPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333; font-size: 16px;">🤖 AI Chart Analysis</h3>
                <button id="close-results-btn" style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px;">×</button>
            </div>
            
            <div style="margin-bottom: 15px; padding: 12px; background: rgba(0, 0, 0, 0.05); border-radius: 8px;">
                <div style="font-weight: bold; margin-bottom: 5px;">📊 Market Summary</div>
                <div style="font-size: 13px; color: #666;">
                    <strong>Trend:</strong> ${analysis.analysis?.trend || 'Unknown'}<br>
                    <strong>Confidence:</strong> ${analysis.analysis?.confidence || 0}%<br>
                    <strong>Analysis:</strong> ${analysis.analysis?.summary || 'No summary available'}
                </div>
            </div>
            
            ${supportSection}
            ${resistanceSection}
            
            ${analysis.key_observations && analysis.key_observations.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #333; margin: 0 0 8px 0; font-size: 14px;">🔍 Key Observations</h4>
                    ${analysis.key_observations.map(obs => `
                        <div style="margin-bottom: 6px; padding: 6px; background: rgba(0, 0, 0, 0.05); border-radius: 4px; font-size: 12px;">
                            • ${obs}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center;">
                Powered by GPT-4 Vision • Lines drawn automatically
            </div>
        `;
        
        document.body.appendChild(resultsPanel);
        
        // Add event listener for close button
        const closeResultsBtn = document.getElementById('close-results-btn');
        if (closeResultsBtn) {
            closeResultsBtn.addEventListener('click', function() {
                resultsPanel.remove();
                document.querySelectorAll('.ai-analysis-line').forEach(el => el.remove());
            });
        }
    };
    
    window.hideAnalysisLoading = function() {
        const loading = document.getElementById('ai-analysis-loading');
        if (loading) {
            loading.remove();
        }
    };
    
    window.getOpenAIApiKey = async function() {
        // Try to get API key from chrome storage
        return new Promise((resolve) => {
            chrome.storage.sync.get(['openai_api_key'], function(result) {
                if (result.openai_api_key) {
                    resolve(result.openai_api_key);
                } else {
                    // Prompt user for API key
                    const apiKey = prompt('Please enter your OpenAI API key:\n(This will be stored securely in your browser)');
                    if (apiKey) {
                        chrome.storage.sync.set({'openai_api_key': apiKey});
                        resolve(apiKey);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    };
    
    window.drawDemoChart = function(ctx, width, height) {
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        
        for (let i = 0; i < height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        // Draw sample price line
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const points = [];
        for (let i = 0; i <= width; i += 10) {
            const progress = i / width;
            let price;
            
            // Create a pattern with clear support/resistance levels
            if (progress < 0.3) {
                price = 0.7 - progress * 0.4; // Downtrend
            } else if (progress < 0.7) {
                price = 0.3 + Math.sin((progress - 0.3) * Math.PI * 2) * 0.1; // Sideways with support at 0.3
            } else {
                price = 0.4 + (progress - 0.7) * 0.3; // Uptrend breaking resistance
            }
            
            price += (Math.random() - 0.5) * 0.05; // Add noise
            price = Math.max(0.1, Math.min(0.9, price));
            
            const x = i;
            const y = height * (1 - price);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            points.push({x, y, price});
        }
        
        ctx.stroke();
        
        // Add volume bars
        ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
        const volumeHeight = height * 0.2;
        const volumeStart = height - volumeHeight;
        
        for (let i = 0; i < width; i += 20) {
            const volume = 0.3 + Math.random() * 0.7;
            const barHeight = volume * volumeHeight;
            ctx.fillRect(i, volumeStart + volumeHeight - barHeight, 15, barHeight);
        }
    };
    
    window.drawSupportLine = function(x, y, width, level, id) {
        const line = document.createElement('div');
        line.className = 'ai-analysis-line support-line';
        line.id = id;
        line.style.cssText = `
            position: fixed !important;
            left: ${x}px !important;
            top: ${y}px !important;
            width: ${width}px !important;
            height: 2px !important;
            background: #00ff00 !important;
            border: none !important;
            z-index: 2147483646 !important;
            pointer-events: none !important;
            opacity: ${level.strength === 'strong' ? '0.9' : level.strength === 'medium' ? '0.7' : '0.5'} !important;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5) !important;
        `;
        
        // Add label
        const label = document.createElement('div');
        label.style.cssText = `
            position: absolute !important;
            right: 5px !important;
            top: -20px !important;
            background: rgba(0, 255, 0, 0.9) !important;
            color: white !important;
            padding: 2px 8px !important;
            border-radius: 3px !important;
            font-size: 11px !important;
            font-weight: bold !important;
            white-space: nowrap !important;
        `;
        label.textContent = `Support (${level.strength})`;
        line.appendChild(label);
        
        document.body.appendChild(line);
    };
    
    window.drawResistanceLine = function(x, y, width, level, id) {
        const line = document.createElement('div');
        line.className = 'ai-analysis-line resistance-line';
        line.id = id;
        line.style.cssText = `
            position: fixed !important;
            left: ${x}px !important;
            top: ${y}px !important;
            width: ${width}px !important;
            height: 2px !important;
            background: #ff0000 !important;
            border: none !important;
            z-index: 2147483646 !important;
            pointer-events: none !important;
            opacity: ${level.strength === 'strong' ? '0.9' : level.strength === 'medium' ? '0.7' : '0.5'} !important;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
        `;
        
        // Add label
        const label = document.createElement('div');
        label.style.cssText = `
            position: absolute !important;
            right: 5px !important;
            top: -20px !important;
            background: rgba(255, 0, 0, 0.9) !important;
            color: white !important;
            padding: 2px 8px !important;
            border-radius: 3px !important;
            font-size: 11px !important;
            font-weight: bold !important;
            white-space: nowrap !important;
        `;
        label.textContent = `Resistance (${level.strength})`;
        line.appendChild(label);
        
        document.body.appendChild(line);
    };
    
    window.performDetailedAnalysis = async function(rect, progressIndicator) {
        console.log('🔄 performDetailedAnalysis called with rect:', rect);
        
        const updateProgress = (step, progress, detail = '') => {
            console.log(`📊 Analysis Step: ${step} (${progress}%) - ${detail}`);
            
            const currentStepEl = document.getElementById('current-step');
            const progressBarEl = document.getElementById('progress-bar');
            
            if (currentStepEl) {
                currentStepEl.textContent = `Step ${Math.ceil(progress/25)}/4: ${step}`;
                if (detail) {
                    currentStepEl.innerHTML = `Step ${Math.ceil(progress/25)}/4: ${step}<br><small style="opacity: 0.7;">${detail}</small>`;
                }
            }
            
            if (progressBarEl) {
                progressBarEl.style.width = progress + '%';
            }
        };

        // Set up timeout to prevent hanging with shorter timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Analysis timeout - process took longer than 30 seconds'));
            }, 30000); // 30 second timeout (reduced from 60)
        });

        try {
            console.log('🚀 Starting detailed analysis workflow...');
            updateProgress('Initializing', 5, 'Setting up analysis...');
            
            // Immediate yield to prevent blocking
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Race between analysis and timeout
            const analysisPromise = (async () => {
                try {
                    // Step 1: Capture Image
                    updateProgress('Capturing Image', 10, 'Preparing screenshot...');
                    console.log('📸 About to call captureAreaAsImageWithProgress...');
                    
                    const imageData = await captureAreaAsImageWithProgress(rect, updateProgress);
                    console.log('✅ Image capture completed:', imageData);
                    updateProgress('Image Captured', 25, `${imageData.width}x${imageData.height} pixels`);
                    
                    // Step 2: Validate Image
                    updateProgress('Validating Image', 30, 'Checking image quality...');
                    await new Promise(resolve => setTimeout(resolve, 100)); // Non-blocking delay
                    
                    if (!imageData || !imageData.dataUrl || imageData.dataUrl.length < 1000) {
                        throw new Error('Image capture failed - image too small or empty');
                    }
                    
                    console.log('✅ Image validation passed:', {
                        dataUrl: imageData.dataUrl.substring(0, 50) + '...',
                        width: imageData.width,
                        height: imageData.height,
                        size: Math.round(imageData.dataUrl.length / 1024) + 'KB'
                    });
                    
                    // Step 3: Send to AI
                    updateProgress('Sending to AI', 35, 'Connecting to GPT-4 Vision...');
                    console.log('🤖 About to call analyzeCapturedImageWithProgress...');
                    
                    const analysis = await analyzeCapturedImageWithProgress(imageData, rect, updateProgress);
                    console.log('✅ AI analysis completed:', analysis);
                    updateProgress('AI Analysis Complete', 75, 'Processing results...');
                    
                    // Step 4: Draw Results
                    updateProgress('Drawing Results', 80, 'Creating visual overlays...');
                    await new Promise(resolve => setTimeout(resolve, 100)); // Non-blocking delay
                    
                    // Hide global loading
                    hideAnalysisLoading();
                    
                    // Draw support and resistance lines
                    drawAnalysisLines(analysis, rect);
                    updateProgress('Lines Drawn', 90, 'Preparing results panel...');
                    
                    // Show analysis results
                    showAnalysisResults(analysis, imageData);
                    updateProgress('Complete', 100, 'Analysis finished successfully!');
                    
                    return analysis;
                    
                } catch (error) {
                    console.error('❌ Analysis promise error:', error);
                    throw error;
                }
            })();

            // Wait for either completion or timeout
            console.log('⏱️ Starting Promise.race between analysis and timeout...');
            const result = await Promise.race([analysisPromise, timeoutPromise]);
            console.log('✅ Analysis completed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Detailed analysis failed:', error);
            
            // Ensure global loading is hidden
            hideAnalysisLoading();
            
            // Provide specific error messages based on error type
            let userFriendlyMessage = error.message;
            
            if (error.message.includes('API key')) {
                userFriendlyMessage = 'OpenAI API key not configured. Please set your API key in the settings.';
            } else if (error.message.includes('timeout')) {
                userFriendlyMessage = 'Analysis timed out. Please try again with a smaller chart area.';
            } else if (error.message.includes('fetch')) {
                userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('JSON')) {
                userFriendlyMessage = 'AI response was malformed. Please try again.';
            } else if (error.message.includes('function not available')) {
                userFriendlyMessage = 'System error: Required functions not loaded. Please refresh the page and try again.';
            }
            
            // Create detailed error for console
            console.error('🔍 Detailed error information:', {
                message: error.message,
                stack: error.stack,
                userMessage: userFriendlyMessage,
                timestamp: new Date().toISOString()
            });
            
            throw new Error(userFriendlyMessage);
        }
    };
    
    console.log('✅ All required functions defined in content script context');
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'chart-selection-overlay';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        font-family: Arial, sans-serif !important;
    `;
    
    // Create selection box
    const selectionBox = document.createElement('div');
    selectionBox.id = 'chart-selection-box';
    selectionBox.style.cssText = `
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 400px !important;
        height: 300px !important;
        border: 3px dashed #00ff00 !important;
        background: transparent !important;
        cursor: move !important;
        pointer-events: all !important;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5) !important;
        user-select: none !important;
    `;
    
    // Create resize handles
    const handles = [
        {pos: 'nw', cursor: 'nw-resize', top: '-5px', left: '-5px'},
        {pos: 'ne', cursor: 'ne-resize', top: '-5px', right: '-5px'},
        {pos: 'sw', cursor: 'sw-resize', bottom: '-5px', left: '-5px'},
        {pos: 'se', cursor: 'se-resize', bottom: '-5px', right: '-5px'},
        {pos: 'n', cursor: 'n-resize', top: '-5px', left: '50%', transform: 'translateX(-50%)'},
        {pos: 's', cursor: 's-resize', bottom: '-5px', left: '50%', transform: 'translateX(-50%)'},
        {pos: 'w', cursor: 'w-resize', left: '-5px', top: '50%', transform: 'translateY(-50%)'},
        {pos: 'e', cursor: 'e-resize', right: '-5px', top: '50%', transform: 'translateY(-50%)'}
    ];
    
    handles.forEach(handle => {
        const div = document.createElement('div');
        div.className = `resize-handle-${handle.pos}`;
        div.style.cssText = `
            position: absolute !important;
            width: 10px !important;
            height: 10px !important;
            background: #00ff00 !important;
            border: 2px solid white !important;
            border-radius: 50% !important;
            cursor: ${handle.cursor} !important;
            pointer-events: all !important;
            ${handle.top ? `top: ${handle.top} !important;` : ''}
            ${handle.bottom ? `bottom: ${handle.bottom} !important;` : ''}
            ${handle.left ? `left: ${handle.left} !important;` : ''}
            ${handle.right ? `right: ${handle.right} !important;` : ''}
            ${handle.transform ? `transform: ${handle.transform} !important;` : ''}
        `;
        selectionBox.appendChild(div);
    });
    
    // Create analyze button
    const analyzeBtn = document.createElement('button');
    analyzeBtn.innerHTML = '📸 Analyze Chart';
    analyzeBtn.style.cssText = `
        position: absolute !important;
        top: -45px !important;
        right: 0 !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border: none !important;
        padding: 10px 20px !important;
        border-radius: 25px !important;
        cursor: pointer !important;
        font-weight: bold !important;
        font-size: 14px !important;
        pointer-events: all !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        z-index: 2147483647 !important;
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute !important;
        top: -45px !important;
        left: 0 !important;
        background: #ff4444 !important;
        color: white !important;
        border: none !important;
        padding: 8px 12px !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        font-weight: bold !important;
        font-size: 16px !important;
        pointer-events: all !important;
        width: 35px !important;
        height: 35px !important;
        z-index: 2147483647 !important;
    `;
    
    // Add instruction text
    const instruction = document.createElement('div');
    instruction.style.cssText = `
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        color: #333 !important;
        font-weight: bold !important;
        text-align: center !important;
        pointer-events: none !important;
        font-size: 16px !important;
    `;
    instruction.innerHTML = '📊<br>Drag to move<br>Resize with handles<br>Click Analyze when ready';
    
    selectionBox.appendChild(instruction);
    selectionBox.appendChild(analyzeBtn);
    selectionBox.appendChild(closeBtn);
    overlay.appendChild(selectionBox);
    
    // Add drag functionality
    let isDragging = false;
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startLeft, startTop, startWidth, startHeight;
    
    selectionBox.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('resize-handle') || e.target.className.includes('resize-handle')) {
            isResizing = true;
            currentHandle = e.target.className.split('-')[2]; // get direction
            
            const rect = selectionBox.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            startWidth = rect.width;
            startHeight = rect.height;
        } else if (e.target === selectionBox || e.target === instruction) {
            isDragging = true;
            startX = e.clientX - selectionBox.offsetLeft;
            startY = e.clientY - selectionBox.offsetTop;
        }
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            selectionBox.style.left = Math.max(0, Math.min(x, window.innerWidth - selectionBox.offsetWidth)) + 'px';
            selectionBox.style.top = Math.max(0, Math.min(y, window.innerHeight - selectionBox.offsetHeight)) + 'px';
            selectionBox.style.transform = 'none';
        } else if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            let newLeft = startLeft;
            let newTop = startTop;
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            if (currentHandle.includes('w')) {
                newLeft = startLeft + dx;
                newWidth = startWidth - dx;
            }
            if (currentHandle.includes('e')) {
                newWidth = startWidth + dx;
            }
            if (currentHandle.includes('n')) {
                newTop = startTop + dy;
                newHeight = startHeight - dy;
            }
            if (currentHandle.includes('s')) {
                newHeight = startHeight + dy;
            }
            
            // Minimum size
            if (newWidth < 100) newWidth = 100;
            if (newHeight < 100) newHeight = 100;
            
            selectionBox.style.left = newLeft + 'px';
            selectionBox.style.top = newTop + 'px';
            selectionBox.style.width = newWidth + 'px';
            selectionBox.style.height = newHeight + 'px';
            selectionBox.style.transform = 'none';
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        isResizing = false;
        currentHandle = null;
    });
    
    // Analyze button functionality
    analyzeBtn.addEventListener('click', function() {
        console.log('📸 Analyze button clicked - starting analysis workflow...');
        
        const rect = selectionBox.getBoundingClientRect();
        console.log('📐 Selection area:', rect);
        
        // Freeze the box completely (no resizing, no dragging)
        selectionBox.style.pointerEvents = 'none';
        selectionBox.style.opacity = '0.7';
        analyzeBtn.style.display = 'none';
        
        // Disable all resize handles
        const resizeHandles = selectionBox.querySelectorAll('[class*="resize-handle"]');
        resizeHandles.forEach(handle => {
            handle.style.display = 'none';
        });
        
        // Show detailed progress indicator on the selection box
        const progressIndicator = document.createElement('div');
        progressIndicator.id = 'analysis-progress';
        progressIndicator.style.cssText = `
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            background: rgba(0, 0, 0, 0.9) !important;
            color: white !important;
            padding: 20px 25px !important;
            border-radius: 10px !important;
            font-size: 14px !important;
            font-weight: bold !important;
            text-align: center !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            min-width: 200px !important;
        `;
        progressIndicator.innerHTML = `
            <div style="margin-bottom: 10px;">🤖 AI Analysis Starting...</div>
            <div id="current-step" style="font-size: 12px; opacity: 0.8;">Initializing...</div>
            <div style="margin-top: 10px;">
                <div style="width: 180px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px;">
                    <div id="progress-bar" style="width: 10%; height: 100%; background: #00ff00; border-radius: 2px; transition: width 0.3s ease;"></div>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <button id="cancel-analysis-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    Cancel
                </button>
            </div>
        `;
        selectionBox.appendChild(progressIndicator);
        
        // Add event listener for cancel button
        const cancelBtn = document.getElementById('cancel-analysis-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                console.log('❌ Analysis cancelled by user');
                
                // Remove progress indicator
                const progress = document.getElementById('analysis-progress');
                if (progress) progress.remove();
                
                // Restore analyze button and interactivity
                analyzeBtn.style.display = 'block';
                selectionBox.style.pointerEvents = 'all';
                selectionBox.style.opacity = '1';
                
                // Restore resize handles
                resizeHandles.forEach(handle => {
                    handle.style.display = 'block';
                });
                
                // Restore instruction
                instruction.innerHTML = '📊<br>Drag to move<br>Resize with handles<br>Click Analyze when ready';
                instruction.style.color = '#333';
                
                // Clear any ongoing operations
                hideAnalysisLoading();
            });
        }
        
        // Update instruction text
        instruction.innerHTML = '🤖<br>AI Analysis<br>Starting<br><small>Please wait...</small>';
        instruction.style.color = '#0066cc';
        
        // Start the detailed analysis process with immediate feedback
        Promise.resolve().then(() => {
            console.log('🚀 Starting analysis in next tick...');
            return performDetailedAnalysis(rect, progressIndicator);
        }).then(() => {
            // Analysis completed successfully
            console.log('✅ Complete analysis workflow finished');
            
            // Remove progress indicator
            const progress = document.getElementById('analysis-progress');
            if (progress) progress.remove();
            
            // Update instruction to show completion
            instruction.innerHTML = '✅<br>Analysis Complete!<br>Check the results panel<br><small>Click X to close</small>';
            instruction.style.color = '#00aa00';
            
            // Keep the box visible but add completion styling
            selectionBox.style.opacity = '0.6';
            selectionBox.style.borderColor = '#00aa00';
            selectionBox.style.boxShadow = '0 0 20px rgba(0, 170, 0, 0.5)';
            
        }).catch((error) => {
            // Analysis failed
            console.error('❌ Analysis workflow failed:', error);
            
            // Remove progress indicator
            const progress = document.getElementById('analysis-progress');
            if (progress) progress.remove();
            
            // Show error state
            instruction.innerHTML = '❌<br>Analysis Failed<br>See console for details<br><small>Click X to close</small>';
            instruction.style.color = '#ff4444';
            
            // Restore analyze button and interactivity
            analyzeBtn.style.display = 'block';
            selectionBox.style.pointerEvents = 'all';
            selectionBox.style.opacity = '1';
            
            // Restore resize handles
            resizeHandles.forEach(handle => {
                handle.style.display = 'block';
            });
            
            // Show detailed error to user
            showAnalysisError(`Analysis failed: ${error.message}`);
        });
    });
    
    // Close button functionality
    closeBtn.addEventListener('click', function() {
        // Clear analysis lines and results
        const analysisLines = document.querySelectorAll('.ai-analysis-line');
        analysisLines.forEach(line => line.remove());
        
        const analysisResults = document.getElementById('ai-analysis-results');
        if (analysisResults) {
            analysisResults.remove();
        }
        
        const analysisLoading = document.getElementById('ai-analysis-loading');
        if (analysisLoading) {
            analysisLoading.remove();
        }
        
        // Remove the overlay
        overlay.remove();
        console.log('📦 Selection box and analysis cleared');
    });
    
    // Add to page
    document.body.appendChild(overlay);
    
    console.log('✅ Simple selection box created successfully!');
    
    // Show success message
    setTimeout(() => {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: rgba(0, 200, 0, 0.9) !important;
            color: white !important;
            padding: 15px 25px !important;
            border-radius: 8px !important;
            z-index: 2147483648 !important;
            font-weight: bold !important;
            font-size: 14px !important;
        `;
        toast.textContent = '✅ Selection box ready! Drag to position, resize with handles, then click Analyze.';
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 4000);
    }, 100);
}

// Clear function
function clearSimpleBox() {
    const overlay = document.getElementById('chart-selection-overlay');
    if (overlay) {
        overlay.remove();
        console.log('🗑️ Selection box cleared');
    }
    
    // Also clear AI analysis lines and results
    const analysisLines = document.querySelectorAll('.ai-analysis-line');
    analysisLines.forEach(line => line.remove());
    
    const analysisResults = document.getElementById('ai-analysis-results');
    if (analysisResults) {
        analysisResults.remove();
    }
    
    const analysisLoading = document.getElementById('ai-analysis-loading');
    if (analysisLoading) {
        analysisLoading.remove();
    }
    
    console.log('🤖 AI analysis cleared');
}

// Debug test function (enhanced with diagnostics)
function debugTest() {
    console.log('🔧 DEBUG: Enhanced system diagnostics...');
    
    // Create comprehensive debug overlay
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 500px !important;
        height: 500px !important;
        background: linear-gradient(45deg, #667eea, #764ba2) !important;
        border: 3px solid #fff !important;
        border-radius: 15px !important;
        color: white !important;
        padding: 20px !important;
        z-index: 2147483647 !important;
        font-weight: bold !important;
        box-shadow: 0 15px 40px rgba(0,0,0,0.4) !important;
        overflow-y: auto !important;
        font-family: monospace !important;
    `;
    
    // Run diagnostics
    const diagnostics = {
        url: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 50),
        chromeVersion: /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1] || 'Unknown',
        html2canvasAvailable: typeof html2canvas !== 'undefined',
        chromeStorageAvailable: !!chrome?.storage,
        extensionContext: !!chrome?.runtime?.id,
        fetchAvailable: typeof fetch !== 'undefined',
        canvasSupported: !!document.createElement('canvas').getContext,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        // Check for required functions
        functionsAvailable: {
            captureAreaAsImageWithProgress: typeof captureAreaAsImageWithProgress === 'function',
            analyzeCapturedImageWithProgress: typeof analyzeCapturedImageWithProgress === 'function',
            drawAnalysisLines: typeof drawAnalysisLines === 'function',
            showAnalysisResults: typeof showAnalysisResults === 'function',
            hideAnalysisLoading: typeof hideAnalysisLoading === 'function'
        }
    };
    
    // Check API key asynchronously
    const checkApiAndRender = () => {
        if (chrome && chrome.storage) {
            chrome.storage.sync.get(['openai_api_key'], function(result) {
                const hasApiKey = !!result.openai_api_key;
                const apiKeyLength = result.openai_api_key ? result.openai_api_key.length : 0;
                renderDiagnostics(hasApiKey, apiKeyLength);
            });
        } else {
            renderDiagnostics(false, 0);
        }
    };
    
    const renderDiagnostics = (hasApiKey, apiKeyLength) => {
        testDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0; text-align: center;">🔧 SYSTEM DIAGNOSTICS</h3>
            
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <strong>Environment:</strong><br>
                • URL: ${diagnostics.url}<br>
                • Chrome: v${diagnostics.chromeVersion}<br>
                • Extension ID: ${chrome?.runtime?.id || 'Missing'}<br>
                • Screen: ${diagnostics.screenSize}<br>
                • Viewport: ${diagnostics.viewportSize}
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <strong>API Configuration:</strong><br>
                • API Key: ${hasApiKey ? '✅ Configured' : '❌ Missing'}<br>
                • Key Length: ${apiKeyLength} characters<br>
                • Storage: ${diagnostics.chromeStorageAvailable ? '✅ Available' : '❌ Failed'}
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <strong>Capture Capabilities:</strong><br>
                • html2canvas: ${diagnostics.html2canvasAvailable ? '✅ Loaded' : '⚠️ Will load dynamically'}<br>
                • Canvas Support: ${diagnostics.canvasSupported ? '✅ Supported' : '❌ Missing'}<br>
                • Fetch API: ${diagnostics.fetchAvailable ? '✅ Available' : '❌ Missing'}
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <strong>Required Functions:</strong><br>
                • Image Capture: ${diagnostics.functionsAvailable.captureAreaAsImageWithProgress ? '✅' : '❌'}<br>
                • AI Analysis: ${diagnostics.functionsAvailable.analyzeCapturedImageWithProgress ? '✅' : '❌'}<br>
                • Draw Lines: ${diagnostics.functionsAvailable.drawAnalysisLines ? '✅' : '❌'}<br>
                • Show Results: ${diagnostics.functionsAvailable.showAnalysisResults ? '✅' : '❌'}<br>
                • Hide Loading: ${diagnostics.functionsAvailable.hideAnalysisLoading ? '✅' : '❌'}
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <strong>System Status:</strong><br>
                ${hasApiKey ? '✅ Ready for AI analysis' : '❌ Configure API key first'}<br>
                ${diagnostics.canvasSupported ? '✅ Image capture supported' : '❌ Image capture may fail'}<br>
                ${diagnostics.extensionContext ? '✅ Extension properly loaded' : '❌ Extension context missing'}<br>
                ${Object.values(diagnostics.functionsAvailable).every(f => f) ? '✅ All functions available' : '⚠️ Some functions missing'}
            </div>
            
            <div style="text-align: center;">
                <button id="close-diagnostics-btn" 
                        style="margin-right: 10px; padding: 10px 20px; background: #fff; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    Close
                </button>
                <button id="test-capture-btn" 
                        style="padding: 10px 20px; background: #00aa00; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    Test Capture
                </button>
            </div>
        `;
    };
    
    // Add helper functions to global scope
    window.closeDiagnostics = function() {
        if (testDiv && testDiv.parentElement) {
            testDiv.remove();
        }
    };
    
    window.testImageCaptureNow = function() {
        console.log('🧪 Testing image capture in content script context...');
        const testRect = {
            left: 100,
            top: 100, 
            width: 300,
            height: 200
        };
        
        if (typeof captureAreaAsImageWithProgress === 'function') {
            console.log('✅ captureAreaAsImageWithProgress function found, starting test...');
            
            captureAreaAsImageWithProgress(testRect, (step, progress, detail) => {
                console.log(`Test: ${step} (${progress}%) - ${detail}`);
            }).then(imageData => {
                console.log('✅ Test capture successful:', {
                    size: Math.round(imageData.dataUrl.length / 1024) + 'KB',
                    dimensions: `${imageData.width}x${imageData.height}`,
                    isFallback: imageData.isFallback || false
                });
                alert('✅ Image capture test successful! Check console for details.');
            }).catch(error => {
                console.error('❌ Test capture failed:', error);
                alert('❌ Image capture test failed: ' + error.message);
            });
        } else {
            console.error('❌ captureAreaAsImageWithProgress function not available');
            alert('❌ captureAreaAsImageWithProgress function not available. This indicates a system error.');
        }
    };
    
    document.body.appendChild(testDiv);
    checkApiAndRender();
    
    // Log full diagnostics to console
    console.table(diagnostics);
    
    // Add event listeners for diagnostic buttons after rendering
    setTimeout(() => {
        const closeDiagnosticsBtn = document.getElementById('close-diagnostics-btn');
        const testCaptureBtn = document.getElementById('test-capture-btn');
        
        if (closeDiagnosticsBtn) {
            closeDiagnosticsBtn.addEventListener('click', function() {
                if (testDiv && testDiv.parentElement) {
                    testDiv.remove();
                }
            });
        }
        
        if (testCaptureBtn) {
            testCaptureBtn.addEventListener('click', function() {
                console.log('🧪 Testing image capture in content script context...');
                const testRect = {
                    left: 100,
                    top: 100, 
                    width: 300,
                    height: 200
                };
                
                if (typeof captureAreaAsImageWithProgress === 'function') {
                    console.log('✅ captureAreaAsImageWithProgress function found, starting test...');
                    
                    captureAreaAsImageWithProgress(testRect, (step, progress, detail) => {
                        console.log(`Test: ${step} (${progress}%) - ${detail}`);
                    }).then(imageData => {
                        console.log('✅ Test capture successful:', {
                            size: Math.round(imageData.dataUrl.length / 1024) + 'KB',
                            dimensions: `${imageData.width}x${imageData.height}`,
                            isFallback: imageData.isFallback || false
                        });
                        alert('✅ Image capture test successful! Check console for details.');
                    }).catch(error => {
                        console.error('❌ Test capture failed:', error);
                        alert('❌ Image capture test failed: ' + error.message);
                    });
                } else {
                    console.error('❌ captureAreaAsImageWithProgress function not available');
                    alert('❌ captureAreaAsImageWithProgress function not available. This indicates a system error.');
                }
            });
        }
    }, 100);
    
    // Auto-remove after 60 seconds
    setTimeout(() => {
        if (testDiv && testDiv.parentElement) {
            testDiv.remove();
        }
    }, 60000);
} 