#!/usr/bin/env node
// Negative battery for scripts/check-synthpinch-r71.mjs (tabi round 71, C1).
// Usage: node negatives-synthpinch-r71.mjs --real <receipt.json> --expect-driver-sha256 <hex>
//          --work <ABS scratch dir> [--laundered <degenerate receipt.json> ...] [--json]
// Every case mutates the real receipt and runs the counter BY PATH. Unless the case targets
// legshape-consistency, the producer's legShape is then LAUNDERED (recomputed from the
// counter's own re-derivation) so that check cannot fire on the mutation's behalf.
// ISOLATION (round-70 routed defect R3: a battery that only checks "the expected id is among
// the findings" lets a disabled check hide behind a co-firing one): a case passes only when the
// counter exits 1, lists the expected id, and lists NO other id except those the case names in
// `alsoAllowed` (each such allowance is declared below with its reason). So every check id has
// at least one case in which it is the only (or the only undeclared) refusal: disabling that
// check leaves the case with no expected finding and the battery fails.
// The positive case (the real receipt, unmutated) must exit 0.
// Coverage: every check id the counter declares (`--list-checks`) must be the expected id of
// at least one case, otherwise the battery fails with `coverage-gap`.
// Laundered degenerate receipts (control-run receipts relabelled as clean scored runs) must be
// refused for their expected id; co-firing ids are allowed there (they are whole-run forgeries).
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-synthpinch-r71.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work');
if (!realPath || !pin || !work || !path.isAbsolute(work)) usage('--real, --expect-driver-sha256 and an absolute --work are required');
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
fs.mkdirSync(work, { recursive: true });
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const LEGS = ['start', 'in', 'out', 'clamp', 'unit', 'default', 'touch', 'slow', 'pen', 'outside', 'zero'];
const WANT_SCALE = { start: 1, in: 2, out: 1, clamp: 1, unit: 1, default: 1.5, touch: 1.5, slow: 1.5, pen: 1.5, outside: 1.5, zero: 1.5 };
const WHEEL_LEGS = new Set(['in', 'out', 'clamp', 'default', 'zero']);
const TOUCH_LEGS = new Set(['touch', 'slow']);
const ERROR_LEGS = new Set(['pen', 'outside', 'zero']);
const TIMED = new Set(['in', 'out', 'clamp', 'default', 'touch', 'slow', 'zero']);
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const insertAt = (r, leg, ev) => {
  // insert after the last event of `leg` (or after the last event of an earlier leg)
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  r.events.splice(idx + 1, 0, { type: 'pointerdown', seq: 0, leg, ts: 1, isTrusted: true, pointerType: 'mouse', ctrlKey: false, deltaY: null, deltaMode: null, clientX: 400, clientY: 300, touches: null, changed: null, scale: WANT_SCALE[leg], target: 'pad', ...ev });
  return renumber(r);
};
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], launder = true) => cases.push({ name, expect, mutate, alsoAllowed, launder });

