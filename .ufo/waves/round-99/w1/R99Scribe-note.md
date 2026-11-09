---
source: S240 (Playwright `packages/playwright-core/src/server/dom.ts` at tag v1.65.0 — lines 756-757: with more than one file and an input that is neither `multiple` nor `webkitdirectory`, `throw injected.createStacklessError('Non-multiple file input can only accept single file')`); S238 (Playwright `fileUploadUtils.ts` v1.65.0 line 80 — `mimeType: payload.mimeType || mime.getType(payload.name) || 'application/octet-stream'`); S246 (mime v4.1.0 `types/standard.ts` line 283 — `'image/png': ['png'],`; Playwright v1.65.0 root `package.json` line 144 pins `"mime": "4.1.0"`); S247 (mime v4.1.0 `src/Mime.ts` line 87 — `return this.#extensionToType.get(ext) ?? null;`, so an unregistered extension gives `null`); S237 (Puppeteer `ElementHandle.ts` at tag puppeteer-v25.16.0 lines 113-116 — `assert(files.length <= 1 || isMultiple, 'Multiple file uploads only work with <input type=file multiple>')`); S244 (Puppeteer `util/assert.ts` v25.16.0 line 19 — `throw new Error(message);`, so the refusal is a plain `Error`); S245 (W3C File API §7 error table, NotFoundError row, line 2827 — "If the File or Blob resource could not be found at the time the read was processed, this is the NotFound failure reason")
verified-at: 2026-11-09 (round 99, Linux host, Chromium 155.0.8059.84, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-99/scored/c1-live.json`, nonce `tabi-r99-live-6d2a1508cbc1`, verdict `clean`, 282 checks, 0 findings, measured revision `27685238`; committed receipt `corpus/evidence/round99/client-oopif-uploadsets/receipt.json`, sha256 `ed4b2129…`, byte-identical to `.ufo/waves/round-99/scored/live-receipt.json`)
recheck: `node scripts/check-client-oopif-uploadsets-round99.mjs --lane <ABS lane> --expect-driver-sha256 98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8 --receipt corpus/evidence/round99/client-oopif-uploadsets/receipt.json --expect-nonce tabi-r99-live-6d2a1508cbc1 --json` → exit 0, verdict `clean`, 278 checks (receipt mode has the 4 live-only checks `driver-exit`, `ports-bound`, `missing-bound`, `tmpdir-bound` absent, hence 278 = 282 − 4). Receipt mode is forgeable by a whole consistent receipt; the claim's command is `--live`, see `plans/round-99.md` §Counting command
---

# Upload sets into a cross-site iframe: both clients refuse a second file on an input without `multiple` (and set nothing), two files on a `multiple` input land in order under the one-file trust rule, and an untyped payload's type comes from its name

Capability `client-oopif-uploadsets-linux` (new, first-working round 99). Round 98 measured one file per call
into a file input without `multiple` inside a cross-site (out-of-process) iframe, every payload typed
`text/plain`, every read one `Blob.text()`. Round 99 adds two files per call and an input that has
`multiple`, an untyped and a binary payload, `arrayBuffer()` and `FileReader` reads with a byte digest, and
the absent path on the client-launched browsers.

## The law (24/24 legs, 3 reps × PUAM, PLAM, PLBX, PLBM, PLBN, PLLP, PUCM, PUCN)

*Measured*, each leg in its own browser (24 distinct browser ids), on a cross-site (`localhost` under
`127.0.0.1`) child frame holding `<input type=file id=s>` (no `multiple`) and `<input type=file id=m
multiple>`, whose own `input`/`change`/`click` listeners record `[inputId, type, isTrusted]` in one list;
after the call and a 400 ms settle the driver reads both inputs' files as `[name, size, type]`, then for
every file of the target input `arrayBuffer()` and `FileReader.readAsArrayBuffer`, each as
`['ok', byteLength, sha256 hex]` or `['err', name, message]`:

| arm (legs) | browser | call (target input) | target `files` | events | reads |
|---|---|---|---|---|---|
| PUAM ×3 (PUAM-1..3) | Puppeteer `launch` | absent path (`#s`) | `[["tabi-r99-missing.txt", 0, "text/plain"]]` | `s` input/change **trusted** | both reject `NotFoundError` (the same message text r98 saw) |
| PLAM ×3 (PLAM-1..3) | Playwright `chromium.launch` | absent path (`#s`) | `[]` | none | — (`Error: ENOENT: no such file or directory, stat '<path>'`) |
| PLBX ×3 (PLBX-1..3) | runner-started, `connectOverCDP(url)` | one payload, **no `mimeType`**, 256 bytes `0x00..0xff`, named `tabi-r99-bytes.png` (`#s`) | `[["tabi-r99-bytes.png", 256, "image/png"]]` | `s` input/change **untrusted** | both `['ok', 256, 40aff2e9…944880]` (the bytes sent) |
| PLBM ×3 (PLBM-1..3) | runner-started, `connectOverCDP(url)` | payloads p1 (`text/plain`, 27 B) + p2 (no `mimeType`, name `*.tabi99`, 36 B) (`#m`) | `[["tabi-r99-p1.txt", 27, "text/plain"], ["tabi-r99-p2.tabi99", 36, "application/octet-stream"]]` | `m` input/change **untrusted** | both reads of both files: size + sha256 of the bytes sent |
| PLBN ×3 (PLBN-1..3) | runner-started, `connectOverCDP(url)` | the same two payloads (`#s`) | `[]` | none | — (`Error: locator.setInputFiles: Error: Non-multiple file input can only accept single file`) |
| PLLP ×3 (PLLP-1..3) | runner-started, `connectOverCDP(url, {isLocal: true})` | two paths a (22 B), b (30 B) (`#m`) | `[["tabi-r99-a.txt", 22, "text/plain"], ["tabi-r99-b.txt", 30, "text/plain"]]` | `m` input/change **trusted** | both reads of both files: size + sha256, intact |
| PUCM ×3 (PUCM-1..3) | runner-started, Puppeteer `connect` | the same two paths (`#m`) | same as PLLP | `m` input/change **trusted** | intact |
| PUCN ×3 (PUCN-1..3) | runner-started, Puppeteer `connect` | the same two paths (`#s`) | `[]` | none | — (`Error: Multiple file uploads only work with <input type=file multiple>`) |

Leg ids are the receipt's own `leg` fields in
`corpus/evidence/round99/client-oopif-uploadsets/receipt.json`. Every leg: the *other* child input holds `[]`
(the same `#s`/`#m` pair of keys is compared whole on every leg), the parent page's own file input holds `[]`,
the browser lists exactly one `iframe` target (the child URL), the client lists frames `[parent, child]`,
DevTools `Chrome/155.0.8059.84`; no leg recorded a `click`, and every recorded event was on that leg's own
target input. Outcome classes in `.ufo/waves/round-99/scored/c1-live.json`: `trustedMulti` 6, `untrustedPayload`
6, `refusedMultiple` 6, `enoent` 3, `phantomUnreadable` 3 (24 legs, 24 distinct browser ids, `reps` 3).

## What a practitioner should take from it

1. **Two files on an input without `multiple` is an error in both clients, and nothing is set.** Playwright
   says `Non-multiple file input can only accept single file` (delivered as `locator.setInputFiles: Error: …`),
   Puppeteer says `Multiple file uploads only work with <input type=file multiple>`; both are plain `Error`s,
   both inputs stay `[]` and no event fires (PLBN-1..3, PUCN-1..3). Do not rely on "the first file wins".
2. **Two files on a `multiple` input land in the order passed, and the trust rule is the one-file rule.**
   Paths through the protocol give trusted `input`/`change` (Playwright `isLocal`, Puppeteer `connect`:
   PLLP-1..3, PUCM-1..3); payload objects give untrusted ones (PLBM-1..3). One event *pair* per call, not one
   pair per file: on every leg that set a file the event list holds exactly two entries, one `input` and one
   `change` (PLAM, PLBN and PUCN hold none).
3. **An untyped payload's `File.type` comes from its name, not its bytes.** 256 binary bytes named `.png`
   arrive as `image/png` (PLBX-1..3); an unregistered extension arrives as `application/octet-stream`
   (PLBM-1..3, second file). Name payloads deliberately, or pass `mimeType`, when the page filters on `type`.
4. **Binary payloads arrive byte-exact under both read APIs.** `arrayBuffer()` and
   `FileReader.readAsArrayBuffer` both returned `['ok', 256, 40aff2e9…944880]` on PLBX-1..3, the sha256 of the
   bytes `0x00..0xff` that were sent; PLBM-1..3's two files each read back with their own size and sha256.
5. **The absent-path behaviour is per client, not per attach mode.** Puppeteer `launch` leaves the same
   shape of trusted 0-byte `text/plain` phantom r98 measured on `connect` (PUAM-1..3, against r98's
   PUR-1..3: `[["tabi-r98-missing.txt", 0, "text/plain"]]` with trusted `input`/`change` — same shape, this
   round's file is named `tabi-r99-missing.txt`), and both read APIs reject it `NotFoundError` with the same
   message text — r98 read the phantom with `Blob.text()` (r98 receipt `childRead`), this round reads it with
   `arrayBuffer()` and `FileReader`, and all three reject alike (S245 for the failure reason; the message
   text itself is the receipt's own).
   Playwright `chromium.launch` throws the same `ENOENT … stat '<path>'` r98 measured with `isLocal`
   (PLAM-1..3, against r98's PLLM-1..3), leaving both inputs `[]` and no event.
6. **Set `TMPDIR` before the client modules load.** The r98 driver set it *after* `require('playwright-core')`
   and left `mkdir("/tmp/playwright-artifacts-…")` dirs (4 under `/tmp` in one `--reps 1` strace); the r99
   driver sets it before either import and leaves none under `/tmp` (0 under `/tmp`, 5 under its own scratch
   `t/`): `.ufo/waves/round-99/controls/tmpdir-strace-r98.txt` vs `tmpdir-strace-r99.txt`, counts in
   `controls/rc.txt` (`tmpdir-strace r98-under-tmp=4 r99-under-tmp=0 r99-under-scratch=5`).

## Why (source account, not what the counter checks)

- S240: Playwright's server-side `_setInputFiles` evaluates a guard *in the page* before any file is set —
  with more than one file and an input that is neither `multiple` nor `webkitdirectory` it throws
  `Non-multiple file input can only accept single file` (dom.ts lines 756-757). That is why PLBN leaves both
  inputs `[]` and fires no event. (Limit 5: "refused before any file is set" is read from the outcome, not
  from a protocol trace.)
- S238 + S246 + S247: a payload without a `mimeType` gets `mime.getType(name)`, and `application/octet-stream`
  when that is `null` (fileUploadUtils.ts line 80). Playwright v1.65.0 pins mime 4.1.0, whose table maps `png`
  to `image/png` (standard.ts line 283) and whose `getType` returns `null` for an extension the table does not
  hold (Mime.ts line 87). That is PLBX's `image/png` and PLBM's second file's `application/octet-stream`.
- S237 + S244: Puppeteer's `uploadFile` reads `element.multiple` and asserts *before* resolving paths or
  sending `DOM.setFileInputFiles` (ElementHandle.ts lines 113-116), and its internal `assert` throws a plain
  `Error` (assert.ts line 19) — the `errName` `Error` on PUCN. Playwright's refusal is delivered as the
  string `locator.setInputFiles: Error: Non-multiple file input can only accept single file` (PLBN-1..3):
  the S240 message text inside an added prefix. No row of this round's source set covers where that prefix
  is added, so only the delivered string is asserted here (limit 5).
- S245: the File API makes "could not be found at the time the read was processed" the NotFound failure
  reason for any read API — so `arrayBuffer()` and `FileReader.readAsArrayBuffer` agreeing on PUAM is the
  specified behaviour. The exact message text is a receipt fact (PUAM-1..3 read `["err", "NotFoundError",
  "A requested file or directory could not be found at the time an operation was processed."]`), not a
  source-row claim here.
- The counter checks the behaviour, not these code paths (`plans/round-99.md` limit 5).

## Limits (`plans/round-99.md` §Declared limits 1-8)

One Chromium build (155.0.8059.84), headless only, one cross-site relation; two client versions bound on
their top-level package directories only; "launch" vs "connect" is a driver-pin fact. Two files per
multi-file call, in one order; three or more files, duplicate names, empty files, directories
(`webkitdirectory`, `localDirectory`), mixed path+payload calls and the 50 MB limit are unmeasured. MIME
inference is measured for `.png` and one unregistered extension only. Reads are `arrayBuffer()` then
`FileReader.readAsArrayBuffer`, once each, after the events; `text()`, `stream()`, `slice()`, form submission
and `fetch` uploads are unmeasured. "Nothing set" on the refused arms is read from the outcome (both inputs
empty, no event), not from a protocol trace. `tmpdirAtLoad` is the driver's own record — that `TMPDIR` was set
before the clients loaded is a driver-pin fact whose behavioural evidence is the strace control. On a driver
exit 3 the counter still checks the receipt (r98 D3) and skips only the legs the driver labelled `chromium
never came up` — also a driver-pin fact. The `File.type` of the PUAM phantom (`text/plain`) and of the two
path files (`text/plain`) is recorded, not explained: no source row covers the browser-side name→type step
for those arms.

## Relation to earlier notes

Extends `client-oopif-uploadmodes-round-98.md` (one file per call, typed payloads, `text()` reads, the absent
path only on `connect`/`isLocal`) and `client-oopif-uploadfile-round-97.md`; contradicts neither. The r98
note's "one file per call" and "payloads typed `text/plain`" were declared limits, not laws; this round
measures past them, and the r98 note's practitioner point 1 (trusted needs a *path* and a collocated browser)
holds unchanged for the two-file case (PLLP, PUCM trusted; PLBM untrusted). The r97 README coverage sentence
on `isLocal` stays path-scoped by the appended round-99 README correction.
