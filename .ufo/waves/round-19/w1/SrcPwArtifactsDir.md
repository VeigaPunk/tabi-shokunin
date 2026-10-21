# Playwright 1.64.0 artifact/download placement — C2 G-H4

Accessed 2026-10-21. Source scope: Node Playwright `BrowserType.launch` and Chromium page downloads at tag `v1.64.0`. GitHub tag ref `v1.64.0` resolves to commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd` (GitHub API `git/ref/tags/v1.64.0`). The `SOURCES.md` registry has entries through S076; this report proposes one S0?? row only and does not edit the registry.

## Observed source map

All source paths below are in the pinned tag/commit; line numbers refer to the decoded raw file body.

1. **Artifact root and branch:** [`packages/playwright-core/src/server/browserType.ts`](https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/browserType.ts), lines 155–163. `_prepareToLaunch` uses `options.artifactsDir` when truthy. Otherwise it creates the directory with `fs.promises.mkdtemp(path.join(os.tmpdir(), 'playwright-artifacts-'))` and adds that path to `tempDirectories`. This is the source location for the `playwright-artifacts-*` name; `server/registry/index.ts` is not the implementation location (a literal search of that complete file found no `artifactsDir` occurrence).
2. **Download-root selection:** `browserType.ts:116–125` places the selected `artifactsDir` in `BrowserOptions` and sets `downloadsPath` to `(options.downloadsPath || artifactsDir)!`. Thus the default launch download root is the artifact root. `browserType.ts:299–310` resolves a nonempty relative `downloadsPath` against `process.cwd()` before launch. Explicit `downloadsPath` therefore overrides the artifact-root default.
3. **Other temporary directory:** `browserType.ts:165–173` separately creates a `playwright_${this._name}dev_profile-` user-data directory when none is supplied and adds it to `tempDirectories`; it is not the artifact/download root. `browserType.ts:199–226` passes the prepared temp-directory list to `launchProcess`. The public launch documentation below states the default artifact directory is cleaned when the browser closes; an explicit `artifactsDir` is not.
4. **Chromium event-to-download handoff:** [`packages/playwright-core/src/server/chromium/crBrowser.ts`](https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/chromium/crBrowser.ts), lines 256–273. `_onDownloadWillBegin` resolves the owning page; it returns when no page is found, and for a new-window download falls back to the opener page. On the ordinary page path it calls `downloadCreated(originPage, payload.guid, payload.url, payload.suggestedFilename)` (line 272), passing the browser `guid` and suggested name but no `downloadFilename` argument.
5. **File path construction:** [`packages/playwright-core/src/server/browser.ts`](https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/browser.ts), lines 144–146, passes `uuid`, `suggestedFilename`, and optional `downloadFilename` to `new Download`. The Chromium caller above omits the optional `downloadFilename`. [`packages/playwright-core/src/server/download.ts`](https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/download.ts), lines 29–42, resolves `downloadFilename ?? uuid` under `downloadsPath`, throws if the resolved name escapes that root, and constructs the `Artifact` at that resolved path. Lines 37–42 and 49–56 store/update `suggestedFilename` separately; they do not use it as the internal artifact path.
6. **Published documentation:** [BrowserType.launch `artifactsDir`](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-artifacts-dir) says an explicit directory receives artifacts and distinguishes the temporary default from an explicit directory. [BrowserType.launch `downloadsPath`](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-downloads-path) describes the explicit download directory, temporary default, and context-close deletion. [Download.path](https://playwright.dev/docs/api/class-download#download-path) states the internal filename is a random GUID and points readers to `suggestedFilename()` for the suggested name. The docs pages are the live `stable` docs fetched 2026-10-21; implementation claims above are pinned to v1.64.0 source.

## Verbatim quotes

1. “`const downloadPath = resolveWithinRoot(downloadsPath, downloadFilename ?? uuid);`” — `download.ts:31`, [raw v1.64.0 source](https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/download.ts); accessed 2026-10-21; decoded-body SHA-256 `0630b33dd8864a4704eeea9c8b9fc5c3e0e925e6cbcd5a99f80a157028239263` (2,414 bytes).
2. “If not specified, a temporary directory is used and cleaned up when the browser closes.” — [BrowserType.launch `artifactsDir`](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-artifacts-dir); accessed 2026-10-21; decoded-body SHA-256 `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` (167,791 bytes).
3. “Otherwise, temporary directory is created and is deleted when browser is closed.” — [BrowserType.launch `downloadsPath`](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-downloads-path); accessed 2026-10-21; decoded-body SHA-256 `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` (167,791 bytes).
4. “Note that the download's file name is a random GUID, use download.suggestedFilename() to get suggested file name.” — [Download.path](https://playwright.dev/docs/api/class-download#download-path); accessed 2026-10-21; decoded-body SHA-256 `2c3788747105b881f9e80acd02d3435bb88528e672849ec77db0a3e5f7803378` (58,436 bytes).

## Source-body integrity and retained copies

Hashes below cover the decoded bytes fetched from the stated raw source or (for the two docs pages) the HTTP-content-decoded response body. Each retained `.body.gz` is a gzip copy of that body under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/`.

