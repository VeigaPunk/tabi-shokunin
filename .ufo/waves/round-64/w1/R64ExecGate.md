# R64ExecGate: C2 receipt-provenance gate audit (round 64, wave w1)

Scope: `scripts/check-receipt-provenance.mjs` (frozen pin `947a595d…`, re-verified unchanged), claim C2 in `.ufo/waves/round-64/claims.json`. Freeze `0fc68043…`; baseline `6c19979f…`. Lane HEAD is `70f52f6a…` (freeze is an ancestor). Receipts: `.ufo/waves/round-64/w1/R64ExecGate/`. Scratch clone (freeze, `--shared`) was removed before yield.

## Summary

- The before-state reproduces exactly: 11 receipts / 34 failures. But the 34 are not one kind of failure. 16 are schema-label (11) or field-name (5 with matching bytes in the record dir) refusals, i.e. gate artefacts; 11 are unrecorded inputs; the rest are missing or unbound bytes and one real argv failure. Only 5 of the 11 receipts re-derive to their recorded digest when re-run at their own argv.
- The after-state target (0 failures on the scored population) is reachable without any re-execution. Relabelling the 16 `worktree` receipts to the freeze commit yields 0 failures. The two matrix receipts that cannot be re-derived are not counted at all.
- Eight checks audited: `argv-real`, `exit-int` (for truth), `matrix-input` and `matrix-command` are unsound; `stdout-bound` and `inputs-bound` are partial; `rev-committed` is existence-only; `schema` is a label. Full table in Verdict.
- Fabricated receipt that passes the frozen gate under the after-flags: §3.

## 1. Before-state reproduction

Commands (lane, read-only):
```
node scripts/check-receipt-provenance.mjs --selftest --scratch <scratch>/sf-selftest --json   # exit 0, 9/9   -> before/selftest.json
node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-63/controls --repo . --rev 6c19979fe63f3b9ec35179ca57bb91c6356bff25 --json   # exit 1 -> before/gate-before.json
node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-63/controls --repo . --json   # exit 1, identical -> before/gate-before-no-rev.json
```
Observed: `checked 11, failures 34, byCheck {schema 11, stdout-bound 11, inputs-bound 11, argv-real 1}`. The number is independent of `--rev` (no r63 receipt has a `rev` or `inputs` field that `--rev` could bind).

Per-receipt reading (each r63 `*.command.json`, read in full; "re-run" = executed with its recorded argv in a scratch clone at freeze):

| # | receipt | gate fails | what the record actually carries | re-derivation | classification |
|---|---|---|---|---|---|
| 1 | census-end | schema, stdout-bound, inputs-bound | digest `e153a7b6` = `controls/census-end.txt` (no `stdoutFile` field); no inputs | not re-run (fleet-root script, out of scope) | stdout: field-name artefact; inputs: real |
| 2 | census-start | same | digest `5612bc71` = `controls/census-start.txt`; argv points at a scratch clone `…/tabi-r63/before-clone` | not re-run | stdout: artefact; inputs: real |
| 3 | counter-data-run1 | schema, stdout-bound, inputs-bound | digest `b747dc90` = `controls/counter-data-run1.stdout`; no inputs (argv names corpus receipt + driver) | **re-run MATCH** (exit 0) | stdout: artefact; inputs: unrecorded but re-derivable |
| 4 | counter-data-run2 | same | digest `b747dc90` = `controls/counter-data-run2.stdout` | not re-run (same digest as run1) | as 3 |
| 5 | counter-selftest | same | digest `7d16c145` = `controls/counter-selftest.txt` | **re-run MATCH** | as 3 |
| 6 | gate-selftest | same | digest `4e1317ef` exists only at `round-63/w1/R63ExecGate/receipts/…out` (outside record dir) | **re-run MATCH** | stdout: bytes outside record dir; re-derivable |
| 7 | selfassessment-after | schema, stdout-bound, inputs-bound | no digest, no stdoutFile; inline `mismatches 0, clean true, counted []`; recorded `exit 0` | **re-run FAIL**: exit 1, `mismatches 1` (m3-unlanded-paths, observed 50) | real: not re-derivable |
| 8 | selfassessment-before | schema, stdout-bound, inputs-bound | no digest; argv is `bash -lc "… cp <lane>/…"` with a literal `<lane>` placeholder | **re-run FAIL**: `bash: line 1: lane: No such file or directory` | real; `argv-real` did not flag it (gate blind spot) |
| 9 | sources-gate | schema, stdout-bound, inputs-bound | digest `657a6eff` exists in no tracked file; no stdoutFile | **re-run MATCH** (exit 0, same digest) | record gap; re-derivable |
| 10 | stability-data | schema, stdout-bound, inputs-bound | digest `761dd641` = `round-63/w1/R63Critic/stability-clone.stdout` (outside record dir); `--out` JSON committed | **re-run MATCH** stdout; `--out` JSON differs only by absolute path | record gap; re-derivable |
| 11 | stability-direct | schema, argv-real, stdout-bound, inputs-bound | argv `python3 -c "python3 inline: verify each…"`; no digest, no inputs | not re-derivable (inline script never recorded) | real (argv + stdout + inputs) |

