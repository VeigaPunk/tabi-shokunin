# FamTextareaEmpty — round 19 wave 1

## Result

Added five runtime-backed `textarea-empty` cases. Chromium 154.0.8037.97 returned `Completed` for all ten invocations (five cases, first run and one repeat); each emitted one submit and no `errorText` field. Every first/repeat comparison was stable. No observed nondeterminism.

## Per-case observations

All `fields` below match the post-invoke control values, the fixture's submit-listener `FormData`, and `toolResponded.output.fields`. Every case observed the same schema: `memo` and `title` have type `string`, with `required: []`.

| Case | CDP input → observed status / errorText / submitCount / fields | Source anchor |
|---|---|---|
| `decl-textarea-empty-01` | `{"memo":"alpha\r\nbeta\ngamma","title":"first\r\nsecond"}` → `Completed` / absent / 1 / `{"memo":"alpha\nbeta\ngamma","title":"firstsecond"}` | `form_mcp_schema.cc:933-947` |
| `decl-textarea-empty-02` | `{"memo":"","title":""}` → `Completed` / absent / 1 / `{"memo":"","title":""}` | `form_mcp_schema.cc:933-947` |
| `decl-textarea-empty-03` | `{}` → `Completed` / absent / 1 / `{"memo":"pre-filled textarea","title":"pre-filled input"}` | `form_mcp_schema.cc:208-241` |
| `decl-textarea-empty-04` | `{"memo":"pre-filled textarea","title":"pre-filled input"}` → `Completed` / absent / 1 / `{"memo":"pre-filled textarea","title":"pre-filled input"}` | `form_mcp_schema.cc:933-947` |
| `decl-textarea-empty-05` | `{"memo":"  café 🧪\t\nβeta  ","title":" \t café 🧪 "}` → `Completed` / absent / 1 / identical field strings | `form_mcp_schema.cc:933-947` |

Observed decisions: explicit empty strings clear both current values while each `defaultValue` remains unchanged; omitting both keys does **not** clear either default and both pre-filled values are submitted. The textarea preserves line breaks as LF (CRLF is normalized); `<input type="text">` removes CR/LF from the supplied string (`first\r\nsecond` becomes `firstsecond`). Leading/trailing spaces, tabs, Unicode (`café`, `🧪`, `β`, U+2003), and the textarea newline round-trip unchanged in case 05.

## Runtime and retained evidence

- Runtime: `/usr/bin/chromium` 154.0.8037.97; Playwright 1.64.0; Node v24.21.0.
- The probe used the round-18 WebMCP feature arguments merged with Playwright 1.64.0 defaults, the Chromium pipe CDP session, a loopback-only HTTP fixture server, the host-resolver deny rule excluding only 127.0.0.1, private browser profile/HOME/TMPDIR, and `acceptDownloads:false`. Observed launch guards: one `--enable-features`, one `--disable-features`, WebMCP flags present, remote-debugging pipe present, no TCP DevTools port, no `--no-sandbox`, and no `DevToolsActivePort` file.
- Raw retained probe: `corpus/evidence/round-19/validation/probes/textarea-empty.json` in the isolated clone. It contains both passes' raw `toolsAdded` (including `inputSchema`), invoke request/replies, `toolInvoked`/`toolResponded` params, `window.__obs.calls`, post-invoke control values/defaults, launch identity/guards, and per-run cleanup observations.
- Case file: `corpus/evidence/round-19/validation/cases/textarea-empty.json`.
- Fixture: `corpus/evidence/round-19/validation/fixtures/textarea-empty.html`.
- Each browser context exited with no owned Chromium process survivors; its run root and private browser-temp root were removed. No `te4-*` temporary directory remained in `/tmp`.
- The initial attempt placed Chromium's TMPDIR beneath the long scratch path and Chromium aborted before a WebMCP observation with `Socket path too long`; the probe was adjusted to use a per-run private short `/tmp/te4-*` TMPDIR, which was removed after each run. This was harness setup only, not target behavior.
- No tools were installed or updated: the globally available Playwright and system Chromium already matched the required versions. No build, lint, or test suite was run; the requested runtime probe and repeat were the only execution.

## Source checks

Fetched from the Chromium Gitiles tag `154.0.8037.97` on 2026-10-21; hashes are SHA-256 of the decoded `?format=TEXT` bodies.

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`, lines 208-241, 556-568, 933-947. The exact line-234 comment is: “// Now apply the values. This step must not fail.” Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT>
- `third_party/blink/renderer/core/html/forms/html_form_element.cc`, lines 231-258. The exact line-258 statement is: “return mcp_schema.FillData(*json_obj);” Decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT>

The case-file `source` entries cite the matching `form_mcp_schema.cc` line ranges and the same tag URL. The source path checks support the form fill/schema path; runtime observations, rather than source-level inference, are the case expectations.

## Risks and blockers

- Findings are scoped to this fixture and Chromium 154.0.8037.97; they do not establish behavior for other browser versions or other control types.
- No implementation blocker remains. The L1 owns post-integration validation.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamTextareaEmpty-4`
- Branch: `r19/FamTextareaEmpty-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `911405cbc6755aa7ce1acc73f738bf351bd54745`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/textarea-empty.json`
  - `corpus/evidence/round-19/validation/fixtures/textarea-empty.html`
  - `corpus/evidence/round-19/validation/probes/textarea-empty.json`
