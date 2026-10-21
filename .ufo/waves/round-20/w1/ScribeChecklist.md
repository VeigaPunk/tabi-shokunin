# ScribeChecklist — declarative WebMCP completion lifecycle checklist (round 20, source-only)

Scope: source reading of Chromium 154.0.8037.97 `html_form_element.cc` (S096). Not browser-observed; no runtime, capability, or page behavior is claimed. Line refs are `S096:START-END` in `corpus/evidence/round-20/sources/html_form_element.cc`.

Input pin verified: `sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines; matches `.ufo/waves/round-20/design.json` `source.sha256`.

## Checklist (4 lines)

1. Entry: if `toolautosubmit` is absent, `require_submit_button` = true (S096:181-182); a JSON, object, or FillData error, or a missing submit button when required (S096:251-255), returns before `is_currently_running_` is set (S096:196-198, 204). [LC01, LC02, LC03]
2. Running branch: without `toolautosubmit`, focus the submit button and `PauseExecution()` and stay running, which is not completion (S096:212-217); with `toolautosubmit`, call `PrepareForSubmission(nullptr, submit_button)` immediately (S096:218-221). [LC04, LC05]
3. Submit outcome: `respondWith` resolve yields a JSON-stringified object or `kToolInvocationFailed` if stringify fails (S096:298-318); reject yields `kToolInvocationFailed` (S096:320-327); `preventDefault` without `respondWith` yields a programming-error callback (S096:807-813); a late response after the tool stopped running is ignored (S096:294-297). [LC08, LC09, LC10, LC11]
4. Completion: only `CallDoneCallback` clears running, invocation, and pseudo-state, and it is a no-op when no callback is held (S096:261-275); cancel is `kToolCancelled` (S096:224-229); a scheduled navigation resolves `ok(String())`, a null String sentinel rather than JSON null (S096:825-829). [LC06, LC07, LC12]

## Span check (read, not computed)

- LC01 181-186, LC02 189-210, LC03 249-258, LC04 212-218, LC05 218-221, LC06 224-229, LC07 261-275, LC08 290-298, LC09 298-319, LC10 320-327, LC12 818-830: each design span covers the cited branch.
- LC11 design span 787-815 is loose: the decision branch is 807-813; 787-788 is the `declarative_webmcp_call` re-evaluation. Manifest should cite 807-813 (or 807-815 with the re-evaluation named).
- LC12 design span 818-830: the decision is at 825-829; 818-824 is the surrounding `should_submit` gate.
- LC02 span 189-210 includes CEReactions and the fill call (189-194); the error return is 196-198.

## Findings

- Source comment `S096:201-203` (TODO: autosubmit should key off the attribute) describes an intended change; the executed branch keys off the attribute at `S096:212` and `S096:218`. The checklist follows executed code. Quote the code, not the TODO, in any decision row.
- Source reading only: a `CHECK` at `S096:794`, `S096:826`, and `S096:840` encodes invariants the source asserts, not runtime behavior. None is exercised here.
- Form reset (`S096:1101-1104`) and a form-submit-from-JS path (`S096:837-841`) also end a running tool, but neither appears among LC01-LC12; they are candidate additions for a later round, not part of this checklist.

## Limits

- Untested: no build, no browser, no CDP run, no fixture. Every line is source-scoped inference (QUALITY criterion 14).
- Not verified: the manifest `corpus/evidence/round-20/lifecycle/decisions.json`, the counter `measure-c1.mjs`, and the knowledge note were not read; this report does not assert their contents.

## Changes

- Wrote only this report file. No tool installs or updates.
