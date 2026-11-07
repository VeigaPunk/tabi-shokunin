CONFIRMED

# R72Exec1 — independent leg (b), independent re-run of leg (c), cause, next-generation fix

Verdict: the L1's honest stop is reproduced independently and for the stated reason. **Leg (b) holds**
(independent cold run, counter clean, 94 checks). **Leg (c) does not hold as frozen** (battery 217/218 on
both receipts; kill-power `holds:false` because the unmutated battery exits 1). Nothing was amended or
written outside this directory. The residual failure is a battery-case property, not a counter defect, and a
one-line battery change (verified below) makes both the battery and the frozen kill-power control hold.

## 1. Pinned digests (all match `.ufo/waves/round-72/freeze.txt`)

`sha256sum scripts/chrome-cdp-synthpinch-round72.mjs scripts/check-synthpinch-r72.mjs scripts/negatives-synthpinch-r72.mjs .ufo/waves/round-72/controls/c1/kill-power-r72.mjs .ufo/waves/round-72/claims.json` → rc 0

| file | measured | frozen | match |
|---|---|---|---|
| scripts/chrome-cdp-synthpinch-round72.mjs | d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877 | same | yes |
| scripts/check-synthpinch-r72.mjs | 142062ef166f4436b015fd93d08d80d9ec7a4f0a3f3d1a0d0bcfebc64d593e4b | same | yes |
| scripts/negatives-synthpinch-r72.mjs | 414e04a6fb8459ece7f22b633bf4c0d4caad65bede0a9c9bf0b035e6a5825602 | same | yes |
| .ufo/waves/round-72/controls/c1/kill-power-r72.mjs | dae07c989d6f1dc691e316adc6254f55bf20989489ef0a38f04fd9fbe5dd6841 | same | yes |
| .ufo/waves/round-72/claims.json | bba7927b73d1d6c26e7016e2a67b1c4ae58d50db49291a258ac187aa5ad4bb6a | same | yes |

Lane HEAD at seat start: `b78608f60d6b4d0b599022f178ca056131066f36` (`git -C <lane> rev-parse HEAD`, rc 0).

## 2. Leg (b) — independent cold run: HOLDS

```
cd /fast/scratch/hyaku/tabi-r72/R72Exec1/d && node .../scripts/chrome-cdp-synthpinch-round72.mjs \
  --scratch /fast/scratch/hyaku/tabi-r72/R72Exec1/d --out .../w1/R72Exec1/receipt.json \
  --nonce tabi-r72-exec1-3f9a1c7b --http-port 34937 --cdp-port 42881
DRIVER_RC=0        # line immediately after the command
```
One cold run only; no re-run (rc was 0, not a usage refusal). Ports were discovered by binding port 0
(`node -e “…net.createServer().listen(0)…”` → 34937 42881, rc 0). `driver.err` is 0 bytes.

```
node .../scripts/check-synthpinch-r72.mjs --receipt .../w1/R72Exec1/receipt.json \
  --expect-driver-sha256 d007adec…7877 --json > .../w1/R72Exec1/counter.json
COUNTER_RC=0
```
`counter.json`: `verdict:"clean"`, `checkCount:94`, `findings:[]` (rc 0). Receipt
`w1/R72Exec1/receipt.json`: `driverSha256 d007adec…7877`, `nonce tabi-r72-exec1-3f9a1c7b`,
`nonceOnPage` identical, `degenerate:null`, `predicate:true`, `synthPinchHypothesis:"CONFIRMED"`,
`failures:[]`, `slowToTouchSpanRatio:4`, 11 legs, teardown `postKillSweepCount:0`, `survivors:[]`,
fixture and devtools probes both `closed`; window `2026-11-06T23:39:48.666Z`–`2026-11-06T23:40:03.764Z`.
`--list-checks` returns 94 ids, so the 94 checks are the full declared set.

**Leg (b) verdict: holds.**

## 3. Leg (c) — independent re-run: DOES NOT HOLD AS FROZEN

