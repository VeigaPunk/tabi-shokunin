# ScoutFreshnessReopen — round 25 wave 1 (C2 fresh fetch of six on-release rows)

Seat: L1Tabi25.ScoutFreshnessReopen. Read-only reporter. Repo HEAD `c8ef3084` ("round-25: freeze
claims, controls, census-before, wave-1 spec"), one commit after baseline `9e136667`;
`git diff --stat 9e136667 HEAD -- corpus/SOURCES.md corpus/lessons/kaika-fleet-round-1.md` is empty,
so the held quotes are the same at baseline and HEAD. Tool installs: none.

## Result

All six rows **hold**. Each fetch returned HTTP 200 on 2026-10-25T12:15:24Z, and each held quote
appears exactly once in today's bytes, with the same capitalization (6/6 located, 0 drifted, 0 absent).

**Load-bearing for C2's counter and the skip-work control:** today's bytes are byte-identical
to earlier committed fetches for all six rows. The five Playwright pages match the 2026-10-19
seat digests (`corpus/lessons/kaika-fleet-round-1.md:56-67`), and the 2026-10-20 round-18 digests
for S015, S016 and S024 (`corpus/evidence/round-18/source-recheck/S0{15,16,24}.json`). S020
matches the round-18 digest from 2026-10-20 (`corpus/evidence/round-18/source-recheck/S020.json`,
`sha256 5627596668…ca40`), but not the 2026-10-19 seat digest (`a8f75790…04a1`). A counter cannot
prove "fresh this round" by checking that the sha256 differs from earlier fetches. Unchanged pages
give the same sha256, so that rule would mark these honest fetches stale. The control fixture
`.ufo/waves/round-25/control/skipwork-freshness.json` uses `fetchDigest: "legacy-2026-10-19"`, which is
a label rather than a sha. Freshness therefore has to rest on this round's `fetched_at`, a
round-25 bytes path or the response `date` header, and not on whether the sha changed.
[INFERENCE: I have not read the counter `scripts/check-source-reopen-receipt.mjs`. It is not in the
tree at HEAD: `ls scripts | rg -i 'reopen|recheck|source'` → only `check-sources.mjs`.]

## Method (commands)

- Fetch (all six in parallel, from `.ufo/waves/round-25/scratch/ScoutFreshnessReopen/`):
  `curl -sS -L -o <ID>.html -D <ID>.headers -w '%{http_code} %{size_download} %{url_effective}' --max-time 60 <URL>`;
  then `sha256sum <ID>.html` and `wc -c < <ID>.html`. No redirects: the final URL equals the request URL for all six.
- Held quote source: `corpus/SOURCES.md` header says each row's ≤25-word quote is carried in
  `corpus/lessons/kaika-fleet-round-1.md` §Gate. The SOURCES "teaches" cell is a paraphrase. The quotes
  come from `rg -n 'S0(13|15|16|20|23|24)\b' corpus/lessons/kaika-fleet-round-1.md` (lines 56, 58, 59, 63, 66, 67).
- Location: `python3 locate.py` (scratch dir) → `locate-out.json`. It reports (a) the exact raw-byte
  search with byte offset and 1-based raw line; (b) a tag-tolerant raw search, where words may be separated
  by whitespace, inline tags or `&nbsp;`, and `"` may be an entity; and (c) a search of the visible text,
  after removing script/style blocks and tags, unescaping HTML entities, applying NFC, folding curly
  quotes and dashes, and collapsing whitespace. Each text search reports the match count, case-insensitive.
- Headers: `rg -i '^(last-modified|etag|age|date|x-cache):' <ID>.headers`.

## Per-row findings

| id | HTTP | bytes | sha256 (today) | quote located at | prior digest equal? | verdict |
|---|---|---|---|---|---|---|
| S013 | 200 | 99073 | `cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa` | raw exact, byte 42946, line 68; text offset 3375, count 1 | = 2026-10-19 seat (lesson :56) | holds |
| S015 | 200 | 47845 | `31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d` | raw exact, byte 26887, line 5; text offset 1142, count 1 | = 10-19 seat (:58) and round-18 S015.json | holds |
| S016 | 200 | 159543 | `1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c` | raw tag-split, byte 28210, line 7; text offset 1304, count 1 | = 10-19 seat (:59) and round-18 S016.json | holds |
| S020 | 200 | 511987 | `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` | raw exact, byte 28801, line 872; text offset 577, count 1 | = round-18 S020.json (2026-10-20); ≠ 10-19 seat `a8f75790…` | holds |
| S023 | 200 | 268087 | `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` | raw tag-split, byte 56837, line 36; text offset 4231, count 1 | = 10-19 seat (:66) | holds |
| S024 | 200 | 125426 | `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` | raw exact, byte 36001, line 56; text offset 4527, count 1 | = 10-19 seat (:67) and round-18 S024.json | holds |

Two quotes span inline markup in the raw bytes, so an exact raw-byte search misses them and a
tag-tolerant search or the visible-text search finds them. A counter that greps raw bytes without
removing tags would wrongly report these two quotes as absent:
- S016 raw span: `Playwright also includes web-specific <a class="" href=/docs/api/class-locatorassertions>async matchers</a> that will wait until the expected condition is met.`
- S023 raw span: `role locators <strong>do not replace</strong> accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines`

Visible-text context (from `locate-out.json`), confirming section placement:
- S013 (§Retries): `Playwright Test will categorize tests as follows: "passed" - …; "flaky" - tests that failed on the first run, but passed when retried; "failed" - …`
- S015 (§Introduction): `… It auto-waits for all the relevant checks to pass and only then performs the requested action. If the required checks do not pass within the given timeout, action fails with …`
- S016 (§Introduction): `… toBeTruthy … Playwright also includes web-specific async matchers that will wait until the expected condition is met.`
- S020 (Abstract): `Abstract The WebMCP API enables web applications to provide JavaScript-based tools to AI agents. Status of this document …`
- S023 (§Locate by role): `Note that role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines.`
- S024 (§Aria snapshots): `Aria snapshots In Playwright, aria snapshots provide a YAML representation of the accessibility tree of a page.`

## Observations beyond the quote (do not change any verdict)

- S020 anchor cell drift (already known, not new): the SOURCES anchor cell reads `CG-DRAFT 2026-10-16, revision f14762e6`.
  Today's bytes carry `<meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision">` and
  `class="dt-updated" datetime="2026-10-20"`. They also contain the string `CG-DRAFT`, found by `rg -o` on `S020.html`.
  The same 51ed7565 revision is recorded in SOURCES search-log line 145 (round 16) and in
  `round-18/source-recheck/S020.json` `anchorObserved`. The page has not changed since the 2026-10-20 fetch. The quote
  verdict is unaffected. Whether the anchor cell needs a superseding row is the scribe's call, not this report's.
- Playwright headers: all five report `last-modified: Wed, 21 Oct 2026 17:41:39 GMT`, yet the body sha
  is the same as on 2026-10-19. [INFERENCE: the site redeployed without changing these pages.] So
  `last-modified` is not evidence that the content changed. The `date` header for all six fetches is
  `Sun, 25 Oct 2026 12:15:24 GMT`. Cache status was `x-cache: MISS` for five fetches and `HIT` for S024.
  The `age: 0` header was present on all six.
- S020's text offset (577) differs from round-18's `quoteOffset` 586 on the same bytes because my
  normalizer differs from `recheck-fetch.mjs normalize()`. The bytes are the same, so this is not drift.

## Draft per-row receipt JSON

```json
{
  "schema": "tabi-source-reopen-v1",
  "round": 25,
  "seat": "L1Tabi25.ScoutFreshnessReopen",
  "quoteSource": "corpus/lessons/kaika-fleet-round-1.md §Gate (lines 56,58,59,63,66,67)",
  "fetchCommand": "curl -sS -L -o <ID>.html -D <ID>.headers -w '%{http_code} %{size_download} %{url_effective}' --max-time 60 <URL>",
  "locator": ".ufo/waves/round-25/scratch/ScoutFreshnessReopen/locate.py (raw exact | tag-tolerant raw | stripped+NFC+folded text)",
  "rows": [
    {"id": "S013", "url": "https://playwright.dev/docs/test-retries", "fetched_at": "2026-10-25T12:15:24Z", "http_status": 200, "bytes": 99073,
     "sha256": "cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa",
     "quote": "\"flaky\" - tests that failed on the first run, but passed when retried",
     "quote_located": {"raw_byte_offset": 42946, "raw_line": 68, "text_offset": 3375, "count": 1, "match": "raw-exact"},
     "verdict": "holds"},
    {"id": "S015", "url": "https://playwright.dev/docs/actionability", "fetched_at": "2026-10-25T12:15:24Z", "http_status": 200, "bytes": 47845,
     "sha256": "31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d",
     "quote": "It auto-waits for all the relevant checks to pass and only then performs the requested action.",
     "quote_located": {"raw_byte_offset": 26887, "raw_line": 5, "text_offset": 1142, "count": 1, "match": "raw-exact"},
     "verdict": "holds"},
    {"id": "S016", "url": "https://playwright.dev/docs/test-assertions", "fetched_at": "2026-10-25T12:15:24Z", "http_status": 200, "bytes": 159543,
     "sha256": "1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c",
     "quote": "Playwright also includes web-specific async matchers that will wait until the expected condition is met.",
     "quote_located": {"raw_byte_offset": 28210, "raw_line": 7, "text_offset": 1304, "count": 1, "match": "raw-tag-tolerant (<a> around 'async matchers')"},
     "verdict": "holds"},
    {"id": "S020", "url": "https://webmachinelearning.github.io/webmcp/", "fetched_at": "2026-10-25T12:15:24Z", "http_status": 200, "bytes": 511987,
     "sha256": "5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40",
     "quote": "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents.",
     "quote_located": {"raw_byte_offset": 28801, "raw_line": 872, "text_offset": 577, "count": 1, "match": "raw-exact"},
     "anchor_observed": "meta revision 51ed75653aaa7f174f8dbe05d1bc327359bbc57c; dt-updated 2026-10-20; CG-DRAFT",
     "verdict": "holds"},
    {"id": "S023", "url": "https://playwright.dev/docs/locators", "fetched_at": "2026-10-25T12:15:24Z", "http_status": 200, "bytes": 268087,
     "sha256": "234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6",
     "quote": "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines",
     "quote_located": {"raw_byte_offset": 56837, "raw_line": 36, "text_offset": 4231, "count": 1, "match": "raw-tag-tolerant (<strong> around 'do not replace')"},
     "verdict": "holds"},
    {"id": "S024", "url": "https://playwright.dev/docs/aria-snapshots", "fetched_at": "2026-10-25T12:15:24Z", "http_status": 200, "bytes": 125426,
     "sha256": "bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194",
     "quote": "aria snapshots provide a YAML representation of the accessibility tree of a page.",
     "quote_located": {"raw_byte_offset": 36001, "raw_line": 56, "text_offset": 4527, "count": 1, "match": "raw-exact"},
     "verdict": "holds"}
  ],
  "summary": {"reopened": 6, "resolved": 6, "unresolved": 0, "supersessions": 0}
}
```

The bytes and headers are saved as scratch files, not committed:
`.ufo/waves/round-25/scratch/ScoutFreshnessReopen/{S013,S015,S016,S020,S023,S024}.{html,headers}`,
plus `locate.py` and `locate-out.json`. To commit them, copy the bytes to
`corpus/evidence/round-25/freshness/`. This is the integrator's call; gzip as round 18 did.

## Unknowns

- How the frozen counter defines a fresh-this-round digest. It is not in the tree, so I could not read it. See the
  sha-equality warning above.
- Whether the "teaches" paraphrase cells (for example S015 "gate the action, not the post-action state predicate")
  still follow from the pages. The quotes and surrounding text support them, but judging that is outside this scout's
  scope; I checked only the quotes.
