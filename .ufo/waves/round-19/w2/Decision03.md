# Decision03 — C1 / DV-03 semantic falsification

## Recommendation and axes

**DISAGREE with DV-03's unqualified naming rule/source entailment; AGREE with its recorded fixture outcome.** Advisory recommendation only, not an admission decision. Two P2 findings follow. No browser or full C1 counter was run.

Primary axis: **depth** (condition/source/observation entailment). Supporting axes: **calibration** (distinguishing measured behavior from generalization) and **operability** (counter discrimination). No coverage, freshness, adjacency, saturation, or numeric-axis improvement is claimed by this review.

Reviewed baseline B `66251bfc1aef393e4aec599e950a8deb867736bb` against attacked checkpoint R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. Read PLAN through its final revision, especially lines 139–156. The scoped working-tree files matched R when inspected (`git diff --name-only R -- <scoped paths>` produced no output). The B→R diff adds the round-19 table and knowledge note; this is not a review of an older qualification.

## Findings, by severity

### P2-1 — The source establishes an effective-name helper/map, not the unconditional DOM-name-versus-id rule

**Affected locations:** `corpus/evidence/round-19/validation/decisions.json:59-80`; `SKILL.md:2062`; `corpus/knowledge/webmcp-declarative-validation-round-19.md:43`; derived agent rule `SKILL.md:2088`.

The manifest/table condition is “The key is the control's id, not its name”; the answer generalizes that parameters are keyed by the control name. The knowledge note further says an id is unknown. The cited retained source does not establish that complete proposition:

- S077, decoded `form_mcp_schema.cc:1238-1247`, skips disabled/read-only native controls and inserts each remaining control under the result of `GetWebMCPParameterName()`.
- The exact token occurs at **line 1244**, inside the stated range, with the correct decoded-body SHA-256. This binding is real, not a missing-token/hash failure.
- Those lines **call** the helper; they do not define its naming algorithm. Equating its result with the DOM `name` attribute for every native control is not entailed by that call site. This review does not invent an override or fallback algorithm for the unseen definition.
- S077 `:208-219` rejects a key because it is absent from `name_to_controls_`, not because it originated from an `id` attribute. Thus the actual predicate is map membership. [INFERENCE] If an id string is also another control's effective parameter name, being an id of the intended control does not by itself establish rejection. That collision was not tested here.

The current fixture proves the narrower fact: for `<input id="queryId" name="query">`, `queryId` is not an extra alias of `query`. It does not prove a global naming algorithm. The build/loopback exclusions at `SKILL.md:2040-2047` and knowledge-note `:13-20` do not close this within-build logical gap. The original family report was appropriately fixture-qualified (`.ufo/waves/round-19/w1/FamUnknownParam.md:21,30`).

**Exact correction supported by existing observations, without another browser run:**

- DV-03 condition: `For the recorded <input id="queryId" name="query"> fixture, invokeTool receives {"queryId":"sentinel-id"}.`
- DV-03 answer: `Error with the unknown-parameter message; zero submit events; query and other remain unchanged. The query-key control completes and submits once. This fixture shows no additional id alias, not a universal naming algorithm.`
- Put that same condition/answer in `SKILL.md:2062`.
- Replace the first sentence of knowledge-note `:43` with: `In the tested native-input fixture, the accepted parameter is query; its distinct id queryId is not an additional alias. ProcessForm groups controls by GetWebMCPParameterName(); the cited call site does not define that helper's general naming rules.`
- Replace the naming advice at `SKILL.md:2088` with: `Use the tool's derived inputSchema property keys; do not substitute a DOM id as an extra alias.`
- For the narrowed rejection proposition, use S077 `:208-219`, token `name_to_controls_.find(parameter_name)`, retaining the existing body/hash; cite `:1238-1247` additionally as the map-building call site. Alternatively, retain and inspect the same-tag helper definition before keeping a general DOM-name-only rule. A helper-name token alone is not that evidence.

