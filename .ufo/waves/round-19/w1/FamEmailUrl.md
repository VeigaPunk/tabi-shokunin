# FamEmailUrl — round 19 W1 findings

**Verdict:** Four runtime cases are ready for C1 integration. Chromium emitted `type: "string"` properties for both `type=email` and `type=url` with no `format`; malformed values remained filled, had `validity.typeMismatch === true`, and returned tool status `Error` without dispatching the submit listener. Valid values had no mismatch and completed one trusted, agent-invoked submit. Each case produced the same behavioral result in two independent runs.

## Artifacts

Only the assigned production files were written in the isolated clone:

- `corpus/evidence/round-19/validation/fixtures/email-url.html` — one declarative form with `type=email` and `type=url`, recording `{agentInvoked,isTrusted,fields}`, then `preventDefault()` followed by `respondWith(Promise.resolve(...))`.
- `corpus/evidence/round-19/validation/cases/email-url.json` — four cases, including exact expected statuses, error substrings, post-fill values, submit counts, and exact schema property objects (which intentionally omit `format`).
- `corpus/evidence/round-19/validation/probes/email-url.json` — raw CDP send/response records and params for `WebMCP.enable`, `Page.getFrameTree`, and `WebMCP.invokeTool`; raw `toolsAdded` schema and `toolResponded` event params; post-invoke `window.__obs.calls`, input values, and validity states for all cases in both runs.

The throwaway probe script is at `/fast/scratch/tabi-r19/FamEmailUrl-probe/probe.mjs`; it is not committed. It used Chromium 154.0.8037.97 (`/usr/bin/chromium`), Playwright 1.64.0 already present in the Node 24.21.0 installation, a loopback-only HTTP server bound to `127.0.0.1`, an exact-origin request route guard, the copied host-resolver deny rule, merged Playwright feature defaults, private per-run profile/HOME/TMPDIR, `acceptDownloads:false`, and Playwright's CDP pipe. The launch record captured the effective argv and guards. No tool was installed or updated.

## Per-case observations

The schema was identical in each case: `inputSchema.properties.email` was `{ "type": "string", "description": "Email" }`, and `inputSchema.properties.url` was `{ "type": "string", "description": "URL" }`. Neither property had `format`.

| Case | Input | `toolResponded` status / exact `errorText` | Post-invoke fields and validity | Submit calls | Source anchor |
|---|---|---|---|---:|---|
| `decl-email-url-01` | `email="not-an-email"`; `url="https://valid.example.test/"` | `Error`; `"Form validation failed: email: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "` | Both values retained; email `typeMismatch=true`, URL `false` | 0 | `form_mcp_schema.cc:556-568` (also type classification at `1270-1279`) |
| `decl-email-url-02` | `email="person@example.test"`; `url="https://valid.example.test/"` | `Completed`; `errorText=null` | Both values retained; both `typeMismatch=false` | 1 (`agentInvoked=true`, `isTrusted=true`) | `form_mcp_schema.cc:556-568` (also type classification at `1270-1279`) |
| `decl-email-url-03` | `email="person@example.test"`; `url="not-a-url"` | `Error`; `"Form validation failed: url: Please enter a URL.. "` | Both values retained; email `typeMismatch=false`, URL `true` | 0 | `form_mcp_schema.cc:556-568` (also type classification at `1270-1279`) |
| `decl-email-url-04` | `email="person@example.test"`; `url="https://valid.example.test/"` | `Completed`; `errorText=null` | Both values retained; both `typeMismatch=false` | 1 (`agentInvoked=true`, `isTrusted=true`) | `form_mcp_schema.cc:556-568` (also type classification at `1270-1279`) |

The corresponding native validation/error path is `html_form_element.cc:718-719` and `729-758`. The run-to-run behavior was stable for all four cases. Frame IDs and invocation IDs changed as expected between fresh contexts; statuses, error text, schemas, fields, validity flags, and submit counts did not. All eight tool responses arrived before the 8-second timeout. The fixture server observed exactly eight loopback GETs, one per case/run.

An initial launch attempt failed before a case ran because Chromium's Unix socket path exceeded its limit under the long scratch TMPDIR. I switched only the throwaway probe's private temporary root to short, mode-0700 `/tmp/eu-*` directories and reran both passes successfully. The script removed each directory; subsequent checks found no `/tmp/eu-*` entries and no matching Chromium process. No `/tmp` residue remains.

## Chromium source citations

Source bodies were fetched from Gitiles with `?format=TEXT`, base64-decoded, and inspected at tag `154.0.8037.97` on 2026-10-21.

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`, lines 563-566:
  ```cpp
  schema->SetString("type", "string");
  AddPattern(element, *schema);
  AddDescription(controls_for_name, *schema);
  ```
  The `IsText` cases are anchored at lines 1274 (`case FormControlType::kInputEmail:`), 1277 (`case FormControlType::kInputUrl:`), and 1279 (`return true;`). These ranges show the email/URL text-schema path and the string-only schema builder; the fixture's observed schema has no format. URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT>. Accessed 2026-10-21. Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc`, lines 718-719:
  ```cpp
  // Interactive validation must be done before dispatching the submit event.
  // We also re-perform this validation *after* dispatching the submit event.
  ```
  The declarative path checks `ValidateInteractively()` at line 729 and prefixes its error at line 733 (`Form validation failed: `), then reports the invalid control's name and `validationMessage()` at lines 735-758. URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT>. Accessed 2026-10-21. Decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

No build, lint, formatter, or repository test suite was run; the only execution was the requested runtime probe, repeated once per case. No in-scope blocker remains; receipt/harness integration and the post-integration gate remain with the parent.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamEmailUrl`
- Branch: `r19/FamEmailUrl`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `d4803b0d4fab1aa3a70b84026bb996abc1773e18`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/email-url.json`
  - `corpus/evidence/round-19/validation/fixtures/email-url.html`
  - `corpus/evidence/round-19/validation/probes/email-url.json`
