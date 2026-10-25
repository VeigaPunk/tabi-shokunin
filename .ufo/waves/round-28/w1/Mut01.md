# Mut01 — C2 citation-binding mutation probe

## Scope and sources

Frozen claim source: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`, C2. C2 requires the stale tally at `LOG.md:221` to remain a mismatch absent a correction citing that exact line, plus a negative unrelated-citation case and a positive exact-citation case. Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`.

Target: `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs`, `m1LogFindings`. Prior independent defect evidence: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`.

## Mutation and detector

Copied the target to scratch `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/scratch/Mut01/check-selfassessment.mjs`. Mutant: deleted the paragraph predicate `/:\\d+/.test(text) &&`, making any correction citation optional. No production or tracked file was edited.

Bounded behavioral detector, run unchanged on pristine source, mutant scratch, and restored scratch:
`node <script-path> --selftest --json`.

- Pristine command: `node scripts/check-selfassessment.mjs --selftest --json` → JSON `cases: 17`, `passed: 17`, `ok: true`.
- Mutant command: `node .ufo/waves/round-28/scratch/Mut01/check-selfassessment.mjs --selftest --json` → JSON `cases: 17`, `passed: 17`, `ok: true`.
- Restored command: same scratch command → JSON `cases: 17`, `passed: 17`, `ok: true`.

Selftest case inventory sweep: read `scripts/check-selfassessment.mjs:443-597`, the complete `CASES` array. It contains `m1-log-stale-then-corrected` (positive correction) and `m1-log-wrong-number-correction` (wrong corrected tally), but no negative case where the corrected number is right while the cited line is missing or unrelated. Thus the optional-citation mutant survives the detector. The exact-citation positive test alone cannot kill it.

Frozen-baseline behavior observation: `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` was piped to a JSON filter selecting `LOG.md` line 221. Output: `mismatches: 1`, and that finding has `claimed: 8`, `observed: 12`, `superseded: true`. This confirms the motivating false-clear remains present at frozen baseline. The source receipt at `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-27-verifier-spotcheck.md:15` independently records the same false-clear.

## Verdict and restoration

**SURVIVED** — the mutation changed citation enforcement, but pristine and mutated selftests both returned `17/17`, `ok: true`. Coverage finding: add a red fixture with a later correction that has the oracle-correct number but cites a different line (and/or no line), while retaining the exact-citation positive control. This probe does not repair or judge production code.

SHA-256 evidence (`sha256sum`):
- Pristine source and scratch before mutation: `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` (equal).
- Mutated scratch: `42b1e46a6828ce7b215f00c0546c60bc9c72226bae428fc94e2fc25a6f7cf74a`.
- Restored scratch and source: `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` (equal; exact-byte restoration supported by matching SHA-256).

No tools were installed or updated. No tracked files were modified.

Report: `.ufo/waves/round-28/w1/Mut01.md`
