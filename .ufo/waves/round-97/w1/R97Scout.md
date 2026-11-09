# R97Scout — source reconnaissance for C1 (client-oopif-uploadfile-linux)

Seat: R97Scout (leaf scout, no subagents, no commits, no git/jj mutation, no Chromium run).
Milestone: source reconnaissance. Access date for every URL below: 2026-11-09 (UTC).
Raw fetch evidence (status, bytes, sha256 per URL): `.ufo/waves/round-97/w1/R97Scout-fetch-evidence.txt` (46 rows: 41 HTTP 200, 5 HTTP 403 unrun searches; bodies kept in scratch, deleted before yield).
Tools installed: none (curl, jq, sha256sum, coreutils already present; no `uv`/`npm`/pacman action taken).

## Axes
1. Mechanism: which code path the two clients take on a file input (handle-session `DOM.setFileInputFiles` vs script-dispatched events vs payload injection).
2. Known-behaviour reports: upstream issues/PRs on `uploadFile` nonexistent paths, untrusted events, iframes, `isLocal`.
3. Protocol contract: what `DOM.setFileInputFiles` promises (and does not promise) about events.
4. Freshness: pinned tags (`puppeteer-v25.16.0`, `v1.65.0`) against the claim's staged citations.

## Verified claim citations (pinned tags, opened this round)
- S237 `packages/puppeteer-core/src/cdp/ElementHandle.ts` @ `puppeteer-v25.16.0`: matches the claim. Lines 119-121 `const path = environment.value.path;` and 120-131 `path.resolve` only; the file contains no `fs`/`existsSync` (no existence check). Lines 138-150 zero-files branch: `element.files = new DataTransfer().files;` then `dispatchEvent(new Event('input'…))` and `dispatchEvent(new Event('change'…))`. Lines 158-162: `this.client.send('DOM.setFileInputFiles', {objectId, files, backendNodeId})`.
- S238 `packages/playwright-core/src/server/fileUploadUtils.ts` @ `v1.65.0`: matches. Line 62 `if (!frame._page.browserContext._browser._isBrowserCollocatedWithServer) {`; lines 63-75 read files into buffers (`fs.promises.readFile`), `localPaths = undefined`. Lines 31-33 `filesExceedUploadLimit` calls `fs.promises.stat(file)`.
- `chromium.ts` @ `v1.65.0` lines 162-163: `if (!options.isLocal) browser._isBrowserCollocatedWithServer = false;` — matches.
- `crPage.ts` @ `v1.65.0` line 445: `eventsHelper.addEventListener(this._client, 'Page.fileChooserOpened', …)` — matches the D1 framing (file-chooser listener), not a C1 statement.

## Source table (each row: URL · access · HTTP · ≤25-word quote with location · bearing on C1)

