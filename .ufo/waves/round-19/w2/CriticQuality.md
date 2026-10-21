# Round 19 W2 — CriticQuality

Seat: `TabiR19.CriticQuality`. Date: 2026-10-21. Reviewed checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`. Lane `refs/heads/master` resolved to R at the start of this review.

**Author-side advisory only.** This is not a non-author spot-check, admission, canonical judgment, or round closure. I neither changed production files nor invoked a browser, Node, a counter, a test suite, or another judgment runtime. Runtime evidence below was produced by the separately assigned RuntimeCheckbox seat and reopened here read-only.

## Axes and result

Axes: **depth** (does the decision say what the implementation/observations support?), **operability** (can the named negative property actually fail?), and **calibration** (accurate scope, counts, provenance, and rejection reasons). No freshness, coverage, or adjacency improvement is claimed by this review.

- All **seven** additions, QUALITY40–46, resolve to concrete round-19 `## Mistakes` rows. No lesson-free generic criterion was found in this seven-item sample.
- **Disagree with admitted DV-15's boolean-only/all-strings-rejected claim:** two string counterexamples each reproduced twice, using the unchanged R producer and fixture.
- **QUALITY45's missing-writer-row detection is not implemented by the cited checker**: a static omission counterexample survives its population checks. This is a fixable implementation gap, not a reason to weaken the criterion.
- **Disagree with the stated null-order rejection rationale:** `text_null` is present in both original probe events and the committed receipt. Withholding a general ordering claim remains prudent.
- QUALITY40's historical scan description is false; the older harness scanned marker bytes, not filenames. Its proposed replacement behavior remains grounded.

## QUALITY40–46 audit

Locations below are lane-relative. A recorded self-test result is historical evidence read here, not a test run by this seat.

| Criterion | Lesson grounding | Failure-capable evidence and finite scope | Agree/disagree |
|---|---|---|---|
| **40**, `corpus/QUALITY.md:166-173` | `corpus/lessons/round-19.md:81`, H4 replay and GUID-artifact survivor | `selftests/c2.json:13-61` records wrong-nonce, prior-record replay, clean-scan/new-file, and unreported-UUID rejection shapes. `.ufo/waves/round-19/measure-c2.mjs:540-555` requires an otherwise valid prior record, a changed nonce, and rejection of replay. The rule concerns the run's artifact roots, not arbitrary host files or publisher authenticity. | **Agree** with the rule and lesson. **Disagree** with its final historical phrase, “suggested-filename scan”; see F4. |
| **41**, `QUALITY.md:174-179` | Lesson `:82`, SIGTERM-only coverage cannot establish named SIGINT/SIGHUP behavior | `selftests/c2.json:63-101` records both signals and rejects idle-browser, incomplete PID identity, missing abort marker, wrong exit, receipt-present, and surviving-PID shapes. `measure-c2.mjs:619-640` requires a nonempty identified pre-signal PID set. | **Agree.** Bounded to signals actually claimed; not evidence for every signal. PLAN final revision `:148-151` correctly treats H1 as additional coverage, not newly working runtime operability. |
| **42**, `QUALITY.md:180-186` | Lesson `:82`, literal-HEAD/exit-only witness coverage | `selftests/c2.json:103-131` records exact refusal detail, wrong-reason/wrong-finding rejection, and valid-ancestor control. `measure-c2.mjs:875-903` enumerates HEAD, @, master, a seven-hex abbreviation, and an off-branch full hash. | **Agree** within those named shapes. Do not generalize the seven-hex example into an exhaustive revision-language audit. F6 was already working at B; the final PLAN correctly withholds new runtime credit. |
| **43**, `QUALITY.md:187-193` | Lesson `:78-79`, LOG range drift and concealed assertion-strength changes | `selftests/c3.json:25-72` records rejection of the old range, missing citation, wrong ID list/denominator, and retained numeric-predicate mutant. The five-substring/one-nonempty split is explicit. | **Agree.** This explicitly refines existing QUALITY34 rather than introducing another source/counter authority. It requires re-derivation; it does not establish that every historical LOG number has now been audited. |
| **44**, `QUALITY.md:194-200` | Lesson `:80`, registry attribution | `selftests/c3.json:81-121` records null-wave, missing-record/registry, post-record null-agentId, and incomplete historical-file-list rejection. `measure-c3.mjs:280-319` checks actual registry/record members and registry wave against spec wave. | **Agree.** The excluded `agentId:null` **validation snapshot** is a pre-dispatch object (`w1/validation.json:21-28`), not a post-dispatch record (`w1/record.json:1-11`). PLAN final revision's post-record agentId requirement and this exclusion are not contradictory. Do not erase that distinction. |
| **45**, `QUALITY.md:201-208` | Lesson `:77,84`, shared-checkout writers and omitted return-time snapshot | `selftests/isolation.json` records seven cases, including six negative shapes: shared clone, base drift, unassigned path, missing commit, lane-status drift, duplicate branch. These are genuine finite checks. **No missing-writer-row control exists**, despite the criterion naming that finding; see F2. | **Agree** with the grounded criterion; **disagree** that the current checker demonstrates every named failure. Wave-1 after-status is honestly labelled RECONSTRUCTED, not an observed return-time snapshot. |
| **46**, `QUALITY.md:209-213` | Lesson `:83`, integration observation-contract mismatch | `validation/integration/receipt-1.json` records **55/64**, with **five checkbox** encoding failures and **four unnamed-control** failures. `receipt-2.json` records **64/64**; the final `validation/receipt.json:4840-4846` records **66/66** after the added controls. `integration/checkbox.cases.seat-original.json` retains boolean expectations. Harness `scripts/webmcp-validation-round19.mjs:858-880` states its field encoding. | **Agree** for the observed integration correction. This is an expectation/observation-contract repair, not permission to rewrite expectations merely to get green. The nine initial failures were not nine checkbox failures. |

