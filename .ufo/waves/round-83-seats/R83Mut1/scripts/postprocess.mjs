#!/usr/bin/env node
// Assemble the R83Mut1 deliverable from the sweep + witness results, re-deriving every mutant's
// bytes from the CURRENT mutant list so the recorded from/to text is exactly what was executed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const S = '/fast/scratch/hyaku/tabi-r83/R83Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SEAT = path.join(LANE, '.ufo/waves/round-83-seats/R83Mut1');
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r83.mjs');
const BATTERY = path.join(LANE, 'scripts/negatives-showpicker-r83.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round83/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-83/controls/c1/prior-set.txt');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const src = fs.readFileSync(COUNTER, 'utf8');
const sweep = JSON.parse(fs.readFileSync(path.join(S, 'sweep-results.json'), 'utf8'));
const wit = JSON.parse(fs.readFileSync(path.join(S, 'witness-results.json'), 'utf8'));
const wit112 = JSON.parse(fs.readFileSync(path.join(S, 'witness-results-112.json'), 'utf8'));
const witThr = JSON.parse(fs.readFileSync(path.join(S, 'witness-results-threshold.json'), 'utf8'));
const grab = (f) => {
  const s = fs.readFileSync(f, 'utf8');
  const a = s.indexOf('const MUTANTS = [');
  const b = s.indexOf('\n];', a);
  return Function('return ' + s.slice(a + 'const MUTANTS = '.length, b + 2))();
};
const MUTANTS = grab(path.join(S, 'run-mutants.mjs'));
const current = new Map(MUTANTS.map(([name, from, to, note]) => [name, { from, to, note }]));

const witnessMap = new Map(wit.results.filter((r) => r.classification).map((r) => [r.name, { classification: r.classification, describe: r.mutate, pristineFindings: r.pristine && r.pristine.findings, mutantFindings: r.mutant && r.mutant.findings }]));
witnessMap.set(wit112.name, { classification: wit112.classification, describe: 'mirror-lane: .ufo/waves/round-83/corrupt.txt begins with { and names the schema but is not .json', pristineFindings: wit112.pristine.findings, mutantFindings: wit112.mutant.findings });
witnessMap.set('replay-frac-relaxed', { classification: witThr.mutants['replay-frac-relaxed'].status === 0 ? 'behavioral-escape' : 'unexpected', describe: 'forged prior with 30/61 page events shifted +100 ms (exactly 31 matches; absNeed pristine=31)', pristineFindings: witThr.pristine.findings, mutantFindings: witThr.mutants['replay-frac-relaxed'].findings, limitPristine: witThr.pristine.limit, limitMutant: witThr.mutants['replay-frac-relaxed'].limit });
witnessMap.set('replay-refusal-boundary-strict', { classification: witThr.mutants['replay-refusal-boundary-strict'].status === 0 ? 'behavioral-escape' : 'unexpected', describe: 'forged prior with 30/61 page events shifted +100 ms (absMatched=31 = absNeed; >= refuses, > accepts)', pristineFindings: witThr.pristine.findings, mutantFindings: witThr.mutants['replay-refusal-boundary-strict'].findings, limitPristine: witThr.pristine.limit, limitMutant: witThr.mutants['replay-refusal-boundary-strict'].limit });
witnessMap.set('replay-tolerance-tightened', { classification: 'vacuous', describe: 'event-time-quantum puts every accepted ts/at on a 0.1 ms grid, so on-grid pairs are either identical or >=0.1 ms apart; TOL=0.005 and TOL=0.05 behave identically on valid receipts (the 31-match threshold witness is still refused by both)', pristineFindings: witThr.pristine.findings, mutantFindings: witThr.mutants['replay-tolerance-tightened'].findings });

