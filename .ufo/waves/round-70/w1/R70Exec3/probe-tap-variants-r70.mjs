#!/usr/bin/env node
// R70Exec3 falsification probe: Input.synthesizeTapGesture variants beyond the frozen
// r70 legs. One Chromium 155 headless process per invocation (one variant per run), fresh
// profile under scratch, loopback fixture, page-side event recorder.
// Usage:
//   node probe-tap-variants-r70.mjs --variant <id> --scratch <ABS dir> --out <ABS receipt.json>
//     --http-port <41000..48999> --cdp-port <41000..48999>
//   node probe-tap-variants-r70.mjs --list
// Exit 0: run completed and the receipt was written (a CDP error is a *measurement*, e.g. pen);
// 1: infrastructure failure (launch/navigate/teardown/nonce); 2: usage refusal.
//
// Patterns copied from scripts/chrome-cdp-synthtap-round70.mjs (read-only; never edited):
// launch flags, per-run home/XDG, launch-token sweep, port probes, teardown closure proof.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r70exec3-tap-variant';
const SELF = fileURLToPath(import.meta.url);
const WAVE_DIR = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-70/w1/R70Exec3';
const SCRATCH_ROOT = '/fast/scratch/hyaku/tabi-r70/R70Exec3';
const chromiumArg = '/usr/bin/chromium';
const PORT_MIN = 41000;
const PORT_MAX = 48999;
const VIEWPORT = { width: 1280, height: 900 };
const DEVICE_SCALE_FACTOR = 1;
const SETTLE_MS = 1300;
const SHA = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const realNorm = (p) => { try { return fs.realpathSync(path.resolve(p)); } catch { return path.resolve(p); } };
const inside = (child, parent) => {
  const rel = path.relative(realNorm(parent), realNorm(child));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};
const usage = (detail) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail })); process.exit(2); };

const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };

const BTN = { x: 200, y: 150 };
const DBL = { x: 200, y: 350 };
const touchEmul = { method: 'Emulation.setTouchEmulationEnabled', params: { enabled: true, maxTouchPoints: 5 } };
const emitTouchForMouse = { method: 'Emulation.setEmitTouchEventsForMouse', params: { enabled: true, configuration: 'mobile' } };
const mobileMetrics = { method: 'Emulation.setDeviceMetricsOverride', params: { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: true, screenWidth: VIEWPORT.width, screenHeight: VIEWPORT.height } };

/* Variant table. Every variant is one fresh browser run; `pre` runs after navigation and
   before the env-after-pre snapshot; `steps[].ops` run in order with `afterMs` waits. */
