# tabi — round 100

L1 `TabiR100`. Base `9a478a2e9fb61eac0c1146a29bf45ecd7cb1f82f` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, tracked=0 untracked=0; `.ufo/watchdog.log` holds only `launch tabi round=100 … attempt=1`,
no earlier attempt). Rounds 93-99 closed admitted (MANIFEST rounds[] tabi r93-r99 `admitted`), so no
fresh-start read is owed; the r99 spot-check (`corpus/lessons/round-99-verifier-spotcheck.md`) §6 queue
E1-E3 is answered in §Record work below. Discipline carried from r92-r99: ONE claim, worded as the
conjunction of the counter's checks and nothing more; process facts that only the pinned driver bytes perform
are named as such in the claim, not left for a seat to find; its no-work, wrong-library, tampered-tree,
live-killer, setup and forgery controls executed and committed in the same commit that freezes the claim and
the instrument bytes, before the scored run and before any seat is dispatched; `claims.json.frozenAt` is
stamped before the freeze commit.

## Claim (frozen before data)

### C1 — coverage (capability `client-oopif-uploadsets-linux`, generation r100; first-working round 99)

Surface moved: r99 measured two files per call on an input with `multiple`, untyped and binary payloads, and
`arrayBuffer()` and `FileReader` reads (24 legs × 3 reps). Its declared limit 4 left unmeasured: three or
more files, duplicate names, empty files, directories (`webkitdirectory`, Playwright `localDirectory`),
mixed path+payload calls, and the launch legs with two paths. R99Exec3's seven limit-4 probes (3/3 each,
`.ufo/waves/round-99/w1/R99Exec3.md`) observed each unmeasured shape as an uncounted lead: duplicate names
landed both, a 0-byte payload and a 0-byte path landed size 0, one path + one payload was refused with
`File paths cannot be mixed with buffers`, Playwright launch and Puppeteer launch with two paths landed
trusted, `isLocal` with two paths on `#s` gave the familiar refusal, a `webkitdirectory` input walked the
directory recursively with `webkitRelativePath`, and `slice(1,3).arrayBuffer()` worked on a binary payload.
This round turns six of those leads into counted, frozen legs (the `slice`/`text()` reads and the
`#s`-with-two-paths `isLocal` leg stay unmeasured; see limits): DUP3 (three payloads, two named dup.txt),
EMPTY1 (one 0-byte payload), MIXED (one path + one payload), LAUNCH2PL / LAUNCH2PU (two paths on the
client-launched browsers), and DIR (one directory path on a `webkitdirectory` input).

