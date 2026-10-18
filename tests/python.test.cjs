const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../extension/core.js');
require('../extension/highlight.js');
const {format} = globalThis.LeetCase.core;
const {tokenize} = globalThis.LeetCase.highlight;

test('Python coloring preserves original examples byte for byte without needing a signature', () => {
  const examples = [
    ' nums = [2,7,11,15], target = 9\n',
    'matrix = [[1,2],[],[3]], nums2 = []',
    's = "a\\\"b\\\\c\\n", words = ["[a,b]", "😀", "عربي"]',
    'root = [1,null,2], enabled = true, disabled = false',
    'x = None, flags = [True,False], text = \'quoted\'',
    'n = 9007199254740993, ratio = -1.5e-20',
    'operations = ["TreeNode","add"], values = [[],[1]]',
    'a = 1\n  b = [2,3]\r\n',
  ];
  for (const language of ['Python', 'Python3']) for (const source of examples) {
    assert.equal(format(language, source, ''), source);
    assert.equal(tokenize(source).map(token => token.text).join(''), source);
  }
  for (const source of ['', '   ', null, 'x'.repeat(200001)]) assert.equal(format('Python3', source, ''), null);
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
