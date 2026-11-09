// tabi r97 pre-freeze probe (ad hoc, not the driver): uploadFile / setInputFiles on a cross-site and
// same-site iframe file input, Puppeteer 25.16.0 and Playwright 1.65.0 connected over CDP.
import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path';
import { spawn } from 'node:child_process'; import { createRequire } from 'node:module';
const deps = '/fast/scratch/hyaku/tabi-r97/deps';
const req = createRequire(path.join(deps, 'package.json'));
const puppeteer = (await import(req.resolve('puppeteer-core'))).default;
const pw = req('playwright-core').chromium;
const S = '/fast/scratch/hyaku/tabi-r97/l1/probe'; fs.mkdirSync(S, { recursive: true });
const ans = path.join(S, 'tabi-r97-answer.txt'); fs.writeFileSync(ans, 'tabi round 97 answer.\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const child = `<!doctype html><input type=file id=s><script>window.__ev=[];for(const t of ['input','change','click'])document.getElementById('s').addEventListener(t,e=>window.__ev.push([e.type,e.isTrusted,e.bubbles,e.composed]));</script>`;
let cu; const servers = [];
const srv = (p, h) => new Promise((r) => { const s = http.createServer(h); servers.push(s); s.listen(p, '127.0.0.1', r); });
await srv(31901, (q, r) => { r.setHeader('content-type', 'text/html'); r.end(`<!doctype html><input type=file id=pp><iframe src="${cu}"></iframe>`); });
await srv(31902, (q, r) => { r.setHeader('content-type', 'text/html'); r.end(child); });
const out = [];
for (const [lib, host, mode] of [['pp', 'localhost', 'set'], ['pp', '127.0.0.1', 'set'], ['pp', 'localhost', 'clear'], ['pp', 'localhost', 'missing'], ['pw', 'localhost', 'set'], ['pw', '127.0.0.1', 'set'], ['pw', 'localhost', 'clear'], ['pw', 'localhost', 'missing']]) {
  cu = `http://${host}:31902/c.html`;
  const prof = path.join(S, 'p-' + out.length);
  const pr = spawn('/usr/bin/chromium', ['--headless=new', '--remote-debugging-port=31903', '--user-data-dir=' + prof, 'about:blank'], { stdio: 'ignore', detached: true });
  let v; for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch('http://127.0.0.1:31903/json/version')).json(); } catch { await sleep(150); } }
  const rec = { lib, host, mode };
  try {
    let b, page;
    if (lib === 'pp') { b = await puppeteer.connect({ browserURL: 'http://127.0.0.1:31903' }); page = await b.newPage(); }
    else { b = await pw.connectOverCDP('http://127.0.0.1:31903'); page = await b.contexts()[0].newPage(); }
    await page.goto('http://127.0.0.1:31901/p.html', { waitUntil: 'load' }); await sleep(600);
    const f = page.frames().find((x) => x.url() === cu);
    try {
      if (lib === 'pp') { const h = await f.$('#s'); if (mode === 'missing') await h.uploadFile(path.join(S, 'nope.txt')); else { await h.uploadFile(ans); if (mode === 'clear') await h.uploadFile(); } }
      else { const l = f.locator('#s'); if (mode === 'missing') await l.setInputFiles(path.join(S, 'nope.txt')); else { await l.setInputFiles(ans); if (mode === 'clear') await l.setInputFiles([]); } }
      rec.ok = true;
    } catch (e) { rec.err = [e.name, String(e.message).split('\n')[0]]; }
    await sleep(300);
    rec.files = await f.evaluate(() => Array.from(document.getElementById('s').files, (x) => [x.name, x.size]));
    rec.ev = await f.evaluate(() => window.__ev);
    rec.pp = await page.evaluate(() => Array.from(document.getElementById('pp').files, (x) => [x.name, x.size]));
    if (lib === 'pp') await b.disconnect(); else await b.close();
  } catch (e) { rec.fatal = String(e.message); }
  try { process.kill(-pr.pid, 'SIGKILL'); } catch {}
  await sleep(300);
  out.push(rec); console.log(JSON.stringify(rec));
}
for (const s of servers) s.close();
fs.rmSync(S, { recursive: true, force: true });
