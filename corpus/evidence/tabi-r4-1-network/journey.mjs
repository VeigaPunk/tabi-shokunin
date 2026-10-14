#!/usr/bin/env node
// TABI-R4-1 — network-rung journey runner. Extends the TABI-R3-1 journey (index -> detail ->
// form -> confirm; all four pages keep their round-3 fixture bytes unchanged) with:
//   (a) full CDP Network domain capture: request/response/timing/byte-count/cache events,
//       responseReceivedExtraInfo (wire status for revalidations), Network.getResponseBody
//       content reads kept next to the authored fixture bytes (--site);
//   (b) a new page async.html (async-XHR step): click -> XHR -> render (capture pair + race probe),
//       and a constructed optimistic-UI step (POST the wire answers 501 while the DOM keeps
//       rendering success) to exhibit DOM/network disagreement.
// Usage: node journey.mjs --cdp=<port> --base=<http://127.0.0.1:PORT> --out=<dir> --site=<dir>
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (!m) throw new Error(`bad arg ${a}`);
  args[m[1]] = m[2];
}
const { cdp, base, out, site } = args;
if (!cdp || !base || !out || !site) throw new Error('usage: --cdp --base --out --site');
const cdpBase = `http://127.0.0.1:${cdp}`;
const pathOf = (u) => {
  try {
    const x = new URL(u);
    return x.pathname + (x.search || '');
  } catch {
    return u;
  }
};

const record = {
  base,
  startedAtUTC: new Date().toISOString(),
  captures: [],
  actions: [],
  netEvents: [],
  netDomain: { cacheDisabledSent: false, getResponseBodyAtUTC: null },
  history: null,
};

const j = async (path) => (await fetch(cdpBase + path)).json();
const version = await j('/json/version');
record.browser = {
  browser: version.Browser,
  protocolVersion: version['Protocol-Version'],
  userAgent: version.UserAgent,
};

record.fixtures = [];
for (const f of readdirSync(site).sort()) {
  const b = readFileSync(join(site, f));
  record.fixtures.push({ file: f, bytes: b.length, sha256: createHash('sha256').update(b).digest('hex') });
}

const list0 = await j('/json/list');
const page = list0.find((t) => t.type === 'page');
if (!page) throw new Error('no page target');
record.targetLaunch = { id: page.id, url: page.url, title: page.title, listAtUTC: new Date().toISOString() };

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = () => res(); ws.onerror = () => rej(new Error('ws error')); });

let nextId = 1;
const pending = new Map();
const netOrder = [];
const netById = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    return;
  }
  const p = msg.params || {};
  if (msg.method === 'Network.requestWillBeSent') {
    const e = {
      requestId: p.requestId,
      method: p.request.method,
      url: p.request.url,
      type: p.type,
      initiator: p.initiator ? { type: p.initiator.type, url: p.initiator.url ? pathOf(p.initiator.url) : null } : null,
      postDataBytes: typeof p.request.postData === 'string' ? Buffer.byteLength(p.request.postData, 'utf8') : 0,
      requestHeadersN: p.request.headers ? Object.keys(p.request.headers).length : 0,
      wallTime: p.wallTime ?? null,
      ts: p.timestamp,
      startedAtUTC: new Date().toISOString(),
      status: null,
      finished: false,
      failed: null,
      servedFromCache: false,
    };
    netOrder.push(e);
    netById.set(e.requestId, e);
  } else if (msg.method === 'Network.requestServedFromCache') {
    const e = netById.get(p.requestId);
    if (e) e.servedFromCache = true;
  } else if (msg.method === 'Network.responseReceivedExtraInfo') {
    const e = netById.get(p.requestId);
    if (e) {
      e.extraInfo = { statusCode: p.statusCode, headersN: p.headers ? Object.keys(p.headers).length : 0, atUTC: new Date().toISOString() };
    }
  } else if (msg.method === 'Network.responseReceived') {
    const e = netById.get(p.requestId);
    if (e) {
      const r = p.response;
      e.status = r.status;
      e.statusText = r.statusText;
      e.mimeType = r.mimeType;
      e.protocol = r.protocol;
      e.fromDiskCache = r.fromDiskCache === true;
      e.fromMemoryCache = r.fromMemoryCache === true;
      e.fromServiceWorker = r.fromServiceWorker === true;
      e.fromPrefetchCache = r.fromPrefetchCache === true;
      const cl = r.headers ? r.headers['Content-Length'] ?? r.headers['content-length'] : undefined;
      e.contentLength = cl !== undefined ? Number(cl) : null;
      e.respEncodedLength = typeof r.encodedDataLength === 'number' ? r.encodedDataLength : null;
      e.responseTime = r.responseTime ?? null;
      e.timing = r.timing || null;
      e.respAtUTC = new Date().toISOString();
    }
  } else if (msg.method === 'Network.dataReceived') {
    const e = netById.get(p.requestId);
    if (e) {
      e.dataEvents = (e.dataEvents || 0) + 1;
      e.dataLength = (e.dataLength || 0) + p.dataLength;
      e.dataEncoded = (e.dataEncoded || 0) + p.encodedDataLength;
    }
  } else if (msg.method === 'Network.loadingFinished') {
    const e = netById.get(p.requestId);
    if (e) {
      e.finished = true;
      e.totalEncodedLength = p.encodedDataLength;
      e.finishedTs = p.timestamp;
      e.finishedAtUTC = new Date().toISOString();
    }
  } else if (msg.method === 'Network.loadingFailed') {
    const e = netById.get(p.requestId);
    if (e) {
      e.failed = p.errorText;
      e.canceled = p.canceled === true;
      e.blockedReason = p.blockedReason || null;
      e.failedAtUTC = new Date().toISOString();
    }
  }
};

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const evalJS = async (expression, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`evalFailed: ${expression}`);
  return r.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const pngDims = (b) => ({ width: b.readUInt32BE(16), height: b.readUInt32BE(20) });

