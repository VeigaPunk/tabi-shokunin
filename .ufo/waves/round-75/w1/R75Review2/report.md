FINDINGS

# R75Review2 — negative battery and kill-power review (tabi round 75, C1)

Scope: `scripts/negatives-dragdrop-r75.mjs` (frozen `9df82b2e…0721`) and
`.ufo/waves/round-75/controls/c1/kill-power-r75.mjs` (frozen `c227da00…b68f`), at the bytes in
`.ufo/waves/round-75/freeze.txt:3-6`. Verified:

```
sha256sum scripts/negatives-dragdrop-r75.mjs .ufo/waves/round-75/controls/c1/kill-power-r75.mjs
9df82b2eab2adb733123a209b51b596a64d71f552298fe894b33accaac9f0721  scripts/negatives-dragdrop-r75.mjs
c227da0042465488dc503f2f00381e156e226ee7d850994e1df32cd82833b68f  .ufo/waves/round-75/controls/c1/kill-power-r75.mjs
```
exit 0. All experiments wrote only under `/fast/scratch/hyaku/tabi-r75/R75Review2` (deleted before
yield); every result and every modified input cited here is preserved in `receipts/` beside this file,
and each modified input differs from its frozen source by the single inserted/replaced line quoted in
the section that uses it (`receipts/counter-copy-*.mjs`, `battery-copy-flaky-case.mjs`,
`kill-power-copy-*.mjs`; `diff` against `scripts/`, exit 1 = differs, one hunk each). No git/jj
mutation, no lane/fleet file touched, no tool installed. A *lane* below is a directory
driving `scripts/{check-dragdrop-r75.mjs,negatives-dragdrop-r75.mjs,chrome-cdp-dragdrop-round75.mjs}`;
substituting a preserved copy from `receipts/` for the frozen script reproduces each experiment.

Headline: the battery's own refusal logic is sound (answer to (1) and (2): no case can pass with its
expected id absent; no relative mutation can fall inside a tolerance). **The kill-power document is
not**: `killed` is decided by `battery exit 1 && parsable summary && failed.length > 0`
(`kill-power-r75.mjs:115`), and the battery emits `failed: ["(positive)"]` with **zero cases run**
whenever the positive run is not clean (`negatives-dragdrop-r75.mjs:291,310`). I reproduced
`holds: true` while the only mutant's battery executed no case at all (`receipts/
killpower-crash-mutant.summary.json`). That is the round-74 F1 shape one level down: r74 made a
crashed **battery** non-killable, but a crashed **counter** — and a zero-case run — still counts as a
kill.

## 1. QUALITY 135 — three PRE smokes re-run: no drift, no tolerance-crossing mutation (PASS)

Command (per smoke n ∈ {3,6,9}; priors = the other 8 smokes + 3 laundered degenerates + 4 probes =
15 PRE receipts; nonce from `smoke<n>.args.txt` field 1; `--jobs 6`):

```
node tabi-shokunin/scripts/negatives-dragdrop-r75.mjs \
  --real .../controls/c1/smoke<n>.receipt.json --expect-driver-sha256 d604552e…8105 \
  --expect-nonce tabi-r75-smoke<n>-<8hex> <15 --prior> <3 --laundered> \
  --work /fast/scratch/hyaku/tabi-r75/R75Review2/work-b<n> --jobs 6 --json
