# AttackOutputArray — round-22 w1

Scope: attack the planned shared oracle/debt design for (A) the native landing output, array vs object, and (B) old-document `submits` after navigation, null vs empty. Read-only. No tests, builds, linters, browser, network, or installs.

Planned artifacts were absent at read time: `.ufo/waves/round-22/measure-c1.mjs` and `corpus/evidence/round-22/semantic-expectations.json`. Findings are against the retained round-21 bytes, the frozen round-21 counter and selftest, the planned contract text, and the draft `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. Private clones were not opened.

"Coherent" below means: raw case JSON, frames, pageObservations, receipt case, receipt digest, and execution artifact digests are all rewritten, as `.ufo/waves/round-21/selftest-c1.mjs:184-193` does. Only the semantic field changes.

## Verdict

1. **Retained bytes are internally consistent.** Producer sha `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` equals `receipt.producer.sha256` and the frozen pin `PRODUCER_SHA` (`.ufo/waves/round-21/measure-c1.mjs:31`). The current producer writes `submits: Array.isArray(post.value.submits) ? post.value.submits : null` (`scripts/webmcp-lifecycle-round21.mjs:226`). Receipt `na-native-submit` has `submits: null` (`receipt.json:215`). No current defect in these bytes.
2. **The frozen structural counter admits coherent mutations of both fields.** It has no output-content check at all. Its only submits rule is "summary equals raw; null when raw lacks an array", plus an action-name exemption (`measure-c1.mjs:137`). Its own positive control `unavailable-null-positive` runs on `r.cases[0]`, which is `na-pending` (`selftest-c1.mjs:22`, `:62-68`). That fixture has the nonce present and zero navigations. The control is pinned clean at `fixtures/expected.json:155`. That positive is semantically wrong and must not be ported.
3. **Source settles the native shape for Chromium 154.0.8037.97.** On the cross-document path the output is a JSON array of every valid, non-empty `application/ld+json` value in document order. Zero valid blocks give `[]`. An object cannot arise on that path. The bridge bytes are retained inside S042 but sit outside S042's registered anchors.
4. **Required rules:** exact parsed-value equality per case; output presence keyed to status; three-state submits (array / null-unavailable / key absent); no `??[]`, `castArray`, `.length`, or count normalization; literal expectations, never receipt-derived ones.

## 1. Retained facts (read, jq-projected, sha256-checked)

| case | action | response | after.submits | post pageState has `nonce` | navigations | pageState.value |
|---|---|---|---|---|---|---|
| na-pending | none | none | `[]` (receipt.json:39) | yes (:42) | 0 | nonce string |
| na-click | click | Completed, object `{ok,nonce,q}` | `[1]` | yes | 0 | nonce |
| na-requestsubmit | requestSubmit | Completed, object | `[1]` | yes | 0 | nonce |
| **na-native-submit** | submit | Completed, **array `[{"dummy":"landing"}]`** (receipt.json:208-212) | **`null`** (:215) | **no** | **1** (:216-237; url :221) | **null** (:243) |
| na-reset | reset | Canceled, errorText, no output key (:273-274) | `[]` (:277) | yes (:280) | 0 | `""` (:287) |
| na-remove | remove | Canceled, errorText, no output key | `[]` | yes | 0 | **null** |
| na-reject | requestSubmit | Error, errorText, no output key | `[1]` | yes | 0 | nonce |
| na-throw | requestSubmit | Error, errorText, no output key | `[1]` | yes | 0 | nonce |
| na-delayed | requestSubmit | Completed, object | `[1]` | yes | 0 | nonce |
| na-invalid-submit | invalidRequestSubmit | Error, errorText, no output key | `[]` | yes | 0 | `""` |
| auto-positive | none | Completed, object | `[1]` | yes | 0 | nonce |
| auto-invalid | none | Error, errorText, no output key | `[]` | yes | 0 | `"not-an-email"` |

Invariants observed across all 12 cases:
- Post-observation keys `{nonce, submits, errors}` are present together in 11 cases and absent together only in `na-native-submit`. Its raw post value keys are `focused, formActive, formExists, secureContext, url, value` (`na-native-submit.json:243-250`, `:274-281`).
- Completed responses carry exactly `{invocationId, status, output}`. Canceled and Error responses carry exactly `{invocationId, status, errorText}`.
- `na-native-submit` navigation: `type: "Navigation"`, url `http://127.0.0.1:43143/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4` (`receipt.json:221`; `na-native-submit.json:197-222`, url at :206). The nonce appears only in the URL query.
- Pre-action submits are `[]` for `na-native-submit` (`na-native-submit.json:174`, `:260`). This does not imply a post value.
- Digests: `na-native-submit.json` sha `28a20412…b5`, equal to `receipt.json:249`. `na-native-submit.html` sha `c95abb9c…86`.

