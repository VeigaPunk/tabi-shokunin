#!/usr/bin/env node
// R99Revenger protocol probe: does anything reach DOM.setFileInputFiles (or the
// injected setInputFiles) on the refused arms? Fixture shape from
// scripts/client-oopif-uploadsets-round99.mjs. Ports 34651,34652,34653 only.
// TMPDIR set before clients load. Run with DEBUG env for protocol logging.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const SCRATCH = '/fast/scratch/hyaku/tabi-r99/R99Revenger';
fs.mkdirSync(path.join(SCRATCH, 't'), { recursive: true });
process.env.TMPDIR = path.join(SCRATCH, 't');

const CHROMIUM = '/usr/bin/chromium';
const HTTP_PORT = 34651, CHILD_PORT = 34652, CDP_PORT = 34653;
const SETTLE_MS = 400, LOAD_WAIT_MS = 800;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const req = createRequire(path.join(SCRATCH, 'deps', 'package.json'));
const puppeteer = req('puppeteer-core');
const pwChromium = req('playwright-core').chromium;

const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
function sweep() {
  let out = '';
  try { out = spawnSync('pgrep', ['-af', SCRATCH], { encoding: 'utf8' }).stdout || ''; } catch {}
  for (const line of out.split('\n')) {
    const m = line.match(/^(\d+)\s/);
    if (m) { const pid = Number(m[1]); if (pid !== process.pid) { try { process.kill(pid, 'SIGKILL'); } catch {} } }
  }
}
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); sweep(); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); sweep(); process.exit(130); });

const FILE_A_NAME = 'tabi-r99-a.txt';
const FILE_A_TEXT = 'tabi round 99 file a.\n'; // 22B
const FILE_B_NAME = 'tabi-r99-b.txt';
const FILE_B_TEXT = 'tabi round 99 file b, second.\n'; // 30B
const P1 = { name: 'tabi-r99-p1.txt', mimeType: 'text/plain', text: 'tabi round 99 payload one.\n' }; // 27B
const P2 = { name: 'tabi-r99-p2.tabi99', text: 'tabi round 99 payload two, untyped.\n' }; // 36B
const BIN_NAME = 'tabi-r99-bytes.png';
const BIN = Buffer.from(Array.from({ length: 256 }, (_, i) => i));

const pathA = path.join(SCRATCH, FILE_A_NAME); fs.writeFileSync(pathA, FILE_A_TEXT);
const pathB = path.join(SCRATCH, FILE_B_NAME); fs.writeFileSync(pathB, FILE_B_TEXT);

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r99 child</title>
<style>#s{position:absolute;left:30px;top:40px;width:160px;height:50px}#m{position:absolute;left:30px;top:140px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><input type="file" id="m" multiple><script>
window.__events = [];
for (const id of ['s', 'm']) for (const t of ['input', 'change', 'click']) document.getElementById(id).addEventListener(t, function (e) { window.__events.push([id, e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r99 parent</title>
<style>#c{position:absolute;left:120px;top:90px;width:500px;height:300px;border:0}#pp{position:absolute;left:700px;top:40px;width:180px;height:20px}</style></head>
<body><input type="file" id="pp"><iframe id="c" src="${childUrl}"></iframe></body></html>`;

let currentChildUrl = null;
const servers = [];
const serve = (port, handler) => new Promise((resolve) => { const s = http.createServer(handler); servers.push(s); s.listen(port, '127.0.0.1', resolve); });
await serve(HTTP_PORT, (q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/parent.html') { r.setHeader('content-type', 'text/html'); r.end(parentHtml(currentChildUrl)); return; }
  r.statusCode = 404; r.end();
});
await serve(CHILD_PORT, (q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/child.html') { r.setHeader('content-type', 'text/html'); r.end(childHtml()); return; }
  r.statusCode = 404; r.end();
});

async function devtoolsVersion() {
  for (let i = 0; i < 100; i++) { try { return await (await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version')).json(); } catch { await sleep(150); } }
  return null;
}
async function freePort(port) {
  return new Promise((resolve, reject) => {
    const s = http.createServer();
    s.on('error', reject);
    s.listen(port, '127.0.0.1', () => s.close(() => resolve()));
  });
}

const ARM = {
  PLBX: { lib: 'playwright', isLocal: false, input: 'bin', target: 's' },
  PLBM: { lib: 'playwright', isLocal: false, input: 'payloads', target: 'm' },
  PLBN: { lib: 'playwright', isLocal: false, input: 'payloads', target: 's' },
  PLLP: { lib: 'playwright', isLocal: true, input: 'paths', target: 'm' },
  PUCM: { lib: 'puppeteer', isLocal: null, input: 'paths', target: 'm' },
  PUCN: { lib: 'puppeteer', isLocal: null, input: 'paths', target: 's' },
};

function callInput(a) {
  if (a.input === 'paths') return [pathA, pathB];
  if (a.input === 'bin') return [{ name: BIN_NAME, buffer: BIN }];
  return [{ name: P1.name, mimeType: P1.mimeType, buffer: Buffer.from(P1.text) }, { name: P2.name, buffer: Buffer.from(P2.text) }];
}

async function runLeg(arm) {
  const legId = arm + '-1';
  const a = ARM[arm];
  const childUrl = 'http://localhost:' + CHILD_PORT + '/child.html?leg=' + legId;
  const parentUrl = 'http://127.0.0.1:' + HTTP_PORT + '/parent.html?leg=' + legId;
  currentChildUrl = childUrl;
  const prof = path.join(SCRATCH, 'leg-' + legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  let proc = null, client = null, page, outcome = null, errName = null, errMessage = null;
  try {
    proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
    liveGroups.add(proc.pid);
    const ver = await devtoolsVersion();
    if (!ver) throw new Error('chromium never came up: devtools endpoint never answered');
    if (a.lib === 'puppeteer') {
      client = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + CDP_PORT });
      page = await client.newPage();
    } else {
      client = a.isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT);
      page = client.contexts()[0].newPage ? await client.contexts()[0].newPage() : null;
      if (!page) page = await client.newPage();
    }
    await page.goto(parentUrl, { waitUntil: 'load' });
    await sleep(LOAD_WAIT_MS);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const input = callInput(a);
    try {
      if (a.lib === 'puppeteer') {
        const h = await frame.$('#' + a.target);
        if (!h) throw new Error('child #' + a.target + ' handle not found');
        await h.uploadFile(...input);
      } else {
        await frame.locator('#' + a.target).setInputFiles(input.length === 1 ? input[0] : input, { timeout: 5000 });
      }
      outcome = 'resolved';
    } catch (e) {
      outcome = 'error';
      errName = e && e.name ? String(e.name) : null;
      errMessage = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
    }
    await sleep(SETTLE_MS);
    const files = await frame.evaluate(() => Object.fromEntries(['s', 'm'].map((id) => [id, Array.from(document.getElementById(id).files, (f) => [f.name, f.size, f.type])])));
    const events = await frame.evaluate(() => window.__events.slice());
    return { leg: legId, arm, outcome, errName, errMessage, files, events };
  } finally {
    try { if (client) { if (a.lib === 'puppeteer') await client.disconnect(); else await client.close(); } } catch {}
    if (proc) killGroup(proc.pid);
    sweep();
    for (let i = 0; i < 25; i++) { try { await freePort(CDP_PORT); break; } catch { await sleep(200); } }
  }
}

const results = {};
for (const arm of ['PLBX', 'PLBM', 'PLBN', 'PLLP', 'PUCM', 'PUCN']) {
  results[arm] = await runLeg(arm);
}
for (const s of servers) s.close();
console.log(JSON.stringify(results, null, 2));
