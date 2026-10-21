# Round 19 W1 — sibling overlap scan for C1

## Scope and method

Read-only scan of the 20 sibling lanes named `*-shokunin` under `/home/vgpnk/Projects/shokunin`; searched each available root `PROVINCE.md` and `SKILL.md`, and each sibling `corpus/knowledge/` for WebMCP, modelContext, toolname/tool_name, declarative-form, invokeTool, and form-validation terms. The root-doc scan covered 21 PROVINCE files and 18 existing SKILL files; `game-dev-2d-shokunin`, `audio-shokunin`, and `revenger-shokunin` have no root SKILL.md. The protocol-specific knowledge search found no `FormMCPSchema`, `DeclarativeWebmcp`, `toolname`, `toolResponded`, `invokeTool`, or `toolsAdded` hits in sibling lanes. Literal WebMCP hits were limited to Kaidoku; the modelContext/tool-name near-hit was game-dev-3d.

## Findings: sibling ground and disposition

| Sibling | What the cited lines establish | Would C1 absorb it? |
|---|---|---|
| `kaidoku-shokunin` | Its browser-observation rule treats page-declared WebMCP tools as untrusted inventory and says they are never invoked (`corpus/knowledge/2026-10-13-r2-skill-references-deep.md:71-76`). Its later probe reports `discover-webmcp-tools` returning an honest zero on a page with no declared tools (`corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:164-181`); the earlier frontier report likewise records the discovery tool and a capture-comparison input, not form validation (`corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:596-608`). | **No. Report-not-absorb.** Adjacent WebMCP inventory/observation ground; no declarative form constraint test, invocation result, or validation decision. |
| `game-dev-3d-shokunin` | The corpus describes Unreal Editor's `ModelContextProtocol` plugin (`corpus/knowledge/unreal-mcp/README.md:139-142`). Its `tool_name` occurrence is an Unreal `call_tool` argument with `toolset_name` and `arguments` (`corpus/knowledge/unreal-mcp/executability/meshes-textures.md:172-174`), not Chromium page `document.modelContext` or CDP WebMCP. | **No. Report-not-absorb.** Lexical MCP/model-context overlap only; different runtime and contract. |
| Other 18 siblings | No direct declarative-WebMCP validation identifiers or matching root-doc mentions appeared in the bounded scans. | **No ground to absorb.** |

## C1 boundary and proposed move

PLAN C1 requires each counted row to cite a passing round-19 receipt case with observed CDP status/error text and a qualifying primary-source row (`.ufo/waves/round-19/PLAN.md:18-24`; case contract at `:90-93`). Keep that boundary: add no C1 credit from Kaidoku's passive inventory or game-dev-3d's Unreal toolset documentation. Suggested report-not-absorb wording for the C1 notes: “Kaidoku WebMCP discovery is passive inventory, not declarative-form input validation; Unreal `ModelContextProtocol`/`call_tool` docs are a different protocol surface. Neither contributes C1 rows.”

The in-lane history also needs its tool-kind distinction preserved: round 17's schema-mismatch case was imperative and accepted its input, while its declarative-form case is separate (`corpus/knowledge/webmcp-invocation-round-17.md:54-55`); round 18 explicitly narrows that observation and records source-level declarative validation (`corpus/knowledge/harness-hardening-round-18.md:86-89`). This is **not a contradiction**: the imperative result does not establish declarative form behavior. C1's runtime probes should measure the declarative form surface, not imply full JSON Schema enforcement or reuse imperative results.

## Axes, risk, verification

- **Affected axis:** depth (C1), by protecting the count of new runtime-verified validation decisions from adjacent but non-validating evidence; calibration is protected by preventing protocol/surface conflation. This recommendation does not reduce valid C1 rows or touch C2/C3.
- **Risk:** lexical scans can miss an indirectly described concept. The available Kaidoku lines explicitly bound its WebMCP work to passive discovery; the game-dev-3d lines identify Unreal's separate toolset invocation shape. Three absent root SKILL.md files are disclosed above; their PROVINCE.md and knowledge paths remained in scope.
- **Verification performed:** the stated read-only grep/search and targeted line reads only. No runtime, build, test suite, or external source was used; no tool was installed. No production file was written.

## Isolation

- Production clone / branch / base / commit: N/A — read-only connector scan; no production artifact or clone commit.
- This seat's only write: `.ufo/waves/round-19/w1/ConnSiblingWebmcp.md` (allowed seat-owned report).