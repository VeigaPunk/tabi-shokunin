VERDICT: ISSUES

# S037 source-recheck falsification — TabiR18.LiveS037-2

Attacked: `corpus/evidence/round-18/source-recheck/S037.json` (+ `.excerpt.txt`), the S037 row of
`corpus/SOURCES.md` at REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`, its quote source
`corpus/lessons/round-16.md:47`, and `corpus/knowledge/source-recheck-round-18.md`.
Read-only on LANE. All probes ran in the private sandbox `/tmp/tabi-r18-s037-b2`; public sources
were GET-only; no browser, no credentials, no LANE/git/jj writes, no installs.
The producer was used only with `--normalize-only` (reads a `/tmp` body, writes nothing); no
receipt was produced or replaced.

Axes: **A** receipt integrity; **B** source identity/currentness; **C** anchor fidelity;
**D** quote→`teaches` support; **E** availability-vs-freshness semantics; **F** archival
reproducibility of the recorded command.

## A. Receipt integrity: HELD (all contract predicates)

Refetch of `receipt.url` with the recorded argv, in `/tmp/tabi-r18-s037-b2`:

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'http=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  'https://modelcontextprotocol.io/specification/2026-07-28/server/tools'
http=200 size=59632 url=https://modelcontextprotocol.io/specification/2026-07-28/server/tools
sha256sum body -> c75242dace0e9c22bfe286bae5680d93090df7032144b3c2902623023d8cd68b
wc -c < body  -> 904649
```

`size=59632` is curl's wire/download size; 904649 is the decoded body, matching
`S037.json:9-10`. Receipt predicates checked programmatically:

| predicate | observed |
|---|---|
| `schema` = `tabi-source-recheck-v1` | held |
| `row` = S037, present at REV, not in the superseded set | held (11 cells; row byte-identical at B `2bff864…` and REV) |
| `rowUrl` verbatim in the row's `source` cell at REV | held (`sourceCellContainsUrl=true`) |
| `sha256` 64-hex and body digest | held (full digest above) |
| `quoteWords` 5 = word count of `quote` | held |
| `normalize(quote)` in `normalize(excerpt)` | held: excerpt offset 600 |
| `excerptSha256` = sha256 of excerpt file bytes | held: `d080bd1f…afdcbd`; 1247 B / 1241 code points (3 × U+200B, trailing newline) |
| `quoteFound` true and `quoteOffset` | held, exactly: `{"found":true,"offset":6831,"normalizedLength":20801}` |
| `fetchedAt` on 2026-10-20 | held: `2026-10-20T19:06:10.857Z` |
| `teachesVerdict` = held | held (content; see D) |
| `httpStatus` 200 | held |
| `producerSha256` = producer blob at REV | held: `f2ba0033…6eaa360` = `git show REV:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` |

Excerpt derivation also reproduces: the excerpt is the normalized-body slice
`[6231, 7471)` = quote offset 6831 − 600 through +600 (`recheck-fetch.mjs:sourceExcerpt`).
The receipt's own claims are therefore not false.

## B. Source identity: HELD; currentness is real but outside the receipt

`receipt.url` is a versioned path (`…/2026-07-28/…`). Its revision is still the site's latest:

```
curl -sSL --compressed --max-time 90 ... 'https://modelcontextprotocol.io/specification/latest'
http=200 effective=https://modelcontextprotocol.io/specification/2026-07-28 bytes=39832
<link rel="canonical" href="https://modelcontextprotocol.io/specification/2026-07-28"/>
page text: "2026-07-28 (latest)"
```

So for S037 the "immutable vs live" worry is not realized *today*: the cited revision is the
current latest. But this currentness fact is **not in the receipt**; it was established by the
separate GET above. The receipt only proves that the pinned revision served the quote at
`19:06Z`. This is disclosed in `corpus/knowledge/source-recheck-round-18.md:12-13` and §6, but
it is a scope gap for a scalar named "freshness" (see E).

## C. Anchor: DRIFTED (row's `tools.md` coordinates/digest), not re-verified by the receipt

The row anchor is `corpus/SOURCES.md:51`:

> `revision 2026-07-28, tools.md line 290 and line 62`

The round-16 record `.ufo/waves/round-16/w2/ReopenS037.md:48-60` fetched the site alternate
`https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md` and recorded
797 lines, sha256 `09be49a0…ff25c3`, quote at **290**, `tools/list` at **62**. The preserved
copy `/tmp/mcp-tools-2026-07-28.md` (mtime 14:29:24Z, matching `.ufo/waves/round-16/w1/SrcMcpTools.md:20`)
reproduces those bytes exactly: 24314 B, 797 lines, sha256 `09be49a0…ff25c3`.