Totals for the 34: **schema 11** are a label refusal (the gate hard-codes `tabi-command-receipt-v1`; no content judgment). **stdout-bound 11**: 5 receipts have matching bytes in the record dir and fail only because the gate reads a `stdoutFile` field the r63 format never wrote (artefact); 2 have bytes outside the record dir; 1 has bytes absent everywhere; 3 have no digest. **inputs-bound 11**: no r63 receipt records any input; real for all 11 (counters name corpus files in argv but bind none). **argv-real 1**: real.

Of 11 receipts: 5 re-run to the recorded digest, 3 fail re-derivation (selfassessment-after/before, stability-direct), 3 not re-run.

## 2. Per-receipt soundness of the r64 population (16 receipts)

All 16 r64 control receipts (`controls/*.command.json`) are `rev: "worktree"`. Checks run on each:

- `stdoutFile` digest matches on all 16 (`reexec/stdout.sha256`; gate run `after/r64-controls-as-recorded.json`).
- Every input resolves with its recorded digest at freeze bytes (clone check and `after/r64-controls-lane-worktree.json`, 0 failures).
- argv target script exists on all 16.
- Re-run (own scratch, recorded argv):
  - `counter-selftest` (r64 counter): exit 0, digest MATCH (`reexec/counter-selftest.*`).
  - `gate-selftest`: exit 0, digest MATCH (`reexec/gate-selftest.*`).
  - `mutants-matrix`: **exit 1**, recorded 0 (`reexec/mutants-matrix.exit`, stderr `EISDIR`). Its `stdoutSha256` equals `mutants.stdout` (`c698c6cb…`), i.e. a copy.
  - `negatives-matrix`: **exit 1**, recorded 0 (`reexec/negatives-matrix.exit`). Its digest equals `negatives.stdout` (`fcf22093…`), i.e. a copy.
  - The frozen `mutate-r64.mjs` has no `--matrix-alias` option. Its `run` path reads `--counter/--negatives/...` and `path.resolve('')` yields a directory (EISDIR). These two receipts name a command that cannot produce them.
  - Not re-run: `mutants`, `negatives`, `red-*`, `live-*`, `smoke-live`, `counter-smoke` (long or browser-bound; the stdout digest bytes are present and match).
- **The gate counts 0 of the 2 matrices** (`matrices: 0` on `.ufo/waves/round-64/controls`), though `mutants-matrix.json` and `negatives-matrix.json` are present (see F1).

## 3. No-work fabrication attempt (exact receipt)

Target: pass the gate's after-flags with nothing executed. Files in `w1/R64ExecGate/fabrication/`:

`fabricated.command.json` (argv target does not exist; never run; stdout hand-written; `rev` = freeze commit):
```json
{
 "schema": "tabi-command-receipt-v1",
 "name": "fabricated-never-ran",
 "argv": ["node", "scripts/does-not-exist-r64-fabricated.mjs", "--json"],
 "cwd": "/fast/scratch/hyaku/tabi-r64/R64ExecGate/clone",
 "exit": 0,
 "stdoutFile": "fabricated.stdout",
 "stdoutSha256": "b01698c27fe6271965d8d22517cc4f34bc10ac5909e6341c5fab6ba55b56a127",
 "inputs": [{"path": "scripts/check-receipt-provenance.mjs", "sha256": "947a595d65f6ad3f5259f5421d897d42720dc3dc05d039da8ec3619d00e49246"}],
 "rev": "0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741"
}
```
`fabricated.stdout` = `{"schema":"tabi-fabricated","ok":true,"note":"never executed"}` + newline (63 bytes; its sha is the `stdoutSha256` above).

`matrix-fake.json` (input sha is `aaaa…`, which matches no bytes; input path is not resolved) plus `matrix-fake.command.json` (same fabricated argv).

