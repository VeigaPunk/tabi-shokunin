# r32 w1 — C1 probe: `network.addDataCollector` timing and `getData` retrieval (chromium 154 BiDi)

Seat: `ExecCollectorTiming`. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`;
work done in a shared clone at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`
(`scripts/check-bidi-runtime.mjs` sha256 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`,
byte-identical to `claims.json.frozenDigests`). Loopback fixture only
(`serveFixture()` imported from the frozen counter). No lane file was edited.

## Verdict

The four requested collector-timing cases hold as the round-13 correction predicts for
cases 1 and 2, and **case 3 contradicts the correction's stated mechanism**, while case 4
shows a third, undocumented error path. On chromium 154.0.8037.97 + chromedriver
154.0.8037.97 over BiDi: (1) with the collector added **before** navigation, `getData`
returns the fixture body exactly, `{"bytes":{"type":"string","value":"tabi-bidi-body-0123456789\n"}}`
(26 bytes); (2) with the collector added **after** `network.responseCompleted`, `getData`
fails `no such network data` / `No collected response data` — the record was never
created, and no later registration recovers it; (3) with `maxEncodedDataSize: 10`
(smaller than the 26-byte body) the answer is **also** `no such network data` / `No
collected response data` — not the spec's `unavailable network data`, i.e. chromium
creates **no record at all** instead of a record with null `bytes`; (4) `dataType:
"request"` on a plain GET navigation fails `unknown error` / `No post data available for
the request` (a chromium-bidi `UnknownErrorException`), while the same collector on a
`fetch` POST returns the post body (`hello=world`, 11 bytes). Two further sweeps sharpen
the correction: registering the collector on the `network.responseStarted` event is
**already too late**, and `maxEncodedDataSize` does **not** cap the collected body at all
— a 20 000-byte body is returned in full with `maxEncodedDataSize: 200`, while too-small
limits make the record disappear entirely at a threshold that tracks the response's
**header block** (~197 B for a default header block, ~810 B with a 600-byte extra header,
~1425 B with 1200) and is unaffected by `maxTotalCollectedSize`. Net for the lane:
correction bullets 1–3 (`corpus/knowledge/webdriver-bidi-capability-matrix.md:141-156`)
are confirmed by runtime; bullet 4 (`:157-161`) is contradicted on its "body within that
collector's max encoded item size" clause; the counter's own choice of
`maxEncodedDataSize: 65536` clears the header-block threshold with margin, so R12's live
leg is not at risk, but any smaller value (≤ ~200 B) would silently yield no data.

## Environment

| Item | Value |
|---|---|
| Host | linux x64, Arch (`7.2.11-arch1-1`) |
| node | v24.21.0 (global `WebSocket`, native `fetch`) |
| chromium | `/usr/bin/chromium` — `Chromium 154.0.8037.97 Arch Linux` |
| chromedriver | `/usr/bin/chromedriver` — `ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})` |
| BiDi session | classic `POST /session` with `webSocketUrl: true`; capability reply `browserVersion 154.0.8037.97`, `webSocketUrl ws://127.0.0.1:<port>/session/<id>` |
| fixture | `serveFixture()` from the frozen counter (`FIXTURE` `/a.html`, `/b.html`, `/data.txt`); `DATA_TEXT = "tabi-bidi-body-0123456789\n"` = 26 B, `FIXTURE_SHA256` printed in every `summary.json` |
| client | my own Node WS client (`probe*.mjs`, co-located in `src/`), not the counter's `liveRecord` |
| browser profile | throwaway `--user-data-dir` under scratch; chromium `TMPDIR` a short `/tmp/tc-*` (singleton socket path limit), chromedriver spawned with `TMPDIR=<scratch>` |
| externals | none: no external HTTP fetch, no login, no credential read; only `127.0.0.1` servers I started |
| tools installed/upgraded | none (nothing needed; `pacman` untouched) |

Commands run (all from `/fast/scratch/hyaku/tabi-r32/ExecCollectorTiming`, `TMPDIR=<scratch>`):

| # | Command | Exit | Output |
|---|---|---|---|
| 1 | `git clone --shared …/tabi-shokunin …/clone && git -C …/clone checkout -q --detach 4181fffb…` | 0 | clone at the frozen commit |
| 2 | `sha256sum clone/scripts/check-bidi-runtime.mjs` | 0 | `2f25af5a…c393` = `frozenDigests` |
| 3 | `TMPDIR=$S timeout 180 node probe.mjs $S/out $S` | 0 | cases c1–c5 (run 1) |
| 4 | `TMPDIR=$S timeout 300 node probe2.mjs $S/out2 $S` | 0 | repeats + boundary + timing cases |
| 5 | `node probe3.mjs` (size sweep) | 0 | `runs/out3` |
| 6 | `node probe4.mjs` … `node probe12.mjs` (threshold maps, order control, body×limit matrix, header sweep, `maxTotalCollectedSize` interaction) | 0 each | `runs/out4` … `runs/out12` |
| 7 | `pgrep -fa 'chromedriver\|chromium'` after each run | — | only the pre-existing `earlyoom` line (its `--prefer` pattern text); no chromium/chromedriver of mine |

