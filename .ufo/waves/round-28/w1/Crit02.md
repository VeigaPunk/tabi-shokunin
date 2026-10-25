# Crit02 — C1 falsification: S106 receipt revision binding

Seat: Crit02 (wave tabi-r28-w1, item 34). Role: critic (UFO-FSD). Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (frozen claims, claims.json). Date: 2026-10-25. Contract: read-only vs lane; scratch under `.ufo/waves/round-28/scratch/Crit02/`; report at `.ufo/waves/round-28/w1/Crit02.md`.

## 1. Claims referenced

- C1 (frozen): `.ufo/waves/round-28/claims.json` line 11 (and raw line 11): "receipt must bind the measurement revision and the gate must verify the committed receipt at that revision"; target selftest ≥7 with "red controls for revision mismatch and correct revision"; kill rule: "If adding revision binding causes the matching committed receipt to fail or the mismatch fixture to pass, claim misses. Missing source fetch remains could-not-evaluate."
- Motivating evidence: `corpus/lessons/round-27-verifier-spotcheck.md` lines 16, 47 (round-27 C2 gate: no revision/fetch binding; "put revision identity in receipt/evaluation and test it against the measured commit").

## 2. Baseline observations (commands)

| # | Command (cwd = lane root) | Result |
|---|---|---|
| O1 | `node scripts/check-s106-evidence.mjs --selftest --json; echo SELFTEST_EXIT=$?` | `cases=5 passed=5 ok=true`, exit 0. Do-nothing control = 5 < target 7. |
| O2 | `node scripts/check-s106-evidence.mjs --rev HEAD --json; echo GATE_EXIT=$?` | `rev=eb23c0b… valid=true present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true`, exit 0. Target receipt valid at its committed revision on the real lane. |
| O3 | `git grep -l -E 'measured_at_rev|revision' -- corpus/evidence/round-26/sources/s106.json; echo GREP_EXIT=$?` | No match (exit 1). Receipt contains no revision-identity field (negative claim, sweep = whole file). |
| O4 | `git log --oneline --follow -5 -- corpus/evidence/round-26/sources/s106.json` | Introduced at `0c666ad` (round-26 evidence commit). |
| O5 | `git status --porcelain; git diff --stat` | Only untracked `.ufo/waves/round-28/` (wave/dispatch artifacts + scratch); zero tracked modifications. |

Receipt fields parsed by `evaluate()` (read `scripts/check-s106-evidence.mjs:87-144`): `url`, `decoded_sha256`, `bytes_path`, `decoded_bytes`, `anchor.line`, `anchor.text`. No code path reads any revision-like field (observation, code inspection). `resolveRev()` (`:74-79`) resolves refs/SHAs via `git rev-parse --verify`.

## 3. Falsification fixtures (exact revision mismatch + matching control)

Harness: `.ufo/waves/round-28/scratch/Crit02/falsify-c1.mjs` and `falsify-c1-pair.mjs` (scratch; mktemp repos built with `git -C`, root verified before commit; no lane files touched). Byte content mirrors the production fixture (`FIXTURE_BYTES` shape, anchor line 187).

Probe P1 — mismatch fixture (binding field claims a different revision):
- Fixture: receipt adds `measured_at_rev: "0000000000000000000000000000000000000000"` (≠ evaluated rev `0175c672…`); bytes hash-match the receipt.
- `node scripts/check-s106-evidence.mjs --repo <root> --rev 0175c672… --json` → **exit 0, `valid=true`, `sha_match=true`**. The mismatching receipt PASSES.

Probe P2 — matching control (binding equals evaluated rev):
- Fixture: `measured_at_rev` = evaluated rev → **exit 0, `valid=true`**. Honest receipt accepted (no regression on the green path).

Probe P3 — invariance across revisions (same receipt/bytes at two commits):
- Evaluate the identical tree at rev1 `0175c672…` and rev2 `7b660c75…` (unrelated second commit) → both exit 0, valid. Verdicts indistinguishable; binding field is inert. Confirms the gate cannot tell which revision a receipt measures.