Command and result:
```
node <frozen gate> --dir w1/R64ExecGate/fabrication --repo <lane> --rev 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741 --require-committed --min-receipts 2 --json
# exit 0: checked 2, matrices 1, failures 0, ok true   -> fabrication/gate-output.json
```
So a receipt with a nonexistent argv target, invented stdout, and a placeholder matrix input passes the committed-revision after-flags. The gate cannot see: argv target existence, the exit actually produced, whether stdout came from any run, or whether a matrix's input bytes match.

## 4. Gate negatives and the clean case

- `--selftest`: 9 cases (`clean` + one per entry in `CHECK_IDS`), verdict clean, 9/9 (`before/selftest.json`). Case count matches the claim.
- The per-case predicate is `res.findings.some(f => f.check === id)`, not "exactly this check". The `matrix-input` case also fires `matrix-command`; the `rev-committed` case fires 3× (the good and matrix-good fixtures also carry `rev: worktree`). Negatives are "at least one", not "one per check".
- Blanket-refusal control (scratch copy with one line added to `checkReceipt` that always pushes a finding; `w1/R64ExecGate/blanket/`): selftest `verdict red, passed 8/9, failing = clean`. The clean case is the only thing that catches a blanket refuser; the other 8 negatives all pass for it. So the negatives discriminate refusal, not detection; only the clean case does.
- The `rev-committed` path with a real 40-hex commit (the `git show` / `cat-file` branch) is not exercised by any selftest case.

## 5. Findings

1. **[high] Matrix files are silently excluded from the gate.** `evaluate()` selects matrices with `/^matrix.*\.json$/`, which never matches `mutants-matrix.json` or `negatives-matrix.json`. Evidence: `after/r64-controls-lane-worktree.json` (`matrices: 0`), while the files are present in `.ufo/waves/round-64/controls/`. Command: `node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-64/controls --repo . --rev 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741 --json`.
2. **[high] Two r64 matrix receipts are not re-derivable.** `mutants-matrix.command.json` and `negatives-matrix.command.json` record `exit 0` for `mutate-r64.mjs run --matrix-alias …`. The frozen counter rejects the flag and crashes (EISDIR), exit 1. Their stdout bytes are copies of `mutants.stdout` / `negatives.stdout`. Evidence: `reexec/mutants-matrix.{exit,stderr}`, `reexec/negatives-matrix.{exit,stderr}`. Command: `node .ufo/waves/round-64/counters/mutate-r64.mjs run --matrix-alias mutants-matrix; echo $?`.
3. **[high] The CLI `--rev` binds nothing.** `checkReceipt(file, repo, rev, …)` never reads `rev`; it reads `r?.rev` from each receipt. The claim's after-command `--rev <DATA_REV>` only labels the output. Probe A: receipt `rev` = freeze commit, CLI `--rev 1111…` (not a commit) → `failures 0`. Command: `node scripts/check-receipt-provenance.mjs --dir <dir with one receipt> --repo . --rev 1111111111111111111111111111111111111111 --json`.
4. **[high] The after-target is reachable without re-execution.** All 16 r64 receipts are `worktree`. Changing only the `rev` label to the freeze commit (no re-run) makes `--require-committed` report `checked 16, failures 0, ok true` (`after/r64-scored-rev-rewritten.json`). Without the relabel, the same population fails 16/16 `rev-committed` (`after/r64-controls-require-committed.json`, exit 1). The content match I did verify (§2) is real, but the 0 is produced by label, not by a run at a committed revision.
5. **[high] No-work fabrication passes** (§3). Evidence: `fabrication/gate-output.json` (`checked 2, failures 0`), `fabrication/fabricated.command.json`, `fabrication/matrix-fake.json`.
6. **[medium] `argv-real` does not check the argv target and misses a placeholder.** It allows argv0 in `{node,python3,bash,sh,curl,git}` and rejects only prose markers. The fabricated `scripts/does-not-exist-r64-fabricated.mjs` passes; the r63 `selfassessment-before` `<lane>` placeholder (`bash -lc "…cp <lane>/…"`) passes too, although it fails when executed. Command: `cd <lane> && bash -lc 'cp <lane>/.ufo/waves/round-62/w1/R62Scout/commands.json /tmp/…'` (the `<lane>` redirection fails before any write; no file was created).
7. **[medium] `exit-int` is a type check.** Recorded exit vs actual exit is never compared. Evidence: finding 2 (matrix receipts), and `selfassessment-after` (recorded `exit 0`, re-run exit 1).
8. **[medium] `stdout-bound` is not revision-bound and does not require committed bytes.** The stdout file is read from the record directory on disk, never at `--rev`. `--require-committed` checks only that the commit exists, not that the stdout file is in it. The r63 `sources-gate` and `stability-data` bytes are not in the record dir (see §1).
9. **[medium] `matrix-input` and `matrix-command` are shape/existence checks.** `matrix-input` requires a 64-hex sha and a string path; `matrix-command` requires only that `<name>.command.json` exists. The input path is never resolved and its sha is never compared. `fabrication/matrix-fake.json` (`aaaa…`) passes.
10. **[medium] Negatives are "at least one", and a blanket refuser passes 8/9.** See §4. Evidence: `blanket/selftest.json`, `blanket/blanket-gate.mjs` line 40 (the added always-refuse line).
11. **[medium] A receipt with no `rev` silently binds to the worktree.** Probe C: a receipt with no `rev` and valid inputs → `failures 0` without `--require-committed`; with it, `rev-committed` fails. The claim's command includes `--require-committed`, so this is only reached without it. Command: `node scripts/check-receipt-provenance.mjs --dir <dir> --repo . --json`.
12. **[medium] `selfassessment-after` is not re-derivable.** Its inline result (`mismatches 0, clean true`, recorded `exit 0`) does not reproduce at its own argv at freeze: exit 1, `mismatches 1` (m3-unlanded-paths, observed 50). `check-selfassessment.mjs` compares against worktree bytes (its header lines 72–74), so the result depends on the tree. The gate refuses it, correctly, for digest/input reasons; the inline fields are invisible to it.
13. **[low] Schema check is a label.** All 11 r63 receipts fail on `schema=tabi-r63-control-v1` alone. This inflates the before-count by 11 and says nothing about provenance.
14. **[low] `stderrFile` / `stderrSha256` are never read.**
15. **[info] Post-freeze drift in the lane's controls directory (not in the gate's receipt population).** `git status --porcelain` on frozen paths: ` M .ufo/waves/round-64/controls/census-start.txt`, `?? .ufo/waves/round-64/controls/census-end.txt`, `?? .ufo/waves/round-64/controls/record-command.mjs`. The frozen pins I checked are unchanged. Flagged for the L1.
16. **[info] Process disclosure.** I wrote three fabricated files and a blanket-gate copy into my own scratch clone and into `w1/R64ExecGate/`. The clone's `controls/` dir therefore holds my two fabricated receipts; any count taken from that clone (e.g. "checked 18") includes them. The lane's own controls count (16 / 0 matrices) is in `after/r64-controls-lane-worktree.json`.

