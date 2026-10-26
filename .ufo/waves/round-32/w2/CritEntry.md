# CritEntry — line-by-line falsification of `corpus/knowledge/webdriver-bidi-runtime-round-32.md` against the committed transcripts

Seat: CritEntry (leaf, no dispatch). Item: line-by-line falsification of the C1 entry against
`corpus/evidence/round-32/bidi/run1/transcript.jsonl` and `run2` — every observed fact the entry
states (versions, mapper 17.0.2, fixture details, row-verdict wording, §3 "does not show" cells,
§4 Unknowns dispositions, §7/§8 limits) checked against the bytes or the cited report. Milestone C1.
Attacked revision: `b234a58920134424e0d104f137311ff54a16d26b`. Lane files read-only; nothing patched.

## Verdict

The entry's **runtime facts hold**. Every row verdict R1–R15 and R17 is present in both committed
transcripts and reproduces on an independent live session of the frozen gate at REV: `population 16,
admitted 16, failing 0, binding null, live true, exit 0`; the live session's first screenshot is
`ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`, identical to both committed runs,
and both transcript digests equal the receipt's. Versions, mapper 17.0.2, the S124/S125/S126 quotes
(the S125 line numbers included), the fixture bodies, R16's "no command", every §3 "not exercised"
cell, and the §4 dispositions check out against the bytes. **Thirteen sentences are wrong, three of
them materially.** D1 (Medium): the entry says `FIXTURE_SHA256` "digests exactly these bodies, types
and header pair" — the frozen digest does not contain `FIXTURE_HEADER`, so a header-only fixture change
passes `t1` (I changed the header in a copy of the gate and the digest did not move). D2 (Medium):
§8's claim that the four plain counts "close those four holes" is false for the fourth — a receipt
whose two transcripts are the gate's own golden synthetic records with one real first screenshot
spliced in, plus a do-nothing driver with a different digest, satisfies all four counts
(`c1-distinct` `ok:true`) **and** is admitted 16/16 by the frozen gate offline and with `--live`
(artifacts under `w2/CritEntry/forged-receipt/`). D3 (Low–Medium): §8 says the gate admits "four
constructions" while its own cited report documents five admitted constructions and a sixth hole
(CritC1Forgery D1–D6); D5 (fabricated `mined` registry row) is not covered by any of the four counts.
The remaining ten are precision/provenance defects (details below). No §2 row verdict, no §3 gap
cell, and no §4 disposition is contradicted by the committed bytes.

## What I ran

Clone at REV (clean, frozen counter bytes):

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                   # exit 0
$ git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b              # exit 0
$ git -C "$S/clone" rev-parse HEAD                    # b234a58920134424e0d104f137311ff54a16d26b
$ git -C "$S/clone" status --porcelain | wc -l        # 0
$ sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"  # 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  (= claims.json frozenDigests)
$ sha256sum "$S/clone/scripts/bidi-loopback-round32.mjs" # 55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a (= receipt driverSha256)
```

Counting command (the claim's own), from the clone, `TMPDIR=$S XDG_RUNTIME_DIR=$S`:

```
$ node scripts/check-bidi-runtime.mjs --rev b234a58920134424e0d104f137311ff54a16d26b \
    --baseline d805d1d6132430118b206a848b85753ab35d1014 \
    --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
# exit 0
{"schema":"tabi-bidi-runtime-v1","rev":"b234a58920134424e0d104f137311ff54a16d26b",
 "population":16,"admitted":16,"failing":0,"binding":null,"entryFinding":null,"clean":true,"live":true}
# rows: R1..R15, R17 admitted=true, reason=null
```

Plain counts at REV (`measure/c1-distinct.mjs`, unchanged lane script):

```
$ node .ufo/waves/round-32/measure/c1-distinct.mjs "$S/clone" \
    corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json
