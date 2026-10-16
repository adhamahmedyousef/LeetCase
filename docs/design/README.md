# Popup direction

The owner chose **C / Code first**, with the **entire Connected row removed**.
The selected design is implemented in `extension/popup.html`, `popup.css` and
`popup.js`. The initial three concepts remain in `popup-options.html` as references.

The actual VoidHub reference uses white geometric letters on charcoal with a teal
underline. The popup follows that palette: charcoal `#121A22`, white `#F4F7FA`,
teal `#2B7B87`, muted text `#A2ABB9`. Segoe UI/Arial serve the controls and title;
Consolas/Courier New serves the illustrative code. No remote font requests.

The LS mark is a typographic placeholder. To create a final image icon, use
[the prompt](icon-prompt.md) with [the VoidHub reference](assets/voidhub-reference.png).

## Local preview of the actual popup

1. Run `node tests/create-popup-preview.cjs` from the project root.
2. Run `python -m http.server 8765 --bind 127.0.0.1` from the project root.
3. Open `http://127.0.0.1:8765/dist/popup-preview.html`.

The preview reuses actual popup markup, scripts and styles. Its isolated storage
shim is test-only, uses a separate localStorage prefix, and never changes the
installed extension's Color Mode. Test the real unpacked Chrome extension after
Reload to verify its actual chrome.storage integration.
