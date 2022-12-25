const tabsByNotificationId = new Map();

function sendNotification(message, tab) {
  const options = {
    title: 'MagicPod',
    type: 'basic',
    iconUrl: tab.favIconUrl,
    message
  };
  chrome.notifications.create(options, notificationId => {
    tabsByNotificationId.set(notificationId, tab);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  chrome.notifications.clear(notificationId);
  const tab = tabsByNotificationId.get(notificationId);
  if (tab == null) {
    return;
  }
  chrome.windows.update(tab.windowId, {focused: true});
  chrome.tabs.update(tab.id, {highlighted: true});
});

chrome.notifications.onClosed.addListener(notificationId => {
  tabsByNotificationId.delete(notificationId);
});
