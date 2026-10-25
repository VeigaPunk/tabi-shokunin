<!-- corpus entry — tabi-shokunin round 7 (2026-10-14), lane B7-1 (assignment B7-1: the synthesis note — the network+async evidence of rounds 4-6 synthesized into the claim-class → layer-routing table, with the measured disagreement cases as rows; that file path is the assignment's output). Method: read-only synthesis over the landed corpus notes and audit reports of rounds 4-6 (plus the round-2/3 anchors those notes rest on); zero new measurements, zero browser launches, zero network acts. Every row carries its source anchor (path:line); anything this note concludes beyond its sources is marked [synthesis]. Write scope: this file only — LOG.md append (AGENTS.md:3), the corpus/README.md coverage row, the SKILL.md distillation and the commit are the integrating round's (r2/r3/r4 pattern). Scratch: /tmp/w7-b71-synth/ (source-pin derivation; volatile). Anti-claim restated: no external site; no browser run; no session material; substrates read-only. -->
# Layer routing synthesis — which claim class routes to which evidence layer (network + async, rounds 4–6)

Scope: PROVINCE.md:9-13 (CDP session discipline; dynamic-page evidence patterns;
interaction-record discipline). Refusals honored (PROVINCE.md:15-19): no external
site; no interaction; nothing posted/filled/submitted anywhere; no secrets or
session material read (shape-only rules never needed here — this lane read only
in-repo text).

Admission bar: corpus/QUALITY.md:1-8. This note measures nothing. It re-states,
with anchors, the routing decisions the corpus already measured across rounds 4-6:
`network-evidence-rung.md` §6 (the r4 layer-wins decision table and its D1-D8
cases), `async-step-evidence.md` §2/§5 (the held-request pair and the
subresource wire-class variant), `external-class-fixture-v2.md` §4/§5/§7 (the
redirect chain across three layers and the four trip classes), and the audit
reports (`reports/r4-aud-tab1.md` §2, `reports/r6-aud-b6.md`). Statements quoted
from those sources keep their anchors; rows assembled here that are not verbatim
in one source are marked **[synthesis]**. Unknowns stay in §5 — do not convert
them to claims without a new probe.

Why a routing table: the corpus's own language is three claim classes (visual /
state / network — SKILL.md §'Claim classes → capture', cited by section name
because SKILL.md was in revision this round — see the §6 pin and the Errata).
Rounds 4-6
measured, repeatedly, that the *surfaces inside* those classes disagree with one
another on byte-identical captures. A later lane picking up a claim therefore
needs, per claim shape, which surface wins and which surfaces must be kept
together. That is the table below.

## 0. As-of state (measured by this lane at write time)

