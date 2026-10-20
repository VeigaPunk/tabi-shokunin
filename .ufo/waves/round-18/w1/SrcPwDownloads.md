VERDICT: PASS

# SrcPwDownloads — Playwright `acceptDownloads` + download event (C2 H4)

Seat source note: `.ufo/waves/round-18/sources/SrcPwDownloads.md` (full fetch record, companion table, code cross-check).
Lane tip at fetch: `git -C LANE rev-parse --verify refs/heads/master` → `2bff864fdfee684ddbcd066cc8e735adaba2735c` (= B).
No installation or upgrade was performed.

## Findings

1. **Option semantics (docs, tier A scoped).** Playwright's `Browser.newContext` option
   `acceptDownloads` is documented as defaulting to acceptance. Rendered page
   `https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads`,
   fetched 2026-10-20, HTTP 200, `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`, `content-length: 184490`,
   raw sha256 `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e` (184490 bytes; no
   base64 decode applies; html-text decode sha256 `26a04a2afd5fedf0152fc9943ca0d8a32813a91f75d7e187f94db268fd498b4d`).
   Quote, 16 words, at offset 5230 of the normalized body: "Whether to automatically download all the
   attachments. Defaults to true where all the downloads are accepted."
   Pinned independently in docs source at the installed tag: `docs/src/api/params.md:374-377`
   (`## context-option-acceptdownloads`), sha256 `e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9`;
   pulled into `class-browser.md:258` via `%%-shared-context-params-list-v1.8-%%`
   (sha256 `de9be31c3c8ad8bc76a90ddf176e81b1e26ee1a96402db76daf27c69a019d94e`).
   Installed tag is v1.64.0 (`~/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/package.json`
   version 1.64.0), the same pin as `scripts/webmcp-invoke-round17.mjs:78`.

2. **Event observability (docs + code).** Downloads guide
   `https://playwright.dev/docs/downloads`, fetched 2026-10-20, raw sha256
   `b1c3545b88d3e7bdc6c0abf33115bac777eaf10953e258d7cc21febb318ff26f`, normalized quote at offset
   1087: "For every attachment downloaded by the page, page.on('download') event is emitted."
   `Download.failure()` is documented at v1.64.0 `class-download.md:86-90` (sha256
   `fb1803f9f472c47fd7006db085d2f22ae5bf6795c27819750c56e4791de500e2`) as "Returns download error if
   any. Will wait for the download to finish if necessary."
   Code: `coreBundle.js` `toAcceptDownloadsProtocol` maps `false` → `"deny"`; the Chromium context sends
   `Browser.setDownloadBehavior {behavior:"deny", eventsEnabled:true}`; the `Download` object is built
   with the unaccessible error text and `_fireDownloadEvent()` emits on suggested filename.

3. **PLAN §C2 H4 check — no contradiction.** PLAN requires `acceptDownloads:false` and recording; the
   docs default is acceptance, and the round-17 harness passes no such option at
   `scripts/webmcp-invoke-round17.mjs:600`, so H4 is red at B. Precision the fixture must honour:
   refusal alone is silent at the API level, so "recorded" requires a `page.on('download')` /
   `waitForEvent` listener before the click; otherwise the case proves only absence of bytes.
   [INFERENCE] that Chromium 154 emits `downloadWillBegin` under `behavior:"deny", eventsEnabled:true`
   is read from the 1.64.0 client path, unobserved on this host until the `invoke-download-refused`
   probe runs.

4. **H2-adjacent hazard (code-read).** Without `artifactsDir`, Playwright creates
   `mkdtemp(os.tmpdir()/playwright-artifacts-)` and removes it through `removeFolders` at
   browser-close/kill cleanup; a Node-side SIGKILL skips that cleanup, so a TMPDIR-empty assertion
   after an abort path must account for it. This is why the harness should set `artifactsDir` inside
   the run dir.

## Draft registry row (id left `S0??`; PLAN §C2 slot is S059+)

| S0?? | Playwright Browser.newContext acceptDownloads and the download event — https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads | docs | A | acceptDownloads context-option semantics and refusal evidence for a Playwright-launched Chromium 1.64.0 | stable docs fetched 2026-10-20 (HTTP last-modified 2026-10-20T16:46:38Z), §Browser.newContext Arguments › acceptDownloads, anchor #browser-new-context-option-accept-downloads; docs source v1.64.0 params.md:374-377 | A context accepts every download by default, so a refusing harness must pass acceptDownloads:false explicitly and record the refusal instead of assuming it | queued | 2026-10-20 | on-release | — |

## Gate entry

- URL: https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads
- Access date: 2026-10-20
- Quote (16 words) + location: "Whether to automatically download all the attachments. Defaults to
  true where all the downloads are accepted." — §Browser.newContext › Arguments › acceptDownloads
  (`#browser-new-context-option-accept-downloads`); docs source v1.64.0 `params.md:377`.
- Raw-fetch sha256: `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e`
- Producer `.ufo/waves/round-18/recheck-fetch.mjs` sha256: `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`

## Normalize-only output (verbatim)

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body browser-api.html --quote 'Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted.'
{"found":true,"offset":5230,"normalizedLength":34832,"window":" 'https://example.com' ) ; // Gracefully close up everything await context . close ( ) ; await browser . close ( ) ; } ) ( ) ; Arguments options Object (optional) acceptDownloads boolean (optional) # Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted. baseURL string (optional) # When using page.goto() , page.route() , page.waitForURL() , page.waitForRequest() , or page.waitForResponse() it takes the base URL in consideration by using the URL() constructor for building the corresponding URL. Unset by default. Examples: baseURL: http://localhost:3000 and n"}
exit=0
```

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body downloads.html --quote "For every attachment downloaded by the page, page.on('download') event is emitted."
{"found":true,"offset":1087,"normalizedLength":2702,"window":"Snapshot testing Test generator Touch events (legacy) Trace viewer Videos Visual comparisons WebView2 Migration Integrations Supported languages Guides Downloads On this page Downloads Introduction  For every attachment downloaded by the page, page.on('download') event is emitted. All these attachments are downloaded into a temporary folder. You can obtain the download url, file name and payload stream using the Download object from the event. You can specify where to persist "}
exit=0
```

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none --body pw-downloads.md --quote 'For every attachment downloaded by the page, [`event: Page.download`] event is emitted.'
{"found":true,"offset":57,"normalizedLength":3337,"window":"--- id: downloads title: \"Downloads\" --- ## Introduction For every attachment downloaded by the page, [`event: Page.download`] event is emitted. All these attachments are downloaded into a temporary folder. You can obtain the download url, file name and payload stream using the [Download] object from the event. You can specify where to persis"}
exit=0
```

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none --body pw-params.md --quote 'Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted.'
{"found":true,"offset":15086,"normalizedLength":85106,"window":"olved relative to current working directory. If no path is provided, storage state is still returned, but won't be saved to the disk. ## context-option-acceptdownloads - `acceptDownloads` <[boolean]> Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted. ## context-option-ignorehttpserrors - `ignoreHTTPSErrors` <[boolean]> Whether to ignore HTTPS errors when sending network requests. Defaults to `false`. ## context-option-bypasscsp - `bypassCSP` <[bo"}
exit=0
```

Gap: the rendered page carries no explicit doc revision id beyond the HTTP `last-modified` header; the
docs-source tag v1.64.0 supplies the pinned line numbers.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcPwDownloads.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcPwDownloads.md