No new generic quality framework is needed to repair the findings below. Keep the criteria tied to these named browser-evidence, source-identity, count, and writer-isolation failures.

## F1 — Admitted DV-15 is false beyond its tested non-coercible strings

**Counterexample, observed by RuntimeCheckbox and reopened here:**

| Added falsification input, to both existing checkbox controls | Observed status / error | Submit count | Observed fields |
|---|---|---:|---|
| string `"true"` | `Completed` / null | 1 | `withoutValue:"on"`, `withValue:"checkbox-choice"` |
| string `"false"` | `Completed` / null | 1 | both null |

Both outcomes are identical in the first and repeat receipts. Each receipt records two failed cases against the deliberately false **Error** hypothesis and **zero hazard findings**. These failed hypotheses are counterexamples to the admitted rule, not failures of the browser's actual behavior.

The false assertion occurs at:

- `SKILL.md:2074`, DV-15: its condition is any single-checkbox string and its answer says booleans only;
- `corpus/evidence/round-19/validation/decisions.json:369-392`, same condition/answer;
- `corpus/knowledge/webmcp-declarative-validation-round-19.md:57-58`, same universal.

The five committed checkbox cases only exercise booleans and the three strings `"checkbox-choice"`, `"on"`, and `"unrelated"`; they do not justify rejection of all strings. The retained S077 implementation dispatches a single checkbox to `ToBoolean` at `form_mcp_schema.cc:337-343`. Its helper `:71-91` accepts booleans, an integer branch, and case-insensitive true/false or 1/0 strings. The string counterexamples therefore agree with, rather than contradict, the pinned implementation.

**Evidence binding:** R's producer blob SHA-256, independently computed with `git show R:scripts/webmcp-validation-round19.mjs | sha256sum`, is `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`. R's `checkbox.html` blob is `defdadd1408037a052a5af368d77464b4b992ccff295329ce8efb6ea1bc4753b`. Both peer receipts contain exactly these digests and runtime identity Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0.

Peer-owned evidence read, not modified:

- `.ufo/waves/round-19/w2/RuntimeCheckbox.coercion.receipt.json`, SHA-256 `f5221b4d7b1e391054d7098abda60b349893a4eec1dafd89acf6c23d27fb84a6`;
- `RuntimeCheckbox.coercion.repeat.receipt.json`, SHA-256 `f42453853a84952216c7c62f3e68fccace83fcfc5489cfc47faff37ac621c385`;
- `RuntimeCheckbox.coercion.cases.json`, SHA-256 `35db162f5484320d903e71f29c5c86644c60424d7e4d53078c0786d2d20ca00f` (all under the same w2 directory).

**Impacted axes:** depth and calibration; quality/discernment evidence. Passing literal-case reproduction is not semantic entailment of a universal: `measure-c1.mjs:543-560,635-712` binds case/source IDs and outcomes, not the truth of every condition/answer generalization.

