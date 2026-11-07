// R80Scout probe 2 (scratch only): test the r80 bound laws against Chromium 155.0.8059.84
// legs: (1) disabled NON-file input in the cross-origin child -> which error?
//     (2) two Runtime.evaluate{userGesture:true} calls -> both succeed? two fileChooserOpened?
//     (3) setTimeout(...,0) deferred from a trusted click handler -> succeeds?
//     (4) answer via DOM.setFileInputFiles on the event's backendNodeId -> exact bytes + trusted events?
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs';
import crypto from 'node:crypto';

const PORT_A = 18741, PORT_B = 18742, CDP = 18743, UPLOAD = 18744;
const OUT = '/fast/scratch/hyaku/tabi-r80/R80Scout/probe2.json';
const FILE_BODY = Buffer.from('R80-PAYLOAD-BYTES-\u00e9\u00ff\n');
const FILE_PATH = '/fast/scratch/hyaku/tabi-r80/R80Scout/upload.txt';
fs.writeFileSync(FILE_PATH, FILE_BODY);
const FILE_SHA = crypto.createHash('sha256').update(FILE_BODY).digest('hex');

const CHILD = `<!doctype html><meta charset=utf-8><body style="margin:0">
<input type="file" id="f" style="position:absolute;left:10px;top:10px;width:100px;height:30px">
<input type="text" id="t" style="position:absolute;left:10px;top:60px;width:100px;height:30px">
<input type="text" id="d" disabled style="position:absolute;left:10px;top:110px;width:100px;height:30px">
<button id="b" style="position:absolute;left:150px;top:10px;width:80px;height:30px">go</button>
<script>
window.__ev = [];
for (const t of ['pointerdown','mousedown','pointerup','mouseup','click','input','change','cancel'])
  document.addEventListener(t, function (e) { window.__ev.push({ type: t, isTrusted: e.isTrusted, id: e.target && e.target.id }); }, true);
window.__try = function (id) {
  try { var r = document.getElementById(id).showPicker(); return JSON.stringify({ id: id, ok: true }); }
  catch (e) { return JSON.stringify({ id: id, ok: false, name: e.name, message: e.message }); }
};
</script></body>`;

const PARENT = `<!doctype html><meta charset=utf-8><body style="margin:0">
<iframe id="xo" src="http://127.0.0.1:${PORT_B}/child.html" style="position:absolute;left:0;top:0;width:400px;height:300px;border:0"></iframe>
<button id="pad" style="position:absolute;left:500px;top:100px;width:120px;height:40px">pad</button>
<script>
window.__ev = [];
for (const t of ['click','input','change'])
  document.addEventListener(t, function (e) { window.__ev.push({ type: t, isTrusted: e.isTrusted, id: e.target && e.target.id }); }, true);
window.__act = function () { return JSON.stringify({ isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive }); };
window.__deferred = null;
document.getElementById('pad').addEventListener('click', function () {
  setTimeout(function () {
    try { document.getElementById('x').showPicker(); window.__deferred = { ok: true }; }
    catch (e) { window.__deferred = { ok: false, name: e.name, message: e.message }; }
  }, 0);
});
</script></body>`;

const srv = (port, body) => new Promise((res) => {
  const s = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(body); });
  s.listen(port, '127.0.0.1', () => res(s));
});
const sa = await srv(PORT_A, PARENT), sb = await srv(PORT_B, CHILD);

const chrome = spawn('/usr/bin/chromium', ['--headless=new', `--remote-debugging-port=${CDP}`,
  '--remote-allow-origins=*', '--no-sandbox', '--disable-gpu',
  '--user-data-dir=/fast/scratch/hyaku/tabi-r80/R80Scout/prof2', 'about:blank'],
  { stdio: ['ignore', 'pipe', 'pipe'] });
let cerr = ''; chrome.stderr.on('data', (d) => { cerr += d.toString(); });

let ws, msgId = 0; const pending = new Map(); const events = [];
const send = (method, params = {}, sessionId) => { const id = ++msgId; return new Promise((res, rej) => { pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); }); };

