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
are copy-paste); (2) grade the result against the evidence ladder (§Evidence ladder —
four rungs) and wait for a page to settle before a shutter (§Settle-wait discipline);
(3) prove cleanup and closure (§Runbook step 13) and hold the session hygiene rules
(§Hygiene rules); (4) route every interaction class through the approval table
(§Approval table). If a hash in §Pins has moved, every citation is stale — re-verify the
note before reuse. Round-3 executor test (TABI-R3-4, document-only execution):
**SUFFICIENT** — every copy-paste command ran unmodified; its erratum fixes are applied
(`executor-test-sufficiency.md`, pin in §Pins). Round-4 state: the ladder gained its
**network rung** (rung 4, measured on a 3-navigation loopback journey —
`network-evidence-rung.md`, pin in §Pins), and the async-step note carries the
settle-wait record (`async-step-evidence.md`). The runbook below still leads with the
round-2 capture chain (single-page captures); a rung-4 capture swaps in the round-4
harness named in its opening paragraph.

## Standing rules

- Read-only substrates unless PROVINCE.md declares a write surface;
  detection-and-report for operator-owned remediation.
- Secrets shape-only, never content-read.
- Every claim: measured anchor (path:line, command output, evidence id).
  Observation / inference / unknown stay separate.
- Errata append-only; rejections kept (`corpus/QUALITY.md:3-7`).

## Pins — sources and staleness rule

sha256 first 12, **re-derived at this revision's write time** (2026-10-14T16:39Z,
`sha256sum corpus/knowledge/*.md`; scratch `/tmp/w4-t4-4-tabi/pins-r4.txt` — volatile).
The round-4 wave appended errata to all eight prior notes and admitted three new ones —
every pin below is post-append; re-derive before citing if the worktree has moved.

- Round-1 notes: `webbridge-plugin-anatomy.md` `6ce6fdd018a7` ·
  `browser-surface-census.md` `a4bbb39edb12` · `cdp-evidence-patterns.md` `8de2ee008c9c`.
- Round-2 notes: `live-dynamic-capture.md` `f97c10238907` ·
  `webbridge-daemon-disposition.md` `03af1fb0693e` (its §10 erratum records the daemon
  state change — see §Approval table).
