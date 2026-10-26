# CritCorrections — round 33 (attempt 1), wave 2 — SCORECARD/LOG round-33 sections and corrections

**Verdict: mostly holds, with five defects.** The three 27 → 44 tally corrections are correct in all three
documents, the declared-claims block matches `claims.json` on every predicate, before value, counting
command and control, and the two named corrections (round-32 `feasibilityDisclosed`, round-33 `notClaimed`
assimilation) quote their targets verbatim and are supported by the named reports. What does not hold:
(a) both round-33 sections claim **every** baseline receipt was frozen in `e6b0a90`, but the seven
`baseline/measure-at-baseline/` receipts — including the C1/C2 "Before" cells of the declared table — were
added at `bf48b81` (defect, medium: the freeze-before-data claim is false for the files the table's
receipts cite); (b) the SCORECARD corrections header attributes the `44/44` figure to "the round-33 freeze",
where the gate is still v1 and prints 27 (defect, medium: wrong oracle provenance; LOG's version of the
same correction gets it right); (c) the LOG errata-intake correction miscounts the carried set — "dispositioned
19 of the 27 … remain-count is 20 of 27" is arithmetically impossible and contradicts the wave-1 derivation
(7 closed, 20 carried) (defect, medium: a correction that introduces a false count is worse than the line it
corrects); (d) SCORECARD:1762 cites the `SOURCES_GATE` line to `baseline/census-start.txt`, which contains no
such line (defect, low; the figure is true); (e) LOG:2243-2244 says the five frozen digests are the five
`provenance-b7d16fb.txt` records — it records three of them plus two different scripts (defect, low).
Separately, the round's **no-harm leg fails at the only measured revision**: `measure/noharm-at-bf48b81.txt:8`
records `check-selfassessment … exit=1 … mismatches=1`, while `claims.json:noHarmRule` requires mismatches 0
at REV; the repair commit `042d6d9` carries no measurement receipt (defect, medium, conditional on which
revision the closure reports). I reproduce `mismatches 0, exit 0` at `042d6d9` myself, so the state is true
but unreceipted. Nothing here changes a C1/C2 predicate reading.

