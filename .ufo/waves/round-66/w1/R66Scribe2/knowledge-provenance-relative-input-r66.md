source: S-next (Node.js `path` module semantics for `path.isAbsolute` and `path.join`, as called at `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs:90`; row ID to be assigned by the L1, not minted here); gate under test `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs` (matrix-input binding `:77-96`, relative candidates `:90`, selftest matrix cases `:158-170`); mutants `.ufo/waves/round-66/controls/mutants/M5a-drop-repo-base.mjs` and `M5b-drop-matrix-dir-base.mjs` (each differs from the v2 gate at line 90 only). The v3 gate file that adds the relative-input cases is NOT yet written; its path is to be assigned by the L1.
verified-at: 2816adb359a50c2fd83fa975e39f0650aa189984 (lane base). The v2 gate's bytes at that base equal the working tree (`git show 2816adb359a50c2fd83fa975e39f0650aa189984:.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs | sha256sum` and the working-tree `sha256sum` both `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4`). The lane's `git rev-parse HEAD` at drafting time reads `4bea87d50950e5030124b14302c53124c4308fc9`, not the base; the base is the verified-at revision.
recheck: `node .ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs --selftest --scratch <ABSOLUTE SCRATCH DIR>` expecting `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12` (exit 0) for the v2 gate. Replace this line with the v3 selftest command once the v3 gate exists; until then the v2 command is the only recheck that runs.

# Relative matrix inputs are bound by the v2 gate but not tested — round 66

## Ground

The v2 gate (round 65) binds each matrix's named input by sha256. For a relative `input.path`, its candidate list is built at `check-receipt-provenance-v2.mjs:90`:

> `const candidates = path.isAbsolute(rel) ? [rel] : [path.join(repo, rel), path.join(path.dirname(file), rel)];`

So a relative name resolves first against `--repo`, then against the matrix file's directory. The first existing file is hashed at `:93` and compared with the pin.

The selftest has 12 cases: `clean` (1), one per `CHECK_IDS` entry (8), and three `matrix-input` binding cases (`:158-170`). None of the three binding cases names a relative input that resolves:

- `matrix-input-absent` names `instruments/missing.mjs` (`:159`), which exists under neither base, so both bases give the same answer.
- `matrix-input-digest` and `matrix-input-bound` name an absolute path, `path.join(dir, 'good.command.json')` (`:160-161`).
- The clean fixture's matrix also names an absolute path (`:136`).

The relative receipt input `instruments/a.mjs` (`:130`) is checked by `readAt` against the repo (`:66`). It is not the matrix binding and does not reach the candidate list at `:90`.

## The two surviving mutants (measured)

Each mutant is the v2 gate with one candidate removed from line 90:

| mutant | line 90 in the mutant | selftest (committed) | selftest (re-run in scratch, 2026-11-05) |
|---|---|---|---|
| M5a-drop-repo-base | `[path.join(path.dirname(file), rel)]` | `.ufo/waves/round-66/controls/mutants/M5a-drop-repo-base.selftest.txt:1`: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12` | exit 0, `verdict=clean cases=12 passed=12` |
| M5b-drop-matrix-dir-base | `[path.join(repo, rel)]` | `.ufo/waves/round-66/controls/mutants/M5b-drop-matrix-dir-base.selftest.txt:1`: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12` | exit 0, `verdict=clean cases=12 passed=12` |

Both pass 12/12, so the gate's own selftest cannot tell them from v2. The round-65 mutant survey already recorded the M5a form as a survivor: `.ufo/waves/round-65/w1/R65MutTester2.md:16` reads `| M5 | 89 | relative path against matrix dir only | SURVIVED | none |`, and `:22` states that "a valid, correctly pinned relative matrix is falsely rejected, and no control catches it."

M5a is the false-reject direction: a relative input that exists only under `--repo` is reported `input absent`. M5b is the mirror image: a relative input that exists only in the matrix directory is reported `input absent`.

## What the two new cases kill (proposed; probe-verified in scratch only)

Two cases, added to a scratch copy of v2 before the `const passed` line, with no change to the frozen gate:

1. `rel-input-repo-only`: a matrix in the controls directory names `instruments/a.mjs` with that file's real sha256. The file exists under `--repo` only. Expected: no `matrix-input` finding. Kills M5a.
2. `rel-input-dir-only`: a matrix names `local-input.txt` with its real sha256. The file exists in the controls directory only. Expected: no `matrix-input` finding. Kills M5b.

Probe run (scratch copy, `$HYAKU_SCRATCH/tabi-r66/R66Scribe2/probe/`, not committed):

| gate | exit | cases | passed | failing case and finding |
|---|---|---|---|---|
| v2 + two probe cases | 0 | 14 | 14 | none |
| M5a + two probe cases | 1 | 14 | 13 | `rel-input-repo-only`: `matrix-input:input absent: instruments/a.mjs` |
| M5b + two probe cases | 1 | 14 | 13 | `rel-input-dir-only`: `matrix-input:input absent: local-input.txt` |

Each mutant is killed by exactly one case, and each case is passed by v2. The v2 gate stays unchanged, and so does its 12/12 selftest.

## Limits

- The probe is a scratch insertion, not a committed instrument. The v3 file, its case numbering and its freeze are for the L1.
- Two probe cases kill the two named mutants. They do not show that the gate has no other survivors.
- The two cases do not test a relative input that exists under both bases with different bytes (which base wins). The gate's own order at `:90` (repo first) is what that would test, and no case covers it.
- The mutant files' line-90 text is the only difference from v2 (diff run in this seat: one changed line each).
