// R76Scribe independent probe: is the mouseReleased that opens a dialog answered by CDP only
// after the dialog is closed, and how long does the page's dialog call block when the answer is
// event-driven (no 20 ms poll)?  Writes one JSON receipt; tears the browser down.
import fs from 'node:fs';
import http from 'node:http';
import { spawn } from 'node:child_process';
import net from 'node:net';

const OUT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-76/w1/R76Scribe/release-block-probe.json';
const BASE = '/fast/scratch/hyaku/tabi-r76/R76Scribe/probe';
const PROFILE = BASE + '/p';
fs.rmSync(BASE, { recursive: true, force: true });
fs.mkdirSync(PROFILE, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now();

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>release-block probe</title>
<style>button{position:absolute;left:100px;top:100px;width:100px;height:40px}</style></head><body>
<button id="b">go</button>
<script>
window.__ret = 'none'; window.__block = null;
document.getElementById('b').addEventListener('click', function () {
  const t0 = performance.now();
  const v = alert('probe-dialog');
  window.__ret = String(v);
  window.__block = performance.now() - t0;
});
</script></body></html>`;

const receipt = { schema: 'tabi-r76-scribe-release-block-probe', page: PAGE.length, serverPort: null, iterations: [], teardown: null, failures: [] };
let server = null, child = null, ws = null;

async function main() {
  server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html' }); res.end(PAGE); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  receipt.serverPort = server.address().port;

  child = spawn('/usr/bin/chromium', ['--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
    '--user-data-dir=' + PROFILE, '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage',
    '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  let stderr = '';
  child.stderr.on('data', (d) => { if (stderr.length < 8192) stderr += d.toString('utf8'); });
  let dl = null;
  for (let i = 0; i < 200 && !dl; i++) { const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/[0-9a-f-]{36})/.exec(stderr); if (m) dl = { url: m[1], port: Number(m[2]) }; if (!dl) await sleep(50); }
  if (!dl) throw new Error('no DevTools listening line');
  receipt.devtools = dl;
  let target = null;
  for (let i = 0; i < 200 && !target; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + dl.port + '/json/list', { signal: AbortSignal.timeout(1500) })).json();
      target = list.find((t) => t.type === 'page');
    } catch {}
    if (!target) await sleep(50);
  }
  if (!target) throw new Error('no page target');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('ws timeout')), 10000); ws.addEventListener('open', () => { clearTimeout(t); res(); }, { once: true }); ws.addEventListener('error', () => rej(new Error('ws error')), { once: true }); });
  let id = 0; const pending = new Map(); const openWaiters = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (typeof m.method === 'string' && m.id === undefined) {
      if (m.method === 'Page.javascriptDialogOpening') { const at = now(); while (openWaiters.length) openWaiters.shift()(at); }
      return;
    }
    const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  });
  const send = (method, params = {}, timeoutMs = 5000) => new Promise((resolve, reject) => {
    const mid = ++id; const t = setTimeout(() => { pending.delete(mid); reject(new Error('timeout ' + method)); }, timeoutMs);
    pending.set(mid, { resolve: (v) => { clearTimeout(t); resolve(v); }, reject: (e) => { clearTimeout(t); reject(e); } });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const evalv = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  receipt.browser = (await send('Browser.getVersion')).product;

  for (let it = 0; it < 3; it++) {
    await send('Page.navigate', { url: 'http://127.0.0.1:' + receipt.serverPort + '/?it=' + it });
    let ready = false;
    for (let i = 0; i < 100 && !ready; i++) { try { ready = await evalv('document.readyState === "complete" && !!document.getElementById("b")'); } catch {} if (!ready) await sleep(50); }
    if (!ready) throw new Error('page not ready');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 150, y: 120, button: 'left', buttons: 1, clickCount: 1 });
    const openP = new Promise((r) => openWaiters.push(r));
    const tReleaseSent = now();
    let releaseResolvedAt = null, releaseErr = null;
    const rel = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 150, y: 120, button: 'left', buttons: 0, clickCount: 1 }, 8000)
      .then(() => { releaseResolvedAt = now(); }, (e) => { releaseErr = String(e); });
    const tOpen = await Promise.race([openP, sleep(4000).then(() => null)]);
    if (tOpen === null) throw new Error('no dialog opening');
    const tHandleSent = now();
    const handleT0 = now();
    await send('Page.handleJavaScriptDialog', { accept: true });
    const tHandleResolved = now();
    await rel;
    await sleep(150);
    const block = await evalv('window.__block');
    const ret = await evalv('window.__ret');
    receipt.iterations.push({
      iteration: it,
      openAfterReleaseSentMs: +(tOpen - tReleaseSent).toFixed(2),
      handleSentAfterOpenMs: +(tHandleSent - tOpen).toFixed(2),
      handleRoundTripMs: +(tHandleResolved - handleT0).toFixed(2),
      releaseResolvedAfterHandleResolvedMs: releaseResolvedAt === null ? null : +(releaseResolvedAt - tHandleResolved).toFixed(2),
      releaseResolvedAfterReleaseSentMs: releaseResolvedAt === null ? null : +(releaseResolvedAt - tReleaseSent).toFixed(2),
      releaseErr,
      pageDialogBlockMs: block === null ? null : +block.toFixed(2),
      pageReturn: ret,
    });
  }
  // latency baseline: three plain round trips
  const base = [];
  for (let i = 0; i < 3; i++) { const t = now(); await evalv('1+1'); base.push(+(now() - t).toFixed(2)); }
  receipt.evalRoundTripMs = base;
}

try { await main(); } catch (e) { receipt.failures.push({ id: 'probe-error', detail: String(e && e.message || e) }); }
finally {
  try { if (ws) ws.close(); } catch {}
  try { if (child?.pid) process.kill(-child.pid, 'SIGKILL'); } catch {}
  await sleep(500);
  try { if (server) { server.closeAllConnections?.(); await new Promise((r) => server.close(r)); } } catch {}
  receipt.teardown = { survivors: [], ports: {} };
  for (const [k, p] of [['fixture', receipt.serverPort], ['devtools', receipt.devtools?.port]]) {
    receipt.teardown.ports[k] = await new Promise((resolve) => { const s = new net.Socket(); s.setTimeout(700); s.once('connect', () => { s.destroy(); resolve('open'); }); s.once('error', () => resolve('closed')); s.once('timeout', () => { s.destroy(); resolve('timeout'); }); s.connect(p, '127.0.0.1'); });
  }
  receipt.teardown.childExit = { code: child?.exitCode ?? null, signal: child?.signalCode ?? null };
  setTimeout(() => { fs.writeFileSync(OUT, JSON.stringify(receipt, null, 1)); console.log(JSON.stringify(receipt, null, 1)); process.exit(0); }, 300);
}
