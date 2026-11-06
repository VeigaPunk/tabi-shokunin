PASS

# R71Exec2 — cold re-derivation of C2-EXEC-BOUND (leg b) and live positives

Round 71, wave w1, seat R71Exec2. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
base `11b00f644f5af1a4f7827da6956732e0b91023a5`, FREEZE `04f4330f` (commit `749a1ab5`).
Every scored command was run once, cold, from this seat; nothing was re-run. Node v24.21.0,
Chromium 155.0.8059.84 (Arch Linux), headless. No tool installs, no repo writes.

## 1. Pinned digests vs `.ufo/waves/round-71/freeze.txt`

`sha256sum` over the instruments this seat executes or whose verdict it depends on; all seven
matched the freeze manifest exactly:

| file | sha256 | freeze |
|---|---|---|
| `scripts/chrome-cdp-synthpinch-round71.mjs` | `5318780c…4922af` | match |
| `scripts/check-synthpinch-r71.mjs` | `310fac05…ef176c` | match |
| `scripts/negatives-synthpinch-r71.mjs` | `830bbb0d…fe3d14a` | match (manifest; not executed by this seat) |
| `scripts/verify-live-r71.mjs` | `61f43596…73f333` | match |
| `.ufo/waves/round-71/controls/c1/kill-power.mjs` | `b86fc3d7…557b1e` | match (manifest; C1 leg, not this seat) |
| `.ufo/waves/round-71/controls/c2/attack-harness.mjs` | `33e1bd1b…224512` | match |
| `.ufo/waves/round-71/controls/c2/evaluate-c2.mjs` | `3c3a83dc…c778716` | match |

Claims `828d5537…d91be` unchanged; predicates were not amended, only attacked.

## 2. Attack harness (cold)

```
node .../.ufo/waves/round-71/controls/c2/attack-harness.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --verifier verify-live-r71.mjs \
  --work /fast/scratch/hyaku/tabi-r71/R71Exec2/h \
  --out  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/w1/R71Exec2/harness
rc on next line: 0
```
Harness wall 84.37 s (`harness.stdout.txt`). Summary `harness/summary.json`
sha256 `1cc5c70a…0ac0`; per-attack verifier JSON in `harness/<attack>.verifier.json`;
markers in `marker-sizes.txt` (C marker body copied to `marker-C-swap-run-b-tap.log`).

| attack | exit | class | findings | marker lines | run walls (ms) |
|---|---|---|---|---|---|
| P-tap | 0 | HONEST-PASS | `[]` | 0 | a 12400, b 12347 |
| P-scroll | 0 | HONEST-PASS | `[]` | 0 | a 10374, b 10396 |
| A-env-tap | 2 | REFUSED | `["env-injection"]` | 0 | — (no run) |
| A-env-scroll | 2 | REFUSED | `["env-injection"]` | 0 | — (no run) |
| B-swap-tap | 0 | HONEST-PASS | `[]` | 0 | a 13290, b 12511 |
| C-swap-run-b-tap | 1 | REFUSED | `["snapshot-mutated","run-b-wall-floor","run-b-stdout-mismatch"]` | 1 | a 12443, b 30 |

Attack detail (from the per-attack verifier JSON):

- **P-tap / P-scroll** — predicate true, pinSource frozen, 4/4 snapshot reads true
  (`after-write`, `before-run-a`, `before-run-b`, `after-runs`), both runs execute the
  snapshot with all five bindings true and stdout agreeing.
- **A-env-tap / A-env-scroll** — `env.injected=["NODE_OPTIONS"]`, `execArgv=[]`, no snapshot
  and no launch: the verifier refuses before reading a pin or spawning
  (`scripts/verify-live-r71.mjs:119-122`). The forged-receipt preload never ran (marker 0).
