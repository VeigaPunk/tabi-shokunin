#!/usr/bin/env node
// R99Exec3 limit probes (declared limit 4 of plans/round-99.md), ad-hoc, 3 reps each.
// Fixture shape copied from scripts/client-oopif-uploadsets-round99.mjs.
// Ports 34631,34632,34633; scratch /fast/scratch/hyaku/tabi-r99/R99Exec3.
// TMPDIR set before clients load.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const SCRATCH = '/fast/scratch/hyaku/tabi-r99/R99Exec3';
mkdir_p: {
  fs.mkdirSync(path.join(SCRATCH, 't'), { recursive: true });
}
process.env.TMPDIR = path.join(SCRATCH, 't');

const CHROMIUM = '/usr/bin/chromium';
const HTTP_PORT = 34631, CHILD_PORT = 34632, CDP_PORT = 34633;
const SETTLE_MS = 400, LOAD_WAIT_MS = 800;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const req = createRequire(path.join(SCRATCH, 'deps', 'package.json'));
let puppeteer, pwChromium;
puppeteer = req('puppeteer-core');
pwChromium = req('playwright-core').chromium;

const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
function sweep() {
  // kill chromium processes whose profile is under our scratch
  let out = '';
  try { out = spawnSync('pgrep', ['-af', SCRATCH], { encoding: 'utf8' }).stdout || ''; } catch {}
  for (const line of out.split('\n')) {
    const m = line.match(/^(\d+)\s/);
    if (m) { const pid = Number(m[1]); if (pid !== process.pid) { try { process.kill(pid, 'SIGKILL'); } catch {} } }
  }
}
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); sweep(); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); sweep(); process.exit(130); });

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>x</title>
<style>#s{position:absolute;left:30px;top:40px;width:160px;height:50px}#m{position:absolute;left:30px;top:140px;width:160px;height:50px}#d{position:absolute;left:30px;top:240px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><input type="file" id="m" multiple><input type="file" id="d" webkitdirectory><script>
window.__events = [];
for (const id of ['s','m','d']) for (const t of ['input','change','click']) document.getElementById(id).addEventListener(t, function(e){ window.__events.push([id, e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>p</title>
<style>#c{position:absolute;left:120px;top:90px;width:500px;height:300px;border:0}</style></head>
<body><iframe id="c" src="${childUrl}"></iframe></body></html>`;

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

// fixture files
const pathA = path.join(SCRATCH, 'probe-a.txt'); fs.writeFileSync(pathA, 'tabi round 99 file a.\n'); // 22B
const pathB = path.join(SCRATCH, 'probe-b.txt'); fs.writeFileSync(pathB, 'tabi round 99 file b, second.\n'); // 30B
const emptyPath = path.join(SCRATCH, 'probe-empty.txt'); fs.writeFileSync(emptyPath, ''); // 0B text file
const dirPath = path.join(SCRATCH, 'probe-dir'); fs.mkdirSync(dirPath, { recursive: true });
fs.mkdirSync(path.join(dirPath, 'sub'), { recursive: true });
fs.writeFileSync(path.join(dirPath, 'one.txt'), 'dir file one\n');
fs.writeFileSync(path.join(dirPath, 'sub', 'two.txt'), 'dir file two\n');

const BIN = Buffer.from(Array.from({ length: 256 }, (_, i) => i));

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

// generic leg harness: mode launch/connect, lib puppeteer/playwright, isLocal.
// Call fn(page, frame) performs the setInputFiles/uploadFile; capture outcome+files+events.
let legSeq = 0;
async function runLeg({ lib, mode, isLocal, call }) {
  const legId = 'probe-' + (++legSeq);
  const childUrl = 'http://localhost:' + CHILD_PORT + '/child.html?leg=' + legId;
  const parentUrl = 'http://127.0.0.1:' + HTTP_PORT + '/parent.html?leg=' + legId;
  currentChildUrl = childUrl;
  const prof = path.join(SCRATCH, 'leg-' + legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const r = { leg: legId, outcome: null, errName: null, errMessage: null, files: null, events: null, reads: null, extra: null, error: null };
  let proc = null, client = null, page;
  try {
    if (mode === 'launch') {
      const args = ['--remote-debugging-port=' + CDP_PORT, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900'];
      if (lib === 'puppeteer') client = await puppeteer.launch({ executablePath: CHROMIUM, headless: true, userDataDir: prof, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
      else client = await pwChromium.launch({ executablePath: CHROMIUM, headless: true, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
    } else {
      proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
      liveGroups.add(proc.pid);
    }
    const ver = await devtoolsVersion();
    if (!ver) throw new Error('chromium never came up: devtools endpoint never answered');
    if (lib === 'puppeteer') {
      if (mode === 'connect') client = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + CDP_PORT });
      page = await client.newPage();
    } else {
      if (mode === 'connect') client = isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT);
      const ctx = mode === 'launch' ? await client.newContext() : client.contexts()[0];
      page = await ctx.newPage();
    }
    await page.goto(parentUrl, { waitUntil: 'load' });
    await sleep(LOAD_WAIT_MS);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    try {
      const extra = await call({ lib, frame });
      r.outcome = 'resolved'; r.extra = extra ?? null;
    } catch (e) {
      r.outcome = 'error'; r.errName = e && e.name ? String(e.name) : null;
      r.errMessage = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
    }
    await sleep(SETTLE_MS);
    r.files = await frame.evaluate(() => Object.fromEntries(['s', 'm', 'd'].map((id) => [id, Array.from(document.getElementById(id).files, (f) => [f.name, f.size, f.type, f.webkitRelativePath])])));
    r.events = await frame.evaluate(() => window.__events.slice());
    r.reads = await frame.evaluate(async (opts) => {
      const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
      const digest = async (buf) => ['ok', buf.byteLength, hex(await crypto.subtle.digest('SHA-256', buf))];
      const err = (e) => ['err', String(e && e.name), String(e && e.message)];
      const out = {};
      for (const id of opts.ids) {
        const arr = [];
        for (const f of Array.from(document.getElementById(id).files)) {
          let ab, fr, tx, sl;
          try { ab = await digest(await f.arrayBuffer()); } catch (e) { ab = err(e); }
          try {
            const buf = await new Promise((res, rej) => { const rr = new FileReader(); rr.onload = () => res(rr.result); rr.onerror = () => rej(rr.error); rr.readAsArrayBuffer(f); });
            fr = await digest(buf);
          } catch (e) { fr = err(e); }
          if (opts.extra) {
            try { tx = ['ok', await f.text()]; } catch (e) { tx = err(e); }
            try { sl = await digest(await f.slice(1, 3).arrayBuffer()); } catch (e) { sl = err(e); }
          }
          arr.push({ f: [f.name, f.size, f.type, f.webkitRelativePath], ab, fr, tx: tx || undefined, slice: sl || undefined });
        }
        out[id] = arr;
      }
      return out;
    }, r.extra && r.extra.readIds ? { ids: r.extra.readIds, extra: !!r.extra.extraReads } : { ids: ['s', 'm', 'd'], extra: false });
  } catch (e) {
    r.error = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300);
  } finally {
    try { if (client) { if (mode === 'connect' && lib === 'puppeteer') await client.disconnect(); else await client.close(); } } catch {}
    if (proc) killGroup(proc.pid);
    sweep();
    for (let i = 0; i < 25; i++) { try { await freePort(CDP_PORT); break; } catch { await sleep(200); } }
  }
  return r;
}

const pwSet = (target, x) => async ({ lib, frame }) => { await frame.locator('#' + target).setInputFiles(x, { timeout: 5000 }); return { readIds: ['s', 'm', 'd'] }; };
const ppUp = (target, xs) => async ({ lib, frame }) => { const h = await frame.$('#' + target); if (!h) throw new Error('handle not found'); await h.uploadFile(...xs); return { readIds: ['s', 'm', 'd'] }; };

const results = {};
// (a) three payloads incl. two with SAME name on #m
results.a_three_payloads_dup_name = [];
for (let rep = 1; rep <= 3; rep++) {
  results.a_three_payloads_dup_name.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: false,
    call: async ({ frame }) => {
      await frame.locator('#m').setInputFiles([
        { name: 'dup.txt', mimeType: 'text/plain', buffer: Buffer.from('same-name first file\n') },
        { name: 'dup.txt', mimeType: 'text/plain', buffer: Buffer.from('same-name second file\n') },
        { name: 'other.txt', mimeType: 'text/plain', buffer: Buffer.from('other file\n') },
      ], { timeout: 5000 });
      return { readIds: ['s', 'm', 'd'] };
    },
  }));
}
// (b1) empty (0-byte) payload on #m
results.b1_empty_payload = [];
for (let rep = 1; rep <= 3; rep++) {
  results.b1_empty_payload.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: false,
    call: async ({ frame }) => {
      await frame.locator('#m').setInputFiles([{ name: 'tabi-r99-empty.txt', mimeType: 'text/plain', buffer: Buffer.alloc(0) }], { timeout: 5000 });
      return { readIds: ['s', 'm', 'd'] };
    },
  }));
}
// (b2) empty file path on #m (isLocal for paths)
results.b2_empty_path = [];
for (let rep = 1; rep <= 3; rep++) {
  results.b2_empty_path.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: true,
    call: async ({ frame }) => {
      await frame.locator('#m').setInputFiles([emptyPath], { timeout: 5000 });
      return { readIds: ['s', 'm', 'd'] };
    },
  }));
}
// (c) one path + one payload in one Playwright call on #m (isLocal)
results.c_path_plus_payload = [];
for (let rep = 1; rep <= 3; rep++) {
  results.c_path_plus_payload.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: true,
    call: async ({ frame }) => {
      await frame.locator('#m').setInputFiles([pathA, { name: 'tabi-r99-p1.txt', mimeType: 'text/plain', buffer: Buffer.from('tabi round 99 payload one.\n') }], { timeout: 5000 });
      return { readIds: ['s', 'm', 'd'] };
    },
  }));
}
// (d) Playwright launch with two paths on #m
results.d_pw_launch_two_paths = [];
for (let rep = 1; rep <= 3; rep++) {
  results.d_pw_launch_two_paths.push(await runLeg({
    lib: 'playwright', mode: 'launch', isLocal: null,
    call: pwSet('m', [pathA, pathB]),
  }));
}
// (e) Playwright connectOverCDP isLocal with two paths on #s
results.e_pw_islocal_two_paths_on_s = [];
for (let rep = 1; rep <= 3; rep++) {
  results.e_pw_islocal_two_paths_on_s.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: true,
    call: pwSet('s', [pathA, pathB]),
  }));
}
// (f) Puppeteer launch with two paths on #m
results.f_pp_launch_two_paths = [];
for (let rep = 1; rep <= 3; rep++) {
  results.f_pp_launch_two_paths.push(await runLeg({
    lib: 'puppeteer', mode: 'launch', isLocal: null,
    call: ppUp('m', [pathA, pathB]),
  }));
}
// (g) webkitdirectory input #d with Playwright localDirectory (isLocal)
results.g_webkitdirectory_localdir = [];
for (let rep = 1; rep <= 3; rep++) {
  results.g_webkitdirectory_localdir.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: true,
    call: async ({ frame }) => {
      await frame.locator('#d').setInputFiles(dirPath, { timeout: 5000 });
      return { readIds: ['s', 'm', 'd'] };
    },
  }));
}
// (h) 256-byte binary payload: text() + slice(1,3).arrayBuffer() extra reads
results.h_bin_text_and_slice = [];
for (let rep = 1; rep <= 3; rep++) {
  results.h_bin_text_and_slice.push(await runLeg({
    lib: 'playwright', mode: 'connect', isLocal: false,
    call: async ({ frame }) => {
      await frame.locator('#s').setInputFiles([{ name: 'tabi-r99-bytes.png', buffer: BIN }], { timeout: 5000 });
      return { readIds: ['s', 'm', 'd'], extraReads: true };
    },
  }));
}

// summarize consistency
const summary = {};
for (const [k, legs] of Object.entries(results)) {
  const sig = legs.map((l) => JSON.stringify([l.outcome, l.errName, l.errMessage, l.files, l.events, l.reads]));
  summary[k] = { reps: legs.length, consistent: new Set(sig).size === 1, outcomes: legs.map((l) => l.outcome), errors: legs.map((l) => l.error) };
}

for (const s of servers) s.close();
const outPath = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-99/w1/R99Exec3-out.json';
fs.writeFileSync(outPath, JSON.stringify({ seat: 'R99Exec3', ports: [HTTP_PORT, CHILD_PORT, CDP_PORT], results, summary }, null, 2) + '\n');
console.log(JSON.stringify({ out: outPath, summary }, null, 2));
