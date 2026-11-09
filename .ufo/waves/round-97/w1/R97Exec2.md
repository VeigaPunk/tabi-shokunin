# R97Exec2 — C1 scale and stability (seat report)

Axes: leg outcome stability at scale; trusted/untrusted event consistency; missing-path behaviour. Godspeed: iterated cheap in parallel (deps install + both live runs), kept only runs that improved coverage without harming anything else.

## Setup
- Client deps installed via npm (channel: npm registry, per RULES.md; host pacman paused, no sudo used):
  `D=/fast/scratch/hyaku/tabi-r97/R97Exec2/deps; mkdir -p "$D" && cd "$D" && npm init -y && npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` → exit 0, "added 26 packages"; verified `puppeteer-core 25.16.0`, `playwright-core 1.65.0`. Tool: npm (registry). No pacman/uv/binary installs.
- Ports assigned to this seat only: 32721,32722,32723. Scratch root `/fast/scratch/hyaku/tabi-r97/R97Exec2/` removed before yield; receipts copied to `w1/` first. No chromium left on port 32723 (pgrep empty).
- Host: Chromium 155.0.8059.84 (per driver receipt `chromium` field), `--headless=new`, Linux.

## Commands and exit codes (verbatim, run in parallel)
1. reps=10 (80 legs), exit 0, wall 176.95 s:
   `node scripts/check-client-oopif-uploadfile-round97.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 09f0c2fe2895ee0e035e8107995873328ce74f4e4d6d1ab3c8efd455b8c9e4eb --live --deps /fast/scratch/hyaku/tabi-r97/R97Exec2/deps --scratch /fast/scratch/hyaku/tabi-r97/R97Exec2/reps10 --ports 32721,32722,32723 --json --reps 10`
   → `verdict clean, findings 0, checkCount 736, mode live`, receipt `live-receipt-8722f3b87524.json`.
2. default (reps=3, 24 legs), exit 0, wall 57.36 s: same command with `--scratch .../def`, no `--reps`.
   → `verdict clean, findings 0, checkCount 232, mode live`, receipt `live-receipt-50820f29a3d3.json`.
   (First default attempt while reps10 held the ports returned `verdict setup`, exit 2, "port 32721 busy" — a port-collision setup refusal per the frozen claim's kill rule, not a finding; rerun after reps10 finished. Overwritten by the clean rerun.)

## Per-arm (files, events) counts — identical in both runs, zero variance
| arm | n (reps10 / default) | childFiles | childEvents | outcome | parent #pp |
|---|---|---|---|---|---|
| PUX | 10 / 3 | `[["tabi-r97-answer.txt",22]]` all | `[["input",T],["change",T]]` all | resolved all | `[]` all |
| PUS | 10 / 3 | same | same | resolved all | `[]` all |
| PUC | 10 / 3 | `[]` all | `[["input",T],["change",T],["input",U],["change",U]]` all | resolved all | `[]` all |
| PUM | 10 / 3 | `[["tabi-r97-missing.txt",0]]` all | `[["input",T],["change",T]]` all | resolved all | `[]` all |
| PLX | 10 / 3 | `[["tabi-r97-answer.txt",22]]` all | `[["input",U],["change",U]]` all | resolved all | `[]` all |
| PLS | 10 / 3 | same | same | resolved all | `[]` all |
| PLL | 10 / 3 | same | `[["input",T],["change",T]]` all | resolved all | `[]` all |
| PLM | 10 / 3 | `[]` all | `[]` all | error all | `[]` all |

- PLM verbatim (all 13 legs): `errName Error`, message `ENOENT: no such file or directory, stat '<scratch>/driver/tabi-r97-missing.txt'` (scratch path as expected per run).
- Iframe targets: cross-site 60/60 exactly one with url = child URL (reps10), 18/18 (default); same-site PUS/PLS 20/20 and 6/6 none. `failures []` in both receipts; no leg error except PLM as frozen.
- Anomaly scans (both runs): PLX/PLS legs with any trusted event: 0; PUX/PUS/PUM/PLL resolved legs with any untrusted event on a set call: 0; PUM legs that rejected: 0. No falsifying leg observed — kill rule not triggered.

## Artifacts (lane-relative, all under `.ufo/waves/round-97/w1/`)
- `R97Exec2-reps10.json` (counter output, reps10 run) + `R97Exec2-reps10-receipt.json` (80-leg receipt)
- `R97Exec2-default.json` (counter output, default run) + `R97Exec2-default-receipt.json` (24-leg receipt)
- `R97Exec2.md` (this report)

Scale confirms the frozen per-leg statements 104/104 legs across two independent live runs with no variance; per Declared limit 7, `--reps 10` measures other legs, and the default 24-leg run matches the claim exactly.

VERDICT C1: neutral
