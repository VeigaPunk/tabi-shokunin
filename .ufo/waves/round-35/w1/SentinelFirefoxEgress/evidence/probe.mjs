// Scratch-only probe: same geckodriver recipe as the counter's live leg, plus candidate prefs.
// Reports the loopback fixture still works and lets strace count non-loopback connects.
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const [clone, label, prefsJson] = process.argv.slice(2);
const prefs = JSON.parse(prefsJson || '{}');
const gate = await import(pathToFileURL(`${clone}/scripts/check-bidi-runtime.mjs`).href);
const SCRATCH = process.env.TMPDIR;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const scratch = mkdtempSync(join(SCRATCH, `probe-${label}-`));
const home = join(scratch, 'home');
for (const d of ['.config', '.cache', '.local/share', '.local/state', '../tmp', '../profiles']) mkdirSync(join(home, d), { recursive: true });
const fx = await gate.serveFixture();
const port = await freePort(); const wsPort = await freePort();
const env = { PATH: process.env.PATH, HOME: home, TMPDIR: join(scratch, 'tmp'), XDG_CONFIG_HOME: join(home, '.config'), XDG_CACHE_HOME: join(home, '.cache'), XDG_DATA_HOME: join(home, '.local/share'), XDG_STATE_HOME: join(home, '.local/state'), MOZ_HEADLESS: '1', LC_ALL: 'C.UTF-8' };
const gd = spawn('/home/vgpnk/.local/bin/geckodriver', ['--port', String(port), '--websocket-port', String(wsPort), '--binary', '/home/vgpnk/.local/opt/firefox-158.0.1/firefox', '--profile-root', join(scratch, 'profiles')], { stdio: 'ignore', env });
const out = { label, prefs, fixtureOk: false, text: null, port, wsPort };
try {
  let body = null;
  for (let k = 0; k < 50 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: 'firefox', webSocketUrl: true, unhandledPromptBehavior: 'ignore', 'moz:firefoxOptions': { args: ['-headless'], prefs } } } }) });
      body = await r.json();
    } catch { await sleep(200); }
  }
  if (!body?.value?.capabilities) throw new Error(`session failed: ${JSON.stringify(body?.value).slice(0, 200)}`);
  out.caps = { browserVersion: body.value.capabilities.browserVersion, webSocketUrl: body.value.capabilities.webSocketUrl };
  const sid = body.value.sessionId;
  const ws = new WebSocket(body.value.capabilities.webSocketUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws open failed')); });
  let id = 0; const pend = new Map(); const evs = [];
  ws.onmessage = (m) => { const f = JSON.parse(String(m.data)); if (f.id && pend.has(f.id)) { pend.get(f.id)(f); pend.delete(f.id); } else if (f.method) evs.push(f); };
  const send = (method, params = {}) => new Promise((res) => { id += 1; pend.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  await send('session.subscribe', { events: ['network.beforeRequestSent', 'network.responseCompleted'] });
  const ctx = (await send('browsingContext.getTree', {})).result.contexts[0].context;
  const nav = await send('browsingContext.navigate', { context: ctx, url: `${fx.base}/a.html`, wait: 'complete' });
  const ev = await send('script.evaluate', { expression: 'document.getElementById("h").textContent', awaitPromise: false, target: { context: ctx } });
  out.text = ev.result?.result?.value ?? null;
  out.fixtureOk = nav.result?.navigation !== undefined || out.text !== null;
  out.status = nav.result?.navigation;
  out.liveProfilePrefs = (() => {
    try {
      for (const d of readdirSync(join(scratch, 'profiles'))) {
        const pp = join(scratch, 'profiles', d, 'prefs.js');
        if (existsSync(pp)) {
          out.liveProfile = d;
          return readFileSync(pp, 'utf8').split('\n').filter((l) => /network\.(proxy|dns|trr)|services\.settings|browser\.startup\.homepage|remote_settings/.test(l));
        }
      }
    } catch (e) { return String(e.message); }
    return 'no profile found';
  })();
  // linger longer than the frozen live leg (2.0-4.0s) so startup services would fire
  await sleep(5000);
  out.nonLoopRequests = evs.map((e) => e.params?.request?.url || e.params?.url).filter((u) => u && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(u));
  ws.close();
  await fetch(`http://127.0.0.1:${port}/session/${sid}`, { method: 'DELETE' }).catch(() => {});
} catch (e) { out.error = String(e.message || e); }
finally {
  gd.kill('SIGTERM'); await fx.close(); await sleep(400);
  out.scratch = scratch; out.scratchRemoved = process.env.PROBE_KEEP ? false : (() => { try { rmSync(scratch, { recursive: true, force: true }); return true; } catch { return false; } })();
  console.log(JSON.stringify(out, null, 1));
}