const VARIANTS = {};
VARIANTS['tap3-mouse'] = {
  note: 'tapCount 3 with mouse source: does the second/third press carry clickCount>1 (detail 2/3, dblclick) or three independent detail-1 clicks?',
  pre: [],
  steps: [{ label: 'synth mouse tapCount=3', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, tapCount: 3, gestureSourceType: 'mouse' }, afterMs: 1600 }] }],
};
VARIANTS['duration0-mouse'] = {
  note: 'duration 0 mouse: S175 PRESS branch releases on the same dispatch tick; are press/release timestamps identical and is click still synthesized?',
  pre: [],
  steps: [{ label: 'synth mouse duration=0', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, duration: 0, gestureSourceType: 'mouse' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['touch-emul-on'] = {
  note: 'touch tap after Emulation.setTouchEmulationEnabled(true, maxTouchPoints=5): does a click appear now (devices passes firesTouchEvents)?',
  pre: [touchEmul],
  preSettleMs: 300,
  steps: [{ label: 'synth touch, emulation on', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'touch' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['touch-emul-mobile'] = {
  note: 'touch tap with touch emulation plus mobile:true device metrics (viewport meta keeps layout scale 1): does mobile emulation turn the touch sequence into a click?',
  pre: [touchEmul, mobileMetrics],
  preSettleMs: 400,
  steps: [{ label: 'synth touch, emulation+mobile', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'touch' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['dblclick-listener'] = {
  note: 'mouse tapCount 2 on #dbl, which has its own dblclick listener: does any dblclick fire, and what are the click details?',
  pre: [],
  steps: [{ label: 'synth mouse tapCount=2 on #dbl', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, tapCount: 2, gestureSourceType: 'mouse' }, afterMs: 1600 }] }],
};
VARIANTS['pen'] = {
  note: 'gestureSourceType pen: not in Input.pdl:35-39 enum (default|touch|mouse); exact CDP refusal text, and does any event reach the page?',
  pre: [],
  steps: [{ label: 'synth pen', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'pen' }, afterMs: 800 }] }],
};
VARIANTS['control-dispatch-clickcount2'] = {
  note: 'POSITIVE CONTROL for the fixture: two CDP mouse press/release pairs on #dbl, second press clickCount=2. A real double click must produce dblclick; otherwise "no dblclick" from synth taps is uninterpretable.',
  pre: [],
  steps: [{
    label: 'dispatchMouseEvent clickCount 1 then 2 (#dbl)', target: 'dbl', ops: [
      { method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: DBL.x, y: DBL.y, button: 'left', buttons: 1, clickCount: 1 }, afterMs: 20 },
      { method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: DBL.x, y: DBL.y, button: 'left', buttons: 0, clickCount: 1 }, afterMs: 40 },
      { method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: DBL.x, y: DBL.y, button: 'left', buttons: 1, clickCount: 2 }, afterMs: 20 },
      { method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: DBL.x, y: DBL.y, button: 'left', buttons: 0, clickCount: 2 }, afterMs: 1200 },
    ],
  }],
};
VARIANTS['control-dispatch-touch-tap'] = {
  note: 'POSITIVE CONTROL for touch->click: browser-side Input.dispatchTouchEvent touchStart/touchEnd (goes through the browser input pipeline, unlike the renderer-side synthetic gesture). Does a click appear?',
  pre: [],
  steps: [{
    label: 'dispatchTouchEvent tap', target: 'btn', ops: [
      { method: 'Input.dispatchTouchEvent', params: { type: 'touchStart', touchPoints: [{ x: BTN.x, y: BTN.y, id: 0, radiusX: 1, radiusY: 1, force: 1 }] }, afterMs: 50 },
      { method: 'Input.dispatchTouchEvent', params: { type: 'touchEnd', touchPoints: [] }, afterMs: SETTLE_MS },
    ],
  }],
};
VARIANTS['tap3-touch'] = {
  note: 'tapCount 3 with touch source: any click/dblclick, and how many touch sequences?',
  pre: [],
  steps: [{ label: 'synth touch tapCount=3', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, tapCount: 3, gestureSourceType: 'touch' }, afterMs: 1800 }] }],
};
VARIANTS['touch-tapcount2'] = {
  note: 'tapCount 2 with touch source: two independent touch sequences, any click or dblclick?',
  pre: [],
  steps: [{ label: 'synth touch tapCount=2', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, tapCount: 2, gestureSourceType: 'touch' }, afterMs: 1600 }] }],
};
VARIANTS['touch-emul-tapcount2'] = {
  note: 'touch tapCount 2 on #dbl with touch emulation on: the strongest possible "touch double tap" condition short of a real touchscreen.',
  pre: [touchEmul],
  preSettleMs: 300,
  steps: [{ label: 'synth touch tapCount=2 on #dbl, emulation on', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, tapCount: 2, gestureSourceType: 'touch' }, afterMs: 1600 }] }],
};
VARIANTS['emit-touch-mouse'] = {
  note: 'Emulation.setEmitTouchEventsForMouse(mobile) then mouse-source synth tap: does renderer-side touch emission suppress the click the mouse driver normally gets?',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'synth mouse, emitTouchEventsForMouse', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'mouse' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['emit-touch-mouse-touch'] = {
  note: 'Emulation.setEmitTouchEventsForMouse(mobile) then touch-source synth tap: any click under the combined setting?',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'synth touch, emitTouchEventsForMouse', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'touch' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['duration0-touch'] = {
  note: 'duration 0 touch: are touchstart/touchend (and pointerdown/up) timestamps identical, and does anything else appear?',
  pre: [],
  steps: [{ label: 'synth touch duration=0', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, duration: 0, gestureSourceType: 'touch' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['mouse-two-calls-200'] = {
  note: 'TWO separate synthesizeTapGesture mouse calls on #dbl, 200 ms apart (inside any double-click window): can synthetic mouse taps ever accumulate a click count across calls?',
  pre: [],
  steps: [{ label: 'synth mouse #1 on #dbl', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 200 }] }, { label: 'synth mouse #2 on #dbl (200 ms later)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 1400 }] }],
};
VARIANTS['touch-emul-mouse-tap'] = {
  note: 'touch emulation on, then a mouse-source synth tap: does a touch-capable device change the mouse driver path (pointerType/detail)?',
  pre: [touchEmul],
  preSettleMs: 300,
  steps: [{ label: 'synth mouse, emulation on', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'mouse' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['emit-touch-mouse-tapcount2'] = {
  note: 'emitTouchEventsForMouse + mouse-source tapCount 2 on #dbl: the conversion path does click; do two converted taps accumulate detail 2 / dblclick, or stay two detail-1 clicks?',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'synth mouse tapCount=2 on #dbl, emitTouchEventsForMouse', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, tapCount: 2, gestureSourceType: 'mouse' }, afterMs: 1600 }] }],
};
VARIANTS['emit-touch-mouse-duration0'] = {
  note: 'emitTouchEventsForMouse + mouse-source duration 0: conversion still yields touch + compat click, and are press/release timestamps identical?',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'synth mouse duration=0, emitTouchEventsForMouse', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, duration: 0, gestureSourceType: 'mouse' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['control-dispatch-clickcount1-twice'] = {
  note: 'POSITIVE CONTROL 2: two CDP mouse press/release pairs with clickCount=1 both times, 40 ms apart, on #dbl. If no dblclick/detail-2 appears, detail comes only from the injected clickCount, never from timing.',
  pre: [],
  steps: [{
    label: 'dispatchMouseEvent clickCount 1 twice (#dbl)', target: 'dbl', ops: [
      { method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: DBL.x, y: DBL.y, button: 'left', buttons: 1, clickCount: 1 }, afterMs: 20 },
      { method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: DBL.x, y: DBL.y, button: 'left', buttons: 0, clickCount: 1 }, afterMs: 40 },
      { method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: DBL.x, y: DBL.y, button: 'left', buttons: 1, clickCount: 1 }, afterMs: 20 },
      { method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: DBL.x, y: DBL.y, button: 'left', buttons: 0, clickCount: 1 }, afterMs: 1200 },
    ],
  }],
};
VARIANTS['touch-emul-both-touch'] = {
  note: 'touch emulation AND emitTouchEventsForMouse both on, then a touch-source tap: the last "and/or" combination from the assignment; does any click appear?',
  pre: [touchEmul, emitTouchForMouse],
  preSettleMs: 400,
  steps: [{ label: 'synth touch, both emulations on', target: 'btn', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'touch' }, afterMs: SETTLE_MS }] }],
};
VARIANTS['emit-touch-mouse-two-calls-200'] = {
  note: 'emitTouchEventsForMouse on, TWO separate mouse-source synth taps on #dbl 200 ms apart: does the converted-touch compat path derive detail 2 + dblclick from tap timing alone?',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'converted mouse tap #1 (#dbl, 200ms gap)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 200 }] }, { label: 'converted mouse tap #2 (#dbl, +200ms)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 1400 }] }],
};
VARIANTS['emit-touch-mouse-two-calls-450'] = {
  note: 'Same as the 200 ms pair at 450 ms: boundary probe for the compat path double-tap time window.',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'converted mouse tap #1 (#dbl, 450ms gap)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 450 }] }, { label: 'converted mouse tap #2 (#dbl, +450ms)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 1400 }] }],
};
VARIANTS['emit-touch-mouse-two-calls-600'] = {
  note: 'Same as the 200 ms pair at 600 ms (outside a 500 ms double-click window): expect two detail-1 clicks and no dblclick if the compat path uses tap timing.',
  pre: [emitTouchForMouse],
  preSettleMs: 300,
  steps: [{ label: 'converted mouse tap #1 (#dbl, 600ms gap)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 600 }] }, { label: 'converted mouse tap #2 (#dbl, +600ms)', target: 'dbl', ops: [{ method: 'Input.synthesizeTapGesture', params: { x: DBL.x, y: DBL.y, gestureSourceType: 'mouse' }, afterMs: 1400 }] }],
};
VARIANTS['dispatch-touch-tap-emul'] = {
  note: 'POSITIVE CONTROL under emulation: Input.dispatchTouchEvent tap with touch emulation on: does the browser-side touch path still produce a click (isolates the "renderer-side gesture" variable)?',
  pre: [touchEmul],
  preSettleMs: 300,
  steps: [{
    label: 'dispatchTouchEvent tap, emulation on', target: 'btn', ops: [
      { method: 'Input.dispatchTouchEvent', params: { type: 'touchStart', touchPoints: [{ x: BTN.x, y: BTN.y, id: 0, radiusX: 1, radiusY: 1, force: 1 }] }, afterMs: 50 },
      { method: 'Input.dispatchTouchEvent', params: { type: 'touchEnd', touchPoints: [] }, afterMs: SETTLE_MS },
    ],
  }],
};

if (argv.includes('--list')) { console.log(JSON.stringify(Object.keys(VARIANTS), null, 1)); process.exit(0); }
const variantId = opt('variant');
if (!variantId || !Object.prototype.hasOwnProperty.call(VARIANTS, variantId)) usage('--variant must be one of: ' + Object.keys(VARIANTS).join(', '));
const variant = VARIANTS[variantId];
const scratchDir = opt('scratch');
if (!scratchDir || !path.isAbsolute(scratchDir)) usage('--scratch must be an absolute path');
try { fs.mkdirSync(scratchDir, { recursive: true }); } catch (e) { usage('scratch mkdir: ' + e.message); }
if (!inside(scratchDir, SCRATCH_ROOT)) usage('--scratch must be inside ' + SCRATCH_ROOT);
if (scratchDir.length > 64) usage('--scratch path too long for Chromium singleton socket (' + scratchDir.length + ' > 64)');
const outReceipt = opt('out');
if (!outReceipt || !path.isAbsolute(outReceipt) || !/\.json$/.test(outReceipt)) usage('--out must be an absolute .json path');
if (!inside(path.dirname(outReceipt), WAVE_DIR)) usage('--out must be inside ' + WAVE_DIR);
const ports = ['http-port', 'cdp-port'].map((key) => {
  const v = Number(opt(key));
  if (!Number.isInteger(v) || v < PORT_MIN || v > PORT_MAX) usage('--' + key + ' must be an integer in ' + PORT_MIN + '..' + PORT_MAX);
  return v;
});
const [fixturePort, devPort] = ports;
if (fixturePort === devPort) usage('HTTP and CDP ports must differ');

function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (!done) { done = true; try { s.destroy(); } catch {} resolve(v); } };
    s.setTimeout(1500, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}
for (const p of ports) { const st = await probePort(p); if (st !== 'closed') usage('port ' + p + ' is ' + st + ', choose a free one'); }

const launchToken = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratchDir, 'profile-' + launchToken);
const runHome = path.join(scratchDir, 'home-' + launchToken);
const runXdg = {
  HOME: runHome,
  XDG_CONFIG_HOME: path.join(runHome, '.config'),
  XDG_CACHE_HOME: path.join(runHome, '.cache'),
  XDG_DATA_HOME: path.join(runHome, '.local', 'share'),
  XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
  XDG_RUNTIME_DIR: path.join(runHome, 'run'),
  TMPDIR: scratchDir,
};
const runCrashDb = path.join(runXdg.XDG_CONFIG_HOME, 'chromium', 'Crash Reports');
for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR]) fs.mkdirSync(d, { recursive: true });
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const out = { at: new Date().toISOString(), pids: [], error: null };
  try {
    const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
    if (r.status !== 0) { out.error = 'ps exited ' + r.status; return out; }
    for (const line of (r.stdout || '').split('\n')) {
      if (SWEEP_NEEDLES.some((n) => line.includes(n))) {
        const pid = Number(line.trim().split(/\s+/)[0]);
        if (Number.isInteger(pid) && pid > 1) out.pids.push(pid);
      }
    }
  } catch (e) { out.error = e.message; }
  return out;
}
async function sweepToZero() {
  let rounds = 0, last = null;
  while (rounds < 20) {
    last = sweepOnce();
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await sleep(250);
    rounds++;
  }
  return { postKillSweepCount: last.error ? -1 : Math.max(0, rounds - 1), survivors: last.error ? [] : last.pids, sweepError: last.error };
}
const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) usage('launch token not fresh: ' + JSON.stringify(preLaunch));

