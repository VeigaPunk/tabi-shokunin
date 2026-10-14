#!/usr/bin/env node
// TABI lane B9-1 — stateful fixture v3 replay runner (loopback only); a copy of
// lane B8-1's runner (pin 282511320499f1f5) plus the replay-* / double-apply cells.
// usage: node journey.mjs --cdp=PORT --base=URL --cell=NAME --rep=N --out=DIR
// One cell per invocation; the driver restarts server + chromium per run.
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (!m) throw new Error(`bad arg ${a}`);
  args[m[1]] = m[2];
}
const { cdp, base, cell, rep, out } = args;
if (!cdp || !base || !cell || !out) throw new Error('usage: --cdp --base --cell --rep --out');
const cdpBase = `http://127.0.0.1:${cdp}`;
const runStartMs = Date.now();
const rel = () => Date.now() - runStartMs;

const record = {
  lane: 'B8-1', cell, rep: Number(rep || 0), base,
  startedAtUTC: new Date().toISOString(),
  captures: [], requests: [],
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

ws.onmessage = (evts) => {
  const msg = JSON.parse(evts.data);
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
        initiator: p.initiator ? p.initiator.type : null, frameId: p.frameId,
        redirectFrom: p.redirectResponse
          ? { status: p.redirectResponse.status, url: p.redirectResponse.url }
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
        connectionReused: resp.connectionReused === true, remoteIPAddress: resp.remoteIPAddress || null,
        encodedDataLength: resp.encodedDataLength,
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
  }
  return { text: lines.join('\n') + '\n', nodes: n, title: doc.title, contentWidth: doc.contentWidth, contentHeight: doc.contentHeight };
}

