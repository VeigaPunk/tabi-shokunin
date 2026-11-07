# note-review — `corpus/knowledge/chromium-ime-composition-runtime-round-74.md`

Seat R74Scribe, round 74 w1. Scope: the round-74 note (86 lines) and, in `gate-review.md`, the
lesson Gate. Nothing here is an execution of Chromium: every statement was checked against the
committed receipts and the staged sources, and every check below carries the command and exit
code that produced it.

**Bottom line: no statement in the note is false. All ten rows of the measured table reproduce
exactly. Ten findings are citation precision (F1-F7) or missing measured detail (F8-F10); none
changes a conclusion.**

## 1. Method (commands, exits, inputs)

| # | command | exit | reads | result |
|---|---|---|---|---|
| M1 | `node derive.mjs` (scratch; copy beside this file) | 0 | 9× `.ufo/waves/round-74/controls/c1/smoke{1..9}.receipt.json` + `corpus/evidence/round74/chromium-ime-composition/receipt.json` | rebuilds every leg from the raw `events` array (the driver's own filter: same `leg`, `focusin`/`focusout` excluded), then compares with the receipt's `legShape` and `legs[].stateAfter` |
| M2 | `node pairs.mjs` | 0 | same 10 receipts | pairwise max abs diff of `ts`/`at`, smoke×smoke and (a)×smoke |
| M3 | `node scripts/check-imecompose-r74.mjs --receipt <copy of the (a) receipt> --expect-driver-sha256 afacee1b…dc2dc --expect-nonce tabi-r74-l1-ca30e1a3b7b2 --prior ×12` | 0 | the 12 PRE receipts named in the claim | `verdict clean`, `checkCount 148`, `findings []` |
| M4 | `node gate.mjs` | 0 | the 7 staged sources | per-quote line occurrence + word count (used in `gate-review.md`) |
| M5 | `node w04.mjs` | 0 | `corpus/SOURCES.md` at HEAD and at `8c081aa3` | replicates the census W04 rule: 25 → 27 |
| M6 | `sha256sum` of the instruments, the 7 staged sources and the S173/S174 prior copies | 0 | `digests.out` | all pins match |
| M7 | read-only `git -C tabi-shokunin show/log/rev-parse/diff/merge-base` | 0 | lane history | see §5 |

Outputs kept beside this file: `derive.out`, `derived.json`, `pairs.out`, `w04.out`, `gate.out`,
`digests.out`, `perleg-a.md`, `counter-a.json`.

## 2. Re-derivation over the 10 receipts

`node derive.mjs` → exit 0. For each receipt I rebuilt the 16-leg shape from the raw event log:
sequence, `data`, `isComposing`, `isTrusted`, target set, state after, `cdpError`. Then I compared
it field-by-field with the receipt's own `legShape` summary (6 fields × 16 legs × 10 receipts).

- **Summary vs raw: 0 mismatches in all 10 receipts.** The producer's summary is not being
  trusted; it is reproduced.
- **All 10 derived shapes are JSON-identical** (16 legs, 40 events each, same `data`, same
  `isTrusted` vector, same state after). That is the note's claim at line 54 ("identical leg
  shapes 9/9") extended to the scored receipt.
- Per receipt: `keyEvents 0`, `untrustedTypes ["compositionend"]`, `firstFocusin "compose-a"`,
  IME calls 11, `predicate true`, `failures []`, `lateAfterClose 0`.

The 9 pre-freeze receipts are 9 distinct browser launches, not copies: distinct `nonce`,
`host.launchToken`, `host.devtoolsListening.browserId`, devtools port, fixture origin,
`startedAt` 2 s apart, and a distinct `fixture.sha256` (the nonce is embedded in the fixture).
`node pairs.mjs` → exit 0:
`pairs 36 min 1 median 6.9 max 15.5`, `<=1ms: s6-s7=1`, `<0.05ms: 0`, and the scored receipt is
≥ 17.9 ms from every smoke (s1=24.6 … s9=31.4). The small pairwise distances are page-relative
timestamps (`performance.now()`/`event.timeStamp` restart at navigation), not clock equality.

### Per-leg derivation, (a) receipt (identical in all 10)

| leg | seq | data | isComposing | isTrusted | targets | state after | cdpError |
|---|---|---|---|---|---|---|---|
| start | — | — | — | — | — | f="" sel=[0,0] ce="" active=BODY | — |
| focus-f | — | — | — | — | — | f="" sel=[0,0] ce="" active=f | — |
| compose-a | compositionstart, compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "", "か", "か", "か" | null, null, true, true | T, T, T, T | f | f="か" sel=[1,1] ce="" active=f | — |
| compose-b | compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "かな", "かな", "かな" | null, true, true | T, T, T | f | f="かな" sel=[2,2] ce="" active=f | — |
| commit | compositionupdate, beforeinput(insertCompositionText), textInput, input(insertCompositionText), compositionend | "仮名"×5 | null, true, null, true, null | T, T, T, T, **F** | f | f="仮名" sel=[2,2] ce="" active=f | — |
| plain | beforeinput(insertText), textInput, input(insertText) | "ab", "ab", "ab" | false, null, false | T, T, T | f | f="仮名ab" sel=[4,4] ce="" active=f | — |
| select-f | — | — | — | — | — | f="仮名ab" sel=[2,4] ce="" active=f | — |
| compose-c | compositionstart, compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "ab", "x", "x", "x" | null, null, true, true | T, T, T, T | f | f="仮名x" sel=[3,3] ce="" active=f | — |
| replace-half | — | — | — | — | — | f="仮名x" sel=[3,3] ce="" active=f | `{"code":-32602,"message":"Either both replacement start/end are specified or neither."}` |
| cancel | compositionupdate, beforeinput(insertCompositionText), textInput, input(insertCompositionText), compositionend | "", "", "", **null**, "" | null, true, null, true, null | T, T, T, T, **F** | f | f="仮名" sel=[2,2] ce="" active=f | — |
| focus-ce | — | — | — | — | — | f="仮名" sel=[2,2] ce="" active=ce | — |
| ce-compose | compositionstart, compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "", "é"(U+0065 U+0301)×3 | null, null, true, true | T, T, T, T | ce | ce="é"(U+0065 U+0301) active=ce | — |
| ce-commit | compositionupdate, beforeinput(insertCompositionText), textInput, input(insertCompositionText), compositionend | "é"(U+00E9)×5 | null, true, null, true, null | T, T, T, T, **F** | ce | ce="é"(U+00E9) active=ce | — |
| blur | — | — | — | — | — | ce="é" active=BODY | — |
| nofocus-compose | — | — | — | — | — | f="仮名" sel=[2,2] ce="é" active=BODY | — |
| nofocus-insert | textInput, input(insertText) | "z", "z" | null, false | T, T | BODY,ce | ce="éz" sel=[2,2] active=ce | — |

Data code points checked explicitly: compose-a U+304B; compose-b U+304B U+306A; compose-c start
U+0061 U+0062 then U+0078; ce-compose U+0065 U+0301; ce-commit U+00E9.

## 3. Row-by-row check of the measured table (note lines 58-69)

| note row (line) | what the note says | derived | verdict |
|---|---|---|---|
| compose-a (60) | start(""), update("か"), beforeinput/input insertCompositionText ("か", isComposing true); f="か", caret 1 | exactly | AGREE |
| compose-b (61) | update, beforeinput, input ("かな"), no second start; f="かな" | exactly; seq has no `compositionstart` | AGREE |
| commit (62) | update, beforeinput insertCompositionText, textInput, input insertCompositionText ("仮名"), compositionend ("仮名", isTrusted false); f="仮名" | exactly | AGREE |
| plain (63) | beforeinput insertText (isComposing false), textInput, input insertText, no composition events; f="仮名ab" | exactly | AGREE |
| compose-c (64) | start data "ab" (selected text), update/beforeinput/input "x"; f="仮名x" | exactly | AGREE |
| replace-half (65) | error -32602, no events, unchanged | `cdpError {"code":-32602,…}`, zero events, same state | AGREE |
| cancel (66) | update(""), beforeinput(""), textInput, input (data null), compositionend ("", untrusted); f="仮名" | exactly; textInput data is "" and input data is `null` | AGREE |
| ce-compose / ce-commit (67) | `"e"+U+0301` then insertText "é"; same shapes in the contenteditable; decomposed composition replaced by the precomposed commit; ce="é" | ce-compose data U+0065 U+0301; ce-commit data U+00E9; ce ends U+00E9 | AGREE |
| nofocus-compose (68) | nothing, unchanged | zero events in the leg; state identical to `blur` | AGREE |
| nofocus-insert (69) | textInput (target BODY), input insertText on ce; ce becomes focused; ce="éz" | textInput target BODY value null; input target ce, value "éz", sel [2,2]; focusin ce is the next event | AGREE |

Also: "no keydown/keypress/keyup in any leg" (line 71) — 0 key-typed events in all 10 receipts
(`derive.out`). "First focusin lands in the first IME leg" (line 72) — `firstFocusin compose-a` in
10/10.

## 4. Statement-by-statement review of the sourced prose

| id | note lines | statement | evidence | verdict |
|---|---|---|---|---|
| N1 | 1 | sources S187-S193; pre-freeze receipts `smoke1..9.receipt.json` | files exist; `smoke1..9` read by every command above | AGREE |
| N2 | 2 | verified-at 2026-11-06; Chromium 155.0.8059.84; `--headless=new`; loopback fixture; 1280x900; dsf 1; mobile false | `smoke*.receipt.json` `host.chromium="Chromium 155.0.8059.84 Arch Linux"`, `host.argv` contains `--headless=new`, `fixture.viewport={"width":1280,"height":900}`, driver `Emulation.setDeviceMetricsOverride {…, deviceScaleFactor:1, mobile:false}` | AGREE (date caveat F9) |
| N3 | 3 | recheck recipe | driver usage block (`scripts/chrome-cdp-imecompose-round74.mjs:6-9`: `--scratch --out --nonce --http-port --cdp-port`); counter usage (`scripts/check-imecompose-r74.mjs:4-6`: `--receipt --expect-driver-sha256 --expect-nonce --prior`); nonce must satisfy `/^tabi-r74-[a-z0-9-]+$/` (`check-imecompose-r74.mjs:134`) and must equal `--expect-nonce` (:135) | AGREE |
| N4 | 15-18 | S187 `Input.pdl:141-162`; insertText quote; imeSetComposition params; empty-string cancel comment; both experimental | `Input.pdl:141-142` (insertText comment), `:143` experimental command, `:148-150` (comment incl. line 150), `:151` experimental command, `:152-162` (params) | AGREE |
| N5 | 19-21 | S188 1281-1359; both commands route via `GetFocusedRenderWidgetHost`, call `Focus()`, then `ImeCommitText`/`ImeSetComposition` | `input_handler.cc:1281-1304` (InsertText: redirect 1289-1295, Focus 1300, ImeCommitText 1301), `:1306-1359` (ImeSetComposition: redirect 1326-1332, Focus 1353, ImeSetComposition 1355) | AGREE with F2 |
| N6 | 21-23 | replacementStart without end refused before any renderer call; message text; "-32602, line 1345" | `input_handler.cc:1339-1348` refusal (before the closure/Focus at 1350-1358); text at 1345; `-32602` appears nowhere in the 7 staged sources (`grep -n 32602` → no match), it is the receipt's `cdpError` | AGREE with F1 |
| N7 | 23 | neither handler sends a key event | `input_handler.cc:1281-1359` contains no key-event call; measured 0 key events | AGREE |
| N8 | 29-30 | `SetComposition` (1009-1095) returns at once when no focused element (1032-1034) | `:1032-1034` exact; but 1015-1030 run first and 1028-1030 is an earlier return; function ends at 1192 (next declaration 1194) | AGREE with F3/F4 |
| N9 | 30-32 | start only when no composition; data = frame's selected text at line 1084 | `:1080-1086`; `:997-1007` builds the CompositionEvent from the argument | AGREE |
| N10 | 32-33 | `InsertTextDuringCompositionWithEvents` sends update + insertCompositionText beforeinput/input | `:436-504`: update 461, beforeinput 467-468 synchronous; `input` queued by the editor (source comment 428-436), fired at EventQueueScope end | AGREE with F5 |
| N11 | 33-34 | empty text + live composition → replaces composition with nothing, ends it (comment 1039-1053) | `:1054-1077` (`ReplaceComposition(g_empty_string)` 1062 → `:788-790` `kTextCompositionConfirm` → `:798` `DispatchCompositionEndEvent`); measured 5-event cancel leg | AGREE |
| N12 | 35-36 | `CommitText` 694-705 branch; line 700 / 704 | `:699-705` exact; function ends 717 (next declaration 719) | AGREE with F3 |
| N13 | 37-41 | `InsertText` 924-932 passes `FocusedElement()` and inserts anyway; helper returns `kNotCanceled` on null target; no-focus insertText edits at the DOM selection with no beforeinput | `:924-932`; `:947-950` is the call from `InsertTextAndMoveCaret`; `editing_utilities.cc:1767-1780`, null return 1772-1773; measured nofocus-insert leg | AGREE |
| N14 | 42-44 | start/update via `target->DispatchEvent` (393, 1004); end via `DispatchScopedEvent` (409) | `:393` (inside `DispatchCompositionUpdateEvent` 385-394), `:1004` (inside `DispatchCompositionStartEvent` 997-1007), `:409` | AGREE |
| N15 | 46-50 | `EventTarget::DispatchEvent` sets trusted (868); `DispatchScopedEvent` only sets target+queues (88-93); queue hands to `EventDispatcher::DispatchEvent(*node,event)` (76-79), which does not | `event_target.cc:868`; `event_dispatcher.cc:88-93`; `scoped_event_queue.cc:75-79`; `event_dispatcher.cc:72-80` calls `event.DispatchEvent(dispatcher)` (not `EventTarget::DispatchEvent(Event&)`); `grep -n SetTrusted` over the four staged event/IME files → `event_target.cc:856`, `:868`, `event_dispatcher.cc:175` only | AGREE with F6 |
| N16 | 50 | other callers set the flag first (175-176, simulated Enter) | `event_dispatcher.cc:159-176`: `event->SetTrusted(true);` 175, `DispatchScopedEvent` 176; only other caller in the staged set | AGREE with F6 |
| N17 | 51-52 | compositionend untrusted; every other event of the composition trusted | 10/10 receipts: 3 untrusted events each, all `compositionend`; every other event `isTrusted:true` | AGREE |
| N18 | 54 | nine pre-freeze runs, identical shapes 9/9 | §2: 9/9, and the scored receipt too | AGREE (F9) |
| N19-28 | 60-69 | the ten table rows | §3 | AGREE (F8 on cancel) |
| N29 | 71-72 | no key events; first focusin in the first IME leg | 0 key events; firstFocusin `compose-a` | AGREE |
| N30 | 72-75 | inference: `Focus()` is the first page focus; deferral of focus events unsourced | note flags it as inference; `input_handler.cc:1300/1353` sourced; no source line in S187-S193 covers document-focus deferral | AGREE (correctly labelled) |
| N31 | 79-81 | no-focus insertText sourced to "no beforeinput, insert at selection"; receiving node and later activation measured only | `:924-932` + `editing_utilities.cc:1772-1773`; `:930` `GetEditor().InsertText(text, nullptr)`; measured ce + focusin | AGREE |
| N32 | 82-83 | one build/host/headless/desktop metrics; replacementStart+end and IME spans frontier | no leg sends both replacement bounds (`scripts/chrome-cdp-imecompose-round74.mjs:202`); the handler passes an empty `ImeTextSpan` vector (`input_handler.cc:1302,1356`); `fixture.viewport` 1280x900 | AGREE |
| N33 | 83-85 | PDL names imeCommitComposition at line 149 but declares no such command; lane commits with insertText, routed to `ReplaceCompositionAndMoveCaret` | `Input.pdl:149` only occurrence, no `command imeCommitComposition`; `S189:694-705` (`ReplaceCompositionAndMoveCaret` at 700) | AGREE |
| N34 | 86 | counter reads receipts, not an execution oracle (declared limit) | `check-imecompose-r74.mjs:27-30` Limit paragraph | AGREE |
| N35 | 7-9 | "New ground … text entry through the DevTools IME commands"; insertText already driven rounds 51-53; composition never measured | `corpus/knowledge/webview2-form-journey-round-51.md:89-90` already records `Input.insertText`; no prior `corpus/knowledge/*.md` contains `compositionstart` or `imeSetComposition` (grep; only `corpus/README.md:1101`, the new registry entry) | AGREE with F7 |

## 5. Findings and proposed wording (the note is not mine to edit)

**F1 (note 21-23) — the `-32602` code is not in S188.** `grep -n 32602` over all 7 staged sources
returns nothing; the code is CDP's `InvalidParams` (CDP `protocol.pdl`, not staged) and is
*measured* — `receipt.json` `legs[replace-half].cdpError` =
`{"code":-32602,"message":"Either both replacement start/end are specified or neither."}`.
Proposed: "…refused before any renderer call: `InvalidParams` with the message '…' (S188 line
1345); the wire code `-32602` is measured in the receipt, not stated in S188."

