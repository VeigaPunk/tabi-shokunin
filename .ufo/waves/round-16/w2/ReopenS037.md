# ReopenS037 — S037 re-open against the row URL

Seat `TabiR16.ReopenS037`, wave 2 (falsify), lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Attacked snapshot: `git rev-parse HEAD` → `b444ca8e024f386124418169e8e400221524bba3` (matches the named build snapshot).
Read-only on the lane: `git status --porcelain corpus/SOURCES.md` empty; this report is the only file written.
No tools installed or upgraded.

## Axes named

- **A1 quote-at-anchor** — does an opened source yield a ≤25-word quote, at the row's named location, that grounds `teaches`?
- **A2 pin reproducibility and freshness** — does the revision exist, reproduce, and is `recheck: on-release` honest?
- **A3 kind / tier / scope honesty** — `spec`/`A` scoped to "adjacency context only", no tier inflation or scope drift.
- **A4 row-surface contract** — append-only provenance, enum/census cleanliness, and the status/used-by semantics of the same row.

## Verdict

**HOLDS** on the assigned checks (A1–A3). **One actionable contract drift on A4** (`status`/`used-by` vs the knowledge note's citation) and three non-falsifying precision caveats. Nothing in the row's content is false or inflated.

---

## Row as found (observed)

`awk -F'|' '/^\|[[:space:]]*S037[[:space:]]*\|/ {print}' corpus/SOURCES.md` → NF=13 (11 columns), cells:

| col | value |
|---|---|
| id | `S037` |
| source | `Model Context Protocol — Tools (2026-07-28) — https://modelcontextprotocol.io/specification/2026-07-28/server/tools` |
| kind | `spec` |
| tier | `A` |
| scope | `MCP tool definition fields and tools/list, as adjacency context only` |
| anchor | `revision 2026-07-28, tools.md line 290 and line 62` |
| teaches | `MCP tools share name, description and inputSchema vocabulary with WebMCP but are listed and called differently; adjacency, not equivalence` |
| status | `queued` |
| opened | `2026-10-20` |
| recheck | `on-release` |
| used-by | `—` |

Row-line digest `1884d541ccecfedbec4816b8ae3f8df372630f72bcd0567c3954b4bcb769f4f8`, identical in
`git show HEAD:corpus/SOURCES.md` and the worktree.

## A1 — quote at the anchor: observed

Opened the row URL this session. The route serves a markdown alternate; the raw bytes were fetched:

```sh
curl -sSL -o /tmp/<d>/tools.md https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md
wc -l < tools.md          # 797
sha256sum tools.md        # 09be49a064940ef288b47f8df09e95e6e3dc087c3f94e466acd60ec66dff25c3
```

The sha256 reproduces the draft's pin `09be49a0…c3` exactly (`DraftSources.md` §B, S037 rows).
Anchor lines, byte-exact:

```
62:  Servers that declare the `tools` capability **MUST** respond to `tools/list` requests
290: * `inputSchema`: JSON Schema defining expected parameters
```

Quotes and word counts (≤25 required):

| quote | location | words |
|---|---|---|
| "Servers that declare the `tools` capability **MUST** respond to `tools/list` requests" | raw line 62, §Capabilities | 11 |
| "`inputSchema`: JSON Schema defining expected parameters" | raw line 290, §Data Types → Tool | 5 |

Both sentences also appear in the row URL's own rendering (`/server/tools`, §Capabilities and §Data Types → Tool), not only in the `.md` alternate.

`teaches` clause-by-clause ground on the same page:

- shared `name` — raw line 286, `* name: Unique identifier for the tool` (§Data Types → Tool, starts line 282).
- shared `description` — raw line 288, `* description: Human-readable description of functionality`.
- shared `inputSchema` — raw line 290 (quoted above).
- "listed … differently" — raw line 62 plus §Listing Tools (line 78) and the JSON-RPC `tools/list` request/response.
- "called … differently" — §Calling Tools (line 135): `To invoke a tool, clients send a tools/call request`; result is `content[]` + `isError`, i.e. JSON-RPC, not the page's `execute` callback.
- "adjacency, not equivalence" — corroborated against WebMCP this session: `https://webmachinelearning.github.io/webmcp/` (sha256 `180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a`) defines `ModelContextTool` members `name`, `description`, `inputSchema`, `execute`, `title`, `annotations` (`dom-modelcontexttool-*` ids). Shared vocabulary is true and non-exhaustive; registration/announcement + `execute` vs JSON-RPC listing/calling is a real difference. The lane's receipt observation agrees (`registerTool({name, description, inputSchema, execute})`, `corpus/knowledge/webmcp-chromium-loopback-round-16.md:55`).

**Caveats (non-falsifying):**

- **C1 — lines need the `.md` route.** The anchor's line numbers are only meaningful on the `.md` alternate (797 lines); the row URL is the rendered route with no line numbering. The row does name `tools.md`, so it is decodable, but a reader must append `.md`. Suggested anchor: `§Capabilities and §Data Types → Tool (tools.md lines 62, 286–290), revision 2026-07-28`.
- **C2 — anchor span is partial.** The anchor names 290 and 62; it does not literally span `name`/`description` (286/288) or the `tools/call` half (§Calling Tools, 135). The `teaches` cell is accurate to the page; the anchor is a locator, not a full span of the cell.
- **C3 — Gate quote transform label.** The draft's Gate note says "(bold markers removed)" for the line-62 quote, but backticks are stripped too. Word count is unaffected (11 either way); the landed lesson should state the transform exactly, since the contract says "verbatim".

## A2 — revision and freshness: observed

- `https://modelcontextprotocol.io/specification/2026-07-28` → 200, markdown alternate: "This specification defines the authoritative protocol requirements, based on the TypeScript schema in [schema.ts](…/schema/2026-07-28/schema.ts)." The dated revision exists and is the normative spec route.
- `https://modelcontextprotocol.io/llms.txt` lists `2026-07-28` ahead of `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`: the pinned revision is the newest dated spec. `recheck: on-release` is therefore not yet due on 2026-10-20.
- `curl -sSI …/tools.md` → `HTTP/2 200`, `content-type: text/markdown; charset=utf-8`, `last-modified: Tue, 20 Oct 2026 14:58:32 GMT`, no `ETag`. That `last-modified` is serve time, not publication; the durable pin is the sha256.
- The fetched page carries no in-page revision date stamp (all 15 `2026-07-28` hits are URL path segments). The revision label is carried by the route and the sibling index page — acceptable for a versioned spec site, but it means the anchor's "revision" is URL-derived.

## A3 — kind / tier / scope: observed

- `kind: spec` — correct. The page is the MCP specification itself ("defines the authoritative protocol requirements"), not marketing docs. `spec` is in the contract's kind enum.
- `tier: A` — eligible and correctly scoped. Contract v1 defines A as "primary or authoritative for that scope (spec, official docs, …)". The scope cell limits it to "MCP tool definition fields and tools/list, as adjacency context only"; the `teaches` cell repeats "adjacency, not equivalence". No WebMCP-support claim is sourced to this row.
- No inflation: `tier-inflation` check for `A` + `community` does not fire; kind is `spec`.
- Full census from the lane root:

```sh
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md        # 39
awk … NF!=13 …                                                              # 0
awk … tier/status/kind enum + A/community …                                 # no output
awk … duplicate ids …                                                       # no output
```

## A4 — row-surface finding: status/used-by drift (actionable)

`corpus/knowledge/webmcp-chromium-loopback-round-16.md:94` cites the row for the shared-vocabulary point:

> `| "Page tools are MCP tools" | — | **no**: shared vocabulary only (name, description, inputSchema; S037 queued as adjacency); result shapes and lifecycles differ |`

Contract v1: `status` — `queued` (opened, worth mining) · `mined` (cited by ≥1 path in `used-by`); `used-by` — "repo-relative paths of the knowledge entries or lessons citing the row". On that wording the note is a citing knowledge entry, so the contract-consistent cells are `mined` with
`used-by: corpus/knowledge/webmcp-chromium-loopback-round-16.md`, and the row is currently `queued` + `—`.
The draft itself flagged the pending decision (`DraftSources.md`: "L1 may upgrade it to `mined` if the knowledge note cites it"), and the note does cite it.

L1 action (append-only, old→new logged in the round lesson): either set `status: queued → mined` and
`used-by: — → corpus/knowledge/webmcp-chromium-loopback-round-16.md`, or, if the parenthetical is judged a pointer rather than a citation, drop the S037 attribution from the note so the row's `—` stays true.

**Rule 1 landing state:** no `corpus/lessons/round-16.md` exists yet, so the round lesson's `## Gate` cannot yet carry the S037 quotes. They are recorded pre-landing in `.ufo/waves/round-16/drafts/DraftSources.md` §B lines 57–58 with URL, access date `2026-10-20`, location, fetch method and sha. Landing obligation: copy them verbatim (with the exact transform, per C3).

## Append-only provenance

```sh
git log --oneline -S'S037 | Model Context Protocol' -- corpus/SOURCES.md
# 8f7feb3 round-16: measurement-binding gate, native WebMCP loopback capability, sources and wave-1 evidence
```

Only commit A introduces S037; no earlier occurrence, so no id reuse or in-place edit. Row bytes at HEAD equal the worktree bytes (digest above).

## Observed / inference / unresolved

- **Observed:** every command and output above; both spec texts read this session.
- **Inference:** none material. `teaches` is read directly from both specifications; no extrapolation was needed.
- **Unresolved:** the site serves dynamically (`last-modified` = now, no ETag), so line numbers can shift if `2026-07-28` is republished in place. A future recheck should compare `sha256 09be49a0…c3` (or locate by heading) rather than trust line numbers. If the page bytes change, anchor C1/C2 become the failure mode, not the `teaches` content.
- **Not attacked (out of scope):** the counter, the harness, and C1/C2 claims of the round; this seat attacked only the S037 row.
