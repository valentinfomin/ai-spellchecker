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
let currentStyle = "grammar"; // Default style

// Style Button Logic
document.querySelectorAll('.style-btn').forEach(btn => {
    btn.onclick = () => {
        // Reset all buttons
        document.querySelectorAll('.style-btn').forEach(b => {
            b.classList.remove('selected');
            b.style.background = '#ddd';
            b.style.color = 'black';
        });
        // Select clicked button
        btn.classList.add('selected');
        btn.style.background = '#007bff';
        btn.style.color = 'white';
        currentStyle = btn.getAttribute('data-value');
    };
});

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
        status.innerHTML = "❌ WebGPU is not supported in this browser.<br>Try updating Chrome or checking 'chrome://gpu'.";
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
        runBtn.innerText = "Fix Text";
        runBtn.onclick = generateText;
        runBtn.disabled = false;
        checkStoredText();
    } catch (e) {
        console.error("Load Model Error:", e);
        engine = null;
        runBtn.disabled = false;
        
        let errorMsg = e.message;
        if (errorMsg.includes("Instance reference")) errorMsg = "WebGPU Context Lost.";

        status.innerHTML = `❌ ${errorMsg} <br>
            <button id="retryLoadBtn" style="margin:5px 0; padding:4px 8px;">Reload Panel</button>
            <button id="hardResetBtn" style="margin:5px 0; padding:4px 8px; background:#f88; border:1px solid #c00;">Hard Reset</button>`;
        
        setTimeout(() => {
            document.getElementById("retryLoadBtn").onclick = () => location.reload();
            document.getElementById("hardResetBtn").onclick = async () => {
                if (confirm("This will delete all downloaded models and reset the extension. Continue?")) {
                    localStorage.clear();
                    // Try to clear Cache API (where models are stored)
                    const keys = await caches.keys();
                    for (const key of keys) await caches.delete(key);
                    location.reload();
                }
            };
        }, 0);
    }
}

async function generateText() {
    const text = promptInput.value.trim();
    if (!text || !engine) return;

    runBtn.disabled = true;
    replaceBtn.style.display = "none"; // Hide previous button
    output.style.display = "block";
    output.innerText = "Analyzing...";

    // Determine System Prompt based on Style
    const style = currentStyle;
    let systemPrompt = "You are a professional editor. Output ONLY the corrected text.";
    let userPrompt = `Correct the grammar and tenses in this text:\n\n${text}`;

    if (style === "formal") {
        systemPrompt = "You are a professional business editor. Rewrite the text to be more formal, professional, and polite. Keep the core meaning. Output ONLY the rewritten text.";
        userPrompt = `Rewrite this text to be formal:\n\n${text}`;
    } else if (style === "friendly") {
        systemPrompt = "You are a friendly editor. Rewrite the text to be casual, warm, and approachable. Keep the core meaning. Output ONLY the rewritten text.";
        userPrompt = `Rewrite this text to be friendly:\n\n${text}`;
    } else if (style === "concise") {
        systemPrompt = "You are a concise editor. Shorten the text, removing unnecessary words while keeping the meaning. Output ONLY the shortened text.";
        userPrompt = `Make this text concise:\n\n${text}`;
    }

    try {
        const dynamicMaxTokens = Math.max(128, Math.ceil(text.length / 1.5));

        const reply = await engine.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: dynamicMaxTokens,
            temperature: 0.3 // Slightly higher for styles
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
