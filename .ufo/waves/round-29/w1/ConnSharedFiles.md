# ConnSharedFiles — cross-row consistency for the 6 shared Chromium files (Tabi r29 w1)

Seat: ConnSharedFiles (connector, leaf). Milestone C3. Date 2026-10-26.
Method: independent scratch fetches of the six shared files at tags `154.0.8037.97`
and `156.0.8078.47` via Gitiles `?format=TEXT` (all 12 HTTP 200, `base64 -d`), sha256
verified against the SOURCES.md registry digests, then `diff` per pair. Receipts:
`.ufo/waves/round-29/w1/ConnSharedFiles/` (`*.diff`, `sha256sums.txt`, `fetch-receipt.txt`).
Scratch: `/fast/scratch/hyaku/tabi-r29/ConnSharedFiles` (removed on exit).

154-side digests (all match registry): WebMCP.pdl `26e62f29…37ff`; form_mcp_schema.cc
`904b75e7…152f`; html_form_element.cc `8c8d6796…6916`; runtime_enabled_features.json5
`99b92e67…1d2b`; model_context.cc `474083d6…8823`; inspector_web_mcp_agent.cc
`1cc55ef9…8475`.

## Verdict table (per-row, from my own diffs)

| row | file anchor (154) | in-anchor change? | verdict | lane's superseding row |
|---|---|---|---|---|
| S034 | ref 7023-7050 | no (block → 7204-7231, byte-identical) | **hold** | none needed |
| S074 | ref 7023-7050, status 7035 | no (7035 → 7216 `status: "experimental",`) | **hold** | none needed |
| S041 | pdl 7, 58-122 | no (+2 shift → 60-124) | **hold** | none needed |
| S079 | pdl 25-30, 109-123; inspector 208-243 | no (→ 27-32/111-125; inspector → 209-244) | **hold** | none needed |
| S099 | pdl 59-69, 109-123 | no (→ 61-71/111-125) | **hold** | none needed |
| S097 | inspector 47-64, 208-243 | no (208-243 → 209-244; 47-64 unchanged) | **hold** | none needed |
| S077 | schema 49-111,208-490,930-1093,1238-1438 | no (file byte-identical) | **hold** | none needed |
| S093 | schema 121-181,491-539,556-928,1095-1236,1238-1438 | no (.cc byte-identical; .h not in this item) | **hold** | none needed |
| S098 | schema 491-928, 583 | no (byte-identical) | **hold** | none needed |
| S042 | model_context 528-580, 748-811, 856-873 | **yes** (4 hunks) | **drifted** | S109 ✓ |
| S071 | schema 208-243; form 192-258; model 562-565, 752-811 | **yes** (form + model 752-811) | **drifted** | S110 ✓ |
| S078 | form 174-328, 635-842 | **yes** (guard insert) | **drifted** | S111 ✓ |
| S096 | form 174-328, 729-758, 818-842 | **yes** (guard insert) | **drifted** | S114 ✓ |
| S100 | form 174-328, 635-842 | **yes** (guard insert) | **drifted** | S115 ✓ |
| S080 | schema 208-300; form 174-259; model 528-580,695-745; pdl 25-30,109-123; inspector 220-243 | **yes** (form + model) | **drifted** | S112 ✓ |

Cross-row consistency: every row sharing `html_form_element.cc` must agree, and does
(S078/S096/S100/S071/S080 all drifted via the same insertion at 154 `199a202`). Every row
sharing `model_context.cc` agrees (S042/S080/S071 drifted; S071's `562-565` sub-anchor is
unchanged but `752-811` changed). Every row sharing the unchanged files agrees on **hold**.

## Hunk tables (154 line numbers)

### form_mcp_schema.cc — 0 hunks. Files byte-identical at both tags (sha `904b75e7…152f`).
All anchored ranges for S071/S077/S093/S098/S080 unchanged.

### WebMCP.pdl — 1 hunk
| hunk (154) | kind | content | rows touched |
|---|---|---|---|
| 21a22,23 | +2 insert after `optional boolean consequential` | new `optional boolean debugging` + comment in the Tool annotation properties | none (all anchors start ≥25) |

Shift: every line ≥22 moves +2 (S041 `58-122` → `60-124`; S079/S099/S080 PDL anchors → `27-32`, `61-71`, `111-125`).

### inspector_web_mcp_agent.cc — 1 hunk
| hunk (154) | kind | content | rows touched |
|---|---|---|---|
| 74a75 | +1 insert in `BuildAnnotations` | `builder.setDebugging(annotations->debugging);` | none (S097 47-64 ends at 64; S079/S097/S080 208-243 above) |

Shift: lines ≥75 move +1 (S079/S097 `208-243` → `209-244`; S080 `220-243` → `221-244`).

