VERDICT: PASS

## Axes
C2 measures **operability**. The normal receipt also has a counter-owned retained-coverage floor for the 11 round-17 cases, four controls, and the new download case; no hazard counts when any of those is missing, duplicated, or not passing.

## Findings

- Added the self-contained revision counter at `.ufo/waves/round-18/measure-c2.mjs`. It selects the highest-numbered committed `scripts/webmcp-invoke-round*.mjs`, clones the lane with `--no-hardlinks`, detaches at the selected revision, sets sandbox `refs/heads/master` to that revision, and runs probes only in the clone. Each probe gets a fresh short `/tmp/mc2-*` TMPDIR, removed with the sandbox. Worktree overrides are copied into the sandbox and explicitly emit `mode: "worktree"`, `rev: "worktree:<baseRev>"`.
- H1 waits for a real `WEBMCP_INVOKE_CASE` line, verifies the child is live, sends SIGTERM successfully, and requires the observed `run_aborted`/`signal=SIGTERM`, exit 2, no pass/fail receipt, and no TMPDIR process at five seconds. H2 separately checks SIGINT and a watchdog probe on a sandbox-only copy with exactly the `RUN_TIMEOUT_MS` declaration changed from 420000 to 6000; the emitted patch record includes both complete artifact SHA-256 values and the changed declaration. H3 polls `/proc`, `ss -H -ltnp`, and `DevToolsActivePort` during the complete normal run. S1 checks the effective argv of each launched browser main process (the matching `--user-data-dir` process with no `--type=`), not renderer/utility child argv, and validates the Playwright-default + harness feature unions as well as token counts. H4 requires the live case line, the invocation request/response, one settled refusal event, complete zero-match pre/post-close scans, and no fixture-named TMPDIR file observed live or after the run. The marker itself is not copied into the receipt: the counter requires its known prefix and a 64-hex marker digest.
- F6 is explicitly **wrapper-scoped**: the probe creates an off-branch poison commit, detaches HEAD, checks the wrapper rejects `--rev HEAD`, and checks `--dry-run` prints the master ref. The frozen `scripts/check-freshness.mjs --witness HEAD` route remains directly callable; F6 does not claim otherwise.

### Counter self-test
Command:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs --self-test
```

Observed output summary: `{"schema":"tabi-round18-c2-selftest-v1","verdict":"pass","cases":21,...}` (exit 0). All 21 stub-harness cases passed, including positive/negative H1 signal and startup-exit2 discrimination; H2 normal, SIGINT, and watchdog cleanup; H3 port and browser-owned-listener detection; H4 live refusal/scan, downloaded-file rejection, and Playwright's exact denial diagnostic; S1 feature-union/cardinality and launch-vs-renderer filtering; retained-coverage rejection; and both F6 outcomes.

### Red-before measurement at B
Command:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
```

Observed one-line JSON (exit 0, evaluated):

```json
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c","c2_hazards_closed":0,"hazards":{"h1":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=false, exit=1, pass/fail receipt=fail:/tmp/tabi-r18-mc2-x3uQgZ/.ph-SdDS9z/r.json, surviving TMPDIR processes=0"},"h2":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=false), watchdog=true (empty=false, browser argv=3)"},"h3":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); normal run completed=true, observed browser argv=3, --remote-debugging-port seen=true, DevToolsActivePort seen=true, ss scans=78 available=true, browser-owned listeners=3"},"h4":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); case unique=false, pass=false, case line observed while process live=false, actual invoke attempt=false (marker prefix+sha=false, request=false, invocationId=false, no error=false, responded=false, output=false, fields=none), one settled refusal event=false, pre-close scans clear=false, post-close scans clear=false, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); observed launched browser argv=3, required launch roles missing=none, feature-union violations=2 ([{\"pid\":141113,\"role\":\"flagged\",\"enable\":2,\"disable\":1,\"missing\":[],\"repeated\":[]},{\"pid\":232945,\"role\":\"domain-disabled\",\"enable\":1,\"disable\":2,\"missing\":[],\"repeated\":[]}])"},"f6":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); scripts/freshness-witness.mjs absent or not a regular file at the revision"}},"artifact":"scripts/webmcp-invoke-round17.mjs","artifactSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"cf3230f8b1f16f7f62924e36c586e0b85abcf4445ae8dea1cfc2acd0843d1372","producerSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7","modifiedSha256":"4fe70f5954e0e27590496e41c775045183e09d2adc5765be5a2dc67ecc94e44f","modifiedBytesLength":92087},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":130,"tmpEmpty":false},"watchdog":{"fired":true,"exitCode":2,"browserArgv":3,"tmpEmpty":false}},"coverage":{"pass":false,"why":"invoke-download-refused is missing, duplicated, or not passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":false,"duplicateCases":[],"duplicateControls":[]}}
```

All six hazards are red at B. H1 recorded a `verdict=fail` receipt and no `run_aborted`; H2's normal/SIGTERM TMPDIRs were empty but its SIGINT and watchdog TMPDIRs were not; H3 observed three browser-owned listeners plus the port switch and `DevToolsActivePort`; H4 and F6 inputs are absent at B; S1 observed duplicated feature switches in flagged and domain-disabled launch argv. The shared coverage reason is the missing new download case.

### In-progress worktree probe (not a REV count)
Command:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c --worktree-artifact /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs --worktree-wrapper /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs
```

Observed JSON labels itself `mode: "worktree"`, `rev: "worktree:2bff864fdfee684ddbcd066cc8e735adaba2735c"`, `c2_hazards_closed: 6`; all six hazards passed on the in-progress files. Its normal receipt retained 11/11 original cases, 4/4 controls, and the passing download case. Worktree artifact SHA-256: `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`; normal receipt SHA-256: `0673cd7a6921f2c25b673be7dff11a33ba20719296cee2d3bbf950591b2a95a7`; producer SHA-256 matched the artifact; watchdog probe modified only the timeout declaration and recorded modified-artifact SHA-256 `4e055ea9a010e597a270381f2d3aa2beb5f7af99ed54959febd8ef29e7aab3e1`. This result is worktree evidence only, not a revision count.

## Risks and blockers

- F6 only measures the new wrapper path; the byte-frozen direct checker remains usable with `--witness HEAD`.
- H4 intentionally recognizes Playwright 1.64.0's exact deny-download `failure()` diagnostic (`Pass { acceptDownloads: true } when you are creating your browser context.`) as a refusal outcome, while still requiring a unique invocation, settled event, and complete marker scans. No raw marker bytes are retained.
- The exposed tool inventory provided no LSP route/tool, so LSP navigation/refactor checks were unavailable. No tools were installed or updated.
- No implementation blockers.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C2Counter.md`
