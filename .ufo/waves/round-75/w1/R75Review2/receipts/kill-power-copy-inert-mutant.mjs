#!/usr/bin/env node
// Pre-freeze kill-power control, tabi round 75 C1 (check-dragdrop-r75; structure of the round-74
// kill-power control). Two mutant classes, each a copy of scripts/check-dragdrop-r75.mjs with the
// battery copy scripts/negatives-dragdrop-r75.mjs AND the pinned driver beside it, run against one
// real receipt:
//  (1) FORCE-TRUE: for every check id the counter declares (--list-checks), that one check
//      always holds (its `ok` forced true at the check() hook).
//  (2) SEMANTIC (source-location-specific; tabi r62 closure M5 / r63 prerequisite): a named
//      operator/polarity/tolerance edit at one exact source string of the counter. Each edit
//      string must occur EXACTLY once in the counter bytes, else the control refuses (exit 2).
// New in r75 (round-74 routed defect 2, R74Review2 F1): a mutant is KILLED only when its battery
// exits 1 AND prints a parsable summary whose `failed` list is non-empty. A battery that crashes
// (any other exit, or unparsable output) is CRASHED, never killed, and a crashed mutant makes
// `holds` false. The battery is given the three laundered degenerate receipts (it refuses to run
// without them). Mutant batteries run with --first-failure (they stop at the first case that is
// not as expected); the unmutated battery always runs in full, so `holds` still requires every case.
// holds = unmutated battery exit 0 with a parsable allOk summary AND every mutant of both classes killed.
// Usage: node kill-power-r75.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <nonce> --prior <receipt.json> [--prior ...] --laundered <deg.json> (x3)
//          --work <ABS scratch> --out <summary.json> [--jobs 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const lane = opt('lane'), real = opt('real'), pin = opt('expect-driver-sha256'), work = opt('work'), outFile = opt('out');
const jobs = Number(opt('jobs') || 4);
const expectNonce = opt('expect-nonce');
const priors = multi('prior');
const laundered = multi('laundered');
if (!lane || !real || !pin || !expectNonce || priors.length === 0 || laundered.length !== 3 || !work || !outFile || !path.isAbsolute(work) || !path.isAbsolute(lane)) { console.error('usage: absolute --lane/--work, --real, --expect-driver-sha256, --expect-nonce, >= 1 --prior, 3 --laundered, --out'); process.exit(2); }
const COUNTER = 'check-dragdrop-r75.mjs', BATTERY = 'negatives-dragdrop-r75.mjs', DRIVER = 'chrome-cdp-dragdrop-round75.mjs';
const driverBytes = fs.readFileSync(path.join(lane, 'scripts', DRIVER));
const counterSrc = fs.readFileSync(path.join(lane, 'scripts', COUNTER), 'utf8');
const batterySrc = fs.readFileSync(path.join(lane, 'scripts', BATTERY), 'utf8');
const ids = JSON.parse(spawnSync(process.execPath, [path.join(lane, 'scripts', COUNTER), '--list-checks'], { encoding: 'utf8' }).stdout);
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
const SEMANTIC = [
  { id: 'M5-producer-verdict-and-to-or', from: "r.predicate === true && r.dragHypothesis === 'CONFIRMED'", to: "r.predicate === true || r.dragHypothesis === 'CONFIRMED'" },
  { id: 'M-driver-pin-any', from: 'r.driverSha256 === pin', to: "typeof r.driverSha256 === 'string'" },
  { id: 'M-nonce-on-page-dropped', from: "typeof r.nonce === 'string' && r.nonceOnPage === r.nonce", to: "typeof r.nonce === 'string'" },
  { id: 'M-nonce-expected-dropped', from: 'r.nonce === expectNonce', to: "typeof r.nonce === 'string'" },
  { id: 'M-degenerate-loose-null', from: 'r.degenerate === null', to: 'r.degenerate == null' },
  { id: 'M-fixture-hash-dropped', from: 'isObj(r.fixture) && r.fixture.sha256 === fixtureWant', to: 'isObj(r.fixture)' },
  { id: 'M-replay-token-every-to-some', from: 'priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok)', to: 'priors.some((p) => !isObj(p.host) || p.host.launchToken !== tok)' },
  { id: 'M-replay-url-dropped', from: 'priors.every((p) => browserId(p.host) !== bid)', to: 'true' },
  { id: 'M-replay-url-case-sensitive', from: 'return m ? m[1].toLowerCase() : null;', to: 'return m ? m[1] : null;' },
  { id: 'M-timeline-frac-high', from: 'FRAC = 0.5,', to: 'FRAC = 0.95,' },
  { id: 'M-timeline-gapfrac-off', from: 'GAP_FRAC = 0.75', to: 'GAP_FRAC = 1.01' },
  { id: 'M-timeline-tol-exact', from: 'TOL = 0.05', to: 'TOL = 1e-9' },
  { id: 'M-timeline-gap-test-dropped', from: 's.abs >= FRAC || s.gap >= GAP_FRAC', to: 's.abs >= FRAC' },
  { id: 'M-timeline-abs-test-dropped', from: 's.abs >= FRAC || s.gap >= GAP_FRAC', to: 's.gap >= GAP_FRAC' },
  { id: 'M-timeline-min-gaps-dropped', from: 'ownGaps >= 6 && ', to: '' },
  { id: 'M-quantum-tolerance-wide', from: 'Math.round(v * 10)) <= 1e-4', to: 'Math.round(v * 10)) <= 1' },
  { id: 'M-run-window-floor', from: 't1 - t0 >= 4500', to: 't1 - t0 >= 0' },
  { id: 'M-late-after-close-loose', from: 'r.lateAfterClose === 0', to: 'r.lateAfterClose >= 0' },
  { id: 'M-leg-window-upper-dropped', from: 'return e.at >= w[0] && e.at <= w[1] &&', to: 'return e.at >= w[0] &&' },
  { id: 'M-sentdata-unchecked', from: "(wantSent(FROZEN[i]) === null ? l.sentData === null : (l.sentData !== undefined && canon(l.sentData) === canon(wantSent(FROZEN[i]))))", to: 'true' },
  { id: 'M-call-count-case-sensitive', from: '/^input\\./i.test(c.method)', to: "c.method.startsWith('Input.')" },
  { id: 'M-intercept-binding-dropped', from: ' && intercepts[0].afterSendId === moveStartSend', to: '' },
  { id: 'M-intercept-count-at-least', from: 'intercepts.length === 1 && moveStartSend', to: 'intercepts.length >= 1 && moveStartSend' },
  { id: 'M-intercept-data-dropped', from: "check('intercept-data', interceptData !== undefined && canon(interceptData) === canon(INTERCEPT_WANT)", to: "check('intercept-data', interceptData !== undefined" },
  { id: 'M-event-log-open', from: 'eventLog.length === 1 && ', to: '' },
  { id: 'M-allowlist-eval-any', from: ' && EXPRS.has(c.params.expression)', to: '' },
  { id: 'M-navigate-once-dropped', from: "once('Page.navigate') && ", to: '' },
  { id: 'M-teardown-sweep-dropped', from: 'td.postKillSweepCount === 0 && ', to: '' },
  { id: 'M-trust-some', from: "ev.every((e) => e.isTrusted === true)", to: "ev.some((e) => e.isTrusted === true)" },
  { id: 'M-protection-drop-only', from: "(e.type === 'dragstart' || e.type === 'drop') ? e.plain !== '' : e.plain === '' && e.custom === ''", to: "(e.type === 'dragstart' || e.type === 'drop') ? e.plain !== '' : e.plain === ''" },
  { id: 'M-native-marker-dropped', from: 'nativeMarker.length === 0 && ', to: '' },
  { id: 'M-native-early-dropped', from: ' && beforeDispatch.length === 0', to: '' },
  { id: 'M-drop-polarity', from: "(over.defaultPrevented ? es[1].type === 'drop'", to: "(!over.defaultPrevented ? es[1].type === 'drop'" },
  { id: 'M-drop-counts-dropped', from: " && dragEv.filter((e) => e.type === 'drop').length === 1 && dragEv.filter((e) => e.type === 'dragleave').length === 1", to: '' },
  { id: 'M-cancel-window-dropped', from: 'dragEv.filter((e) => LEG_ORDER.indexOf(e.leg) >= cancelIdx).length === 0 && ', to: '' },
  { id: 'M-lifecycle-effect-dropped', from: ' && ends[0].dropEffect === drops[0].dropEffect', to: '' },
  { id: 'M-lifecycle-order-dropped', from: ' && ends[0].seq > drops[0].seq', to: '' },
  { id: 'M-coordinate-y-dropped', from: 'e.x !== l.params.x || e.y !== l.params.y', to: 'e.x !== l.params.x' },
  { id: 'M-mask-dragstart-dropped', from: "if (e.type === 'dragstart') return e.effectAllowed !== 'copyMove';", to: "if (e.type === 'dragstart') return false;" },
  { id: 'M-inert-detail-string', from: "'schema ' + r.schema", to: "'schema ' + String(r.schema)" },
  { id: 'M-event-types-dt-consistency', from: " && (DRAG_TYPES.has(e.type) ? e.types !== null : e.types === null)", to: '' },
];
if (!counterSrc.includes(HOOK)) { console.error('hook line not found'); process.exit(2); }
for (const m of SEMANTIC) {
  const k = counterSrc.split(m.from).length - 1;
  if (k !== 1) { console.error(`semantic mutant ${m.id}: edit string occurs ${k} times (must be 1)`); process.exit(2); }
}
const mk = (name, src) => {
  const d = path.join(work, name); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, 'w'), { recursive: true });
  fs.writeFileSync(path.join(d, COUNTER), src);
  fs.writeFileSync(path.join(d, BATTERY), batterySrc);
  fs.writeFileSync(path.join(d, DRIVER), driverBytes);
  return d;
};
const run = (d, first) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(d, BATTERY), '--real', real, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce, ...priors.flatMap((x) => ['--prior', x]),
    ...laundered.flatMap((x) => ['--laundered', x]), '--work', path.join(d, 'w'), '--json', ...(first ? ['--first-failure'] : [])], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  // 'close', not 'exit': the summary is read only after stdout has drained (an 'exit'-time read can
  // see a truncated summary and score a crash).
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j }); });
});
const tasks = [
  { cls: 'unmutated', id: '(unmutated)', src: counterSrc },
  ...[].map((id) => ({ cls: 'force-true', id, src: counterSrc.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(id)}) ok = true; checks[id] = !!ok;`) })),
  ...SEMANTIC.filter((m) => m.id === 'M-inert-detail-string').map((m) => ({ cls: 'semantic', id: m.id, src: counterSrc.replace(m.from, m.to) })),
];
const results = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => {
  while (next < tasks.length) {
    const i = next++; const t = tasks[i];
    const d = mk('m' + i, t.src);
    const { code, j } = await run(d, t.cls !== 'unmutated');
    const parsed = !!j && Array.isArray(j.failed);
    const outcome = code === 1 && parsed && j.failed.length > 0 ? 'killed' : code === 0 && parsed && j.allOk === true ? 'survived' : 'crashed';
    results[i] = { cls: t.cls, mutant: t.id, batteryExit: code, outcome, killed: t.cls === 'unmutated' ? null : outcome === 'killed', failedCases: parsed ? j.failed : null };
    fs.rmSync(d, { recursive: true, force: true });
  }
}));
const base = results[0];
const muts = results.slice(1);
const of = (c) => muts.filter((m) => m.cls === c);
const summary = {
  schema: 'tabi-r75-kill-power', real, unmutatedExit: base.batteryExit, unmutatedOutcome: base.outcome,
  forceTrue: { mutants: of('force-true').length, killed: of('force-true').filter((m) => m.killed).length },
  semantic: { mutants: of('semantic').length, killed: of('semantic').filter((m) => m.killed).length },
  mutants: muts.length, killed: muts.filter((m) => m.killed).length,
  crashed: muts.filter((m) => m.outcome === 'crashed').map((m) => m.mutant),
  survivors: muts.filter((m) => m.outcome === 'survived').map((m) => m.mutant),
  holds: base.batteryExit === 0 && base.outcome === 'survived' && muts.every((m) => m.killed), results,
};
fs.writeFileSync(outFile, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ unmutatedExit: summary.unmutatedExit, forceTrue: summary.forceTrue, semantic: summary.semantic, survivors: summary.survivors, crashed: summary.crashed, holds: summary.holds }));
process.exit(summary.holds ? 0 : 1);