## 2. Source facts (retained bytes; not runtime-verified beyond this one fixture)

Decoded-sha checks performed: S042 bytes `.ufo/waves/round-19/w1/SrcCdpToolResponded.model_context.cc.gz` = `474083d6…8823`, equal to `corpus/SOURCES.md:56` (S042). Emitter bytes `.ufo/waves/round-19/w1/SrcCdpToolResponded.agent.cc.gz` = `1cc55ef9…8475`, equal to the `SrcCdpToolResponded.md:10` table. The PDL sha is as recorded at `SrcCdpToolResponded.md:9`; I did not recompute it.

- **`ComputeScriptToolResult`, S042 bytes :146-181.** Builds `[` … `]`. Iterates `HTMLScriptElement` descendants of the document. Keeps only `type == "application/ld+json"` with non-empty `textContent` (:153-161). Parse uses `ParseJSONWithCommentsDeprecated`. On failure it logs and skips (:163-169). Appends `parsed->ToJSONString()`, comma-separated (:171-176). Zero valid blocks give `[]`.
- **Cross-document emit, S042 bytes :651-682.** `GetCrossDocumentScriptToolResult` computes the array in the new document and calls `probe::WebMCPToolResponded` (:654-657). `DidFinishParsing` does the same for queued callbacks (:677-680).
- **Null gate, S042 bytes :728-734.** `if (!result->IsNull())` emits the response. A null String suppresses it, because the new document handles the response (comment :729-731). An empty String would not be null and would emit. Null versus empty is control flow here, not a value type.
- **Stale comment, S042 bytes :686-694.** Says "a `<script>` with the agent response type", singular. The code at :146-181 aggregates all `application/ld+json` scripts. Treat the code as authority.
- **Same-document path, S042 bytes :856-872.** `OnToolExecuted` forwards the respondWith value unwrapped (:864-866). A respondWith object is never array-wrapped on this path.
- **Emitter, `SrcCdpToolResponded.agent.cc.gz` :208-218.** Completed: `toolResponded(id, Completed, ParseJSON(result))`. :220-244, failure: Canceled or Error with output `nullptr` (:241-243). Canceled and Error therefore carry no output on the wire.
- **PDL, `corpus/evidence/round-19/sources/WebMCP.pdl.gz` :116-118.** ":116 Missing if `status` is anything other than Completed." ":118 `optional any output`." Arrays and objects are both protocol-legal. Absence is required for non-Completed.
- **Outside registered anchors.** S042's registered anchors are `model_context.cc:528-580, 748-811, 856-873` (`corpus/SOURCES.md:56`). Ranges 146-181, 651-682, and 684-746 are outside them.
- **Proposal text, not implementation.** `.ufo/waves/round-19/w1/SrcDeclExplainer.md:24` quotes explainer lines 117-133: "on navigation, first JSON-LD script is the response". Chromium 154 does not implement "first".
- **Round-17 two-block control, outside the 12 cases, not credited.** `corpus/evidence/round-17/webmcp-invoke/receipt.json:8400-8408` gives `[{"result":"round17-nav","ok":true},{"second":1}]`, from `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-decl-result.html:4,9`. The r17 expectation is `scripts/webmcp-invoke-round17.mjs:1803`. This is consistent with the source and is not round-22 evidence.

