# MutC1b — mutation test: C1 v5 counter's unchanged v4 semantics (regression guard)

round 37 · wave w1 · seat MutC1b · 2026-10-27 · lane tip at test time `f76da094f0ff0ad9856d2232858241e3f7841379` (read-only)
Target: `.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs`, sha256 `9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c` — equals `claims.json frozenDigests.c1` (verified before and after all runs; lane file never written).

## Method

Same bounded behavioral detector on pristine / mutated / restored bytes: `evaluate()` invoked as
`node <counter> --rev <REV> --repo <tree> --fleet /home/vgpnk/Projects/shokunin --json`.
All runs at the frozen honest REV `ed8ccfc00ad3784bc424aa118e056f8edf4ee803` (the round-start tip used by `baseline/c1r37-J3-honest-v5.json`). Mutants are single-point edits of a scratch copy (`/fast/scratch/hyaku/tabi-r37/w1/MutC1b/`, `TMPDIR` pointed inside it); the lane counter byte was never modified. Fixture trees are `--shared` clones of the lane checked out at `ed8ccfc` plus one fixture commit (`git -C "$D" rev-parse --show-toplevel` asserted = `$D` before committing):

- **Fixture B** (decoy note, `run-controls.sh` recipe) `6abd410fbbd34bde3f1c08cff499f0538e6a973c`: the drift-audit row `kaidoku-shokunin@4909…:SKILL.md:585` note `verbatim at :748` → `pin :585 moved verbatim at :748` (truthful; earlier token is a decoy). Diff: `evidence/fixture-B-decoy-note.diff`.
- **Fixture E** (junk delta-screen row) `aa7e99bb4adad89dd474dea2d73668933930f752`: adds `corpus/adjacency-screen-delta.tsv` (absent at REV) = header + one row citing ref `kaidoku-shokunin@4909…:SKILL.md:585`, reason `not-browser-sense`. Content: `evidence/fixture-E-delta-screen-row.tsv`.

Process disclosure: an initial driver pass pointed every run at `--rev ed8ccfc`, so its four fixture rows evaluated the unmodified honest tree and are **discarded as invalid** (honest rows from that pass were valid and are superseded by the re-run below). The fixed driver re-ran the complete matrix after re-cloning both fixtures; `evidence/run.sh` is the corrected driver, `evidence/results.tsv` the authoritative output.

## Results (detector matrix, `evidence/results.tsv`)

| run | exit | predicate | key fields |
|---|---|---|---|
| honest-pristine | 0 | true | reproduces frozen `c1r37-J3-honest-v5`: adj clean, comp.unaccounted 0, drift 307/307, 0 findings, delta.total 0, pins digest `810193…0655` |
| honest-m1 | **1** | **false** | drift.total 307, `>= 9999` false — killed on honest tree |
| honest-m2 | **1** | **false** | auditCoverage 307, `!== total` false — killed on honest tree |
| honest-m3 | 0 | true | unchanged on honest (all 3 honest moved notes are canonical-first, v4 regex parses them identically) |
| honest-m4 | 0 | true | unchanged on honest (findings already 0) |
| honest-restored | 0 | true | restored copy (byte-identical to pristine) reproduces the baseline |
| decoy-pristine | 0 | true | reproduces frozen `c1r37-J2-decoy-note-v5` (v5 admits via the `verbatim at :N` clause) |
| decoy-m3 | **1** | **false** | auditF=1 `audit-moved-wrong-relocation` detail `:585`; coverage 307→306, auditMissing = the decoy row — killed |
| junk-pristine | **1** | **false** | deltaSF=1 `screen-not-a-delta-candidate` — the leg binds |
| junk-m4 | **0** | **true** | junk row **admitted** (receipt still lists deltaSF=1 — detector intact, gate leg dropped) — killed |

## Mutant verdicts

