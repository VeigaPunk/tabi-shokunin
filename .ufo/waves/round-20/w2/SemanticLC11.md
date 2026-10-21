# SemanticLC11 — round 20 final LC11 predicate/effect check

Seat: TabiR20.SemanticLC11 (leaf; no dispatch). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Revision: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Source-only, author-side, no runtime claim. Verdicts are per field; nothing is summed.

Axes: **A** predicate binding and timing · **B** callsite and callback effect (null guard, reset) · **C** source anchor and identity · **D** cross-file parity · **E** scope and sample limits · **F** prior observations.

Kept move: upstream primary-source fetch at the pinned tag, used only to classify UNRESOLVED predicate semantics. It improved A, B and E and changed no retained-source verdict. Discarded: none.

## Scope and identity

- Read: `corpus/evidence/round-20/lifecycle/decisions.json` (LC11 at lines 92–98); `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (1, 2–3, 15, 39, 42, 48–52, 64, 78, 86, 90); `SKILL.md` (2201–2237; LC11 row 2227); retained `corpus/evidence/round-20/sources/html_form_element.cc` (170–348, 635–832, 1077–1111); `corpus/SOURCES.md` (110, 114); `.ufo/waves/round-20/design.json` and `design-declared.json`.
- Retained body sha256 `8c8d6796…6916` equals the manifest, the design, and `git show 4ae99816:<path> | sha256sum`. Checkpoint blob `cd7efa45834bfce0697b06c7092f16d084c4eb55`.
- The five files (decisions.json, knowledge note, SKILL.md, retained source, design.json) are byte-identical to the checkpoint. `git --no-optional-locks diff --quiet 4ae99816 -- <four paths>` exits 0. The LC11 span 787–815 and LC12 span 818–830 are unchanged from `design-declared.json`.
- Upstream re-fetch, not admitted: Gitiles tag `154.0.8037.97` resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. Its `html_form_element.cc` reproduces `8c8d…6916`. This confirms the note's verified-at claim.

## Retained-source facts on the LC11 arm

- 720: `executing_tool = active_webmcp_tool_` (entry capture).
- 721–722: entry-time `declarative_webmcp_call`. It is used only for the `is_handling_submit_` scope (724–727), the validation callback (731–758) and `setAgentInvoked` (769–771). LC11 never reads it.
- 775–776: `should_submit = DispatchEvent(...) == kNotCanceled`. The only other assignment is 730, on the validation-failure path, which never reaches 807.
- 787–788: post-dispatch `declarative_webmcp_call = executing_tool && executing_tool->CurrentlyRunning()`.
- 790: `if (auto promise = submit_event->TakeRespondWithPromise())`. The promise arm (790–806) carries `CHECK(!should_submit)` at 794.
- 807–814: `else if (!should_submit)`. The callsite at 808–813 is `executing_tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "The site has a programming error: …")))`.
- 818–829: the should_submit arm (LC12). For a running tool after dispatch the three arms are promise, LC11 and should_submit. They are exhaustive.
- 263–266: `CallDoneCallback` returns at once if `done_callback_` is null; otherwise it runs `std::move(done_callback_).Run(result)`. 267–274: clears the running flag, the active button and the invocation id, then notifies pseudo-state.
- Writes to `is_currently_running_`: 204 (true) and 267 (false). Writes to `done_callback_`: 210 (store) and 266 (move).

## Verdicts (LC11 row, field by field)

| ID | Field (location) | Verdict | Reason |
|---|---|---|---|
| V1 | Row id and render (decisions.json:92; SKILL.md:2207, 2227; design.json:107, 134) | ENTAILED | id LC11; renders as `S100:787-815` per skillRendering; heading identical. |
| V2 | sourceId S100 (decisions.json:93; SOURCES.md:114) | ENTAILED | Registry row: same URL, tag 154.0.8037.97, commit b510e9d7…, decoded sha256 8c8d…6916. Anchor 174-328,635-842 covers 787-815. |
| V3 | Condition A: "still running after submit dispatch" (decisions.json:94; note:39; SKILL.md:2227) | ENTAILED, precision note | Predicate is `executing_tool && executing_tool->CurrentlyRunning()` at 787–788. Upstream `CurrentlyRunning()` is `is_currently_running_` (html_form_element.h:319). The object is the entry capture (720), not `active_webmcp_tool_`, which 777–786 treat as possibly null after dispatch. Naming `executing_tool` removes the ambiguity. Non-blocking. |
| V4 | Condition B: "should_submit is false" | ENTAILED | Assigned only at 730 (validation failure, which never reaches 807) and 775–776 (DispatchEvent result). The LC11 arm sits inside the dispatch branch (760–816). |
| V5 | Condition C: "TakeRespondWithPromise() returns no promise" | ENTAILED as literal | Literal predicate at 790. Upstream shows "no promise" is a union of cases (F2). The row does not claim a cause, so the row stands. |
| V6 | Entry-time predicates | ENTAILED | LC11 reads no entry-time value. The entry flag (721–722) is overwritten at 787–788 before any read on the LC11 path. Its only remaining effects are at 724–727, 731–758 and 769–771. A difference could arise only if a tool started running during dispatch (U2). |
| V7 | Callsite 808–813 | ENTAILED | `CallDoneCallback(unexpected(ScriptToolError(kToolInvocationFailed, msg)))`. `executing_tool` is non-null because 788 short-circuits on it. Code at 809; message at 810–813. |
| V8 | Outcome A: "CallDoneCallback runs with kToolInvocationFailed" | REWRITE | The call always executes, but the callback receives the error only if `done_callback_` is non-null (263–266). If null, the call returns with no effect. The row also omits the LC07 reset (267–274) that follows a delivered callback. See F1. |
| V9 | Outcome B: "the programming-error message" | ENTAILED | Literal at 810–813 and unique in the retained body. The row does not repeat the message's causal clause (F2). |
| V10 | Outcome C: "no output value is set on that path" | ENTAILED, callback-argument scope | The argument is the unexpected arm (808). Upstream `McpToolCallbackResult = base::expected<String, ScriptToolError>` (html_form_element.h:271–272). No wire or CDP claim is made or implied. |
| V11 | Span 787–815 (decisions.json:96–97; note:1, 39, 42; SKILL.md:2227) | ENTAILED | Covers the predicate (787–788), the promise arm (790–806), the LC11 arm (807–814) and its closing brace (815). The S096 registry anchor (174-328, 729-758, 818-842; SOURCES.md:110) does not cover 787–815. S100 does. |
| V12 | Quote (decisions.json:98) | ENTAILED | Literal substring of line 810. Nine words (limit 25). Inside the span. |
| V13 | Null-guard reachability on the LC11 arm | UNRESOLVED (U1) | Non-null follows from 204/210 and the only `done_callback_` writes, provided the ExecuteTool caller passes a non-null callback. That caller is outside the excerpt. This affects the guard wording only. |
| V14 | Sample limits of the row | ENTAILED | The row covers only the running, canceled, no-promise arm and claims no uniqueness. Other producers sit outside the twelve rows: validation failure (756–758, entry-gated), form reset (1101–1104, ungated), tool update and unregister (390–395 and 448–452, gated by IsHandlingSubmit), submitFromJavaScript (839–841). |
| V15 | Note:42 operative text and "not equated" caveat | ENTAILED | Matches 790 and 807. The caveat is accurate; upstream confirms the cases are separable (F2). |
| V16 | Checklist item 7 (note:64) | REWRITE | Drops "still running" and "after a canceled submit". As written, the failure class reads wider than the row; non-tool submits never reach 808. See F3. |
| V17 | Textual parity: SKILL.md:2227 vs decisions.json:94–95 vs note:39 | ENTAILED | Condition and outcome strings are byte-identical in all three. V8 applies to all three. |
| V18 | Note scope "LC11 rendering only" / "this row only" (note:1, 15, 42, 90) | REWRITE | The note cites S100 for two non-row caveats: S100:834-842 (note:50) and S100:635-682 (note:52, which only S100 covers). Registry SOURCES.md:114 says "for the lifecycle table and LC11". See F4. |
| V19 | Verified-at and recheck (note:2–3) | ENTAILED | Re-fetch reproduces `8c8d…6916` (1,740 lines). |
| V20 | "S100 = same bytes" (note:86); "same bytes as the r19 S078 body" (note:1, 15) | ENTAILED, recorded only | Same URL, tag and digest. The round-19 record shows `bodySha256` `8c8d…6916` at `corpus/evidence/round-19/validation/decisions.json:152`. The .gz was not decompressed here. |

## Findings

**F1 — REWRITE (outcome, V8).** The same wording appears in decisions.json:95, note:39 and SKILL.md:2227. Source: 263–266 (guard and callback) and 267–274 (reset). Proposed text is R1.

**F2 — prospective NOT-ENTAILED (do not write).** "respondWith was not called" is not the predicate's meaning. Upstream, not admitted, `submit_event.cc:67-92`: `respondWith` stores the promise only when `agentInvoked`, `defaultPrevented()` and `IsBeingDispatched()` all hold. Otherwise it throws and stores nothing. For example, calling `respondWith` before `preventDefault()`, or outside dispatch, reaches the same LC11 arm while the message says respondWith was not called. Upstream `submit_event.cc:94-106`: `TakeRespondWithPromise` returns nothing when the promise is empty, the script state is null, or the context is invalid. A successful take clears the stored promise. "No promise" is therefore a union of cases. The row avoids the claim; keep it out.

**F3 — REWRITE (checklist item 7, note:64).** Proposed text is R3.

**F4 — REWRITE (note scope; note:1, 15, 42, 90).** The note says S100 is used "only for the LC11 rendering", yet cites it for two non-row caveats: S100:834-842 (note:50) and S100:635-682 (note:52). The S096 anchor does not cover 635-682, so only S100 supports that citation. The registry, SOURCES.md:114, already says "extends its narrow anchor set for the lifecycle table and LC11". Proposed text is R4.

**F5 — predicate interactions (source-derived; not exercised; outside the sample; no runtime claim).**
- A form reset during dispatch: `HTMLFormElement::reset()` (1077) calls `CallDoneCallback` at 1101–1104 with no IsHandlingSubmit gate. That clears the running flag and drops `done_callback_`, so the post-dispatch predicate (787–788) is false and LC11 is not reached.
- Unregistration during dispatch: the cancel callbacks at 390–395 and 448–452 are gated by `IsHandlingSubmit()`, which is set at 725 when the entry flag holds. The running flag therefore survives, and LC11 can still call the captured `executing_tool` after the form is no longer its registered tool. The comment at 777–780 says there is no reaction when `active_webmcp_tool_` is null. The code reacts on `executing_tool`'s flag. The row's "still running" follows the code, not the comment.

**F6 — prior observations (kept; source-only does not erase them).**
- `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:37-39` recorded `Error` with an errorText identical to 810–813 concatenated, and no `output` property. This is consistent with the LC11 arm. It cannot separate the F2 cases. It is a probe, not a receipt, and stays history (note:78).
- `corpus/evidence/round-19/validation/cases/missing-required.json:12-13` is the validation path (729–758), not LC11. Untouched.

**F7 — adjacent, non-blocking (outside the three files).** `corpus/evidence/round-20/selftests/expected.json:42` describes the S100 registry anchor as declaring 787-815. The row declares 174-328,635-842, which covers 787–815, so coverage holds and the description is loose. Main runs selftests; this seat did not.

## UNRESOLVED

- **U1 (V13).** The ExecuteTool caller may pass a null `OnceCallback`. Closes by reading the ModelContext-side caller at tag 154.0.8037.97. Not retained, not fetched.
- **U2.** Whether a tool can start running during `DispatchEvent` (entry flag false, post-dispatch true). That would bypass the entry-gated `setAgentInvoked` (769–771) and the CHECK at 770. The re-entry path is not shown in the excerpt. The row makes no claim.
- **U3.** `DispatchEvent` results other than kNotCanceled. Outside the excerpt. The row makes no cause claim beyond "should_submit is false".
- **U4.** Wire or CDP mapping of the error arm. Not claimed by LC11 (S097 and S079 scope).
- **U5 (out of scope, not verified).** Done-callback re-entrancy. While the callback runs, `is_currently_running_` is still true (the reset at 267 follows 266) and `done_callback_` is already null. Race-class; not examined further.

## Proposed rewrites (main applies; this seat changed no bytes)

- **R1 — outcome (decisions.json:95; note:39; SKILL.md:2227):** "CallDoneCallback runs with kToolInvocationFailed and the programming-error message; if done_callback_ is non-null the callback receives them and the LC07 reset follows, and if it is null the call returns with no effect; no output value is set on that path."
- **R2 — condition, optional precision (decisions.json:94; note:39; SKILL.md:2227):** "executing_tool (captured at entry) is still CurrentlyRunning after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise." If applied, apply to all three files to keep design skillRendering parity.
- **R3 — checklist item 7 (note:64):** "**Programming-error path without a respondWith promise** (LC11): while the captured tool is still running after a canceled submit, kToolInvocationFailed with the programming-error message; no output value."
- **R4 — note scope (lines 1, 15, 42, 90):** replace "LC11 rendering only", "this row only" and "used only for the LC11 rendering" with "S100 is the same body read at 635-842; it anchors the LC11 row (787-815) and two non-row caveats (S100:635-682, S100:834-842); it is not an independent source."
- Do not add "respondWith was not called" to any LC11 text (F2).

## Verification performed and not performed

- Performed, read-only: sha256 of the five files, and `git show 4ae99816:<path> | sha256sum` for each; `git rev-parse` for the checkpoint and blob; `git --no-optional-locks diff --quiet`.
- Performed, upstream, not retained and not admitted (Gitiles, tag 154.0.8037.97): `html_form_element.cc` sha256 `8c8d…6916` (1,740 lines); `html_form_element.h` `68d7712b6d8fc0637e3fc434d666624e3c955d51e7448b0039bec080a43adec6` (385 lines); `submit_event.cc` `74d454db950dabcf3d3e90e2ff46a8397d421de6e5dba5814622e4d207db6853` (108 lines); `submit_event.h` `5e25a9c32805098721481c41891f3bd0d63a362831bfda1cc150b547bdcf1a8a` (98 lines); tag JSON resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. Upstream results classify UNRESOLVED items only and change no retained-source verdict.
- Not performed: no tests, selftests, `measure-c1.mjs`, build, lint, browser or runtime exercise; no edits to production, sibling repos or clones; no tool installs or updates. Scratch copies were under `/tmp/tabi-r20-w2-semlc11` and were removed after writing. Recheck: `curl -fsSL '<gitiles url>?format=TEXT' | base64 -d | sha256sum`.

Report: .ufo/waves/round-20/w2/SemanticLC11.md
