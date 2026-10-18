// Optional native verification: node tests/cpp-roundtrip.cjs (requires g++).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
require('../extension/core.js');
const { parseInput, parametersFor, formatCpp } = globalThis.LeetCase.core;
const cases = [];
const add = (type, value, source = typeof value === 'bigint' ? String(value) : JSON.stringify(value)) => cases.push({ type, value, source });
for (const value of [-2147483648, -1, 0, 2147483647]) add('int', value);
for (const value of [-9223372036854775808n, -9007199254740993n, 0n, 9007199254740993n, 9223372036854775807n]) add('long long', value);
for (const value of ['', 'hello "world"\\path\n\t', 'a\0é', 'عربي 😀', '[a,b] <script>', String.fromCharCode(...Array.from({ length: 128 }, (_, i) => i))]) add('string', value);
for (let i = 0; i < 128; i++) add('char', String.fromCharCode(i));
for (const value of [true, false]) add('bool', value);
for (const value of [-0, 0, 1.25, -1e-100, Number.MIN_VALUE, Number.MAX_VALUE]) add('double', value, Object.is(value, -0) ? '-0.0' : JSON.stringify(value));
for (const value of [-0, 0, 0.1, -2.5, 1.0000000596046448, -1.0000000596046448, 1.401298464324817e-45, 3.4028234663852886e38]) add('float', value, Object.is(value, -0) ? '-0.0' : JSON.stringify(value));
add('vector<vector<int>>', [[1, 2], [], [-3]]);
add('vector<vector<vector<int>>>', [[[1]], [], [[]]]);
add('vector<string>', ['hello', '"\\\n', 'a\0é', '😀']);
add('vector<vector<char>>', [['a', '"', '\\'], [], ['\0', "'"]]);
add('vector<bool>', [true, false]);
add('vector<vector<double>>', [[1.25, 0.1], [], [1e-100]]);
add('vector<long long>', [9007199254740993n, -9223372036854775808n], '[9007199254740993,-9223372036854775808]');
add('vector<vector<string>>', [[], ['a\0', 'b']]);
add('vector<int>', []);
require('./value-corpus.cjs')(add, false);
let assertions = 0;
function expected(type, value, expression) {
  const checks = [];
  const check = condition => { checks.push(`assert(${condition});`); assertions++; };
  if (type.startsWith('vector<')) {
    check(`${expression}.size() == ${value.length}`);
    value.forEach((item, i) => checks.push(expected(type.slice(7, -1), item, `${expression}[${i}]`)));
  } else if (type === 'string') {
    const bytes = Buffer.from(value, 'utf8');
    check(`${expression}.size() == ${bytes.length}`);
    [...bytes].forEach((byte, i) => check(`static_cast<unsigned char>(${expression}[${i}]) == ${byte}`));
  } else if (type === 'char') check(`${expression} == ${value.charCodeAt(0)}`);
  else if (type === 'long long') check(`to_string(${expression}) == "${value}"`);
  else if (type === 'double' || type === 'float') {
    const bytes = Buffer.alloc(type === 'double' ? 8 : 4);
    if (type === 'double') bytes.writeDoubleLE(value); else bytes.writeFloatLE(value);
    const hex = (type === 'double' ? bytes.readBigUInt64LE() : bytes.readUInt32LE()).toString(16);
    check(`bit_cast<${type === 'double' ? 'uint64_t' : 'uint32_t'}>(${expression}) == 0x${hex}${type === 'double' ? 'ULL' : 'U'}`);
  } else check(`${expression} == ${String(value)}`);
  return checks.join('\n');
}
const blocks = cases.map(({ type, value, source }) => {
  const inputs = parseInput(`value = ${source}`);
  assert.ok(inputs, `Input parse: ${type}`);
  const declarations = formatCpp(inputs, parametersFor(`void f(${type} value) {}`, inputs));
  assert.ok(declarations, `Format: ${type}`);
  return `{\n${declarations}\n${expected(type, value, 'value')}\n}`;
});
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcase-cpp-'));
try {
  const sourcePath = path.join(directory, 'verify.cpp');
  const executable = path.join(directory, process.platform === 'win32' ? 'verify.exe' : 'verify');
  fs.writeFileSync(sourcePath, '#include <vector>\n#include <string>\n#include <bit>\n#include <cstdint>\n#include <cassert>\nusing namespace std;\nint main() {\n' + blocks.join('\n') + '\n}\n');
  const build = spawnSync('g++', ['-std=c++20', '-pedantic-errors', '-O0', sourcePath, '-o', executable], { encoding: 'utf8', timeout: 60000 });
  assert.equal(build.status, 0, build.stderr || build.error?.message);
  const run = spawnSync(executable, [], { encoding: 'utf8', timeout: 10000 });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  process.stdout.write(`PASS: ${cases.length} compiled declarations, ${assertions} independent value assertions.\n`);
} finally {
  // This exact directory is owned by this script and was created under os.tmpdir().
  const resolved = fs.realpathSync(directory);
  assert.ok(path.dirname(resolved).toLowerCase() === fs.realpathSync(os.tmpdir()).toLowerCase());
  assert.ok(path.basename(resolved).startsWith('leetcase-cpp-'));
  fs.rmSync(resolved, { recursive: true });
}
