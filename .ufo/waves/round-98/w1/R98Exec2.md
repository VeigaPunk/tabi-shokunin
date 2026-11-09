# R98Exec2 — C1 scale, stability and live killers (Tabi round 98, wave w1)

Axes: **stability at scale** (does the frozen predicate hold over 80 legs, not just 24?),
**trust polarity** (do path legs stay trusted and payload legs untrusted, never flipping?),
**instrument teeth** (do the three live killers still kill on this seat's own run?).
Moves kept: reps10 battery, default battery, live-killer harness, all with own deps + own ports.
No falsifying leg seen in any run.

## Setup
- Client deps installed by seat per orders: `D=/fast/scratch/hyaku/tabi-r98/R98Exec2/deps`,
  `npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0`
  (npm registry, npm 11.19.0, node v24.21.0; installed versions verified
  `25.16.0 1.65.0`). No pacman (paused host-wide); no tool upgrades were needed.
- Chromium `/usr/bin/chromium` → `Chromium 155.0.8059.84 Arch Linux` (matches claim).
- Ports: counting runs `33621,33622,33623`; live killers `33624,33625,33626` (seat-owned).
- No other tools installed/updated.

## Runs (exact commands, exit codes)
All with `--lane /home/vgpnk/Projects/shokunin/tabi-shokunin
--expect-driver-sha256 f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2 --live`.

1. **reps10 (80 legs)** — `--deps .../R98Exec2/deps --scratch .../R98Exec2/reps10
   --ports 33621,33622,33623 --json --reps 10` → **exit 0**, `verdict: clean`,
   816 checks, findings `[]`. Driver stdout: `{"legs":80,"failures":0,"launchFailures":0}`.
   Output: `w1/R98Exec2-reps10.json` + receipt `w1/R98Exec2-reps10-receipt.json`.
2. **default (24 legs)** — `--scratch .../R98Exec2/def --ports 33621,33622,33623 --json`
   → **exit 0**, `verdict: clean`, 256 checks, findings `[]`. Driver stdout:
   `{"legs":24,"failures":0,"launchFailures":0}`.
   Output: `w1/R98Exec2-default.json` + receipt `w1/R98Exec2-default-receipt.json`.
3. **live killers** — `node scripts/livekillers-client-oopif-uploadmodes-round98.mjs
   --lane ... --deps .../R98Exec2/deps --scratch .../R98Exec2/kl
   --ports 33624,33625,33626 --json` → **exit 0**, `ok: 3`, `failed: []`.
   Output: `w1/R98Exec2-livekillers.json`.

## Per-arm outcomes (identical across all 10 reps and all 3 default reps)
Receipt-leg aggregation (stableEv/stableFiles/stableRead all true per arm, both runs):

| arm | n | files on #s | events on #s | read (`files[0].text()`) |
|---|---|---|---|---|
| PUA | 10/3 | `[["tabi-r98-answer.txt",22,"text/plain"]]` | `[["input",true],["change",true]]` | `["ok","tabi round 98 answer.\n"]` |
| PLA | 10/3 | same as PUA | trusted input/change | same answer |
| PLL | 10/3 | same as PUA | trusted input/change | same answer |
| PLAB | 10/3 | `[["tabi-r98-payload.txt",29,"text/plain"]]` | `[["input",false],["change",false]]` | `["ok","tabi round 98 payload bytes.\n"]` |
| PLB | 10/3 | same payload | untrusted input/change | same payload |
| PLLB | 10/3 | same payload | untrusted input/change | same payload |
| PLLM | 10/3 | `[]` | `[]` | `null`; error `Error: ENOENT: no such file or directory, stat '<scratch>/driver/tabi-r98-missing.txt'` |
| PUR | 10/3 | `[["tabi-r98-missing.txt",0,"text/plain"]]` | trusted input/change | `["err","NotFoundError","A requested file or directory could not be found at the time an operation was processed."]` |

Cross-cutting, both runs:
- **Payload trusted ever? No.** 30 payload legs per run (reps10): zero with any `isTrusted:true`.
- **Path untrusted ever? No.** 30 path legs (PUA/PLA/PLL) per run in reps10: zero with any `isTrusted:false`.
- **PUR reads that did not reject NotFoundError? None.** All 10/3 PUR legs read
  `["err","NotFoundError","A requested file or directory could not be found at the time an operation was processed."]`.
- `#pp` empty and exactly one iframe target on every leg (both runs); 80/80 and 24/24
  distinct UUID browser ids. No `click` event on any leg (exact-match event lists).

## Live-killer table (this seat's run)
| mutant | check | frozen counter | check neutralised | ok |
|---|---|---|---|---|
| K-exit | `driver-exit` | rc 1, ids `["driver-exit"]` | rc 0 clean | true |
| K-ports | `ports-bound` | rc 1, ids `["ports-bound"]` | rc 0 clean | true |
| K-missing | `missing-bound` | rc 1, ids `["missing-bound"]` | rc 0 clean | true |

`ok: 3/3`, `failed: []`. Each mutant is killed by exactly the named check and passes
when that check is neutralised — the counter's live checks have teeth on this seat's run.

## Findings
- Findings verbatim: none. Counter findings `[]` in both counting runs; live-killer
  `failed: []`. No leg-level statement of predicate C1 was false in any `--live` run;
  no kill-rule trigger. No `setup`-verdict run (all three runs were full live executions).
- Retained evidence: `w1/R98Exec2-reps10.json`, `w1/R98Exec2-reps10-receipt.json`,
  `w1/R98Exec2-default.json`, `w1/R98Exec2-default-receipt.json`,
  `w1/R98Exec2-livekillers.json` (this report; paths relative to `tabi-shokunin`).

## Risks / blockers
- **Risk (low):** `--reps 10` consumed ports 33621–33623 on a fresh scratch; runtime
  was ~114 s (80 legs) vs ~34 s (24 legs) — well within harness budget, no flakes.
- Stability-specific note: per-arm outcomes were byte-identical across all 10 reps,
  including `browserVersion`/`clientBrowserVersion` strings — no flake observed at scale.
- **Blockers:** none. No subagents dispatched; no commits; no lane edits outside `w1/`;
  seat scratch `/fast/scratch/hyaku/tabi-r98/R98Exec2` removed before yield; receipts
  copied beside the outputs in `w1/`. `pgrep -f "remote-debugging-port=3362"` empty at yield.

VERDICT C1: neutral
