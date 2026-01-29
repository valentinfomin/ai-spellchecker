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

    if (autoLoad) {
        modelSelect.value = autoLoad;
        loadModel(); 
    } else {
        runBtn.disabled = false;
        runBtn.onclick = loadModel; // Attach listener
        status.innerText = "Ready to load model.";
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
        try { await engine.unload(); } catch (e) {}
        engine = null;
    }

    const selectedModel = modelSelect.value;
    runBtn.disabled = true;
    status.innerText = `🚀 Initializing GPU...`;

    try {
        // Use CreateMLCEngine factory (better lifecycle management)
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
        runBtn.style.display = "none"; // Hide button after loading
        
        // Auto-trigger when typing
        let debounceTimer;
        promptInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (engine) generateText();
            }, 800);
        });

        checkStoredText();
    } catch (e) {
        console.error("Load Model Error:", e);
        engine = null;
        runBtn.disabled = false;
        
        let errorMsg = e.message;
        if (errorMsg.includes("Instance reference")) errorMsg = "WebGPU Context Lost. Reload panel.";
        status.innerText = `❌ ${errorMsg}`;
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
                { role: "system", content: "You are a professional editor. Your goal is to fix grammar, spelling, and tenses in the user's text. Keep the original meaning and tone. Do not change pronouns. Output ONLY the corrected text." },
                { role: "user", content: `Correct the grammar and tenses in this text:\n\n${text}` }
            ],
            max_tokens: dynamicMaxTokens,
            temperature: 0.1
        });

        console.log("Raw Reply:", reply);
        let result = reply.choices[0].message.content.trim();
        console.log("Content:", result);

        // Clean up markdown code blocks if present
        result = result.replace(/^```(text|markdown)?\n/i, "").replace(/\n```$/, "");

        // Clean up common preambles
        result = result.replace(/^(Here is the (corrected|rewritten|formal|concise) (text|version)|Sure, here is):?\s*/i, "")
                       .replace(/^["']|["']$/g, "").trim();

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
