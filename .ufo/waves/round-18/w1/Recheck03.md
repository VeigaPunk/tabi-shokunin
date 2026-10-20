VERDICT: PASS

# Recheck03 — C1 freshness, rows S006 + S007

Both rows re-opened live on 2026-10-20 with the shared producer
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
(producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equal to the file on disk
at LANE; the file is currently untracked — `git status` shows `?? .ufo/waves/round-18/recheck-fetch.mjs`, lane tip
`2bff864fdfee684ddbcd066cc8e735adaba2735c` = B — so the producer becomes committed-at-REV only when L1 commits it).
Both original Gate quotes were still present verbatim in the normalized body; both pages' own metadata still names
the same `mdn/content` commit the rows were mined at, so neither row drifted and no superseding row is drafted.

## Per-row receipts

### S006 — https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules
- http: `200`; bytes: `163592`
- sha256: `7dc6b2bd57b0ed4eb7895bf8fdd6cc476ebeb6cb025f11fc774e7bec7810af87`
- decode: `html-text`; normalizer: the producer's single `normalize()` (NFC, quotes/dashes folded, whitespace collapsed)
- quote (8 words, `quoteFound: true`, `quoteOffset: 1950`): "The WebDriver BiDi protocol is organized into modules."
- quote-source: `corpus/lessons/kaika-fleet-round-1.md:49` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: the page-report metadata still carries
  `Last commit: https://github.com/mdn/content/commit/253bed3def8e1680475ea75987d24ca62ee9f989`
  — the exact commit the row's anchor cell cites (`MDN content commit 253bed3d`); body `last modified on
  Apr 22, 2026` (`<time datetime="2026-04-22T16:45:22.000Z">`); sections `§List of modules`, `§Commands`,
  `§Events`, `§Browser compatibility`, `§See also` all present.
- teaches check (`A navigable module index for locating BiDi commands and events before reading the spec section`):
  held. `§List of modules` still enumerates the modules with a one-line description each — `bluetooth`,
  `browser`, `browsingContext`, `emulation`, `input`, `log`, `network`, `permissions`, `script`, `session`,
  `storage`, `webExtension` — and the per-module `Commands`/`Events` headings plus the in-page sidebar list each
  command and event name (`session.new`, `browsingContext.contextCreated`, …), i.e. it is still a navigable index
  of commands and events, not a spec section. No clause of the cell overstates the body.
- excerpt sha256: `fee9eb7ebd5c320c2e8810a992b489b355458d704108d4935c164b073f028eae`
- drift draft: none.

### S007 — https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection
- http: `200`; bytes: `158088`
- sha256: `b7a0850e730f3e6ce82942b8f90338169e79621aaadd1f4255df95af7672b038`
- decode: `html-text`
- quote (15 words, `quoteFound: true`, `quoteOffset: 1983`): "The client and the browser communicate using the WebDriver BiDi protocol over a WebSocket connection."
- quote-source: `corpus/lessons/kaika-fleet-round-1.md:50` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: page-report metadata still carries
  `Last commit: https://github.com/mdn/content/commit/f83c12ab41865e0e195dd36ad9cdcad511a36957`
  — the exact commit the row's anchor cell cites (`MDN content commit f83c12ab`); body `last modified on
  Mar 24, 2026` (`<time datetime="2026-03-24T19:54:02.000Z">`); sections `§Launching the browser`,
  `§Getting the WebSocket URL`, `§Connecting to the WebSocket endpoint` all present.
- teaches check (`How a client obtains a BiDi WebSocket and why direct Chromium launches need an extra BiDi layer`):
  held. Intro gives the two bootstrap paths — the `webSocketUrl` capability on a classic WebDriver session, or a
  command-line launch — and states verbatim that "This method works with Firefox directly; however,
  Chromium-based browsers require the additional Chromium BiDi wrapper package." `§Getting the WebSocket URL`
  gives the direct endpoint `ws://127.0.0.1:PORT/session` and the stderr line `WebDriver BiDi listening on
  ws://127.0.0.1:46249` for port `0`; `§Launching the browser` gives `firefox --remote-debugging-port 9222`.
  Both clauses of the cell are in the body; the Chromium-wrapper sentence sits inside the excerpt window.
- excerpt sha256: `63a490f0784b5cbb11205abe4462b4579e218c11610464698c06b4e1966bce51`
- drift draft: none.

## Fetch-variance note (not a drift)

The raw-fetch sha256 recorded at mining (`corpus/lessons/kaika-fleet-round-1.md:49` `6bb0a5edad…b7806c9`,
`:50` `0a3b26cff1a21d25f50b2c612453797b2de5cd83311a4bd47536fcaa3c8de2d4`) differs from today's raw bytes
(`7dc6b2bd…af87`, `b7a0850e…2b038`) — MDN serves per-request build chrome, so the Gate sha is not reproducible
from a fresh GET. The content-identity marker that *is* stable and comparable is the page's own `Last commit`
link, which is unchanged for both rows (2026-10-19 → 2026-10-20), and both quotes are present verbatim at
normalized offsets 1950 / 1983. [INFERENCE] the byte delta is MDN page chrome (asset hashes / nav build ids),
not article text; unverified which bytes differ because the round-1 raw body was not retained.

## Contract self-check (run on the emitted files, independent of any counter)

Verified with a throwaway `/tmp` script importing the producer's `normalize()` over
`corpus/evidence/round-18/source-recheck/S00{6,7}.json` + `.excerpt.txt`:
- `schema` = `tabi-source-recheck-v1`; `row` = S006 / S007, both present in `corpus/SOURCES.md` at the lane tip
  (`git show 2bff864:corpus/SOURCES.md`, lines 20–21) and neither in PLAN's superseded set
  (S004, S039, S047, S049, S050, S053).
- `rowUrl` occurs verbatim in the row's `source` cell at that tip blob (`grep -c` → 1 each).
- `sha256` and `producerSha256` are 64-hex; `quoteWords` (8, 15) equals `quote.trim().split(/\s+/).length`
  and ≤ 25.
- `normalize(quote)` occurs in `normalize(excerpt)` → true for both; `quoteFound` true; `fetchedAt`
  `2026-10-20T19:06:09.057Z` / `2026-10-20T19:06:14.208Z`; `httpStatus` 200; `teachesVerdict` `held`.
- `excerptSha256` equals `sha256sum` of the excerpt bytes on disk (checked externally as well:
  `fee9eb7e…8eae`, `63a490f0…ce51`).

Residual: `producerSha256` cannot yet be checked against `git show REV:.ufo/waves/round-18/recheck-fetch.mjs`
because that path is untracked at the current tip (B). It equals the on-disk producer; L1's commit makes it
checkable.

## Tooling

No installs or upgrades; `node` v24.21.0 and `curl` were already present. No pacman transaction attempted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S006.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S006.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S007.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S007.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck03.md