Consequences for the oracle:
- On the native path output is always a JSON array. A bare object there is a mismatch.
- Expected length = count of valid non-empty ld+json values (:158-169), not DOM count. Invalid blocks are dropped silently.
- Output is re-serialized (`ToJSONString`), so compare parsed values, not script text or raw bytes.
- Non-Completed must lack `output`. Completed may carry any JSON type, including null in principle; no retained case shows that.

## 3. Counterexamples (each is a coherent mutation of retained bytes)

Frozen verdict column refers to `.ufo/waves/round-21/measure-c1.mjs`. Its FINDINGS list (`:33`) has no output or semantic id. A case-insensitive grep for `output` matches only `maxOutputLength` (`measure-c1.mjs:79`, a gunzip size limit); no response-output check exists.

**C1 — native output collapses to object.** Mutate `na-native-submit.json:231-235` and `receipt.json:208-212` from `[{"dummy":"landing"}]` to `{"dummy":"landing"}`. Relink digests.
- Frozen: admitted. Correlation is by invocationId only (`:124`). Summary is compared to raw only (`:139`). No output check.
- Expected: `semantic_output` on `na-native-submit`, code `native_output_not_one_element_array`. Summary-only edit (receipt only) gives `evidence_binding` instead.

**C2 — native output empty.** Replace with `[]`. Same admission.
- Expected: `semantic_output`, same code. The fixture has one valid block.

**C3 — native output duplicated.** Replace with `[{"dummy":"landing"},{"dummy":"landing"}]`.
- Frozen: admitted.
- Expected: `semantic_output`, same code (cardinality).

**C4 — native output string-encoded.** Replace with `"[{\"dummy\":\"landing\"}]"`.
- Frozen: admitted.
- Expected: `semantic_output`, code `native_output_type_drift`. Not realizable on this path, since the builder always yields JSON. Use as a wire-type-drift negative only.

**C5 — native output respondWith-shaped.** Replace with `{"ok":true,"nonce":"8a5839ad-fc49-4ed6-8661-501aa2c5c4a4","q":"8a5839ad-fc49-4ed6-8661-501aa2c5c4a4"}`, the na-click shape.
- Frozen: admitted.
- Expected: `semantic_output`, code `respondwith_shape_on_navigation`. The native mechanism is navigation, not respondWith.

**C6 — respondWith output array-wrapped (other direction).** `na-click` output becomes `[{"ok":true,"nonce":"d57a9461-7725-447a-94ee-5031820695a6","q":"d57a9461-7725-447a-94ee-5031820695a6"}]`. Source: the same-document path forwards the serialized value unwrapped (S042 :864-866).
- Frozen: admitted.
- Expected: `semantic_output` on `na-click`, code `respondwith_wrapped_in_array`. Any `Array.isArray`-generic rule accepts this; per-case literals reject it.

**C7 — Completed output removed.** Delete `output` from `na-click` response (raw and receipt).
- Frozen: admitted (`:139` equal).
- Expected: `semantic_output`, code `completed_without_output` (PDL :116).

**C8 — non-Completed gains output key.** `na-reset`: add `"output": null` to the response at `na-reset.json:201-206` and `receipt.json:270-276`.
- Frozen: admitted. No key-set check.
- Expected: `semantic_error`, code `nonterminal_output_key_present`. Source: failure path passes `nullptr` (agent.cc :241-243).

**C9 — fabricated zero after navigation (the regression guard for `|| []`).** `na-native-submit`: add `"submits": []` to the after-action observation at `na-native-submit.json:243-250` and `:274-281`, to `receipt.json:238-245` pageState, and set `receipt.json:215` from `null` to `[]`.
- Frozen: admitted. Line 110 accepts an array. Line 136 equality holds because both sides change. Line 137 exempts `c.action==='submit'` from the post-nonce check. Line 139 holds.
- Expected: `semantic_navigation`, code `old_document_submits_observed_as_zero_after_navigation`. Summary-only edit gives `evidence_binding`.
- C9b variant: add `"nonce"` to the native post observation instead. Frozen: admitted by the same exemption. Expected: `semantic_navigation`, code `old_document_identity_after_navigation`.

