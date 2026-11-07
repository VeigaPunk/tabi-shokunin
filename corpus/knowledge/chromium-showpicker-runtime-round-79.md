# `HTMLInputElement.showPicker()` under interception — runtime law on Chromium 155/Linux headless

source: S216 (WHATWG HTML, `showPicker()` steps), S217 (MDN `HTMLInputElement.showPicker()`), S218 (Chromium 155.0.8059.84 `html_input_element.cc`, `HTMLInputElement::showPicker`); measured receipts `corpus/evidence/round79/chromium-showpicker/receipt.json` and the four pre-freeze receipts under `.ufo/waves/round-79/controls/c1/probes/`.
verified-at: 2026-11-07 (round 79; driver `scripts/chrome-cdp-showpicker-round79.mjs`, counter `scripts/check-showpicker-r79.mjs`)
recheck: `node scripts/chrome-cdp-showpicker-round79.mjs --lane <ABS lane> --nonce <tabi-r79-...> --scratch <ABS> --out <ABS>.json --http-port <p> --cdp-port <q>` then `node scripts/check-showpicker-r79.mjs --lane <ABS lane> --receipt <ABS>.json --expect-driver-sha256 <pin> --expect-nonce <nonce> --expect-fixture-sha256 <receipt fixture sha256> --prior-set .ufo/waves/round-79/controls/c1/prior-set.txt --json` (exit 0 clean, 56 checks).

## What the surface is

`HTMLInputElement.showPicker()` is the programmatic entry into the same picker a click opens. Under
`Page.setInterceptFileChooserDialog` the picker is replaced by the `Page.fileChooserOpened` event, so
the call and its answer are separately observable. This note holds the *trigger* law; the answer law
(`DOM.setFileInputFiles`, cancel, mode) is `chromium-file-chooser-runtime-round-78.md`.

The driver runs one fresh browser per leg (10 legs, `receipt.legs[]`), because
`navigator.userActivation.hasBeenActive` is per-window state and a shared browser would leak an
earlier leg's activation into a later "no activation" leg.

## The law, as measured

| # | Statement | Receipt field that carries it |
|---|---|---|
| 1 | Without transient activation `showPicker()` throws `NotAllowedError` with the message `Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.` and opens nothing — the refusal is identical with interception on and off, so the gesture check precedes the dialog | `legs[sp-nogesture-intercept-on].showPicker`, `legs[sp-nogesture-intercept-off].showPicker`, both `cdpEventLog` empty |
| 2 | One activation buys exactly one picker: after a successful call the second call in the same leg throws the same `NotAllowedError`, and `navigator.userActivation.isActive` goes `true -> false` | `legs[sp-show-twice].showPicker` (ok), `.showPicker2` (NotAllowedError), `.activationBefore/.activationAfter` |
| 3 | `Runtime.evaluate` with `userGesture: true` satisfies the requirement without any page click: the call succeeds, `isActive` stays `false` before and after, `hasBeenActive` becomes `true` | `legs[sp-cdp-gesture].showPicker`, `.activationBefore`, `.activationAfter` |
| 4 | A disabled input throws `InvalidStateError` with `HTMLInputElement::showPicker() cannot be used on immutable controls.`, opens nothing, and does **not** consume the activation (`isActive` stays `true`) | `legs[sp-disabled].showPicker`, `.activationBefore/.activationAfter` |
| 5 | With interception on the chooser event fires with `mode` from the page-measured input (`selectSingle`, `selectMultiple` for `multiple`), and the browser-assigned `backendNodeId` is reported, never required to be a literal | `legs[sp-click-then-show|sp-multiple-show].cdpEventLog`, `nodeReport` |
| 6 | With interception off the call still succeeds, no CDP event fires, and headless auto-cancels the native dialog: the page receives one `cancel` on the input and the file list stays empty | `legs[sp-intercept-off-click-then-show].pageEvents`, `.stateAfter` |
| 7 | An armed `{enabled: true, cancel: true}` interception fires the chooser event AND the page `cancel` immediately; a post-hoc `{cancel: true}` after the event is accepted and fires nothing (the flag arms the next chooser) | `legs[sp-cancel-armed].pageEvents`, `legs[sp-click-then-show].dismissResult`, `.pageEvents` |
| 8 | `showPicker()` never selects files and fires no pointer/input/change event: every leg's `stateAfter` has empty file lists, and the only page events are the leg's own prior click | `legs[*].stateAfter`, `legs[*].pageEvents` |

The source agrees on the order and the messages: `HTMLInputElement::showPicker` checks the
cross-origin rule (file and color exempt), then `!isMutable()` → `InvalidStateError`, then
`!LocalFrame::HasTransientUserActivation` → `NotAllowedError`, then
`LocalFrame::ConsumeTransientUserActivation(frame)` before `input_type_view_->OpenPopupView()`
(S218 lines 2652-2682). The spec's steps state the same order (S216); MDN names the three exception
classes and the transient-activation requirement (S217).

## Limits — what a receipt of this shape cannot prove

- **The picker UI itself.** Headless has no visible dialog; the receipt proves the call's outcome and
  the interception event, not what a user would see. The `cancel` in leg 6 is the headless
  auto-cancel, not a user's dismissal.
- **The activation source.** The receipt shows `isActive`/`hasBeenActive` transitions, not *which*
  input granted the activation; the pad click is the only input event in those legs, and the
  page-event log is the witness.
- **The `backendNodeId`.** Browser-assigned and unstable across runs (QUALITY 150); a consistent
  relabel is inside the limit by design.
- **Cross-origin `SecurityError`.** Not measured: the fixture is same-origin loopback, and a
  cross-origin iframe fixture is not built.
- **`HTMLSelectElement.showPicker()`.** Out of scope this round (the spec covers both).

## Frontier (named, not held)

- `showPicker()` on a `webkitdirectory` input and on an `accept`-constrained input (R79Exec3 probe).
- The `SecurityError` path in a cross-origin iframe.
- Whether the gesture check precedes the mutability check when both fail (R79Labrat's hypothesis:
  the source says mutability first; a disabled input with no activation should throw
  `InvalidStateError`).
- A picker answered after `showPicker` (the answer path is the r78 capability; the combination —
  programmatic trigger then `DOM.setFileInputFiles` — is not measured here).
