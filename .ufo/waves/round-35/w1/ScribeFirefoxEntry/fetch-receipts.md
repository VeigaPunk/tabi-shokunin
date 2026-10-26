# Fetch receipts — C2 entry sources (round 35, wave 1, seat ScribeFirefoxEntry)

Every fetch below was a read-only `curl -q -sS --proto =https` GET issued from
`/fast/scratch/hyaku/tabi-r35/ScribeFirefoxEntry/fetch` on 2026-10-26 (UTC timestamps are the
client clock at request time). Status and byte count are curl's `%{http_code}` / `%{size_download}`
as written to the file; sha256 is `sha256sum` of the retained bytes. Quotes are verbatim from the
retained bytes and locate to the line number in the retained file, not to the rendered page.

## 1. Fetches cited by the entry

`S13x` in the entry is the placeholder for the registry id the round's source scribes land. The
"slot" column gives the row this page needs: an id already dispatched to a wave-1 seat, a row that
no seat was dispatched for, or a page that must be dropped from the `source:` line (see §1a).

| # | slot | URL | UTC | HTTP | bytes | sha256 | located quote (≤ 25 words) |
|---|---|---|---|---|---|---|---|
| 1 | S134 (landed by ExecFirefoxDriver) | https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | 2026-10-26T21:12:09Z | 200 | 41404 | `2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc` | `:496` "Port to use to connect to WebDriver BiDi. Defaults to 9222." |
| 2 | S134 | same file | — | — | — | — | `:474` "Port to use for the WebDriver server.  Defaults to 4444."; `:498` "A helpful trick is that it is possible to bind to 0 to get the system to atomically assign a free port." |
| 3 | S134 | same file | — | — | — | — | `:480` "Path to the directory to use when creating temporary profiles. By default this is the system temporary directory. Both geckodriver and Firefox must have read-write access to this path." |
| 4 | S134 | same file | — | — | — | — | `:418` "Host to use for the WebDriver server.  Defaults to 127.0.0.1."; `:385` "Path to the Firefox binary to use." |
| 5 | S134 | same file | — | — | — | — | `:316-317` "… header is rejected to protect against malicious websites trying to access geckodriver running on the local machine." (flag `--allow-origins`) |
| 6 | S135 (dispatched) | https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26T21:12:09Z | 200 | 31324 | `e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842` | `:300` "implements a subset of the Chrome DevTools Protocol (CDP)" — the `moz:debuggerAddress` remote protocol, not the BiDi path |
| 7 | new row needed (no seat dispatched for this page) | https://firefox-source-docs.mozilla.org/testing/geckodriver/Support.html | 2026-10-26T21:12:09Z | 200 | 30061 | `48dfddeaeda5a4d985373b135791159e81edd33734a13c0addef44c8dfdcb121` | `:310-314` support-table row "0.37.1 / ≥ 3.11 (3.14 Python) / 115 ESR / n/a" |
| 8 | S136 (dispatched) | https://firefox-source-docs.mozilla.org/remote/index.html | 2026-10-26T21:12:23Z | 200 | 28453 | `4b009a43299cb215645e6b802e9d35d59c1b24c5e10c97ad557175a52c54311c` | `:322-323` "Marionette is used both by internal tools and testing solutions, but also by geckodriver to implement the WebDriver (HTTP) specification."; `:328-329` "The WebDriver BiDi specification extends WebDriver HTTP to add bidirectional communication." |
| 9 | S137 (dispatched; their slot named a module/compat page, so confirm or open a new row) | https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection | 2026-10-26T21:12:10Z | 200 | 158205 | `fcda3e13b8cca71c4ce288f00b96a2235e2641edb0e5d6000fb1da13900eaf39` | `:1520` "Firefox exposes the BiDi WebSocket directly at: ws://127.0.0.1:PORT/session"; `:1475` "This method works with Firefox directly; however, Chromium-based browsers require the additional Chromium BiDi wrapper package." |
| 10 | new row needed (no seat dispatched for this page) | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/Capabilities/firefoxOptions | 2026-10-26T21:12:41Z | 200 | 169055 | `c36e3c5a1529750736ae40eb6cde358208b6aca94add685c9ce41f3481be5d47` | `:1596` "Command-line arguments to pass to the Firefox binary. These must include the leading dash ( - ) where required, e.g., ["-headless"]." |
| 11 | S135 if ScribeSrcGeckodriver took the source fallback for `moz:geckodriverVersion`, else a new row | https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs | 2026-10-26T21:12:41Z | 200 | 66012 | `757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3` (computed at seat close from the retained bytes, not at fetch time — see note A) | `:767` `capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());` |
| 12 | S124 (round-32 row; cannot satisfy the counter's s1 because it exists at baseline) | https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | 2026-10-26T21:13:31Z | 200 | 4235856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` | no new quote: the digest equals the round-32 registry row's, so the §7.x anchors cited by the round-32 entry are unchanged; the bytes carry revision `f922e6af669ead51496db85f37813f39438ef171` |

Note A — receipt integrity. Row 11's file was fetched as `gd-marionette.rs` (200, 66012 B); curl's
status/byte count were logged, but the sha256 was not taken at fetch time. The digest in the row was
computed at seat close from the retained bytes; it is a post-fetch digest and is labelled as such so
no reader mistakes it for a fetch-time record. If the registry needs a hashed geckodriver-source row,
ScribeSrcGeckodriver's own fetch (dispatched to register `moz:geckodriverVersion`'s emitter at the
same tag) is the row to use.

