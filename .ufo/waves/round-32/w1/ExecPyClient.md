# ExecPyClient — C1 independent replication (Python 3 BiDi client, round 32 w1)

Verdict: **holds; the independent client reproduces the counter's binding byte-for-byte.** A
Python 3 WebDriver BiDi client (`client.py`, stdlib + `websockets` 17.3, no import of the lane
counter, no Node in its transport) drove the frozen r32 fixture through chromedriver/Chromium
154.0.8037.97 on 127.0.0.1 and captured the values the counter's predicates read. Its first
screenshot, taken after `setViewport 640x480`, `navigate /a.html` complete, awaited
`window.__ready`, and before any input, hashes to
`ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5` (6626 bytes, PNG 640x480) —
identical to the counter's own `liveRecord` session, identical in a second Python run, and
different (`25e764ed…`) under an 800x600 negative control that flips exactly R4 and R7. All 35
compared value fields agree across python-run-1 / python-run-2 / node-counter (0 mismatches,
per-session ids and ports normalised out). Replaying each Python transcript through the counter's
own `recordFromTranscript` + `PREDICATES` admits **16/16** admittable rows (R16 correctly
`no-bidi-counterpart`). Nothing in the lane was edited; the counter bytes at the clone are the
frozen digest.

## Independence boundary (what this does and does not prove)

- Independent: WebDriver HTTP session (Python `urllib`), WebSocket/JSON transport (`websockets`
  library, not Node's built-in `WebSocket`), command sequencing, event waiting, and value
  extraction are all written from the counter's *protocol shape*, not by importing its code.
  `client.py` never imports `check-bidi-runtime.mjs`.
- Shared by instruction: the fixture **bytes** are served by `serve.mjs`, which imports the
  counter's frozen `serveFixture()` (`FIXTURE_SHA256` `343cbced…2843`, printed at start), so the
  served markup is the frozen one rather than a reimplementation.
- Shared for reading only: the replay verdict uses the counter's `PREDICATES` — the second client
  supplies the transcript, the predicate logic is the thing under test.
- Not claimed: this is not a receipt in `tabi-bidi-receipt-v1` form (no driver-blob/two-run
  binding for `t1`), and the counter's `--live` leg was not run here (it is the L1/ExecDriver
  leg). This seat contributes the *second driver's* evidence the C1 control J4 needs, plus the
  demonstration that screenshot byte-equality survives a non-Node client.

## Method (commands and exit codes)

