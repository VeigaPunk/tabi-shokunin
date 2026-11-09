# R98Scout — source reconnaissance, tabi round 98 (C1 `client-oopif-uploadmodes-linux`)

Seat: R98Scout (scout, leaf). Scope: primary sources bearing on C1 and the next rounds.
Access date for every URL below: **2026-11-09**. Raw fetch evidence (status/size/sha256 per URL):
`.ufo/waves/round-98/w1/R98Scout-fetch-evidence.txt` (sha256 `2fb514bfb39dc113a1df244a6e1ce9bdbbe9d79107e74d9151fc7fb8a25399db`).
No Chromium was launched; no client deps installed; no lane file touched. Nothing ran under `--live`.

## Sources actually opened

### S1 — W3C File API (`https://w3c.github.io/FileAPI/`, HTTP 200, 566152 B, `0034ebf4…`)
- §4 File interface, "reads on files that no longer exist" — *"User agents must process reads on files that no longer exist at the time of read as errors, throwing a NotFoundError exception"*.
- §7 Errors and Exceptions (anchor `ErrorAndException`) — *"The File or Blob being accessed may not exist at the time one of the asynchronous read methods or synchronous read methods is called."*
- §7.1 (anchor `dfn-error-codes`) table row NotFoundError — *"If the File or Blob resource could not be found at the time the read was processed, this is the NotFound failure reason."*
- §7.1 row NotReadableError (anchor `snapshot-state`) — *"the snapshot state of a File or a Blob does not match the state of the underlying storage, this is the SnapshotState failure reason."*
**Relation to C1: supports the PUR leg's read error class.** The spec says a vanished backing file reads as NotFoundError (not NotReadableError/SnapshotState). It does **not** fix the *message text*; that text comes from Blink (S4). It also bounds C1: `Blob.text()` on a live file is a snapshot read; the spec's snapshot-state notion is unmeasured by C1 (limit 3 says `Blob.text()` once).

### S2 — DOM Standard (`https://dom.spec.whatwg.org/`, HTTP 200, 2718377 B, `397c2a43…`)
- §"isTrusted attribute" — *"isTrusted is a convenience that indicates whether an event is dispatched by the user agent (as opposed to using dispatchEvent())."*
- Event construction — *"When an event is created the attribute must be initialized to false."*
**Relation to C1: bounds the meaning of "trusted" (limit 3) but does not decide any leg.** It is the normative reason the *injected-script* payload arms (PLAB/PLB/PLLB) can only be untrusted — see S8, where the payload path dispatches `new Event(...)` from page script.

### S3 — UI Events (`https://w3c.github.io/uievents/`, HTTP 200, 919628 B, `d8936ca2…`)
Opened; §2.2 index lists `isTrusted attribute` and "Trusted event target types". **Relation to C1: neutral** — no file-upload-specific text; cited only to show the trusted-event vocabulary was checked at the source.

### S4 — Blink `file_error.cc` @ `155.0.8059.84` (`https://raw.githubusercontent.com/chromium/chromium/155.0.8059.84/third_party/blink/renderer/core/fileapi/file_error.cc`, HTTP 200, 12165 B, `2b5ea556…`)
- lines 55-57 — *"A requested file or directory could not be found at the time an operation was processed."*
- lines 82-83 — `case FileErrorCode::kNotFoundErr: return DOMExceptionCode::kNotFoundError;`
**Relation to C1: supports PUR's exact message and error name.** This is the origin of the frozen string `"A requested file or directory could not be found at the time an operation was processed."` and of the name `NotFoundError`. The lane's staged copy (`.ufo/waves/round-98/sources/file_error.cc`) is byte-identical (same sha256).

### S5 — Blink `file_input_type.cc` @ `155.0.8059.84` (HTTP 200, 23415 B, `f96265db…`)
- `SetFilesAndDispatchEvents` (lines 465-481) — after `SetFiles(files)`: `GetElement().DispatchInputEvent(); GetElement().DispatchChangeEvent();`
- `SetFilesFromPaths` (lines 535-556) — `files.push_back(CreateFileChooserFileInfoNative(path));` → `FilesChosen(...)`.
**Relation to C1: supports the PUR mechanism.** The CDP `DOM.setFileInputFiles` path sets the file list and fires input+change as UA-generated events, so a *missing* path still yields a populated `#s` and both events — consistent with PUR's "resolves, `#s` = `[["tabi-r98-missing.txt", 0, "text/plain"]]`, trusted input/change". It explains why PUR does **not** fail at the client the way PLLM does.