const VACUOUS = [
  { id: null, name: 'leg-marks-min-count-relaxed', why: 'marks[0]=="start", marks[1]=="pre" and marks[last]=="settle" already force at least three positions: a 2-element array would need one element to be both pre and settle, and a 1-element array fails index 1. The >=3 conjunct is redundant, so no valid receipt distinguishes >=3 from >=2. Excluded as vacuous, not counted as a survivor.' },
  { id: null, name: 'leg-marks-mark-object-unchecked', why: 'a JSON mark that is not an object cannot carry a string name: string/number/array marks yield undefined for .name (the retained typeof check fails) and null throws. No clean receipt distinguishes isObj(m) from the retained name-type check. Excluded as vacuous.' },
  { id: null, name: 'mode-law-descriptor-presence-unchecked', why: 'd=undefined requires r.fixtureInputs to lack a PLAN target id; fixture-descriptors compares r.fixtureInputs to FIXTURE_INPUTS exactly and plan-frozen pins the leg target, so no receipt can reach mode-law with a missing descriptor. Excluded as redundant/vacuous.' },
  { id: null, name: 'replay-tolerance-tightened', why: 'TOL only affects (ts,at) pair matching, and event-time-quantum forces all accepted times onto a 0.1 ms grid; an on-grid pair is either exactly equal or at least 0.1 ms apart, so TOL=0.005 and TOL=0.05 accept/refuse the same receipts. Witnessed: a 31-match boundary receipt is still refused by both. Excluded as a dead threshold knob.' },
];
const vacuousNames = new Set(VACUOUS.map((v) => v.name));

