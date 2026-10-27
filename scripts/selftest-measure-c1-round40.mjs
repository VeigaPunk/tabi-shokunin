#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [workArg]=process.argv.slice(2);
if(!workArg){console.error('usage: node scripts/selftest-measure-c1-round40.mjs <explicit-work-dir>');process.exit(64)}
const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin',work=path.resolve(workArg);
fs.mkdirSync(work,{recursive:true});
const original=JSON.parse(fs.readFileSync(path.join(ROOT,'corpus/evidence/round-39/playwright-egress/receipt.json'),'utf8'));
const counter=path.join(ROOT,'.ufo/waves/round-40/counters/c1-sample-span-v3.mjs');
const wrapper=path.join(ROOT,'scripts/measure-c1-round40.mjs');
const results=[];
// Parser-only synthetic positive: never a claim receipt, never written under corpus/evidence.
const fakeNonce='a'.repeat(64),positive=structuredClone(original);
positive.schema='tabi-pw-firefox-egress-receipt-r40'; positive.refused=false; positive.runNonce=fakeNonce;
for(const r of positive.runs){r.refused=false;r.runNonce=fakeNonce;const start=r.samples[0].t;r.samples.forEach((s,i)=>{s.t=start+i*150;for(const k of ['ss','proc']){s[k].unavailable=false;s[k].ticks=1;s[k].nonLoopback=0}});for(const k of ['ss','proc']){r.finalSweep[k].unavailable=false;r.finalSweep[k].ticks=1;r.finalSweep[k].nonLoopback=0}r.survivors=0;r.survivorPids=[];r.portClosed=true}
const posFile=path.join(work,'parser-only-synthetic-positive.json');fs.writeFileSync(posFile,JSON.stringify(positive));
const pos=spawnSync(process.execPath,[counter,posFile,'--nonce',fakeNonce],{cwd:ROOT,encoding:'utf8'});let posOut;try{posOut=JSON.parse(pos.stdout)}catch{posOut={findings:[]}}
results.push({name:'parser-only-synthetic-positive',exit:pos.status,findings:posOut.findings,matched:pos.status===0&&posOut.predicate===true});
for(const [where,k] of [['sample','ss'],['sample','proc'],['final','ss'],['final','proc']]) {
 const bad=structuredClone(positive),run=bad.runs[0];
 if(where==='sample')run.samples[0][k]={ticks:0,nonLoopback:0,unavailable:true};
 else run.finalSweep[k]={ticks:0,nonLoopback:0,unavailable:true};
 const file=path.join(work,`unavailable-${where}-${k}.json`);fs.writeFileSync(file,JSON.stringify(bad));
 const result=spawnSync(process.execPath,[counter,file,'--nonce',fakeNonce],{cwd:ROOT,encoding:'utf8'});let parsed;try{parsed=JSON.parse(result.stdout)}catch{parsed={findings:[]}}
 const expected=`run1-${where==='sample'?'sample1-':'final-'}${k}-unavailable`;
 results.push({name:`unavailable-${where}-${k}`,exit:result.status,findings:parsed.findings,expected,matched:result.status===1&&parsed.findings.includes(expected)});
}
// The committed round-39 receipt has no fresh invocation nonce and must not replay under a new token.
const staleNonce='b'.repeat(64),stale=spawnSync(process.execPath,[counter,path.join(ROOT,'corpus/evidence/round-39/playwright-egress/receipt.json'),'--nonce',staleNonce],{cwd:ROOT,encoding:'utf8'});let staleOut;try{staleOut=JSON.parse(stale.stdout)}catch{staleOut={findings:[]}}
results.push({name:'round39-replayed-with-new-nonce',exit:stale.status,findings:staleOut.findings,matched:stale.status===1&&staleOut.findings.includes('run-nonce-mismatch')});
// Even a synthetic JSON receipt cannot be reused as the measurement output: the wrapper refuses an existing path before it starts Chromium.
const replayPath=path.join(work,'pre-existing-synthetic-replay.json'),scratch=path.join(work,'must-not-create-driver-scratch');fs.writeFileSync(replayPath,JSON.stringify(positive));
const replay=spawnSync(process.execPath,[wrapper,'--out',replayPath,'--scratch',scratch],{cwd:ROOT,encoding:'utf8'});
results.push({name:'wrapper-refuses-pre-existing-synthetic-replay',exit:replay.status,stderr:replay.stderr.trim(),scratchCreated:fs.existsSync(scratch),matched:replay.status===1&&replay.stderr.includes('output-already-exists')&&!fs.existsSync(scratch)});
const out={schema:'tabi-r40-c1-measure-selftest-v2',cases:results.length,passed:results.filter(r=>r.matched).length,results,failures:results.filter(r=>!r.matched).map(r=>r.name)};
console.log(JSON.stringify(out));process.exit(out.failures.length?1:0);
