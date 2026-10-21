# FamSelectMultiple-4 — round 19 C1 family findings

## Result

Implemented and committed the `select-multiple` validation family in the isolated clone. Chromium 154.0.8037.97 derived `properties.colors.type: "array"`; all four requested inputs were run twice, and each case's observed status, error text, submit count, selected-value state, and schema were identical across repetitions. No nondeterminism was observed.

## Runtime and retained probe

- Runtime: Chromium 154.0.8037.97 (`/usr/bin/chromium`, resolved process executable `/usr/lib/chromium/chromium`), Playwright 1.64.0 (already installed globally at `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright`), Node v24.21.0.
- The throwaway driver is `/fast/scratch/tabi-r19/FamSelectMultiple-4-probe/probe-select-multiple.mjs`; it is outside the commit. It copied round-18 WebMCP feature args and Playwright default-feature merging, used `launchPersistentContext` with private profile/HOME/TMPDIR and `acceptDownloads:false`, bound the fixture server only to `127.0.0.1`, applied an exact-origin route guard and the host-resolver deny rule, and attached CDP through `context.newCDPSession(page)`. Effective argv assertions all passed, including WebMCP/DeclarativeWebmcp/Blink features, host-resolver denial, CDP pipe, no TCP DevTools port, no `--no-sandbox`, and no `DevToolsActivePort`.
- `corpus/evidence/round-19/validation/probes/select-multiple.json` retains 8 attempts (4 cases × 2), raw WebMCP event params, CDP command params/replies, `toolsAdded` schema, invokeTool request/reply, `toolResponded` params, page submit calls, and post-invoke control states. Probe SHA-256: `53e920157ef8d8c1953dc3b85b08f8e835b66a941dde097d179dd1bbe55cdee7`.
- Each attempt's `stableSummary` is `true`. All run-owned Chromium profiles/processes were cleaned by the driver; its final process check succeeded and the subsequent `/tmp/fm4-*` listing was empty.
- No tool was installed or updated: the required global Playwright 1.64.0 was already present.

## Measured cases

The observed input schema was the same in every attempt: `properties.colors.type = "array"`, items are strings enumerated as `red`, `green`, `blue`, with `uniqueItems = true`.

| Case | Input → observed status / errorText / post-invoke `fields` | Submit observation | Source anchor |
| --- | --- | --- | --- |
| `decl-select-multiple-01` | `{"colors":["red","blue"]}` → `Completed` / `null` / `{"colors":["red","blue"]}` | 1 call; `agentInvoked:true`, `isTrusted:true`; selected values `red`, `blue` | `form_mcp_schema.cc:752-759` |
| `decl-select-multiple-02` | `{"colors":["red","invalid"]}` → `Error` / `Invalid value for parameter colors` / `{"colors":[]}` | 0 calls; selections remained empty | `form_mcp_schema.cc:413-420` |
| `decl-select-multiple-03` | `{"colors":"red"}` → `Error` / `Invalid value \"red\" for parameter colors` / `{"colors":[]}` | 0 calls; selections remained empty | `form_mcp_schema.cc:408-410` |
| `decl-select-multiple-04` | `{"colors":[]}` → `Completed` / `null` / `{"colors":[]}` | 1 call; `agentInvoked:true`, `isTrusted:true`; no selected values | `form_mcp_schema.cc:1021-1054` |

For case 01, the fixture's required `Object.fromEntries(new FormData(form))` submit record contains `{"colors":"blue"}` (the last repeated FormData value); the measured control state is `selectedValues:["red","blue"]`, which is what the case's `expect.fields` records. Case 04's submit record has `{}` because the empty multiple select contributes no FormData entry; its control state is still `{"colors":[]}`.

## Chromium source evidence

Fetched the tagged Gitiles `?format=TEXT` bodies on 2026-10-21 and checked these exact decoded lines:

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:752-759` — “if (element.IsMultiple()) { schema->SetString(\"type\", \"array\");” (7 words). URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT>. SHA-256 of decoded body: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `form_mcp_schema.cc:408-410` — “const JSONArray* array = JSONArray::Cast(&value); if (!array) { return false; }” (11 words). This is the non-array rejection cited by case 03.
- `form_mcp_schema.cc:413-420` — “// Each value in the array must have a corresponding option.” (10 words). This is the invalid-option check cited by case 02.
- `form_mcp_schema.cc:1021-1054` was checked for multiple-select filling; an empty array produces no selected option indices, matching case 04.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc:258` — “return mcp_schema.FillData(*json_obj);” (4 words). URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT>. SHA-256 of decoded body: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

The fixture SHA-256 is `b5aa24ac70de9b911984695f28ff1285da141d5cad128b022bda00b3976643b3`; the cases file SHA-256 is `6d7b8bc6ca7cfd756a0672458d57546439ba9a0f4c7750277ed8b3019f1c47a7`.

## Risks and blockers

- The submit listener's `Object.fromEntries(FormData)` collapses repeated select values to the final entry; the separate captured select control state preserves the full selected array. This distinction is preserved in raw probe evidence and the cases' `fields` expectations.
- The requested four inputs do not test duplicate values, despite the observed schema's `uniqueItems:true`; no duplicate-input behavior is claimed.
- Two preliminary throwaway launches did not yield behavioral evidence: Chromium rejected a long private socket path, then a probe-only guard misparsed the `--enable-blink-features` prefix. The run tree was shortened and the guard corrected; the final recorded run completed all eight attempts with every launch assertion passing.
- No build, lint, or test suite was run; the requested browser probe is the only executed behavior check. No remaining blocker.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamSelectMultiple-4`
- Branch: `r19/FamSelectMultiple-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `fd0c55e4f0e37a6af844b1467f4cc52eb362a3cc`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/select-multiple.json`
  - `corpus/evidence/round-19/validation/fixtures/select-multiple.html`
  - `corpus/evidence/round-19/validation/probes/select-multiple.json`
