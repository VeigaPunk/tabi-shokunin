# Note review — `corpus/knowledge/chromium-js-dialog-runtime-round-76.md`

Seat R76Scribe, round 76 w1. Reviewed at lane base `a69f9060cb9d239b3d6d4429e1b91177b792ebd3`
plus the round-76 wave tree. Every claim below carries the command that produced it and its exit
code, or a `path:line`.

**Verdict of this review: the measured core holds; the note needs six wording/citation fixes and
one substantive novelty correction.** The measured table re-derives 9/9 rows on 14/14 receipts; the
protocol citations locate their quotes; the novelty sentence (line 9-10) is false as written, and
the 20 ms attribution (line 63-64) is refuted by an independent probe.

## 0. Method and receipts

The derivation scripts ran from the seat scratch (`/fast/scratch/hyaku/tabi-r76/R76Scribe/`, removed
per the wave rule); their outputs and every receipt cited here are in this directory.

- `derive.mjs` (exit 0) parses the 9 PRE smokes (`controls/c1/smoke1-9.receipt.json`), the 4 probes
  (`controls/c1/probe/p1-p4.receipt.json`) and the (a) receipt
  (`corpus/evidence/round76/chromium-js-dialog/receipt.json`) and writes `derived.json`.
- `matrix.mjs` (exit 0) groups the per-leg facts into signatures across the 14 receipts.
- `rederive.mjs` (exit 0) re-derives each leg's `legShape` from the raw `events`, `cdpEventLog`,
  `legs` and `cdpSendLog` alone and compares it to the receipt's recorded `legShape`:
  **140/140 legs match (14 receipts x 10 legs)**.
- `release-block-probe.mjs` (exit 0) is an independent Chromium 155.0.8059.84 `--headless=new`
  probe, written for this review, that measures the dialog block and the CDP answer order
  (`release-block-probe.receipt.txt` beside this file).
- Counter on the (a) receipt:
  `node scripts/check-dialog-r76.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --receipt corpus/evidence/round76/chromium-js-dialog/receipt.json --expect-driver-sha256 152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51 --expect-nonce tabi-r76-l1-97bf5d560d03 --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt --json`
  → **exit 0, verdict `clean`, checkCount 131, findings [], priors 17, priorSet sha256
  `30f7418a…`** (`a-counter.json`).

Derived invariants across all 14 receipts (9 PRE smokes + 4 probes + (a)):

- 37 page events, 18 CDP dialog/nav events, 3 server rows per receipt; `failures` empty;
  `teardown` identical (post-kill sweep 0, survivors [], both ports `closed`, curl exit 7).
- **518 page events, every one `isTrusted: true`.**
- **84 dialog returns** (6 per receipt); the dialog call's blocked duration (`at - ts` of the
  `dialog-return` record) is **18.6–24.8 ms, median 20.4 ms**.
- In all 84 cases the `dialog-return` record precedes the `click` record in page sequence
  (`dialog-return` seq 5, `click` seq 6) and in driver clock by 0.0–0.2 ms.
- `legShape` is byte-identical across all 14 receipts modulo the nonce string (**14/14**, not just
  the 13/13 the note claims for the PRE set).

## 1. Statement-by-statement

### Header (lines 1-3)

| # | statement | verdict | evidence |
|---|---|---|---|
| 1 | sources S202–S206 opened 2026-11-07, round 76, before the freeze | **agree** | `sources/FETCH.txt` timestamps 03:56:02–03:56:08 -03:00; freeze commit `6ea51ce1` at 04:56:31 and digests commit `97bf5d5` at 04:56:39 (`git show --stat`, exit 0) |
| 2 | verified-at: Chromium 155.0.8059.84, `--headless=new`, product `Chrome/155.0.8059.84`, protocol 1.3, three-button fixture, beforeunload-cancelling window, 1280x900, dSF 1 | **agree** | every receipt's `host.chromium`, `host.cdpProduct`, `host.cdpProtocolVersion`, `host.argv[1]`; driver `scripts/chrome-cdp-dialog-round76.mjs:161-190` (fixture), `:264` (`Emulation.setDeviceMetricsOverride`, deviceScaleFactor 1) |
| 3 | recheck command (`--scratch/--out/--nonce/--http-port/--cdp-port`, counter with `--prior-set` lane-relative) | **agree** | driver usage `scripts/chrome-cdp-dialog-round76.mjs:5-7`; counter resolves prior-set lines with `path.join(lane, l)` (`scripts/check-dialog-r76.mjs:134`), so the relative path works with `--lane` absolute |

