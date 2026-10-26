# ExecDriver — round 32 w1 (C1 build: independent BiDi driver + two-run receipt)

## Verdict

C1's integration artefact is built and it admits. `scripts/bidi-loopback-round32.mjs` is an
independent WebDriver BiDi client (imports only `FIXTURE_SHA256`, `VIEWPORT`, `serveFixture`
from the frozen counter; no `liveRecord`/`PREDICATES` import or copy). Two cold runs
(fresh chromedriver, fresh `--user-data-dir`) recorded 28 commands and their interleaved
events per run in the counter's JSONL format; their first post-`setViewport`/`navigate`
`/a.html` screenshots decode to the **same** 6,626-byte PNG (sha256
`ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`) and the same
`chromedriverVersion` (`154.0.8037.97 (b510e9d7…@{#1673})`). Against a committed receipt in
a throwaway clone of `4181fffb`, the frozen counter
(`scripts/check-bidi-runtime.mjs`, sha256 `2f25af5a…c393` = `frozenDigests`) reads
**population 16, admitted 16, failing 0, exit 0 offline** and **population 16, admitted 16,
failing 0, exit 0 with `--live`, `binding: null`** — i.e. all sixteen admittable matrix rows
hold on the driver's transcripts *and* on the counter's own live BiDi session against the
frozen fixture, with the receipt's first screenshot byte-equal to the counter's live
render. R16 is the only matrix row without a BiDi command and is not in the population.
The claim target (`admitted >= 14`, `failing = 0`, live) is met with 2 rows of headroom;
no row failed, so there is no per-row failure reason to report.

## What was built

- `bidi/bidi-loopback-round32.mjs` → to be placed at `scripts/bidi-loopback-round32.mjs`
  (sha256 `55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a`; the receipt
  records the same digest as `driverSha256`).
  - chromedriver on a free 127.0.0.1 port; `POST /session` with
    `alwaysMatch {browserName:"chrome", webSocketUrl:true, unhandledPromptBehavior:"ignore",
    "goog:chromeOptions":{binary:"/usr/bin/chromium", args:["--headless=new","--no-sandbox",
    "--no-first-run","--disable-gpu","--user-data-dir=<scratch profile>"]}}`.
  - Records one `http-res /session` line then every `send`/`recv` frame in wire order with
    `seq` (71 lines per run).
  - Recipe order is exactly the binding contract: subscribe (load, userPromptOpened,
    beforeRequestSent, responseCompleted) → getTree → setViewport 640×480 → addDataCollector
    → navigate `/a.html` → `window.__ready` (awaitPromise) → `window.innerWidth` →
    **captureScreenshot** → locateNodes `#h`,`#t`,`#b` → click `#t` → key actions `tabi` →
    `#t.value` → click `#b` → `#out.textContent` → fetch `/data.txt` + getData → getCookies →
    addIntercept + non-awaited fetch `/data.txt?held=1` + continueRequest → navigate
    `/b.html` → traverseHistory -1 → `location.pathname` → `setTimeout(alert)` +
    handleUserPrompt accept.
  - Two cold runs sequentially, then `receipt.json`; writes only `--out` and a throwaway
    profile under `TMPDIR`; kills its chromedriver process group and closes the fixture.
- `bidi/run1/transcript.jsonl` (sha256 `8aa97463…aaf851`), `bidi/run2/transcript.jsonl`
  (sha256 `9918a716…c7169d7`), `bidi/receipt.json` (sha256 `e739d53d…f8b88cf4`).

## Per-row result (both runs, and the counter's live leg)

