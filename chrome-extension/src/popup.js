'use strict';

var displaySwitch = document.getElementById("currentPageProcessingSwitch");
var onetimeSwitch = document.getElementById("oneTimeProcessingSwitch");

chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {"subject": "currentPageStatus"}, (response) => {
    onetimeSwitch.checked = !response.disabled;
  });

  chrome.tabs.sendMessage(tabs[0].id, {"subject": "getConnectionStatus"}, (response) => {
    if (response.connected) {
      let status = document.getElementById("connection-status");
      status.innerText = "Connected to the app";
      status.style.color = "green";
    }
  });

  chrome.storage.sync.get(tabs[0].url.split('/')[2]).then((result) => {
    displaySwitch.checked = result[tabs[0].url.split('/')[2]] ?? true

    displaySwitch.addEventListener('change', (e) => {
      chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {"subject": "changeDisplay", "value": e.target.checked});
        let toSave = {};
        toSave[tabs[0].url.split('/')[2]] = e.target.checked;
        chrome.storage.sync.set(toSave).then(() => {
          chrome.tabs.sendMessage(tabs[0].id, {"subject": "currentPageStatus"}, (response) => {
            onetimeSwitch.checked = !response.disabled;
          });
        });
      });
    });

    onetimeSwitch.addEventListener('change', (e) => {
      chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {"subject": "changeDisplay", "value": e.target.checked});
      });
    });
  });
});