**F2 (note 19-21) — "both commands go to the focused render widget" is unconditional in the note,
conditional in the source.** `InsertText` redirects only when `!host_->GetParent()` and the
delegate returns a host (`input_handler.cc:1290-1295`); `ImeSetComposition` redirects whenever a
delegate exists (`:1327-1332`), requires `web_contents_` (`:1314`) and `NOTREACHED()`s on a
prerendering frame (`:1319-1322`). Proposed: "both resolve the focused render widget before
calling `Focus()` (InsertText only for a parentless frame, 1290)."

**F3 (note 29, 35) — `1009-1095` and `694-705` are the mined scopes, not the function extents.**
`SetComposition` runs to 1192 (next declaration `CreateSelectionRangeForSetComposition` at 1194);
`CommitText` runs to 717 (next declaration `ReplaceTextAndKeepSelection` at 719). These are exactly
the SOURCES anchors ("decoded lines 1009-1095", "694-705"). Proposed: "`SetComposition` (mined
scope 1009-1095)", "`CommitText` (mined scope 694-705)".

**F4 (note 29) — "returns at once" skips work that runs first.** Before the focused-element check
`SetComposition` runs `RevealSelectionScope`, `UpdateStyleAndLayoutTree`, `SelectComposition` and
`UpdateStyleAndLayout` (1015-1026) and returns earlier when the visible selection is none
(1028-1030). Proposed: "returns, after selecting the composition, when there is no focused element
(1032-1034); with no visible selection it returns earlier (1028-1030)."

