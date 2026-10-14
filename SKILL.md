---
name: tabi-shokunin
description: Domain specialist — browser & web-interaction craft. Rank: shonen (probation).
---

# tabi-shokunin

browser & web-interaction craft playbook. Probation (rounds 1-3) builds the corpus from
measured surfaces; every rule below cites a measured anchor. Nothing here is oral
knowledge. Observation / inference / unknown stay separate; errata append-only.

**Sufficiency contract — this file is executable alone.** A fresh agent with only this
document can: (1) run a loopback evidence capture start-to-finish (§Runbook — commands
are copy-paste); (2) grade the result against the evidence ladder (§Evidence ladder);
(3) prove cleanup and closure (§Runbook step 13); (4) route every interaction class
through the approval table (§Approval table). If a hash in §Pins has moved, every
citation is stale — re-verify the note before reuse. Round-3 executor test (TABI-R3-4,
document-only execution): **SUFFICIENT** — every copy-paste command ran unmodified; its
erratum fixes are applied in this revision (`executor-test-sufficiency.md`, pin in §Pins).

## Standing rules

- Read-only substrates unless PROVINCE.md declares a write surface;
  detection-and-report for operator-owned remediation.
- Secrets shape-only, never content-read.
- Every claim: measured anchor (path:line, command output, evidence id).
  Observation / inference / unknown stay separate.
- Errata append-only; rejections kept (`corpus/QUALITY.md:3-7`).

## Pins — sources and staleness rule

sha256 first 12, re-derived 2026-10-14 (`sha256sum corpus/knowledge/*.md`; re-run
TABI-R3-3, output staged `/tmp/tabi-r3-3-anchors/anchors.txt` — volatile):

- Round-1 notes: `webbridge-plugin-anatomy.md` `5e0fbe35feea` ·
  `browser-surface-census.md` `70d1d455ee18` · `cdp-evidence-patterns.md` `599e7d323c48`.
- Round-2 notes: `live-dynamic-capture.md` `56224aa88430` ·
  `webbridge-daemon-disposition.md` `9240f1d66a8c`.
- Round-3 notes: `interaction-approval-table.md` `70ce826303d0` (216 lines — `wc -l`;
  lane TABI-R3-2; the finalized C1–C6 / A1–A12 taxonomy) · `executor-test-sufficiency.md`
  `1262708864db` (297 lines — `wc -l`; lane TABI-R3-4; the no-oral-context executor test,
  verdict SUFFICIENT) · `multi-step-journey.md` `67447c028e90` (296 lines — `wc -l`; lane
  TABI-R3-1; four-page loopback journey, six per-step captures per run). The round-3 notes
  were still being updated at pin time — re-derive before citing.
- Substrate, read-only: plugin `kimi.plugin.json` `e70aff5c40ff`; plugin skill `SKILL.md`
  `84a8e69d04c5` (158 lines); `references/operations.md` `b811d9c23dfd` (34 lines)
  (`sha256sum` over `~/.kimi-code/plugins/managed/kimi-webbridge/`, 2026-10-14).

A hash change means the citations below are stale — re-verify against the note before
reuse. History: the round-1 pins `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` matched the
committed round-1 blobs; the round-2 errata are pure appends on top (each errata header
records its pre-append hash; nothing above an append point was edited). One erratum bites
directly: `corpus/knowledge/cdp-evidence-patterns.md:139-150` corrects record-envelope
item 1 — `url` holds the URL **as-normalized**, so record the as-read-back string
alongside the exact navigation input. Both round-2 notes' evidence bytes are `/tmp`-staged
(`live-dynamic-capture.md:1`) — the archive obligation stands (`cdp-evidence-patterns.md:92`).
Citation convention: paths are abbreviated after first mention in a section (e.g.
`substrate SKILL.md`, `anatomy`, `<note>.md` for the corpus notes), and a bare `:line`
continues the note cited immediately before it.

## Runbook — loopback capture, start to finish

The measured harness this recipe distills: `driver.sh` (85 lines) + `capture.mjs`
(209 lines) from round 2, staged `/tmp/tabi-r2-1-capture/` (volatile; sha pins
`live-dynamic-capture.md:52-56`). Ports and paths below are the measured precedent —
adapt, don't guess. Every step that produces evidence writes it to a file under the
run's output dir; `/tmp` bytes need archiving before they count (step 13). This exact
chain was replayed end-to-end on 2026-10-14 (TABI-R3-3 smoke; staging
`/tmp/tabi-r3-3-smoke/`, volatile): both fixed-state PNGs and both DOM-shape shas
reproduced the round-2 values byte-for-byte, ports closed, both post-kill curls exit 7.

**0. Inventory.** `node --version` (≥21 needed — built-in global WebSocket, zero npm
deps) and `node -e "console.log(typeof WebSocket)"` → `function`; `chromium --version`;
`python3 --version` (`cdp-evidence-patterns.md:14-18`; round-2 host: node v24.21.0,
chromium 152.0.7977.82, python 3.14.7). Host launchers inject flags — what you type is
not the effective command (`cdp-evidence-patterns.md:18`).

