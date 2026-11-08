# R86Critic — falsification of C1/C2 wording (round 86, wave w1)

Seat: R86Critic (leaf, read-only, no edits). Counterexample-first review of the
four assigned questions. Sources: frozen instruments under
`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/` and the scored receipt
`corpus/evidence/round86/chromium-showpicker/receipt.json`
(fixture sha256 `94421dc0…`, driver sha256 `5a435da6…`, nonce
`tabi-r86-l1-4bd89a80f439`), plus
`.ufo/waves/round-86/scored/witness-a.json`.

Note on a scored artefact this seat found: `.ufo/waves/round-86/scored/witness-a.json`
reads 4168 bytes and is the full witness JSON (the empty rendering seen on first
read was a read-window artefact, not an empty file). The witness numbers used
below are read from that file, cells, not from the task prompt.

---

## (1) "Accept is a dialog filter, never a validator" — receipt cannot distinguish the two readings

**Counterexample.** Take the receipt for `sp86-accept-pdf-token-png`
(`accept="application/pdf"`, delivered `tabi-r86-b.png`). Every recorded field is
on the programmatic path:

- `answer.setParams.files` = absolute upload path, `backendNodeId` = the
  `Page.fileChooserOpened` event's node id; `setResult: {}`, `setError: null`.
- `cdpSendLog` method sequence: `Page.setInterceptFileChooserDialog {enabled:true}`
  → `Runtime.evaluate` (showPicker) → `DOM.setFileInputFiles` →
  `Page.setInterceptFileChooserDialog {enabled:true, cancel:true}`.
- `cdpEventLog`: `Page.frameNavigated` + one `Page.fileChooserOpened`
  `{mode: selectSingle, backendNodeId: 18}`; no dialog listing, no filtered-name
  list, no rejection record.
- `pageEvents`: trusted `input@ap` + `change@ap` + `read@ap` with
  `ret: 'hex:89504e47…'`; `stateAfter.ap` = the PNG entry; `fixtureInputs`
  read-back `accept: "application/pdf"` (`window.__inputs()`).

There is **no receipt field** that records what a real dialog would have offered
or rejected: the dialog is suppressed by interception on every answer leg
(driver `chrome-cdp-showpicker-round86.mjs:439` `\u2013` `setInterceptFileChooserDialog`,
`;570-577` answers solely via `DOM.setFileInputFiles`), and the CDP allowlist
(`check-showpicker-r86.mjs:385`)
`{Browser.getVersion, Page.enable, Runtime.enable, Page.getFrameTree,
Emulation.setDeviceMetricsOverride, Page.navigate, Page.setInterceptFileChooserDialog,
Input.dispatchMouseEvent, Runtime.evaluate, DOM.setFileInputFiles}` contains no
dialog-content method. `DOM.setFileInputFiles` is a DevTools programmatic
answer; by construction it bypasses any dialog-side `accept` filter.

Therefore the receipt **cannot distinguish**:

- (A) "Chromium enforces `accept` in the dialog only" (dialog-filter), from
- (B) "Chromium enforces `accept` nowhere".

Both worlds produce byte-identical receipts. No leg ever lets a dialog appear,
so no dialog-side acceptance/rejection evidence exists anywhere in the bundle.

**Which sentence the receipt supports.** The counter's own check message is
exactly bounded and is the supported sentence: *"each accept token form
(wildcard, mixed list, non-matching MIME token) must be recorded on the input
and must not filter a programmatic answer"* (`check-showpicker-r86.mjs:680`).
The wider headline sentences — claim C1 `type` and knowledge-note §1,
"`accept` is a dialog filter, never a validator \u2014 for every token form"
(`claims.json:11`, `corpus/knowledge/chromium-showpicker-runtime-round-86.md:16`)
— assert the dialog-side half, which the receipt does not measure.

