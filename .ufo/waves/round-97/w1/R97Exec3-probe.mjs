#!/usr/bin/env node
// Ad-hoc limit probe for tabi round 97 C1, seat R97Exec3 (NOT the pinned driver).
// Probes declared limits 2, 4 and 5 (plans/round-97.md):
//   (a) Playwright chromium.launch + setInputFiles(answer) — trusted or untrusted?
//   (b) Playwright connectOverCDP(url,{isLocal:true}) + setInputFiles(missing) — error text?
//   (c) Puppeteer puppeteer.launch + uploadFile(answer) — same as PUX (connect)?
//   (d) after PUM phantom upload: read the File in-page (f.text(), f.size, FileReader) — what does the page get?
//   (e) Playwright payload object {name,mimeType,buffer} over default connectOverCDP — trusted?
// Fixture shape copied from scripts/client-oopif-uploadfile-round97.mjs:
// parent http://127.0.0.1:<http>/parent.html with #pp + iframe,
// child http://localhost:<child>/child.html with #s + [type,isTrusted] listeners.
// Cross-site child everywhere (localhost). Ports 32731,32732,32733. 3 reps each.
// Usage: node R97Exec3-probe.mjs --deps <ABS> --scratch <ABS> --out <ABS json>
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const OBS = process.argv.slice(2);
const opt = (n) => { const i = OBS.indexOf('--' + n); return i >= 0 ? OBS[i + 1] : null; };
const deps = opt('deps');
const scratch = opt('scratch');
const out = opt('out');
const HTTP_PORT = 32731, CHILD_PORT = 32732, CDP_PORT = 32733;
const CHROMIUM = '/usr/bin/chromium';
const ANSWER_NAME = 'tabi-r97-answer.txt';
const ANSWER_BYTES = 'tabi round 97 answer.\n';
const MISSING_NAME = 'tabi-r97-missing.txt';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!path.isAbsolute(deps) || !path.isAbsolute(scratch) || !path.isAbsolute(out)) { console.error('usage: --deps/--scratch/--out absolute'); process.exit(2); }

const req = createRequire(path.join(deps, 'package.json'));
const puppeteer = req('puppeteer-core');
const pw = req('playwright-core');

fs.mkdirSync(scratch, { recursive: true });
fs.mkdirSync(path.dirname(out), { recursive: true });
const answerPath = path.join(scratch, ANSWER_NAME);
fs.writeFileSync(answerPath, ANSWER_BYTES);
const missingPath = path.join(scratch, MISSING_NAME);
fs.rmSync(missingPath, { force: true });

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r97-exec3 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><script>
window.__events = [];
for (const t of ['input', 'change', 'click']) document.getElementById('s').addEventListener(t, function (e) { window.__events.push([e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r97-exec3 parent</title>
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

const groups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} groups.delete(pid); };
process.on('exit', () => { for (const g of [...groups]) killGroup(g); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...groups]) killGroup(g); process.exit(130); });

const settle = async (frame, page) => ({
  childFiles: await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size, f.type])),
  childEvents: await frame.evaluate(() => window.__events),
  parentFiles: await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size])),
});

async function waitCdp() {
  for (let i = 0; i < 100; i++) { try { return await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json(); } catch { await sleep(150); } }
  throw new Error('devtools endpoint never answered');
}