- Write time 2026-10-14T18:24Z (15:24 -03); HEAD `c0467a6` ("probation round 6
  (training r5): see LOG"); `git status --short` → ` M SKILL.md` (a sibling
  round-7 integration in flight — the SKILL.md pin below is the working-tree
  value at 18:23Z, equal to the round-6 record's own SKILL value).
- Corpus: 14 knowledge notes before this note (`ls corpus/knowledge/*.md | wc -l`);
  this file is the 15th. `wc -l corpus/knowledge/*.md | tail -1` → 4,452 before
  this file.
- The L0 channel is unchanged — no answer, ask-count 1 — per the round-6 record
  (`plans/round-6-record-draft.md` §0 :17-52; E3 :344-349); this lane did not
  re-read the file.

## 1. Layer inventory (the surfaces this corpus has measured)

Names are this note's; each maps to surfaces the cited notes already define.
"Authoritative for" = the claim class the surface can falsify (the rung note's
winner rule: "the winner is the layer whose evidence can falsify the claim",
`network-evidence-rung.md` :241-242).

| # | layer (surface) | producer / carrier | authoritative for |
|---|---|---|---|
| L1 | **server log** (`http.log`) | the fixture server's own account: request lines, status codes, counts, and (fixtures written to be attributable) the body-write abort marker (`== ABORTED body write …`, rung :69, :277) | receipt counts ("the server served N"); the server's own status lines; the abort's server side |
| L2 | **wire headers** (`Network.responseReceivedExtraInfo`) | CDP per hop: raw status code, status line, header text bytes (rung :24) | the wire status; the hop chain (with L1) |
| L3 | **client events / client model** (`requestWillBeSent`(+ExtraInfo), `responseReceived`, `requestServedFromCache`, `loadingFinished`/`loadingFailed`) | CDP: occurrence, attempt, *effective* client status, cache flags, `connectionReused` (rung :23) | "a request was attempted/abandoned"; "the page obtained the resource (from somewhere)"; the client-effective status |
| L4 | **body bytes** (`Network.getResponseBody` + `loadingFinished.encodedDataLength`) | CDP: body bytes/sha (works for cache-served; 0 B for a canceled body) and byte totals; closure rule `finEnc − last-hop header text − body = 0` (rung :188-196) | response body claims; byte claims (with the equation closed) |
| L5 | **page-side perf** (`PerformanceResourceTiming` / `PerformanceNavigationTiming`) | the page itself at shutter time: `transferSize`, `encodedBodySize`, `responseStatus`, `redirectCount` (rung :26; v2 :397-403) | cross-check only — a *second, non-equal* number set (rung :414-417); `redirectCount` as a same-origin-only hop witness (v2 R2 :484-486) |
| L6 | **DOM** (DOMSnapshot columns + shape text/struct) | CDP: document content incl. invisible nodes; live input values via raw columns (`-1` empty sentinel) (m4 §3 :148-169) | document content incl. invisible; page state / input values (with the guard) |
| L7 | **pixels** (screenshot PNG + pixel tools) | `Page.captureScreenshot`, read back and machine-scanned (rung :341, :406) | visible rendered state — the only layer that sees `display:none` and `:visited` (rung D2/D8) |
| L8 | **URL / history** | URL read-back (as-normalized, cdp :139-150) + history `transitionType` | the as-normalized URL; the action class (`typed`/`link`/`form_submit`) — **not** redirects or hop chains |
| L9 | **runner record** | the sha-pinned runner's own record: cell plan, Fetch hold events, `trip.json`, `notExecuted[]` | what was attempted/skipped; a stop's plan side; the pre-settle class (with the hold) |
| L10 | **environment** | browser log (`chromium.log`), process table, ports | egress *shape* (log-level only), cleanup/closure |

## 2. The routing table (claim class → layer, measured cases as rows)

Each row is a routing decision with its measured disagreement (or agreement)
case. Case ids are the sources' own where they exist (D1-D8 = rung §6; E1/E2,
R1-R7 = v2). Route = the layer whose evidence wins when surfaces disagree.