**F5 (note 32-33) — the `input` half of the pair is queued, not sent by that function.**
`InsertTextDuringCompositionWithEvents` dispatches `compositionupdate` (461) and `beforeinput`
(467-468) synchronously; the `input` event is generated by the editor and held by the
`EventQueueScope` (source comment 428-436, `DCHECK` 444) and fired when the scope ends. Proposed:
"sends `compositionupdate` and the `insertCompositionText` beforeinput, then edits; the `input` is
queued and fired when the scope ends."

**F6 (note 49-50) — two claims rest on absence and need the negative evidence stated.** (i) "which
does not [set trusted]": `EventDispatcher::DispatchEvent` (72-80) calls
`event.DispatchEvent(dispatcher)`, not `EventTarget::DispatchEvent(Event&)`, and the only
`SetTrusted` calls in the staged event sources are `event_target.cc:856,868` and
`event_dispatcher.cc:175`. (ii) "Other callers": in the staged set the only other
`DispatchScopedEvent` caller is `DispatchSimulatedEnterEvent` (159-176); the plural overstates a
single staged example. Proposed: "(the only SetTrusted in the staged delivery path is
`event_target.cc:868`; `EventDispatcher::DispatchEvent` is a different entry point and contains
none)" and "the one other caller in this file sets the flag itself first (175-176)".