## Evidence

Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone`, `checkout --detach
042d6d9abf97d567d495652a85eabc851b81adc1`; `git rev-parse HEAD` = `042d6d9…`, toplevel =
`/fast/scratch/hyaku/tabi-r33/CritCorrections/clone` (exit 0). Every lane script ran only there.

### D1 — "every baseline receipt landed in that same freeze commit" (defect, medium)

- `LOG.md:2236-2237`: "`measure.sh`, the control driver, the 52-line candidate list and **every baseline
  receipt** landed in that same freeze commit"; `SCORECARD.md:1698-1699`: "… the 52-line candidate list and
  **every baseline receipt** frozen in `e6b0a907…` before any claim data (… including the receipts
  `.ufo/waves/round-33/baseline/`)".
- `git diff --name-status e6b0a907… 042d6d9… -- .ufo/waves/round-33/baseline/` (exit 0) prints seven `A`
  entries: `measure-at-baseline/{c1-at-b7d16fb.json,c1-at-b7d16fb.stderr,c2-at-b7d16fb.json,
  c2-at-b7d16fb.stderr,noharm-at-b7d16fb.txt,provenance-b7d16fb.txt,selfassessment-at-b7d16fb.json}`.
  `git log --oneline -1 042d6d9… -- <each>` gives `bf48b81` for all seven.
- `git ls-tree -r --name-only e6b0a90… .ufo/waves/round-33/baseline/` has no `measure-at-baseline/` entry
  (25 files: the seven control triples, `c1-candidates.tsv`, `census-start.txt`, `controls-summary.json`,
  `controls.mjs`).
- These are the very receipts the declared table cites as its before readings
  (`SCORECARD.md:1719`/`:1720`: `baseline/measure-at-baseline/c1-at-b7d16fb.json`, `…c2-at-b7d16fb.json`),
  so the sentence's subject is not a different file class.
- The readings themselves are sound: I re-ran both frozen counters at `b7d16fb8` with
  `--repo <clone> --fleet /home/vgpnk/Projects/shokunin` and reproduced
  `{predicate:false, candidates:52, mapped:5, screened:0, unaccounted:47, newMapped:0, adjacency rows 10
  verified 10}` **exit 1** and `{predicate:false, honest H0/H1/H2 true, forgeriesAccepted 8,
  selftest exit 0 cases=27, digestLiterals []}` **exit 1** — byte-for-byte the committed before files.
  Smallest safe correction: replace "every baseline receipt" with the actual freeze contents (counters,
  `measure.sh`, control driver, candidate list, seven control captures with their `.provenance`,
  `census-start.txt`) and record that `measure-at-baseline/` landed at `bf48b81` from the freeze-commit
  counters (the provenance file's `at-rev e3b0c442…` empties already show the counters do not exist at
  `b7d16fb`).

### D2 — corrections header's oracle provenance (defect, medium)

- `SCORECARD.md:1781`: "Measured at the round-33 freeze by the gate's own `--selftest` summary line".
- At the freeze commit the gate is v1: `git show e6b0a90…:scripts/check-bidi-runtime.mjs | sha256sum` =
  `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`, identical to `b7d16fb`, and the
  committed baseline receipt records `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27`
  (`baseline/measure-at-baseline/c2-at-b7d16fb.json`). The gate at REV is `62453b55…` and prints 44
  (`measure/c2-at-bf48b81.json`, `selftest.last`). The bullet two lines later says "at the round-33
  measured revision" (`SCORECARD.md:1787-1788`), and `LOG.md:2346-2348` states the same correction
  correctly; only the header is wrong. Smallest safe correction: "Measured at the round-33 measured
  revision (`bf48b81`) …".

### D3 — errata-intake correction miscounts the carried set (defect, medium)

- `LOG.md:2354-2356`: "Correction to `LOG.md:2196`: 43 wave-1 errata were recorded and 27 carried, but the
  wave-1 scribes **dispositioned 19 of the 27 carried items**; eight (E28, E30, E31, E32, E33, E35, E37,
  E38) received none, and the round-32 lesson's supported remain-count is **20 of 27**." 19 + 8 = 27 leaves
  nothing, yet 20 are said to remain: the sentence cannot be true as written.
- The wave-1 derivation says the opposite of "19 dispositioned": `ScribeErrataA.md:55-63` — 19 of the 27
  carried ids lie **inside** the round-32 table's E1–E27 range, 8 lie outside, and **7** were closed
  ("closed by the table: 7 (`E16`, `E23` closed-refused; `E21, E24, E26, E27` landed as recorded limits;
  `E22` closed)"); `ScribeErrataA.md:208-211` — "the disposition table above covers E1–E27 by number and
  **closes seven** carried items … so the remain-count the table supports is 20 of 27".
- I re-derived the ledger independently (`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`): `grep -cE
  '^- \*\*E[0-9]+ —'` = 43 items (exit 0); block-wise disposition parse = **27 carried, 12 `Corrected here`,
  4 `No action`, 0 unmarked**, carried ids `E4 E6 E7 E8 E9 E10 E12 E13 E14 E16 E17 E18 E20 E21 E22 E23 E24
  E26 E27 E28 E30 E31 E32 E33 E35 E37 E38` — i.e. 19 in-table, 8 outside (E28, E30, E31, E32, E33, E35,
  E37, E38). Smallest safe correction: "…7 of the 19 in-table carried items were closed (E16, E21, E22, E23,
  E24, E26, E27); eight lie outside E1–E27 (…) and received none; 20 of 27 remain carried (12 named plus the
  eight)." The other half of the same intake correction **holds**: at `4181fffb` the frozen v3 gate reports
  18 mismatches = 15 `m1` claims at the 41-case oracle (distinct claimed figures `{13, 17, 20, 22, 30}`, not
  three) + 3 `m4` mismatches (`cnf` run below).

### D4 — `SOURCES_GATE` cited to the wrong receipt (defect, low)

- `SCORECARD.md:1762`: "registry 126 at the baseline, `baseline/census-start.txt`: `SOURCES_GATE
  verdict=clean rows=126 tiers=A:111,B:6,C:9 findings=0`".
- `grep -c SOURCES_GATE .ufo/waves/round-33/baseline/census-start.txt` = **0** (exit 1). `census-start.txt`
  is 22 lines of `tabi W04 S0xx duplicate url …` plus `tabi ok <corpus/SOURCES.md>` and `exit=0`. The quoted
  line is `baseline/measure-at-baseline/noharm-at-b7d16fb.txt:9` and reads `… tiers=A:111,B:6,C:9
  status=queued:15,mined:102,rejected:9 findings=0 file=corpus/SOURCES.md`. The figure is true — `corpus/
  SOURCES.md` at `b7d16fb` has 126 `| S…` rows, at REV 129 — so only the pointer is wrong.

### D5 — "the same five digests" cross-reference (defect, low)

- `LOG.md:2243-2244`: "the same five digests are the ones `baseline/measure-at-baseline/
  provenance-b7d16fb.txt` records". `claims.json:frozenDigests` lists the two counters, `controls.mjs`
  (`2d0cf841…`), `measure.sh` (`ca6b830e…`) and `scripts/check-adjacency.mjs` (`4e2c2a64…`);
  `provenance-b7d16fb.txt` records `c1-counter(freeze) da59d157…`, `c2-counter(freeze) 51ace65f…`,
  `check-adjacency.mjs 4e2c2a64…`, plus `check-bidi-runtime.mjs 2f25af5a…` and `check-selfassessment.mjs
  77b5c8ed…`. Three of the five appear; `controls.mjs` and `measure.sh` appear nowhere in that file.
  (Both frozen digests do equal the blobs at the freeze commit and in the worktree — verified with
  `sha256sum` and `git show e6b0a90:<path> | sha256sum`, exit 0 for all five.)

### No-harm leg at the measured revision (defect, medium; depends on the closure's REV)

- `claims.json:noHarmRule` and `SCORECARD.md:1771-1776` require `check-selfassessment` mismatches 0 at REV.
- The committed measurement at the only measured revision fails it: `measure/noharm-at-bf48b81.txt:8` —
  `node scripts/check-selfassessment.mjs --rev HEAD :: exit=1 :: SELFASSESSMENT verdict=failed
  rev=bf48b81… mismatches=1 could_not_evaluate=115 superseded=40`; the same run's
  `measure/selfassessment-at-bf48b81.json` has `mismatches:1` with the sole unsuperseded disagreement
  `SCORECARD.md:1657 claimed 27 observed 44`.
- The repair revision has no receipt: `ls .ufo/waves/round-33/measure/` holds only `*-at-bf48b81.*`.
  `git diff --stat bf48b81 042d6d9` = the seven measure files, `w2-spec.json` and `SCORECARD.md | 2 +`.
- I ran the gate at `042d6d9` myself: `mismatches 0`, **exit 0** (`.ufo/waves/round-33/w2/CritCorrections/
  selfassessment-at-042d6d9.json`), so the claimed clearance is true — it is simply not receipted by the
  round. Smallest safe correction: re-run `measure.sh 042d6d9 …` (or append the `042d6d9` noharm +
  selfassessment receipts) before the executed disposition names REV; otherwise the disposition must say the
  no-harm leg holds only at an unmeasured revision.

### Disposition pointers (condition, not yet a defect)

`SCORECARD.md:1777` ("Round-33 disposition: the `## Round 33 — executed disposition` section below") and
`LOG.md:2344` ("Round-33 disposition: appended below after measurement"), with `LOG.md:2311`, `:2315` and
`:2319` ("After: the disposition paragraph at the end of this entry"), have no target at `042d6d9`:
`grep -rn "Round 33 — executed disposition"` finds only the pointer, and the LOG entry ends at its
corrections. The round is in wave 2, so this is a closure obligation rather than a defect today — but the
LOG's "after measurement" tense is already satisfied (measurement landed at `bf48b81`, before `042d6d9`), and
the SCORECARD block is the only place the declared table's after values can land.

