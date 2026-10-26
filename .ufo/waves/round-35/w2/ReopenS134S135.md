# ReopenS134S135 — re-open of SOURCES rows S134, S135 (rev 083c5c64)

**Verdict.** S134 **holds**. S135 **holds on its fetch identity, tier, scope, cadence, teaches and uniqueness, but carries one false cell and two Gate-row defects (all low severity, none changes what the row teaches):** (1) `anchor` says the byte sweep found `moz:firefoxOptions` 1 time; my sweep of the same bytes finds `moz:firefoxOptions` **0** — the one hit is the bare substring `firefoxOptions` inside the MDN URL path (line 293), so the row misstates its own sweep (the w1 seat's sweep, `w1/ScribeSrcGeckodriver/gate.md:61`, was for `firefoxOptions`, and the row copied the count under the wrong string); (2) the Gate row's location says "(absence sweep below)" but `corpus/lessons/round-35.md` contains no such sweep (`grep -c 'absence sweep'` = 1, the pointer itself) — the sweep exists only in the seat file `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/gate.md:50-75`; (3) the Gate quote "Most of these are documented on MDN." is not a byte-verbatim string of the fetched file (an `<a>` tag splits it at line 293: `Most of these <a …>are documented on MDN</a>.`; `grep -n 'Most of these are documented on MDN'` = no match, exit 1) — it is verbatim only in rendered text, and it grounds the "defers to MDN" half of `teaches`, not the absence half (that rests on the sweep). Since SOURCES is append-only (only status/recheck/used-by change in place), fixing (1) needs a `supersedes S135 —` row or an L1 decision.

## Re-fetch (curl -q -sS --proto =https, exit 0)
| row | URL | UTC | HTTP | bytes | sha256 | match row/Gate? |
|---|---|---|---|---|---|---|
| S134 | https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | 2026-10-26T21:40:22Z | 200 | 41404 | 2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc | yes (bytes + sha identical) |
| S135 | https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26T21:40:22Z | 200 | 31324 | e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842 | yes |

## Quote location
- S134: `grep -n 'Defaults to 9222' Flags.html` → `496:<p>Port to use to connect to WebDriver BiDi. Defaults to 9222.</p>` — verbatim, at the Gate's `Flags.html:496`. Other anchor lines verified: `474:…Port to use for the WebDriver server.  Defaults to 4444.`; sections `472`/`478`/`494` open, `481-482` "Both geckodriver and / Firefox must have read-write access to this path."; `341-342` the only version strings (0.31.0, 0.30.0; `grep -in 'version|release'` shows nothing else page-level). `--websocket-port 0`/`--port 0` "bind to 0 … atomically assign a free port" at 475-476 and 497-498 (teaches cell holds).
- S135: `293:Most of these <a class="reference external" href="…/Capabilities/firefoxOptions">are documented on MDN</a>.</p>` (rendered-text quote only, see defect 3). Anchor lines: `291` h1 firefox-capabilities, `297` moz:debuggerAddress h2, `338` moz:webdriverClick h2 — all correct; only two `<h2>` in the body (scope "documents in place only debuggerAddress and webdriverClick" holds). Byte sweep: `webSocketUrl` 0, `moz:geckodriverVersion` 0 (hold); `moz:firefoxOptions` **0** (row says 1: defect); `firefoxOptions` 1 (line 293).

## The 11 cells
| cell | S134 | S135 |
|---|---|---|
| id | S134, next after S133, unique | S135 |
| source | title + URL, https, specific page | same |
| kind | docs (Mozilla's own docs) — fits | docs — fits |
| tier | A, scoped to "as the geckodriver docs page states them" — fits (first-party docs) | A — fits |
| scope | bounded (page bytes, no version stamp admitted, not a claim about code) | bounded; "absence … from its bytes" is true for the two strings |
| anchor | holds: all line numbers/hash/bytes verified | **defect: `moz:firefoxOptions` 1 should be 0 (`firefoxOptions` 1)** |
| teaches | grounded in 474/475-476/480-482/496 | grounded; fine |
| status | mined — cited by the entry (used-by path exists; `grep` finds geckodriver URLs in the entry) | mined |
| opened | 2026-10-26 (fetch stamp 21:12:29Z; my refetch same bytes) | same |
| recheck | 90d — fits a living Sphinx page with no version stamp (same cadence as S138; on-release would also fit, not a defect) | 90d — same |
| used-by | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md (exists) | same |

## Uniqueness
`grep -n 'testing/geckodriver' SOURCES.md` → only lines 148, 149. Duplicate-URL sweep over every URL in SOURCES.md (`sort | uniq -d`) lists 20 pre-existing duplicated URLs (S0xx-era / WebMCP / Chromium rows), none being the S134/S135 URL. Other geckodriver rows are different URLs (S136/S137 raw.githubusercontent, S141 releases page).

## Commands (exit codes)
- curl x2 → 200/200, exit 0. grep/sed sweeps: expected exit 1 on the three absent strings and on the non-verbatim quote.
- `node scripts/check-sources.mjs` in `--shared` clone at 083c5c64 → `SOURCES_GATE verdict=clean rows=141 … findings=0`, exit 0 (structure only).
- Scratch (`/fast/scratch/hyaku/tabi-r35/ReopenS134S135`) removed; no browser launched; no lane file edited.

## Deliverables
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/ReopenS134S135.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/ReopenS134S135/fetch-receipt.tsv
