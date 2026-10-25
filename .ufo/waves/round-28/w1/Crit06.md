# Crit06 — C1 falsification report (round 28 wave 1)

## Assignment
Falsify C1 (`s106_gate_revision_binding_cases`) with an exact receipt-revision mismatch
fixture and a matching control; report commands. Frozen claims:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json:11`
(C1), `:12` (C2). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## Verdict
**C1's declared defect is real and reproducible; the claim survives falsification —
with three implementation constraints that must be honored or the kill rule fires.**
The mismatch fixture passes today (binding absent), the matching control passes, and the
real lane accepts one revision-less receipt at two distinct revisions.

## Method (all read-only git; fixtures in mktemp repos under
`.ufo/waves/round-28/scratch/crit06/`; no lane tracked change)

1. Baseline gate self-test — `node scripts/check-s106-evidence.mjs --selftest --json`
   → `cases=5, passed=5, ok=true` (matches C1 `before` "5 cases").
2. Baseline runtime gate at its own HEAD — `node scripts/check-s106-evidence.mjs --rev
   eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → `valid=true`, exit 0.
3. Committed receipt field sweep — `node -e` key listing of
   `corpus/evidence/round-26/sources/s106.json`: keys are
   `anchor, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, encoded_bytes,
   encoded_sha256, fetched_at, row, schema, status, transfer, url, verification`.
   **No `revision` or `revision_sha` key** (observation; full key set listed — sweep).
4. Mismatch fixture (falsification): mktemp git repo; receipt cloned from the real one
   plus `"revision": "0000000000000000000000000000000000000000"`; committed decoded bytes
   = byte-identical to the real committed blob (`sha256 9b93fe64…`). Evaluated at its own
   HEAD `9838d897e687…`:
   `node scripts/check-s106-evidence.mjs --repo <root> --rev <HEAD> --json`
   → **exit 0, `valid=true`** — a receipt self-declaring a revision that is not the
   evaluated revision is accepted. (Observation.)
5. Matching control: same fixture, receipt `revision` = evaluated HEAD `2f93f6404bcc…`
   → exit 0, `valid=true`. (Observation.)
6. Real-lane cross-revision: `git cat-file -e ef8aa4a…:corpus/evidence/round-26/sources/
   s106.json` and `…content-features-154.0.8037.97.cc` both exist at parent
   `ef8aa4a3256cc6462a60d850d7ea21277aecd2a1`; `git diff --quiet` shows both blobs
   identical to baseline. Gate at parent:
   `node scripts/check-s106-evidence.mjs --rev ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 --json`
   → **exit 0, `valid=true`**. One receipt, no named revision, valid at two distinct
   commits. (Observation.)

## Impacted axes
`depth` (C1's axis) — the omission is exactly as claimed: receipt binds no revision, gate
verifies bytes at whatever `--rev` is supplied. Mismatch red control is constructible and
today is green; matching control stays green. No other axis touched (C2 untouched).

## Smallest safe correction / constraints
- Require `revision` in `parseReceipt` (schema `tabi-s106-evidence-v1`) and add
  `revision_match: rev === receipt.revision` to the `valid` conjunction; mismatch →
  invalid (exit 1), match → valid (exit 0). Add the two selftest cases (5 → 7, as C1
  claims). Keep missing-bytes/missing-receipt CNE cases unchanged.
- **Constraint 1 (kill-rule hazard):** the committed target receipt has no `revision`
  field. A strict required field makes the runtime gate on the committed receipt return
  Refusal → exit 2 CNE — the matching committed receipt would fail, triggering C1's own
  kill rule ("matching committed receipt fails ⇒ claim misses"). The claim must therefore
  also update `corpus/evidence/round-26/sources/s106.json` to declare its revision
  (baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`) — an additive tracked-data change,
  not a code-only repair. This is the one genuine gap in the declared "after".
- **Constraint 2:** define the revision semantics. "Measurement revision" is currently
  ambiguous between the tabi commit that last wrote the bytes blob and any evaluation-time
  `--rev`. If binding is strict per-revision, identical evidence re-evaluated at a later
  commit becomes invalid (over-strictness / false negative). Recommend binding to the
  commit that recorded the receipt (blob-content equality suffices elsewhere) or
  documenting that only the named revision is evaluable.
- **Constraint 3:** compare resolved full hashes (`resolveRev` output), not raw `--rev`
  strings; note evaluate already returns resolved `rev`.
- Network/authority note: receipt `url` pins Chromium tag 154.0.8037.97; the revision
  binding is a repo-commit binding, not a source-identity change — no duplicate authority
  introduced if Constraint 2 is honored.

## Evidence log
- `claims.json:11` C1 declared: "receipt must bind the measurement revision and the gate
  must verify the committed receipt at that revision… red controls for revision mismatch
  and correct revision" — matches observations 4-6.
- `corpus/lessons/round-27-verifier-spotcheck.md:16,47` — "measurement-revision binding…
  absent" (prior defect evidence, consistent).
- Commands above are literal and were executed; exits recorded. All results are
  observations; no inference beyond the stated constraints.
