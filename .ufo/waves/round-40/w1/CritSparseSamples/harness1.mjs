import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C=ROOT+'/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs';
const base=JSON.parse(fs.readFileSync(ROOT+'/corpus/evidence/round-39/playwright-egress/receipt.json','utf8'));
const N='ab'.repeat(32);
const smp=t=>({t,ss:{ticks:1,lines:0,nonLoopback:0},proc:{ticks:1,inodes:0,nonLoopback:0}});
function good(ts){ // synthetic r40-shaped receipt carrying nonce; surfaces otherwise valid
 const r=structuredClone(base); r.schema='tabi-pw-firefox-egress-receipt-r40'; r.runNonce=N; r.refused=false;
 for(const run of r.runs){run.runNonce=N;run.refused=false;run.samples=ts.map(smp);run.survivors=0;run.survivorPids=[];run.portClosed=true;
  run.finalSweep={t:(typeof ts.at(-1)==='number'?ts.at(-1):0)+50,ss:{ticks:1,lines:0,nonLoopback:0},proc:{ticks:1,inodes:0,nonLoopback:0}};}
 return r;}
const T0=1793120277000;
const seq=(n,step,o=T0)=>Array.from({length:n},(_,i)=>o+i*step);
const cases={
 'A-control-dense-9@125ms(span1000)':seq(9,125),
 'B-sparse-8@143ms(span1001)':seq(8,143),
 'C-sparse-gap:7 samples in 0..600 then one at 1000':[...seq(7,100),T0+1000],
 'D-sparse-gap:one at 0, 6 clustered 500-505, one at 1000':[T0,...Array.from({length:6},(_,i)=>T0+500+i),T0+1000],
 'E-span-exactly-999':[...seq(7,100),T0+999],
 'F-span-exactly-1000(8 samples)':[...seq(7,100),T0+1000],
 'G-sampled-window<=999 (r39-like 9@100ms span800)':seq(9,100),
 'H-dup-timestamp':[...seq(7,200),T0+1200,T0+1200].slice(0,8).map((t,i)=>i===7?T0+1200-0:t).map((t,i,a)=>i===7?a[6]:t),
 'I-decreasing-last':[...seq(7,200),T0+500],
 'J-decreasing-middle(but last-first>=1000)':[T0,T0+300,T0+200,T0+600,T0+800,T0+1000,T0+1200,T0+1400],
 'K-missing-t(undefined) in middle':[...seq(8,200)].map((t,i)=>i===3?undefined:t),
 'L-NaN':[...seq(8,200)].map((t,i)=>i===3?NaN:t),
 'M-string-numeric':[...seq(8,200)].map((t,i)=>i===3?String(t):t),
 'N-all-strings':seq(8,200).map(String),
 'O-null-t':[...seq(8,200)].map((t,i)=>i===0?null:t),
 'P-Infinity-last (JSON->null)':[...seq(7,100),Infinity],
 'Q-7-samples-span-1200':seq(7,200),
 'R-seconds-unit (t in s, 9 samples span 0.8s... 8 samples 0..1400 as s*1000?)':seq(8,200).map(t=>t/1000),
};
const out=[];
function run(name,ts,mut){const r=good(ts); if(mut)mut(r); const f=name.replace(/[^A-Za-z0-9]+/g,'_').slice(0,40)+'.json'; fs.writeFileSync(f,JSON.stringify(r));
 const p=spawnSync(process.execPath,[C,f,'--nonce',N],{encoding:'utf8'});
 let o={};try{o=JSON.parse(p.stdout)}catch{}
 out.push({name,ts:ts.map(t=>typeof t==='number'?t-T0:t),exit:p.status,predicate:o.predicate,findings:o.findings}); }
for(const [n,ts] of Object.entries(cases)) run(n,ts);
// tail-inclusive: samples span 799 but coverageMs/finalSweep.t push total >=1000
run('S-tail-inclusive: samples span 800 (r39) + finalSweep.t at +1560, coverageMs 1560',seq(9,100),r=>{for(const x of r.runs){x.coverageMs=1560;x.finalSweep.t=T0+1560;}});
run('T-tail-inclusive: sampleCount field=20 lie, samples=8 span 700',seq(8,100),r=>{for(const x of r.runs){x.sampleCount=20;x.coverageMs=5000;}});
run('U-run1 good, run2 span 700 (asymmetric)',seq(8,150),r=>{r.runs[1].samples=seq(8,100).map(smp)});
run('V-run1 dense, run2 sparse gap w/ span 1000',seq(9,125),r=>{r.runs[1].samples=[...seq(7,100),T0+1000].map(smp)});
run('W-unit mismatch: t in seconds, 8 samples span 7s (=7 units<1000)',seq(8,1000).map(t=>(t-T0)/1000));
run('X-negative/epoch-0 finite timestamps span>=1000 (not Date.now-like)',[-5000,-4500,-4000,-3500,-3000,-2500,-2000,-1500]);
run('Y-future timestamps / not anchored to measuredAt',seq(8,200,9e15));
run('Z-extra sample fields missing t but finalSweep ok; samples array has non-object (number)',seq(8,200),r=>{r.runs[0].samples[2]=5});
fs.writeFileSync('results.json',JSON.stringify(out,null,1));
for(const o of out)console.log(`exit=${o.exit} pred=${o.predicate} | ${o.name}\n   ts=${JSON.stringify(o.ts)}\n   findings=${JSON.stringify(o.findings)}`);
