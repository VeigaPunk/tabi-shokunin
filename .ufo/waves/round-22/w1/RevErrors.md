# RevErrors — reject, preventDefault-before-throw, error payloads, source limits

- Seat: `TabiR22.RevErrors` (revenger, leaf, read-only). Wave `tabi-r22-w1`. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Scope: retained round-21 acquisition (S101) and the retained S100 source only. No browser, network, producer run, tests, builds, linters, installs, subagents, or peer messages. No production edits.
- Short forms: `PROD` = `scripts/webmcp-lifecycle-round21.mjs`; `FIX:<id>` = `corpus/evidence/round-21/runtime/<id>.html`; `RAW:<id>` = `corpus/evidence/round-21/runtime/<id>.json`; `R` = `corpus/evidence/round-21/runtime/receipt.json`; `S100` = `corpus/evidence/round-20/sources/html_form_element.cc`; `NOTE` = `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`; `CTR` = `.ufo/waves/round-21/measure-c1.mjs` (frozen; not to be imported). Line numbers are 1-based in the named file.
- Labels: **[V]** verified by read, checksum, or the machine pass in §13; **[S]** stated by retained source; **[I]** inference, not observed.

## 0. Findings

1. Each Error row maps to an S100 branch. `na-reject` → `S100:326`. `na-throw` → `S100:808–813`. `na-invalid-submit` and `auto-invalid` share `S100:729–758`. Retained `errorText` is byte-equal to the source literal, or to the source-built string. **[V]**
2. The thrown message (`dummy submit handler throw`) and the rejection reason (`dummy rejection`) are not in any tool payload. They appear only in page `error` events. The `na-throw` tool error is the preventDefault-without-respondWith literal. **[V]**
3. `submits[].respondWith` is `typeof e.respondWith` and is `"function"` in every row, including the ones where `respondWith` is never called. It is not invocation evidence. **[V]**
4. `auto-invalid`'s response arrives before its pre-action observation. `after.responses` is cumulative from invocation start, not a delta from the action. **[V]**
5. The frozen counter never names `status`, `errorText`, `output`, or `respondWith` in a check. These fields enter it only through whole-object deep equality against raw events (`CTR` L139). A coherent swap would pass its structural checks and reach a count of 12 (`CTR` L143). **[V]** for the reading; the count outcome is **[I]**, not executed.
6. A coherent mutation must refresh the digest chain through `.ufo/waves/round-21/runtime-execution-finalized.json`. Otherwise the red outcome is `execution_binding`, not a semantic finding. **[V]**

## 1. Bindings checked (all match)

| Artifact | sha256 | Bound by |
|---|---|---|
| `PROD` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | `R` `producer.sha256` (R:6); `.ufo/waves/round-21/runtime-execution-finalized.json` `producerSha256` (L13); `CTR` `PRODUCER_SHA` (L31) |
| `FIX:na-reject` | `eb23b95526f9cea2dbf73b58e0b5f36b596d61fd361d8e41a1bf30fb6eb7f658` | `RAW:na-reject` `fixture.sha256` |
| `FIX:na-throw` | `579ab87bfba2cf0acbc954ff4468b6733014ef3fc47ec458a815fb448fb4539e` | `RAW:na-throw` `fixture.sha256` |
| `FIX:na-invalid-submit` | `53058248453754b0f6742a0cb38d07e1eba571546db208de43857130245e8148` | `RAW:na-invalid-submit` `fixture.sha256` |
| `FIX:auto-invalid` | `4df781840afdfed1e958e13bd05ad3e9d91ee81c3ab1805affc5014fc4051f6b` | `RAW:auto-invalid` `fixture.sha256` |
| `RAW:na-reject` | `a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741` | `R:399` `cases[na-reject].evidence.sha256`; execution `artifacts` |
| `RAW:na-throw` | `e46d751e5b5f1927175b5a2395e3ed48e0b2033ffa80e14cb4a92ac1d44b9d1a` | `R:461`; execution `artifacts` |
| `RAW:na-invalid-submit` | `e7712c1b8568c3c814881ab89744e07eccbf48e78bde0ed84dcd05091795506f` | `R:569`; execution `artifacts` |
| `RAW:auto-invalid` | `28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed` | `R:677`; execution `artifacts` |
| `R` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | execution `receiptSha256` (L47) and `artifacts` |
| `S100` body | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `corpus/evidence/round-20/sources/html_form_element.cc` = `.ufo/waves/round-21/sources/html_form_element.cc` (`cmp` identical) = `gzip -dc` then `base64 -d` of `.ufo/waves/round-21/sources/html_form_element.cc.base64.gz` = `gzip -dc` of `corpus/evidence/round-19/sources/html_form_element.cc.gz`. The opposite decode order gives the empty-input hash, so it is not a valid decode. |