| mutant | mutation (single point) | sha256-16 | expected detector | actual | verdict |
|---|---|---|---|---|---|
| m1 | predicate `out.drift.total >= 1` → `>= 9999` | `7b0ccd3c12336073` | honest flips false | honest exit 0→1, predicate true→false | **killed** |
| m2 | `auditCoverage === out.drift.total` → `!==` | `792f35916dd746e8` | honest flips | honest exit 0→1, predicate true→false | **killed** |
| m3 | B2 canonical parser `/\bverbatim at :([1-9][0-9]*)\b/` → v4 first-token `/:([1-9][0-9]*)\b/` (verification kept, as in v4) | `1edb7bd5bf7cc372` | decoy fixture flips true→false | decoy exit 0→1; finding that fires: **`audit-moved-wrong-relocation`** (detail `:585`), row drops to auditMissing — byte-for-byte v4's frozen `c1r37-J2-decoy-note-v4` behavior | **killed** |
| m4 | predicate leg `&& deltaScreenFindings.length === 0` removed | `fefcf8b91f72879c` | junk delta-screen row admitted | junk fixture exit 1→0 (admitted) while pristine refuses with `screen-not-a-delta-candidate` | **killed** |

**Survivors: none.** Every mutant changes at least one observable output (exit code, predicate, finding/coverage fields) on the honest or a fixture tree. m3/m4 honest-tree non-change is expected: both mutants only alter refusal/admission of specific inputs, not honest evaluation.

## m4 scope note (documented deviation)

The tasking asked for a junk delta-screen row "citing a real delta candidate". At the frozen delta pins the delta pool is **empty** (`delta.total == 0` in every run; `corpus/adjacency-screen-delta.tsv` does not even exist at `ed8ccfc`), so no real delta candidate exists to cite — the pool is a deterministic function of frozen sibling heads and cannot be seeded from a seat. The fixture therefore cites the nearest real object: a genuine candidate-shaped ref from the pinned pool (the kaidoku `SKILL.md:585` drift-audit target) with a valid reason token. The pristine counter rejects exactly this junk class (`screen-not-a-delta-candidate`), and m4's admission of it is the observable kill — the leg demonstrably binds. "run mutant: admitted = finding" observed as specified: the mutant admits while its own receipt still reports the finding.

## Restoration evidence

- Lane counter sha256 before first run and after all runs: `9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c` (unchanged; `evidence/counter-hashes.txt`, last line).
- `restored.mjs` (fresh copy of pristine bytes after mutation) hashes identical to the frozen digest and reproduces honest exit 0 / predicate true (`honest-restored`).
- No sibling repo, fleet-root file, or lane file outside the seat dir was written; no mutating git command outside the two scratch fixture clones; fixture clones and scratch root deleted on completion.

## Tooling

No tools installed or upgraded (node/python3/git as present on host). PACMAN guard respected.

## Evidence index (paths relative to lane root)

- `evidence/results.tsv` + `results.header` — full matrix
- `evidence/honest-pristine.json`, `honest-m1..m4.json`, `honest-restored.json`, `decoy-pristine.json`, `decoy-m3.json`, `junk-pristine.json`, `junk-m4.json` — raw counter outputs
- `evidence/m1.diff m2.diff m3.diff m4.diff` — exact mutant edits; `counter-hashes.txt` — before/after hashes
- `evidence/fixture-B-decoy-note.diff`, `fixture-E-delta-screen-row.tsv`, `fixtures.txt`, `fixture-revs.txt`, `run.sh` — fixtures and driver

VERDICT ok — all four v4-semantics regression-guard mutants (m1 drift-threshold, m2 coverage-equality, m3 moved-note parser, m4 delta screenFindings gate leg) killed with observable verdict flips; pristine reproduces both frozen C1 control receipts; restored bytes reproduce the baseline; no survivors. One documented fixture substitution: the frozen delta pool is empty, so m4's junk row cites a real pinned-pool ref instead of a (non-existent) real delta candidate.
