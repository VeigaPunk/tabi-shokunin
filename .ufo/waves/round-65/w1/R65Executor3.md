# R65Executor3: command-receipt runner for the round-65 controls

Base revision: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162. Scope: the runner only. No scored pass was run.

## Deliverables

| path (lane-relative) | sha256 |
|---|---|
| `.ufo/waves/round-65/w1/R65Executor3/run-controls-r65.sh` | `6e7f1510fb08a93f97623360c5a150989bad9ceaa698be8d8cf20fa0490ced79` |
| `.ufo/waves/round-65/w1/R65Executor3/dry-run/producers.json` | `d247ab618926ccc86d179d5eff7320cc3d1c7249ef84bddace96b37e75f60390` |
| `.ufo/waves/round-65/w1/R65Executor3/dry-run/SHA256SUMS` | `1eae6cae773882f75e8cdc35d60178bc59b5e33022b3520b7245e1cf9c9a0ff4` |

The dry-run dir holds 38 files: nine `<name>.command.json`, nine `.stdout`, nine `.stderr`, nine `matrix-<name>.json`, `producers.json`, `SHA256SUMS`. Its size is 176K.

## Usage

```
bash .ufo/waves/round-65/w1/R65Executor3/run-controls-r65.sh --rev <40-hex> --out <absolute dir>
```

Exit codes: `0` every control ran and every input resolved at `--rev`. `3` receipts were written, but at least one input is absent at `--rev`, so they are not freeze-valid. `2` usage or precondition failure; nothing is written.

Preconditions, checked before any control runs: lane HEAD equals `--rev`, and every input committed at `--rev` is byte-identical in the worktree. A dirty committed input refuses with exit 2 and writes nothing. Verified by tamper test.

## Controls run

| name | instrument | argv tail | expected at freeze |
|---|---|---|---|
| C1-A | v22 | forgery delta `delta-dup-contradiction.tsv` | exit 1, `delta-disposition-conflict` |
| C1-B | v22 | `real-conflicting-delta.tsv` | exit 1 (claims-draft: dropped if no same-key conflict) |
| C1-C | v22 | `corpus/adjacency-host-delta-r62.tsv` | exit 0, findings [] |
| C1-DN-A | v21 | forgery delta | exit 0 (false green) |
| C1-DN-B | v21 | `real-conflicting-delta.tsv` | exit 0 (false green) |
| C2-A | v2 | `c1-fab`, min 12 | exit 1, `matrix-input` = 2 |
| C2-B | v2 | `round-64/controls/scored`, rev e3f5215, min 12 | exit 0, failures 0 |
| C2-C | v2 | `w1/R65Executor2/c1-honest`, min 1 | exit 0 |
| C2-DN | v1 | `c1-fab`, min 12 | exit 0 (matrix forgeries accepted) |

C1-DN-B is an addition beyond the assignment's list. claims-draft requires the do-nothing control on both A and B ("2 false greens of 2"), so I added it.

## Dry run

Run in a scratch clone at base with `--out` inside that clone. Results:

- C1-A, C1-B, C1-C, C2-A, C2-B, C2-C exit 1. The instruments `c1-adjacency-host-v22.mjs` and `check-receipt-provenance-v2.mjs` are not committed at base, so node fails with `Cannot find module`.
- C1-DN-A exit 2. Its delta fixture is uncommitted at base; v21 reports `ENOENT`.
- C2-DN exit 2. Its `c1-fab` dir is uncommitted at base.
- C1-DN-B exit 0, `predicate=true`, `findings=0`. This is the expected v21 false green.
- Runner exit 3: 11 input rows absent at base.

Checks on the final run: all 19 JSON files parse. 334 input rows re-derive from `git show` with matching sha256. All 9 matrix `input.sha256` values match their named receipt bytes. Stdout digests match.

Refusal paths tested: `--rev` not 40-hex (exit 2); `--rev` differs from HEAD (exit 2); relative `--out` (exit 2); tampered committed input (exit 2, no files written). A rerun on the earlier version produced byte-identical receipts for C2-B and `producers.json`.

Run count: the runner was executed twice in the clone. The first version wrote C1-A and C1-B before aborting on a tampered input at C1-C. I fixed that by moving the worktree guard into a pre-pass. The delivered version is the second run; its output is in `dry-run/`.

## Defects and decisions for L1

1. **v22 and v2 are not in the lane.** Both instruments are absent at base. The runner names them by the claims-draft paths; they must be committed before the freeze run or C1-A/B/C and C2-A/B/C will exit 1 with unresolved inputs.
2. **C2-C path differs from claims-draft.** The assignment gives `.ufo/waves/round-65/w1/R65Executor2/c1-honest`. claims-draft says `.ufo/waves/round-65/controls/c1-honest`. The runner uses the assignment path; it is the `HONEST_DIR` variable at the top of the script.
3. **C2-B positive control is not the e3f5215 bytes.** At base, 49 of the 318 files under `round-64/controls/scored` differ from their e3f5215 versions. The runner hashes the dir at `--rev` because the v2 gate reads the worktree. If the freeze intends the r64 scored population as committed at e3f5215, the dir must be restored to e3f5215 bytes before freeze, or C2-B will test different bytes.
4. **Fixtures are uncommitted.** `controls/`, `counters/`, and the round-65 files are untracked at base. The runner records them as unresolved (exit 3) rather than hashing uncommitted bytes. They must be committed before the scored run.
5. **Matrix files and the matrix-command check.** I wrote `matrix-<name>.json` for all nine controls, since the assignment does not restrict "matrix controls" further. v1 and v2 also require a sibling `matrix-<name>.command.json` for each matrix (`matrix-command` check). The runner does not write those, because the spec names only two outputs. If the gate is run over this out dir, expect nine `matrix-command` findings. Decide at freeze whether to add that receipt.
6. **Reads not enumerated.** Each control's inputs are the paths its argv names; the runner checks that every path-like argv value is listed. It does not hash files an instrument reads on its own (its imports, and `--fleet` sibling repos at `/home/vgpnk/Projects/shokunin`, which are outside the lane). C2-B's 318-file dir is hashed; the v2 gate's own reads of each receipt's inputs at their `rev` are not.
7. **Receipt `cwd` is `"."`**, relative to the lane root, so receipts do not embed the machine path.

## Tooling

No installs. Used existing `bash` 5.3.20, `git` 2.56.0, `sha256sum` 0.8.0 (coreutils), and `node` v24.21.0. No pacman transactions.

## Host and scratch

Scratch clone `/fast/scratch/hyaku/tabi-r65/R65Executor3/clone` was removed by the shell trap on exit. Nothing was written to `/tmp`, the fleet root, or any sibling repo. No git commit, push, or mutating git was run in the lane. No subagent was dispatched.

## Check for the L1

`bash .ufo/waves/round-65/w1/R65Executor3/run-controls-r65.sh --rev <REV> --out <abs dir>` at the freeze revision. Expect exit 0 only after items 1, 2 and 4 are resolved.