| Decoded body | SHA-256 | Bytes | Retained body |
|---|---|---:|---|
| `server/browserType.ts` | `f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e` | 17,388 | `SrcPwArtifactsDir.browserType.body.gz` |
| `server/chromium/crBrowser.ts` | `d8362d85b9a11ff6503e900df3401bc77fb2059286c75d59df648fdb656c7a96` | 24,665 | `SrcPwArtifactsDir.crBrowser.body.gz` |
| `server/browser.ts` | `dc25e0105548141ab34f2edd7b586256514852fa453070c70f66ba7e5cf38cd5` | 10,120 | `SrcPwArtifactsDir.browser.body.gz` |
| `server/download.ts` | `0630b33dd8864a4704eeea9c8b9fc5c3e0e925e6cbcd5a99f80a157028239263` | 2,414 | `SrcPwArtifactsDir.download.body.gz` |
| `server/registry/index.ts` (checked; not where `artifactsDir` is implemented) | `7bcd944fbbdd91bd6e793dc412213c5c4a0e2f888f5e57b1a595a93df1ca783b` | 60,465 | `SrcPwArtifactsDir.registry-index.body.gz` |
| `playwright.dev` `class-browsertype` stable page | `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` | 167,791 | `SrcPwArtifactsDir.class-browsertype.body.gz` |
| `playwright.dev` `class-download` stable page | `2c3788747105b881f9e80acd02d3435bb88528e672849ec77db0a3e5f7803378` | 58,436 | `SrcPwArtifactsDir.class-download.body.gz` |

## Operability assessment

**Inference for G-H4:** With default `BrowserType.launch` settings—no explicit `artifactsDir` and no explicit `downloadsPath`—the artifact directory is a fresh `os.tmpdir()/playwright-artifacts-*` directory and Chromium's default internal download path is `<that directory>/<guid>`. The browser's suggested filename is separate from that path. Therefore a run-local scan must not accept only a suggested filename; it should flag any new file under the actual default artifact directory. This grounds the plan's “any new file” mutant, not a claim that the counter has already exercised it.

**Boundaries / unresolved:** If `artifactsDir` is explicit, the root is that path; if `downloadsPath` is explicit, it takes precedence (relative values resolve from `process.cwd()`). The source does not prove that the counter's `processTmpDir` equals Node `os.tmpdir()`; that alignment must be established by the counter/runtime configuration. `Download.saveAs` is an explicit copy to a caller-selected path and is not established as staying inside the artifact directory. No runtime/browser probe was run. No LSP device is exposed in the mounted tool inventory, so the caller/definition trace used literal search plus direct line reads rather than semantic LSP results.

## Proposed SOURCES row (11 columns; not added to SOURCES.md)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Playwright launch artifact/download storage — https://github.com/microsoft/playwright/blob/v1.64.0/packages/playwright-core/src/server/browserType.ts | code | A | Node Playwright v1.64.0 `BrowserType.launch` default artifact and download placement; explicit paths override defaults | tag `v1.64.0`, commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`; `browserType.ts:123-125,157-163,299-310`; `crBrowser.ts:256-273`; `browser.ts:144-146`; `download.ts:29-56`; corroborating docs: BrowserType.launch `artifactsDir`/`downloadsPath`, Download.path (accessed 2026-10-21) | With no path overrides, launch creates `playwright-artifacts-*` under `os.tmpdir()` and uses it for downloads; Chromium uses the download GUID as the internal filename while the suggested filename is separate. An any-new-file scan is needed to catch a download independent of the suggested name. | queued | 2026-10-21 | on-release | — |

## Isolation

- Production clone / branch / base / commit: none / N/A / N/A / N/A (source-only scout; no production files created).
- Changed production paths: none.
- Lane writes: this required report and the seven listed seat-owned `.body.gz` artifacts only.
- Research material: source fetches are under `/fast/scratch/tabi-r19/SrcPwArtifactsDir/src`; an initial no-checkout Playwright-source clone attempt was under `/fast/scratch/tabi-r19/SrcPwArtifactsDir/pw`, not used as a production clone.
- No tool installs or updates.