source: .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs (own-work; v2 predicate byte-identical at .ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs); Node path join semantics S171 (https://nodejs.org/docs/latest-v24.x/api/path.html §path.join, opened 2026-11-05)
verified-at: 2816adb359a50c2fd83fa975e39f0650aa189984 (round-66 base); frozen claim at b1ecd665508b85b9f94ab155c4cd04bce3e51fee; scored at b1ecd665
recheck: `node .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs --selftest --scratch <abs>` (expect `verdict=clean cases=14 passed=14`, exit 0), then each `.ufo/waves/round-66/c2/final/mutants/<id>.mjs --selftest --scratch <abs>` (expect `verdict=red`, exit 1)

# Relative matrix inputs in the receipt-provenance gate

The gate (`check-receipt-provenance-v2.mjs`, frozen round 65) binds a matrix's named
input by sha256. A relative `input.path` is tried against two bases, in order: the
`--repo` root, then the matrix file's own directory (`checkMatrix`, candidates line).
`path.join` only joins and normalises (S171); it never prefixes the process cwd.

## Before (measured, round 66 pre-freeze)

| Mutant (one predicate line in v2) | Selftest with the mutant | Verdict |
|---|---|---|
| M5a: drop the repo base | 12/12 clean, exit 0 | survives |
| M5b: drop the matrix-dir base | 12/12 clean, exit 0 | survives |

Receipts: `.ufo/waves/round-66/controls/mutants/*.selftest.txt`. The v2 selftest had
no relative-input positive case; the only relative input it used (`instruments/missing.mjs`)
is absent at both bases, so both mutants gave identical verdicts on all 12 cases.

## After (frozen v3, committed b1ecd665, scored at b1ecd665)

v3 is v2 with two selftest cases added and no predicate hunk (`diff` is two added lines
inside the selftest array). The cases: `matrix-input-relative-repo-base` (relative path
resolvable only from the repo root) and `matrix-input-relative-dir-base` (only from the
matrix directory); each asserts no `matrix-input` finding.

| Gate | Selftest | Exit |
|---|---|---|
| v3 unmutated | clean 14/14 | 0 |
| M5a (repo base dropped) | red 13/14 | 1 |
| M5b (matrix-dir base dropped) | red 13/14 | 1 |
| M5c (cwd instead of repo) | red 13/14 | 1 |
| M5d (absolute-only) | red 12/14 | 1 |

Receipts: `.ufo/waves/round-66/scored/c2-*.txt`.

## Limits (not closed here)

- The gate accepts a relative input that escapes the repo: `path.join` normalises `..`,
  so `../outside.mjs` from `X/repo` resolves to `X/outside.mjs` and binds (critic F7,
  `R66Critic.md`). Not repaired; a later round must add a refusal and its control.
- The two new cases use `negate: true` (absence of a finding). A fixture that resolves
  under both bases would pass under a single-base mutant; none exists in the selftest.
- The mutant kill is empirical over four mutants. It is not a proof of semantic protection.
