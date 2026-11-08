#!/usr/bin/env node
// Counter for scripts/chrome-cdp-showpicker-proxy-round91.mjs (tabi round 91, C1,
// predicate C1-SHOWPICKER-PROXY-R91). Binds the postMessage-proxy invocation of
// `HTMLInputElement.showPicker()` across a same-origin and a cross-origin iframe on
// Chromium 155/Linux `--headless=new`.
//
// Usage:
//   node check-showpicker-proxy-round91.mjs --lane <ABS lane> --receipt <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <tabi-r91-...>
//     --expect-parent-sha256 <hex> --expect-same-sha256 <hex> --expect-child-sha256 <hex>
//     --prior-set <file> [--json]
//   node check-showpicker-proxy-round91.mjs --selftest [--json]
//
// Exit 0: verdict clean. 1: findings. 2: usage or unreadable input.
const selftestArgv = process.argv.slice(2);
const selftestAsJson = selftestArgv.includes('--json');
if (selftestArgv.includes('--selftest')) {
  const fs = (await import('node:fs')).default;
  const path = (await import('node:path')).default;
  const { spawnSync } = (await import('node:child_process'));
  const { fileURLToPath } = (await import('node:url'));
  const self = fileURLToPath(import.meta.url);
  const base = (process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku') + '/tabi-r91-counter-selftest-' + process.pid;
  const rm = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} };
  try {
    fs.mkdirSync(base, { recursive: true });
    const copy = path.join(base, 'counter.mjs');
    fs.copyFileSync(self, copy);
    const hx = 'a'.repeat(64);
    const lane = path.join(base, 'lane');
    fs.mkdirSync(path.join(lane, '.ufo', 'waves', 'round-91', 'controls', 'c1', 'probes'), { recursive: true });
    const prior = path.join(lane, '.ufo', 'waves', 'round-91', 'controls', 'c1', 'probes', 'p.json');
    const priorReceipt = { schema: 'tabi-chrome-cdp-showpicker-proxy-r91', lane: 'tabi', nonce: 'tabi-r91-prior-0001', driverSha256: hx, startedAt: '2026-01-01T00:00:00.000Z', finishedAt: '2026-01-01T00:01:00.000Z', host: { chromium: 'x', cdpProduct: 'x', cdpProtocolVersion: '1.3', node: 'v24.0.0' }, fixture: { parent: { origin: 'http://127.0.0.1:19901', sha256: hx }, same: { origin: 'http://127.0.0.1:19901', path: '/same.html', sha256: hx }, child: { origin: 'http://127.0.0.1:19903', path: '/child.html', sha256: hx }, viewport: { width: 1280, height: 900 } }, ports: { http: 19901, cdp: 19902, child: 19903 }, elements: null, legs: [], failures: [] };
    fs.writeFileSync(prior, JSON.stringify(priorReceipt));
    const ps = path.join(base, 'prior-set.txt');
    fs.writeFileSync(ps, path.relative(lane, prior) + '\n');
    const fixture = path.join(base, 'fixture.json');
    fs.writeFileSync(fixture, JSON.stringify({ schema: 'not-the-schema', lane: 'tabi', nonce: 'tabi-r91-selftest-0001', legs: [], failures: [] }));
    const r1 = spawnSync(process.execPath, [copy, '--lane', lane, '--receipt', fixture, '--expect-driver-sha256', hx, '--expect-nonce', 'tabi-r91-selftest-0001', '--expect-parent-sha256', hx, '--expect-same-sha256', hx, '--expect-child-sha256', hx, '--prior-set', ps, '--json'], { encoding: 'utf8', timeout: 60000 });
    let j1 = null; try { j1 = JSON.parse(r1.stdout); } catch {}
    const ids1 = j1 && j1.findings ? j1.findings.map((f) => f.id) : [];
    const firstOk = r1.status === 1 && ids1.includes('schema');
    // second case: a schema-correct receipt with a broken proxy law (proxy ok flipped on a
    // no-activation leg) must be refused with `proxy-law`, not only with a shape finding.
    let secondOk = false, secondIds = [];
    try {
      const scored = path.join(path.dirname(self), '..', 'corpus', 'evidence', 'round91', 'chromium-showpicker-proxy', 'receipt.json');
      const probePath = path.join(path.dirname(self), '..', '.ufo', 'waves', 'round-91', 'controls', 'c1', 'probes', 'probe2.json');
      const src = fs.existsSync(scored) ? scored : probePath;
      const real = JSON.parse(fs.readFileSync(src, 'utf8'));
      const mut = JSON.parse(JSON.stringify(real));
      const leg = (mut.legs || []).find((l) => l.name === 'sp91-xo-proxy-file-noact');
      if (leg && leg.proxy) leg.proxy = { ...leg.proxy, ok: true, ret: 'undefined' };
      const mp = path.join(base, 'proxy-law.json');
      fs.writeFileSync(mp, JSON.stringify(mut));
      const r2 = spawnSync(process.execPath, [copy, '--lane', lane, '--receipt', mp, '--expect-driver-sha256', real.driverSha256, '--expect-nonce', real.nonce, '--expect-parent-sha256', real.fixture.parent.sha256, '--expect-same-sha256', real.fixture.same.sha256, '--expect-child-sha256', real.fixture.child.sha256, '--prior-set', ps, '--json'], { encoding: 'utf8', timeout: 120000 });
      let j2 = null; try { j2 = JSON.parse(r2.stdout); } catch {}
      secondIds = j2 && j2.findings ? j2.findings.map((f) => f.id) : [];
      secondOk = r2.status === 1 && secondIds.includes('proxy-law');
    } catch { secondOk = false; }
    const out = { schema: 'tabi-r91-counter-selftest', ok: !!(firstOk && secondOk), firstOk, secondOk, ids: secondIds.length ? secondIds : ids1 };
    process.stdout.write(JSON.stringify(out, selftestAsJson ? null : null, selftestAsJson ? 1 : 0) + '\n');
    rm(base);
    process.exit(out.ok ? 0 : 1);
  } catch (e) {
    rm(base);
    process.stdout.write(JSON.stringify({ schema: 'tabi-r91-counter-selftest', ok: false, error: String(e.message) }) + '\n');
    process.exit(1);
  }
}

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-chrome-cdp-showpicker-proxy-r91';
const HOST = { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', nodeMajor: 24 };
const VIEWPORT = { width: 1280, height: 900 };
const GESTURE = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.";
const SECURITY = "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe.";
const TYPEERR = "TypeError: Cannot read properties of null (reading 'getElementById')";
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const usage = (d) => { out({ verdict: 'usage', findings: [{ id: 'usage', detail: d }] }, 2); process.exit(2); };
function out(obj, code) {
  const payload = { schema: SCHEMA + '-counter', ...obj };
  if (asJson) process.stdout.write(JSON.stringify(payload, null, 1) + '\n');
  else process.stdout.write(JSON.stringify({ verdict: payload.verdict, checkCount: payload.checkCount, findings: payload.findings }, null, 1) + '\n');
  process.exitCode = code;
}
const lane = opt('lane');
const rp = opt('receipt');
const pin = opt('expect-driver-sha256');
const expectNonce = opt('expect-nonce');
const expectParent = opt('expect-parent-sha256');
const expectSame = opt('expect-same-sha256');
const expectChild = opt('expect-child-sha256');
const priorSet = opt('prior-set');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!rp) usage('--receipt is required');
for (const [v, n] of [[pin, '--expect-driver-sha256'], [expectParent, '--expect-parent-sha256'], [expectSame, '--expect-same-sha256'], [expectChild, '--expect-child-sha256']]) if (!v || !/^[0-9a-f]{64}$/.test(v)) usage(n + ' must be 64 hex');
if (!expectNonce) usage('--expect-nonce is required');
if (!priorSet) usage('--prior-set is required');

