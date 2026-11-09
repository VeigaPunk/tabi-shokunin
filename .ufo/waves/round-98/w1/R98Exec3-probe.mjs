#!/usr/bin/env node
// R98Exec3 limit probes (declared limits 3+4 of plans/round-98.md) — OBSERVATIONS outside the frozen
// claim, not legs. Fixture shape copied from scripts/client-oopif-uploadmodes-round98.mjs:
// parent http://127.0.0.1:<http>/parent.html?leg=<id> with #pp + iframe; child
// http://localhost:<child>/child.html?leg=<id> with #s + [input,change,click] -> [type,isTrusted].
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const OBS = []; // [probe, rep, ...record]
const rec = (probe, rep, job) => { try { OBS.push([probe, rep, job]); } catch { OBS.push([probe, rep, 'record-failed']); } };

const CHROMIUM = '/usr/bin/chromium';
const HTTP = 33631, CHILD = 33632, CDP = 33633;
const SCRATCH = '/fast/scratch/hyaku/tabi-r98/R98Exec3';
const DEPS = path.join(SCRATCH, 'deps');
const OUTP = path.join(SCRATCH, 'out.json');
const MISSING = path.join(SCRATCH, 'tabi-r98-missing.txt');
const ANSWER = path.join(SCRATCH, 'tabi-r98-answer.txt');
fs.mkdirSync(path.join(SCRATCH, 't'), { recursive: true });
fs.mkdirSync(path.join(SCRATCH, 'out'), { recursive: true });
fs.writeFileSync(ANSWER, 'tabi round 98 answer.\n');
fs.rmSync(MISSING, { force: true });
process.env.TMPDIR = path.join(SCRATCH, 't');

const req = createRequire(path.join(DEPS, 'package.json'));
const puppeteer = req('puppeteer-core');
const { chromium: pwChromium } = req('playwright-core');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let curChildUrl = null;
const servers = [];
const serve = (port, handler) => new Promise((res) => { const s = http.createServer(handler); servers.push(s); s.listen(port, '127.0.0.1', res); });
const childHtml = (multiple) => `<!doctype html><html><head><meta charset="utf-8"><title>r98exec3 child</title></head><body><input type="file" id="s"${multiple ? ' multiple' : ''}><script>
window.__events = []; for (const t of ['input','change','click']) document.getElementById('s').addEventListener(t, function (e) { window.__events.push([e.type, e.isTrusted]); });</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>r98exec3 parent</title></head><body><input type="file" id="pp"><iframe id="c" src="${childUrl}"></iframe></body></html>`;
const served = { multiple: false };
await serve(HTTP, (q, r) => { const u = new URL(q.url, 'http://x'); if (u.pathname === '/parent.html') { r.setHeader('content-type', 'text/html'); r.end(parentHtml(curChildUrl)); return; } r.statusCode = 404; r.end(); });
await serve(CHILD, (q, r) => { const u = new URL(q.url, 'http://x'); if (u.pathname === '/child.html') { r.setHeader('content-type', 'text/html'); r.end(childHtml(served.multiple)); return; } r.statusCode = 404; r.end(); });

const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
const sweep = () => { try { for (const line of fs.readFileSync('/proc/net/tcp', 'utf8').split('\n')) { if (!line.includes(':' + CDP.toString(16).toUpperCase().padStart(4, '0'))) continue; } } catch {} };
async function devtoolsVersion() { for (let i = 0; i < 100; i++) { try { return await (await fetch('http://127.0.0.1:' + CDP + '/json/version')).json(); } catch { await sleep(150); } } return null; }
async function freePort(port, host, timeout = 5000) { const t0 = Date.now(); for (;;) { try { await new Promise((res, rej) => { const s = http.createServer(); s.once('error', rej); s.listen(port, host, () => s.close(() => res(null))); }); return; } catch (e) { if (Date.now() - t0 > timeout) throw new Error('freePort ' + port + ': ' + e.code); await sleep(200); } } }
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); process.exit(130); });

