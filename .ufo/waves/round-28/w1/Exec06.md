# Exec06 — round-28 C2 do-nothing control

## Frozen target

Claims were read from `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`; frozen baseline is `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. Exact C2 target: `LOG.md:221` must remain a mismatch unless an exact-line correction cites it; the unrelated-citation test must fail to supersede, while exact citation is a positive control. Per task instruction, this report records only the C2 control; no production code or tracked lane files were edited.

## Evidence

**Observation — baseline and tip were the same commit.** Command: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` returned `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; `git -C ... cat-file -t eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` returned `commit`. The initial `git status --porcelain` showed only untracked round-28 wave artifacts (including this report's pre-existing peer reports); no tracked modifications were made by this seat.

**Observation — current counter at both baseline and tip.** Commands:

- `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`
- `node scripts/check-selfassessment.mjs --rev HEAD --json`

Both exited 1 and returned `rev=eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, `mismatches=1`, `clean=false`; each reports the `LOG.md` line 221 finding with `claimed=8`, `observed=12`, `superseded=true`. The exact JSON outputs were saved outside the repository at `/tmp/exec06-baseline.json` and `/tmp/exec06-tip.json`; they were parsed to extract those fields. The observed nonzero aggregate mismatch is elsewhere (`m3-unlanded-paths`, newest round 27, observed 6 live untracked paths), so it does not mean the target finding survived.

**Observation — source of the false clear.** In committed `scripts/check-selfassessment.mjs:319-326`, the supersession predicate requires a later paragraph, same script, a correction/supersession marker, any `:\d+` token, and the observed tally; it does not bind that token to the stale finding's own line. `LOG.md:1904-1907` has the exact citation `supersedes LOG.md:335` and states 12 cases. The same paragraph is accepted for line 221 despite lacking `:221`. An independent counter-matcher reproduction over the committed LOG blob found the paragraph beginning at 1904 accepted for stale lines 221, 335, and 391; only lines 335 and 391 have exact `supersedes LOG.md:<line>` citations. The later `LOG.md:1927-1938` paragraph explicitly describes the line-221 false clear, but itself does not cite it as a correction.

**Observation — gate oracle.** `node scripts/check-freshness.mjs --self-test` exited 0 and printed `FRESHNESS_SELFTEST verdict=clean cases=12`. The attempted `--selftest` spelling exited 2 with usage, so it is not used as evidence.

## Assessment

The no-change control reproduces the claimed C2 vulnerability: at identical baseline/tip the target stale tally remains marked `superseded=true`, notwithstanding aggregate `mismatches=1`. Exact explicit citation is absent for line 221; the counter's paragraph-level numeric-token matcher admits the unrelated citation to line 335. This is a finding about counter behavior, not evidence that the exact-citation fix or either required C2 regression case is implemented.

## Risk / blocker

No blocker to this scoped control. No lane production edits, fixtures, or installs were made. Parent integration must use C2's per-finding target condition, rather than aggregate mismatch count alone, when judging a later implementation. No builds, linters, formatters, or tests were run beyond the explicitly requested counter control and self-test oracle.