const abs = (p) => (path.isAbsolute(p) ? p : path.join(lane, p));
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- frozen plan ----
const PLAN = [
  { name: 'sp91-so-direct-noact', frame: 'so', target: 's', mode: 'direct', parentPad: false, childPad: false, answer: null },
  { name: 'sp91-so-direct-parentact', frame: 'so', target: 's', mode: 'direct', parentPad: true, childPad: false, answer: null },
  { name: 'sp91-so-direct-childact', frame: 'so', target: 's', mode: 'direct', parentPad: false, childPad: true, answer: null },
  { name: 'sp91-so-proxy-noact', frame: 'so', target: 's', mode: 'proxy', parentPad: false, childPad: false, answer: null },
  { name: 'sp91-so-proxy-childact', frame: 'so', target: 's', mode: 'proxy', parentPad: false, childPad: true, answer: null },
  { name: 'sp91-so-proxy-date-noact', frame: 'so', target: 'dt', mode: 'proxy', parentPad: false, childPad: false, answer: null },
  { name: 'sp91-so-proxy-date-childact', frame: 'so', target: 'dt', mode: 'proxy', parentPad: false, childPad: true, answer: null },
  { name: 'sp91-xo-proxy-file-noact', frame: 'xo', target: 's', mode: 'proxy', parentPad: false, childPad: false, answer: null },
  { name: 'sp91-xo-proxy-file-parentact', frame: 'xo', target: 's', mode: 'proxy', parentPad: true, childPad: false, answer: null },
  { name: 'sp91-xo-proxy-file-childact', frame: 'xo', target: 's', mode: 'proxy', parentPad: false, childPad: true, answer: null },
  { name: 'sp91-xo-proxy-file-answer', frame: 'xo', target: 's', mode: 'proxy', parentPad: false, childPad: true, answer: 'tabi-r91-answer.txt' },
  { name: 'sp91-xo-proxy-date-noact', frame: 'xo', target: 'dt', mode: 'proxy', parentPad: false, childPad: false, answer: null },
  { name: 'sp91-xo-proxy-date-childact', frame: 'xo', target: 'dt', mode: 'proxy', parentPad: false, childPad: true, answer: null },
  { name: 'sp91-xo-proxy-color-childact', frame: 'xo', target: 'co', mode: 'proxy', parentPad: false, childPad: true, answer: null },
  { name: 'sp91-xo-direct-access', frame: 'xo', target: 's', mode: 'cross-access', parentPad: false, childPad: false, answer: null },
];
const LEG_ORDER = PLAN.map((p) => p.name);
let PARENT_ORIGIN = 'http://127.0.0.1:19901';
let CHILD_ORIGIN = 'http://127.0.0.1:19903';
const expr = {
  parentReady: 'document.readyState === "complete" && !!window.__ready && window.__ready()',
  childReady: 'document.readyState === "complete" && !!window.__ready && window.__ready()',
  act: 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})',
  childAct: 'window.__act()',
  parentElements: 'window.__elements()',
  childElements: 'window.__elements()',
  replies: 'JSON.stringify(window.__replies)',
  childProxy: 'window.__proxy === null ? "null" : JSON.stringify(window.__proxy)',
  childProxyLog: 'JSON.stringify(window.__log)',
  childState: 'window.__state()',
  parentState: 'window.__state()',
  childReset: 'window.__reset()',
  childClose: 'window.__closeRecord()',
  parentClose: 'window.__closeRecord()',
  childLate: 'window.__late',
  parentLate: 'window.__late',
  repliesClear: 'window.__replies.length = 0',
  parentPadElement: 'document.elementFromPoint(360,820).id',
  childPadElement: 'document.elementFromPoint(490,60).id',
  parentSetLeg: (n) => 'window.__setLeg(' + JSON.stringify(n) + ')',
  childSetLeg: (n) => 'window.__setLeg(' + JSON.stringify(n) + ')',
  rect: (frame) => 'JSON.stringify(document.getElementById(' + JSON.stringify(frame) + ').getBoundingClientRect())',
  post: (frame, target, origin) => 'JSON.stringify((function(){ var f = document.getElementById(' + JSON.stringify(frame) + '); f.contentWindow.postMessage({cmd:"showpicker",target:' + JSON.stringify(target) + '}, ' + JSON.stringify(origin) + '); return "sent"; })())',
  direct: (frame, target) => 'JSON.stringify((function(){ try { var d = document.getElementById(' + JSON.stringify(frame) + ').contentDocument; var el = d.getElementById(' + JSON.stringify(target) + '); var r = el.showPicker(); return {ok:true, ret:String(r)}; } catch(e){ return {ok:false, name:e.name, message:e.message}; } })())',
  cross: 'JSON.stringify((function(){ var f = document.getElementById("xo"); var out = { contentDocument: f.contentDocument === null ? null : "object" }; try { var d = f.contentWindow.document; out.windowDocument = d ? "object" : null; } catch(e){ out.windowDocument = e.name; } try { f.contentDocument.getElementById("s").showPicker(); out.showPicker = "reached"; } catch(e){ out.showPicker = e.name + ": " + e.message; } return out; })())',
};