// (a) Playwright chromium.launch + setInputFiles(answer)
async function armA(rep) {
  const legId = `A-${rep}`;
  const childUrl = `http://localhost:${CHILD_PORT}/child.html?leg=${legId}`;
  currentChildUrl = childUrl;
  const res = { arm: 'A-launch-setInputFiles-answer', rep, outcome: null, errName: null, errMessage: null };
  let browser = null;
  try {
    browser = await pw.chromium.launch({ executablePath: CHROMIUM, headless: true, args: ['--no-sandbox', '--no-first-run'] });
    res.browserVersion = browser.version();
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${HTTP_PORT}/parent.html?leg=${legId}`, { waitUntil: 'load' });
    await sleep(600);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    await frame.locator('#s').setInputFiles(answerPath, { timeout: 5000 });
    res.outcome = 'resolved';
    await sleep(400);
    Object.assign(res, await settle(frame, page));
  } catch (e) { res.outcome = 'error'; res.errName = e?.name ?? null; res.errMessage = String(e?.message ?? e).split('\n')[0].slice(0, 300); }
  finally { try { if (browser) await browser.close(); } catch {} }
  return res;
}

// (b) Playwright connectOverCDP(url,{isLocal:true}) + setInputFiles(missing)
async function armB(rep) {
  const legId = `B-${rep}`;
  const childUrl = `http://localhost:${CHILD_PORT}/child.html?leg=${legId}`;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, `leg-${legId}`, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const res = { arm: 'B-isLocal-missing', rep, outcome: null, errName: null, errMessage: null };
  const proc = spawn(CHROMIUM, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
  groups.add(proc.pid);
  let client = null;
  try {
    await waitCdp();
    client = await pw.chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`, { isLocal: true });
    const page = await client.contexts()[0].newPage();
    await page.goto(`http://127.0.0.1:${HTTP_PORT}/parent.html?leg=${legId}`, { waitUntil: 'load' });
    await sleep(600);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    try {
      await frame.locator('#s').setInputFiles(missingPath, { timeout: 5000 });
      res.outcome = 'resolved';
    } catch (e) {
      res.outcome = 'error';
      res.errName = e?.name ?? null;
      res.errMessage = String(e?.message ?? e).split('\n').slice(0, 3).join(' | ').slice(0, 400);
    }
    await sleep(400);
    Object.assign(res, await settle(frame, page));
  } catch (e) { res.outcome = 'error'; res.errName = e?.name ?? null; res.errMessage = String(e?.message ?? e).split('\n').slice(0, 3).join(' | ').slice(0, 400); }
  finally { try { if (client) await client.close(); } catch {} killGroup(proc.pid); await sleep(300); }
  return res;
}

// (c) Puppeteer launch + uploadFile(answer)
async function armC(rep) {
  const legId = `C-${rep}`;
  const childUrl = `http://localhost:${CHILD_PORT}/child.html?leg=${legId}`;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, `leg-${legId}`, 'profile');
  const res = { arm: 'C-puppeteer-launch-upload-answer', rep, outcome: null, errName: null, errMessage: null };
  let browser = null;
  try {
    browser = await puppeteer.launch({ executablePath: CHROMIUM, headless: true, userDataDir: prof, args: ['--no-sandbox', '--no-first-run'] });
    res.browserVersion = await browser.version();
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${HTTP_PORT}/parent.html?leg=${legId}`, { waitUntil: 'load' });
    await sleep(600);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const h = await frame.$('#s');
    if (!h) throw new Error('child #s handle not found');
    await h.uploadFile(answerPath);
    res.outcome = 'resolved';
    await sleep(400);
    Object.assign(res, await settle(frame, page));
  } catch (e) { res.outcome = 'error'; res.errName = e?.name ?? null; res.errMessage = String(e?.message ?? e).split('\n')[0].slice(0, 300); }
  finally { try { if (browser) await browser.close(); } catch {} }
  return res;
}

// (d) Puppeteer connect + uploadFile(missing), then read the phantom File in-page
async function armD(rep) {
  const legId = `D-${rep}`;
  const childUrl = `http://localhost:${CHILD_PORT}/child.html?leg=${legId}`;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, `leg-${legId}`, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const res = { arm: 'D-puppeteer-connect-missing-phantom-read', rep, outcome: null, errName: null, errMessage: null };
  const proc = spawn(CHROMIUM, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
  groups.add(proc.pid);
  let client = null;
  try {
    await waitCdp();
    client = await puppeteer.connect({ browserURL: `http://127.0.0.1:${CDP_PORT}` });
    const page = await client.newPage();
    await page.goto(`http://127.0.0.1:${HTTP_PORT}/parent.html?leg=${legId}`, { waitUntil: 'load' });
    await sleep(600);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const h = await frame.$('#s');
    if (!h) throw new Error('child #s handle not found');
    await h.uploadFile(missingPath);
    res.outcome = 'resolved';
    await sleep(400);
    const read = await frame.evaluate(async () => {
      const f = document.getElementById('s').files[0];
      if (!f) return { present: false };
      const out = { present: true, name: f.name, size: f.size, type: f.type, lastModified: f.lastModified };
      try { out.text = await f.text(); } catch (e) { out.textError = String(e?.message ?? e).slice(0, 200); }
      try {
        out.fileReader = await new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve({ result: fr.result, error: fr.error ? String(fr.error.message || fr.error) : null });
          fr.onerror = () => reject(new Error(String(fr.error && fr.error.message || fr.error || 'read error')));
          fr.readAsText(f);
        });
      } catch (e) { out.fileReaderError = String(e?.message ?? e).slice(0, 200); }
      return out;
    });
    res.phantom = read;
    Object.assign(res, await settle(frame, page));
  } catch (e) { res.outcome = 'error'; res.errName = e?.name ?? null; res.errMessage = String(e?.message ?? e).split('\n')[0].slice(0, 300); }
  finally { try { if (client) await client.disconnect(); } catch {} killGroup(proc.pid); await sleep(300); }
  return res;
}

// (e) Playwright payload object {name, mimeType, buffer} over default connectOverCDP
async function armE(rep) {
  const legId = `E-${rep}`;
  const childUrl = `http://localhost:${CHILD_PORT}/child.html?leg=${legId}`;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, `leg-${legId}`, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const res = { arm: 'E-payload-object-default-cdp', rep, outcome: null, errName: null, errMessage: null };
  const proc = spawn(CHROMIUM, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
  groups.add(proc.pid);
  let client = null;
  try {
    await waitCdp();
    client = await pw.chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
    const page = await client.contexts()[0].newPage();
    await page.goto(`http://127.0.0.1:${HTTP_PORT}/parent.html?leg=${legId}`, { waitUntil: 'load' });
    await sleep(600);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    await frame.locator('#s').setInputFiles({ name: 'p.txt', mimeType: 'text/plain', buffer: Buffer.from(ANSWER_BYTES) }, { timeout: 5000 });
    res.outcome = 'resolved';
    await sleep(400);
    Object.assign(res, await settle(frame, page));
  } catch (e) { res.outcome = 'error'; res.errName = e?.name ?? null; res.errMessage = String(e?.message ?? e).split('\n')[0].slice(0, 300); }
  finally { try { if (client) await client.close(); } catch {} killGroup(proc.pid); await sleep(300); }
  return res;
}

const results = { seat: 'R97Exec3', ports: { http: HTTP_PORT, child: CHILD_PORT, cdp: CDP_PORT }, crossHost: 'localhost', reps: 3, results: [] };
const arms = { A: armA, B: armB, C: armC, D: armD, E: armE };
for (let rep = 1; rep <= 3; rep++) for (const [key, fn] of Object.entries(arms)) results.results.push(await fn(rep));
for (const s of servers) s.close();
fs.writeFileSync(out, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({ out, legs: results.results.length }));
process.exit(0);
