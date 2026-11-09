// Probe: which layer throws the ENOENT for an absent path under
// Playwright connectOverCDP(url, {isLocal: true})?  Prints the error stack.
// Own scratch, own ports (33694 http, 33695 child, 33696 cdp).
import fs from 'node:fs';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const DEPS = '/fast/scratch/hyaku/tabi-r98/R98Scribe/deps';
const SCRATCH = '/fast/scratch/hyaku/tabi-r98/R98Scribe/probe';
const HTTP = 33694, CHILD = 33695, CDP = 33696;
const req = createRequire(DEPS + '/package.json');
const { chromium } = req('playwright-core');

fs.mkdirSync(SCRATCH, { recursive: true });
process.env.TMPDIR = SCRATCH + '/t';
fs.mkdirSync(process.env.TMPDIR, { recursive: true });

const childHtml = `<!doctype html><html><body><input type="file" id="s"></body></html>`;
const parentHtml = `<!doctype html><html><body><input type="file" id="pp"><iframe id="c" src="http://localhost:${CHILD}/child.html"></iframe></body></html>`;
const serve = (port, handler) => new Promise((res) => { const s = http.createServer(handler); s.listen(port, '127.0.0.1', () => res(s)); });
const s1 = await serve(HTTP, (q, r) => { r.setHeader('content-type', 'text/html'); r.end(parentHtml); });
const s2 = await serve(CHILD, (q, r) => { r.setHeader('content-type', 'text/html'); r.end(childHtml); });

const profile = SCRATCH + '/profile';
const proc = spawn('/usr/bin/chromium', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=' + CDP, '--user-data-dir=' + profile], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 100; i++) {
  try { await fetch('http://127.0.0.1:' + CDP + '/json/version'); break; } catch { await sleep(100); }
}
const missing = SCRATCH + '/tabi-r98-missing.txt';
fs.rmSync(missing, { force: true });

const browser = await chromium.connectOverCDP('http://127.0.0.1:' + CDP, { isLocal: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:' + HTTP + '/parent.html');
const frame = page.frames().find((f) => f.url().includes('localhost:' + CHILD));
const loc = frame.locator('#s');
try {
  await loc.setInputFiles(missing, { timeout: 5000 });
  console.log('RESOLVED (no error)');
} catch (e) {
  console.log('ERR name:', e.name);
  console.log('ERR message:', e.message);
  console.log('STACK:\n' + String(e.stack).split('\n').slice(0, 25).join('\n'));
}
await browser.close().catch(() => {});
try { process.kill(-proc.pid, 'SIGKILL'); } catch { try { proc.kill('SIGKILL'); } catch {} }
s1.close(); s2.close();
process.exit(0);
