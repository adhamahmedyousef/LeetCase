const {test} = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js'); require('../extension/java.js');
const {exampleNames,format} = LeetCase.core;

test('unique names keep first example and number later examples across C++ and Java',()=>{
  const sources=['nums = [1,2,3], target = 9','nums = [1,2,3,4], target = 10','target = 11, nums = []'];
  const names=exampleNames(sources);
  for (const language of ['C++','Java']) {
    const type=language==='Java'?'int[]':'vector<int>';
    const code=language==='Java'?'class Solution { public int[] twoSum(int[] nums, int target) {} }':'vector<int> twoSum(vector<int>& nums, int target) {}';
    assert.equal(format(language,sources[0],code,names[0]),`${type} nums = {1, 2, 3};\nint target = 9;`);
    assert.equal(format(language,sources[1],code,names[1]),`${type} nums1 = {1, 2, 3, 4};\nint target1 = 10;`);
    assert.equal(format(language,sources[2],code,names[2]),`int target2 = 11;\n${type} nums2 = {};`);
    assert.ok(format(language,sources[1],code).includes(' nums = '));
  }
});
test('structural renaming leaves string contents and declared types untouched',()=>{
  const sources=['nums = ["nums","nums1"], s = "s nums"','nums = ["nums","nums1"], s = "s nums"'];
  const names=exampleNames(sources);
  assert.equal(format('C++',sources[1],'void f(vector<string>& nums, string s) {}',names[1]),'vector<string> nums1 = {"nums", "nums1"};\nstring s1 = "s nums";');
  assert.equal(format('Java',sources[1],'class Solution { public void f(String[] nums, String s) {} }',names[1]),'String[] nums1 = {"nums", "nums1"};\nString s1 = "s nums";');
  for (const language of ['Python','Python3']) assert.equal(format(language,sources[1],'',names[1]),'nums1 = [\"nums\",\"nums1\"]\ns1 = \"s nums\"');
});
test('numbering preserves existing numeric names and avoids all original name collisions',()=>{
  const sources=Array.from({length:50},()=> 'nums = [1], nums1 = [2], nums2 = [3], nums11 = [], x = 1');
  const names=exampleNames(sources);
  const values=names.flatMap(map=>[...map.values()]);
  assert.equal(new Set(values).size,250);
  assert.equal(names[0].get('nums'),'nums');
  assert.equal(names[1].get('nums'),'nums3');
  assert.ok(values.every(value=>/^[A-Za-z_]\w*$/.test(value)));
  assert.deepEqual([...exampleNames(sources)[25]],[...names[25]]);
});
test('unsupported examples keep their position, and missing signatures still fail closed',()=>{
  const sources=['value = [1]','unrecognized prose','value = [3]'];
  const names=exampleNames(sources);
  assert.equal(names[2].get('value'),'value2');
  assert.equal(format('C++',sources[2],'void f(TreeNode* value) {}',names[2]),null);
  assert.equal(format('Java',sources[2],'class Solution { public void f(TreeNode value) {} }',names[2]),null);
  assert.equal(format('Java',sources[2],'class Solution { public void f(int[] other) {} }',names[2]),null);
});
