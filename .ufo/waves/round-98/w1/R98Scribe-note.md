---
source: S240 (Playwright `packages/playwright-core/src/server/dom.ts` at tag `v1.65.0` — lines 768-788: when `localPaths`/`localDirectory` are set the element's paths are existence-checked with `fs.promises.access(localPath, F_OK)` (lines 770-772) and then handed to `this._page.delegate.setInputFilePaths(...)` (line 779); anything else goes to `injected.setInputFiles(node, files)` with `filePayloads` (lines 785-788); staged `.ufo/waves/round-98/sources/dom.ts`), S238 (Playwright `packages/playwright-core/src/server/fileUploadUtils.ts` at tag `v1.65.0` — line 62: paths are converted to payloads only when the browser is **not** collocated with the server (`if (!frame._page.browserContext._browser._isBrowserCollocatedWithServer)`), the conversion reads each path into a buffer and drops `localPaths` (lines 63-74); staged `.ufo/waves/round-98/sources/fileUploadUtils.ts`), S241 (Blink `third_party/blink/renderer/core/fileapi/file_error.cc` at tag `155.0.8059.84` — lines 55-57, `kNotFoundErrorMessage` = "A requested file or directory could not be found at the time an operation was processed."; staged `.ufo/waves/round-98/sources/file_error.cc`), S242 (Puppeteer `packages/puppeteer-core/src/node/ChromeLauncher.ts` at tag `puppeteer-v25.16.0` — lines 90-104 keep a caller-supplied `--remote-debugging-*` argument instead of adding one, lines 278-281 push `--headless=new` for `headless: true`; staged `.ufo/waves/round-98/sources/ChromeLauncher.ts`); plus the r97 source account S237 (Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts` at tag `puppeteer-v25.16.0` — `uploadFile` sends `DOM.setFileInputFiles` on the handle's own client, lines 158-162), and the seat probe `.ufo/waves/round-98/w1/R98Scribe-enoent-origin.txt` (stack of the ENOENT)
verified-at: 2026-11-09 (round 98, Linux host, Chromium 155.0.8059.84, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-98/scored/c1-live.json`, nonce `tabi-r98-live-044424c8b981`, verdict `clean`, 256 checks, 0 findings, rc 0; seat re-run `.ufo/waves/round-98/w1/R98Scribe-live.json`, nonce `tabi-r98-live-b6ebb9f22892`, verdict `clean`, 256 checks, 0 findings, rc 0)
recheck: `node scripts/check-client-oopif-uploadmodes-round98.mjs --lane <ABS lane> --expect-driver-sha256 f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2 --receipt corpus/evidence/round98/client-oopif-uploadmodes/receipt.json --expect-nonce tabi-r98-live-044424c8b981 --json` → exit 0, `verdict: clean`, 253 checks (receipt mode on the committed receipt, sha256 `f69c5719…cd3ba9`; no browser). The claim's counting command is the `--live` form in `plans/round-98.md` §Counting command, which needs an npm install of the two pinned clients (`mkdir -p D && cd D && npm init -y && npm install puppeteer-core@25.16.0 playwright-core@1.65.0`).
---

# Uploading into a cross-site iframe's file input: Playwright's event trust follows the *kind* of input, and the absent-path error is thrown before the browser is touched

Capability `client-oopif-uploadmodes-linux` (new, first-working round 98). Round 97 measured the two
production CDP clients' direct-set upload into a cross-site iframe **with paths only**, on browsers the
runner started and the clients attached to ([client-oopif-uploadfile-round-97.md](client-oopif-uploadfile-round-97.md)).
Round 98 adds the three modes r97 left open: a browser **launched by the client**, a Playwright
**payload object** instead of a path, and the **contents, type and readability** of what lands.

## The law (24/24 legs, 3 reps × 8 arms)

*Measured* on this host's Chromium 155.0.8059.84 with puppeteer-core 25.16.0 and playwright-core 1.65.0,
each leg in its own browser (24 distinct browser ids), against a child frame's `<input type=file id=s>` whose
own `input`/`change`/`click` listeners record `[type, isTrusted]`:

| arm | client | how attached | input given | `#s.files` after | `#s` saw (exact) | read of `files[0].text()` |
|---|---|---|---|---|---|---|
| PUA ×3 | Puppeteer | `launch` (driver-pin) | path | `[["tabi-r98-answer.txt", 22, "text/plain"]]` | `input` trusted, `change` trusted | `["ok", "tabi round 98 answer.\n"]` |
| PLA ×3 | Playwright | `chromium.launch` (driver-pin) | path | `[["tabi-r98-answer.txt", 22, "text/plain"]]` | `input` trusted, `change` trusted | `["ok", "tabi round 98 answer.\n"]` |
| PLAB ×3 | Playwright | `chromium.launch` (driver-pin) | payload object | `[["tabi-r98-payload.txt", 29, "text/plain"]]` | `input` **untrusted**, `change` **untrusted** | `["ok", "tabi round 98 payload bytes.\n"]` |
| PLB ×3 | Playwright | `connectOverCDP(url)` | payload object | `[["tabi-r98-payload.txt", 29, "text/plain"]]` | `input` **untrusted**, `change` **untrusted** | `["ok", "tabi round 98 payload bytes.\n"]` |
| PLLB ×3 | Playwright | `connectOverCDP(url, {isLocal: true})` | payload object | `[["tabi-r98-payload.txt", 29, "text/plain"]]` | `input` **untrusted**, `change` **untrusted** | `["ok", "tabi round 98 payload bytes.\n"]` |
| PLL ×3 | Playwright | `connectOverCDP(url, {isLocal: true})` | path | `[["tabi-r98-answer.txt", 22, "text/plain"]]` | `input` trusted, `change` trusted | `["ok", "tabi round 98 answer.\n"]` |
| PLLM ×3 | Playwright | `connectOverCDP(url, {isLocal: true})` | absent path | `[]` | *no event* | `null` (nothing to read) |
| PUR ×3 | Puppeteer | `connect({browserURL})` | absent path | `[["tabi-r98-missing.txt", 0, "text/plain"]]` | `input` trusted, `change` trusted | `["err", "NotFoundError", "A requested file or directory could not be found at the time an operation was processed."]` |

PLLM's call ends with error name `Error` and message exactly
`ENOENT: no such file or directory, stat '<driver scratch>/tabi-r98-missing.txt'`.

Every leg: the parent page's own file input `#pp` holds `[]`; the browser lists exactly one `iframe`
target (the child URL); the client lists frames `[parent URL, child URL]`; DevTools reports
`Chrome/155.0.8059.84`; no leg recorded a `click` on `#s`; `failures` is empty.
Counter outcome buckets (scored run, `.ufo/waves/round-98/scored/c1-live.json`): `trustedPath` 9
(PUA, PLA, PLL), `untrustedPayload` 9 (PLAB, PLB, PLLB), `enoent` 3 (PLLM), `phantomUnreadable` 3 (PUR).

`launch` vs `connect` is a **driver-pin fact** (`plans/round-98.md` §Declared limits 2): the counter sees
the recorded `mode`/`lib`/`isLocal`/`input` fields, the per-leg browser id and the outcomes — not the
process tree. "Collocated" below is the sources' word for a browser on the same host as the client.

## What a practitioner should take from it

1. **Playwright's event trust follows the kind of input, not the client's mode.** A **path** on a
   *collocated* browser gives trusted `input`/`change` — that is Playwright launched (PLA) and Playwright
   `connectOverCDP(url, {isLocal: true})` (PLL). A **payload object** `{name, mimeType, buffer}` gives
   **untrusted** events in *every* mode measured here — launched (PLAB), default `connectOverCDP` (PLB)
   and `isLocal: true` (PLLB). So "isLocal makes it trusted" is only true for paths; passing a payload
   object is what makes the events script-built, whatever the connection mode.
2. **Puppeteer fires trusted events for both of its modes.** PUA (the driver launched the browser, path)
   and PUR (attached over CDP, absent path) both give `input` trusted, `change` trusted. Puppeteer's
   `uploadFile` always goes through `DOM.setFileInputFiles` on the handle's own session (S237), so its
   events are Chromium's.
3. **What lands is a real file, with a name, a size, a type and readable bytes.** The path arms land
   `["tabi-r98-answer.txt", 22, "text/plain"]` and the payload arms
   `["tabi-r98-payload.txt", 29, "text/plain"]`, and `files[0].text()` returns exactly the bytes given
   (`"tabi round 98 answer.\n"`, `"tabi round 98 payload bytes.\n"`). A payload object therefore does
   not lose the file's *content* — it only loses the trusted-ness of the events.
4. **An absent path under Playwright is refused before the browser is touched.** `isLocal: true` plus a
   path that does not exist (PLLM) throws `ENOENT: no such file or directory, stat '<path>'`, leaves `#s`
   empty, records no event, and the read is `null`. The input is not cleared and not half-filled: it is
   never written. (r97 measured the same refusal for the default `connectOverCDP`; this round adds the
   `isLocal` case.)
5. **An absent path under Puppeteer is a phantom entry that cannot be read.** PUR resolves with no
   error and leaves `[["tabi-r98-missing.txt", 0, "text/plain"]]` and trusted events — but reading that
   entry rejects with `NotFoundError` "A requested file or directory could not be found at the time an
   operation was processed." (S241). It is a dangling reference, not an empty file: check the path
   yourself before calling `uploadFile`.
6. **The parent page's own input is never touched.** `#pp` holds `[]` on all 24 legs, including the
   arms that write into the cross-site child — the write is confined to the child frame's input.

## Why (source account, not what the counter checks)

- **Path vs payload decides trusted vs untrusted.** S240 (dom.ts lines 768-788): when the client sends
  *paths*, the server existence-checks them (`fs.promises.access(localPath, F_OK)`, lines 770-772) and
  hands them to `setInputFilePaths` (line 779) — the `DOM.setFileInputFiles` path, where Chromium sets
  the files and fires the events itself, so they are **trusted**. When the client sends *payloads*, the
  files are set by injected page script (`injected.setInputFiles(node, files)`, lines 785-788), which
  dispatches the events itself — **untrusted by construction**. This is the account of the PUA/PLA/PLL
  (trusted) vs PLAB/PLB/PLLB (untrusted) split.
- **Collocation decides whether a path stays a path.** S238 (fileUploadUtils.ts line 62): paths are
  converted into payloads *only* when the browser is not collocated with the server (lines 63-74 read
  each file into a buffer and drop `localPaths`). A launched browser is collocated, and
  `connectOverCDP(url, {isLocal: true})` leaves `browser._isBrowserCollocatedWithServer` true
  (`chromium.ts` v1.65.0 lines 162-163 set it false only when `isLocal` is absent) — so PLL and PLA keep
  the path and reach `setInputFilePaths`. A payload object is a payload whatever the collocation, which
  is why PLAB/PLLB stay untrusted.
- **The ENOENT is thrown client-side, before any request reaches the browser.** A seat probe
  (`.ufo/waves/round-98/w1/R98Scribe-enoent-origin.txt`, and the default-mode twin
  `R98Scribe-enoent-origin-default.txt`) captured the stack of the absent-path failure: the throw is
  `fs.promises.stat` inside `resolvePathsForInputFiles` →
  `convertInputFiles` → `Frame.setInputFiles` in **playwright-core's client**
  (`packages/playwright-core/src/client/elementHandle.ts`; in the pinned bundle
  `lib/coreBundle.js` lines 62746 / 62765 / 62611 / 60488) — i.e. the client resolves the path to
  file-vs-directory *before* the call is dispatched. The same client-side stack appears for
  `connectOverCDP(url)` without `isLocal`. The server-side size check (S238 lines 31-33, called at
  line 65) is therefore **not** the throw site for an absent path in either mode — the client refuses
  first, so the request never reaches the browser. This corrects the mechanism sentence in
  `corpus/knowledge/client-oopif-uploadfile-round-97.md` ("ENOENT comes from the size check's
  `fs.promises.stat`, lines 31-33, called at line 65"); the *message text* is the same either way, which
  is why the counter cannot tell the two apart and why the r98 law is unaffected.
- **The phantom's read error is Blink's.** S241 (file_error.cc lines 55-57) names it:
  `kNotFoundErrorMessage` = "A requested file or directory could not be found at the time an operation
  was processed." — the text PUR's read produced.
- **Puppeteer's launcher.** S242 (ChromeLauncher.ts lines 90-104, 278-281): a caller-supplied
  `--remote-debugging-*` argument is kept as-is, and `headless: true` pushes `--headless=new`.

## What this round extends or narrows in the r97 note

1. **r97 rule 2 ("`isTrusted` depends on the client path") is narrowed to the *input kind*.** r97 said
   Puppeteer and Playwright-with-`isLocal` give trusted events and default `connectOverCDP` untrusted
   ones. r98 shows the client mode is not the switch: with a **payload object** Playwright gives
   untrusted events even when launched (PLAB) and even when `isLocal: true` (PLLB). The refined rule:
   *path on a collocated browser → trusted; payload object → untrusted*. r97's PLX/PLS (default
   `connectOverCDP` + path → untrusted) were not re-measured this round and stand as measured there.
2. **r97 rule 5/6's phantom is promoted from wave observation to counted law.** r97 counted only the
   phantom's *name and size 0* and put "reading that entry rejects with 'A requested file or directory
   could not be found…'" outside the claim; r98 counts the read (PUR: `["err", "NotFoundError", …]`)
   and adds the *type* (`text/plain`).
3. **r97's "Playwright throws ENOENT for an absent path" is extended to the `isLocal` mode** (PLLM),
   with the same message shape, `#s` empty and no event.
4. **r97's limits are filled:** browsers *launched by the client* (PUA, PLA, PLAB) and Playwright
   **payload objects** (PLAB, PLB, PLLB) were explicitly unmeasured in r97 and are measured here; the
   files' contents, sizes and types are measured too.
5. **r97's mechanism attribution of the ENOENT is corrected** (see *Why*): the throw is the
   client-side `stat` in `client/elementHandle.ts`, not the server-side `filesExceedUploadLimit`. The
   observable message is unchanged.
6. **Still unmeasured after r98** (r97 statements that stand): Puppeteer's clear path
   (`uploadFile()` with no files → untrusted pair) and Playwright's default `connectOverCDP` with a
   path (trusted-vs-untrusted, ENOENT) are r97's arms, not r98's; r98 does not re-measure them.

## Limits (`plans/round-98.md` §Declared limits 1-7)

One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`), headless only; headed mode, other
builds and other OSes are unmeasured. One child-site relation: cross-site `localhost` under `127.0.0.1`;
no same-site leg. Two client versions (puppeteer-core 25.16.0, playwright-core 1.65.0), identity bound
as in r97 A1 items 4 and 6 (top-level package directories only: version, the lockfile integrity string,
one upload-bearing file's sha256 and a sha256 over the package directory's entries — the lockfile
integrity is self-reported and transitive packages are unbound). Playwright's own bundled browsers,
`launchPersistentContext`, `connect` (browser server) and remote hosts are unmeasured. `launch` vs
`connect` is a driver-pin fact, not a process-tree observation. "Trusted" means the `isTrusted` value
seen by listeners on `#s` itself; listeners elsewhere and the order of other event types are not read.
`type` is `File.type` as the page reads it; `lastModified` is not read. The read is `Blob.text()` once,
after the events; `FileReader`, `arrayBuffer()`, form submission and `fetch` uploads are unmeasured. One
file per call, an input without `multiple`/`webkitdirectory`; multiple files, directories, the 50 MB
limit, non-UTF-8 buffers and other MIME types are unmeasured. The absent-path arms use one absent path;
Puppeteer launched with an absent path, Playwright launched with an absent path and Puppeteer's clear
path are not legs. The mechanism above is the sources' account (and, for the ENOENT's throw site, a seat
probe's stack); the counter checks behaviour, not code paths. `--receipt` mode is forgeable and the
claim's count is `--live`.

One operational sharp edge found by a seat probe (it changes no counted property, but it can turn a
green run red): Playwright's `connectOverCDP` artifacts directory is a module-level constant computed
from `os.tmpdir()` **at import time**, so it follows the *inherited* `TMPDIR`, not a `TMPDIR` set later.
A run whose inherited `TMPDIR` points at a directory that does not exist fails every `connectOverCDP`
arm with `browserType.connectOverCDP: ENOENT: no such file or directory, mkdtemp
'<TMPDIR>/playwright-artifacts-…'` while the launch arms still pass; create the directory (or inherit a
usable `TMPDIR`) and the same commands are clean. Evidence:
`.ufo/waves/round-98/w1/R98Scribe-artifacts-tmpdir-anchoring.txt`.

## Sources

- S240: Playwright `packages/playwright-core/src/server/dom.ts`, tag `v1.65.0`, lines 768-788.
  Staged: `.ufo/waves/round-98/sources/dom.ts`.
- S238: Playwright `packages/playwright-core/src/server/fileUploadUtils.ts`, tag `v1.65.0`, line 62
  (lines 63-74). Staged: `.ufo/waves/round-98/sources/fileUploadUtils.ts`.
- S241: Blink `third_party/blink/renderer/core/fileapi/file_error.cc`, tag `155.0.8059.84`, lines 55-57.
  Staged: `.ufo/waves/round-98/sources/file_error.cc`.
- S242: Puppeteer `packages/puppeteer-core/src/node/ChromeLauncher.ts`, tag `puppeteer-v25.16.0`,
  lines 90-104, 278-281. Staged: `.ufo/waves/round-98/sources/ChromeLauncher.ts`.
- `packages/playwright-core/src/server/chromium/chromium.ts` v1.65.0, lines 162-163 (the `isLocal`
  switch). Staged: `.ufo/waves/round-98/sources/chromium.ts`.
- S237 (r97): Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts`, tag `puppeteer-v25.16.0`,
  lines 138-150, 158-162. Staged: `.ufo/waves/round-97/sources/ElementHandle.ts`.
- Pinned library identity (receipt): puppeteer-core 25.16.0, `lib/puppeteer/cdp/ElementHandle.js`
  sha256 `162b7199…9b7c96`, 927 entries / tree `968a85e8…d1e180`; playwright-core 1.65.0,
  `lib/coreBundle.js` sha256 `4ef83305…63f7f1`, 116 entries / tree `24584693…f5cd641`.
- Seat probe (mechanism, outside the count): `.ufo/waves/round-98/w1/R98Scribe-enoent-origin.txt`
  and `R98Scribe-enoent-origin-default.txt`, scripts `R98Scribe-probe-enoent-origin.mjs`,
  `R98Scribe-probe-enoent-default.mjs`; plus the TMPDIR probe
  `R98Scribe-artifacts-tmpdir-anchoring.txt` / `R98Scribe-artifacts-anchoring.mjs`.

## Pointers

- Plan and claim: `plans/round-98.md` §Claim (predicate `C1-CLIENT-OOPIF-UPLOADMODES-R98`), §Controls,
  §Declared limits 1-7.
- Scored run: `.ufo/waves/round-98/scored/c1-live.json` (rc 0, `findings: []`, outcome buckets as above);
  its receipt `.ufo/waves/round-98/scored/live-receipt.json` is byte-identical to the committed
  `corpus/evidence/round98/client-oopif-uploadmodes/receipt.json` (sha256 `f69c5719…cd3ba9`).
- Seat re-run: `.ufo/waves/round-98/w1/R98Scribe-live.json` (rc 0, 256 checks, 0 findings) with receipt
  `.ufo/waves/round-98/w1/R98Scribe-live-receipt.json`; receipt-mode recheck
  `.ufo/waves/round-98/w1/R98Scribe-recheck.json` (rc 0, 253 checks).
- Controls: `.ufo/waves/round-98/controls/rc.txt`.
- Pre-freeze probe: `.ufo/waves/round-98/probes/probe-a.json` (scored `probe-a-score.json`, 93 checks).
