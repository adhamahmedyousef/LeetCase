"use strict";

const colorModeInput = document.getElementById("color-mode");
const enabledInput = document.getElementById("extension-enabled");
const enabledState = document.getElementById("enabled-state");
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
function applyEnabled(enabled) {
  enabledInput.checked = enabled;
  enabledState.textContent = enabled ? "On" : "Off";
  document.body.dataset.enabled = String(enabled);
}
settings.ready.then(() => {
  applyColorMode(settings.colorMode);
  applyEnabled(settings.enabled);
  colorModeInput.disabled = false;
  enabledInput.disabled = false;
}).catch(() => { settingStatus.textContent = "Couldn't load settings. Reopen LeetCase to retry."; });
settings.subscribe(applyColorMode);
settings.subscribeEnabled(applyEnabled);
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
enabledInput.addEventListener("change", async () => {
  enabledInput.disabled = true;
  clearTimeout(statusTimer);
  try {
    await settings.setEnabled(enabledInput.checked);
    applyEnabled(settings.enabled);
    settingStatus.textContent = "Saved";
    statusTimer = setTimeout(() => { settingStatus.textContent = ""; }, 1500);
  } catch {
    applyEnabled(settings.enabled);
    settingStatus.textContent = "Couldn't save. Please try again.";
  } finally { enabledInput.disabled = false; }
});
