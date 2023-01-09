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

chrome.notifications.onClicked.addListener(notificationId => {
  chrome.storage.local.get(notificationId, items => {
    chrome.storage.local.remove(notificationId);
    const tabId = items[notificationId];
    if (tabId != null) {
      chrome.tabs.get(tabId)
        .then(tab => chrome.windows.update(tab.windowId, {focused: true}))
        .then(_window => chrome.tabs.update(tabId, {active: true}));
    }
    chrome.notifications.clear(notificationId);
  });
});

chrome.notifications.onClosed.addListener(notificationId => {
  chrome.storage.local.remove(notificationId);
});
