# ExecC2DryRun — C2 dry run of the exact round-29 corrections (wave w1, round 29)

Milestone **C2** (calibration). Axis: calibration counter `scripts/check-selfassessment.mjs`
(frozen at `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4`, verified in
the scratch clone). Base revision for every run: `97be89bc66139eb45526a04af59a35dccc006eb9`.

**Outcome: the drafted append-only corrections clear all six counted stale tallies. Frozen-counter
mismatches go 6 → 0 in a clean scratch clone of the base with only the two drafts appended, and the
draft for `SCORECARD.md:1438` clears that line once a repaired `check-s106-evidence.mjs` self-test
reports seven cases. Four attack variants (wrong document, wrong number, ×2) each leave the targeted
tally counted.** No lane file was edited, no lane index/jj state touched, nothing committed in the
lane. The drafts below are the exact bytes to append.

**Post-hoc cross-check (§8):** the lane tip `35045d7d9f6cf0bbdc4c734881ab77b48deedb81` already
carries a differently-worded C2 corrections block (landed in `59e8167`) plus C1's repaired s106 gate.
Re-measured in a clean clone of that tip with the same frozen counter: **`mismatches = 0`, exit 0**.
The landed wording works and my `:1438` seven-case prediction is confirmed against the real repaired
gate. **Do not append my drafts on top of the landed section** — they would duplicate it; use §8 for
the reconciliation.

## 1. Counted mismatches at base (frozen counter)

Command (clean clone, `git status --porcelain` empty, `TMPDIR` under my scratch):

```
cd $S/lane && node scripts/check-selfassessment.mjs --repo "$S/lane" --rev HEAD --json
```

`exit=1`, `mismatches=6`, `couldNotEvaluate=93`, `superseded=5` — raw: `build/c2/c2-before.json`.

| # | Doc:line | Script (oracle) | Claimed | Observed |
|---|---|---|---|---|
| 1 | `SCORECARD.md:410` | `scripts/check-sources.mjs` | 25 | 26 |
| 2 | `SCORECARD.md:1138` | `scripts/round-evidence-audit.mjs` | 12 | 13 |
| 3 | `SCORECARD.md:1139` | `scripts/round-evidence-audit.mjs` | 12 | 13 |
| 4 | `SCORECARD.md:1151` | `scripts/round-evidence-audit.mjs` | 12 | 13 |
| 5 | `SCORECARD.md:1439` | `scripts/check-selfassessment.mjs` | 17 | 22 |
| 6 | `LOG.md:221` | `scripts/check-freshness.mjs` | 8 | 12 |

Oracle self-tests measured directly at the base clone (`build/c2/oracles/`):

| Gate | Verdict | Cases |
|---|---|---|
| `scripts/check-sources.mjs --self-test` | clean | 26 (exit 0) |
| `scripts/round-evidence-audit.mjs --selftest` | clean | 13 (exit 0) |
| `scripts/check-selfassessment.mjs --selftest` | clean, 22/22 | 22 (exit 0) |
| `scripts/check-freshness.mjs --self-test` | clean | 12 (exit 0) |
| `scripts/check-s106-evidence.mjs --selftest` | crash | `ReferenceError: existsSync is not defined` at `scripts/check-s106-evidence.mjs:267` (exit 1) |

`SCORECARD.md:1438` (`check-s106-evidence.mjs`, claimed 5) is **not** counted at base: the gate
prints no tally, so the finding is `could-not-evaluate` (`"self-test printed no tally"`). This is the
line that C1 turns into a live claim, hence the sixth correction below.

**Evidence note (claim text vs measurement):** `claims.json` writes the `:1439` before-state as
`(17 vs 20)`; the frozen counter measures `17 vs 22`. The count of 6 is unaffected — the
self-assessment gate's own self-test grew to 22 cases in round 28, after the claim's figure was
drafted. Recorded, not reconciled by me.

## 2. Drafted corrections (exact bytes appended; verified)

### 2a. `SCORECARD.md` — append at end of file (after line 1456)

```text

## Round 29 — corrections

Append-only exact corrections, measured 2026-10-26 at base `97be89bc66139eb45526a04af59a35dccc006eb9` in a clean clone with the frozen counter (sha256 `7281280…560c4`). Each line names the gate whose own self-test is the oracle, states the observed tally in a recognised form, and cites the superseded line; the earlier lines stay standing as provenance.

- `scripts/check-sources.mjs` `--self-test` measured 26 cases at the round-29 base; the twenty-five figure at `SCORECARD.md:410` is superseded.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13) corrects the twelve figure at `SCORECARD.md:1138`.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13) corrects the twelve figure at `SCORECARD.md:1139`.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13) corrects the twelve figure at `SCORECARD.md:1151`.
- `scripts/check-selfassessment.mjs` `--selftest` (22/22) corrects the seventeen figure at `SCORECARD.md:1439`.
- `scripts/check-s106-evidence.mjs` `--selftest` (7/7) corrects the five-case figure at `SCORECARD.md:1438`; the gate's `CASES` table already holds seven ids including `measured-revision-bytes-match` and `measured-revision-bytes-mismatch`, so the repaired self-test prints `cases=7` once C1 lands.
```

