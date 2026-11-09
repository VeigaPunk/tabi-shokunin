#!/usr/bin/env node
// R100Exec3 ad-hoc probe of declared limit 4 (plans/round-100.md) — leads for r101, not counted legs.
// Fixture shape copied from scripts/client-oopif-uploadsets-round100.mjs: parent page (file input #pp +
// one iframe) whose cross-site child (localhost under 127.0.0.1) holds #s (no multiple), #m (multiple),
// #d (webkitdirectory), with input/change/click listeners recording [inputId, type, isTrusted].
// 3 reps each, each leg in its own browser. Ports 34131 (http), 34132 (child), 34133 (cdp).
// TMPDIR is set to <scratch>/t BEFORE either client module is loaded.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const SHOKUNIN = '/home/vgpnk/Projects/shokunin';
const LANE = SHOKUNIN + '/tabi-shokunin';
const SCRATCH = '/fast/scratch/hyaku/tabi-r100/R100Exec3';
const DEPS = SCRATCH + '/deps';
const HTTP_PORT = 34131, CHILD_PORT = 34132, CDP_PORT = 34133;
const CHROMIUM = '/usr/bin/chromium';
const REPS = 3;
const LOAD_WAIT_MS = 800, SETTLE_MS = 400;

// r98 D2: set before either client is loaded
process.env.TMPDIR = path.join(SCRATCH, 't');
fs.mkdirSync(process.env.TMPDIR, { recursive: true });

const req = createRequire(path.join(DEPS, 'package.json'));
let puppeteer, pwChromium;
try {
  puppeteer = req('puppeteer-core');
  pwChromium = req('playwright-core').chromium;
} catch (e) { console.error('load clients: ' + e.message); process.exit(2); }

