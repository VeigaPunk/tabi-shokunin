source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`); receipt `corpus/evidence/round82/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round82.mjs`, pin in `.ufo/waves/round-82/freeze.txt`)
verified-at: 2026-11-08 (round 82, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r82.mjs --lane <ABS lane> --receipt corpus/evidence/round82/chromium-showpicker/receipt.json --expect-driver-sha256 <pin> --expect-nonce <receipt nonce> --expect-fixture-sha256 <receipt fixture sha256> --prior-set .ufo/waves/round-82/controls/c1/prior-set.txt --json` → exit 0, 64 checks

# Programmatic picker generation r82 — the color exemption and the month/week/time SecurityError

Generation r82 of the held capability `chromium-showpicker-linux` (SCORECARD). Ten legs, one fresh
browser per leg; the page fixture is the round-81 template plus a `#pad` activation div, a disabled
`type=file` `#dis`, a disabled `type=date` `#disd`, and a cross-origin iframe whose own document
carries `type=date`, `type=color`, `type=month`, `type=week` and `type=time` inputs. Every law
below names the receipt field path that carries it.

## The measured laws

1. **A cross-origin `type=color` input is EXEMPT: the child's own script calling `showPicker()`
   returns `undefined` and opens nothing.** (`legs[2].childResult = {ok:true, ret:'undefined'}`,
   `legs[2].cdpEventLog` carries no `Page.fileChooserOpened`). This is the file/color exemption
   branch the r81 note named as unmeasured prediction: the color input behaves like a file input
   (exempt), not like `type=date`. The exemption is from the SecurityError, not an opening: there
   is no file chooser event because no file dialog is requested.
2. **Cross-origin `type=month`, `type=week` and `type=time` inputs throw the SecurityError** —
   the same exact message as `type=date` (`legs[3..5].childResult`), and no chooser opens. The
   non-file branch is therefore not date-specific: every non-file, non-color type measured keeps
   the error.
3. **The r81 order discriminator is carried forward.** The disabled `type=date` input is
   `InvalidStateError` same-origin and `SecurityError` cross-origin (`legs[1]`, `legs[6]`).
4. **The r81 answer laws are carried forward.** A directory answered through
   `DOM.setFileInputFiles` expands with `webkitRelativePath`; a `.txt` answered into
   `accept=".png"` is accepted (`legs[7]`, `legs[8]`).
5. **A real click on an input whose picker is already open opens a SECOND chooser with the same
   `backendNodeId` as the first** (`legs[9]`: `clickWhileOpenChoosersBefore = 1`,
   `clickWhileOpenChoosersAfter = 2`, both `Page.fileChooserOpened` events carry
   `backendNodeId = 11`). Answering by id therefore cannot discriminate the second chooser from
   the first — this is a measured limit of the answer law, not a law of its own.

## What a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove WHY Chromium exempts
  color (the same black-box discrimination as r81).
- The `type=color` exemption is measured on one input type in one fixture; the spec's full
  exemption surface (`file`, `color`) is carried from S219/S220, not enumerated by measurement.
- The second chooser's shared `backendNodeId` is browser-assigned; answering it is frontier
  evidence (r83), not a law here (QUALITY 150).

## Frontier (named, not held)

- `type=number`/`range`/`tel`/`search` cross-origin legs (the remaining non-file types).
- Can the second chooser be answered in a way attributable to it (distinct bytes/state)?
- The `accept` token grammar against a programmatic answer (extensions vs MIME vs `image/*`).