**C10 — observable state reported unavailable (the round-21 positive control, reproduced).** `na-pending`: delete `submits` from the after-action observation and from `receipt.json` pageState, and set `receipt.json:39` to `null`. This is `selftest-c1.mjs:62-68` applied to `first=r.cases[0]`.
- Frozen: CLEAN. `fixtures/expected.json:155` pins `exit 0, value 12` for this mutation.
- Expected: `semantic_navigation`, code `observable_submits_reported_unavailable`. `na-pending` keeps the nonce (`receipt.json:42`) and has zero navigations. The correct value is `[]`.

**C11 — observable state erased on same-document reset.** `na-reset`: delete `submits` from the frame at `na-reset.json:213-223` (submits at :215), from the after pageObservation at :247-257 (submits at :249), and from `receipt.json` pageState (:281). Set `receipt.json:277` to `null`. Keep the nonce.
- Frozen: admitted. Line 110 permits absence; line 139 expects null when absent.
- Expected: `semantic_navigation`, code `observable_submits_reported_unavailable`.

**C12 — identity lost without navigation.** `na-reset`: remove `nonce`, `submits`, `errors` from post observation and pageState.
- Frozen: RED, `case_identity:page echo` (`:137`, action is not submit). Keep this. The new oracle must also go red without relying on action name.
- Expected: `semantic_navigation`, code `identity_lost_without_navigation`.

**C13 — response placement and cardinality (native).**
- (a) Add a second `WebMCP.toolResponded` for the same invocationId inside the window. Expected: `semantic_status`, code `terminal_response_cardinality`.
- (b) Renumber so the Completed response precedes the `Page.frameNavigated` frame (seq 15). Frozen: admitted, since `:118` and `:136` do not constrain navigation versus response order. Expected: `semantic_navigation`, code `array_response_precedes_navigation`. This ordering is source-derived (S042 :728-734: the old document suppresses; the new document emits after commit). Not separately instrumented [INFERENCE].

## 4. Design hazards for the planned oracle (no artifact needed)

- **H1.** `Array.isArray(output)` alone admits C2 and C3. Require deepEqual on the parsed value, length 1, element deepEqual `{dummy:'landing'}`.
- **H2.** Normalizers (`[].concat(x)`, `castArray`, `output.length===1 ? output[0] : output`) collapse C1 onto the expected array, or the reverse. Forbidden.
- **H3.** `submits ?? []`, `(submits||[]).length`, `submits?.length ?? 0`, or jq `.after.submits|length` make null equal to `[]` or `0`. Verified here: `jq -n 'null|length'` → `0`. Use `Array.isArray` and `Object.hasOwn` instead.
- **H4.** `pageState.value === null` is not an unavailability proxy. `na-remove` has `value: null` with nonce present, `submits: []`, and zero navigations. A rule "value null ⇒ submits null" false-reds that positive.
- **H5.** Native nonce binding. The landing page has no window nonce, and its output is static (`scripts/webmcp-lifecycle-round21.mjs:137`). Requiring `pageState.nonce === case nonce` or the na-click predicate `output.nonce === case nonce` false-reds P1. Bind by the Page.frameNavigated URL query `q` plus invocation correlation.
- **H6.** Copying the `c.action!=='submit'` exemption from `measure-c1.mjs:137` lets C9 pass. Key "cross-document expected" on a per-case literal, true only for `na-native-submit`.
- **H7.** Derived invariants computed from the evaluated raw ("nonce absent ⇒ submits null") are self-consistent under C9–C12 relinking. This violates the independence rule. Expectations must be literals in `semantic-expectations.json`.
- **H8.** Text equality is wrong. Output is parsed with comment tolerance and re-serialized (S042 :164-175). Compare parsed JSON.
- **H9.** Expected length is parse-derived (valid, non-empty, S042 :158-169), not DOM-counted.
- **H10.** Frozen convention: any finding gives value 0 and exit 1 (`measure-c1.mjs:143`; `expected.json` pattern). Do not emit value 11 for partial failure; that reads as credit.
- **H11.** Draft wording at `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:36` says "containing the landing JSON-LD object" and "/landing with case nonce". Both invite H2 and H5. Reword: one-element array whose element is the parsed sole valid `application/ld+json` block of this fixture; nonce appears only in the navigation URL `q`.

