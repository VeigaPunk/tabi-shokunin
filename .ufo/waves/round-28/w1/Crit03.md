# Crit03 — C2 supersession falsification

## Counterexample and evidence

**[OBSERVED]** Frozen claims `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`, line 12, C2 requires only an exact-cited stale tally to clear; LOG.md:221 must remain a mismatch absent its exact correction. Prior independent evidence in `corpus/lessons/round-27-verifier-spotcheck.md:15` says line 221 was claimed 8, observed 12, yet marked superseded; lines 46–47 name citation binding as the next-round defect.

**[OBSERVED]** Baseline identity: `git rev-parse HEAD` from lane root returned `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; `git status --porcelain` showed only untracked `.ufo/waves/round-28/`. Baseline command `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` exited 1 and returned LOG.md line 221 (`claimed=8`, `observed=12`, `superseded=true`). It also returned the later line 254 (`12`, `12`) and line 275 (`12`, `12`), neither a correction citing 221. LOG.md:221 is the `FRESHNESS_SELFTEST ... cases=8` tally; the located subsequent text at lines 243–263 is a safety-correction entry, and lines 265–284 a post-commit measurement/handoff entry. Neither is a citation to the tally line.

**[OBSERVED]** Source inspection of `scripts/check-selfassessment.mjs:309-327` confirms supersession is computed by scanning every later paragraph and requiring same script, a `/supersed|correct/i` marker, *any* `:\d+` token, and the oracle-correct tally. It does not bind that citation to `f.line`. Thus a citation to any unrelated line can clear the stale tally; a matching correct tally in a later paragraph can also supply the number independently of the actual referenced line. The source comments at 313–315 describe a cited superseded line but implementation does not test equality.

## Falsification controls and uncertainty

The requested unrelated-citation, wrong-script, wrong-tally, later-paragraph, and exact-line control cases were **not independently executed** in this critic pass. Source inspection establishes the general unrelated-line defect; exact outcomes for each such fixture are **[UNKNOWN]** here. The baseline has no reported exact correction for LOG.md:221, and the current false-clear directly falsifies the required negative case. The report's baseline sweep was the complete JSON output of the checker command above; it enumerated all findings, including the three relevant LOG lines.

## Impacted axes and smallest safe correction

- **Calibration:** direct defect. False-clearing the stale 8/12 claim makes the baseline self-assessment report untrustworthy.
- **Depth:** no independent impact established by this C2 review.

Smallest safe correction: in the later-paragraph supersession predicate, require the cited line reference to equal the stale finding's `f.line` (not merely contain a line-number token), retaining same-script, correction-marker, and oracle-correct tally requirements. Add red fixtures for unrelated cited line, wrong script, wrong tally, and a later paragraph; retain a positive exact-line citation fixture. Then re-run the baseline/tip measurement and selftest in the main integration pass.

No tools installed or updated.