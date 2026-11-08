# chromium-showpicker-runtime — generation r82

source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S221 (CDP `Page.pdl`), S222 (CDP `DOM.pdl`); receipt `corpus/evidence/round82/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round82.mjs`, pin in `.ufo/waves/round-82/freeze.txt`)
verified-at: 2026-11-08T02:02Z (round 82, Linux host, Chromium 155.0.8059.84 `--headless=new`, node v24.21.0)
recheck: `node scripts/check-showpicker-r82.mjs --lane <ABS lane> --receipt corpus/evidence/round82/chromium-showpicker/receipt.json --expect-driver-sha256 <pin> --expect-nonce <receipt nonce> --expect-fixture-sha256 <receipt fixture sha256> --prior-set .ufo/waves/round-82/controls/c1/prior-set.txt --json` → exit 0, 64 checks

Generation r82 extends the r81 note (`chromium-showpicker-runtime-round-81.md`) with the four
frontier legs r81 named and did not hold: the cross-origin **color** exemption, the cross-origin
**month/week/time** non-file legs, and the click-while-open second chooser. Ten legs, one fresh
browser per leg; the page fixture is the round-78 template plus a `#pad` activation div, a disabled
`type=file` `#dis`, a disabled `type=date` `#disd`, and a cross-origin iframe whose own document
carries `type=date`/`type=color`/`type=month`/`type=week`/`type=time` inputs. Every law below
names the receipt field path that carries it.

## Provenance

- Driver `scripts/chrome-cdp-showpicker-round82.mjs` (10 legs; the page fixture is the round-78
  template plus four asserted patches: a neutral `#pad`, a disabled `#dis`, a disabled `#disd`,
  and the cross-origin iframe; `fl()` reports a fourth column, `webkitRelativePath`).
- Counter `scripts/check-showpicker-r82.mjs` (64 checks, a pair-based replay rule, a content-bound
  tree exemption). Battery `scripts/negatives-showpicker-r82.mjs` (70 cases, one isolating case per
  check, coverage asserted against the counter's own check ids). Kill power
  `scripts/kill-power-r82.mjs` (46 semantic mutants; 46 killed, 0 survivors).
- Pins: `.ufo/waves/round-82/freeze.txt`; digests commit D = `5204a0581de5ef1a9eae08d156646dcb3e6ed25f`
  (`claims.json` `digestsCommit`); the scored receipt's own nonce is `tabi-r82-scored1`, and the
  lane identity nonce is `tabi-r82-l1-5204a0581de5` (`claims.json` `nonce`).
- Scored: counter exit 0 clean, 64 checks; battery 70 cases, 0 failed, coverage
  `{declared 64, covered 64, uncovered [], unknown []}`; kill power 46 mutants, 0 survived,
  0 crashed; gate self-test 9/9.

## The laws, as measured

1. **A cross-origin `type=color` input is EXEMPT: the child's own script calling `showPicker()`
   returns `undefined` and opens nothing.** (`legs[2].childResult = {ok:true, ret:'undefined'}`,
   `legs[2].cdpEventLog` carries no `Page.fileChooserOpened`.) The color input behaves like the
   file input the r80 generation measured, not like `type=date`. The exemption is from the
   SecurityError, not from the opening: there is no file chooser event because no file dialog is
   requested. The source says why (S220, `html_input_element.cc:2657-2658`): the cross-origin
   branch is guarded by `FormControlType() != kInputFile && FormControlType() != kInputColor`.
2. **Cross-origin `type=month`, `type=week` and `type=time` inputs throw the SecurityError** —
   the same exact message as `type=date` (`legs[3].childResult`, `legs[4].childResult`,
   `legs[5].childResult`), and no chooser opens on any of the three. The non-file branch is
   therefore not date-specific: every non-file, non-color type measured keeps the error.
3. **The r81 order discriminator is carried forward.** The SAME call on a DISABLED `type=date`
   input is `InvalidStateError` same-origin (`legs[6].showPicker`) and `SecurityError`
   cross-origin (`legs[1].childResult`) — one call, one disabled control, two origins, two
   exceptions. Neither refusal opens a chooser (`legs[1].cdpEventLog`,
   `legs[6].cdpEventLog`), and neither consumes the activation (`legs[1].childActivationAfter`,
   `legs[6].activationAfter`). The two orders are now both source-located and they disagree: the
   spec's `showPicker()` steps put the mutability check FIRST (S219 §4.10.5.4, "If this is not
   mutable, then throw an "InvalidStateError" DOMException.") and the origin check SECOND, while
   Chromium's implementation checks the origin FIRST (S220, the cross-origin guard at lines
   2657-2665 precedes `!isMutable()` at line 2666). The measurement is the runtime discriminator;
   neither source is a conformance verdict on the other.
