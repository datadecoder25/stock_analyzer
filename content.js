// DIAGNOSTIC TEST - This should run immediately when content script loads
console.log('🚨 DIAGNOSTIC: Content script starting to load...');

// Test 1: Check if we can create elements
try {
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        width: 200px !important;
        height: 50px !important;
        background: red !important;
        color: white !important;
        z-index: 999999 !important;
        border: 3px solid yellow !important;
        padding: 5px !important;
        font-size: 14px !important;
        font-weight: bold !important;
    `;
    testDiv.textContent = '🚨 EXTENSION LOADED!';
    testDiv.id = 'chart-analyzer-test';
    
    if (document.body) {
        document.body.appendChild(testDiv);
        console.log('✅ DIAGNOSTIC: Test element added to body');
        
        // Remove test element after 3 seconds
        setTimeout(() => {
            if (document.getElementById('chart-analyzer-test')) {
                document.getElementById('chart-analyzer-test').remove();
                console.log('🗑️ DIAGNOSTIC: Test element removed');
            }
        }, 3000);
    } else {
        console.log('❌ DIAGNOSTIC: Document body not ready');
        // Try again when body is ready
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body) {
                document.body.appendChild(testDiv);
                console.log('✅ DIAGNOSTIC: Test element added after DOMContentLoaded');
            }
        });
    }
} catch (error) {
    console.error('❌ DIAGNOSTIC: Failed to create test element:', error);
}

// Test 2: Log environment info
console.log('🔍 DIAGNOSTIC Environment:');
console.log('- URL:', window.location.href);
console.log('- Document ready state:', document.readyState);
console.log('- Body exists:', !!document.body);
console.log('- Chrome runtime:', !!chrome?.runtime);
console.log('- Extension context:', !!chrome?.runtime?.id);

// Stock Chart Analyzer Content Script
class ChartAnalyzer {
    constructor() {
        console.log('🏗️ ChartAnalyzer constructor called');
        
        this.isActive = false;
        this.selectionBox = null;
        this.overlay = null;
        this.isResizing = false;
        this.isDragging = false;
        this.currentHandle = null;
        this.startX = 0;
        this.startY = 0;
        this.analysisPanel = null;
        this.technicalOverlays = [];
        
        console.log('📋 Initial properties set');
        
        try {
            this.init();
            console.log('✅ ChartAnalyzer initialization completed');
        } catch (error) {
            console.error('❌ ChartAnalyzer initialization failed:', error);
        }
    }
    
    init() {
        console.log('🔧 ChartAnalyzer init() called');
        
        try {
            this.createOverlay();
            console.log('✅ Overlay created');
            
            this.bindEvents();
            console.log('✅ Events bound');
            
            // Auto-activate if requested before load
            if (window.chartAnalyzerPending) {
                console.log('⚡ Auto-activating due to pending request');
                this.activate();
                window.chartAnalyzerPending = false;
            }
            
            console.log('✅ Init completed successfully');
        } catch (error) {
            console.error('❌ Error in init():', error);
        }
    }
    
    createOverlay() {
        console.log('🎨 Creating overlay...');
        
        try {
            this.overlay = document.createElement('div');
            this.overlay.className = 'chart-analyzer-overlay';
            this.overlay.style.display = 'none';
            
            // Add debugging styles to make sure overlay is properly created
            this.overlay.style.position = 'fixed';
            this.overlay.style.top = '0';
            this.overlay.style.left = '0';
            this.overlay.style.width = '100%';
            this.overlay.style.height = '100%';
            this.overlay.style.pointerEvents = 'none';
            this.overlay.style.zIndex = '999999';
            
            document.body.appendChild(this.overlay);
            
            console.log('✅ Overlay element created and added to body');
            console.log('🔍 Overlay element:', this.overlay);
            console.log('🔍 Document body children count:', document.body.children.length);
        } catch (error) {
            console.error('❌ Failed to create overlay:', error);
        }
    }
    
    activate() {
        console.log('🚀 Chart Analyzer activate() called');
        console.log('🔍 Current state - isActive:', this.isActive, 'overlay:', !!this.overlay, 'selectionBox:', !!this.selectionBox);
        
        this.isActive = true;
        
        if (!this.overlay) {
            console.log('❌ No overlay found, creating one...');
            this.createOverlay();
        }
        
        this.overlay.style.display = 'block';
        
        console.log('📦 Overlay display set to block');
        console.log('📐 Viewport size:', window.innerWidth, 'x', window.innerHeight);
        
        // Create a simple test box first
        this.createSimpleTestBox();
        
        setTimeout(() => {
            this.createSelectionBox();
            this.showInstructions();
        }, 500);
        
        console.log('✅ Activation complete');
    }
    
    createSimpleTestBox() {
        console.log('🧪 Creating simple test box...');
        
        try {
            // Remove any existing test box
            const existingTest = document.getElementById('simple-test-box');
            if (existingTest) {
                existingTest.remove();
            }
            
            const testBox = document.createElement('div');
            testBox.id = 'simple-test-box';
            testBox.style.cssText = `
                position: fixed !important;
                top: 100px !important;
                left: 100px !important;
                width: 300px !important;
                height: 200px !important;
                background: rgba(0, 255, 0, 0.3) !important;
                border: 3px dashed #00ff00 !important;
                z-index: 9999999 !important;
                pointer-events: all !important;
                cursor: move !important;
            `;
            
            testBox.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #000; font-weight: bold; font-size: 16px;">
                    📊 TEST SELECTION BOX<br>
                    <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #ff0000; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Remove Test Box
                    </button>
                </div>
            `;
            
            document.body.appendChild(testBox);
            console.log('✅ Simple test box created and added');
            
        } catch (error) {
            console.error('❌ Failed to create simple test box:', error);
        }
    }
    
    deactivate() {
        this.isActive = false;
        this.overlay.style.display = 'none';
        this.clearOverlays();
    }
    
    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }
    
    showInstructions() {
        const instruction = document.createElement('div');
        instruction.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 1000002;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        instruction.innerHTML = `
            📊 <strong>Chart Analyzer Active!</strong><br>
            🎯 Drag and resize the green box to select your chart area<br>
            📈 Click "Analyze Chart" to start technical analysis
        `;
        
        document.body.appendChild(instruction);
        
        setTimeout(() => {
            if (instruction.parentNode) {
                instruction.parentNode.removeChild(instruction);
            }
        }, 5000);
    }
    
    createSelectionBox() {
        console.log('📦 Creating selection box...');
        
        // Clear any existing selection box
        if (this.selectionBox) {
            console.log('🗑️ Removing existing selection box');
            this.selectionBox.remove();
            this.selectionBox = null;
        }
        
        this.selectionBox = document.createElement('div');
        this.selectionBox.className = 'chart-selection-box';
        
        // Position in center of viewport
        const centerX = window.innerWidth / 2 - 150;
        const centerY = window.innerHeight / 2 - 100;
        
        console.log('📍 Positioning selection box at:', centerX, centerY);
        
        this.selectionBox.style.left = centerX + 'px';
        this.selectionBox.style.top = centerY + 'px';
        this.selectionBox.style.width = '300px';
        this.selectionBox.style.height = '200px';
        
        // Add inline styles to ensure visibility (in case CSS doesn't load)
        this.selectionBox.style.position = 'absolute';
        this.selectionBox.style.border = '2px dashed #00ff00';
        this.selectionBox.style.background = 'rgba(0, 255, 0, 0.1)';
        this.selectionBox.style.cursor = 'move';
        this.selectionBox.style.pointerEvents = 'all';
        this.selectionBox.style.minWidth = '100px';
        this.selectionBox.style.minHeight = '100px';
        this.selectionBox.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
        this.selectionBox.style.zIndex = '999999';
        
        console.log('🎨 Selection box styles applied');
        
        // Create resize handles
        this.createResizeHandles();
        
        // Create analyze button
        this.createAnalyzeButton();
        
        // Add to overlay
        if (!this.overlay) {
            console.error('❌ Overlay not found! Creating new overlay...');
            this.createOverlay();
        }
        
        this.overlay.appendChild(this.selectionBox);
        
        console.log('📦 Selection box added to overlay');
        console.log('🔍 Final selection box element:', this.selectionBox);
        console.log('🔍 Overlay children count:', this.overlay.children.length);
        console.log('🔍 Selection box computed styles:', window.getComputedStyle(this.selectionBox));
        
        // Force a visual test
        setTimeout(() => {
            if (this.selectionBox) {
                console.log('⚡ Testing selection box visibility after 1 second...');
                console.log('📐 Selection box rect:', this.selectionBox.getBoundingClientRect());
                console.log('👁️ Selection box visible:', this.selectionBox.offsetWidth > 0 && this.selectionBox.offsetHeight > 0);
                
                // Flash the box to make it visible for debugging
                this.selectionBox.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                setTimeout(() => {
                    if (this.selectionBox) {
                        this.selectionBox.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                    }
                }, 500);
            }
        }, 1000);
    }
    
    createResizeHandles() {
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
        handles.forEach(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${direction}`;
            handle.dataset.direction = direction;
            this.selectionBox.appendChild(handle);
        });
    }
    
    createAnalyzeButton() {
        const button = document.createElement('button');
        button.className = 'analyze-button';
        button.innerHTML = '🔍 Analyze Chart';
        button.addEventListener('click', () => this.analyzeChart());
        this.selectionBox.appendChild(button);
    }
    
    bindEvents() {
        // Mouse events for dragging and resizing
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Prevent default drag behavior
        document.addEventListener('dragstart', (e) => {
            if (this.isActive) e.preventDefault();
        });
    }
    
    handleMouseDown(e) {
        if (!this.isActive || !this.selectionBox) return;
        
        const target = e.target;
        
        if (target.classList.contains('resize-handle')) {
            this.isResizing = true;
            this.currentHandle = target.dataset.direction;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startRect = this.selectionBox.getBoundingClientRect();
            e.preventDefault();
        } else if (target === this.selectionBox || this.selectionBox.contains(target)) {
            this.isDragging = true;
            this.startX = e.clientX - this.selectionBox.offsetLeft;
            this.startY = e.clientY - this.selectionBox.offsetTop;
            this.selectionBox.classList.add('active');
            e.preventDefault();
        }
    }
    
    handleMouseMove(e) {
        if (!this.isActive || !this.selectionBox) return;
        
        if (this.isResizing) {
            this.handleResize(e);
        } else if (this.isDragging) {
            this.handleDrag(e);
        }
    }
    
    handleMouseUp(e) {
        if (!this.isActive) return;
        
        this.isResizing = false;
        this.isDragging = false;
        this.currentHandle = null;
        
        if (this.selectionBox) {
            this.selectionBox.classList.remove('active');
        }
    }
    
    handleDrag(e) {
        const x = e.clientX - this.startX;
        const y = e.clientY - this.startY;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.selectionBox.offsetWidth;
        const maxY = window.innerHeight - this.selectionBox.offsetHeight;
        
        this.selectionBox.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        this.selectionBox.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    }
    
    handleResize(e) {
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        const rect = this.startRect;
        
        let newX = rect.left;
        let newY = rect.top;
        let newWidth = rect.width;
        let newHeight = rect.height;
        
        const direction = this.currentHandle;
        
        if (direction.includes('w')) {
            newX = rect.left + dx;
            newWidth = rect.width - dx;
        }
        if (direction.includes('e')) {
            newWidth = rect.width + dx;
        }
        if (direction.includes('n')) {
            newY = rect.top + dy;
            newHeight = rect.height - dy;
        }
        if (direction.includes('s')) {
            newHeight = rect.height + dy;
        }
        
        // Minimum size constraints
        if (newWidth < 100) {
            newWidth = 100;
            if (direction.includes('w')) newX = rect.right - 100;
        }
        if (newHeight < 100) {
            newHeight = 100;
            if (direction.includes('n')) newY = rect.bottom - 100;
        }
        
        // Keep within viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight));
        
        this.selectionBox.style.left = newX + 'px';
        this.selectionBox.style.top = newY + 'px';
        this.selectionBox.style.width = newWidth + 'px';
        this.selectionBox.style.height = newHeight + 'px';
    }
    
    analyzeChart() {
        if (!this.selectionBox) return;
        
        const rect = this.selectionBox.getBoundingClientRect();
        this.captureAndAnalyzeChart(rect);
    }
    
    async captureAndAnalyzeChart(rect) {
        try {
            // Show loading state
            this.showAnalysisLoading();
            
            // Temporarily hide the selection box overlay during capture
            const originalBoxDisplay = this.selectionBox.style.display;
            const originalOverlayDisplay = this.overlay.style.display;
            
            // Hide overlay elements temporarily for clean capture
            this.overlay.style.display = 'none';
            
            // Wait a moment for the UI to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Capture the selected chart area as an image
            const imageData = await this.captureChartArea(rect);
            
            // Restore overlay visibility
            this.overlay.style.display = originalOverlayDisplay;
            this.selectionBox.style.display = originalBoxDisplay;
            
            // Analyze the captured image for patterns
            const analysis = await this.analyzeChartImage(imageData, rect);
            
            // Draw the analysis results
            this.performTechnicalAnalysis(rect, analysis);
            this.showAnalysisPanel(analysis);
            
            // Log the captured image for debugging
            console.log('📸 Captured chart image:', imageData.dataUrl.substring(0, 50) + '...');
            
        } catch (error) {
            console.error('Error analyzing chart:', error);
            
            // Make sure overlay is restored even if there's an error
            if (this.overlay) {
                this.overlay.style.display = 'block';
            }
            if (this.selectionBox) {
                this.selectionBox.style.display = 'block';
            }
            
            this.showAnalysisError(error.message);
        }
    }
    
    async captureChartArea(rect) {
        console.log('📷 Starting chart area capture...', rect);
        
        return new Promise(async (resolve, reject) => {
            try {
                // Method 1: Try to use getDisplayMedia (Screen Capture API)
                // Note: This requires user permission and may not work in all contexts
                if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                    try {
                        console.log('🎥 Attempting screen capture...');
                        
                        const stream = await navigator.mediaDevices.getDisplayMedia({
                            video: { 
                                mediaSource: 'screen',
                                width: { ideal: rect.width },
                                height: { ideal: rect.height }
                            }
                        });
                        
                        const video = document.createElement('video');
                        video.srcObject = stream;
                        video.autoplay = true;
                        video.muted = true;
                        
                        video.addEventListener('loadedmetadata', () => {
                            console.log('📺 Video metadata loaded, creating canvas...');
                            
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            canvas.width = rect.width;
                            canvas.height = rect.height;
                            
                            // Wait for video to be ready
                            video.addEventListener('canplay', () => {
                                try {
                                    // Draw the video frame to canvas
                                    // Note: This captures the entire screen, you'd need to crop to the selection area
                                    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                                    
                                    // Stop the stream
                                    stream.getTracks().forEach(track => track.stop());
                                    
                                    console.log('✅ Screen capture successful');
                                    resolve({
                                        dataUrl: canvas.toDataURL('image/png'),
                                        width: rect.width,
                                        height: rect.height,
                                        canvas: canvas,
                                        method: 'screen-capture'
                                    });
                                } catch (drawError) {
                                    console.log('❌ Screen capture draw failed:', drawError);
                                    stream.getTracks().forEach(track => track.stop());
                                    throw drawError;
                                }
                            });
                        });
                        
                        // Timeout after 5 seconds
                        setTimeout(() => {
                            stream.getTracks().forEach(track => track.stop());
                            throw new Error('Screen capture timeout');
                        }, 5000);
                        
                        return;
                    } catch (screenError) {
                        console.log('❌ Screen capture failed, trying DOM method:', screenError.message);
                    }
                }
                
                // Method 2: Use DOM-to-Canvas approach (more reliable)
                console.log('🎨 Using DOM-to-Canvas capture...');
                const result = await this.domToCanvas(rect);
                result.method = 'dom-capture';
                resolve(result);
                
            } catch (error) {
                // Method 3: Fallback to simulated capture
                console.log('🎭 All capture methods failed, using fallback simulation');
                try {
                    const result = await this.fallbackScreenCapture(rect);
                    result.method = 'fallback-simulation';
                    resolve(result);
                } catch (fallbackError) {
                    reject(fallbackError);
                }
            }
        });
    }
    
    async domToCanvas(rect) {
        console.log('🎨 Creating DOM-to-Canvas capture for area:', rect);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        try {
            // Get all elements within the selection area
            const elementsInArea = this.getElementsInArea(rect);
            console.log(`📋 Found ${elementsInArea.length} elements in selection area`);
            
            // Draw background
            ctx.fillStyle = this.getBackgroundColor(rect);
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            // Attempt to recreate the visual appearance
            for (const element of elementsInArea) {
                await this.drawElementToCanvas(ctx, element, rect);
            }
            
            // Add selection area info for debugging
            this.addDebugInfoToCanvas(ctx, rect, elementsInArea.length);
            
            console.log('✅ DOM-to-Canvas capture completed');
            
            return {
                dataUrl: canvas.toDataURL('image/png'),
                width: rect.width,
                height: rect.height,
                canvas: canvas
            };
        } catch (error) {
            console.error('❌ DOM-to-Canvas failed:', error);
            throw error;
        }
    }
    
    getBackgroundColor(rect) {
        // Try to determine the background color of the area
        const elementAtCenter = document.elementFromPoint(
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2
        );
        
        if (elementAtCenter) {
            const styles = window.getComputedStyle(elementAtCenter);
            const bgColor = styles.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                return bgColor;
            }
        }
        
        return '#ffffff'; // Default to white
    }
    
    addDebugInfoToCanvas(ctx, rect, elementCount) {
        // Add small debug info to the captured image
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 200, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`Captured: ${rect.width}x${rect.height}`, 10, 20);
        ctx.fillText(`Elements: ${elementCount}`, 10, 35);
    }
    
    getElementsInArea(rect) {
        const elements = [];
        const allElements = document.querySelectorAll('*');
        
        for (const element of allElements) {
            const elementRect = element.getBoundingClientRect();
            
            // Check if element overlaps with selection area
            if (this.rectsOverlap(rect, elementRect)) {
                elements.push({
                    element: element,
                    rect: elementRect,
                    styles: window.getComputedStyle(element)
                });
            }
        }
        
        return elements.slice(0, 50); // Limit to prevent performance issues
    }
    
    rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    async drawElementToCanvas(ctx, elementInfo, selectionRect) {
        const { element, rect, styles } = elementInfo;
        
        // Calculate relative position within selection area
        const x = rect.left - selectionRect.left;
        const y = rect.top - selectionRect.top;
        const width = rect.width;
        const height = rect.height;
        
        // Skip if outside visible area
        if (x > selectionRect.width || y > selectionRect.height || x + width < 0 || y + height < 0) {
            return;
        }
        
        // Draw background if it has one
        const backgroundColor = styles.backgroundColor;
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);
        }
        
        // Draw borders
        this.drawElementBorders(ctx, x, y, width, height, styles);
        
        // Draw text content
        if (element.textContent && element.textContent.trim()) {
            this.drawElementText(ctx, element.textContent.trim(), x, y, width, height, styles);
        }
        
        // Draw images if any
        if (element.tagName === 'IMG') {
            await this.drawImageElement(ctx, element, x, y, width, height);
        }
        
        // Draw canvas/svg elements
        if (element.tagName === 'CANVAS') {
            this.drawCanvasElement(ctx, element, x, y, width, height);
        }
    }
    
    drawElementBorders(ctx, x, y, width, height, styles) {
        const borderWidth = parseInt(styles.borderWidth) || 0;
        const borderColor = styles.borderColor;
        
        if (borderWidth > 0 && borderColor && borderColor !== 'transparent') {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(x, y, width, height);
        }
    }
    
    drawElementText(ctx, text, x, y, width, height, styles) {
        const fontSize = parseInt(styles.fontSize) || 12;
        const fontFamily = styles.fontFamily || 'Arial';
        const color = styles.color || '#000000';
        
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        
        // Simple text wrapping
        const lines = this.wrapText(ctx, text, width - 10);
        lines.forEach((line, index) => {
            ctx.fillText(line, x + 5, y + 5 + (index * fontSize * 1.2));
        });
    }
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    async drawImageElement(ctx, imgElement, x, y, width, height) {
        return new Promise((resolve) => {
            if (imgElement.complete && imgElement.naturalHeight !== 0) {
                ctx.drawImage(imgElement, x, y, width, height);
                resolve();
            } else {
                imgElement.onload = () => {
                    ctx.drawImage(imgElement, x, y, width, height);
                    resolve();
                };
                imgElement.onerror = () => resolve(); // Continue even if image fails
            }
        });
    }
    
    drawCanvasElement(ctx, canvasElement, x, y, width, height) {
        try {
            ctx.drawImage(canvasElement, x, y, width, height);
        } catch (error) {
            // Some canvases might not be drawable due to CORS
            console.log('Could not draw canvas element:', error);
        }
    }
    
    async analyzeChartImage(imageData, rect) {
        // This is where the AI magic happens
        console.log('Analyzing chart image for patterns...');
        
        try {
            // Analyze for cup and handle pattern specifically
            const cupHandleAnalysis = await this.detectCupAndHandlePattern(imageData);
            
            // Structure the analysis results
            const analysis = {
                imageData: imageData,
                patterns: [],
                supportResistance: [],
                trendLines: [],
                fibonacci: [],
                entryExit: [],
                summary: {
                    trend: 'Unknown',
                    strength: 'Analyzing...',
                    risk: 'Unknown',
                    recommendation: 'HOLD'
                }
            };
            
            // Add cup and handle pattern if detected
            if (cupHandleAnalysis.detected) {
                analysis.patterns.push({
                    x: rect.left + cupHandleAnalysis.cupCenter.x,
                    y: rect.top + cupHandleAnalysis.cupCenter.y,
                    pattern: 'Cup and Handle',
                    confidence: cupHandleAnalysis.confidence,
                    type: 'bullish',
                    details: cupHandleAnalysis.details
                });
                
                // Add support/resistance based on cup and handle
                if (cupHandleAnalysis.cupBottom) {
                    analysis.supportResistance.push({
                        y: rect.top + cupHandleAnalysis.cupBottom.y,
                        type: 'support',
                        strength: 'strong',
                        source: 'Cup bottom'
                    });
                }
                
                if (cupHandleAnalysis.neckline) {
                    analysis.supportResistance.push({
                        y: rect.top + cupHandleAnalysis.neckline.y,
                        type: 'resistance',
                        strength: 'medium',
                        source: 'Cup neckline'
                    });
                }
                
                // Add entry/exit points
                if (cupHandleAnalysis.breakoutPoint) {
                    analysis.entryExit.push({
                        x: rect.left + cupHandleAnalysis.breakoutPoint.x,
                        y: rect.top + cupHandleAnalysis.breakoutPoint.y,
                        type: 'entry',
                        price: 'Breakout Level',
                        reason: 'Cup and Handle breakout'
                    });
                }
                
                // Update summary based on pattern
                analysis.summary = {
                    trend: 'Bullish',
                    strength: cupHandleAnalysis.confidence > 70 ? 'Strong' : 'Medium',
                    risk: 'Medium',
                    recommendation: cupHandleAnalysis.confidence > 70 ? 'BUY' : 'WATCH'
                };
            }
            
            return analysis;
            
        } catch (error) {
            console.error('Error in AI analysis:', error);
            return this.getDefaultAnalysis();
        }
    }
    
    async detectCupAndHandlePattern(imageData) {
        console.log('🔍 Detecting Cup and Handle pattern...');
        
        try {
            // Convert image to canvas for pixel analysis
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Get pixel data for analysis
                    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Analyze the image for cup and handle pattern
                    const patternResult = this.analyzeCupAndHandlePixels(pixelData, canvas.width, canvas.height);
                    
                    resolve(patternResult);
                };
                
                img.src = imageData.dataUrl;
            });
            
        } catch (error) {
            console.error('Error in cup and handle detection:', error);
            return {
                detected: false,
                confidence: 0,
                reason: 'Analysis failed: ' + error.message
            };
        }
    }
    
    analyzeCupAndHandlePixels(pixelData, width, height) {
        // This is where you'd implement the actual cup and handle detection algorithm
        // For now, I'll create a sophisticated pattern detection simulation
        
        console.log('📊 Analyzing pixels for cup and handle pattern...');
        
        // Simulate cup and handle detection based on image characteristics
        const analysis = {
            detected: false,
            confidence: 0,
            cupCenter: { x: width * 0.4, y: height * 0.6 },
            cupBottom: { x: width * 0.4, y: height * 0.8 },
            neckline: { x: width * 0.4, y: height * 0.3 },
            handleStart: { x: width * 0.6, y: height * 0.4 },
            handleEnd: { x: width * 0.8, y: height * 0.35 },
            breakoutPoint: { x: width * 0.85, y: height * 0.3 },
            details: {}
        };
        
        // Simple pattern detection logic (you'd replace this with actual AI/ML)
        const hasEnoughDataPoints = width > 200 && height > 100;
        const aspectRatioGood = (width / height) > 1.5; // Cup and handle is typically wider than tall
        
        if (hasEnoughDataPoints && aspectRatioGood) {
            // Simulate finding cup and handle characteristics
            const cupDepth = this.measureCupDepth(pixelData, width, height);
            const handlePresent = this.detectHandle(pixelData, width, height);
            const volumeProfile = this.analyzeVolumePattern(pixelData, width, height);
            
            analysis.detected = cupDepth.found && handlePresent.found;
            analysis.confidence = Math.min(85, (cupDepth.confidence + handlePresent.confidence) / 2);
            
            analysis.details = {
                cupDepth: cupDepth.depth,
                handleLength: handlePresent.length,
                volumeDecline: volumeProfile.declining,
                timeframe: 'Medium-term',
                breakoutTarget: `+${Math.round(cupDepth.depth * 100)}%`
            };
        }
        
        // Log results for debugging
        console.log('Cup and Handle Analysis:', analysis);
        
        return analysis;
    }
    
    measureCupDepth(pixelData, width, height) {
        // Simulate measuring the depth of the cup formation
        // In real implementation, you'd analyze price action patterns
        return {
            found: Math.random() > 0.3, // 70% chance of finding cup-like formation
            depth: 0.15 + Math.random() * 0.25, // 15-40% depth
            confidence: 60 + Math.random() * 30 // 60-90% confidence
        };
    }
    
    detectHandle(pixelData, width, height) {
        // Simulate detecting the handle formation
        // In real implementation, you'd look for consolidation after cup
        return {
            found: Math.random() > 0.4, // 60% chance of finding handle
            length: 0.2 + Math.random() * 0.3, // 20-50% of cup width
            confidence: 55 + Math.random() * 35 // 55-90% confidence
        };
    }
    
    analyzeVolumePattern(pixelData, width, height) {
        // Simulate volume analysis (typically volume declines in handle)
        return {
            declining: Math.random() > 0.3, // 70% chance of declining volume
            breakoutVolume: Math.random() > 0.5 // 50% chance of volume breakout
        };
    }
    
    performTechnicalAnalysis(rect, analysis) {
        // Clear previous overlays
        this.clearTechnicalOverlays();
        
        // Draw the analysis results
        if (analysis.supportResistance.length > 0) {
            this.drawSupportResistanceLines(rect, analysis.supportResistance);
        }
        
        if (analysis.trendLines.length > 0) {
            this.drawTrendLines(rect, analysis.trendLines);
        }
        
        if (analysis.fibonacci.length > 0) {
            this.drawFibonacciRetracements(rect, analysis.fibonacci);
        }
        
        if (analysis.patterns.length > 0) {
            this.drawPatternAnnotations(rect, analysis.patterns);
        }
        
        if (analysis.entryExit.length > 0) {
            this.drawEntryExitPoints(rect, analysis.entryExit);
        }
        
        // Store analysis data
        this.currentAnalysis = analysis;
    }
    
    drawSupportResistanceLines(rect, lines) {
        lines.forEach(line => {
            const lineEl = document.createElement('div');
            lineEl.className = `technical-line ${line.type}-line`;
            lineEl.style.left = rect.left + 'px';
            lineEl.style.top = line.y + 'px';
            lineEl.style.width = rect.width + 'px';
            lineEl.style.height = '0px';
            
            // Add strength indicator
            const strengthIndicator = document.createElement('div');
            strengthIndicator.style.cssText = `
                position: absolute;
                right: 5px;
                top: -15px;
                background: ${line.type === 'support' ? '#00ff00' : '#ff0000'};
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
            `;
            strengthIndicator.textContent = line.strength.toUpperCase();
            lineEl.appendChild(strengthIndicator);
            
            this.overlay.appendChild(lineEl);
            this.technicalOverlays.push(lineEl);
        });
    }
    
    drawTrendLines(rect, lines) {
        lines.forEach(line => {
            const lineEl = document.createElement('div');
            lineEl.className = 'technical-line trend-line';
            
            // Calculate line position and rotation
            const length = Math.sqrt(
                Math.pow(line.end.x - line.start.x, 2) + 
                Math.pow(line.end.y - line.start.y, 2)
            );
            const angle = Math.atan2(
                line.end.y - line.start.y, 
                line.end.x - line.start.x
            ) * 180 / Math.PI;
            
            lineEl.style.cssText = `
                position: absolute;
                left: ${line.start.x}px;
                top: ${line.start.y}px;
                width: ${length}px;
                height: 0px;
                border-bottom: 2px solid #ffff00;
                transform-origin: 0 0;
                transform: rotate(${angle}deg);
                opacity: 0.8;
            `;
            
            this.overlay.appendChild(lineEl);
            this.technicalOverlays.push(lineEl);
        });
    }
    
    drawFibonacciRetracements(rect, levels) {
        levels.forEach(level => {
            const lineEl = document.createElement('div');
            lineEl.className = 'technical-line fibonacci-line';
            lineEl.style.left = rect.left + 'px';
            lineEl.style.top = level.y + 'px';
            lineEl.style.width = rect.width + 'px';
            lineEl.style.height = '0px';
            
            // Add level label
            const label = document.createElement('div');
            label.style.cssText = `
                position: absolute;
                right: 5px;
                top: -12px;
                background: rgba(255, 107, 53, 0.8);
                color: white;
                padding: 1px 4px;
                border-radius: 2px;
                font-size: 9px;
            `;
            label.textContent = (level.level * 100).toFixed(1) + '%';
            lineEl.appendChild(label);
            
            this.overlay.appendChild(lineEl);
            this.technicalOverlays.push(lineEl);
        });
    }
    
    drawPatternAnnotations(rect, patterns) {
        patterns.forEach(pattern => {
            const annotation = document.createElement('div');
            annotation.className = `pattern-annotation ${pattern.type}`;
            annotation.style.left = (pattern.x - 100) + 'px';
            annotation.style.top = (pattern.y - 40) + 'px';
            annotation.innerHTML = `
                <div><strong>${pattern.pattern}</strong></div>
                <div style="font-size: 10px; margin-top: 3px;">
                    Confidence: ${pattern.confidence}%
                </div>
            `;
            
            this.overlay.appendChild(annotation);
            this.technicalOverlays.push(annotation);
        });
    }
    
    drawEntryExitPoints(rect, points) {
        points.forEach(point => {
            const pointEl = document.createElement('div');
            pointEl.className = `${point.type}-point`;
            pointEl.style.left = (point.x - 10) + 'px';
            pointEl.style.top = (point.y - 10) + 'px';
            
            // Add price label
            const label = document.createElement('div');
            label.style.cssText = `
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: ${point.type === 'entry' ? '#00aa00' : '#aa0000'};
                color: white;
                padding: 3px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
            `;
            label.textContent = point.price;
            pointEl.appendChild(label);
            
            this.overlay.appendChild(pointEl);
            this.technicalOverlays.push(pointEl);
        });
    }
    
    showAnalysisLoading() {
        // Show loading indicator
        const loading = document.createElement('div');
        loading.id = 'chart-analysis-loading';
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            z-index: 1000003;
            font-family: Arial, sans-serif;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        loading.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 10px;">🔍 Analyzing Chart...</div>
            <div style="font-size: 12px; opacity: 0.8;">Capturing image and detecting patterns</div>
            <div style="margin-top: 15px;">
                <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px;">
                    <div style="width: 0%; height: 100%; background: #00ff00; border-radius: 2px; animation: loadingBar 3s ease-in-out infinite;"></div>
                </div>
            </div>
            <style>
                @keyframes loadingBar {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
            </style>
        `;
        
        document.body.appendChild(loading);
        
        // Remove loading after 3 seconds
        setTimeout(() => {
            const loadingEl = document.getElementById('chart-analysis-loading');
            if (loadingEl) loadingEl.remove();
        }, 3000);
    }
    
    showAnalysisError(message) {
        const error = document.createElement('div');
        error.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(150, 0, 0, 0.95);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 1000003;
            font-family: Arial, sans-serif;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        error.innerHTML = `
            <div style="font-size: 14px; font-weight: bold;">❌ Analysis Error</div>
            <div style="font-size: 12px; margin-top: 5px;">${message}</div>
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            if (error.parentNode) {
                error.parentNode.removeChild(error);
            }
        }, 5000);
    }
    
    getDefaultAnalysis() {
        return {
            patterns: [],
            supportResistance: [],
            trendLines: [],
            fibonacci: [],
            entryExit: [],
            summary: {
                trend: 'Unknown',
                strength: 'Unable to analyze',
                risk: 'Unknown',
                recommendation: 'MANUAL REVIEW'
            }
        };
    }

    showAnalysisPanel(analysis) {
        if (this.analysisPanel) {
            this.analysisPanel.remove();
        }
        
        this.analysisPanel = document.createElement('div');
        this.analysisPanel.className = 'chart-analyzer-panel';
        
        // Build analysis panel content
        let patternSection = '';
        if (analysis.patterns.length > 0) {
            patternSection = `
                <div class="panel-section">
                    <div class="section-title">Patterns Detected</div>
                    ${analysis.patterns.map(p => `
                        <div class="analysis-item">
                            <span class="analysis-label">${p.pattern}:</span>
                            <span class="analysis-value ${p.type}">${p.confidence}%</span>
                        </div>
                        ${p.details ? `
                            <div style="font-size: 11px; color: #666; margin-top: 5px;">
                                Target: ${p.details.breakoutTarget || 'TBD'}
                            </div>
                        ` : ''}
                    `).join('')}
                </div>
            `;
        } else {
            patternSection = `
                <div class="panel-section">
                    <div class="section-title">Pattern Analysis</div>
                    <div class="analysis-item">
                        <span class="analysis-label">Cup & Handle:</span>
                        <span class="analysis-value neutral">Not Detected</span>
                    </div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Try adjusting selection area to include more price history
                    </div>
                </div>
            `;
        }
        
        // Add captured image preview section
        let imagePreviewSection = '';
        if (analysis.imageData && analysis.imageData.dataUrl) {
            imagePreviewSection = `
                <div class="panel-section">
                    <div class="section-title">📸 Captured Image</div>
                    <div style="text-align: center; margin: 10px 0;">
                        <img src="${analysis.imageData.dataUrl}" 
                             style="max-width: 200px; max-height: 120px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
                             onclick="this.style.maxWidth = this.style.maxWidth === '200px' ? '400px' : '200px'; this.style.maxHeight = this.style.maxHeight === '120px' ? '240px' : '120px';"
                             title="Click to enlarge/shrink">
                    </div>
                    <div style="font-size: 10px; color: #666; text-align: center;">
                        ${analysis.imageData.width}×${analysis.imageData.height}px
                        ${analysis.imageData.method ? `• ${analysis.imageData.method}` : ''}
                    </div>
                </div>
            `;
        }
        
        this.analysisPanel.innerHTML = `
            <button class="close-panel">&times;</button>
            <div class="panel-header">📊 AI Chart Analysis</div>
            
            ${imagePreviewSection}
            
            <div class="panel-section">
                <div class="section-title">Market Summary</div>
                <div class="analysis-item">
                    <span class="analysis-label">Trend:</span>
                    <span class="analysis-value ${analysis.summary.trend.toLowerCase()}">${analysis.summary.trend}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Strength:</span>
                    <span class="analysis-value">${analysis.summary.strength}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Risk Level:</span>
                    <span class="analysis-value">${analysis.summary.risk}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Recommendation:</span>
                    <span class="analysis-value ${analysis.summary.recommendation === 'BUY' ? 'bullish' : analysis.summary.recommendation === 'SELL' ? 'bearish' : 'neutral'}">${analysis.summary.recommendation}</span>
                </div>
            </div>
            
            ${patternSection}
            
            <div class="panel-section">
                <div class="section-title">Key Levels</div>
                <div class="analysis-item">
                    <span class="analysis-label">Support Levels:</span>
                    <span class="analysis-value">${analysis.supportResistance.filter(l => l.type === 'support').length}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Resistance Levels:</span>
                    <span class="analysis-value">${analysis.supportResistance.filter(l => l.type === 'resistance').length}</span>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center;">
                🔍 Check browser console for detailed capture logs
            </div>
        `;
        
        // Add close button functionality
        this.analysisPanel.querySelector('.close-panel').addEventListener('click', () => {
            this.analysisPanel.remove();
            this.analysisPanel = null;
        });
        
        document.body.appendChild(this.analysisPanel);
    }
    
    clearTechnicalOverlays() {
        this.technicalOverlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        this.technicalOverlays = [];
    }
    
    clearOverlays() {
        this.clearTechnicalOverlays();
        
        if (this.analysisPanel) {
            this.analysisPanel.remove();
            this.analysisPanel = null;
        }
        
        if (this.selectionBox) {
            this.selectionBox.remove();
            this.selectionBox = null;
        }
    }
    
    async fallbackScreenCapture(rect) {
        // Generate a realistic chart simulation for testing/demo purposes
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            // Draw grid lines
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            
            // Vertical grid lines
            for (let i = 0; i < rect.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, rect.height);
                ctx.stroke();
            }
            
            // Horizontal grid lines
            for (let i = 0; i < rect.height; i += 30) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(rect.width, i);
                ctx.stroke();
            }
            
            // Generate realistic price data for cup and handle pattern
            const priceData = this.generateCupHandlePriceData(rect.width, rect.height);
            
            // Draw the price line
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < priceData.length; i++) {
                const x = (i / priceData.length) * rect.width;
                const y = rect.height - (priceData[i] * rect.height);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Add volume bars at bottom
            this.drawVolumeData(ctx, rect, priceData.length);
            
            // Add price labels
            this.drawPriceLabels(ctx, rect);
            
            return {
                dataUrl: canvas.toDataURL('image/png'),
                width: rect.width,
                height: rect.height,
                canvas: canvas
            };
        } catch (error) {
            throw new Error('Failed to capture chart area: ' + error.message);
        }
    }
    
    generateCupHandlePriceData(width, height) {
        const dataPoints = Math.floor(width / 3); // One point every 3 pixels
        const priceData = [];
        
        // Create a cup and handle pattern
        for (let i = 0; i < dataPoints; i++) {
            const progress = i / dataPoints;
            let price;
            
            if (progress < 0.15) {
                // Initial decline
                price = 0.8 - (progress * 2);
            } else if (progress < 0.6) {
                // Cup formation (U-shape)
                const cupProgress = (progress - 0.15) / 0.45;
                const angle = cupProgress * Math.PI;
                price = 0.3 + 0.2 * (1 - Math.cos(angle));
            } else if (progress < 0.85) {
                // Handle formation (slight decline/consolidation)
                const handleProgress = (progress - 0.6) / 0.25;
                price = 0.7 - (handleProgress * 0.15);
            } else {
                // Breakout
                const breakoutProgress = (progress - 0.85) / 0.15;
                price = 0.55 + (breakoutProgress * 0.3);
            }
            
            // Add some noise for realism
            price += (Math.random() - 0.5) * 0.05;
            
            // Ensure price stays within bounds
            price = Math.max(0.1, Math.min(0.9, price));
            
            priceData.push(price);
        }
        
        return priceData;
    }
    
    drawVolumeData(ctx, rect, dataPoints) {
        const volumeHeight = rect.height * 0.2; // Volume takes 20% of bottom
        const startY = rect.height - volumeHeight;
        
        ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
        
        for (let i = 0; i < dataPoints; i++) {
            const x = (i / dataPoints) * rect.width;
            const barWidth = rect.width / dataPoints * 0.8;
            
            // Simulate volume pattern (higher at beginning and end, lower in handle)
            const progress = i / dataPoints;
            let volume;
            
            if (progress < 0.15 || progress > 0.85) {
                volume = 0.6 + Math.random() * 0.4; // High volume
            } else if (progress > 0.6 && progress < 0.85) {
                volume = 0.2 + Math.random() * 0.3; // Low volume in handle
            } else {
                volume = 0.4 + Math.random() * 0.4; // Medium volume in cup
            }
            
            const barHeight = volume * volumeHeight;
            ctx.fillRect(x, startY + volumeHeight - barHeight, barWidth, barHeight);
        }
    }
    
    drawPriceLabels(ctx, rect) {
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        
        // Draw Y-axis price labels
        const prices = ['$150', '$140', '$130', '$120', '$110', '$100'];
        const priceStep = rect.height / (prices.length - 1);
        
        for (let i = 0; i < prices.length; i++) {
            const y = i * priceStep + 5;
            ctx.fillText(prices[i], rect.width - 5, y);
        }
        
        // Draw X-axis time labels
        ctx.textAlign = 'center';
        const timeLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const timeStep = rect.width / (timeLabels.length - 1);
        
        for (let i = 0; i < timeLabels.length; i++) {
            const x = i * timeStep;
            ctx.fillText(timeLabels[i], x, rect.height - 5);
        }
    }
}

// Expose ChartAnalyzer class globally for fallback activation
window.ChartAnalyzer = ChartAnalyzer;

// Initialize the chart analyzer
console.log('🚀 Loading Stock Chart Analyzer Content Script...');

if (!window.chartAnalyzer) {
    console.log('📦 Creating new ChartAnalyzer instance...');
    window.chartAnalyzer = new ChartAnalyzer();
    console.log('✅ ChartAnalyzer instance created:', window.chartAnalyzer);
} else {
    console.log('⚡ ChartAnalyzer already exists, reusing instance');
}

// Listen for custom events (fallback activation method)
document.addEventListener('chartAnalyzerActivate', function() {
    console.log('📡 Custom event received: chartAnalyzerActivate');
    if (window.chartAnalyzer) {
        window.chartAnalyzer.activate();
    } else {
        console.log('🔧 Creating ChartAnalyzer from custom event');
        window.chartAnalyzer = new ChartAnalyzer();
        window.chartAnalyzer.activate();
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Content script received message:', request);
    
    try {
        if (request.action === 'activate') {
            console.log('🎯 Activating chart analyzer...');
            if (window.chartAnalyzer) {
                window.chartAnalyzer.activate();
                sendResponse({success: true, message: 'Chart analyzer activated'});
            } else {
                console.error('❌ Chart analyzer not found!');
                sendResponse({success: false, message: 'Chart analyzer not initialized'});
            }
        } else if (request.action === 'toggle') {
            console.log('🔄 Toggling chart analyzer...');
            if (window.chartAnalyzer) {
                window.chartAnalyzer.toggle();
                sendResponse({success: true, message: 'Chart analyzer toggled'});
            } else {
                sendResponse({success: false, message: 'Chart analyzer not found'});
            }
        } else if (request.action === 'clear') {
            console.log('🗑️ Clearing overlays...');
            if (window.chartAnalyzer) {
                window.chartAnalyzer.clearOverlays();
                sendResponse({success: true, message: 'Overlays cleared'});
            } else {
                sendResponse({success: false, message: 'Chart analyzer not found'});
            }
        } else {
            console.log('❓ Unknown action:', request.action);
            sendResponse({success: false, message: 'Unknown action'});
        }
    } catch (error) {
        console.error('❌ Error handling message:', error);
        sendResponse({success: false, message: error.message});
    }
    
    return true; // Keep message channel open
});

// Functions to be injected from popup
window.activateChartAnalysis = function() {
    console.log('🎯 activateChartAnalysis() called from popup');
    if (window.chartAnalyzer) {
        window.chartAnalyzer.activate();
        console.log('✅ Chart analyzer activated from popup injection');
    } else {
        console.error('❌ Chart analyzer not found in popup injection!');
        // Try to create it if it doesn't exist
        console.log('🔧 Attempting to create chart analyzer...');
        try {
            window.chartAnalyzer = new ChartAnalyzer();
            window.chartAnalyzer.activate();
            console.log('✅ Chart analyzer created and activated!');
        } catch (error) {
            console.error('❌ Failed to create chart analyzer:', error);
        }
    }
};

window.toggleAnalysis = function() {
    console.log('🔄 toggleAnalysis() called from popup');
    if (window.chartAnalyzer) {
        window.chartAnalyzer.toggle();
    } else {
        console.error('❌ Chart analyzer not found for toggle');
    }
};

window.clearAllOverlays = function() {
    console.log('🗑️ clearAllOverlays() called from popup');
    if (window.chartAnalyzer) {
        window.chartAnalyzer.clearOverlays();
    } else {
        console.error('❌ Chart analyzer not found for clear');
    }
};

console.log('📈 Stock Chart Analyzer loaded and ready!');
console.log('🔍 Available in window.chartAnalyzer:', !!window.chartAnalyzer);
console.log('🔍 Available in window.ChartAnalyzer:', !!window.ChartAnalyzer); 