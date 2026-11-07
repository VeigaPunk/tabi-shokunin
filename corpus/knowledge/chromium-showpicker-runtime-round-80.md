# chromium-showpicker-runtime — generation r80

source: S219 (WHATWG HTML showPicker steps), S220 (Chromium 155 html_input_element.cc), S221 (CDP Page.pdl)
verified-at: 2026-11-07T22:40Z (Chromium 155.0.8059.84, node v24.21.0, Linux `--headless=new`)
recheck: `node scripts/chrome-cdp-showpicker-round80.mjs --lane <ABS lane> --nonce tabi-r80-recheck --scratch <ABS> --out <ABS>.json --http-port 18990 --cdp-port 18991 --child-port 18992` then `node scripts/check-showpicker-r80.mjs --lane <ABS lane> --receipt <ABS>.json --expect-driver-sha256 <freeze pin> --expect-nonce tabi-r80-recheck --expect-fixture-sha256 <receipt fixture sha> --prior-set .ufo/waves/round-80/controls/c1/prior-set.txt --json`

Generation r80 extends the r79 note (`chromium-showpicker-runtime-round-79.md`) with the six
frontier legs round 79 named and did not hold. Every law below is measured on the committed receipt
`corpus/evidence/round80/chromium-showpicker/receipt.json` (nonce `tabi-r80-l1-211962dccb61`, 7 legs,
one fresh browser per leg) and bound by `scripts/check-showpicker-r80.mjs` (57 checks).

## Provenance