function durationMs(e) {
  if (typeof e.finishedTs === 'number' && typeof e.ts === 'number') return Math.round((e.finishedTs - e.ts) * 100000) / 100;
  return null;
}
function timingMsOf(t) {
  if (!t) return null;
  const d = (a, b) => (typeof a === 'number' && typeof b === 'number' && a >= 0 && b >= 0 ? Math.round((b - a) * 1000000) / 1000 : null);
  return {
    proxy: d(t.proxyStart, t.proxyEnd),
    dns: d(t.dnsStart, t.dnsEnd),
    connect: d(t.connectStart, t.connectEnd),
    ssl: d(t.sslStart, t.sslEnd),
    send: d(t.sendStart, t.sendEnd),
    wait: d(t.sendEnd, t.receiveHeadersEnd),
    receive: d(t.receiveHeadersStart, t.receiveHeadersEnd),
  };
}
function netClass(e) {
  if (/\/favicon\.ico$/.test(e.url)) return 'internal-probe';
  if (e.failed) return 'failed';
  if (e.extraInfo && e.extraInfo.statusCode === 304) return 'revalidated-304';
  if (e.servedFromCache || e.fromDiskCache || e.fromMemoryCache) return 'cache-served';
  if (e.finished) return 'wire';
  if (e.status !== null && e.status !== undefined) return 'responding';
  return 'requested';
}
function netRow(e) {
  return {
    method: e.method,
    path: pathOf(e.url),
    type: e.type,
    initiator: e.initiator ? e.initiator.type : null,
    status: e.status ?? null,
    statusText: e.statusText ?? null,
    extraStatus: e.extraInfo ? e.extraInfo.statusCode : null,
    mimeType: e.mimeType ?? null,
    protocol: e.protocol ?? null,
    fromDiskCache: e.fromDiskCache === true,
    fromMemoryCache: e.fromMemoryCache === true,
    servedFromCache: e.servedFromCache === true,
    contentLength: e.contentLength ?? null,
    respEncoded: e.respEncodedLength ?? null,
    totalBytes: e.totalEncodedLength ?? null,
    dataEvents: e.dataEvents ?? 0,
    dataLength: e.dataLength ?? null,
    postDataBytes: e.postDataBytes ?? 0,
    durationMs: durationMs(e),
    class: netClass(e),
    failed: e.failed ?? null,
  };
}

async function pollUntil(fn, label, timeoutMs = 8000) {
  const t0 = Date.now();
  let last;
  while (Date.now() - t0 < timeoutMs) {
    last = await fn();
    if (last) return last;
    await sleep(50);
  }
  throw new Error(`poll timeout: ${label} (last=${JSON.stringify(last)})`);
}
const settleFrames = () =>
  evalJS(`new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => res('settled'))))`, true);

