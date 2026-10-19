const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js');
require('../extension/highlight.js');
const {format} = globalThis.LeetCase.core;
const {tokenize} = globalThis.LeetCase.highlight;

test('Python assignments are copyable and preserve values, without a signature', () => {
  for (const language of ['Python', 'Python3']) {
    assert.equal(format(language, ' nums = [2,7,11,15], target = 9\n', ''), 'nums = [2,7,11,15]\ntarget = 9');
    assert.equal(format(language, 'root = [1,null,2], enabled = true, disabled = false', ''), 'root = [1,None,2]\nenabled = True\ndisabled = False');
    assert.equal(format(language, 'n = 90071992547409931234567890, ratio = -1.12345678901234567890e-20', ''), 'n = 90071992547409931234567890\nratio = -1.12345678901234567890e-20');
    assert.equal(format(language, 'matrix = [[1,2],[],[3]], nums2 = []', ''), 'matrix = [[1,2],[],[3]]\nnums2 = []');
    assert.equal(format(language, 's = "nums, true null", nums = []', '', new Map([['s','s1'],['nums','nums1']])), 's1 = "nums, true null"\nnums1 = []');
  }
  for (const source of ['', '   ', null, 'x'.repeat(200001), 'x = call()', 'class = 1', 'x = [1,]', 'x = 1, x = 2']) assert.equal(format('Python3', source, ''), null);
});

test('Python strings decode JSON-only slash escapes and surrogate pairs', () => {
  const source = String.raw`s = "a\/b\n\uD83D\uDE00", words = ["true", "null", "nums1", "a\\b", "a\"b"]`;
  assert.equal(format('Python3', source, ''), 's = "a/b\\n😀"\nwords = ["true", "null", "nums1", "a\\\\b", "a\\\"b"]');
});

test('Python syntax keywords receive colors, quoted keywords remain strings', () => {
  for (const keyword of ['True','False','None','true','false','null']) assert.equal(tokenize(keyword)[0].kind,'keyword');
  assert.equal(tokenize('"True null [1,2]"')[0].kind,'string');
});

test('deterministic lexer corpus loses no code units across escapes, Unicode and controls', () => {
  const atoms = ['"a\\\"b"', "'a\\\'b'", '[]', '[[],[1,2]]', 'true', 'None', '-1e-20', '😀', 'é', '\u2028', '\r\n', '\t'];
  for (let i=0;i<600;i++) {
    const source = `v${i} = ${atoms[i % atoms.length]}, other = ${atoms[(i*7+3)%atoms.length]}\n`;
    assert.equal(tokenize(source).map(token=>token.text).join(''),source, `lexer case ${i}`);
  }
});
