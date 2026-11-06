#!/usr/bin/env node
// R69Exec3 exploratory probe: Input.synthesizeScrollGesture parameter edges.
// Derived from tabi-shokunin/scripts/chrome-cdp-synthscroll-round69.mjs
// (sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3).
// Lane file is never edited; this is an unscored knowledge probe.
// Usage: node probe.mjs --scratch <abs dir> --out <abs dir> --http-port N --cdp-port N
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r69-exec3-synthscroll-edges-set2';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const VIEWPORT = { width: 1280, height: 900 };
const CONTENT = { width: 2280, height: 6800 };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail: d })); process.exit(2); };
const scratch = opt('scratch');
const outDir = opt('out');
const httpPort = Number(opt('http-port'));
const cdpPort = Number(opt('cdp-port'));
if (!scratch || !path.isAbsolute(scratch)) usage('--scratch must be absolute');
if (!outDir || !path.isAbsolute(outDir)) usage('--out must be absolute');
if (!Number.isInteger(httpPort) || !Number.isInteger(cdpPort) || httpPort === cdpPort) usage('ports');
if (!(httpPort >= 41000 && httpPort <= 48999 && cdpPort >= 41000 && cdpPort <= 48999)) usage('ports must be 41000-48999');
fs.mkdirSync(scratch, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
const token = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratch, 'profile-' + token);
const homeDir = path.join(scratch, 'home-' + token);
const xdg = {
  HOME: homeDir,
  XDG_CACHE_HOME: path.join(homeDir, '.cache'),
  XDG_CONFIG_HOME: path.join(homeDir, '.config'),
  XDG_DATA_HOME: path.join(homeDir, '.local', 'share'),
  XDG_STATE_HOME: path.join(homeDir, '.local', 'state'),
  XDG_RUNTIME_DIR: path.join(homeDir, 'run'),
  TMPDIR: path.join(scratch, 'tmp-' + token),
};
for (const d of [profileDir, ...Object.values(xdg), path.join(xdg.XDG_CONFIG_HOME, 'chromium', 'Crash Reports')]) fs.mkdirSync(d, { recursive: true });

const FIXTURE = `<!doctype html><html><head><meta charset="utf-8"><title>r69e3</title>
<style>html,body{margin:0;padding:0} #wide{width:${CONTENT.width}px;height:${CONTENT.height}px;background:linear-gradient(90deg,#eee,#ccc)}</style>
</head><body><p id="n" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace">${token}</p><div id="wide"></div>
<script>
const evts = []; let label = 'boot';
function push(o) { evts.push(Object.assign({ seq: evts.length, label, sx: window.scrollX, sy: window.scrollY, t: Math.round(performance.now() * 100) / 100 }, o)); }
for (const t of ['wheel','pointerdown','pointerup','pointermove','pointercancel','touchstart','touchend','touchmove','touchcancel','scroll','scrollend']) {
  addEventListener(t, (e) => {
    if (t === 'wheel') push({ type: t, dx: e.deltaX, dy: e.deltaY, trusted: e.isTrusted });
    else if (t === 'scroll') return; // recorded only via scrollend/settle to keep the log small
    else if (t.startsWith('pointer')) push({ type: t, pt: e.pointerType, trusted: e.isTrusted });
    else push({ type: t, trusted: e.isTrusted });
  }, { passive: true, capture: true });
}
window.__mark = (l) => { label = l; return { label: l, sx: window.scrollX, sy: window.scrollY, n: evts.length, ty: performance.now() }; };
window.__cap = (n) => ({
  sx: window.scrollX, sy: window.scrollY, n: evts.length,
  maxX: Math.max(0, document.scrollingElement.scrollWidth - innerWidth),
  maxY: Math.max(0, document.scrollingElement.scrollHeight - innerHeight),
  vw: innerWidth, vh: innerHeight,
  docW: document.scrollingElement.scrollWidth, docH: document.scrollingElement.scrollHeight,
  events: evts.slice(n),
});
window.__nonce = () => document.getElementById('n').textContent;
window.__show = (l) => { label = l; };
</script></body></html>`;

const fixtureServer = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(FIXTURE);
});

const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + cdpPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];

const origin = 'http://127.0.0.1:' + httpPort;
const RUNS = [];
let child = null, ws = null, closing = null;

async function teardown() {
  if (closing) return closing;
  closing = (async () => {
    try { ws && ws.close(); } catch {}
    if (child && child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} } }
    await sleep(400);
    try { fixtureServer.close(); } catch {}
    await sleep(200);
  })();
  return closing;
}

