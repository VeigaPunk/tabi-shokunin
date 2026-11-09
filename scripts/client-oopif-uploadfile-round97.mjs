#!/usr/bin/env node
// Client-library runner: tabi round 97, C1 (coverage capability `client-oopif-uploadfile-linux`).
// Domain: r96 measured that Puppeteer 25.16.0's `page.waitForFileChooser` times out for a cross-site
// iframe's chooser. This runner measures the chooser-free path both production CDP clients offer for a
// file input inside a cross-site (OOPIF) iframe: Puppeteer `ElementHandle.uploadFile` (S237: it sends
// `DOM.setFileInputFiles` on the handle's own session; zero files → a script assignment plus synthetic
// `input`/`change` events) and Playwright `Locator.setInputFiles` (S238: when the browser is not
// "collocated with the server" — the default for `connectOverCDP` — the files are read by the client and
// injected as payloads by page script; with `connectOverCDP(url, {isLocal: true})` the paths go to
// `DOM.setFileInputFiles` on the frame's session). It records which files land, which events the input
// sees and whether each event is trusted.
// Both clients are loaded from a caller-supplied npm install (`--deps`); their versions, lockfile
// integrity, the sha256 of the upload-bearing file and a sha256 over the whole installed package tree are
// recorded raw for the counter to pin.
//
// Legs per rep, in order, each in a fresh chromium (own profile, own process group) that the client
// connects to over its DevTools endpoint; parent http://127.0.0.1:<http>/parent.html?leg=<id> holds one
// file input #pp and one iframe; child http://<host>:<child>/child.html?leg=<id> holds one file input #s
// whose `input`, `change` and `click` listeners record [type, isTrusted]:
//   * PUX: Puppeteer, child `localhost` (cross-site), `(await frame.$('#s')).uploadFile(answer)`;
//   * PUS: as PUX with child `127.0.0.1` (same-site);
//   * PUC: as PUX, then `uploadFile()` with no files (the clear path);
//   * PUM: as PUX with a path that does not exist (`tabi-r97-missing.txt` in the scratch dir);
//   * PLX: Playwright `connectOverCDP(url)`, child `localhost`, `frame.locator('#s').setInputFiles(answer)`;
//   * PLS: as PLX with child `127.0.0.1`;
//   * PLL: as PLX with `connectOverCDP(url, {isLocal: true})`;
//   * PLM: as PLX with the missing path.
// Per leg: the client opens a page, loads the parent, finds the child frame by URL, runs the leg's
// upload call(s) (outcome `resolved`, or `error` with name/message), then the child's #s files and events
// and the parent's #pp files are read. The browser-level `Target.getTargets` iframe list (raw CDP,
// read-only) is taken after load, before the upload.
// The receipt carries raw observations only; its sole producer field is `failures` (legs whose runner
// threw), which the counter cross-checks against the per-leg `error` fields.
//
// Usage (the nonce is read from the environment, never from argv):
//   TABI_R97_NONCE=tabi-r97-... node client-oopif-uploadfile-round97.mjs --lane <ABS lane> --deps <ABS dir>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port N --child-port N --cdp-port N
//     [--reps 3] [--cross-host localhost]
// `--deps` is a directory holding package.json, package-lock.json and node_modules with puppeteer-core
// and playwright-core (e.g. `npm install --prefix <dir> puppeteer-core@25.16.0 playwright-core@1.65.0`).
// Exit 0: every leg completed without a runner error and the receipt was written; 1: a leg recorded a
// runner error (the receipt is still written); 2: usage/setup refusal (no receipt written); 3: a
// chromium never answered its DevTools endpoint (host resource failure; the receipt is still written).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCHEMA = 'tabi-client-oopif-uploadfile-r97';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const LOAD_WAIT_MS = 800;
const SETTLE_MS = 400;
const LAUNCH_FAIL = 'devtools endpoint never answered';
const ANSWER_NAME = 'tabi-r97-answer.txt';
const ANSWER_BYTES = 'tabi round 97 answer.\n'; // 22 bytes
const MISSING_NAME = 'tabi-r97-missing.txt';
const LIBS = { 'puppeteer-core': 'lib/puppeteer/cdp/ElementHandle.js', 'playwright-core': 'lib/coreBundle.js' };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const deps = opt('deps');
const nonce = process.env.TABI_R97_NONCE || null;
const scratch = opt('scratch');
const out = opt('out');
const reps = Number(opt('reps') || '3');
const crossHost = opt('cross-host') || 'localhost';
const intIn = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!deps || !path.isAbsolute(deps)) usage('--deps must be an absolute path');
if (!nonce || !/^tabi-r97-[a-z0-9-]{4,48}$/.test(nonce)) usage('TABI_R97_NONCE must match tabi-r97-[a-z0-9-]{4,48}');
if (!scratch || !path.isAbsolute(scratch)) usage('--scratch must be an absolute path');
if (!out || !path.isAbsolute(out) || !out.endsWith('.json')) usage('--out must be an absolute .json path');
if (!intIn(reps, 1, 10)) usage('--reps must be an integer 1..10');
if (!['localhost', '127.0.0.1'].includes(crossHost)) usage('--cross-host must be localhost or 127.0.0.1');
const ports = ['http-port', 'child-port', 'cdp-port'].map((k) => {
  const v = opt(k);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + k + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + k + ' out of range');
  return n;
});
const [httpPort, childPort, cdpPort] = ports;
if (new Set(ports).size !== 3) usage('ports must differ');

