VERDICT: PASS

# Recheck19 — C1 freshness recheck of S038 and S040

Seat: Recheck19. Date 2026-10-20. Row source: `corpus/SOURCES.md:52` (S038), `corpus/SOURCES.md:54` (S040).
Neither row is in the PLAN §C1 superseded set (`S004→S028, S039→S040, S047→S054, S049→S055, S050→S056,
S053→S057`); S040 is the successor of S039, not superseded itself. Both rows are `rejected`, so a `held`
verdict means the body still supports the *teaches* cell, not that the rejection reverses.

Both receipts were produced only by
`node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs … --seat Recheck19`
(schema `tabi-source-recheck-v1`), exit 0, `quoteFound=true` for both.

## S038 — webmcp-fork CHROMIUM_FLAGS.md (rejected)

- Row: `corpus/SOURCES.md:52`; source cell URL
  `https://github.com/Sgr57/webmcp-fork/blob/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md`
  (present verbatim in the row line — checked).
- Gate quote origin: `corpus/lessons/round-16.md:48`
  `"console.log('modelContext available:', !!navigator.modelContext);"` (line 140).
- Fetch: row URL is a GitHub blob page (HTML); the marked-up body was fetched from
  `https://raw.githubusercontent.com/Sgr57/webmcp-fork/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md`
  with the tool's own curl argv. The blob page itself also answered `200` (`curl -o /dev/null -w '%{http_code} %{size_download}'` → `200 62002`, report-only check).
- http 200 · bytes 13006 · sha256
  `351c02db5b16e283b9e59f1a2575c012cda96c51a60467051a1236fe15c7555a`
  (independently re-derived: `sha256sum /tmp/r18-s038-raw.md` gives the same digest; the round-16 Gate
  digest prefix `351c02db…` matches, so the file is unchanged since that fetch).
- decode `none` · quoteOffset 2914 · quoteWords 3.
- Quote found: `console.log('modelContext available:', !!navigator.modelContext);` at body line 140,
  inside `#### Method 2: JavaScript Console`.
- Anchor observed: no date/revision marker anywhere in the body; the only anchor available is the unchanged
  byte digest plus the line-140 position, both identical to round 16.
- Teaches check (`Flag recipe and readiness check for native WebMCP in Chromium`): **held**.
  Body still lists `--enable-experimental-web-platform-features` and `--enable-features=WebModelContext`
  (lines 11–24) and still ships the `!!navigator.modelContext` readiness check (line 140) plus
  `navigator.modelContextTesting` checks — i.e. exactly the surface the row teaches and rejects.
- Drift draft: none (verdict held).

## S040 — bug0, "WebMCP just landed in Chrome 146" (rejected)

- Row: `corpus/SOURCES.md:54`; source cell URL `https://bug0.com/blog/webmcp-chrome-146-guide` (present
  verbatim in the row line — checked).
- Origin report that opened the row: `.ufo/waves/round-16/w1/SrcRejects.md:27` (`## Reject R1 — bug0,
  "WebMCP just landed in Chrome 146"`), with the suggested-row block header at `SrcRejects.md:65` and the
  row itself at `SrcRejects.md:68` (its teaches cell is byte-identical to the registry's S040 teaches cell);
  the per-row Gate quote record is `corpus/lessons/round-16.md:49`
  (`| S039, S040 | https://bug0.com/blog/webmcp-chrome-146-guide | "The API lives at navigator.modelContext." | §How it actually works para 1; published 2026-02-11 |`;
  see also `corpus/lessons/round-16.md:65` — "S039: unchanged in place; superseded by S040").
- http 200 · bytes 242270 · sha256
  `a85a527aed2cb5de25d698535d3850de7bcb990d62944965d54826fc10bb0570`
  (independently re-derived from the curl'd copy: `sha256sum /tmp/r18-s040.html` → same).
- decode `none` · quoteOffset 192718 · quoteWords 5 · receipt `quoteSource` = `corpus/lessons/round-16.md:49`.
- Quote found: `The API lives at \`navigator.modelContext\`.` — the exact Gate sentence, carried verbatim
  in the served body's embedded post markdown (headings `## How it actually works` intact). Note on decode
  choice: `--decode html-text` also finds the sentence but tag-stripping renders it as
  `The API lives at navigator.modelContext .` (space before the period), so `none` was used to keep the
  quote byte-literal rather than introduce that artifact.
- Anchor observed: `"datePublished":"2026-02-11T06:06:40.926Z"` and `"dateModified":"2026-02-11T06:06:40.926Z"`
  (identical → unmodified since publication), byline `February 11, 2026`, title
  `WebMCP just landed in Chrome 146. Here's what you need to know | Bug0`.
- Teaches check (`WebMCP API surface and local flag recipe as of 2026-02-11`): **held**. The body still
  states `navigator.modelContext` as the API location and still gives the local flag steps
  (`install Chrome 146 or later → chrome://flags → "Experimental Web Platform Features" → Enabled →
  relaunch`), which is the dated API-surface + flag-recipe pair the row teaches and rejects.
- Drift draft: none (verdict held).

## Counter-contract self-checks (read-only, independent of the producer)

- `node -e` re-implementation of the normalizer over both excerpt files: `quoteInExcerpt=true` for S038
  and S040; `quoteWords` 3 and 5 match `quote.trim().split(/\s+/)`.
- Excerpt digests recomputed: `sha256sum S038.excerpt.txt S040.excerpt.txt` →
  `03902da9ceabf6c7ddb08b98308d9eaa752694fe3a026a9b2242f43c3b176a9b` and
  `40baf1b14db8b580eeac18fd5c5861c5dc39c1cfa5e5b1dbbd54838f67e4447f`; both equal the receipts'
  `excerptSha256`.
- `fetchedAt` both begin `2026-10-20`; `httpStatus` both 200; `rowUrl` present verbatim in the row line;
  both row lines carry `| rejected |`.
- `producerSha256` in both receipts = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
  = `sha256sum .ufo/waves/round-18/recheck-fetch.mjs` at write time.

Unresolved gaps: S038's body carries no revision/date marker at all, so "held" there rests on the
unchanged byte digest and line number, not on an in-body anchor; an upstream edit that preserves the
digest is impossible, but an edit before round 16 could not be excluded by in-body evidence alone
[INFERENCE: none expected, file digest matches the round-16 fetch]. S040 is a frozen 2026-02-11 post; its
`dateModified` agreeing with `datePublished` is the only freshness signal the page exposes.

Tooling: nothing installed or upgraded this run (no pacman/uv/npx activity).

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S038.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S038.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S040.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S040.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck19.md