## Case 1 — collector added **before** navigation (dataType `response`, `maxEncodedDataSize` 65536)

Raw frames (`runs/out/c1.jsonl`):

```
send {"id":6,"method":"network.addDataCollector","params":{"dataTypes":["response"],"maxEncodedDataSize":65536}}
recv {"id":6,"result":{"collector":"ba3c0515-57a0-4ce5-bb52-a5420a4de440"},"type":"success"}
send {"id":7,"method":"browsingContext.navigate","params":{"context":"…","url":"http://127.0.0.1:44633/data.txt?c1=1","wait":"complete"}}
recv {…"method":"network.responseCompleted","params":{"response":{"url":"http://127.0.0.1:44633/data.txt?c1=1",…},"request":{"request":"120951C2EDC13BEBD96EE7ED3686F0E3"}}}
send {"id":8,"method":"network.getData","params":{"dataType":"response","request":"120951C2EDC13BEBD96EE7ED3686F0E3"}}
recv {"id":8,"result":{"bytes":{"type":"string","value":"tabi-bidi-body-0123456789\n"}},"type":"success"}
```

26 bytes returned as `string` (not base64) and byte-equal to `DATA_TEXT`. Reproduced in run 2
(`c1`, `runs/out2/summary.json`) and in the counter-shaped fetch path: `c11` in run 2 adds a
`response` collector, `fetch('/data.txt?c11=1',{method:'POST',body:'hello=world'})` from the page,
and `getData` returns `tabi-bidi-body-0123456789\n`. This is the exact shape R12's predicate
requires (`getData` after the collector, bytes = `DATA_TEXT`), so R12 is runtime-satisfiable.

## Case 2 — collector added **after** `network.responseCompleted`

Raw frames (`runs/out/c2.jsonl`):

```
send {"id":11,"method":"network.addDataCollector","params":{"dataTypes":["response"],"maxEncodedDataSize":65536}}
recv {"id":11,"result":{"collector":"bf3ca1ee-59aa-4f5f-9a35-a8a09f55d2e9"},"type":"success"}
send {"id":12,"method":"network.getData","params":{"dataType":"response","request":"EA0CD1160E2570A9BDC9B00A21D65F34"}}
recv {"id":12,"error":"no such network data","message":"No collected response data","type":"error"}
```

The navigation to `/data.txt?c2=1` completed first (the case waits 250 ms after
`responseCompleted` before registering), the collector is accepted (a collector id is
issued), and the earlier request is unrecoverable. Reproduced in run 2 (`c2`). This
confirms the correction's operational claim: `getData` is retrieval, never retroactive
collection.

## Case 3 — `maxEncodedDataSize: 10` < body (26 B)

Raw frames (`runs/out/c3.jsonl`):

```
send {"id":14,"method":"network.addDataCollector","params":{"dataTypes":["response"],"maxEncodedDataSize":10}}
recv {"id":14,"result":{"collector":"e5de2692-60ab-4b49-a27b-ad9157a2f485"},"type":"success"}
send {"id":16,"method":"network.getData","params":{"dataType":"response","request":"3DCED033D588BCF1AE407BED48DDB6D5"}}
recv {"id":16,"error":"no such network data","message":"No collected response data","type":"error"}
```

The collector is created, the response completes, and `getData` reports **no record**.
The confound to state plainly: 10 B is below the collector's observed floor for *any*
response on this build (first success at 198 B with a default header block, `out11`), so the
12 B gap between the limit and the 26 B body is **not** what produced the miss — the limit
never reaches a value at which the body could matter, because the body is never gated at all
(next paragraph).
Observed error vocabulary across 366 probe cases: `no such network data` for every missing-record
case (including this one) and, for request data with no post body, `unknown error` (case
4). **`unavailable network data` was never produced.**

Why that matters beyond the literal case-3 setup: the size limit is not compared against
the body. Sweeps (`runs/out3`, `out4`, `out6`, `out7`, `out9`, `out10`, `out11`):

