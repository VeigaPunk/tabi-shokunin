# SourceDocsBoundary — declarative WebMCP completion, round 20 (source-only)

Seat: `TabiR20.SourceDocsBoundary`. Leaf; no subagent dispatch. Writes: this file only. No tool installed or updated. No build, test, formatter, or browser run. Nothing committed.

Scope: the Chrome "Declarative API" page (rolling) against the pinned Chromium 154 source S096. Source-scoped reading and page wording only. No runtime, capability, or page-behaviour claim.

## Verdict

1. The page is rolling and states no Chromium version. It cannot establish any 154 behaviour. Its only version marker is an aside naming Chrome 156, present in raw HTML and dropped by the reader view.
2. "User confirmation" appears in no primary text. The page says "The user must manually click **Submit** to complete the task." The editors' explainer says "without requiring the user to check it manually before submitting." S096 says "wait for the user to submit it" (lines 213-214). Third-party summaries use "user confirmation"; they are not admissible.
3. Pin verified: local S096 is byte-identical to the tag `154.0.8037.97` file (sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68278 B).
4. Four page statements differ from S096 or cannot be checked at 154: focus target, `agentInvoked` scope, `toolactivated`/`toolcancel` mapping, and the `window.ontool*` aside.

## 1. Observed facts (fetched 2026-10-21)

Page:
- Reader text: "Published: May 18, 2026, Last updated: September 25, 2026" and "Last updated 2026-09-25 UTC". No Chromium version or milestone appears in reader text.
- Raw HTML (curl) has one `<aside class="note">` after the `toolactivated`/`toolcancel` sample: "window.ontoolactivated and window.ontoolcancel are not supported from Chrome 156." The reader view drops asides.
- Body bytes differ per fetch: two consecutive curl fetches gave different sha256 values (`5d5f70bf632985bcf52698735bb74d183267cde2092e8088aaa413ff987bd6e`, `cdb3b72e8f170cdfa84160a850f1d7309334219b2d4c33ba42f1b59733fc2a0b`) at the same page stamp. A body hash is not a freshness check for this page. S085's captured hash (`cc00b2e9…`) cannot be re-derived here; freshness is limited to the page stamp.
- The string "confirm" does not occur in the reader text or the raw HTML.
- Verbatim wording used below: "The user must manually click **Submit** to complete the task." / "Add `toolautosubmit` to trigger submission and a navigation when the model invokes this tool." / "the browser brings the form into focus and populates its field" / "set to true whenever a form is triggered by an AI agent" / "you must first call `preventDefault()`" / "The resulting value is then serialized" / "fires on the `document.modelContext` once form fields are pre-filled" / "if a user cancels the agentic operation or the `reset()` method is invoked" / "If you remove either the `toolname` or `tooldescription` HTML attribute, the tool is unregistered." / "WebMCP is under active discussion and subject to change in the future."

Program scope:
- chromestatus feature 5117755740913664 (record updated 2026-09-28). Origin-trial stage 5111811472621568: desktop, Android, and WebView 149 to 156; OT id 4163014905550602241 matches the page's OT link. Extension stage 5177104164585472 (created 2026-09-28) extends desktop to 162. Stated reason: "OT feedback has suggested improvements to the API, which we are implementing." `is_released` false; Chrome status "Proposed".
- S032 (Chrome WebMCP overview, updated 2026-10-07): origin trial "from Chrome 149".
- Chrome 154 release notes (stable 2026-09-22), read in full: no WebMCP or declarative entry.
- Chrome 155 and 156 release-notes URLs: HTTP 404 at fetch time. "Not supported from Chrome 156" cannot be checked.
- Lane frontier (README:407-410) still lists "forms without `toolautosubmit`" as unexercised at runtime.

Pin:
- Local S096: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines, 68278 B.
- Tag URL `refs/tags/154.0.8037.97/.../html_form_element.cc?format=TEXT`, base64-decoded: same sha256, same size.
- Commit `b510e9d7…` is taken from the registry row and was not re-derived.

## 2. Wording boundary: page vs S096 vs editors' explainer

Explainer = S086, `declarative-api-explainer.md` at commit 51ed7565 (proposal text, not normative, not build behaviour).

