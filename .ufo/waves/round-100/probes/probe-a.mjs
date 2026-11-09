#!/usr/bin/env node
// Round-100 pre-freeze probe: verifies the r99 limit-4 leads reproduce under the r100 driver shape.
// 4 reps, single rep loop covering new arms: DUP3, EMPTY1, MIXED, LAUNCH2-PW, LAUNCH2-PP, DIR.
// Uses copied client-oopif-uploadsets-round99 harness pattern but with webkitdirectory input #d and dir fixture.
import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path'; import crypto from 'node:crypto';
import { spawn } from 'node:child_process'; import { createRequire } from 'node:module';

const OBS = process.argv[2] || '/fast/scratch/hyaku/tabi-r100/probe-a';
fs.mkdirSync(OBS, { recursive: true });
const LOG = path.join(OBS, 'probe-log.txt');
const log = (s) => { fs.appendFileSync(LOG, s + '\n'); console.log(s); };
log('probe-a start ' + new Date().toISOString());

const DEPS = '/fast/scratch/hyaku/tabi-r100/deps';
const req = createRequire(path.join(DEPS, 'package.json'));
let puppeteer, pwChromium;
try { puppeteer = req('puppeteer-core'); pwChromium = req('playwright-core').chromium; } catch(e){ log('load failed '+e.message); process.exit(2); }

const CHROMIUM = '/usr/bin/chromium';
const HTTP=33101, CHILD=33102, CDP=33103;
const SETTLE=400, LOAD=800;
const sha256=(b)=>crypto.createHash('sha256').update(b).digest('hex');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

// scratch under /fast/scratch/hyaku/tabi-r100/probe-a/scratch
const scratch = path.join(OBS, 'scratch');
fs.mkdirSync(scratch, {recursive:true});
process.env.TMPDIR = path.join(scratch,'t'); fs.mkdirSync(process.env.TMPDIR,{recursive:true});

const BIN = Buffer.from(Array.from({length:256},(_,i)=>i));

// dir fixture
const dirPath = path.join(scratch,'probe-dir');
fs.mkdirSync(path.join(dirPath,'sub'),{recursive:true});
fs.writeFileSync(path.join(dirPath,'one.txt'),'dir file one\n'); // 13
fs.writeFileSync(path.join(dirPath,'sub','two.txt'),'dir file two\n'); // 13
const pathA = path.join(scratch,'probe-a.txt'); fs.writeFileSync(pathA,'tabi round 100 file a.\n'); //22
const pathB = path.join(scratch,'probe-b.txt'); fs.writeFileSync(pathB,'tabi round 100 file b, second.\n'); //30
const emptyPath = path.join(scratch,'probe-empty.txt'); fs.writeFileSync(emptyPath,'');

log('dir fixture: '+dirPath+' one=13 two=13');

