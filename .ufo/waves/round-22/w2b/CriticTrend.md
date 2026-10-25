# CriticTrend — round22 w2b (TabiR22-2.CriticTrend-12)

Scope: the honest round22 trend verdicts (expansion, quality, discernment), given that
the new oracle failed its own positive at the first integrated checkpoint and was then
repaired after the author saw the failure.

Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (abbreviated `e3cf4e0`).
Pre-repair checkpoint: `0f24164be77e72ba359fe4befdc42d96bc343034` (`0f24164`).

This is a static, author-side critique. I executed no lane script, oracle, selftest or
counter. I ran no browser, network or REA work and installed nothing. I wrote only this
file. Every measured number below is read from a committed or retained receipt, and the
receipt is named each time.

## Axes named

| Trend (fleet `LEARNING.md:31-35`) | Decided by |
|---|---|
| expansion | net new admitted entries on uncovered ground, new frontier, a new kind of source, or a capability row |
| quality | entries re-verified or deepened, with no admitted entry failing its re-check |
| discernment | a non-author spot-check agrees on admits *and* rejects, or a disagreement becomes a lesson that adds a grounded QUALITY criterion; **harmed** when a criterion is added with no lesson behind it |

Fleet `LEARNING.md:45-46` adds: "A subagent the lane dispatched is still the lane."

## Honest verdicts

| Trend | Honest round22 author verdict | Required wording / conditions |
|---|---|---|
| expansion | **unchanged** | knowledge 40→41 is one recheck/method note on held ground; rows 101, tiers A88/B4/C9 and mined 73 are unchanged; no new S-row, no frontier move, no capability |
| quality | **improved, bounded** | must disclose the 0f24164 failure (value 0, selftest 41/42), the repair made after seeing it (D1–D3), and that 12 is clean at e3cf4e0 with 44/44 controls. The gain is failure-capability on the same 12 observations, not new truth (F1, F2, F5) |
| discernment | **unchanged pending outside agreement** | no in-lane seat, w2b included, counts as outside. QUALITY56–58 MUST be backed by a landed lesson (F3). The repair's provenance sentence MUST be corrected (F4) |

The failing-then-repaired history does not by itself make quality `harmed`. That needs
"an entry found false or stale and left unmarked". Here the instrument failed, not the
admitted entry:

- **The admission bars stay clean.** At both `0f24164` and `e3cf4e0` the round21 counter
  returns `c1_lifecycle_observations` 12 clean and the round20 counter returns 12 clean.
  Receipts: `checks-pre-w2-0f24164.json`, runs `lifecycle21-after` and
  `lifecycle20-after`; `checks-at-e3cf4e0.json`, the same runs.
- **D1 is grounded in producer bytes, not fitted to the outcome.**
  - At `e3cf4e0`, `scripts/webmcp-lifecycle-round21.mjs:110-111` installs the
    `observations.errors` recorder only on the fixture page.
  - The `/landing` response at `:135-137` is a bare document with no recorder.
  - The retained `corpus/evidence/round-21/runtime/na-native-submit.json` after-action
    observation has keys `focused, formActive, formExists, secureContext, url, value`. It
    has no `errors` and no `nonce`, and its url is `/landing?q=<case nonce>`.
- **Round16 precedent.** Round16 kept a counted-0 first counter defect and still recorded
  quality improved. It did so by keeping that history in `LOG.md:984-986` and in
  `corpus/lessons/round-16.md:93`, which leads to QUALITY17. The honest path is to do the
  same, and that is not yet done (F1).

`unprovable-but-better` is not the right verdict. The gain is measured (44 controls and a
clean 12), and that vocabulary is reserved for exploratory claims judged by a named
non-author.

## F1 — quality/calibration: the canonical record hides the failing first measurement and the post-observation repair

**Evidence (e3cf4e0).** `LOG.md:1561-1562` still ends the round22 narrative at:

> Independent CLI expectations were authored for42 semantic controls ... They are not yet exercised.

