// Background service worker for Stock Chart Analyzer
chrome.runtime.onInstalled.addListener(() => {
    console.log('Stock Chart Analyzer extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will be handled by the popup, but we can add fallback logic here if needed
    console.log('Extension icon clicked on tab:', tab.id);
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    if (request.action === 'analyze-chart') {
        // Could implement additional background processing here
        sendResponse({success: true});
    }
    
    return true; // Keep message channel open for async response
});

// Optional: Handle tab updates to reinject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Could reinject content script here if needed
        console.log('Tab updated:', tab.url);
    }
}); 