| Topic | Page (rolling) | S096 at 154.0.8037.97 | Explainer (S086) | Verdict |
|---|---|---|---|---|
| Gated path | "The user must manually click Submit to complete the task." | 212-217: focus submit button (215), `PauseExecution()` (217); "wait for the user to submit it" (213-214) | "submit it manually" (51-53) | AGREE |
| Autosubmit path | "trigger submission and a navigation" | 218-220 `PrepareForSubmission`; navigation only if not stopped: validation (729-758) or handler `preventDefault` (775-776) | "without requiring the user to check it manually before submitting" (49-51) | AGREE in part; page omits that validation and handlers can stop it |
| Confirmation term | none | no "confirm" string; gating is `PauseExecution` | none | No primary source uses "user confirmation" |
| Focus target | "brings the form into focus and populates its field" | only `submit_button->Focus()` at 215; `ExecuteTool` never focuses the form (validation failure focuses the first invalid control, 609-617) | "brings the submit button into focus" (51-52) | DIFFERS: page says form; source and explainer say submit button |
| `agentInvoked` | "set to true whenever a form is triggered by an AI agent" | 721-722: true whenever a declarative tool is `CurrentlyRunning()` at submit; submitter not checked; 771 `setAgentInvoked(true)` | none | DIFFERS, untested: a user Submit on a pending no-autosubmit tool meets the same condition [INFERENCE] |
| `respondWith` | "you must first call preventDefault()" | 790-794 `CHECK(!should_submit)` on promise; 807-813 error if `preventDefault` with no `respondWith` | none | AGREE; page omits the 807-813 error |
| Result value | "The resulting value is then serialized" | 303-306 JSON for objects; 307-312 stringify failure error; 316-318 non-objects use `ToString`; 324-326 reject error | none | PARTIAL: page omits the object/non-object split and both errors |
| `toolactivated` | "fires on the document.modelContext once form fields are pre-filled" (no autosubmit qualifier) | no event dispatch in S096. S045 (154 WPT, imperative `executeTool-abort`) asserts `toolactivated` order | "once ... filled out but before it is submitted. (This presumes the absence of the toolautosubmit attribute.)" (180-182) | UNVERIFIED for declarative at 154; target object AGREE; autosubmit scope DIFFERS |
| `toolcancel` | "if a user cancels the agentic operation or the reset() method is invoked" | callbacks only: `CancelTool` "cancelled by abort signal" (224-228); reset (1101-1104); definition change (390-395, 448-451) | "When the agent cancels a tool call ..."; not fired when the site removes or renames the form (185-188) | Trigger wording differs three ways; DOM mapping UNVERIFIED at 154; S045 supports event names on the imperative path only |
| `window.*` handlers | raw aside only: "window.ontoolactivated and window.ontoolcancel are not supported from Chrome 156." | no handler attributes in S096 | none | UNRESOLVED: aside implies pre-156 support; round-16 154 probe recorded no `ontoolactivated`/`ontoolcancel` (round-16:75-76, 86) without naming the object (QUALITY 23) |
| Unregister | "remove either the toolname or tooldescription ... the tool is unregistered" | 369 validity `isConnected() && name && description`; 380-400 unregister | inserted, removed, or updated forms "create a new declarative WebMCP tool" (55-56) | AGREE for absent attributes; empty values not addressed (untested) |
| Active-state clearing | cleared on submit, agent cancel, or reset | 262-271 any callback clears; 1101-1104 reset | explainer (147-150) also lists definition change and `respondWith` resolution | AGREE; page omits definition-change clearing (448-451) |

## 3. Rolling-doc vs 154 scope

- The page is rolling: no version, no tag, no commit. S085 records "rolling page; no docs tag/commit exposed", status `queued`, used-by none in SOURCES.
- Its only version marker is a forward-dated Chrome 156 aside that could not be checked at fetch time.
- Program status: 154 sits inside the origin trial (149 to 156). The 162 extension (2026-09-28) says API changes are being implemented, so page wording may describe post-154 behaviour.
- The explainer is proposal-level; its own registry scope excludes Chromium build behaviour (S086).
- Admissible 154 support for the declarative submit and callback path: S096 only. Context only: S034/S074 (no separate `DeclarativeWebmcp` runtime feature at 154), S045 (imperative event order at the 154 tag), runtime rows from round 17 and round 19 for their named fixtures.
- Rule basis: SKILL:1999-2002 (reopen the cited source at its explicit build or revision); `corpus/knowledge/source-recheck-round-18.md:110-111` (pinned vs living/rolling); QUALITY 12 (tier A/B opened row for scope; tier C never sole support); QUALITY 14 (a dated documentation recheck does not renew a runtime observation).

