let lastActiveElement = null;

// Track the last interacted element more aggressively
const updateLastActive = (e) => {
    if (e.target && e.target !== document.body && e.target !== document.documentElement) {
        lastActiveElement = e.target;
    }
};

['focus', 'click', 'input', 'mouseup', 'keyup'].forEach(evt => {
    document.addEventListener(evt, updateLastActive, true);
});

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
  if (request.action === "apply_fix") {
    let target = lastActiveElement;

    // Fallback: If lastActiveElement isn't editable, check current selection
    if (!isEditable(target)) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let node = selection.anchorNode;
            // Climb up from text node to element
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
                node = node.parentNode;
            }
            if (isEditable(node)) {
                target = node;
            }
        }
    }
    
    // Fallback: Check document.activeElement (sometimes valid even if tracker missed it)
    if (!isEditable(target) && isEditable(document.activeElement)) {
        target = document.activeElement;
    }

    if (isEditable(target)) {
        // Apply directly
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
            // For inputs, we might want to preserve cursor position or replace only selection?
            // Simple approach: Replace value (as per current logic). 
            // Better approach for inputs: Use setRangeText if selection exists, else replace all?
            // The prompt "Fix Text" usually implies replacing the whole context. 
            // But if user selected a substring, replacing WHOLE value is bad.
            // Let's stick to replacing the value for now as per original request, 
            // but ideally we should respect selection replacement.
            
            // Note: 'request.text' is the fixed version of the 'original text' sent.
            // If the user selected a PARTIAL text, 'request.text' is the fix for that PART.
            // So we should try to replace only the selection if possible.
            
            if (typeof target.setRangeText === 'function') {
                // This works for textarea and input
                // But we need to know the selection range. 
                // Since focus might be lost, the selection range might be lost in the element.
                // However, inputs usually keep selection state.
                target.setRangeText(request.text);
            } else {
                 target.value = request.text;
            }
        } else {
            // ContentEditable
             // If we have a selection range, try to replace it
             const sel = window.getSelection();
             if (sel.rangeCount > 0 && sel.anchorNode && (target.contains(sel.anchorNode) || target === sel.anchorNode)) {
                 document.execCommand('insertText', false, request.text);
             } else {
                 target.innerText = request.text;
             }
        }
        
        // Flash the element
        const originalTransition = target.style.transition;
        const originalBackground = target.style.backgroundColor;
        target.style.transition = "background-color 0.5s";
        target.style.backgroundColor = "#ccffcc";
        setTimeout(() => {
            target.style.backgroundColor = originalBackground;
            target.style.transition = originalTransition;
        }, 1000);

    } else {
        // Only alert/copy if top frame
        if (window === window.top) {
             if (document.getElementsByTagName('iframe').length === 0) {
                 // alert("Could not find text box. Copied to clipboard instead.");
                 navigator.clipboard.writeText(request.text);
             }
        }
    }
  }
});
