# CritC1Predicates — do the R1..R17 predicates evidence their matrix rows?

**Verdict (one paragraph).** I attacked the *semantics* of C1's per-row checks: whether each
predicate in `scripts/check-bidi-runtime.mjs` (PREDICATES, 215-300) evidences the matrix §2 row it
is named after (`webdriver-bidi-capability-matrix.md:60-76`) or only a narrow observation inside
that row. **All sixteen admittable predicates hold on this host's live BiDi session** (my own run:
16/16, R16 non-null) — the capability is real — **but every one of the sixteen accepts a minimal
record built to omit the matrix row's own gap content** (probe: 16/16 accepted), and four are
narrower than their surface in a way that matters: **R1 reads the classic `POST /session`
capabilities, never `session.new`** (mechanism mismatch, not just narrowing); **R11 checks status +
one serialized header while its row is named "Wire truth (raw status/headers)" and the matrix's own
note says the raw block/status line is *not* defined**; **R14 checks pathname after
`traverseHistory` while the matrix says no command returns the history-entry list and "the lane's
chrome-side witness is not reproduced"**; and **R17 is a surface the matrix says is not a tabi
surface at all**. R4 is geometry-only (no `origin:document`/`clip`/full-page). So no predicate is
wrong about what it checks — the overclaim risk lives entirely in the entry prose, **which the
frozen counter never reads** (it consumes only `cells[0]` and `cells[3]`; I executed a fixture entry
whose Surface cell was "NOT the matrix row name at all" and whose "BiDi method" was a CDP command,
and it was admitted, `clean: true`). `admitted >= 14` is therefore **honest only as "at least 14
distinct BiDi surfaces were exercised at runtime on this host, each for the narrow observation
below"**, and **not** as "14 matrix rows are closed / CDP-parity reached" — and even "distinct" is
not enforced: I scored an entry listing `R2` fourteen times as `population 14, admitted 14, failing
0, clean true`. Two defects (duplicate counting, unread prose cells) plus five rows requiring
explicit narrowing; the counter is frozen, so the correction is in the entry.

## What I attacked

