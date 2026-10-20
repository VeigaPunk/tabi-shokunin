VERDICT: PASS

Axes: abort/cleanup operability, pipe-CDP evidence, download refusal, and effective Chromium feature switches.

## Findings and evidence

- **Producer and retained receipt.** `scripts/webmcp-invoke-round18.mjs` SHA-256: `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`. Normal-run receipt SHA-256: `43b3711eba135b6558df595637435acb0d3500519317bfeaa285da805af2e376`; producer digest is recorded at `corpus/evidence/round-18/webmcp-invoke/receipt.json:1-9`. The same receipt remains in `/tmp/tabi-r18-c2h-I9hwX0/receipt.json`.
- **Runtime:** Node `v24.21.0`, Playwright `1.64.0`, Chromium `154.0.8037.97`; the receipt records real executable SHA-256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`, size `329260096`, and dev/ino/mtime identity (`receipt.json:12-30, 38-462`). The executable is streamed into a SHA-256 hash once per canonical path; subsequent launches re-check dev/ino/size/mtime and reuse the hash (`scripts/webmcp-invoke-round18.mjs:304-340`). All three launches recorded the same executable hash and identity.
- **Run result:** Direct command `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs --out /tmp/tabi-r18-c2h-I9hwX0/receipt.json` exited 0. Stdout:

  ```text
  WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
  WEBMCP_INVOKE_CASE id=invoke-imperative-throws status=pass
  WEBMCP_INVOKE_CASE id=invoke-imperative-rejects status=pass
  WEBMCP_INVOKE_CASE id=invoke-unknown-tool status=pass
  WEBMCP_INVOKE_CASE id=invoke-input-schema-mismatch status=pass
  WEBMCP_INVOKE_CASE id=invoke-declarative-form status=pass
  WEBMCP_INVOKE_CASE id=invoke-after-unregister status=pass
  WEBMCP_INVOKE_CASE id=invoke-concurrent-ids status=pass
  WEBMCP_INVOKE_CASE id=invoke-flags-off-control status=pass
  WEBMCP_INVOKE_CASE id=invoke-iframe-frameid status=pass
  WEBMCP_INVOKE_CASE id=invoke-navigation-pending status=pass
  WEBMCP_INVOKE_CONTROL id=invoke-before-enable status=pass
  WEBMCP_INVOKE_CONTROL id=invoke-cancel status=pass
  WEBMCP_INVOKE_CONTROL id=invoke-declarative-navigation-result status=pass
  WEBMCP_INVOKE_CONTROL id=invoke-domain-disabled status=pass
  WEBMCP_INVOKE_CASE id=invoke-download-refused status=pass
  WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-c2h-I9hwX0/receipt.json
  ```

  Receipt summary confirms 12/12 cases, 4/4 controls, no findings, and `everyStopProof:true` (`receipt.json:9226-9256, 9647-9648`).

- **H1 — aborts.** Chromium launch disables Playwright's signal handlers; process handlers for SIGINT/SIGTERM/SIGHUP are registered before `main()` creates temp directories. Browser/context/page closure becomes `run_aborted`; signal paths await the shared cleanup and set exit code 2 (`scripts/webmcp-invoke-round18.mjs:1109-1121, 210-224, 3002-3054`). Each test sent the signal after the first case line. For all three: exit 2, no receipt, empty fresh TMPDIR:

  ```text
  SIGTERM: WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
  SIGTERM: WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGTERM
  SIGINT:  WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
  SIGINT:  WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGINT
  SIGHUP:  WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
  SIGHUP:  WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGHUP
  ```

  Each driver result recorded `exitCode:2`, `tmpdirEntries:[]`, `receiptExists:false`, and empty stderr. SIGTERM TMPDIR was `/tmp/tabi-r18-c2h-sigterm-mg1YqM`; SIGINT `/tmp/tabi-r18-c2h-sigint-cZwWjr`; SIGHUP `/tmp/tabi-r18-c2h-sighup-ZbdLVx`.

- **H2 — bounded shared cleanup.** One memoized `cleanup()` drains an in-flight launch, closes contexts, waits for owned process trees, settles tracked operations/body promises, closes the loopback server, probes its port, and removes both independent temp trees (`scripts/webmcp-invoke-round18.mjs:512-569, 786-909`). Normal exit, watchdog, `failStart`, signals, and `main().catch` all call it (`:1497-1503, 2762-2764, 3019-3052`); the watchdog returns if shutdown has already begun (`:202-207, 3019-3021`). Run-scoped Chromium TMPDIR is inside the run tree; the harness process TMPDIR is a distinct private sibling, with both removed at cleanup (`:1067-1121, 1544-1554`; receipt `:487, 9570-9648`). Normal receipt shows all browsers gone, no strays, and both trees removed.
  - In-flight launch gate test: an executable wrapper held the persistent-context launch with a shell/sleeper pair (PIDs `2617539`, `2617543`); SIGTERM exited 2 in `429 ms`, both PIDs were absent/non-live afterward, TMPDIR `/tmp/tabi-r18-c2h-launch-tmp-6B1Fee` was empty, no receipt existed, and the temporary gate directory was removed. Output: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGTERM`.
  - Watchdog route test used a private test-only copy with `RUN_TIMEOUT_MS` shortened from `420000` to `2000`; production source remained unchanged. It exited 2 after six passing cases, left TMPDIR `/tmp/tabi-r18-c2h-watchdog-WrECFi` empty, and wrote no receipt:
    ```text
    WEBMCP_INVOKE_ERROR {"code":"run_timeout","message":"hard run timeout"}
    WEBMCP_INVOKE_ERROR {"code":"run_aborted","kind":"watchdog","message":"hard run timeout"}
    WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted reason=watchdog
    EXIT=2
    TMPDIR_ENTRIES=RECEIPT_EXISTS=no
    ```

