# Round 19 C1/C2/C3 separability pre-check

## Axes and evidence status

- **C1: depth** — runtime-verified declarative WebMCP validation rows.
- **C2: operability** — round-18 hazard predicates closed on the routed mutant shapes.
- **C3: calibration** — routed defects closed with checkable correction records.

The plan calls the claims causally separable and says: “Removing any one claim's inputs zeroes only that counter.” (PLAN §Claims, lines 58–61.) The r18 matrix demonstrates this pattern at its measured revision: removing C1 inputs yielded `(C1,C2,C3)=(0,6,5)`, removing C2 inputs `(51,0,5)`, and removing all C3 inputs `(51,6,0)` (matrix lines 28–40). The r18 matrix also records a partial C3 removal, useful precedent for removing only one C3 subclaim.

**Important limit:** the current round-19 snapshot has no `measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`, or `corpus/evidence/round-19/validation/` tree. Thus the sets below are the plan-declared contract plus explicit r18 precedent, not observed r19 counter reads or tested r19 results. PLAN’s B values are all zero; the candidate’s final outputs remain unmeasured.

## Proposed removal matrix

Use one disposable revision per row, derived from the same complete candidate REV; keep all three counters present and run all three against each derived revision. Make narrow line/row edits inside shared documents, not whole-file deletions. Expected effects are contract expectations, not measured results.

| Removed claim | Remove/mask only these inputs | Expected counter result | Preserve / boundary |
|---|---|---|---|
| **C1** | `scripts/webmcp-validation-round19.mjs`; `corpus/evidence/round-19/validation/receipt.json`; `corpus/evidence/round-19/validation/cases/**`; `corpus/evidence/round-19/validation/fixtures/**`; the round-19 decision-table subsection in `SKILL.md`; only the C1 source rows `S077+` in `corpus/SOURCES.md`. | `c1_validation_rows = 0`; C2 and C3 unchanged from full REV. | Do not remove all of `SKILL.md` or `corpus/SOURCES.md`. The plan describes `probes/<family>.json` as throwaway probe output but does not declare it a counter input; do not count it as one unless the r19 counter explicitly reads it. Keep the receipt at `.../validation/receipt.json`, not under `webmcp-invoke/`. |
| **C2** | `scripts/webmcp-invoke-round19.mjs`; `scripts/freshness-witness-round19.mjs` if present; `.ufo/waves/round-19/c2-mutants/**`; any committed round-19 C2-only invoke receipt/artifact paths actually read by the counter. | `c2_gaps_closed = 0`; C1 and C3 unchanged. With the round-19 invoke successor removed, the r18-style newest-artifact selector should fall back to round 18, which the r18 removal matrix observed as insufficient for C2. | Keep byte-frozen `scripts/webmcp-invoke-round18.mjs` and `scripts/freshness-witness.mjs`; keep C1 validation artifacts outside the invoke-receipt namespace. Keep the counter itself. |
| **C3** | Only the round-19 C3 additions/records: the specific correction entries in `LOG.md` and `SCORECARD.md`; the relevant `corpus/QUALITY.md` rows 33–39; round-19 `swarm-registry.json`/matching `spec.json` pairs; `.ufo/waves/round-19/corrections/r18-registry-wave-null.md`; and `.ufo/waves/round-19/isolation/ledger.json` plus its required before/after status snapshots. | `c3_routed_closed = 0`; C1 and C2 unchanged. | Leave pinned `B:scripts/webmcp-invoke-round17.mjs` and `B:scripts/webmcp-invoke-round18.mjs` available for d2 re-derivation. Do not remove whole `LOG.md`, `SCORECARD.md`, or `corpus/QUALITY.md`. Preserve the ledger unchanged in the C1/C2-removal variants so D4’s all-writer inventory does not become an accidental treatment variable. |

At the inspected snapshot, the current round-19 registry/spec pair is `.ufo/waves/round-19/w1/{swarm-registry.json,spec.json}` and the pre-wave status file is `.ufo/waves/round-19/isolation/lane-status-before-w1.txt`. The plan requires before/after snapshots but does not specify a separate after-snapshot filename; include the actual after artifact once produced rather than assuming a name.

## Shared-input and coupling findings

