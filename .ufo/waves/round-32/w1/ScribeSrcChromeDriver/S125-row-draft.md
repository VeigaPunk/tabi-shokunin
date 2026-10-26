# S125 registry row — draft (seat ScribeSrcChromeDriver, round 32 w1)

## What the assignment asked for, and what the host actually serves

Assigned: fetch the current `developer.chrome.com` (or `chromedriver.chromium.org`) page that documents
enabling WebDriver BiDi through the `webSocketUrl` capability in ChromeDriver.

Result: **no such Chrome-owned page exists as of 2026-10-26.** Evidence and limits are in
`census.txt` and `search-log.tsv` next to this file:

- all 21 pages of the ChromeDriver docs navigation were fetched (HTTP 200 each); `webSocketUrl` appears
  on exactly one of them, `/docs/chromedriver/downloads`, twice, and both occurrences are the title of a
  2023 issue — `Resolved issue 4295: ChromeDriver with "webSocketUrl": true is racy` — under
  `ChromeDriver 110.0.5481.77` and `110.0.5481.30`. That is a bug title, not an enabling instruction.
- `/docs/chromedriver/capabilities` ("Capabilities and ChromeOptions") contains zero occurrences of
  `websocket` and does not list `webSocketUrl`; it documents `goog:chromeOptions` entries only.
- `/docs/chromedriver` (last updated 2025-03-04) and `/docs/automation-and-testing` state that
  ChromeDriver implements W3C WebDriver **and** WebDriver BiDi, but neither says how a session enables it.
- 15 guessed BiDi/WebSocket URLs under `/docs/chromedriver/**`, `/docs/webdriver/bidi` and
  `/blog/chromedriver-bidi` all answer 404; `chromedriver.chromium.org/capabilities` and
  `chromedriver.chromium.org/bidi` answer 301 into the same devsite pages.
- `/docs/chromedriver/downloads` is marked `Last updated 2026-05-15 UTC`, its newest release-note block
  is **ChromeDriver 148**, and it mentions no version 149-155 — six minors behind the host build this
  round measures (154.0.8037.97). A docs row therefore could not be scoped to the measured build.
- site-wide enumeration was not obtained: `sitemap.xml` returned a 200 sitemapindex whose three children
  each returned **500 with a 0-byte body**. The negative above is bounded to the nav-linked set plus the
  probes, not to the whole site.

Because the docs cannot ground the row, S125 cites Chrome's **own source at the measured tag**, which does
state the enabling contract exactly. This is the registry's existing idiom for build-scoped Chromium facts
(S004/S028, S033/S041/S042, S062/S064 are all `kind = code` rows at a pinned tag).

## Draft row (11 cells; append as the registry's last data row)

| S125 | ChromeDriver 154's BiDi enabling path — session_commands.cc — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc | code | A | How ChromeDriver 154 turns the classic `webSocketUrl` boolean into a BiDi session: the returned endpoint, the mapper target and the mapper's `session.new`; not a support promise and not documentation prose | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, tree e096b0852a79b0810dba5cfaa714c95d74908532); session_commands.cc:287-289, 332-338, 378, 407-410, 429-464, 510; paired capabilities.cc:1362 and 1375-1376 for the boolean parse; decoded blob sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` and `597c1a33092582cad0433ce0bd6cc9565b94804bbc2cf51d3fda1e0301427ba7`, byte-identical across two independent fetches | ChromeDriver 154 answers a classic request carrying `webSocketUrl: true` with a session-scoped `ws://<host>/session/<id>` capability, and only under that flag does it start the BiDi-CDP mapper in a hidden target and send it `session.new`; being source at one tag it fixes 154 and shows no default-on BiDi | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-runtime-round-32.md |

## Field-by-field provenance

| cell | value source |
|---|---|
| id | next free id after S122 (`grep -c '^| S' corpus/SOURCES.md` = 122) |
| source | gitiles URL fetched 2026-10-26T16:06:48Z, HTTP 200, 90944 B, raw-response sha256 `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e`; decoded blob 1877 lines, sha256 `7b40e94c…abb5` |
| kind | `code` — the fetched artefact is C++ source, not prose |
| tier | A — Chrome's own shipped implementation at the exact build the round measures |
| scope | bounded to the enabling path; deliberately excludes per-command support (that is the entry's measurement, not this source) |
| anchor | line numbers verified with `sed -n` on the decoded blob: 287 `if (session->web_socket_url)`, 288-289 `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);`, 332-338 `BidiTracker`, 378 the same conditional before the mapper block, 407 `// Create a hidden target for running  BiDi-CDP mapper in it.`, 429-464 mapper path/`StartBidiServer`/`session.new`, 510 `session->web_socket_url = capabilities->web_socket_url;`; paired file capabilities.cc:1362 `// W3C defined capabilities.` and 1375-1376 `parser_map["webSocketUrl"] = base::BindRepeating(&ParseBoolean, &web_socket_url);` |
| teaches | grounded by the Gate quote at session_commands.cc:407 and by the anchor lines; the "no default-on BiDi" part follows from the flag being an optional parsed boolean with no default in this file |
| status | `mined` — opened and read this round |
| opened | 2026-10-26 (UTC fetch time above) |
| recheck | `on-release` — the row is tag-bound and goes stale at the next ChromeDriver tag |
| used-by | the C1 entry: `check-sources.mjs` `inspectUsedBy` requires the path to exist **and** cite `S125`; the L1 lands row + entry together |

## Structural checks the L1's `node scripts/check-sources.mjs` will apply

- 11 cells → split on `|` gives 13 fields (empty head and tail), the shape the checker requires.
- `duplicate_url` (E04): `…/chrome/test/chromedriver/session_commands.cc` does not occur in SOURCES.md today
  (`grep -c` = 0), and no other row cites any `chrome/test/chromedriver/*.cc` URL.
- `bad_kind`/`bad_tier`/`bad_status`/`bad_opened`/`bad_recheck`: `code`, `A`, `mined`, `2026-10-26`,
  `on-release` — all inside the checker's vocabularies.
- `bare_anchor`: anchor cell is non-empty and not `—`.
- `tier_inflation` (E10): only fires for `community` at tier A; not applicable.
- `mined_without_used_by` / `used_by_missing` / `used_by_uncited`: satisfied only once the entry is committed
  with `S125` cited in it.
- No cell contains a `|` character, so the table stays 11 columns.

## Alternative row (NOT added; offered only if the L1 requires a `docs`-kind row)

It documents Chrome's BiDi mapper behaviour but **not** `webSocketUrl`, and it stops at 148, so it cannot be
scoped to the measured 154 build. Do not add it alongside S125 — pick one.

| S125-alt | Downloads | ChromeDriver — https://developer.chrome.com/docs/chromedriver/downloads | docs | A | Chrome's own release-note account of ChromeDriver BiDi behaviour; no `webSocketUrl` enabling step is documented on it | last updated 2026-05-15 UTC; §ChromeDriver 137, New features, BiDi line; raw-body sha256 `d36e51f6224e14cfcedb5e498dc98a6374f128d2d66ac23583ba0f238cba47a5` | ChromeDriver's release notes state the BiDi Mapper runs in a hidden target by default so its `data:,` page cannot interfere; the newest block is 148, so nothing here covers the measured 154 build | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-runtime-round-32.md |

Quote for that alternative (13 words, verbatim): `Updated ChromeDriver to run the BiDi Mapper in a hidden target by default`
— location: `/docs/chromedriver/downloads`, block `ChromeDriver 137`, `New features`, the `BiDi :` sentence
(the sentence continues "This prevents the mapper's `data:,` page from interfering with test execution and visibility.").
