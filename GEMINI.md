# Local AI Spell Checker & Page Chat

## Project Overview

**Local AI** (formerly AI Spellchecker) is a privacy-first Chrome Extension (Manifest V3) that runs Large Language Models (LLMs) **locally in the browser** via **WebGPU**. 

It provides two main functionalities:
1.  **Spell/Grammar Checking:** Context-aware correction with visual diffs and one-click replacement.
2.  **Page Chat:** RAG-like capability to read the current webpage's content and answer questions or summarize it.

**Key Technologies:**
*   **WebLLM (MLC-LLM):** Core engine for in-browser inference.
*   **Chrome Side Panel API:** Persistent UI that keeps the model loaded while browsing.
*   **WebGPU:** Hardware acceleration for running 4-bit quantized models (Llama-3, Phi-3, etc.).

## Architecture

*   **`manifest.json`**: 
    *   Uses `sidePanel` permission for persistent UI.
    *   `content_scripts` configured with `all_frames: true` to handle text in iframes.
    *   CSP allows `wasm-unsafe-eval` for the LLM runtime.

*   **`sidepanel.html` / `sidepanel.js`**:
    *   **The Brain:** Hosts the `webllm.MLCEngine`.
    *   **State Management:** Handles model loading (`CreateMLCEngine`), auto-recovery from WebGPU context loss, and tab switching (Spellcheck vs. Page Chat).
    *   **Robustness:** Implements `safeEngineCall` wrapper to handle "Model not loaded" or "Object disposed" errors by automatically reloading the engine and retrying.
    *   **Spellcheck Logic:** 
        *   Uses "Few-Shot Prompting" (system + examples) to force strict JSON-like output behavior.
        *   Calculates `simple-diff` to highlight changes (Red/Green).
    *   **Chat Logic:** 
        *   Automatically fetches page text via `fetchPageText()` (messaging content script).
        *   Injects page text into the system prompt for Q&A.

*   **`content.js`**:
    *   **Text Replacement:** Tracks `lastActiveElement` across `focus`, `click`, and `input` events.
    *   **Smart Fallback:** If the active element is lost, checks `window.getSelection()` to find the editable node.
    *   **Page Reading:** Handles `get_page_content` message to return `document.body.innerText` (truncated to ~15k chars).

*   **`background.js`**:
    *   Service Worker.
    *   Handles Context Menu click ("Local AI Spell Checker") -> Opens Side Panel -> Sends selected text.

## Features & Workflows

### 1. Spell Check
*   **Trigger:** Context Menu or Manual Input.
*   **Processing:**
    *   `generateText()` calls the LLM with a strict prompt.
    *   Result is cleaned up (regex to remove preambles/explanations).
    *   `diffWords()` computes a word-level diff.
*   **Output:** Visual HTML diff.
*   **Action:** "Replace Selection" button sends the fixed text to `content.js` to update the DOM element.

### 2. Page Chat
*   **Trigger:** "Page Chat" tab in Side Panel.
*   **Context:** Automatically reads current tab content on every message send.
*   **Interaction:** User asks question -> System prompt includes page context -> AI responds.

### 3. Reliability System
*   **Auto-Recovery:** If WebGPU crashes ("Context Lost"), the panel automatically attempts to reload itself or the model.
*   **Retry Logic:** `safeEngineCall` catches disposal errors, re-inits the engine, and retries the prompt seamlessly.

## Setup & Installation
See `README.md` for user-facing instructions.

### Development Notes
*   **Models:** Stored in Browser Cache (Cache API) and `localStorage` tracks downloads.
*   **Debugging:** Use `Right-Click Panel -> Inspect` to see console logs for raw LLM output and errors.