const checks = {};
const findings = [];
const check = (id, ok, detail) => { checks[id] = !!ok; if (!ok) findings.push({ id, detail: String(detail) }); };

// ---- prior set ----
const priorPaths = [];
try {
  for (const line of fs.readFileSync(abs(priorSet), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    priorPaths.push(path.isAbsolute(t) ? t : path.join(lane, t));
  }
} catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set ' + priorSet + ': ' + e.message }] }, 2); process.exit(2); }
if (priorPaths.length === 0) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set is empty' }] }, 2); process.exit(2); }
const priors = [];
for (const p of priorPaths) {
  let j; try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': ' + e.message }] }, 2); process.exit(2); }
  priors.push(j);
}

// ---- receipt ----
let r;
try { r = JSON.parse(fs.readFileSync(abs(rp), 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); process.exit(2); }
if (!isObj(r)) { out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: 'not an object' }] }, 2); process.exit(2); }

const RECEIPT_KEYS = ['driverSha256', 'elements', 'failures', 'finishedAt', 'fixture', 'host', 'lane', 'legs', 'nonce', 'ports', 'schema', 'startedAt'].sort();
const LEG_KEYS = ['actionAt', 'activationAfter', 'answerSet', 'activationBefore', 'answer', 'argv', 'cdpEventLog', 'cdpProduct', 'cdpProtocolVersion', 'cdpSendLog', 'childActivationAfter', 'childActivationBefore', 'childClosedAt', 'childContextId', 'childEvents', 'childFrameId', 'childLateAfterClose', 'childPad', 'childPadElement', 'childPadError', 'childPadPressId', 'childPadReleaseId', 'childServerLog', 'childSha256', 'childState', 'chooserWaitMs', 'choosers', 'closedAt', 'contexts', 'crossAccess', 'crossError', 'crossResult', 'crossSendId', 'devtoolsListening', 'direct', 'directError', 'directResult', 'directSendId', 'dismissError', 'dismissResult', 'dismissSendId', 'elements', 'errors', 'frame', 'frameTree', 'interceptError', 'interceptResult', 'interceptSendId', 'lateAfterClose', 'launchToken', 'marks', 'mode', 'name', 'pageEvents', 'parentPad', 'parentPadElement', 'parentPadError', 'parentPadPressId', 'parentPadReleaseId', 'parentSha256', 'parentState', 'postError', 'postResult', 'postSendId', 'proxy', 'proxyLog', 'proxyLogSendId', 'proxySendId', 'replies', 'replySendId', 'sameSha256', 'serverLog', 'soFrameId', 'stateAfterDismiss', 'stderrHead', 'target', 'teardown', 'xoFrameId'].sort();

// ---- identity ----
check('schema', r.schema === SCHEMA, 'schema ' + r.schema);
check('lane', r.lane === path.basename(lane), 'lane ' + r.lane);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r91-[a-z0-9-]{4,48}$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('receipt-fields', same(Object.keys(r).sort(), RECEIPT_KEYS), 'fields ' + JSON.stringify(Object.keys(r).sort()));
check('driver-pin', r.driverSha256 === pin, 'driver ' + r.driverSha256);
const fx = isObj(r.fixture) ? r.fixture : {};
check('fixture-pins', isObj(fx.parent) && isObj(fx.same) && isObj(fx.child) && same(Object.keys(fx).sort(), ['child', 'parent', 'same', 'viewport']) && fx.parent.sha256 === expectParent && fx.same.sha256 === expectSame && fx.child.sha256 === expectChild && fx.same.path === '/same.html' && fx.child.path === '/child.html' && same(fx.viewport, VIEWPORT),
  'fixture ' + JSON.stringify(fx));
