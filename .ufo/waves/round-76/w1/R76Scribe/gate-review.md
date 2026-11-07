# Gate review — `corpus/lessons/round-76.md`, Gate rows S202–S206

Seat R76Scribe, round 76 w1. Sources read from `.ufo/waves/round-76/sources/` (the staged decoded
copies; sha256 and line counts re-checked against `sources/FETCH.txt`). Quote checks:
`rederive.mjs` (exit 0) normalises whitespace, joins the stated lines and tests the quote as a
substring; word counts are on the normalised quote.

## 1. Per-row quote check (the Gate's own rule: quote located at the stated line, ≤ 25 words)

| row | lesson quote (lesson:line) | stated line(s) | occurs at those lines? | words | ≤25 | verdict |
|---|---|---|---|---|---|---|
| S202 | "calling alert while Page domain is engaged will stall the page execution. Execution can be resumed via calling Page.handleJavaScriptDialog." (`corpus/lessons/round-76.md:55-56`) | 1487-1488 | **yes, in the comment body**: `sources/Page.pdl:1487` ends "…engaged will stall" and `:1488` is "# the page execution. …"; the raw lines each begin with `# `, so the quote is the comment text with the PDL markers removed, and it starts mid-line 1487 | 19 | yes | **locates** (qualification: comment markers stripped) |
| S203 | "return Response::InvalidParams("No dialog is showing");" (`:58`) | 1733 | yes, verbatim `sources/page_handler.cc:1733` | 5 | yes | **locates** |
| S203 | "std::move(pending_dialog_).Run(accept, prompt_override);" (`:58-59`) | 1740 | yes, verbatim `sources/page_handler.cc:1740` | 2 | yes | **locates** |
| S204 | "bool suppress_this_message = should_suppress || !has_handlers;" (`:61`) | 9603 | yes, verbatim `sources/web_contents_impl.cc:9603` | 6 | yes | **locates** |
| S204 | "rfh->frame_tree_node()->BeforeUnloadCanceled();" (`:62`) | 11679 | yes, verbatim `sources/web_contents_impl.cc:11679` | 1 | yes | **locates** |
| S205 | "if (page->GetChromeClient().OpenJavaScriptPrompt( GetFrame(), message, default_value, return_value)) { return return_value;" (`:64-65`) | 1619-1621 | yes, after joining the three lines and collapsing whitespace (`sources/local_dom_window.cc:1619-1621`) | 9 | yes | **locates** |
| S206 | "// Synchronous mojo call. frame->GetLocalFrameHostRemote().RunModalPromptDialog(" (`:67-68`) | 576-577 | yes, after joining two lines (`sources/chrome_client_impl.cc:576-577`) | 5 | yes | **locates** |

All seven quotes are ≤ 25 words (max 19). The note's own S202 quote (note:21-23, lines 1486-1488)
is 21 words and also locates after comment-marker stripping (`rederive.mjs`).

## 2. Row-level checks beyond the quotes

| row | checks | result |
|---|---|---|
| S202 | line count 1,795 (`wc -l`); sha256 `e944a3b1…05be` (`sha256sum` = `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`); tier A, kind `code`, status `mined`, opened 2026-11-07, recheck `on-release`, used-by both files (`corpus/SOURCES.md:216`) | **agree**, with one range defect below |
| S203 | 2,781 lines; sha256 `768a47e8…d4ac`; row cells as above (`SOURCES.md:217`) | **agree** |
| S204 | 13,314 lines; sha256 `adc65d86…be75`; row cells (`SOURCES.md:218`) | **agree**, with one range defect below |
| S205 | 2,943 lines; sha256 `a1b04978…117f`; row cells (`SOURCES.md:219`) | **agree** |
| S206 | 1,602 lines; sha256 `dadba314…eee`; row cells (`SOURCES.md:220`) | **agree** |

Row defects:

1. **S202 scope and anchor cite `392-397`, but the row's own parenthetical lists `beforeunload`,
   which is line 398.** `sources/Page.pdl:392-398`: 392 comment, 393 `type DialogType extends
   string`, 394 `enum`, 395 alert, 396 confirm, 397 prompt, **398 beforeunload**. The row claims to
   have mined the enum's four values but its range stops one line short. Fix both cells (and the
   note's `:392-397`) to `392-398`.
