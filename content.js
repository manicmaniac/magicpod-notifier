const script = document.createElement('script');
script.src = chrome.runtime.getURL('script.js');
script.dataset.extensionId = chrome.runtime.id;
script.onload = function() { this.remove(); };
document.head.append(script);
