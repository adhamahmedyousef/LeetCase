const {test} = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js'); require('../extension/java.js');
const {format,parseInput} = LeetCase.core;

test('both declaration formatters reject malformed, ambiguous and wrong-shape inputs', () => {
  for (const language of ['C++','Java']) {
    const type = language === 'Java' ? 'int[]' : 'vector<int>&';
    const signature = language === 'Java' ? `class Solution { public void f(${type} nums, int target) {} }` : `void f(${type} nums, int target) {}`;
    for (const value of ['[null]','[true]','["2"]','[[1]]','[1.5]','[2147483648]','[1,]','[1','[NaN]','[Infinity]']) assert.equal(format(language,`nums = ${value}, target = 1`,signature),null,`${language}: ${value}`);
    for (const input of ['nums = [], nums = []','nums = [], missing = 1','nums = [], target = null','nums = [], target = 1, extra = 2']) assert.equal(format(language,input,signature),null);
    assert.equal(format(language,'nums = [], target = 1',signature+signature),null);
    assert.equal(format(language,'nums = [], target = 1','/* '+signature+' */'),null);
  }
});

test('200 independent name/order/empty-array combinations bind to each actual signature', () => {
  for (let i=0;i<200;i++) {
    const a=`left${i}`, b=`right${i}`;
    const source=`${b} = [${-i},${i}], ${a} = []`;
    assert.equal(format('Java',source,`class Solution { public double median(int[] ${a}, int[] ${b}) {} }`),`int[] ${b} = {${i===0?'0':-i}, ${i}};\nint[] ${a} = {};`);
    assert.equal(format('C++',source,`double median(vector<int>& ${a}, vector<int>& ${b}) {}`),`vector<int> ${b} = {${i===0?'0':-i}, ${i}};\nvector<int> ${a} = {};`);
  }
});

test('bounded input and nested-type readers stop at documented limits', () => {
  assert.equal(parseInput('value = ' + '['.repeat(34)+'1'+']'.repeat(34)),null);
  assert.equal(parseInput('value = '+ '1'.repeat(129)),null);
  assert.equal(parseInput('value = "'+'a'.repeat(200000)+'"'),null);
  assert.equal(format('Java','value = []',`class Solution { public void f(int${'[]'.repeat(18)} value) {} }`),null);
  assert.equal(format('C++','value = []',`void f(${'vector<'.repeat(18)}int${'>'.repeat(18)} value) {}`),null);
});