## 5. Bounded preserving positives (must stay green)

- **P1 — `na-native-submit`, unmodified: zero findings.** Status Completed. Exactly one response for the invocation. Output deepEqual `[{"dummy":"landing"}]`. `after.submits === null` with the key present (`receipt.json:215`). pageState keys exactly `{url, secureContext, formExists, formActive, value, focused}` (`:239-244`). Exactly one Navigation to `/landing` with `q` equal to the case nonce. Pre-action `[]` (`na-native-submit.json:174`, `:260`) stays valid and does not imply a post value.
- **P2 — `na-pending`, unmodified.** `after.submits` deepEqual `[]` with nonce present and zero navigations (`receipt.json:39`, `:42`). This is the observed-zero positive that C10 must fail.
- **P3 — `na-reset`, `na-remove`, `na-invalid-submit`, `auto-invalid`.** `submits: []` with nonce present. Responses exactly `{invocationId, status, errorText}`. Exact errorText strings: reset "Tool execution cancelled by a form reset" (`na-reset.json:205`); remove "Tool execution cancelled, since tool definition was updated"; invalid "Form validation failed: q: Please fill out this field.. " (trailing space). `na-remove` with `pageState.value: null` must stay green (H4).
- **P4 — `na-click`, `na-requestsubmit`, `na-delayed`, `auto-positive`.** Completed, output a non-array object with nonce echo equal to the case nonce. The oracle must accept object for these and array only for `na-native-submit`, via per-case literals.
- **P5 — coherent re-serialization** (same parsed values, different bytes, digests relinked) gives zero findings. The oracle compares parsed values.
- **P6 — round-17 two-block array** is not credited. Cite only as a source-consistency control (two blocks → two elements).

## 6. Stable finding map and verdict rule

| family | finding id | code |
|---|---|---|
| native output shape (C1–C5) | semantic_output | native_output_not_one_element_array / native_output_type_drift / respondwith_shape_on_navigation |
| respondWith wrapper (C6) | semantic_output | respondwith_wrapped_in_array |
| Completed without output (C7) | semantic_output | completed_without_output |
| non-Completed output key (C8) | semantic_error | nonterminal_output_key_present |
| fabricated zero / identity (C9, C9b) | semantic_navigation | old_document_submits_observed_as_zero_after_navigation / old_document_identity_after_navigation |
| observable reported unavailable (C10, C11) | semantic_navigation | observable_submits_reported_unavailable |
| identity lost, no navigation (C12) | semantic_navigation | identity_lost_without_navigation |
| terminal cardinality (C13a) | semantic_status | terminal_response_cardinality |
| response before navigation (C13b) | semantic_navigation | array_response_precedes_navigation |
| summary-only divergence (any) | evidence_binding | summary_raw_divergence:<field> |
| summary `submits` key absent | input_shape | summary_submits_key_absent |

Rules: semantic checks read raw frames as primary evidence. Summary disagreement is reported as `evidence_binding`. Any finding gives exit 1 and value 0. No findings give exit 0, and value 12 only if all twelve rows pass. Findings are sorted by (case id, finding id).

Literal expectations, illustrative (for BuildOracle to encode, not a receipt-derived value):

```json
{
  "na-native-submit": {"status":"Completed","output":[{"dummy":"landing"}],"responseCount":1,
    "crossDocumentNavigations":1,"navigationPath":"/landing","navigationQuery":{"q":"<case nonce>"},
    "oldDocumentSubmits":"unavailable","oldDocumentKeys":[]},
  "na-pending": {"responseCount":0,"crossDocumentNavigations":0,"oldDocumentSubmits":{"observed":[]}},
  "na-reset": {"status":"Canceled","errorText":"Tool execution cancelled by a form reset",
    "outputKey":"absent","crossDocumentNavigations":0,"oldDocumentSubmits":{"observed":[]}},
  "na-click": {"status":"Completed","outputShape":"object","output":{"ok":true,"nonce":"<case nonce>","q":"<case nonce>"}}
}
```

## 7. Debt and history needing append-only correction (do not edit frozen files)

