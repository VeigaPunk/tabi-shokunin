#!/usr/bin/env node
// chrome-cdp-loopback-round44.mjs — tabi round 44, claim C2 runner (coverage
// capability). Drives a real Chromium-class browser (branded Chrome or Edge)
// over raw CDP on THIS Windows host, against a loopback-only fixture, and
// records a nonce-bound evidence receipt.
//
// Scope (declared before the round's review data): this runner demonstrates
// that a fresh CDP session can be launched, driven and torn down on this host
// with invocation-bound page content. It does NOT claim zero egress, and the
// receipt is shape-bound, not authenticity-signed (residual model in
// .ufo/waves/round-44/claims.json; the Chrome-ness of a receipt is re-derived
// by re-running this runner, which is deterministic per invocation through the
// fixture nonce).
//
// Usage:
//   node scripts/chrome-cdp-loopback-round44.mjs --out <receipt.json> --shot <shot.png> --scratch <dir>
//   node scripts/chrome-cdp-loopback-round44.mjs --probe --scratch <dir>   (launch + /json/version only)
//
// Loopback discipline: the fixture server binds 127.0.0.1 only; Chrome's
// DevTools socket binds 127.0.0.1 (verified from the stderr line); the only
// navigated URL is the loopback fixture. A throwaway --user-data-dir is
// mandatory (S001: branded Chrome >=136 ignores remote-debugging switches on
// the default profile dir; S152: unified headless mode; S153: CDP
// Page.captureScreenshot "Capture page screenshot.").
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TITLE = 'tabi r44 cdp loopback fixture';
const MARKER_ID = 'tabi-r44-loopback-marker-7f3a';
const MARKER_TEXT = 'tabi-r44-loopback-marker-7f3a';
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-round44', error: msg }));
  process.exit(2);
}

const argv = process.argv.slice(2);
let out = null, shot = null, scratch = null, probe = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--out') out = argv[++i];
  else if (argv[i] === '--shot') shot = argv[++i];
  else if (argv[i] === '--scratch') scratch = argv[++i];
  else if (argv[i] === '--probe') probe = true;
}
if (!scratch) die('usage: --scratch <dir> required');
if (!probe && (!out || !shot)) die('usage: --out <receipt.json> --shot <shot.png> --scratch <dir> | --probe --scratch <dir>');
fs.mkdirSync(scratch, { recursive: true });

function findBrowser() {
  for (const p of CHROME_CANDIDATES) {
    try { fs.accessSync(p); return p; } catch { }
  }
  die('no Chromium-class browser found in the candidate list');
}

function waitFor(fn, ms, every = 100) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      const v = fn();
      if (v !== null || Date.now() - t0 > ms) { clearInterval(iv); resolve(v); }
    }, every);
  });
}

const browserPath = findBrowser();
const profileDir = path.join(scratch, 'chrome-profile');
fs.rmSync(profileDir, { recursive: true, force: true });
fs.mkdirSync(profileDir, { recursive: true });

// --- loopback fixture server -------------------------------------------------
const fixtureNonce = crypto.randomBytes(32).toString('hex');
let fixtureUrl = null;
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/?')) {
    const body = `<!doctype html><html><head><title>${TITLE}</title>` +
      `<meta name="fixture-nonce" content="${fixtureNonce}"></head>` +
      `<body><h1>${TITLE}</h1><div id="${MARKER_ID}">${MARKER_TEXT}</div></body></html>`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  } else {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});
await new Promise((resolve, reject) => {
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => { fixtureUrl = `http://127.0.0.1:${server.address().port}/`; resolve(); });
});

// --- browser launch ----------------------------------------------------------
const t0Ms = Date.now();
const flags = [
  '--headless=new',
  '--remote-debugging-port=0',
  `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-extensions',
  '--disable-features=Translate,MediaRouter',
  '--metrics-recording-only', '--no-pings', '--password-store=basic',
  '--window-size=800,600',
  'about:blank',
];
const child = spawn(browserPath, flags, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-2000); });

const wsEndpoint = await waitFor(() => {
  const m = stderrTail.match(/DevTools listening on (ws:\/\/(\d+\.\d+\.\d+\.\d+:\d+)\/\S+)/);
  return m ? m[1] : null;
}, 30000);
if (!wsEndpoint) {
  child.kill('SIGKILL');
  server.close();
  die(`no DevTools listening line; stderr tail: ${stderrTail.slice(-300)}`);
}
const wsHost = wsEndpoint.match(/^ws:\/\/([^/]+)\//)[1];
if (!/^127\.0\.0\.1:\d+$/.test(wsHost)) {
  child.kill('SIGKILL'); server.close();
  die(`devtools socket not loopback: ${wsHost}`);
}

async function jsonEndpoint(p, method = 'GET') {
  const res = await fetch(`http://${wsHost}${p}`, { method });
  if (!res.ok) throw new Error(`${p} -> ${res.status}`);
  return res.json();
}