Execution `artifacts` has 25 entries (12 case JSON, 12 fixture HTML, `R`). Execution `argv` pins the Node binary `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` and `PROD --out`. **[V]**

## 2. Traces

### 2.1 Reject (`na-reject`, `PROD` CASES L21: `requestSubmit` / `reject`)

1. Page. The submit listener records `respondWith: typeof e.respondWith` (`FIX:na-reject` L8; `PROD` L113). It then calls `e.preventDefault()` (FIX L9; PROD L114) and `e.respondWith(Promise.reject(Error('dummy rejection')))` (FIX L13; PROD L118). Mode literal: `const mode="reject";` (FIX L10). **[V]**
2. Driver. `WebMCP.invokeTool` with `q = nonce` (PROD L203). Pre-action observation after 250 ms (PROD L207–208). `requestSubmit()` (PROD L214). Post observation after 500 ms (PROD L224–225). **[V]**
3. Source, `PrepareForSubmission`. `should_submit = DispatchEvent(...) == kNotCanceled` (`S100:775–776`) is false because the event was canceled. `declarative_webmcp_call` is true (S100:787–788). `TakeRespondWithPromise()` returns non-null (S100:790), so `CHECK(!should_submit)` holds (S100:794). Then `std::move(*promise).Then(resolved, rejected)` (S100:798–806). **[S]**
4. Source, rejected branch. `HandleWebMcpToolResponse(..., resolved=false)`. If `!tool->CurrentlyRunning()` it returns early (S100:294–297). Otherwise `V8ScriptRunner::ReportException(...)` (S100:322–323), then `CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise was rejected")))` (S100:324–326). **[S]**
5. Page-side. The fixture listener records `"Uncaught Error: dummy rejection"` (FIX L6; PROD L111). Pre-action `errors` is `[]` (RAW:na-reject L175). Post-action `errors` contains it (RAW:na-reject L224–226; R:386–388). **[V]**
6. CDP. `WebMCP.toolResponded` params are `{invocationId, status: "Error", errorText: "respondWith promise was rejected"}` (RAW:na-reject L200–206; R:358–364). **[V]**
7. The rejection reason is not in the payload. Pre `formActive` is true (RAW L179). Post `formActive` is false (RAW L230), consistent with the response clearing the pseudo-state (`S100:266–271`). **[V]/[S]**

### 2.2 preventDefault-before-throw (`na-throw`, `PROD` CASES L22: `requestSubmit` / `throw`)

1. `FIX:na-throw` L9 `e.preventDefault();` precedes L11 `if(mode==='throw') throw Error('dummy submit handler throw');` (mode literal L10). The respondWith branches (L13–15) are unreachable for this mode. **[V]**
2. The listener exception is reported to `window`. Post-action `errors` is `["Uncaught Error: dummy submit handler throw"]` (RAW:na-throw L224–226; R:448–450). **[V]**. That the exception does not propagate to the dispatcher is **[I]**: standard DOM listener-exception reporting, not in retained source.
3. The event was canceled, so `DispatchEvent(...) == kNotCanceled` is false and `should_submit = false` (`S100:775–776`). **[S]**
4. No promise is present (`TakeRespondWithPromise()` is null). The `else if (!should_submit)` branch (`S100:807`) calls `CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result")))` (`S100:808–813`). **[S]**
5. Retained `errorText` (RAW:na-throw L205; R:424) is byte-equal to that four-piece concatenation. **[V]**
6. Consequence. The tool error names the branch and does not contain the thrown text. The thrown text exists only in the page error channel. **[V]**
7. `preventDefault()` is not observed directly. The submit record (FIX L8; PROD L113) is pushed before L9/L114 and has no `defaultPrevented` field. Cancellation is evidenced by the errorText branch plus fixture code. **[V]**
8. Untested neighbour, do not claim. Throw before preventDefault would leave the event uncanceled, so `should_submit` would be true (`S100:775–776`). That leads to `ScheduleFormSubmission` (`S100:818–824`) and `CallDoneCallback(base::ok(String()))` (`S100:829`). **[I]**. Output mapping for that branch is not established by retained raw, and `na-native-submit` shows an array output, so do not predict an output.

