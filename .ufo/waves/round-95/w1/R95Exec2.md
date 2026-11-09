# R95Exec2 — C1 at scale (godspeed seat, w1)

Axes: default-run misdelivery rate; instrument wording coverage. Modes: --live on the pinned counter/driver, both hash-pinned before runs.

## Instruments pinned (sha256, verified before each run)
- driver `scripts/chrome-cdp-backendnode-misdelivery-round95.mjs`: 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82 ✓
- counter `scripts/check-backendnode-misdelivery-round95.mjs`: b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775 ✓
- battery `scripts/negatives-backendnode-misdelivery-round95.mjs`: 1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0 ✓

## Runs (ports 32021,32022,32023; chromium 155.0.8059.84)
1. `--reps 10 --json` → exit 0, verdict clean, 1085 checks, 0 findings. Nonce tabi-r95-live-3d3c60af8cd7, receipt sha256 d69c01b47e719574d893d645aa6163def25a208353f35f978132ad5fb55b9156. Branches: misdelivery 9, collision 31, miss 10 (Z-1..Z-10). Artifacts: `.ufo/waves/round-95/w1/R95Exec2-reps10.json` + `-receipt.json`.
2. default `--json` (reps 3) → exit 0, verdict clean, 336 checks, 0 findings. Nonce tabi-r95-live-e9ee31a714fb, receipt sha256 d3af7bec3c98db1b2ebd62c1d1f8e6ffb002e400287ff2488b39ad28c29789b8. Branches: misdelivery 4, collision 8, miss 3 (Z-1..Z-3). Artifacts: `.ufo/waves/round-95/w1/R95Exec2-default.json` + `-receipt.json`.

## Per-arm tabulation, P legs (B = 302 on all 52 P legs; no P misses anywhere)
Reps-10 (40 P legs, parent #p0..#p5 ids are [290,294,298,302,306,310] shifted by the q-arm offset, consecutive inputs 4 apart):

| arm | misdelivery | collision | nodeName at B |
|---|---|---|---|
| P286 | 8/10 (T=INPUT type=file id=p3, B equals #p3's id) | 2/10 | #text (reps 5,6) |
| P287 | 0/10 | 10/10 | #text (all 10) |
| P288 | 0/10 | 10/10 | INPUT type=button pseudo=-webkit-file-upload-button id=file-upload-button ×1 (rep 1), #text ×9 |
| P289 | 1/10 (rep 1, T=INPUT type=file id=p2) | 9/10 | file-upload-button ×9 (reps 2-10) |

Default-reps (12 P legs): P286 3/3 misdelivery (p3); P289 rep1 misdelivery (p2), reps 2-3 file-upload-button; P287 3/3 #text; P288 rep1 file-upload-button, reps 2-3 #text. Z legs: all miss (no T, max<B). S legs: all resolve B to child INPUT#s.

## Weakest-clause estimate: P(zero misdelivery in a default 3-rep run)
The branch-misdelivery clause needs ≥1 misdelivery among the 12 P legs (4 arms × 3 reps). Pooled P-leg misdelivery rate from reps-10 is 9/40 = 22.5%; treating legs as independent, P(zero in 12) ≈ 0.775^12 ≈ 0.05. Per-arm, the risk is concentrated in P286 (8/10 misdelivery, 8%×... i.e. P286 missing all 3 reps ≈ 0.2^3 = 0.008) and P289 (1/10, P289 zero ≈ 0.9^3 = 0.73); P287 and P288 never misdelivered in 20+10 legs. Joint zero: P286 misses all 3 AND P289 misses all 3 ≈ 0.008 × 0.73 ≈ 0.006, with an independence caveat — parent-id jitter is per-browser but the ±1 phase is heavily correlated within an arm (P286 hit on the same base phase 8/10), so the true figure plausibly sits near 0.01-0.05. In plain terms: a default run almost always passes the clause, because P286 alone carries it, but the clause is one arm deep and would be flaky-by-design if P286's phase ever settled a half-step off.

## Findings, verbatim
- Verbatim: none. No counter findings, no leg errors, no failures in either run. The predicate was never violated at any leg level in 60 + 18 legs, and the "at least one misdelivers / at least one collides" clause held in both runs (misdelivery present in both).
- Wording check: the counter enforces exactly the frozen sentence (describe-page equality with T, cross-answer branches, Z/S arms, branch-misdelivery/collision). No narrower property found. Both live runs clean over the pinned driver.

Receipts' `revision` field is null (counter reads it from claims.json per D1, not embedded in driver receipts); chromium string "Chromium 155.0.8059.84 Arch Linux" in both.

Tools: node (preinstalled; no installs, no pacman — host-wide pause respected, none needed).

VERDICT C1: neutral
