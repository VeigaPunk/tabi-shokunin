// R100Revenger minimal protocol probe: one rep each of DUP3, EMPTY1, MIXED, LAUNCH2PL, LAUNCH2PU, DIR
// Ports 34151 (http), 34152 (child), 34153 (cdp). Own script; fixture shape mirrors the frozen driver.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = '/fast/scratch/hyaku/tabi-r100/R100Revenger';
const SCRATCH = path.join(ROOT, 'probe');
const DEPS = path.join(ROOT, 'deps');
const HTTP_PORT = 34151, CHILD_PORT = 34152, CDP_PORT = 34153;
const CHROMIUM = '/usr/bin/chromium';
const ARM = process.argv[2];

process.env.TMPDIR = path.join(ROOT, 't');
fs.mkdirSync(path.join(ROOT, 't'), { recursive: true });
fs.mkdirSync(SCRATCH, { recursive: true });

const req = createRequire(path.join(DEPS, 'package.json'));
const puppeteer = req('puppeteer-core');
const { chromium: pwChromium } = req('playwright-core');

const FILE_A = { name: 'tabi-r100-a.txt', text: 'tabi round 100 file a.\n' };
const FILE_B = { name: 'tabi-r100-b.txt', text: 'tabi round 100 file b, second.\n' };
const DUP1 = { name: 'dup.txt', text: 'same-name first file\n' };
const DUP2 = { name: 'dup.txt', text: 'same-name second file\n' };
const DUP3 = { name: 'other.txt', text: 'other file\n' };
const EMPTY = { name: 'tabi-r100-empty.txt', mimeType: 'text/plain' };
const P1 = { name: 'tabi-r100-p1.txt', mimeType: 'text/plain', text: 'tabi round 100 payload one.\n' };

const pathA = path.join(SCRATCH, FILE_A.name);
const pathB = path.join(SCRATCH, FILE_B.name);
fs.writeFileSync(pathA, FILE_A.text);
fs.writeFileSync(pathB, FILE_B.text);
const dirPath = path.join(SCRATCH, 'probe-dir');
fs.mkdirSync(path.join(dirPath, 'sub'), { recursive: true });
fs.writeFileSync(path.join(dirPath, 'one.txt'), 'dir file one\n');
fs.writeFileSync(path.join(dirPath, 'sub', 'two.txt'), 'dir file two\n');

const childHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>child</title></head><body><input type="file" id="s"><input type="file" id="m" multiple><input type="file" id="d" webkitdirectory><script>
window.__events = [];
for (const id of ['s','m','d']) for (const t of ['input','change','click']) document.getElementById(id).addEventListener(t, function(e){ window.__events.push([id, e.type, e.isTrusted]); });
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>parent</title></head><body><input type="file" id="pp"><iframe id="c" src="${childUrl}"></iframe></body></html>`;

let currentChildUrl = null;
const servers = [];
const serve = (port, handler) => new Promise((resolve) => { const s = http.createServer(handler); servers.push(s); s.listen(port, '127.0.0.1', resolve); });
const childUrl = `http://localhost:${CHILD_PORT}/child.html?leg=${ARM}-1`;
const parentUrl = `http://127.0.0.1:${HTTP_PORT}/parent.html?leg=${ARM}-1`;
currentChildUrl = childUrl;
await serve(HTTP_PORT, (q, r) => { r.setHeader('content-type', 'text/html'); r.end(parentHtml(currentChildUrl)); });
await serve(CHILD_PORT, (q, r) => { r.setHeader('content-type', 'text/html'); r.end(childHtml()); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ARMS = {
  DUP3: { lib: 'playwright', mode: 'connect', isLocal: false, target: 'm' },
  EMPTY1: { lib: 'playwright', mode: 'connect', isLocal: false, target: 'm' },
  MIXED: { lib: 'playwright', mode: 'connect', isLocal: true, target: 'm' },
  LAUNCH2PL: { lib: 'playwright', mode: 'launch', isLocal: null, target: 'm' },
  LAUNCH2PU: { lib: 'puppeteer', mode: 'launch', isLocal: null, target: 'm' },
  DIR: { lib: 'playwright', mode: 'connect', isLocal: true, target: 'd' },
};
const a = ARMS[ARM];
if (!a) { console.error('unknown arm'); process.exit(2); }
function callInput() {
  if (ARM === 'DUP3') return [{ name: DUP1.name, mimeType: 'text/plain', buffer: Buffer.from(DUP1.text) }, { name: DUP2.name, mimeType: 'text/plain', buffer: Buffer.from(DUP2.text) }, { name: DUP3.name, mimeType: 'text/plain', buffer: Buffer.from(DUP3.text) }];
  if (ARM === 'EMPTY1') return [{ name: EMPTY.name, mimeType: EMPTY.mimeType, buffer: Buffer.alloc(0) }];
  if (ARM === 'MIXED') return [pathA, { name: P1.name, mimeType: P1.mimeType, buffer: Buffer.from(P1.text) }];
  if (ARM === 'LAUNCH2PL' || ARM === 'LAUNCH2PU') return [pathA, pathB];
  if (ARM === 'DIR') return [dirPath];
}
const BASE_ARGS = ['--no-first-run', '--no-default-browser-check', '--window-size=1280,900'];
const prof = path.join(SCRATCH, 'leg-' + ARM, 'profile');
fs.mkdirSync(prof, { recursive: true });
let proc = null, client = null, result = {};
try {
  let page, frame;
  if (a.mode === 'launch') {
    const args = ['--remote-debugging-port=' + CDP_PORT, ...BASE_ARGS];
    if (a.lib === 'puppeteer') client = await puppeteer.launch({ executablePath: CHROMIUM, headless: true, userDataDir: prof, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
    else client = await pwChromium.launch({ executablePath: CHROMIUM, headless: true, args, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false, timeout: 30000 });
    if (a.lib === 'puppeteer') { page = await client.newPage(); } else { const ctx = await client.newContext(); page = await ctx.newPage(); }
  } else {
    proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + prof, ...BASE_ARGS, 'about:blank'], { stdio: 'ignore', detached: true });
    for (let i = 0; i < 100; i++) { try { await (await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version')).json(); break; } catch { await sleep(150); } }
    client = a.isLocal ? await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT, { isLocal: true }) : await pwChromium.connectOverCDP('http://127.0.0.1:' + CDP_PORT);
    page = client.contexts()[0] && client.contexts()[0].pages()[0] ? client.contexts()[0].pages()[0] : await client.contexts()[0].newPage();
  }
  await page.goto(parentUrl, { waitUntil: 'load' });
  await sleep(800);
  frame = page.frames().find((f) => f.url() === childUrl);
  if (!frame) throw new Error('child frame not found: ' + page.frames().map((f) => f.url()).join(' '));
  const input = callInput();
  try {
    if (a.lib === 'puppeteer') { const h = await frame.$('#' + a.target); await h.uploadFile(...input); }
    else await frame.locator('#' + a.target).setInputFiles(input.length === 1 ? input[0] : input, { timeout: 5000 });
    result.outcome = 'resolved';
  } catch (e) { result.outcome = 'error'; result.errName = String(e && e.name); result.errMessage = String(e && e.message).split('\n')[0].slice(0, 300); }
  await sleep(400);
  result.files = await frame.evaluate(() => Object.fromEntries(['s', 'm', 'd'].map((id) => [id, Array.from(document.getElementById(id).files, (f) => [f.name, f.size, f.type, f.webkitRelativePath])])));
  result.events = await frame.evaluate(() => window.__events.slice());
  console.log(JSON.stringify({ arm: ARM, ...result }));
} catch (e) {
  console.log(JSON.stringify({ arm: ARM, outcome: 'leg-error', message: String(e && e.message).split('\n')[0].slice(0, 300) }));
} finally {
  try { if (client) { if (a.mode === 'connect') client.close(); else await client.close(); } } catch {}
  if (proc) { try { process.kill(-proc.pid, 'SIGKILL'); } catch {} }
  for (const s of servers) s.close();
  setTimeout(() => process.exit(0), 200);
}
