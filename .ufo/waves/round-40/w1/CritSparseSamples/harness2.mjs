import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C=ROOT+'/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs';
const base=JSON.parse(fs.readFileSync(ROOT+'/corpus/evidence/round-39/playwright-egress/receipt.json','utf8'));
const N='ab'.repeat(32), T0=1793120277000;
const smp=t=>{const o={ss:{ticks:1,lines:0,nonLoopback:0},proc:{ticks:1,inodes:0,nonLoopback:0}};if(t!==undefined)o.t=t;return {t:undefined,...o,...(t!==undefined?{t}:{})}};
function mk(ts,mut){const r=structuredClone(base);r.schema='tabi-pw-firefox-egress-receipt-r40';r.runNonce=N;r.refused=false;
 for(const x of r.runs){x.runNonce=N;x.refused=false;x.samples=ts.map(smp);x.survivors=0;x.survivorPids=[];x.portClosed=true;x.finalSweep={t:T0+5000,ss:{ticks:1,lines:0,nonLoopback:0},proc:{ticks:1,inodes:0,nonLoopback:0}};}
 if(mut)mut(r);return r}
function run(name,ts,mut){const f=name.split(' ')[0]+'.json';fs.writeFileSync(f,JSON.stringify(mk(ts,mut)));
 const raw=JSON.parse(fs.readFileSync(f,'utf8')).runs[0].samples.map(s=>s.t===undefined?'<absent>':s.t);
 const p=spawnSync(process.execPath,[C,f,'--nonce',N],{encoding:'utf8'});const o=JSON.parse(p.stdout);
 console.log(`${name}\n  run1.t(as serialized)=${JSON.stringify(raw.map(t=>typeof t==='number'?t-T0:t))}\n  exit=${p.status} predicate=${o.predicate} findings=${JSON.stringify(o.findings)}`)}
const seq=(n,st,o=T0)=>Array.from({length:n},(_,i)=>o+i*st);
run('K2-missing-t-key-absent-mid',seq(8,200).map((t,i)=>i===3?undefined:t));
run('K3-missing-t-key-absent-first-and-last-only-6-timestamped',seq(8,200).map((t,i)=>i===0||i===7?undefined:t));
run('D2-dup-final-pair',[...seq(7,200),T0+1200]);
run('D3-exact-dup-first-two',[T0,T0,...seq(6,250,T0+250)]);
run('R2-seconds-unit-8samples-span-1.4s',seq(8,200).map(t=>t/1000));
run('R3-seconds-unit-span-1400-s(absurd)',seq(8,200,0).map(t=>t*1000));
run('TT-tail-appended-post-close: 7 live samples 0..600ms + 1 tail sample at 1000',[...seq(7,100),T0+1000]);
run('TT2-tail-appended: 7 live 0..300ms (window 300ms) + tail sample at 1000',[...seq(7,50),T0+1000]);
run('TT3-tail-appended: 7 live samples in 1ms + tail at 1000 (only 1ms live coverage)',[...seq(7,0.001).map((t,i)=>T0+i*0.001),T0+1000]);
run('WIN999-8samples-window-999',[...seq(7,100),T0+999]);
run('WIN999b-fractional-999.999',[...seq(7,100),T0+999.999]);
run('WIN1000-fractional-1000.0',[...seq(7,100),T0+1000.0]);
run('NEG0-t-negative-finite-anchor-free',seq(8,200,-100000));
run('ZERO-t-zero-based',seq(8,200,0));
