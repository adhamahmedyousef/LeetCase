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

const single = (type, source) => format(`value = ${source}`, `void f(${type} value) {}`);
test('Integer to Roman uses its real single-parameter signature', () => {
  const code = 'class Solution { public: string intToRoman(int num) { } };';
  for (const value of [3749, 58, 1994]) assert.equal(format(`num = ${value}`, code), `int num = ${value};`);
});
test('Longest Common Prefix formats both real string-array examples', () => {
  const code = 'class Solution { public: string longestCommonPrefix(vector<string>& strs) {} };';
  assert.equal(format('strs = ["flower","flow","flight"]', code), 'vector<string> strs = {"flower", "flow", "flight"};');
  assert.equal(format('strs = ["dog","racecar","car"]', code), 'vector<string> strs = {"dog", "racecar", "car"};');
});
test('two arrays bind independently by parameter name, even in reversed example order', () => {
  const code = 'double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {}';
  assert.equal(format('nums1 = [1,3], nums2 = [2]', code), 'vector<int> nums1 = {1, 3};\nvector<int> nums2 = {2};');
  assert.equal(format('nums2 = [2], nums1 = []', code), 'vector<int> nums2 = {2};\nvector<int> nums1 = {};');
  assert.equal(format('nums1 = [1], nums3 = [2]', code), null);
  assert.equal(format('nums1 = [1], nums2 = [2]', 'void f(vector<int>& nums1, vector<int>& nums1) {}'), null);
});
test('nested integer and string vectors preserve shape, including empty rows', () => {
  assert.equal(single('vector<vector<int>>', '[[1,2],[],[3]]'), 'vector<vector<int>> value = {{1, 2}, {}, {3}};');
  assert.equal(single('vector<vector<vector<int>>>', '[[[1]],[],[[]]]'), 'vector<vector<vector<int>>> value = {{{1}}, {}, {{}}};');
  assert.equal(single('const std::vector<std::vector<std::string>>&', '[["hello","world"],[]]'), 'vector<vector<string>> value = {{"hello", "world"}, {}};');
  assert.equal(single('vector<vector<int>>', '[[1],2]'), null);
});
test('strings escape C++ metacharacters, controls and embedded NUL without changing values', () => {
  assert.equal(single('string', JSON.stringify('a"b\\c\n\t')), 'string value = "a\\"b\\\\c\\n\\t";');
  assert.equal(single('string', '""'), 'string value = "";');
  assert.equal(single('string', JSON.stringify('a\0é')), 'string value = string("a\\000é", 4);');
  assert.equal(single('string', '"\\ud800"'), null);
  assert.equal(single('vector<string>', '["[a,b]","\\\\","\\\""]'), 'vector<string> value = {"[a,b]", "\\\\", "\\\""};');
});
test('ASCII chars, char grids, booleans and vectors use their real declared types', () => {
  assert.equal(single('char', '"a"'), "char value = 'a';");
  assert.equal(single('char', JSON.stringify("'")), "char value = '\\'';");
  assert.equal(single('char', '"ab"'), null);
  assert.equal(single('char', '"é"'), null);
  assert.equal(single('vector<vector<char>>', '[["a","b"],[]]'), "vector<vector<char>> value = {{'a', 'b'}, {}};");
  assert.equal(single('bool', 'true'), 'bool value = true;');
  assert.equal(single('vector<bool>', '[true,false]'), 'vector<bool> value = {true, false};');
  assert.equal(single('bool', '1'), null);
});
test('64-bit integer precision and the minimum literal are preserved', () => {
  assert.equal(single('long long', '9007199254740993'), 'long long value = 9007199254740993LL;');
  assert.equal(single('long long', '9223372036854775807'), 'long long value = 9223372036854775807LL;');
  assert.equal(single('long long', '-9223372036854775808'), 'long long value = (-9223372036854775807LL - 1);');
  assert.equal(single('long long', '9223372036854775808'), null);
  assert.equal(single('long long', '-9223372036854775809'), null);
  assert.equal(single('int', '9007199254740993'), null);
  assert.equal(single('vector<long long>', '[9007199254740993]'), 'vector<long long> value = {9007199254740993LL};');
});
test('floating literals are finite, preserve negative zero and have valid C++ suffixes', () => {
  assert.equal(single('double', '1'), 'double value = 1.0;');
  assert.equal(single('double', '-0.0'), 'double value = -0.0;');
  assert.equal(single('vector<double>', '[1.25,-0.5,1e-20]'), 'vector<double> value = {1.25, -0.5, 1e-20};');
  assert.equal(single('float', '2'), 'float value = 2.0f;');
  assert.equal(single('float', '1.0000000596046448'), 'float value = 1.0f;');
  assert.equal(single('float', '1e100'), null);
  assert.equal(single('double', '1e400'), null);
});
test('unsupported types, nulls, wrong scalar types and excessive depth stay original', () => {
  for (const type of ['TreeNode*', 'ListNode*', 'vector<TreeNode*>', 'map<int,int>', 'long', 'int*', 'vector<int>>']) assert.equal(single(type, '[]'), null);
  for (const text of ['null', 'true', '"1"', '{}']) assert.equal(single('int', text), null);
  for (const source of ['01', '[1,]', '[,1]', 'truefalse', '1e', '"bad\nnewline"']) assert.equal(parseInput(`value = ${source}`), null);
  assert.equal(parseInput('value = ' + '['.repeat(34) + '0' + ']'.repeat(34)), null);
});