### S6 — Blink `inspector_dom_agent.cc` @ `155.0.8059.84` (HTTP 200, 128010 B, `e7c983b4…`)
- `setFileInputFiles` (lines 1795-1817) — `To<HTMLInputElement>(node)->SetFilesFromPaths(paths);` then `protocol::Response::Success()`.
**Relation to C1: supports PUR.** The CDP call takes *paths*, never checks existence, and always answers Success — hence a Puppeteer `connect` upload of an absent path resolves rather than throwing.

### S7 — Blink `html_form_control_element_with_state.cc` @ `155.0.8059.84` (HTTP 200, 15699 B, `5667fd9c…`) and `node.cc` (HTTP 200, 144114 B, `1fa79358…`)
- `DispatchInputEvent()` (lines 334-339) — `Event* event = Event::CreateBubble(event_type_names::kInput); event->SetComposed(true); DispatchScopedEvent(*event);`
- `Node::DispatchScopedEvent` (`node.cc` line ~3379) — `event.SetTrusted(true);`
**Relation to C1: supports the trusted half of the path arms.** Blink marks the dispatched input/change **trusted** because it goes through `DispatchScopedEvent`. So PUA/PLA/PLL (path arms) are trusted by construction — but note this is Blink's dispatch of *its own* event, which is why the untrusted outcome of the payload arms (S8) is a genuine mode difference rather than a coincidence.

### S8 — Playwright `packages/injected/src/injectedScript.ts` @ `v1.65.0` (HTTP 200, 85112 B, `ff78c236…`)
- `setInputFiles` (lines 1009-1030) — `input.files = dt.files;` then `input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));` and `input.dispatchEvent(new Event('change', { bubbles: true }));`
**Relation to C1: supports the *untrusted* half of PLAB/PLB/PLLB.** The payload path constructs `new Event(...)` **in page script** and calls `dispatchEvent`. Per S2, a script-created event is initialized `isTrusted = false`, and `dispatchEvent` is explicitly the "as opposed to using dispatchEvent()" case in the DOM spec's own wording. So untrusted input/change for payload arms is a *structural* consequence of the payload mechanism, and the spec (S2) is what makes it so. This is the single most load-bearing source for C1's trusted/untrusted split: **it explains the split, and predicts it will hold for any future arm that goes through the injected path.**

### S9 — Playwright `server/dom.ts` @ `v1.65.0` (HTTP 200, 49422 B, `65cb43c9…`) — the lane's S240, re-fetched
- `_setInputFiles` (lines 768-788) — path branch: `fs.promises.access(localPath, fs.constants.F_OK)` then `this._page.delegate.setInputFilePaths(...)`; payload branch (lines 785-788): `injected.setInputFiles(node, files), filePayloads!`.
**Relation to C1: supports both halves and supplies the *exact* PLLM error site.** The path branch's existence check is `fs.promises.access`, whose Node message is `ENOENT: no such file or directory, access '<path>'` — **not** `stat`. The frozen PLLM message says `stat '<missingPath>'`. `stat` is what `fs.promises.stat` produces, and the client-side `resolvePathsAndDirectoryForInputFiles` (`client/elementHandle.ts` line 267) calls `await fs.promises.stat(item as string)` **before** any server call. So the frozen PLLM string identifies the **client-side** stat as the failure site, not the server-side `access` — i.e. the ENOENT happens in the driver's own process, in `convertInputFiles`, before `isLocal`/`isClientCollocatedWithServer` is consulted. (Locally verified Node wording: `stat` → `ENOENT: no such file or directory, stat '<p>'`; `access` → `… access '<p>'`; `readFile` → `… open '<p>'`.) **This is a nuance for the next rounds: the frozen wording is consistent with the client-side site, but it does not by itself prove the `isLocal` branch was exercised, because the client stat precedes that branch entirely.**

