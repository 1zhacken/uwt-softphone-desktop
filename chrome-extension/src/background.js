'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getCallSvgURL') {
    let url = chrome.runtime.getURL('call.svg');
    sendResponse({
      url: url
    });
  }
  
  if (request.type === 'getStyleURL') {
    let url = chrome.runtime.getURL('contentStyle.css');
    sendResponse({
      url: url
    });
  }
});