const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>tabi-r70exec3 tap variant fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; overflow: hidden; }
button { position: absolute; width: 200px; height: 100px; margin: 0; padding: 0; border: 0; background: #08f; touch-action: manipulation; user-select: none; }
#btn { left: 100px; top: 100px; } #dbl { left: 100px; top: 300px; background: #0a6; } #nonce { position: fixed; left: 0; top: 0; margin: 0; font: 0/0 monospace; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
window.__dblFired = 0; window.__dblListenerEvents = [];
const rec = function (e) {
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp,
    wall: performance.now(),
    pointerType: e.pointerType || null, isTrusted: e.isTrusted,
    pointerId: typeof e.pointerId === 'number' ? e.pointerId : null,
    isPrimary: typeof e.isPrimary === 'boolean' ? e.isPrimary : null,
    detail: typeof e.detail === 'number' ? e.detail : null, button: typeof e.button === 'number' ? e.button : null,
    buttons: typeof e.buttons === 'number' ? e.buttons : null,
    clientX: typeof e.clientX === 'number' ? e.clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null),
    clientY: typeof e.clientY === 'number' ? e.clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : null),
    target: e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null),
    defaultPrevented: e.defaultPrevented,
    firesTouchEvents: e.sourceCapabilities ? !!e.sourceCapabilities.firesTouchEvents : null,
    touches: e.touches ? e.touches.length : null,
    changedTouches: e.changedTouches ? e.changedTouches.length : null });
};
for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'mousedown', 'mousemove', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'touchcancel'])
  document.addEventListener(t, rec, { capture: true, passive: true });