### Novelty paragraph (lines 7-13)

| # | statement | verdict | evidence |
|---|---|---|---|
| 4 | "no capability row **or note** covered a dialog: `git grep -lE 'handleJavaScriptDialog|javascriptDialogOpening' a69f9060 -- corpus/knowledge` was empty at base" | **DISAGREE (substantive)** | the grep is empty (`git grep … a69f9060 -- corpus/knowledge` → exit 1, no output), but it only tests the two CDP names. At base a note **does** cover a dialog: `git show a69f9060:corpus/knowledge/webdriver-bidi-runtime-round-32.md:83` (R17 "User prompts / dialogs … yes … the `tabi-alert` prompt event is observed, then a successful `handleUserPrompt`") and `:108` ("Not dialog coverage: one `alert` with `accept: true` … `confirm`/`prompt` … not measured"); `webdriver-bidi-firefox-runtime-round-35.md:124` repeats it with evidence; `webdriver-bidi-capability-matrix.md:76` calls dialogs "not currently a tabi surface (no anchor — honest lane-coverage gap)", which itself contradicts r32/r35's `yes`. The capability-row half is true: `git show a69f9060:SCORECARD.md | grep -c '^| \`chromium'` → 8 rows (7 unique names), `grep -in dialog` → 0. **Fix:** "no capability row and no note covered a *CDP* dialog: the lane had measured one `alert` accept over BiDi (r32/r35 R17, explicitly 'not dialog coverage'), and the capability table held no dialog row (7 chromium rows at base: `git show a69f9060:SCORECARD.md | grep -o '^| \`chromium-[a-z0-9-]*\`' | sort -u`)." |
| 5 | "The lane drives mouse, wheel, touch, gesture, key, IME and drag input (rounds 44–75)" | **agree with fix (minor)** | the seven chromium capability rows at base cover wheel/hscroll, synth tap/scroll/pinch, IME, drag; there is **no touch capability row** and no note drives `Input.dispatchTouchEvent` as a surface — `Input.dispatchTouchEvent` appears only inside `Input.synthesize*Gesture` notes (`corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md`, `…-tap-…-70.md`, `…-pinch-…-71.md`). **Fix:** "mouse, wheel, synthesized touch gestures, key, IME and drag". |
| 6 | a page that stubs `window.confirm` returns the "right" value with no dialog | **agree** | the `page-stub` degenerate control is exactly that (`scripts/chrome-cdp-dialog-round76.mjs:333-336`), and the counter refuses it (`controls/c1/degenerate-page-stub.receipt.json` is a prior; the counter's `scored-run-not-degenerate` check). |

### Protocol section (lines 15-44)

| # | statement | verdict | evidence |
|---|---|---|---|
| 7 | S202 `Page.pdl:392-397`: `DialogType` ∈ {alert, confirm, prompt, beforeunload} | **agree with fix (range)** | `sources/Page.pdl:392-398`; `beforeunload` is line **398**, outside the cited 392-397. The same off-by-one is in SOURCES S202 scope and anchor cells. **Fix:** `392-398`. |
| 8 | S202 `:879-886` `handleJavaScriptDialog(accept, optional promptText)`; quote "The text to enter into the dialog prompt before accepting. Used only if this is a prompt dialog." | **agree** | `sources/Page.pdl:879-886`; the quote is lines 884-885 verbatim. |
| 9 | S202 `:1463-1472` `javascriptDialogClosed` carries `result` and `userInput`; `:1474-1491` `javascriptDialogOpening` carries url, frameId, message, type, `hasBrowserHandler`, optional `defaultPrompt` | **agree** | `sources/Page.pdl:1463-1472` (event 1465, frameId 1468, result 1470, userInput 1472); `:1474-1491` (event 1476, url 1479, frameId 1481, message 1483, type 1485, hasBrowserHandler 1489, defaultPrompt 1491). |
| 10 | lines 1486-1488: "When browser has no dialog handler for given target, calling alert while Page domain is engaged will stall the page execution." | **agree** | `sources/Page.pdl:1486-1488`; the quote occurs contiguously after whitespace normalization (21 words). |
| 11 | S203 `:613-635` `DidRunJavaScriptDialog`: only when the Page domain is enabled; stores `pending_dialog_`; emits `JavascriptDialogOpening` with the type mapped from confirm/prompt (alert otherwise) | **agree** | `sources/page_handler.cc:613-635` (`if (!enabled_) return;` 620; `pending_dialog_ =` 624; mapping 625-631; emit 632-634). |
| 12 | S203 `:637-651` beforeunload variant emits an EMPTY message (`std::string()`) and no default prompt | **agree** | `sources/page_handler.cc:637-651` (empty message 648, empty default 650). |
| 13 | S203 `:653-662` closing emits `JavascriptDialogClosed(frame, success, user_input)` | **agree** | `sources/page_handler.cc:653-662`. |
| 14 | S203 `:1724-1756` `HandleJavaScriptDialog`; no pending dialog → `InvalidParams("No dialog is showing")` (line 1733; InvalidParams is code -32602); `prompt_override` empty unless `promptText` (1736-1739); callback runs `(accept, prompt_override)` (1740); the page's default prompt is not used | **agree with fix (attribution of the code)** | `sources/page_handler.cc:1724-1756`; 1733 and 1736-1740 exact. The `-32602` code is the protocol's invalid-params error, not text in `page_handler.cc`; it is measured (all 14 receipts' `no-dialog` leg: `{code:-32602, message:"No dialog is showing"}`). **Fix:** "InvalidParams (the protocol's invalid-params error, code -32602, measured)". |
| 15 | S204 `:9601-9603`: suppressed when neither an enabled Page handler nor a delegate dialog manager; "answered as if cancelled" | **agree with fix (range)** | `sources/web_contents_impl.cc:9601-9603` has the condition; the "as if cancelled" answer is `:9631-9634` (`std::move(callback).Run(true, false, std::u16string())`), outside the cited range. **Fix:** cite `:9601-9603` for the condition and `:9631-9634` for the answer. |
| 16 | S204 `:9643-9648` every enabled Page handler is told | **agree** | `sources/web_contents_impl.cc:9643-9648`. |
| 17 | S204 `:11656-11712` (`OnDialogClosed`): beforeunload closed without success calls `BeforeUnloadCanceled()` (11679) — navigation stops — then the renderer callback runs with `(success, user_input)` (11690) and every handler gets `DidCloseJavaScriptDialog` with the same pair (11695) | **agree with fix (range)** | `sources/web_contents_impl.cc:11675-11697`; 11679, 11690, 11695 exact. `OnDialogClosed` ends at **11701**; 11702-11712 are `GetRenderManager`/`SetBrowserPluginGuest`. **Fix:** `:11656-11701` (SOURCES S204 repeats 11656-11712). |
| 18 | S205 `:1587-1629` (`prompt`): returns `return_value` only when `OpenJavaScriptPrompt` reports success (1619-1621), otherwise `String()` — JavaScript `null` | **agree** | `sources/local_dom_window.cc:1587-1629`; 1619-1621 exact; `return String();` at 1628. |
| 19 | S206 `:533-581`: alert, confirm and prompt each go to the browser as a "Synchronous mojo call" (lines 542, 558, 576); the renderer's script stops inside the dialog function until the browser answers | **agree** | `sources/chrome_client_impl.cc:533-546` (alert, comment 542), `:548-562` (confirm, 558), `:564-582` (prompt, 576-577). The cited 533-581 stops one line before the prompt function's closing brace (582); the three quotes are inside. |

### Measured section (lines 46-70)

Header line 46: "nine pre-freeze runs and four probes, identical leg shapes 13/13" — **agree**, and
stronger: 13/13 PRE plus the (a) receipt, 14/14 (`matrix.mjs`, exit 0; `legShape` compared modulo
nonce).

Table (lines 50-60), every row re-derived from the 14 receipts:

| leg (answer) | note says | derived (14/14) | verdict |
|---|---|---|---|
| alert, accept | page `undefined`; opening alert "tabi-alert", defaultPrompt "", hasBrowserHandler true; closed true, "" | exactly that | **agree** |
| confirm, accept | `true`; confirm "tabi-confirm"; true, "" | exactly that | **agree** |
| confirm, dismiss | `false`; confirm "tabi-confirm"; false, "" | exactly that | **agree** |
| prompt, accept + promptText "tabi-typed" | `"tabi-typed"`; prompt "tabi-prompt", defaultPrompt "tabi-default"; true, "tabi-typed" | exactly that | **agree** |
| prompt, accept, no promptText | `""` (NOT the default); same opening; true, "" | exactly that | **agree** |
| prompt, dismiss + promptText "tabi-ignored" | `null`; same opening; **false, "tabi-ignored"** | exactly that | **agree** |
| answer with no dialog open | command fails `{code:-32602, message:"No dialog is showing"}` | exactly that; no dialog events bound; state unchanged (dialogs 6, last "prompt=null") | **agree** |
| navigate + cancelling beforeunload, dismiss | beforeunload trusted, defaultPrevented true; opening beforeunload ""; closed false, ""; `Page.navigate` errorText "net::ERR_ABORTED"; page stays "/" | exactly that; `stateAfter.unloads` 1, path "/" | **agree** |
| same, accept | opening beforeunload ""; closed true, ""; then `Page.frameNavigated` to /next and one /next request | exactly that; serverLog has exactly one `/next` 200 row with the run nonce; stateAfter path "/next", runIsNonce true, pageNonceIsNonce true | **agree** |

Prose bullets:

| # | statement | verdict | evidence |
|---|---|---|---|
| 20 | every page event trusted; the dialog return is recorded after the mouseup and before the click reaches the window listener | **agree** | 518/518 events `isTrusted`; 84/84 `dialog-return` seq 5 < `click` seq 6, driver clock 0.0–0.2 ms before the click record |
| 21 | "about 20 ms after the call (the CDP round trip of the answer)" | **DISAGREE (attribution)** | the 20 ms is real for this driver (18.6–24.8 ms, median 20.4, 84 samples), but it is **not** the CDP round trip: the driver polls `waitOpening` in 20 ms steps (`scripts/chrome-cdp-dialog-round76.mjs:340`) and sends the answer only after a poll sees the opening (`:360-364`). My probe answers on the event itself: page dialog block **1.1–3.4 ms**, handle round trip **1.3–3.4 ms**, plain `Runtime.evaluate` round trip 0.16–0.25 ms (`release-block-probe.receipt.txt`, 3 iterations, exit 0). **Fix:** "the call blocks until the answer — 18.6–24.8 ms in this driver (dominated by its 20 ms `waitOpening` poll), 1.1–3.4 ms when the answer is event-driven (R76Scribe probe)". |
| 22 | `hasBrowserHandler` true on this build in `--headless=new` (a full Chrome browser with a dialog manager); with the Page domain disabled the dialog would be left to that manager instead of being suppressed | **agree** | all 8 openings per receipt carry `hasBrowserHandler: true`; S204 `:9601-9603` (`has_non_devtools_handlers = delegate_ && dialog_manager`, folded into `has_handlers`) makes `true` mean a delegate dialog manager exists. |
| 23 | "it would hang the renderer until the manager answers; not measured" | **agree as an admitted limit, but the hang is [INFERENCE]** | the note marks it not measured; `hasBrowserHandler: true` proves a manager exists (S204 9601), not that it would hang — a manager may answer or auto-dismiss. **Fix:** "the manager's answer (or whether it answers at all) is unmeasured". |
| 24 | the mouse release that opens a dialog is answered by CDP only after the dialog is closed, so a driver must send it without awaiting | **agree, now measured (was [INFERENCE] in the note)** | the lane's receipts record no response times, so the note's own evidence did not show this. My probe: the `mouseReleased` response resolved **0.02–0.06 ms after the handle response** and **1.8–4.1 ms after the release was sent** — i.e. only after the close (`release-block-probe.receipt.txt`). **Fix:** cite the probe (or mark it as inferred from S206) and keep the driver rule. |

### Rejected beliefs (lines 74-82)

| # | belief | verdict | evidence |
|---|---|---|---|
| 25 | "accepting a prompt without promptText returns its default" rejected: S203 1736-1740 sends an empty `prompt_override`; measured `""` 13/13 | **agree** | `sources/page_handler.cc:1736-1740`; 14/14 receipts `prompt-noparam` ret `string:` (empty) |
| 26 | "`javascriptDialogClosed.userInput` is what the page received" rejected: dismiss returns `null` (S205) while the event echoes `promptText` (S204 11690/11695) | **agree** | `sources/local_dom_window.cc:1619-1628`; `sources/web_contents_impl.cc:11690,11695`; 14/14 receipts: page `null`, closed `false, "tabi-ignored"` |
| 27 | "answering when no dialog is open is a no-op" rejected: -32602, 13/13 | **agree** | `sources/page_handler.cc:1733`; 14/14 receipts `{code:-32602,message:"No dialog is showing"}` |

### Limits (lines 86-94)

| # | statement | verdict | evidence |
|---|---|---|---|
| 28 | one build, one platform, loopback, top-level frame only (no iframes, no cross-origin subframe dialogs — S204 9605-9626 suppresses those; not measured) | **agree with fix (range)** | receipts are loopback-only; the subframe suppression block is `sources/web_contents_impl.cc:9605-9628` (assignment at 9618; SOURCES S204 says 9605-9628). **Fix:** `9605-9628`. |
| 29 | not measured: Page domain disabled, another origin, reload-time beforeunload, timer/onbeforeunload dialogs without sticky activation; the fixture's earlier clicks give activation; S204's caller path for the activation rule is not mined | **agree** | the plan has no such leg (`plan` in every receipt, 10 legs); the fixture's beforeunload is only reached after six clicks; no activation-rule code is cited. |
| 30 | the counter reads a receipt; it is not an execution oracle (its header states the forgery limit) | **agree** | `scripts/check-dialog-r76.mjs:43-50` ("Limit (declared): this counter reads a receipt; it is not an execution oracle … 19 of the 37 events … at least 2 of the 6 gaps"). |

## 2. Proposed edits, in order of importance

1. **Line 9-10 (novelty).** Replace "but no capability row or note covered a dialog: `git grep -lE
   'handleJavaScriptDialog|javascriptDialogOpening' a69f9060 -- corpus/knowledge` was empty at base."
   with: "but no capability row and no note covered a *CDP* dialog: `git grep -lE
   'handleJavaScriptDialog|javascriptDialogOpening' a69f9060 -- corpus/knowledge` was empty at base,
   the capability table held no dialog row (`git show a69f9060:SCORECARD.md | grep -o '^| \`chromium-[a-z0-9-]*\`' | sort -u`
   → 7 rows, none a dialog), and the only prior dialog measurement is one `alert` accept over BiDi
   (r32/r35 R17, explicitly 'not dialog coverage')."
2. **Line 62-64 (20 ms).** Replace "(the CDP round trip of the answer)" with "(dominated by the
   driver's 20 ms `waitOpening` poll; the call itself blocks 1.1–3.4 ms when the answer is
   event-driven — R76Scribe probe)".
3. **Line 17.** `Page.pdl:392-397` → `392-398` (and the same in SOURCES S202 scope and anchor).
4. **Line 36.** `:11656-11712` → `:11656-11701` (`OnDialogClosed` ends at 11701; SOURCES S204 too).
5. **Line 35.** Cite `:9631-9634` for "answered as if cancelled".
6. **Line 87.** `S204 9605-9626` → `9605-9628` (match SOURCES S204).
7. **Line 30.** Say the `-32602` code is the protocol's invalid-params error (measured), not text in
   `page_handler.cc`.
8. **Line 8.** "touch" → "synthesized touch gestures" (no touch capability row).
9. **Line 67-68.** Drop the hang assertion: the manager's answer is unmeasured.
10. **Line 69-70.** Either cite the new probe or mark the release-ordering claim as inferred from
    S206; the lane's receipts do not record response times.

## 3. What this review did not establish

- The `hasBrowserHandler`/Page-domain-disabled leg was not run; the note's "not measured" stands.
- The note's `S202` claim that `InvalidParams` is `-32602` is confirmed only by the measured
  receipts (all 14) and the JSON-RPC convention; `page_handler.cc` does not spell the number.
- The prior BiDi dialog evidence (r32/r35) was read from the committed notes, not re-run.
- The note's line 91 claim about sticky activation was not tested; it is consistent with the
  fixture (six clicks precede the navigations) but unmeasured here.
