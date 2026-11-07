source: S202, S203, S204, S205, S206 (Chromium 155.0.8059.84 Page.pdl, page_handler.cc, web_contents_impl.cc, local_dom_window.cc, chrome_client_impl.cc; opened 2026-11-07, round 76, before the freeze); S207 (browser_web_contents_delegate.cc; opened 2026-11-07 after the freeze, frontier row, not the claim's grounding)
verified-at: 2026-11-07, lane round 76, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, CDP product `Chrome/155.0.8059.84`, protocol 1.3, loopback fixture with three buttons (alert / confirm / prompt from click handlers) and a window that cancels beforeunload, viewport 1280x900, deviceScaleFactor 1
recheck: S=<short ABS dir>; node scripts/chrome-cdp-dialog-round76.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r76-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-dialog-r76.mjs --lane <ABS lane> --receipt $S/receipt.json --expect-driver-sha256 <freeze.txt driver digest> --expect-nonce tabi-r76-recheck-<hex> --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt [--prior <every later r76 receipt in the lane>] --json  (exit 0 clean)

# Page.handleJavaScriptDialog — what a page sees when CDP answers its dialogs (round 76)

New ground for this lane: JavaScript dialogs (`alert`, `confirm`, `prompt`, `beforeunload`)
driven and answered over raw CDP. The lane drives mouse, wheel, synthesized touch gestures, key,
IME and drag input (rounds 44–75), but no capability row covered a dialog and no note covered the
CDP dialog surface: `git grep -lE 'handleJavaScriptDialog|javascriptDialogOpening' a69f9060 --
corpus/knowledge` was empty at base. (Corrected after the wave, R76Scribe: the first wording "no
note covered a dialog" was false — the WebDriver BiDi notes of rounds 32/35 measured ONE `alert`
accepted through BiDi `handleUserPrompt`, `webdriver-bidi-runtime-round-32.md:83,108`, and say
themselves "Not dialog coverage"; confirm, prompt, beforeunload and the CDP surface were unmeasured.)
A dialog is where browser automation most often hangs or silently fakes success (a page that
stubs `window.confirm` returns the "right" value with no dialog at all), so the note records what
the browser itself delivers and returns.

## The protocol (sourced)

- S202 `Page.pdl:392-398` (corrected from 392-397: `beforeunload` is line 398): `DialogType` ∈ {alert, confirm, prompt, beforeunload}. `:879-886`
  `handleJavaScriptDialog(accept, optional promptText)` — "The text to enter into the dialog prompt
  before accepting. Used only if this is a prompt dialog." `:1463-1472` `javascriptDialogClosed`
  carries `result` and `userInput`; `:1474-1491` `javascriptDialogOpening` carries url, frameId,
  message, type, `hasBrowserHandler` and optional `defaultPrompt`; lines 1486-1488: "When browser
  has no dialog handler for given target, calling alert while Page domain is engaged will stall
  the page execution."
- S203 `page_handler.cc:613-635` (`DidRunJavaScriptDialog`): only when the Page domain is
  enabled; it stores the dialog's callback (`pending_dialog_`) and emits `JavascriptDialogOpening`
  with the type mapped from confirm/prompt (alert otherwise). `:637-651` the beforeunload variant
  emits an EMPTY message (`std::string()`) and no default prompt. `:653-662` closing emits
  `JavascriptDialogClosed(frame, success, user_input)`.
- S203 `:1724-1756` (`HandleJavaScriptDialog`): no pending dialog → `Response::InvalidParams("No
  dialog is showing")` (line 1733; the code -32602 is the protocol's invalid-params code as
  measured 13/13, not text of this file); otherwise `prompt_override` is
  an EMPTY string unless `promptText` is given (1736-1739) and the stored callback runs with
  `(accept, prompt_override)` (1740) — the page's default prompt is not used.
- S204 `web_contents_impl.cc:9601-9603`: a dialog with neither an enabled Page handler nor a
  delegate dialog manager is suppressed (`suppress_this_message = should_suppress ||
  !has_handlers`) and answered as if cancelled (`:9631-9634`); `:9643-9648` every enabled Page handler is told; the
  closing path `:11656-11701` (`OnDialogClosed`; corrected from 11656-11712): a beforeunload dialog closed without success
  calls `BeforeUnloadCanceled()` (11679) — the navigation stops — then the renderer's callback runs
  with `(success, user_input)` (11690) and every handler gets `DidCloseJavaScriptDialog` with the
  same pair (11695).
- S205 `local_dom_window.cc:1587-1629` (`prompt`): returns the dialog's `return_value` only when
  `OpenJavaScriptPrompt` reports success (1619-1621), otherwise `String()` — JavaScript `null`.
- S206 `chrome_client_impl.cc:533-581`: alert, confirm and prompt each go to the browser as a
  "Synchronous mojo call" (lines 542, 558, 576): the renderer's script stops inside the dialog
  function until the browser answers.

## Measured (nine pre-freeze runs and four probes, identical leg shapes 13/13)

`controls/c1/probe/p1-p4`, `controls/c1/smoke1-9` (driver `scripts/chrome-cdp-dialog-round76.mjs`):

| leg (answer) | page return | `javascriptDialogOpening` | `javascriptDialogClosed` |
|---|---|---|---|
| alert, accept | `undefined` | alert, "tabi-alert", defaultPrompt "", hasBrowserHandler true | result true, userInput "" |
| confirm, accept | `true` | confirm, "tabi-confirm" | true, "" |
| confirm, dismiss | `false` | confirm, "tabi-confirm" | false, "" |
| prompt, accept + promptText "tabi-typed" | `"tabi-typed"` | prompt, "tabi-prompt", defaultPrompt "tabi-default" | true, "tabi-typed" |
| prompt, accept, no promptText | `""` (NOT the default "tabi-default") | same | true, "" |
| prompt, dismiss + promptText "tabi-ignored" | `null` | same | **false, "tabi-ignored"** (the event echoes the text the page never received) |
| answer with no dialog open | — | — | — ; the command fails `{code: -32602, message: "No dialog is showing"}` |
| navigate with a cancelling beforeunload, dismiss | — (beforeunload event trusted, defaultPrevented true) | beforeunload, message "" | false, "" ; `Page.navigate` returns `errorText "net::ERR_ABORTED"`, the page stays on `/` |
| same, accept | — | beforeunload, "" | true, "" ; then `Page.frameNavigated` to `/next` and one `/next` request |

- Every page event is trusted (`isTrusted true`), the return of each dialog function is recorded
  after the mouseup and before the click reaches the window listener, 18.6–24.8 ms after the call
  in the driver's receipts: the page is blocked in the dialog (S206). (Corrected after the wave,
  R76Scribe: that interval is dominated by the driver's 20 ms `waitOpening` poll, not the CDP round
  trip; an event-driven probe measured the block at 1.1–3.4 ms, `.ufo/waves/round-76/w1/R76Scribe/release-block-probe.receipt.txt`.)
