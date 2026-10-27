import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
const R='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const nonce='ab'.repeat(32);
const base=JSON.parse(fs.readFileSync(R+'/corpus/evidence/round-39/playwright-egress/receipt.json','utf8'));
function mk(tfn,zeroObs){
 const r=structuredClone(base); r.schema='tabi-pw-firefox-egress-receipt-r40'; r.runNonce=nonce; r.refused=false;
 for(const run of r.runs){run.runNonce=nonce; const t0=1800000000000;
  run.samples=Array.from({length:8},(_,i)=>({t:t0+tfn(i),ss:{ticks:1,lines:0,nonLoopback:0},proc:{ticks:1,inodes:0,nonLoopback:0}}));
  run.finalSweep={t:t0+2000,ss:{ticks:1,lines:0,nonLoopback:0},proc:{ticks:1,inodes:0,nonLoopback:0}}; run.refused=false;}
 return r;}
const cases={
 'A-7-samples-clustered-in-7ms-then-one-at-1000ms (gap 993ms)': i=>i<7?i:1000,
 'B-8-samples-first-at-0-then-7-clustered-at-1000ms (gap 1000ms blind head)': i=>i===0?0:1000+i,
 'C-evenly-spaced-143ms (control)': i=>i*143,
 'D-8-samples-spanning-999ms (control: should refuse)': i=>Math.round(i*999/7),
};
for(const [name,f] of Object.entries(cases)){fs.writeFileSync(`synth-${name[0]}.json`,JSON.stringify(mk(f)));
 const o=spawnSync('node',[R+'/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs',`synth-${name[0]}.json`,'--nonce',nonce],{encoding:'utf8'});
 const j=JSON.parse(o.stdout); console.log(name,'-> exit',o.status,'predicate',j.predicate,'findings',JSON.stringify(j.findings));}
