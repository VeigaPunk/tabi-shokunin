#!/usr/bin/env node
// Read-only pointer-delivery hypothesis probe; no typing or submission.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r61';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_PROFILE_ROOT = path.join(os.homedir(), '.config', 'chromium');
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class PathError extends Error {}
const isAbsNative = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const inside = (child, parent) => {
  const c = norm(child);
  const p = norm(parent);
  return c === p || c.startsWith(p + path.sep);
};

function validateScratch(given) {
  if (typeof given !== 'string' || given === '') throw new PathError('--scratch is required');
  if (!isAbsNative(given)) throw new PathError('--scratch must be an ABSOLUTE path: ' + given);
  const resolved = norm(given);
  if (resolved === norm(os.homedir())) throw new PathError('--scratch must not be the home directory: ' + resolved);
  if (resolved === path.parse(resolved).root) throw new PathError('--scratch must not be a filesystem root: ' + resolved);
  if (inside(resolved, DEFAULT_PROFILE_ROOT)) throw new PathError('--scratch must not live inside the user Chromium profile: ' + resolved);
  return resolved;
}

function validateOut(given) {
  if (typeof given !== 'string' || given === '') throw new PathError('--out is required');
  if (!isAbsNative(given)) throw new PathError('--out must be an ABSOLUTE path: ' + given);
  const resolved = norm(given);
  if (inside(resolved, DEFAULT_PROFILE_ROOT)) throw new PathError('--out must not live inside the user Chromium profile: ' + resolved);
  return resolved;
}

// The profile is a THROWAWAY directory, always <scratch>/profile-<12 hex>.
// It can never be, or live under, the operator's default Chromium profile.
function validateProfile(scratch, token, profileDir) {
  if (typeof token !== 'string' || !/^[0-9a-f]{12}$/.test(token)) throw new PathError('launch token must be 12 lowercase hex chars: ' + String(token));
  const want = path.join(scratch, 'profile-' + token);
  if (norm(profileDir) !== norm(want)) throw new PathError('profile dir must be ' + want + ', got ' + profileDir);
  if (inside(profileDir, DEFAULT_PROFILE_ROOT)) throw new PathError('profile must not be the user Chromium profile: ' + profileDir);
  if (!inside(profileDir, scratch) || norm(profileDir) === norm(scratch)) throw new PathError('profile must be a child of --scratch: ' + profileDir);
  return norm(profileDir);
}


