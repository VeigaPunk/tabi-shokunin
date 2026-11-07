# R79Exec3 — frontier probe: showPicker on webkitdirectory / accept, the double-call and setTimeout(0) boundaries

Round 79 w1, seat R79Exec3. Frontier evidence for r80 planning. **Not capability legs** — none of this is a claim against C1-SHOWPICKER-R79; the frozen predicate, counter, pins, priors and kill rule were not touched and are not proposed to be amended. Raw per-leg JSON: `.ufo/waves/round-79-seats/R79Exec3/probe.json` (run 1, nonce `tabi-r79-exec3-probe-w1`) and `.ufo/waves/round-79-seats/R79Exec3/probe-run2.json` (run 2, nonce `tabi-r79-exec3-probe-w2`, fully clean reproduction). All field paths below are `legs[i].…` inside those files.

## Probe provenance

- The probe driver is a copy of the frozen C1 driver (`scripts/chrome-cdp-showpicker-round79.mjs`, sha256 `e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933`) at `.ufo/waves/round-79-seats/R79Exec3/probe-showpicker-r79.mjs`. `diff -u` against the frozen driver shows exactly:
  1. the leg list replaced with 5 probe legs (below);
  2. one added hook: an optional `armExpr` leg field evaluated once via `Runtime.evaluate` after intercept setup and before the prior click, plus its three receipt fields (`armSendId/armResult/armError`);
  3. one added flag: `gesture2`, which adds `userGesture: true` to the second evaluate of a `showpicker-twice` leg (the frozen plumbing always sends the second evaluate bare).
