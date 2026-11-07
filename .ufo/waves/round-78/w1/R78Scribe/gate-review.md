# gate-review — corpus/lessons/round-78.md §Gate and the S214/S215 rows

Scope: the lesson's `## Gate` claims and the two new SOURCES rows. Each row is checked for (a) the
quote present at the stated locator, (b) the tier defensible for the row's scope, (c) `used-by`
resolving. The lesson's other Gate claims (census, rejected claims, S213 correction) follow.

## S214 — Playwright `class FileChooser`

Row: `corpus/SOURCES.md:229`.

- **Quote present at the locator.** AGREE. The staged
  `.ufo/waves/round-78/sources/playwright-filechooser.html` has
  `Returns input element associated with this file chooser.` at line 11 (under the `element` method
  heading and `fileChooser.element`) and
  `Returns whether this file chooser accepts multiple files.` at line 22 (under `isMultiple` and
  `fileChooser.isMultiple`). `fileChooser.setFiles` appears once (the method anchor).
  Live re-fetch at 2026-11-07 15:25Z: `curl -sS https://playwright.dev/docs/api/class-filechooser`
  → http 200, 50956 B, sha256 `3dc2d551d6bf8799d16df72790cb979b0c28688fa907af5c8e99d5300171b948`,
  byte-identical to the staged copy and to `sources/FETCH.txt`. The "not edited" claim is verified
  against the live page, not only self-consistent.
- **Tier defensible.** AGREE. Tier A for the vendor's own client-side API contract; the row's
  `scope` says "client-side contract only, not Chromium behaviour", and the lesson repeats "it does
  not evidence Chromium behaviour". That is the right scoping.
- **`used-by` resolves.** AGREE. `corpus/knowledge/chromium-file-chooser-runtime-round-78.md`
  exists and cites S214 in §1.
- **Teaches cell overreaches the source.** The row's `teaches` says "a chooser is answered through
  the input it belongs to and that input's multiple attribute, **not through a browser-assigned
  id**". The docs show the API surface (`element`, `isMultiple`, `setFiles`); they do not say how
  the client addresses the node internally, and the lesson's own rejected claim 2 says the client
  property is "its own object model … not evidence of stability". Proposed teaches: "the client API
  exposes the input element and its multiple flag and answers the chooser through that element; it
  says nothing about the id the client uses internally." This is a Gate inconsistency, not a source
  falsification: the row's `scope` already limits it to client-side contract.

## S215 — Puppeteer `Page.waitForFileChooser()`

Row: `corpus/SOURCES.md:230`.

- **Quote present at the locator.** AGREE. Staged
  `.ufo/waves/round-78/sources/puppeteer-waitforfilechooser.html` line 6 (a `caution` admonition,
  the description paragraph) has
  `This must be called before the file chooser is launched. It will not return a currently active
  file chooser.` Live re-fetch at 15:25Z: http 200, 54126 B, sha256
  `9aa1a06eabe1508887a8291e67fbb5ca3eff49234de6466f6cb6bee5ceacc6fa`, byte-identical to the staged
  copy and `FETCH.txt`.
- **Tier defensible.** AGREE. Tier A for the arming rule at that API page; `scope` says "not
  Chromium behaviour and not a tag pin".
- **`used-by` resolves.** AGREE; the note cites S215 in §4.
- **Teaches cell.** AGREE. "a client must arm interception before the click: an already-open chooser
  is not returned, matching the event-driven producer the r78 driver waits for" is supported by the
  quote and by the driver's send order (intercept send before the trigger, measured).

## Lesson Gate — other claims

### Census start

> "Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0 (`.ufo/waves/round-78/census/start.txt`; 213 rows at base)."

**AGREE with the exit and the count; the locator is fleet-root-relative.** The script is
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (not under the lane's `scripts/`);
`census/start.txt` ends with `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`
and `exit=0`. The registry now has 215 rows (`grep -c '^| S[0-9]' corpus/SOURCES.md` → 215); S214 and
S215 are new this round, so 213 at base is correct. The census file does not print the row count;
the 213 is an inference from the registry (215 − 2). Proposed wording: "… exit 0; 213 rows at base
(215 now, S214/S215 new)."

### Rejected claim 1 — backendNodeId identifies the element across runs

**AGREE.** Measured drift over the 25 honest r77 runs: `#s` 5 in 24 / 4 in 1, `#m` 7 in 24 / 10 in 1
(my count over the 25 files; the two cited files show the drift). "The id is a serialization
artifact" is the same inference flagged in note-review §1; the measured part is the drift.

### Rejected claim 2 — `fileChooser.element` proves the CDP id binding

**AGREE with the rejection**, with the same caveat as S214's teaches: "it resolves the node when
needed" is an assertion about Playwright internals not in S214. The rejection's operative point
(client-side usage only; the CDP side rests on the measured receipts) is sound.

### Rejected claim 3 — `mainFrameId` from the driver is enough

**PARTIAL.** The rejection is right that r77 compared events to a driver-written field, and right
that r78 adds the `Page.getFrameTree` result and checks parent/url. But the `frameTree` result is
also transcribed by the same driver, so a consistent rewrite of `mainFrameId`, `frameTree.mainFrameId`,
every chooser `frameId` and the navigation `frameId` is clean (measured:
`frame-relabel.receipt.json` → exit 0, `clean`). The flip condition "a driver whose frame-tree call
is removed or unaudited" does not cover that. Proposed addition to the rejection: "the anchor is a
protocol response the driver records, not an independent source; a consistent rewrite of both fields
is inside the declared limit (measured)."

### Correction carried from r77 (S213)

> "lines 134-136 read 'The zero-length array is a special case, it seems that / DOM.setFileInputFiles does not actually update the files in / that case, so / the solution is to eval the element value to a new FileList directly.'"

**DISAGREE on the span.** The quoted sentence spans lines **134-137** of
`.ufo/waves/round-77/sources/ElementHandle.ts` (line 137 is "the solution is to eval the element
value to a new FileList directly."). The staged file is 6124 B, sha256
`c86ed958566f5c94136bac9c90ba3c167b2221e652dc917f70e202ba2225c445`, matching the lesson's
`c86ed958…c445` and the S213 row. The quote supports the row's `teaches`; only the line span is off
by one. Proposed wording: "lines 134-137 read …".

### Admitted note

> "Admitted: `corpus/knowledge/chromium-file-chooser-runtime-round-78.md` (cites S208–S215; states what the page can bind — descriptor, mode, frame tree — and what a receipt cannot prove)."

**PARTIAL.** The note cites S208-S215 in its header and covers descriptor/mode/frame tree. Its
"what a receipt cannot prove" section is incomplete: it omits (i) the unparsable-JSON-looking-file
refusal that actually refused the scored receipt at HEAD, and (ii) the consistent frame-id rewrite
(measured clean). The lesson's summary inherits the omission.

## Gate verdict

S214 and S215 pass the three checks (quote at locator, tier, used-by); the live re-fetch is
byte-identical, so the "not edited" claim is verified. The Gate's defects are in the lesson's own
prose: S214's `teaches` overreach, the S213 line span (134-137), the mainFrameId rejection's
missing consistent-rewrite limit, and the admitted-note summary inheriting the note's §5 omissions.
