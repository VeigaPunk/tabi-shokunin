# R66MutTester1: scoped findings (checkMatrix relative-input mutants on v3)

Full report: `.ufo/waves/round-66/w1/R66MutTester1/report.md`. Suggestion block: `.ufo/waves/round-66/w1/R66MutTester1/suggested-cases.md`.

Key finding: `round-66/counters/check-receipt-provenance-v3.mjs` is byte-identical to frozen v2 (sha256 `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4`). Its selftest is 12 cases, not the 14 the spec expects. No relative-input case exists.

| mutant | verdict | exit | killed-by-case-id |
|---|---|---|---|
| (i) repo base only | SURVIVED | 0 | none |
| (ii) matrix-dir base only | SURVIVED | 0 | none |
| (iii) cwd instead of repo | SURVIVED | 0 | none |
| (iv) existsSync for isFile (line 91, not candidates line) | SURVIVED | 0 | none |

Baseline v3: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12`, exit 0.

Survivors: all four.

Suggested (not applied): `S-matrix-repo-relative` kills (ii) and (iii); `S-matrix-dir-relative` kills (i); `S-matrix-directory-input` kills (iv) by an EISDIR crash, exit 1. Pristine with the suggestion: `cases=15 passed=15`, exit 0.

Tools installed: none. v3 unchanged after all runs.
