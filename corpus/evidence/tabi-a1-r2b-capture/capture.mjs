#!/usr/bin/env node
// TABI-R2-1 — CDP capture runner over the Python http.server fixture.
// Usage: node capture.mjs --phase=det|nondet --cdp=<port> --url=<fixture-url> --out=<dir>
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (!m) throw new Error(`bad arg ${a}`);
  args[m[1]] = m[2];
}
const { phase, cdp, url, out } = args;
if (!phase || !cdp || !url || !out) throw new Error('usage: --phase --cdp --url --out');
const cdpBase = `http://127.0.0.1:${cdp}`;

const record = { phase, url, startedAtUTC: new Date().toISOString(), captures: [] };

const j = async (path) => (await fetch(cdpBase + path)).json();
const version = await j('/json/version');
record.browser = {
  browser: version.Browser,
  protocolVersion: version['Protocol-Version'],
  userAgent: version.UserAgent,
};

const list = await j('/json/list');
const page = list.find((t) => t.type === 'page');
if (!page) throw new Error('no page target');
record.target = { id: page.id, url: page.url, title: page.title, ws: page.webSocketDebuggerUrl };

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = () => res(); ws.onerror = () => rej(new Error('ws error')); });

let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
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

async function capture(tag) {
  await settleFrames();
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const png = Buffer.from(shot.data, 'base64');
  writeFileSync(join(out, `${phase}-${tag}.png`), png);
  const dom = await send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
  writeFileSync(join(out, `${phase}-${tag}.domsnapshot.json`), JSON.stringify(dom));
  const shape = deriveShape(dom);
  writeFileSync(join(out, `${phase}-${tag}.shape.txt`), shape.text);
  const volatile = JSON.parse(await evalJS(`JSON.stringify({
    clock: document.getElementById('clock').textContent,
    random: document.getElementById('random').textContent,
    status: document.getElementById('status').textContent,
    count: document.getElementById('count').textContent,
    items: [...document.querySelectorAll('#list li')].map(li => li.id),
    confirms: [...document.querySelectorAll('#confirms div')].map(d => d.id)
  })`));
  const rec = {
    tag,
    atUTC: new Date().toISOString(),
    png: { file: `${phase}-${tag}.png`, bytes: png.length, dims: pngDims(png), sha256: sha256(png) },
    shape: {
      file: `${phase}-${tag}.shape.txt`,
      sha256: sha256(shape.text),
      structSha256: sha256(shape.struct),
      nodes: shape.nodes,
      title: shape.title,
      contentWidth: shape.contentWidth,
      contentHeight: shape.contentHeight,
    },
    volatile,
  };
  record.captures.push(rec);
  console.log(
    `capture ${phase}/${tag} png=${rec.png.sha256.slice(0, 16)} shape=${rec.shape.sha256.slice(0, 16)} nodes=${shape.nodes}`
  );
  return rec;
}

async function main() {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await pollUntil(
    async () => (await evalJS(`document.title === 'TABI-R2-1 fixture' && document.readyState === 'complete'`)) === true,
    'fixture document loaded'
  );
  await pollUntil(
    async () => (await evalJS(`document.getElementById('status')?.textContent === 'hydrated'`)) === true,
    'status hydrated'
  );
  record.viewport = {
    innerWidth: await evalJS('window.innerWidth'),
    innerHeight: await evalJS('window.innerHeight'),
    devicePixelRatio: await evalJS('window.devicePixelRatio'),
    layout: await send('Page.getLayoutMetrics'),
  };

  if (phase === 'det') {
    await capture('before');
    await sleep(300);
    await capture('before2');
    const rect = await evalJS(`(() => {
      const r = document.querySelector('#btn').getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    })()`);
    record.click = { target: '#btn', rect };
    for (let i = 0; i < 2; i++) {
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
      await pollUntil(
        async () =>
          (await evalJS(
            `document.querySelectorAll('#list li').length === ${i + 1} && !!document.getElementById('confirm-${i + 1}')`
          )) === true,
        `post-click state ${i + 1}`
      );
    }
    await capture('after');
  } else {
    await capture('nd1');
    await sleep(1250);
    await capture('nd2');
  }
}

try {
  await main();
} catch (e) {
  record.error = String((e && e.stack) || e);
  console.error('ERROR:', record.error);
  process.exitCode = 1;
} finally {
  writeFileSync(join(out, `${phase}.json`), JSON.stringify(record, null, 2));
  ws.close();
  process.exit(process.exitCode || 0);
}