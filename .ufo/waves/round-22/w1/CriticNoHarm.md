# CriticNoHarm — round22 W1 (frozen gates / producer / raw / lessons / inherited USER debt)

Read-only critic. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, baseline
`5f585773258b33d2d514b00cd0b0775333578db6`. The design I reviewed was the live L1 working tree at about 14:55Z:
`LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`,
`corpus/SOURCES.md` modified; untracked `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`,
`.ufo/waves/round-22/run-checks.py`, `.ufo/waves/round-22/preservation-baseline.json`,
`.ufo/waves/round-22/round21-closure.json`. The clones held no commits yet, so no oracle, selftest or classifier bytes existed for me to review.

Exercised (read-only only): `git diff`/`ls-tree`/`log`/`show`, `sha256sum`, and `node -e` JSON
parsing. I did not run any gate, selftest, counter, probe, build, browser, network or install. No tools were installed or updated.

## Axes

- **Preservation (no-harm):** frozen old gates, producer, raw acquisition, lessons and notes stay byte-identical.
- **Calibration:** the inherited red USER gate stays disclosed. A green cohort must not be read as proof of more than it checks.
- **Provenance:** copied closure and binding statements stay truthful at the new tip.

## What already holds in the current worktree (observed)

- Every tracked path under `.ufo/waves/round-19`, `round-20`, `round-21`, `corpus/lessons`,
  `corpus/evidence`, `corpus/knowledge`, `scripts`, `reports`, `SHONEN.md` and `PROVINCE.md` is unchanged vs HEAD
  (`git diff --quiet HEAD -- …` succeeded). No untracked files were added under those prefixes.
- The six APPEND_ONLY docs keep exact byte prefixes vs both `5f58577` and the gate baseline
  `7f506affa55f6fb892d3c8073c75151c998bdf2c`: `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`,
  `corpus/QUALITY.md`, `corpus/README.md`.
