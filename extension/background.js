/**
 * Background Service Worker
 * Handles browser events, context menus, and side panel interactions.
 */

chrome.runtime.onInstalled.addListener(() => {
  // Ensure the side panel opens when the extension icon is clicked
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  
  // Create the "Local AI Spell Checker" context menu item
  chrome.contextMenus.create({
    id: "fix-text",
    title: "Local AI Spell Checker",
    contexts: ["selection"]
  });
});

/**
 * Handle Context Menu Clicks
 * 1. Saves the selected text to chrome.storage.local (so the side panel can read it).
 * 2. Opens the Side Panel programmatically.
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fix-text") {
    // Save text for side panel to consume upon opening
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
        // Open Side Panel in the context of the current tab
        chrome.sidePanel.open({ tabId: tab.id });
    });
  }
});
