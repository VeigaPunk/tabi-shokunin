# Gate line for S118 (insert in `corpus/lessons/round-30.md` §Gate, after the S117 row)

| row | URL | accessed | receipt quote (≤25 words, located in the committed bytes) |
|---|---|---|---|
| S118 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | 2026-10-26T07:02:46Z (Gitiles TEXT, 11,404 B served / 8,553 B decoded, sha256 `c23d575e…b632`; directory listing 07:02:04Z) | `WebMCPModel.ts:249-250` "toolResponded(params: Protocol.WebMCP.ToolRespondedEvent): void { const call = this.#calls.get(params.invocationId);" |

Supporting spans (same decoded bytes, each verified contiguous and unique by
`re.search` over whitespace-collapsed text; see `receipts/quote-check.txt`):

- `WebMCPModel.ts:130-133` "const response = await target?.webMCPAgent().invoke_invokeTool({ toolName: this.name, frameId: this.#protocolTool.frameId, input," (10 words) — the invoke request the panel's `invoke` sends.
- `WebMCPView.ts:575-576` "${call.result?.output !== undefined ? JSON.stringify(call.result.output) : call.result?.errorText ?? ''}" (9 words) — the panel renders output/errorText, i.e. the status and output rendering S044's scope names.

Correction this row records: S044's anchor places `WebMCPModel.ts:128-139, 249-258` under
`front_end/panels/application/`; that path returned HTTP 404 at 66df492 (Chromium tag 154.0.8037.97,
DEPS line 424) and at bf69d041 (M156) — `bytes/NOT_FOUND.panels-application.WebMCPModel.ts@*.b64`.
The panel directory (85 entries) holds `WebMCPView.ts`, `WebMCPView.test.ts`, `WebMCPTreeElement.ts`,
`webMCPView.css` only; its BUILD.gn lists those and no model. The model is
`front_end/models/web_mcp/WebMCPModel.ts` (BUILD.gn `sources = [ "WebMCPModel.ts" ]`; barrel
`import * as WebMCPModel from './WebMCPModel.js';`), 8,553 B, sha256
`c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`, byte-identical at both commits.
