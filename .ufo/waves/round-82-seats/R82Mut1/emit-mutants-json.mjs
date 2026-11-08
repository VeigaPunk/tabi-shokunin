// Emit the seat artifact in the round-81 seat convention: .ufo/waves/round-82-seats/R82Mut1/mutants.json
import fs from 'node:fs';
import crypto from 'node:crypto';
const SEAT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-82-seats/R82Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const j = JSON.parse(fs.readFileSync(SEAT + '/r82mut1-result.json', 'utf8'));
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const RULE = {
  'accept-basename-dropped': 'the accept answer must name exactly the planned file',
  'accept-read-count-loosened': 'the accept leg fires exactly one read event',
  'accept-state-any': 'the accept leg stateAfter.k equals the delivered file tuple',
  'webkitdir-answer-basename-dropped': 'the directory answer must name exactly the planned directory',
  'webkitdir-answer-nodeid-dropped': 'the answer backendNodeId equals the chooser backendNodeId',
  'webkitdir-read-count-loosened': 'the directory leg fires exactly two read events',
  'click-count-loosened': 'exactly one click@s event in the click-while-open leg',
  'click-act-dropped': 'the click@s event carries act=true',
  'click-open-count-loosened': 'exactly two choosers in the click-while-open CDP log',
  'cdp-multi-open-loosened': 'no leg opens more than two choosers',
  'no-selection-keys-open': 'stateAfter carries exactly the seven frozen keys',
  'no-selection-fileevent-dropped': 'no non-answer leg fires input/change or a files-carrying event',
  'dismiss-cancel-dropped': 'a post-hoc cancel must not fire a page cancel',
  'gesture-message-dropped': 'the same-origin disabled showPicker message is the immutable-controls message',
  'marks-count-loosened': 'the marks array has at least three entries',
  'activation-nolaw-open': 'every leg has an activation law',
  'nonce-shape-bound-dropped': 'the nonce matches /^tabi-r82-[a-z0-9-]{4,48}$/',
  'walk-self-exemption-dropped': 'the receipt under test is excluded from the prior-set walk',
  'mode-single-only': 'chooser mode equals the page-measured input mode (selectMultiple included)',
  'cdp-open-mode-enum-any': 'chooser mode is selectSingle or selectMultiple',
  'order-sod-nochooser-dropped': 'the failed same-origin disabled leg opens no chooser',
  'replay-tolerance-narrowed': 'pair near-match tolerance is 0.05 ms',
  'event-files-any': 'event files is null or an array',
  'event-target-any': 'event target is null or a string',
  'event-act-any': 'event act is null or a boolean',
  'event-ts-any': 'event ts is a finite number',
  'replay-token-shape-any': 'launchToken matches /^[0-9a-f]{12}$/',
};
const EXTRA = {
  'mode-single-only': 'REAL GAP, not redundancy: no leg targets the multiple input (plan-frozen) and the scored receipt has only selectSingle choosers, so the selectMultiple branch of mode-law is exercised by nothing',
};
const witnessed = j.mutants.filter((m) => m.outcome === 'survived' && m.witness.status === 'kills').map((m) => ({
  id: m.name, rule: RULE[m.name] || m.family, family: m.family,
  from: m.from, to: m.to,
  witness: { pristineIds: m.witness.pristineIds, pristineExit: m.witness.pristineExit, mutantExit: m.witness.mutantExit, receiptSha256: m.witness.receiptSha256 },
  batteryCaseToAdd: { expect: m.witness.pristineIds[0], mutateFrom: m.from, mutateTo: m.to },
}));
const noWit = j.mutants.filter((m) => m.outcome === 'survived' && m.witness.status === 'none').map((m) => ({
  id: m.name, rule: RULE[m.name] || m.family, family: m.family,
  from: m.from, to: m.to,
  reason: [m.witness.why, EXTRA[m.name]].filter(Boolean).join(' | '),
}));
const out = {
  schema: 'tabi-r82-r82mut1-mutants',
  seat: 'R82Mut1', round: 82, wave: 'w1',
  lane: LANE,
  base: 'b401027f',
  digestsCommit: '5204a0581de5ef1a9eae08d156646dcb3e6ed25f',
  instruments: {
    counter: { path: 'scripts/check-showpicker-r82.mjs', freezeSha256: 'd0d26fe59b6f5067b6a8021d6e7e039466e6ded46bb4cd4f5eda6f07b444d62e', worktreeSha256AtEnd: sha(LANE + '/scripts/check-showpicker-r82.mjs') },
    battery: { path: 'scripts/negatives-showpicker-r82.mjs', frozenSha256: 'e2d554e6ffd4e3b35d7b00f9301e3d1d0c59f28876a3f830aa229b455a0f32ff', worktreeSha256AtEnd: sha(LANE + '/scripts/negatives-showpicker-r82.mjs') },
    killPower: { path: 'scripts/kill-power-r82.mjs', freezeSha256: 'f0d2b8667817fc7b676277499010b5156a801b203629cfb3abe1ac296a1b4db1', reused: false },
    receipt: { path: 'corpus/evidence/round82/chromium-showpicker/receipt.json', sha256AtEnd: sha(LANE + '/corpus/evidence/round82/chromium-showpicker/receipt.json') },
  },
  harness: {
    mutants: '.ufo/waves/round-82-seats/R82Mut1/mutants.mjs',
    witnesses: '.ufo/waves/round-82-seats/R82Mut1/witnesses.mjs',
    runner: '.ufo/waves/round-82-seats/R82Mut1/mutate-r82.mjs',
    witnessRunner: '.ufo/waves/round-82-seats/R82Mut1/witness-harness.mjs',
    baseline: j.baseline,
    pins: j.baseline.pins,
    scratch: '/fast/scratch/hyaku/tabi-r82/R82Mut1/mut-<name>/ (copies of counter+battery; deleted after each run)',
    independence: 'no from->to pair and no name is shared with scripts/kill-power-r82.mjs; four mutants share a from anchor with different replacements',
  },
  totals: {
    mutants: j.totals.mutants, killed: j.totals.killed, survived: j.totals.survived,
    crashed: j.totals.crashed, unapplied: j.totals.unapplied,
    survivorsWithWitness: j.totals.survivorsWithKillingWitness,
    routedDefects: noWit.length,
  },
  killed: j.killed,
  collateralWitness: j.collateralWitness,
  witnessedSurvivors: witnessed,
  routedDefects: noWit,
  mutants: j.mutants,
  restoration: {
    scratchDeleted: true,
    note: 'every mutant ran on copies; the lane instruments re-hash to the frozen pins and the receipt is unchanged; nothing was written under the walked trees except this seat\'s prose report',
  },
};
fs.writeFileSync(SEAT + '/mutants.json', JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ totals: out.totals, killed: out.killed.length, witnessed: witnessed.length, routedDefects: noWit.length }, null, 1));
