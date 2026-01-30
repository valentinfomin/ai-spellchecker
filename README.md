# Local AI Spell Checker & Page Chat

## Support
If you like my work, consider supporting me:  
[Buy me a coffee ☕](https://www.buymeacoffee.com/watchdogalert)

A privacy-focused Chrome Extension that runs Large Language Models (LLMs) **locally in your browser** using WebGPU. It allows you to fix grammar/spelling and chat with any webpage without sending your data to external servers.

**Powered by [WebLLM](https://webllm.mlc.ai/)**

## Features

*   **🔒 100% Local Privacy:** No data leaves your device (after initial model download).
*   **📝 Smart Spell Checker:** Context-aware grammar and spell checking.
    *   Select text on any page -> Right-click -> "Local AI Spell Checker".
    *   Auto-fix while typing in the panel.
    *   "Replace Selection" button to instantly update text on the page.
*   **💬 Page Chat:** Talk to your browser tab!
    *   Automatically reads the current page content.
    *   Ask questions like "Summarize this page" or "What is the main argument?".
*   **🧠 Multiple Models:** Supports Llama-3, Phi-3, Gemma, and more.

---

## 📥 Installation

Since this extension is in development, you need to install it manually.

### 1. Download the Code
*   **Clone the repository:**
    ```bash
    git clone https://github.com/valentinfomin/ai-spellchecker.git
    ```
*   **Or Download ZIP:** Click "Code" > "Download ZIP" on GitHub.
    *   **Windows:** Right-click the ZIP -> **Extract All...** (e.g., to `Downloads\ai-spellchecker`).
    *   **Mac:** Double-click the ZIP file to extract it (e.g., to `Downloads/ai-spellchecker`).

### 2. Install in Google Chrome
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Toggle **Developer mode** in the top right corner.
3.  Click the **Load unpacked** button (top left).
4.  Select the folder where you extracted the extension.
    *   **Windows:** `C:\Users\YourName\Downloads\ai-spellchecker`
    *   **Mac:** `/Users/YourName/Downloads/ai-spellchecker`
5.  The extension "AI Spellchecker" should appear in your list.

### 3. Install in Brave Browser
**Important:** Brave disables WebGPU by default. You must enable it first.

1.  **Enable WebGPU:**
    *   Type `brave://flags` in the address bar.
    *   Search for **"WebGPU"**.
    *   Set **"WebGPU Developer Features"** to **Enabled**.
    *   Click **Relaunch** at the bottom.
2.  **Enable Hardware Acceleration:**
    *   Go to `brave://settings/system`.
    *   Ensure **"Use graphics acceleration when available"** is **ON**.
    *   *Windows Note:* If it still doesn't work, ensure your Windows Graphics Drivers (NVIDIA/AMD/Intel) are up to date.
    *   *Mac Note:* Works best on Apple Silicon (M1/M2/M3) chips. Intel Macs might run slower.
3.  **Install Extension:**
    *   Go to `brave://extensions`.
    *   Toggle **Developer mode** (top right).
    *   Click **Load unpacked**.
    *   Select the extension folder.

---

## 🚀 How to Use

### Initial Setup
1.  Click the extension icon (puzzle piece) or open the **Side Panel** in your browser.
2.  Select a model from the dropdown (Recommended: **Llama-3-8B-Instruct** for best quality, or **Phi-3-mini** for speed).
3.  Click **"Download & Load Model"**.
    *   *Note: This will download ~2GB-4GB of data once. Please be patient.*

### Spell Check
1.  **Context Menu:** Highlight text on any website -> Right-click -> Select **"Local AI Spell Checker"**. The side panel will open and fix the text.
2.  **Manual:** Type or paste text directly into the Side Panel's text box.
3.  **Replace:** Review the changes (highlighted in Green/Red). Click **"Replace Selection"** to update the text on the webpage automatically.

### Page Chat
1.  Open the Side Panel.
2.  Click the **"Page Chat"** tab at the top.
3.  Type a question (e.g., *"Summarize this article"*) or click the **"Summarize"** button.
4.  The AI will read the page content automatically and answer your question.

---

## ⚠️ Troubleshooting

**"WebGPU Context Lost" or "Object Disposed"**
*   This happens if the browser's GPU process crashes or is reset.
*   **Fix:** Close and reopen the Side Panel. The extension attempts to auto-recover, but a manual reopen is sometimes required.

**"Model not loaded"**
*   Ensure you clicked "Load Model" and saw the "✅ Ready" status.
*   If the error persists, reload the extension in `chrome://extensions`.

**Brave: "WebGPU not supported"**
*   Double-check `brave://flags` and ensure WebGPU is enabled.
*   Ensure your graphics drivers are up to date.

---

## License
MIT License
