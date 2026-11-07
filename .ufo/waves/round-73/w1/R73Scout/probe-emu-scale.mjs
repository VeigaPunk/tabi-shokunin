// Probe: does Emulation.setDeviceMetricsOverride without `scale` yield an
// input-events emulation scale of 1 in this Chromium build, and does an
// explicit scale show up as expected?
//
// Read-only w.r.t. the lane: launches its own headless Chromium in scratch,
// own user-data-dir, own loopback ports, own data: URL fixture.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = process.argv[2];
const OUT = process.argv[3];
if (!S || !OUT) { console.error('usage: probe-emu-scale.mjs <scratchdir> <outjson>'); process.exit(2); }
fs.mkdirSync(S, { recursive: true });
const profileDir = path.join(S, 'p');
fs.mkdirSync(profileDir, { recursive: true });

const devPort = 9331 + (process.pid % 400);
const FIXTURE = `data:text/html,<body style="margin:0;height:4000px"><script>
window.__events=[];
addEventListener('wheel',function(e){window.__events.push({dy:e.deltaY,dx:e.deltaX,mode:e.deltaMode});},{passive:true});
</script></body>`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const runXdg = { ...process.env, XDG_RUNTIME_DIR: path.join(S, 'xdg'), HOME: path.join(S, 'home') };
fs.mkdirSync(runXdg.XDG_RUNTIME_DIR, { recursive: true });
fs.mkdirSync(runXdg.HOME, { recursive: true });

const argv = ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'];

const out = { schema: 'r73-scout-emu-scale-probe-v1', startedAt: new Date().toISOString(),
  chromium: '', cdpProduct: '', configs: [], failures: [] };

let child = spawn(argv[0], argv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: runXdg });
let ws = null; const pending = new Map(); let msgId = 0;

async function cleanup() {
  try { if (ws) ws.close(); } catch {}
  if (child?.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
  await sleep(500);
}
process.on('exit', cleanup);

try {
  const v = spawnSync('/usr/bin/chromium', ['--version'], { encoding: 'utf8', timeout: 15000, env: runXdg });
  out.chromium = (v.stdout || '').trim();
  let page = null;
  for (let i = 0; i < 400 && !page; i++) {
    try { const r = await fetch('http://127.0.0.1:' + devPort + '/json/list', { signal: AbortSignal.timeout(1500) }); if (r.ok) page = (await r.json()).find(t => t.type === 'page'); } catch {}
    if (!page) await sleep(150);
  }
  if (!page) throw new Error('no page target');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.t); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++msgId; const t = setTimeout(() => { pending.delete(id); rej(new Error('timeout ' + method)); }, 20000); pending.set(id, { res, rej, t }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };

  const ver = await send('Browser.getVersion');
  out.cdpProduct = ver.result.product;
  await send('Page.enable'); await send('Runtime.enable');

  const CONFIGS = [
    { name: 'no-override', override: null },
    { name: 'override-no-scale', override: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false } },
    { name: 'override-scale-2', override: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false, scale: 2 } },
    { name: 'override-scale-1', override: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false, scale: 1 } },
  ];

  for (const cfg of CONFIGS) {
    await send('Page.navigate', { url: FIXTURE });
    for (let i = 0; i < 60; i++) { try { if (await evalValue('document.readyState === "complete" && Array.isArray(window.__events)')) break; } catch {} await sleep(100); }
    if (cfg.override) await send('Emulation.setDeviceMetricsOverride', cfg.override);
    else await send('Emulation.clearDeviceMetricsOverride');
    await evalValue('window.__events.length = 0');
    // One synthetic wheel: browser-side delta_y = 100 at scale 1.
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 400, y: 300, deltaX: 0, deltaY: 100, modifiers: 0 });
    await sleep(400);
    const events = await evalValue('JSON.stringify(window.__events)');
    const parsed = JSON.parse(events);
    const metrics = await send('Page.getLayoutMetrics');
    out.configs.push({ name: cfg.name, override: cfg.override, events: parsed,
      cssVisualViewportScale: metrics.result?.cssVisualViewport?.scale ?? null,
      dpr: await evalValue('window.devicePixelRatio') });
  }
} catch (e) {
  out.failures.push(String(e && e.stack || e));
} finally {
  await cleanup();
  out.finishedAt = new Date().toISOString();
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
}
process.exit(out.failures.length ? 1 : 0);
