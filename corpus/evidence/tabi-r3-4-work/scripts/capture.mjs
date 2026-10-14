// TABI-R3-4 no-oral-context executor CDP driver.
// Input: PAGE_WS (page target websocket URL), NAV_URL (data: URL), OUT (evidence dir)
// Sequence: pin viewport -> navigate -> wait-on-state -> capture x2 (idempotence)
//           -> state probes (title/dom/frame) -> synthetic click -> capture #3.
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PAGE_WS = process.env.PAGE_WS;
const NAV_URL = process.env.NAV_URL;
const OUT = process.env.OUT;
if (!PAGE_WS || !NAV_URL || !OUT) { console.error('missing env'); process.exit(2); }

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowStamps = () => {
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const sgn = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  return {
    utc: d.toISOString(),
    local: new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, -1) + sgn + hh + ':' + mm,
  };
};

const ws = new WebSocket(PAGE_WS);
let nextId = 1;
const pending = new Map();
const events = [];

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
  if (m.id) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result);
  } else {
    events.push(m);
  }
});
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const log = { steps: [], artifacts: [] };

async function capture(tag, params) {
  const r = await send('Page.captureScreenshot', params);
  const bytes = Buffer.from(r.data, 'base64');
  const path = `${OUT}/${tag}.png`;
  writeFileSync(path, bytes);
  const rec = { tag, path, sha256: sha(bytes), bytes: bytes.length, params, ...nowStamps() };
  log.artifacts.push(rec);
  return rec;
}

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
  return r.result.value;
}

async function waitPredicate(expr, timeoutMs) {
  const t0 = Date.now();
  for (;;) {
    if (await evalJs(expr)) return Date.now() - t0;
    if (Date.now() - t0 > timeoutMs) throw new Error('wait timeout: ' + expr);
    await sleep(25);
  }
}

try {
  const meta = await send('Browser.getVersion').catch(() => null);
  log.browserVersion = meta;

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Network.enable');

  // Step 1: pin the viewport BEFORE navigation (document: Emulation.setDeviceMetricsOverride)
  const metrics = { width: 800, height: 600, deviceScaleFactor: 1, mobile: false };
  await send('Emulation.setDeviceMetricsOverride', metrics);
  log.steps.push({ step: 'setDeviceMetricsOverride', params: metrics });

  // Step 2: exact navigation input, verbatim
  await send('Page.navigate', { url: NAV_URL });
  log.steps.push({ step: 'Page.navigate', params: { url: NAV_URL } });

  const loadMs = await (async () => {
    const t0 = Date.now();
    for (;;) {
      if (events.some((e) => e.method === 'Page.loadEventFired')) return Date.now() - t0;
      if (Date.now() - t0 > 10000) throw new Error('loadEventFired timeout');
      await sleep(20);
    }
  })();
  const predMs = await waitPredicate(
    "document.readyState==='complete' && document.getElementById('det')!==null", 10000);
  log.steps.push({ step: 'wait-on-state', loadEventMs: loadMs, predicateMs: predMs,
    predicate: "readyState==='complete' && #det present" });

  const urlReadBack = await evalJs('location.href');
  const titleReadBack = await evalJs('document.title');
  const frameTree = await send('Page.getFrameTree');
  const targetInfo = await send('Target.getTargetInfo');
  log.state = {
    urlAsNormalized_readback: urlReadBack,
    urlEqualsNavigatedInput: urlReadBack === NAV_URL,
    documentTitle: titleReadBack,
    frameId: frameTree.frameTree.frame.id,
    targetId: targetInfo.targetInfo.targetId,
    targetUrl: targetInfo.targetInfo.url,
  };
  log.steps.push({ step: 'state probes (Runtime.evaluate location.href/document.title; Page.getFrameTree; Target.getTargetInfo)' });

  // Cross-check: HTTP /json/list title/url vs page-level document.title/location.href
  try {
    const list = await (await fetch('http://127.0.0.1:9232/json/list')).json();
    const mine = list.find((t) => t.id === targetInfo.targetInfo.targetId);
    log.crossCheck_json_list = {
      found: !!mine,
      jsonListTitle: mine && mine.title,
      documentTitle: titleReadBack,
      titlesAgree: !!mine && mine.title === titleReadBack,
      jsonListUrlEqualsReadback: !!mine && mine.url === urlReadBack,
    };
    log.steps.push({ step: 'cross-check: HTTP /json/list vs page document.title/location.href' });
  } catch (e) {
    log.crossCheck_json_list = { error: String(e) };
  }

  // Step 3: capture #1, then idempotence re-capture (~350 ms) — document ladder rung 1
  const c1 = await capture('det-before-c1', { format: 'png', captureBeyondViewport: true });
  await sleep(350);
  const c2 = await capture('det-before-c2', { format: 'png', captureBeyondViewport: true });
  log.steps.push({ step: 'capture x2 + idempotence-check',
    c1: c1.sha256, c2: c2.sha256, identical: c1.sha256 === c2.sha256 });

  // Step 4: DOM node count via DOM.getDocument{depth:-1} + independent second method
  const doc = await send('DOM.getDocument', { depth: -1 });
  let count = 0;
  (function walk(n) { count++; (n.children || []).forEach(walk); })(doc.root);
  const elemCount = await evalJs("document.getElementsByTagName('*').length");
  log.state.domNodeCount = count;
  log.state.domElementCount_secondMethod = elemCount;
  log.state.domCountsAgree = count === elemCount;
  log.steps.push({ step: 'DOM.getDocument {depth:-1} + node count; second method getElementsByTagName("*").length',
    cdpTreeNodeCount: count, jsElementCount: elemCount, agree: count === elemCount });

  // Step 5: action-effect pair — synthetic el.click() then state wait then capture #3
  const beforeText = await evalJs("document.getElementById('live').textContent");
  const clickRet = await evalJs("document.getElementById('mut').click(), 'click-returned'");
  const afterMs = await waitPredicate("document.getElementById('live').textContent==='counter=1'", 5000);
  const afterText = await evalJs("document.getElementById('live').textContent");
  const c3 = await capture('det-after', { format: 'png', captureBeyondViewport: true });
  log.steps.push({ step: 'action-effect pair', beforeText, clickRet, afterText, afterMs,
    before: 'det-before-c1.png', after: c3.sha256, beforeShaOfPair: c1.sha256 });
  log.actionPairDiffers = c1.sha256 !== c3.sha256;

  log.ok = true;
} catch (e) {
  log.ok = false;
  log.error = String(e && e.stack || e);
} finally {
  console.log(JSON.stringify(log, null, 2));
  try { ws.close(); } catch {}
  process.exit(log.ok ? 0 : 1);
}