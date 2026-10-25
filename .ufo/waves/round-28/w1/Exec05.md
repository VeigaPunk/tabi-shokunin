# Exec05 — round-28 w1: C1 do-nothing control (baseline)

Seat: Exec05 (leaf, UFO-FSD fleet). Role: record baseline control ONLY; no implementation, no edits to lane tracked files.

## Baseline identity

- Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin
- HEAD at control time: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (git rev-parse HEAD; git log --oneline -1: "round-27 verifier spot-check (integrator, hyaku): non-author admit/reject")
- Working tree: no tracked modifications (`git status --porcelain` → only `?? .ufo/waves/round-28/`, the wave artifact dir). Observation.
- Frozen claims cited: `.ufo/waves/round-28/claims.json` (schema tabi-round-claims-v1, frozenAt 2026-10-25, frozenBeforeData true, baseline eb23c0b…). C1 claim text: "before":"5 cases at baseline eb23c0b84668afc48ebab8bd7e4a8a4457407cc4"; control: "Do-nothing control: unchanged gate selftest is 5, below target. A receipt revision mismatch fixture must fail while matching revision fixture passes." Report path (this file): `.ufo/waves/round-28/w1/Exec05.md` relative to lane root.

## Control 1a — C1 selftest count at baseline

Command (run from lane root, committed bytes at HEAD):

```
node scripts/check-s106-evidence.mjs --selftest
```

Output (verbatim, 2026-10-25):

```
CASE id=clean-fixture-valid expected_exit=0 exit=0 valid=true PASS
CASE id=sha-mismatch-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=anchor-off-by-one-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=missing-bytes-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=decoded bytes absent at 65396a6e548f4109301b836cbefd4ca843943927: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc PASS
CASE id=missing-receipt-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=receipt absent at 1953b7f606ad6b98c5071bc707d5ed64da33db57 PASS
S106_SELFTEST verdict=clean cases=5 passed=5
EXIT=0
```

- Selftest count = **5**, all passing; exit 0. Observation. Matches claim "before" (5 cases at baseline).
- Case inventory: clean valid, sha mismatch, anchor off-by-one, missing bytes CNE, missing receipt CNE. **No revision-binding fixtures exist** (no matching/mismatching revision cases), so the unchanged gate's selftest is below the target of ≥7 and cannot exercise the revision predicate. Observation.

## Control 1b — runtime gate validity at committed target receipt

Command (run from lane root, at baseline revision):

```
node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
```

Output (verbatim):

```json
{
  "schema": "tabi-s106-evidence-v1",
  "rev": "eb23c0b84668afc48ebab8bd7e4a8a4457407cc4",
  "receipt": "corpus/evidence/round-26/sources/s106.json",
  "bytes_path": "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc",
  "present": true,
  "decoded_bytes": 73952,
  "decoded_sha256_claimed": "9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44",
  "decoded_sha256_observed": "9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44",
  "sha_match": true,
  "anchor": { "line": 187, "text": "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);", "occurrences": 1 },
  "anchor_located": true,
  "anchor_unique": true,
  "byte_count_match": true,
  "valid": true
}
```

- Runtime gate verdict at its committed target receipt: **valid=true**, exit 0. Observation. Baseline gate remains valid at the committed receipt (matches "target receipt valid at its named revision" for the current receipt).

## Supporting observation — receipt lacks revision binding

- Committed receipt `corpus/evidence/round-26/sources/s106.json` at baseline (via `git show eb23c0b…:corpus/evidence/round-26/sources/s106.json`) has schema `tabi-s106-evidence-v1` and **no measurement-revision field**; its verification block records fetched_at/status only. Observation. This is the defect class C1 declares (receipt must bind the measurement revision); no baseline behavior contradicts it.

## Do-nothing control verdict (C1)

- Unchanged gate selftest = 5 (below target 7) and lacks any revision-mismatch/revision-match fixture → control confirms the pre-implementation state; claim's "before" is reproduced exactly. Observation.
- Runtime gate at committed target receipt remains valid at baseline. Observation.
- No files changed; only this report written. No tools installed (no pacman/uv/cargo/npm action; PACMAN PAUSED untouched).

## Blocker-free notes

- No blockers. This seat performed only the control; claim implementation, selftest revision fixtures, and post-integration gates are owned by the parent/main agent.