function deriveShape(snap) {
  const doc = snap.documents[0];
  const strings = snap.strings;
  const nodes = doc.nodes;
  const str = (i) => (typeof i === 'number' && i >= 0 && i < strings.length ? strings[i] : '');
  const n = nodes.nodeName.length;
  const depth = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const p = nodes.parentIndex[i];
    if (p >= 0) depth[i] = depth[p] + 1;
  }
  const lines = [];
  const struct = [];
  for (let i = 0; i < n; i++) {
    const name = str(nodes.nodeName[i]);
    let text = '';
    if (nodes.nodeType[i] === 3) {
      const idx = nodes.nodeValue && nodes.nodeValue[i] !== undefined ? nodes.nodeValue[i] : -1;
      text = idx >= 0 ? String(strings[idx]) : '';
    }
    const attrs = [];
    const a = (nodes.attributes && nodes.attributes[i]) || [];
    for (let k = 0; k + 1 < a.length; k += 2) attrs.push(`${str(a[k])}=${str(a[k + 1])}`);
    lines.push(
      `${'  '.repeat(depth[i])}${name}${attrs.length ? '[' + attrs.join(' ') + ']' : ''}${text !== '' ? '=' + JSON.stringify(text) : ''}`
    );
    struct.push(`${depth[i]}:${name}`);
  }
  return {
    text: lines.join('\n') + '\n',
    struct: struct.join('\n') + '\n',
    nodes: n,
    title: doc.title,
    contentWidth: doc.contentWidth,
    contentHeight: doc.contentHeight,
    scrollOffsetX: doc.scrollOffsetX,
    scrollOffsetY: doc.scrollOffsetY,
  };
}

function hollowLookup(col, i) {
  if (!col) return null;
  if (Array.isArray(col)) return i < col.length ? col[i] : null;
  if (Array.isArray(col.index)) {
    const p = col.index.indexOf(i);
    if (p < 0) return null;
    return Array.isArray(col.value) ? col.value[p] : true;
  }
  return null;
}

function extractInputs(snap) {
  const doc = snap.documents[0];
  const strings = snap.strings;
  const nodes = doc.nodes;
  const str = (i) => (typeof i === 'number' && i >= 0 && i < strings.length ? strings[i] : '');
  const out = [];
  const n = nodes.nodeName.length;
  for (let i = 0; i < n; i++) {
    if (str(nodes.nodeName[i]) !== 'INPUT') continue;
    const attrs = (nodes.attributes && nodes.attributes[i]) || [];
    const rec = {};
    for (let k = 0; k + 1 < attrs.length; k += 2) rec[str(attrs[k])] = str(attrs[k + 1]);
    const iv = hollowLookup(nodes.inputValue, i);
    const ic = hollowLookup(nodes.inputChecked, i);
    out.push({
      id: rec.id,
      name: rec.name,
      type: rec.type,
      inputValue: typeof iv === 'number' && iv >= 0 ? str(iv) : null,
      inputChecked: rec.type === 'radio' || rec.type === 'checkbox' ? ic === true : null,
    });
  }
  return out;
}

let netMark = 0;
async function capture(tag) {
  const startedAtUTC = new Date().toISOString();
  await settleFrames();
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const png = Buffer.from(shot.data, 'base64');
  writeFileSync(join(out, `${tag}.png`), png);
  const dom = await send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
  writeFileSync(join(out, `${tag}.domsnapshot.json`), JSON.stringify(dom));
  const shape = deriveShape(dom);
  writeFileSync(join(out, `${tag}.shape.txt`), shape.text);
  const url = await evalJS('location.href');
  const title = await evalJS('document.title');
  const h = await send('Page.getNavigationHistory');
  const cur = h.entries[h.currentIndex] || {};
  const netSlice = netOrder.slice(netMark).map(netRow);
  const netSliceAtUTC = new Date().toISOString();
  netMark = netOrder.length;
  const rec = {
    tag,
    startedAtUTC,
    atUTC: new Date().toISOString(),
    url,
    title,
    history: { currentIndex: h.currentIndex, entries: h.entries.length, currentUrl: cur.url, transitionType: cur.transitionType },
    png: { file: `${tag}.png`, bytes: png.length, dims: pngDims(png), sha256: sha256(png) },
    shape: {
      file: `${tag}.shape.txt`,
      sha256: sha256(shape.text),
      structSha256: sha256(shape.struct),
      nodes: shape.nodes,
      contentWidth: shape.contentWidth,
      contentHeight: shape.contentHeight,
    },
    inputs: extractInputs(dom),
    net: netSlice,
    netSliceAtUTC,
  };
  record.captures.push(rec);
  console.log(
    `capture ${tag}: url=${url} png=${rec.png.sha256.slice(0, 16)} shape=${rec.shape.sha256.slice(0, 16)} nodes=${shape.nodes} netEvents=${netSlice.length}`
  );
  return rec;
}

