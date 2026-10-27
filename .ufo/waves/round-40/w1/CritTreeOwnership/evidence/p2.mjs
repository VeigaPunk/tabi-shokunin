import { firefox } from '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs';
import {createServer} from 'node:http';import {spawnSync} from 'node:child_process';import fs from 'node:fs';
const srv=createServer((q,s)=>s.end('<title>x</title>hi'));await new Promise(r=>srv.listen(0,'127.0.0.1',r));const port=srv.address().port;
const ps=()=>spawnSync('ps',['-eo','pid=,ppid=,args=','--no-headers'],{encoding:'utf8'}).stdout.split('\n').map(l=>l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean).map(m=>[+m[1],+m[2],m[3]]);
const desc=(root)=>{const rows=ps();const s=new Set([root]);let ch=true;while(ch){ch=false;for(const [p,pp] of rows)if(s.has(pp)&&!s.has(p)){s.add(p);ch=true}}return [...s]};
const b=await firefox.launch({headless:true});await new Promise(r=>setTimeout(r,400));
const root=ps().find(([p,pp,a])=>pp===process.pid&&/ms-playwright\/firefox-\d+\//.test(a))[0];
const tree0=desc(root);
const pg=await b.newPage();await pg.goto(`http://127.0.0.1:${port}/`);await new Promise(r=>setTimeout(r,800));
const tree1=desc(root);
const tcp=['/proc/net/tcp','/proc/net/tcp6'].flatMap(f=>fs.readFileSync(f,'utf8').split('\n').slice(1).map(l=>l.trim().split(/\s+/)).filter(f=>f.length>9).map(f=>({rem:f[2],loc:f[1],st:f[3],ino:f[9]})));
const rowsAll=ps();
for(const p of tree1){const fds=[];try{for(const fd of fs.readdirSync(`/proc/${p}/fd`)){const l=fs.readlinkSync(`/proc/${p}/fd/${fd}`);const m=/^socket:\[(\d+)\]$/.exec(l);if(m)fds.push(m[1])}}catch{}
 const hits=tcp.filter(t=>fds.includes(t.ino)).map(t=>`${t.loc}->${t.rem}/${t.st}`);
 const a=(rowsAll.find(x=>x[0]===p)||[,,''])[2];const kind=(/-contentproc/.test(a)?(a.match(/ (\w+)$/)||[])[1]:'parent');
 console.log(p,tree0.includes(p)?'IN-tree0':'LATE',kind,'tcp:',hits.join(' ')||'-')}
await b.close();srv.close();
