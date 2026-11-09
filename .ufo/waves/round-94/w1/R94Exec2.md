# R94Exec2 — leg-level counterexample hunt under repetition (C1)

Seat: R94Exec2 · milestone: counterexample hunt under repetition
Predicate: C1-BACKENDNODE-COLLISION-R94 · capability chromium-oopif-backendnode-collision-linux
Base d7744d04 · freeze 2308b6ce · scored 012776cf

## Instruments (verified, unedited)

- driver `scripts/chrome-cdp-backendnode-collision-round94.mjs` sha256
  `518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f` ✓ matches `controls/instrument-sha256.txt`
- counter `scripts/check-backendnode-collision-round94.mjs` sha256
  `d7fd2cbe0899ec59b639752d99f3cd22594dbe600300596cdcc6ce30abf2a95a` ✓
- battery sha256 `b750ee17b7784d23fbc6c13f5356d1485f05f5702023e48f928730b6cfcd7822` ✓ (never edited, never run — out of seat scope)

## Commands run (exact, exit codes)

All via the frozen counter, pinned driver SHA, `--lane … --expect-driver-sha256 518f40ff…f9686f --live --json`:

| run | ports | scratch | rc | verdict | checks | findings | counter JSON |
|---|---|---|---|---|---|---|---|
| run1 | 19551,19552,19553 | /fast/scratch/hyaku/tabi-r94/R94Exec2/run1 | 0 | clean | 165 | [] | R94Exec2-run1.json |
| run2 | 19554,19555,19556 | …/run2 | 0 | clean | 165 | [] | R94Exec2-run2.json |
| run3 attempt 1 | 19557,19558,19559 | …/run3 | 2 | setup | — | — | (overwritten, see below) |
| run3 attempt 2 | 19557,19558,19559 | …/run3 | 0 | clean | 165 | [] | R94Exec2-run3.json |
| reps10 | 19551,19552,19553 (+`--reps 10`) | …/runreps10 | 0 | clean | 522 | [] | R94Exec2-reps10.json |

After every run: `pgrep -f "remote-debugging-port=1955"` empty (no chromium processes carrying my ports remain).
Tooling: read /home/vgpnk/.omp/agent/RULES.md per operator directive; no installs needed, none performed.

## Per-arm B values (from each run's live-receipt.json `legs[].describeChooser.B`)

- run1: C: B=2 (×3, pad 0) · M: B=302 (×3, pad 300) · S: B=305 (×3, pad 300)
- run2: C: B=2 (×3) · M: B=302 (×3) · S: B=305 (×3)
- run3: C: B=2 (×3) · M: B=302 (×3) · S: B=304, 305, 305
- reps10: C: B=2 (×10) · M: B=302 (×10) · S: B=305 (×10)

All 57 legs across the 4 runs (9+9+9+30) returned leg-level `error: null`; all 3 leg statements held in every rep:
arm C B=2 resolved on the page session to `#document` with documentURL = parent URL (collides with page getDocument root id B);
arm M B=302 errored 'No node found for given backend id' (B exceeds every backendNodeId in the page-session pierced tree);
arm S B resolved to INPUT. No leg-level counterexample on any repetition.

## Findings, classified

1. **run3 first attempt: RC 2, verdict `setup`, `detail: "driver ended by signal SIGKILL"`, `orphansSwept: 14`.**
   Classification: **setup / port / host-resource transient, not a law-level counterexample** — the driver process was SIGKILLed
   before completing any leg accounting; the identical command on the same ports immediately returned RC 0 clean with zero
   findings, and the transient run produced no leg claiming any leg-level statement false. Evidence: overwritten counter JSON
   (recorded verbatim here); retry receipt R94Exec2-run3-receipt.json clean, 9 legs, 165 checks, `findings: []`.
2. **S-arm B variance (304 once in run3, else 305).** Classification: **neutral instrumentation noise within the law** —
   arm S only asserts B on the page session `is the INPUT`; B's exact value is not fixed by the frozen wording and is minted
   internally (declared limit 3: claim does not say when/who minted B). S never produced a non-INPUT resolution.
3. No findings on any other leg across 57 legs. Count re-derivation matches the scored run: 165 checks per standard run (3 reps),
   522 on the reps10 run — identical to the frozen counter's own accounting.

## Artifacts (lane-relative)

- `.ufo/waves/round-94/w1/R94Exec2.md` (this report)
- `.ufo/waves/round-94/w1/R94Exec2-summary.json` (per-run rc/verdict/checkCount/findings + per-arm B values)
- `.ufo/waves/round-94/w1/R94Exec2-run1.json`, `R94Exec2-run2.json`, `R94Exec2-run3.json`, `R94Exec2-reps10.json` (counter JSONs)
- `.ufo/waves/round-94/w1/R94Exec2-run1-receipt.json`, `R94Exec2-run2-receipt.json`, `R94Exec2-run3-receipt.json`, `R94Exec2-reps10-receipt.json` (live receipts)

Scratch /fast/scratch/hyaku/tabi-r94/R94Exec2/ contains only the four run dirs; receipts copied into w1/ above for citation.

VERDICT C1: neutral