async function clickSel(sel) {
  const rect = await evalJS(`(() => {
    const el = document.querySelector(${JSON.stringify(sel)});
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
  })()`);
  if (!rect) throw new Error(`no element ${sel}`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  return rect;
}

async function main() {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: false });
  record.netDomain.cacheDisabledSent = true;
  await send('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });

  // step 1 — index: navigate and capture (plus a within-run idempotence re-capture)
  const navInput = `${base}/index.html`;
  record.navInputs = { step1: navInput };
  await send('Page.navigate', { url: navInput });
  await pollUntil(
    async () => (await evalJS(`document.title === 'TABI-R3-1 index' && document.readyState === 'complete'`)) === true,
    'index loaded'
  );
  record.viewport = {
    innerWidth: await evalJS('window.innerWidth'),
    innerHeight: await evalJS('window.innerHeight'),
    devicePixelRatio: await evalJS('window.devicePixelRatio'),
  };
  await capture('step-1-index');
  await sleep(300);
  await capture('step-1-index-idem');

  // step 2 — follow the item link to detail (JS-rendered from a real fetch)
  const link2 = await evalJS(`document.querySelector('#item-1').getAttribute('href')`);
  const rect2 = await clickSel('#item-1');
  record.actions.push({ step: 'step-2-detail', kind: 'click-link', selector: '#item-1', hrefAttr: link2, rect: rect2 });
  await pollUntil(
    async () =>
      (await evalJS(
        `location.pathname.endsWith('/detail.html') && document.title === 'TABI-R3-1 detail' && document.getElementById('item-name')?.textContent === 'north route' && document.getElementById('item-region')?.textContent === 'highlands'`
      )) === true,
    'detail loaded with fetched item'
  );
  await capture('step-2-detail');

  // step 3 — follow the link to the form
  const link3 = await evalJS(`document.querySelector('#to-form').getAttribute('href')`);
  const rect3 = await clickSel('#to-form');
  record.actions.push({ step: 'step-3-form', kind: 'click-link', selector: '#to-form', hrefAttr: link3, rect: rect3 });
  await pollUntil(
    async () =>
      (await evalJS(
        `location.pathname.endsWith('/form.html') && document.title === 'TABI-R3-1 form' && document.getElementById('item-field')?.value === '1'`
      )) === true,
    'form loaded'
  );
  await capture('step-3-form');

  // step 4a — fill the form with real input: click the text field, insert text, click a radio
  const rectIn = await clickSel('#traveler');
  await send('Input.insertText', { text: 'tabi-r3' });
  await pollUntil(async () => (await evalJS(`document.getElementById('traveler').value === 'tabi-r3'`)) === true, 'text field set');
  const rectR = await clickSel('#mode-rail');
  await pollUntil(async () => (await evalJS(`document.getElementById('mode-rail').checked === true`)) === true, 'radio checked');
  record.actions.push(
    { step: 'step-3-form-filled', kind: 'fill', selector: '#traveler', text: 'tabi-r3', rect: rectIn },
    { step: 'step-3-form-filled', kind: 'click-radio', selector: '#mode-rail', rect: rectR }
  );
  await evalJS('document.activeElement && document.activeElement.blur && document.activeElement.blur()');
  await capture('step-3-form-filled');

  // step 4b — submit (real click on the submit button); GET navigation to confirm.html
  const actionAttr = await evalJS(`document.getElementById('travel-form').getAttribute('action')`);
  const rectS = await clickSel('#submit');
  record.actions.push({ step: 'step-4-confirm', kind: 'click-submit', selector: '#submit', formActionAttr: actionAttr, rect: rectS });
  await pollUntil(
    async () =>
      (await evalJS(
        `location.pathname.endsWith('/confirm.html') && document.title === 'TABI-R3-1 confirm' && document.getElementById('out-traveler')?.textContent === 'tabi-r3' && document.getElementById('out-mode')?.textContent === 'rail' && document.getElementById('out-item')?.textContent === '1'`
      )) === true,
    'confirm page rendered submitted values'
  );
  await capture('step-4-confirm');

  // step 5 — typed navigation to the round-4 async-XHR page
  const navAsync = `${base}/async.html`;
  record.navInputs.step5 = navAsync;
  await send('Page.navigate', { url: navAsync });
  await pollUntil(
    async () => (await evalJS(`document.title === 'TABI-R4-1 async' && document.readyState === 'complete'`)) === true,
    'async page loaded'
  );
  await capture('step-5-async-idle');

  // step 6 — click load-data: race probe capture (no state wait) then state-waited capture
  const rectL = await clickSel('#load-data');
  const tClick = Date.now();
  record.actions.push({ step: 'step-6-async', kind: 'click-button', selector: '#load-data', rect: rectL });
  await capture('step-6-async-race');
  const tRace = Date.now();
  await pollUntil(
    async () => (await evalJS(`document.getElementById('async-out').textContent === 'loaded:async-ok:41'`)) === true,
    'async XHR rendered'
  );
  const tLoaded = Date.now();
  await capture('step-6-async-loaded');
  record.asyncTiming = { clickToRaceCaptureMs: tRace - tClick, clickToLoadedStateMs: tLoaded - tClick };

  // step 7 — publish: DOM optimistically renders success; the wire answers the POST 501 (constructed conflict)
  const rectP = await clickSel('#pub-btn');
  record.actions.push({ step: 'step-7-pub', kind: 'click-button', selector: '#pub-btn', rect: rectP });
  await pollUntil(
    async () => netOrder.some((e) => e.method === 'POST' && (e.finished || e.failed !== null)),
    'POST publish finished on the wire'
  );
  await capture('step-7-pub-optimistic');

  // response-body pass: content read for every entry that has a response (compared against --site bytes)
  record.netDomain.getResponseBodyAtUTC = new Date().toISOString();
  for (const e of netOrder) {
    if (e.status === null || e.status === undefined) continue;
    try {
      const r = await send('Network.getResponseBody', { requestId: e.requestId });
      const buf = r.base64Encoded ? Buffer.from(r.body, 'base64') : Buffer.from(r.body, 'utf8');
      e.body = { ok: true, base64Encoded: r.base64Encoded === true, bytes: buf.length, sha256: sha256(buf) };
    } catch (err) {
      e.body = { ok: false, error: String((err && err.message) || err).slice(0, 200) };
    }
  }

  // final cross-checks: /json/list title+url vs last capture; full navigation history
  const listEnd = await j('/json/list');
  const pageEnd = listEnd.find((t) => t.type === 'page');
  record.targetEnd = {
    id: pageEnd ? pageEnd.id : null,
    url: pageEnd ? pageEnd.url : null,
    title: pageEnd ? pageEnd.title : null,
    listAtUTC: new Date().toISOString(),
  };
  const hAll = await send('Page.getNavigationHistory');
  record.history = {
    currentIndex: hAll.currentIndex,
    entries: hAll.entries.map((e) => ({ url: e.url, title: e.title, transitionType: e.transitionType })),
  };
  record.endedAtUTC = new Date().toISOString();
}