## 4. Registry and rule findings (append-only corrections recommended; none made)

1. **S078 and S096 are one source.** Same URL (`refs/tags/154.0.8037.97/.../html_form_element.cc?format=TEXT`) and sha `8c8d6796…`. S096 says "supersedes S078", but S078's status is still `mined`. S078's teaches cell says "navigation submission returns an empty string"; S096 says a null String sentinel (S096:827-829). QUALITY 33: old rows stay, explicitly marked superseded. S078 needs an append-only superseded marker naming S096, and no cell may repeat the empty-string premise. S098 and S099 show the explicit-reuse convention.
2. **Round-16 negative gloss.** "no ontoolactivated/ontoolcancel" (round-16:76, 86) names no object (QUALITY 23). Its Events row rests on a probe (round-16:86). The only IDL seat-read, `model_context.idl` (round-16:87), covers `executeTool` input, and no SOURCES row covers the handler attributes (QUALITY 12, 24). Name the object by probe, or record it as an unchecked hypothesis.
3. **Counter absent.** `design.json:23` names `.ufo/waves/round-20/measure-c1.mjs`; the round-20 tree has no such file at read time. The C1 count cannot be reproduced as designed.
4. **Page hash not reproducible** (see §1). Any future page capture should retain compressed bytes and re-derive the digest from them (QUALITY 39).

## 5. Consequences for LC01-LC12 (source-scoped; untested)

- Cite S096 only. Span notes agree with `ScribeChecklist.md`: LC11 decision at 807-813; LC12 decision at 825-829.
- Do not write "user confirmation" or "manual confirmation" in any row. Use "user-gated submit (no toolautosubmit), S096:212-217".
- LC04: focus target is the submit button (215), not the form. Do not adopt the page's wording.
- LC05: "prepares submission" (`PrepareForSubmission`, 220), not "submission and navigation". Validation (729-758) and handler `preventDefault` (775-776) can stop it.
- LC06: the S096 `kToolCancelled` callback (224-228) is not the DOM `toolcancel` event. Do not merge them.
- LC12: the null String sentinel (827-829) is a Blink callback value. The round-17 lesson quotes S047 (`corpus/lessons/round-17.md:59`): the page API "returns ... or null when a navigation is triggered". That is a different layer; do not equate them.
- Third-party "user confirmation" tables and posts (web-search results 3-5 and the aggregator's "Confirmation guidance" table) are not in SOURCES and are not admissible. Do not import them.

## 6. Untested routes (not claimed)

- R1: `agentInvoked` on a user Submit during a pending no-autosubmit tool. Source predicts true (721-722, 771); untested.
- R2: presence of `window.ontoolactivated`, `window.ontoolcancel`, and `document.modelContext` handler properties at 154, flags on, with the object named.
- R3: `toolactivated` for autosubmit forms (page: no qualifier; explainer: presumes absence).
- R4: focus target for a non-autosubmit form (predicted submit button, 215).
- R5: empty-valued `toolname`/`tooldescription` (369 uses `name && description`; WTF::String truthiness is not in the lane).
- R6: Chrome 155 and 156 release notes, once published.

## 7. Method and limits

- Read: the page (reader and raw); S096 at 147-260, 260-338, 353-372, 585-633, 635-700, 699-848, 1090-1140; SOURCES rows S032, S034, S045, S078, S085, S086, S096, S098, S099 (SOURCES = `corpus/SOURCES.md`); round-16 = `corpus/knowledge/webmcp-chromium-loopback-round-16.md` lines 53-98; round-17 = `corpus/lessons/round-17.md` rows S045, S047; SKILL 37-63, 1976-2197; README 405-434; QUALITY 1-228; w1 `ScribeChecklist.md` and `ScribeMistakes.md`; chromestatus JSON; release notes 154, 155, 156; one web search, whose generated summary and third-party results were not used as evidence.
- Commands: `curl` (read-only fetch), `base64 -d`, `sha256sum`, `wc`. No file writes except this report. No commit.
- Not exercised: no browser, build, test, or CDP run. Every claim is page wording or source-scoped reading.
- Installs or updates: none.
- For Main: re-run `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` (expect `8c8d6796…6916`), and confirm the counter path at `design.json:23`.