- `SCORECARD.md:1043-1069`, `corpus/README.md:500-520` and
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:59-62` never mention any of these:
  - the `0f24164` value 0 / verdict failed;
  - the selftest 41/42;
  - D1–D3;
  - the move from 42 to 44 controls.
- `git grep -E '0f24164|post-crash|absent-vs-empty|masked'` over `LOG.md SCORECARD.md
  SKILL.md corpus/` finds no round22 hit.
- The only record is `.ufo/waves/round-22/post-crash-repair.json`. Its `honesty` field at
  `:67` correctly says "Repair authored after observing the failing positive (fitting
  risk)".

**Counterexample.** A final report or closure that cites only the canonical files would say
"baseline 0 → 12 clean". That reads as a predeclared oracle passing on first contact. In
fact the oracle was changed in exactly the two predicates that failed. This is the
"successful result relabeled" pattern that `SCORECARD.md:1067-1068` disclaims for the axis
correction, applied here to the oracle.

**Preserving positive.** `post-crash-repair.json` has the full receipt set:

- discovery exit 1;
- defects D1–D3;
- the sandbox 44/44 run;
- two mutation probes, each going to 43/44;
- before/after file hashes.

`checks-at-e3cf4e0.json` shows 35/35 with `c1-after` value 12 clean. The facts are present,
just not where a trend reader looks.

**Impacted axes.** Quality (verdict wording), calibration, and the operability claim's
provenance.

**Smallest fix.** Make three append-only additions, mirroring round16:

1. A LOG entry: first integrated measurement at `0f24164` returned value 0 and failed with
   `semantic_error` and `semantic_navigation` on `na-native-submit:post`; the selftest was
   41/42; D1–D3 were repaired after observation; the selftest went to 44/44; `e3cf4e0`
   measures 12 clean.
2. A `corpus/lessons/round-22.md` `## Mistakes` row for "expectations transcribed from
   evidence but never run against the retained positive before integration".
3. The quality verdict worded as "improved, bounded; oracle repaired after its positive
   failed".

Separately, `checks-at-e3cf4e0.json` is untracked (`git status` shows `??`). It must be
committed before any verdict cites it.

## F2 — quality/calibration: duplicate authority; the pinned expectation and the operative predicate disagree on landing errors

**Evidence (e3cf4e0).**

- **The pin says empty.**
  - `corpus/evidence/round-22/semantic-expectations.json:80` (`na-native-submit` `post`)
    sets `"errors": []`.
  - The file is pinned by `measure-c1.mjs:22` `EXPECTATIONS_SHA256 = '4a693dce…'`, which
    matches `sha256` of the blob.
- **The same line already uses `null` for "unavailable".** It sets `"submitCount": null`
  for the same stage, and `measure-c1.mjs:121-122` turns that `null` into "key must be
  absent".
- **The repair overrides the pin by case id.**
  - `measure-c1.mjs:117` sets `landing = stage === 'post' && id === 'na-native-submit'`.
  - `:129` then *requires* `errors` to be absent, and only checks that the pinned value is
    `[]`.
  - So the operative expectation for this field now lives in code, keyed by case id, and
    not in the pinned file. The pinned file's `navigation: "landing"` field is not used.
- **The pinned bytes themselves encode a refused normalization.** `SKILL.md:2419` refuses
  "unavailable→empty normalization", yet the pin writes an unavailable collection as `[]`.
- **"Unchanged" is byte-true only.** `post-crash-repair.json:61-62` and `:67` describe the
  pinned expectations as "unchanged". That is true of the bytes, not of what the oracle
  enforces.

**Smallest counterexample.** An after-action observation with `errors: []` is a literal
match for the pinned expectation, yet it yields `semantic_error
na-native-submit:post:page-errors`. That exact case is the committed control
`native-landing-errors` in `fixtures/expected.json` (diff hunk `@@ -279`), and it is expected
to fail. A reader who treats the pinned file as the oracle's authority would predict
"clean".

**Preserving positive.** Two things show the repair is exact and grounded:

- the retained observation, with `errors` absent, gives 12 clean in `checks-at-e3cf4e0.json`;
- the mutation probe "landing errors check disabled" gives 43/44
  (`post-crash-repair.json` `mutationProbes`).

