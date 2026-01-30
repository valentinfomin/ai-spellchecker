import * as webllm from "./web-llm.js";
import { diffWords } from "./simple-diff.js";

const status = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const modelSelect = document.getElementById("modelSelect");
const promptInput = document.getElementById("prompt"); // Spellcheck input
const output = document.getElementById("output");
const replaceBtn = document.getElementById("replaceBtn");

// Chat Elements
const chatHistory = document.getElementById("chat-history");
const chatInput = document.getElementById("chat-input");
const summarizeBtn = document.getElementById("summarizeBtn");
const chatSendBtn = document.getElementById("chatSendBtn");

let engine = null;
let lastResult = ""; 
let pageContext = ""; // Stores the current page text

async function getDownloadedModels() {
    return JSON.parse(localStorage.getItem("downloaded_params") || "[]");
}

async function initApp() {
    // Tab Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        };
    });

    // Chat Logic
    summarizeBtn.onclick = () => sendChatMessage("Summarize this page in 3 bullet points.", true);
    chatSendBtn.onclick = () => {
        const text = chatInput.value.trim();
        if (text) {
            sendChatMessage(text);
            chatInput.value = "";
        }
    };

    const downloaded = await getDownloadedModels();
    const modelList = webllm.prebuiltAppConfig.model_list.map(m => m.model_id);
    modelSelect.innerHTML = "";
    let autoLoad = null;

    modelList.forEach(modelId => {
        const option = document.createElement("option");
        option.value = modelId;
        if (downloaded.includes(modelId)) {
            option.text = `💾 ${modelId}`;
            if (!autoLoad) autoLoad = modelId;
        } else {
            option.text = modelId;
        }
        modelSelect.appendChild(option);
    });

    const updateButtonText = () => {
        const isDownloaded = downloaded.includes(modelSelect.value);
        runBtn.innerText = isDownloaded ? "Load Model" : "Download & Load Model";
    };

    modelSelect.onchange = () => {
        runBtn.style.display = "block";
        runBtn.disabled = false;
        updateButtonText();
        status.innerText = "Ready to load.";
    };

    updateButtonText();
    
    // Always attach the listener
    runBtn.onclick = loadModel;

    if (autoLoad) {
        modelSelect.value = autoLoad;
        loadModel(); 
    } else {
        runBtn.disabled = false;
        status.innerText = "Select a model to start.";
    }

    // Attach Replace Button Listener
    replaceBtn.onclick = async () => {
        if (!lastResult) return;
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (tab) {
            // Ensure script is injected
            await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                files: ["content.js"]
            });
            chrome.tabs.sendMessage(tab.id, { action: "apply_fix", text: lastResult });
        }
    };
}

// Helper: Wrapper for AI calls to handle "Model not loaded" errors automatically
async function safeEngineCall(messages, max_tokens, temperature) {
    try {
        if (!engine) throw new Error("Model not loaded");
        return await engine.chat.completions.create({ messages, max_tokens, temperature });
    } catch (e) {
        const msg = (e.message || "").toLowerCase();
        if (msg.includes("model not loaded") || msg.includes("disposed") || msg.includes("instance reference")) {
            console.warn("Engine state invalid. Attempting auto-reload...", e);
            appendMessage("system", "⚠️ Connection lost. Reconnecting..."); // Feedback for chat users
            
            // Force reload
            await loadModel();
            if (!engine) throw new Error("Auto-reload failed.");

            // Retry once
            return await engine.chat.completions.create({ messages, max_tokens, temperature });
        }
        throw e;
    }
}

async function fetchPageText() {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab) return "";

        // Manually inject content script if not already there (required due to strict manifest)
        await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            files: ["content.js"]
        });

        const response = await chrome.tabs.sendMessage(tab.id, { action: "get_page_content" });
        return (response && response.content) ? response.content : "";
    } catch (e) {
        console.warn("Could not read page:", e);
        return "";
    }
}

function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `chat-msg msg-${role}`;
    div.innerText = text;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendChatMessage(userText, isSystemInstruction = false) {
    // Ensure engine is at least nominally present (safeEngineCall will fix if broken)
    if (!engine) {
        appendMessage("system", "⚠️ Model not ready. Auto-loading...");
        await loadModel();
        if (!engine) {
            appendMessage("system", "❌ Failed to load model. Please try manually.");
            return;
        }
    }
    
    // Always refresh context to ensure we are talking about the CURRENT page
    pageContext = await fetchPageText();
    
    if (!pageContext) {
        appendMessage("system", "⚠️ Could not read page content. (Try refreshing the page)");
        return;
    }

    appendMessage("user", userText);
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "chat-msg msg-ai";
    loadingMsg.innerText = "Thinking...";
    chatHistory.appendChild(loadingMsg);

    try {
        const reply = await safeEngineCall([
            { role: "system", content: "You are a helpful AI assistant. Answer the user's question based on the provided Page Context. If the answer is not in the context, say so." },
            { role: "user", content: `Page Context:\n${pageContext}\n\nQuestion: ${userText}` }
        ], 512, 0.3);

        const aiText = reply.choices[0].message.content.trim();
        chatHistory.removeChild(loadingMsg);
        appendMessage("ai", aiText);

    } catch (e) {
        chatHistory.removeChild(loadingMsg);
        appendMessage("system", "Error: " + e.message);
    }
}