### 2.3 Submit-time validation (`na-invalid-submit`, `auto-invalid`)

1. Gate. `if (!skip_validation && !ValidateInteractively())` (`S100:713–715`, `729`); `should_submit = false` (`S100:730`). Declarative branch builds the text (`S100:731–758`): `"Form validation failed: "` (`S100:733`); for each invalid listed control, the name (`S100:742`; fallbacks `745`, `747`), `": "` (`S100:750`), `validationMessage()` (`S100:751`), `". "` (`S100:752`). Then `CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, error_message.ToString())))` (`S100:756–758`). **[S]**
2. No submit event. The dispatch branch starts at `S100:760`, so it is not reached. Retained: `submits` `[]` (R:553), `navigations` `[]` (R:554), page `errors` `[]` (R:558). **[V]**
3. Bytes. `"Form validation failed: q: Please fill out this field.. "` (RAW:na-invalid-submit L205; R:550). The `..` is `validationMessage()`'s own period plus the appended `". "`. The trailing space is retained. **[V]**
4. `auto-invalid`. `toolautosubmit` routes through the ExecuteTool else-branch, which calls `form_->PrepareForSubmission(nullptr, submit_button)` during invoke (`S100:218–220`). **[S]** The `toolResponded` frame (RAW:auto-invalid L173–180) precedes the pre-action observation (L184–196). R `preAction.responseCount` is 1 (R:647) and `formActive` is false (R:648). Text: `"Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "` (RAW:auto-invalid L178; R:658). **[V]**
5. `after.responses` is cumulative. `PROD` `responses(through)` filters every `toolResponded` for the invocation with `seq < through` (PROD L209). The after window uses `post.seq` (PROD L226). So the auto-invalid after list repeats the pre-action response. Timing claims must use raw `seq`. **[V]**
6. `validationMessage()` text is environment-dependent. `PROD` L165 launches Chromium with `LANG: 'C.UTF-8'`. `R` `environment` (R:8–17) does not record a locale. That the body is English because of this LANG is **[I]**.
7. `FIX:na-invalid-submit` has `const mode="success";` (FIX L10). The row is identified by action `invalidRequestSubmit` (PROD L24; `CTR` CONFIG L16), not by mode.

## 3. Error payload serialization

- Composition. S100 builds either a fixed literal (`S100:226–228`, `308–311`, `326`, `392–393`, `449–451`, `808–813`, `1103–1104`) or the composed validation string (`S100:732–758`). Both reach `CallDoneCallback(base::unexpected(ScriptToolError(code, message)))`. **[S]**
- Not retained. `ScriptToolError` and `ScriptToolErrorCode` definitions, `McpToolCallbackResult`, the status mapping, and the CDP emission code. **[S]**
- Observed CDP shape. Error rows carry exactly `{invocationId, status, errorText}` (keys read from all four rows). No `output` key. Completed rows carry `{invocationId, status, output}`. **[V]**
- Verbatim transport. `PROD` L180 stores event params unchanged (`frame('event', {method, params})`). `responses()` copies them (PROD L209). Receipt `after.responses` equals raw `toolResponded` params for all 12 rows (machine pass, §13). **[V]**
- Not transported. `ScriptToolErrorCode` (only status and text are observable), the thrown exception message, the rejection reason, and stack traces. Page-side messages come from the fixture listener recording `e.message` (FIX L6; PROD L111). The `Uncaught Error: ...` format is Blink/V8, not retained. **[I]**
- Success path. `JSON.stringify` (`S100:300–306`) produces a string, passed to `CallDoneCallback(result)` (`S100:319`). The CDP `output` is a JSON object. The string-to-value conversion is not retained. **[S]/[I]**
- Trimming and truncation. None visible in retained source. The four retained error texts are complete and ASCII. No length bound may be asserted. **[V]**
- Case file bytes. `JSON.stringify(value, null, 2) + "\n"` (PROD L31). The sha in `R` is over those file bytes (PROD L233–235). **[V]**