let version = null;
try { version = await jsonEndpoint('/json/version'); } catch (e) { /* fall through */ }
if (!version) {
  child.kill('SIGKILL'); server.close();
  die('could not read /json/version');
}

if (probe) {
  child.kill('SIGKILL');
  server.close();
  console.log(JSON.stringify({
    schema: 'tabi-chrome-cdp-round44-probe', ok: true, browserPath,
    browser: version.Browser, protocolVersion: version['Protocol-Version'],
    wsHost, profileDir, flags,
  }, null, 1));
  setTimeout(() => process.exit(0), 300);
} else {
  // --- open the fixture page and drive it -------------------------------------
  const target = await jsonEndpoint(`/json/new?${encodeURIComponent(fixtureUrl)}`, 'PUT');
  const tDomMs = Date.now();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = (e) => reject(new Error('ws error')); setTimeout(() => reject(new Error('ws open timeout')), 15000); });
  let mid = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  function send(method, params = {}) {
    const id = ++mid;
    return new Promise((resolve, reject) => {
      pending.set(id, (m) => m.error ? reject(new Error(`${method}: ${JSON.stringify(m.error)}`)) : resolve(m.result));
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timeout`)); } }, 15000);
    });
  }
  await send('Runtime.enable');
  await send('Page.enable');
  // wait for the load to settle, then read the live DOM
  let dom = null;
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const rs = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (rs.result.value === 'complete') {
      const ev = await send('Runtime.evaluate', {
        expression: `JSON.stringify({title: document.title, nonce: (document.querySelector('meta[name=fixture-nonce]')||{}).content || null, markerFound: !!document.querySelector('#${MARKER_ID}'), textHead: (document.body.innerText||'').slice(0,200)})`,
        returnByValue: true,
      });
      dom = JSON.parse(ev.result.value);
      break;
    }
  }
  if (!dom) { ws.close(); child.kill('SIGKILL'); server.close(); die('page never reached readyState complete'); }
  const shotB64 = (await send('Page.captureScreenshot', { format: 'png' })).data;
  const tShotMs = Date.now();
  ws.close();
  // --- teardown ----------------------------------------------------------------
  try { await fetch(`http://${wsHost}/json/close/${target.id}`); } catch { }
  child.kill('SIGKILL');
  const exited = await new Promise((resolve) => {
    const t = setTimeout(() => resolve(false), 5000);
    child.on('exit', () => { clearTimeout(t); resolve(true); });
  });
  server.close();
  const shotBuf = Buffer.from(shotB64, 'base64');
  const tEndMs = Date.now();
  const nonce = crypto.randomBytes(32).toString('hex');
  const runnerSha256 = sha256(fs.readFileSync(fileURLToPath(import.meta.url)));
  const ok = dom.title === TITLE && dom.markerFound === true && dom.nonce === fixtureNonce
    && shotBuf.length > 0 && shotBuf[0] === 0x89 && shotBuf[1] === 0x50;
  const receipt = {
    schema: 'tabi-chrome-cdp-round44',
    nonce, runnerSha256,
    browserPath, browser: version.Browser, protocolVersion: version['Protocol-Version'],
    wsHost, fixtureUrl, fixtureNonce,
    flags,
    profileDir,
    dom,
    domFixtureNonce: dom.nonce,
    pageTitle: dom.title,
    markerFound: dom.markerFound,
    invocationBound: dom.nonce === fixtureNonce,
    screenshotSha256: sha256(shotBuf),
    pngByteLength: shotBuf.length,
    chromeTerminated: exited,
    t0Ms, tDomMs, tShotMs, tEndMs,
    hostOs: `${os.type()} ${os.release()}`,
    nodeVersion: process.version,
  };
  receipt.ok = ok && receipt.chromeTerminated === true;
  fs.writeFileSync(shot, shotBuf);
  fs.writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n');
  console.log(JSON.stringify({ ok: receipt.ok, pageTitle: receipt.pageTitle, invocationBound: receipt.invocationBound, screenshotSha256: receipt.screenshotSha256, pngByteLength: receipt.pngByteLength, browser: receipt.browser, wsHost: receipt.wsHost }));
  process.exit(receipt.ok ? 0 : 1);
}
