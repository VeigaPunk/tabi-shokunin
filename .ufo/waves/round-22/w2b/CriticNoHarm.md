# CriticNoHarm — round22 w2b (post-crash), revision e3cf4e0d30bb835532ff44b118c5ad52e09eb76d

Author-side static falsification of the no-harm axes only. I did not judge, admit, edit production, or integrate anything.

## Verdict

**No trade at e3cf4e0 on any of the four no-harm axes.** The repair delta `0f24164..e3cf4e0` touches only files that `5f58577..` already added under `.ufo/waves/round-22/`. Every no-harm row in the serial cohort receipt has byte-identical output to the pre-repair receipt, once the revision ID and the random sandbox paths are normalized away.

I found two **pre-existing gate gaps** in `run-checks.py`. Both were committed at 0f24164, and e3cf4e0 does not change them. Both fail open for a *future* revision, but neither is exercised at e3cf4e0, so they are fixable defects, not present harm:

- **G1 (curation census, medium):** nothing guards the non-row content of `corpus/SOURCES.md`.
- **G2 (scope and lesson history, low):** the new-path allowlist uses a prefix match where it should use exact file names.

## Axes and what holds (observed)

| Axis | Result at e3cf4e0 | Same output as at 0f24164? |
|---|---|---|
| Round21 lifecycle counter (`lifecycle21-after`) | `c1_lifecycle_observations` 12, clean, findings `[]` | identical |
| Round20 lifecycle counter (`lifecycle20-after`) | `c1_lifecycle_decisions` 12, clean, same `blobs` pins | identical |
| Curation census (`curation-before` / `curation-after`) | rows 101; tiers A88 B4 C9; statuses mined73 queued19 rejected9; knowledge 40→41 | identical |
| Lesson-history refusal set (`lesson-history-only`) | refused exactly `[corpus/lessons/round-18.md, corpus/lessons/round-19.md]` | identical |
| Historical gates (22 rows from `harm-at-measured.json`) | all recorded exits matched; USER production skipped and disclosed | identical modulo nondeterminism |

Evidence for the table:

- **Receipts.**
  - `.ufo/waves/round-22/checks-at-e3cf4e0.json` (untracked; `revision` = e3cf4e0) reports verdict clean, 35/35.
  - The committed `.ufo/waves/round-22/checks-pre-w2-0f24164.json` reports 33/35. Its only failures are `oracle22-selftest` and `c1-after`, both on the round22 oracle.
  - Both receipts carry `producerSha256` c501034d…68cd. That equals `git show e3cf4e0:.ufo/waves/round-22/run-checks.py | sha256sum`.
  - Both carry `cohortSourceSha256` dc947014…1551.
- **Frozen producer digests** in the receipt match the W1 CriticNoHarm pins:
  - round21 `measure-c1.mjs` 8d992423…
  - round20 `measure-c1.mjs` 19921191…
  - `counts.mjs` fec9a31e…
  - `lesson-history.mjs` a8dade2d…
  - `check-wave.mjs` 9c667b84…
- **Preservation (`run-checks.py:68-109`).**
  - The baseline is now 4865 files: every tracked file at `5f58577` except the six mutable docs (rounds 12–21 waves, `corpus/evidence`, 40 knowledge notes, 46 lessons, `scripts/`, `reports/`, `SHONEN.md`, `PROVINCE.md`).
  - At e3cf4e0: mismatches `[]`, five prefixes true, scopeErrors `[]`, sourceErrors `[]`, gitlinks `[]`, sandbox status empty before and after.
  - This closes W1 F2: a stubbed frozen counter or an edited `harm-at-measured.json` now trips `mismatches` and gives verdict could-not-evaluate.
