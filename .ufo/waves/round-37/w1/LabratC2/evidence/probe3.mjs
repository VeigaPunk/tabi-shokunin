import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin', FREEZE='99437d29de036415a9f2d0524343617a3b19988a';
const src=spawnSync('git',['-C',LANE,'show',`${FREEZE}:.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`],{encoding:'utf8',maxBuffer:64*1024*1024}).stdout;
const i=src.indexOf('function scratchSurvivors');
const FN=src.slice(i,src.indexOf('\n}\n',i)+3);
const scratchSurvivors=new Function('readdirSync','readFileSync',`${FN}\nreturn scratchSurvivors;`)(readdirSync,readFileSync);
const BASE=process.env.TMPDIR; const A=mkdtempSync(join(BASE,'tabi-r36-c2-live-'));
const out={A,steps:[]}; const cl=(p)=>{try{return readFileSync(`/proc/${p}/cmdline`,'utf8').replace(/\0/g,' ').trim();}catch{return null;}};
// W1: glob expanded to A SPECIFICALLY (a cleanup agent that saw the dir name)
{
  const g=spawn('bash',['-c',`exec -a "$(ls -d ${A})" sleep 30`]);
  await new Promise(r=>setTimeout(r,250));
  const f=scratchSurvivors(A);
  out.steps.push({step:'W1-glob-expanded-to-A',pid:g.pid,found:f,cmdlines:f.map(cl),flagged:f.includes(g.pid)});
  try{process.kill(g.pid,'SIGKILL');}catch{}
}
// W2: a process whose ARGV mentions A but which is a completely unrelated tool
//     (e.g. `tail -f A/log`, `cp A/x /tmp/y`) — realistic for a monitoring agent
{
  const u=spawn('tail',['-f','/dev/null'],{argv0:`monitor-agent --watch=${A}/state`});
  await new Promise(r=>setTimeout(r,250));
  const f=scratchSurvivors(A);
  out.steps.push({step:'W2-unrelated-tool-mentions-path',pid:u.pid,found:f,cmdlines:f.map(cl),flagged:f.includes(u.pid)});
  try{process.kill(u.pid,'SIGKILL');}catch{}
}
// W3: does the scan see processes owned by OTHER users? (permission behaviour)
{
  const f=scratchSurvivors(A);
  const uid=process.getuid();
  out.steps.push({step:'W3-permission',uid,scanSelfUser:true,note:'cmdline of other-user procs is unreadable -> catch -> continue (silently skipped)'});
}
// W4: descendant-of-counter scope — a child spawned by the counter that inherits the path
{
  const child=spawn('sleep',['30'],{argv0:`${A}/profiles/geckodriver`});
  await new Promise(r=>setTimeout(r,250));
  const f=scratchSurvivors(A);
  out.steps.push({step:'W4-intended-child',pid:child.pid,found:f,cmdlines:f.map(cl),flagged:f.includes(child.pid)});
  try{process.kill(child.pid,'SIGKILL');}catch{}
}
rmSync(A,{recursive:true,force:true});
console.log(JSON.stringify(out,null,2));
