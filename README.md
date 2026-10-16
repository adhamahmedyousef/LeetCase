# LeetCase (working name)

**Built by VoidHub.** An independent, MIT-licensed Chrome extension project.
Not affiliated with or endorsed by LeetCode.

## Current stage: Manifest V3 skeleton

This version only checks that the extension can communicate with a content
script on a LeetCode problem page. It does not read or change testcases,
detect editor language, format values, or copy anything yet.

No dependencies, build step, background worker, analytics, external requests,
or additional API permissions. Chrome grants the declared content script access
to matching LeetCode problem pages. The popup uses tab IDs to send a connection
message; it does not request browsing history or the `tabs` permission.

## Install locally

1. If using a ZIP, extract it first and keep the extracted folder.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `extension` folder containing `manifest.json`.
5. Open a problem such as https://leetcode.com/problems/two-sum/ and refresh it
   if it was already open before installation.
6. Open Chrome's Extensions menu and click **LeetCase — Built by VoidHub**.
7. Expect **Connected to a LeetCode problem · v0.1.0**.

On a different website, expect the instruction to open a LeetCode problem.
If a problem fails the connection check, refresh it and click **Check again**.
Verify that LeetCode's testcase editor and Run behavior still work as before.
Check the extension card for errors on `chrome://extensions`.

## Files

- `extension/manifest.json`: MV3 metadata, popup, and problem-page matching.
- `extension/content.js`: connection response only; no page modification.
- `extension/popup.html`, `popup.css`, `popup.js`: branding and connection status.
- `LICENSE`: MIT terms.
- `CONTRIBUTING.md`: pull request review policy.

After editing extension files, click **Reload** on its Chrome extensions card,
refresh the problem page, and reopen the popup. ZIP updates are manual: extract
the new version to a stable location and reload it (or load the new folder).

## Agreed next stages (awaiting approval)

1. One C++ `vector<int>` example, display-only, with a data-only Copy action.
2. Parse function parameter names/types and follow editor language and problem
   navigation; provide Original / Language format.
3. Expand structured parsing for empty/nested arrays, strings and escaping.
   Handle `TreeNode` and `ListNode` separately instead of treating them as vectors.
4. Add Python, then JavaScript.

Only proceed one stage at a time after local review. This skeleton does not
implement the next stages.

## Publication

Repository: https://github.com/adhamahmedyousef/LeetCase

The stage 1 connection check was confirmed in Chrome during local review.
Formatting and copying testcases are not implemented yet. No store listing has
been created. The intended initial distribution is a ZIP with the installation steps above.
Before publication, investigate the working name (including the reported VS Code
tool called LeetCase), similar tools such as LeetParse, and current store terms.
No claim of global novelty or name availability is made.

Chrome's official local-install guide:
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world