- **Diff shape `5f58577..e3cf4e0`:** every non-round22-wave row is one of
  - `M` on `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`;
  - `A corpus/evidence/round-22/semantic-expectations.json`;
  - `A corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.

  There are no `D`, `R` or `T` rows, and nothing under `corpus/lessons/`.
- **Why the refusal set cannot drift silently (composite guard).**
  - `lesson-history.mjs:17` refuses any round lesson whose status is not `A` or that has a later M/D/R/T commit. A later round22-lesson edit or a lesson deletion therefore grows `refused`, and the exact-equality check at `run-checks.py:143-145,158` fails.
  - A further edit to `corpus/lessons/round-18.md` keeps `refused` unchanged, but the preservation pin catches it (`run-checks.py:75-76`).
  - At e3cf4e0, round-18 has 2 later M/D/R/T commits and round-19 has 3. Rounds 12–17, 20 and 21 are status `A` with 0, refused false. No round-22 lesson exists yet.
- **Historical-row output differences** between the two receipts are noise, not behavior changes:
  - `check-round-contract-count-witness`, the three `check-user-round-contract-*-witness` rows, `check-aria-metadata-check` and `lifecycle21-selftest` differ only in `/tmp` and `/var/tmp` sandbox names and in fixture commit SHAs that depend on the clock.
  - `check-adjacency-production` differs only in `argv`, which carries the random fleet path; its stdout and stderr bytes are identical.

## Findings

### G1 — Non-row SOURCES content (Paths, Search log, Leads, header prose) has no history guard (pre-existing at 0f24164, unchanged at e3cf4e0; fixable; medium)

- **Where.**
  - `e3cf4e0:.ufo/waves/round-22/run-checks.py:78-81` skips `corpus/SOURCES.md` in the prefix loop.
  - `:88-104` compares only lines matching `^\|\s*S\d{3,}\s*\|`.
  - `scripts/check-sources.mjs:29` only requires the four section headers to exist.
  - `scripts/check-round-contract.mjs:25,316-321` and `scripts/check-user-round-contract.mjs:76` leave SOURCES out of `APPEND_ONLY`.
  - `.ufo/waves/round-20/counts.mjs:11-13` reads only row lines plus the knowledge file count.
- **Smallest counterexample.** Starting from e3cf4e0, rewrite historical search-log line 130 of `corpus/SOURCES.md`, changing `included 4 (S001–S004), excluded 3` to `included 5 (S001–S005), excluded 2`. Or delete a `## Paths` bullet (lines 119–126). Then run `run-checks.py`:
  - `sourceErrors` stays `[]`;
  - the census stays at 101 rows with the same histograms;
  - `check-sources-production` stays exit 0;
  - `check-round-contract-production` stays exit 0;
  - the verdict stays clean, so a round-19-era search-log rewrite passes as "no harm". [INFERENCE: derived from the code paths above; I did not run it, because executing lane scripts is out of bounds.]
- **Positive the fix must keep passing.** The actual change `5f58577..e3cf4e0` has two hunks:
  - `@@ -115 +115 @@` is the S101 used-by cell;
  - `@@ -155,0 +156 @@` is a pure insertion at the end of `## Search log`, before `## Leads (unopened)` at line 158.

  Because that insertion is mid-file, a plain byte-prefix check would wrongly reject this positive.
- **Impacted axes.** Curation census and provenance. The round17–21 source-search history in SOURCES can be rewritten while the census reports unchanged.
- **Smallest fix.** In `run-checks.py`, after the existing row checks, run `difflib.SequenceMatcher(None, before_lines, after_lines).get_opcodes()` on the SOURCES line lists. Accept only these opcodes:
  - `equal`;
  - one 1:1 `replace` whose before-line is the `| S101 |` row (its cells are already checked at `:98-102`);
  - `insert` hunks positioned between the `## Search log` and `## Leads (unopened)` header lines.

  Anything else appends `'non_row_history'` to `source_errors`.

### G2 — `allowed_new` is matched by prefix, so stray files beside the two named round22 files pass scope (pre-existing at 0f24164, unchanged at e3cf4e0; fixable; low)

