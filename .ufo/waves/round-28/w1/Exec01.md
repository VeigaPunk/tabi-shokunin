# Exec01 — S106 receipt revision binding: feasibility and test shapes (round 28, wave 1)

Seat: Exec01 (leaf). Item (w1-spec.json taskCall): inspect the S106 target receipt and gate
evaluation for exact revision-binding feasibility and recommend test shapes. Read-only seat:
no production edits, no installs (none needed; node/git already present). All paths relative to
lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## 1. Motivating evidence (quotes <=25 words, located)

- `.ufo/waves/round-28/claims.json:11` (C1 declared): "receipt must bind the measurement
  revision and the gate must verify the committed receipt at that revision" (20 words).
- `.ufo/waves/round-28/claims.json:11` (C1 after): "at least 7 cases with revision mismatch
  rejected and matching revision accepted; target receipt valid at its named revision".
- `corpus/lessons/round-27-verifier-spotcheck.md:16`: "Frozen inherited measurement-revision
  binding and fetch-failure requirements are absent from the round-27 claim/receipt".
- `corpus/lessons/round-27-verifier-spotcheck.md:47`: "preserve inherited C2 fetch-failure
  and measurement-revision binding; put revision identity in receipt/evaluation and test it
  against the measured commit."
- `.ufo/waves/round-26/claims.json:49` (frozen C2 kill rule): "the receipt's recorded revision
  must equal the report's cited measurement revision".

## 2. Receipt inspection — observation

Command: `read corpus/evidence/round-26/sources/s106.json` (full file, 25 lines).
Keys present: `schema`, `row`, `url`, `fetched_at`, `transfer`, `encoded_bytes`,
`encoded_sha256`, `bytes_path`, `decoded_bytes`, `decoded_lines`, `decoded_sha256`, `anchor`,
`verification`, `status`.

Negative sweep: `grep -nE 'revision|revisions|measured_at|commit' corpus/evidence/round-26/sources/s106.json`
→ no matches. Conclusion (swept): the receipt carries **no revision identity** — nothing records
at which commit the measurement was made. [observation]

## 3. Gate evaluation inspection — observation

Command: `read scripts/check-s106-evidence.mjs` (full file, 337 lines).

- `evaluate()` (lines 107-144): `resolveRev(revArg)` → read receipt blob at `rev` → read bytes
  blob at `rev` → recompute sha256, check anchor line/text, uniqueness, byte count →
  `valid = sha_match && anchor_located && anchor_unique && byte_count_match`. No comparison
  between any receipt-recorded revision and the evaluated `rev`; output object (lines 128-143)
  has no revision field.
- Negative sweep: `grep -n 'revision' scripts/check-s106-evidence.mjs` matches only the `--rev`
  argument, `resolveRev` of the evaluated ref, and doc comments. There is no revision-mismatch
  verdict class anywhere. [observation]

## 4. Empirical demonstration of the binding gap

Commands (all run from lane root) and observed output:

