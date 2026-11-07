# `HTMLInputElement.showPicker()` under interception — generation r80 runtime law on Chromium 155/Linux headless

source: S216 (WHATWG HTML, the `showPicker()` steps), S218 (Chromium 155.0.8059.84 `html_input_element.cc`, `HTMLInputElement::showPicker`), S212 (Chromium 155.0.8059.84 `Page.pdl`), S208 (Chromium 155.0.8059.84 `DOM.pdl`) — all four re-opened this round, byte-identical to the r77/r79 fetches; measured receipts `corpus/evidence/round80/chromium-showpicker/receipt.json` and the three pre-freeze probes under `.ufo/waves/round-80/controls/c1/probes/`.
verified-at: 2026-11-07 (round 80; driver `scripts/chrome-cdp-showpicker-round80.mjs`, counter `scripts/check-showpicker-r80.mjs`, 7 legs, 57 checks)
recheck: `node scripts/chrome-cdp-showpicker-round80.mjs --lane <ABS lane> --nonce <tabi-r80-...> --scratch <ABS> --out <ABS>.json --http-port <p> --cdp-port <q> --child-port <r>` then `node scripts/check-showpicker-r80.mjs --lane <ABS lane> --receipt <ABS>.json --expect-driver-sha256 cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc --expect-nonce <nonce> --expect-fixture-sha256 <that receipt's fixture sha256> --prior-set .ufo/waves/round-80/controls/c1/prior-set.txt --json` (exit 0 clean, 57 checks).

## What the surface is

`HTMLInputElement.showPicker()` is the programmatic entry into the same picker a click opens. Under
`Page.setInterceptFileChooserDialog` the native dialog is replaced by the `Page.fileChooserOpened`
event (S212 lines 1279-1288), so the call and its answer are separately observable: the call is the
page-side return value, the answer is a CDP command on the event's `backendNodeId`. This note holds
the *trigger* law at generation r80 and the one combination — trigger then answer. The answer law
alone (`DOM.setFileInputFiles`, cancel, mode) stays `chromium-file-chooser-runtime-round-78.md`; the
r79 note's eight laws remain true and are not repeated here.

The driver runs one fresh browser per leg (7 legs, `receipt.legs[]`), because
`navigator.userActivation.hasBeenActive` is per-window state and a shared browser would leak an
earlier leg's activation into a later "no activation" leg; every leg carries its own `launchToken`,
`argv`, `devtoolsListening` and teardown proof. The page fixture is the r78 driver's
`/*CHOOSER-FIXTURE-BEGIN*/` template, extracted byte-identical at runtime and patched with exactly
three additions, each asserted present: a neutral `<div id="pad">` (no default action) that a real
CDP click can activate, a disabled `<input type=file id="dis">`, and a cross-origin
`<iframe id="xo">` whose parent is `http://127.0.0.1:<http>` and whose child is
`http://127.0.0.1:<child>` — a different port is a different origin, so the child is cross-origin
without needing a second host.

## The law, as measured

