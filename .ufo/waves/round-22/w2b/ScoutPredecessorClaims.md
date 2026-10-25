# Scout — predecessor claims: round22 LOG/SCORECARD numbers

Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed).
Files reviewed in that revision: `LOG.md:1496-1577` and `SCORECARD.md:1043-1069`, read with
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0:PATH`.
Static review only: no lane script execution, no browser, no installs, no VCS mutation.
Working-tree files were read only where explicitly marked; all other evidence is from `e3cf4e0`.

## Result

| Named number | LOG line | Verdict | Evidence |
|---|---|---|---|
| 64 seats | `LOG.md:1514`, `:1521`, `:1568` | **supported** for the W1 wave; W2's configured 64 spawned 0 | `w1-validation.json:17,25`; `dispatch-label-check.json:2,4`; `w1-outcomes.json:3-4`; `w1-returns.json:8` |
| 72 error events | `LOG.md:1570-1571` | **supported exactly**, including 3/22/24/23 | `w1-event-history.json` (72 `assistant-error`); `w1-outcomes.json:6,8-11` |
| 42 CLI cases | `LOG.md:1561` | **not supported at e3cf4e0**: the revision has 44; 42 is the pre-repair total; "not yet exercised" is also false at the revision | **F1** below |
| 17 chronology controls | `LOG.md:1562` | **supported exactly** | `debt-expectations.json:3-935` (17 cases); `checks-pre...:389` and `checks-at...:389` (17 cases pass) |

One secondary provenance gap (F2) is outside the four numbers but the review boundary cites the
affected file. One non-numeric untraced detail is noted at the end.

---

## F1 — `LOG.md:1561-1562`: 42-case count and "not yet exercised" describe `0f24164`, not `e3cf4e0`

**Severity:** low (durable-ledger inconsistency; not production/browser behavior).
**Confidence:** high on the count and status discrepancy; medium only on whether the sentence was
intended as a deliberately historical snapshot, because no such qualifier is present.

**Observed (revision `e3cf4e0`):**

- `LOG.md:1561-1562` says: "Independent CLI expectations were authored for42 semantic controls
  and17 chronology/history controls. They are not yet exercised."
- `e3cf4e0:.ufo/waves/round-22/fixtures/expected.json:4` contains **44** cases:
  2 exit 0 (`positive`, `baseline`), 40 exit 1, 2 exit 2 (`revision-short`, `revision-missing`).
  The two repair-added cases are at lines 285 (`native-landing-errors`, finding `semantic_error`)
  and 296 (`native-landing-wrong-query`, finding `semantic_navigation`).
- `e3cf4e0:.ufo/waves/round-22/selftest-repair-sandbox.json:1` reports
  `"verdict":"clean","cases":44,"passed":44` (44/44, all reports pass).
- `e3cf4e0:.ufo/waves/round-22/checks-pre-w2-0f24164.json:373-388` records the earlier
  `oracle22-selftest` run at revision `0f24164`: exit 1, stdout `"cases":42,"passed":41`,
  producer sha `76b47e…` (the pre-repair `measure-c1.mjs`).
- `0f24164:.ufo/waves/round-22/fixtures/expected.json` contains exactly **42** cases
  (2 exit 0, 38 exit 1, 2 exit 2); `selftest-pre-repair-0f24164.json:1` likewise says
  `"cases":42,"passed":41`.
- `e3cf4e0:.ufo/waves/round-22/post-crash-repair.json:42-44` records the two added controls;
  `:73` `filesAfter` digests match the committed repaired files (verified below).
- `LOG.md` and `SCORECARD.md` were last changed at `0f24164`; `git diff --name-only 0f24164 e3cf4e0
  -- LOG.md SCORECARD.md` is empty. The repair commit changed the fixture/producer and added the
  receipts but did not update the ledger sentence.

**Smallest counterexample:** one read of the review-revision fixture:

```
git show e3cf4e0:.ufo/waves/round-22/fixtures/expected.json | python3 -c \
  'import json,sys; print(len(json.load(sys.stdin)["cases"]))'
