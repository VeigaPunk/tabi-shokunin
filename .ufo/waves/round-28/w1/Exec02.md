# Exec02 — C1 frozen predicate and S106 receipt revision-binding audit

**Scope:** read-only audit of the frozen C1 and current gate/receipt behavior at the round-28 baseline. No lane tracked files, production code, or frozen claims were changed. Scratch helper: `.ufo/waves/round-28/scratch/exec02/probe-supersession.mjs`.

## Frozen predicate

`claims.json` is frozen before data (`frozenBeforeData: true`), baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. Its C1 declares a routed S106 evidence-gate correction: receipt must bind measurement revision; the gate verifies the committed receipt at that revision; preserve fetch-failure CNE; add at least two selftest cases including a rejected revision mismatch and correct-revision acceptance; runtime gate must remain valid at the committed target receipt. Exact source: `.ufo/waves/round-28/claims.json:11`.

## Current receipt source and evaluation

At the baseline, `scripts/check-s106-evidence.mjs` resolves the requested commit, reads `corpus/evidence/round-26/sources/s106.json` via `git show <rev>:<receipt-path>`, parses its schema and evidence fields, then reads the receipt's `bytes_path` at that same `<rev>` (`:68-79, :87-127`). The receipt currently contains source identity and decoded-content metadata (including URL, `bytes_path`, decoded byte count/hash, anchor and status); it has no measurement-revision field. The frozen target identifies revision as part of receipt validity; current evaluator returns the resolved `rev` in output but does not compare it to a revision stored in the receipt. Thus the requested commit controls which receipt and bytes are read, but the receipt does not assert which commit it was measured for.

The production receipt is read-only evidence and its status text says it is evidence-of-record rather than a claim receipt. Do not interpret its source `fetched_at` or upstream Chromium tag as the Git measurement revision: those are different identities.

## Smallest implementation shape (advisory only; this seat is report-only)

1. Add a required, exact 40-hex `measurement_revision` (or an equivalently unambiguous field) to the parsed receipt schema.
2. After `resolveRev`, compare the receipt's declared measurement revision to the resolved full commit ID. A well-formed mismatch should be an invalid evaluation (exit 1), not CNE: receipt/bytes are available, but the evidence fails the predicate. A missing/malformed receipt revision follows the existing malformed-receipt refusal path and remains CNE (exit 2).
3. Include a stable output boolean such as `revision_match` and include it in `valid`; keep `rev` as the resolved measured commit. The target receipt must bind exactly the commit at which its bytes were verified. Since the committed target is not yet supplied in this baseline audit, its final revision value cannot be asserted here.
4. Expand the isolated git-fixture selftest by at least two distinct cases: (a) otherwise-correct receipt bound to another valid commit → invalid/exit 1; (b) otherwise-correct receipt bound to the exact resolved commit → valid/exit 0. Fixture setup must permit a receipt to name the resulting commit without a self-referential commit hash: build the initial receipt+bytes commit, then amend/commit the exact-revision receipt and test that final commit; for mismatch, make a later commit while retaining the prior commit in the receipt. Alternatively define the binding to a distinct immutable measurement revision whose intended relation is explicitly stated, but do not quietly compare against a moving symbolic ref.
5. Retain existing missing receipt and missing decoded-source cases as exit-2 CNE controls; no network fetch is needed or authorized.

Failure modes to cover/avoid: comparing an unresolved symbolic ref instead of the resolved 40-hex commit; treating mismatch as missing-source CNE; accidentally preserving the self-referential receipt hash from an earlier fixture commit; validating receipt revision but reading bytes from a different revision; accepting missing/weakly typed revision fields; and updating the target receipt to the wrong commit. The production gate already reads both receipt and source bytes from the same resolved Git revision, which is a useful invariant to retain.

## Observed evidence (baseline)

