# ReviewExecutionProvenance

## Findings

### P2 — LOG.md points at a superseded acquisition as current

`LOG.md:1387-1392` says `runtime-execution-final.json` names the current producer and successful output renamed to `corpus/evidence/round-21/runtime/`. The wave history index contradicts that pointer: `history/index.json:15-19` classifies `runtime-execution-final.json` as historical navigation-qualified v3 and relocates its output to `history/runtime-v3/`; lines 21-24 designate `runtime-execution-bounded.json` as the current acquisition and map its output to the canonical runtime directory. The records distinguish the bytes: final has producer SHA `847d0467…` (`runtime-execution-final.json:11-14`), while bounded has `5363d576…` (`runtime-execution-bounded.json:9-15`), which matches the canonical `receipt.json:4-6`. A reader following LOG.md can attribute the current evidence to the superseded v3 run instead of the bounded run.

## Candidate-pair assessment

- `runtime-execution.json:3-16` records revision `e7cf11a…`, `measuredRevision: uncommitted`, producer SHA `a273fe77…`, and exit 1 with `node_version_mismatch`; its argv uses `node` (`:5-10`). The archived producer matching that SHA checks `process.version` at `history/webmcp-lifecycle-v1.mjs:78-81`, before checking/creating the output directory, so this is a preflight refusal, not an observed lifecycle failure.
- `runtime-execution-pinned.json:3-17` records the same revision, uncommitted status, and producer SHA, but invokes the explicit Node v24.21.0 binary (`:5-10`) and exits 0 with 12 observations and clean browser/server closure (`:14-17`). `history/index.json:2-7` explicitly maps it to the historical first acquisition, v1 producer, and `history/runtime-v1/`; that receipt independently records the same producer SHA and Node v24.21.0 (`history/runtime-v1/receipt.json:2-11`). Thus an assertion that no earlier **worktree producer snapshot** ran is contradicted by this successful v1 acquisition. It is not evidence of a different Git revision: the pair, and the ordered/final/bounded acquisition records, all report revision `e7cf11a…` and `measuredRevision: uncommitted` (`runtime-execution-ordered.json:3-4`, `runtime-execution-final.json:3-4`, `runtime-execution-bounded.json:3-4`).

## Residual risk

The `revision` field identifies the same base commit across these records, while `measuredRevision: uncommitted` does not identify the complete worktree state. The producer SHA distinguishes the recorded producer snapshots, but these fields do not establish a separate earlier Git-commit run or pin every worktree input. Keep “earlier producer snapshot” distinct from “earlier Git revision.”

## Verification gaps

Read-only artifact/source inspection and SHA-256 comparison only; no build, test, lint, formatter, browser, or production mutation was performed. The LSP device is not mounted (`read xd://lsp` returned “No such tool”); no grep-based semantic claims were made. No tools were installed or updated.