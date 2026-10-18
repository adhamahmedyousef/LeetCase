(() => {
  "use strict";
  const colorModeKey = "leetcaseColorMode";
  const enabledKey = "leetcaseEnabled";
  const colorModeListeners = new Set();
  const enabledListeners = new Set();
  let colorMode = false;
  let enabled = true;
  let colorModeRevision = 0;
  let enabledRevision = 0;
  function updateColorMode(value) {
    if (colorMode === value) return;
    colorMode = value;
    for (const listener of colorModeListeners) listener(colorMode);
  }
  function updateEnabled(value) {
    if (enabled === value) return;
    enabled = value;
    for (const listener of enabledListeners) listener(enabled);
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[colorModeKey]) {
      colorModeRevision++;
      updateColorMode(changes[colorModeKey].newValue === true);
    }
    if (changes[enabledKey]) {
      enabledRevision++;
      updateEnabled(changes[enabledKey].newValue !== false);
    }
  });
  const initialColorModeRevision = colorModeRevision;
  const initialEnabledRevision = enabledRevision;
  const ready = Promise.all([
    chrome.storage.local.get(colorModeKey),
    chrome.storage.local.get(enabledKey),
  ]).then(([colorValues, enabledValues]) => {
    if (colorModeRevision === initialColorModeRevision) updateColorMode(colorValues[colorModeKey] === true);
    if (enabledRevision === initialEnabledRevision) updateEnabled(enabledValues[enabledKey] !== false);
  });
  globalThis.LeetCase.settings = Object.freeze({
    ready,
    get colorMode() { return colorMode; },
    get enabled() { return enabled; },
    async setColorMode(enabled) {
      await chrome.storage.local.set({ [colorModeKey]: enabled === true });
      colorModeRevision++;
      updateColorMode(enabled === true);
    },
    async setEnabled(value) {
      await chrome.storage.local.set({ [enabledKey]: value === true });
      enabledRevision++;
      updateEnabled(value === true);
    },
    subscribe(listener) { colorModeListeners.add(listener); return () => colorModeListeners.delete(listener); },
    subscribeEnabled(listener) { enabledListeners.add(listener); return () => enabledListeners.delete(listener); },
  });
})();
