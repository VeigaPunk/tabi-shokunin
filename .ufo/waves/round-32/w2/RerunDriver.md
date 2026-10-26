# RerunDriver — w2 (falsify), round 32, lane browser & web-interaction craft

**Verdict: HOLDS — no defect found, and nothing needs an append-only fix.**

I attacked the C1 driver claim (`scripts/bidi-loopback-round32.mjs` reproducible on a clean
checkout of `b234a58920134424e0d104f137311ff54a16d26b` and the frozen gate admitting its
receipt under `--live`) by running an independent third execution in my own clone and diffing
it field-by-field against the committed `corpus/evidence/round-32/bidi/run1|run2`. The two new
cold runs reproduce the committed pair exactly at every level the claim depends on: identical
wire order and identical command/event method sequence (71 transcript lines each: 1 `http-res
/session` + 28 `send` + 42 `recv`), identical predicate-relevant values (`getTree` 1 context,
`setViewport` 640x480 dpr 1, `window.innerWidth` 640, `window.__ready` `settled`, locateNodes
`h1`/`input`/`button`, `#t` value `tabi`, `#out` `clicked:tabi`, `getData` 26 bytes matching,
cookies `tabi_fixture=1`, held `/data.txt?held=1` blocked by the registered intercept then
continued, `location.pathname` `/a.html` after `traverseHistory -1`, `tabi-alert` prompt opened
and handled), an **identical first-screenshot** — base64 bytes equal, decoded PNG sha256
`ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`, 6626 bytes, i.e. exactly
the `ee0edeba…51eca5` the claim names — and the same `chromedriverVersion`
(`154.0.8037.97 (b510e9d7…refs/branch-heads/8037@{#1673})`) with the same `browserVersion`
`154.0.8037.97` and the same `driverSha256`
`55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a`. Every residual difference
between my frames and the committed ones is a per-launch identity or clock value (ports,
context/navigation/request/realm/sharedId/UUID identities, `Date` headers, `timings`,
timestamps) — and the *control* pair (committed run1 vs committed run2) differs in exactly the
same field set, so my run is no further from run1 than run2 is. Pointing the frozen gate at my
run (receipt scratch-committed in the clone at the receipt path, commit
`57346a47cc1ed174349cb38005fd98a8e5f81d62`) reads `population=16 admitted=16 failing=0
binding=null clean=true` with exit 0 under `--live`; the same gate at the frozen rev
`b234a58…` with the committed receipt reads identically.

## Setup

```
S=/fast/scratch/hyaku/tabi-r32/RerunDriver-2
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # exit 0
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b # exit 0
git -C "$S/clone" rev-parse HEAD   -> b234a58920134424e0d104f137311ff54a16d26b
node --version                      -> v24.21.0
/usr/bin/chromedriver --version     -> ChromeDriver 154.0.8037.97 (b510e9d7…@{#1673})
/usr/bin/chromium --version         -> Chromium 154.0.8037.97 Arch Linux
```

Driver header read first (`scripts/bidi-loopback-round32.mjs:1-25`): flags `--out`,
`--chromedriver`, `--chromium`; `TMPDIR` must be set and ≤40 bytes (`scripts/bidi-loopback-round32.mjs:281`, refusal otherwise; `:74` falls back to the scratch root only when it is short);
it imports only `FIXTURE_SHA256, VIEWPORT, serveFixture` from the gate and is explicitly "a
client, not the counter" (`:9-12`). Nothing was installed and no external URL was fetched — the
fixture is served on `127.0.0.1` by the gate's `serveFixture()` and every navigation target is a
loopback URL.

`TMPDIR` length: my assigned scratch root `/fast/scratch/hyaku/tabi-r32/RerunDriver-2` is 42
bytes, over the driver's 40-byte gate, so I created a short symlink to a real subdirectory of it
(`/tmp/rd32s -> /fast/scratch/hyaku/tabi-r32/RerunDriver-2/t`, 9 bytes) and passed that as
`TMPDIR`; all bytes still landed in my assigned scratch, removed at the end.

## Runs, commands and exit codes

1. First execution, `--out` outside the clone (diagnostic; its status was masked by the pipe,
   so it is *not* used as evidence for the exit code — it printed both
   `run1: … /bidi/run1/transcript.jsonl` / `run2: … /bidi/run2/transcript.jsonl` /
   `receipt: … /bidi/receipt.json` lines):

   ```
   cd "$S/clone" && TMPDIR=/tmp/rd32s node scripts/bidi-loopback-round32.mjs \
       --out /fast/scratch/hyaku/tabi-r32/RerunDriver-2/bidi 2>&1 | tail -5; echo EXIT=$?
   # EXIT=0 (tail's status; masked — superseded by run 2)
   ```

