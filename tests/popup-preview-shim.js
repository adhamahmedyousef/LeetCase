// Local visual QA only. Not shipped in the extension. Does not touch real settings.
const popupPreviewListeners = new Set();
const previewId = globalThis.leetcasePreviewId;
const previewPrefix = previewId ? `leetcasePopupPreview:${previewId}:` : 'leetcasePopupPreview:';
globalThis.chrome = { storage: {
  onChanged: { addListener: callback => popupPreviewListeners.add(callback) },
  local: {
    async get(key) {
      const stored = localStorage.getItem(`${previewPrefix}${key}`);
      return { [key]: stored === null ? (key === 'leetcaseEnabled' || !!previewId) : JSON.parse(stored) };
    },
    async set(values) {
      for (const [key, value] of Object.entries(values)) {
        localStorage.setItem(`${previewPrefix}${key}`, JSON.stringify(value));
        for (const callback of popupPreviewListeners) callback({ [key]: { newValue: value } }, 'local');
      }
    },
  },
} };
