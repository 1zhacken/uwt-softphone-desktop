'use strict';

var callSvgUrl = '';
var currently_observed = [];
var oldHref = "";
var disabled = false;
var io;
var socket;

const notAllowedToBeClickable = ["BUTTON", "INPUT", "A"];

chrome.storage.sync.get(window.location.href.split('/')[2])
    .then((result) => {
        var enabled = result[window.location.href.split('/')[2]] ?? true;
        disabled = !enabled;
        main();
    });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.subject == "changeDisplay") {
        disabled = !request.value;
        if (disabled) clearClickToDial();
        else enableClickToDial();
    }

    if (request.subject == "currentPageStatus") {
        sendResponse({disabled: disabled});
    }

    if (request.subject == "getConnectionStatus") {
        sendResponse({connected: socket ? socket.connected : false})
    }
});

chrome.runtime.sendMessage({
    type: "getCallSvgURL"
}, (response) => {
    callSvgUrl = response.url;
});

chrome.runtime.sendMessage({
    type: "getStyleURL"
}, (response) => {
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = response.url;
    document.head.appendChild(style);
});

var main = () => {
    const observer = new MutationObserver((mutations) => {
        if (oldHref != window.location.href) {
            currently_observed = [];
            oldHref = window.location.href;
        } 
        if (!disabled) enableClickToDial();
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
    });
    
    io = require("socket.io-client");
    socket;
    
    try {
        socket = io("http://localhost:4867", {
            withCredentials: false,
            reconnection: true,
            reconnectionDelay: 3000,
            reconnectionDelayMax: 10000,
        });
    }
    catch (e) {}
    
    socket.on('connect', () => {
        setTimeout(() => {
            if (!disabled) enableClickToDial();
        }, 3000);
    });
    
    socket.on('disconnect', () => {
        clearClickToDial();
    });
}

var enableClickToDial = () => {
    let phoneRE = /[\+][0-9]{1,4}[-\s]?[(]?[0-9]{1,4}[)]?([-\s]?[0-9]{2,4}){1,5}/g; // /([\+][0-9]{1,4})?[-\s]?[(]?[0-9]{1,3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}/g;
    let found = uniq(document.body.innerText.match(phoneRE));
    let toUpdate;
    try {
        toUpdate = found.filter(x => !currently_observed.includes(x));
    }
    catch (e) {
        toUpdate = [];
    }
    toUpdate.forEach((phone) => {
        highlightWord(document.body, phone);
    });
    currently_observed += toUpdate;
}

var clearClickToDial = () => {
    currently_observed = [];
    oldHref = "";

    var elements = document.getElementsByClassName("gcfctd-call-button");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    elements = document.getElementsByClassName("gcfctd-container");
    while(elements.length > 0){
        elements[0].classList.remove("gcfctd-container");
    }
}

var uniq = (a) => {
    if (Array.isArray(a))
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

var highlightWord = (root,word) => {
    var textNodesUnder = (root) => {
      var walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),
          text=[], node;
      while(node=walk.nextNode()) text.push(node);
      return text;
    }
      
    var highlightWords = (n) => {
        for (var i; (i=n.nodeValue.indexOf(word,i)) > -1; n=after){
            var after = n.splitText(i+word.length);
            var phoneNumber = n.splitText(i);
            var container = document.createElement('div');
            container.className = "gcfctd-container"

            var callIcon = document.createElement('img');
            callIcon.className = "gcfctd-call-button";
            callIcon.src = callSvgUrl;
            callIcon.title = "Call with GCF Softphone"

            if (!(notAllowedToBeClickable.includes(n.parentNode.tagName))){
                container.onclick = (e) => {
                    if (socket) socket.emit('callTo', {target: word.replace(/[^0-9+]/g, '')});
                }
                container.style.cursor = "pointer";
            }
            else {
                callIcon.onclick = (e) => {
                    if (socket) socket.emit('callTo', {target: word.replace(/[^0-9+]/g, '')});
                }
            }
            
            container.appendChild(phoneNumber);
            container.appendChild(callIcon);
            after.parentNode.insertBefore(container,after);
        }
        }

    if (socket.connected) textNodesUnder(root).forEach(highlightWords);
}