| # | Command | Observation |
|---|---|---|
| 1 | `node scripts/check-s106-evidence.mjs --selftest --json` | `cases=5`, `passed=5`: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate (exit 2), missing-receipt-could-not-evaluate (exit 2). Matches claim's `before: "5 cases"`. |
| 2 | `node scripts/check-s106-evidence.mjs --rev 0c666adc217685e1ece2af8596b732b303a3b15c --json` | `valid=true` |
| 3 | `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | `valid=true` |
| 4 | `git rev-parse 0c666adc…:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` and same at `eb23c0b…` | both `1ec86eaac948e8c295def4a70273bd7e75e01446` (identical blob) |
| 5 | same for `s106.json` | both `e2cc93298c4df00cbac614b6d8ebebff705ddbfb` (identical blob) |

Inference (grounded): tip `eb23c0b…` != measurement commit `0c666adc…`, yet both evaluate
`valid=true` because the blobs are identical. Today the gate cannot distinguish the measured
revision from any other revision containing the same blobs — this is exactly the omission C1
repairs. Note: tip `eb23c0b…` is the round-27 spotcheck commit; the evidence files were both
introduced in `0c666adc…` (`git log --follow` shows one commit each, dated 2026-10-25,
round-26 wrap-up landing), and are unchanged since (rows 4-5).

## 5. Feasibility of exact revision binding — yes

- The measurement revision exists and is unique: `0c666adc217685e1ece2af8596b732b303a3b15c`
  (first commit carrying receipt + bytes; nothing after).
- Recommended mechanics (for the implementing seat; not applied here):
  1. Receipt: add required `revision`: `0c666adc217685e1ece2af8596b732b303a3b15c`. Keep tag
     `tabi-s106-evidence-v1` (additive field) or bump; recommend additive under v1 for a minimal
     diff — legacy receipts without the field then fail closed (see C8).
  2. `parseReceipt()` (script lines 87-105): require `revision` matching `^[0-9a-f]{40}$`;
     absent/malformed → `Refusal` → could-not-evaluate exit 2, never valid.
  3. `evaluate()` (lines 107-144): after `resolveRev`, resolve `receipt.revision` and compare
     canonical hexes. Mismatch → invalid, exit 1, `revision_match:false` (not CNE: the receipt
     is present and readable; it simply does not certify the requested revision). `valid`
     becomes `sha_match && anchor_located && anchor_unique && byte_count_match && revision_match`;
     output adds `revision` and `revision_match`.
  4. Runtime gate target: after implementation run **at the bound measurement revision** —
     `node scripts/check-s106-evidence.mjs --rev 0c666adc217685e1ece2af8596b732b303a3b15c --json`
     → must remain `valid=true` (claim after: "target receipt valid at its named revision").
     Consequence to record: validating at tip `eb23c0b…` correctly becomes invalid (mismatch)
     once binding exists; the round's counter/report must cite the measurement revision,
     consistent with the frozen round-26 kill rule (quote in section 1). This is a
     reporting-orientation choice for the implementer/L1, not an obstacle.

## 6. Recommended test shapes (target >=7; 7-8 total)

Keep all 5 existing cases verbatim — including both missing-source CNEs (`missing-bytes-...` and
`missing-receipt-...`, exit 2), satisfying "preserve fetch-failure as could-not-evaluate". Add:

| id | polarity | shape | must assert |
|---|---|---|---|
| C6 `revision-mismatch-invalid` | RED (mandatory) | two-commit fixture: receipt records `revision=rev1`, evaluation runs at `rev2` whose bytes blob is byte-identical (same tree, second commit) | exit 1, `valid=false`, `revision_match=false` |
| C7 `revision-match-valid` | GREEN (mandatory) | receipt records `revision=rev1`, evaluate at `rev1` | exit 0, `valid=true`, `revision_match=true` |
| C8 `revision-absent-could-not-evaluate` | RED (recommended) | receipt without `revision` key | exit 2, `valid=null` (fail-closed, never valid) |

Why C6's shape: at `rev2` the sha still matches (identical tree), so only the revision check can
reject — the control proves it tests the binding, not a hash side-effect. Harness impact:
`makeFixture()` (lines 215-250) needs a second commit (invoke `commit()` again on the same tree →
new HEAD, same blobs); `fixtureReceipt()` gains a `revision` default assigned after the first
commit; `runSelftest()` already asserts exit + fields and should also assert `revision_match`
when expected.

Ordering (claims.json:15: "Control results must be recorded before any claim implementation"):
land the selftest controls first and score them (red/green), then update the real receipt's
`revision` and record the runtime gate at `0c666adc…`.

## 7. Risks / notes

- If the round report wants tip-based citation, exact binding conflicts with tip validity; the
  claim text resolves it via "at that revision" / "valid at its named revision". Flag to L1 if
  tip citation is intended. [INFERENCE from claim wording]
- No code changed; no tools installed; no real-site interaction; lane tracked tree clean
  (`git status --porcelain` empty for tracked paths; round-28 wave dir is untracked pre-data).
