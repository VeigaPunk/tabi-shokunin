// Witness scorer for the round-74 C1 mutant sweep: for every surviving semantic mutant, build a
// receipt the mutant accepts and the pinned counter refuses (acceptance witness), or — for the two
// stricter timeline mutants — a receipt the mutant refuses and the pinned counter accepts
// (over-refusal witness). Equivalence claims are probed with receipts the mutant might be expected
// to accept and both counters are shown to refuse.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const BASE = '/fast/scratch/hyaku/tabi-r74/R74Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const OUT = path.join(LANE, '.ufo/waves/round-74/w1/R74Mut1/witnesses');
const REAL = path.join(LANE, 'corpus/evidence/round74/chromium-ime-composition/receipt.json');
const PINNED = path.join(LANE, 'scripts/check-imecompose-r74.mjs');
const PIN = 'afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc';
const NONCE = 'tabi-r74-l1-ca30e1a3b7b2';
const C1 = path.join(LANE, '.ufo/waves/round-74/controls/c1');
const PRIORS = ['smoke1', 'smoke2', 'smoke3', 'smoke4', 'smoke5', 'smoke6', 'smoke7', 'smoke8', 'smoke9',
  'degenerate-dispatch-key', 'degenerate-exec-command', 'degenerate-script-events'].map((n) => path.join(C1, n + '.receipt.json'));

fs.mkdirSync(OUT, { recursive: true });
const sweep = JSON.parse(fs.readFileSync(path.join(BASE, 'sweep.json'), 'utf8'));
const mutDir = (id) => {
  const r = sweep.results.find((x) => x.id === id);
  if (!r) throw new Error('unknown mutant ' + id);
  const d = path.join(BASE, 'mut', String(r.i).padStart(2, '0') + '-' + id);
  if (!fs.existsSync(path.join(d, 'check-imecompose-r74.mjs'))) throw new Error('mutant dir missing ' + d);
  return d;
};
const clone = (v) => JSON.parse(JSON.stringify(v));

const run = (counter, file, extraPriors = []) => {
  const p = spawnSync(process.execPath, [counter, '--receipt', file, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE,
    ...PRIORS.flatMap((x) => ['--prior', x]), ...extraPriors.flatMap((x) => ['--prior', x]), '--json'], { encoding: 'utf8', timeout: 120000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findings: j ? j.findings.map((f) => f.id) : null, verdict: j ? j.verdict : null, stderr: j ? null : p.stderr.slice(0, 800) };
};

const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { const t = x.host.launchToken; x.host.launchToken = t.slice(0, -1) + (t.endsWith('0') ? '1' : '0'); };
const extraPrior = (mutate) => { const p = clone(JSON.parse(fs.readFileSync(REAL, 'utf8'))); mutate(p); swapToken(p); swapUrl(p); return p; };

// kind: accept = mutant accepts / pinned refuses; over-refusal = mutant refuses / pinned accepts;
// equivalence = both refuse the probe (no acceptance gap found).
const W = [
  { id: 'host-chromium-version-dropped', kind: 'accept', expectPinned: 'host-chromium', mutate: (r) => { r.host.chromium = 'Chromium x'; } },
  { id: 'devtools-url-prefix-any', kind: 'accept', expectPinned: 'devtools-port-binding', mutate: (r) => { const d = r.host.devtoolsListening; d.url = 'ws://127.0.0.1:1/devtools/browser/' + d.url.split('/devtools/browser/')[1]; r.host.stderrHead = 'DevTools listening on ' + d.url + '\n'; } },
  { id: 'leg-params-elapsed-optional', kind: 'accept', expectPinned: 'leg-params', mutate: (r) => { delete r.legs[2].elapsedMs; } },
  { id: 'typed-key-dropped', kind: 'accept', expectPinned: 'event-types', mutate: (r) => { r.events[15].key = 7; } },
  { id: 'typed-value-dropped', kind: 'accept', expectPinned: 'event-types', mutate: (r) => { r.events[15].value = 42; } },
  { id: 'typed-selend-dropped', kind: 'accept', expectPinned: 'event-types', mutate: (r) => { r.events[15].selEnd = 1.5; } },
  { id: 'typed-inputtype-number-allowed', kind: 'accept', expectPinned: 'event-types', mutate: (r) => { r.events[5].inputType = 5; } },
  { id: 'typed-time-positive-dropped', kind: 'accept', expectPinned: 'event-types', mutate: (r) => { r.events[13].ts = 0; } },
  { id: 'timeline-at-field-dropped', kind: 'over-refusal', expectMutant: 'replay-event-timeline', prior: () => extraPrior((p) => { p.events[7].at += 1; }) },
  { id: 'timeline-at-lte-boundary', kind: 'over-refusal', expectMutant: 'replay-event-timeline', mutate: (r) => { r.events[7].ts = 0.1; }, prior: () => { const p = clone(JSON.parse(fs.readFileSync(REAL, 'utf8'))); p.events[7].ts = 0.05; p.events[7].at = 948.1999999880791; return extraPrior((x) => { x.events = p.events; }); } },
  { id: 'quantum-tolerance-1e-2', kind: 'accept', expectPinned: 'event-time-quantum', mutate: (r) => { r.events[13].ts = 1554.3005; } },
  { id: 'marks-monotonic-slack', kind: 'accept', expectPinned: 'leg-marks', mutate: (r) => { r.legMarks[2].at = 27.75; } },
  { id: 'late-after-close-sub-one', kind: 'accept', expectPinned: 'leg-marks', mutate: (r) => { r.lateAfterClose = 0.5; } },
  { id: 'window-lower-dropped', kind: 'accept', expectPinned: 'event-leg-window', mutate: (r) => { r.legMarks[3].at = 640; } },
  { id: 'window-order-one-quantum', kind: 'accept', expectPinned: 'event-leg-window', mutate: (r) => { r.events[11].at = r.events[10].at - 0.1; } },
  { id: 'once-getversion-dropped', kind: 'accept', expectPinned: 'send-log-allowlist', mutate: (r) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method: 'Browser.getVersion', params: {} }); } },
  { id: 'once-metrics-dropped', kind: 'accept', expectPinned: 'send-log-allowlist', mutate: (r) => { const p = r.cdpSendLog.find((c) => c.method === 'Emulation.setDeviceMetricsOverride').params; r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method: 'Emulation.setDeviceMetricsOverride', params: clone(p) }); } },
  { id: 'ime-call-params-first-two', kind: 'accept', expectPinned: 'ime-call-params', mutate: (r) => { r.cdpSendLog[52].params.text = 'zz'; } },
  { id: 'teardown-curl-devtools-dropped', kind: 'accept', expectPinned: 'teardown-closure', mutate: (r) => { r.teardown.postKillCurl.devtools = 0; } },
  { id: 'teardown-fixture-probe-dropped', kind: 'accept', expectPinned: 'teardown-closure', mutate: (r) => { r.teardown.portProbes.fixture = 'open'; } },
  { id: 'failures-nonarray-dropped', kind: 'accept', expectPinned: 'failures-empty', mutate: (r) => { delete r.failures; } },
  { id: 'typed-composing-undefined-allowed', kind: 'equivalence', expectPinned: 'event-types', expectMutant: 'leg-compose-b-composing', mutate: (r) => { delete r.events[5].isComposing; } },
  { id: 'typed-events-empty-allowed', kind: 'equivalence', expectPinned: 'seq-monotonic', expectMutant: 'seq-monotonic', mutate: (r) => { r.events = []; } },
  { id: 'trust-end-not-true', kind: 'equivalence', expectPinned: 'event-types', expectMutant: 'event-types', mutate: (r) => { r.events[12].isTrusted = null; } },
  { id: 'no-keyboard-keydown-keypress-only', kind: 'equivalence', expectPinned: 'no-keyboard-events', expectMutant: 'leg-start-seq', mutate: (r) => { r.events.unshift({ type: 'keyup', seq: 0, leg: 'start', ts: 100, at: 100, isTrusted: true, data: null, inputType: null, isComposing: false, key: 'a', target: 'BODY', value: '', selStart: 0, selEnd: 0 }); r.events.forEach((e, i) => { e.seq = i + 1; }); } },
];

