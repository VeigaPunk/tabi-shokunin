source: S216-S219 (S216, S217, S218 opened with the r79 wave; S219 new this round) — corpus/SOURCES.md
verified-at: 2026-11-07 (round 79, Chromium 155.0.8059.84 Arch Linux `/usr/bin/chromium`, `--headless=new`; driver `scripts/chrome-cdp-showpicker-round79.mjs` pinned `e9c87159…4933`, counter `scripts/check-showpicker-r79.mjs` pinned `4072031b…e7815`)
recheck: `node scripts/check-showpicker-r79.mjs --lane <ABS lane> --receipt corpus/evidence/round79/chromium-showpicker/receipt.json --expect-driver-sha256 e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933 --expect-nonce tabi-r79-l1-80830674d421 --expect-fixture-sha256 2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8 --prior-set .ufo/waves/round-79/controls/c1/prior-set.txt --json` (exit 0, 56 checks); sources re-open on release of a new Chromium tag.

# `HTMLInputElement.showPicker()` under interception — the trigger law (round 79)

`HTMLInputElement.showPicker()` is the programmatic entry into the picker a click opens. Under
`Page.setInterceptFileChooserDialog` that picker is replaced by the `Page.fileChooserOpened` event, so
the call and its answer are separately observable. This note holds the **trigger** law — which call
opens a picker, what it throws when it does not, and what it costs in transient activation. The
**answer** law (`DOM.setFileInputFiles`, cancel, mode) is
`chromium-file-chooser-runtime-round-78.md`; the two capabilities compose but are measured apart.

The fixture is the r78 driver's template plus a neutral `#pad` div (the click target that grants the
activation) and a disabled `<input type=file id=dis>` (`receipt.fixture.patch`; the six element
descriptors the page measured are `receipt.fixtureInputs`). The driver runs **one fresh browser per
leg** — 10 legs, 10 distinct `legs[*].launchToken`s, each with its own `--user-data-dir=profile-<token>`
in `legs[*].argv` and its own `legs[*].teardown` (0 survivors, both port probes `closed`, both
post-kill curls 7). That is not decoration: `navigator.userActivation.hasBeenActive` is per-window
state, and a shared browser would leak an earlier leg's activation into a later "no activation" leg.

## The law, as measured

