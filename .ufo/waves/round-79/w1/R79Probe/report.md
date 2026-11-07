# R79Probe — H: does `showPicker()` check the gesture requirement before the mutability/mode checks?

**Verdict: H REFUTED.** Observed check order on Chromium 155.0.8059.84 `--headless=new` (/usr/bin/chromium, CDP over raw WebSocket, `Page.setInterceptFileChooserDialog {enabled:true}` armed in both legs, no prior click, no `userGesture`):

1. **mutability/immutable check first** — a disabled `<input type=file>` with zero activation throws `InvalidStateError` ("cannot be used on immutable controls"), **not** the NotAllowedError H predicted;
2. **transient-activation check second** — the same call on a mutable input in the identical page/context throws `NotAllowedError` ("requires a user gesture").

The `multiple` leg cannot discriminate "gesture vs mode": a `multiple` file input is mutable and pickerable, so no mode error exists for it; its no-activation failure is necessarily the gesture error. That outcome is consistent with H's leg-2 prediction but carries no ordering information.

## Legs (one fresh browser per leg, nonce `tabi-r79-probe-order-w1`)

### Leg 1 — `probe-dis-nogesture`: `#dis` (disabled), no click, no userGesture
`activationBefore = {isActive:false, hasBeenActive:false}` (fresh browser; premise holds). Exact `showPicker` object (page-side catch, returned by value via `Runtime.evaluate`):

```json
{"ok":false,"name":"InvalidStateError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls.","code":11,"ctor":"[object DOMException]","stackHead":"InvalidStateError: Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls."}
```

`Page.fileChooserOpened` count: **0**. Page events: none. `activationAfter` unchanged. Same-page cross-check on `#s` (mutable, still no activation): `NotAllowedError` "requires a user gesture", 0 choosers — the gesture check is reachable in this exact context only after the mutability check passes.

### Leg 2 — `probe-multiple-nogesture`: `#m` (`multiple:true` confirmed via fixture `__inputs()`), no click, no userGesture
`activationBefore = {isActive:false, hasBeenActive:false}`. Exact `showPicker` object:

```json
{"ok":false,"name":"NotAllowedError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.","code":0,"ctor":"[object DOMException]","stackHead":"NotAllowedError: Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."}
```

`Page.fileChooserOpened` count: **0**. Cross-check on `#dis` in this fresh browser independently reproduces leg 1: `InvalidStateError` code 11.

Both legs: teardown clean (0 survivors, both ports closed, post-kill curl 7); driver exit 0, `failures: []`. Failed calls consumed nothing (`isActive`/`hasBeenActive` stayed false throughout).

## Why this matters for the frozen law set
The frozen measured law "a disabled input throws InvalidStateError … and does NOT consume the activation" was measured **with** activation; this probe shows the InvalidStateError is produced even **without** activation — i.e. the immutable check strictly precedes the gesture check, matching the WHATWG `showPicker()` step order. No conflict with the frozen predicate: the counter's law set is not contradicted anywhere (the frozen `sp-disabled` leg has a prior click and still gets InvalidStateError; this probe only adds the no-click case H asked about). The gesture law ("requires a user gesture" NotAllowedError, nothing opens) is unaffected.

## Files (all in the seat dir; lane scripts untouched — driver+fixture copied byte-identical via `cp`, then only the copies edited)
- `.ufo/waves/round-79-seats/R79Probe/probe.json` — raw receipt (schema `tabi-r79probe-showpicker-order`, 2 legs, exact objects above, cdpSendLog/cdpEventLog, argv, frame tree, teardown proofs)
- `.ufo/waves/round-79-seats/R79Probe/probe-showpicker-order-r79.mjs` — probe driver (frozen `chrome-cdp-showpicker-round79.mjs` plumbing; LEGS swapped to the two probe legs; wrapper extended with `code`/`ctor`/`stackHead`; same-page cross-check block added)
- `.ufo/waves/round-79-seats/R79Probe/chrome-cdp-filechooser-round78.mjs` — fixture source copy (sha256 `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`, the lane r78 file)
- Scratch `/fast/scratch/hyaku/tabi-r79/R79Probe/` deleted after the run (receipt lives in the seat dir).
