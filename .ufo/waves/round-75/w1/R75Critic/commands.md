FINDINGS

# Commands and exit codes (R75Critic)

Pins (re-hashed, all match `freeze.txt`):
`scripts/check-dragdrop-r75.mjs` 9b370790…c9270 · `scripts/negatives-dragdrop-r75.mjs`
9df82b2e…f0721 · `controls/c1/kill-power-r75.mjs` c227da00…3b68f ·
`scripts/chrome-cdp-dragdrop-round75.mjs` d604552e…28105 · `controls/c1/prior-set.txt`
4d85dfb2…90db7 · `.ufo/waves/round-75/claims.json` b6b4183e…e8f57 ·
`.ufo/waves/round-75/run-scored.sh` 84ae7b48…29b2.

Shell abbreviations: `LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin`,
`C1=$LANE/.ufo/waves/round-75/controls/c1`,
`PRIORS` = the 16 `--prior` arguments in `prior-set.txt` order,
`PIN=d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105`,
`NONCE=tabi-r75-l1-57f28cf128e6`.

## Identity / freeze checks (read-only)

| command | exit |
|---|---|
| `git log -1 --format='%H %P' b1ddabc5f3eda9fa4c780c41c51a574ae1edf4d8` → `… d71951a7…` | 0 |
| `git log -1 --format='%H %P %s' 57f28cf128e69dc40604f3201eab6a843c8e4142` → parent `b1ddabc5…` | 0 |
| `git grep -l 'tabi-r75-l1-57f28cf128e6' 57f28cf…` (0 lines) | **1** |
| `git grep -c '^| `chromium-drag-intercept-linux` |' c19a520f -- SCORECARD.md` (0 matches) | **1** |
| `git grep -inE '^\|.*(drag\|dispatchDragEvent\|setInterceptDrags)' c19a520f -- SCORECARD.md` (empty) | **1** |
| `git grep -rilE '\bdrag' c19a520f -- corpus/knowledge \| wc -l` → `0` | 0 |
| `git grep -l '"schema": "tabi-chrome-cdp-dragdrop' c19a520f \| wc -l` → `0` | 0 |
| `git grep -l '"schema": "tabi-chrome-cdp-dragdrop-r75"' d71951a7 -- '*.json' \| wc -l` → `25` | 0 |
| per-file top-level `.schema` at d71951a7 → 16 receipt / 9 counter | 0 |
| `diff top16.txt prior16.txt` (empty) | 0 |
| `sha256sum` of the 7 pinned files vs `freeze.txt` | 0 |

## Forgery construction and scoring

Every forged receipt is `forgery-receipt-*.json`; built by `forge.mjs` (identity relabel only:
nonce + everything it drives, `fixture.sha256`, `launchToken`, devtools url/browserId,
`stderrHead`), driven by `score.mjs` (calls the pinned counter with `PIN`, `NONCE`, the 16
priors).

```bash
# (a)+(c) forgery: relabel smoke1, re-time every event by +0.3*seq ms
node score.mjs "$C1/smoke1.receipt.json" outramp.json "$(cat mut17.json)"          # exit 0, clean
node "$LANE/scripts/check-dragdrop-r75.mjs" --receipt forgery-receipt-ramp17.json \
  --expect-driver-sha256 "$PIN" --expect-nonce "$NONCE" $PRIORS --json              # exit 0, 146, clean
node "$LANE/scripts/negatives-dragdrop-r75.mjs" --real forgery-receipt-ramp17.json \
  --expect-driver-sha256 "$PIN" --expect-nonce "$NONCE" $PRIORS \
  --work … --laundered "$C1/degenerate-native-mouse.receipt.json" \
  --laundered "$C1/degenerate-no-intercept.receipt.json" \
  --laundered "$C1/degenerate-script-events.receipt.json" --json                    # exit 0, allOk 254/254
node "$C1/kill-power-r75.mjs" --lane "$LANE" --real forgery-receipt-ramp17.json \
  --expect-driver-sha256 "$PIN" --expect-nonce "$NONCE" $PRIORS <3 --laundered> \
  --work … --out kp-ramp.json --jobs 4                                              # exit 0, holds true
```

| witness | counter exit | timeline |
|---|---|---|
| `counter-ramp.json` (17 events, +0.3·seq) | **0** | abs 0.0588, gap 0.125 |
| `counter-9b.json` (9 events, +0.1 on `at`) | **0** | abs 0.4706, gap 0.125 |
| `counter-8moves.json` (8 events, −0.1 on `at`) | **1** | abs 0.5294, gap 0.125 |
| `counter-9nogap3.json` (9 events, every gap preserved) | **1** | abs 0.4706, **gap 1.0** |
| `counter-shift100.json` (whole timeline +100 ms) | **1** | abs 0, **gap 1.0** |
| `counter-committed-a-by-critic.json` (committed (a) receipt) | **0** | abs 0, gap 0.25 |

| battery / kill power on the forgery | exit | summary |
|---|---|---|
| `battery-ramp17.json` | **0** | allOk true, 254/254, `failed []`, `coverageGap []` |
| `killpower-ramp17.json` | **0** | holds true, 146/146 force-true, 40/40 semantic, `survivors []`, `crashed []` |
| `battery-min9.json` (the 9-move forgery) | **1** | allOk false; `failed` = `event-types-ts-string`, `source-lifecycle-no-end` (extra `replay-event-timeline`) |

## Pre-freeze evidence re-checked

| file | numbers |
|---|---|
| `lesson-proof/timeline-honest-pairs.json` | 13 receipts, 156 pairs, maxAbs 0, maxGap 0.25 (histogram 120/32/4), honestPairsRefused 0, ownGapCounts all 8, firstChosenGapThreshold 0.5 with 0 refused |
| `controls/c1/prefreeze-summary.json` | 9 receipts, counter clean 146 with 15 priors, battery 254/254, kill power 146/146 + 40/40, survivors [] |
| `scored/c1-negatives-a.json` | allOk true, 254 cases |
| `scored/c1-kill-power-a.json` | holds true, 146/146 + 40/40, survivors [], crashed [] |
| `scored/c1-*.exit` | driver 0, counter 0, battery 0, kill power 0 |
| committed (a) receipt | sha256 6ecc2560…f1761, nonce `tabi-r75-l1-57f28cf128e6`, schema `tabi-chrome-cdp-dragdrop-r75` |
