CONFIRMED

# R76Exec3 — Page domain DISABLED at dialog-open: confirm() is not suppressed and the page stays blocked

## Verdict

CONFIRMED. On Chromium 155.0.8059.84 `--headless=new` (3/3 independent runs), a `confirm()`
opened by a real mouse click while the Page domain was never enabled is **not suppressed and is
not auto-dismissed**: the renderer never returned from `confirm()` — every `Runtime.evaluate`
sent during and after the 3 s window went unanswered until the browser was SIGKILLed (~74 s of
continuous blockage per run). The auto-dismiss alternative (confirm returns false at once) is
refuted.

Measured extension of the same runs: the orphaned dialog is **unanswerable via CDP** —
`Page.enable` never produced a response, `javascriptDialogOpening` was never (re)delivered,
`Page.handleJavaScriptDialog` answered `-32602 "No dialog is showing"` on two independent
sessions, and the page stayed blocked until target destruction.

## Hypothesis under test (from dispatch)

> On this build in `--headless=new` (hasBrowserHandler true), a confirm() opened while the Page
> domain is DISABLED is not suppressed; it is left to the browser's dialog manager and the page
> stays blocked (no return within 3 s) — versus the alternative that headless auto-dismisses it
> (confirm returns false at once).

## Method

Probe: `.ufo/waves/round-76/w1/R76Exec3/probe-disabled-dialog.mjs`
(sha256 `d40933c408c08ed0d472fbf1e6ff1aa870bf7d9547f7fd0d22182df3be7d703e`; launch/sweep/teardown
plumbing copied from the lane driver `scripts/chrome-cdp-dialog-round76.mjs`, not modified).

Per run (3 runs, fresh `--user-data-dir`, fresh ports, fresh loopback fixture each time):

1. `/usr/bin/chromium --headless=new --remote-debugging-port=<p> --user-data-dir=<scratch>/profile-<token>`
   + the driver's hardening flags, opened directly on `http://127.0.0.1:<port>/` (no `Page.navigate`
   needed, so Page is never touched before the click).
2. Page-target WebSocket; `Runtime.enable` **only** (no `Page.enable`, no `Page.*` command at all
   before the click). Sanity `Runtime.evaluate` answered (`"pre-ok"`).
3. Real mouse click: `Input.dispatchMouseEvent` `mousePressed` awaited, `mouseReleased` sent
   **without awaiting** its ack. Button `#c` centre (300,120); handler sets
   `__phase='before-confirm'`, calls `window.confirm('r76exec3-confirm')`, then records
   `__result`/`__phase='after-confirm'`.
4. Poll `Runtime.evaluate` of the page-state expression every ~100 ms for 3000 ms after the
   release (700 ms per-evaluate timeout).
5. `Page.enable` (20 s bound) → watch 2.5 s for `Page.javascriptDialogOpening` →
   `Page.handleJavaScriptDialog {accept:true}` (15 s bound) → watch `javascriptDialogClosed` →
   unblock poll → diagnostic `Page.getFrameTree` (10 s).
6. If the s1 handle failed: second WebSocket session to the **same** page target, repeat
   `Page.enable` + `Page.handleJavaScriptDialog` + unblock (distinguishes per-session dispatch
   stall from target-level block).
7. Teardown: SIGKILL process group → `ps` sweep by launch token → fixture server closed →
   `pgrep -af <profileDir>` + `ps` needle scan + port probes as closure proof.

## Measurements (identical in run1/run2/run3; full JSONs beside this report)

| measurement | run1 | run2 | run3 |
|---|---|---|---|
| evaluates answered during 3 s block window | 0/4 (all `evaluate-unanswered-700ms`) | 0/4 | 0/4 |
| confirm() returned within window | never (no `after-confirm` ever observed) | never | never |
| `Page.enable` s1 response | none in 20 s; **no late response ever** (`lateResponses: []`) | none in 20 s; none late | none in 20 s; none late |
| `javascriptDialogOpening` (re)delivered | no (2.5 s watch, both sessions) | no | no |
| `Page.handleJavaScriptDialog` s1 | `-32602 "No dialog is showing"` in ~2.0 s | same | same |
| `Page.getFrameTree` diagnostic | no response in 10 s | no response in 10 s | no response in 10 s |
| session 2 `Page.enable` | no response in 20 s | no response in 20 s | no response in 20 s |
| session 2 `Page.handleJavaScriptDialog` | `-32602 "No dialog is showing"` in ~2.0 s | same | same |
| page unblocked after handle | never (`Runtime.evaluate` unanswered through teardown, ~74 s total) | never | never |
| `javascriptDialogClosed` | never | never | never |
| teardown: pgrep profile exit / ports / sweep survivors | `1` / closed+closed / 0 | `1` / closed+closed / 0 | `1` / closed+closed / 0 |

Timeline (run1, ms since ws connect; `run1.json` `cdpSendLog`/`polls`/`pageEnable`/`handle`):
release sent t=414 → 4 poll evaluates unanswered (t=414…3107) → `Page.enable` t=3623, no response
→ `Page.handleJavaScriptDialog` answered `-32602` at ~+2 s → `Page.getFrameTree` 10 s timeout →
session 2 same → SIGKILL at ~74 s after the click with the renderer still blocked
(`childExit.signal: "SIGKILL"`, `pgrepProfile.exit: 1`, `psNeedleMatches: []`,
`portProbes: {fixture:"closed", devtools:"closed"}`, `failures: []`).

## Mechanism (sourced; staged round-76 sources)

1. `confirm()` → `page->GetChromeClient().OpenJavaScriptConfirm(...)` — S205
   `local_dom_window.cc:1584` (function 1551-1585).