# 44   (the LOG says 42)
```

**Preserving positive:** the adjacent number in the same sentence is exact: 17 chronology cases are
present in `debt-expectations.json:3-935` and pass in both receipts (`checks-pre...:389`,
`checks-at...:389`). The 64 and 72 numbers are also exact (below). The pre-repair receipt explains
where 42 came from; it is not a fabricated number, it is a stale one. The coincidence that
`44 - 2 revision_input = 42` is not a stable "semantic controls" definition: at `0f24164` the same
subtraction gives 40, and `semantic_*` cases are 26 pre-repair and 28 post-repair, not 42.

**Smallest fix:** update `LOG.md:1561-1562` (append-only alternative: add a post-crash-repair
subsection and label it pre-w2b) to say 44 CLI cases, note that 42 was the `0f24164` total and the
repair added `native-landing-errors` and `native-landing-wrong-query`, and replace
"They are not yet exercised" with the exercised receipts: 41/42 at `0f24164`
(`checks-pre-w2-0f24164.json`), 44/44 in the repair sandbox
(`selftest-repair-sandbox.json`), serial cohort 33/35 at `0f24164` and 35/35 at `e3cf4e0`
(`checks-at-e3cf4e0.json`; see F2). If "No tests/builds/formatters/browser execution were run"
(`LOG.md:1577`) is meant to include oracle selftests, that sentence is stale for the same reason;
the unambiguous defect is the "not yet exercised" clause.

---

## F2 — boundary provenance: `checks-at-e3cf4e0.json` is not in the review revision

**Severity:** low/medium for evidence provenance; not a LOG/SCORECARD number.
**Confidence:** high on absence; I did not re-run the cohort, so I make no claim about whether the
run occurred beyond what the file itself records.

- The review boundary cites `.ufo/waves/round-22/checks-at-e3cf4e0.json` (35/35).
- At `e3cf4e0` the path does not exist: `git ls-tree e3cf4e0 -- .ufo/waves/round-22/checks-at-e3cf4e0.json`
  is empty and `git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` exits **128**.
  `git log --all -- .ufo/waves/round-22/checks-at-e3cf4e0.json` shows no commit.
- The working-tree file exists (490,406 bytes, mtime 13:39 vs commit 13:38), with
  `"revision":"e3cf4e0…"`, `"verdict":"clean"`, 35 runs / 35 pass, `c1-after` value 12,
  `producerSha256` `c501034d…` equal to `run-checks.py` at both `0f24164` and `e3cf4e0`.
  The committed revision retains only the failing pre-repair receipt
  `checks-pre-w2-0f24164.json` (33/35) and the sandbox receipt (44/44).
- Consequence: the post-repair 35/35 result and the achieved `c1-after=12` at `e3cf4e0` are
  working-tree-only. The LOG/SCORECARD word 12 as a target/declaration, so this does not falsify
  the four named numbers; it does mean a reviewer using only committed bytes cannot verify the
  boundary's 35/35 claim.

**Smallest fix:** commit the receipt (or a digest-pinned copy) in a later commit explicitly labeled
post-w2b, or cite it as uncommitted working-tree evidence with its sha256; do not present it as part
of `e3cf4e0`.

---

## Confirmed numbers (positive traces)

- **64 seats / 64 IDs / label `tabi-r22-w1`** (`LOG.md:1514,1521`):
  `w1-validation.json:17` `"spawn":64`, `:23` registry path `.ufo/waves/round-22/w1/swarm-registry.json`,
  `:25` 64 members; `dispatch-label-check.json:2` wave and registryWave `tabi-r22-w1`,
  `:4` 64 ids; `w1-spawn-result.json` progress list 64 and text "Spawned 64 background agents";
  `slot-receipts.json` acquire argv seats 64.
  Scope note: the W2 wave also configured 64 (`w2-spec.json` items 64; `w2-validation.json` counts
  spawn 64) but spawned 0 (`w2-spawn-result.json` "Failed to start… Background job limit reached
  (100)"; `w2-capacity-events.json` `spawnedSeats:0`). `LOG.md:1514`'s "dispatched" is the W1 wave;
  no LOG/SCORECARD line claims W2 spawned.
- **64 completed stop outputs / 64 hashed reports** (`LOG.md:1568`):
  `w1-event-history.json` has 64 seats, 64 `transcriptSha256`, and 64 `lastAssistant.stopReason:"stop"`;
  `w1-returns.json:8` has 64 seats, 64 unique `reportPath`, 64 `reportSha256` — all 64 report
  hashes match the committed report blobs at `e3cf4e0` (0 missing, 0 mismatched, recomputed read-only);
  `w1-outcomes.json:3-4` `freshSeats:64`, `completedStopSnapshots:64`, `deadSeats:0`,
  `replacementSeats:0`.
- **72 assistant error events; 3/22/24/23** (`LOG.md:1570-1571`):
  `w1-event-history.json` event kinds are `assistant-error:72`, `session_exit:63`, `message:7`;
  `w1-outcomes.json:6` `assistantErrorEvents:72`, `:8-11` `native_inflight_message:3`,
  `weekly_rate_limit:22`, `devin_resource_exhausted:24`, the type=1302 message count 23.
  Message-based classification sums to 72 exactly; all 72 have `stopReason:"error"`.
- **7 peer messages; 63 dispose records; ReviewChronology returned but not disposed**
  (`LOG.md:1572-1573`): 7 `message` events, all `broadcast:false` (so "no broadcast" is supported);
  63 `session_exit` records all with `reason:"dispose"`; the only seat with no `sessionExits` is
  `TabiR22.ReviewChronology`, whose `lastAssistant` is `stop` at 15:31:56Z;
  `w1-outcomes.json:16-17` `notYetDisposedAtSnapshot:["TabiR22.ReviewChronology"]`; 63 + 1 = 64.
  "Live" is supported only as transcript message events, not by a separate delivery receipt.
- **17 chronology/history controls** (`LOG.md:1562`): `debt-expectations.json:3-935` has 17 cases
  (last at line 876, `finish_before_start`); `checks-pre...:389` and `checks-at...:389`
  `chronology22-selftest` each report 17 cases, all pass.
- **12 old/final identity contrasts** (`LOG.md:1564`): `historical-review-contrast.json:21-122`
  has 12 cases; `identityClassification` at `:20`; all 12 have `invocationSame:false`,
  `nonceSame:false`, and different raw sha256 (0 same).
- **`MANIFEST.json` rounds[417]** (`LOG.md:1498`): `/home/vgpnk/Projects/shokunin/MANIFEST.json`
  `rounds[417]` is the tabi round21 closure and is JSON-equal to
  `.ufo/waves/round-22/round21-closure.json` (verified by object equality). External-file caveat:
  the index is not revision-retained and has no pinned digest; it is currently correct.
- **Three private writers** (`LOG.md:1549`): `writer-imports.json` has exactly 3 entries
  (`BuildOracle:3`, `BuildSelftest:31`, `BuildDebt:59`), each with base/commit/assigned paths.
- **target 0→12, scalar 8→8, population 12→12** (`LOG.md:1505-1506,1532`;
  `SCORECARD.md:1045-1051,1063-1066`): `baseline.json:2` revision `5f58577…`, `:9` before 0,
  `:10` target 12, `:11-12` scalar 8/8; `round21-closure.json:23-30` claims after 12 / scalar 8;
  `historical-review-contrast.json` 12 cases. These are declarations, not achieved measurements;
  the achieved 12 at `e3cf4e0` depends on F2's untracked receipt (the committed repair sandbox
  shows value 12 only for a /tmp clone at `0f24164` with the repaired oracle).
- **saturation8 / window3** (`SCORECARD.md:1056`): lane self-declaration inherited from earlier
  SCORECARD text (e.g. `:523`, "Saturation line8 and window3 retained") under the `AXES.md`
  §stagnation-nudge contract (fleet `AXES.md:66-73`). These are score conventions, not round22
  evidence counts; no contradiction found. Likewise `tie8` (`:1046,1065`) is a lane score
  declaration, not an evidence count.

## Ancillary untraced detail (not one of the four numbers)

`LOG.md:1520` says the registry CLI "first refused an absolute path (`invalid_registry_path`)".
No round22 receipt at `e3cf4e0` records that refusal: `git grep -n invalid_registry_path e3cf4e0`
returns only `LOG.md:1520` and a round13 precedent (`.ufo/waves/round-13/w1/wave-receipt.json:53`).
The numbered part of the sentence — 64 IDs bound with label `tabi-r22-w1` — is supported
(above). Smallest fix: retain the refusal output next to `dispatch-label-check.json` or drop the
parenthetical.

## Commands exercised (read-only)

- `git -C … show e3cf4e0:PATH` for all production/evidence reads — exit 0.
- `git show 0f24164:.ufo/waves/round-22/fixtures/expected.json` — exit 0; 42 cases.
- `git diff --name-only 0f24164 e3cf4e0 -- LOG.md SCORECARD.md` — exit 0, empty (docs unchanged by repair).
- `git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` — exit **128** (F2 absence).
- Python 3 JSON parsing/counting over the above files — exit 0; no lane script executed.
- Python 3 SHA-256 recomputation of all 64 W1 report blobs at `e3cf4e0` against
  `w1-returns.json.reportSha256` — 0 missing, 0 mismatched. Repair `filesAfter` digests also match.
- No installs, no service/browser, no delegation, no writes outside this report, no VCS mutation.

## Unrun checks

- Did not execute `measure-c1.mjs`, `selftest-c1.mjs`, `check-review-chronology.mjs`,
  `run-checks.py`, or any lane script; all results above come from retained receipts or static
  parsing.
- Did not re-run the 33/35 or 35/35 serial cohorts; F2 is an absence check, not a reproduction.
- Did not recompute the 64 external transcript SHA-256 values (transcripts live outside the lane);
  I did recompute the 64 in-repo report hashes.
- Did not evaluate browser/raw lifecycle semantics; this report covers ledger counts only.

## Remaining unknowns

- Whether `LOG.md:1561` was intentionally a pre-repair historical snapshot. It has no qualifier,
  and its next sentence was false at `e3cf4e0`; the repair commit did not touch the docs.
- Whether the 35/35 working-tree receipt will be committed in a post-w2b repair (F2).
- Whether "live" peer messages have delivery evidence beyond the retained transcript events.
- W2's refusal accounting is adjacent and not investigated here; other seats own W2 outcomes.

Report: .ufo/waves/round-22/w2b/ScoutPredecessorClaims.md
