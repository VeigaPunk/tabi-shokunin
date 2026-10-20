# SrcAgentsDocs — round 16 wave 1 report (S021 re-open)

Scope: re-open S021 `https://developer.chrome.com/docs/devtools/agents` (queued), record whether it
mentions WebMCP or page-exposed tools, its current date/revision marker, and a ≤25-word located quote,
then decide used-by vs stays-queued for the native-WebMCP note. Author-side, read-only on the repo; the
only file written is this report. No commits, no gates/counters/selftests, no browser launched, no
subagent, no installs (nothing installed, no pacman transaction).

## Method (all observed 2026-10-20)

- `curl -sS -L -D /tmp/s021.headers -o /tmp/s021.html https://developer.chrome.com/docs/devtools/agents`
  → `HTTP/2 200`, `content-length: 125482`, `date: Tue, 20 Oct 2026 14:29:04 GMT`,
  sha256 `fa344696a569cc7878d0eae19129accdc8dc9dd95c118670527651f33ee76f3d`.
- Second GET with cache-buster `?cb=r16srcagentsdocs` → 200, 125478 bytes, sha256 `e3361781…`; diff
  confined to a per-response `<script nonce>` and the `GoogleDevelopersObject` experiment-flag list
  (earliest differing position 118739, Python string index, after `</devsite-badger>`); every article
  byte identical (see F6).
- Independent second method: the `read` tool fetched the URL natively and rendered the same body
  (same H1, lead paragraph, install sections; no WebMCP text).
- Text extraction: Python strip of `<script>/<style>`, tags→newlines, whitespace-normalized copy for
  quote matching (`/tmp/s021.txt` = 311 nonempty lines; `/tmp/s021.norm`-equivalent used below).
- Bounded child-page checks (same site, linked from S021): `agents/get-started` and
  `agents/webmcp-debugging`, both `curl -sS -L`.

## F1 — S021 itself: zero WebMCP, zero page-exposed tools (HIGH confidence)

Counts, case-insensitive, on both GETs. Absence rows are 0 under both `grep -oic` (matching lines)
and `grep -oi … | wc -l` (occurrences):

| token | count |
|---|---|
| `webmcp` | 0 |
| `modelcontext` | 0 |
| `toolname` | 0 |
| `structured tools` | 0 |
| `page.exposed` (regex) | 0 |
| `expose` | 0 |
| `MCP` (any casing) | 12 occurrences on 10 lines |

All 12 `MCP` occurrences are the DevTools MCP server or its install grammar — none is WebMCP:

- meta description and og:description: `Give the power of DevTools to agents through MCP or the CLI.`
  (byte offsets 7927, 8130 from `grep -obi`).
- `github.com/ChromeDevTools/chrome-devtools-mcp` link (78737), the same link plus anchor
  `#mcp-client-configuration` (79715, 79719), and the `docs/client-configurations.md` link (89465).
- code comments `# Install as an Antigravity plugin (MCP+Skills).` (82763) and
  `# Install as a plugin (MCP+Skills)` (84814).
- package/token spans in the Claude Code and Codex blocks (85564, 86109, 87872, 88527).

Visible "tools" phrasing is site chrome only (`the web's best tools`, `specialized agent skills`) plus
the three capability cards (emulate, debug live browser, Lighthouse). The agent gets DevTools actions;
the page never says a site or document registers tools. `Model Context Protocol` spelled out: 0 on S021
(it is spelled out only on the child `get-started` page).

## F2 — S021 date/revision marker (HIGH)

- HTTP header: `last-modified: Sun, 22 Mar 2026 00:00:00 GMT`.
- In-document: `<script type="application/ld+json">` Article `"dateModified": "2026-03-22"` at byte
  8716; no `datePublished` anywhere (`grep -c` → 0).
- No visible "Last updated" line: grep `updated` in extracted text → 0 hits.

So the existing row anchor cell ("rolling docs, no revision marker, read 2026-10-19") is inaccurate at
the machine-readable layer: a date marker exists (`2026-03-22`), and it is identical in both GETs.

## F3 — ≤25-word located quote (HIGH)

> "With Chrome DevTools for agents, your AI agent can interact with the Chrome browser to test code,
> emulate users, and catch bugs"

22 words, present verbatim in the raw HTML (byte 78167) and in the normalized rendered text. Location:
lead paragraph directly under the H1 "Chrome DevTools for agents" / page title "Chrome DevTools for
agents | Chrome for Developers". Access date 2026-10-20; fetch method `curl -sS -L` plus `read` render.
It claims agent↔browser interaction through DevTools capabilities; it does not claim page-exposed tools.

## F4 — Decision: S021 stays `queued`; not a used-by for the native-WebMCP note (HIGH)

Reasons, in order:

1. The row URL's bytes contain zero WebMCP / `modelContext` / declarative-tool markers (F1), so it cannot
   ground "pages expose tools to agents".
2. Its "MCP" is the opposite direction. `chrome-devtools-mcp` is an agent-side MCP server that drives a
   Chrome/DevTools session (agent → browser). WebMCP is the page → agent direction. The page never
   mentions the latter.
3. What the page does evidence is its own row scope: Chrome's documented agent integration surface —
   install channels (Antigravity pre-bundled; Antigravity CLI; Claude Code; Codex) and capability cards.
   Caveat for L1: the row's `teaches` cell ("The supported high-level alternative to raw CDP…") is not
   stated on the page; the page never mentions CDP, so if the row is later mined the teach should be
   tightened to the observed claim.

Recommendation: keep status `queued`, leave `used-by` empty, no S021 row edit from this seat (L1 owns
`corpus/SOURCES.md`).