### P2-2 — The C1 row gate accepts a reversed DV-03 instruction with the original evidence identifiers

**Affected locations:** `.ufo/waves/round-19/measure-c1.mjs:299-319,522-560`; decision-table contract at `PLAN.md:141-146`; row `SKILL.md:2062`.

`parseManifest` checks only that condition/answer are nonempty strings. `indexDecisionRows` checks row uniqueness plus probe/control/source-row identifiers anywhere in the row. It does **not** bind the row's condition, observed-outcome prose, or displayed source line anchor to the manifest.

I directly exercised the existing predicates in the isolated R clone, without invoking `countRevision`, `main`, self-tests, a producer, a server, or a browser. Starting from the real DV-03 table row, the in-memory mutant changed its condition to the supplied key being the control name, its outcome to `Completed; id aliases name, values change, and one submit occurs`, and its displayed source location to `form_mcp_schema.cc:1-1`. The original DV-03 id, probe id, control id, and S077 token remained. **Observed `indexDecisionRows` reasons: `[]` (accepted).**

Changing the manifest condition/answer to the same contrary instruction while retaining its existing structured Error/zero-submit outcome also passed `parseManifest`; row, source, and case predicates returned `[]`, `null`, and `[]` respectively. This is predicate-level evidence, not a claimed full-counter measurement. [INFERENCE] With all other inputs unchanged, the full gate has no additional prose comparison in `countRevision:804-879` to reject these mutations.

**Exact correction:** make the manifest the canonical condition/answer/anchor representation and require each SKILL row's normalized condition, observed-outcome text, source row, filename, and line range to match it. A DV-03-only negative control that reverses the answer while preserving all ids must fail. This mechanical binding will prevent row drift; it will not replace the semantic source review in P2-1. Do not describe lexical token presence as semantic entailment.

## Re-derived source proposition and exact retained bindings

All three retained bodies were decoded with `/usr/bin/zcat`; hashes below were independently recomputed from decoded bytes in the scoped Node audit. Source access recorded in the corpus and local inspection date: **2026-10-21**. No upstream body was fetched by this seat.