## 4. Source limits

1. Upstream tag, not binary. `S100` is the upstream file at tag 154.0.8037.97 (`NOTE` L14–17). Source-to-binary equivalence is not established. **[S]**
2. Symbols used but not defined in the retained file: `ScriptToolError`, `ScriptToolErrorCode`, `SubmitEvent::respondWith` / `TakeRespondWithPromise`, `V8ScriptRunner::ReportException`, `validationMessage()`, `GetWebMCPParameterName()`, `ListedElements()`, `CurrentlyRunning()`, and the CDP transport. The rule "respondWith only after preventDefault" appears only as a comment (`S100:791–793`) plus `CHECK(!should_submit)` (`S100:794`). Enforcement is not retained. **[V]**
3. Registered anchors (`NOTE` header: `html_form_element.cc:174-328,635-842`). The reject, throw, and validation literals (`326`, `733–752`, `808–813`) are inside. The reset and removal cancellation literals (`393`, `451`, `1104`) are outside, observation-only, as `NOTE` states. **[V]**
4. Anchored branches with no retained row, which must not be claimed: abort cancel (`S100:226–228`); input-argument errors (`S100:239–240`, `245–246`, `252–255`); non-serializable resolution (`S100:308–311`); non-object resolution (`S100:316–318`); late-settlement guard (`S100:294–297`); `{unknown}` name (`S100:747`); multiple invalid controls; rejection with a non-Error reason; rejection after cancellation; throw before preventDefault; respondWith without preventDefault. **[V]**
5. `CallDoneCallback` first-wins guard (`S100:263–265`) supports at most one C++ completion per invocation. CDP single emission is observed only in the four Error rows (one `toolResponded` each). **[V]/[S]**
6. Assertions are not payloads: `S100:225` (`CHECK(is_currently_running_)`), `S100:794` (`CHECK(!should_submit)`). A respondWith without preventDefault would hit `CHECK` at `S100:794` if `SubmitEvent` does not guard it. That is not established, and no control should assume it. **[S]/[I]**

## 5. Traps for an oracle

- **T1.** `submits[].respondWith` is always `"function"` (FIX L8; R:371, 433, 499, 607). Discriminate reject from throw with the errorText literal and the fixture mode literal.
- **T2.** Thrown message and rejection reason never appear in errorText. Requiring them there rejects the true observation.
- **T3.** `na-invalid-submit` has `mode="success"`. Classify by action `invalidRequestSubmit`.
- **T4.** `after.responses` is cumulative from invocation start. `auto-invalid` and `auto-positive` have `preAction.responseCount` 1. Use raw `seq` for before/after claims.
- **T5.** `defaultPrevented` is not recorded. The errorText branch is the only tool-side evidence of cancellation.
- **T6.** Validation text is locale-dependent, and the receipt environment does not record locale.
- **T7.** Error rows have no `output` key. Deep-equality on `output` is vacuous or mis-specified for them.
- **T8.** Nonce is random per run (PROD L156). Origin port is ephemeral (PROD L144–145; URLs such as `http://127.0.0.1:43143/na-reject`). Compare nonce relationally. Do not pin the port.
- **T9.** `CTR` is blind to status and errorText values. See §10.
- **T10.** The digest chain. See §9.
- **T11.** `na-native-submit`'s `after.pageState` yields no `errors` and a null `value` under the same accessor (null or absent; not inspected further). Oracles must not assume `errors` exists for every row.

## 6. Proposed bounded oracle constraints

All expectations are fixed constants. Type them as literals in `semantic-expectations.json`. Do not derive them from `R` or `RAW`. Finding names are from the contract list.

**Common to the four Error rows (E-common):**

