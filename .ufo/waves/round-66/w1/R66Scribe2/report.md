# R66Scribe2 — report (round 66, wave w1, prose drafting)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Lane base `2816adb359a50c2fd83fa975e39f0650aa189984`. Observed `git rev-parse HEAD` at drafting: `4bea87d50950e5030124b14302c53124c4308fc9` (not the base; the drafts use the base as `verified-at`).

## Deliverables
- `.ufo/waves/round-66/w1/R66Scribe2/knowledge-provenance-relative-input-r66.md` — calibration knowledge draft (provenance trio first; `source:` names the v2 gate, both mutants and `S-next`; `recheck:` is the v2 selftest command because no v3 file exists).
- `.ufo/waves/round-66/w1/R66Scribe2/mistakes-r66.md` — Mistakes table, columns class | evidence pointer | captured-by | fix; four rows.
- This report.

Nothing was written under `corpus/`, `SOURCES.md`, `LOG.md`, `SCORECARD.md`, any round-65 frozen counter, the fleet root, `.ufo/state/`, or any sibling repo. No git write was run. No tools were installed or upgraded.

## Findings
1. **C2 mutants reproduce.** M5a and M5b each differ from v2 at `check-receipt-provenance-v2.mjs:90` only, and each passes the 12/12 selftest (committed `.selftest.txt:1` and re-run in scratch).
2. **The gap is structural.** All matrix-input selftest cases use absolute paths (`:136`, `:160`, `:161`) or a relative path absent under both bases (`:159`). No case resolves a relative input against either base.
3. **Two proposed cases kill the two mutants** (probe in scratch only): `rel-input-repo-only` kills M5a; `rel-input-dir-only` kills M5b. v2 + cases: 14/14 exit 0; each mutant: 13/14 exit 1, one named `matrix-input` finding.
4. **Number drift (C1 selftest):** the committed `R65Executor1/selftest.stdout:4` says `"cases": 46`; the claims, LOG and lesson say 47; the live counter contains `three-row-conflict-count` at `c1-adjacency-host-v22.mjs:770`; the live run reads 47. The stdout predates that case.
5. **Citation drift (S140/S141):** the r65 Gate rows read `Reject` (`R65Scribe/round-65.md:17-18`); the registry reads `mined` (`corpus/SOURCES.md:154-155`, status column).
6. **Premise mismatch:** no v3 gate file exists in the tree. Recheck lines stay on v2 until the L1 assigns a path.
7. **Survivor provenance:** the M5 survivor was surfaced by the round-65 mutant survey (`R65MutTester2.md:16`, `:22`) and routed (`LOG.md:3668`). It was not captured by any gate, so the assignment's "captured-by none" holds for the gate; the survey did detect it.

## Commands and exit codes
| # | command (abridged) | exit | observed |
|---|---|---|---|
| 1 | `git cat-file -t 2816adb359a50c2fd83fa975e39f0650aa189984` | 0 | `commit` |
| 2 | `git rev-parse HEAD` (lane) | 0 | `4bea87d50950e5030124b14302c53124c4308fc9` |
| 3 | `git show 2816adb…:.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs \| sha256sum` and `sha256sum` on the working copy | 0 | both `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4` |
| 4 | `node …/check-receipt-provenance-v2.mjs --selftest --scratch $S/run-check-receipt-provenance-v2` | 0 | `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12` |
| 5 | `node …/controls/mutants/M5a-drop-repo-base.mjs --selftest --scratch $S/run-M5a-drop-repo-base` | 0 | `verdict=clean cases=12 passed=12` |
| 6 | `node …/controls/mutants/M5b-drop-matrix-dir-base.mjs --selftest --scratch $S/run-M5b-drop-matrix-dir-base` | 0 | `verdict=clean cases=12 passed=12` |
| 7 | `diff` v2 vs M5a and v2 vs M5b (line 90) | 1 (diff found changes, as expected) | M5a: `90c90` drops `path.join(repo, rel)`; M5b: `90c90` drops `path.join(path.dirname(file), rel)` |
| 8 | Probe: v2, M5a, M5b, each with the two proposed cases inserted in a scratch copy (run through a Bun/JS helper, spawnSync of `node … --selftest --json`) | 0 / 1 / 1 | v2 14/14 `verdict clean`; M5a 13/14 fails `rel-input-repo-only` (`matrix-input:input absent: instruments/a.mjs`); M5b 13/14 fails `rel-input-dir-only` (`matrix-input:input absent: local-input.txt`) |
| 9 | JS JSON compare: `R65Executor1/selftest.stdout` vs `controls/v22-selftest-r66.json` | 0 | 46 vs 47 cases; only name in the r66 set not in r65: `three-row-conflict-count` |
| 10 | `awk -F'\|' 'NR==154\|\|NR==155' corpus/SOURCES.md` (status column 9) | 0 | `S140 status=mined`, `S141 status=mined` |
| 11 | `grep -n` / `ls` of cited lines (`R65Executor1/selftest.stdout:4`, `v22-selftest-r66.json:4`, `c1…v22.mjs:770`, `claims-draft.md:21`, `LOG.md:3662`, `LOG.md:3668`, `R65MutTester2.md:16`, `R65Scribe/round-65.md:17-18`, `corpus/lessons/round-65.md:45`) | 0 | lines as quoted in the drafts |

Scratch: `/fast/scratch/hyaku/tabi-r66/R66Scribe2/` (HYAKU_SCRATCH unset; default used). Removed at exit.

## Limits
- The two proposed cases were run only in a scratch copy. The v3 gate, its freeze and its numbering belong to the L1.
- The probe confirms the kills of the two named mutants. It does not prove the absence of other survivors.
- The S-next Node path row ID is a placeholder for the L1.
- The round-65 frozen counter, the committed stdout and the lesson were read, not changed.