// the whole installed package tree, hashed: sorted "<relative path>\0<sha256>\n" lines over every regular
// file under node_modules/<name> (symlinks recorded by target, not followed)
function treeSha256(dir) {
  const lines = [];
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const p = path.join(d, e.name); const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) walk(p, r);
      else if (e.isSymbolicLink()) lines.push(r + '\0link:' + fs.readlinkSync(p) + '\n');
      else if (e.isFile()) lines.push(r + '\0' + sha256(fs.readFileSync(p)) + '\n');
    }
  };
  walk(dir, '');
  return { files: lines.length, sha256: sha256(lines.sort().join('')) };
}

// the two client libraries, loaded from --deps; their identity is recorded raw
const libs = {};
let req;
try { req = createRequire(path.join(deps, 'package.json')); } catch (e) { usage('--deps: ' + e.message); }
let lock = null;
try { lock = JSON.parse(fs.readFileSync(path.join(deps, 'package-lock.json'), 'utf8')); } catch { lock = null; }
for (const [name, file] of Object.entries(LIBS)) {
  const dir = path.join(deps, 'node_modules', name);
  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')); } catch { usage('--deps has no node_modules/' + name); }
  let fileSha = null;
  try { fileSha = sha256(fs.readFileSync(path.join(dir, file))); } catch { fileSha = null; }
  let tree = null;
  try { tree = treeSha256(dir); } catch { tree = null; }
  const ent = lock && lock.packages && lock.packages['node_modules/' + name];
  libs[name] = { version: pkg.version, integrity: ent ? ent.integrity || null : null, file, fileSha256: fileSha, treeFiles: tree ? tree.files : null, treeSha256: tree ? tree.sha256 : null };
}
let puppeteer, pwChromium;
try {
  const pm = await import(pathToFileURL(req.resolve('puppeteer-core')).href);
  puppeteer = pm.default || pm;
  pwChromium = req('playwright-core').chromium;
} catch (e) { usage('--deps: cannot load clients: ' + e.message); }
if (!puppeteer || typeof puppeteer.connect !== 'function' || !pwChromium || typeof pwChromium.connectOverCDP !== 'function') usage('--deps: client entry points missing');

