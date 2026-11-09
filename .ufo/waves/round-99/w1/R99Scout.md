# R99Scout — round 99, wave w1, source reconnaissance for C1

Seat: R99Scout (leaf; source recon only — no `--live` run of the driver was performed by this seat).
Scope: primary sources bearing on C1 (`client-oopif-uploadsets-linux`, predicate C1-CLIENT-OOPIF-UPLOADSETS-R99)
and on the next rounds' unmeasured space.
Access date for every source below: **2026-11-09** (host clock, `-03:00`). HTTP status and sha256 of every
fetched body are in `R99Scout-fetch-evidence.txt` (same directory). "supports" = the source states or implies
the frozen sentence's behaviour; "bounds" = it restricts a generalisation but is consistent with the sentence;
"contradicts" = it conflicts with the frozen sentence as written.

## 1. Sources opened (primary, with located quotes)

| # | source (URL) | status | located quote (≤25 words) | bearing on C1 |
|---|---|---|---|---|
| S1 | WHATWG HTML LS §4.10.5.1.17 File Upload state — https://html.spec.whatwg.org/multipage/input.html | 200 | "Unless the multiple attribute is set, there must be no more than one file in the list of selected files." | supports (the UA-level single-file rule is a state constraint, not a client API contract) |
| S1 | WHATWG HTML LS §4.10.5.4 Common input element APIs (`input.files` setter) — same URL | 200 | "On setting, it must run these steps: If the IDL attribute does not apply or the given value is null, then return." | bounds: the setter text itself carries **no** multiple check; the constraint lives only in the File Upload state prose |
| S2 | Playwright docs, `Locator.setInputFiles` — https://playwright.dev/docs/api/class-locator | 200 | "Upload file or multiple files into `<input type=file>`. For inputs with a `[webkitdirectory]` attribute, only a single directory path is supported." | supports (arrays and object payloads are documented API surface) |
| S3 | Puppeteer docs, `ElementHandle.uploadFile` — https://pptr.dev/api/puppeteer.elementhandle.uploadfile | 200 | "This will not validate whether the file paths exists. Also, if a path is relative, then it is resolved against the current working directory." | supports PUAM (absent path reaches the browser; no client-side existence check) |
| S4 | CDP DOM domain — https://chromedevtools.github.io/devtools-protocol/tot/DOM/ | 200 | (body is a JavaScript redirect stub; no command text inline) | bounds: the rendered page carries no normative text — use S5/S23 |
| S5 | CDP `DOM.setFileInputFiles` — https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/DOM.pdl | 200 | "Sets files for the given file input element." / parameter `array of string files` — "Array of file paths to set." | supports: CDP carries **paths only** (no mimeType, no bytes) — payload arms cannot be CDP-level |
| S6 | Playwright v1.65.0 `server/dom.ts` L756-757 — https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/dom.ts | 200 | "if (multiple && !inputElement.multiple && !inputElement.webkitdirectory) throw injected.createStacklessError('Non-multiple file input can only accept single file');" | supports PLBN exactly (message string + refusal before any file set) |
| S7 | Playwright v1.65.0 `server/fileUploadUtils.ts` L80 — …/packages/playwright-core/src/server/fileUploadUtils.ts | 200 | "mimeType: payload.mimeType || mime.getType(payload.name) \|\| 'application/octet-stream'," | supports PLBX (`image/png` for `.png`) and PLBM p2 (`application/octet-stream` for `.tabi99`) |
| S8 | Playwright v1.65.0 `packages/injected/src/injectedScript.ts` L1009-1030 | 200 | "input.files = dt.files; input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));" | supports the **untrusted** input/change of PLBX/PLBM (script-dispatched events) |
| S9 | Playwright v1.65.0 `client/elementHandle.ts` L263-280 — …/packages/playwright-core/src/client/elementHandle.ts | 200 | "const stat = await fs.promises.stat(item as string);" | supports PLAM: the ENOENT `stat` error is raised **client-side**, before any browser call |
| S10 | Puppeteer v25.16.0 `cdp/ElementHandle.ts` L110-116 — …/packages/puppeteer-core/src/cdp/ElementHandle.ts | 200 | "assert(files.length <= 1 \|\| isMultiple, 'Multiple file uploads only work with <input type=file multiple>',);" | supports PUCN exactly (and the assert precedes every CDP call) |
| S11 | Puppeteer v25.16.0 `util/assert.ts` L18-20 | 200 | "throw new Error(message);" | supports PUCN error **name** `Error` (plain `Error`, not a subclass) |
| S12 | mime v4.1.0 `types/standard.ts` L283 — https://raw.githubusercontent.com/broofa/mime/v4.1.0/types/standard.ts | 200 | "'image/png': ['png']," | supports S238/S246 name→type table used by Playwright payloads |
| S13 | mime v4.1.0 `src/Mime.ts` L87 | 200 | "return this.#extensionToType.get(ext) ?? null;" | supports: unregistered extension ⇒ `null` ⇒ `application/octet-stream` fallback (S7) |
| S14 | W3C File API ED (12 Sep 2026) §7.1 — https://w3c.github.io/FileAPI/ | 200 | "A failure reason is one of NotFound, UnsafeFile, TooManyReads, SnapshotState, or FileLock." | supports the NotFound failure reason family of the PUAM read errors |
| S14 | W3C File API ED §1 | 200 | "User agents must process reads on files that no longer exist at the time of read as errors" | supports PUAM: a vanished backing file ⇒ read error, not empty bytes |
| S15 | Blink `core/html/forms/file_input_type.cc` L533-553 — https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/html/forms/file_input_type.cc | 200 | "if (input.FastHasAttribute(html_names::kMultipleAttr)) { FilesChosen(...); } else { first_file_only.push_back(std::move(files[0]));" | supports: the CDP path **silently truncates** to the first file on a non-multiple input |
| S16 | Blink `core/inspector/inspector_dom_agent.cc` L1798-1820 | 200 | "To<HTMLInputElement>(node)->SetFilesFromPaths(paths);" | supports: `DOM.setFileInputFiles` = Blink `SetFilesFromPaths` (no existence check) |
| S17 | Blink `core/fileapi/file_error.cc` L56-57 | 200 | "A requested file or directory could not be found at the time an operation was processed." | supports PUAM read-error text **verbatim** (Blink `kNotFoundErrorMessage`) |
| S18 | Blink `core/fileapi/file.cc` L52-84 (`GetContentTypeFromFileName`) | 200 | "return MIMETypeRegistry::GetMIMETypeForExtension(extension);" | supports: type of a path-set file comes from the extension, via the platform registry |
| S25 | Chromium `net/base/mime_util.cc` L190/L263 — …/net/base/mime_util.cc | 200 | "{\"text/plain\", \"txt,text\"}," | supports PLLP/PUCM `text/plain` for `.txt` (Chromium's own table, independent of mime 4.1.0) |
| S26 | Chromium `net/base/mime_util.cc` L176-218 — same file | 200 | "{\"text/javascript\", \"js,mjs\"}," | bounds (see §3 divergence lead) |
| GH | Puppeteer #5443 "how to get the correct file type in the input event" — https://github.com/puppeteer/puppeteer/issues/5443 | 200 | "forget pass the file type when new a File instance" (workaround sets `{ type: item.mimeType }`) | bounds: long-standing Puppeteer issue that path-set files carry no client-chosen type — supports limit 4's "two names only" |
| GH | Puppeteer #5543 "[BUG] Filetype is not detected on setInputFiles" — https://github.com/puppeteer/puppeteer/issues/5543 | 200 | "Actual file: { name: 'avatar.jpg', type: 'application/octet-stream', … }" | bounds: type is a browser/extension artifact, not a Puppeteer API parameter |
| GH | Puppeteer #5247 "should elementHandle.uploadFile accept buffer?" — https://github.com/puppeteer/puppeteer/issues/5247 | 200 | "Shouldn't elementHandle.uploadFile accept buffer or an array of objects like `{ name: String, content: Buffer, mimeType: String }`?" | bounds: payload upload was a *request*, absent in v25.16.0 (see §3) |
| GH | Puppeteer PR #15032 "feat(ElementHandle): support FilePayload buffers in uploadFile" — https://github.com/puppeteer/puppeteer/pull/15032 | 200 | "Closed" — "Multiple buffer uploads for `<input multiple>`." (listed as added tests) | bounds: closed **unmerged** ⇒ v25.16.0 Puppeteer has no payload arm at all |
| GH | Playwright #6854 "[Feature] Folder uploads" — https://github.com/microsoft/playwright/issues/6854 | 200 | "fileChooser.setFiles: elementHandle.setInputFiles: EISDIR: illegal operation on a directory, read" | bounds: folders/directories remain an error path (limit 4) |
| GH | Playwright #16846 "[BUG] webkitRelativePath is empty when using setInputFiles" — https://github.com/microsoft/playwright/issues/16846 | 200 | "I get this from the File.webkitRelativePath read only attribute. The problem is that when using setInputFiles that attribute seems to be an empty string." | bounds: directory-upload metadata is a known gap (limit 4) |
| GH | Playwright #10075 "[BUG] Can not upload files(.pdf, .png) into Outlook in headless mode. Error code 400" | 200 | "I was able to successfully load the files in visible mode … able to load the files using puppeteer in headless mode" | bounds: server-side type inference can reject an upload (type is observable downstream) |
| GH | Playwright #34300 "Issue with uploading file on a web browser while running test on an Azure pipeline" | 200 | "the test does not give any error, but the file also does not get uploaded" | bounds: silent non-upload exists in the wild — supports the counter's exactness on events/files |
| GH | Playwright #35172 "Node is not an HTMLInputElement (from 1.49.1 -> 1.50) on role=\"button\"" | 200 | "since version 1.50.0 it now throws \"Error: Node is not an HTMLInputElement\"" | bounds: locator-retargeting errors are version-sensitive — the 1.65.0 pin matters |

## 2. What the sources say about C1's mechanism (no contradiction found)

* **Trusted vs untrusted asymmetry (PLBX/PLBM untrusted; PLLP/PUCM/PUAM trusted).** Two different mechanisms are visible
  in source: the payload route ends in `injected.setInputFiles` → `input.dispatchEvent(new Event(...))` inside the
  page (S8) ⇒ `isTrusted === false`; the path route ends in Blink's `DOM.setFileInputFiles` → `SetFilesFromPaths`
  → `FilesChosen` → `SetFilesAndDispatchEvents` → `DispatchInputEvent`/`DispatchChangeEvent` (S15, S16) ⇒ UA-dispatched,
  `isTrusted === true`. C1's trusted/untrusted split per arm is exactly this split.
* **PLBN / PUCN refusals are library-level, not browser-level.** Playwright refuses in a utility-world evaluate
  before touching files (S6); Puppeteer refuses by assertion before any CDP command (S10, S11). Chromium itself
  would not have refused: the CDP path truncates to `files[0]` (S15) and the DOM `files` setter has no multiple
  check (S18 + S1 setter text). C1's declared limit 5 ("the mechanism is the sources' account"; "refused before any
  file is set is read from the outcome") is therefore correct and is *not* narrowed by the spec.
* **PUAM (absent path) is explained end to end.** Puppeteer does not stat the path (S3) ⇒ Blink accepts the path
  (S16) ⇒ a `File` is created for a non-existent backing file ⇒ size 0 and type from the extension (`text/plain`,
  S18/S25) ⇒ both read methods fail with Blink's `kNotFoundErrorMessage` (S17), which the File API ED frames as the
  `NotFound` failure reason for a file that no longer exists (S14). The claim's expected read text is Blink's, verbatim.
* **PLAM's error string** is Node's `fs.stat` ENOENT raised in the Playwright **client** (S9) before the browser is
  contacted — so "nothing set, no event" is structurally guaranteed, not merely observed.
* **MIME expectations** are reproducible from two independent tables: Playwright payloads use mime 4.1.0
  (`.png`→`image/png`, `.tabi99`→`null`→`application/octet-stream`, S7/S12/S13; verified locally: `mime.getType`
  returns `image/png`/`null`/`text/plain` for those names); path-set files use Chromium's own table
  (`.txt`→`text/plain`, S25). mime 4.1.0 is pinned by Playwright's root `package.json` L144 (S21).

## 3. Leads for the next rounds (unmeasured space, source-backed)

1. **Chromium's DOM `files` setter does not enforce `multiple`** (S18, and S1's setter text has no check), while
   the CDP path truncates to one file (S15). A page-level assignment of two `File`s to the non-multiple `#s` is
   therefore a *distinct* behaviour from every arm C1 measures — a natural r100 arm ("two files set on `#s` without a
   client-side guard"), and it would test the browser, not the libraries.
2. **Two different name→type tables are in play** (mime 4.1.0 for Playwright payloads, Chromium
   `mime_util`/`MIMETypeRegistry` for path-set files). They already diverge: `.markdown` → `text/markdown` in
   mime 4.1.0 (S12 L328) but only `.md` maps in Chromium (S26 L218) ⇒ a `.markdown` path would land `text/markdown`
   via payload and empty via path. Also `MIMETypeRegistry::GetMIMETypeForExtension` consults the OS registry while
   `GetWellKnownMimeTypeForExtension` does not (S18 L52-64) ⇒ registry-dependent typing is a fresh lever.
3. **Puppeteer v25.16.0 has no payload arm**: PR #15032 (FilePayload buffers in `uploadFile`) is **closed, unmerged**
   (GH row) ⇒ the Puppeteer arms of C1 can only ever be path arms on this pin; a later Puppeteer release would add a
   payload route and change the coverage surface.
4. **Collocation-dependent behaviour is a real fork**: Playwright's `isLocal` decides whether paths are forwarded to
   the browser or read into buffers in the server (`fileUploadUtils.ts` L66: "Cannot transfer files larger than 50Mb
   to a browser not co-located with the server"; `fileUploadSizeLimit = 50 * 1024 * 1024`, L29). PLLP (`isLocal:true`)
   vs PLBX/PLBM/PLBN (no `isLocal`) already straddle it; a 50 MB-boundary arm is unmeasured (limit 4).
5. **Folders/`webkitdirectory`** stay an error path in both libraries (S6 L758-761, GH #6854) and
   `webkitRelativePath` is empty under `setInputFiles` (GH #16846) — matches limit 4's exclusion, and is the obvious
   next capability to price.
6. **Freshness:** playwright-core `latest` = 1.65.0 and puppeteer-core `latest` = 25.16.0 (npm), so both pins are the
   current releases; the two refusal strings are byte-identical on each project's `main` branch (dom.ts
   sha256 `65cb43c9…` and ElementHandle.ts sha256 `c86ed958…` on `main` = the pinned tags). One drift note: npm
   `mime` `latest` is 4.1.2 while Playwright pins **4.1.0**, so the payload type table is one patch behind npm.

## 4. Gaps / limits of this seat's evidence

* No `--live` run of the pinned driver was executed here, so **no leg-level statement of C1 is confirmed or refuted
  by this seat**; the verdict below is about source-level consistency only.
* The `chromedevtools.github.io/devtools-protocol/tot/DOM/` page (S4) renders no command text (JS redirect); the
  normative CDP text used here is the `pdl/domains/DOM.pdl` + `json/browser_protocol.json` copies (S5, S23).
* GitHub REST API rate-limited (HTTP 403) after ~10 calls; the issue bodies quoted above come from the HTML pages
  fetched with HTTP 200 (see evidence file), and metadata (state/dates) came from the earlier REST responses.
* `mime` 4.1.2 was **not** fetched or executed (not needed; only the pinned 4.1.0 table was checked).
* The WHATWG `files` setter's `[FILEAPI]` cross-reference target is not present in the current File API ED (no
  "set the selected files" text there) — [INFERENCE] the single-file constraint is now stated only in the HTML File
  Upload state prose, so the setter's own normative steps carry no multiple check.

Tooling: no packages were installed system-wide; `npm pack playwright-core@1.65.0` and `npm install mime@4.1.0`
were installed **into my scratch only** (`/fast/scratch/hyaku/tabi-r99/R99Scout/`, removed at hand-off) to read
vendored sources and to execute the mime table check. No `pacman`/`sudo`/host-service changes; no Chromium was
launched (only `chromium --version`); no git/jj mutation, no commits, no subagents.

VERDICT C1: neutral