```
exit 0,0,0 — `cases 254, passed 254, allOk true, failed [], isolated 154, coverageGap 0`
(`receipts/battery-smoke3.json`, `battery-smoke6.json`, `battery-smoke9.json`). Compared with the
committed `pf-smoke{3,6,9}.battery.json` after deleting `real` and `counterLine`: **byte-identical,
`sameAsCommitted true` for all three** (node -e comparison, exit 0). So the committed pre-freeze
battery evidence reproduces on receipts that were not the ones it was produced on — the round-72
`in-wheel-anchor-2px` failure mode does not recur here.

Is any refusal case's mutation relative to an honest value such that it could fall inside a tolerance
on some honest receipt? **No.** The relative mutations and what they must cross:

| case | mutation | threshold | margin |
|---|---|---|---|
| `coordinate-law`, `coordinate-law-y` | `x/y += 1` on one event | exact integer equality against the **FROZEN plan** (`check-dragdrop-r75.mjs:301-303`), not against the measured value | infinite — any non-zero change crosses |
| `leg-*-state-drops`, `leg-*-dt` | `drops += 1`, `items += 1` | exact string compare of the re-derived view | infinite |
| `devtools-port-binding` | `port += 1` | `dl.port === argvPort` exact | infinite |
| `allowlist-id-gap` | `id += 100` | `c.id === i+1` exact | infinite |
| `event-time-quantum(-at)` | `ts/at += 0.03` | `onGrid` 1e-4 (`:185`) | 300× (an on-grid value +0.03 sits 0.03 or 0.07 off the 0.1 grid) |
| `run-window-short/long` | `started+4000`, `started+700000` | `>= 4500 && < 600000` (`:188`); honest runs 8038–8276 ms | 500 ms / 100 000 ms |
| `replay-timeline-*` | prior derived from the receipt itself, shifted ±0.04, 0.7, 1 ms, 100 ms | `TOL 0.05`, `FRAC 0.5`, `GAP_FRAC 0.75` (`:175,184`) | ±0.04 is inside 0.05 **by design** (detection direction); 2/3 ≥ 0.5; whole shifts keep gaps exact → gap fraction 1.0 |
| `accept-prior-retimed-*` | 0.2–3.9 ms | must stay **outside** 0.05 | ≥ 4× |

The only place a mutation is relative to an honest value is the timeline family, and the honest-pair
calibration is wide: across 156 ordered honest pairs, `maxAbs 0`, `maxGap 0.25` against thresholds
0.5/0.75, `minAlignedMaxDiffMs 17.6` against `TOL 0.05`
(`.ufo/waves/round-75/lesson-proof/timeline-honest-pairs.json`); the 13 committed counter runs
reproduce `maxAbs 0`, `maxGap ≤ 0.25` (`pf-smoke*.counter.json`, `scored/c1-counter-a.json`).

## 2. Isolation — expected-id absence cannot pass; must-accept accepts nothing distinguishable (PASS, two residual masks)

* **Absence cannot pass.** `negatives-dragdrop-r75.mjs:286` requires
  `o.exit === 1 && ids.includes(c.expect) && extra.length === 0`. `alsoAllowed` only widens the
  *extras*, never the required id. Live confirmation from the scored control: the `coordinate-law`
  force-true mutant is killed with `failedCases: ["coordinate-law","coordinate-law-y",
  "coordinate-law-dragstart"]` (`scored/c1-kill-power-a.json`, node -e exit 0) — i.e. removing the
  id's ability to fire fails exactly the cases that expect it. 146/146 force-true mutants killed the
  same way; a forced-true check cannot fail the positive run, and none of the 146 force-true kills is
  positive-only (the single positive-only kill in the artifact is the semantic `M-drop-polarity`), so
  every one of the 146 ids is backed by a case refusal.
* **No must-accept case accepts a distinguishable forgery.** All five accept cases were checked
  against the produced receipts: `accept-real-key-order` differs from the honest receipt from byte 2
  (key permutation only), `accept-on-grid-exact-decimal` rewrites `728.2999999523163 → 728.3`
  (≤1e-4 off-grid noise, inside the counter's own 1e-4 `onGrid` tolerance), `accept-mark-equal-
  event-at` moves one `dragover` to the leg mark `1971.5` (on-grid, window-valid),
  `accept-prior-*` perturb a *prior*, never the receipt. None relaxes a law
  (`receipts/acc-accept-*.json` vs `controls/c1/smoke3.receipt.json`, node -e exit 0; the battery's
  laundering rewrote `legShape`, so the comparison ignores that key).
* **Residual mask A (co-firing).** 82 of 246 refusal cases name a law id in `alsoAllowed`; 39 per-leg
  cases allow 13 ids each (`also(k) = perLeg(leg) \ {stated key} ∪ LAWS_ALL`,
  `negatives-dragdrop-r75.mjs:231,234`), and 92 cases co-fire ≥2 ids (max 23). A check that
  over-fires *only on a perturbed receipt* is therefore invisible: the positive run catches universal
  over-firing, but there is no over-firing mutant class in kill power (both classes make a check
  weaker, never broader).
* **Residual mask B (duplicates).** `extra` filters every occurrence of the expected id (`:285`), so a
  counter that emitted the expected finding twice would still pass; duplicate diagnostics are not
  detected.

## 3. The `--first-failure` fast path — an unrelated failure *is* a kill (HIGH)

`stopped` is set by the first case that is not as expected, whatever the cause
(`negatives-dragdrop-r75.mjs:290-296`), and when it is already true at start (`FIRST && !positiveOk`)
**no case runs at all** (`:291`). The summary then carries `failed: ["(positive)", …]` and exits 1
(`:310-311`), which kill power reads as `killed` (`kill-power-r75.mjs:115`). Neither program ever
relates the failing case to the mutant: `failedCases` is *recorded* and never inspected.

**(a) Zero-case kill, live in the scored artifact.** `scored/c1-kill-power-a.json` contains
`{"cls":"semantic","mutant":"M-drop-polarity","outcome":"killed","killed":true,
"failedCases":["(positive)"]}` (node -e, exit 0) — one of the 40 "semantic killed" has no case
evidence. The mechanism is real, not a crash: applying that edit to a counter copy makes the *honest*
receipt fail on `drop-acceptance-law`
(`node receipts/counter-copy-drop-polarity.mjs --receipt smoke3.receipt.json … --json` →
`verdict findings findings ['drop-acceptance-law']`, exit 1). So `--first-failure` short-circuits all
146-check coverage for any mutant that trips the positive run, and the kill document cannot say which
check, if any, caught it.

**(b) A counter that throws is a kill, and `holds: true`.** Kill-power copy with one added mutant
whose edit makes the counter throw (`(() => { throw … })()`, behaviourally a broken build), run
against a pristine lane:

```
node receipts/kill-power-copy-throwing-mutant.mjs --lane <lane of frozen scripts> --real smoke3.receipt.json \
  --expect-driver-sha256 d604552e…8105 --expect-nonce tabi-r75-smoke3-7aeac5eb \
  --prior smoke1 --prior smoke2 <3 --laundered> --work … --out …/kp-throw.summary.json --jobs 2
