// Popup script for Stock Chart Analyzer
document.addEventListener('DOMContentLoaded', function() {
    const applyToChartBtn = document.getElementById('apply-to-chart');
    const toggleAnalysisBtn = document.getElementById('toggle-analysis');
    const clearOverlaysBtn = document.getElementById('clear-overlays');
    const debugTestBtn = document.getElementById('debug-test');
    const apiSettingsBtn = document.getElementById('api-settings');
    const statusDiv = document.getElementById('status');
    const apiSettingsPanel = document.getElementById('api-settings-panel');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyInput = document.getElementById('openai-api-key');
    const apiStatusDiv = document.getElementById('api-status');

    // Load saved API key
    loadApiKey();

    // Event listeners
    applyToChartBtn.addEventListener('click', applyToChart);
    toggleAnalysisBtn.addEventListener('click', toggleAnalysis);
    clearOverlaysBtn.addEventListener('click', clearOverlays);
    debugTestBtn.addEventListener('click', debugTest);
    apiSettingsBtn.addEventListener('click', toggleApiSettings);
    saveApiKeyBtn.addEventListener('click', saveApiKey);

    async function applyToChart() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: initializeChartSelector
            });

            updateStatus('Chart selector applied! Draw a box around your chart.');
            toggleAnalysisBtn.style.display = 'block';
        } catch (error) {
            console.error('Error applying to chart:', error);
            updateStatus('Error: Could not apply to chart. Try refreshing the page.');
        }
    }

    async function toggleAnalysis() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: toggleAnalysisPanel
            });

            updateStatus('Analysis panel toggled.');
        } catch (error) {
            console.error('Error toggling analysis:', error);
            updateStatus('Error: Could not toggle analysis panel.');
        }
    }

    async function clearOverlays() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: clearAllOverlays
            });

            updateStatus('Selection box cleared.');
            toggleAnalysisBtn.style.display = 'none';
        } catch (error) {
            console.error('Error clearing overlays:', error);
            updateStatus('Error: Could not clear overlays.');
        }
    }

    async function debugTest() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: runDebugTest
            });

            updateStatus('Debug test completed. Check console for details.');
        } catch (error) {
            console.error('Debug test error:', error);
            updateStatus('Debug test failed. Check console for details.');
        }
    }

    function toggleApiSettings() {
        const isVisible = apiSettingsPanel.style.display !== 'none';
        apiSettingsPanel.style.display = isVisible ? 'none' : 'block';
        apiSettingsBtn.textContent = isVisible ? '⚙️ API Settings' : '❌ Close Settings';
    }

    async function saveApiKey() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            updateApiStatus('Please enter an API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            updateApiStatus('Invalid API key format', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ openaiApiKey: apiKey });
            updateApiStatus('API key saved successfully!', 'success');
            apiKeyInput.value = '';
        } catch (error) {
            console.error('Error saving API key:', error);
            updateApiStatus('Error saving API key', 'error');
        }
    }

    async function loadApiKey() {
        try {
            const result = await chrome.storage.sync.get(['openaiApiKey']);
            if (result.openaiApiKey) {
                updateApiStatus('API key configured ✓', 'success');
            } else {
                updateApiStatus('No API key configured', 'warning');
            }
        } catch (error) {
            console.error('Error loading API key:', error);
            updateApiStatus('Error loading API key', 'error');
        }
    }

    function updateStatus(message) {
        statusDiv.textContent = message;
        statusDiv.style.background = 'rgba(255, 255, 255, 0.1)';
    }

    function updateApiStatus(message, type) {
        apiStatusDiv.textContent = message;
        apiStatusDiv.style.background = type === 'success' ? 'rgba(0, 255, 0, 0.2)' : 
                                       type === 'error' ? 'rgba(255, 0, 0, 0.2)' : 
                                       'rgba(255, 255, 0, 0.2)';
    }

    // Functions to be injected into the content script
    function initializeChartSelector() {
        if (window.chartAnalyzer) {
            window.chartAnalyzer.init();
        }
    }

    function toggleAnalysisPanel() {
        if (window.chartAnalyzer) {
            window.chartAnalyzer.togglePanel();
        }
    }

    function clearAllOverlays() {
        if (window.chartAnalyzer) {
            window.chartAnalyzer.clearOverlays();
        }
    }

    function runDebugTest() {
        console.log('=== Chart Analyzer Debug Test ===');
        console.log('Extension loaded:', !!window.chartAnalyzer);
        console.log('Current URL:', window.location.href);
        console.log('Page dimensions:', window.innerWidth + 'x' + window.innerHeight);
        
        if (window.chartAnalyzer) {
            console.log('Chart analyzer methods:', Object.keys(window.chartAnalyzer));
        }
        
        return { success: true, timestamp: new Date().toISOString() };
    }
});