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

    status.textContent = response.isProblemPage
      ? `Connected to a LeetCode problem · v${response.version}`
      : "Open a LeetCode problem, then check again.";
  } catch {
    status.textContent = "Open a problem on leetcode.com and refresh the page, then check again.";
  } finally {
    checkButton.disabled = false;
  }
}

checkButton.addEventListener("click", checkConnection);
checkConnection();
