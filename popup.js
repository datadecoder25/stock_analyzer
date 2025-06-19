document.addEventListener('DOMContentLoaded', function() {
    const applyBtn = document.getElementById('apply-to-chart');
    const toggleBtn = document.getElementById('toggle-analysis');
    const clearBtn = document.getElementById('clear-overlays');
    const debugBtn = document.getElementById('debug-test');
    const status = document.getElementById('status');
    
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
    
    // Debug test button (keep for troubleshooting)
    debugBtn.addEventListener('click', async function() {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: debugTest
            });
            
            updateStatus('🔧 Debug test executed');
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
        background: rgba(0, 255, 0, 0.1) !important;
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
        console.log('📸 Analyze button clicked - capturing area...');
        
        const rect = selectionBox.getBoundingClientRect();
        console.log('📐 Selection area:', rect);
        
        // Freeze the box (make it semi-transparent and non-interactive)
        selectionBox.style.pointerEvents = 'none';
        selectionBox.style.opacity = '0.5';
        analyzeBtn.style.display = 'none';
        
        // Hide the overlay temporarily for capture
        overlay.style.display = 'none';
        
        // Simulate capture process
        setTimeout(() => {
            captureSelectedArea(rect);
            
            // Show overlay again
            overlay.style.display = 'block';
            
            // Show completion message
            instruction.innerHTML = '✅<br>Area Captured!<br>Analysis Complete<br><small>Click X to close</small>';
            instruction.style.color = '#00aa00';
            
        }, 500);
    });
    
    // Close button functionality
    closeBtn.addEventListener('click', function() {
        overlay.remove();
        console.log('📦 Selection box closed');
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

// Simple capture function
function captureSelectedArea(rect) {
    console.log('📸 Capturing area:', rect.width, 'x', rect.height, 'at', rect.left, rect.top);
    
    // Here you would implement the actual image capture
    // For now, we'll just log the area and show a success message
    
    const captureInfo = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        timestamp: new Date().toISOString()
    };
    
    console.log('📊 Capture completed:', captureInfo);
    
    // You can add actual image capture logic here
    // For example, using html2canvas or similar libraries
}

// Clear function
function clearSimpleBox() {
    const overlay = document.getElementById('chart-selection-overlay');
    if (overlay) {
        overlay.remove();
        console.log('🗑️ Selection box cleared');
    }
}

// Debug test function (simplified)
function debugTest() {
    console.log('🔧 DEBUG: Testing extension functionality...');
    
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 300px !important;
        height: 200px !important;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
        border: 3px solid #fff !important;
        border-radius: 10px !important;
        color: white !important;
        text-align: center !important;
        padding: 20px !important;
        z-index: 2147483647 !important;
        font-weight: bold !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
    `;
    
    testDiv.innerHTML = `
        <h3>🔧 DEBUG TEST</h3>
        <p>✅ Extension is working!</p>
        <p>URL: ${window.location.hostname}</p>
        <button onclick="this.parentElement.remove()" 
                style="margin-top: 20px; padding: 8px 16px; background: #fff; color: #333; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
            Close
        </button>
    `;
    
    document.body.appendChild(testDiv);
    
    setTimeout(() => {
        if (testDiv.parentElement) {
            testDiv.remove();
        }
    }, 10000);
} 