- Target: C1's predicate semantics, counter frozen bytes
  `sha256 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` (equals
  `claims.json:frozenDigests`), evaluated at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`.
- Matrix rows: `corpus/knowledge/webdriver-bidi-capability-matrix.md:60` (R1) … `:76` (R17);
  last column `no` on **17/17** rows (checked, see E8).
- Counter header contract: `Row ids R1..R17 are the seventeen rows of … §2 in order` (31-32), so
  the id→row binding is the counter's own claim, and that claim is what I tested.

## Evidence — commands and exit codes

All lane scripts ran only inside my scratch clone
(`/fast/scratch/hyaku/tabi-r32/CritC1Predicates/clone`, toplevel verified, detached at `4181fff`).
`TMPDIR=/tmp/c1p` (short path: chromium's singleton socket limit); `/tmp/c1p` is empty afterwards.
The harness shell runs with errexit/pipefail, so a failing line aborts the rest of that command —
exit codes below are the tool's reported code for the invocation.

| # | Command (cwd) | Exit | Result |
|---|---|---|---|
| E1 | `git clone -q --shared <lane> "$S/clone"` + `git -C "$S/clone" checkout -q --detach 4181fffb…` | 0 | `rev-parse --show-toplevel` = `…/CritC1Predicates/clone`; HEAD = `4181fffb…` |
| E2 | `sha256sum clone/scripts/check-bidi-runtime.mjs` | 0 | `2f25af5a…c393` = frozen digest |
| E3 | `test -f clone/corpus/knowledge/webdriver-bidi-runtime-round-32.md` | 0 | `entry-present: no` (entry does not exist at the freeze) |
| E4 | `node observe.mjs` — imports the counter's own `liveRecord`, runs one live BiDi session, applies all 17 predicates | 0 | 28 cmds, 14 events; **R1-R15, R17 = holds; R16 = `no-bidi-counterpart`**; transcript → output dir |
| E5 | `for k in 1 2 3; do node determ.mjs; done` | 0,0,0 | first-screenshot sha256 `ee0edeba…eca5`, 6626 bytes, identical in all 3 (plus E4 = 4 sessions); `chromedriverVersion` identical |
| E6 | `node probe.mjs` — minimal record per predicate, built to omit the matrix row's gap content | 0 | `PROBE rows=16 minimal_records_accepted=16 rejected=0` |
| E7 | `node dup.mjs` — fixture repo, entry lists `R2` ×14 | 0 | `population 14, admitted 14, failing 0, clean true, distinctIds ["R2"]` |
| E8 | node: matrix lines 60-76 last column | 0 | `rowsWithLocallyMeasuredNo= 17 of 17` |
| E9 | `node … --rev 4181fff… --baseline d805d1d… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live` (in clone) | **1** | `verdict=failed rev=4181fff… population=0 admitted=0 failing=0 entry=e1-entry-absent live=true` — the claim's "before" reproduced |
| E10 | https:// counter `node scripts/check-bidi-runtime.mjs --selftest` — **not run**; peer `RevC1Suite-2` owns it | – | – |
| E11 | node: compare `ROWS` to matrix col-1 | 0 | 15 EXACT; **R4 `"Screenshot"` vs matrix `"Screenshot (rung L7)"`**, **R5 `"DOM shape/state"` vs `"DOM shape/state (rung L6)"`** |
| E12 | `grep -n 'cells\[' scripts/check-bidi-runtime.mjs` | 0 | exactly two uses: **508** (`cells[3]` = Measured filter), **560** (`cells[0]` = id). Surface, BiDi method, Evidence cells are never read |
| E13 | `node mislabel.mjs` — fixture entry, Surface `"NOT the matrix row name at all"`, BiDi method `"Page.captureScreenshot (CDP)"`, Evidence `"none"` | 0 | `population 1, admitted 1, failing 0, clean true` |
| E14 | `pgrep -fa '/tmp/c1p'` ; `pgrep -fa 'chromedriver --port'` | 1 / 0 | no process of mine; the only chromedriver (`2395456`) belongs to peer scratch `ExecInterceptPhases/tmp/tabi-ar-xJbmL9` |

Live host facts observed (E4): `browserName=chrome`, `browserVersion=154.0.8037.97`,
`webSocketUrl=ws://127.0.0.1:40817/session/…`,
`chromedriverVersion=154.0.8037.97 (b510e9d7…refs/branch-heads/8037@{#1673})`.

My E4 transcript is **evidence for predicate semantics only** — it is one run driven by the
counter itself, so it is not a receipt candidate (receipt needs ≥2 runs and a driver other than
the counter).

## Per-row verdicts

Legend: **holds-narrow** = the check is a true observation of the row's BiDi counterpart, but a
strict subset of what the row names; **overreach-if-worded** = the unsafe claim is naming the row
as measured/closed without the caveat; **mechanism-mismatch** = the check keys on something other
than the counterpart the matrix names; **inversion** = the matrix's own note says the thing the row
is named for is *not* available.

