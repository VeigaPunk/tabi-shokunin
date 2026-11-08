#!/usr/bin/env node
// Generate the R83Mut1 seat report from mutants.json (single source of truth for counts/text).
import fs from 'node:fs';

const SEAT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-83-seats/R83Mut1';
const OUT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-83/w1/R83Mut1.md';
const m = JSON.parse(fs.readFileSync(SEAT + '/mutants.json', 'utf8'));
const byClass = (c) => m.survivors.filter((s) => s.classification === c);
const be = byClass('behavioral-escape');
const rd = byClass('redundant-conjunct');
const vac = m.vacuousExcluded;
const killed = m.keyWitnesses.killed;
const thr = m.keyWitnesses.replayBoundary31;
const mir = m.keyWitnesses.unparsableMirror;

const bullet = (s) => {
  const witness = s.witness || {};
  const p = witness.pristineFindings ? JSON.stringify(witness.pristineFindings) : 'n/a';
  const mu = witness.mutantFindings ? JSON.stringify(witness.mutantFindings) : 'n/a';
  return [
    '### ' + s.id + ' `' + s.name + '` — ' + s.classification,
    '',
    'Weakened form (the exact from/to pair is in `mutants.json` §survivors[].mutation):',
    '',
    '```js',
    s.mutation.to,
    '```',
    '',
    'Witness: pristine findings ' + p + '; mutant findings ' + mu + '.',
    '',
    'Why the battery misses it: ' + s.reason,
    '',
  ].join('\n');
};

const groups = [
  ['Marks, contexts, send-log shape and plan-call ids', ['leg-marks', 'ctx-', 'sendlog-', 'plan-calls-', 'plan-frozen-']],
  ['CDP event log and frame binding', ['cdp-', 'frame-binding-']],
  ['Page-event and per-leg shape conjuncts', ['event-', 'leg-shape-', 'leg-records-']],
  ['Law checks: cross-origin, order, gesture, activation, mode', ['cross-', 'order-', 'extras-', 'gesture-', 'activation-', 'mode-']],
  ['Answer-leg fields (webkitdirectory / accept / multiple / MIME / second chooser)', ['webkit', 'accept-', 'multiple-', 'second-chooser-']],
  ['No-selection, dismiss, trust', ['noselection-', 'dismiss-', 'trust-']],
  ['Host, teardown, fixture, server, argv, ports', ['argv-', 'devtools-', 'teardown-', 'fixture-', 'server-', 'child-server-', 'ports-', 'runwindow-', 'unparsable-']],
  ['Replay thresholds', ['replay-']],
];
const assigned = new Set();
const grouped = [];
for (const [title, prefixes] of groups) {
  const items = be.filter((s) => !assigned.has(s.name) && prefixes.some((p) => s.name.startsWith(p) || s.name.includes('/' + p)));
  for (const s of items) assigned.add(s.name);
  if (items.length) grouped.push([title, items]);
}
const rest = be.filter((s) => !assigned.has(s.name));

const redundantBullet = (s) => {
  const w = s.witness || {};
  return '- `' + s.id + ' ' + s.name + '` — mutated ' + (w.pristineFindings ? 'pristine ' + JSON.stringify(w.pristineFindings) + ', mutant ' + JSON.stringify(w.mutantFindings) : 'n/a') + '. The corruption is still refused by the sibling check(s). ' + s.reason;
};

