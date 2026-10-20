VERDICT: PASS

Axes: abnormal-exit cleanup, CDP transport/evidence, refused-download evidence, and effective Chromium feature arguments.

## Findings and evidence

- **Producer:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs`; SHA-256 `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`. The final receipt records the same `producerSha256`.
- **Final normal run:** `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs --out /tmp/tabi-r18-c2h-final-zzms7k_3/receipt.json`, run in a loopback-only network namespace, exited 0; stdout `WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-c2h-final-zzms7k_3/receipt.json`. All twelve cases and four controls are `pass`.
- **Counter cross-check (worktree-only):** `.ufo/waves/round-18/w1/C2Counter.md:36-43` reports 6/6 hazards closed for artifact SHA-256 `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`; it is explicitly not a REV count.

- **H1 — signal/browser aborts:** Playwright signal handlers are disabled at script lines 941–944; process handlers are installed at lines 2781–2795. The direct runs sent each signal after `WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass`:
  - SIGTERM: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGTERM`; exit 2; receipt absent; fresh TMPDIR contents `[]`; surviving browser PIDs `[]`.
  - SIGINT: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGINT`; exit 2; receipt absent; fresh TMPDIR contents `[]`; surviving browser PIDs `[]`.
  - SIGHUP: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGHUP`; exit 2; receipt absent; fresh TMPDIR contents `[]`; surviving browser PIDs `[]`.
  Browser `disconnected`, context-close, page-close, and target-closed observations enter the same abort state; no pass/fail receipt is written on these aborts.

- **H2 — one cleanup and private temporary tree:** `closeOwnedContext`/process-tree waiting are at lines 419–467 and the idempotent `cleanup()` at lines 701–767. The run directory is created with prefix `tabi-r18-webmcp-invoke-` at lines 1344–1351; Chromium receives TMPDIR at lines 325–333 and 930–940. The normal receipt closure reports `everyStopProof:true`, `runTempDir.removed:true`, `removalError:null`, every browser gone, no stray processes, and every profile/home/browser-temp path removed. The signal runs likewise left the caller's fresh TMPDIR empty and no matching browser PIDs.

- **H3 — pipe CDP, fixture-page-only session, no DevTools TCP port:** The CDP recorder and its honest local correlation IDs are at lines 831–870; it records command sends/responses and the WebMCP/Page navigation events. `context.newCDPSession(page)` is at line 1214 and the CDPSession is detached in `closeCase` at lines 1235–1254. Receipt `safety.cdpChannel` is exactly `playwright pipe CDPSession; no TCP DevTools port`. Each run's effective argv records `--remote-debugging-pipe`, no `--remote-debugging-port`, and no `DevToolsActivePort` file.
  - During the final successful run in a dedicated loopback network namespace, `ss -ltnp` 0.64 s after the first case line showed only the Node fixture listener (`127.0.0.1:36895`); `CHROMIUM_LISTENERS: []`, `NO_CHROMIUM_LISTENER: True`. The namespace receipt also exited 0 with 12 cases and four controls passing.
  - A separate host-network `ss -ltnp` sample did show an unrelated pre-existing Chromium listener at `127.0.0.1:39017`, PID 2082972. Its argv carries the host Chromium profile/extension flags and did not contain this harness's run profile; `HARNESS_CHROMIUM_LISTENERS: []`. It was left untouched as external state.

- **H4 — refused blob download:** `acceptDownloads:false` is at line 940; every page's `download` event and `failure()` tracking is at lines 1148–1192. The embedded fixture-owned imperative tool and `invoke-download-refused` case are at lines 96–126 and 2471–2527. In the final receipt the tool invocation returned a non-null invocation ID, `toolResponded` was `Completed` with output `download-triggered`, and exactly one download event recorded filename `webmcp-refused-download.txt`, `failureSettled:true`, non-null `failure`, and `failureError:null`. The observed Playwright 1.64 deny-mode failure text is preserved verbatim: `Pass { acceptDownloads: true } when you are creating your browser context.` `actual` includes `downloadMarkerPrefix:"tabi-r18-download-"` and a 64-hex `downloadMarkerSha256`, but not the raw blob bytes. Before and after context shutdown, complete run-tree/process-TMPDIR scans had zero marker-byte matches; `browserGone:true`.

- **S1 — merged feature switches:** `featureLaunchOptions` uses exact pinned Playwright default tokens and only ignores/re-adds changed unions at lines 888–913; effective argv counts and fail-closed checks are at lines 1005–1042. In the normal receipt, flagged, flag-off, and domain-disabled launches each had `featureSwitches.enableFeatures:1`, `counts.disableFeatures:1`, `hasRemoteDebuggingPipe:true`, `noRemoteDebuggingPort:true`, and `noSandboxFlag:true`; the domain-disabled launch retained `--enable-blink-features=WebMCP` and its merged disable token.

## Risks and blockers

- The host `ss` sample includes the unrelated Chromium PID above; the scoped harness itself has no TCP DevTools listener, as shown by effective argv and the isolated namespace sample. No external process was stopped or modified.
- Playwright's deny-mode `Download.failure()` value is the verbatim diagnostic above, not the literal word `canceled`; it is non-null, records the refused download outcome, and the complete before/after scans show no blob marker bytes. The value was not rewritten or fabricated.
- No LSP tool/server is mounted in the available tool inventory, so LSP symbol/refactor operations were unavailable. No tools were installed or updated.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C2Harness.md`
