// Local visual QA only. Not shipped in the extension. Does not touch real settings.
const popupPreviewListeners = new Set();
globalThis.chrome = { storage: {
  onChanged: { addListener: callback => popupPreviewListeners.add(callback) },
  local: {
    async get(key) { return { [key]: JSON.parse(localStorage.getItem(`leetcasePopupPreview:${key}`) ?? 'false') }; },
    async set(values) {
      for (const [key, value] of Object.entries(values)) {
        localStorage.setItem(`leetcasePopupPreview:${key}`, JSON.stringify(value));
        for (const callback of popupPreviewListeners) callback({ [key]: { newValue: value } }, 'local');
      }
    },
  },
} };