const ports = isObj(r.ports) ? r.ports : {};
if (Number.isInteger(ports.http) && Number.isInteger(ports.child)) { PARENT_ORIGIN = 'http://127.0.0.1:' + ports.http; CHILD_ORIGIN = 'http://127.0.0.1:' + ports.child; }
check('ports-declared', Number.isInteger(ports.http) && Number.isInteger(ports.cdp) && Number.isInteger(ports.child) && new Set([ports.http, ports.cdp, ports.child]).size === 3 && fx.parent && fx.parent.origin === 'http://127.0.0.1:' + ports.http && fx.same && fx.same.origin === 'http://127.0.0.1:' + ports.http && fx.child && fx.child.origin === 'http://127.0.0.1:' + ports.child,
  'ports ' + JSON.stringify(ports) + ' origins ' + JSON.stringify([fx.parent && fx.parent.origin, fx.child && fx.child.origin]));
const host = isObj(r.host) ? r.host : {};
check('host-chromium', host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion, 'host ' + JSON.stringify(host));
check('host-node', typeof host.node === 'string' && Number(String(host.node).replace(/^v/, '').split('.')[0]) === HOST.nodeMajor, 'node ' + host.node);

// ---- plan and leg records ----
const legs = arr(r.legs);
check('plan-frozen', same(legs.map((l) => (isObj(l) ? { name: l.name, frame: l.frame, target: l.target, mode: l.mode, parentPad: l.parentPad, childPad: l.childPad, answer: l.answer && l.answer.name } : null)), PLAN.map((p) => ({ name: p.name, frame: p.frame, target: p.target, mode: p.mode, parentPad: p.parentPad, childPad: p.childPad, answer: p.answer }))),
  'leg plan differs from the frozen plan');
check('leg-order', same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER), 'legs ' + legs.map((l) => (isObj(l) ? l.name : null)).join(','));
check('leg-records', legs.length === PLAN.length && legs.every((l) => isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && arr(l.errors).length === 0 && typeof l.launchToken === 'string' && /^[0-9a-f]{12}$/.test(l.launchToken)),
  'leg records: ' + JSON.stringify(legs.map((l) => (isObj(l) ? [l.name, same(Object.keys(l).sort(), LEG_KEYS), arr(l.errors).length] : null))));
check('leg-marks', legs.every((l) => isObj(l) && arr(l.marks).length >= 3 && arr(l.marks)[0].name === 'start' && arr(l.marks)[1].name === 'pre' && arr(l.marks)[arr(l.marks).length - 1].name === 'settle' && num(l.closedAt) && num(l.childClosedAt) && l.lateAfterClose === 0 && l.childLateAfterClose === 0 && arr(l.marks).every((m, i, a) => isObj(m) && typeof m.name === 'string' && num(m.at) && (i === 0 || m.at >= a[i - 1].at))),
  'marks/closes: ' + JSON.stringify(legs.map((l) => (isObj(l) ? [l.name, arr(l.marks).map((m) => m && m.name), l.lateAfterClose, l.childLateAfterClose] : null))));
check('frame-tree', legs.every((l) => isObj(l) && isObj(l.frameTree) && typeof l.frameTree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.frameTree.mainFrameId) && l.frameTree.mainFrameParentId === null && l.frameTree.mainFrameUrl === 'about:blank' && typeof l.soFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.soFrameId) && typeof l.xoFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.xoFrameId) && l.soFrameId !== l.xoFrameId && l.childFrameId === (l.frame === 'so' ? l.soFrameId : l.xoFrameId)),
  'frame trees / iframe frame ids');

// ---- contexts and the same-element record ----
const ctxBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const want = l.frame === 'so' ? l.soFrameId : l.xoFrameId;
  const ctx = arr(l.contexts).filter((c) => isObj(c) && c.frameId === want && c.isDefault === true);
  if (ctx.length !== 1) { ctxBad.push(l.name + ':contexts ' + ctx.length); continue; }
  if (l.childContextId !== ctx[0].id) ctxBad.push(l.name + ':childContextId');
  const wantOrigin = l.frame === 'so' ? PARENT_ORIGIN : CHILD_ORIGIN;
  if (ctx[0].origin !== wantOrigin) ctxBad.push(l.name + ':origin ' + ctx[0].origin);
}
check('context-binding', ctxBad.length === 0, 'child context binding: ' + ctxBad.join(','));
const sameEl = (a, b) => ['s', 'dt', 'co'].every((id, i) => isObj(a.elements[i]) && isObj(b.elements[i]) && a.elements[i].id === id && b.elements[i].id === id && a.elements[i].tag === b.elements[i].tag && a.elements[i].type === b.elements[i].type && a.elements[i].accept === b.elements[i].accept && same(a.elements[i].rect, b.elements[i].rect));
const el = r.elements;
check('same-element-law', isObj(el) && isObj(el.so) && isObj(el.xo) && isObj(el.parent) && el.so.origin === PARENT_ORIGIN && el.xo.origin === CHILD_ORIGIN && el.so.origin !== el.xo.origin && sameEl(el.so, el.xo) && isObj(el.parent.elements) === false && arr(el.parent.elements).length === 1 && el.parent.elements[0].id === 'ps' && el.parent.elements[0].type === 'file' && legs.every((l) => isObj(l) && same(l.elements, el)),
  'same-element record: ' + JSON.stringify(el));