| # | claim class | measured case (what disagreed) | what each surface read | route when layers disagree | anchor |
|---|---|---|---|---|---|
| RT1 | a request was **attempted / abandoned** | D4 — client `loadingFailed net::ERR_ABORTED` (canceled, no response); **server had already logged status line 200**, then failed the body write (`== ABORTED body write (client closed)` marker); DOM and pixels carry no trace. In the 3 fresh-cache runs the 60 ms abort fired before the wire — **no server line at all** (both outcomes recorded) | client: fail at 60.2-60.3 ms · server: 200 line + abort marker · DOM/pixels: nothing | **network, as a pair**: client fail + server body-write marker. A lone server `200` line would claim a delivery no client received; a lone client fail hides the server side | rung §6 D4 :271-283; §5.1 :213 |
| RT2 | the **server served N requests** | D6 — cold runs: client style.css hops = **3** vs server lines = **1** (cache-served repeats: client `requestServedFromCache`, no `ExtraInfo`, no server line, `finEnc=0`, body still readable) | client: 3 hops · server: 1 line · perf: `transferSize=0` | **server log for counts**; client events for "the page obtained the resource (from somewhere)"; compare **counts, not set membership** (the set view hides the delta) | rung §6 D6 :293-302; §9.6 :407-408 |
| RT3 | the **wire status** | D7 — run6-reval: all six cached URLs wire `304` (3 headers / 129 B / `finEnc=129`, server log `304`); client reports `200` for index/async/confirm/slow/quick but **`304` for the style.css subresource** (2 of 3 loads); cache flags false under revalidation | wire: 304 · client: 200 or 304, resource-dependent · server: 304 | **`responseReceivedExtraInfo.statusCode` (+ server log)**; the client `status` is the *effective* post-cache result and is never substituted; cache flags are not a wire-contact signal under revalidation | rung §6 D7 :304-318; §9.1 :388-391 |
| RT4 | the **wire path of a repeated same-URL resource** (per-run, not stable) | r3 §5 + AUD-TAB1 + r4 async — with byte-identical captures: (a) no wire line / client 200 / flags false (r3 cold; r4 E-group); (b) wire 304 / client 200 (r3 warm pass); (c) wire 304 / **client 304** (AUD-TAB1 fresh-port run, delta 2 not 3; async W-run1). The count delta is per-run-measured | three combinations, same capture bytes | same as RT3; treat the repeat's wire path as **per-run measured (as-of-capture)** — never as a stable count | multi-step-journey.md §5 :198-219 + errata :329-337; reports/r4-aud-tab1.md §2 :63-83; async §5 :192-215 |
| RT5 | the navigation went through a **redirect** | D5 — `/go` → 302 → `/async.html`: one requestId, wire `[302,200]`; hop-1 header text 139 B recorded in `redirectFrom` and excluded from `finEnc`; URL read-back, history (`link`) and DOM show only the final URL | wire: both hops · URL/history/DOM: final only | **network (hop events + ExtraInfo) + server log**; the URL read-back is as-normalized and cannot carry the claim | rung §6 D5 :285-291; cdp-evidence-patterns.md :139-150 |
| RT6 | the **hop chain, incl. cross-origin** | E1 — 302 → 303 → 307 → 200 (cross-path hop + origin hop); both server logs list every leg; CDP recovers each hop twice (`redirectResponse` + `ExtraInfo` status line); client `responseReceived` for the chain reports **final 200 only**; `PerformanceNavigationTiming.redirectCount` = **0** (cross-origin) vs **3** (same-origin, same shape — the origin hop is the only factor); the 307 cell preserved POST + 8 B body at both surfaces | wire: every leg · CDP: every hop · client: final only · perf: 0 vs 3 | **wire logs + per-hop `ExtraInfo`**; `redirectCount` is a same-origin-only witness; client surfaces are final-only | v2 §4 :373-408; §7 R1-R3 :480-489 |
| RT7 | the **response body bytes** | R5 A/B — `Network.getResponseBody` answered `-32000 "No data found for resource with given identifier"` **2/2** when the page read headers only, and succeeded **3/3** when the page consumed the body (`response.text()`), CDP sha = client sha | CDP read: fails pre-consumption, succeeds post · client: body sha | **CDP body read with the client-consumption precondition recorded**; pin the body sha against the authored fixture bytes before using text | v2 §5 A/B :429-433; R5 :493-501; async §7.3 :248-249 |
| RT8 | the **response body of a canceled/failed resource** | D3 — `/missing.css` 404 on wire + client + server, then the client cancels the body (`net::ERR_ABORTED`, +1.2 ms); `getResponseBody` = 0 B / empty sha; perf `encBody=0`, `transfer=300`, `status=404`; the favicon 404 in the same run is **not** canceled (460 B body). DOM/screenshot do not distinguish the failed stylesheet from a loaded one | network: sees the failure · DOM/pixels: render normally | **network for "the resource loaded"** (the only layer that sees the failure); screenshot for the rendered result; never infer load success from rendering | rung §6 D3 :261-269 |
| RT9 | **bytes transferred** | open disagreement — perf `transferSize` exceeds CDP `finEnc` by a consistent ~114-115 B on 200s (660/546, 683/568, 760/645, …); the CDP equation closes: `finEnc − last-hop header text − body = 0` on all 7 wire resources | CDP: closed arithmetic · perf: a second, non-equal number | **`finEnc` with the closure rule**; perf `transferSize` is a different number and must not be substituted; the offset's mechanism stays unknown (§5.1) | rung §4 :188-196; §9.2 :392-396; §10.1 :414-417 |
| RT10 | **cache revalidation staging** ("was the repeat revalidated?") | D7 staging — adding `Cache-Control: no-cache` to responses did **not** revalidate entries stored without it (run5-warm-nc behaved as a fresh-cache run); the in-session prepass is what forces the 304 path (run6-reval: 10×304 vs 8×200 + 3×404 + 2×302 across prepass+journey) | wire: 304s only under the prepass regime · server: same | route "was it revalidated" to **wire 304s + server log**; the staging is the measured lever (a fresh-cache pass must be populated in-session) | rung §6 D7 :304-318; §9.7 :409-411 |
| RT11 | the payload was **displayed after async work** | D1 — early DOM shape (`state waiting`, both payloads `none`) + matching screenshot; settled DOM + screenshot show `SLOW-PAYLOAD-9f2c` / `QUICK-PAYLOAD-3a1d`; the network slice shows slow.json request-only at early time and 200+finish in the settled slice | DOM/PNG: early vs settled differ · network: explains the race | **settled DOM + screenshot for the display claim**; an early capture falsifies a claim presented as final; the network slice is the only layer that explains why | rung §6 D1 :244-251; §5.3 :225-237; async §2 :84-107 |
| RT12 | the **pre-settle state as a stable class** (async) | r4 async, no disagreement — the race was removed: release→response 1-2 ms (6/6 runs) vs capture cost 57-123 ms; with the Fetch (Request-stage) hold the pre shutter has no race by construction (pre slice `issued`, wire log 0 lines); the fresh-cache collapse (early PNG == settled PNG, 3/3 runs; predicate raced at ~4 ms cache latency) shows the un-held pair can land on settled bytes | runner: hold seen · network: `issued` vs `answered` · PNG: collapse detectable | **hold at the protocol layer** when a pre-settle state is claimed; verify pair separability with the **network slice**, not with the predicate's success | async §3 :125-154; §5 :198-215; §7.1-2 :243-247 |
| RT13 | **visible rendered state** vs **document content** | D2 — `HIDDEN-MARKER` present in DOM shape (grep = 1) and DOMSnapshot, but red pixels = **0 px** (blue band = 17,079 px); D8 — `:visited` renders **1,033 differing pixels**, bbox (24,160)-(216,174), (0,0,238) → (85,26,139), while DOM shape **and** struct are byte-identical | DOM: contains it · pixels: does not show it | **split the claim**: DOM for "in the document", screenshot for "visible"/"renders the same"; DOM shape is blind to `display:none` and `:visited`; network says nothing about either | rung §6 D2 :253-259, D8 :320-330; §9.5 :404-406 |
| RT14 | **page state / input values** | r3 carried case (used by r4-6 extraction) — form vs filled have **identical shape hashes** while screenshot and raw columns differ; raw DOMSnapshot columns carry `inputValue`/`inputChecked`; `-1` is the empty-value sentinel and an unguarded `strings[-1]` fabricates a value from the table's last entry | shape text: blind to the fill · raw columns: carry it · PNG: shows it | **raw DOMSnapshot columns with the `-1` guard**; shape text alone misses the fill | multi-step-journey.md §3 :148-169; rung §3 :138-146 |
| RT15 | a **refusal / rate-shaped response** (trip classes) | E2 — four instruments tripped by the runner's own predicate: robots-disallow (stop **before issuing**; server log 0 for the skipped path), 429 (+`Retry-After` recorded as shape; never acted on), 403, and an **interstitial that trips at status 200** on a body-shape marker (status-only rules are blind to it); the identical-cell rerun reproduced the trip record apart from timestamps | runner: trip record · wire: status/marker · server: proof of non-issue | route the trip to **wire status + body-shape marker + the runner's trip record**; a loopback instrument is **never** a C6 datum; a real rate/ToS datum remains an absence | v2 §2 :57-140, §5 :410-452, R4 :490-492, §8 :508-522; interaction-approval-table.md :62, :191-192 |
| RT16 | a **stop was proved** | r6 — after a trip every later cell is `executed:false` and the skipped cell's path never appears in the server request log (5/5 cell runs + 2 A/B arms + the retained misfire); the retained misfire (rev-1 runner, mis-bound intended path) shows the predicate is **not advisory** — a mis-bound rule halts the run | runner: cell plan `notExecuted[]` · server: absence of the path | **server-log absence + the runner's cell plan**; a stop claim without the fixture-side absence is unproved | v2 §5 :416-450; R6 :501-503 |
| RT17 | **no external contact** (egress) | browser-log readings only: r2 logged `google_apis/gcm` registration errors (3× in each of its 2 runs) despite `--disable-background-networking`; r4 logged 3 GCM lines in **1 of 7** runs (0 in the other six); r6 logged **0 in 10/10** runs. URL/peer censuses: every request to 127.0.0.1 (AUD-B6 §3) | browser log: class visible/absent · URL+peers: loopback-only | **neither page-level layer proves it**: route to browser log + URL/peer census + process discipline; absence is as-of-capture; evidence is **log/URL-level only** (no packet witness) | rung §7.2 :356-364; live-dynamic-capture.md §6 :190-200; v2 §6 :473-476, U6 :553; reports/r6-aud-b6.md §3 :78-93, U1 :135 |
| RT18 | **cleanup / no residue** (operational envelope) | three recorded self-match incidents: r1 `pkill -f` matched its own shell (cdp :105); AUD-TAB1's `ps|grep` selection matched its own command line and killed the shell (verification never ran); AUD-B6 repeated the `pkill -f` class — rule: **an unverified kill is an unknown, not a cleanup** | process table: used · pattern-kill: unreliable | route closure to **PID from the process table + port probe + `curl` exit 7**, per run, verified after | cdp-evidence-patterns.md :96-105; reports/r4-aud-tab1.md §4 :99-111; reports/r6-aud-b6.md §5 :122-127 |

