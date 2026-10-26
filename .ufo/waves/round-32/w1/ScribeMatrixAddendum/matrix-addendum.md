<!-- DRAFT snippet (round 32, w1, seat ScribeMatrixAddendum) — append verbatim to the END of
     corpus/knowledge/webdriver-bidi-capability-matrix.md. Append-only: no earlier byte changes. -->

## Dated correction — 2026-10-26 (round 32): runtime measurement of R1–R15 and R17

Appends to §2 (`:54-76`) and to the §3 sentence at `:82-83` ("CDP remains the lane's
measured evidence substrate"). Earlier bytes above are unchanged, including `:10`
("**locally measured: no**"), `:56` ("`locally measured: no` for every row") and every
row's last-column `no`: those bytes describe the 2026-10-19 documentation-only pass and
stay as written. This block records a later, separate measurement; it does not re-verify
S005–S012 and no cited source page was re-fetched for it.

Runtime state now: for the seventeen §2 rows, measured at round 32: **yes** for R1–R15
and R17; R16 (stop loading / nav-cancel) stays **no BiDi command**. The measurement is a
chromedriver-negotiated BiDi session (`webSocketUrl: true`) on this host's chromium
154.0.8037.97 and chromedriver 154.0.8037.97. The counter serves its frozen fixture on
127.0.0.1 and takes each row's base only from a loopback `/a.html` navigate (a
non-loopback base fails the row predicate — self-test case `off-loopback-navigate`); no
CDP endpoint was used and no credential or session material was touched. Per-row
evidence, hosts and transcript format: `corpus/knowledge/webdriver-bidi-runtime-round-32.md`
(machine-read table `| Row | Surface | BiDi method | Measured | Evidence |`). Admission is
the frozen counter `scripts/check-bidi-runtime.mjs` in the round-32 mode

    node scripts/check-bidi-runtime.mjs --rev REV \
      --baseline d805d1d6132430118b206a848b85753ab35d1014 \
      --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json

whose per-row verdicts are `x2-no-counterpart`, `t1-receipt`, `t3-binding`, `t2-run` and
`l1-live`; the observed `population` / `admitted` / `failing` counts and the two committed
driver-run transcripts live in `corpus/evidence/round-32/bidi/receipt.json`.

| Row | Surface (§2 line) | Measured at round 32 | What the counter admits for the row |
|---|---|---|---|
| R1 | Browser identity at launch (`:60`) | yes | `newSession` capabilities carry `browserName`, the counter's `browserVersion`, and a loopback `webSocketUrl`, with at least one successful command on that socket |
| R2 | Target inventory (`:61`) | yes | `browsingContext.getTree` returns ≥1 context, each with a string `context` |
| R3 | Navigate (`:62`) | yes | successful `browsingContext.navigate` to the loopback `/a.html` with a matching result url, plus a `browsingContext.load` event for it |
| R4 | Screenshot (`:63`) | yes | `browsingContext.captureScreenshot` returns a PNG at the pinned 640×480 viewport |
| R5 | DOM shape/state (`:64`) | yes | `browsingContext.locateNodes` with a css `#h` locator returns exactly one node whose `localName` is `h1` |
| R6 | Wait predicates / volatile readouts (`:65`) | yes | `script.evaluate` of `window.__ready` with `awaitPromise:true` resolves to `settled` |
| R7 | Viewport pin (`:66`) | yes | `browsingContext.setViewport` 640×480 succeeds and a later `window.innerWidth` reads 640 |
| R8 | Click input (`:67`) | yes | `input.performActions` pointer source with pointerDown/pointerUp, after which `#out` reads `clicked:tabi` |
| R9 | Text fill (`:68`) | yes | `input.performActions` key source whose keyDown values spell `tabi`, after which `#t` reads `tabi` |
| R10 | Network client events (`:69`) | yes | `network.beforeRequestSent` and `network.responseCompleted` both observed for `/a.html` |
| R11 | Wire truth (`:70`) | yes | that `responseCompleted` carries status 200 and the fixture header `x-tabi-fixture: r32` |
| R12 | Byte truth (`:71`) | yes | `network.addDataCollector` (`response`, registered first) then `network.getData` returns the fixture body `tabi-bidi-body-0123456789` |
| R13 | Pre-settle hold (`:72`) | yes | `network.addIntercept` on `beforeRequestSent`, a blocked `network.beforeRequestSent` for `/data.txt` naming that intercept, then `network.continueRequest` for it |
| R14 | Navigation history witness (`:73`) | yes | `browsingContext.traverseHistory` delta −1 after a `/b.html` navigate, after which `location.pathname` is `/a.html` |
| R15 | Cookies (`:74`) | yes | `storage.getCookies` returns `tabi_fixture=1` |
| R16 | Stop loading / nav-cancel (`:75`) | no BiDi command | refused as `x2-no-counterpart`: the WD defines no navigation-stop command, so nothing is admittable here |
| R17 | User prompts / dialogs (`:76`) | yes | `browsingContext.userPromptOpened` with message `tabi-alert`, then `browsingContext.handleUserPrompt` |

