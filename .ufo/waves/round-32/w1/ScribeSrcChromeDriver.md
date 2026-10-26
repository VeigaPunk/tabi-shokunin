# Round 32 w1 — seat ScribeSrcChromeDriver: registry row S125 (Chrome's own BiDi documentation)

**Verdict.** The page the assignment asks for does not exist on this host's public web as of 2026-10-26:
no `developer.chrome.com` (or `chromedriver.chromium.org`) page documents *enabling* WebDriver BiDi through
the `webSocketUrl` capability. All 21 pages of the ChromeDriver docs navigation were fetched (HTTP 200 each);
the token `webSocketUrl` occurs on exactly one of them — `/docs/chromedriver/downloads` — twice, and both
occurrences are the 2023 issue title `Resolved issue 4295: ChromeDriver with "webSocketUrl": true is racy`,
not an enabling instruction. `/docs/chromedriver/capabilities` contains no `websocket` string at all, 15
guessed BiDi/WebSocket URLs answer 404, `chromedriver.chromium.org/{capabilities,bidi}` answer 301 into the
same devsite pages, and site-wide enumeration failed (the three child sitemaps each returned 500 / 0 B), so
the negative is bounded to the nav-linked set plus the probes. Because the docs cannot ground the row, I
drafted **S125 as Chrome's own source at the measured tag** —
`chrome/test/chromedriver/session_commands.cc` at tag `154.0.8037.97`, with `capabilities.cc` paired for the
capability parse — with a verbatim ≤25-word Gate quote (12 tokens) and blob digests that are byte-identical
across two independent fetches. A `docs`-kind alternative (the release-notes page) is drafted but explicitly
**not** added: it documents neither `webSocketUrl` nor the measured 154 build (its newest block is
ChromeDriver 148, `Last updated 2026-05-15 UTC`).

## Assignment and what I was asked to produce

Frontier step for C1: (a) find and fetch the current Chrome-owned page documenting `webSocketUrl`-enabled
BiDi in ChromeDriver, save bytes + sha256; (b) draft ONE registry row (S125, 11 cells, `used-by`
`corpus/knowledge/webdriver-bidi-runtime-round-32.md`); (c) draft a Gate line with a ≤25-word located quote
grounding `teaches`; (d) if no Chrome-owned page documents it, say so with the search log rather than
fabricate. I did (a)→(d); the honest outcome of (a) is negative, so the row cites Chrome's own source and the
docs material is preserved as a labelled alternative.

## Commands run (with exit codes)

Network: read-only HTTPS GETs, `curl -q -sS --proto =https`, allowlisted hosts only
(`developer.chrome.com`, `chromedriver.chromium.org`, `chromium.googlesource.com`). No credentials, no
cookies, no POST, no external navigation. Fetch metadata (UTC, status, bytes, sha256) for every request is in
`search-log.tsv` (41 requests) and `gitiles-log.tsv` (4 requests) in the output dir.

1. Nav enumeration — `grep -o 'href="/docs/chromedriver[^"]*"' <landing page> | sort -u | wc -l` → **21**
   (exit 0); all 21 appear in the fetch loop's URL list.
2. 41-URL fetch loop writing `bodies/` + `search-log.tsv` → **exit 0**; status census **{200: 24, 404: 15,
   301: 2}**.
3. gitiles fetch loop (docs listing, `docs/bidi_in_chromedriver.md`, `capabilities.cc`, `session_commands.cc`)
   → **exit 0**; statuses 200 / **404** / 200 / 200.
4. `base64 -d` of both `?format=TEXT` payloads, then `sha256sum` → **exit 0**:
   `597c1a33…7ba7  capabilities.cc`, `7b40e94c…abb5  session_commands.cc`.