| Source | Retained decoded body and SHA-256 | Anchor and proposition |
|---|---|---|
| [S077](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT) | `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`; `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `:1244-1245`, exact short quote: `String name = form_control->GetWebMCPParameterName(); EnsureControlVector(name).push_back(form_control);`. `:208-219` performs missing-key rejection; `:233-241` applies only after validation. |
| [S078](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT) | `corpus/evidence/round-19/sources/html_form_element.cc.gz`; `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `:196-197` returns the fill error callback before submission; `:219-220` reaches autosubmit only after fill success; `:237-259` parses an object and constructs a fresh FormMCPSchema for the invocation. |
| [S079](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl) | `corpus/evidence/round-19/sources/WebMCP.pdl.gz`; `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | `:59-69`, `object input` at line 66: the top-level protocol parameter is an object. |

S077 registry row `corpus/SOURCES.md:91` records the same hash, tag, mined status, and opened date. Its source scope is source-level validator/fill behavior, not general JSON Schema conformance. DV-03's token/range/hash check passes exactly as declared; **presence is not the missing semantic definition**.

## Re-derived runtime proposition from raw observations

No new runtime behavior was produced. These are direct readings of committed evidence, not reliance on `pass: true` alone.

| Evidence | Probe `decl-unknown-param-03` | In-family control `decl-unknown-param-04` |
|---|---|---|
| Case/fixture | `cases/unknown-param.json:71-99`; `fixtures/unknown-param.html:5-8` | `cases/unknown-param.json:102-123`; same fixture |
| Input | `{"queryId":"sentinel-id"}` | `{"query":"changed-valid"}` |
| Receipt anchor | `receipt.json:4711-4773` | `receipt.json:4776-4837` |
| Raw event | `toolResponded.status=Error`, errorText `Input contains a parameter "queryId" but there is no such parameter for the tool` | `toolResponded.status=Completed`, output `{ok:true,fields:{query:"changed-valid",other:"initial-other"}}` |
| Correlation | invocation id `5FA921E847CE3AB2811BB9FB2FB5760E` agrees across command observation, toolInvoked, toolResponded; toolInvoked input is the queryId object | id `CC12EBE7202CD5B65A86F7D1A31AEEF7` agrees across those observations; toolInvoked input is the query object |
| Schema | exactly the `query` and `other` string properties, no queryId property | same schema |
| Post-event state | submitCount `0`; `{query:"initial-query",other:"initial-other"}` | submitCount `1`; `{query:"changed-valid",other:"initial-other"}` |
| Recorded pass | `true` | `true` |

The earlier family raw probe independently records **two** `id-not-name` repetitions, each with the same rejection and `calls=[]`: `probes/unknown-param.json:755-923` and `:924-1092`. It uses human trial labels, not the committed case-id namespace. The added success control is explicitly integration-owned in `cases/unknown-param.json:122-123`; reuse by DV-03 is valid and is not disguised as an original family trial.

The manifest's `outcome.errorTextIncludes` is narrower than the complete case expectation, but it includes the distinguishing `queryId` token. The current actual error satisfies both. Thus this is not a false positive caused merely by a generic Error status.

## Null, type, coercion, and submit-timing challenges

- **Key lookup precedes value validation.** S077 `:211-221` looks up the JSON object's key before `ValidateParameterData`. [INFERENCE] With an otherwise identical invocation-time map and a single unknown `queryId` key, replacing its value with null, a number, boolean, array, or object cannot make that key an alias; the missing-key branch returns first. Those value variants were not browser-tested by this seat.
- **Do not conflate a null value with top-level null.** `{"queryId":null}` is an object with an unknown key; a top-level null is outside the declared CDP object-input boundary. DV-03 provides no runtime observation of either null variant. This does not weaken its observed string-key discrimination.
- **The success control is not a coercion experiment.** Both payload values are ordinary nonempty strings. S077 `:49-68,302-318` explains the string conversion/text validation path; no null-to-empty or implicit stringify assumption is needed to explain the current pair. Different string sentinels do not constitute a balanced same-value experiment, but both are accepted by the same ordinary-text source branch.
- **Rejection is fill-time, not a late required-field/submit failure.** S077 `:208-244` returns before any setters; S078 `:196-197` returns the error before `PrepareForSubmission`. The fixture records submits synchronously at `fixtures/unknown-param.html:13-17`. The harness waits for the response with the matching invocation id before reading form state (`scripts/webmcp-validation-round19.mjs:1115-1133`). For this static fixture, zero submits is supported by both the caller logic and raw event/state observations, not just a short sleep. No claim about arbitrary page timers or dynamic rename races follows.
- **Invocation-time names matter.** S078 `:249-259` rebuilds FormMCPSchema for filling. The fixture does not rename controls between registration and invocation. This evidence cannot establish that a previously observed schema remains valid across page mutations.

## Case uniqueness and counter strength

Observed inventory: **27 decisions, 66 receipt cases, zero duplicate probe ids across decisions, zero duplicate receipt ids, zero duplicate case-definition ids**. DV-03 exclusively owns probe `decl-unknown-param-03`. Control `decl-unknown-param-04` occurs once in the receipt and is intentionally shared by DV-01/DV-02/DV-03; the contract requires unique probes, not unique control ownership.

Strong existing checks, inspected rather than fully rerun: duplicate probe rejection (`measure-c1.mjs:564-576,823`), duplicate case/receipt detection (`:396-397,469-480,621-639`), same-family Completed controls (`:659-711`), producer/case/fixture digest binding and canonical runtime strings (`:455-466,852-865`), and source decoded hash/range/token checks (`:579-610`). The canonical reproduction implementation uses the absolute pinned Node and an R checkout (`:748-801`); this review did **not** execute it.

The recomputed local digests match the committed receipt pins:

- Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` (`receipt.json:20`).
- Unknown-param case file: `89307220829295394255526288107c41eece58c5ddf1ab48d3ad03517e767e19` (`receipt.json:36`).
- Unknown-param fixture: `cfd92ca512b59fe1d0e686d7071cc0013c940c969e8666c2342fc31231d609fe` (`receipt.json:53`).
- Counter at R: `a5126e5e5423e8e370aa60c67ece3253431662717550e934b986c04f7e2b7858`.