Retained bytes (kept in the seat's scratch during the seat, deleted at seat exit per the wave's
scratch rule; the digests above are the durable record): `geckodriver-flags.html`,
`geckodriver-caps.html`, `geckodriver-support.html`, `remote-index.html`,
`geckodriver-usage.html`, `mdn-bidi-connection.html`, `mdn-firefoxoptions.html`,
`geckodriver-capabilities-rs.html`, `gd-browser.rs`, `gd-main.rs`, `gd-marionette.rs`,
`w3c-bidi-wd.html` (4.2 MB), `fetch-log.tsv`. None of this is copied into the lane: the entry
cites URLs, statuses, byte counts and digests, and the L1's registry rows carry the same. A reader
who needs the bytes re-fetches and compares digests.

### 1a. What the L1 must land for the draft's `source:` line to be admissible

The counter reads `source:` for `\bS\d{3,}\b` tokens (`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`,
`evaluate()`), so the `S13x` placeholders match nothing and produce `entryFinding: s1-source-row`
with detail `no S-id on the source: line` (verified against this draft: the extraction returns `[]`).
Substitution must be per URL, not one id for the whole line. At wave-1 close the only already-landed
row is **S134 = the Flags page** (ExecFirefoxDriver's `sources-row-S134.txt`, `status mined`,
`used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`, with a `## Gate` row in its
`lesson-round-35-gate-only.md` carrying the same URL host and the 64-hex digest
`2b023afe…`). That single row is enough to satisfy s1 for this entry — it is absent at baseline,
`mined`, and names the entry path — but the other six URLs on the line need their own rows or must
be dropped from the line. Dropping them is the cheaper edit: the prose already carries each URL,
and an entry may cite one registry row per page it wants the counter to check.

## 2. Probes that returned 404 (recorded by status, byte count and first body line, not by digest)

`curl` wrote these to files but the bodies were not retained, so only status and byte count are
recorded here; the first body line is given from the console output where it was read, and is
marked "not read" where it was discarded with the probe.

| URL | UTC | HTTP | bytes | first body line |
|---|---|---|---|---|
| https://firefox-source-docs.mozilla.org/remote/RemoteAgent.html | 2026-10-26T21:12:09Z | 404 | 378 | not retained (probe only; replaced by `remote/index.html`) |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/WebDriverCapabilities.html | 2026-10-26T21:12:23Z | 404 | 401 | not retained (probe only) |
| https://firefox-source-docs.mozilla.org/remote/RemoteAgent/index.html | 2026-10-26T21:12:23Z | 404 | 364 | not retained (probe only) |
| https://firefox-source-docs.mozilla.org/remote/webdriver-bidi/ | 2026-10-26T21:13:31Z | 404 | 367 | not retained (probe only) |
| https://firefox-source-docs.mozilla.org/remote/WebDriverBiDi.html | 2026-10-26T21:13:31Z | 404 | 380 | not retained (probe only) |
| https://firefox-source-docs.mozilla.org/remote/RemoteProtocolPrefs.html | 2026-10-26T21:13:31Z | 404 | 386 | not retained (probe only) |

