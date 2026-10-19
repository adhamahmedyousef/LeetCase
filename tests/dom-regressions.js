// Browser-run regressions using literal markup observed on LeetCode.
(() => {
  const { core, adapter, view } = globalThis.LeetCase;
  const cases = document.getElementById('cases');
  let passed = 0;
  function check(condition, description) {
    if (!condition) throw new Error(description);
    const item = document.createElement('li');
    item.textContent = `PASS: ${description}`;
    document.getElementById('checks').append(item);
    passed++;
  }
  function fixture(html) {
    view.clear();
    // All markup here is static test data, never page/user content.
    cases.innerHTML = html;
  }
  function mount(code, language = 'C++') {
    for (const node of adapter.inputNodes()) {
      const formatted = core.format(language, node.textContent, code);
      check(formatted !== null, 'example values match the real function signature');
      view.mount(node, formatted, language);
    }
  }
  try {
    fixture('<pre><strong>Input:</strong> nums1 = [1,3], nums2 = [2]\n<strong>Output:</strong> 2.00000\n<strong>Explanation:</strong> unchanged</pre>');
    const legacyInput = adapter.inputNodes()[0];
    const legacyOutput = cases.querySelectorAll('strong')[1];
    mount('double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {}');
    check(cases.querySelectorAll('.leetcase-declaration').length === 2, 'legacy layout renders two separate array declarations');
    check(cases.querySelectorAll('.leetcase-declaration')[1].textContent === 'vector<int> nums2 = {2};', 'second array keeps its own name/type/value');
    check(adapter.inputNodes().length === 0, 'mounted legacy input is not detected twice');
    view.clear();
    check(adapter.inputNodes()[0] === legacyInput && legacyOutput.isConnected, 'legacy input identity and Output node survive cleanup');

    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io">num = 3749</span></p><p><strong>Output:</strong> <span class="example-io">"MMMDCCXLIX"</span></p><p><strong>Explanation:</strong></p><pre>3000 = MMM\nunchanged</pre></div>');
    const original = adapter.inputNodes()[0];
    const row = original.parentElement;
    const output = row.nextElementSibling;
    const explanation = cases.querySelector('pre');
    const expectedOutput = output.outerHTML;
    const expectedExplanation = explanation.outerHTML;
    mount('string intToRoman(int num) {}');
    check(cases.querySelector('.leetcase-declaration').textContent === 'int num = 3749;', 'Integer to Roman paragraph layout converts Input');
    check(output.outerHTML === expectedOutput && explanation.outerHTML === expectedExplanation, 'Output and Explanation remain byte-for-byte unchanged');
    check(adapter.inputNodes().length === 0, 'mounted paragraph input is not detected twice');
    cases.querySelector('.leetcase-original-toggle').click();
    check(original.isConnected && !original.parentElement.hidden, 'Original reveals the same original example-io span');
    view.clear();
    check(adapter.inputNodes()[0] === original && original.parentElement === row, 'paragraph cleanup restores the exact original element');

    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io">nums1 = [], nums2 = [2,3]</span></p><p><strong>Output:</strong> <span class="example-io">2.5</span></p></div>');
    mount('double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {}');
    check(cases.querySelectorAll('.leetcase-declaration').length === 2 && cases.querySelector('.leetcase-declaration').textContent === 'vector<int> nums1 = {};', 'paragraph layout supports two arrays including an empty array');
    check(getComputedStyle(cases.querySelector('.leetcase-code')).whiteSpace === 'pre-wrap', 'paragraph declarations keep separate lines');
    check(getComputedStyle(cases.querySelector('[data-leetcase-view]')).fontFamily.includes('monospace'), 'paragraph view retains original input typography');

    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io" style="font-family: monospace; font-size: 17px; font-weight: 500; font-feature-settings: &quot;ss01&quot; on; font-variation-settings: &quot;wght&quot; 500; letter-spacing: .4px; line-height: 26px">s = &quot;()&quot;</span></p><p><strong>Output:</strong> <span class="example-io">true</span></p></div>');
    const typographyNode = adapter.inputNodes()[0];
    const properties = ['fontFamily', 'fontSize', 'fontWeight', 'fontFeatureSettings', 'fontVariationSettings', 'letterSpacing', 'lineHeight'];
    const typography = Object.fromEntries(properties.map(property => [property, getComputedStyle(typographyNode)[property]]));
    mount('bool isValid(string s) {}');
    for (const element of [cases.querySelector('[data-leetcase-view]'), ...cases.querySelectorAll('.leetcase-declaration > span')]) {
      check(properties.every(property => getComputedStyle(element)[property] === typography[property]), 'advanced original typography is preserved on host and syntax tokens');
    }

    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io"><b>num = 1</b></span></p><p><strong>Output:</strong> x</p></div>');
    check(adapter.inputNodes().length === 0, 'unobserved nested markup fails closed');
    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io">num = 1</span> unrelated prose</p><p><strong>Output:</strong> x</p></div>');
    check(adapter.inputNodes().length === 0, 'unrelated prose is not consumed as input');
    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io">nums1 = [1,3], nums2 = [2]</span></p><p><strong>Output:</strong> <span class="example-io">2.00000</span></p></div>');
    mount('double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {}');
    fixture('<div class="example-block"><p><strong>Input:</strong> <span class="example-io">words = ["hello","world"], grid = [[1],[]]</span></p><p><strong>Output:</strong> unchanged</p></div>');
    const javaOriginal = adapter.inputNodes()[0];
    mount('class Solution { public void f(String[] words, int[][] grid) {} }', 'Java');
    check(cases.querySelector('.leetcase-declaration').textContent === 'String[] words = {"hello", "world"};', 'Java string array renders in the original Input typography');
    check(cases.querySelectorAll('.leetcase-declaration')[1].textContent === 'int[][] grid = {{1}, {}};', 'Java nested arrays preserve empty rows');
    cases.querySelector('.leetcase-original-toggle').click();
    check(cases.querySelector('.leetcase-original-toggle').title === 'Show Java format' && !javaOriginal.parentElement.hidden, 'Java Original restores exact data and names the correct language');
    view.clear();
    check(adapter.inputNodes()[0] === javaOriginal, 'Java cleanup preserves original node identity');
    for (const language of ['Python','Python3']) for (const modern of [false,true]) {
      fixture(modern ? '<div class="example-block"><p><strong>Input:</strong> <span class="example-io" style="font: 500 17px/26px monospace;letter-spacing:.4px">root = [1,null,2], s = &quot;a\\n&quot;, flag = true</span></p><p><strong>Output:</strong> unchanged</p></div>' : '<pre><strong>Input:</strong> root = [1,null,2], s = "a\\n", flag = true\n<strong>Output:</strong> unchanged</pre>');
      const node = adapter.inputNodes()[0], source = node.textContent;
      const font = getComputedStyle(modern ? node : node.parentElement).fontFamily;
      const whitespace = getComputedStyle(modern ? node : node.parentElement).whiteSpace;
      view.setAppearance(true,{keyword:'#569cd6',string:'#ce9178',number:'#b5cea8',variable:'#9cdcfe'});
      mount('',language);
      const host = cases.querySelector('[data-leetcase-view]');
      check(host.querySelector('.leetcase-code').textContent === 'root = [1,None,2]\ns = \"a\\n\"\nflag = True', `${language} formats Python assignments in ${modern?'paragraph':'legacy'} layout`);
      check(host.querySelectorAll('[role="button"]').length === 3 && !!host.querySelector('.leetcase-original-toggle'), `${language} adds per-assignment copy and Original controls`);
      check(getComputedStyle(host).fontFamily === font && [...host.querySelectorAll('.leetcase-code > span')].every(span=>getComputedStyle(span).fontFamily===font), `${language} retains original typography`);
      check(host.dataset.leetcaseColorMode === 'true' && !!host.querySelector('.leetcase-token-string'), `${language} colors original tokens`);
      check(getComputedStyle(host.querySelector('.leetcase-code')).whiteSpace==='pre-wrap', `${language} declarations wrap without changing original data`);
      view.clear();
      check(adapter.inputNodes()[0]===node, `${language} cleanup restores exact original node`);
    }
    document.getElementById('result').textContent = `PASS: ${passed} layout checks`;
    document.getElementById('result').dataset.result = 'pass';
  } catch (error) {
    document.getElementById('result').textContent = `FAIL: ${error.message}`;
    document.getElementById('result').dataset.result = 'fail';
    throw error;
  }
})();
