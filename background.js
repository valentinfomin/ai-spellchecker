chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.contextMenus.create({
    id: "fix-text",
    title: "Fix Text (AI)",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fix-text") {
    // Сохраняем текст для сайдбара
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
        // Открываем Side Panel
        chrome.sidePanel.open({ tabId: tab.id });
    });
  }
});
