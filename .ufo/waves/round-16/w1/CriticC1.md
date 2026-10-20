# CriticC1 — wave 1 pre-build falsification of C1 (measurement-binding contracts 0→1)

Seat: TabiR16.CriticC1-5 (critic, read-only). Inputs: `.ufo/waves/round-16/PLAN.md` (§C1, lines 9-14, 34-77),
`corpus/lessons/round-15-verifier-spotcheck.md:118-124`, the real r15 file `corpus/evidence/round-15/measurements.json`,
git history. Gate, selftest, r16 counter and `corpus/evidence/round-16/binding/` **do not exist yet**
(`ls scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs corpus/evidence/round-16/binding` → "No such file or directory").
I ran no gate, selftest, counter or browser. All commands below are read-only git/sha256/ls.

Axes affected: **operability** (claim axis), **calibration** (do counted receipts tell the truth), **quality/discernment** (self-certification risk).

## Facts established this session

| # | Command | Observed output |
|---|---|---|
| F1 | `for r in 27dfd98 b7cf044 9fd8bca 36240c7 e38d259; do git show $r:.ufo/waves/round-15/measure.mjs \| sha256sum; done` | 27dfd98 `3ee59de0…e384`; b7cf044 `3ee59de0…e384`; 9fd8bca `dd9c8675…251d`; 36240c7 `dd9c8675…251d`; e38d259 `dd9c8675…251d` |
| F2 | `git merge-base --is-ancestor 9fd8bca b7cf044; echo $?` | `1` (C2's counter code revision is a **descendant** of the measured revision) |
| F3 | `git merge-base --is-ancestor 27dfd98 b7cf044; echo $?` | `0` |
| F4 | r15 `measurements.json` structure (python walk) | top-level `measuredRevision=b7cf044…`, `executedCodeRevision=27dfd98…`; `C1.counterCodeRevision=27dfd98…` (no digest); **`C2.counterCodeRevision=9fd8bca…` AND `C2.counterSha256=dd9c8675…251d`** |
| F5 | `git diff --name-only b7cf044 36240c7` | includes `.ufo/waves/round-15/measure.mjs` (plus LOG/SCORECARD/count-after-*/measurements.json) |
| F6 | grep of `count-after-c1.json`, `count-after-c2-repaired.json` for `counter*`/`sha256` keys | no match — only measurements.json C2 carries a digest |
| F7 | `.ufo/waves/round-15/measure.mjs:4,238-322` (HEAD) | "Revision-based: every byte is read from the named git revision" — data from `git show REV:path`, but the **code** runs from the working tree |
| F8 | `scripts/check-round-contract.mjs:296-303,537-541,594-603` | an existing authority already binds `measured-against` for `pstack-round` SCORECARD blocks (git-only grammar, `evidence_moved` via `sameTree`) |

## Objections (counterexample → evidence → impacted axes → smallest safe correction → refuting observable)

### O1 — PLAN:77 hard-codes a false legacy outcome (self-certification by spec). **Fixable defect, highest priority.**
- Counterexample: the C1 counter counts 1 only if `legacy-r15.json` has `counter_digest_unrecorded` **for both r15 claims** (PLAN:77; same expectation PLAN:64-67). The real file records a digest for C2 (F4: `C2.counterSha256=dd9c8675…`). A truthful adapter therefore cannot emit `counter_digest_unrecorded` for C2; the only way to reach count 1 is an adapter that ignores a recorded field. The counter would reward a false finding.
- Truthful per-claim legacy outcome at REV=e38d259, under the PLAN's own r16 semantics (derived from F1-F5, not run):
  - C1: `counter_digest_unrecorded`, `counted_inputs_undeclared`, `counter_changed_since_measurement` (27dfd98 `3ee59de0` ≠ REV `dd9c8675`).
  - C2: `counted_inputs_undeclared`; `counter_digest_mismatch` (blob at measuredRevision b7cf044 = `3ee59de0` ≠ recorded `dd9c8675`, because the counter code postdates the measurement, F2); **not** `counter_digest_unrecorded`, **not** `counter_changed_since_measurement` (9fd8bca = REV blob).
- Impacted: calibration, discernment, operability.
- Correction: replace PLAN:77's "`counter_digest_unrecorded` for both r15 claims" with an exact per-claim expected reason set derived from the real file (as above), and have the legacy adapter read per-claim `counterSha256` and top-level `measuredRevision`.
- Refuted if: `node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at e38d259` exits 1 and prints exactly the C1 and C2 reason sets above. A C2 detail line must show recorded `dd9c8675…` vs measured-revision blob `3ee59de0…`. Any `finding claim=C2 reason=counter_digest_unrecorded` line confirms O1.

### O2 — Defect 2 is not closed by the legacy run: the counter edit inside b7cf044→36240c7 is invisible
- Counterexample: PLAN:57 puts `counter.path` into the drift diff, and F5 shows `.ufo/waves/round-15/measure.mjs` changed between measured b7cf044 and delivered 36240c7. The legacy mode (PLAN:64-67) defines no `counted_input_changed` output, so the one real drift in the r15 defect-2 window never surfaces. Lesson :121 says "no counted input or gate drift in between". That holds only if the counter is excluded from the counted inputs, and the new gate's semantics include it.
- Impacted: calibration (gate vs. outside-closure wording).
- Correction: the legacy adapter also emits `counted_input_changed detail=.ufo/waves/round-15/measure.mjs` for any claim whose diff `measuredRevision..REV -- counter.path` is nonempty. The legacy evidence states which counter blob reproduces each receipt (defect 1's second sentence, lesson :120): C1 → `3ee59de0` (27dfd98/b7cf044), C2 → `dd9c8675` (9fd8bca).
- Refuted if: `--legacy … --at 36240c7` lists `counted_input_changed` with that path for both claims, and `--at b7cf044` does not.

### O3 — `--reproduce` checks the committed blob but runs the working-tree file
- Counterexample: the digest checks compare git blobs at measuredRevision and REV (PLAN:55-56). `--reproduce` then executes `node <counter.path>` from cwd (PLAN:59), and the counter reads data from git but runs its code from disk (F7). With a dirty `measure.mjs` that always prints `{"c1_binding_contracts":1}`, the gate reports clean: blobs match, and the substituted code "reproduces" the count.
- Impacted: operability (enforcement is bypassable), calibration.
- Correction (smallest): before spawning, hash the bytes at `<repo>/<counter.path>` and refuse with a new reason `counter_worktree_differs` if they differ from `sha256`. Alternative: run the blob extracted from REV into a mkdtemp file.
- Refuted if: a selftest case with a dirty tracked counter (commit clean, then overwrite on disk) yields exit 1 with exact reason set `{counter_worktree_differs}`, and the same-shape clean control yields exit 0.

### O4 — A constant counter passes `--reproduce`: `before` is never re-measured
- Counterexample: `--reproduce` re-runs only at `--at REV` and compares against `after.count` (PLAN:59-60). A counter that ignores `{REV}` and always prints 1 passes. `before.count=0` at `before.revision` is pure paperwork, and nothing in the binding falsifies "0→1".
- Impacted: operability, calibration.
- Correction: `--reproduce` also runs argv with `{REV}`→`before.revision` and requires `before.count`, under the same `count_not_reproduced` reason (detail `phase=before`).
- Refuted if: a selftest case with a constant-1 counter gives exit 1 with `{count_not_reproduced}` and detail `phase=before`, and the real r16 manifest `--check … --at HEAD --reproduce` gives exit 0 with before=0 re-observed.

### O5 — The counter trusts self-written receipts; the selftest itself is unbound
- Counterexample: the C1 counter reads committed `selftest.json` and requires exit 0, a summary line, `cases≥12`, the reasons, and `gateSha256` = gate blob (PLAN:74-77). It never re-runs anything, and it does not bind `scripts/selftest-measurement-binding.mjs`. A selftest edited to skip assertions, or a hand-written JSON carrying the real gate digest, counts 1. `gateSha256` proves only that the receipt names the gate, not that this selftest drove it.
- Impacted: discernment (self-certification), quality.
- Correction: (a) receipts also carry `selftestSha256`, and the counter requires it to equal the selftest blob at REV. (b) The receipt keeps per-case `{name, argv, expectedExit, observedExit, expectedReasons, observedReasons}`, and the counter recomputes pass/fail and the exercised-reason set from those rows instead of trusting summary fields. (c) L1's closure re-runs `--self-test` at delivered HEAD and diffs the summary line against the committed receipt.
- Refuted if: the counter returns 0 (exit 1) against a mutated REV where `selftestSha256` mismatches or a case row has observed≠expected while the summary says clean. A fresh `node scripts/check-measurement-binding.mjs --self-test` at delivered HEAD prints the same `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=<n> reasons=<k>` as the receipt.

### O6 — `cases ≥ 12` is below the reason vocabulary, and multi-reason cases hide untested reasons
- Evidence: PLAN:54-61 defines 13 reasons. Nine are per-claim: measured_revision_not_ancestor, counter_digest_unrecorded, counter_digest_mismatch, counter_changed_since_measurement, counted_inputs_undeclared, counted_input_changed, argv_unsupported, counter_failed, count_not_reproduced. Four are could-not-evaluate: manifest_unreadable, manifest_schema_invalid, revision_unresolved, git_failed. PLAN:71 requires each reason "at least once with a same-shape positive control", which implies ≥13 isolating cases plus controls. The counter's floor of 12 (PLAN:75) can be met while one case produces several reasons at once. Example: editing the counter fires both `counter_changed_since_measurement` and `counted_input_changed`, so neither is tested alone.
- Correction: the counter requires that every per-claim reason (except intrinsically paired ones, whose pair must be asserted as an exact set) appears as the **sole** observed reason in ≥1 case, with a clean control from the same fixture. Raise the floor to `cases ≥ 2×|isolated reasons|` or drop the number and rely on the per-reason rule. `git_failed` needs a deterministic trigger (e.g. a `--repo` path with no `.git`), or the vocabulary must state that it is unexercised. Never count it as exercised by hand.
- Refuted if: the committed receipt rows show, for each reason, one case whose observed set is exactly `{reason}` (or the declared pair), with a passing control.

### O7 — "Enforced" with no enforcer: nothing requires the gate to pass on round 16's own claims
- Counterexample: the counter counts the gate plus its two receipts (PLAN:74-77). It does not require `corpus/evidence/round-16/measurement-binding.json` to exist or to `--check` clean, and nothing wires the gate into `check-round-contract.mjs` or any production check. The count could be 1 while every r16 measurement is unbound. That is a tool built, not a contract enforced, and it is exactly the r15 failure mode re-labelled.
- Impacted: operability (the claim's meaning), calibration.
- Correction (smallest that keeps C1 causally separate from C2): L1's delivered state includes `corpus/evidence/round-16/measurement-binding.json` binding **both** C1 and C2, with counter sha256, countedInputs and argv. The closure step runs `--check … --at <delivered HEAD> --reproduce`. The circularity is deliberate: C1's own count becomes falsifiable by its own gate. Do not add this to the C1 counter's 0→1 test, because the manifest is necessarily committed after `measuredRevision`. Make it the closure acceptance instead.
- Refuted if: after the final commit, `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at $(git rev-parse HEAD) --reproduce` prints `MEASUREMENT_BINDING verdict=clean claims=2 bound=2` and exits 0. A tampered copy (one byte added to a declared counted input in a scratch clone) must flip it to `counted_input_changed`.

### O8 — `countedInputs` is self-declared; under-declaration silently defeats `counted_input_changed`
- Counterexample: if the manifest omits a path the counter reads (e.g. `selftest-measurement-binding.mjs` or `binding/legacy-r15.json`), edits to that path between measuredRevision and HEAD raise no finding. The gate cannot tell a complete list from a convenient one.
- Correction: the counter's JSON stdout includes `reads: [paths it passed to git show/ls-tree]` (one wrapper around the existing `git()` helper, F7 pattern). `--reproduce` then adds `counted_inputs_incomplete` when the observed reads are not covered by declared countedInputs (directory-prefix aware).
- Refuted if: a selftest with a manifest omitting one read path gives `{counted_inputs_incomplete}`, and the real r16 manifest gives none.

### O9 — Duplicate authority over "measured revision" (tradeoff the judge should watch)
- Evidence: F8. `check-round-contract.mjs` already defines measured-against, `report_commit` and `evidence_moved` for `pstack-round` blocks. The new gate defines a second notion: measuredRevision plus a countedInputs diff.
- Risk: two authorities could disagree on the same round, e.g. evidence under `corpus/evidence/round-16/` changing after measuredRevision trips `evidence_moved` in one gate but nothing in the other.
- Correction: the gate's header and the round's lesson scope it to `tabi-measurement-binding-v1` manifests only. State explicitly that it does not replace `check-round-contract.mjs` semantics; no change to the existing script.
- Refuted if: the r16 lesson names both authorities and their disjoint scopes, and `check-round-contract.mjs` is byte-unchanged at delivered HEAD (`git diff e38d259 HEAD -- scripts/check-round-contract.mjs` empty).

## What would refute this whole critique (C1 holds)
All of the following, observed by L1 at the **delivered** HEAD after the final commit, with no edit in between:
1. `--self-test` exits 0 with a summary equal to the committed receipt. Per-case rows show exact exit and exact reason sets, including the dirty-counter (O3), constant-counter (O4), under-declared-inputs (O8) and `{REV}` `;`/`$()` inertness cases, each next to a clean control. Inertness must be checked by the absence of a marker file in the temp repo.
2. `--legacy` over the real r15 file exits 1 with the exact per-claim sets of O1/O2. In particular C2 shows `counter_digest_mismatch` (recorded `dd9c8675`, measured-revision blob `3ee59de0`) rather than `counter_digest_unrecorded`.
3. `--check corpus/evidence/round-16/measurement-binding.json --at <delivered HEAD> --reproduce` exits 0 with `claims=2 bound=2`. The before and after counts are both re-observed.
4. `node .ufo/waves/round-16/measure.mjs <delivered HEAD> --claim C1` reports `c1_binding_contracts: 1` and `node .ufo/waves/round-16/measure.mjs e38d259… --claim C1` reports 0. Both bytes match the digest in the manifest.

If item 2 is satisfied only by an adapter reporting `counter_digest_unrecorded` for C2, then C1 is self-certifying, and the canonical judge should reject its 0→1 even if items 1, 3 and 4 pass.

## Tooling
No installs or updates. No gates, selftests, counters or browsers run.
