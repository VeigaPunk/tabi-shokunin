#!/usr/bin/env node
// Client-library runner: tabi round 98, C1 (coverage capability `client-oopif-uploadmodes-linux`).
// Domain: r97 measured each client's direct-set upload into a file input inside a cross-site (OOPIF)
// iframe with paths only, with the browser started by the runner and the clients attached over CDP. Its
// declared limits 2, 4 and 5 left unmeasured: browsers launched BY the client, Playwright payload objects
// (`{name, mimeType, buffer}`), a Playwright `isLocal` call with an absent path, the files' contents and
// types, and what reading Puppeteer's phantom entry does. This runner measures those. Mechanism, per the
// sources: Playwright `ElementHandle._setInputFiles` (S240, dom.ts v1.65.0) sends local paths to
// `setInputFilePaths` (the DOM.setFileInputFiles path) and everything else (payloads) through the injected
// script `setInputFiles`; `prepareFilesForUpload` (S238) turns paths into payloads only when the browser is
// not collocated with the server, which `chromium.launch` browsers are. Puppeteer's launcher (S242,
// ChromeLauncher.ts v25.16.0) passes `--headless=new` for `headless: true` and keeps a caller-supplied
// `--remote-debugging-*` argument. Blink names the error a read of a vanished file rejects with (S241,
// file_error.cc at tag 155.0.8059.84).
// Both clients are loaded from a caller-supplied npm install (`--deps`); their versions, lockfile
// integrity, the sha256 of the upload-bearing file and a sha256 over the installed package directory are
// recorded raw for the counter to pin (same definition as r97 A1 item 4).
//
// Legs per rep, in order, each in its own fresh chromium (own profile): the parent
// http://127.0.0.1:<http>/parent.html?leg=<id> holds one file input #pp and one iframe; the child
// http://localhost:<child>/child.html?leg=<id> (cross-site on every leg) holds one file input #s whose
// `input`, `change` and `click` listeners record [type, isTrusted]:
//   * PUA:  Puppeteer `launch({executablePath: /usr/bin/chromium, headless: true})`, `uploadFile(answer)`;
//   * PLA:  Playwright `chromium.launch({executablePath: /usr/bin/chromium, headless: true})`,
//           `setInputFiles(answer path)`;
//   * PLAB: as PLA with a payload object {name: tabi-r98-payload.txt, mimeType: text/plain, buffer};
//   * PLB:  Playwright `connectOverCDP(url)` (runner-started browser), the payload object;
//   * PLLB: Playwright `connectOverCDP(url, {isLocal: true})`, the payload object;
//   * PLL:  as PLLB with the answer path (the r97 trusted arm, here as the in-receipt contrast);
//   * PLLM: as PLL with a path that does not exist (`tabi-r98-missing.txt` in the scratch dir);
//   * PUR:  Puppeteer `connect({browserURL})`, `uploadFile(<missing path>)`, then the entry is read.
// Launch legs pass `--remote-debugging-port=<cdp>` to the client's launch so the runner can read the
// browser's DevTools `/json/version` and list targets the same way as on the attached legs.
// Per leg: the client opens a page, loads the parent, finds the child frame by URL, runs the leg's call
// (outcome `resolved`, or `error` with name/message), then reads the child's #s files as [name, size,
// type], the events #s recorded, the text of #s.files[0] when there is exactly one file (`['ok', text]` or
// `['err', name, message]`; `null` otherwise), and the parent's #pp files. The browser-level
// `Target.getTargets` iframe list (raw CDP, read-only) is taken after load, before the call.
// The receipt carries raw observations only; its sole producer field is `failures` (legs whose runner
// threw), which the counter cross-checks against the per-leg `error` fields.
//
// Usage (the nonce is read from the environment, never from argv):
//   TABI_R98_NONCE=tabi-r98-... node client-oopif-uploadmodes-round98.mjs --lane <ABS lane> --deps <ABS dir>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port N --child-port N --cdp-port N [--reps 3]
// `--deps` is a directory holding package.json, package-lock.json and node_modules with puppeteer-core
// and playwright-core (e.g. `npm install --prefix <dir> puppeteer-core@25.16.0 playwright-core@1.65.0`).
// TMPDIR is set to <scratch>/t for the run, so Playwright's launch profile lives under the scratch dir.
// Exit 0: every leg completed without a runner error and the receipt was written; 1: a leg recorded a
// runner error (the receipt is still written); 2: usage/setup refusal (no receipt written); 3: a
// chromium never came up (endpoint never answered, or the client's launch threw; host resource failure;
// the receipt is still written).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCHEMA = 'tabi-client-oopif-uploadmodes-r98';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const LOAD_WAIT_MS = 800;
const SETTLE_MS = 400;
const LAUNCH_FAIL = 'chromium never came up';
const ANSWER_NAME = 'tabi-r98-answer.txt';
const ANSWER_BYTES = 'tabi round 98 answer.\n'; // 22 bytes
const PAYLOAD_NAME = 'tabi-r98-payload.txt';
const PAYLOAD_BYTES = 'tabi round 98 payload bytes.\n'; // 29 bytes
const PAYLOAD_MIME = 'text/plain';
const MISSING_NAME = 'tabi-r98-missing.txt';
const LIBS = { 'puppeteer-core': 'lib/puppeteer/cdp/ElementHandle.js', 'playwright-core': 'lib/coreBundle.js' };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const deps = opt('deps');
const nonce = process.env.TABI_R98_NONCE || null;
const scratch = opt('scratch');
const out = opt('out');
const reps = Number(opt('reps') || '3');
const intIn = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!deps || !path.isAbsolute(deps)) usage('--deps must be an absolute path');
if (!nonce || !/^tabi-r98-[a-z0-9-]{4,48}$/.test(nonce)) usage('TABI_R98_NONCE must match tabi-r98-[a-z0-9-]{4,48}');
if (!scratch || !path.isAbsolute(scratch)) usage('--scratch must be an absolute path');
if (!out || !path.isAbsolute(out) || !out.endsWith('.json')) usage('--out must be an absolute .json path');
if (!intIn(reps, 1, 10)) usage('--reps must be an integer 1..10');
const ports = ['http-port', 'child-port', 'cdp-port'].map((k) => {
  const v = opt(k);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + k + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + k + ' out of range');
  return n;
});
const [httpPort, childPort, cdpPort] = ports;
if (new Set(ports).size !== 3) usage('ports must differ');

