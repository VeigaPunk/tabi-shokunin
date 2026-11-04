#!/usr/bin/env node
// Pre-freeze probe (round 63): measure Chromium/Linux wheel delivery and scroll
// behavior on a loopback fixture. Writes a JSON receipt. Not a claim instrument:
// it exists to size C1 before the predicate freeze (same role as r62's
// controls/contextmenu-red-before.json).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const scratch = opt('scratch'), out = opt('out'), httpPort = Number(opt('http-port')), devPort = Number(opt('cdp-port'));
const smooth = argv.includes('--smooth');
if (!scratch || !out || !httpPort || !devPort) { console.error('usage: --scratch DIR --out FILE --http-port N --cdp-port N [--smooth]'); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r63 wheel probe</title>
<style>
  html, body { margin: 0; padding: 0; }
  #tall { height: 3000px; background: linear-gradient(#fff, #ddf); }
  #marker { position: absolute; top: 1200px; left: 0; width: 100px; height: 20px; background: #8f8; }
</style>
<script>
window.__wheellog = [];
window.__swallow = false;
window.__nav = 0;
document.addEventListener('wheel', function (e) {
  if (window.__swallow) e.preventDefault();
  window.__wheellog.push({ type: e.type, ts: e.timeStamp, deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ,
    deltaMode: e.deltaMode, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
    isTrusted: e.isTrusted, cancelable: e.cancelable, defaultPrevented: e.defaultPrevented,
    targetId: e.target.id || e.target.tagName, scrollY: window.scrollY });
}, { capture: true, passive: false });
window.__afterDefault = [];
document.addEventListener('wheel', function (e) {
  setTimeout(() => window.__afterDefault.push({ defaultPrevented: e.defaultPrevented, scrollY: window.scrollY }), 0);
});
window.addEventListener('scroll', function () { window.__scrollEvents = (window.__scrollEvents || 0) + 1; });
document.addEventListener('DOMContentLoaded', function () { window.__nonce = document.getElementById('nonce').textContent; });
</script></head><body><p id="nonce">NONCE_PLACEHOLDER</p><div id="tall"><div id="marker"></div></div></body></html>`;

const token = crypto.randomBytes(6).toString('hex');
const profile = path.join(scratch, 'profile-' + token);
const home = path.join(scratch, 'home-' + token);
fs.mkdirSync(path.join(home, '.config', 'chromium', 'Crash Reports'), { recursive: true });
const serverLog = [];
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname });
  res.writeHead(u.pathname === '/' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? HTML.replace('NONCE_PLACEHOLDER', 'tabi-r63-probe-' + token) : 'nf');
});
const receipt = { schema: 'tabi-r63-wheel-probe', token, smooth, host: {}, fixture: { sha256: sha256(HTML) }, legs: {}, teardown: {} };
let child = null, ws = null;
const sendFns = {};
try {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(httpPort, '127.0.0.1', resolve); });
  const env = { ...process.env, HOME: home, XDG_CONFIG_HOME: path.join(home, '.config'), TMPDIR: scratch };
  const v = spawnSync('/usr/bin/chromium', ['--version'], { encoding: 'utf8', env, timeout: 15000 });
  receipt.host.chromium = v.stdout.trim();
  const args = ['--headless=new', '--remote-debugging-port=' + devPort, '--remote-debugging-address=127.0.0.1',
    '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage',
    '--disable-extensions', '--window-size=1280,900', 'about:blank'];
  if (!smooth) args.unshift('--disable-smooth-scrolling');
  receipt.host.argv = args;
  child = spawn('/usr/bin/chromium', args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env });
  child.stderr.on('data', () => {});
  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 100 && !page; i++) { try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find((t) => t.type === 'page'); } catch {} if (!page) await sleep(150); }
  if (!page) throw new Error('no page target');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('ws timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(t); resolve(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(t); reject(new Error('ws error')); }, { once: true }); });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.t); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; const t = setTimeout(() => { pending.delete(i); reject(new Error('cdp timeout ' + method)); }, 20000); pending.set(i, { resolve, reject, t }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalV = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:' + httpPort + '/' });
  for (let i = 0; i < 100; i++) { if (await evalV('document.readyState === "complete" && window.__nonce')) break; await sleep(100); }
  receipt.nonceOnPage = await evalV('window.__nonce');
  const settle = async () => { let prev = -1, stable = 0; for (let i = 0; i < 60; i++) { const y = await evalV('window.scrollY'); if (y === prev) stable++; else stable = 0; prev = y; if (stable >= 3) break; await sleep(50); } return prev; };
  receipt.legs.start = { scrollY: await evalV('window.scrollY'), wheellogLen: await evalV('window.__wheellog.length') };
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 200, y: 300, button: 'none', buttons: 0 });
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 300, deltaX: 0, deltaY: 120, button: 'none', buttons: 0 });
  receipt.legs.afterWheelDown = { scrollY: await settle(), wheellog: await evalV('JSON.parse(JSON.stringify(window.__wheellog))'), scrollEvents: await evalV('window.__scrollEvents || 0') };
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 300, deltaX: 0, deltaY: 120, button: 'none', buttons: 0 });
  receipt.legs.afterWheelDown2 = { scrollY: await settle(), wheellogLen: await evalV('window.__wheellog.length') };
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 300, deltaX: 0, deltaY: -120, button: 'none', buttons: 0 });
  receipt.legs.afterWheelUp = { scrollY: await settle(), wheellogLen: await evalV('window.__wheellog.length') };
  await evalV('window.__swallow = true');
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 300, deltaX: 0, deltaY: 120, button: 'none', buttons: 0 });
  receipt.legs.afterSwallowedDown = { scrollY: await settle(), wheellogLen: await evalV('window.__wheellog.length'), lastEntries: await evalV('JSON.parse(JSON.stringify(window.__wheellog.slice(-2)))'), afterDefault: await evalV('JSON.parse(JSON.stringify(window.__afterDefault))') };
  await evalV('window.__swallow = false');
  await sleep(200);
  receipt.legs.final = { scrollY: await evalV('window.scrollY'), wheellogLen: await evalV('window.__wheellog.length'), scrollEvents: await evalV('window.__scrollEvents || 0'), afterDefault: await evalV('JSON.parse(JSON.stringify(window.__afterDefault))') };
} catch (e) {
  receipt.error = e.message;
} finally {
  try { if (ws) ws.close(); } catch {}
  if (child?.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
  await sleep(500);
  const swept = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8' });
  receipt.teardown.survivors = (swept.stdout || '').split('\n').filter((l) => l.includes(token)).length;
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  receipt.teardown.serverClosed = true;
  fs.writeFileSync(out, JSON.stringify(receipt, null, 1));
  console.log(JSON.stringify({ ok: !receipt.error, error: receipt.error || null, start: receipt.legs.start, down: receipt.legs.afterWheelDown?.scrollY, down2: receipt.legs.afterWheelDown2?.scrollY, up: receipt.legs.afterWheelUp?.scrollY, swallowed: receipt.legs.afterSwallowedDown?.scrollY, wheel: receipt.legs.afterWheelDown?.wheellog, last: receipt.legs.afterSwallowedDown?.lastEntries, teardown: receipt.teardown }, null, 1));
  process.exitCode = receipt.error ? 1 : 0;
}
