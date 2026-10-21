# SourceLC01: LC01 `toolautosubmit` presence determines `require_submit_button`

Scope: Chromium 154.0.8037.97 `html_form_element.cc` (S096 pinned body), lines 181-186. Source-only. No build, browser, or runtime observation.

## Verdict

CONFIRMED as stated. `require_submit_button` is exactly the negation of `toolautosubmit` attribute presence on the form. Presence is its only input. The variable is assigned once in `HTMLFormMcpTool::ExecuteTool` (lines 174-222) and never reassigned there.

## Condition and outcome

| Case | Condition (`form_->FastHasAttribute(html_names::kToolautosubmitAttr)`) | `require_submit_button` | Effect inside 181-186 |
|---|---|---|---|
| A | true (any value, including empty) | false | `if (!require_submit_button)` at 183 records `WebFeature::kModelContextExecuteDeclarativeAutosubmit` via `UseCounter::Count` (184-185) |
| B | false (attribute absent) | true | none in span |

## Quote (at most 25 words, source lines 181-182)

- Primary: `bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);` (4 words; L181 `bool require_submit_button =` and L182 `!form_->FastHasAttribute(...)`, whitespace-normalized across the line break)
- Single-line fallback: `!form_->FastHasAttribute(html_names::kToolautosubmitAttr);` (L182)

## Proposed decision row

Manifest object:

```json
{"id":"LC01","condition":"form has toolautosubmit attribute, any value, when ExecuteTool runs","outcome":"require_submit_button=false and kModelContextExecuteDeclarativeAutosubmit counted; attribute absent gives require_submit_button=true","startLine":181,"endLine":186,"quote":"bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);"}
```

Skill row (no pipe inside cells):

`| LC01 | toolautosubmit attribute present at ExecuteTool time, any value | require_submit_button false and autosubmit use counter recorded; absent gives true | S096:181-186 |`

## Caveats

1. **Presence, not value.** Blink `Element::FastHasAttribute` is `CouldHaveAttribute(name) && HasElementData() && GetElementData()->Attributes().Find(name)` (element.h:2822-2828 for the QualifiedName overload; same shape at 2831-2837 for QualifiedNameWithHash). `CouldHaveAttribute` is a bloom-filter precheck commented "Is allowed to return false positives" (element.h:898-899), so it cannot hide a present attribute. `toolautosubmit=""` and `toolautosubmit="false"` both take case A. element.h was read from the Chromium 154.0.8037.97 tag for this check. It is not registered in `corpus/SOURCES.md`.
2. **Name mapping.** `html_names::kToolautosubmitAttr` to the literal `toolautosubmit` comes from Blink's generated-name convention [INFERENCE; generated html_names is not pinned]. Corroborated by the literal spelling in `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html:6`.
3. **Live read versus cached flag.** ExecuteTool reads presence at invocation (L182). Registration caches `has_toolautosubmit` (L416-417, passed at L458) and compares it for change detection (L437). `AttributeChanged` (L1130-1135) calls `ScheduleDeclarativeWebMCPToolRegistration` (defined L353), which posts `RegisterDeclarativeWebMCPTool` as a cancellable task (L402-406). The cached flag can lag the live attribute until that task runs. LC01 follows the live value. Source-level only; the lag window is untested.
4. **Outcome scope.** This span decides only the boolean and a telemetry counter. Downstream effects belong to other rows: argument to `FillFormControls` (L192-193; parameter L234); missing-button error (L251-256, LC03 span 249-258); focus and `PauseExecution` (L212-217, LC04 span 212-218); `PrepareForSubmission` (L219-220, LC05 span 218-221). These are cited only, not assessed.
5. **Telemetry, not behavior.** The use counter is recorded only in case A. It is not a runtime claim.
6. **Source-only.** Chromium 154.0.8037.97. Not runtime-observed. No build or test was run.

## Existing round-19 coverage: NOT HELD

- **Bytes already retained.** `corpus/evidence/round-19/sources/html_form_element.cc.gz` decompresses to bytes identical to the round-20 pinned file (`cmp` identical; sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`). No new source acquisition is needed.
- **Claim not held.** `corpus/knowledge/webmcp-declarative-validation-round-19.md` lines 15-20 expressly exclude "forms without `toolautosubmit`", so case B is outside that note's claims. The note never names `require_submit_button`, `FastHasAttribute`, the 181-186 span, or the use counter. Its S078 citations are `:729-751` (line 40) and the generic validation-error path (line 106). Its S096 entries (lines 129-131) concern the navigation sentinel.
- **Evidence grep.** `corpus/evidence/round-19` returned no matches for `require_submit`, `submit button`, `kMissingRequiredSubmitButton`, or `FastHasAttribute(html_names::kToolautosubmit`.

## Registry and design checks

- Pinned file sha256 matches `design.json` S096 (`8c8d6796...6916`). The file has 1740 lines.
- `corpus/SOURCES.md:110` lists S096 as `html_form_element.cc:174-328,729-758,818-842`, which contains 181-186.
- The design span `[181,186]` for LC01 matches the source lines.

## Checks run

Read-only. No files written other than this report. No installs or updates. Used existing `sha256sum`, `gzip`, `cmp`, `curl`, `base64`, and `grep`. No tests, builds, or formatters.
