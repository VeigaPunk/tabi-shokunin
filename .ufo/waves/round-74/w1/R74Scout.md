CONFIRMED

# R74Scout — independent re-fetch of S187–S193 (Chromium 155.0.8059.84) and location of the two measured-not-sourced mechanisms

Seat R74Scout (scout), round 74 wave 1. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`c72235d6aebca89269809050e983d53df36273f5`. Independent session: no lane file was read for digests
except as a comparison target; every digest below was recomputed from this session's own fetch.

## Verdict summary

| claim | result | evidence |
|---|---|---|
| All 7 staged sources S187–S193 are byte-identical to an independent fetch of the same tag | CONFIRMED | `cmp` exit 0 on all 7; `cmp-log.txt` |
| Every line anchor cited in `corpus/SOURCES.md` rows S187–S193 is on the cited code | CONFIRMED | `anchors.txt` Part A, 51 checks, 0 miss |
| Every line anchor cited in the note `corpus/knowledge/chromium-ime-composition-runtime-round-74.md` is on the cited code | CONFIRMED | `anchors.txt` Part B, 24 checks, 0 miss |
| S187's "the PDL declares no `imeCommitComposition` command at this tag" | CONFIRMED | `anchors.txt` Part C (`grep` over `Input.pdl`) |
| Mechanism (i) — why a no-focus `Input.insertText` lands in the contenteditable holding the DOM selection and makes it the active element | NOW SOURCED (was "measured, not sourced") | §3.1 |
| Mechanism (ii) — why the first `focusin` arrives with the first IME command rather than the script `focus()` call | NOW SOURCED (was labelled "mechanism inference" in the note) | §3.2 |

The note's own limit section names both gaps explicitly; both are closed from Chromium source at the
same tag, with no change to the measured shapes.

## 1. Independent fetch (this session)

Transport: `curl -sS <url>?format=TEXT` then `base64 -d`, exactly the transport `FETCH.txt` records.
Base URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`.
Full log with access times, HTTP status, sha256 and line counts: `fetch-log.txt` (copied here from
scratch); the machine-readable form is `fetch-receipt.json`.

All 7 fetches returned HTTP 200.

| id | path | access time (UTC) | sha256 | lines |
|---|---|---|---|---|
| S187 | `third_party/blink/public/devtools_protocol/domains/Input.pdl` | 2026-11-07T03:31:10Z | `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` | 336 |
| S188 | `content/browser/devtools/protocol/input_handler.cc` | 2026-11-07T03:31:11Z | `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` | 2343 |
| S189 | `third_party/blink/renderer/core/editing/ime/input_method_controller.cc` | 2026-11-07T03:31:12Z | `7c72e618ec14e4c3b26f9ef471ea2132581cf6b7682a26a314a9f1c77c6bbde4` | 2163 |
| S190 | `third_party/blink/renderer/core/dom/events/event_target.cc` | 2026-11-07T03:31:12Z | `46bfd353675ec1a3a72825ee2940869ee9d1a644b64796d1da554670a20092d0` | 1175 |
| S191 | `third_party/blink/renderer/core/dom/events/event_dispatcher.cc` | 2026-11-07T03:31:13Z | `8456e1ee3a3452d11ae30d056c07c98ec84545dc44f78f75ef0a4517cfeaf06b` | 496 |
| S192 | `third_party/blink/renderer/core/dom/events/scoped_event_queue.cc` | 2026-11-07T03:31:14Z | `85f4e467bd3450223cba20d4c27d32e808ef29c1086cdba392a69336a17471ee` | 99 |
| S193 | `third_party/blink/renderer/core/editing/editing_utilities.cc` | 2026-11-07T03:31:15Z | `dda549bb5a5c97d3455c648f7a211daac858b037453deeddf52a017a8dc8b1a0` | 1999 |

### 1.1 `cmp` against the L1-staged copies

Staged dir `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/sources/`.

```
$ for f in Input.pdl input_handler.cc input_method_controller.cc event_target.cc \
           event_dispatcher.cc scoped_event_queue.cc editing_utilities.cc; do
    cmp -s "$S/$f" "$R/$f" && echo "$f IDENTICAL" || echo "$f DIFFER"; done
