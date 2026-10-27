// Does the PATH-STRING scan actually SEE the real firefox child? (false-negative scope)
// Launches the lane's pinned Firefox 158.0.1 headless, about:blank only (no network target).
import { readdirSync, readFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin', FREEZE='99437d29de036415a9f2d0524343617a3b19988a';
const src=spawnSync('git',['-C',LANE,'show',`${FREEZE}:.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`],{encoding:'utf8',maxBuffer:64*1024*1024}).stdout;
const i=src.indexOf('function scratchSurvivors');
const FN=src.slice(i,src.indexOf('\n}\n',i)+3);
const scratchSurvivors=new Function('readdirSync','readFileSync',`${FN}\nreturn scratchSurvivors;`)(readdirSync,readFileSync);
const BASE=process.env.TMPDIR; const A=mkdtempSync(join(BASE,'tabi-r36-c2-live-'));
const prof=join(A,'profiles','p1'); mkdirSync(prof,{recursive:true});
const home=join(A,'home'); for(const d of ['.config','.cache','.local/share','.local/state']) mkdirSync(join(home,d),{recursive:true});
const out={A,steps:[]}; const cl=(p)=>{try{return readFileSync(`/proc/${p}/cmdline`,'utf8').replace(/\0/g,' ').trim();}catch{return null;}};
const FX='/home/vgpnk/.local/opt/firefox-158.0.1/firefox';
const env={PATH:process.env.PATH,HOME:home,TMPDIR:join(A,'tmp'),XDG_CONFIG_HOME:join(home,'.config'),XDG_CACHE_HOME:join(home,'.cache'),XDG_DATA_HOME:join(home,'.local/share'),XDG_STATE_HOME:join(home,'.local/state'),MOZ_HEADLESS:'1',LC_ALL:'C.UTF-8'};
const fx=spawn(FX,['-profile',prof,'about:blank'],{stdio:'ignore',env});
await new Promise(r=>setTimeout(r,4000));
// every process whose cmdline mentions the scratch, whether or not the scan's substring matches
const pids=readdirSync('/proc').filter(p=>/^[0-9]+$/.test(p));
const mentioning=[]; for(const p of pids){const c=cl(p); if(c&&c.includes(A)) mentioning.push({pid:Number(p),cmdline:c.slice(0,220)});}
const found=scratchSurvivors(A);
out.steps.push({step:'fx-real-child',fxPid:fx.pid,allMentioningA:mentioning,scanFound:found,scanFoundMatchesMentioning:JSON.stringify(found.sort())===JSON.stringify(mentioning.map(m=>m.pid).sort()),mentionedButNotFlagged:mentioning.filter(m=>!found.includes(m.pid)).map(m=>m.pid)});
// geckodriver-style: does the scan see firefox when launched by geckodriver with --profile-root?
try{fx.kill('SIGKILL');}catch{}
await new Promise(r=>setTimeout(r,800));
rmSync(A,{recursive:true,force:true});
console.log(JSON.stringify(out,null,2));
