// MutOwnershipCases probe: one-field-per-fixture mutation testing against the FROZEN round-40 counter.
// Read-only on production: reads the round-39 receipt; executes the frozen counter in place. Writes only under its scratch.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const RECEIPT=path.join(ROOT,'corpus/evidence/round-39/playwright-egress/receipt.json');
const COUNTER=path.join(ROOT,'.ufo/waves/round-40/counters/c1-sample-span-v3.mjs');
const S='/fast/scratch/hyaku/tabi-r40/MutOwnershipCases';
const FIX=path.join(S,'fixtures');
const FROZEN_COUNTER_SHA='0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c';
fs.mkdirSync(FIX,{recursive:true});

const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const counterSha=sha(fs.readFileSync(COUNTER));
if(counterSha!==FROZEN_COUNTER_SHA){console.error(JSON.stringify({abort:'counter-digest-mismatch',counterSha}));process.exit(3)}

const nonce=()=>crypto.randomBytes(32).toString('hex');
const original=JSON.parse(fs.readFileSync(RECEIPT,'utf8'));

function makePositive(n){
 const p=structuredClone(original);
 p.schema='tabi-pw-firefox-egress-receipt-r40'; p.refused=false; p.runNonce=n;
 for(const r of p.runs){
  r.refused=false; r.runNonce=n;
  const start=r.samples[0].t;
  r.samples.forEach((sm,i)=>{sm.t=start+i*150;for(const k of ['ss','proc']){sm[k].unavailable=false;sm[k].ticks=1;sm[k].nonLoopback=0}});
  for(const k of ['ss','proc']){r.finalSweep[k].unavailable=false;r.finalSweep[k].ticks=1;r.finalSweep[k].nonLoopback=0}
  r.survivors=0; r.survivorPids=[]; r.portClosed=true;
  // owned.tree / browserVersion / firstShotSha256 come from the real round-39 runs; assert they are present and well-formed.
  if(!Array.isArray(r.owned?.tree)||r.owned.tree.length===0)throw new Error('source-owned-tree-not-nonempty');
  if(typeof r.browserVersion!=='string'||!r.browserVersion)throw new Error('source-browserVersion-unbound');
  if(!/^[0-9a-f]{64}$/.test(r.firstShotSha256||''))throw new Error('source-firstShotSha256-malformed');
 }
 if(p.runs[0].firstShotSha256!==p.runs[1].firstShotSha256)throw new Error('source-firstShotSha256-differs');
 return p;
}

const posNonce=nonce();
const positive=makePositive(posNonce);
const fixtures=[];
function addFixture(name,mutate,expectedFindings,note){
 const n=nonce(),p=structuredClone(positive);
 mutate(p);
 p.runNonce=n; for(const r of p.runs)r.runNonce=n; // sole-finding attribution: mutant bound to its own fresh nonce
 const file=path.join(FIX,`${name}.json`);
 fs.writeFileSync(file,JSON.stringify(p));
 fixtures.push({name,file,nonce:n,expected:expectedFindings,note:note||''});
}
addFixture('m1-owned-empty',p=>{p.runs[0].owned.tree=[]},['run1-owned-empty'],'owned.tree set to [] in run1');
addFixture('m2-owned-missing',p=>{delete p.runs[0].owned},['run1-owned-empty'],'whole owned object deleted from run1');
addFixture('m3-survivors-nonzero',p=>{p.runs[1].survivors=2},['run2-survivors'],'survivors count 2 in run2 (survivorPids left [])');
addFixture('m3b-survivorPids-nonempty',p=>{p.runs[1].survivorPids=[424242]},['run2-survivors'],'survivorPids [424242] in run2 (survivors left 0)');
addFixture('m4-port-open',p=>{p.runs[0].portClosed=false},['run1-port-open'],'portClosed=false in run1');
addFixture('m5-version-unbound',p=>{delete p.runs[1].browserVersion},['run2-version'],'browserVersion key deleted from run2');
addFixture('m6-shot-hash-diff',p=>{p.runs[1].firstShotSha256='f'.repeat(64)},['shot-hash-diff'],'run2 firstShotSha256 differs from run1 (valid 64-hex)');
addFixture('m7-shot-hash-format',p=>{p.runs[0].firstShotSha256='deadbeef'},['run1-shot-hash'],'run1 firstShotSha256 not 64-hex');

const posFile=path.join(FIX,'positive.json');
fs.writeFileSync(posFile,JSON.stringify(positive));

function runCounter(file,n){
 const r=spawnSync(process.execPath,[COUNTER,file,'--nonce',n],{cwd:S,encoding:'utf8',maxBuffer:16<<20});
 let out; try{out=JSON.parse(r.stdout)}catch(e){out=null}
 return {exit:r.status,stdout:r.stdout,stderr:r.stderr,parsed:out};
}

const runs=[];
const pos1=runCounter(posFile,posNonce);
runs.push({step:'baseline-positive',file:posFile,nonce:posNonce,...pos1,verdict:pos1.exit===0&&pos1.parsed?.predicate===true?'pass':'inconclusive'});
for(const f of fixtures){
 const r=runCounter(f.file,f.nonce);
 const got=r.parsed?.findings||[];
 const killed=r.exit===1&&r.parsed?.predicate===false&&f.expected.every(e=>got.includes(e));
 const survived=r.exit===0&&r.parsed?.predicate===true;
 runs.push({step:f.name,file:f.file,nonce:f.nonce,note:f.note,expected:f.expected,...r,verdict:killed?'killed':(survived?'survived':'inconclusive'),observedFindings:got});
}
const pos2=runCounter(posFile,posNonce);
runs.push({step:'restored-positive-rerun',file:posFile,nonce:posNonce,...pos2,verdict:pos2.exit===0&&pos2.parsed?.predicate===true?'pass':'inconclusive'});

const summary={
 schema:'mut-ownership-cases-probe-v1',
 counterPath:COUNTER,counterSha256:counterSha,counterFrozenDigestMatch:counterSha===FROZEN_COUNTER_SHA,
 sourceReceipt:RECEIPT,sourceReceiptSha256:sha(fs.readFileSync(RECEIPT)),
 positiveSha256:sha(fs.readFileSync(posFile)),positiveRunNonce:posNonce,
 runCount:runs.length,killed:runs.filter(r=>r.verdict==='killed').length,survived:runs.filter(r=>r.verdict==='survived').length,inconclusive:runs.filter(r=>r.verdict==='inconclusive').length,
 runs:runs.map(r=>({step:r.step,verdict:r.verdict,exit:r.exit,nonce:r.nonce,expected:r.expected||null,observedFindings:r.observedFindings||r.parsed?.findings||null,stdout:r.stdout,stderr:r.stderr,note:r.note||null}))
};
fs.writeFileSync(path.join(S,'probe-result.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
process.exit(summary.inconclusive===0&&summary.survived===0?0:1);
