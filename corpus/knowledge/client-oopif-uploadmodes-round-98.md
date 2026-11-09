---
source: S240 (Playwright `packages/playwright-core/src/server/dom.ts` at tag v1.65.0 — `_setInputFiles` sends local paths to `this._page.delegate.setInputFilePaths(…)` (lines 768, 779) and everything else to `injected.setInputFiles(node, files)` with `filePayloads` (lines 786-787)); S238 (Playwright `fileUploadUtils.ts` v1.65.0 line 62 — paths become payloads only when the browser is not collocated with the server); S241 (Blink `file_error.cc` at tag 155.0.8059.84 lines 55-57 — `kNotFoundErrorMessage`); S243 (Playwright `browser.ts` v1.65.0 line 86 — `_isBrowserCollocatedWithServer` defaults to `true`; added after the wave); S242 (Puppeteer `ChromeLauncher.ts` at tag puppeteer-v25.16.0 — lines 90-93 keep a caller's `--remote-debugging-*` argument, lines 278-280 `--headless=new` for `headless: true`)
verified-at: 2026-11-09 (round 98, Linux host, Chromium 155.0.8059.84, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-98/scored/c1-live.json`, nonce `tabi-r98-live-044424c8b981`, verdict `clean`, 256 checks, 0 findings, measured revision `b92b161d`)
recheck: `node scripts/check-client-oopif-uploadmodes-round98.mjs --lane <ABS lane> --expect-driver-sha256 f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2 --receipt corpus/evidence/round98/client-oopif-uploadmodes/receipt.json --expect-nonce tabi-r98-live-044424c8b981 --json` → exit 0 (receipt mode: forgeable by a whole consistent receipt; the claim's command is `--live`, see `plans/round-98.md` §Counting command)
---

# Upload modes into a cross-site iframe: Playwright's event trust follows what you pass (path vs payload object), not how you got the browser; a page reading Puppeteer's absent-path phantom gets `NotFoundError`

Capability `client-oopif-uploadmodes-linux` (new, first-working round 98). Round 97 measured both clients'
direct-set upload into a cross-site (out-of-process) iframe with paths only, on browsers the runner started
and the clients attached to. Round 98 adds browsers the client launches itself, Playwright payload objects,
a Playwright `isLocal` call with an absent path, what lands in the input (name, size, type, bytes) and what
reading Puppeteer's phantom entry gives the page.

## The law (24/24 legs, 3 reps × PUA, PLA, PLAB, PLB, PLLB, PLL, PLLM, PUR)

*Measured*, each leg in its own browser (24 distinct browser ids), on a cross-site (`localhost` under
`127.0.0.1`) child frame's `<input type=file id=s>` whose own `input`/`change`/`click` listeners record
`[type, isTrusted]`; after the call and a 400 ms settle the driver reads `#s.files` as `[name, size, type]`,
then `files[0].text()` when there is exactly one file:

| arm | how the browser was obtained | what was passed | `#s.files` | `#s` saw | read |
|---|---|---|---|---|---|
| PUA ×3 | Puppeteer `launch({executablePath, headless: true})` | answer path | `[["tabi-r98-answer.txt", 22, "text/plain"]]` | `input` trusted, `change` trusted | the 22 answer bytes |
| PLA ×3 | Playwright `chromium.launch({executablePath, headless: true})` | answer path | same | trusted, trusted | answer bytes |
| PLL ×3 | runner-started, Playwright `connectOverCDP(url, {isLocal: true})` | answer path | same | trusted, trusted | answer bytes |
| PLAB ×3 | Playwright `chromium.launch` | payload `{name, mimeType: 'text/plain', buffer}` | `[["tabi-r98-payload.txt", 29, "text/plain"]]` | `input` **untrusted**, `change` **untrusted** | the 29 payload bytes |
| PLB ×3 | runner-started, `connectOverCDP(url)` | payload | same | untrusted, untrusted | payload bytes |
| PLLB ×3 | runner-started, `connectOverCDP(url, {isLocal: true})` | payload | same | untrusted, untrusted | payload bytes |
| PLLM ×3 | runner-started, `connectOverCDP(url, {isLocal: true})` | absent path | `[]` | nothing | — (`Error: ENOENT: no such file or directory, stat '<path>'`) |
| PUR ×3 | runner-started, Puppeteer `connect({browserURL})` | absent path | `[["tabi-r98-missing.txt", 0, "text/plain"]]` | trusted, trusted | rejects `NotFoundError`: "A requested file or directory could not be found at the time an operation was processed." |

Every leg: the parent page's own file input stays empty; the browser lists exactly one `iframe` target
(the child URL); the client lists frames `[parent, child]`; DevTools `Chrome/155.0.8059.84`. No leg
recorded a `click` on `#s`. Evidence: `corpus/evidence/round98/client-oopif-uploadmodes/receipt.json`
(sha256 `f69c5719…`), outcome classes in `.ufo/waves/round-98/scored/c1-live.json` (`trustedPath` 9,
`untrustedPayload` 9, `enoent` 3, `phantomUnreadable` 3).

## What a practitioner should take from it

1. With Playwright, trusted `input`/`change` on an upload need **both** a file path **and** a browser
   Playwright treats as collocated (launched, or `connectOverCDP` with `isLocal: true`). A payload object
   (`{name, mimeType, buffer}`) gives untrusted, script-dispatched events in every mode measured —
   launched, default `connectOverCDP` and `isLocal`. If the page under test filters on `isTrusted`, write
   the file to disk and pass its path.
2. The r97 untrusted pair on Playwright's default `connectOverCDP` is the same mechanism as a payload: the
   path is turned into a payload there (S238). It is not a property of `connectOverCDP` itself — `isLocal`
   paths and launched paths are trusted.
3. Puppeteer `launch` behaves like `connect` for `uploadFile` on a cross-site iframe input: trusted events,
   the file lands, its bytes read back.
4. Payload objects land as given: name, the passed `mimeType` as `File.type`, the exact bytes.
5. An absent path: Playwright with `isLocal: true` throws the same `ENOENT … stat '<path>'` as the default
   mode (r97 PLM) and leaves the input untouched. Puppeteer resolves and leaves a phantom entry (name, size
   0, `type` `text/plain`) with trusted events; the page only finds out when it reads
   it — `Blob.text()` rejects with `NotFoundError` and Blink's message (S241). A test that checks
   `files.length` after `uploadFile` cannot tell a missing file from an empty one; read it, or check the
   path exists before the call.

## Why (source account, not what the counter checks)

- S240: Playwright's server-side `_setInputFiles` has two branches. Local paths (or a directory) go to
  `this._page.delegate.setInputFilePaths(progress, retargeted, localPathsOrDirectory)` — on Chromium the
  `DOM.setFileInputFiles` path, whose events the browser dispatches (trusted). Otherwise the payloads go to
  `injected.setInputFiles(node, files)`, which builds a `DataTransfer` and dispatches `new Event('input')` /
  `new Event('change')` from page script (S239, r97) — untrusted by construction.
- S238: `prepareFilesForUpload` keeps `localPaths` only while `_isBrowserCollocatedWithServer` is true; a
  `connectOverCDP` without `isLocal` sets it false (chromium.ts v1.65.0 lines 162-163, r97), so paths are
  read into buffers and become payloads. A launched browser keeps the default (collocated): the field is
  initialised `true` on every server-side `Browser` (S243, browser.ts v1.65.0 line 86; added after the wave,
  R98Critic2 §3). Payloads passed
  by the caller are never turned back into paths.
- S242: Puppeteer's launcher adds no debugging port of its own when the caller passes
  `--remote-debugging-port=<cdp>`, and passes `--headless=new` for `headless: true`; the driver relies on
  the first to read `/json/version` and targets on launch legs. (Playwright's launcher passes `--headless`
  for `headless: true`, chromium.ts lines 377-378; on this build that started a browser reporting
  `Chrome/155.0.8059.84`, the same string as `--headless=new`.)
- S241: the rejection text is Blink's `kNotFoundErrorMessage`, byte-for-byte the string in the receipt.
- PLLM's ENOENT is thrown by the Playwright **client** (`fs.promises.stat` in
  `resolvePathsAndDirectoryForInputFiles`, pinned `lib/coreBundle.js` line 62746) before any request reaches
  the server, with or without `isLocal` — a stack captured by R98Scribe
  (`.ufo/waves/round-98/w1/R98Scribe-enoent-origin.txt`); so the collocation branch (S238) is never reached
  for an absent path. Observation from the wave, not a counter check.

## Limits (`plans/round-98.md` §Declared limits 1-7)

One Chromium build, headless only, one site relation (cross-site `localhost` under `127.0.0.1`); two client
versions, identity bound on the two top-level package directories (r97 A1 items 4 and 6), transitive
packages unbound; "launch" vs "connect" is a driver-pin fact (the counter sees the recorded mode field and
the outcomes, not the process tree); "trusted" is what listeners on `#s` see; the read is one
`Blob.text()` after the events (FileReader, `arrayBuffer()`, form submission unmeasured); one file per call,
no `multiple`, UTF-8 text buffers and `text/plain` only; Puppeteer launch / Playwright launch with an absent
path are not legs; the mechanism is the sources' account; `--receipt` mode is forgeable; a `--scratch`
longer than about 60 bytes makes chromium fail to start (setup).

## Relation to earlier notes

- Extends `client-oopif-uploadfile-round-97.md`: its practitioner point 2 ("Puppeteer and Playwright with
  `isLocal: true` → trusted; Playwright over a default `connectOverCDP` → untrusted") holds for the paths it
  measured; this round's law scopes **both** halves to the input kind — an `isLocal` payload is untrusted
  (PLLB), a launched-browser path is trusted (PLA). The r97 note carries an appended round-98 correction
  saying so. Of r97's frontier this round measures the named items: launch, payload objects, `isLocal` with an
  absent path, the phantom's read; `lastModified`, multiple files, directories and the 50 MB limit stay open.
- Consistent with `client-oopif-filechooser-round-96.md` (chooser path) — no statement there is contradicted.
