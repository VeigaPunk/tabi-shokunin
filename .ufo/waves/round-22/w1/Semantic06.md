# Semantic06: adversarial semantic review of `na-remove` (round-22 W1)

- Seat: `TabiR22.Semantic06`, reviewer, read-only. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. HEAD = baseline `5f585773258b33d2d514b00cd0b0775333578db6`.
- Scope: `na-remove` only. Raw `corpus/evidence/round-21/runtime/na-remove.json`, fixture `corpus/evidence/round-21/runtime/na-remove.html`, receipt `corpus/evidence/round-21/runtime/receipt.json` (case at lines 296-339). Compared against the round-22 API text (`.ufo/waves/round-22/w1-spec.json:3`) and the BuildOracle draft expectation (untracked, see section 3).
- Not done: no edits, no tests, builds, smokes, browser, network, REA, or installs. `.ufo/waves/round-22/measure-c1.mjs` does not exist yet (lane or BuildOracle clone), so no evaluator was run. Every prediction below is marked [INFERENCE].

## 0. Verdict

1. **Genuine bytes:** `na-remove` is **Canceled, action `remove`** (the API's "Canceled reset/remove" class). Raw, receipt, author witness, corrected note, round-22 note and draft expectation agree on every field I checked (section 2). No false positive on the genuine bytes under the draft expectation.
2. **The API text does not make that acceptance specific.** It names only the class. It does not pin errorText, output absence, page state, the response bracket, raw as the canonical source, or independent raw digests. Under the API text alone, MUT-1, MUT-3, MUT-4, MUT-5, MUT-6, MUT-7, MUT-9, MUT-11 and MUT-12 are predicted green [INFERENCE], and MUT-10 is green if the evaluator reads the receipt (section 5).
3. **Highest false-negative risks:**
   - S1-a: `Canceled` plus "tool definition was updated" is produced by form removal, toolname edits and child edits. Only page state separates them, and the API has no page-state finding.
   - S1-b: the receipt's `after.responses` is cumulative, not windowed. Any oracle that treats the receipt as the window or as the semantic source is wrong.
   - S1-c: exact errorText is not in the API text. Canceled texts share a prefix.
4. **Highest false-positive risks on genuine bytes:** strict `at` ordering (ties at ms 712051 and 712052), exact comparison of the draft `sourceHeader` with the note's first line, and any rule requiring an S100 citation on reset/remove rows.

## 1. Method and side effects

Read-only checks performed:
- Read the raw, receipt, fixture, witness, producer, corrected note, round-22 note, `corpus/SOURCES.md`, `SKILL.md`, the retained S100 body `.ufo/waves/round-21/sources/html_form_element.cc` (ranges cited below), `corpus/evidence/round-16/webmcp/protocol-domain.json:273-276`, the finalized acquisition `.ufo/waves/round-21/runtime-execution-finalized.json`, and the BuildOracle draft `.ufo/waves/round-22/clones/BuildOracle/corpus/evidence/round-22/semantic-expectations.json`.
- `sha256sum` of working-tree files; `git cat-file -p HEAD:<path> | sha256sum` for four committed files; `git rev-parse HEAD`; `git log -1`; `git ls-files` on the round-22 note and acquisition record.
- Grep of the producer for `MutationObserver|DOMNode|toolsRemoved|Audits|cancelInvocation|modelContext|getTools`: no matches.

Side effect, disclosed: one `git status --porcelain` ran in `.ufo/waves/round-22/clones/BuildOracle` without `GIT_OPTIONAL_LOCKS=0`. It may have refreshed that clone's index stat cache. No content changed.

Timestamps below are written as the last six digits of the raw `at` value (prefix `1792590`).

## 2. Derived accepted outcome (from raw; witness not used for derivation)

| Field | Raw `na-remove.json` (frame `seq`) | Receipt `receipt.json` | Author witness `.ufo/waves/round-21/final/semantic-contrast-witness.json:294-346` |
|---|---|---|---|
| Invocation | seq 10 result `invocationId 622C2C1C9C93235581AB3F8C14A14EC5`; seq 11 `toolInvoked` same; seq 15 `toolResponded` same | 301 same | `invocationId` same; `responses[0].seq` 15 |
| Frame | `C5BA845E4E29A378CAAB9A832DC2D46D` in seq 3, 5, 8, 9, 11 | not recorded | not recorded |
| Nonce | seq 9 `input.q` = `6278395f-f2f9-4082-8c53-1279cad1f220`; seq 11 input string same; seq 12/16 page nonce same; html line 5 and line 12 same | 298 same, `pageState.nonce` 324 same | `postNoncePresent: true` only |
| Pre window | seq 9 `invokeTool` 711798 to seq 12 observation 712051 = 253 ms; no `toolResponded` before seq 12; `formExists` true, `formActive` true, `value` = nonce, `focused` "go", `submits` [], `errors` [] | 303-309: 253, `responseCount` 0, `formActive` true | `preWindowMs` 253, `preResponseCount` 0 |
| Action | seq 13 `action: remove`, phase `dispatch-started`, 712051; seq 14 `action-complete`, 712052. Producer line 217: `document.querySelector('#f').remove()` | action not recorded | markers seq 13 and 14 |
| Response | seq 15, 712052: `status` "Canceled", `errorText` "Tool execution cancelled, since tool definition was updated"; no `output` key | 314-320: same three keys, no `output` | `responses[0]` identical |
| After window | seq 16 observation 712554; 712051 to 712554 = 503 ms. `formExists` false, `formActive` false, `value` null, `focused` "", `url` `http://127.0.0.1:43143/na-remove`, `submits` [], `errors` [] | 310-334: 503; `pageState` identical; one response | `afterWindowMs` 503; `postSubmits` []; `postUrl` same; no page-state fields |
| Navigation | only `Page.frameNavigated` at seq 3, 711789, before invoke | `navigations` [] | not recorded |
| Delayed or submit | mode `success`; no `respondWith` release frame; no submit event | `submits` [] | `postSubmits` [] |
| Output | none | none | none |

**Accepted outcome for `na-remove`:** class `Canceled`, action `remove`, autosubmit false, mode success. One `toolResponded` for invocation `622C2C1C…` (seq 15) with `status` "Canceled" and exact errorText "Tool execution cancelled, since tool definition was updated", no output key. Response delivered inside the post bracket (seq 13 to seq 16). Pre window silent (253 ms, count 0, form active). Post window 503 ms with form absent (`formExists` false, `formActive` false, `value` null, `focused` ""), URL unchanged, nonce echo unchanged, no submit, no error, no navigation after dispatch, not delayed.

Nothing in raw, receipt, witness, corrected note (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:37`), round-22 note (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:42`) or draft (`semantic-expectations.json`, na-remove block lines 97-107) contradicts this. The witness lacks page-state fields, so it cannot witness removal. Its `postNoncePresent` is consistent with the page-state `nonce` echo, which is read from `window.observations` (`scripts/webmcp-lifecycle-round21.mjs:189`); that global is not removed with the form [INFERENCE on how the witness field was derived].

## 3. Digest and binding checks

| Artifact | sha256 | Agreement |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-remove.json` | `e7e32f5f202a7d34262f143217bf4d370b89e1497493655259a9ecc0c6339e69` | working tree = HEAD blob = receipt `cases[na-remove].evidence.sha256` (336-337) = witness `evidenceSha256` = finalized acquisition `.ufo/waves/round-21/runtime-execution-finalized.json:32` |
| `corpus/evidence/round-21/runtime/na-remove.html` | `af61bae3898d84fd4e77825b3a40237337adc0726839eac4292ee5488d1af90f` | working tree = HEAD = raw `fixture.sha256` = finalized `:33` = draft `fixtureSha256` (line 102) |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | working tree = HEAD = finalized `receiptSha256` (`:47`) |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | working tree = HEAD blob = receipt `producer.sha256` = finalized `producerSha256` (`:13`) = draft `producerSha256` |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` | = witness `acquisitionSha256` |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` | working tree = HEAD blob |
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | `695401d76f180ebdc18569b7696be16cbe5a68aaf12b1f3f7d67d29e41eae296` | untracked (`git ls-files` empty) |
| draft `semantic-expectations.json` (BuildOracle clone) | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` | untracked (`?? corpus/evidence/round-22/`) |

Caveat: the finalized acquisition records `"measuredRevision": "uncommitted"` (`:5`), with `"revision": "1b5f449a…"` (`:3`) and reason "never a run at a future committed revision" (`:15`). The raw, html, receipt and producer bytes are committed at HEAD, so the bytes are verifiable. The tree that produced them is not reproducible from any commit.

No digest mismatch was found for `na-remove`.

## 4. Findings

Severity: S1 = a wrong outcome can be counted as semantically checked; S2 = must be closed before the count is trusted; S3 = hygiene or limit.

### S1-a. `Canceled` plus "tool definition was updated" is not a removal witness; the API has no page-state finding

- The same errorText is emitted on several trigger paths in the retained S100 body (`.ufo/waves/round-21/sources/html_form_element.cc`):
  - form removal: `RemovedFrom` (486-525), which schedules at 523 only when `insertion_point.isConnected()` (518);
  - toolname, tooldescription, tooltitle or toolautosubmit change: `AttributeChanged` (1126-1137), scheduling at 1135;
  - child change: `ChildrenChanged` (1622-1625), scheduling at 1624;
  - schema update while a tool is active: `ScheduleWebMCPSchemaUpdateIfActive` (1719-1727), scheduling at 1726.
  - Sync invalid branch (380-399, comment at 378-379 "do so synchronously", text 391-394). Async re-registration (402-407, 410-452, text 449-451).
- Other Canceled texts: reset (1102-1104, "Tool execution cancelled by a form reset") and abort (224-228, "…by abort signal").
- Discriminator present in source but not recorded: `ReportInvalidMCPFormIssueIfNeeded` returns early when the form is disconnected (330-335). A toolname removal on a connected form does report an audit issue (374-376). The producer does not subscribe to `Audits.issueAdded` (`scripts/webmcp-lifecycle-round21.mjs:180`).
- The producer observes no DOM mutation and no registry state (grep: no `MutationObserver`, `toolsRemoved`, `getTools`). The only recorded evidence that the form was removed is post-state seq 16, `formExists` false.
- The API export list (`w1-spec.json:3`: `semantic_status/semantic_output/semantic_error/semantic_timing/semantic_navigation/semantic_delayed/evidence_binding/case_set/source_binding/input_shape/revision_input`) has no page-state finding. The round-21 attack prompt for this same case (`.ufo/waves/round-21/history/w2-validation-before-bounded.json:451`) required "page state". The round-22 export list dropped it.
- The draft carries the pre block (line 105, `formExists` true) and the post block (line 106, `formExists` false, `formActive` false, `value` null, `focused` ""). That closes the gap only if the evaluator compares both and reports them under a finding.
- Predictions for MUT-4 and MUT-5 (section 5): green under the API text [INFERENCE]; red under the draft only if the post block is compared [INFERENCE].
- Closing rule: R3.

### S1-b. The receipt's `after` block is not an action window; raw must be the semantic source

- Producer `responses(through)` filters every `toolResponded` for the invocation with `seq < through`, from frame 0 (`scripts/webmcp-lifecycle-round21.mjs:209`). It is used for `preAction.responseCount` (`:210`) and for `after.responses` (`:226`). So `after.responses` includes responses that arrived before the action.
- Receipt confirms it. `auto-positive` has `preAction.responseCount` 1 (receipt line 583) and its `after.responses` lists the same Completed response (590-600). `auto-invalid` is the same (647; 654-659).
- Frames with seq between 12 and 13 are counted only in `after`. The removal call is issued at `scripts/webmcp-lifecycle-round21.mjs:217` before the dispatch frame is pushed at `:220`, so the record cannot order those frames against the removal call.
- Navigations use a different rule: `x.at >= actionAt && x.seq < post.seq` (`:226`). Submits are cumulative page state. The corrected note's window sentence (`webmcp-nonautosubmit-round-21-corrected.md:60-61`) describes only an upper seq cutoff.
- For `na-remove` the windowed and cumulative sets coincide (pre count 0), so the genuine verdict is unaffected. Any oracle that reads the receipt as the window is wrong in general.
- Predictions: MUT-6 and MUT-10 are green if the evaluator counts or reads receipt responses [INFERENCE]. MUT-8 is green if the evaluator uses receipt windows [INFERENCE].
- Closing rule: R2.

### S1-c. errorText exactness and prefix collision

- The draft pins the exact string (`semantic-expectations.json:104`). Round-22 note line 42 says "exactly". The API text does not.
- Canceled texts share the prefix "Tool execution cancelled" across reset (1104), remove (393-394, 451) and abort (227). A prefix or substring predicate accepts MUT-1 (reset text on a remove row) [INFERENCE].
- Trailing punctuation: `na-invalid-submit` and `auto-invalid` errorTexts end in ".. " (receipt 550, 658). A normalizer that strips trailing periods, if shared with Canceled rows, would accept MUT-2 [INFERENCE].
- Closing rule: R7.

### S2-a. Output on a Canceled response is not predicated

- The raw and receipt have no `output` key for seq 15 (receipt 314-320). The draft's Canceled response blocks (reset line 91, remove line 104) have no output predicate. `SKILL.md:2417` says "fixed case-specific status/output/error predicates", which the draft does not yet encode for Canceled rows.
- MUT-3 is green under the draft and API text unless key sets are compared exactly [INFERENCE]. Closing rule: R1.

### S2-b. A late or second terminal response is invisible to receipt windows

- The producer records frames until close, but the receipt sees only seq < 16. A second `toolResponded` for the same invocation at seq ≥ 17 (for example Completed with output) would not appear in `after.responses`.
- Closing rule: R2 (count over the full raw must equal exactly one for action rows). MUT-6.

### S2-c. Timing bracket, pre-silence and the seq gap

- The receipt keeps only `preAction.responseCount`. The draft's `pre.statuses: []` (line 105) is only enforceable if the evaluator derives pre statuses from raw frames.
- No stated rule checks `response.at` against `[after.start, after.end]` or requires non-decreasing `at` along seq. MUT-7.
- A response before seq 12 must not count as the action response. A response between seq 12 and 13 cannot be ordered against the removal call and must be flagged, not silently attributed. MUT-8.
- Closing rules: R4, R5.

### S2-d. Nonce and identity placeholders are unbound

- The draft uses `inputQ: "$nonce"` (line 101) and `pre.value: "$input"` (line 105). The binding source is not stated.
- Raw sources: `invokeTool` input (producer `:203`, raw seq 9), `toolInvoked` input (seq 11), page nonce and value (seq 12, 16), html nonce (lines 5 and 12). The `toolResponded` event carries no frame or tool name, so binding is by invocationId only.
- MUT-9 is green under the API text unless input-nonce equality is enforced [INFERENCE]. Closing rule: R6.

### S2-e. Digest pins cover the html only

- The draft pins `fixtureSha256` (line 102) and no raw sha. The receipt links the raw sha (336-337). The finalized acquisition pins it independently (`:32`).
- A coherent raw-plus-receipt rewrite (MUT-10) passes every link check. Only raw-derived semantics (R2) or an independent raw pin (R9) catches it.

### S2-f. False positive: strict `at` ordering

- Seq 12 and seq 13 share 712051. Seq 14 and seq 15 share 712052. A strict `at` comparison between action-complete and `toolResponded` rejects the genuine run.
- The response arrives on the `cdp` session (`producer:179-180`), while the action result comes from Playwright's `page.evaluate` path. Cross-session order is not a protocol guarantee [INFERENCE on the cause of the observed order].
- Closing rule: R4 (bracket by seq, non-decreasing `at`, no requirement that the response follow action-complete).

### S2-g. False positive risk: window bounds

- Observed pre windows: 252 minimum (na-click, na-delayed, na-reset, na-invalid-submit), 253 for na-remove. Observed post windows: 501 minimum (auto-positive), 503 for na-remove, 755 for na-delayed (receipt).
- Draft bounds of 250 and 500 pass the genuine data. Their lower bounds are structural: the producer sleeps 250 (`:207`) and 500 (`:224`) after the timestamp starts.
- Never require equality, and do not require `windowMs` to equal a sleep constant.
- Closing rule: R5.

### S2-h. False positive risk: source header comparison

- Draft top-level `sourceHeader`: "source: S101 — …receipt.json and per-case raw CDP/fixture bytes; .ufo/waves/round-21/runtime-execution-finalized.json".
- Round-22 note line 1: "source: S101 — …receipt.json and its per-case JSON/HTML; reopened 2026-10-21; retained acquisition …".
- An exact comparison fails every row. The API's "canonical note source first line S101" implies a prefix check, which passes.
- Closing rule: R8.

### S3-a. Source anchoring for `na-remove`

- The `na-remove` row cites no S100 line (`webmcp-nonautosubmit-round-21-corrected.md:37`; round-22 note `:42`; `SKILL.md:2375`, `2383`: "observation-only").
- The S100 registered anchors (`corpus/SOURCES.md:114`: `html_form_element.cc:174-328,635-842`) include the abort `CancelTool` (224-228). They exclude the removal and reset mechanisms (350-525, 1102-1137, 1622-1727).
- Citing 224-228 for `na-remove` would cite the wrong mechanism. Citing 380-396 would be out of anchor.
- Closing rule: R8. MUT-11.

### S3-b. Unrecorded CDP event: `toolsRemoved`

- `toolsRemoved` is a declared domain event (`corpus/evidence/round-16/webmcp/protocol-domain.json:273-276`).
- The removal path calls `UnregisterTool` (S100:396, 453). That this emits `toolsRemoved` is [INFERENCE].
- The producer does not subscribe to it (`:180`), so the raw cannot show unregistration. Absence must not be read as evidence against removal, and presence must not be required (the API says "no new producer claim").

### S3-c. SKILL.md conflict to scope

- `SKILL.md:1957` reads "Does navigation or unregistration cancel a pending call? … unregistration does not cancel (probe); only `cancelInvocation` gave `Canceled`". That row is unscoped.
- It conflicts with `na-remove` unless it refers to imperative AbortSignal unregistration. Round-16 `.ufo/waves/round-16/drafts/DraftNote.md:73` (D9) suggests that trigger [INFERENCE].
- The round-22 oracle must not cite `SKILL.md` for removal. Recommend scoping the row.

### S3-d. Acquisition limit

- Measured revision is "uncommitted" (finalized `:5`). Producer, raw, html and receipt bytes match HEAD. The measured tree cannot be reproduced from a commit.
- `revision_input` should record this as a limit, not as a committed-revision pass.

### S3-e. Generic after-state rules and empty focus

- A generic `value === nonce` after-state rule would reject a genuine remove (`value` null). The nonce echo (`postNoncePresent`) stays true after removal because it reads `window.observations`, not the form [INFERENCE on the witness derivation]. Per-action expectations are required.
- `focused: ""` comes from `document.activeElement?.id ?? null` (`:189`) on the body. Truthiness checks may treat "" as absent. Keep the exact value.

## 5. Mutation table (described, not executed)

Base: genuine `na-remove`. "Coherent" means raw, receipt and digest link are updated together. The draft expectation is held fixed. "Should" is the verdict required by the expectation. Predictions are [INFERENCE] until an evaluator exists.

| ID | Dimension | Minimal coherent change | Should | API text (predicted) | Draft (predicted) | Closing rule |
|---|---|---|---|---|---|---|
| MUT-1 | error | seq 15 and receipt `responses[0].errorText` = "Tool execution cancelled by a form reset" | red | green | red if equality enforced (line 104) | R7 |
| MUT-2 | error | errorText + trailing "." | red | depends on normalizer | red unless normalized | R7 |
| MUT-3 | output | add `output: {ok:true,nonce,q}` to seq 15 and receipt response | red | green | green (no output predicate) | R1 |
| MUT-4 | page state | seq 16 and receipt `pageState`: `formExists` true, `formActive` false, `value` nonce, `focused` "go"; status, error and timing untouched | red | green | red if post block compared (line 106) | R3 |
| MUT-5 | page state | as MUT-4 but `formActive` true, `value` null, `focused` "" (child-removal shape) | red | green | red (`formExists`, `formActive`) | R3 |
| MUT-6 | terminal uniqueness | add raw `toolResponded` seq 17 (after seq 16), status "Completed" with output; receipt unchanged | red | green | green if receipt-based; red if raw count | R2 |
| MUT-7 | timing | seq 15 `at` moved to …712600 (after seq 16 at …712554); receipt unchanged | red | green | green (no `at` predicate) | R4 |
| MUT-8 | pre-window | move Canceled `toolResponded` before the pre marker or into the gap 12 to 13; set `preAction.responseCount` 1; cumulative `after.responses` still lists it | red | green unless pre silence is required on action rows | red only if pre statuses come from raw or count is enforced | R2, R4 |
| MUT-9 | identity | raw seq 9 and seq 11 input `q` = `658f0668-98cc-4edb-89c2-a170fec93f00` (na-reset nonce); page nonce and value unchanged | red | green | red only if `$nonce` == `$input` equality is enforced | R6 |
| MUT-10 | source of truth | raw seq 15 to status "Completed" with output, errorText removed; receipt `responses[0]` to "Canceled" with original errorText; receipt sha link updated | red | green if receipt is read; red if raw is read | red if raw-derived | R2 |
| MUT-11 | source anchor | note `na-remove` row adds "S100:380-396" as support; first line still S101 | red | green (first-line check) | green (no source field) | R8 |
| MUT-12 | timing | receipt `after.end` and `windowMs` +9000 ms; raw unchanged | red | green | green (`maxMs` 10000) | R5 |
| MUT-13 | digest (control) | change any raw byte; leave receipt link | red | red (stale link) | red | control |

Recommended controls (not run):
- C-1: the genuine bytes must be accepted as Canceled/remove.
- C-2: re-serialize the raw with identical JSON values, update the receipt link and any acquisition pin: verdict must not change.
- C-3: recompute windows from raw markers: 253 and 503 must pass the bounds.
- C-4: `na-remove` with no S100 citation must be accepted.

## 6. Minimal API closing rules

- **R1 (output):** Completed rows: response keys exactly {invocationId, status, output}. Canceled and Error rows: keys exactly {invocationId, status, errorText}, with no `output`. Evidence: raw seq 15; receipt 314-320; `SKILL.md:2417`.
- **R2 (canonical source):** Semantics come from raw frames bracketed by markers. Receipt `preAction` and `after` must deep-equal the raw-derived values. For action rows, count all `toolResponded` for the invocation across the full raw and require exactly one. Evidence: producer `:209-210`, `:226`; receipt 583, 590-600, 647, 654-659.
- **R3 (page state):** A named finding, or part of `semantic_status`, compares pre and post `formExists`, `formActive`, `value`, `focused` and `url` to per-action expectations. `pageObservations` must deep-equal `pageState`. For remove: `formExists` false, `value` null. For reset: `formExists` true, `value` "" (draft line 93).
- **R4 (causal bracket):** Order by seq: invokeTool result (10) < toolInvoked (11) < pre marker (12) < dispatch (13) < post marker (16). Any response must have seq in (13, 16). Do not require the response to follow action-complete (14). `at` must be non-decreasing along seq.
- **R5 (windows):** Recompute `windowMs` as end minus start from raw marker timestamps. Lower bounds from the producer sleeps (250 and 500). Upper bounds stated. No equality. Response `at` within `[start, end]`, inclusive.
- **R6 (identity):** `invokeTool.input.q` == parsed `toolInvoked.input.q` == html nonce == page nonce == receipt nonce == case nonce. Resolve `$nonce` and `$input` from raw and html, never from the receipt alone.
- **R7 (errorText):** Exact byte equality for Canceled and Error rows. No prefix or substring matching. No punctuation normalization on Canceled rows.
- **R8 (source):** Note check is prefix `source: S101` only. Delete or equalize the draft `sourceHeader`. Any S100 citation must lie in 174-328 or 635-842. Reset and remove rows are observation-only and need no S100 citation. Out-of-anchor citations are failures.
- **R9 (digests):** Pin the per-case raw sha (`e7e32f5f…`) in an independent acquisition record, not only the html. Mutation tests re-pin only acquisition pins, never semantic fields.

## 7. Gaps and blockers

- No evaluator exists yet (`.ufo/waves/round-22/measure-c1.mjs` absent in the lane and in the BuildOracle clone). All predictions are unverified.
- The draft expectation is untracked in the BuildOracle clone and may change.
- The round-22 note is untracked in the lane. I checked its first line and the na-remove row only.
- Not verified: whether Chromium emits `toolsRemoved` on form removal; whether `UnregisterTool` is the emitter; cross-session event ordering in CDP.
- Not verified: whether the `SKILL.md:1957` probe concerned imperative AbortSignal unregistration. The conflict is recorded, not resolved.

Residual risk: if the evaluator implements only the API text, the attribution gap (S1-a), the receipt-as-window gap (S1-b) and the unpinned errorText and output (S1-c, S2-a) remain. L1 should exercise MUT-1, MUT-3, MUT-4, MUT-6 and MUT-10 after integration. I did not run them.