2. Renderer side is a **synchronous mojo call**: `OpenJavaScriptConfirmDelegate` →
   `RunModalConfirmDialog(..., &success)` — S206 `chrome_client_impl.cc:548-561` ("Synchronous
   mojo call" at 558). The renderer main thread blocks until the browser answers.
3. Browser routing — S204 `web_contents_impl.cc:9601-9603`:
   `has_non_devtools_handlers = delegate_ && dialog_manager`;
   `has_handlers = page_handlers.size() || has_non_devtools_handlers`;
   `suppress_this_message = should_suppress || !has_handlers`.
   With Page disabled, `page_handlers` is empty, but the headless delegate supplies a
   `JavaScriptDialogManager` → `has_handlers` stays true → **not suppressed**. At 9650-9656 the
   `page_handlers` loop is skipped and `dialog_manager->RunJavaScriptDialog(...)` alone receives
   the dialog plus the `CloseDialogCallbackWrapper` — the dialog is parked browser-side.
4. The PageHandler never learns of it: `DidRunJavaScriptDialog` early-returns unless `enabled_`
   and is only invoked for enabled handlers — S203 `page_handler.cc:613-624` (gate + the
   `pending_dialog_` store that also emits `JavascriptDialogOpening` at 632-634). So no
   `javascriptDialogOpening`, and `pending_dialog_` stays null.
5. `PageHandler::Enable` (S203 665-686) only flips `enabled_` (plus a pending-navigation
   `FrameStartedNavigating`); it has **no path that re-emits a dialog already showing**.
6. `PageHandler::HandleJavaScriptDialog` (S203 1724-1755) checks `pending_dialog_.is_null()` →
   `Response::InvalidParams("No dialog is showing")` at **1732-1733** — before the dialog-manager
   cleanup at 1744-1751 is ever reached. This is exactly the measured `-32602` on both sessions.
7. `hasBrowserHandler` (S202 `Page.pdl` ~1486-1488) is unobservable in this configuration because
   `javascriptDialogOpening` is never emitted at all.

Observed but not fully explained by staged sources [INFERENCE]: `Page.enable` and
`Page.getFrameTree` produced no response within their bounds and no late response ever arrived,
while `Page.handleJavaScriptDialog` — which returns a definite `InvalidParams`/`Success` rather
than `Response::FallThrough()` (S203 686, 1733, 1754) — was answered in ~2 s. Consistent with
FallThrough commands chaining to a handler that needs the blocked renderer; the fallthrough
chain itself is outside the staged sources.

## Consequence for the note's Limits (proposed, NOT applied)

> - A dialog opened while the Page domain is disabled cannot be answered or dismissed over CDP on
>   this build (measured, R76Exec3 probe, 3/3 runs): `confirm()` is not suppressed — S204
>   9601-9603 suppresses only when there is no Page handler AND no dialog manager, and the
>   headless delegate supplies one — so WebContentsImpl hands the dialog solely to that manager
>   (S204 9650-9656) while the renderer blocks in the synchronous mojo wait (S206 558-560; S205
>   1584). The PageHandler never sees it (`DidRunJavaScriptDialog` is `enabled_`-gated,
>   S203 613-624; `Enable` has no re-emission path, S203 665-686), `javascriptDialogOpening` is
>   never emitted so `hasBrowserHandler` is unobservable (S202 1486-1488), and
>   `Page.handleJavaScriptDialog` fails `-32602 "No dialog is showing"` because `pending_dialog_`
>   is null (S203 1732-1733) — on two independent sessions. `Page.enable`/`Page.getFrameTree`
>   went unanswered (20 s/10 s, no late response) while the definite-response handle command
>   answered in ~2 s [INFERENCE: FallThrough commands chain to a handler needing the blocked
>   renderer]. Net effect: `Runtime.evaluate` stays unanswered and the page remains blocked until
>   the target is destroyed (observed ~74 s to SIGKILL, 3/3 runs).

## Evidence files (this directory)

- `probe-disabled-dialog.mjs` — probe source, sha256 `d40933c408c08ed0d472fbf1e6ff1aa870bf7d9547f7fd0d22182df3be7d703e`
- `run1.json`, `run2.json`, `run3.json` — per-run receipts (cdpSendLog, polls, pageEnable,
  opening, handle, session2, pageDomainProbe, lateResponses, unblock, teardown, verdict)
- `stdout-run{1,2,3}.txt` — console verdicts (`coreHeld: false` is expected: the probe's `core`
  required CDP to answer the dialog, which this configuration cannot do — the hypothesis itself
  is the blocked/not-suppressed claim, which held 3/3)

## Commands run (exit codes)

- `node probe-disabled-dialog.mjs --scratch /fast/scratch/hyaku/tabi-r76/R76Exec3 --out run{i}.json --run run{i}` ×3 → exit 1 each (probe's strict `core` predicate false by design of the unanswerable-dialog finding; `failures: []`, teardown clean, `pgrep` exit 1)
- `pgrep -af 'tabi-r76/R76Exec3'` after all runs → exit 1 (no survivors)
- `node --check probe-disabled-dialog.mjs` → exit 0
- `sha256sum` on staged script → `d40933c4…703e`

## Risks / blockers

- None blocking. The `-32602`/hang behaviour was reproduced identically 3/3; the only unproven
  link is the exact reason `Page.enable`/`Page.getFrameTree` never respond (FallThrough chain is
  outside staged sources) — labelled [INFERENCE] above.
- Note: an earlier probe revision left the fixture HTTP server open, which kept the node process
  alive after writing run1.json; fixed (server now closed in teardown before port probes) before
  the committed 3 runs. The committed JSONs are from the final script only.