- Driver `scripts/chrome-cdp-showpicker-round80.mjs` (7 legs; page fixture = the r78 template plus a
  neutral `#pad`, a disabled `#dis`, and a cross-origin iframe whose child origin is a second loopback
  port). Counter `scripts/check-showpicker-r80.mjs` (57 checks, a pair-based replay rule, a
  content-bound tree exemption). Battery `scripts/negatives-showpicker-r80.mjs` (102 cases, one
  isolating case per check, coverage asserted against the counter's own check ids). Kill power
  `scripts/kill-power-r80.mjs` (80 semantic mutants; 80 killed, 0 survivors).
- Pins: `.ufo/waves/round-80/freeze.txt`; digests commit D = `211962dccb618982638a74865ea616c6ca33e986`.

## The laws, as measured

1. **A `webkitdirectory` input opens `selectSingle`.** `sp80-webkitdirectory`: `showPicker()` after a
   trusted `#pad` click returns `{ok:true, ret:"undefined"}` and the intercepted chooser event carries
   `mode:"selectSingle"` (the CDP mode enum has no directory-specific value). `fixtureInputs` shows
   `webkitdirectory:true`; `mode-law` binds the mode to the page-measured descriptor.
2. **An `accept`-constrained input opens `selectSingle`.** `sp80-accept-png` (`accept=".png"`) is the
   same: `{ok:true}` and `mode:"selectSingle"`; the accept list does not change the CDP mode.
3. **There is no "already open" guard on the programmatic path.** `sp80-twice-gesture`: two calls each
   carrying `Runtime.evaluate {userGesture:true}` and no page click BOTH return `{ok:true}` and TWO
   `Page.fileChooserOpened` events fire (one per call, `afterSendId` bound to each call). This differs
   from the r79 `sp-show-twice` leg, where the second call carried no gesture and threw
   `NotAllowedError`: the boundary is the activation, not an open-picker guard.
4. **A deferred call keeps the click's activation.** `sp80-deferred-timer`: a `setTimeout(…, 0)`
   scheduled from the trusted click's handler calls `showPicker()` and succeeds
   (`deferredResult {ok:true}`), one chooser event, while the mandatory direct trigger aimed at the
   disabled `#dis` still throws `InvalidStateError` and does not consume the activation.
5. **A cross-origin iframe's file input is EXEMPT from the SecurityError.** `sp80-cross-origin`: the
   child origin (`http://127.0.0.1:<child>`) calls `showPicker()` on its own `type=file` input and it
   succeeds (`childResult {ok:true}`), one chooser event whose `frameId` is the CHILD frame. The
   parent cannot reach the child document (`parentCrossAccess {contentDocument:null,
   windowDocument:"SecurityError"}`), so page script cannot construct the SecurityError case for a
   file input — and the spec and Chromium both exempt file and color inputs anyway (S219: "File and
   Color inputs are exempted from this check for historical reason"; S220: "In cross-origin iframes it
   should throw a SecurityError DOMException except on file and color."). The SecurityError IS
   reachable for a NON-file input: the child origin's own script calling `showPicker()` on a
   `type=text` input throws `SecurityError "showPicker() called from cross-origin iframe."`
   (R80Scout's measured table, `.ufo/waves/round-80-seats/R80Scout/probes/discriminating-orders.json`,
   cases A–E).
6. **A disabled FILE input in a cross-origin frame throws `InvalidStateError`** — because the File
   exemption skips the cross-origin branch entirely. `sp80-cross-origin-disabled`: the child's
   `showPicker()` on a disabled `type=file` throws `InvalidStateError`, opens nothing, and does NOT
   consume the child's activation (`childActivationBefore {false,false}` → `childActivationAfter
   {true,true}`).
6b. **Chromium checks cross-origin BEFORE mutability; the spec orders mutability first.** Measured
   (R80Scout, same probe): a cross-origin DISABLED `type=text` throws `SecurityError` (the cross-origin
   check at `html_input_element.cc:2657` precedes `isMutable()` at 2666), while the same call
   same-origin throws `InvalidStateError` (control C) and a cross-origin enabled `type=text` throws
   `SecurityError` (case A). The spec's step order (mutability → cross-origin → gesture) would give
   `InvalidStateError` for case B, so the two disagree exactly there. The r80 fixture cannot show this
   with a file input: the exemption deletes the cross-origin branch (cases D/E).
7. **The trigger can be ANSWERED.** `sp80-trigger-then-answer`: after the programmatic trigger opens
   the chooser, `DOM.setFileInputFiles` on the event's `backendNodeId` delivers the exact bytes
   (`upload.sha256` = the file's sha256; the page's `read` event returns `hex:` of the same bytes),
   fires trusted `input` + `change` on the input, and `stateAfter.s` carries `[name, size, type]`
   with `sValue` = `C:\fakepath\<name>`. The r79 trigger path and the r78 answer path compose.
8. **Activation is per-frame-tree.** The child frame's click sets the PARENT window's
   `hasBeenActive` (`sp80-cross-origin`: parent `{false,false}` → `{false,true}`), and the child's
   successful call consumes it tree-wide; the failed (`InvalidStateError`) call does not
   (`sp80-cross-origin-disabled`: parent `{false,false}` → `{true,true}`).

## Limits — what a receipt of this shape cannot prove

- The `SecurityError` step itself is unmeasured: a file input is exempt (S219/S220) and page script
  cannot reach a non-file input in another origin. The r81 flip is a `type=date` cross-origin leg.
- The counter's replay rule is PAIR-based: a forger who rewrites the identity fields and moves at
  least `ceil(0.5 * prior events)` event times escapes it. The gap side is reported, not a refusal:
  this driver's fixed waits reproduce gap durations across honest runs (an honest receipt matched a
  prior's single gap within 0.05 ms), so a gap match is a driver artifact. A forger who shifts EVERY
  event by a constant offset escapes the pair rule — that is the stated limit.
- A browser-assigned `backendNodeId` relabelled consistently inside one leg is inside the limit
  (QUALITY 150): the receipt binds the page-measured descriptor and the mode, not the id literal.
- The answer leg proves delivery for one file on a single-file input; directory (`webkitdirectory`)
  and `accept`-filtered answers are the r81 frontier (R80Exec3's probe).

## Frontier (named, not held)

- A cross-origin frame carrying an enabled AND a disabled NON-file input (`type=text`/`type=date`), so
  the SecurityError and the cross-origin-before-mutability order enter the capability itself
  (R80Scout's measured table is the frontier evidence; the r80 receipt has the file exemption only).
- `DOM.setFileInputFiles` with a directory path on a `webkitdirectory` input (r80's answer leg is a
  single file), and an `accept`-filtered answer.
- A real click on an input whose picker is already open (the click path's own guard, unmeasured).
