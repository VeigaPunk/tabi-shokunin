# S080 superseding row — DRAFT (not written to the registry)

Seat PinS080, round-29 w1 (C3). Drafted because row S080 (`corpus/SOURCES.md:94`) drifted: 3 of its 8
anchored files changed between tag `154.0.8037.97` and tag `156.0.8078.47`. Nothing here was written
to `corpus/SOURCES.md`; the lane registry, its git index and the jj state are untouched.

## Row (11 cells, no `|` inside a cell, id left as the `S1NN` placeholder)

| S1NN | Chromium 156 ScriptToolError and WebMCP response path — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/script_tools/script_tool_types.h?format=TEXT | code | A | Declarative form fill errors mapped to experimental CDP WebMCP.toolResponded at Chromium 156.0.8078.47 | tag `156.0.8078.47`, commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`; `script_tool_types.h:16-50`, `form_mcp_schema.cc:208-300`, `html_form_element.cc:175-270`, `frame.mojom:1072-1079`, `local_frame_mojo_handler.cc:1006-1024`, `model_context.cc:527-577,691-741`, `inspector_web_mcp_agent.cc:221-244`, `WebMCP.pdl:27-32,111-125`; decoded sha256 `323fad50…2431`, `904b75e7…152f`, `2a96a97b…6102`, `d0e3ed71…294c`, `4052266a…3cd1`, `94d08636…8aa3`, `2477d201…2c53`, `f386bcfd…f99f` | supersedes S080 — at 156.0.8078.47 the mapping still holds: `FillData` rejects invalid declarative input with `kInvalidInputArguments` and the inspector still emits CDP status `Error` with `ScriptToolError.message` as `errorText` and no exception object; three anchored files changed: `ScriptToolDeclaration` gained `std::optional<bool> debugging` (`script_tool_types.h:46`), `ExecuteTool` gained a post-fill detached-document guard returning `kToolInvocationFailed` (`html_form_element.cc:201-209`), and the invoke path takes the invocation token by value and dispatches `toolactivated` through `ToolActivatedEvent` (`model_context.cc:527-577`) | mined | 2026-10-26 | on-release | — |

Cell count check: `awk -F'|' '{print NF-2}'` on the row line = 11.

## Located quote from the 156.0.8078.47 bytes

`std::optional<bool> debugging;` — `third_party/blink/renderer/core/script_tools/script_tool_types.h:46`
(3 words; the line is absent from the 154.0.8037.97 bytes, which is the drift this row supersedes).

Same line, contrast at the old tag: 154.0.8037.97 `script_tool_types.h:40-46` ends
`std::optional<bool> consequential;` / `};` — no `debugging` member.

## What changed, per file (154 line range → 156 line range)

| file | 154 range | 156 range | verdict | change |
|---|---|---|---|---|
| `script_tool_types.h` | 16-49 | 16-50 | drifted | `std::optional<bool> debugging;` inserted before `};` (`:46`); error enum and `ScriptToolExecutedCallback` unchanged |
| `form_mcp_schema.cc` | 208-300 | 208-300 | holds | file bytes identical at both tags (`904b75e7…152f`) |
| `html_form_element.cc` | 174-259 | 175-270 | drifted | 9-line detached-document guard inserted after the fill error branch (`156:201-209`, returns `kToolInvocationFailed`); +1 line earlier in the file |
| `frame.mojom` | 1112-1119 | 1072-1079 | holds | same `InvokeScriptToolForInspector` block, moved up 40 lines |
| `local_frame_mojo_handler.cc` | 987-1005 | 1006-1024 | holds | same body, moved down 19 lines |
| `model_context.cc` | 528-580 | 527-577 | drifted | `ExecuteTool` takes `base::UnguessableToken` by value; `toolactivated` dispatched via `ModelContext::DispatchEvent(*ToolActivatedEvent::Create(...))` instead of `document_->domWindow()->DispatchEvent(*WebMCPEvent::Create(...))`; comment `toolactivate`→`toolactivated` |
| `model_context.cc` | 695-745 | 691-741 | drifted | `ExecuteDeclarativeTool` takes `base::UnguessableToken` by value; body otherwise identical |
| `inspector_web_mcp_agent.cc` | 220-243 | 221-244 | holds | same `WebMCPToolFailed` body, +1 |
| `WebMCP.pdl` | 25-30 | 27-32 | holds | same `InvocationStatus` enum, +2 |
| `WebMCP.pdl` | 109-123 | 111-125 | holds | same `toolResponded` event, +2 |

Unified diffs of the drifted ranges: `diffs/` in this directory
(`script_tool_types.h.16-49.diff`, `html_form_element.cc.174-259.diff`,
`model_context.cc-A.528-580.diff`, `model_context.cc-B.695-745.diff`).

## Recheck notes for citing knowledge entries

Row S080's `used-by` cell reads `—`, and `grep -rn "S080" corpus/knowledge/` at the lane root
returned no lines (exit 1). **Zero knowledge entries cite S080, so the required per-entry recheck
note set is empty.** No knowledge file is made wrong by this drift; nothing in `corpus/knowledge/`
quotes a S080 range that moved.

Adjacent, outside the `used-by` contract: `corpus/lessons/round-19.md:36` retains S080's quote
`"kInvalidToolName, kInvalidInputArguments, kMissingRequiredSubmitButton, kToolInvocationFailed, kToolCancelled,"`
located at `script_tool_types.h:17-21` (154). Those five lines are byte-identical at 156:17-21, so the
lesson quote still holds at the new stable tag and needs no erratum.

## Counter binding of this draft (fixture probe, scratch only)

- `--stable 157.0.0.0` against a scratch fixture whose `bytes/157.0.0.0/` is a copy of the 156 bytes:
  the draft row (as `S199`) reports `resolved=true verdict=holds reasons=[]` — the 11 cells parse,
  `teaches` opens `supersedes S080 —`, `source` carries `refs/tags/156.0.8078.47/`, all eight
  basenames bind via the anchor cell, every range token is present in the anchor cell and holds in the
  156 bytes, and the abbreviated digests match the 156 `old_sha256` values.
- `--stable 156.0.8078.47` with the draft row inserted and `receipt.rows[S080].superseded_by="S199"`
  (fixture ids; no refetch record in the lane): `population 23 unresolved 22 holds 0 drifted 1`,
  `S080 resolved=true verdict=drifted reasons=[]`.
- The real registry needs the actual next free id in place of `S1NN`, and
  `entry.json.superseded_by` set to that id — `pins/S080/entry.json` ships `superseded_by: null`
  because the id is the L1's to assign.
