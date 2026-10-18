// Local test-only storage and DOM harness; never shipped in the extension.
history.replaceState(null, '', '/problems/two-sum/');
const listeners = new Set();
const saved = {};
globalThis.chrome = {
  runtime: {onMessage:{addListener() {}}, getManifest:() => ({version:'test'})},
  storage: {
    onChanged: {addListener: listener => listeners.add(listener)},
    local: {
      async get(key) { return {[key]:saved[key]}; },
      async set(values) {
        for (const [key, newValue] of Object.entries(values)) {
          const oldValue = saved[key]; saved[key] = newValue;
          for (const listener of listeners) listener({[key]:{oldValue,newValue}}, 'local');
        }
      },
    },
  },
};
addEventListener('DOMContentLoaded', async () => {
  let count = 0;
  const declarations = () => [...document.querySelectorAll('.leetcase-declaration')].map(node => node.textContent).join('\n');
  const original = document.querySelector('pre > strong').nextSibling;
  const output = document.querySelectorAll('pre > strong')[1];
  const runnable = document.getElementById('runnable').value;
  const language = document.getElementById('language');
  const line = document.querySelector('.view-line');
  const cpp = 'class Solution { public: vector<int> twoSum(vector<int>& nums, int target) {} };';
  const java = 'class Solution { public int[] twoSum(int[] nums, int target) {} }';
  async function check(predicate, description) {
    const deadline = Date.now() + 3500;
    while (!predicate()) {
      if (Date.now() > deadline) throw new Error(description);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    const item = document.createElement('li'); item.textContent = `PASS: ${description}`;
    document.getElementById('checks').append(item); count++;
  }
  try {
    line.textContent = cpp;
    await check(() => declarations() === 'vector<int> nums = {2, 7};\nint target = 9;', 'C++ baseline');
    language.textContent = 'Java'; line.textContent = java;
    await check(() => declarations() === 'int[] nums = {2, 7};\nint target = 9;', 'C++ → Java updates only Input');
    await check(() => output.isConnected && output.nextSibling.textContent === ' [0,1]\n' && document.getElementById('runnable').value === runnable, 'Output and runnable data remain intact');
    document.querySelector('.leetcase-original-toggle').click();
    await check(() => !original.parentElement.hidden && document.querySelector('.leetcase-original-toggle').title === 'Show Java format', 'Java Original reveals original data');
    const originalHost = document.querySelector('[data-leetcase-view]');
    await LeetCase.settings.setColorMode(true);
    await check(() => originalHost.dataset.leetcaseColorMode === 'true' && !original.parentElement.hidden, 'Color Mode retains Original view');
    document.querySelector('.leetcase-original-toggle').click();
    await LeetCase.settings.setEnabled(false);
    await check(() => !declarations() && original.parentElement.tagName === 'PRE', 'Off restores exact original input');
    await LeetCase.settings.setEnabled(true);
    await check(() => declarations().startsWith('int[]') && LeetCase.settings.colorMode, 'On resumes Java with saved colors');
    line.textContent = 'class Solution { public void f(TreeNode nums, int target) {} }';
    await check(() => !declarations(), 'unsupported node signature restores original');
    line.textContent = java;
    await check(() => declarations().startsWith('int[]'), 'valid signature resumes Java');
    language.textContent = 'Python3';
    await check(() => !declarations() && document.querySelector('[data-leetcase-color-only="true"]')?.textContent===original.textContent, 'Python3 applies colors without changing text or adding declarations');
    await check(() => !document.querySelector('.leetcase-original-toggle'), 'Python has no unnecessary Original/copy controls');
    await LeetCase.settings.setColorMode(false);
    await check(() => !document.querySelector('[data-leetcase-view]') && original.parentElement.tagName==='PRE', 'Python Color Mode off reveals untouched original node');
    await LeetCase.settings.setColorMode(true);
    await check(() => document.querySelector('[data-leetcase-color-only="true"]')?.textContent===original.textContent, 'Python Color Mode on reapplies lossless colors');
    await LeetCase.settings.setEnabled(false);
    await check(() => !document.querySelector('[data-leetcase-view]'), 'master switch also disables Python coloring');
    await LeetCase.settings.setEnabled(true);
    await check(() => !!document.querySelector('[data-leetcase-color-only="true"]'), 'master switch resumes Python coloring');
    language.textContent='Python';
    await check(() => !!document.querySelector('[data-leetcase-color-only="true"]'), 'Python legacy label also colors');
    language.textContent='JavaScript';
    await check(() => !document.querySelector('[data-leetcase-view]'), 'unsupported JavaScript restores original');
    language.textContent = 'C++'; line.textContent = cpp;
    await check(() => declarations().startsWith('vector<int>'), 'Java → C++ rebuilds correct declarations');
    history.pushState(null, '', '/discuss/');
    await check(() => !declarations(), 'SPA navigation outside problem restores original');
    history.pushState(null, '', '/problems/another-problem/');
    language.textContent = 'Java'; line.textContent = java;
    await check(() => declarations().startsWith('int[]') && document.querySelectorAll('[data-leetcase-view]').length === 1, 'SPA return mounts once');
    const pre = document.querySelector('pre');
    const replacement = document.createElement('pre');
    const inputLabel = document.createElement('strong'); inputLabel.textContent = 'Input:';
    const outputLabel = document.createElement('strong'); outputLabel.textContent = 'Output:';
    replacement.append(inputLabel, ' nums = [], target = -1\n', outputLabel, ' unchanged\n');
    pre.replaceWith(replacement);
    await check(() => declarations() === 'int[] nums = {};\nint target = -1;', 'example rerender uses new Java values');
    const result = document.getElementById('result');
    result.textContent = `PASS: ${count} lifecycle checks`; result.dataset.result = 'pass';
  } catch (error) {
    const result = document.getElementById('result'); result.textContent = `FAIL: ${error.message}`; result.dataset.result = 'fail';
    throw error;
  }
});
