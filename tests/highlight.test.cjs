const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js');
require('../extension/highlight.js');
const { tokenize } = globalThis.LeetCase.highlight;
test('syntax tokens preserve every character including negative values and empty arrays', () => {
  for (const code of ['vector<int> nums = {2, 7, -11, 15};', 'int target = -9;', 'vector<int> values = {};']) {
    assert.equal(tokenize(code).map(token => token.text).join(''), code);
  }
  const tokens = tokenize('vector<int> nums = {-12};');
  for (const [text, kind] of [['vector', 'type'], ['int', 'keyword'], ['nums', 'variable'], ['-12', 'number']]) {
    assert.equal(tokens.find(token => token.text === text).kind, kind);
  }
});
