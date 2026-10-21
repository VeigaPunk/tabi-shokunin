# SourceLC03: missing required submit button error

Scope: S096 `corpus/evidence/round-20/sources/html_form_element.cc` lines 249-258 (design `decisions` LC03, span 249-258). Source-only, Chromium 154.0.8037.97. Nothing runtime-observed; nothing built or executed.
Pin check: `sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to design `source.sha256` and the r19 S078 body hash. No URL fetch was needed.
Tools: none installed or updated.

## Exact condition

Error iff, in `HTMLFormMcpTool::FillFormControls` (231-259), all of the following hold:

1. `input_arguments` parses as JSON. Otherwise `kInvalidInputArguments` (237-241).
2. The parsed value is a JSON object. Otherwise `kInvalidInputArguments` (243-247).
3. `mcp_schema.SubmitButton()` returns null (249-250).
4. `require_submit_button` is true. In `ExecuteTool`, this is `!form_->FastHasAttribute(kToolautosubmitAttr)` (181-182), passed at 192. This is a presence check; the attribute value is not read in S096.

Gate literal (S096:251): `if (!*submit_button && require_submit_button) {`

## Exact outcome

- `FillFormControls` returns `ScriptToolError{kMissingRequiredSubmitButton, "No submit button was found, ..."}` (252-255). `*submit_button` is null.
- `FillData` (258) is not called. The path applies no fill and produces no field-level error.
- The `ExecuteTool` error branch (196-198) invokes `done_callback` synchronously with `base::unexpected(error)` and returns.
- Not reached: running-state writes (204-206, 210), `Focus()` (215), `PauseExecution()` (217), `PrepareForSubmission` (220).
- Precedence: the JSON-parse and non-object errors (238-247) win over this error. This error wins over every `FillData` error, because `FillData` is not reached.

## Strongest quote (17 words, <=25)

> "No submit button was found, but for a form without `toolautosubmit`, there must be a submit button"

Source: S096:254-255 (two adjacent C++ string literals, concatenated).

## Independent assessment

- Topic and span are correct. Span 249-258 is broader than the error: 249-250 set up the predicate and 258 is the non-error return. The error block alone is 251-256.
- LC03 is "before running state", not "no state change". `invocation_id_ = invocation_id;` runs at 178, before the error return. It is cleared only in `CallDoneCallback` (270), which this path bypasses. S096 never reads `invocation_id_`. `UseCounter` `kModelContextExecuteDeclarativeTool` (179-180) also fires before the error. Any outcome wording should say so.
- The gate reads the live DOM at invocation (181-182). The registered tool caches `has_toolautosubmit` at registration (416-417, stored at 458). Re-registration runs in a posted task (402-406), so an attribute flip can precede re-registration. S096 does not show whether an invocation can land in that window. [INFERENCE: reachability unverified]
- Attribution: r19 dossier `.ufo/waves/round-19/w1/SrcChromeDeclDocs.md:81` says `ExecuteTool()` "requires a submit button". The check actually lives in `FillFormControls` (251-256), reached from `ExecuteTool` at 192.

## Caveats

1. Source-only. No r19 runtime case covers a form without `toolautosubmit` (r19 note lines 18-19; README 409-410). The `RuntimeMissingRequired` family (`.ufo/waves/round-19/w2`, fixture `missing-required.html:9`) covers a `required` text input under `toolautosubmit`. It does not cover this error.
2. `SubmitButton()` is not defined in S096. No searched retained artifact quotes it (`.ufo/waves/round-18`, `.ufo/waves/round-19`, `corpus/knowledge`, `corpus/lessons`). The grep tool cannot search the S077 `form_mcp_schema.cc.gz` body. Whether disabled or hidden buttons count is unverified here.
3. The wire-level status and errorText for this code are outside S096. Enum: `script_tool_types.h:17-21` (S080; `corpus/lessons/round-19.md:36`; `.ufo/waves/round-19/w1/SrcScriptToolError.gate.json:6`). Emitter per r19 dossier `SrcScriptToolError.md:52`: `inspector_web_mcp_agent.cc:241-243`. Not re-verified here.
4. Complement, not LC03: with `toolautosubmit`, line 251 is false. A null button then reaches `PrepareForSubmission(nullptr, submit_button)` (220). Null handling there is outside S096.

## Existing r19 coverage

**The r19 note does not hold LC03.** `corpus/knowledge/webmcp-declarative-validation-round-19.md` lists "forms without `toolautosubmit`" under "Not claimed" (lines 18-19). `corpus/README.md` 409-410 lists the same as not exercised. The note's S078 citations are lines 2, 40 (`:729-751`) and 106. None covers 249-258. Its only S096 reference (lines 129-131) concerns the navigation null-String sentinel.

The source-level facts are held in r19 wave dossiers, not in the note, and remain source-only:
- `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:19`: missing button rejected only when required (249-256); `FillData` at 258 follows.
- `.ufo/waves/round-19/w1/SrcScriptToolError.md:33`
- `.ufo/waves/round-19/w1/SrcChromeDeclDocs.md:82`

Report: .ufo/waves/round-20/w1/SourceLC03.md
