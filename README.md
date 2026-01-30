# Local AI: Private Spell Checker & Chat

## Support
If you like my work, consider supporting me:  
[Buy me a coffee ☕](https://www.buymeacoffee.com/watchdogalert)

A privacy-focused Chrome Extension that runs Large Language Models (LLMs) **locally in your browser** using WebGPU. It allows you to fix grammar/spelling and chat with any webpage without sending your data to external servers.

**Powered by [WebLLM](https://webllm.mlc.ai/)**

## Why Local AI?
Most AI extensions "read and change your data on all websites" and send your text to the cloud. **Local AI** is different:
*   **Permissions:** It only accesses the website you are currently looking at when you explicitly click it (**`activeTab`**).
*   **Privacy:** 100% of the AI processing happens on your own graphics card (GPU). No text is ever uploaded to the internet.

## Features
*   **📝 Smart Spell Checker:** Context-aware grammar and spell checking with visual Red/Green diffs.
*   **💬 Page Chat:** Ask questions or summarize any webpage instantly.
*   **🔒 100% Local:** Works offline (after model download) and keeps your data private.
*   **🧠 Multiple Models:** Choose between Llama-3, Phi-3, Gemma, and more.

---

## 📥 Installation

Since this extension is in development, you need to install it manually.

### 1. Download the Code
*   **Clone the repository:**
    ```bash
    git clone https://github.com/valentinfomin/ai-spellchecker.git
    ```
*   **Or Download ZIP:** Click "Code" > "Download ZIP" on GitHub and extract the folder.

### 2. Install in Google Chrome
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Toggle **Developer mode** (top right).
3.  Click **Load unpacked** (top left).
4.  **Crucial:** Select the **`extension`** folder inside the project directory.
5.  The extension "Local AI" will appear.

### 3. Install in Brave Browser
1.  **Enable WebGPU:** Type `brave://flags` in the address bar. Search for **"WebGPU"** and set to **Enabled**. Relaunch Brave.
2.  **Enable Hardware Acceleration:** Go to `brave://settings/system` and ensure **"Use graphics acceleration"** is ON.
3.  **Install:** Go to `brave://extensions`, enable Developer mode, and **Load unpacked** the `extension` folder.

---

## 🚀 How to Use

### Initial Setup
1.  Open the **Side Panel** (click the Local AI icon).
2.  Select a model (e.g., **Llama-3-8B-Instruct**).
3.  Click **"Download & Load Model"**.
    *   *Note: This downloads ~2GB-4GB once. It stays in your browser cache.*

### Spell Check
1.  **Context Menu:** Highlight text -> Right-click -> **"Local AI Spell Checker"**.
2.  **Auto-Fix:** Type in the panel; it will suggest fixes automatically after you stop typing.
3.  **Replace:** Click **"Replace Selection"** to update the website text instantly.

### Page Chat
1.  Switch to the **"Page Chat"** tab.
2.  Ask a question or click **"Summarize"**.
3.  The AI reads the page and responds locally.

---

## ⚠️ Troubleshooting
*   **WebGPU Context Lost:** Close and reopen the Side Panel. The extension will auto-recover.
*   **Brave Issues:** Ensure `WebGPU Developer Features` is enabled in `brave://flags`.
*   **Model not loading:** Refresh the side panel or check `chrome://gpu` to ensure your browser can see your graphics card.

---

## License
MIT License &copy; 2026 Michael & Co