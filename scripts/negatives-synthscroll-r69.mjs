#!/usr/bin/env node
// Forgery battery for scripts/check-synthscroll-r69.mjs (tabi round 69 C2).
// Usage: node negatives-synthscroll-r69.mjs --real <clean receipt.json> --work <ABS dir>
//          [--laundered <degenerate receipt.json> ...] [--counter <path>] --out <result.json>
// Each negative is the real receipt with ONE targeted forgery (or a degenerate-driver
// receipt laundered to look green: degenerate:null, predicate:true, CONFIRMED, failures:[]).
// A negative passes the battery only when the counter exits 1 AND reports its expected
// finding id (source-location-specific: a refusal for the wrong reason does not count).
// The real receipt must exit 0 (positive control). Exit 0 = battery holds; 1 = a forgery
// greened, a negative was refused for the wrong reason, or the positive failed; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const many = (n) => argv.flatMap((a, i) => (a === '--' + n ? [argv[i + 1]] : []));
const realPath = opt('real'); const work = opt('work'); const outPath = opt('out');
const counter = opt('counter') || path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-synthscroll-r69.mjs');
if (!realPath || !work || !outPath || !path.isAbsolute(work)) { console.error('usage: --real <receipt> --work <ABS dir> --out <json> [--laundered <receipt>...] [--counter <path>]'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const real = JSON.parse(fs.readFileSync(realPath, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(real));
const legEvents = (r, leg) => r.events.filter((e) => e.leg === leg);
const reseq = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); r.pageState.eventCount = r.events.length; return r; };

const NEG = [
  ['producer-predicate-false', 'producer-predicate-true', (r) => { r.predicate = false; }],
  ['producer-hypothesis-refuted', 'producer-hypothesis-confirmed', (r) => { r.synthScrollHypothesis = 'REFUTED'; }],
  ['producer-failure-row', 'producer-failures-empty', (r) => { r.failures = [{ id: 'drive-error', detail: 'x' }]; }],
  ['degenerate-flag-set', 'scored-run-not-degenerate', (r) => { r.degenerate = 'js-scroll'; }],
  ['nonce-page-mismatch', 'nonce-on-page', (r) => { r.nonceOnPage = r.nonce + 'x'; }],
  ['server-log-other-run', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { s.run = 'tabi-r69-other'; }); }],
  ['plan-edited', 'plan-frozen', (r) => { r.plan[1].params.yDistance = -900; }],
  ['gesture-dropped', 'gesture-call-count', (r) => { const i = r.cdpSendLog.findIndex((c) => c.method === 'Input.synthesizeScrollGesture'); r.cdpSendLog.splice(i, 1); r.cdpSendLog.forEach((c, k) => { c.id = k + 1; }); }],
  ['gesture-duplicated', 'gesture-call-count', (r) => { const g = r.cdpSendLog.find((c) => c.method === 'Input.synthesizeScrollGesture'); r.cdpSendLog.push({ ...JSON.parse(JSON.stringify(g)), id: r.cdpSendLog.length + 1 }); }],
  ['gesture-param-source-swapped', 'gesture-params', (r) => { r.cdpSendLog.find((c) => c.method === 'Input.synthesizeScrollGesture' && c.params.gestureSourceType === 'touch').params.gestureSourceType = 'mouse'; }],
  ['wheel-producer-injected', 'no-other-input-producer', (r) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method: 'Input.dispatchMouseEvent', params: { type: 'mouseWheel', x: 400, y: 400, deltaX: 0, deltaY: 600 } }); }],
  ['script-scroll-injected', 'no-script-scroll', (r) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.scrollBy(0, 600)', returnByValue: true } }); }],
  ['send-log-id-gap', 'send-log-ordered', (r) => { r.cdpSendLog[2].id = 99; }],
  ['legs-reordered', 'legs-order', (r) => { [r.legs[1], r.legs[2]] = [r.legs[2], r.legs[1]]; }],
  ['event-seq-gap', 'event-seq', (r) => { r.events[3].seq = 999; }],
  ['event-leg-relabelled', 'event-legs-known-monotone', (r) => { const e = legEvents(r, 'default')[0]; e.leg = 'touch'; }],
  ['event-untrusted', 'all-events-trusted', (r) => { legEvents(r, 'mouse')[0].isTrusted = false; }],
  ['mouse-scrollY-forged', 'leg-mouse-scrollY', (r) => { r.legs.find((l) => l.name === 'mouse').scrollY = 700; }],
  ['default-before-forged', 'leg-default-scrollY-before', (r) => { r.legs.find((l) => l.name === 'default').scrollYBefore = 0; }],
  ['start-event-planted', 'leg-start-no-events', (r) => { r.events.unshift({ ...JSON.parse(JSON.stringify(r.events[0])), leg: 'start' }); reseq(r); }],
  ['mouse-wheel-removed', 'leg-mouse-wheel-present', (r) => { r.events = r.events.filter((e) => !(e.leg === 'mouse' && e.type === 'wheel')); reseq(r); }],
  ['mouse-pointer-planted', 'leg-mouse-only-wheel-scrollend', (r) => { const e = legEvents(r, 'mouse')[0]; r.events.splice(r.events.indexOf(e) + 1, 0, { ...JSON.parse(JSON.stringify(e)), type: 'pointermove', pointerType: 'mouse', deltaY: null }); reseq(r); }],
  ['repeat-wheel-sum-off', 'leg-repeat-wheel-sum', (r) => { legEvents(r, 'repeat').find((e) => e.type === 'wheel').deltaY += 7; }],
  ['default-wheel-deltaX', 'leg-default-wheel-axis', (r) => { legEvents(r, 'default').find((e) => e.type === 'wheel').deltaX = 3; }],
  ['default-wheel-direction', 'leg-default-wheel-direction', (r) => { const w = legEvents(r, 'default').filter((e) => e.type === 'wheel'); w[0].deltaY = -w[0].deltaY; w[1].deltaY += 2 * -w[0].deltaY; }],
  ['mouse-dispatch-outside-range', 'leg-mouse-dispatch-range', (r) => { legEvents(r, 'mouse').find((e) => e.type === 'wheel').scrollYAtDispatch = 5000; }],
  ['repeat-scrollend-short', 'leg-repeat-scrollend', (r) => { const ends = legEvents(r, 'repeat').filter((e) => e.type === 'scrollend'); r.events = r.events.filter((e) => e !== ends[0] && e !== ends[1]); reseq(r); }],
  ['touch-scrolled', 'leg-touch-no-scroll', (r) => { const t = r.legs.find((l) => l.name === 'touch'); t.scrollY = 1400; }],
  ['touch-wheel-planted', 'leg-touch-no-wheel', (r) => { const w = legEvents(r, 'repeat').find((e) => e.type === 'wheel'); r.events.push({ ...JSON.parse(JSON.stringify(w)), leg: 'touch', deltaY: 0 }); reseq(r); }],
  ['touch-pointerdown-doubled', 'leg-touch-pointerdown', (r) => { const e = legEvents(r, 'touch').find((x) => x.type === 'pointerdown'); r.events.splice(r.events.indexOf(e), 0, JSON.parse(JSON.stringify(e))); reseq(r); }],
  ['touch-pointerup-dropped', 'leg-touch-pointerup', (r) => { r.events = r.events.filter((e) => !(e.leg === 'touch' && e.type === 'pointerup')); reseq(r); }],
  ['touch-touchstart-dropped', 'leg-touch-touchstart', (r) => { r.events = r.events.filter((e) => !(e.leg === 'touch' && e.type === 'touchstart')); reseq(r); }],
  ['touch-touchend-dropped', 'leg-touch-touchend', (r) => { r.events = r.events.filter((e) => !(e.leg === 'touch' && e.type === 'touchend')); reseq(r); }],
  ['touch-moves-dropped', 'leg-touch-pointermove', (r) => { r.events = r.events.filter((e) => !(e.leg === 'touch' && e.type === 'pointermove')); reseq(r); }],
  ['touch-pointer-as-mouse', 'leg-touch-no-mouse-pointer', (r) => { legEvents(r, 'touch').find((x) => x.type === 'pointermove').pointerType = 'mouse'; }],
  ['final-scrollY-forged', 'page-final-scrollY', (r) => { r.pageState.scrollY = 600; }],
  ['event-count-forged', 'page-event-count', (r) => { r.pageState.eventCount += 1; }],
  ['teardown-survivor', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; }],
  ['schema-forged', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-r67'; }],
  ['host-identity-blank', 'chromium-identity', (r) => { r.host.chromium = ''; }],
];
const runCounter = (file, extra = []) => {
  const p = spawnSync(process.execPath, [counter, '--receipt', file, '--json', ...extra], { encoding: 'utf8' });
  let parsed = null; try { parsed = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, ids: parsed ? parsed.findings.map((f) => f.id) : null };
};
const results = [];
const positivePath = path.join(work, 'positive.json');
fs.writeFileSync(positivePath, JSON.stringify(real));
const pos = runCounter(positivePath);
results.push({ name: 'positive-real', expect: 'clean', exit: pos.exit, ids: pos.ids, ok: pos.exit === 0 });
for (const [name, expectId, mutate] of NEG) {
  const r = clone(); mutate(r);
  const f = path.join(work, name + '.json'); fs.writeFileSync(f, JSON.stringify(r));
  const res = runCounter(f);
  results.push({ name, expectId, exit: res.exit, ids: res.ids, ok: res.exit === 1 && Array.isArray(res.ids) && res.ids.includes(expectId) });
}
// driver-sha pin negative: the real receipt checked against a wrong pin
const pin = runCounter(positivePath, ['--expect-driver-sha256', '0'.repeat(64)]);
results.push({ name: 'driver-sha-pin-wrong', expectId: 'driver-sha256-pin', exit: pin.exit, ids: pin.ids, ok: pin.exit === 1 && pin.ids?.includes('driver-sha256-pin') });
for (const lp of many('laundered')) {
  const d = JSON.parse(fs.readFileSync(lp, 'utf8'));
  const kind = d.degenerate;
  d.degenerate = null; d.predicate = true; d.synthScrollHypothesis = 'CONFIRMED'; d.failures = [];
  const f = path.join(work, 'laundered-' + kind + '.json'); fs.writeFileSync(f, JSON.stringify(d));
  const res = runCounter(f);
  const expectId = { 'js-scroll': 'gesture-call-count', 'dispatch-wheel': 'no-other-input-producer', 'skip-touch': 'gesture-call-count' }[kind];
  results.push({ name: 'laundered-' + kind, expectId, source: lp, exit: res.exit, ids: res.ids, ok: res.exit === 1 && Array.isArray(res.ids) && res.ids.includes(expectId) });
}
const failed = results.filter((x) => !x.ok);
const summary = { counter, counterSha256: (await import('node:crypto')).createHash('sha256').update(fs.readFileSync(counter)).digest('hex'), real: realPath, negatives: results.length - 1, refusedForExpectedReason: results.filter((x) => x.name !== 'positive-real' && x.ok).length, positiveOk: results[0].ok, failed: failed.map((x) => x.name), results };
fs.writeFileSync(outPath, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ negatives: summary.negatives, refusedForExpectedReason: summary.refusedForExpectedReason, positiveOk: summary.positiveOk, failed: summary.failed }));
process.exit(failed.length ? 1 : 0);
