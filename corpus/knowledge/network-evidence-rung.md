<!-- corpus entry — tabi-shokunin round 4 (2026-10-14), lane T4-1 (plan: plans/round-4.plan.md:3-9; anti-claim :8). Method: a lane-authored 3-navigation loopback fixture (index → click /go 302 → async.html: two async fetches + one client-aborted fetch + a 404 stylesheet + a display:none marker + a GET form → confirm) served by a lane-written ThreadingHTTPServer on 127.0.0.1:19431; a CDP journey runner (fresh headless chromium, debug port 19432, loopback) captures per step: screenshot + DOMSnapshot + URL/history + a full CDP Network-domain slice (requestWillBeSent(+ExtraInfo), responseReceived(+ExtraInfo), loadingFinished/loadingFailed, requestServedFromCache), Network.getResponseBody byte reads and page-side PerformanceResourceTiming. Seven recorded journeys (3 cold-profile, 3 fresh-cache, 1 cache-prepass + revalidating journey) plus one prepass, byte-compared mechanically. Write scope: this file only — LOG.md append (AGENTS.md:3), coverage row and SKILL distillation left to the integrating round (same pattern as multi-step-journey.md:1). Scratch: /tmp/w4-t41-network/ (volatile — the archive obligation cdp-evidence-patterns.md:92 stands for every run's bytes; fixture + server bytes are embedded in §11 so the measured fixture survives /tmp). -->
# Network rung — CDP Network-domain capture on a 3-step loopback journey

Scope: PROVINCE.md:9-13 (CDP session discipline; dynamic-page evidence patterns).
Refusals honored (PROVINCE.md:15-19): no external site loaded or interacted with
(loopback only — plan anti-claim plans/round-4.plan.md:8, recorded again; the one
browser-initiated external trace seen this round is in §7.2), no secrets read, no
consequential action, no session material involved (the chromium profile is
lane-created; every recorded request carried zero Cookie header fields — §4).
Admission bar: corpus/QUALITY.md:1-8. Claims below are observations with anchors,
inference, or §10 unknowns. Evidence produced 2026-10-14 on this host; every pin
below was re-derived from disk at write time.

## 1. The rung — what it is, what it supports

**Rung definition (observed mechanics, §3-§6):** a network rung capture is a
per-step slice of the CDP **Network domain**, enabled before the first navigation
(`Network.enable`, buffer sizes pinned in the script), where every request keeps
four correlated surfaces plus a file-side third party:

| surface | producer | what it carries |
|---|---|---|
| client model | `Network.responseReceived` | effective status, mimeType, protocol, cache flags, `connectionReused`, `encodedDataLength` so far, `response.timing` object |
| wire truth | `Network.responseReceivedExtraInfo` | the raw status code, header text bytes, status line (e.g. `HTTP/1.0 304 Not Modified`) for every hop |
| byte truth | `Network.loadingFinished.encodedDataLength` + `Network.getResponseBody` | totals that close against headers+body (§4); body bytes + sha, including cache-served bodies |
| page-side witness | `PerformanceResourceTiming` (captured from the page at shutter time) | `transferSize`, `encodedBodySize`, `responseStatus`, duration — a third number set that does not always equal the CDP numbers (measured, §4/§10) |
| file-side | the fixture server's own log | one line per request the server answered; the count-vs-hops delta is itself a fact (§6 D6) |

Recipe as executed: `Network.enable` → per-step mark/advance of the request event
list → settle + shutter + DOMSnapshot → `getResponseBody` for every finished
request → slice = every request whose event list grew since the last mark
(`startedInThisSlice` flag). Waits stay state-based (SKILL.md §Bounded waits);
the runner's predicates are sha-pinned (methodology table, §2).

**Ladder placement (rung 4).** SKILL.md §Evidence ladder has rungs 1 (static
bytes), 2 (dynamic capture), 3 (multi-signal). This note is the measured basis
for the rung that a network claim needs: **4 — wire capture**. It supports every
claim class in SKILL.md §'Claim classes → capture' Network row and arbitrates
DOM/screenshot disagreements (§6). It cannot prove rendering (a 200 body says
nothing about the pixels), and it is not a HAR — the netlog-is-not-a-HAR refusal
stands (SKILL.md Network row trap). Integration is the integrating round's move;
this note defines the rung so the SKILL row can be distilled from it.

## 2. Fixture + harness (observed)

**Journey (3 navigations, 6 captures per run).** step-1: `Page.navigate` to
`{base}/index.html` (typed) → capture + 300 ms idle idempotence re-capture.
step-2: real click on `#to-async` (href attribute `go`) → `/go` answers **302 →
`/async.html`**; page script fires `fetch('slow.json')` (server sleeps 400 ms),
`fetch('quick.json')`, and `fetch('slow.json?abort=1')` aborted by an
`AbortController` at 60 ms; capture **early** on a state-wait
(`readyState complete && #async-state === 'waiting'`), then capture **settled**
(`#async-state === 'settled'` with both payload strings rendered). step-3: real
input on `#note` (`Input.insertText 'tabi-r4'`) + radio `#speed-slow` + blur →
capture (state class, same URL). step-4: real click on `#submit` → GET form
submit to `confirm.html?note=tabi-r4&speed=slow&step=3` (form_submit) → capture.

Fixture bytes (`/tmp/w4-t41-network/site/`, sha256 first 12; full hashes in
`methodology-sha.txt`; none of the files ends with a trailing newline):

| file | bytes | sha256-12 | role |
|---|---|---|---|
| `index.html` | 360 | `9736f2ef9f05` | step-1 document; stylesheet + `#to-async` link to `/go` |
| `async.html` | 1,522 | `1ab7b86f55c7` | step-2 document; 3 fetches, 404 `<link>`, `#hidden-note` (display:none) vs `#shown-note`, GET form |
| `confirm.html` | 652 | `23e39f537f25` | step-4 echo of `?note/speed/step` |
| `style.css` | 383 | `a984704c5702` | shared stylesheet (hides `#hidden-note`, fills `#shown-note` blue) |
| `slow.json` | 47 | `274e22192d1d` | payload `SLOW-PAYLOAD-9f2c`; server sleeps 400 ms before answering **including revalidation** |
| `quick.json` | 49 | `3dee70f8b9fd` | payload `QUICK-PAYLOAD-3a1d` |
| `server.py` | 1,800 | `a5ceef29fae5` | ThreadingHTTPServer: `/go` 302, `/slow.json` sleep, stock `If-Modified-Since` 304 path, `no-cache` mode, and an accountable body-write abort marker (`== ABORTED body write (client closed): <path>`) |

Harness (sha256-12): `net-journey.mjs` 475 lines `46c81f99decf` · `net-driver.sh`
106 lines `67c94a3a275d` · `compare.mjs` 57 lines `9823428b4a40` · `summary.mjs`
157 lines `ae5c8fee0d68` · `pixel-scan.py` 75 lines `34b802d04cd9` · `pixel-diff`
`pngdiff.py` 82 lines `24565a826526`. "Same methodology" is a sha256 check
(live-dynamic-capture.md:164-165) — `methodology-sha.txt` pins all of the above.

Browser/server: chromium 152.0.7977.82 (`--headless=new`); effective child line
(run1/driver.log) carries the host-injected set (`--ozone-platform=wayland …`,
`--load-extension=…copy-url`, `--ozone-override-screen-size=800,600`) plus the
requested set (`--remote-debugging-port=19432 --remote-debugging-address=127.0.0.1
--disable-gpu --disable-background-networking`), reproducing round-1 E1
(cdp-evidence-patterns.md:30-32). Listen lines: CDP `127.0.0.1:19432`
(chromium pid), HTTP `127.0.0.1:19431` (python3 pid). Viewport pinned
`Emulation.setDeviceMetricsOverride 800×600×1` → observed innerWidth/Height
800/600 DPR 1 (run1/journey.json `viewport`). Session slot is per launch:
target `id` `025CA29AA3A83958A858E6D9117BDB76` and ws uuid
`1422b29b-ff96-4610-b446-d5258c727479` in run1; seven distinct uuids across the
seven runs (run*/chromium.log). Recorded-journey wall times 0.8–1.2 s; full
driver runs (launch → journey → closure proof) ≈2 s each.

**Runs (all recorded, all cleaned up):** run1/run2/run3 cold-profile (fresh
profile per run, primary record); run4-warm/run4b-warm/run5-warm-nc with a copy
of run1's profile (fresh-cache passes; run5 also had the server send
`Cache-Control: no-cache` — the staging failed to force revalidation, measured,
§6 D7); run6-reval = prepass journey + recorded journey in one session, server
in `no-cache` mode (the prepass stores responses with `no-cache`, so the
recorded journey revalidates — 304s on the wire, §6 D7). Wait discipline: all
state-based; `capture()` settles two rAF frames before the shutter; poll
interval 50 ms, 8 s timeout, last value echoed (net-journey.mjs).