**F7 (note 7-9) — "New ground … text entry through the DevTools IME commands" overstates
novelty.** `Input.insertText` was already measured in round 51
(`corpus/knowledge/webview2-form-journey-round-51.md:89-90`); what is new is the composition
command. Proposed: "New ground for this lane: IME composition through the DevTools protocol
(`Input.imeSetComposition`, with `Input.insertText` as the commit path) rather than key events."

**F8 (note 62, 66; addition) — a measured ordering fact the note does not state.** The queued
`input` carries a `timeStamp` slightly *earlier* than the synchronous `textInput` it follows:
`smoke3 2746.5 → 2746.4`, `smoke6 2738 → 2737.9`, `smoke8 2740.5 → 2740.4`,
`(a) 2766.4 → 2766.3` (4/10 receipts; the other 6 have no `ts` inversion). `seq` and the table
order are dispatch order and are correct; a reader can misread them as timestamp order. Proposed
one Limits sentence: "`seq` is dispatch order: the queued `input` of the commit/cancel legs can
carry a `ts` up to one 0.1 ms quantum earlier than the preceding `textInput`."

**F9 (note 2, 54; currency) — the note predates the scored receipt.** The 9 cited receipts ran
2026-11-07T02:18-02:19Z = 2026-11-06 23:18-23:19 -03:00, consistent with "verified-at
2026-11-06"; the scored receipt ran 2026-11-07T03:23Z = 2026-11-07 00:23 -03:00 and reproduces the
shape exactly (§2). Proposed: add the scored receipt as a second measurement citation, and say so
in `verified-at` (or leave the pre-freeze date and note the reproduction separately).

