# tabi — round 96

L1 `TabiR96`. Base `b16b3aa1a90ea0ec734d9834dc49b0615b6ab950` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, tracked=0 untracked=0; no earlier attempt of r96 in `.ufo/watchdog.log`, only
`launch tabi round=96 … attempt=1`). Rounds 92-95 closed admitted (MANIFEST rounds[] 1589, 1594, 1596,
1598), so no fresh-start read is owed; the r95 spot-check (`corpus/lessons/round-95-verifier-spotcheck.md`)
§8 queue is answered in §Record work below. Discipline carried from r92-r95: ONE claim, worded as the
conjunction of the counter's checks and nothing more; its no-work, wrong-site, wrong-library, setup and
forgery controls executed and committed in the same commit that freezes the claim and the instrument bytes,
before the scored run and before any seat is dispatched; `claims.json.frozenAt` is stamped before the
freeze commit is made.

## Claim (frozen before data)

### C1 — coverage (capability `client-oopif-filechooser-linux`, new; first-working round 96)

Surface moved: r92-r95 measured only raw CDP: the lane's drivers hand-attach the OOPIF session and
intercept there. No lane instrument has ever run a production CDP client library against a cross-site
iframe's file chooser (`grep -rln waitForFileChooser corpus/knowledge scripts` at base names only the r78
note, which quotes the API page, S215, and runs no client). This round moves the lane from "what the
protocol does" to "what the two mainstream clients do with it": Puppeteer v25.16.0 never resolves
`page.waitForFileChooser()` for a chooser opened inside a cross-site iframe — even when a separate CDP
connection proves the chooser opened in that iframe — while the same call resolves for a same-site iframe;
Playwright v1.65.0 resolves `page.waitForEvent('filechooser')` and answers it into the child for both.
Sourced: S236 (Puppeteer `packages/puppeteer-core/src/cdp/Page.ts` at tag `puppeteer-v25.16.0`, opened this
round: line 339 builds the listener emitter on `this.#primaryTargetClient`, line 361 binds
`'Page.fileChooserOpened'` on it, lines 561-562 enable `Page.setInterceptFileChooserDialog` on the same
primary client only), read with S230 (Playwright `crPage.ts` v1.65.0, per-frame-session listener) and
S213/S215 (Puppeteer upload/API pages).

**Predicate `C1-CLIENT-OOPIF-CHOOSER-R96`.** On this host's Chromium 155.0.8059.84
(`/usr/bin/chromium --headless=new`, Linux), `scripts/check-client-oopif-chooser-round96.mjs --live`
runs the pinned driver `scripts/client-oopif-chooser-round96.mjs` (sha256 checked before it runs; nonce
passed in its environment; receipt written inside a fresh `mkdtemp` directory) with the npm install named by
`--deps`, for 3 repetitions of the legs PPX, PPW, PPS, PWX, PWS in that order (15 legs), each in a fresh
browser and profile that the client connects to over its DevTools endpoint (Puppeteer `connect
{browserURL}`, Playwright `connectOverCDP`). The parent page `http://127.0.0.1:<http>/parent.html?leg=<id>`
holds one file input `#pp` and one iframe whose child `http://<host>:<child>/child.html?leg=<id>` holds one
file input `#s` (host `localhost` on PPX, PPW, PWX; `127.0.0.1` on PPS, PWS). The client arms its chooser
wait (Puppeteer `page.waitForFileChooser({timeout: 3000})`, Playwright `page.waitForEvent('filechooser',
{timeout: 3000})`), clicks `frame.click('#s')` on the child frame, and on a chooser answers it with the
answer file (Puppeteer `accept`, Playwright `setFiles`). PPW additionally opens a second, raw CDP browser
connection that attaches to the child's iframe target and enables interception there (the witness). The
counter exits 0 iff:

- **every leg**: the DevTools `/json/version` `Browser` is `Chrome/155.0.8059.84` and the client's own
  browser version string is `Chrome/155.0.8059.84` (Puppeteer) / `155.0.8059.84` (Playwright); the leg's
  library, site and witness fields and its exact parent and child URLs match the arm; the client lists
  exactly the frames `[parent URL, child URL]`; the browser-level `Target.getTargets` (taken after load,
  before the click) lists exactly one `iframe` target, with url = the child URL, on PPX/PPW/PWX and none
  on PPS/PWS; the child recorded exactly one trusted `click` on `#s`; the parent's `#pp` holds `[]`;
- **PPX, PPW** (Puppeteer, cross-site): the chooser wait ends with error name `TimeoutError` and message
  exactly ``Waiting for `FileChooser` failed: 3000ms exceeded``; the child's `#s` holds `[]`;
- **PPW**: the witness's interception target is that iframe target and it received exactly one
  `Page.fileChooserOpened`, mode `selectSingle`, integer `backendNodeId` > 0, `frameId` = that target id;
- **PPS, PWX, PWS**: the chooser wait resolves with no error, `isMultiple()` false, and after the client's
  answer the child's `#s` holds exactly `[["tabi-r96-answer.txt", 22]]`; on PWX/PWS the chooser's
  `element()` has id `s`;
- **non-witness legs** carry no witness fields.

Receipt level: schema, nonce, driver pin, a `chromium` string containing `155.0.8059.84`, `crossHost`
`localhost`, `reps` 3, `timeoutMs` 3000, the two libraries pinned exactly (`puppeteer-core` 25.16.0,
lockfile integrity `sha512-VA5Pf54N…IJw==`, `lib/puppeteer/cdp/Page.js` sha256 `31a522df…07e7a0`;
`playwright-core` 1.65.0, integrity `sha512-vNSKgH6Y…+lA==`, `lib/coreBundle.js` sha256 `4ef83305…63f7f1`;
full values in the counter), the answer `{name, size 22}`, three distinct ports in 1024..65535, the exact
leg list, an empty `failures` list with no leg carrying an `error`, 15 distinct UUID-shaped browser ids;
in `--live` mode also `driver-exit` (driver status 0) and `ports-bound` (receipt ports = `--ports`).