- `hasBrowserHandler` is `true` on this build in `--headless=new`: a delegate dialog manager exists
  (S204 9601). Measured after the freeze by R76Exec3 (3/3 runs, frontier, not the claim's
  grounding; `.ufo/waves/round-76/w1/R76Exec3/run1-3.json`): a `confirm()` opened while the Page
  domain was never enabled is NOT suppressed and NOT auto-dismissed — the renderer stays blocked
  (every `Runtime.evaluate` unanswered until the browser was killed, ~74 s), `Page.enable` emits
  no late `javascriptDialogOpening`, and `Page.handleJavaScriptDialog` fails -32602 "No dialog is
  showing" (S203 613-624: the opening path is `enabled_`-gated, so `pending_dialog_` stays null).
  The manager is `javascript_dialogs::TabModalDialogManager` (S207 1115-1119, located by R76Scout).
- The mouse release that opens a dialog is answered by CDP only after the dialog is closed, so a
  driver must send it without awaiting, wait for `javascriptDialogOpening`, then answer (measured
  by R76Scribe's probe: the release response resolves 0.02–0.06 ms after the handle response).

## Rejected beliefs (with flip conditions)

- "Accepting a prompt without `promptText` returns its default value" — rejected: S203 1736-1740
  sends an empty `prompt_override`; measured `""` 13/13. Flip: a tag whose handler passes the
  default prompt when `promptText` is absent, or a run that returns it.
- "`javascriptDialogClosed.userInput` is what the page received" — rejected: on dismiss the page
  gets `null` (S205) while the event echoes `promptText` (S204 11690/11695 pass the same
  `user_input` to both; S205 drops it on failure); measured 13/13. Flip: a tag that clears
  `user_input` on cancel.
- "Answering when no dialog is open is a no-op" — rejected: -32602 "No dialog is showing" (S203
  1733 for the message; the code measured), 13/13.

## Limits

- One build (Chromium 155.0.8059.84, Arch Linux), one platform (Linux, `--headless=new`), loopback
  only, top-level frame only (no iframes, no cross-origin subframe dialogs — S204 9605-9628
  suppresses those; not measured).
- Not measured: `Page.navigate` to another origin, reload-time beforeunload (`is_reload`), dialogs
  from timers or from `onbeforeunload` without sticky user activation (the fixture's earlier
  clicks give the page activation; S204's caller path for the activation rule is not mined). The
  Page-disabled case is measured only by R76Exec3's post-freeze probe (above), not by the counter.
- The counter `scripts/check-dialog-r76.mjs` reads a receipt; it is not an execution oracle (its
  header states the forgery limit, which R76Critic showed is not exact: the frozen sentence says
  19 events and 2 of 6 gaps, but the gap fraction's denominator is the receipt's OWN gap count, so a
  forgery that adds a seventh gap escapes with 19 events and 1 changed gap —
  `.ufo/waves/round-76/w1/R76Critic/F2c-one-gap.counter.json`, exit 0).
