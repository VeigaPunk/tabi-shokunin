LANDING (delete before commit): this is the draft of `corpus/knowledge/chromium-showpicker-runtime-round-81.md`.
Every value below was read from the scored receipt `corpus/evidence/round81/chromium-showpicker/receipt.json`
(nonce `tabi-r81-l1-a2183a933622`, `finishedAt 2026-11-07T23:14:54.313Z`, counter clean 56 checks); the
`recheck:` command's `--expect-fixture-sha256` is that receipt's `fixture.sha256` (the fixture hash embeds the
nonce, so it is per-receipt). Nothing needs substituting.

# chromium-showpicker-runtime — generation r81

source: S219 (WHATWG HTML showPicker steps), S220 (Chromium 155 html_input_element.cc), S221 (CDP Page.pdl, carried), S222 (CDP DOM.pdl, new), S223 (WHATWG `accept`, new)
verified-at: 2026-11-07T23:14:54.313Z (Chromium 155.0.8059.84, node v24.21.0, Linux `--headless=new`)
recheck: `node scripts/chrome-cdp-showpicker-round81.mjs --lane <ABS lane> --nonce tabi-r81-recheck --scratch <ABS> --out <ABS>.json --http-port 18990 --cdp-port 18991 --child-port 18992` then `node scripts/check-showpicker-r81.mjs --lane <ABS lane> --receipt <ABS>.json --expect-driver-sha256 e35e63c11052a7b48efd765541618495d8a2301dbfb36f3250b763dc3c97c669 --expect-nonce tabi-r81-recheck --expect-fixture-sha256 d9129edd5b5485169d8a523f76c6bcf7055202668824a38d3b4e654b092a1703 --prior-set .ufo/waves/round-81/controls/c1/prior-set.txt --json`

Generation r81 extends the r80 note (`chromium-showpicker-runtime-round-80.md`) with the five
frontier legs round 80 named and did not hold: the cross-origin NON-file `SecurityError`, the
cross-origin/same-origin disabled-input order discriminator, the `webkitdirectory` ANSWER, the
`accept`-filtered ANSWER, and a real click while a picker is open. Every law below is measured on the
committed receipt `corpus/evidence/round81/chromium-showpicker/receipt.json` (nonce
`tabi-r81-l1-a2183a933622`, 6 legs, one fresh browser per leg) and bound by
`scripts/check-showpicker-r81.mjs` (56 checks).

## Provenance