Input.pdl                  IDENTICAL
input_handler.cc           IDENTICAL
input_method_controller.cc IDENTICAL
event_target.cc            IDENTICAL
event_dispatcher.cc        IDENTICAL
scoped_event_queue.cc      IDENTICAL
editing_utilities.cc       IDENTICAL
```

Exit 0 for all 7 (`cmp-log.txt`). The staged digests also equal the digests recorded in
`FETCH.txt` and in the `SOURCES.md` rows — the staged set is exactly the upstream bytes at the tag.

### 1.2 Tag identity

The fetch is pinned by tag `155.0.8059.84`; the local `/usr/bin/chromium` is 155.0.8059.84
(receipt `host.chromium`, `corpus/evidence/round74/chromium-ime-composition/receipt.json`).
Additional files fetched this session for the mechanism work (same tag, same transport) are listed
in `fetch-log.txt` under "extra"; `domdir/node.cc` was additionally obtained via the gitiles
`+archive` tarball and `cmp`-verified identical to its `?format=TEXT` fetch
(sha256 `1fa7935829ce6d568b26d8a5148899396af1119c96a5809bbecef48b5ce1cfd3`).

No tool was installed or upgraded this session; `curl 8.23.0`, `base64`, `sha256sum`, `cmp` and
`node` were already present (`which` output in `fetch-log.txt`).

## 2. Anchors in `corpus/SOURCES.md` rows S187–S193 (27 checks, all on)

Quotes are ≤25 words, each with its file:line. Full list: `anchors.txt`.

**S187** `Input.pdl` — decoded lines 141–162; line 150 empty-string cancel comment; line 149 names
`imeCommitComposition`, which the file does not declare.
- `Input.pdl:141-142` — "This method emulates inserting text that doesn't come from a key press, for example an emoji keyboard or an IME."
- `Input.pdl:149` — "Use imeCommitComposition to commit the final text."
- `Input.pdl:150` — "Use imeSetComposition with empty string as text to cancel composition."
- `Input.pdl:151` — "experimental command imeSetComposition"; parameters `text` (154), `selectionStart` (156), `selectionEnd` (158), `replacementStart` (160), `replacementEnd` (162).
- Declaration check: `grep -n "imeCommitComposition\|imeSetComposition\|command ime"` → only 149 (comment), 150, 151. **No `command imeCommitComposition` at this tag** — the row's claim holds.

**S188** `input_handler.cc` — decoded lines 1281–1304 (InsertText), 1306–1359 (ImeSetComposition), line 1345 the InvalidParams text.
- `input_handler.cc:1289` — "RenderWidgetHostImpl* widget_host = host_->GetRenderWidgetHost();"
- `input_handler.cc:1292` — "widget_host = delegate()->GetFocusedRenderWidgetHost(widget_host);" (focused-widget routing, InsertText)
- `input_handler.cc:1300` — "widget_host->Focus();"
- `input_handler.cc:1301` — "widget_host->GetWidgetInputHandler()->ImeCommitText(" (no key event)
- `input_handler.cc:1329` — "widget_host = delegate()->GetFocusedRenderWidgetHost(widget_host);" (ImeSetComposition routing)
- `input_handler.cc:1344-1345` — "callback->sendFailure(Response::InvalidParams(" / "Either both replacement start/end are specified or neither.")"
- `input_handler.cc:1353` — "widget_host->Focus();"; `1355` — "widget_host->GetWidgetInputHandler()->ImeSetComposition(" (no key event)
- Digest cross-check: identical to S174's staged sha256 `72cf0d1d…24f4` — the row's "bytes identical to S174" holds.

**S189** `input_method_controller.cc` — decoded lines 385–409, 694–705, 924–932, 997–1007, 1009–1095 (no-focus return 1032–1034, comment block 1039–1053, selected-text start 1084).
- `input_method_controller.cc:393` — "target->DispatchEvent(*event);" (compositionupdate)
- `input_method_controller.cc:409` — "EventDispatcher::DispatchScopedEvent(*target, *event);" (compositionend)
- `input_method_controller.cc:700` — "result = ReplaceCompositionAndMoveCaret(text, relative_caret_position,"
- `input_method_controller.cc:704` — "InsertTextAndMoveCaret(text, relative_caret_position, ime_text_spans);"
- `input_method_controller.cc:925` — "if (DispatchBeforeInputInsertText(GetDocument().FocusedElement(), text) !="
- `input_method_controller.cc:1032-1034` — "Element* target = GetDocument().FocusedElement();" / "if (!target)" / "return;"
- `input_method_controller.cc:1084` — "!DispatchCompositionStartEvent(GetFrame().SelectedText())) {"

**S190** `event_target.cc` — decoded lines 856 (script path `SetTrusted(false)`), 865–870 (`DispatchEvent` sets `SetTrusted(true)`).
- `event_target.cc:856` — "event->SetTrusted(false);"
- `event_target.cc:868` — "event.SetTrusted(true);"

**S191** `event_dispatcher.cc` — decoded lines 88–93 (`DispatchScopedEvent`), 168–176 (simulated Enter key).
- `event_dispatcher.cc:91` — "event.SetTarget(&EventPath::EventTargetRespectingTargetRules(node));"
- `event_dispatcher.cc:92` — "ScopedEventQueue::Instance()->EnqueueEvent(event);"
- `event_dispatcher.cc:175` — "event->SetTrusted(true);"; `176` — "DispatchScopedEvent(input_element, *event);"

**S192** `scoped_event_queue.cc` — decoded lines 60–65, 67–73, 75–79.
- `scoped_event_queue.cc:61-62` — "if (ShouldQueueEvents())" / "queued_events_->push_back(event);"
- `scoped_event_queue.cc:71-72` — "for (auto& event : queued_events)" / "DispatchEvent(*event);"
- `scoped_event_queue.cc:78` — "EventDispatcher::DispatchEvent(*node, event);"

**S193** `editing_utilities.cc` — decoded lines 1767–1780; 1772–1773 the null-target return.
- `editing_utilities.cc:1767` — "DispatchEventResult DispatchBeforeInputInsertText("
- `editing_utilities.cc:1772-1773` — "if (!target)" / "return DispatchEventResult::kNotCanceled;"

## 3. The two measured-not-sourced mechanisms, now located

All paths below are `chromium/src` at tag `155.0.8059.84`.

### 3.1 Mechanism (i) — no-focus `Input.insertText` lands in the contenteditable and makes it the active element

The note's limit section: *"Which node receives it (here the contenteditable the selection was left
in) and why it then becomes the active element are measured, not sourced."* Both halves are now
sourced.

**(a) The text lands in the contenteditable that still holds the DOM selection.**
`blur` clears the *focused element* but not the DOM selection: `Element::blur()`
(`third_party/blink/renderer/core/dom/element.cc:8767-8782`) calls
`doc.GetPage()->GetFocusController().SetFocusedElement(nullptr, doc.GetFrame())`, and
`Document::SetFocusedElement` nulls `focused_element_` (`third_party/blink/renderer/core/dom/document.cc:5949`)
without touching the selection; no `ClearSelection` call exists on that path.

The insert then runs with **no** focused element, and still edits the selection:
- `input_method_controller.cc:924-932` — `InsertText(text)` calls
  `DispatchBeforeInputInsertText(GetDocument().FocusedElement(), text)`; the target is null, so
  `editing_utilities.cc:1772-1773` returns `kNotCanceled` **without dispatching** — hence no
  `beforeinput` in the no-focus leg — and the insert proceeds via `GetEditor().InsertText(text, nullptr)`.
- `third_party/blink/renderer/core/editing/editor.cc:486-489` — `Editor::InsertText` →
  `GetFrame().GetEventHandler().HandleTextInputEvent(text, triggering_event)`.
- `third_party/blink/renderer/core/input/event_handler.cc:2524-2527` — with no underlying event the
  target is `EventTargetNodeForDocument(frame_->GetDocument())`.
- `third_party/blink/renderer/core/dom/document.cc:8945-8958` — `EventTargetNodeForDocument` returns
  `doc->FocusedElement()`, which is null after blur, and falls through to `doc->body()` for an
  `HTMLDocument`. That is exactly the measured `textInput` target **BODY**.
- `third_party/blink/renderer/core/editing/editor.cc:114-134` — `Editor::SelectionForCommand` returns
  the frame selection unchanged when the event target is not a text control (BODY is not):
  "if (!IsTextControl(*event->RawTarget()->ToNode())) { return selection; }" — the *DOM* selection,
  still inside `#ce`.
