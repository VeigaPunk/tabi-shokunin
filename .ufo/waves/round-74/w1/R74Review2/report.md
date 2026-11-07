FINDINGS

# R74Review2 — battery and kill-power review (C1, round 74)

Seat: R74Review2 (reviewer, leaf). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `c72235d6aebca89269809050e983d53df36273f5`, frozen at `freeze.txt` (digests commit D = `ca30e1a3b7b23d56260196ef7af19929f544b80b`). No production or lane file was modified; all artifacts are under `.ufo/waves/round-74/w1/R74Review2/` and scratch `/fast/scratch/hyaku/tabi-r74/R74Review2/` (removed at exit; receipts copied first).

Frozen bytes verified before review (`sha256sum`, exit 0):

```
8c0dd93a61177eb02691bee7f3a6d3762eb51cdf9d51599e7e23867ffe91fb26  scripts/negatives-imecompose-r74.mjs
dcc8308bea91639daf9cd412ec01d5b7acc72754eb48be68c03e4ca5c4967c69  .ufo/waves/round-74/controls/c1/kill-power-r74.mjs
afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc  scripts/chrome-cdp-imecompose-round74.mjs
5901d895ced1305f27935b93b409363c5822c7a730a6d2c7d00446ed7d33d251  scripts/check-imecompose-r74.mjs
```

All four equal `freeze.txt`. Node v24.21.0, 32 cores; no tool installs were needed.

## 1. QUALITY 135 — battery over PRE repetitions

Re-ran the frozen battery on three PRE smokes of my choice (2, 5, 8), priors = the other 11 PRE receipts (8 smokes + the 3 degenerates), `--expect-nonce` = first field of `smoke<n>.args.txt`, `--laundered` repeated once per degenerate. Example (smoke 2; 5 and 8 identical shape):

```
node scripts/negatives-imecompose-r74.mjs \
  --real .ufo/waves/round-74/controls/c1/smoke2.receipt.json \
  --expect-driver-sha256 afacee1b…c2dc --expect-nonce tabi-r74-pre-smoke2 \
  --prior …/smoke{1,3..9}.receipt.json --prior …/degenerate-{dispatch-key,exec-command,script-events}.receipt.json \
  --work /fast/scratch/hyaku/tabi-r74/R74Review2/w2b \
  --laundered …/degenerate-dispatch-key.receipt.json --laundered …/degenerate-exec-command.receipt.json --laundered …/degenerate-script-events.receipt.json --json
# exit 0
```

Result: summary and **every per-case result identical** to the committed `pf-smoke{2,5,8}.battery.json` (`cases 239, passed 239, refuse 231, must-accept 5, laundered 3, isolatedCases 140, idsWithIsolatedCase 79, failed [], coverageGap [], allOk true`; 0 differing cases). Receipts: `b2.json`, `b5.json`, `b8.json`, `cmp-battery-vs-committed.json`.

### Relative-mutation / tolerance audit (the r72 red-state question)

Every mutation that is relative to an honest value, with the counter tolerance it must cross and the measured margin on the 12 committed receipts (`margins.json`):

| battery case | mutation | counter tolerance | measured margin |
|---|---|---|---|
| `event-time-quantum` (:96) | `plain[0].ts += 0.03` ms | grid `1e-4` grid units = `1e-5` ms (counter:163) | 0.3 grid units = **3000×**; honest max grid error 4.8e-7 grid units |
| `event-time-quantum-at` (:97) | `commit[2].at += 0.03` ms | same | 3000× on the target, **but see F4** (undeclared order-gap dependency) |
| `replay-timeline-1e-12` (:158) | `events[7].ts += 1e-12` | grid tolerance (must NOT fire) and replay `< 0.05` (must fire) | 1.1e-11 grid units inside; 1e-12 ≪ 0.05; prior is a clone of the receipt, so receipt-independent |
| `replay-timeline-sub-quantum` (:159) | prior shifted `0.04` | replay `< 0.05` | 0.01 ms (20 % of tolerance); receipt-independent |
| `accept-prior-timeline-0.06` (:199) | prior shifted `0.06` | replay `< 0.05` | 0.01 ms; receipt-independent |
| `accept-prior-all-identifiers-differ-one-quantum` (:198) | prior shifted `0.1` | replay `< 0.05` | 2× |
| `insertAt` cases (empty legs, `no-keyboard-events`) | `max(prev.at, mark) + 0.1` | leg window `[mark, nextMark]` | min leg gap **300.8 ms** across 12 receipts (>3000×) |
| `leg-marks-closed-early` | `closedAt = lastMark − 1` | `closedAt ≥ lastMark` | 1 ms |
| `event-leg-window-late-label` | `at = mark(commit) + 0.1` | window upper `mark(commit)`, strict | 0.1 ms, strict after 0.1-grid rounding |
| `run-window-short/-long` | `+3000` / `+700000` ms | `[4000, 600000)` | 1000 / 100000 ms |
| `devtools-port-binding` / `allowlist-id-gap` | `port += 1` / `id += 100` | exact equality / consecutive ids | exact |

