"use strict";

const status = document.getElementById("status");
const checkButton = document.getElementById("check");

async function checkConnection() {
  checkButton.disabled = true;
  status.textContent = "Checking the active tab…";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!Number.isInteger(tab?.id)) throw new Error("No active tab");

    const response = await chrome.tabs.sendMessage(tab.id, { type: "LEETCASE_PING" });
    if (response?.type !== "LEETCASE_PONG") throw new Error("Unexpected response");

    if (!response.isProblemPage) status.textContent = "Open a LeetCode problem, then check again.";
    else if (response.language && response.language !== "C++") {
      status.textContent = `Connected · ${response.language} selected. Formatting currently supports C++ only.`;
    } else status.textContent = `Connected to a LeetCode problem · v${response.version}`;
  } catch {
    status.textContent = "Open a problem on leetcode.com and refresh the page, then check again.";
  } finally {
    checkButton.disabled = false;
  }
}

checkButton.addEventListener("click", checkConnection);
checkConnection();

const colorModeInput = document.getElementById("color-mode");
const settingStatus = document.getElementById("setting-status");
const settings = globalThis.LeetCase.settings;
settings.ready.then(() => {
  colorModeInput.checked = settings.colorMode;
  colorModeInput.disabled = false;
}).catch(() => { settingStatus.textContent = "Couldn't load settings. Reopen the extension to retry."; });
settings.subscribe(enabled => { colorModeInput.checked = enabled; });
colorModeInput.addEventListener("change", async () => {
  colorModeInput.disabled = true;
  try {
    await settings.setColorMode(colorModeInput.checked);
    settingStatus.textContent = "Saved";
  } catch {
    colorModeInput.checked = settings.colorMode;
    settingStatus.textContent = "Couldn't save. Please try again.";
  } finally { colorModeInput.disabled = false; }
});
