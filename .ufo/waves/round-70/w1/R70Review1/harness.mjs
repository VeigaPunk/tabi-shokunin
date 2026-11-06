// R70Review1 false-green harness: clones of the REAL scored receipt, each mutated one way.
// Never touches the repo scripts; writes mutated receipts + results under this scratch dir.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json';
const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-synthtap-r70.mjs';
const PIN = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
const HERE = '/fast/scratch/hyaku/tabi-r70/R70Review1';
const WORK = path.join(HERE, 'work');
fs.mkdirSync(WORK, { recursive: true });

const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const run = (file) => {
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, '--expect-driver-sha256', PIN, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, verdict: j && j.verdict, ids: j ? j.findings.map((f) => f.id) : null };
};

const cases = [];
const add = (name, predict, mutate) => cases.push({ name, predict, mutate });
const first = (r, leg, type) => r.events.find((e) => e.leg === leg && e.type === type);
const MOVE = { type: 'pointermove', seq: 0, leg: 'start', ts: 1, pointerType: 'mouse', isTrusted: true, detail: 0, button: -1, buttons: 0, clientX: 9999, clientY: 9999, target: 'BODY' };

add('baseline', 'CONTROL: expect exit 0 clean', () => {});
// --- extra unexpected CDP methods ---
add('x-cdp-scroll', 'PREDICT FALSE GREEN exit 0: synthesize* not in look-alike regex', (r) => { r.cdpSendLog.push({ id: 998, method: 'Input.synthesizeScrollGesture', params: { x: 200, y: 150, xDistance: 0, yDistance: -120 } }); });
add('x-cdp-pinch', 'PREDICT FALSE GREEN exit 0', (r) => { r.cdpSendLog.push({ id: 998, method: 'Input.synthesizePinchGesture', params: { x: 200, y: 150, xScale: 2 } }); });
add('x-cdp-ignore-input', 'PREDICT FALSE GREEN exit 0: Input.setIgnoreInputEvents unchecked', (r) => { r.cdpSendLog.push({ id: 997, method: 'Input.setIgnoreInputEvents', params: { ignore: true } }); });
add('x-runtime-eval-innocent', 'PREDICT exit 0 (Runtime.evaluate unpoliced by design)', (r) => { r.cdpSendLog.push({ id: 996, method: 'Runtime.evaluate', params: { expression: '1+1', returnByValue: true } }); });
// --- producer-verdict polarity ---
add('polarity-pred-true-hyp-refuted', 'expect exit 1 producer-verdict', (r) => { r.synthTapHypothesis = 'REFUTED'; });
add('polarity-pred-false-hyp-confirmed', 'expect exit 1 producer-verdict', (r) => { r.predicate = false; });
add('polarity-hyp-lowercase', 'expect exit 1 producer-verdict', (r) => { r.synthTapHypothesis = 'confirmed'; });
// --- timestamp typing ---
add('ts-string-window', 'PREDICT FALSE GREEN exit 0: string ts coerce in timing', (r) => { first(r, 'mouse', 'pointerdown').ts = '100'; first(r, 'mouse', 'pointerup').ts = '150'; r.legShape.mouse.pressReleaseMs = 50; });
add('ts-nan-string-click', 'PREDICT FALSE GREEN exit 0: click ts unconsumed', (r) => { first(r, 'mouse', 'click').ts = 'NaN'; });
add('ts-missing-mousedown', 'PREDICT FALSE GREEN exit 0: mousedown ts unconsumed', (r) => { delete first(r, 'mouse', 'mousedown').ts; });
// --- fabricated labels ---
add('pointertype-capital-touch', 'expect exit 1 leg-touch-seq (label checked)', (r) => { first(r, 'touch', 'pointerdown').pointerType = 'Touch'; r.legShape.touch.seqTypes[0] = 'pointerdown(Touch)'; });
add('target-forged-click', 'expect exit 1 leg-mouse-target', (r) => { first(r, 'mouse', 'click').target = 'btn2'; r.legShape.mouse.onButton = false; });
add('leg-outside-plan', 'expect exit 1 event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; });
add('legname-fabricated', 'expect exit 1 leg-order', (r) => { r.legs[0].name = 'phantom'; });
// --- duplicates / contradictions ---
add('dup-pointerup', 'expect exit 1 leg-mouse-seq', (r) => { const evs = r.events.filter((e) => e.leg === 'mouse'); const up = evs.find((e) => e.type === 'pointerup'); const c = clone(up); c.ts = up.ts + 1000; r.events.splice(r.events.indexOf(evs[evs.length - 1]) + 1, 0, c); renumber(r); });
add('outside-skipped-true', 'expect exit 1 leg-outside-error (skipped conjunct, error branch)', (r) => { r.legs.find((l) => l.name === 'outside').skipped = true; });
add('outside-claimed-success', 'expect exit 1 leg-outside-error', (r) => { const l = r.legs.find((l) => l.name === 'outside'); l.cdpError = null; l.cdpResult = {}; });
add('zero-fabricated-events', 'expect exit 1 leg-zero-seq (tapCount-0 produced events)', (r) => { const evs = r.events.filter((e) => e.leg === 'mouse').map((e) => { const c = clone(e); c.leg = 'zero'; return c; }); r.events.push(...evs); renumber(r); const s = r.legShape.zero; s.seqTypes = evs.map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')); s.total = evs.length; s.pressReleaseMs = +(first({ events: evs }, 'zero', 'pointerup').ts - first({ events: evs }, 'zero', 'pointerdown').ts).toFixed(1); s.clickDetails = [1]; });
add('hold-forged-fast-release', 'expect exit 1 leg-hold-timing (400ms claim broken)', (r) => { const d = first(r, 'hold', 'pointerdown'); first(r, 'hold', 'pointerup').ts = d.ts + 100; r.legShape.hold.pressReleaseMs = 100; });
add('tap-call-order-swap', 'expect exit 1 tap-call-params', (r) => { const i = []; r.cdpSendLog.forEach((c, idx) => { if (c.method === 'Input.synthesizeTapGesture') i.push(idx); }); const a = r.cdpSendLog[i[0]]; r.cdpSendLog[i[0]] = r.cdpSendLog[i[1]]; r.cdpSendLog[i[1]] = a; });
// --- forged legShape matching forged events (the declared form-only seam) ---
add('move-forged-start', 'PREDICT FALSE GREEN exit 0: move events fully unchecked', (r) => { r.events.unshift(clone(MOVE)); renumber(r); r.legShape.start.total = 1; });
add('flagship-scroll-plus-move', 'PREDICT FALSE GREEN exit 0: extra gesture producer + forged moves, all clean', (r) => { r.cdpSendLog.push({ id: 998, method: 'Input.synthesizeScrollGesture', params: { x: 200, y: 150, xDistance: 0, yDistance: -120 } }); r.events.unshift(clone(MOVE)); renumber(r); r.legShape.start.total = 1; });
// --- strictness / misc ---
add('clientx-string', 'expect exit 1 leg-mouse-coords (strict ===)', (r) => { first(r, 'mouse', 'click').clientX = '200'; });
add('serverlog-foreign-run', 'expect exit 1 server-log-binding', (r) => { r.serverLog.push({ path: '/', query: 'run=tabi-r70-other', run: 'tabi-r70-other', status: 200 }); });
add('cross-leg-interleave', 'PREDICT FALSE GREEN exit 0: cross-leg raw-log order unchecked', (r) => { const t = r.events.filter((e) => e.leg === 'touch'); const rest = r.events.filter((e) => e.leg !== 'touch'); const mIdx = rest.findIndex((e) => e.leg === 'mouse'); r.events = [...rest.slice(0, mIdx), ...t, ...rest.slice(mIdx)]; renumber(r); });
add('nonce-rebrand', 'PREDICT FALSE GREEN exit 0 (form-only: fully re-branded run accepted)', (r) => { r.nonce = 'tabi-r70-forged-1'; r.nonceOnPage = r.nonce; r.serverLog.forEach((s) => { if (s.path === '/' && s.status === 200) s.run = r.nonce; }); });

const rows = [];
for (const c of cases) {
  const r = clone(real); c.mutate(r);
  const f = path.join(WORK, c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  const o = run(f);
  rows.push({ name: c.name, exit: o.exit, verdict: o.verdict, findings: o.ids, predict: c.predict });
  console.log(`${c.name} | exit=${o.exit} | ${o.verdict} | [${(o.ids || []).join(',')}] | ${c.predict}`);
}
fs.writeFileSync(path.join(HERE, 'harness-results.json'), JSON.stringify(rows, null, 1));
console.log('DONE ' + rows.length + ' cases');