- `editor.cc:498-512` — `InsertTextWithoutSendingTextEvent` uses that selection and calls
  `TypingCommand::InsertText(*selection.Start().GetDocument(), text, selection.AsSelection(), ...)`.
- The resulting `input` event targets the root editable element:
  `third_party/blink/renderer/core/editing/commands/composite_edit_command.cc:2479-2483` →
  `third_party/blink/renderer/core/editing/commands/editing_commands_utilities.cc:776-789` →
  `DispatchInputEvent(start_root, ...)`; `editing_commands_utilities.cc:773` dispatches with
  `target->DispatchScopedEvent(*input_event)`, i.e. `Node::DispatchScopedEvent`
  (`third_party/blink/renderer/core/dom/node.cc:3379-3382`) which does `event.SetTrusted(true)` —
  so this `input` event is **trusted**, matching the receipt.

Measured cross-check (`corpus/evidence/round74/chromium-ime-composition/receipt.json`, `nofocus-insert`):
seq 38 `textInput` target BODY, seq 39 `input` target `ce` value `éz` — and the appended `z` after
`é` shows the insertion happened at the caret still inside `#ce`.

**(b) The contenteditable becomes the active element.** After the edit the selection is rewritten, and
Blink re-derives focus from it:
- `editing_commands_utilities.cc:806-822` — `ChangeSelectionAfterCommand` calls
  `frame->Selection().SetSelection(new_selection, options)`; the options do not set
  `DoNotSetFocus` (`third_party/blink/renderer/core/editing/set_selection_options.h:33,48`:
  `bool DoNotSetFocus() const { return do_not_set_focus_; }` / `bool do_not_set_focus_ = false;`).
