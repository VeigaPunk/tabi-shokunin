import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import { chromium } from 'playwright-core';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [HP, CP, DP] = [33101, 33102, 33103];
const S = '/fast/scratch/hyaku/tabi-r96/deps/probe';
fs.mkdirSync(S, { recursive: true });
const ans = path.join(S, 'a.txt'); fs.writeFileSync(ans, 'tabi round 96 answer.\n');
let childUrl;
const child = `<!doctype html><body><input type="file" id="s" style="position:absolute;left:30px;top:40px;width:160px;height:50px"><script>window.__clicks=[];addEventListener('click',e=>__clicks.push([e.target.id,e.isTrusted]),true);</script></body>`;
http.createServer((q, r) => { r.setHeader('content-type', 'text/html'); r.end(`<!doctype html><body><input type=file id=pp><iframe id=c src="${childUrl}" style="position:absolute;left:120px;top:90px;width:500px;height:300px;border:0"></iframe></body>`); }).listen(HP, '127.0.0.1');
http.createServer((q, r) => { r.setHeader('content-type', 'text/html'); r.end(child); }).listen(CP, '127.0.0.1');
async function leg(lib, host, witness) {
  childUrl = `http://${host}:${CP}/child.html`;
  const prof = fs.mkdtempSync(path.join(S, 'p-'));
  const proc = spawn('/usr/bin/chromium', ['--headless=new', '--remote-debugging-port=' + DP, '--user-data-dir=' + prof, '--no-first-run', 'about:blank'], { stdio: 'ignore', detached: true });
  const out = { lib, host, witness };
  try {
    let ver; for (let i = 0; i < 40 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${DP}/json/version`)).json(); } catch { await sleep(150); } }
    if (lib === 'pp') {
      const b = await puppeteer.connect({ browserURL: `http://127.0.0.1:${DP}` });
      const page = await b.newPage();
      await page.goto(`http://127.0.0.1:${HP}/parent.html`, { waitUntil: 'load' });
      await sleep(500);
      const fr = page.frames().find((f) => f.url().startsWith(childUrl));
      out.frames = page.frames().map((f) => f.url());
      const tl = (await (await fetch(`http://127.0.0.1:${DP}/json/list`)).json()).map((t) => t.type);
      out.jsonList = tl;
      let wev = [];
      if (witness) {
        const ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
        let id = 0; const pend = new Map();
        ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else if (d.method === 'Page.fileChooserOpened') wev.push(d.params); };
        const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify(sessionId ? { id: i, method, params, sessionId } : { id: i, method, params })); });
        const t = (await send('Target.getTargets')).result.targetInfos.filter((x) => x.type === 'iframe');
        out.wIframes = t.length;
        if (t.length) { const sid = (await send('Target.attachToTarget', { targetId: t[0].targetId, flatten: true })).result.sessionId; await send('Page.enable', {}, sid); out.wIntercept = await send('Page.setInterceptFileChooserDialog', { enabled: true }, sid); }
      }
      const p = page.waitForFileChooser({ timeout: 3000 });
      await fr.click('#s');
      try { const ch = await p; out.outcome = 'chooser'; await ch.accept([ans]); } catch (e) { out.outcome = 'error'; out.err = String(e.message); out.errName = e.name; }
      await sleep(300);
      out.childFiles = await fr.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size]));
      out.clicks = await fr.evaluate(() => __clicks);
      out.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
      out.witness = wev;
      await b.disconnect();
    } else {
      const b = await chromium.connectOverCDP(`http://127.0.0.1:${DP}`);
      const ctx = b.contexts()[0];
      const page = await ctx.newPage();
      await page.goto(`http://127.0.0.1:${HP}/parent.html`, { waitUntil: 'load' });
      await sleep(500);
      const fr = page.frames().find((f) => f.url().startsWith(childUrl));
      out.frames = page.frames().map((f) => f.url());
      const p = page.waitForEvent('filechooser', { timeout: 3000 });
      await fr.click('#s');
      try { const ch = await p; out.outcome = 'chooser'; out.multiple = ch.isMultiple(); out.sameFrame = ch.element() ? (await ch.element().evaluate((e) => e.id)) : null; await ch.setFiles(ans); } catch (e) { out.outcome = 'error'; out.err = String(e.message).slice(0, 200); out.errName = e.name; }
      await sleep(300);
      out.childFiles = await fr.evaluate(() => Array.from(document.getElementById('s').files, (f) => [f.name, f.size]));
      out.clicks = await fr.evaluate(() => __clicks);
      out.parentFiles = await page.evaluate(() => Array.from(document.getElementById('pp').files, (f) => [f.name, f.size]));
      await b.close().catch(() => {});
    }
  } catch (e) { out.fatal = String(e.stack).slice(0, 400); }
  try { process.kill(-proc.pid, 'SIGKILL'); } catch {}
  await sleep(300);
  return out;
}
const res = [];
for (const [lib, host, w] of [['pp', 'localhost', false], ['pp', 'localhost', true], ['pp', '127.0.0.1', false], ['pw', 'localhost', false], ['pw', '127.0.0.1', false]]) { res.push(await leg(lib, host, w)); console.log(JSON.stringify(res.at(-1))); }
process.exit(0);
