import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const KAKE='/home/vgpnk/Projects/shokunin/kake-shokunin';
const PIN='044048597d62f3199494b63b36e90dd57825e350';
const ledger=readFileSync(LANE+'/corpus/adjacency-screen-browser.tsv','utf8').split('\n');
const rows=[];
for(let i=1;i<ledger.length;i++){const l=ledger[i];if(!l)continue;const f=l.split('\t');if(f[0].startsWith('kake-shokunin@'))rows.push({row:i+1,ref:f[0],reason:f[1],surface:f[2],quote:f[3],note:f.slice(4).join('\t')});}
console.log('KAKE_SCREEN_ROWS',rows.length);
const blob=(p)=>{try{return execFileSync('git',['-C',KAKE,'show',`${PIN}:${p}`],{maxBuffer:64*1024*1024}).toString('utf8');}catch(e){return null;}};
const out=[];
for(const r of rows){
  const m=/^kake-shokunin@[0-9a-f]{40}:(.+):([1-9][0-9]*)$/.exec(r.ref);
  const p=m[1], n=+m[2];
  const b=blob(p);
  out.push('\n'+'='.repeat(100));
  out.push(`ROW ${r.row} ${r.ref}`);
  out.push(`REASON=${r.reason} SURFACE=${r.surface}`);
  out.push(`QUOTE=${r.quote}`);
  out.push(`NOTE=${r.note}`);
  out.push(`--- cited line ${n} in ${p} (pin ${PIN}) with +-4 context ---`);
  if(b===null){out.push('BLOB_MISSING');continue;}
  const ls=b.split('\n');
  for(let j=Math.max(1,n-4);j<=Math.min(ls.length,n+4);j++){
    const mark=j===n?'>>':'  ';
    out.push(`${mark} ${j}: ${ls[j-1]}`);
  }
}
console.log(out.join('\n'));