## 3. Routing rules (delta over the sources; [synthesis] unless a source states it)

1. **Route by falsifier.** The winning layer is the one whose evidence can
   falsify the claim (source rule, rung :241-242); when two friendly surfaces
   disagree, split the claim into the sub-claims each layer can decide (D3:
   "loaded" → network, "rendered" → screenshot). Falsifier: a routed claim whose
   own layer cannot falsify it while the record holds a layer that can.
2. **Name the producer surface per fact.** Envelope rule 7 (SKILL.md §'Record
   envelope', item 7 — cited by section name, SKILL.md in revision);
   a fact without its surface is a story (rung §9.3 :397-400). Falsifier: a
   record quoting a status without client-vs-server attribution.
3. **Status surfaces are never substituted** (RT3/RT4): wire status =
   `ExtraInfo`/server log; client status = effective post-cache. Falsifier: a
   wire-status claim grounded in client `responseReceived.status`.
4. **Counts, not set membership** (RT2; rung §9.6). Falsifier: a cache-served
   delta hidden by comparing path sets.
5. **Pair surfaces for non-idempotent / abandoned events** (RT1): client fail +
   server body-write marker; never a lone server status line for delivery.
   Falsifier: a delivery claim resting on one surface.
6. **Body reads are coupled to client consumption** (RT7); pin the body sha
   against the authored fixture bytes (async §7.3). Falsifier: a body claim from
   a `-32000` read path.
7. **Close the byte equation before quoting bytes** (RT9); perf `transferSize`
   is a different number. Falsifier: a byte total that fails
   `finEnc − last-hop header text − body = 0`.
8. **Timing at ≥1 ms class granularity** (rung §5.2 :216-223, §9.4 :401-403):
   38 recorded sub-ms "finish before response" pairs are noise. Falsifier: a
   timing claim finer than the class.
9. **Async: hold, then verify the pair against the slice** (RT11/RT12): the
   hold makes pre-settle a class; separability is certified by the network
   slice, not by predicate success. Falsifier: a pre/post pair whose slice shows
   the work finished before the "early" shutter.
10. **Rendered state routes to pixels; document content to DOM; inputs to raw
    columns** (RT13/RT14). Falsifier: a visibility claim argued from DOM shape,
    or an input claim argued from shape text.
11. **A trip is recorded, proved, never retried through; instrument ≠ datum**
    (RT15/RT16; v2 §8). Falsifier: a rate/ToS claim citing a loopback fixture,
    or a stop claim without the server-side absence.
12. **Egress claims are log/URL-level and as-of-capture** (RT17). Falsifier: a
    "no traffic" claim resting on the absence of log lines without the
    log-level caveat.
13. **Kill by PID from the process table; verify after** (RT18). Falsifier: a
    cleanup claim without the post-kill probe.

## 4. What this synthesis does not cover (carried, named)

- **The L1 mechanism matrix** (wire-class / cache-revalidation for repeated
  same-URL subresources as a controlled single-factor matrix) is still unlanded
  and carried into round 7 (v2 §9 :564-566; plans/round-7.plan.md L0 carried-debt
  check). If it lands, its cells append here (append-only errata) — this table's
  RT4/RT10 rows state the per-run measured boundary it is meant to close.
- **E3 third-party-JS-shaped async** (late settle, beacon-shaped POST, canceled
  404) — unlanded (v2 §9 :560-563).
- **The state-changing step** (POST body, redirect-after-POST, CSRF-shaped
  token, non-idempotent replay) — the corpus's own named gap
  (multi-step-journey.md :224; corpus/handoffs/operator-approval-request.md:86);
  v2's 307 cell measures method/body preservation across one hop (RT6) but is
  not a form-state-changing journey.
- **Real-site classes**: third-party JS, POST forms, redirects with bodies —
  untested by rule (rung §10.8 :435-436). Nothing here is a real-site result.
- **Bridge-path surfaces** (daemon/extension; the webbridge `network` tool
  channel) — never exercised (`extension_connected:false` throughout,
  webbridge-daemon-disposition.md §5 :122-135 (:129 sample, :133
  `extension_connected:false`)); this table covers only the
  CDP-slice surfaces the corpus has measured.
- **Instrument shapes are fixture-specific** (v2 U4 :547-549, U5 :550-552): the
  interstitial marker and the 2-line robots document do not generalize.

## 5. Unknowns (do not convert to claims without a new probe)

1. The perf `transferSize` vs `finEnc` offset (~114-115 B on 200s) — mechanism
   unexamined (rung §10.1 :414-417).
2. Why the client reports 304 for the revalidated style.css subresource but 200
   for every other revalidated resource (rung §10.2 :418-419; v2 U3 :543-546).
3. What decides the within-session cache path (no-wire re-serve vs wire 304)
   run-to-run with identical capture bytes (async §8.2 :262-264; r4-aud-tab1
   §7.1 :141-143; multi-step-journey.md errata :329-337).
4. The abort race: why the 60 ms abort landed pre-wire consistently in the
   fresh-cache runs and not in cold/reval runs (rung §10.4 :422-424).
5. Why `getResponseBody` answered `-32000` pre-consumption (v2 U2 :540-542).
6. Whether `redirectCount = 0` for cross-origin chains generalizes —
   spec-level zeroing is [inference] only (v2 U1 :537-539).
7. Packet-level truth of the browser's own egress attempts (live
   :204-205; v2 U6 :553-556; r6-aud-b6 U1 :135).
