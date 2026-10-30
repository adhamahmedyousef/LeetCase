# LeetCase Privacy Policy

Last updated: 31 October 2026.

LeetCase is a Chrome extension by VoidHub that formats and copies supported LeetCode example inputs in C++, Java and Python. It operates on LeetCode problem pages.

## Data processed locally

The extension reads example input text, the selected editor language and rendered editor code. Rendered code is used to infer supported parameter names and types. It observes relevant page changes and checks the current problem-page path to update its presentation during navigation. Code, example text and the page path are processed on the device; they are not uploaded to VoidHub or another server by the extension. Unsupported examples remain in their original form.

## Settings and retention

Chrome local extension storage holds three preferences: whether input formatting is enabled, Color Mode, and Unique names. The extension does not persist editor code, testcase inputs or a browsing-history log. Temporary presentation state exists while the page is open. Settings remain until cleared or the extension is removed.

## Clipboard

When you double-click a declaration or use its supported keyboard copy action, the extension writes that formatted declaration to the system clipboard. It does not read your clipboard. Clipboard contents can remain after the page closes and are governed by your device's clipboard and clipboard-history settings. Clear or replace clipboard contents using your operating system if needed.

## Network, sharing and external links

LeetCase contains no extension-initiated network requests, analytics, advertising or remotely executed code. It does not upload or sell processed page data, editor code or settings. Opening a GitHub or VoidHub link is an ordinary navigation to an external website, whose own privacy policy applies. LeetCode itself continues to operate under its own privacy practices independently of this extension.

## Permissions

The storage permission saves the three preferences locally. Content-script access is limited to HTTPS problem pages on leetcode.com and www.leetcode.com, where the formatter reads the example inputs and rendered editor information and changes the input presentation. Copying is triggered by the user's explicit action; the extension does not request clipboard-read access.

## Limited Use

Information accessed by LeetCase is used only to provide its disclosed formatting and copying feature, in accordance with the Chrome Web Store User Data Policy, including the Limited Use requirements. It is not used for advertising, unrelated profiling, creditworthiness or lending decisions.

## Contact

Built by [VoidHub](https://voidhub.co). Contact us through the verified publisher contact email on the Chrome Web Store listing, or report a product issue at https://github.com/adhamahmedyousef/LeetCase/issues . Do not include private code or personal information in public issue reports.
