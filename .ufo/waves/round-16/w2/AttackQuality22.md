# AttackQuality22 — critic report (round 16, wave 2 FALSIFY)

Seat: TabiR16.AttackQuality22 (author-side critic; not non-author certification).
Target: `corpus/QUALITY.md:78-84` (item 22) at build snapshot `b444ca8e024f386124418169e8e400221524bba3`.
Questions: (a) can the gate enforce it as written; (b) has it been shown able to fail (legacy red, selftest); (c) is it backed by a lesson; (d) would it have caught round-15 routed defects 1 and 2 (`corpus/lessons/round-15-verifier-spotcheck.md:120-121`)?
Lane: read-only. Every mutation and fake commit ran in `/tmp/aq22.1F91` (a `git clone --no-hardlinks` of the lane), and that directory is left in place. Node v24.21.0. No tools were installed.

## Verdict: **BREAKS** — the lesson-backing clause fails; the rest HOLDS with two fixable gaps

| Sub-question | Verdict |
|---|---|
| (a) Enforceable as written | HOLDS, with gaps G1 and G2 below |
| (b) Shown able to fail | HOLDS |
| (c) Lesson-backed | **BREAKS** at the measured snapshot |
| (d) Catches round-15 defects 1 and 2 | HOLDS |

## Evidence

### (a) Enforceability: the exact QUALITY-22 command at the measured revision
```
$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at b444ca8e024f386124418169e8e400221524bba3 --reproduce
MEASUREMENT_BINDING verdict=clean claims=2 bound=2
exit=0
```
Note: `corpus/evidence/round-16/measurement-binding.json` is **untracked** at b444ca8 (`git status --short --ignored` → `?? corpus/evidence/round-16/measurement-binding.json`, mtime 11:57:18, after commit 11:55:15). So the delivered HEAD will necessarily be a later commit.

To test that, I simulated the wrap-up in the clone (checked out b444ca8, copied the manifest in, then committed):
```
WA (manifest + stub corpus/lessons/round-16.md only):
$ node <lane>/scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at bdd71c6f… --reproduce --repo /tmp/aq22.1F91/repo
MEASUREMENT_BINDING verdict=clean claims=2 bound=2   exit=0
WB (WA + one comment line appended to corpus/SOURCES.md):
MEASUREMENT_BINDING verdict=failed claims=2 bound=1
finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md
```
The rule can be enforced at a later delivered HEAD. It also goes red on real drift.

**Operational constraint for L1:** after b444ca8, any wrap-up edit to C2's counted inputs forces a re-measure. Those inputs include `corpus/README.md` and `corpus/SOURCES.md`; one example is adding the round-16 lesson to a SOURCES `used-by` cell, as round 15 did for S029.

### (b) Shown able to fail
- **Selftest:** `node scripts/check-measurement-binding.mjs --self-test` → 43 `PASS` lines, then `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13`, exit=0. This includes the cases `legacy_r15_shape_digest_mismatch` and `counter_digest_unrecorded`.
- **Legacy red on real round-15 history:** `node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at <36240c7 | e38d259 | b444ca8>` → exit=1 at all three revisions. Every run gives `verdict=failed claims=2 bound=0` with these findings:

  | Claim | Findings |
  |---|---|
  | C1 | `counted_inputs_undeclared`, `counter_changed_since_measurement` (3ee59de0 → dd9c8675), `counter_digest_unrecorded` ("pinned only by counterCodeRevision=27dfd98…") |
  | C2 | `counted_inputs_undeclared`, `counter_digest_mismatch` (recorded dd9c8675, blob at b7cf044 = 3ee59de0) |

- **Mutants against the gate** (copies in `/tmp/aq22.1F91/mut`), each run as `node scripts/selftest-measurement-binding.mjs --gate <mutant>`. Every mutant was killed:

  | Mutant | Change | Exit | Failing case |
  |---|---|---|---|
  | m1 | drop the `counter_digest_unrecorded` add | 1 | `counter_digest_unrecorded … actual_exit=0 … FAIL` |
  | m2 | hash the counter at `--at` instead of at measuredRevision (round-15-style identity) | 1 | `counter_digest_mismatch` and `counter_changed_since_measurement` FAIL |
  | m3 | never re-run the after arm at `--at` | 1 | `count_not_reproduced … actual_exit=0 … FAIL` |

- **Retained receipts** `corpus/evidence/round-16/binding/{selftest,legacy-r15}.json` record gateSha256 `5150611c…` and selftestSha256 `8c5426f2…`. `sha256sum` of the worktree files and of `git show b444ca8:scripts/check-measurement-binding.mjs` gives the same digests.
- **Counter oracle:** `node .ufo/waves/round-16/measure.mjs b444ca8… --claim C1` → `{"c1":1,"failures":[],"legacy":{"exit":1,…}}`. Its `inputsRead` equals the declared C1 countedInputs exactly.

### (c) Lesson-backed: **BREAKS**
- `QUALITY.md:83` cites `(lesson: corpus/lessons/round-16.md#mistakes; …)`.
- `git ls-tree b444ca8 corpus/lessons/round-16.md | wc -l` → `0`. The file is also absent from the worktree (`ls corpus/lessons/` shows no `round-16.md`).
- Item 22 was added at `8f7feb3`: `git log -S'counter_digest_unrecorded' -- corpus/QUALITY.md` → `8f7feb3 round-16: measurement-binding gate, …`. So the citation has dangled for two commits, including the measured revision.
- Lane precedent is that a QUALITY item and its lesson land in the same commit:
  - item 21 and `corpus/lessons/round-15.md` → both `b7cf044`;
  - item 19 and `round-14.md` → both `4a300f6` (`git log --diff-filter=A`).