Sourced (all opened this round; staged copies and fetch log `.ufo/waves/round-100/sources/`): S240 re-opened
(Playwright `dom.ts` v1.65.0 lines 756-761: `if (multiple && !inputElement.multiple && !inputElement.webkitdirectory)
throw … 'Non-multiple file input can only accept single file'`; line 758 `if (directoryUpload &&
!inputElement.webkitdirectory) throw … 'File input does not support directories, pass individual files
instead'`; line 760-761 `if (!directoryUpload && inputElement.webkitdirectory) throw … '[webkitdirectory]
input requires passing a path to a directory'`), S238 re-opened (`fileUploadUtils.ts` v1.65.0 line 44:
`if ([payloads, localPaths, localDirectory, streams, directoryStream].filter(Boolean).length !== 1)
throw new Error('Exactly one of payloads, localPaths and streams must be provided')` — the server-side
category discipline that complements the client-side mixed check; line 80 the mimeType fallback; line 62 the
collocation branch), S216 re-opened (WHATWG `input.html` §4.10.5.1.17 File Upload state: "Unless the
multiple attribute is set, there must be no more than one file in the list of selected files." — the
browser-level state constraint the refusal arms enforce), and S237 re-opened (Puppeteer `ElementHandle.ts`
v25.16.0 lines 113-116: the `multiple` assert). New rows: S248 (Playwright client `convertInputFiles` at
`packages/playwright-core/src/client/elementHandle.ts` v1.65.0, the mixed string/payload check),
S249 (Playwright client `resolvePathsAndDirectoryForInputFiles` at the same file, the directory-vs-files
disjunction `"File paths must be all files or a single directory"`), and S250 (WHATWG `input.html`
§4.10.5.1.17 second half: the File Upload state's filename/webkitRelativePath directory semantics —
"Filenames must not contain path components, even in the case that a user has selected an entire directory
hierarchy" plus the `webkitRelativePath` definition). All three were opened and quoted before the freeze
(see §Gate in the lesson for the ≤25-word quotes); each has a staged copy and a fetch-log line.

**Predicate `C1-CLIENT-OOPIF-UPLOADSETS-R100`.** On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium`,
Linux), `scripts/check-client-oopif-uploadsets-round100.mjs --live` runs the pinned driver
`scripts/client-oopif-uploadsets-round100.mjs` (sha256 checked before it runs; nonce passed in its
environment; receipt written inside a fresh `mkdtemp` directory) with the npm install named by `--deps`, for
3 repetitions of the legs DUP3, EMPTY1, MIXED, LAUNCH2PL, LAUNCH2PU, DIR in that order (18 legs). Driver-pin
facts (performed by the driver whose sha256 equals the pin; the counter enforces only their recorded
consequences named below): TMPDIR is set to `<driver scratch>/t` before either client module is loaded; each
leg gets its own browser — on LAUNCH2PL started by Playwright `chromium.launch({executablePath:
'/usr/bin/chromium', headless: true})` and on LAUNCH2PU by Puppeteer `launch({executablePath:
'/usr/bin/chromium', headless: true, userDataDir})`, both with `--remote-debugging-port=<cdp>` in `args`; on
the other legs started by the driver with `--headless=new` and attached by Playwright `connectOverCDP(url)`
(DUP3, EMPTY1), `connectOverCDP(url, {isLocal: true})` (MIXED, DIR); the parent page
`http://127.0.0.1:<http>/parent.html?leg=<id>` holds one file input `#pp` and one iframe whose child
`http://localhost:<child>/child.html?leg=<id>` holds three file inputs, `#s` (no `multiple`), `#m`
(`multiple`) and `#d` (`webkitdirectory`), whose `input`, `change` and `click` listeners record
`[inputId, type, isTrusted]` in one list; the call runs on the child frame — Playwright
`frame.locator('#<target>').setInputFiles(x, {timeout: 5000})` where `x` is three payloads
`{name: 'dup.txt', mimeType: 'text/plain', buffer: <21 bytes>}`, `{name: 'dup.txt', mimeType: 'text/plain',
buffer: <22 bytes>}`, `{name: 'other.txt', mimeType: 'text/plain', buffer: <11 bytes>}` (DUP3, `#m`), one
payload `{name: 'tabi-r100-empty.txt', mimeType: 'text/plain', buffer: <0 bytes>}` (EMPTY1, `#m`), one path
`<driver scratch>/tabi-r100-a.txt` (23 bytes) and one payload `{name: 'tabi-r100-p1.txt', mimeType:
'text/plain', buffer: <28 bytes>}` (MIXED, `#m`), the two paths `<driver scratch>/tabi-r100-a.txt` (23
bytes) and `<driver scratch>/tabi-r100-b.txt` (31 bytes) (LAUNCH2PL, LAUNCH2PU, `#m`), and one directory
path `<driver scratch>/probe-dir` holding `one.txt` (13 bytes, `dir file one\n`) and `sub/two.txt` (13
bytes, `dir file two\n`) (DIR, `#d`); for Puppeteer legs `frame.$('#<target>')` followed by
`uploadFile(...x)`. After a 400 ms settle the driver reads all three inputs' files as `[name, size, type,
webkitRelativePath]`, the shared event list, for every file of the target input in order `[arrayBuffer()
result, FileReader.readAsArrayBuffer result]`, each `['ok', byteLength, sha256 hex]` (WebCrypto SHA-256 in
the child page) or `['err', name, message]`, and the parent's `#pp` files. The counter exits 0 iff:

- **every leg**: the DevTools `/json/version` `Browser` is `Chrome/155.0.8059.84` and the client's own
  browser version string is `Chrome/155.0.8059.84` (Puppeteer) / `155.0.8059.84` (Playwright); the leg's
  recorded `lib`, `mode`, `isLocal`, `input`, `target` fields and its exact parent and child URLs match the
  arm; the client lists exactly the frames `[parent URL, child URL]`; the recorded browser-level
  iframe-target list holds exactly one target, with url = the child URL; the parent's `#pp` holds `[]`; the
  two inputs that are not the target hold `[]` (for DIR the target is `#d` and `#s`/`#m` are the others);
- **DUP3**: resolves with no error; `#m` holds exactly `[["dup.txt", 21, "text/plain", ""],
  ["dup.txt", 22, "text/plain", ""], ["other.txt", 11, "text/plain", ""]]` in that order (duplicate names
  kept, not deduped or renamed) and `#s`/`#d` `[]`; the events are exactly
  `[["m","input",false],["m","change",false]]`; both reads of each file give `["ok", <size>, <sha256 of the
  bytes the driver sent>]`;
- **EMPTY1**: resolves with no error; `#m` holds exactly `[["tabi-r100-empty.txt", 0, "text/plain", ""]]`
  and `#s`/`#d` `[]`; events exactly `[["m","input",false],["m","change",false]]`; both reads give
  `["ok", 0, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"]`;
- **MIXED**: the call ends with error name `Error` and message exactly `File paths cannot be mixed with
  buffers`; all three inputs hold `[]`, no event, no read;
- **LAUNCH2PL, LAUNCH2PU**: resolve with no error; `#m` holds exactly `[["tabi-r100-a.txt", 23,
  "text/plain", ""], ["tabi-r100-b.txt", 31, "text/plain", ""]]` and `#s`/`#d` `[]`; events exactly
  `[["m","input",true],["m","change",true]]`; both reads of both files give `["ok", <size>, <sha256 of the
  bytes the driver sent>]`;
- **DIR**: resolves with no error; `#d` holds exactly `[["one.txt", 13, "text/plain",
  "probe-dir/one.txt"], ["two.txt", 13, "text/plain", "probe-dir/sub/two.txt"]]` (recursive, the
  subdirectory is kept in `webkitRelativePath`) and `#s`/`#m` `[]`; events exactly
  `[["d","input",true],["d","change",true]]`; both reads of both files give `["ok", 13, <sha256 of the bytes
  the driver wrote>]`.

(Every events list is compared exactly, so no leg may record a `click`, and an event on either of the other
two inputs is a finding.) Receipt level: schema, nonce, driver pin, a `chromium` string containing
`155.0.8059.84`, `reps` 3, the two libraries pinned exactly as in r99 (puppeteer-core 25.16.0 /
playwright-core 1.65.0: version, `package-lock.json` integrity string, upload-bearing file sha256,
package-directory entry count and sha256 — r97 A1 items 4 and 6: the lockfile integrity is a self-reported
string; transitive packages are not bound), the descriptors `dup1`, `dup2`, `dup3` (named dup.txt/dup.txt/
other.txt), `empty` (size 0, `mimeType` `text/plain`), `payload1` (`mimeType` `text/plain`), `dirOne` and
`dirTwo` with names, sizes, `webkitRelativePath` and sha256s, `missingPath` absolute with basename
`tabi-r100-missing.txt` and `missingExists` exactly `false`, `tmpdirAtLoad` absolute with basename `t`,
three distinct integer ports in 1024..65535, the exact leg list, an empty `failures` list with no leg
carrying an `error`, 18 distinct UUID-shaped browser ids; in `--live` mode also `driver-exit` (driver
status 0), `ports-bound` (receipt ports = `--ports`), `missing-bound` (receipt `missingPath` =
`<counter scratch>/driver/tabi-r100-missing.txt`) and `tmpdir-bound` (receipt `tmpdirAtLoad` =
`<counter scratch>/driver/t`).

