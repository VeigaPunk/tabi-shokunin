# Tabi round 65 — claim text (pre-freeze; frozen as claims.json at the freeze commit)

Base revision: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162. Fixtures commit: see the round-65 LOG entry.
Axes at round start: adjacency 8 (lowest owned), coverage 9, depth 9, operability 9, freshness 9, calibration 9.
Saturation 8, window 3. Round 64 entered a capability, so the window has reset and the stagnation nudge is
NOT active: the lowest-axis obligation applies to C1. No capability enters this round.
Exploratory claims: none. Sourced claim: C2's digest reading rests on S170 (NIST FIPS 180-4, opened 2026-11-05).

## C1 — adjacency (lowest owned, score 8): a contested sibling overlap is not shadowed by a later row

Surface moved: the adjacency-ledger meter's delta layer (`corpus/adjacency-host-delta-r62.tsv` read by the
round-62 v21 meter). v21 keeps the first line row per (lane, path, line) key and never reads a later row on the
same key. A ledger that records a sibling hit line as `overlap-declared` and a later row on that key as
`contested-open` therefore passes: the contested sibling overlap is hidden from the adjacency record.
Critic objection, recorded and not resolved here: refusing contradictory dispositions reads as discernment
(calibration) of the meter. This claim's reading is that the hidden contested overlap is an adjacency-reporting
failure; the operator rules on the axis (L0 question filed by the L1).

Instrument: `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` = v21 plus refusal class
`delta-disposition-conflict` (two line rows, same (lane, relPath, line), differing disposition; the finding
detail names both). Schema string `tabi-adjacency-host-v22`. Selftest 47/47 (v21's 44 unchanged, plus
`conflict-refused`, `same-disposition-duplicate-accepted`, `three-row-conflict-count`).

Frozen predicate sentence (the same sentence appears in this claim, in the counter's PREDICATE-SENTENCE, and
as the receipt label): `v22 admits the lane state at REV iff the v21 predicate holds AND no two delta line rows
share a (lane, relPath, line) key with differing dispositions.`

Counting commands (committed argv; `<REV>` is the freeze commit):
- A (forgery, tabi-made, real ledger plus one contested-open row on kagi PROVINCE.md:41):
  `node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev <REV> --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-62/c1/snapshot-r62.tsv --audit corpus/adjacency-host-audit-r62.tsv --delta .ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv --json`
  Target: exit 1, finding `delta-disposition-conflict`.
- B (round-62 committed ledger with a same-key conflict): same argv, `--delta .ufo/waves/round-62/w1/R62Reviewer/real-conflicting-delta.tsv`. Target: exit 1, finding `delta-disposition-conflict`.
- C (positive control, the real committed ledger): same argv, `--delta corpus/adjacency-host-delta-r62.tsv`. Target: exit 0, findings [], predicate true.
- Do-nothing control (committed BEFORE the freeze, `.ufo/waves/round-65/controls/c1-dn-*.command.json`): the frozen v21 on A and on B. Target for the do-nothing row: exit 0, predicate true (both forgeries accepted).

Kill rule: A or B accepted; C refused; any v21 selftest case lost in v22; any byte of the v22 file changed after freeze.
Declared residuals (not claimed): (i) same-disposition duplicates with spliced quotes are accepted; the meter does not judge quote truth beyond v21's whole-line checks;
(ii) consistent labels with no sibling ruling are unjudged: a same-key row pair that agrees is accepted. `controls/c2-fixtures/delta-fab-label.tsv` (three same-key conflicting pairs) IS refused by v22 and is a recorded positive, not a residual;
(iii) host-dependent sibling snapshot and roster inputs.

## C2 — calibration (score 9): a matrix that names its input binds that input by digest

Surface moved: the receipt-provenance gate's matrix check. v1 (`scripts/check-receipt-provenance.mjs`) checks that a
matrix's `input` has a string path and a 64-hex sha256; it never opens the named input (round-64 H5). v1's matrix
selector also misses the round-64 `*-matrix.json` files, so the round-64 scored population was never matrix-checked.

Instrument: `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs` = v1 plus (a) matrix binding: the named
input path resolves (absolute, or relative to --repo, then to the matrix directory); absence and a sha256 mismatch
push `matrix-input`; (b) the selector also matches `*-matrix.json`. Receipt checks, CHECK_IDS and exit codes are
unchanged. Selftest 12/12.

Frozen predicate sentence: `v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every
matrix file (`matrix*.json` or `*-matrix.json`, not `*.command.json`) names an input that resolves in the --repo
working tree to a file whose sha256 equals the matrix's pinned sha256.`
Declared limit: "resolves" is the worktree file, not the bytes at REV; the scored run is on a clean tree, where the two agree.

Counting commands (committed argv):
- A (forgery, `.ufo/waves/round-65/controls/c1-fab/`: 12 tabi-made command receipts and three matrix forgeries: one
  nonexistent input, one wrong pinned digest, one `-matrix.json` with a wrong digest):
  `node .ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs --dir .ufo/waves/round-65/controls/c1-fab --repo . --rev <REV> --require-committed --min-receipts 12 --json`
  Target: exit 1, byCheck `matrix-input` = 3.
- B (positive control, the round-64 scored population, which carries two `-matrix.json` files): same argv with
  `--dir .ufo/waves/round-64/controls/scored --rev e3f5215615f68490230bd0c6db94f7d84f0fc084 --min-receipts 12`.
  Target: exit 0, failures 0, matrices 2.
- C (positive control, an honest executed command receipt and its matrix; `.ufo/waves/round-65/w1/R65Executor2/c1-honest/`):
  same argv with `--dir .ufo/waves/round-65/w1/R65Executor2/c1-honest --min-receipts 1`. Target: exit 0, failures 0.
- Do-nothing control (committed BEFORE the freeze): the frozen v1 on A (`c2-dn-v1-forgery-dir`). Target: exit 0, failures 0 (the forgery is accepted).

Kill rule: A not exit 1 with exactly the three `matrix-input` findings; B or C not exit 0; any byte of the v2 file
changed after freeze.
Declared residuals (not claimed): (i) the 12 invented receipts in `c1-fab/` carry self-consistent digests over runs
that never happened, and v2 cannot tell them from executed ones (QUALITY 116); (ii) the pinned digest is producer-
declared, the same pattern QUALITY 118 names, so a forger who writes both the matrix and its pin passes; (iii) the
honest fixture's matrix names its receipt by an absolute, machine-specific path.

## Not claimed
No capability row. No score change: a round that is not admitted holds every score (D10). Expansion, quality and
discernment verdicts are reported in the report, not inferred here.
