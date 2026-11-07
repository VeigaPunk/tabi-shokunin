source: S208-S215 (S214, S215 new this round) — corpus/SOURCES.md
verified-at: 2026-11-07 (round 78, Chromium 155.0.8059.84 Arch Linux `/usr/bin/chromium`, `--headless=new`)
recheck: `node scripts/check-filechooser-r78.mjs --lane . --receipt corpus/evidence/round78/chromium-file-chooser/receipt.json --expect-driver-sha256 <freeze.txt> --expect-nonce tabi-r78-l1-<D12> --prior-set .ufo/waves/round-78/controls/c1/prior-set.txt --json` (exit 0, 186 checks); sources re-open on release of a new Chromium tag.

# File choosers under CDP interception — what the page, not the browser, can bind (round 78)

Measured on the r78 generation of the file-chooser fixture (four `<input type=file>` elements `#s`
single, `#m` multiple, `#d` webkitdirectory, `#k` accept=".png", and a button `#f` that calls
`#s.click()`; 15 legs, 79 page events per honest run) with the pinned driver
`scripts/chrome-cdp-filechooser-round78.mjs` and the counter `scripts/check-filechooser-r78.mjs`
(186 checks). Every number below is re-derivable from the committed receipts named beside it.

## 1. `Page.fileChooserOpened.backendNodeId` is not a property of the element

The event carries a `backendNodeId` (S212:1303-1304), but Blink assigns it from the DOM agent's
serialization history, not from the element's identity. Across honest runs of ONE pinned driver the
same input reported different ids — `#s` 5 in 23 runs and 4 in one, `#m` 7 and 10 (round-77 evidence:
`.ufo/waves/round-77-seats/R77Exec1/counter.json`, `.ufo/waves/round-77-seats/L1-diag/r2.json`), with
every other per-leg field identical. Round 78 therefore binds the chooser event to the element the
PAGE recorded — the leg's target letter plus a descriptor the page measured before the legs ran
(`fixtureInputs`: `tag`, `type`, `multiple`, `webkitdirectory`, `accept`, and the layout rect) — and
reports the id (`nodeReport`) instead of requiring it. The one-id-per-input law survives: the same
input keeps one id within a run and different inputs keep distinct ids, so a cross-input swap is
refused while a consistent relabel is inside the declared limit.

Client-side corroboration: Playwright's `FileChooser` exposes `element` ("Returns input element
associated with this file chooser.", S214) and `isMultiple` ("Returns whether this file chooser
accepts multiple files.", S214) — the client answers a chooser through the input it belongs to, never
through an id.

## 2. The chooser mode is the input's attribute, and the page can prove which input it was

Measured mode per element on all 7 pre-freeze receipts and the scored receipt: `#s`,`#d`,`#k` →
`selectSingle`, `#m` → `selectMultiple`; `webkitdirectory` does not change the mode (S211:1899-1913
calls the probe with `input.Multiple()`). The r78 counter derives the expected mode from the
page-measured `multiple` flag of the descriptor for the leg's target, so the law is tied to the page
element, not to a table in the counter.

## 3. The main frame has an anchor outside the event log

`Page.getFrameTree` before navigation returns the main frame with no parent and url `about:blank`;
its id is the id every chooser event and the one `Page.frameNavigated` carry
(`receipt.frameTree`). Using it removes the self-reference in round 77 (the counter compared events to
a field the same driver wrote): the r78 counter requires `mainFrameId === frameTree.mainFrameId`,
`mainFrameParentId === null`, `mainFrameUrl === 'about:blank'`, and the navigation url
`origin + /?run=<nonce>`.

## 4. Arming is before the click

A client must arm interception before the click that opens the chooser: Puppeteer's
`Page.waitForFileChooser` says "This must be called before the file chooser is launched. It will not
return a currently active file chooser." (S215). The driver's `Page.setInterceptFileChooserDialog`
sends are therefore the first sends of their legs and the counter requires a chooser event for a leg
only when interception was enabled at that leg.

## 5. What a receipt cannot prove

- A browser-assigned id relabelled consistently everywhere is not detectable (no check pins it).
- The counter reads receipts: a forger who rewrites the identity fields and enough event times/gaps of
  a prior escapes once below the printed per-prior `absNeed`/`gapNeed`.
- A receipt outside the two walked trees (`.ufo/waves/round-78`, `corpus/evidence/round78`) is outside
  the prior-set walk; the pre-freeze harness therefore passes `--tree-exempt <its source receipt>`
  explicitly, and the walk still refuses any OTHER file of the schema, including one that carries the
  run's nonce.

## 6. Measured facts a consumer can rely on

- `DOM.setFileInputFiles` on the opened node delivers trusted `input`+`change` with exact bytes; an
  unchanged selection fires `cancel`; `[]` fires nothing and keeps the selection (round-77 note,
  re-measured here on 7 receipts, all 186 checks clean).
- A non-file node is refused `{code -32000, message: "Node is not a file input element"}` (S209:1809).
- `--headless=new` cancels a chooser opened with interception disabled, with no `fileChooserOpened`
  event (measured `intercept-off` leg).

Evidence: `corpus/evidence/round78/chromium-file-chooser/receipt.json` (scored run),
`.ufo/waves/round-78/controls/c1/probe/p1-p4.receipt.json`, `.ufo/waves/round-78/controls/c1/smoke/s1-s3.receipt.json`,
`.ufo/waves/round-78/controls/c1/pf/out/pf-*.{counter,battery,killpower}.json`.