| Row | Surface | Evidence line (run1) | Offline | Live |
|---|---|---|---|---|
| R1 | Browser identity at launch | 1 `http-res` caps: 154.0.8037.97, loopback `ws://`, chromedriverVersion present; 3 first success | yes | yes |
| R2 | Target inventory | 4/5 getTree → 1 context with `context` id | yes | yes |
| R3 | Navigate | 10/14 navigate `/a.html` result url + 13 `browsingContext.load` | yes | yes |
| R4 | Screenshot | 19/20 PNG 640×480 (6,626 B) | yes | yes |
| R5 | DOM shape/state | 21–26 locateNodes `#h`→one `h1`, `#t`→`input`, `#b`→`button` | yes | yes |
| R6 | Wait predicates | 15/16 `window.__ready` awaitPromise → `"settled"` | yes | yes |
| R7 | Viewport pin | 6/7 setViewport; 17/18 `innerWidth` → 640 | yes | yes |
| R8 | Click input | 27/28 pointer down/up on `#t`; 33/34 on `#b`; 35/36 `#out` → `clicked:tabi` | yes | yes |
| R9 | Text fill | 29/30 key actions; 31/32 `#t.value` → `tabi` | yes | yes |
| R10 | Network client events | 11 beforeRequestSent + 12 responseCompleted for `/a.html` | yes | yes |
| R11 | Wire truth | 12 status 200 + `X-Tabi-Fixture: r32` header in ResponseData | yes | yes |
| R12 | Byte truth | 8/9 collector; 39 responseCompleted; 41/42 getData bytes `tabi-bidi-body-0123456789\n` | yes | yes |
| R13 | Pre-settle hold | 45/46 intercept; 47 non-awaited fetch; 49 blocked (`isBlocked:true`, intercept id); 50/51 continueRequest | yes | yes |
| R14 | Navigation history | 55/56 navigate `/b.html`; 60/61 traverse -1; 64 load; 65/66 `pathname` → `/a.html` | yes | yes |
| R15 | Cookies | 43/44 getCookies → `tabi_fixture=1` | yes | yes |
| R16 | Stop loading | — no BiDi command (x2-no-counterpart, not in population) | n/a | n/a |
| R17 | User prompts | 67/68 setTimeout alert; 69 userPromptOpened `tabi-alert`; 70/71 handleUserPrompt accept | yes | yes |

Run2 is line-for-line the same shape (only ports, session ids, sharedIds, realm handles and
the `network.getData` request id differ). Transcript first-screenshot digest is identical in
both runs and, under `--live`, identical to the counter's own live render (`binding: null`).

## Commands run (exact) and exit codes

Scratch root `S=/fast/scratch/hyaku/tabi-r32/ExecDriver` (39 bytes, so chromium's singleton
socket stays inside the 108-byte limit); one live clone:

1. `git clone --shared <lane> "$S/clone"` then `git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` → HEAD `4181fffb…`, `status --porcelain` 0 lines **(exit 0)**.
2. `cp bidi/bidi-loopback-round32.mjs "$S/clone/scripts/"`; `cd "$S/clone"`; `TMPDIR="$S" timeout 240 node scripts/bidi-loopback-round32.mjs --out corpus/evidence/round-32/bidi` → `run1: …/run1/transcript.jsonl`, `run2: …`, `receipt: …` **(exit 0)**; 71 lines per transcript.
3. Stub entry `corpus/knowledge/webdriver-bidi-runtime-round-32.md` (16 rows R1-R15,R17 `yes`, `source: S900`) and one appended `S900` registry row (11 cells, status `mined`, used-by the stub entry) — **scratch clone only, not the lane**.
4. `git -C "$D" -c user.name=ExecDriver -c user.email=ExecDriver@scratch.local commit` → `c8ec438690e641cb044e7eff1dc8423d0b7530cc`, tree `48aca4d4093ae1e03e7c9f610f3a25b712c16a06`, `status --porcelain` empty **(exit 0)**.
5. `TMPDIR="$S" node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json` → `{"population":16,"admitted":16,"failing":0,"entryFinding":null,"binding":null}` **(exit 0)**.
6. Same command `--live --json` → `{"population":16,"admitted":16,"failing":0,"entryFinding":null,"binding":null}` **(exit 0)**.
7. Frozen-counter byte check at the verification commit: `git show HEAD:scripts/check-bidi-runtime.mjs | sha256sum` → `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`; `…check-selfassessment.mjs` → `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`; `git diff --name-only 4181fffb… HEAD -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs` → **0 lines** (counters untouched after the freeze).
8. Process cleanup: `pgrep -fa 'chromedriver|chromium' | grep ExecDriver | wc -l` → `0`. Two chromedriver/chromium trees remain on the host under
   `/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…` and `TMPDIR=/run/user/1000/tabi-ei-I2oswZ` — a sibling seat's, deliberately not killed by me. The `earlyoom` line matches the pattern but is a host service.