Honest-pair measurement (the replay tolerance's false-refusal margin): 36 smoke pairs, min max-difference **1.0 ms** (`smoke6`/`smoke7`), max 15.5 ms; **zero pairs under 0.05 ms**. Scored (a) receipt vs the 12 PRE: min 17.9 ms; Exec1 (b) vs PRE: min 91.6 ms; Exec1 vs scored: 73.7 ms. This reproduces QUALITY 139's "minimum honest max-difference 1.0 ms" and gives the 0.05 ms near-match a 20× margin.

Answer to (1): **no refusal case's delta can fall inside the counter's tolerance on any of the 12 receipts**; the replay shifts are receipt-independent because both sides are built from a clone of the receipt under test. The one case whose *pass condition* (not its target tolerance) depends on an honest value is `event-time-quantum-at` — F4 below.

## 2. Isolation

**Expected id absent cannot pass.** Refuse cases require `o.exit === 1 && ids.includes(c.expect) && extra.length === 0` (`negatives-imecompose-r74.mjs:229-230`); laundered cases require `includes(expect)` (:242); must-accept cases require exit 0 with an empty finding list (:228). Empirical proof: `force-true:leg-compose-b-trusted` (a non-isolated case whose `alsoAllowed` is `['trust-law']`) fails with finding set `['trust-law']` — an allowed co-fire present, expected absent → red (`handmut-force-true_leg-compose-b-trusted.json`, exit 1). So an `alsoAllowed` entry cannot substitute for the expected id.

**What `alsoAllowed` can hide.** The co-fire side has no equivalent control. In the committed run `isolatedCases = 140/231` and only **79/148 check ids have an isolated refusal case**; **53 declared `alsoAllowed` entries never fire** in the committed run (dead allowances). Examples: `compose-a-seq` declares 7, 5 dead (`composing-by-input-type`, `trust-law`, `leg-compose-a-trusted/-data/-composing`); `plain-seq` 6/7 dead; `chain-unclosed`'s `trust-law` dead (`b2.json`). A *targeted* co-fire regression (a check that starts firing only on a specific mutation) would be masked exactly by these allowances. The expected-id side is protected by force-true kill power (148/148), but that does not exercise the allowances.

**Must-accept honesty.** The 5 accept cases do not accept a structurally dishonest receipt. `accept-mark-equal-event-at` (:201) stamps an event exactly at its leg mark; the counter's window is inclusive at the lower bound (counter:186), so this is a declared boundary, not a hidden tolerance (it also sets `ts = at`). `accept-on-grid-exact-decimal` (:200) is a near-no-op (measured max honest grid distance 4.8e-7 grid units) and tests tolerance only. The two prior-shift accepts only test no-false-refusal against a clone; they cannot launder a forgery.

## 3. Kill power

All 26 semantic `from` strings occur **exactly once** in the counter and at the intended check (`semantic-map.txt`; the control enforces uniqueness at kill-power:60-62 and exits 2 otherwise). Each is a genuine weakening/tightening of that check, e.g. M5 line 266 `&&`→`||`; line 160 `0.05`→`0.2`/`1e-9`; line 163 `1e-4`→`1`; line 245 `!open || e.data !== lastUpdate`→`!open`; line 252 CE trust→`true`; line 259 focusout legs→`.length >= 0`; line 193 `===`→`>=`; line 205 `EXPRS.has` dropped; line 211 `once('Page.navigate')` dropped; line 264 sweep count dropped.

Attribution: the committed `pf-smoke*.killpower.json` `failedCases` are specific and always include a case whose `expect` is the mutated check (checked mechanically for all 148 force-true rows, 0 mis-attributed). I re-ran 11 semantic mutants by hand on `smoke1` plus 3 force-true mutants (`handmut-*.json`); each is killed by its intended case, e.g. `M-quantum-tolerance-wide` → `event-time-quantum`, `event-time-quantum-at`; `M-timeline-tolerance-exact` → `replay-timeline-sub-quantum`; `M-timeline-tolerance-wide` → the two accept cases; `M-chain-end-data-dropped` → `chain-end-data`; `M-allowlist-eval-any` → the five `lookalike-*` cases; `M-ime-count-at-least` → `ime-call-duplicate`.

**Kill accounting is unsound (F1).** `killed = r.code === 1` (kill-power:92) and `holds` (:105) accept a battery that exits 1 with no parseable summary. Across the 10 committed kill-power summaries, **17 rows are counted as kills with `failedCases: null`**: `pf-smoke1` 2 (`composition-data-chain`, `no-keyboard-events`), `pf-smoke2` 4 (`nonce-shape`, `driver-pin`, `devtools-port-binding`, `event-types`), `pf-smoke7` 1 (`leg-cancel-trusted`), `pf-smoke8` 5 (`nonce-on-page`, `replay-devtools-url`, `replay-event-timeline`, `leg-compose-b-state`, `leg-compose-b-error`), `pf-smoke9` 1 (`leg-focus-f-seq`), and the **scored** run `c1-kill-power-a.json` 4 (`nonce-shape`, `server-log-binding`, `fixture-hash`, `replay-launch-token`). A control-plane failure in the battery yields exactly this shape: with `--list-checks` printing an empty line, the unguarded `JSON.parse(spawnSync(...).stdout)` (`negatives:244`) throws, the battery exits 1 with 0-byte stdout and a stack trace (`crashdemo/out.json`, `crashdemo/err.txt`). The cause of the 17 rows is not recorded (the control discards stderr), so the mechanism is [INFERENCE]; the exit-1-without-summary shape is demonstrated. I re-ran 6 of the 17 by hand (2 from `pf-smoke1`, all 4 from the scored run); every one is genuinely killed by a case expecting that id (`handmut-*.json`, `scored-null-*.json`), so the *substance* of `forceTrue 148/148` and `semantic 26/26` stands, but 17/174 recorded rows are unwitnessed, including 4 in the scored leg (c) evidence.

## Findings (severity order)

**F1 — high, kill-power accounting (calibration).** A battery crash is counted as a kill: `killed = r.code === 1`, `holds` ignores `failedCases` (kill-power:92,105); the battery's own `--list-checks` parse is unguarded (`negatives:244`) and a control-plane failure exits 1, the same code as a witnessed red. Evidence: 17 `killed && failedCases === null` rows in the 10 committed summaries, 4 of them in `scored/c1-kill-power-a.json`. Hand reruns show all 6 checked rows are genuine kills, so the predicate's leg (c) conclusion is not falsified, but the control cannot distinguish a kill from a crash and discards stderr (`stdio: ['ignore','pipe','ignore']`, kill-power:82).

**F2 — high, battery fail-open on the laundered controls (calibration).** `multi('laundered')` consumes one path per flag (`negatives:27,233`); the battery does not require the three degenerates. Measured: zero `--laundered` → `cases 236, launderedCases 0, allOk true, exit 0` (`b1-nolaunder.json`); `--laundered a b c` → `cases 237, passed 237, allOk true, exit 0` (silently ignored `b`, `c`). The predicate's "battery exit 0" is therefore command-dependent, not instrument-enforced.

**F3 — medium, laundered cases are not isolated (calibration/attribution).** Each degenerate is also in the frozen PRE prior set, so the laundered copy is a near-replay of its own prior: the laundered finding sets include `replay-launch-token`, `replay-devtools-url`, `replay-event-timeline` plus 60+ leg ids (`b2.json`). `alsoAllowed: ['*']` is recorded (`negatives:242`) but the ok computation never reads it. Probe with priors excluding the corresponding degenerate: the expected id still fires (`send-log-allowlist`, 69 findings) and the replay trio disappears (`launder-probe-exec-command.json`). The expected-id requirement keeps the case meaningful for the check, but the refusal is overdetermined and the declared allowance is dead metadata.

**F4 — medium, `event-time-quantum-at` is calibrated to an honest inter-event gap (QUALITY 135 class).** The `+0.03` ms shift on `commit[2].at` (`negatives:97`) must stay `≤ commit[3].at` or the case also fires `event-leg-window`, which is not in its `alsoAllowed` (`[]`). Measured gaps at that position: 0.7–1.1 ms over the 9 honest smokes (0.1–0.4 ms on the two degenerates that carry the shape; `degenerate-exec-command` has a one-event commit leg), so the margin is 23× on the honest set, but **0.0 ms gaps occur in the same leg at other positions in 5/9 honest receipts**. Demonstration: an honest-shaped receipt with `commit[2].at == commit[3].at` (smoke1 with one `at` copied) is counter-clean (`exit 0`, `findings []`) yet makes the battery exit 1 on `event-time-quantum-at` with extra `event-leg-window` (`eqgap.counter.json`, `eqgap.battery.json`). A future honest run with that shape would fail leg (c) for an undeclared reason.

**F5 — medium, tolerance values are under-pinned (calibration).** The battery brackets the replay tolerance only to `(0.04, 0.06)` and the grid tolerance to `(4.8e-7, 0.3)` grid units; the 26-mutant semantic set tests only `0.05→0.2`, `0.05→1e-9`, `1e-4→1`. Two weakenings survive both legs: replay `< 0.05` → `< 0.045` (battery `exit 0, allOk true`, `tolmut-0.045.json`) and grid `<= 1e-4` → `<= 0.02` (battery `exit 0, allOk true`, `tolmut-0.02grid.json`). Neither is in the semantic set, so "kill power holds" says nothing about them. (The frozen digest pins the bytes for this round; the gap is the carried instrument's discriminating power.)

**F6 — low, co-fire masking surface (isolation).** 69/148 ids have no isolated case and 53 declared allowances never fire (examples in §2). A targeted co-fire regression is invisible; a global one is caught by the positive run and the accept cases.

**F7 — low, semantic-mutant attribution is recorded but not asserted.** The control stores `failedCases` but `killed` does not require it to contain the intended case (kill-power:92). The committed 26 rows are all correctly attributed and my 11 hand reruns reproduce them, so the current set is sound; the control would also accept a mutant killed by an unrelated case or by a crash (F1).

## Proposed cases (not applied)

1. **Kill-power hardening (F1):** require `failedCases !== null && failedCases.length > 0` for `killed`; record `batteryExit` and stderr; make a null/parse failure a control error (exit 2). In the battery, wrap the `--list-checks` spawn/parse (`negatives:244`) and exit a distinct code (e.g. 3) on control-plane failure.
2. **Laundered fail-closed (F2):** require exactly the three known degenerate kinds (or ≥3 distinct kinds) else exit 2; assert `launderedCases === 3` and the three kinds in the summary.
3. **Laundered isolation (F3):** run each laundered copy with priors excluding the corresponding degenerate, and require the expected id with `replay-*` absent (or record the co-fire set); drop the dead `['*']` or honor it.
4. **`event-time-quantum-at` robustness (F4):** add `event-leg-window` to `alsoAllowed`, or mutate the last event of the leg / a `ts` field, or assert `commit[3].at − commit[2].at > 0.03` before mutating.
5. **Pin the tolerances (F5):** refusal at `0.049` and must-accept at `0.051` (replay threshold to ±0.001); refusal at `+0.005` ms (0.05 grid units) and must-accept at the measured honest float error (≤4.8e-7 grid units) (grid threshold); add semantic mutants `0.05→0.045` and `1e-4→0.02`.
6. **Allowance discipline (F6):** a `--strict-allowances` mode failing on a declared-but-unobserved allowance, and a per-case decoy mutation (mutate a field the expected check must not read; require no finding).
7. **Attribution (F7):** carry `expectCase` per semantic mutant and assert membership in `failedCases`; assert `failedCases` is a proper subset of all cases.

## Residual risk / verification gaps

- The battery's coverage set and the force-true set both derive from the counter's own `--list-checks`; a counter that *deleted* a check id would shrink both. Only the predicate's "148" and the freeze digest guard that. Not exercised here.
- Per-leg cases assume ≥2 events in a populated leg (`leg-<leg>-seq` swaps `e[0]`/`e[1]`); a future receipt with a one-event leg would throw a mutation error and go red. All 12 receipts share the same 40-event shape.
- `leg-marks` does not require marks on the 0.1 ms grid; with the inclusive window bound this gives a 0.1 ms boundary fabrication window — within the declared quantum, but undeclared as a limit.
- I did not re-run the full 174-mutant kill power (only 17 hand mutants + the 6 crash rows); the committed summaries were read for the rest.
- No independent cold execution of the driver was performed (out of this seat's scope); the review is over the frozen instruments and the committed receipts.

## Evidence files (beside this report)

`b2.json`, `b5.json`, `b8.json` (battery reruns), `cmp-battery-vs-committed.json`, `b1-nolaunder.json`, `margins.json`, `eqgap.receipt.json`, `eqgap.counter.json`, `eqgap.battery.json`, `launder-probe-exec-command.json`, `tolmut-0.045.json`, `tolmut-0.02grid.json`, `semantic-map.txt`, `handmut-*.json` (14), `scored-null-*.json` (4), `crashdemo/` (mutated counter, `out.json` 0 bytes, `err.txt`), `handmut.mjs`, `tolmut.mjs`, `launder-probe.mjs`.
