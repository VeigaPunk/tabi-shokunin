import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const KOT='/home/vgpnk/Projects/shokunin/kotoba-shokunin';
const REV='04f9623dde8ad35d470cecf766e421eafbcb47fa';
function show(repo, spec){ const r=spawnSync('git',['-C',repo,'show',spec],{encoding:'utf8',maxBuffer:1<<28});
  if(r.status!==0) return null; return r.stdout; }
const ledger=show(LANE,`${REV}:corpus/adjacency-screen-skill.tsv`);
const cand=readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/baseline/c1-candidates.tsv','utf8').split('\n');
const candMap=new Map();
for(const l of cand){ if(!l.trim()) continue; const f=l.split('\t'); candMap.set(f[0],{set:f[1],text:f[2]}); }
const lines=ledger.split('\n');
const cache=new Map();
function lineAt(commit,path,n){ const k=commit+':'+path; if(!cache.has(k)) cache.set(k, show(KOT,`${commit}:${path}`)); const b=cache.get(k); if(b===null) return null; const a=b.split('\n'); return a[n-1]??null; }
let n=0, ok=0;
for(const row of lines.slice(1)){ if(!row.trim()) continue; n++; const f=row.split('\t');
  if(!f[0].startsWith('kotoba-shokunin@')) continue;
  const m=/^kotoba-shokunin@([0-9a-f]{40}):([^:]+):(\d+)$/.exec(f[0]);
  if(!m){ console.log(`ROW ${n} REF-MALFORMED ${f[0]}`); continue; }
  const [ ,commit,path,ln]=m; const q=f[3];
  const line=lineAt(commit,path,Number(ln));
  const inLine=line!==null&&line.includes(q);
  const c=candMap.get(f[0]);
  const trimEq=c? c.text.trim()===line.trim():null;
  const wordCount=q.trim().split(/\s+/).length;
  const nonSpace=(q.match(/\S/g)||[]).length;
  if(inLine) ok++;
  console.log(`ROW ${n} ${path}:${ln} reason=${f[2]} surface=${f[3]===''?'?':f[2]} quoteInLine=${inLine} candidateTextEqualsPinLine=${trimEq} words=${wordCount} nonSpace=${nonSpace} set=${c?c.set:'-'}`);
}
console.log(`kotoba rows: ${ok} quote-verbatim of ${n===0?0:null}`);
