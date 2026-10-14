#!/usr/bin/env node
// TABI lane T4-1 — CDP Network-domain journey runner (loopback fixture).
// 3-navigation journey: index.html -> click /go (302) -> async.html (async fetches) -> form GET -> confirm.html
// Captures per cold run: step-1-index, step-1-index-idem, step-2-async-early, step-2-async-settled,
// step-3-async-filled, step-4-confirm.
// Network domain: per-request event log (requestWillBeSent / requestWillBeSentExtraInfo /
// responseReceived / responseReceivedExtraInfo / loadingFinished / loadingFailed /
// requestServedFromCache) + Network.getResponseBody bytes + page-side PerformanceResourceTiming.
// Usage: node net-journey.mjs --cdp=PORT --base=http://127.0.0.1:PORT --out=DIR
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (!m) throw new Error(`bad arg ${a}`);
  args[m[1]] = m[2];
}
const { cdp, base, out } = args;
if (!cdp || !base || !out) throw new Error('usage: --cdp --base --out');
const cdpBase = `http://127.0.0.1:${cdp}`;
const runStartMs = Date.now();
const rel = () => Date.now() - runStartMs;

const record = {
  lane: 'T4-1',
  base,
  startedAtUTC: new Date().toISOString(),
  captures: [],
  actions: [],
  requests: [],
  history: null,
};

const j = async (path) => (await fetch(cdpBase + path)).json();
const version = await j('/json/version');
record.browser = {
  browser: version.Browser,
  protocolVersion: version['Protocol-Version'],
  userAgent: version.UserAgent,
};
const list0 = await j('/json/list');
const page = list0.find((t) => t.type === 'page');
if (!page) throw new Error('no page target');
record.targetLaunch = { id: page.id, url: page.url, title: page.title, listAtUTC: new Date().toISOString() };

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = () => res(); ws.onerror = () => rej(new Error('ws error')); });

let nextId = 1;
const pending = new Map();
const requestOrder = [];
const byId = new Map();

function ensure(id) {
  let r = byId.get(id);
  if (!r) {
    r = { requestId: id, events: [], body: null };
    byId.set(id, r);
    requestOrder.push(id);
  }
  return r;
}

