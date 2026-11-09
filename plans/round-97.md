# tabi — round 97

L1 `TabiR97`. Base `607c8b022b74440d673976ca94175a0ebf005413` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, tracked=0 untracked=0; `.ufo/watchdog.log` holds only `launch tabi round=97 … attempt=1`,
no earlier attempt). Rounds 92-96 closed admitted (MANIFEST rounds[] tabi r92-r96 `admitted`), so no
fresh-start read is owed; the r96 spot-check (`corpus/lessons/round-96-verifier-spotcheck.md`) §6 queue is
answered in §Record work below. Discipline carried from r92-r96: ONE claim, worded as the conjunction of the
counter's checks and nothing more; its no-work, wrong-site, wrong-library, tampered-tree, setup and forgery
controls executed and committed in the same commit that freezes the claim and the instrument bytes, before
the scored run and before any seat is dispatched; `claims.json.frozenAt` is stamped before the freeze commit.

## Claim (frozen before data)

### C1 — coverage (capability `client-oopif-uploadfile-linux`, new; first-working round 97)

Surface moved: r96 measured the chooser path of two production CDP clients against a cross-site iframe
(Puppeteer's `waitForFileChooser` times out there). Declared limit 4 of r96 left the chooser-free path —
setting a file input's files directly — unmeasured, and no lane instrument has ever called a client's
direct-set API (`grep -rln 'uploadFile\|setInputFiles' scripts` at base: no driver calls either). This
round measures that operation class: which files land, which `input`/`change` events the input sees and
whether each is trusted, for Puppeteer v25.16.0 `ElementHandle.uploadFile` and Playwright v1.65.0
`Locator.setInputFiles` (default `connectOverCDP` and `connectOverCDP(url, {isLocal: true})`), on a file
input inside a cross-site (OOPIF) iframe with a same-site control, plus the clear path and a path that does
not exist. Sourced: S237 (Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts` at tag
`puppeteer-v25.16.0`, opened this round: lines 138-150 the zero-files branch assigns `element.files` and
dispatches script-built `input`/`change` events, lines 158-162 send `DOM.setFileInputFiles` on the handle's
own client) and S238 (Playwright `packages/playwright-core/src/server/fileUploadUtils.ts` at tag `v1.65.0`,
opened this round: line 62 — when the browser is not collocated with the server the files are read into
buffers and `localPaths` dropped), read with `chromium.ts` v1.65.0 lines 162-163 (`connectOverCDP` marks
the browser not collocated unless `isLocal`; staged `.ufo/waves/round-97/sources/chromium.ts`).

**Predicate `C1-CLIENT-OOPIF-UPLOADFILE-R97`.** On this host's Chromium 155.0.8059.84
(`/usr/bin/chromium --headless=new`, Linux), `scripts/check-client-oopif-uploadfile-round97.mjs --live`
runs the pinned driver `scripts/client-oopif-uploadfile-round97.mjs` (sha256 checked before it runs; nonce
passed in its environment; receipt written inside a fresh `mkdtemp` directory) with the npm install named by
`--deps`, for 3 repetitions of the legs PUX, PUS, PUC, PUM, PLX, PLS, PLL, PLM in that order (24 legs), each
in a fresh browser and profile that the client connects to over its DevTools endpoint (Puppeteer `connect
{browserURL}`; Playwright `connectOverCDP(url)`, on PLL `connectOverCDP(url, {isLocal: true})`). The parent
page `http://127.0.0.1:<http>/parent.html?leg=<id>` holds one file input `#pp` and one iframe whose child
`http://<host>:<child>/child.html?leg=<id>` holds one file input `#s` with `input`, `change` and `click`
listeners recording `[type, isTrusted]` (host `localhost` on every leg but PUS, PLS, which use
`127.0.0.1`). The client runs the leg's call on the child frame — Puppeteer `(await frame.$('#s'))
.uploadFile(file)` (PUC: then `.uploadFile()` with no files), Playwright `frame.locator('#s')
.setInputFiles(file, {timeout: 5000})` — where `file` is the 22-byte answer file, or on PUM/PLM the absolute
path `<driver scratch>/tabi-r97-missing.txt`, which does not exist. The counter exits 0 iff:

- **every leg**: the DevTools `/json/version` `Browser` is `Chrome/155.0.8059.84` and the client's own
  browser version string is `Chrome/155.0.8059.84` (Puppeteer) / `155.0.8059.84` (Playwright); the leg's
  library, site, `isLocal` and call fields and its exact parent and child URLs match the arm; the client
  lists exactly the frames `[parent URL, child URL]`; the browser-level `Target.getTargets` (after load,
  before the call) lists exactly one `iframe` target, with url = the child URL, on every cross-site leg and
  none on PUS/PLS; the parent's `#pp` holds `[]`;
- **PUX, PUS, PLL**: the call resolves with no error; the child's `#s` holds exactly
  `[["tabi-r97-answer.txt", 22]]`; `#s` recorded exactly `[["input", true], ["change", true]]`;
- **PLX, PLS**: the call resolves with no error; `#s` holds exactly `[["tabi-r97-answer.txt", 22]]`; `#s`
  recorded exactly `[["input", false], ["change", false]]`;
- **PUC**: both calls resolve; `#s` holds `[]`; `#s` recorded exactly `[["input", true], ["change", true],
  ["input", false], ["change", false]]`;
- **PUM**: the call resolves with no error; `#s` holds exactly `[["tabi-r97-missing.txt", 0]]`; `#s`
  recorded exactly `[["input", true], ["change", true]]`;
- **PLM**: the call ends with error name `Error` and message exactly
  `ENOENT: no such file or directory, stat '<missingPath>'`; `#s` holds `[]` and recorded no event.

(Every events list is compared exactly, so no leg may record a `click`.) Receipt level: schema, nonce,
driver pin, a `chromium` string containing `155.0.8059.84`, `crossHost` `localhost`, `reps` 3, the two
libraries pinned exactly — `puppeteer-core` 25.16.0, lockfile integrity `sha512-VA5Pf54N…IJw==`,
`lib/puppeteer/cdp/ElementHandle.js` sha256 `162b7199…9b7c96`, installed tree 927 files / tree sha256
`968a85e8…d1e180`; `playwright-core` 1.65.0, integrity `sha512-vNSKgH6Y…+lA==`, `lib/coreBundle.js` sha256
`4ef83305…63f7f1`, tree 116 files / `24584693…f5cd641` (full values in the counter; the tree sha256 is over
sorted `<path>\0<file sha256>` lines of every regular file under `node_modules/<name>`) — the answer
`{name, size 22}`, `missingPath` absolute with basename `tabi-r97-missing.txt` and `missingExists` false,
three distinct ports in 1024..65535, the exact leg list, an empty `failures` list with no leg carrying an
`error`, 24 distinct UUID-shaped browser ids; in `--live` mode also `driver-exit` (driver status 0),
`ports-bound` (receipt ports = `--ports`) and `missing-bound` (receipt `missingPath` = `<counter scratch>/
driver/tabi-r97-missing.txt`).

**Before → after.** Before (base `607c8b02`): the counting command does not exist (`git cat-file -e
607c8b02:scripts/check-client-oopif-uploadfile-round97.mjs` → rc 128), and the lane's newest client receipt
(r96, chooser path) scored by the frozen counter gives `findings` (rc 1). After: `--live` exit 0 with 0
findings over the 24 legs (scored run recorded in `.ufo/waves/round-97/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does not give
its expected verdict, or if any wave artifact shows a leg-level statement of the predicate false on a
`--live` run of the pinned driver with the pinned libraries on this host (a reproduction with ≥1 finding
that is not a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)

1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`, the host user's
   `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and OSes are unmeasured.
2. Two client versions (puppeteer-core 25.16.0, playwright-core 1.65.0), each attached to an already-running
   browser (`connect` / `connectOverCDP`, Playwright with and without `isLocal: true`); `launch` modes,
   Playwright's `connect` (browser server) and remote hosts are unmeasured. Identity is pinned on version,
   lockfile integrity, one upload-bearing file's sha256 and a sha256 over the whole installed package tree;
   transitive dependencies (Puppeteer's 24 others) are not hashed.
3. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92-r96 limit 2).
4. "Trusted" means the `isTrusted` value seen by listeners on `#s` itself; listeners elsewhere, event
   order across other event types (`focus`, `beforeinput`), the `File` objects' contents, MIME types and
   `lastModified` are not read. The phantom file on PUM is stated only as name + size 0 in `#s.files`;
   what a form submission or `FileReader` does with it is unmeasured.
5. One file per call, an input without `multiple`/`webkitdirectory`; Playwright payload objects
   (`{name, mimeType, buffer}`), multiple files, directories, the 50 MB transfer limit and
   `ElementHandle.setInputFiles` / `FileChooser` are unmeasured. The missing-path legs use one absent path;
   a Playwright `isLocal` call with an absent path is unmeasured.
6. The mechanism (S237 handle-session `DOM.setFileInputFiles` vs script-dispatched events; S238 payload
   injection when not collocated) is the sources' account; the counter checks behaviour, not code paths.
7. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes that
   mode, and a same-UID process can read the `--live` nonce and receipt path from `/proc` (r95 A1 item 6).
   The claim's counting command is `--live`, with the host's same-UID process space trusted; `--reps` other
   than 3 measures other legs; the claim is the default.

### Pre-freeze probes (observations only; committed under `.ufo/waves/round-97/probes/`)

`probe0.mjs` / `probe0.out` (an ad-hoc script, not the driver): Puppeteer set/clear/missing and Playwright
default set/clear/missing, cross- and same-site; `probe1.out` the same script with `isLocal: true`
(trusted events; missing → ENOENT). `probe-a.json`: this driver's bytes before the launch-wait change, 24
legs, 2 launch failures under load1 ≈ 31 (`devtools endpoint never answered`; the window was then raised from
6 s to 15 s and a port-release wait added — the reason is in the driver's comments). `probe-b.json`: the
frozen driver bytes, 24 legs, 0 failures; the counter scored it clean (229 checks) and the battery killed
70/70 on it.

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-97/controls/` (script `run-controls.sh`, instrument sha256 in
`instrument-sha256.txt`, rc lines in `rc.txt`):

| control | command (abridged) | expected |
|---|---|---|
| no-work (base) | `git cat-file -e 607c8b02:scripts/check-client-oopif-uploadfile-round97.mjs` | rc 128 |
| no-work (r96 receipt) | counter `--receipt corpus/evidence/round96/…/receipt.json` | rc 1 (schema, libs, leg-set, …) |
| positive | driver (defaults), counter `--receipt` | rc 0 |
| forgery battery | `scripts/negatives-client-oopif-uploadfile-round97.mjs` on the positive receipt | all killed, positive clean |
| wrong site | driver `--cross-host 127.0.0.1 --reps 1`, counter `--receipt --reps 1` | rc 1 incl. `iframe-targets` |
| wrong library (production path) | counter `--live --deps <puppeteer-core 25.15.0> --reps 1` | rc 1 incl. `libs` |
| tampered tree (production path) | counter `--live --deps <copy with one comment line appended to puppeteer-core CdpSession.js> --reps 1` (every r96 pin identical) | rc 1 incl. `libs` (tree sha256) |
| setup: busy port | counter `--live`, port held | rc 2 `setup` |
| setup: counter SIGTERM | `kill -TERM` the counter 8 s in | rc 2 `setup`, 0 chromium left |
| setup: deps missing | counter `--live --deps <absent>` | rc 2 `setup` |
| setup: receipt is a directory | counter `--receipt <dir>` | rc 2 `setup` |
| setup: unwritable scratch | `--scratch /proc/…` (bounded `timeout 60`) and `--scratch <chmod-500 dir>/x` | rc 2 `setup` both |
| setup: chromium cannot start | counter `--live` with a 90+-byte `TMPDIR` | rc 2 `setup` |
| driver pin | counter `--live --expect-driver-sha256 000…0` | rc 1 `driver-pin`, driver not run |

The forgery battery carries the tabi r63 binding classes, source-location-specific: producer-verdict
polarity pair (failures listed while legs are clean; a leg error with empty failures), an ignored producer
`verdict: clean` on a receipt whose PLX leg claims trusted events, a contradictory duplicate leg (a second
PLX-1 with trusted events) and a fabricated leg label (`PLZ-3`), plus library-identity forgeries (version,
integrity, file sha, tree sha, tree file count, a missing library).

## Counting command

```sh
node scripts/check-client-oopif-uploadfile-round97.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 <driver sha256 in claims.json> --live --deps <ABS npm install of
  puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; r96 spot-check §6)

1. **D1** (S230 does not ground the listener attribution in the r96 note): an appended correction to
   `corpus/knowledge/client-oopif-filechooser-round-96.md` that cites the pinned-bundle lines
   (`lib/coreBundle.js` 39325) and crPage.ts v1.65.0 line 445 (re-opened this round, staged
   `.ufo/waves/round-97/sources/crPage.ts`) as the listener's ground, and an appended correction to the r96
   lesson's reject flip text. No new row (the crPage.ts URL is S230's; a second scope would be a W04
   duplicate, and the note's correction cites the staged bytes).
2. **D3** (lockfile integrity not verified against the installed tree): this round's counter pins a sha256
   over the whole installed tree of each client (control 7 shows a comment-only edit that kept every r96
   pin now fails). The r96 counter bytes stay frozen.
3. **D2/D4** (R96Mut survivors M20/M51/M52/M54/M65/M67, live killers for `driver-exit`/`ports-bound`; r95
   D1-D3 and R95Mut survivors) stay queued in SCORECARD Planned; one claim per round, and none of them
   moves the surface this claim moves. This round's battery carries the analogous classes for its own
   counter.

## Post-wave amendment A1 (addendum §8; recorded after the wave, before filing)

Causes: `.ufo/waves/round-97/w1/R97Scribe.md` (verdict `falsifies-wording`, finding F1) and the
class-D rows of `.ufo/waves/round-97/w1/R97Critic1.md` (P1, P4, P5, P6, B1, B4; verdict `neutral`). The
counter bytes, the driver bytes, the scored run and every number are unchanged; R97Critic1 mapped every
predicate sentence to an enforcing line, and R97Exec1 (×2), R97Exec2 (default + `--reps 10`, 104 legs) and
R97Reviewer reproduced the after-state clean. This amendment narrows the wording to what the instrument
enforces:

1. **Process clauses are driver-pin facts, not counter checks (R97Scribe F1; R97Critic1 P1/P4/P6).** "in a
   fresh browser and profile that the client connects to over its DevTools endpoint (Puppeteer `connect
   {browserURL}`; Playwright `connectOverCDP(url)`, on PLL `connectOverCDP(url, {isLocal: true})`)",
   "`/usr/bin/chromium --headless=new`", the call forms (`(await frame.$('#s')).uploadFile(file)`,
   `frame.locator('#s').setInputFiles(file, {timeout: 5000})`) and "the browser-level `Target.getTargets`
   (after load, before the call)" are read as: performed by the driver whose sha256 equals the pin, which
   the counter checks before it runs the driver. The counter itself enforces only their observable
   consequences: 24 distinct UUID-shaped browser ids (`fresh-browser`), the DevTools and client version
   strings (`browser`), the frames list (`frames`), the iframe-target set as recorded (`iframe-targets`),
   and the leg's recorded `lib`/`cross`/`isLocal`/`call` fields (`leg-arm`). A profile directory and the
   ordering of `getTargets` against the call are not recorded in the receipt.
2. **Listener placement (R97Critic1 P5).** "`#s` with `input`, `change` and `click` listeners recording
   `[type, isTrusted]`" is fixture bytes inside the pinned driver; the counter checks the recorded lists
   exactly. R97Critic3 Q2 (`R97Critic3-trust-probe.out`) re-observed the same split with two independent
   listeners on `#s`.
3. **PUC "both calls resolve" (R97Critic1 B4).** Enforced as one `outcome: resolved` plus the exact
   four-event sequence and `#s` `[]`; that both awaits resolved follows from the pinned driver's single
   `try` block around them, not from a per-call field.
4. **"a sha256 over the whole installed package tree" (limit 2; R97Critic1 §Tree-sha).** Read as: sorted
   `<path>\0<sha256>` lines of every regular file plus `<path>\0link:<target>` lines of every symlink under
   `node_modules/<name>`; empty directories and non-regular, non-symlink entries contribute no line, and a
   symlink's target bytes are not hashed.
5. **`claims.json` `statement` (R97Critic1 §drift).** Its first clause says "verbatim", but the text is a
   condensation that defers receipt detail to the plan. The plan's §Claim text is the frozen predicate;
   `claims.json` is a pointer and is not edited after the freeze.

6. **Library identity (R97Sentinel, `.ufo/waves/round-97/w1/R97Sentinel.md`, verdict `falsifies-wording`).**
   "Identity is pinned on version, lockfile integrity, one upload-bearing file's sha256 and a sha256 over
   the whole installed package tree" is read as: the two top-level package directories
   `node_modules/puppeteer-core` and `node_modules/playwright-core` match the pinned version, one file
   sha256 and the item-4 entry set (an added empty directory scores clean, `R97Sentinel-pp-empty-dir.json`;
   an extra file, a symlink and a comment-only `coreBundle.js` edit each score `libs`); "lockfile
   integrity" is the string read from `--deps/package-lock.json` compared with the constant, a self-report
   not verified against the installed bytes (R97Sentinel confirmed it equals the registry value on its
   install; the counter does not). Not bound: the 24 transitive packages (a comment-only `ws` edit and a
   forged transitive lock entry score clean; a `ws` patch that strips `DOM.setFileInputFiles` files is
   caught by 21 leg findings; a `ws` patch on the unexercised multi-file path scores clean), the root
   `package.json`/`package-lock.json` beyond the two integrity strings, file modes and the Node runtime.

Wave observations recorded as frontier, not widening (all outside the frozen claim's limits):
R97Exec3 (a) Playwright `chromium.launch` → trusted events, (b) `isLocal` + absent path → the same ENOENT
`stat` message, (c) Puppeteer `launch` → same as PUX, (d) reading PUM's phantom entry in the page rejects
("A requested file or directory could not be found…"), (e) a Playwright payload object over default
`connectOverCDP` → untrusted events. R97Mut: 83 counter mutants, 9 survivors (3 battery gaps with verified
killers M40/M42/M66, 3 equivalent, 3 live-only M75-M77) — routed to SCORECARD Planned; the frozen counter
rejects every killer.

The knowledge note uses the narrowed wording ("its own browser per leg (24 distinct browser ids)"; the
phantom stated as name + size 0 with the read observation marked outside the claim).
