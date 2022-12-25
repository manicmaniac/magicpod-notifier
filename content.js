const testCase = {
  owner: document.querySelector('.breadcrumb>.owner').innerText.trim(),
  project: document.querySelector('.breadcrumb>.project').innerText,
  name: document.querySelector('.breadcrumb>.testcase').innerText
}

const headerObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (window.getComputedStyle(entry.target).display.includes('none')) {
      continue;
    }
    const currentDevice = document.getElementById('current_batch_run_setting').textContent;
    chrome.runtime.sendMessage({
      testCase,
      type: 'connected',
      device: currentDevice,
    });
  }
}, {root: document.getElementById('header')});

headerObserver.observe(document.querySelector('.terminate-device-link[data-action="connect-device"]'));

const executionObserver = new MutationObserver((entries, observer) => {
  for (const entry of entries) {
    // Since `entry.target.classList` may be changed multiple times, check the old value in order to avoid double-submitting.
    if (!entry.oldValue.includes('executing')) {
      continue;
    }
    if (entry.target.classList.contains('exec-success')) {
      chrome.runtime.sendMessage({
        testCase,
        type: 'executed',
        success: true,
      });
    } else if (entry.target.classList.contains('exec-fail')) {
      chrome.runtime.sendMessage({
        testCase,
        type: 'executed',
        success: false,
      });
    }
    // Does nothing on `exec-abort` nor `exec-unresolved`.
  }
});

executionObserver.observe(document.getElementById('exec_test'), {
  attributes: true,
  attributeFilter: ['class'],
  attributeOldValue: true
});