```
exit **0** → `{"base":"survived","semantic":{"mutants":1,"killed":1},"crashed":[],"survivors":[],
"holds":true}`, mutant `failedCases: ["(positive)"]`
(`receipts/killpower-crash-mutant.summary.json`). The battery behind that "kill" executed **zero**
cases: `node <lane with receipts/counter-copy-throwing.mjs>/negative… --first-failure --json` → `{cases:0, passed:0, stoppedEarly:true,
positiveOk:false, failed:["(positive)"], allOk:false}`, exit 1
(`receipts/killpower-crash-lane.battery-ff.json`). A build-breaking mutant passes the kill-power leg
(c).

**(c) A flaky case kills an inert mutant while the base survives.** Battery copy with one injected
case that throws on `Math.random() < 0.5`, kill-power copy with one *inert* mutant (detail string
`schema  → String(schema)`; identical verdicts). Eight trials,
`receipts/killpower-flake-trial{1..8}.summary.json`, verdicts
`[base, mutant, mutant.failedCases, holds]`:

```
1 survived killed ["flaky-case"] true      5 killed survived [] false
2 killed   killed ["flaky-case"] false     6 killed survived [] false
3 killed   killed ["flaky-case"] false     7 killed killed   ["flaky-case"] false
4 killed   survived [] false               8 survived survived [] false
```

So the control can report `holds: true` on a kill produced by a case with no relation to the mutant
(exit 0 for trial 1), and in trials 2,3,7 the same flake kills the base — the flake is visible only
because the base is a single run, while every mutant gets its own. The copies differ from the frozen control only in (i) one appended mutant and
(ii) the task list trimmed to `[unmutated, that mutant]`; the classification lines under test
(`kill-power-r75.mjs:94-118,130`) are untouched, and both copies are in `receipts/`.

**(d) The timeout path is the same signature, latent today.** The battery SIGKILLs a counter at 60 s
(`negatives-dragdrop-r75.mjs:266`), which yields `{exit:null, findingIds:null, ok:false}`. Demonstrated
with a counter copy that blocks 62 s on one case:
`node <lane with receipts/counter-copy-60s-block.mjs> --first-failure --json` → exit 1,
`{cases:251, passed:250, stoppedEarly:true, positiveOk:true, failed:["coordinate-law"]}`, failing case
`{"case":"coordinate-law","exit":null,"findingIds":null}` (`receipts/battery-timeout-60s.json`). That
document is byte-for-byte the shape kill power consumes as `killed`. Calibration: a counter invocation
costs 149 ms (20 serial runs on smoke3, 2987 ms, exit 0), i.e. 400× below the 60 s cap at load
13.8/112/187 — the timeout kill is latent, not live, unless the host degrades further.

## 4. Crash classification — a crashed counter is never `crashed` (HIGH)

Question (4): does kill power still score a crashed battery as crashed? **Only a crashed *battery*.**
`crashed` is the else-branch of `kill-power-r75.mjs:115`, reachable only when the battery exits
non-1/non-0 or prints an unparsable summary. A counter that dies leaves the battery healthy, so its
crash becomes ordinary case/positive failures. Full kill-power run on a lane whose counter throws on
every receipt:

```
node …/controls/c1/kill-power-r75.mjs --lane <lane with receipts/counter-copy-throwing.mjs> --real smoke3.receipt.json … \
  --prior <15> --laundered <3> --work … --out …/kp-crash.summary.json --jobs 6