// ---- per-leg law table (measured by the round-91 probes; see plans/round-91.md) ----
const LAW = {
  // pa/ca are the POST-LEG transient-activation states: a successful showPicker() consumes the
  // activation (r90's measured answer-law), while a throwing call (NotAllowedError, SecurityError)
  // leaves it active. The two exceptions below (L9, L13) are the measured ones.
  'sp91-so-direct-noact': { sp: { ok: false, name: 'NotAllowedError', message: GESTURE }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: [] },
  'sp91-so-direct-parentact': { sp: { ok: true, ret: 'undefined' }, choosers: 1, pa: [false, false], ca: [false, false], pe: ['pad'], ce: [] },
  'sp91-so-direct-childact': { sp: { ok: true, ret: 'undefined' }, choosers: 1, pa: [false, false], ca: [false, false], pe: [], ce: ['cpad'] },
  'sp91-so-proxy-noact': { proxy: { ok: false, name: 'NotAllowedError', message: GESTURE }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: [] },
  'sp91-so-proxy-childact': { proxy: { ok: true, ret: 'undefined' }, choosers: 1, pa: [false, false], ca: [false, false], pe: [], ce: ['cpad'] },
  'sp91-so-proxy-date-noact': { proxy: { ok: false, name: 'NotAllowedError', message: GESTURE }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: [] },
  'sp91-so-proxy-date-childact': { proxy: { ok: true, ret: 'undefined' }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: ['cpad'] },
  'sp91-xo-proxy-file-noact': { proxy: { ok: false, name: 'NotAllowedError', message: GESTURE }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: [] },
  'sp91-xo-proxy-file-parentact': { proxy: { ok: false, name: 'NotAllowedError', message: GESTURE }, choosers: 0, pa: [false, true], ca: [false, false], pe: ['pad'], ce: [] },
  'sp91-xo-proxy-file-childact': { proxy: { ok: true, ret: 'undefined' }, choosers: 1, pa: [false, false], ca: [false, false], pe: [], ce: ['cpad'] },
  'sp91-xo-proxy-file-answer': { proxy: { ok: true, ret: 'undefined' }, choosers: 1, pa: [false, false], ca: [false, false], pe: [], ce: ['cpad'], answer: true },
  'sp91-xo-proxy-date-noact': { proxy: { ok: false, name: 'SecurityError', message: SECURITY }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: [] },
  'sp91-xo-proxy-date-childact': { proxy: { ok: false, name: 'SecurityError', message: SECURITY }, choosers: 0, pa: [false, true], ca: [false, true], pe: [], ce: ['cpad'] },
  'sp91-xo-proxy-color-childact': { proxy: { ok: true, ret: 'undefined' }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: ['cpad'] },
  'sp91-xo-direct-access': { cross: { contentDocument: null, windowDocument: 'SecurityError', showPicker: TYPEERR }, choosers: 0, pa: [false, false], ca: [false, false], pe: [], ce: [] },
};