**F10 (note 54; addition) — the "nine runs" are nine independent launches.** A reader can check
it and should be told: distinct launch tokens / browser ids / ports / origins / start times
(§2). One clause makes the repetition claim airtight.

**No disagreement (no false statement, no unsupported leap) was found.** In particular:
- the untrusted-`compositionend` conclusion follows from the two sourced dispatch calls plus the
  absence of any `SetTrusted` in the queued path, and is measured 10/10;
- every "measured" cell equals the raw event log;
- the one explicitly labelled inference (deferred focus events) is labelled.

## 6. Limits of this review

- I did not launch Chromium. Every measurement statement is checked against the committed
  receipts; a fresh run was not needed and none was made.
- I did not re-run the battery or kill-power instruments; I read their committed summaries
  (`pf-smoke1.battery.json` 239/239 gap 0; `pf-smoke1.killpower.json` 148/148 + 26/26).
- I ran the counter only over a byte-identical copy of the scored receipt with the 12 PRE priors
  (M3, exit 0, clean, 148). I did not run it over the 9 smoke receipts myself; the committed
  `pf-smoke*.counter.json` (9× clean, 148) and my §2 re-derivation cover that ground.
- Nothing outside `.ufo/waves/round-74/w1/R74Scribe/` was written; no product, lane-root, fleet
  or sibling file was edited.