- Round-3 notes: `interaction-approval-table.md` `d6ad567a610c` (241 lines — `wc -l`; the
  finalized C1–C6 / A1–A12 taxonomy) · `executor-test-sufficiency.md` `5f04f6877e1e`
  (325 lines; the no-oral-context executor test, verdict SUFFICIENT) ·
  `multi-step-journey.md` `8925ce6c46c7` (345 lines; the four-page loopback journey; its
  §9 errata carry the round-4 audit's per-run wire-class calibration).
- Round-4 notes: `network-evidence-rung.md` `4889ccf073a8` (605 lines; lane T4-1 — the
  network rung: per-step CDP Network-domain slices with five correlated surfaces, the D1–D8
  layer-disagreement cases, the byte-closure equation, fixture + server embedded in §11) ·
  `async-step-evidence.md` `577af06bd9a8` (278 lines; T4-2 — the held-request pre/post
  pair across visual/state/network layers; §3 is the settle-wait record) ·
  `hygiene-sweep-r4.md` `4ddc67151b98` (254 lines; T4-3 — the rounds-1-3 port/process/
  daemon hygiene sweep, closure-coverage gap closed).
- Lane report (in-repo, **not** a corpus note — cites for §Hygiene rules only):
  `reports/r4-aud-tab1.md` `5f44b0f94483` (167 lines; the r3-replay audit — byte-identity
  across three port pairs, the per-run wire-variant finding, the second self-match incident).
- Substrate, read-only: plugin `kimi.plugin.json` `e70aff5c40ff`; plugin skill `SKILL.md`
  `84a8e69d04c5` (158 lines); `references/operations.md` `b811d9c23dfd` (34 lines)
  (`sha256sum` over `~/.kimi-code/plugins/managed/kimi-webbridge/`, re-derived 2026-10-14).

A hash change means the citations below are stale — re-verify against the note before
reuse. History: the round-1 pins `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` matched the
committed round-1 blobs; the round-2 errata are pure appends on top (each errata header
records its pre-append hash; nothing above an append point was edited); the round-4
errata (lane ERR-B, 16:24–16:28Z) are appends on top of those, so every round-1/2/3
line-ref below still resolves against the current bytes. One erratum bites directly:
`corpus/knowledge/cdp-evidence-patterns.md:139-150` corrects record-envelope item 1 —
`url` holds the URL **as-normalized**, so record the as-read-back string alongside the
exact navigation input. All round-1–4 notes' evidence bytes are `/tmp`-staged — the
archive obligation stands (`cdp-evidence-patterns.md:92`), and the rung note's §11
embeds its fixture + server bytes so that recipe survives `/tmp`. Count convention:
"lines" here is `wc -l`; a file whose last line is unterminated reads one lower than its
logical line count (measured on `executor-test-sufficiency.md` at its round-3 revision —
`wc -l` → 297, `grep -c ''` → 298; `hygiene-sweep-r4.md` §7 E2 resolves the round-3 nit
on that convention, not on changed bytes).
Citation convention: paths are abbreviated after first mention in a section (e.g.
`substrate SKILL.md`, `anatomy`, `<note>.md` for the corpus notes), and a bare `:line`
continues the note cited immediately before it.

## Runbook — loopback capture, start to finish

The measured harness this recipe distills: `driver.sh` (85 lines) + `capture.mjs`
(209 lines) from round 2, staged `/tmp/tabi-r2-1-capture/` (volatile; sha pins
`live-dynamic-capture.md:52-56`). A **network-rung** capture uses the round-4 harness
instead of the round-2 capture script: `net-journey.mjs` (475 lines, `46c81f99decf`) +
`net-driver.sh` (106 lines, `67c94a3a275d`), with the fixture and server bytes embedded
in `network-evidence-rung.md` §2/§11 so that recipe survives `/tmp`; its per-step slice,
byte-closure and timing rules are §Evidence ladder rung 4 and §Settle-wait discipline.
Ports and paths below are the measured precedent —
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
(`capture.mjs:70-71`) — a paint settle; the network side of a settle is §Settle-wait
discipline. A rung-4 capture adds the per-step Network slice at this point
(`Network.enable` runs before the first navigation).

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

### Fixture v2 — external-class edges (usage)

The round-5-deferred **external-class fixture** (round-5 design §4, `282fc6d:plans/round-5.plan.md`; stop-rule-gated then, unlanded — `plans/round-5-record-draft.md:236`) landed round 6: bytes, runs and pins live in `corpus/knowledge/external-class-fixture-v2.md` (`4aa604f1788b`; pin 2026-10-14T17:52Z — the note is append-only and was still being appended in-wave, moving at least 3× over 17:48–17:52Z; re-derive before reuse). It extends the rung §11 fixture with the read-only edge classes a granted third-party run would meet: a 302 → 303 → 307 chain with a cross-path hop and a loopback **origin change** (`127.0.0.1:19541` → `19543`; plus an all-same-origin counterpart so the origin hop is the single differing factor), and four rate/ToS-shaped **instruments** — robots-shaped body, `429` + `Retry-After`, `403`, CAPTCHA-shaped interstitial served as a **200**.

Usage: the fixture bytes are embedded in that note's §3 (they survive `/tmp`; per-file sha pins there — no file ends with a trailing newline, strip the Markdown-added one before hashing). Serve with `python3 server.py <site-dir> <port> [hop-url]` — both origins run the one server (`936f1584bf81`); recorded cell ports `19541` (site-a) / `19543` (site-b), CDP `19542`; runner modes `chain` · `probe-robots` · `probe-429` · `probe-403` · `probe-captcha`, plus the headers-arm variants `probe-429h` / `probe-403h`. The runner scripts and run artifacts are `/tmp`-staged (note §9 archive debt) — archive before citing.

The stop-and-report predicate is mechanical, and a stop is proved from both sides (note §2, §5): first request is `/robots.txt`; an intended cell whose path matches a `Disallow:` prefix is **never issued**; the first `429`/`403` stops the run; a body-shape interstitial marker stops it **regardless of status** (its interstitial is a 200 — a status-only rule cannot see it, note §7 R4); skipped cells read `executed:false` and their paths must not appear in the server request log. Chain rules measured (note §4, §7): the wire carries every hop while the client surfaces only the final one; `redirectCount` is a same-origin-only witness (3 vs 0 across the origin hop); 307 preserves method and body end-to-end; `Network.getResponseBody` returns `-32000` unless the page has consumed the body (retained A/B: **2/2** `-32000` under a headers-only read vs **3/3** success after `response.text()` — mechanism open, its U2).

**The 429 rule, written so it cannot be misread: a loopback 429 is an instrument, never a C6 datum** (note §8) — no real rate/rights surface is measured by it; `Retry-After` is recorded as a shape, never acted on; C6's deciding evidence stays an absence (approval U1); no real-site bytes are mirrored anywhere in the fixture (C3 default-deny holds).

### Harness archive — durable harness/fixture bytes (usage)

The pinned `/tmp` groups have a durable copy: `corpus/evidence/<group>/` — 25 groups / 1,010 files / 6,780,293 B, one `MANIFEST.txt` per group (comment header + `sha256␠␠path` lines) — the round-5 B5-1 archive (`corpus/knowledge/archive-receipt-r5.md` `b41c2f6fb5a4`, 180 lines; §1-§2 :5-58 — re-derived at this revision's write time). When `/tmp` is gone, take harness and fixture bytes **from here** instead of re-authoring them, and verify before reuse — from the group dir: `sha256sum -c MANIFEST.txt` (round-5 runs: 1,010/1,010 OK :62-63; copy fidelity 0 diff lines per group :64-68; in-group pin files 107/109 OK :69-77, the 2 failures being F1 below). Group ↔ harness map (each sha256-12 re-measured **from the archived copy** at this revision's write time):

| recipe | group (durable copy) | pinned bytes, re-measured from the archive |
|---|---|---|
| round-2 single-page capture (§Runbook lead chain) | `tabi-r2-1-capture` | `driver.sh` 85 lines `8105bed02840` · `capture.mjs` 209 lines `d37d36dd92d0` · `compare.mjs` `e558bd547c58` · `site/page.html` `21e27aa6619a` (= the §Reference-fixture pin) — note pins `live-dynamic-capture.md:232` |
| round-3 four-page journey | `tabi-r3-1-journey` (replay copies: `tabi-b1-r3b-journey`, `w4-aud-tab1/harness/`) | `journey.mjs` `b52074a33876` · `driver.sh` `9509c07f49f9` · `compare.mjs` `ecce1c73dc56` (`multi-step-journey.md:26-27`); the six site files `index.html` `42d7a35b82be` · `detail.html` `353d8107a072` · `form.html` `50d811502ef8` · `confirm.html` `84b6ea0c17f4` · `data.json` `bf141027b3ef` · `style.css` `6380986105b3` (:350) |
| round-4 network rung (the recipe §Runbook swaps in for the r2 chain) | `w4-t41-network` (first dispatch `tabi-r4-1-network`) | `net-journey.mjs` 475 lines `46c81f99decf` · `net-driver.sh` 106 lines `67c94a3a275d` · `server.py` `a5ceef29fae5` · `compare.mjs` `9823428b4a40` · `summary.mjs` `ae5c8fee0d68` · `pixel-scan.py` `34b802d04cd9` · `pngdiff.py` `24565a826526` (`network-evidence-rung.md` §2 :71-74) |
| round-4 async pair + hygiene sweeps | `tabi-r4-2-async` / `w4-t4-2-async` (`journey-async.mjs` `06fa6e5ce5bf` in both) · `tabi-r4-3-sweep` (`PINS.txt` `2a76e40f855c`) · `w4-t4-3-sweep` (`PINS.txt` `57073253ac08`) | `async-step-evidence.md:283`; `hygiene-sweep-r4.md:163-165,215`; receipt §2 :29-58 |

Caveats that travel with the archive: it holds **bytes only** — every `*profile*` path was excluded by rule (5,668 files / 313,772,976 B, shape-only counts, never read; :13-17), so a reconstituted run re-creates its own fresh profile per §Hygiene rules and must not look for a stored one; the tree is a **timestamped snapshot** (copy 17:03Z; verification re-run 17:07:07Z) — the manifest says what was archived, never what `/tmp` holds now, and a pinned group can gain bytes later (U1 :148-150; re-run receipt check B to detect the drift). And **F1 stands** (:106-118): `tabi-b1-r3b-journey/methodology-sha.txt` is stale against its own bytes — it lists the r3 pins `9509c07f49f9`/`ecce1c73dc56` while the archived replay bytes hash `68ceef09e4bf`/`cc89210e9fd2` (the 4-line run-driver / 1-line compare port edit) — so the manifest and the owning note's pins are the authority, the in-group pin file a convenience. 1,010 files hash to 587 unique values (U5 :157-159): duplicate structure is the notes' byte-identity claims made visible, and `sha256sum -c` still checks every line.

**Round-6 harness bytes are not in this archive** (rounds 1–4 groups only): the external-class fixture v2 runner/server and its run artifacts stay `/tmp`-staged (note §9 archive debt; §Runbook "Fixture v2" above) — archive before citing.

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
orders how strong the evidence under a claim is. Four rungs since round 4 — climb to the
rung the claim needs, and
**never present a lower rung as support for a higher one.** Every rung still carries the
10-item record envelope (item 10 added round 4 for network-rung captures).

| Rung | Evidence captured | Supports | Recipe | Measured anchor |
|---|---|---|---|---|
| 1 — **static bytes** | sha256-identical artifact, plus a re-capture proving the capture operation idempotent | "the page renders X" when the content is frozen | freeze fixture bytes (step 1) → capture twice while idle (step 9) → re-run the whole harness (fresh server+browser) and re-hash | det-before PNG byte-identical within a run (350 ms apart) and across two independent server+browser processes (`live-dynamic-capture.md:66-67,107-110`); a third fresh server+browser pair (TABI-R3-3 smoke, 2026-10-14; staging `/tmp/tabi-r3-3-smoke/`, volatile) reproduced both fixed-state PNG shas; the executor test reproduced the same det-before sha across its two runs (`executor-test-sufficiency.md` §2); round-1 cross-session re-verification `cdp-evidence-patterns.md:151-157` |
| 2 — **dynamic capture** | before/after pair under sha-pinned methodology and state-waits; the volatile class captured too | action-effect claims — "clicking X changed Y"; JS-produced states | step 10 (interact + state-wait) around step 9 captures; keep the counterexample (step 12) | det-after PNG byte-identical across runs when the resulting state is fixed, even after JS-driven DOM mutation plus real input; DOM-shape delta 55→65 nodes over **two** clicks (+5 nodes/click) fully accounted (`live-dynamic-capture.md:68,96-101,113-114`; round-3 re-measurement reproduced the 55 baseline and the +5/click rate — `executor-test-sufficiency.md` §2) |
| 3 — **multi-signal** | two or more independent signals agree (screenshot read back visually, DOM shape, protocol metadata; two full independent runs) | claims where a single channel alone could be wrong or stale | add the cross-checks of step 9; run the harness twice end-to-end | visual read-back matches the authored fixture; every fixed-state artifact agreed across two full runs; shape *struct* survives liveness while shape *text* does not (`live-dynamic-capture.md:60-73,91-94,124-127`) |
| 4 — **network (wire capture)** | a per-step CDP Network-domain slice with five correlated surfaces: client model (`responseReceived`), wire truth (`responseReceivedExtraInfo` — raw status, status line, header bytes), byte truth (`loadingFinished.encodedDataLength` + `Network.getResponseBody`), the page-side `PerformanceResourceTiming` witness, and the fixture server's own log | "the page fetched X / got Y / got nothing" — and the DOM/screenshot disagreements the wire can arbitrate: abandoned requests, failed subresources, redirects, cache-served repeats with no wire line, wire-304 vs client-200, async races; it **cannot** prove rendering (a 200 body says nothing about the pixels) and is not a HAR | `Network.enable` before the first navigation; mark/advance the request list per step; settle (§Settle-wait discipline) + shutter; `getResponseBody` for every finished request; classify per-request `state` (issued/answered/failed); close the byte equation before quoting bytes | three cold runs byte-identical including per-request fact lines (`compare.tsv` 150 rows — 127 IDENTICAL / 23 accounted DIFFER); closure `finEnc − body − last-hop header text = 0` on all 7 wire resources; timing classes: loopback 0.6–3.3 ms · server-think 401.3–401.7 ms · cache hit ~4 ms · client abort at 60.2–60.3 ms; per-step byte totals 1,759 / 2,189 / 0 / 838 B (`network-evidence-rung.md` §3-§6, §9; netlog ≠ HAR refusal stands) |

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
Round 4 adds the network-rung rules (`network-evidence-rung.md` §9): separate the status
surfaces (wire `ExtraInfo` vs client `responseReceived` — they can differ); close the
byte equation before quoting any byte; call an abort what it is (client `ERR_ABORTED` +
a server status line + a body-write failure are three surfaces of one event — any one
alone misleads); timing claims at class granularity (≥1 ms — 38 recorded sub-ms finish-
before-response pairs are noise); compare client vs server by **counts**, not set
membership (the cache-served delta hides otherwise); screenshot is the only rendered-state
layer (DOM shape is blind to `display:none` and `:visited`).

### Claim classes → capture (decision aid)

| Claim class | Capture | Record | Determinism | Source |
|---|---|---|---|---|
| **Visual** — "the page renders X" | `screenshot` → file path (never base64); read it back. Raw form: `Page.captureScreenshot {format:"png", captureBeyondViewport:true}` | PNG file + sha256 + byte count + W×H; note that it was read back visually | byte-stable for static content *in this environment*; environment-scoped — do not generalize to real pages or other builds | `corpus/knowledge/webbridge-plugin-anatomy.md:84-85,106-108`; `cdp-evidence-patterns.md:68-73`; determinism cross-ref `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:130-131` |
| **State** — "the DOM has X / the value is Y" | webbridge `snapshot` (accessibility tree, `@e` refs) first; `evaluate` only for refs/attrs it lacks. Raw form: `DOM.getDocument {depth:-1}` + `DOMSnapshot.captureSnapshot` | method + params; `strings` table or resolved excerpts (raw node fields are indices, not values); node count; URL + title | stable at capture; target `id` is per-launch — re-identify the target by URL/title | `corpus/knowledge/webbridge-plugin-anatomy.md:81-83,109-111`; `cdp-evidence-patterns.md:52,66,75,77,87` |
| **Network** — "the page fetched X / got Y" | measured loopback recipe: a per-step CDP `Network.enable` slice on the run's own browser — client events + wire `ExtraInfo` + `finEnc` byte totals + optional `getResponseBody`; with `Fetch.enable` (Request stage) when a pre-settle state must be held. Also: webbridge `network` (start\|stop\|list\|detail); a real recorded HAR (Playwright `recordHar` precedent); REA connect-mode `capture:{events:["network"], network:{response_body:true}}` | entries + bodies only if explicitly requested (`response_body` defaults false in REA; captured bodies pin sha256 against the authored fixture — `async-step-evidence.md` §2); per-request `state` (issued/answered/failed); dropped count; **name the producer channel** (client slice vs server log — they can disagree, and either alone can mislead: an abandoned request has a server 200 line no client ever received, D4) | time-varying — assert as-of-capture with the snapshot attached; the wire path of a repeat is per-run measured (client re-serve / wire-304 variants with identical capture bytes — `multi-step-journey.md` §5 + its round-4 errata; `reports/r4-aud-tab1.md` §2) | `network-evidence-rung.md` §1,§4-§6,§9; `async-step-evidence.md` §2-§3; `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:23-25`; `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:29-32`; tool list `corpus/knowledge/webbridge-plugin-anatomy.md:85` |

Trap on the network row: a `chromium --log-net-log` netlog is **not** a valid HAR —
typed refusal `"HAR schema validation failed: required."`
(`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:116,133-135,265`).
Second trap, measured round 4: **name the producer surface** — the fixture server's log
and the client slice describe different truths. A client-aborted request can leave a
server `200` status line for a body no client ever received (D4), and cache-served
repeats appear in the client with no wire line at all (D6); the wire status lives in
`responseReceivedExtraInfo`, not in the client `status` (D7).
Action-effect claims ("clicking X changed Y") capture a **before/after pair** of
whichever class the effect lives in; `click` is synthetic `el.click()` and `fill` is
clear-and-insert, so the call's success return is not the evidence
(`corpus/knowledge/webbridge-plugin-anatomy.md:81-87`;
`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:20-21,117-121`).
Egress caveat whenever a network claim needs "no traffic": a loopback debug endpoint is
not a quiet browser — a fresh headless profile still emitted Google GCM egress, and
`--disable-background-networking` did **not** stop the GCM registration
attempts/logging (`corpus/knowledge/cdp-evidence-patterns.md:36`;
`corpus/knowledge/live-dynamic-capture.md:190-200`); round 4 measured the same class
again — 3 GCM lines in one revalidating run, 0 in six others, absence being
as-of-capture, not a no-egress proof (`network-evidence-rung.md` §7.2).

### Layer routing — which layer decides a claim

The rung note's §6 settles the "both layers measured it" question for GET-shaped journeys: the winner is the layer whose evidence can **falsify** the claim (`network-evidence-rung.md` §6 :239-242). Its D1–D8 cases — each staged in the rung fixture and measured on both sides — distill to this routing table (:332-345):

| claim | winning layer | measured case |
|---|---|---|
| which requests/hops/statuses occurred | network client events + wire `ExtraInfo`; the server log for **counts** | D4 (:271-283 — an abort leaves no DOM trace, and the server's 200 line names a body no client received); D6 (:293-302 — client hop count 3 vs server lines 1: compare counts, never set membership) |
| the wire status | `responseReceivedExtraInfo` (+ the server log) | D7 (:304-318 — wire 304 vs client 200 on five URLs; the client read 304 too on one path) |
| bytes transferred | `finEnc` with the closure rule; perf `transferSize` as a second, non-equal number | §4 (:147 — closure = 0 on 7 resources; 660 vs 546 on index) |
| response body bytes | `Network.getResponseBody` (works for cache-served; canceled = 0 B) | D3 (:261-269); §4 |
| latency class | CDP event deltas + `response.timing`, at ≥1 ms granularity | §5.2 (:216-224 — 38 negative sub-ms pairs are noise) |
| visible rendered state | screenshot (pixel tools for machine checks) | D2 (:253-259 — hidden text: red band 0 px vs blue 17,079 px); D8 (:320-330 — `:visited`, 1,033 px, DOM byte-identical) |
| document content incl. invisible | DOMSnapshot / shape | D2 — `HIDDEN-MARKER-7b3e` present in the shape, absent in the pixels |
| displayed *after* async work | settled DOM + screenshot; the network explains the race | D1 (:244-251); §5.3 (:225-237 — the fresh-cache pair collapse) |
| page state / input values | DOMSnapshot columns | §3 (:101 — inputs) |
| "no external contact" | neither layer; browser log + process discipline | §7.2 (:356-364 — egress caveat; absence is as-of-capture) |

Two rules fall out: **name the producer layer per fact** (envelope item 7 below — a fact without its layer is a story), and treat a disagreement between *like* measurements as a finding, not noise (D6's client-vs-server counts; D7's two status surfaces). [unknown] A **state-changing** step — POST body, redirect-after-POST (303 vs 307), token consumption — has no measured D-case: every case above is GET-shaped, so do not route those claims by this table until the class is measured.

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
10. **Network rung (round 4): the per-step slice is itself an artifact.** Record each
    request's `state` (issued / answered / failed), the wire status **labelled** apart
    from the client status, `finEnc` byte totals (and the closure arithmetic when bytes
    are claimed), body sha256 where a body was read, and the producer channel named per
    fact — client slice vs server log (`network-evidence-rung.md` §9; a slice without
    those labels is a story, not evidence).

## Bounded waits — state, never time

- **Settle waits are predicates, not durations** — the section below; the cadences here
  are the harness envelopes those predicates run inside.
- **Per-capture waits** (seconds): poll predicates at a tight interval with a timeout
  that fails loudly — measured harness: 50 ms interval, 8 s timeout, last value echoed
  on timeout (`capture.mjs:60-69`); endpoint-up wait 50 × 0.2 s = 10 s envelope
  (`driver.sh:32-36`); two rAF frames settle before the shutter (`capture.mjs:70-71`).
- **Deliverable polls** (minutes): when waiting on artifacts produced by another lane,
  a fixed sample cadence + hard cap. Measured harness (`/tmp/tabi-r2-4-poll/poll.sh`,
  967 B; log `/tmp/tabi-r2-4-poll/poll.log`; recorded `LOG.md:73`): log `elapsed=Ns` +
  condition state every 15 s, exit 0 when met, `TIMEOUT` + exit 2 at `elapsed ≥ 900`
  (15-min cap). Observed landing order in that log: first file visible 405 s,
  both files 540 s. Round-4 instance: the rung-note poll (15 s cadence, 1200 s cap,
  corpus path first then `/tmp`; log `/tmp/w4-t4-4-tabi/poll-rung.log`, volatile) found
  the note at elapsed 935 s of 1200 — the cap still had headroom. Scope: this is for
  waiting on other lanes' outputs — capture timing itself is state-waited, never
  cadence-waited. The harnesses are scratch-staged (volatile); re-derive from the shape
  above if gone.

## Settle-wait discipline — predicates, not durations

"Wait on state, never on time" (`live-dynamic-capture.md:160-162`) is the base rule; this
section is what the journey and async-step rounds added. A **settle is a predicate**: the
shutter opens when the run's own predicate holds — derived from the payload the page is
expected to render, never from a fixed sleep.

- **Two witnesses per settle.** The DOM predicate *and* the network state, both recorded:
  at the settled shutter the awaited request shows a response in its slice (`answered`
  state, status 200, encoded byte count, finish event) and the wire log has its one line;
  at the pre-settle shutter the same request shows no response (`issued`,
  status null) and the wire log has zero lines — so the pre capture is *certified*
  pre-settle, not a lucky shot (`async-step-evidence.md` §2; `network-evidence-rung.md`
  D1 measures the same pair with the payload strings in the settled DOM, and §5.3 shows
  the pair can collapse when the async work wins the race).
- **rAF settles paint, not network.** Two rAF frames before a shutter stabilize the
  raster; they say nothing about in-flight fetches (`capture.mjs:70-71`;
  `multi-step-journey.md:65-66`).
- **A pre-settle state must be held or kept, never raced.** Measured window: once
  released, the async request traversed wire → server → drain in 1–2 ms while one capture
  costs 57–123 ms — a time-based pre-settle capture would compete for a ≤2 ms window (the
  un-held variant is inference, not a measured failure: `async-step-evidence.md` §3.2,
  §8.1). Two measured patterns: **hold** — `Fetch.enable` at Request stage makes the
  pre-settle state an unbounded stable class; release explicitly and record
  pause → release → response → ready → shutter (`async-step-evidence.md` §3.4);
  **race pair** — capture immediately after the action with no wait, then wait on the
  predicate and capture again, recording both timings (rung-4 journey:
  click → race 82 ms vs click → settled 82 ms on this host —
  `/tmp/tabi-r4-1-network/run1/journey.json` `asyncTiming`, volatile).
- **Keep the pair only when the work outruns the capture window.** Fresh-cache runs
  collapsed the early/settled pair (the answer landed from cache in ~4 ms and both
  captures equal the settled bytes, 3/3 runs) — verify with the network slice, not with
  the predicate's success (`network-evidence-rung.md` §5.3, §3; the predicate itself is a
  bounded wait that fails loud, not a race guaranteed to separate).
- **The post predicate is payload-derived** — rendered content, not an XHR flag and not
  "a moment after release"; the waited surface is the page's own state machine, so a
  response that never renders fails the poll loudly instead of passing silently
  (`async-step-evidence.md` §3.3-3.5).
- **Predicates live in the sha-pinned script** — poll 50 ms cadence / 8 s cap, last value
  echoed, failure records `error` and exits non-zero: "the capture waited correctly" is
  re-checkable from artifacts alone (`async-step-evidence.md` §3.1; `capture.mjs:60-69`).
- **Optimistic DOM ≠ wire truth**: a page can look fine while a subresource 404'd and was
  canceled, or a request was abandoned with no DOM trace (rung-note D3, D4) — pair the
  settled capture with the wire witness (§Evidence ladder rung 4).

## Hygiene rules — the session leaves no trace but its evidence

- **Namespace from the first write**: `/tmp/<lane>-r<round>-<seat>-*/`; never bare `/tmp`
  files, never another lane's dir (this revision's own scratch is `/tmp/w4-t4-4-tabi/`).