## Exercised scoped verification

A finite, browser-free semantic-predicate probe ran once with Node **24.21.0**, exit **0**:

```text
/usr/bin/env PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/bin:/bin /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-Decision03/decision03-semantic-probe.mjs
```

Probe SHA-256: `3c942bbbf1da6f23ba0073e0673e86230481a039dff2098b45469ffca45ba612`. It reads R data and exports existing counter predicates in memory; only the import-meta file-path initialization is substituted so that no CLI entrypoint runs. Neither production file nor tracked evidence is edited. Its two receipt inputs are copies of the **recorded** receipt, not a newly reproduced receipt.

Observed predicate results:

```json
{
  "baseline": {"rowReasons": [], "sourceReason": null, "caseReasons": []},
  "contradictorySkillRow": {"reasons": [], "accepted": true},
  "contradictoryManifest": {"row": [], "source": null, "cases": []},
  "irrelevantSourceToken": {"token": "continue;", "lines": [1241, 1243], "reason": null, "accepted": true},
  "contradictoryCommittedRawObservation": {"reasons": [], "comparableProjectionEqual": true, "accepted": true}
}
```

## Residual risk and verification gaps

- **Source-token check is intentionally lexical.** Replacing DV-03's token/range in memory with `continue;` at `:1241-1243` is accepted. That matches the literal predicate in the revised contract; it is not separately reported as a contract-implementation defect. It demonstrates why that check cannot resolve P2-1.
- **Receipt reproduction compares a projection.** `receiptObservation`/`comparableReceiptRecord` at `measure-c1.mjs:484-507` retain status/errorText/submitCount, but omit observed fields, schema, commandError, and raw events. A mutant changed the committed probe's field to `MUTATED`, added a queryId schema property, changed raw invoked input, and changed raw toolResponded to Completed while leaving the summary tuple/pass unchanged. The directly exercised case predicate accepted it. The manifest explicitly defines its counting outcome as the summary tuple, so this is a verification limitation rather than a third finding against the stated counter contract. It must not be presented as equality of all raw observations. The current R observations were manually cross-checked above and do not exhibit that inconsistency.
- **LSP unavailable:** the mounted-device inventory has no `lsp`; reading `xd://lsp` returned `No such tool: xd://lsp`. Therefore references/definition/diagnostics could not be obtained. Text search was used only as a locator; it is not represented as semantic caller/definition proof. The retained native caller bodies and JS predicates were read directly. The naming helper's definition remains outside the cited retained range.
- **No fresh runtime verification:** no browser, full C1 counter, C1 self-test, build, lint, formatter, or unrelated suite was run. Runtime/producer equality here is retained-record and digest evidence, not a new browser identity attestation. The receipt names one Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 combination. No alternate runtime, routing, integration, resume path, or saturation judgment was invoked.
- No packages/tools were installed or updated. The gzip PDL ranged reader returned an empty archive directory; `/usr/bin/zcat` successfully supplied the retained body, and the reader mismatch was reported to `xd://report_issue`.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-Decision03`.
- Branch: detached at R; no production/review branch or new commit created.
- Sandbox base/checkpoint and inherited commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (the falsification-specific R requirement). Comparison baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Changed production paths: **none**. Seat-created sandbox artifact only: `/fast/scratch/tabi-r19/fx-Decision03/decision03-semantic-probe.mjs`.
- Only direct LANE write: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/Decision03.md`.
- No git writes in LANE, no sibling/domain-source edits, no background jobs, no browser/server processes. All finite processes started by this seat exited.
