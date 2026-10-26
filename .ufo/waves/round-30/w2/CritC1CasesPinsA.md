# CritC1CasesPinsA — attack on the release-pins runner hunk and the five ExecPinsCasesA cases

**Verdict.** I attacked `scripts/check-release-pins.mjs` at `072af95fe2822f0785a6ff88a578e2142dd258e5`
(sha256 `915a6bba…a648`; diff vs freeze `061e6202` is `+86/−3`, the three deletions being only the
self-test harness lines `ok`, `results.push`, `console.log`) and built wrong-gate variants in scratch
to measure each case's discriminating power. The **runner `reasons` assertion holds**: it is purely
additive (`c.reasons === undefined || …`, line 491), and all 20 pre-existing cases have byte-identical
`ok/exit/unresolved` at the freeze and at tip (20/20 both; empty diff). f1, f4-bounds and f4-anchor
**hold** — each is killed by exactly its intended case, with the asserted reason, and a single-file
row. Two defects: (1) **`f2-dotdot-inside-filename` is a `..`-substring test, not a traversal test**
(line 372 fixture, line 204 guard) — a wrong gate that rejects only the literal `feature..cc`
(`trav_literal`) passes **all 29 cases**, while a *correct* segment-scoped traversal guard
(`f.path.split("/").includes("..")` or `/(^|\/)\.\.(\/|$)/`) is reported as **failing** the case
(exit 3). The case therefore proves the substring predicate exists and simultaneously pins the gate's
over-broad false positive; the traversal shape is untested. (2) **`f3-old-bytes-never-committed`
kills only by crash**: with `pins-f3-bytes-absent` the child dies at line 486 with
`TypeError [ERR_INVALID_ARG_TYPE]` (exit 1, **0 stdout bytes**, `cases null`, `failing_cases []`), so
the kill carries no case attribution and 7 of the 9 new cases never run under that mutant. That is
acceptable as proof the null guard exists (and the pristine gate *does* emit and assert
`f3-bytes absent`), but it is not case-level coverage and it fails the round's own attribution
standard; a 3-line harness catch turns it into `exit 3, cases 29, failing [f3-…]` with nothing else
changed. Neither defect moves claim C1's predicate: my independent counter run is 27/27 killed,
0 benign killed, exit 0, digests matching `claims.json`.

## Answers to the three assigned questions

1. **Does the new `reasons` assertion weaken or alter any pre-existing case?** No. Cases without
   `reasons` get `reasonsOk = true` (short-circuit on `c.reasons === undefined`, line 491), so the
   added conjunct can only fail a case, never pass one that failed before. Measured, not inferred:
   running the freeze-version selftest (`pins_frozen.mjs`, from `061e6202`) and the tip selftest gives
   20/20 and 29/29, with **no** pre-existing id differing in `(ok, exit, unresolved)` and **no**
   pre-existing case carrying an `expectedReasons`. The delicate part is unaffected too: output-shape
   consumers read only `ok/cases/passed`, and the text line for reason-less cases is unchanged
   (the `expected_reasons=` segment is conditional). Residual gap, pre-existing and unchanged: the
   other 20 cases stay reason-blind — a variant that makes the gate emit `f1-old-tag …` where it
   should emit `f2-path-bound …` (`bind_other_reason.mjs`) still gives 29/29 pass, i.e. the
   "cannot hide behind a neighbouring failure path" property holds for the 9 new cases only.
2. **Is `f2-dotdot-inside-filename` a real path-traversal test?** No — only a `..`-substring test.
   Evidence: `trav_literal` (`f.path.includes("..")` → `f.path.includes("feature..cc")`) survives
   29/29 while real traversal is unguarded; `trav_segment` and `trav_regex` (correct, segment-scoped)
   are false-killed by this very case. Note the current fixture's kill does not even depend on the
   `reasons` field: under `includes("..") → false` the row resolves (exit 0), so the case fails on
   exit/unresolved. A real-traversal fixture makes the assertion load-bearing and keeps the kill.
