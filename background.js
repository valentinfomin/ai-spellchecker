chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.contextMenus.create({
    id: "fix-text",
    title: "Local AI Spell Checker",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fix-text") {
    // Save text for side panel
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
        // Open Side Panel
        chrome.sidePanel.open({ tabId: tab.id });
    });
  }
});
