# Semantic10: `na-invalid-submit` adversarial semantic review

Wave `tabi-r22-w1` · lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` · baseline `5f585773258b33d2d514b00cd0b0775333578db6`.
Read-only. No edits, builds, tests, browser, network, services, or installs.

**Summary.** The acquisition for this row is internally consistent: no defect was found in the raw, the receipt, the fixture, the producer digest, or the note. The risks are on the checker side. The most important are: TM-FP1 (by code reading, the frozen summary logic would admit a response that arrives between the pre-observation and the action marker; not executed); ST-FN2 (mapping the fixture `mode` to a status would reject the true row); ER-FP1 and OU-FP1 (the written contract does not pin the exact Error text or the absence of output for this row); NV-FP2 (a null submit count is accepted on a same-document page).

**Basis and limits.** The proposed API is the written round-22 contract (`.ufo/waves/round-22/w1-spec.json` line 3; BuildOracle item line 10) and the untracked note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. At review time neither `.ufo/waves/round-22/measure-c1.mjs` nor `corpus/evidence/round-22/semantic-expectations.json` exists, in the lane or in `clones/BuildOracle`. So every expected result below is a design-level reading of the contract, marked [INFERENCE]. "Frozen" results are code readings of `.ufo/waves/round-21/measure-c1.mjs`; nothing was executed. "Witness" means the author-side `.ufo/waves/round-21/final/semantic-contrast-witness.json`.

**Terms.** FP: a checker would count or accept a row whose evidence contradicts the accepted outcome. FN: a checker would reject a row whose evidence matches it.

**Path shorthand.** `E` = `corpus/evidence/round-21/runtime/na-invalid-submit.json`; `H` = `corpus/evidence/round-21/runtime/na-invalid-submit.html`; `R` = `corpus/evidence/round-21/runtime/receipt.json`; `P` = `scripts/webmcp-lifecycle-round21.mjs` (producer); `X` = `.ufo/waves/round-21/runtime-execution-finalized.json`; `S100` = `.ufo/waves/round-21/sources/html_form_element.cc`; `F` = `.ufo/waves/round-21/measure-c1.mjs` (frozen counter). Numbers are line numbers.

## 1. Accepted outcome, derived from the raw and receipt bytes

I derived this from E and R first. I compared it with the witness and the notes afterwards.

**Accepted outcome:** `Error`, with `errorText` exactly `Form validation failed: q: Please fill out this field.. ` (the trailing space is part of the string). There is no `output` key and no submit event, and no navigation. Exactly one terminal response for the invocation falls inside the after-window and after action dispatch. The fixture label `mode:"success"` is handler configuration; it is not the expected outcome.

| Facet | Derived value | Evidence |
|---|---|---|
| Invocation | `38E3FB2410D1BD2D7DEA938A1688E885`. One `toolInvoked` and one `toolResponded` in the whole trail. | E seq 9 invokeTool L132-145 (input q = nonce, L142); seq 10 result L146-154; seq 11 toolInvoked L155-166; seq 15 toolResponded L197-207; R L533; witness L548 |
| Pre-action | value = nonce; formActive true; focused `go`; submits `[]`; errors `[]`; responseCount 0 | E seq 12 L167-183 (formActive L179, value L180); E pageObservations[0] L227-242; R L536-540 |
| Pre-window | 715781 → 716033 = 252 ms | R L536-538 equals the marker difference |
| Action | dispatch-started 716033 (seq 13, L184-190); action-complete 716035 (seq 14, L191-196) | P L218: `value=''` then `requestSubmit()`. Attestation limits in §3 |
| Response | at 716035 (seq 15); `status:"Error"` L204; `errorText` L205; no `output` key | E L197-207; R L546-552 (no output key) |
| After-window | 716033 → 716537 = 504 ms | E seq 16 L208-224; R L543-545 |
| Post state | submits `[]`; errors `[]`; formExists true; formActive false; value `""`; focused `""`; url unchanged | E L213-222; E pageObservations[1] L243-258; R L555-565 |
| Submit | none, bounded by the page observations at seq 12 and seq 16 | E L174, L215; witness L588 |
| Navigation | none. The only `Page.frameNavigated` is seq 3 (L28-53). No frame follows seq 16, so none exists through the save at P L233. R `after.navigations` is `[]` (L554). No `/landing` request in R `requests` (L686-752). | P L180, L228-233 |
| Page errors | none | E L175, L216 (pageObservations L234, L250) |
| Fixture | `<input name="q" required >` (H L3); no `toolautosubmit` (H L2); nonce echoed (H L5, L12); the respondWith branch is reachable only from the submit listener (H L7-15) | H |

Timing cross-check: the R `windowMs` values equal the marker differences (252 and 504). The witness agrees (L551-553: 252, 504, preResponseCount 0).

Digest and provenance chain, recomputed with sha256sum. Raw, fixture, receipt, execution record, and producer all equal their HEAD blobs (`git diff --quiet HEAD` on the runtime directory, `X`, `P`, and the note: exit 0). The last commit that touches raw, receipt, or execution record is `2d5eaaa3`.
- E `e7712c1b…` = R L569 = X L40 = witness L550.
- H `53058248…` = E L10 = X L41.
- R `4bc79636…` = X L21 = X L47.
- P `bc11e4d6…` = R L6 = X L13 (file on disk matches).
- X `65b52c0c…` = witness L6.

Cross-artifact agreement: round-22 note row L42; round-21 corrected note row L41 (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`); witness L546-598; R L528-571; E. All of them agree on status, errorText, absence of submit, and timing. **No acquisition defect was found for this row.**

