#!/usr/bin/env node
// R92ExecProbe: limit-5 probe (H) — copy of chrome-cdp-iframe-chooser-round92.mjs runLeg,
// answering on the OTHER session first (page session in X; no iframe session in S),
// then answering on the iframe session (X only) for contrast. Ports 19301,19302,19303.
// Domain: where a file chooser opened inside an iframe is reported over CDP, and where it must be
// answered, when the iframe is cross-site (its own `iframe` target under `Target.setAutoAttach`
// flatten) versus same-site cross-origin (no target of its own).
//
// The r91 spot-check (§8 item 4) found the r91 "cross-origin" arm was same-site (127.0.0.1, other
// port) and that the r91 driver bound the first `type=page` target with no `Target.*` enumeration.
// This runner enumerates: two arms, each in a fresh browser per repetition:
//   * X — parent http://127.0.0.1:<http>/parent.html, child http://<cross-host>:<child>/child.html
//     (default cross-host `localhost`: a different site from 127.0.0.1 under scheme+host sites);
//   * S — the same parent, child http://127.0.0.1:<child>/child.html (same site, other port).
// Per leg: attach to the tab with flatten, enable chooser interception, `Target.setAutoAttach`
// (flatten) on the page session, navigate, enable interception on every attached `iframe` session,
// read the child input's rect (child session in X, parent `contentDocument` in S), click its centre
// with `Input.dispatchMouseEvent` on the PAGE session, collect `Page.fileChooserOpened` events with
// the session they arrived on for OPEN_WAIT_MS, answer the first one with `DOM.setFileInputFiles`
// on that same session, and read the child input's files.
//
// Usage:
//   node chrome-cdp-iframe-chooser-round92.mjs --lane <ABS lane> --nonce <tabi-r92-...>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port N --child-port N --cdp-port N
//     [--reps 3] [--cross-host localhost]
// Exit 0: every leg completed without a runner error and the receipt was written; 1: a leg recorded
// a runner error (the receipt is still written); 2: usage refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-iframe-chooser-r92';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const OPEN_WAIT_MS = 1500;
const LOAD_WAIT_MS = 1500;
const ANSWER_NAME = 'tabi-r92-answer.txt';
const ANSWER_BYTES = 'tabi round 92 answer.\n'; // 22 bytes
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
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!nonce || !/^tabi-r92-[a-z0-9-]{4,48}$/.test(nonce)) usage('--nonce must match tabi-r92-[a-z0-9-]{4,48}');
if (!scratch || !path.isAbsolute(scratch)) usage('--scratch must be an absolute path');
if (!out || !path.isAbsolute(out) || !out.endsWith('.json')) usage('--out must be an absolute .json path');
if (!Number.isInteger(reps) || reps < 1 || reps > 10) usage('--reps must be an integer 1..10');
if (!['localhost', '127.0.0.1'].includes(crossHost)) usage('--cross-host must be localhost or 127.0.0.1');
const ports = ['http-port', 'child-port', 'cdp-port'].map((k) => {
  const v = opt(k);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + k + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + k + ' out of range');
  return n;
});
const [httpPort, childPort, cdpPort] = ports;
if (new Set(ports).size !== 3) usage('ports must differ');
fs.mkdirSync(scratch, { recursive: true });
fs.mkdirSync(path.dirname(out), { recursive: true });
function freePort(port, host) {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', (e) => { s.close(); reject(new Error('port ' + port + ' busy: ' + e.message)); });
    s.once('listening', () => s.close(resolve));
    s.listen(port, host);
  });
}
try { for (const p of ports) await freePort(p, '127.0.0.1'); } catch (e) { usage('free-port precheck: ' + e.message); }

const answerPath = path.join(scratch, ANSWER_NAME);
fs.writeFileSync(answerPath, ANSWER_BYTES);