2. Evidence execution, `--out` at the receipt path inside the clone (this is the run the gate
   was pointed at), status captured directly:

   ```
   cd "$S/clone" && rm -rf corpus/evidence/round-32/bidi && \
   TMPDIR=/tmp/rd32s node scripts/bidi-loopback-round32.mjs --out corpus/evidence/round-32/bidi
   # run1: …/clone/corpus/evidence/round-32/bidi/run1/transcript.jsonl
   # run2: …/clone/corpus/evidence/round-32/bidi/run2/transcript.jsonl
   # receipt: …/clone/corpus/evidence/round-32/bidi/receipt.json
   # EXIT=0
   ```

   Receipt (`ranAtUtc` `2026-10-26T17:06:16.181Z`), byte-shas copied into
   `w2/RerunDriver/bidi-committed/`: `receipt.json` `e1375933a0883167d919977bf712eb4031e5e1499d5c79e1fc10a3814c863c4b`,
   `run1/transcript.jsonl` `bb170f59fe5e2cbbb8684048889ec5ab40bfc1b0f9e4e488d1745b61c5aefe34`,
   `run2/transcript.jsonl` `7af58dd0e86306beb756d63954a8691c32daef175e4ed6b610ff271224cacf3d`.
   (The first, external-`--out` execution is kept as `bidi-run/` for comparison:
   `receipt.json` `ef072133…`, `run1` `92bd413c…`, `run2` `b9dab912…`.)

3. Scratch commit of the receipt inside the clone (toplevel verified):

   ```
   git -C "$S/clone" rev-parse --show-toplevel   -> /fast/scratch/hyaku/tabi-r32/RerunDriver-2/clone
   git -C "$S/clone" -c user.name=RerunDriver-2 -c user.email=RerunDriver-2@scratch.local \
       commit -qam "w2 RerunDriver-2: third independent driver run receipt"   # exit 0
   git -C "$S/clone" rev-parse HEAD  -> 57346a47cc1ed174349cb38005fd98a8e5f81d62
   git -C "$S/clone" show HEAD:corpus/evidence/round-32/bidi/receipt.json | sha256sum
       -> e1375933a0883167d919977bf712eb4031e5e1499d5c79e1fc10a3814c863c4b
   ```

4. Frozen gate pointed at my run, live leg on (`w2/RerunDriver/gate-live.json`):

   ```
   cd "$S/clone" && TMPDIR=/tmp/rd32s node scripts/check-bidi-runtime.mjs \
     --rev 57346a47cc1ed174349cb38005fd98a8e5f81d62 \
     --baseline d805d1d6132430118b206a848b85753ab35d1014 \
     --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
   # EXIT=0
   # population=16 admitted=16 failing=0 binding=null entryFinding=null clean=true live=true
   # rows all admitted: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R17
   ```

5. Same gate at the frozen rev with the committed receipt, live leg on
   (`w2/RerunDriver/gate-live-b234a58.json`):

   ```
   --rev b234a58920134424e0d104f137311ff54a16d26b  →  EXIT=0
   # population=16 admitted=16 failing=0 binding=null entryFinding=null clean=true live=true
   ```

   Both readings clear the frozen target (admitted ≥14, failing 0). The `--live` leg is what
   makes them non-vacuous for my item: `check-bidi-runtime.mjs:545` hashes the counter's *own*
   first screenshot, `:549-554` require both receipt runs' first screenshots to agree with each
   other *and* with that live session's screenshot and requires the receipt's
   `chromedriverVersion` to equal the live session's — `binding=null` means my receipt passed
   all three comparisons against a session started by the gate itself, after my run.

## Comparison with the committed transcripts

Evidence: `w2/RerunDriver/compare.txt` (field-path diff), `w2/RerunDriver/bidi-run/`,
`w2/RerunDriver/bidi-committed/`.

* **Line/wire counts:** my `run1`, my `run2`, committed `run1`, committed `run2` are all 71
  lines: 1 `http-res /session` frame, 28 `send` frames, 42 `recv` frames (28 responses + 14
  events). No extra or missing frame in any pair.
* **Method sequence, identical in all four** (28 sends in order):
  `session.subscribe, browsingContext.getTree, browsingContext.setViewport,
  network.addDataCollector, browsingContext.navigate, script.evaluate, script.evaluate,
  browsingContext.captureScreenshot, browsingContext.locateNodes, browsingContext.locateNodes,
  browsingContext.locateNodes, input.performActions, input.performActions, script.evaluate,
  input.performActions, script.evaluate, script.evaluate, network.getData, storage.getCookies,
  network.addIntercept, script.evaluate, network.continueRequest, script.evaluate,
  browsingContext.navigate, browsingContext.traverseHistory, script.evaluate, script.evaluate,
  browsingContext.handleUserPrompt`.
