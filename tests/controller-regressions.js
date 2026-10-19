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
  let copied = "";
  Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{async writeText(value) { copied = value; }}});
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
    await check(() => declarations()==='nums = [2,7]\ntarget = 9', 'Python3 has copyable assignments without type declarations');
    await check(() => !!document.querySelector('.leetcase-original-toggle'), 'Python supports Original toggle');
    await LeetCase.settings.setColorMode(false);
    await check(() => !!declarations() && document.querySelector('[data-leetcase-view]').dataset.leetcaseColorMode==='false', 'Python copying stays active with colors off');
    await LeetCase.settings.setColorMode(true);
    await check(() => document.querySelector('[data-leetcase-view]')?.dataset.leetcaseColorMode==='true', 'Python Color Mode on recolors declarations');
    await LeetCase.settings.setEnabled(false);
    await check(() => !document.querySelector('[data-leetcase-view]'), 'master switch disables Python presentation');
    await LeetCase.settings.setEnabled(true);
    await check(() => !!declarations(), 'master switch resumes Python assignments');
    language.textContent='Python';
    await check(() => !!declarations(), 'Python legacy label also supports copying');
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
    const second = document.createElement('pre');
    const input2=document.createElement('strong'); input2.textContent='Input:';
    const output2=document.createElement('strong'); output2.textContent='Output:';
    second.append(input2,' nums = [1,2,3,4], target = 10\n',output2,' second output\n');
    replacement.after(second);
    await LeetCase.settings.setUniqueNames(true);
    await check(()=> declarations()==='int[] nums = {};\nint target = -1;\nint[] nums1 = {1, 2, 3, 4};\nint target1 = 10;', 'Unique names numbers Java examples in document order');
    language.textContent='Python3';
    await check(()=> declarations()==='nums = []\ntarget = -1\nnums1 = [1,2,3,4]\ntarget1 = 10', 'Python Unique names numbers both variables in example 2');
    const pythonCopy = [...second.querySelectorAll('.leetcase-declaration')][0];
    pythonCopy.dispatchEvent(new MouseEvent('dblclick', {bubbles:true}));
    await check(()=> copied==='nums1 = [1,2,3,4]' && second.querySelector('.leetcase-feedback').textContent==='Copied', 'Python double-click writes exactly the numbered assignment');
    const pythonTarget = second.querySelectorAll('.leetcase-declaration')[1];
    pythonTarget.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter',bubbles:true}));
    await check(()=> copied==='target1 = 10', 'Python keyboard copy uses the numbered scalar');
    second.querySelector('.leetcase-original-toggle').click();
    await check(()=> !second.querySelector('[data-leetcase-original]').hidden && second.querySelector('[data-leetcase-original]').textContent===' nums = [1,2,3,4], target = 10\n', 'Python Original reveals exact unnumbered data');
    second.querySelector('.leetcase-original-toggle').click();
    await check(()=> !second.querySelector('.leetcase-code').hidden, 'Python Original returns to copyable numbered view');
    language.textContent='C++'; line.textContent=cpp;
    await check(()=> declarations().includes('vector<int> nums1 = {1, 2, 3, 4};'), 'Unique names also applies after switching to C++');
    await LeetCase.settings.setColorMode(false);
    await check(()=> declarations().includes(' nums1 = '), 'Color Mode does not reset unique names');
    await LeetCase.settings.setUniqueNames(false);
    await check(()=> declarations()==='vector<int> nums = {};\nint target = -1;\nvector<int> nums = {1, 2, 3, 4};\nint target = 10;', 'Unique names off restores signature names');
    await LeetCase.settings.setUniqueNames(true);
    second.before(replacement); // A no-op movement must not renumber twice.
    await check(()=> document.querySelectorAll('[data-leetcase-view]').length===2, 'numbering does not duplicate mounted inputs');
    second.before(second.cloneNode(false)); // Add a non-input node between examples.
    await check(()=> declarations().includes(' nums1 = '), 'unrelated markup does not change numbering');
    replacement.remove();
    await check(()=> declarations()==='vector<int> nums = {1, 2, 3, 4};\nint target = 10;', 'removing the first example deterministically resets remaining names');
    language.textContent='Python3'; await LeetCase.settings.setColorMode(true);
    await check(()=> declarations()==='nums = [1,2,3,4]\ntarget = 10', 'Python first remaining example keeps original names with Unique names enabled');
    const result = document.getElementById('result');
    result.textContent = `PASS: ${count} lifecycle checks`; result.dataset.result = 'pass';
  } catch (error) {
    const result = document.getElementById('result'); result.textContent = `FAIL: ${error.message}`; result.dataset.result = 'fail';
    throw error;
  }
});
