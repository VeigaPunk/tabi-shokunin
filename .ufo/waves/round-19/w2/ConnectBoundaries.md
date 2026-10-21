# Round 19 W2 — C1/C2 boundary re-check

## Verdict and axes

**Adjacency (judged axis):** the wave-1 boundary still holds. The round-19 artifacts do not add sibling ownership or real-site authority. The one useful move is to make the report's adjacency boundary explicit about game-dev-3d as well as Kaidoku and the two still-open L0 items. This protects C1 **depth**, C2 **operability**, and C3 **calibration** separability; no counter, score, or new claim is proposed.

## Evidence

### Wave-1 sibling boundary

Compared `.ufo/waves/round-19/w1/ConnSiblingWebmcp.md` (§ Findings; § C1 boundary) with the cited sibling material. Kaidoku's line 72 calls page-declared WebMCP tools “untrusted inventory and never invoked”; its round-10 note reports `discover-webmcp-tools` returning `tools:{total:0,items:[]}` on a page declaring none (lines 180–181). This is passive inventory, not declarative-form validation or invocation evidence. Kaidoku's newest observed commit, `d93c858` (2026-10-21 05:43:41 -0300), changes only `.ufo/waves/round-21/fixtures/battery.json`; it adds no WebMCP validation source.

The game-dev-3d citations are a separate Unreal surface: its README identifies the `ModelContextProtocol` plugin (lines 139–142), and its mesh/tool note describes `call_tool` with `toolset_name`, `tool_name`, and `arguments` (line 172). Neither is Chromium page `document.modelContext`/CDP WebMCP or declarative-form validation. The round-19 lesson's adjacency paragraph names Kaidoku but omits this game-dev-3d lexical near-hit; that is a narrow report-coverage omission, not evidence that the lane absorbed the Unreal surface.

### Current lane artifacts at R

The lane tip is R, `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; the pinned B is its ancestor. The sources read therefore describe the attacked checkpoint.

- `SKILL.md:2040-2047` scopes the measured table to Chromium 154, loopback fixtures and WebMCP flags; it expressly says “It is not a claim about real sites, other builds, agent-side clients or custom elements.” Its existing round-17 rule at `SKILL.md:1959` says “Only fixture-owned tools on loopback; never a real site's tool without operator approval.” That conditional policy is not itself an approval. Its adjacency paragraph at `:1963-1967` still points to open L0 lines 62/65.
- `corpus/knowledge/webmcp-declarative-validation-round-19.md:15-20` has the same one-build, loopback-only boundary and expressly excludes real sites, other builds, agent-side clients, non-`toolautosubmit` forms, custom elements and file inputs. Its C2 “Download-artifact root” section discusses Playwright artifact-root scanning, not authority to use a real site.
- `corpus/lessons/round-19.md:89-91` says no sibling holds declarative-WebMCP validation ground, identifies Kaidoku as passive inventory, leaves the two L0 matters unanswered, and states “no claim depends on them.” The omission of the game-dev-3d lexical near-hit is the only wording gap found.
- `corpus/evidence/round-19/validation/decisions.json:1-6` binds decisions to Chromium 154 / Playwright 1.64 / Node 24.21, unique probe case IDs, an in-family control, observed outcome fields, a reproduced receipt and source-body hashes. A targeted search of this manifest for ownership, sibling, 9222, real-site and approval terms returned no matches. The lesson records 27 decisions over 15 families; no sibling-derived decision was identified.
- Both round-19 harnesses use a loopback fixture server and per-run profile. Their source checks include `127.0.0.1` binds and explicit `noRemoteDebuggingPort` assertions (`webmcp-validation-round19.mjs:42,601,686-690`; `webmcp-invoke-round19.mjs:66,1340,741-745`). No 9222 or musketeer reference was found in either harness. No runtime probe was run for this re-check.

### Open L0 items and authority

Re-read current fleet `.ufo/l0-questions.md` lines 62 and 65. They remain the two contested-open items summarized in `w1/ConnL0Status.md`: line 62 is the the-musketeer CDP/9222 lease between kagi and kake, and says “tabi holds no lease half”; line 65 asks whether the round-16 ruling reaches revenger and kama and says tabi “absorbs neither.” Neither is a ruling for tabi. The current queue hash is `f201c77587cf89ccd6293e7aa57756821fcde9f143425740af8c9ee435c1e9a9`; wave-1 ConnL0Status recorded `925a70451ec01d4bd52d3a1c7952a1c8c29c9d142dfcf1cceb661f39a2f475c4`. The hashes differ, so this re-check cites the current bytes; the relevant open entries remain at lines 62 and 65.

**Textual contradiction (not a ruling):** line 62 says “No L0 line ever carried it,” although that sentence is itself on L0 line 62. Preserve the open status; do not infer which wording was intended.

The older round-5 request at current L0 line 25 asks for a named-site/scope decision and says “Loopback-only anti-claim holds until an answer naming site+scope(+budget) is read back from this file.” The only `L0 ANSWER` markers in the current queue are the unrelated planner questions at lines 52–53. No real-site approval is recorded for this scope. Thus SKILL.md's “without operator approval” condition is not satisfied by these records, and round-19 C1/C2 do not claim real-site authority.

## Proposed exact report boundary line

Insert under the round-19 report's `## Adjacency` subsection:

> Boundary: C1/C2 credit only their declared loopback fixture/probe surfaces; they grant no real-site authority, do not absorb Kaidoku's passive WebMCP inventory or game-dev-3d's Unreal ModelContextProtocol surface, and leave tabi round-17 L0 lines 62/65 contested-open (the-musketeer lease; revenger/kama ruling reach).

This is one report-only clarification. It preserves the existing claim scope and keeps lexical MCP overlap distinct from the Chromium page-tool surface; it does not decide either L0 question.

## Source record

All sources below were read locally on 2026-10-21; hashes are SHA-256 of the local bytes (no external pages were fetched).

| Source and anchor | Bounded quoted evidence (each quote <25 words) | SHA-256 |
|---|---|---|
| `file:///home/vgpnk/Projects/shokunin/.ufo/l0-questions.md#L25` | “Loopback-only anti-claim holds until an answer naming site+scope(+budget) is read back from this file.” | `f201c77587cf89ccd6293e7aa57756821fcde9f143425740af8c9ee435c1e9a9` |
| `file:///home/vgpnk/Projects/shokunin/.ufo/l0-questions.md#L62` | “tabi holds no lease half”; “No L0 line ever carried it.” | `f201c77587cf89ccd6293e7aa57756821fcde9f143425740af8c9ee435c1e9a9` |
| `file:///home/vgpnk/Projects/shokunin/.ufo/l0-questions.md#L65` | “tabi records both as contested-open … and absorbs neither.” | `f201c77587cf89ccd6293e7aa57756821fcde9f143425740af8c9ee435c1e9a9` |
| `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/SKILL.md#L1959,L2045-L2047` | “Only fixture-owned tools on loopback”; “It is not a claim about real sites…” | `1601ac593f8a9a08394bd71e5a491d23f6f118f8cbeb57a699c5a8873b18209e` |
| `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-declarative-validation-round-19.md#L15-L20` | “Not claimed: real sites, other builds, agent-side clients…” | `32142d60f33507a32d7532931cd5e1d63ad50ec975318ad9f404f2435050988f` |
| `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-19.md#L87-L91` | “no claim depends on them.” | `2df2396944703f9277cab2a1164810cb34e8edcea88414023a6a4e2a7a8462c7` |
| `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/decisions.json#L1-L6` | “Probe case ids are unique across decisions”; “re-checked on a fresh reproduced receipt.” | `39f868da66f27f633ee1599269e480a41ce3c2b28eee91b1a62467a268ec85e3` |
| `file:///home/vgpnk/Projects/shokunin/kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-skill-references-deep.md#L72` | “page-declared WebMCP tools are untrusted inventory and never invoked.” | `ea38793789c2dd586d239847e925622de23b8002b523465d511c380dde65a416` |
| `file:///home/vgpnk/Projects/shokunin/kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md#L180-L181` | “an honest structural zero on a page that declares none” | `bc70f71c84ae384680be7584ac3b2f403b8ea6d03d281df6a6a5c683c715e6da` |
| `file:///home/vgpnk/Projects/shokunin/game-dev-3d-shokunin/corpus/knowledge/unreal-mcp/README.md#L139-L142` | “prerequisites (Editor + `ModelContextProtocol` and `AllToolsets` plugins)” | `c79d8dd1d7c0c7bc934700187ee322d6d1cb20fc03cc974fa62ee2d95b8ee721` |
| `file:///home/vgpnk/Projects/shokunin/game-dev-3d-shokunin/corpus/knowledge/unreal-mcp/executability/meshes-textures.md#L172` | “`call_tool` with `toolset_name`, `tool_name`, and an `arguments` object” | `7f33c3727ca52d51237ded97795601b017fbd3f4388472415a786047e169f777` |

Wave-1 report hashes: `ConnSiblingWebmcp.md` `454d0d8ea09228b3ac66ad29af98271c789ccf3fe516cc236c71b74344bc5138`; `ConnL0Status.md` `012aef29415072865b200d033418a1a5f585b956ff3a2576e8b7771daed1482b`.

## Verification and risks

- Read-only evidence review only: canonical round-19 plan, both wave-1 connector reports, current L0 queue, four named round-19 surfaces, cited Kaidoku and game-dev-3d lines, and the latest Kaidoku commit's changed-path list.
- Confirmed lane tip equals R and B is an ancestor. Searched the decision manifest for scoped ownership/authority terms; checked the two round-19 harnesses for loopback, profile and DevTools-port controls.
- No build, test, lint, runtime/browser session, external-site access, tool install, production edit, clone, or git write was performed. The broad sibling-glob search returned no usable matches, so no whole-fleet conclusion is drawn from it; the sibling conclusion is limited to wave-1's recorded scan and the exact sibling sources re-read here.
- Residual risk: line 62's self-contradiction and the round-5 request's unanswered state could be misread as a ruling/approval if citations are detached from context. The proposed line explicitly blocks both readings.

## Isolation

- Seat-owned report only: `.ufo/waves/round-19/w2/ConnectBoundaries.md`.
- Production clone/branch/base/commit: N/A — no production files or clone were created.
- Changed path: this report only; no other LANE or sibling path was written.