**Verdict: sentence-level overclaim in the headline, contained by disclosure.**
`claims.json` C1 `limit` discloses it ("The accept law is an ACCEPTANCE law:
DOM.setFileInputFiles bypasses the dialog, so what a user's dialog would filter is
not measured") and the note repeats it ("Acceptance is not filtering…
is not claimed"). This is a wording calibration finding, not a kill: the kill
rule triggers on a false leg or a harmed axis, and the limit text corrects the
headline wherever it counts (the counter itself only checks the programmatic
sentence). Smallest safe correction (for L1, not this seat): read the headline
as shorthand for the counter's check message; do not quote either headline
sentence as a receipt-backed dialog claim.

---

## (2) Colour arm "zero FILE choosers" — receipt cannot show colour popup; wording stays inside bound

**What the receipt cannot show.** The `LOGGED_EVENTS` set in the driver is
exactly `{Page.fileChooserOpened, Page.frameNavigated,
Runtime.executionContextCreated}` and `cdp-event-log-closed` rejects any other
event method, so the receipt has no channel for:

- the `type=color` popup itself (present or absent),
- any non-file chooser (date picker, datalist popup, colour picker),
- `input`/`change` semantics of picking a colour (the arm only checks
  `stateAfter.cos == []` and zero `input`/`change` page events, which are
  consistent with both "popup shown, not picked" and "no popup").

Measured leg `sp86-same-origin-color-activated`: `showPicker: {ok:true,
ret:'undefined'}`, `activationBefore {true,true}` → `activationAfter
{false,true}`, `cdpEventLog` = `Page.frameNavigated` only (file-chooser count 0),
page events = five pad events only. All of that is true under both popup
readings.

**Whether the wording stays inside the bound: yes.** Three independent fences
state the bound explicitly: counter comment + check (`check-showpicker-r86.mjs:682-687`,
"opens NO file chooser \u2014 the colour picker is not a
Page.fileChooserOpened event, so the law is bounded to that metric"; check
message "open no FILE chooser"), claim C1 `type` ("ZERO Page.fileChooserOpened
events (a file-chooser metric: the colour popup is not measured)",
`claims.json:11`), and note §"cannot prove" + Frontier
(`chromium-showpicker-runtime-round-86.md:52-55, 68-69`). The assignment's
paraphrase "zero FILE choosers" is the same bounded claim. No overclaim found;
a reader who quotes the claim must carry the FILE/metric qualifier, which all
three sites already carry. This is the correct-calibration control in this
review.

---

## (3) C2 before-value 3, not 6 — CONFIRMED, mechanism cell by cell

Witness runner `witness-families-r86.mjs:57-62`: the six `narrow-tel-*` mutants
keep each law conjunct for `sp84-cross-origin-tel` only. The mutated conjuncts
sit in the *extras loop* over
`{color, month, week, time, number, range, tel, search, text}`
(`check-showpicker-r85.mjs:587-591`); the nonfile leg's witnesses
(`w-cross-nonfile-*`, r85 battery lines 303-306) test the *separate* nonfile
law check and therefore do **not** kill the `narrow-tel-*` mutants — this is
why the `w-cross-nonfile-childact-before` case (r85:305) does not save
`narrow-tel-childact-before`, and the "3" is not an arithmetic error.

From `scored/witness-a.json` (before generation = r85 counter + r85 battery):

| narrow-tel family | before | failed | firstFailure |
|---|---|---|---|
| `message` | killed | 8 | `cross-origin-number-law` |
| `childlate` | killed | 1 | `cross-origin-text-late` |
| `childact-after` | killed | 1 | `cross-origin-search-activation` |
| `crossaccess` | **survived** | 0 / 175 cases | — |
| `childseq` | **survived** | 0 / 175 cases | — |
| `childact-before` | **survived** | 0 / 175 cases | — |

Killing-case analysis against `negatives-showpicker-r85.mjs`:

- `message` killed by every non-tel wholesale `childResult` case in the extras
  loop: `cross-origin-number-law` (:169), `-range-law` (:170), `-search-law`
  (:172), `-text-law` (:173), `cross-color/month/week/time-law` (:186-189) \u2014 8 failures.
- `childlate` killed by exactly one case: `cross-origin-text-late` (:176,
  text leg `childLate = 1`).
- `childact-after` killed by exactly one case:
  `cross-origin-search-activation` (:175, search leg `childActivationAfter`
  wrong).
- `crossaccess`, `childseq`, `childact-before`: the only r85 cases mutating
  those fields on an extras-loop leg are the tel ones (:240, :241, :243);
  the narrowing is invisible there, so they survive.

This matches the C2 `limit` disclosure verbatim ("whose battery already kills
the conjuncts that a search/text case existed for (childResult, childLate on
text, childActivationAfter on search)"). **Verdict: before-value 3 CONFIRMED;
no hidden defect.** Fragility note (not a defect): two of the three kills
rest on a single case each — removing `cross-origin-text-late` or
`cross-origin-search-activation` from the r85 battery would move the
before-value to 4.

---

## (4) Are the six new search/text cases needed? No \u2014 3 cases suffice

The r86 battery adds 12 cases: `cross-{search,text}-` \u00d7 6 families
(`negatives-showpicker-r86.mjs:265-277`). The measured after-kills all show
`failed: 2` (both search and text fired); one firing suffices to flip the
family from survivor to killed.

Cheaper witness achieving the identical before/after verdict (`3 \u2192 0`):

- **3 cases on one non-tel extras leg**: e.g. `cross-search-crossaccess-dropped`,
  `cross-search-childseq-dropped`, `cross-search-childact-before-dropped`
  \u2014 one single-field mutation each, copied from the existing tel cases
  (:240-243) with the leg name changed. Any single non-tel extras leg works;
  alternatively drop the new-leg approach entirely and mutate an existing
  extras leg (number/range/month/week/time) the same way.

The remaining 9 of the 12 (both legs \u00d7 the 3 already-killed families, plus
the second leg \u00d7 the 3 survivor families) are redundant **for the kill
claim**; they buy defense-in-depth (a future leg-scoped narrowing against text
alone, symmetry) at 4\u00d7 the minimal witness cost. That is a legitimate
operability tradeoff, but the claim that the full set is *needed* is refuted:
9 cases could be cut without changing any before/after cell. C2 leg (b) requires
all 12 to exist, so this is a cost calibration note, not a predicate failure.

---

## Summary table

| Question | Verdict |
|---|---|
| (1) dialog filter vs no-enforcement | Receipt cannot distinguish; the counter's check message is the supported sentence; the claim-type/note headlines are wider than the receipt (overclaim contained by explicit `limit` disclosure; no kill). |
| (2) zero FILE choosers | Cannot show colour popup or any non-file chooser; wording stays inside the bound, fenced in counter, claim, and note. No overclaim. |
| (3) before-value 3 | CONFIRMED cell-by-cell; kills via number/range/search/text/color/month/week/time `childResult` cases, `cross-origin-text-late`, `cross-origin-search-activation`. |
| (4) six new cases needed | No; 3 cases on one non-tel extras leg suffice. 12-case set is 4\u00d7 minimal; 9 redundant for the kill claim. |

Tools: none installed or updated (read-only seat). Scratch under
`/fast/scratch/hyaku/tabi-r86/R86Critic/` was created for one witness
re-run directory and removed before yielding; no other paths written.
