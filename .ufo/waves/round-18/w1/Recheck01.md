VERDICT: PASS

# Recheck01 — C1 freshness, rows S001 + S002

Both rows re-opened live on 2026-10-20 with the shared producer
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
(producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equal to the file at LANE).
Both original Gate quotes were still present verbatim; no row drifted, so no superseding row is drafted.

## Per-row receipts

### S001 — https://developer.chrome.com/blog/remote-debugging-port
- http: `200`; bytes: `96397`
- sha256: `c040a72e40a7bf4a00dd2942e80ed2b608d65a10959fd668d4b7bc19a89d6212`
- quote (16 words, `quoteFound: true`, offset 3161): "These switches will no longer be respected if attempting to debug the default Chrome data directory"
- quote-source: `corpus/lessons/kaika-fleet-round-1.md:44` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: footer "Last updated 2025-03-17 UTC." and the body paragraph opening "Therefore, from Chrome 136 we're making changes to the behavior of --remote-debugging-port and --remote-debugging-pipe."
- teaches check: body still says the switches are ignored for the default Chrome data directory, that they "must now be accompanied by the --user-data-dir switch to point to a non-standard directory", and that Chrome for Testing "will continue to respect the existing behavior" — all three clauses of `teaches` are present.
  Two boundaries, neither a drift: (a) the only date marker in the body is "Last updated", while the row's anchor cell says "published" — same date, label differs, date claim unaffected; (b) the word "branded" is not in this body — the branded-only qualifier comes from S004, and this page's subject is Chrome (developer.chrome.com), consistent with it. Recorded in the receipt `note`.
- excerpt sha256: `ae29eb05ecbea4d1bcb5f1f5bfd87c7c782de8111ce0872e864d5642af0a2bca`
- drift draft: none.

### S002 — https://chromedevtools.github.io/devtools-protocol/
- http: `200`; bytes: `35462`
- sha256: `ba8018bb02f360686cbff23304da8b6e21923a2e012ade273e3f9a2ce1e2fd64` — byte-identical to the kaika round-1 seat fetch recorded at `corpus/lessons/kaika-fleet-round-1.md:45`; the living page has not changed since 2026-10-19.
- quote (17 words, `quoteFound: true`, offset 760): "CDP is not a public or supported API for Chrome, and it does not guarantee backwards compatibility"
- quote-source: `corpus/lessons/kaika-fleet-round-1.md:45` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: no date or commit marker anywhere in the body (living page); both `§Scope and support` and `§HTTP endpoints` present.
- teaches check: `§Scope and support` still says "Direct use of CDP by third-party applications is unsupported" with no backwards-compatibility guarantee (build-scoping clause); `§HTTP endpoints` still says PUT `/json/new` "strictly requires the PUT method" and that GET/POST "fails with 405 Method Not Allowed" (`/json/new` requires PUT clause). Both clauses present.
- excerpt sha256: `e890020b3eadb74a78ca5107477286b2d9c0c29cc112d7586a268d5aebacf710`
- drift draft: none.

## Contract self-check (run on the emitted files, not on the counter)
Each receipt parses as `tabi-source-recheck-v1`; `row` present in `corpus/SOURCES.md` and not in PLAN's superseded set; `rowUrl` occurs verbatim in the row's `source` cell; `sha256` and `producerSha256` are 64-hex; `quoteWords` (16, 17) equals the word count; `normalize(quote)` occurs in `normalize(excerpt)`; `excerptSha256` equals sha256 of the excerpt bytes; `quoteFound` true; `fetchedAt` 2026-10-20; `httpStatus` 200; verdict `held`.

Note on S001 fetch variance: the round-1 seat fetch was `bf63ed06681d7adf7e645cb55cd81f314e713f0b85893ee00ebc93663a871668` and the L1 re-open `f0c70bd2…5f6a`; today's bytes are `c040a72e…` (same 96397-byte length). The page carries request-varying content, but the Gate sentence is present at the same normalized offset and the dated body is unchanged in substance — consistent with the round-1 "dynamic page" note at `corpus/lessons/kaika-fleet-round-1.md` (L1 re-open paragraph). [INFERENCE] the varying bytes are page boilerplate, unverified which bytes differ.

## Tooling
No installs or upgrades; `node` (v24.21.0) and `curl` were already present. No pacman transaction attempted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S001.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S001.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S002.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S002.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck01.md
