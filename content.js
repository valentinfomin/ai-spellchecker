let lastActiveElement = null;

// Track the last interacted element
document.addEventListener('focus', (e) => { lastActiveElement = e.target; }, true);
document.addEventListener('click', (e) => { lastActiveElement = e.target; }, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "apply_fix") {
    // Prefer the explicitly tracked element, fallback to current activeElement
    const target = lastActiveElement || document.activeElement;

    if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.contentEditable === "true")) {
        // Apply directly without confirmation
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
          target.value = request.text;
        } else {
          target.innerText = request.text;
        }
        
        // Flash the element to indicate success
        const originalTransition = target.style.transition;
        const originalBackground = target.style.backgroundColor;
        target.style.transition = "background-color 0.5s";
        target.style.backgroundColor = "#ccffcc";
        setTimeout(() => {
            target.style.backgroundColor = originalBackground;
            target.style.transition = originalTransition;
        }, 1000);

    } else {
        // Fallback if no input field is found
        console.warn("No active input element found to replace text.");
        alert("Could not find text box. Copied to clipboard instead.");
        navigator.clipboard.writeText(request.text);
    }
  }
});
