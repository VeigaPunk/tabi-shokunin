import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';
const S=process.argv[2];const nonce='ab'.repeat(32);
const d=spawn(process.execPath,['/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs','--round40','--runs','2','--out',S+'/receipt.json','--scratch',S+'/drv','--nonce',nonce],{stdio:['ignore','pipe','pipe'],cwd:S});
let so='';d.stdout.on('data',b=>so+=b);d.stderr.on('data',b=>so+=b);
const seen=new Map();const t0=Date.now();
const iv=setInterval(()=>{const r=spawnSync('ps',['-eo','pid=,ppid=,args=','--no-headers'],{encoding:'utf8'}).stdout.split('\n');
 const rows=r.map(l=>l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean).map(m=>[+m[1],+m[2],m[3]]);
 const ch=new Map();for(const [p,pp] of rows){(ch.get(pp)||ch.set(pp,[]).get(pp)).push(p)}
 const q=[d.pid];const set=new Set();while(q.length){const p=q.shift();for(const c of ch.get(p)||[]){if(!set.has(c)){set.add(c);q.push(c)}}}
 for(const p of set){if(!seen.has(p)){const row=rows.find(x=>x[0]===p);seen.set(p,{first:Date.now()-t0,ppid:row[1],args:row[2].slice(0,110)})}}},40);
d.on('close',c=>{clearInterval(iv);console.log('exit',c,so.slice(-400));fs.writeFileSync(S+'/seen.json',JSON.stringify([...seen],null,0));});