| Row | Matrix | Predicate | What it actually checks (observed) | Verdict | Entry must say |
|---|---|---|---|---|---|
| R1 | :60 `session.new` result capabilities | :215-222 | classic `POST /session` → `value.capabilities.browserName`, `browserVersion == receipt`, loopback `webSocketUrl`, **plus ≥1 successful BiDi command**. No `session.new` is ever sent or required. | **mechanism-mismatch** (+ overreach-if-worded) | "identity from the WebDriver capabilities of the session that carried the BiDi socket; no `session.new` command issued". Never "session.new measured". |
| R2 | :61 `browsingContext.getTree` | :224 | ≥1 context whose `context` is a string. Probe accepted `[{context:"C"}]`. Live: **1** context, `url=about:blank` at call time, keys `context,url,parent,children,userContext,clientWindow,originalOpener`. | holds-narrow | "getTree returned one context record (about:blank at call time); target types (`worker`/`service_worker`) not enumerated — matrix gap holds". |
| R3 | :62 navigate + 5 events | :225-232 | navigate result `url` + a `browsingContext.load` for it. Live event set held only `load` of the five named. | holds-narrow | name `browsingContext.load` only; `navigationStarted/Committed/Failed/domContentLoaded` unobserved; milestone events do not establish the payload settle predicate (matrix note). |
| R4 | :63 Screenshot (rung L7) | :233-237 | any successful `captureScreenshot` whose PNG IHDR is 640×480; no `origin`, no `clip`; probe accepted a **24-byte header-only PNG**. | holds-narrow, **overreach-if-worded as L7** | "viewport-origin `captureScreenshot` produced a 640×480 PNG; `origin:document`, `clip`, full-page unexercised — no `captureBeyondViewport` equivalent claimed". |
| R5 | :64 DOM shape/state (rung L6) | :238-239 | `locateNodes` css `#h` → exactly 1 node with `value.localName == "h1"`; probe accepted `{value:{localName:"h1"}}` alone. Live node `value` keys: `attributes,childNodeCount,localName,namespaceURI,nodeType,shadowRoot`. | holds-narrow, **overreach-if-worded as "DOM shape/state"** | "locateNodes returned node references with nodeType/localName/attributes/childNodeCount; no columnar `documents`+`strings` snapshot — matrix gap holds". |
| R6 | :65 wait predicates / readouts | :240-241 | `script.evaluate{expression:"window.__ready",awaitPromise:true}` → RemoteValue `string "settled"`. | holds-narrow | "awaitPromise→RemoteValue string measured; object/array mapping, `callFunction`, `returnByValue` parity unmeasured". |
| R7 | :66 viewport pin | :242-246 | `setViewport` 640×480 then `window.innerWidth == 640`. Live params carried `devicePixelRatio:1`, **never read back in-page**. | holds-narrow | "viewport dimensions applied (innerWidth 640); devicePixelRatio sent but not asserted; no `mobile` parameter (matrix gap)". |
| R8 | :67 click input | :247-252 | a pointer source with `pointerDown`+`pointerUp`, then `#out.textContent == "clicked:tabi"` *after* it. Probe: **no origin/target required** — an untargeted click passes. | holds-narrow | "pointer actions produced a click whose handler fired (#out became clicked:tabi); the check does not bind the action to an element (the live leg targets #b by sharedId)". |
| R9 | :68 text fill | :253-258 | key source whose `keyDown` values join to contain `"tabi"`, then `#t.value == "tabi"`. Probe: `keyDown`-only (no `keyUp`) passes. | holds-narrow | "key actions inserted text; `input.insertText` absent (as the matrix says); CDP fast-insertion side-effect parity unmeasured". |
| R10 | :69 network client events | :259-266 | `beforeRequestSent` + `responseCompleted` for `/a.html`. The check does **not** require `session.subscribe` (the live leg does subscribe). `responseStarted`/`fetchError` unobserved. | holds-narrow | "beforeRequestSent + responseCompleted for the fixture URL; responseStarted and fetchError not observed". |
| R11 | :70 **Wire truth (raw status/headers)** | :267-273 | `responseCompleted` for `/a.html` with `status===200` and serialized header `x-tabi-fixture: r32`. Live `ResponseData` keys: `bodySize,bytesReceived,content,fromCache,headers,headersSize,mimeType,protocol,status,statusText,url`; header values are `{type:"string"}` BytesValues. | **inversion / overreach-if-worded** | "status + serialized header fields from ResponseData; **no raw header block and no original status line — no wire-truth parity** (matrix gap holds)". Worded as "wire truth": defect. |
| R12 | :71 byte truth | :274-278 | `addDataCollector{dataTypes:["response"]}` then `getData{dataType:"response"}` whose bytes equal the fixture text; live `getData` request `3545928.3` → `{bytes:{type:"string"}}`. Probe: the `getData` **request id is unconstrained**; `network.disownData` never called. | holds-narrow (closest to the row) | "collector-gated body retrieval: addDataCollector then getData returned the fixture bytes; `network.disownData` unexercised; no after-the-fact `Network.getResponseBody` equivalent". |
| R13 | :72 pre-settle hold | :279-287 | `addIntercept{beforeRequestSent}` → blocked `beforeRequestSent` for `/data.txt` with the intercept id → `continueRequest` for that request id. Only the continue path. | holds-narrow | "beforeRequestSent intercept + continueRequest; `failRequest`/`provideResponse` unexercised". |
| R14 | :73 **Navigation history witness** | :288-293 | `traverseHistory{delta:-1}` (result `{}` — confirmed live: `resultKeys: []`) after a navigate to `/b.html`, then `location.pathname == "/a.html"`. | **inversion / overreach-if-worded** | "back traversal via traverseHistory observed by resulting pathname; **no history-entry list** — matrix gap holds ('chrome-side witness is not reproduced')". Worded as "history witness measured": defect. |
| R15 | :74 cookies | :294 | `storage.getCookies` contains `tabi_fixture=1`. Live result keys `[cookies, partitionKey]`; cookie `domain=127.0.0.1`, `path=/`. Probe was **unfiltered**, no partition asserted. | holds-narrow | "storage.getCookies returned the fixture cookie with a result-level partitionKey; filter/partition scope not asserted". |
| R16 | :75 stop loading / nav-cancel | guard :564 | never admitted: `x2-no-counterpart` is raised **before** t1/t3, so no receipt can admit it. | correctly excluded | list it **`measured: no`** (or omit). Marking it `yes` puts it in the population and forces `failing ≥ 1` → `clean=false`. |
| R17 | :76 user prompts (**"not currently a tabi surface"**) | :296-300 | `userPromptOpened{message:"tabi-alert"}` then a later successful `handleUserPrompt`. Live: opened keys `context,handler,message,type`; **no `userPromptClosed`** observed. | holds-narrow, **overreach-if-worded as lane coverage** | "handleUserPrompt accepted; userPromptClosed not observed; this is **not** a current tabi evidence surface (matrix row says so) — capability only, no lane use". |

