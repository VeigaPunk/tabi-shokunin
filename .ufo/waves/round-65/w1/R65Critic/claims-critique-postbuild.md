# R65Critic — post-build addendum (instruments appeared during the poll)

Supersedes the following lines of `claims-critique.md` (that file is kept byte-for-byte; this addendum is the current state):
- "Target status ... ABSENT" → both instruments now exist (sha256 below).
- (c) "positive control B cannot discriminate v2 from v1 ... zero matrices" → v2's glob now matches `*-matrix.json`; B now binds 2 matrices and passes.
- (e) ":43-44 every matrix's named input → NO (glob misses the r64 matrices)" → the two r64 names are now matched; any other name still escapes (see 3).
- "c1-fab ... matrices 2" → c1-fab now holds 3 matrices (see 4).

Built artifacts (read-only attack, run from the lane tree with absolute arguments; no lane gate was written):
- `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` sha256 4d3a6b589d1c3a795314cc93b2cd481071c70309a957cb54031a6971002d50d5
- `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs` sha256 81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4
- `controls/c1-honest/` still ABSENT: the C2 positive control C cannot run.

## Measured results
C1 (v22, `--rev 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`, fleet/snapshot/audit as in claims-draft.md:24):
- A (`controls/c2-fixtures/delta-dup-contradiction.tsv`): exit 1, `delta-disposition-conflict` — target met.
- B (`round-62/w1/R62Reviewer/real-conflicting-delta.tsv`): predicate False, `delta-disposition-conflict` — target met.
- C (`corpus/adjacency-host-delta-r62.tsv`): predicate True, 0 findings — target met.
- `controls/c2-fixtures/delta-fab-label.tsv` (the file the claim's residual says "remains accepted", claims-draft.md:30): predicate False, THREE `delta-disposition-conflict` findings. The residual is false as written (confirmed (d)).
- v22 `--selftest`: exit 0; 47 cases; all 44 v21 case names present (name-set check only: case bodies are not compared by any counting command).

C2 (v2):
- A (`controls/c1-fab`, rev 58ed8c7a…): exit 1, byCheck `matrix-input` = 3 (`matrix-fab1.json` input absent; `matrix-fab2.json` digest mismatch; `fab-selector-matrix.json` digest mismatch). Target says exactly 2 (claims-draft.md:49, :53): FAILS as drafted.
- B (`round-64/controls/scored`, rev e3f5215…): exit 0, failures 0, matrices 2 (`mutants-matrix.json`, `negatives-matrix.json`) — both now bound and passing. Binding is live on the honest population.
- v2 `--selftest`: exit 0, 12/12 clean.

## Remaining defects (post-build)
1. Predicate/instrument mismatch on rev: claims-draft.md:43-44 says the input "resolves ... at REV"; v2 header (line 2) and `checkMatrix` (lines 88-89) resolve the input in the --repo WORKING TREE, and accept absolute paths. A matrix's binding is therefore not reproducible from committed bytes at REV. Amend the sentence to "resolves in the working tree" (and then the freeze must state that A and B depend on the working tree), or bind at REV with `readAt` and forbid absolute paths.
2. Self-pin confirmed in the instrument: v2 selftest `matrix-good` pins the digest of its own input (`check-receipt-provenance-v2.mjs:134-136`). The predicate's "matrix's pinned sha256" is the producer's own field (QUALITY 118 pattern). The residual must name it or the pin must come from a frozen source.
3. Glob still incomplete: `check-receipt-provenance-v2.mjs:100` matches `^matrix.*\.json$` or `-matrix\.json$`. A matrix named otherwise (for example `fab-selector-matrix.json` matches only by the suffix rule; `m-fab.json` would not) escapes. "every matrix's named input" (claims-draft.md:44) is therefore enumerated by filename, not by content (containing an `input` object). Amend to "every `.json` file in the directory carrying an `input` object".
4. c1-fab is not a frozen fixture: it now has a third matrix `fab-selector-matrix.json` that the claim does not describe ("two matrices", claims-draft.md:47). The A control's target (matrix-input = 2) fails on the current bytes. Freeze the directory bytes (and the count) before scoring, and amend the count in claims-draft.md:47-49.
5. The residual "12 invented receipts" still holds numerically (checked 15 = 12 receipts + 3 matrix command receipts), but "runs that never happened" is wrong (see claims-critique.md (d)).
6. C1: v22 compares only dispositions for a key (`counter` lines 173-186). A second same-disposition row with a different quote is accepted (the first row's quote is the only one checked, v22 :213). The claim's residual list does not declare it.

## Verdicts (unchanged in substance)
- C1: `refuse: axis mis-assigned` (the instrument meets its own targets; the axis label does not — see claims-critique.md (a)). The residual false-statement (delta-fab-label) also needs amendment on any resubmission.
- C2: `amend-before-freeze: Frozen predicate sentence: "v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every matrix's named input resolves to a file whose sha256 equals the matrix's pinned sha256."` → replace with: "v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every `.json` file in that directory carrying an `input` object names an input that resolves in the working tree to a file whose sha256 equals the pin that same file declares (a self-declared pin; declared residual)." Plus items 1, 3, 4 above.