## 2. Source check (retained S100 body, sha `8c8d6796…`)

- S100 L720-722: `declarative_webmcp_call = active_webmcp_tool_ && …CurrentlyRunning()`. The branch is keyed on the declarative tool running, not on autosubmit.
- S100 L729-730: when `ValidateInteractively()` fails, `should_submit = false`.
- S100 L733 and L749-752: text = `"Form validation failed: "` + name + `": "` + validationMessage + `". "`. For `q` this yields the recorded string, including the `.. ` ending.
- S100 L756-758: `CallDoneCallback(kToolInvocationFailed)`.
- S100 L760-772: the submit event and `agentInvoked=true` are produced only in the passing branch. That fits the absent submit here and the `agentInvoked:true` on the Completed rows.

Caveats:
- (a) [INFERENCE] The validation block serves click-initiated and `requestSubmit()` submissions alike; the function header is outside the lines reviewed. The response cannot identify the mechanism. "requestSubmit" rests on P L218 and the action label.
- (b) SKILL.md L2053-2054 ties this error class to `toolautosubmit` validation. SKILL.md L2065 prints the text as `…field.` (no `. ` suffix). Both are narrower or shorter than the source. See ER-FN1 and ST-FN1.
- (c) [INFERENCE] The mapping `kToolInvocationFailed → Error` is not in the S100 lines reviewed. It rests on the recorded status and SKILL.md L2053.
- (d) SKILL.md cites the same region as `S078` (L2053, L2065). Expectations must cite S100 and its body hash.
- (e) Line 1 of the round-22 note cites S101 only. The S100 region that supports this row is cited only in the round-21 note (L41). This is non-blocking unless round 22 makes a source claim.

## 3. Capture facts that bound what any checker can prove

- Only four CDP events are recorded in the trail: `WebMCP.toolsAdded`, `WebMCP.toolInvoked`, `WebMCP.toolResponded`, and `Page.frameNavigated` (P L180). The clearing of the field and the `requestSubmit()` call are not recorded in the trail. No check may require them.
- `frame()` stamps `Date.now()` when a frame is pushed (P L163). The `action` marker is pushed after the `page.evaluate` promise is created and before it is awaited (P L218-220). Page-side execution is therefore bracketed only by seq 12 and seq 14.
- `responses(through)` bounds only the upper sequence (P L209). `after.responses = responses(post.seq)` (P L226) therefore includes any response delivered between seq 12 and seq 13. The summary cannot tell such a response from an in-action one (TM-FP1).
- `focused` is `document.activeElement?.id ?? null` (P L189). `""` means "an element without an id". It does not identify the q input.
- `LANG: 'C.UTF-8'` (P L165) pins the English validationMessage. `R` `environment.flags` (L12-17) do not record it. Only the producer digest binds it (ER-FN2).
- "No submit" is witnessed only by the two page observations (seq 12 and seq 16). A `preventDefault`ed submit after seq 16 would leave no trace. No check may claim "no submit ever".

## 4. Risk register