* **First screenshot:** base64 string identical between my run and committed run1/run2 (8836
  base64 chars, 6626 decoded bytes); decoded sha256
  `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`. The `data` field does
  **not** appear in the field diff — the PNGs are byte-equal, not merely same-size.
* **chromedriverVersion / browserVersion / driverSha256 / fixtureSha256:** equal to the receipt
  fields (`154.0.8037.97 (b510e9d7…@{#1673})`, `154.0.8037.97`,
  `55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a`,
  `343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`); the driver file is
  unchanged from `b234a58` (`driverSha256` equal on both sides).
* **Predicate-relevant values** (receipt `observed`, both my runs vs both committed runs; only
  the ephemeral ones listed above differ): `session` present / `webSocketUrl` ws on 127.0.0.1;
  `getTree` `contexts:1`; `setViewport` `{640,480}`; `window.__ready` `"settled"`;
  `window.innerWidth` `640`; `locateNodes` localName `h1`/`input`/`button`; `#t value` `"tabi"`;
  `#out textContent` `"clicked:tabi"`; `fetch /data.txt` and `held body`
  `"tabi-bidi-body-0123456789"`; `getData` `{bytes:26, matches:true}`; `storage.getCookies`
  `["tabi_fixture=1"]`; `blocked beforeRequestSent` with the registered intercept listed for
  `/data.txt?held=1`; `post-traverse load` `/a.html`; `location.pathname` `"/a.html"`;
  `userPromptOpened` `"tabi-alert"`; `handleUserPrompt` `"accept"`.
* **Residual differences are the documented volatile set**, reproduced verbatim in
  `compare.txt`: `sessionId`, `webSocketUrl`, `chrome.userDataDir` (chrome profile under my
  `TMPDIR`), `goog:processID`, `goog:chromeOptions.debuggerAddress`, `context`,
  `contexts[].clientWindow`, `navigation`, `request.request`, `request.url` /
  `response.url` / `urlPatterns[].pattern` / `request.headers[*].value` (ephemeral port and
  `Host`/`Origin`/`Referer`, plus `response.headers[*]` `Date`), `request.timings.*`,
  `request.cookies[].goog:sourcePort`, `result.subscription`, `result.collector`,
  `result.intercept`, `params.intercepts[]`, `result.realm`, `nodes[].sharedId`,
  `actions[].actions[].origin.element.sharedId`, `params.timestamp`. The control pair
  (committed run1 vs committed run2) shows the same 35 normalized field paths differ, so this
  set is inherent to the driver's own variability, not a difference introduced by my clone.
* Structure-only equality is also what the gate itself re-checks: pointing it at my commit made
  every one of the 16 counted predicates pass on **both** my transcripts *and* on its own live
  session (a row is admitted only after `t2-run` passes on every run and `l1-live` passes on the
  live record — `check-bidi-runtime.mjs:559-577`).

## Scope note (informational, not a defect)

`--live` reports `population=16` although the runtime table lists 17 ids (R1..R17): the gate
counts only matrix rows whose 4th cell is `yes` (`check-bidi-runtime.mjs:508-509`), and the entry's
R16 cell is `no — no BiDi command` at
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:82`, so R16 is outside the population.
That is consistent with the frozen doc's own sentence on R16 ("the gate refuses a `yes` here
(`x2-no-counterpart`)") and with the gate's refusal path at `check-bidi-runtime.mjs:564`
(self-test case `stop-loading-marked` at `:655`). No append-only fix is indicated; recorded only
so the `16` in the gate reading is not mistaken for a missing row.

## Hygiene

* No process I started survives:
  `pgrep -fa 'chromedriver|chromium'` after both gate runs prints one line only,
  `1371 /usr/bin/earlyoom -r 3600 --avoid … --prefer (…|chromium|…)`, which is the host's OOM
  killer matching the literal string in its own `--prefer` regex, not a browser I launched. No
  `chromedriver`, no `chromium` under my seat.
* Only loopback navigation: every URL in the transcripts is `http://127.0.0.1:<ephemeral>` from
  the gate's own `serveFixture()`; the live gate leg likewise. No external fetch was made, so
  there is no fetch-log table to report.
* Writes: `w2/RerunDriver/` (report + evidence), `$S` scratch, and a scratch commit inside
  `$S/clone` only. No lane tracked file, lane index, or fleet path was touched; all lane reads
  were read-only git / plain reads.
* Scratch deleted before yielding, including the `/tmp/rd32s` symlink; nothing of mine remains
  under `/fast/scratch/hyaku/tabi-r32/`.
* Tooling: nothing installed or upgraded (no pacman, no `uv`, no binary drops); system `node`
  v24.21.0, `/usr/bin/chromium`, `/usr/bin/chromedriver` used as-is.
