const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js');
require('../extension/java.js');
const { format } = globalThis.LeetCase.core;
const java = (input, parameters) => format('Java', input, `class Solution { public void f(${parameters}) {} }`);

test('Java uses LeetCode method signatures and binds by name', () => {
  const code = 'class Solution { public int[] twoSum(int[] nums, int target) { } }';
  assert.equal(format('Java', 'nums = [2,7,11,15], target = 9', code), 'int[] nums = {2, 7, 11, 15};\nint target = 9;');
  assert.equal(format('Java', 'target = 9, nums = []', code), 'int target = 9;\nint[] nums = {};');
  assert.equal(format('Java', 'nums = [1], target = 9', code + code), null);
  assert.equal(format('Java', 'nums = [1], target = 9', code + 'class Other { public void f(TreeNode nums, int target) {} }'), null);
  assert.equal(format('Java', 'nums = [1], other = 9', code), null);
  assert.equal(java('nums1 = [], nums2 = [2,3]', 'int[] nums1, int[] nums2'), 'int[] nums1 = {};\nint[] nums2 = {2, 3};');
});
test('Java multiline, final and post-name array brackets', () => {
  const code = 'class Solution { public static String f(\n final int nums [],\n java.lang.String[] words\n) throws IllegalArgumentException {} }';
  assert.equal(format('Java', 'nums = [1], words = ["hi"]', code), 'int[] nums = {1};\nString[] words = {"hi"};');
  assert.equal(java('matrix = [[1,2],[],[3]]', 'int[][] matrix'), 'int[][] matrix = {{1, 2}, {}, {3}};');
  assert.equal(java('board = [["a","é"],[]]', 'char[][] board'), "char[][] board = {{'a', 'é'}, {}};");
});
test('Java String and char preserve escapes and UTF-16', () => {
  assert.equal(java('s = ' + JSON.stringify('a\0"\\\n\r\té😀'), 'String s'), 'String s = "a\\000\\"\\\\\\n\\r\\té\\ud83d\\ude00";');
  assert.equal(java('s = ""', 'String s'), 'String s = "";');
  assert.equal(java('s = "\\ud800"', 'String s'), 'String s = "\\ud800";');
  assert.equal(java('c = "é"', 'char c'), "char c = 'é';");
  assert.equal(java('c = "😀"', 'char c'), null);
  assert.equal(java('c = "ab"', 'char c'), null);
});
test('Java numeric types validate bounds and suffixes', () => {
  for (const [type, min, max] of [['byte', '-128', '127'], ['short', '-32768', '32767'], ['int', '-2147483648', '2147483647'], ['long', '-9223372036854775808', '9223372036854775807']]) {
    assert.ok(java(`x = ${min}`, `${type} x`));
    assert.ok(java(`x = ${max}`, `${type} x`));
    assert.equal(java(`x = ${BigInt(max) + 1n}`, `${type} x`), null);
    assert.equal(java(`x = ${BigInt(min) - 1n}`, `${type} x`), null);
    assert.equal(java('x = 1.5', `${type} x`), null);
  }
  assert.equal(java('x = 9007199254740993', 'long x'), 'long x = 9007199254740993L;');
  assert.equal(java('x = -0.0', 'double x'), 'double x = -0.0;');
  assert.equal(java('x = 1.0000000596046448', 'float x'), 'float x = 1.0f;');
  assert.equal(java('x = 1e100', 'float x'), null);
  assert.equal(java('x = 1e400', 'double x'), null);
  assert.equal(java('b = true', 'boolean b'), 'boolean b = true;');
  assert.equal(java('b = 1', 'boolean b'), null);
});
test('Java lists use mutable, typed constructors without required imports', () => {
  assert.equal(java('xs = [1,2]', 'List<Integer> xs'), 'java.util.List<Integer> xs = new java.util.ArrayList<Integer>(java.util.Arrays.<Integer>asList(1, 2));');
  assert.equal(java('xs = [[],[1]]', 'java.util.List<List<Integer>> xs'), 'java.util.List<java.util.List<Integer>> xs = new java.util.ArrayList<java.util.List<Integer>>(java.util.Arrays.<java.util.List<Integer>>asList(new java.util.ArrayList<Integer>(java.util.Arrays.<Integer>asList()), new java.util.ArrayList<Integer>(java.util.Arrays.<Integer>asList(1))));');
  assert.ok(java('xs = [[1],[]]', 'List<int[]> xs').includes('new int[] {1}'));
  assert.equal(java('xs = [null]', 'List<String> xs'), 'java.util.List<String> xs = new java.util.ArrayList<String>(java.util.Arrays.<String>asList((String) null));');
  for (const type of ['List<int>', 'List<Integer>[]', 'Map<String,Integer>', 'ListNode', 'TreeNode', 'Node', 'int...', 'List<?>']) assert.equal(java('xs = []', `${type} xs`), null);
});
test('Java nullable references stay distinct from primitive nulls and node serialization', () => {
  assert.equal(java('xs = [[1],null,[]]', 'int[][] xs'), 'int[][] xs = {{1}, null, {}};');
  assert.equal(java('xs = ["hello",null]', 'String[] xs'), 'String[] xs = {"hello", null};');
  assert.equal(java('xs = [null]', 'int[] xs'), null);
  assert.equal(java('x = null', 'Integer x'), 'Integer x = null;');
  assert.equal(java('x = null', 'TreeNode x'), null);
});
test('signatures in comments and strings never authorize conversion in either language', () => {
  for (const code of ['// public int f(int x) {}', 'class Solution { String s = "public int f(int x) {}"; }', 'class Solution { String s = """\npublic int f(int x) {}\n"""; }', 'class Solution { public Solution(int x) {} }']) assert.equal(format('Java', 'x = 1', code), null);
  assert.equal(format('C++', 'x = 1', 'string s = "void f(int x) {}";'), null);
  assert.equal(format('C++', 'x = 1', 'string s = R"tag(void f(int x) {})tag";'), null);
  assert.equal(format('JavaScript', 'x = 1', 'void f(int x) {}'), null);
});