- **D1. Stale historical finding.** `.ufo/waves/round-21/w1/ReviewNavigation.md:7-11` says `after.submits` is set to `post.value.submits || []`, citing producer lines 140-146 and 178. Current producer has `Array.isArray(...) ? ... : null` at :226, and observe at :189. The receipt producer sha equals the current file. Record as fixed before receipt. Keep C9 as the regression guard.
- **D2. Wrong control in the lesson.** `corpus/lessons/round-21.md:112` records "positive-null green, negative-empty … red". The green positive is on `na-pending` (C10 pattern), the wrong case. The red negative `unavailable-to-empty` (`expected.json:156`) is a raw/summary incoherence, not a semantic test. Correction: the null positive applies only to `na-native-submit`. Add coherent C9, C10, C11 as negatives.
- **D3. Output-shape history disagrees.**
  - `corpus/knowledge/webmcp-nonautosubmit-round-21.md:35`: "JSON-LD array" (no elements).
  - `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:35`: "array containing … JSON-LD object" (singular).
  - `corpus/knowledge/webmcp-completion-lifecycle-round-20.md:79`: "JSON-LD result".
  - `SKILL.md:2419`: "JSON-LD array output" (correct).
  - `SrcDeclExplainer.md:24`: "first JSON-LD script" (proposal, not implemented).
  - S042 comment `model_context.cc:689-690`: singular "`<script>`" (stale).
  Canonical: source code plus the observed fixture.
- **D4. LC12 bridge "open gap".** `webmcp-completion-lifecycle-round-20.md:79` and `:123`, and `SKILL.md:2234-2235`, say the bridge is outside the sample. The bridge bytes are retained in S042 at :146-181, :651-682, :684-746. Either append an S042 anchor extension before citing, or keep the wording "retained but unregistered". Shape only; no runtime claim.
- **D5. Three different nulls.** Tabi's `after.submits: null` (producer :226) is an observer marker. Chromium's `String()` null (S042 :732) is a control-flow sentinel. A CDP `output: null`, possible only for Completed, is a wire value. Notes must not call the summary null "the sentinel".
- **D6. Output absence versus null.** PDL :116 plus emitter :241-243 require absence for non-Completed. Completed may carry any JSON. No round-21 note states this per status.
- **D7. No output-shape control in round-21.** `selftest-c1.mjs:176-179` injects `output:{ok:true}`, the respondWith shape the native case must not have. Do not reuse it as a native control.

## 8. Limits and gaps

- Design-level review of unbuilt artifacts. Counterexamples are mutation specifications. Nothing was executed against the frozen counter or selftest.
- Source claims are for Chromium 154.0.8037.97 retained bytes. Runtime support is one native fixture. Zero-block `[]` and multi-block arrays are source-level (and r17 probe-level, `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:80`, not credited).
- Private BuildOracle and BuildSelftest clones were not opened.
- S042 ranges 146-181, 651-682, 684-746 are unregistered. Citing them needs registry work outside this seat.

## Actions taken (no tests)

- Reads of the files cited above; `sha256sum` of `scripts/webmcp-lifecycle-round21.mjs`, `corpus/evidence/round-21/runtime/{na-native-submit.json,na-native-submit.html,receipt.json}`, and `.ufo/waves/round-21/measure-c1.mjs`.
- jq projections over `corpus/evidence/round-21/runtime/*.json` and `receipt.json`, read-only. Also `jq -n 'null|length'` to check tool semantics.
- Python gzip reads of retained `.gz` sources, with decoded sha256 checks. No network.
- Case-insensitive grep for `output` in the frozen counter: one hit, `maxOutputLength` at line 79 (gunzip limit); no output-shape check.
- One read-only `git status --porcelain` in the lane. It may refresh git's index stat cache; nothing was staged, committed, or moved. Output: `M LOG.md`, `M SCORECARD.md`, `M SKILL.md`, `M corpus/SOURCES.md`, `?? .ufo/waves/round-22/`.
- No installs, updates, builds, linters, formatters, browser runs, or network probes.

Report: .ufo/waves/round-22/w1/AttackOutputArray.md