- **E0** `invokeError === null`. Exactly one `WebMCP.toolResponded` frame in `RAW` for the invocationId, indexed by `seq`. `after.responses.length === 1`. *(semantic_status)*
- **E1** Response keys exactly `["errorText","invocationId","status"]`. No `output`. *(semantic_error)*
- **E2** `status === "Error"`. *(semantic_status)*
- **E3** `navigations.length === 0`. Source: `S100:729–730`, `807`, `818` guard. *(semantic_navigation)*
- **E4** `preAction.formActive` is true for manual rows and false for auto rows. `after.pageState.formActive === false`. Source: `S100:206` set, `S100:266–271` clear. *(semantic_timing)*
- **E5** Where a submit exists, `submits[*].agentInvoked === true`. Source: `S100:769–771`. *(semantic_error)*
- **E6** `errorText` compared with `===`. No trim, no normalization. *(semantic_error)*

**Per-row fixed expectations:**

| Row (autosubmit, action, mode) | `errorText` exact | `pageState.errors` | `submits` length | `preAction.responseCount` | `after.pageState.value` |
|---|---|---|---|---|---|
| `na-reject` (false, requestSubmit, reject) | `respondWith promise was rejected` (`S100:326`) | `["Uncaught Error: dummy rejection"]` | 1 | 0 | equals case nonce |
| `na-throw` (false, requestSubmit, throw) | `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` (`S100:808–813`) | `["Uncaught Error: dummy submit handler throw"]` | 1 | 0 | equals case nonce |
| `na-invalid-submit` (false, invalidRequestSubmit, success) | `Form validation failed: q: Please fill out this field.. ` (trailing space; `S100:733,750–752` + recorded body) | `[]` | 0 | 0 | `""` |
| `auto-invalid` (true, none, invalid) | `Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. ` (trailing space; `S100:733,750–752` + recorded body) | `[]` | 0 | 1 (response seq before pre-action seq) | `"not-an-email"` |

- Input: manual rows use `q = nonce` (PROD L203). `auto-invalid` uses `q = "not-an-email"` (PROD L203).
- Validation bodies are the recorded strings. Pin them as environment-bound, not as source literals **[I]**. Prefix, `q: `, and suffix `. ` are source literals.
- `after.pageState.formActive === false` holds for every row with a response. It holds true for `na-pending`, which has no response. This is a general check, not row-specific.

## 7. Positive controls that must survive (stay green)

- **P1–P4.** The four retained Error rows, exactly as in `RAW` and `R` (digests in §1), classify green under §6.
- **P5.** `auto-positive` (R:572–635, Completed with output object, `preAction.responseCount` 1) and `na-delayed` (R:464–527, Completed) must not satisfy any Error expectation. This prevents accepting "any Error" or "any response".
- **P6.** All 12 receipt `after.responses` arrays equal their raw `toolResponded` params (machine-checked, §13). Any oracle that re-derives `responses` must reproduce this equality on the retained rows.

## 8. Red controls (coherent mutations; each must fail with the named finding, not evidence_digest)

Each control mutates the raw trail and mirrors the change in the receipt summary. Digest links are refreshed per §9. Expected verdict: `failed` with the named finding.

- **R1** `na-reject` errorText set to the programming-error literal. *(semantic_error)*
- **R2** `na-throw` errorText set to `respondWith promise was rejected`. *(semantic_error)*
- **R3** `na-throw` errorText containing `dummy submit handler throw`. *(semantic_error)*
- **R4** `na-reject` errorText with a trailing period added. *(semantic_error)*
- **R5** `na-invalid-submit` errorText with its trailing space removed. *(semantic_error)*
- **R6** `auto-invalid` errorText set to the programming-error literal. *(semantic_error)*
- **R7** `na-reject` status `Canceled`, text unchanged. *(semantic_status)*
- **R8** `auto-positive` status `Error` with a validation-prefixed text. *(semantic_status)*
- **R9** `na-reject` `pageState.errors` set to `[]`. Must update three places: `RAW` observation frames, `RAW` `pageObservations`, and `R` `pageState`. *(semantic_error)*
- **R10** `na-throw` navigations containing a `/landing` frame navigation. *(semantic_navigation)*
- **R11** `na-invalid-submit` submits containing one record. *(semantic_error)*
- **R12** `auto-invalid` toolResponded frame moved after the pre-action observation, so `preAction.responseCount` becomes 0. Requires renumbering `seq` (`CTR` L118 requires `seq = index + 1`) and refreshing `pageObservations` `seq`/`at`. *(semantic_timing)*
- **R13** `na-throw` `pageState.errors` set to `["Uncaught Error: dummy rejection"]`. *(semantic_error)*
- **R14** Add `output: {}` to an Error response. *(semantic_error)*
- **R15** Digest-chain-only control: change one `RAW` byte without refreshing `R`. Must produce `evidence_binding`, not a semantic finding.