3. **Does `f3-bytes-absent` kill only via crash, and is that acceptable?** Yes, only via crash
   (`evaluate` runs in-process in `runSelftest`; `if (!(e instanceof Refusal)) throw e` at line 486
   escapes `main`). Acceptable as *guard-existence* evidence — the counter counts it by design
   (`crash-counts-as-killed` is one of the counter's own self-test cases) and wave 1 disclosed it
   (`w1/ExecPinsCasesA.md` lines 46, 98, 130). **Not** acceptable as *case-attribution* evidence: the
   mutation report row contains no case id and no case count, and cases 23–29 (f3 itself, f4×2, s1×2,
   404×2) produce no output at all in that run.

## Mechanism defects found while building the variants

- **Prefix match, not reason equality** (line 492): renaming the gate's reason to
  `f3-bytes absent-and-renamed` still passes 29/29 (`reason_drift_f3`), while replacing the prefix
  (`something else …`, `bound-ok …`) correctly fails (`reason_other_f3`, `reason_other_f2`). So the
  assertion pins a prefix only; a gate that drifts a reason onto a neighbouring meaning keeps the
  case green. Low severity, cosmetic to fix.
- **Both f4 cases assert the same string `f4-ranges`**, so the reason field cannot distinguish a
  bounds regression from an anchor-token regression; separation is carried entirely by the two
  fixtures (each violates exactly one disjunct). Verified: `f4_bounds` fails only
  `f4-range-past-last-old-line`, `f4_anchor` fails only `f4-anchor-lacks-range-token`. Holds, but
  the reason string adds no separation.
- **Crash aborts the whole harness**, so one crashing mutant hides the verdict of every later case.
  Not a claim defect (each mutant is an independent run) but it means "killed" can mean "the suite
  died early".

## Smallest safe corrections (not applied — attack seat)

1. f2 fixture: use a real traversal path, e.g. `const odd = "content/public/../../../etc/passwd";`.
   Verified in scratch: pristine gate → 29/29 pass with reason `f2-path-bound content/public/../../../etc/passwd`;
   with `f.path.includes("..") → false` the case **fails** (unresolved via `f3-bytes absent`, caught by
   the reasons assertion); with a correct segment guard (`split("/").includes("..")` or the
   `(^|/)\.\.(/|$)` regex) the case **passes**. Net: identical kill, real traversal shape, no
   false-kill of a correct guard. (`p2_real_traversal_fixture.mjs`, `p2_real_plus_trav_false`,
   `p2_real_plus_trav_segment`.)
2. Harness (next round, since it changes the measured harness): catch non-`Refusal` throws per case —
   `exit = e instanceof Refusal ? 2 : -1; out = {unresolved: null, refusal: e.message, crash: …}`.
   Verified: `f3_false + catch` → `exit 3, cases 29, passed 28, failing [f3-old-bytes-never-committed]`,
   refusal `The "data" argument must be of type string…Received null`; catch alone leaves 29/29 clean.
3. Optional: match reasons as `/^f2-path-bound /` style anchored prefixes (already effectively so) or
   assert exact strings where the label is the only variable part.

## Evidence (commands, exit codes; clone = `git clone --shared … ; checkout 072af95…`, porcelain 0)

```
$ git -C "$S/clone" rev-parse HEAD                      → 072af95fe2822f0785a6ff88a578e2142dd258e5; porcelain 0 lines (exit 0)
$ git diff 061e6202… 072af95… -- scripts/check-release-pins.mjs | grep -c '^-[^-]'
                                                        → 3   (only the harness ok/results.push/console.log lines)
$ TMPDIR=$S/tmp node scripts/check-release-pins.mjs --selftest
                                                        → RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29 (exit 0)
$ TMPDIR=$S/tmp node scripts/check-release-pins.mjs --selftest --json   (reasons per new case)
    f1-… → ['f1-old-tag content/public/common/feature.cc']
    f2-… → ['f2-path-bound content/public/common/feature..cc']
    f3-… → ['f3-bytes absent content/public/common/feature.cc']
    f4-range-past-… → ['f4-ranges content/public/common/feature.cc [7,8]']
    f4-anchor-… → ['f4-ranges content/public/common/feature.cc [4,5]']
    (stderr 0 lines, exit 0)
$ node pins_frozen.mjs --selftest --json                → cases 20 passed 20 (exit 0)
    freeze↔tip per-case (ok,exit,unresolved) diffs: []   ; pre-existing cases with expectedReasons at tip: []
$ TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev 072af95… --work $S/gmwork --json
    → EXIT=0; fault_total 27, fault_survivors 0, benign_total 13, benign_killed 0
      counter_sha256_at_rev 02945f88…c3a55, catalogue cd1c27a2…53833 (both == claims frozenDigests)
      gates: s106 clean 10/10, check-release-pins clean 29/29
      pins-f1-old-tag            killed exit 3 cases 29 passed 28 failing [f1-old-tag-not-carried-by-row-unresolved]
      pins-f2-path-traversal     killed exit 3 cases 29 passed 28 failing [f2-dotdot-inside-filename-unresolved]
      pins-f3-bytes-absent       killed exit 1 cases null passed null failing []        ← crash, no attribution
      pins-f4-range-bounds       killed exit 3 cases 29 passed 28 failing [f4-range-past-last-old-line-unresolved]
      pins-f4-anchor-token       killed exit 3 cases 29 passed 28 failing [f4-anchor-lacks-range-token-unresolved]
      7 benign rows: survived (exit 0, 29/29)
$ python3 mkvariants.py   (scratch copies only; each prints exit/parsed/cases/passed/failing)
    pristine                        exit 0  29/29
    trav_false   (includes("..")→false)          exit 3  failing [f2-dotdot-inside-filename-unresolved]
    trav_segment (split("/").includes(".."))     exit 3  failing [f2-dotdot-inside-filename-unresolved]   ← CORRECT guard false-killed
    trav_regex   (/(^|\/)\.\.(\/|$)/)            exit 3  failing [f2-dotdot-inside-filename-unresolved]   ← CORRECT guard false-killed
    trav_literal (includes("feature..cc"))       exit 0  29/29                                            ← no traversal coverage
    f1_false                                     exit 3  failing [f1-…]
    f3_false                                     exit 1  parsed false, cases null, stdout 0 bytes,
                                                          stderr: TypeError [ERR_INVALID_ARG_TYPE] … Received null
    f4_bounds                                    exit 3  failing [f4-range-past-last-old-line-unresolved]
    f4_anchor                                    exit 3  failing [f4-anchor-lacks-range-token-unresolved]
    reason_drift_f3 ("f3-bytes absent-and-renamed") exit 0 29/29   ← prefix match too loose
    reason_other_f3 / reason_other_f2            exit 3  failing the matching case ← assertion has teeth
    p2_real_traversal_fixture (fixture only)     exit 0  29/29, reason f2-path-bound content/public/../../../etc/passwd
    p2_real + trav_false                         exit 3  failing [f2-…], reasons captured: ['f3-bytes absent …']
    p2_real + trav_segment (correct guard)       exit 0  29/29
$ python3 mk2.py
    bind_other_reason (f2 reason replaced by f1 reason)   exit 0 29/29   ← pre-existing cases reason-blind
    f3_false + per-case catch                            exit 3 cases 29 passed 28 failing [f3-…] (refusal = TypeError text)
    catch only (pristine gate)                           exit 0 29/29
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain scripts/ | wc -l → 0
```

Line citations at `072af95` (sha256 `915a6bba…a648`, 562 lines): guard `f.path.includes("..")` 204;
binding reason 208; null-bytes guard 214; f1 case 359; f2 case 370 with fixture literal `feature..cc`
at 372; f3 case 378 with `delete f._old` at 382; f4 cases 387/395; runner `row`/`reasonsOk`/`ok`
490–493; uncaught rethrow 486. Counter: `killed = !res.clean`, `clean` requires exit 0 and parsed
`ok === true`, so a crash with 0 stdout is killed by construction.

## Impacted axes

`operability` (claim C1), directly: the f2 fixture does not evidence the traversal guard's semantics
and would punish a correct narrowing; the f3 kill evidences guard existence but not case-level
coverage/attribution. `calibration` secondarily, if a false-kill of a semantically correct guard is
ever counted as a kill of an equivalent rewrite — the catalogue's benign class covers text-equivalent
rewrites (`pins-f2-path-traversal-eq`, `indexOf`) but not semantically narrower rewrites, so the
counter cannot catch this class.

## Scope and hygiene

Measurements only in one scratch clone at `072af95…` (porcelain empty) with `TMPDIR` under
`/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsA`; variants are copies of the frozen script in
`$S/vars/`, never the lane. No network fetches, no installs/upgrades, no lane/registry edits, no
subagent dispatch. Receipts in `.ufo/waves/round-30/w2/CritC1CasesPinsA/`: `pins.diff`, `pins.mjs`,
`pins_frozen.mjs`, `pristine.json/.txt`, `frozen.json`, `gate-mutants.json`, `variants.json`,
`harness.json`, `mkvariants.py`, `mk2.py`, and the five decisive variant sources
(`trav_segment.mjs`, `trav_literal.mjs`, `p2_real_traversal_fixture.mjs`, `f3_false_harness_catch.mjs`,
`bind_other_reason.mjs`). Node v24.21.0, git 2.56.0.