8. Byte-identity generality beyond this host/build/font stack (rung §10.8
   :435-436; async §8.6 :270).

## 6. Provenance — source pins re-derived at write time (2026-10-14T18:23Z)

`sha256sum | cut -c1-12` + `wc -l` over each source, disk-read at 18:23Z
(scratch log `/tmp/w7-b71-synth/source-pins.txt`, volatile). "round-6 record"
= the value the round-6 scribe prep derived at 17:40-18:01Z
(`plans/round-6-record-draft.md` §4 :128-159, E3 :344-357).

| source | sha256-12 | `wc -l` | round-6 record | match |
|---|---|---|---|---|
| `corpus/knowledge/network-evidence-rung.md` | `d1564f38dc14` | 609 | `d1564f38dc14` / 609 | ✓ |
| `corpus/knowledge/async-step-evidence.md` | `05dcda5e60b9` | 282 | `05dcda5e60b9` / 282 | ✓ |
| `corpus/knowledge/multi-step-journey.md` | `e0367890f1cf` | 349 | `e0367890f1cf` / 349 | ✓ |
| `corpus/knowledge/external-class-fixture-v2.md` | `4aa604f1788b` | 569 | `4aa604f1788b` / 569 (E3) | ✓ |
| `corpus/knowledge/cdp-evidence-patterns.md` | `337ff64579e8` | 234 | `337ff64579e8` / 234 | ✓ |
| `corpus/knowledge/live-dynamic-capture.md` | `01266495b761` | 245 | `01266495b761` / 245 | ✓ |
| `corpus/knowledge/interaction-approval-table.md` | `b5e29a9a2adf` | 246 | `b5e29a9a2adf` / 246 | ✓ |
| `reports/r4-aud-tab1.md` | `5f44b0f94483` | 167 | `5f44b0f94483` / 167 | ✓ |
| `reports/r5-aud-b5.md` | `d09f1712cbcf` | 170 (171 logical — no trailing LF) | 171 lines per §5, no pin | first pin here |
| `reports/r6-aud-b6.md` | `9428ddec52b9` | 178 | `9428ddec52b9` / 178 (E3) | ✓ |
| `SKILL.md` (working tree; `M` at write time) | `a8ba10b86138` | 795 | `a8ba10b86138` / 795 (E3) | ✓ |