1. **`corpus/SOURCES.md` is a known historical shared path.** The r18 matrix says the old C1 counter read `SOURCES.md`, while old C3 also read it to validate S058; the old C3 additionally read `.ufo/waves/round-18/sources/S058Listing.md` (matrix line 51; r18 measure-c3.mjs lines 27–39, 486–525). Removing only S058 left r18 C1 at 51 but lowered C3 to 4 (matrix lines 36–38). R19’s C1 uses new S077+ rows, while its declared C3 inputs do not include SOURCES. Therefore the r19 C3 counter must not inherit the old S058/SOURCES dependency. Row-scoped edits and an exact C3 allowlist avoid a whole-file false coupling.
2. **C2 has a broad historical receipt *enumerator*, but a distinct namespace.** The r18 C2 counter selects the newest `scripts/webmcp-invoke-round*.mjs` and scans `corpus/evidence/**` for paths matching `/round-\d+\/webmcp-invoke\/receipt\.json$/` (r18 measure-c2.mjs lines 172–180, 313–315). This does not match C1’s planned `corpus/evidence/round-19/validation/receipt.json`. Retain that disjoint path boundary; do not broaden C2’s filter to arbitrary `receipt.json` files.
3. **C3 D4 is a shared *metadata* dependency by design.** Its isolation ledger inventories every wave-1 production writer, so it will name C1/C2 writers and their assigned paths. That is not a read of their payloads if D4 checks ledger records and commit path lists only. Keep the same ledger in C1/C2 removal variants and require C3’s score to remain invariant. If C3 traverses or requires current existence of listed C1/C2 payloads, that is an undeclared cross-claim dependency and the stated separability fails.
4. The shared `REV`/Git tree and lane status are common substrate, not claim payloads. All three runs must use the same starting REV and equivalent isolated removal commits; otherwise revision changes, newest-artifact selection, or status state can confound the comparison.

## One bounded move

Make the three narrow, same-REV counterfactual removals above the acceptance probe for causal separability. Record the 3×3 output matrix and require a zero only in the removed claim’s column, with both non-target outputs equal to the full-REV run. This directly tests all three declared axes without editing shared production files in the lane; it also exposes the non-obvious D4 ledger dependency rather than treating it as scalar noise.

**Risks:** r19 read sets are not yet executable-observed; the C3 ledger can couple at metadata level; a C2 receipt glob broadened beyond `webmcp-invoke/` could capture C1’s receipt. Keep these as explicit checks, not assumed passes.

**Verification:** r18’s counterfactual matrix is observed evidence. No r19 counterfactual was run, because the r19 counters/validation tree are absent in the inspected snapshot. No tool was installed or updated.

## Source anchors

All sources below are local UTF-8 files; URLs are `file://` URLs, access date is **2026-10-21**, and SHA-256 is over the observed file bytes.

- Round-19 plan, §§Claims / C1 / C2, lines 18–61, 90–132. URL: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md`. SHA-256: `c71e721a5b5edc371c29d8180d6b0d01b757b8c5f304006566b9a61c4cd27655`.
- Round-18 separability matrix, removal commits / matrix / `counter_cross_reads`, lines 6–52. URL: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/CriticSeparability.matrix.json`. SHA-256: `aa52a80c7d20b8b2436dc4125e5a9885bb82af4df941cb30a9f8f6e9ddce52f2`.
- Round-18 C1 counter, path constants and revision inputs, lines 13–15, 552–580. URL: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs`. SHA-256: `30f44992044a7f148395c5cf4642b2d995349e080862a8b90c0e6f4df653d4a0`.
- Round-18 C2 counter, artifact selection and receipt scan, lines 172–180, 313–315. URL: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs`. SHA-256: `99ad9ff7ca664eaa3e64948308a53d1827e34983ce874c8b26f6e5dc6a49e4dc`.
- Round-18 C3 counter, `PATHS` and S058 verification, lines 27–39, 486–525. URL: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs`. SHA-256: `ab74c8d2630a607633bf61f45de4fc1020a70018b2eac7946bfe4342cbb8870b`.

## Isolation

Report-only connector work. No production files, clone, branch, or commit created; no writes outside the assigned report path.
