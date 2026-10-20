# ReconAriaHarness — round-13 ARIA harness anatomy (r16 W1, read-only)

Question: extract Playwright resolution, chromium executable pin, loopback server, request
confinement, and receipt schema/overwrite behavior from
`scripts/aria-loopback-round13.mjs` + `corpus/evidence/round-13/aria/`, so WebmcpHarness can
reuse or deliberately diverge. All line numbers verified against current bytes this session.

Identity baseline (observed, `sha256sum` this session): launcher `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`,
spec `03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc`, config
`87ae779bbe194eb7b5a3d555de5d31184fc50a1bcc49c8499a2a81287707b3f4`, pin
`4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`. All four equal the
digests recorded in `receipt.json` (`sourceSha256`, `source.specSha256`, `source.configSha256`,
`runtime.pinned.pinSha256`), so the committed r13 receipt is byte-matched to current inputs.
Last commit touching the launcher: `9c547dd 2026-10-20 round-13: repair actual runtime inputs
and truthful aggregation`.

## 1. Playwright resolution

- `scripts/aria-loopback-round13.mjs:117-127` `candidatePwtDirs()` — de-duped ordered list:
  1. `<aria>/node_modules/@playwright/test`
  2. `resolve(dirname(process.execPath), '..', 'lib', 'node_modules', '@playwright', 'test')`
  3. `/usr/lib/node_modules/@playwright/test`
  4. `/usr/local/lib/node_modules/@playwright/test`
  5. every `NODE_PATH` entry + `/@playwright/test`
- `:129-143` `resolvePwt()` — first dir whose `package.json.name === '@playwright/test'` **and**
  which has both `cli.js` and `index.js`; returns `{dir, version, pkgPath}`.
- `:685` call site; `:692-694` hard fail (exit 2) unless `pwt.version === pin.playwrightTest`;
  `:696-703` `createRequire(join(pwt.dir,'index.js'))` then `.chromium`.
- Spec consumes the launcher's choice via env: `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:19`
  `PWT_DIR = process.env.TABI_R13_ARIA_PWT_DIR || join(HERE,'node_modules','@playwright','test')`.
  `:199-239` `resolveRuntime()` reads `pwt/package.json`, resolves `playwright/package.json`
  (sibling fallback), `playwright-core` (sibling/nested fallback), re-hashes the chromium
  executable. `:241-253` compares pwt/playwright/core versions and executable identity to pin.

Observed host state (read-only probes this session):

```
$ node -e "… resolve(dirname(process.execPath),'..','lib','node_modules') …"
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules
  playwright        exists=true  1.64.0
  @playwright/test  exists=false
local corpus/evidence/round-13/aria/node_modules: @playwright/test 1.64.0,
  playwright 1.64.0, playwright-core 1.64.0
$ npm ls -g --depth=0
… playwright@1.64.0 …   (no @playwright/test)
```

[INFERENCE] r13 resolves `@playwright/test`. Its global-root formula does land on the fnm global
root, but that root carries only the plain `playwright` package. A plain-script r16 harness that
wants `playwright` must mirror `candidatePwtDirs` under the name `playwright` and drop the
`cli.js` requirement (package.json + `index.js` only). r13's local `node_modules` is not a
global resolution; on this host it wins because it is candidate #1.

## 2. chromium executable pin

- `corpus/evidence/round-13/aria/runtime-pin.json:11-17`: revision `1248`, version
  `156.0.8078.4`, `executableSuffix: "chromium-1248/chrome-linux64/chrome"`,
  `executableSha256: 377a9fc07b495c3b8d0ab8ec1fdfd153641759f9756fea34d8dfce4de82f5025`,
  `bytes: 301186376`.
- Launcher `:704-724`: `chromium.executablePath()` (`:705`), `existsSync`, `statSync`,
  SHA-256 (`:713`), then three independent exit-2 failures — path does not `endsWith`
  `executableSuffix` (`:714`), or `size !== pin.bytes || sha256 !== pin.executableSha256`
  (`:717`).
- Spec repeats the gate: `:223-236` recompute; `:261-269` `assertPinnedRuntime()` asserts
  pwt/playwright/core versions, suffix, sha256, bytes, `nodeMajor >= pin.node.minimumMajor`.
- Live browser version probe `:781-810`: `context.browser()?.version()` first; fallback
  `context.newCDPSession(page)` → `Browser.getVersion` regex on `product`/`userAgent`
  (source `cdp-Browser.getVersion`); last resort `navigator.userAgent`; then
  `expect(version).toBe(PIN.chromium.version)` (`:810`).
