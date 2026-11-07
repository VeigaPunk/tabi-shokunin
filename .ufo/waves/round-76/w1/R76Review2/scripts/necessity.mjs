#!/usr/bin/env node
// R76Review2: (a) necessity of individual bracket cases — remove one case line from a battery
// copy, run the counter mutant that the measured kill-power says that case kills; if the mutant
// now survives, the case was the only thing killing it. (b) force-true attribution: for every
// declared id, did its force-true mutant die on a case whose expect == that id?
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const [S, L] = process.argv.slice(2);
const C1 = path.join(L, '.ufo/waves/round-76/controls/c1');
const REAL = path.join(L, 'corpus/evidence/round76/chromium-js-dialog/receipt.json');
const PIN = '152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51';
const baseBat = fs.readFileSync(path.join(S, 'base/negatives-dialog-r76.mjs'), 'utf8');
const baseCnt = fs.readFileSync(path.join(S, 'base/check-dialog-r76.mjs'), 'utf8');
const driver = fs.readFileSync(path.join(S, 'base/chrome-cdp-dialog-round76.mjs'));

const run = (d, work) => new Promise((resolve) => {
  fs.mkdirSync(work, { recursive: true });
  const p = spawn(process.execPath, [path.join(d, 'negatives-dialog-r76.mjs'), '--lane', L, '--real', REAL,
    '--expect-driver-sha256', PIN, '--expect-nonce', 'tabi-r76-l1-97bf5d560d03',
    '--prior-set', path.join(C1, 'prior-set.txt'),
    '--laundered', path.join(C1, 'degenerate-page-stub.receipt.json'),
    '--laundered', path.join(C1, 'degenerate-eval-trigger.receipt.json'),
    '--laundered', path.join(C1, 'degenerate-swap-accept.receipt.json'),
    '--work', work, '--json', '--first-failure'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j }); });
});

const dropLine = (src, prefix) => {
  const lines = src.split('\n');
  const hit = lines.filter((l) => l.trimStart().startsWith(prefix));
  if (hit.length !== 1) throw new Error('line prefix ' + prefix + ' matches ' + hit.length);
  return lines.filter((l) => !l.trimStart().startsWith(prefix)).join('\n');
};
const edit = (src, from, to) => { const n = src.split(from).length - 1; if (n !== 1) throw new Error('edit occurs ' + n + ': ' + from); return src.replace(from, to); };

const NEC = [
  ['replay-timeline-tol-in-0.049', "add('replay-timeline-tol-in-0.049'", 'TOL = 0.05,', 'TOL = 0.045,'],
  ['accept-grid-5e-6', "accept('accept-grid-5e-6'", 'Math.round(v * 10)) <= 1e-4', 'Math.round(v * 10)) <= 1e-5'],
  ['replay-timeline-gap-at-threshold', "add('replay-timeline-gap-at-threshold'", 'GAP_FRAC = 0.75', 'GAP_FRAC = 0.85'],
  ['accept-prior-abs-below-threshold', "accept('accept-prior-abs-below-threshold'", 'FRAC = 0.5,', 'FRAC = 0.45,'],
  ['accept-prior-tol-out-0.051', "accept('accept-prior-tol-out-0.051'", 'TOL = 0.05,', 'TOL = 0.06,'],
  ['replay-timeline-abs-at-threshold', "add('replay-timeline-abs-at-threshold'", 'FRAC = 0.5,', 'FRAC = 0.55,'],
  ['accept-prior-gap-below-threshold', "accept('accept-prior-gap-below-threshold'", 'GAP_FRAC = 0.75', 'GAP_FRAC = 0.6'],
  ['event-time-quantum-bracket-2e-5', "add('event-time-quantum-bracket-2e-5'", 'Math.round(v * 10)) <= 1e-4', 'Math.round(v * 10)) <= 0.02'],
];
const out = { necessity: [], forceTrue: null };
for (const [caseId, prefix, from, to] of NEC) {
  const d = path.join(S, 'mut', 'nec-' + caseId);
  fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true });
  const bat = dropLine(baseBat, prefix);
  fs.writeFileSync(path.join(d, 'negatives-dialog-r76.mjs'), bat);
  fs.writeFileSync(path.join(d, 'check-dialog-r76.mjs'), edit(baseCnt, from, to));
  fs.writeFileSync(path.join(d, 'chrome-cdp-dialog-round76.mjs'), driver);
  const r = await run(d, path.join(S, 'work', 'nec-' + caseId));
  out.necessity.push({ removedCase: caseId, mutant: from + '->' + to, exit: r.code, allOk: r.j ? r.j.allOk : null,
    stoppedEarly: r.j ? r.j.stoppedEarly : null, failed: r.j ? r.j.failed : null,
    verdict: !r.j ? 'unparsable' : (r.code === 0 && r.j.allOk ? 'MUTANT-SURVIVED-WITHOUT-CASE' : 'killed-by-another-case') });
  fs.rmSync(d, { recursive: true, force: true });
}

// force-true attribution against the measured kill-power run
const kp = JSON.parse(fs.readFileSync(path.join(C1, 'pf/pf-smoke1.killpower.json'), 'utf8'));
const bat = JSON.parse(fs.readFileSync(path.join(C1, 'pf/pf-smoke1.battery.json'), 'utf8'));
const expectOf = new Map(bat.results.map((r) => [r.case, r.expect]));
const ft = kp.results.filter((m) => m.cls === 'force-true');
const rows = ft.map((m) => {
  const cases = m.failedCases || [];
  const namedByOwnCase = cases.some((c) => expectOf.get(c) === m.mutant);
  return { id: m.mutant, outcome: m.outcome, cases, namedByOwnCase };
});
out.forceTrue = {
  mutants: rows.length,
  killed: rows.filter((r) => r.outcome === 'killed').length,
  killedByOwnCase: rows.filter((r) => r.namedByOwnCase).length,
  notOwnCase: rows.filter((r) => !r.namedByOwnCase),
};
console.log(JSON.stringify(out, null, 1));
