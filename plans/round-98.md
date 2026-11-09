# tabi — round 98

L1 `TabiR98`. Base `020ce05fc5d695a295103f53c25c6199210f3050` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, tracked=0 untracked=0; `.ufo/watchdog.log` holds only `launch tabi round=98 … attempt=1`,
no earlier attempt). Rounds 93-97 closed admitted (MANIFEST rounds[] tabi r93-r97 `admitted`), so no
fresh-start read is owed; the r97 spot-check (`corpus/lessons/round-97-verifier-spotcheck.md`) §6 queue is
answered in §Record work below. Discipline carried from r92-r97: ONE claim, worded as the conjunction of the
counter's checks and nothing more; process facts that only the pinned driver bytes perform are named as such
in the claim (r97 A1 item 1), not left for a seat to find; its no-work, wrong-library, tampered-tree,
live-killer, setup and forgery controls executed and committed in the same commit that freezes the claim and
the instrument bytes, before the scored run and before any seat is dispatched; `claims.json.frozenAt` is
stamped before the freeze commit.

## Claim (frozen before data)

### C1 — coverage (capability `client-oopif-uploadmodes-linux`, new; first-working round 98)

Surface moved: r97 measured the two production CDP clients' direct-set upload into a cross-site iframe
with paths only, on browsers the runner started and the clients attached to. Its declared limits left
unmeasured: browsers launched by the client (limit 2), Playwright payload objects and a Playwright
`isLocal` call with an absent path (limit 5), and the files' contents/types and what reading Puppeteer's
phantom entry does (limit 4). No lane instrument has ever called `puppeteer.launch`/`chromium.launch`
against an OOPIF input, passed a payload object to `setInputFiles`, or read an uploaded file back in the
page (`grep -rlnE 'puppeteer\.launch|pwChromium\.launch|mimeType:|\.text\(\)' scripts/*round9[67]*` at base:
no driver does). This round measures which of those modes gives trusted events, what lands in the input
(name, size, type, bytes), and how the phantom reads.

Sourced: S240 (Playwright `packages/playwright-core/src/server/dom.ts` at tag `v1.65.0`, opened this round:
lines 768-788 — local paths go to `this._page.delegate.setInputFilePaths(…)`, anything else to
`injected.setInputFiles(node, files)` with `filePayloads`), read with S238 (`fileUploadUtils.ts` line 62:
paths are converted to payloads only when the browser is not collocated with the server; launched browsers
are), S241 (Blink `third_party/blink/renderer/core/fileapi/file_error.cc` at tag `155.0.8059.84`, opened this
round: lines 55-57, `kNotFoundErrorMessage` "A requested file or directory could not be found at the time
an operation was processed.") and S242 (Puppeteer `packages/puppeteer-core/src/node/ChromeLauncher.ts` at tag
`puppeteer-v25.16.0`, opened this round: lines 90-104 keep a caller-supplied `--remote-debugging-*` argument,
lines 278-281 push `--headless=new` for `headless: true`). Staged copies and fetch log:
`.ufo/waves/round-98/sources/`.