### S10 — Playwright `server/fileUploadUtils.ts` @ `v1.65.0` (HTTP 200, 3437 B, `96dd5ef0…`) — the lane's S238, re-fetched
- `prepareFilesForUpload` — `if (localPaths && !frame.attribution.playwright.options.isClientCollocatedWithServer) throw new Error('localPaths are not allowed when the client is not local');`; `if (!frame._page.browserContext._browser._isBrowserCollocatedWithServer)` → read paths into buffers.
**Relation to C1: bounds PLLM/PLB/PLLB.** The payload arms do not use `localPaths`, so the "not local" throw cannot fire for them. The `isLocal` distinction (S11) flips `_isBrowserCollocatedWithServer`, which changes *path* arms only. C1's PLLM is a *path* arm with an absent path, so its ENOENT (S9) precedes any collocation logic.

### S11 — Playwright `server/chromium/chromium.ts` @ `v1.65.0` (HTTP 200, 24127 B, `59286d44…`) — the lane's staged copy, re-fetched
- lines 162-163 — `if (!options.isLocal) browser._isBrowserCollocatedWithServer = false;`
**Relation to C1: supports that `isLocal` is a real, separate switch** for connectOverCDP (PLB default vs PLLB/PLL isLocal), and therefore that PLB and PLLB differ in more than wording.

### S12 — Playwright `server/chromium/crPage.ts` @ `v1.65.0` (HTTP 200, 59431 B, `918f0f9b…`)
- `setInputFilePaths` (lines 343-352) — `parentSession._client.send('DOM.setFileInputFiles', { objectId: handle._objectId, files })`.
**Relation to C1: closes the loop for PLA/PLL/PUA.** Playwright's path arms reach Blink's `SetFilesFromPaths` (S5) over CDP, so they inherit Blink's `DispatchScopedEvent` → `SetTrusted(true)` (S7). Combined with S8, this fully explains C1's trusted-vs-untrusted partition by arm.

### S13 — Playwright `client/elementHandle.ts` @ `v1.65.0` (HTTP 200, 15091 B, `b5e6046e…`)
- `convertInputFiles` (line 282 ff.) and `resolvePathsAndDirectoryForInputFiles` (line 267) — `const stat = await fs.promises.stat(item as string);`
- `filePayloadExceedsSizeLimit` → `'Cannot set buffer larger than 50Mb, please write it to a file and pass its path instead.'`
**Relation to C1: supports the `stat` site in the frozen PLLM message (see S9) and bounds limit 4's 50 MB statement.** Payload objects over 50 MB are rejected client-side before any browser work.

### S14 — Playwright docs: `locator.setInputFiles` (`https://playwright.dev/docs/api/class-locator#locator-set-input-files`, HTTP 200, 572368 B, `f9138a48…`)
- Usage "Upload buffer from memory": `await page.getByLabel('Upload file').setInputFiles({ name: 'file.txt', mimeType: 'text/plain', buffer: Buffer.from('this is test') });`
- Argument shape: `files string | Array<string> | Object | Array<Object>`, fields `name`, `mimeType`, `buffer`.
- Details: *"Sets the value of the file input to these file paths or files."*
**Relation to C1: supports that a `{name, mimeType, buffer}` payload object is the documented public API** for PLAB/PLB/PLLB, and that the three fields C1 uses are exactly the documented ones. It does **not** mention `isTrusted` — the docs are silent on trust, which is why S2/S8 are the load-bearing evidence.

### S15 — Playwright docs: `browserType.launch` and `connectOverCDP` (`https://playwright.dev/docs/api/class-browsertype#browser-type-launch` and `#browser-type-connect-over-cdp`, HTTP 200, 168208 B, `f47b9fe3…`; same document)
- `launch` `headless boolean (optional)` — *"Whether to run browser in headless mode… Defaults to true."*; `executablePath string (optional)` — *"Path to a browser executable to run instead of the bundled one."*
- `connectOverCDP` `isLocal boolean (optional) Added in: v1.58` — *"Tells Playwright that it runs on the same host as the CDP server. It will enable certain optimizations that rely upon the file system being the same between Playwright and the Browser."*
**Relation to C1: supports the PLA/PLAB launch wording and the PLB/PLLB/PLL isLocal axis.** The doc's own framing of `isLocal` is *filesystem sharing*, which is exactly the property C1's PLLM leg is built around — but the doc does not promise any particular outcome for an absent path, so it cannot support the PLLM error text on its own (S9/S13 do).