Each entry gives the mutation (coherent; digest links in §5), the expected result under the contract, and the gap or frozen result.

### Status and submit
- **ST-FP1 (FP, submit evidence under Error).** Add `{agentInvoked:true,isTrusted:true,q:<nonce>,active:true,respondWith:"function"}` to E seq 16 `submits` (L215), to E pageObservations[1] (L249), to R `after.submits` (L553), and to R `after.pageState.submits` (L557). Keep the Error. Expected: red, because no submit is pinned. Gap: the stable finding list has no submit-presence finding. Frozen: green (shape and equality only; F L110, L139).
- **ST-FP2 (FP, inactive pre-state).** Set E seq 12 `formActive` (L179), E pageObservations[0] (L238), and R `preAction.formActive` (L540) to `false`. Expected: red. Note rule 2 requires an active pre-state, but nothing pins it. Frozen: green (F L139 checks consistency only).
- **ST-FP3 (FP, post-state contradicts the diagnosis).** Set E seq 16 `value` (L221), E pageObservations[1] value (L255), and R `after.pageState.value` (L563) to the nonce. Expected: red. A `valueMissing` error needs an empty value at submit time, and nothing pins it. Frozen: green.
- **ST-FP4 (FP, fixture cannot produce the diagnosis).** Remove `required` from H L3, then re-hash upward (§5). Expected: red, because the served fixture cannot raise a required-field error. Gap: there is no fixture-support finding. [INFERENCE] evidence_binding would pass after coherent re-hashing. Frozen: green (F L114-116 check path, hash, nonce, and autosubmit only).
- **ST-FP5 (FP, mechanism claim).** Change `invalidRequestSubmit` to `click` at E L6, E L188, E L195, and R L532. Expected: red, through case identity. An outcome-only checker would stay green, because a click yields the same text. "requestSubmit" would then be asserted without evidence. Frozen: red (F L112, L136).
- **ST-FP6 (FP, page exception during the action).** Add `"Uncaught Error: dummy"` to errors at E L216, E pageObservations[1] L250, and R L558. Expected: red is recommended. The contract is silent, and a page exception would be unexplained by the diagnosis. Frozen: green.
- **ST-FN1 (FN, retained-value expectation).** SKILL.md L2055 and L2091 say rejected values remain in the form. This row's post value is `""` by producer design (P L218). An expectation requiring the nonce rejects the true row.
- **ST-FN2 (FN, status from fixture mode).** The label `mode:"success"` (E L7, H L10, and F's CONFIG entry at F L16) must not map to Completed. Doing so rejects the true row.
- **ST-CTRL (control).** Change `Error` to `Canceled` with the same errorText (E L204, R L549). Expected: red (semantic_status). Frozen: green.

### Output
- **OU-FP1 (FP, output on an Error).** Add `"output":{"ok":true,"nonce":"5d25defa-672e-489d-a4cc-769ad5c9dc7f","q":"5d25defa-672e-489d-a4cc-769ad5c9dc7f"}` to E seq 15 params (after L205) and to R `responses[0]` (after L550). Expected: red (semantic_output). The round-21 note rejects "Completed implies respondWith ran" (corrected note L99-101). Gap: the contract has no Error-output rule, and the round-22 note's reject column for this row (L42) lists only conflation and a successful submit. Frozen: green (equality only).
- **OU-FP2 (ambiguous, null output).** Add `"output": null` in the same two places. Expected: red is recommended, because absence is the only shape the producer emits. Gap: the contract is silent. Frozen: green.
- **OU-FN1 (FN, null-expecting pin).** Requiring `output: null`, by analogy with the unavailable-submits convention, rejects the true row. Pin "absent".

### Error text
- **ER-FP1 (FP, status-only acceptance).** Replace E L205 and R L550 with `respondWith promise was rejected` (the na-reject text, R L362). Expected: red (semantic_error). Gap: the BuildOracle item (line 10) pins exact errors only for rejection and throw, so pinning status alone complies with the wording. Frozen: green.
- **ER-FP2 (FP, family-prefix match).** Use the auto-invalid text `Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. ` (R L658). Expected: red. A `startsWith("Form validation failed")` check would accept it. Frozen: green.
- **ER-FP3 (FP, field-name-agnostic match).** Change `q:` to `email:` at E L205 and R L550. Expected: red. A body-only regex would accept it. Frozen: green.
- **ER-FP4 (FP, normalization).** Remove the trailing space (`field.. ` to `field..`). Expected: red under the contract's "exact" wording. A trimming comparator would accept it. Frozen: green.
- **ER-FN1 (FN, prose-derived expectation).** An expectation copied from SKILL.md L2065 (`Please fill out this field.`, single period) rejects the true row. The S100 template at L749-752 yields `..`. Pin the raw bytes.
- **ER-FN2 (FN, locale).** The exact English string depends on `LANG=C.UTF-8` (P L165), which `R` does not record. A re-acquisition under another locale would be red. The round-22 note already says exact strings are "not locale-independent" (L46-47); the expectation must state the condition.
- **ER-FN3 (FN, errors required).** Requiring non-empty page errors for every Error row would reject this row, whose errors are `[]`. The reject and throw rows do have errors (R L386-388 and L448-450), so the rule is not universal.

### Timing
- **TM-FP1 (FP, response between pre-observation and action dispatch).** Move the `toolResponded` frame (E L197-207) to a new seq 13 with `at` 1792590716033. Renumber old 13 to 14 and old 14 to 15. Seq 16 is unchanged. The receipt is unchanged: responseCount counts seq < 12, which gives 0; `after.responses` counts seq < 16, which gives 1. Expected: red (semantic_timing: the response must follow the action-dispatch marker). Gap: the contract says "sequence" but does not state this order. Frozen: green [INFERENCE: F L124-126 require only seq > toolInvoked; F L136 orders markers only; F L139 uses seq < pre and seq < post]. This is the sharpest timing hole.
- **TM-FP2 (FP, late response with empty in-window summary).** Swap seq 15 and seq 16. The after-observation becomes seq 15 (`at` 716537). The response becomes seq 16 with `at` 1792590716600. Set E pageObservations[1].seq to 15 and R `after.responses` (L546-552) to `[]`. Expected: red. The round-21 note says a response missing from a finite window "is not a proof that it can never arrive" (L51-52), but this row cannot assert Error without an in-window terminal response. Frozen: green. The frozen selftest pins this shape as `late-response-outside-window`, exit 0, value 12 (`.ufo/waves/round-21/fixtures/expected.json` L160).
- **TM-FP3 (FP, second terminal response after cutoff).** Append a seq 17 `toolResponded` for `38E3…` with `status:"Completed"`, an output object, and `at` 1792590716700. Leave R unchanged. Expected: red (one terminal response per invocation across the trail). Gap: no such rule in the contract. Frozen: green (F L139 uses seq < post only).
- **TM-CTRL (control, timestamp drift).** Set seq 15 `at` to 1792590716600 and keep the sequence. Expected: red (order). Frozen: red (F L118). Keep this control.
- **TM-FN1 (FN, strict ordering).** The equal `at` values are real: 716033 for seq 12 and 13, and 716035 for seq 14 and 15. A strict `<` check rejects the true row. Use sequence as the primary order and non-strict time.
- **TM-FN2 (FN, nominal durations).** The actual windows are 252 and 504 ms (R L538, L545). Pinning the sleep constants 250 and 500 rejects the true row. Frozen checks floors only (F L138).
- **TM-FN3 (FN, transplanted auto-invalid rule).** `auto-invalid` legitimately has a pre-window response (R L647, responseCount 1). This row's count is 0 (R L539), so requiring the auto pattern rejects it.

### Navigation and submits
- **NV-FP1 (FP, navigation not checked).** Make a coherent form-GET navigation. Insert `Page.frameNavigated` with url `http://127.0.0.1:43143/landing?q=<nonce>` as seq 15, and renumber the response to 16 and the after-observation to 17. In E pageObservations[1], set url to the landing URL, formExists to false, and value to null. In R, set `after.navigations` (L554) and `after.pageState` (L559, L561-564), and add a `GET /landing?q=<nonce>` entry to `requests`. Expected: red (semantic_navigation, and status). Frozen: green (navigation equality, F L139).
- **NV-FP2 (FP, null submits on a same-document page).** Delete `submits` from E seq 16 value (L215) and E pageObservations[1] (L249). Set R `after.submits` (L553) to `null`, and delete R `after.pageState.submits` (L557). Expected: red. `null` means unavailable after navigation, which is the contract's wording for na-native-submit. Here formExists is true, the url is unchanged, and zero submits are observed. Frozen: green (F L110 checks present keys only; F L139 maps absent to null).

### Binding and design
- **DB-1 (self-referential digest).** Any coherent raw, receipt, or fixture mutation changes `X` (`65b52c0c…`), which the witness uses as `acquisitionSha256` (L6). If expectations pin that hash, every mutation goes red for a stale hash rather than for semantics. Pin per-case semantics and the producer digest. Treat the acquisition digest as derived.
- **DB-2 (provenance).** Execution `argv[3]` is `.ufo/waves/round-21/runtime-finalized-candidate` (X L6-11), but the artifacts are canonical (X L20-46). The round-21 note documents the rename (L54-55). Strict argv equality would reject a valid acquisition. Treating argv as identity ignores the documented rename.
- **DB-3 (revision triple).** Execution `revision` is `1b5f449a…` (X L3). `measuredRevision` is `"uncommitted"` (X L5). The witness revision is `2d5eaaa3…` (witness L3). HEAD is `5f585773…`. The raw blobs were last committed at `2d5eaaa3`. `revision_input` must bind blob identity at FULL40HEXREV, not `execution.revision`.
- **DB-4 (synthetic positive).** `.ufo/waves/round-21/fixtures/positive-ordered.json`, embedded receipt, row `na-invalid-submit`: `responses []`, `after.pageState.value` equal to the nonce, `formActive` true, no url, and `invocationId "invocation-09"`. The round-21 note calls the structural positive "deliberately structural and all-silent … not a semantic oracle" (corrected note L78-80). Any round-22 control built on it must be red with value 0.
- **DB-5 (no window bound).** Window length has no upper bound. Floors exist only in the frozen counter (F L138). Low.
- **DB-6 (gate absence).** The contract says "missing new expectations and note means baseline0" (w1-spec line 3), which exits 0. Deleting both files returns exit 0 with verdict baseline. That must not read as clean. Low.

## 5. Digest links that every mutation must update
- Raw edit: E → R L569 → X L40 and L21 → X L47 → DB-1.
- Receipt edit: R → X L21 and L47 → DB-1.
- Fixture edit: H → E L10 → R L569 → X L41, L40, L21, L47 → DB-1.
- Producer or note edits are out of scope for this row.

## 6. Spec gaps (missing pins in the written contract; none is a new check)
- G1. Exact errorText for invalid-submit. The BuildOracle item (line 10) lists only rejection and throw. → ER-FP1.
- G2. Error rows carry no output. → OU-FP1, OU-FP2.
- G3. A terminal response must follow the action-dispatch marker in sequence. → TM-FP1.
- G4. One terminal response per invocation across the whole trail. → TM-FP3.
- G5. Finding names for submit presence, fixture support, pre-active state, and page errors. The stable list (w1-spec line 3) has none of them. → ST-FP1, ST-FP2, ST-FP4, ST-FP6.
- G6. Cutoff rule: sequence primary, time non-strict, window bounds unspecified. → TM-FN1, DB-5.
- G7. "Unavailable submits null" needs the navigation condition (BuildOracle item, line 10). → NV-FP2.
- G8. Provenance rules for the argv rename and the revision triple. → DB-2, DB-3.
- G9. Expectation text must copy raw bytes, not SKILL prose or abbreviations. → ER-FN1.
- G10. Source binding for this row. The round-22 header cites S101 only. → §2(e).

## 7. Limits and verification gaps
- Nothing was executed. Expected results are design-level readings of the written contract, and frozen results are code readings. Recheck every entry when `measure-c1.mjs` and `semantic-expectations.json` exist.
- Not verified: the Chromium focus behaviour behind `focused: ""`; the `kToolInvocationFailed → Error` mapping; S100 lines outside 699-773; and the working-tree changes to root `LOG.md` and `SCORECARD.md`, which are out of scope and were not read.
- Expectation independence is authorial. This review derived the outcome from bytes, but it cannot authenticate the producer or the observer.
- Tools used: read, grep, glob; bash for `sha256sum`, read-only git (`diff --quiet`, `ls-files`, `log`, `cat-file -t`), and read-only JSON and Python queries. No installs or updates were performed.

Report: `.ufo/waves/round-22/w1/Semantic10.md`