Every source pin above equals the round-6 record's value where one exists
(10/11); no source moved between the round-6 record and this note. All sources
are tracked at HEAD `c0467a6` (round 6's commit lands the two new notes and the
two round-6 reports).

Spot-checks this lane ran on this note (non-author of every source; mechanical):
(1) **pin re-derivation** — the table above, computed from disk at 18:23Z, all
rows matching the round-6 record where it has a value;
(2) **anchor re-check** — a sample of cited line anchors re-grepped against
source text (rung :304 D7, rung :332-345 decision table, v2 :493 R5, v2 :564 L1
carry, multi-step-journey.md :329 errata, r6-aud-b6 :135 U1) — all present at
the cited lines;
(3) **register↔table cross-count** — every measured case named in a §2 row
(D1-D8; E1/E2; v2 R1-R6 as routed; the r3 §5/AUD-TAB1 combo; the egress trio;
the cleanup incidents) appears exactly once as a row or is cited in a row's
anchor line. v2's R7 (fixture byte-stability 13/13) is a determinism guard, not
a routing case, and is deliberately not a row.

## 7. Errata (append-only — never edit above blocks)

*(none yet; corrections append below)*

### E1 — 2026-10-14T18:28Z, lane B7-1. SKILL.md moved during this note's write window; the note's two SKILL citations were converted to section names, and the §6 pin row is stamped as-of.