// the installed package directory, hashed: sorted "<relative path>\0<sha256>\n" lines over every regular
// file under node_modules/<name>, plus "<relative path>\0link:<target>\n" per symlink (not followed)
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
if (!puppeteer || typeof puppeteer.connect !== 'function' || typeof puppeteer.launch !== 'function' || !pwChromium || typeof pwChromium.connectOverCDP !== 'function' || typeof pwChromium.launch !== 'function') usage('--deps: client entry points missing');

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
const tmpDir = path.join(scratch, 't');
try { fs.mkdirSync(tmpDir, { recursive: true }); fs.mkdirSync(path.dirname(out), { recursive: true }); } catch (e) { usage('scratch/out not creatable: ' + e.message); }
process.env.TMPDIR = tmpDir;

// cleanup: every runner-spawned chromium group is killed, and every chromium whose profile lies under the
// scratch dir (client-launched ones included) is swept, on exit and on signals.
const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
const sweep = () => {
  let n = 0;
  for (const pid of fs.readdirSync('/proc').filter((d) => /^[0-9]+$/.test(d))) {
    let cmd = '';
    try { cmd = fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8'); } catch { continue; }
    if (cmd.includes('--user-data-dir=' + scratch + '/')) { try { process.kill(Number(pid), 'SIGKILL'); n++; } catch {} }
  }
  return n;
};
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); sweep(); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); sweep(); process.exit(130); });

const answerPath = path.join(scratch, ANSWER_NAME);
fs.writeFileSync(answerPath, ANSWER_BYTES);
const missingPath = path.join(scratch, MISSING_NAME);
fs.rmSync(missingPath, { force: true });

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r98 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><script>
window.__events = [];
for (const t of ['input', 'change', 'click']) document.getElementById('s').addEventListener(t, function (e) { window.__events.push([e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r98 parent</title>
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

// mode: `launch` = the client starts chromium; `connect` = the runner starts chromium and the client
// attaches (Puppeteer connect, Playwright connectOverCDP with or without isLocal).
// input: `path` (answer file path), `payload` (Playwright payload object), `missing` (absent path).
const ARM = {
  PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path' },
  PLA: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'path' },
  PLAB: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'payload' },
  PLB: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payload' },
  PLLB: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'payload' },
  PLL: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'path' },
  PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing' },
  PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing' },
};
const BASE_ARGS = ['--no-first-run', '--no-default-browser-check', '--window-size=1280,900'];

async function devtoolsVersion() {
  // up to 15 s: under host load (load1 ~30) a 6 s window missed 2 of 24 launches in the r97 pre-freeze probe
  for (let i = 0; i < 100; i++) { try { return await (await fetch('http://127.0.0.1:' + cdpPort + '/json/version')).json(); } catch { await sleep(150); } }
  return null;
}