**Predicate `C1-CLIENT-OOPIF-UPLOADMODES-R98`.** On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium`,
Linux), `scripts/check-client-oopif-uploadmodes-round98.mjs --live` runs the pinned driver
`scripts/client-oopif-uploadmodes-round98.mjs` (sha256 checked before it runs; nonce passed in its
environment; receipt written inside a fresh `mkdtemp` directory) with the npm install named by `--deps`, for
3 repetitions of the legs PUA, PLA, PLAB, PLB, PLLB, PLL, PLLM, PUR in that order (24 legs). Driver-pin facts
(performed by the driver whose sha256 equals the pin; the counter enforces only their recorded consequences
named below): each leg gets its own browser — on PUA started by Puppeteer `launch({executablePath:
'/usr/bin/chromium', headless: true, userDataDir})`, on PLA/PLAB by Playwright `chromium.launch({executablePath:
'/usr/bin/chromium', headless: true})`, both with `--remote-debugging-port=<cdp>` in `args`; on the other legs
started by the driver with `--headless=new` and attached by Puppeteer `connect({browserURL})` (PUR) or
Playwright `connectOverCDP(url)` (PLB) / `connectOverCDP(url, {isLocal: true})` (PLLB, PLL, PLLM); the parent
page `http://127.0.0.1:<http>/parent.html?leg=<id>` holds one file input `#pp` and one iframe whose child
`http://localhost:<child>/child.html?leg=<id>` holds one file input `#s` with `input`, `change` and `click`
listeners recording `[type, isTrusted]`; the call runs on the child frame — Puppeteer `(await frame.$('#s'))
.uploadFile(x)`, Playwright `frame.locator('#s').setInputFiles(x, {timeout: 5000})` — where `x` is the 22-byte
answer file's path (PUA, PLA, PLL), the payload object `{name: 'tabi-r98-payload.txt', mimeType: 'text/plain',
buffer: <29 bytes>}` (PLAB, PLB, PLLB) or the absolute path `<driver scratch>/tabi-r98-missing.txt`, which
does not exist (PLLM, PUR); after a 400 ms settle the driver reads `#s.files` as `[name, size, type]`, the
events `#s` recorded, and — when `#s` holds exactly one file — `await files[0].text()` as `['ok', text]` or
`['err', name, message]` (else `null`). The counter exits 0 iff:

- **every leg**: the DevTools `/json/version` `Browser` is `Chrome/155.0.8059.84` and the client's own
  browser version string is `Chrome/155.0.8059.84` (Puppeteer) / `155.0.8059.84` (Playwright); the leg's
  recorded `lib`, `mode` (`launch`/`connect`), `isLocal`, `input` (`path`/`payload`/`missing`) fields and
  its exact parent and child URLs match the arm; the client lists exactly the frames `[parent URL, child
  URL]`; the recorded browser-level iframe-target list holds exactly one target, with url = the child URL;
  the parent's `#pp` holds `[]`;
- **PUA, PLA, PLL**: the call resolves with no error; `#s` holds exactly `[["tabi-r98-answer.txt", 22,
  "text/plain"]]`; `#s` recorded exactly `[["input", true], ["change", true]]`; the read gives `["ok",
  "tabi round 98 answer.\n"]`;
- **PLAB, PLB, PLLB**: the call resolves with no error; `#s` holds exactly `[["tabi-r98-payload.txt", 29,
  "text/plain"]]`; `#s` recorded exactly `[["input", false], ["change", false]]`; the read gives `["ok",
  "tabi round 98 payload bytes.\n"]`;
- **PLLM**: the call ends with error name `Error` and message exactly `ENOENT: no such file or directory,
  stat '<missingPath>'`; `#s` holds `[]`, recorded no event, and the read is `null`;
- **PUR**: the call resolves with no error; `#s` holds exactly `[["tabi-r98-missing.txt", 0, "text/plain"]]`;
  `#s` recorded exactly `[["input", true], ["change", true]]`; the read gives `["err", "NotFoundError", "A
  requested file or directory could not be found at the time an operation was processed."]`.

(Every events list is compared exactly, so no leg may record a `click`.) Receipt level: schema, nonce,
driver pin, a `chromium` string containing `155.0.8059.84`, `reps` 3, the two libraries pinned exactly as in
r97 — the top-level package directories `node_modules/puppeteer-core` (25.16.0, the `package-lock.json`
integrity string `sha512-VA5Pf54N…IJw==`, `lib/puppeteer/cdp/ElementHandle.js` sha256 `162b7199…9b7c96`, 927
entries / sha256 `968a85e8…d1e180`) and `node_modules/playwright-core` (1.65.0, `sha512-vNSKgH6Y…+lA==`,
`lib/coreBundle.js` `4ef83305…63f7f1`, 116 entries / `24584693…f5cd641`), entries being the sorted
`<path>\0<sha256>` lines of every regular file plus `<path>\0link:<target>` per symlink (r97 A1 items 4 and
6: the lockfile integrity is a self-reported string; transitive packages are not bound) — the answer
`{name, size 22, text}`, the payload `{name, size 29, mimeType text/plain, text}`, `missingPath` absolute with
basename `tabi-r98-missing.txt` and `missingExists` exactly `false`, three distinct ports in 1024..65535, the
exact leg list, an empty `failures` list with no leg carrying an `error`, 24 distinct UUID-shaped browser
ids; in `--live` mode also `driver-exit` (driver status 0), `ports-bound` (receipt ports = `--ports`) and
`missing-bound` (receipt `missingPath` = `<counter scratch>/driver/tabi-r98-missing.txt`).

