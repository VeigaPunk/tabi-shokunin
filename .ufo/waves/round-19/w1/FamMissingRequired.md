# FamMissingRequired-4 — round 19 W1 findings

## Result

Added the `missing-required` declarative-WebMCP family with four observed cases, its loopback fixture, and the retained raw CDP probe record. Runtime: Chromium `154.0.8037.97`, Playwright `1.64.0`, Node `v24.21.0`. The fixture SHA-256 recorded by the probe is `bfadfce920424be159807251a1432c986d6e7a724024434e6baf0c3224fc4822`.

The throwaway probe was kept at `/fast/scratch/tabi-r19/FamMissingRequired-4-probe/probe.mjs`, outside the clone. It used the round-18 WebMCP feature switches merged with Playwright 1.64.0's default feature switches, `/usr/bin/chromium`, a CDP session from `context.newCDPSession(page)`, a loopback-only `127.0.0.1` fixture server, the deny rule `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`, `acceptDownloads:false`, and unique private HOME/TMPDIR directories under `/fast/scratch`; the script closed Chromium and removed its run directory. Every case was run twice with fresh contexts. The two repetitions had identical schemas, statuses, error text, submit counts, and field states; no outcome nondeterminism was observed. Frame and invocation IDs differed as expected between contexts.

An initial launch attempt aborted before any case because Chromium's temporary SingletonSocket path was too long. The probe used a shorter private scratch run path on retry and completed both repetitions; no check suite or round-19 harness was run.

## Per-case evidence

| Case | Input → observed status / errorText | submitCount; post-invoke fields | Source anchor |
|---|---|---|---|
| `decl-missing-required-01` | `{}` → `Error` / `Form validation failed: required: Please fill out this field.. ` | `0`; `required=""`, `optional=optional-default` | `html_form_element.cc:729-758` |
| `decl-missing-required-02` | `{"required":""}` → `Error` / `Form validation failed: required: Please fill out this field.. ` | `0`; `required=""`, `optional=optional-default` | `html_form_element.cc:729-758` |
| `decl-missing-required-03` | `{"required":null}` → `Error` / `Invalid value for parameter required` | `0`; both fields remain at their defaults | `form_mcp_schema.cc:208-230` |
| `decl-missing-required-04` | `{"required":"provided-required"}` → `Completed` / `null` | `1`; `required=provided-required`, `optional=optional-default` | `form_mcp_schema.cc:208-243` |

The emitted schema marks only `required` as required. With the initially empty required control, omitting its key and supplying `""` both leave it empty and produce the same native validation Error before submit; `null` fails text conversion before any field mutates. When `required` is supplied, omitting `optional` leaves `optional-default` unchanged and includes it in submitted `FormData`.

## Retained evidence and source provenance

- Case contract: `corpus/evidence/round-19/validation/cases/missing-required.json`.
- Fixture: `corpus/evidence/round-19/validation/fixtures/missing-required.html`.
- Raw CDP request parameters, `toolsAdded` schemas, `toolInvoked`/`toolResponded` parameters, form observations, and second-repetition results: `corpus/evidence/round-19/validation/probes/missing-required.json`.
- Chromium Gitiles source bodies were fetched as `?format=TEXT` at tag `154.0.8037.97`, decoded from base64, then hashed. Access date for both URLs: `2026-10-21`.
  - `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`, lines 208-243: “// If the data isn't valid, form control states remain unchanged.” (line 210); “// Now apply the values. This step must not fail.” (line 234); `if (s.empty()) {` / `return true;` (lines 311-312). URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT. SHA-256 of decoded body: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc`, lines 729-758: `error_message.Append("Form validation failed: ");` (line 733); `error_message.Append(control->validationMessage());` (line 751). URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT. SHA-256 of decoded body: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

## Risks and blockers

No blockers. The native `validationMessage()` wording is locale-dependent; the throwaway browser environment used `LANG=C.UTF-8`, and cases assert the observed error substring. No tools were installed or updated.

Lane master ref observed read-only as `66251bfc1aef393e4aec599e950a8deb867736bb`.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamMissingRequired-4`
- Branch: `r19/FamMissingRequired-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `2298b9ceda3e01d3f465c903e9fbcdef585793f3`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/missing-required.json`
  - `corpus/evidence/round-19/validation/fixtures/missing-required.html`
  - `corpus/evidence/round-19/validation/probes/missing-required.json`
