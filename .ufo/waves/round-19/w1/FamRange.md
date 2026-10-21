# FamRange — round 19 W1 / C1 depth

**Verdict:** Added five runtime-observed declarative WebMCP decisions. All five matched on both probe passes; no observed nondeterminism. The raw CDP and post-invoke evidence is retained in `corpus/evidence/round-19/validation/probes/range-color.json`.

## Probe conditions

Chromium `154.0.8037.97` (`/usr/bin/chromium`), Playwright `1.64.0`, Node `v24.21.0`; loopback fixture server bound only to `127.0.0.1`. The throwaway probe is `/fast/scratch/tabi-r19/FamRange-probe/probe.mjs` and is not committed. The effective Chromium argv recorded in the probe retained WebMCP features merged with Playwright defaults, host-resolver deny, `--remote-debugging-pipe`, a private scratch `user-data-dir`, no remote-debugging port, and no `--no-sandbox`. Every case ran `WebMCP.enable`, captured the complete `toolsAdded` schema, invoked with recorded `frameId`/`toolName`/`input`, waited for `toolResponded` with an 8-second bound, and captured `window.__obs.calls` plus control states. Both pass summaries match for every case. No network requests were blocked; the fixture server saw only loopback requests; Chromium PIDs and per-pass private run directories were absent after cleanup.

The observed schema was `range: {type: number, minimum: 0, maximum: 10, multipleOf: 2}` and `color: {type: string, format: ^#[0-9a-zA-Z]{6}$}`. `toolResponded.status` was `Completed` in every case and the event had no `errorText` property (the retained summary normalizes this to `null`). Each form submitted once.

## Observed cases

| Case | Input | Observed status / errorText / fields | Source anchor |
|---|---|---|---|
| `decl-range-color-01` | `{"range":99,"color":"#123456"}` | `Completed` / absent / `{"range":"10","color":"#123456"}` | `form_mcp_schema.cc:321-334` |
| `decl-range-color-02` | `{"range":"not-a-number","color":"#123456"}` | `Completed` / absent / `{"range":"6","color":"#123456"}` | `form_mcp_schema.cc:321-334` |
| `decl-range-color-03` | `{"range":4,"color":"red"}` | `Completed` / absent / `{"range":"4","color":"#ff0000"}` | `form_mcp_schema.cc:302-318` |
| `decl-range-color-04` | `{"range":4,"color":"not-a-color"}` | `Completed` / absent / `{"range":"4","color":"#000000"}` | `form_mcp_schema.cc:302-318` |
| `decl-range-color-05` | `{"range":4,"color":"#12GG56"}` | `Completed` / absent / `{"range":"4","color":"#000000"}` | `form_mcp_schema.cc:302-318` |

The `red` row is a valid CSS color keyword used as a contrast case, not an invalid color: Chromium normalized it to `#ff0000` even though the advertised input schema shows a hex-shaped format. Both invalid color strings fell back to `#000000`. For nonnumeric range input the tool did not reject; the control submitted `6`, a valid value for `min=0`, `max=10`, `step=2`.

## Source verification

Fetched from Chromium tag `154.0.8037.97` on `2026-10-21`; SHA-256 values below are over the decoded Gitiles `?format=TEXT` source bodies.

| File | URL | Decoded-body SHA-256 |
|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |

Relevant verbatim excerpts (each quote is under 25 words):

- `form_mcp_schema.cc:316` (numeric-independent text controls): “`return !input->SanitizeValue(s).empty();`”
- `form_mcp_schema.cc:329-332` (range/number validation): “`return !number_string.empty() && !input->SanitizeValue(number_string).empty();`”
- `form_mcp_schema.cc:474-481` routes range to `FillNumberData` and color to `FillTextData`; the corresponding input setters are at `950-959` (`FillNumberData`) and `933-948` (`FillTextData`).
- `html_form_element.cc:218-220` submits on the fixture's `toolautosubmit`: “`form_->PrepareForSubmission(/*event*/ nullptr, submit_button);`”

## Risks, checks, and blockers

- Evidence is scoped to this Chromium build, this fixture, `range` bounds/step, and the five recorded inputs; it does not establish behavior for every input constraint or browser version.
- The run used the already-installed Playwright `1.64.0`; no tools were installed or updated.
- No build, lint, or test suite was run; the requested runtime probe was run twice per case. No blockers.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamRange`
- Branch: `r19/FamRange`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `ccff39a822e2c493a2ab6551e401404f35aa5bb9`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/range-color.json`
  - `corpus/evidence/round-19/validation/fixtures/range-color.html`
  - `corpus/evidence/round-19/validation/probes/range-color.json`
