import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const orig=JSON.parse(fs.readFileSync(ROOT+'/corpus/evidence/round-39/playwright-egress/receipt.json','utf8'));
const N='a'.repeat(64);
const base=structuredClone(orig);base.schema='tabi-pw-firefox-egress-receipt-r40';base.refused=false;base.runNonce=N;
for(const r of base.runs){r.refused=false;r.runNonce=N;const t0=r.samples[0].t;r.samples.forEach((s,i)=>{s.t=t0+i*150;for(const k of ['ss','proc']){s[k]={ticks:1,nonLoopback:0}}});r.finalSweep={ss:{ticks:1,nonLoopback:0},proc:{ticks:1,nonLoopback:0}};r.survivors=0;r.survivorPids=[];r.portClosed=true}
console.log('orig sample0',JSON.stringify(orig.runs[0].samples[0]),'final',JSON.stringify(orig.runs[0].finalSweep),'n',orig.runs[0].samples.length, 'tree', JSON.stringify(orig.runs[0].owned?.tree));
const cases={
 'base-minimal-ticks1-nl0-no-lines':b=>{},
 'sample-ss-absent':b=>{delete b.runs[0].samples[0].ss},
 'sample-ss-null':b=>{b.runs[0].samples[0].ss=null},
 'sample-ss-string':b=>{b.runs[0].samples[0].ss='ok'},
 'sample-ss-array':b=>{b.runs[0].samples[0].ss=[]},
 'sample-ss-true':b=>{b.runs[0].samples[0].ss=true},
 'sample-ss-number':b=>{b.runs[0].samples[0].ss=5},
 'sample-ss-ticks-string':b=>{b.runs[0].samples[0].ss.ticks='1'},
 'sample-ss-ticks-fraction':b=>{b.runs[0].samples[0].ss.ticks=1e-9},
 'sample-ss-ticks-huge-1e999':b=>{b.runs[0].samples[0].ss.ticks=JSON.parse('1e999')},
 'sample-ss-nonLoopback-missing':b=>{delete b.runs[0].samples[0].ss.nonLoopback},
 'sample-ss-nonLoopback-null':b=>{b.runs[0].samples[0].ss.nonLoopback=null},
 'sample-ss-nonLoopback-string0':b=>{b.runs[0].samples[0].ss.nonLoopback='0'},
 'sample-ss-nonLoopback-neg0':b=>{b.runs[0].samples[0].ss.nonLoopback=-0},
 'sample-ss-nonLoopback-1':b=>{b.runs[0].samples[0].ss.nonLoopback=1},
 'sample-ss-nonLoopback-neg1':b=>{b.runs[0].samples[0].ss.nonLoopback=-1},
 'sample-ss-nonLoopback-0.5':b=>{b.runs[0].samples[0].ss.nonLoopback=0.5},
 'sample-proc-unavailable-false-string':b=>{b.runs[0].samples[0].proc.unavailable='true'},
 'sample-proc-unavailable-1':b=>{b.runs[0].samples[0].proc.unavailable=1},
 'sample-proc-unavailable-true':b=>{b.runs[0].samples[0].proc.unavailable=true},
 'sample-proc-unavailable-null':b=>{b.runs[0].samples[0].proc.unavailable=null},
 'sample-proc-explicit-lines-0-inodes-0':b=>{for(const s of b.runs[0].samples){s.ss.lines=0;s.proc.inodes=0}},
 'sample-proc-lines-negative':b=>{b.runs[0].samples[0].ss.lines=-5},
 'all-surfaces-zero-observation-both-runs':b=>{for(const r of b.runs){for(const s of r.samples){s.ss={ticks:1,lines:0,nonLoopback:0};s.proc={ticks:1,inodes:0,nonLoopback:0}}}},
 'final-sweep-absent':b=>{delete b.runs[0].finalSweep},
 'final-sweep-null':b=>{b.runs[0].finalSweep=null},
 'final-sweep-unavailable-top':b=>{b.runs[0].finalSweep={unavailable:true}},
 'final-ss-null':b=>{b.runs[0].finalSweep.ss=null},
 'final-proc-string':b=>{b.runs[0].finalSweep.proc='x'},
 'final-proc-nl-missing':b=>{delete b.runs[0].finalSweep.proc.nonLoopback},
 'final-proc-nl-2':b=>{b.runs[0].finalSweep.proc.nonLoopback=2},
 'sample-with-extra-egress-field':b=>{b.runs[0].samples[0].ss.egressNonLoopback=7;b.runs[0].samples[0].proc.nonLoopbackPeers=['8.8.8.8:443']},
 'run-sockets-aggregate-nonzero-ignored':b=>{b.runs[0].sockets={ss:{nonLoopback:9},proc:{nonLoopback:9}};b.runs[0].egressNonLoopback=18;b.egressNonLoopback=18},
 'receipt-binding-false':b=>{b.binding=false},
 'sample-top-level-unavailable-sample':b=>{b.runs[0].samples[3]={t:b.runs[0].samples[3].t,unavailable:true}},
};
const out=[];
for(const [n,f] of Object.entries(cases)){const b=structuredClone(base);f(b);fs.writeFileSync(n+'.json',JSON.stringify(b));const r=spawnSync(process.execPath,[ROOT+'/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs',n+'.json','--nonce',N],{encoding:'utf8'});let p;try{p=JSON.parse(r.stdout)}catch{p={findings:['PARSE:'+r.stderr]}};out.push([n,r.status,p.findings.join(',').slice(0,120)]);}
for(const o of out)console.log(o.join(' | '));