const lines = [];
lines.push('# R83Mut1 — independent conjunct-level mutants of the r83 showpicker counter');
lines.push('');
lines.push('Seat: **R83Mut1** (leaf, coverage axis). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.');
lines.push('Base per assignment: `4cdf4def31b1feecb6aed5dbfc048c47d41ec88d`; digests commit D per assignment:');
lines.push('`9d90392aca79209c6f3b83a2c34797ebd588d27ac36ba48151778e3051494847`.');
lines.push('');
lines.push('## 0. Lane-state caveat (observed, not an amendment)');
lines.push('');
lines.push('The assignment header, `claims.json` and the scored receipt disagree on identity:');
lines.push('');
lines.push('| Source | base | digests | nonce |');
lines.push('|---|---|---|---|');
lines.push('| assignment header | `4cdf4def…` | `9d90392a…` | `tabi-r83-l1-9d90392aca79` |');
lines.push('| in-tree `claims.json` | `518f6b84…` | `b6496e6f…` | `tabi-r83-l1-b6496e6f5d4f` |');
lines.push('| scored receipt `corpus/evidence/round83/chromium-showpicker/receipt.json` | — | — | `tabi-r83-l1-c016710129da` |');
lines.push('');
lines.push('The counter and battery bytes match `freeze.txt` exactly (counter `7b9f9ec4…`, battery `12c09cc1…`),');
lines.push('and `scripts/selftest-r83-gates.mjs` derives `expect.driver`, `expect.fixture` and `expect.nonce` **from the');
lines.push('receipt itself**. The sweep therefore used the receipt’s own nonce (`tabi-r83-l1-c016710129da`). Using the');
lines.push('assignment nonce would make the pristine baseline fail `nonce-expected` inside every battery case, which is an');
lines.push('inconclusive baseline, not a kill. `claims.json` also says “clean 72 checks” while the frozen counter reports 74;');
lines.push('the frozen battery and selftest both report 74. This is recorded as a lane-state observation only; the predicate,');
lines.push('pins, priors, thresholds and kill rule were not touched — they were attacked.');
lines.push('');
lines.push('## 1. Baseline and method');
lines.push('');
lines.push('- Pristine frozen counter on the scored receipt: **clean, 74/74 checks**.');
lines.push('- Pristine frozen battery: **153 cases, 0 failed, coverage 74/74**, exit 0 (11.5 s standalone).');
lines.push('- Pins: counter `7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841`,');
lines.push('  battery `12c09cc15a4602c77faf7624d4556eb964545cf3a6277990c8a49ae89bd4a817`,');
lines.push('  driver `70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce`,');
lines.push('  receipt `3f9bbb60…` (61 page events), prior `dfeba0d3…` (61 page events).');
lines.push('- **115** semantic edits were written; each replaces one substring that occurs exactly once in the frozen');
lines.push('  counter. **0** exact `from`-string collisions and **0** name collisions with the frozen 50:');
lines.push('  `scripts/kill-power-r83.mjs` was not reused.');
lines.push('- Every mutant was run against the frozen battery from its own scratch dir (`mut-<id>/` containing the');
lines.push('  mutated counter **and** the battery copy). The lane files were read-only throughout.');
lines.push('- Survivors were then **witnessed**: a receipt mutated in the dimension the weakened conjunct used to guard was');
lines.push('  run through the pristine counter and the mutant counter in the same invocation. `pristine=finding &');
lines.push('  mutant=clean` is a **behavioral escape**; `pristine=finding & mutant=finding` is a **redundant conjunct**');
lines.push('  (a sibling check still rejects the receipt). The 4 vacuous edits are excluded from the survivor count.');
lines.push('');
lines.push('## 2. Results');
lines.push('');
lines.push('| metric | value |');
lines.push('|---|---|');
lines.push('| mutants written / bytes re-derived and matched | ' + m.counts.mutantsListed + ' / ' + m.counts.bytesRederived + ' |');
lines.push('| executed and counted (after 4 vacuous exclusions) | ' + m.counts.executedAndCounted + ' |');
lines.push('| killed by the battery | ' + m.counts.killed + ' |');
lines.push('| crashed | ' + m.counts.crashed + ' |');
lines.push('| survivors | ' + m.counts.survived + ' |');
lines.push('| — behavioral escapes (pristine refuses, mutant clean) | ' + m.counts.behavioralEscapes + ' |');
lines.push('| — redundant conjuncts (sibling check still refuses) | ' + m.counts.redundantConjuncts + ' |');
lines.push('| — unclassified / vacuous | ' + m.counts.unclassifiedSurvivors + ' / ' + m.counts.excludedVacuous + ' |');
lines.push('');
lines.push('The one kill is the point of contrast: the battery is good at catching the edits it has cases for, and blind to');
lines.push('the conjuncts it does not isolate.');
lines.push('');
lines.push('### 2.1 The one killed mutant');
lines.push('');
for (const k of killed) {
  lines.push('- `' + k.id + ' ' + k.name + '` — killed by `' + k.firstBatteryFailures[0].case + '`: ' + k.firstBatteryFailures[0].detail + '.');
  lines.push('  The witness sets a cross-origin leg `showPicker` to a success object; with the mutated `okCall` this raises');
  lines.push('  `want` from 0 to 1 and adds `intercept-law` as an extra finding, which the battery case forbids.');
}
lines.push('');
lines.push('### 2.2 Vacuous edits (excluded, not counted as survivors)');
lines.push('');
for (const v of vac) {
  lines.push('- `' + v.id + ' ' + v.name + '` — ' + v.why);
}
lines.push('');
lines.push('## 3. Load-bearing blind spots');
lines.push('');
lines.push('### 3.1 Replay thresholds: two behavioral escapes at the exact boundary');
lines.push('');
lines.push('A receipt was built from `controls/c1/probes/prior1.json` with the r83 identity fields rewritten and launch');
lines.push('tokens/browser ids freshened; four whole legs (30 of 61 page events) were shifted +100 ms **with their marks and');
lines.push('closedAt**, so every other check stays valid and exactly **31** event pairs match the prior — the pristine');
lines.push('`absNeed = ceil(0.5*61) = 31`.');
lines.push('');
lines.push('| counter | `absMatched` | `absNeed` | refused | verdict |');
lines.push('|---|---|---|---|---|');
lines.push('| pristine | 31 | 31 | yes | findings `' + JSON.stringify(thr.pristine.findings) + '` |');
lines.push('| `replay-frac-relaxed` (FRAC 0.5 → 0.9) | 31 | 55 | no | **clean** |');
lines.push('| `replay-refusal-boundary-strict` (`>=` → `>`) | 31 | 31 | no | **clean** |');
lines.push('| `replay-tolerance-tightened` (TOL 0.05 → 0.005) | 31 | 31 | yes | findings `' + JSON.stringify(thr.toleranceTightened.findings) + '` |');
lines.push('');
lines.push('- The battery’s replay case is a verbatim prior forgery: 61/61 matched, refused by any FRAC ≤ 1. It never sits in');
lines.push('  the 31–54 band, so raising FRAC to 0.9 (escape minimum 7 moved events instead of 31) survives and passes a');
lines.push('  fully consistent receipt.');
lines.push('- The `>=` boundary is likewise untested: exactly `absNeed` matches is refused by the frozen rule and accepted by');
lines.push('  the mutant.');
lines.push('- `replay-tolerance-tightened` is *not* a weakness: `event-time-quantum` puts every accepted `ts`/`at` on a 0.1 ms');
lines.push('  grid, so two on-grid times are either identical or ≥ 0.1 ms apart. TOL values below 0.05 are behaviorally');
lines.push('  identical; the 31-match receipt is still refused. Excluded as a dead knob, but it shows TOL is not the guard.');
lines.push('');
lines.push('### 3.2 Run-window bounds');
lines.push('');
lines.push('- `runwindow-lower-relaxed` (`>= 12000` → `>= 11000`): a receipt with `finishedAt = startedAt + 11000 ms` is');
lines.push('  refused by pristine `run-window` and **clean** under the mutant. The battery case uses exactly 10000 ms, still');
lines.push('  below both bounds.');
lines.push('- `runwindow-upper-relaxed` (`< 600000` → `< 700000`): a 650000 ms run is **clean** under the mutant; the battery');
lines.push('  witness uses exactly 700000 ms, which still trips `< 700000`. Both edits keep the battery green.');
lines.push('');
lines.push('### 3.3 Send-log minimum length');
lines.push('');
lines.push('- `sendlog-min-length-relaxed` (`log.length < 10` → `< 1`): a cross-origin leg with a **9-entry** send log');
lines.push('  (the 6-entry prologue + intercept + the two child-button mouse events, with ids renumbered and');
lines.push('  `interceptSendId`/`priorPressId`/`priorReleaseId` rebound) is refused only by the pristine length gate and is');
lines.push('  **clean** under the mutant. `plan-calls`, the prologue check and the allowlist all pass.');
lines.push('');
lines.push('### 3.4 Cross-origin law conjuncts');
lines.push('');
lines.push('Behavioral escapes that let a receipt keep the right `ok`/`name` but change everything else:');
lines.push('');
for (const name of ['cross-child-istrusted-unchecked', 'cross-childresult-message-unpinned', 'order-cod-childresult-exactness-dropped', 'order-cod-childact-before-unbound', 'order-cod-child-istrusted-unchecked', 'extras-parentcross-unbound', 'extras-childact-before-unbound', 'extras-childlate-unbound', 'extras-istrusted-unchecked']) {
  const s = be.find((x) => x.name === name);
  if (s) lines.push('- `' + s.id + ' ' + s.name + '` — ' + (s.witness && s.witness.describe ? s.witness.describe : s.reason));
}
lines.push('');
lines.push('The extra-leg loop is the widest one: `parentCrossAccess`, child activation before/after, child event');
lines.push('truthiness and `childLate` are each unbound on month/week/time/number/range (the base leg keeps its own case).');
lines.push('The `cod` order discriminator similarly loses the disabled child result, before-activation and child trust; only');
lines.push('`childLate` and `cod` open-count-via-siblings remain enforced.');
lines.push('');
lines.push('### 3.5 Answer attribution subfields');
lines.push('');
lines.push('The frontier legs pin the mode and the delivered state, but several attribution fields are unbound and a receipt');
lines.push('that changes only the recorded answer is clean under the mutant:');
lines.push('');
for (const name of ['webkit-setparams-keyset-unpinned', 'webkit-read-bytes-unpinned', 'webkit-seterr-unchecked', 'accept-answer-files-unpinned', 'accept-backendid-unbound', 'accept-upload-sha-unpinned', 'accept-seterr-unchecked', 'multiple-answer-files-unpinned', 'multiple-seterr-unchecked', 'multiple-upload-sha-unpinned', 'accept-mime-answer-files-unpinned', 'accept-mime-backendid-unbound', 'accept-mime-upload-hex-unpinned', 'second-chooser-answer-files-unpinned', 'second-chooser-seterr-unchecked', 'second-chooser-upload-hex-unpinned', 'noselection-nonanswer-dismiss-state-unchecked']) {
  const s = be.find((x) => x.name === name);
  if (s) lines.push('- `' + s.id + ' ' + s.name + '` — ' + (s.witness && s.witness.describe ? s.witness.describe : s.reason));
}
lines.push('');
lines.push('Notably, `upload`/`uploadPng`/`uploadSecond` sha256 is pinned while `hex` is not (on the MIME and second-chooser');
lines.push('legs); the accepted `.txt` sha256 is not pinned at all on the plain accept leg; and the second chooser’s');
lines.push('`firstChooserBackendNodeId` is still refused only because it must equal `secondChooserBackendNodeId` (redundant).');
lines.push('');
lines.push('### 3.6 Protocol and record conjuncts');
lines.push('');
lines.push('Highlights (all in the appendix with witness output): `plan-frozen` prior-click coordinates and intercept record;');
lines.push('`leg-records` armError/clickError/triggerError, negative `chooserWaitMs`, non-integer error `code`; the first mark');
lines.push('label; context count >1, context origin, and non-string `frameId`; send-log `params` object type and duplicate');
lines.push('`Page.navigate`/`Browser.getVersion`; plan-call id fields; CDP event-method allowlist, navigated/open frame ids');
lines.push('and second-open send binding; `frame-binding` frame-id format; page-event `leg` type, off-grid `at`, and the');
lines.push('upper window bound; leg-shape `act`; `hasBeenActive`; `show-picker-2` pointer exclusion; ports distinctness,');
lines.push('lower bound on cdp/child and integer typing of cdp; devtools port `>= 1024`; teardown probe values other than');
lines.push('`open` and curl codes other than 7; fixture `accept`; server root status and non-404 non-root status.');
lines.push('');
lines.push('### 3.7 The unparsable gate');
lines.push('');
lines.push('- `unparsable-brace-heuristic-dropped` removes the “starts with `{`” branch: a scratch **mirror lane** with');
lines.push('  `.ufo/waves/round-83/corrupt.txt` beginning with `{"schema": "tabi-chrome-cdp-showpicker-r83", broken` is');
lines.push('  refused by pristine `prior-set-unparsable` and accepted (**clean**) by the mutant. The battery witness writes');
lines.push('  `.json`, so only the extension branch is covered.');
lines.push('');
lines.push('## 4. Redundant conjuncts (' + rd.length + ')');
lines.push('');
lines.push('These edits survive the battery because no case isolates the conjunct, but the witnessed receipt is still refused');
lines.push('by a sibling check. They are still coverage findings (the battery cannot attribute the refusal), but they do not');
lines.push('change the receipt-level acceptance contract on their own.');
lines.push('');
for (const s of rd) lines.push(redundantBullet(s));
lines.push('');
lines.push('## 5. Behavioral escapes (' + be.length + ') — full list with weakened form and witness');
lines.push('');
for (const [title, items] of grouped) {
  lines.push('### ' + title + ' (' + items.length + ')');
  lines.push('');
  for (const s of items) lines.push(bullet(s));
}
if (rest.length) {
  lines.push('### Other behavioral escapes (' + rest.length + ')');
  lines.push('');
  for (const s of rest) lines.push(bullet(s));
}
lines.push('## 6. Evidence, reproduction and cleanup');
lines.push('');
lines.push('- Deliverable: `.ufo/waves/round-83-seats/R83Mut1/mutants.json` (schema `tabi-r83-r83mut1-mutants`).');
lines.push('  It carries every mutant’s exact `{from,to}`, re-derived sha256 (115/115 match), battery exit/coverage and');
lines.push('  the witness classification/findings.');
lines.push('- Receipts: `.ufo/waves/round-83-seats/R83Mut1/receipts/` — `sweep-results.json`, `witness-results.json`,');
lines.push('  `witness-results-threshold.json`, `witness-results-112.json`, `preflight.json`, `replay-boundary-31.json`,');
lines.push('  `before.sha256`, `after.sha256`.');
lines.push('- Scripts: `.ufo/waves/round-83-seats/R83Mut1/scripts/` — the sweep, witness harness/spec, threshold and mirror');
lines.push('  witnesses, and the three reruns used after two initial mutants were found to be stricter (not weaker) and one');
lines.push('  was syntactically invalid. Those three replacements are the entries with `mutatedSha256` re-derived in');
lines.push('  `mutants.json`.');
lines.push('- Lane hashes before/after are identical (counter `7b9f9ec4…`, battery `12c09cc1…`, receipt `3f9bbb60…`,');
lines.push('  prior set `1ff644e5…`); no lane, walked-tree or fixture file was written. `laneUnchanged: true` in');
lines.push('  `mutants.json`.');
lines.push('- Scratch `/fast/scratch/hyaku/tabi-r83/R83Mut1/` was deleted after the receipts above were copied into the seat');
lines.push('  dir. No tool was installed or upgraded during this seat; Node was the preinstalled `v24.21.0`.');
lines.push('');
lines.push('## 7. Findings for the planner (no amendment proposed)');
lines.push('');
lines.push('1. The frozen “50 mutants, 0 survivors” evidence is **not conjunct-complete**. On 111 independently written');
lines.push('   conjunct-level edits, 110 survive; 77 of those are behavioral escapes with a concrete receipt that pristine');
lines.push('   refuses and the mutant accepts.');
lines.push('2. The most claim-relevant escapes are the replay thresholds (FRAC and the `>=` boundary) and the run-window');
lines.push('   bounds, all demonstrated with consistent receipts; the replay escape is reachable with a receipt that passes');
lines.push('   every other check.');
lines.push('3. The answer-attribution frontier is still weaker than the claim’s wording suggests: the delivered state/mode is');
lines.push('   pinned, but the answer-record subfields (files, backend ids, upload digests/hex, setResult/setError, setParams');
lines.push('   shape, read bytes) are individually unbound.');
lines.push('4. The cross-origin law’s message/trust/activation conjuncts on the extra legs are unbound; only `ok`/`name` and the');
lines.push('   base-leg messages retain dedicated cases. A receipt can rewrite the SecurityError text on `cod` or the');
lines.push('   parentCrossAccess/child-activation/childLate fields on month/week/time/number/range and stay clean.');
lines.push('5. A meaningful subset of survivors are redundant, not escapes: the battery’s refusal is carried by sibling checks');
lines.push('   (listed in §4). If conjunct attribution matters, the battery would need cases for those fields; this report');
lines.push('   does not propose changing the predicate, counter, pins, priors, thresholds or kill rule.');
lines.push('');
lines.push('Report: .ufo/waves/round-83/w1/R83Mut1.md');
lines.push('');
fs.writeFileSync(OUT, lines.join('\n'));
console.log(JSON.stringify({ written: OUT, bytes: lines.join('\n').length, behavioral: be.length, redundant: rd.length, vacuous: vac.length }, null, 1));
