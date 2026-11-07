FINDINGS

# R78Review3 — conformance review, re-frozen D `4920e079`

The six conformance items **hold at the re-frozen D `4920e0790fa94e10e3d2c47b10f0e021d51f3481`**:
all 14 freeze pins match at D and in the worktree, the scored nonce is post-D and absent at D,
the prior set is exactly the walked-tree enumeration plus the r77 cross-generation receipt, the
commit order is monotone, `--tree-exempt` is not reachable in the frozen leg and is not needed,
and the C2 checker now has the structural rules. But the round's own **leg (c) is red as
measured**: the scored battery is 399/400 (`prior-set-unparsable-unreadable-dir`, a harness
cleanup EACCES) and the kill power reports `holds=false` with survivor
`M-timeline-min-own-gaps-12` on an output that predates the final D. The pre-freeze gate evidence
is stale against the final instruments, and the SCORECARD round-78 narrative still names the
superseded D `d59ca027`. The first freeze (`d59ca027`) genuinely failed its own pins and the
committed tip `b1f33724` failed the counter; the re-freeze fixed both. History is in §7.

All JSON artifacts are under `.ufo/waves/round-78-seats/R78Review3/`; no lane file was written,
no git mutation was made, no tool was installed.

## 1. Ordering — holds

Committer dates (`git log -1 --format='%ci'`): `e866ca7c` 13:58:29 (instruments, controls,
claims.json, sources, note, QUALITY), `5e78b9f1` 13:58:36 (first D), `3289c1d0` 14:36:27
(pre-freeze repair), `3a9caf6a` 14:43:48, `8da28287` 14:43:58 (D, battery pin 71bce77d),
`d59ca027` 15:06:46 (superseded D), `b1f33724` 15:14:40 (first scored run), `8384256d` 15:17:08
(battery bytes), `d986c273` 15:24:59 (re-freeze D), `a4d628c8` 15:33:03 (re-freeze D),
`4920e079` 15:48:51 (final D). The scored receipt's `startedAt` is 2026-11-07T18:49:02.743Z
(15:49:02 local), after D; cold1 starts 15:49:14. Every instrument/claims edit is in or before D;
the scored run is after D. Caveat: the re-freeze is a post-first-scored-run instrument change; it
is disclosed in the commit messages but not yet in the SCORECARD (§4).

## 2. Pins — hold at D and at the tip

```
D=4920e079…; while read h p; do git show "$D:$p" | sha256sum; sha256sum "$p"; done < freeze.txt
# 14/14 atD=OK wt=OK
```

`claims.json` pins (8 files) all equal `freeze.txt`; the other six freeze files
(`run-scored.sh`, `run-scored-gates.sh`, `claims.json`, `prior-set.txt`, `census/start.txt`,
`sources/FETCH.txt`) are not claim pins. The superseded D `d59ca027` failed the battery pin
(`71bce77d` at D vs `724887` recorded) — kept as history in §7.

## 3. Nonce — holds

Scored receipt `corpus/evidence/round78/chromium-file-chooser/receipt.json` nonce =
`tabi-r78-l1-4920e0790fa9`, `driverSha256` = `0ae89d92…`, `frameTree.mainFrameParentId` = null,
`mainFrameUrl` = `about:blank`, `fixtureInputs` = 5, `startedAt` 15:49:02 > D 15:48:51.
`git grep 'tabi-r78-l1-4920e0790fa9' 4920e079 -- .` → exit 1; `git log -S… 4920e079` → empty.
The D tree's file at the same path is the superseded receipt (nonce `tabi-r78-l1-d59ca0270c2a`);
the new receipt is post-D and the path is the receipt under test, exempt by identity.

## 4. Prior-set enumeration — holds for the walked trees

At the freeze parent `a4d628c8`, whole-lane `git grep -l 'tabi-chrome-cdp-filechooser-r78'` → 55
candidates, each parsed: the 10 pre-freeze receipts (3 degenerates + 4 probes + 3 smokes) carry
`nonce`/`events`; `prior-set.txt` = those 10 + the r77 receipt (schema
`tabi-chrome-cdp-filechooser-r77`) = 11 lines, exact set match (`enumerated-refreeze-parent.txt`).
The whole-lane enumeration adds two expected exceptions: the receipt-under-test path (the
superseded scored receipt) and `.ufo/waves/round-78-seats/L1-cold1/receipt.json` (a cold-run
artifact outside both walked trees). The counter's walk is clean, so `prior-set-complete` holds.

## 5. `--tree-exempt` — not reachable in the frozen leg, not needed

The frozen command omits it; the scored receipt is exempt by identity (`selfReal`), and the
counter output records `treeExempt: []`. The interface is caller-chosen and path-only (lines
181-184, 294); it suppresses `prior-set-complete`, not `prior-set-unparsable` (verified on the
old failure). Used only by the battery (`negatives-filechooser-r78.mjs:531`). A forger does not
choose the verifier's arguments, so the frozen leg is not reachable; any ad-hoc invocation can
hide a well-formed same-schema receipt by path. The r79 plan already says it should be
receipt-bound. Residual, not a failure of the frozen command.

## 6. C2 — holds, with the `provisional` residual

