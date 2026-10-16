(() => {
  "use strict";
  const key = "leetcaseColorMode";
  const listeners = new Set();
  let colorMode = false;
  let revision = 0;
  function update(value) {
    if (colorMode === value) return;
    colorMode = value;
    for (const listener of listeners) listener(colorMode);
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[key]) { revision++; update(changes[key].newValue === true); }
  });
  const initialRevision = revision;
  const ready = chrome.storage.local.get(key).then(values => {
    if (revision === initialRevision) update(values[key] === true);
  });
  globalThis.LeetCase.settings = Object.freeze({
    ready,
    get colorMode() { return colorMode; },
    async setColorMode(enabled) {
      await chrome.storage.local.set({ [key]: enabled === true });
      revision++;
      update(enabled === true);
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  });
})();