# exit 0; rowsMarkedYes 16, distinctRowIds 16, distinctTranscriptDigests 2,
# driverEqualsGate false, driverNames [], driverReexports false, ok true
```

Transcript facts (`verify.mjs`, imports the frozen gate only for `FIXTURE`/`FIXTURE_SHA256`):

```
$ node verify.mjs                                  # exit 0
# both transcripts: sha256 matches receipt (8aa97463…, 9918a716…);
# browserVersion 154.0.8037.97; chromedriverVersion 154.0.8037.97 (b510e9d7…{#1673});
# screenshot 6626 B, PNG IHDR 640x480, sha ee0edeb…; one screenshot per run; identical;
# /a.html responseCompleted status 200, x-tabi-fixture: r32; getData body "tabi-bidi-body-0123456789\n";
# cookie tabi_fixture=1; blocked /data.txt?held=1 request 483282.4 continued for the same id;
# locateNodes #h -> 1 node localName h1; two pointer sequences (targets …e.1 = #t, …e.6 = #b);
# userPromptOpened {message tabi-alert, handler ignore}; location.pathname /a.html after traverse -1
```

Fixture / header demos (`header-mut.mjs` = copy of the gate with only `FIXTURE_HEADER` changed):

```
$ node demo/headers.mjs                            # exit 0
/a.html     200 {"cache-control":"no-store", …, "x-other-fixture":"r99"}
/missing.txt 404 {"connection":…,"content-type":"text/plain", …}          # no cache-control
mutated-header FIXTURE_SHA256: 343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843
$ jq -r .fixtureSha256 clone/corpus/evidence/round-32/bidi/receipt.json   # 343cbced… (identical)
```

Forged-receipt counterexample (fixture git repo under scratch; transcripts built with the gate's own
exported `goldenLines`, first screenshot replaced by the real `ee0edeb…` base64 from run1; driver =
a 1-line do-nothing file; real SOURCES.md/entry from REV, S124–S126 rows added after the baseline
commit so `s1` passes honestly):

```
$ c1-distinct.mjs "$R" <entry> <receipt>          # exit 0, ok true, 16 distinct ids, 2 digests, driver≠gate
$ check-bidi-runtime.mjs --repo "$R" --rev <R> --baseline <R~1> --entry <entry> --json
# exit 0: population 16, admitted 16, failing 0, clean true, live false
$ … same with --live --json                        # exit 0: live true, population 16, admitted 16, clean true
```

Host binaries and strings (read-only):

```
$ /usr/bin/chromium --version        # Chromium 154.0.8037.97 Arch Linux                     exit 0
$ /usr/bin/chromedriver --version    # ChromeDriver 154.0.8037.97 (b510e9d7…{#1673})          exit 0
$ pacman -Qo /usr/bin/chromium /usr/bin/chromedriver   # both owned by chromium 154.0.8037.97-1  exit 0
$ file /usr/bin/chromium             # ELF 64-bit LSB pie executable, 14424 B (launcher)
$ strings /usr/bin/chromedriver | grep -o 'chromium-bidi[/@][^",; )]*'    # no match, exit 1
$ strings … grep -c -F: 'bidi-mapper-path=PATH' 1; 'window.runMapperInstance(%s)' 1;
                        'Failed to initialize BiDi Mapper' 1; 'BiDi-CDP Mapper' 1
