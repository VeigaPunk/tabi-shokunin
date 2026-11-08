// Merge killed notes, the collateral witness and integrity evidence into the result artifact.
import fs from 'node:fs';
import crypto from 'node:crypto';
const SEAT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-82-seats/R82Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const p = SEAT + '/r82mut1-result.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
const NOTES = {
  'cancel-any': 'caught by the cancel-law case (right reason)',
  'extras-result-any': 'caught by the cross-origin-color-law case (right reason)',
  'leg-order-order-insensitive': 'COLLATERAL: the case reverses the legs, which also breaks plan-frozen and leg-records; the mutant leg-order rule itself never fires. leg-order is redundant with plan-frozen, which compares the same names in order.',
  'legshape-state-dropped': 'COLLATERAL: leg-<name> loses the state vector, but the battery leg cases plant state edits that no-selection-law also refuses; on answer legs accept-answer-law k comparison is the only detector. No single-rule witness exists.',
  'mode-enum-any': 'caught by the mode-law case (right reason: the case requires mode-law to fire and it no longer does)',
  'receipt-fields-missing-ok': 'caught by the receipt-fields case (right reason)',
  'sendlog-methods-extra': 'caught by the send-log-allowlist case (right reason)',
  'seq-monotonic-loosened-desc': 'caught by the seq-monotonic case (right reason)',
  'trees-child-dropped': 'COLLATERAL: killed by prior-set-unmatched-exempt (the invocation exemption hash stops matching any walked file), not by a case that plants a stray receipt in corpus/evidence/round82. Witness: stray there -> pristine prior-set-complete, mutant clean.',
};
for (const k of j.killed) k.note = NOTES[k.name] || null;
j.collateralWitness = {
  name: 'trees-child-dropped',
  why: 'the mutant is killed by the battery, but for an unrelated reason; this witness shows the second walked tree itself is untested',
  lane: 'scratch mirror of the lane (controls/c1 copied, stray receipt at corpus/evidence/round82/stray-receipt.json)',
  pristine: { exit: 1, ids: ['prior-set-complete'] },
  mutant: { exit: 0, ids: [] },
  witnessKills: true,
};
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
j.integrity = {
  laneFilesUnchanged: true,
  note: 'no invocation wrote a lane file: every mutant ran on copies under /fast/scratch/hyaku/tabi-r82/R82Mut1/mut-<name>/ (deleted after each run); the lane instruments were re-hashed after the run',
  counterSha256After: sha(LANE + '/scripts/check-showpicker-r82.mjs'),
  batterySha256After: sha(LANE + '/scripts/negatives-showpicker-r82.mjs'),
  killPowerSha256: sha(LANE + '/scripts/kill-power-r82.mjs'),
  recordDriftSha256: sha(LANE + '/scripts/check-record-drift-r82.mjs'),
  selftestSha256: sha(LANE + '/scripts/selftest-r82-gates.mjs'),
  receiptSha256After: sha(LANE + '/corpus/evidence/round82/chromium-showpicker/receipt.json'),
};
j.witnessRuleCoverage = {};
for (const m of j.mutants.filter((x) => x.witness.status === 'kills')) {
  for (const id of m.witness.pristineIds) j.witnessRuleCoverage[id] = (j.witnessRuleCoverage[id] || 0) + 1;
}
fs.writeFileSync(p, JSON.stringify(j, null, 1) + '\n');
console.log(JSON.stringify(j.integrity, null, 1));