**Before → after.** Before (base `020ce05f`): the counting command does not exist (`git cat-file -e
020ce05f:scripts/check-client-oopif-uploadmodes-round98.mjs` → rc 128), and the lane's newest client receipt
(r97, runner-started browsers, paths only) scored by the frozen counter gives `findings` (rc 1). After:
`--live` exit 0 with 0 findings over the 24 legs (scored run recorded in `.ufo/waves/round-98/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does not give
its expected verdict, or if any wave artifact shows a leg-level statement of the predicate false on a
`--live` run of the pinned driver with the pinned libraries on this host (a reproduction with ≥1 finding
that is not a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)
1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`, the host user's
   `chromium-flags.conf`), headless only (`--headless=new` on runner-started browsers; on client launches
   whatever flag each launcher passes for `headless: true`); headed mode, other builds and OSes are
   unmeasured. One child site relation: cross-site `localhost` under `127.0.0.1` (r92-r97 limit); no
   same-site leg this round.
2. Two client versions (puppeteer-core 25.16.0, playwright-core 1.65.0), identity bound as in r97 A1 items 4
   and 6 (top-level package directories only). Launch legs pass `executablePath` and
   `--remote-debugging-port`; Playwright's own bundled browsers, `launchPersistentContext`, `connect`
   (browser server) and remote hosts are unmeasured. "launch" vs "connect" is a driver-pin fact: the counter
   sees the recorded `mode` field, the per-leg browser id and the outcomes, not the process tree.
3. "Trusted" means the `isTrusted` value seen by listeners on `#s` itself; listeners elsewhere and event
   order across other event types are not read. `type` is `File.type` as the page reads it; `lastModified`
   is not read. The read is `Blob.text()` once, after the events; `FileReader`, `arrayBuffer()`, form
   submission and `fetch` uploads are unmeasured.
4. One file per call (one path or one payload object), an input without `multiple`/`webkitdirectory`;
   multiple files, directories, the 50 MB limit, buffers that are not UTF-8 text and other MIME types are
   unmeasured. The absent-path legs use one absent path; Puppeteer launch with an absent path, Playwright
   launch with an absent path and Puppeteer's clear path (r97 PUC) are not legs this round.
5. The mechanism (S240 paths → `setInputFilePaths`, payloads → injected script; S238 path-to-payload
   conversion only when not collocated; S242 launcher arguments; S241 the error text) is the sources'
   account; the counter checks behaviour, not code paths.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes that
   mode, and a same-UID process can read the `--live` nonce and receipt path from `/proc` (r95 A1 item 6).
   The claim's counting command is `--live`, with the host's same-UID process space trusted; `--reps` other
   than 3 measures other legs; the claim is the default.
7. The driver sets `TMPDIR=<driver scratch>/t` (so a Playwright launch profile lives under the scratch
   dir and the sweeps reach it); chromium's singleton socket path under it must fit a 108-byte unix
   `sun_path`, so a `--scratch` longer than about 60 bytes makes chromium fail to start and the counter
   refuses `setup` (the launch-fail control uses exactly that). The first harness run at freeze hit it
   (`.ufo/waves/round-98/controls/livekillers-first-run.json`, rc 2 `setup`) and the harness was given short
   directory names before the recorded run.