## What holds

### Tally corrections (27 → 44) — holds

- All three cited lines are really stale and all three are corrected **in their own document**:
  `SCORECARD.md:1657` = "`scripts/check-bidi-runtime.mjs` `--selftest` (27/27)."; correction at
  `SCORECARD.md:1784-1788` and again as the one-line restatement `SCORECARD.md:1805` (cites
  `SCORECARD.md:1657`). `SKILL.md:2626` = "(cases=27, passed=27)"; correction at `SKILL.md:2894-2898`
  (cites `SKILL.md:2626`). `LOG.md:2154` = "cases=27 passed=27"; correction at `LOG.md:2346-2350` (cites
  `LOG.md:2154`). Cross-document citation does not clear in this instrument, and each document carries its
  own — the rule the gate implements (`scripts/check-selfassessment.mjs:286-289`).
- Arithmetic verified from the case tables, not from prose: `git show b7d16fb:scripts/check-bidi-runtime.mjs`
  vs `042d6d9` — 17 `{ id: … }` rows added, 0 removed: `v2-f1-golden-splice` … `v2-f8-junk-source-row` (8)
  and `v2-m04-…`, `v2-m06-…`, `v2-m09-…`, `v2-m10-…`, `v2-m11-…`, `v2-m14-…`, `v2-m17-…`, `v2-m18-…`,
  `v2-m19-…` (9), exactly the set the corrections name; 27 + 17 = 44 and the gate prints
  `cases=44 passed=44` (`measure/c2-at-bf48b81.json`).
- The one-line restatement is **necessary**, not decorative: on a scratch branch with `SCORECARD.md:1805`
  removed and committed, `check-selfassessment.mjs --rev <that commit>` returns **mismatches 1** with
  `SCORECARD.md:1657 claimed 27 observed 44` unsuperseded
  (`.ufo/waves/round-33/w2/CritCorrections/experiment-drop-1805.json`, commit `50ca414`, branch deleted,
  clone restored to `042d6d9`, `git status --porcelain` 0 lines). At `042d6d9` the gate returns
  `mismatches 0`, exit 0. The correction's stated reason ("in this document the calibration counter reads a
  correction and its citation on one line") therefore holds.

