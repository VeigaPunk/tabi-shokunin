# tabi — round 99

L1 `TabiR99`. Base `9eaa5cbe3eb817a8aa70a6e612beddc7ffdfb449` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, tracked=0 untracked=0; `.ufo/watchdog.log` holds only `launch tabi round=99 … attempt=1`,
no earlier attempt). Rounds 93-98 closed admitted (MANIFEST rounds[] tabi r93-r98 `admitted`), so no
fresh-start read is owed; the r98 spot-check (`corpus/lessons/round-98-verifier-spotcheck.md`) §6 queue
D1-D4 is answered in §Record work below. Discipline carried from r92-r98: ONE claim, worded as the
conjunction of the counter's checks and nothing more; process facts that only the pinned driver bytes perform
are named as such in the claim, not left for a seat to find; its no-work, wrong-library, tampered-tree,
live-killer, setup and forgery controls executed and committed in the same commit that freezes the claim and
the instrument bytes, before the scored run and before any seat is dispatched; `claims.json.frozenAt` is
stamped before the freeze commit.

## Claim (frozen before data)

### C1 — coverage (capability `client-oopif-uploadsets-linux`, new; first-working round 99)

Surface moved: r98 measured one file per call into a file input without `multiple` inside a cross-site
iframe, every payload typed `text/plain`, every read one `Blob.text()`. Its declared limits left unmeasured:
multiple files and an input with `multiple`, a second file on an input without it, payloads without
`mimeType` and bytes that are not UTF-8 text (limit 4), `FileReader` and `arrayBuffer()` reads (limit 3), and
the absent path on the client-launched legs (limit 4: "Puppeteer launch with an absent path, Playwright launch
with an absent path … are not legs this round"). No lane instrument has ever put two files into one input,
called `setInputFiles` with an untyped payload, or read an upload with `arrayBuffer()`/`FileReader`
(`git grep -nE 'multiple|readAsArrayBuffer|arrayBuffer\(\)' 9eaa5cbe -- 'scripts/client-oopif-*round9[5-8].mjs'`:
no hit; the r96 counter/battery hits are the chooser's `multiple` flag, not a file input's).
R98Exec3 observed leads a-e as uncounted seat probes; this round makes them counted,
frozen legs, adds the multiple-input arms, and reads every landed file two ways with a byte digest.

Sourced (all opened this round; staged copies and fetch log `.ufo/waves/round-99/sources/`): S240 re-opened
(Playwright `dom.ts` v1.65.0 line 756-757: `if (multiple && !inputElement.multiple &&
!inputElement.webkitdirectory) throw … 'Non-multiple file input can only accept single file'`), S238
re-opened (`fileUploadUtils.ts` v1.65.0 line 80: `mimeType: payload.mimeType || mime.getType(payload.name) ||
'application/octet-stream'`), S237 re-opened (Puppeteer `ElementHandle.ts` v25.16.0 lines 113-116:
`assert(files.length <= 1 || isMultiple, 'Multiple file uploads only work with <input type=file
multiple>')`), and new rows S244 (Puppeteer `util/assert.ts` v25.16.0 line 19 `throw new Error(message);`),
S245 (W3C File API, §7 error table: "If the File or Blob resource could not be found at the time the read was
processed, this is the NotFound failure reason"), S246 (mime v4.1.0 `types/standard.ts` line 283 `'image/png':
['png'],`; Playwright v1.65.0's root `package.json` line 144 pins `"mime": "4.1.0"`) and S247 (mime v4.1.0
`src/Mime.ts` line 87 `return this.#extensionToType.get(ext) ?? null;`).

**Predicate `C1-CLIENT-OOPIF-UPLOADSETS-R99`.** On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium`,
Linux), `scripts/check-client-oopif-uploadsets-round99.mjs --live` runs the pinned driver
`scripts/client-oopif-uploadsets-round99.mjs` (sha256 checked before it runs; nonce passed in its
environment; receipt written inside a fresh `mkdtemp` directory) with the npm install named by `--deps`, for
3 repetitions of the legs PUAM, PLAM, PLBX, PLBM, PLBN, PLLP, PUCM, PUCN in that order (24 legs). Driver-pin
facts (performed by the driver whose sha256 equals the pin; the counter enforces only their recorded
consequences named below): TMPDIR is set to `<driver scratch>/t` before either client module is loaded; each
leg gets its own browser — on PUAM started by Puppeteer `launch({executablePath: '/usr/bin/chromium', headless:
true, userDataDir})`, on PLAM by Playwright `chromium.launch({executablePath: '/usr/bin/chromium', headless:
true})`, both with `--remote-debugging-port=<cdp>` in `args`; on the other legs started by the driver with
`--headless=new` and attached by Playwright `connectOverCDP(url)` (PLBX, PLBM, PLBN) / `connectOverCDP(url,
{isLocal: true})` (PLLP) or Puppeteer `connect({browserURL})` (PUCM, PUCN); the parent page
`http://127.0.0.1:<http>/parent.html?leg=<id>` holds one file input `#pp` and one iframe whose child
`http://localhost:<child>/child.html?leg=<id>` holds two file inputs, `#s` (no `multiple`) and `#m`
(`multiple`), whose `input`, `change` and `click` listeners record `[inputId, type, isTrusted]` in one list;
the call runs on the child frame — Puppeteer `(await frame.$('#<target>')).uploadFile(...x)`, Playwright
`frame.locator('#<target>').setInputFiles(x, {timeout: 5000})` (a one-element `x` passed unwrapped) — where
`x` is the absolute path `<driver scratch>/tabi-r99-missing.txt`, which does not exist (PUAM, PLAM, target
`#s`), one payload `{name: 'tabi-r99-bytes.png', buffer: <the 256 bytes 0x00..0xff>}` with no `mimeType`
(PLBX, `#s`), two payloads `{name: 'tabi-r99-p1.txt', mimeType: 'text/plain', buffer: <27 bytes>}` and
`{name: 'tabi-r99-p2.tabi99', buffer: <36 bytes>}` (PLBM on `#m`, PLBN on `#s`) or the two paths
`tabi-r99-a.txt` (22 bytes) and `tabi-r99-b.txt` (30 bytes) (PLLP and PUCM on `#m`, PUCN on `#s`); after a
400 ms settle the driver reads both inputs' files as `[name, size, type]`, the shared event list, for every
file of the target input in order `[arrayBuffer() result, FileReader.readAsArrayBuffer result]`, each
`['ok', byteLength, sha256 hex]` (WebCrypto SHA-256 in the child page) or `['err', name, message]`, and the
parent's `#pp` files. The counter exits 0 iff:

- **every leg**: the DevTools `/json/version` `Browser` is `Chrome/155.0.8059.84` and the client's own
  browser version string is `Chrome/155.0.8059.84` (Puppeteer) / `155.0.8059.84` (Playwright); the leg's
  recorded `lib`, `mode`, `isLocal`, `input`, `target` fields and its exact parent and child URLs match the
  arm; the client lists exactly the frames `[parent URL, child URL]`; the recorded browser-level
  iframe-target list holds exactly one target, with url = the child URL; the parent's `#pp` holds `[]`;
- **PUAM**: the call resolves with no error; `#s` holds exactly `[["tabi-r99-missing.txt", 0, "text/plain"]]`
  and `#m` `[]`; the events are exactly `[["s","input",true],["s","change",true]]`; both reads of the one file
  give `["err", "NotFoundError", "A requested file or directory could not be found at the time an operation
  was processed."]`;
- **PLAM**: the call ends with error name `Error` and message exactly `ENOENT: no such file or directory,
  stat '<missingPath>'`; both inputs hold `[]`, no event, no read;
- **PLBX**: resolves with no error; `#s` holds exactly `[["tabi-r99-bytes.png", 256, "image/png"]]`, `#m`
  `[]`; events exactly `[["s","input",false],["s","change",false]]`; both reads give `["ok", 256,
  "40aff2e9…944880"]` (the sha256 of bytes 0x00..0xff);
- **PLBM**: resolves with no error; `#m` holds exactly `[["tabi-r99-p1.txt", 27, "text/plain"],
  ["tabi-r99-p2.tabi99", 36, "application/octet-stream"]]`, `#s` `[]`; events exactly
  `[["m","input",false],["m","change",false]]`; both reads of each file give its size and sha256;
- **PLBN**: the call ends with error name `Error` and message exactly `locator.setInputFiles: Error:
  Non-multiple file input can only accept single file`; both inputs hold `[]`, no event, no read;
- **PLLP, PUCM**: resolve with no error; `#m` holds exactly `[["tabi-r99-a.txt", 22, "text/plain"],
  ["tabi-r99-b.txt", 30, "text/plain"]]`, `#s` `[]`; events exactly `[["m","input",true],["m","change",true]]`;
  both reads of each file give its size and sha256;
- **PUCN**: the call ends with error name `Error` and message exactly `Multiple file uploads only work with
  <input type=file multiple>`; both inputs hold `[]`, no event, no read.

(Every events list is compared exactly, so no leg may record a `click`, and an event on the input that was
not the target is a finding.) Receipt level: schema, nonce, driver pin, a `chromium` string containing
`155.0.8059.84`, `reps` 3, the two libraries pinned exactly as in r98 (puppeteer-core 25.16.0 /
playwright-core 1.65.0: version, `package-lock.json` integrity string, upload-bearing file sha256,
package-directory entry count and sha256 — r97 A1 items 4 and 6: the lockfile integrity is a self-reported
string; transitive packages are not bound), the descriptors `fileA`, `fileB`, `payload1` (`mimeType`
`text/plain`), `payload2` and `bin` (`mimeType` exactly `null`) with names, sizes and sha256s,
`missingPath` absolute with basename `tabi-r99-missing.txt` and `missingExists` exactly `false`,
`tmpdirAtLoad` absolute with basename `t`, three distinct integer ports in 1024..65535, the exact leg list, an
empty `failures` list with no leg carrying an `error`, 24 distinct UUID-shaped browser ids; in `--live` mode
also `driver-exit` (driver status 0), `ports-bound` (receipt ports = `--ports`), `missing-bound` (receipt
`missingPath` = `<counter scratch>/driver/tabi-r99-missing.txt`) and `tmpdir-bound` (receipt `tmpdirAtLoad` =
`<counter scratch>/driver/t`).

**Before → after.** Before (base `9eaa5cbe`): the counting command does not exist (`git cat-file -e
9eaa5cbe:scripts/check-client-oopif-uploadsets-round99.mjs` → rc 128), and the lane's newest client receipt
(r98, one file per call on `#s`, typed payloads, `text()` reads) scored by the frozen counter gives `findings`
(rc 1). After: `--live` exit 0 with 0 findings over the 24 legs (scored run recorded in
`.ufo/waves/round-99/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does not give
its expected verdict, or if any wave artifact shows a leg-level statement of the predicate false on a
`--live` run of the pinned driver with the pinned libraries on this host (a reproduction with ≥1 finding
that is not a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)
1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`, the host user's
   `chromium-flags.conf`), headless only; headed mode, other builds and OSes are unmeasured. One child site
   relation: cross-site `localhost` under `127.0.0.1` (r92-r98 limit).
2. Two client versions (puppeteer-core 25.16.0, playwright-core 1.65.0), identity bound as in r98 (top-level
   package directories only). "launch" vs "connect" is a driver-pin fact, as in r98 limit 2; Playwright's
   bundled browsers, `launchPersistentContext`, browser-server `connect` and remote hosts are unmeasured.
3. "Trusted" means `isTrusted` as seen by listeners on `#s`/`#m` themselves. `type` is `File.type` as the
   page reads it; `lastModified` is not read. Reads are `arrayBuffer()` then `FileReader.readAsArrayBuffer`,
   once each, after the events; `text()`, `stream()`, `slice()`, form submission and `fetch` uploads are
   unmeasured. The digest is computed in the page (WebCrypto); the counter compares it to the sha256 of the
   bytes the driver sent (the receipt descriptors are recomputed by the counter from its own constants).
4. Two files per multi-file call, in one order; three or more files, duplicate names, empty files,
   directories (`webkitdirectory`, Playwright `localDirectory`), the 50 MB limit and mixed path+payload calls
   are unmeasured. MIME inference is measured for two names only: `.png` → `image/png` and the unregistered
   extension `.tabi99` → `application/octet-stream`. The paths and the absent path are measured on the arms
   named; Playwright launch with paths, Playwright `isLocal` on `#s` with two paths and Puppeteer launch with
   two paths are not legs this round.
5. The mechanism (S240 the utility-script refusal; S238 + S246/S247 the name → type rule; S237 + S244 the
   Puppeteer assertion and its plain `Error`; S245/S241 the read error) is the sources' account; the counter
   checks behaviour, not code paths. In particular "refused before any file is set" is read from the
   outcome (both inputs `[]`, no event), not from a protocol trace.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes that
   mode, and a same-UID process can read the `--live` nonce and receipt path from `/proc` (r95 A1 item 6).
   The claim's counting command is `--live`, with the host's same-UID process space trusted; `--reps` other
   than 3 measures other legs; the claim is the default.
7. `tmpdirAtLoad` is the value the driver recorded; that the variable was set before the client modules
   loaded is a driver-pin fact (the r98 D2 fix). The pre-freeze strace control (below) is its behavioural
   evidence; the counter does not trace syscalls. As in r98 limit 7, a `--scratch` longer than about 60
   bytes makes chromium fail to start (the launch-fail control uses that) and the counter refuses `setup`.
8. Exit 3 (a chromium never came up, r98 D3): the counter still checks the receipt, skips the per-leg checks
   of the launch-failed legs and reports `findings` (rc 1) when any other check fails (`driver-exit` and
   `failures` excepted), else `setup` (rc 2); every leg launch-failed is `setup`. A scored run that ends
   `setup` has not met the after-state. Which legs count as launch-failed is read from the driver's own
   `error` string (`chromium never came up…`), so a driver that labelled a law-failing leg that way would
   launder it into the skip: that is a driver-pin fact (the pinned driver labels only a client launch that
   threw or a DevTools endpoint that never answered), not something the counter can see.

### Pre-freeze probe (observation only; committed under `.ufo/waves/round-99/probes/`)

`probe-a.json`: the driver bytes as frozen, `--reps 1`, 8 legs, 0 failures, every leg as the predicate
states (the counter, scored `--reps 1`, gives clean, 102 checks — `probe-a-score.json`).

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-99/controls/` (script `run-controls.sh`, instrument sha256 in
`instrument-sha256.txt`, rc lines in `rc.txt`):

| control | command (abridged) | expected |
|---|---|---|
| no-work (base) | `git cat-file -e 9eaa5cbe:scripts/check-client-oopif-uploadsets-round99.mjs` | rc 128 |
| no-work (r98 receipt) | counter `--receipt corpus/evidence/round98/…/receipt.json` | rc 1 (schema, …) |
| positive | driver (defaults), counter `--receipt` | rc 0 |
| forgery battery | `scripts/negatives-client-oopif-uploadsets-round99.mjs` on the positive receipt | all killed, positive clean |
| live killers | `scripts/livekillers-client-oopif-uploadsets-round99.mjs`: four driver mutants through `--live` (`driver-exit`, `ports-bound`, `missing-bound`, `tmpdir-bound`), a partial launch failure with a law change (r98 D3), a launch failure alone | each `--live`-only id: frozen rc 1, neutralised rc 0; partial: frozen rc 1 `child-files`, the r98 exit-3 mapping rc 2; launch failure alone: rc 2 `setup` |
| wrong library (production path) | counter `--live --deps <puppeteer-core 25.15.0> --reps 1` | rc 1 incl. `libs` |
| tampered tree (production path) | counter `--live --deps <copy with one comment line appended to puppeteer-core CdpSession.js> --reps 1` | rc 1 incl. `libs` |
| setup: busy port | counter `--live`, port held | rc 2 `setup` |
| setup: counter SIGTERM | `kill -TERM` the counter 8 s in | rc 2 `setup`, 0 chromium left |
| setup: deps missing | counter `--live --deps <absent>` | rc 2 `setup` |
| setup: receipt is a directory | counter `--receipt <dir>` | rc 2 `setup` |
| setup: unwritable scratch | `--scratch /proc/…` (bounded `timeout 60`) and `--scratch <chmod-500 dir>/x` | rc 2 `setup` both |
| setup: chromium cannot start on any leg | counter `--live` with a 90+-byte `--scratch` | rc 2 `setup` (not findings, under limit 8) |
| driver pin | counter `--live --expect-driver-sha256 000…0` | rc 1 `driver-pin`, driver not run |
| r98 D2, TMPDIR before load | `strace -f -e trace=mkdir,mkdirat` on the r98 and the r99 driver, `--reps 1` each | r98: >0 `mkdir("/tmp/playwright-artifacts-…")`; r99: 0 under `/tmp`, >0 under its scratch `t/` |

The forgery battery carries the tabi r63 binding classes, source-location-specific: producer-verdict
polarity pair (failures listed while legs are clean; a leg error with empty failures), an ignored producer
`verdict: clean` on a receipt whose PLBM leg claims trusted events, a contradictory duplicate leg (a second
PLBN-1 that resolved) and a fabricated leg label (`PLZM-3`), library-identity forgeries, and the R98Mut
survivor classes (a parentUrl-only change, ports 1023 / 65536 / fractional with every URL rewritten to match,
empty legs, the `verdict` string compared by the battery).

## Counting command

```sh
node scripts/check-client-oopif-uploadsets-round99.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 <driver sha256 in claims.json> --live --deps <ABS npm install of
  puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; r98 spot-check §6)

1. **D1** (README r97 coverage sentence not path-scoped): an appended `## Correction — round 97 coverage
   summary, isLocal scope (round 99; append-only)` in `corpus/README.md`.
2. **D2** (TMPDIR set after the client loaded): fixed in this round's driver (TMPDIR before the imports) and
   shown able to fail by the strace control above (r98 driver > 0 `/tmp` artifacts dirs, r99 driver 0).
3. **D3** (exit-3 → `setup` masks law findings): this round's counter checks the receipt on exit 3 (limit 8);
   shown by live killers K-partial (frozen rc 1; the r98 mapping rc 2) and K-launchonly (rc 2).
4. **D4** (R98Mut survivors): battery cases `plbx-parent-url-only`, `port-1023`, `port-65536`,
   `port-fractional`, `legs-empty` and the battery's explicit `verdict` comparison, against this round's
   counter; the r98 counter and battery bytes stay frozen. Carried: r97 D3 transitive-package identity, r95
   D1-D3 and the R95Mut/r96 survivors (SCORECARD Planned).
