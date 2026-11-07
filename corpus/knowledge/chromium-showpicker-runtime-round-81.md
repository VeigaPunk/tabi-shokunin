source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S222 (CDP `DOM.setFileInputFiles`), S223 (WHATWG HTML `accept` attribute); receipt `corpus/evidence/round81/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round81.mjs`, pin in `.ufo/waves/round-81/freeze.txt`)
verified-at: 2026-11-07T23:20Z (round 81, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r81.mjs --lane <ABS lane> --receipt corpus/evidence/round81/chromium-showpicker/receipt.json --expect-driver-sha256 <pin> --expect-nonce <receipt nonce> --expect-fixture-sha256 <receipt fixture sha256> --prior-set .ufo/waves/round-81/controls/c1/prior-set.txt --json` → exit 0, 56 checks

# Programmatic picker generation r81 — the non-file SecurityError, the order discriminator, and the two answer laws

Generation r81 of the held capability `chromium-showpicker-linux` (SCORECARD). Six legs, one fresh
browser per leg; the page fixture is the round-78 template plus a `#pad` activation div, a disabled
`type=file` `#dis`, a disabled `type=date` `#disd`, and a cross-origin iframe whose own document
carries `type=date` inputs. Every law below names the receipt field path that carries it.

## The measured laws

1. **A cross-origin NON-file input throws the SecurityError.** The child origin's own script calling
   `showPicker()` on its `type=date` input gets `SecurityError` with the exact message
   "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin
   iframe." and no `Page.fileChooserOpened` fires (`legs[0].childResult`, `legs[0].cdpEventLog`).
   This is the branch the r80 generation could not reach: r80 measured the File/Color EXEMPTION
   (a cross-origin file input opens), and the spec (S219) and Chromium (S220) both keep the error for
   every other type. The parent still cannot reach the child document
   (`legs[0].parentCrossAccess = {contentDocument: null, windowDocument: "SecurityError"}`).
2. **The order discriminator: Chromium checks the origin before mutability; the spec orders
   mutability first.** The SAME call on a DISABLED `type=date` input is `InvalidStateError`
   ("cannot be used on immutable controls") same-origin (`legs[2].showPicker`) and `SecurityError`
   cross-origin (`legs[1].childResult`). One call, one disabled control, two origins, two different
   exceptions — the first evidence in this lane that the two orders are distinguishable from page
   script. Neither refusal opens a chooser, and neither consumes the activation
   (`legs[1].childActivationAfter`, `legs[2].activationAfter`).
3. **Transient activation is per-frame-tree.** A trusted click inside the cross-origin iframe makes
   the PARENT window's `navigator.userActivation.isActive` true (`legs[0].activationAfter`,
   `legs[1].activationAfter`), and the child's own `isActive` is true after its click
   (`legs[0].childActivationAfter`). The r80 generation measured the parent's transition only.
4. **A DIRECTORY answered through `DOM.setFileInputFiles` expands into the input's files with
   `webkitRelativePath` set.** Answering a `webkitdirectory` input's chooser with a directory path
   delivers that directory's two files as `[name, size, type, webkitRelativePath]` with
   `webkitRelativePath = "tabi-r81-dir/inner-a.txt"` and `"tabi-r81-dir/inner-b.png"`
   (`legs[3].stateAfter.d`), fires trusted `input`+`change` with the same list (`legs[3].pageEvents`),
   and the page can read both files' exact bytes (`legs[3].pageEvents` `read` rets, `hex:` prefix).
   `DOM.setFileInputFiles` itself takes only `files` and a node id (S222), so the expansion is the
   input's, not the command's.
5. **`accept` is a dialog hint, not a validator: a programmatic answer is NOT filtered.** A `.txt`
   answered into an `accept=".png"` input is accepted — `legs[4].stateAfter.k` carries
   `["tabi-r81-a.txt", 22, "text/plain", ""]`, trusted `input`+`change` fire, and the page reads the
   exact bytes. S223 states the normative reason: the accept attribute "may be specified to provide
   user agents with a hint".
6. **A real click on an input whose picker is already open opens a SECOND chooser.** With the
   trigger's chooser pending, a trusted CDP click on the same input fires the full pointer/mouse/click
   sequence (`legs[5].pageEvents`) and a second `Page.fileChooserOpened` arrives
   (`clickWhileOpenChoosersBefore = 1`, `clickWhileOpenChoosersAfter = 2`). There is no
   already-open guard on the click path, matching r80's programmatic double-open.

## What a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove WHY Chromium orders the
  origin check first. The order law is a black-box discrimination (two origins, one call), not a
  source reading of the branch order.
- The `webkitRelativePath` values are Chromium's; the receipt binds them as delivered, not as
  specified (the spec's directory-upload text is not quoted here).
- The second chooser's `backendNodeId` is browser-assigned; the receipt reports it without
  requiring a literal (QUALITY 150). Whether the second chooser is answerable is frontier evidence
  (r82), not a law here.
- The accept law is measured on one file type pair (`.txt` into `accept=".png"`); the spec's hint
  sentence is the normative support, not a sweep of every accept token.

## Frontier (named, not held)

- Answering the SECOND chooser of the click-while-open leg, and its `backendNodeId` relation to the
  first.
- `type=color` cross-origin (the other exempted type) and `type=month`/`type=week`/`type=time` as
  further non-file security legs.
- `webkitdirectory` with `multiple` and with nested directories (two levels).
- The `accept` token grammar (extensions vs MIME vs `image/*`) against a programmatic answer.
