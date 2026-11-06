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

const SCHEMA = 'tabi-r69-exec3-synthscroll-edges';
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

  await reset();
  // (a) horizontal: negative xDistance
  await leg({ name: 'a1_xDistance_minus300', note: 'negative xDistance expected to scroll right (scrollX +300), wheel deltaX sum +300', params: { x: 400, y: 400, xDistance: -300, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  await leg({ name: 'a2_xDistance_plus300', note: 'positive xDistance expected to scroll left (scrollX -300 from 300)', params: { x: 400, y: 400, xDistance: 300, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  // (b) speed timing, 3 runs each, yDistance -600
  for (const [i, spec] of [400, 1600, 400, 1600, 400, 1600].entries()) {
    await reset();
    await leg({ name: `b_speed${spec}_run${Math.floor(i / 2) + 1}`, note: `speed ${spec} px/s, yDistance -600 -> predicted latency ${Math.round((600 / spec) * 1000)} ms`, params: { x: 400, y: 400, yDistance: -600, speed: spec, gestureSourceType: 'mouse', preventFling: true } });
  }
  await reset();
  await leg({ name: 'b_speed_default', note: 'no speed param -> source line 2168 kDefaultSpeed 800, predicted 750 ms', params: { x: 400, y: 400, yDistance: -600, gestureSourceType: 'mouse', preventFling: true } });
  await reset();
  // (c) gestureSourceType default explicit vs absent
  await leg({ name: 'c_source_default_explicit', note: "gestureSourceType:'default' explicit", params: { x: 400, y: 400, yDistance: -300, gestureSourceType: 'default', preventFling: true } });
  await reset();
  await leg({ name: 'c_source_absent', note: 'gestureSourceType absent', params: { x: 400, y: 400, yDistance: -300, preventFling: true } });
  await reset();
  await leg({ name: 'c_source_touch_contrast', note: "gestureSourceType:'touch' contrast leg", params: { x: 400, y: 400, yDistance: -300, gestureSourceType: 'touch', preventFling: true } });
  await reset();
  // (d) out of bounds x / y
  await leg({ name: 'd_x_out_of_bounds_5000', note: 'x=5000 outside 1280-wide view -> line 2162-2164 Position out of bounds', params: { x: 5000, y: 400, yDistance: -100, gestureSourceType: 'mouse' } });
  await leg({ name: 'd_x_negative', note: 'x=-1 outside view', params: { x: -1, y: 400, yDistance: -100, gestureSourceType: 'mouse' } });
  await leg({ name: 'd_y_out_of_bounds_5000', note: 'y=5000 outside 900-tall view', params: { x: 400, y: 5000, yDistance: -100, gestureSourceType: 'mouse' } });
  await leg({ name: 'd_x_inside_wide_content_1200', note: 'x=1200 is inside the 1280 view though near the right edge', params: { x: 1200, y: 400, yDistance: -100, gestureSourceType: 'mouse' } });
  await reset();
  // (e) invalid / unsupported enum
  await leg({ name: 'e_source_pen', note: "'pen' is not in Input.pdl GestureSourceType -> line 2182-2187 Unknown gestureSourceType", params: { x: 400, y: 400, yDistance: -100, gestureSourceType: 'pen' } });
  await leg({ name: 'e_source_bogus', note: "'bogus' -> Unknown gestureSourceType", params: { x: 400, y: 400, yDistance: -100, gestureSourceType: 'bogus' } });
  // (f) overscroll at the bottom edge
  await evalValue('window.scrollTo(0, document.scrollingElement.scrollHeight)');
  await sleep(200); await settle(); await sleep(100);
  const bottomBefore = await evalValue('({x: scrollX, y: scrollY, maxY: document.scrollingElement.scrollHeight - innerHeight})');
  receipt.bottomBefore = bottomBefore;
  await leg({ name: 'f1_bottom_yOverscroll100', note: 'at bottom edge, only yOverscroll:100 -> line 2177-2181 pushes (-0,-100); expected clamped, movement 0', params: { x: 400, y: 400, yOverscroll: 100, gestureSourceType: 'mouse', preventFling: true } });
  // (f2) additive overscroll mid-page (sign inversion evidence)
  await reset();
  await leg({ name: 'f2_mid_yDistance_minus300_yOverscroll100', note: 'mid-page: yDistance -300 plus yOverscroll 100 -> distances [(-300),(-100)] total -400 expected', params: { x: 400, y: 400, yDistance: -300, yOverscroll: 100, gestureSourceType: 'mouse', preventFling: true } });
  // (f3) top-edge overscroll upward
  await reset();
  await leg({ name: 'f3_top_yOverscroll_minus100', note: 'at top, yOverscroll:-100 -> pushes (+100) upward from a clamped top edge', params: { x: 400, y: 400, yOverscroll: -100, gestureSourceType: 'mouse', preventFling: true } });

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
fs.writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ ok: receipt.failures.length === 0 && !interrupted, legs: receipt.legs.length, failures: receipt.failures }));
process.exitCode = receipt.failures.length === 0 && !interrupted ? 0 : 1;