**Impacted axes.** Quality. The claim at
`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:21-25`, "fixed case expectations are in
`semantic-expectations.json` … independent", is weakened for this field. Calibration is
also affected.

**Smallest fix.**

- **Clean fix, post-w2b:**
  1. Set `post.errors` to `null` at `semantic-expectations.json:80`, mirroring
     `submitCount: null`.
  2. Re-pin `EXPECTATIONS_SHA256`.
  3. Replace `:129` with the generic rule
     `expected.errors === null ? Object.hasOwn(actual,'errors') : !equal(actual.errors, expected.errors)`.
  4. Record the pin change as a post-w2b repair.
- **Minimum, if the pin must stay:** add one sentence to the note and SCORECARD:
  "`na-native-submit` landing errors/nonce absence is code-owned at `measure-c1.mjs:115-130`,
  not read from the pinned expectations".

**Classification.** A fixable defect in the claim's wording/authority, not a wrong
measurement.

## F3 — discernment: QUALITY56–58 cite a lesson that does not exist at e3cf4e0

**Evidence.**

- `corpus/QUALITY.md:275`, `:282` and `:289` each cite
  `corpus/lessons/round-22.md#mistakes`.
- `git cat-file -e e3cf4e0:corpus/lessons/round-22.md` exits 128: the path does not exist.
- `LEARNING.md:35` makes "a criterion is added with no lesson behind it" discernment
  **harmed**.

**Precedent (not yet harm).** Round21 landed its criteria in `1b5f449` and `2d5eaaa`, before
its lesson in `ab73abe`. A forward pointer at a mid-round checkpoint follows lane practice.
It becomes harm only if the round closes without the lesson.

**Falsifier.** At the delivered revision, any of these is discernment harmed:

- `corpus/lessons/round-22.md` is absent;
- it lacks `## Mistakes`;
- it lacks one row each grounding QUALITY56 (W1 ConnPlanner/Raw05/Raw07), QUALITY57 and
  QUALITY58 (round21 closure `wave_conformance_debt`).

**Preserving positive.** The round21 lesson has `## Gate` at line 10 and `## Mistakes` at
line 104, and QUALITY55 cites it correctly.

**Smallest fix.** Land `corpus/lessons/round-22.md` with:

- `## Gate`, carrying round21's sentence verbatim: "No non-author admit/reject agreement is
  asserted. Every dispatched reviewer remains this lane's author-side verification."
- `## Mistakes`, with rows for QUALITY56/57/58 and for oracle defects D1–D3.

D1–D3 were found by the author, so they earn a lesson row but no discernment credit.

## F4 — discernment: false provenance in the repair's honesty sentence

**Evidence.** `.ufo/waves/round-22/post-crash-repair.json:67` says:

> Non-author review of this repair is the fresh post-crash wave and the closure.

The fresh post-crash wave is w2b, dispatched by this lane. That makes it author-side under
`LEARNING.md:45-46`. The w2b goal text says so too: "This is author-side falsification, not
non-author admission."

**Counterexample.** A trend writer could cite this sentence to record "discernment improved
— non-author w2b reviewed the repair". That would self-certify through a lane-dispatched seat.

**Preserving positive.** The same field correctly says "no author-side W2 seat ever reviewed
0f24164".

**Impacted axes.** Discernment and calibration.

**Smallest fix.** Since history is append-only, retain a correction rather than editing the
sentence: "Author-side falsification of this repair is w2b; the only non-author review is the
closure."

## F5 — quality bound: the D3 masking class is still structural in the selftest matcher

**Evidence.**

- `selftest-c1.mjs:382` matches a negative control with
  `ids.includes(expected.finding)`.
- D3 (`post-crash-repair.json` `defects[2]`) was exactly this: `native-submits-empty` passed
  only because an unrelated defect emitted the expected id in every mutant.
- The repair fixed that one fixture, not the matcher.
- The committed `selftest-repair-sandbox.json` and the `oracle22-selftest` stdout in
  `checks-at-e3cf4e0.json` both show 44/44 passing. In both, 14/44 negatives emit findings
  beyond the expected id:
  - the 11 `status-*` cases and `legacy-status-swap` emit
    `[semantic_status, semantic_status, semantic_output|semantic_error]`;
  - `duplicate-case` and `missing-case` emit `[case_set, case_set, input_shape]`.

