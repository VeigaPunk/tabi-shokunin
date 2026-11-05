# Round 65 — lesson

Round 65 (attempt 1, Linux host) froze two claims before any scored data: C1 (adjacency, the
v22 meter refuses a delta ledger that gives one (lane, path, line) key two different
dispositions) and C2 (calibration, the v2 receipt gate binds each matrix's named input by
sha256 and selects the round-64 `*-matrix.json` population). Base `58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`;
freeze `03f35fe7b7d8c1cdc8323d3481cefeabb1aa32a7`; scored revision `4a3481048cb3afd0d6068fdbc1421dfec4f06084`
(the freeze plus the honest C2 fixture committed unchanged). Claim text: `.ufo/waves/round-65/claims.json`.

## Gate

Opened 2026-11-05. Located evidence is named per row.

| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S170 NIST FIPS 180-4, SHA-256 digest semantics | Admit, tier A, `spec`, scope "SHA-256 digest semantics (byte identity, not provenance)" | Located: `.ufo/waves/round-65/w1/R65Scout/fips-quote.txt`; the PDF (833,315 B, sha256 `0455b406…deb82`, fetched 2026-11-05) carries "the resulting 256-bit message digest of the message, M, is" (§6.2.2, printed p. 23; extraction lines 1095–1096, split by a page break) and "SHA-256 may be used to hash a message, M, having a length of l bits, where 0 <= l < 2^64" (§6.2, printed p. 21). Flip: the row grounds the computation and output length only; it does not ground authorship, execution, or collision resistance. |
| S140 Firefox 158.0.1 SHA256SUMS | Reject (held) | Published digest for one artifact; scope excludes digest semantics. Flip: a claim that one named Firefox tarball is the published one. |
| S141 geckodriver release digests | Reject (held) | Release-asset digests; scope excludes everything but the asset list. Flip: as S140. |
| S150 Node.js Crypto (sign, verify) | Reject as a new citation | Signatures bind a key holder; C2's predicate has no key. Flip: a claim that a receipt was authored by a named key. |
| S142 git-show object read | Reject for this round | Addresses blobs by revision; C2's predicate resolves a path in the working tree. Flip: a claim that a matrix input is the committed blob at REV. |
| Unopened SHA-256 explainers | Reject | An unopened source cannot ground a predicate (QUALITY 15). |
| External source for C1 | No row | C1's predicate is own-work: the v21 selftest and the committed round-62 ledgers. |

Registry: S170 is a new id (`grep -ciE 'fips|nist' corpus/SOURCES.md` was 0 at base; the next
free id is S170, see `.ufo/waves/round-65/w1/R65Scout/next-id.txt`).

Spot-check: pending (non-author). The lane does not fill this line.

## Mistakes