**Before → after.** Before (base `9a478a2e`): the counting command does not exist (`git cat-file -e
9a478a2e:scripts/check-client-oopif-uploadsets-round100.mjs` → rc 128), and the lane's newest client receipt
(r99, two files per call, typed/untyped payloads, `arrayBuffer()`/`FileReader` reads, no `webkitdirectory`
input, no duplicate or empty file) scored by the frozen counter gives `findings` (rc 1). After: `--live`
exit 0 with 0 findings over the 18 legs (scored run recorded in `.ufo/waves/round-100/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does not give
its expected verdict, or if any wave artifact shows a leg-level statement of the predicate false on a
`--live` run of the pinned driver with the pinned libraries on this host (a reproduction with ≥1 finding
that is not a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)
1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`, the host user's
   `chromium-flags.conf`), headless only; headed mode, other builds and OSes are unmeasured. One child site
   relation: cross-site `localhost` under `127.0.0.1` (r92-r99 limit).
2. Two client versions (puppeteer-core 25.16.0, playwright-core 1.65.0), identity bound as in r99 (top-level
   package directories only). "launch" vs "connect" is a driver-pin fact, as in r99 limit 2; Playwright's
   bundled browsers, `launchPersistentContext`, browser-server `connect` and remote hosts are unmeasured.
3. "Trusted" means `isTrusted` as seen by listeners on `#s`/`#m`/`#d` themselves. `type` and
   `webkitRelativePath` are read from the page's `File`; `lastModified` is not read. Reads are
   `arrayBuffer()` then `FileReader.readAsArrayBuffer`, once each, after the events; `text()`, `stream()`,
   `slice()`, form submission and `fetch` uploads are unmeasured (r99Exec3's (h) `slice(1,3)` and `text()`
   leads are not legs this round). The digest is computed in the page (WebCrypto); the counter compares it
   to the sha256 of the bytes the driver sent (the receipt descriptors are recomputed by the counter from
   its own constants).
4. Three files in one multi-file call; four or more files, a 50 MB limit, a second `webkitdirectory`
   nesting beyond `sub/`, a non-directory path on `#d`, and a directory path on `#m`/`#s` are unmeasured.
   Duplicate names are measured as two payloads named `dup.txt`; duplicate path basenames are unmeasured.
   MIME inference is not re-measured this round (r99 measured `.png` and `.tabi99`). The `isLocal`-with-two-paths-on-`#s`
   leg (r99Exec3 (e), the refusal message on a path call) and the empty-file *path* leg (r99Exec3 (b2),
   trusted) are not legs this round; MIXED covers the mixed refusal on the `isLocal`+`#m` arm only.
5. The mechanism (S248 the client-side mixed check `File paths cannot be mixed with buffers`; S249 the
   directory-vs-files disjunction; S238 line 44 the server-side exactly-one category; S240 lines 758-761
   the `webkitdirectory` refusals; S237 the Puppeteer `multiple` assertion; S250 the File Upload state
   sentence) is the sources' account; the counter checks behaviour, not code paths. In particular
   "refused before any file is set" is read from the outcome (all three inputs `[]`, no event), not from a
   protocol trace, and the MIXED refusal is read the same way.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes that
   mode, and a same-UID process can read the `--live` nonce and receipt path from `/proc` (r95 A1 item 6).
   The claim's counting command is `--live`, with the host's same-UID process space trusted; `--reps` other
   than 3 measures other legs; the claim is the default.