// --- fixtures on disk (under scratch) ---
fs.mkdirSync(path.join(SCRATCH, 'dupdir1'), { recursive: true });
fs.mkdirSync(path.join(SCRATCH, 'dupdir2'), { recursive: true });
fs.writeFileSync(path.join(SCRATCH, 'dupdir1', 'dup.txt'), 'first dup path file\n');   // 20 bytes
fs.writeFileSync(path.join(SCRATCH, 'dupdir2', 'dup.txt'), 'second dup path file longer\n'); // 28 bytes
fs.writeFileSync(path.join(SCRATCH, 'empty-path.txt'), ''); // 0 bytes
fs.writeFileSync(path.join(SCRATCH, 'tabi-r100-a.txt'), 'tabi round 100 file a.\n');  // 23 bytes
const DIR_PATH = path.join(SCRATCH, 'probe-dir');
fs.mkdirSync(path.join(DIR_PATH, 'sub'), { recursive: true });
fs.writeFileSync(path.join(DIR_PATH, 'one.txt'), 'dir file one\n');
fs.writeFileSync(path.join(DIR_PATH, 'sub', 'two.txt'), 'dir file two\n');
const BIN = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
console.log('fixtures: dup1=%d dup2=%d empty=0 a=%d bin=256 dir=probe-dir',
  fs.statSync(path.join(SCRATCH,'dupdir1','dup.txt')).size,
  fs.statSync(path.join(SCRATCH,'dupdir2','dup.txt')).size,
  fs.statSync(path.join(SCRATCH,'tabi-r100-a.txt')).size);

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r100 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}#m{position:absolute;left:30px;top:140px;width:160px;height:50px}#d{position:absolute;left:30px;top:240px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><input type="file" id="m" multiple><input type="file" id="d" webkitdirectory><script>
window.__events = [];
for (const id of ['s', 'm', 'd']) for (const t of ['input', 'change', 'click']) document.getElementById(id).addEventListener(t, function (e) { window.__events.push([id, e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r100 parent</title>
<style>html,body{margin:0;background:#fff}#c{position:absolute;left:120px;top:90px;width:500px;height:300px;border:0}#pp{position:absolute;left:700px;top:40px;width:180px;height:20px}</style></head>
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
console.log('chromium: ' + (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
const sweep = () => {
  try {
    const out = spawnSync('pgrep', ['-f', 'remote-debugging-port=' + CDP_PORT], { encoding: 'utf8' }).stdout || '';
    for (const line of out.trim().split('\n')) { const p = Number(line); if (p && p !== process.pid) { try { process.kill(p, 'SIGKILL'); } catch {} } }
  } catch {}
};
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); sweep(); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); sweep(); process.exit(130); });

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

// Arms: each returns { isLocal, target, input } for Playwright connectOverCDP.
// (a) duplicate path basenames; (b1) 0-byte path on #m; (b2) 0-byte path on #s;
// (c) four payloads; (d) 256-byte binary + text()/slice() reads; (e1) file path on #d;
// (e2) directory path on #m; (f) [dirPath, filePath] on #m.
const P = (n) => path.join(SCRATCH, n);
const ARM = {
  A_DUPPATH: { isLocal: true, target: 'm', input: () => [P('dupdir1/dup.txt'), P('dupdir2/dup.txt')], extra: null },
  B1_EMPTY_M: { isLocal: true, target: 'm', input: () => [P('empty-path.txt')], extra: null },
  B2_EMPTY_S: { isLocal: true, target: 's', input: () => [P('empty-path.txt')], extra: null },
  C_FOUR: { isLocal: false, target: 'm', input: () => [
    { name: 'f1.txt', mimeType: 'text/plain', buffer: Buffer.from('four file one\n') },
    { name: 'f2.txt', mimeType: 'text/plain', buffer: Buffer.from('four file two\n') },
    { name: 'f3.txt', mimeType: 'text/plain', buffer: Buffer.from('four file three\n') },
    { name: 'f4.txt', mimeType: 'text/plain', buffer: Buffer.from('four file four\n') },
  ], extra: null },
  D_BINREADS: { isLocal: false, target: 'm', input: () => [
    { name: 'tabi-r100-bytes.png', mimeType: 'image/png', buffer: BIN },
  ], extra: 'binreads' },
  E1_FILE_ON_D: { isLocal: true, target: 'd', input: () => [P('tabi-r100-a.txt')], extra: null },
  E2_DIR_ON_M: { isLocal: true, target: 'm', input: () => [DIR_PATH], extra: null },
  F_DIR_FILE: { isLocal: true, target: 'm', input: () => [DIR_PATH, P('tabi-r100-a.txt')], extra: null },
};
const BASE_ARGS = ['--no-first-run', '--no-default-browser-check', '--window-size=1280,900'];

const legs = [];
for (let rep = 1; rep <= REPS; rep++) {
  for (const [arm, a] of Object.entries(ARM)) {
    const legId = arm + '-' + rep;
    const childUrl = 'http://localhost:' + CHILD_PORT + '/child.html?leg=' + legId;
    const parentUrl = 'http://127.0.0.1:' + HTTP_PORT + '/parent.html?leg=' + legId;
    currentChildUrl = childUrl;
    const prof = path.join(SCRATCH, 'probe-' + legId, 'profile');
    fs.mkdirSync(prof, { recursive: true });
    const leg = { leg: legId, arm, rep, isLocal: a.isLocal, target: a.target, browserVersion: null, outcome: null, errName: null, errMessage: null, files: null, events: null, reads: null, extra: null, error: null };
    let proc = null, client = null;
    try {
      proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + prof, ...BASE_ARGS, 'about:blank'], { stdio: 'ignore', detached: true });
      liveGroups.add(proc.pid);
      const ver = await devtoolsVersion();
      if (!ver) throw new Error('chromium never came up');
      leg.browserVersion = ver.Browser;
      client = a.isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT);
      const page = client.contexts()[0].pages()[0] || await client.contexts()[0].newPage();
      await page.goto(parentUrl, { waitUntil: 'load' });
      await sleep(LOAD_WAIT_MS);
      const frame = page.frames().find((f) => f.url() === childUrl);
      if (!frame) throw new Error('child frame not found');
      const input = a.input();
      try {
        await frame.locator('#' + a.target).setInputFiles(input.length === 1 ? input[0] : input, { timeout: 5000 });
        leg.outcome = 'resolved';
      } catch (e) {
        leg.outcome = 'error';
        leg.errName = e && e.name ? String(e.name) : null;
        leg.errMessage = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 400);
      }
      await sleep(SETTLE_MS);
      leg.files = await frame.evaluate(() => Object.fromEntries(['s', 'm', 'd'].map((id) => [id, Array.from(document.getElementById(id).files, (f) => [f.name, f.size, f.type, f.webkitRelativePath])])));
      leg.events = await frame.evaluate(() => window.__events.slice());
      leg.reads = await frame.evaluate(async (id) => {
        const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
        const digest = async (buf) => ['ok', buf.byteLength, hex(await crypto.subtle.digest('SHA-256', buf))];
        const err = (e) => ['err', String(e && e.name), String(e && e.message)];
        const out = [];
        for (const f of Array.from(document.getElementById(id).files)) {
          let ab;
          try { ab = await digest(await f.arrayBuffer()); } catch (e) { ab = err(e); }
          out.push(ab);
        }
        return out;
      }, a.target);
      if (a.extra === 'binreads') {
        leg.extra = await frame.evaluate(async (id) => {
          const f = document.getElementById(id).files[0];
          const err = (e) => ['err', String(e && e.name), String(e && e.message)];
          const sha = async (buf) => { const d = await crypto.subtle.digest('SHA-256', buf); return [buf.byteLength, Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('')]; };
          let txt, sl, full;
          try { const t = await f.text(); txt = ['ok', t.length, await sha(new TextEncoder().encode(t))]; } catch (e) { txt = err(e); }
          try { sl = ['ok', ...(await sha(await f.slice(1, 3).arrayBuffer()))]; } catch (e) { sl = err(e); }
          try { full = ['ok', ...(await sha(await f.arrayBuffer()))]; } catch (e) { full = err(e); }
          return { text: txt, slice1_3: sl, arrayBuffer: full };
        }, a.target);
      }
    } catch (e) {
      leg.error = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
    } finally {
      try { if (client) await client.close(); } catch {}
      if (proc) killGroup(proc.pid);
      sweep();
      for (let i = 0; i < 25; i++) { try { await freePort(CDP_PORT); break; } catch { await sleep(200); } }
    }
    legs.push(leg);
    console.log(legId + ': ' + leg.outcome + (leg.outcome === 'error' ? ' errName=' + leg.errName + ' errMessage=' + JSON.stringify(leg.errMessage) : '') + (leg.error ? ' RUNNER=' + leg.error : ''));
  }
}
for (const s of servers) s.close();
const out = {
  seat: 'R100Exec3', probe: 'declared limit 4 leads (not counted legs)',
  chromium: (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim(),
  libs: { puppeteer: req('puppeteer-core/package.json').version, playwright: req('playwright-core/package.json').version },
  fixtures: {
    dupdir1DupTxt: { size: fs.statSync(path.join(SCRATCH, 'dupdir1', 'dup.txt')).size, sha256: sha256(fs.readFileSync(path.join(SCRATCH, 'dupdir1', 'dup.txt'))) },
    dupdir2DupTxt: { size: fs.statSync(path.join(SCRATCH, 'dupdir2', 'dup.txt')).size, sha256: sha256(fs.readFileSync(path.join(SCRATCH, 'dupdir2', 'dup.txt'))) },
    emptyPath: { size: 0, sha256: sha256(Buffer.alloc(0)) },
    bin: { size: 256, sha256: sha256(BIN) },
  },
  tmpdirAtLoad: process.env.TMPDIR,
  legs,
};
fs.writeFileSync(path.join(LANE, '.ufo/waves/round-100/w1/R100Exec3-out.json'), JSON.stringify(out, null, 2) + '\n');
console.log('wrote R100Exec3-out.json legs=' + legs.length + ' failures=' + legs.filter((l) => l.error).length);