- The round-78 fixture source was copied byte-identical beside the copy (the plumbing resolves it relative to the script's own directory): `.ufo/waves/round-79-seats/R79Exec3/chrome-cdp-filechooser-round78.mjs`, sha256 `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`. The fixture template and its three frozen r79 patches are untouched; fixture bytes differ from the L1 receipt's only by the nonce substitution.
- Same substrate as the L1 run: Chromium 155.0.8059.84 `--headless=new` (/usr/bin/chromium), node v24.21.0, one fresh browser per leg with per-leg HOME/XDG/profile and teardown sweep (run 2 teardown: 0 survivors on every leg). No tools installed (nothing was missing); pacman untouched.

Legs: `probe-q1-webkitdirectory` (#d), `probe-q2-accept-png` (#k), `probe-q3a-gesture-then-plain` and `probe-q3b-gesture-both` (#s twice), `probe-q4-deferred-from-click-handler` (#s via timer, direct trigger aimed at #dis so it consumes nothing).

## Answers

**1. `showPicker()` on `#d` (webkitdirectory), trusted `#pad` click first, interception on — chooser event fires, mode `selectSingle`.**
Run 1: `legs[0].cdpEventLog[1]` = `{method: "Page.fileChooserOpened", params: {mode: "selectSingle", backendNodeId: 3}, afterSendId: 18}`; `legs[0].showPicker.ok` = true. Activation granted then consumed: `legs[0].activationBefore` (post-click) `{isActive: true, hasBeenActive: true}` → `legs[0].activationAfter` `{isActive: false, hasBeenActive: true}`. Run 2 identical (`legs[0].cdpEventLog[1]`, same mode/backendNodeId). So the CDP mode enum has no directory-specific value: a `webkitdirectory` chooser reports `selectSingle` like a plain single-file input.

**2. `showPicker()` on `#k` (`accept=".png"`), same setup — mode `selectSingle`.**
Run 1: `legs[1].cdpEventLog[1].params.mode` = `"selectSingle"` (backendNodeId 3), `legs[1].showPicker.ok` = true, same activation consume pattern. Run 2 identical. Caveat, run 1 only: this leg recorded one leg-level error, `legs[1].errors[0]` = `"drive-error: no-response-30000ms Runtime.evaluate"` — the post-dismissal `stateAfterDismiss` evaluate got no renderer response for 30 s **after** the measured data (trigger result, chooser event, both activation reads, `stateAfter`) had been captured; `legs[1].stateAfterDismiss`, `pageEvents`, `closedAt`, `lateAfterClose` are consequently null in run 1. The identical flow on #d (and the whole run 2, where `legs[1].errors` = `[]`, `stateAfterDismiss` present, `closedAt` = 3187) shows it is a one-off renderer wedge under concurrent fleet load, not a law of the capability. Watchlist item for r80: an intercepted accept-filter chooser dismissal can wedge the renderer's evaluate pipeline for ≥30 s; the browser was still torn down cleanly.

**3. Two `showPicker()` calls, each via `Runtime.evaluate {userGesture: true}`, no page click — the second does NOT throw.**
Run 1 `legs[3]` (probe-q3b-gesture-both): `legs[3].showPicker` = `{ok: true, ret: "undefined"}`, `legs[3].showPicker2` = `{ok: true, ret: "undefined"}`; two chooser events, `legs[3].cdpEventLog[1]` and `legs[3].cdpEventLog[2]`, both `{mode: "selectSingle", backendNodeId: 3}`, afterSendId 13 and 15 — the second picker opened for the same input while the first was still pending (no "already open" guard), and both were cancelled by the end-of-leg dismissal. Run 2 identical. Mechanism, from `legs[2]` (probe-q3a: call 1 with `userGesture: true`, call 2 sent bare, which is what the frozen plumbing does and why the `gesture2` flag exists): `legs[2].showPicker2` = `{ok: false, name: "NotAllowedError", message: "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."}` while `hasBeenActive` was already true at that moment (`legs[2].activationBefore` `{false, false}` → `legs[2].activationAfter` `{false, true}`). Read together: each `userGesture: true` evaluate mints a fresh transient activation for its own evaluation only; the sticky `hasBeenActive` flag does **not** satisfy the showPicker gate; a gesture-backed successful call consumes nothing that outlives its evaluate.

**4. `showPicker()` on `#s` inside `setTimeout(…, 0)` scheduled from the trusted click's handler — OK, activation still live.**
Run 1 `legs[4]` (probe-q4-deferred-from-click-handler): the `armExpr` registered a capture-phase click listener before the real CDP click on `#pad`, so the timer was scheduled by page JS running inside the trusted click's task. Inside the timer callback, immediately before the call: `legs[4].marks[3]` = `{name: "q4 act=true/true out={\"ok\":true,\"ret\":\"undefined\"}", at: 32.9}` — `isActive` true, `hasBeenActive` true, call succeeded (mark at ~12 ms after the `prior-click` mark at 20.7 ms; the chooser event `legs[4].cdpEventLog[1]`, mode `selectSingle`, backendNodeId 3, arrived at afterSendId 16, i.e. before the driver's direct trigger send). The leg's mandatory direct trigger was pointed at `#dis`: `legs[4].showPicker` = `{ok: false, name: "InvalidStateError", message: "…cannot be used on immutable controls."}` — consumes nothing (reconfirms the frozen disabled-input law inside this probe), so `legs[4].activationAfter` `{isActive: false, hasBeenActive: true}` attributes the consumption to the deferred call. Transient activation therefore survives a `setTimeout(0)` task boundary scheduled from the click's handler. Run 2 identical (`legs[4].marks[3]`, act `true/true`, out ok).

In no leg did showPicker select files or fire pointer/input/change events; `stateAfter` shows empty file lists everywhere (both runs).

## Files

- `.ufo/waves/round-79-seats/R79Exec3/probe-showpicker-r79.mjs` — probe driver copy (diff above)
- `.ufo/waves/round-79-seats/R79Exec3/chrome-cdp-filechooser-round78.mjs` — byte-identical fixture source
- `.ufo/waves/round-79-seats/R79Exec3/probe.json` — run 1 raw receipt (5 legs, nonce `tabi-r79-exec3-probe-w1`, 1 leg-level error after data captured)
- `.ufo/waves/round-79-seats/R79Exec3/probe-run2.json` — run 2 raw receipt (5 legs, nonce `tabi-r79-exec3-probe-w2`, exit 0, zero failures)

Scratch `/fast/scratch/hyaku/tabi-r79/R79Exec3/` deleted before yield; no commits, no pushes, nothing written under the walked trees except this report at the two named paths.