function freePort(port, host) {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', (e) => { s.close(); reject(new Error('port ' + port + ' busy: ' + e.message)); });
    s.once('listening', () => s.close(resolve));
    s.listen(port, host);
  });
}
try { for (const p of ports) await freePort(p, '127.0.0.1'); } catch (e) { usage('free-port precheck: ' + e.message); }
// Node's recursive mkdir never returns on some unwritable trees (a path under /proc spins forever on Node
// 24.21): the nearest existing ancestor of each target must be a writable directory first.
for (const target of [scratch, path.dirname(out)]) {
  let a = target;
  while (!fs.existsSync(a)) a = path.dirname(a);
  let okDir = false;
  try { okDir = fs.statSync(a).isDirectory(); fs.accessSync(a, fs.constants.W_OK); } catch { okDir = false; }
  if (!okDir) usage('not writable: nearest existing ancestor ' + a + ' of ' + target);
}
try { fs.mkdirSync(scratch, { recursive: true }); fs.mkdirSync(path.dirname(out), { recursive: true }); } catch (e) { usage('scratch/out not creatable: ' + e.message); }

// process-group cleanup: every live chromium group is killed on exit and on signals.
const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); process.exit(130); });

const answerPath = path.join(scratch, ANSWER_NAME);
fs.writeFileSync(answerPath, ANSWER_BYTES);
const missingPath = path.join(scratch, MISSING_NAME);
fs.rmSync(missingPath, { force: true });

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r97 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><script>
window.__events = [];
for (const t of ['input', 'change', 'click']) document.getElementById('s').addEventListener(t, function (e) { window.__events.push([e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r97 parent</title>
<style>html,body{margin:0;background:#fff}#c{position:absolute;left:120px;top:90px;width:500px;height:300px;border:0}#pp{position:absolute;left:700px;top:40px;width:180px;height:20px}</style></head>
<body><input type="file" id="pp"><iframe id="c" src="${childUrl}"></iframe></body></html>`;

let currentChildUrl = null;
const servers = [];
const serve = (port, handler) => new Promise((resolve) => { const s = http.createServer(handler); servers.push(s); s.listen(port, '127.0.0.1', resolve); });
await serve(httpPort, (q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/parent.html') { r.setHeader('content-type', 'text/html'); r.end(parentHtml(currentChildUrl)); return; }
  r.statusCode = 404; r.end();
});
await serve(childPort, (q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/child.html') { r.setHeader('content-type', 'text/html'); r.end(childHtml()); return; }
  r.statusCode = 404; r.end();
});

const chromiumVersion = (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim();

// a minimal raw CDP browser connection (read-only target listing)
async function rawBrowser(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('raw ws error')); });
  let id = 0; const pend = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const must = async (method, params) => { const r = await send(method, params); if (r.error) throw new Error(method + ': ' + JSON.stringify(r.error)); return r.result; };
  return { must, close: () => { try { ws.close(); } catch {} } };
}

const ARM = {
  PUX: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload' },
  PUS: { lib: 'puppeteer', cross: false, isLocal: null, call: 'upload' },
  PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear' },
  PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing' },
  PLX: { lib: 'playwright', cross: true, isLocal: false, call: 'upload' },
  PLS: { lib: 'playwright', cross: false, isLocal: false, call: 'upload' },
  PLL: { lib: 'playwright', cross: true, isLocal: true, call: 'upload' },
  PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing' },
};

let launchFailures = 0;
async function runLeg(arm, rep) {
  const legId = arm + '-' + rep;
  const a = ARM[arm];
  const childHost = a.cross ? crossHost : '127.0.0.1';
  const childUrl = 'http://' + childHost + ':' + childPort + '/child.html?leg=' + legId;
  const parentUrl = 'http://127.0.0.1:' + httpPort + '/parent.html?leg=' + legId;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, 'leg-' + legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const leg = { leg: legId, arm, rep, lib: a.lib, cross: a.cross, isLocal: a.isLocal, call: a.call, childHost, childUrl, parentUrl, browserVersion: null, browserId: null, clientBrowserVersion: null, iframeTargets: null, frames: null, outcome: null, errName: null, errMessage: null, childFiles: null, childEvents: null, parentFiles: null, error: null };
  const proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + cdpPort, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
  liveGroups.add(proc.pid);
  let raw = null, client = null;
  try {
    let ver = null;
    // up to 15 s: under host load (load1 ~30) a 6 s window missed 2 of 24 launches in the pre-freeze probe
    for (let i = 0; i < 100 && !ver; i++) { try { ver = await (await fetch('http://127.0.0.1:' + cdpPort + '/json/version')).json(); } catch { await sleep(150); } }
    if (!ver) { launchFailures++; throw new Error(LAUNCH_FAIL); }
    leg.browserVersion = ver.Browser;
    leg.browserId = String(ver.webSocketDebuggerUrl || '').split('/').pop() || null;
    raw = await rawBrowser(ver.webSocketDebuggerUrl);
    let page;
    if (a.lib === 'puppeteer') {
      client = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + cdpPort });
      leg.clientBrowserVersion = await client.version();
      page = await client.newPage();
    } else {
      client = a.isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + cdpPort, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + cdpPort);
      leg.clientBrowserVersion = client.version();
      page = await client.contexts()[0].newPage();
    }
    await page.goto(parentUrl, { waitUntil: 'load' });
    await sleep(LOAD_WAIT_MS);
    leg.frames = page.frames().map((f) => f.url());
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    leg.iframeTargets = (await raw.must('Target.getTargets')).targetInfos.filter((x) => x.type === 'iframe').map((x) => ({ targetId: x.targetId, url: x.url }));
    const file = a.call === 'missing' ? missingPath : answerPath;
    try {
      if (a.lib === 'puppeteer') {
        const h = await frame.$('#s');
        if (!h) throw new Error('child #s handle not found');
        await h.uploadFile(file);
        if (a.call === 'upload-then-clear') await h.uploadFile();
      } else {
        await frame.locator('#s').setInputFiles(file, { timeout: 5000 });
      }
      leg.outcome = 'resolved';
    } catch (e) {
      leg.outcome = 'error';
      leg.errName = e && e.name ? String(e.name) : null;
      leg.errMessage = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
    }
    await sleep(SETTLE_MS);
    leg.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size]));
    leg.childEvents = await frame.evaluate(() => window.__events);
    leg.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
  } catch (e) {
    leg.error = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
  } finally {
    try { if (client) { if (a.lib === 'puppeteer') await client.disconnect(); else await client.close(); } } catch {}
    if (raw) raw.close();
    killGroup(proc.pid);
    // the next leg reuses the DevTools port: wait (up to 5 s) until the killed browser has released it
    for (let i = 0; i < 25; i++) { try { await freePort(cdpPort, '127.0.0.1'); break; } catch { await sleep(200); } }
  }
  return leg;
}

const arms = Object.keys(ARM);
const legs = [];
for (let rep = 1; rep <= reps; rep++) for (const arm of arms) legs.push(await runLeg(arm, rep));
for (const s of servers) s.close();
const receipt = {
  schema: SCHEMA,
  nonce,
  driverSha256: sha256(fs.readFileSync(SELF)),
  chromium: chromiumVersion,
  crossHost,
  reps,
  libs,
  answer: { name: ANSWER_NAME, size: Buffer.byteLength(ANSWER_BYTES) },
  missingPath,
  missingExists: fs.existsSync(missingPath),
  ports: { http: httpPort, child: childPort, cdp: cdpPort },
  generatedAt: new Date().toISOString(),
  legs,
  failures: legs.filter((l) => l.error).map((l) => ({ leg: l.leg, error: l.error })),
};
fs.writeFileSync(out, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ out, legs: legs.length, failures: receipt.failures.length, launchFailures }));
process.exit(launchFailures ? 3 : receipt.failures.length ? 1 : 0);