**1. Scratch + freeze the methodology.** Namespace every write
`/tmp/<lane>-r<round>-<seat>-*/` from the first write. Write the fixture in (reference
bytes embedded in §Reference fixture; sha256 `21e27aa6…1c99`), then pin its bytes:
`sha256sum site/page.html` → methodology sha (`live-dynamic-capture.md:52-56`) — stop if
it mismatches the embedded pin: you are not running the pinned methodology.

**2. Port precheck.** Both ports must be free before launch, loudly:
`ss -ltn | grep -E ":(19411|19412)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"`
(`driver.sh:15-16`).

**3. Serve the fixture (loopback only).**
`python3 -m http.server 19411 --bind 127.0.0.1 --directory <scratch>/site > <out>/http.log 2>&1 &`
then capture `HTTP_PID=$!` (`driver.sh:18-21`). Evidence: the listen line
`ss -ltnp | grep 19411` (users:(("python3",pid=N,…)))
(`live-dynamic-capture.md:24-27`). Confirm fixture URLs return 200 in `http.log`.

**4. Launch a fresh headless chromium on a loopback debug port, own profile.**
```sh
setsid nohup chromium --headless=new --remote-debugging-port=19412 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir=<out>/profile \
  --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking \
  about:blank > <out>/chromium.log 2>&1 &
```
(`driver.sh:23-30`; round-1 variant `cdp-evidence-patterns.md:23-27`). The debug port
is full browser control — loopback binding only (`cdp-evidence-patterns.md:91,34`).

**5. Wait for the CDP endpoint, bounded.**
```sh
for i in $(seq 1 50); do curl -sf "http://127.0.0.1:19412/json/version" > <out>/json-version.json && break; sleep 0.2; done
curl -sf "http://127.0.0.1:19412/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; exit 11; }
```
(`driver.sh:32-36`; 10 s envelope). `/json/version` carries `Browser`
(`Chrome/152.0.7977.82`), `Protocol-Version` (`1.3`), `webSocketDebuggerUrl`
(`cdp-evidence-patterns.md:40-42`). The browser WS endpoint is also printed to
`chromium.log`: `DevTools listening on ws://127.0.0.1:19412/devtools/browser/<uuid>`
(`:35`).

**6. Record the effective child process line — it is evidence, not a duplicate.**
`ps -eo pid,ppid,args | grep "[c]hromium" | grep "user-data-dir=<out>/profile"`
(`driver.sh:41-44`). The child line shows the host-injected flags the typed command
never had (`--ozone-*`, `--load-extension=…`, appended `--ozone-override-screen-size`)
(`cdp-evidence-patterns.md:30-32`; `live-dynamic-capture.md:29-33`). Keep the discovered
PIDs — they are the kill list (step 13).

**7. Connect a CDP client and open the session slot.** Node ≥21's built-in `WebSocket`;
connect to the page target's `webSocketDebuggerUrl` from `/json/list` (find the target
by `type:"page"`, then match by `url`/`title` — ids are per-launch, never key on them)
(`capture.mjs:20-34`; `cdp-evidence-patterns.md:44-52`). Record now, verbatim: capture
time (UTC + local), browser WS endpoint, target `id` + `frameId`
(`cdp-evidence-patterns.md:86`). Send CDP commands as `{id, method, params}` JSON over
the socket, one pending-map (`capture.mjs:36-50`).

**8. Pin the viewport, navigate, wait on state.**
`Emulation.setDeviceMetricsOverride {width:800,height:600,deviceScaleFactor:1,mobile:false}`
→ screenshots carry their own geometry, independent of window-metric quirks
(`live-dynamic-capture.md:44-50`; `capture.mjs:155`). `Page.navigate {url}`; poll
`document.readyState === 'complete'` (the load event raced unreliably — polling is the
robust wait) (`cdp-evidence-patterns.md:66`; `capture.mjs:156-160`). On dynamic pages,
poll the exact expected DOM state next — e.g. `#status === 'hydrated'`, then per click
`li.length === N && #confirm-N present` (`live-dynamic-capture.md:35-42`;
`capture.mjs:161-164,184-190`). Two rAF frames settle before every shutter
(`capture.mjs:70-71`).

**9. Capture (this is one capture; a claim needs the right rung — §Evidence ladder).**
- `Page.captureScreenshot {format:"png", captureBeyondViewport:true}` → decode base64 →
  write PNG to a file (never base64 in the record) → sha256 + byte count + W×H read from
  the PNG IHDR (`bytes.readUInt32BE(16/20)`) (`capture.mjs:113-119,57-58`;
  `cdp-evidence-patterns.md:68-73`). Read the PNG back visually once per class —
  rendering matches the authored fixture is itself evidence
  (`live-dynamic-capture.md:91-94`).
