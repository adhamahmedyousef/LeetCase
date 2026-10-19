"use strict";

const colorModeInput = document.getElementById("color-mode");
const enabledInput = document.getElementById("extension-enabled");
const enabledState = document.getElementById("enabled-state");
const uniqueNamesInput = document.getElementById("unique-names");
const settingStatus = document.getElementById("setting-status");
const settings = globalThis.LeetCase.settings;
const preview = document.getElementById("code-preview");
// This is an illustrative input, not the user's solution or testcase data.
function renderPreview(unique = false) {
  preview.replaceChildren();
  const example = unique ? "vector<int> nums = {1, 2, 3};\nvector<int> nums1 = {1, 2, 3, 4};" : "vector<int> nums = {\n    1, 2, 3\n};";
  for (const token of globalThis.LeetCase.highlight.tokenize(example)) {
    const span = document.createElement("span");
    span.className = `token-${token.kind}`;
    span.textContent = token.text;
    preview.append(span);
  }
}
renderPreview();
function applyUniqueNames(value) {
  uniqueNamesInput.checked = value;
  renderPreview(value);
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
  applyUniqueNames(settings.uniqueNames);
  colorModeInput.disabled = false;
  enabledInput.disabled = false;
  uniqueNamesInput.disabled = false;
}).catch(() => { settingStatus.textContent = "Couldn't load settings. Reopen LeetCase to retry."; });
settings.subscribe(applyColorMode);
settings.subscribeEnabled(applyEnabled);
settings.subscribeUniqueNames(applyUniqueNames);
uniqueNamesInput.addEventListener("change", async () => {
  uniqueNamesInput.disabled = true;
  try {
    await settings.setUniqueNames(uniqueNamesInput.checked);
    applyUniqueNames(settings.uniqueNames);
    settingStatus.textContent = "";
  } catch {
    applyUniqueNames(settings.uniqueNames);
    settingStatus.textContent = "Couldn't save. Please try again.";
  } finally { uniqueNamesInput.disabled = false; }
});
colorModeInput.addEventListener("change", async () => {
  colorModeInput.disabled = true;
  try {
    await settings.setColorMode(colorModeInput.checked);
    applyColorMode(settings.colorMode);
    settingStatus.textContent = "";
  } catch {
    applyColorMode(settings.colorMode);
    settingStatus.textContent = "Couldn't save. Please try again.";
  } finally { colorModeInput.disabled = false; }
});
enabledInput.addEventListener("change", async () => {
  enabledInput.disabled = true;
  try {
    await settings.setEnabled(enabledInput.checked);
    applyEnabled(settings.enabled);
    settingStatus.textContent = "";
  } catch {
    applyEnabled(settings.enabled);
    settingStatus.textContent = "Couldn't save. Please try again.";
  } finally { enabledInput.disabled = false; }
});
