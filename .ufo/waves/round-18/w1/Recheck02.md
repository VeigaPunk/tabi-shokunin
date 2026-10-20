VERDICT: PASS

# Recheck02 — C1 freshness, rows S003 + S005

Both rows re-opened live on 2026-10-20 with the shared producer
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
(producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equal to the file at LANE).
Both original Gate quotes are still present verbatim under `html-text` decoding; neither row drifted, so no
superseding row is drafted.

Inputs read: `corpus/SOURCES.md:17` (S003) and `:19` (S005); Gate records
`corpus/lessons/kaika-fleet-round-1.md:46` (S003) and `:48` (S005); PLAN.md §C1 receipt contract.
Lane tip `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` =
`2bff864fdfee684ddbcd066cc8e735adaba2735c` (= PLAN baseline B); `git status --porcelain corpus/SOURCES.md`
empty. Both `rowUrl` strings occur verbatim in the `source` cells at that revision; neither row is in PLAN's
superseded set (S004→S028, S039→S040, S047→S054, S049→S055, S050→S056, S053→S057).

## Per-row receipts

### S003 — https://developer.chrome.com/blog/chrome-for-testing
- http: `200`; bytes: `107908`
- sha256: `6091506bf107b8066c3e5d1e3a914edd7d6212f5de1dbef878f8239f1b3bc53b`
- quote (18 words, `quoteFound: true`, offset 5639): "a dedicated flavor of Chrome targeting the testing use case, without auto-update, integrated into the Chrome release process"
- quote-source: `corpus/lessons/kaika-fleet-round-1.md:46` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: article footer "Last updated 2023-06-12 UTC." and schema.org `"dateModified": "2023-06-12"` — matches the row's anchor "blog last updated 2023-06-12".
- teaches check (`A versioned, non-auto-updating Chrome flavor exists for automation, separating test browsers from the user's browser`): all three clauses are in the body.
  - versioned + non-auto-updating flavor: "Chrome for Testing is a dedicated flavor of Chrome targeting the testing use case, without auto-update, integrated into the Chrome release process, made available for every Chrome release. A versioned binary that's as close to regular Chrome as possible…" (normalized offsets ~5708-5844).
  - separation from the user's browser: "you may not want to use your regular Chrome installation for automated testing. This is the fundamental mismatch between what's good for regular browser users versus what's good for developers doing automated testing." (normalized offset ~4219-4269).
  - `teaches` cell wording matches the anchor's scope; no overstatement.
- excerpt sha256: `36c9ce9261d40bbd48bc88eb73de0873195c48ba7571515ada70051a732c40b2`
- boundary noted, not a drift: the row's anchor cell says "§Discover a dedicated Chrome flavor for testing", but that string now appears in the page as the side-nav/topic label, while the article's prose heading is "The solution: Chrome for Testing" (normalized offset ~5580). The nav string is still present in the body text, and the quote sits in the article prose beneath it, so the location claim remains true; recorded in the receipt `note`.
- fetch variance (observed): the page varies per request in the trailing inline `<script nonce="…">`. Today's producer fetch gave `107908` bytes / `6091506b…`; independent fetches from the same host in this run gave `ad08743dd06c11fb21aecea5d6ee3475488ea6acd723f7ffd1ac60e97e85c361` (107904 B), `0718caa84c7b03da0da1073f16b13ea7a84b1af13d6691ca66590beec9815bdb`, `1d686143a68e70e12af379cca14dd0490628b7ea065b41324dc26586688471f2`, `d3f893f1eaa789ced2bc96a580de89a7d563a4fe8c5733c4f627eb82651d8b64`, `b0782cf4183d5ebbd6c38afcacce9ed6899682fec4c8991f0e13e9e2219a0d01`. `cmp` between two of them: first differing byte at offset 101377, inside `…<script nonce="+Tjfi5Kxouw+2nzNsgTsqzk0nGuAQc">` vs `…<script nonce="6toLS4VCS7njolHFdCDMl7oapTeAly">`; everything before offset 101377 and the last 1357 bytes are equal. The normalized article text is identical across fetches — `quoteOffset` 5639 and `normalizedLength` 7892 match the receipt in an independent decode. The nonce length also explains the 107904/107908 byte-count spread. The round-1 seat digest `1618fa580b092d4838662ab31a248395224e7e08d581adf1f295251b78d3b77c` (also 107908 B, `corpus/knowledge/chrome-remote-debugging-profile-boundary.md:86`) differs for the same reason.
- drift draft: none.

### S005 — https://www.w3.org/TR/webdriver-bidi/
- http: `200`; bytes: `4235856`
- sha256: `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` — byte-identical to the round-1 seat fetch recorded at `corpus/lessons/kaika-fleet-round-1.md:48`, and to `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` (fetched in this run: http 200, same full-body digest). The dated Working Draft has not changed since 2026-10-19.
- quote (15 words, `quoteFound: true`, offset 876): "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents."
- quote-source: `corpus/lessons/kaika-fleet-round-1.md:48` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: `<p id="w3c-state">…W3C Working Draft, <time class="dt-updated" datetime="2026-10-08">8 October 2026</time>` plus `<meta content="f922e6af669ead51496db85f37813f39438ef171" name="revision">` and `<meta content="WD" name="w3c-status">` — matches the row's anchor "WD 2026-10-08" and the revision id cited at `corpus/knowledge/webdriver-bidi-capability-matrix.md:5`. Sections 7.1, 7.1.1-7.1.3.x, 7.2 … 7.10 all present in the section numbering ("7.10" occurs 112 times in the raw body).
- teaches check (`Maps each tabi CDP evidence surface to a BiDi command or event by spec section, and marks the draft as protocol text rather than implementation coverage`): the row states what the mapping is built from. The body still supplies that substrate — Abstract defines the protocol, and the numbered module sections 7.1-7.10 carry the command/event definitions the matrix cites (`corpus/knowledge/webdriver-bidi-capability-matrix.md:22-24,66-69` cites §§7.1-7.10 by module). The document is self-declared `WD` protocol text and makes no implementation-coverage claim; its own `Implementation Report` link points at wpt.fyi rather than asserting support. No clause of `teaches` overstates the source.
- excerpt sha256: `cef8ebf01371adc7e04311d24730b84373895e15017f121fd36a43f4bb8e3435`
- note: the page lists its predecessor `https://www.w3.org/TR/2026/WD-webdriver-bidi-20260930/` under "Previous Versions"; the live TR path currently serves the 2026-10-08 draft, so the anchor cell is current, not stale.
- drift draft: none (no superseding row needed).

## Contract self-check (run on the emitted files, not on the counter)
Both receipts parse as `tabi-source-recheck-v1` with `seat: Recheck02`; `row` present in `corpus/SOURCES.md` at lane tip and not superseded; `rowUrl` occurs verbatim in the row's `source` cell; `sha256`, `excerptSha256`, `producerSha256` are 64-hex; `quoteWords` (18, 15) equals the word count of `quote`; `normalize(quote)` occurs in `normalize(excerpt)` (recomputed independently with the producer's `normalize()`); `excerptSha256` equals sha256 of the excerpt bytes; `quoteFound` true for both; `fetchedAt` `2026-10-20T19:05:46.020Z` / `2026-10-20T19:07:46.122Z`; `httpStatus` 200; `teachesVerdict` `held` for both.

## Tooling
No installs or upgrades; `node` (v24.21.0) and `curl` were already present. No pacman transaction attempted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S003.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S003.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S005.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S005.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck02.md
