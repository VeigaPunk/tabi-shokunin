## Round 17 — hyaku, 2026-10-20

DRAFT by scribe DraftScorecard. Every `PENDING` is resolved by L1 at integration from the counters' output at the measured revision. Nothing in this section is measured yet.

Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean, `.ufo/waves/round-17/PLAN.md:4`). Measured revision: PENDING (L1 integration revision; all three counters run at it, `PLAN.md:89`, `:133`, `:151`).

Claims: three, on three distinct axes, causally separable (`PLAN.md:36-40`).
- C1 works operability 8, a lowest non-retired tie (depth/operability/freshness/adjacency at 8; `SCORECARD.md:742-747`, `PLAN.md:16`).
- C3 works adjacency 8, the same tie (`PLAN.md:30-34`).
- C2 is a capability acquisition on coverage 9 (`PLAN.md:24-29`); coverage is not the lowest axis.
- Stagnation waiver: NOT applicable. Saturation line 8 and window 3 (`SCORECARD.md:773`); the round-16 capability `webmcp-cdp-observation` entered inside that window (`SCORECARD.md:766`), so the nudge condition in `AXES.md:66-73` does not hold. The lowest-axis obligation stands; C1 satisfies it.

| Axis | Scalar before → after | Round17 verdict / evidence |
|---|---|---|
| depth | 8→PENDING | PENDING; no depth claim declared; expected unchanged |
| coverage | 9→PENDING | PENDING; C2 held WebMCP-invocation entry 0→1 if `receipt.json` passes its predicates; 10 withheld unless real-site or agent-side ground is measured (precedent `SCORECARD.md:743`) |
| operability | 8→PENDING | PENDING; C1 jj-anchor-safe entry count 0→N (claims table); 9 decided by L1 from the measured count |
| freshness | 8→PENDING | PENDING; no freshness claim declared; expected unchanged |
| calibration | 9→PENDING | PENDING; no calibration claim declared; expected unchanged (QUALITY criterion for the round-16 "unforgeable" overstatement is routed, `PLAN.md:169`, not scored here) |
| adjacency | 8→PENDING | PENDING; C3 verified adjacency dispositions 0→N (claims table); 9 decided by L1 from the measured N and the checker exit |

| Claim | Before → after | Counting command | Measured revision / counter digest / evidence |
|---|---|---|---|
| C1 operability — jj-anchor-safe gate entry points | 0→PENDING | `node .ufo/waves/round-17/measure-c1.mjs REV` → `{"c1_anchor_safe": N, "entries": [...]}` | Before 0 is [INFERENCE]: at baseline the gates read git HEAD (`PLAN.md:61-63`), so arm B of the counter (`PLAN.md:94-96`) is expected to diverge. Entry list is seven modes fixed in the counter (`PLAN.md:100-105`). Counter digest PENDING; gate blob digests PENDING |
| C2 coverage — held WebMCP-invocation entries | 0→PENDING | `node .ufo/waves/round-17/measure-c2.mjs REV` → `{"c2_invocation_held": 0 or 1}` | Before 0 grounded: the round-16 receipt invokes no tool (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`). Receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json` PENDING; harness `scripts/webmcp-invoke-round17.mjs` producer sha PENDING; note `corpus/knowledge/webmcp-invocation-round-17.md` PENDING (`PLAN.md:128`) |
| C3 adjacency — verified dispositions | 0→PENDING | `node .ufo/waves/round-17/measure-c3.mjs REV` → `{"c3_adjacency_verified": N}` | Before 0 grounded: `corpus/adjacency.tsv` does not exist at baseline (glob `corpus/adjacency.tsv` → not found). Rows from `.ufo/waves/round-17/adjacency/<sibling>.tsv` PENDING (`PLAN.md:152-153`); checker `scripts/check-adjacency.mjs` exit PENDING; integrator ruling row (`corpus/lessons/round-16-verifier-spotcheck.md:138-142`) PENDING |

Round-end receipt (routed defect 3, `corpus/lessons/round-16-verifier-spotcheck.md:150`; `PLAN.md:164-166`): `corpus/evidence/round-17/measurement-binding.json` `--check … --at <delivered tip> --reproduce` exit PENDING; L1 writes at round end.

Sources 40→PENDING (A31/B4/C5; mined33/queued2/rejected5 at start, `PLAN.md:7`; 40 at end of round 16, `SCORECARD.md:759`). New rows S041+ only for primary sources opened this round (`PLAN.md:29`, `:128`); rejections kept with reason. Knowledge notes 33→PENDING (33 at `SCORECARD.md:760`; `corpus/knowledge/*.md` lists 33 files), +1 if `webmcp-invocation-round-17.md` lands.

Trends: expansion PENDING; quality PENDING; discernment PENDING. No exploratory claim is declared (`PLAN.md` declares none), so no non-author reviewer is required (`AXES.md:43-55`); trend verdicts remain self-assessment until an outside check.

### Capabilities — round 17

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webmcp-cdp-invocation | Invoke a page-registered WebMCP tool over CDP (`WebMCP.invokeTool`) on flag-enabled Chromium 154 loopback and record the invocation, response events and page-side receipt, with a flag-off control | `node scripts/webmcp-invoke-round17.mjs --out <receipt.json>`; `corpus/evidence/round-17/webmcp-invoke/receipt.json` (summary PENDING) | round17 PENDING |

Enters only if the receipt passes its code-fixed predicates (`AXES.md:62-64`; `PLAN.md:118-125`). Limits to carry: loopback only; no real site (`corpus/README.md:302`); agent-side consumption not claimed (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:128-129`).

### Planned / saturation / retired — round17

- planned for round 18 (candidates; L1 selects 1–3 claims, each with an axis or capability): real-site WebMCP, operator-approval gated (`corpus/README.md:302`); agent-side consumption of page tools (`corpus/README.md:302-303`); Chromium 152 / CfT 156 untested (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:122`); freshness re-verification of S001–S019 90-day / on-release rows (`SCORECARD.md:770-771`); operability USER 6/10 or ruled out of scope (`SCORECARD.md:771`).
- saturation 8 / window 3 unchanged (`SCORECARD.md:773`). Round 17 is a capability acquisition, so by the round-16 precedent round 18 is position 1 [INFERENCE: pending L1 confirmation].
- retired: none; no axis declared saturated in this draft (L1 decides).

### L1 notes (not part of the section)

- `.ufo/waves/round-17/PLAN.md:24` cites the frontier phrase at `corpus/README.md:308-309`; the phrase "tool invocation as committed evidence" is at `corpus/README.md:303`, and `:307-314` is the wave-2 supersession note.
- Top-level `## Capabilities` table still reads "— none yet —" (`SCORECARD.md:385`); the round-16 row lives only in the per-round table (`SCORECARD.md:762-766`). L1 decides whether round-16 and round-17 rows enter the top-level table.
- Top-level `## Axes — final state` (`SCORECARD.md:91-100`) carries training-era scores (depth 7, coverage 5, operability 5, freshness 3, calibration 6, adjacency 5). This draft uses the hyaku scalars from `SCORECARD.md:742-747`, as rounds 12–16 did.
