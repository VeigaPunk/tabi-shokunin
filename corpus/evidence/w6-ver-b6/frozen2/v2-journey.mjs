#!/usr/bin/env node
// TABI lane B6-1 — external-class fixture v2 runner (loopback only).
// Every run starts with the conventional /robots.txt probe, then executes an
// ordered cell plan; the first trip (robots-disallow / 429 / 403 / interstitial
// shape) STOPS the run — later cells are recorded as not executed and are
// mechanically provable absent from the server log.
// Usage: node v2-journey.mjs --cdp=PORT --base=URL --hop=URL --mode=NAME --out=DIR
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (!m) throw new Error(`bad arg ${a}`);
  args[m[1]] = m[2];
}
const { cdp, base, hop, mode, out } = args;
if (!cdp || !base || !mode || !out) throw new Error('usage: --cdp --base --hop --mode --out');
const cdpBase = `http://127.0.0.1:${cdp}`;
const runStartMs = Date.now();
const rel = () => Date.now() - runStartMs;

const record = {
  lane: 'B6-1', mode, base, hop: hop || null,
  startedAtUTC: new Date().toISOString(),
  captures: [], cells: [], requests: [],
};

const j = async (path) => (await fetch(cdpBase + path)).json();
const version = await j('/json/version');
record.browser = { browser: version.Browser, protocolVersion: version['Protocol-Version'], userAgent: version.UserAgent };
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
const ensure = (id) => {
  let r = byId.get(id);
  if (!r) { r = { requestId: id, events: [], body: null }; byId.set(id, r); requestOrder.push(id); }
  return r;
};
const hdrShape = (headers) => {
  const names = Object.keys(headers || {});
  let bytes = 0;
  for (const n of names) bytes += n.length + 2 + String(headers[n]).length + 2;
  return { names, count: names.length, bytes };
};

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
        frameId: p.frameId,
        redirectFrom: p.redirectResponse
          ? { status: p.redirectResponse.status, url: p.redirectResponse.url, headers: hdrShape(p.redirectResponse.headers) }
          : null,
      });
      break;
    }
    case 'Network.requestWillBeSentExtraInfo': {
      const r = ensure(p.requestId);
      const hs = hdrShape(p.headers);
      r.events.push({
        kind: 'reqExtra', atRelMs: rel(), headerCount: hs.count, headerBytes: hs.bytes, headerNames: hs.names,
        cookieHeaderFields: p.headers && p.headers.Cookie ? String(p.headers.Cookie).split(';').length : 0,
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
        fromDiskCache: resp.fromDiskCache === true, fromMemoryCache: resp.fromMemoryCache === true,
        fromServiceWorker: resp.fromServiceWorker === true,
        connectionReused: resp.connectionReused === true, connectionId: resp.connectionId,
        remoteIPAddress: resp.remoteIPAddress || null,
        encodedDataLength: resp.encodedDataLength, timing: resp.timing || null,
      });
      break;
    }
    case 'Network.responseReceivedExtraInfo': {
      const r = ensure(p.requestId);
      const hs = hdrShape(p.headers);
      const text = typeof p.headersText === 'string' ? p.headersText : null;
      r.events.push({
        kind: 'wire', atRelMs: rel(), statusCode: p.statusCode,
        headerCount: hs.count, headerBytes: hs.bytes, headersTextBytes: text ? text.length : null,
        statusLine: text ? text.split('\r\n')[0] : null,
        headers: p.headers || null,
      });
      break;
    }
    case 'Network.loadingFinished': {
      ensure(p.requestId).events.push({ kind: 'finished', atRelMs: rel(), ts: p.timestamp, encodedDataLength: p.encodedDataLength });
      break;
    }
    case 'Network.loadingFailed': {
      ensure(p.requestId).events.push({
        kind: 'failed', atRelMs: rel(), ts: p.timestamp,
        errorText: p.errorText, canceled: p.canceled === true, blockedReason: p.blockedReason || null,
      });
      break;
    }
    case 'Network.requestServedFromCache': {
      ensure(p.requestId).events.push({ kind: 'cache', atRelMs: rel() });
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
  for (let i = 0; i < n; i++) { const p = nodes.parentIndex[i]; if (p >= 0) depth[i] = depth[p] + 1; }
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
    lines.push(`${'  '.repeat(depth[i])}${name}${attrs.length ? '[' + attrs.join(' ') + ']' : ''}${text !== '' ? '=' + JSON.stringify(text) : ''}`);
    struct.push(`${depth[i]}:${name}`);
  }
  return { text: lines.join('\n') + '\n', struct: struct.join('\n') + '\n', nodes: n, title: doc.title, contentWidth: doc.contentWidth, contentHeight: doc.contentHeight };
}

