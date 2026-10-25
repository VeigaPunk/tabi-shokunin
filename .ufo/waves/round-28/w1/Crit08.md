# Crit08 — UFO-FSD critic: C1 falsification (round 28, attempt 1)

Role: UFO-FSD critic (Crit08). Attack on the proposed approach, not the task owner.
No production code repaired; read-only git; no tool installs (PACMAN untouched).
Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (HEAD == frozen baseline; `git status --porcelain` shows only untracked `.ufo/waves/round-28/`, my scratch/report area).

## Task
Falsify claim C1 (depth, `s106_gate_revision_binding_cases`) with an exact receipt-revision mismatch fixture and a matching control; report commands. Frozen claims: `.ufo/waves/round-28/claims.json` (frozen `2026-10-25`, `frozenBeforeData:true`).
Prior defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md:47` — "preserve inherited C2 fetch-failure and measurement-revision binding; put revision identity in receipt/evaluation and test it against the measured commit." (20 words)

## Claim target (quote, claims.json line 11)
"Target: gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid." (24 words)

## Method — exact fixtures (commands)
Built two mktemp-style fixture repos under `.ufo/waves/round-28/scratch/Crit08/` with `git -C` (root verified before commit), identical 2615-byte S106-like bytes file (anchor line 187), receipt schema `tabi-s106-evidence-v1` extended with `measured_rev` per the claim's binding design; builder: `.ufo/waves/round-28/scratch/Crit08/fx-build.sh`.

- Matching control `fx-match`: `measured_rev = e4c3465ff4a50e283a6def721b246ac28ab47cf6` (receipt commit). Run: `node scripts/check-s106-evidence.mjs --repo <fx-match> --rev e4c3465ff4a50e283a6def721b246ac28ab47cf6 --json` → **observation** `valid:true`, `EXIT=0`.
- Revision mismatch `fx-mismatch`: receipt `measured_rev = 928a5b5582dc91359d6b0bb5df2a7984cf67210a`; second commit (unrelated `README.md`) moves HEAD to `7d150c8a45b988dc5a8dfc1c9dcba07a38436be7`; bytes byte-identical. Run at that rev: `node scripts/check-s106-evidence.mjs --repo <fx-mismatch> --rev 7d150c8a45b988dc5a8dfc1c9dcba07a38436be7 --json` → **observation** `valid:true`, `EXIT=0`.

## Falsification
The baseline gate reports `valid=true` for BOTH fixtures: the revision-mismatch case — which C1 requires to be a red control — exits 0 with `valid:true`, identical to the matching control (only `rev` field differs in the JSON). The counterexample is isolated: both repos carry the same bytes and the same receipt hash/anchor/byte-count; the sole difference is the evaluated revision vs the receipt's `measured_rev`, which the gate cannot see.

Cause (inference from code): `parseReceipt` (script lines 87–105) validates only `schema,url,decoded_sha256,bytes_path,decoded_bytes,anchor` and returns `doc` unchanged — unknown fields including `measured_rev` pass through; `evaluate` (lines 107–144) never compares any revision identity to the resolved `rev`. Receipt revision binding is absent from schema and evaluation, so the claim's red-control criterion is unsatisfiable by the current gate. Baseline selftest confirms no revision case exists: `node scripts/check-s106-evidence.mjs --selftest --json` → **observation** `cases:5, passed:5` (ids: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate) — matches claim's `before:"5 cases"`.
Runtime gate at committed target receipt (real repo, baseline rev): `node scripts/check-s106-evidence.mjs --rev eb23c0b... --json` → **observation** `valid:true` (sha_match, anchor_located/unique, byte_count_match all true); receipt has no `measured_rev` field (committed `corpus/evidence/round-26/sources/s106.json`).

## Impacted axes
- **depth (C1)**: red revision-mismatch control not enforceable at baseline; gate cannot distinguish match from mismatch. Premise of the fix (binding exists) is valid; premise that it's checkable now is false.
- Adjacent: claim's `after` metric (`s106_gate_revision_binding_cases` ≥7) is currently unreachable: 5 cases, none revision-bound.

## Smallest safe correction (report-only; not applied)
1. Define revision identity as a receipt field (e.g., `measured_rev`) and require it in `parseReceipt`.
2. In `evaluate`, compare `resolveRev(repo, revArg)` to `receipt.measured_rev`; mismatch → `invalid` (exit 1), not CNE.
3. Add two selftest cases: revision-mismatch red (exit 1, `valid:false`) and exact-match green (exit 0), reaching ≥7; keep missing-bytes/missing-receipt CNE (exit 2).
4. Runtime gate at committed target receipt must stay `valid:true` after the receipt gains `measured_rev` equal to the measured commit.
Falsification stands regardless: absent a revision check, the baseline gate returns `valid:true` for a receipt bound to a different revision.

## Final answer (≤6 lines)
C1 falsified: exact mismatch fixture (receipt `measured_rev=928a5b5…`, gate at `7d150c8…`) returns `valid:true` exit 0 — the required red control is green. Matching control likewise `valid:true` exit 0. Baseline selftest 5/5, no revision case; runtime gate at committed receipt valid. Cause: `evaluate`/`parseReceipt` carry no revision identity or check. Report: `.ufo/waves/round-28/w1/Crit08.md`; fixtures: `.ufo/waves/round-28/scratch/Crit08/fx-*`.
