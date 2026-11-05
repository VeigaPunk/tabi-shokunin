# R66Executor3 — C2 mutants of receipt-provenance v3 (relative matrix-input resolution)

Scope: four single-line mutants of `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs`, the
`const candidates = ...` line in `checkMatrix` (line 90). v3 and v2 were not edited. Mutants are in
`.ufo/waves/round-66/c2/mutants3/`. No tools installed (Node v24.21.0 already present; no pacman, no
uv, no npm global).

## Result table (against v3 `--selftest`, 12 cases)

| mutant | candidates line (line 90 only changed) | selftest verdict | exit code | killed by selftest | which case killed it |
|---|---|---|---|---|---|
| M5a | `[path.join(path.dirname(file), rel)]` (drop repo base) | clean, cases=12 passed=12 | 0 | **no** | none |
| M5b | `[path.join(repo, rel)]` (drop matrix-dir base) | clean, cases=12 passed=12 | 0 | **no** | none |
| M5c | `[dirname(file)-base, repo-base]` (swap order) | clean, cases=12 passed=12 | 0 | **no** | none |
| M5d | `[]` (absolute-only) | clean, cases=12 passed=12 | 0 | **no** | none |

Baseline v3: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12`, exit 0.
Each mutant stdout tail: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12`, exit 0.

Mutant diffs (`diff v3 mutant`, each a single `90c90` hunk; exit 1 = files differ):
- M5a: `90c90 < ...[path.join(repo, rel), path.join(path.dirname(file), rel)]; > ...[path.join(path.dirname(file), rel)];`
- M5b: `90c90 < ...; > ...[path.join(repo, rel)];`
- M5c: `90c90 < ...[path.join(repo, rel), path.join(path.dirname(file), rel)]; > ...[path.join(path.dirname(file), rel), path.join(repo, rel)];`
- M5d: `90c90 < ...; > ...[];` (the `isAbsolute` branch keeps `[rel]`)

Checksums (sha256): v3 `81c8a5ec...fdc84aea4` (full: 81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4);
M5a `47a768a6...8270266`; M5b `9bdc3dda...545cb`; M5c `5c5a4f8c...0303d`; M5d `04a668ae...dfa85`.

## Why the selftest cannot kill any of them (argument)

The mutated line runs only in the relative branch (`path.isAbsolute(rel)` false). In the v3 selftest:
- Every case using an absolute input (`matrix-good`, `matrix-input-digest`, `matrix-input-bound`, and the
  `matrix-input` negative `input: null`) never reaches the candidates line or reaches it with `[rel]`
  unchanged, so output is identical to v3.
- The only relative input is `matrix-input-absent` with `instruments/missing.mjs`. That path exists under
  neither the repo nor the matrix directory, so each mutant's candidate list yields no hit and emits
  `input absent: instruments/missing.mjs`, the exact finding the case requires. Output identical.
- Receipt checks (`checkReceipt`) never use the candidates line.
So every mutant produces the same 12 case outcomes as v3, and the selftest stays clean. This is the
survival the L1 observed at v2 (controls: M5a/M5b 12/12). Confirmed empirically for all four.

M5c equivalence: holds for the v3 selftest by the argument above (no selftest input resolves in both
bases). It is NOT equivalent in general; see P3 below, which shows a divergence. The assignment expected
equivalence "for the two new cases if both exist"; on the selftest it is equivalence over the test inputs
only.

## Scratch probe: fixtures that do kill them (not in v3, not committed)

Scratch-only driver (deleted with the scratch dir) built three relative-path matrix fixtures and ran
`node <bin> --dir <d> --repo <repo> --json` for v3 and each mutant. Observed rows (exit, matrix-input findings):

| probe | what the fixture is | v3 | M5a | M5b | M5c | M5d |
|---|---|---|---|---|---|---|
| P1 repo-base only: `instruments/a.mjs` in repo, absent from matrix dir, correct pin | positive relative fixture | exit 0, none | exit 1, `input absent: instruments/a.mjs` | exit 0, none | exit 0, none | exit 1, `input absent: instruments/a.mjs` |
| P2 matrix-dir base only: `pinned.txt` in matrix dir, absent from repo, correct pin | positive relative fixture | exit 0, none | exit 0, none | exit 1, `input absent: pinned.txt` | exit 0, none | exit 1, `input absent: pinned.txt` |
| P3 both bases hold `shared.txt`, repo bytes differ from dir bytes; pin = repo bytes | collision fixture | exit 0, none | exit 1, `input digest mismatch` | exit 0, none | exit 1, `input digest mismatch` | exit 1, `input absent: shared.txt` |

Kill sets from the probe (kill = finding vs v3's clean):
- M5a: killed by P1, P3. Survives P2.
- M5b: killed by P2. Survives P1, P3.
- M5c: killed by P3 only. Survives P1, P2.
- M5d: killed by P1, P2, P3 (any positive relative fixture kills it).

Probe exit codes: `probe_exit=0` (driver ran all rows). Mutant selftest exit codes: 0 each.

## Recommendation for the v3 selftest (for the L1; no edit made here)
A positive relative-input case is needed. Minimal set that kills all four: P1 (kills M5a, M5d), P2
(kills M5b, M5d), P3 (kills M5a, M5c, M5d). M5c requires the collision case P3; without it M5c is
indistinguishable from v3 on any input the selftest contains.

## Commands run (exit codes)
- `node --version` -> v24.21.0
- `cp v3 -> mutants3/{M5a,M5b,M5c,M5d}.mjs`; `cmp` identical before edit
- `node v3 --selftest --scratch <S>` -> exit 0, `verdict=clean cases=12 passed=12`
- 4 edits to line 90 (edit tool); `diff v3 mutant` -> exit 1 each (single `90c90` hunk)
- `node <mutant> --selftest --scratch <S>` -> exit 0 each, `verdict=clean cases=12 passed=12`
- `node <mutant> --selftest --scratch <S> --json` (M5d) -> all 12 `ok: true`
- `node probe.mjs <S> v3 mutants3` -> exit 0 (table above)
- `sha256sum` (checksums above); `rm -rf -- <S>` -> exit 0, scratch removed.

Scratch: `/fast/scratch/hyaku/tabi-r66/R66Executor3/` (removed).
No fleet-root, corpus, SCORECARD, LOG, MANIFEST, round-65 counter, or sibling writes. No git writes.
