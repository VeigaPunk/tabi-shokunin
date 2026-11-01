#!/usr/bin/env node
// chrome-cdp-loopback-round45.mjs — tabi round 45, claim C2 runner (coverage:
// a second declared Chromium-class surface on this host, Edge, through the same
// candidate chain as round 44's Chrome run). Drives a real Chromium-class
// browser over raw CDP on THIS Windows host against a loopback-only fixture,
// and records a nonce-bound evidence receipt.
//
// Scope (declared before the round's review data): this runner demonstrates
// that a fresh CDP session can be launched, driven and torn down on this host
// with invocation-bound page content, on the surface the invoker declares. It
// does NOT claim zero egress, and the receipt is shape-bound, not
// authenticity-signed (same residual model as round 44: the browser-ness of a
// receipt is re-derived by re-running this runner, whose fixture nonce differs
// per invocation).
//
// Usage:
//   node scripts/chrome-cdp-loopback-round45.mjs --browser chrome|edge --out <receipt.json> --shot <shot.png> --scratch <dir>
//   node scripts/chrome-cdp-loopback-round45.mjs --browser chrome|edge --probe --scratch <dir>   (launch + /json/version only)
//
// Loopback discipline (unchanged from r44): the fixture server binds 127.0.0.1
// only; the DevTools socket binds 127.0.0.1 (verified from the stderr line);
// the only navigated URL is the loopback fixture. A throwaway --user-data-dir
// is mandatory (S001: branded Chromium >=136 ignores remote-debugging switches
// on the default profile dir; S152: unified headless mode; S153:
// Page.captureScreenshot; S154: Edge documents the Chrome DevTools Protocol
// for the branded Microsoft Edge surface).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TITLE = 'tabi r45 cdp loopback fixture';
const MARKER_ID = 'tabi-r45-loopback-marker-9c4d';
const MARKER_TEXT = 'tabi-r45-loopback-marker-9c4d';
const SURFACES = {
  chrome: {
    candidates: [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    ],
    profileDirName: 'chrome-profile',
  },
  edge: {
    candidates: [
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ],
    profileDirName: 'edge-profile',
  },
};

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-round45', error: msg }));
  process.exit(2);
}

const argv = process.argv.slice(2);
let out = null, shot = null, scratch = null, probe = false, surface = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--out') out = argv[++i];
  else if (argv[i] === '--shot') shot = argv[++i];
  else if (argv[i] === '--scratch') scratch = argv[++i];
  else if (argv[i] === '--probe') probe = true;
  else if (argv[i] === '--browser') surface = argv[++i];
}
if (surface !== 'chrome' && surface !== 'edge') die('usage: --browser chrome|edge required');
if (!scratch) die('usage: --scratch <dir> required');
if (!probe && (!out || !shot)) die('usage: --out <receipt.json> --shot <shot.png> --scratch <dir> | --probe --scratch <dir>');
fs.mkdirSync(scratch, { recursive: true });

function findBrowser() {
  for (const p of SURFACES[surface].candidates) {
    try { fs.accessSync(p); return p; } catch { }
  }
  die(`no ${surface} browser found in the declared candidate list`);
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
const profileDir = path.join(scratch, SURFACES[surface].profileDirName);
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
let childExit = null;
child.on('exit', (code, sig) => { childExit = { code, sig }; });
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-2000); });

// Discovery, two legs, both bound to 127.0.0.1 before use:
//   1. the stderr "DevTools listening on ws://..." line (branded Chrome prints it);
//   2. the DevToolsActivePort file in the throwaway profile (Edge on this host
//      prints no stderr line; the file carries the ephemeral port + browser path).
// Leg 2 is accepted only together with a successful /json/version read below, so
// a stale or coincidental file cannot stand in for a live socket.
let wsHost = null, discoveryVia = null, devtoolsBrowserPath = null;
const wsEndpoint = await waitFor(() => {
  const m = stderrTail.match(/DevTools listening on (ws:\/\/(\d+\.\d+\.\d+\.\d+:\d+)\/\S+)/);
  return m ? m[1] : null;
}, 8000);
if (wsEndpoint) {
  wsHost = wsEndpoint.match(/^ws:\/\/([^/]+)\//)[1];
  discoveryVia = 'stderr';
}
if (!wsHost) {
  const found = await waitFor(() => {
    try {
      const raw = fs.readFileSync(path.join(profileDir, 'DevToolsActivePort'), 'utf8');
      const nl = raw.indexOf('\n');
      const portLine = (nl === -1 ? raw : raw.slice(0, nl)).trim();
      const bpLine = (nl === -1 ? '' : raw.slice(nl + 1).split(/\r?\n/)[0].trim());
      if (/^\d+$/.test(portLine)) return { port: Number(portLine), bp: bpLine };
    } catch { }
    return null;
  }, 22000);
  if (found) {
    wsHost = `127.0.0.1:${found.port}`;
    devtoolsBrowserPath = found.bp || null;
    discoveryVia = 'devtools-active-port';
  }
}
if (!wsHost) {
  child.kill('SIGKILL');
  server.close();
  die(`no DevTools endpoint discovered (stderr tail: ${stderrTail.slice(-200)}; no DevToolsActivePort file)`);
}
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
    schema: 'tabi-chrome-cdp-round45-probe', ok: true, declaredSurface: surface,
    browserPath, browser: version.Browser, protocolVersion: version['Protocol-Version'],
    wsHost, discoveryVia, devtoolsBrowserPath, profileDir, flags,
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
  // Windows belt-and-suspenders: kill the process tree by pid (no-op if the
  // exit event already fired and the tree is gone).
  try {
    const { spawnSync } = await import('node:child_process');
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
  } catch { }
  const exited = await new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (childExit !== null) { clearInterval(iv); resolve(true); }
      else if (Date.now() - t0 > 5000) { clearInterval(iv); resolve(false); }
    }, 100);
  });
  server.close();
  const shotBuf = Buffer.from(shotB64, 'base64');
  const tEndMs = Date.now();
  const nonce = crypto.randomBytes(32).toString('hex');
  const runnerSha256 = sha256(fs.readFileSync(fileURLToPath(import.meta.url)));
  const ok = dom.title === TITLE && dom.markerFound === true && dom.nonce === fixtureNonce
    && shotBuf.length > 0 && shotBuf[0] === 0x89 && shotBuf[1] === 0x50;
  const receipt = {
    schema: 'tabi-chrome-cdp-round45',
    declaredSurface: surface,
    nonce, runnerSha256,
    browserPath, browser: version.Browser, protocolVersion: version['Protocol-Version'],
    wsHost, discoveryVia, devtoolsBrowserPath, fixtureUrl, fixtureNonce,
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
    childExit,
    t0Ms, tDomMs, tShotMs, tEndMs,
    hostOs: `${os.type()} ${os.release()}`,
    nodeVersion: process.version,
  };
  receipt.ok = ok && receipt.chromeTerminated === true;
  fs.writeFileSync(shot, shotBuf);
  fs.writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n');
  console.log(JSON.stringify({ ok: receipt.ok, declaredSurface: receipt.declaredSurface, pageTitle: receipt.pageTitle, invocationBound: receipt.invocationBound, screenshotSha256: receipt.screenshotSha256, pngByteLength: receipt.pngByteLength, browser: receipt.browser, wsHost: receipt.wsHost }));
  process.exit(receipt.ok ? 0 : 1);
}