Probe P4 — sharp red control (receipt binds a rev whose committed bytes do NOT match):
- R0: bytes `BYTES_OTHER` committed. R1: receipt (`decoded_sha256` = hash of `BYTES_OK`) + `BYTES_OK` committed, `measured_at_rev=R0`. Evaluated at R1: bound revision's bytes do NOT satisfy the receipt; evaluated-rev bytes do.
- **Gate: exit 0, `valid=true`, `sha_match=true`** → false positive: a receipt bound to a revision whose committed bytes contradict it is certified valid today. This is exactly the red case C1's fix must reject.
- Green mirror (bound rev bytes satisfy receipt): exit 0, valid — acceptance path intact.

## 4. Interpretation

- Observation: C1's premise holds at baseline — no binding exists, mismatch passes, and O1 confirms the 5-case selftest (below target 7) with no revision controls. The red P4 case is a concrete counterexample to the baseline gate's soundness, not to the claim itself.
- Inference (semantics fork, from `evaluate()` mechanics and git object model):
  1. **Circular identity**: a commit hash depends on its tree, which embeds the receipt blob; a receipt embedding its own commit hash is a fixed-point that cannot be constructed. `measured_at_rev` cannot name the commit that ships the receipt; it must name a distinct commit (e.g., the round-26 evidence commit `0c666ad` or the landing commit's parent) or the source-side revision (tag `154.0.8037.97` in the URL).
  2. **Strict-equality semantics** (`bound === evaluated rev`) leave no evaluable point: at the bound rev the receipt does not exist (could-not-evaluate); at any later rev it mismatches — so the real target receipt would fail every future-tip run, violating the claim's "runtime gate at its committed target receipt remains valid" and its kill rule ("matching committed receipt to fail … claim misses").
  3. **Ancestor-or-equal semantics** keep future tips green but make the required red control unsatisfiable (a bound ancestor always passes). Neither naive equality gives both red and green controls.
  4. The only semantics admitting both controls: verify the **bound revision's** committed bytes/receipt (cross-revision check) rather than equating revs — e.g., require `git show <bound>:<bytes_path>` to hash to `decoded_sha256` and the bound-rev receipt blob to equal the evaluated blob; unresolved/absent bound rev ⇒ could-not-evaluate (exit 2). P4 is exactly the (currently uncaught) red fixture for this check.
  5. **Atomicity hazard**: the committed target receipt `s106.json` has no revision field. If `parseReceipt` makes it mandatory without updating the target receipt in the same landed change, O2 flips to could-not-evaluate (exit 2) at tip, and `--rev eb23c0b` runs CNE. Field must be added to the target receipt in the same commit, or be optional with a documented default.
  6. Unknown (not decided by frozen claim): field name, strictness, and whether bound rev is the lane commit or the source tag; the report records shapes, not a mandated mechanism.

## 5. Impacted axes

- depth (claim axis): claim is implementable, but only under semantics 4; naive equality (2/3) either fails the kill rule (2) or cannot produce the mandated red control (3).
- calibration: verdicts would misreport if binding is vacuous (ancestor semantics) — a "fixed" gate could silently keep certifying receipts while the counter says superseded/repaired.
- operability: strict equality breaks every future-tip run of the real gate (round-29+); atomicity slip breaks tip immediately.
- coverage/adjacency/freshness: unaffected.

## 6. Smallest safe correction (report only; no production edits made)

1. Add `measured_at_rev` (resolved full SHA) to receipt schema; update committed `corpus/evidence/round-26/sources/s106.json` in the same landed commit that changes the script.
2. In `evaluate()`: after parsing the evaluated-rev receipt, resolve `measured_at_rev`; read the bound-rev receipt and bytes blobs; verdict invalid (exit 1) unless bound-rev bytes hash to `decoded_sha256` and bound-rev receipt equals the evaluated receipt; unresolved/absent bound rev ⇒ could-not-evaluate (exit 2). Do not compare bound rev with the CLI `--rev` for equality.
3. Add selftest cases: red (P4 shape: bound-rev bytes disagree) and green (bound-rev bytes agree) → total 7, keeping the existing 5 (incl. missing-source CNE).

## Trailer

- Report: `tabi-shokunin/.ufo/waves/round-28/w1/Crit02.md` (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`).
- Scratch: `tabi-shokunin/.ufo/waves/round-28/scratch/Crit02/{falsify-c1.mjs,falsify-c1-pair.mjs}`.
- Tooling: none installed (no pacman, no uv, no binaries). Node used only to run the production gate and harnesses.
- Untracked only: `.ufo/waves/round-28/` (wave artifacts + scratch). No tracked changes made.