7. `tmpdirAtLoad` is the value the driver recorded; that the variable was set before the client modules
   loaded is a driver-pin fact (the r98 D2 fix). The pre-freeze strace control (below) is its behavioural
   evidence; the counter does not trace syscalls. As in r99 limit 7, a `--scratch` longer than about 60
   bytes makes chromium fail to start (the launch-fail control uses that) and the counter refuses `setup`.
8. Exit 3 (a chromium never came up, r99 D3): the counter still checks the receipt, skips the per-leg checks
   of the launch-failed legs and reports `findings` (rc 1) when any other check fails (`driver-exit` and
   `failures` excepted), else `setup` (rc 2); every leg launch-failed is `setup`. A scored run that ends
   `setup` has not met the after-state. Which legs count as launch-failed is read from the driver's own
   `error` string (`chromium never came up…`), so a driver that labelled a law-failing leg that way would
   launder it into the skip: that is a driver-pin fact (the pinned driver labels only a client launch that
   threw or a DevTools endpoint that never answered), not something the counter can see.

### Pre-freeze probe (observation only; committed under `.ufo/waves/round-100/probes/`)

`probe-a-log.txt`: the driver bytes as frozen, 2 reps, 6 legs per rep (DUP3, EMPTY1, MIXED, LAUNCH2PL,
LAUNCH2PU, DIR), 0 failures, every leg as the predicate states (the counter, scored `--reps 1`, gives
clean — `probe-a-score.json`).

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-100/controls/` (script `run-controls.sh`, instrument sha256 in
`instrument-sha256.txt`, rc lines in `rc.txt`):

| control | command (abridged) | expected |
|---|---|---|
| no-work (base) | `git cat-file -e 9a478a2e:scripts/check-client-oopif-uploadsets-round100.mjs` | rc 128 |
| no-work (r99 receipt) | counter `--receipt corpus/evidence/round99/…/receipt.json` | rc 1 (schema, …) |
| positive | driver (defaults), counter `--receipt` | rc 0 |
| forgery battery | `scripts/negatives-client-oopif-uploadsets-round100.mjs` on the positive receipt | all killed, positive clean |
| live killers | `scripts/livekillers-client-oopif-uploadsets-round100.mjs`: four driver mutants through `--live` (`driver-exit`, `ports-bound`, `missing-bound`, `tmpdir-bound`), a partial launch failure with a law change (r99 D3), a launch failure alone | each `--live`-only id: frozen rc 1, neutralised rc 0; partial: frozen rc 1 `child-files`, the r99 exit-3 mapping rc 2; launch failure alone: rc 2 `setup` |
| wrong library (production path) | counter `--live --deps <puppeteer-core 25.15.0> --reps 1` | rc 1 incl. `libs` |
| tampered tree (production path) | counter `--live --deps <copy with one comment line appended to puppeteer-core CdpSession.js> --reps 1` | rc 1 incl. `libs` |
| setup: busy port | counter `--live`, port held | rc 2 `setup` |
| setup: counter SIGTERM | `kill -TERM` the counter 8 s in | rc 2 `setup`, 0 chromium left |
| setup: deps missing | counter `--live --deps <absent>` | rc 2 `setup` |
| setup: receipt is a directory | counter `--receipt <dir>` | rc 2 `setup` |
| setup: unwritable scratch | `--scratch /proc/…` (bounded `timeout 60`) and `--scratch <chmod-500 dir>/x` | rc 2 `setup` both |
| setup: chromium cannot start on any leg | counter `--live` with a 90+-byte `--scratch` | rc 2 `setup` (not findings, under limit 8) |
| driver pin | counter `--live --expect-driver-sha256 000…0` | rc 1 `driver-pin`, driver not run |
| r98 D2, TMPDIR before load | `strace -f -e trace=mkdir,mkdirat` on the r99 and the r100 driver, `--reps 1` each | r99: >0 `mkdir("/tmp/playwright-artifacts-…")` (the carried D2 class needs a pre-D2 driver: the r98 driver is the witness); r100: 0 under `/tmp`, >0 under its scratch `t/` |

The forgery battery carries the tabi r63 binding classes, source-location-specific: producer-verdict
polarity pair (failures listed while legs are clean; a leg error with empty failures), an ignored producer
`verdict: clean` on a receipt whose DUP3 leg claims trusted events, a contradictory duplicate leg (a second
MIXED-1 that resolved) and a fabricated leg label (`ZZZZ-3`), library-identity forgeries, the R98Mut/R99Mut
survivor classes (a parentUrl-only change, ports 1023 / 65536 / fractional with every URL rewritten to match,
empty legs, the `verdict` string compared by the battery; plus the r99 battery-survivor classes now covered:
`missing-exists` 0, an iframe target with an empty `targetId`, a resolved leg carrying only `errMessage`
or only `errName`, and a dropped `files.d` key).

## Counting command

```sh
node scripts/check-client-oopif-uploadsets-round100.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 <driver sha256 in claims.json> --live --deps <ABS npm install of
  puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; r99 spot-check §6)