## Does `admitted >= 14` mean "runtime-held" honestly?

**Yes for the capability, no for the matrix rows — and the count itself has two holes.**

1. **The live leg makes the count a real runtime statement.** `evaluate` re-runs each row's
   predicate against the counter's *own* session (`:572-575`), so `admitted` is not only a claim
   about the committed receipt: every admitted row was exercised in a real BiDi session on this
   host. My independent session confirms 16/16, and the same session's first screenshot is
   byte-identical across 4 runs (E5), so the `t3` determinism premise is sound on this build.
2. **Defect (severity: medium) — duplicates are not collapsed.** Population is
   `parseTable(entry).filter(cells[3]==="yes")` (`:508`) and the loop (`:559-577`) never dedupes
   ids. Executed counterexample (E7): an entry with `R2` repeated 14 times scores
   `population 14, admitted 14, failing 0, clean true`. So `admitted >= 14` does not by itself mean
   14 capabilities. The claim's target must be read as **14 distinct rows**, and the entry must
   list each id once — the counter cannot enforce it.
3. **Defect (severity: medium, calibration-facing) — the prose cells are unread.** Only
   `cells[0]` (id) and `cells[3]` (Measured) are consumed (E12). Executed counterexample (E13): a
   row whose Surface cell is arbitrary text and whose "BiDi method" is a **CDP** command admits with
   `clean: true`. Consequently *nothing mechanical* prevents the entry from claiming the row names
   in the table above; the narrowing has to be written by hand and can only be reviewed by a human
   seat.
4. **Scope note (not my defect to repair) — `t3` pins only the first screenshot.** `firstShot`
   (`:545`) takes the first successful `captureScreenshot`; in the live leg that is command 18 of
   28, before `locateNodes`/`performActions`/readouts/`getData`/`getCookies`/`addIntercept`/
   `traverseHistory`/prompt. Post-screenshot commands are bound only by `t2` + `l1-live`. A driver
   could therefore take a real screenshot and synthesize the remainder while still passing `t3` —
   the live leg then independently proves the capability, so the *capability* claim survives, but
   the *"two real runs by another driver"* provenance is weaker than worded. Hand to
   `CritC1Forgery`; I did not test it.

