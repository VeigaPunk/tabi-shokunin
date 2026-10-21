# ExecValidationHarness — round 19 W1 C1 hardening

## Result
Hardened `scripts/webmcp-validation-round19.mjs` against the current L1-integrated bytes while preserving the L1 field reader (unnamed controls are keyed `""`; button controls are excluded). Before editing, copied the current LANE harness (`e1b46c4833bc0e322e0d8e3f26fd00c8ce0e5eecb4c89f517d217511ded5a82f`) and current `corpus/evidence/round-19/validation/` tree into the isolated clone.

The harness now:
- Rejects any symlink component, canonical parent inside LANE/repository, or existing `--out` leaf.
- Loads direct regular non-symlink `.json` case files only; validates strict family/id slugs and requires the corresponding regular, non-symlink `<family>.html` fixture under the canonical fixtures directory.
- Snapshots fixture bytes and emits top-level `fixturesSha256` covering exactly every fixture the static server can serve.
- Checks Chromium 154.0.8037.97, Node `v24.21.0`, exact host-resolver deny and merged WebMCP enable-features tokens in the observed main-process argv; no `--chromium` option is accepted.
- Captures `Page.frameNavigated` from before fixture navigation and checks current main/subframe trees; any non-fixture-origin navigation fails the case. The initial Playwright-created main-frame `about:blank` bootstrap event is the only excluded event.
- Treats any blocked external request as an exit-1 finding, and fails a case on any download event or newly observed file under `processTmpDir/playwright-artifacts-*`.

## Verification and retained evidence
- Full copied LANE case corpus: **66/66 pass**, 0 failures, 0 findings, exit 0. Runtime identity: `Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0`. The receipt has 15 `casesFilesSha256` entries and 15 `fixturesSha256` entries; its 66 cases have no download events, artifact files, navigation violations, or blocked requests.
- Full receipt: `/fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/evidence/full-lane-66.json`, SHA-256 `8790e6845b90f47379c08a9d342293bc8cf1599256e0d78f23309ff0798bb404`.
- Producer: SHA-256 `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`; it matches the `producerSha256` in the retained receipts.
- (a) Output probes: canonical LANE path → exit 2 `out_inside_lane`; symlinked `/tmp` path component → exit 2 `out_symlink_component`; existing full receipt leaf → exit 2 `out_exists`.
- (b) Loader probes: invalid family, malformed ID, fixture-family mismatch, symlinked case JSON, and symlinked fixture each failed closed with exit 2 before Chromium launch. Exact commands and observed error messages are in `selftest-hardening/README.md`.
- (c) External request probe: exit 1, finding `external_request_blocked` for `https://example.invalid/blocked.png`; request was route-blocked, not fetched. Receipt `evidence/blocked-external.json`, SHA-256 `b5b30b60c197c96b5dc3e4e05fa259097a65683c28a601c733e29fbbac549b19`.
- (d) Data-URL subframe probe: exit 1, case failed with `navigation_outside_fixture_origin`; both frame-tree and `Page.frameNavigated` evidence report origin `null`. Receipt `evidence/navigation-violation.json`, SHA-256 `dbde94185366f953c2368bb8657ecf677a7d7f36f3ae29a8a41f7dea8cfef1bd`.
- Existing positive/negative smoke contract remains effective: valid declarative plus unknown-parameter cases passed 2/2 (exit 0; `evidence/smoke-pass.json`, SHA-256 `8d9d3979242fd0cb34061870f6e49f2985fd55bf6844dca04e5ff4e37a2e4d12`); deliberate wrong expectation failed 1/1 (exit 1; `evidence/smoke-fail.json`, SHA-256 `4f8fca3b15b62b7a815d10936623c8d3cdc76d2c8032c281b8182de2694d2df4`).

No tools were installed or updated. No build, lint, or formatter was run. The checks above are the requested end-to-end corpus run and negative probes.

## Risks and blockers
No commit was created. The fleet executor role prohibits committing and keeps integration/commit authority with L1, conflicting with the incoming request to create an “L1 integration base” commit and implementation commit. The clone contains the copied current LANE validation snapshot for testing; treat that subtree as test input, not as content to overwrite in LANE. No production receipt was written into LANE.

## Isolation
- Clone: `/fast/scratch/tabi-r19/ExecValidationHarness`
- Branch: `r19/ExecValidationHarness`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: none (seat is prohibited from committing; L1 remains sole integrator/committer)
- Current LANE validation snapshot copied into the clone for the required full run: `corpus/evidence/round-19/validation/` (15 case JSONs, 15 fixtures, 15 family probe records, `decisions.json`, and existing smoke directories).
- Authored implementation delta: `scripts/webmcp-validation-round19.mjs`; `corpus/evidence/round-19/validation/selftest-wrong/cases/wrong.json` (strict family/fixture/id alignment); `corpus/evidence/round-19/validation/selftest-hardening/**` (README, loader/output probes, two loopback fixtures/case files, retained symlink cases/fixture, and five JSON receipts).
