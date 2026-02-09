# Local AI Project Architecture

## Project Overview
**Local AI** is a privacy-first suite consisting of a Chrome Extension (Manifest V3) and a landing page. It performs Large Language Model (LLM) inference **locally in the browser** using **WebGPU**, providing high-performance text correction and RAG-based page analysis.

## Repository Structure

### 📁 `extension/` (Main Application)
*   **`manifest.json`**: Configures `sidePanel` and `activeTab`. Uses `scripting` API for on-demand code injection instead of broad content script matching.
*   **`sidepanel.js`**: Orchestrates the **WebLLM** engine, tab switching, and state management.
*   **`background.js`**: Listens for context menu clicks and programmatically injects `content.js` to the active tab.
*   **`content.js`**: Injected script that extracts `innerText` for chat and performs DOM manipulation for text replacement.
*   **`simple-diff.js`**: Implementation of the Longest Common Subsequence (LCS) algorithm for word-level visual diffing.
*   **`web-llm.js`**: Bundled runtime for MLC-LLM inference.

### 📁 `landing-page/` (Website)
*   **`public/`**: Static hosting folder containing `index.html`, `support.html`, and `privacypolicy.html`.
*   **`src/index.js`**: Cloudflare Worker script that serves the static assets.
*   **`wrangler.toml`**: Deployment configuration for `localai.alert24.org`.

### 📁 `marketing/` (Store Assets)
*   **`screenshots/`**: High-resolution PNGs of the interface.
*   **`promo_art/`**: Specialized tiles for the Chrome Web Store listing.

## Technical Implementation

### 1. Security & Permissions
The project implements the **Principle of Least Privilege**:
*   **No `<all_urls>`:** The extension cannot see website data until the user interacts with it.
*   **`activeTab` + `scripting`:** Scripts are injected only into the tab the user is actively correcting.
*   **Local-Only:** No data is transmitted to external servers.

### 2. LLM Prompt Engineering
*   **Few-Shot Learning:** Uses example pairs (Input -> Fixed) in the system prompt to force the model into a deterministic, non-conversational "Correction Only" mode.
*   **Smart Cleanup:** Post-processing regex removes AI-generated preambles ("Here is the text...") and markdown markers.

### 3. Reliability System
*   **Auto-Recovery:** Detects `Object disposed` or `Context lost` errors. It automatically triggers an engine re-initialization and retries the user's request.
*   **Safe Wrapper:** `safeEngineCall` acts as a middleman for all LLM calls, managing the engine's lifecycle transparently.
*   **Hardware Compatibility Engine:** Detects supported WebGPU features (e.g., `shader-f16`) and filters the model list to prevent runtime crashes. Includes heuristics for models with incomplete metadata.
*   **Advanced Permission Handling:** Resolves "Hidden URL" roadblocks by offering "All Sites" access as a fail-safe, ensuring functionality on restricted pages.

## Deployment
*   **Plugin:** Uploaded to Chrome Web Store via ZIP.
*   **Web:** Deployed to Cloudflare Edge at **https://localai.alert24.org**.