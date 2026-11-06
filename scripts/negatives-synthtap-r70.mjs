#!/usr/bin/env node
// Negative battery for scripts/check-synthtap-r70.mjs (tabi round 70, C1).
// Usage: node negatives-synthtap-r70.mjs --real <receipt.json> --expect-driver-sha256 <hex>
//          --work <ABS scratch dir> [--laundered <degenerate receipt.json> ...] [--json]
// Every case mutates the real receipt (or launders a committed degenerate receipt) and runs
// the counter BY PATH; a case passes only when the counter exits 1 AND lists the case's
// expected finding id. The positive case (the real receipt, unmutated) must exit 0.
// Coverage: every check id the counter declares (`--list-checks`) must be the expected id of
// at least one case, otherwise the battery fails with `coverage-gap` (one negative per check).
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-synthtap-r70.mjs');
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
const LEGS = ['start', 'mouse', 'hold', 'double', 'zero', 'default', 'touch', 'outside'];
const EMPTY = new Set(['start', 'zero', 'outside']);
const firstOf = (r, leg, pred = () => true) => r.events.find((e) => e.leg === leg && !/move$/.test(e.type) && pred(e));
const insertAt = (r, leg, ev) => {
  // insert after the last event of `leg` (or after the last event of the previous non-empty leg)
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  r.events.splice(idx + 1, 0, { type: 'click', seq: 0, leg, ts: 1, pointerType: 'mouse', isTrusted: true, detail: 1, button: 0, buttons: 0, clientX: 200, clientY: 150, target: 'btn', ...ev });
  return r;
};
const cases = [];
const add = (name, expect, mutate) => cases.push({ name, expect, mutate });

// global checks
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-synthtap-r69'; });
add('nonce-shape', 'nonce-shape', (r) => { r.nonce = 'TABI-r70-x'; r.nonceOnPage = r.nonce; r.serverLog.forEach((s) => { s.run = r.nonce; }); });
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r70-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'js-click'; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { s.run = 'tabi-r70-other'; }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Firefox 140.0'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
add('run-window', 'run-window', (r) => { r.finishedAt = r.startedAt; });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[1].params.x = 201; });
add('leg-order', 'leg-order', (r) => { [r.legs[1], r.legs[2]] = [r.legs[2], r.legs[1]]; });
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 99; });
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; });
add('tap-call-count', 'tap-call-count', (r) => { const i = r.cdpSendLog.findIndex((c) => c.method === 'Input.synthesizeTapGesture'); r.cdpSendLog.splice(i, 1); });
add('tap-call-params', 'tap-call-params', (r) => { const c = r.cdpSendLog.filter((x) => x.method === 'Input.synthesizeTapGesture')[2]; c.params.tapCount = 3; });
add('lookalike-dispatch-mouse', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 999, method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: 200, y: 150 } }); });
add('lookalike-dispatch-touch', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 999, method: 'Input.dispatchTouchEvent', params: { type: 'touchStart', touchPoints: [{ x: 200, y: 150 }] } }); });
add('lookalike-script-click', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 999, method: 'Runtime.evaluate', params: { expression: 'document.getElementById("btn").click()' } }); });
add('lookalike-callfunction', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 999, method: 'Runtime.callFunctionOn', params: { functionDeclaration: 'function(){this.dispatchEvent(new MouseEvent("click"))}' } }); });
add('teardown-closure', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; });
add('failures-empty', 'failures-empty', (r) => { r.failures.push({ id: 'drive-error', detail: 'x' }); });
add('producer-verdict-polarity', 'producer-verdict', (r) => { r.predicate = false; });
add('producer-hypothesis-polarity', 'producer-verdict', (r) => { r.synthTapHypothesis = 'REFUTED'; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape.mouse.total += 1; });

