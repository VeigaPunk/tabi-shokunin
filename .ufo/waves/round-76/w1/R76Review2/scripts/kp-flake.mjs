#!/usr/bin/env node
// Kill-power control, tabi round 76 C1 (check-dialog-r76; structure of the round-75 control).
// Two mutant classes, each a copy of scripts/check-dialog-r76.mjs with the battery copy
// scripts/negatives-dialog-r76.mjs AND the pinned driver beside it, run against one real receipt:
//  (1) FORCE-TRUE: for every check id the counter declares (--list-checks), that one check
//      always holds (its `ok` forced true at the check() hook).
//  (2) SEMANTIC (source-location-specific): a named operator/polarity/tolerance edit at one exact
//      source string of the counter. Each edit string must occur EXACTLY once in the counter
//      bytes, else the control refuses (exit 2). The set includes BOTH directions of every carried
//      tolerance and threshold (round-75 routed defect: r74 F4/F5 weakenings survived).
// New in r76 (round-75 routed defects, R75Review2 §3-§5):
//  - ATTRIBUTION. A mutant is `killed` only when its battery exits 1 with a parsable summary whose
//    `failed` names at least one CASE (a named refusal/must-accept/laundered case). A mutant whose
//    battery fails only on `(positive)` is `killed-positive` ONLY IF the summary's positive run
//    exited 1 with at least one finding id (recorded): a counter that refuses the honest receipt
//    for a stated reason. A positive run that exits anything else (a crash, a usage exit, no
//    output) makes the mutant `crashed`. Any other battery outcome is `crashed`; `survived` = exit
//    0 with allOk. Every kill records its failed cases / positive finding ids.
//  - FLAKE GUARD. The unmutated battery runs twice in full (first and last); both must be allOk, so
//    a case that fails nondeterministically cannot kill an inert mutant unnoticed.
//  - MINIMUM-MUTANT GUARD. holds requires force-true mutants == the counter's declared check count
//    (>= 100) and semantic mutants >= 40.
// holds = both unmutated runs allOk, every mutant killed or killed-positive, none crashed or survived,
// and the minimum-mutant guard.
// Usage: node kill-power-r76.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <nonce> --prior-set <file> [--prior <receipt.json> ...] --laundered <deg.json> (x3)
//          --work <ABS scratch> --out <summary.json> [--jobs 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const lane = opt('lane'), real = opt('real'), pin = opt('expect-driver-sha256'), work = opt('work'), outFile = opt('out'), priorSet = opt('prior-set');
const jobs = Number(opt('jobs') || 4);
const expectNonce = opt('expect-nonce');
const priors = multi('prior');
const laundered = multi('laundered');
if (!lane || !real || !pin || !expectNonce || !priorSet || laundered.length !== 3 || !work || !outFile || !path.isAbsolute(work) || !path.isAbsolute(lane)) { console.error('usage: absolute --lane/--work, --real, --expect-driver-sha256, --expect-nonce, --prior-set, 3 --laundered, --out'); process.exit(2); }
const COUNTER = 'check-dialog-r76.mjs', BATTERY = 'negatives-dialog-r76.mjs', DRIVER = 'chrome-cdp-dialog-round76.mjs';
const driverBytes = fs.readFileSync(path.join(lane, 'scripts', DRIVER));
const counterSrc = fs.readFileSync(path.join(lane, 'scripts', COUNTER), 'utf8');
const batterySrc = fs.readFileSync(path.join(lane, 'scripts', BATTERY), 'utf8');
const ids = JSON.parse(spawnSync(process.execPath, [path.join(lane, 'scripts', COUNTER), '--list-checks'], { encoding: 'utf8' }).stdout);
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
const SEMANTIC = [{"id":"M-inert-tol-0.05000000001","from":"TOL = 0.05,","to":"TOL = 0.05000000001,"},{"id":"M-timeline-tol-0.06","from":"TOL = 0.05,","to":"TOL = 0.06,"}];
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
  const p = spawn(process.execPath, [path.join(d, BATTERY), '--lane', lane, '--real', real, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce, '--prior-set', priorSet, ...priors.flatMap((x) => ['--prior', x]),
    ...laundered.flatMap((x) => ['--laundered', x]), '--work', path.join(d, 'w'), '--json', ...(first ? ['--first-failure'] : [])], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  // 'close', not 'exit': the summary is read only after stdout has drained.
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j }); });
});
const classify = (code, j) => {
  const parsed = !!j && Array.isArray(j.failed) && j.positive && typeof j.positive === 'object';
  if (!parsed) return { outcome: 'crashed', why: 'battery exit ' + code + ', summary unparsable' };
  if (code === 0 && j.allOk === true) return { outcome: 'survived' };
  if (code !== 1) return { outcome: 'crashed', why: 'battery exit ' + code };
  const named = j.failed.filter((f) => f !== '(positive)' && f !== '(coverage-gap)');
  if (named.length > 0) return { outcome: 'killed', failedCases: named };
  if (j.failed.includes('(positive)')) {
    const p = j.positive;
    if (p.exit === 1 && Array.isArray(p.findingIds) && p.findingIds.length > 0) return { outcome: 'killed-positive', positiveFindings: p.findingIds };
    return { outcome: 'crashed', why: 'positive run exit ' + p.exit + ' findings ' + JSON.stringify(p.findingIds) };
  }
  return { outcome: 'crashed', why: 'battery exit 1 with no named failure: ' + JSON.stringify(j.failed) };
};
const tasks = [
  { cls: 'unmutated', id: '(unmutated-first)', src: counterSrc },
  ...ids.slice(0, 2).map((id) => ({ cls: 'force-true', id, src: counterSrc.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(id)}) ok = true; checks[id] = !!ok;`) })),
  ...SEMANTIC.map((m) => ({ cls: 'semantic', id: m.id, src: counterSrc.replace(m.from, m.to) })),
];
const results = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => {
  while (next < tasks.length) {
    const i = next++; const t = tasks[i];
    const d = mk('m' + i, t.src);
    const { code, j } = await run(d, t.cls !== 'unmutated');
    const c = classify(code, j);
    results[i] = { cls: t.cls, mutant: t.id, batteryExit: code, ...c, killed: t.cls === 'unmutated' ? null : (c.outcome === 'killed' || c.outcome === 'killed-positive') };
    fs.rmSync(d, { recursive: true, force: true });
  }
}));
// flake guard: the unmutated battery again, in full, after every mutant
const dLast = mk('m-last', counterSrc);
const last = await run(dLast, false);
fs.rmSync(dLast, { recursive: true, force: true });
const lastC = classify(last.code, last.j);
const base = results[0];
const muts = results.slice(1);
const of = (c) => muts.filter((m) => m.cls === c);
const guard = { declaredChecks: ids.length, forceTrueMutants: of('force-true').length, semanticMutants: of('semantic').length,
  ok: of('force-true').length === ids.length && ids.length >= 100 && of('semantic').length >= 40 };
const summary = {
  schema: 'tabi-r76-kill-power', real, unmutatedExit: base.batteryExit, unmutatedOutcome: base.outcome, unmutatedLastExit: last.code, unmutatedLastOutcome: lastC.outcome,
  forceTrue: { mutants: of('force-true').length, killed: of('force-true').filter((m) => m.killed).length, killedPositive: of('force-true').filter((m) => m.outcome === 'killed-positive').length },
  semantic: { mutants: of('semantic').length, killed: of('semantic').filter((m) => m.killed).length, killedPositive: of('semantic').filter((m) => m.outcome === 'killed-positive').length },
  mutants: muts.length, killed: muts.filter((m) => m.killed).length, minimumMutantGuard: guard,
  crashed: muts.filter((m) => m.outcome === 'crashed').map((m) => m.mutant),
  survivors: muts.filter((m) => m.outcome === 'survived').map((m) => m.mutant),
  holds: base.outcome === 'survived' && base.batteryExit === 0 && lastC.outcome === 'survived' && last.code === 0 && muts.every((m) => m.killed) && guard.ok, results,
};
fs.writeFileSync(outFile, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ unmutatedExit: summary.unmutatedExit, unmutatedLastExit: summary.unmutatedLastExit, forceTrue: summary.forceTrue, semantic: summary.semantic, guard, survivors: summary.survivors, crashed: summary.crashed, holds: summary.holds }));
process.exit(summary.holds ? 0 : 1);