window.__setLeg = function (name) { window.__leg = name; return name; };
window.__env = function () {
  return { maxTouchPoints: navigator.maxTouchPoints, ontouchstart: 'ontouchstart' in window,
    pointerCoarse: matchMedia('(pointer: coarse)').matches, pointerFine: matchMedia('(pointer: fine)').matches,
    anyPointerCoarse: matchMedia('(any-pointer: coarse)').matches, hoverNone: matchMedia('(hover: none)').matches,
    innerWidth: window.innerWidth, innerHeight: window.innerHeight, dpr: window.devicePixelRatio,
    vvScale: window.visualViewport ? window.visualViewport.scale : null,
    vvWidth: window.visualViewport ? window.visualViewport.width : null,
    ua: navigator.userAgent };
};
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
  document.getElementById('dbl').addEventListener('dblclick', function (e) {
    window.__dblFired += 1;
    window.__dblListenerEvents.push({ at: performance.now(), detail: e.detail, trusted: e.isTrusted, target: e.target.id });
  });
});
</script></head><body><p id="nonce">__NONCE__</p><button id="btn" type="button">btn</button><button id="dbl" type="button">dbl</button></body></html>`;
const nonce = 'tabi-r70-r70exec3-' + variantId.replace(/[^a-z0-9-]/g, '-');
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);

const origin = 'http://127.0.0.1:' + fixturePort;
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
});
const failures = [];
const ops = [];
const cdpSendLog = [];
const receipt = {
  schema: SCHEMA, variant: variantId, note: variant.note, nonce,
  probeSha256: SHA(fs.readFileSync(SELF)), chromiumRequested: chromiumArg,
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', product: '', protocolVersion: '', devtoolsListening: null, argv: [], launchToken, stderrHead: '' },
  fixture: { sha256: SHA(FIXTURE_HTML), origin, viewport: VIEWPORT, nodes: { btn: { left: 100, top: 100, width: 200, height: 100 }, dbl: { left: 100, top: 300, width: 200, height: 100 } } },
  scratch: { dir: scratchDir, profileDir, lengthCheck: scratchDir.length },
  pre: variant.pre, steps: variant.steps, preSettleMs: variant.preSettleMs ?? 200,
  env: { before: null, afterPre: null, after: null }, nonceOnPage: null,
  ops, events: [], cdpSendLog, serverLog, dblFired: null, dblListenerEvents: null, observed: null,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  failures, infraOk: false,
};
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=' + DEVICE_SCALE_FACTOR,
  '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
receipt.host.argv = childArgv;

let child = null, ws = null, closing = null, interrupted = false, stderrHead = '';
async function teardown() {
  if (closing) return closing;
  closing = (async () => {
    try { if (ws) ws.close(); } catch {}
    if (child?.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
    await sleep(500);
    const swept = await sweepToZero();
    try { fixtureServer.closeAllConnections(); } catch {}
    await Promise.race([new Promise((resolve) => fixtureServer.close(resolve)), sleep(2000)]);
    const portProbes = { fixture: await probePort(fixturePort), devtools: await probePort(devPort) };
    const curlExit = (port) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + port + '/'], { encoding: 'utf8', timeout: 4000 }).status;
    receipt.teardown = {
      postKillSweepCount: swept.postKillSweepCount, survivors: swept.survivors, sweepError: swept.sweepError,
      portProbes, postKillCurl: { fixture: curlExit(fixturePort), devtools: curlExit(devPort) },
    };
    if (swept.sweepError) failures.push({ id: 'sweep-error', detail: swept.sweepError });
    if (swept.postKillSweepCount !== 0 || swept.survivors.length || Object.values(portProbes).some((v) => v !== 'closed') || Object.values(receipt.teardown.postKillCurl).some((v) => v !== 7)) failures.push({ id: 'teardown-closure', detail: 'closure proof failed' });
  })();
  return closing;
}
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; failures.push({ id: 'interrupted', detail: sig }); await teardown(); receipt.finishedAt = new Date().toISOString(); fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1)); process.exit(1); });
const watchdog = setTimeout(async () => {
  failures.push({ id: 'watchdog', detail: '150s exceeded' });
  try { await teardown(); } catch {}
  receipt.finishedAt = new Date().toISOString();
  try { fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1)); } catch {}
  process.exit(1);
}, 150000);

try {
  await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(fixturePort, '127.0.0.1', resolve); });
  const version = spawnSync(chromiumArg, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, ...runXdg } });
  if (version.status !== 0) throw new Error('chromium version failed');
  receipt.host.chromium = version.stdout.trim();
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
  let launchError = null;
  child.on('error', (e) => { launchError = e; });
  stderrHead = '';
  child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 1600 && !page; i++) {
    if (launchError) throw launchError;
    try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find((t) => t.type === 'page'); } catch {}
    if (!page) await sleep(150);
  }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + devPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  if (sweepOnce().pids.length < 1) throw new Error('launch token unbound');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('ws open timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('ws error')); }, { once: true }); });
  let msgId = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const msg = JSON.parse(ev.data); const p = pending.get(msg.id); if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(Object.assign(new Error(msg.error.message || 'cdp error'), { cdpError: msg.error })) : p.resolve(msg); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++msgId;
    cdpSendLog.push({ id, method, params });
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout ' + method)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const runOp = async (label, op) => {
    const rec = { label, method: op.method, params: op.params, sentAt: Date.now(), receivedAt: null, durationMs: null, ok: false, result: null, error: null, cdpError: null };
    try { const r = await send(op.method, op.params); rec.ok = true; rec.result = r.result ?? null; }
    catch (e) { rec.error = e.message; rec.cdpError = e.cdpError ?? null; }
    rec.receivedAt = Date.now(); rec.durationMs = rec.receivedAt - rec.sentAt;
    ops.push(rec);
    if (op.afterMs) await sleep(op.afterMs);
    return rec;
  };
  const ver = await send('Browser.getVersion');
  receipt.host.product = ver.result.product;
  receipt.host.protocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await evalValue('document.readyState === "complete" && Array.isArray(window.__events) && !!window.__env && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  receipt.env.before = await evalValue('JSON.parse(JSON.stringify(window.__env()))');
  for (const pre of variant.pre) await runOp('pre:' + pre.method, pre);
  await sleep(receipt.preSettleMs);
  receipt.env.afterPre = await evalValue('JSON.parse(JSON.stringify(window.__env()))');
  for (const step of variant.steps) {
    await evalValue('window.__setLeg(' + JSON.stringify(step.label) + ')');
    for (const op of step.ops) await runOp(step.label, op);
  }
  await evalValue('window.__setLeg("end")');
  receipt.events = await evalValue('JSON.parse(JSON.stringify(window.__events))');
  receipt.dblFired = await evalValue('window.__dblFired');
  receipt.dblListenerEvents = await evalValue('JSON.parse(JSON.stringify(window.__dblListenerEvents))');
  receipt.env.after = await evalValue('JSON.parse(JSON.stringify(window.__env()))');
} catch (e) {
  failures.push({ id: 'drive-error', detail: e.message });
} finally {
  await teardown();
  clearTimeout(watchdog);
}
receipt.host.stderrHead = stderrHead.slice(0, 4096);
{
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(receipt.host.stderrHead || '');
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;
}
receipt.finishedAt = new Date().toISOString();

// Derived observation: exact sequences, click details, press->release deltas (event ts and
// page wall clock), pointer types/ids, targets, trust, and the fixture's own dblclick count.
const MOVES = new Set(['pointermove', 'mousemove', 'touchmove']);
const ev = receipt.events || [];
const seqTypes = ev.filter((e) => !MOVES.has(e.type)).map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : ''));
const downs = ev.filter((e) => e.type === 'pointerdown');
const ups = ev.filter((e) => e.type === 'pointerup');
const pairs = [];
for (let i = 0; i < Math.min(downs.length, ups.length); i++) pairs.push({ downTs: downs[i].ts, upTs: ups[i].ts, tsDeltaMs: +(ups[i].ts - downs[i].ts).toFixed(3), wallDeltaMs: +(ups[i].wall - downs[i].wall).toFixed(3) });
receipt.observed = {
  seqTypes, total: ev.length,
  counts: ev.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {}),
  clickDetails: ev.filter((e) => e.type === 'click').map((e) => e.detail),
  dblclickEvents: ev.filter((e) => e.type === 'dblclick').length,
  dblFired: receipt.dblFired,
  dblListenerEvents: receipt.dblListenerEvents,
  allTrusted: ev.every((e) => e.isTrusted === true),
  targets: [...new Set(ev.map((e) => e.target))],
  pointerTypes: [...new Set(ev.map((e) => e.pointerType).filter(Boolean))],
  pointerIds: [...new Set(ev.map((e) => e.pointerId).filter((v) => v !== null))],
  firesTouchEvents: [...new Set(ev.map((e) => e.firesTouchEvents))],
  pressRelease: pairs,
  mousedownDetails: ev.filter((e) => e.type === 'mousedown').map((e) => e.detail),
  pointerdownDetails: downs.map((e) => e.detail),
  buttonsSeq: ev.filter((e) => e.type === 'mousedown' || e.type === 'mouseup').map((e) => e.type + ':' + e.buttons),
};
const opErrors = ops.filter((o) => o.error);
const nonceOk = receipt.nonceOnPage === nonce;
const envAfter = receipt.env.after || {};
receipt.infraOk = failures.length === 0 && nonceOk && !!receipt.host.product && (receipt.teardown.postKillSweepCount === 0) && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  schema: SCHEMA, variant: variantId, infraOk: receipt.infraOk, nonceOk,
  env: { before: receipt.env.before && { maxTouchPoints: receipt.env.before.maxTouchPoints, ontouchstart: receipt.env.before.ontouchstart, anyPointerCoarse: receipt.env.before.anyPointerCoarse }, afterPre: receipt.env.afterPre, after: envAfter.maxTouchPoints },
  opErrors: opErrors.map((o) => ({ label: o.label, method: o.method, error: o.error, cdpError: o.cdpError })),
  observed: receipt.observed, teardown: receipt.teardown, failures,
}, null, 1));
process.exitCode = receipt.infraOk ? 0 : 1;