let netMarkCounts = new Map();
const sliceFor = () => {
  const slice = [];
  for (const rid of requestOrder) {
    const r = byId.get(rid);
    const seen = netMarkCounts.get(rid) || 0;
    if (r.events.length > seen) slice.push({ requestId: rid, startedInThisSlice: seen === 0, events: r.events.map((e) => ({ ...e })) });
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
      r.body = { base64Encoded: b.base64Encoded === true, bytes: buf.length, sha256: sha256(buf), head: b.base64Encoded ? null : b.body.slice(0, 160) };
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
  const perfNav = JSON.parse(await evalJS(`JSON.stringify(performance.getEntriesByType('navigation').map(e => ({ name: e.name, type: e.type, redirectCount: e.redirectCount, duration: Math.round(e.duration), transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, responseStatus: e.responseStatus })))`));
  const netSlice = sliceFor();
  advanceMark();
  const rec = {
    tag, atRelMs: rel(), atUTC: new Date().toISOString(), url, title, readyState,
    history: { currentIndex: h.currentIndex, entries: h.entries.length, currentUrl: cur.url, transitionType: cur.transitionType },
    png: { file: `${tag}.png`, bytes: png.length, dims: pngDims(png), sha256: sha256(png) },
    shape: { file: `${tag}.shape.txt`, sha256: sha256(shape.text), nodes: shape.nodes },
    perfNav, netSlice,
  };
  record.captures.push(rec);
  console.log(`capture ${tag}: url=${url} png=${rec.png.sha256.slice(0, 16)} shape=${rec.shape.sha256.slice(0, 16)} nodes=${shape.nodes}`);
  await fetchBodies();
  return rec;
}

async function cookieCensus(tag) {
  const r = await send('Network.getCookies', { urls: [base + '/'] });
  const cookies = (r.cookies || []).map((c) => {
    const v = c.value || '';
    return {
      name: c.name, valueLen: v.length,
      valueClass: /^[0-9a-f]+$/.test(v) ? 'lower-hex' : (/^[A-Za-z0-9_-]+$/.test(v) ? 'token-chars' : 'other'),
      domain: c.domain, path: c.path, size: c.size === undefined ? null : c.size,
      session: c.session === true, expires: c.expires,
      httpOnly: c.httpOnly === true, secure: c.secure === true, sameSite: c.sameSite || null,
    };
  });
  let jsVisible = '';
  try { jsVisible = await evalJS('document.cookie'); } catch (e) { jsVisible = `<eval failed: ${e.message}>`; }
  const jsNames = jsVisible.split(';').map((s) => s.trim().split('=')[0]).filter(Boolean);
  return { tag, count: cookies.length, cookies, jsVisibleLen: jsVisible.length, jsNames };
}

const ledgerNow = async () => (await fetch(`${base}/__ledger`)).json();

const pageFacts = async () => {
  const out_ = {};
  try {
    out_.url = await evalJS('location.href');
    out_.title = await evalJS('document.title');
    out_.readyState = await evalJS('document.readyState');
    out_.visits = await evalJS(`document.querySelector('#visits') ? document.querySelector('#visits').dataset.visits : null`);
    out_.counter = await evalJS(`document.querySelector('#counter') ? document.querySelector('#counter').dataset.counter : null`);
  } catch (e) {
    out_.error = String(e.message || e);
  }
  return out_;
};

const pathOf = (u) => { try { const x = new URL(u); return x.pathname + (x.search || ''); } catch { return u; } };

const factsFromNet = () => requestOrder.map((rid) => {
  const r = byId.get(rid);
  const req = r.events.find((e) => e.kind === 'req') || {};
  const wire = r.events.find((e) => e.kind === 'wire') || {};
  const resp = r.events.find((e) => e.kind === 'resp') || {};
  const failed = r.events.find((e) => e.kind === 'failed') || {};
  const reqExtra = r.events.find((e) => e.kind === 'reqExtra') || {};
  return {
    path: req.url ? pathOf(req.url) : null,
    method: req.method || null,
    type: req.type || null,
    redirectFrom: req.redirectFrom ? req.redirectFrom.status : null,
    wireStatus: wire.statusCode === undefined ? null : wire.statusCode,
    clientStatus: resp.status === undefined ? null : resp.status,
    fromDiskCache: resp.fromDiskCache === undefined ? null : resp.fromDiskCache,
    failed: failed.errorText || null,
    canceled: failed.canceled === undefined ? null : failed.canceled,
    cookieHeaderFields: reqExtra.cookieHeaderFields === undefined ? null : reqExtra.cookieHeaderFields,
  };
});

const navigateAndWait = async (url, title, label) => {
  await send('Page.navigate', { url });
  await pollUntil(async () => {
    try {
      return (await evalJS(`document.readyState === 'complete' && document.title === ${JSON.stringify(title)}`)) === true;
    } catch { return false; }
  }, label || `nav ${url}`);
};

async function plan() {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable', { maxTotalBufferSize: 20000000, maxResourceBufferSize: 5000000, maxPostDataSize: 65536 });
  await send('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });

  const f = { cell };
  await navigateAndWait(`${base}/`, 'TABI-R8-1 index', 'index');
  const visit1 = await pageFacts();
  f.visit1 = visit1;

  if (cell === 'multi-visit') {
    await capture('visit-1');
    const c1 = await cookieCensus('visit-1');
    await navigateAndWait(`${base}/`, 'TABI-R8-1 index', 'index-2');
    const visit2 = await pageFacts();
    await capture('visit-2');
    const c2 = await cookieCensus('visit-2');
    f.visit2 = visit2;
    f.census = { visit1: c1, visit2: c2 };
  } else if (cell === 'post-form') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    f.tokenShape = await evalJS(`(() => { const v = document.getElementById('token').value; return { len: v.length, cls: /^[0-9a-f]+$/.test(v) ? 'lower-hex' : 'other' }; })()`);
    await evalJS(`(() => { document.getElementById('note').value = 'cell=post-form'; document.getElementById('f').requestSubmit(); return 'submitted'; })()`);
    await pollUntil(async () => {
      try { return (await evalJS(`document.readyState === 'complete' && document.title === 'TABI-R8-1 result'`)) === true; } catch { return false; }
    }, 'result');
    await capture('result');
    f.result = await pageFacts();
  } else if (cell === 'post-303') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    f.tokenShape = await evalJS(`(() => { const v = document.getElementById('token').value; return { len: v.length, cls: /^[0-9a-f]+$/.test(v) ? 'lower-hex' : 'other' }; })()`);
    f.fetch = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'token='+document.getElementById('token').value+'&note=cell-303'}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url, ct: x.headers.get('content-type')}))`, true);
    await sleep(250);
    await capture('after-303');
  } else if (cell === 'post-307') {
    f.fetch = await evalJS(`fetch('/echo307', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'k=v&n=12'}).then(x => x.text().then(t => ({status: x.status, redirected: x.redirected, finalUrl: x.url, text: t})))`, true);
    await sleep(250);
    await capture('after-307');
  } else if (cell === 'token-once') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    const body = `body:'token='+document.getElementById('token').value+'&note=cell-once'`;
    f.first = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, ${body}}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(150);
    f.replay = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, ${body}}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(150);
    await navigateAndWait(`${base}/result`, 'TABI-R8-1 result', 'result');
    await capture('result');
    f.result = await pageFacts();
  } else if (cell === 'dup-submit') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    f.both = await evalJS(`Promise.all([
      fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'token='+document.getElementById('token').value+'&n=a'}).then(x => ({status: x.status, redirected: x.redirected})),
      fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'token='+document.getElementById('token').value+'&n=b'}).then(x => ({status: x.status, redirected: x.redirected})),
    ])`, true);
    await sleep(300);
    f.bothSorted = [...f.both].sort((a, b) => a.status - b.status);
    await capture('after-dup');
  } else if (cell === 'interrupt-pre' || cell === 'interrupt-post' || cell === 'interrupt-post-guard') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    const apply = cell === 'interrupt-pre' ? 'pre' : 'post';
    const guard = cell === 'interrupt-post-guard' ? '&guard=1' : '';
    f.fetch = await evalJS(`new Promise((resolve) => {
      const ctl = new AbortController();
      const t0 = performance.now();
      fetch('/submit?apply=${apply}&hold=700${guard}', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'token=' + document.getElementById('token').value + '&note=${cell}',
        signal: ctl.signal,
      }).then(x => resolve({outcome:'resolved', status:x.status, redirected:x.redirected, atMs: Math.round(performance.now()-t0)}))
        .catch(e => resolve({outcome:'rejected', name:e.name, atMs: Math.round(performance.now()-t0)}));
      setTimeout(() => ctl.abort(), 150);
    })`, true);
    await sleep(1300);
    await capture('after-abort');
    f.page = await pageFacts();
  } else if (cell === 'replay-guard-skip') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    f.tokenShape = await evalJS(`(() => { const v = document.getElementById('token').value; return { len: v.length, cls: /^[0-9a-f]+$/.test(v) ? 'lower-hex' : 'other' }; })()`);
    const body = `body:'token=' + document.getElementById('token').value + '&note=cell=replay-guard-skip'`;
    f.abort = await evalJS(`new Promise((resolve) => {
      const ctl = new AbortController();
      const t0 = performance.now();
      fetch('/submit?apply=post&hold=700&guard=1', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        ${body},
        signal: ctl.signal,
      }).then(x => resolve({outcome:'resolved', status:x.status, redirected:x.redirected, atMs: Math.round(performance.now()-t0)}))
        .catch(e => resolve({outcome:'rejected', name:e.name, atMs: Math.round(performance.now()-t0)}));
      setTimeout(() => ctl.abort(), 150);
    })`, true);
    await sleep(1300);
    await capture('after-abort');
    f.replay = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, ${body}}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(250);
    await capture('after-replay');
    f.page = await pageFacts();
  } else if (cell === 'replay-consumed-pre' || cell === 'replay-consumed-post') {
    const apply = cell === 'replay-consumed-pre' ? 'pre' : 'post';
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    f.tokenShape = await evalJS(`(() => { const v = document.getElementById('token').value; return { len: v.length, cls: /^[0-9a-f]+$/.test(v) ? 'lower-hex' : 'other' }; })()`);
    const body = `body:'token=' + document.getElementById('token').value + '&note=cell=${cell}'`;
    f.abort = await evalJS(`new Promise((resolve) => {
      const ctl = new AbortController();
      const t0 = performance.now();
      fetch('/submit?apply=${apply}&hold=700', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        ${body},
        signal: ctl.signal,
      }).then(x => resolve({outcome:'resolved', status:x.status, redirected:x.redirected, atMs: Math.round(performance.now()-t0)}))
        .catch(e => resolve({outcome:'rejected', name:e.name, atMs: Math.round(performance.now()-t0)}));
      setTimeout(() => ctl.abort(), 150);
    })`, true);
    await sleep(1300);
    await capture('after-abort');
    f.replay = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, ${body}}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(250);
    await capture('after-replay');
    f.page = await pageFacts();
  } else if (cell === 'replay-unknown-token') {
    await navigateAndWait(`${base}/away`, 'TABI-R8-1 away', 'away');
    f.replay = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'token=0123456789abcdef&note=cell=unknown'}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(250);
    await capture('after-unknown');
    f.page = await pageFacts();
  } else if (cell === 'replay-terminus') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form');
    f.tokenShape = await evalJS(`(() => { const v = document.getElementById('token').value; return { len: v.length, cls: /^[0-9a-f]+$/.test(v) ? 'lower-hex' : 'other' }; })()`);
    const body = `body:'token=' + document.getElementById('token').value + '&note=cell=replay-terminus'`;
    f.submit = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, ${body}}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(200);
    f.postReplay = await evalJS(`fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, ${body}}).then(x => ({status: x.status, redirected: x.redirected, finalUrl: x.url}))`, true);
    await sleep(200);
    await navigateAndWait(`${base}/result`, 'TABI-R8-1 result', 'result-1');
    f.terminus1 = await pageFacts();
    await navigateAndWait(`${base}/result`, 'TABI-R8-1 result', 'result-2');
    f.terminus2 = await pageFacts();
    await capture('result');
  } else if (cell === 'double-apply-fresh-token') {
    await navigateAndWait(`${base}/form`, 'TABI-R8-1 form', 'form-1');
    f.tokens = await evalJS(`(async () => {
      const t1 = document.getElementById('token').value;
      const r1 = await fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'token=' + t1 + '&note=cell=double-apply'}).then(x => ({status:x.status, redirected:x.redirected, finalUrl:x.url}));
      const html = await fetch('/form').then(x => x.text());
      const t2 = (html.match(/name="token" value="([0-9a-f]+)"/) || [])[1] || '';
      const r2 = await fetch('/submit', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'token=' + t2 + '&note=cell=double-apply'}).then(x => ({status:x.status, redirected:x.redirected, finalUrl:x.url}));
      return {
        t1Shape: { len: t1.length, cls: /^[0-9a-f]+$/.test(t1) ? 'lower-hex' : 'other' },
        t2Shape: { len: t2.length, cls: /^[0-9a-f]+$/.test(t2) ? 'lower-hex' : 'other' },
        distinct: t1 !== t2, r1, r2,
      };
    })()`, true);
    await sleep(250);
    await navigateAndWait(`${base}/result`, 'TABI-R8-1 result', 'result');
    await capture('result');
    f.result = await pageFacts();
  } else if (cell === 'replay-307') {
    const once = `fetch('/echo307', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'k=v&n=12'}).then(x => x.text().then(t => ({status:x.status, redirected:x.redirected, finalUrl:x.url, text:t})))`;
    f.first = await evalJS(once, true);
    await sleep(200);
    f.replay = await evalJS(once, true);
    await sleep(200);
    await capture('after-replay307');
  } else if (cell === 'hop-abort-1' || cell === 'hop-abort-2') {
    const h1 = cell === 'hop-abort-1' ? 700 : 0;
    const h2 = cell === 'hop-abort-1' ? 0 : 700;
    f.fetch = await evalJS(`new Promise((resolve) => {
      const ctl = new AbortController();
      const t0 = performance.now();
      fetch('/slow-hop1?hold=${h1}&hold2=${h2}', { signal: ctl.signal })
        .then(x => x.text().then(t => resolve({outcome:'resolved', status:x.status, redirected:x.redirected, finalUrl:x.url, atMs: Math.round(performance.now()-t0), textLen: t.length})))
        .catch(e => resolve({outcome:'rejected', name:e.name, atMs: Math.round(performance.now()-t0)}));
      setTimeout(() => ctl.abort(), 150);
    })`, true);
    await sleep(1300);
    await capture('after-abort');
    f.page = await pageFacts();
    await navigateAndWait(`${base}/result`, 'TABI-R8-1 result', 'result-replay');
    await capture('result-replay');
    f.replay = await pageFacts();
  } else if (cell === 'nav-stop') {
    await send('Page.navigate', { url: `${base}/slow-hop1?hold=700&hold2=0` });
    await sleep(150);
    await send('Page.stopLoading');
    await sleep(1300);
    try { await capture('after-stop'); } catch (e) { f.captureError = String(e.message || e); }
    f.page = await pageFacts();
    await navigateAndWait(`${base}/result`, 'TABI-R8-1 result', 'result-replay');
    await capture('result-replay');
    f.replay = await pageFacts();
  } else if (cell === 'nav-supersede') {
    await send('Page.navigate', { url: `${base}/slow-hop1?hold=700&hold2=0` });
    await sleep(150);
    await send('Page.navigate', { url: `${base}/away` });
    await pollUntil(async () => {
      try { return (await evalJS(`document.readyState === 'complete' && document.title === 'TABI-R8-1 away'`)) === true; } catch { return false; }
    }, 'away');
    await sleep(1300);
    await capture('away');
    f.away = await pageFacts();
  } else {
    throw new Error(`unknown cell ${cell}`);
  }

  await fetchBodies();
  f.net = factsFromNet();
  f.requestCount = requestOrder.length;
  f.ledgerAfterCell = await ledgerNow();
  const hAll = await send('Page.getNavigationHistory');
  record.history = { currentIndex: hAll.currentIndex, entries: hAll.entries.map((e) => ({ url: e.url, title: e.title, transitionType: e.transitionType })) };
  record.facts = f;
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
  writeFileSync(join(out, 'journey.json'), JSON.stringify(record, null, 2));
  if (record.facts) writeFileSync(join(out, 'facts.json'), JSON.stringify(record.facts, null, 2));
  ws.close();
  process.exit(process.exitCode || 0);
}