const CHILD_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r92 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}</style></head>
<body><input type="file" id="s"><script>
window.__clicks = [];
window.addEventListener('click', function (e) { window.__clicks.push({ target: e.target && e.target.id ? e.target.id : null, isTrusted: e.isTrusted }); }, true);
window.__files = function () { return JSON.stringify(Array.from(document.getElementById('s').files, function (f) { return [f.name, f.size]; })); };
window.__rect = function () { var r = document.getElementById('s').getBoundingClientRect(); return JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height }); };
window.__ready = function () { return document.readyState === 'complete'; };
</script></body></html>`;
const parentHtml = (childUrl) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r92 parent</title>
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
  if (q.url.startsWith('/child.html')) { r.setHeader('content-type', 'text/html'); r.end(CHILD_HTML); return; }
  r.statusCode = 404; r.end();
});

const chromiumVersion = (spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).stdout || '').trim();

async function runLeg(arm, rep) {
  const legId = arm + '-' + rep;
  const childHost = arm === 'X' ? crossHost : '127.0.0.1';
  const childUrl = 'http://' + childHost + ':' + childPort + '/child.html?leg=' + legId;
  const parentUrl = 'http://127.0.0.1:' + httpPort + '/parent.html?leg=' + legId;
  currentChildUrl = childUrl;
  const prof = path.join(scratch, 'leg-' + legId, 'profile');
  fs.mkdirSync(prof, { recursive: true });
  const leg = { leg: legId, arm, rep, childHost, childUrl, parentUrl, attached: [], iframeTargets: [], browserIframeTargets: null, choosers: [], answer: null, childFiles: null, childClicks: null, childFrameId: null, browserVersion: null, error: null };
  const proc = spawn(CHROMIUM, ['--headless=new', '--remote-debugging-port=' + cdpPort, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
  let ws = null;
  try {
    let ver = null;
    for (let i = 0; i < 40 && !ver; i++) { try { ver = await (await fetch('http://127.0.0.1:' + cdpPort + '/json/version')).json(); } catch { await sleep(150); } }
    if (!ver) throw new Error('devtools endpoint never answered');
    leg.browserVersion = ver.Browser;
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
    for (const a of leg.attached.filter((x) => x.type === 'iframe')) {
      const info = all.find((x) => x.targetId === a.targetId);
      leg.iframeTargets.push({ targetId: a.targetId, url: info ? info.url : null, parentFrameId: info ? info.parentFrameId || null : null });
    }
    // child frame id, the parent's frame rect, and an evaluator for the child document's main world:
    // X — the iframe target's own session; S — the page session with the child frame's default
    // execution context (the child is cross-origin to the parent, so `contentWindow` is opaque).
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
    for (const e of events.slice(mark).filter((x2) => x2.method === 'Page.fileChooserOpened')) {
      leg.choosers.push({ session: sessionKind.get(e.sessionId) || 'unknown', frameId: e.params.frameId, mode: e.params.mode, backendNodeId: e.params.backendNodeId ?? null });
    }
    if (leg.choosers.length >= 1) {
      const c0 = leg.choosers[0];
      const sidSame = [...sessionKind.entries()].find(([, k]) => k === c0.session)?.[0];
      // Probe step 1: answer on the OTHER session with the same backendNodeId.
      // X: chooser arrived on iframe session, so answer on PAGE session (ps).
      // S: chooser arrived on page session and there is no iframe session, so "other" is
      //      undefined; record that explicitly (no call made).
      leg.probe = { otherSession: arm === 'X' ? 'page' : null, pageSessionAnswer: null, filesAfterPageAnswer: null, iframeSessionAnswer: null };
      if (arm === 'X') {
        const rOther = await send('DOM.setFileInputFiles', { files: [answerPath], backendNodeId: c0.backendNodeId }, ps);
        leg.probe.pageSessionAnswer = { error: rOther.error ? rOther.error.message : null };
        await sleep(300);
        leg.probe.filesAfterPageAnswer = JSON.parse(await childValue('__files()'));
        // Probe step 2: now answer on the iframe session (the session the chooser arrived on)
        const rSame = await send('DOM.setFileInputFiles', { files: [answerPath], backendNodeId: c0.backendNodeId }, sidSame);
        leg.probe.iframeSessionAnswer = { error: rSame.error ? rSame.error.message : null };
        await sleep(300);
      } else {
        // S arm: no iframe session exists; the "other session" half of H is vacuous.
        // Record files before any answer, mirroring X step-1 observation point.
        leg.probe.filesAfterPageAnswer = JSON.parse(await childValue('__files()'));
        // Control: answer on the page session (the session the chooser arrived on, as in driver).
        const rSame = await send('DOM.setFileInputFiles', { files: [answerPath], backendNodeId: c0.backendNodeId }, ps);
        leg.probe.iframeSessionAnswer = { note: 'S arm: no iframe session to answer on; answered on page session (chooser session)', error: rSame.error ? rSame.error.message : null };
        await sleep(300);
      }
      leg.answer = { session: c0.session, error: leg.probe.iframeSessionAnswer ? leg.probe.iframeSessionAnswer.error : null };
    }
    leg.childFiles = JSON.parse(await childValue('__files()'));
    leg.childClicks = JSON.parse(await childValue('JSON.stringify(__clicks)'));
  } catch (e) {
    leg.error = String(e && e.message || e);
  } finally {
    try { ws && ws.close(); } catch {}
    proc.kill('SIGTERM');
    await new Promise((r) => { proc.once('exit', r); setTimeout(r, 3000); });
    fs.rmSync(path.join(scratch, 'leg-' + legId), { recursive: true, force: true });
  }
  return leg;
}

const legs = [];
for (let rep = 1; rep <= reps; rep++) for (const arm of ['X', 'S']) legs.push(await runLeg(arm, rep));
for (const s of servers) s.close();
const receipt = {
  schema: SCHEMA,
  nonce,
  driverSha256: sha256(fs.readFileSync(SELF)),
  chromium: chromiumVersion,
  crossHost,
  reps,
  answer: { name: ANSWER_NAME, size: Buffer.byteLength(ANSWER_BYTES) },
  ports: { http: httpPort, child: childPort, cdp: cdpPort },
  generatedAt: new Date().toISOString(),
  legs,
  failures: legs.filter((l) => l.error).map((l) => ({ leg: l.leg, error: l.error })),
};
fs.writeFileSync(out, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ out, legs: legs.length, failures: receipt.failures.length }));
process.exit(receipt.failures.length ? 1 : 0);