- `DOMSnapshot.captureSnapshot {computedStyles:[]}` → derive a shape text (node names,
  attributes, text values) and a struct list (`depth:name`), count nodes. Values are
  **indices into `strings`**; text nodes carry `nodeValue`; the node column is columnar
  with `parentIndex` (`capture.mjs:73-111,118-119`; `cdp-evidence-patterns.md:75-77`).
  Pseudo-element nodes (`::marker`) are emitted and counted — classify when comparing
  node counts (`live-dynamic-capture.md:96-101`).
- Cross-check inside the capture: read the volatile region as data too
  (`capture.mjs:122-129`) and prefer two independent surfaces agreeing (`/json/list`
  `title` vs `document.title`; node count via two methods). **Define the count before
  comparing**: DOMSnapshot's node count includes text and pseudo-element nodes (measured
  55 nodes on the reference fixture vs 21 elements for the same state) — an
  apples-to-oranges pair, not staleness (`executor-test-sufficiency.md` step 9f).
  Disagreement between *like* counts is evidence (`cdp-evidence-patterns.md:89`).
- Idempotence: on a quiescent page, capture twice while idle (measured: 300-350 ms
  apart) — identical hashes mean the capture operation is stable; a difference means
  something moved, find it before claiming determinism (`capture.mjs:172-175`;
  `live-dynamic-capture.md:66-67,167-168`).

**10. Interact (when the claim is action-effect).** Find the target rect first — measured
recipe (evaluate, then center):
`(() => { const r = document.querySelector('#btn').getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`
(`capture.mjs:176-179`) — then real input: `Input.dispatchMouseEvent`
`mousePressed`+`mouseReleased` pairs at that center (`capture.mjs:180-191`;
`live-dynamic-capture.md:86-89`). Synthetic `el.click()`/`fill` can be ignored by
`isTrusted`-checking pages — see §Approval table. After each action, state-wait (step 8)
before the next capture; the pair before/after is the evidence
(`live-dynamic-capture.md:151-173`).
- Text input via webbridge `fill` is clear-and-insert: append = read → concat → fill
  (`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:117-121`).

**11. Compare across runs — mechanically.** A compare script produces a table
(`compare.tsv`); never hand-transcribe hashes (`live-dynamic-capture.md:52-56`). The
measured table's shape: `comparison | verdict | sha_a(16) | sha_b(16)`, one row per
pairing — within-run idempotence, cross-run identity, and the mutation delta kept as a
`DIFFER` row (`/tmp/tabi-r2-1-capture/compare.tsv`, volatile). Byte-identity check = same
sha; if the methodology shas changed, you did not re-run the same experiment.

**12. Keep the differing pair.** Capture the volatile class too (the `?nondet=on`
counterexample) — a determinism claim without its counterexample is unfalsifiable
(`live-dynamic-capture.md:156-159`).

**13. Cleanup + closure proof (all of it, in one script).**
```sh
kill $CHROMIUM_PIDS 2>/dev/null          # discovered PIDs from step 6 — never pkill -f
kill "$HTTP_PID" 2>/dev/null
sleep 1
SURV=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=<out>/profile" | awk '{print $1}')
[ -n "$SURV" ] && { echo "escalating kill -9: $SURV"; kill -9 $SURV; sleep 1; }
# proof:
ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=<out>/profile"   # must be empty
ss -ltn | grep -E ":(19411|19412)\b"                                      # must be empty
curl -s -o /dev/null "http://127.0.0.1:19412/json/version"; echo "curl cdp exit=$?"   # expect 7
curl -s -o /dev/null "http://127.0.0.1:19411/page.html";   echo "curl http exit=$?"   # expect 7
```
(`driver.sh:60-86`; `cdp-evidence-patterns.md:94-105`). Kill by explicit PID only —
`pkill -f` self-matched the invoking shell once (kill "worked", verification never ran;
an unverified kill is an unknown, not a cleanup) (`cdp-evidence-patterns.md:105`). A
closure check can also self-match because *other text in the same command line* contains
the search string — verify with an exact pattern in a clean command
(`live-dynamic-capture.md:182-188`). **Archive or it didn't happen:** `/tmp` hashes are
verifiable only while `/tmp` lives; copy bytes to durable storage before citing
(`cdp-evidence-patterns.md:92`).

### Reference fixture (embedded — executor-test G1 fix)