### S16 — Puppeteer `launch` options (`https://pptr.dev/api/puppeteer.launchoptions`, HTTP 200, 80535 B, `50dc5b2e…`)
- `headless optional boolean | 'shell'` — *"Whether to run the browser in headless mode."* Remarks: *"true launches the browser in the new headless mode. 'shell' launches shell known as the old headless mode."*
- `executablePath optional string` — *"Path to a browser executable to use instead of the bundled browser."*
**Relation to C1: supports limit 1's headless wording and PUA's `executablePath: '/usr/bin/chromium'`.** Note the docs' `boolean | 'shell'` shape is why the lane's staged `ChromeLauncher.ts` (lines 278-281: `headless === 'shell' ? '--headless' : '--headless=new'`) is the right place to read what Puppeteer actually passes — the doc alone does not pin the flag.

### S17 — Puppeteer `ElementHandle.uploadFile` (`https://pptr.dev/api/puppeteer.elementhandle.uploadfile`, HTTP 200, 36863 B, `a423b9d3…`)
- Remarks — *"This will not validate whether the file paths exists. Also, if a path is relative, then it is resolved against the current working directory. For locals script connecting to remote chrome environments, paths must be absolute."*
**Relation to C1: directly supports the PUR leg.** The documented non-validation is why Puppeteer's absent-path upload *resolves* (no client-side throw) and produces a populated-but-empty file list, in contrast to Playwright's client-side `stat` throw (S13). It also supports the frozen requirement that the PUR path be **absolute**.

