#!/usr/bin/env node
// TABI-R3-1 — CDP multi-step journey runner over the Python http.server fixture.
// Journey: index.html -> detail.html?id=1 -> form.html?id=1 -> confirm.html (GET submit).
// Usage: node journey.mjs --cdp=<port> --base=<http://127.0.0.1:PORT> --out=<dir>
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

const record = {
  base,
  startedAtUTC: new Date().toISOString(),
  captures: [],
  actions: [],
  netEvents: [],
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
  if (msg.method === 'Network.requestWillBeSent') {
    const e = {
      requestId: msg.params.requestId,
      method: msg.params.request.method,
      url: msg.params.request.url,
      type: msg.params.type,
      status: null,
      mimeType: null,
      failed: null,
      atUTC: new Date().toISOString(),
    };
    netOrder.push(e);
    netById.set(e.requestId, e);
  } else if (msg.method === 'Network.responseReceived') {
    const e = netById.get(msg.params.requestId);
    if (e) {
      e.status = msg.params.response.status;
      e.mimeType = msg.params.response.mimeType;
      e.fromDiskCache = msg.params.response.fromDiskCache === true;
      e.fromMemoryCache = msg.params.response.fromMemoryCache === true;
      e.fromServiceWorker = msg.params.response.fromServiceWorker === true;
      e.respAtUTC = new Date().toISOString();
    }
  } else if (msg.method === 'Network.loadingFailed') {
    const e = netById.get(msg.params.requestId);
    if (e) e.failed = msg.params.errorText;
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
  const netSlice = netOrder
    .slice(netMark)
    .map((e) => ({ method: e.method, url: e.url, type: e.type, status: e.status, mimeType: e.mimeType, fromDiskCache: e.fromDiskCache, fromMemoryCache: e.fromMemoryCache, failed: e.failed }));
  netMark = netOrder.length;
  const rec = {
    tag,
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
    type: e.type,
    status: e.status,
    mimeType: e.mimeType,
    fromDiskCache: e.fromDiskCache,
    fromMemoryCache: e.fromMemoryCache,
    failed: e.failed,
    atUTC: e.atUTC,
  }));
  writeFileSync(join(out, 'journey.json'), JSON.stringify(record, null, 2));
  ws.close();
  process.exit(process.exitCode || 0);
}