## 3. The journey record (observed)

Cold run1 captures (all pins re-derived from disk; PNGs read back visually —
calibration in the paragraph below the table):

| capture | at | PNG sha256-16 / bytes | shape sha256-16 / nodes | net slice |
|---|---|---|---|---|
| step-1-index | 134 ms | `f639e10d929e99bf` / 16,094 | `a11cc0081388b3cb` / 28 | 3 (index, style, favicon) |
| step-1-index-idem | 499 ms | `f639e10d929e99bf` / 16,094 | `a11cc0081388b3cb` / 28 | 0 |
| step-2-async-early | 617 ms | `2484f8a89f1933e1` / 18,568 | `5bddf0eb6512b0a1` / 67 | 6 |
| step-2-async-settled | 984 ms | `fc99ccec3461b45c` / 22,229 | `549b9e376ff632ac` / 67 | 1 (slow.json completes) |
| step-3-async-filled | 1,051 ms | `cd8e564185d167a3` / 22,825 | `549b9e376ff632ac` / 67 | 0 |
| step-4-confirm | 1,182 ms | `a49bdc73268c7921` / 11,092 | `330fb290f9021adf` / 39 | 2 (confirm, style) |

All PNGs 800×600. Cross-run identity, mechanically (compare.tsv; 150 rows,
127 IDENTICAL / 23 DIFFER, every DIFFER accounted):
- run1 == run2 == run3 on all six captures (PNG + shape + struct) — three
  independent cold server+browser pairs, byte-identical.
