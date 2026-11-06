#!/usr/bin/env node
// R69Exec3 probe 3: scrollport geometry readback, diagonal distance-vector
// semantics, and exact clamp position. Same harness shape as probe.mjs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r69-exec3-synthscroll-edges-set3';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const VIEWPORT = { width: 1280, height: 900 };
const CONTENT = { width: 2280, height: 6800 };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail: d })); process.exit(2); };
const scratch = opt('scratch'), outDir = opt('out');
const httpPort = Number(opt('http-port')), cdpPort = Number(opt('cdp-port'));
if (!scratch || !path.isAbsolute(scratch)) usage('scratch');
if (!outDir || !path.isAbsolute(outDir)) usage('out');
if (![httpPort, cdpPort].every((p) => Number.isInteger(p) && p >= 41000 && p <= 48999) || httpPort === cdpPort) usage('ports');
fs.mkdirSync(scratch, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
const token = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratch, 'profile3-' + token);
const homeDir = path.join(scratch, 'home3-' + token);
const xdg = { HOME: homeDir, XDG_CACHE_HOME: path.join(homeDir, '.cache'), XDG_CONFIG_HOME: path.join(homeDir, '.config'), XDG_DATA_HOME: path.join(homeDir, '.local', 'share'), XDG_STATE_HOME: path.join(homeDir, '.local', 'state'), XDG_RUNTIME_DIR: path.join(homeDir, 'run'), TMPDIR: path.join(scratch, 'tmp3-' + token) };
for (const d of [profileDir, ...Object.values(xdg), path.join(xdg.XDG_CONFIG_HOME, 'chromium', 'Crash Reports')]) fs.mkdirSync(d, { recursive: true });

const FIXTURE = `<!doctype html><html><head><meta charset="utf-8"><title>r69e3p3</title>
<style>html,body{margin:0;padding:0} #wide{width:${CONTENT.width}px;height:${CONTENT.height}px;background:#ddd}</style></head>
<body><p id="n" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace">${token}</p><div id="wide"></div>
<script>
const evts = []; let label = 'boot';
function push(o) { evts.push(Object.assign({ seq: evts.length, label, sx: scrollX, sy: scrollY, t: Math.round(performance.now() * 100) / 100 }, o)); }
for (const t of ['wheel','pointerdown','pointerup','pointermove','touchstart','touchend','touchmove','scrollend']) {
  addEventListener(t, (e) => {
    if (t === 'wheel') push({ type: t, dx: e.deltaX, dy: e.deltaY, trusted: e.isTrusted });
    else if (t.startsWith('pointer')) push({ type: t, pt: e.pointerType, trusted: e.isTrusted });
    else push({ type: t, trusted: e.isTrusted });
  }, { passive: true, capture: true });
}
window.__mark = (l) => { label = l; return { sx: scrollX, sy: scrollY, n: evts.length }; };
window.__cap = (n) => {
  const se = document.scrollingElement;
  return { sx: scrollX, sy: scrollY, seLeft: se.scrollLeft, seTop: se.scrollTop,
    innerW: innerWidth, innerH: innerHeight, clientW: se.clientWidth, clientH: se.clientHeight,
    scrollW: se.scrollWidth, scrollH: se.scrollHeight,
    maxScrollLeft: se.scrollWidth - se.clientWidth, maxScrollTop: se.scrollHeight - se.clientHeight,
    events: evts.slice(n) };
};
window.__nonce = () => document.getElementById('n').textContent;
</script></body></html>`;

