// R80Scout probe 3 (scratch only): discriminate Chromium's cross-origin-before-mutability
// order, and test activation consumption + the deferred-timer law.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT_A = 18751, PORT_B = 18752, CDP = 18753;

const CHILD = `<!doctype html><meta charset=utf-8><body style="margin:0">
<input type="file" id="f" style="position:absolute;left:10px;top:10px;width:100px;height:30px">
<input type="file" id="dis" disabled style="position:absolute;left:10px;top:50px;width:100px;height:30px">
<input type="text" id="t" style="position:absolute;left:10px;top:90px;width:100px;height:30px">
<input type="text" id="dtext" disabled style="position:absolute;left:10px;top:130px;width:100px;height:30px">
<button id="go" style="position:absolute;left:150px;top:10px;width:80px;height:30px">go</button>
<button id="go2" style="position:absolute;left:150px;top:50px;width:80px;height:30px">go2</button>
<script>
window.__ev = [];
for (const t of ['pointerdown','mousedown','pointerup','mouseup','click','input','change','cancel'])
  document.addEventListener(t, function (e) { window.__ev.push({ type: t, isTrusted: e.isTrusted, id: e.target && e.target.id }); }, true);
window.__act = function () { return JSON.stringify({ isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive }); };
window.__try = function (id) {
  try { document.getElementById(id).showPicker(); return JSON.stringify({ id: id, ok: true }); }
  catch (e) { return JSON.stringify({ id: id, ok: false, name: e.name, message: e.message }); }
};
window.__def = null;
document.getElementById('go').addEventListener('click', function () {
  setTimeout(function () { window.__def = JSON.parse(window.__try('f')); }, 0);
});
document.getElementById('go2').addEventListener('click', function () { window.__r2 = JSON.parse(window.__try('dis')); });
</script></body>`;

const PARENT = `<!doctype html><meta charset=utf-8><body style="margin:0">
<iframe id="xo" src="http://127.0.0.1:${PORT_B}/child.html" style="position:absolute;left:0;top:0;width:400px;height:300px;border:0"></iframe>
</body>`;

const srv = (port, body) => new Promise((res) => { const s = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(body); }); s.listen(port, '127.0.0.1', () => res(s)); });
const sa = await srv(PORT_A, PARENT), sb = await srv(PORT_B, CHILD);
const chrome = spawn('/usr/bin/chromium', ['--headless=new', `--remote-debugging-port=${CDP}`, '--remote-allow-origins=*', '--no-sandbox', '--disable-gpu', '--user-data-dir=/fast/scratch/hyaku/tabi-r80/R80Scout/prof3', 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
let cerr = ''; chrome.stderr.on('data', (d) => { cerr += d.toString(); });
let ws, msgId = 0; const pending = new Map(); const events = [];
const send = (m, p = {}, s) => { const id = ++msgId; return new Promise((res, rej) => { pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method: m, params: p, ...(s ? { sessionId: s } : {}) })); }); };
try {
  let version = null;
  for (let i = 0; i < 60 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json(); } catch { await sleep(250); } }
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = (e) => j(new Error('ws ' + e.message)); });
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(JSON.stringify(d.error))) : p.res(d.result); } else if (d.method) events.push(d); };
  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${PORT_A}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId); await send('Page.enable', {}, sessionId);
  await sleep(1200);
  const ctxOf = (o) => { let c = null; for (const e of events) if (e.method === 'Runtime.executionContextCreated' && e.params.context.origin === o && e.params.context.auxData && e.params.context.auxData.isDefault !== false) c = e.params.context.id; return c; };
  const childCtx = ctxOf(`http://127.0.0.1:${PORT_B}`), parentCtx = ctxOf(`http://127.0.0.1:${PORT_A}`);
  const ev = async (e, c) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, ...(c ? { contextId: c } : {}) }, sessionId); return r.exceptionDetails ? { exc: r.exceptionDetails.text, desc: r.exceptionDetails.exception && r.exceptionDetails.exception.description } : r.result.value; };
  await send('Page.setInterceptFileChooserDialog', { enabled: true }, sessionId);
  const choosers = () => events.filter((e) => e.method === 'Page.fileChooserOpened').map((e) => ({ frameId: e.params.frameId, mode: e.params.mode, backendNodeId: e.params.backendNodeId }));
  const click = async (x, y) => { await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 }, sessionId); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 }, sessionId); };

  const out = { chromium: version.Browser };
  // A: cross-origin child, DISABLED file input -> which error?
  out.A_disabledFileCrossOrigin = JSON.parse(await ev('window.__try("dis")', childCtx));
  // B: cross-origin child, DISABLED non-file input -> which error? (order discriminator)
  out.B_disabledTextCrossOrigin = JSON.parse(await ev('window.__try("dtext")', childCtx));
  // C: same-origin (parent) disabled non-file input -> InvalidStateError baseline
  out.C_disabledTextSameOrigin = await ev('(function(){ try { document.createElement("input"); var i=document.createElement("input"); i.disabled=true; document.body.appendChild(i); i.showPicker(); return "ok"; } catch(e){ return e.name; } })()', parentCtx);

  // D: child's trusted click on #go2 (disabled file input) -> error + activation retained?
  await click(190, 65);
  await sleep(700);
  out.D_childClickDisabledFile = { r2: await ev('window.__r2 ? JSON.stringify(window.__r2) : "null"', childCtx), activationAfter: await ev('window.__act()', childCtx) };
  // E: activation still live -> a following userGesture call on the enabled file input succeeds
  out.E_followUpAfterFailed = JSON.parse(await ev('window.__try("f")', childCtx));
  // F: deferred setTimeout(0) from a trusted click handler
  await click(190, 25);
  await sleep(900);
  out.F_deferred = await ev('window.__def ? JSON.stringify(window.__def) : "null"', childCtx);
  out.F_choosers = choosers();
  out.F_childActivation = await ev('window.__act()', childCtx);
  console.log(JSON.stringify(out, null, 2));
} finally { try { chrome.kill('SIGKILL'); } catch {} sa.close(); sb.close(); }
