/**
 * Content Script
 * Injected into webpages to handle text extraction and replacement.
 * Runs in an isolated context but has access to the DOM.
 */

let lastActiveElement = null;

// Track the last interacted element more aggressively.
// We need this because clicking the extension Side Panel steals focus from the webpage.
// By tracking 'input', 'click', 'focus', etc., we remember where the user was typing.
const updateLastActive = (e) => {
    if (e.target && e.target !== document.body && e.target !== document.documentElement) {
        lastActiveElement = e.target;
    }
};

['focus', 'click', 'input', 'mouseup', 'keyup'].forEach(evt => {
    document.addEventListener(evt, updateLastActive, true);
});

/**
 * Helper to check if an element is an editable text field.
 * Supports <input>, <textarea>, and contentEditable divs (like Gmail, Docs).
 */
function isEditable(el) {
    if (!el) return false;
    return (
        el.tagName === "TEXTAREA" || 
        el.tagName === "INPUT" || 
        el.isContentEditable || 
        el.contentEditable === "true"
    );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // === ACTION: REPLACE TEXT ===
  if (request.action === "apply_fix") {
    let target = lastActiveElement;

    // Strategy 1: Check the tracked 'lastActiveElement'
    // Strategy 2: If that fails, check the current 'window.getSelection()' 
    // (User might have highlighted text without clicking/focusing clearly)
    if (!isEditable(target)) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let node = selection.anchorNode;
            // Climb up from text node to element node
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
                node = node.parentNode;
            }
            if (isEditable(node)) {
                target = node;
            }
        }
    }
    
    // Strategy 3: Check document.activeElement as a final fallback
    if (!isEditable(target) && isEditable(document.activeElement)) {
        target = document.activeElement;
    }

    if (isEditable(target)) {
        // Apply the fix
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
            // Prefer setRangeText to preserve surrounding text if a selection exists
            if (typeof target.setRangeText === 'function') {
                target.setRangeText(request.text);
            } else {
                 target.value = request.text;
            }
        } else {
            // ContentEditable (Rich Text)
             const sel = window.getSelection();
             // Try to use execCommand 'insertText' which preserves undo history and formatting
             if (sel.rangeCount > 0 && sel.anchorNode && (target.contains(sel.anchorNode) || target === sel.anchorNode)) {
                 document.execCommand('insertText', false, request.text);
             } else {
                 target.innerText = request.text;
             }
        }
        
        // Visual Feedback: Flash the element green
        const originalTransition = target.style.transition;
        const originalBackground = target.style.backgroundColor;
        target.style.transition = "background-color 0.5s";
        target.style.backgroundColor = "#ccffcc";
        setTimeout(() => {
            target.style.backgroundColor = originalBackground;
            target.style.transition = originalTransition;
        }, 1000);

    } else {
        // Fallback: If absolutely no input field is found, copy to clipboard
        if (window === window.top) {
             if (document.getElementsByTagName('iframe').length === 0) {
                 navigator.clipboard.writeText(request.text);
             }
        }
    }
  } 
  // === ACTION: READ PAGE CONTENT ===
  else if (request.action === "get_page_content") {
      // Extract page text for AI analysis (Page Chat feature)
      // Limit to ~15k chars (approx 4k tokens) to prevent context overflow in small models
      let text = document.body.innerText || "";
      text = text.replace(/\s+/g, " ").trim().substring(0, 15000);
      sendResponse({ content: text });
  }
});