const fixtureServer = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(FIXTURE); });
const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + cdpPort, '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
const origin = 'http://127.0.0.1:' + httpPort;
let child = null, ws = null, closing = null;
async function teardown() {
  if (closing) return closing;
  closing = (async () => { try { ws && ws.close(); } catch {} if (child && child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} } } await sleep(400); try { fixtureServer.close(); } catch {} await sleep(200); })();
  return closing;
}
const cdpSendLog = [];
const receipt = { schema: SCHEMA, nonce: token, startedAt: new Date().toISOString(), instrument: { probe: { path: SELF, sha256: sha256(fs.readFileSync(SELF)) }, chromium: { path: CHROMIUM, sha256: sha256(fs.readFileSync(CHROMIUM)) }, source: '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/sources/input_handler.cc' }, viewport: VIEWPORT, content: CONTENT, fixtureSha: sha256(Buffer.from(FIXTURE)), childArgv, legs: [], failures: [] };
let interrupted = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; await teardown(); process.exit(1); });
const sum = (evs, t, k) => evs.filter((e) => e.type === t).reduce((a, e) => a + e[k], 0);
const counts = (evs, t) => evs.filter((e) => e.type === t).length;
try {
  await new Promise((res, rej) => { fixtureServer.once('error', rej); fixtureServer.listen(httpPort, '127.0.0.1', res); });
  const v = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, ...xdg } });
  receipt.instrument.chromium.version = (v.stdout || '').trim();
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...xdg } });
  let stderrHead = '';
  child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
  const fetchJSON = async (u) => { const r = await fetch(u, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 1600 && !page; i++) { try { page = (await fetchJSON('http://127.0.0.1:' + cdpPort + '/json/list')).find((t) => t.type === 'page'); } catch {} if (!page) await sleep(150); }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + cdpPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('ws timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(t); res(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(t); rej(new Error('ws error')); }, { once: true }); });
  let msgId = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.timer); m.error ? p.reject(Object.assign(new Error('cdp: ' + m.error.message), { cdpError: m.error })) : p.resolve(m); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++msgId; cdpSendLog.push({ id, method, params }); const timer = setTimeout(() => { pending.delete(id); rej(new Error('CDP timeout ' + method)); }, 30000); pending.set(id, { resolve: res, reject: rej, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?' + token });
  for (let i = 0; i < 200; i++) { try { if ((await evalValue('window.__nonce && window.__nonce()')) === token) break; } catch {} await sleep(50); }
  await sleep(300);
  receipt.geometry = await evalValue('window.__cap(0)').then((g) => { delete g.events; return g; });
  const settle = async () => { let px = -1, py = -1, s = 0; for (let i = 0; i < 80; i++) { const c = await evalValue('({x: scrollX, y: scrollY})'); if (c.x === px && c.y === py) s++; else s = 0; px = c.x; py = c.y; if (s >= 3) return { sx: px, sy: py }; await sleep(60); } return { sx: px, sy: py }; };
  const reset = async () => { await evalValue('window.scrollTo(0,0)'); await sleep(150); await settle(); await sleep(60); };
  const leg = async ({ name, note, params }) => {
    const mark = await evalValue(`window.__mark(${JSON.stringify(name)})`);
    const t0 = performance.now();
    let err = null, res = null;
    try { res = await send('Input.synthesizeScrollGesture', params); } catch (e) { err = e.cdpError || { message: e.message }; }
    const latencyMs = Math.round((performance.now() - t0) * 10) / 10;
    await settle();
    const cap = await evalValue(`window.__cap(${mark.n})`);
    const evs = cap.events; delete cap.events;
    const rec = { name, note, params, latencyMs, cdpError: err, cdpResult: res ? res.result : null, start: mark, end: cap, deltaSx: cap.sx - mark.sx, deltaSy: cap.sy - mark.sy, wheelCount: counts(evs, 'wheel'), wheelDeltaXSum: Math.round(sum(evs, 'wheel', 'dx') * 1000) / 1000, wheelDeltaYSum: Math.round(sum(evs, 'wheel', 'dy') * 1000) / 1000, eventTypeCounts: evs.reduce((a, e) => { const k = e.type + (e.pt ? ':' + e.pt : ''); a[k] = (a[k] || 0) + 1; return a; }, {}), wheelIntervalsMs: evs.filter((e) => e.type === 'wheel').slice(1).map((e, i, arr) => Math.round((e.t - (i === 0 ? evs.find((x) => x.type === 'wheel').t : arr[i - 1].t)) * 100) / 100).slice(0, 120) };
    receipt.legs.push(rec);
    console.log(JSON.stringify({ leg: name, deltaSx: rec.deltaSx, deltaSy: rec.deltaSy, wheelDeltaXSum: rec.wheelDeltaXSum, wheelDeltaYSum: rec.wheelDeltaYSum, latencyMs, wheelCount: rec.wheelCount, cdpError: err ? err.message : null, end: { sx: cap.sx, sy: cap.sy, maxScrollLeft: cap.maxScrollLeft, maxScrollTop: cap.maxScrollTop } }));
    return rec;
  };
  await reset();
  await leg({ name: 'j1_x_minus300_only', note: 'xDistance -300 only: control for the diagonal leg', params: { x: 400, y: 400, xDistance: -300, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'j2_diagonal_minus300_minus300', note: 'xDistance -300 + yDistance -300 in one call: vector magnitude 424.26 at speed 800 -> predicted 530 ms', params: { x: 400, y: 400, xDistance: -300, yDistance: -300, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'j3_clamp_exact_5000', note: 'xDistance -5000 from 0: expect scrollX == scrollWidth - clientWidth exactly', params: { x: 400, y: 400, xDistance: -5000, gestureSourceType: 'mouse', preventFling: true } });
  await leg({ name: 'j4_clamp_already_at_right', note: 'xDistance -5000 while already at max scrollX: expect movement 0, wheel deltaX sum +5000', params: { x: 400, y: 400, xDistance: -5000, gestureSourceType: 'mouse', preventFling: true } });
  receipt.cdpMethods = cdpSendLog.reduce((a, c) => { a[c.method] = (a[c.method] || 0) + 1; return a; }, {});
} catch (e) { receipt.failures.push({ id: 'probe-error', detail: e.message }); }
finally { await teardown(); }
receipt.interrupted = interrupted;
receipt.finishedAt = new Date().toISOString();
fs.writeFileSync(path.join(outDir, 'receipt-set3.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ ok: receipt.failures.length === 0 && !interrupted, legs: receipt.legs.length, failures: receipt.failures, geometry: receipt.geometry }));
process.exitCode = receipt.failures.length === 0 && !interrupted ? 0 : 1;