- Driver `scripts/chrome-cdp-showpicker-round81.mjs` (6 legs; page fixture = the r78 template plus
  five asserted patches — `PATCH_STYLE`, `PATCH_BODY`, `PATCH_FL_TO`, `PATCH_INPUTS_TO`,
  `PATCH_STATE_TO`: a neutral `#pad`, `#dis`/`#disd` disabled inputs, page-side descriptors for
  them, `fl()`'s fourth column `webkitRelativePath`, and a cross-origin iframe whose child origin is a
  second loopback port). Counter `scripts/check-showpicker-r81.mjs` (56 checks, a pair-based replay
  rule, a content-bound tree exemption). Battery `scripts/negatives-showpicker-r81.mjs` (62 cases,
  coverage asserted against the counter's own check ids). Kill power `scripts/kill-power-r81.mjs`
  (46 semantic mutants; 46 killed, 0 survivors).
- Pins: `.ufo/waves/round-81/freeze.txt` (driver, counter, battery, kill power, drift counter,
  selftest, prior set, probes 1-2, the no-work and forgery controls); digests commit
  D = `a2183a93362259cb574ef3d03b565ee6d2c26599`.
- The fixture hash is nonce-bound: `fixture.sha256` is computed over the patched HTML after
  `__NONCE__` substitution, so `--expect-fixture-sha256` is per-receipt, not per-generation. The
  page-side descriptors the laws bind are `fixtureInputs` (7 entries: `s` file, `m` file+multiple,
  `d` file+webkitdirectory, `k` file+`accept=".png"`, `f` submit button, `dis` file+disabled,
  `disd` date+disabled).

## The laws, as measured

1. **A cross-origin iframe's own `type=date` input throws `SecurityError` and opens nothing.**
   `legs[0]` (`sp81-cross-origin-nonfile`): `childResult` =
   `{ok:false, name:"SecurityError", message:"Failed to execute 'showPicker' on 'HTMLInputElement':
   showPicker() called from cross-origin iframe."}`; `cdpEventLog` carries no
   `Page.fileChooserOpened`; `parentCrossAccess` = `{contentDocument:null,
   windowDocument:"SecurityError"}`; `childEvents` = `pointerdown@go3 … click@go3` (5 events, every
   one `isTrusted:true`); `childLate` 0. The child's own click is the leg's only input — the parent
   never calls `showPicker()` (`showPicker` null). S219's condition (lines 5832-5836) and S220's
   cross-origin block (lines 2654-2663) are the normative and implementation sides.
2. **The order discriminator: the same call on a DISABLED `type=date` is `SecurityError`
   cross-origin and `InvalidStateError` same-origin.** `legs[1]`
   (`sp81-cross-origin-nonfile-disabled`, child `#dtd` disabled): `childResult` = the same
   `SecurityError`, zero chooser events, `childActivationBefore` `{isActive:false,
   hasBeenActive:false}` → `childActivationAfter` `{true,true}`. `legs[2]`
   (`sp81-same-origin-nonfile-disabled`, parent `#disd` disabled): `showPicker` =
   `{ok:false, name:"InvalidStateError", message:"Failed to execute 'showPicker' on
   'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls."}`, zero
   chooser events, `activationBefore` `{true,true}` → `activationAfter` `{true,true}`. One call shape,
   two errors, split by origin: Chromium checks the origin before mutability (S220: origin block
   2654-2663, `isMutable()` 2666, gesture 2673), while the spec's steps order mutability first
   (S219: `InvalidStateError` 5830-5831, then the origin step 5832-5836). The two disagree exactly
   here, and the receipt shows the disagreement; it does not show which internal check ran (see
   Limits).
3. **`DOM.setFileInputFiles` naming a DIRECTORY answers a `webkitdirectory` input: the directory's
   files arrive with `webkitRelativePath` set and trusted `input`+`change` fire.** `legs[3]`
   (`sp81-webkitdirectory-answer`): `answer.setParams` = `{files:[<scratch>/tabi-r81-dir],
   backendNodeId:<the chooser event's id>}`; `answer.setResult` `{}`, `answer.setError` null;
   `stateAfter.d` = `[["inner-a.txt",19,"text/plain","tabi-r81-dir/inner-a.txt"],
   ["inner-b.png",18,"image/png","tabi-r81-dir/inner-b.png"]]`; `pageEvents` = `input@d`,
   `change@d` (both `isTrusted:true`) and two `read@d`; `uploadDir.files` sha256s equal the bytes the
   page read. The chooser event's `params.mode` is `selectSingle`: the CDP mode enum has no
   directory-specific value (S221), and the answer command's parameters are `files`, `nodeId`,
   `backendNodeId`, `objectId` only — no accept, no directory flag (S222, lines 681-691).
4. **`accept` does not filter a programmatic answer.** `legs[4]` (`sp81-accept-answer`): a `.txt` is
   answered into `#k` (`fixtureInputs[3].accept` = `".png"`) and is ACCEPTED — `stateAfter.k` =
   `[["tabi-r81-a.txt",22,"text/plain",""]]`, `answer.setResult` `{}`, `answer.setError` null,
   `input@k`/`change@k` trusted, one `read@k` whose `ret` is `hex:` of the file's bytes (sha256
   `7129fd71e264e82dffbb71a0d607d22fc64cb5af21476587eb5b27701ae3f814`). S223 calls `accept` "a hint
   of what file types will be accepted"; the answer command never reads it (S222).
5. **A real click on an input whose picker is already open opens a SECOND chooser.**
   `legs[5]` (`sp81-click-while-open`): the programmatic trigger opens one chooser
   (`clickWhileOpenChoosersBefore` 1), then a real trusted click on `#s` raises a second
   (`clickWhileOpenChoosersAfter` 2); `cdpEventLog` carries two `Page.fileChooserOpened`, both
   `mode:"selectSingle"` and both the SAME `backendNodeId` (9 on probe2, 10 on the scored receipt —
   the id is browser-assigned, so the law is the equality, not the literal); `clickWhileOpenElement` `s`; `pageEvents` end
   `click@s` (`isTrusted:true`, `act:true`); `stateAfter` is empty — the click opens a chooser, it
   selects nothing.