2. **S204 scope `11656-11712` overshoots `OnDialogClosed`, which ends at 11701**
   (`sources/web_contents_impl.cc:11656-11701`; 11702-11712 are `GetRenderManager` and
   `SetBrowserPluginGuest`). The anchor's claims (11679/11690/11695) are inside; the range is not
   the function. Fix to `11656-11701`.
3. **S206 `564-581` stops before the prompt function's closing brace (582)**; the quote at 576-577
   is inside, so this is cosmetic, not a mislocated quote.
4. **S202's bytes are identical to S105's.** S105 holds `Page.pdl` at tag `154.0.8037.97` with
   sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` and 61,911 bytes
   (`corpus/SOURCES.md:119`), exactly the S202 bytes at tag `155.0.8059.84`. The lesson's "`Page.pdl`
   (S105) … held at other tags" is true, but a reader will assume new content; say the bytes are
   identical between the two tags, so S202's value is the tag binding, not new text.
5. **S206 is a second scope of the same file at the same tag (S186, `SOURCES.md:200`)** — the
   lesson says "other tags/scopes", which is accurate; W04 already flags the duplicate URL.

## 3. One admit and one reject

### Admit — the admitted note (`corpus/lessons/round-76.md:73-77`): **agree**

The Gate admits `corpus/knowledge/chromium-js-dialog-runtime-round-76.md` for the specific claims
it lists (prompt accepted without `promptText` returns `""`; dismissed prompt returns `null` while
the closing event echoes the text; no dialog open → `-32602`; a dismissed beforeunload aborts the
navigation; the page blocks in the dialog) measured on 13/13 pre-freeze runs.

I independently re-derived all of them from the 14 receipts (9 PRE smokes + 4 probes + (a)):
`rederive.mjs` (exit 0) rebuilds each leg's `legShape` from the raw page events, CDP event log and
leg records and matches the recorded shape **140/140 legs**; the counter on the (a) receipt exits 0
with 131 checks, 0 findings and 17 priors (`a-counter.json`). The admit text is accurate as
written. My disagreement is with the note's *prose*, not with this Gate item: the novelty sentence
(note:9-10) and the 20 ms attribution (note:63-64) need the fixes in `note-review.md` before the
note is final.

### Reject — "Answering with no dialog open is a harmless no-op" (`corpus/lessons/round-76.md:87-88`): **agree with the rejection**

Reason: `sources/page_handler.cc:1733` returns `Response::InvalidParams("No dialog is showing")`
when `pending_dialog_.is_null()`, and all 14 receipts' `no-dialog` leg records
`handleError {code:-32602, message:"No dialog is showing"}` with `handleResult null` and an
unchanged `stateAfter` (`dialogs 6, last "prompt=null"`). The counter compares the error as a
`{code,message}` object (`no-dialog-law`), and the (a) run is clean, so the rejection is not a
message-only distinction. The flip condition the lesson states (a tag that returns success) is the
right one.

(The other two rejects were also confirmed independently: `prompt_override` is empty without
`promptText` (S203:1736-1740; 14/14 `prompt-noparam` returns the empty string), and the dismissed
prompt's page value is `null` while the closing event carries `"tabi-ignored"` (S205:1619-1628,
S204:11690/11695; 14/14).)

## 4. The lesson's other checkable claims

| claim (lesson line) | check | result |
|---|---|---|
| fetched 2026-11-07 03:56:02–03:56:08 -03:00 (46) | `sources/FETCH.txt` timestamps | **agree** (02, 04, 05, 06, 08) |
| line counts and sha256 in FETCH.txt (48) | `wc -l` and `sha256sum` on the five staged files | **agree** (1795/2781/2944-1/1602/13314; all five digests match) |
| `grep -c 'page_handler.cc\|local_dom_window.cc\|web_contents_impl.cc'` was 0 before the append (50-51) | `git show a69f9060:corpus/SOURCES.md \| grep -c …` | **agree** (0) |
| census start 201 rows (`census/start.txt`) (lesson:32-33) | `git show a69f9060:corpus/SOURCES.md \| grep -c '^\| S[0-9]'` → 201; `sources-census.sh census` now → `tabi rows 206` | **count agrees; the cited file does not record it** — `census/start.txt` holds only W04 warnings and the final `tabi ok …` line (31 lines, no row count). Cite the base-file count instead. |
| Mistakes row 1: probe-build1 receipt `dialogHypothesis REFUTED`, `failures []`, 6 look-alike hits all `__setLeg` (lesson:97) | `probe-build1-p1-refuted.receipt.json`: `dialogHypothesis REFUTED`, `predicate false`, `failures []`; applying the stated build-1 regex `\balert\b\|\bconfirm\b\|\bprompt\b` to its `cdpSendLog` yields exactly **6** hits (send ids 11,16,21,26,31,36), all `Runtime.evaluate` `window.__setLeg(...)` | **agree**; two wording nits: the receipt records 9 `__setLeg` sends (the 6 is re-derived, not stored), and only one build-1 receipt exists (`grep -rl fca1e354… .ufo/waves/round-76` → 1 file), so "every honest probe of the first build" is one probe |
| Mistakes row 2: `elapsedMs >= 300` read 299 on p3, p4, smoke4; pass-1 counter finding `leg-records: start:elapsedMs`; floor 290 (lesson:98) | receipts: p3/p4/smoke4 `start.elapsedMs` = 299; `lesson-proof/prefreeze-pass1/pf-smoke4.counter.json` findings `[{id:"leg-records", detail:"leg records: start:elapsedMs"}]`; counter floor at `scripts/check-dialog-r76.mjs:236-238` | **agree**; the pass-1 summary is `lesson-proof/prefreeze-pass1/prefreeze-summary.json` (`allOk false`), not the current `controls/c1/prefreeze-summary.json` (`allOk true`) — name the path |
| Mistakes row 3: bracket cases "bracket misplaced" on 7 of 9 smokes; smoke3 has 3 (lesson:99) | pass-1 summary: 7 of 9 smoke rows `ok false` with bracket case ids; `pf-smoke3.battery.json` has exactly 3 failures with `error: "bracket misplaced: …"` (`replay-timeline-tol-in-0.049`, `accept-prior-tol-out-0.051`, `accept-prior-gap-below-threshold`) | **agree** |
| Mistakes row 4: `forge-error-code` ids include `legshape-consistency`, `allOk false` (lesson:100) | `lesson-proof/controls-first-pass-error-code-expectation.json`: `allOk false`; the case's `ids` are `["leg-no-dialog-error","no-dialog-law","legshape-consistency"]` against expected two | **agree** |
| Mistakes row 5: 5 semantic survivors named; four cases added; `eventLog.length === 18` conjunct removed, mutant replaced (lesson:101) | `lesson-proof/killpower-trial-smoke1-survivors.json`: `holds false`, survivors exactly the five names; current `pf/pf-smoke1.killpower.json`: `holds true`, 56/56 semantic killed, `M-event-log-keys-open` present and `M-event-log-open` absent; four case ids present in `scripts/negatives-dialog-r76.mjs:98,114,126,278`; counter comment `scripts/check-dialog-r76.mjs:294` | **agree**; the bracket mutants are killed by exactly their bracket case (`M-timeline-tol-0.045` → `replay-timeline-tol-in-0.049`, etc.) |
| Mistakes row 6: R75Mut1's 26 witnesses carried; R74Mut1 (IME), R73Mut1 (pinch) (lesson:102) | `.ufo/waves/round-75/w1/R75Mut1/receipts/mutants/` (A01…), `.ufo/waves/round-74/w1/R74Mut1`, `.ufo/waves/round-73/w1/R73Mut1` exist | **paths agree**; the count 26 was not re-derived (out of this seat's scope) |
| Mistakes row 7: the `prior-set-complete` race is a convention, not a check, and is routed (lesson:103) | counter walk reads only `*.json` (`scripts/check-dialog-r76.mjs:216-219`: `e.name.endsWith('.json')`), so `*.receipt.txt` is invisible to it | **agree**, and the convention is visible in the code; the lesson's honesty ("not shown able to fail in-round") stands |

## 5. Limits of this review

- Quote occurrence was checked against the staged decoded copies, not a fresh fetch; the staged
  files' sha256 match `FETCH.txt` and the SOURCES rows, so the line numbers are the tag's line
  numbers only to the extent the fetch was faithful (not re-fetched here).
- The S202 quote's "at the stated line" verdict depends on stripping the PDL comment marker `#`;
  the raw bytes do not contain the quote verbatim. If the Gate's rule requires raw-byte occurrence,
  S202's quote fails that stricter reading; the note's own S202 quote has the same property.
- Row 6's "26 witnesses" and the r73/r74 mutant inventories were not recounted.
