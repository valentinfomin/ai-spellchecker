# Local AI Project Overview

## Project Overview
**Local AI** is a privacy-first Chrome Extension (Manifest V3) and a corresponding landing page. It runs Large Language Models (LLMs) **locally in the browser** via **WebGPU**, providing spell/grammar checking and webpage chat/summarization without sending data to external servers.

### Key Components
*   **Extension:** The core browser plugin.
*   **Marketing:** Visual assets for the Chrome Web Store.
*   **Landing Page:** A Cloudflare Worker-based website (localai.alert24.org).

## Repository Structure
*   **`extension/`**: Core extension code.
    *   `manifest.json`: Configuration, permissions, and CSP.
    *   `sidepanel.html/js`: Persistent UI with LLM logic (WebLLM).
    *   `background.js`: Service worker for context menus and side panel triggers.
    *   `content.js`: Injected script for DOM text replacement and page reading.
    *   `simple-diff.js`: LCS-based text diffing for visual highlights.
    *   `web-llm.js`: Local LLM runtime library.
    *   `icons/`: Validated PNG icons for the extension.
*   **`marketing/`**: Store listing assets.
    *   `screenshots/`: 1280x800 PNGs showing the app in action.
    *   `promo_art/`: Small and Marquee promo tiles for the Web Store.
*   **`landing-page/`**: Cloudflare Worker project.
    *   `public/`: Static HTML, CSS, and internal assets (assets/).
    *   `wrangler.toml`: Deployment configuration for localai.alert24.org.

## Core Functionality

### 1. Local LLM Inference
Uses **WebLLM** and **WebGPU** to run 4-bit quantized models (e.g., Llama-3, Phi-3). Models are cached locally in the browser's Cache API.

### 2. Intelligent Spell Check
*   **UI:** Tabbed interface in the Chrome Side Panel.
*   **Prompting:** Uses "Few-Shot Prompting" to enforce strict output.
*   **Visuals:** Real-time word-level diffing (Red/Green) to show edits.
*   **Replacement:** One-click replacement in the active DOM element via `content.js`.

### 3. Page Chat & RAG
*   **Mechanism:** Automatically extracts current tab content (`innerText`) up to ~15k chars.
*   **Interface:** Chat-style interaction to ask questions about the page or request summaries.

## Reliability & Performance
*   **Auto-Recovery:** Detects WebGPU "Context Lost" errors and automatically reloads the panel/engine.
*   **Robust Wrapper:** `safeEngineCall` manages engine state, automatically re-initializing and retrying requests if the model is disposed or not loaded.
*   **Debounced Input:** Manual spellcheck triggers 800ms after the user stops typing to save GPU cycles.

## Deployment & Hosting
*   **Extension:** Packaged as a `.zip` for Chrome Web Store upload.
*   **Website:** Hosted on Cloudflare Workers at **https://localai.alert24.org/**, serving static assets from the `public/` folder.

## Setup & Maintenance
Refer to `README.md` for installation instructions.
For security, `.gitignore` is configured to exclude OS files, build artifacts, and potential secrets.