// run one browser leg: startFn returns {client, page}; callFn(page, frame) performs the upload
async function leg(startFn, callFn, probe, rep, multiple = false) {
  served.multiple = multiple;
  const legId = probe + '-' + rep;
  const prof = path.join(SCRATCH, 'legs', legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const args = ['--remote-debugging-port=' + CDP, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900'];
  let client = null, proc = null, page = null, frame = null;
  const o = { probe, rep, chromium: (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim(), browserVersion: null, outcome: null, errName: null, errMessage: null, files: null, events: null, textRead: null, extra: null, runnerError: null };
  try {
  const childUrl = 'http://localhost:' + CHILD + '/child.html?leg=' + legId;
  const parentUrl = 'http://127.0.0.1:' + HTTP + '/parent.html?leg=' + legId;
  curChildUrl = childUrl;
    const started = await startFn({ args, prof });
    client = started.client; proc = started.proc || null; page = started.page;
    o.browserVersion = (await devtoolsVersion())?.Browser ?? null;
    await page.goto(parentUrl, { waitUntil: 'load' });
    await sleep(800);
    frame = page.frames().find((f) => f.url() === childUrl);
    if (!frame) throw new Error('child frame not found');
    try {
      const r = await callFn(frame);
      o.outcome = 'resolved'; if (r !== undefined && r !== null) o.extra = r;
    } catch (e) { o.outcome = 'error'; o.errName = e && e.name ? String(e.name) : null; o.errMessage = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 400); }
    await sleep(400);
    o.files = await frame.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size, f.type]));
    o.events = await frame.evaluate(() => window.__events.slice());
    o.textRead = await frame.evaluate(async () => { const fl = document.getElementById('s').files; if (fl.length !== 1) return { skipped: true, len: fl.length }; try { return ['ok', await fl[0].text()]; } catch (e) { return ['err', String(e && e.name), String(e && e.message)]; } });
    o.byteRead = await frame.evaluate(async () => { const fl = document.getElementById('s').files; if (fl.length !== 1) return { skipped: true, len: fl.length }; try { const ab = await fl[0].arrayBuffer(); return ['ok', ab.byteLength, Array.from(new Uint8Array(ab)).map((b) => b.toString(16).padStart(2, '0')).join('')]; } catch (e) { return ['err', String(e && e.name), String(e && e.message)]; } });
    o.byteRead = await frame.evaluate(async () => { const fl = document.getElementById('s').files; if (fl.length !== 1) return { skipped: true, len: fl.length }; try { const ab = await fl[0].arrayBuffer(); return ['ok', ab.byteLength, Array.from(new Uint8Array(ab)).map((b) => b.toString(16).padStart(2, '0')).join('')]; } catch (e) { return ['err', String(e && e.name), String(e && e.message)]; } });
  } catch (e) { o.runnerError = String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300); }
  finally {
    try { if (client) { if (proc && startedDisconnect) await client.disconnect().catch(() => {}); else await client.close().catch(() => {}); } } catch {}
    if (proc) killGroup(proc.pid);
    for (let i = 0; i < 25; i++) { try { await freePort(CDP, '127.0.0.1'); break; } catch { await sleep(200); } }
  }
  rec(probe, rep, o);
  return o;
}
let startedDisconnect = false;

// starters
const startPuppeteerLaunch = async ({ args, prof }) => { const client = await puppeteer.launch({ executablePath: CHROMIUM, headless: true, userDataDir: prof, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 }); startedDisconnect = false; return { client, page: await client.newPage() }; };
const startPuppeteerLaunchShell = async ({ args, prof }) => { const client = await puppeteer.launch({ executablePath: CHROMIUM, headless: 'shell', userDataDir: prof, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 }); startedDisconnect = false; return { client, page: await client.newPage() }; };
const startPlaywrightLaunch = async ({ args, prof }) => { const client = await pwChromium.launch({ executablePath: CHROMIUM, headless: true, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 }); startedDisconnect = false; return { client, page: await (await client.newContext()).newPage() }; };
const startRunner = async ({ args, prof }) => { const proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + CDP, '--user-data-dir=' + prof, ...args.slice(1), 'about:blank'], { stdio: 'ignore', detached: true }); liveGroups.add(proc.pid); return { proc }; };
const startPuppeteerConnect = async () => { const started = await startRunner({ args: [], prof: path.join(SCRATCH, 'tmp-prof') }); const ver = await devtoolsVersion(); if (!ver) throw new Error('chromium never came up'); const client = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + CDP }); startedDisconnect = true; return { client, proc: started.proc, page: await client.newPage() }; };