- Receipt records it: `receipt.json:27-43` — executablePath
  `/home/vgpnk/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`, sha256, bytes,
  managedRevision, `browserVersionSource: "browser"`.
- Caveat: this pins a Playwright-downloaded *managed* Chromium, not `/usr/bin/chromium`
  (154.0.8037.97). Hard-failing on the byte length/SHA of a pacman-managed binary would break
  on every package update; the transferable part is "record exact path + version probe +
  sha256 in the receipt", not the fail-on-bytes gate.

## 3. loopback server

- `spec:394-469` `startServer()`: `node:http` `createServer`; `listen(0, '127.0.0.1', …)`
  (`:462`) → ephemeral port; `ORIGIN = http://127.0.0.1:${SERVER_PORT}` (`:466`). Bind address
  re-asserted later: `:763` `expect(SERVER_ADDRESS).toBe('127.0.0.1')`, `:764` port > 0.
- Request policy inside the callback: URL parsed against base `http://127.0.0.1` (`:401`);
  non-GET → 405 + `allow: GET` (`:406-415`); `/favicon.ico` → 204 (`:418-425`); any query
  string → 400 (`:426-434`); path must key `FIXTURE_BODIES` else 404 (`:435-444`); success 200
  with `content-type: text/html; charset=utf-8`, `cache-control: no-store`, explicit
  `content-length` (`:445-455`). Every hit logged to `SERVER_LOG` as
  `{method,path,status,bytes,ms}`.
- Fixture bodies are digest-verified before entering the map: `spec:1199-1208` compares
  `sha256(body)` and `body.length` to `MANIFEST.fixtures[name]` and throws; `:1207` rejects
  URL-name collisions (`FIXTURE_BODIES.size !== Object.keys(MANIFEST.fixtures).length`).
- Teardown proof `spec:472-500`: `await SERVER.close()` → `closed:true`; `listeningAfter` from
  `SERVER.listening`; then `fetch(`${ORIGIN}/fixtures/controls.html`,
  {signal: AbortSignal.timeout(T.serverRefusalMs)})` with `serverRefusalMs: 1500` (`:33`);
  throw ⇒ `refusedAfterClose:true` + `error.cause.code`. Observed:
  `"refusalDetail": "ECONNREFUSED"` (`receipt.json:658`).
- **Naming trap**: launcher `:605` defines the aggregate `cleanup.server.listeningAfter` as
  `every(proof.listeningAfter === false)`. So `receipt.json:2521 "listeningAfter": true` means
  "all workers proved *not* listening" — the inverse of the per-worker raw
  `"listeningAfter": false` at `receipt.json:2529`. Do not read the aggregate as a live-server
  claim.

## 4. request confinement

- `spec:587-609` `context.route('**/*')`: allow only `url.protocol === 'http:'` **and**
  `url.hostname === '127.0.0.1'` **and** `url.port === String(SERVER_PORT)` **and** empty
  username/password → `route.continue()`. Everything else: push
  `{url, resourceType, reason:'outside-exact-fixture-origin'}` onto `session.externalAborts`
  and `route.abort('blockedbyclient')` (`:604-609`); unparseable URL uses reason
  `unparseable-url` (`:594-595`).
- `spec:610-616`: `context.on('request')` records every URL into `session.requests` and
  duplicates anything not `startsWith(${ORIGIN}/)` into `session.externalSeen`.
- Post-hoc assertions `spec:762-778`: bind address, 200 navigation, exactly one page, 0
  service workers, `storageState.origins` length 0, `externalAborts` and `externalSeen` both
  `toEqual([])`, every request under ORIGIN, server-side requests limited to `/favicon.ico` or
  a manifest fixture path.
- Aggregated twice: spec `:1252-1254` `externalsZero`, launcher `:449-453` / `:590-593`;
  finding `R13-ARIA-EXTERNAL-01`; `externalRequestsBlocked: 0` (`receipt.json:573`).
- Service workers blocked at two levels: `playwright.config.mjs:30` `serviceWorkers: 'block'`
  and launch option `serviceWorkers: 'block'` (`spec:563`). `acceptDownloads:false`,
  `downloadsPath` inside the temp root, `trace/video/screenshot: 'off'`
  (`playwright.config.mjs:26-28`).
- Scope is explicitly bounded: `claimScope: "page-level exact-origin confinement only; no
  claim of global host no-egress"` (`spec:1404`, `receipt.json:574`). r13 does not firewall
  the host; do not widen this claim for r16.

## 5. receipt schema + overwrite behavior

- Schema string `tabi-aria-loopback-receipt-v1` at launcher `:76` (failure receipt) and `:518`
  (success receipt); worker files accepted only when their `schema` equals the same string
  (`:323`).