```
node .../scripts/negatives-synthpinch-r72.mjs --real <scored receipt> --work /fast/…/R72Exec1/n \
  --laundered <3 degenerate receipts> --json > negatives-a.json                      NEG_A_RC=1
node .../scripts/negatives-synthpinch-r72.mjs --real .../w1/R72Exec1/receipt.json …   NEG_B_RC=1
```
| artifact | real receipt | cases | passed | failed | coverageGap |
|---|---|---|---|---|---|
| `negatives-a.json` | `.ufo/…/scored/` receipt `corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json` (L1's) | 218 (refuse 207, must-accept 8, laundered 3) | 217 | `in-wheel-anchor-2px` | `[]` |
| `negatives-b.json` | `w1/R72Exec1/receipt.json` (mine) | 218 | 217 | `in-wheel-anchor-2px` | `[]` |

Failing row is identical in both: `{class:"refuse", expect:"wheel-anchor", counterLine:204, exit:0,
findingIds:[], ok:false}` — the counter accepted the mutant (mutant survived).

```
node .../controls/c1/kill-power-r72.mjs --lane <lane> --real <scored receipt> --work /fast/…/R72Exec1/k \
  --out .../w1/R72Exec1/kill-power-a.json --jobs 6
KILLPOWER_RC=1
{"unmutatedExit":1,"forceTrue":{"mutants":94,"killed":94},"semantic":{"mutants":12,"killed":12},
 "survivors":[],"holds":false}
```
Kill power `holds:false` solely because `unmutatedExit:1`. Mutant sensitivity is intact and not vacuous: of
the 106 mutants, **0** have `in-wheel-anchor-2px` as their *only* failing case — every mutant additionally
fails the case it targets (e.g. `M5-producer-verdict-and-to-or` fails its 9 `producer-verdict-*` cases plus
the boundary case). The frozen `holds` predicate (unmutated exit 0 AND all mutants killed) is therefore
correct to reject, and the L1's honest stop is reproduced from an independent direction.

**Leg (c) as frozen: does not hold. Leg (b): holds. C1 continues to be an honest stop on leg (c).**

## 4. Cause (measured, not inferred)

The mutant is *inside the counter's declared admissible band*, so no counter can refuse it:

- `scripts/check-synthpinch-r72.mjs:33` — `const AT = { x: 400, y: 300 };`
- `scripts/check-synthpinch-r72.mjs:204` — `Math.abs(e.clientX - AT.x) <= 1 && Math.abs(e.clientY - AT.y) <= 1`
  for the `in`/`clamp`/`default` wheels (tolerance ±1 px).
- `scripts/negatives-synthpinch-r72.mjs:159` — the case is *relative*: `[0].clientX += 2` on the first `in` wheel.
- `scripts/negatives-synthpinch-r72.mjs:223` — a **must-accept** case requires the counter to exit 0 on
  `[0].clientX += 1`. So a value of 401 must be accepted.

Chromium rasterizes the 400-px pinch anchor to integers with ±1 jitter. Measured on the two receipts:
`in`-leg x ∈ {399,400}, y ∈ {299,300} (17 wheels each; `clamp` wheels are exactly 400/300 in all 32).
First `in` wheel on **both** receipts is x=399:
- mine: `x=[399,399,399,400,399,399,400,400,400,400,400,400,399,399,399,400,400]`
- L1's: `x=[399,399,400,399,399,400,399,400,400,400,400,399,399,400,400,400,400]`

399 + 2 = 401 → |401−400| = 1 ≤ 1 → accepted. The mutated value 401 is *exactly* the value produced by
`accept-in-anchor-1px` on a receipt whose first wheel is 400. Check 204 is a pure function of
`e.clientX`, so two receipts whose first `in` wheel is 401 are indistinguishable to the counter: the mutant
receipt is byte-equivalent, at that field, to a receipt the battery itself declares **must be accepted**.
The case is therefore *semantically vacuous* on any receipt whose first `in` wheel sits at AT−1.

Kill probability of the case = P(first `in` wheel x = 400). Measured over 7 receipts:
400 → smoke1, smoke2, smoke5 (killed); 399 → smoke3, smoke6, scored, mine (survive). **3/7.**
Cross-check against the L1's own lesson-proof batteries (same frozen battery, run without `--laundered`,
hence 215 cases): `battery-smoke2.json` pass, `battery-smoke3.json` fail `in-wheel-anchor-2px`,
`battery-smoke5.json` pass, `battery-smoke6.json` fail — 4/4 exactly as the model predicts
(`node -e` over `.ufo/waves/round-72/lesson-proof/battery-smoke*.json`, rc 0).

