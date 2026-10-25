# Review04 — C1 claim fit at baseline

## Findings

- **C1 is well-motivated and its baseline counter/control are supported.** Frozen claims at `.ufo/waves/round-28/claims.json` (C1) identify `scripts/check-s106-evidence.mjs`, whose baseline selftest command returned `S106_SELFTEST verdict=clean cases=5 passed=5` (exit 0). The same run has `missing-bytes-could-not-evaluate` and `missing-receipt-could-not-evaluate`, both exit 2. Baseline production gate at `--rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` returned `valid=true`, exit 0. Thus the 5-case control, missing-source CNE behavior, and existing target receipt's baseline validity are directly reproducible.
- **C1 revision-binding acceptance is not yet proven by the baseline artifact, and the target receipt is underspecified.** `git show eb23c0b...:corpus/evidence/round-26/sources/s106.json` shows no measured-revision field; baseline runtime output likewise contains no receipt revision or revision-match result. The baseline evaluator description says it checks decoded-byte hash, anchor location/uniqueness, and byte count at the requested revision; it does not bind the receipt to that revision. The frozen target says the receipt must bind the measurement revision and that the runtime gate is valid at its “committed target receipt,” but does not pin the receipt path/revision to be updated or added. The existing fixed receipt path is `corpus/evidence/round-26/sources/s106.json`. Consequently, matching/mismatching fixtures can test the new predicate, but whether the production receipt will carry a revision and pass at its named revision remains unprovable at baseline. This is a post-change acceptance condition, not evidence of a baseline defect beyond the stated omission.

## C2 calibration context (supporting context only)

At baseline, `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` reports the `LOG.md:221` stale tally (claimed 8, observed 12) with `superseded=true`; it is still cleared. The script's LOG matcher (lines 319–326) checks for any `:\\d+` in a later correction paragraph, rather than requiring the cited number to equal the stale finding's line. The round-27 independent finding is exactly at `corpus/lessons/round-27-verifier-spotcheck.md:15`; the routed binding requirement is at lines 46–47. Baseline selftest is 17/17, but its existing LOG stale-then-corrected and wrong-number cases do not provide an unrelated-citation red case; the latter checks the correction tally, not exact citation binding. This is consistent with C2's regression-test target.

## Evidence and limits

- Baseline identity: `git rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; baseline object type `commit`; baseline is ancestor of HEAD. `git status --porcelain` showed only untracked `.ufo/waves/round-28/` (wave artifacts), so this review uses committed baseline bytes.
- C1 commands: `node scripts/check-s106-evidence.mjs --selftest`; `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`.
- C2 context command: `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`; `node scripts/check-selfassessment.mjs --selftest` → 17/17.
- Observation: tooling rules were read from `/home/vgpnk/.omp/agent/RULES.md`; no tool installs/updates performed. No source edits, builds, linters, or formatters.
- Unverified: no post-change receipt/revision pair exists at the reviewed baseline, so the C1 matching/mismatch target and final target-receipt validity cannot yet be adjudicated.
