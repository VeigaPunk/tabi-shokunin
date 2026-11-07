// R80Scout read-only probe (scratch only): is the showPicker() SecurityError step
// reachable from page script? Cross-origin child (port B) inside parent (port A).
// The child tries showPicker() on (a) type=file input, (b) type=text input.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT_A = 18731; // parent origin
const PORT_B = 18732; // child origin
const CDP = 18733;

const CHILD = `<!doctype html><meta charset=utf-8><title>child</title>
<input type="file" id="f"><input type="text" id="t">
<script>
window.__res = null;
window.__try = function (id) {
  try { var r = document.getElementById(id).showPicker(); window.__res = { id: id, ok: true, ret: String(r) }; }
  catch (e) { window.__res = { id: id, ok: false, name: e.name, message: e.message }; }
  return JSON.stringify(window.__res);
};
</script>`;

const PARENT = `<!doctype html><meta charset=utf-8><title>parent</title>
<iframe id="xo" src="http://127.0.0.1:${PORT_B}/child.html" width="400" height="200"></iframe>
<script>
window.__cross = function () {
  var f = document.getElementById('xo'); var out = {};
  out.contentDocument = f.contentDocument === null ? null : 'object';
  try { out.windowDocument = f.contentWindow.document ? 'object' : null; } catch (e) { out.windowDocument = e.name; }
  return JSON.stringify(out);
};
</script>`;

const srv = (port, body) => new Promise((res) => {
  const s = http.createServer((req, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(body); });
  s.listen(port, '127.0.0.1', () => res(s));
});
const sa = await srv(PORT_A, PARENT);
const sb = await srv(PORT_B, CHILD);

const chrome = spawn('/usr/bin/chromium', [
  '--headless=new', `--remote-debugging-port=${CDP}`, '--remote-allow-origins=*',
  '--no-sandbox', '--disable-gpu', '--user-data-dir=/fast/scratch/hyaku/tabi-r80/R80Scout/prof',
  'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });
let chromeErr = '';
chrome.stderr.on('data', (d) => { chromeErr += d.toString(); });

async function json(path) {
  const r = await fetch(`http://127.0.0.1:${CDP}${path}`, { method: path === '/json/new' ? 'PUT' : 'GET' });
  return r.json();
}

let ws, msgId = 0;
const pending = new Map();
const events = [];
function send(method, params = {}, sessionId) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

try {
  let version = null;
  for (let i = 0; i < 60 && !version; i++) {
    try { version = await json('/json/version'); } catch { await sleep(250); }
  }
  if (!version) throw new Error('cdp not up: ' + chromeErr.slice(-400));
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = (e) => j(new Error('ws: ' + e.message)); });
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.reject(new Error(JSON.stringify(d.error))) : p.resolve(d.result); }
    else if (d.method) events.push(d);
  };

  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${PORT_A}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await sleep(1500);

  // find the child execution context (origin = child origin)
  let childCtx = null;
  const ctxs = [];
  for (const e of events) {
    if (e.method === 'Runtime.executionContextCreated') {
      ctxs.push({ id: e.params.context.id, origin: e.params.context.origin, name: e.params.context.name, isDefault: e.params.context.isDefault, auxData: e.params.context.auxData && e.params.context.auxData.frameId });
      if (e.params.context.origin === `http://127.0.0.1:${PORT_B}` && e.params.context.auxData && e.params.context.auxData.isDefault !== false) childCtx = e.params.context.id;
    }
  }
  const out = { childCtxFound: childCtx !== null };
  out.contexts = ctxs;
  out.frames = (await send('Page.getFrameTree', {}, sessionId)).frameTree;
  if (childCtx !== null) {
    const ev = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, contextId: childCtx }, sessionId);
      return r.exceptionDetails ? { exception: r.exceptionDetails.text, desc: r.exceptionDetails.exception?.description } : r.result.value;
    };
    out.childFileInput = JSON.parse(await ev('window.__try("f")'));
    out.childTextInput = JSON.parse(await ev('window.__try("t")'));
    out.childOrigin = await ev('location.origin');
    out.topOrigin = await ev('window.top === window');
  }
  out.parentCrossAccess = JSON.parse((await send('Runtime.evaluate', { expression: 'window.__cross()', returnByValue: true }, sessionId)).result.value);
  out.chromiumVersion = (await json('/json/version')).Browser;
  console.log(JSON.stringify(out, null, 2));
} finally {
  try { chrome.kill('SIGKILL'); } catch {}
  sa.close(); sb.close();
}