- **H3 — pipe CDP.** The harness launches with `--remote-debugging-pipe`, no TCP DevTools port, attaches only via `context.newCDPSession(page)`, records commands/responses and the r17 event set, and detaches during case teardown (`scripts/webmcp-invoke-round18.mjs:966-1008, 1369-1423, 1426-1456`). Receipt `safety.cdpChannel` is `playwright pipe CDPSession; no TCP DevTools port` (`receipt.json:479-490`); run argv records the pipe, no remote-debugging-port, no `--no-sandbox`, and no `DevToolsActivePort` (`receipt.json:148-161, 288-301, 430-443`). CDPSession-rejected sends are explicitly labeled synthesized client-side messages; no numeric protocol codes are fabricated (`scripts/webmcp-invoke-round18.mjs:966-968, 995-1001, 1671-1676`).
  - During a successful run in a dedicated loopback network namespace, `ss -ltnp` was captured immediately after the first case line:

    ```text
    State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess
    LISTEN 0      511        127.0.0.1:43789      0.0.0.0:*    users:(("MainThread",pid=2758496,fd=21))
    SS_CHROMIUM_LISTENERS=[]
    WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-c2h-ss-oSdA0a/receipt.json
    NAMESPACE_RUN_EXIT={"code":0,"signal":null,"ssCaptured":true}
    ```

- **H4 — refused blob download.** The embedded fixture registers an imperative tool which clicks a `blob:` anchor. Every context has `acceptDownloads:false`; each page records `suggestedFilename` and settles `failure()` (`scripts/webmcp-invoke-round18.mjs:104-135, 1114-1121, 1322-1367, 2679-2735`). Receipt case `invoke-download-refused` passed: Completed / `download-triggered`, one `webmcp-refused-download.txt` event, settled non-null failure `Pass { acceptDownloads: true } when you are creating your browser context.`, and complete before/after scans with no matches in either tree (`receipt.json:7883-7965`). Marker SHA-256: `6b377b02647269ca4cb5b217f2fc9380f20e1424505bd0f095d8310c060f6451`; fixture SHA-256: `47591bd9ef8d80e82bb4ee3ea2acfe632e6d403fdba83d6c2f72152ce0e481f6`. The observed failure text is preserved verbatim, not rewritten as `canceled`.

- **S1 — feature switch uniqueness and fail-closed launch.** Only exact Playwright default feature tokens are filtered; changed unions are re-added. Effective `/proc` argv must show exactly one `--enable-features=`, no more than one `--disable-features=`, the pipe, no TCP port, and no `--no-sandbox`, otherwise launch evaluation fails (`scripts/webmcp-invoke-round18.mjs:1011-1051, 1171-1222, 2779-2798`). Flagged, flag-off, and domain-disabled receipts each record `enableFeatures:1`, disable count 1, `hasRemoteDebuggingPipe:true`, `noRemoteDebuggingPort:true`, `noSandboxFlag:true` (`receipt.json:148-161, 288-301, 430-443`). The domain-disabled argv retains WebMCP Blink enablement and its merged disable union.

- **CLI and output:** `--out` and `--force` remain supported (`scripts/webmcp-invoke-round18.mjs:269-286`); stdout summary and exit mapping remain 0/1/2 (`:2983-2988`). The producer hash is present in the receipt.
- **Scope:** Download fixture is embedded; no fixture files or tools were added. LSP was unavailable in the mounted tool inventory; no tool was installed or updated.

## Risks and blockers

- Production 420-second watchdog duration was not elapsed; its cleanup path was exercised with the test-only shortened timer above. The normal-shutdown race guard was source-checked. No other blocker observed.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/webmcp-invoke/receipt.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C2Harness.md`