- run4-warm/run4b-warm/run5-warm-nc (fresh-cache): every capture identical to
  cold **except** step-2-async-early, which equals the settled capture
  (`fc99ccec3461b45c`) — the pair collapsed, see §5.3. The 6 DIFFER rows.
- run6-reval recorded journey: early/settled/filled/confirm identical to cold;
  step-1-index and its idem re-capture differ (`183bf1a04594705d`) — the
  `:visited` case, §6 D8. The prepass journey's six captures all equal the cold
  pins (`run6-reval/prepass/`).
- within-run expected deltas: early≠settled (cold + reval), settled≠filled
  (all runs) — kept, not errors.

Network facts replicate too: a normalized per-request line
(`URL|type|wire|client|finEnc|fail`, 11 rows) is byte-identical across
run1/run2/run3 (`run*/netfacts.txt`, `diff` = empty).

Navigation history (browser-side witness, run1/journey.json `history`):
`about:blank` auto_toplevel → `/index.html` **typed** → `/async.html` **link**
→ `/confirm.html?…` **form_submit**. The redirect is invisible here (the entry
is the final URL — the redirect exists only in the network slice, §6 D5).

Inputs (state class, `extractInputs` with the `-1` guard of
multi-step-journey.md §3): step-3-filled `note='tabi-r4'`,
`speed-fast=false`, `speed-slow=true`, hidden `step='3'`; step-3 (pre-fill) all
empty, both radios unchecked. Screenshot read-backs: index renders the title,
one paragraph, the blue link; early renders `state: waiting`, `slow: none`,
`quick: none`; settled renders `SLOW-PAYLOAD-9f2c` / `QUICK-PAYLOAD-3a1d`;
filled renders `tabi-r4` in the field and the `slow` radio checked; confirm
renders `note: tabi-r4 / speed: slow / step: 3`. All match the authored fixture.

## 4. Per-request shapes and byte counts (observed)

**Request shape.** Every recorded request is `GET`; request-header records carry
13 names for subresources and fetches, 14–16 for documents (`Sec-Fetch-User` /
`Upgrade-Insecure-Requests` present on documents), with **zero Cookie header
fields in every record** (9 of run1's 11 requests carry a request-headers
record — the two cache-served `style.css` requests produce none; identical in
run2/run3), and `Referer`/`Sec-Fetch-*` set per initiator. `initiator` is
`parser` for the stylesheet, `script` for the fetches; `hasUserGesture=true` on
the click-driven navigation and the form submit. The `/go` request and its
redirect successor share one `requestId`, hop 1 carrying
`redirectFrom {status:302, url:/go, encodedDataLength:139}` (run1/journey.json).

**Response shape.** Wire status lines are `HTTP/1.0 …` (python server; request
lines are HTTP/1.1). Wire header counts and text bytes: 200 → 5 headers /
186–187 B; 302 → 4 / 139 B; 304 → 3 / 129 B; 404 → 5 / 185 B; status lines
`HTTP/1.0 200 OK`, `HTTP/1.0 302 Found`, `HTTP/1.0 304 Not Modified`,
`HTTP/1.0 404 File not found`. Client mimeTypes: `text/html`, `text/css`,
`application/json`, and `text/html` for both 404 bodies (found and favicon).
`connectionReused` measured per request (run1; identical run2/run3): true for
the documents and the first stylesheet load, false for the favicon probe,
`missing.css` and both JSON fetches.

