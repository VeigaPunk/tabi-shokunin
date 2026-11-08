---
source: S219 (WHATWG HTML `showPicker()` steps), S220/S218 (Chromium 155.0.8059.84 `html_input_element.cc`), S216 (the normative algorithm and exception order), S221 (CDP Page domain), S222 (CDP DOM domain); receipt `corpus/evidence/round85/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round85.mjs`, pin in `.ufo/waves/round-85/freeze.txt`)
verified-at: 2026-11-08 (round 85, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r85.mjs --lane <ABS lane> --receipt corpus/evidence/round85/chromium-showpicker/receipt.json --expect-driver-sha256 1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee --expect-nonce tabi-r85-l1-620623a43f74 --expect-fixture-sha256 0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a --prior-set .ufo/waves/round-85/controls/c1/prior-set.txt --json` → exit 0, 87 checks
---

# Programmatic picker generation r85 — the same-origin arms: the error is origin-determined

Generation r85 of the held capability `chromium-showpicker-linux` (SCORECARD). Twenty-four legs, one
fresh browser per leg. The r84 generation ended with eighteen legs and the note's own named frontier:
a same-origin `type=tel`/`search`/`text` trigger "for contrast with the cross-origin path". Six legs
close it — three without transient activation and three after a real trusted click on a neutral
`#pad` element — on parent-page inputs `#tes`/`#ses`/`#txs` (120x40 at left 100/300/500, top 750;
`fixtureInputs` ids `tes`/`ses`/`txs`).

## The measured laws

1. **Same-origin WITHOUT transient activation throws `NotAllowedError`.** All three types return
   `{ok:false, name:'NotAllowedError', message:"Failed to execute 'showPicker' on
   'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."}`
   (`legs[18..20].showPicker`); `activationBefore`/`activationAfter` are both
   `{isActive:false, hasBeenActive:false}`, and no chooser event fires.
2. **Same-origin WITH transient activation returns undefined and opens nothing.** After a trusted
   click on `#pad` (`activationBefore` `{isActive:true, hasBeenActive:true}`), `showPicker()` returns
   `{ok:true, ret:'undefined'}`, the activation is consumed (`activationAfter`
   `{isActive:false, hasBeenActive:true}`), and **zero** `Page.fileChooserOpened` events fire. That
   these types have no picker UI is an INFERENCE from the observed zero-open, not a recorded field.
   Gated by `same-origin-no-picker-law`.
3. **The error is origin-determined GIVEN activation, for these types.** Holding activation constant
   (a trusted click in the calling frame) and holding the type attribute identical, the cross-origin
   arms throw `SecurityError` ("showPicker() called from cross-origin iframe.") and the same-origin
   arms return `undefined` with no chooser. The same type attribute therefore yields three distinct
   recorded outcomes across the two variables, which is what the r84 note said the instrument could
   not do. The measurement is a 3-cell design, not 2x2: the cross-origin arm is always invoked from
   the child's own click handler, so (cross-origin, no activation) is unmeasured, and the arms are
   different ELEMENTS (`#tes` parent vs `#te` child), never one element's origin.
4. **Carried unchanged from r84** — the cross-origin `type=color` exemption, `date`/`month`/`week`/
   `time`/`number`/`range`/`tel`/`search`/`text` SecurityError, the origin-before-mutability order
   discriminator (`InvalidStateError` same-origin on a disabled `date`), the directory answer with
   `webkitRelativePath`, `accept=".png"` accepting a `.txt` (extension token), `multiple` →
   `selectMultiple`, the accept-MIME byte answer, and the second-chooser payload answer with its
   non-discriminating shared `backendNodeId`. The r85 counter re-derives all of them (87 checks).

## What a receipt of this shape cannot prove

- The parent-side and child-side inputs are different ELEMENTS in different frames: the fixture
  cannot vary origin with the same element. The claim is "same type attribute, activation held
  constant, origin varied", not "same element".
- The no-picker outcome is measured as "no chooser event and `undefined` return"; the receipt does
  not show whether Chromium reached an early return for the type or failed to find a popup view, so
  "these types have no picker" is an inference, not a measurement.
- The `accept` token grammar (MIME token vs `image/*` vs mixed lists) is still not enumerated; the
  MIME-token branch is the r84 `accept-mime-answer` byte law only.

## Frontier (named, not held)

- The `accept` grammar as a token matrix (`image/png` MIME token, `image/*`, mixed list) answered
  programmatically, one leg per token form.
- A same-element origin comparison (an input reachable from both origins, e.g. via a `postMessage`
  proxy) — not constructible in the current loopback fixture.
- What a `type=color` same-origin activated call returns (the color arm is measured cross-origin
  only in this generation).
