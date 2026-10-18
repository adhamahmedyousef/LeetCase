// Reproducible structural/value corpus shared by native language verification.
// Expected values below are checked independently in the native test programs.
module.exports = function corpus(add, java) {
  let state = 0x1e37ca5e;
  const next = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state; };
  const strings = ['', '"', '\\', '\n\r\t', '\0' + '123', '[x,y]', 'é عربي 😀', '\\u000a', '</span><script>'];
  const arrayType = type => java ? `${type}[]` : `vector<${type}>`;
  for (let i = 0; i < 80; i++) {
    const numbers = Array.from({length:next()%9}, () => (next()|0));
    add(arrayType('int'), numbers);
    const rows = Array.from({length:next()%5}, () => Array.from({length:next()%6}, () => (next()%2001)-1000));
    add(arrayType(arrayType('int')), rows);
    add(arrayType(java ? 'String' : 'string'), Array.from({length:next()%7}, () => strings[next()%strings.length]));
    const large = (BigInt(next()) << 20n) - 9007199254740993n;
    add(java ? 'long' : 'long long', large, String(large));
    if (java) add('List<List<Integer>>', rows);
    else add('vector<bool>', Array.from({length:next()%10}, () => Boolean(next()&1)));
  }
};