// global checks
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-synthtap-r70'; });
add('nonce-shape', 'nonce-shape', (r) => { r.nonce = 'TABI-r71-x'; r.nonceOnPage = r.nonce; r.serverLog.forEach((s) => { s.run = r.nonce; }); });
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r71-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'set-scale'; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { s.run = 'tabi-r71-other'; }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Firefox 140.0'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
add('run-window-short', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 5000).toISOString(); });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[1].params.scaleFactor = 3; });
add('leg-order', 'leg-order', (r) => { [r.legs[1], r.legs[2]] = [r.legs[2], r.legs[1]]; });
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 999; });
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; });
// Removing a call necessarily also changes the params list: declared co-fire.
add('pinch-call-count', 'pinch-call-count', (r) => { const i = r.cdpSendLog.findIndex((c) => c.method === 'Input.synthesizePinchGesture'); r.cdpSendLog.splice(i, 1); }, ['pinch-call-params']);
add('pinch-call-params', 'pinch-call-params', (r) => { r.cdpSendLog.filter((x) => x.method === 'Input.synthesizePinchGesture')[0].params.relativeSpeed = 400; });
add('lookalike-dispatch-wheel', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9991, method: 'Input.dispatchMouseEvent', params: { type: 'mouseWheel', x: 400, y: 300, deltaX: 0, deltaY: -5, modifiers: 2 } }); });
add('lookalike-dispatch-touch', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9992, method: 'Input.dispatchTouchEvent', params: { type: 'touchStart', touchPoints: [{ x: 400, y: 300 }] } }); });
add('lookalike-set-scale', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9993, method: 'Emulation.setPageScaleFactor', params: { pageScaleFactor: 2 } }); });
add('lookalike-touch-emulation', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9994, method: 'Emulation.setTouchEmulationEnabled', params: { enabled: true } }); });
add('lookalike-script-wheel', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9995, method: 'Runtime.evaluate', params: { expression: 'document.dispatchEvent(new WheelEvent("wheel",{ctrlKey:true,deltaY:-5}))' } }); });
add('lookalike-script-log', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9996, method: 'Runtime.evaluate', params: { expression: 'window.__events.push({type:"wheel"})' } }); });
add('lookalike-other-gesture', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9997, method: 'Input.synthesizeScrollGesture', params: { x: 400, y: 300, yDistance: -100 } }); });
add('teardown-closure', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; });
add('failures-empty', 'failures-empty', (r) => { r.failures.push({ id: 'drive-error', detail: 'x' }); });
add('producer-verdict-polarity', 'producer-verdict', (r) => { r.predicate = false; });
add('producer-hypothesis-polarity', 'producer-verdict', (r) => { r.synthPinchHypothesis = 'REFUTED'; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape.in.total += 1; }, [], false);
add('scale-agreement-cdp', 'scale-agreement', (r) => { r.legs[3].scaleBefore.cdp += 0.5; });
add('scale-agreement-chain', 'scale-agreement', (r) => { r.legs[6].scaleBefore.page += 0.5; r.legs[6].scaleBefore.cdp += 0.5; });
add('wheel-anchor', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX += 5; });
add('wheel-anchor-clamp-exact', 'wheel-anchor', (r) => { evsOf(r, 'clamp', (e) => e.type === 'wheel')[2].clientY += 1; });
add('wheel-delta-law', 'wheel-delta-law', (r) => { evsOf(r, 'clamp', (e) => e.type === 'wheel')[0].deltaY *= 2; });
add('touch-geometry-x', 'touch-geometry', (r) => { evsOf(r, 'touch', (e) => e.type === 'touchmove')[1].touches[0][0] += 3; });
add('touch-geometry-shrink', 'touch-geometry', (r) => { const t = evsOf(r, 'slow', (e) => e.type === 'touchmove'); const a = t[3].touches; const b = t[4].touches; t[4].touches = [[a[0][0], a[0][1] + 1], [a[1][0], a[1][1] - 1]]; void b; });
add('slow-ratio', 'slow-ratio', (r) => { const t = evsOf(r, 'slow', (e) => e.type === 'touchend'); t[t.length - 1].ts += 3000; });

