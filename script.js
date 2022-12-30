(function() {
  'use strict';

  const extensionId = document.currentScript.dataset.extensionId;
  const testCase = {
    owner: document.querySelector('.breadcrumb>.owner').innerText.trimEnd(),
    project: document.querySelector('.breadcrumb>.project').innerText,
    name: document.querySelector('.breadcrumb>.testcase.current').innerText
  };

  // The top-level local variable `webSocket` should be already defined by the website.
  // Since there's no general way to get existing web sockets with Chrome extension API nor DOM API,
  // this extension depends on `webSocket` variable's existence.
  let testCaseWebSocket;
  try {
    testCaseWebSocket = webSocket;
  } catch (error) {
    if (error instanceof ReferenceError) {
      console.error(error);
    } else {
      throw error;
    }
  }
  testCaseWebSocket?.addEventListener('message', e => {
    const data = JSON.parse(e.data);
    if (data.type === 'notify_test_run_result') {
      switch (data.status) {
        case 2: // succeeded
          chrome.runtime.sendMessage(extensionId, {
            type: 'executed',
            success: true,
            testCase
          });
          break;
        case 3: // failed
          chrome.runtime.sendMessage(extensionId, {
            type: 'executed',
            success: false,
            testCase
          });
          break;
      }
    }
  });

  const channel = new BroadcastChannel(location.origin + '/simulator/channel/');
  channel.addEventListener('message', e => {
    if (e.data.data.data.event === '_device_connected_') {
      chrome.runtime.sendMessage(extensionId, {
        type: 'connected',
        device: document.getElementById('current_batch_run_setting').innerText
      });
    }
  });
})();
