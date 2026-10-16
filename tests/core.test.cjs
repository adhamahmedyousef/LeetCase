const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js');
const { parseInput, parametersFor, formatCpp } = globalThis.LeetCase.core;
const signature = 'class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { } };';
const format = (text, code = signature) => {
  const inputs = parseInput(text);
  return inputs && formatCpp(inputs, parametersFor(code, inputs));
};
test('Two Sum declarations use the signature and actual example data', () => {
  assert.equal(format(' nums = [2,7,11,15], target = 9\n'), 'vector<int> nums = {2, 7, 11, 15};\nint target = 9;');
  assert.equal(format('nums = [], target = -4'), 'vector<int> nums = {};\nint target = -4;');
});
test('input tokenizer respects quoted commas, escapes and nesting', () => {
  assert.deepEqual(parseInput('words = ["a,b", "a\\\"b", "[x]", "\\\\"], grid = [[], [1,2]]'), [
    { name: 'words', value: ['a,b', 'a"b', '[x]', '\\'] }, { name: 'grid', value: [[], [1, 2]] },
  ]);
});
test('unsupported values stay original rather than masquerading as vectors', () => {
  for (const text of ['nums = [[1]], target = 0', 'nums = [null], target = 0', 'nums = ["1"], target = 0', 'nums = [1.1], target = 0', 'nums = [2147483648], target = 0']) assert.equal(format(text), null);
  assert.equal(format('nums = [1,2], target = 3', 'void f(ListNode* nums, int target) {}'), null);
  assert.equal(format('nums = [1,2], target = 3', 'void f(TreeNode* nums, int target) {}'), null);
});
test('mismatched, missing and ambiguous signatures fail closed', () => {
  assert.equal(format('nums = [1], target = 3', 'void f(vector<int>& other, int target) {}'), null);
  assert.equal(format('nums = [1], target = 3', ''), null);
  assert.equal(format('nums = [1], target = 3', signature + signature), null);
  assert.equal(format('nums = [1], target = 3', '// ' + signature), null);
  assert.equal(format('nums = [1], target = 3', 'void f(const std::vector<int>& nums, const int target) {}'), 'vector<int> nums = {1};\nint target = 3;');
});
test('malformed or executable input is rejected', () => {
  for (const text of ['nums = [1,], target = 3', 'nums = [1, target = 3', 'nums = [], nums = []', 'nums = alert(1)', 'nums = [1]]', 'nums = "unterminated', 'nums = undefined']) assert.equal(parseInput(text), null);
});