Proof the survival is value-driven and not index-driven (fresh battery copies in scratch, run on both
receipts; `fixvariant2-{A,B}.json`, RC_A=1 RC_B=1, 222 cases):
| case | scored receipt | my receipt |
|---|---|---|
| `in-wheel-anchor-2px` (+2 on the 399 first wheel) | survive (exit 0) | survive (exit 0) |
| `in-wheel-anchor-399-2px` (+2 on *any* 399-valued wheel) | survive | survive |
| `in-wheel-anchor-3px` (+3) | killed, isolated `wheel-anchor` | killed, isolated |
| `in-wheel-anchor-abs-402` (`clientX = 402`) | killed, isolated | killed, isolated |
| `wheel-anchor-clamp-exact` | killed | killed |

## 5. Next-generation fix — minimal and verified

`proposed-battery-fix.diff` (one line, `negatives-synthpinch-r72.mjs:159`):
`in-wheel-anchor-2px … clientX += 2` → `in-wheel-anchor-3px … clientX += 3`
(variant sha256 `d45ca88302a20f3dba5d3f3b6dcd9ccee1d2c893ec58ac9f11dca546d86ab39d`; counter untouched).

Displacement rule: a refusal mutant on a coordinate the counter bounds by tolerance `T` must move the value
to outside `[AT−T, AT+T]` **for every honest sample**, i.e. `d ≥ T + jitter + 1` with `jitter` measured from
the real receipt. Here `T=1`, `jitter=1` → `d ≥ 3` (or an absolute target ≥ `AT+T+1` = 402). `d=2` is exactly
the one displacement that is provably undetectable while `accept-in-anchor-1px` remains a must-accept case.

Verified effect of that single change, frozen counter + frozen kill-power script (`--lane` pointed at a
scratch lane copy holding the frozen counter and the +3 battery; nothing in the lane touched):

```
node scripts/negatives-synthpinch-r72.mjs --real <scored|mine> … --json
FIXLANE_BATTERY_A_RC=0   A {"cases":218,"passed":218,"failed":[],"allOk":true,"coverageGap":[]}
FIXLANE_BATTERY_B_RC=0   B {"cases":218,"passed":218,"failed":[],"allOk":true,"coverageGap":[]}

node .ufo/waves/round-72/controls/c1/kill-power-r72.mjs --lane /fast/…/vlane --real .../w1/R72Exec1/receipt.json \
  --work /fast/…/vk --out .../w1/R72Exec1/kill-power-fixlane-b.json --jobs 8
KILLPOWER_FIXLANE_RC=0
{"unmutatedExit":0,"forceTrue":{"mutants":94,"killed":94},"semantic":{"mutants":12,"killed":12},
 "survivors":[],"holds":true}
```
Under the fix, every force-true mutant fails its *own* targeted case (94 distinct failure signatures, min 1
case each) and `M5-producer-verdict-and-to-or` dies on its 9 `producer-verdict-*` cases with no collateral
boundary case — i.e. the measurement becomes meaningful, not merely non-vacuous-looking.

Recommended battery guard so the class cannot recur: compute `jitter = max|clientX−AT.x|, |clientY−AT.y|`
over the real receipt's anchor wheels and **refuse (exit 2)** any refusal case whose displacement is
`≤ T + jitter`, the same way `kill-power-r72.mjs:44-47` refuses an edit string that does not occur exactly
once. That converts a coin-flip mutant into a build-time error.

## 6. Risks / limits

- The fix is a **variant measurement** in scratch, not an applied change; the frozen battery, counter, claim
  and kill rule are untouched. Round 73 must re-freeze (new battery digest) before C1 can be re-attempted.
- `holds:true` under the fixed battery is shown on **my** receipt only (1 of 2 possible real receipts). The
  +3 displacement is receipt-independent by the rule above (399+3=402, 400+3=403, both > 401), and the
  battery passes 218/218 on both receipts, so the residual risk is low but single-receipt.
- The `default` leg is subject to the same boundary (its x values are also 399/400); on these two receipts
  the first `default` wheel is 400, so `default-wheel-anchor-2px` is killed — it would survive on a receipt
  whose first `default` wheel is 399. The same rule should be applied to it.
- No blockers. No tools installed or upgraded (no pacman/uv/npx use). Scratch `/fast/scratch/hyaku/tabi-r72/R72Exec1/`
  deleted after copying every receipt into this directory.

## Artifacts (this directory)

`receipt.json` (my cold-run receipt), `counter.json`, `driver.out`, `driver.err` (0 B), `negatives-a.json`,
`negatives-b.json`, `kill-power-a.json`, `kill-power-fixlane-b.json`, `fixvariant-{a,b}.json`,
`fixvariant2-{A,B}.json`, `fixlane-battery-{A,B}.json`, `proposed-battery-fix.diff`, `report.md`.
