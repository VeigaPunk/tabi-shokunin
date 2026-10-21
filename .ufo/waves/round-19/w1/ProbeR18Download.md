# Round-18 refused-download operability probe

## Result

- **No GUID-named download file was observed** under the supplied `TMPDIR`. During the run, inventories contained no files; they showed only empty `playwright-artifacts-*` directories with six-character suffixes. After exit, the only file was the receipt.
- **The round-18 scan does not look only for the suggested filename.** It scans regular-file contents for the unique download marker and does not inspect filenames. The case predicate merely requires `suggestedFilename` to be a string, without matching it to a filename or using it as the scan target.

## Run and receipt

- Sandbox clone: `/fast/scratch/tabi-r19/ProbeR18Download/clone`, detached at baseline `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Successful invocation: `node scripts/webmcp-invoke-round18.mjs`, with fresh `TMPDIR=/fast/scratch/tabi-r19/ProbeR18Download/tmpdir-success`, no harness arguments. The process ran 15,056.807 ms and exited 0. Receipt verdict `pass`; 12/12 cases passed, 0 failed, 0 missing; four controls ran.
- The `invoke-download-refused` receipt case passed. `WebMCP.toolResponded` was `Completed` with output `download-triggered`; the sole Playwright event had suggested filename `webmcp-refused-download.txt`, `failureSettled: true`, and failure `Pass { acceptDownloads: true } when you are creating your browser context.`
- Marker scans reported no matches and no errors. Before context close, `runTempDir` scanned 461 files and `processTmpdir` scanned 0; after close, 459 and 0 respectively. `browserGone` was true. The receipt records the `runTempDir` at `/tmp/tabi-r18-webmcp-invoke-5n90uL` and `processTmpdir` beneath the supplied TMPDIR.
- Runtime in the successful receipt: Chromium `154.0.8037.97`, Playwright `1.64.0`, Node `26.12.0`. The workstation shell separately reported Node `24.21.0`; the successful run inherited an environment resolving `node` to 26.12.0. This is a runtime deviation from the plan's noted Node version; the script enforces Playwright 1.64.0 but only records Chromium/Node versions.

## TMPDIR inventories

All times below are UTC. Every inventory listed every file and directory present under the supplied TMPDIR, with path, byte size, `mtime_ns`, and UTC mtime; file arrays were empty until the receipt appeared after exit.

| Snapshot | Child alive | Files | Directory entries |
|---|---:|---|---|
| Pre-run, 2026-10-21 06:49:50.368255 | n/a | none | none |
| After first case, 06:49:50.976051 | yes | none | `tabi-r18-webmcp-invoke-process-5qPFfY` (41 B, mtime 06:49:50.514649); `.../playwright-artifacts-Wr6Yyh` (6 B, same mtime) |
| Before download case, 06:50:05.134925 | yes | none | process dir (111 B, mtime 06:50:04.228696); `.../playwright-artifacts-RGJqrY` (6 B, mtime 06:50:04.228696); `.../playwright-artifacts-Wr6Yyh` (6 B, mtime 06:49:50.514649); `.../playwright-artifacts-x4KT88` (6 B, mtime 06:49:52.968658) |
| After download case, 06:50:05.283390 | yes | none | process dir (76 B, mtime 06:50:05.268700); `.../playwright-artifacts-RGJqrY` (6 B, mtime 06:50:04.228696); `.../playwright-artifacts-x4KT88` (6 B, mtime 06:49:52.968658) |
| After exit, 06:50:05.422150 | no | `tabi-r18-webmcp-invoke-receipt.json` (337,943 B, mtime 06:50:05.410701) | none |

The download-case window was sampled recursively every ~25 ms: five samples from 06:50:05.134905 to 06:50:05.283587. Three `playwright-artifacts-*` directories were observed, with directory entries only; no file was observed inside the supplied TMPDIR at any full snapshot. The after-download snapshot no longer contained `playwright-artifacts-Wr6Yyh`. The final TMPDIR inventory contained only the receipt above.

## Source evidence and scan interpretation

The scan reads file bytes:

> `if (readFileSync(path).includes(markerBytes)) matches.push(path);`

It recursively visits directory entries, skips symlinks, and scans regular files (round-18 source lines 745–784). The predicate checks only that the suggested filename is a string:

> `typeof o.downloadEvents[0].suggestedFilename === 'string'`

That check is at line 2713; marker scans and the rest of the predicate are at lines 2700–2724. Neither mechanism matches a suggested filename against filesystem entries. Thus a GUID-named artifact whose contents do not include the marker could evade the round-18 content scan. This is the measured source gap, not a claim that such a file was produced in this run.

Source: [`scripts/webmcp-invoke-round18.mjs`](file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs), lines 745–784 and 2700–2724; accessed 2026-10-21; decoded-body SHA-256 `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`.

## Retained evidence, risks, and blockers

- Raw probe record: `.ufo/waves/round-19/w1/ProbeR18Download.json` (17,409 bytes; SHA-256 `ea292f5451e8c67a5d5ec9b26ae22a5de3b4ccfc2f5b38f888ad6a8e4cc0ace9`). It includes the setup-only resolver failure, the successful run output, inventories, receipt summary, and the download case observations.
- Successful receipt SHA-256: `a868b77c8e29fe525d1010b00c991f372764a1691d3bcf2f0d3c1262e857d80d`; producer SHA-256: `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`.
- The first startup-only attempt exited 2 with `playwright_unresolved` because the harness could not resolve the already-installed Playwright package through its default candidates; it launched no browser, created no receipt, and left its fresh TMPDIR empty. The successful invocation used `NODE_PATH` pointing at the installed Playwright 1.64.0 package. No tool was installed or updated.
- Sampling at 25 ms cannot rule out a shorter-lived file that appeared and disappeared between polls. None appeared in full snapshots or in the receipt's marker scans. No other blocker to this probe.

## Isolation

- Probe clone: `/fast/scratch/tabi-r19/ProbeR18Download/clone`, detached at baseline `66251bfc1aef393e4aec599e950a8deb867736bb`.
- No production files were edited; no branch or commit was created. Lane writes are limited to this seat's raw JSON and advisory report under `.ufo/waves/round-19/w1/`.
