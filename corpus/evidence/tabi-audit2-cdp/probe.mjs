// TABI-AUDIT2 re-run of tabi-shokunin cdp-evidence-patterns.md recipe. Zero npm deps (node >=21 global WebSocket).
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PORT = 19441;
const base = `http://127.0.0.1:${PORT}`;
const summary = {};

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  static connect(url) {
    return new Promise((res, rej) => {
      const ws = new WebSocket(url);
      ws.addEventListener('open', () => res(new CDP(ws)));
      ws.addEventListener('error', rej);
    });
  }
  close() { this.ws.close(); }
}

const DOC = '<!doctype html><html><head><title>tabi3-probe</title></head><body><h1 id="h">TABI-3 evidence probe</h1><p id="p">loopback capture</p></body></html>';
const DATA_URL = 'data:text/html,' + DOC;

async function getJson(endpoint) {
  const r = await fetch(`${base}${endpoint}`);
  return r.json();
}

// --- §3 browser-level Target.getTargets ---
const ver = await getJson('/json/version');
summary.versionFields = Object.keys(ver).sort();
const browser = await CDP.connect(ver.webSocketDebuggerUrl);
const gt = await browser.send('Target.getTargets');
summary.targetGetTargetsCount = gt.targetInfos.length;
summary.targetInfoFieldsFirst = Object.keys(gt.targetInfos[0]).sort();
summary.targetTypesAtProbe = gt.targetInfos.map(t => t.type);
browser.close();

// --- §2/§4 page-level session ---
const list = await getJson('/json/list');
const page = list.find(t => t.type === 'page');
summary.pageIdBeforeNav = page.id;
const cdp = await CDP.connect(page.webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('DOM.enable');
await cdp.send('DOMSnapshot.enable');

const nav = await cdp.send('Page.navigate', { url: DATA_URL });
summary.navFrameId = nav.frameId;
summary.frameIdEqualsTargetId = nav.frameId === page.id;

async function waitComplete() {
  for (let i = 0; i < 50; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'document.readyState' });
    if (r.result.value === 'complete') return 'complete';
    await new Promise(res => setTimeout(res, 100));
  }
  return 'timeout';
}
summary.readyState1 = await waitComplete();

const titleEval = await cdp.send('Runtime.evaluate', { expression: 'document.title' });
summary.evalDocumentTitle = titleEval.result.value;

const list2 = await getJson('/json/list');
const page2 = list2.find(t => t.type === 'page');
summary.listTitleAfterNav = page2.title;
summary.listUrlAfterNav = page2.url;
summary.urlPreservedVerbatim = page2.url === DATA_URL;
summary.listTypesAfterNav = list2.map(t => t.type);

async function shot(tag) {
  const s = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const buf = Buffer.from(s.data, 'base64');
  const path = `/tmp/tabi-audit2-cdp/screenshot-${tag}.png`;
  writeFileSync(path, buf);
  return {
    tag, base64Chars: s.data.length, bytes: buf.length,
    magic: buf.subarray(0, 8).toString('hex'),
    width: buf.readUInt32BE(16), height: buf.readUInt32BE(20),
    sha256: createHash('sha256').update(buf).digest('hex'), path,
  };
}
summary.screenshotRun1 = await shot('run1');

// fresh navigation -> second independent capture (byte-determinism claim §4)
await cdp.send('Page.navigate', { url: DATA_URL });
summary.readyState2 = await waitComplete();
summary.screenshotRun2 = await shot('run2');
summary.screenshotsByteIdentical = summary.screenshotRun1.sha256 === summary.screenshotRun2.sha256;

// --- §4 DOM.getDocument ---
const doc = await cdp.send('DOM.getDocument', { depth: -1 });
const root = doc.root;
summary.getDocumentRootKeys = Object.keys(root).sort();
summary.getDocumentRoot = { nodeId: root.nodeId, backendNodeId: root.backendNodeId, nodeType: root.nodeType, nodeName: root.nodeName };
let domCount = 0;
(function walk(n) { domCount++; (n.children || []).forEach(walk); })(root);
summary.getDocumentNodeCount = domCount;

// --- §4 DOMSnapshot.captureSnapshot ---
const snap = await cdp.send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
summary.snapshotTopKeys = Object.keys(snap).sort();
summary.snapshotStringsLen = snap.strings.length;
summary.snapshotDocumentsLen = snap.documents.length;
summary.snapshotDocKeys = Object.keys(snap.documents[0]).sort();
const nodes = snap.documents[0].nodes;
summary.snapshotNodeFields = Object.keys(nodes).sort();
summary.snapshotNodeCount = nodes.nodeName.length;
summary.snapshotNode0 = {
  nodeNameStringIndex: nodes.nodeName[0],
  nodeNameResolved: snap.strings[nodes.nodeName[0]],
  nodeTypeRaw: nodes.nodeType[0],
  parentIndexRaw: nodes.parentIndex[0],
};
cdp.close();

writeFileSync('/tmp/tabi-audit2-cdp/audit-summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
