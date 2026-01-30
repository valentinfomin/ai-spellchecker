import * as webllm from "./web-llm.js";
import { diffWords } from "./simple-diff.js";

const status = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const modelSelect = document.getElementById("modelSelect");
const promptInput = document.getElementById("prompt");
const output = document.getElementById("output");
const replaceBtn = document.getElementById("replaceBtn");

let engine = null;
let lastResult = ""; // Store the last generated text

async function getDownloadedModels() {
    return JSON.parse(localStorage.getItem("downloaded_params") || "[]");
}

async function initApp() {
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
            chrome.tabs.sendMessage(tab.id, { action: "apply_fix", text: lastResult });
        }
    };
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

        const reply = await engine.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional editor. Your goal is to fix grammar, spelling, and tenses in the user's text. Keep the original meaning and tone. Do not change pronouns. Output ONLY the corrected text. Do NOT explain your changes. Do NOT provide a list of edits." },
                { role: "user", content: `Correct the grammar and tenses in this text:\n\n${text}` }
            ],
            max_tokens: dynamicMaxTokens,
            temperature: 0.0
        });

        console.log("Raw Reply:", reply);
        let result = reply.choices[0].message.content.trim();
        console.log("Content:", result);

        // Clean up markdown code blocks
        result = result.replace(/^```(text|markdown)?\n/i, "").replace(/\n```$/, "");

        // Clean up preambles and POST-ambles (explanations at the end)
        // 1. Remove "Here is the corrected text" prefix
        result = result.replace(/^(Here is the (corrected|rewritten|formal|concise) (text|version)|Sure, here is):?\s*/i, "")
                       .replace(/^["']|["']$/g, "").trim();
        
        // 2. Remove "I made the following changes:" and everything after it
        const explanationIndex = result.search(/\n(I made the following changes|Changes made|Here are the changes):/i);
        if (explanationIndex !== -1) {
            result = result.substring(0, explanationIndex).trim();
        }

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