The round-2 fixture bytes, embedded so a fresh executor without `/tmp/tabi-r2-1-capture/`
can re-run the *pinned* methodology instead of authoring a new one. Byte pin:
`sha256 21e27aa6619a41d2a68228b8fec90661b3b14aceb3d70e923f3400ab00691c99` (1,903 B;
61 newlines — the source ends without a trailing newline; strip the final newline that
Markdown extraction adds before hashing). Usage: write these bytes to
`<scratch>/site/page.html`, `sha256sum` it, and continue only on a match
(`executor-test-sufficiency.md` G1).

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R2-1 fixture</title>
<style>
  html, body { margin: 0; padding: 0; overflow: hidden; background: #ffffff; color: #111111;
               font: 16px/1.5 monospace; }
  #frame { width: 800px; height: 600px; box-sizing: border-box; padding: 24px; }
  #btn { font: inherit; padding: 4px 12px; }
  .confirm { color: #0a5; }
</style>
</head>
<body>
<div id="frame">
  <h1>TABI-R2-1 dynamic fixture</h1>
  <p id="static">static paragraph never mutated</p>
  <button id="btn">mutate</button>
  <p>count: <span id="count">0</span></p>
  <ul id="list"></ul>
  <div id="confirms"></div>
  <p>status: <span id="status">booting</span></p>
  <p>clock: <span id="clock">never</span></p>
  <p>random: <span id="random">never</span></p>
</div>
<script>
(function () {
  var nondet = new URLSearchParams(location.search).get('nondet') === 'on';

  setTimeout(function () {
    document.getElementById('status').textContent = 'hydrated';
  }, 150);

  if (nondet) {
    var tick = function () {
      document.getElementById('clock').textContent = String(Date.now());
      document.getElementById('random').textContent = Math.random().toString(36).slice(2, 10);
    };
    tick();
    setInterval(tick, 250);
  }

  var count = 0;
  document.getElementById('btn').addEventListener('click', function () {
    count = count + 1;
    document.getElementById('count').textContent = String(count);
    var li = document.createElement('li');
    li.id = 'item-' + count;
    li.textContent = 'item ' + count;
    document.getElementById('list').appendChild(li);
    setTimeout(function () {
      var d = document.createElement('div');
      d.className = 'confirm';
      d.id = 'confirm-' + count;
      d.textContent = 'confirmed ' + count;
      document.getElementById('confirms').appendChild(d);
    }, 120);
  });
})();
</script>
</body>
</html>
```

## Capture-script call reference (what the measured harness sends)

| CDP call | Params used | What you keep |
|---|---|---|
| `Runtime.evaluate` | `{expression, awaitPromise, returnByValue:true}` | wait predicates' result; volatile readouts (`capture.mjs:51-55,122-129`) |
| `Emulation.setDeviceMetricsOverride` | `{width:800,height:600,deviceScaleFactor:1,mobile:false}` | viewport record (`capture.mjs:155`) |
| `Page.navigate` | `{url}` | returned `frameId` (== target id when observed) (`cdp-evidence-patterns.md:66`) |
| `Page.captureScreenshot` | `{format:"png", captureBeyondViewport:true}` | PNG bytes → file, sha256, dims (`capture.mjs:115-117`) |
| `DOMSnapshot.captureSnapshot` | `{computedStyles:[]}` | columnar nodes + `strings`; shape text/struct (`capture.mjs:118-121`) |
| `Input.dispatchMouseEvent` | `{type:mousePressed\|mouseReleased, x, y, button:"left", clickCount:1}` | before/after pair + click record (`capture.mjs:180-183`) |
| `Page.getLayoutMetrics` | `{}` | viewport record (`capture.mjs:169`) |

HTTP surfaces: `/json/version` (browser identity, step 5), `/json/list` (targets;
time-varying inventory — snapshot at capture time, never census) (`cdp-evidence-patterns.md:44-52`).

## Evidence ladder — climb to the rung the claim needs

Per-claim-class capture mechanics live in the rows below and in §Runbook; this ladder
orders how strong the evidence under a claim is. Climb to the rung the claim needs — and
**never present a lower rung as support for a higher one.** Every rung still carries the
9-item record envelope.

| Rung | Evidence captured | Supports | Recipe | Measured anchor |
|---|---|---|---|---|
| 1 — **static bytes** | sha256-identical artifact, plus a re-capture proving the capture operation idempotent | "the page renders X" when the content is frozen | freeze fixture bytes (step 1) → capture twice while idle (step 9) → re-run the whole harness (fresh server+browser) and re-hash | det-before PNG byte-identical within a run (350 ms apart) and across two independent server+browser processes (`live-dynamic-capture.md:66-67,107-110`); a third fresh server+browser pair (TABI-R3-3 smoke, 2026-10-14; staging `/tmp/tabi-r3-3-smoke/`, volatile) reproduced both fixed-state PNG shas; the executor test reproduced the same det-before sha across its two runs (`executor-test-sufficiency.md` §2); round-1 cross-session re-verification `cdp-evidence-patterns.md:151-157` |
| 2 — **dynamic capture** | before/after pair under sha-pinned methodology and state-waits; the volatile class captured too | action-effect claims — "clicking X changed Y"; JS-produced states | step 10 (interact + state-wait) around step 9 captures; keep the counterexample (step 12) | det-after PNG byte-identical across runs when the resulting state is fixed, even after JS-driven DOM mutation plus real input; DOM-shape delta 55→65 nodes over **two** clicks (+5 nodes/click) fully accounted (`live-dynamic-capture.md:68,96-101,113-114`; round-3 re-measurement reproduced the 55 baseline and the +5/click rate — `executor-test-sufficiency.md` §2) |
| 3 — **multi-signal** | two or more independent signals agree (screenshot read back visually, DOM shape, protocol metadata; two full independent runs) | claims where a single channel alone could be wrong or stale | add the cross-checks of step 9; run the harness twice end-to-end | visual read-back matches the authored fixture; every fixed-state artifact agreed across two full runs; shape *struct* survives liveness while shape *text* does not (`live-dynamic-capture.md:60-73,91-94,124-127`) |

Capture rules earned by the ladder (`live-dynamic-capture.md:151-173`): split the page by
determinism class **before** capturing; wait on state, never on time (the predicates live
in the sha-pinned script, so "the capture waited correctly" is re-checkable); pin the
methodology bytes (fixture + capture script + driver) so "same methodology" is a sha256
verification, not a promise; pin the viewport explicitly; idempotence-check the capture
operation; loopback ≠ no-egress (pair any no-egress claim with the browser log's shape);
keep the differing pair. A multi-step journey is this recipe repeated per hop with
per-step captures — now measured (round 3): a four-page loopback journey
(index → detail → form → confirm; link-following + a real form submit) with six
per-step captures per run (navigate, idempotence re-capture, two links, fill, submit),
two cold-profile runs byte-compared, and the per-hop rules it adds —
`multi-step-journey.md` §2 record, §6 rules delta, pin in §Pins.

### Claim classes → capture (decision aid)

| Claim class | Capture | Record | Determinism | Source |
|---|---|---|---|---|
| **Visual** — "the page renders X" | `screenshot` → file path (never base64); read it back. Raw form: `Page.captureScreenshot {format:"png", captureBeyondViewport:true}` | PNG file + sha256 + byte count + W×H; note that it was read back visually | byte-stable for static content *in this environment*; environment-scoped — do not generalize to real pages or other builds | `corpus/knowledge/webbridge-plugin-anatomy.md:84-85,106-108`; `cdp-evidence-patterns.md:68-73`; determinism cross-ref `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:130-131` |
| **State** — "the DOM has X / the value is Y" | webbridge `snapshot` (accessibility tree, `@e` refs) first; `evaluate` only for refs/attrs it lacks. Raw form: `DOM.getDocument {depth:-1}` + `DOMSnapshot.captureSnapshot` | method + params; `strings` table or resolved excerpts (raw node fields are indices, not values); node count; URL + title | stable at capture; target `id` is per-launch — re-identify the target by URL/title | `corpus/knowledge/webbridge-plugin-anatomy.md:81-83,109-111`; `cdp-evidence-patterns.md:52,66,75,77,87` |
| **Network** — "the page fetched X / got Y" | webbridge `network` (start\|stop\|list\|detail); a real recorded HAR (Playwright `recordHar` precedent); REA connect-mode `capture:{events:["network"], network:{response_body:true}}` | entries + bodies only if explicitly requested (`response_body` defaults false); dropped count; name the producer channel | time-varying — assert as-of-capture with the snapshot attached | `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:23-25`; `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:29-32`; tool list `corpus/knowledge/webbridge-plugin-anatomy.md:85` |

Trap on the network row: a `chromium --log-net-log` netlog is **not** a valid HAR —
typed refusal `"HAR schema validation failed: required."`
(`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:116,133-135,265`).
Action-effect claims ("clicking X changed Y") capture a **before/after pair** of
whichever class the effect lives in; `click` is synthetic `el.click()` and `fill` is
clear-and-insert, so the call's success return is not the evidence
(`corpus/knowledge/webbridge-plugin-anatomy.md:81-87`;
`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:20-21,117-121`).
Egress caveat whenever a network claim needs "no traffic": a loopback debug endpoint is
not a quiet browser — a fresh headless profile still emitted Google GCM egress, and
`--disable-background-networking` did **not** stop the GCM registration
attempts/logging (`corpus/knowledge/cdp-evidence-patterns.md:36`;
`corpus/knowledge/live-dynamic-capture.md:190-200`).

### Record envelope (all classes)

From `corpus/knowledge/cdp-evidence-patterns.md:84-92`:

1. URL + exact navigation input. For `data:` URLs, the whole document string. The
   as-read-back `url` is as-normalized — record it too (`:139-150`).
2. Browser provenance in **effective** form — chromium version + the child process
   line, not the typed command; host launchers inject flags (`:18,30-32,85`).
3. Session slot: capture time (UTC + local), browser WS endpoint, target `id` +
   `frameId`; ids are per-launch.
4. Evidence bytes + hash + the method/params that produced it.
5. Determinism class per artifact (byte-stable vs time-varying).
6. Cross-checks: prefer two independent surfaces agreeing (`/json/list` title
   vs `document.title`; DOM node count via two methods — but define the count first,
   step 9) — disagreement between *like* measurements is usually staleness, not
   contradiction.
7. Name the channel that produced each fact: HTTP `/json/*`, browser-level protocol,
   page-level protocol, browser log — plus the **process table**, which the runbook
   itself reads as evidence in steps 6 and 13 (added round 3 per
   `executor-test-sufficiency.md` E3).
8. Cleanup proof: pre-kill listening line + post-kill refusal; kill by explicit PID —
   `pkill -f` self-matched the invoking shell (`:105`).
9. Archive or it didn't happen: `/tmp` hashes are only verifiable while `/tmp` lives;
   copy bytes to durable storage before citing (`:92`).

## Bounded waits — state, never time

- **Per-capture waits** (seconds): poll predicates at a tight interval with a timeout
  that fails loudly — measured harness: 50 ms interval, 8 s timeout, last value echoed
  on timeout (`capture.mjs:60-69`); endpoint-up wait 50 × 0.2 s = 10 s envelope
  (`driver.sh:32-36`); two rAF frames settle before the shutter (`capture.mjs:70-71`).
- **Deliverable polls** (minutes): when waiting on artifacts produced by another lane,
  a fixed sample cadence + hard cap. Measured harness (`/tmp/tabi-r2-4-poll/poll.sh`,
  967 B; log `/tmp/tabi-r2-4-poll/poll.log`; recorded `LOG.md:73`): log `elapsed=Ns` +
  condition state every 15 s, exit 0 when met, `TIMEOUT` + exit 2 at `elapsed ≥ 900`
  (15-min cap). Observed landing order in that log: first file visible 405 s,
  both files 540 s. Scope: this is for waiting on other lanes' outputs — capture timing
  itself is state-waited, never cadence-waited. The harness is scratch-staged (volatile);
  re-derive from the shape above if gone.

## Webbridge — the user's real browser (when the task needs it)

The bridge drives the user's real browser with their login sessions via a local daemon
at `http://127.0.0.1:10086`
(`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:4,11`;
`kimi.plugin.json:5,20`). Tools (`corpus/knowledge/webbridge-plugin-anatomy.md:79-87`;
args/returns at the substrate `SKILL.md:15-30`): `navigate`, `find_tab`, `snapshot`
(`@e` refs), `click`, `fill`, `evaluate`, `cdp`, `screenshot`, `network`, `upload`,
`save_as_pdf`, `list_tabs`, `close_tab`, `close_session`.

- **Current tab** = most recent `navigate`/`find_tab`; `find_tab` searches only this
  session's tabs; `active:true` *borrows* the user's viewed tab (`borrowed:true`) and
  does not move it (substrate `SKILL.md:34-39`; anatomy `:91-96`).
- **One task = one session = one tab group**; pick the session name at task start, put
  it on every command, never switch mid-task; closing is user-initiated only
  (substrate `SKILL.md:71-74,87`; anatomy `:99-105`).
- **Screenshots return a file path**, not base64 — write to a scratch path, hash it
  (`~/.kimi-code/.../SKILL.md:24`; anatomy `:106-108`).
- **Selectors**: `snapshot` `@e` refs first; `evaluate` only for missing refs, absent
  attributes, complex event sequences (anatomy `:109-111`).
- **`fill` is clear-and-insert** (append = read → concat → fill). No key-press tool —
  submit by clicking the button (substrate `SKILL.md:117-121,125`; anatomy `:114-116`).
- **`isTrusted`-checking sites are a stop, not a puzzle**: synthetic `click`/`fill` are
  ignored (banking portals, captchas) — hand the page back to the user; trusted input
  via the `cdp` escape hatch is advanced → see §Approval table (substrate `SKILL.md:146`;
  anatomy `:120-122`).
- **Cross-origin iframes** are not covered by `click`/`fill`/`evaluate`/`snapshot` —
  navigate to the iframe URL instead (substrate `SKILL.md:147`).
- **Version mismatch**: never reconcile daemon/extension versions yourself — tell the
  user to update and retry (substrate `SKILL.md:151`; anatomy `:124-127`).
- **Windows**: every request body as a uniquely-named temp file POSTed with
  `curl.exe --data-binary`, deleted after return — inline bodies corrupt non-ASCII
  irrecoverably (substrate `SKILL.md:58-65`; anatomy `:97-100`).

## Determinism boundaries (measured, round 2)

**Byte-reproducible in this environment** (verified across two full runs —
`corpus/knowledge/live-dynamic-capture.md:105-120`): fixture bytes; det-before PNG
(within-run and across runs); det-after PNG when the resulting state is fixed; DOM-shape
(full text for deterministic captures, struct-only for *every* capture, including the
live page); protocol metadata (Browser `Chrome/152.0.7977.82`, Protocol-Version `1.3`).

**Not byte-reproducible** (`corpus/knowledge/live-dynamic-capture.md:122-138`):
screenshots of a live page (nd1 vs nd2 differ within a run; nd1 differs across runs —
shape *text* differs, *struct* does not); session slots per launch (target ids, browser
ws uuids — match targets by URL/type, never id, `cdp-evidence-patterns.md:48`);
wall-clock stamps; browser background behaviour (the two runs' GCM traces differ under
identical flags).

**The boundary rests on**: same chromium build, same effective flag set (record the
child line), same viewport override, same fixture bytes, same capture parameters, same
wait predicates, same host font rendering — environment-scoped; not measured beyond this
host/build (`live-dynamic-capture.md:140-149`; `cdp-evidence-patterns.md:72` caveat
stands). This closes `cdp-evidence-patterns.md:116` (round-1 §7.8) **for fixtures whose
rendered state is deterministic**, and refutes extending byte-identity to time-varying
DOM text (`live-dynamic-capture.md:146-149`).

## Session-material discipline (shape-only)

- Session material — cookies, tokens, login state, profile stores — is never
  content-read; report shape only (kind, mode, size, mtime)
  (`corpus/knowledge/browser-surface-census.md:3-8,52-57`;
  `corpus/knowledge/webbridge-plugin-anatomy.md:154-159`).
- Measured precedent: `identity.json` 36 B mode 600, not read
  (`webbridge-plugin-anatomy.md:156-159`; `browser-surface-census.md:140`);
  `Cookies`/`Login Data` listed by byte size only (`:54`); daemon logs reported
  names/sizes/mtimes only — they may hold user page URLs
  (`webbridge-plugin-anatomy.md:158-159`; `browser-surface-census.md:140-141,190-191`).
- The bridge drives the user's **real** browser with their login sessions
  (`~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json:5,20`); borrowing
  stays visible: `find_tab active:true` borrows the user's viewed tab and does not move
  it (`webbridge-plugin-anatomy.md:91-96`).
- One task = one session = one tab group; never switch sessions mid-task
  (`webbridge-plugin-anatomy.md:101-105`); closing is user-initiated only
  (`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:87`).
- Only evidence artifacts (screenshots, DOM snapshots, HARs) enter the corpus; session
  material never does.

## Rights / rate boundary

- **Scope:** observation + operator-approved interaction only; never consequential
  external actions (purchases, posts, deletions) (`PROVINCE.md:15-19`; `MINT.md:19-20`).
  Refuse-and-route: RE forensics → revenger/kaidoku; publishing → kake; secrets → kagi
  (`PROVINCE.md:15-17`).
- **Loopback-first evidence:** wave captures used a self-launched browser + loopback
  fixture only (a `data:` URL; CDP :9232 + `http.server` :8891 in the network-capture
  precedent), ports verified closed at cleanup
  (`cdp-evidence-patterns.md:6,20-34,94-103`;
  `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:285-294`).
- **Bounded runs:** probes under explicit `timeout 45–180`, 0.85–1.1 s each
  (`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:1`). No measured
  live-site rate limit or ToS surface exists in the probation notes — do not assert one;
  record it when measured.

## Approval table — finalized (every interaction class mapped)

Authoritative taxonomy: `corpus/knowledge/interaction-approval-table.md` (round 3, pin in
§Pins) — dispositions (§1), evidence + falsifiers per class (§3), adjacent gates (§4),
counting (§6). The tables below are the executable distillation; IDs are the note's.
Cross-revision pointer(s): the note cites `SKILL.md` by section name + quoted string + sha
(`ea7122d92d7b…`, 432 lines — a mid-edit revision), and its earlier line-number refs match
the pre-upgrade revision (`git show HEAD:SKILL.md` → `:225` = the C2/C3 umbrella row,
`:226` = the A5 row — verified). This revision renumbered sections and re-tabled; resolve
any `SKILL.md` pointer by the quoted rule/class text. Re-check of the note's U8 (2026-10-14,
TABI-R3-3): bin semantics agree — C1 autonomous-now; C2/C3/C6 asleep-blocked (= the same
approval gate in its current tense); C4 refused/operator-routed; C5 approval-required;
A1–A12 as listed. The note's §1a sentence "the six classes … have no SKILL.md row yet"
described the mid-edit revision; this revision carries C1–C6 and A1–A12 as rows.

Dispositions: **autonomous-now** (agent runs it, records evidence) ·
**operator-approval-required** (explicit, per-action operator decision; where the province
refuses lane execution, the operator acts and the lane at most observes) ·
**operator-asleep-blocked** (admissible in principle, but its gate is an operator event the
asleep state cannot supply — blocked now; the loopback substitute stays available; the
note's "two tenses, one gate" reading: asleep-blocked and approval-required are the same
gate in two tenses).

Interaction classes C1–C6 (note §2):

| ID | Interaction class | Disposition | Rule / gate |
|---|---|---|---|
| C1 | Loopback fixture — self-launched browser + lane-authored pages on 127.0.0.1 | **autonomous-now** | Warrant includes a cleanup proof per session; byte-determinism is not part of the warrant; "loopback ≠ zero egress" holds (note §3 C1) |
| C2 | Operator's own sites | **operator-asleep-blocked** | Needs an operator go-ahead naming site + scope; consequential acts on an "own" property are still refused (note §3 C2) |
| C3 | Third-party read-only | **operator-asleep-blocked** | Default-deny — ToS/robots surface unmeasured; the round anti-claim blocks it (note §3 C3) |
| C4 | Third-party consequential (purchases/posts/deletions/submissions) | **operator-approval-required — lane execution refused; approval routes the act to the operator** | A wake-up does not lift it; the lane at most observes/reports (note §3 C4) |
| C5 | Login-required pages | **operator-approval-required** | Per-site/per-session approval + operator action where authentication is missing; session stores never touched; `isTrusted` → hand page back (note §3 C5) |
| C6 | Rate-limited surfaces | **operator-asleep-blocked** | Deciding axis unmeasured → never self-assign a budget; stop-and-report on the first measured rate datum (note §3 C6) |

Adjacent measured gates A1–A12 (note §4; row-level anchors below):

| ID | Gate | Disposition | Rule |
|---|---|---|---|
| A1 | Daemon `start` (connection-refused) | doc-authorized self-service | idempotent, local-only, no sudo/unit/config edit |
| A2 | Daemon `stop`/`restart`/`uninstall` | operator-only — never agent-run | ask the user or the Kimi Desktop App |
| A3 | `/status` probe | iff a daemon this task started | 8-field shape; empty `extension_id` = no-value-present |
| A4 | Return agent-started daemon to baseline | operator action | no TTL/cleanup/scratch mode exists; round-2 daemon still listening |
| A5 | Trusted input via the `cdp` escape hatch | operator-approval-required | "advanced"; default = hand page back |
| A6 | Borrowing the operator's viewed tab (`find_tab active:true`) | operator-visible action | borrowed in place, not moved; part of C5 |
| A7 | Version mismatch | tell the user, never reconcile | update-and-retry |
| A8 | Cross-origin iframes | navigate to the iframe URL | tools act on the top frame only |
| A9 | Session-material stores | never content-read; shape-only | kind/mode/size/mtime only |
| A10 | Out-of-province work | refuse-and-route | revenger+kaidoku / kake / kagi |
| A11 | Windows request bodies | temp file via `curl.exe --data-binary` | never inline (non-ASCII corruption) |
| A12 | Closing tabs/sessions | user-initiated only | |

Row-level authority anchors beyond the note: A1 `references/operations.md:11-13`,
`webbridge-daemon-disposition.md:89-96`; A2 `operations.md:24-26`, `:43-45,161`;
A3 `webbridge-daemon-disposition.md:122-139`; A4 `:56-62,165-169`; A5 substrate
`SKILL.md:146`; A6 anatomy `:91-96`; A7 substrate `SKILL.md:151`, anatomy `:124-127`;
A8 substrate `SKILL.md:147`, anatomy `:120-122`; A9 `browser-surface-census.md:3-8`,
anatomy `:154-159`; A10 `PROVINCE.md:15-17`; A11 substrate `SKILL.md:58-65`, anatomy
`:97-100`; A12 substrate `SKILL.md:87`.

Driving the user's real browser via webbridge is a **condition, not authority**: it
requires `extension_connected:true`; with none attached the daemon cannot drive the
browser (`webbridge-daemon-disposition.md:133-134,145-150,162`); session discipline
applies (A12; substrate `SKILL.md:71-74`).

Not movable by any approval — **never**:

- Consequential external actions (purchases, posts, deletions): outside the province
  (`PROVINCE.md:15-19`).
- Session material content-reads: shape-only, always (`browser-surface-census.md:3-8`;
  `webbridge-plugin-anatomy.md:154-159`).
- Out-of-province work: RE forensics → revenger/kaidoku; publishing → kake; secrets →
  kagi (`PROVINCE.md:15-17`).

Live-state recheck commands before any reuse: `ss -ltnp | grep 10086`, then
`curl -s http://127.0.0.1:10086/status`
(`webbridge-daemon-disposition.md:163`). Observed response has 8 fields —
`extension_version`, `port`, `skills`, `tab_id_arg` extra over the 5 documented
(`webbridge-daemon-disposition.md:122-139`; `references/operations.md:28-34`).
**Supersession (round 2):** the round-1 bullet "the corpus-builder posture leaves
[start] untouched" is superseded as live posture — start was doc-authorized under the
round plan and executed; the no-`stop`/`restart`/`uninstall` prohibition stands. Both
readings of the start authority stay on record for the scribe
(`webbridge-daemon-disposition.md:63-69`).

## Staleness watch (post-append line refs)

See §Pins — one block covers all rounds; the round-2 notes' evidence bytes, the round-3
notes' scratch (`/tmp/tabi-r3-2-spot/`, `/tmp/tabi-r3-4-work/`), and the sufficiency smoke
(`/tmp/tabi-r3-3-smoke/`) are `/tmp`-staged (volatile) — the archive obligation stands
(`cdp-evidence-patterns.md:92`). Staleness watch: the three round-1 notes carry
end-appended errata (2026-10-14, lane TABI-R2-3) — the round-1 line refs cited above sit
below the append points and remain valid against the current file bytes (pins re-derived
2026-10-14); one erratum bites record-envelope item 1 (`cdp-evidence-patterns.md:139-150`).