**Byte accounting (cold run1; `finEnc` = loadingFinished.encodedDataLength,
`respEnc` = responseReceived.encodedDataLength, `hdrText` = wire headersText
bytes of the last hop):**

| request | file B | hdrText B | respEnc | finEnc | body B | perf transfer | perf encBody | note |
|---|---|---|---|---|---|---|---|---|
| `/index.html` | 360 | 186 | 186 | 546 | 360 | 660 | 360 | nav entry |
| `/style.css` (index) | 383 | 185 | 185 | 568 | 383 | 683 | 383 | first load |
| `/favicon.ico` | — | 185 | 185 | 645 | 460 | 760 | 460 | 404 probe, not journey |
| `/go` → `/async.html` | 1,522 | 139 + 187 | 187 | 1,709 | 1,522 | 1,822 | 1,522 | redirect chain |
| `/style.css` (async) | 383 | — | 568 | 0 | 383 | 0 | 383 | cache-served, no wire |
| `/missing.css` | — | 185 | 185 | — | 0 | 300 | 0 | 404, then body canceled |
| `/slow.json` | 47 | 192 | 192 | 239 | 47 | 347 | 47 | server slept 400 ms |
| `/quick.json` | 49 | 192 | 192 | 241 | 49 | 349 | 49 | |
| `/confirm.html?…` | 652 | 186 | 186 | 838 | 652 | 952 | 652 | nav entry |
| `/slow.json?abort=1` | 47 | — | — | — | — | 0 | 0 | aborted; perf `responseStatus 0` |
| `/style.css` (confirm) | 383 | — | 568 | 0 | 383 | 0 | 383 | cache-served, no wire |

Closure rule (measured on all 7 completed wire resources):
`finEnc − bodyBytes − lastHopHdrTextBytes = 0` (546−360−186, 568−383−185,
645−460−185, 1709−1522−187, 239−47−192, 241−49−192, 838−652−186). Hop-1 header
bytes of a redirect are **not** counted in `finEnc` (139 excluded; the
`redirectFrom.encodedDataLength=139` field records them). For cache-served
resources the relationship inverts: no wire event at all, `finEnc=0`, `respEnc`
echoes the cached entry's wire size (568), `getResponseBody` still returns the
full body (383 B, sha matches the file pin) — so "the body exists" and "the wire
moved bytes" are different claims with different winners (§6).

Per-step byte totals (sum of `finEnc` over finishes first seen in that step,
cold run1): step-1 1,759 B (index 546 + style 568 + favicon 645) · step-2
2,189 B (go+async 1,709 + quick 241 + slow 239) · step-3 0 B · step-4 838 B.
Cached repeats contribute 0 B by construction.

## 5. Timing classes (observed, as-of-capture — never byte-stable)

### 5.1 Classes measured across the 7 runs

| class | requests | waitMs (req→responseReceived) range | note |
|---|---|---|---|
| loopback document/subresource | index, async(hop2), confirm, style, favicon | 0.6 – 3.3 | totals ≤ 3.1 ms |
| async fast fetch | quick.json | 1.3 – 4.4 | wire-served |
| server-think | slow.json (cold + reval) | **401.3 – 401.7** | `response.timing.recvHeadersEnd` 400.7 (run1); the sleep is server-side and precedes the 304 path too |
| cache hit | slow.json/quick.json/3× style (fresh-cache runs) | 4.0 – 4.4 (fetches), 0 (style) | no wire event; `finEnc=0` |
| client abort | slow.json?abort=1 | fail at **60.2 – 60.3 ms** after start | no response ever; perf entry `duration≈60`, `responseStatus 0` |
| revalidation | all cached URLs (run6-reval) | 0.8 – 1.9, slow.json 401.5 | wire 304, `finEnc=129` header bytes |

### 5.2 Sub-millisecond deltas are not reliable (measured boundary)

`loadingFinished.ts − responseReceived.ts` is negative in 38 of the recorded
request pairs across the seven journeys (−0.1 … −3.4 ms; 5 instances in run1
alone, e.g. quick.json at −2.5 ms) — i.e. the
"finish" timestamp can precede the "response" timestamp at sub-ms scale in the
event stream. Timing claims are made at class granularity (≥1 ms differences
that repeat across runs), never at exact-ms granularity.

### 5.3 The capture-latency window (why the async pair can collapse)

