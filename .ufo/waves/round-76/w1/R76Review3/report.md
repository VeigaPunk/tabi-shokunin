FINDINGS

# R76Review3 — read-only conformance review of round 76 C1 (C1-JSDIALOG-R76)

Seat R76Review3, leaf member, no dispatch. Review point: master `dd52d3db818f84ec29b83bb17163eb4592c0d3ce`
(w1 spec commit) in `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base
`a69f9060cb9d239b3d6d4429e1b91177b792ebd3`; freeze commit `6ea51ce1…`; digests commit D
`97bf5d560d03acd74486842bede9e2db523ecda0`; scored commit `2d3628fe…`.

I made no git/jj mutation. I executed only the frozen receipt readers (counter ×4, battery ×6) writing
under `/fast/scratch/hyaku/tabi-r76/R76Review3`; the cited outputs are copied to
`.ufo/waves/round-76/w1/R76Review3/receipts/`. I did not run the driver/Chromium — no new execution
assurance was produced by this seat, only receipt-reader re-runs.

## 1. Freeze ordering — PASS

```
git -C <lane> log --format='%H %ci %s' a69f9060..master -- .ufo/waves/round-76 scripts corpus SCORECARD.md   # exit 0
git -C <lane> rev-list --count a69f9060..master                                                              # 5
```

| # | commit | time (-03) | subject |
|---|--------|-----------|---------|
| 1 | `7e792fa3` | 04:56:15 | pre-freeze: instruments, probes, smokes, degenerates, controls, S202-S206, note, QUALITY 143-144 |
| 2 | `6ea51ce1` | 04:56:31 | FREEZE C1 claims + prior-set enumeration (parent `7e792fa3`) |
| 3 | `97bf5d56` (D) | 04:56:39 | freeze.txt digests (adds only `freeze.txt`, +9) |
| 4 | `2d3628fe` | 04:59:11 | scored run (leg a/c) + receipt |
| 5 | `dd52d3db` | 04:59:26 | w1 spec/dispatch |

Ancestry asserted pairwise with `git merge-base --is-ancestor` (4/4 exit 0); parents
`6ea51ce^=7e792fa`, `97bf5d5^=6ea51ce`, `2d3628f^=97bf5d5`, `dd52d3d^=2d3628f` (`git rev-parse`).
`git diff --stat 6ea51ce 97bf5d5` = `freeze.txt | 9 ++++++` (exit 0); `git diff 97bf5d5 master -- .ufo/waves/round-76/freeze.txt`
empty (exit 0, freeze.txt itself never moved after D). The pre-freeze commit precedes the claims
commit precedes D precedes the scored-run commit precedes dispatch. Only DB d commits touch the scoped
paths, in that order.

## 2. Pins — PASS

`freeze.txt` (9 lines: 1 freeze line, 1 recorded line, 7 digests). Recomputed with
`git show <rev>:<path> | sha256sum` at D and at `master`, and with `sha256sum` in the worktree:

| recorded sha256 | path | at D | at tip | worktree |
|---|---|---|---|---|
| `152ffc11…dd51` | scripts/chrome-cdp-dialog-round76.mjs | OK | OK | OK |
| `50505538…dcf4` | scripts/check-dialog-r76.mjs | OK | OK | OK |
| `91874c87…74c` | scripts/negatives-dialog-r76.mjs | OK | OK | OK |
| `80107844…aca1` | .ufo/waves/round-76/controls/c1/kill-power-r76.mjs | OK | OK | OK |
| `30f7418a…7e5b` | .ufo/waves/round-76/controls/c1/prior-set.txt | OK | OK | OK |
| `aa835a8c…b02e` | .ufo/waves/round-76/claims.json | OK | OK | OK |
| `6dd74d28…f84ca` | .ufo/waves/round-76/run-scored.sh | OK | OK | OK |

7/7 equal at D, 7/7 equal at the tip, 7/7 equal on disk (exit 0 each). The dirty worktree entries
(`corpus/lessons/round-76.md` modified, `w1/`, `scripts/selftest-r76-gates.mjs` untracked) are not pinned
inputs.

## 3. Nonce derivation — PASS

- `freeze.txt:1` names `6ea51ce…`; D is the commit that adds `freeze.txt` (diff above); D's first 12 hex
  = `97bf5d560d03`; expected nonce `tabi-r76-l1-97bf5d560d03` (claims.json:19 in the counting command).
- Scored receipt `corpus/evidence/round76/chromium-js-dialog/receipt.json`: `schema=tabi-chrome-cdp-dialog-r76`,
  `nonce=tabi-r76-l1-97bf5d560d03`, `driverSha256=152ffc11…dd51` (python json read, exit 0).
- Absent at and before D: `git grep -F 'tabi-r76-l1-97bf5d560d03' 97bf5d5 -- .` exit 1; same at
  `6ea51ce` exit 1; same at the base exit 1. The prefix appears only as a computation
  (`run-scored.sh:12 NA="tabi-r76-l1-${D:0:12}"`, `build-spec.py:16`, claims placeholders `<$…>`), never as
  the literal; `controls/c1/controls-c1.mjs:28` uses the declared stand-in `tabi-r76-l1-control0000`.
- Timing: receipt `startedAt 2026-11-07T07:56:44.722Z` = 04:56:44.7 -03, which is 5.7 s after D's
  04:56:39 commit; `finishedAt 07:56:49.129Z`. The scored run is post-D.
- Risk note (not a defect): `run-scored.sh:11` takes D from `scored/digests-commit.txt` (a transcribed
  `97bf5d5…`, committed in the scored commit) rather than computing it from git. Two independent
  derivations agree (L1 script and R76Exec1's fixed `tabi-r76-exec1-97bf5d560d03`), and the counter's
  frozen `--expect-nonce` binds the receipt; the transcription is only a mechanism weakness.

## 4. Prior-set enumeration (QUALITY 140/141) — PASS

```
git grep -l '"schema": "tabi-chrome-cdp-dialog-r76"' <rev> -- '*.json'   # candidates
```
I parsed each candidate and kept only files whose TOP-LEVEL `schema` is the receipt schema:

- freeze parent `7e792fa`: 31 candidates → **17** top-level;
- D `97bf5d5`: 31 → **17**;
- tip `master`: 33 → **18** = the 17 plus `corpus/evidence/round76/chromium-js-dialog/receipt.json`.

`sorted(top-level at 7e792fa)` vs `prior-set.txt` non-comment lines: `diff` exit 0 (17 = 17). The committed
`lesson-proof/prior-set-enumeration-toplevel.txt` equals my re-derivation (`diff` exit 0) and the raw list has
31 lines, so the 141 top-level filter is what produced the set. `prior-set.txt` sha `30f7418a…` = pin;
17 path lines + 1 comment (the claim's "17-line prior set" counts paths).
The counter's own walk (`check-dialog-r76.mjs:217-219`) covers the two trees and refuses
`prior-set-complete` for a `.json` receipt of the schema that is neither a prior nor carries the expected
nonce. Note: the enumeration file is committed in `6ea51ce`; `git cat-file -e 7e792fa:…-toplevel.txt` exits
128, so the citation is by content equivalence, not by a file at the parent (see F2).

## 5. Before → after — PASS for the four measured before values; leg (d) still pending

Base `a69f9060` (git cat-file -e exits 128 for `.ufo/waves/round-76`, `corpus/evidence/round76` and
`scripts/check-dialog-r76.mjs`), tip `dd52d3db`:

| claims.json:21-27 before value | base | tip | command |
|---|---|---|---|
| capability row | 0 (`grep -c`, exit 1) | 0 (`grep -c`, exit 1) | `grep -c '^\| \`chromium-js-dialog-linux\` \|' SCORECARD.md` |
| notes citing dialog commands | 0 | 1 (`corpus/knowledge/chromium-js-dialog-runtime-round-76.md`) | `git grep -lE 'handleJavaScriptDialog\|javascriptDialogOpening' <rev> -- corpus/knowledge \| wc -l` |
| r75 drag receipt under the r76 counter | exit 1 (80 findings; first six ids `schema, nonce-shape, nonce-expected, driver-pin, dialog-call-count, cdp-event-log-closed`) | same | pinned counter on `corpus/evidence/round75/chromium-drag-intercept/receipt.json` |
| call without `--prior-set` | exit 2, `usage` | exit 2, `usage` | pinned counter |
| no receipt | exit 2, `receipt-unreadable` | exit 2, `receipt-unreadable` | pinned counter on an absent path |

Re-run of the frozen counting command at the tip: `exit 0`, `verdict clean`, `checkCount 131`, `findings []`,
`priorSet 17`, `priorSetFile.sha256 30f7418a…` (receipts/recheck-counter-scored.json).

Predicate status as measured:

- (a) HOLD: scored receipt nonce/digest/pin as above; driver/counter/battery/kill-power exit files
  `0/0/0/0` (`scored/c1-*.exit`); scored counter clean 131 with the 17-line PRE.
- (b) HOLD on disk: `.ufo/waves/round-76/w1/R76Exec1/receipt.txt` nonce `tabi-r76-exec1-97bf5d560d03`,
  driver pin equal, `degenerate null`; `R76Exec1/counter.json` clean 131 with 18 priors (17 + the scored
  receipt). Both files are untracked at the review tip — integration is the L1's.
- (c) HOLD: scored battery exit 0 `allOk 251/251`, `coverageGap []`, laundered 3, 141 isolated cases,
  73/131 ids with an isolated case; kill power exit 0 `holds true`, 187/187 mutants killed
  (force-true 131/131, semantic 56/56, 3 killed-positive), `crashed []`, `survivors []`, both unmutated
  runs survived, guard ok.
- (d) PENDING: the note exists and cites S202-S206 (`corpus/knowledge/…round-76.md:1`, rows
  `corpus/SOURCES.md:216-220`, tier A), but the capability row is still 0 at `dd52d3d`. No integration
  commit exists yet, so (d) cannot be reviewed as satisfied.

## 6. QUALITY 130-144 — which apply and whether committed evidence meets them

| # | verdict | evidence |
|---|---|---|
| 130 | PASS | Controls are not committed as per-control receipts; the evaluator captures the exit mechanically (`spawnSync(...).status`, `controls-c1.mjs:112`) and the summary's exits agree with the stdout finding ids (exit 2 ↔ usage/unreadable, exit 1 ↔ findings, exit 0 ↔ clean). No `$?`-after-substitution hazard. Caveat: per-control stdout is summarised, not retained. |
| 131 | PASS | Each control names `expectExit` + `expectIds` and is evaluated mechanically (`controls-c1.mjs:116`); `donothing-r75-drag-receipt` is subset-checked by design and all six listed ids are present in my re-run. Red state retained: `lesson-proof/controls-first-pass-error-code-expectation.json` `allOk false`, `forge-error-code` ids `[leg-no-dialog-error, no-dialog-law, legshape-consistency]`. |
| 132 | PASS | battery `checkIds 131`, `coverageGap []`, `cases 251` (241 refuse + 7 accept + 3 laundered), `positiveOk true`. |
| 133 | PASS | Degenerate receipts carry their own label (`degenerate=page-stub/eval-trigger/swap-accept`, `dialogHypothesis=REFUTED`, `predicate=false`) and the evaluator refuses anything ≠ the expected label (`controls-c1.mjs:122`). The label is the short `k`, not the full control name `degenerate-<k>`; comparison is to `k`. |
| 134 | PASS (battery) | Relative mutations assert landing via `placed()` (`negatives-dialog-r76.mjs:219-223`), which throws `bracket misplaced`; the pass-1 artefact shows it failing (3 cases). Control relabels are absolute rewrites whose landing is bound by exact-id sets. |
| 135 | PASS | All three readers over 9/9 pre-freeze smokes (`prefreeze-summary.json` rows: counter clean 131, battery 251/251, kill power holds, crashed 0); per-receipt prior files `pf/ps-smoke1..9.txt` committed (13 `ps-*.txt` in git), 16 lines each because the receipt under test is excluded from its own prior set — by design, not the frozen 17-vs-16 error. |
| 136 | PASS | `replay-zeroedit-smoke1` exit 1 ids `[nonce-expected, replay-launch-token, replay-devtools-url, replay-event-timeline]`; `replay-forged-nonce-stamps-fixture` exit 1 ids the three replay ids; the whole-shift and probe-relabel cases all refuse. Exact-id sets, so the cases are not exit-only. |
| 137 | PASS | Producer `controls/c1/prefreeze-summary.mjs` fixed at 9 rows and 4 probes, missing/unparsable output → null → row red, `allOk` requires all rows and all probes, `process.exit(allOk?0:1)`; committed summary `allOk true`, and the pass-1 summary (`allOk false`, ok 2/9) is retained. |
| 138 | PASS | The limit sentence (claims.json:29) names the prior-set boundary and the two walked trees; the r75 drag receipts are refused on content (my re-run: 80 findings), and every r76 receipt is in PRE. The limit witness `limit-nonuniform-retime` exits 0 as declared. |
| 139 | PASS | `lesson-proof/timeline-honest-pairs.json`: 13 receipts, 156 ordered pairs, 37 events / 6 gaps each, `refusedHonestPairs 0`, `maxAbsMatched 0`, `maxGapMatched 2` vs thresholds abs 19 / gap 5 — minimum honest distances 19 events and 3 gaps recorded beside the thresholds. Timer floor 290 ms below the smallest honest 299 ms with the 13-receipt measurement in the counter comment (`check-dialog-r76.mjs:236`). |
| 140 | PASS | Independent enumeration at the freeze parent = PRE (17 = 17, diff exit 0); the claims sentence cites the enumeration. Timing caveat F2. |
| 141 | PASS | 31 raw candidates → 17 top-level at the parent and D; the 14 non-receipts are the 9 counter outputs, 3 battery outputs, the kill-power trial and controls-summary. |
| 142 | PASS | Trial on pre-freeze smoke1: `holds false`, 5 semantic survivors recorded; final kill power kills those five by the named cases `host-argv-reordered`, `leg-records-handleparams-and-send`, `blocking-click-before-return-at`, `beforeunload-next-twice`, plus the removed `eventLog.length === 18` conjunct; `semantic 56/56`, `survivors []`. |
| 143 | PASS | The r74 F4/F5 weakenings are re-derived on the new counter as semantic mutants and each is killed by a named case: `M-timeline-tol-0.045`→`replay-timeline-tol-in-0.049`, `0.06`→`accept-prior-tol-out-0.051`, `frac-0.55`→`replay-timeline-abs-at-threshold`, `frac-0.45`→`accept-prior-abs-below-threshold`, `gapfrac-0.85`→`replay-timeline-gap-at-threshold`, `gapfrac-0.6`→`accept-prior-gap-below-threshold`, `quantum-0.02`→`event-time-quantum-bracket-2e-5`, `quantum-1e-5`→`accept-grid-5e-6`. Both sides exist (0.049/0.051, abs 18/19, gaps 4/5, grid 5e-6/2e-5). |
| 144 | **FAIL** | "every placement guard of its battery is run on ALL honest pre-freeze receipts, probes included": the committed pre-freeze record runs the battery/kill power only on smoke1-9; `prefreeze-summary.mjs:32` gives probes a counter-only row. The frozen battery is not probe-agnostic (F1). |

F1 and F2 are routed findings, not a predicate falsification: no leg (a)-(c) check fails on the scored
receipt.

## Findings

### F1 — medium — QUALITY 144: the battery's placement guards were never run on the probes, and fail there

Evidence of omission: `.ufo/waves/round-76/controls/c1/prefreeze-summary.mjs:32` builds the probe rows
from `pf/pf-pN.counter.json` only; `prefreeze-summary.json.probes[]` carries no battery field; `git ls-tree -r
97bf5d5 -- .ufo/waves/round-76/controls/c1/pf` has `pf-smoke1..9.{battery,killpower}.*` and only
`pf-p1..p4.counter.*`.

Reconstruction (fair pre-freeze conditions: the probe under test removed from PRE, the post-freeze scored
receipt added as one extra prior line, lane-relative as the counter's `path.join` requires):

- **p2**: battery exit 1, `passed 249/251`, two errors —
  `replay-timeline-abs-at-threshold` → `bracket misplaced: abs 20/37 gap 1/6 want 19 / <5`;
  `accept-prior-abs-below-threshold` → `bracket misplaced: abs 19/37 gap 1/6 want 18 / <5`
  (`receipts/recheck-battery-probe-p2.json`; the same two errors appear with the committed
  `pf/ps-p2.txt`, `recheck-battery-probe-p2-committed-ps.json`).
  Cause measured: p2 event 31, `(ts 1943.0999999642372, at 1943.2999999523163)`, is moved by
  `keepExact` (`negatives-dialog-r76.mjs:228`, `+0.3*(1+i%5)` ms) to `(1943.7, 1943.9)`, which is
  within 0.05 ms of p2's own event at `(1943.699999988079, 1943.8999999761581)`; the matcher then counts
  20 exact matches instead of 19. `keepExact` assumes the displaced events cannot collide with another
  event of the same receipt.
- **p1**: `prior-set-complete-omitted` (negatives:263) is non-diagnostic when the dropped prior shares the
  receipt's nonce: `probe/p1.receipt.json` and `lesson-proof/probe-build1-p1-refuted.receipt.json` both
  carry `tabi-r76-probe-p1`, and the walk skips any receipt with the expected nonce
  (`check-dialog-r76.mjs:217`). My p1 run: exit 0, `findingIds []` (`recheck-battery-probe-p1.json`).
- **p3, p4**: 251/251 in the same reconstruction (`recheck-battery-probe-p3.json`, `-p4.json`).

`placed()` fails closed (`negatives:219-223`), so no false green is produced; leg (c) is unaffected
because it runs the battery on the scored receipt, where everything places (251/251). But the round's own
new admission criterion 144 is unmet as written, and the intended probe-safety of the frozen battery is not
established by the committed record.

Route (do not repair into this round's claim, per the frozen kill rule): have `keepExact`/`breakGaps`
search a displacement set that lands the requested count on the receipt under test (or skip and record the
receipt as unplaceable), add the 4-probe battery + kill-power pass to the fail-closed pre-freeze summary,
and make the omitted-prior case drop a prior whose nonce differs from the receipt under test.

### F2 — low — the prior-set enumeration is cited "at the freeze parent" but is committed in the freeze commit

`claims.json:13` cites `lesson-proof/prior-set-enumeration-toplevel.txt` as the completeness record at the
freeze parent. The file is added by `6ea51ce` (`git diff --stat 7e792fa 6ea51ce` = claims.json +
the two enumeration files); `git cat-file -e 7e792fa:.ufo/waves/round-76/lesson-proof/prior-set-enumeration-toplevel.txt`
exits 128. Its content nevertheless equals my independent enumeration at `7e792fa` (both 17, `diff` exit 0),
so the completeness proposition is true; only the citation's timing is imprecise (it cannot be checked
from the parent's tree alone).

### F3 — info — leg (d) pending at the review tip

Capability row `grep -c '^| \`chromium-js-dialog-linux\` |' SCORECARD.md` = 0 at `dd52d3d` (exit 1). The note
and S202-S206 rows are committed pre-freeze; the 0→1 row is an integration act that has not landed. The
before→after for the capability is therefore 0→0 today; (d) must not be scored until the integration
commit lands.

## Residual risk and verification gaps

- No new Chromium execution by this seat. Legs (a)/(b) execution assurance is the committed receipts
  (host pin `Chromium 155.0.8059.84 Arch Linux` / `Chrome/155.0.8059.84`, argv `/usr/bin/chromium --headless=new`,
  counter pin `check-dialog-r76.mjs:58`), not a re-run.
- I re-ran the receipt readers at the tip; their bytes are the frozen bytes (pins above).
- The p1/p2/p3/p4 battery reconstructions add the post-freeze scored receipt as an extra prior (as leg (b)
  does with `--prior`) and use a lane-relative line, because the counter joins prior-set lines to `--lane`
  and an absolute line is unreadable. The bracket errors on p2 are independent of that line: they occur
  during case construction, before the counter runs.
- Three semantic mutants are `killed-positive` (`M-prior-set-nonce-exclusion-loose`,
  `M-return-prompt-default`, `M-return-confirm-polarity`) — killed through the battery's positive case,
  not a named case. That is a legitimate acceptance-side kill class, but QUALITY 143's "named case"
  wording is met only by the eight tolerance/threshold mutants.
- The counter's replay rule is a disjunction (`abs >= 0.5 || gap >= 0.75`, `check-dialog-r76.mjs:209`); the
  limit sentence's escape (≥19 events moved, ≥2 gaps changed) puts both sides below threshold and is
  consistent with the code.
- No tool installs or upgrades were needed. Scratch `/fast/scratch/hyaku/tabi-r76/R76Review3` removed after
  copying the cited outputs to `receipts/`.

Report: .ufo/waves/round-76/w1/R76Review3.md