5. `cmp` of the two independently fetched decodes → **exit 0** for both files ("identical across two fetches").
6. Tag ref `…/+/refs/tags/154.0.8037.97?format=JSON` → **200**, 2334 B: `commit
   b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, `tree e096b0852a79b0810dba5cfaa714c95d74908532`, committer
   `Wed Sep 30 21:20:00 2026`.
7. Census over every retained body (case-insensitive `websocketurl` / `bidi` / `websocket`) → `census.txt`.
8. `pgrep -fa 'chromedriver|chromium'` on exit → one line, and it is `earlyoom`'s own argv
   (`/usr/bin/earlyoom -r 3600 --avoid (^|/)(…|chromium|…)$`). **No chromedriver or chromium process of mine
   exists**; I ran no browser and spawned no driver this session.

## Findings

1. **No Chrome-owned prose page documents `webSocketUrl` (bounded negative).** 21/21 nav pages 200;
   `/docs/chromedriver`, last updated 2025-03-04, states only that ChromeDriver "implements the W3C WebDriver
   and WebDriver BiDi standards"; `/docs/automation-and-testing` says ChromeDriver "implements the W3C
   WebDriver standard and the bidirectional WebDriver BiDi protocol" and both reduce to statements of
   support, not of enabling. `/docs/chromedriver/documentation` is a list of historical design-doc titles
   only, and the tag's own `chrome/test/chromedriver/docs/` listing contains five files
   (`chrome_connection.md`, `event_listener.md`, `run_javascript.md`, `testing.md`, `threading.md`) and **no**
   BiDi doc — `docs/bidi_in_chromedriver.md` is 404 at the tag.
2. **The capability page is silent.** `/docs/chromedriver/capabilities` ("Capabilities and ChromeOptions",
   last updated 2025-05-12) has zero occurrences of `websocket`; it documents `goog:chromeOptions` entries
   (`detach`, `debuggerAddress`, `prefs`, …) and never mentions a session-level BiDi capability.
3. **The only `webSocketUrl` string on Chrome's site is a bug title.** On `/docs/chromedriver/downloads`
   (last updated 2026-05-15), twice: `Resolved issue 4295: ChromeDriver with "webSocketUrl": true is racy`,
   listed under `ChromeDriver 110.0.5481.77` and `ChromeDriver 110.0.5481.30`. It presumes the capability;
   it documents no way to use it.
4. **The docs lag the measured build by six minors.** The release-notes page's newest block is
   `ChromeDriver 148`; it contains zero mentions of ChromeDriver 149-155, while this round measures
   154.0.8037.97. A `docs` row could therefore not be scoped to the build under test.
5. **Enumeration limit, stated rather than papered over.** `https://developer.chrome.com/sitemap.xml` →
   200, 536 B, a `sitemapindex` with three children; each child (`sitemap_{0,1,2}_of_3.xml`) → **500 with a
   0-byte body** after a ~100 s run. Site-wide URL enumeration was not obtained; the negative in finding 1
   is bounded to the nav-linked 21, the two BiDi blog posts, `/docs/automation-and-testing`, and the 15
   probes.
6. **Chrome's source states the enabling contract exactly, at the measured tag.**
   `session_commands.cc`: `if (session->web_socket_url) {` (287) returning
   `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` (288-289); a `BidiTracker`
   and its callback registered under the same flag (332-338); the mapper block opened by the same flag (378)
   creating `// Create a hidden target for running  BiDi-CDP mapper in it.` (407, note the double space),
   resolving a mapper path (429-434), `StartBidiServer` (446), and a mapper `session.new` carrying
   `goog:channel` `/init-bidi-session` (453-457); the flag is copied from the parsed capability at 510
   (`session->web_socket_url = capabilities->web_socket_url;`). Paired `capabilities.cc` registers it as a
   W3C-defined boolean: `// W3C defined capabilities.` (1362) and
   `parser_map["webSocketUrl"] = base::BindRepeating(&ParseBoolean, &web_socket_url);` (1375-1376).
7. **Two fetches, one digest, so the quote is reproducible.** The decoded blobs are byte-identical across
   two independent fetches (`cmp` exit 0), which is what lets the Gate carry a raw-response sha256 *and* a
   decoded-blob sha256 without ambiguity.

## Deliverables (all in this seat's output dir)

| file | content |
|---|---|
| `S125-row-draft.md` | the 11-cell registry row verbatim, field-by-field provenance, the structural checks `check-sources.mjs` will apply, and the labelled `docs`-kind alternative (**not** to be added alongside) |
| `gate-line.md` | recommended Gate line (12-token verbatim quote, location, raw + decoded sha256), a secondary locatable quote, and the verbatim `sed` proof |
| `census.txt` | per-page `webSocketUrl` / `BiDi` / `WebSocket` counts for every fetched body, the version span, and the enumeration limits |
| `search-log.tsv` | 41 rows: UTC, status, bytes, sha256, URL |
| `gitiles-log.tsv` | 4 rows, same schema |
| `capabilities.cc.154.0.8037.97`, `session_commands.cc.154.0.8037.97` | decoded blobs (1475 and 1877 lines respectively; digests in `sha256.txt`) |
| `raw/` | raw `?format=TEXT` payloads, the downloads and capabilities HTML, the docs-directory listing, the tag ref JSON |
| `sha256.txt` | digests of every file above |

Registry row (exact draft line, from `S125-row-draft.md`):

