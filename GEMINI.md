# AI Spellchecker

## Project Overview

**AI Spellchecker** is a Chrome Extension (Manifest V3) that leverages **WebLLM** (MLC-LLM) to perform grammar and spelling corrections locally in the browser. It allows users to select text on any webpage and process it using a locally running Large Language Model, ensuring privacy and offline capability (after initial model download).

**Key Features:**
*   **Local Inference:** Uses WebGPU to run LLMs client-side without sending data to external servers (once models are cached).
*   **Context Menu Integration:** "Исправить ошибки (AI)" option in the right-click menu.
*   **Automatic Replacement:** Can replace the text in the active input field or textarea after user confirmation.
*   **Model Management:** Supports selecting and caching different prebuilt models compatible with WebLLM.

## Architecture

*   **`manifest.json`**: Defines the extension configuration, permissions (`contextMenus`, `storage`, `activeTab`), and security policies (CSP allowing `wasm-unsafe-eval` for WebLLM).
*   **`popup.html` / `popup.js`**:
    *   Acts as the main interface and execution environment for the LLM.
    *   Handles model initialization (`MLCEngine`), loading, and chat completion requests.
    *   Contains the system prompt logic: "Act as an editor. 1. Fix grammar/tenses..."
    *   Orchestrates the flow: Load Model -> Receive Text (from storage or input) -> Generate Fix -> Send to Content Script.
*   **`background.js`**:
    *   Service Worker that creates the context menu item.
    *   On click, saves the selected text to `chrome.storage.local` and attempts to programmatically open the popup (`chrome.action.openPopup`) to start the background processing.
*   **`content.js`**:
    *   Listens for the `apply_fix` message from the popup.
    *   Locates the active DOM element (`textarea`, `input`, or `contentEditable`).
    *   Prompts the user to confirm the change before replacing the text.

## Development & Usage

### Prerequisites
*   A browser supporting **WebGPU** (e.g., modern Chrome, Edge).
*   Models are downloaded from Hugging Face on first use.

### Installation
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable "Developer mode".
3.  Click **Load unpacked** and select this directory (`spellcheck`).

### Workflow
1.  **Select Text:** Highlight text in any input box or webpage.
2.  **Context Menu:** Right-click and choose "Исправить ошибки (AI)".
3.  **Processing:** The extension popup will open (or must be opened manually if the browser blocks it), load the model (if not loaded), and process the text.
4.  **Result:** The fixed text appears in the popup.
5.  **Apply:** The extension attempts to replace the selected text on the webpage, asking for confirmation first.

### Key Code Paths
*   **Prompt Logic:** Located in `popup.js` inside `generateText()`.
*   **Model Configuration:** `web-llm.js` (library) and `popup.js` (model selection logic).