$ node --version                     # v24.21.0;  node -e 'typeof WebSocket' # function
```

Every browser I started was started by a gate run; all were reaped by the gate's own `finally`.
`pgrep -fa 'chromedriver|chromium'` after the last run shows one line, `/usr/bin/earlyoom …` (not
mine; its `--prefer` list contains the word "chromium"). No tool was installed or upgraded.

## Defects

Severity is impact on the entry's evidence statement, not on the claim's C1 predicate (which holds).

| # | Sev | Path:line | Wrong/unsupported sentence | Evidence | Smallest append-only fix |
|---|---|---|---|---|---|
| D1 | **Medium** | `corpus/knowledge/webdriver-bidi-runtime-round-32.md:41-42` | "the gate's exported `FIXTURE_SHA256`, which digests exactly these bodies, types and **header pair**; a fixture change therefore fails the gate rather than silently re-baselining." | The preimage is `Object.keys(FIXTURE).sort().map(k => [k, type, body])` (`scripts/check-bidi-runtime.mjs:120`); `FIXTURE_HEADER` is a separate constant (`:121`), checked only by the R11 predicate. I copied the gate, set `FIXTURE_HEADER = ["x-other-fixture","r99"]`, imported it: `FIXTURE_SHA256` stayed `343cbced…` = the receipt's value (`fixture-header-demo.txt`). So a header-only fixture change (a) passes `t1` (`:526`) and the committed-run half of R11 (the transcripts still say `x-tabi-fixture: r32`), and (b) fails only the `--live` R11 leg. "header pair" and the unqualified "a fixture change therefore fails the gate" are false. | Append after §1: "Correction (r32 w2): `FIXTURE_SHA256` digests the fixture's paths, media types and bodies only (check-bidi-runtime.mjs:120); `FIXTURE_HEADER` (:121) is not in its preimage. A header-only fixture change passes t1 and the committed-run R11 leg and is caught only by R11 on a `--live` run." |
| D2 | **Medium** | `…round-32.md:189-192` | "the plain counts that close those four holes are recorded …: sixteen distinct row ids, two distinct transcript digests, a driver digest different from the gate's, and a driver that imports neither `liveRecord` nor `PREDICATES`." | The fourth hole is "a synthetic transcript with one real first screenshot spliced in passes the binding" (`:187`). A receipt built exactly that way — two `goldenLines()` transcripts (distinct bytes), `ee0edeb…` spliced into each `captureScreenshot`, a 1-line driver with a different sha — gives `distinctRowIds 16, distinctTranscriptDigests 2, driverEqualsGate false, driverNames [], driverReexports false, ok:true` (`forged-receipt/c1-distinct-forged.txt`) and is admitted 16/16, exit 0, both offline and `--live` (`forged-receipt/gate-forged-{offline,live}.json`; artifacts `forged-receipt/artifacts/`). The counts also test `goldenLines` and re-exports (`c1-distinct.mjs:32,34`), which the sentence omits. | Append after §8: "Correction: the four counts close only the duplicate-row, duplicate-transcript and driver-copy/import holes. They do not close the spliced-screenshot hole: a golden synthetic receipt with one real first screenshot spliced into each run and a do-nothing driver satisfies all four counts and is admitted 16/16 by the gate offline and with `--live`. Transcript provenance stays open (CritC1Forgery D1, high)." |
| D3 | Low–Med | `…round-32.md:183-184` | "The gate's frozen bytes admit **four** constructions the claim's prose excludes (`CritC1Forgery.md`)" | The cited report rates six defects D1–D6, of which D5 is a fifth admitted construction ("`s1` accepts fabricated registry rows … satisfied it for every admitted variant", `CritC1Forgery.md:132-140`) and D6 is `clean` with no minimum population (`:142`). The entry enumerates only D2/D3/D4/D1. None of the four counts the entry lists tests the registry row. | Append: "Five, not four: the cited report's D5 (a fabricated `mined` registry row passes `s1`) and D6 (no minimum population) are also open; none of the four counts tests `s1`." |
| D4 | Low | `…round-32.md:39-40` | "Every response carries `x-tabi-fixture: r32` and `cache-control: no-store`." | The 404 branch sends only `content-type` and the fixture header (`check-bidi-runtime.mjs:131`); the 200 branch sends `cache-control: no-store` (`:132`). Live demo: `GET /missing.txt` → 404 with no `cache-control` (`fixture-header-demo.txt`). The frozen gate's own comment at `:125` makes the same overstatement; the entry copied it. | Append: "Every **200** response carries `x-tabi-fixture: r32` and `cache-control: no-store`; the 404 branch (check-bidi-runtime.mjs:131) omits `cache-control`." |
| D5 | Low | `…round-32.md:48-49` (and `157-159`) | "the binding that distinguishes a real rendering from a synthesised transcript" / "a single screenshot alone would not be enough" | The binding compares only `sha256` of the first `captureScreenshot` payload and `chromedriverVersion` (`check-bidi-runtime.mjs:545-553`). The entry's own §8 (`:187`) says a spliced screenshot passes; my forged fixture passes the binding (`binding null`) with synthetic transcripts, and CritC1Forgery v1 passed with a CDP screenshot. The binding distinguishes a real *screenshot payload*, not a real rendering or a real transcript. | Append: "The binding authenticates the first screenshot payload and the driver version only; a synthetic transcript with that payload spliced in passes it (§8, D2 above). It does not establish that the BiDi transcript itself is real." |
| D6 | Low | `…round-32.md:163` | "`/usr/bin/chromium` is the Arch launcher **script**" | `file(1)`: `/usr/bin/chromium` is a 14,424-byte ELF pie executable; `strings` shows `chromium-flags.conf`, `XDG_CONFIG_HOME`, `/usr/lib/chromium/chromium`. The cited report itself says "the Arch launcher (ELF, strings: …)" (`SentinelPerimeter.md:77`). | Append: "`/usr/bin/chromium` is the Arch launcher (a small ELF, not a shell script) that reads `/etc/chromium-flags.conf` then `$XDG_CONFIG_HOME/chromium-flags.conf` and execs `/usr/lib/chromium/chromium`." |
| D7 | Low | `…round-32.md:165-167` | "ran with `--ozone-platform=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`, `--disable-features=Vulkan` and `--load-extension=<a host copy-url extension>` in front of the driver's own argv (executed argv in `SentinelPerimeter.md`)" | The host file has **five** flags (the omitted one is `--ozone-platform-hint=wayland`), and I observed the live session's executed argv directly: `/usr/lib/chromium/chromium --ozone-platform=wayland --ozone-platform-hint=wayland --enable-features=TouchpadOverscrollHistoryNavigation --load-extension=~/.local/share/omarchy/… --disable-features=Vulkan --allow-pre-commit-input --disable-background-networking …` (`forged-receipt/argv-watch.txt`). The cited "executed argv" is the sentinel's own probe session (`SentinelPerimeter.md:84-88`), not "both receipt runs and the gate's live session"; the receipt records no argv (keys: `browserVersion, chromedriverVersion, driver, driverSha256, fixtureSha256, host, ranAtUtc, runs, schema`). | Append: "Five flags, including `--ozone-platform-hint=wayland`; observed in the live session's executed argv (w2 capture). The receipt records no argv, so 'both receipt runs ran with' these flags is an inference from the launcher path (`ExecDriver.md:30`), not a recorded fact." |
| D8 | Low | `…round-32.md:6` | "source pages fetched and hashed this round, per-fetch URL, status, byte count and sha256 in `.ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md`" | That table has no `session_commands.cc` row (`grep -n session_commands …/fetch-receipts.md` → no match, exit 1), yet line 5 quotes that file at `:287/:288-289/:407`. The fetch is recorded instead in `corpus/SOURCES.md:139` (decoded sha `7b40e94c…`); I re-fetched and reproduced it (`fetch-receipts.txt`). | Append: "S125's fetch receipt is in `corpus/SOURCES.md:139` (decoded sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`), not in `ScribeEntry/fetch-receipts.md`; S124/S126 are in both." |
| D9 | Low | `…round-32.md:5` | "the §7.3–§7.9 command/event definitions named in each row below" | R10 names `session.subscribe`, which is **§7.1.3.4** (session module), outside the range; the browser module is §7.2. The named commands span §7.1, 7.3, 7.5, 7.6, 7.7, 7.9. | Append: "the command/event definitions named in the rows span §7.1–§7.9 (session.subscribe is §7.1.3.4)." |
| D10 | Low | `…round-32.md:99` | R8 §3: "one mouse pointer **on one element**" | Both runs issue two element-origin pointer sequences: `…e.1` (`#t`, seq 27) and `…e.6` (`#b`, seq 33); the row's meaningful click is the second (`transcript-facts.json`, `clickCalls`; run1/run2 frames). | Append: "two element-origin clicks (`#t` to focus, `#b` to fire the handler), one pointer source." |
| D11 | Low | `…round-32.md:92` | R1 §3: "the socket's URL … reachability outside the driver is untested" | Every BiDi command in both transcripts — and in the gate's live leg — was sent by a non-driver process over `ws://127.0.0.1:<port>`, i.e. reachability from outside the driver is exactly what was exercised; what is untested is stability across launches/hosts. | Append: "reachability from another local process is exercised (the client is not the driver); stability across launches, ports, hosts and driver versions is untested." |
| D12 | Low | `…round-32.md:190-191` | "recorded with the round's measurement (`.ufo/waves/round-32/measure/`)" | The only green block there is headed "`== lane working tree (pre-commit; re-run at the measured revision in measure/)`" (`measure/c1-distinct-red-green.txt:1`); no revision-stamped green run exists. I re-derived the same four counts at REV (`c1-distinct-at-REV.json`, exit 0) — the substance holds, the recorded provenance does not. | Append: "the counts were re-derived at REV (b234a58) in w2; the w1 green block self-labels pre-commit." |
| D13 | Low | `…round-32.md:117-118` | U2: "R11 shows only `ResponseData` status and serialized header fields." | The `network.responseCompleted` response object in both transcripts carries `statusText: "OK"`, `protocol: "http/1.1"`, `headersSize`, `bodySize`, `bytesReceived`, `mimeType`, `fromCache` and `content`, besides `status` and `headers`. U2's disposition ("open") stands — no raw header-block bytes are present — but the description of what the event shows is wrong. (§3 R11's "status plus one serialized header value" is predicate-scoped and stands.) | Append: "`ResponseData` also carries `statusText`, `protocol`, `headersSize`, `bodySize`, `bytesReceived`, `mimeType`, `fromCache` and `content`; none is raw header-block or status-line bytes, so U2 stays open." |
| n1 | nit | `…round-32.md:94` | R3 §3: "the driver still used an awaited DOM predicate to settle" | The settle predicate is `window.__ready`, a page-defined promise awaited with `awaitPromise: true` (seq 15-16), after `browsingContext.load`; it is not a DOM read. | Append: "an awaited page promise (`window.__ready`), not a DOM read." |