const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i+1] : null; };
const usage = (detail) => { console.error(JSON.stringify({schema: SCHEMA,error:'usage',detail})); process.exit(2); };
let scratchDir, outReceipt;
try { scratchDir = validateScratch(opt('scratch')); outReceipt = validateOut(opt('out')); } catch(e) { usage(e.message); }
const outDir = path.dirname(outReceipt);
const nonce = opt('nonce');
if (!nonce || !/^tabi-r61-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r61- followed by lowercase letters/digits/hyphens');
const ports = ['http-port','cdp-port'].map((key) => {
  const s = opt(key); const n = Number(s);
  if (!s || !/^\d+$/.test(s) || n < 1024 || n > 65535) usage('--'+key+' must be an integer 1024..65535');
  return n;
});
const [fixturePort, devPort] = ports;
if (fixturePort === devPort) usage('HTTP and CDP ports must differ');
const chromiumArg = '/usr/bin/chromium';
try {
  fs.mkdirSync(scratchDir, {recursive:true});
  scratchDir = fs.realpathSync(scratchDir);
  validateScratch(scratchDir);
  fs.mkdirSync(outDir, {recursive:true});
  validateOut(fs.realpathSync(outDir));
  const probe = path.join(scratchDir, '.write-probe-' + crypto.randomBytes(6).toString('hex'));
  fs.writeFileSync(probe,'probe',{flag:'wx'});
  if (fs.readFileSync(probe,'utf8') !== 'probe') throw new Error('scratch write probe mismatch');
  fs.rmSync(probe);
  if (fs.existsSync(outReceipt)) throw new Error('--out already exists; retain prior receipts');
} catch(e) { usage(e.message); }
async function freePort(port) {
  const s = net.createServer();
  await new Promise((resolve,reject) => { s.once('error',reject); s.listen(port,'127.0.0.1',resolve); });
  await new Promise((resolve,reject) => s.close((e) => e ? reject(e) : resolve()));
}
try { for (const p of ports) await freePort(p); } catch(e) { usage('free-port precheck: '+e.message); }
const launchToken = crypto.randomBytes(6).toString('hex');
const profileDir = validateProfile(scratchDir,launchToken,path.join(scratchDir,'profile-'+launchToken));
const runHome = path.join(scratchDir,'home-'+launchToken);
const runXdgConfig = path.join(runHome,'.config');
const runCrashDb = path.join(runXdgConfig,'chromium','Crash Reports');
try {
  fs.mkdirSync(runXdgConfig,{recursive:true,mode:0o700});
  fs.mkdirSync(profileDir,{mode:0o700});
  fs.accessSync(profileDir,fs.constants.W_OK|fs.constants.R_OK);
  if (fs.readdirSync(profileDir).length !== 0) throw new Error('profile not empty');
} catch(e) { usage(e.message); }
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const pids = [];
  let ents;
  try { ents = fs.readdirSync('/proc'); } catch { return { error: 'cannot list /proc', pids: [] }; }
  for (const ent of ents) {
    if (!/^\d+$/.test(ent)) continue;
    const pid = Number(ent);
    if (pid === process.pid) continue;
    let cmd;
    try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; } // vanished: not ours
    if (SWEEP_NEEDLES.some((n) => cmd.includes(n))) pids.push(pid);
  }
  return { pids: pids.sort((a, b) => a - b) };
}
const killPid = (pid, sig = 'SIGKILL') => { try { process.kill(pid, sig); return true; } catch { return false; } };
async function sweepToZero() {
  let last = sweepOnce();
  for (let round = 0; round < SWEEP_MAX_ROUNDS; round++) {
    if (!last.pids.length) return { postKillSweepCount: 0, survivors: [], rounds: round };
    for (const pid of last.pids) killPid(pid);
    await sleep(SWEEP_WAIT_MS);
    last = sweepOnce();
  }
  return { postKillSweepCount: last.pids.length, survivors: last.pids, rounds: SWEEP_MAX_ROUNDS };
}

// Port probe: after the keyed kill nothing may answer on the fixture port or
// the DevTools port. A refused connect is the only green answer.
function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (done) return; done = true; try { s.destroy(); } catch {} resolve(v); };
    s.setTimeout(PORT_PROBE_TIMEOUT_MS, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}


