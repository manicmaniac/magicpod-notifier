function sendNotification(message, tab) {
  const options = {
    title: 'MagicPod',
    type: 'basic',
    iconUrl: tab.favIconUrl,
    message
  };
  chrome.notifications.create(options, notificationId => {
    chrome.storage.local.set({[notificationId]: tab.id});
  });
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'connected':
      sendNotification(
        `Successfully connected to ${message.device}`,
        sender.tab
      );
      break;
    case 'executed':
      sendNotification(
        `${message.testCase.owner}/${message.testCase.project}#${message.testCase.name} ${message.success ? 'succeeded' : 'failed'}.`,
        sender.tab
      );
      break;
  }
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  try {
    const items = await chrome.storage.local.get(notificationId);
    const tabId = items[notificationId];
    if (tabId != null) {
      const tab = await chrome.tabs.get(tabId);
      await chrome.windows.update(tab.windowId, {focused: true});
      await chrome.tabs.update(tabId, {active: true});
    }
  } finally {
    await chrome.notifications.clear(notificationId);
  }
});

chrome.notifications.onClosed.addListener(notificationId => {
  chrome.storage.local.remove(notificationId);
});