- Round 16 breaks that precedent. Only the planning draft exists (`.ufo/waves/round-16/drafts/DraftLesson.md:4`: "Status of every 'Fix' below: **planned, unrun**").
- **Impact:** the round-16 snapshot that the counters measure states an admission rule whose cited lesson cannot be resolved there. This is a false-provenance pointer and a fixable defect, not a tradeoff.

### (d) Round-15 routed defects 1 and 2: HOLDS
I wrote v1 manifests for round-15 C1 into `/tmp/aq22.1F91/P*.json`:
- counter `.ufo/waves/round-15/measure.mjs`
- argv `[node, path, {REV}, --claim, C1]`
- countedInputs: `user-diagnostics.json` and `check-user-round-contract.mjs`
- before `7054a5e` = 0, after = 1

Each was run with `node <lane>/scripts/check-measurement-binding.mjs --check <P> --at <rev> --repo /tmp/aq22.1F91/repo`.

| Probe | Defect modelled | Exit | Findings |
|---|---|---|---|
| P1: no `sha256`, measured b7cf044, at 36240c7 | 1 (revision-only pin) | 1 | `counter_digest_unrecorded`; `counted_input_changed paths=.ufo/waves/round-15/measure.mjs` |
| P2: sha `3ee59de0…`, measured b7cf044, at 36240c7 | 2 (measured ≠ delivered, counter repaired at 9fd8bca in between) | 1 | `counter_changed_since_measurement recorded=3ee59de0… blob_at_at=dd9c8675…`; `counted_input_changed` |
| P3: sha `dd9c8675…` (counter committed after the measured revision) | QUALITY-22's "digest of a counter committed after" | 1 | `counter_digest_mismatch recorded=dd9c8675… blob_at_measuredRevision=3ee59de0…` |
| P4 (control): sha `3ee59de0…`, measured = at = b7cf044 | — | 0 | `verdict=clean` |

Two qualifications on defect 2:
- **No finding names "measured ≠ delivered" on its own.** `measured_revision_not_ancestor` fires only when measured is not an ancestor, and b7cf044 is an ancestor of 36240c7. Defect 2 is therefore caught through drift findings plus the `--reproduce` re-run at HEAD.
- **That still satisfies the routed remedy.** The lesson asks to "measure at, or explicitly diff to, the delivered HEAD" (`round-15-verifier-spotcheck.md:121`).

## Gaps (fixable; they do not break the item's own wording)

### G1 — counted inputs are self-declared, and the gate ignores the read-set the counter already emits
The counter prints `inputsRead` (`measure.mjs:287`), but `check-measurement-binding.mjs` never compares it with `countedInputs`.

Counterexample in the clone at WB, where SOURCES.md drifted. The C2 countedInputs were narrowed to `["corpus/evidence/round-16/webmcp/fixtures/"]` in `/tmp/aq22.1F91/c2-narrow2.json`:
```
$ node <lane>/scripts/check-measurement-binding.mjs --check /tmp/aq22.1F91/c2-narrow2.json --at HEAD --reproduce --repo /tmp/aq22.1F91/repo
MEASUREMENT_BINDING verdict=clean claims=2 bound=2   exit=0
```
The honest manifest is red at the same HEAD. The counter's own output at that HEAD lists `"corpus/README.md","corpus/SOURCES.md",…` in `inputsRead`.

**Harm:** drift that keeps the count unchanged in an undeclared input admits silently. `--reproduce` still re-verifies the count, so the count itself stays protected; the input binding does not.

**Smallest correction:** under `--reproduce`, when the parsed object carries `inputsRead`, require every path to be covered by `countedInputs ∪ {counter.path}`. Report uncovered paths as `counted_inputs_undeclared`, and add one selftest case with a matching control.

### G2 — the gate cannot see a claim that is left out of the manifest
`/tmp/aq22.1F91/only-c1.json` is the round-16 manifest with C2 dropped:
```
$ node scripts/check-measurement-binding.mjs --check /tmp/aq22.1F91/only-c1.json --at b444ca8e… --reproduce
MEASUREMENT_BINDING verdict=clean claims=1 bound=1   exit=0
```
- No script ties the claim set in SCORECARD to the manifest. `grep 'measurement-binding' scripts/` → only the gate and its selftest. `check-round-contract.mjs` does not invoke the gate.
- QUALITY 22 also says nothing about manifest completeness.

**Smallest correction:** add one clause to item 22: "every SCORECARD counted claim id for the round appears in the manifest". Optionally add a gate flag such as `--claims C1,C2` that fails on missing or extra ids.

## Smallest safe correction for the BREAK
Before delivery, land `corpus/lessons/round-16.md` with a `## Mistakes` row for routed defects 1 and 2. Probe WA shows that a commit adding only the manifest and the lesson keeps the gate `clean` (exit 0) at the new HEAD. If the commit also edits `corpus/README.md`, `corpus/SOURCES.md` or another C2 input, re-measure and update `measuredRevision`, because probe WB shows that turns the gate red.

## Impacted axes
- **quality:** the admission bar cites a lesson that is absent at the measured snapshot.
- **discernment:** G1 and G2 show the gate trusts the declared input set and the manifest's claim set.
- **operability (C1):** unaffected. The counted gate behaviour holds on every probe.

## Not run
- Nothing at the real delivered HEAD, which does not exist yet.
- No harness run.
- No source re-opens; this item needed none.