- `corpus/SOURCES.md`: only the S101 row changed, and only its used-by cell. That cell appended
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` and still lists both round21 notes. The row still has 13 `|`-fields.
- The new note's first line is `source: S101 — …`. It contains `S101`, so check-sources `used_by_uncited` will not fire.
- `.ufo/waves/round-22/round21-closure.json` is JSON deep-equal (same key order) to fleet
  `MANIFEST.json rounds[417]` at fleet commit `2dd025425c247c6fbce4ae6dac53027e30d4e492`.
- Frozen digests at the working tree:
  - Round21 counter `.ufo/waves/round-21/measure-c1.mjs`: `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`
  - Round21 selftest `.ufo/waves/round-21/selftest-c1.mjs`: `1fa3d8278e4b74ef4fd4e886dbf551a21c16de663e490709030247b3fd29c953`
  - Producer `scripts/webmcp-lifecycle-round21.mjs`: `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`
  - `.ufo/waves/round-20/measure-c1.mjs`: `19921191fad84ba79414188e1a7b1bc05acdb491b1e6052ed5b70454864f7945`
  - `.ufo/waves/round-20/counts.mjs`: `fec9a31eadbed3b43f75250a6033d53633601c308d01ff56ee66b59a4711df79`
  - `.ufo/waves/round-20/lesson-history.mjs`: `a8dade2deed3eab7d54c26576c2d604852b35757a076578c0c08b535eeb9bdc7`
  - `.ufo/waves/round-20/check-wave.mjs`: `9c667b84522a65abed12af2b19c2347f63f350bdeba7214b963bc270f7983f12`
  - Cohort source `.ufo/waves/round-19/final/harm-at-measured.json`: `dc947014d18e9495ea85f226bf9dca1636459b26452d1843a8ee5ea4046e1551`
  - Corrected round21 note: `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4`
  - Original round21 note: `8c9be28c7becea24b8ea588f54d8962af3ea665f479d98eb4b984bc6b7215d2c`
  - Round20 note: `3c8302c08e27e6c3033405a854a623c784e17bc4e9a138b325ee8e382b919980`
  - `corpus/lessons/round-20.md`: `6339fda683b8c4fe384543eaa2179969a566aebf4b678319218e5c2625b4d140`
  - `corpus/lessons/round-21.md`: `e2a28794ad83559c0843c4162520ef78dbe8e3859060c6f028fc5ba661e5517c`

These are facts about the worktree only. The defects below are about what the **planned checks**
would or would not catch at the final revision.

## Findings

### F1 — Lesson drift for rounds 12–22 has no checker in the planned cohort (fixable defect, high)

- **Counterexample:** append a "W1 wake-history correction" paragraph to `corpus/lessons/round-21.md`.
  Equally, edit `corpus/lessons/round-22.md` again after its first commit, as round21 did with follow-up
  binding commits. Then run `.ufo/waves/round-22/run-checks.py FINAL`. Every row still passes.
- **Evidence:**
  - `run-checks.py` skips `check-user-round-contract-production`, which is the only gate holding `lessonDrift`
    (`scripts/check-user-round-contract.mjs:333-342`, reached through the pstack diff at `:407-418`).
  - The green `check-round-contract-production` protects only `corpus/lessons/round-\d+.md` files present at
    `7f506af` (`scripts/check-round-contract.mjs:168-176,308-313`). `git ls-tree 7f506af -- corpus/lessons`
    lists only round-1 to round-10.
  - Freshness covers only notes, reports and SKILL at `c24eaea` (`scripts/check-freshness.mjs:78`).
  - `.ufo/waves/round-20/lesson-history.mjs` is not in the `run-checks.py` cohort.
  - `preservation-baseline.json` pins 46 lesson blobs, but nothing in `.ufo/waves/round-22/` reads it.
    `run-checks.py` never opens it.
- **Impact:** preservation, calibration. The inherited USER debt could silently grow beyond
  round18/round19 while the round reports "unchanged".
- **Smallest safe correction:** add two rows to `run-checks.py`.
  1. A `lesson-history` row: `node .ufo/waves/round-20/lesson-history.mjs FINAL`, expected exit 0, `refused` exactly
     `["corpus/lessons/round-18.md","corpus/lessons/round-19.md"]`, and `corpus/lessons/round-22.md` with
     `status:"A"`, `laterMDRTCommits:[]`.
  2. A preservation row that checks every `preservation-baseline.json` entry's blob and mode at FINAL.
  Commit the round22 lesson exactly once. Put any post-lesson binding in new files only.

### F2 — The preservation set omits the very gates and counted inputs the no-harm rows depend on (fixable defect, high)

- **Counterexample A:** replace `.ufo/waves/round-20/measure-c1.mjs` with a stub that prints
  `{"c1_lifecycle_decisions":12,"verdict":"clean"}`. `lifecycle20-after` still passes:
  `run-checks.py` records `producerSha256` but compares it to no expected value.
  The same applies to `counts.mjs`, `check-wave.mjs`, `lesson-history.mjs` and the cohort source
  `.ufo/waves/round-19/final/harm-at-measured.json`. Editing that file to drop a gate silently shrinks the cohort.
- **Counterexample B:** rewrite the body of `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`,
  for example changing the population prose, while keeping the `source:` line and the 12 backticked case IDs.
  The frozen round21 counter reads only the first line and the case-ID tokens from the note
  (`.ufo/waves/round-21/measure-c1.mjs:94-104`), so `lifecycle21-after` stays clean at 12.
  Freshness does not cover round20/21 notes (its baseline `c24eaea` has 23 notes).
  `preservation-baseline.json` contains no `corpus/knowledge/` path at all.
- **Evidence:** `preservation-baseline.json` has 356 entries:
  - 263 under `.ufo/waves/round-21`
  - 27 under `corpus/evidence/round-21`
  - 46 under `corpus/lessons`
  - 20 under `scripts/`

  It has no entries for `.ufo/waves/round-19/` or `round-20/`, `corpus/evidence/round-20/`,
  `corpus/knowledge/`, `SHONEN.md` or `reports/`. Of round21's 33 counted inputs plus counter
  (`.ufo/waves/round-21/measurement-binding.json`), three are not preserved: `SKILL.md`, `corpus/SOURCES.md` and the corrected note.
- **Impact:** preservation, provenance.
- **Smallest safe correction:** replace the allowlist-of-preserved with a deny-by-default diff:
  `git diff --no-renames --name-status 5f58577 FINAL` may contain only `A` rows for new round22 paths,
  plus `M` rows for exactly `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md` and
  `corpus/SOURCES.md`. Additionally assert the expected sha256 of each cohort producer and of `harm-at-measured.json`, using the values listed above.

### F3 — The SOURCES mutable-cell bound is only half asserted (fixable, medium)

- **Counterexample:** flip some unrelated row's status from `queued` to `mined`, or a tier from `B` to `A`,
  in the same edit. `curation-after` checks only `rows:101` and `knowledge:41` (`run-checks.py` census loop),
  so it passes.
- **Correction:**
  - Add expected `tiers {A:88,B:4,C:9}` and `statuses {mined:73,queued:19,rejected:9}` to both census rows.
    These are the closure's round21-after values.
  - Assert the SOURCES diff is exactly one changed line, `^| S101 |`, with fields 1–10 and 12 byte-equal and
    field 11 extended by the new note path only.

### F4 — The red USER gate masks new history rewrites (tradeoff; already mitigated — retain the mitigation)

- **Counterexample:** if a round22 edit broke an APPEND_ONLY prefix, USER production would still exit 1 with
  finding `history_rewritten` (`scripts/check-user-round-contract.mjs:401-406`). That is the same exit and the same
  finding id as the inherited lessonDrift refusal, so its exit code cannot reveal new harm.
- **Mitigation present:** green `check-round-contract-production` runs the identical APPEND_ONLY loop against the same
  `7f506af` baseline (`scripts/check-round-contract.mjs:316-321`).
- **Boundary:** that row is load-bearing and must remain in the cohort with expected exit 0. Also keep the direct
  prefix check vs `5f58577` for all six docs, as in round21's `corpus-prefix-preservation`. Never infer
  "unchanged USER debt" from USER production's exit code.

### F5 — The round21 "33 counted inputs unchanged" statement stops being true at the round22 tip (provenance; wording-only fix)

- `SKILL.md` and `corpus/SOURCES.md` are two of round21's counted inputs, and both change this round.
- This is not harm: the round21 binding is pinned `--at 2d5eaaa…`.
- Any round22 statement must say:
  - which 31 counted inputs plus the counter are unchanged, and
  - that the frozen counter re-evaluated at FINAL is clean 12 (`lifecycle21-after`).
- It must not say that round21's binding inputs are unchanged.

### F6 — Nested private clones are embeddable (fixable, medium)

- **Evidence:** `.ufo/waves/round-22/clones/{BuildDebt,BuildOracle,BuildSelftest}/.git` exist. `.gitignore` ignores only
  `.ufo/interactive-sessions/`.
- **Counterexample:** a broad `git add .ufo/waves/round-22` would commit three gitlinks (mode 160000).
  That produces non-reproducible inputs and a false "imported blob" story.
- **Boundary:** the FINAL tree has zero `160000` entries (HEAD has 0) and no path under `.ufo/waves/round-22/clones/`.
  Import fixed blobs by explicit path only.

### F7 — Inherited debt is not restated in the round22 appends (calibration, low; fixable)

- The round22 sections in `LOG.md`, `SCORECARD.md`, the note, `corpus/README.md`, `corpus/QUALITY.md` and `SKILL.md` never state that:
  - USER production remains red (lessonDrift refuses round18/round19, not rerun, not repaired), and
  - the two inherited round17 lease/scope L0 questions remain open.
- Only the `run-checks.py` `skipped` entry carries the USER part.
- **Correction:** add one appended sentence in the round22 LOG/SCORECARD/report.
- Related wording: SCORECARD says the defects "are corrected append-only". Pair it with the note's wording,
  "retained as debt … not relabeled as clean actor settlement", so the passage cannot be read as settlement.

### F8 — The closure copy has no provenance pin inside the lane (provenance, low)

- `round21-closure.json` is a JSON re-serialization, not a byte copy. The lane records no fleet commit or digest for it.
- **Correction:** record `MANIFEST.json` fleet commit `2dd025425c247c6fbce4ae6dac53027e30d4e492`, the pointer
  `/rounds/417`, and the sha256 of the retained file in a round22 receipt. Call it "JSON-equal copy", never "byte copy".

### F9 — Placement constraint for new evidence (holds now; keep it)

- `.ufo/waves/round-21/measure-c1.mjs:68-70` fails `execution_binding` if any path under
  `corpus/evidence/round-21/runtime/` is not a key of the finalized execution artifacts.
- **Boundary:** `git ls-tree -r FINAL -- corpus/evidence/round-21/` equals the 27 baseline paths. New expectations stay under
  `corpus/evidence/round-22/`.

## Acceptance boundary L1 must retain (beyond green exits)

1. **Diff shape** `5f58577..FINAL`: `A` rows for new round22 paths only, and `M` rows only for the six docs plus SOURCES. No `D`, `R` or `T`.
2. **Exact prefixes** vs `5f58577` and vs `7f506af` for `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md`, `corpus/README.md`.
3. **SOURCES:** only the S101 used-by cell changed. Rows 101; tiers and statuses histograms unchanged.
4. **Blob identity:** every `preservation-baseline.json` entry, plus everything in `.ufo/waves/round-19`, `round-20`, `corpus/evidence/round-20`,
   all 40 baseline `corpus/knowledge/*.md`, `SHONEN.md` and `reports/`, with the producer and counter digests above.
5. **Lesson history at FINAL:** `lesson-history.mjs FINAL` refuses exactly round-18 and round-19. The round-22 lesson has
   status `A` and no later MDRT commits. Do not run USER production.
6. **Frozen counters at FINAL:** `lifecycle21-after` returns `c1_lifecycle_observations:12` clean, and `lifecycle20-after` returns `c1_lifecycle_decisions:12` clean.
   Run these from preserved bytes only.
7. **Load-bearing prefix guard:** `check-round-contract-production` exit 0 is the load-bearing APPEND_ONLY guard. The other 21 historical rows keep their recorded exits.
8. **Tree hygiene:** no gitlinks and no `.ufo/waves/round-22/clones/` in the FINAL tree.
9. **Round22 text** states that USER production stays red and skipped, and that round17 L0 questions stay open. Round21 text
   (closure copy, fleet report `.ufo/reports/round-21/tabi.md`, lessons, `w1-*`/`w2-*` records) stays byte-unchanged; corrections live only in new round22 files.

Failure of 1–6 or 8 means harm is present or unproven, and the canonical judge must reject. Items 7 and 9 are calibration
requirements whose absence leaves the no-harm claim unsupported, not falsified.