## Verdict

**Per-check soundness:**

| check | verdict | why |
|---|---|---|
| schema | sound, trivial | format label only; refuses r63 by label (11) |
| argv-real | **unsound** | passes a nonexistent script (§3) and the `<lane>` placeholder (finding 6) |
| exit-int | **unsound for truth** | type only (finding 7) |
| stdout-bound | partial | digest of a record-dir file; not revision-bound; committed bytes not required (finding 8) |
| inputs-bound | partial | sound only for a 40-hex receipt `rev`; CLI `--rev` ignored (finding 3); `rev`-less receipts bind to the mutable worktree (finding 11) |
| rev-committed | shallow | commit existence only |
| matrix-input | **unsound** | shape only (finding 9) |
| matrix-command | **unsound** | file existence only; r64 matrices not even discovered (findings 1, 9) |

**Before-state (11 / 34):** real as a count, but the failures are mostly artefacts (schema label, field-name) plus unrecorded inputs. Of the 11 receipts, 5 re-derive to their recorded digest, 3 do not, 3 were not re-run.

**"0 failures at the scored population": gameable, not a calibration improvement as stated.** Real content: the 16 r64 receipts' stdout and input digests do match freeze bytes (§2). But the gate reaches 0 by a label change (finding 4), counts 0 of the 2 matrices that cannot be re-derived (findings 1–2), and cannot see exit codes or argv targets (findings 5–7). The claim's "every scored receipt names a committed revision" is met only by relabelling. The gate is frozen, so this cannot be repaired in-round; the L1 should score C2 with these limits, or re-issue each scored receipt by re-running it at a committed revision and count the matrices explicitly.

Checks the main agent should run: the frozen selftest and before-run commands in §1 (reproduce exactly), and `node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-64/controls --repo . --rev 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741 --json` (expect `matrices: 0`).

Tooling: no installs or updates were made by this seat; pacman was not touched.
