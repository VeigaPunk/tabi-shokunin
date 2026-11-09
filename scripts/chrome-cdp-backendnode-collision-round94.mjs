#!/usr/bin/env node
// Chromium runner: tabi round 94, C1 (coverage capability `chromium-oopif-backendnode-collision-linux`).
// Domain: when a cross-site iframe's file-chooser `backendNodeId` B is sent on the PAGE session, what
// it resolves to depends on the parent renderer's own id map. Blink mints ids lazily, one process-wide
// counter per renderer: DOM serialization (`InspectorDOMAgent::BuildObjectForNode`, S231) calls
// `IdentifiersFactory::IntIdForNode` (S233) -> `Node::GetDomNodeId` (S234) -> `DOMNodeIds::IdForNode`
// (S232), and `AssertNode` resolves a sent id with `DOMNodeIds::NodeForId` in the receiving renderer.
// The reading under test: the r93 page-session `#document` is a COLLISION (the parent renderer's own
// id B), and an id the parent renderer never minted is a MISS.
//
// Three arms per rep, order C-r, M-r, S-r, each leg in a fresh browser and profile; no DOM
// serialization is requested before the click in any arm:
//   * C (collision) — parent http://127.0.0.1:<http>/parent.html?leg=<id>, child
//     http://localhost:<child>/child.html?leg=<id>&pad=0 (cross-site, own `iframe` target);
//   * M (miss) — same hosts, child `&pad=PAD`: PAD painted `<span>x</span>` elements precede the
//     input in the child document, so the child renderer has minted more ids by the time the
//     chooser reports B (a pre-freeze probe saw B=302 at PAD=300 with B=2 at PAD=0);
//   * S (same-site control) — child http://127.0.0.1:<child>/child.html?leg=<id>&pad=PAD (no own
//     target: parent and child share one renderer).
// Per leg, after a page-session click on `#s` and the chooser event (B = its backendNodeId):
//   1. `DOM.describeNode {backendNodeId: B}` on the chooser session and on the PAGE session;
//   2. `DOM.getDocument {depth: 0}` on the PAGE session (the parent root and its backendNodeId);
//   3. `DOM.getDocument {depth: -1, pierce: true}` on the PAGE session: INPUT#s count and the largest
//      backendNodeId in the tree;
//   4. C and M only: `DOM.setFileInputFiles {backendNodeId: B}` on the PAGE session, then the child's
//      files are read (`filesAfterCross`);
//   5. `DOM.setFileInputFiles {backendNodeId: B}` on the chooser session, then the files are read.
// The receipt carries raw observations only; its sole producer field is `failures` (legs whose
// runner threw), which the counter cross-checks against the per-leg `error` fields.
//
// Usage:
//   node chrome-cdp-backendnode-collision-round94.mjs --lane <ABS lane> --nonce <tabi-r94-...>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port N --child-port N --cdp-port N
//     [--reps 3] [--cross-host localhost] [--pad 300]
// Exit 0: every leg completed without a runner error and the receipt was written; 1: a leg recorded
// a runner error (the receipt is still written); 2: usage/setup refusal (no receipt written).
// Each chromium runs in its own process group, killed when its leg ends and on SIGINT/SIGTERM/SIGHUP
// or exit of this runner.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-backendnode-collision-r94';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const OPEN_WAIT_MS = 1500;
const LOAD_WAIT_MS = 1500;
const ANSWER_NAME = 'tabi-r94-answer.txt';
const ANSWER_BYTES = 'tabi round 94 answer.\n'; // 22 bytes
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const nonce = opt('nonce');
const scratch = opt('scratch');
const out = opt('out');
const reps = Number(opt('reps') || '3');
const crossHost = opt('cross-host') || 'localhost';
const PAD = Number(opt('pad') || '300');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!nonce || !/^tabi-r94-[a-z0-9-]{4,48}$/.test(nonce)) usage('--nonce must match tabi-r94-[a-z0-9-]{4,48}');
if (!scratch || !path.isAbsolute(scratch)) usage('--scratch must be an absolute path');
if (!out || !path.isAbsolute(out) || !out.endsWith('.json')) usage('--out must be an absolute .json path');
if (!Number.isInteger(reps) || reps < 1 || reps > 10) usage('--reps must be an integer 1..10');
if (!['localhost', '127.0.0.1'].includes(crossHost)) usage('--cross-host must be localhost or 127.0.0.1');
if (!Number.isInteger(PAD) || PAD < 0 || PAD > 5000) usage('--pad must be an integer 0..5000');
const ports = ['http-port', 'child-port', 'cdp-port'].map((k) => {
  const v = opt(k);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + k + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + k + ' out of range');
  return n;
});
const [httpPort, childPort, cdpPort] = ports;
if (new Set(ports).size !== 3) usage('ports must differ');
function freePort(port, host) {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', (e) => { s.close(); reject(new Error('port ' + port + ' busy: ' + e.message)); });
    s.once('listening', () => s.close(resolve));
    s.listen(port, host);
  });
}
try { for (const p of ports) await freePort(p, '127.0.0.1'); } catch (e) { usage('free-port precheck: ' + e.message); }
fs.mkdirSync(scratch, { recursive: true });
fs.mkdirSync(path.dirname(out), { recursive: true });