| # | Statement | Receipt field that carries it |
|---|---|---|
| 1 | A `webkitdirectory` input and an `accept=".png"` input both open a `selectSingle` chooser. The CDP mode enum has no directory- or accept-specific value, so the mode is the page-measured input's (`multiple` → `selectMultiple`, else `selectSingle`) | `fixtureInputs[id=d].webkitdirectory` true, `fixtureInputs[id=k].accept` ".png", `legs[sp80-webkitdirectory].cdpEventLog[].params.mode`, `legs[sp80-accept-png].cdpEventLog[].params.mode` |
| 2 | Two calls each carrying `Runtime.evaluate {userGesture:true}` BOTH succeed and open TWO pickers: there is no "already open" guard on the programmatic path | `legs[sp80-twice-gesture].showPicker`, `.showPicker2` (both `{ok:true, ret:"undefined"}`), `.cdpEventLog` two `Page.fileChooserOpened` bound to `triggerSendId` and `trigger2SendId`, `.activationBefore` `{false,false}` → `.activationAfter` `{false,true}` |
| 3 | A call deferred through `setTimeout(…, 0)` scheduled from a trusted click's handler succeeds while the activation is live, and its chooser opens during the click — before any direct trigger is sent | `legs[sp80-deferred-timer].cdpSendLog` (the arm `Runtime.evaluate` precedes the `Input.dispatchMouseEvent` pair — the `plan-calls` sequence), `.deferredResult` `{ok:true, ret:"undefined"}`, `.cdpEventLog` one event with `afterSendId ∈ [priorReleaseId, triggerSendId]`, `.activationBefore/.activationAfter` `{false,true}`/`{false,true}` |
| 4 | In that same leg the mandatory direct trigger, aimed at the disabled `#dis`, throws `InvalidStateError` with the immutable-controls message and opens nothing: a deferred success and a direct refusal coexist inside one activation window | `legs[sp80-deferred-timer].showPicker` (`name`/`message`), `.cdpEventLog` count 1 (the deferred chooser only) |
| 5 | A cross-origin child's own script opens its own input's picker with no `SecurityError`, while the parent cannot reach the child document: `contentDocument` is `null` and `contentWindow.document` throws `SecurityError` | `legs[sp80-cross-origin].childResult` `{ok:true}`, `.childEvents` (5, all `isTrusted`, all `act:true`, targets `go`), `.childActivationBefore` `{false,false}` → `.childActivationAfter` `{false,true}`, `.childLate` 0, `.cdpEventLog[0].params.frameId` = the child context's `frameId`, `.parentCrossAccess` `{contentDocument:null, windowDocument:"SecurityError"}` |
| 6 | A disabled input in the cross-origin frame throws `InvalidStateError`, opens nothing, and does NOT consume the activation | `legs[sp80-cross-origin-disabled].childResult` (`InvalidStateError`), `.cdpEventLog` 0 events, `.childActivationBefore` `{false,false}` → `.childActivationAfter` `{true,true}` |
| 7 | The programmatic trigger ANSWERED: `DOM.setFileInputFiles` on the event's `backendNodeId` delivers the exact bytes and fires trusted `input` + `change` on the input | `legs[sp80-trigger-then-answer].answer` (`files`, `setParams{files, backendNodeId}`, `setSendId`, `setResult {}`, `setError null`), `.upload` `{name, size, sha256}`, `.pageEvents` `input@s`, `change@s`, `read@s`, `.stateAfterDismiss.s`, `.stateAfter.sValue`, `nodeReport[sp80-trigger-then-answer][0]` |
| 8 | `showPicker()` itself never selects files and fires no pointer/input/change event; a post-hoc `{cancel:true}` is accepted and fires no page `cancel` (the flag arms the NEXT chooser) | every `legs[*].stateAfter` (empty `s,m,d,k,dis`, `sValue ""`), `legs[*].pageEvents`, `legs[*].dismissSendId/.dismissResult/.dismissError`, zero `cancel` events in the whole receipt |

The source order is S218 lines 2657-2663 (cross-origin, file and color exempt) → 2666-2671
(`!isMutable()` → `InvalidStateError`) → 2673-2677 (no transient activation → `NotAllowedError`) →
2679 (`ConsumeTransientUserActivation`) → 2681 (`OpenPopupView`). The spec's order is mutability
(5830-5831) → cross-origin (5832-5836) → gesture (5841). The two disagree on the first two steps —
the r79 note's correction, still standing. The r80 measurement does not settle that disagreement: a
*file* input is exempt from the origin check (S216's note at 5838-5840, S218's `!= kInputFile &&
!= kInputColor` at 2657-2658), so the disabled child input reaches the mutability check under either
order. Discriminating the two orders needs a disabled, non-file, non-color input inside the
cross-origin frame: spec → `InvalidStateError`, Chromium → `SecurityError`. That is the frontier
below, not a measurement.

Consistency with the r79 laws, stated because the two generations can look contradictory: r79's law 2
("one activation buys exactly one picker") and r80's law 2 ("two calls both succeed") are the same
rule seen from two sides. The r79 leg spent one real click's activation on the first call, so the
second call had none left and threw; the r80 leg attaches `userGesture: true` to *each* evaluation, so
each call gets its own synthetic activation and neither is "a second call on one activation". The
r80 leg's activation transition agrees with r79's law 3: `isActive` stays `false` before and after
while `hasBeenActive` turns `true` — a `userGesture` evaluation is not the same state a real click
grants. What r80 adds is that the browser holds no *picker-level* guard: two pickers can be open at
once, which the r79 fixture never asked.

