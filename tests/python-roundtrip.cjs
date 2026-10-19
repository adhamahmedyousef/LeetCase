// Execute generated Python assignments and compare with independent json.loads.
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
require('../extension/core.js');
const cases=[];
const add=(_type,value,raw=JSON.stringify(value))=>{
  const source=`nums = ${raw}, target = 9`;
  for(const language of ['Python','Python3']) {
    const names=LeetCase.core.exampleNames([source,source])[1];
    const code=LeetCase.core.format(language,source,'',names);
    assert.equal(typeof code,'string');
    cases.push({code,raw});
  }
};
require('./value-corpus.cjs')(add,false);
for(const raw of ['null','true','false','-0.0','1.123456789012345678901e-20','900719925474099312345678901234567890',String.raw`"a\/b\n\uD83D\uDE00"`,String.raw`["true null nums1","a\\b","a\"b",null,true,false]`]) add(null,null,raw);
const script=String.raw`
import ast, json, math, sys
sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")
cases=json.load(sys.stdin)
for item in cases:
    tree=ast.parse(item['code'])
    assert all(isinstance(node,ast.Assign) for node in tree.body)
    scope={}
    exec(compile(tree,'<LeetCase>','exec'),{'__builtins__':{}},scope)
    expected=json.loads(item['raw'])
    assert scope['nums1']==expected, (item,scope,expected)
    assert scope['target1']==9
    assert set(scope)=={'nums1','target1'}
    if isinstance(expected,float) and expected==0:
        assert math.copysign(1,scope['nums1'])==math.copysign(1,expected)
print(f'PASS: {len(cases)} Python programs, {len(cases)*3} value/name assertions')
`;
const result=spawnSync(process.platform==='win32'?'py':'python3',process.platform==='win32'?['-3','-c',script]:['-c',script],{input:JSON.stringify(cases),encoding:'utf8',maxBuffer:4*1024*1024});
if(result.error) throw result.error;
process.stdout.write(result.stdout);process.stderr.write(result.stderr);
assert.equal(result.status,0,'Python round-trip validation failed');
