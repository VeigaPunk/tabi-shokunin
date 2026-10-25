# Exec07 — C1 S106 receipt revision binding: feasibility and test shapes

Seat Exec07 / item 7. Read-only analysis; no code edited, no tools installed, no tracked changes.

## Frozen claim source
- `.ufo/waves/round-28/claims.json` line 11 (C1): "receipt must bind the measurement revision and the gate must verify the committed receipt at that revision. Preserve fetch-failure as could-not-evaluate. Target: gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid."
- `corpus/lessons/round-27-verifier-spotcheck.md:47`: "preserve inherited C2 fetch-failure and measurement-revision binding; put revision identity in receipt/evaluation and test it against the measured commit." Prior defect at `:16` (C2 depth: "measurement-revision binding … absent from the round-27 claim/receipt").

## Observations (commands, results)
1. Receipt `corpus/evidence/round-26/sources/s106.json` (read): schema `tabi-s106-evidence-v1`; fields `row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor{line,text,comment_line,comment,occurrences_in_file}, verification{command,exit,result}, status`. No git-revision field anywhere. (observation)
2. Baseline blob == working tree: `git -C <lane> show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/evidence/round-26/sources/s106.json | sha256sum` = `f13e55ba3bb7c0bcee7d9721c3f844c635f01db6fc5e68b688b8e46d59a47402`; file `sha256sum` identical. (observation)
3. Receipt introduced by commit `0c666adc217685e1ece2af8596b732b303a3b15c` (2026-10-25) per `git log --follow -- corpus/evidence/round-26/sources/s106.json`. (observation)
4. Gate `scripts/check-s106-evidence.mjs:107-144` (`evaluate`): reads receipt AND bytes both at the caller-supplied rev (`readBlob(repo, rev, RECEIPT_PATH)`, `readBlob(repo, rev, receipt.bytes_path)`); `valid = sha_match && anchor_located && anchor_unique && byte_count_match`; no comparison of `rev` against anything in the receipt. `parseReceipt` (:87-105) requires only `url/decoded_sha256/bytes_path/decoded_bytes/anchor`. (observation)
5. Baseline selftest: `node scripts/check-s106-evidence.mjs --selftest --json` → `cases=5 passed=5 ok=true`; ids: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate. (observation)
6. Baseline runtime gate: `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → `present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true valid=true`. (observation)

## Gap analysis
The receipt records *when* fetched and *what* upstream tag (Chromium 154.0.8037.97), but not *which tabi commit* holds the measured evidence; the gate verifies internal consistency at whatever `--rev` it is handed. Any commit whose receipt+bytes blobs agree passes, including a post-hoc re-commit of identical bytes at an unrelated later revision — the round-27 defect class (spotcheck.md:16,47). Inference: the binding is missing at both the data (receipt) and logic (gate) layers.

## Feasibility and design recommendation
Feasible as a small additive change:
- Add required `measured_rev` (40-hex) to the receipt; snake_case matches existing s106.json keys. Semantic precedent: `measuredRevision` in `scripts/check-measurement-binding.mjs` manifest and its closed reason `measured_revision_not_ancestor` (":55: "measuredRevision is not ancestor-or-equal of --at REV").
- `parseReceipt` validates presence + `/^[0-9a-f]{40}$/`, else Refusal → exit 2 (malformed receipt).
- `evaluate()`: resolve `M = receipt.measured_rev`; require M ancestor-or-equal of evaluated rev R (`git merge-base --is-ancestor M R`); on failure verdict invalid, exit 1, new output field `rev_match=false`. Read the bytes at M (the measured revision), not at R, so integrity checks anchor to the declared measurement commit. Unresolvable M → Refusal exit 2 (mirrors `revision_unresolved_measured`).
- Critical constraint: strict equality (R === M) is infeasible for an honest receipt — a commit cannot contain a receipt naming its own hash (hash depends on content → circular). Ancestor-or-equal is the existing in-repo convention and is satisfiable by production and fixtures alike. This is the top correctness point for the implementer.
- Production target receipt: after adding the field, `corpus/evidence/round-26/sources/s106.json` must be updated with `measured_rev` = the commit carrying the corrected receipt+bytes (round-28 tip); then `node scripts/check-s106-evidence.mjs --rev <tip> --json` stays valid (claim's "runtime gate at its committed target receipt remains valid"). Until updated, the legacy receipt refuses (exit 2) — expected, not a regression.

## Recommended test shapes (CASES → 7–8 total, target ≥7)
Retain the existing 5, including both CNEs (missing-bytes, missing-receipt). Add:
1. `revision-match-valid` (GREEN control): fixture commits bytes at M, then commit with `measured_rev=M`, evaluate at descendant HEAD → exit 0, valid=true, rev_match=true. Confirmed by probe: valid.
2. `revision-mismatch-invalid` (RED): receipt `measured_rev` = real sibling commit S (branch rooted at M, not ancestor of R); evaluate at R → exit 1, valid=false, rev_match=false. Confirmed by probe: invalid.
3. `revision-missing-field-could-not-evaluate` (recommended): receipt without `measured_rev` → exit 2 refusal; guards the schema requirement and documents legacy-receipt behavior.
4. Optional `revision-unresolvable-could-not-evaluate`: `measured_rev` = 40-hex that does not resolve → exit 2.
Fixtures reuse existing `d.receipt()/d.bytes()/d.commit()`; builds may call `d.commit()` twice (commit M, then commit receipt). Probe: two-commit fixture under OS temp dir, proposed semantics, output green `{anc:true,valid:true,exit:0}` and red `{anc:false,verdict:"invalid (rev mismatch)",exit:1}` (scratch, not the repo gate).

## Failure modes / risks
- Strict equality implementation → no honest green case exists; selftest would be forced to cheat or fail. (risk)
- Reading bytes at R instead of M → binding is relational-only (ancestry); re-committed identical bytes under a descendant still pass — weaker than "verify at that revision". (risk)
- Not refusing a missing field (default-true) → legacy receipt keeps passing unbound; must refuse, never default valid. (risk)
- Relaxing non-ancestor to any resolvable M → red case goes green; the red case must assert exactly the false branch. (risk)

## Evidence
All numbers above are observations backed by the listed commands; probe results are scratch/inference, labeled as such. No tool installs performed.