- **Where.** `e3cf4e0:.ufo/waves/round-22/run-checks.py:83-87` uses `path.startswith(allowed_new)`. Two entries of that tuple are exact file names rather than directories: `corpus/lessons/round-22.md` and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.
- **Smallest counterexample.** Add `corpus/lessons/round-22.md.orig`, or `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md.bak`, holding a rewritten copy of a round-18 lesson. Nothing flags it:
  - `scopeErrors` stays `[]`;
  - `lesson-history.mjs:13` ignores it (its regex is `^corpus/lessons/round-\d+\.md$`);
  - `check-round-contract.mjs:168-169` `protectedPath` ignores it;
  - `counts.mjs:13` ignores it (it counts only `.md`);
  - preservation does not cover new paths;
  - so the cohort stays clean while an unscoped lesson-like file lands in `corpus/lessons/`. [INFERENCE: from code; not run.]
- **Positive the fix must keep passing.** At e3cf4e0, the only non-wave additions are the exact `corpus/evidence/round-22/semantic-expectations.json` and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. A later exact `corpus/lessons/round-22.md` must still pass.
- **Impacted axes.** Scope, lesson history, and curation hygiene. The refusal set itself does not change, because the stray path is outside the checker's regex.
- **Smallest fix.** Split the allowlist into directory prefixes (`.ufo/waves/round-22/`, `corpus/evidence/round-22/`) and an exact-path set (the knowledge note and the round22 lesson). Test the second with `==`, not `startswith`.

## Non-findings (counterexamples tried; the gates hold)

- **Stub a frozen counter or the cohort source.** Caught by the preservation blob and mode pins (W1 F2 closed).
- **Edit an already-refused lesson (round-18 or round-19).** The refused set is unchanged, but preservation catches it.
- **Edit or delete the round-22 lesson after its first commit.** It joins `refused`, and the exact-equality check fails.
- **Flip a tier or status on an unrelated SOURCES row.** Caught twice: `sourceErrors` at `run-checks.py:103-104`, and the census histograms at `:140-142` (W1 F3 closed).
- **Does the repair weaken any no-harm row?**
  - The `c1-before` baseline with the repaired counter is identical (value 0, baseline).
  - The repaired files are round22-only, are counted by no frozen gate, and fall under `allowed_new` `.ufo/waves/round-22/`.
- **Calibration boundary (retained, not a defect).**
  - The skipped red USER production gate is disclosed in the receipt's `skipped` field.
  - "Unchanged USER debt" rests on `lesson-history-only` plus preservation, not on USER production's exit code (W1 F4).
  - The 35/35 receipt for e3cf4e0 is untracked, so it is a working-tree artifact. It is bound to e3cf4e0 only through its `revision` field and its producer digest.

## Exercised commands (all read-only; no lane scripts executed)

| Command | Exit |
|---|---|
| `git log/show/diff --stat` for `0f24164`, `e3cf4e0`, and `5f58577..e3cf4e0` | 0 |
| `git show e3cf4e0:` for `run-checks.py`, `baseline.json`, `census-before.json`, `claim-classification.json`, `study.json`, `w1/CriticNoHarm.md`, `post-crash-repair.json`, `lesson-history.mjs`, `counts.mjs`, `preservation-baseline.json`; `grep` over `check-sources`, `check-round-contract`, `check-user-round-contract`, `check-freshness` | 0 |
| `node -e` JSON summaries and normalized diffs of the two check receipts (data parsing only) | 0 |
| `diff` / `cmp` of normalized row outputs in `/tmp/cnh` (my scratch directory) | 0 |
| `sha256sum` of the working-tree `run-checks.py` vs its e3cf4e0 blob | 0 |
| `git ls-tree` / `git diff --name-status --no-renames 5f58577 e3cf4e0` | 0 |

Not run: `run-checks.py`, any selftest, counter, gate, browser, or USER production. Both counterexamples are inferences from code paths, not executions. No tools were installed or updated. Writes: this report, plus scratch files `/tmp/cnh-pb.json` and `/tmp/cnh/*`.
