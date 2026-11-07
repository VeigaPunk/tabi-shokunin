FINDINGS

# R76Review2 — battery + kill-power review, round 76 C1 (chromium-js-dialog-linux)

Scope: `scripts/negatives-dialog-r76.mjs` (sha256 91874c87e26deda667d6ff7e0b772f647bae2ab1a11996d473bdf93e09e8474c) and
`.ufo/waves/round-76/controls/c1/kill-power-r76.mjs` (sha256 80107844ba3286d2e8091b7d9bf0c07406f79acab68076c879c5f17fe535aca1),
both verified byte-equal to `.ufo/waves/round-76/freeze.txt` (`sha256sum` of both files, exit 0; manifest lines 3 and 5).
Counter 505055381ee4d…, driver 152ffc116b0…, prior-set 30f7418a64… all re-hashed equal to the manifest.

Every experiment below ran on **copies** in `/fast/scratch/hyaku/tabi-r76/R76Review2/` (counter copy + battery copy + pinned
driver beside it, `--lane` still the real lane). No lane file was written except this report and its receipts.

Baseline of the frozen battery on the (a) receipt (`receipts/battery-baseline.json`, exit 0): `allOk:true`, 251/251 cases
(241 refuse, 7 must-accept, 3 laundered), `isolated 141`, `idsWithIsolatedCase 73/131`, `coverageGap []`, brackets
`{events:37, gaps:6, absNeed:19, gapNeed:5}`, 17.3 s. Matches the L1's scored status line.

## 1. Brackets

Denominators re-derived from the receipt itself: 37 paired events, 6 gaps ≥ 50 ms
(`node -e` over `corpus/evidence/round76/chromium-js-dialog/receipt.json`, exit 0) → `absNeed = ceil(37·0.5) = 19`,
`gapNeed = ceil(6·0.75) = 5`. So 19/18 of 37 and 5/4 of 6 are the right integers for this receipt.

`receipts/brackets.json` (probe `scripts/bracket-probe.mjs`, exit 0) rebuilds each bracket prior from the battery's
construction intent and asks **the counter itself** for the same numbers (its `timeline.maxAbs/maxGap`, `check-dialog-r76.mjs:412`).
My independent implementation of the rule (`check-dialog-r76.mjs:202-210`) and the counter agree on every row:

| bracket side | my abs/gap | counter maxAbs/maxGap | counter verdict |
|---|---|---|---|
| pair 0.049 alternating (refuse) | 37/37 abs, 2/6 gap | abs 1, gap 0.3333 | findings `replay-event-timeline` |
| pair 0.051 alternating (accept) | 0/37 abs, 2/6 gap | abs 0, gap 0.3333 | clean |
| abs 19/37 (refuse) | 19/37 = .5135, gap 0/6 | abs .51351, gap .3333 | findings |
| abs 18/37 (accept) | 18/37 = .4865, gap 0/6 | abs .48649, gap .3333 | clean |
| gap 5/6 (refuse) | gap 5/6 = .8333, abs 0 | gap .83333, abs 0 | findings |
| gap 4/6 (accept) | gap 4/6 = .6667, abs 0 | gap .66667, abs 0 | clean |
| jitter non-uniform (accept) | 0/37, 0/6 | abs 0, gap .3333 | clean |

Co-firing is excluded here, not merely tolerated: the honest receipt's sims against **all 17 priors** are `maxAbs 0`,
`maxGap 0.3333` (2/6) — far below both thresholds — so in each bracket case the only prior that can trigger
`replay-event-timeline` is the one the case constructs. The 4 refusal sides are `isolated:true` with `alsoAllowed:[]` in the
baseline (`replay-timeline-tol-in-0.049`, `replay-timeline-abs-at-threshold`, `replay-timeline-gap-at-threshold`,
`event-time-quantum-bracket-2e-5`), so no second finding id rides along; the 4 accepting sides are must-accept cases, where
`isolated` is false by construction.

Boundary mutants on battery copies (`receipts/mutants-bracket.json`; harness `scripts/mutants.mjs`, one exact-string counter
edit each, `--first-failure`):

| mutant | outcome | killed by |
|---|---|---|
| `TOL 0.048` | KILLED (exit 1) | `replay-timeline-tol-in-0.049` |
| `TOL 0.052` | KILLED | `accept-prior-tol-out-0.051` |
| `FRAC 0.52` | KILLED | `replay-timeline-abs-at-threshold` |
| `FRAC 0.48` | KILLED | `accept-prior-abs-below-threshold` |
| grid `<= 5e-5` | KILLED | `accept-grid-5e-6` |
| `GAP_FRAC 0.84` | KILLED | `replay-timeline-gap-at-threshold` |
| `TOL 0.0495` | SURVIVED 251/251 | — (inside the class) |
| `FRAC 0.51` | SURVIVED | — |
| `GAP_FRAC 0.67` | SURVIVED | — (0.67 > 4/6) |
| grid `<= 1.5e-4` | SURVIVED | — |