- **Kill by explicit PID; scan by `comm` — never let the pattern match your own command
  line.** Three measured instances of the class: `pkill -f` killed the invoking shell
  before its verification ran (`cdp-evidence-patterns.md:105`); a `ps|grep` closure check
  self-matched on *other text in the same command line* (`live-dynamic-capture.md:182-188`);
  a second `ps|grep` kill selection matched its own shell and died mid-command, cleanup
  re-verified afterwards (`reports/r4-aud-tab1.md` §4). An unverified kill is an unknown,
  not a cleanup.
- **Ports**: loud free-precheck before launch; loopback binds only; per-session closure
  proof (`ss` no listener + `curl` exit 7), and a later run that re-binds the same ports
  after its own precheck proves the earlier session's closure a second time
  (`live-dynamic-capture.md:175-188`; `network-evidence-rung.md` §8).
- **Profiles**: a fresh throwaway profile per run under the run's own output dir
  (`rm -rf` at run start, disposition logged); one owned browser per run; never a user
  profile (`multi-step-journey.md:53-56,246-247`; `async-step-evidence.md` §1). A
  fresh-cache pass must be populated in-session (prepass), not by editing headers — and
  it changes the wire class while capture bytes stay identical (`network-evidence-rung.md`
  §9.7, §6 D7).