**Counterexample.** Take a `status-*` mutant whose status check is disabled. It still emits
`semantic_status` whenever any other `semantic_status` predicate fires, such as `form-state`,
`nonce-state` or `submit-event` (`measure-c1.mjs:112-127`). It would therefore still pass.
Whether any current mutant reaches that path is unverified, because I executed nothing.

**Preserving positive.** The D1/D2 mutation probes prove that the two repaired predicates are
individually failure-capable.

**Impacted axes.** The quality bound. "Semantic mutations fail with the named finding" is
true only at id granularity, not at predicate granularity.

**Smallest fix.**

1. Add the expected finding *detail* to `fixtures/expected.json`, for example
   `na-click:post:status`.
2. Match on it, or on the exact finding multiset, in `checkOracle`.

Until then, word the quality claim as "negatives fail with the expected finding id".

## F6 — expansion: no defect; the oracle failure and repair do not touch it

**Evidence.**

- `checks-at-e3cf4e0.json` `curation-after` reports rows 101, tiers A88/B4/C9, statuses
  mined73/queued19/rejected9, knowledge 41. `curation-before` at `5f58577` reports
  knowledge 40.
- `corpus/README.md:510` says "Expansion is unchanged".
- The `corpus/SOURCES.md` diff changes only S101's used-by cell plus one search-log line.

**Counterexample tested.** I tested whether "the `0f24164` value 0 means an admitted entry
failed the bar it was admitted under", which would make expansion harmed. It is rejected:
that bar is the round21 counter plus its semantic witness and non-author closure. The counter
is 12 clean at both revisions, and the new instrument is not that bar.

**Fix.** None. Keep `unchanged`, and label 40→41 as a recheck note on held ground.

## Tradeoff, not a defect (for the canonical judge)

There is a reading under which discernment would be `improved`. The precedent is
`SCORECARD.md:646-647`, "discernment improved by learning prior non-author defects into
QUALITY18/19", and `:577`. On that reading, QUALITY57/58 learned from the round21 closure's
non-author `wave_conformance_debt`.

I recommend against it, for three reasons:

1. **The debt is not a gate disagreement.** The closure's `outside_spotcheck` items are both
   `agree` (`round21-closure.json`). The debt concerns wave reporting, not a gate admit or
   reject, which is the observable at `LEARNING.md:35`.
2. **That closure event is already credited.** Fleet `MANIFEST.json` `rounds[417]` records
   discernment improved "only at this non-author closure".
3. **Round precedent goes the other way.** Round20 and round21 both recorded the author
   verdict as unchanged pending outside agreement (`SCORECARD.md:968`, `:1029-1030`), and the
   closures accepted it.

The judge, not the author, should decide whether the learned debt earns credit.

## Record

- Tools installed or updated: none.
- Commands exercised, all read-only and run from the lane root:
  - **exit 0:**
    - `git show e3cf4e0:<path>` for every cited file;
    - `git diff 5f58577 e3cf4e0 -- <canonical files>`;
    - `git grep` at `e3cf4e0`;
    - `git log` ordering of QUALITY vs lessons;
    - `git status --short`;
    - `sha256sum` of the expectations blob (`4a693dce…`);
    - Python JSON reads of committed receipts, `checks-at-e3cf4e0.json`, the retained
      `na-native-submit.json`, and fleet `MANIFEST.json`.
  - **exit 128 (expected):** `git cat-file -e e3cf4e0:corpus/lessons/round-22.md`.
- Not run (Main should run after any post-w2b fix):
  - `node .ufo/waves/round-22/measure-c1.mjs --selftest` and `… <final>`;
  - `node .ufo/waves/round-21/measure-c1.mjs <final>`;
  - `node .ufo/waves/round-20/counts.mjs <final>`;
  - `node .ufo/waves/round-20/lesson-history.mjs <final>`;
  - a check that `corpus/lessons/round-22.md#mistakes` resolves at the delivered revision.