**Smallest safe correction:** remove the boolean-only universal from every named mirror. State that the three tested non-coercible strings are rejected, and distinguish the now-observed accepted true/false strings from additional source-only coercions. Retain “send booleans” as a safe client recommendation, not an exclusivity claim. Preserve the false hypothesis and counterexample receipts. Any revised decision population/count is the L1/canonical judge's responsibility, not an author-side automatic re-admission. The source line range in the peer's extra case metadata (`345-352`) is not the coercion anchor; use `71-91` plus `337-343` when integrating its evidence.

## F2 — QUALITY45 names missing-row rejection, but the checker has no independent writer population

**Static counterexample, not executed:** remove the `ExecValidationHarness` row from the current **23-entry** isolation ledger, leaving 22 otherwise valid rows and identical status text. Given an otherwise evaluable clean ledger, the checker has no population comparison that can report that missing writer. This conclusion is **[INFERENCE from the complete predicate path]**, not a claimed mutant run.

Evidence:

- `isolation/check-isolation.mjs:245-273` requires only a nonempty entries array and fields on rows that are present.
- `:303-354,356-449` iterates those present rows; there is no independently sourced expected writer set. Removing one cannot introduce a duplicate clone/branch or an unassigned path among survivors.
- `:472-477` emits `entries: ledger.entries.length`.
- `measure-c3.mjs:328-361` compares checker output to that same ledger-owned length, so the count is not an independent completeness witness.
- The committed seven-case isolation self-test does not include omission of a required writer row. Missing **commit** is a different shape.

**Impacted axes:** operability of the isolation predicate and calibration of its claimed completeness. This is a fixable defect, not an acceptable trade for stricter checking of the rows that remain.

**Smallest safe correction:** derive expected writer identities/assignments from the existing canonical wave assignments, compare the ledger's seat set against that independent population, and retain a missing-writer negative receipt with its specific finding. Do not establish a second discretionary roster or simply hard-code the ledger's current length.

Separately, `isolation/ledger.json:4-8` expressly says its wave-1 after-state and tracked-diff conclusion are reconstructed from mtimes. That does not become an observed `git status --porcelain=v1 -uall` snapshot because a checker accepts its strings. PLAN final revision `:153-156` acknowledges this historical debt; I am not silently restoring the earlier, stronger C3 definition or claiming that the revised C3 counter was run here. Preserve the qualification. A new wave-2 snapshot cannot recreate the missing wave-1 observation.

## F3 — Rejected null-order claim: agree with withholding, disagree with its factual rationale

Lesson `corpus/lessons/round-19.md:16-18` says the `text_null` key did not reach `toolInvoked`. The retained data says otherwise:

- `validation/probes/non-scalar.json`, both `primaryRuns` (first and repeat), case `scalar-text-four-values`: parsing `events[method == "WebMCP.toolInvoked"].params.input` yields keys `text_array,text_long,text_nested,text_null`; `has("text_null")` is **true**. The first event's full JSON string is at line **364**; the key is at the far end of its roughly 100 KiB string, not absent.
- Committed `validation/receipt.json:1662-1742`, `decl-non-scalar-01`: requested keys and parsed `observed.toolInvoked.input` keys both include `text_null`; the latter string is at **1708**. Observed error is `Invalid value for parameter text_array`; submit count is zero; all seeds are unchanged.

**Impacted axis:** calibration, particularly false negative provenance. The presence check was performed on the parsed full string, not a truncated display.

**Smallest safe correction:** correct the lesson's absence assertion to: “`text_null` was present in `toolInvoked`; this batch reported `text_array` first; no general key-order guarantee is established.” Retain the rejection of a generalized null-order assertion. This evidence does not license inventing an explanation for the traversal order.

## F4 — QUALITY40 repeats an already-corrected historical premise

`QUALITY.md:172-173` attributes H4 to a suggested-filename scan. The frozen `scripts/webmcp-invoke-round18.mjs:745-784` recursively reads regular-file **contents**, with the match at `:773`; its predicate only requires a suggested-filename string at `:2713`. This was already corrected in the current lesson `:68-71` and `w1/ProbeR18Download.md:5-6,30-40`.

The frozen harness SHA-256 was recomputed here: `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`.

**Impacted axis:** calibration/provenance, not the validity of an any-new-file artifact-root scan.

**Smallest safe correction:** append the narrow correction to criterion 40's historical description: marker-byte scan plus receipt provenance, not a filename-only filesystem scan. Preserve the byte-frozen older harness and the grounded GUID/replay red shapes.

## Reopened gate decisions — explicit agree/disagree