| # | URL | HTTP / bytes | Quote (location) | Bearing |
|---|---|---|---|---|
| 1 | https://pptr.dev/api/puppeteer.elementhandle.uploadfile (docs-version-25.16.0) | 200 / 36863 | "This will not validate whether the file paths exists." (description, ¶ after signature) | SUPPORTS PUM (no existence check). Also: "paths must be absolute" for remote Chrome — relevant to future remote-host rounds. |
| 2 | https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts | 200 / 6124 | "XXX: These events should converted to trusted events. Perhaps do this in `DOM.setFileInputFiles`?" (lines 139-140) | SUPPORTS PUC second-call events being script-built (untrusted). The comment implies (INFERENCE, not stated) that the `DOM.setFileInputFiles` branch yields trusted events — consistent with PUX/PUM `[true,true]`. |
| 3 | same file, lines 138-151 | (same) | "Dispatch events for this case because it should behave akin to a user action." (line 144) | SUPPORTS PUC `[U input, U change]` mechanism (script-dispatched, `element.files = new DataTransfer().files`). |
| 4 | https://github.com/puppeteer/puppeteer/issues/10053 (closed 2023-04-21; API body) | 200 / 4423 | "We used to validate, but now we don't because the file comes from your *remote* environment" (maintainer jrandolf, comment 2023-04-21) | SUPPORTS PUM mechanism: Puppeteer validated once, removed it deliberately; "the input element doesn't validate what gets set there". |
| 5 | https://github.com/puppeteer/puppeteer/pull/5733 (MERGED 2020-04-24; API body + files) | 200 / 17208 | title "fix: make uploadFile throw for non-existent files" (merged 2020-04-24) | BOUNDS: the validation existed in 2020 and was later removed (see row 4); v25.16.0 has none (row 2). Not a Chromium-behaviour source. |
| 6 | https://github.com/puppeteer/puppeteer/pull/15032 (CLOSED, merged_at null; API body 2026-05-21) | 200 / 17799 | title "feat(ElementHandle): support FilePayload buffers in uploadFile" | BOUNDS: Puppeteer has no buffer/payload upload in 25.16.0 (row 2 signature is `...files: string[]`); the PR is unmerged. Consistent with claim limit 5 (payload unmeasured for Puppeteer). |
| 7 | https://github.com/puppeteer/puppeteer/issues/4405 (closed 2022-06-09) | 200 / 4119 | "it uploads an empty file, as it doesn't exist on host machine." (issue body) | SUPPORTS PUM phantom-file mechanism (missing path → empty file) — a user report on a remote `puppeteer.connect`, not a Chromium verification. |
| 8 | https://github.com/puppeteer/puppeteer/issues/8470 (closed 2022-06-07) | 200 / 5659 | "Connect to a remote browser that does not share the file system" (steps 1) | CONTEXT only: remote-filesystem failure reports; matches claim's limit 2 scope exclusion. |
| 9 | https://pptr.dev/troubleshooting (grep for uploadFile/existence/setFileInputFiles) | 200 / 136898 | no match | Puppeteer troubleshooting page says nothing on uploads — no contrary statement. |
| 10 | https://playwright.dev/docs/api/class-browsertype (`connectOverCDP` option `isLocal`, "Added in: v1.58") | 200 / 168208 | "Tells Playwright that it runs on the same host as the CDP server." (option isLocal) | SUPPORTS the PLX/PLL split as a file-system-sharing switch. The doc says nothing about event trust, so the trusted/untrusted statements in C1 rest on sources 13-16, not on docs. |
| 11 | https://playwright.dev/docs/api/class-locator (`setInputFiles`, "Added in: v1.14") | 200 / 572368 | "Upload file or multiple files into <input type=file>." (§setInputFiles) | NEUTRAL: no statement about event trust or about non-collocated browsers. |
| 12 | https://playwright.dev/docs/api/class-filechooser | 200 / 50956 | grep for "trust" returned 0 matches | NEUTRAL: no event-trust statement on the page. |
| 13 | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/injected/src/injectedScript.ts (lines 1009-1030) | 200 / 85112 | "input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));" (line 1028) after `input.files = dt.files;` (line 1027) | SUPPORTS PLX/PLS `[false,false]`: the payload path sets files and dispatches `input`/`change` from page JS, so events are untrusted by construction. |
| 14 | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/dom.ts (lines 746-790) | 200 / 49422 | line 768 `if (localPaths || localDirectory) {` / line 786 `await progress.race(retargeted.evaluateInUtility(([injected, node, files]) =>` (else-branch: payload) | SUPPORTS the two-path split: local paths → native `setInputFilePaths` (PLL, trusted), payloads → injected JS (PLX, untrusted). Line 771 `fs.promises.access(localPath, fs.constants.F_OK)` is the local-path existence check (see gap G1). |
| 15 | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/chromium/crPage.ts (lines 343-352) | 200 / 59431 | `setInputFilePaths(...)` sends `'DOM.setFileInputFiles'` on `parentSession = this._sessionForFrame(frame)` | Mechanism for the native (PLL) path. Variable name `parentSession` is misleading; it is the frame's session (INFERENCE for OOPIF routing — not tested). |
| 16 | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/chromium/chromium.ts (lines 162-163) | 200 / 24127 | "if (!options.isLocal) browser._isBrowserCollocatedWithServer = false;" | SUPPORTS: default `connectOverCDP` flips the collocation flag → payload path; `isLocal` keeps paths. |
| 17 | https://playwright.dev/docs/api/class-locator and PR 40293 https://api.github.com/repos/microsoft/playwright/pulls/40293 (merged 2026-04-18) | 200 / 17821 | "The Electron package move (#40184) lost the `isLocal` flag … marking the browser as remote" (PR body) | SUPPORTS that `isLocal` decides the transfer path (remote → 50 MB limit and buffer path). Same mechanism as row 16. |
| 18 | https://github.com/microsoft/playwright/pull/38614 (merged 2025-12-19; API body) | 200 / 17641 | title "feat(api): expose connectOverCDP({ isLocal })" | CONTEXT: option introduced Dec 2025; the pinned v1.65.0 carries it. |
| 19 | https://github.com/microsoft/playwright/issues/43367 (closed 2026-10-14) | 200 / 10600 | "Passive observation found one trusted `input` event and one `change` event." | BOUNDS (WebKit, not Chromium): native directory `setInputFiles` assignment gave trusted events. Also "Chromium and Firefox each completed 40 fresh-page selections before it." — no Chromium event data. |
| 20 | https://github.com/microsoft/playwright/pull/43385 (title only from search, closed 2026-10-14) | search row only | title "fix(setInputFiles): wait for input event on the input when uploading a folder" | NOT OPENED. Directory-upload timing; out of C1 scope. |
| 21 | https://chromedevtools.github.io/devtools-protocol/tot/DOM/ (index page) | 200 / 8171 | lists `DOM.setFileInputFiles` (index only) | Index only; no description on this page. |
| 22 | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json (protocol version 1.3, master) | 200 / 1423215 | `DOM.setFileInputFiles` description: "Sets files for the given file input element." (params files, nodeId, backendNodeId, objectId) | BOUNDS: the protocol contract says nothing about event trust or missing files. Caveat: `master`, not pinned to Chromium 155. |
| 23 | https://github.com/h4ckf0r0day/obscura/issues/384 (non-Chromium CDP server, commit 1ca6047) | 200 / 323055 | "fires input and change on the <input type=file>, but the events are untrusted" | BOUNDS: another CDP implementation fires untrusted events from `DOM.setFileInputFiles`. The C1 "trusted" result is Chromium 155-specific (claim limit 1); this is a warning, not a contradiction. |

