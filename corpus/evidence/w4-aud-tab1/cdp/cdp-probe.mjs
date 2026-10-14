import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const PORT = Number(process.env.CDP_PORT || 19333);
const DATA_URL = 'data:text/html;charset=utf-8,' + encodeURIComponent(
  '<!doctype html><html><head><title>tabi3-probe</title></head><body>' +
  '<h1 id="h">TABI-3 evidence probe</h1><p id="p">loopback capture</p></body></html>');

function sha256(buf) { return createHash('sha256').update(buf).digest('hex'); }

async function fetchJson(path) {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return r.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    let id = 0;
    ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    });
    const send = (method, params = {}) => new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, m => (m.error ? rej(new Error(method + ' ' + JSON.stringify(m.error))) : res(m.result)));
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
    ws.addEventListener('open', () => resolve({ ws, send }));
    ws.addEventListener('error', e => reject(new Error('ws error ' + JSON.stringify(e.message || e))));
  });
}

const out = { capturedAt: new Date().toISOString() };

const version = await fetchJson('/json/version');
out.version = {
  Browser: version.Browser,
  'Protocol-Version': version['Protocol-Version'],
  'User-Agent': version['User-Agent'],
  'V8-Version': version['V8-Version'],
  browserWsHost: new URL(version.webSocketDebuggerUrl).host,
};

const listBefore = await fetchJson('/json/list');
out.listBefore = {
  count: listBefore.length,
  fieldNames: Object.keys(listBefore[0]).sort(),
  byType: listBefore.reduce((m, t) => (m[t.type] = (m[t.type] || 0) + 1, m), {}),
  pageTarget: listBefore.find(t => t.type === 'page'),
};

// --- page session: navigate + screenshot + DOM evidence ---
const page = listBefore.find(t => t.type === 'page');
const { send } = await connect(page.webSocketDebuggerUrl);

await send('Page.enable');
await send('Runtime.enable');
const nav = await send('Page.navigate', { url: DATA_URL });

for (let i = 0; i < 50; i++) {
  const r = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
  if (r.result.value === 'complete') break;
  await new Promise(r => setTimeout(r, 100));
}
const titleEval = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
const urlEval = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
const png = Buffer.from(shot.data, 'base64');
writeFileSync('/tmp/w4-aud-tab1/cdp/screenshot.png', png);
out.screenshot = {
  base64Chars: shot.data.length,
  bytes: png.length,
  sha256: sha256(png),
  pngMagic: png.subarray(0, 8).toString('hex'),
  width: png.readUInt32BE(16),
  height: png.readUInt32BE(20),
};

const dom = await send('DOM.getDocument', { depth: -1, pierce: false });
let nodeCount = 0;
(function walk(n) { nodeCount++; (n.children || []).forEach(walk); })(dom.root);
out.domGetDocument = {
  rootKeys: Object.keys(dom.root).sort(),
  nodeCount,
  root: { nodeId: dom.root.nodeId, backendNodeId: dom.root.backendNodeId, nodeType: dom.root.nodeType, nodeName: dom.root.nodeName },
};

const snap = await send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
const doc0 = snap.documents[0];
out.domSnapshot = {
  topLevelKeys: Object.keys(snap).sort(),
  stringCount: snap.strings.length,
  documentCount: snap.documents.length,
  document0Keys: Object.keys(doc0).sort(),
  nodes: { count: doc0.nodes.nodeType.length, fieldNames: Object.keys(doc0.nodes).sort() },
  sampleNode0: {
    nodeType: doc0.nodes.nodeType[0],
    nodeName: snap.strings[doc0.nodes.nodeName[0]],
    nodeValue: snap.strings[doc0.nodes.nodeValue[0]],
    parentIndex: doc0.nodes.parentIndex[0],
  },
};
out.runtimeCrossCheck = {
  navFrameId: nav.frameId,
  documentTitle: titleEval.result.value,
  locationHref: urlEval.result.value,
};

// --- browser session: Target.getTargets schema ---
const browser = await connect(version.webSocketDebuggerUrl);
const t = await browser.send('Target.getTargets', {});
out.browserTargetGetTargets = {
  count: t.targetInfos.length,
  targetInfoFieldNames: Object.keys(t.targetInfos[0]).sort(),
  byType: t.targetInfos.reduce((m, x) => (m[x.type] = (m[x.type] || 0) + 1, m), {}),
};
browser.ws.close();

const listAfter = await fetchJson('/json/list');
out.listAfter = {
  count: listAfter.length,
  probeTarget: listAfter.find(t => t.title === 'tabi3-probe') || null,
};

writeFileSync('/tmp/w4-aud-tab1/cdp/cdp-summary.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(0);