VERDICT: PASS

# C1 freshness recheck — S052, S054 (seat Recheck24)

Both rows re-opened against their live source on 2026-10-20 and rechecked with
`.ufo/waves/round-18/recheck-fetch.mjs` (`--decode html-text`, probe run with
`--normalize-only` first on a curl'd copy in `/tmp/tabi-r18-recheck24`).
Both receipts: schema `tabi-source-recheck-v1`, `quoteFound=true`, `httpStatus=200`,
verdict `held`, `producerSha256 f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
(= live sha256 of the producer script). No drift, so no superseding row is drafted.

## S052 — git-rev-parse(1), https://git-scm.com/docs/git-rev-parse (row corpus/SOURCES.md:66)

- http: 200; bytes: 122459
- sha256: `1e84fc200220b2cd356b78f2344766ee7cbaafa8bcef64679dbf47ec585f19da`
  — identical to the row's Gate HTML digest (`corpus/lessons/round-17.md:64`), so the
  served page bytes are unchanged since round 17.
- quote (`quoteSource corpus/lessons/round-17.md:64`): "This will error out if $REV is empty or not a valid revision." (13 words)
- anchor observed: page marks "git-rev-parse last updated in 2.56.0"; version table row
  "2.56.0 2026-09-28" — matches the row's git 2.56.0 anchor.
- verdict: `held`. Body still carries "HEAD names the commit on which you based the changes
  in the working tree" and the example `$ git rev-parse --verify --end-of-options $REV^{commit}`
  immediately followed by the quoted error sentence (EXAMPLES section), so the teaches cell
  ("HEAD names the commit … not a branch", "--verify --end-of-options errors on empty or
  invalid revisions") is still supported at the anchor.

## S054 — Imperative API, https://developer.chrome.com/docs/ai/webmcp/imperative-api (row corpus/SOURCES.md:68)

- http: 200; bytes: 189556
- sha256: `eebe1d1a07960397dc3a8ab1888f54d1e27d1c285e9a5ccdaa61d07c9e6e4d9d`
  (one snapshot; a second full fetch gave a different digest at the same normalized length,
  as the row predicts — CSP nonce/feature arrays; quote checked by content)
- quote (`quoteSource corpus/lessons/round-17.md:59`, the Gate row of S047 that S054 supersedes): "This asynchronous method returns the result of the tool execution, or null when a navigation is triggered." (17 words)
- anchor observed: "Published: May 18, 2026, Last updated: October 16, 2026"; footer
  "Last updated 2026-10-16 UTC." — matches the row's page-last-updated 2026-10-16 anchor.
- verdict: `held`. §Execute tool still states the quoted return/null sentence; the Note after
  the second code block reads "JSON stringified input arguments are deprecated from Chrome 155.";
  a fresh full fetch normalizes to 16089 chars with **0** occurrences of "Chrome 154", so the
  teaches cell's qualification ("the page says nothing about 154") still holds.

## Contract self-check (both receipts)

- `rowUrl` occurs verbatim in the row's `source` cell (checked programmatically against corpus/SOURCES.md).
- `quoteWords` = 13 / 17 and equals the word count of `quote`; `normalize(quote)` occurs in the excerpt file.
- `excerptSha256` recomputed from the written excerpt bytes matches; `fetchedAt` = 2026-10-20T19:05Z.
- Row statuses at B unchanged: S052 `queued`, S054 `mined`; neither is in the superseded set
  (PLAN.md §C1: S047→S054, S053→S057).
- Producer blob is not yet at lane tip `2bff864f…` (round-18 wave files are uncommitted); the
  receipt binds the working-tree producer digest, which the integrator commits unchanged.

Tooling: no installs or upgrades (curl 8.23.0 and node already present). Scratch files in
`/tmp/tabi-r18-recheck24` only; no git writes, no `jj`.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S052.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S052.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S054.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S054.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck24.md