**[I]** By reading `CTR` L104–143, R1–R14 would still count 12 under the frozen counter if the execution artifacts were refreshed. Not executed. This is the gap the new oracle must close.

## 9. Digest chain and test-construction notes

- Chain: `RAW` case JSON → `R` `cases[i].evidence.sha256` (R:399, 461, 569, 677) → `R` file sha (`4bc79636…`) → `.ufo/waves/round-21/runtime-execution-finalized.json` `receiptSha256` (L47) and `artifacts[<path>]` (25 entries, including `RAW`, `FIX`, and `R`). **[V]**
- `CTR` reads the execution file (`CTR` L70, `execution_binding`). If the new oracle reads it too, a case-only mutation yields `execution_binding`, not a semantic finding. QUALITY.md criterion 56 (`corpus/QUALITY.md:269–275`) requires the semantic finding.
- Mutations of `RAW` must also update the mirrored receipt summary. `CTR` checks `summary_mismatch` (L139) by deep equality, and `window_mismatch` (L138) by windowMs and ordering. The tests must mutate both consistently.

## 10. Frozen counter boundary (read-only)

- `CTR` CONFIG (L11–18) matches `PROD` CASES (L16–26) for all 12 rows. **[V]**
- `CTR` `FINDINGS` (L33) has no `semantic_*` identifiers. **[V]**
- `CTR` never names `errorText`, `output`, `respondWith`, `Completed`, or `Canceled`. `status` appears only as process and git return codes (L146, L159). These fields enter the counter only through whole-object deep equality (L139). **[V]**
- `summary_mismatch` (L139) compares mirrored summaries to raw events by deep equality. `window_mismatch` (L138) checks `windowMs` and ordering. Both are structural.
- Return value (L143): `result(findings.length ? 0 : cases.length)`. Count is 12 when structural checks pass. **[V]**
- QUALITY.md criteria 55–56 (`corpus/QUALITY.md:263–275`) already state this separation.

## 11. Out-of-scope observations (for L1)

- `.ufo/waves/round-21/runtime-execution-finalized.json` L5: `"measuredRevision": "uncommitted"`. L15 reason: a re-execution after evidence-preservation repair. The acquisition is bound to bytes, not to a commit. A `revision_input` finding must not claim commit-level provenance. **[V]**
- `T11` above (`na-native-submit` pageState shape) affects every oracle that reads `pageState` generically.

## 12. Confidence and inference labels

- **High, verified.** Literal provenance and branch mapping for `na-reject`, `na-throw`, `na-invalid-submit`, `auto-invalid`. Digest chain. One `toolResponded` per error row. Receipt-to-raw equality for all 12 rows.
- **Medium.** CDP transport is verbatim: equality is machine-verified, but the transport code is not retained. `auto-invalid` pre-action timing: `seq` order in raw, plus `S100:218–220`.
- **Low, not claimed.** Locale of validation text. `ErrorEvent` message format. DOM listener-exception semantics. The throw-before-preventDefault class. respondWith-without-preventDefault behaviour.

## 13. Checks run and not run

- Run (read-only): `sha256sum`, `cmp`, `gzip -dc`, `base64 -d` on the retained files in §1.
- Run (read-only): one Python pass that parsed `R` and each `RAW` case file, compared each case's `after.responses` with its raw `WebMCP.toolResponded` params (all 12 equal), and matched the source literals by line range in `S100` (`326`, `808–813`, `733`, `750`, `752`). All four error texts matched. It also read the per-row fields used in §6 (`preAction`, `submits`, `navigations`, `pageState`) and confirmed the table in §6 for the four Error rows and `auto-positive`.
- Read or grep only: `PROD`, `FIX:*`, `RAW:*`, `R`, `S100`, `NOTE`, `corpus/QUALITY.md`, `CTR`, `.ufo/waves/round-21/runtime-execution-finalized.json`, `.ufo/waves/round-21/sources/`.
- Not run: any test, build, linter, formatter, browser, network request, or producer invocation. No installs were needed or performed. No peers were messaged.