let launchFailures = 0;
async function runLeg(arm, rep) {
  const legId = arm + '-' + rep;
  const a = ARM[arm];
  const childUrl = 'http://localhost:' + childPort + '/child.html?leg=' + legId;
  const parentUrl = 'http://127.0.0.1:' + httpPort + '/parent.html?leg=' + legId;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, 'leg-' + legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const leg = { leg: legId, arm, rep, lib: a.lib, mode: a.mode, isLocal: a.isLocal, input: a.input, childUrl, parentUrl, browserVersion: null, browserId: null, clientBrowserVersion: null, iframeTargets: null, frames: null, outcome: null, errName: null, errMessage: null, childFiles: null, childEvents: null, childRead: null, parentFiles: null, error: null };
  let proc = null, raw = null, client = null;
  try {
    let page;
    if (a.mode === 'launch') {
      const args = ['--remote-debugging-port=' + cdpPort, ...BASE_ARGS];
      try {
        if (a.lib === 'puppeteer') client = await puppeteer.launch({ executablePath: CHROMIUM, headless: true, userDataDir: prof, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
        else client = await pwChromium.launch({ executablePath: CHROMIUM, headless: true, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
      } catch (e) { launchFailures++; throw new Error(LAUNCH_FAIL + ': ' + String(e && e.message ? e.message : e).split('\n')[0]); }
    } else {
      proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + cdpPort, '--user-data-dir=' + prof, ...BASE_ARGS, 'about:blank'], { stdio: 'ignore', detached: true });
      liveGroups.add(proc.pid);
    }
    const ver = await devtoolsVersion();
    if (!ver) { launchFailures++; throw new Error(LAUNCH_FAIL + ': devtools endpoint never answered'); }
    leg.browserVersion = ver.Browser;
    leg.browserId = String(ver.webSocketDebuggerUrl || '').split('/').pop() || null;
    raw = await rawBrowser(ver.webSocketDebuggerUrl);
    if (a.lib === 'puppeteer') {
      if (a.mode === 'connect') client = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + cdpPort });
      leg.clientBrowserVersion = await client.version();
      page = await client.newPage();
    } else {
      if (a.mode === 'connect') client = a.isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + cdpPort, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + cdpPort);
      leg.clientBrowserVersion = client.version();
      const ctx = a.mode === 'launch' ? await client.newContext() : client.contexts()[0];
      page = await ctx.newPage();
    }
    await page.goto(parentUrl, { waitUntil: 'load' });
    await sleep(LOAD_WAIT_MS);
    leg.frames = page.frames().map((f) => f.url());
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    leg.iframeTargets = (await raw.must('Target.getTargets')).targetInfos.filter((x) => x.type === 'iframe').map((x) => ({ targetId: x.targetId, url: x.url }));
    const input = a.input === 'payload' ? { name: PAYLOAD_NAME, mimeType: PAYLOAD_MIME, buffer: Buffer.from(PAYLOAD_BYTES) } : a.input === 'missing' ? missingPath : answerPath;
    try {
      if (a.lib === 'puppeteer') {
        const h = await frame.$('#s');
        if (!h) throw new Error('child #s handle not found');
        await h.uploadFile(input);
      } else {
        await frame.locator('#s').setInputFiles(input, { timeout: 5000 });
      }
      leg.outcome = 'resolved';
    } catch (e) {
      leg.outcome = 'error';
      leg.errName = e && e.name ? String(e.name) : null;
      leg.errMessage = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
    }
    await sleep(SETTLE_MS);
    leg.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size, f.type]));
    leg.childEvents = await frame.evaluate(() => window.__events.slice());
    leg.childRead = await frame.evaluate(async () => {
      const fl = document.getElementById('s').files;
      if (fl.length !== 1) return null;
      try { return ['ok', await fl[0].text()]; } catch (e) { return ['err', String(e && e.name), String(e && e.message)]; }
    });
    leg.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size, f.type]));
  } catch (e) {
    leg.error = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
  } finally {
    try { if (client) { if (a.mode === 'connect' && a.lib === 'puppeteer') await client.disconnect(); else await client.close(); } } catch {}
    if (raw) raw.close();
    if (proc) killGroup(proc.pid);
    sweep();
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
  reps,
  libs,
  answer: { name: ANSWER_NAME, size: Buffer.byteLength(ANSWER_BYTES), text: ANSWER_BYTES },
  payload: { name: PAYLOAD_NAME, size: Buffer.byteLength(PAYLOAD_BYTES), mimeType: PAYLOAD_MIME, text: PAYLOAD_BYTES },
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
