# Round 19 W1 — ExecInvokeR19-4

## Scope and behavior

Created `scripts/webmcp-invoke-round19.mjs` as the round-18 successor. It retains the 12 cases, four controls, and the inherited launch, loopback, CDP-pipe, feature-argument, process cleanup, and marker-byte guards. `PRODUCER_REL`, receipt schema, temp-directory prefixes, fixture reference, help text, and default output now identify round 19.

The producer accepts `--nonce HEX` and `TABI_RUN_NONCE`; it validates exactly 32 hexadecimal characters, lowercases the accepted value, and otherwise generates 16 random bytes. The nonce is embedded in the download fixture, added to the page-observed `download-blob` record, checked by the case predicate, and recorded at receipt top level.

The download case snapshots file paths before invoking the fixture, while Chromium is alive after the refused download, and after its context closes. It recursively compares all regular files under the run tree and every direct `processTmpDir/playwright-artifacts-*` directory, without relying on suggested or UUID filenames. Receipt `downloadScan` contains `roots`, `newFiles`, completeness, and scan errors. The case fails on any new file, scan error, nonce mismatch, or failed round-18 marker-byte guard.

SIGINT, SIGHUP, and SIGTERM share the cleanup path and return exit 2 with `run_aborted`, without writing a pass/fail receipt. Signal output records `ownedPidsBeforeSignal` and `ownedPidsAfterCleanup`.

## Retained evidence

- Normal run: exit 0; observed `WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4`; all twelve cases and four controls passed.
- Receipt: `/fast/scratch/tabi-r19/ExecInvokeR19-4/round19-normal-receipt.json`; SHA-256 `bc0cb2c0d9d519761dbda1f966e79512798841d90b1ff66b673170f1862c6bce`.
- Receipt producer identity: `scripts/webmcp-invoke-round19.mjs`, SHA-256 `953d209352976ce540764764c9ea4570d07e4d8e7649dc9b5c0ac2d56ebe77b9`. Generated nonce `6862c4154d3e6644515f69ab392739bc`; the receipt top-level nonce equals the page record `{ "tool": "download-blob", "nonce": "6862c4154d3e6644515f69ab392739bc" }`.
- Download case: `pass`; `downloadScan.complete=true`, `newFiles=[]`, `errors=[]`; four roots were recorded (run tree and three Playwright artifact directories). The run tree had 461 files before/while alive and 459 after close; no new files were reported. One Playwright artifact directory was removed on close (`filesAfterClose: null`); the remaining artifact roots had zero files after close.
- SIGINT: sent after first case line `WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass`; exit 2; no receipt. The pre-signal external `/proc` observation found Chromium PIDs `[910198, 910207, 910208, 910219, 910241, 910349, 910385, 910410, 910587]`. Harness abort output recorded `ownedPidsBeforeSignal=[910198,910207,910208,910219,910241,910274,910349,910385,910410,910587,910603]`, `ownedPidsAfterCleanup=[]`, and `code=run_aborted`.
- SIGHUP: sent after the same first case line; exit 2; no receipt. The pre-signal external `/proc` observation found Chromium PIDs `[919206, 919214, 919215, 919217, 919240, 919304, 919324, 919336, 919405]`. Harness abort output recorded `ownedPidsBeforeSignal=[919206,919214,919215,919217,919240,919262,919304,919324,919336,919405]`, `ownedPidsAfterCleanup=[]`, and `code=run_aborted`.
- An initial signal-run wrapper attempt used its inherited Node 26.12.0 and failed before the first case with `playwright_unresolved` (exit 2, no receipt, no Chromium PID). The requested signal probes were then run successfully with the pinned Node 24.21.0 executable. No tools were installed or updated.

## Risks and blockers

No blockers. The normal run exercised the generated-nonce path; `--nonce`/`TABI_RUN_NONCE` overrides were not separately exercised. SIGTERM is installed on the same signal-cleanup path but was not part of the requested dynamic probes. A removed Playwright artifact directory is represented with `filesAfterClose: null`; no remaining file was present there, and the complete scan had no errors.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecInvokeR19-4`
- Branch: `r19/ExecInvokeR19-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `425bc4bdbf88adef822389bcab83a707e5fe2a22`
- Changed paths: `scripts/webmcp-invoke-round19.mjs`