// process-group cleanup: every live chromium group is killed on exit and on signals.
const liveGroups = new Set();
const killGroup = (pid) => { try { process.kill(-pid, 'SIGKILL'); } catch {} liveGroups.delete(pid); };
process.on('exit', () => { for (const g of [...liveGroups]) killGroup(g); });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { for (const g of [...liveGroups]) killGroup(g); process.exit(130); });

const answerPath = path.join(scratch, ANSWER_NAME);
fs.writeFileSync(answerPath, ANSWER_BYTES);

const childHtml = (pad) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r94 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}#p{position:absolute;left:0;top:120px;width:480px;font:4px/4px monospace;color:#000}</style></head>
<body><div id="p">${'<span>x</span>'.repeat(pad)}</div><input type="file" id="s"><script>
window.__clicks = [];
window.addEventListener('click', function (e) { window.__clicks.push({ target: e.target && e.target.id ? e.target.id : null, isTrusted: e.isTrusted }); }, true);
window.__files = function () { return JSON.stringify(Array.from(document.getElementById('s').files, function (f) { return [f.name, f.size]; })); };
window.__rect = function () { var r = document.getElementById('s').getBoundingClientRect(); return JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height }); };
window.__ready = function () { return document.readyState === 'complete'; };
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r94 parent</title>
<style>html,body{margin:0;background:#fff}#c{position:absolute;left:120px;top:90px;width:500px;height:300px;border:0}</style></head>
<body><iframe id="c" src="${childUrl}"></iframe><script>
window.__frameRect = function () { var r = document.getElementById('c').getBoundingClientRect(); return JSON.stringify({ left: r.left, top: r.top }); };
window.__ready = function () { return document.readyState === 'complete'; };
</script></body></html>`;

let currentChildUrl = null;
const servers = [];
const serve = (port, handler) => new Promise((resolve) => { const s = http.createServer(handler); servers.push(s); s.listen(port, '127.0.0.1', resolve); });
await serve(httpPort, (q, r) => {
  if (q.url.startsWith('/parent.html')) { r.setHeader('content-type', 'text/html'); r.end(parentHtml(currentChildUrl)); return; }
  r.statusCode = 404; r.end();
});
await serve(childPort, (q, r) => {
  const u = new URL(q.url, 'http://x');
  const pad = Number(u.searchParams.get('pad'));
  if (u.pathname === '/child.html' && Number.isInteger(pad) && pad >= 0 && pad <= 5000) { r.setHeader('content-type', 'text/html'); r.end(childHtml(pad)); return; }
  r.statusCode = 404; r.end();
});

const chromiumVersion = (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim();

// a describeNode / getDocument node reduced to the fields the counter reads
const shapeOf = (n) => ({ nodeName: n.nodeName, attributes: Array.isArray(n.attributes) ? n.attributes : [], frameId: n.frameId || null, backendNodeId: Number.isInteger(n.backendNodeId) ? n.backendNodeId : null, documentURL: typeof n.documentURL === 'string' ? n.documentURL : null });
const nodeShape = (r) => {
  if (r.error) return { error: r.error.message, nodeName: null, attributes: null, frameId: null, backendNodeId: null, documentURL: null };
  const n = r.result && r.result.node;
  if (!n) return { error: 'no node in result', nodeName: null, attributes: null, frameId: null, backendNodeId: null, documentURL: null };
  return { error: null, ...shapeOf(n) };
};
// walk a (pierced) document tree: INPUT#s count, node count and the largest backendNodeId seen
const treeStats = (node) => {
  let inputS = 0, nodes = 0, maxBackendNodeId = 0;
  const walk = (n) => {
    if (!n) return;
    nodes++;
    if (Number.isInteger(n.backendNodeId) && n.backendNodeId > maxBackendNodeId) maxBackendNodeId = n.backendNodeId;
    if (n.nodeName === 'INPUT' && Array.isArray(n.attributes)) { for (let i = 0; i + 1 < n.attributes.length; i += 2) if (n.attributes[i] === 'id' && n.attributes[i + 1] === 's') inputS++; }
    for (const k of n.children || []) walk(k);
    if (n.contentDocument) walk(n.contentDocument);
    for (const k of n.shadowRoots || []) walk(k);
  };
  walk(node);
  return { inputS, nodes, maxBackendNodeId };
};

async function runLeg(arm, rep) {
  const legId = arm + '-' + rep;
  const cross = arm !== 'S';
  const pad = arm === 'C' ? 0 : PAD;
  const childHost = cross ? crossHost : '127.0.0.1';
  const childUrl = 'http://' + childHost + ':' + childPort + '/child.html?leg=' + legId + '&pad=' + pad;
  const parentUrl = 'http://127.0.0.1:' + httpPort + '/parent.html?leg=' + legId;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, 'leg-' + legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const leg = { leg: legId, arm, rep, pad, childHost, childUrl, parentUrl, browserVersion: null, browserId: null, attached: [], browserIframeTargets: null, childFrameId: null, choosers: [], describeChooser: null, describePage: null, pageRoot: null, pagePierce: null, crossAnswer: null, filesAfterCross: null, answer: null, childFiles: null, childClicks: null, error: null };
  const proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + cdpPort, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: true });
  liveGroups.add(proc.pid);
  let ws = null;
  try {
    let ver = null;
    for (let i = 0; i < 40 && !ver; i++) { try { ver = await (await fetch('http://127.0.0.1:' + cdpPort + '/json/version')).json(); } catch { await sleep(150); } }
    if (!ver) throw new Error('devtools endpoint never answered');
    leg.browserVersion = ver.Browser;
    leg.browserId = String(ver.webSocketDebuggerUrl || '').split('/').pop() || null;
    ws = new WebSocket(ver.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
    let id = 0; const pend = new Map(); const events = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else if (d.method) events.push(d); };
    const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify(sessionId ? { id: i, method, params, sessionId } : { id: i, method, params })); });
    const must = async (method, params, sid) => { const r = await send(method, params, sid); if (r.error) throw new Error(method + ': ' + JSON.stringify(r.error)); return r.result; };
    const t = await must('Target.createTarget', { url: 'about:blank' });
    const ps = (await must('Target.attachToTarget', { targetId: t.targetId, flatten: true })).sessionId;
    await must('Page.enable', {}, ps);
    await must('Runtime.enable', {}, ps);
    await must('Page.setInterceptFileChooserDialog', { enabled: true }, ps);
    await must('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true }, ps);
    await must('Page.navigate', { url: parentUrl }, ps);
    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) { await sleep(100); const r = await send('Runtime.evaluate', { expression: 'window.__ready && window.__ready()', returnByValue: true }, ps); ready = !!(r.result && r.result.result && r.result.result.value); }
    await sleep(LOAD_WAIT_MS);
    const sessionKind = new Map([[ps, 'page']]);
    for (const e of events.filter((x) => x.method === 'Target.attachedToTarget' && x.sessionId === ps)) {
      const ti = e.params.targetInfo;
      leg.attached.push({ type: ti.type, targetId: ti.targetId });
      if (ti.type === 'iframe') {
        sessionKind.set(e.params.sessionId, 'iframe');
        await must('Page.enable', {}, e.params.sessionId);
        await must('Page.setInterceptFileChooserDialog', { enabled: true }, e.params.sessionId);
      } else if (!sessionKind.has(e.params.sessionId)) sessionKind.set(e.params.sessionId, 'other:' + ti.type);
    }
    const all = (await must('Target.getTargets')).targetInfos;
    leg.browserIframeTargets = all.filter((x) => x.type === 'iframe').map((x) => ({ targetId: x.targetId, url: x.url }));
    const iframeSessions = [...sessionKind.entries()].filter(([, k]) => k === 'iframe').map(([s]) => s);
    const fr = JSON.parse((await must('Runtime.evaluate', { expression: '__frameRect()', returnByValue: true }, ps)).result.value);
    let childEval;
    if (iframeSessions.length === 1) {
      const cs = iframeSessions[0];
      childEval = (expression) => send('Runtime.evaluate', { expression, returnByValue: true }, cs);
      leg.childFrameId = (await must('Page.getFrameTree', {}, cs)).frameTree.frame.id;
    } else {
      const tree = (await must('Page.getFrameTree', {}, ps)).frameTree;
      leg.childFrameId = tree.childFrames && tree.childFrames.length === 1 ? tree.childFrames[0].frame.id : null;
      const ctx = events.filter((e) => e.method === 'Runtime.executionContextCreated' && e.sessionId === ps && e.params.context.auxData && e.params.context.auxData.frameId === leg.childFrameId && e.params.context.auxData.isDefault).pop();
      if (!ctx) throw new Error('no default execution context for the child frame');
      childEval = (expression) => send('Runtime.evaluate', { expression, returnByValue: true, contextId: ctx.params.context.id }, ps);
    }
    const childValue = async (expression) => { const r = await childEval(expression); if (r.error || !r.result || r.result.exceptionDetails) throw new Error('child eval ' + expression + ': ' + JSON.stringify(r.error || r.result.exceptionDetails)); return r.result.result.value; };
    for (let i = 0; i < 40; i++) { const r = await childEval('typeof __ready === "function" && __ready()'); if (r.result && r.result.result && r.result.result.value) break; await sleep(100); }
    const childRect = JSON.parse(await childValue('__rect()'));
    const x = fr.left + childRect.left + childRect.width / 2;
    const y = fr.top + childRect.top + childRect.height / 2;
    leg.click = { x, y };
    const mark = events.length;
    await must('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, ps);
    await must('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, ps);
    await sleep(OPEN_WAIT_MS);
    const chooserSids = [];
    for (const e of events.slice(mark).filter((x2) => x2.method === 'Page.fileChooserOpened')) {
      leg.choosers.push({ session: sessionKind.get(e.sessionId) || 'unknown', frameId: e.params.frameId, mode: e.params.mode, backendNodeId: e.params.backendNodeId ?? null });
      chooserSids.push(e.sessionId);
    }
    if (leg.choosers.length >= 1) {
      const c0 = leg.choosers[0];
      const csid = chooserSids[0];
      const B = c0.backendNodeId;
      leg.describeChooser = { session: c0.session, B, ...nodeShape(await send('DOM.describeNode', { backendNodeId: B }, csid)) };
      leg.describePage = { session: 'page', B, ...nodeShape(await send('DOM.describeNode', { backendNodeId: B }, ps)) };
      const root = await send('DOM.getDocument', { depth: 0 }, ps);
      leg.pageRoot = root.error ? { error: root.error.message } : { error: null, ...shapeOf(root.result.root) };
      const doc = await send('DOM.getDocument', { depth: -1, pierce: true }, ps);
      leg.pagePierce = doc.error ? { error: doc.error.message } : { error: null, ...treeStats(doc.result.root) };
      if (csid !== ps) {
        const rc = await send('DOM.setFileInputFiles', { files: [answerPath], backendNodeId: B }, ps);
        leg.crossAnswer = { session: 'page', B, error: rc.error ? rc.error.message : null };
        await sleep(300);
        leg.filesAfterCross = JSON.parse(await childValue('__files()'));
      }
      const r = await send('DOM.setFileInputFiles', { files: [answerPath], backendNodeId: B }, csid);
      leg.answer = { session: c0.session, B, error: r.error ? r.error.message : null };
      await sleep(300);
    }
    leg.childFiles = JSON.parse(await childValue('__files()'));
    leg.childClicks = JSON.parse(await childValue('JSON.stringify(__clicks)'));
  } catch (e) {
    leg.error = String(e && e.message || e);
  } finally {
    try { ws && ws.close(); } catch {}
    try { process.kill(-proc.pid, 'SIGTERM'); } catch {}
    await new Promise((r) => { if (proc.exitCode !== null) r(); else { proc.once('exit', r); setTimeout(r, 3000); } });
    killGroup(proc.pid);
    fs.rmSync(path.join(scratch, 'leg-' + legId), { recursive: true, force: true });
  }
  return leg;
}

const legs = [];
for (let rep = 1; rep <= reps; rep++) for (const arm of ['C', 'M', 'S']) legs.push(await runLeg(arm, rep));
for (const s of servers) s.close();
const receipt = {
  schema: SCHEMA,
  nonce,
  driverSha256: sha256(fs.readFileSync(SELF)),
  chromium: chromiumVersion,
  crossHost,
  reps,
  pad: PAD,
  answer: { name: ANSWER_NAME, size: Buffer.byteLength(ANSWER_BYTES) },
  ports: { http: httpPort, child: childPort, cdp: cdpPort },
  generatedAt: new Date().toISOString(),
  legs,
  failures: legs.filter((l) => l.error).map((l) => ({ leg: l.leg, error: l.error })),
};
fs.writeFileSync(out, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ out, legs: legs.length, failures: receipt.failures.length }));
process.exit(receipt.failures.length ? 1 : 0);