6. **The chooser mode is the input's, not the command's.** `mode-law` binds every
   `Page.fileChooserOpened.params.mode` to `fixtureInputs`: `multiple:true` → `selectMultiple`, else
   `selectSingle`. A `webkitdirectory` input (leg 3) and an `accept`-constrained input (leg 4) are
   both `selectSingle`; the mode follows the input's `multiple` attribute only.
7. **Activation is per-frame-tree, and a throwing call does not consume it.** The child frame's click
   sets the PARENT window's `hasBeenActive` (`legs[0]`/`legs[1]` `activationBefore`
   `{false,false}` → `activationAfter` `{true,true}`); the `SecurityError` and `InvalidStateError`
   calls leave `isActive` true after the throw (`legs[1]`/`legs[2]` `activationAfter`); a successful
   trigger consumes it (`legs[3]`/`legs[4]`/`legs[5]` `activationAfter` `{isActive:false,
   hasBeenActive:true}`).
8. **The trigger never selects files.** `no-selection-law`: no leg's `stateAfter` carries a file list
   produced by the trigger alone; the answer legs' lists are the answer's (`legs[3].stateAfter.d`,
   `legs[4].stateAfter.k`), and the click-while-open leg's `stateAfter` is empty. A picker opening is
   an event, not a selection.

## Limits — what a receipt of this shape cannot prove

- **The pair, not the check order.** The receipt proves `SecurityError` cross-origin and
  `InvalidStateError` same-origin for the same disabled `type=date` call. "The origin check ran
  first" is the only reading consistent with S220's source order plus that pair; it is not an
  observation of the check itself. A build that returned `SecurityError` from an earlier branch
  would produce the same receipt.
- **The replay rule is PAIR-based.** A forger who rewrites the identity fields and moves at least
  `ceil(0.5 * the prior's own event count)` event times escapes; the escape minimum is printed per
  prior in the counter's `limit` block. A forger who shifts EVERY event by a constant offset escapes
  the pair rule — that is the stated limit. The gap side is REPORTED, never a refusal (this driver's
  fixed waits reproduce gap durations across honest runs).
- **A browser-assigned `backendNodeId` relabelled consistently inside one leg is inside the limit**
  (QUALITY 150). Measured: leg 5's two chooser events carry the SAME id (9 on probe2, 10 on the
  scored receipt), so the id does not distinguish the two choosers; the receipt binds the
  page-measured descriptor and the mode, not the id literal.
- **The directory answer is one directory of two files on a `multiple:false`,
  `webkitdirectory:true` input.** It does not prove a `multiple` answer, two directories, nested
  directories, a file path on a directory input, or a directory path on a plain input.
- **The `accept` law is one pair** (`.txt` into `accept=".png"`). It does not prove the token grammar
  (MIME type vs extension, `image/*`, multiple tokens) against a programmatic answer.
- **The click-while-open law proves two events fire.** It does not prove the second chooser is
  answerable, nor which `backendNodeId` an answer must use, nor whether the first can be answered
  while the second is pending.
- **"Cross-origin" here is two loopback origins** (same scheme and host, different port). A different
  host or scheme is unmeasured.
- **`type=color`, the other exempt type, is unmeasured.** The exemption is cited from S219/S220, not
  observed.
- **The cross-origin gesture branch is unmeasured.** Every cross-origin leg clicks first, so the
  origin check's precedence over the gesture check is source-only (S220 line 2673).

## Frontier (named, not held)

- Answering the SECOND chooser of the click-while-open leg: both events carry the same
  `backendNodeId` (9 on probe2, 10 on the scored receipt) — does `DOM.setFileInputFiles` on that id
  deliver to `#s`, and can the first be answered while the second is pending? (R81Exec3's probe is
  the frontier evidence, not a capability leg.)
- A cross-origin `type=color` input (the other exempt type), and a cross-origin non-file input with
  NO activation (origin vs gesture order).
- `DOM.setFileInputFiles` naming a directory on a plain (non-`webkitdirectory`) input, and a file
  path on a `webkitdirectory` input — the error paths.
- A `multiple` + `webkitdirectory` answer: several files from one directory, and two directories in
  one answer.
- The `accept` token grammar against a programmatic answer (MIME type vs extension, `image/*`,
  multiple tokens).
- Nested directories under a `webkitdirectory` answer: does `webkitRelativePath` carry the nested
  path?