Cold: slow.json request at 512 ms, response at 913 ms (`recvHeadersEnd` 400.7),
early capture at 617 ms (slow.json present as request-only in the slice),
settled capture at 984 ms (finish visible). The pair separates because the
server-think class (~400 ms) dwarfs the capture setup (2 rAF + CDP roundtrips,
tens of ms). Fresh-cache: slow.json answers from cache in ~4 ms, the page
settles before the shutter, and the "early" capture lands on settled bytes —
measured in all 3 fresh-cache runs (step-2-async-early PNG == settled PNG);
the state-wait predicate itself is what raced (it is a bounded wait that fails
loud if the state never appears). Rule: an early/settled pair is only
meaningful when the async work outruns the capture-latency window — verify with
the network slice, not with the predicate's success.

## 6. Where layers disagree — and which layer wins per claim class

Each case below is staged in the fixture and measured on both sides; the winner
is the layer whose evidence can falsify the claim.

**D1 — async payload displayed (early vs settled).** Early DOM shape
`5bddf0eb…` (state `waiting`, both payloads `none`), early screenshot read-back
matches; settled DOM `549b9e37…` + screenshot show `SLOW-PAYLOAD-9f2c` /
`QUICK-PAYLOAD-3a1d`; the network slice shows slow.json request-only at early
time and its 200+finish in the settled slice. Winner: **settled DOM+screenshot
for the display claim** (network can prove the bytes arrived, never the render);
the early capture falsifies the claim if presented as final, and the network
timing is the only layer that explains why.

**D2 — text present vs text visible.** `#hidden-note`
(`HIDDEN-MARKER-7b3e`, `display:none`, red background) is present in the DOM
shape of both async captures (grep = 1) and in the raw DOMSnapshot; the
screenshot shows `SHOWN-MARKER-2c7f` as a blue band and no red band.
Pixel-count on the settled PNG: blue (0,0,255)±10 = **17,079 px**; red
(255,0,0)±10 = **0 px** (same on early). Winner: **DOM for "in the document",
screenshot for "visible"**; the network layer says nothing about either.

**D3 — the stylesheet that failed.** `/missing.css` returns 404 (wire + client
+ server log), then the client cancels the body (`loadingFailed
net::ERR_ABORTED`, `canceled:true` at +1.2 ms; `getResponseBody` = 0 bytes,
empty sha; perf `encBody=0`, `transfer=300`, `status=404`). The favicon 404 in
the same run is **not** canceled (645 B, body 460 B) — observed contrast,
mechanism unexamined. The page renders normally (style.css applied): nothing in
DOM or screenshot distinguishes the failed stylesheet from a loaded one.
Winner: **network for "the resource loaded"** (only layer that sees the
failure); screenshot for "the page rendered with fallback styling".

**D4 — the request that was abandoned.** `fetch('slow.json?abort=1')` +
`AbortController.abort()` at 60 ms: client `loadingFailed net::ERR_ABORTED`
(canceled), no response; page-side perf entry exists with
`duration≈60 ms`, `transferSize=0`, `responseStatus=0`. On the wire (cold +
reval runs) the server had already logged its status line **200**, then failed
the body write — the fixture server records `== ABORTED body write
(client closed): /slow.json?abort=1` (run1/http.log). DOM and screenshot carry
no trace of the attempt (nothing references it). In the 3 fresh-cache runs the
abort fired before the request reached the wire (no server line) — the 60 ms
abort race has both outcomes in the record. Winner: **network for "a request
was attempted/abandoned"**; the server log alone would claim a 200 that no
client ever received — name the surface, and pair client fail with the
body-write marker before claiming anything about delivery.

**D5 — the redirect.** `/go` → 302 → `/async.html`: the network slice shows
both hops under one requestId (wire `[302,200]`, hop-1 header text 139 B,
`redirectFrom` set); URL read-back, history (`link`) and the DOM only ever show
the final `/async.html`. Winner: **network for "the navigation went through a
redirect"** (plus the server log line `GET /go … 302`); URL read-back is the
as-normalized result and cannot carry the claim (round-2 erratum,
cdp-evidence-patterns.md:139-150).

**D6 — cache-served client events with no wire line.** Cold runs: `/style.css`
on the async and confirm pages appears as a client `requestWillBeSent` +
`requestServedFromCache` + `responseReceived 200` + `finEnc=0`, with **no**
`responseReceivedExtraInfo` and **no** server line. Client hops for style.css =
3 vs server lines = 1 (count-based `summary.mjs` output; the old path-set
comparison missed this — set membership hides the delta, counts do not).
`getResponseBody` still returns the body. Winner: **server log for "the server
served N requests"**; client events for "the page obtained the resource (from
somewhere)"; perf `transferSize=0` is the page-side agreement for "no wire
bytes".

