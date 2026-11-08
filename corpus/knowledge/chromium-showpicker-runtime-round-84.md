---
source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S221 (CDP Page domain), S222 (CDP DOM domain), S223 (WHATWG `accept` attribute); receipt `corpus/evidence/round84/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round84.mjs`, pin in `.ufo/waves/round-84/freeze.txt`)
verified-at: 2026-11-08 (round 84, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r84.mjs --lane <ABS lane> --receipt corpus/evidence/round84/chromium-showpicker/receipt.json --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e --expect-nonce tabi-r84-l1-31fc14c29f84 --expect-fixture-sha256 da8178f1f46731ade566ce023f4e71b1cc64b4ed0b9dd92e76d73fc11cb5df18 --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --json` → exit 0, 80 checks
---

# Programmatic picker generation r84 — the tel/search/text cross-origin SecurityError

Generation r84 of the held capability `chromium-showpicker-linux` (SCORECARD). Eighteen legs, one
fresh browser per leg; the page fixture is the r83 template plus cross-origin `type=tel` (`#te`),
`type=search` (`#se`) and `type=text` (`#tx`) inputs with buttons `#go12`/`#go13`/`#go14` inside the
child frame. Every law below names the receipt field path that carries it.

## The measured laws

1. **Cross-origin `type=tel`, `type=search` and `type=text` inputs throw the SecurityError** — the
   same exact message as `type=date`/`month`/`week`/`time`/`number`/`range`
   (`"Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin
   iframe."`, `legs[12..14].childResult`), no chooser opens (`Page.fileChooserOpened` count 0 on each),
   and the parent cannot reach the child document (`parentCrossAccess.contentDocument === null`,
   `contentWindow.document` throws `SecurityError`). This closes the r83 note's named frontier: the
   non-file branch is not special-cased for any of the nine measured non-file types.
2. **The activation read is the frozen transition on each new leg too** — the child's click runs with
   `isActive: false, hasBeenActive: false` before and `isActive: true, hasBeenActive: true` after, and
   the five child events (`pointerdown`…`click` on the leg's own button) are all `isTrusted: true`
   with `act: true` (`legs[12..14].childActivation{Before,After}`, `childEvents`).
3. **The three new legs measure the same origin gate, not three separate code paths** — Chromium's
   `showPicker()` origin check precedes mutability and input-type dispatch for the non-file branch;
   the instrument cannot distinguish them beyond the input identity in the fixture descriptor, and
   this note does not claim it can (`fixtureInputs` entries `te`/`se`/`tx` carry `type` tel/search/text).
4. **The r83 laws are carried unchanged** — cross-origin `type=color` exemption, `date`/`month`/`week`/
   `time`/`number`/`range` SecurityError, the origin-before-mutability order discriminator, directory
   expansion with `webkitRelativePath`, `.txt` into `accept=".png"` (extension token) accepted,
   `multiple` → `selectMultiple`, the accept-MIME byte answer, and the second-chooser payload answer
   with its non-discriminating shared `backendNodeId`.

## What a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove WHY Chromium applies one
  origin gate to all non-file/color types (black-box discrimination, the same limit as r81–r83).
- The three new legs show no chooser opens and no selection exists; they do not show what a
  same-origin `tel`/`search`/`text` picker would open (not measured: those inputs have no picker on
  this platform).
- The `accept` token grammar (MIME vs extension vs `image/*` vs mixed lists) is still not enumerated;
  the r83 erratum records this, and r84 does not move it.

## Frontier (named, not held)

- A same-origin `type=tel`/`search`/`text` trigger (error or silent no-op) for contrast with the
  cross-origin path.
- The full `accept` token grammar against a programmatic answer.
- A second answer leg whose bytes differ between first and second answers (id + bytes double
  attribution).
