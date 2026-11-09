#!/usr/bin/env node
// R96Exec3 limit probes (limits 2 + 4 of plans/round-96.md), cross-site child only.
// Shape copied from scripts/client-oopif-chooser-round96.mjs: parent 127.0.0.1 #pp + iframe,
// child localhost #s, fresh Chromium 155 per leg on fixed ports 32631/32632/32633.
// (a) puppeteer.launch instead of connect; (b) connect + 15000ms wait;
// (c) frame.$('#s').uploadFile with no chooser arm; (d) playwright chromium.launch
// instead of connectOverCDP. 3 reps each, cross-site only. Raw observations to JSON on stdout file arg.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const DEPS = '/fast/scratch/hyaku/tabi-r96/R96Exec3/deps';
const SCRATCH = '/fast/scratch/hyaku/tabi-r96/R96Exec3';
const HTTP = 32631, CHILD = 32632, CDP = 32633;
const OUT = process.argv[2] || '/fast/scratch/hyaku/tabi-r96/R96Exec3/out.json';
const req = createRequire(path.join(DEPS, 'package.json'));
const puppeteer = req('puppeteer-core');
const pw = req('playwright-core').chromium;

const ANSWER_NAME = 'tabi-r96-answer.txt', ANSWER_BYTES = 'tabi round 96 answer.\n';
const answerPath = path.join(SCRATCH, ANSWER_NAME);
fs.mkdirSync(SCRATCH, { recursive: true });
fs.writeFileSync(answerPath, ANSWER_BYTES);

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>child</title><style>#s{position:absolute;left:30px;top:40px;width:160px;height:50px}</style></head><body><input type="file" id="s"><script>window.__clicks=[];window.addEventListener('click',function(e){window.__clicks.push([e.target&&e.target.id||null,e.isTrusted])},true);</script></body></html>`;
const parentHtml = (u) => `<!doctype html><html><head><meta charset="utf-8"><title>parent</title><style>#c{position:absolute;left:120px;top:90px;width:500px;height:300px;border:0}#pp{position:absolute;left:700px;top:40px;width:180px;height:20px}</style></head><body><input type="file" id="pp"><iframe id="c" src="${u}"></iframe></body></html>`;
let cur = null;
const servers = [];
const serve = (p, h) => new Promise((r) => { const s = http.createServer(h); servers.push(s); s.listen(p, '127.0.0.1', r); });
await serve(HTTP, (q, r) => { const u = new URL(q.url, 'http://x'); if (u.pathname === '/parent.html') { r.setHeader('content-type', 'text/html'); r.end(parentHtml(cur)); return; } r.statusCode = 404; r.end(); });
await serve(CHILD, (q, r) => { const u = new URL(q.url, 'http://x'); if (u.pathname === '/child.html') { r.setHeader('content-type', 'text/html'); r.end(childHtml()); return; } r.statusCode = 404; r.end(); });

import { spawn } from 'node:child_process';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const REPS = 3;
const results = { a: [], b: [], c: [], d: [] };

async function startChromium(prof) {
  fs.mkdirSync(prof, { recursive: true });
  const proc = spawn('/usr/bin/chromium', ['--headless=new', `--remote-debugging-port=${CDP}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 40; i++) { try { const v = await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json(); return { proc, ver: v }; } catch { await sleep(150); } }
  throw new Error('chromium devtools never answered');
}
const kill = (proc) => { try { process.kill(-proc.pid, 'SIGKILL'); } catch {} };

// (a) puppeteer.launch, cross-site, 3s wait
for (let rep = 1; rep <= REPS; rep++) {
  const leg = `a-${rep}`, childUrl = `http://localhost:${CHILD}/child.html?leg=${leg}`, parentUrl = `http://127.0.0.1:${HTTP}/parent.html?leg=${leg}`;
  cur = childUrl;
  const rec = { leg, mode: 'puppeteer.launch', timeoutMs: 3000 };
  let browser = null, proc = null;
  try {
    // launch mode still needs a chromium; we launch via puppeteer.launch itself (it spawns chromium)
    browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, userDataDir: path.join(SCRATCH, `prof-${leg}`), args: ['--no-first-run', '--no-default-browser-check', '--window-size=1280,900'] });
    rec.browserVersion = await browser.version();
    const page = await browser.newPage();
    await page.goto(parentUrl, { waitUntil: 'load' }); await sleep(800);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const wait = page.waitForFileChooser({ timeout: 3000 }); wait.catch(() => {});
    await frame.click('#s');
    try {
      const ch = await wait; rec.outcome = 'chooser'; rec.chooserMultiple = ch.isMultiple(); await ch.accept([answerPath]);
    } catch (e) { rec.outcome = e && e.name === 'TimeoutError' ? 'timeout' : 'error'; rec.errName = e && e.name; rec.errMessage = String(e && e.message).split('\n')[0].slice(0, 200); }
    await sleep(400);
    if (frame) { rec.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size])); rec.childClicks = await frame.evaluate(() => window.__clicks); }
    rec.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
  } catch (e) { rec.error = String(e && e.message).split('\n')[0].slice(0, 300); }
  finally { try { if (browser) await browser.close(); } catch {} await sleep(200); }
  results.a.push(rec);
}

