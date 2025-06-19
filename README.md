# 📈 Stock Chart Analyzer - Chrome Extension

A powerful Chrome extension for analyzing stock charts with advanced technical analysis tools and automated pattern recognition.

## 🚀 Features

- **Interactive Chart Selection**: Create and adjust rectangular selection boxes on any webpage
- **Technical Analysis Overlays**: Automatic detection and visualization of:
  - Support and Resistance levels
  - Trend lines
  - Fibonacci retracements
  - Chart patterns (Bullish Flag, Support levels, etc.)
  - Entry and Exit points
- **Real-time Analysis Panel**: Comprehensive analysis dashboard showing:
  - Market trend and strength
  - Risk assessment
  - Trading recommendations
  - Pattern confidence levels
- **Beautiful UI**: Modern, responsive interface with smooth animations
- **Universal Compatibility**: Works on any webpage with stock charts

## 📦 Installation

1. **Download the Extension Files**
   - Ensure all files are in the same directory:
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `content.js`
     - `content.css`
     - `background.js`

2. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

3. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Stock Chart Analyzer" and click the pin icon
   - The extension icon will now be visible in your toolbar

## 🎯 How to Use

### Step 1: Activate the Extension
1. Navigate to any webpage with a stock chart
2. Click the Stock Chart Analyzer extension icon
3. Click "🎯 Apply to Chart" button

### Step 2: Select Your Chart Area
1. A green rectangular box will appear on the page
2. **Drag the box** to position it over your chart
3. **Resize the box** using the circular handles:
   - Corner handles: resize diagonally
   - Side handles: resize horizontally/vertically
4. Adjust until the box perfectly frames your chart

### Step 3: Analyze the Chart
1. Click the "🔍 Analyze Chart" button above the selection box
2. The extension will automatically:
   - Draw support and resistance lines
   - Add trend lines and Fibonacci levels
   - Mark entry/exit points
   - Display pattern annotations
   - Show a comprehensive analysis panel

### Step 4: Review Analysis Results
- **Analysis Panel**: View detailed technical analysis on the right side
- **Overlays**: See visual indicators directly on the chart
- **Recommendations**: Get AI-powered trading suggestions

## 🎮 Controls

### Extension Popup Buttons
- **🎯 Apply to Chart**: Activate the analyzer on current page
- **🔍 Toggle Analysis**: Show/hide analysis overlays
- **🗑️ Clear Overlays**: Remove all overlays and reset

### Chart Selection Box
- **Drag**: Click and drag to move the selection box
- **Resize**: Use the 8 circular handles to resize
- **Analyze**: Click the analyze button to start technical analysis

### Analysis Panel
- **Close**: Click the "×" button to close the panel
- **Detailed Metrics**: View trend, strength, risk, and recommendations

## 🔧 Technical Features

### Supported Analysis Types
- **Support/Resistance Lines**: Automatically detected key price levels
- **Trend Analysis**: Uptrend, downtrend, and sideways movement detection
- **Fibonacci Retracements**: 23.6%, 38.2%, 61.8%, 78.6% levels
- **Pattern Recognition**: Bullish flags, support breaks, and more
- **Entry/Exit Points**: Suggested optimal trading positions

### Visual Indicators
- **Green Lines**: Support levels
- **Red Lines**: Resistance levels  
- **Yellow Lines**: Trend lines
- **Orange Dashed Lines**: Fibonacci levels
- **Green Circles**: Entry points
- **Red Circles**: Exit points
- **Colored Annotations**: Pattern descriptions with confidence levels

## 🛠️ Troubleshooting

### Extension Not Working?
1. **Refresh the page** after installing the extension
2. **Check permissions**: Ensure the extension has access to the current site
3. **Developer Console**: Press F12 and check for any error messages

### Selection Box Not Appearing?
1. Try clicking "🎯 Apply to Chart" again
2. Ensure you're on a webpage (not chrome:// pages)
3. Check if the box is outside the visible area - scroll to find it

### Analysis Not Showing?
1. Make sure the selection box is positioned over chart content
2. Try adjusting the box size - it needs to be at least 100x100 pixels
3. Click the "Analyze Chart" button directly on the selection box

## 🎨 Customization

The extension uses CSS custom properties for easy customization. You can modify colors and animations in `content.css`:

```css
/* Example customizations */
.chart-selection-box {
    border-color: #your-color; /* Change selection box color */
}

.support-line {
    border-color: #your-support-color; /* Change support line color */
}
```

## 🔒 Privacy & Security

- **No Data Collection**: The extension doesn't collect or store any personal data
- **Local Processing**: All analysis is performed locally in your browser
- **No External Requests**: No data is sent to external servers
- **Open Source**: All code is visible and can be audited

## 🤝 Contributing

This extension is built with vanilla JavaScript and modern web technologies. To contribute:

1. Fork the repository
2. Make your changes
3. Test thoroughly on different chart websites
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Trading! 📊📈**

*Remember: This extension is for educational and analysis purposes only. Always do your own research before making investment decisions.* 