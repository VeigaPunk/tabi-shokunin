// local-only: server bound to host's own LAN address 192.168.0.253 (no packet leaves host; no external peer)
import net from 'node:net';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { sampleSockets, ownedTree } from './obs.mjs';
const LAN='192.168.0.253';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2];
if(mode==='child'){
  // child: runs inside the owned tree. burst = short-lived non-loopback connection of ~durMs, every periodMs
  const port=Number(process.argv[3]),durMs=Number(process.argv[4]),periodMs=Number(process.argv[5]),n=Number(process.argv[6]);
  for(let i=0;i<n;i++){
    await new Promise(res=>{const s=net.connect(port,LAN,()=>{setTimeout(()=>{s.destroy();res()},durMs)});s.on('error',res)});
    await sleep(periodMs);
  }
  process.exit(0);
}
const port=Number(fs.readFileSync(new URL('./port',import.meta.url).pathname,'utf8'));
const caseName=process.argv[3]; // 'late-child' or 'initial-child'
const durMs=Number(process.argv[4]), periodMs=Number(process.argv[5]), n=Number(process.argv[6]);
// Mimic driver: owned tree snapshot computed ONCE at launch, reused every tick (rec.owned.tree).
let tree0, child;
if(caseName==='initial-child'){ child=spawn(process.execPath,[new URL(import.meta.url).pathname,'child',port,durMs,periodMs,n],{stdio:'inherit'}); await sleep(300); tree0=ownedTree([process.pid]); }
else { tree0=ownedTree([process.pid]); await sleep(50); child=spawn(process.execPath,[new URL(import.meta.url).pathname,'child',port,durMs,periodMs,n],{stdio:'inherit'}); }
const samples=[]; const t0=Date.now();
const iv=setInterval(()=>{const s=sampleSockets(tree0);samples.push(s)},100);
await new Promise(r=>child.on('exit',r)); await sleep(150); clearInterval(iv);
const span=samples.at(-1).t-samples[0].t;
const seen=samples.filter(s=>s.ss.lines>0||s.proc.inodes>0).length;
const nl=samples.reduce((a,s)=>a+s.ss.nonLoopback+s.proc.nonLoopback,0);
console.log(JSON.stringify({caseName,durMs,periodMs,connectionsMade:n,treeAtSnapshot:tree0.length,samples:samples.length,spanMs:span,samplesWithAnySocket:seen,nonLoopbackObserved:nl,allTicksPositive:samples.every(s=>s.ss.ticks>0&&s.proc.ticks>0)}));
process.exit(0);
