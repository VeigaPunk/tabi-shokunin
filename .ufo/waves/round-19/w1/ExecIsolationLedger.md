# ExecIsolationLedger — round 19 wave 1

## Verdict

Implemented the isolation ledger checker and its `--self-test` in the seat clone. The self-test exercised one clean ledger and all six requested negative shapes; all seven cases passed. No tools were installed or updated.

## Behavior

`.ufo/waves/round-19/isolation/check-isolation.mjs` reads `.ufo/waves/round-19/isolation/ledger.json` relative to its repository root and requires schema `tabi-r19-isolation-ledger-v1`. It returns JSON and uses exit 0 for clean, 1 for evaluated findings, and 2 when evaluation is unavailable. It checks non-empty entry structure; absolute, unique clone paths resolved below `/fast/scratch/tabi-r19/`; unique `r19/<seat>` branch labels; the pinned baseline; commit-object presence in each clone; exact `git diff --name-only` path-set equality; and glob-aware changed-path assignment (`*`, `**`, `?`, and bracket classes). It compares porcelain-v1 lane snapshots as multisets and permits only changed status paths rooted at `.ufo/waves/round-19/`.

`--self-test` creates disposable Git clones under `/fast/scratch/tabi-r19/`, removes them after use, and writes `corpus/evidence/round-19/selftests/isolation.json` with the observed case outcomes and producer digest.

## Retained evidence

Command run: `node /fast/scratch/tabi-r19/ExecIsolationLedger/.ufo/waves/round-19/isolation/check-isolation.mjs --self-test`

Observed stdout: `{"selfTest":"pass","cases":7,"negativeShapes":6,"receipt":"corpus/evidence/round-19/selftests/isolation.json"}`

Receipt: `corpus/evidence/round-19/selftests/isolation.json` (schema `tabi-r19-isolation-selftest-v1`, verdict `clean`, exit 0; lines 2–9). The seven passing case records are at lines 10–71: clean glob assignment, shared clone, base drift, out-of-scope path, missing commit, lane drift, and duplicate branch.

SHA-256:
- Checker: `5c42b0af4cb1b88902a20aa81b72a1e6b822a34ebc62a0ab7abb36a42b7145a0`
- Self-test receipt: `69b753e9a06e9b7f51253a6b64245f18263d82582269250262736d3db32e7368`

LSP was unavailable in the exposed tool routes; no empty LSP response was treated as evidence of absent symbols. The normal ledger mode was not exercised because the lane's round-19 isolation directory contained only `lane-status-before-w1.txt` when inspected; `ledger.json` had not yet been assembled. No build, lint, formatter, or suite checks were run.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecIsolationLedger`
- Branch: `r19/ExecIsolationLedger`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `bb7230a6ebcf8340ca1bcb80faf5d3d462e3e7e3`
- Changed paths:
  - `.ufo/waves/round-19/isolation/check-isolation.mjs`
  - `corpus/evidence/round-19/selftests/isolation.json`