| S125 | ChromeDriver 154's BiDi enabling path — session_commands.cc — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc | code | A | How ChromeDriver 154 turns the classic `webSocketUrl` boolean into a BiDi session: the returned endpoint, the mapper target and the mapper's `session.new`; not a support promise and not documentation prose | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, tree e096b0852a79b0810dba5cfaa714c95d74908532); session_commands.cc:287-289, 332-338, 378, 407-410, 429-464, 510; paired capabilities.cc:1362 and 1375-1376 for the boolean parse; decoded blob sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` and `597c1a33092582cad0433ce0bd6cc9565b94804bbc2cf51d3fda1e0301427ba7`, byte-identical across two independent fetches | ChromeDriver 154 answers a classic request carrying `webSocketUrl: true` with a session-scoped `ws://<host>/session/<id>` capability, and only under that flag does it start the BiDi-CDP mapper in a hidden target and send it `session.new`; being source at one tag it fixes 154 and shows no default-on BiDi | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-runtime-round-32.md |

Gate line (recommended, from `gate-line.md`):

```
| S125 | ScribeSrcChromeDriver | `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` — session_commands.cc:288-289, inside `if (session->web_socket_url)` at 287 | `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` (decoded blob; raw `?format=TEXT` response `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e`) |
```

## Gates

- **Not run by me, and not claimed to pass:** `node scripts/check-bidi-runtime.mjs` (C1 counter),
  `node scripts/check-selfassessment.mjs` (C2 counter), `node scripts/check-sources.mjs`. Reasons: leaf
  seat; lane scripts run only in a scratch clone under `$HYAKU_SCRATCH`, and the registry/entry they score
  are the L1's to land (the row's `used-by` target did not exist at `4181fffb`, so `used_by_missing` /
  `used_by_uncited` can only clear once the L1 commits row + entry together).
- **Read-only structural pre-check I derived from `scripts/check-sources.mjs`** (read, not executed): the
  draft yields 13 split fields (11 cells), `kind = code`, `tier = A`, `status = mined`, `opened =
  2026-10-26`, `recheck = on-release`, a non-empty anchor, no `tier_inflation` (that fires only for
  `community`), and no `duplicate_url` — `grep -c` of the session_commands URL in `corpus/SOURCES.md` is **0**
  and no other row cites any `chrome/test/chromedriver/*.cc` URL.
- **Freshness caveat the L1 should weigh:** the row is tag-bound (`on-release`); it goes stale at the next
  ChromeDriver tag, and it cannot be widened to cover per-command support — that is the C1 entry's
  measurement, not this source's assertion.

## Touched surfaces

- Wrote: this report (`.ufo/waves/round-32/w1/ScribeSrcChromeDriver.md`) and the output dir
  `.ufo/waves/round-32/w1/ScribeSrcChromeDriver/` (792 KB, files listed above).
- Untouched: lane tracked files, `corpus/SOURCES.md`, `corpus/knowledge/*`, the lane git index, lane jj
  state, the fleet repo, sibling lanes, `/home/vgpnk/Projects/shokuknow`. No commits anywhere; no git
  commands that write. No browser, no chromedriver, no lane-script execution. Nothing installed.
- Scratch: `$HYAKU_SCRATCH/tabi-r32/ScribeSrcChromeDriver` — deleted before yielding (receipts copied
  into the output dir first).
- Peer message: replied to `ScribeEntry` with the four requested facts, plus one follow-up correcting the
  nav page count from 22 to 21.

## Out of scope / not claimed

- No claim about BiDi command support, per-row admission, or any C1 counter number — those belong to the
  entry and the executors.
- No statement that Chrome's docs are wrong; the finding is that they are silent on `webSocketUrl` and lag
  the build.
- The `docs`-kind alternative (release notes, quote
  `Updated ChromeDriver to run the BiDi Mapper in a hidden target by default`, 13 tokens, block
  `ChromeDriver 137`, raw-body sha256 `d36e51f6…47a5`) is offered only as a swap; adding it *alongside* S125
  would be a second row for one gap and would also collide with the entry's `source:` intent.
- The sitemap route is reported as failed, not as evidence of absence.

## Known limits

- Site-wide enumeration unavailable (child sitemaps 500 / 0 B), so a Chrome-owned page outside the
  nav-linked set and outside my 15 probes could exist and would not appear in this search.
- `site:developer.chrome.com "webSocketUrl"` returned no site-restricted matches (the engine relaxed the
  constraint); the unrestricted results surfaced MDN's capability reference, not a Chrome-owned page. That
  is a search-engine data point, not proof.
- `developer.chrome.com` bodies vary slightly per response (CSP nonce), so page sha256s in `search-log.tsv`
  identify *these* fetches, not a stable page digest; the gitiles blobs are the stable artefacts and were
  verified twice.