Commands run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (observation; matches frozen baseline).
- `node scripts/check-s106-evidence.mjs --selftest --json` → `cases=5`, `passed=5`, `ok=true`; existing cases include valid, hash mismatch, anchor off-by-one, missing bytes CNE, and missing receipt CNE. No revision-match/mismatch cases exist in the displayed case list (`:175-213`).
- `node scripts/check-s106-evidence.mjs --rev HEAD --json` → resolved `rev` is the baseline commit and `valid=true`, with hash, anchor, uniqueness and byte-count checks true. This demonstrates current committed-target validity, not revision binding.
- `cat corpus/evidence/round-26/sources/s106.json` → receipt JSON does not contain a measurement revision. The script parser currently requires URL, decoded hash, bytes path, decoded bytes and anchor, but not measurement revision (`check-s106-evidence.mjs:87-104`).
- `node scripts/check-selfassessment.mjs --rev HEAD --json` → finding for `LOG.md:221` is claimed 8, observed 12, `superseded=true`; exact finding also appears in round-27 spot-check `corpus/lessons/round-27-verifier-spotcheck.md:15`. The round-28 frozen C2 explicitly identifies this false-clear and requires an exact-citation correction and negative/positive tests (`claims.json:12`).
- `node scripts/check-selfassessment.mjs --selftest --json` → 17/17 pass at baseline. These are inherited tests, not proof that C1 is fixed.

## C2 citation association diagnosis (supporting observation)

The current LOG matcher at `scripts/check-selfassessment.mjs:319-327` scans an entire later paragraph for the script, any `supersed|correct` marker, any `:\d+` token, and the observed tally number. It does not associate that citation with the particular finding. The scratch probe reproduced the matcher and showed for stale `LOG.md:221` that qualifying later paragraphs at lines 265–447 and 1904–1925 have correction markers, freshness script mentions and a 12 tally, but neither cites `:221`. The latter paragraph contains citations for unrelated lines (including `:335`, `:391`, `:1090`, `:1103`, `:1863`) and thereby supplies the unrelated citation that permits the false-clear. Exact `:LINE` association needs to be evaluated per stale finding, rather than satisfied by any citation anywhere in the paragraph. Existing `m1-log-wrong-number-correction` is a negative-number control, not an unrelated-citation control; the frozen C2 requests an unrelated-citation negative and exact-citation positive control.

This diagnosis is scoped to the report; no production changes were made.

## Evidence classification, limitations, and blockers

- **Observation:** baseline resolves to frozen commit; the commands and outputs above were run against that checkout.
- **Observation:** current receipt lacks a measurement-revision field; current gate does not perform a receipt-revision comparison.
- **Observation:** current five-case S106 selftest passes and the baseline runtime target is valid under its present predicate.
- **Observation:** LOG line 221 is falsely superseded under the current matcher and the later qualifying paragraph lacks that exact line citation.
- **Inference:** a strict equality check between a receipt's full commit ID and `resolveRev` output, included in `valid`, is the smallest way to enact frozen revision binding while preserving same-revision blob reads.
- **Unknown:** which resulting committed target revision should be recorded in the receipt; this cannot be determined from the baseline alone and must be supplied by the implementation/commit sequence.
- **Blocker:** no implementation requested/authorized for this audit seat; contract forbids lane tracked-file edits. Main implementation lane owns the code and receipt update.
- **Tool installs/updates:** none.
- **Verification:** no builds, linters, formatters, or test suites were run. The listed gate/selftest invocations are direct measurement evidence, not post-edit verification.

## Source pointers

- Frozen claim: `.ufo/waves/round-28/claims.json:11-12`.
- Gate receipt parsing/evaluation: `scripts/check-s106-evidence.mjs:68-79, 87-144`.
- S106 selftest cases/fixture: `scripts/check-s106-evidence.mjs:148-213`.
- S106 receipt: `corpus/evidence/round-26/sources/s106.json`.
- C2 LOG matcher: `scripts/check-selfassessment.mjs:309-327`.
- Independent prior defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md:15-17, 46-47`.