- `third_party/blink/renderer/core/editing/frame_selection.cc:390-391` — `DidSetSelectionDeprecated`:
  "if (!new_selection.IsNone() && !options.DoNotSetFocus()) { SetFocusedNodeIfNeeded();"
- `frame_selection.cc:1283-1309` — `SetFocusedNodeIfNeeded` takes
  `visible_selection.RootEditableElement()` (the `#ce` div), walks up, and for a focusable target calls
  `frame_->GetPage()->GetFocusController().SetFocusedElement(target, frame_)`.
- `third_party/blink/renderer/core/dom/element.cc:9004-9015` — a root editable element is focusable:
  "IsRootEditableElementWithCounting(*this) ||" → `FocusableState::kFocusable`.
- `third_party/blink/renderer/core/page/focus_controller.cc:2419-2423` → `Document::SetFocusedElement` →
  `document.cc:6047` "focused_element_ = new_focused_element;".
- `document.activeElement` then reports `#ce`: `third_party/blink/renderer/core/dom/tree_scope.cc:778-783`
  — `TreeScope::activeElement()` returns `AdjustedFocusedElement(...)`, and
  `tree_scope.cc:708-710` — "Element* element = document.FocusedElement();".
- The `focusin` on `#ce` (receipt seq 40) is dispatched by
  `document.cc:6090-6104` (gate satisfied: the page is focused) and is **trusted** because
  `Element::DispatchFocusInEvent` uses `DispatchScopedEvent`
  (`third_party/blink/renderer/core/dom/element.cc:9634-9647` → `Node::DispatchScopedEvent`,
  `node.cc:3380` `event.SetTrusted(true);`).

Measured cross-check: receipt `nofocus-insert` seq 40 `focusin` target `ce`, trusted; leg
`stateAfter.active` = `ce` (was `BODY` after `blur`).

### 3.2 Mechanism (ii) — the first `focusin` arrives with the first IME command, not with the script `focus()`

The note labelled this an inference: *"the handler's `widget_host->Focus()` is the first time the
headless page gets focus — mechanism inference: the Focus() call is sourced, the deferral of focus
events until the page is focused is not."* The deferral is now sourced.

**(a) The script `focus()` sets the focused element but dispatches no focus event.**
`Document::SetFocusedElement` sets `focused_element_` unconditionally (`document.cc:6047`) but gates
the *events* on page focus:
- `document.cc:6086-6092` — the comment and the gate:
  "Dispatch the focus event and let the node do any other focus related activities (important for text fields)"
  / "If page lost focus, event will be dispatched on page focus, don't duplicate"
  / "if (GetPage() && (GetPage()->GetFocusController().IsFocused())) {"
  and only then `focused_element_->DispatchFocusEvent(...)` (6091) and
  `DispatchFocusInEvent(kFocusin, ...)` (6102).

Measured cross-check: the receipt's `focus-f` leg records **no** events at all
(`[e for e in events if e['leg']=='focus-f']` → `[]`) while `stateAfter.active` is already `f` — the
focused element was set, the event was suppressed.

