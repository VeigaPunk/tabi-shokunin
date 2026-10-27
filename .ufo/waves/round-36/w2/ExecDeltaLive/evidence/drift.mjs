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
const live=JSON.parse(readFileSync('./live-pins.json','utf8'));
const drifted=new Set(Object.entries(frozen).filter(([s,h])=>h!==PINS[s]).map(([s])=>s));
// screen rows from the lane repo at the freeze
const LANE=FLEET+'/tabi-shokunin';
const FREEZE='2e7b7a8920bff47fae6f75c3d06e48e37767099e';
const screenLines=lines(git(LANE,['show',FREEZE+':corpus/adjacency-screen-browser.tsv']));
const refRe=/^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const driftRows=[];
for(const l of screenLines.slice(1)){ if(!l) continue; const ref=l.split('\t')[0]; const mm=refRe.exec(ref); if(mm&&drifted.has(mm[1])) driftRows.push({ref,...{lane:mm[1],pin:mm[2],path:mm[3],n:Number(mm[4])}}); }
console.log('drift-eligible screen rows:',driftRows.length);
function statusAt(d, row){
  const R=FLEET+'/'+row.lane+'-shokunin';
  const pinBuf=git(R,['show',row.pin+':'+row.path]);
  const cited=lines(pinBuf)[row.n-1];
  if(cited===undefined) return {status:'stale',detail:'pin line absent'};
  const c=cited.trim();
  let headBuf=null;
  try{headBuf=git(R,['show',d[row.lane]+':'+row.path]);}catch{ return {status:'stale',detail:'head file absent'}; }
  const hl=lines(headBuf);
  const atN=row.n<=hl.length?hl[row.n-1].trim():undefined;
  if(atN===c) return {status:'unchanged',detail:'same text at same line'};
  const rel=hl.map((t,i)=>[i+1,t.trim()]).filter(([,t])=>t===c).map(([i])=>i);
  if(rel.length) return {status:'moved',detail:'verbatim at :'+rel.join(',:'),relocations:rel};
  return {status:'stale',detail:'cited text absent at head'};
}
const diffs=[];
const counts={};
for(const row of driftRows){
  const f=statusAt(frozen,row), l=statusAt(live,row);
  const k=JSON.stringify([f.status,f.detail])+' -> '+JSON.stringify([l.status,l.detail]);
  counts[k]=(counts[k]||0)+1;
  if(f.status!==l.status||f.detail!==l.detail) diffs.push({...row,frozen:f,live:l});
}
console.log('\n=== transition counts (frozen -> live) ===');
for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1])) console.log(String(v).padStart(5), k);
console.log('\n=== rows whose status/detail CHANGES at live head:', diffs.length);
for(const d of diffs) console.log(' ', d.ref, '\n    frozen:', d.frozen.status, d.frozen.detail, '\n    live  :', d.live.status, d.live.detail);
