// Test-only fixture. Never included in the extension manifest or distribution.
history.replaceState(null, '', '/problems/two-sum/');
const storageListeners = new Set();
globalThis.chrome = {
  runtime: { onMessage: { addListener() {} }, getManifest: () => ({ version: 'fixture' }) },
  storage: {
    onChanged: { addListener: listener => storageListeners.add(listener) },
    local: {
      async get(key) { return { [key]: JSON.parse(localStorage.getItem(key) ?? (key === 'leetcaseEnabled' ? 'true' : 'false')) }; },
      async set(values) {
        for (const [key, value] of Object.entries(values)) {
          const oldValue = JSON.parse(localStorage.getItem(key) ?? 'false');
          localStorage.setItem(key, JSON.stringify(value));
          for (const listener of storageListeners) listener({ [key]: { oldValue, newValue: value } }, 'local');
        }
      },
    },
  },
};
addEventListener('DOMContentLoaded', async () => {
  const settings = globalThis.LeetCase.settings;
  const colorMode = document.getElementById('color-mode');
  await settings.ready;
  colorMode.checked = settings.colorMode;
  colorMode.onchange = () => settings.setColorMode(colorMode.checked);
  const uniqueNames=document.getElementById('unique-names');
  uniqueNames.checked=settings.uniqueNames;
  uniqueNames.onchange=()=>settings.setUniqueNames(uniqueNames.checked);
});
const language = document.getElementById('language');

document.getElementById('java-inputs').onclick = () => {
  language.textContent = 'Java';
  document.querySelector('.view-line').textContent = 'class Solution { public void f(int[][] matrix, String[] words, String text, char[][] board, boolean enabled, double ratio, long total) {} }';
  const pre = document.createElement('pre');
  const input = document.createElement('strong'); input.textContent = 'Input:';
  const output = document.createElement('strong'); output.textContent = 'Output:';
  const source = ' matrix = [[1,2],[],[3]], words = ["hello","world"], text = ' + JSON.stringify('a"b\\c\n') + ', board = [["a","é"],[]], enabled = true, ratio = 1.25, total = 9007199254740993\n';
  pre.append(input, source, output, ' fixture output unchanged\n');
  document.querySelector('[data-track-load="description_content"]').replaceChildren(pre);
};
document.getElementById('switch').onclick = () => { language.textContent = language.textContent === 'C++' ? 'Python3' : 'C++'; };
document.getElementById('navigate').onclick = () => { history.pushState(null, '', '/problems/next-problem/'); language.textContent = 'JavaScript'; };
document.getElementById('new-example').onclick = () => {
  const pre = document.querySelector('pre');
  const next = document.createElement('pre');
  const input = document.createElement('strong'); input.textContent = 'Input:';
  const output = document.createElement('strong'); output.textContent = 'Output:';
  next.append(input, ' nums = [], target = -1\n', output, ' []\n');
  pre.replaceWith(next);
};
document.getElementById('expanded-inputs').onclick = () => {
  document.querySelector('.view-line').textContent = 'void f(vector<vector<int>>& matrix, vector<string>& words, string text, vector<vector<char>>& board, bool enabled, double ratio, long long total) {}';
  const pre = document.createElement('pre');
  const input = document.createElement('strong'); input.textContent = 'Input:';
  const output = document.createElement('strong'); output.textContent = 'Output:';
  const source = ' matrix = [[1,2],[],[3]], words = ["hello","world"], text = ' + JSON.stringify('a"b\\c\n') + ', board = [["a","b"],[]], enabled = true, ratio = 1.25, total = 9007199254740993\n';
  pre.append(input, source, output, ' fixture output unchanged\n');
  document.querySelector('[data-track-load="description_content"]').replaceChildren(pre);
};
