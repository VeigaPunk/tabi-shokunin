# AttackLC03: missing required submit button error (round 20, C1, source-only)

Seat: `TabiR20.AttackLC03` (leaf; no dispatch). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. HEAD `c49929430d996b016dde2e3a3a5be380f3433fdb` equals the baseline. No production edits; this file is the only write.

Target: LC03, `corpus/evidence/round-20/sources/html_form_element.cc:249-258` (S096), inside `HTMLFormMcpTool::FillFormControls` (S096:231-259). Scope: source-only, Chromium 154.0.8037.97. Not runtime-observed.

## Verdict

LC03 is supportable as one narrow, conditional, source-only row. Three things break it: dropping the `toolautosubmit` condition, reading `SubmitButton() == nullptr` as "the form has no submit button", and carrying the agent-visible error or its CDP mapping into a row whose span does not cover them. Acceptable wording is in section 5.

## 1. Evidence verified

- S096 body `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796...6916`, equal to `design.json` `source.sha256`. Read 174-259 and 1484-1495.
- S077 body `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`: decoded sha256 `904b75e7...2152f`, equal to the r19 note. Read as archive member `form_mcp_schema.cc` at 117-119, 208-210, 1238-1258.
- S096 also decodes from the tracked `corpus/evidence/round-19/sources/html_form_element.cc.gz` to sha256 `8c8d6796...`.
- `git ls-files` on the round-20 S096 body exits 1: untracked. The round-19 gzips are tracked. This matches ScribeGate F1.
- Registry: `corpus/SOURCES.md:93` (S079, mined), `:94` (S080, queued), `:111` (S097, mined). No file with the S097 name or hash `1cc55ef9...` exists anywhere in the tree (glob empty).
- r19 note `corpus/knowledge/webmcp-declarative-validation-round-19.md`: `:17-19` scope exclusion, `:35-42` two error classes, `:71-72` principles, `:120-122` source-token caveat. README `:409-410`. Round-19 `validation/decisions.json` DV-06 and DV-07.
- Absent: `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `.ufo/waves/round-20/measure-c1.mjs`. Only `counts.mjs` exists, and it has no quote or span matching.

## 2. Branch map

| Lines | Code (abridged) | Decides |
|---|---|---|
| 181-182 (ExecuteTool, LC01) | `require_submit_button = !form_->FastHasAttribute(toolautosubmit)` | Attribute presence, not value. True only when the attribute is absent. The name is the inverse of what the attribute means. |
| 249 | `FormMCPSchema mcp_schema(*form_)` | Constructor calls only `ProcessForm` (S077:117-119). Collects controls; no `FillData`. |
| 250 | `*submit_button = mcp_schema.SubmitButton()` | Accessor body not retained. Retained assignment is `submit_button_ = form_control` at S077:1247-1248. |
| 251 | `if (!*submit_button && require_submit_button) {` | The only error condition. Both halves must hold. |
| 252-255 | `return ScriptToolError(kMissingRequiredSubmitButton, "No submit button ...")` | Returns before `FillData`. |
| 258 | `return mcp_schema.FillData(*json_obj)` | Not reached on the LC03 path. |

Selection rule (S077:1238-1248): `ProcessForm` walks `form.ListedElements()`. It skips any `HTMLFormControlElement` with `IsDisabledOrReadOnly()` (1241-1242) before testing `IsSuccessfulSubmitButton()` (1247), and keeps the first match. There is no visibility or focusability test. The predicate bodies are not retained.

Precedence: JSON parse and object checks (S096:237-247) run before 251. `FillData` validation (S077:208-243) runs after 251. LC03 therefore preempts argument-validation errors.

Side effects on the LC03 path, from the retained bodies: no DOM or control write (`FillData` not reached; `ProcessForm` writes only `FormMCPSchema`-internal maps; the only `AddConsoleMessage` is in `AddPattern` at S077:1134). Two writes happen before the check and persist: `invocation_id_` (S096:178) and the use counter `kModelContextExecuteDeclarativeTool` (S096:179-180), which counts attempts.

## 3. Primary attack (A1): unconditional overclaim

**False stronger claim:** "A declarative form with no submit button always fails with kMissingRequiredSubmitButton before any field is filled."

**Why source defeats it:**
- The error needs `require_submit_button` (S096:251), which is `!FastHasAttribute(toolautosubmit)` (S096:181-182). With the attribute present the check is skipped. `FillData` runs (S096:258) and the success path calls `PrepareForSubmission(nullptr, submit_button)` (S096:218-220) with whatever `SubmitButton()` returned, which may be null.
- "No submit button" is not the claim. `SubmitButton()` is null whenever no form-associated control that is neither disabled nor readonly qualifies (S077:1241-1248).
- "Before any field is filled" holds only on the non-autosubmit branch.

**Acceptable wording:** "For a form without the `toolautosubmit` attribute, when `SubmitButton()` returns null, `FillFormControls` returns `kMissingRequiredSubmitButton` before `FillData` (S096:251-258). When the attribute is present this check does not run (S096:181-182, 251)."

## 4. Secondary attacks

**A2. "The form has no submit button."** Defeated by S077:1241-1242: a disabled or readonly control is never a candidate, so a form whose only submit control is disabled gets the same return when the attribute is absent. Also, S077:1238-1248 has no visibility or focusability test, so a non-null result does not mean the button is visible or focusable. The `submit_button->Focus()` call at S096:215 depends on that separately (LC04 domain). A disabled `fieldset` may also exclude a control, if `IsDisabledOrReadOnly()` follows Blink's usual definition [INFERENCE: body not retained].
*Acceptable:* "`SubmitButton()` returns null: no form-associated control that is neither disabled nor readonly satisfies `IsSuccessfulSubmitButton()` (S077:1241-1248; predicate body not retained)."

**A3. Precedence.** "For a button-less form, argument errors come back as `kMissingRequiredSubmitButton`," or its inverse, "unknown keys return `kInvalidInputArguments`." Both are wrong for different inputs. Unparseable or non-object input returns `kInvalidInputArguments` first (S096:237-247). A JSON-object input returns LC03 before any key or value is checked (S096:251-258 precede S077:208-243).
*Acceptable:* "For a non-autosubmit form with no enabled submit control, a JSON-object argument string returns `kMissingRequiredSubmitButton` before argument validation runs. Unparseable or non-object input returns `kInvalidInputArguments` first (S096:237-247)."

**A4. Agent-visible error and CDP mapping.** The span ends at the `done_callback` call (S096:196-197, LC02). The CDP mapping (status `Error`, `errorText`, no exception) sits in the inspector emitter. S079 (`SOURCES.md:93`, mined) says other `ScriptToolError`s map to `Error`. S080 (`:94`, queued) says the error enum "is not exposed as a distinct CDP field" and states the mapping only for `kInvalidInputArguments`. The emitter body is not retained in this lane. Round 19 does not cover forms without `toolautosubmit` (r19 `:18-19`; README `:409-410`).
*Acceptable:* "Source-level: `ExecuteTool` passes the error to the done callback (S096:196-197; LC02). What the agent receives is not established by this span and is not runtime-observed."

**A5. Completion and cleanup.** "Every completion goes through `CallDoneCallback`, so the LC03 path clears invocation state" is false. LC03 runs the `ExecuteTool` parameter `done_callback` directly (S096:196-197). `CallDoneCallback` (S096:261-275) never runs, so its cleanup (`is_currently_running_`, `invocation_id_`, pseudo-states) does not run. `invocation_id_` set at S096:178 stays set. `ExecuteTool` has no `is_currently_running_` check before that overwrite. Any caller-level re-entry guard is outside the retained bodies (unverified; flag to LC02).
*Acceptable:* "This is an entry rejection: the invocation completes with an error through the `ExecuteTool` done callback (S096:196-197), not `CallDoneCallback`. It sets no running state and fills no control. It does not clear `invocation_id_` (S096:178)."

**A6. The chosen button is the form's default button.** The `DCHECK_EQ(submit_button_, form.FindDefaultButton())` at S077:1258 is debug-only. `FindDefaultButton()` (S096:1485-1495) applies no disabled or readonly filter, but `ProcessForm` does. So a disabled first submit control can make the DCHECK fail in a debug build [INFERENCE: requires `CanBeSuccessfulSubmitButton()` to accept disabled controls; body not retained]. Release builds have no such check.
*Acceptable:* "A debug-only DCHECK (S077:1258) compares `SubmitButton()` with `FindDefaultButton()`. The two selection rules differ on disabled controls, so their equality is not a release-build guarantee."

**A7. Evidence-class traps.**
- The r19 `missing-required` family (DV-06, DV-07; fixture line 8) tests a required text control on a `toolautosubmit` form. It does not exercise this branch. "Required" in LC03 means `require_submit_button`, not the HTML `required` attribute.
- `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` (tracked) decodes to a Google API `NOT_FOUND` response, not a unit test. No retained test covers this branch.
- r19 measured two error classes (`kInvalidInputArguments`, `kToolInvocationFailed`; `:35-42`). LC03 is a third code, raised before `FillData`. Do not file it under either class. The r19 "a fill-time error means nothing changed" principle (`:71-72`) was measured only on `toolautosubmit` forms.
- "WebMCP requires a submit button" is a Chromium implementation check. S087 defines no declarative validator (r19 `:17-18`).
- `require_submit_button` is true when the attribute is absent. Do not write it as a requirement triggered by the attribute.

**A8. Quote and span rules.** The message is two C string literals (S096:254-255). The joined 17-word sentence is not a literal substring of the file; quote one physical fragment. The LC03 span is 249-258. The ScribeChecklist #1 citations of 196-198 and 204 for LC03 are LC02 evidence (span 189-210) and must move to the LC02 row. The `SubmitButton()` selection rule lives in S077, not S096: cite S077 for "enabled", or drop that qualifier.

**A9. Evidence pointer.** The S096 retained body is untracked (section 1). Until it is committed, cite the tracked round-19 gzip `corpus/evidence/round-19/sources/html_form_element.cc.gz`, which decodes to the same sha256.

## 5. Acceptable wording

Skill row (no pipes inside cells):

`| LC03 | no toolautosubmit attribute and SubmitButton() returns null | FillFormControls returns kMissingRequiredSubmitButton before FillData; source-only, not runtime-observed | S096:249-258 |`

Manifest entry (quote is a literal substring of S096:251):

`{"id":"LC03","condition":"no toolautosubmit attribute and SubmitButton() returns null","outcome":"FillFormControls returns kMissingRequiredSubmitButton before FillData; source-only, not runtime-observed","startLine":249,"endLine":258,"quote":"if (!*submit_button && require_submit_button) {"}`

Quote options (each a literal substring of the span):
- `if (!*submit_button && require_submit_button) {`: S096:251 (preferred; carries the condition)
- `ScriptToolErrorCode::kMissingRequiredSubmitButton,`: S096:253
- `No submit button was found, but for a form without `toolautosubmit`,`: S096:254 (11 words)
- `there must be a submit button`: S096:255 (6 words)

Not acceptable: the full sentence as one quote.

Note paragraph (new text, source-only):

> LC03 (S096:249-258; Chromium 154.0.8037.97; source-only, not runtime-observed). For a form without the `toolautosubmit` attribute, when `SubmitButton()` returns null, `FillFormControls` returns `kMissingRequiredSubmitButton` before `FillData` runs (S096:251-258). With the attribute present the check is skipped (S096:181-182). `SubmitButton()` is null when no form-associated control that is neither disabled nor readonly satisfies `IsSuccessfulSubmitButton()` (S077:1241-1248; predicate not retained). The running state is not set on this path (S096:204 follows the return; see LC02). Round 19 did not measure forms without `toolautosubmit` (r19 note `:18-19`), so no runtime claim is made.

## 6. Not exercised and gaps

- No build, test, browser, CDP, or fixture run. Source reading, retained-archive reads, hashes, registry reads, and read-only git queries only.
- Unretained bodies: `SubmitButton()`, `IsSuccessfulSubmitButton()`, `CanBeSuccessfulSubmitButton()`, `IsDisabledOrReadOnly()`, `GetWebMCPParameterName()`, `InvocationId()`, `ScriptToolError`, and the inspector emitter (S097).
- The caller-level re-entry guard for `ExecuteTool` is not in the retained bodies.
- Absent in the tree: the lifecycle manifest, the round-20 note, and the counter named in `design.json`. No automated quote or span check exists in the tree, so the quotes in section 5 are unverified by any tool.

## 7. Tooling

No installs or updates. Read-only commands only: `sha256sum`, `zcat`, `git ls-files`, `git rev-parse`.

Report: .ufo/waves/round-20/w1/AttackLC03.md