const results = [];
for (const w of W) {
  const r = clone(JSON.parse(fs.readFileSync(REAL, 'utf8')));
  if (w.mutate) w.mutate(r);
  const file = path.join(OUT, w.id + '.receipt.json');
  fs.writeFileSync(file, JSON.stringify(r));
  const extras = [];
  if (w.prior) { const pf = path.join(OUT, w.id + '.prior.json'); fs.writeFileSync(pf, JSON.stringify(w.prior())); extras.push(pf); }
  const p = run(PINNED, file, extras);
  const m = run(path.join(mutDir(w.id), 'check-imecompose-r74.mjs'), file, extras);
  const ok = w.kind === 'accept' ? (m.exit === 0 && p.exit === 1 && (p.findings || []).includes(w.expectPinned))
    : w.kind === 'over-refusal' ? (p.exit === 0 && m.exit === 1 && (m.findings || []).includes(w.expectMutant))
    : (p.exit !== 0 && m.exit !== 0);
  results.push({ id: w.id, kind: w.kind, receipt: path.relative(LANE, file), prior: extras[0] ? path.relative(LANE, extras[0]) : null,
    pinned: { exit: p.exit, findings: p.findings, verdict: p.verdict }, mutant: { exit: m.exit, findings: m.findings, verdict: m.verdict },
    expectPinned: w.expectPinned || null, expectMutant: w.expectMutant || null, ok, stderr: p.stderr || m.stderr || null });
  console.error(`${w.id} [${w.kind}] pinned=${p.exit}${p.findings ? '(' + p.findings.join(',') + ')' : ''} mutant=${m.exit}${m.findings ? '(' + m.findings.join(',') + ')' : ''} ok=${ok}`);
}
const eqArgs = {
  'leg-order-length-ge': 'canon(legs.map(name)) === canon(LEG_ORDER) already implies legs.length === LEG_ORDER.length; the dropped length conjunct is redundant for every receipt, JSON or not.',
  'leg-trusted-length-dropped': 'd.trusted, d.data and d.composing are all derived from the same evs array as d.seq; canon(d.seq) === canon(want.seq) implies evs.length === want.seq.length, and SHAPE gives seq/trusted/data/composing the same length, so the dropped length conjunct is redundant.',
  'typed-data-undefined-allowed': "JSON.parse never yields an own property with value undefined, and the mutation replaces only the `'data' in e` test with `e.data === undefined`; for every receipt reachable from JSON both forms are true iff data is absent or null/string.",
};
const summary = { schema: 'tabi-mutants-witnesses-r74-c1-r74mut1', real: REAL, pinned: PINNED, witnessDir: path.relative(LANE, OUT),
  results, equivalenceByProof: eqArgs };
fs.writeFileSync(path.join(OUT, 'witness-results.json'), JSON.stringify(summary, null, 1));
const bad = results.filter((x) => !x.ok);
console.log(JSON.stringify({ witnesses: results.length, ok: results.length - bad.length, bad: bad.map((b) => b.id) }, null, 1));
process.exit(bad.length ? 1 : 0);