Search (GitHub API, `api.github.com/search/issues`, fetched 2026-11-09):
- `uploadFile repo:puppeteer/puppeteer` total 85; `+iframe` total 3 (none about iframes or trust: #13490 release, #5435 "returns instantly", #1343 unrelated); `+isTrusted` total 1 (#1376 drag-and-drop, 2017); `+DOM.setFileInputFiles` total 16 (opened titles only: remote/upload, Firefox, connect issues); `+input+change+events` total 10 (incl. PR #5389 "Emit change event on uploadFile calls", closed 2020 — title only, NOT opened).
- `setInputFiles repo:microsoft/playwright +isTrusted` / `+trusted` total 1 (#43367, row 19). `+untrusted+event` total 5 but all unrelated (hono bumps) — fuzzy matching, no signal.
- `setInputFiles +iframe` total 180 and `+connectOverCDP` total 142 — dominated by dependency bumps and roll PRs; no iframe/trust issue located.
- Five searches returned HTTP 403 (secondary rate limit) and were not retried successfully: `setInputFiles +trusted OR untrusted OR isTrusted`, `setInputFiles +ENOENT`, `DOM.setFileInputFiles repo:puppeteer/puppeteer`, `setFileInputFiles repo:ChromeDevTools/devtools-protocol`, `setFileInputFiles repo:chromium/chromium`. These are unrun checks, not passes.
- web_search (secondary, not used as evidence for any statement below): summaries pointed to the same Puppeteer #10053/troubleshooting material and to obscura #384; no Chromium-155 trust report found.

## Findings bearing on C1 (no counter run, no --live run)
- F1 (mechanism, sourced): PUX/PUS/PLL `[trusted,trusted]` and PLX/PLS `[untrusted,untrusted]` are consistent with the pinned sources: native `DOM.setFileInputFiles` on the Puppeteer handle and on Playwright's `localPaths` branch (rows 2, 14, 15, 16), versus JS-dispatched events on Playwright's payload branch (rows 13, 14, 16). Trustedness of the native branch is INFERENCE from row 2's XXX comment; no source states it for Chromium.
- F2 (PUC, sourced): the second `uploadFile()` with no files takes the script branch (rows 2-3) → `[U input, U change]`; consistent with the claim's predicted `[T,T,U,U]`.
- F3 (PUM, sourced): no existence check at v25.16.0 (row 1 doc; row 2 no `fs`); a missing absolute path passes through to `DOM.setFileInputFiles`. Phantom `size 0` is a user-reported behaviour (row 7) — not verified by any source for Chromium 155.
- F4 (PLM, sourced): the error path is `fs.promises.stat` in `filesExceedUploadLimit` (row S238 lines 31-33, 65-70 — PLM runs the non-collocated branch because `isLocal` is absent). Node's message format for `stat` is `ENOENT: no such file or directory, stat '<path>'` [INFERENCE from Node's error format; the claim's text matches it].
- F5 (no contradiction found): no source opened states that a Playwright or Puppeteer file-input call on Chromium yields untrusted events on the native branch, nor that a missing path raises in Puppeteer. The one contrary-looking report (obscura #384) is a different CDP server.

## Gaps and pointers for the next rounds (not claimed here)
- G1 (declared limit 5, PLL + missing path): dom.ts line 771 runs `fs.promises.access(localPath, fs.constants.F_OK)` on the isLocal branch. [INFERENCE] the message would name `access`, not `stat`: `ENOENT: no such file or directory, access '<path>'`. Unmeasured; do not claim.
- G2 (Puppeteer buffer upload): PR #15032 is closed unmerged; Puppeteer 25.16.0 has no payload API. Any future Puppeteer buffer round needs a new upstream release, not this one.
- G3 (protocol pin): the devtools protocol JSON was read from `master`. A pinned Chromium-155 protocol (or the `tot` page's per-method anchor) is needed before claiming protocol-level event semantics.
- G4 (OOPIF routing): crPage.ts `setInputFilePaths` uses `_sessionForFrame(frame)` (row 15). Whether that session is the child target's session for OOPIF frames is not sourced here; C1 measures it (PLL trusted on the cross-site leg) rather than assuming it.
- G5 (the `isTrusted` observer): Playwright and Puppeteer sources do not mention listeners; C1 "trusted" is observed on `#s` only (claim limit 4). Nothing here contradicts that.
- G6 (search coverage): GitHub search is fuzzy and rate-limited (5 × 403). A complete issue sweep was not achieved.

## Evidence files
- `.ufo/waves/round-97/w1/R97Scout-fetch-evidence.txt` — 48 rows: HTTP status, bytes, sha256 per URL actually opened (plus five 403 rows, labelled as unrun).
- No receipts or counter output cited; no scratch artefacts copied into w1.

## Commands run (for honesty)
- `mkdir -p /fast/scratch/hyaku/tabi-r97/R97Scout` ; `curl -sS -L --max-time 60 -A "Mozilla/5.0 R97Scout" -o <file> -w "%{http_code} size=%{size_download} <url>"` for each URL above (status 200 except the five 403 search rows).
- `jq` on the saved JSON bodies (issue/PR/search fields); `grep`/`sed -n` on the saved raw bodies to locate quotes; `sha256sum` and `stat -c %s` for the evidence rows.
- Exit codes: all curl calls returned 0 except the five 403 search requests (curl exit 0 with HTTP 403 recorded; no retry succeeded). No Chromium, no counter, no npm install, no git/jj command.
- Scratch `/fast/scratch/hyaku/tabi-r97/R97Scout` removed before yield (`rm -rf`).

VERDICT C1: neutral
