import fs from 'node:fs';
const urlOf=(s)=>{const m=/https?:\/\/[^\s|]+/.exec(s); if(!m)return ""; let u=m[0].replace(/#[^ ]*$/,"").replace(/\/$/,"").replace(/^[A-Za-z]+:\/\//,""); const n=u.indexOf("/"); return n? u.slice(0,n).toLowerCase()+u.slice(n) : u.toLowerCase();};
function w04(text){
  const lines=text.split('\n'); let inReg=false; const urlSeen=new Set(), urlScopes=new Set(); const out=[];
  for(const raw of lines){
    let line=raw;
    if(/^ {0,3}##[ \t]/.test(line)){ inReg=line.replace(/^ {0,3}/,"").slice(2).trim()==="Registry"; continue; }
    if(/^ {0,3}#[ \t]/.test(line)){ inReg=false; continue; }
    if(!/^ {0,3}\|/.test(line)) continue;
    line=line.replace(/^ {0,3}/,"");
    if(!inReg) continue;
    const c=line.split('|').map(s=>s.trim());
    if(c[1]==="id") continue;
    if(c.slice(1,-1).every(x=>/^:?-+:?$/.test(x)||x==="")) continue;
    const id=c[1], source=c[2], scope=c[5];
    const u=urlOf(source);
    const key=u+'\u0000'+scope;
    if(u && urlSeen.has(u) && !urlScopes.has(key)) out.push(`${id} ${u}`);
    if(u){ urlSeen.add(u); urlScopes.add(key); }
  }
  return out;
}
const head=fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md','utf8');
import { execSync } from 'node:child_process';
const prev=execSync('git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 8c081aa3:corpus/SOURCES.md',{encoding:'utf8',maxBuffer:64*1024*1024});
const a=w04(head), b=w04(prev);
console.log('HEAD w04',a.length,'8c081aa3 w04',b.length);
console.log('HEAD S187/S188:',a.filter(x=>/^S18[78] /.test(x)));
console.log('HEAD S173/S174:',a.filter(x=>/^S17[34] /.test(x)));
console.log('prev S173/S174:',b.filter(x=>/^S17[34] /.test(x)));