// ---- send-log allowlist and plan calls ----
const evalAllowed = (l, p) => {
  const plan = PLAN.find((x) => x.name === l.name) || {};
  const parent = [expr.parentReady, expr.act, expr.parentElements, expr.parentState, expr.parentClose, expr.parentLate, expr.repliesClear, expr.replies,
    expr.parentPadElement, expr.parentSetLeg('pre'), expr.parentSetLeg('settle')];
  if (plan.mode === 'direct') parent.push(expr.parentSetLeg('show-picker'), expr.direct(plan.frame, plan.target));
  if (plan.mode === 'proxy') parent.push(expr.parentSetLeg('post-proxy'), expr.post(plan.frame, plan.target, plan.frame === 'so' ? PARENT_ORIGIN : CHILD_ORIGIN));
  if (plan.mode === 'cross-access') parent.push(expr.parentSetLeg('cross-access'), expr.cross);
  if (plan.parentPad) parent.push(expr.parentSetLeg('parent-click'), expr.rect(plan.frame));
  if (plan.childPad) parent.push(expr.childPadElement, expr.rect(plan.frame));
  const child = [expr.childReady, expr.childSetLeg('pre'), expr.childSetLeg('settle'), expr.childReset, expr.childAct, expr.childElements, expr.childProxy, expr.childProxyLog, expr.childState, expr.childClose, expr.childLate, expr.childSetLeg('child-click'), expr.childPadElement];
  if (p.contextId !== undefined) return child.includes(p.expression);
  return parent.includes(p.expression);
};
const sendBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const log = arr(l.cdpSendLog);
  if (log.length < 20 || !log.every((c, i) => isObj(c) && c.id === i + 1 && isObj(c.params))) sendBad.push(l.name + ':shape');
  else if (!log.every((c) => c.method !== 'Runtime.evaluate' || evalAllowed(l, c.params))) sendBad.push(l.name + ':expression');
  else if (!same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.setInterceptFileChooserDialog'])) sendBad.push(l.name + ':prologue');
  else if (log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' && c.params && c.params.enabled === true && !('cancel' in c.params)).length !== 1) sendBad.push(l.name + ':intercept-once');
  else if (!same(log.find((c) => c.method === 'Page.navigate').params, { url: PARENT_ORIGIN + '/?run=' + encodeURIComponent(r.nonce) })) sendBad.push(l.name + ':navigate');
}
check('send-log-allowlist', legs.length === PLAN.length && sendBad.length === 0, 'send logs outside the allowlist: ' + sendBad.join(','));

const actionFor = (l) => {
  const plan = PLAN.find((x) => x.name === l.name) || {};
  const log = arr(l.cdpSendLog);
  const got = [];
  for (const c of log) {
    if (c.method === 'Page.setInterceptFileChooserDialog' && c.params.enabled === true && !('cancel' in c.params)) got.push({ k: 'intercept', id: c.id });
    if (c.method === 'Input.dispatchMouseEvent') {
      if (c.params.type === 'mousePressed' || c.params.type === 'mouseReleased') {
        const kind = c.params.x === 360 && c.params.y === 820 ? 'parentpad' : 'childpad';
        got.push({ k: kind + '-' + (c.params.type === 'mousePressed' ? 'press' : 'release'), id: c.id });
      }
    }
    if (c.method === 'Runtime.evaluate' && c.params.expression === expr.direct(plan.frame, plan.target)) got.push({ k: 'direct', id: c.id });
    if (c.method === 'Runtime.evaluate' && c.params.expression === expr.post(plan.frame, plan.target, plan.frame === 'so' ? PARENT_ORIGIN : CHILD_ORIGIN)) got.push({ k: 'post', id: c.id });
    if (c.method === 'Runtime.evaluate' && c.params.expression === expr.cross) got.push({ k: 'cross', id: c.id });
    if (c.method === 'DOM.setFileInputFiles') got.push({ k: 'answer', id: c.id });
    if (c.method === 'Page.setInterceptFileChooserDialog' && c.params.cancel === true) got.push({ k: 'dismiss', id: c.id });
  }
  return got;
};
const planBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const plan = PLAN.find((x) => x.name === l.name);
  if (!plan) { planBad.push(l.name + ':unknown'); continue; }
  const want = [];
  want.push('intercept');
  if (plan.parentPad) want.push('parentpad-press', 'parentpad-release');
  if (plan.childPad) want.push('childpad-press', 'childpad-release');
  if (plan.mode === 'direct') want.push('direct');
  if (plan.mode === 'proxy') want.push('post');
  if (plan.mode === 'cross-access') want.push('cross');
  if (plan.answer) want.push('answer');
  if (LAW[l.name] && LAW[l.name].choosers > 0 && !plan.answer) want.push('dismiss');
  const got = actionFor(l);
  if (!same(got.map((g) => g.k), want)) planBad.push(l.name + ':sequence ' + JSON.stringify(got.map((g) => g.k)) + ' want ' + JSON.stringify(want));
  const idOf = (k) => { const g = got.find((x) => x.k === k); return g ? g.id : null; };
  if (plan.mode === 'direct' && l.directSendId !== idOf('direct')) planBad.push(l.name + ':direct-id');
  if (plan.mode === 'proxy' && l.postSendId !== idOf('post')) planBad.push(l.name + ':post-id');
  if (plan.mode === 'cross-access' && l.crossSendId !== idOf('cross')) planBad.push(l.name + ':cross-id');
  if (plan.parentPad && (l.parentPadPressId !== idOf('parentpad-press') || l.parentPadReleaseId !== idOf('parentpad-release') || l.parentPadReleaseId <= l.parentPadPressId)) planBad.push(l.name + ':parentpad-ids');
  if (plan.childPad && (l.childPadPressId !== idOf('childpad-press') || l.childPadReleaseId !== idOf('childpad-release') || l.childPadReleaseId <= l.childPadPressId)) planBad.push(l.name + ':childpad-ids');
  if (plan.answer && (!isObj(l.answerSet) || l.answerSet.setSendId !== idOf('answer'))) planBad.push(l.name + ':answer-id');
  if (!plan.answer && l.answerSet !== null && l.answerSet !== undefined) planBad.push(l.name + ':answer-unexpected');
  // a chooser on a non-answer leg is dismissed with the cancel flag (armed for the NEXT chooser)
  if (arr(l.choosers).length && !plan.answer) { const d = log_dismiss(l); if (!d || l.dismissSendId !== d) planBad.push(l.name + ':dismiss-id'); }
}
function log_dismiss(l) { return (arr(l.cdpSendLog).find((c) => c.method === 'Page.setInterceptFileChooserDialog' && c.params.cancel === true) || {}).id ?? null; }
check('plan-calls', planBad.length === 0, 'plan calls differ from the frozen plan: ' + planBad.join(','));

// ---- CDP event logs / chooser attribution ----
const evBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const el = arr(l.cdpEventLog);
  if (el.some((e) => !['Page.fileChooserOpened', 'Page.frameNavigated'].includes(e.method))) evBad.push(l.name + ':method');
  const nav = el.filter((e) => e.method === 'Page.frameNavigated');
  if (nav.length !== 1 || nav[0].params.url !== PARENT_ORIGIN + '/?run=' + encodeURIComponent(r.nonce)) evBad.push(l.name + ':nav');
  for (const c of arr(l.choosers)) {
    if (!isObj(c.params) || !same(Object.keys(c.params).sort(), ['backendNodeId', 'frameId', 'mode']) || !['selectSingle', 'selectMultiple'].includes(c.params.mode) || !Number.isInteger(c.params.backendNodeId)) evBad.push(l.name + ':shape');
    if (c.params.frameId !== l.childFrameId) evBad.push(l.name + ':frame');
    const act = l.mode === 'direct' ? l.directSendId : l.postSendId;
    if (!(Number.isInteger(c.afterSendId) && c.afterSendId >= act && c.afterSendId <= act + 2)) evBad.push(l.name + ':binding ' + c.afterSendId + ' act ' + act);
  }
}
check('chooser-event-law', evBad.length === 0, 'chooser events: ' + evBad.join(','));

const spBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const w = LAW[l.name];
  if (!w) { spBad.push(l.name + ':no-law'); continue; }
  if (w.sp !== undefined && !same(l.direct, w.sp)) spBad.push(l.name + ':direct ' + JSON.stringify(l.direct));
  if (w.proxy !== undefined && !same(l.proxy, { ...w.proxy, target: l.target, origin: PARENT_ORIGIN })) spBad.push(l.name + ':proxy ' + JSON.stringify(l.proxy));
  if (w.cross !== undefined && !same(l.crossAccess, w.cross)) spBad.push(l.name + ':cross ' + JSON.stringify(l.crossAccess));
}
check('law', spBad.length === 0, 'per-leg showPicker laws: ' + spBad.join(','));

const actBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const w = LAW[l.name];
  if (!w) continue;
  const pa = [l.activationBefore && l.activationBefore.isActive, l.activationAfter && l.activationAfter.isActive];
  const ca = [l.childActivationBefore && l.childActivationBefore.isActive, l.childActivationAfter && l.childActivationAfter.isActive];
  if (!same(pa, w.pa)) actBad.push(l.name + ':parent ' + JSON.stringify(pa) + ' want ' + JSON.stringify(w.pa));
  if (!same(ca, w.ca)) actBad.push(l.name + ':child ' + JSON.stringify(ca) + ' want ' + JSON.stringify(w.ca));
}
check('activation-law', actBad.length === 0, 'transient-activation transitions: ' + actBad.join(','));

const proxyBad = [];
for (const l of legs) {
  if (!isObj(l) || l.mode !== 'proxy') continue;
  const log = arr(l.proxyLog);
  const replies = arr(l.replies);
  if (log.length !== 1 || !isObj(log[0]) || log[0].origin !== PARENT_ORIGIN || log[0].cmd !== 'showpicker' || log[0].target !== l.target) proxyBad.push(l.name + ':log ' + JSON.stringify(log));
  const wantReplyOrigin = l.frame === 'so' ? PARENT_ORIGIN : CHILD_ORIGIN;
  if (replies.length !== 1 || !isObj(replies[0]) || replies[0].origin !== wantReplyOrigin || !isObj(replies[0].data) || replies[0].data.cmd !== 'result') proxyBad.push(l.name + ':reply ' + JSON.stringify(replies));
  else if (!same(replies[0].data.result, l.proxy)) proxyBad.push(l.name + ':reply-result');
  if (!isObj(l.proxy) || l.proxy.target !== l.target || l.proxy.origin !== PARENT_ORIGIN) proxyBad.push(l.name + ':proxy-shape ' + JSON.stringify(l.proxy));
}
check('proxy-law', proxyBad.length === 0, 'proxy log/reply binding: ' + proxyBad.join(','));

const stateBad = [];
for (const l of legs) {
  if (!isObj(l)) continue;
  const w = LAW[l.name] || {};
  if (w.answer) {
    if (!same(l.childState, [['tabi-r91-answer.txt', 22, 'text/plain']])) stateBad.push(l.name + ':childState ' + JSON.stringify(l.childState));
    if (!isObj(l.answerSet) || arr(l.answerSet.files).length !== 1 || path.basename(l.answerSet.files[0]) !== 'tabi-r91-answer.txt' || !Number.isInteger(l.answerSet.backendNodeId) || !same(l.answerSet.setResult, {}) || l.answerSet.setError !== null) stateBad.push(l.name + ':answerSet ' + JSON.stringify(l.answerSet));
    const src = arr(l.choosers)[0];
    if (!src || !isObj(l.answerSet) || l.answerSet.backendNodeId !== src.params.backendNodeId) stateBad.push(l.name + ':answer-binding');
    if (!isObj(l.answer) || l.answer.name !== 'tabi-r91-answer.txt' || l.answer.size !== 22 || l.answer.sha256 !== sha256(Buffer.from('tabi-r91-answer-alpha\n'))) stateBad.push(l.name + ':answer-descriptor');
  } else if (!same(l.childState, [])) stateBad.push(l.name + ':childState ' + JSON.stringify(l.childState));
  if (!same(l.parentState, [])) stateBad.push(l.name + ':parentState ' + JSON.stringify(l.parentState));
  if (l.stateAfterDismiss !== null && !same(l.stateAfterDismiss, [])) stateBad.push(l.name + ':dismissState');
}
check('state-law', stateBad.length === 0, 'state / answer laws: ' + stateBad.join(','));

const evShapeBad = [];
const ptr = (e) => isObj(e) && ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].includes(e.type);
for (const l of legs) {
  if (!isObj(l)) continue;
  const w = LAW[l.name] || {};
  const wantParent = w.pe && w.pe.includes('pad') ? ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'] : [];
  const wantChild = (w.ce && w.ce.includes('cpad') ? ['pointerdown@cpad', 'mousedown@cpad', 'pointerup@cpad', 'mouseup@cpad', 'click@cpad'] : []).concat(w.answer ? ['input@s', 'change@s'] : []);
  if (!same(arr(l.pageEvents).map((e) => e.type + '@' + e.target), wantParent)) evShapeBad.push(l.name + ':parent ' + JSON.stringify(arr(l.pageEvents).map((e) => e.type + '@' + e.target)));
  if (!same(arr(l.childEvents).map((e) => e.type + '@' + e.target), wantChild)) evShapeBad.push(l.name + ':child ' + JSON.stringify(arr(l.childEvents).map((e) => e.type + '@' + e.target)));
  if (arr(l.pageEvents).some((e) => ptr(e) && !(e.isTrusted === true && e.act === true))) evShapeBad.push(l.name + ':parent-trust');
  if (arr(l.childEvents).some((e) => ptr(e) && !(e.isTrusted === true && e.act === true))) evShapeBad.push(l.name + ':child-trust');
  for (const e of [...arr(l.pageEvents), ...arr(l.childEvents)]) {
    if (!isObj(e) || !same(Object.keys(e).sort(), ['act', 'at', 'buttons', 'files', 'isTrusted', 'target', 'type', 'x', 'y'])) evShapeBad.push(l.name + ':event-keys');
    if (['input', 'change', 'cancel'].includes(e.type) && !(w.answer && e.target === 's')) evShapeBad.push(l.name + ':file-event ' + e.type);
  }
}
check('event-shape', evShapeBad.length === 0, 'page/child event shapes: ' + evShapeBad.join(','));