### html_form_element.cc — 10 hunks
| hunk (154) | kind | content | rows touched |
|---|---|---|---|
| 125a126 | +1 | ctor init `is_connected_nested_form_(false)` | none |
| **199a201,210** | **+10 in fill success path** | **document-detached guard: `if (!form_->GetDocument().IsActive()) return … ScriptToolError(kToolInvocationFailed, "The document was detached while filling out the form")`** | **S071 192-258; S078/S096/S100 174-328; S080 174-259 (all)** |
| 361a373,379 | +7 | sandbox gate: declarative tools skipped when `ExecutionContext` is sandboxed without `allow-scripts` | none (328 < 361 < 635) |
| 467a486,490 | +5 | nested-form connected tracking on insertion | none |
| 517a541,555 | +15 | nested-form disconnect bookkeeping in `RemovedFrom` | none |
| 1194,1201c1232,1237 | 8-line replace | form-association invalidation restructure; `ScheduleWebMCPSchemaUpdateIfActive()` moved to 1202a1239 | none (>842) |
| 1209a1247,1249 | +3 | `InvalidateAncestorFormsForAutofill` guard | none |
| 1212,1219d1251 | −8 | `EmailVerificationStatusIndicatorEnabled` block deleted | none |
| 1727,1737d1758 | −11 | `NotifyEmailVerificationTokenFieldChanged()` removed | none |

Shift arithmetic: +1 above line 200, +11 at/below 200 for the first anchored block
(174-328 → 175-339; 635-842 → 673-880); +38 for the 635-842 block
(S096 729-758 → 767-796; 818-842 → 856-880). All consistent with lane rows S110/S111/S114/S115/S112.

### model_context.cc — 24 hunks (in-anchor set first)
| hunk (154) | kind | content | rows touched |
|---|---|---|---|
| **528c527** | 1-line change | `ExecuteTool(const base::UnguessableToken& …)` → by-value token | **S042 528-580; S080 528-580** |
| **568c567** | comment | `` `toolactivate` `` → `` `toolactivated` `` | **S042/S080 528-580** |
| **573,577c572,574** | 5→3 lines | event dispatch: `window->DispatchEvent(*WebMCPEvent::Create(kToolactivated,…))` → `DispatchEvent(*ToolActivatedEvent::Create(kToolactivated,…))` on ModelContext | **S042/S080 528-580** |
| **582c579** | 1-line change | `CancelTool(const …& invocation_id)` → by-value | **S042/S080 528-580** |
| **697c693** | 1-line change | `ExecuteDeclarativeTool` token param by-value | **S080 695-745** |
| **753c749** | 1-line change | `ExecuteV8Tool` token param by-value (const-ref dropped) | **S042 748-811; S071 752-811** |

Out-of-anchor hunks (verify only, no anchored claim touched):
10a11, 29a31, 31c33,34 (includes; `web_mcp_event.h` → `tool_activated_event.h` + `tool_cancel_event.h`);
77,79c80,89 + 82c92 + 100,101c110,111 (`ValidateAndStringifyObject` → `ValidateAndStringifyValue`, generic value_name);
108,121d117 (`IsValidToolName` deleted; replaced by shared `IsValidScriptToolName`); 383c379, 399,401c395,397, 403c399;
465a462,463 + 513a512 + 1050a1059 (thread new `debugging` annotation); 644,647c641,643 (`toolcancel` now `ToolCancelEvent` on ModelContext);
833a830,832 (declarative tool-name validity check); 1044c1043,1052 (`input_schema` re-parsed from JSON at listing time);
1074c1083 (`ExecuteV8Tool` takes `ScriptValue input_object` instead of `String input_arguments`);
1116a1126,1133 (imperative input object validated "is an object", then stringified).

Shift arithmetic (verified against lane rows): old 528-580 → 527-577; 695-745 → 691-741;
748-811 → 744-807; 752-811 → 748-807; 562-565 → 561-564; 856-873 (`OnToolExecuted`, unchanged
text) → 855-871. All match S109/S110/S112.

