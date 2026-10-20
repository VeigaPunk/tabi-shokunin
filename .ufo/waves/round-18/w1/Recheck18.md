VERDICT: PASS

# C1 freshness recheck — S036, S037 (seat Recheck18)

Rows read at `corpus/SOURCES.md:50` (S036) and `:51` (S037); original Gate quotes at
`corpus/lessons/round-16.md:46` and `:47` (§Gate starts at line 12). Neither row is in the
superseded set at B (`grep -n "supersedes S036\|supersedes S037" corpus/SOURCES.md` → no
hits), so both are in scope. Receipts were produced only by
`.ufo/waves/round-18/recheck-fetch.mjs` (producer sha256
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, matching each receipt's
`producerSha256`).

## S036 — held

- Receipt `corpus/evidence/round-18/source-recheck/S036.json`; excerpt `S036.excerpt.txt`.
- Row URL (verbatim in the `source` cell, verified `grep -F … | wc -l` → 1):
  `https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts`
- Fetch URL used (blob page is JS-rendered; raw is the same pinned commit):
  `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts`
- http 200, bytes 8553, sha256
  `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` — equals the anchor
  cell's `c23d575e…b632` and the Gate line's L1 fetch digest.
- Quote (original Gate quote, 5 words, quoteFound=true at offset 5485):
  `if (executionContext.isDefault && executionContext.frameId) {`
  quote-source `corpus/lessons/round-16.md:46`.
- Anchor observed: commit `66df492aaa0129d090937e933dd44c5389ab24d2` pinned in the row URL;
  body line 194 carries the quote; `#executionContextDestroyed` spans lines 192–203.
  Excerpt sha256 `03cf337dd372b7f9f554d7db7d553cec9e92d5d3e5ee1a8009dc298897cc7912`.
- Teaches judgement (held): lines 192–203 read `if (executionContext.isDefault &&
  executionContext.frameId) { const frameTools = this.#tools.get(executionContext.frameId);
  … this.#tools.delete(executionContext.frameId);
  this.dispatchEventToListeners(Events.TOOLS_REMOVED, toolsToRemove); }` — the frontend drops
  a frame's tools when the default execution context is destroyed and synthesizes
  `TOOLS_REMOVED` locally, so navigation removal is inferred rather than received. Consistent
  with the citing note's split `corpus/knowledge/webmcp-chromium-loopback-round-16.md:62,99,109`
  (navigation sends no `toolsRemoved`; the explicit-removal event is handled separately at
  lines 206–218 of the same file).
- Flagged nuance, not drift: the file *also* implements a protocol `toolsRemoved` handler
  (lines 206–218) for explicit removals. The teaches cell names navigation removal only, and
  the note grounds the negative on `inspector_web_mcp_agent.cc:178-191` at the 154 tag; the
  body supports the inference mechanism the cell cites.

## S037 — held

- Receipt `corpus/evidence/round-18/source-recheck/S037.json`; excerpt `S037.excerpt.txt`.
- Row URL (verbatim in the `source` cell, verified `grep -F … | wc -l` → 1):
  `https://modelcontextprotocol.io/specification/2026-07-28/server/tools`
- http 200, bytes 904649, sha256
  `c75242dace0e9c22bfe286bae5680d93090df7032144b3c2902623023d8cd68b`, decode `html-text`.
- Quote (original Gate quote, 5 words, quoteFound=true at offset 6831):
  `JSON Schema defining expected parameters`
  quote-source `corpus/lessons/round-16.md:47`.
- Anchor observed: revision `2026-07-28` in the URL path and body markers; the tool
  definition table (name / title / description / icons / inputSchema) carries the quote, with
  `tools/list` (servers MUST respond with currently available tools) and `tools/call`
  (invocation request) sections present. Excerpt sha256
  `d080bd1f615b94d2c57d2d737d1b5089840768a10f8d84e1a0b451f344afdcbd`.
- Teaches judgement (held): body lists tool definitions as `name`, `description`,
  `inputSchema` and routes listing through `tools/list` and invocation through `tools/call`,
  so the vocabulary is shared with WebMCP while listing/calling differ — adjacency, not
  equivalence, exactly as the cell states. Matches the citing note line
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md:101`.
- Anchor-cell side check (not drift): the Gate line names `tools.md line 290` with sha
  `09be49a0…25c3`; the spec repo at main now serves
  `docs/specification/2026-07-28/server/tools.mdx` (curl 200, 23788 bytes, sha256
  `ed550806a58eb7744b858fb9f26001aa5e55dac9e2babe88317cc81d9d4c490d`), whose line 290 is
  exactly ``- `inputSchema`: JSON Schema defining expected parameters``. Line reference
  reproduces; the `.md`→`.mdx` suffix and the differing digest are a file-format/served-page
  difference, and the teaches cell is unaffected.

## Drift drafts

None — both rows held, so no superseding SOURCES row and no Gate entry are proposed.

## Honesty / coverage

- Unrun: `measure-c1.mjs` is not present under `.ufo/waves/round-18/` (directory listing:
  PLAN.md, drafts/, recheck-fetch.mjs, sources/, w1/), so the counter itself was not run here.
- Browser: not used. Fetches were read-only `curl` GETs through the shared tool; no
  credentials, no pacman, no tool installs or upgrades.
- The two `/tmp` probe copies (`/tmp/r18-s036.raw.ts`, `/tmp/r18-s037.html`,
  `/tmp/r18-s037-src`) are scratch outside the lane and are not part of the deliverable.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S036.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S036.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S037.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S037.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck18.md
