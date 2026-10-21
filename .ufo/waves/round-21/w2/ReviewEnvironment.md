# ReviewEnvironment — round 21 w2

Axes reviewed: retained Node refusal, successful pinned acquisition, and recorded-versus-enforced runtime identity.

## Findings

### Low — The retained Node refusal does not identify the rejected Node version

`.ufo/waves/round-21/runtime-execution.json:5-17` preserves a failed invocation with `argv[0]` equal to bare `node`, `exit: 1`, and `node_version_mismatch`, but no resolved executable, `process.version`, or environment/PATH snapshot. The matching historical producer (`.ufo/waves/round-21/history/webmcp-lifecycle-v1.mjs:78-81`) rejects every version other than `v24.21.0`, so the record establishes that the guard rejected the process, not which concrete version was rejected. Keep this refusal distinct from the later successful run; do not claim a specific rejected version from this record. Capturing `process.execPath` and `process.version` on the refusal path would make that attribution reproducible.

### Low — The Node-version predicate has no Node-only negative control

`.ufo/waves/round-21/measure-c1.mjs:47-49` checks the recorded Node version together with Chromium, Playwright, and flags in one environment finding. `.ufo/waves/round-21/selftest-c1.mjs:44-45` mutates only flags or Chromium; `.ufo/waves/round-21/fixtures/expected.json:117-120` expects `wrong-build` to produce `environment`. That case still fails on its Chromium mismatch if the Node sub-predicate is removed, so a regression deleting only `environment.node !== 'v24.21.0'` is not independently caught by the checked-in controls. Add a Node-only corrupt-receipt control if this pin is intended to be regression-tested.

## Current acquisition checked

- `.ufo/waves/round-21/runtime-execution-bounded.json:5-18` records the explicit executable `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, the producer and `--out .ufo/waves/round-21/runtime-bounded-candidate` arguments, `exit: 0`, and producer digest `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`.
- The read-only SHA-256 check of `scripts/webmcp-lifecycle-round21.mjs` returned that same digest. The current producer enforces exact `process.version === 'v24.21.0'` before creating the output (`scripts/webmcp-lifecycle-round21.mjs:124-128`), then records `process.version` and the producer-file hash (`:146`). `corpus/evidence/round-21/runtime/receipt.json:4-11` contains the same hash and `environment.node: v24.21.0`; a direct `--version` check of the recorded executable returned `v24.21.0`.
- The older `runtime-execution-pinned.json` is explicitly historical first acquisition, not the current runtime (`.ufo/waves/round-21/history/index.json:2-7`). Its `a273fe…` producer digest matches the archived v1 producer; the current bounded acquisition is separately mapped as current at `history/index.json:21-24` and has the distinct current digest above. The retained refusal uses the same old digest as that archived v1 run, not the current bounded producer. Thus the refusal and successful pinned run remain distinct evidence; the current successful acquisition's recorded version agrees with its exact source guard and digest.
- The counter's Git input set (`.ufo/waves/round-21/measure-c1.mjs:24-28,104-110`) does not include the external execution envelope. Exact `argv` is therefore verified here against the retained envelope and relocation map, not enforced by the C1 metric itself. The history map documents the candidate-to-canonical output relocation (`history/index.json:21-24`).

## Verification gaps

No LSP device is mounted (`read xd://lsp` returned “No such tool”), so references/definition/diagnostics were unavailable; no grep fallback was used. No builds, tests, linters, formatters, or runtime executions were run. No tools were installed or updated.