try {
  await main();
} catch (e) {
  record.error = String((e && e.stack) || e);
  console.error('ERROR:', record.error);
  process.exitCode = 1;
} finally {
  record.netEvents = netOrder.map((e) => ({
    method: e.method,
    url: e.url,
    path: pathOf(e.url),
    type: e.type,
    initiator: e.initiator,
    postDataBytes: e.postDataBytes,
    requestHeadersN: e.requestHeadersN,
    wallTime: e.wallTime,
    startedAtUTC: e.startedAtUTC,
    status: e.status,
    statusText: e.statusText,
    extraInfo: e.extraInfo || null,
    mimeType: e.mimeType,
    protocol: e.protocol,
    fromDiskCache: e.fromDiskCache === true,
    fromMemoryCache: e.fromMemoryCache === true,
    fromPrefetchCache: e.fromPrefetchCache === true,
    fromServiceWorker: e.fromServiceWorker === true,
    servedFromCache: e.servedFromCache === true,
    contentLength: e.contentLength ?? null,
    respEncoded: e.respEncodedLength ?? null,
    totalBytes: e.totalEncodedLength ?? null,
    dataEvents: e.dataEvents ?? 0,
    dataLength: e.dataLength ?? null,
    dataEncoded: e.dataEncoded ?? null,
    responseTime: e.responseTime,
    timing: e.timing || null,
    timingMs: timingMsOf(e.timing),
    durationMs: durationMs(e),
    class: netClass(e),
    finished: e.finished,
    failed: e.failed ?? null,
    canceled: e.canceled ?? null,
    blockedReason: e.blockedReason ?? null,
    respAtUTC: e.respAtUTC || null,
    finishedAtUTC: e.finishedAtUTC || null,
    failedAtUTC: e.failedAtUTC || null,
    body: e.body || null,
  }));
  writeFileSync(join(out, 'journey.json'), JSON.stringify(record, null, 2));
  ws.close();
  process.exit(process.exitCode || 0);
}