try {
  let version = null;
  for (let i = 0; i < 60 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json(); } catch { await sleep(250); } }
  if (!version) throw new Error('cdp down ' + cerr.slice(-300));
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = (e) => j(new Error('ws ' + e.message)); });
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(JSON.stringify(d.error))) : p.res(d.result); } else if (d.method) events.push(d); };

  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${PORT_A}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('DOM.enable', {}, sessionId);
  await sleep(1200);

  const ctxOf = (origin) => { let c = null; for (const e of events) if (e.method === 'Runtime.executionContextCreated' && e.params.context.origin === origin && e.params.context.auxData && e.params.context.auxData.isDefault !== false) c = e.params.context.id; return c; };
  const childCtx = ctxOf(`http://127.0.0.1:${PORT_B}`);
  const parentCtx = ctxOf(`http://127.0.0.1:${PORT_A}`);
  const ev = async (expr, ctx) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, ...(ctx ? { contextId: ctx } : {}) }, sessionId);
    return r.exceptionDetails ? { exception: r.exceptionDetails.text, desc: r.exceptionDetails.exception && r.exceptionDetails.exception.description } : r.result.value;
  };
  const out = { childCtx, parentCtx, chromium: version.Browser };

  // ---- LEG 1: cross-origin child, disabled NON-file input (type=text #d) and type=text #t
  out.leg1_disabledTextInCrossOrigin = JSON.parse(await ev('window.__try("d")', childCtx));
  out.leg1_textInCrossOrigin = JSON.parse(await ev('window.__try("t")', childCtx));

  // ---- LEG 1b: does the cross-origin child's OWN file input work with a real gesture?
  await send('Page.setInterceptFileChooserDialog', { enabled: true }, sessionId);
  const choosers = () => events.filter((e) => e.method === 'Page.fileChooserOpened').map((e) => ({ frameId: e.params.frameId, mode: e.params.mode, backendNodeId: e.params.backendNodeId }));
  const rect = JSON.parse(await ev('JSON.stringify(document.getElementById("xo").getBoundingClientRect())', parentCtx));
  const click = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 }, sessionId);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 }, sessionId);
  };
  // child button #b is at x=150..230, y=10..40 inside the iframe (iframe at 0,0 400x300)
  await click(190, 25);
  await sleep(600);
  out.leg1b_childFileWithTrustedClick = { choosers: choosers(), childEvents: JSON.parse(await ev('JSON.stringify(window.__ev)', childCtx)) };

  // ---- LEG 2: two Runtime.evaluate {userGesture:true} on the PARENT's file input
  // parent has no file input; use the child's file input #f via child context
  const before = choosers().length;
  const p1 = await send('Runtime.evaluate', { expression: 'window.__try("f")', returnByValue: true, userGesture: true, contextId: childCtx }, sessionId);
  await sleep(400);
  const p2 = await send('Runtime.evaluate', { expression: 'window.__try("f")', returnByValue: true, userGesture: true, contextId: childCtx }, sessionId);
  await sleep(600);
  out.leg2_twoUserGestureCalls = {
    r1: p1.exceptionDetails ? p1.exceptionDetails.exception.description : p1.result.value,
    r2: p2.exceptionDetails ? p2.exceptionDetails.exception.description : p2.result.value,
    chooserEventsDelta: choosers().length - before,
    choosers: choosers(),
    childActivation: await ev('window.__act ? window.__act() : "n/a"', childCtx)
  };

  // ---- LEG 4: answer the last chooser with DOM.setFileInputFiles on its backendNodeId
  const cs = choosers();
  if (cs.length) {
    const ev0 = cs[cs.length - 1];
    const setRes = await send('DOM.setFileInputFiles', { files: [FILE_PATH], backendNodeId: ev0.backendNodeId }, sessionId);
    await sleep(800);
    out.leg4_answer = {
      backendNodeId: ev0.backendNodeId, mode: ev0.mode,
      setResult: setRes,
      childFileState: await ev('JSON.stringify({ len: document.getElementById("f").files.length, name: document.getElementById("f").files[0] && document.getElementById("f").files[0].name, size: document.getElementById("f").files[0] && document.getElementById("f").files[0].size })', childCtx),
      childEvents: JSON.parse(await ev('JSON.stringify(window.__ev)', childCtx))
    };
  }
  out.fileSha256 = FILE_SHA;
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
} finally {
  try { chrome.kill('SIGKILL'); } catch {}
  sa.close(); sb.close();
}
