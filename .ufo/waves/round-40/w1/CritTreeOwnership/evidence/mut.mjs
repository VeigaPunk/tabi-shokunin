import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const C='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs';
const N='ab'.repeat(32);
const base=JSON.parse(fs.readFileSync('receipt.json','utf8'));
const cases={
 baseline:r=>{},
 'tree-empty':r=>{r.runs[0].owned.tree=[]},
 'tree-stale-unrelated-pid1':r=>{r.runs.forEach(x=>x.owned.tree=[1])},
 'tree-nonexistent-pid':r=>{r.runs.forEach(x=>x.owned.tree=[4194300])},
 'tree-garbage-strings':r=>{r.runs.forEach(x=>x.owned.tree=['x','y'])},
 'tree-null-elem':r=>{r.runs.forEach(x=>x.owned.tree=[null])},
 'tree-negative/dup':r=>{r.runs.forEach(x=>x.owned.tree=[-5,-5])},
 'wrong-root(roots=[] but tree nonempty)':r=>{r.runs.forEach(x=>x.owned.roots=[])},
 'roots-missing':r=>{r.runs.forEach(x=>delete x.owned.roots)},
 'nodePid-missing':r=>{r.runs.forEach(x=>delete x.owned.nodePid)},
 'nodePid-wrong':r=>{r.runs.forEach(x=>x.owned.nodePid=1)},
 'source-missing':r=>{r.runs.forEach(x=>delete x.owned.source)},
 'root-not-in-tree':r=>{r.runs.forEach(x=>x.owned.roots=[{pid:1,argv0:'/sbin/init'}])},
 'run2-tree==run1-tree (overlap)':r=>{r.runs[1].owned.tree=r.runs[0].owned.tree},
 'owned-missing-entirely':r=>{delete r.runs[0].owned},
 'zero observations (ss.lines/proc.inodes=0 everywhere)':r=>{r.runs.forEach(x=>x.samples.forEach(s=>{s.ss.lines=0;s.proc.inodes=0}))},
 'survivorPids-vs-tree decoupled':r=>{r.runs.forEach(x=>{x.owned.tree=[1];x.survivors=0;x.survivorPids=[]})},
 'owned.tree as object not array':r=>{r.runs.forEach(x=>x.owned.tree={a:1})},
};
for(const [k,f] of Object.entries(cases)){const r=structuredClone(base);f(r);fs.writeFileSync('m.json',JSON.stringify(r));
 const p=spawnSync('node',[C,'m.json','--nonce',N],{encoding:'utf8'});let o={};try{o=JSON.parse(p.stdout)}catch{}
 console.log(String(p.status).padEnd(3),k.padEnd(55),o.predicate,JSON.stringify((o.findings||[]).filter(x=>/owned/.test(x)))+ (p.stderr?p.stderr.trim():''))}
