const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js');
require('../extension/highlight.js');
const { tokenize } = globalThis.LeetCase.highlight;

test('Java syntax colors preserve arrays, Strings, lists, nulls and long suffixes', () => {
  for (const code of ['String[] words = {"hi", null};', 'long n = -9223372036854775808L;', 'java.util.List<Integer> xs = new java.util.ArrayList<Integer>();']) {
    assert.equal(tokenize(code).map(token => token.text).join(''), code);
  }
  assert.equal(tokenize('boolean')[0].kind, 'keyword');
  assert.equal(tokenize('String')[0].kind, 'type');
  assert.equal(tokenize('1L')[0].text, '1L');
});
test('syntax tokens preserve every character including negative values and empty arrays', () => {
  for (const code of ['vector<int> nums = {2, 7, -11, 15};', 'int target = -9;', 'vector<int> values = {};']) {
    assert.equal(tokenize(code).map(token => token.text).join(''), code);
  }
  const tokens = tokenize('vector<int> nums = {-12};');
  for (const [text, kind] of [['vector', 'type'], ['int', 'keyword'], ['nums', 'variable'], ['-12', 'number']]) {
    assert.equal(tokens.find(token => token.text === text).kind, kind);
  }
});
test('quoted text, character escapes, floating values and integer suffixes remain whole tokens', () => {
  for (const code of ['string s = "int [a,b] \\"quoted\\"";', "char c = '\\'';", 'double x = -1.5e-20;', 'long long x = 9223372036854775807LL;']) {
    assert.equal(tokenize(code).map(token => token.text).join(''), code);
  }
  const quoted = tokenize('string s = "int [a,b]";').find(token => token.kind === 'string');
  assert.equal(quoted.text, '"int [a,b]"');
  assert.equal(tokenize('true')[0].kind, 'keyword');
});
