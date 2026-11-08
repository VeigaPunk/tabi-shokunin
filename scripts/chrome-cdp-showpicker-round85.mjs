#!/usr/bin/env node
// Chromium runner: tabi round 82, C1 (coverage capability `chromium-showpicker-linux`,
// generation r84). Domain: programmatic file-picker invocation — `HTMLInputElement.showPicker()`
// — under `Page.setInterceptFileChooserDialog`, on Chromium 155/Linux `--headless=new`.
//
// Generation r84 adds the frontier legs round 80 named and did not hold:
//   * the cross-origin NON-file branch: a `type=date` input inside a cross-origin iframe
//     (parent 127.0.0.1:<http>, child 127.0.0.1:<child>) whose own script calls `showPicker()`
//     — the SecurityError the spec and Chromium keep for non-file/color inputs;
//   * the ORDER discriminator: the same call on a DISABLED `type=date` input, same-origin
//     (InvalidStateError — mutability) and cross-origin (SecurityError — the origin check runs
//     first in Chromium), i.e. the spec's order vs Chromium's;
//   * the `webkitdirectory` ANSWER: the chooser event answered with `DOM.setFileInputFiles`
//     naming a DIRECTORY — what the input's file list and `webkitRelativePath` become;
//   * the `accept`-constrained ANSWER: a `.txt` file delivered to an `accept=".png"` input —
//     accepted or refused, measured;
//   * a REAL CLICK on an input whose picker is already open (the trigger's chooser pending):
//     does a second chooser event fire?
//
// The page fixture is the round-78 driver's /*CHOOSER-FIXTURE-BEGIN*/ template, extracted
// byte-identical at runtime and patched with exactly four additions, each asserted present:
//   * a neutral `<div id="pad">` (no default action) used to grant transient user activation
//     with a real trusted CDP click, `<input type="file" id="dis" disabled>` and
//     `<input type="date" id="disd" disabled>` (the same-origin mutability leg);
//   * `__inputs()` also describes `dis` and `disd`; `__state()` also reports their file lists;
//   * `fl()` reports a fourth column, `webkitRelativePath` (the directory-answer leg);
//   * a cross-origin iframe (`#xo`) whose own document carries `type=date` inputs.
// The fixture's own event recorder already captures pointer/mouse/click/input/change/cancel
// events with isTrusted, the transient-activation state, coordinates and file lists.
//
// One fresh browser per leg (the launch token, profile, HOME/XDG and crash-db dirs are per leg):
// `navigator.userActivation.hasBeenActive` is per-window state, so a shared browser would let an
// earlier leg's activation leak into a later "no activation" leg. Every leg records its own
// cdpSendLog/cdpEventLog, argv, frame tree and teardown proof.
//
// Usage:
//   node chrome-cdp-showpicker-round81.mjs --lane <ABS lane> --nonce <tabi-r85-...>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port <1024..65535>
//     --cdp-port <1024..65535> --child-port <1024..65535>   (child origin for the cross-origin legs)
// Exit 0: every leg completed with no error and the receipt was written; 1: a leg failed (the
// receipt is still written, with the failure recorded); 2: usage refusal. The driver records; it
// does not judge the law — the counter does (round-78 lesson: a producer self-check that pins a
// browser-assigned id refused honest runs).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-showpicker-r85';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const FIXTURE_SOURCE = path.join(path.dirname(SELF), 'chrome-cdp-filechooser-round78.mjs');
const VIEWPORT = { width: 1280, height: 900 };
const OPEN_WAIT_MS = 2000;
const MIN_OBSERVE_MS = 2000;
const SETTLE_MS = 500;
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const nonce = opt('nonce');
const scratchDir = opt('scratch');
const outReceipt = opt('out');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!nonce || !/^tabi-r85-[a-z0-9-]{4,48}$/.test(nonce)) usage('--nonce must match tabi-r85-[a-z0-9-]{4,48}');
if (!scratchDir || !path.isAbsolute(scratchDir)) usage('--scratch must be an absolute path');
if (!outReceipt || !path.isAbsolute(outReceipt) || !outReceipt.endsWith('.json')) usage('--out must be an absolute .json path');
const ports = ['http-port', 'cdp-port', 'child-port'].map((key) => {
  const v = opt(key);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + key + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + key + ' out of range');
  return n;
});
const [fixturePort, devPort, childPort] = ports;
if (new Set(ports).size !== 3) usage('HTTP, CDP and child ports must all differ');
fs.mkdirSync(scratchDir, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
function freePort(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', (e) => { srv.close(); reject(new Error('port ' + port + ' busy')); });
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}
try { for (const p of ports) await freePort(p); } catch (e) { usage('free-port precheck: ' + e.message); }
{
  const sock = Buffer.byteLength(path.join(fs.realpathSync(scratchDir), 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sock > 107) usage('scratch too long for the Chromium singleton socket: ' + sock);
}

// ---- fixture: the round-78 template, byte-identical, plus the asserted patches ----
const driverSrc = fs.readFileSync(FIXTURE_SOURCE, 'utf8');
const fm = /\/\*CHOOSER-FIXTURE-BEGIN\*\/\r?\nconst FIXTURE_TEMPLATE = (`[\s\S]*?`);?\r?\n\/\*CHOOSER-FIXTURE-END\*\//.exec(driverSrc);
if (!fm || !fm[1].startsWith('`') || !fm[1].endsWith('`') || fm[1].includes('${')) usage('could not extract the fixture template from ' + FIXTURE_SOURCE);
const TEMPLATE = (0, eval)('(' + fm[1] + ')');
const PATCH_STYLE = ' #pad { position: absolute; width: 120px; height: 40px; background: #eef; left: 300px; top: 20px; } #dis { left: 100px; top: 500px; } #disd { left: 300px; top: 500px; } #xo { position: absolute; left: 40px; top: 120px; width: 600px; height: 500px; border: 0; } #s { top: 650px !important; } #m { top: 650px !important; } #d { top: 650px !important; } #k { top: 650px !important; } #tes { left: 100px; top: 750px; } #ses { left: 300px; top: 750px; } #txs { left: 500px; top: 750px; }';
const PATCH_BODY = '<div id="pad"></div><input type="file" id="dis" disabled><input type="date" id="disd" disabled><input type="tel" id="tes"><input type="search" id="ses"><input type="text" id="txs"><iframe id="xo" src="__CHILD_ORIGIN__/child.html?run=__NONCE__"></iframe>';
const CHILD_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r84 child origin</title>
<style>html, body { margin: 0; padding: 0; background: #fef; } #s, #dis, #dt, #dtd, #co, #mo, #wk, #tm, #nu, #rg, #te, #se, #tx, #multiple, #accept, #secondtag, #go, #go2, #go3, #go4, #go5, #go6, #go7, #go8, #go9, #go10, #go11, #go12, #go13, #go14 { position: absolute; width: 120px; height: 40px; margin: 0; padding: 0; border: 0; } #s { left: 20px; top: 20px; } #dis { left: 20px; top: 80px; } #dt { left: 20px; top: 140px; } #dtd { left: 20px; top: 200px; } #co { left: 20px; top: 260px; } #mo { left: 20px; top: 320px; } #wk { left: 20px; top: 380px; } #tm { left: 20px; top: 440px; } #nu { left: 20px; top: 500px; } #rg { left: 20px; top: 560px; } #te { left: 20px; top: 800px; } #se { left: 20px; top: 860px; } #tx { left: 20px; top: 920px; } #multiple { left: 20px; top: 620px; } #accept { left: 20px; top: 680px; } #secondtag { left: 20px; top: 740px; } #go12 { left: 360px; top: 220px; } #go13 { left: 360px; top: 280px; } #go14 { left: 360px; top: 340px; } #go { left: 160px; top: 20px; } #go2 { left: 160px; top: 80px; } #go3 { left: 300px; top: 20px; } #go4 { left: 300px; top: 80px; } #go5 { left: 160px; top: 140px; } #go6 { left: 160px; top: 200px; } #go7 { left: 160px; top: 260px; } #go8 { left: 160px; top: 320px; } #go9 { left: 160px; top: 380px; } #go10 { left: 160px; top: 440px; } #go11 { left: 300px; top: 140px; } #co { left: 20px; top: 260px; } #mo { left: 20px; top: 320px; } #wk { left: 20px; top: 380px; } #tm { left: 20px; top: 440px; } #nu { left: 20px; top: 500px; } #rg { left: 20px; top: 560px; } #te { left: 20px; top: 800px; } #se { left: 20px; top: 860px; } #tx { left: 20px; top: 920px; } #multiple { left: 20px; top: 620px; } #accept { left: 20px; top: 680px; } #secondtag { left: 20px; top: 740px; }</style>
<script>
window.__r = null; window.__r2 = null; window.__r3 = null; window.__r4 = null; window.__r5 = null; window.__r6 = null; window.__r7 = null; window.__r8 = null; window.__r9 = null; window.__r10 = null; window.__r11 = null; window.__r12 = null; window.__r13 = null; window.__r14 = null; window.__events = []; window.__closed = false; window.__late = 0; window.__leg = 'start';
const push = function (o) { if (window.__closed) { window.__late++; return; } o.at = performance.now(); window.__events.push(o); };
for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'input', 'change', 'cancel'])
  window.addEventListener(t, function (e) { push({ type: e.type, isTrusted: e.isTrusted, target: e.target && e.target.id ? e.target.id : null, act: navigator.userActivation.isActive }); }, true);
window.__setLeg = function (n) { window.__leg = n; return n; };
window.__act = function () { return JSON.stringify({ isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive }); };
window.__state = function () { return JSON.stringify({ s: Array.from(document.getElementById('s').files, function (f) { return [f.name, f.size, f.type]; }), dis: Array.from(document.getElementById('dis').files, function (f) { return [f.name, f.size, f.type]; }), dtValue: document.getElementById('dt').value, dtdValue: document.getElementById('dtd').value, coValue: document.getElementById('co').value, moValue: document.getElementById('mo').value, wkValue: document.getElementById('wk').value, tmValue: document.getElementById('tm').value, nuValue: document.getElementById('nu').value, rgValue: document.getElementById('rg').value, teValue: document.getElementById('te').value, seValue: document.getElementById('se').value, txValue: document.getElementById('tx').value }); };
window.__closeRecord = function () { window.__closed = true; return JSON.stringify({ events: window.__events, closedAt: performance.now() }); };
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('go').addEventListener('click', function () { try { var r = document.getElementById('s').showPicker(); window.__r = { ok: true, ret: String(r) }; } catch (e) { window.__r = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go2').addEventListener('click', function () { try { var r = document.getElementById('dis').showPicker(); window.__r2 = { ok: true, ret: String(r) }; } catch (e) { window.__r2 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go3').addEventListener('click', function () { try { var r = document.getElementById('dt').showPicker(); window.__r3 = { ok: true, ret: String(r) }; } catch (e) { window.__r3 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go4').addEventListener('click', function () { try { var r = document.getElementById('dtd').showPicker(); window.__r4 = { ok: true, ret: String(r) }; } catch (e) { window.__r4 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go5').addEventListener('click', function () { try { var r = document.getElementById('co').showPicker(); window.__r5 = { ok: true, ret: String(r) }; } catch (e) { window.__r5 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go6').addEventListener('click', function () { try { var r = document.getElementById('mo').showPicker(); window.__r6 = { ok: true, ret: String(r) }; } catch (e) { window.__r6 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go7').addEventListener('click', function () { try { var r = document.getElementById('wk').showPicker(); window.__r7 = { ok: true, ret: String(r) }; } catch (e) { window.__r7 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go8').addEventListener('click', function () { try { var r = document.getElementById('tm').showPicker(); window.__r8 = { ok: true, ret: String(r) }; } catch (e) { window.__r8 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go9').addEventListener('click', function () { try { var r = document.getElementById('nu').showPicker(); window.__r9 = { ok: true, ret: String(r) }; } catch (e) { window.__r9 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go10').addEventListener('click', function () { try { var r = document.getElementById('rg').showPicker(); window.__r10 = { ok: true, ret: String(r) }; } catch (e) { window.__r10 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go11').addEventListener('click', function () { try { var r = document.getElementById('s').showPicker(); window.__r11 = { ok: true, ret: String(r) }; } catch (e) { window.__r11 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go12').addEventListener('click', function () { try { var r = document.getElementById('te').showPicker(); window.__r12 = { ok: true, ret: String(r) }; } catch (e) { window.__r12 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go13').addEventListener('click', function () { try { var r = document.getElementById('se').showPicker(); window.__r13 = { ok: true, ret: String(r) }; } catch (e) { window.__r13 = { ok: false, name: e.name, message: e.message }; } });
  document.getElementById('go14').addEventListener('click', function () { try { var r = document.getElementById('tx').showPicker(); window.__r14 = { ok: true, ret: String(r) }; } catch (e) { window.__r14 = { ok: false, name: e.name, message: e.message }; } });
});
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><input type="file" id="s"><input type="file" id="dis" disabled><input type="date" id="dt"><input type="date" id="dtd" disabled><input type="color" id="co"><input type="month" id="mo"><input type="week" id="wk"><input type="time" id="tm"><input type="number" id="nu"><input type="range" id="rg"><input type="tel" id="te"><input type="search" id="se"><input type="text" id="tx"><input type="file" id="multiple" multiple><input type="file" id="accept" accept="image/png"><input type="file" id="secondtag"><button id="go">go</button><button id="go2">go2</button><button id="go3">go3</button><button id="go4">go4</button><button id="go5">go5</button><button id="go6">go6</button><button id="go7">go7</button><button id="go8">go8</button><button id="go9">go9</button><button id="go10">go10</button><button id="go12">go12</button><button id="go13">go13</button><button id="go14">go14</button><button id="go11">go11</button></body></html>`;
const PATCH_FL_FROM = "const fl = function (t) { return Array.from(t.files, function (f) { return [f.name, f.size, f.type]; }); };";
const PATCH_FL_TO = "const fl = function (t) { return t.files ? Array.from(t.files, function (f) { return [f.name, f.size, f.type, f.webkitRelativePath]; }) : []; };";
const PATCH_INPUTS_FROM = "['s', 'm', 'd', 'k', 'f'].map";
const PATCH_INPUTS_TO = "['s', 'm', 'd', 'k', 'f', 'dis', 'disd', 'tes', 'ses', 'txs'].map";
const PATCH_STATE_FROM = "s: fl(g('s')), m: fl(g('m')), d: fl(g('d')), k: fl(g('k')), sValue: g('s').value";
const PATCH_STATE_TO = "s: fl(g('s')), m: fl(g('m')), d: fl(g('d')), k: fl(g('k')), dis: fl(g('dis')), disd: fl(g('disd')), sValue: g('s').value";
for (const [from, to] of [[PATCH_FL_FROM, PATCH_FL_TO], [PATCH_INPUTS_FROM, PATCH_INPUTS_TO], [PATCH_STATE_FROM, PATCH_STATE_TO]]) {
  const n = TEMPLATE.split(from).length - 1;
  if (n !== 1) usage('fixture patch anchor not unique: ' + from.slice(0, 40) + ' (' + n + ')');
}
const PATCHED = TEMPLATE
  .replace('</style>', PATCH_STYLE + '</style>')
  .replace('</body>', PATCH_BODY + '</body>')
  .replace(PATCH_FL_FROM, PATCH_FL_TO)
  .replace(PATCH_INPUTS_FROM, PATCH_INPUTS_TO)
  .replace(PATCH_STATE_FROM, PATCH_STATE_TO);
for (const needle of [PATCH_STYLE, PATCH_BODY, PATCH_FL_TO, PATCH_INPUTS_TO, PATCH_STATE_TO]) {
  if (!PATCHED.includes(needle)) usage('fixture patch did not apply: ' + needle.slice(0, 40));
}
const CHILD_ORIGIN = 'http://127.0.0.1:' + childPort;
const FIXTURE_HTML = PATCHED.replaceAll('__CHILD_ORIGIN__', CHILD_ORIGIN).replaceAll('__NONCE__', nonce);
const CHILD_HTML = CHILD_TEMPLATE.replaceAll('__NONCE__', nonce);

// The page-side expression the driver sends to invoke showPicker(). One exact template per
// target so the counter can reconstruct every allowed expression from the leg plan.
const wrapperFor = (target) => '(function(){ try { var r = document.getElementById(' + JSON.stringify(target) + ').showPicker(); return {ok: true, ret: String(r)}; } catch (e) { return {ok: false, name: e.name, message: e.message}; } })()';
const ACT_EXPR = 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})';
const READY_EXPR = (n) => 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(n);

// Legs. `kind: 'showpicker'` invokes showPicker() on `target`; `showpicker-cross-origin` clicks a
// button inside the cross-origin iframe (the child's own script calls showPicker on its own
// input); `showpicker-answer` answers the chooser event with DOM.setFileInputFiles;
// `showpicker-click-while-open` triggers a picker and then dispatches a REAL click on the same
// input while the chooser is still pending.
const CHILD_BUTTONS = { go: { x: 220, y: 40, field: 'window.__r' }, go2: { x: 220, y: 100, field: 'window.__r2' }, go3: { x: 360, y: 40, field: 'window.__r3' }, go4: { x: 360, y: 100, field: 'window.__r4' }, go5: { x: 220, y: 160, field: 'window.__r5' }, go6: { x: 220, y: 220, field: 'window.__r6' }, go7: { x: 220, y: 280, field: 'window.__r7' }, go8: { x: 220, y: 340, field: 'window.__r8' }, go9: { x: 220, y: 400, field: 'window.__r9' }, go10: { x: 220, y: 460, field: 'window.__r10' }, go11: { x: 360, y: 160, field: 'window.__r11' }, go12: { x: 360, y: 220, field: 'window.__r12' }, go13: { x: 360, y: 280, field: 'window.__r13' }, go14: { x: 360, y: 340, field: 'window.__r14' } };
const LEGS = [
  { name: 'sp84-cross-origin-nonfile', kind: 'showpicker-cross-origin', target: 'dt', childButton: 'go3', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-nonfile-disabled', kind: 'showpicker-cross-origin', target: 'dtd', childButton: 'go4', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-color', kind: 'showpicker-cross-origin', target: 'co', childButton: 'go5', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-month', kind: 'showpicker-cross-origin', target: 'mo', childButton: 'go6', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-week', kind: 'showpicker-cross-origin', target: 'wk', childButton: 'go7', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-time', kind: 'showpicker-cross-origin', target: 'tm', childButton: 'go8', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-same-origin-nonfile-disabled', kind: 'showpicker', target: 'disd', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp84-webkitdirectory-answer', kind: 'showpicker-answer', target: 'd', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r85-dir'] },
  { name: 'sp84-accept-answer', kind: 'showpicker-answer', target: 'k', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r85-a.txt'] },
  { name: 'sp84-click-while-open', kind: 'showpicker-click-while-open', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, clickAt: [160, 670] },
  { name: 'sp84-cross-origin-number', kind: 'showpicker-cross-origin', target: 'nu', childButton: 'go9', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-range', kind: 'showpicker-cross-origin', target: 'rg', childButton: 'go10', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-tel', kind: 'showpicker-cross-origin', target: 'te', childButton: 'go12', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-search', kind: 'showpicker-cross-origin', target: 'se', childButton: 'go13', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-text', kind: 'showpicker-cross-origin', target: 'tx', childButton: 'go14', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-multiple-mode', kind: 'showpicker-answer', target: 'm', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r85-a.txt'] },
  { name: 'sp84-accept-mime-answer', kind: 'showpicker-answer', target: 'k', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r85-b.png'] },
  { name: 'sp84-second-chooser-answer', kind: 'showpicker-second-chooser-answer', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, clickAt: [160, 670], files: ['tabi-r85-second.txt'] },
  { name: 'sp85-same-origin-tel', kind: 'showpicker', target: 'tes', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp85-same-origin-search', kind: 'showpicker', target: 'ses', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp85-same-origin-text', kind: 'showpicker', target: 'txs', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp85-same-origin-tel-activated', kind: 'showpicker', target: 'tes', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp85-same-origin-search-activated', kind: 'showpicker', target: 'ses', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp85-same-origin-text-activated', kind: 'showpicker', target: 'txs', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
];

let launchSeq = 0;
const receipt = {
  schema: SCHEMA, lane: path.basename(lane), nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', node: process.version },
  fixture: { sha256: sha256(FIXTURE_HTML), origin: 'http://127.0.0.1:' + fixturePort, viewport: VIEWPORT, patch: { style: PATCH_STYLE, body: PATCH_BODY, inputs: PATCH_INPUTS_TO, state: PATCH_STATE_TO }, child: { sha256: sha256(CHILD_HTML), origin: CHILD_ORIGIN } },
  ports: { http: fixturePort, cdp: devPort, child: childPort },
  frameTree: null, fixtureInputs: null, legs: [], failures: [],
};
{
  const v = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000 });
  receipt.host.chromium = v.status === 0 ? v.stdout.trim() : 'failed status ' + v.status;
}

const needlePids = (needles) => {
  const out = [];
  try {
    const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
    if (r.status !== 0) return { error: 'ps exited ' + r.status, pids: out };
    for (const line of (r.stdout || '').split('\n')) {
      if (needles.some((n) => line.includes(n))) {
        const pid = Number(line.trim().split(/\s+/)[0]);
        if (Number.isInteger(pid) && pid > 1) out.push(pid);
      }
    }
  } catch (e) { return { error: e.message, pids: out }; }
  return { error: null, pids: out };
};
async function sweepToZero(needles) {
  let rounds = 0; let last = null;
  while (rounds < SWEEP_MAX_ROUNDS) {
    last = needlePids(needles);
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await sleep(SWEEP_WAIT_MS);
    rounds++;
  }
  return { rounds, survivors: last && !last.error ? last.pids : [], error: last ? last.error : 'never-ran' };
}
function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (!done) { done = true; try { s.destroy(); } catch {} resolve(v); } };
    s.setTimeout(PORT_PROBE_TIMEOUT_MS, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}

class CdpError extends Error { constructor(obj) { super(JSON.stringify(obj)); this.cdp = obj; } }
const errObj = (e) => (e instanceof CdpError ? { code: e.cdp.code ?? null, message: e.cdp.message ?? null } : { code: null, message: String(e && e.message) });

async function runLeg(leg) {
  const idx = LEGS.indexOf(leg);
  const rec = {
    name: leg.name, kind: leg.kind, target: leg.target, intercept: leg.intercept, priorClick: leg.priorClick ?? null, gesture: leg.gesture ?? null,
    interceptSendId: null, interceptResult: null, interceptError: null,
    priorPressId: null, priorReleaseId: null, priorClickElement: null, priorClickError: null,
    triggerSendId: null, triggerResult: null, triggerError: null, showPicker: null,
    trigger2SendId: null, trigger2Result: null, trigger2Error: null, showPicker2: null,
    chooserWaitMs: null, activationBefore: null, activationAfter: null, stateAfter: null,
    dismissSendId: null, dismissResult: null, dismissError: null, stateAfterDismiss: null,
    armSendId: null, armResult: null, armError: null, deferredResult: null,
    childContextId: null, childActivationBefore: null, childActivationAfter: null, childState: null,
    childResult: null, childResult2: null, childEvents: [], childClosedAt: null, childLate: null, parentCrossAccess: null,
    answer: null, upload: null, uploadDir: null, contexts: [],
    clickPressId: null, clickReleaseId: null, clickError: null, clickWhileOpenChoosersBefore: null, clickWhileOpenChoosersAfter: null, clickWhileOpenElement: null, firstChooserBackendNodeId: null, secondChooserBackendNodeId: null, uploadPng: null, uploadSecond: null,
    pageEvents: [], marks: [], closedAt: null, lateAfterClose: null,
    argv: [], cdpSendLog: [], cdpEventLog: [], teardown: null, devtoolsListening: null, errors: [],
  };
  const cdpSendLog = rec.cdpSendLog; const cdpEventLog = rec.cdpEventLog;
  const launchToken = crypto.randomBytes(6).toString('hex');
  const profileDir = path.join(scratchDir, 'profile-' + launchToken);
  const runHome = path.join(scratchDir, 'home-' + launchToken);
  const runXdgConfig = path.join(runHome, '.config');
  const runXdg = {
    HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, XDG_CACHE_HOME: path.join(runHome, '.cache'),
    XDG_DATA_HOME: path.join(runHome, '.local', 'share'), XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
    XDG_RUNTIME_DIR: path.join(runHome, 'run'), TMPDIR: scratchDir,
  };
  const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
  for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR, profileDir]) fs.mkdirSync(d, { recursive: true });
  const uploadDir = path.join(scratchDir, 'upload-' + launchToken);
  fs.mkdirSync(uploadDir, { recursive: true });
  const uploadBytes = Buffer.from('tabi-r83-answer-alpha\n');
  fs.writeFileSync(path.join(uploadDir, 'tabi-r85-a.txt'), uploadBytes);
  const uploadPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x74, 0x61, 0x62, 0x69, 0x2d, 0x72, 0x38, 0x33, 0x2d, 0x70, 0x6e, 0x67, 0x0a]);
  fs.writeFileSync(path.join(uploadDir, 'tabi-r85-b.png'), uploadPng);
  const uploadSecond = Buffer.from('tabi-r83-second-attribution\n');
  fs.writeFileSync(path.join(uploadDir, 'tabi-r85-second.txt'), uploadSecond);
  rec.uploadPng = { name: 'tabi-r85-b.png', size: uploadPng.length, sha256: sha256(uploadPng), hex: uploadPng.toString('hex') };
  rec.uploadSecond = { name: 'tabi-r85-second.txt', size: uploadSecond.length, sha256: sha256(uploadSecond), hex: uploadSecond.toString('hex') };
  const dirName = 'tabi-r85-dir';
  const dirPath = path.join(uploadDir, dirName);
  fs.mkdirSync(dirPath, { recursive: true });
  const dirInner = [['inner-a.txt', Buffer.from('tabi-r83-dir-alpha\n')], ['inner-b.png', Buffer.from('tabi-r83-dir-beta\n')]];
  for (const [n, b] of dirInner) fs.writeFileSync(path.join(dirPath, n), b);
  rec.upload = { name: 'tabi-r85-a.txt', size: uploadBytes.length, sha256: sha256(uploadBytes) };
  rec.uploadDir = { name: dirName, files: dirInner.map(([n, b]) => ({ name: n, size: b.length, sha256: sha256(b) })) };
  const needles = [launchToken, profileDir, runCrashDb];
  const pre = needlePids(needles);
  if (pre.error || pre.pids.length !== 0) { rec.errors.push('launch token not fresh: ' + JSON.stringify(pre)); return rec; }
  const serverLog = [];
  const childServerLog = [];
  const fixtureServer = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    serverLog.push({ path: u.pathname, run: u.searchParams.get('run') || '', status: u.pathname === '/' ? 200 : 404 });
    res.writeHead(u.pathname === '/' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
  });
  const childServer = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    childServerLog.push({ path: u.pathname, run: u.searchParams.get('run') || '', status: u.pathname === '/child.html' ? 200 : 404 });
    res.writeHead(u.pathname === '/child.html' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(u.pathname === '/child.html' ? CHILD_HTML : 'not found');
  });
  const origin = 'http://127.0.0.1:' + fixturePort;
  const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + devPort,
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
    '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
    '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  rec.argv = childArgv;
  rec.launchToken = launchToken;
  let child = null; let ws = null; let stderrHead = ''; let closing = null;
  const teardown = async () => {
    if (closing) return closing;
    closing = (async () => {
      try { if (ws) ws.close(); } catch {}
      if (child && child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
      await sleep(600);
      const swept = await sweepToZero(needles);
      fixtureServer.closeAllConnections();
      childServer.closeAllConnections();
      await Promise.race([new Promise((resolve) => fixtureServer.close(resolve)), sleep(2000)]);
      await Promise.race([new Promise((resolve) => childServer.close(resolve)), sleep(2000)]);
      const portProbes = { fixture: await probePort(fixturePort), devtools: await probePort(devPort), child: await probePort(childPort) };
      const curlExit = (p) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + p + '/'], { encoding: 'utf8', timeout: 4000 }).status;
      rec.teardown = {
        sweepRounds: swept.rounds, survivors: swept.survivors, sweepError: swept.error,
        portProbes, postKillCurl: { fixture: curlExit(fixturePort), devtools: curlExit(devPort), child: curlExit(childPort) },
      };
      if (swept.error || swept.survivors.length) rec.errors.push('teardown sweep: ' + JSON.stringify(swept));
      if (Object.values(portProbes).some((v) => v !== 'closed')) rec.errors.push('teardown ports: ' + JSON.stringify(portProbes));
      if (Object.values(rec.teardown.postKillCurl).some((v) => v !== 7)) rec.errors.push('teardown curl: ' + JSON.stringify(rec.teardown.postKillCurl));
    })();
    return closing;
  };
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { teardown(); });
  try {
    await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(fixturePort, '127.0.0.1', resolve); });
    await new Promise((resolve, reject) => { childServer.once('error', reject); childServer.listen(childPort, '127.0.0.1', resolve); });
    child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
    let launchError = null;
    child.on('error', (e) => { launchError = e; });
    child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
    const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
    let page = null;
    for (let k = 0; k < 400 && !page; k++) {
      if (launchError) throw launchError;
      try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find((t) => t.type === 'page'); } catch {}
      if (!page) await sleep(150);
    }
    if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + devPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('ws open timeout')), 20000);
      ws.addEventListener('open', () => { clearTimeout(t); resolve(); }, { once: true });
      ws.addEventListener('error', () => { clearTimeout(t); reject(new Error('ws error')); }, { once: true });
    });
    let msgId = 0; const pending = new Map();
    const LOGGED_EVENTS = new Set(['Page.fileChooserOpened', 'Page.frameNavigated', 'Runtime.executionContextCreated']);
    ws.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (typeof msg.method === 'string' && msg.id === undefined) {
        if (!LOGGED_EVENTS.has(msg.method)) return;
        if (msg.method === 'Runtime.executionContextCreated') {
          const c = msg.params && msg.params.context;
          if (!c || !c.auxData) return;
          rec.contexts.push({ id: c.id, origin: c.origin, name: c.name, type: c.type, frameId: c.auxData.frameId ?? null, isDefault: c.auxData.isDefault === true });
          return;
        }
        if (msg.method === 'Page.frameNavigated') {
          const f = msg.params && msg.params.frame;
          if (!f || f.parentId !== undefined) return;
          cdpEventLog.push({ method: msg.method, params: { frameId: f.id, url: f.url }, afterSendId: msgId });
          return;
        }
        cdpEventLog.push({ method: msg.method, params: msg.params, afterSendId: msgId });
        return;
      }
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new CdpError(msg.error)) : p.resolve(msg); }
    });
    const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => {
      const id = ++msgId; cdpSendLog.push({ id, method, params });
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs);
      pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
    });
    const evalValue = async (expression, extra = {}) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, ...extra });
      if (r.result.exceptionDetails) throw new Error('eval-exception: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
      return r.result.result.value;
    };
    const evalInContext = async (contextId, expression) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, contextId });
      if (r.result.exceptionDetails) throw new Error('eval-exception: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
      return r.result.result.value;
    };
    const ver = await send('Browser.getVersion');
    rec.cdpProduct = ver.result.product;
    rec.cdpProtocolVersion = ver.result.protocolVersion;
    await send('Page.enable'); await send('Runtime.enable');
    const ft = (await send('Page.getFrameTree')).result.frameTree;
    rec.frameTree = { mainFrameId: ft.frame.id, mainFrameParentId: ft.frame.parentId ?? null, mainFrameUrl: ft.frame.url };
    await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
    let ready = false;
    for (let k = 0; k < 100 && !ready; k++) {
      try { ready = await evalValue(READY_EXPR(nonce)); } catch {}
      if (!ready) await sleep(100);
    }
    if (!ready) throw new Error('fixture not ready');
    rec.fixtureInputs = JSON.parse(await evalValue('window.__inputs()'));
    rec.serverLog = serverLog;
    rec.childServerLog = childServerLog;
    const chooserCount = () => cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').length;
    const setLeg = async (name) => { await evalValue('window.__setLeg(' + JSON.stringify(name) + ')'); };
    await setLeg('pre');
    rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    const before = chooserCount();
    if (leg.intercept) {
      const p = send('Page.setInterceptFileChooserDialog', leg.intercept); rec.interceptSendId = msgId;
      try { rec.interceptResult = (await p).result; } catch (e) { rec.interceptError = errObj(e); }
    }
    if (leg.armExpr) {
      const p = send('Runtime.evaluate', { expression: leg.armExpr, returnByValue: true }); rec.armSendId = msgId;
      try { const r = await p; rec.armResult = r.result.result ? r.result.result.value : null; } catch (e) { rec.armError = errObj(e); }
    }
    if (leg.priorClick) {
      await setLeg('prior-click');
      rec.priorClickElement = await evalValue('document.elementFromPoint(' + leg.priorClick.at[0] + ',' + leg.priorClick.at[1] + ').id');
      const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: leg.priorClick.at[0], y: leg.priorClick.at[1], button: 'left', buttons: 1, clickCount: 1 });
      rec.priorPressId = msgId;
      try { await press; } catch (e) { rec.priorClickError = errObj(e); }
      const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: leg.priorClick.at[0], y: leg.priorClick.at[1], button: 'left', buttons: 0, clickCount: 1 });
      rec.priorReleaseId = msgId;
      try { await release; } catch (e) { rec.priorClickError = errObj(e); }
      await sleep(150);
      rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    }
    const crossOrigin = leg.kind === 'showpicker-cross-origin' || leg.kind === 'showpicker-cross-origin-disabled';
    if (crossOrigin) {
      let childCtx = null;
      for (let k = 0; k < 120 && !childCtx; k++) {
        const c = rec.contexts.find((x) => x.origin === CHILD_ORIGIN && x.isDefault === true && x.frameId);
        if (c) {
          try { if (await evalInContext(c.id, 'document.readyState === "complete" && !!document.getElementById("go")')) childCtx = c; } catch {}
        }
        if (!childCtx) await sleep(100);
      }
      if (!childCtx) throw new Error('child context not ready');
      rec.childContextId = childCtx.id;
      rec.childActivationBefore = JSON.parse(await evalInContext(childCtx.id, 'window.__act()'));
      const rect = JSON.parse(await evalValue('JSON.stringify(document.getElementById("xo").getBoundingClientRect())'));
      const btn = CHILD_BUTTONS[leg.childButton];
      if (!btn) throw new Error('unknown child button ' + leg.childButton);
      const bx = rect.left + btn.x;
      const by = rect.top + btn.y;
      await evalInContext(childCtx.id, 'window.__setLeg("child-click")');
      const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bx, y: by, button: 'left', buttons: 1, clickCount: 1 }); rec.priorPressId = msgId;
      try { await press; } catch (e) { rec.priorClickError = errObj(e); }
      const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bx, y: by, button: 'left', buttons: 0, clickCount: 1 }); rec.priorReleaseId = msgId;
      try { await release; } catch (e) { rec.priorClickError = errObj(e); }
      const field = btn.field;
      const t0 = Date.now();
      while (Date.now() - t0 < OPEN_WAIT_MS) {
        try { const v = await evalInContext(childCtx.id, field); if (v) { rec.childResult = v; break; } } catch {}
        await sleep(20);
      }
      rec.chooserWaitMs = Date.now() - t0;
      while (Date.now() - t0 < MIN_OBSERVE_MS) await sleep(50);
      rec.childActivationAfter = JSON.parse(await evalInContext(childCtx.id, 'window.__act()'));
      rec.childState = JSON.parse(await evalInContext(childCtx.id, 'window.__state()'));
      const crec = JSON.parse(await evalInContext(childCtx.id, 'window.__closeRecord()'));
      rec.childEvents = crec.events; rec.childClosedAt = crec.closedAt;
      await sleep(SETTLE_MS);
      rec.childLate = await evalInContext(childCtx.id, 'window.__late');
      rec.parentCrossAccess = JSON.parse(await evalValue('JSON.stringify((function(){ var f = document.getElementById("xo"); var out = { contentDocument: f.contentDocument === null ? null : "object" }; try { var d = f.contentWindow.document; out.windowDocument = d ? "object" : null; } catch (e) { out.windowDocument = e.name; } return out; })())'));
    } else {
      await setLeg('show-picker');
      const triggerAt = Date.now();
      const params = { expression: wrapperFor(leg.target), returnByValue: true };
      if (leg.gesture) params.userGesture = true;
      const p = send('Runtime.evaluate', params); rec.triggerSendId = msgId;
      let r = null;
      try { r = await p; } catch (e) { rec.triggerError = errObj(e); }
      if (r) {
        const v = r.result.result ? r.result.result.value : undefined;
        rec.showPicker = v === undefined ? null : v;
        rec.triggerResult = r.result.exceptionDetails ? { exceptionDetails: r.result.exceptionDetails } : { value: v === undefined ? null : v };
      }
      const t0 = Date.now();
      while (chooserCount() === before && Date.now() - t0 < OPEN_WAIT_MS) await sleep(20);
      rec.chooserWaitMs = Date.now() - triggerAt;
      if (leg.kind === 'showpicker-twice-gesture') {
        await setLeg('show-picker-2');
        const p2 = send('Runtime.evaluate', { expression: wrapperFor(leg.target), returnByValue: true, userGesture: true }); rec.trigger2SendId = msgId;
        let r2 = null;
        try { r2 = await p2; } catch (e) { rec.trigger2Error = errObj(e); }
        if (r2) {
          const v2 = r2.result.result ? r2.result.result.value : undefined;
          rec.showPicker2 = v2 === undefined ? null : v2;
          rec.trigger2Result = r2.result.exceptionDetails ? { exceptionDetails: r2.result.exceptionDetails } : { value: v2 === undefined ? null : v2 };
        }
      }
      if (leg.kind === 'showpicker-deferred') {
        rec.deferredResult = JSON.parse(await evalValue('JSON.stringify(window.__r)'));
      }
      if (leg.kind === 'showpicker-click-while-open') {
        // a REAL click on the input while its own chooser is still pending: the click's default
        // action is a second picker request; interception is on, so a second chooser event is the
        // witness. The click is dispatched only when the trigger's chooser is already open.
        rec.clickWhileOpenChoosersBefore = chooserCount() - before;
        const cr = JSON.parse(await evalValue('JSON.stringify(document.getElementById(' + JSON.stringify(leg.target) + ').getBoundingClientRect())'));
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        await setLeg('click-while-open');
        const cp = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', buttons: 1, clickCount: 1 }); rec.clickPressId = msgId;
        try { await cp; } catch (e) { rec.clickError = errObj(e); }
        const cq = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', buttons: 0, clickCount: 1 }); rec.clickReleaseId = msgId;
        try { await cq; } catch (e) { rec.clickError = errObj(e); }
        await sleep(600);
        rec.clickWhileOpenChoosersAfter = chooserCount() - before;
        rec.clickWhileOpenElement = await evalValue('document.elementFromPoint(' + cx + ',' + cy + ').id');
      }
      if (leg.kind === 'showpicker-second-chooser-answer') {
        // Trigger a picker, click the input while open (second chooser), then answer the LAST
        // chooser event with distinct bytes. If the delivered bytes are attributable to the
        // second event, the second chooser is answerable; otherwise the shared backendNodeId
        // limit stands. The answer is attempted AFTER the click so both choosers are open.
        rec.clickWhileOpenChoosersBefore = chooserCount() - before;
        const cr = JSON.parse(await evalValue('JSON.stringify(document.getElementById(' + JSON.stringify(leg.target) + ').getBoundingClientRect())'));
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        await setLeg('click-while-open');
        const cp = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', buttons: 1, clickCount: 1 }); rec.clickPressId = msgId;
        try { await cp; } catch (e) { rec.clickError = errObj(e); }
        const cq = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', buttons: 0, clickCount: 1 }); rec.clickReleaseId = msgId;
        try { await cq; } catch (e) { rec.clickError = errObj(e); }
        await sleep(600);
        rec.clickWhileOpenChoosersAfter = chooserCount() - before;
        rec.clickWhileOpenElement = await evalValue('document.elementFromPoint(' + cx + ',' + cy + ').id');
        const evs = cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened');
        const ev = evs.slice(-1)[0];
        rec.secondChooserBackendNodeId = ev ? ev.params.backendNodeId : null;
        rec.firstChooserBackendNodeId = evs[0] ? evs[0].params.backendNodeId : null;
        if (ev) {
          const files = leg.files.map((n) => path.join(uploadDir, n));
          rec.answer = { files: leg.files, setParams: { files, backendNodeId: ev.params.backendNodeId }, setSendId: null, setResult: null, setError: null };
          const sp = send('DOM.setFileInputFiles', rec.answer.setParams); rec.answer.setSendId = msgId;
          try { rec.answer.setResult = (await sp).result; } catch (e) { rec.answer.setError = errObj(e); }
          await sleep(600);
        }
      }
      if (leg.kind === 'showpicker-answer' && chooserCount() > before) {
        const ev = cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').slice(-1)[0];
        const files = leg.files.map((n) => path.join(uploadDir, n));
        rec.answer = { files: leg.files, setParams: { files, backendNodeId: ev.params.backendNodeId }, setSendId: null, setResult: null, setError: null };
        const sp = send('DOM.setFileInputFiles', rec.answer.setParams); rec.answer.setSendId = msgId;
        try { rec.answer.setResult = (await sp).result; } catch (e) { rec.answer.setError = errObj(e); }
        await sleep(600);
      }
      while (Date.now() - triggerAt < MIN_OBSERVE_MS) await sleep(50);
    }
    await setLeg('settle');
    await sleep(SETTLE_MS);
    rec.activationAfter = JSON.parse(await evalValue(ACT_EXPR));
    rec.stateAfter = JSON.parse(await evalValue('window.__state()'));
    if (chooserCount() > before && leg.intercept && !leg.intercept.cancel) {
      const p = send('Page.setInterceptFileChooserDialog', { enabled: true, cancel: true }); rec.dismissSendId = msgId;
      try { rec.dismissResult = (await p).result; } catch (e) { rec.dismissError = errObj(e); }
      await sleep(SETTLE_MS);
      rec.stateAfterDismiss = JSON.parse(await evalValue('window.__state()'));
    }
    const record = JSON.parse(await evalValue('window.__closeRecord()'));
    rec.pageEvents = record.events;
    rec.marks = record.marks;
    rec.closedAt = record.closedAt;
    await sleep(SETTLE_MS);
    rec.lateAfterClose = await evalValue('window.__late');
    rec.stderrHead = stderrHead.slice(0, 2000);
    const dl = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
    rec.devtoolsListening = dl ? { url: dl[1], port: Number(dl[2]), browserId: dl[3] } : null;
  } catch (e) {
    rec.errors.push('drive-error: ' + (e && e.message ? e.message : String(e)));
  } finally { await teardown(); }
  launchSeq++;
  return rec;
}

for (const leg of LEGS) {
  const rec = await runLeg(leg);
  if (!receipt.frameTree && rec.frameTree) receipt.frameTree = rec.frameTree;
  if (!receipt.host.cdpProduct && rec.cdpProduct) receipt.host.cdpProduct = rec.cdpProduct;
  if (!receipt.host.cdpProtocolVersion && rec.cdpProtocolVersion) receipt.host.cdpProtocolVersion = rec.cdpProtocolVersion;
  if (!receipt.fixtureInputs && rec.fixtureInputs) receipt.fixtureInputs = rec.fixtureInputs;
  if (rec.errors.length) receipt.failures.push({ leg: leg.name, errors: rec.errors });
  receipt.legs.push(rec);
  fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
  console.error('leg ' + leg.name + ' done, errors=' + rec.errors.length + ' showPicker=' + JSON.stringify(rec.showPicker) + ' choosers=' + rec.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').length);
}
receipt.finishedAt = new Date().toISOString();
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  schema: SCHEMA, legs: receipt.legs.length, failures: receipt.failures,
  summary: receipt.legs.map((l) => ({ name: l.name, showPicker: l.showPicker, choosers: l.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').map((e) => [e.params.mode, e.params.backendNodeId]), act: [l.activationBefore, l.activationAfter], state: l.stateAfter, child: l.childResult, childAct: [l.childActivationBefore, l.childActivationAfter], childState: l.childState, childEvents: (l.childEvents || []).map((e) => e.type + '@' + e.target), answer: l.answer, clickWhileOpen: [l.clickWhileOpenChoosersBefore, l.clickWhileOpenChoosersAfter], events: (l.pageEvents || []).map((e) => e.type + '@' + e.target) })),
}, null, 1));
process.exitCode = receipt.failures.length === 0 ? 0 : 1;