// per-leg checks
for (const leg of LEGS) {
  const wheelLeg = WHEEL_LEGS.has(leg); const touchLeg = TOUCH_LEGS.has(leg);
  // seq
  if (touchLeg) add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { const ups = evsOf(r, leg, (e) => e.type === 'pointerup'); r.events.splice(r.events.indexOf(ups[ups.length - 1]), 1); renumber(r); });
  else add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { insertAt(r, leg, { type: 'pointerdown', pointerType: 'mouse' }); });
  // trusted (an empty leg cannot gain an event without also changing its sequence: declared co-fire)
  if (wheelLeg || touchLeg) add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { evsOf(r, leg)[1].isTrusted = false; });
  else add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { insertAt(r, leg, { type: 'pointerup', isTrusted: false }); }, [`leg-${leg}-seq`]);
  // wheels
  if (wheelLeg) add(`${leg}-wheels-ctrl`, `leg-${leg}-wheels`, (r) => { evsOf(r, leg, (e) => e.type === 'wheel')[1].ctrlKey = false; });
  else add(`${leg}-wheels-extra`, `leg-${leg}-wheels`, (r) => { insertAt(r, leg, { type: 'wheel', pointerType: null, ctrlKey: true, deltaY: -3, deltaMode: 0, clientX: 400, clientY: 300 }); });
  if (wheelLeg && leg !== 'zero') add(`${leg}-wheels-sign`, `leg-${leg}-wheels`, (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); w[w.length - 1].deltaY = -w[w.length - 1].deltaY; }, leg === 'clamp' ? ['wheel-delta-law'] : []);
  // scale: move this leg's end scale AND the next leg's start scale together, so the chain holds
  add(`${leg}-scale`, `leg-${leg}-scale`, (r) => {
    const i = r.legs.findIndex((l) => l.name === leg);
    r.legs[i].scaleAfter.page += 0.5; r.legs[i].scaleAfter.cdp += 0.5;
    if (r.legs[i + 1]) { r.legs[i + 1].scaleBefore.page += 0.5; r.legs[i + 1].scaleBefore.cdp += 0.5; }
  });
  // timing
  if (TIMED.has(leg)) {
    if (touchLeg) add(`${leg}-timing`, `leg-${leg}-timing`, (r) => { const t = evsOf(r, leg, (e) => e.type === 'touchmove'); for (const e of t.slice(1, -1)) r.events.splice(r.events.indexOf(e), 1); renumber(r); });
    else if (leg === 'zero') add('zero-timing', 'leg-zero-timing', (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); for (const e of w.slice(1)) e.ts = w[0].ts + 100; });
    else add(`${leg}-timing`, `leg-${leg}-timing`, (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); w[w.length - 1].ts += 1000; });
  }
  // error
  add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = r.legs.find((x) => x.name === leg); l.cdpError = ERROR_LEGS.has(leg) ? null : '{"code":-32000,"message":"Synthetic pinch failed, result was 2"}'; });
  if (touchLeg) add(`${leg}-skipped`, `leg-${leg}-error`, (r) => { r.legs.find((x) => x.name === leg).skipped = true; });
}

const runCounter = (file, withPin = true) => {
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, ...(withPin ? ['--expect-driver-sha256', pin] : []), '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findingIds: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null };
};
const results = [];
const pos = runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
for (const c of cases) {
  const r = clone(real); c.mutate(r);
  const f = path.join(work, 'neg-' + c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  if (c.launder) {
    const pre = runCounter(f, false);
    if (pre.derived) { r.legShape = pre.derived; fs.writeFileSync(f, JSON.stringify(r)); }
  }
  const o = runCounter(f);
  const ids = Array.isArray(o.findingIds) ? o.findingIds : [];
  const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
  results.push({ case: c.name, expect: c.expect, alsoAllowed: c.alsoAllowed, exit: o.exit, findingIds: o.findingIds, isolated: ids.length === 1 && ids[0] === c.expect, ok: o.exit === 1 && ids.includes(c.expect) && extra.length === 0, extra });
}
const LAUNDER_EXPECT = { 'dispatch-wheel': 'no-lookalike-producer', 'set-scale': 'no-lookalike-producer', 'skip-touch': 'pinch-call-count' };
for (const lp of multi('laundered')) {
  let d; try { d = JSON.parse(fs.readFileSync(lp, 'utf8')); } catch (e) { usage('laundered receipt unreadable: ' + lp); }
  const kind = d.degenerate; const expect = LAUNDER_EXPECT[kind];
  if (!expect) usage('laundered receipt has no known degenerate kind: ' + lp);
  d.degenerate = null; d.predicate = true; d.synthPinchHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.json');
  fs.writeFileSync(f, JSON.stringify(d));
  const pre = runCounter(f, false);
  if (pre.derived) d.legShape = pre.derived;
  fs.writeFileSync(f, JSON.stringify(d));
  const o = runCounter(f);
  results.push({ case: 'laundered-' + kind, expect, alsoAllowed: ['*'], exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(expect), extra: [] });
}
const listed = JSON.parse(spawnSync(process.execPath, [COUNTER, '--list-checks'], { encoding: 'utf8' }).stdout);
const covered = new Set(cases.map((c) => c.expect));
const coverageGap = listed.filter((id) => !covered.has(id));
const failed = results.filter((x) => !x.ok).map((x) => x.case);
const allOk = positiveOk && failed.length === 0 && coverageGap.length === 0;
const summary = { schema: 'tabi-negatives-synthpinch-r71', real: realPath, positiveOk, cases: results.length, refusedForExpectedReason: results.filter((x) => x.ok).length, isolatedCases: results.filter((x) => x.isolated).length, failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.refusedForExpectedReason}/${summary.cases} isolated=${summary.isolatedCases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
process.exit(allOk ? 0 : 1);
