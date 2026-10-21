# SourceS091 — bounded source reopening at R

## Result

**AGREE with retaining S091 as `code / A / mined` within its stated default-local-launch scope.** The lesson's five-word quote is exact at decoded `browserType.ts:161`; its SHA-256 is unchanged. The tag resolves to the recorded commit, and the commit-addressed file is byte-identical. Four implementation bodies and both corroborating documentation bodies match the wave-1 recorded hashes. **AGREE with S094's rejection:** its exact tagged URL still returns HTTP 404. Its error-body hash changed only because the response's request ID changed; the six-word first-line quote did not change.

One documentary qualification: the used-by knowledge note at lines 81–84 omits the row's **no path overrides** condition. Also, “scan any new file” is an evidence-policy inference from the layout, not an upstream Playwright requirement or proof that a refused download creates a GUID file. No source status was changed.

- Axes: source identity; exact quote/location; scoped entailment; auditable preservation.
- Checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R).
- Access date for every fetch below: **2026-10-21**.
- Fetch results: **9 requests: 8 HTTP 200, 1 HTTP 404**. No browser, runtime mutation, build, lint, or test suite was run.

## Checkpoint and trace method

The target row was read directly from `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47:corpus/SOURCES.md`, lines 105 and 108. Read-only checkpoint comparisons returned exit 0 with no differences for the registry, round-19 lesson, used-by note, wave-1 Playwright dossier/gate, and `scripts/webmcp-invoke-round19.mjs` before the relevant local sections were used as R evidence. No git write was performed.

**LSP unavailable:** `read xd://lsp` returned `No such tool: xd://lsp` and listed the mounted devices without an LSP device. This is device absence, not an empty/cold indexing result. Caller/definition relationships below come from literal search and direct source reads; they are not presented as semantic LSP proof.

`git ls-remote https://github.com/microsoft/playwright.git refs/tags/v1.64.0 'refs/tags/v1.64.0^{}'` returned:

```text
606ecd8b34bac100db32561b6278ffd76e5eb3cd refs/tags/v1.64.0
```

The separately fetched commit-addressed body P2 equals P1 byte-for-byte. Tags can move; this observation and the retained commit body bind what was checked today.

## Exact fetched URLs and decoded-body integrity