let bytesMismatch = [];
const results = sweep.results.map((r) => {
  const c = current.get(r.name);
  if (!c) return { ...r, stale: 'missing-from-current-list' };
  const applied = src.split(c.from).length - 1;
  const sha = sha256(src.replace(c.from, c.to));
  if (sha !== r.mutatedSha256) bytesMismatch.push({ id: r.id, name: r.name, recorded: r.mutatedSha256, rederived: sha, occurrences: applied });
  const w = witnessMap.get(r.name);
  const vacuous = vacuousNames.has(r.name);
  const outcome = vacuous ? 'excluded-vacuous' : r.outcome;
  return {
    id: r.id, name: r.name, outcome,
    mutation: { from: c.from, to: c.to },
    fromOccurrences: applied,
    mutatedSha256: sha,
    recordedMutatedSha256: r.mutatedSha256,
    bytesRederivedMatch: sha === r.mutatedSha256,
    batteryExit: r.batteryExit,
    battery: r.battery,
    classification: vacuous ? 'vacuous' : outcome === 'survived' ? (w ? w.classification : 'unclassified') : outcome === 'killed' ? 'killed-by-battery' : outcome,
    witness: w || undefined,
    survivorReason: outcome === 'survived' ? c.note : undefined,
    stderr: r.stderr,
  };
});
const vacuousResults = results.filter((r) => r.outcome === 'excluded-vacuous');
const counted = results.filter((r) => r.outcome !== 'excluded-vacuous');
const survived = counted.filter((r) => r.outcome === 'survived');
const killed = counted.filter((r) => r.outcome === 'killed');
const crashed = counted.filter((r) => r.outcome === 'crashed' || r.outcome === 'killed-unexpected-exit');
const laneHash = (p) => sha256(fs.readFileSync(p));
const payload = {
  schema: 'tabi-r83-r83mut1-mutants',
  seat: 'R83Mut1',
  lane: LANE,
  base: '4cdf4def31b1feecb6aed5dbfc048c47d41ec88d',
  digestsCommit: '9d90392aca79209c6f3b83a2c34797ebd588d27ac36ba48151778e3051494847',
  milestone: 'independent conjunct-level mutants of the frozen r83 counter beyond the frozen 50',
  reuse: { frozenSet: 'scripts/kill-power-r83.mjs', frozenMutants: 50, reusedMutants: 0, exactFromStringCollisions: 0, nameCollisions: 0 },
  method: 'Each mutant replaces one unique source substring of the frozen counter with a weaker rule. The frozen battery (negatives-showpicker-r83.mjs) is copied beside the mutant counter in /fast/scratch/hyaku/tabi-r83/R83Mut1/mut-<id>/ and run with --lane <frozen lane> --real <scored receipt> --expect-driver-sha256 <receipt driver pin> --expect-nonce <receipt nonce> --expect-fixture-sha256 <receipt fixture pin> --prior-set <frozen prior set> --work <mutant work> --json. Lane files were never edited; the pre/post hashes below are identical. Survivors were then witnesses: a receipt mutated in the weakened dimension is run through the pristine counter and the mutant counter; pristine finding + mutant clean = behavioral escape, pristine finding + mutant finding = redundant conjunct (a sibling check still rejects the receipt).',
  invocation: {
    lane: LANE,
    real: 'corpus/evidence/round83/chromium-showpicker/receipt.json',
    receiptNonce: JSON.parse(fs.readFileSync(REAL, 'utf8')).nonce,
    driverSha256: JSON.parse(fs.readFileSync(REAL, 'utf8')).driverSha256,
    fixtureSha256: JSON.parse(fs.readFileSync(REAL, 'utf8')).fixture.sha256,
    priorSet: '.ufo/waves/round-83/controls/c1/prior-set.txt',
    note: 'the receipt nonce on disk is the scored run nonce; the lane selftest derives all three expected values from the same receipt, and the frozen baseline is green under them. The assignment header nonce (tabi-r83-l1-9d90392aca79) is not the receipt nonce and would make the pristine baseline fail nonce-expected, which is inconclusive rather than a kill; claims.json also carries a third (older) nonce.',
  },
  baseline: {
    exit: 0, cases: 153, failed: 0, coverage: { declared: 74, covered: 74, uncovered: [], unknown: [] },
    counterPin: '7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841',
    batteryPin: '12c09cc15a4602c77faf7624d4556eb964545cf3a6277990c8a49ae89bd4a817',
    driverPin: '70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce',
    receiptSha256: '3f9bbb60651d6f10a589561cd9638c4b5107517d770abf815c0991dd95a2bc9c',
    priorSha256: 'dfeba0d3deabde3015d26dd717868ce84ef2506fe3a63799a2233fdcb6b90b75',
  },
  laneHashesBefore: sweep.laneHashesBefore,
  laneHashesAfter: { counter: laneHash(COUNTER), battery: laneHash(BATTERY), receipt: laneHash(REAL), prior: laneHash(PRIOR_SET) },
  laneUnchanged: JSON.stringify(sweep.laneHashesBefore) === JSON.stringify({ counter: laneHash(COUNTER), battery: laneHash(BATTERY), receipt: laneHash(REAL), prior: laneHash(PRIOR_SET) }),
  binaries: { node: process.version },
  counts: {
    mutantsListed: MUTANTS.length,
    executedAndCounted: counted.length,
    survived: survived.length,
    killed: killed.length,
    crashed: crashed.length,
    excludedVacuous: vacuousResults.length,
    behavioralEscapes: survived.filter((r) => r.classification === 'behavioral-escape').length,
    redundantConjuncts: survived.filter((r) => r.classification === 'redundant-conjunct').length,
    unclassifiedSurvivors: survived.filter((r) => r.classification === 'unclassified').length,
    bytesRederived: results.filter((r) => r.bytesRederivedMatch).length,
  },
  vacuousExcluded: vacuousResults.map((r) => ({ id: r.id, name: r.name, mutation: r.mutation, why: (VACUOUS.find((v) => v.name === r.name) || {}).why })),
  keyWitnesses: {
    killed: killed.map((r) => ({ id: r.id, name: r.name, firstBatteryFailures: r.battery && r.battery.firstFailures })),
    replayBoundary31: {
      receipt: 'witness-receipts/replay-boundary-31.json (built from controls/c1/probes/prior1.json with identity rewritten and tokens freshened; four whole legs, 30/61 events, shifted +100 ms with their marks)',
      pristine: witThr.pristine,
      fracRelaxed: witThr.mutants['replay-frac-relaxed'],
      boundaryStrict: witThr.mutants['replay-refusal-boundary-strict'],
      toleranceTightened: witThr.mutants['replay-tolerance-tightened'],
    },
    unparsableMirror: wit112,
  },
  survivors: survived.map((r) => ({
    id: r.id, name: r.name, classification: r.classification,
    mutation: r.mutation, mutatedSha256: r.mutatedSha256,
    reason: r.survivorReason,
    witness: r.witness,
    battery: r.battery,
  })),
  results: results.map(({ survivorReason, ...r }) => r),
  bytesMismatch,
};
fs.mkdirSync(SEAT, { recursive: true });
fs.writeFileSync(path.join(SEAT, 'mutants.json'), JSON.stringify(payload, null, 1) + '\n');
console.log(JSON.stringify({ written: path.join(SEAT, 'mutants.json'), counts: payload.counts, bytesMismatch, survivorsByClass: Object.fromEntries(['behavioral-escape', 'redundant-conjunct', 'unclassified'].map((c) => [c, survived.filter((r) => r.classification === c).map((r) => r.name)])), vacuous: payload.vacuousExcluded.map((v) => v.name) }, null, 1));