### S18 — Puppeteer `cdp/ElementHandle.ts` @ `puppeteer-v25.16.0` (HTTP 200, 6124 B, `c86ed958…`) and `api/ElementHandle.ts` (HTTP 200, 51267 B, `50b86666…`)
- `uploadFile` (cdp, lines 104-165) — after the zero-length special case, `this.client.send('DOM.setFileInputFiles', { objectId: this.id, files, backendNodeId })`.
- The zero-length branch (lines 133-152) evaluates `element.files = new DataTransfer().files;` and dispatches `new Event('input'/'change')` **in page script**, with the source comment *"XXX: These events should converted to trusted events. Perhaps do this in `DOM.setFileInputFiles`?"*
**Relation to C1: supports PUR (non-empty path list → CDP → Blink's trusted dispatch) and *bounds* the claim for a clear/empty-path arm.** If a future round exercises Puppeteer's zero-file path, the events are page-script `new Event(...)` — i.e. **untrusted** by S2, and the source itself flags that mismatch. C1 does not measure it (limit 4 excludes Puppeteer's clear path, r97 PUC), so this is a forward-looking bound, not a contradiction.

### S19 — Chromium `net/base/mime_util.cc` @ `155.0.8059.84` (HTTP 200, 38984 B, `384b2564…`)
- line 258 — `{"text/plain", "txt,text"},`
**Relation to C1: supports the `text/plain` type** C1 expects on `tabi-r98-answer.txt`, `tabi-r98-payload.txt`, `tabi-r98-missing.txt` (all `.txt`). The MIME type of the *absent* PUR entry therefore comes from the extension, not from any sniffing of content — which is consistent with the frozen "0 bytes, text/plain" entry.

### S20 — GitHub issues opened (each HTTP 200; body quotes below are verbatim)
- **puppeteer/puppeteer#4405** *"uploadFile doesn't work with puppeteer.connect"* (closed 2022-06-09) — *"Currently when used `inputElement.uploadFile` via `puppeteer.connect`, it uploads an empty file, as it doesn't exist on host machine."* **Relation: supports PUR.** A long-standing report that `connect` + `uploadFile` of a path absent on the host yields an empty upload rather than an error — the same class of behaviour C1 freezes for PUR, though that issue predates and does not mention the current CDP path.
- **puppeteer/puppeteer#1042** *"elementHandle.uploadFile() emit 'change' event with 0-size blob object"* (closed 2018-01-12) — *"File(0)"* with `name: 'image0.png'`. **Relation: supports the "0-size entry that still fires change" shape** C1 freezes for PUR.
- **puppeteer/puppeteer#5776** *"uploadFile fails because file.type is an empty string"* (closed 2020-04-29) — *"A frontend check on the input element… relies on `files[0].type`, but it seems that `file.type` is always an empty string."* **Relation: bounds C1.** This is direct historical evidence that `file.type` after a Puppeteer upload has been empty-string in the past; C1's frozen `text/plain` is an observation on *this* build and mode, not a documented guarantee. Treat `file.type` as the most fragile field in the frozen receipt.
- **puppeteer/puppeteer#5499** *"uploadFile uploads empty file"* (closed 2020-04-17) — *"It shows correct filename and correct file size, but preview is empty image"*. **Relation: supports PUR's "correct name, wrong bytes" shape.**
- **microsoft/playwright#17319** *"File paths are not set in the `<input>` 'files' property when using setInputFiles"* (closed 2022-09-14) — **Relation: bounds C1** — the `files` list after `setInputFiles` has historically been empty in some configurations; the frozen `#s` list is again a per-build observation.
- **microsoft/playwright#18534** *"ENOENT: no such file or directory, when attempting to upload a file with playwright"* (closed 2022-11-04) — **Relation: supports PLLM's error class** and is the same `ENOENT` family C1 freezes, though this issue is about a wrong *path*, not an absent file.
- **microsoft/playwright#43367** *"Directory setInputFiles can miss its input event and time out after native selection completes"* (closed 2026-10-14) — *"Passive observation found one trusted `input` event and one `change` event."* **Relation: supports the trusted-event observation** for Playwright path arms, and **bounds** the round: it shows the input event can be missed in directory-upload cases (a mode C1 does not measure — limit 4, one file per call).
- **microsoft/playwright#38614** *"feat(api): expose connectOverCDP({ isLocal })"* (closed) and **#41202** *"fix(download): deny downloads when the browser is not collocated with the server"* (closed) — the latter body: *"`_isBrowserCollocatedWithServer` is now passed via `BrowserOptions` (set before contexts initialize)"*. **Relation: supports S11** and confirms `isLocal` is an established, meaningful API switch.
- **puppeteer/puppeteer#1376** *"Support Drag-and-Drop"* — the only `uploadFile`+`isTrusted` search hit in the Puppeteer tracker; body concerns drag-and-drop. **Relation: neutral.**
- Searches that returned **no** issue about `isTrusted` being false from `setInputFiles` payloads: `repo:microsoft/playwright setInputFiles isTrusted` (1 hit, #43367, unrelated to payloads), `repo:microsoft/playwright isTrusted in:title,body` (8 hits, none about payloads), `repo:puppeteer/puppeteer uploadFile isTrusted` (1 hit, #1376). **Gap: no upstream issue documents the payload-mode untrusted outcome; S2+S8 are the only primary evidence for it.**

### S21 — Chrome headless blog (`https://developer.chrome.com/blog/chrome-headless-shell`, HTTP 200, 179741 B, `ef4c793a…`)
- *"Starting with Chrome version 112, Chrome's new Headless mode ( --headless=new ) is available."* and *"'shell' launches shell known as the old headless mode."* **Relation: supports limit 1's headless wording** and confirms `--headless=new` (the lane's S242, `ChromeLauncher.ts` line 280) is the new-headless mode on a 155 build.

## What these sources do and do not settle for C1

**Supported by primary sources (mechanism-level, independent of any run):**
1. The trusted/untrusted split is *structural*, not incidental: path arms reach Blink's `SetFilesFromPaths` → `DispatchInputEvent` → `Node::DispatchScopedEvent` → `SetTrusted(true)` (S5, S6, S7, S12); payload arms dispatch `new Event(...)` from page script (S8), which the DOM spec initializes `isTrusted = false` (S2). C1's PLAB/PLB/PLLB untrusted and PUA/PLA/PLL trusted partition follows from the mechanism.
2. Puppeteer's absent-path upload *resolves* and yields a 0-size, correctly-named entry (S17, S18, S5), and reading it fails with `NotFoundError` (S1, S4).
3. Playwright's absent-path upload *throws* before any browser work (S13 → S9), and the frozen `stat '<missingPath>'` string pins that failure to the **client-side** stat, since the server-side check would say `access` (S9).

**Not settled by any source opened here (genuine gaps):**
1. ~~**Whether the PLLM leg's ENOENT was produced on the client or the server.**~~ **Resolved within the wave by a sibling seat, not by me.** My source reading (S9 + S13) predicted the failure site is the *client-side* `fs.promises.stat` in `resolvePathsAndDirectoryForInputFiles`, because the server-side check would say `access`. The sibling seat R98Scribe captured the stack for the absent-path call in two modes (`w1/R98Scribe-enoent-origin.txt`, `w1/R98Scribe-enoent-origin-default.txt`): `Error: ENOENT: no such file or directory, stat '<path>'` with frames `async Object.stat (node:internal/fs/promises)` → `resolvePathsAndDirectoryForInputFiles` → `convertInputFiles` → `_Frame.setInputFiles` → `_Locator.setInputFiles`. **So the frozen `stat '<missingPath>'` wording is exactly right and points at the client site — it is not the server-side `access` path.** (Cited as a sibling artifact; I ran no driver.) Corollary worth carrying forward: because the client stat precedes every collocation check, the PLLM arm's outcome **cannot** discriminate `isLocal: true` from `isLocal: false` — it fails before that branch is consulted (S10, S11).
2. **Whether `connectOverCDP` default (PLB) vs `isLocal: true` (PLLB) could ever differ for a *payload* arm.** By construction (S10) payload arms never touch `localPaths`, and `isLocal` only flips `_isBrowserCollocatedWithServer` (S11), which governs the *path* branch. So PLB and PLLB are expected to be behaviourally identical for payloads. The round measures them as separate arms anyway — defensible as a coverage hedge, but the sources suggest the pair carries little discriminating power, and a *path* arm under each would be the informative contrast. **Next-round lead.**
3. **Whether `files[0].type` and the `files` list contents are stable properties** of these APIs. S20 (#5776, #17319) shows both have historically been wrong/empty in other configurations. C1's frozen expectations are correct observations for this build, but the *specification-grade* durability of `type` and of the list contents is not established by any source found here.
4. **Puppeteer's zero-file (clear) path.** Per S18 it dispatches page-script events (untrusted), with an upstream comment saying they *should* be trusted. Not measured in C1 (limit 4) and excluded from the claim — a clean candidate for a later round.
5. **The 50 MB payload ceiling** (S13) is documented for payload objects; the plan's limit 4 lists "the 50 MB limit" as unmeasured. The docs do not state it; only the source does.

## Refresh / coverage notes for the next rounds
- The Playwright source set that bears on upload behaviour is small and fully located: `client/elementHandle.ts`, `client/frame.ts`, `client/locator.ts`, `server/dom.ts`, `server/fileUploadUtils.ts`, `server/chromium/chromium.ts`, `server/chromium/crPage.ts`, `packages/injected/src/injectedScript.ts`. All were fetched at tag `v1.65.0`; note the injected script lives under `packages/injected/`, **not** `packages/playwright-core/src/server/injected/` (the latter 404s) — worth recording so the next round does not repeat the miss.
- Playwright's `isLocal` doc wording ties the flag to *filesystem sharing*; that is the property an absent-path arm actually probes, and it is why PLLM is the natural `isLocal` probe.
- The upstream issue trackers contain **no** report of `isTrusted === false` from `setInputFiles` payload objects. Any round wanting upstream corroboration for that outcome will not find it; the DOM spec + injected script are the primary basis.

## Tooling
No tools installed, upgraded, or removed this seat. Node v24.21.0 and `curl`/`sha256sum` (present on PATH) were used read-only; no `pacman`/`uv`/`npm` transaction was run, so no install record is owed.

## Remaining unknowns
1. ~~Client-vs-server site of PLLM's ENOENT~~ — resolved in-wave by R98Scribe's stack capture: the client-side `fs.promises.stat` (see §"Not settled" #1).
2. Whether PLB/PLLB can differ at all for payload arms (§"Not settled" #2) — sources say probably not.
3. Durability of `file.type` and `files` list contents across builds (S20 #5776, #17319).

VERDICT C1: neutral
