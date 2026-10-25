# Exec13 — S106 receipt revision binding: inspection, feasibility, recommended test shapes

Seat `Exec13` (leaf, item 13), round 28 w1. Read-only wrt lane tracked files: no lane/git writes; only this report and scratch under `.ufo/waves/round-28/scratch/Exec13/`. All paths absolute; evidence commands inline.

## 1. Frozen claim being scoped (C1, depth)

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json:11` — C1 declared:
"receipt must bind the measurement revision and the gate must verify the committed receipt at that revision. Preserve fetch-failure as could-not-evaluate. Target: gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid."
Kill rule (same line): "If adding revision binding causes the matching committed receipt to fail or the mismatch fixture to pass, claim misses".
Motivating defect: `corpus/lessons/round-27-verifier-spotcheck.md:16` records the round-27 verdict: "Frozen inherited measurement-revision binding and fetch-failure requirements are absent from the round-27 claim/receipt".

## 2. Inspection of current receipt and gate

**Receipt `corpus/evidence/round-26/sources/s106.json` (read; schema `tabi-s106-evidence-v1`):** field inventory = `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor{line,text,comment_line,comment,occurrences_in_file}, verification{command,exit,result}, status`. **No revision identity field exists** (no `rev`/`revision`/`measuredRevision`; observation via field inventory). The only revision in the evaluation is the CLI-supplied `--rev`.

**Gate `scripts/check-s106-evidence.mjs` (read, 337 lines):**
- `evaluate(repo, revArg)` (lines 107-144): resolves `revArg`, reads the receipt blob AT that CLI rev, parses it, reads the bytes blob at the same CLI rev, then computes `sha_match/anchor_located/anchor_unique/byte_count_match` → `valid`. Nothing in the receipt or result names the measurement revision; nothing checks that the evaluated revision is the receipt's own. Only an evaluation at the rev the caller passes.
- `parseReceipt` (87-105) requires `schema, url, decoded_sha256, bytes_path, decoded_bytes, anchor.line, anchor.text` — no revision field.
- Selftest baseline: `node scripts/check-s106-evidence.mjs --selftest --json` → `cases=5, passed=5, ok=true` (observed; matches frozen `before: "5 cases at baseline"`). Case ids: `clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate`. No revision involvement anywhere.
- `resolveRev` (74-79) resolves refs/full hashes and throws `Refusal` ("revision does not resolve") on unresolvable → exit 2 CNE. This is the existing resolution machinery a binding check can reuse.

**Revision identity for the committed evidence:** both the receipt and the decoded bytes were first committed together in one commit:
`git log --format='%H %s' --diff-filter=A -- corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` and same for `s106.json` → both `0c666adc217685e1ece2af8596b732b303a3b15c` ("round-26: frozen claims … routed S106 decoded evidence …"). Gate is valid at both that commit and HEAD:
`node scripts/check-s106-evidence.mjs --rev 0c666adc217685e1ece2af8596b732b303a3b15c --json` → `valid=true`; `--rev HEAD` → `valid=true` (observed). So `0c666ad…` is the natural value for the production receipt's new `revision` field (the commit whose committed bytes the receipt describes; binding is non-self-referential because it predates the receipt update).

## 3. Feasibility — exact revision binding works (prototype demonstrated)

Prototype: `…/.ufo/waves/round-28/scratch/Exec13/check-s106-evidence-binding.mjs` (copy of the production gate; no lane edit). Patch = 3 moves:
1. `RECEIPT_SCHEMA` → `tabi-s106-evidence-v2`; `parseReceipt` requires `revision` to match `/^[0-9a-f]{40}$/` (exact, full-hash).
2. `evaluate` after parse: `const bound = resolveRev(repo, receipt.revision);` then reads **bytes at `bound`** and verifies sha/anchor/count against the receipt; result gains `measured_revision: bound` (CLI `rev` still reported).
3. Fixture receipts carry the 40-hex `revision`.

Run: `node …/check-s106-evidence-binding.mjs --selftest --json` → **7/7 pass** (observed).
- `clean-fixture-valid` → exit 0, `valid=true` (green, correct revision).
- `sha-mismatch-invalid` → exit 1, `valid=false`, `sha_match=false` (red; receipt names a revision whose committed bytes disagree).
- `anchor-off-by-one-invalid` → exit 1 (red).
- `missing-bytes-could-not-evaluate` → exit 2 (CNE preserved).
- `missing-receipt-could-not-evaluate` → exit 2 (CNE preserved).
- `revision-unresolvable-could-not-evaluate` → exit 2, "revision does not resolve" (red CNE).
- `evaluate-at-later-commit-still-valid` → exit 0, `valid=true` (green; evaluation at a later commit still verifies the named revision — this is the self-anchoring semantics).

Production-migration proof (temp fixture repo, real bytes extracted via `git show 0c666ad…:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`):
- Patched gate on the **real lane at HEAD** → `exit=2`, "receipt missing 40-hex revision" (fail-closed: v1 receipt without identity cannot be verified).
- Patched gate on a migrated receipt (`schema=v2`, `revision=<bytes-commit>`, real bytes) at a later receipt commit → `valid=true`, `measured_revision=<bytes-commit>`, `sha_match=true`, `anchor_located=true`, `byte_count_match=true` (observed).
Feasibility conclusion: exact revision binding is implementable with the existing `resolveRev`/`readBlob` machinery, zero new dependencies, and no change to the verdict grammar (0/1/2).

## 4. Recommended design (for the implementing seat)

1. **Receipt schema → `tabi-s106-evidence-v2`** with new required `revision` (40-hex full commit hash = the commit whose committed bytes the receipt describes). Update the committed `corpus/evidence/round-26/sources/s106.json` in the same change as the gate (atomic; v1 receipts then read as CNE exit 2 — fail-closed, acceptable).
2. **`evaluate` binding:** after `parseReceipt`, `const bound = resolveRev(repo, receipt.revision);` and evaluate bytes at `bound` (as prototyped). Keep `rev` (CLI) and add `measured_revision: bound` to the result. This satisfies "receipt binds the measurement revision; the gate verifies the committed receipt at that revision" — the receipt claims a revision, and the gate verifies the committed bytes at exactly that revision.
3. **Preserve CNE classes:** missing receipt, missing bytes at the named revision, unresolvable revision → Refusal → exit 2 (matches the header's declared "unreadable revision … could-not-evaluate" class). Fetch-failure path stays untouched.
4. **Production target receipt:** `revision` = `0c666adc217685e1ece2af8596b732b303a3b15c`. Gate at tip/HEAD after migration stays `valid=true` (binding is to the lineage commit, not to a self-referential hash — no chicken-and-egg). Round report runs `--rev` at a commit containing the receipt and records `measured_revision`.
5. Minor: bump the result/self-test schema constants alongside (prototype kept `SCHEMA=…-v1` on output; cosmetic but should move to v2).

## 5. Recommended selftest shapes (target ≥7; this set is exactly 7)

Keep all five existing cases, updated so every receipt names its bytes commit (two-commit fixtures: bytes commit → receipt commit), and add:

| # | id | exit | valid | purpose |
|---|---|---|---|---|
| 1 | `clean-fixture-valid` | 0 | true | green; receipt names its own bytes commit, evaluated at the receipt commit |
| 2 | `sha-mismatch-invalid` | 1 | false | red; revision mismatch — receipt names a commit whose bytes disagree (sha) |
| 3 | `anchor-off-by-one-invalid` | 1 | false | red; anchor line wrong |
| 4 | `missing-bytes-could-not-evaluate` | 2 | null | red CNE; bytes absent at the named revision |
| 5 | `missing-receipt-could-not-evaluate` | 2 | null | red CNE; receipt absent at evaluated revision |
| 6 | `revision-unresolvable-could-not-evaluate` | 2 | null | red CNE; `revision="0000…0"` does not resolve |
| 7 | `evaluate-at-later-commit-still-valid` | 0 | true | green; later commit + unchanged receipt still verifies the named revision (self-anchoring proof) |

Optional extra red (recommends, not required): `revision-names-revision-without-receipt` — receipt names an empty root commit (bytes+receipt absent there) → exit 2; and a multi-commit negative where the receipt at the evaluated commit differs from the receipt at the named revision (drift guard) if the L1 wants the `receipt-at-bound` existence/equality check included (the prototype deliberately omitted it so the production migration stays valid). If the L1 prefers strict CLI-rev ≡ named-revision equality instead of self-anchoring, note that the production receipt (updated at a later commit) could then never validate — self-anchoring is the only shape that keeps the migrated target receipt valid.

## 6. Risks / notes

- The v1→v2 migration must land atomically with the gate (receipt + schema + parse). Until then the patched gate reports CNE on the real receipt (observed above) — expected, not a defect.
- Exact 40-hex requirement means fixture receipts must be built after their bytes commit exists (two-commit shapes); the prototype proves this works in the existing `makeFixture` harness without changes to the runner.
- No new tooling installed; no pacman; RULES.md read (`/home/vgpnk/.omp/agent/RULES.md`). No real-site interaction; git used read-only.

## 7. Evidence index (commands)

| number | command | result |
|---|---|---|
| selftest baseline 5 | `node scripts/check-s106-evidence.mjs --selftest --json` | `cases=5 passed=5 ok=true` |
| receipt/bytes origin commit | `git log --format='%H %s' --diff-filter=A -- corpus/evidence/round-26/sources/{s106.json,content-features-154.0.8037.97.cc}` | both `0c666adc217685e1ece2af8596b732b303a3b15c` |
| runtime valid at origin | `node scripts/check-s106-evidence.mjs --rev 0c666ad… --json` | `valid=true` |
| runtime valid at HEAD | `node scripts/check-s106-evidence.mjs --rev HEAD --json` | `valid=true` |
| prototype selftest | `node .ufo/waves/round-28/scratch/Exec13/check-s106-evidence-binding.mjs --selftest --json` | `cases=7 passed=7 ok=true` |
| patched gate on v1 receipt | `node …/check-s106-evidence-binding.mjs --rev HEAD --json` | exit 2 "receipt missing 40-hex revision" |
| patched gate on migrated receipt | `node …/check-s106-evidence-binding.mjs --repo <tmp> --rev <receipt commit> --json` | `valid=true measured_revision=<bytes commit> sha_match=true` |

All observations above are direct tool outputs; design items are recommendations, not implemented production changes.
