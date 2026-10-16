// Test-only fixture. Never included in the extension manifest or distribution.
history.replaceState(null, '', '/problems/two-sum/');
globalThis.chrome = { runtime: { onMessage: { addListener() {} }, getManifest: () => ({ version: 'fixture' }) } };
const language = document.getElementById('language');
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
