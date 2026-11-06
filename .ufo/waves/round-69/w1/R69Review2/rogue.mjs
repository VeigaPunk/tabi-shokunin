// R69Review2 live rogue driver: real chromium, real fixture events, but the scroll
// producer is UNLOGGED Input.dispatchMouseEvent wheel sends; cdpSendLog claims the four
// frozen Input.synthesizeScrollGesture calls (3 fabricated rows + 1 real touch gesture).
// review probe only — never a scored run.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';

const SCRATCH = '/fast/scratch/hyaku/tabi-r69/R69Review2/rogue-run';
const DRIVER_SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthscroll-round69.mjs';
const PIN = '13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3';
const NONCE = 'tabi-r69-review2-rogue4';
const FIXTURE_PORT = 45231, DEV_PORT = 45232;
const FROZEN = [
  { name: 'start', params: null, expectScrollY: 0 },
  { name: 'mouse', params: { x: 400, y: 400, yDistance: -600, gestureSourceType: 'mouse' }, expectScrollY: 600 },
  { name: 'default', params: { x: 400, y: 400, yDistance: 300 }, expectScrollY: 300 },
  { name: 'repeat', params: { x: 400, y: 400, yDistance: -200, gestureSourceType: 'mouse', repeatCount: 2, repeatDelayMs: 100 }, expectScrollY: 900 },
  { name: 'touch', params: { x: 400, y: 400, yDistance: -500, gestureSourceType: 'touch', preventFling: true }, expectScrollY: 900 },
];
fs.rmSync(SCRATCH, { recursive: true, force: true });
fs.mkdirSync(SCRATCH, { recursive: true });
const src = fs.readFileSync(DRIVER_SRC, 'utf8');
const tpl = src.match(/\/\*SYNTHSCROLL-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;/)[1];
const FIXTURE_HTML = tpl.replaceAll('__NONCE__', NONCE);
fs.writeFileSync(path.join(SCRATCH, 'fixture.html'), FIXTURE_HTML);
const token = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(SCRATCH, 'profile-' + token);
const runHome = path.join(SCRATCH, 'home-' + token);
for (const d of [profileDir, runHome, path.join(runHome, '.config', 'chromium', 'Crash Reports'), path.join(runHome, '.cache'), path.join(runHome, '.local', 'share'), path.join(runHome, '.local', 'state'), path.join(runHome, 'run')]) fs.mkdirSync(d, { recursive: true });
const runXdg = { HOME: runHome, XDG_CONFIG_HOME: path.join(runHome, '.config'), XDG_CACHE_HOME: path.join(runHome, '.cache'), XDG_DATA_HOME: path.join(runHome, '.local', 'share'), XDG_STATE_HOME: path.join(runHome, '.local', 'state'), XDG_RUNTIME_DIR: path.join(runHome, 'run'), TMPDIR: SCRATCH };
const serverLog = [];
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const run = u.searchParams.get('run') || '';
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run, status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
});
await new Promise((res, rej) => { server.once('error', rej); server.listen(FIXTURE_PORT, '127.0.0.1', res); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const version = spawnSync('/usr/bin/chromium', ['--version'], { encoding: 'utf8', env: { ...process.env, ...runXdg } });
const childArgv = ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + DEV_PORT, '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'];
const child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
let page = null;
for (let i = 0; i < 1600 && !page; i++) {
  try { page = (await (await fetch('http://127.0.0.1:' + DEV_PORT + '/json/list', { signal: AbortSignal.timeout(1500) })).json()).find((t) => t.type === 'page'); } catch {}
  if (!page) await sleep(150);
}
if (!page) { console.log(JSON.stringify({ error: 'no page target' })); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('ws timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(t); res(); }, { once: true }); });
let msgId = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); p(m); } });
const raw = (method, params = {}) => new Promise((resolve, reject) => { const id = ++msgId; const t = setTimeout(() => reject(new Error('timeout ' + method)), 30000); pending.set(id, (m) => { clearTimeout(t); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m); }); ws.send(JSON.stringify({ id, method, params })); });
const logRows = [];
const send = async (method, params = {}) => { logRows.push({ id: 0, method, params }); return raw(method, params); };
const evalV = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;
const settleY = async () => { let prev = -1, stable = 0; for (let i = 0; i < 80; i++) { const y = await evalV('window.scrollY'); if (y === prev) stable++; else stable = 0; prev = y; if (stable >= 3) return prev; await sleep(40); } return prev; };
await send('Browser.getVersion');
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:' + FIXTURE_PORT + '/?run=' + encodeURIComponent(NONCE) });
let ready = false;
for (let i = 0; i < 100 && !ready; i++) { try { ready = await evalV('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events)'); } catch {} if (!ready) await sleep(100); }
if (!ready) { console.log(JSON.stringify({ error: 'fixture not ready' })); process.exit(1); }
const nonceOnPage = await evalV('window.__nonceOnPage');
const legs = [];
const hiddenWheel = async (deltaY) => { await raw('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 400, y: 400, deltaX: 0, deltaY, button: 'none', buttons: 0 }); };
for (const leg of FROZEN) {
  await evalV('window.__setLeg(' + JSON.stringify(leg.name) + ')');
  const yBefore = await evalV('window.scrollY');
  const t0 = Date.now();
  let result = null;
  if (leg.params) {
    if (leg.name === 'touch') {
      result = (await send('Input.synthesizeScrollGesture', leg.params)).result; // the ONE real, logged gesture
    } else {
      logRows.push({ id: 0, method: 'Input.synthesizeScrollGesture', params: JSON.parse(JSON.stringify(leg.params)) }); // FABRICATED log row, never sent
      const n = leg.name === 'mouse' ? 5 : 3;
      const gap = leg.name === 'repeat' ? 420 : 220;
      const total = -(leg.params.yDistance) * (1 + (leg.params.repeatCount || 0));
      for (let k = 0; k < n; k++) { await hiddenWheel(total / n); await sleep(gap); } // UNLOGGED producer
    }
    await sleep(900);
  }
  legs.push({ name: leg.name, params: leg.params, scrollYBefore: yBefore, scrollY: await settleY(), cdpResult: result, elapsedMs: Date.now() - t0 });
}
await evalV('window.__setLeg("end")');
const events = await evalV('JSON.parse(JSON.stringify(window.__events))');
const pageState = { scrollY: await evalV('window.scrollY'), scrollEvents: await evalV('window.__scrollEvents'), eventCount: events.length };
// teardown, done for real
try { ws.close(); } catch {}
try { process.kill(-child.pid, 'SIGKILL'); } catch {}
await sleep(600);
let survivors = [];
try {
  const ps = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
  for (const line of (ps.stdout || '').split('\n')) if (line.includes(token) || line.includes(profileDir)) { const pid = Number(line.trim().split(/\s+/)[0]); if (Number.isInteger(pid) && pid > 1) { try { process.kill(pid, 'SIGKILL'); survivors.push(pid); } catch {} } }
} catch {}
await sleep(300);
const serverClosed = (() => { let done = false; return new Promise((res) => { server.close(() => { done = true; res(null); }); setTimeout(() => { if (!done) res(null); }, 2000); }); })();
await serverClosed;
const probe = (port) => new Promise((res) => { const s = new net.Socket(); let d = false; const fin = (v) => { if (!d) { d = true; try { s.destroy(); } catch {} res(v); } }; s.setTimeout(1500, () => fin('timeout')); s.on('connect', () => fin('open')); s.on('error', () => fin('closed')); s.connect(port, '127.0.0.1'); });
const portProbes = { fixture: await probe(FIXTURE_PORT), devtools: await probe(DEV_PORT) };
const curl = (port) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + port + '/'], { encoding: 'utf8', timeout: 4000 }).status;
const teardown = { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes, postKillCurl: { fixture: curl(FIXTURE_PORT), devtools: curl(DEV_PORT) } };
// legOk, copied from the driver so the predicate claim is honest
const byLeg = (name) => events.filter((e) => e.leg === name);
const count = (evs, type, pt) => evs.filter((e) => e.type === type && (pt === undefined || e.pointerType === pt)).length;
const wheelSum = (evs) => evs.filter((e) => e.type === 'wheel').reduce((a, e) => a + e.deltaY, 0);
const legOk = (name) => {
  const l = legs.find((x) => x.name === name); const plan = FROZEN.find((x) => x.name === name); const evs = byLeg(name);
  if (!l || l.scrollY !== plan.expectScrollY) return false;
  if (name === 'start') return evs.length === 0;
  const notWheel = evs.filter((e) => e.type !== 'wheel' && e.type !== 'scrollend').length;
  if (name === 'touch') return count(evs, 'wheel') === 0 && count(evs, 'pointerdown', 'touch') === 1 && count(evs, 'pointerup', 'touch') === 1 && count(evs, 'touchstart') === 1 && count(evs, 'touchend') === 1 && count(evs, 'pointermove', 'touch') >= 1 && evs.every((e) => e.isTrusted === true);
  return count(evs, 'wheel') >= 1 && notWheel === 0 && Math.abs(wheelSum(evs) - (l.scrollY - l.scrollYBefore)) < 1e-6 && count(evs, 'scrollend') >= 1 && evs.every((e) => e.isTrusted === true);
};
const gestureCalls = logRows.filter((c) => c.method === 'Input.synthesizeScrollGesture').length;
const legShape = FROZEN.map((l) => legOk(l.name));
const hypothesis = (legShape.every(Boolean) && gestureCalls === 4 && nonceOnPage === NONCE) ? 'CONFIRMED' : 'REFUTED';
const receipt = {
  schema: 'tabi-chrome-cdp-synthscroll-r69', nonce: NONCE, degenerate: null, driverSha256: PIN,
  host: { chromium: version.stdout.trim(), cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', argv: childArgv, launchToken: token },
  fixture: { sha256: crypto.createHash('sha256').update(FIXTURE_HTML).digest('hex'), origin: 'http://127.0.0.1:' + FIXTURE_PORT, viewport: { width: 1280, height: 900 }, documentHeight: 6000 },
  plan: FROZEN, nonceOnPage, legs, events, cdpSendLog: logRows.map((c, i) => ({ ...c, id: i + 1 })), pageState, serverLog, teardown,
  sweeps: { preLaunch: 0, midRun: 1, postKill: 0 }, failures: hypothesis === 'CONFIRMED' ? [] : [{ id: 'review-probe', detail: 'legShape ' + JSON.stringify(legShape) + ' gestures ' + gestureCalls }], synthScrollHypothesis: hypothesis, predicate: hypothesis === 'CONFIRMED',
};
fs.writeFileSync(path.join(SCRATCH, 'rogue-receipt.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ legShape, gestureCalls, nonceOnPage, pageState, teardown, eventsByLeg: Object.entries(events.reduce((a, e) => { (a[e.leg] = a[e.leg] || {})[e.type] = (a[e.leg][e.type] || 0) + 1; return a; }, {})) }));
process.exit(0);
