#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [receiptPath,counterPath,work]=process.argv.slice(2);
if(!receiptPath||!counterPath||!work){console.error('usage: node selftest-c1-sample-span-v2.mjs <receipt> <counter> <work-dir>');process.exit(64)}
fs.mkdirSync(work,{recursive:true});
const original=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const cases=[];
function run(name,mutate,expected) {
  const d=structuredClone(original); mutate?.(d);
  const file=path.join(work,`${name}.json`); fs.writeFileSync(file,JSON.stringify(d));
  const r=spawnSync(process.execPath,[counterPath,file],{encoding:'utf8'});
  let out; try{out=JSON.parse(r.stdout)}catch{out={findings:[]}}
  const matched=r.status===1&&expected.every(x=>out.findings.includes(x));
  cases.push({name,exit:r.status,findings:out.findings,expected,matched});
}
run('baseline-noop',null,['schema','run1-sample-span','run2-sample-span']);
for(const k of ['ss','proc']) run(`sample-${k}-unavailable`,d=>{d.schema='tabi-pw-firefox-egress-r40';d.runs[0].samples[0][k]={ticks:0,nonLoopback:0,unavailable:true}},[`run1-sample1-${k}-unavailable`]);
for(const k of ['ss','proc']) run(`final-${k}-unavailable`,d=>{d.schema='tabi-pw-firefox-egress-r40';d.runs[0].finalSweep[k]={ticks:0,nonLoopback:0,unavailable:true}},[`run1-final-${k}-unavailable`]);
const result={schema:'tabi-r40-c1-counter-selftest-v2',cases:cases.length,passed:cases.filter(x=>x.matched).length,failures:cases.filter(x=>!x.matched),results:cases};
console.log(JSON.stringify(result));
process.exit(result.failures.length?1:0);
