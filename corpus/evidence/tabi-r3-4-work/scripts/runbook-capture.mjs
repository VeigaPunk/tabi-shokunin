// TABI-R3-4 executor — steps 7-12 of the upgraded SKILL.md §Runbook.
// env: PAGE_WS, BASE_URL, VOLATILE_URL, OUT, BROWSER_WS, FIXTURE_SHA, RUN
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const { PAGE_WS, BASE_URL, VOLATILE_URL, OUT, BROWSER_WS, FIXTURE_SHA, RUN } = process.env;
if (!PAGE_WS || !BASE_URL || !OUT) { console.error('missing env'); process.exit(2); }

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamps = () => {
  const d = new Date();
  const off = -d.getTimezoneOffset(), sgn = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  return { utc: d.toISOString(),
    local: new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, -1) + sgn + hh + ':' + mm };
};

const ws = new WebSocket(PAGE_WS);
let nextId = 1;
const pending = new Map();
const events = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id);
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  else events.push(m);
});
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

const log = { run: RUN, steps: [], artifacts: [] };

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function waitPredicate(expr, timeoutMs) {
  const t0 = Date.now();
  for (;;) {
    if (await evalJs(expr)) return Date.now() - t0;
    if (Date.now() - t0 > timeoutMs) throw new Error('wait timeout: ' + expr);
    await sleep(50);
  }
}
const settle = () => evalJs('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)), null)'); // two rAF frames

async function capture(tag) {
  const params = { format: 'png', captureBeyondViewport: true };
  const r = await send('Page.captureScreenshot', params);
  const bytes = Buffer.from(r.data, 'base64');
  writeFileSync(`${OUT}/${tag}.png`, bytes);
  const rec = { tag, file: `${tag}.png`, sha256: sha(bytes), bytes: bytes.length,
    W: bytes.readUInt32BE(16), H: bytes.readUInt32BE(20), method: 'Page.captureScreenshot', params, ...stamps() };
  log.artifacts.push(rec);
  return rec;
}