Evidence for every row above is that row of the entry: the entry's table row of the same
id (`R1`..`R17`) plus the counter command given above. A row is admitted only when its
predicate holds on both committed driver-run transcripts (`t2-run`) and on the counter's
own live session (`l1-live`), with `t1-receipt` / `t3-binding` binding those transcripts
to a real rendering; R16 has nothing to admit (`x2-no-counterpart`).

### §3 amendment: what is measured now, and what is still not

Read `:82-83` ("CDP remains the lane's measured evidence substrate") in this form: choose
the transport **per evidenced feature** (unchanged, `:80`). CDP remains the substrate the
lane's shipped capture recipe is built on, and every CDP rung/citation above keeps its
standing. BiDi is no longer documentation-only on one pinned pair: the sixteen admittable
rows above were produced and admitted at runtime on chromium 154.0.8037.97 +
chromedriver 154.0.8037.97 over loopback. So "a Working Draft command is not proof that a
browser or binding implements the feature" (`:81-82`) now has a measured counter-example
on this host for these sixteen rows — and only for them.

Still not measured, and not to be claimed from the rows above:

- **No wire-truth parity.** R11 is admitted on `status` plus one fixture header inside the
  `network.responseCompleted` payload (`network.ResponseData`). Neither the spec's
  `ResponseData` nor this measurement
  produces CDP `ExtraInfo`'s raw header-block bytes or a byte-exact original status line
  (`:70`, U2 stays open).
- **No DOMSnapshot columnar shape.** R5 is `locateNodes` returning one matching node;
  any broader serialization in a run is a caller-supplied `script.evaluate` shape, not the
  CDP `documents` + `strings` table (`:64`).
- **No history-entry list.** R14 traverses by `delta` and then reads `location.pathname`;
  no command returns the history entries CDP's `Page.getNavigationHistory` returns (`:73`).
- **No `input.insertText`.** R9 types through key actions; CDP-equal fast insertion
  side-effects remain unmatched (`:68`).
- **No retroactive body retrieval.** R12 needs its `response` data collector registered
  before the response is cloned; it is not a drop-in after-completion `getResponseBody`
  (`:71`, and the 2026-10-20 collector-timing correction above).
- **R16** has no BiDi command at all (`:75`).
- **One host, one pinned pair, one fixture.** No cross-browser, cross-version, worker/realm
  scope (U3), performance/cost comparison against the CDP path (U4), or binding-API
  stability finding (U5). U1 is answered only for 154.0.8037.97, not for the 152.0.7977.82
  build U1 names.

What this block does **not** change: the `## Rejected` flip condition (`:100-107`, a
pinned per-row runtime/evidence-contract comparison preserving every required output,
scope and provenance) is met for the sixteen rows at the granularity the counter checks,
not for the three contracts named above. A row marked yes here is a runtime observation of that
row's admitted BiDi command/event pair on loopback; it is not a support claim for other
builds, bindings, fixtures or evidence contracts.