| Decision reopened | Author-side disposition | Evidence and limit |
|---|---|---|
| Admit **DV-15**, single-checkbox strings / booleans only | **Disagree** | F1 supplies two runtime counterexamples, each repeated. Literal canonical cases remaining green cannot support the universal. |
| Admit **DV-08**, top-level array/string/null refused by CDP | **Agree, scoped** | Committed receipt cases `decl-non-scalar-03/04/05` each record `Invalid parameters`, null invocationId/toolInvoked/toolResponded, zero submits and unchanged seeds; control `-06` records Completed and one submit. PDL `:59-69` declares object input. This is protocol-boundary evidence, not Blink validation of a successfully dispatched non-object. |
| Reject **S094**, guessed `form_mcp_schema_unittest.cc` path | **Agree** | The retained 404 response's first line and independently recomputed decoded-body hash match the lesson. Only this exact tag/path is rejected; no repository-wide absence of form-schema tests is inferred. No fresh HTTP request was made by this seat. |
| Withhold **html_form_mcp_tool_test.cc** source row | **Agree with the original withholding** | `w1/SrcFormSchemaTests.gate.json:3-10` binds a test-file URL to an implementation-file quote, implementation location and implementation digest. A correct inference about transactional behavior does not repair source identity. I reopened the actual test file read-only in the source scout's existing scratch; its independently hashed bytes differ from the implementation, and its actual `:419-451` test supports transactional failure. A future correctly quoted admission would be a new supported decision, not proof the original gate record was valid. |
| Reject general **null-order assertion** | **Agree with non-admission; disagree with its reason** | F3: the key did reach the event. Preserve uncertainty about ordering instead of inventing key loss. |

## Located source quotes and decoded-body identities

Access/read date for every row: **2026-10-21**. These are retained-source reopenings, not new remote fetches. Each quotation is at most 25 words; source/runtime evidence classes remain separate.

| Source | Verbatim quote and exact location | Decoded-body SHA-256 |
|---|---|---|
| [Chromium 154 form_mcp_schema.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), retained `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz` | `return ToBoolean(value, unused);` (`:342`); `If the data isn't valid, form control states remain unchanged.` (`:210`, the implementation quote misattributed by the withheld test dossier) | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| [Chromium 154 WebMCP.pdl](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT), retained `sources/WebMCP.pdl.gz` beneath round-19 evidence | `object input` (`command invokeTool`, lines `59-69`) | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| [Chromium 154 guessed test path / S094](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT), retained `sources/form_mcp_schema_unittest-404.txt.gz` | `NOT_FOUND: Requested entity was not found` (decoded response line 1) | `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` |
| [Chromium 154 html_form_mcp_tool_test.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc?format=TEXT), existing scratch `/fast/scratch/tabi-r19/TabiR19-2.SrcFormSchemaTests-4/html_form_mcp_tool_test.cc` | `A failure means no form control values were changed.` (`:448`, `FillFormControls_Transactional`) | `944ee9e45eb9c400143a3746296af16fcbfdea3249dec669580b751f0ae27be6` |

The three retained compressed source-body digests and the actual scratch test-file digest were recomputed using `gzip -dc <absolute source path> | sha256sum` or `sha256sum <absolute source path>`. The quoted test source remains an existing scratch artifact, not a newly admitted durable corpus row.

## Verification and closure boundary

Performed: targeted static reads, JSON projections of committed/peer evidence, source/probe identity hashes, and read-only Git object identity queries. Historical evidence reopened: C2 self-test records 28/28; C3 records 24 clean cases; isolation records seven clean self-test cases; integration receipts record 55/64 → 64/64 → 66/66. None of those suites was rerun here. The omission counterexample in F2 is explicitly static; no passing/failing runtime result is fabricated for it.

L1 owns corrections, any new negative-control execution, final verification, and canonical submission. False admitted prose and an untested promised failure shape are fixable defects, not axis trades to silently accept. This author-side report cannot satisfy LEARNING.md's non-author admit/reject closure.

Tools installed/updated: **none**. Processes started requiring cleanup: **none**.

## Isolation

- Seat: `TabiR19.CriticQuality`.
- Clone: none; advisory/static review only, with no runtime or mutation probe by this seat.
- Branch: none.
- Base reviewed: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Production commit: none; no production files changed.
- Sole seat-owned changed path: `.ufo/waves/round-19/w2/CriticQuality.md`.
- Existing source-scout scratch and RuntimeCheckbox artifacts were read only. No sibling artifact, lane Git state, fleet file, source tree, or browser profile was changed.