Each row: class · evidence · captured-by · fix. A fix counts only with its red state shown.

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `vacuous` (round 64, C2) | Round-64 C2's target (0 failures, at least 12 receipts) was reached by 12 never-executed receipts with invented stdout and matching digests, plus two matrices: `checked=14 matrices=2 failures=0 ok=true`. `corpus/lessons/round-64-verifier-spotcheck.md` §2 C2; `.ufo/waves/round-64/w1/R64Reviewer.md` H5, E6c. | none | This round froze the do-nothing control before data: v1 over `controls/c1-fab/` exits 0 with failures 0 (`controls/c2-dn-v1-forgery-dir.command.json`, committed at 39782a84). Red state: that exit 0. Green state: v2 exits 1 with `matrix-input` 3 on the same directory. |
| `number-drift` (round 64) | `corpus/lessons/round-64.md` lines 95–96 "closed with a residual wave w2 of 4 seats"; the round-64 tree holds only `w1` (`git ls-tree -r --name-only 40095308 -- .ufo/waves/round-64/` → `w1`, `w1-dispatch.json`, `w1.ready`, `sources`, `controls`, `counters`, `claims.json`). Spot-check D1. | none | Errata block appended to `corpus/lessons/round-64.md` (`## Errata — round 65`), naming the superseded sentence. |
| `number-drift` (round 64, D2) | Lesson says "eleven of twelve seats left a report"; `ls .ufo/waves/round-64/w1/*.md \| wc -l` → 10. Spot-check D2. | none | Errata, same block. |
| `number-drift` (round 64, D3) | Report says seven Mistakes rows; the table holds 11 data rows (`awk` over the section → 12 `\| ` lines = header + 11). Spot-check D3. | none | Errata, same block. The table-break defect (blank line inside the table) is recorded there and left unrepaired. |
| `number-drift` (round 64, D4) | SCORECARD routed defect (c) "18 of 30 … survive the declared negatives". Matrix: `survivedDeclaredNegatives` = 26 of 30; 18 of those accept the targeted forgery. Spot-check D4. | none | Errata, same block. |
| `scope` (own, v1 selector) | v1's matrix selector `/^matrix.*\.json$/` does not match the round-64 `mutants-matrix.json` and `negatives-matrix.json`, so the round-64 scored population was never matrix-checked. Red state: v1 on `.ufo/waves/round-64/controls/scored` → `checked 15 matrices 0` in the MutTester2 run; the freeze-time v1 run shows `matrices 2` only on `c1-fab`. Found by MutTester2 (calibration defect) and Critic (C2 positive control vacuous). | none | v2 selector widened (`/-matrix\.json$/` added). Green state: v2 on the scored population → `checked 15 matrices 2 failures 0`. |
| `scope` (own, digest reach) | A `-matrix.json` naming a wrong pin is invisible to v1 (no binding, and not selected). Red: `c1-fab/fab-selector-matrix.json` gives v1 no finding and v2 `matrix-input` 3 total with it. | none | Shown able to fail: the file is refused by v2 with "input digest mismatch" and passes v1 only because v1 never opens it. |
| `stale-premise` (own, C1 residual) | The claim draft named `delta-fab-label.tsv` as a residual accepted by v22. v22 refuses it on three same-key conflicting pairs (`audio-shokunin PROVINCE.md:4/:25/:41`). Critic (R65Critic) finding 2. | none | Residual rewritten in `.ufo/waves/round-65/claims-draft.md` C1 (ii) as a recorded positive; the frozen text carries the corrected residual. |
| `landing` (own, honest fixture) | The C2 positive control's fixture `R65Executor2/c1-honest/` was never committed. The freeze-revision scored run (`scored-at-freeze-03f35fe7/`) reports `input row(s) absent … receipts written but not freeze-valid` (runner exit 3); C2-C's input path is unresolved. | the runner's `rev-committed` input guard (exit 3) | Fixture committed unchanged at 4a348104 (no instrument or pin changed; the claim's pins are the freeze-time pins). The scored pass was rerun at 4a348104 (`scored-rev2/`), where every input resolves. Both runs are kept. |
| `landing` (own, claim title) | A line-range edit overwrote line 1 of `claims-draft.md` with `x`. Caught on re-read before any commit; restored from the edit's own text. | none (no check on draft headers) | Restored; the committed draft's first line is checked by `head -1` in the commit step. |
| `vacuous` (own, C1 selftest gap) | v22's selftest did not count findings on a multi-row group. Mutation-tester M8 (reversed iteration) survived: it changes the count and the detail, not the predicate. | none | Case `three-row-conflict-count` added (forward 2 findings, reversed 1). Red state: M8 selftest `pass 46/47`, killed by that case. Green state: v22 selftest 47/47. |

## Frontier and limits

- C1's axis is contested. The Critic's verdict is "refuse: axis mis-assigned": refusing contradictory dispositions moves the
  meter's discernment (calibration), not adjacency content. This lesson's reading: a contested sibling overlap hidden behind a
  later row is an adjacency-reporting failure. The operator rules (L0 question appended).
- A conflict re-keyed to a trailing `:0` line suffix, or a lane cell with trailing padding, is still refused, under a different
  finding id (`line-row-unscreened-file`, `orphan-line-row`). The conflict id is not the only refusal; C1's kill counts
  `delta-disposition-conflict` only (reviewer attacks K1, K2).
- Two conflicts on one key are both refused in order; order-insensitivity was verified by the reviewer (O1).
- The C2 gate cannot tell an executed receipt from an invented one (QUALITY 116). The honest fixture's matrix names its
  receipt by an absolute, machine-specific path.
- Surviving mutants, reported not fixed: M5 of the C2 matrix binding (a relative path resolved only against the matrix
  directory is falsely rejected; no fixture holds a relative path), M4 (upper-case sha accepted by the inherited format check
  is a v1 behaviour the gate does not change), M7 (detail-text variant). The M8 survivor was killed (see Mistakes).
- `hostSelftest` in the v21 meter writes to a hardcoded `/fast/scratch/hyaku/tabi-r62/` path (inherited; QUALITY 4 applies). Left
  unchanged so the v21 cases stay byte-identical.

## Wave and measured disposition

One v1 wave, `w1`, of 12 seats: scout 1, connector 1, executor 3, scribe 2, reviewer 2, critic 1, mutation-tester 2. Attack seats
(reviewer 2, critic 1, mutation-tester 2) are 5 of 12. The L1 holds the planner seat (the validator forbids `planner`). Dead seats,
results and WAVE-DONE: recorded in the report from `w1-results.json`.