async function loadModel() {
    // Check for WebGPU support first
    if (!navigator.gpu) {
        status.innerHTML = "❌ WebGPU is not supported.";
        return;
    }

    if (engine) {
        try { 
            // Attempt to unload nicely
            await engine.unload(); 
        } catch (e) {
            console.warn("Unload error (likely already disposed):", e);
        }
        engine = null; // Ensure it's cleared
    }

    const selectedModel = modelSelect.value;
    runBtn.disabled = true;
    status.innerText = `🚀 Initializing GPU...`;

    try {
        // Use CreateMLCEngine factory
        engine = await webllm.CreateMLCEngine(selectedModel, {
            initProgressCallback: (report) => {
                status.innerText = report.text;
            },
            low_resource_mode: true
        });
        
        let downloaded = await getDownloadedModels();
        if (!downloaded.includes(selectedModel)) {
            downloaded.push(selectedModel);
            localStorage.setItem("downloaded_params", JSON.stringify(downloaded));
        }
        status.innerText = `✅ Ready`;
        runBtn.style.display = "none";
        
        // Auto-trigger when typing
        let debounceTimer;
        promptInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (engine) generateText();
            }, 800);
        });

        checkStoredText();
        sessionStorage.removeItem("retry_count"); // Clear retry count on success

    } catch (e) {
        console.error("Load Model Error:", e);
        engine = null;
        runBtn.disabled = false;
        
        let errorMsg = e.message;
        if (errorMsg.includes("Instance reference") || errorMsg.includes("disposed") || errorMsg.includes("Context Lost")) {
             // Attempt auto-recovery once
             const retries = parseInt(sessionStorage.getItem("retry_count") || "0");
             if (retries < 1) {
                 status.innerText = "⚠️ GPU Context lost. Auto-recovering...";
                 sessionStorage.setItem("retry_count", retries + 1);
                 setTimeout(() => location.reload(), 500);
                 return;
             }
             
             errorMsg = "WebGPU Context Lost. <span id='manualReload' style='cursor:pointer; font-weight:bold;' title='Click to reload'>⟳</span>";
             sessionStorage.removeItem("retry_count"); // Reset for next time
        }
        status.innerHTML = `❌ ${errorMsg}`;
        
        const reloadIcon = document.getElementById('manualReload');
        if (reloadIcon) reloadIcon.onclick = () => location.reload();
    }
}

async function generateText() {
    const text = promptInput.value.trim();
    if (!text || !engine) return;

    runBtn.disabled = true;
    replaceBtn.style.display = "none"; // Hide previous button
    output.style.display = "block";
    output.innerText = "Analyzing...";

    try {
        const dynamicMaxTokens = Math.max(128, Math.ceil(text.length / 1.5));

        const reply = await safeEngineCall([
            { role: "system", content: "You are a specialized spellchecker. Fix all grammar, spelling, punctuation, and capitalization errors. Output ONLY the corrected text. Do NOT explain." },
            { role: "user", content: "Correct this text:\n\nello sword" },
            { role: "assistant", content: "Hello sword" },
            { "role": "user", "content": "Correct this text:\n\ni has a apple" },
            { "role": "assistant", "content": "I have an apple." },
            { role: "user", content: `Correct this text:\n\n${text}` }
        ], dynamicMaxTokens, 0.0);

        console.log("Raw Reply:", reply);
        let result = reply.choices[0].message.content.trim();
        console.log("Content:", result);

        // Clean up markdown code blocks
        result = result.replace(/^```(text|markdown)?\n/i, "").replace(/\n```$/, "");

        // Intelligent Cleanup:
        // 1. If result contains quotes and looks like: Here is the text: "Fixed Text", extract the quotes.
        // But be careful not to extract quotes IF the original text had quotes.
        const quoteMatch = result.match(/"([^"]+)"/);
        if (quoteMatch && result.length > text.length * 2) { 
             // If result is much longer than input, it likely contains explanations + quoted answer.
             // We take the quoted part.
             result = quoteMatch[1];
        }

        // 2. Remove known explanation patterns
        result = result.replace(/^(The text is|Here is|I have|I changed|Note:|Corrected:|Revised:).*/i, "")
                       .replace(/(\n|^)(I changed|I have|The text|Here is|Note:).*/gs, "") // Remove trailing explanations
                       .trim();

        if (!result) {
            output.innerHTML = "⚠️ Empty response. Try a different model or rephrase.";
            runBtn.disabled = false;
            return;
        }

        lastResult = result; // Store for the replace button

        try {
            const changes = diffWords(text, result);
            const html = changes.map(part => {
                const escaped = part.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                if (part.type === 'del') return `<span class="diff-del">${escaped}</span>`;
                if (part.type === 'ins') return `<span class="diff-ins">${escaped}</span>`;
                return escaped;
            }).join("");
            output.innerHTML = html;
        } catch (err) {
            console.error("Diff Error:", err);
            output.innerText = result;
        }

        // Show Replace Button
        replaceBtn.style.display = "block";

    } catch (e) {
        output.innerText = "Error: " + e.message;
    } finally {
        runBtn.disabled = false;
    }
}

async function checkStoredText() {
    const data = await chrome.storage.local.get(["selectedText"]);
    if (data.selectedText) {
        promptInput.value = data.selectedText;
        await chrome.storage.local.remove("selectedText");
        generateText();
    }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.selectedText && changes.selectedText.newValue) {
        promptInput.value = changes.selectedText.newValue;
        chrome.storage.local.remove("selectedText"); // Clear immediately to avoid re-triggering
        generateText();
    }
});

document.addEventListener('DOMContentLoaded', initApp);
