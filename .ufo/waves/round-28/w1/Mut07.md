# Mut07 — C2 citation-optional mutation probe

## Scope and evidence

- Frozen claims read from `.ufo/waves/round-28/claims.json`: C2 requires that only a correction citing the exact stale tally can supersede it; `LOG.md:221` must remain a mismatch without that exact correction.
- Tooling authorization read from `/home/vgpnk/.omp/agent/RULES.md`. No tools installed or updated.
- Lane `HEAD` observed as `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (`git -C … rev-parse HEAD`). Working-tree status showed only untracked `.ufo/waves/round-28/`; no tracked files were changed.
- Baseline source and pristine scratch copy SHA-256: `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` (command: `sha256sum scripts/check-selfassessment.mjs scratch/Mut07/pristine.mjs`). The committed baseline blob produced the same SHA-256 (`git cat-file blob eb23c0b…:scripts/check-selfassessment.mjs | sha256sum`).

## Mutant and detector

Mutant: in isolated `scratch/Mut07/mutant.mjs`, remove the `/:\d+/.test(text) &&` requirement from the `m1LogFindings` paragraph supersession predicate (baseline source lines 319–326). Thus a later paragraph can supersede a stale tally without any citation, provided its other conditions match. No lane production file was edited.

Expected detector: `node …/check-selfassessment.mjs --selftest --json`; a detector covering citation-required supersession should reject this mutant. The baseline source's CASES table (lines 443–597) has exact-citation positive case `m1-log-stale-then-corrected` and a wrong-number case, but no no-citation negative case.

## Actual outputs and verdict

- Pristine detector: `node scripts/check-selfassessment.mjs --selftest --json`; exit `0`, JSON `cases=17`, `passed=17`, `ok=true`.
- Mutated detector: `node scratch/Mut07/mutant.mjs --selftest --json`; exit `0`, JSON `cases=17`, `passed=17`, `ok=true`, no failed cases.
- Separate pristine tip observation: `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`; exit `1`, `mismatches=1`, `superseded=10`. Its `LOG.md:221` finding has `script=scripts/check-freshness.mjs`, `claimed=8`, `observed=12`, `superseded=true`. Overall mismatch was `m3-unlanded-paths` (`observed=40`) because the detector counts untracked paths in the active wave/scratch tree; this does not change the observed `LOG.md:221` finding. The exact later paragraph responsible for this particular supersession was not isolated in this probe.

**Verdict: SURVIVED (coverage finding).** The citation-optional mutant passes all 17 existing selftests. The tip observation independently confirms the claimed false-clear is present, but this probe does not establish that `LOG.md:221` specifically lacks an exact correction citation. No claim repair or integration performed.

## Restoration evidence

After the mutant run, restored `mutant.mjs` by copying pristine bytes. `sha256sum pristine.mjs mutant.mjs` returned the same hash for both: `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab`. Re-ran the detector on restored `mutant.mjs`: exit `0`, JSON `cases=17`, `passed=17`, `ok=true`. Restoration applies only to the isolated scratch file; lane tracked bytes remained untouched.