## Limits — what a receipt of this shape cannot prove

- **The picker UI itself.** Headless has no visible dialog. The receipt proves the call's outcome and
  the interception event, not what a user would see, and not whether a headed build behaves the same.
- **The `SecurityError` refusal is not measured.** The fixture's child holds only file inputs, which
  the source exempts from the origin check; the parent cannot reach the child document, so no parent
  script can call the child's input either. The branch is reachable only from script *inside* the
  cross-origin frame calling `showPicker()` on a non-file, non-color input, and the child has no such
  input. Read precisely: the r80 law is "the file-input exemption holds and the parent is blocked by
  same-origin policy". The r79 note's sentence "page script cannot construct the spec's SecurityError
  case" is true for the file-input case and for the parent, and is **not** a general impossibility
  claim; the refusal itself has never been observed.
- **The activation source.** The receipt shows `isActive`/`hasBeenActive` transitions, not *which*
  input granted the activation; the `#pad` click is the only input event in those legs and the
  page-event log is the witness, but the log is page-side and the driver writes the fixture.
- **The `backendNodeId`.** Browser-assigned and unstable across runs (QUALITY 150); a consistent
  relabel inside one leg is inside the limit by design. The counter reports the id
  (`nodeReport`) and binds the page-measured descriptor and the mode, never a literal.
- **The answered bytes.** The receipt proves the driver's own 22-byte file was delivered and read
  back (`upload.sha256` = the file the driver wrote). It does not prove a native picker would have
  delivered the same bytes for the same user action.
- **The deferred boundary is bracketed at 0 ms only.** The leg proves a call scheduled in the same
  task chain as the click succeeds; it says nothing about 50 ms, 1 s, or the moment the activation
  lapses. "While the activation is live" is the measured sentence, not "deferred calls are safe".
- **The replay/forgery limit (the counter's own `limit` block).** This counter reads a receipt. A
  forger who rewrites the identity fields and moves at least `absNeed` = ceil(0.5 × the prior's own
  event count) page-event times AND `gapNeed` = ceil(0.75 × the prior's own ≥ 50 ms gaps) gaps
  escapes the replay rule; the escape minimum is printed per prior (at the scored run: 23 own events,
  so `absNeed` 12 and an escape minimum of 12 events; the gap count is timing-dependent — 1 at that
  run, `gapNeed` 1, escape minimum 1 gap). A receipt outside the two walked
  trees (`.ufo/waves/round-80`, `corpus/evidence/round80`) and outside `--prior` is outside the walk.
  **The laws and the receipt's admissibility are separate verdicts**: a receipt can satisfy every
  `leg-*`, `*-law` and binding check and still be refused by `replay-event-timeline` because its own
  page-event timeline resembles a committed prior's. When that happens the receipt is evidence of the
  laws and still not an admissible scored receipt — read the counter's `checks` map, not only its
  `verdict`.
- **The sibling declarative path.** The same source file holds `HTMLInputElement::HandleCommandInternal`
  (S218 lines 2704-2749), the `command="show-picker"` path, which checks mutability FIRST, then the
  origin, then the gesture, and **returns** with a console warning instead of throwing. That is a
  source reading, not a measurement, and it is a different order from `showPicker()` in the same
  file — do not generalise either order across the two entry points.

## Frontier (named, not held)

- The `SecurityError` refusal itself: a cross-origin child holding a disabled non-file, non-color
  input, calling `showPicker()` — the one leg that would discriminate the spec's order from
  Chromium's.
- `HTMLSelectElement.showPicker()` — the spec covers both entry points in one algorithm (S216
  line 5827); nothing here measures the select branch (`NotSupportedError` when not rendered).
- The deferred boundary at delays longer than one task: `setTimeout(…, 50)`, `…, 1000`, and the
  expiry edge.
- The declarative `command="show-picker"` path (source order mutability → origin → gesture, console
  warning, no exception).
- Whether the "no already-open guard" holds across windows or legs (measured only as two calls in
  one leg).
- A headed build's picker UI under the same interception.