The live `.md` alternate today:

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o tools-site.md -w 'http=%{http_code} wire=%{size_download} effective=%{url_effective}\n' \
  'https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md'
http=200 wire=8438 effective=https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md
bytes=24244 lines=795 sha256=7e3bbac510b8779875304c47696f78cd0953d35f9f4ccc043b4a8034e9319d35
288:* `inputSchema`: JSON Schema defining expected parameters
60:Servers that declare the `tools` capability **MUST** respond to `tools/list` requests
```

Both cited lines moved **−2** (290→288, 62→60), and the digest changed
`09be49a0…ff25c3` → `7e3bbac5…9319d35`. This is not a UA artifact: no-UA `curl -sSL`,
`--compressed` no-UA, the producer UA, and a Chrome UA all returned the same 24244 B /
795-line / `7e3bbac5…` body. The response headers show the alternate is generated per request:
`last-modified: Tue, 20 Oct 2026 20:04:38 GMT` equals the request time; `x-matched-path:
/_mintlify/_markdown/...`; `cf-cache-status: EXPIRED`.

The change is a Markdown **rendering-format migration**, not prose drift. Diffing the preserved
old bytes against the live new bytes gives `<div id="enable-section-numbers" />`,
`<Note>/<Warning>/<Info>` → `> [!NOTE]/[!WARNING]`, with the text identical after stripping those
components/blockquote markers (22256 normalized characters on both sides). The quote and the
`teaches` content survived; the anchor's line coordinates did not.

The repo source is a *different artifact*: `docs/specification/2026-07-28/server/tools.mdx` at
GitHub `main` is 23788 B, sha256 `ed550806…4c490d`, with the same quote at line 290 and
`tools/list` at 62; the directory listing (`api.github.com/.../contents/docs/specification/2026-07-28/server`,
HTTP 200) contains only `tools.mdx`; `…/server/tools.md` is HTTP 404. The w1 side check
`.ufo/waves/round-18/w1/Recheck18.md:63-68` fetched this `.mdx` and concluded "Line reference
reproduces" and "not drift". That conclusion is about the `.mdx`, not the `.md` artifact the
row names and the round-16 record used; the `.md` coordinates have moved.

Why the receipt did not catch it: `S037.json:20` `anchorObserved` describes only the HTML
rendering ("revision 2026-07-28 in URL path and body markers; definition table at ~offset 6831
with tools/list and tools/call sections"). It does not bind `tools.md` lines or digest.
`measure-c1.mjs` parses `anchor` at `:144` but never validates `anchorObserved`, so the count
is unaffected. The author note discloses the general limit at
`corpus/knowledge/source-recheck-round-18.md:140` ("does not show … that the page is the one
the anchor names"), but its §5 "Moving anchors are not drift" example is S020, whose receipt
*does* record the revision drift (`S020.json` `anchorObserved` records `meta name=revision
51ed7565…`, `dt-updated 2026-10-20`, against the row's `f14762e6`). S037 has no equivalent
record for the `.md` line/digest drift.

At receipt time (`19:06Z`) the HTML still carried the old build (`dateModified
2026-10-18T02:02:44.764Z`, `buildId 6ad428a57bb2ce7f28edb130`), and the preserved `.md`
(fetched 14:29Z) was the old 797-line form. The site then rebuilt at
`2026-10-20T20:02:28Z` (observed as the new HTML `dateModified`/`buildId`); the `.md`
transition is **inferred** to be that deploy, because the exact `.md` response at 19:06Z was
not captured. The receipt is not false at fetch; it is
not durable, and its anchor binding is absent.

## D. `teaches` support: HELD across sources; the 5-word quote alone is partial

Row `teaches` (`corpus/SOURCES.md:51`): MCP tools share `name`, `description`, `inputSchema`
vocabulary with WebMCP but are listed/called differently; adjacency, not equivalence.

- Quote `"JSON Schema defining expected parameters"` supports only the `inputSchema` line.
- The fetched page supplies the MCP side: `name`/`description`/`inputSchema` at current `.md`
  lines 284/286/288; `tools/list` at 60/78; `tools/call` at 135.
- The WebMCP side is confirmed against the pinned S043 source:
  `raw.githubusercontent.com/webmachinelearning/webmcp/51ed7565…/index.bs`,
  91001 B, sha256 `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`
  (matches the S043 registry digest). `ModelContextTool` (`index.bs:1192-1201`) has
  `name`, `title`, `description`, `inputSchema`, `execute`, `annotations`; `registerTool` at
  `:695`, `executeTool` at `:697`; `tools/list` occurs 0 times.
- Therefore the claim is true, but it is not established by the 5-word quote alone: the quote
  covers 1 of the 3 vocabulary fields, and the "listed and called differently" comparison needs
  both sources. `S037.json:22` `note` asserts the full check; that is a seat judgment, not a
  machine-checked consequence of `quoteFound` (the author notes this at
  `corpus/knowledge/source-recheck-round-18.md:140`).

No falsification here; the correct classification is **held with a quote-support boundary**.

## E. Availability vs freshness: label is broader than the measured predicate

C1's predicate, `corpus/lessons/round-18.md:12` and `corpus/knowledge/source-recheck-round-18.md:1`
scope/§1, is a receipt plus a held quote at the pinned URL. It does not test whether the pinned
revision is the current revision; a superseded `2026-07-28` would still count if its quote were
present. Today the latest check passes (B), so S037 is not stale — but that check is outside
the receipt and outside the counter (`--live` re-fetches `url` and checks the quote only).
"Freshness 8 → N" therefore reads broader than "N integrity-checked rechecks"; the lesson's
Gate explicitly disclaims "current product support" (`corpus/lessons/round-18.md:12-13`), so
this is a claim-label/scope issue, not a false receipt.

## F. Recorded command is not shell-executable (low severity, all receipts share it)

`S037.json:7` records:

```
curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://…'
```

Executing that string as a shell command fails before any network I/O:

```
bash -c "curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o /tmp/tabi-r18-s037-b2/body2 -w %{http_code} 'https://modelcontextprotocol.io/specification/2026-07-28/server/tools'"
bash: -c: line 1: syntax error near unexpected token `('
as-recorded-exit=2
body2-absent
```