Before-state (cited, not re-run by me): `.ufo/waves/round-32/baseline/README-receipts.md`
`c1-J1-do-nothing` — population 0, admitted 0, `e1-entry-absent`, exit 1.

## Retained evidence (output dir)

- `bidi/bidi-loopback-round32.mjs` (driver, `55dbef88…070a`)
- `bidi/run1/transcript.jsonl` (`8aa97463…aaf851`), `bidi/run2/transcript.jsonl` (`9918a716…c7169d7`)
- `bidi/receipt.json` (`e739d53d…f8b88cf4`) — `tabi-bidi-receipt-v1`, `fixtureSha256 343cbced…2843`, `browserVersion 154.0.8037.97`, `chromedriverVersion 154.0.8037.97 (b510e9d7…)`, `driver scripts/bidi-loopback-round32.mjs`, `driverSha256 55dbef88…`, `host {uname, chromium --version, chromedriver --version}`, `ranAtUtc 2026-10-26T16:05:25.261Z`, plus per-run `observed` step→value (the table above).
- `offline.json`, `live.json` — the two counter readings verbatim.

## What the L1 must do with it (integration notes, not done here)

- Copy `bidi/bidi-loopback-round32.mjs` → `scripts/bidi-loopback-round32.mjs`, and
  `bidi/{run1,run2,receipt.json}` → `corpus/evidence/round-32/bidi/` (receipt paths are
  already `corpus/evidence/round-32/bidi/runN/transcript.jsonl`).
- Write the real entry at `corpus/knowledge/webdriver-bidi-runtime-round-32.md` with the
  same header (`Row | Surface | BiDi method | Measured | Evidence`) citing S123-S126; the
  `S900` stub row and stub entry exist only in the deleted scratch clone and must not be
  copied. The gate's `s1-source-row` needs a registry row that is `mined`, opens after the
  baseline, and names the entry in used-by.
- If the entry marks R16 `yes` the counter scores `x2-no-counterpart`; leave it out or
  leave it `no`.

## Risks / limits

- **Host-build binding.** `t3-binding` compares raw screenshot bytes to the counter's live
  render; it held here twice and against live, but the receipt is a property of this exact
  chromium build. Re-running the driver on a different build (or after a font/flag change)
  would need a fresh receipt; the gate would then fail `t3-binding` rather than silently
  pass.
- **Traversal realm race.** Immediately after `traverseHistory` the realm is replaced and
  `script.evaluate` can answer `Cannot find context with specified id` (observed once on the
  first development run). The driver now waits for the post-traversal `load` and retries the
  `location.pathname` poll; in the two recorded runs no error frame occurred, but a retry
  would appear as an error `recv` line in the transcript and is harmless to the predicate.
- **Two runs, sequential, one host.** No cross-machine or parallel-run evidence; the claim
  asks for exactly this.
- **Independent-client claim is structural**: the driver does not import `PREDICATES` or
  `liveRecord`, but both are authored in the same lane this round; the live leg is the leg
  that binds bytes, and it passed.
- Scratch (`$HYAKU_SCRATCH/tabi-r32/ExecDriver`, 166 MB) deleted after copying the four
  receipt artefacts; the verification clone commit `c8ec438` is therefore not retrievable —
  reproduce with the commands above (the tree digest `48aca4d4…` is recorded for that reason).
- No tool installs or upgrades were needed this wave; nothing was added to the host.

Report: .ufo/waves/round-32/w1/ExecDriver.md
