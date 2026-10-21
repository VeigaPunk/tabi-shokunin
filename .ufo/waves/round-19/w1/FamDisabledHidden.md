# FamDisabledHidden-4 — round 19 C1 evidence

## Result

Completed the `disabled-hidden` C1 family in the isolated clone: one fixture, four runtime decision cases, and the raw-CDP probe record. The exact retained production files are:

- `corpus/evidence/round-19/validation/fixtures/disabled-hidden.html`
- `corpus/evidence/round-19/validation/cases/disabled-hidden.json`
- `corpus/evidence/round-19/validation/probes/disabled-hidden.json`

The fixture has named disabled and readonly text inputs, a type=hidden input without `toolparamdescription`, an unnamed text input, a named baseline text input, and a distinctly named autosubmit button. The listener records `agentInvoked`, `isTrusted`, and `FormData`, prevents navigation, and responds through `SubmitEvent.respondWith`.

## Measured decisions

All rows describe the observed `WebMCP.toolsAdded` schema and `WebMCP.toolResponded` event. `fields` below are the post-invoke DOM input values captured by the probe, not just `FormData` entries.

| Case | invokeTool input | Schema result | toolResponded / submit | Post-invoke fields | Source anchor |
|---|---|---|---|---|---|
| `decl-disabled-hidden-01` | `{"disabledField":"disabled-after"}` | `disabledField` absent | `Error`; errorText `Input contains a parameter "disabledField" but there is no such parameter for the tool`; 0 submits | `baseline=baseline-before`, `disabledField=disabled-before`, `readonlyField=readonly-before`, `hiddenField=hidden-before`, `""=unnamed-before` | `form_mcp_schema.cc:1238-1246` |
| `decl-disabled-hidden-02` | `{"readonlyField":"readonly-after"}` | `readonlyField` absent | `Error`; errorText `Input contains a parameter "readonlyField" but there is no such parameter for the tool`; 0 submits | same five initial values as above | `form_mcp_schema.cc:1238-1246` |
| `decl-disabled-hidden-03` | `{"hiddenField":"hidden-after"}` | `hiddenField` absent | `Error`; errorText `Invalid value "hidden-after" for parameter hiddenField`; 0 submits | same five initial values as above | `form_mcp_schema.cc:1270-1287`; validation/error path `246-299`, `208-230` |
| `decl-disabled-hidden-04` | `{"":"unnamed-after"}` | empty-name property `""` is present as `{ "type":"string", "description":"Unnamed" }` | `Completed`; errorText null; 1 submit | `baseline=baseline-before`, `disabledField=disabled-before`, `readonlyField=readonly-before`, `hiddenField=hidden-before`, `""=unnamed-after` | `form_mcp_schema.cc:1238-1246`; schema emission `131-149` |

Every case's observed schema was the same: `properties` contains only `baseline` (`string`, description `Baseline`) and the empty-name field (`string`, description `Unnamed`); `required` is empty. Thus disabled and readonly controls are omitted and rejected as unknown parameters. The hidden input without a tool parameter description is omitted but is not rejected as unknown: it is found internally and rejected as an invalid value before mutation. The unnamed text field appears under the empty key and can be filled through an empty-key object member.

The successful unnamed case's submit listener observed `{agentInvoked:true,isTrusted:true}`. Its `FormData` fields were `baseline=baseline-before`, `readonlyField=readonly-before`, and `hiddenField=hidden-before`; the disabled and unnamed inputs were absent from `FormData`. The separate post-invoke control snapshot confirms the unnamed input's DOM value changed to `unnamed-after` despite the empty name.

## Probe, runtime, and retained bytes

The final fixture was run twice per case (eight total invocations across two fresh Chromium launches). The committed probe contains each run's raw `WebMCP.enable` result, full `toolsAdded` params including `inputSchema`, `invokeTool` params/result, `toolResponded` params, event list, and pre/post control state. Stability comparison reported `nondeterminism: []`. Each browser cleanup reported `browserClosed: true` and `remainingPids: []`; the loopback guard recorded no blocked requests. The final private `/tmp/fd4-*` root was removed (no matching directory remained).

Runtime identity recorded in the probe: Chromium `154.0.8037.97` via `/usr/bin/chromium`, Playwright `1.64.0`, Node `v24.21.0`. The launch guard observed `/usr/lib/chromium/chromium`, merged `CDPScreenshotNewSurface` with the WebMCP feature args, the deny-all-except-127.0.0.1 resolver rule, CDP pipe, no TCP debugging port, no `--no-sandbox`, and a profile under the private temp root. All recorded launch checks were true. `acceptDownloads:false` was set. No tool was installed or updated.

The initial fixture design gave the unnamed submit button no name; the committed fixture instead gives it `name="submitAction"` so it cannot share the empty parameter group with the unnamed text input. The empty-name control decision is therefore isolated from an unnamed-submit-button collision; that collision is outside this case family.

Retained file SHA-256 values:

- Fixture: `15b6233e1d4a0529f4790b4177820f2292ed00b8ac22b992c1b4210e0fd4e3f9`
- Cases: `cf85f0a96b9e05a33380451ee20bf20510d6ea0bcc17877fb9b3c6bec6eb6d71`
- Probe: `a2b33f3e01cf5d8dc6f41c2618787538707dce6ea773b61788dc48a9b42c7a77`

## Chromium source anchors

Fetched from Gitiles `?format=TEXT` and decoded on 2026-10-21. The quoted snippets are from the decoded files; combined source quotes below total fewer than 25 words.

- `form_mcp_schema.cc:1241-1243`: “if (form_control->IsDisabledOrReadOnly()) { continue; }” — excludes disabled and readonly controls before parameter names enter the schema map. At `1238-1246`, the remaining form-control name is stored without an empty-name check; `131-149` emits schema properties for ordered names.
- `form_mcp_schema.cc:1280-1282`: “case FormControlType::kInputHidden: return !ToolParamDescriptionAttribute(control).empty();” — in this fixture the hidden input has no tool parameter description. The validation dispatch at `246-299` falls through to false for it; `FillData` maps failed validation to the observed invalid-value error at `208-230`.
- `html_form_element.cc:1057-1062`: “if (!element.IsDisabledFormControl()) control->AppendToFormData(form_data);” — form-data construction excludes disabled controls; observed submission data independently confirms the hidden and readonly controls were included and the unnamed one was not.

Source URLs and decoded-body SHA-256 (access date 2026-10-21):

- `form_mcp_schema.cc` (`third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`, tag `154.0.8037.97`): https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT — `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` (51,703 bytes; 1,440 lines).
- `html_form_element.cc` (`third_party/blink/renderer/core/html/forms/html_form_element.cc`, tag `154.0.8037.97`): https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (68,278 bytes; 1,740 lines).

## Risks and blockers

No blocker. These are build-scoped observations from Chromium 154.0.8037.97 on loopback only. The hidden-control result is specifically for `type=hidden` without `toolparamdescription`; hidden controls with such a description and unnamed controls sharing their empty name with another control are not covered. No build, test suite, lint, or formatter was run; the only execution was the explicitly requested two-pass browser probe.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamDisabledHidden-4`
- Branch: `r19/FamDisabledHidden-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `815221fd9b3e508586cbdf7c429df410874666d1`
- Changed paths: `corpus/evidence/round-19/validation/cases/disabled-hidden.json`, `corpus/evidence/round-19/validation/fixtures/disabled-hidden.html`, `corpus/evidence/round-19/validation/probes/disabled-hidden.json`
