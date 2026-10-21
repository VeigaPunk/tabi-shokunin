# ConnPlannerWalk — rounds 12–18 and C1 depth fit

**Scope:** read-only reconciliation of `SCORECARD.md`, `LOG.md`, governing `AXES.md`, round-19 `PLAN.md`, and the round-19 C1 proposal cache. Access date: 2026-10-21. Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.

## Axis claims and verdicts

“Claimed” below means a declared round claim, not every axis that received an unchanged verdict. “Improved” records the round's qualitative verdict; scalar scores stayed fixed throughout rounds 12–18.

| Round | Claimed axes | Improved verdicts | Unchanged verdicts / qualification |
|---|---|---|---|
| 12 | Freshness (C1), coverage (C2) | Freshness: 0→3 bounded source rechecks; coverage: 0→1 documented accessible-selector entry. | Depth, operability, calibration, adjacency unchanged. The planned scalar increases for freshness and coverage were explicitly withdrawn; both remained 8 and 9. |
| 13 | Operability (C1), coverage (C2) | Operability: 0→2 fixture-covered compatibility policies; coverage: 0→1 actual isolated locator/template demonstration. | Depth, freshness, calibration, adjacency unchanged. All ordinal deltas were 0; coverage/operability improvements were bounded claims, not expertise points. |
| 14 | Operability (C1), calibration (C2) | Operability: 0→2 non-shell historical counters; calibration: 0→1 qualified metadata correction. | Depth, coverage, freshness, adjacency unchanged; no scalar increases. |
| 15 | Operability (C1), calibration (C2) | Operability: 0→1 USER diagnostic contract; calibration: 0→1 enforced metadata/snapshot contract. | Depth, coverage, freshness, adjacency unchanged; no scalar increases. |
| 16 | Operability (C1), coverage (C2) | Operability: 0→1 measurement-binding contract; coverage: 0→1 native-WebMCP held entry/capability. | Depth, freshness, calibration, adjacency unchanged. |
| 17 | Operability (C1), coverage (C2), adjacency (C3) | Operability: 0→4 anchor-safe gate entries; coverage: 0→1 held WebMCP-invocation entry/capability; adjacency: 0→10 verified sibling-overlap dispositions. | Depth, freshness, calibration unchanged. |
| 18 | Freshness (C1), operability (C2), calibration (C3) | Freshness: 0→51 source-reopen receipts; operability: 0→6 hazard closures; calibration: 0→5 routed defect closures. | Depth, coverage, adjacency unchanged. Depth was explicitly deferred, not declared saturated. |

**Reconciliation:** the SCORECARD round tables and LOG entries agree on the claimed axes and reported improvement/unchanged outcomes. Round 12's “improved” verdicts do not contradict its zero scalar delta: the scorecard distinguishes bounded documentary/source-recheck improvements from ordinal score increases. Round 18 likewise records three improvements with all six scalars unchanged. References: `SCORECARD.md:458-513,525-589,591-659,661-730,732-774,776-817,819-862`; `LOG.md:535-591,593-698,700-827,828-962,963-1005,1007-1040,1042-1084`.

## Depth chronology and B tie

- **Last depth claim:** `user-20261015-r05` (2026-10-15), whose scorecard record names `depth` and its depth paragraph receipt (`SCORECARD.md:365-370`). Round 18 independently says depth “has not been claimed since user-round5” (`SCORECARD.md:858-860`). The rounds 12–18 table above therefore contains no later depth claim; round 19 is the planned return to it.
- **Lowest non-retired tie at B:** depth 8, operability 8, freshness 8, adjacency 8. Coverage and calibration are 9. This is stated at `PLAN.md:12-14` and is consistent with round 18's before/after axis table (`SCORECARD.md:825-834`); round 18 says no axis was retired (`SCORECARD.md:862`).

## C1 vs. the depth definition

`AXES.md:11` defines depth as **“decision tables with real thresholds, named error signatures, cited sources”**, with the accompanying signal that a reader can act on `SKILL.md` alone. PLAN C1 instead counts a row if it is under the named heading, names at least one passing case with observed CDP status/error text, cites a suitably dated/build-tagged S-row with a line anchor, and the receipt matches producer SHA/runtime identity (`PLAN.md:18-27`).

This is **partial alignment, not a full operationalization of depth**:

- The current citation predicate supports the *cited sources* dimension, and the receipt supports that an observation was recorded under the pinned runtime.
- The predicate does **not** require a real condition/threshold in the row, a distinct validation decision, or a named/stable error signature. Merely requiring some observed status/error text does not establish those properties.
- It does not require source-to-claim entailment or that the table answer match the linked case's observed fields. As written, the same passing case ID can be referenced by repeated rows; the round-cache critic gives the logical counterexample of one valid-input case repeated twelve times. That is a predicate-level counterexample, **not an executed test** of the absent round-19 counter (`CriticC1Depth.md:9-20`).
- The SKILL table draft lists candidate family questions, but its outcome cells and case IDs are still `TBD-observed`; it also identifies source coverage as incomplete for several families. It is planning material, not evidence for 12 completed decisions (`ScribeSkillTable.md:42-68`).

Thus C1's present count can show sourced, runtime-linked table entries, but does not by itself prove the full AXES depth criterion. Do not infer that a target count of 12 establishes 12 distinct, actionable validation rules.

## One bounded move: count reviewed decision IDs, not Markdown rows

Use a finite, predeclared C1 decision inventory as the counting unit. For each unique decision ID, bind one actionable SKILL rule to (1) its actual condition/boundary or threshold, (2) an exact Chromium-source proposition and line range, and (3) the distinct observed CDP outcome/error signature for a case that exercises that boundary. Have the case/receipt include the exact input and observed fields; pair invalid-boundary evidence with a successful control where applicable, with controls not earning extra IDs. Make the counter accept each ID once and reject duplicate row/case reuse, missing thresholds/signatures, mismatched source mapping, or table answers not supported by receipt observations. Where semantics cannot be mechanically derived, keep the finite source-to-decision mapping review-bound rather than pretending row counting proves entailment. The 12-row target should be credited only if at least 12 distinct eligible IDs are supported; otherwise report the actual count, not a manufactured 12.

This composes the family-level runtime questions in `ScribeSkillTable.md:42-59` with the critic's unique-decision/source-binding safeguards (`CriticC1Depth.md:26-32`). It improves **depth** on already-covered declarative WebMCP ground; it must not be counted as new **coverage** merely because there are many form families. Keep scope to the pinned Chromium 154 / Playwright 1.64 / Node 24.21 loopback path and do not generalize to imperative tools, general JSON Schema compliance, or untested surfaces.

**Risk:** the actual Chromium behavior/source evidence may support fewer than 12 distinct rules, especially where a family remains source-only or its expected behavior is inferred. A stricter count could therefore fall below target; that is honest evidence of an unmet target, not a reason to reuse cases or overstate source support. This proposal does not claim any current round-19 row has passed or that the counter has been repaired.

**Verification for the proposed move:** predeclare and review the finite decision/source mapping; exercise each eligible boundary in the committed harness under the exact runtime and retain observed input/status/error/field values plus a successful control where appropriate; have the counter re-run or otherwise authenticate the committed producer/cases/fixtures and reject duplicate-ID, duplicate-case, missing-threshold, missing-signature, source-mismatch, and forged-receipt mutants. Confirm only the depth counter changes; keep coverage and every other axis at its no-harm baseline. **Not run in this data-walk:** no browser, harness, C1 counter, mutant, build, or test suite was executed.

## Sources and access record

All cited local sources were read on 2026-10-21. URLs are exact local-file URLs; SHA-256 is over each file's decoded text body.

- `AXES.md:9-16` — `file:///home/vgpnk/Projects/shokunin/AXES.md` — SHA-256 `04ea5c9e89c91cef645536ab56863ebb014dce617e7083e54968092968a7d993`.
- `PLAN.md:12-27` — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md` — SHA-256 `c71e721a5b5edc371c29d8180d6b0d01b757b8c5f304006566b9a61c4cd27655`.
- `SCORECARD.md:318-379,458-862` — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md` — SHA-256 `afd3502f938d9dbb1ef7bfdb4312783d25c673bcd1d3457295b2900921be0d68`.
- `LOG.md:535-1084` — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/LOG.md` — SHA-256 `b2d5ff556dadd741c7542883af29f83d74158eadee5ad1bae652796a5c4c648f`.
- Round-cache `CriticC1Depth.md:9-32` — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/CriticC1Depth.md` — SHA-256 `22e9e83888f256b0ed9361f5eb8178d3ef4ce8cad54c7d483b4377649138c6d1`.
- Round-cache `ScribeSkillTable.md:42-68` — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/ScribeSkillTable.md` — SHA-256 `79ef6209cda71dcc72dc1d22f7376ebedc560be7249bcc2051c8407e0f366b20`.

## Isolation

- Clone path: none (report-only seat)
- Branch: none
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (B; no clone created)
- Commit: none
- Changed paths: `.ufo/waves/round-19/w1/ConnPlannerWalk.md` only (assigned report)
