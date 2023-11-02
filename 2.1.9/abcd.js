chrome.tabs.update({url}, tab => {
  chrome.tabs.onUpdated.addListener(function onUpdated(tabId, change, updatedTab) {
    if (tabId === tab.id && change.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.executeScript(tab.id, {
        code: 'document.documentElement.innerHTML',
      }, results => {
        searchDOM(results[0]);
      });
    }
  });
});
