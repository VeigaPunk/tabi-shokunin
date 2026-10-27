# Round 36 SCORECARD/LOG integration checklist

**Exactness boundary:** before-scores are frozen in `claims.json` (`axisScoresAtRoundStart`). After-scores cannot honestly be asserted before the required C1/C2 measurements at the measured integration tip. L1 MUST use the actual JSON outputs there; do not infer a numeric increase from a passing predicate or from the landing commit. Record no move if a claim predicate fails, and keep score unchanged. The `measure.sh` contract requires frozen counters and frozen digests, so cite its committed raw output under `.ufo/waves/round-36/measure/` and measured full revision in both scorecard evidence and LOG.

## 1. Per-claim SCORECARD rows

| Claim | Axis | Before → after | Counting command | Evidence pointer | Measured commit |
|---|---|---|---|---|---|
| C1 | adjacency | 8 → **fill from actual measured result** (8 if predicate fails; otherwise state the justified score explicitly; do not auto-bump) | `node .ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | `.ufo/waves/round-36/measure/` C1 raw JSON and measurement provenance; predicate requires clean adjacency, completeness unaccounted 0, drift total >=1, all drift audited, zero drift/stale findings, zero delta unaccounted/screen findings | `<full measured REV>` |
| C2 | operability | 9 → **fill from actual measured result** (9 if predicate fails; otherwise state the justified score explicitly; do not auto-bump) | `node .ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs --rev <REV> --repo <clean clone> --json` | `.ufo/waves/round-36/measure/` C2 raw JSON and provenance (including binaries); predicate requires no entry/receipt/binding findings, failing 0, admitted >=16, live egressNonLoopback 0 | `<full measured REV>` |

`claims.json` explicitly gives axisScoresAtRoundStart: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. Only C1 and C2 are claims. This checklist does not authorize score changes on unclaimed axes.

## 2. Planned-row dispositions / routed defects

SCORECARD `## Planned / retired` currently says planned none and retired none (historical terminal-chain text), but later continuation sections document ongoing rounds; L1 must append/update the current round disposition without rewriting historical facts. LOG should likewise distinguish landed fixes from carried defects.

- Defect 1: D11's 0-byte evidence pointer correction is required and `claims.json` says it lands this round, not a claim. Verify landed correction at measured tip (expected entry correction); cite exact entry/README location and commit. If absent, mark carried, not done.
- Defect 2: C2 amendment is claim C2 and expected landing includes M1 threshold 16, M3 non-loopback live socket sample, M4 caller-named binary refusal, plus w2 MutDriverReceipt whitespace-normalized twin self-sniff. Verify counter/receipt evidence and measured counter result; any unfulfilled leg is disclosed, not represented as landed. Rewritten-id limitation remains explicitly disclosed (C2 claim feasibility disclosure).
- Defect 3: S125 `on-release` cadence plus four companion files landed in wave-1 commit `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`; cite that commit and list companion artifacts as appropriate. This is not a claim/score move.
- Defect 4: C1 meter split (completeness versus delta discovery) is claim C1. Record actual predicate/count result; the frozen claim's target includes 307/307 drift rows and empty delta leg accounted, not the old fixed newMapped quota. Do not silently change the frozen predicate or target.
- Round-35 spot-check routed D11 / C2 / S125 / C1 respectively. The round-36 frozen claims explicitly route these same four defects; their dispositions must be marked landed only with evidence at measured tip or honestly carried.

## 3. Capabilities table

No new capabilities-table row is warranted by these two claims: C1 is an adjacency ledger/meter change, C2 is an amendment and fresh live measurement of the existing `webdriver-bidi-runtime-firefox` capability, not a distinct capability. Preserve the existing capability row; do not claim a new capability absent an explicit new demonstrated capability and corresponding evidence.

VERDICT ok checklist identifies frozen before-scores, conditional measured after-values, four routed-defect dispositions, and capability-table treatment; after-values intentionally require actual measured-tip counter output.VERDICT ok checklist identifies frozen before-scores, conditional measured after-values, four routed-defect dispositions, and capability-table treatment; after-values intentionally require actual measured-tip counter output.
