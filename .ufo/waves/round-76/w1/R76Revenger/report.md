HOLDS

# R76Revenger — fresh-start audit: does r76 repeat a rejected or routed root failure?

Seat: R76Revenger, leaf, read-only over the lane. Measured 2026-11-07T05:00–05:05 -03:00 at lane
HEAD `dd52d3db818f84ec29b83bb17163eb4592c0d3ce` (`git -C … rev-parse HEAD`, exit 0). Base
`a69f9060`; freeze `6ea51ce1`; digests commit D `97bf5d56`; scored `2d3628fe`; wave spec `dd52d3db`
(`git log --oneline a69f9060..HEAD`, exit 0). I wrote nothing outside
`.ufo/waves/round-76/w1/R76Revenger/` and my scratch `/fast/scratch/hyaku/tabi-r76/R76Revenger/`
(removed at exit). No git/jj mutation; no tool installs (node v24.21.0, python3, git already
present — nothing installed, nothing upgraded).

Answer to the milestone: **no.** The table in section 2 has 18 rows (eight root-failure classes and
ten routed-defect items). r76 closes sixteen of them, does not repeat one by construction (r60 K7 —
no live-state conjunct exists), and leaves one open (r62 R3, whose adjacency instrument does not
exist in this round). The r74 F4/F5 and r62 M5 mutants that survived earlier generations are killed
by this generation's battery in an independent run (section 3). Calibration: 0 statements
contradicted by a command, 1 under-claim, 1 weak citation, 1 wording gap (section 4).

## 1. What I measured, and how

Every row below is a command I ran over committed bytes (`git show <rev>:<path>` piped into
python3/json/sha256) or a tool I executed. Gate verdicts were **not** taken from the lane's
narration: I re-ran the pinned counter on the scored receipt, re-ran the battery against copies of
the counter, and re-derived the prior-set enumeration from git objects. The lane's own kill-power
and battery outputs were read as evidence, not re-executed in full (the kill-power pass is 189
battery runs: 188 recorded results plus the closing unmutated run; my independent battery runs are
section 3).

Instrument digests at HEAD equal `freeze.txt` (`sha256sum scripts/chrome-cdp-dialog-round76.mjs
scripts/check-dialog-r76.mjs scripts/negatives-dialog-r76.mjs
.ufo/waves/round-76/controls/c1/kill-power-r76.mjs .ufo/waves/round-76/controls/c1/prior-set.txt
.ufo/waves/round-76/claims.json`, exit 0, six of six equal to
`.ufo/waves/round-76/freeze.txt:3-8`). `git diff --stat 97bf5d56..HEAD -- scripts/
.ufo/waves/round-76/controls/c1/ .ufo/waves/round-76/claims.json
.ufo/waves/round-76/run-scored.sh` prints nothing (exit 0): no instrument byte changed after D.

Leg (a) re-measured, not read:

```
node scripts/check-dialog-r76.mjs --lane <lane> --receipt corpus/evidence/round76/chromium-js-dialog/receipt.json \
  --expect-driver-sha256 152ffc11…dd51 --expect-nonce tabi-r76-l1-97bf5d560d03 \
  --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt --json        → exit 0
```

`receipts/recheck-counter-a.json`: `verdict clean`, `checkCount 131`, `findings []`,
`priorSetFile.sha256 30f7418a…27e5b`, `priorSetFile.lines 17`, `timeline.maxAbs 0`,
`timeline.maxGap 0.333`. This reproduces `scored/status-at-dispatch.txt` exactly.

## 2. Root failures and routed defects, one row each

Status vocabulary: **CLOSED** = r76 carries a check that catches the failure and I demonstrated it;
**NOT REPEATED** = the mechanism is absent by construction; **OPEN** = the class is present and
untested here.

