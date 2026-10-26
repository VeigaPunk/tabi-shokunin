import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const FLEET='/home/vgpnk/Projects/shokunin';
const ledger=fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen.tsv','utf8').replace(/\r/g,'').split('\n');
const header=ledger[0].split('\t');
console.log('HEADER:',JSON.stringify(header), header.length===5?'OK':'BAD');
const cache={};
function getLine(ref){const m=/^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):([^:]+):(\d+)$/.exec(ref);if(!m)return {err:'REF_FORMAT'};
 const [_,lane,commit,p,n]=m; const repo=`${FLEET}/${lane}-shokunin`; const key=lane+'|'+commit+':'+p;
 if(!(key in cache)){try{cache[key]=execFileSync('git',['-C',repo,'cat-file','blob',commit+':'+p],{encoding:'utf8',maxBuffer:1<<26}).replace(/\r/g,'').split('\n');}catch(e){return {err:'BLOB_UNREADABLE '+lane+' '+commit};}}
 const L=cache[key][parseInt(n,10)-1]; return {text:L, lane, commit, n:+n};
}
let bad=0, rows=[];
for(let i=1;i<ledger.length;i++){
  if(!ledger[i].trim())continue;
  const f=ledger[i].split('\t');
  if(f.length!==5){console.log(`ROW ${i+1}: COLS=${f.length}`);bad++;continue;}
  const [ref,reason,surface,quote]=f;
  const r=getLine(ref);
  if(r.err){console.log(`ROW ${i+1}: ${r.err}`);bad++;continue;}
  const verbatim=quote.length>0 && r.text.includes(quote);
  const words=quote.trim().split(/\s+/).filter(Boolean).length;
  const nonspace=quote.replace(/\s/g,'').length;
  const qok=verbatim&&words>=4&&words<=25&&nonspace>=20;
  const reasons=['not-browser-sense','same-surface','third-lane-report','no-claim-declared'];
  const rok=reasons.includes(reason);
  const sok=(reason==='same-surface')?(surface!=='-'):(surface==='-');
  if(!qok||!rok||!sok){bad++;console.log(`ROW ${i+1} ${ref} reason=${reason} surface=${surface} verbs=${verbatim} words=${words} ns=${nonspace} reasonOk=${rok} surfaceOk=${sok} line=${JSON.stringify(r.text)}`);}
  rows.push({i:i+1,ref,reason,surface,words,nonspace,verbatim});
}
console.log('TOTAL_ROWS',rows.length,'BAD_ROWS',bad);
console.log('VERBATIM_ALL', rows.every(r=>r.verbatim));
console.log('WORD_RANGE', Math.min(...rows.map(r=>r.words)), Math.max(...rows.map(r=>r.words)), 'NS_MIN', Math.min(...rows.map(r=>r.nonspace)));
