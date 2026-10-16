"use strict";

const colorModeInput = document.getElementById("color-mode");
const settingStatus = document.getElementById("setting-status");
const settings = globalThis.LeetCase.settings;
const preview = document.getElementById("code-preview");
// This is an illustrative input, not the user's solution or testcase data.
for (const token of globalThis.LeetCase.highlight.tokenize("vector<int> nums = {\n    1, 2, 3\n};")) {
  const span = document.createElement("span");
  span.className = `token-${token.kind}`;
  span.textContent = token.text;
  preview.append(span);
}
function applyColorMode(enabled) {
  colorModeInput.checked = enabled;
  document.body.dataset.colorMode = String(enabled);
}
settings.ready.then(() => {
  applyColorMode(settings.colorMode);
  colorModeInput.disabled = false;
}).catch(() => { settingStatus.textContent = "Couldn't load settings. Reopen LeetCase to retry."; });
settings.subscribe(applyColorMode);
let statusTimer;
colorModeInput.addEventListener("change", async () => {
  colorModeInput.disabled = true;
  clearTimeout(statusTimer);
  try {
    await settings.setColorMode(colorModeInput.checked);
    applyColorMode(settings.colorMode);
    settingStatus.textContent = "Saved";
    statusTimer = setTimeout(() => { settingStatus.textContent = ""; }, 1500);
  } catch {
    applyColorMode(settings.colorMode);
    settingStatus.textContent = "Couldn't save. Please try again.";
  } finally { colorModeInput.disabled = false; }
});