// callers
const pupCall = (x) => async (frame) => { const h = await frame.$('#s'); if (!h) throw new Error('child #s handle not found'); await h.uploadFile(x); };
const pwCall = (x) => async (frame) => { await frame.locator('#s').setInputFiles(x, { timeout: 5000 }); };

for (let rep = 1; rep <= 3; rep++) {
  // (a) Puppeteer launch + uploadFile(absent) — phantom like PUR?
  await leg(startPuppeteerLaunch, pupCall(MISSING), 'a-puppeteer-launch-missing', rep);
  // (b) Playwright launch + setInputFiles(absent)
  await leg(startPlaywrightLaunch, pwCall(MISSING), 'b-playwright-launch-missing', rep);
  // (c) Playwright payload, NO mimeType, non-UTF-8 buffer 0x00 0xff 0xfe
  const objC = { name: 'tabi-r98-bin.bin', buffer: Buffer.from([0x00, 0xff, 0xfe]) };
  const rc = await leg(startPlaywrightLaunch, pwCall(objC), 'c-payload-no-mime-nonutf8', rep);
  if (rc.outcome === 'resolved') {
    // byte-faithful read via arrayBuffer on a fresh re-run frame is not possible here; record hex from page
    const hex = await Promise.resolve(null); rec('c-bytes', rep, { note: 'see files type/size; bytes re-read in leg extra needed' });
  }
  // (d) two payload objects on input WITHOUT multiple
  const objD = [ { name: 'tabi-r98-payload-a.txt', mimeType: 'text/plain', buffer: Buffer.from('tabi round 98 payload bytes.\n') }, { name: 'tabi-r98-payload-b.txt', mimeType: 'text/plain', buffer: Buffer.from('tabi round 98 payload bytes.\n') } ];
  await leg(startPlaywrightLaunch, pwCall(objD), 'd-two-payloads-no-multiple', rep);
  // (e) PUR's phantom read with FileReader.readAsArrayBuffer + arrayBuffer()
  const re = await leg(startPuppeteerConnect, pupCall(MISSING), 'e-puppeteer-connect-missing', rep);
  if (re.outcome === 'resolved' && re.files && re.files.length === 1) {
    // re-read the same phantom with the other two readers: need live page, so do it inside a dedicated leg
    await leg(startPuppeteerConnect, async (frame) => { const h = await frame.$('#s'); await h.uploadFile(MISSING); await sleep(400); return await frame.evaluate(async () => { const f = document.getElementById('s').files[0]; const out = { arrayBuffer: null, fileReader: null }; try { const ab = await f.arrayBuffer(); out.arrayBuffer = ['ok', ab.byteLength, Array.from(new Uint8Array(ab)).slice(0, 8)]; } catch (e) { out.arrayBuffer = ['err', String(e && e.name), String(e && e.message)]; } try { out.fileReader = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(['ok', r.result ? r.result.byteLength : null]); r.onerror = () => res(['err', String(r.error && r.error.name), String(r.error && r.error.message)]); r.readAsArrayBuffer(f); }); } catch (e) { out.fileReader = ['err', String(e && e.name), String(e && e.message)]; } return out; }); }, 'e-phantom-readers', rep);
  }
  // (f) Puppeteer launch({headless:'shell'}) — starts? trusted?
  await leg(startPuppeteerLaunchShell, pupCall(ANSWER), 'f-puppeteer-headless-shell', rep);
}
for (const s of servers) s.close();
fs.writeFileSync(OUTP, JSON.stringify({ seat: 'R98Exec3', ports: [HTTP, CHILD, CDP], chromium: (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim(), observations: OBS }, null, 2) + '\n');
console.log(JSON.stringify({ out: OUTP, observations: OBS.length }));
