# SrcPwDownloads — Playwright `acceptDownloads` and the download event (C2 H4)

Round 18, wave 1, seat `TabiR18.SrcPwDownloads`. Lane tip at fetch time:
`git -C LANE rev-parse --verify refs/heads/master` → `2bff864fdfee684ddbcd066cc8e735adaba2735c` (= baseline B).
Opened 2026-10-20 for PLAN §C2 hazard H4 (downloads refused and recorded).

## Source opened

- Canonical URL: https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads
- Access date: 2026-10-20
- Revision / tag: stable docs build (`docs-version-stable`, Docusaurus 3.10.1), HTTP response header
  `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`, `content-length: 184490`, status 200.
  API prose pinned by docs source at tag **v1.64.0**, which is the installed Playwright
  (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/package.json`
  → `"version": "1.64.0"`) and the harness pin (`scripts/webmcp-invoke-round17.mjs:78`
  `const PLAYWRIGHT_REQUIRED = '1.64.0';`).
- Raw-fetch sha256 (full): `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e` (184490 bytes)
- Decoded sha256 for base64: not applicable — this body is UTF-8 HTML, no base64 decode.
  The quote is checked through `--decode html-text`; decoded text (pre-normalize) sha256 =
  `26a04a2afd5fedf0152fc9943ca0d8a32813a91f75d7e187f94db268fd498b4d` (40327 chars).
- Fetch command (verbatim argv, run in `/tmp/srcpwdl-3092`):
  `curl -sSL --compressed --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-scout/18' -o browser-api.html -w '%{http_code} %{size_download}' 'https://playwright.dev/docs/api/class-browser'`
  → `200 25174` (wire bytes; decoded file 184490 bytes).

### Exact anchor and quote

- Anchor: §`Browser.newContext` → **Arguments** → `options` → `acceptDownloads` (anchor
  `#browser-new-context-option-accept-downloads`); rendered docs, normalized offset 5230. The same
  sentence is pinned in docs source at `docs/src/api/params.md:374-377` under
  `## context-option-acceptdownloads` (line 377), included into `class-browser.md:258` via
  `%%-shared-context-params-list-v1.8-%%`.
- Verbatim quote (16 words):
  `Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted.`
- Location: rendered page §Browser.newContext › acceptDownloads; docs source v1.64.0 `params.md:377`.

### What it teaches the lane (one line)

A Playwright context accepts every download by default, so a refusing harness must pass
`acceptDownloads:false` explicitly and record the refusal rather than assume it.

Tier: **A**, scoped to `acceptDownloads` context-option semantics for a Playwright-launched
Chromium 1.64.0. Kind: `docs`. Recheck cadence: `on-release`.

## Companion reads (same session, same date)

| what | URL | sha256 (full) | bytes |
|---|---|---|---|
| Downloads guide (rendered) | https://playwright.dev/docs/downloads | `b1c3545b88d3e7bdc6c0abf33115bac777eaf10953e258d7cc21febb318ff26f` (html-text decode `2abab81ac99037f14fcb67a83ca2428688dd7d4ef88f731a05b9d7aaa412c95a`) | 40607 |
| Downloads guide (docs source, v1.64.0) | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/downloads.md | `b6142bc2eedd26a35f13a7c32ca6922d134e4cdf6405a9fef6bef7d2edec8cb1` | 3390 |
| Shared context option prose (v1.64.0) | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/params.md | `e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9` | 86400 |
| Download class (v1.64.0) | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-download.md | `fb1803f9f472c47fd7006db085d2f22ae5bf6795c27819750c56e4791de500e2` | 4945 |
| Browser class (v1.64.0) | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-browser.md | `de9be31c3c8ad8bc76a90ddf176e81b1e26ee1a96402db76daf27c69a019d94e` | 13004 |

Installed-code cross-check (read, not fetched): `playwright/node_modules/playwright-core/lib/coreBundle.js`
in the 1.64.0 install:

- `toAcceptDownloadsProtocol`: `if (acceptDownloads) return "accept"; return "deny";` — public
  `false` becomes internal `"deny"`.
- `CRBrowserContext.initialize`: with a non-`internal-browser-default` value it sends
  `Browser.setDownloadBehavior { behavior: "deny", browserContextId, downloadPath:
  browser.options.downloadsPath, eventsEnabled: true }` — refusal is Chromium-side, and download
  events stay enabled.
- `Download` constructor: builds `unaccessibleErrorMessage = ... acceptDownloads === "deny" ? "Pass {
  acceptDownloads: true } when you are creating your browser context." : undefined`, adds itself to
  `_downloads`, and `_fireDownloadEvent()` emits `Page.Events.Download` once a suggested filename
  exists.
- `Download.failure()` docs (class-download.md, `## async method: Download.failure`): "Returns
  download error if any. Will wait for the download to finish if necessary."
- Defaults: `prepareBrowserContextParams` sets `options.acceptDownloads = "accept"` when undefined for
  non-Electron browsers; `sharedContextParams` default is `acceptDownloads: "accept"`.
- Artifacts: without `artifactsDir`, `_prepareToLaunch` does
  `mkdtemp(os.tmpdir()/playwright-artifacts-)` and pushes it onto `tempDirectories`, removed by
  `removeFolders` during browser-close/kill cleanup (a Node-side SIGKILL skips it).

## Draft registry row (11 cells, L1 assigns the id — PLAN §C2 says new rows S059+)

| S0?? | Playwright Browser.newContext acceptDownloads and the download event — https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads | docs | A | acceptDownloads context-option semantics and refusal evidence for a Playwright-launched Chromium 1.64.0 | stable docs fetched 2026-10-20 (HTTP last-modified 2026-10-20T16:46:38Z), §Browser.newContext Arguments › acceptDownloads, anchor #browser-new-context-option-accept-downloads; docs source v1.64.0 params.md:374-377 | A context accepts every download by default, so a refusing harness must pass acceptDownloads:false explicitly and record the refusal instead of assuming it | queued | 2026-10-20 | on-release | — |

## Gate entry

- URL: https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads
- Access date: 2026-10-20
- Quote (16 words) + location: "Whether to automatically download all the attachments. Defaults to
  true where all the downloads are accepted." — §Browser.newContext › Arguments › acceptDownloads
  (anchor `#browser-new-context-option-accept-downloads`); docs source v1.64.0 `params.md:377`.
- Raw-fetch sha256: `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e`
- Normalizer producer sha256 (`.ufo/waves/round-18/recheck-fetch.mjs` at lane tip): `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`

## Normalize-only output (pasted verbatim)

Canonical option quote against the raw HTML body:

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body browser-api.html --quote 'Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted.'
{"found":true,"offset":5230,"normalizedLength":34832,"window":" 'https://example.com' ) ; // Gracefully close up everything await context . close ( ) ; await browser . close ( ) ; } ) ( ) ; Arguments options Object (optional) acceptDownloads boolean (optional) # Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted. baseURL string (optional) # When using page.goto() , page.route() , page.waitForURL() , page.waitForRequest() , or page.waitForResponse() it takes the base URL in consideration by using the URL() constructor for building the corresponding URL. Unset by default. Examples: baseURL: http://localhost:3000 and n"}
exit=0
```

Companion guide quote (download event), rendered page:

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body downloads.html --quote "For every attachment downloaded by the page, page.on('download') event is emitted."
{"found":true,"offset":1087,"normalizedLength":2702,"window":"Snapshot testing Test generator Touch events (legacy) Trace viewer Videos Visual comparisons WebView2 Migration Integrations Supported languages Guides Downloads On this page Downloads Introduction  For every attachment downloaded by the page, page.on('download') event is emitted. All these attachments are downloaded into a temporary folder. You can obtain the download url, file name and payload stream using the Download object from the event. You can specify where to persist "}
exit=0
```

Companion guide quote, docs source at installed tag v1.64.0:

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none --body pw-downloads.md --quote 'For every attachment downloaded by the page, [`event: Page.download`] event is emitted.'
{"found":true,"offset":57,"normalizedLength":3337,"window":"--- id: downloads title: \"Downloads\" --- ## Introduction For every attachment downloaded by the page, [`event: Page.download`] event is emitted. All these attachments are downloaded into a temporary folder. You can obtain the download url, file name and payload stream using the [Download] object from the event. You can specify where to persis"}
exit=0
```

Pinned option prose in `params.md` at v1.64.0 (backticks are part of that body):

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none --body pw-params.md --quote 'Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted.'
{"found":true,"offset":15086,"normalizedLength":85106,"window":"olved relative to current working directory. If no path is provided, storage state is still returned, but won't be saved to the disk. ## context-option-acceptdownloads - `acceptDownloads` <[boolean]> Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted. ## context-option-ignorehttpserrors - `ignoreHTTPSErrors` <[boolean]> Whether to ignore HTTPS errors when sending network requests. Defaults to `false`. ## context-option-bypasscsp - `bypassCSP` <[bo"}
exit=0
```

## Does the source contradict PLAN §C2?

No contradiction of the H4 design ("downloads refused (`acceptDownloads:false`) and recorded").
Two precisions the harness must honour, neither of which changes the plan:

1. `acceptDownloads:false` is required: the option's default is acceptance, and the round-17 harness
   passes no such option (`scripts/webmcp-invoke-round17.mjs:600` `chromium.launchPersistentContext(profile, {...})`
   — options are `executablePath, headless, args, env, serviceWorkers, chromiumSandbox`). PLAN §C2
   already states `acceptDownloads:false`, so red-at-B holds by that default.
2. "Recorded" does not follow from refusal alone: the API surfaces the refusal only through the
   `download` event object (`Download.failure()` / `path()` error, code string "Pass {
   acceptDownloads: true } ..."), and the docs never state event behaviour under `false`. The fixture
   must register `page.on('download')` (or `waitForEvent`) before the click; a refusal with no
   listener leaves no lane artifact. [INFERENCE] that Chromium 154 emits `downloadWillBegin` (and thus
   Playwright constructs a `Download`) under `behavior:"deny", eventsEnabled:true` is read from the
   1.64.0 client path, not yet observed on this host's Chromium; the `invoke-download-refused` probe
   run is the observation that settles it.

## Remaining unknowns

- The page has no version selector in the body; pinning rests on the HTTP `last-modified` header plus
  the v1.64.0 docs-source tag, not on a documented doc revision id.
- Whether a denied download creates any Chromium `.crdownload`/temporary file under the run TMPDIR on
  this host is unobserved; H2's "TMPDIR empty" assertion is the check, and Playwright's own
  `playwright-artifacts-*` directory is created under `os.tmpdir()` unless `artifactsDir` is supplied.