**D7 — wire 304 vs client 200 (revalidation; in-protocol witness).** run6-reval
recorded journey: all six cached URLs wire `304` with 3 headers / 129 text
bytes / `finEnc=129`, server log `304`; the client reports `200` for index,
async, confirm, slow.json, quick.json — but **304 for the style.css
subresource** (2 of 3 style loads). So: `responseReceivedExtraInfo.statusCode`
is the wire status; `responseReceived.status` is the effective client status
and can be either 200 or 304 for the same wire path; the cache flags
(`fromDiskCache/fromMemoryCache`) are **false** under revalidation even though
the body never crossed the wire again (`finEnc=129`, body served from cache).
Staging note, measured: adding `Cache-Control: no-cache` to the server's
responses does **not** revalidate entries that were stored without it
(run5-warm-nc behaves exactly like the fresh-cache runs: no 304s, no wire lines
for cached URLs). The prepass-in-same-session staging is what forces the path
(recorded in run6-reval/http.log: 10×304 vs 8×200 + 3×404 + 2×302 across
prepass+journey).

**D8 — the pixels that no DOM can see: `:visited`.** run6-reval's recorded
journey renders `index.html` differently from every other run
(`183bf1a04594705d` vs the `f639e10d929e99bf` pin) while its DOM shape and
struct are byte-identical (`a11cc0081388b3cb`) and its shape text too. A pixel
diff (`pngdiff.py`) localizes it: 1,033 differing pixels, bbox (24,160)–(216,174)
— exactly the link line — colors (0,0,238) → (85,26,139): default blue →
visited purple. Explaining layer: the session's prior visit to `/go` in the
prepass (history/network fact, run6-reval/prepass/journey.json). Winner:
**screenshot for "the page renders the same"** (the claim is falsified at the
pixel level), DOM shape is blind to `:visited`, and the network/session history
is the only layer that explains why.

**Layer-wins decision table (claim class → winning layer):**

| claim | winning layer | measured counterexample/agreement |
|---|---|---|
| which requests/hops/statuses occurred | Network (client events + wire ExtraInfo), server log for counts | D4 (abort has no DOM trace), D6 (client 3 vs server 1) |
| the wire status | `responseReceivedExtraInfo` (+ server log) | D7 (304 vs 200; client 304 too on one path) |
| bytes transferred | `finEnc` with the closure rule; perf transferSize as a second, non-equal number | §4 closure = 0 on 7 resources; 660 vs 546 on index |
| response body bytes | `getResponseBody` (works for cache-served; canceled = 0 B) | D3, §4 |
| latency class | CDP event deltas + `response.timing` at ≥1 ms granularity | §5.2 negative sub-ms deltas |
| visible rendered state | screenshot (pixel-level tools for machine checks) | D2, D8 |
| document content incl. invisible | DOMSnapshot/shape | D2 |
| displayed *after* async work | settled DOM+screenshot; network explains the race | D1, §5.3 |
| page state / input values | DOMSnapshot columns | §3 inputs |
| "no external contact" | neither; browser log + process discipline (egress caveat) | §7.2 |

## 7. Determinism boundary

**7.1 Byte-reproducible in this environment:** all six capture artifacts
(PNG + shape + struct) across the three cold runs, and across the fresh-cache
runs — the only exceptions are the two documented ones (collapsed early pair,
`:visited` PNG). Fixture bytes, method shas, per-request fact lines, byte
counts, status classes per cache regime, body shas, history transitions,
viewport record, browser/protocol provenance.

**7.2 Not byte-reproducible:** timestamps and `atRelMs`; session slots (target
`id`, browser ws uuid — 7 distinct uuids across 7 launches); ports/pids;
sub-ms timing deltas; the abort race (§6 D4); the capture-latency race
(§5.3). Browser egress: `--disable-background-networking` did not stop the
browser's own Google GCM registration attempts — 3 `google_apis/gcm` lines in
run6-reval/chromium.log (7 total lines), 0 lines in the other six runs
(rounds 1–2 measured the same class; round 3 saw none). Loopback ≠ no-egress;
the journey itself never loaded an external URL, and no external site was
interacted with this round.

**7.3 Boundary rests on:** same chromium build, same effective flags (child
line recorded), same viewport override, same fixture bytes, same wait
predicates, same host. Environment-scoped (r2 caveat,
cdp-evidence-patterns.md:72, stands); not measured beyond this host/build.

## 8. Cleanup + closure proof (executed per run, re-verified at write time)

