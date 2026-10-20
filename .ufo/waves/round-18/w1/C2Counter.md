VERDICT: PASS

## Axes and scope
C2 targets **operability**. The normal receipt also has a counter-owned retained-coverage floor: the 11 original cases, four original controls, and the new download case must each be uniquely present and passing. No hazard receives credit if this floor fails.

## Findings

- Added `.ufo/waves/round-18/measure-c2.mjs` as a self-contained revision counter. It selects the highest-numbered committed `scripts/webmcp-invoke-round*.mjs`, clones the lane with `git clone --no-hardlinks`, checks out the resolved commit detached, points sandbox `refs/heads/master` at that commit, and removes the sandbox and fresh short `/tmp/mc2-*` probe TMPDIRs afterward. `--worktree-artifact` and `--worktree-wrapper` copy overrides into the clone and explicitly label output `mode:"worktree"` / `rev:"worktree:<baseRev>"`.
- Git reads use an isolated environment with `GIT_NO_REPLACE_OBJECTS=1` (`measure-c2.mjs:122-135`). The receipt must name the expected producer path and its top-level and nested producer SHA-256 must equal the SHA-256 of the selected artifact (`:606-644`).
- Browser-dependent hazards share an observed-run evidence gate (`:647-696`, `:716-884`): all three receipt launch PIDs must match live `/proc`-observed Chromium main PIDs, exact effective argv, and the observed executable path/device/inode/SHA-256. The receipt's per-run and runtime executable identity must match those observations. The executable SHA is streamed from the observed executable file; no binary is loaded into memory.
- H1 distinguishes a real first-case signal probe from startup exit 2: it checks the child is alive, SIGTERM succeeds, `run_aborted` plus the signal name is observed, exit is 2, no pass/fail receipt exists, and no TMPDIR process remains at five seconds. H2 separately probes SIGINT, ordinary completion, and a sandbox-only watchdog copy with only `RUN_TIMEOUT_MS` changed from 420000 to 6000; the changed declaration and before/after artifact hashes are emitted. H3 polls `/proc`, `ss -H -ltnp`, and `DevToolsActivePort` for the full normal run. S1 checks the effective main-process argv for one enable switch, at most one disable switch, all intended Playwright-default/harness features, and all three launch roles; renderer/utility child argv are not misclassified as launch argv.
- H4 requires the live download-case line, a `WebMCP.invokeTool` request for `download-blob`, a completed response, one mirrored settled refusal event, complete zero-match before/after-close scans, and no fixture-named TMPDIR file observed live or after exit. It uses only the marker prefix and 64-hex marker digest; raw marker bytes are not retained. The pinned Playwright 1.64.0 deny-mode `failure()` diagnostic (`Pass { acceptDownloads: true } when you are creating your browser context.`) is accepted as the observed refusal outcome; arbitrary non-null strings are not.
- F6 remains explicitly **wrapper-scoped** (`:885-929`): the counter detaches HEAD on an off-branch poison commit, checks the wrapper rejects `--rev HEAD`, and checks `--dry-run` prints master. The byte-frozen direct `scripts/check-freshness.mjs --witness HEAD` route remains callable; the counter does not claim global closure.
- The normal receipt is removed with its sandbox. Output includes its full-byte SHA-256, producer path/digest, and observed Chromium/Playwright/Node identity (`:972-1025`); no new `--receipt-out` CLI was added.

## Counter-owned self-test

Command:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs --self-test
```

Observed: exit 0; `{"schema":"tabi-round18-c2-selftest-v1","verdict":"pass","cases":26,...}`. The 26 stub cases include H1 live-signal vs startup-exit2 discrimination; H2 normal/SIGINT/watchdog residue; H3 TCP port and browser-owned listener; H4 refusal, accepted bytes, and Playwright's deny diagnostic; S1 merged-feature preservation and launch-vs-renderer selection; coverage-floor rejection; producer-digest/path mismatch; a passing fabricated receipt with no observed browser (H4 and shared H1/H2/H3/S1 credit are rejected); Git replacement-ref suppression; and both F6 outcomes. Self-test code: `measure-c2.mjs:1167-1460`.

## Red-before measurement at B

Command:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
```

Observed one-line JSON, exit 0 (evaluated):

