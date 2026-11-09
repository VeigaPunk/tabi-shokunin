---
source: S237 (Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts` at tag puppeteer-v25.16.0 — `uploadFile` sends `DOM.setFileInputFiles` with the handle's `objectId` on the handle's own `this.client` (lines 158-162); with zero files it assigns `element.files = new DataTransfer().files` and dispatches script-built `input`/`change` events (lines 138-150); the line-118 comment "confirm that they exist" is followed only by path resolution (lines 119-131)) and S238 (Playwright `packages/playwright-core/src/server/fileUploadUtils.ts` at tag v1.65.0 — line 62: when the browser is not collocated with the server, each path is read into a buffer and `localPaths` is dropped (lines 63-74)), read with Playwright `chromium.ts` v1.65.0 lines 162-163 (`connectOverCDP` marks the browser not collocated unless `isLocal`; staged `.ufo/waves/round-97/sources/chromium.ts`), the r96 note (the chooser path) and r96 wave probe R96Exec3 (c) (`uploadFile` fills a cross-site child with no chooser).
verified-at: 2026-11-09 (round 97, Linux host, Chromium 155.0.8059.84 `--headless=new`, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-97/scored/c1-live.json`, nonce `tabi-r97-live-152ce8256675`, verdict `clean`, 232 checks, 0 findings, measured revision `4a4e15e3`)
recheck: `node scripts/check-client-oopif-uploadfile-round97.mjs --lane <ABS lane> --expect-driver-sha256 09f0c2fe2895ee0e035e8107995873328ce74f4e4d6d1ab3c8efd455b8c9e4eb --receipt corpus/evidence/round97/client-oopif-uploadfile/receipt.json --expect-nonce tabi-r97-live-152ce8256675 --json` → exit 0, `verdict: clean`, 229 checks (receipt mode on a byte copy of `.ufo/waves/round-97/scored/live-receipt.json`, sha256 `6c948131…`; the claim's counting command is the `--live` form in `plans/round-97.md` §Counting command, which needs an npm install of the two pinned clients)
---

# Setting a cross-site iframe's file input without a chooser: Puppeteer `uploadFile` fires trusted events, Playwright's default `connectOverCDP` fires untrusted ones, and an absent path is a 0-byte file in Puppeteer but ENOENT in Playwright

Capability `client-oopif-uploadfile-linux` (new, first-working round 97). Round 96 showed Puppeteer
25.16.0's `waitForFileChooser` times out for a chooser opened inside a cross-site (out-of-process) iframe.
Round 97 measures the path both clients offer that needs no chooser — setting the input's files directly
— and what the page can observe about it.

## The law (24/24 legs, 3 reps × PUX, PUS, PUC, PUM, PLX, PLS, PLL, PLM)

*Measured*, with each client attached over CDP to a fresh browser, on a child frame's `<input type=file
id=s>` whose own `input`/`change`/`click` listeners record `[type, isTrusted]`:

| arm | client call | child host | `#s.files` after | `#s` saw | outcome |
|---|---|---|---|---|---|
| PUX ×3 | Puppeteer `(await frame.$('#s')).uploadFile(answer)` | `localhost` (cross-site) | `[["tabi-r97-answer.txt", 22]]` | `input` trusted, `change` trusted | resolves |
| PUS ×3 | same | `127.0.0.1` (same-site) | same | trusted, trusted | resolves |
| PUC ×3 | `uploadFile(answer)` then `uploadFile()` | `localhost` | `[]` | trusted, trusted, then `input` **untrusted**, `change` **untrusted** | both resolve |
| PUM ×3 | `uploadFile(<absent path>)` | `localhost` | `[["tabi-r97-missing.txt", 0]]` | trusted, trusted | resolves, no error |
| PLX ×3 | Playwright `frame.locator('#s').setInputFiles(answer)`, `connectOverCDP(url)` | `localhost` | `[["tabi-r97-answer.txt", 22]]` | `input` **untrusted**, `change` **untrusted** | resolves |
| PLS ×3 | same | `127.0.0.1` | same | untrusted, untrusted | resolves |
| PLL ×3 | same, `connectOverCDP(url, {isLocal: true})` | `localhost` | same | trusted, trusted | resolves |
| PLM ×3 | default `connectOverCDP`, `setInputFiles(<absent path>)` | `localhost` | `[]` | nothing | `Error: ENOENT: no such file or directory, stat '<path>'` |

Every leg: the parent page's own file input stays empty; the browser lists exactly one `iframe` target
(the child URL) on each cross-site leg and none on same-site legs; the client lists frames
`[parent, child]`; DevTools `Chrome/155.0.8059.84`. No leg recorded a `click` on `#s`.

## What a practitioner should take from it

1. For a file input inside a cross-site iframe, use the direct-set APIs (`ElementHandle.uploadFile` /
   `Locator.setInputFiles`) on the child frame; r96's Puppeteer chooser timeout does not apply to them.
2. `isTrusted` on the resulting `input`/`change` events depends on the client path: Puppeteer and
   Playwright with `isLocal: true` → trusted; Playwright over a default `connectOverCDP` → untrusted. A page
   (or test) that ignores untrusted events behaves differently under the two Playwright settings on the
   same host. When client and browser share a file system, `connectOverCDP(url, {isLocal: true})` is the
   setting that matches the trusted path.
3. Puppeteer's clear (`uploadFile()` with no files) fires untrusted events even where its set fired trusted
   ones.
4. Puppeteer does not check that a path exists: an absent path becomes a 0-byte file with the absent
   file's name, and the call resolves with trusted events. Check existence yourself before calling it.
   Playwright (default `connectOverCDP`) throws ENOENT and leaves the input untouched.

## Why (source account, not what the counter checks)

Puppeteer: `uploadFile` resolves the paths (S237 lines 119-131; the comment says "confirm that they
exist", the code does not), then `this.client.send('DOM.setFileInputFiles', {objectId: this.id, files,
backendNodeId})` (lines 158-162) — the handle's own session, which for an element in an OOPIF is the
iframe's session, so no chooser and no page-session routing are involved; Chromium then sets the files
and fires the input's events itself (trusted). With zero files it runs page script instead:
`element.files = new DataTransfer().files` plus `dispatchEvent(new Event('input' …))` and
`new Event('change' …)` (lines 138-150, under an `XXX: These events should converted to trusted events`
comment) — untrusted by construction. Playwright: `connectOverCDP` sets
`browser._isBrowserCollocatedWithServer = false` unless `isLocal` (`chromium.ts` lines 162-163); then
`prepareFilesForUpload` reads every path into a buffer and drops `localPaths` (S238 line 62, lines 63-74;
the read's `stat` is where ENOENT comes from), and the buffers are set by injected page script, which
dispatches the events itself (untrusted). With `isLocal: true` the paths go to `setInputFilePaths`, i.e.
`DOM.setFileInputFiles` on the frame's session (`crPage.ts` v1.65.0 lines 343-351), and the events are
Chromium's (trusted).

## Limits (`plans/round-97.md` §Declared limits 1-7)

One Chromium build, headless only; two client versions attached with `connect`/`connectOverCDP` (launch
modes and remote hosts unmeasured); identity pinned on version, lockfile integrity, one upload-bearing
file sha256 and a whole-tree sha256 per package (transitive packages unhashed); `localhost` vs
`127.0.0.1` as the only cross-site pair; "trusted" is what listeners on `#s` saw for `input`/`change`
only; the phantom is name + size 0 in `#s.files`, its read behaviour unmeasured; one file per call, no
`multiple`/`webkitdirectory`, no payload objects; the mechanism above is the sources' account;
`--receipt` mode is forgeable and the `--live` path trusts the host's same-UID process space.
