# Round 65 — adversarial critique of claims-draft.md (R65Critic)

Base: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162. Sources read: claims-draft.md; AXES.md (fleet root, lines 15, 21-22, 33);
LEARNING.md (fleet root, trend table, discernment section); corpus/QUALITY.md:890-937 (criteria 116-118, 114 at :863);
SCORECARD.md:3512-3560 (round 64). Instruments read: round-62/counters/c1-adjacency-host-v21.mjs; scripts/check-receipt-provenance.mjs.
Target status: `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs`, `check-receipt-provenance-v2.mjs` and `controls/c1-honest/`
are ABSENT at review time (test -s false). Behavioural claims below are attacked on frozen text and committed controls only.

## Verdicts

- C1 (adjacency, claims-draft.md:9): `refuse: axis mis-assigned` — see (a). The instrument may be sound; the claim as drafted does not move
  the axis it names, and its lowest-axis satisfaction is nominal. Re-submit either as calibration with a separately counted adjacency move,
  or with an adjacency content measure (see (a)).
- C2 (calibration, claims-draft.md:32): `amend-before-freeze: Frozen predicate sentence: \`v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every matrix's named input resolves to a file whose sha256 equals the matrix's pinned sha256.\``
  Replace with: `v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every JSON file in that directory carrying an \`input\` object has its named input path (relative to --repo, resolved at REV) hold bytes whose sha256 equals the pinned sha256 that the same file declares; a self-declared pin is a declared residual, not a provenance anchor.`
  Plus the three companion amendments in (d) and (e) below (the glob, the absolute-path rule, the residual list).

## (a) Is C1's axis (adjacency) honest?

Verdict: NO as drafted. Best-fit reading is calibration (discernment), and the claim's own measured effect is zero on adjacency.

Evidence:
- The surface the claim says it moves is the meter's refusal set: "the adjacency-ledger meter's delta layer" (claims-draft.md:11-13). The refusal class is a
  consistency check on the audit instrument, not a new cross-domain report.
- The positive control C reuses the unchanged real ledger `corpus/adjacency-host-delta-r62.tsv` (claims-draft.md:26). Adjacency content before and after
  C1 is identical. I verified by awk that this ledger has 0 same-key conflicting line rows and that the two forgeries have 1 each (see c).
- AXES.md:15 names the calibration signal as "SHONEN.md/SCORECARD entries match observed repo state"; a ledger that gives one line two
  dispositions is a record that cannot match a single observed state. Refusing it is the overreach-caught move that AXES.md:15 and
  LEARNING.md's discernment row describe.
- LEARNING's trend table makes expansion (the trend that carries adjacency, AXES.md:21) improved only by "net new admitted entries on uncovered ground".
  C1 admits no entries. The discernment trend (AXES.md:22 "discernment ↔ calibration") is the only one it moves.
- The adjacency reading would require the lane's contested-scope naming to grow or to be adjudicated (AXES.md adjacency row: "Lane reports name
  contested scope; integrator arbitrates"). A refusal does not add any named contested scope; it removes an incoherent duplicate. The adjacency
  score's evidence pointer is therefore not moved.
- Consequence: the header's satisfaction of the lowest-axis obligation ("the lowest-axis obligation applies: C1 works adjacency", claims-draft.md:6)
  is nominal. AXES.md:33 requires "at least one claim works the lane's lowest-scoring non-retired axis". Relabelling C1 as calibration would leave
  the round with no adjacency claim, so the fix is not a relabel: it needs a counted adjacency move (for example, an adjudicated
  contested-open row count at REV with its before/after) or an operator ruling that the obligation is waived. That is the L1's decision.
- Non-adjacency reading (calibration/discernment, overreach caught) fits the instrument; the claim survives under it only with the axis changed and
  the lowest-axis gap closed.

## (b) Is C2's axis (calibration) honest for a matrix-binding gate?

Verdict: YES on the calibration reading, which is the best fit; the claim does not survive under the other readings.

- Best fit: AXES.md:15 calibration = "SCORECARD entries match observed repo state". A matrix naming a nonexistent input, or a digest that is not the
  input's bytes, is a record that does not match observed state. The gate's added check (claims-draft.md:38-40) is a discernment gate in
  LEARNING's sense (AXES.md:22).
- Coverage reading (the gate checks one more record class): LEARNING's expansion row counts "admitted entries on uncovered ground"; a gate that
  refuses forged matrices admits nothing. So under LEARNING this reading is not an expansion improvement either. The claim would not survive as coverage.