The actual producer passes the UA as one argv element (`recheck-fetch.mjs:95`), and a quoted-UA
reproduction produced the byte-identical body (`c75242…`). The counter nevertheless requires the
unquoted string (`measure-c1.mjs:233,356` `expectedCurlCommand`), so the field is a display
rendering, not an executable record. Impact is archival/reproducibility, not the body check.

## Classification summary

| facet | status | finite counterexample |
|---|---|---|
| receipt integrity | **held** | body sha256 `c75242…`; quote offset 6831; excerpt sha `d080bd…`; producer `f2ba0033…` |
| source identity | **held** | `/specification/latest` → `/specification/2026-07-28`; canonical same |
| anchor (row `tools.md:290,62`) | **drifted** | old `/tmp/mcp-tools-2026-07-28.md`: 797 lines, `09be49a0…`, 290/62; live `.md`: 795 lines, `7e3bbac5…`, 288/60 |
| `teaches` | **held** (quote partial) | MCP page + WebMCP S043 (`ModelContextTool` 1192-1201); quote covers only `inputSchema` |
| HTML body identity | changed after fetch (build instance) | `c75242…` at 20:02:00Z → `40e5d43c…` at 20:05Z; same 904649 B; 5 `dateModified` + `buildId` only; quote offset still 6831 |
| recorded command | not executable as recorded | `bash -c` exit 2, syntax error at `(X11;`; quoted UA reproduces the body |

The C1 count is **not** corrupted by this receipt: every predicate in the C1 contract is met,
and the author note's §6 disclaimers cover quote-presence and dynamic-body limits. The defects
are the unbound/stale anchor, the w1 side check validating a different artifact, the
non-executable command field, and the "freshness" label overstating availability+quote presence.
Repairs belong to integration (a superseding row or a recorded moving-anchor note; quoting the
UA in the canonical command), not to an in-place edit here.

## Limits / unrun

- `measure-c1.mjs` was not run; no producer receipt was generated. Only the producer's
  `--normalize-only` probe was used, on `/tmp` bodies; it writes nothing.
- No browser, no credentials, no LANE writes, no git/jj writes, no package operations.
- The `.md` transition time is inferred from the HTML build change at `2026-10-20T20:02:28Z`;
  the exact `.md` response at the receipt's `19:06Z` was not captured. The preserved old bytes
  are a pre-existing round-16 `/tmp` copy, matched to the committed round-16 record by digest.
- All timestamps: host local UTC−3; network outputs are UTC as printed by the servers.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS037.md
