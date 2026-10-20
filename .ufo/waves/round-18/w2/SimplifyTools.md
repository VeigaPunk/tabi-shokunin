VERDICT: ISSUES

Scope: read-only simplification audit of the round-18 harness, witness, counters and producer at
REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (committed blobs only; no lane edits). Axes walked:
(1) predicate preservation, (2) authority duplication / misleading state, (3) runtime allocation,
(4) evidence honesty. Every finding D1–D12 is a deletion or same-behaviour dedupe that a patched
copy was run against in a private clone; D13 is a candidate only (§7). The lane working tree moved
under this seat mid-probe (other seats' edits, listed in §7); all paths:lines below are REV blob
lines, verified by the digests in §1.

## 1. Baseline identity (committed blobs, not the working tree)

`git show 530f40a…:<path> | sha256sum`:

| Path | sha256 | lines |
|---|---|---|
| `scripts/webmcp-invoke-round18.mjs` | `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155` | 2835 |
| `scripts/freshness-witness.mjs` | `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1` | 285 |
| `.ufo/waves/round-18/measure-c1.mjs` | `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` | 796 |
| `.ufo/waves/round-18/measure-c2.mjs` | `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6` | 1261 |
| `.ufo/waves/round-18/measure-c3.mjs` | `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a` | 1071 |
| `.ufo/waves/round-18/recheck-fetch.mjs` | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` | 140 |
| `scripts/webmcp-invoke-round17.mjs` (frozen) | `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` | 2127 |

Sandbox clone for every runtime probe: `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-simpl-clone`
then `git checkout -q --detach 530f40a…` (exit 0, `git rev-parse HEAD` printed the REV).
LANE was never written: `git -C LANE rev-parse --verify refs/heads/master` = `530f40a…` before and
after the probes; the only lane changes seen are other seats' (see §8).

## 2. Tooling installed (record)

Installed in `/tmp/r18-ast` only, official npm registry channel, reason = AST reachability and
unused-binding analysis; no pacman transaction, no global install, no host service touched:

- `acorn` 8.19.0, `acorn-walk` 8.3.5, `eslint` 9.39.5 (`npm install` with a pinned `/tmp/r18-ast/package.json`, exit 0).
- Host runtime used unchanged: Node `v24.21.0`, git `2.56.0`, Playwright `1.64.0`, Chromium `154.0.8037.97`.

## 3. Negative results (requested categories that are absent)

### 3.1 No dead copied raw WebSocket code

At REV, none of the six round-18 files contains `new WebSocket`:

```
$ for f in r18-invoke18.mjs r18-witness.mjs r18-c1.mjs r18-c2.mjs r18-c3.mjs r18-fetch.mjs; do printf '%-22s new-WebSocket=%s\n' "$f" "$(grep -c 'new WebSocket' $f)"; done
r18-invoke18.mjs       new-WebSocket=0
r18-witness.mjs        new-WebSocket=0
r18-c1.mjs             new-WebSocket=0
r18-c2.mjs             new-WebSocket=0
r18-c3.mjs             new-WebSocket=0
r18-fetch.mjs          new-WebSocket=0
```

The round-17 raw client functions are gone from round 18 (`grep -c "function <name>"`):
`connectRawCdp` 1→0, `waitDevToolsPort` 1→0, `fetchJson` 1→0, `findPageTarget` 1→0. The only
WebSocket references left are the page-level deny (`context.routeWebSocket`, harness `:817-819`)
and the assertion comments/fields for `--remote-debugging-pipe` / `DevToolsActivePort`
(`:1017-1018`, `:1041`, `:1046`). `session.on('event', …)` at `:844` is **not** a stale raw-socket
remnant: Playwright 1.64.0's public `CDPSession` declares the generic `'event'` channel
(`…/playwright/node_modules/playwright-core/types/types.d.ts:18425-18448`, read locally), so it is
live. Do not delete it.

### 3.2 No never-called top-level helper

AST reference analysis over every top-level binding (acorn 8.19.0; command below) reports zero
bindings with zero references:

```
$ node /tmp/refs.cjs /tmp/r18-invoke18.mjs | wc -l        # 86 definitions
$ node /tmp/refs.cjs /tmp/r18-invoke18.mjs | grep -c 'refs=0'   # 0
```

Same for `measure-c1` (46 defs, 0), `measure-c2` (83, 0), `measure-c3` (56, 0), `witness` (20, 0),
`recheck-fetch` (4, 0). `eslint@9.39.5` with `no-unused-vars`/`no-unreachable`/`no-constant-condition`
found only three items in the six files, all reported below (two `_` placeholders, one unused `t0`):

```
/tmp/r18-ast/src/r18-c3.mjs
  1017:51  error  '_' is defined but never used  no-unused-vars
/tmp/r18-ast/src/r18-invoke18.mjs
   927:86  error  't0' is defined but never used  no-unused-vars
  1408:24  error  '_' is defined but never used   no-unused-vars
```

The `_` placeholders are conventional promise reject slots; keep. `t0` is D8.

Note on the frozen old safety code: the retained safety helpers are all called —
`probePortClosed` (`:772`, called `:723`), `closeServer` (`:625`, called `:719`),
`waitToolRemoved` (`:1092`, called `:1946`), `frameObservation` (`:1137`, called `:2190`),
`guardLoopback` (`:792`, called three times). Nothing qualifies as “old safety code whose
functions are never called”.

## 4. Findings (deletions / dedupes)

Every item names the REV block, the proof, the minimal edit, the demonstrated predicate it must
preserve, and the tradeoff. `-` lines are literal REV text. IDs D1–D13 are local to this report.

### D1 — Two identical full-tree scans per H4 phase (highest allocation win)

Location: `scripts/webmcp-invoke-round18.mjs:2492-2493` (before close) and `:1454-1455` (after
close); the cause is `process.env.TMPDIR = runTempDir` at `:1350`; `scanForBytes` at `:644-683`.

```js
2491	          beforeContextClose: {
2492	            runTempDir: scanForBytes(runTempDir, downloadMarker),
2493	            processTmpdir: scanForBytes(tmpdir(), downloadMarker),
2494	          },
```

Proof that both keys scan the same directory (Node 24.21.0 probe):
```
$ node -e "const os=require('os');const {mkdtempSync}=require('fs');const d=mkdtempSync('/tmp/tt-');process.env.TMPDIR=d;console.log(os.tmpdir(),os.tmpdir()===d)"
/tmp/tt-VYgyGN true
```
Observed in the actual REV receipt (`/tmp/r18-simpl/harness-receipt.json`, sha
`5b8771073c68b30f73289ee4df8cdac01aa5fdf462af711f6a22dcaef3903e68`):
`beforeContextClose.runTempDir.root === beforeContextClose.processTmpdir.root` =
`/tmp/tabi-r18-webmcp-invoke-Esumgr`; the two scan objects are JSON-identical
(`filesScanned` 462 before, 460 after). Four full recursive scans run per harness execution; two
are redundant.

Minimal edit (verified): compute one scan at the original scan point and use it for both keys.

```js
        const afterRunTreeScan = scanForBytes(runTempDir, marker);
        result.observations.afterContextClose = {
          runTempDir: afterRunTreeScan,
          processTmpdir: afterRunTreeScan,
          browserGone: run.run.gone === true,
        };
```
```js
        const beforeRunTreeScan = scanForBytes(runTempDir, downloadMarker);
        const observations = {
          downloadMarker,
          invoke,
          responded,
          downloadEvents: downloads.events,
          beforeContextClose: {
            runTempDir: beforeRunTreeScan,
            processTmpdir: beforeRunTreeScan,
          },
        };
```
The scan stays after the download-settle waits (same timing as REV); only the second redundant call
is deleted.

Preserved: the H4 predicate (`:2508-2515`) and `measure-c2.mjs:675-676`, which reads **both**
keys; the patched receipt still passes `invoke-download-refused` and `c2_hazards_closed=6`.
Tradeoff: the two JSON keys still serialize twice. A schema-honest fix (one key) requires deleting
the predicate conjuncts at `:2510-2511`/`:2514-2515` **and** the counter read at
`measure-c2.mjs:675-676`; that is a counter-contract change, not a safe local deletion. Recommend
the alias now, schema cleanup only with counter ownership.

### D2 — Chromium executable is read and hashed once per launch, but only the flagged run's hash is used

Location: run field `:956`, assignment `:1032`, receipt per-run key `:2684`; the only consumer is
the gate at `:2642-2645` (`flaggedRun?.realExecutableSha256`).

Proof: in the REV receipt all three runs record the same digest
`95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a` (distinct count 1);
`runtime.observed.chromium.realExecutableSha256` is the same value. `/usr/lib/chromium/chromium` is
329,260,096 bytes. Measured on this host:
```
$ node -e '… readFileSync + createHash …'
one_hash_ms=160.5 three_hash_ms=508.3 file_bytes=329260096
```
So each harness run reads + hashes ≈987.8 MB (three launches) to produce one value, ≈508 ms and
≈1 GB of transient `Buffer` allocations; only one of the three is checked.

Minimal edit (verified): delete `:956`, `:1032`, `:2684`, and at `:2642` compute once:
```js
const realExecutableSha256 = flaggedRun?.realExecutable ? sha256FileBestEffort(flaggedRun.realExecutable) : null;
```
Net effect: 3 reads/hashes → 1 (≈-660 MB, ≈-0.35 s).

Preserved: the `real_executable_sha_missing` gate (`:2643-2645`) and
`runtime.observed.chromium.realExecutableSha256`; `measure-c2.mjs` never reads
`runs[].realExecutableSha256` (grep at REV: no hit); the round-17 counter reads only
`runtime.observed.chromium.realExecutableSha256` (`round-17/measure-c2.mjs:490`).
Tradeoff: the receipt loses a per-run copy that was identical in every observed run; if launches
could ever use different executables this evidence would need to return (the harness takes one
`--chromium` path, so they cannot today).

### D3 — `runs[].argv` is a second name for `effectiveArgv`

Location: field `:952`, alias assignment `:999` (`run.argv = run.effectiveArgv;`), receipt key
`:2680` next to `:2679`.

Proof: receipt `argv` deep-equals `effectiveArgv` for all three runs; lengths 47/46/47; serialized
duplicate = 5,753 B of the 180,565-B compact receipt.
```
argv===effectiveArgv [ true, true, true ]
```

Minimal edit: delete `:952`, `:999`, `:2680`.
Preserved: `effectiveArgv` stays; the round-17 counter accepts it as a fallback
(`round-17/measure-c2.mjs:640`), and `measure-c2.mjs` (round 18) never reads `runs[].argv`.
Tradeoff: any out-of-repo reader that specifically reads `argv` (none found by
`git grep` at REV) must use `effectiveArgv`.

### D4 — `product` duplicates `version` and mislabels it

Location: run field `:958` (`product: context.browser()?.version() ?? null`), receipt key `:2660`.

Proof: `runtime.observed.chromium.product === runtime.observed.chromium.version` =
`154.0.8037.97`; both are the output of `Browser.version()`, so `product` is not a product name.
No counter or note at REV reads `.product` from the round-18 receipt (grep).

Minimal edit: delete `:958` and `:2660`; keep `version` (`:957`, `:2661`) and `versionSource`.
Preserved: round-17 note recheck reads `.runtime.observed.chromium.version`; nothing reads
`product`. Tradeoff: none observed.

### D5 — `devtoolsPort` is never written and is recorded three times as a constant `null`

Location: field initialiser `:959`, then recorded at flags-off observations `:2157`, runtime
`:2663`, and per-run receipt `:2686`. No `run.devtoolsPort =` assignment exists anywhere (grep:
only the four sites above).

Proof from the REV receipt: `runs[].devtoolsPort` = `[null,null,null]`,
`runtime.observed.chromium.devtoolsPort` = `null`, and the flags-off case stores
`run.devtoolsPort: null`. `measure-c2.mjs` (round 18) and `round-17/measure-c2.mjs` never read
`devtoolsPort` (grep).

Minimal edit: delete the four sites.
Preserved: H3 remains evidenced by `featureSwitches.hasRemoteDebuggingPipe === true`,
`featureSwitches.noRemoteDebuggingPort === true`, `devtoolsActivePortExists === false`, and the
counter's `h3` probe. Tradeoff: removes a field that never carried an observation; do not replace it
with `null` elsewhere.

### D6 — `run.closeError` is written and never read

Location: `:693-695`, the only occurrence of `closeError` at REV.

```js
693	    } catch (error) {
694	      run.closeError = String(error?.message ?? error);
695	    }
```

Minimal edit: `catch { /* context already closed; cleanup() records closure evidence */ }`.
Preserved: the error was already swallowed; no receipt, predicate, or counter exposes
`closeError` (closure keys at `:2587-2606` do not include it). Tradeoff: none.

### D7 — `closure.pids` is a verbatim duplicate projection of `closure.runs`

Location: `:2589`.

```js
2589	    pids: runChecks.map((run) => ({ label: run.label, pid: run.pid, gone: run.gone, processTreePids: run.processTreePids })),
```

Proof: `closure.runs` (`:2588`, fields `:2557-2567`) already carries `label`, `pid`, `gone`,
`processTreePids`; `closure.pids` is 472 B of duplicated JSON; `git grep "closure.pids"` at REV
finds no round-18 consumer (only round-16 historical attack notes about the round-16 receipt and
this definition). The round-17 knowledge note reads `.closure.runs[]`
(`corpus/knowledge/webmcp-invocation-round-17.md:37`).

Minimal edit: delete `:2589` (and the trailing comma). Preserved: `closure.runs`,
`everyStopProof`, and all stop proofs. Tradeoff: none in-repo.

### D8 — `t0` parameter is threaded through launch and never used

Location: signatures `:917`, `:927`; forward `:918`; call sites `:1570`, `:2086`, `:2449`.

Proof: eslint `no-unused-vars` at `:927:86`; `createCDPRecorder(session, Date.now())` (`:1215`)
uses its own clock.

Minimal edit: drop `, t0` from both signatures, the forward, and the three calls. Preserved:
nothing reads it. Tradeoff: none.

### D9 — Constant conditional in the c3 counter's error path

Location: `.ufo/waves/round-18/measure-c3.mjs:1066`.

```js
const why = error instanceof CouldNotEvaluate ? 'could_not_evaluate' : 'could_not_evaluate';
```

Minimal edit: `const why = 'could_not_evaluate';`. Preserved: identical output for every thrown
path (both arms are the same string); verified against the patched copy on
`invalidrev`, `[]`, `a b`, `--self-test x` (all exit 2, byte-identical stdout/stderr; §5).
Tradeoff: none.

### D10 — Redundant disjunct in the c3 usage guard

Location: `measure-c3.mjs:1058`.

```js
1058	  if (argv.length !== 1 || argv[0] === '--self-test') {
```

Proof: the self-test branches at `:1047-1057` return for `['--self-test']` and for
`argv[1] === '--self-test'`; on every path that reaches `:1058`, `argv[0] === '--self-test'`
implies `argv.length !== 1`. Truth table over all seven short vectors (`[]`, `[a]`, `[a,b]`,
`[--self-test]`, `[--self-test,x]`, `[x,--self-test]`, `[a,b,c]`) gives identical decisions.
Minimal edit: `if (argv.length !== 1) {`. Preserved: usage output/exit on all vectors (verified, §5).
Tradeoff: none.

### D11 — Duplicate URL-extraction regex in the c1 counter

Location: helper `measure-c1.mjs:173-175` (`sourceHttpUrls`) and the same regex re-inlined at
`:256` inside `urlClass` (`:254-260`).

```js
256	  const urls = [...row.source.matchAll(/https?:\/\/[^\s|)>`]+/gi)].map(match => match[0]);
```

Minimal edit: `const urls = sourceHttpUrls(row.source);`. Proof: literal regex is identical, so the
row classification is identical; the c1 self-test output is byte-identical before/after
(sha `4c6da7c4…`), and the REV measurement is identical (`c1_rows_rechecked=51`,
`eligible_rows=58`, same `row_classes`, `rejected=[]`; §5). Tradeoff: none.

### D12 — Two directory walks per 200 ms sample in the c2 counter

Location: `measure-c2.mjs:408-410` (`scanDevToolsActivePort`) and `:457-460` inside `sample()`,
which runs at `pollMs = POLL_MS` (200 ms default) for the whole normal/watchdog run.

```js
457	    for (const path of scanDevToolsActivePort(run.tempPath)) devToolsFiles.add(path);
458	    for (const path of allFiles(run.tempPath)) {
459	      if (filenameMatchesDownload(path, DOWNLOAD_SUGGESTED_FILENAME)) liveDownloadFiles.add(path);
460	    }
```

Both calls walk the same tree; `scanDevToolsActivePort` is literally
`allFiles(tempPath).filter(basename === 'DevToolsActivePort')`. Minimal edit (verified): one walk,
two predicates; delete the helper `:408-410`.

```js
    const sampleFiles = allFiles(run.tempPath);
    for (const path of sampleFiles) {
      if (basename(path) === 'DevToolsActivePort') devToolsFiles.add(path);
      if (filenameMatchesDownload(path, DOWNLOAD_SUGGESTED_FILENAME)) liveDownloadFiles.add(path);
    }
```

Preserved: `devToolsFiles` and `liveDownloadFiles` are sets whose contents are identical; `h3` and
`h4` consume only `.length` (`:619-630`, `:677-687`). The c2 self-test stays 21/21 with identical
`{name, pass, expected, actual}` (normalized; §5). Tradeoff: iteration order of the two arrays
changes; no predicate depends on it today.

### D13 — `cases[].events` is an unused third projection of the same frame slice (candidate only)

Location: `scripts/webmcp-invoke-round18.mjs:1475-1477` (`events` = method names), next to
`:1478-1480` (`eventLog` = method+params) and `:1481-1483` (`toolsAdded`), all derived from
`caseFrames`. Measured: `events` = 729 B across the 12 cases; `eventLog` = 25,483 B;
`cdp.frames` = 43,476 B. No counter or note at REV reads `cases[].events`
(`git grep` over both measure files, knowledge, SCORECARD: no hit); the round-17 counter's
`cdpEvents` walk needs `{method, params}` and therefore matches `eventLog`/`frames`, not `events`.

Recommendation: candidate only. `eventLog` already carries the full observation, so deleting
`:1475-1477` is safe by inspection, but it is the smallest win and it removes a reader-facing
projection; land it only if the L1 wants the receipt slimmer. Do **not** touch
`record.downloadEvents` (`:1445`, `:1467`) or `result.observations.downloadEvents` (`:1416`):
`measure-c2.mjs:651-674` cross-checks the two copies, so that duplication is a demonstrated
predicate.

### Duplications examined and deliberately kept

Not every repeated field is dead; these have a demonstrated consumer or carry distinct authority:

| Duplication | Why kept |
|---|---|
| `closure.runs[].effectiveArgv` / `featureSwitches` vs `receipt.runs[]` | `corpus/knowledge/webmcp-invocation-round-17.md:37` reads `.closure.runs[]` as the stop-proof record; deleting it breaks a documented reader even though `measure-c2` does not read closure. |
| `record.downloadEvents` (1445/1467) vs `observations.downloadEvents` (1416) | `measure-c2.mjs:651-674` requires both and compares them; it is a cross-check, not a copy. |
| `producer.sha256` vs top-level `producerSha256` | The round-17 counter requires the top-level name (`round-17/measure-c2.mjs:480`); `measure-c2`'s `producerDigest` accepts either (`:528-531`). Compatibility pair, ≈140 B; keep. |
| `cdp.frames` vs `eventLog` vs `toolsAdded` | Different projections consumed by different walkers: the round-17 counter walks `{method, params}` (eventLog/frames), the round-16 counter reads `toolsAdded`; neither can be derived from the other without changing a counter. |
| `record.fixture` vs `fixtureFile` | `fixture` preserves `fixtureRef` for the embedded fixture (`scripts/webmcp-invoke-round18.mjs#embedded:…`), which `fixtureFile` cannot express. |

## 5. Verification of the proposed deletions (private clone only)

### 5.1 Harness D1–D8

Patch script retained as `/tmp/r18-simpl/apply-harness-deletions.mjs` (16 edits, 15 insertions /
26 deletions, 2824 lines). Applied to `/tmp/tabi-r18-simpl-clone/scripts/webmcp-invoke-round18.mjs`
(sha `37e065b79e5b2cd784072bf5f3e015509402adb481ccbc4ca9f990b9efad708a`), `node --check` exit 0,
committed in the clone as `164603151cfd9b025e90fa894baefbd6d2c8adbb` (probe-only; never imported).

Original at REV, same clone:
```
$ node scripts/webmcp-invoke-round18.mjs --out /tmp/r18-simpl/harness-receipt.json
WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=/tmp/r18-simpl/harness-receipt.json
exit 0; wall 15.44 s; receipt 335,067 B (sha256 5b877107…3903e68); compact JSON 180,565 B
```
Patched:
```
$ node scripts/webmcp-invoke-round18.mjs --out /tmp/r18-simpl/harness-patch2-receipt.json
WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=…
exit 0; wall 14.91 s; receipt 326,539 B (sha256 014f4b80…564641b); compact JSON 173,985 B (-6,580 B, -3.64%)
```
Structural comparison (Node, same files):
```
cases identical(id,status,predicate fn sha256,fixture sha256) = true
controls identical(id,status,predicate fn sha256)            = true
closure.everyStopProof (patched)                             = true
runtime.observed.chromium.realExecutableSha256               = 95b17db7…b330a (unchanged)
download before/after scans aliased, same roots              = true / true
deleted keys absent from runs[]                              = argv, realExecutableSha256, devtoolsPort
deleted key absent from runtime.observed.chromium            = product, devtoolsPort
```

Counter on the patched commit, exact command/output:
```
$ node .ufo/waves/round-18/measure-c2.mjs 164603151cfd9b025e90fa894baefbd6d2c8adbb
exit 0; c2_hazards_closed=6; hazards h1..f6 all true; coverage.pass=true;
artifactSha256=37e065b79e5b2cd784072bf5f3e015509402adb481ccbc4ca9f990b9efad708a
```
Baseline for the same command at REV:
```
$ node .ufo/waves/round-18/measure-c2.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
exit 0; c2_hazards_closed=6; all hazards true; coverage.pass=true;
artifactSha256=0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155
```
This is the required red/green context: the six hazards are green at REV and stay green on the
slimmed artifact. The artifact digest necessarily changes (it is a producer binding); the measured
revision must be re-pointed after landing, which is rebinding, not a predicate failure.

### 5.2 c1 D11

```
$ node /tmp/r18-simpl/c1-orig.mjs --self-test              # exit 0; stdout sha256 4c6da7c4…748de4d
$ node /tmp/tabi-r18-simpl-clone/.ufo/waves/round-18/measure-c1-patched.mjs --self-test
                                                           # exit 0; stdout sha256 4c6da7c4…748de4d (byte-identical)
```
24 cases, allPass=true. REV measurement with each copy (`… measure-c1.mjs 530f40a…`):
both exit 0; JSON equal after removing `counterSha256`; `c1_rows_rechecked=51`,
`eligible_rows=58`, `rejected=[]`, `row_classes.url={"immutable_pinned":17,"living_live":46,"own_work":1}`.

### 5.3 c2 D12

```
$ node /tmp/r18-simpl/c2-orig.mjs --self-test   # exit 0; verdict pass; 21 tests; stdout sha256 d5e02204…396076
$ node /tmp/r18-simpl/c2-patch.mjs --self-test  # exit 0; verdict pass; 21 tests; stdout sha256 ae0d3f19…d0c363
```
The byte hashes differ only because `h3.why` embeds `listenerScans` (a wall-clock poll count);
normalizing to `{selfTest, cases, tests:[{name,pass,expected,actual}]}` gives
`normalized equal = true` for all 21 tests, including `h3_remote_port_present`,
`h3_browser_owned_listener`, `h4_download_not_refused`, and `h4_downloaded_file_is_not_refusal`.

### 5.4 c3 D9/D10

```
$ node /tmp/r18-simpl/c3-orig.mjs --self-test   # exit 0; 26 cases; stdout sha256 5b237307…f2c1fe
$ node /tmp/r18-simpl/c3-patch.mjs --self-test  # exit 0; 26 cases; stdout sha256 5b237307…f2c1fe (byte-identical)
```
REV measurement `measure-c3.mjs 530f40a…` with each copy: both exit 0, equal JSON after removing
`counterSha256`; `c3_routed_closed=5`, d1–d5 all true. Usage/error vectors `[]`, `a b`,
`--self-test x`, `invalidrev`: both copies exit 2 with identical stdout/stderr.

## 6. Why these are deletable without a second convention

- Each edit removes a *duplicate authority* rather than adding one: one scan result, one hash, one
  argv name, one version string, one pid projection, one regex helper, one walk, one error string.
- The only non-trivial semantic choice is D1's alias (keep both JSON keys, compute once). The
  honest single-key schema is deliberately **not** proposed as a local edit because the H4
  predicate and `measure-c2.mjs:675-676` are the counter's authority; changing both would be a
  contract change, and D1's 2-of-4 scans are removed without touching them.
- The verified patched artifact keeps every case/control predicate digest byte-identical
  (`predicate.fnSha256` unchanged for 12 cases and 4 controls), `everyStopProof=true`, and
  `c2_hazards_closed=6`.

## 7. Finite limits

- Static reachability is identifier-based within each file; it cannot see consumers outside this
  repository or dynamic property reads. Mitigated by `git grep` at REV for every deleted field
  (`closeError`, `closure.pids`, `devtoolsPort`, `.product`, `runs[].argv`, `realExecutableSha256`,
  `cases[].events`); no in-repo consumer was found except the ones named above.
- D13 (`cases[].events`) was not part of the patched run; it remains a candidate, not a verified
  deletion.
- Wall times are single runs (15.44 s vs 14.91 s); the allocation claim is anchored in the
  separately measured hash cost (160.5 ms/file, 508.3 ms for three) and in the deterministic
  scan-count reduction (4→2 walks of the same 460+-file tree per run), not in wall-clock delta.
- Runtime probes used only Chromium 154.0.8037.97 / Playwright 1.64.0 on this host, fixture-owned
  loopback origins, fresh `mkdtemp` profiles per launch, and the harness's host-resolver deny; no
  external site, no credential, no port 9222.
- The lane working tree changed during this seat's probes (other seats): at handoff, `M PLAN.md`,
  `M measure-c1.mjs`, `M measure-c2.mjs`, `M measure-c3.mjs`, `M w1/C3Counter.md`, and untracked
  `drafts/w2-source-errata.md`, `sources/DeclarativeValidation.md`, `w2/`,
  `corpus/evidence/round-18/harm-after.json`; `scripts/webmcp-invoke-round18.mjs` itself was
  unchanged in the worktree. More sibling writes may land after this snapshot. All line references
  here are REV blob lines from the digests in §1; the integrator must re-locate by content after
  those edits land.
- The patched-harness commit `1646031…` existed only in `/tmp/tabi-r18-simpl-clone`, which was
  removed after the probes; it is not evidence to be merged. The reproducible source is the 16-edit
  script at `/tmp/r18-simpl/apply-harness-deletions.mjs` (retained, outside the lane) plus the diff
  hunks in §4/§5.

## 8. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/SimplifyTools.md` (this report).

No lane production, fleet, sibling, jj or Git-index file was written; the sandbox clone and `/tmp`
probe files are disposable and were used only for the runs above.