### runtime_enabled_features.json5 — 140 hunks, 822 changed lines (global churn; file 7428 → 7634 lines)
No hunk touches 154 lines 7023-7050. The three insertions before the block
(`6855a7015,7023`, `6946a7115,7121`, `6967a7143,7150`) are pure insertions of other
features; the WebMCP block content is byte-identical, shifting +181 to 7204-7231
(S074's `status: "experimental",` line 7035 → 7216). `DeclarativeWebmcp` remains absent at 156
(grep-verified). S034/S074 claims survive at 156: WebMCP still `experimental`, still
`implied_by` WebMCPTesting (with WebMCPDeclarativeFileInput and WebMCPFormAssociatedCustomElements).

## Verdict predictions for other seats' per-row counters

- **Hold, no superseding row needed:** S034, S074, S041, S079, S099, S097, S077, S093, S098.
  Their anchored ranges are content-unchanged; note for S041/S079/S099 the +2 PDL line shift
  and for S079/S097 the +1 inspector shift when binding 156 ranges.
- **Drifted, superseding row required:** S042→S109, S071→S110, S078→S111, S096→S114,
  S100→S115, S080→S112. Lane tip (commit 190052c) already carries S108-S115; every anchor,
  shift, and sha I checked in S109-S115 agrees with my own measurement (S109 `855-871` for
  `OnToolExecuted` verified line-exact; S110 `561-564`/`748-807` verified; S111/S114/S115
  `175-339, 673-880, 767-796, 856-880` verified; S112's six-file sha list matches my
  `94d08636…8aa3`, `2a96a97b…6102`, `904b75e7…152f`, `2477d201…2c53`, `f386bcfd…f99f`).
- Per C3 kill-rule: every drifted row with a citing knowledge entry carries a round-29
  recheck note (webmcp-invocation-round-17.md:144 S042→S109; source-recheck-round-18.md:226
  S071→S110; webmcp-declarative-validation-round-19.md:161 S078→S111/S096→S114;
  webmcp-nonautosubmit-round-21-corrected.md:118 S100→S115). S080/S077/S093/S098 cite no
  knowledge entry (`used-by —`) or byte-identical files, so no note owed.

## Changes outside anchored ranges that could alter citing-entry claims

1. **New `debugging` tool annotation** (PDL `21a22,23`; inspector `74a75`; model_context
   `465a462,463`, `513a512`, `1050a1059`; `script_tool_types.h` per S112's out-of-item
   reading). No citing knowledge entry enumerates the annotation vocabulary as closed
   (grepped all seven citing entries) → no claim altered. Adjacent row S036
   (devtools-frontend `WebMCPModel.ts`) is the row that would cite annotation payloads; not
   in this item.
2. **Sandbox gate for declarative tools** (html_form_element `361a373,379`): sandboxed
   frames without `allow-scripts` can no longer register declarative tools. Adjacent to
   webmcp-chromium-loopback-round-16.md:66 (opaque-sandbox iframe `registerTool`
   NotAllowedError) but that entry is about the imperative permissions-policy path; no
   contradiction, no claim altered.
3. **`EmailVerificationStatusIndicator` removed** from html_form_element.cc
   (`1194-1251` restructure + `1727,1737d1758`). No citing entry mentions email
   verification → no claim altered.
4. **Imperative-input handling renamed/relocated** in model_context.cc
   (`ValidateAndStringifyValue`, `IsValidScriptToolName`, `ExecuteV8Tool` taking
   `ScriptValue`, `1116a1126,1133`): S042/S109's claim "input is never checked against
   inputSchema" remains true (an object type-check is not schema validation) and S109/S110
   explicitly re-assert it. No claim altered.
5. **`toolcancel` now dispatches `ToolCancelEvent` on ModelContext** (`644,647c641,643`):
   parallel rename to the anchored `toolactivated` change but outside every anchor; no
   citing entry describes the cancel event target → no claim altered.

## Risks / out-of-item unverified surface

- S093 also anchors `form_mcp_schema.h`; S080/S112 anchor `script_tool_types.h`,
  `frame.mojom`, `local_frame_mojo_handler.cc`; S113 anchors `html_select_element.cc`.
  These files are outside this item's six-file set — my "hold/drifted" verdicts for those
  rows rest on the .cc/.pdl/inspector/json5 files only; the header/mojom claims in S112
  (e.g. `script_tool_types.h:16-50` gaining `debugging` at :46) are plausible given the
  paired changes I did measure but were not independently re-fetched here.
- Cosmetic inter-note variance: the html guard is cited as `156 :201-209` in
  webmcp-declarative-validation-round-19.md/S110/S112 but `:201-210` in
  webmcp-nonautosubmit-round-21-corrected.md; the insertion is 10 lines (201-210) of
  which 201-209 is the guard body. Substantively identical; not a counter risk since each
  row binds its own anchor text.
- Network was read-only Gitiles GET; no credentials used.

## Commands run (all exit 0 unless noted)

- `curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/{154.0.8037.97,156.0.8078.47}/<path>?format=TEXT'` ×12 → all `200` (exit 0).
- `base64 -d` ×12 → exit 0; `sha256sum *.txt` → matches registry (exit 0).
- `diff <154> <156>` per file → exit 1 for the five differing files (expected, diff signals differences), 0 for form_mcp_schema.cc (identical).
- `grep -n 'DeclarativeWebmcp' ref.156…` → no match (exit 1, expected = absent).
- No lane tracked files, index, or jj state touched; no builds/linters run; no subagents dispatched.