// servers
const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>t</title>
<style>#s{position:absolute;left:30px;top:40px;width:160px;height:50px}#m{position:absolute;left:30px;top:140px;width:160px;height:50px}#d{position:absolute;left:30px;top:240px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><input type="file" id="m" multiple><input type="file" id="d" webkitdirectory><script>
window.__events=[]; for(const id of ['s','m','d']) for(const t of ['input','change','click']) document.getElementById(id).addEventListener(t,function(e){window.__events.push([id,e.type,e.isTrusted]);});
</script></body></html>`;
let currentChildUrl=null;
const serve=(port,handler)=>new Promise(res=>{const s=http.createServer(handler); s.listen(port,'127.0.0.1',()=>res(s));});
const parentHtml=(childUrl)=>`<!doctype html><html><head><meta charset="utf-8"></head><body><input type="file" id="pp"><iframe id="c" src="${childUrl}" style="width:500px;height:300px"></iframe></body></html>`;
const httpSrv = await serve(HTTP,(q,r)=>{const u=new URL(q.url,'http://x'); if(u.pathname==='/parent.html'){r.setHeader('content-type','text/html'); r.end(parentHtml(currentChildUrl)); return;} r.statusCode=404; r.end();});
const childSrv = await serve(CHILD,(q,r)=>{const u=new URL(q.url,'http://x'); if(u.pathname==='/child.html'){r.setHeader('content-type','text/html'); r.end(childHtml()); return;} r.statusCode=404; r.end();});

async function devtoolsVersion(){ for(let i=0;i<100;i++){ try{ return await (await fetch('http://127.0.0.1:'+CDP+'/json/version')).json(); }catch{ await sleep(150);} } return null; }
async function freePort(){ return new Promise((res,rej)=>{const s=http.createServer(); s.on('error',rej); s.listen(CDP,'127.0.0.1',()=>s.close(()=>res()));}); }

let seq=0;
async function runLeg(opts){
  const legId='probe-'+(++seq);
  const childUrl=`http://localhost:${CHILD}/child.html?leg=${legId}`;
  const parentUrl=`http://127.0.0.1:${HTTP}/parent.html?leg=${legId}`;
  currentChildUrl=childUrl;
  const prof=path.join(scratch,'leg-'+legId,'profile'); fs.mkdirSync(prof,{recursive:true});
  let proc=null, client=null, page;
  const rec={leg:legId, ...opts.label, error:null, outcome:null, errName:null, errMessage:null, files:null, events:null, reads:null};
  try{
    if(opts.mode==='launch'){
      const args=['--remote-debugging-port='+CDP,'--no-first-run','--no-default-browser-check','--window-size=1280,900'];
      if(opts.lib==='puppeteer') client=await puppeteer.launch({executablePath:CHROMIUM,headless:true,userDataDir:prof,args,handleSIGINT:false,handleSIGTERM:false,handleSIGHUP:false,timeout:30000});
      else client=await pwChromium.launch({executablePath:CHROMIUM,headless:true,args,handleSIGINT:false,handleSIGTERM:false,handleSIGHUP:false,timeout:30000});
    } else {
      proc=spawn(CHROMIUM,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+prof,'--no-first-run','--no-default-browser-check','--window-size=1280,900','about:blank'],{stdio:'ignore',detached:true});
    }
    const ver=await devtoolsVersion(); if(!ver) throw new Error('chromium never came up');
    if(opts.lib==='puppeteer'){ if(opts.mode==='connect') client=await puppeteer.connect({browserURL:'http://127.0.0.1:'+CDP}); page=await client.newPage(); }
    else { if(opts.mode==='connect') client=opts.isLocal? await pwChromium.connectOverCDP('http://127.0.0.1:'+CDP,{isLocal:true}) : await pwChromium.connectOverCDP('http://127.0.0.1:'+CDP); const ctx=opts.mode==='launch'? await client.newContext(): client.contexts()[0]; page=await ctx.newPage(); }
    await page.goto(parentUrl,{waitUntil:'load'}); await sleep(LOAD);
    const frame=page.frames().find(f=>f.url()===childUrl); if(!frame) throw new Error('no child frame');
    try{
      if(opts.lib==='puppeteer'){ const h=await frame.$('#'+opts.target); if(!h) throw new Error('no handle'); await h.uploadFile(...opts.input); }
      else { await frame.locator('#'+opts.target).setInputFiles(opts.input.length===1&&typeof opts.input[0]!=='object'? opts.input[0]: opts.input,{timeout:5000}); }
      rec.outcome='resolved';
    }catch(e){ rec.outcome='error'; rec.errName=e?.name??null; rec.errMessage=String(e?.message||e).split('\n')[0].slice(0,300); }
    await sleep(SETTLE);
    rec.files = await frame.evaluate(()=>Object.fromEntries(['s','m','d'].map(id=>[id,Array.from(document.getElementById(id).files,f=>[f.name,f.size,f.type,f.webkitRelativePath])])));
    rec.events = await frame.evaluate(()=>window.__events.slice());
    rec.reads = await frame.evaluate(async(ids)=>{
      const hex=(b)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
      const dg=async(b)=>['ok',b.byteLength,hex(await crypto.subtle.digest('SHA-256',b))];
      const er=e=>['err',String(e?.name),String(e?.message)];
      const out={};
      for(const id of ids){ const arr=[]; for(const f of Array.from(document.getElementById(id).files)){ let ab,fr; try{ab=await dg(await f.arrayBuffer());}catch(e){ab=er(e);} try{const buf=await new Promise((res,rej)=>{const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(r.error); r.readAsArrayBuffer(f);}); fr=await dg(buf);}catch(e){fr=er(e);} arr.push([ab,fr]); } out[id]=arr; }
      return out;
    }, opts.readIds);
  }catch(e){ rec.error=String(e?.message||e).split('\n')[0].slice(0,300); }
  finally{ try{ if(client){ if(opts.mode==='connect'&&opts.lib==='puppeteer') await client.disconnect(); else await client.close(); } }catch{} if(proc){ try{process.kill(-proc.pid,'SIGKILL');}catch{} } for(let i=0;i<25;i++){ try{await freePort(); break;}catch{await sleep(200);} } }
  log(JSON.stringify({leg:legId, arm:opts.label.arm, outcome:rec.outcome, errName:rec.errName, errMessage:rec.errMessage, files:rec.files, events:rec.events, reads:rec.reads, error:rec.error}));
  return rec;
}

const R=[];
for(let rep=1;rep<=2;rep++){
  // DUP3
  await runLeg({lib:'playwright',mode:'connect',isLocal:false,target:'m',readIds:['s','m','d'], label:{arm:'DUP3'}, input:[
    {name:'dup.txt', mimeType:'text/plain', buffer:Buffer.from('same-name first file\n')},
    {name:'dup.txt', mimeType:'text/plain', buffer:Buffer.from('same-name second file\n')},
    {name:'other.txt', mimeType:'text/plain', buffer:Buffer.from('other file\n')},
  ]});
  // EMPTY1 payload
  await runLeg({lib:'playwright',mode:'connect',isLocal:false,target:'m',readIds:['s','m','d'], label:{arm:'EMPTY1'}, input:[{name:'tabi-r100-empty.txt', mimeType:'text/plain', buffer:Buffer.alloc(0)}]});
  // MIXED path+payload
  await runLeg({lib:'playwright',mode:'connect',isLocal:true,target:'m',readIds:['s','m','d'], label:{arm:'MIXED'}, input:[pathA, {name:'tabi-r100-p1.txt', mimeType:'text/plain', buffer:Buffer.from('tabi round 100 payload one.\n')}]});
  // LAUNCH2-PW
  await runLeg({lib:'playwright',mode:'launch',isLocal:null,target:'m',readIds:['s','m','d'], label:{arm:'LAUNCH2'}, input:[pathA,pathB]});
  // LAUNCH2-PP
  await runLeg({lib:'puppeteer',mode:'launch',isLocal:null,target:'m',readIds:['s','m','d'], label:{arm:'LAUNCH2'}, input:[pathA,pathB]});
  // DIR
  await runLeg({lib:'playwright',mode:'connect',isLocal:true,target:'d',readIds:['s','m','d'], label:{arm:'DIR'}, input:[dirPath]});
}
httpSrv.close(); childSrv.close();
log('probe-a done seq='+seq);
