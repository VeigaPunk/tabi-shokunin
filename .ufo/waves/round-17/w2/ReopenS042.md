# ReopenS042 — S042 source row re-opened at M

VERDICT: ISSUES

The source at M holds on every fetchable axis (URL, tag→commit, blob, both sha256, quote,
anchor ranges, tier, status, used-by). The defect is provenance granularity: three of the
row's five `teaches` clauses are implemented in files the row neither names nor registers, one
of them outside the row's stated "Blink" scope, and the C2 note cites S042 for exactly that
material.

## Attacked

`corpus/SOURCES.md:56` (S042, "Chromium 154 Blink ModelContext implementation") at
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d`, re-fetched live at `refs/tags/154.0.8037.97`:
resolve, revision, anchor line ranges, verbatim Gate quote (≤25 words), sha256/blob, tier,
scope, teaches, status, used-by.

## Evidence — fetch and identity (all match the wave-1 dossier)

| Check | Observed |
|---|---|
| `?format=TEXT` URL | HTTP 200, 66,824 B base64 |
| plain URL (no query) | HTTP 200 |
| decoded artifact | 50,117 B, 1,245 lines |
| sha256 as served | `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` |
| sha256 decoded | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` = row `474083d6…8823` |
| `git hash-object` of decoded | `c5ef637f8e676ecc56050982a07f1c8e9056218c` = row `blob c5ef637f` |
| tag → commit (gitiles ref JSON) | `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` = row commit |

Gate quote (22 words) verbatim at `model_context.cc:748-750`, beginning mid-line 748 after
"functions. " with comment markers/newlines dropped:
"It converts the input argument string to a JSON object, calls the function, receives a Promise,
waits for the promise to resolve". Anchor ranges all exist: 528-580 `ExecuteTool`, 748-811
`ExecuteV8Tool` (748-751 are its comment), 856-873 `OnToolExecuted`.

## Teaches audit — every clause true, three not groundable at the row URL

1. **"invokeTool answers with an invocationId before any tool event"** — true, but not in
   `model_context.cc`, which only receives the id. `webmcp_handler.cc:109-110` sends
   `sendSuccess(invocation_token.ToString())`; the guarantee is the protocol comment
   `WebMCP.pdl:68` ("Response is sent before tool events"). Ordering in code:
   `local_frame_mojo_handler.cc:995-1000` posts `ExecuteTool` *then* runs `callback.Run(true)` at
   :1001, so this is protocol-documented intent, not an ordering the row's file enforces.
   `webmcp_handler.cc` is `content/browser/`, i.e. outside the row's "Blink" scope.
2. **Resolution → `Completed`** — `inspector_web_mcp_agent.cc:215-217`.
3. **Throw/reject → `Error` without `errorText`** — `inspector_web_mcp_agent.cc:220-243` passes
   `error.message` as `errorText`; `model_context.cc:867-871` builds `kToolInvocationFailed` with
   the default empty message (`script_tool_types.h:28`, `String message = String()`), [INFERENCE]
   on the serializer's omission of an empty optional.
4. **`Canceled` needs `kToolCancelled`** — `inspector_web_mcp_agent.cc:228-230`;
   `model_context.cc:640` constructs exactly that code on cancel.
5. **Input never checked against `inputSchema`** — `model_context.cc:765-773` + `122-140`
   (JSON syntax + `IsObject` only); `input_schema` appears only at registration
   (:397-402, :450, :509, :841) and listing (:1043-1044); intent at
   `model_context_tool.idl:30-33`.

Neither `inspector_web_mcp_agent.cc` nor `webmcp_handler.cc` appears anywhere in `SOURCES.md` at
M (`git show <M>:corpus/SOURCES.md | grep -n 'inspector_web_mcp_agent\|webmcp_handler.cc\|local_frame_mojo'` → no match, rc=1). Same-wave rows do enumerate such files in their anchor
cells: S044 `… WebMCPView.ts:942-945 and 561-576, WebMCPModel.ts:128-139 and 249-258`; S045
`… executeTool-abort.https.html:87 and :113, inspector-protocol/webmcp/invoke-tool.js:38-51,
WebMCP.pdl:68`. S042's anchor names only `model_context.cc` ranges.

Contract v1 rule 1 (`fleet-ledger .ufo/waves/kaika/SOURCES-CONTRACT-v1.md`) requires the gate
quote to ground `teaches`; here it grounds only the parse/await mechanic, while the headline
clause and the status mapping sit in files that are not cited. Consequence in the wave-1
product: `corpus/knowledge/webmcp-invocation-round-17.md:87` cites S042 for "CDP `Error` +
`exception` RemoteObject, empty `errorText`" — a reader at the row URL/listed ranges cannot
verify it.

## Tier, scope, status, used-by

- Tier A: honest — tag-pinned primary source code for its scope.
- Scope "Chromium 154 Blink tool invocation … to CDP status": the CDP status selection is Blink
  (`inspector_web_mcp_agent.cc`, unlisted); the invocationId answer is `content/` + `.pdl`
  (non-Blink, unlisted). Breadth is declared, provenance is not.
- Status `mined` + used-by `corpus/knowledge/webmcp-invocation-round-17.md`: path exists at M and
  cites S042 at note lines 2, 70, 72, 87.
- Structural gate on an extracted M tree: `SOURCES_GATE verdict=clean rows=53
  tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`.
- Minor: `source` uses the `?format=TEXT` representation (a click yields base64) where S041/S045
  use the plain page URL.

## Repair (append-only; anchor/teaches are not editable in place per rule 2)

1. Append a row for `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` at tag
   154.0.8037.97 (opened this round, sha `1cc55ef9…8475` exists, anchor `:208-244`, quote from
   `:228-230`), which carries clauses 2-4.
2. For clause 1 either append a row for
   `content/browser/devtools/protocol/webmcp_handler.cc:58-116` (sha `53793d1e…cb1a4` exists) or
   drop clause 1 from any S042-family teaches and point at S041/S045, which already carry
   `WebMCP.pdl:68`.
3. Re-point `corpus/knowledge/webmcp-invocation-round-17.md:87` (and `:70` for the async-answer
   claim) at the new rows; if S042's wording must change, append `supersedes S042 —` with a
   teaches narrowed to what `model_context.cc` shows, and update S042's `used-by` in place.

Files written: .ufo/waves/round-17/w2/ReopenS042.md
