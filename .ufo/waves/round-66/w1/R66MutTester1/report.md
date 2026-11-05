# R66MutTester1: mutation probe of check-receipt-provenance-v3.mjs (checkMatrix relative-input binding)

Scope: read-only on the v3 gate. Target copied to scratch; mutants built in scratch; no write to any frozen file, corpus, SCORECARD, LOG, or sibling repo. No tools installed.

## Finding 1: the v3 file is the v2 bytes (claim-relevant)
- `round-66/counters/check-receipt-provenance-v3.mjs` sha256 `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4`
- `round-65/counters/check-receipt-provenance-v2.mjs` sha256 `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4`
- `diff` v2 vs v3: empty (exit 0).
- Consequence: v3 selftest is `cases=12`, not the `cases=14` the seat spec expects. v3 contains no relative-input case. The claim draft ("selftest gains two cases, one per base") is not true of the file as written.
- The v3 line 90 candidates expression, observed: `const candidates = path.isAbsolute(rel) ? [rel] : [path.join(repo, rel), path.join(path.dirname(file), rel)];`

## Pristine baseline
- `node v3.mjs --selftest --scratch <S>` (cwd = scratch): stdout `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12`, exit 0.

## Verdict table (v3 as shipped)
Mutant labels follow the seat spec. Note the spec's (i) is the same edit as control M5b, and (ii) is the same as control M5a.
(iv) is applied to the `isFile` line (v3 line 91, `const hit = ...`), not the candidates line. The spec names the isFile check, so I followed the check, not the line number. This is a deviation from the literal "candidates line" wording; disclosed.

| mutant | edit (v3 line) | verdict | exit | stdout | killed-by-case-id |
|---|---|---|---|---|---|
| (i) repo base only | L90 `[path.join(repo, rel)]` | SURVIVED | 0 | `verdict=clean cases=12 passed=12` | none |
| (ii) matrix-dir base only | L90 `[path.join(path.dirname(file), rel)]` | SURVIVED | 0 | `verdict=clean cases=12 passed=12` | none |
| (iii) cwd instead of repo | L90 `[path.join(process.cwd(), rel), path.join(path.dirname(file), rel)]` | SURVIVED | 0 | `verdict=clean cases=12 passed=12` | none |
| (iv) existsSync for isFile | L91 `fs.existsSync(c)` | SURVIVED | 0 | `verdict=clean cases=12 passed=12` | none |

Mutant file sha256 (scratch, now deleted):
- mut-i-repo-base-only `9bdc3dda3032a16f8dbb5ac30bc57ff533fc4937b856bbde38752580296545cb`
- mut-ii-matrixdir-base-only `47a768a6033f6072ef80bb29a18ad1ea5ed7f4054255efb704fb21d9b8270266`
- mut-iii-cwd-instead-of-repo `b7121b422d09976879df424fc84d38b96023f8d8843f642c47297d2cd855e3a2`
- mut-iv-existsSync-for-isFile `8256280b87c0831bd3bbe7985b4e1c5239b4a0b784f5c48f0339a5165340ea7d`

Each mutant diff against v3 is exactly one changed line (checked with `diff`; anchors matched exactly once).

## Why they survive
- The only relative-path matrix case in v3 is `matrix-input-absent` (`input.path = 'instruments/missing.mjs'`). It is absent under every base, so no base variant changes its verdict.
- The other binding cases use absolute paths, which take the `path.isAbsolute(rel) ? [rel]` branch before any base is consulted.
- No case has a directory as input, so the isFile/existsSync distinction is never exercised.

## Suggestion (NOT applied to v3)
File: `round-66/w1/R66MutTester1/suggested-cases.md` (case block, insert before `const passed = results.filter`). Three cases:
- `S-matrix-repo-relative`: `input.path = 'instruments/a.mjs'` pinned to the real digest; expects no `matrix-input` finding. Kills (ii) and (iii).
- `S-matrix-dir-relative`: `input.path = 'sibling.mjs'` next to the matrix; expects no `matrix-input` finding. Kills (i).
- `S-matrix-directory-input`: `input.path = 'instruments'` (a directory); expects `input absent: instruments`. Kills (iv).

Verified on a scratch copy of v3 with the block inserted (v3 unchanged):

| run | exit | observed |
|---|---|---|
| suggested, pristine | 0 | `verdict=clean cases=15 passed=15` |
| suggested + (i) | 1 | `FAIL S-matrix-dir-relative ["matrix-input"]`, `verdict=red cases=15 passed=14` |
| suggested + (ii) | 1 | `FAIL S-matrix-repo-relative ["matrix-input"]`, `verdict=red cases=15 passed=14` |
| suggested + (iii) | 1 | `FAIL S-matrix-repo-relative ["matrix-input"]`, `verdict=red cases=15 passed=14` |
| suggested + (iv) | 1 | no verdict line; stderr `Error: EISDIR: illegal operation on a directory, read` (crash in `S-matrix-directory-input`) |

So (iv) is killed by a crash, not a clean finding. The kill satisfies "exit non-zero" but the case should be hardened (for example, catch and record) if the suite is to report a verdict rather than crash.

## Commands and exit codes
- `mkdir -p` scratch `/fast/scratch/hyaku/tabi-r66/R66MutTester1`: 0
- `cp` v3 to scratch, `sha256sum`, `diff v2 v3`: 0 (diff empty)
- Mutant generation (node in eval, exact-anchor assert): ok, anchors matched 1 each
- `node <file> --selftest --scratch <S>` for v3 + 4 mutants: all exit 0, 12/12 clean
- suggested pristine + 4 mutants selftest: 0, 1, 1, 1, 1 (above)
- `node suggest-mut-iv.mjs --selftest` stderr check: exit 1, `EISDIR`
- final `sha256sum` v3 after all runs: `81c8a5ec…aea4` (unchanged)

## Limits
- Ran only `--selftest`. Did not run the CLI (`--dir/--repo`) against forged or honest fixtures.
- The "killed-by-case-id" column for the v3 table is none; the case ids above are for the suggestion only.
- Scratch dir deleted after the run.