let netMarkCounts = new Map();
const sliceFor = () => {
  const slice = [];
  for (const rid of requestOrder) {
    const r = byId.get(rid);
    const seen = netMarkCounts.get(rid) || 0;
    if (r.events.length > seen) slice.push({ requestId: rid, startedInThisSlice: seen === 0, events: r.events.map((e) => ({ ...e })), body: r.body ? { ...r.body } : null });
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
      r.body = { base64Encoded: b.base64Encoded === true, bytes: buf.length, sha256: sha256(buf), head: b.base64Encoded ? null : b.body.slice(0, 120) };
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
  const perf = JSON.parse(await evalJS(`JSON.stringify(performance.getEntriesByType('resource').map(e => ({ name: e.name, initiatorType: e.initiatorType, duration: e.duration, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, responseStatus: e.responseStatus })))`));
  const perfNav = JSON.parse(await evalJS(`JSON.stringify(performance.getEntriesByType('navigation').map(e => ({ name: e.name, type: e.type, redirectCount: e.redirectCount, duration: e.duration, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, responseStatus: e.responseStatus })))`));
  const netSlice = sliceFor();
  advanceMark();
  const rec = {
    tag, atRelMs: rel(), atUTC: new Date().toISOString(), url, title, readyState,
    history: { currentIndex: h.currentIndex, entries: h.entries.length, currentUrl: cur.url, transitionType: cur.transitionType },
    png: { file: `${tag}.png`, bytes: png.length, dims: pngDims(png), sha256: sha256(png) },
    shape: { file: `${tag}.shape.txt`, sha256: sha256(shape.text), structSha256: sha256(shape.struct), nodes: shape.nodes, contentWidth: shape.contentWidth, contentHeight: shape.contentHeight },
    perf, perfNav, netSlice,
  };
  record.captures.push(rec);
  console.log(`capture ${tag}: url=${url} png=${rec.png.sha256.slice(0, 16)} shape=${rec.shape.sha256.slice(0, 16)} nodes=${shape.nodes} netUpdated=${netSlice.length}`);
  await fetchBodies();
  return rec;
}

// ---- the stop-and-report predicate (mechanical; recorded per cell) ----
const STATUS_TRIP = [429, 403];
function robotsDisallowMatches(text, path) {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => /^Disallow:/i.test(l));
  const prefixes = lines.map((l) => l.slice(l.indexOf(':') + 1).trim()).filter((p) => p !== '');
  const hit = prefixes.find((p) => path.startsWith(p)) || null;
  return { prefixes, hit };
}
const INTERSTITIAL_MARKER = '[data-tabi-gate="interstitial"]';

let trip = null;
function tripRec(cell, cls, matchedOn, observed, action) {
  trip = { cell, class: cls, matchedOn, observed, action, atUTC: new Date().toISOString(), atRelMs: rel() };
  console.log(`TRIP [${cls}] cell=${cell} matchedOn=${matchedOn} -> STOP`);
  return trip;
}

async function attachTripBody(pathEnd) {
  await fetchBodies();
  const rid = [...requestOrder].reverse().find((id) => {
    const r = byId.get(id);
    const req = r.events.find((e) => e.kind === 'req');
    return req && req.url.endsWith(pathEnd);
  });
  if (rid && trip) {
    trip.observed.responseBody = byId.get(rid).body;
    trip.issuedRequestsAtTrip = requestOrder.length;
  }
}