**(b) The first IME command gives the page focus, and the pending focus/focusin then fire.**
- `input_handler.cc:1300` (InsertText) and `input_handler.cc:1353` (ImeSetComposition) — "widget_host->Focus();"
- `content/browser/renderer_host/render_widget_host_impl.cc:1430-1440` — `RenderWidgetHostImpl::Focus()`
  → "focused_widget->SetPageFocus(true);"
- `render_widget_host_impl.cc:1506-1514` — the focus state is sent to the renderer:
  "GetWidgetInputHandler()->SetFocus(focus_state);"
- Renderer side: `third_party/blink/renderer/core/frame/web_frame_widget_impl.cc:1933-1942` —
  `WebFrameWidgetImpl::FocusChanged` → "View()->SetPageFocus(focus_state == mojom::blink::FocusState::kFocused);"
- `third_party/blink/renderer/core/exported/web_view_impl.cc:2031-2032` — `WebViewImpl::SetPageFocus`
  → "page_->GetFocusController().SetFocused(enable);"
- `third_party/blink/renderer/core/page/focus_controller.cc:1978-1992` — `FocusController::SetFocused`
  → `FocusHasChanged()`.
- `focus_controller.cc:1953-1976` — `FocusHasChanged` → "DispatchEventsOnWindowAndFocusedElement(focused_local_frame->GetDocument(), focused);"
- `focus_controller.cc:1138-1175` — `DispatchEventsOnWindowAndFocusedElement`; the focused branch at
  1166-1173 dispatches the pending event on the element that is *already* the focused element:
  "focused_element->SetFocused(true, mojom::blink::FocusType::kPage);" and
  `DispatchFocusEvent(*document, *focused_element)` → `focus_controller.cc:1124-1136`:
  "focused_element.DispatchFocusEvent(nullptr, mojom::blink::FocusType::kPage);" and
  "focused_element.DispatchFocusInEvent(event_type_names::kFocusin, nullptr,".

Measured cross-check: receipt seq 1 is `focusin` target `f` in the `compose-a` leg (the first IME
leg), with `focus-f` (the script leg) recording nothing — exactly this deferral.

This also explains the note's `focusout` leg pair: `blur` fires `focusout` on `ce`
(receipt seq 37) because the page is focused by then, and `focus-ce` fires `focusout` on `f` +
`focusin` on `ce` (seq 26–27) for the same reason.

## 4. Anchor accuracy: no anchor is off

75 mechanical checks, 0 misses (`anchors.txt`): 51 against the `corpus/SOURCES.md` rows S187–S193,
24 against the note. Each check searches the cited line range for the quoted text verbatim.

- Part A — `SOURCES.md` rows S187–S193: 51 OK, 0 MISS.
- Part B — note `corpus/knowledge/chromium-ime-composition-runtime-round-74.md`: 24 OK, 0 MISS.
- Part C — the S187 declaration claim: `grep 'imeCommitComposition\|imeSetComposition\|command ime'`
  over `Input.pdl` returns line 149 (a comment), 150 (a comment) and 151
  (`experimental command imeSetComposition`). The PDL declares **no** `imeCommitComposition` command
  at this tag, exactly as the row claims.

Two points I checked and found **correct** (recorded here so the L1 does not re-open them):

- The note's "(S192 `scoped_event_queue.cc:76-79`)" — the quoted call
  `EventDispatcher::DispatchEvent(*node, event);` is at `scoped_event_queue.cc:78`, inside the cited
  76–79 range. The `SOURCES.md` row cites the wider `75-79` (the whole function). Both ranges
  contain the quote; neither is off.
- The note's "S189 `input_method_controller.cc` ... `InsertText` (lines 924–932) passes
  `GetDocument().FocusedElement()` to `DispatchBeforeInputInsertText`" — verified at
  `input_method_controller.cc:925`.

One correction to my own first pass, recorded for traceability: my initial check reported two
"misses" for `input_handler.cc:1290-1295` and `:1327-1332`. The statement
`GetFocusedRenderWidgetHost(widget_host);` is split across two lines (1291–1292 and 1328–1329); my
check sliced the wrong span. The anchors are correct. Part D of `anchors.txt` shows the corrected
spans.

## 5. Remaining gaps (not closable from this session)