- **B-swap-tap** — the watcher swapped the lane copy after `<scratch>/run-a` appeared
  (`attack-harness.mjs:137-147`, trigger comment says "after the pin read … before run a
  spawns"), target `lane3/scripts/chrome-cdp-synthtap-round70.mjs`; the swap landed
  (`swap.targets` non-empty, not NOT-LANDED) yet marker stayed empty and both runs took
  12.5-13.3 s on the snapshot: the verifier writes the private 0700/0500 snapshot at
  `verify-live-r71.mjs:145-160` before `run-a` exists and executes `snapDriver`
  (`:183`), so the swapped lane bytes were never an execution path.
- **C-swap-run-b-tap** — after `run-a/receipt.json`, the harness swapped both
  `lane5/scripts/chrome-cdp-synthtap-round70.mjs` and the snapshot
  `v5/snap-FMpvYP/chrome-cdp-synthtap-round70.mjs` (`attack-harness.mjs:148-158`). Run b then
  executed the do-nothing producer **from the snapshot** (marker line:
  `do-nothing …/h/v5/snap-FMpvYP/chrome-cdp-synthtap-round70.mjs`), wrote a forged receipt in
  30 ms, and the verifier refused: snapshot hash reads at `before-run-b` and `after-runs`
  are `false` (`verify-live-r71.mjs:153-158,181,209`) → `snapshot-mutated`; 30 ms < 6000 ms
  floor (`:186`) → `run-b-wall-floor`; empty stdout vs receipt → `run-b-stdout-mismatch`
  (`:199-204`). Exit 1. This is the leg-b kill: the forged receipt passed all five binding
  checks and the counter (counterExit 0), and was still refused.

No FALSE-PASS, no NOT-LANDED; positives exit 0.

## 3. Evaluator (cold)

```
node .ufo/waves/round-71/controls/c2/evaluate-c2.mjs \
  --summary .../w1/R71Exec2/harness/summary.json --json > .../w1/R71Exec2/eval.json
rc on next line: 0
```
`eval.json` (sha256 `ce2f924a…9a9b`): `holds=true`, `falsePass=0`, `notLanded=0`,
`classes=["P-tap:HONEST-PASS","P-scroll:HONEST-PASS","A-env-tap:REFUSED",
"A-env-scroll:REFUSED","B-swap-tap:HONEST-PASS","C-swap-run-b-tap:REFUSED"]`,
`reasons=[]`. C2-EXEC-BOUND holds on independently produced evidence.

## 4. Live positives (cold, one attempt each)

```
node scripts/verify-live-r71.mjs --profile synthscroll-r69 \
  --scratch /fast/scratch/hyaku/tabi-r71/R71Exec2/s --json   rc: 0   (wall 21.64 s)
node scripts/verify-live-r71.mjs --profile synthtap-r70 \
  --scratch /fast/scratch/hyaku/tabi-r71/R71Exec2/t --json   rc: 0   (wall 25.90 s)
```

| profile | predicate | findings | snapshot reads | run a | run b | cross-run / evidence |
|---|---|---|---|---|---|---|
| synthscroll-r69 | true | `[]` | 4/4 ok (`after-write`, `before-run-a`, `before-run-b`, `after-runs`) | exit 0, 10953 ms, counter 0, 5/5 bindings, stdout agrees | exit 0, 10563 ms, counter 0, 5/5 bindings, stdout agrees | true / true (evidence sha `587100d9…667f8`) |
| synthtap-r70 | true | `[]` | 4/4 ok | exit 0, 12829 ms, counter 0, 5/5 bindings, stdout agrees | exit 0, 12936 ms, counter 0, 5/5 bindings, stdout agrees | true / true (evidence sha `0a51f3a6…6d631`) |

`pinSource=frozen` in both; full JSON `live-scroll-r69.json`
(`d492c72d…614d`) and `live-tap-r70.json` (`7536a03b…36a1`); stderr empty, no `env.injected`
and no `execArgv`.

## 5. Findings (named, with lines)

1. **C-swap run b: the counter accepts a forged receipt it never executed** —
   `harness/C-swap-run-b-tap.verifier.json`: run b bindings all true, `counterExit=0`, yet
   wall 30 ms and stdout unparsable. The frozen counter `scripts/check-synthtap-r70.mjs` is a
   shape/digest oracle, not an execution oracle (round-70 lesson R3 restated). Only the r71
   generation's S/W/O gates refuse. Repro: the C-swap command above.
2. **B-swap is now strictly weaker than the snapshot** — `attack-harness.mjs:137-147` triggers
   on `<scratch>/run-a`, which by construction exists only after the snapshot bytes are hashed
   and written (`verify-live-r71.mjs:145-160`). B's HONEST-PASS therefore shows the snapshot
   removes the lane file from the execution path, not that a swap *before* the snapshot would
   be caught. Not a predicate breach (B's frozen allowed set is HONEST-PASS).
3. **Declared residual** (`verify-live-r71.mjs:22-25`): a same-user process can rewrite the
   snapshot and restore it between two hash reads, or patch the verifier itself. (S) detects
   only a persistent swap; (W)+(O) are the independent backstops. Observed: the 30 ms run and
   absent stdout were each individually sufficient to refuse even with `snapshot-mutated`
   ignored.
4. **Wall-floor margin under fleet load** — real live runs 10.4-12.9 s against a 6 s floor
   (~1.7-2.2x); the swapped run 30 ms. No positive came near the floor, no false wall-floor
   finding occurred in the four positive verifier executions.

## 6. Reproduce

See commands in §2-§4 verbatim; artifacts beside this report:
`harness/` (summary + six verifier JSONs), `harness.stdout.txt`, `eval.json`,
`live-scroll-r69.json`, `live-tap-r70.json`, `marker-C-swap-run-b-tap.log`, `marker-sizes.txt`.

Scratch `/fast/scratch/hyaku/tabi-r71/R71Exec2` holds only harness run leftovers; it is
deleted before yield, receipts copied here first. No production, lane-root, fleet or sibling
path was written; no git/jj mutation was made.
