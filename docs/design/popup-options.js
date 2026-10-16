// Prototype-only preference. The installed extension's chrome.storage is untouched.
const toggles = [...document.querySelectorAll('.color-mode')];
const key = 'leetcaseDesignPreviewColorMode';
function apply(enabled) {
  document.body.dataset.colorMode = String(enabled);
  toggles.forEach(toggle => { toggle.checked = enabled; });
}
let enabled = true;
try { enabled = localStorage.getItem(key) !== 'false'; } catch { /* Preview works without storage. */ }
apply(enabled);
toggles.forEach(toggle => toggle.addEventListener('change', () => {
  apply(toggle.checked);
  try { localStorage.setItem(key, String(toggle.checked)); } catch { /* Preview only. */ }
}));