**Before → after.** Before (base `b16b3aa1`): the counting command does not exist (`git cat-file -e
b16b3aa1:scripts/check-client-oopif-chooser-round96.mjs` → rc 128), and the lane's newest chooser receipt
(r95, raw CDP) scored by the frozen counter gives `findings` (rc 1). After: `--live` exit 0 with 0
findings over the 15 legs (scored run recorded in `.ufo/waves/round-96/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does not
give its expected verdict, or if any wave artifact shows a leg-level statement of the predicate false on a
`--live` run of the pinned driver with the pinned libraries on this host (a reproduction with ≥1 finding
that is not a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)

1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`, the host user's
   `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and OSes are unmeasured.
2. Two client versions only (puppeteer-core 25.16.0, playwright-core 1.65.0), each attached to an
   already-running browser (`connect` / `connectOverCDP`); `puppeteer.launch` / `chromium.launch` (their
   own launch flags and pipes) are unmeasured. The lockfile integrity and one file's sha256 per package are
   pinned; the rest of the installed tree is trusted as npm extracted it.
3. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92-r95 limit 2).
4. The Puppeteer cross-site outcome is "the wait times out at 3000 ms"; a longer wait, a later chooser
   event, `ElementHandle.uploadFile` (S213, which needs no chooser) and Puppeteer's frame-level APIs are
   not measured. The witness proves a chooser opened in the iframe only on PPW legs, where interception
   is enabled on the iframe session by a second connection; on PPX legs nothing enables interception on
   the iframe session and the claim states only the timeout and the empty child, not whether a chooser
   opened there.
5. The mechanism (listener and interception bound to the primary target session only, S236) is the
   source's account; the counter checks behaviour, not which code path produced it.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes
   that mode, and a same-UID process can read the `--live` nonce and receipt path from `/proc` (r95 A1
   item 6). The claim's counting command is `--live`, with the host's same-UID process space trusted;
   `--reps` other than 3 measures other legs; the claim is the default.

### Pre-freeze probes (observations only; committed under `.ufo/waves/round-96/probes/`)

`probe0.mjs` / `probe0.out` (an ad-hoc script, not the driver): Puppeteer cross-site timeout with and
without a witness (witness saw one chooser, `backendNodeId` 2), Puppeteer same-site chooser + child
filled, Playwright cross- and same-site chooser + child filled. `probe-a.json`: this driver's bytes before
the freeze, 15 legs, 6 timeouts (PPX/PPW) and 9 choosers; the counter scored it clean (163 checks) and the
battery killed 63/63 on it.

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-96/controls/` (script `run-controls.sh`, instrument sha256 in
`instrument-sha256.txt`, rc lines in `rc.txt`; observed values in the freeze commit's `rc.txt`):

| control | command (abridged) | expected |
|---|---|---|
| no-work (base) | `git cat-file -e b16b3aa1:scripts/check-client-oopif-chooser-round96.mjs` | rc 128 |
| no-work (r95 receipt) | counter `--receipt corpus/evidence/round95/…/receipt.json` | rc 1 (schema, libs, leg-set, …) |
| positive | driver (defaults), counter `--receipt` | rc 0 |
| forgery battery | `scripts/negatives-client-oopif-chooser-round96.mjs` on the positive receipt | all killed, positive clean |
| wrong site | driver `--cross-host 127.0.0.1 --reps 1`, counter `--receipt --reps 1` | rc 1 incl. `pp-timeout` and `iframe-targets` |
| wrong library (production path) | counter `--live --deps <puppeteer-core 25.15.0> --reps 1` | rc 1 incl. `libs` |
| setup: busy port | counter `--live`, port held | rc 2 `setup` |
| setup: counter SIGTERM | `kill -TERM` the counter 8 s in | rc 2 `setup`, 0 chromium left |
| setup: deps missing | counter `--live --deps <absent>` | rc 2 `setup` (driver usage refusal) |
| setup: receipt is a directory | counter `--receipt <dir>` | rc 2 `setup` |
| setup: unwritable scratch | counter `--live --scratch /proc/…` (bounded `timeout 60`) and `--scratch <chmod-500 dir>/x` | rc 2 `setup` both (r95 R95Sentinel: was rc 1). The first run of this control, on pre-guard bytes, never returned (Node's recursive `mkdir` spins on a `/proc` path; `controls/rc-firstrun-hung.txt`); the nearest-ancestor writability guard in counter and driver was added before the freeze |
| setup: chromium cannot start | counter `--live` with a 90+-byte `TMPDIR` | rc 2 `setup` |

The forgery battery carries the tabi r63 binding classes, source-location-specific: producer-verdict
polarity pair (failures listed while legs are clean; a leg error with empty failures), an ignored producer
`verdict: clean` on a receipt whose PPX leg claims a chooser, a contradictory duplicate leg (a second PPX-1
that saw a chooser) and a fabricated leg label (`PWZ-3`), plus library-identity forgeries (version,
integrity, chooser-file sha, a missing library).

## Counting command

```sh
node scripts/check-client-oopif-chooser-round96.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 <driver sha256 in claims.json> --live --deps <ABS npm install of
  puppeteer-core@25.16.0 playwright-core@1.65.0> --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; r95 spot-check §8)

1. R95Sentinel's unwritable scratch → `setup` and the `--live` ports/driver-status binding: built into
   this round's counter (`ports-bound`, `driver-exit`, control 11). The r95 counter bytes stay frozen.
2. D1-D3 (mined-gate isolated fixtures, `receiptCommitted` on scored outputs, LOG unparsed token) and the
   17 R95Mut survivors stay queued in SCORECARD Planned; one claim per round, and none of them moves the
   coverage surface this claim moves.