| Observation | Evidence |
|---|---|
| Body size is **not** capped: 2000 B returned in full at `maxEncodedDataSize: 200`; 5000 B at 200; 20 000 B at 200 (`b20000-l200 -> OK 20000B`) | `runs/out9/summary.json` (`m-l200-b*`), `runs/out10/summary.json` (`b*`) |
| The failure threshold is identical for every body from 1 B to 2000 B inside one session (limit 190 → no record; limit ≥ 200 → record; all six bodies in a limit-major order) | `runs/out9/summary.json` |
| The threshold tracks the response **header block**: no extra header → first success at 198 (191/192/195 fail, 198/199/200 OK); +100 B header → fail 300, OK 320; +600 B → fail 800, OK 820; +1200 B → fail 1400, OK 1450 | `runs/out11/summary.json` |
| `maxTotalCollectedSize` does not move the threshold and does not cap: `{maxEncodedDataSize:190, maxTotalCollectedSize:1048576}` still fails; `{maxEncodedDataSize:65536, maxTotalCollectedSize:200}` still returns 20 000 B | `runs/out12/summary.json` |
| Deterministic across three repeats per size and across ascending/descending order and across both origins (fixture and my own server) inside a session; the absolute floor varied between sessions: first success >180 in `out7`, exactly 218 in `out8` (217 fails), 198 in `out11` (195 fails) | `runs/out6`, `out7`, `out8`, `out11` |