- Operability reading (the gate runs): the claim's before→after is a verdict change on forged input, which is the instrument's correctness, i.e.
  calibration again. It does not survive as operability either.
- Axis-rule conflict to resolve before freeze: the brief's rule says a claim on a non-lowest axis without the nudge is a defect. AXES.md:33 says
  only that at least one claim must work the lowest axis. Under the AXES.md text C2 is admissible; under the stricter brief reading it is a defect
  (calibration 9 > adjacency 8; the nudge is inactive, claims-draft.md:5-6). The operator should rule which reading governs. I report both.
- Under calibration, C2 is still defective as drafted because the pin it checks is producer-declared (see d), which is the QUALITY 118 pattern.

## (c) Do either target fail the do-nothing rule (QUALITY 116: a do-nothing control cannot reach the target)?

C1: letter satisfied; spirit not met.
- Letter: v21 is the do-nothing control. v21 cannot refuse a conflicting duplicate (it keeps the first row, `if (!lineRowAt.has(key)) lineRowAt.set(...)`, v21 lines 166-167; P3 reads only that row, line 198). Output on the three redbefore runs is findings []
  (`controls/redbefore/tmp-*.json`).
- Evidence defect (QUALITY 114/116 require argv + exit + stdout digest): `controls/redbefore/` has NO `.command.json` receipts. Its three JSON files
  (`tmp-pristine.json`, `tmp-delta-dup-contradiction.json`, `tmp-delta-fab-label.json`) are byte-identical (SHA256SUMS: all three 802677d4…) and carry no
  delta path or digest, so they cannot show which ledger each run read. No v21 run on B exists at all; "committed before freeze" (claims-draft.md:28) is not yet true.
- Spirit: the cheapest no-work control that reaches the A/B refusal targets is a duplicate-key awk over the ledger's first two columns. I ran it:
  conflicts = 1 on A (`controls/c2-fixtures/delta-dup-contradiction.tsv`, kagi-shokunin PROVINCE.md:41 `no-tabi-ground` vs `contested-open`), 1 on B
  (`round-62/w1/R62Reviewer/real-conflicting-delta.tsv`, kaidoku-shokunin PROVINCE.md:55), 0 on C. That 5-line script reaches the target
  without the meter. QUALITY 116 requires declaring it, and the A/B targets are then evidence-quality only. The claim does not declare it.

C2: letter satisfied; the positive control does not exercise the new check.
- Letter: v1 is the do-nothing control and exits 0 with failures 0 on A (`controls/redbefore/v1-gate-on-c1-fab.json`: checked 14, matrices 2,
  failures 0, ok true). Confirmed.
- Positive control B cannot discriminate v2 from v1. The round-64 scored population has zero matrices by the gate's glob
  (`scripts/check-receipt-provenance.mjs:88`, `/^matrix.*\.json$/`), but it does contain two matrix-shaped files with an `input` object:
  `round-64/controls/scored/mutants-matrix.json` and `negatives-matrix.json`. The gate never sees them. So B's "exit 0, failures 0" (claims-draft.md:50)
  is green because the matrices are invisible, and would stay green under a v2 that is still blind.
