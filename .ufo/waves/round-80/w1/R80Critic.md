# R80Critic — falsification report (tabi round 80, w1, seat R80Critic)

Scope: read-only. No commit, no push, no mutating git/jj. Evidence JSON under
`.ufo/waves/round-80-seats/R80Critic/`; scratch `/fast/scratch/hyaku/tabi-r80/R80Critic/` deleted after the run.
The frozen predicate, counter, pins, priors, thresholds and kill rule are attacked, never amended.

## Verdict

- **C1-SHOWPICKER-R80 is NOT verified as frozen.** Leg (a) fails by one check on the frozen nonce; leg (c)
  fails on one kill-power survivor; leg (b) is not established because the scored run itself was an honest
  refusal under the frozen counter. The lane has moved "D" three times after the assignment's D and is
  editing the counter uncommitted.
- **C2-RECORDDRIFT-R80 is NOT verified as frozen.** The r79 leg is truth-bound; the self-drift leg is a
  consistency check against the scored outputs and passes a red battery (100/103 failed) and a `findings`
  counter verdict. The kill rule's "a correction present while the truth it names is wrong" is not
  enforced. Two control files the frozen claims cite do not exist.
- **Axis: coverage** (deciding sentence quoted in §6). The predicate's "first-working round 80" contradicts
  the capability table's first-working round 79.

## 1. C1 limit sentence — exact escape minimum and a boundary forgery

Frozen counter `scripts/check-showpicker-r80.mjs` = `f22db0ac…` (the D3 and D5 pin; D4/D5 did not change
it). Its `limit` block on the committed priors (23 events, 1 gap each) prints:

```
priorEvents 23, priorGaps 1, absNeed 12, gapNeed 1, escapeEvents 12, escapeGaps 1
```

so the **exact escape minimum is 12 page-event times AND 1 gap** per 1-gap prior (the scored receipt as a
prior, 4 global gaps: 12 events and 2 gaps, `escapeGaps 2`). Evidence: `probe3-clean.json`,
`fg-12ev-nogap-D3-frozen-out.json`.

Forgery at the boundary (base = committed probe3, a prior; identity fields rewritten: nonce → the scored
nonce, fixture sha → the scored fixture sha, 7 fresh 12-hex launch tokens, 7 fresh devtools browser ids;
11 events' `ts` +1000.0 and the answer-leg click's `at` +5.0 = 12 moved events; the single matched gap
moved):

| forgery | frozen counter (f22db0ac) | working counter (8db6a43a) |
|---|---|---|
| 12 events + 1 gap | **exit 0, clean, 57/57** (`forged-boundary12-out.json`) | exit 0 |
| 11 events + 1 gap | exit 1, `replay-event-timeline`, absMatched 12 ≥ 12 (`forged-below11-out.json`) | exit 1 |
| 12 events + 0 gaps | exit 1, gapMatched 1 ≥ 1 (`fg-12ev-nogap-D3-frozen-out.json`) | **exit 0, clean, 57/57** (`fg-12ev-nogap-WORKING-out.json`) |

The boundary is exact. Consequence: a clean verdict is not evidence of a fresh run; the replay rule's
protection is 12 event-times (and, on the frozen counter, 1 gap). This is the disclosed limit, but it is
the *only* thing separating the scored receipt from a relabelled prior, because the prior was produced by
the same driver and satisfies the plan/law checks.

Cold-run independence is also not established: a second "cold run" with the same fresh launch tokens and
browser ids as the boundary forgery, different nonce, passes clean 57/57 (`forged-coldB-same-ids-out.json`).
`replay-launch-token`/`replay-devtools-url` compare against the prior set and the scored receipt, not
against other cold receipts, so four "fresh cold runs" can be four relabellings of one prior.

## 2. C1 identity — the frozen nonce is not the scored nonce

