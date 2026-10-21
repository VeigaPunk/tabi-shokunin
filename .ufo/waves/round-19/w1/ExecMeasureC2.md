# Round 19 C2 counter — ExecMeasureC2-4

**Verdict:** implemented the revised `c2_h4_properties` counter and coverage probes. Requested self-test passes 28/28. B returns `c2_h4_properties=0`. The available REV probe also returns 0 because the only committed invoke artifact at that revision is round 18; the round-19 harness is present only as an untracked LANE file, so its 0→2 target result is not yet measurable from a commit.

## Behavior delivered

- Selects the newest tracked invoke artifact and the freshness witness, then creates detached `git clone --no-hardlinks` sandboxes at B and the supplied revision.
- **H4a:** keeps a clean run, then injects a random-UUID filename with non-marker bytes after the round-19 download scan's before-snapshot (round-18 mutant uses its download-case marker point). Requires the clean receipt to pass with zero new files, and the mutant receipt to fail with the UUID path listed under a `playwrightArtifacts` scan root while the browser is alive. The B arm records whether the round-18 H4 predicate would still credit the real-browser mutant receipt.
- **H4b:** runs a real-browser source receipt, loads that replay fixture, then generates a fresh 128-bit nonce and runs a clean receipt. Requires the current page download record to echo that nonce, the invocation/response/refusal evidence to be present, the receipt to pass with zero new files, and the prior receipt's original nonce to be rejected. The B arm records whether the round-18 H4 predicate credits the prior real-browser receipt.
- **Informational H1 coverage:** tests SIGINT and SIGHUP independently after the first case line; requires nonempty run-owned Chromium identities containing PID, `/proc` starttime, and executable path before the signal; requires exit 2, `run_aborted`, no pass/fail receipt, and an empty identity set after cleanup.
- **Informational F6 coverage:** checks HEAD, `@`, `master`, 7-hex short hash, and off-branch full hash for exit 2 plus `finding=witness_revision_refused` and the exact shape-correct detail. Also checks an accepted full-revision positive control. Reports both B and revision results under `coverage.h1` / `coverage.f6`; they do not contribute to `c2_h4_properties`.
- Self-test mutants include a nonce-echoing record with no invocation and an idle-browser H1 shape; both are rejected.

## Exact retained evidence

- `node .ufo/waves/round-19/measure-c2.mjs --self-test` → `tabi-round19-c2-selftest-v1`, `verdict=pass`, 28/28. Receipt: `corpus/evidence/round-19/selftests/c2.json`. Producer SHA-256: `a8003530f0a7b95ef830f3eeb6fa6d9d9b420855396beea8911ac02ea1ec53a1`.
- B probe at `66251bfc1aef393e4aec599e950a8deb867736bb` → `c2_h4_properties=0`, `evaluationStatus=complete`. B artifact: `scripts/webmcp-invoke-round18.mjs` SHA-256 `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`; witness: `scripts/freshness-witness.mjs` SHA-256 `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1`.
- B H4 baseline evidence: the round-18 counter predicate credits the real-browser prior receipt and the UUID mutant (`legacyCounterWouldCreditPriorRecord=true`, `legacyCounterWouldCreditMutant=true`). Under the round-18 harness the mutant run still exits 0 with `verdict=pass`; no `downloadScan` path is present. The page download record is absent, and the strict nonce/clean-scan conditions therefore do not pass.
- B H1 informational coverage passed for both signals. SIGINT observed `{pid:624445,starttime:"6701670",exe:"/usr/lib/chromium/chromium"}` before signaling; SIGHUP observed `{pid:624620,starttime:"6701769",exe:"/usr/lib/chromium/chromium"}`. Each exited 2 with `run_aborted`, no pass/fail receipt, and an empty post-cleanup identity set.
- B F6 informational coverage passed all five refusals: symbolic/short forms emitted `--rev requires a 40-hex commit revision`; the off-branch full hash emitted `--rev must be an ancestor of refs/heads/master`; all included `finding=witness_revision_refused` and exit 2. The full current revision positive control exited 0 and printed `source=--rev`.
- Available REV probe at `efbcf2139f1a37942a03514267972415e9be1fe1` → `c2_h4_properties=0`, `evaluationStatus=complete`. That committed revision also selects only the round-18 invoke artifact and the existing freshness witness; its H1 and F6 informational coverage passed in both B and revision arms. Chromium `154.0.8037.97`, Playwright `1.64.0`, Node `24.21.0` were observed.

## Risks and blockers

- LANE HEAD remains B, and read-only `git status --short` showed `?? scripts/webmcp-invoke-round19.mjs`; no committed REV containing the new harness was available. Therefore the target round-19 H4a/H4b green arm and the requested 0→2 result remain unobserved. The counter and mutant execution are ready, but L1 must run it at a committed revision containing the round-19 harness.
- No JavaScript LSP route was exposed in the mounted tool inventory. No tools were installed. No build, lint, formatter, or broader suite was run; only the requested self-test and B/available-REV counter probes were exercised.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecMeasureC2-4`
- Branch: `r19/ExecMeasureC2-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- L1 integration-base commit: `3a8e46cdf6d042cc33f0d745ea42d2abe7fabec1`
- Implementation commit: `efbcf2139f1a37942a03514267972415e9be1fe1`
- Changed paths:
  - `.ufo/waves/round-19/measure-c2.mjs`
  - `corpus/evidence/round-19/selftests/c2.json`
