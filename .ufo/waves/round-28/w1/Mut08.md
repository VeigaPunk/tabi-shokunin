# Mut08 — C1 evaluator revision-binding mutation probe (round 28 w1)

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, HEAD, working tree clean except pre-existing untracked `.ufo/waves/round-28/`).
Role: UFO-FSD mutation tester — mutate smallest behavior-bearing point in isolated scratch copy, run the bounded detector on pristine/mutated/restored bytes, record verdict.

## Claim under test (frozen)
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` claim `C1` (depth): *"receipt must bind the measurement revision and the gate must verify the committed receipt at that revision … selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision"* — countingCommand `node scripts/check-s106-evidence.mjs --selftest`.

## Assigned mutant
"Removing revision comparison / accepting mismatch" on the C1 evaluator (`scripts/check-s106-evidence.mjs`).

## Finding: mutation is vacuous — the comparison does not exist at baseline
Byte-identical source evidence (observation):
- `parseReceipt()` (lines 87-105) requires only `schema/url/decoded_sha256/bytes_path/decoded_bytes/anchor`; **no revision field** is read or required. Unknown receipt keys are silently ignored (JSON parse returns whole doc, only the listed keys are validated).
- `evaluate()` (lines 107-144): `const rev = resolveRev(...)` is used solely to `readBlob` the receipt and bytes paths; **`rev` is never compared to anything in the receipt**. `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch` — no revision term.
- Committed receipt `corpus/evidence/round-26/sources/s106.json` has no measurement-revision field either (observed, 25 lines).

Therefore "accept mismatch" describes exactly the pristine behavior: the mutant is byte-vacuous (no code point to remove). Per UFO-FSD RFC the kill is inconclusive-by-definition, and the finding is a coverage gap: the 5-case selftest contains no revision case at all.

## Detector runs (all commands, cwd = lane root)
Pristine copy: `scripts/check-s106-evidence.mjs` → `.ufo/waves/round-28/scratch/mut08/check-s106-evidence-pristine.mjs` (sha256 identical both paths, see hashes).

1. Baseline selftest on pristine: `node .ufo/waves/round-28/scratch/mut08/check-s106-evidence-pristine.mjs --selftest --json` → `cases=5, passed=5, ok=true` (ids: clean-fixture-valid; sha-mismatch-invalid; anchor-off-by-one-invalid; missing-bytes-could-not-evaluate; missing-receipt-could-not-evaluate). No revision-mismatch case exists.

2. Revision-binding probe (`probe.mjs`, scratch/mut08/): mktemp fixture repo with two commits — commit A commits receipt `{…, measured_rev:"A"}` + bytes; commit B commits only an unrelated README (receipt/bytes untouched).
   - `--rev <A>` (matching): exit 0, `valid=true`, `sha_match=true` → positive control passes.
   - `--rev <B>` (mismatch: receipt bound to A, evaluated at B): **exit 0, `valid=true`, `sha_match=true`** → gate accepts the mismatch.
   - Required behavior (from claim): red control must NOT evaluate valid; observed: valid. **Defect live at baseline.**

3. Production gate untouched: no `--repo` run against the lane; only fixture repos (mktemp, verified git root, removed after run).

## Hashes and restoration
- Before/after sha256 of tracked evaluator — identical: `ef12a6fbe27068bf6d1171910dd54d9ccedef51e9e075c902005bc49a955e91d` (both `scripts/check-s106-evidence.mjs` and scratch pristine copy; captured before probe and after probe).
- `git status --porcelain` post-probe: only `?? .ufo/waves/round-28/` (report/scratch dir, expected). No tracked file modified; nothing committed; no sibling/fleet/shokuknow edits.
- New files only: `.ufo/waves/round-28/scratch/mut08/{check-s106-evidence-pristine.mjs, pristine.sha256, probe.mjs}` + this report.

## Verdict
- **Equivalent mutant (status-quo)**: the ascribed defect is the current behavior; no kill possible because the comparison point is absent (documented above).
- **Coverage finding**: selftest = 5 cases, all pass; zero revision-binding coverage → the C1 target (≥7 cases incl. red mismatch + positive revision controls) is unplaced, and a future revision check would land untested.
- **Defect confirmation**: polymorphic probe shows the gate evaluates a revision-mismatched receipt `valid` (exit 0) — i.e., "verify the committed receipt at that revision" is not enforced at baseline. This is the behavior the C1 fix must flip; a killable mutant only exists after that implementation lands.

No installs performed (node v24.21.0 preinstalled; no channels touched, PACMAN untouched).