Consequence for the entry: the remote-protocol **preferences** page (`remote.active-protocols`)
was not located on firefox-source-docs this round, so the entry makes no claim about that pref
and §6 lists it as not varied.

## 3. Host binaries (not fetches — pinned by `--version` and digest)

| path | bytes | sha256 | version output |
|---|---|---|---|
| /home/vgpnk/.local/opt/firefox-158.0.1/firefox | 5520 | `a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789` | `Mozilla Firefox 158.0.1` (exit 0) |
| /home/vgpnk/.local/bin/geckodriver | 6029440 | `f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f` | `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)` (exit 0) |

The Firefox path is the 5,520-byte ELF launcher inside the extracted release tree
(`file`: ELF 64-bit LSB executable, x86-64, dynamically linked); `/home/vgpnk/.local/bin/firefox`
resolves to it. Install provenance (release assets, `SHA256SUMS` signature) is
ScribeSrcMozRelease's rows (S138–S139); this seat only records what it ran.

## 4. Not fetched here, deliberately

`ftp.mozilla.org` release assets, the geckodriver GitHub release page, and any WPT results surface:
the first two are ScribeSrcMozRelease's rows, and no WPT result data was read this round, so the
entry does not cite one as implementation evidence.

## 5. Artifacts this seat verified (not fetches, not its own runs)

The C2 executor's wave-1 output was read at seat close. Everything below was recomputed by this
seat from the files on disk; nothing was re-run and no browser was launched here.

| artifact | what this seat recomputed |
|---|---|
| `.ufo/waves/round-35/w1/ExecFirefoxDriver/run1.jsonl` | sha256 `b916c5df2245b856dc3537544af5b052f345b965fdc7098d9f28faab7ceacbfc` (equals the receipt's `transcriptSha256`); parsed with the frozen gate's `recordFromTranscript`: 28 commands, 20 events, session `bc272ba1-5207-4ac5-abe5-3b55b9ac708f`, `browserVersion 158.0.1`, `moz:geckodriverVersion 0.37.1`, first screenshot 9,451 B sha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`, and all 16 gate predicates `null` (R16 `no-bidi-counterpart`) |
| `.ufo/waves/round-35/w1/ExecFirefoxDriver/run2.jsonl` | sha256 `af84675fc57f1c7c18c1a1e36cbf70a2384a81257e7e5eef37d3d53e3c77d2dc` (equals the receipt's); 28 commands, 20 events, session `08b0adaa-2476-439d-a46c-8db47f3baf6f`, same versions, same first-screenshot digest, all 16 predicates `null` |
| `.ufo/waves/round-35/w1/ExecFirefoxDriver/receipt.json` | `schema tabi-bidi-receipt-v1`, `fixtureSha256 343cbced…`, `browserVersion 158.0.1`, `driver scripts/bidi-firefox-loopback-round35.mjs` with `driverSha256 f95dac5e…`; `receipt.json`'s `run1/run2` digests equal the files' digests above |
| `.ufo/waves/round-35/w1/ExecFirefoxDriver/bidi-firefox-loopback-round35.mjs` | sha256 `f95dac5e696ce56fd4af9071d154fe8510cf0ad277fc825711d75a0da9c9fd25` (equals the receipt); not imported, not executed by this seat |
| `.ufo/waves/round-35/w1/ExecFirefoxDriver/counter-check.json` | the executor's counter reading at rev `245c4c6140aed4712a273b0dfca277b933d287fa`: population 17, admitted 16, failing 0, unmeasured 1, `entryFinding null`, `receiptFinding null`, `binding null`, `gateSha256 370e8e95…`, `counterSha256 7cc7f17f…`; recorded, not re-run |
| `.ufo/waves/round-35/baseline/c2-instrument-check.json` | two Firefox sessions (`59aa1fd4-…`, `df776540-…`), every gate predicate `null` for R1–R15 and R17, R16 `no-bidi-counterpart`, `errs []`, first screenshot the same digest in both |
| `.ufo/waves/round-35/w1/ExecFirefoxDelta/shapes.json`, `delta.tsv` | one run per engine: 28 commands on each; wall times 2,312 ms (Firefox) vs 1,104 ms (Chromium); R11/R12 payloads equal in content (rows marked `differs=no`), first-screenshot bytes 9,451 vs 6,626 |