function hdrShape(headers) {
  const names = Object.keys(headers || {});
  let bytes = 0;
  for (const n of names) bytes += n.length + 2 + String(headers[n]).length + 2;
  return { names, count: names.length, bytes };
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    return;
  }
  const p = msg.params;
  if (!p) return;
  switch (msg.method) {
    case 'Network.requestWillBeSent': {
      const r = ensure(p.requestId);
      r.events.push({
        kind: 'req', atRelMs: rel(), ts: p.timestamp, wallTime: p.wallTime,
        method: p.request.method, url: p.request.url, type: p.type,
        initiator: p.initiator ? p.initiator.type : null,
        frameId: p.frameId, hasUserGesture: p.hasUserGesture === true,
        transitionType: p.transitionType || null,
        redirectFrom: p.redirectResponse
          ? { status: p.redirectResponse.status, url: p.redirectResponse.url, encodedDataLength: p.redirectResponse.encodedDataLength }
          : null,
      });
      break;
    }
    case 'Network.requestWillBeSentExtraInfo': {
      const r = ensure(p.requestId);
      const hs = hdrShape(p.headers);
      r.events.push({
        kind: 'reqExtra', atRelMs: rel(),
        headerCount: hs.count, headerBytes: hs.bytes, headerNames: hs.names,
        cookieHeaderFields: p.headers && p.headers['Cookie'] ? String(p.headers['Cookie']).split(';').length : 0,
      });
      break;
    }
    case 'Network.responseReceived': {
      const r = ensure(p.requestId);
      const resp = p.response;
      r.events.push({
        kind: 'resp', atRelMs: rel(), ts: p.timestamp,
        status: resp.status, statusText: resp.statusText, mimeType: resp.mimeType,
        protocol: resp.protocol, url: resp.url,
        fromDiskCache: resp.fromDiskCache === true,
        fromMemoryCache: resp.fromMemoryCache === true,
        fromServiceWorker: resp.fromServiceWorker === true,
        connectionReused: resp.connectionReused === true,
        connectionId: resp.connectionId,
        remoteIPAddress: resp.remoteIPAddress || null,
        encodedDataLength: resp.encodedDataLength,
        timing: resp.timing || null,
      });
      break;
    }
    case 'Network.responseReceivedExtraInfo': {
      const r = ensure(p.requestId);
      const hs = hdrShape(p.headers);
      const text = typeof p.headersText === 'string' ? p.headersText : null;
      r.events.push({
        kind: 'wire', atRelMs: rel(),
        statusCode: p.statusCode,
        headerCount: hs.count, headerBytes: hs.bytes,
        headersTextBytes: text ? text.length : null,
        statusLine: text ? text.split('\r\n')[0] : null,
        blockedCookies: Array.isArray(p.blockedCookies) ? p.blockedCookies.length : 0,
      });
      break;
    }
    case 'Network.loadingFinished': {
      const r = ensure(p.requestId);
      r.events.push({ kind: 'finished', atRelMs: rel(), ts: p.timestamp, encodedDataLength: p.encodedDataLength });
      break;
    }
    case 'Network.loadingFailed': {
      const r = ensure(p.requestId);
      r.events.push({
        kind: 'failed', atRelMs: rel(), ts: p.timestamp,
        errorText: p.errorText, canceled: p.canceled === true,
        blockedReason: p.blockedReason || null,
      });
      break;
    }
    case 'Network.requestServedFromCache': {
      const r = ensure(p.requestId);
      r.events.push({ kind: 'cache', atRelMs: rel() });
      break;
    }
    default:
      break;
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

let netMarkCounts = new Map();
const sliceFor = () => {
  const slice = [];
  for (const rid of requestOrder) {
    const r = byId.get(rid);
    const seen = netMarkCounts.get(rid) || 0;
    if (r.events.length > seen) {
      slice.push({
        requestId: rid,
        startedInThisSlice: seen === 0,
        events: r.events.map((e) => ({ ...e })),
        body: r.body ? { ...r.body } : null,
      });
    }
  }
  return slice;
};
const advanceMark = () => {
  const m = new Map();
  for (const rid of requestOrder) m.set(rid, byId.get(rid).events.length);
  netMarkCounts = m;
};

async function fetchBodies() {
  for (const rid of requestOrder) {
    const r = byId.get(rid);
    if (r.body) continue;
    const hasFin = r.events.some((e) => e.kind === 'finished');
    const hasResp = r.events.some((e) => e.kind === 'resp');
    if (!hasFin && !hasResp) continue;
    try {
      const b = await send('Network.getResponseBody', { requestId: rid });
      const buf = b.base64Encoded ? Buffer.from(b.body, 'base64') : Buffer.from(b.body, 'utf8');
      r.body = {
        base64Encoded: b.base64Encoded === true,
        bytes: buf.length,
        sha256: sha256(buf),
        head: b.base64Encoded ? null : b.body.slice(0, 120),
      };
    } catch (e) {
      r.body = { error: String((e && e.message) || e) };
    }
  }
}

async function capture(tag) {
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
  const readyState = await evalJS('document.readyState');
  const h = await send('Page.getNavigationHistory');
  const cur = h.entries[h.currentIndex] || {};
  const perf = JSON.parse(await evalJS(`JSON.stringify(performance.getEntriesByType('resource').map(e => ({ name: e.name, initiatorType: e.initiatorType, startTime: e.startTime, duration: e.duration, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize, responseStatus: e.responseStatus })))`));
  const perfNav = JSON.parse(await evalJS(`JSON.stringify(performance.getEntriesByType('navigation').map(e => ({ name: e.name, type: e.type, startTime: e.startTime, duration: e.duration, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize, responseStatus: e.responseStatus })))`));
  const netSlice = sliceFor();
  advanceMark();
  const rec = {
    tag,
    atRelMs: rel(),
    atUTC: new Date().toISOString(),
    url,
    title,
    readyState,
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
    perf,
    perfNav,
    netSlice,
  };
  record.captures.push(rec);
  console.log(
    `capture ${tag}: url=${url} png=${rec.png.sha256.slice(0, 16)} shape=${rec.shape.sha256.slice(0, 16)} nodes=${shape.nodes} netUpdated=${netSlice.length}`
  );
  await fetchBodies();
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
  await send('Network.enable', { maxTotalBufferSize: 20000000, maxResourceBufferSize: 5000000, maxPostDataSize: 65536 });
  await send('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });

  // step 1 — index: navigate, capture, idempotence re-capture
  const navInput = `${base}/index.html`;
  record.navInputs = { step1: navInput };
  await send('Page.navigate', { url: navInput });
  await pollUntil(
    async () => (await evalJS(`document.title === 'TABI-R4-1 index' && document.readyState === 'complete'`)) === true,
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

  // step 2 — click the link: /go (302) -> async.html; capture early (fetches in flight), then settled
  const linkHrefAttr = await evalJS(`document.querySelector('#to-async').getAttribute('href')`);
  const linkHrefResolved = await evalJS(`document.querySelector('#to-async').href`);
  const rect2 = await clickSel('#to-async');
  record.actions.push({ step: 'step-2-async', kind: 'click-link', selector: '#to-async', hrefAttr: linkHrefAttr, hrefResolved: linkHrefResolved, rect: rect2 });
  record.navInputs.step2 = { kind: 'click-link', hrefAttr: linkHrefAttr, hrefResolved: linkHrefResolved };
  await pollUntil(
    async () =>
      (await evalJS(
        `location.pathname.endsWith('/async.html') && document.readyState === 'complete' && document.getElementById('async-state')?.textContent === 'waiting'`
      )) === true,
    'async page early state (waiting)'
  );
  await capture('step-2-async-early');
  await pollUntil(
    async () =>
      (await evalJS(
        `location.pathname.endsWith('/async.html') && document.getElementById('async-state')?.textContent === 'settled' && document.getElementById('payload-slow')?.textContent === 'SLOW-PAYLOAD-9f2c' && document.getElementById('payload-quick')?.textContent === 'QUICK-PAYLOAD-3a1d'`
      )) === true,
    'async page settled'
  );
  await capture('step-2-async-settled');

  // step 3 — fill the form with real input (state capture, URL unchanged)
  const rectIn = await clickSel('#note');
  await send('Input.insertText', { text: 'tabi-r4' });
  await pollUntil(async () => (await evalJS(`document.getElementById('note').value === 'tabi-r4'`)) === true, 'text field set');
  const rectR = await clickSel('#speed-slow');
  await pollUntil(async () => (await evalJS(`document.getElementById('speed-slow').checked === true`)) === true, 'radio checked');
  record.actions.push(
    { step: 'step-3-async-filled', kind: 'fill', selector: '#note', text: 'tabi-r4', rect: rectIn },
    { step: 'step-3-async-filled', kind: 'click-radio', selector: '#speed-slow', rect: rectR }
  );
  await evalJS('document.activeElement && document.activeElement.blur && document.activeElement.blur()');
  await capture('step-3-async-filled');

  // step 4 — submit (real click); GET navigation to confirm.html
  const actionAttr = await evalJS(`document.getElementById('note-form').getAttribute('action')`);
  const rectS = await clickSel('#submit');
  record.actions.push({ step: 'step-4-confirm', kind: 'click-submit', selector: '#submit', formActionAttr: actionAttr, rect: rectS });
  await pollUntil(
    async () =>
      (await evalJS(
        `location.pathname.endsWith('/confirm.html') && document.title === 'TABI-R4-1 confirm' && document.getElementById('out-note')?.textContent === 'tabi-r4' && document.getElementById('out-speed')?.textContent === 'slow' && document.getElementById('out-step')?.textContent === '3'`
      )) === true,
    'confirm page rendered submitted values'
  );
  await capture('step-4-confirm');
  record.navInputs.step4ReadBack = await evalJS('location.href');

  // final cross-checks
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
  record.requests = requestOrder.map((rid) => {
    const r = byId.get(rid);
    return { requestId: rid, events: r.events, body: r.body };
  });
  record.requestCount = requestOrder.length;
  writeFileSync(join(out, 'journey.json'), JSON.stringify(record, null, 2));
  ws.close();
  process.exit(process.exitCode || 0);
}