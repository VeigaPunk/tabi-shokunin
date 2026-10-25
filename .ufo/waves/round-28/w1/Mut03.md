# Mut03 — C2 matcher mutation probe

## Scope and frozen claim

Read frozen claims at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`. C2 requires LOG.md stale tally supersession only when the correction cites that exact tally line, and identifies LOG.md:221 as the known false-clear. No tracked source was edited. No tools installed.

## Mutant and expected detector

Target: `scripts/check-selfassessment.mjs`, `m1LogFindings` supersession predicate. Mutation in an isolated scratch copy replaced the bare citation-presence condition `/ :\d+ /` (without spaces) with `true`, making citation optional; no other predicate changed. Expected detector: `node scripts/check-selfassessment.mjs --selftest` should reject this weakened matcher if the selftest covers citation necessity; baseline/repo detector output should show whether LOG.md:221's status changes.

## Actual outputs and verdict

- Pristine selftest: `node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`, exit 0.
- Mutant selftest: `node .ufo/waves/round-28/scratch/Mut03/pristine.mjs --selftest` → same 17/17 clean result, exit 0. **Survived**: no selftest kills the citation-optional mutant.
- Pristine and mutant `--repo <lane> --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` both report the LOG.md:221 finding as `claimed=8, observed=12, superseded=true`; `mismatches=1`, `superseded=10`. The finding remains cleared despite its clearing paragraph citing `LOG.md:391`, not line 221. The baseline also records an m3 unlanded-path mismatch because the isolated wave scratch is untracked. Thus the runtime outputs differ only in that ambient path count (53 vs 55), so whole-JSON equality is **inconclusive**; the C2 finding fields are identical. The known false-clear itself is directly observed.
- Prior independent evidence: `corpus/lessons/round-27-verifier-spotcheck.md:15-17` records the same LOG.md:221 false-clear (`claimed 8`, `observed 12`, `superseded=true`).

Verdict: **selftest mutant survived; C2 coverage finding**. The matcher’s current bare `/:\d+/` check accepts an unrelated cited line, and the 17-case selftest does not detect removing citation checking entirely.

## Hashes and restoration evidence

- Lane script pristine/before: SHA-256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` (matched `git show HEAD:scripts/check-selfassessment.mjs`).
- Mutant scratch copy: SHA-256 `274b7df2e8164273aa1afd5c29245f161337a82deeb1be405a70fc288ca3c565`.
- Lane script after probe: SHA-256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab`; exact lane bytes unchanged/restored. Scratch files are under `.ufo/waves/round-28/scratch/Mut03/`.

Evidence commands were run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Observation: baseline HEAD was `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; worktree status showed only untracked `.ufo/waves/round-28/`. Inference: the missing exact-line negative selftest is the coverage gap demonstrated by this surviving mutation.