#!/usr/bin/env node
// Pre-freeze kill-power control, tabi round 74 C1 (check-imecompose-r74; structure of the round-73
// kill-power control). Two mutant classes, each a copy of scripts/check-imecompose-r74.mjs with the
// battery copy scripts/negatives-imecompose-r74.mjs AND the pinned driver beside it (the counter's
// fixture-hash check reads the driver beside itself), run against one real receipt:
//  (1) FORCE-TRUE: for every check id the counter declares (--list-checks), that one check
//      always holds (its `ok` forced true at the check() hook).
//  (2) SEMANTIC (source-location-specific; tabi r62 closure M5 / r63 prerequisite): a named
//      operator/polarity/tolerance edit at one exact source string of the counter. Each edit
//      string must occur EXACTLY once in the counter bytes, else the control refuses (exit 2),
//      so a mutant can never silently become the unmutated counter. M5 is the producer-verdict
//      AND -> OR polarity flip that survived 16/16 in round 62.
// Killed = battery exit 1. holds = unmutated battery exit 0 AND every mutant of both classes killed.
// Usage: node kill-power-r74.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <nonce> --prior <receipt.json> [--prior ...] --work <ABS scratch> --out <summary.json> [--jobs 4]
// r74: semantic mutants for the IME laws (data chain, isComposing by inputType, trust polarity,
// selected text, keyboard, focus legs), the near-match timeline and the 0.1 ms quantum.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'), real = opt('real'), pin = opt('expect-driver-sha256'), work = opt('work'), outFile = opt('out');
const jobs = Number(opt('jobs') || 4);
const expectNonce = opt('expect-nonce');
const priors = argv.flatMap((a, i) => (a === '--prior' && argv[i + 1] ? [argv[i + 1]] : []));
if (!lane || !real || !pin || !expectNonce || priors.length === 0 || !work || !outFile || !path.isAbsolute(work) || !path.isAbsolute(lane)) { console.error('usage: absolute --lane/--work, --real, --expect-driver-sha256, --expect-nonce, >= 1 --prior, --out'); process.exit(2); }
const COUNTER = 'check-imecompose-r74.mjs', BATTERY = 'negatives-imecompose-r74.mjs', DRIVER = 'chrome-cdp-imecompose-round74.mjs';
const driverBytes = fs.readFileSync(path.join(lane, 'scripts', DRIVER));
const counterSrc = fs.readFileSync(path.join(lane, 'scripts', COUNTER), 'utf8');
const batterySrc = fs.readFileSync(path.join(lane, 'scripts', BATTERY), 'utf8');
const ids = JSON.parse(spawnSync(process.execPath, [path.join(lane, 'scripts', COUNTER), '--list-checks'], { encoding: 'utf8' }).stdout);
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
const SEMANTIC = [
  { id: 'M5-producer-verdict-and-to-or', from: "r.predicate === true && r.imeComposeHypothesis === 'CONFIRMED'", to: "r.predicate === true || r.imeComposeHypothesis === 'CONFIRMED'" },
  { id: 'M-driver-pin-any', from: 'r.driverSha256 === pin', to: "typeof r.driverSha256 === 'string'" },
  { id: 'M-nonce-on-page-dropped', from: "typeof r.nonce === 'string' && r.nonceOnPage === r.nonce", to: "typeof r.nonce === 'string'" },
  { id: 'M-nonce-expected-dropped', from: 'r.nonce === expectNonce', to: "typeof r.nonce === 'string'" },
  { id: 'M-degenerate-loose-null', from: 'r.degenerate === null', to: 'r.degenerate == null' },
  { id: 'M-fixture-hash-dropped', from: 'isObj(r.fixture) && r.fixture.sha256 === fixtureWant', to: 'isObj(r.fixture)' },
  { id: 'M-replay-token-every-to-some', from: 'priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok)', to: 'priors.some((p) => !isObj(p.host) || p.host.launchToken !== tok)' },
  { id: 'M-replay-token-shape-dropped', from: "/^[0-9a-f]{12}$/.test(tok) && ", to: '' },
  { id: 'M-replay-url-dropped', from: 'priors.every((p) => browserId(p.host) !== bid)', to: 'true' },
  { id: 'M-timeline-tolerance-wide', from: 'Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05', to: 'Math.abs(e.ts - y[i].ts) < 0.2 && Math.abs(e.at - y[i].at) < 0.2' },
  { id: 'M-timeline-tolerance-exact', from: 'Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05', to: 'Math.abs(e.ts - y[i].ts) < 1e-9 && Math.abs(e.at - y[i].at) < 1e-9' },
  { id: 'M-quantum-tolerance-wide', from: 'Math.round(v * 10)) <= 1e-4', to: 'Math.round(v * 10)) <= 1' },
  { id: 'M-run-window-floor', from: 't1 - t0 >= 4000', to: 't1 - t0 >= 0' },
  { id: 'M-late-after-close-loose', from: 'r.lateAfterClose === 0', to: 'r.lateAfterClose >= 0' },
  { id: 'M-leg-window-upper-dropped', from: 'return e.at >= w[0] && e.at <= w[1] &&', to: 'return e.at >= w[0] &&' },
  { id: 'M-chain-end-data-dropped', from: 'if (!open || e.data !== lastUpdate) chainOk = false;', to: 'if (!open) chainOk = false;' },
  { id: 'M-chain-sessions-any', from: 'sessions === 3', to: 'sessions >= 0' },
  { id: 'M-composing-insertText-dropped', from: "e.inputType === 'insertText' ? e.isComposing === false : false", to: "e.inputType === 'insertText' ? true : false" },
  { id: 'M-trust-end-polarity', from: 'e.type === CE ? e.isTrusted === false : e.isTrusted === true', to: 'e.type === CE ? true : e.isTrusted === true' },
  { id: 'M-selected-text-nonempty-dropped', from: " && starts.some((e) => e.data !== '')", to: '' },
  { id: 'M-no-keyboard-dropped', from: "!/^key/.test(e.type)", to: 'true' },
  { id: 'M-focusout-legs-dropped', from: ".map((e) => e.leg).join(',') === 'focus-ce,blur'", to: ".length >= 0" },
  { id: 'M-ime-count-at-least', from: 'imeCalls.length === planned.length', to: 'imeCalls.length >= planned.length' },
  { id: 'M-allowlist-eval-any', from: ' && EXPRS.has(c.params.expression)', to: '' },
  { id: 'M-navigate-once-dropped', from: "once('Page.navigate') && ", to: '' },
  { id: 'M-teardown-sweep-dropped', from: 'td.postKillSweepCount === 0 && ', to: '' },
];
if (!counterSrc.includes(HOOK)) { console.error('hook line not found'); process.exit(2); }
for (const m of SEMANTIC) {
  const n = counterSrc.split(m.from).length - 1;
  if (n !== 1) { console.error(`semantic mutant ${m.id}: edit string occurs ${n} times (must be 1)`); process.exit(2); }
}
const mk = (name, src) => {
  const d = path.join(work, name); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, 'w'), { recursive: true });
  fs.writeFileSync(path.join(d, COUNTER), src);
  fs.writeFileSync(path.join(d, BATTERY), batterySrc);
  fs.writeFileSync(path.join(d, DRIVER), driverBytes);
  return d;
};
const run = (d) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(d, BATTERY), '--real', real, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce, ...priors.flatMap((x) => ['--prior', x]), '--work', path.join(d, 'w'), '--json'], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  p.on('exit', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, failed: j ? j.failed : null }); });
});
const tasks = [
  { cls: 'unmutated', id: '(unmutated)', src: counterSrc },
  ...ids.map((id) => ({ cls: 'force-true', id, src: counterSrc.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(id)}) ok = true; checks[id] = !!ok;`) })),
  ...SEMANTIC.map((m) => ({ cls: 'semantic', id: m.id, src: counterSrc.replace(m.from, m.to) })),
];
const results = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => {
  while (next < tasks.length) {
    const i = next++; const t = tasks[i];
    const d = mk('m' + i, t.src);
    const r = await run(d);
    results[i] = { cls: t.cls, mutant: t.id, batteryExit: r.code, killed: t.cls === 'unmutated' ? null : r.code === 1, failedCases: r.failed ? r.failed.map((f) => f.name ?? f.case ?? f) : null };
    fs.rmSync(d, { recursive: true, force: true });
  }
}));
const base = results[0];
const muts = results.slice(1);
const of = (c) => muts.filter((m) => m.cls === c);
const summary = {
  schema: 'tabi-r74-kill-power', real, unmutatedExit: base.batteryExit,
  forceTrue: { mutants: of('force-true').length, killed: of('force-true').filter((m) => m.killed).length },
  semantic: { mutants: of('semantic').length, killed: of('semantic').filter((m) => m.killed).length },
  mutants: muts.length, killed: muts.filter((m) => m.killed).length,
  survivors: muts.filter((m) => !m.killed).map((m) => m.mutant),
  holds: base.batteryExit === 0 && muts.every((m) => m.killed), results,
};
fs.writeFileSync(outFile, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ unmutatedExit: summary.unmutatedExit, forceTrue: summary.forceTrue, semantic: summary.semantic, survivors: summary.survivors, holds: summary.holds }));
process.exit(summary.holds ? 0 : 1);
