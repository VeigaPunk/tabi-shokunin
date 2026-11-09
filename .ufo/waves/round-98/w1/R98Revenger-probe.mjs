#!/usr/bin/env node
// Minimal probe for R98Revenger: one rep of PLA, PLAB, PLB, PLLB, PLL (Playwright), PUA, PUR (Puppeteer).
// Fixture shape mirrors scripts/client-oopif-uploadmodes-round98.mjs. Ports 33651/33652/33653 only.
// Protocol logs go to stderr (DEBUG env); leg markers on stderr segment per-leg protocol counts.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const DEPS = '/fast/scratch/hyaku/tabi-r98/R98Revenger/deps';
const SCRATCH = '/fast/scratch/hyaku/tabi-r98/R98Revenger';
const HTTP_PORT = 33651, CHILD_PORT = 33652, CDP_PORT = 33653;
const CHROMIUM = '/usr/bin/chromium';
const ANSWER_BYTES = 'tabi round 98 answer.\n';
const PAYLOAD_BYTES = 'tabi round 98 payload bytes.\n';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const req = createRequire(path.join(DEPS, 'package.json'));
const puppeteer = req('puppeteer-core');
const { chromium: pwChromium } = req('playwright-core');

const answerPath = path.join(SCRATCH, 'probe-answer.txt');
fs.writeFileSync(answerPath, ANSWER_BYTES);
const missingPath = path.join(SCRATCH, 'tabi-r98-missing.txt');
fs.rmSync(missingPath, { force: true });

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>child</title></head><body><input type="file" id="s"><script>window.__events=[];for(const t of['input','change','click'])document.getElementById('s').addEventListener(t,function(e){window.__events.push([e.type,e.isTrusted]);});</script></body></html>`;
let currentChildUrl = null;
const servers = [];
const serve = (port, handler) => new Promise((resolve) => { const s = http.createServer(handler); servers.push(s); s.listen(port, '127.0.0.1', resolve); });
await serve(HTTP_PORT, (q, r) => { const u = new URL(q.url, 'http://x'); if (u.pathname === '/parent.html') { r.setHeader('content-type', 'text/html'); r.end(`<!doctype html><html><body><input type="file" id="pp"><iframe id="c" src="${currentChildUrl}"></iframe></body></html>`); return; } r.statusCode = 404; r.end(); });
await serve(CHILD_PORT, (q, r) => { const u = new URL(q.url, 'http://x'); if (u.pathname === '/child.html') { r.setHeader('content-type', 'text/html'); r.end(childHtml()); return; } r.statusCode = 404; r.end(); });

const BASE_ARGS = ['--no-first-run', '--no-default-browser-check', '--window-size=1280,900'];
const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };

async function freePort(port) {
  return new Promise((resolve, reject) => {
    const s = http.createServer();
    s.on('error', reject);
    s.listen(port, '127.0.0.1', () => s.close(resolve));
  });
}
async function waitFree() {
  for (let i = 0; i < 25; i++) { try { await freePort(CDP_PORT); return; } catch { await sleep(200); } }
}
async function devtoolsVersion() {
  for (let i = 0; i < 100; i++) { try { return await (await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version')).json(); } catch { await sleep(150); } }
  return null;
}

const ARMS = {
  PLA: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'path' },
  PLAB: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'payload' },
  PLB: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payload' },
  PLLB: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'payload' },
  PLL: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'path' },
  PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path' },
  PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing' },
};

async function runLeg(arm) {
  console.error('LEG-START ' + arm);
  const a = ARMS[arm];
  const childUrl = 'http://localhost:' + CHILD_PORT + '/child.html?leg=' + arm;
  const parentUrl = 'http://127.0.0.1:' + HTTP_PORT + '/parent.html?leg=' + arm;
  currentChildUrl = childUrl;
  const prof = path.join(SCRATCH, 'leg-' + arm, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  let proc = null, client = null, page = null;
  const leg = { arm, lib: a.lib, mode: a.mode, isLocal: a.isLocal, input: a.input, outcome: null, errName: null, errMessage: null, childFiles: null, childEvents: null, childRead: null, parentFiles: null, error: null };
  try {
    if (a.mode === 'launch') {
      const args = ['--remote-debugging-port=' + CDP_PORT, ...BASE_ARGS];
      if (a.lib === 'puppeteer') client = await puppeteer.launch({ executablePath: CHROMIUM, headless: true, userDataDir: prof, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
      else client = await pwChromium.launch({ executablePath: CHROMIUM, headless: true, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
    } else {
      proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + prof, ...BASE_ARGS, 'about:blank'], { stdio: 'ignore', detached: true });
      liveGroups.add(proc.pid);
    }
    const ver = await devtoolsVersion();
    if (!ver) throw new Error('chromium never came up');
    if (a.lib === 'puppeteer') {
      if (a.mode === 'connect') client = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + CDP_PORT });
      page = await client.newPage();
    } else {
      if (a.mode === 'connect') client = a.isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT);
      const ctx = a.mode === 'launch' ? await client.newContext() : client.contexts()[0];
      page = await ctx.newPage();
    }
    await page.goto(parentUrl, { waitUntil: 'load' });
    await sleep(800);
    const frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    const input = a.input === 'payload' ? { name: 'tabi-r98-payload.txt', mimeType: 'text/plain', buffer: Buffer.from(PAYLOAD_BYTES) } : a.input === 'missing' ? missingPath : answerPath;
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
      leg.errName = e?.name ?? null;
      leg.errMessage = String(e?.message ?? e).split('\n')[0].slice(0, 300);
    }
    await sleep(400);
    leg.childFiles = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size, f.type]));
    leg.childEvents = await frame.evaluate(() => window.__events.slice());
    leg.childRead = await frame.evaluate(async () => {
      const fl = document.getElementById('s').files;
      if (fl.length !== 1) return null;
      try { return ['ok', await fl[0].text()]; } catch (e) { return ['err', String(e?.name), String(e?.message)]; }
    });
    leg.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size, f.type]));
  } catch (e) {
    leg.error = String(e?.message ?? e).split('\n')[0].slice(0, 300);
  } finally {
    try { if (client) { if (a.mode === 'connect' && a.lib === 'puppeteer') await client.disconnect(); else await client.close(); } } catch {}
    if (proc) killGroup(proc.pid);
    console.error('LEG-END ' + arm);
    await waitFree();
  }
  return leg;
}

const arms = process.argv.slice(2);
const list = arms.length ? arms : Object.keys(ARMS);
const legs = [];
for (const arm of list) legs.push(await runLeg(arm));
for (const s of servers) s.close();
console.log(JSON.stringify(legs, null, 2));
for (const g of [...liveGroups]) killGroup(g);