Necessity (`receipts/necessity.json`, exit 0): deleting **one** case line from a battery copy lets exactly the mutant that
case was measured to kill survive the whole 251-case battery with `allOk:true` — verified for
`replay-timeline-tol-in-0.049`, `accept-prior-tol-out-0.051`, `replay-timeline-abs-at-threshold`,
`accept-prior-abs-below-threshold`, `replay-timeline-gap-at-threshold`, `accept-prior-gap-below-threshold`,
`event-time-quantum-bracket-2e-5`, `accept-grid-5e-6` (8/8). Each bracket case is load-bearing and 1:1 attributable.

**Equivalent threshold ranges at this receipt's granularity** (each verified by the surviving/killed probes above):
- pair tolerance `TOL` ∈ **(0.049, 0.051]** — refusal needs `0.049 < TOL` (strict `<`, `check-dialog-r76.mjs:205`), acceptance needs `¬(0.051 < TOL)`.
- `FRAC` ∈ **(18/37, 19/37] = (0.48649, 0.51351]**.
- `GAP_FRAC` ∈ **(4/6, 5/6] = (0.66667, 0.83333]**.
- grid threshold ∈ **[5.0000000556e-5, 1.9999999986e-4)** — measured FP diffs: accept case `5.000000055588316e-5`, refusal case `1.9999999986e-4` (0.00019999999986) (`node -e`, exit 0). A mutant at exactly `5e-5` is killed because the accept-case diff is a hair above 5e-5.
- `GAP_MIN` ∈ **(−∞, 301.7]** as far as the battery can see (`100/200/290` survive all 251 cases; `320` refuses only via the
  positive run) — see F1; this threshold is not bracketed at all.

## 2. Attribution, crash classification, flake guard

Read of the frozen classify path: `kill-power-r76.mjs:126-138` (named = `failed` minus `(positive)`/`(coverage-gap)`; `killed`
at :132, `killed-positive` at :135 requiring `positive.exit === 1` **and** a non-empty `findingIds`), `:153` (`killed`
is true for both outcomes), `:174` (`holds` accepts `killed-positive` and both unmutated runs). Case verdicts come from
`negatives-dialog-r76.mjs:356`: `ok = exit === 1 && ids.includes(expect) && extra.length === 0`.

**(2a) Killed without a named case?** Not as `killed` — `:131-132` needs a case name and the battery's `failed` list contains
only `(positive)`, `(coverage-gap)` and result case names (`:381`); `(coverage-gap)` alone therefore classifies `crashed`.
But `killed-positive` **is** scored as killed with no case name (`:153`), and it is reachable without any receipt-level
defect: one edit at the counter's own internal-error channel
(`const missing = CHECK_IDS.filter(...)` → `.concat(['ghost'])`) makes the honest receipt emit `counter-internal`, and the
trimmed control reports `killed-positive`, `positiveFindings:["counter-internal"]`
(`receipts/killpower-attribution.json`, exit 1). So "killed" does not imply a receipt property was detected.

**(2b) Killed-positive by a crash?** Two arms measured (`receipts/killpower-attribution.json`, `receipts/killpower-crash-findings.json`):
- plain crash → **`crashed`**: a counter that throws unconditionally exits 1 with 0 bytes of stdout (`receipts/crash-stdout-empty.txt`
  is 0 bytes, `receipts/crash-stderr.txt` is the stack, `CRASH EXIT=1`), so the battery's `positive.findingIds` is `null` and
  `:135` refuses the `killed-positive` label; the frozen counter registers no process handler at all
  (`grep -n uncaught scripts/check-dialog-r76.mjs` → no match, exit 1; `grep -c "process.on"` → 0, exit 1).
- crash **that prints a findings array and exits 1** → **`killed-positive`** (`positiveFindings:["internal-crash"]`, exit 0 of the run):
  `classify` cannot tell that from a refusal. Latent, not live: it requires a counter-side handler the frozen bytes do not have.

**(2c) Killed by a crash/timeout instead of a refusal — live defect.** A counter that throws only on the mutated receipt
(`failures-empty` path) is scored **`killed`, failedCases `["failures-empty"]`** (`receipts/killpower-attribution.json`), although
the counter emitted no verdict at all (0-byte stdout, stack on stderr). Same code path measured for a hang
(`receipts/mutants-timeout.json`, exit 0 of the harness; 120.9 s wall): the counter blocks 65 s, the battery's
`setTimeout(() => p.kill('SIGKILL'), 60000)` (`negatives-dialog-r76.mjs:335`) kills it, and the outcome is again
**`killed`, failedCases `["failures-empty"]`, `casesRun 248`**. Any non-zero/non-1 exit, any crash, or any timeout makes the
case fail, which `:131-132` then records as a named kill. Consequence: `holds` cannot distinguish "the check refused the
mutated receipt" from "the counter died on it", and a load-induced timeout is a false kill.