1. **E1** (history sentences must run their grep over `scripts/` whole): the frozen text above runs
   `git grep -lE 'webkitdirectory|web|File paths cannot' -- scripts/` and `git grep -c 'webkitdirectory'
   scripts/*round99*` before the freeze; the r100 probe (`.ufo/waves/round-100/probes/probe-a-log.txt`)
   is the measurement, not a history sentence, and the "Surface moved" paragraph names its evidence by
   receipt path, not by a universal negative over instruments.
2. **E2** (R99Mut 98 mutants, 68 killed, 30 survived): this round's battery carries the receipt-mode
   survivors that are reachable in receipt mode — `missing-exists` 0 (`missing-loose-eq`), an empty
   `targetId` (`iframe-targetid-drop`), a resolved leg with only `errMessage` or only `errName`
   (`outcome-drop-errmessage` / `outcome-drop-errname`), a dropped `files.d` key (`child-files-s-only`
   class) — as live battery cases (note Mechanism AttackPlan). The live-only survivors stay in the
   live-killer harness (K-partial/K-launchonly) and the `outcomes`-report-only survivors stay report-only.
3. **E3** (provenance trio on every new knowledge entry): the r100 note opens with `source:`, `verified-at:`
   and `recheck:` and cites S248-S250 alongside the URL and anchor, exactly as the r99 note did.

## Amendment A1 (post-wave, 2026-11-09; narrowing only — predicate, counter, kill rule and target unchanged)

Addendum §8 choice (i): two wave artifacts show sentences of the frozen text that claim more than is true or
than the instrument enforces. Both are narrowed here to what holds; the frozen text above stays as written.

1. **Surface moved** (R100Critic1 W1). The sentence "No lane instrument has ever put two files into one input"
   was scoped out by a glob; the whole-`scripts/` grep finds `chrome-cdp-filechooser-round77.mjs` and
   `…round78.mjs`. Narrowed to: "Within the client-oopif r95-r99 drivers, no call puts three files, two
   files with a duplicate name, or a 0-byte file into one input; the r77/r78 raw-chooser instruments are
   outside the production-client surface, which is the coverage move this round."
2. **Limit 8, first clause** (R100Critic1 W2). The every-leg launch-failed refusal discards receipt-level
   findings. Narrowed to: "When at least one leg is not launch-failed, a failure of any check other than
   `driver-exit`/`failures` gives `findings` (rc 1); when every leg is launch-failed the counter gives
   `setup` (rc 2) whatever the receipt-level checks say." The pinned driver labels only real launch failures
   (limit 8, last sentence), and the scored run had none.

Neither narrowing touches a predicate bullet, the counting command or a control: the scored run
(`.ufo/waves/round-100/scored/c1-live.json`, clean) is judged on the same frozen predicate.