## F5 — Adjacent primary page that DOES support the note (HIGH; separate URL, new row candidate)

The `agents/get-started` page (S021's "Get started" child, `dateModified 2026-05-13`) carries a sidebar
link marked *Experimental*: `Debug WebMCP tools` → `/docs/devtools/agents/webmcp-debugging`. The S021
landing page itself does not carry that nav item (`webmcp-debugging` occurrences: S021 0, get-started 1).

Opened this session:
`curl -sS -L -D /tmp/webmcp_dbg.headers -o /tmp/webmcp_dbg.html https://developer.chrome.com/docs/devtools/agents/webmcp-debugging`
→ `HTTP/2 200`, 173461 bytes, sha256 `f9ebf3d6211e67ca03e49ecce83c902a3025e03d4f16c87c486b5e71ef9c11af`,
`last-modified: Wed, 23 Sep 2026 07:00:00 GMT`, JSON-LD `"dateModified": "2026-09-23"`.
Token counts: `webmcp` 80, `modelcontext` 0, `toolname` 0.

Quotes (verified in tag-stripped normalized text; anchor markup leaves one extraction-only space before
the final period, the browser renders "AI agents."):

> "WebMCP is a proposed web standard for websites to expose their functionality as structured tools that
> are invoked by AI agents."

21 words; §intro, immediately after H1 "Debug WebMCP tools with AI agents". Access 2026-10-20, same fetch.

> "This feature requires Chrome 149+ with WebMCP features enabled."

9 words; §Browser requirements. Access 2026-10-20, same fetch.

Other located, non-quoted facts from the same page (for routing): the WebMCP category is inactive by
default and needs `--categoryExperimentalWebmcp`; Chrome 149+ with WebMCP features enabled (origin trial
or a locally enabled WebMCP flag); the page explicitly separates the DevTools MCP server (developer
debugging) from WebMCP tools (called by browser agents); the agent uses `list_webmcp_tools` and
`execute_webmcp_tool`.

Routing advice for L1: this URL, not S021, is the Chrome-docs page that supports the round-16
native-WebMCP note; it qualifies as a new primary row (kind `docs`, tier A, scope "DevTools-side WebMCP
debugging surface", anchor "dateModified 2026-09-23", recheck `on-release`). It also tells WebmcpHarness
that the vendor ships a `--categoryExperimentalWebmcp` category, which is a different switch from the
Chromium feature flags in PLAN.md. SrcChromeDocs may have opened the same URL — dedupe before adding.

Cross-seat note (attributed, not re-verified by this seat). `TabiR16.SrcChromeDocs-5` reports three
anchors from their own pinned 154 source pass: `flag_descriptions.h:3525` = "WebMCP for testing" /
"Enables the WebMCP API."; `blink/common/features.cc:571` shows `kDevToolsWebMCPSupport`
ENABLED_BY_DEFAULT at 154 (so that switch is a no-op default there); and `domains/WebMCP.pdl`
`command enable` emits `toolsAdded` for already-registered tools. If true, PLAN.md's assertion that
`--enable-features=DevToolsWebMCPSupport` is required at 154 would need restating as a default. I did
not open those files this session, so L1 should take them from SrcChromeDocs' report, not this one.

Dedupe outcome (2026-10-20, sibling message): SrcChromeDocs marks `webmcp-debugging` as shared off this
report and says it is "not proposing it as a new row". So the page currently has no proposing seat; if
L1 wants it citable as a `source:` line in the native-WebMCP note, L1 has to add the row itself (L1 owns
`corpus/SOURCES.md`) or the note must cite it outside the registry.

## F6 — Do not bind digests to developer.chrome.com responses (MED)

Two identical GETs of S021 return different bytes (`fa344696…` vs `e3361781…`). The diff is only the
per-response inline-script `nonce` plus the `GoogleDevelopersObject` feature-flag array; the article
region before that position is byte-identical. Measured with
`python3 difflib.SequenceMatcher(...).get_opcodes()`: earliest non-equal opcode at character index
118739. Consequence:
a source row or receipt should bind `dateModified` + the locatable quote, not a response hash. The child
page was not re-fetched, assume the same shape.

## Unknowns / limits

- Subpages other than `get-started` and `webmcp-debugging` (`use-cases/emulation`,
  `use-cases/auto-connect`, `use-cases/lighthouse-audit`, `extensions`, `memory`) were not opened; the
  nav list is from the get-started sidebar.
- `get-started` was read only enough to chase the WebMCP link; its own `dateModified 2026-05-13` is
  recorded but its content was not analyzed.
- No runtime behavior is asserted here (no browser, no CDP); the Chrome 149+/flag statements are the
  page's claims, not this seat's observations.

## Reproduction commands (exact)

```
curl -sS -L -D /tmp/s021.headers -o /tmp/s021.html https://developer.chrome.com/docs/devtools/agents
grep -oic webmcp /tmp/s021.html          # 0
grep -oic modelcontext /tmp/s021.html    # 0
grep -oic toolname /tmp/s021.html        # 0
grep -o '"dateModified": "[^"]*"' /tmp/s021.html   # "dateModified": "2026-03-22"
grep -ob 'Help your agent build, debug, and verify your code correctly' /tmp/s021.html  # 78167
curl -sS -L -o /tmp/webmcp_dbg.html https://developer.chrome.com/docs/devtools/agents/webmcp-debugging
grep -oic webmcp /tmp/webmcp_dbg.html    # 80
grep -o '"dateModified": "[^"]*"' /tmp/webmcp_dbg.html   # "dateModified": "2026-09-23"
```