## Line-by-line support

`holds` = in the committed transcript bytes / frozen gate bytes; `report` = only in the cited w1
report (I did not re-run that probe); `defect` = see the table above.

| Entry line(s) | Fact stated | Verdict / support |
|---|---|---|
| 1 | Chromium + ChromeDriver 154.0.8037.97, loopback fixture, one host build | holds — `--version` both, transcript caps, receipt `host` |
| 1 | Every `yes` re-evaluated on two committed transcripts **and** the gate's live session | holds — gate at REV: live true, 16/16 admitted, exit 0 |
| 5 | S124 dated WD 20261008, revision f922e6af…, §4.1 opt-in quote | holds — fetched 4,235,856 B, sha `dc1077db…`; revision string present (the w1 fetch receipt records one occurrence); sentence is in §4.1 "Establishing a connection" |
| 5 | S125 `session_commands.cc:287-289`, comment at `:407` | holds — fetched 90,944 B base64 → 68,207 B decoded, sha `7b40e94c…`; lines exact |
| 5 | S126 §7 default "dismiss and notify", §16.1 "ignore" | holds — fetched 1,882,653 B, sha `929f2f0b…`; §16.1 is "User Prompt Handler"; table default present |
| 5 | "§7.3–§7.9 command/event definitions named in each row" | **defect D9** (`session.subscribe` is §7.1.3.4) |
| 5 | receipt schema, ≥2 runs, digests | holds — `tabi-bidi-receipt-v1`, 2 runs, digests match |
| 6 | verified-at window; fetch receipts pointer | **defect D8** (S125 absent; my fetches 17:18:03Z–17:23:20Z) |
| 7 | recheck command | holds — executed at REV, exit 0 |
| 10-11 | matrix stated `locally measured: no` for all 17 §2 rows | holds — matrix §2 has 17 data rows, last cell `no` in every one |
| 17-20 | versions; distribution binaries in `/usr/bin` | holds — pacman `-Qo`, `--version` |
| 21-25 | opt-in payload; `webSocketUrl` loopback | holds — driver `:91-92`; caps `ws://127.0.0.1:37279/…`, `:41011/…`; `unhandledPromptBehavior: "ignore"` echoed |
| 26-33 | mapper 17.0.2 / 2026-07-06 / revision 237806… / decoded sha `be5e15ca…`; binary strings; no version string | holds — fetched README decodes to `be5e15ca…`; all four literal strings present; `chromium-bidi[/@]` grep exit 1 |
| 36-39 | fixture bodies, 50 ms `__ready`, `tabi_fixture=1`, `/data.txt` + newline | holds — `FIXTURE` in gate; transcripts |
| 39-40 | every response `x-tabi-fixture: r32` **and** `cache-control: no-store` | **defect D4** (404 lacks cache-control) |
| 40-42 | receipt sha = FIXTURE_SHA256; digest covers "bodies, types and header pair"; fixture change fails gate | first clause holds (`343cbced…`); rest **defect D1** |
| 43-44 | receipt runs ≥2 + gate live session | holds — `:529`; live run |
| 44-47 | first screenshot after `setViewport 640x480`, complete `/a.html` navigate, awaited `__ready` | holds — seq 6-7, 10-14, 15-16, 19-20; same in live leg |
| 47-49 | screenshots byte-identical + same `chromedriverVersion`; "distinguishes a real rendering from a synthesised transcript" | first clause holds (`:545-553`, sha `ee0edeb…`); second **defect D5** |
| 50-52 | loopback navigation; R3 predicate only 127.0.0.1/localhost `/a.html` | holds — `navBase` |
| 52-57 | 8 non-loopback hosts; proxy CONNECTs despite `--disable-background-networking`; no external page from fixture/driver | report — `SentinelPerimeter.md:117-131` lists exactly 8 hosts, 4 of them named in the entry; I did not re-run the netlog |
| 61-63 | `yes` semantics incl. live | holds — gate at REV |
| 67-83 | rows R1–R15, R17 `yes` with the stated predicates | holds — every predicate evaluates null on both transcripts and live; row wording matches `PREDICATES` |
| 82 | R16 "no navigation stop"; only `stopScreencast` | holds — spec has 15 `browsingContext` commands, no nav stop, `stopScreencast` present |
| 92 | R1 §3 reachability outside the driver untested | **defect D11** |
| 94 | R3 §3 "awaited DOM predicate" | nit n1 |
| 95-108 | remaining §3 cells (`navigationFailed`/`domContentLoaded`/`userPromptClosed`/`responseStarted`/`authRequired`/forward traversal/`origin`/`clip`/`SharedReference`/`maxEncodedDataSize` etc.) | holds — none of those methods/params appears in either transcript (grep 0 each); captureScreenshot params `{context}` only; addDataCollector carries `maxEncodedDataSize` but no timing |
| 99 | R8 §3 "one element" | **defect D10** |
| 107 | R16 §3 "0/8 abort-marked" | holds — `stateful-fixture-evidence.md:610-611`, `webdriver-bidi-capability-matrix.md:75` |
| 112-128 | U1 resolved (R1–R15, R17 held); U2–U4 open; U5 resolved narrowly (Node platform WebSocket) | U1/U3/U4/U5 hold — live 16/16; R6 page realm only; no timing; driver imports only `child_process/crypto/fs/net/os/path/url` + `{FIXTURE_SHA256, VIEWPORT, serveFixture}`; Node 24 global `WebSocket`. U2's description **defect D13**; its disposition (open) holds |
| 132-142 | one build/mapper; loopback fixture; predicate-scoped; no perf numbers; R16 unmeasurable | holds |
| 146-156 | R16 rejected; three matrix contracts; cross-browser rejection | holds — matrix `:84-85,101-102` names DOMSnapshot columnar shape, history-entry list, `insertText`; gate `x2-no-counterpart` |
| 157-159 | "a screenshot proves a real browser" rejected via binding | **defect D5** (same root) |
| 163-169 | launcher script; flag list; argv citation | **defects D6, D7** |
| 170-172 | `--no-sandbox` not needed; renderers sandboxed | report — `SentinelPerimeter.md:40-73` (F1); gate `:401` and driver `:91` do pass the flag |
| 173-175 | chromedriver listens unauthenticated on 127.0.0.1 and [::1], no allow-lists | report — `SentinelPerimeter.md:147-160` (F4) |
| 176-179 | each transcript keeps the new-session response incl. `userDataDir` (deleted scratch path), dead `sessionId`/`webSocketUrl`, `goog:processID`, `debuggerAddress` | holds — all five fields present in both transcripts; both `prof-bWDBKf`/`prof-GpdDsH` are gone; driver DELETEs the session (`:266`) and removes the profile (`:271`) |
| 183-187 | four constructions per CritC1Forgery | holds for D2/D3/D4/D1 of that report; **defect D3** (undercount: D5, D6) |
| 187-189 | live leg re-tests every admitted row | holds — gate at REV, and my forged receipt also admits live, so the verdicts do not rest on the receipt |
| 189-192 | four counts close the four holes; driver "imports neither `liveRecord` nor `PREDICATES`" | **defects D2, D12**; the narrow import statement itself holds (`c1-distinct` `driverNames []`, `driverImportsFromGate` = fixture exports only) |