### Pre-freeze probe (observation only; committed under `.ufo/waves/round-98/probes/`)

`probe-a.json`: the driver bytes as frozen, `--reps 1`, 8 legs, 0 failures, every leg as the predicate
states (the counter, scored `--reps 1`, gives clean, 93 checks — `probe-a-score.json`).

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-98/controls/` (script `run-controls.sh`, instrument sha256 in
`instrument-sha256.txt`, rc lines in `rc.txt`):

| control | command (abridged) | expected |
|---|---|---|
| no-work (base) | `git cat-file -e 020ce05f:scripts/check-client-oopif-uploadmodes-round98.mjs` | rc 128 |
| no-work (r97 receipt) | counter `--receipt corpus/evidence/round97/…/receipt.json` | rc 1 (schema, …) |
| positive | driver (defaults), counter `--receipt` | rc 0 |
| forgery battery | `scripts/negatives-client-oopif-uploadmodes-round98.mjs` on the positive receipt | all killed, positive clean |
| live killers (r97 M75-M77 class) | `scripts/livekillers-client-oopif-uploadmodes-round98.mjs`: three driver mutants through `--live` | each: frozen counter rc 1 with `driver-exit` / `ports-bound` / `missing-bound`; the counter with that one check neutralised rc 0 |
| wrong library (production path) | counter `--live --deps <puppeteer-core 25.15.0> --reps 1` | rc 1 incl. `libs` |
| tampered tree (production path) | counter `--live --deps <copy with one comment line appended to puppeteer-core CdpSession.js> --reps 1` | rc 1 incl. `libs` |
| setup: busy port | counter `--live`, port held | rc 2 `setup` |
| setup: counter SIGTERM | `kill -TERM` the counter 8 s in | rc 2 `setup`, 0 chromium left |
| setup: deps missing | counter `--live --deps <absent>` | rc 2 `setup` |
| setup: receipt is a directory | counter `--receipt <dir>` | rc 2 `setup` |
| setup: unwritable scratch | `--scratch /proc/…` (bounded `timeout 60`) and `--scratch <chmod-500 dir>/x` | rc 2 `setup` both |
| setup: chromium cannot start | counter `--live` with a 90+-byte `--scratch` (the driver puts TMPDIR under it) | rc 2 `setup` |
| driver pin | counter `--live --expect-driver-sha256 000…0` | rc 1 `driver-pin`, driver not run |

The forgery battery carries the tabi r63 binding classes, source-location-specific: producer-verdict
polarity pair (failures listed while legs are clean; a leg error with empty failures), an ignored producer
`verdict: clean` on a receipt whose PLB leg claims trusted events, a contradictory duplicate leg (a second
PLB-1 with trusted events) and a fabricated leg label (`PLZB-3`), library-identity forgeries, and the three
R97Mut battery-gap classes: `reps` 999 (M40), `missingExists: null` (M42), a resolved leg carrying a stale
`errName`/`errMessage` (M66).

## Counting command

```sh
node scripts/check-client-oopif-uploadmodes-round98.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 <driver sha256 in claims.json> --live --deps <ABS npm install of
  puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; r97 spot-check §6)

1. **D1** (README r97 coverage wording not narrowed): an appended `## Correction — round 97 coverage
   summary (round 98; append-only)` in `corpus/README.md` carrying r97 A1 items 4 and 6.
2. **D2** (R97Mut battery gaps M40/M42/M66; live-only M75-M77, same class as r96 M20/M51/M52/M54/M65/M67):
   answered for this round's counter by battery cases `reps-other`, `missing-exists-null`,
   `resolved-with-stale-error` and by the live-killer harness (a control above). The r97 battery and
   counter bytes stay frozen; the r96/r97 survivors against those frozen counters stay recorded as such.
3. **D3** (transitive-package identity; r95 D1-D3, R95Mut survivors): stay queued in SCORECARD Planned; this
   round's instrument binds the same identity as r97 (declared limit 2).