// ---- host argv / teardown / servers ----
const hostBad = [];
for (const l of legs) {
  if (!isObj(l)) { hostBad.push('not-an-object'); continue; }
  const a = arr(l.argv);
  const profile = a.find((x) => typeof x === 'string' && x.startsWith('--user-data-dir='));
  const tok = l.launchToken;
  const want = ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + ports.cdp, '--remote-debugging-address=127.0.0.1', profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  if (!same(a, want) || typeof tok !== 'string' || !/^[0-9a-f]{12}$/.test(tok) || typeof profile !== 'string' || !path.basename(profile).startsWith('profile')) hostBad.push(l.name + ':argv');
  if (!isObj(l.devtoolsListening) || !String(l.devtoolsListening.url).startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/') || !/^[0-9a-f-]{36}$/.test(l.devtoolsListening.browserId) || !String(l.stderrHead).includes(l.devtoolsListening.url)) hostBad.push(l.name + ':devtools');
  if (!isObj(l.teardown)) hostBad.push(l.name + ':teardown-missing');
  const parentOk = arr(l.serverLog).filter((s) => s.path === '/').length === 1 && arr(l.serverLog).filter((s) => s.path === '/').every((s) => s.run === r.nonce && s.status === 200) && arr(l.serverLog).filter((s) => s.path === '/same.html').length === 1 && arr(l.serverLog).filter((s) => s.path === '/same.html').every((s) => s.run === r.nonce && s.status === 200) && arr(l.serverLog).filter((s) => !['/', '/same.html'].includes(s.path)).every((s) => s.status === 404);
  if (!parentOk) hostBad.push(l.name + ':server');
  const childOk = arr(l.childServerLog).filter((s) => s.path === '/child.html').length === 1 && arr(l.childServerLog).filter((s) => s.path === '/child.html').every((s) => s.run === r.nonce && s.status === 200) && arr(l.childServerLog).filter((s) => s.path !== '/child.html').every((s) => s.status === 404);
  if (!childOk) hostBad.push(l.name + ':child-server');
}
check('host-argv', hostBad.length === 0, 'host argv / devtools / servers: ' + hostBad.join(','));
check('teardown-closure', legs.every((l) => isObj(l) && isObj(l.teardown) && arr(l.teardown.survivors).length === 0 && isObj(l.teardown.portProbes) && same(Object.keys(l.teardown.portProbes).sort(), ['child', 'devtools', 'fixture']) && Object.values(l.teardown.portProbes).every((v) => v === 'closed') && isObj(l.teardown.postKillCurl) && same(Object.keys(l.teardown.postKillCurl).sort(), ['child', 'devtools', 'fixture']) && Object.values(l.teardown.postKillCurl).every((v) => v === 7)), 'a leg teardown proof failed: ' + JSON.stringify(legs.map((l) => (isObj(l) ? [l.name, l.teardown && l.teardown.portProbes, l.teardown && l.teardown.postKillCurl] : null))));

// ---- run window and prior reproduction ----
const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 30000 && t1 - t0 < 900000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt);
const lawOf = (x) => arr(x.legs).map((l) => (isObj(l) ? { name: l.name, direct: l.direct, proxy: l.proxy ? { ok: l.proxy.ok, name: l.proxy.name, message: l.proxy.message, ret: l.proxy.ret, target: l.proxy.target } : l.proxy, cross: l.crossAccess, choosers: arr(l.choosers).length, frame: arr(l.choosers).map((c) => c.params && c.params.frameId === l.childFrameId), pa: [l.activationBefore && l.activationBefore.isActive, l.activationAfter && l.activationAfter.isActive], ca: [l.childActivationBefore && l.childActivationBefore.isActive, l.childActivationAfter && l.childActivationAfter.isActive], state: l.childState } : null));
const ownLaw = lawOf(r);
const priorBad = [];
let reproduced = false;
for (const p of priors) {
  if (!isObj(p) || p.schema !== SCHEMA) { priorBad.push('schema'); continue; }
  if (p.nonce === r.nonce) priorBad.push('nonce-reused');
  if (!same(lawOf(p), ownLaw)) priorBad.push('laws-differ'); else reproduced = true;
}
check('prior-set', priors.length >= 2 && priorBad.length === 0 && reproduced, 'prior receipts: ' + JSON.stringify(priorBad) + ' reproduced=' + reproduced);
check('replay-identity', legs.every((l) => isObj(l) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken)) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || !isObj(q.devtoolsListening) || q.devtoolsListening.browserId !== (l.devtoolsListening && l.devtoolsListening.browserId)))) && new Set(legs.map((l) => l.launchToken)).size === legs.length,
  'launch tokens / devtools ids repeat a prior or another leg');

// ---- verdict ----
const ids = Object.keys(checks);
const failed = ids.filter((id) => !checks[id]);
out({ verdict: failed.length === 0 ? 'clean' : 'findings', checkCount: ids.length, checks, findings }, failed.length === 0 ? 0 : 1);
