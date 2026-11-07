// Probe 2: does the page-scale half of the S183 chain hold on this host?
// Emulation.setPageScaleFactor changes the visual-viewport page scale; the
// claim under test is DOM |deltaY| == |delta_y| / (pageScale * emulationScale)
// / devicePixelRatio, so a page scale of 2 must halve the DOM deltaY.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = process.argv[2];
const OUT = process.argv[3];
if (!S || !OUT) { console.error('usage: probe-page-scale.mjs <scratchdir> <outjson>'); process.exit(2); }
fs.mkdirSync(S, { recursive: true });
const profileDir = path.join(S, 'p');
fs.mkdirSync(profileDir, { recursive: true });

const devPort = 9731 + (process.pid % 300);
const FIXTURE = `data:text/html,<body style="margin:0;height:4000px"><script>
window.__events=[];
addEventListener('wheel',function(e){window.__events.push({dy:e.deltaY,mode:e.deltaMode});},{passive:true});
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

const out = { schema: 'r73-scout-page-scale-probe-v1', startedAt: new Date().toISOString(),
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  for (const ps of [1, 2, 4]) {
    await send('Page.navigate', { url: FIXTURE });
    for (let i = 0; i < 60; i++) { try { if (await evalValue('document.readyState === "complete" && Array.isArray(window.__events)')) break; } catch {} await sleep(100); }
    await send('Emulation.setPageScaleFactor', { pageScaleFactor: ps });
    await sleep(300);
    const pageScale = await evalValue('window.visualViewport.scale');
    await evalValue('window.__events.length = 0');
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 400, y: 300, deltaX: 0, deltaY: 100, modifiers: 0 });
    await sleep(400);
    const events = JSON.parse(await evalValue('JSON.stringify(window.__events)'));
    const metrics = await send('Page.getLayoutMetrics');
    out.configs.push({ pageScaleFactorRequested: ps, pageScaleAtDispatch: pageScale, events,
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