**Net:** `admitted >= 14` is honest as "at least 14 **distinct** BiDi surfaces were exercised at
runtime on this host, each for the narrow observation tabulated above". It is **not** honest as
"14 matrix §2 rows are closed", "BiDi is at parity with CDP", or "the matrix's gap notes no longer
apply" — eight of the nine gap notes I checked still apply verbatim (R1, R2, R3, R4, R5, R11, R12,
R14, R17).

## Impacted axes

- **coverage (C1's axis)** — the move is genuine (16 surfaces, live, independent client); the only
  way it inflates is the four overreach-if-worded rows, so the axis gain is real at `16 distinct`
  and unsupported above that.
- **calibration** — highest risk: admitted counts are mechanical, prose is not (finding 3), so an
  overclaiming Surface/Evidence cell would enter the record with no counter disagreement.
- **depth** — the narrow observations are shallower than the row titles; writing them narrowly
  *lowers* claimed depth toward truth.
- **freshness** — the new entry and the S123-S126 rows are the round's fresh material; unchanged
  by this review.
- **adjacency, operability** — untouched; operability gains a second transport path in the evidence
  pipeline, which the live leg exercised cleanly (exit 0, no orphan processes, E14).

## Smallest safe correction (entry-side; counters stay frozen)

1. List **R1-R15 and R17 exactly once each** with `measured: yes`, and **R16 once with
   `measured: no`** (evidence: no BiDi command, §7.3.3). No duplicates (finding 2).
2. Use the matrix's own surface text in the Surface cell — including `Screenshot (rung L7)` and
   `DOM shape/state (rung L6)` (E11) — and put the narrow observation **plus the surviving matrix
   gap** in each Evidence cell, per the table above. The five that must not be abbreviated: R1
   (classic capabilities, no `session.new`), R4 (viewport geometry only), R5 (locateNodes, no
   snapshot), R11 (no wire parity), R14 (path traversal, no history list), R17 (not a tabi surface).
3. State the count in the entry as **"16 of 17 rows exercised; 16 distinct"**, and keep the matrix
   cells' `locally measured` flip tied to the narrow observation (the row's gap note must stay
   attached), so the matrix does not read as CDP parity afterwards.
4. Do not let the report translate `admitted` into "closed"/"equivalent"/"parity"; if the claim
   text is restated, add "distinct" to the target's wording.

## Hygiene, tooling, honesty

- Scratch clone deleted; `/tmp/c1p` empty; no process of mine survives (E14). The only
  chromedriver/chromium running belongs to peer `ExecInterceptPhases` (its scratch
  `…/ExecInterceptPhases/tmp/tabi-ar-xJbmL9/profile`) — not touched.
- **No network fetches** (0 HTTPS GETs, so no URL/status/byte/sha table to report); no logins, no
  cookies, no session material; navigation was loopback-only, all served by the counter's own
  `serveFixture()`.
- **No tool installs/upgrades.** Used host `node v24.21.0`, `/usr/bin/chromedriver` 154.0.8037.97,
  `/usr/bin/chromium` 154.0.8037.97.
- Disclosed error: my first `dup.mjs` invocation exited 1 (`git rev-parse` before `git init` in
  the fixture dir) — my bug, fixed, rerun exit 0; no lane bytes touched.
- I did **not** run the counter's `--selftest` (peer `RevC1Suite-2` owns it), did not run any lane
  build/lint/formatter, and edited no lane file. Artifacts in
  `.ufo/waves/round-32/w1/CritC1Predicates/`: `live-transcript.jsonl`
  (`sha256 0b920d1e…fb0a`), `observe.json` (`9dfaf4ac…090d`), `probe.out.json`, `determinism.txt`,
  `before.json`, and the four harnesses (`observe.mjs`, `probe.mjs`, `dup.mjs`, `mislabel.mjs`,
  `determ.mjs`).
