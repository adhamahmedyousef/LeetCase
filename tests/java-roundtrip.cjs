// Native value checks: node tests/java-roundtrip.cjs (JDK on PATH).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
require('../extension/core.js');
require('../extension/java.js');
const cases = [];
const add = (type, value, source = typeof value === 'bigint' ? String(value) : JSON.stringify(value)) => cases.push({ type, value, source });
for (const [type, values] of Object.entries({ byte: [-128, 0, 127], short: [-32768, 32767], int: [-2147483648, 2147483647], long: [-9223372036854775808n, 9007199254740993n, 9223372036854775807n], boolean: [true, false] })) for (const value of values) add(type, value);
for (let i = 0; i < 128; i++) add('char', String.fromCharCode(i));
for (const text of ['é', 'ع', '\ud800', '\udfff']) add('char', text);
for (const text of ['', 'hello "world"\\path\n\t', 'a\0é9', 'عربي 😀', '\\u000a', '\ud800', String.fromCharCode(...Array.from({length:128}, (_, i) => i))]) add('String', text);
for (const value of [-0, 0, 1.25, Number.MIN_VALUE, Number.MAX_VALUE, -1e-100]) add('double', value, Object.is(value, -0) ? '-0.0' : JSON.stringify(value));
for (const value of [-0, 0.1, 1.0000000596046448, 1.401298464324817e-45, 3.4028234663852886e38, 1e-100]) add('float', value, Object.is(value, -0) ? '-0.0' : JSON.stringify(value));
add('int[][]', [[1, 2], [], null, [-3]]);
add('int[][][]', [[[1]], [], [[]]]);
add('String[]', ['hello', null, '😀', 'a\0']);
add('char[][]', [['a', '\\', "'"], [], ['é', '\0']]);
add('boolean[]', [true, false]);
add('long[]', [9007199254740993n, -9223372036854775808n], '[9007199254740993,-9223372036854775808]');
add('Integer[]', [null, 1]);
add('String', null);
add('int[]', null);
add('List<Integer>', [1, null, -2]);
add('List<List<Integer>>', [[], [1, 2], null]);
add('List<String>', ['', '😀', 'a\0']);
add('List<int[]>', [[1, 2], [], null]);
add('List<Byte>', [1, -128]);
add('List<Short>', [0, 32767]);
add('List<Float>', [0.1, -2.5]);
add('List<Double>', [Number.MIN_VALUE, Number.MAX_VALUE]);
add('List<String>', [null]);
add('List<int[]>', [null]);
add('List<List<Integer>>', [null]);
add('List<String[]>', [['hello'], []]);
for (const [type, value] of [['Byte', 127], ['Short', -32768], ['Integer', 7], ['Long', 9007199254740993n], ['Float', 0.1], ['Double', 1.25], ['Boolean', true], ['Character', 'é'], ['Integer', null]]) add(type, value);

require('./value-corpus.cjs')(add, true);
let assertions = 0;
function expected(type, value, expression) {
  const checks = [];
  const check = condition => { checks.push(`check(${condition});`); assertions++; };
  if (value === null) check(`${expression} == null`);
  else if (type.endsWith('[]') || type.startsWith('List<')) {
    const list = type.startsWith('List<');
    const element = list ? type.slice(5, -1) : type.slice(0, -2);
    check(`${expression}.${list ? 'size()' : 'length'} == ${value.length}`);
    value.forEach((item, i) => checks.push(expected(element, item, list ? `${expression}.get(${i})` : `${expression}[${i}]`)));
    if (list) { checks.push(`${expression}.add(null);`); check(`${expression}.size() == ${value.length + 1}`); }
  } else if (type === 'String') {
    check(`${expression}.length() == ${value.length}`);
    for (let i = 0; i < value.length; i++) check(`${expression}.charAt(${i}) == ${value.charCodeAt(i)}`);
  } else if (type === 'char' || type === 'Character') check(`${expression} == ${value.charCodeAt(0)}`);
  else if (type.toLowerCase() === 'double' || type.toLowerCase() === 'float') {
    const double = type.toLowerCase() === 'double';
    const bytes = Buffer.alloc(double ? 8 : 4);
    if (double) bytes.writeDoubleLE(value); else bytes.writeFloatLE(value);
    const hex = (double ? bytes.readBigUInt64LE() : bytes.readUInt32LE()).toString(16);
    check(`${double ? 'Double.doubleToRawLongBits' : 'Float.floatToRawIntBits'}(${expression}) == 0x${hex}${double ? 'L' : ''}`);
  } else if (type.toLowerCase() === 'long') check(`${expression} == ${value}L`);
  else check(`${expression} == ${String(value)}`);
  return checks.join('\n');
}
const blocks = cases.map(({type, value, source}) => {
  const declaration = globalThis.LeetCase.core.format('Java', `value = ${source}`, `class Solution { public void f(${type} value) {} }`);
  assert.ok(declaration, `Format: ${type} ${source}`);
  return `{\n${declaration}\n${expected(type, value, 'value')}\n}`;
});
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcase-java-'));
try {
  const sourcePath = path.join(directory, 'Verify.java');
  // Keep generated methods below the JVM bytecode-size limit as coverage grows.
  const methods = [], calls = [];
  for (let i = 0; i < blocks.length; i += 30) {
    const name = `part${i}`;
    methods.push(`static void ${name}() {\n${blocks.slice(i,i+30).join('\n')}\n}`);
    calls.push(`${name}();`);
  }
  fs.writeFileSync(sourcePath, 'class Verify { static void check(boolean b) { if (!b) throw new AssertionError(); }\n' + methods.join('\n') + '\npublic static void main(String[] args) {\n' + calls.join('\n') + '\n} }');
  const build = spawnSync('javac', ['-encoding', 'UTF-8', '-Xlint:all', '-Werror', sourcePath], {encoding:'utf8', timeout:60000});
  assert.equal(build.status, 0, build.stderr || build.error?.message);
  const run = spawnSync('java', ['-cp', directory, 'Verify'], {encoding:'utf8', timeout:10000});
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  process.stdout.write(`PASS: ${cases.length} compiled Java declarations, ${assertions} independent value assertions.\n`);
} finally {
  // Only the directory returned by mkdtemp is removed.
  fs.rmSync(directory, {recursive:true, force:true});
}