**(2d) Flake guard.** Injected case `add('flake-inject','driver-pin', r => { if (Math.random() < 0.5) r.driverSha256 = '0'.repeat(64); })`
in a battery copy on a shadow lane; trimmed control (2 force-true + 2 semantic, `scripts/kp-flake.mjs`), inert mutant
`TOL = 0.05000000001` (inside the equivalence class):
- 3 random trials (`receipts/killpower-flake-rand1..3.json`): the run was rejected in **3/3** — rand1 by the *first* unmutated
  run (`killed`, failedCases `["flake-inject"]`), rand2/rand3 by the *last* unmutated run. The inert mutant was spuriously
  `killed` in rand2/rand3 (`failedCases:["flake-inject"]`). Theoretical catch rate for p=0.5 is 1−(1−p)² = 75%, so the guard
  works but is a two-sample test.
- Deterministic counter-example (`receipts/killpower-flake-dir.json`): a case that fails only when the work dir is a mutant
  dir. Result: **both** unmutated runs `survived` (guard passes) while the inert mutant is `killed` by `flake-inject`.
  The guard re-runs only the *unmutated* counter, so nondeterminism that manifests only under a mutant is invisible to it.

## 3. Isolation

- No refusal case can pass with its expected id absent: `:356` requires `ids.includes(c.expect)` and empty `extra`. Empirically
  stronger — 131/131 force-true mutants are killed, and for **131/131** the killing case's `expect` equals the forced id
  (`receipts/necessity.json` → `forceTrue.killedByOwnCase:131`, `notOwnCase:[]`); `CHECK_IDS` has 131 entries, all unique.
  So every declared id has a case that genuinely depends on it, and no kill floats on an unrelated case.
- `alsoAllowed` does hide co-firing in a bounded way: 356 declared entries, **153 never fire** (43%), across 56 of 241
  refuse cases (`node -e` over `receipts/battery-baseline.json`, exit 0). Worst over-broad list: `leg-order-swap` declares 12
  ids, 5 fire (`leg-order`, `leg-confirm-accept-dialog`, `leg-confirm-accept-state`, `leg-confirm-dismiss-dialog`,
  `leg-confirm-dismiss-state`, `closed-echo-law`, expect `leg-order`). 100 cases do have real co-firing, so the mechanism is
  used, but the unused half is latent masking: an id allowed for a case can start co-firing there without failing it.
- Laundered cases are presence-only (`:374`: `ids.includes(expect)`, `alsoAllowed:['*']`, `isolated:false`); they cannot
  detect co-firing by construction — acceptable for their role, but they contribute nothing to isolation.
- Must-accept cases do not accept a provenance forgery. The largest accepted receipt deltas: `accept-mark-equal-event-at`
  moves the first `confirm-accept` `at` from 643.8 ms to 643.1 ms (**−0.7 ms**, `node -e` on the receipt, exit 0) and
  `accept-grid-5e-6` moves one `at` by 5e-6 ms. Nonce, driver pin, fixture hashes, host pins and the send/event logs are
  untouched by every accept case (`accept-real-key-order` reorders keys only).

## 4. PRE smoke reruns

`receipts/battery-smoke1-rerun.json`, `receipts/battery-smoke2-rerun.json` (exit 0 both): 251/251, `allOk:true`, and a
case-by-case diff against `controls/c1/pf/pf-smoke<n>.battery.json` gives **0 differences over 251 cases** (case name, exit,
finding ids, alsoAllowed, ok, isolated), same `isolated 141` / `ids 73`.
One caveat recorded as F7: the identical command *without* an extra prior now fails (`positive.exit 1`, `findingIds
["prior-set-complete"]`, detail naming `corpus/evidence/round76/chromium-js-dialog/receipt.json`), because that receipt
landed in the walked tree after the PRE baseline. With `--prior <that receipt>` the rerun is identical. The PRE baselines
therefore used 16 priors and are only replayable with 17.

## Findings

