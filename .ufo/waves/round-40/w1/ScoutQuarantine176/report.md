# ScoutQuarantine176 — quarantine hand-check, staged ID S176

Accessed: 2026-10-27T19:34Z (UTC). Scratch: /fast/scratch/hyaku/tabi-r40/ScoutQuarantine176/ (deleted before yield). Tooling: none installed (RULES.md read; no pacman).

## Row identification
Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` has TWO data rows with id S176 (line 114 `kotoba` round5 -> agentskills.io; line 214 `tabi` round5). This is the Tabi wave, adjacent to S175 (tabi) in `assimilation/quarantine-slice`, so I classified the **tabi round5 S176** row (line 214) only:

`| tabi | round5 | S176 | payload-absent | https://web-mcp.net/security-guide | origin trial / Understand origin trials / Third-party origin trials | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

Disambiguation limitation: the staged slice lists only the bare id; I chose the tabi row by lane adjacency, not by an explicit lane tag. The kotoba S176 row (agentskills.io) was not fetched.

## Source access
`curl -sSL -A Mozilla/5.0 https://web-mcp.net/security-guide` -> HTTP/2 200, text/html, 385056 bytes, sha256 55df2673013d439545d9833fdbb9d7a1778de90b5f9222efdf0ba5909d6905c8. Fully opened (Next.js prerender; visible text ~46.9k chars after tag/script strip). Page title "WebMCP Security Guide — Threats & Best Practices".

## Quote search (raw HTML and tag-stripped text, case-insensitive)
- `origin trial`: 0 hits; `trial`/`Trial` anywhere: 0 hits (raw HTML, including inline scripts/RSC payload).
- `Understand origin trials`: 0. `Third-party origin trials`: 0 (the only "third-party" hits are unrelated: CSP/XSS tool-poisoning and untrusted-content sentences).
- Section headings list (h1–h3) contains no origin-trial section.

## Provenance of the staged quotes (read-only lookups in shokuknow)
All three staged quotes belong to row **S177** (https://developer.chrome.com/docs/web-platform/origin-trials, §"Understand origin trials", §"Third-party origin trials"; lanes/tabi/round5/SOURCES-PROPOSED.md:85, KNOWLEDGE-PROPOSED.md:68). The census (`quote-lint-full-v5.json`) bound them to the S176 URL/line, so the register row is a mis-binding of S177 quotes to S176's source.
The S176 row's own declared anchors (SOURCES-PROPOSED.md:77: §"Explicit Tool Registration" and the `requestUserInteraction()` entries) ARE present in the page:
- "Explicit Tool Registration Nothing is exposed by default. You must call navigator.modelContext.registerTool() for each tool." (<=25 words; located in "Layer 2: Protocol-Provided Mechanisms" area)
- "requestUserInteraction() Forces the browser to show a native UI prompt for high-stakes actions. The agent CANNOT bypass this." (located under "Layer 3: Your Responsibility")

## Classification
- Staged quotes (`origin trial`, `Understand origin trials`, `Third-party origin trials`) vs cited URL web-mcp.net/security-guide: **ABSENT** — source successfully opened (200, 385 KB), quotes not present. This is a genuine absence in the cited source, but the cause is a quote/URL mis-binding (quotes belong to S177's Chrome source), not fabrication of S176's own content.
- S176's own anchors (Explicit Tool Registration; requestUserInteraction()): **present**.

## Limitations
Single live fetch 2026-10-27 (page is a CDN-cached prerender, `age` ~13.0M s, so content is old and stable); no JS-rendered browser pass (quote strings also absent from the raw RSC payload, so rendering unlikely to add them). I did not re-fetch S177's Chrome page. No edits to shokuknow or lane corpus.

VERDICT finding S176(tabi/round5): staged quotes absent from successfully-fetched cited source (mis-bound S177 origin-trial quotes); S176's own anchors present — correct the register/census binding, not a fabrication of S176 content
