---
source: S240 (Playwright `packages/playwright-core/src/server/dom.ts` at tag v1.65.0 — lines 756-757 throw "Non-multiple file input can only accept single file" when more than one file meets an input that is neither `multiple` nor `webkitdirectory`); S238 (Playwright `fileUploadUtils.ts` v1.65.0 line 80 — `mimeType: payload.mimeType || mime.getType(payload.name) || 'application/octet-stream'`); S246 (mime v4.1.0 `types/standard.ts` line 283 — `'image/png': ['png']`; Playwright v1.65.0 pins mime 4.1.0); S247 (mime v4.1.0 `src/Mime.ts` line 87 — `getType` gives `null` for an unknown extension); S237 (Puppeteer `ElementHandle.ts` at tag puppeteer-v25.16.0 lines 113-116 — `assert(files.length <= 1 || isMultiple, 'Multiple file uploads only work with <input type=file multiple>')`); S244 (Puppeteer `util/assert.ts` line 19 — `throw new Error(message);`); S245 (W3C File API §7 — a read of a resource that cannot be found is the NotFound failure reason); S241 (Blink `file_error.cc` @155.0.8059.84 — the message text)
verified-at: 2026-11-09 (round 99, Linux host, Chromium 155.0.8059.84, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-99/scored/c1-live.json`, nonce `tabi-r99-live-6d2a1508cbc1`, verdict `clean`, 282 checks, 0 findings, measured revision `27685238`)
recheck: `node scripts/check-client-oopif-uploadsets-round99.mjs --lane <ABS lane> --expect-driver-sha256 98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8 --receipt corpus/evidence/round99/client-oopif-uploadsets/receipt.json --expect-nonce tabi-r99-live-6d2a1508cbc1 --json` → exit 0 (receipt mode: forgeable by a whole consistent receipt; the claim's command is `--live`, see `plans/round-99.md` §Counting command)
---

# Upload sets into a cross-site iframe: both clients refuse a second file on an input without `multiple` (nothing set), two files on a `multiple` input land in order with the same trust rule as one, and an untyped payload's type comes from its name

Capability `client-oopif-uploadsets-linux` (new, first-working round 99). Round 98 measured one file per
call on an input without `multiple`, every payload typed `text/plain`, every read one `Blob.text()`. Round 99
adds two files per call, an input with `multiple`, untyped and binary payloads, `arrayBuffer()` and
`FileReader` reads with a byte digest, and the absent path on the client-launched browsers.

## The law (24/24 legs, 3 reps × PUAM, PLAM, PLBX, PLBM, PLBN, PLLP, PUCM, PUCN)

*Measured*, each leg in its own browser (24 distinct browser ids), on a cross-site (`localhost` under
`127.0.0.1`) child frame holding `<input type=file id=s>` and `<input type=file id=m multiple>`, whose own
`input`/`change`/`click` listeners record `[inputId, type, isTrusted]` in one list; after the call and a 400 ms
settle the driver reads both inputs' files as `[name, size, type]`, then for every file of the target input
`arrayBuffer()` and `FileReader.readAsArrayBuffer`, each as `['ok', byteLength, sha256]` or the error:

| arm | browser | call (target input) | target `files` | events | reads |
|---|---|---|---|---|---|
| PUAM ×3 | Puppeteer `launch` | `uploadFile(<absent path>)` (`#s`) | `[["tabi-r99-missing.txt", 0, "text/plain"]]` | `s` input/change **trusted** | both reject `NotFoundError` (Blink's message) |
| PLAM ×3 | Playwright `chromium.launch` | `setInputFiles(<absent path>)` (`#s`) | `[]` | none | — (`Error: ENOENT: no such file or directory, stat '<path>'`) |
| PLBX ×3 | runner-started, `connectOverCDP(url)` | one payload, **no `mimeType`**, 256 bytes 0x00..0xff, named `tabi-r99-bytes.png` (`#s`) | `[["tabi-r99-bytes.png", 256, "image/png"]]` | `s` input/change **untrusted** | both `['ok', 256, 40aff2e9…944880]` (the bytes sent) |
| PLBM ×3 | runner-started, `connectOverCDP(url)` | payloads p1 (`text/plain`, 27 B) + p2 (no `mimeType`, name `*.tabi99`, 36 B) (`#m`) | `[["tabi-r99-p1.txt", 27, "text/plain"], ["tabi-r99-p2.tabi99", 36, "application/octet-stream"]]` | `m` input/change untrusted | both reads of both files: size + sha256 of the bytes sent |
| PLBN ×3 | runner-started, `connectOverCDP(url)` | the same two payloads (`#s`) | `[]` | none | — (`Error: locator.setInputFiles: Error: Non-multiple file input can only accept single file`) |
| PLLP ×3 | runner-started, `connectOverCDP(url, {isLocal: true})` | two paths a (22 B), b (30 B) (`#m`) | `[["tabi-r99-a.txt", 22, "text/plain"], ["tabi-r99-b.txt", 30, "text/plain"]]` | `m` input/change **trusted** | both reads of both files intact |
| PUCM ×3 | runner-started, Puppeteer `connect` | `uploadFile(a, b)` (`#m`) | same as PLLP | `m` trusted | intact |
| PUCN ×3 | runner-started, Puppeteer `connect` | `uploadFile(a, b)` (`#s`) | `[]` | none | — (`Error: Multiple file uploads only work with <input type=file multiple>`) |

Every leg: the other child input stays `[]`, the parent page's own file input stays empty, the browser lists
exactly one `iframe` target (the child URL), the client lists frames `[parent, child]`, DevTools
`Chrome/155.0.8059.84`; no leg recorded a `click`. Evidence:
`corpus/evidence/round99/client-oopif-uploadsets/receipt.json` (sha256 `ed4b2129…`), outcome classes in
`.ufo/waves/round-99/scored/c1-live.json` (`trustedMulti` 6, `untrustedPayload` 6, `refusedMultiple` 6,
`enoent` 3, `phantomUnreadable` 3).

## What a practitioner should take from it

- **Two files on an input without `multiple` is an error in both clients, and nothing is set.** Playwright
  says `Non-multiple file input can only accept single file` (wrapped as `locator.setInputFiles: Error: …`),
  Puppeteer says `Multiple file uploads only work with <input type=file multiple>`; both are plain `Error`s,
  the input stays empty and no event fires (PLBN, PUCN). Do not rely on "the first file wins".
- **Two files on a `multiple` input land in the order passed, and the trust rule is the one-file rule.**
  Paths through the protocol give trusted `input`/`change` (Playwright `isLocal`, Puppeteer `connect`:
  PLLP, PUCM); payload objects give untrusted ones (PLBM). One event pair per call, not per file.
- **An untyped payload's `File.type` comes from its name, not its bytes.** 256 binary bytes named `.png`
  arrive as `image/png`; an unregistered extension arrives as `application/octet-stream` (PLBX, PLBM p2).
  Name payloads deliberately, or pass `mimeType`, when the page filters on `type`.
- **Binary payloads arrive byte-exact** under both `arrayBuffer()` and `FileReader.readAsArrayBuffer`
  (PLBX, PLBM: sha256 equal to the bytes sent).
- **The absent-path behaviour is per client, not per attach mode.** Puppeteer `launch` leaves the same
  trusted 0-byte phantom r98 measured on `connect`, and both read APIs reject it `NotFoundError` (PUAM);
  Playwright `chromium.launch` throws the same `ENOENT … stat` r98 measured with `isLocal` (PLAM).
- **Set `TMPDIR` before requiring `playwright-core`.** Its artifacts folder is computed from `os.tmpdir()`
  when the module loads; the r98 driver set it after and left `/tmp/playwright-artifacts-*` dirs (4 in one
  `--reps 1` strace), the r99 driver sets it first and leaves none
  (`.ufo/waves/round-99/controls/tmpdir-strace-r98.txt` vs `tmpdir-strace-r99.txt`).

## Why (source account, not what the counter checks)

Playwright's server-side `_setInputFiles` evaluates a guard in the page before any file is set: with more
than one file and an input that is neither `multiple` nor `webkitdirectory` it throws the Non-multiple error
(S240, dom.ts lines 756-757), which is why PLBN leaves the input untouched. Payloads without `mimeType` get
`mime.getType(name)` or `application/octet-stream` (S238 line 80); Playwright v1.65.0 pins mime 4.1.0, whose
table maps `png` to `image/png` (S246) and whose `getType` returns `null` for an extension it does not hold
(S247). Puppeteer's `uploadFile` reads `element.multiple` and asserts before resolving paths or sending
`DOM.setFileInputFiles` (S237 lines 113-116), and its `assert` throws a plain `Error` (S244) — PUCN's
`errName`. The File API makes "could not be found at the time the read was processed" the NotFound failure
reason for any read (S245); Blink supplies the message text (S241). The counter checks the behaviour, not
these code paths (`plans/round-99.md` limit 5).

## Limits (`plans/round-99.md` §Declared limits 1-8)

One Chromium build, headless only, one cross-site relation; two client versions bound on their top-level
package directories; "launch" vs "connect" is a driver-pin fact. Two files per multi-file call, one order;
three or more files, duplicate names, empty files, directories, mixed path+payload calls and the 50 MB limit
are unmeasured. MIME inference is measured for `.png` and one unregistered extension only. `text()`,
`stream()`, `slice()`, form submission and `fetch` uploads are unmeasured. "Nothing set" on the refused arms
is read from the outcome (both inputs empty, no event), not from a protocol trace. `tmpdirAtLoad` is the
driver's own record; the strace control is the behavioural evidence. On a driver exit 3 the counter still
checks the receipt (r98 D3) and skips only legs the driver labelled `chromium never came up` — a driver-pin
fact.

## Relation to earlier notes

Extends `client-oopif-uploadmodes-round-98.md` (one file per call, typed payloads, `text()` reads, absent path
on `connect`/`isLocal` only) and `client-oopif-uploadfile-round-97.md`; contradicts neither. The r98 note's
"one file per call" and "payloads typed `text/plain`" were limits, not laws; this note measures past them.
The r97 README coverage sentence on `isLocal` is path-scoped by the appended round-99 README correction.