## Fetches (read-only HTTPS GET, `curl -q -sS --proto =https`)

| UTC | HTTP | bytes | sha256 | URL |
|---|---|---|---|---|
| 2026-10-26T17:18:03Z | 200 | 2612 (b64) | `7214c51aa772bbfc41163e207c21d89138447cd2e360c38ae4c578e761d00876` | chromium.googlesource.com/…/third_party/bidimapper/README.chromium?format=TEXT (decoded: `be5e15ca…`, 1957 B) |
| 2026-10-26T17:18:04Z | 200 | 90944 (b64) | `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e` | chromium.googlesource.com/…/chrome/test/chromedriver/session_commands.cc?format=TEXT (decoded: `7b40e94c…`) |
| 2026-10-26T17:18:13Z | 200 | 4235856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` | https://www.w3.org/TR/webdriver-bidi/ |
| 2026-10-26T17:23:20Z | 200 | 1882653 | `929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e` | https://www.w3.org/TR/webdriver2/ |

`fetch-receipts.txt` holds the raw receipt lines. No other network access; no logins, cookies,
credentials or API calls.

## Boundaries

- Not re-run: the two committed driver runs (only their committed bytes were read); SentinelPerimeter
  F1/F3/F4 probes; CritC1Forgery variants; the collector-timing and intercept-phase reports. §7's
  `--no-sandbox`, socket and netlog statements are therefore marked `report`, not `holds`.
- Run: one live gate at REV and three live sessions against my forged fixture (all gate-spawned
  chromedriver/chromium reaped; `pgrep` after: one line, `earlyoom`, not mine). Browser traffic was
  loopback only: the gate's own `serveFixture()`/FIXTURE and chromedriver.
- Fixture repo: `git init -q .` ran with cwd = the repo (one call without `-C`); `rev-parse
  --show-toplevel` equals the repo, all later git calls name `-C`, identity
  `CritEntry <CritEntry@scratch.local>`.
- Lane files: read-only; no lane tracked file, index, jj state or sibling lane touched. Frozen
  scripts unmodified (`2f25af…`, `77b5c8…` untouched; only a copy under scratch was edited).
- Tooling: nothing installed or upgraded.
- Scratch `/fast/scratch/hyaku/tabi-r32/CritEntry` deleted after these receipts were copied to
  `.ufo/waves/round-32/w2/CritEntry/`.
