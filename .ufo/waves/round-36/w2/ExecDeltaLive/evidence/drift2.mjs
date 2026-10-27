import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const FLEET='/home/vgpnk/Projects/shokunin';
const ENV={PATH:process.env.PATH,HOME:process.env.HOME,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',LC_ALL:'C'};
function git(repo,args){const r=spawnSync('git',['-C',repo,...args],{encoding:'buffer',maxBuffer:256*1024*1024,env:ENV});if(r.status!==0)throw new Error(r.stderr.toString());return r.stdout.toString('utf8');}
const lines=(b)=>b.split('\n').map(l=>l.replace(/\r$/,''));
const src=readFileSync('./c1-counter.mjs','utf8');
const m=src.match(/const PINS = Object\.freeze\(\{([\s\S]*?)\}\);/);
const PINS={};
for(const line of m[1].split('\n')){const mm=line.match(/^\s*'?([a-z0-9-]+)'?:\s*'([0-9a-f]{40})'/);if(mm)PINS[mm[1]]=mm[2];}
const frozen=JSON.parse(readFileSync('./freeze-pins.json','utf8'));
const liveAll=JSON.parse(readFileSync('./live-pins-all.json','utf8'));
const LANE=FLEET+'/tabi-shokunin';
const FREEZE='2e7b7a8920bff47fae6f75c3d06e48e37767099e';
const screenLines=lines(git(LANE,['show',FREEZE+':corpus/adjacency-screen-browser.tsv']));
const refRe=/^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const allRows=[];
for(const l of screenLines.slice(1)){ if(!l) continue; const ref=l.split('\t')[0]; const mm=refRe.exec(ref); if(mm) allRows.push({ref,lane:mm[1],pin:mm[2],path:mm[3],n:Number(mm[4])}); }
function driftedSet(pins){ return new Set(Object.entries(pins).filter(([s,h])=>h!==PINS[s]).map(([s])=>s)); }
const df=driftedSet(frozen), dl=driftedSet(liveAll);
console.log('drifted set FROZEN (12):', [...df].sort().join(' '));
console.log('drifted set LIVE@tip   :', [...dl].sort().join(' '));
console.log('  only-in-frozen:', [...df].filter(x=>!dl.has(x)).join(' ')||'(none)');
console.log('  only-in-live  :', [...dl].filter(x=>!df.has(x)).join(' ')||'(none)');
const fRows=allRows.filter(r=>df.has(r.lane)), lRows=allRows.filter(r=>dl.has(r.lane));
console.log('drift-eligible screen rows: frozen =', fRows.length, ' live@tip =', lRows.length);
const fk=new Set(fRows.map(r=>r.ref)), lk=new Set(lRows.map(r=>r.ref));
console.log('  rows in frozen-set but not live-set:', fRows.filter(r=>!lk.has(r.ref)).length);
console.log('  rows in live-set but not frozen-set:', lRows.filter(r=>!fk.has(r.ref)).length);
for(const r of lRows.filter(r=>!fk.has(r.ref))) console.log('    +', r.ref, ' (lane', r.lane+')');
// per-lane row counts frozen
const per={}; for(const r of fRows) per[r.lane]=(per[r.lane]||0)+1;
console.log('frozen drift rows per lane:', JSON.stringify(per));
// committed ledger check
const led=lines(git(LANE,['show',FREEZE+':corpus/adjacency-screen-drift.tsv']));
console.log('committed ledger rows (excl header):', led.slice(1).filter(Boolean).length);
const ledRows=led.slice(1).filter(Boolean).map(l=>{const f=l.split('\t');return {ref:f[0],status:f[1],note:f[2]};});
const notInLive=ledRows.filter(r=>!lk.has(r.ref));
console.log('committed ledger rows NOT in live drift set:', notInLive.length, '(counter would emit audit-not-a-drift-row)');
const perL={}; for(const r of lRows) perL[r.lane]=(perL[r.lane]||0)+1;
console.log('live drift rows per lane:', JSON.stringify(perL));
