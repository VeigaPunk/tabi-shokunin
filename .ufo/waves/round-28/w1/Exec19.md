# Exec19 — S106 receipt revision binding: inspection, feasibility, recommended test shapes

Seat: Exec19 / item 19 (advisory — no production edits; read-only lane).
Date: 2026-10-25. Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (= HEAD, verified by
`git rev-parse --verify` of both).

Frozen claims read at `.ufo/waves/round-28/claims.json` (report trailer: `.ufo/waves/round-28/w1/Exec19.md`).
C1 frozen text: "receipt must bind the measurement revision and the gate must verify the committed receipt
at that revision" and target "red controls for revision mismatch and correct revision"; kill rule "If adding
revision binding causes the matching committed receipt to fail or the mismatch fixture to pass, claim misses"
(claims.json:11).

## 1. Observations (evidence)

- **Receipt has no revision identity.** `corpus/evidence/round-26/sources/s106.json` (full read, 25 lines)
  top-level keys: `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path,
  decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status`. No key names any lane git
  revision; `url` carries the remote Chromium tag `refs/tags/154.0.8037.97`, which is not a lane commit.
  Negative sweep: `grep '"rev"' corpus/evidence` finds `rev` fields in other receipts (e.g.
  `round-24/c1-baseline.json:3`, `round-24/c2-baseline.json:3`, `round-16/measure/c1-liar-probes.json:8`)
  but none in the s106 receipt — the convention exists in this corpus; s106.json does not use it.
- **Gate consumes no revision metadata.** `scripts/check-s106-evidence.mjs`:
  - `parseReceipt` (lines 87–105) requires only `schema, url, decoded_sha256, bytes_path, decoded_bytes,
    anchor`; no revision key, no revision validation.
  - `evaluate` (lines 107–144) reads the receipt blob at the *evaluated* rev, reads the bytes blob at that
    same rev, and sets `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch`. The resolved
    `rev` appears only in the output object — it is never compared against anything in the receipt.
  - Result: the same receipt validates identically at every descendant commit; the gate cannot detect a
    divergence between the revision a claim names and the revision the evidence was measured at.
- **Runtime gate at baseline is valid today.** `node scripts/check-s106-evidence.mjs --rev
  eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → `valid: true`, `sha_match: true`,
  `anchor_located: true`, `anchor_unique: true`, `byte_count_match: true`. Same command at
  `0c666adc217685e1ece2af8596b732b303a3b15c` (round-26 landing that introduced the receipt, verified
  ancestor of baseline via `git merge-base --is-ancestor`) → also `valid: true`; `git diff --stat baseline
  0c666adc -- s106.json` reports no change (receipt blob identical at both commits).
- **Selftest: 5 cases, all pass** — `node scripts/check-s106-evidence.mjs --selftest --json` →
  `cases: 5, passed: 5`: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid,
  missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate. C1 target is ≥7.

## 2. Feasibility of exact revision binding

- **Strict equality (evaluated rev == receipt.rev) is infeasible for a self-contained receipt**
  [INFERENCE, reasoning]: a receipt blob cannot contain the hash of the commit that contains it (git
  content-addressing is a fixed point — the hash depends on the content including the hash). Any follow-up
  amend that fills `rev` produces a new commit whose hash differs from the recorded `rev`, so a green
  equality evaluation at the final commit is unachievable. Do not adopt equality semantics.
- **Workable lineage binding (recommended):** add a required `rev` field naming a *known measurement
  commit* M (for round 28: the frozen baseline `eb23c0b…`, which exists and is an ancestor of the round
  head — or the round-26 landing `0c666adc…`, also an ancestor with byte-identical receipt). The gate then
  verifies:
  1. `M` resolves to a commit (else → could-not-evaluate, exit 2);
  2. `M` is an ancestor of (or equal to) the evaluated rev R (else → invalid, exit 1, reason
     `revision_mismatch`);
  3. (strengthening) bytes blob at R is byte-identical to bytes blob at M (evidence unchanged since
     measurement) — factually satisfied today (diff empty).
  This keeps the runtime target valid at HEAD (baseline is ancestor), rejects real mismatch fixtures, and
  is implementable without self-reference. It satisfies C1's "mismatch rejected / matching revision
  accepted" controls and the kill rule.

## 3. Recommended test shapes (5 → 8 cases)

Keep all 5 existing cases, but the new required `rev` key forces a fixture restructure: seed an empty
parent commit P *before* writing receipt+bytes, and set `rev = P` in `fixtureReceipt`/`makeFixture`
(otherwise every existing case would hit a schema refusal → CNE). Add:

| # | id | build | expected |
|---|---|---|---|
| 6 | `revision-bound-correct-valid` (green) | parent P (empty commit); receipt `rev=P` + bytes at child C | exit 0, `valid=true`, `revision_bound=true` |
| 7 | `revision-mismatch-invalid` (red) | receipt `rev` = hash of an orphan (non-ancestor) commit O; bytes at main C | exit 1, `valid=false`, `revision_bound=false` |
| 8 | `revision-unresolvable-could-not-evaluate` (red) | receipt `rev` = `0000…0` (40 hex, absent) | exit 2 CNE |

Implementation notes: `parseReceipt` gains a required `rev` string check (missing → Refusal → CNE);
`evaluate` resolves `receipt.rev` (unresolvable → Refusal), computes ancestry via `git merge-base
--is-ancestor M R`, and emits `receipt_rev` / `revision_bound` in the JSON plus the verdict line. Add the
key additively to the `tabi-s106-evidence-v1` receipt (or bump schema deliberately); update the committed
receipt `s106.json` with `"rev": "eb23c0b84668afc48ebab8bd7e4a8a4457407cc4"` (or the round-26 landing
hash). Missing-source fetch-failure CNE must remain untouched (C1 "Preserve fetch-failure as
could-not-evaluate").

## 4. Risks / notes

- If the implementer instead records `rev` = the round-28 final commit hash, the gate would fail the
  ancestry-or-equality check at that commit (receipt cannot self-reference) — use baseline/landing commit.
- Any schema-tightening that rejects the *current* committed receipt would break "runtime gate at its
  committed target receipt remains valid"; ensure the committed receipt is updated in the same change as
  the script.
- No tools installed (no installs); no tracked files modified; no scratch artifacts left.

## 5. Final answer (≤6 lines)

1. s106 receipt has no lane-revision identity (14 top-level keys, none a rev); gate evaluates only
   sha/anchor/bytes at the passed rev, so the same receipt validates at every descendant commit.
2. Strict evaluated-rev == receipt.rev equality is infeasible (a receipt cannot contain its own commit's
   hash); recommend lineage binding: required `rev` = measurement commit (baseline eb23c0b…), gate
   requires ancestor-or-equal, else exit 1 `revision_mismatch`; unresolvable → CNE.
3. Selftest today is 5/5 (measured); target ≥7 is achieved by adding green `revision-bound-correct-valid`
   and red `revision-mismatch-invalid` + `revision-unresolvable-cne` cases, after re-seeding fixtures with
   a parent commit so existing cases keep passing.
4. Runtime gate at baseline currently `valid=true` (measured); keep it green by updating the committed
   receipt with `rev` = baseline or round-26 landing 0c666adc (both ancestors; receipt blob identical).
5. Missing-source fetch-failure CNE must be preserved; additive key avoids a schema break.
6. Full report: `.ufo/waves/round-28/w1/Exec19.md`.