**F1 (Medium — coverage; contradicts the control's own claim).** `GAP_MIN` (50) is a carried threshold
(`check-dialog-r76.mjs:202`, used at `:206`/`:211`) with **no battery case that distinguishes it and no SEMANTIC mutant**.
Measured: `GAP_MIN = 100`, `200`, `290` each survive the full battery, `allOk:true`, 251/251
(`receipts/mutants-gapmin.json`); only `GAP_MIN = 320` is caught, and only by the positive run (`killed-positive`,
`findingIds:["replay-event-timeline"]`) because `ownGaps` drops below 6. Equivalence class ≈ (0, 301.7] — the honest receipt's
smallest gap is 301.7 ms. So `kill-power-r76.mjs:8-10` ("the set includes BOTH directions of every carried tolerance and
threshold") is false for `GAP_MIN`, and a 50→200 regression passes battery + kill power + `holds`.

**F2 (Low — coverage).** `run-window`'s upper bound `t1 - t0 < 600000` has no SEMANTIC mutant — the only `run-window` entry is
`M-run-window-floor` (`kill-power-r76.mjs:77`, `t1 - t0 >= 3000` → `>= 0`). The battery does bracket the upper bound
(`run-window-long` → refused, `isolated:true`, `receipts/battery-baseline.json`), so a regression there is caught by the
battery but not by the mutant set; same overstatement as F1.

**F3 (Medium — attribution).** Case-level `killed` conflates refusal with death: a crash (exit 1, 0-byte stdout) and a 60 s
timeout (`negatives-dialog-r76.mjs:335`) both fail the case and are then reported as a named kill
(`kill-power-r76.mjs:131-132`). Demonstrated live (`M-crash-on-mutated` → `killed`, `failedCases:["failures-empty"]`).
`killed` records only case names, not the counter's exit/findings per case, so the distinction cannot be recovered from the
summary without a re-run.

**F4 (Medium — attribution).** `killed-positive` is a kill with no named case (`:153`) and is reachable by counter-internal
failure with no receipt property changed (`M-counter-internal-ghost` → `positiveFindings:["counter-internal"]`), and by any
crash that emits a findings array before exiting 1 (`M-crash-with-findings-handler` → `["internal-crash"]`). Attribution is
limited to the positive run's finding ids; there is no requirement that the finding be a check-level defect.

**F5 (Low — calibration).** The minimum-mutant guard is a pure count test (`kill-power-r76.mjs:165-166`:
`of('force-true').length === ids.length && ids.length >= 100 && of('semantic').length >= 40`). The 11 timeline/threshold
mutants are `kill-power-r76.mjs:63-73`; deleting all 11 leaves 45 ≥ 40, so `guard.ok` would still be true and nothing asserts
that both directions of a carried threshold are present.

**F6 (Low — isolation).** 153/356 declared `alsoAllowed` entries never fire (43%), over 56 cases; see §3. Over-broad
allowlists are latent masking rather than a demonstrated defect — no case in this receipt's run passed *because* of an
unlisted co-fire, and all 8 bracket cases carry an empty list.

**F7 (Info — reproducibility).** PRE smoke budgets are not replayable verbatim post-D: the counter's `prior-set-complete`
walk (`check-dialog-r76.mjs:217`) now sees the scored receipt, so the frozen command exits 1 unless that file is added with
`--prior`. With it, the rerun is case-for-case identical (0/251).

**F8 (Info — must-accept bounds).** Accepted receipt deltas are bounded at −0.7 ms event time and 5e-6 ms grid excursion; no
must-accept case touches a pinned identity field.

## Residual risk / verification gaps

- I did not re-run the full 131+56 kill power; the per-mutant attribution table is read from
  `controls/c1/pf/pf-smoke1.killpower.json` (the L1's measured run) and my own trimmed runs use the frozen control code with a
  deliberately reduced mutant set (`scripts/kp-attr.mjs`, `scripts/kp-crash.mjs`, `scripts/kp-flake.mjs`; the generator
  reports the trimmed copy's sha256 in `receipts/`). My `forceTrue.killedByOwnCase:131` check is therefore computed over the
  L1's run, not over a run of mine.
- F1's equivalence class is measured at three points (100/200/290) plus the 320 positive-failure; I did not sweep the whole
  interval, and a finer GAP_MIN just below 301.7 (e.g. 301) was not run.
- The dir-keyed flake demo is an injected adversary, not an observed flake; it demonstrates the guard's blind spot
  structurally rather than showing a natural nondeterministic case in the frozen battery (none was observed: baseline and
  both smoke reruns were identical).
- Nothing here is evidence about the receipt's provenance, the driver, or the C1 predicate; I reviewed only the negative
  battery and the kill-power control at their frozen bytes.

## Tooling

No installs, no upgrades, no pacman. `node v24.21.0`, `nproc 32`; disk guard checked before the heavy pass (51% used,
400 G free on `/fast/scratch/hyaku`). Scratch `/fast/scratch/hyaku/tabi-r76/R76Review2` removed at the end
(receipts copied here first).

Report: `.ufo/waves/round-76/w1/R76Review2.md`