```json
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c","c2_hazards_closed":0,"hazards":{"h1":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=false, exit=1, pass/fail receipt=fail:/tmp/tabi-r18-mc2-qS6w34/.ph-LqqC2m/r.json, surviving TMPDIR processes=0"},"h2":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=false), watchdog=true (empty=false, browser argv=4)"},"h3":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); normal run completed=true, observed browser argv=5, --remote-debugging-port seen=true, DevToolsActivePort seen=true, ss scans=85 available=true, browser-owned listeners=3"},"h4":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); case unique=false, pass=false, case line observed while process live=false, actual invoke attempt=false (marker prefix+sha=false, request=false, invocationId=false, no error=false, responded=false, output=false, fields=none), one settled refusal event=false, pre-close scans clear=false, post-close scans clear=false, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); observed launched browser argv=3, required launch roles missing=none, feature-union violations=2 ([{\\\"pid\\\":364646,\\\"role\\\":\\\"flagged\\\",\\\"enable\\\":2,\\\"disable\\\":1,\\\"missing\\\":[],\\\"repeated\\\":[]},{\\\"pid\\\":560831,\\\"role\\\":\\\"domain-disabled\\\",\\\"enable\\\":1,\\\"disable\\\":2,\\\"missing\\\":[],\\\"repeated\\\":[]}])"},"f6":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); scripts/freshness-witness.mjs absent or not a regular file at the revision"}},"artifact":"scripts/webmcp-invoke-round17.mjs","artifactSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","counterSha256":"6ffa52d2e93eee819983b1ee9cbeb4500959c98999cb99c042850285096f8671","receiptSha256":"0f4431f55f9cf3fdd386dba3ba29dbd1f5e28dcc8e40df82ca6910d03601748","producerPath":"scripts/webmcp-invoke-round17.mjs","producerSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","runtimeIdentity":{"chromium":{"launchPath":"/usr/bin/chromium","realExecutable":"/usr/lib/chromium/chromium","realExecutableSha256":"95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a","version":"Chrome/154.0.8037.97"},"playwright":"1.64.0","playwrightDir":"/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright","node":"24.21.0"},"browserEvidence":{"pass":true,"why":"all three receipt launch PIDs match observed Chromium mains and effective executable SHA-256","expectedExecutable":"/usr/lib/chromium/chromium","expectedExecutableSha256":"95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a","receiptPids":[364646,402253,560831],"matchedPids":[364646,402253,560831],"observedLaunchPids":[364646,402253,560831]},"watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","modifiedSha256":"4fe70f5954e0e27590496e41c775045183e09d2adc5765be5a2dc67ecc94e44f","modifiedBytesLength":92087},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":130,"tmpEmpty":false},"watchdog":{"fired":true,"exitCode":2,"browserArgv":4,"tmpEmpty":false}},"coverage":{"pass":false,"why":"invoke-download-refused is missing, duplicated, or not passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":false,"producerPass":true,"producerPath":"scripts/webmcp-invoke-round17.mjs","producerSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","duplicateCases":[],"duplicateControls":[]}}\n```

All six hazards are red at B. The signal/cleanup, TCP listener, feature-switch duplication, absent-download-case, and absent-wrapper observations are recorded per hazard. B's original 11 cases and four controls pass, but the new download case is absent. The normal receipt's producer path/digest match the selected round-17 artifact; browser evidence independently matches all three receipt PIDs to observed Chromium mains and the expected effective executable identity.

## Worktree result caveat

An earlier worktree-only probe before the MutC2 browser-ownership/provenance hardening returned 6/6 on the then-current uncommitted harness. It is **not** evidence for the final counter and is not a REV count. After the hardening, no worktree or REV count was run; L1 owns the final post-integration REV measurement. The counter-owned fake-receipt self-test now reproduces and rejects the exact no-browser credit path from `w2/MutC2.md:148-179`.

## Risks and blockers

- F6 measures the new wrapper path only. The byte-frozen direct checker remains callable with `--witness HEAD`.
- The full normal receipt is deleted with the sandbox; the counter retains its SHA-256 and runtime identity fields but adds no `--receipt-out` abstraction. L1 may retain/copy its own explicit evidence if required.
- No LSP route/tool was exposed. No tools were installed or updated.
- No blockers within the assigned paths. Final REV measurement is L1-owned.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C2Counter.md`