const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) usage('launch token not fresh');
const FORM_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r61 pointer fixture</title>
<script>
window.__ptrlog = [];
for (const type of ['pointermove','pointerdown','pointerup','mousedown','mouseup','click']) {
  document.addEventListener(type, function(e) {
    window.__ptrlog.push({type:e.type,pointerType:e.pointerType,pointerId:e.pointerId,
      isTrusted:e.isTrusted,button:e.button,buttons:e.buttons,ts:e.timeStamp});
  }, true);
}
window.__keylog = [];
for (const type of ['keydown','keyup']) {
  document.addEventListener(type,function(e) {
    window.__keylog.push({type:e.type === 'keydown' ? 'keyDown' : 'keyUp',
      key:e.key,code:e.code,keyCode:e.keyCode,windowsVirtualKeyCode:e.keyCode,
      modifiers:(e.altKey?1:0)|(e.ctrlKey?2:0)|(e.metaKey?4:0)|(e.shiftKey?8:0),
      cancelable:e.cancelable,defaultPrevented:e.defaultPrevented,
      capsLock:e.getModifierState('CapsLock'),shift:e.getModifierState('Shift'),
      ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,shiftKey:e.shiftKey,
      targetId:e.target.id || e.target.tagName,isTrusted:e.isTrusted});
  },true);
}
window.__field2Focused = false;
document.addEventListener('focusin',function(e){if(e.target.id === 'field2')window.__field2Focused=true;},true);
</script></head><body><h1>Pointer domain</h1><p id="nonce">${nonce}</p>
<form id="f"><input id="field" name="field" value="" size="40">
<input id="field2" name="field2" value="" size="40"></form></body></html>`;
fs.writeFileSync(path.join(scratchDir,'fixture.html'),FORM_HTML);
const serverLog = [];
const fixtureServer = http.createServer((req,res) => {
  const u = new URL(req.url,'http://127.0.0.1');
  serverLog.push({path:u.pathname,query:u.search.replace(/^\?/, '')});
  res.writeHead(u.pathname === '/form' ? 200 : 404,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
  res.end(u.pathname === '/form' ? FORM_HTML : 'not found');
});
const origin = 'http://127.0.0.1:'+fixturePort;
const failures = [];
const receipt = {schema:SCHEMA,nonce,driverSha256:sha256(fs.readFileSync(SELF)),
  host:{chromium:'',argv:[],launchToken},fixture:{formSha256:sha256(FORM_HTML),origin,fields:[]},
  plainTrace:{entries:[]},keylog:{entries:[],length:0,window:{start:0,end:0}},
  ptrlog:[],focus:null,serverLog,
  declaredStepNames:['a-pointer-press','b-typed'],steps:[],stepsExtended:[],
  journey:{pointer:{moved:null,pressedAt:null,releasedAt:null,pngSteps:[]},
    form:{mechanism:'dispatchMouseEvent+dispatchKeyEvent',nonceOnPage:false,fields:[],shots:[],serverRequests:[],pageKeylog:[],expectedKeylogLength:0,keylogMatchesPlan:false}},
  teardown:{postKillSweepCount:-1,survivors:[],portProbes:null},failures,predicate:false};
const childArgv = [chromiumArg,'--headless=new','--remote-debugging-port='+devPort,
  '--remote-debugging-address=127.0.0.1','--user-data-dir='+profileDir,
  '--no-first-run','--no-default-browser-check','--disable-background-networking',
  '--disable-component-update','--disable-sync','--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage','--disable-extensions','--window-size=1280,900','about:blank'];
receipt.host.argv = childArgv;
let child = null, ws = null, midRunCount = 0, closing = null;
async function teardown() {
  if (closing) return closing;
  closing = (async () => {
    try { if(ws) ws.close(); } catch {}
    if (child?.pid) { try { process.kill(-child.pid,'SIGKILL'); } catch {} }
    await sleep(600);
    const swept = await sweepToZero();
    fixtureServer.closeAllConnections();
    await Promise.race([new Promise((resolve) => fixtureServer.close(resolve)),sleep(2000)]);
    const portProbes = {fixture:await probePort(fixturePort),devtools:await probePort(devPort)};
    const curlExit = (port) => spawnSync('/usr/bin/curl',['--noproxy','*','--silent','--show-error','--max-time','2','http://127.0.0.1:'+port+'/'],{encoding:'utf8',timeout:4000}).status;
    receipt.teardown = {postKillSweepCount:swept.postKillSweepCount,survivors:swept.survivors,portProbes,
      postKillCurl:{fixture:curlExit(fixturePort),devtools:curlExit(devPort)}};
    receipt.sweeps = {preLaunch:preLaunch.pids.length,midRun:midRunCount,postKill:swept.postKillSweepCount};
    if(swept.postKillSweepCount !== 0 || swept.survivors.length || Object.values(portProbes).some(v => v !== 'closed') || Object.values(receipt.teardown.postKillCurl).some(v => v !== 7)) failures.push({id:'teardown-closure',detail:'closure proof failed'});
  })();
  return closing;
}
let interrupted = false;
for (const sig of ['SIGINT','SIGTERM']) process.on(sig, async () => {interrupted=true; failures.push({id:'interrupted',detail:sig}); await teardown(); fs.writeFileSync(outReceipt,JSON.stringify(receipt,null,1));process.exit(1);});
try {
  await new Promise((resolve,reject) => {fixtureServer.once('error',reject);fixtureServer.listen(fixturePort,'127.0.0.1',resolve);});
  const version = spawnSync(chromiumArg,['--version'],{encoding:'utf8',timeout:15000,env:{...process.env,HOME:runHome,XDG_CONFIG_HOME:runXdgConfig,TMPDIR:scratchDir}});
  if(version.status !== 0) throw new Error('chromium version failed');
  receipt.host.chromium = version.stdout.trim();
  child = spawn(childArgv[0],childArgv.slice(1),{stdio:['ignore','ignore','pipe'],detached:true,env:{...process.env,HOME:runHome,XDG_CONFIG_HOME:runXdgConfig,TMPDIR:scratchDir}});
  let launchError = null;
  child.on('error',e => {launchError=e;});
  child.stderr.on('data',() => {});
  const fetchJSON = async (url) => {const r=await fetch(url,{signal:AbortSignal.timeout(1500)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};
  let page = null;
  for(let i=0;i<100&&!page;i++) {
    if(launchError)throw launchError;
    try { page=(await fetchJSON('http://127.0.0.1:'+devPort+'/json/list')).find(t => t.type==='page'); } catch {}
    if(!page)await sleep(150);
  }
  if(!page || !new RegExp('^ws://127\\.0\\.0\\.1:'+devPort+'/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  midRunCount = sweepOnce().pids.length;
  if(midRunCount < 1)throw new Error('launch token unbound');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('ws open timeout')),20000);ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});ws.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('ws error'));},{once:true});});
  let msgId=0;const pending=new Map();
  ws.addEventListener('message',ev=>{const msg=JSON.parse(ev.data);const p=pending.get(msg.id);if(p){pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(JSON.stringify(msg.error))):p.resolve(msg);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++msgId;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout '+method));},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evalValue=async(expression)=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
  const capture=async(name)=>{const shot=await send('Page.captureScreenshot',{format:'png'});const buf=Buffer.from(shot.result.data,'base64');const rec={name,png:name+'.png',sha256:sha256(buf),bytes:buf.length};fs.writeFileSync(path.join(outDir,rec.png),buf);receipt.steps.push(rec);return rec;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Page.navigate',{url:origin+'/form'});
  let ready=false;
  for(let i=0;i<100&&!ready;i++){try {ready=await evalValue('document.readyState === "complete" && location.pathname === "/form" && Array.isArray(window.__ptrlog) && document.getElementById("nonce").textContent === '+JSON.stringify(nonce));}catch{}if(!ready)await sleep(100);}
  if(!ready)throw new Error('fixture not ready');
  const form=receipt.journey.form;
  form.nonceOnPage=true;
  receipt.fixture.fields=await evalValue('Array.from(document.querySelectorAll("#f input")).map(el=>({id:el.id,name:el.getAttribute("name")}))');
  form.fields=receipt.fixture.fields;
  const rect=await evalValue('(()=>{const r=document.getElementById("field").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()');
  const x=Math.round(rect.x+rect.width/2),y=Math.round(rect.y+rect.height/2);
  receipt.journey.pointer.rect=rect;
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,buttons:0,pointerType:'mouse'});
  receipt.journey.pointer.moved=await evalValue('window.__ptrlog.find(e=>e.type==="pointermove") || null');
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1,pointerType:'mouse'});
  receipt.journey.pointer.afterPress=await evalValue('window.__ptrlog');
  receipt.focus=await evalValue('document.activeElement.id || document.activeElement.tagName');
  receipt.journey.pointer.pressedAt=receipt.journey.pointer.afterPress.find(e=>e.type==='pointerdown')?.ts ?? null;
  await capture('a-pointer-press');
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1,pointerType:'mouse'});
  receipt.ptrlog=await evalValue('window.__ptrlog');
  receipt.journey.pointer.afterRelease=receipt.ptrlog;
  receipt.journey.pointer.releasedAt=receipt.ptrlog.find(e=>e.type==='pointerup')?.ts ?? null;
  // JOURNEY_EXTENSION
} catch(e) { failures.push({id:'drive-error',detail:e.message}); }
finally { await teardown(); }
receipt.serverLog=serverLog;
receipt.journey.form.serverRequests=serverLog;
receipt.stepsExtended=receipt.steps.slice();
receipt.journey.form.shots=receipt.steps.slice();
receipt.journey.pointer.pngSteps=receipt.steps.slice();
receipt.pointerHypothesis=receipt.ptrlog.some(e=>e.type==='pointerdown'&&e.pointerType==='mouse'&&typeof e.pointerId==='number'&&e.isTrusted===true)?'CONFIRMED':'REFUTED';
receipt.predicate=receipt.pointerHypothesis==='CONFIRMED'&&receipt.focus==='field'&&failures.length===0&&!interrupted;
fs.writeFileSync(path.join(scratchDir,'server-log.json'),JSON.stringify(serverLog,null,1));
fs.writeFileSync(outReceipt,JSON.stringify(receipt,null,1));
console.log(JSON.stringify({schema:SCHEMA,predicate:receipt.predicate,pointerHypothesis:receipt.pointerHypothesis,ptrlog:receipt.ptrlog,focus:receipt.focus,teardown:receipt.teardown}));
process.exitCode=receipt.predicate?0:1;
