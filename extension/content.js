// Stage 1: respond to the popup without reading or changing testcase data.
(() => {
  "use strict";

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "LEETCASE_PING") return;

    sendResponse({
      type: "LEETCASE_PONG",
      version: chrome.runtime.getManifest().version,
      isProblemPage: /^\/problems\/[^/]+(?:\/|$)/.test(location.pathname),
    });
  });
})();
