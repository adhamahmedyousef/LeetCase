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
  function mount(code) {
    for (const node of adapter.inputNodes()) {
      const input = core.parseInput(node.textContent);
      const formatted = core.formatCpp(input, core.parametersFor(code, input));
      check(formatted !== null, 'example values match the real function signature');
      view.mount(node, formatted);
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
    document.getElementById('result').textContent = `PASS: ${passed} layout checks`;
    document.getElementById('result').dataset.result = 'pass';
  } catch (error) {
    document.getElementById('result').textContent = `FAIL: ${error.message}`;
    document.getElementById('result').dataset.result = 'fail';
    throw error;
  }
})();