| # | Statement | Receipt field that carries it |
|---|---|---|
| 1 | Without transient activation `showPicker()` throws `NotAllowedError` with `Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.` and opens nothing. The refusal is byte-identical with interception on and off, so the gesture check precedes the dialog | `legs[sp-nogesture-intercept-on].showPicker` and `legs[sp-nogesture-intercept-off].showPicker` (same `name`/`message`); both `cdpEventLog` hold only `Page.frameNavigated`; both `pageEvents` are `[]`; both `activationBefore`/`activationAfter` are `{isActive:false,hasBeenActive:false}` |
| 2 | One activation buys exactly one picker. After a successful call the second call in the same leg throws the same `NotAllowedError`, and `isActive` goes `true -> false` | `legs[sp-show-twice].showPicker.ok === true`; `.showPicker2` = the `NotAllowedError` above; `.activationBefore {isActive:true,hasBeenActive:true}` → `.activationAfter {isActive:false,hasBeenActive:true}`; exactly one `Page.fileChooserOpened` in `.cdpEventLog` |
| 3 | `Runtime.evaluate` with `userGesture: true` satisfies the requirement with no page click: the call succeeds, `isActive` stays `false`, `hasBeenActive` becomes `true` | `legs[sp-cdp-gesture].showPicker.ok === true`; `.activationBefore {isActive:false,hasBeenActive:false}` → `.activationAfter {isActive:false,hasBeenActive:true}`; `.pageEvents` is `[]` (no input event at all) |
| 4 | A disabled input throws `InvalidStateError` with `HTMLInputElement::showPicker() cannot be used on immutable controls.`, opens nothing, and does **not** consume the activation | `legs[sp-disabled].showPicker`; `.activationBefore` equals `.activationAfter` (`{isActive:true,hasBeenActive:true}`); `.cdpEventLog` holds no chooser event |
| 5 | With interception on the chooser event fires with `mode` derived from the page-measured input (`selectSingle`; `selectMultiple` when the input's `multiple` is true), and its `frameId` is the leg's own `Page.getFrameTree` main frame | `legs[sp-click-then-show].cdpEventLog[].params.mode === 'selectSingle'`; `legs[sp-multiple-show]… === 'selectMultiple'`; both `.frameTree.mainFrameId`; the counter's `mode-law` derives the expectation from `fixtureInputs[].multiple` |
| 6 | With interception off the call still succeeds, **no** CDP event fires, and headless auto-cancels the native dialog: the page receives one `cancel` on the input and the file list stays empty | `legs[sp-intercept-off-click-then-show].pageEvents` (five pad pointer events, then `cancel@s`); `.cdpEventLog` holds only `Page.frameNavigated`; `.stateAfter` all-empty |
| 7 | An armed `{enabled:true, cancel:true}` interception fires the chooser event **and** the page `cancel`; a post-hoc `{cancel:true}` after the event is accepted (`{}`), fires nothing, and arms the next chooser | `legs[sp-cancel-armed].pageEvents` (`cancel@s`) with a chooser event in `.cdpEventLog`; `legs[sp-click-then-show].dismissResult === {}` with no `cancel` in `.pageEvents` (counter `dismiss-law`) |
| 8 | `showPicker()` never selects files and fires no pointer/input/change event: every leg's `stateAfter` is empty and the only page events are the leg's own pad click (leg `prior-click`) and, where applicable, one `cancel` (leg `show-picker`) | `legs[*].stateAfter`; `legs[*].pageEvents[].leg`/`.type`; the counter's `no-selection-law`, `trust-law` and the per-leg `leg-sp-*` sequence pins |
| 9 | The browser-assigned `backendNodeId` is not a function of the element across trigger paths: under `showPicker()` the single input `#s` reports **3** and the multiple input `#m` also reports **3**, while a real click on the same `#s` reports **5**. The id is reported, never required to be a literal | `legs[sp-click-then-show].cdpEventLog[].params.backendNodeId` = 3, `legs[sp-multiple-show]…` = 3, `legs[sp-click-control]…` = 5; the counter's `nodeReport` records `{sp-click-then-show:[3], sp-multiple-show:[3], sp-click-control:[5]}` and `node-binding-law` requires only a positive integer |

Law 9 sharpens the r78 finding rather than repeating it. Round 78 measured the id drifting *between*
runs of the same trigger (`#s` 5 in 24 of 25 runs). Here the same pinned driver, in one generation,
reports **two different ids for the same element under two trigger paths** and **the same id for two
different elements** under one path. A literal pin would therefore be wrong in both directions, and
the page element is proved by `fixtureInputs` plus `mode-law`, never by the id (QUALITY 150).

## What the source says

The order and the messages are the implementation's, not an inference from the receipt.
`HTMLInputElement::showPicker` checks the cross-origin rule (file and color exempt), then
`!isMutable()` → `InvalidStateError`, then `!LocalFrame::HasTransientUserActivation(frame)` →
`NotAllowedError`, then calls `LocalFrame::ConsumeTransientUserActivation(frame)` **before**
`input_type_view_->OpenPopupView()` (S218 lines 2652-2682). That single ordering fact explains laws 2
and 4: the activation is spent by the call, so a second call has nothing left, while a call that
refuses at the mutability check never reaches the consume.

The spec states the same order (S216: mutability, then cross-origin, then transient activation) and
its "show the picker" sub-algorithm repeats the guards and then says "Consume user activation given
element's relevant global object" before showing — the normative form of the same consumption. The
spec also has a fourth refusal this round does not measure: a select element that is not being
rendered throws `NotSupportedError`. MDN names the three exception classes and states the picker
requires transient activation from "a touch gesture or mouse click" (S217).

Law 3's switch is the protocol's own: `Runtime.evaluate` carries `userGesture`, documented as
"Whether execution should be treated as initiated by user in the UI." (S219). The wording matters —
it is *treated as* initiated by the user, which is exactly what the receipt shows: the activation
check is satisfied and `hasBeenActive` flips, but `isActive` never becomes true, so the state is not
the state a real click grants.

## Limits — what a receipt of this shape cannot prove

- **The picker UI itself.** Headless has no visible dialog; the receipt proves the call's outcome and
  the interception event, not what a user would see. The `cancel` in law 6 is the headless
  auto-cancel, not a user's dismissal.
- **The activation source.** The receipt shows `isActive`/`hasBeenActive` transitions, not *which*
  input granted the activation. The pad click is the only input event in those legs and the page-event
  log is the witness, but a page that granted activation some other way would look the same.
- **The `backendNodeId`.** Browser-assigned and trigger-path-dependent (law 9); a consistent relabel
  inside one leg is inside the limit by design (QUALITY 150).
- **Cross-origin `SecurityError`.** Not measured: the fixture is same-origin loopback and no
  cross-origin iframe fixture is built. S216 and S218 state the rule; a source is not a measurement.
- **The replay rule's strength.** The scored receipt has 37 page events and 2 gaps ≥ 50 ms; each of the
  four priors has 37 events and **1** such gap. The counter refuses at `absMatched >= 19` or
  `gapMatched >= 1` (`limit.perPrior[]`: `absNeed 19`, `gapNeed 1`), so a forger who moves 19 events
  **and the single gap** escapes the replay rule (`escapeEvents 19`, `escapeGaps 1`). The gap side is
  effectively one-shot; the event side still costs half the log. A receipt outside the two walked
  trees (`.ufo/waves/round-79`, `corpus/evidence/round79`) and outside `--prior` is outside the walk.
- **`HTMLSelectElement.showPicker()`** and the `NotSupportedError` step are out of scope this round.

## Frontier (named, not held)

- `showPicker()` on a `webkitdirectory` input and on an `accept`-constrained input (R79Exec3 probe).
- The `SecurityError` path in a cross-origin iframe.
- Whether the gesture check precedes the mutability check when both fail: the source says mutability
  first (S218) and the spec agrees (S216), but the measured disabled leg carries a live activation, so
  the receipt does not separate the two. Prediction: a disabled input with no activation throws
  `InvalidStateError`.
- A picker answered after `showPicker()`: the trigger is this capability, the answer is r78's; the
  combination (`showPicker()` then `DOM.setFileInputFiles` on the opened node) is not measured here.
- Whether a `userGesture` evaluation and a real click differ anywhere besides `isActive` (e.g. in
  `navigator.userActivation` consumers or in user-activation-gated APIs other than the picker).

Evidence: `corpus/evidence/round79/chromium-showpicker/receipt.json` (scored run, nonce
`tabi-r79-l1-80830674d421`, 10 legs, fixture sha256 `2e80efa0…c5c8`),
`.ufo/waves/round-79/controls/c1/probes/{probe1,probe2,smoke1,smoke2}.json` (the four pre-freeze
priors), `.ufo/waves/round-79/scored/c1-counter-a.json` (56 checks, clean),
`.ufo/waves/round-79/scored/c1-negatives-a.json` (battery 90/90, coverage 56/56 declared).