1. **`-32602` mapping.** `input_handler.cc:1344-1345` shows `Response::InvalidParams("Either both
   replacement start/end are specified or neither.")`. The `InvalidParams` → `-32602` constant lives
   in the DevTools protocol response helper; I could not fetch it — `content/browser/devtools/protocol/protocol.h`,
   `.../response.h`, `.../response.cc` and `third_party/devtools/shared/devtools_protocol.h` all
   return HTTP 404 at this tag (the tag's `content/browser/devtools/protocol/` listing has no
   `protocol.h`/`response.*`). The code value `-32602` is independently confirmed by the receipt
   (`replace-half` `cdpError` = `{"code":-32602,"message":"Either both replacement start/end are specified or neither."}`),
   so the round's claim stands on measurement plus the source line; only the constant's own
   definition file is unlocated. Low value: the constant is a JSON-RPC/DP standard.
2. **Renderer-side mojo handler for `WidgetInputHandler::SetFocus`.** The browser→renderer hop is
   pinned above (`render_widget_host_impl.cc:1514` sends `SetFocus(focus_state)`;
   `web_frame_widget_impl.cc:1933` receives the resulting `FocusChanged`). The intermediate
   renderer-side receiver file was not located: `content/renderer/render_widget_impl.cc` and
   `content/renderer/render_widget_host_impl.cc` are 404 at this tag (the tag's
   `content/renderer/` listing contains only `render_widget_browsertest.cc` for widget files — the
   renderer widget code has moved under `third_party/blink/renderer/platform/widget/`, whose paths
   I could not enumerate). The hop is therefore pinned at both ends but not through the middle; this
   does not affect either mechanism's conclusion, because the mechanism turns on the Blink-side
   `FocusController::SetFocused` → `DispatchEventsOnWindowAndFocusedElement` step, which is sourced.

## 6. Files written by this seat

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/w1/R74Scout/`:

- `report.md` (this file)
- `fetch-log.txt` — full fetch log (access times, HTTP status, sha256, line counts, staged-vs-fetched `cmp`)
- `fetch-receipt.json` — the same as machine-readable JSON
- `cmp-log.txt` — the `cmp` transcript
- `anchors.txt` — every anchor check, with file:line and the quoted text

Scratch `/fast/scratch/hyaku/tabi-r74/R74Scout/` was removed after the receipts above were copied.
No lane, production, fleet or sibling file was modified; no git/jj mutation was performed.

## 7. Suggested next step for the L1 (integration owner)

One optional note edit, supported by §3 — no anchor is off, so no citation needs correcting:

Upgrade the note's mechanism claims from "measured, not sourced" (Limits) and "mechanism inference"
(the `focusin` sentence) to the sourced chains in §3.1 and §3.2. Doing so requires **new**
`SOURCES.md` rows for the files those chains traverse, because none of them is S187–S193:

`third_party/blink/renderer/core/editing/editor.cc`,
`third_party/blink/renderer/core/input/event_handler.cc`,
`third_party/blink/renderer/core/editing/frame_selection.cc`,
`third_party/blink/renderer/core/page/focus_controller.cc`,
`third_party/blink/renderer/core/dom/tree_scope.cc`,
`third_party/blink/renderer/core/dom/node.cc`,
`third_party/blink/renderer/core/dom/document.cc`,
`third_party/blink/renderer/core/dom/element.cc`,
`third_party/blink/renderer/core/editing/set_selection_options.h`,
`third_party/blink/renderer/core/frame/web_frame_widget_impl.cc`,
`third_party/blink/renderer/core/exported/web_view_impl.cc`,
`content/browser/renderer_host/render_widget_host_impl.cc`.

Their sha256 values are already recorded in `fetch-receipt.json` (`extra_files`), so the L1 need not
re-fetch them; the digests are from this session's own fetch at tag 155.0.8059.84.

This is optional. It strengthens the note's provenance but changes no measured shape, no counter
check, no battery case and no kill rule. **My recommendation is to leave the round's claim set
exactly as it is** — the round is coherent and admitted on its own terms — and to treat these rows as
a follow-up if a later round wants to source the mechanisms rather than measure them.

## 8. Note on scope

This seat was asked to (a) independently re-fetch and compare S187–S193, (b) verify every anchor
those rows and the note cite, and (c) locate the source for the two mechanisms the note marks as
measured-not-sourced. I did not evaluate the counter, the battery, the kill-power control, the
predicate, the claims file, or the note's prose quality; those are other seats'. I did not propose
or make any change to the predicate, the counter, the pins or the kill rule, and I edited no lane,
production, fleet or sibling file.