SHA-256 covers the HTTP-content-decoded response bytes, not rendered text and not the gzip container. All nine responses used `Content-Encoding: identity`; effective URLs equaled requested URLs. Retained files are under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/`.

| ID | Exact requested URL | HTTP | Decoded bytes | Decoded SHA-256 | Retained filename |
|---|---|---:|---:|---|---|
| P1 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/browserType.ts | 200 | 17,388 | `f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e` | `SourceS091.body.gz` |
| P2 | https://raw.githubusercontent.com/microsoft/playwright/606ecd8b34bac100db32561b6278ffd76e5eb3cd/packages/playwright-core/src/server/browserType.ts | 200 | 17,388 | `f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e` | `SourceS091.browserType-commit.body.gz` |
| P3 | https://github.com/microsoft/playwright/blob/v1.64.0/packages/playwright-core/src/server/browserType.ts | 200 | 537,152 | `78ce1ed8ff211bb36d712a31137b96777ab2f04d37b643b1c1285b9824d25890` | `SourceS091.registry-blob.body.gz` |
| P4 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/chromium/crBrowser.ts | 200 | 24,665 | `d8362d85b9a11ff6503e900df3401bc77fb2059286c75d59df648fdb656c7a96` | `SourceS091.crBrowser.body.gz` |
| P5 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/browser.ts | 200 | 10,120 | `dc25e0105548141ab34f2edd7b586256514852fa453070c70f66ba7e5cf38cd5` | `SourceS091.browser.body.gz` |
| P6 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/download.ts | 200 | 2,414 | `0630b33dd8864a4704eeea9c8b9fc5c3e0e925e6cbcd5a99f80a157028239263` | `SourceS091.download.body.gz` |
| P7 | https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-artifacts-dir | 200 | 167,791 | `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` | `SourceS091.class-browsertype.body.gz` |
| P8 | https://playwright.dev/docs/api/class-download#download-path | 200 | 58,436 | `2c3788747105b881f9e80acd02d3435bb88528e672849ec77db0a3e5f7803378` | `SourceS091.class-download.body.gz` |
| P9 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT | 404 | 233 | `c9e16b91f036a651098fc3b143cfa7427193b1fe35921fde0b075fc1ca36e0b8` | `SourceS091.S094.body.gz` |

P3 is GitHub's HTML wrapper; the lesson correctly binds the decoded **raw source** P1, not the wrapper. P7/P8 are rolling documentation, not version-pinned implementation evidence. Both happen to match the wave-1 hashes and sizes exactly: no observed documentation drift. P1/P4/P5/P6 likewise match the wave-1 table at `.ufo/waves/round-19/w1/SrcPwArtifactsDir.md:29-35`.

The required primary artifact is `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/SourceS091.body.gz`: 4,939 compressed bytes; gzip SHA-256 `7e62756921e9ad3acfa1b486edcf95471760fe3f29d3b22a5306e4ea6e702a44`; decoded SHA-256 is P1 above.

## Located quotes

All quotes below were located in the fetched bodies, accessed **2026-10-21**. P identifiers resolve to their exact URL and full decoded SHA-256 in the preceding table. Word counts are whitespace-delimited; each quote is at most 25 words.

| Evidence | Exact quote | Words | Exact source location |
|---|---|---:|---|
| P1 — lesson gate | `artifactsDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'playwright-artifacts-'));` | 5 | `packages/playwright-core/src/server/browserType.ts:161`; matches `corpus/lessons/round-19.md:47` and the wave-1 gate JSON |
| P1 — default root selection | `downloadsPath: (options.downloadsPath \|\| artifactsDir)!,` | 4 | `packages/playwright-core/src/server/browserType.ts:124` (table escapes only; source has two literal pipe characters) |
| P4 — Chromium GUID handoff | `this.downloadCreated(originPage, payload.guid, payload.url, payload.suggestedFilename);` | 4 | `packages/playwright-core/src/server/chromium/crBrowser.ts:272` |
| P6 — final artifact path | `const downloadPath = resolveWithinRoot(downloadsPath, downloadFilename ?? uuid);` | 7 | `packages/playwright-core/src/server/download.ts:31` |
| P4 — refusal versus acceptance | `behavior: this._options.acceptDownloads === 'accept' ? 'allowAndName' : 'deny',` | 8 | `packages/playwright-core/src/server/chromium/crBrowser.ts:363` |
| P7 — documented default | “If not specified, a temporary directory is used and cleaned up when the browser closes.” | 17 | `BrowserType.launch` → `artifactsDir`, HTML ID `browser-type-launch-option-artifacts-dir` |
| P8 — documented filename distinction | “Note that the download's file name is a random GUID, use download.suggestedFilename() to get suggested file name.” | 21 | `Download.path`, HTML ID `download-path` |
| P9 — rejected URL | “NOT_FOUND: Requested entity was not found” | 6 | Decoded HTTP-404 body, line 1; matches `corpus/lessons/round-19.md:51` |

P7's same fetched page also contains the `downloadsPath` section at https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-downloads-path. This anchor was inspected in P7; it was not counted as another HTTP request.

## Definition/caller trace and entailment

### Observed source facts

1. **Local launch → preparation.** `BrowserType.launch` validates options and enters `_innerLaunchWithRetries` (`browserType.ts:68-74`). The local `_innerLaunch` obtains `artifactsDir` from `_launchProcess` and selects `downloadsPath` using the supplied path or that artifact directory (`:109-138`). `_launchProcess` calls `_prepareToLaunch` before spawning (`:202-231`). `launchPersistentContext` shares this internal launch path (`:76-94`), so the trace also covers the API used by the round-19 harness.
2. **Defaults and overrides.** `_prepareToLaunch` takes a truthy `options.artifactsDir` unchanged; only its else branch creates the `os.tmpdir()/playwright-artifacts-*` directory (`browserType.ts:155-163`). `options.downloadsPath` independently overrides the download root (`:124`), and `_validateLaunchOptions` resolves a nonempty relative download path against `process.cwd()` (`:299-310`). The separately created `playwright_*dev_profile-*` directory (`:165-173`) is not the download/artifact directory.
3. **Chromium filename chain.** `_onDownloadWillBegin` passes `payload.guid` as the UUID argument and `payload.suggestedFilename` separately (`crBrowser.ts:256-273`). `Browser.downloadCreated` passes those to `new Download`, without Chromium supplying the optional `downloadFilename` (`browser.ts:144-146`). `Download` therefore constructs its artifact path from `downloadsPath` and UUID, and stores the suggested filename separately (`download.ts:29-41,48-56`). The handler can return without constructing a Download if it cannot identify a usable page; the trace is not a guarantee that every browser download yields a page-level event.
4. **Actual browser policy.** `CRBrowserContext.initialize` supplies the selected root to `Browser.setDownloadBehavior`; accepted downloads use `allowAndName`, while denied downloads use `deny` (`crBrowser.ts:359-368`, with the source's clank/internal-default exclusions). Thus the internal artifact pathname is not evidence that the file exists, especially for refused downloads.

### Registry cells at R

| Cell | Finding |
|---|---|
| `kind = code` | Agree: P1/P4/P5/P6 are implementation, not a declarative WebMCP proposal or specification. Rolling docs are only corroboration. |
| `tier = A` | Agree within the declared Playwright Node v1.64.0 default-launch scope: upstream implementation, tag/commit identity checked. Not a global browser-storage guarantee. |
| `scope` | Agree: expressly permits explicit path overrides. Also keep local launch distinct from attachment/remote/Selenium paths. |
| `anchor` | Agree: all listed implementation ranges support the chain; `crBrowser.ts:359-368` additionally makes the acceptance/refusal boundary explicit. |
| `teaches` — default directory and GUID distinction | Supported by the combined implementation chain, not by the five-word gate quote alone. |
| `teaches` — any-new-file scan | **[INFERENCE / lane evidence policy]** A name-independent inventory is appropriate when the claim is “no new file,” because the actual name is not the suggested filename. Upstream code does not prescribe the lane's verifier or make this the only possible sound proof strategy. |
| `status = mined` | Agree: the used-by note actually cites S091 at line 6 and consumes it in its C2 subsection at lines 79–85. |
| `opened = 2026-10-21`, `recheck = on-release` | Consistent with the dated gate and versioned implementation. Today's reopening does not convert rolling docs into an immutable release source. |
| `used-by` | `corpus/knowledge/webmcp-declarative-validation-round-19.md` exists and uses the source, not merely an unused bibliography link. |

### Used-by qualification and current caller

The knowledge note at `corpus/knowledge/webmcp-declarative-validation-round-19.md:81-84` states the temporary artifact-directory behavior without repeating the registry's default/no-overrides condition. **[INFERENCE]** Read universally, that would be too broad: `artifactsDir` and `downloadsPath` are direct source counterexamples. The precise reading is **default local launch storage**, with Chromium's accepted-download GUID convention; a refused download need not produce any file.

The note's cited current harness does fit that default-path scope. At R, `scripts/webmcp-invoke-round19.mjs:1258-1271` calls `launchPersistentContext` with no `artifactsDir`/`downloadsPath` override and with `acceptDownloads:false`. Its Node-side `process.env.TMPDIR` is assigned to `processTmpDir` at `:1695-1702`; the Chromium child receives a separate private TMPDIR via `minimalBrowserEnv`/the launch options. Playwright source `_prepareToLaunch` calls Node's `os.tmpdir()`, not the Chromium child environment. These are distinct roots, not interchangeable names.

For the note's limited statement that the successor scans new files, literal implementation evidence is present: `listDownloadScanRoots` discovers direct `processTmpDir/playwright-artifacts-*` directories (`:812-838`); `scanFilesUnderRoot` recursively collects regular-file paths (`:841-870`); `snapshotDownloadFiles` and `summarizeDownloadScan` compare before/while-alive/after-close inventories (`:873-932`); the download case obtains the first two snapshots at `:2848,2856`, obtains the after-close snapshot at `:1801-1811`, and requires a complete scan with zero new files at `:2882-2889`. **This is source inspection, not an executed proof of C2 or of transient-file coverage.**

S091 does not prove that the previous verifier searched only the suggested filename, that a refused GUID download happened, or that every possible artifact root is covered. The lesson already distinguishes the earlier marker-byte scan at `corpus/lessons/round-19.md:68-69`; that distinction must not be lost when interpreting the source row.

## S094 rejection and flip

- **Rejection: agree, high confidence for this exact URL at this tag.** P9 returns HTTP 404, with the exact six-word first line recorded by the lesson. This is evidence of failure to resolve that file path; it is not evidence that the feature has no tests elsewhere.
- **Hash drift: explained, not concealed.** The R-retained `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` decodes to 233 bytes with SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. The new response is also 233 bytes and has P9's different hash. Direct comparison found exactly one changed line: line 7's `request_id`. Both bodies have eight lines and identical error text otherwise. An HTTP error response is not an immutable source blob merely because its URL contains a Chromium tag.
- **Flip: agree with the intended evidence requirement; not triggered.** A resolvable, tagged test source needs a located quote from that test file and its own body identity. A quote from `form_mcp_schema.cc` cannot stand in for a test-file quote. A different valid test filename would be distinct source evidence, not proof that this missing exact filename exists. `html_form_mcp_tool_test.cc` remains a lead in this assignment and was not fetched or mined.

## Confidence, remaining limits, and tools

- **High confidence:** S091 tag/file identity, exact gate quote/hash, default-root and GUID chain, registry usage, and S094's exact-path HTTP rejection.
- **Explicit inference:** the lane's “any new file” verifier choice and the knowledge note's need to preserve default-path qualification.
- **Unresolved/not claimed:** runtime file creation for refused downloads, runtime alignment of every artifact root, absence of transient files between snapshots, successful execution of the cited harness/counter, or any other queued source's admission. No runtime probe was necessary to answer this scoped source question.
- Other queued rows were not reopened or mined. No SOURCES edit, source admission, integration, or commit was performed.
- Tools installed/updated: **none**. No browser/profile access, host/service mutation, background job, or subagent dispatch.

## Isolation

- Clone: not created; this was a read-only source reopening with no runtime/mutation probe and no production edit.
- Branch: none.
- Base examined: R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; B `66251bfc1aef393e4aec599e950a8deb867736bb` unchanged.
- Commit: none.
- Changed paths: only `.ufo/waves/round-19/w2/SourceS091.md` and the nine seat-owned retained bodies `SourceS091.body.gz`, `SourceS091.browserType-commit.body.gz`, `SourceS091.registry-blob.body.gz`, `SourceS091.crBrowser.body.gz`, `SourceS091.browser.body.gz`, `SourceS091.download.body.gz`, `SourceS091.class-browsertype.body.gz`, `SourceS091.class-download.body.gz`, and `SourceS091.S094.body.gz`, all under the same wave-2 directory.