Scratch `/fast/scratch/hyaku/tabi-r32/ExecPyClient` (`HYAKU_SCRATCH=/fast/scratch/hyaku`), one
shared clone: `git clone --shared … "$S/clone"` + `git -C "$S/clone" checkout -q --detach
4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` → `HEAD` =
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`, `git status --porcelain` = 0 lines, counter
sha256 = `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` (equals
`claims.json` frozenDigests).

| # | Command | Exit |
|---|---|---|
| 1 | `TMPDIR="$S/tmp" node serve.mjs` (imports `serveFixture`, prints `{"base":"http://127.0.0.1:33611","fixtureSha256":"343cbced…2843"}`) | ready |
| 2 | `TMPDIR="$S/tmp" uv run --no-project --with websockets python client.py --base http://127.0.0.1:33611 --out out/py --tmp "$S/tmp"` | 0 |
| 3 | same, `--out out/py2` (second run) | 0 |
| 4 | same, `--out out/ctrl --viewport-width 800 --viewport-height 600` (negative control) | 0 |
| 5 | `TMPDIR="$S/tmp" node node_values.mjs` (extracts the same value set from the counter's own `liveRecord`) | 0 |
| 6 | `TMPDIR="$S/tmp" node node_compare.mjs` (first-screenshot digest from `liveRecord`) | 0 |
| 7 | `node replay.mjs out/py/transcript.jsonl 154.0.8037.97 out/node-compare.json out/py/values.json` | 0 |
| 8 | `node replay.mjs out/py2/transcript.jsonl … out/py2/values.json` | 0 |
| 9 | `node replay.mjs out/ctrl/transcript.jsonl … out/ctrl/values.json` | 0 |
| 10 | `python3 compare.py out/py/values.json out/py2/values.json out/node-values.json out/compare.json out/compare.md` | 0 |

Client protocol sequence (identical to the counter's live leg so the comparison is like-for-like):
`session.subscribe` → `browsingContext.getTree` → `browsingContext.setViewport 640x480 dpr1` →
`network.addDataCollector{dataTypes:["response"],maxEncodedDataSize:65536}` →
`browsingContext.navigate /a.html wait:complete` (await `browsingContext.load`) →
`script.evaluate window.__ready awaitPromise:true` → `script.evaluate window.innerWidth` →
**`browsingContext.captureScreenshot` (first, before any input)** → `locateNodes #h/#t/#b` →
`input.performActions` click `#t`, key actions `tabi`, click `#b` → evaluates of `#t.value`/`#out`
→ `fetch('/data.txt')` + `network.getData` → `storage.getCookies` →
`network.addIntercept`+`continueRequest` (blocked `/data.txt?held=1`) → navigate `/b.html` →
`traverseHistory delta:-1` + `location.pathname` polls → `alert('tabi-alert')` +
`handleUserPrompt`. 29 commands, 14 events, one screenshot.

## Captured values (Python run 1 vs Python run 2 vs Node counter liveRecord)

35 fields compared; **0 mismatches**. Per-session identifiers (context id, intercept UUID, wire
indexes, ports) are excluded or normalised (`127.0.0.1:<port>` → `127.0.0.1:PORT`).

| Field | Python run 1 | Python run 2 | Node counter liveRecord | py1==py2 | py==node |
|---|---|---|---|---|---|
| `browserName` | "chrome" | "chrome" | "chrome" | True | True |
| `browserVersion` | "154.0.8037.97" | "154.0.8037.97" | "154.0.8037.97" | True | True |
| `chromedriverVersion` | "154.0.8037.97 (b510e9d7…@{#1673})" | same | same | True | True |
| `viewport` | {"width":640,"height":480} | same | same | True | True |
| `firstScreenshotSha256` | "ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5" | same | same | True | True |
| `firstScreenshotBytes` | 6626 | 6626 | 6626 | True | True |
| `firstScreenshotPngSize` | {"height":480,"width":640} | same | {"width":640,"height":480} | True | True |
| `firstScreenshotBase64Sha256` | "674145fe22378cbe1f2326a25cb48fcd591bf5e89a2869ee4c9e0fcf86b43783" | same | same | True | True |
| `r2_getTree_contexts` | [{"children":0,"url":"about:blank"}] | same | same | True | True |
| `r3_navigate_result_url` | "http://127.0.0.1:PORT/a.html" | same | same | True | True |
| `r3_load_event` | true | true | true | True | True |
| `r5_locate_h_count` | 1 | 1 | 1 | True | True |
| `r5_locate_h_localName` | "h1" | "h1" | "h1" | True | True |
| `r6_ready` | "settled" | "settled" | "settled" | True | True |
| `r7_innerWidth` | 640 | 640 | 640 | True | True |
| `r9_textValue` | "tabi" | "tabi" | "tabi" | True | True |
| `r8_outTextContent` | "clicked:tabi" | "clicked:tabi" | "clicked:tabi" | True | True |
| `r10_beforeRequestSent_a` | true | true | true | True | True |
| `r10_responseCompleted_a` | true | true | true | True | True |
| `r11_status` / `r11_statusText` | 200 / "OK" | 200 / "OK" | 200 / "OK" | True | True |
| `r11_fixtureHeader` / `r11_headerCount` | "r32" / 7 | "r32" / 7 | "r32" / 7 | True | True |
| `r12_collectorPresent` | true | true | true | True | True |
| `r12_getDataBytes` | "tabi-bidi-body-0123456789\n" | same | same | True | True |
| `r12_getDataType` | "string" | "string" | "string" | True | True |
| `r13_blocked` | true | true | true | True | True |
| `r13_blockedUrl` | "http://127.0.0.1:PORT/data.txt?held=1" | same | same | True | True |
| `r13_continued` | true | true | true | True | True |
| `r13_heldBody` | "tabi-bidi-body-0123456789\n" | same | same | True | True |
| `r14_traverseHistory` | true | true | true | True | True |
| `r14_pathname` | "/a.html" | "/a.html" | "/a.html" | True | True |
| `r15_cookie` | {"cookieCount":1,"domain":"127.0.0.1","name":"tabi_fixture","value":"1"} | same | same | True | True |
| `r17_promptOpened` / `r17_handled` | true / true | true / true | true / true | True | True |

Per-session values that are *supposed* to differ (recorded in `evidence/*-values.json`):
context id `4AF7AF6E…` / `BFB0C87…` / `E37608F3…`; intercept UUID
`86324048-…` / `cff6ece6-…` / (node) `…`; WS URL ports `47907` / `…` / `39033`.

## Predicate replay (counter's own PREDICATES over the Python transcripts)

`evidence/replay-py1.json` and `replay-py2.json`: `admitted = 16`, `failing = ["no-bidi-counterpart"]`
(R16 has no BiDi command, as the counter declares), `screenshotEqualNode = true`,
`screenshotEqualValuesJson = true`, 73 transcript lines, 29 commands, 14 events,
`newSession.chromedriverVersion` = `154.0.8037.97 (b510e9d7…)`. Rows R1…R15, R17 each return
`null` (holds) on a transcript produced by a client that never links the counter.

## Negative control (equality is a measurement, not a constant)

Same client, `--viewport-width 800 --viewport-height 600`: screenshot sha256
`25e764edcc2d3d96900671e5347512e56f5eef7fc59d34cacbb902f9029649d0` (7526 bytes, PNG 800x600),
`r7_innerWidth` 800, and the counter's predicates fail exactly `R4` ("screenshot is not a PNG of
the pinned viewport") and `R7` ("no setViewport 640x480"), admitted 14. Text/click results are
unchanged, so the delta is the viewport pin and nothing else.

## Evidence files (this seat's output dir)

`client.py` (sha256 `9d052b71…bf06`), `compare.py` (`a0c2ba87…c0c3`), `replay.mjs`
(`5efc840d…92ee1`), `node_values.mjs` (`4a4d075b…175e`), `node_compare.mjs`
(`12310461…7501`), `serve.mjs` (`1b404977…0eab`), `run.json` (host/versions/commands/digests).
Under `evidence/`: `py1-transcript.jsonl` (`e17a7ba8…0f29`), `py2-transcript.jsonl`
(`bbe32e4e…9570`), `ctrl-800x600-transcript.jsonl` (`0245794d…f4d6`), `py1-values.json`,
`py2-values.json`, `ctrl-800x600-values.json`, `node-values.json` (`9d418dde…74d5`),
`node-compare.json` (`a1a80f47…0737`), `compare.json` (`71f56faf…f4f0f`), `compare.md`,
`replay-py1.json`, `replay-py2.json`, `replay-ctrl.json`, stdout/stderr of each Python run.

Tooling installs: `websockets 17.3` pulled ephemerally into the uv cache by
`uv run --no-project --with websockets` (official PyPI through uv, no system change); no pacman
transaction, no host service restarted. No network fetches were made (fixture is loopback; no
public page needed for this seat), so there is no fetch log to report.

## Risks / limits

1. **Host-build-scoped.** Screenshot byte-equality holds for this Chromium/ChromeDriver build
   (`154.0.8037.97`); a different build can change the PNG bytes without changing behaviour. The
   counter's `t3-binding` already pins `chromedriverVersion` for this reason; this report does
   not add a stronger claim.
2. **Fixture bytes are the counter's.** If `serveFixture()` were wrong about the frozen
   markup, both clients would be equally wrong. `FIXTURE_SHA256` is printed by `serve.mjs` from
   the frozen module (`343cbced…2843`) but I did not independently re-derive the fixture hash
   from the matrix/`SKILL.md` prose; that is the counter's pinned constant.
3. **`websockets` is a third-party wheel.** Transport is independent of Node, not of a library;
   the value of the replication is the second driver + second language, not a from-scratch
   WebSocket implementation. A stdlib-only variant was considered and rejected as re-testing
   framing rather than BiDi.
4. **Receipt shape is not the frozen `tabi-bidi-receipt-v1`.** My transcript omits the driver
   blob and the two-run binding the counter's `t1-receipt` requires; it cannot be dropped into
   `--receipt`. The L1/ExecDriver still owns producing the receipt; this seat supplies the
   independent-driver cross-check (C1 control J4 needs a non-counter driver) and the byte-equality
   demonstration against a non-Node client.
5. **Six-month re-check.** Both the replay script and the value extractor depend on the counter's
   exported names (`recordFromTranscript`, `PREDICATES`, `liveRecord`, `serveFixture`); a
   counter reshape breaks them silently at import time, not at assertion time.

Cleanliness: no `chromedriver`/`chromium` process of mine remains. `pgrep -fa 'chromedriver|chromium'`
at yield lists a sibling seat's browser tree (every `--user-data-dir` under
`/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…`, plus the host's `earlyoom` argument text);
nothing carries my scratch path `/fast/scratch/hyaku/tabi-r32/ExecPyClient`. My fixture listener
is gone — `ss -ltnp | grep 33611` returns nothing. The supervised fixture service
(`tabi-r32-fixture`) later reported `failed exit=1` at `up 4m1s`, i.e. **after** all nine
capture/replay commands above had exited 0 and after `out/*` was written; every capture is
cross-checked across three independent sessions (Python ×2, Node ×1) whose values agree, so no
result here depends on the fixture process's final exit code — but the exit code itself is
unexplained, and a re-run should keep the fixture's stderr rather than `stdio:"ignore"`-style
silence (recorded as a harness note, not a defect in the C1 evidence). The scratch clone and
`${HYAKU_SCRATCH}/tabi-r32/ExecPyClient` were removed after the receipts above were copied into
this output dir. Lane files, lane index and jj state untouched (one read-only
`git clone --shared`; commit-free operations only).