4. **Cross-origin `type=date` still throws the SecurityError, and the parent still cannot reach
   the child document.** (`legs[0].childResult`; `legs[0].parentCrossAccess = {contentDocument:
   null, windowDocument:"SecurityError"}`.) This is the r81 law, re-measured on a fresh browser.
5. **A DIRECTORY answered through `DOM.setFileInputFiles` expands into the input's files with
   `webkitRelativePath` set.** (`legs[7].stateAfter.d` = `[["inner-a.txt",19,"text/plain",
   "tabi-r82-dir/inner-a.txt"],["inner-b.png",18,"image/png","tabi-r82-dir/inner-b.png"]]`.)
   Trusted `input`+`change` fire with the same list (`legs[7].pageEvents`), and the page reads
   both files' exact bytes (`legs[7].pageEvents` `read` rets, `hex:` prefix). The command's own
   parameter list is flat — `files` ("Array of file paths to set."), `nodeId`, `backendNodeId`,
   `objectId`, with no `accept` and no directory parameter (S222) — so the expansion is observed
   at the input, not asserted by the command's schema.
6. **`accept` is a dialog hint, not a validator: a programmatic answer is NOT filtered.** A `.txt`
   answered into an `accept=".png"` input is accepted — `legs[8].stateAfter.k` carries
   `["tabi-r82-a.txt",22,"text/plain",""]`, and trusted `input`+`change` fire. S223 states the
   normative reason: the accept attribute "may be specified to provide user agents with a hint".
   The sources show that no layer re-validates `accept` against a programmatic answer; the
   POSITIVE outcome (this `.txt` was accepted) is the runtime observation, not a source claim.
7. **A real click on an input whose picker is already open opens a SECOND chooser.** With the
   trigger's chooser pending, a trusted CDP click on the same input fires the full pointer/mouse/
   click sequence (`legs[9].pageEvents`) and a second `Page.fileChooserOpened` arrives
   (`clickWhileOpenChoosersBefore = 1`, `clickWhileOpenChoosersAfter = 2`). There is no
   already-open guard on the click path, matching r80's programmatic double-open.

## Limits — what a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove WHY Chromium exempts
  color. The r82 measurement is a black-box discrimination (one type, one fixture) that the
  source then explains (S220 lines 2657-2658); it is not an enumeration of the exemption surface.
- The `webkitRelativePath` values are Chromium's; the receipt binds them as delivered, not as
  specified (the spec's directory-upload text is not quoted here).
- The second chooser's `backendNodeId` is browser-assigned and is the SAME as the first's
  (`legs[9].cdpEventLog`: both `Page.fileChooserOpened` events carry `backendNodeId = 11`), so
  answering by id cannot discriminate the second chooser from the first. The receipt reports the
  id without requiring a literal (QUALITY 150).
- The accept law is measured on one file-type pair (`.txt` into `accept=".png"`); the spec's hint
  sentence is the normative support, not a sweep of every accept token.
- The two WHATWG quotes are from the **living standard** (unversioned), fetched 2026-11-07 with
  sha256 `b0202de1c0b4…`; the text can change under this note, so the digest is what makes the
  citation checkable. The CDP `DOM.pdl` cited here lives at
  `third_party/blink/public/devtools_protocol/domains/DOM.pdl` at this tag; the older
  `third_party/devtools-protocol/pdl/domains/DOM.pdl` path returns 404 in this tree.
- The counter's replay rule is PAIR-based: it refuses when `absMatched >= ceil(0.5 * prior
  events)` (the scored run: 32 prior events, `absNeed 16`), and the escape minimum is 17 moved
  events. The gap side is reported, not a refusal — this driver's fixed waits reproduce gap
  durations across honest runs, so a gap match is a driver artifact. A forger who shifts EVERY
  event by a constant offset escapes this rule; that is the stated limit.
- The receipt cannot distinguish "the picker opened and was never answered" from "the picker
  opened and the answer landed on the first chooser" (law 7): with one shared `backendNodeId`,
  the receipt carries no per-chooser answer attribution.

## Frontier (named, not held)

- `type=number`/`range`/`tel`/`search` cross-origin legs (the remaining non-file types).
- Can the second chooser be answered in a way attributable to it — distinct bytes or state, not a
  shared `backendNodeId`?
- The `accept` token grammar (extensions vs MIME vs `image/*`) against a programmatic answer.
- `webkitdirectory` with `multiple`, and with nested directories (two levels).