try {
  // Step 7 — session slot, recorded verbatim
  log.step7_sessionSlot = {
    captureTime: stamps(), browserWS: BROWSER_WS,
    pageWS: PAGE_WS, fixtureSha256: FIXTURE_SHA,
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('DOM.enable'); await send('DOMSnapshot.enable');

  // Step 8 — pin viewport, navigate, wait on state
  const metrics = { width: 800, height: 600, deviceScaleFactor: 1, mobile: false };
  await send('Emulation.setDeviceMetricsOverride', metrics);
  const nav = await send('Page.navigate', { url: BASE_URL });
  await waitPredicate("document.readyState === 'complete'", 8000);
  const hydratedMs = await waitPredicate("document.getElementById('status').textContent === 'hydrated'", 8000);
  await settle();
  const layout = await send('Page.getLayoutMetrics');
  log.step8 = { metrics, navigatedURL: BASE_URL, urlAsReadBack: await evalJs('location.href'),
    navFrameId: nav.frameId, hydratedAfterMs: hydratedMs,
    layoutViewport: { x: layout.cssLayoutViewport.pageX, y: layout.cssLayoutViewport.pageY,
      clientWidth: layout.cssLayoutViewport.clientWidth, clientHeight: layout.cssLayoutViewport.clientHeight },
    twoRafSettle: true };

  // Step 9 — capture, DOM snapshot, cross-check, idempotence
  const c1 = await capture('det-before-c1');
  await sleep(320);
  const c2 = await capture('det-before-c2');
  log.step9_idempotence = { c1: c1.sha256, c2: c2.sha256, identical: c1.sha256 === c2.sha256, gapMs: 320 };

  const snap = await send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
  const S = snap.strings;
  const names = snap.documents[0].nodes.nodeName.map((i) => S[i]);
  const parents = snap.documents[0].nodes.parentIndex;
  const nodeValues = snap.documents[0].nodes.nodeValue.map((i) => (i === -1 ? '' : S[i]));
  const depthOf = (i) => { let d = 0, p = parents[i]; while (p !== -1 && d < 100) { d++; p = parents[p]; } return d; };
  const shapeText = names.map((n, i) => `${n}${nodeValues[i] ? '|' + nodeValues[i] : ''}`).join('\n');
  const struct = names.map((n, i) => `${depthOf(i)}:${n}`).join('\n');
  const pseudo = names.filter((n) => n.startsWith('::'));
  log.step9_domSnapshot = {
    nodeCount: names.length, pseudoElementCount: pseudo.length, pseudoNames: [...new Set(pseudo)],
    shapeTextSha256: sha(Buffer.from(shapeText)), structSha256: sha(Buffer.from(struct)),
    shapeTextLines: shapeText.split('\n').length, structLines: struct.split('\n').length,
    valuesAreStringIndices: true, sampleResolved: names.slice(0, 8),
  };
  const elemCount = await evalJs("document.getElementsByTagName('*').length");
  log.step9_secondCountMethod = { jsElementCount: elemCount, cdpSnapshotNodeCount: names.length, agree: elemCount === names.length };

  const docTitle = await evalJs('document.title');
  const list = await (await fetch('http://127.0.0.1:19412/json/list')).json();
  const mine = list.find((t) => t.title === docTitle && t.type === 'page');
  log.step9_crossCheck = { jsonListTitle: mine && mine.title, documentTitle: docTitle,
    titlesAgree: !!mine && mine.title === docTitle, matchedByUrlTitleNotId: true,
    jsonListUrl: mine && mine.url };

  // Step 10 — real input, then state-wait, then the after capture
  const rect = await evalJs("(() => { const r = document.getElementById('btn').getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height}; })()");
  const cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2;
  const clickParams = { x: cx, y: cy, button: 'left', clickCount: 1 };
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...clickParams });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...clickParams });
  const afterStateMs = await waitPredicate(
    "document.getElementById('count').textContent === '1' && document.querySelectorAll('#list li').length === 1 && document.getElementById('confirm-1') !== null", 8000);
  await settle();
  const c3 = await capture('det-after');
  log.step10_interaction = { rect, dispatchCenter: { x: cx, y: cy }, clickParams,
    afterStateMs, countText: await evalJs("document.getElementById('count').textContent"),
    liCount: await evalJs("document.querySelectorAll('#list li').length"),
    confirmPresent: await evalJs("!!document.getElementById('confirm-1')"),
    beforeSha: c1.sha256, afterSha: c3.sha256, pairDiffers: c1.sha256 !== c3.sha256 };

  const snapAfter = await send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
  const AN = snapAfter.documents[0].nodes.nodeName.map((i) => snapAfter.strings[i]);
  const aParents = snapAfter.documents[0].nodes.parentIndex;
  const aDepth = (i) => { let d = 0, p = aParents[i]; while (p !== -1 && d < 100) { d++; p = aParents[p]; } return d; };
  const structAfter = AN.map((n, i) => `${aDepth(i)}:${n}`).join('\n');
  const pseudoAfter = AN.filter((n) => n.startsWith('::'));
  log.step10_shapeDelta = { before: names.length, after: AN.length,
    delta: AN.length - names.length,
    pseudoBefore: pseudo.length, pseudoAfter: pseudoAfter.length,
    pseudoNamesAfter: [...new Set(pseudoAfter)],
    structAfterSha256: sha(Buffer.from(structAfter)),
    beforeStructSha256: sha(Buffer.from(struct)),
    structChanged: sha(Buffer.from(structAfter)) !== sha(Buffer.from(struct)) };

  // Step 12 — keep the differing pair (volatile class)
  if (VOLATILE_URL) {
    await send('Page.navigate', { url: VOLATILE_URL });
    await waitPredicate("document.readyState === 'complete'", 8000);
    await waitPredicate("document.getElementById('status').textContent === 'hydrated'", 8000);
    await settle();
    const n1 = await capture('nondet-c1');
    const clock1 = await evalJs("document.getElementById('clock').textContent");
    await sleep(320);
    const n2 = await capture('nondet-c2');
    const clock2 = await evalJs("document.getElementById('clock').textContent");
    log.step12_volatile = { url: VOLATILE_URL, c1: n1.sha256, c2: n2.sha256, identical: n1.sha256 === n2.sha256,
      clock1, clock2, clockMoved: clock1 !== clock2 };
  }
  log.ok = true;
} catch (e) {
  log.ok = false;
  log.error = String((e && e.stack) || e);
} finally {
  console.log(JSON.stringify(log, null, 2));
  try { ws.close(); } catch {}
  process.exit(log.ok ? 0 : 1);
}