// per-leg checks: one negative for each (leg, check)
for (const leg of LEGS) {
  const empty = EMPTY.has(leg);
  add(`${leg}-seq`, `leg-${leg}-seq`, empty
    ? (r) => renumber(insertAt(r, leg, { type: 'pointerdown' }))
    : (r) => { const e = firstOf(r, leg); r.events.splice(r.events.indexOf(e), 1); renumber(r); });
  add(`${leg}-trusted`, `leg-${leg}-trusted`, empty
    ? (r) => renumber(insertAt(r, leg, { type: 'pointermove', isTrusted: false }))
    : (r) => { firstOf(r, leg).isTrusted = false; });
  add(`${leg}-detail`, `leg-${leg}-detail`, (r) => {
    const c = firstOf(r, leg, (e) => e.type === 'click');
    if (c) c.detail = 2; else renumber(insertAt(r, leg, { type: 'click', detail: 1 }));
  });
  if (leg === 'mouse') add('mouse-detail-button', 'leg-mouse-detail', (r) => { firstOf(r, 'mouse', (e) => e.type === 'mousedown').button = 2; });
  add(`${leg}-timing`, `leg-${leg}-timing`, empty
    ? (r) => { insertAt(r, leg, { type: 'pointerup', pointerType: 'mouse', ts: 60 }); insertAt(r, leg, { type: 'pointerdown', pointerType: 'mouse', ts: 10 }); renumber(r); }
    : (r) => { const u = firstOf(r, leg, (e) => e.type === 'pointerup'); u.ts += 500; });
  if (leg === 'double') add('double-second-tap-timing', 'leg-double-timing', (r) => { const ups = r.events.filter((e) => e.leg === 'double' && e.type === 'pointerup'); ups[1].ts += 500; });
  add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = r.legs.find((x) => x.name === leg); l.cdpError = leg === 'outside' ? null : '{"code":-32000,"message":"Synthetic tap failed"}'; });
  if (leg === 'touch') add('touch-skipped', 'leg-touch-error', (r) => { r.legs.find((x) => x.name === 'touch').skipped = true; });
  add(`${leg}-coords`, `leg-${leg}-coords`, empty
    ? (r) => renumber(insertAt(r, leg, { type: 'click', clientX: 0, clientY: 0 }))
    : (r) => { firstOf(r, leg).clientX = 201; });
  add(`${leg}-target`, `leg-${leg}-target`, empty
    ? (r) => renumber(insertAt(r, leg, { type: 'touchmove', target: 'BODY' }))
    : (r) => { firstOf(r, leg).target = 'BODY'; });
  add(`${leg}-dblclick`, `leg-${leg}-no-dblclick`, (r) => renumber(insertAt(r, leg, { type: 'dblclick', detail: 2 })));
}

const runCounter = (file) => {
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, '--expect-driver-sha256', pin, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findingIds: j ? j.findings.map((f) => f.id) : null };
};
const results = [];
const pos = runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
for (const c of cases) {
  const r = clone(real); c.mutate(r);
  const f = path.join(work, 'neg-' + c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  const o = runCounter(f);
  results.push({ case: c.name, expect: c.expect, exit: o.exit, findingIds: o.findingIds, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(c.expect) });
}
const LAUNDER_EXPECT = { 'js-click': 'no-lookalike-producer', 'dispatch-mouse': 'no-lookalike-producer', 'skip-touch': 'tap-call-count' };
for (const lp of multi('laundered')) {
  let d; try { d = JSON.parse(fs.readFileSync(lp, 'utf8')); } catch (e) { usage('laundered receipt unreadable: ' + lp); }
  const kind = d.degenerate; const expect = LAUNDER_EXPECT[kind];
  if (!expect) usage('laundered receipt has no known degenerate kind: ' + lp);
  // Laundering: claim a clean scored run -- not degenerate, producer CONFIRMED, real pin, real host
  // binding, and a legShape recomputed by the counter itself so legshape-consistency cannot fire.
  d.degenerate = null; d.predicate = true; d.synthTapHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.json');
  fs.writeFileSync(f, JSON.stringify(d));
  const pre = spawnSync(process.execPath, [COUNTER, '--receipt', f, '--json'], { encoding: 'utf8', timeout: 60000 });
  try { d.legShape = JSON.parse(pre.stdout).derived; } catch {}
  fs.writeFileSync(f, JSON.stringify(d));
  const o = runCounter(f);
  results.push({ case: 'laundered-' + kind, expect, exit: o.exit, findingIds: o.findingIds, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(expect) });
}
const listed = JSON.parse(spawnSync(process.execPath, [COUNTER, '--list-checks'], { encoding: 'utf8' }).stdout);
const covered = new Set(cases.map((c) => c.expect));
const coverageGap = listed.filter((id) => !covered.has(id));
const failed = results.filter((x) => !x.ok).map((x) => x.case);
const allOk = positiveOk && failed.length === 0 && coverageGap.length === 0;
const summary = { schema: 'tabi-negatives-synthtap-r70', real: realPath, positiveOk, cases: results.length, refusedForExpectedReason: results.filter((x) => x.ok).length, failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.refusedForExpectedReason}/${summary.cases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
process.exit(allOk ? 0 : 1);