Per run (identical line sets in run1..run6 driver.logs): `no chromium
survivors after TERM` · `pass: no chromium process for …/profile` · `pass:
ports 19431/19432 not listening` · `curl cdp exit=7` · `curl http exit=7`;
kill by discovered PIDs only (never `pkill -f`; r1 self-match,
cdp-evidence-patterns.md:105). Final global check at write time
(2026-10-14T16:32:09Z): ports 19431/19432 not listening; chromium processes
with a w4-t41 profile = 0 (0 chromium processes overall); no fixture server
process; both curls exit 7. External state, shape-only observation: the
webbridge daemon port 10086 has **no listener** at write time — the round-2
daemon state (pid 3934817) is not current; not this lane's surface (D2 owns
it), recorded here only as the live-state recheck
(webbridge-daemon-disposition.md:163) came up empty.

## 9. Rules delta — what the network rung adds to the envelope

1. **Separate the status surfaces.** `responseReceivedExtraInfo.statusCode` is
   the wire; `responseReceived.status` is the effective client model and can be
   200, 304, or absent while the wire says something else. Cache flags are not
   a wire-contact signal under revalidation (D7).
2. **Close the byte equation.** `finEnc = last-hop header text + body bytes`
   (redirect hop-1 headers excluded) — run it before quoting any byte claim;
   `getResponseBody` is the body witness (also for cache hits), and the
   page-side `transferSize` is a different number that must not be substituted
   (D6, §4, §10.1).
3. **Call the abort what it is.** A client `ERR_ABORTED` plus a server
   status-line log plus a body-write failure is three surfaces describing one
   event; any single one of them alone misleads (D4). Fixture servers should
   make the body-write abort attributable (the `== ABORTED body write` marker).
4. **Timing claims at class granularity**, never below ~1 ms (§5.2); the pair
   capture rule for async steps: only trust an early/settled pair when the
   network slice shows the async work outrunning the capture window (§5.3).
5. **Screenshot is the only rendered-state layer**; DOM shape is blind to
   visibility and `:visited`, and pixel tools can machine-check colors/bboxes
   (D2, D8). Keep the pair: DOM shape + PNG + the network slice for one step.
6. **Count-based server/client comparison** (per-path counts, not set
   membership) or the cache-served delta hides (D6).
7. **Staging cache regimes:** fresh profile per cold run (logged); a
   fresh-cache pass must be populated in-session (prepass) if revalidation is
   the target — `no-cache` on responses alone does not force it (D7).

## 10. Unknowns (do not convert to claims without a new probe)

1. Why the page-side `transferSize` exceeds CDP `finEnc` by a consistent
   ~114–115 B on 200s (660/546, 683/568, 760/645, 1822/1709, 347/239…):
   different accounting definitions (unexamined).
2. Why the client reports 304 for the revalidated style.css subresource but
   200 for every other revalidated resource (D7).
3. Why `/missing.css` (a 404 stylesheet) is canceled after `responseReceived`,
   while the favicon 404 in the same run is not (D3); mechanism unexamined.
4. The abort race: in fresh-cache runs the 60 ms abort landed before the
   request reached the wire; why it consistently did there and not in
   cold/reval runs is unexamined (D4).
5. `fromMemoryCache` remains never-true in the records; `fromDiskCache` is true
   only for fresh cache hits and false under revalidation — protocol semantics
   unexamined (D7).
6. Why the fresh-cache runs' early capture sometimes misses the `waiting`
   window entirely (the predicate raced at ~4 ms cache latency); observed
   widely across attempts, but the exact race outcome varies run to run
   (§5.3).
7. Whether the ~1033-pixel `:visited` delta generalizes (other link colors,
   other states); one measured instance with full localization only (D8).
8. Byte-identity generality beyond this host/build/font stack (r2 §7.3
   stands); real-site journeys (third-party JS, POST, redirects with bodies)
   untested by rule this round.

## 11. Reference fixture (embedded — fixture bytes survive /tmp)

Files as written to `/tmp/w4-t41-network/site/`; each is pinned above (sha256
first 12) and ends **without** a trailing newline — strip the final newline a
Markdown extraction adds before hashing. `server.py` listed with them.

