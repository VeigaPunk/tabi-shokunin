# R65Critic — round 65 wave w1 report

Seat: R65Critic (critic, leaf). Deliverables:
- `.ufo/waves/round-65/w1/R65Critic/claims-critique.md` (frozen-text critique with file:line evidence; written while the instruments were absent)
- `.ufo/waves/round-65/w1/R65Critic/claims-critique-postbuild.md` (addendum after the instruments appeared; supersedes the listed lines)

## Status
- Instruments appeared during the 25-minute poll (after ~9 minutes): v22 and v2 attacked read-only. `controls/c1-honest/` still ABSENT.
- No lane gate written, no registry touched, no git mutation. Lane tree: only this report and the seat's deliverable dir were written.

## Verdicts
- C1 (adjacency, claims-draft.md:9): `refuse: axis mis-assigned`. The v22 instrument meets its own targets (A exit 1, B exit 1, C predicate True 0 findings; selftest 47 cases incl. all 44 v21 names). The claim's axis does not match what it moves: a refusal of an incoherent duplicate is discernment/calibration (AXES.md:15, :22), and the positive control reuses the unchanged real ledger, so adjacency content is unchanged. The lowest-axis obligation (AXES.md:33; claims-draft.md:6) is then nominal. Re-submit as calibration with a separately counted adjacency move, or with an operator waiver.
- C2 (calibration, claims-draft.md:32): `amend-before-freeze: Frozen predicate sentence: "v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every matrix's named input resolves to a file whose sha256 equals the matrix's pinned sha256."` → "v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every `.json` file in that directory carrying an `input` object names an input that resolves in the working tree to a file whose sha256 equals the pin that same file declares (a self-declared pin; declared residual)."

## Answers
- (a) Adjacency is not the honest axis as drafted. Best fit: calibration (discernment). The adjacency reading needs contested-scope naming to move; the claim adds none.
- (b) Calibration is honest for C2 (a record that does not match observed state). Coverage and operability readings do not survive (LEARNING expansion needs admitted entries). The brief's stricter axis rule (non-lowest claim without the nudge is a defect) conflicts with AXES.md:33 (only "at least one" lowest-axis claim): operator ruling needed.
- (c) C1: letter passes (v21 cannot refuse); spirit fails: a 5-line awk duplicate-key check reaches A (1 conflict), B (1), C (0); redbefore v21 outputs are byte-identical and carry no argv receipts; v21 on B was never run. C2: v1 do-nothing evidenced (`controls/redbefore/v1-gate-on-c1-fab.json`: checked 14, matrices 2, failures 0). The positive control B was vacuous at draft time (matrices invisible to the glob); it now binds 2 matrices and passes. C (`c1-honest`) is absent.
- (d) C1 residual is FALSE: `controls/c2-fixtures/delta-fab-label.tsv` has three same-key conflicting pairs (audio-shokunin PROVINCE.md:4/:25/:41); v22 refuses it (3 findings). Undeclared: same-disposition duplicate rows with a spliced quote are accepted (v22 compares dispositions only); host dependence (fleet roster and sibling git objects). C2 residual mis-describes c1-fab as "runs that never happened" (real executions present); the self-declared pin is omitted and is modelled by the v2 selftest itself (`check-receipt-provenance-v2.mjs:134-136`).
- (e) Universals not enumerated by any counting command: claims-draft.md:17 ("Every v21 selftest case ... unchanged": names only checked, bodies not), :29 ("any v21 selftest case lost", "any byte of the v22 file"), :43-44 ("every matrix's named input": enumerated by filename, not content), :53 ("any byte of the v2 file"). Partial: :20, :23, :43. No "all" or "complete".

## Defects for the L1 (must close before freeze)
1. C1 axis mis-assigned (claims-draft.md:6, :11-13, :26).
2. C1 residual names delta-fab-label.tsv as accepted; v22 refuses it.
3. C1 do-nothing not argv-bound; v21 on B not run; redbefore outputs identical (SHA256SUMS).
4. C1 same-disposition duplicates with differing quotes accepted and undeclared.
5. C2 predicate says "at REV"; v2 resolves in the working tree and accepts absolute paths (`check-receipt-provenance-v2.mjs` line 2, lines 88-89).
6. C2 pin is self-declared (QUALITY 118 pattern); residual omits it.
7. C2 matrix enumeration by filename (`check-receipt-provenance-v2.mjs:100`); "every matrix" needs content-based enumeration.
8. C2 A control fixture is not frozen: c1-fab now holds 3 matrices (`fab-selector-matrix.json`); A's target (matrix-input = 2) fails on current bytes (measured: 3).
9. C2 positive control C (`controls/c1-honest/`) absent.
10. C2 residual "runs that never happened" is factually wrong for c1-fab.
11. Draft pins no instrument digests (QUALITY 114); S170 not in corpus/SOURCES.md at base.

## Command that proves the attacks (run by the L1 on committed bytes after freeze)
`node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev <FREEZE> --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-62/c1/snapshot-r62.tsv --audit corpus/adjacency-host-audit-r62.tsv --delta .ufo/waves/round-65/controls/c2-fixtures/delta-fab-label.tsv --json` → expect predicate False (the residual defect in item 2).