```
exit 1 → `{"unmutatedExit":1,"unmutatedOutcome":"killed","mutants":186,"killed":186,"crashed":[],
"survivors":[],"holds":false}` (`receipts/killpower-crash-lane.summary.json`); the base's
`failedCases` lists all 254 case names plus `(positive)`, and every mutant's is `["(positive)"]`. The
counter crash is scored as a **kill**, both for the base and for all 186 mutants; the `crashed` bucket
stays empty. `holds:false` here is produced only by the base, not by any crash detection.

Conversely, a *survivor* can be scored `crashed` (conservative, but it means `crashed` is not evidence
of a counter defect): kill-power copy with one mutant that prefixes a line to the counter's
`--list-checks` stdout — every per-receipt verdict unchanged —

```
node receipts/kill-power-copy-listchecks.mjs --lane <lane of frozen scripts> … \
  --out receipts/killpower-inert-listchecks.summary.json --jobs 2
```
exit 1 → `{"base":"survived","mutant":"M-inert-listchecks-prefix","outcome":"crashed","killed":false,
"crashed":["M-inert-listchecks-prefix"],"holds":false}`
(`receipts/killpower-inert-listchecks.summary.json`).

## 5. `holds` has no minimum-mutant guard (LOW, vacuous truth)

`holds: base.batteryExit === 0 && base.outcome === 'survived' && muts.every((m) => m.killed)`
(`kill-power-r75.mjs:130`). `muts.every` is vacuously true for an empty mutant list, and the two
counts (`forceTrue.mutants`, `semantic.mutants`) are reported but never asserted. A lane counter whose
`--list-checks` yields `[]` (the battery would then cover nothing: `coverageGap = listed ∩ ¬covered`
is empty, `negatives…:306-308`) plus the 40 semantic mutants would still satisfy (c) with zero
force-true mutants — i.e. no id is shown to be necessary. Remote, but the predicate reads it as a
pass.

## What holds

* Battery reproduces exactly on 3 unsupervised PRE smokes; 254/254 with full 146-id coverage; all
  refusal cases require their own id; all five must-accept cases perturb only unconstrained fields.
* `--first-failure` never raises `allOk` (`:311` requires `!stopped` and the full result count), so a
  truncated run can never be mistaken for a clean one at the *battery* level — the defect is purely
  that `killed` does not require the same evidence.
* `p.on('close')` (not `exit`) in kill power (`kill-power-r75.mjs:96-100`) correctly waits for stdout
  to drain; no truncated-summary crash was observed across the ~217 battery processes run here (187 of them in the
  crash-lane run).
* The 60 s cap and the 149 ms mean invocation cost put the timeout kill 400× away at today's load.

## Residual risk

1. Any mutant whose batch stops early — crash, broken edit, flake, timeout — is indistinguishable
   from a genuine kill in the (c) document; the only visible difference is `failedCases`, which no
   consumer reads. Predicate leg (c) is therefore weaker than "the battery kills each mutant": it
   certifies "the battery was unhappy in the presence of each mutant".
2. Two of the 40 semantic kills rest on no case at all in kind (one, `M-drop-polarity`, does so in the
   scored run today), so 146-check coverage is not established per mutant.
3. No over-firing mutant class exists, so `alsoAllowed` breadth (82 cases allow a law; 39 allow 13
   ids) is unexamined by the control.
4. `crashed` conflates "counter broken" with "battery plumbing broken"; a real counter defect that
   only breaks the CLI would be reported as a crash (holds false) and never as a kill, so the
   `forceTrue`/`semantic` counts are not a measure of the counter's robustness.

## Verification gaps (unrun)

* No full 186-mutant kill-power run was executed here on the crash/throwing lanes (only 1-mutant
  trimmed copies); the trim is disclosed per experiment and the classification lines are unchanged.
* The 60 s timeout was simulated with a 62 s block, not with real host degradation; the 400× margin is
  a measurement (149 ms mean), not a demonstration of a live timeout.
* The flaky-case demonstration uses an injected `Math.random()` case, not an observed natural flake
  (none exists — every case is deterministic on a fixed receipt).
* Views expressed are recommendations; this seat edited, judged and admitted nothing.

Report: .ufo/waves/round-75/w1/R75Review2.md