`index.html` (360 B):
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R4-1 index</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="frame">
<h1>TABI-R4-1 network rung fixture</h1>
<p id="static">step 1 — index. wire facts: document + stylesheet.</p>
<p><a id="to-async" href="go">go to the async page</a></p>
</div>
</body>
</html>
```

`async.html` (1,522 B):
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R4-1 async</title>
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="missing.css">
</head>
<body>
<div id="frame">
<h1>TABI-R4-1 async page</h1>
<p>state: <span id="async-state">waiting</span></p>
<p>slow: <span id="payload-slow">none</span></p>
<p>quick: <span id="payload-quick">none</span></p>
<p id="shown-note">SHOWN-MARKER-2c7f</p>
<p id="hidden-note">HIDDEN-MARKER-7b3e</p>
<form id="note-form" action="confirm.html" method="get">
  <label>note <input id="note" name="note" type="text" value=""></label>
  <label><input id="speed-fast" name="speed" type="radio" value="fast"> fast</label>
  <label><input id="speed-slow" name="speed" type="radio" value="slow"> slow</label>
  <input type="hidden" name="step" value="3">
  <button id="submit" type="submit">send</button>
</form>
</div>
<script>
(function () {
  var ctl = new AbortController();
  fetch('slow.json?abort=1', { signal: ctl.signal }).catch(function () {});
  setTimeout(function () { ctl.abort(); }, 60);
  var slow = fetch('slow.json').then(function (r) { return r.json(); });
  var quick = fetch('quick.json').then(function (r) { return r.json(); });
  Promise.all([slow, quick]).then(function (vals) {
    document.getElementById('payload-slow').textContent = vals[0].value;
    document.getElementById('payload-quick').textContent = vals[1].value;
    document.getElementById('async-state').textContent = 'settled';
  });
})();
</script>
</body>
</html>
```

`confirm.html` (652 B):
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R4-1 confirm</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="frame">
<h1>TABI-R4-1 confirm</h1>
<p>note: <span id="out-note"></span></p>
<p>speed: <span id="out-speed"></span></p>
<p>step: <span id="out-step"></span></p>
</div>
<script>
(function () {
  var q = new URLSearchParams(location.search);
  document.getElementById('out-note').textContent = q.get('note') || '';
  document.getElementById('out-speed').textContent = q.get('speed') || '';
  document.getElementById('out-step').textContent = q.get('step') || '';
})();
</script>
</body>
</html>
```

`style.css` (383 B):
```css
html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; font: 16px/1.5 monospace; }
#frame { width: 800px; height: 600px; box-sizing: border-box; padding: 24px; }
#shown-note { background: #0000ff; color: #ffffff; }
#hidden-note { display: none; background: #ff0000; color: #ffffff; }
#async-state { font-weight: bold; }
form label { display: block; margin: 6px 0; }
```

`slow.json` (47 B): `{"endpoint":"slow","value":"SLOW-PAYLOAD-9f2c"}`

`quick.json` (49 B): `{"endpoint":"quick","value":"QUICK-PAYLOAD-3a1d"}`

`server.py` (1,800 B):
```python
#!/usr/bin/env python3
"""TABI lane T4-1 fixture server — loopback only.

Routes: static site files; /go -> 302 to /async.html; /slow.json sleeps SLOW_MS
before the stock static handler answers. Stock SimpleHTTPRequestHandler carries
the Last-Modified / If-Modified-Since 304 path used by the warm passes.
Usage: server.py <site-dir> <port> [slow-ms] [no-cache]
"""
import sys
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = sys.argv[1]
PORT = int(sys.argv[2])
SLOW_MS = int(sys.argv[3]) if len(sys.argv) > 3 else 400
NO_CACHE = len(sys.argv) > 4 and sys.argv[4] == "no-cache"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        if NO_CACHE:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/go":
            self.send_response(302)
            self.send_header("Location", "/async.html")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if path == "/slow.json":
            time.sleep(SLOW_MS / 1000.0)
        return super().do_GET()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def copyfile(self, source, outputfile):
        try:
            return super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            sys.stderr.write("== ABORTED body write (client closed): %s\n" % self.path)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
```

## 12. Errata (append-only — never edit above blocks)

*(none yet)*

Appended 2026-10-14 (tabi round 5, lane B5-3 — pin refresh; derivation pass 17:01–17:06Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `4889ccf073a8399716b8347ab45659ea471f4ad808f46c14ebdd140c2241d335`. The post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, pin refresh] VERIFIED — §2 table 13/13 from the live scratch; file pin held.** fixture `9736f2ef9f05` / `1ab7b86f55c7` / `23e39f537f25` / `a984704c5702` / `274e22192d1d` / `3dee70f8b9fd` / `a5ceef29fae5`; harness `46c81f99decf` (475) / `67c94a3a275d` (106) / `9823428b4a40` / `ae5c8fee0d68` / `34b802d04cd9` / `24565a826526` — all match, `/tmp/w4-t41-network/methodology-sha.txt` re-checked. §11's embedded fixture was not byte-diffed in this pass. This note's hash → `4889ccf073a8…` (605). Same-day-later pass — a strictly-later-date re-derivation remains open (round-5 plan clause (c)).