- **Measured movement.** `SKILL.md` (working tree, ` M` throughout — round-7
  sibling integration in flight): at this lane's pin derivation (18:23:23Z)
  `a8ba10b86138` / 795 `wc -l` (= the round-6 record's E3 value); at 18:27:38Z
  `c0d2629ecbfb` / 829 `wc -l`. Nothing above is edited; §6's SKILL row is
  exact for 18:23Z and is superseded by this block.
- **Consequence for anchors.** The note's SKILL citations were changed (before
  this block) from line ranges to section names: §'Claim classes → capture'
  (was :382-409 under the 18:23Z pin) and §'Record envelope' item 7 (was
  :427-430). Re-derive by section title against whatever SKILL.md revision is
  current — the round-7 integrating seat owns that file.
- **Not moved:** the other ten §6 sources re-hashed at 18:28:02Z and are
  byte-identical to the §6 table (all matches stand; scratch
  `/tmp/w7-b71-synth/source-pins-final.txt`, volatile).
- **Concurrent landings observed while this file was being written** (recorded,
  nothing above changes): `corpus/knowledge/packet-readiness-r7.md` (lane B7-3,
  untracked — the packet's classes audited against the corpus; not a routing
  input) and the round-6 archive groups `w6-tabi-b61` / `w6-aud-b6-scratch` /
  `w6-ver-b6` landing under `corpus/evidence/` (25 → 28 groups, each with a
  `MANIFEST.txt` at read). **The L1 mechanism matrix remains unlanded at
  18:28Z** — no corpus note names it — so §4's carry stands.

### E2 — 2026-10-14T18:29Z, lane B7-1 (drafting-pass corrections; applied while the file was still this lane's uncommitted draft — recorded loudly, not silently)

- Three corrections were applied in place to §2/§4 in this same write window
  (the file's first handoff is this lane's final message; no LOG entry,
  coverage row or commit existed yet, so no landed text was silently
  rewritten): (a) RT18's incident count — "two self-match incidents" →
  "three recorded" (r1 `pkill -f` cdp :105; AUD-TAB1 §4 :99-111; AUD-B6 §5
  :122-127 — the row already listed all three); (b) RT17's r2 GCM count made
  exact — "3×" → "3× in each of its 2 runs" (live-dynamic-capture.md §6
  :192-195); (c) §4's bridge bullet — parenthesis balance repaired (no content
  change).
- Nothing else changed; the file hash moves by construction — re-derive with
  `sha256sum`.