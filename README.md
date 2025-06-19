# 📈 Stock Chart Analyzer

An advanced Chrome extension that analyzes stock charts with AI-powered technical analysis, featuring automatic support and resistance level detection using GPT-4 Vision.

## ✨ Features

- **🤖 AI-Powered Analysis**: Uses GPT-4 Vision to analyze chart images and identify key levels
- **📊 Automatic Support & Resistance Detection**: AI identifies and draws support/resistance lines
- **Interactive Chart Selection**: Create and adjust rectangular selection boxes on any webpage
- **🎯 Precise Analysis**: Capture specific chart areas for focused technical analysis
- **💡 Smart Overlays**: Visual indicators for key technical levels with strength ratings
- **🔧 Easy Configuration**: Simple setup with secure API key storage

## 🚀 Quick Start

### 1. Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" 
4. Click "Load unpacked" and select the extension folder

### 2. API Configuration
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click the extension icon in your browser
3. Click "⚙️ API Settings"
4. Enter your API key and click "Save"

### 3. Analyze Charts
1. Navigate to any webpage with stock charts
2. Click the extension icon
3. Click "🎯 Apply to Chart"
4. Position and resize the selection box over your chart
5. Click "📸 Analyze Chart" to start AI analysis
6. View automatically drawn support/resistance lines and detailed analysis

## 🔍 How It Works

### Image Capture
- Uses html2canvas for high-quality chart image capture
- Fallback canvas rendering for compatibility
- Captures selected area with pixel-perfect precision

### AI Analysis Process
1. **Image Processing**: Captured chart image is sent to GPT-4 Vision
2. **Pattern Recognition**: AI identifies price patterns, support/resistance levels
3. **Technical Analysis**: Evaluates trend strength, key levels, and market structure
4. **Visual Overlay**: Automatically draws analysis results on the webpage

### Smart Line Drawing
- **Support Lines**: Green lines with strength indicators (Strong/Medium/Weak)
- **Resistance Lines**: Red lines with confidence levels
- **Dynamic Positioning**: Lines are positioned based on AI-identified price levels
- **Interactive Results**: Detailed analysis panel with explanations

## 🎯 Usage Examples

### Basic Chart Analysis
```
1. Open your favorite trading platform (TradingView, Yahoo Finance, etc.)
2. Find a stock chart you want to analyze
3. Click the extension icon → "Apply to Chart"
4. Draw selection box around the chart area
5. Click "Analyze Chart" and wait for AI analysis
6. Review support/resistance lines and analysis panel
```

### Advanced Features
- **Multiple Timeframes**: Analyze different chart timeframes
- **Pattern Detection**: AI identifies cup & handle, trend patterns
- **Volume Analysis**: Considers volume patterns in analysis
- **Key Observations**: Get specific insights about price action

## ⚙️ Configuration

### API Settings
- **OpenAI API Key**: Required for AI analysis features
- **Secure Storage**: Keys stored locally in browser (chrome.storage.sync)
- **Easy Management**: Update keys anytime through the popup interface

### Chart Selection Box
- **Transparent Background**: Clean, non-intrusive selection box
- **Drag to Move**: Click and drag to reposition the selection area
- **Resize Handles**: 8-point resize handles for precise area selection
- **Visual Feedback**: Glowing border for clear visibility

## 🔧 Technical Details

### Architecture
- **Content Script**: Handles page interaction and overlay rendering
- **Popup Interface**: User controls and settings management  
- **Background Service**: Manages extension lifecycle
- **AI Integration**: OpenAI GPT-4 Vision API for image analysis

### Permissions
- `activeTab`: Access current tab for chart analysis
- `storage`: Secure API key storage
- `scripting`: Inject analysis overlays
- `host_permissions`: Access to websites and OpenAI API

### Dependencies
- **html2canvas**: High-quality webpage image capture
- **OpenAI API**: GPT-4 Vision for chart analysis
- **Chrome Extensions API**: Browser integration

## 🎨 Customization

### Selection Box Styling
The selection box is now **transparent** with a green dashed border and glow effect:
```css
.chart-selection-box {
    background: transparent;
    border: 2px dashed #00ff00;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}
```

### Analysis Line Colors
- **Support**: Green (`#00ff00`) with glow effect
- **Resistance**: Red (`#ff0000`) with glow effect  
- **Opacity**: Varies by strength (Strong: 90%, Medium: 70%, Weak: 50%)

## 🛠️ Troubleshooting

### Selection Box Not Appearing?
1. Refresh the page and try again
2. Check if the extension has permission for this site
3. Make sure the selection box is positioned over chart content
4. Try the "🔧 Debug Test" button to verify extension functionality

### AI Analysis Issues?
1. **API Key**: Verify your OpenAI API key is correctly configured
2. **Image Quality**: Ensure the selected area contains a clear chart
3. **API Limits**: Check your OpenAI API usage limits
4. **Network**: Verify internet connection for API calls

### Performance Tips
- Select smaller chart areas for faster analysis
- Ensure charts have clear price action for best AI results
- Use on pages with stable chart layouts

## 📊 Analysis Output

### Support & Resistance Levels
```json
{
  "support_levels": [
    {
      "price_level": 0.3,
      "strength": "strong", 
      "description": "Major support from previous lows"
    }
  ],
  "resistance_levels": [
    {
      "price_level": 0.8,
      "strength": "medium",
      "description": "Resistance at previous high"
    }
  ]
}
```

### Market Analysis
- **Trend Direction**: Bullish/Bearish/Sideways
- **Confidence Level**: 0-100% AI confidence score
- **Key Observations**: Specific insights about price patterns
- **Technical Summary**: Overall market assessment

## 🔮 Future Features

- **Multiple Pattern Detection**: Head & Shoulders, Triangles, Flags
- **Fibonacci Retracements**: Automatic Fib level drawing
- **Volume Profile Analysis**: Enhanced volume-based insights
- **Alert System**: Notifications for breakouts and key levels
- **Historical Backtesting**: Compare AI predictions with actual outcomes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different chart types
5. Submit a pull request

## 📄 License

MIT License - Feel free to use and modify for your trading needs.

## ⚠️ Disclaimer

This extension is for educational and informational purposes only. The AI analysis should not be considered as financial advice. Always do your own research and consult with financial professionals before making investment decisions.

---

**Happy Trading! 📈🤖** 