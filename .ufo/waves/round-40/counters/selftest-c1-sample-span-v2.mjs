#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [receiptPath,oldCounter,newCounter,work]=process.argv.slice(2);
if(!receiptPath||!oldCounter||!newCounter||!work){console.error('usage: node selftest-c1-sample-span-v2.mjs <receipt> <old-counter> <new-counter> <work-dir>');process.exit(64)}
fs.mkdirSync(work,{recursive:true});
const original=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const cases=[];
function invoke(name,counter,doc,expectExit,expectedFinding) {
  const file=path.join(work,`${name}.json`); fs.writeFileSync(file,JSON.stringify(doc));
  const r=spawnSync(process.execPath,[counter,file],{encoding:'utf8'});
  let out; try{out=JSON.parse(r.stdout)}catch{out={predicate:false,findings:[]}}
  const findingOk=expectedFinding===null?out.findings.length===0:out.findings.includes(expectedFinding);
  const matched=r.status===expectExit&&findingOk&&out.predicate===(expectExit===0);
  cases.push({name,counter:path.basename(counter),exit:r.status,predicate:out.predicate,findings:out.findings,expectedExit:expectExit,expectedFinding,matched});
}
function positiveFixture() {
  const d=structuredClone(original); d.schema='tabi-pw-firefox-egress-r40'; d.refused=false;
  for(const r of d.runs) {
    r.refused=false;
    const start=r.samples[0].t;
    r.samples.forEach((s,i)=>{s.t=start+i*150; for(const k of ['ss','proc']) {s[k].unavailable=false;s[k].ticks=1;s[k].nonLoopback=0}});
    for(const k of ['ss','proc']) {r.finalSweep[k].unavailable=false;r.finalSweep[k].ticks=1;r.finalSweep[k].nonLoopback=0}
    r.coverageMs=1200; r.survivors=0; r.survivorPids=[]; r.portClosed=true;
  }
  d.egressNonLoopback=0; d.survivors=0; return d;
}
const base=positiveFixture();
invoke('positive-v1',oldCounter,base,0,null);
invoke('positive-v2',newCounter,base,0,null);
for(const [where,k] of [['sample','ss'],['sample','proc'],['final','ss'],['final','proc']]) {
  const bad=structuredClone(base), r=bad.runs[0];
  if(where==='sample') r.samples[0][k]={ticks:0,nonLoopback:0,unavailable:true};
  else r.finalSweep[k]={ticks:0,nonLoopback:0,unavailable:true};
  const id=`unavailable-${where}-${k}`;
  invoke(`${id}-old`,oldCounter,bad,0,null);
  invoke(`${id}-new`,newCounter,bad,1,`run1-${where==='sample'?'sample1-':''}${where==='final'?'final-':''}${k}-unavailable`);
}
const summary={schema:'tabi-r40-c1-counter-selftest-v2',cases:cases.length,passed:cases.filter(x=>x.matched).length,failures:cases.filter(x=>!x.matched),results:cases};
console.log(JSON.stringify(summary));
process.exit(summary.failures.length?1:0);