// (b) puppeteer.connect + 15000ms wait, cross-site
for (let rep = 1; rep <= REPS; rep++) {
  const leg = `b-${rep}`, childUrl = `http://localhost:${CHILD}/child.html?leg=${leg}`, parentUrl = `http://127.0.0.1:${HTTP}/parent.html?leg=${leg}`;
  cur = childUrl;
  const rec = { leg, mode: 'puppeteer.connect', timeoutMs: 15000 };
  let proc = null, client = null;
  try {
    const st = await startChromium(path.join(SCRATCH, `prof-${leg}`)); proc = st.proc; rec.browserVersion = st.ver.Browser;
    client = await puppeteer.connect({ browserURL: `http://127.0.0.1:${CDP}` });
    const page = await client.newPage();
    await page.goto(parentUrl, { waitUntil: 'load' }); await sleep(800);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const wait = page.waitForFileChooser({ timeout: 15000 }); wait.catch(() => {});
    await frame.click('#s');
    try {
      const ch = await wait; rec.outcome = 'chooser'; rec.chooserMultiple = ch.isMultiple(); await ch.accept([answerPath]);
    } catch (e) { rec.outcome = e && e.name === 'TimeoutError' ? 'timeout' : 'error'; rec.errName = e && e.name; rec.errMessage = String(e && e.message).split('\n')[0].slice(0, 200); }
    await sleep(400);
    if (frame) { rec.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size])); rec.childClicks = await frame.evaluate(() => window.__clicks); }
    rec.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
  } catch (e) { rec.error = String(e && e.message).split('\n')[0].slice(0, 300); }
  finally { try { if (client) await client.disconnect(); } catch {} if (proc) kill(proc); await sleep(200); }
  results.b.push(rec);
}

// (c) puppeteer connect, uploadFile on cross-site child, no chooser
for (let rep = 1; rep <= REPS; rep++) {
  const leg = `c-${rep}`, childUrl = `http://localhost:${CHILD}/child.html?leg=${leg}`, parentUrl = `http://127.0.0.1:${HTTP}/parent.html?leg=${leg}`;
  cur = childUrl;
  const rec = { leg, mode: 'puppeteer.connect-uploadFile' };
  let proc = null, client = null;
  try {
    const st = await startChromium(path.join(SCRATCH, `prof-${leg}`)); proc = st.proc; rec.browserVersion = st.ver.Browser;
    client = await puppeteer.connect({ browserURL: `http://127.0.0.1:${CDP}` });
    const page = await client.newPage();
    await page.goto(parentUrl, { waitUntil: 'load' }); await sleep(800);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const h = await frame.$('#s');
    if (!h) throw new Error('no #s handle');
    await h.uploadFile(answerPath);
    rec.outcome = 'uploaded';
    await sleep(400);
    rec.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size]));
    rec.childClicks = await frame.evaluate(() => window.__clicks);
    rec.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
  } catch (e) { rec.error = String(e && e.message).split('\n')[0].slice(0, 300); }
  finally { try { if (client) await client.disconnect(); } catch {} if (proc) kill(proc); await sleep(200); }
  results.c.push(rec);
}

// (d) playwright chromium.launch, cross-site, filechooser event
for (let rep = 1; rep <= REPS; rep++) {
  const leg = `d-${rep}`, childUrl = `http://localhost:${CHILD}/child.html?leg=${leg}`, parentUrl = `http://127.0.0.1:${HTTP}/parent.html?leg=${leg}`;
  cur = childUrl;
  const rec = { leg, mode: 'playwright.chromium.launch', timeoutMs: 3000 };
  let browser = null;
  try {
    browser = await pw.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-first-run', '--no-default-browser-check', '--window-size=1280,900'] });
    rec.browserVersion = browser.version();
    const page = await browser.newPage();
    await page.goto(parentUrl, { waitUntil: 'load' }); await sleep(800);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const wait = page.waitForEvent('filechooser', { timeout: 3000 }); wait.catch(() => {});
    await frame.click('#s');
    try {
      const ch = await wait; rec.outcome = 'chooser'; rec.chooserMultiple = ch.isMultiple(); rec.chooserElementId = await ch.element().evaluate((e) => e.id); await ch.setFiles(answerPath);
    } catch (e) { rec.outcome = e && e.name === 'TimeoutError' ? 'timeout' : 'error'; rec.errName = e && e.name; rec.errMessage = String(e && e.message).split('\n')[0].slice(0, 200); }
    await sleep(400);
    if (frame) { rec.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size])); rec.childClicks = await frame.evaluate(() => window.__clicks); }
    rec.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
  } catch (e) { rec.error = String(e && e.message).split('\n')[0].slice(0, 300); }
  finally { try { if (browser) await browser.close(); } catch {} await sleep(200); }
  results.d.push(rec);
}

for (const s of servers) s.close();
const payload = { seat: 'R96Exec3', ports: [HTTP, CHILD, CDP], reps: REPS, crossHost: 'localhost', chromium: '/usr/bin/chromium 155.0.8059.84', results };
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
console.log(JSON.stringify({ out: OUT, legs: Object.values(results).flat().length }));