[INFERENCE] The exact accounting is not established; the 1:1 tracking of the *extra
header bytes* with a ~197 B base (date/content-type/cache-control/connection/keep-alive/
transfer-encoding on Node's default reply) is consistent with the limit being applied to
the response's encoded header block rather than the body, but a header-block-only theory
was not isolated from, e.g., a chromium-bidi buffer-size mapping. What is measured, not
inferred, is that the body is never truncated and never causes the miss.

## Case 4 — `dataType: "request"`

GET navigation, no post body (`runs/out/c4.jsonl`):

```
send {"id":20,"method":"network.getData","params":{"dataType":"request","request":"817272982F33170DC01469731CA551E8"}}
recv {"id":20,"error":"unknown error","message":"No post data available for the request",
      "stacktrace":"Error\n    at new UnknownErrorException (<anonymous>:65:5630)\n    at CommandProcessor.processCommand (<anonymous>:485:14806)","type":"error"}
```

POST with an 11-byte body (`runs/out2/c10.jsonl`):

```
send {"id":30,"method":"network.addDataCollector","params":{"dataTypes":["request"],"maxEncodedDataSize":65536}}
send {"id":32,"method":"network.getData","params":{"dataType":"request","request":"3629026.9"}}
recv {"id":32,"result":{"bytes":{"type":"string","value":"hello=world"}},"type":"success"}
```

So request-data collection works when the request carries post data and the record exists;
when it does not, chromium-bidi raises its own generic `UnknownErrorException` (mapped to
`unknown error`) instead of the spec's `no such network data`. Reproduced as `c14` in run 2
(same URL shape as c4, same error). Note the request ids differ in shape between
navigations (`817272982F33170DC01469731CA551E8`) and page-fetch requests (`3629026.9`);
`getData` accepts both as opaque strings.

## Two timing refinements

- **Registering on `network.responseStarted` is too late** (`runs/out2/c12.jsonl`): with no
  collector at navigation start, the responseStarted event arrives, `addDataCollector` succeeds
  (id 39), the navigation completes, and `getData` (id 40) still returns
  `no such network data`. Caveat: for a 26-byte reply the body may already have completed by
  the time the event is delivered, so this bounds the deadline at "before response
  creation", not at "before responseStarted plus epsilon".
- **`getData` issued at responseStarted, with the collector pre-registered, succeeds
  immediately** (`runs/out2/c13.jsonl`, `getDataMs: 8`): collector id 42 added before the
  navigate, `getData` (id 44) sent on receipt of responseStarted, full body returned. This
  is consistent with the record being created at/with the response and `bytes` already
  populated for a tiny body; it does not by itself prove the spec's "pending record awaits"
  path, which this fixture does not exercise.
- A control with a fabricated request id (`runs/out/c5-control-unknown-request.jsonl`)
  returns the same `no such network data` / `No collected response data` as cases 2 and 3,
  i.e. the error is indistinguishable from "collector missed the record".

## Which round-13 correction sentences the observations confirm or contradict

`corpus/knowledge/webdriver-bidi-capability-matrix.md`, `## Dated correction — 2026-10-20 (round 13)`:

| Lines | Sentence (abridged) | Runtime verdict |
|---|---|---|
| 141-147 | record is created only when the collector map is non-empty and the clone sets `cloned body` in that same step; "adding one after `network.responseCompleted` cannot recover that response body" | **confirmed** (case 2; and strengthened by `c12`: even at responseStarted it is too late) |
| 148-150 | §7.5.2 note: "there are no collectors setup when the response is created" ⇒ "does not clone the corresponding body" | **confirmed** (cases 2 and 3 both yield no record) |
| 151-156 | `getData` "retrieves a network data if it is available"; returns `no such network data` when no record exists **and `unavailable network data` when the record's `bytes` is null**; pending record awaits collection | **partly confirmed**: `no such network data` observed; retrieval-not-collection confirmed (case 2, `c12`); **`unavailable network data` never observed**, and the "bytes is null" state was not producible — the too-small-limit case yields *no record*, not a null-bytes record |
| 157-161 | whether `bytes` is stored depends on a `response` collector whose context matches, **"with the body within that collector's `max encoded item size`"**; total capped by `max total collected size` | **contradicted on the body clause**: 20 000-byte body returned in full at `maxEncodedDataSize: 200`; the limit gates on the response header block instead. The context-match and `dataTypes` preconditions were not varied (every collector here carried `["response"]` for the top-level context). `maxTotalCollectedSize` showed no effect in either direction (`out12`) |
| 163-166 | operational deadline is response creation/clone, before any `getData` | **confirmed and sharpened** (cases 1–2, `c12`); the correction's closing "No BiDi endpoint, browser, or collector was exercised" is now superseded by this measurement |

## Consequences for the C1 entry and the R12 row

- The counter's `liveRecord` uses `addDataCollector({dataTypes:["response"], maxEncodedDataSize:65536})`
  before navigating: measured safe (threshold is header-bound, ~197 B + headers). R12's live
  leg is not at risk from collector timing.
- Any future evidence script that lowers `maxEncodedDataSize` towards the body size will get
  **no data with a misleading "no such network data"**, not a truncated body. A comment in
  the round-32 entry (and eventually the matrix row) should say the limit is not a body cap
  on this build.
- `dataType: "request"` is usable only for requests that carry post data; a GET yields
  `unknown error` — a wording difference from the spec that a receipt-level vocabulary check
  should expect if the lane ever collects request data.
- U4 (performance of collector-gated capture vs post-hoc CDP `getResponseBody`) is **not**
  claimed here: the only timing captured is `getData` latency at responseStarted (8 ms on a
  26-byte body), which is not a comparison.

## Evidence inventory

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/w1/ExecCollectorTiming/`

- `MANIFEST.json` — 55 files, 6 122 519 B, sha256 each; manifest sha256
  `ad3c1771c94aeba31beff198ed168dbd99a7b6c00bcf48d43f356d06b3ce53e9`.
- `runs/out/` — run 1: `summary.json`, `frames.jsonl` (all wire frames, tagged by case),
  `c1.jsonl` … `c5-control-unknown-request.jsonl`, `classic-new-session.json`.
- `runs/out2/` — run 2: repeats, `c10` (request POST), `c11` (response POST), `c12`
  (register at responseStarted), `c13` (getData at responseStarted), `c14` (request GET repeat).
- `runs/out3` … `runs/out12/` — `summary.json` (+ `table.json` where the probe printed one)
  for the size/order/body×limit/header/`maxTotalCollectedSize` sweeps.
- `src/probe.mjs` … `src/probe12.mjs` — the probe programs exactly as executed.

## Risks and caveats

- Mechanism not established: "limit gates the header block" is an inference from the 1:1
  scaling in `out11`, not a source-level reading; only the measurements above are claims.
- Per-session variance of the absolute floor (~190 in one session, 217/218 in another) is
  recorded as observed; every decision above depends on the *ordering* of thresholds, which
  was stable within each session and reproduced in two independent sessions (`out10`, `out11`).
- `FIXTURE` served from a `127.0.0.1` ephemeral port in every run; no external navigation, no
  cookies or credentials touched (`storage.getCookies` was never called).

## Hygiene

- Scratch `/fast/scratch/hyaku/tabi-r32/ExecCollectorTiming` deleted after copying receipts
  (see closing command receipt in the wave hand-off; `test -e` returns 1).
- No chromium/chromedriver left running: `pgrep -fa 'chromedriver|chromium'` matched only the
  pre-existing `earlyoom` command line (its `--prefer` regex text contains "chromium").
- No lane file, lane git index, jj state, fleet repo or sibling lane was written; the only
  writes are this report, the seat output dir, and the scratch clone (commits: none — the
  clone is used read-only).
- No tooling installed or upgraded this wave.