| # | Root failure / routed defect (round) | Status in r76 | Evidence (path:line, command, exit) |
|---|---|---|---|
| 1 | **K7 no-regression conjunct** (r60: C1 killed by its own clause that read live sibling heads) | NOT REPEATED | `claims.json:27` predicate C1-JSDIALOG-R76 legs (a)–(d) read only the receipt, the counter exit, the battery/kill-power exits, the SCORECARD row and the note. `python3` token count over the predicate: `sibling` 0, `regression` 0, `master` 0, `head` 0, `ls-remote` 0, `live` 0. No live-state conjunct exists to go red. |
| 2 | **Frozen header rejected** (r61: counter refused its own frozen snapshot header, exit 2) | CLOSED | The frozen input is `controls/c1/prior-set.txt` (17 lines, `freeze.txt:7`). The counter requires it (`check-dialog-r76.mjs:125-126`, usage exit 2 when absent) and consumes it: leg (a) re-run exit 0 with `priorSetFile.lines 17`; `--list-checks` exit 0 (the battery calls it at `negatives-dialog-r76.mjs:376` and the baseline battery passed). |
| 3 | **Post-scoring recorder/interface changes** (r61 C2: final counter ≠ frozen counter, +10,472 B) | CLOSED | Six of six `freeze.txt:3-8` digests equal at HEAD (`sha256sum`, exit 0); `git diff --stat 97bf5d56..HEAD -- scripts/ …` empty (exit 0). The scored run `2d3628fe` is after D `97bf5d56` (`git log --oneline`, exit 0). |
| 4 | **M5 AND→OR survivor** (r62: producer-verdict `&&`→`||` survived the battery) | CLOSED | `check-dialog-r76.mjs:404` is the strict `&&`; battery polarity cases at `negatives-dialog-r76.mjs:196`; my mutant run `receipts/battery-m5or.json`: battery exit 1, `allOk false`, 10 failed cases (`producer-verdict-false-CONFIRMED`, `-true-REFUTED`, `-null-CONFIRMED`, `-string-true`, `-one`, `-true-UNKNOWN`, `-true-lowercase`, `-true-UNMEASURED`, `-true-null`, `-old-field`). Committed kill power agrees: `scored/c1-kill-power-a.json` result `M5-producer-verdict-and-to-or` → `killed`, `failedCases` 5 producer-verdict cases. |
| 5 | **Contradictory duplicate / fabricated dispositions** (r62 R3: v21 adjacency checker false-greened contradictory keys and blanket labels) | **OPEN** (out of this round's instrument scope) | r76 has no adjacency instrument: `claims.json:14-30` declares one claim, C1 coverage; no `adjacency` key. The r62 v21 checker was never re-generated, so the defect is neither repeated nor closed — it is simply not exercised. The *analogous* contradiction on r76's instrument is refused: duplicate leg record → exit 1 with `leg-order`+`leg-records` (`receipts/mut-dup-leg.out.json`); producer summary vs re-derivation → `check-dialog-r76.mjs:405` `legshape-consistency`. |
| 6 | **r71 leg-b relabel leak** (r71 R1: an event that never ends leaks past the `end` relabel) | CLOSED | `check-dialog-r76.mjs:270` `leg-marks` requires `lateAfterClose === 0` and `closedAt >= last mark`; `:272` `event-leg-window` binds every event's `at` to `[mark_i, mark_{i+1}]`. My test `receipts/mut-late-event.out.json` (event at `closedAt+1` labelled with the last recorded leg) → exit 1, `event-leg-window` + the leg laws. Battery case `event-leg-domain` (`negatives-dialog-r76.mjs:136`) passed in the baseline 251/251. |
| 7a | **r72 relative battery case** (`in-wheel-anchor-2px` landed inside the counter's tolerance) | CLOSED | `negatives-dialog-r76.mjs:219-225` `placed()` recomputes the counter's own rule for the case and **throws** ("bracket misplaced") when the case is not where it claims; every bracket case calls it (`:257`, `:319`). The r76 lesson records the pass-1 failure that this guard produced (7 of 9 smokes, `lesson-proof/prefreeze-pass1/pf-smoke3.battery.json`), i.e. the guard can fail. Coordinate cases are absolute: `check-dialog-r76.mjs:398` compares `e.x !== p.at[0]` exactly. |
| 7b | **r72 replay hole** (legs (a)/(b) satisfied by a replay or nonce-rewritten pre-freeze receipt) | CLOSED except the declared limit | Battery replay cases `negatives-dialog-r76.mjs:243-263`; counter `:211` `replay-event-timeline`, plus `replay-launch-token`/`replay-devtools-url` and `:219` `prior-set-complete`. My four relabel replays of PRE `smoke1` (nonce + launch token + browser id rewritten) all exit 1: control `abs 1.0`, `+1e-12` `abs 1.0`, `+1 event` `abs 0.9737`, `−1 event` `abs 1.0` (`receipts/replay-*.out.json`). The escape that remains is the one named at `claims.json:29` and `check-dialog-r76.mjs:38-46`; witness `limit-nonuniform-retime` exit 0 (`controls-summary.json`). |
| 8a | **r73 prior-set limit** (prior set was current-generation only; a relabelled previous-generation receipt passed) | CLOSED by structure, not by a literal cross-generation prior set | Prior set = 17 r76-schema receipts (`controls/c1/prior-set.txt:2-18`). My enumeration of every file under `.ufo/waves/round-76/` and `corpus/evidence/round76/` whose top-level `schema` is `tabi-chrome-cdp-dialog-r76` at the freeze parent `7e792fa3` = exactly those 17 (python over `git ls-tree`+`git show`, exit 0). Cross-generation relabel is refused structurally: the committed r75 drag receipt under the r76 counter → exit 1, 80 findings (`receipts/crossgen-r75.json`). QUALITY 138's literal requirement (ship the older generations as priors) is met by refusal, not by inclusion. |
| 8b | **r73 1e-12 escape** (a 1e-12 `ts` change defeated the replay refusal) | CLOSED | The rule is a near-match, not equality: `check-dialog-r76.mjs:202` `TOL = 0.05`, `:211` refuses when `abs >= 0.5 || gap >= 0.75`. My relabelled prior + 1e-12 change → exit 1 with `replay-event-timeline`, `abs 1.0` (`receipts/replay-1e12.out.json`). Independently `:220-221` `event-time-quantum` bounds the grid at 1e-4 of a 0.1 ms step. |
| 9a | **r74 probe receipts outside PRE** | CLOSED | `controls/c1/prior-set.txt:2-6` carries the 4 probes and the refuted build-1 probe; the freeze-parent enumeration (row 8a) equals the file, as does `lesson-proof/prior-set-enumeration-toplevel.txt`. `check-dialog-r76.mjs:216-219` walks both trees and refuses any other schema receipt. At HEAD the walk sees 18 (17 priors + the scored receipt, which carries the expected nonce) → outside 0 (leg (a) re-run exit 0). |
| 9b | **r74 count-change near-match** (a receipt with one event added/removed escaped the near-match) | CLOSED | My replay of `smoke1` with one event inserted → exit 1, `replay-event-timeline`, `abs 0.9737`; with one event removed → exit 1, `abs 1.0` (`receipts/replay-insertev.out.json`, `receipts/replay-removeev.out.json`). Battery cases `negatives-dialog-r76.mjs:254-255` cover the prior side. |
| 9c | **r74 crash-as-kill** | CLOSED | `kill-power-r76.mjs:126-139` `classify()` returns `crashed` for an unparsable summary, any exit ≠ 1, or a positive run without finding ids; only a named failed case or a positive refusal with ids counts as a kill. Scored: `crashed []`, `killed 187`, `minimumMutantGuard {declaredChecks 131, forceTrueMutants 131, semanticMutants 56, ok true}` (`scored/c1-kill-power-a.json`). |
| 10.1 | **r75 routed 1** — r74 F4/F5 not applied | CLOSED | Section 3: both mutants killed by the battery in my independent run; committed kill power `M-timeline-tol-0.045` → `killed` (`replay-timeline-tol-in-0.049`), `M-quantum-tolerance-0.02` → `killed` (`event-time-quantum-bracket-2e-5`). Brackets at `negatives-dialog-r76.mjs:149,257,318,319`. |
| 10.2 | **r75 routed 2** — Mistakes row 5 `captured-by: none` | CLOSED | `corpus/QUALITY.md:1004` criterion 143 with the r75 red state (`w1/R75Revenger/mutant-tol-0.045.battery.json`); the r76 lesson Mistakes row 5 (`corpus/lessons/round-76.md:102`, **working tree, uncommitted** — `git diff` +12 lines; the committed lesson has no `## Mistakes`) now carries `captured-by: none — QUALITY 143 (new)`. |
| 10.3 | **r75 routed 3** — counter generation F1–F6 | CLOSED | Exact host pins `check-dialog-r76.mjs:58,185`; argv `:193` (17 args, `--headless=new` at [1], profile bound to the token); CDP error as `{code,message}` `:75,388`; structural comparison `canon()`; prior set from the committed file `:125-126`; every leg-record field read `:255` (the r75 F5 `cdpResult` gap). DataTransfer is r75's drag surface — not applicable to the dialog surface; the structural principle is applied. |
| 10.4 | **r75 routed 4** — kill-power attribution, crash class, minimum guard | CLOSED | `failedCases`/`positiveFindings` per mutant (`scored/c1-kill-power-a.json` results), `crashed []`, unmutated battery run twice (`unmutatedExit 0`, `unmutatedLastExit 0`), guard `kill-power-r76.mjs:166` (`forceTrue == declaredChecks && >= 100 && semantic >= 40`). |
| 10.5 | **r75 routed 5** — frozen limit wording | CLOSED | `claims.json:29` and `check-dialog-r76.mjs:38-46` state the 0.1 ms grid, ">= 19 of 37 events", ">= 2 of its 6 >= 50 ms gaps", `TOL 0.05`, `GAP_MIN 50`. Arithmetic checks: `ceil(37·0.5)=19`, `4/6 = 0.667 < 0.75`. |

New defect class found in r76, disclosed before data, **not** a repeat: the `prior-set-complete`
walk can refuse an honest seat run because of a *sibling's* file (`check-dialog-r76.mjs:216-219`).
The lane records it as lesson Mistakes row 6 (`corpus/lessons/round-76.md:103`) and states the
mitigation in `claims.json:13` before the wave: seat receipts are kept as `*.receipt.txt`, which the
walk does not read. It is the r61-K4 family (a frozen rule that can refuse an honest run for
reasons outside that run) in a new place; the fix is a convention, not a check, and the lane says
so. Routed, not repaired into the claim.

## 3. r74 F4/F5 (and r62 M5) applied to a COPY of the r76 counter, battery copy beside it

Method (exactly the assignment): copy `scripts/check-dialog-r76.mjs`,
`scripts/negatives-dialog-r76.mjs` and `scripts/chrome-cdp-dialog-round76.mjs` into
`/fast/scratch/hyaku/tabi-r76/R76Revenger/mut-<name>/`, apply one edit to the counter copy, run the
battery copy against the scored receipt with the committed prior set and the three laundered
degenerates. The battery resolves the counter *beside itself* (`negatives-dialog-r76.mjs:30`,
`const COUNTER = path.join(HERE, 'check-dialog-r76.mjs')`), so this is the generation's own battery,
not a reimplementation.

| Run | Counter edit (exact source string) | Battery exit | `allOk` | Failed cases | Verdict |
|---|---|---|---|---|---|
| base | none (`sha256 505055381ee4d469…dcf4`, = freeze) | **0** | true | — | 251/251, laundered 3, coverageGap 0 |
| F4 | `TOL = 0.05,` → `TOL = 0.045,` (`check-dialog-r76.mjs:202`; copy `sha256 e140c12e22879d14…a857`) | **1** | false | `replay-timeline-tol-in-0.049` | **KILLED** |
| F5 | `Math.round(v * 10)) <= 1e-4` → `<= 0.02` (`:220`; copy `sha256 da036e6901595fcf…0edf`) | **1** | false | `event-time-quantum-bracket-2e-5` | **KILLED** |
| M5 (r62) | `r.predicate === true && r.dialogHypothesis === 'CONFIRMED'` → `||` (`:404`; copy `sha256 b39ca429572e9dfe…838f`) | **1** | false | 10 `producer-verdict-*` cases | **KILLED** |

Receipts: `receipts/battery-{base,f4tol,f5grid,m5or}.json`, diffs
`receipts/mutant-{f4tol,f5grid,m5or}.diff` (each 11 lines, one hunk). The base run is the control:
the same harness on the unmutated copy is green 251/251, so a red mutant run is the mutant's doing.

This is the answer to the r74 F4/F5 question: **this generation kills them.** In r75 the same two
weakenings survived the battery 254/254 (QUALITY 143's red state). The kill is by exactly one named
bracket case each, which is what QUALITY 143 asks for.

## 4. Calibration audit — SHONEN.md and the round-76 lines of SCORECARD.md

### 4.1 SHONEN.md (unchanged since `5cdc9765`; `git diff --stat a69f9060..HEAD -- SHONEN.md` empty)

Four boxes, all `[~]`, no `[x]` (`cat -n SHONEN.md` → 4 `[~]` lines at `:5,7,9,11`).

| # | Statement (SHONEN.md:line) | Command | Observed | Verdict |
|---|---|---|---|---|
| 1 | "SKILL.md contains … decision tables" (:5) | `grep -n '^## Approval table' SKILL.md` | `:697` | true |
| 2 | "… error patterns …" (:5) | `grep -ci 'error pattern' SKILL.md` | **0** literal; substantive error/diagnostic content present (`grep -cin 'failure\|mistake\|symptom\|error'` = 102; `### Source-only diagnostic checklist — not a failure taxonomy` at `:2286`) | **wording gap, not a state contradiction** |
| 3 | "… checklists …" (:5) | `grep -in checklist SKILL.md` | `:2286` | true |
| 4 | "… cited sources" (:5) | `sed -n '1604,1617p' SKILL.md` | kaika table with a `Source` column citing corpus notes | true |
| 5 | "§Approval table (`:697`)" (:6) | `sed -n '697p' SKILL.md` | `## Approval table — finalized (every interaction class mapped)` | true |
| 6 | "§Evidence ladder" (:6) | `grep -n '^## Evidence ladder' SKILL.md` | `:361` | true |
| 7 | "§Runbook" (:6) | `grep -n '^## Runbook' SKILL.md` | `:87` | true |
| 8 | "`:1598-1617` kaika decision rows" (:6) | `sed -n '1598,1617p' SKILL.md` | `:1598` heading, `:1604-1617` three-row decision table | true |
| 9 | "prior `[x]` named lane-dispatched TABI-B4/TABI-R3-4 — not non-author (orchestrator ruling, kaika round 1)" (:6) | `sed -n '102,104p' corpus/lessons/kaika-fleet-round-1.md` | M-2: boxes "regenerated verbatim … all `[~]` with pointers. The L0 promotion premise is withdrawn." | true (the ruling is recorded as a closure finding, not verbatim "orchestrator") |
| 10 | "`multi-step-journey.md` §1–§2, §7" (:8) | `grep -n '^## ' corpus/knowledge/multi-step-journey.md` | `:12` §1, `:71` §2, `:252` §7 | true |
| 11 | "4-page loopback journey, 2 cold runs byte-identical" (:8) | `grep -n 'four pages\|byte-identical' …`; `sed -n '75,97p' LOG.md` | note `:139`, `:211`; LOG "4-page loopback journey … two cold runs byte-identical + two warm" | true |
| 12 | "logged in `LOG.md` round-3 entry" (:8) | `sed -n '75,97p' LOG.md` | bullet `- 2026-10-14 — round 3: …` (no `## Round 3` heading; the early log is date-bulleted) | true |
| 13 | "`executor-test-sufficiency.md` §0, §4" (:10) | `grep -nE '^## ' …` | `:20` §0, `:175` §4 | true |
| 14 | "verdict SUFFICIENT" (:10) | `grep -n SUFFICIENT …`; `sed -n '175,180p' …` | `:57`; "Verdict: the upgraded document is sufficient to execute and to grade …" | true |
| 15 | "the executor was a lane-dispatched seat" (:10) | `sed -n '1,3p' …`; `sed -n '77p' LOG.md` | "Seat TABI-R3-4"; LOG lists TABI-R3-4 under the round-3 seats | true |
| 16 | "`PROVINCE.md:3-19`" (:12) | `sed -n '3,19p' PROVINCE.md` | Domain / Owns / Refuses | true |
| 17 | "refusal routes revenger/kaidoku/kake/kagi held (`refusal-receipt.txt`)" (:12) | `cat corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` | 4 lines, `present <lane>` each | **weak citation**: the artifact shows the lanes are present, not that the routes are held |
| 18 | "PROVINCE.md still accurate" (:12) | `git log --oneline -3 -- PROVINCE.md` | last touched `b4a66f92` (round 69); r75 connector found no overlap | not contradicted |

Box marks: box 2's criterion ("at least one end-to-end domain task executed and logged") **is**
satisfied by committed bytes (rows 10–12) while the box is `[~]` — an **under-claim** (safe
direction). Boxes 1, 3, 4 are partly satisfied but not non-author-verified, which is what `[~]`
says; accurate.

### 4.2 SCORECARD.md round-76 lines

`git show HEAD:SCORECARD.md | grep -c '^## Round 76'` → **0**. The section does not exist at the
measured revision (last is `## Round 75` at `:3751`), consistent with
`scored/status-at-dispatch.txt` ("leg (d) pending integration"). There are therefore **no round-76
self-assessment statements to contradict**; the audit's SCORECARD component is empty, not clean.

The only committed line about r76 is the Round 75 block's plan sentence (`SCORECARD.md:3769`,
"Planned (r76): …"). Treated as a prediction, 7 items: host version/product + headless argv (true,
`:58,193`), CDP error code (true, `:75,388`), structural DataTransfer comparison (not applicable —
the surface changed to dialogs; the structural principle is applied), prior set from the committed
file (true, `:125-126`), both tolerances and both replay thresholds bracketed (true — section 3),
kill attribution + crash classification (true — row 10.4), R75Mut1's 26 witnesses folded in
(**not applicable**: they are drag-counter mutants; `claims.json:8` carries them explicitly,
"Carried, not claimed … no generation of those counters is built this round"). 0 contradictions.

### 4.3 Mismatch count

- **Statements a command contradicts: 0.**
- Under-claims: **1** (SHONEN box 2 — criterion satisfied, marked `[~]`).
- Weak citations: **1** (SHONEN box 4 — the receipt shows presence, not route-holding).
- Wording gaps: **1** (SHONEN box 1 — literal "error patterns" absent, substantive content present).
- SCORECARD round-76 statements: **0** (section absent).

The lane's self-assessment in this round errs by claiming **less** than the repo shows, never more.
That is the opposite of the r60–r75 failure mode (over-claim then kill), and it is the only
calibration movement I can measure here.

## 5. Open items routed (none is a repeat)

1. **r62 R3** — the adjacency-ledger checker that false-greened contradictory duplicate
   dispositions has no successor in r76; the class is untested, not fixed. If an adjacency claim
   returns, the new checker must carry the contradictory-key and blanket-label controls.
2. **`prior-set-complete` cross-seat convention** — lesson Mistakes row 6, `claims.json:13`. A
   convention, not a check; a seat that writes a `*.json` receipt into the wave tree will make
   another seat's honest run exit 1. Watch leg (b).
3. **Gate registry / selftest not committed at the measured revision** — `git ls-tree -r --name-only
   HEAD -- scripts/ | grep selftest` lists r69–r75 only; `git show HEAD:SKILL.md | grep -c
   'check-dialog-r76'` → 0; `scripts/selftest-r76-gates.mjs` is untracked (`git status --porcelain`
   `?? scripts/selftest-r76-gates.mjs`). This is in-flight integration work, not a committed pointer
   to a missing file (the r61 R1 class), so I do not score it as a repeat — but the round cannot
   close without it.
4. **Lesson `## Mistakes` is uncommitted** — `git diff -- corpus/lessons/round-76.md` is +12 lines
   (the Mistakes table) in the working tree only; the committed lesson has `## Gate` and no
   `## Mistakes`. Pending integration.
5. **`w1/` is untracked** — `?? .ufo/waves/round-76/w1/`; the wave is live at measurement time, so
   this is expected, not a leftover like r61 R1 / r62 R1.

## 6. Receipts beside this report

`receipts/recheck-counter-a.json` (leg (a) re-run, exit 0) · `receipts/crossgen-r75.json` (r75 drag
receipt under the r76 counter, exit 1, 80 findings) · `receipts/battery-base.json` (control, exit 0,
251/251) · `receipts/battery-f4tol.json`, `receipts/battery-f5grid.json`,
`receipts/battery-m5or.json` (exit 1 each, named failed cases) ·
`receipts/mutant-{f4tol,f5grid,m5or}.diff` (the exact counter edits) ·
`receipts/replay-{control,1e12,insertev,removeev}.out.json` (relabelled-prior replays, exit 1 each) ·
`receipts/mut-{insertev,removeev,dup-leg,late-event}.out.json` (direct counter mutations, exit 1
each) · `receipts/mut-1e12.out.json` (the scored receipt with one `ts` moved by 1e-12: exit 0
`clean` — correct and not a counterexample, because the scored receipt is not a prior and there is
no timeline to match; the r73 escape is the *replay* case, `receipts/replay-1e12.out.json`, exit 1).

Scratch `/fast/scratch/hyaku/tabi-r76/R76Revenger/` removed at exit; every receipt cited above was
copied here first.