- **Bounded runs**: drivers and probes under an explicit `timeout`; nothing unbounded.
- **Secrets shape-only**: session material never content-read; daemon state files and
  logs by size/mtime only (`hygiene-sweep-r4.md` §1, §4; §Session-material discipline).
- **Evidence discipline**: record the effective child line, not the typed command; `/tmp`
  is volatile — archive or it didn't happen (§Runbook step 13).
- **Deliverable polls**: fixed cadence + hard cap, elapsed logged (§Bounded waits).
- **Round-4 sweep (as-of-capture, `/tmp`-staged)**: every port rounds 1–3 opened answers
  no listener (19333, 19411/19412, 19421/19422, 19441, 19471/19472, 19481/19482, 9232,
  8891); no chromium/http.server survivors; the round-2 daemon pid 3934817 is **gone**
  (an OOM teardown at ~13:10:59 local / 16:10:59Z of the user session it was a child
  of; journal-visible, per-process victim list unknown) — the D2 "operator stop owed"
  item is moot and the stale pid file remains (`hygiene-sweep-r4.md` §2-§4; `webbridge-daemon-disposition.md`
  §10 erratum; `reports/r4-aud-tab1.md` §6 — three independent reads agree).

## Webbridge — the user's real browser (when the task needs it)

The bridge drives the user's real browser with their login sessions via a local daemon
at `http://127.0.0.1:10086`
(`~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:4,11`;
`kimi.plugin.json:5,20`) — **live state, round 4: the daemon is down** (no listener,
stale pid file; §Approval table's recheck commands, §Hygiene rules).

**Revival assessment (round 6, lane B6-2):** `corpus/knowledge/webbridge-revival-assessment.md`
(`a07c8aedc161`; pin 2026-10-14T17:48Z) — the restart is local and doc-specified (one
idempotent `start`, `references/operations.md:11-14`), **assessed, not executed**; the
extension↔daemon handshake has never been observed up and is **not doc-authorizable
operator-free** (the substrate routes extension trouble to user actions,
`operations.md:17-22`); at assessment time the operator's chromium ran with extension
`2.0.23` installed while the daemon was down — the browser-side precondition for the
handshake experiment (disposition U2) held for the first time, and executing it stays
operator-scoped (a revival act). Read that note before any daemon `start`: a revival
recreates the A4 stop debt (`operations.md:26`) and, with no unit or autostart, does not
survive a session/OOM event (the r2 instance's death path — note §2, §4).

Tools (`corpus/knowledge/webbridge-plugin-anatomy.md:79-87`;
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

## Determinism boundaries (measured, rounds 2–4)

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

**Round 4 extends both sides** (`network-evidence-rung.md` §7). Byte-reproducible:
all six capture artifacts (PNG + shape + struct) across three cold runs on the 3-step
network-rung journey, and across the fresh-cache runs — plus the normalized per-request
fact lines (`URL|type|wire|client|finEnc|fail`, 11 rows) byte-identical across
run1/run2/run3. Not byte-reproducible, newly measured: the collapsed early/settled pair
under a fresh cache (§5.3), the `:visited` PNG difference with byte-identical DOM
(D8 — 1,033 pixels localized to the link line, cause is session history), the abort race
(§6 D4 — both outcomes in the record), and sub-ms event deltas (§5.2 — 38 negative
`finish − response` pairs; timing claims stay at class granularity ≥1 ms). Browser
background behaviour stays run-variant: 3 GCM log lines in one round-4 run, 0 in six
others (§7.2) — absence is as-of-capture, never a no-egress claim.

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
| A4 | Return agent-started daemon to baseline | operator action — **row moot as of round 4** | no TTL/cleanup/scratch mode exists; the round-2 daemon is **gone** (OOM teardown ~13:10:59 local / 16:10:59Z, stale pid file remains — `hygiene-sweep-r4.md` §4; `webbridge-daemon-disposition.md` §10 erratum) |
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
**Round-4 read (2026-10-14):** the recheck comes up empty — no listener on 10086,
`/status` refused (`curl` exit 7), `ps -p 3934817` → gone (`hygiene-sweep-r4.md` §4;
`network-evidence-rung.md` §8); the 8-field sample above is the last live reading, kept
as record.
**Field-count finding (round 6, lane B6-2):** the "8-field" reading above is a measured
**undercount** — the two recorded samples carry **9** keys (mechanical count;
`webbridge-revival-assessment.md` §6, §7 SC3; sources
`webbridge-daemon-disposition.md:129-131`, `hygiene-sweep-r4.md:98`). No live re-probe is
possible (daemon down; A3's iff-condition unmet). Errata on the five affected note lines
is owed by the owning editors; this line records the finding, not a rewritten history.
**Supersession (round 2):** the round-1 bullet "the corpus-builder posture leaves
[start] untouched" is superseded as live posture — start was doc-authorized under the
round plan and executed; the no-`stop`/`restart`/`uninstall` prohibition stands. Both
readings of the start authority stay on record for the scribe
(`webbridge-daemon-disposition.md:63-69`).

## Staleness watch (post-append line refs)

See §Pins — one block covers all rounds; the round-2/3 notes' evidence bytes, the
round-3/4 scratch (`/tmp/tabi-r3-2-spot/`, `/tmp/tabi-r3-4-work/`, `/tmp/w4-t41-network/`,
`/tmp/w4-t4-2-async/`, `/tmp/w4-t4-3-sweep/`, `/tmp/w4-aud-tab1/`, `/tmp/w4-t4-4-tabi/`),
and the sufficiency smoke (`/tmp/tabi-r3-3-smoke/`) are `/tmp`-staged (volatile) — the
archive obligation stands (`cdp-evidence-patterns.md:92`), the round-4 rung fixture
excepted (embedded in `network-evidence-rung.md` §11). Staleness watch: the three round-1
notes carry end-appended errata (2026-10-14, lane TABI-R2-3) and every round-1/2/3 note
carries round-4 errata (lane ERR-B, 16:24–16:28Z) plus owner-seat appends; all cited
line refs sit below those append points and remain valid against the current file bytes
(pins re-derived 2026-10-14T16:39Z, §Pins). One erratum bites record-envelope item 1
(`cdp-evidence-patterns.md:139-150`); one round-4 erratum supersedes the r2
"launch-window listing non-replayable" downgrade (`cdp-evidence-patterns.md` §8 second
block); and the daemon's live state moved again — see §Approval table and §Hygiene rules.

## Errata — §Pins refresh (append-only; never edit above)

Appended 2026-10-14 (tabi round 5, lane B5-3 — §Pins pin refresh; derivation pass 17:01–17:06Z, note appends 17:07–17:10Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `1e2f87caddff97eacf2148b3f7151ef17fc551898aaab544ccb1bae0b3758a21`. The post-append hash necessarily differs — re-derive with `sha256sum`; this block supersedes the note pins in §Pins above for post-append use.

- **[2026-10-14, pin refresh] VERIFIED — 15/15 §Pins values re-derived; nothing had moved.** Commands: `sha256sum SKILL.md corpus/knowledge/*.md reports/r4-aud-tab1.md`; `sha256sum` over the three substrate files; `wc -l`; `git show <rev>:<path> | sha256sum` for history pins; per note, `sha256sum` over the `/tmp` group its pin block names. Matches (first 12): notes `6ce6fdd018a7` / `a4bbb39edb12` / `8de2ee008c9c` / `f97c10238907` / `03af1fb0693e` / `d6ad567a610c` / `5f04f6877e1e` / `8925ce6c46c7` / `4889ccf073a8` / `577af06bd9a8` / `4ddc67151b98`; report `5f44b0f94483`; substrate `e70aff5c40ff` / `84a8e69d04c5` (158 lines) / `b811d9c23dfd` (34 lines). Counts re-held (241 / 325 / 345 / 605 / 278 / 254; 158 / 34; 167). History pins re-derive from git: `49f0735b0594` / `9e4d69dcd658` / `034b1e53b004` (`git show 7961735:<path>`), `56224aa88430` (`5d2e95d`), `452bc514d387` / 576 lines (`094c27a:SKILL.md`). Daemon binary `71067480bd99…d35d` (= `webbridge-daemon-disposition.md` §8). §Pins' scratch still exists: `/tmp/w4-t4-4-tabi/pins-r4.txt` `cf8b50bd094c…` — it records SKILL.md as the r3-final `452bc514d387` / 576 because the round-4 SKILL revision landed after its 16:39Z derivation.
- **[2026-10-14, post-append pins — the refreshed §Pins]** All 11 notes now carry a B5-3 refresh block (pre-append hash + derivation facts); `reports/r4-aud-tab1.md` was not appended to — its pin stands. Post-append `sha256sum corpus/knowledge/*.md` (17:10Z; trailing number = `wc -l`):

```sh
05dcda5e60b9ae4a58d05bd2a9c447be3bd22bedb9e1706b400859f8a070a0f4  async-step-evidence.md  282
a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b  browser-surface-census.md  265
337ff64579e8ba4bb581859d0286a59f0501a04c3d551b63864d9e362a4f53a2  cdp-evidence-patterns.md  234
32772e3438486881590eb6f17e2a6982f8797424a62d8ded82569e675286f572  executor-test-sufficiency.md  329
87155e12021d3ef7349efcb41eba3be4ff29eb719e1365a861c45bac280a791b  hygiene-sweep-r4.md  258
b5e29a9a2adfdb1f474412c3cc0acce08da351e21cf608f09f1f70a1b5675e86  interaction-approval-table.md  246
01266495b7614d6c563e5fd007844d9cf10ac8b50f9787844b0bb9d2ff542eac  live-dynamic-capture.md  245
e0367890f1cfc91081481c2613a481d02aa83a6c320d0fe2fbaf5764c4878923  multi-step-journey.md  349
d1564f38dc14a261ce31970bdc706c5a63a9abbf9fea811f367525ccf3c60cc7  network-evidence-rung.md  609
fd5f6861aa3bc97e1e63176099f1615fed3c81184a9b1dd61d546caafec5a3bc  webbridge-daemon-disposition.md  274
8d1488ab763e4fb1281f445879caacc96298c76f7257b96d4cb25a1f1ab1ef51  webbridge-plugin-anatomy.md  290
```

- **[2026-10-14, durable mirror — peer lane pointer]** The round-5 B5-1 archive copied the tabi `/tmp` groups into `corpus/evidence/` with per-group `MANIFEST.txt` (`corpus/knowledge/archive-receipt-r5.md`); 25 groups / 1,010 files, self-check 1,010/1,010 OK. The pins above now re-check against archived copies as well as `/tmp` (receipt check C: 107/109 in-group pin lines OK — the 2 failures are the r3b replay pin-file pair, F1, no owning-note pin affected).
- **[2026-10-14, limit / open item]** This is a same-day-later re-derivation (17:0xZ vs 16:39Z). Round-5 plan clause (c) asks for a strictly-later-date re-derivation — TIME-GATED (earliest 2026-10-15) and still owed as a dated in-repo block + commit; its values to re-check are the post-append pins above. Per-capture artifact pins were not re-hashed in this pass (methodology / fixture / source pins were).
- **[2026-10-14, round-6 SKILL upgrade — lane B6-4; additions-only]** Pre-edit sha256 of this file: `dcc33f1bf5311fd8893eecfc041cd9aefca31bfae1e82d711c0f7d77822484d4` (765 `wc -l`); the post-edit hash necessarily differs — re-derive with `sha256sum`. This revision is additions-only in content: no pre-existing line's text is altered (`git diff` shows four added hunks; the only non-addition is the file's former final line gaining a line break): (1) §Runbook — the new subsection "Fixture v2 — external-class edges (usage)", distilling `corpus/knowledge/external-class-fixture-v2.md` (`4aa604f1788b` at 17:52Z; lane B6-1; append-only note, moved ≥3× in-wave — re-derive): serving (`server.py <site-dir> <port> [hop-url]`; ports 19541/19543, CDP 19542), the five cell modes plus their headers-arm variants, the mechanical stop-and-report predicate (proved from both sides), and the note's §8 rule — a loopback 429 is an instrument, never a C6 datum; (2) §Webbridge — the revival-assessment pointer to `corpus/knowledge/webbridge-revival-assessment.md` (`a07c8aedc161`; lane B6-2): restart assessed not executed, handshake not doc-authorizable operator-free, A4/OOM conditions; (3) §Approval table — the `/status` field-count finding (the "8-field" shorthand is a measured undercount: 9 keys). Line refs below the §Runbook insertion, and below §Webbridge, shift accordingly; resolve `SKILL.md` pointers by section name + quoted text (standing convention, §Approval table). Pins in this block: fixture note `4aa604f1788b` (17:52Z; moving in-wave), revival note `a07c8aedc161` (17:48Z, unchanged at 17:52Z) — provisional until the archive keeps pace (`cdp-evidence-patterns.md:92`), re-derived at record time. This block records the revision; it edits nothing.

## Layer-routing table — usage (round 7)

The §"Layer routing — which layer decides a claim" table above is the rung note's
D1–D8 set (round 4, GET-shaped journeys). The round-7 synthesis widens it to the
whole corpus: `corpus/knowledge/layer-routing-synthesis.md` (**`7725ee421716`**,
254 `wc -l`; lane B7-1; **untracked** at this revision — re-derive before citing;
its §6 pins every source). It measures nothing new — a read-only re-statement,
with anchors, of routing decisions rounds 4–6 already measured (zero browser
launches, zero network acts; note header). Rows it assembles rather than quotes are
marked `[synthesis]` in the note, and its §5 unknowns are **not** claims. Use it
when a claim spans a surface the D1–D8 table does not name — redirect chains,
body-read coupling, trip/refusal classes, egress, cleanup.

**Layer inventory (note §1 :43-61).** L1 server log · L2 wire headers
(`responseReceivedExtraInfo`) · L3 client events / client model · L4 body bytes
(`getResponseBody` + `loadingFinished.encodedDataLength`) · L5 page-side perf
(`PerformanceResourceTiming`) · L6 DOM (DOMSnapshot columns + shape) · L7 pixels
(screenshot + pixel tools) · L8 URL / history · L9 runner record · L10 environment
(browser log / process table / ports). Each layer is "authoritative for" exactly
the claims its evidence can **falsify** — the rung note's winner rule
(`network-evidence-rung.md` :241-242).

**Rows the D1–D8 table lacks (note §2 :69-88, RT1–RT18).** RT1 an abort is a
*paired* fact — client `ERR_ABORTED` **and** the server's body-write marker; a lone
server `200` line claims a delivery no client received (rung §6 D4 :271-283) ·
RT3/RT4 the wire status lives in `ExtraInfo` (+ server log), never the client
`status`, and a repeated same-URL resource's wire path is **per-run measured**
(three combinations recorded — `multi-step-journey.md` §5 + its errata;
`reports/r4-aud-tab1.md` §2) · RT6 the hop chain incl. cross-origin: every leg on
the wire + per-hop `ExtraInfo`, while `redirectCount` is a **same-origin-only**
witness (3 vs 0 across the origin hop — `external-class-fixture-v2.md` §4
:373-408) · RT7 `getResponseBody` is coupled to client consumption (2/2 `-32000`
under a headers-only read vs 3/3 success after `response.text()` — v2 §5 :429-433)
· RT13 visible state → pixels, document content → DOM (D2/D8: `display:none`,
`:visited`) · RT14 inputs → raw DOMSnapshot columns with the `-1` empty sentinel
guard (`multi-step-journey.md` §3 :148-169) · RT15/RT16 a trip is recorded and
proved from both sides (wire status + body-shape marker + runner trip record;
server-log absence for a stop), and a loopback instrument is **never** a C6 datum
(v2 §8 :508-522) · RT17 egress is log/URL-level and as-of-capture — no page-level
layer proves it (rung §7.2 :356-364) · RT18 closure routes to PID + port probe +
`curl` exit 7, verified after (`cdp-evidence-patterns.md` :96-105).

**Routing rules (note §3 :90-132; 13, condensed).** Route by falsifier, splitting
a claim into the sub-claims each layer can decide · name the producer surface per
fact (envelope item 7) · status surfaces are never substituted · compare **counts,
not set membership** · pair surfaces for non-idempotent / abandoned events · body
reads coupled to consumption, body sha pinned to the fixture · close the byte
equation `finEnc − last-hop header text − body = 0` before quoting bytes (perf
`transferSize` is a different number) · timing at ≥1 ms class granularity · async:
hold at the protocol layer, then verify the pair against the network slice ·
rendered→pixels / content→DOM / inputs→raw columns · a trip is never retried
through · egress claims carry the log-level caveat · kill by PID, verify after.

**Do not route by this table (note §4 :134-156, §5 :158-175).** No measured case
exists for a **state-changing** step (POST body, redirect-after-POST 303/307, token
consumption — the corpus's own named gap); real-site classes, the bridge-path
surfaces (webbridge `network`), and the L1 mechanism matrix (wire-class /
cache-revalidation, still unlanded at this revision) are likewise uncovered. The
note's eight unknowns — the `transferSize`↔`finEnc` ~114-115 B offset's mechanism,
why client `status` reads 304 only for the revalidated `style.css`, what decides
the within-session cache path, the abort race, the `-32000` mechanism, cross-origin
`redirectCount` generality, packet-level egress truth, byte-identity generality
beyond this host — stay unknowns; do not convert them to claims without a new
probe. AUD-B7 re-derived RT2/RT3 (+ half of RT1) from the archived bytes and they
PASS; RT4–RT18 were **not** re-derived (`reports/r7-aud-b7.md` U5).

## Harness-archive discipline (round-7 update)

The §"Harness archive — durable harness/fixture bytes (usage)" subsection above
pins the round-5 archive (25 groups). The discipline is unchanged; the census
moved. At this revision (`ls`/`find`/`sha256sum` at write time): `corpus/evidence/`
holds **28 group dirs / 28 `MANIFEST.txt`** — the round-5 25 plus the three round-6
groups `w6-tabi-b61` / `w6-aud-b6-scratch` / `w6-ver-b6` (landed 18:24:53Z, lane
B7-2) — **1,375 non-manifest files / 8,861,433 B** (round-5's 1,010 / 6,780,293
re-derives digit-for-digit; the three new groups add 139+39+187 = 365 files /
2,081,140 B). Verify from the group dir before reuse: `sha256sum -c MANIFEST.txt`
(the three new groups re-run here → **365/365 OK, exit 0**).

- **The subsection's line "Round-6 harness bytes are not in this archive" is
  superseded** (append-only: that line stays as written, this block corrects it):
  the external-class fixture v2 runner/server and its run artifacts are now
  archived — `w6-tabi-b61` carries the v2 §3 pins **12/12** (`reports/r7-aud-b7.md`
  A5). Do not re-derive that debt as open.
- **Audit scope, so the archive is not over-trusted** (`reports/r7-aud-b7.md`
  `ea4b16a4a844`, 260 `wc -l`): manifest self-check + in-group pins + owning-note
  pins PASS on the 3 audited groups (423/423, 48/48, 55/55), and the round-5
  receipt's totals re-derive exactly — but the other 22 round-5 groups were **not**
  re-hashed (U1), the 3 new groups' source copy fidelity / exclusion counts are
  **not** audited (U4), RT4–RT18 were not re-derived (U5), and no re-execution ran
  (U6 — "re-derived" means the archived bytes support the row, not that the
  measurement reproduces today).
- **Caveats stand** (round-5 archive): bytes only — profile dirs excluded by rule
  (shape-only, never read), so a reconstituted run makes its own fresh profile; a
  **timestamped snapshot**, never live `/tmp` (a pinned group can gain bytes later);
  **F1** — `tabi-b1-r3b-journey/methodology-sha.txt` is stale against its own bytes,
  so the owning note's pins and the manifest are the authority, the in-group pin
  file a convenience; `sha256sum -c` still checks every line.

## Errata — round-7 append (layer-routing usage + harness-archive discipline; append-only; never edit above)

Appended 2026-10-14 by lane **B7-4** (round-7 SKILL distillation; assignment:
append the layer-routing table usage + the harness-archive discipline, citing
`corpus/knowledge/layer-routing-synthesis.md`). Nothing above is edited;
pre-append sha256 of this file: `c0d2629ecbfbc94cb7d343f38b1deee1f79dc5e47c2d449c2d1feb6e830ddf21`
(829 `wc -l`). The post-append hash necessarily differs — re-derive with
`sha256sum`. This block is additions-only: the file gained two sections plus this
block at EOF; no pre-existing line's text is altered. Method: read-only over
`corpus/knowledge/*.md`, `corpus/evidence/`, `reports/r7-aud-b7.md`, the round-7
plan / record draft and `LOG.md`; the archive self-check `sha256sum -c` over the
three round-6 groups (365/365 OK) and the census re-derivation (`ls` / `find` /
`awk`) are this lane's own; no browser launched, no external site, no secrets read.
Pins cited here are as-of-write and provisional until the archive keeps pace
(`cdp-evidence-patterns.md:92`): synthesis note `7725ee421716` (254 `wc -l`,
untracked), audit report `ea4b16a4a844` (260 `wc -l`), archive receipt
`b41c2f6fb5a4` (180 `wc -l`). This block records the append; it edits nothing.

## Errata — round-8 append (stateful evidence + carried-debt pointers; append-only; never edit above)

Appended 2026-10-14 by lane **B8-4** (round-8 SKILL distillation; assignment:
append the stateful-evidence pattern + the carried-debt closure pointers, citing
`corpus/knowledge/stateful-fixture-evidence.md` and
`corpus/knowledge/carried-debt-closure-r8.md`). Nothing above is edited;
pre-append sha256 of this file: `8874306672b65d8dcf53b9cb4a237e295ed4834eb9147a19359683ded9c74abd`
(`945` `wc -l`). The post-append hash necessarily differs — re-derive with
`sha256sum`. This block is additions-only: the file gained three sections plus
this block at EOF; no pre-existing line's text is altered. Method: read-only over
`corpus/knowledge/*.md`, `corpus/evidence/`, `corpus/lessons/`, the round-8 plan
and record draft, the archive receipts, and `.ufo/l0-questions.md`; no browser
launched, no server run, no external site, no session material read. Pins cited
here are as-of-write: stateful note `e89bc89bff38` (773 `wc -l`; untracked,
moving in-wave — re-derive), carried-debt closure note `48dc8db69c57` (149
`wc -l`; untracked), archive receipt r8 `0587605db913` (191 `wc -l`; committed
`b377007`) — provisional until the archive keeps pace
(`cdp-evidence-patterns.md:92`). This block records the append; it edits nothing.

### Stateful evidence — server-side state and the non-idempotent step under failure (round 8)

The §"Layer routing" section above routes GET-shaped claims and flags the
state-changing class as unmapped; the loopback class now has a measured case:
`corpus/knowledge/stateful-fixture-evidence.md` (**`e89bc89bff38`**; lane B8-1;
§2 embeds its fixture verbatim). It closes round-7's deferred L1a–L1e
state-changing matrix **for the loopback class** (`plans/round-7-record-draft.md`
§3 :119-123) and measures round-8's own L1 cells — 14 cells × 2 cold reps, 0
journey errors, closure proven per run. Distillation (rules R1–R10, each with its
falsifier, are §10; §6–§9 are the records):

- **Server-side state is the ground truth**; read it through a quiet state
  surface before/after the cell (a fresh process's empty ledger also proves the
  after-state is this run's). Multi-visit: page `data-visits` 1→2, wire
  `cookieHeaderFields` 0→1, ledger `cookie=absent`→`present` (§4).
- **A cookie census is per-surface and shape-only** — server `Set-Cookie`, CDP
  store, page JS (HttpOnly: `len 0`), curl jar; cross-surface identity claims
  need the server's ledger (§5, R2).
- **Redirect-after-POST**: the client-side status is the terminus (200); the
  POST's own 303/307 lives at wire + server log; 307 preserves method and body
  end-to-end (8 B delivered), 303 changes to GET (§6, R3).
- **One-time token**: consumption is server-decided; a replay is refused with no
  state change; the client sees only the status (§6, R4).
- **An abandoned non-idempotent step has no client-side outcome**: three server
  architectures — apply-before-hold / apply-late / guard-skip — produce identical
  client observations (abort + nothing) and different server states (`counter 1` /
  `counter 1` / `counter 0`; token consumed / consumed / unused). Whether it
  applied is a server fact, not a protocol fact (§7.1, R5/R6) — this extends rung
  D3/D4.
- **A client abort stops a redirect chain at the hop in flight**; earlier hops
  may already have been delivered, and the terminus stays replayable with state
  unchanged (§7.2, R7/R8).
- **Client-script aborts cancel; CDP navigation commands at this timing did
  not** — 10/10 `AbortController` runs abort-marked vs 0/8 `Page.stopLoading` /
  second-`navigate` runs; negative result kept, mechanism unexamined (U4) (§7.3,
  R10).
- **Duplicate submission**: one wins, one is refused; the observable outcome is
  stable while the server's internal event order flips across cold reps — the
  matrix's one deliberate non-determinism class (§6, R9).
- **Replay contract**: fresh state root per run; byte-identity holds on derived
  facts (ledger 13/14 cells, 20/20 PNGs, normalized logs 14/14, digests 13/13)
  and does not hold on raw timings or CDP inter-kind event order (§9).

§11 names the unmeasured corners (guard race, replay-after-skip, token reuse
after a skipped apply, CDP cancel semantics, refusal-code generality — U1–U10)
and the note's own archive debt: its fixture + 32 run dirs live in
`/tmp/w8-tabi-b81/` and must be archived before any hash there is durable. **Do
not route real-site state-changing claims by this note** — loopback only, and the
never-set / default-deny boundary stands (`PROVINCE.md:15-19`).

### Harness-archive census — round-8 update (supersedes the round-7 block)

`corpus/evidence/` now holds **35 group dirs / 35 `MANIFEST.txt` / 1,416 evidence
files + 35 manifests = 1,451 files / 9,222,920 B** (`find corpus/evidence
-maxdepth 1 -mindepth 1 -type d | wc -l`; `find corpus/evidence -type f | wc -l`;
`du -sb corpus/evidence` — re-derived at this write) — the round-7 28-group census
plus the round-8 tranche's 7 groups / 41 files / 207,889 B
(`archive-receipt-r8.md` `0587605db913`, 191 `wc -l`, committed `b377007`):
`w5-tabi-b53` · `w5-aud-b5-work` · `w5-aud-b5-evidence` · `w6-tabi-b62` ·
`w7-b71-synth` · `w7-aud-b7-scratch` · `w7-aud-b7-checks`. Receipt checks re-ran
after landing: manifest self-check **41/41 OK**, copy fidelity **0 diff lines**
on all seven groups; verify from a group dir with `sha256sum -c MANIFEST.txt`.
Superseded, append-only: the round-7 census block above ("28 group dirs … 1,375
non-manifest files / 8,861,433 B") and the §"Harness archive" subsection's "25
groups / 1,010 files / 6,780,293 B" — the receipt is the citation authority for
the counts.

Carry-overs: **F1 closed by erratum, not by editing archived bytes** — see
`carried-debt-closure-r8.md` §1 (ER-F1): the stale in-group `methodology-sha.txt`
pair and the replay-edit delta; the manifest and the owning note remain the
authority (83/83 `sha256sum -c` OK). **F3 closed** (the r5 peer groups are
archived). **U2 open**: plan-draft-only scratch stays unarchived per the
receipt's stated selection rule — a record-owner's call.

### Carried-debt closure pointers (round 8)

Where each carried debt's status is measured; statuses stamped at this append —
re-derive at record time:

| carried item | closure surface | status at this append |
|---|---|---|
| round-6/7 `/tmp` tranche + receipt | `corpus/evidence/**` + `archive-receipt-r8.md` | **closed** — 7 groups / 41 files; 41/41 manifest OK |
| F1 — stale in-group pin file | `carried-debt-closure-r8.md` §1 (ER-F1) | **closed by erratum**; archived bytes untouched |
| round-7 L1 state-changing step | `stateful-fixture-evidence.md` §6–§9 | **closed for the loopback class** (this round) |
| round-8 L1 non-idempotent step under failure | `stateful-fixture-evidence.md` §7–§10 | **measured**; U1–U10 named |
| round-6 L1 matrix (wire-class / cache-revalidation) | `carried-debt-closure-r8.md` §2 | **open** at this append (not the stateful note's subject) |
| README header + coverage rows | `corpus/README.md` | **owed** — header still round-3 (`e156bb99af2c`, 59 lines) |
| SCORECARD r4–r8 verdicts / axes / move-log | `SCORECARD.md` | **owed** — r1–r3 tables only (`d2e6895264c6`, 86 lines) |
| lessons (one `## Gate` each) | `corpus/lessons/` | **7 files** (`round-1..7.md`, re-derived at this append) |
| packet cold-read verdict | `operator-approval-request.md` §6 (`:100`) | `[unknown]` since round 5 |
| packet note-pin block (9/9 stale) | `packet-readiness-r7.md` §2 (re-bound values) | open — owning record's call |
| clause (c) strictly-later-date §Pins pass | the §Pins errata block (this file) | **carried** — `date -u +%F` → 2026-10-14; earliest 2026-10-15; the witness is a dated in-repo block whose commit date is ≥ 2026-10-15 |