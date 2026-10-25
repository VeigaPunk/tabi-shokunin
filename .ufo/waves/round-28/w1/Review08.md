# Review08 — C1 baseline claim-fit review

Scope: C1 only, at frozen baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. Frozen claims source: `.ufo/waves/round-28/claims.json` (C1 at line 11). No lane-tracked files were changed. `git status --porcelain` showed only `?? .ufo/waves/round-28/`.

## Findings

### High — revision-binding semantics and target receipt state are not fully pinned

**Observation:** C1 requires the receipt to bind a measurement revision and the gate to verify it, but the committed `corpus/evidence/round-26/sources/s106.json` has no revision field (`git show HEAD:corpus/evidence/round-26/sources/s106.json`; sweep `grep -ic revision` returned 0). `parseReceipt()` requires only `url`, `decoded_sha256`, and `bytes_path` strings, `decoded_bytes`, and anchor fields; `evaluate()` reads receipt and bytes at the supplied revision and checks digest/anchor/byte count, but performs no revision-identity check (`scripts/check-s106-evidence.mjs:90-140`). The complete-script sweep `grep -in 'revision\|binding\|measure' scripts/check-s106-evidence.mjs` found only revision argument resolution and prose, no receipt binding. Round-26's frozen claim explicitly required that “the receipt's recorded revision must equal the report's cited measurement revision” (`.ufo/waves/round-26/claims.json:49`, via `git show HEAD:...`); the committed receipt does not meet that predicate.

**Inference / unprovable as currently specified:** If “matching revision” means receipt revision equals the commit containing that receipt, the positive fixture is self-referential: an ordinary Git commit ID depends on its tree, including the receipt content, so the receipt cannot straightforwardly contain its own final commit ID. The C1 text does not define whether the gate instead verifies bytes/receipt against a separately named measurement revision (e.g. an ancestor). It also names only `scripts/check-s106-evidence.mjs` as the repair target, while the real committed target receipt must acquire a revision identity for “target receipt valid at its named revision” to be non-vacuous. The claim is therefore only fully demonstrable if the wave defines a non-self-referential binding rule and updates the committed target receipt accordingly. A tolerant optional-field implementation could pass matching/mismatching fixtures while leaving the real receipt unbound; the frozen controls do not explicitly forbid that case.

### Medium — mismatch rejection class is ambiguous

C1 says mismatch must be “rejected”/“fail” but does not choose exit 1 (invalid) versus exit 2 (could-not-evaluate). The script documents exit 2 for malformed receipt/unavailable evidence and exit 1 for present but disagreeing bytes (`scripts/check-s106-evidence.mjs:3-7`). A well-formed but wrong revision is a definite mismatch, whereas a missing revision field may be malformed; the frozen claim's “exact verdicts” requirement needs the wave to pin this mapping. This ambiguity does not invalidate the baseline claim, but leaves the red control's expected verdict underspecified.

### Low — fetch-failure wording has no gate fetch path

The script states at line 15 that it “never fetches”; the full `fetch|http` sweep found only that comment and fixture URL/date fields. `evaluate()` uses committed `git show` blobs only. Thus fetch-failure is a build-time condition, not a baseline gate path. Round-26 claim C2 distinguishes build-time non-200/undecodable fetch failures (claim blocked) from the read-only committed-blob counter (`.ufo/waves/round-26/claims.json:49`). In this gate, the testable preservation analogue is absent receipt/bytes remaining CNE; both are already covered by selftest and return exit 2. Do not treat adding network fetch as implied scope.

## Baseline gates and counter (observations)

- Frozen C1 and `node scripts/check-s106-evidence.mjs --selftest`: `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0. This confirms the frozen “before” and do-nothing control (5 < 7).
- `node scripts/check-s106-evidence.mjs --rev HEAD --json`: `rev=eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, `valid=true`, exit 0; `sha_match`, `anchor_located`, `anchor_unique`, and `byte_count_match` are all true. This confirms the baseline target receipt is valid before revision binding.
- Existing selftest cases are clean fixture, SHA mismatch, anchor off-by-one, missing bytes CNE, and missing receipt CNE. `runSelftest()` returns a `cases` count and checks expected exit/valid/field values (`scripts/check-s106-evidence.mjs:184-246, 268-286`); the stated counter is mechanically countable. The fixture harness can add committed revision scenarios, but no candidate implementation was run in this read-only review.
- The prior defect evidence corroborates the target: `corpus/lessons/round-27-verifier-spotcheck.md:16-17,46-47` records the inherited binding omission and directs revision identity in receipt/evaluation with a test against the measured commit.

## Residual risk and verification gaps

C1 is a strong fit for the demonstrated baseline defect, and its count/runtime gates are observable. Remaining proof depends on specifying the revision relation (recorded measurement revision vs containing commit), requiring the real target receipt to carry it, and selecting the mismatch verdict class. I did not execute a candidate repair; all results above are baseline observations. C2 is outside this review scope.