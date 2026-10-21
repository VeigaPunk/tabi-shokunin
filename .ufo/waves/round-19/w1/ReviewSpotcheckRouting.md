# Round-18 verifier spotcheck → round-19 routing review

Reviewed 2026-10-21. Scope: `corpus/lessons/round-18-verifier-spotcheck.md`, the current round-19 `PLAN.md`, `corpus/QUALITY.md`, and operator-named lessons. This is a plan-coverage review, not evidence that any round-19 change has landed or passed.

## Findings

### Partial coverage — routed defect 4 leaves one reported observation unmapped

The round-18 spotcheck groups two bookkeeping observations in routed defect 4: both wave registries had null `wave` values, and the w1 validation snapshot had a null `agentId` (spotcheck lines 158–159). Round-19 C3/d3 explicitly covers the registry part: it requires each round-19 registry's `wave` to match its spec and a correction note for the two round-18 null registries and their cause (`.ufo/waves/round-19/PLAN.md:50–52`). It does not mention correcting or dispositioning the w1 validation snapshot's null `agentId`; neither the current `QUALITY.md` criteria nor another plan section maps that observation. This is the one routed sub-observation left unmapped. The original note says counts and role vectors match and no claim depends on the null fields, so this is a low-risk, status-neutral bookkeeping gap, not evidence that a claim is false.

## Routed-item crosswalk

| Spotcheck item | Round-19 mapping | Coverage |
|---|---|---|
| Routed 1: LOG says QUALITY 33–38, but seven criteria 33–39 were added; keep the append-only LOG and correct the count (lines 143–145). | C3/d1 requires a new LOG entry naming `LOG.md:1059`, superseding the count with seven, and re-deriving criteria 33–39 from QUALITY (`PLAN.md:43–46`). The existing criteria are present at `corpus/QUALITY.md:140–165`. | Fully mapped. |
| Routed 2: writers shared one checkout instead of separate worktrees/clones (lines 146–148). | The writer-isolation contract requires a clone per production writer from B and restricts writes to assigned paths (`PLAN.md:71–88`). C3/d4 requires the wave-1 writer ledger to record clone, branch, base, commit and paths, plus matching pre/post lane status snapshots (`PLAN.md:53–56`). | Fully mapped. |
| Routed 3 — G-H4: suggested-name-only download scan and replayable records (lines 149–153). | C2 specifies a scan for any new file in `playwright-artifacts-*`, a fresh run nonce binding, and rejection of a pasted record (`PLAN.md:31–39, 123–128`). | Fully mapped. |
| Routed 3 — G-H1: SIGINT/SIGHUP were not each exercised with a live browser and abort receipt checks (lines 153–154). | C2 requires separate SIGINT and SIGHUP tests after a nonempty run-owned Chromium PID set, exit 2, no pass/fail receipt, and no surviving PID (`PLAN.md:34–35, 128–129`). | Fully mapped. |
| Routed 3 — G-F6: refusal testing omitted `@`, `master`, short hash, off-branch hash and reason checks (lines 154–155). | C2 requires those inputs, exit 2, and observed declared reason tokens (`PLAN.md:36–37, 130–132`). | Fully mapped. |
| Routed 3 — assertion-level delta: six checks replaced numeric CDP codes with message substrings; correction should say IDs/pass status retained (lines 155–157). | C3/d2 requires a SCORECARD correction at line 830 with that qualification and the six IDs, independently re-derived by comparing the round-17/18 scripts (`PLAN.md:47–49`). | Fully mapped. |
| Routed 4 — registry labels | C3/d3 requires matching registry/spec `wave` values and an explanatory correction naming both round-18 null registries and the dispatch-output cause (`PLAN.md:50–52`). | Fully mapped for registry labels; see the uncovered `agentId` observation above. |

## Disagreements and other notes

- The discernment spot-check reports agreement for all five sampled source decisions: S063, S065, S058, S001 and S010 (`round-18-verifier-spotcheck.md:117–129`). No source-decision disagreement is routed for round 19.
- The claim re-checks and no-harm conclusions are recorded as improved/no harm, not as defects requiring a round-19 correction (`round-18-verifier-spotcheck.md:40–115`). They do not create an additional routed item.
- The operator note says two L0 rulings remain open and promotion stays operator-owned (`round-18-verifier-spotcheck.md:161–165`). The current PLAN does not schedule those rulings or a promotion action. This is an explicitly operator-owned open dependency, not a routed round-19 defect; it remains unclosed by this plan.
- The note that round-18 corrections preserve historical bytes is consistent with the plan freezing existing round files and requiring append-only shared files (`round-18-verifier-spotcheck.md:166–167`; `PLAN.md:63–69`). No rewrite of the round-17 prose is planned.
- The final note about no secrets, private configuration, target mutation or host change is a record of the prior review's method, not a new teaching/action item (`round-18-verifier-spotcheck.md:168–169`).

## Operator-lesson scan

No `corpus/lessons/operator-*.md` files were found (glob over that directory returned no matches; the complete directory listing contains no operator-prefixed lesson). There is therefore no operator-named lesson with unreflected teaching to map.

## Review boundary and verification gaps

The lane is detached at baseline `66251bfc1aef393e4aec599e950a8deb867736bb`; read-only status showed only `.ufo/waves/round-19/` as untracked, and the tracked diff from B had no entries. Consequently there is no landed implementation diff or changed runtime behavior to validate here. The C1/C2/C3 statements above are planned criteria, not exercised results. The plan declares a canonical C1 runtime identity (Chromium 154.0.8037.97, Playwright 1.64.0, Node 24.21.0; `PLAN.md:18–27`); no resume path or same-identity rerouting is in the reviewed scope.