Why each line survives the frozen matcher (`m1Findings`, supersession loop at
`scripts/check-selfassessment.mjs:318-335`): the line names exactly one script (per-line association
wins over the section), yields exactly one tally equal to that gate's observed value, carries a
correction marker (`superseded` / `corrects`), and cites the stale line in its **own** document.
The correction lines are themselves findings with `claimed === observed`, so they add no count
(`couldNotEvaluate` rises 93 → 94 only because the `:1438` correction line inherits the base
gate's crash).

### 2b. `LOG.md` — append at end of file (after line 1987, one blank-line-delimited paragraph)

```text

- 2026-10-26 — **round 29 calibration correction (append-only).** At base
  `97be89bc66139eb45526a04af59a35dccc006eb9` in a clean checkout, `node
  scripts/check-freshness.mjs --self-test` measures `cases: 12`, exit 0; this
  supersedes the eight-case figure recorded at `LOG.md:221`. The superseded
  line stays standing as provenance, and no other LOG.md line is edited.
```

LOG supersession (`m1LogFindings`, `:318-335` + `citesLine` at `:226-240`) needs a **paragraph**
after the stale line that (a) names `scripts/check-freshness.mjs`, (b) carries `supersedes`,
(c) cites `LOG.md:221` (its own document), (d) contains the observed number in a
`statedTallyNumbers` shape — `cases: 12` matches `\bcases\s*[:=]\s*(\d+)`. The `cases:` form is
deliberately outside the *claim* patterns (`cases=` / `N cases` / `N-case`), so the paragraph adds
no new finding.

## 3. Before → after, measured in the clone

Applied the two drafts to the clone, committed with fixture identity (`5a286cc437a3d15d2692b5ebca8352036f22a3de`,
`git -C` only, tree clean), re-ran the same counter at `--rev HEAD`:

| Metric | Base `97be89b` | With drafts `5a286cc` |
|---|---|---|
| exit | 1 | 0 |
| `mismatches` | 6 | **0** |
| `couldNotEvaluate` | 93 | 94 |
| `superseded` | 5 | 11 |

All six original findings carry `superseded: true`; `SCORECARD.md:1438` stays
`could-not-evaluate` at the unrepaired base (correctly: no tally to contradict). Raw:
`build/c2/c2-after.json`, `build/c2/c2-drafts.diff`.

## 4. `SCORECARD.md:1438` prediction and its counter-side verification

The stale line claims `5 cases` for `scripts/check-s106-evidence.mjs`; that gate's `CASES` table at
the base already contains **seven** ids (`clean-fixture-valid`, `measured-revision-bytes-match`,
`measured-revision-bytes-mismatch`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid`,
`missing-bytes-could-not-evaluate`, `missing-receipt-could-not-evaluate`) — the two
`measured-revision-bytes-*` cases are the round-28 additions, so a repaired self-test prints
`S106_SELFTEST verdict=clean cases=7 passed=7` (claim C1's target is `N >= 7`).

Verified on the counter side in a second `--shared` clone at `97be89b` plus the same two drafts and
a **fixture** `scripts/check-s106-evidence.mjs` that prints that exact line (a simulation of the
post-C1 gate, not a repair of production code):

| Fixture gate score | exit | `mismatches` | `SCORECARD.md:1438` finding |
|---|---|---|---|
| `cases=7 passed=7` | 0 | **0** | `claimed 5, observed 7, superseded: true` |
| `cases=9 passed=9` | 1 | 2 | `1438: 5 vs 9` counted **and** the round-29 `(7/7)` correction line counted `7 vs 9` |

Raw: `build/c2/c2-sim-cases7.json`, `build/c2/c2-sim-cases9.json`. The prediction is binding: it is
only correct if C1 lands a self-test that reports exactly seven cases.

## 5. Attack on my own drafts

Each variant was applied on top of the corrections commit, committed in the scratch clone, and
scored with the same frozen counter, then reverted (`git reset --hard 5a286cc`).

| Variant | Mutation | exit | `mismatches` | Counted findings |
|---|---|---|---|---|
| A — wrong document (SCORECARD) | correction for `:1138` cites `LOG.md:1138` instead | 1 | 1 | `SCORECARD.md:1138` 12 vs 13 |
| B — wrong number (SCORECARD) | correction for `:1139` states `--selftest` (12/12) | 1 | 2 | `SCORECARD.md:1139` 12 vs 13 **and** the correction line 12 vs 13 |
| C — wrong document (LOG) | LOG paragraph cites `SCORECARD.md:221` | 1 | 1 | `LOG.md:221` 8 vs 12 |
| D — wrong number (LOG) | LOG paragraph states `cases: 8` | 1 | 1 | `LOG.md:221` 8 vs 12 |

Raw: `c2-variantA.json`, `c2-variantB.json`, `c2-variantC.json`, `c2-variantD.json`. Cross-document
citation is dead and a wrong figure clears nothing in either window: the corrections are
load-bearing, not decorative.

## 6. Risks for the integrator

1. **C1's case count is a hard dependency of the `:1438` draft.** If C1 lands `cases != 7` (its claim
   only requires `N >= 7`), the `(7/7)` correction becomes a counted mismatch **and** `:1438` stays
   counted — C2 goes 0 → 2. Reconcile that one line to C1's measured `cases=` token before the C2
   after-measurement.
2. **`:1439` binds the counter's own self-test at 22.** Any round-29 change to
   `check-selfassessment.mjs`'s `CASES` moves that oracle; the frozen sha256 is the guard, and the
   correction line must be re-derived if the counter is re-frozen.
3. **Line numbers are absolute.** All six citations point at base line numbers; append-only
   editing keeps them valid, but any insertion above 1456 or above 1987 in the two documents
   invalidates every citation at once.
4. **The corrections section is `## Round 29 — corrections`, not `— executed disposition`**, so it
   cannot disturb the m3 newest-disposition lookup; keep that heading verbatim.
5. **The drafts say nothing about C1's mutation receipt.** `:1438`'s correction states the count
   only; the mutation-receipt predicate remains C1's to satisfy.

## 7. Scope and tooling

- Wrote only: this report, `build/c2/**`, and scratch under `/fast/scratch/hyaku/tabi-r29/ExecC2DryRun/`
  (one live `git clone --shared` for the measurements, a second for the `:1438` simulation; every
  commit made with `git -C` inside those clones under fixture identity; no other repository
  touched).
- Read-only git in the lane (`log`, `show`, `rev-parse`, `status`). No lane tracked file, index or
  jj state modified; no build/lint/format of the lane; no subagent spawned.
- No tool installs or upgrades were needed (`node v24.21.0` present), so the tooling authorization
  was not exercised.
- All gate runs used `TMPDIR=/fast/scratch/hyaku/tabi-r29/ExecC2DryRun/tmp`; scratch is left in
  place for the integrator's re-check and holds nothing outside that root.

## 8. Post-hoc cross-check against the landed lane tip (advisory, read-only)

While this dry run was in flight, the lane advanced from the base `97be89b` to
`35045d7d9f6cf0bbdc4c734881ab77b48deedb81` through `190052c` (C3), `59e8167` (C1 s106 repair +
a C2 corrections block + registry rows) and `35045d7` (LOG entry). I measured the landed state in a
third clean `--shared` clone of that tip (`git status --porcelain` empty, counter sha256 unchanged at
`7281280…560c4`):

```
cd $S/tip && node scripts/check-selfassessment.mjs --repo "$S/tip" --rev HEAD --json
exit=0  mismatches=0  couldNotEvaluate=92  superseded=12          -> build/c2/c2-lane-tip.json
```

That closes the loop on three things this dry run could only simulate or predict:

1. **The `:1438` prediction is right in production.** The landed `scripts/check-s106-evidence.mjs`
   prints `S106_SELFTEST verdict=clean cases=7 passed=7`, and the landed `(7/7)` correction clears
   `SCORECARD.md:1438` (`claimed 5`, `observed 7`, superseded) — exactly the counter-side result my
   seven-case fixture gate simulated.
2. **The landed wording differs from my draft and also passes.** The landed section is
   `## Round 29 — corrections (append-only; each cites the stale line in its own document)` with
   four bullets: `--selftest` (26/26) for `scripts/check-sources.mjs`; one bullet citing the range
   `SCORECARD.md:1138-1139` plus `SCORECARD.md:1151` for `scripts/round-evidence-audit.mjs`
   (13/13); `scripts/check-selfassessment.mjs` (22/22) at `:1439`; `scripts/check-s106-evidence.mjs`
   (7/7) at `:1438`; and a LOG paragraph `Correction (supersedes LOG.md:221): … measured cases: 12`.
   Both shapes satisfy the frozen supersession rules; mine is one-line-per-citation for auditability,
   the landed one groups the two `round-evidence-audit` lines by range. No change is needed.
3. **Risk 1 in §6 is resolved, risk 2 is not.** C1's repaired gate reports exactly seven cases, so
   the `:1438` draft is consistent with the landing. The `:1439` line remains bound to the counter's
   own 22-case self-test, and the frozen sha256 is still the guard if that counter is ever re-frozen.

Consequence for the integrator: **my drafts are an independent reproduction, not a patch to apply.**
Appending them to the current tip would duplicate the landed corrections (the duplicate lines would
themselves be consistent findings, so the count would not regress, but the documents would carry two
correction blocks for the same lines). Keep the landed block.