### Round-32 `feasibilityDisclosed` correction — holds

`.ufo/waves/round-32/claims.json:39` is that field and contains the quoted clause verbatim ("it is not
reachable without a committed receipt of two real runs from a driver other than the counter";
`grep -c` = 1). `.ufo/waves/round-32/w1/CritC1Forgery.md:45-51` lists the four variants with the four commit
ids the correction names (`b858b5d`, `e666174`, `7912a62`, `cee9539`), each `exit 0`, `admitted 16`,
`failing 0`; `:104-109` is D2 ("`admitted` counts table instances, not distinct surfaces … one distinct row
reaches the target"), which is the correction's second half. `SCORECARD.md:1790-1801` matches the report
line for line.

### Round-33 `notClaimed` M4 correction — holds

The quoted notClaimed clause is verbatim in `claims.json`; `corpus/lessons/round-27.md:30-39` records the
38-row re-open with the four quarantine reports; fleet `.ufo/l0-questions.md:165` is exactly the
`tabi | round-27 |` quarantine/frozen-claim question; the round-22 hand-check is on record
(`corpus/lessons/round-22-verifier-spotcheck.md:156` — "38 campaign-register rows hand-checked", and `:166`
the 37+1 row arithmetic). `SCORECARD.md:1803` and `LOG.md:2382` both carry it, both say the frozen file
stays as written.

### Declared claims against `claims.json` — holds (values, receipts, controls)

- Predicates, targets and counting commands match verbatim (`SCORECARD.md:1720-1727` against
  `claims.json:claims[].predicate/target/countingCommand`), including the C1 "name the other side" rule and
  the contested-open L0 condition.
- Before values match and reproduce: `baseline/measure-at-baseline/c1-at-b7d16fb.json` = candidates 52,
  mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency `rows 10, verified 10, findings 0`; the same
  fields in `baseline/c1-J1-do-nothing.json` and `controls-summary.json`; both counters at `b7d16fb`
  **exit 1** on my re-run.
- Seven controls, all `exit: 1` (`jq 'length'` = 7); `c1-J3-junk-rows` adjacency `rows 14, verified 14`
  as stated; `c2-J2-reject-all` H0/H1/H2 false with forgeriesAccepted 0; `c2-J3-whitelist` digestLiterals 5
  and `selftest.exit 3` ("cases=27 passed=25"). Each capture's `.provenance` names rev and tree
  (`rev=b7d16fb8… tree=c7999ee7… repo=lane`).
- Frozen bytes: all five `frozenDigests` equal both the worktree at `042d6d9` and the blobs at `e6b0a90`
  (`sha256sum`, `git show`), and `scripts/check-adjacency.mjs` is unchanged (`4e2c2a64…`).
- Frontier/registry: `corpus/SOURCES.md` has 126 `| S…` rows at `b7d16fb` and 129 at REV; `S127`, `S128`,
  `S129` exist and are the three the note cites; `noharm-at-bf48b81.txt:9` reads `SOURCES_GATE … rows=129`.
- Wave-2 errata intake line `SCORECARD.md:1768-1769` cites `corpus/lessons/round-32.md:179-187`, which is the
  `### Wave-2 precision defects carried (append-only)` block.

## Deliverables

- this report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritCorrections.md`
- receipts: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritCorrections/` —
  `receipts.txt`, `clone-head.txt`, `baseline-files-added-after-freeze.txt`, `baseline-tree-at-freeze.txt`,
  `provenance-b7d16fb.txt`, `sources-gate-lines.txt`, `census-start-sources-gate-grep.txt`,
  `c1-at-b7d16fb-rerun.json`, `c2-at-b7d16fb-rerun.json`, `selfassessment-at-042d6d9.json`,
  `selfassessment-at-bf48b81-unsuperseded.json`, `experiment-drop-1805.json`
- scratch (deleted before yield): `/fast/scratch/hyaku/tabi-r33/CritCorrections` (clone, TMPDIR, counter
  reruns, errata reparse)

No browser, chromedriver or chromium was started (`pgrep -fa 'chromedriver|chromium'` showed no line of mine);
no network fetch was made; no lane file, lane index, fleet file or sibling repo was written. Two scratch-only
commits (`8f19ac1`, `50ca414`) were made in the seat's clone for the correction-necessity experiment and both
branches were deleted; the clone is detached at `042d6d9` with a clean worktree.