- Success shape (`:518-660`, mirrored in `receipt.json`): `schema, wave, claim, lane,
  generatedAt, command, sourceSha256, loopback, externalSite,
  source{path,sha256,specPath,specSha256,configPath,configSha256},
  runtime{node,playwright,playwrightPackage,playwrightCore,
  chromium{executablePath,executableSha256,executableBytes,managedRevision,version,
  browserVersion,browserVersionSource,claimedVersion},command,
  pinned{pinPath,pinSha256,matched,playwrightMatched,chromiumMatched,browserVersionMatched,
  runtimeConsistent,browserVersions}}, pin (verbatim copy), manifest{path,sha256,schema},
  templates[], fixtures[], inputs[], timeouts,
  config{workers,retries,ignoreSnapshots,updateSnapshots,expectTimeoutMs,actionTimeoutMs,
  navigationTimeoutMs,globalChildrenOverride,testTimeoutMs,observed,expected},
  note/documentedContract/noteAdmitted, profile{policy,temp,removed,entries[]},
  externalRequestsBlocked,
  server{host,port,origin,fixtureRoutes,requests,externalRequestsBlocked,claimScope,perWorker[]},
  cases[], negative[], findings[], workers[],
  cleanup{caseCleanup[],allCaseCleanup,server{...},serverOk,serverClosed,
  serverRefusedAfterClose,contextClosed,browserProcs,artifactsDir,artifactsEntries,
  rootOutputsBefore/After/Introduced,outputConfinementOk,tempRootsRemoved,profileRemoved,
  profilesRemoved,browserProcessesAfter},
  summary{cases{expected,expectedIds,ran,passed,failed,missing},negative{total,kinds,
  expectedFailureChecks},workers,workerRestarts,loopback,externalSite,setupError,durationMs},
  verdict`.
- **No overwrite refusal exists in r13.** `launcher:727` unconditionally
  `rmSync(RECEIPT,{force:true})` before launching; `:728` deletes `actual/`; `:804-807` writes
  `.receipt.<pid>.tmp` and `renameSync`s it into place (atomic replace). The failure path also
  replaces whatever exists: `writeFailureReceipt` (`:74-110`) writes
  `.receipt.failure.<pid>.tmp` (`:103`) and renames onto the same `RECEIPT`. "Refuses to
  overwrite differing bytes" is therefore a *new* r16 requirement with no r13 precedent; only
  tmp+rename atomicity transfers.
- Exit contract: 0 only when receipt `verdict === "pass"` and child exit 0 (`:833`); 1 for
  verdict/child failure or repo-root `test-results/`/`playwright-report/` introduced
  (`:827-829`, `:831-832`); 2 for could-not-evaluate via `fail()` (`:111`).
- Output confinement: `rootOutputsBefore` snapshot `:733-736`, re-checked `:790-793`;
  Playwright output forced into `ARTIFACTS` via `--output=` (`:754`).

## Divergences r16 must handle (not r13 behavior)

1. r13 has no `--enable-features=WebMCP,…` / `--enable-blink-features=…`. Its args are the 8
   confinement flags at `spec:567-579` (`--no-first-run`, `--no-default-browser-check`,
   `--disable-background-networking`, `--disable-component-update`, `--disable-default-apps`,
   `--disable-sync`, `--metrics-recording-only`,
   `--disable-features=Translate,OptimizationHints,MediaRouter`). r16 must add WebMCP flags and
   record them (PLAN's receipt `flags`).
2. r13 launches `launchPersistentContext(profileDir, {executablePath: RUNTIME.executablePath,
   headless:true, …})` (`spec:557-583`) under a fresh `mkdtemp` root with
   HOME/XDG_*/TMPDIR redirected (`spec:511-535`). r16 targeting `/usr/bin/chromium` cannot use
   `chromium.executablePath()` as the source of truth.
3. r13 opens CDP only opportunistically (`newCDPSession` inside `assertBrowserPin`, `spec:788`,
   detached in `finally`). r16 needs a persistent per-page CDP session with `WebMCP.enable`
   and event subscription; only the detach hygiene transfers.
4. r13's receipt has no `producerSha256` / `protocolDomain` keys; r16 schema
   `tabi-round16-webmcp-v1` adds them.

## Unresolved / not checked

- No source rows opened — this slice is repo-internal; no URL/quote claims are made.
- Launcher and browser were not run (scout lane); runtime claims above are read from committed
  artifacts plus two read-only shell probes (`node -e` resolution check, `npm ls -g`).
- Whether `WebMCP.enable` behaves as L1's pre-probe on `/usr/bin/chromium` 154 is not
  re-verified here.
