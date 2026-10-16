// Preview the actual popup without loading Chrome extension APIs into a web page.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const original = fs.readFileSync(path.join(root, 'extension/popup.html'), 'utf8');
const preview = original.replace('<head>', '<head>\n    <base href="/extension/">')
  .replace('<script src="settings.js" defer>', '<script src="/tests/popup-preview-shim.js" defer></script>\n    <script src="settings.js" defer>');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/popup-preview.html'), preview);
process.stdout.write('Open http://127.0.0.1:8765/dist/popup-preview.html after starting the project HTTP server.\n');
