---
source: S248 (Playwright client `packages/playwright-core/src/client/elementHandle.ts` at tag v1.65.0, staged `.ufo/waves/round-100/sources/pw-elementHandle.ts` sha256 prefix `b5e6046e19cb`, 15091 B — line 287 throws "File paths cannot be mixed with buffers" when `items.some(item => typeof item === 'string')` and not every item is a string); S249 (same file, line 278 throws "File paths must be all files or a single directory" when `resolvePathsAndDirectoryForInputFiles` (line 263) sees both local paths and a directory); S250 (WHATWG `input.html` §4.10.5.1.17 File Upload state, staged `.ufo/waves/round-100/sources/whatwg-input.html` sha256 prefix `b0202de1c0b4`, 687515 B — lines 4021-4025: "Filenames must not contain path components", so a selected file's `name` is the basename); S240 (Playwright `server/dom.ts` v1.65.0 lines 756-761 — the non-multiple and `webkitdirectory` refusals); S238 (Playwright `server/fileUploadUtils.ts` v1.65.0 lines 42-43 — exactly-one-of-payloads/localPaths/streams, line 80 the `mimeType` fallback, line 62 the collocation branch); S237 (Puppeteer `ElementHandle.ts` at tag puppeteer-v25.16.0 lines 113-116 — `assert(files.length <= 1 || isMultiple, ...)`); S216 (WHATWG `input.html` §4.10.5.1.17 — "Unless the multiple attribute is set, there must be no more than one file in the list of selected files")
verified-at: 2026-11-09 (round 100, Linux host, Chromium 155.0.8059.84, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-100/scored/c1-live.json`, nonce `tabi-r100-live-6e6168fce8a4`, verdict `clean`, 216 checks, 0 findings, measured revision `9a478a2e`; committed receipt `corpus/evidence/round100/client-oopif-uploadsets/receipt.json` sha256 `dac0998fce3bb282ef47917428462cebff953cbcce324f14c9fa688d1dee2dd8`)
recheck: `node scripts/check-client-oopif-uploadsets-round100.mjs --lane <ABS lane> --expect-driver-sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90 --receipt corpus/evidence/round100/client-oopif-uploadsets/receipt.json --expect-nonce tabi-r100-live-6e6168fce8a4 --json` → exit 0, verdict `clean`, 212 checks (receipt mode; the scored `--live` run reports 216 — the four extra checks are the `--live`-only `driver-exit`, `ports-bound`, `missing-bound` and `tmpdir-bound`). This mode is forgeable by a whole consistent receipt; the claim's command is `--live`, see `plans/round-100.md` §Counting command
---

# Upload sets into a cross-site iframe: duplicate names are kept, an empty file is a real file, a mixed path+payload call is refused client-side, and a directory walks recursively

Capability `client-oopif-uploadsets-linux` (generation r100, first-working round 99). Round 99 measured two
files per call, untyped and binary payloads, `arrayBuffer()`/`FileReader` reads and the absent path. Round 100
adds three-or-more files, duplicate names, a 0-byte file, a directory on a `webkitdirectory` input, a mixed
path+payload call, and the two client-launched browsers with two paths.

## The law (18/18 legs, 3 reps × DUP3, EMPTY1, MIXED, LAUNCH2PL, LAUNCH2PU, DIR)

*Measured*, each leg in its own browser (18 distinct browser ids), on a cross-site (`localhost` under
`127.0.0.1`) child frame holding `<input type=file id=s>`, `<input type=file id=m multiple>` and
`<input type=file id=d webkitdirectory>`, whose own `input`/`change`/`click` listeners record
`[inputId, type, isTrusted]` in one list; after the call and a 400 ms settle the driver reads all three
inputs' files as `[name, size, type, webkitRelativePath]`, then for every file of the target input
`arrayBuffer()` and `FileReader.readAsArrayBuffer`, each as `['ok', byteLength, sha256]`:

| arm | browser | call (target input) | target `files` | events | reads |
|---|---|---|---|---|---|
| DUP3 ×3 | runner-started, `connectOverCDP(url)` (no `isLocal`) | three payloads, two named `dup.txt` (21 B, 22 B) + `other.txt` (11 B), all `text/plain` (`#m`) | `[["dup.txt",21,"text/plain",""],["dup.txt",22,"text/plain",""],["other.txt",11,"text/plain",""]]` | `m` input/change **untrusted** | both reads of each file: size + sha256 of the bytes sent |
| EMPTY1 ×3 | runner-started, `connectOverCDP(url)` (no `isLocal`) | one 0-byte payload `tabi-r100-empty.txt`, `text/plain` (`#m`) | `[["tabi-r100-empty.txt",0,"text/plain",""]]` | `m` input/change **untrusted** | both reads: `["ok",0,"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"]` |
| MIXED ×3 | runner-started, `connectOverCDP(url, {isLocal: true})` | one path + one payload in one call (`#m`) | `[]` — nothing set | none | none (the call errored first) |
| LAUNCH2PL ×3 | Playwright `chromium.launch` | two paths, a (23 B) + b (31 B) (`#m`) | `[["tabi-r100-a.txt",23,"text/plain",""],["tabi-r100-b.txt",31,"text/plain",""]]` | `m` input/change **trusted** | both reads of both files: size + sha256 |
| LAUNCH2PU ×3 | Puppeteer `launch` | two paths, a + b (`#m`) | same as LAUNCH2PL | `m` input/change **trusted** | both reads of both files: size + sha256 |
| DIR ×3 | runner-started, `connectOverCDP(url, {isLocal: true})` | one directory path (`#d`) | `[["one.txt",13,"text/plain","probe-dir/one.txt"],["two.txt",13,"text/plain","probe-dir/sub/two.txt"]]` | `d` input/change **trusted** | both reads of both files: size + sha256 |

MIXED ends with `errName` `Error` and message exactly `File paths cannot be mixed with buffers` on all three
reps. Every leg: the other two child inputs stay `[]`, the parent page's own file input stays empty, the
browser lists exactly one `iframe` target (the child URL), the client lists frames `[parent, child]`,
DevTools `Chrome/155.0.8059.84`; no leg recorded a `click`. Evidence:
`corpus/evidence/round100/client-oopif-uploadsets/receipt.json` (sha256 `dac0998f…`), outcome classes in
`.ufo/waves/round-100/scored/c1-live.json` (`trustedMulti` 6, `dupKeep` 3, `emptyOk` 3, `mixedRefused` 3,
`dirWalk` 3).

## What a practitioner should take from it

- **Duplicate names are kept, in order — there is no dedupe and no rename.** Three payloads named `dup.txt`,
  `dup.txt`, `other.txt` land as exactly those three `File`s, in the order passed, with their own sizes
  (21 B, 22 B, 11 B) and their own digests (DUP3). A page that keys a file list by `name` will collide on the
  first two; key by index or by digest, not by `name`.
- **A 0-byte file is a real file, not a missing one.** The EMPTY1 payload lands with `size` 0 and `type`
  `text/plain`, and both read APIs return the sha256 of zero bytes, `e3b0c442…b855`. That is a different thing
  from the absent-path phantom of r98/r99 (there the file is *gone* and the read fails `NotFoundError`); do
  not read "size 0" as "no file".
- **Mixing one path and one payload in a single call is refused client-side, and nothing is set.** The error
  name is `Error` and the message is exactly `File paths cannot be mixed with buffers` (MIXED). The input stays
  empty and no `input`/`change` fires — this is a refusal *before* the file is set, not a partial set. Do one
  kind of call at a time: all paths, or all payloads.
- **Client-launched browsers land paths trusted.** Playwright `chromium.launch` and Puppeteer `launch` with two
  paths give trusted `input`/`change` on the `multiple` input, in order (LAUNCH2PL, LAUNCH2PU). This is the
  launch analogue of r99's trusted *connect* arms (PLLP, PUCM), and it is the opposite of the untrusted
  payload arms: the trust rule follows the *kind* of call (path vs payload), not the connect/launch mode.
- **A directory path on a `webkitdirectory` input walks recursively and keeps the subdirectory.**
  `setInputFiles(<dir>)` on `#d` yields both `one.txt` and `sub/two.txt`, each with `webkitRelativePath`
  `probe-dir/one.txt` and `probe-dir/sub/two.txt` (DIR). The `File.name` is the basename; the directory
  hierarchy travels in the separate `webkitRelativePath` attribute, which is why a flat `FileList` still carries
  the tree. The events on `#d` are **trusted** — a directory is a path, so it lands like a path.
- **`File.name` is a basename because the File Upload state forbids path components.** "Filenames must not
  contain path components" (S250) is why the names above are `one.txt`/`two.txt` and not
  `probe-dir/sub/two.txt`; the relative path is the separate attribute.

## Why (source account, not what the counter checks)

Playwright's client-side `convertInputFiles` (`client/elementHandle.ts`, line 282) rejects a mixed list before
any file is set: if any item is a string and not every item is, it throws "File paths cannot be mixed with
buffers" (line 287, S248) — the same shape of guard as the r99 server-side "Non-multiple file input can only
accept single file", which is why MIXED leaves the input untouched. The neighbouring guard,
"File paths must be all files or a single directory" (line 278, S249), is the directory-vs-files disjunction the
DIR arm exercises on the other side. The server-side `_setInputFiles` evaluates its own guard in the page
before any file is set: more than one file on an input that is neither `multiple` nor `webkitdirectory` throws
the Non-multiple error (S240, dom.ts lines 756-757); a `webkitdirectory` input requires a directory path
(lines 758-761). Payloads without `mimeType` get `mime.getType(name) || 'application/octet-stream'`
(S238, line 80). Puppeteer's `uploadFile` asserts `multiple` before resolving paths or sending
`DOM.setFileInputFiles` (S237, lines 113-116). The counter checks the behaviour, not these code paths
(`plans/round-100.md` limit 5).

## Limits (`plans/round-100.md` §Declared limits 1-8)

One Chromium build (155.0.8059.84), headless only, one cross-site relation; two client versions bound on their
top-level package directories; "launch" vs "connect" is a driver-pin fact. Three files in one multi-file call;
four or more files, a 50 MB limit, a second `webkitdirectory` nesting beyond `sub/`, a non-directory path on
`#d`, and a directory path on `#m`/`#s` are unmeasured. Duplicate names are measured as two payloads named
`dup.txt`; duplicate path basenames are unmeasured. MIME inference is not re-measured. The `isLocal`-with-two-paths-on-`#s`
leg and the empty-file *path* leg are not legs this round. "Trusted" means `isTrusted` as seen by listeners on
the inputs themselves; `lastModified` is not read. Reads are `arrayBuffer()` then `FileReader.readAsArrayBuffer`,
once each, after the events; `text()`, `stream()`, `slice()`, form submission and `fetch` uploads are unmeasured.
The digest is computed in the page (WebCrypto) and compared to the sha256 of the bytes the driver sent. "Nothing
set" on the refused arm is read from the outcome (inputs empty, no event), not from a protocol trace. The
counter in `--receipt` mode is forgeable by a whole consistent receipt, and a same-UID process can read the
`--live` nonce and receipt path from `/proc`; the claim's counting command is `--live`. `tmpdirAtLoad` is the
driver's own record. A `--scratch` longer than about 60 bytes makes chromium fail to start. On a driver exit 3
(a chromium never came up) the counter still checks the receipt and skips only legs the driver labelled
`chromium never came up` — a driver-pin fact.

## Relation to earlier notes

Extends `client-oopif-uploadsets-round-99.md` (two files per call, the non-multiple refusal, payload trust,
the name→type rule, the absent path) and `client-oopif-uploadmodes-round-98.md` (one file per call, trusted
paths vs untrusted payloads). Contradicts neither. The r99 note's "two files per call" and "payloads typed
`text/plain`" were limits, not laws; this note measures past them.

## Correction — source attribution for the `webkitRelativePath` attribute (round 100, post-wave; append-only)

- **The `webkitRelativePath` attribute is not defined in WHATWG `input.html`.** The staged copy of
  `https://html.spec.whatwg.org/multipage/input.html` (687515 B, sha256 prefix `b0202de1c0b4`, matching the
  fetch log) contains **zero** occurrences of `webkitRelativePath` and zero of `webkitdirectory`. It does
  contain the File Upload state's filename rule (lines 4021-4025) and the "no more than one file without
  `multiple`" rule. The attribute's normative home is the WICG File System Access / entries API
  (`https://wicg.github.io/entries-api/`, 316318 B, 17 occurrences — `USVString webkitRelativePath;`, "The
  webkitRelativePath getter steps are to return this's relative path, or the empty string if not specified",
  and the `webkitdirectory` rule that "the webkitRelativePath property of each File is set to a relative path
  starting from (and including) the selected directory"). Blink implements it at
  `third_party/blink/renderer/core/fileapi/file.idl` line 38 at tag 155.0.8059.84,
  `[MeasureAs=PrefixedFileRelativePath] readonly attribute DOMString webkitRelativePath;` — under the
  `// Non-standard APIs` comment. `plans/round-100.md` §Claim attributes "the `webkitRelativePath` definition"
  to S250 (WHATWG `input.html`); that attribution is to the wrong document, though the *behaviour* the r100
  DIR leg measures (the attribute carries the tree) is unchanged and is what the note above states.
- **The staged `pw-elementHandle.ts` has no fetch-log line.** `fetch-log.txt` records four URLs; the sources
  directory holds five files. The Playwright *client* `elementHandle.ts` (S248, S249 — the file that carries
  both throw sites) is staged and byte-identical to upstream v1.65.0 (sha256 `b5e6046e19cb…`, re-fetched and
  matched) but is absent from the log, so §Claim's "each has a staged copy and a fetch-log line" holds for
  S250 and not for S248/S249.
- **A1's "Surface moved" sentence and the 0-byte phantom.** A1 narrows the history sentence to "within the
  client-oopif r95-r99 drivers, no call puts three files, two files with a duplicate name, or a 0-byte file
  into one input". The r98 (`PUR`) and r99 (`PUAM`) absent-path arms do leave a **0-byte** `File` in one input
  (`tabi-r98-missing.txt`, `tabi-r99-missing.txt`), so that clause is narrower than the receipts allow; it
  holds only for *named payload* files. The r100 EMPTY1 arm is the first to land a deliberate 0-byte payload
  that still reads back its digest (the phantom instead reads `NotFoundError`). This is a history sentence, not
  a C1 predicate bullet, and the predicate does not depend on it.