const run = {};
const cells = [];
async function cellStep(name, fn) {
  if (trip) { cells.push({ cell: name, executed: false, skippedBecause: `stopped at ${trip.cell}` }); return null; }
  const r = await fn();
  cells.push({ cell: name, executed: true, result: r });
  return r;
}

async function readRobots() {
  const r = await evalJS(`fetch('/robots.txt').then(x => x.text().then(t => ({status: x.status, ct: x.headers.get('content-type'), bytes: t.length, text: t})))`, true);
  r.sha256 = sha256(Buffer.from(r.text, 'utf8'));
  return r;
}

async function plan() {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable', { maxTotalBufferSize: 20000000, maxResourceBufferSize: 5000000, maxPostDataSize: 65536 });
  await send('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });

  // bootstrap (harness page context; recorded, not an instrument cell)
  await send('Page.navigate', { url: `${base}/index.html` });
  await pollUntil(async () => (await evalJS(`document.title === 'TABI-R6-1 index' && document.readyState === 'complete'`)) === true, 'index loaded');
  record.viewport = { innerWidth: await evalJS('window.innerWidth'), innerHeight: await evalJS('window.innerHeight'), devicePixelRatio: await evalJS('window.devicePixelRatio') };
  await capture('step-1-index');

  // cell 0 — the conventional permission probe
  const robots = await cellStep('robots-probe', readRobots);
  record.robots = robots ? { status: robots.status, ct: robots.ct, bytes: robots.bytes, sha256: robots.sha256, text: robots.text } : null;

  const NEXT_CELL_PATH = {
    chain: '/m/307',
    'probe-robots': '/private/instrument/probe',
    'probe-429': '/rate/429',
    'probe-403': '/rate/403',
    'probe-captcha': '/gate/interstitial',
  };
  const intendedPath = NEXT_CELL_PATH[mode];
  if (robots) {
    const m = robotsDisallowMatches(robots.text, intendedPath);
    record.robotsParse = { intended: intendedPath, prefixes: m.prefixes, matchedPrefix: m.hit };
    if (m.hit) {
      tripRec('robots-probe', 'robots-disallow', `Disallow ${m.hit} matches intended ${intendedPath}`, { robotsStatus: robots.status, sha256: robots.sha256, matchedPrefix: m.hit }, 'STOP — intended request NOT issued; never retry through');
      await attachTripBody('/robots.txt');
    } else {
      console.log(`robots: no disallow match for ${intendedPath} — CONTINUE`);
      record.robotsParse.verdict = 'continue (no disallow match)';
    }
  }

  if (mode === 'chain') {
    await cellStep('post-307', async () => {
      const r = await evalJS(`fetch('/m/307', {method: 'POST', body: 'cell=307'}).then(x => x.text().then(t => ({status: x.status, redirected: x.redirected, finalUrl: x.url, text: t})))`, true);
      await sleep(150);
      await capture('post-307');
      return r;
    });
    await cellStep('chain-navigate', async () => {
      await send('Page.navigate', { url: `${base}/chain/start` });
      await pollUntil(async () => (await evalJS(`document.title === 'TABI-R6-1 landed' && document.readyState === 'complete'`)) === true, 'landed');
      await capture('step-2-landed');
      const nav = await evalJS(`JSON.stringify(performance.getEntriesByType('navigation').map(e => ({name: e.name, redirectCount: e.redirectCount, responseStatus: e.responseStatus})))`);
      return { finalUrl: await evalJS('location.href'), nav: JSON.parse(nav) };
    });
    await cellStep('same-origin-chain', async () => {
      await send('Page.navigate', { url: `${base}/chain/same-start` });
      await pollUntil(async () => (await evalJS(`document.title === 'TABI-R6-1 same-origin landed' && document.readyState === 'complete'`)) === true, 'same-origin landed');
      await capture('step-3-same-landed');
      const nav = await evalJS(`JSON.stringify(performance.getEntriesByType('navigation').map(e => ({name: e.name, redirectCount: e.redirectCount, responseStatus: e.responseStatus})))`);
      return { finalUrl: await evalJS('location.href'), nav: JSON.parse(nav) };
    });
  } else if (mode === 'probe-robots') {
    // the intended (disallowed) request is issued only if robots allowed it
    await cellStep('intended-target', async () => {
      const r = await evalJS(`fetch('${intendedPath}').then(x => ({status: x.status}))`, true);
      return r;
    });
    await cellStep('followup-429', async () => {
      const r = await evalJS(`fetch('/rate/429').then(x => ({status: x.status, retryAfter: x.headers.get('Retry-After')}))`, true);
      if (STATUS_TRIP.includes(r.status)) tripRec('followup-429', 'http-429', `status ${r.status}`, r, 'STOP — no further requests');
      return r;
    });
  } else if (mode === 'probe-429' || mode === 'probe-403') {
    const target = mode === 'probe-429' ? '/rate/429' : '/rate/403';
    await cellStep(`fetch-${target}`, async () => {
      const r = await evalJS(`fetch('${target}').then(x => x.text().then(t => ({status: x.status, retryAfter: x.headers.get('Retry-After'), ct: x.headers.get('content-type'), bodyText: t})))`, true);
      r.bodyBytes = Buffer.byteLength(r.bodyText, 'utf8');
      r.bodySha = sha256(Buffer.from(r.bodyText, 'utf8'));
      r.bodyText = r.bodyText.slice(0, 120);
      if (STATUS_TRIP.includes(r.status)) {
        tripRec(`fetch-${target}`, `http-${r.status}`, `status ${r.status}`, r, 'STOP — no further requests');
        await attachTripBody(target);
      }
      return r;
    });
    await cellStep('followup-interstitial', async () => {
      await send('Page.navigate', { url: `${base}/gate/interstitial` });
      await pollUntil(async () => (await evalJS(`document.readyState === 'complete'`)) === true, 'interstitial loaded');
      const shapeHit = await evalJS(`document.querySelector('${INTERSTITIAL_MARKER}') !== null && document.title === 'Security check'`);
      if (shapeHit) tripRec('followup-interstitial', 'interstitial-shape', `marker ${INTERSTITIAL_MARKER}`, { title: 'Security check' }, 'STOP — no further requests');
      return { reached: true };
    });
  } else if (mode === 'probe-captcha') {
    await cellStep('goto-interstitial', async () => {
      await send('Page.navigate', { url: `${base}/gate/interstitial` });
      await pollUntil(async () => (await evalJS(`document.readyState === 'complete'`)) === true, 'interstitial loaded');
      await capture('step-interstitial');
      const shapeHit = await evalJS(`document.querySelector('${INTERSTITIAL_MARKER}') !== null && document.title === 'Security check'`);
      const status = await evalJS(`performance.getEntriesByType('navigation')[0].responseStatus`);
      if (shapeHit) tripRec('goto-interstitial', 'interstitial-shape', `marker ${INTERSTITIAL_MARKER} at status ${status}`, { status, title: 'Security check' }, 'STOP — no further requests');
      if (shapeHit) await attachTripBody('/gate/interstitial');
      return { status, shapeHit };
    });
    await cellStep('followup-429', async () => {
      const r = await evalJS(`fetch('/rate/429').then(x => ({status: x.status}))`, true);
      if (STATUS_TRIP.includes(r.status)) tripRec('followup-429', 'http-429', `status ${r.status}`, r, 'STOP — no further requests');
      return r;
    });
  } else {
    throw new Error(`unknown mode ${mode}`);
  }

  const hAll = await send('Page.getNavigationHistory');
  record.history = { currentIndex: hAll.currentIndex, entries: hAll.entries.map((e) => ({ url: e.url, title: e.title, transitionType: e.transitionType })) };
  record.endedAtUTC = new Date().toISOString();
}

try {
  await plan();
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
  record.cells = cells;
  record.trip = trip;
  record.stopped = trip !== null;
  record.notExecuted = cells.filter((c) => c.executed === false).map((c) => c.cell);
  writeFileSync(join(out, 'journey.json'), JSON.stringify(record, null, 2));
  if (trip) writeFileSync(join(out, 'trip.json'), JSON.stringify({ mode, ...trip, notExecuted: record.notExecuted }, null, 2));
  ws.close();
  process.exit(process.exitCode || 0);
}