const cdpSendLog = [];
const receipt = {
  schema: SCHEMA, nonce: token, startedAt: new Date().toISOString(),
  instrument: {
    probe: { path: SELF, sha256: sha256(fs.readFileSync(SELF)) },
    base: { path: '/fast/scratch/hyaku/tabi-r69/R69Exec3/base-chrome-cdp-synthscroll-round69.mjs', sha256: 'checked-at-copy' },
    chromium: { path: CHROMIUM, sha256: sha256(fs.readFileSync(CHROMIUM)), version: null },
    source: '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/sources/input_handler.cc',
  },
  viewport: VIEWPORT, content: CONTENT, fixtureSha: sha256(Buffer.from(FIXTURE)),
  childArgv, legs: [], failures: [], pageProbe: null,
};

let interrupted = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; await teardown(); process.exit(1); });

const counts = (evs, type) => evs.filter((e) => e.type === type).length;
const sum = (evs, type, key) => evs.filter((e) => e.type === type).reduce((a, e) => a + e[key], 0);

try {
  await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(httpPort, '127.0.0.1', resolve); });
  const v = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, ...xdg } });
  receipt.instrument.chromium.version = (v.stdout || '').trim();
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...xdg } });
  let stderrHead = '';
  child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
  receipt.hostStderrHead = () => stderrHead;
  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 1600 && !page; i++) {
    try { page = (await fetchJSON('http://127.0.0.1:' + cdpPort + '/json/list')).find((t) => t.type === 'page'); } catch {}
    if (!page) await sleep(150);
  }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + cdpPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('ws open timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('ws error')); }, { once: true }); });
  let msgId = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data); const p = pending.get(msg.id);
    if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(Object.assign(new Error('cdp: ' + msg.error.message), { cdpError: msg.error })) : p.resolve(msg); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++msgId; cdpSendLog.push({ id, method, params });
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout ' + method)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evalValue = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    return r.result.result.value;
  };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?' + token });
  for (let i = 0; i < 200; i++) { try { if ((await evalValue('window.__nonce && window.__nonce()')) === token) break; } catch {} await sleep(50); }
  await sleep(300);
  receipt.pageProbe = await evalValue('({nonce: window.__nonce(), sx: scrollX, sy: scrollY, maxX: document.scrollingElement.scrollWidth - innerWidth, maxY: document.scrollingElement.scrollHeight - innerHeight, vw: innerWidth, vh: innerHeight})');

  const settle = async () => {
    let px = -1, py = -1, stable = 0;
    for (let i = 0; i < 60; i++) {
      const s = await evalValue('({x: scrollX, y: scrollY})');
      if (s.x === px && s.y === py) stable++; else stable = 0;
      px = s.x; py = s.y;
      if (stable >= 3) return { sx: px, sy: py };
      await sleep(60);
    }
    return { sx: px, sy: py };
  };
  const reset = async () => { await evalValue('window.scrollTo(0,0)'); await sleep(120); await settle(); await sleep(60); };

  // A leg: mark -> send gesture (timed) -> settle -> capture events since mark.
  const leg = async ({ name, params, note, expectError }) => {
    const mark = await evalValue(`window.__mark(${JSON.stringify(name)})`);
    const t0 = performance.now();
    let res = null, err = null;
    try { res = await send('Input.synthesizeScrollGesture', params); } catch (e) { err = e.cdpError || { message: e.message }; }
    const latencyMs = Math.round((performance.now() - t0) * 10) / 10;
    const settled = err ? await settle() : await settle();
    const cap = await evalValue(`window.__cap(${mark.n})`);
    const evs = cap.events;
    const rec = {
      name, note, params, latencyMs,
      cdpError: err, cdpResult: res ? res.result : null,
      startSx: mark.sx, startSy: mark.sy, endSx: cap.sx, endSy: cap.sy,
      deltaSx: cap.sx - mark.sx, deltaSy: cap.sy - mark.sy,
      wheelCount: counts(evs, 'wheel'),
      wheelDeltaXSum: Math.round(sum(evs, 'wheel', 'dx') * 1000) / 1000,
      wheelDeltaYSum: Math.round(sum(evs, 'wheel', 'dy') * 1000) / 1000,
      eventTypeCounts: evs.reduce((a, e) => { const k = e.type + (e.pt ? ':' + e.pt : ''); a[k] = (a[k] || 0) + 1; return a; }, {}),
      allTrusted: evs.length > 0 ? evs.every((e) => e.trusted !== false) : null,
      events: evs,
    };
    receipt.legs.push(rec);
    console.log(JSON.stringify({ leg: name, deltaSx: rec.deltaSx, deltaSy: rec.deltaSy, wheelDeltaXSum: rec.wheelDeltaXSum, wheelDeltaYSum: rec.wheelDeltaYSum, latencyMs, cdpError: err ? err.message : null, types: rec.eventTypeCounts }));
    return rec;
  };

  // ---- set 2: boundary sharpness, clamp, latency curve, enum casing ----
  await evalValue('window.scrollTo(0,0)'); await sleep(150); await settle();
  await leg({ name: 'g1_xDistance_minus5000_clamp', note: 'xDistance -5000 from scrollX 0, maxX 1000 -> expect clamp at 1000, wheel deltaX sum +5000', params: { x: 400, y: 400, xDistance: -5000, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'g2_x_1279_9', note: 'x=1279.9 inside the 1280-wide view (PointIsWithinContents, line 2318)', params: { x: 1279.9, y: 400, yDistance: -60, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'g3_x_1280', note: 'x=1280 on the right edge -> expected Position out of bounds', params: { x: 1280, y: 400, yDistance: -60, gestureSourceType: 'mouse' } });
  await leg({ name: 'g4_y_899_9', note: 'y=899.9 inside the 900-tall view', params: { x: 400, y: 899.9, yDistance: -60, gestureSourceType: 'mouse', preventFling: true } });
  await leg({ name: 'g5_y_900', note: 'y=900 on the bottom edge -> expected Position out of bounds', params: { x: 400, y: 900, yDistance: -60, gestureSourceType: 'mouse' } });
  await reset();
  await leg({ name: 'g6_source_Mouse_uppercase', note: "gestureSourceType:'Mouse' (capitalised) -> expected Unknown gestureSourceType", params: { x: 400, y: 400, yDistance: -60, gestureSourceType: 'Mouse' } });
  await leg({ name: 'g7_source_mouse_explicit', note: "gestureSourceType:'mouse' explicit, same shape as c_source_absent", params: { x: 400, y: 400, yDistance: -300, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  // latency curve: distance/speed separation
  await leg({ name: 'h1_speed200_y600', note: 'speed 200, yDistance -600 -> predicted 3000 ms', params: { x: 400, y: 400, yDistance: -600, speed: 200, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'h2_speed3200_y600', note: 'speed 3200, yDistance -600 -> predicted 187.5 ms', params: { x: 400, y: 400, yDistance: -600, speed: 3200, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'h3_speed800_y1200', note: 'speed 800, yDistance -1200 -> predicted 1500 ms (distance doubled)', params: { x: 400, y: 400, yDistance: -1200, speed: 800, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'h4_speed400_y1200', note: 'speed 400, yDistance -1200 -> predicted 3000 ms', params: { x: 400, y: 400, yDistance: -1200, speed: 400, gestureSourceType: 'mouse', preventFling: true } });
  // xOverscroll symmetry at the right edge and mid-page
  await evalValue('window.scrollTo(document.scrollingElement.scrollWidth, 0)'); await sleep(150); await settle(); await sleep(60);
  receipt.rightBefore = await evalValue('({x: scrollX, maxX: document.scrollingElement.scrollWidth - innerWidth})');
  await leg({ name: 'i1_right_xOverscroll100', note: 'at right edge, xOverscroll:100 -> source pushes x=-100 (further right), expected wheel deltaX +100, movement 0', params: { x: 400, y: 400, xOverscroll: 100, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'i2_mid_xDistance_minus200_xOverscroll100', note: 'mid-page xDistance -200 + xOverscroll 100 -> expected total scrollX 300', params: { x: 400, y: 400, xDistance: -200, xOverscroll: 100, gestureSourceType: 'mouse', preventFling: true } });
  // yOverscroll magnitude at the bottom edge
  await evalValue('window.scrollTo(0, document.scrollingElement.scrollHeight)'); await sleep(150); await settle(); await sleep(60);
  receipt.bottomBefore2 = await evalValue('({y: scrollY, maxY: document.scrollingElement.scrollHeight - innerHeight})');
  await leg({ name: 'f4_bottom_yOverscroll500', note: 'at bottom edge, yOverscroll:500 -> expected wheel deltaY +500, movement 0', params: { x: 400, y: 400, yOverscroll: 500, gestureSourceType: 'mouse', preventFling: true } });

  receipt.pageAfter = await evalValue('({sx: scrollX, sy: scrollY, maxX: document.scrollingElement.scrollWidth - innerWidth, maxY: document.scrollingElement.scrollHeight - innerHeight})');
  receipt.cdpMethods = cdpSendLog.reduce((a, c) => { a[c.method] = (a[c.method] || 0) + 1; return a; }, {});
  receipt.gestureCallCount = cdpSendLog.filter((c) => c.method === 'Input.synthesizeScrollGesture').length;
  receipt.dispatcherCalls = cdpSendLog.filter((c) => c.method === 'Input.dispatchMouseEvent' || c.method === 'Input.dispatchTouchEvent').length;
} catch (e) {
  receipt.failures.push({ id: 'probe-error', detail: e.message });
} finally {
  if (typeof receipt.hostStderrHead === 'function') receipt.hostStderrHead = receipt.hostStderrHead();
  await teardown();
}
receipt.interrupted = interrupted;
receipt.finishedAt = new Date().toISOString();
fs.writeFileSync(path.join(outDir, 'receipt-set2.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ ok: receipt.failures.length === 0 && !interrupted, legs: receipt.legs.length, failures: receipt.failures }));
process.exitCode = receipt.failures.length === 0 && !interrupted ? 0 : 1;
