source: S187, S188, S189, S190, S191, S192, S193 (Chromium 155.0.8059.84 Input.pdl, input_handler.cc, input_method_controller.cc, event_target.cc, event_dispatcher.cc, scoped_event_queue.cc, editing_utilities.cc; opened 2026-11-06, round 74); pre-freeze repetition receipts .ufo/waves/round-74/controls/c1/smoke1..9.receipt.json
verified-at: 2026-11-06, lane round 74, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, loopback fixture with one <input> and one contenteditable <div>, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: S=<short ABS dir>; node scripts/chrome-cdp-imecompose-round74.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r74-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-imecompose-r74.mjs --receipt $S/receipt.json --expect-driver-sha256 <freeze.txt driver digest> --expect-nonce tabi-r74-recheck-<hex> --prior .ufo/waves/round-74/controls/c1/smoke1.receipt.json (exit 0 = still true on this host)

# Input.imeSetComposition and Input.insertText — what a page sees (round 74)

New ground for this lane: text entry through the DevTools IME commands rather than key events.
The lane already drives `Input.dispatchKeyEvent` and `Input.insertText` into a WebView2 form
(rounds 51–53), but it had never measured composition: which events a page receives, in what
order, with which `data`, `inputType`, `isComposing` and `isTrusted`, and what happens at the
edges (cancel, a selection under the caret, no focused element, a half-specified replacement).

## The commands (sourced)

- S187 `Input.pdl:141-162`: `insertText` "emulates inserting text that doesn't come from a key
  press, for example an emoji keyboard or an IME"; `imeSetComposition(text, selectionStart,
  selectionEnd, replacementStart?, replacementEnd?)` sets the candidate text, and the PDL says
  "Use imeSetComposition with empty string as text to cancel composition." Both are experimental.
- S188 `input_handler.cc:1281-1359`: both commands go to the focused render widget
  (`GetFocusedRenderWidgetHost`), call `widget_host->Focus()` and then the widget's
  `ImeCommitText` / `ImeSetComposition`. A `replacementStart` without `replacementEnd` is refused
  before any renderer call: "Either both replacement start/end are specified or neither."
  (`-32602`, line 1345). Neither handler sends a key event.

## What Blink does with them (sourced)

S189 `input_method_controller.cc` at the same tag:

- `SetComposition` (lines 1009–1095) returns at once when there is no focused element
  (lines 1032–1034). With text it sends `compositionstart` only when no composition exists,
  and that event's data is the frame's selected text: `!DispatchCompositionStartEvent(GetFrame().SelectedText())`
  (line 1084). Then `InsertTextDuringCompositionWithEvents` sends `compositionupdate` and the
  `insertCompositionText` beforeinput/input pair. With empty text and a live composition it
  replaces the composition with nothing, which ends it (comment block lines 1039–1053).
- `CommitText` (lines 694–705): with a composition it replaces it (`ReplaceCompositionAndMoveCaret`,
  line 700), else it inserts at the selection (`InsertTextAndMoveCaret`, line 704). That insert
  path does not stop on a missing focused element: `InsertText` (lines 924–932) passes
  `GetDocument().FocusedElement()` to `DispatchBeforeInputInsertText` and inserts anyway, and that
  helper skips the event when its target is null — "if (!target) return
  DispatchEventResult::kNotCanceled;" (S193 `editing_utilities.cc:1772-1773`). So with nothing
  focused, `insertText` still edits at the surviving DOM selection, with no `beforeinput`.
- `compositionstart` and `compositionupdate` are dispatched with `target->DispatchEvent(*event)`
  (lines 393, 1004). `compositionend` is dispatched with
  `EventDispatcher::DispatchScopedEvent(*target, *event)` (line 409).

Why that matters for `isTrusted` (S190–S192): `EventTarget::DispatchEvent` sets the flag —
"event.SetTrusted(true);" (S190 `event_target.cc:868`). `DispatchScopedEvent` only sets the
target and queues the event (S191 `event_dispatcher.cc:88-93`); the queue later hands it to
`EventDispatcher::DispatchEvent(*node, event)` (S192 `scoped_event_queue.cc:76-79`), which does
not. Other callers of `DispatchScopedEvent` set the flag themselves first (S191 lines 175–176,
the simulated Enter key). So a `compositionend` produced by the IME path reaches the page with
`isTrusted === false`, while every other event of the same composition is trusted.

## Measured (nine pre-freeze runs, identical leg shapes 9/9)

Leg by leg on `<input id=f>` then `<div id=ce contenteditable>` (focusin/focusout excluded):

| leg | command | page events (data) | state after |
|---|---|---|---|
| compose-a | imeSetComposition "か" 1,1 | compositionstart (""), compositionupdate ("か"), beforeinput/input insertCompositionText ("か", isComposing true) | f = "か", caret 1 |
| compose-b | imeSetComposition "かな" 2,2 | compositionupdate, beforeinput, input ("かな") — no second start | f = "かな" |
| commit | insertText "仮名" | compositionupdate, beforeinput insertCompositionText, textInput, input insertCompositionText ("仮名"), compositionend ("仮名", **isTrusted false**) | f = "仮名" |
| plain | insertText "ab" | beforeinput insertText (isComposing false), textInput, input insertText — no composition events | f = "仮名ab" |
| compose-c | imeSetComposition "x" after selecting "ab" | compositionstart data **"ab"** (the selected text), update/beforeinput/input "x" | f = "仮名x" |
| replace-half | replacementStart without end | error -32602, no events | unchanged |
| cancel | imeSetComposition "" | compositionupdate (""), beforeinput (""), textInput, input (data **null**), compositionend ("", untrusted) | f = "仮名" |
| ce-compose / ce-commit | "e"+U+0301 then insertText "é" | same shapes in the contenteditable; the decomposed composition is replaced by the precomposed commit | ce = "é" |
| nofocus-compose | imeSetComposition "z" after blur | nothing | unchanged |
| nofocus-insert | insertText "z" after blur | textInput (target BODY), input insertText on ce; ce becomes focused | ce = "éz" |

Also measured: no `keydown`/`keypress`/`keyup` in any leg (the IME path sends no key events,
consistent with S188); the first `focusin` lands in the first IME leg, not the script-focus leg
(the handler's `widget_host->Focus()` is the first time the headless page gets focus —
mechanism **inference**: the Focus() call is sourced, the deferral of focus events until the
page is focused is not).

## Limits

- The no-focus `insertText` edit is sourced up to "no beforeinput, insert at the selection"
  (S189, S193). Which node receives it (here the contenteditable the selection was left in) and
  why it then becomes the active element are measured, not sourced.
- One build, one host, headless, desktop metrics; `replacementStart`+`replacementEnd` together
  and IME text spans are frontier. The PDL comment says "Use imeCommitComposition to commit the
  final text." (S187 line 149) but the file declares no such command at this tag; this lane
  commits with `insertText`, which S189 routes to `ReplaceCompositionAndMoveCaret`.
- The counter reads receipts; it is not an execution oracle (see its declared limit).