- Positive control C does not exist: `controls/c1-honest/` is absent. As written, the only positive test of the new check is missing.
- The cheapest no-work control (`test -e` and `sha256sum` on each matrix's input path) reaches A's target as well. Declare it, as with C1.
- Absolute paths: both r64 matrices use absolute host paths
  (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/controls/scored/smoke/receipt.json`). Under the rev-bound read the gate already uses
  for receipts (`readAt`, check-receipt-provenance.mjs:25-30: `git show rev:<path>`), an absolute path can never resolve at a commit. I verified this:
  `git show e3f5215…:/home/…` fails, while the relative path `.ufo/waves/round-64/controls/scored/smoke/receipt.json` exists at that rev with sha256
  4e3a95c1…, matching the matrix's pin. So B fails under a rev-bound v2 once the glob is widened, and the claim's "(absolute, or relative to --repo)"
  (claims-draft.md:39-40) contradicts "resolves at REV" (claims-draft.md:43-44).
- In A, the two matrix findings are distinguished by detail only ("input absent" vs "input digest mismatch", claims-draft.md:41-42). Under the rev-bound
  read with absolute paths (matrix-fab2 uses an absolute path too), BOTH findings say "input absent"; the digest branch is then never exercised. Kill
  rule must assert the detail per matrix, not only the count.

## (d) Are the declared residuals honest?

C1 residual (claims-draft.md:30) — NOT honest as written.
- It says `controls/c2-fixtures/delta-fab-label.tsv` "remain accepted". That file has three same-key conflicting pairs: audio-shokunin PROVINCE.md:4, :25 and :41
  carry `no-tabi-ground` (fixture lines 3-5) and `overlap-declared` (fixture lines 177-179). The claimed v22 rule refuses it. The residual names a
  file the instrument refuses. Either the file or the sentence is wrong; the residual cannot stand as written.
- Omitted: same-disposition duplicates. v21 checks the quote only on the first row for a key (v21 :167, :198); the (e) pass over line rows
  (v21 :226-247) checks only that the line is a hit, not its quote. A second row with the same disposition and a spliced quote is accepted, and the
  claim's own "Same-disposition duplicates are not refused" (claims-draft.md:17) makes this a declared behaviour with no declared consequence.
- Omitted: host dependence. The roster is a host directory scan and sibling bytes are read from the fleet's git objects at the snapshot heads
  (v21 rosterScan :308-325, makeSibRefGit :298-306). A new or missing fleet lane changes the verdict at the same lane revision. "Scored at the freeze
  revision" (claims-draft.md:23) is not reproducible from the lane's committed bytes alone, and the argv names `--fleet /home/vgpnk/Projects/shokunin`
  (claims-draft.md:24), which is outside the lane's committed tree.

C2 residual (claims-draft.md:54) — PARTLY honest, and factually wrong about the directory.
- "the 12 invented receipts in c1-fab/ (self-consistent digests over runs that never happened)": the directory holds real executions. Example:
  `controls/c1-fab/fab-counter-smoke-1.stdout` is a real counter output (`schema tabi-r64-wheel-counter`, checks 40) and
  `fab-gate-selftest-1.stdout` is a real selftest verdict. The honest description is "receipts produced by executing instruments over fixture
  inputs; they are not witnesses of the scored population". The count 12 is consistent only when the two matrix command receipts are excluded
  (checked 14, matrices 2).
- Omitted (the important one): the pin is self-declared. A matrix names an input and pins its digest in the same file. A forger who writes an
  input file and pins its own digest passes v2. That is the QUALITY 118 pattern (the expected digest is derived from the artifact under test:
  criterion 118 at corpus/QUALITY.md:919-937). The residual must name it, or the pin must come from a frozen source.

## (e) Universal claims versus what the counting command enumerates

Occurrences in claims-draft.md (line: wording → enumerated by the counting command?):
- :17 "Every v21 selftest case is retained unchanged." → NO. No command runs `--selftest`.
- :20 "no two delta line rows share a (lane, relPath, line) key" → PARTLY. Enumerated over the three explicit --delta files only; the default-path
  REV predicate is not run by any command.
- :23 "each command is one committed argv" → PARTLY. The argv includes the host path `--fleet /home/vgpnk/Projects/shokunin` (outside the lane).
- :29 "any of A or B accepted" → YES (A, B).
- :29 "any v21 selftest case lost in v22" → NO.
- :29 "any byte of the v22 file changed after freeze" → NO. No digest command; QUALITY 114 needs a pinned sha256 in the freeze.
- :30 "blanket same-line labels" → NO (residual; no fixture for it; the named fixture is refused, see d).
- :43-44 "every receipt passes the v1 checks" → PARTLY. Enumerates `*.command.json` only (check-receipt-provenance.mjs:87).
- :43-44 "every matrix's named input" → NO. Enumerates `^matrix.*\.json$` only (:88). Counterexample: `round-64/controls/scored/mutants-matrix.json` and
  `negatives-matrix.json` carry `input` objects and are not enumerated.
- :53 "any byte of the v2 file changed after freeze" → NO (no digest command).
- :53 "exactly the two `matrix-input` findings" → YES (byCheck count), but detail is unasserted (see c).
- :35 (v1 "never opens the named input") → verified true: checkMatrix (:74-86) reads only the matrix JSON and checks the command file's existence.
- No occurrence of "all" or "complete" in claims-draft.md.

## Other defects (must be closed before freeze)
- QUALITY 114: the draft pins no instrument digests; the freeze must.
- C2 cites S170 ("NIST FIPS 180-4, opened this round", claims-draft.md:7). `grep S170 corpus/SOURCES.md` finds nothing at base; the row must be opened and recorded before the freeze.
- C1 do-nothing and C2 positive controls are "committed before freeze" in the draft (claims-draft.md:28, :51). Neither is committed (see c).