The assignment and the frozen claims name D = `f9ece656…`, so the frozen nonce is `tabi-r80-l1-f9ece6562c94`
(the claims' own phrasing is `tabi-r80-l1-<first 12 of D>`). The lane's receipts use other D's:

| receipt | nonce | D |
|---|---|---|
| scored receipt at 19:25 | `tabi-r80-l1-b25608296008` | D4 `b2560829` |
| scored receipt at 19:28 (current) | `tabi-r80-l1-53ecca8411dc` | D5 `53ecca84` |
| frozen claims | `tabi-r80-l1-f9ece6562c94` | D3 `f9ece656` |

Running the frozen counting command with the frozen nonce on the D4 receipt: **exit 1**, 57 checks, only
`nonce-expected` false (`scored-with-f9-nonce.json`). Under the receipt's own nonce it was clean. Leg (a)
as frozen is therefore false; the kill rule says "any of (a)-(d) false as frozen -> C1 NOT verified".

The freeze is not frozen. After D3 the same commit series rewrote the frozen claims and `freeze.txt`:

- **D4** (`b2560829`): `check-record-drift-r80.mjs` pin `6958ca31…` → `53491bf8…` (the instrument was
  changed to read the filed report from the fleet repo and the claims' phrasing was changed in the same
  commit).
- **D5** (`53ecca84`): `negatives-showpicker-r80.mjs` pin `fe91f6be…` → `87bb405d…` (the battery changed
  after the scored battery output was produced).
- **working tree, uncommitted** (19:29:21): `check-showpicker-r80.mjs` `f22db0ac…` → `8db6a43a…`
  (`gapRule = gp >= 2 && ownGaps.length >= 2`). The frozen pin no longer matches the working bytes.

Each move re-pins the instrument in the same commit that changes it, so the pin cannot detect the change.

## 3. C1 honest refusal and the kill-power survivor — the gap rule trilemma

The D5 scored run was refused by the frozen counter on `replay-event-timeline`: `gapMatched 1` against
probe2 (`gapNeed 1`), because the scored receipt's answer-leg gap is 153.2 ms and probe2's is 153.2 ms
(within 0.05 ms). The receipt is honest; the refusal is a timing collision (`scored-d5.json`: exit 1,
failed `['replay-event-timeline']`).

Root cause: `gapsOf` sorts `at` across **all legs** before diffing, so the "prior's own >= 50 ms gaps"
include inter-leg artifacts:

| receipt | global gaps |
|---|---|
| probe1 | 150.0 (deferred-timer → answer) |
| probe2 | 153.2 (answer leg, click → input) |
| probe3 | 152.4 (deferred-timer → answer) |
| D5 scored | 176.0, 83.0, 711.6 (inter-leg) + 153.2 (answer leg) |

The gap count is not a property of the driver; it varies 1/1/1/4 across four receipts, so the "exact escape
minimum" is per-run, not stable.

The working counter disables the gap side unless both the prior and the receipt carry ≥ 2 gaps. The D5
receipt is then clean 57/57 (`scored-d5-working.json`) — but the committed kill power is **81 mutants,
80 killed, 0 crashed, 1 survivor: `replay-gap-threshold-loose`** (`.ufo/waves/round-80/scored/killpower-a.json`).
The battery's `replay-gap-only-refuse` case has `gapMatched 4` vs `gapNeed 3`, so the mutant's
`gapMatched >= gapNeed + 1` still refuses; no case targets `gapMatched == gapNeed` exactly. Predicate (c)
requires 0 survivors → false.

The trilemma: the frozen counter refuses the honest run; the relaxed counter lets the gap-threshold mutant
survive; the frozen priors (1 gap each) cannot support a statistically meaningful gap side. Neither
version satisfies (a)+(b)+(c) simultaneously. The D5 battery is also red independently: 103 cases,
**100 failed**, `cleanVerdict: findings`; the D5 counter verdict is `findings`.

## 4. The no-work control

The r79 showpicker receipt under the r80 counter: **exit 1, 60 checks, 34 failed, 26 passed**
(`r79-under-r80.json`). Failed: `schema`, `nonce-shape`, `nonce-expected`, `driver-pin` (r79 driver
`e9c87159…` vs pin `cb93935c…`), `fixture-hash`, `ports-declared`, `plan-frozen`, `leg-order`,
`leg-records`, `context-binding`, `send-log-allowlist`, `plan-calls`, every `leg-sp-*` and every law,
`teardown-closure`, `child-server-log-binding`, `prior-set-complete`. It fails for the right reasons:
identity and plan, not replay. `replay-event-timeline` **passes** — the r79 run is a genuinely different
timeline, so the anti-replay rule is not what catches a stale receipt.

A do-nothing round (no new driver) passes **zero** predicate legs: (a) no r80 receipt; (b) no cold runs;
(c) no (a) receipt for the battery/kill power; (d) no r80 note, registry entry or gate selftest.

## 5. C2 — what the drift counter counts

Scratch fleet (lane copy + fleet reports + symlinked `.git`), 17 claims, `check-record-drift-r80.mjs`
`53491bf8…`. Variants:

| variant | mutation | exit | mismatches |
|---|---|---|---|
| V0 green | constructed after-state | 0 | 0 |
| V1 reversed | `battery 88/88 → battery 90/90` reversed | 1 | 1 (`sc-79-battery`) |
| V2 stale removed | `battery 88/88` deleted | 1 | 1 |
| V3 correction only | stale gone, correction kept | 1 | 1 |
| V4 r79 truth 91 | `c1-negatives-a.json` cases 90→91 | 1 | 3 (`sc-79-battery`, `log-79-cases`, `lesson-79-cases`) |
| V5 self-drift forged | scored outputs 999 + records 999 + claims 999 | **0** | **0** |
| V6 wrong correction | `battery 88/88 → battery 91/91` appended beside the correct pair | **0** | **0** |
| V7 lesson stale removed | `88 cases` deleted from the lesson | 1 | 1 |
| V8 red battery | battery 100/103 failed, counter `findings`, kill power forged 81/81, records `battery 103/103, kill power 81/81, 57 checks` | **0** | **0** |

- The r79 leg is truth-bound (V4) and append-only (V1/V2/V3/V7).
- The self-drift leg is circular (V5): its truth is the scored outputs, so a forged scored output plus
  matching records passes. The claim says exactly that, so this is a disclosed limit, not a defect — but it
  means the leg cannot detect a wrong scored output.
- The kill rule "a correction present while the truth it names is wrong -> C2 NOT verified" is **not
  enforced** (V6): the counter checks only that the exact correct pair is present; a second, wrong pair is
  invisible. This is a defect against the frozen kill rule.
- The battery's pass/fail verdict is **not read** (V8): `numbers.cases` is the only battery field used;
  `battery.failed` and `battery.cleanVerdict` are ignored, and the counter's `verdict` is not read either.
  A red battery (100/103 failed) and a `findings` counter verdict pass the drift counter as long as the
  `cases`/`checkCount` numbers match. The self-drift leg counts the claim, not the truth.
- The frozen C2 leg (c) states "battery 81/81, kill power 82/82, 57 checks" — contradicting the same
  file's C1 leg (c) ("103 cases", "81 mutants, 81 killed") and the committed outputs. `claims-80-numbers`
  passes because it checks `"103 cases"`, `"81 mutants, 81 killed"`, `"checkCount 57"`, which the C1 legs
  also contain; the wrong C2 (c) numbers are never checked. If the records were written with 81/81 and
  82/82, `numberTriples` would fail (it wants `battery 103/103`, `kill power 81/81`), so the frozen C2
  claim is unsatisfiable as written.
- Two control files the frozen claims cite are **absent at D3 and D5**:
  `.ufo/waves/round-80/controls/c1/prefreeze-summary.json` (cited in `frozenAt` for the 57-check probe,
  103/103 battery and 81/81 kill power) and `.ufo/waves/round-80/lesson-proof/c2-controls.json` (cited as
  the reversed/stale-removed control). The drift counter checks neither.
- The current lane is **exit 1, 7 mismatches** (`sc-80-numbers`, `log-80-numbers`, `skill-80-numbers`,
  `lesson-80-numbers`, `report-80-numbers`, `claims-80-numbers`, `scored-80-present`), truth
  `{checks 57, cases 103, mutants 81, killed 80}` (`drift-d5.json`). The C2 after-state is blocked by the
  C1 kill-power survivor: the records cannot honestly state 81/81 while the committed output is 81/80.

## 6. The axis

**The r80 generation is a coverage move, not quality work on the r79 instrument.** The deciding sentence is
`AXES.md`:

> `| **coverage** | Fraction of the domain's real surfaces the skill governs (repo paths, tools, edge classes) | PROVINCE.md lists every surface; none unexplored without reason |`

The three new legs are new **edge classes** the r79 receipt's 10 legs did not govern: the cross-origin
iframe (SOP boundary: `contentDocument === null`, `contentWindow.document` throws SecurityError, the child
opens its own picker), the deferred `setTimeout(…, 0)` trigger, and the trigger-then-answer path
(`DOM.setFileInputFiles` on the event's `backendNodeId`). The counter-sentence is the capability rule:

> `Rows enter only through a round that demonstrates the capability running; a capability without a passing demonstration in the round report is pre-claiming and does not enter the table.`

The row entered at r79, so r80 cannot enter a new capability row; it must land a per-axis verdict, and the
axis whose definition names new surfaces/edge classes is coverage. If the r80 work were only a re-measured
r79 leg set, it would be depth/operability, not coverage.

Calibration contradiction: `SCORECARD.md:3918` gives `chromium-showpicker-linux` first-working **round 79**;
predicate (d) asks for "capability row first-working round 80 for generation r80 (the capability first
entered at round 79)". A first-working round of 80 would misstate the table's semantics. The
capability-status counter's structural rule (the named round must list the capability) would still pass if
the round-80 section lists it, so the counter cannot catch the misstatement. Current
`check-capability-status.mjs`: exit 0, mismatches 0, provisional 1 — passes as stated.

## 7. Impacted axes

- **coverage**: C1 (a)/(b)/(c) false as frozen; the coverage claim's evidence is a moving receipt, and the
  replay/cold-run legs cannot establish freshness beyond the 12-event/1-gap limit.
- **calibration**: C2 self-drift is circular; the kill rule's wrong-correction clause is unenforced; the
  frozen claims cite absent controls and state wrong numbers; the capability row's first-working value is
  at odds with the predicate.
- **operability/freshness**: the counter is edited uncommitted; the pins move in the same commits that
  change the instruments; the scored outputs were rewritten mid-wave (0-byte `killpower-a.json`, 100/103
  failed battery, then a new nonce).

## 8. Smallest safe correction (evidence-level; no predicate/counter/pin/prior/threshold/kill-rule amendment)

1. **C1 identity**: run the scored leg with the nonce the frozen claims name
   (`tabi-r80-l1-f9ece6562c94`) under the frozen counter bytes (`f22db0ac…`), or declare the honest stop.
   The current receipt is keyed to a moving D and cannot satisfy (a) as frozen. If the lane's "D" is now
   D5, the frozen claims must be re-frozen **before** the scored run and the assignment's D corrected by
   the operator, not by a commit that re-pins the instrument it changes.
2. **C1 gap trilemma**: as frozen, the 1-gap priors make the gap side a coin flip (honest refusal) and the
   relaxed version kills no gap mutant (survivor). The only evidence-level outcome that satisfies the
   frozen kill rule is a clean run under the frozen bytes with 0 survivors; otherwise the honest stop is
   C1 NOT verified. The cross-leg `gapsOf` sort is the defect to disclose (the "gaps" are inter-leg
   artifacts, count 1/1/1/4 across receipts).
3. **C2**: the records must state the committed truth (103/103, 81/81) and the claims' C2 (c) wrong numbers
   (81/81, 82/82) must be corrected append-only to 103/103 and 81/81; the missing
   `prefreeze-summary.json` and `c2-controls.json` must be committed or their pointers withdrawn
   append-only. The counter's failure to read `battery.failed`/`cleanVerdict`/`counter.verdict` and to
   scan every `<stale> → X` pair is the defect the L1 must disclose; the claim cannot be verified by
   strings alone.
4. **Axis**: keep the capability row's first-working round 79; record the r80 generation in the round-80
   section with the new rows, note, registry and gate. Do not overwrite "first-working" with 80.

## Evidence index (seat dir)

`probe1-baseline.json`, `probe3-clean.json`, `scored-with-f9-nonce.json`, `scored-d5.json`,
`scored-d5-working.json`, `r79-under-r80.json`, `forged-boundary12-out.json`, `forged-below11-out.json`,
`forged-coldB-same-ids-out.json`, `fg-12ev-nogap-D3-frozen-out.json`, `fg-12ev-nogap-WORKING-out.json`,
`fg-11ev-nogap-WORKING-out.json`, `c2-v0-green.json` … `c2-v8-red-battery.json`, `drift-now.json`,
`drift-d5.json`.