`node scripts/check-capability-status.mjs --json` → exit 0, `rows 11, claimed 10, provisional 1,
mismatches 0` (`capstatus-refreeze.json`), equal to the committed `scored/c2-after.json`
(provisional 1 — the earlier "provisional 0" misstatement is fixed). The new structural rules
work: the named round's section must list the capability, and the verdict test reads only the
claim-table Verdict cells. Reproduced on the base `ae2dc25f` SCORECARD:

| edit | exit | result |
|---|---|---|
| none (before state) | 1 | 1 mismatch (`c2/base-run.json`) |
| last cell `77` → `round 75` | 1 | "round 75 does not list capability chromium-file-chooser-linux" |
| last cell `77` → `provisional r77` | 0 | 0 mismatches (`c2/donothing2-provisional.json`) |

The last row is the QUALITY 152 allowed alternative: a `provisional` label naming the failed
round is accepted without any repair, so the instrument still cannot distinguish an honest
provisional from a relabel. That is the rule's letter, disclosed in C2 leg (c); residual.

## 7. Cross-check findings (outside the six items)

**F1 (high) — the scored battery is red.** `scored/c1-negatives-a.json` (mtime 15:49:38, after
the final D) reads `cases 400, passed 399, allOk false`; the failing case is
`prior-set-unparsable-unreadable-dir` with `error: "mirror: EACCES, Permission denied:
/fast/scratch/hyaku/tabi-r78/L1-scored/n/mirror-prior-set-unparsable-unreadable-dir"`. The
failure is the battery's own mirror setup/cleanup on the `chmod 000` `hidden` directory it
creates, not the counter's unreadable-dir check. The same class is what the final commit's
"kill-power cleanup tolerates the locked-dir case" addresses for the kill power; the battery did
not get the same cleanup tolerance.

**F2 (high) — the kill power is red and stale.** `scored/c1-killpower-a.json` (mtime 15:34:52,
before the final D 15:48:51 and before the final kill-power script `9fdd4ea7`) reads
`holds: false`, `semantic: 75/76`, `survivors: ["M-timeline-min-own-gaps-12"]`. The survivor is
the mutant for the new `MIN_OWN_GAPS` accepting side; the final battery's accepting case does not
kill it on the real receipt. The output must be re-run on the final bytes before leg (c) can be
called green.

**F3 (high) — the pre-freeze gate evidence is stale.** `controls/c1/pf/out/prefreeze-summary.json`
(mtime 14:43:48) reports `batteryCases 397` for all seven receipts; the `pf-*.battery.json`
outputs are 15:01-15:04 and 398 cases; the final battery is `377e9568` (400 cases); the final
counter `4ae29412` and kill-power `9fdd4ea7` postdate every `pf/out` counter and killpower file
(14:11-14:36). `claims.json`'s `frozenAt` still cites the summary for "counter 7/7, battery 7/7,
kill power 4/4", which is not supported for the final bytes. The pre-freeze gates were not
re-run on the re-frozen instruments (no `*.battery.json` newer than 15:20 exists).

**F4 (medium) — the SCORECARD narrative is stale.** The round-78 section still names D
`d59ca027` and its correction block has four items, none of which mentions the re-freeze; grep
for `4920e079`/`8384256d`/`re-freeze` in the section is empty. The operative D is recorded only
in `scored/digests-commit.txt` and the commit messages. The L1 said the re-freeze is being
documented; it had not landed at measurement.

## 8. History (superseded states, kept as evidence)

- **D `d59ca027` failed its own freeze.** `freeze.txt:3` recorded `724887` for the battery, but
  the blob at D was `71bce77d`; the 724887 bytes existed only as an uncommitted worktree edit
  (mtime 14:59:29). The D commit touched only claims/freeze/selftest. The scored battery output
  at the time (398 cases) matched the 11-registration worktree battery, not the 10-registration
  committed one.
- **Committed tip `b1f33724` failed the frozen command.** `scored/selftest-r78-gates.out`
  (JSON + the summary line `clean=true cases=15 failed=none` at byte 7628) was committed inside
  the walked tree; the counter refused it as `prior-set-unparsable` (exit 1, 186 checks) and the
  selftest was 7/15 red. Reproduced on a scratch extraction of `8384256d`
  (`counter-tip-8384256d.json`, `selftest-tip-8384256d.out`). The re-freeze `d986c273` moved the
  file to `.ufo/waves/round-78-seats/L1-selftest/`; at D `4920e079` it is absent from the walked
  tree (`git cat-file -e` exit 128) and the selftest is 15/15 exit 0 (`selftest-refreeze.out`).
- **`8384256d`** committed the battery bytes; all 14 pins matched there, but it was a post-D
  instrument commit, which is why the L1 re-cut D rather than silently keeping it.

## 9. Verification gaps

- I did not run the battery or the kill power; F1/F2 are the round's own outputs (timestamps
  above), not my runs. The counter and selftest are my runs: counter exit 0 clean 186 on the
  scored receipt and on cold1 (`counter-refreeze.json`, `counter-cold1-refreeze.json`); selftest
  exit 0 15/15.
- I did not re-run the pre-freeze gates (F3 is a timestamp/digest comparison).
- The `--tree-exempt` "hide a well-formed receipt by path" behaviour is code-read, not run:
  writing a receipt into the walked tree is forbidden by the seat-output rule.
