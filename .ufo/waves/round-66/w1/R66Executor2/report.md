# R66Executor2 — C2 v3 receipt-provenance gate (tabi round 66, w1)

## Deliverables
- v3 gate: `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` (205 lines)
- v2 → v3 diff: `.ufo/waves/round-66/c2/v2-v3.diff` — **3 lines** (`161a162,163` + two added case lines)
- Selftest output: `.ufo/waves/round-66/c2/v3-selftest.txt`
- Mutant results: `.ufo/waves/round-66/c2/mutants-under-v3-cases.txt`

## Predicate unchanged
- Copy step: `cp` of v2 to v3, then `sha256sum` of both: `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4` (identical).
- `diff v2 v3` output (full):
  ```
  161a162,163
  >     { id: 'matrix-input-relative-repo-base', name: 'matrix-rel-repo.json', matrix: { input: { path: 'instruments/a.mjs', sha256: aSha } }, want: (f) => f.check === 'matrix-input', negate: true },
  >     { id: 'matrix-input-relative-dir-base', name: 'matrix-rel-dir.json', matrix: { input: { path: 'good.command.json', sha256: goodReceiptSha } }, want: (f) => f.check === 'matrix-input', negate: true },
  ```
- Both added lines are inside the `for (const c of [...])` array in `selftest()` (function spans lines 117–173). No change to `checkMatrix`, `evaluate`, `checkReceipt`, or CLI.
- v2 file still `81c8a5ec…` after the work (unchanged).

## Commands and exit codes
1. `node .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r66/R66Executor2/v3` → **exit 0**
   stdout: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=14 passed=14`
2. `diff v2 v3` → exit 1 (differences expected); diff saved as above.
3. Mutant files run directly with their own `--selftest` (as specified):
   - `M5a-drop-repo-base.mjs --selftest --scratch …/m5a` → **exit 0**, `verdict=clean cases=12 passed=12`
   - `M5b-drop-matrix-dir-base.mjs --selftest --scratch …/m5b` → **exit 0**, `verdict=clean cases=12 passed=12`
4. Supplementary (scratch only, not a deliverable): v3 gate with each mutant's predicate line 90 spliced in, run with `--selftest`:
   - v3 + M5a line → **exit 1**, `FAIL matrix-input-relative-repo-base ["matrix-input"]`, `verdict=red cases=14 passed=13`
   - v3 + M5b line → **exit 1**, `FAIL matrix-input-relative-dir-base ["matrix-input"]`, `verdict=red cases=14 passed=13`
   - Mutant diffs vs v2 are exactly one line each (line 90): M5a drops `path.join(repo, rel)`; M5b drops `path.join(path.dirname(file), rel)`.

## Findings
- The v3 gate catches both surviving mutants, each on exactly its own new case; the other 13 cases stay green in both spliced runs.
- **Direct-run result does not show red.** Running the mutant files directly still gives clean 12/12, because each mutant file embeds its own old 12-case selftest and does not contain the v3 cases. The spec's expectation ("each mutant must now be red") is therefore NOT met by the direct run. The red result comes only from the spliced v3 run in item 4. The L1 should decide how the frozen C2 claim should cite this.
- Both new cases pass against the real v3 predicate (14/14), so the gate is not red on its own clean fixtures.

## Scratch and tools
- Scratch `/fast/scratch/hyaku/tabi-r66/R66Executor2/` created, used, and removed (`rm -rf`). No git operations, no installs, no writes to fleet root, siblings, or v2/frozen counters.
- Tools installed: none.
