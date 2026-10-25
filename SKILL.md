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
## Errata — round-9 append (state-changing matrix usage + archive discipline; append-only; never edit above)

Appended 2026-10-14 by lane **B9-4** (round-9 SKILL distillation; assignment: append the
state-changing matrix usage + the archive discipline, citing
`corpus/knowledge/state-changing-matrix-r9.md`). Nothing above is edited; pre-append
sha256 of this file: `3b79ed2dea6c14578fe3a2043475ddf5e1a149cc4ca6ad1a1a3e09c75a497970`
(`1057` `wc -l`; 1058 logical — last line unterminated). The post-append hash necessarily
differs — re-derive with `sha256sum`. This block is additions-only: the file gained two
sections plus this block at EOF; no pre-existing line's text is altered. Method:
read-only over `corpus/knowledge/*.md`, `corpus/evidence/`, `plans/round-9.plan.md`, the
round-9 record draft, and the round-9 lane's scratch `/tmp/w9-tabi-b91/` (two
spot-checks against its raw artifacts); no run launched, no server started, no browser
opened, no external site, no session material read. Pins cited here are as-of-write and
provisional until the archive keeps pace (`cdp-evidence-patterns.md:92`): matrix note
`ec540be07ed5` (388 `wc -l` / 28,989 B; untracked, moving in-wave — re-derive), round-8
fixture pin `ac0013e03288ed28…` (12,311 B), stateful note `f04e2e473cf9` (855 `wc -l`),
carried-debt closure `48dc8db69c57` (149 `wc -l`). This block records the append; it
edits nothing.

### State-changing matrix — usage (round 9)

§"Layer routing" above routes GET-shaped claims and flags the **state-changing** class as
unmapped; §"Stateful evidence" (round 8) landed the step class for the loopback class.
The replay half now has a measured case: `corpus/knowledge/state-changing-matrix-r9.md`
(**`ec540be07ed5`** / 388 `wc -l`; lane B9-1; **untracked and still moving in-wave —
re-derive before citing**). It reuses round 8's stateful fixture **byte-identical**
(`server.py` `ac0013e03288ed28…` / 12,311 B; one revision across all 20 runs), on fresh
ports 19881/19882, and runs **9 cells × 2 cold reps + 2 rep3 = 20 runs, 0 journey
errors**, closure proven per run (note §0–§2). It closes the probes round 8 left owed
(`stateful-fixture-evidence.md` §9.4 item 4 / §11 U2) and round 7's L1d replay item
(`plans/round-7-record-draft.md` §3 :119-123). Use it whenever a loopback claim turns on
**a repeated state-changing request** — a replayed POST, a redirect-after-POST terminus,
a one-time token.

**The token-state decision table (note §3, measured).** One probe: the *same* form-encoded
POST bytes sent again, same client, after the state in column 1:

| token state at replay | client outcome (fetch) | ledger at replay | counter |
|---|---|---|---|
| **unconsumed** (guarded arm skipped the apply, `apply-skipped reason=client-gone`) | `200, redirected: true → /result` | `apply(mode=pre)` | `1` (the replay applied) |
| **consumed** by apply-before-hold / apply-after-hold / a completed submit+303 | `409, redirected: false` | `submit-refused(token-consumed)` | `1` (unchanged) |
| **never minted** | `409, redirected: false` | `submit-refused(unknown-token)` | `0` |
| **fresh** (form re-rendered) | `200, redirected: true → /result` | `apply(mode=pre)` after a second `token-mint` | `2` |

The three consumption paths are **indistinguishable at the replay** (identical 409 +
refusal event + unchanged counter); the guard arm is the only state whose replay is
accepted — and that replay is what recovers the abandoned attempt, exactly once
(**U2 closed**, 3/3 cold reps). The same-request replay therefore **discriminates the
abort arms for the client**: 409 ⇒ the token had been consumed (applied); 200 ⇒ it had
survived (skip) and the replay applied.

**Idempotency classes (note §7; r8 rows cited, r9 rows measured).** Define a class by
(method, redirect, token, state effect), then read the replay outcome off it:

| class | instance | replay of the same bytes | state effect | source |
|---|---|---|---|---|
| **S** safe read | GET `/result`, GET `/away` | identical response | none | r8 + r9 (§4 terminus ×2) |
| **C** counted GET | GET `/` (visits) | not idempotent: `visits 1 → 2` | visits +1 | r8 + r9 (`xclient-sessions`) |
| **M** method-preserving redirect, no state | POST `/echo307` → 307 → target | identical `{200, POST, 8 B}` | none | r8 + r9 (`replay-307`, twice) |
| **A** token-gated apply, unconsumed | POST `/submit`, unused token | accepted once: `303 → /result`, `apply` | counter +1, token consumed | r8 + r9 (`replay-guard-skip`) |
| **R** token-gated apply, consumed | POST `/submit`, used token | refused: `409`, no redirect | none | r8 + r9 (three paths, §3) |
| **U** unknown token | POST `/submit`, never-minted token | refused: `409`, `unknown-token` | none | r9 |
| **F** fresh token re-apply | POST `/submit` after a re-render | accepted, applies again | counter +1 per fresh token | r9 |
| **X** abandoned, applied | POST aborted mid-hold (`apply=pre`/`post`) | replay → **R** (409) | none on replay | r8 + r9 |
| **X′** abandoned, skipped | POST aborted mid-hold (`guard=1`) | replay → **A** (accepted; applies) | counter +1 (the replay's) | r8 + r9 |
| **D** duplicate, one token | two parallel identical submits | one winner, one 409 | one apply | r8 (`dup-submit`; event order flips, outcomes stable) |

**Replay contract, as exercised (note §8) — the usage rules.** (1) The **server's token
table decides**; nothing else does — same bytes + same token state ⇒ same outcome for
every client identity tested (browser and two independent curl jars). (2) The token is
**attempt-scoped**: consumed exactly once by the accepted attempt; an abandoned attempt
consumes it *iff* the server applied; a fresh render mints a new one that applies again
(guarded **per token, not per resource** — re-entering the step through a fresh render
double-applies). (3) **Redirect code shapes the replay**: 303 turns the follow-up into a
GET (terminus replay-stable, its POST not); 307 preserves POST + body and touches no
state. (4) The token **binds to nothing server-side** — not to the minting session, not
to the client, not to a run; any client presenting it consumes it, and every later replay
from *either* client is refused (the `apply` event records `sid: null` when the consumer
had no session). (5) Capture determinism is **per artifact**: PNG byte-identical across
cold reps, while a DOM capture of a token-bearing page diverges by exactly one line — the
hidden `#token` input's value (record it as a shape fact, never a value). (6) Rules
**M1–M8** with falsifiers are note §9 — use them as the check list, not as prose.

**Boundary — do not over-route.** This table is **loopback-only**. Real-site
state-changing claims stay behind the C2–C6 gates (§Approval table) and are not routed by
this note; the refusal **code** 409 is the fixture's choice — a loopback 409 is an
**instrument, never a real-server datum** (mirroring the 429 rule in §"Fixture v2";
note U9). Still open after r9: the round-6 wire-class / cache-revalidation matrix
(`carried-debt-closure-r8.md` §2), E3 third-party-JS-shaped async
(`external-class-fixture-v2.md` §9), the **cookie lifecycle across a browser restart** and
the cache × cookie freshness scope (U8), token expiry / table growth (U4), body
modification under the same token (U5), a simultaneous cross-client replay race (U6), a
two-browser (non-curl) cross-client pair (U2), the guard race at short holds (U1). And
**no non-author seat has re-run these cells** (note §10 SC-2 — the r8 VER-B8-1 / AUD-B8
pattern is owed). Session material stays shape-only throughout: cookie and token
**values are never printed** — length / charset class / attribute set only (note §0).

### Harness-archive discipline — round-9 update (census unchanged; the round-9 tranche is the obligation)

The discipline is unchanged from §"Harness-archive discipline" (round 7) and its
round-8 census block. Re-derived at this write (`ls` / `find` / `du -sb`):
`corpus/evidence/` holds **35 group dirs / 35 `MANIFEST.txt` / 1,451 files /
9,222,920 B** — **identical to the round-8 census**, so no supersession is needed: no new
tranche landed this wave. Verify from a group dir before reuse:
`sha256sum -c MANIFEST.txt`; take harness and fixture bytes **from the archive** when
`/tmp` is gone instead of re-authoring them.

- **The round-9 tranche is the open obligation.** The matrix note's scratch
  `/tmp/w9-tabi-b91/` is **unarchived**: re-derived at this write **2,665 files** —
  **2,396** under `*/profile*` (excluded by rule: shape-only, never read) and **269**
  non-profile (fixture `server.py`, the runner/driver revisions, `curl-replay.sh`,
  `verify.py`/`compare.mjs`, `run-all*.log`, `matrix.tsv`, `verify-out.txt`,
  `compare-out.txt`, and the **20 run dirs** of §11). Archive it into
  `corpus/evidence/<group>/` with a `MANIFEST.txt` (comment header + `sha256␠␠path`
  lines); **every hash in the matrix note is provisional until then**
  (`cdp-evidence-patterns.md:92`). The note's own §11 names the same debt.
- **Also still unarchived:** the round-8 tranche (`/tmp/w8-tabi-b81/`, `/tmp/w8-ver-b81/`)
  — carried from the round-8 census block; the round-9 record draft rows it as debt.
- **Caveats that travel with any group** (unchanged): bytes only — profile dirs excluded
  by rule, so a reconstituted run makes its own fresh profile per §Hygiene rules and must
  not look for a stored one; a **timestamped snapshot**, never live `/tmp` (a pinned group
  can gain bytes later — re-run the receipt check to detect drift); the manifest and the
  owning note's pins are the authority, an in-group pin file only a convenience (**F1**);
  `sha256sum -c` still checks every line.
- **Two mechanical spot-checks this lane ran** against the round-9 scratch (read-only, no
  run): (i) `runs/replay-consumed-post/rep1/http.log` reproduces the note's §3 fence
  verbatim (303 → `== ABORTED response write` → replay 409) and
  `runs/replay-guard-skip/rep1/ledger-after.json` carries `counter 1`,
  `tokens {minted 1, consumed 1, refused 0}`, `apply(mode=pre, bodyBytes 50)`; (ii)
  `verify-out.txt` prints `ec26a525bc7c6537` / `ab95cdd4b0b002a7` for the two central
  cells — the exact digests the note's §10 SC-3 quotes for rep1/rep2/rep3.
## Errata — round-10 append (the ten-round index + the arc-synthesis pointer; append-only; never edit above)

Appended 2026-10-14 by lane **B10-4** (round-10 SKILL distillation; assignment:
the final append — the ten-round table + the synthesis pointer). Nothing above is
edited; **the append is a pure byte-suffix**: pre-append sha256
`c07d29c3e8d178da70ad13876ac6a61d338588e9ddf30095b2515c2bcfce1f13`
(`1189` `wc -l` / `97,231` B, last byte `0a`), re-proved after the write with
`head -c 97231 SKILL.md | sha256sum`. The post-append hash of the whole file
necessarily differs — re-derive with `sha256sum`. Method: read-only over the lane
tree (the note set, `LOG.md`, `SCORECARD.md`, `plans/*`, `reports/*`,
`corpus/lessons/*`, `corpus/evidence/*`, git) at the write stamp
(2026-10-14T21:00:49Z); no run launched, no server started, no browser opened, no
external site, no session material read. Pins below are **as-of-write**, taken
from disk; later appends move them, and the round-10 record (in flight, then
committed) supersedes this block. This block records the append; it edits
nothing.

### The ten rounds at a glance

Lane-local numbering; the fleet commit subjects carry the same rounds as
"training r(N−1)" (`ad735dd` = "probation round 9 (training r8)"). The branch
vocabulary (G/D/L) is the post-filing form (r6 onward); rounds 1–4 ran
loopback-by-construction with no L0 line to answer, and round 5 was the filing
round itself — the only `tabi` line remains the r5 filing
(`.ufo/l0-questions.md:25`; file `02c53ec60acf…` / 25 lines, byte-identical at
every read since). Artifact pins are `sha256` first-12 · `wc -l`; a note a later
round appended to carries a different pin than its own round stamped — the
round's record holds the then-pin.

| # | axis move | branch | headline landed artifact(s) — pin · `wc -l` (as-of-write) | commit |
|---|---|---|---|---|
| 1 | coverage + calibration | n/a — pre-filing | `webbridge-plugin-anatomy.md` `8d1488ab763e`·290 · `browser-surface-census.md` `a33c22644d64`·265 · `cdp-evidence-patterns.md` `337ff64579e8`·234; SKILL +114/−2 | `7961735` |
| 2 | depth — evidence ladder | n/a | `live-dynamic-capture.md` `01266495b761`·245 · `webbridge-daemon-disposition.md` `fd5f6861aa3b`·274 | `5d2e95d` |
| 3 | depth + calibration | n/a | `multi-step-journey.md` `e0367890f1cf`·349 · `interaction-approval-table.md` `b5e29a9a2adf`·246 · `executor-test-sufficiency.md` `32772e343848`·329; SKILL +512/−178 | `094c27a` |
| 4 | coverage — network rung | n/a | `network-evidence-rung.md` `d1564f38dc14`·609 · `async-step-evidence.md` `05dcda5e60b9`·282 · `hygiene-sweep-r4.md` `87155e12021d`·258 | `282fc6d` |
| 5 | freshness — filing + archive | n/a — the filing round | `archive-receipt-r5.md` `b41c2f6fb5a4`·180 · `lessons/round-1..4.md` · `operator-approval-request.md` `94dc63f5fb9e`·121 + 1 L0 line | `bc4b7d5` |
| 6 | freshness + calibration | L (SILENT) | `external-class-fixture-v2.md` `4aa604f1788b`·569 · `webbridge-revival-assessment.md` `a07c8aedc161`·322 | `c0467a6` |
| 7 | calibration + freshness | L (SILENT) | `layer-routing-synthesis.md` `7725ee421716`·254 · archive completed → 35 groups | `b377007` |
| 8 | depth — stateful | L (SILENT) | `stateful-fixture-evidence.md` `f04e2e473cf9`·855 · `carried-debt-closure-r8.md` `48dc8db69c57`·149 · `lessons/round-6..7.md` | `6a8861c` |
| 9 | depth — state-changing | L (SILENT) | `state-changing-matrix-r9.md` `ec540be07ed5`·388 · `lessons/round-8.md` `d974eadc29f6`·256 · `archive-receipt-r8.md` → `de45b805e5a4`·218 | `ad735dd` |
| 10 | clause F (clause (c) + archive) · clause S (the arc synthesis) | L (SILENT) | `arc-synthesis.md` `f42428bd9af7`·183 · `archive-receipt-r10.md` `c6f4445ebd03`·203 (group `w9-tabi-b91`, 269 files) · `lessons/round-9.md` `07c3039ea5bd`·277 · this block | pending at this write — the round-10 scribe commits after the seats |

Supporting pins (all re-derived at the write stamp): reports r4–r9 —
`5f44b0f94483`·167 · `d09f1712cbcf`·170 · `9428ddec52b9`·178 ·
`ea4b16a4a844`·260 · `a191832be152`·181 · `df34bf6c63e1`·174; lessons r1–r8 —
`bdd46c85b349`·59 · `a862d69cb0b9`·60 · `153a1b9831bb`·69 · `cde3960eb1a9`·87 ·
`46029f48e27d`·139 · `86da9d2b9419`·150 · `88c8244c2bab`·172 · `d974eadc29f6`·256.
Round-1's as-stamped pins (at `7961735`) were `49f0735b0594` / `9e4d69dcd658` /
`034b1e53b004` (`git show 7961735:<path> | sha256sum`; the table carries today's
values). Per-round detail, verdicts and the debt ledger live in the records the
commits carry (`LOG.md:5` r1, `:29` r2, `:76` r3, `:131`–`:136` r4–r9;
`plans/round-{4..10}-record-draft.md`; the arc synthesis below).

### The arc synthesis — the ten rounds' re-derivation entry point

`corpus/knowledge/arc-synthesis.md` — **`f42428bd9af7`** / `183` `wc -l` (lane
B10-1; the output path is the assignment's — the plan's candidate
`ten-round-synthesis.md` was never the landed name, r10 record-draft F-8). It was
still moving at the record's read (three shas inside four minutes:
`6e46d1bb0a7e` → `1b4b273141ba` → `f42428bd9af7`) and stable from 20:56:19Z to
this write stamp — **re-derive before citing**. It holds, every row anchored to
an in-repo source: the evidence ladder as built — 4 rungs + 5 extensions, each
with its measured boundary (§1); the approval discipline — the arc by round,
rules with citations, the operator arc measured (packet `94dc63f5fb9e…`, one L0
line, ask-count 1, silence span 3 h 47 m at its read) (§2); the archive as
infrastructure — the receipt pattern, the tranche table with read times, the open
debts (§3); the loopback perimeter and the gate's final state — §4.4 carries
clause (c) IN FORCE and the revival decision `carried-unasked` (§4); unknowns
(§5); a provenance-pin table plus its own spot-checks (§6). Use it — not this
file, and not the LOG prose — for the ten rounds' findings and limits; this file
keeps the usage rules and the pointer-level index above. Its open items travel
with it: the `corpus/README.md` coverage row and the SCORECARD refresh are the
integrating round's (README header still round-3 at this write — "8 notes, 1944
lines … Lessons: 0" vs actual 22 / 6,824 / 9; named debt, r10 record-draft
F-4/F-5).

### Pin re-binds — declared by this append (nothing above edited)

Round 10's §Pins pass (`plans/round-10-record-draft.md` §4, in flight at this
write) matched 26/28 existing assertions + 2 supersessions-with-declared-errata +
0 unexplained; history pins 5/5, substrate 3/3. The moved citations, re-bound
here — and the new r10 pins — append-only:

- `archive-receipt-r8.md` — `SKILL.md:963` / `:1024` cite `0587605db913` / 191
  (committed `b377007`). The committed revision is **`de45b805e5a4…` / 218** (the
  F1-erratum append in `ad735dd`); the receipt's own appended block declares the
  pre-append value. (r10 record-draft F-1 — the repair this distillation seat
  owes.)
- `stateful-fixture-evidence.md` — `SKILL.md:961` cites `e89bc89bff38` / 773 with
  its own "untracked, moving" caveat; the committed revision is
  **`f04e2e473cf9…` / 855** (the value the r9 block already carries). Declared
  supersession, not drift. (r10 record-draft F-2.)
- `state-changing-matrix-r9.md` — `SKILL.md:1073` / `:1083`'s "untracked, moving
  in-wave" caveat is discharged: `ec540be07ed5` / 388 is the committed revision
  (`ad735dd`); the caveat stands as written. (r10 record-draft F-3.)
- New this round (first pins): `arc-synthesis.md` `f42428bd9af7…` / 183;
  `archive-receipt-r10.md` `c6f4445ebd03…` / 203 (the r9 tranche: 269 files /
  1,065,924 B, checks A–D + SC1–SC7, source-drift re-check 0 diff);
  `lessons/round-9.md` `07c3039ea5bd…` / 277.

### Clause (c) — final state at this write (the strictly-later-date §Pins pass)

`date -u +%F` → **2026-10-14**; the newest in-repo commit date is
`2026-10-14T17:47:30-03` (`ad735dd`) — no witness dated ≥ 2026-10-15 exists, so
the pass stands **IN FORCE** and the round-5 four-clause claim stands **3/4**
with clause (c) named as structurally time-blocked inside the round's window (the
UTC date flips 2026-10-15T00:00Z = 21:00 -03; this write stamp is ~3 h before
it). It closes only with a dated in-repo re-derivation block whose commit date is
≥ 2026-10-15 (`git show -s --format=%cI` recorded) **plus** the match count — a
same-day pass never closes it. The same-day pass round 10 did run is recorded
(`plans/round-10-record-draft.md` §4). The refresh list the closing pass must
re-derive: the note set as it stands at that gate (22 notes / 6,824 lines at this
write), `reports/r4..r10` as landed, the 3 substrate pins (`e70aff5c40ff` /
`84a8e69d04c5` / `b811d9c23dfd`), and this file's then-current revision.

### Residual pointers (named, not repaired here)

- The training chain's length is contested on record: the round-10 plan presumed
  this was the chain's final lane round; `plans/round-11.plan.md` (lane PREP-B11;
  counters over prose) measures lane round 11 = training r10 = the closeout. The
  round-10 record quotes both; this append cites neither as settled.
- Fleet-level, reported not absorbed (carried from r5): tabi is still absent from
  the watchdog `LANES` roster — `scripts/shokunin-watchdog.sh:14` →
  `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"`
  (re-read at this write).
- The round-10 integrating work still owed at this write (the scribe/record
  seats'): the `corpus/README.md` coverage row + header, the SCORECARD r4–r10
  refresh, `corpus/lessons/round-10.md`, the packet cold-read verdict, the LOG
  entry and the commit.

This block records the append; it edits nothing.
## Errata — round-11 append (the final pointers; append-only; never edit above)

Appended 2026-10-14T21:36Z by lane **B11-4** (round-11 SKILL final distillation;
assignment: the final pointers to this file). Nothing above is edited; the append
is a pure byte-suffix: pre-append sha256
`453ed25a07f62a083e268b377b53236ac3007bcf758c84d8f190bb2c8219b596` / `1320` `wc -l` /
`107,005` B, last byte `0a` — re-proved after the write with
`head -c 107005 SKILL.md | sha256sum`. Method: read-only over the lane tree at the
write stamp (`sha256sum` first-12 · `wc -l` · `git status` · `ss`/`pgrep` · a
shape-only substrate census); no run launched, no server, no browser, no external
site, no session material content-read. Every value below is **as-of-write**; the
round-11 landings (the closeout, the record refresh) move them — re-derive before
citing. This block records the append; it edits nothing.

### T1 — Terminal state (as-of-write)

| Surface | Value at this write | Command (re-run verbatim) |
|---|---|---|
| this file | `453ed25a07f6` / `1320` / `107,005` B (pre-append) | `sha256sum SKILL.md; wc -lc SKILL.md` |
| ten-round entry point | `arc-synthesis.md` `f42428bd9af7` / 183 — unchanged since the r10 pin | `sha256sum corpus/knowledge/arc-synthesis.md` |
| round-11 closeout | **not landed** at this stamp (`ls corpus/knowledge/training-closeout.md` → No such file or directory); the landed path + pin live in the round-11 commit / LOG entry | `git log --oneline -1; git show --stat` |
| L0 operator surface | `.ufo/l0-questions.md` `02c53ec60acf` / 25 / 21,539 B / mtime `2026-10-14 14:05:52.482908587 -03` / 1 `tabi` line — byte-identical to the r5 filing state | `sha256sum; wc -lc; stat -c %y; grep -c tabi` |
| daemon | no listener on 10086 (`→ 0`); no `kimi-webbridge` process (`→ 0`); `daemon.pid` 8 B / `daemon.addr` 16 B, mtime `10:46` — revival `carried-unasked`, nothing owed to stop | `ss -ltn | grep -c 10086; pgrep -x kimi-webbridge | wc -l` |
| corpus | 22 notes / 6,824 lines; lessons 9 / 1,269; reports 7 / 1,341 | `ls corpus/knowledge/*.md | wc -l; wc -l` |
| evidence archive | 36 groups / 36 `MANIFEST.txt` / 1,721 files / 10,318,947 B | `ls -d corpus/evidence/*/ | wc -l; find corpus/evidence -type f | wc -l; du -sb corpus/evidence` |
| repo | HEAD `d24b98d` ("probation round 10 (training r9)"); worktree clean at the stamp | `git log --oneline -1; git status --short` |
| never-set | consequential external acts · session-material content-reads · out-of-province work (`PROVINCE.md:15-19`) — unmoved by any grant | `PROVINCE.md` |

### T2 — The §Pins block (`:37-85`), re-bound finally

The block at `:37-85` is a round-4 as-of-write snapshot; every value below moved by
*declared* errata appends (each note's own append header carries its pre-append
hash — spot-verified on four: `webbridge-plugin-anatomy.md:289` declares
`6ce6fdd018a7…`, `cdp-evidence-patterns.md:233` `8de2ee008c9c…`,
`live-dynamic-capture.md:244` `f97c10238907…`, `network-evidence-rung.md:608`
`4889ccf073a8…`). Final values at this write:

| §Pins entry | as cited | final | `wc -l` |
|---|---|---|---|
| `webbridge-plugin-anatomy.md` | `6ce6fdd018a7` | `8d1488ab763e` | 290 |
| `browser-surface-census.md` | `a4bbb39edb12` | `a33c22644d64` | 265 |
| `cdp-evidence-patterns.md` | `8de2ee008c9c` | `337ff64579e8` | 234 |
| `live-dynamic-capture.md` | `f97c10238907` | `01266495b761` | 245 |
| `webbridge-daemon-disposition.md` | `03af1fb0693e` | `fd5f6861aa3b` | 274 |
| `interaction-approval-table.md` | `d6ad567a610c` | `b5e29a9a2adf` | 246 |
| `executor-test-sufficiency.md` | `5f04f6877e1e` | `32772e343848` | 329 |
| `multi-step-journey.md` | `8925ce6c46c7` | `e0367890f1cf` | 349 |
| `network-evidence-rung.md` | `4889ccf073a8` | `d1564f38dc14` | 609 |
| `async-step-evidence.md` | `577af06bd9a8` | `05dcda5e60b9` | 282 |
| `hygiene-sweep-r4.md` | `4ddc67151b98` | `87155e12021d` | 258 |
| `reports/r4-aud-tab1.md` | `5f44b0f94483` | `5f44b0f94483` (held) | 167 |
| substrate `kimi.plugin.json` | `e70aff5c40ff` | `e70aff5c40ff` (held) | — |
| substrate skill file | `84a8e69d04c5` | `84a8e69d04c5` (held; path resolved in T4) | 158 |
| `references/operations.md` | `b811d9c23dfd` | `b811d9c23dfd` (held; path resolved in T4) | 34 |

The §Pins annotation line-counts are stale with them (approval 241, executor 325,
journey 345, network 605, async 278, hygiene 254) — the `wc -l` column above is the
final authority.

Pinned finally (files §Pins never carried; first pins here unless noted):
`stateful-fixture-evidence.md` `f04e2e473cf9`·855 · `carried-debt-closure-r8.md`
`48dc8db69c57`·149 · `layer-routing-synthesis.md` `7725ee421716`·254 ·
`external-class-fixture-v2.md` `4aa604f1788b`·569 · `webbridge-revival-assessment.md`
`a07c8aedc161`·322 · `state-changing-matrix-r9.md` `ec540be07ed5`·388 ·
`archive-receipt-r5.md` `b41c2f6fb5a4`·180 · `archive-receipt-r8.md`
`de45b805e5a4`·218 · `archive-receipt-r10.md` `c6f4445ebd03`·203 ·
`arc-synthesis.md` `f42428bd9af7`·183 · `packet-readiness-r7.md` `7185642c2e41`·122 ·
`corpus/handoffs/operator-approval-request.md` `94dc63f5fb9e`·121 · reports r4–r10
(`5f44b0f94483`·167 · `d09f1712cbcf`·170 · `9428ddec52b9`·178 · `ea4b16a4a844`·260 ·
`a191832be152`·181 · `df34bf6c63e1`·174 · `11dd09350de7`·211 — the r10 report is new
here) · lessons r1–r9 (`bdd46c85b349`·59 · `a862d69cb0b9`·60 · `153a1b9831bb`·69 ·
`cde3960eb1a9`·87 · `46029f48e27d`·139 · `86da9d2b9419`·150 · `88c8244c2bab`·172 ·
`d974eadc29f6`·256 · `07c3039ea5bd`·277) · `SCORECARD.md` `106377d15dc8`·89 ·
`corpus/README.md` `e156bb99af2c`·59.

### T3 — Declared-supersession pins (hold; not drift)

- `0587605db913`·191 (`archive-receipt-r8.md`, cited `:963`/`:1024`) — declared
  pre-append value (the receipt's own block); final `de45b805e5a4`·218 (T2).
- `e89bc89bff38`·773 (`stateful-fixture-evidence.md`, cited `:961`/`:971`) —
  declared pre-append (r10 `:1278`); final `f04e2e473cf9`·855.
- This file's revision chain — each append above declares its own pre-edit hash
  (r6 `dcc33f1b…`·765, r10 `c07d29c3e8d1…`·1189; this one `453ed25a07f6`·1320);
  `452bc514d387`·576 (r3) stays historical.
- Harness/methodology pins resolve to the archived copies — 5 spot-checked
  byte-equal at this write: `tabi-r2-1-capture/{capture.mjs `d37d36dd92d0`·209,
  driver.sh `8105bed02840`·85, compare.mjs `e558bd547c58`·47}`,
  `w4-t41-network/{net-journey.mjs `46c81f99decf`, net-driver.sh `67c94a3a275d`}`
  (`corpus/evidence/`); the `/tmp` staging is volatile by design
  (`cdp-evidence-patterns.md:92`).

### T4 — Substrate paths, resolved (shape-only)

The skill file has lived at `~/.kimi-code/plugins/managed/kimi-webbridge/skills/
kimi-webbridge/SKILL.md` since the install (mtime `2026-10-03 18:06`), not at the
plugin root; the root path does not resolve (`sha256sum` → ENOENT). Bytes at the
real paths match §Pins 1:1 (`84a8e69d04c5`·158; `references/operations.md`
`b811d9c23dfd`·34; `kimi.plugin.json` `e70aff5c40ff`). The install record
`installed.json` (390 B, mtime `2026-10-03 18:06`) sits at
`~/.kimi-code/plugins/`, not inside the plugin dir — a path correction for
`MINT.md:6-7`'s parenthetical. Two dated census files sit at the plugin root, not
recorded by any note at this write: `03-browser-extension.txt` (2,703 B — a
chromium process table at 17:40:47Z) and `04-headroom.txt` (338 B — a
memory/swap/load snapshot at the same stamp). Named, not repaired.

### T5 — Round 11 — the closeout (as-of-write)

- Numbering: lane round 11 = training r10 = the closeout (`plans/round-11.plan.md`
  `21317a8ad672`·716, header `:11-30`). The move: freshness — clause (c)'s final
  state (`:422-465`) + clause Z's closeout (`:467-553`).
- Gate read at this stamp: L0 byte-identical to the filing (`02c53ec60acf…`, above)
  → the plan's table (`:190-197`) routes SILENT → Branch L
  [inference from the measured L0 row; the round's own classification governs].
- Not landed at this stamp: the closeout artifact; `lessons/round-10.md` +
  `round-11.md` (`ls corpus/lessons` → 9, last `round-9.md`); the README header
  still reads round 3 — "8 knowledge notes, 1944 lines … Lessons: 0" vs actual
  22 / 6,824 / 9 (`corpus/README.md:5-9`); the SCORECARD verdict tables r1–r3 only
  (`SCORECARD.md:18`/`:26`/`:38`), axes table r1-pinned (`:53-62`), move-log rows
  through r10 (`:64-89`).
- Open debts this append does not repair (the round's record work): the packet's
  cold-read verdict — still `[unknown]`
  (`corpus/handoffs/operator-approval-request.md:100`); the packet's stale
  note-pin block (`packet-readiness-r7.md` §2, pin `7185642c2e41`); the
  declared-stale SKILL pins of T2's "as cited" column.

### T6 — Residual pointers (the closeout carries them)

- Fleet-level, reported not absorbed (r5 onward): tabi absent from the watchdog
  roster — `scripts/shokunin-watchdog.sh:14` →
  `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"`.
- What the chain did not establish (each with its recognition surface): zero
  real-site datum (approval-gated); rate/ToS U1 (`interaction-approval-table.md`
  §7); the extension↔daemon handshake (`extension_connected:false` throughout);
  byte-identity environment scoping; real-site POST/redirect/CSRF classes; clause
  (c) — a strictly-later-date witness ≥ 2026-10-15 (unblock recipe
  `plans/round-11.plan.md:453-459`); the non-author re-run odometer. Full
  enumeration: `arc-synthesis.md` §5 + the closeout.

This block records the append; it edits nothing.

## Errata — fleet round-1 later-date pin witness (2026-10-15 UTC)

This append supersedes only the carried clause-(c) status at `:829`, `:1058`,
`:1290-1303` and `:1455-1456`. Those dated training snapshots remain historical.
Authority and recipe: `plans/round-11.plan.md:422-459`; closing threshold:
**2026-10-15T00:00:00Z**, epoch **1792022400**. This is the explicitly steered
fleet round-1 after training round 11, not a relabeling of either history.

Pre-append revision: baseline
`c24eaea14dfc0c4a3848742d31673db5675f9183:SKILL.md`,
SHA256 `f4d9cf5b1aa5711948a4f86cf111b0560b39f4df76ed504cbe4559e7e4c9acfe`,
**1458 newlines**. The independent expected prefix is persisted at
`SCORECARD.md:15`. This identifies the measured input, not this appended file's
necessarily different hash.

### Re-derived target set and result

`corpus/evidence/fleet-round-1-freshness/pins.tsv` records **34 MATCH rows,
34 distinct target identities, 0 unexplained mismatches**:

- **23** baseline knowledge notes: `git ls-tree -r --name-only
  c24eaea14dfc0c4a3848742d31673db5675f9183 -- corpus/knowledge`.
- **7** landed reports r4–r10: the same `git ls-tree` command over `reports`.
- **3** public plugin files at the resolved T4 paths (`:1412-1418`).
- **1** pre-append `SKILL.md` revision identified above.

Each row carries its full observed SHA256, newline count, independently
persisted expected prefix and immutable source location. All **31** lane
targets also match the full baseline blob hash; external public files have
**no invented Git baseline**. Detailed actual commands, timestamps and source
text: `planner-current.json` (`measurements.rows`); disjoint executor receipts:
`notes-current.json`, `reports-current.json`, `substrate-current.json`, all in
that evidence directory. Measurements occurred on 2026-10-15 UTC. New review
artifacts, screenshots and this witness are not extra domain-coverage targets.

Declared supersessions remain visible: `archive-receipt-r8.md`
`0587605db913`/191 → `de45b805e5a4`/218; `stateful-fixture-evidence.md`
`e89bc89bff38`/773 → `f04e2e473cf9`/855; `archive-receipt-r10.md`
`c6f4445ebd03`/203 → **`79255f1e03b8`/424**, independently persisted at
`LOG.md:140` and `SCORECARD.md:16-17`. The last receipt's first 15,197 bytes
still reproduce its historical full SHA; no old pin was silently rewritten.

### Recheck and closing predicate

Count this round's committed witness rows, setting `REV` to the actual witness
commit (recorded after creation in `SCORECARD.md` and the fleet report):

```sh
git grep -h '^MATCH[[:space:]]' "$REV" -- corpus/evidence/fleet-round-1-freshness/pins.tsv | wc -l
git grep -h '^MATCH[[:space:]]' "$REV" -- corpus/evidence/fleet-round-1-freshness/pins.tsv | cut -f2 | sort -u | wc -l
git show -s --format='%H %cI %ct' "$REV"
```

Both counts must be **34**, with exact target-set equality, not merely equal
cardinality. Re-derive lane-file hashes using `git show
c24eaea14dfc0c4a3848742d31673db5675f9183:<target> | sha256sum`; recheck the
three public files with `sha256sum` at their resolved paths. The preserved
prefix sources are independent of this measurement. Newline counts use `wc -l`,
not rendered reader lines. Clause (c) closes only when the commit carrying this
dated append has `%ct >= 1792022400` and the complete match count is recorded;
the post-commit receipt supplies that actual hash. `TZ=UTC git show
--date=iso-strict` retained the original offset in the observed runtime; use
`date -u -d @<ct>` for an actual UTC rendering.

### Scope of the result

The actual fresh browser replay is `browser-current.json` plus its two
`browser-current-*.png` captures: lane-authored loopback fixture, hydration,
count **0 → 1 → 2**, two delayed confirmations, owned tab/server cleanup.
`reports-current.json` separately records **491/491** checksum successes over
three named existing archive manifests. Neither result proves every archive,
historical pixel equality, an attached extension, daemon health, a signed-in
session, rights/rate behavior, or any real-site capability. No substrate file
was changed and no daemon action was performed. L2 reviews are same-lane
advisory evidence, not outside SHONEN/LEARNING attestations or promotion.

## Errata — interactive fleet round-1 reconciliation (2026-10-15)

The preceding fleet-round-1 append was inherited **uncommitted**. Its
`*-current.json` files describe the stopped headless attempt, not this
interactive session. The nine-seat `Round1*` batch does not satisfy the current
operator's exactly-32-seat validated-wave contract. This supersedes any reading
of `LOG.md:179-183` or `corpus/lessons/round-1.md:106-119` as current-contract
compliance or a completed round. Existing bytes and errata are preserved.

Current plan: `.ufo/plans/fleet-round-1-interactive-20261015.md`; evidence:
`.ufo/rounds/fleet-round-1-interactive-20261015/`. Canonical plan/render accepted
32 distinct scopes (23 note audits, seven report audits, public-plugin audit,
connector). **No dispatch:** global taxonomy aliases do not provide the
operator-required `@m_grok` audits or `@m_antigravity` connector with `@m_zfl`
fallback (`routing.json`, `wave-validation.json`). Named aliases existing in
`modelRoles` do not bind taxonomy roles. Never bypass this with model pins,
new overlays, renamed roles or configuration writes.

### Freshness gate registry

| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted baseline | Write scope |
|---|---|---|---|---|---|
| closeout-pin-witness | gate / tabi | `node scripts/check-freshness.mjs --worktree` (candidate only), or `node scripts/check-freshness.mjs --witness REV`; 0 clean, 1 failed, 2 could-not-evaluate | `node scripts/check-freshness.mjs --self-test`; eight isolated CLI cases assert exit and stable finding | `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`; immutable baseline `c24eaea14dfc0c4a3848742d31673db5675f9183` supplies full lane blobs and independent prefix citations; `pins.tsv` supplies measured rows, not their own authority | Read-only repo/public allowlist in normal modes; self-test writes/deletes only its owned temporary fixture repository; stdout/stderr evidence captured by L1 |

The gate requires exact target-set equality, unique identities, independent
baseline source prefixes, full lane-blob equality, newline counts and the
unchanged pre-append SKILL prefix. Witness mode also requires baseline ancestry
and the commit instant threshold. Public files have no invented external Git
baseline. Candidate mode does not close clause (c); post-commit witness output
and the actual hash/epoch are recorded in SCORECARD and the lane-local report.
The gate checks pin integrity, not the truth of every historical domain claim.

The interactive browser smoke used the committed local fixture, owned port
19472, hydration and two settled real clicks: 0→1→2, two confirmations.
`browser-after.png` was visually inspected; tab released, owned server stopped,
port connect result 111. This remains loopback-only semantic evidence, not
historical pixel equality or external-site/daemon capability. No outside
admit/reject spot-check or new SHONEN attestation was performed. A locally
landed freshness witness does not cure the blocked dispatch or mint a receipt.

### Safety erratum — fixed gate inputs

The first gate shipped in `716dc8ac8982c5b32518c052e6bf8a25f23b8ca2`
trusted mutable `publicTargets` metadata before file reads. Do not use that
gate revision: it could hash an arbitrary host file if both metadata and table
were changed. No real-host-path reproducer was executed.

The corrected gate hardcodes the three exact public identities listed in §T4;
metadata cannot widen them or redirect the pin table/descriptor. Production
reads refuse symlinked/non-regular inputs and open files with `O_NOFOLLOW`.
Alternate repository roots are explicitly labeled `profile=fixture` and map
those fixed identities only to three fixed files inside the isolated fixture
repository; self-tests never hash the real public plugin files.

This supersedes the registry's eight-case self-test count: **12** same-CLI
cases now include injected public targets/table paths and symlinked public
files/descriptors, with pinned exit/finding pairs. Full corrected captures:
`gate-selftest-safe.json` and `gate-worktree-safe.json` in the interactive
evidence directory. The original outputs remain historical, not shipping
safety evidence; post-commit output identifies the corrected carrying commit.

## Errata — kaika fleet round-1 (2026-10-19; append-only; never edit above)

**Where to learn more:** `corpus/SOURCES.md` — opened, scoped-tier rows with study paths
(`profile-isolation`, `protocol-choice`, `flake-receipts`, `accessible-selectors`), the
search log and unopened leads. Rows are where to learn, not admitted facts.

| Situation | Rule | Source |
|---|---|---|
| Launching any Chrome/Chromium with `--remote-debugging-port/-pipe` | Always the runbook's `--user-data-dir=<out>/profile` (`:129`). Branded Chrome ≥136 refuses the default data dir; this host's unbranded Chromium does **not** — never rely on the browser's refusal as the guard; never debug the user's profile (§Session-material `:660`) | `corpus/knowledge/chrome-remote-debugging-profile-boundary.md` §2–§4 |
| Tempted to move a capture from CDP to WebDriver BiDi | Choose transport per evidenced feature: claim a BiDi surface only after a pinned browser/binding loopback probe reproduces the CDP evidence contract; the W3C draft is protocol text, not support | `corpus/knowledge/webdriver-bidi-capability-matrix.md` §2–§3 |
| A browser test fails, then passes on retry | Record it `flaky`, never `passed`: keep every attempt, the order seed, the first-retry trace and the awaited state predicate; no fixed-sleep "fix" | `corpus/knowledge/web-flake-retry-evidence.md` §2, Rejected |

### Sources gate registry

| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted baseline | Write scope |
|---|---|---|---|---|---|
| sources-census | gate / tabi | `node scripts/check-sources.mjs [--file REL] [--since YYYY-MM-DD]`; 0 clean, 1 failed, 2 could-not-evaluate (missing, symlinked or non-regular registry; bad args). FINDING lines carry `fleet=<E/W code>` where the in-flight fleet census defines one | `node scripts/check-sources.mjs --self-test`; 25 isolated CLI cases assert exit + finding id (clean with contract-awk row/tier parity, one per finding, a `supersedes` correction that must stay clean, an `S0010`-vs-`S001` id-boundary case; symlinked, non-regular and missing registry also assert the refusal detail) | Expected exit/finding table inside the script; the registry is a lane artifact (no fleet-artifact dependency); first receipt `corpus/evidence/kaika-fleet-round-1/operability/selftest-receipt.txt` | Read-only over the registry and in-root used-by files (`O_NOFOLLOW`, symlink and `..` escape refused); self-test writes only its own temp dir |

Structural only: the gate cannot see whether a source was opened — that proof is the
round lesson's `## Gate` (`corpus/lessons/kaika-fleet-round-1.md`).

### Errata — kaika round-1 post-review (2026-10-19; append-only)

- **Correction to `:1606`.** "this host's unbranded Chromium does **not**" refuse is an
  **inference from Chromium source** (`remote_debugging_server.cc` @main:169-177, S028
  supersedes S004), not an observation — no launch against a default data dir was made
  or will be. The rule in that row stands unchanged: always the runbook's
  `--user-data-dir`, never rely on the browser's refusal.
- **Correction to `:1614`.** The sources gate now validates rows only inside
  `## Registry`; an `S###` row in any other section fails `row_outside_registry`.
  Self-test: **26** cases (adds `row-outside-registry`). Receipt
  `corpus/evidence/kaika-fleet-round-1/operability/selftest-receipt-post-review.txt`.

## Round 12 — accessible evidence (2026-10-20)

| Claim to establish | Evidence choice | Boundary |
|---|---|---|
| The intended control can be identified across re-rendering | Prefer a role plus accessible name; use the associated label for a form control; narrow the scope until the intended single-action target is unique | A role match is not an accessibility conformance result; do not hide ambiguity with an unexplained first/nth choice |
| A selected accessible structure satisfies the intended contract | State the ARIA template, scope, names/state constraints and child matching mode explicitly | Default partial matching permits omitted names, attributes and children; matching is not full-tree equality |
| The page looks correct or performed the intended network action | Keep the existing screenshot / DOM-state-predicate / network ladder | An ARIA template match proves neither rendered appearance nor the network action [inference]; ARIA and DOM shape are not independent rung-3 witnesses |

Source and precise examples: `corpus/knowledge/playwright-accessible-locators-and-snapshots.md`
(S023–S025, reopened 2026-10-20). Documentation-held, not a locally demonstrated Playwright
capability. This extends the state-evidence routing at `:402`; Playwright YAML and webbridge
`@e` snapshots are different producers/formats and must not be conflated.

## Round 12 — bounded source-claim rechecks (2026-10-20)

Source-only freshness reviews live in `corpus/evidence/round-12/source-recheck.json` and
`corpus/knowledge/source-recheck-round-12.md`. The profile note's socket-factory conflation
is corrected there and by an appended erratum; the retry note has a rolling-stable version
qualification. Review dates do not refresh historical runtime captures. A source reading
supports a source-scoped inference, not an observed host result. Same-lane recheck seats
are author-side, not independent non-author verifiers.

### Bounded claim-record gate registry

| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted baseline | Write scope |
|---|---|---|---|---|---|
| claim-record-discipline | gate / tabi | `node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --file fixtures/m2-inference-source-scoped.jsonl`; 0 clean, 1 failed, 2 could-not-evaluate | Same entry with `--self-test` only; isolated fixtures assert code and stable finding, including source-only host observation refusal | `.ufo/waves/round-12/w1/mistake/expected.json` pins fixture digests and expected code/finding pairs | Input read-only; self-test writes only a temporary fixture tree and deletes it |

This is a bounded structured-record/lexical guard for the mined mistake, not an NLP truth
checker, a source verifier, or evidence that a runtime claim is true. A synthetic runtime
control tests schema handling only and is not a fabricated browser observation. The
round-counting command `.ufo/waves/round-12/measure.mjs REV` counts committed evidence;
it is not a gate and does not independently judge source truth.

## Round 13 — historical-gate compatibility registry (2026-10-20)

These are historical campaign-contract gates, not browser-support or promotion
oracles. The compatibility policy keeps the original measurement commits fixed:
canonical four-box SHONEN regeneration is checked separately from its historical
census row; historical lesson bytes remain protected, while a new required lesson
must not be mistaken for rewriting an old one. A `[~]` evidence pointer must be a
committed regular file. New `[x]` marks are refused here because this author-side
gate cannot establish non-author authority. Promotion remains externally adjudicated.

| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted pinned values | Write scope |
|---|---|---|---|---|---|
| historical-pstack-contract | gate / tabi | `node scripts/check-round-contract.mjs`; 0 clean, 1 failed, 2 could-not-evaluate | `node scripts/check-round-contract.mjs --self-test`; isolated CLI exit/finding fixtures; `--witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` compares the pinned legacy script against the repaired script on one fixture | `scripts/check-round-contract.mjs` constants HARD_BASELINE, canonical seed digest, census digest and legacy witness blob; `corpus/evidence/pstack-20261015/baseline-census.tsv` is unchanged | Production reads committed lane files only; self-test/witness writes isolated temporary fixture trees and removes them |
| historical-user-contract | gate / tabi | `node scripts/check-user-round-contract.mjs`; 0 clean, 1 failed, 2 could-not-evaluate; inherited six-of-ten `round_count` is still failed, not a successful compatibility repair verdict | `node scripts/check-user-round-contract.mjs --self-test`; isolated CLI exit/finding fixtures | `scripts/check-user-round-contract.mjs` HARD_BASELINE/PSTACK_PIN, canonical seed and exact ROUND-script cutover constants; no runtime self-blessing | Production reads committed lane files; self-test writes isolated temporary fixtures and removes them |

**Trust boundary:** these legacy gates execute lane-authored SCORECARD counting
commands through a shell. They are not safe validators for an untrusted repository.
The existing survivor-replay, user-record-freezing and public-origin-classification
gaps are separately retained in `.ufo/waves/round-13/w1/ReviewUser.txt` and
`SafetyHistory.txt`; the bounded compatibility claim does not certify those paths.
The new source registry/claim-record gates remain distinct and retain their own
registered scopes. QUALITY16 and `corpus/lessons/round-13.md` explain this repair.

## Round 13 — locally demonstrated accessible-selector contract (2026-10-20)

The round-12 documentation-only wording remains historical. A separate, narrow
runtime qualifier is now `corpus/knowledge/aria-loopback-round-13.md` (S023–S025).
At code revision `06e6ada`, `node scripts/aria-loopback-round13.mjs` exited0:
eight declared cases ran/eight passed, four expected rejections, no missing cases.
Counting command: `node -e 'const r=require("./corpus/evidence/round-13/aria/receipt.json"); console.log(r.summary.cases,r.summary.negative)'`.
The exact observed package is Playwright1.64.0; browser is managed Chrome for
Testing156.0.8078.4, with executable/input digests checked in the retained receipt.
This is not system-Chromium152 evidence or a claim about another installed version.

| Situation | Executable rule | Evidence boundary |
|---|---|---|
| Need role/name/label selection or action-time re-resolution | Use the semantic locator, retain its expression/count and distinct replacement witness; treat ambiguity as a real strict-mode finding | These exact fixture behaviors ran; `.first()` is not the remedy |
| Need contain/equal or checked-state evidence | Run real `expect(...).toMatchAriaSnapshot(...)` inside Playwright Test; retain template, actual YAML, mode and both positive/negative controls | `ariaSnapshot()` alone is a capture, not the matcher; bare-node wrong-context exceptions cannot prove a negative |
| Runtime diagnostic differs from the expected source-reasoned spelling | Record the actual cause/tree/diff and fix only the wrongly specified signature | TypeError, parser failure or wrong runner context is not the desired ARIA rejection |
| A failed worker restarts | Merge durable per-case/worker records after runner exit and require every declared case | One surviving worker's pass is not the full experiment |

The receipt proves context closure, removed run-owned profiles/temp roots and refused
server ports, with no page request outside the fixture origin. No packet-level
no-egress, sandbox-certification, pixel/audit, real-site, cross-browser or determinism
claim is made. Publishing remains kake-owned; credentials remain
kagi-owned and forensic work remains revenger/kaidoku-owned.

Replay in an isolated checkout so the original committed evidence stays frozen.
`corpus/evidence/round-13/aria-execution-pass.json` is the exercised command receipt;
the initial failed command/receipt and the second diagnostic-format failure remain
separate durable evidence. QUALITY17 and lesson `round-13.md` explain the learned rule.

## Round 14 — historical count and cleanup metadata corrections (2026-10-20)

This section supersedes the round13 trust-boundary statement at :1680 only for
SCORECARD's historical counting path after the measured round14 cutover. Counts
are not instructions: the gates accept only their historical tree-path filtering
and fixture content-line counting forms, validate revision/path operands, and
use argv-based Git reads rather than invoking the authored shell expression.
Unsupported syntax is a failed count, never an invitation to interpret more shell language.
This is not certification that arbitrary repositories or Git environments are safe.
Survivor-replay, unfrozen user records, IPv6 origin classification and the
external-validator pin remain separate debt.

The USER compatibility witness is supported explicitly:
`node scripts/check-user-round-contract.mjs --witness 75e7836b6c3090180aee2754e20a5d3cfb186e74`.
Like ROUND's witness it runs pinned old and repaired gate bytes over one isolated
fixture. Its top-level success0 means the comparison succeeded; the old child's
history_rewritten1 and new child's clean0 are nested outcomes. Future receipts
name repaired-code revision and digest; scratch fixture IDs are not stable pins.
Round13's USER21 controls mean20 fixture cases plus1 production-alias control.
The honest production USER6/10 failure remains; expected10 is unchanged.

### Browser evidence metadata decision table

| Situation | Rule | Source / limit |
|---|---|---|
| Aggregate listeningAfter contradicts workers | Require a complete nonempty worker set; any worker listening means aggregate true, all false means false; missing proof is unknown/error | S029; `corpus/lessons/round-14.md` Mistakes; no inference from a summary alone |
| Historical receipt has a metadata defect | Retain original bytes; derive a digest-bound qualified correction from the original worker evidence and check both old failure and corrected success | `scripts/check-aria-metadata.mjs`; no new browser observation |
| observed Node differs from pin.node.recorded | Report observed version, enforced minimum and descriptive record separately; do not claim exact equality was checked | Original runtime26.12.0, descriptive24.21.0, minimumMajor20 |
| Need to replay the runtime experiment | Use an isolated checkout/output tree; original corpus/evidence/round-13/aria bytes are immutable evidence | Prior runtime capability stays round13-scoped, not refreshed by this metadata correction |

QUALITY18/19 and the round14 lesson ground these corrections. The corrected
sidecar and exact exercised checker/gate receipts live under
`corpus/evidence/round-14/`; the report and SCORECARD supply measured revisions.

### Round 14 metadata gate registry

| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted pinned values | Write scope |
|---|---|---|---|---|---|
| aria-historical-metadata | gate / tabi | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json`; 0 clean, 1 failed, 2 could-not-evaluate | `node scripts/check-aria-metadata.mjs --self-test`; isolated subprocess fixtures assert exit and stable finding; `--witness` compares the same checker on old and corrected evidence | Checker ANCHORS pin original receipt/pin/worker/spec/config/manifest/producer; `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` persists fixture digests and expected exit/finding pairs | Source reads only; self-test creates/removes own temporary fixtures; `--derive RECEIPT PIN --out PATH` writes only a fresh path under corpus/evidence/round-14/aria-metadata |

The no-argument metadata check intentionally reports the original summary
contradiction as failed; the registered current entry names the qualified
sidecar. This is not a blanket clean verdict for historical raw metadata.
The historical runner and note remain pinned unchanged, and the correction
cannot turn another failed browser run into a pass. Reproduction of that
runner belongs in an isolated checkout, with this defect qualification kept.

## Round 15 — checked metadata mirrors and diagnostic precision (2026-10-20)

**Named correction to round14's Node table and the frozen sidecar's note:**
“enforced minimum” has two enforcement layers over one recorded observation: the historical test
spec's `assertPinnedRuntime()` checks `RUNTIME.nodeMajor >= PIN.node.minimumMajor`
(`corpus/evidence/round-13/aria/aria-loopback.spec.mjs:262-269`, invoked at
`:924`), and the retrospective metadata checker re-evaluates that minimum.
The launcher's `runtime.pinned` summary and the spec's `runtimePinStatus()`
summary omit Node; the launcher still records `runtime.node`. Those pin
summaries alone cannot certify minimum enforcement.
This corrects the round14 outside review's broader non-enforcement wording,
which overlooked the spec assertion. Recorded24.21.0 remains descriptive,
observed26.12.0 is not exact equality, and no browser execution is renewed.
The old sidecar, receipt, spec and producer remain immutable evidence.

| Evidence-contract situation | Required treatment | Boundary / source |
|---|---|---|
| Cleanup or qualification contains repeated summary fields | Recompute each emitted mirror from the authenticated complete nonempty worker set; do not accept a false mirror merely because the primary correction matches | S029; QUALITY20; round15 metadata fixtures |
| A committed source/snapshot digest no longer matches | Stop comparison with `snapshot_tampered`, exit2 could-not-evaluate; semantic disagreement remains exit1 failed | Gate standard; no changed snapshot is treated as an ordinary compared verdict |
| A malicious count control returns the right broad finding for the wrong reason | Reject the control unless its expected reason also matches; marker absence and marker-not-applicable are separate states | QUALITY21; USER diagnostic fixtures |
| A source attack predates the checker it purportedly reviews | Call it source reconnaissance only; subsequent falsifiers name the delivered input revision or exact source digest | Round14 outside routed5; wave2 attacks round15 build bytes |

This round adds no browser execution or knowledge ground. Direct source-row
traceability lives in `corpus/evidence/round-15/source-index.json` (`S029`),
not an in-place modification of the pinned round13/14 artifacts. The
round15 lesson records admissions, rejections and actual exercised evidence;
author-side wave reports are not independent non-author spot-checks.

### Current round15 registry overrides

Run commands from this lane root, not the fleet root. These rows supersede
only the prior entries' changed selftest/expectation/diagnostic interfaces;
their historical execution receipts remain unchanged.

| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted pinned values | Write scope |
|---|---|---|---|---|---|
| historical-user-contract | gate / tabi | `node scripts/check-user-round-contract.mjs`; 0 clean, 1 failed, 2 could-not-evaluate; expected10 stays fixed and current production remains failed6/10 | `node scripts/check-user-round-contract.mjs --self-test`; `--diagnostic-witness` compares real pinned round14 and repaired CLI diagnostics plus an isolated masking mutant; `--count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` retains the shell-count differential | Same HARD_BASELINE/PSTACK_PIN/ROUND cutover identities; closed COUNT_REASONS and literal per-case reason/detail/marker expectations in the script | Production committed reads; selftest/witness creates/removes isolated temporary fixture repos; no external actions |
| aria-historical-metadata | gate / tabi | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json`; 0 clean, 1 semantic failed, 2 could-not-evaluate including snapshot_tampered/snapshot_unavailable | `node scripts/check-aria-metadata.mjs --self-test`; isolated CLI cases and separately reported helper checks; `--witness` retains original semantic red→corrected clean comparison | ANCHORS plus new `corpus/evidence/round-15/metadata/expected-fixtures.json` and `mirror-contract.json`; old round14 expectations/sidecar stay frozen | Reads historical sources; selftest creates/removes isolated fixtures and copied snapshot trees; derive writes only its declared evidence output scope, never overwrites a differing historical sidecar |

The metadata `--witness-mirrors` mode has a **static legacy arm**, explicitly
`legacyExecuted=false`; it is not an execution of the old checker. Round15's
stronger code-only differential is the durable
`python3 .ufo/waves/round-15/metadata-witness.py`, which actually invokes both
committed checker versions against the same isolated input variants.
That harness is a round evidence probe, not an independent truth authority.
Free-text notes and unknown top-level extensions are outside the checked
metadata contract; cleanup/qualification exact fields and types are inside.
Changing the generated Node note means `--derive` against the old differing
sidecar refuses overwrite rather than silently replacing historical bytes.
Authentication in this registry is scoped to the retained **canonical**
historical receipt/pin/snapshot paths. Noncanonical receipt/pin inputs used
for fixtures still receive semantic evaluation; their clean result is not
a certificate that those authored input bytes are the historical snapshot.
Neither the revision counter nor this round claims that broader guarantee.
The checked contract is **not every sidecar field**: descriptive `wave`,
`claim`, `execution.source`, source path/byte labels and other unchecked
known mirrors do not gain authority from a clean metadata verdict. The
round15 claim covers the complete cleanup/qualification objects and named
Node/correction bindings only. The receipt/pin/sidecar identities used in
this round's measurements are separately pinned by the committed receipts.
Historical USER selftest/witness commands require a trusted, scrubbed process
environment: unset inherited `GIT_*`, `BASH_ENV`, `NODE_OPTIONS` and template
overrides; disable system/global Git config for the isolated run. Their
legacy arm intentionally executes a pinned historical shell counter, so the
write-scope row is a fixture-run precondition, not hostile-environment safety.
Round15 command receipts record the exact minimal environment policy.

## Round 16 — measurement binding and native WebMCP observation (2026-10-20)

Appended after the round-15 section; nothing above is edited. Two new
registered interfaces; no earlier registry row changes.

### Measurement-binding gate registry (C1)

| Name | Entry | Verdict map | Pinned / checked | Write scope |
|---|---|---|---|---|
| measurement-binding | `node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce]`; `--legacy <round-15 measurements.json> [--at REV]`; `--self-test` (runs `scripts/selftest-measurement-binding.mjs`) | 0 clean, 1 findings, 2 could-not-evaluate | per claim: counter blob sha256 at `measuredRevision` and at REV, ancestry, `countedInputs` drift (`git diff --literal-pathspecs measuredRevision REV`), argv shape, and with `--reproduce` the worktree counter bytes before execution plus re-run of both the before and after arms | none (read-only; selftest writes only temp repos) |

Finding reasons: `measured_revision_not_ancestor`, `counter_digest_unrecorded`,
`counter_digest_mismatch`, `counter_changed_since_measurement`,
`counted_inputs_undeclared`, `counted_input_changed`, `argv_unsupported`,
`counter_failed`, `count_not_reproduced`; could-not-evaluate:
`manifest_unreadable`, `manifest_schema_invalid`, `revision_unresolved`,
`git_failed` (+ `usage`).

Rule (QUALITY 22): a claim's count is admissible only with a recorded counter
blob digest at its measured revision, declared counted inputs, and a
`--check --reproduce` that is clean at the delivered HEAD. On the real
round-15 file the gate reports C1 `counter_digest_unrecorded`,
`counted_inputs_undeclared`, `counter_changed_since_measurement` and C2
`counter_digest_mismatch` (its recorded digest is the post-measurement repair
blob, `9fd8bca`, not the blob at measured `b7cf044`), `counted_inputs_undeclared`
— the outside round-15 routed defects 1/2, now machine-detectable
(`corpus/evidence/round-16/binding/legacy-r15.json`).

Round-14 Node wording: cite `corpus/lessons/round-15-verifier-spotcheck.md`
§Erratum to the round-14 verifier wording (lines 90-101), the non-author
correction; this lane's round-14/15 rows at `:1744` and `:1766-1777` already
state minimum enforcement versus exact equality and are read with that erratum.

### Native WebMCP decision table (C2)

Knowledge: `corpus/knowledge/webmcp-chromium-loopback-round-16.md`; harness
`node scripts/webmcp-loopback-round16.mjs [--out PATH]` (0 pass, 1 a case
failed, 2 could not evaluate; refuses to overwrite differing receipt bytes).

| Question | Evidence | Rule |
|---|---|---|
| Is WebMCP live on this build? | receipt `flags-off-negative-control` vs `declarative-form-tool` | Only "flag-gated on Chromium 154.0.8037.97"; minimal flag `--enable-blink-features=WebMCP`. Never "available in Chrome" |
| Which object? | `model-context-location` | `document.modelContext` (spec S020 §4.1 and 154 IDL S033 agree); any `navigator.modelContext` text is wrong (S038, S039 rejected) |
| Did `WebMCP.enable` succeed, so WebMCP works? | `flags-off-negative-control`, `devtools-domain-disabled` | No: the domain answers `{}` with the page feature off and disappears only with `DevToolsWebMCPSupport` disabled |
| Is a declarative tool spec behaviour? | S030, S031 | No: Chromium-only surface; cite the receipt and S033–S035, never S020 |
| Did navigation remove tools? | `navigation-clears-tools`, S036 | No `toolsRemoved` is sent; infer removal from execution-context destruction |
| Are no tools reported, so the page has none? | `data-url-declarative`, secure-context probe | Absence counts only on a secure context with the page feature on; CDP can announce declarative tools where the page API is absent |
| May the lane invoke a page tool? | `WebMCP.invokeTool` probe | Loopback fixtures only; never on an external site without operator approval |

### Round 16 wave-2 corrections (append-only; rows above stay)

- Registry row: the drift diff is `git --literal-pathspecs diff measuredRevision REV -- <inputs>`
  (global option first). Ancestry and `counted_input_changed` are `--check`-only; `--legacy`
  reports identity and undeclared-input findings only.
- Gate hardening at `3254740`: dash-led path segments are refused, node is spawned with `--`
  before the counter path, and relative PATH entries are dropped; selftest 59 cases.
- Navigation removal: Chromium 154 sends no `WebMCP.toolsRemoved` on navigation. A raw CDP
  consumer drops a target's tools on `Runtime.executionContextsCleared` (DevTools synthesizes
  a per-frame removal from it); this rule is source-read, not measured by the receipt.
- Declarative tools cite S030/S031/S033 and the receipt, never S020.
- Confinement scope: page-level HTTP(S), beacon and page-WebSocket aborts only; WebRTC,
  WebTransport and SharedWorker traffic are not confined.

## Round 17 — lane-tip anchoring, WebMCP invocation, adjacency map (2026-10-20)

Append-only. Measured revision `93bfead1f5f25f584353df3152a60209bbd89a2e` ("M"); baseline
`5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. Sources S049–S052 (jj/git) are opened this round and
still `queued`; S055/S056 correct S049/S050.

### Lane-tip anchor rule (C1)

- The lane is jj-colocated: git `HEAD` is jj-owned, normally detached, and may name an empty or
  snapshot-only commit on no branch (fleet `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` F1–F3;
  `.ufo/waves/round-17/w1/RevJjHead.md`). Record revisions as the 40-hex of `refs/heads/master`
  (`git rev-parse --verify refs/heads/master`), never bare `HEAD`, `@{u}`, `--abbrev-ref HEAD`.
- With no explicit revision, `check-round-contract`, `check-user-round-contract`,
  `check-measurement-binding` and `check-adjacency` resolve the lane tip once: `symbolic-ref -q
  --no-recurse HEAD` (status 0 → that `refs/heads/` branch; status 1 → `refs/heads/master`; anything
  else, a symbolic anchor or a non-toplevel root → exit 2), then `rev-parse --verify
  --end-of-options <ref>^{commit}`; git runs with a constructed env (no inherited `GIT_*`, replace
  objects and grafts off, ceiling directory). Code: `scripts/check-round-contract.mjs:114`,
  `scripts/check-user-round-contract.mjs:160`, `scripts/check-measurement-binding.mjs:267`.
- The anchor is the LOCAL branch tip, not the pushed one: after a helper exit 3 the tip is
  unpushed and the gates still certify it. "Landed" means the hash the helper printed as
  `landed <hash>`. An attached non-master branch is certified as that branch (open, PLAN §C1).
- Witness receipts print `code_revision=`/`codeRevision=` as the tip; the round gate's
  `--count-witness` adds `code_committed=yes|no`; the user witnesses print
  `measuredRevision=uncommitted` when the worktree gate bytes differ from the tip's.
- `scripts/check-freshness.mjs` is byte-frozen (protectedPath in both round gates; pstack census)
  and still accepts `--witness HEAD`: always invoke it as
  `node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"`.
  This rule is not enforced by code.
- Explicit `--at REV` / `--witness REV` is the caller's revision; `check-measurement-binding`
  still accepts `--at HEAD` (it then reads HEAD) — never pass it.
- Identity chain: `scripts/check-user-round-contract.mjs` archives the round-14 round-gate identity
  `8a573b4e…` and pins current `1579a794…`; any later change to `scripts/check-round-contract.mjs`
  must land in the same commit as a rotated pair (every committed intermediate archived).
- Commit only through `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh commit … --as tabi -m
  "round-N: …" -- <paths>`; never `git add|commit|stash|checkout|reset|pull|push` or a mutating
  jj command in the lane; gates that write git run in a sandbox clone. For a status read use
  `GIT_OPTIONAL_LOCKS=0 git status --porcelain`.

### Registry — round 17 (sha256 at M)

| Entry | argv | Verdict map | sha256 |
|---|---|---|---|
| round contract | `node scripts/check-round-contract.mjs [--self-test \| --witness REV \| --count-witness REV]` | 0 clean, 1 finding, 2 could not evaluate; self-test 38 cases | `1579a794…91828` |
| user contract | `node scripts/check-user-round-contract.mjs [--self-test \| --witness REV \| --count-witness REV \| --diagnostic-witness]` | production stays 1 `round_count` 6/10 (inherited); self-test 45 cases | `568c0421…5f273` |
| measurement binding | `node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce]`; `--self-test` | 0/1/2; self-test 76 cases, 13 reasons; default `--at` = lane tip | `388c2b49…14af74` (selftest `8324692c…26b3`) |
| adjacency map | `node scripts/check-adjacency.mjs [--at REV] [--fleet <fleet root>] [--json] [--self-test]` | 0 clean, 1 findings, 2 could not evaluate; self-test 57 cases, 18 reasons | `4e2c2a64…324aac` |
| WebMCP invoke harness | `node scripts/webmcp-invoke-round17.mjs --out <path outside the lane>` | 0 pass, 1 a case failed, 2 could not evaluate (also a refused overwrite) | `de62820d…052d7` |
| round-17 counters | `node .ufo/waves/round-17/measure-c{1,2,3}.mjs REV` | one JSON line; 0 counted, 2 could not evaluate | c1 `1bb9804a…`, c2 `079dcc39…`, c3 `372c9658…` |

Binding: `node scripts/check-measurement-binding.mjs --check
corpus/evidence/round-17/measurement-binding.json --at <landed tip> --reproduce` must exit 0
`claims=3 bound=3`, run from the lane inside the fleet tree (the C3 counter reads sibling repos).
The round-16 manifest is red at round-17 tips by design (`counted_input_changed`); its receipt is
`corpus/evidence/round-17/routed/binding-hardened/check-at-1205d26.json`.

### WebMCP invocation decision rows (C2; `corpus/knowledge/webmcp-invocation-round-17.md`)

| Question | Answer on Chromium 154 loopback, flags on |
|---|---|
| Did the tool run because `invokeTool` returned an id? | No — the id precedes tool events (S041 line 68); read `toolResponded.status` |
| Where is the error message? | `exception.description`; `errorText` is empty on throw/reject |
| Does Chromium enforce `inputSchema`? | No — mismatching input ran `Completed` |
| Does navigation or unregistration cancel a pending call? | No `toolResponded` within 8 s after navigation; unregistration does not cancel (probe); only `cancelInvocation` gave `Canceled` |
| How to pair responses? | By `invocationId` through `toolInvoked`; `toolResponded` carries no tool name or session |
| May the lane invoke a page tool? | Only fixture-owned tools on loopback; never a real site's tool without operator approval |

### Adjacency map (C3)

`corpus/adjacency.tsv` dispositions sibling overlaps (10 rows): the round-16 integrator CDP
ruling (`corpus/lessons/round-16-verifier-spotcheck.md:141-142`) is the `ruled` kaidoku row;
contested scope waits on fleet `.ufo/l0-questions.md:62` (the-musketeer CDP lease, kagi/kake) and
`:65` (ruling reach to revenger and kama). A clean checker certifies citations and venues, not
bilateral agreement. `PROVINCE.md` cannot carry the ruling (census-frozen).

## Round 18 — guarded browser evidence and source re-verification (2026-10-20)

Current code/evidence checkpoint `01531daf3fa784410db454e4d606488e467a039a`, following code run
`c0aff2364b49b21c41669f050e03800138589fa7`. SOURCE corrections S058–S076 and the two new notes
are indexed in `corpus/README.md`; all source quotes/located openings are in the round18 lesson.
This is hardening of already-held Chromium154 loopback ground, not new real-site authority.

### Browser-harness decision table

| Condition | Required behavior / evidence |
|---|---|
| SIGTERM, SIGINT or SIGHUP interrupts an owned run | Exit2 `run_aborted`; no pass/fail receipt. One bounded cleanup owns pending launches, contexts and exact process identities; never kill unrelated Chromium |
| Ordinary completion or watchdog | Close owned browser tree before removing its private profile/HOME/temp tree; failure/timeout is not successful closure |
| Need a page-tool CDP session | Use `context.newCDPSession(createdFixturePage)` over Playwright's pipe; no DevTools TCP listener. The pipe is still privileged, not a scope ruling on a sibling lease |
| Recording CDPSession traffic | IDs are local correlations; errors are constructed from real `session.send` rejections, not raw wire frames or invented numeric protocol codes |
| Fixture tool attempts a blob download | `acceptDownloads:false`, record settled failure, and scan actual bounded temp scopes while browser is alive and after close; absence after cleanup alone is insufficient |
| Adding Chromium feature switches | Merge with pinned Playwright defaults; inspect effective main-process argv for one enable token, at most one disable token and preserved feature union |
| Want a current freshness witness in jj | Run `node scripts/freshness-witness.mjs`; its default resolves the branch-tip40hex once. `--rev` deliberately permits explicit full-hash ancestors of master, but refuses HEAD/short/symbolic/off-branch input |

The final observed six-hazard result is6 with original11 cases and four controls retained, plus
the refused-download case (12/12). Sources S059/S060/S061/S062/S064 and superseding S070 distinguish
vendor facts from derived harness rules. Runtime/producer identity is in the counter output.
The old round17 raw-WebSocket harness remains frozen/runnable for its different transport evidence;
the new harness does not claim the old wire-error-code facet is observable through CDPSession.

**Correction to the round17 inputSchema row at :1956 and invocation note :54/:73:** the measured
mismatch case was an **imperative** tool. Source S071 traces declarative form inputs through
FillData, which rejects unknown names and invalid supported values. This is source-level evidence,
not a new runtime validation probe or proof that every declarative custom-control type validates.

### Source and correction procedure

1. Reopen the cited source at its explicit build/revision, not “the latest” by assumption. Retain
   raw bytes compressed, body SHA/size, decoder, quote location and exact excerpt.
2. `node .ufo/waves/round-18/recheck-fetch.mjs` produces the receipt (CLI in its header); gzip
   retention is default. Create a dedicated output directory first. `--normalize-only` writes
   nothing. Treat its command string as an argv display, not a shell command.
3. `node .ufo/waves/round-18/measure-c1.mjs REV [--live]` checks the **fixed round18 cohort51**;
   it is not a reusable due-date gate. Late source rows cannot replace baseline cohort members.
   The cohort's38/12/1 URL classes distinguish living/pinned/own-work; a static paper URL can
   still classify living. Quote presence and body integrity do not establish full claim truth.
4. Correct unsupported teaches/anchors with a new SOURCES row, logging status/recheck/used-by
   transitions only if those cells actually change. S065–S076 are the round18 examples.
5. Bind code/counted inputs at the delivered checkpoint:
   `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-18/measurement-binding.json --at <40hex> --reproduce`.

**Supersedes the SKILL-only invocation guidance at :1919-1922 for routine callers:** use the
guarded wrapper. The frozen `scripts/check-freshness.mjs --witness HEAD` remains directly callable;
this round does not falsely claim global enforcement. Real-site actions, host process ownership,
and both open sibling L0 rulings remain operator-owned.

### Registry — round18

All entries owned by tabi. Exact SHA pins are in `corpus/evidence/round-18/tool-identities.json`;
counter pins/argv/input sets also live in `.ufo/waves/round-18/measurement-binding.json`.

| Name / kind | Entry command | Verdict map | Self-test / expected values | Write scope |
|---|---|---|---|---|
| freshness witness / probe | `node scripts/freshness-witness.mjs [--rev <40hex>] [--dry-run]` | 0 downstream clean/dry-run,1 downstream finding,2 could-not-evaluate/refused input | `--self-test`:8 cases; expected outcomes embedded; receipt `corpus/evidence/round-18/selftests/wrapper.json` | stdout; isolated fixture repos in self-test |
| invocation harness / probe | `node scripts/webmcp-invoke-round18.mjs --out <new external path>` | 0 pass,1 case failure,2 could-not-evaluate/abort | real12-case/four-control receipt `corpus/evidence/round-18/webmcp-invoke/receipt.json`; counter self-test supplies finite negative shapes | private temp profiles/server/process tree and selected output receipt |
| source fetch / probe | `node .ufo/waves/round-18/recheck-fetch.mjs <header argv>` | 0 quote found,1 quote absent,2 could-not-evaluate/usage | `--normalize-only` is a probe, not a self-test; C1 fixtures test acceptance | explicit receipt/excerpt/body output directory |
| C1 counter / probe | `node .ufo/waves/round-18/measure-c1.mjs REV [--live]` | 0 evaluated count,1 self-test failure,2 could-not-evaluate | `--self-test`:38; embedded cases; `corpus/evidence/round-18/selftests/c1.json` | isolated fixture repos; live mode public GETs |
| C2 counter / probe | `node .ufo/waves/round-18/measure-c2.mjs REV` | 0 evaluated count,2 could-not-evaluate; self-test verdict explicit | `--self-test`:26; embedded stub cases; `corpus/evidence/round-18/selftests/c2.json` | private clones/browser runs/temp data, never lane Git |
| C3 counter / probe | `node .ufo/waves/round-18/measure-c3.mjs REV` | 0 evaluated count,1 self-test failure,2 could-not-evaluate | `--self-test`:38; embedded cases; `corpus/evidence/round-18/selftests/c3.json` | private fixture repos only |

A zero counter exit means it evaluated, not that all hazards/repairs passed. Read the count and
per-item reasons. Finite mutants tested are recorded in the self-test receipts and wave reports;
coordinated fabrication of remote publisher history is not claimed defeated.

## Round 19 — declarative WebMCP input validation, measured (2026-10-21)

Runtime-verified on Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0, loopback fixtures,
WebMCP flags on, one fresh context per case. Harness: `node scripts/webmcp-validation-round19.mjs --out
<path outside the lane>` (exit 0 all cases pass, 1 a case failed, 2 could not evaluate); cases/fixtures/
probes and the predeclared decision manifest live in `corpus/evidence/round-19/validation/`
(`decisions.json`, receipt `receipt.json`). Knowledge: `corpus/knowledge/webmcp-declarative-validation-round-19.md`.
This supersedes the source-only qualification at `SKILL.md:1994-1997` for the rows below: the declarative
rejection paths are now runtime-observed, not only read from S071. It is not a claim about real sites,
other builds, agent-side clients or custom elements (ValidateParameterData returns true for them, S077 `form_mcp_schema.cc:289-291`).

### Declarative WebMCP input-validation decision table (round 19)

Two error classes exist. **Fill-time** (`kInvalidInputArguments`, S077): unknown key or a value the
per-type validator rejects — the whole call fails, NO control changes, no submit. **Submit-time**
(`kToolInvocationFailed`, S078 `html_form_element.cc:729-751`): values were filled, then toolautosubmit's
interactive constraint validation failed — the error reads `Form validation failed: <name>: <validationMessage>. `
and the bad values REMAIN in the form. Read `toolResponded.status` + `errorText`; never infer success from
the invocation id. Non-object input never reaches Blink (CDP `Invalid parameters`).

| Decision | Condition | Observed outcome | Cases (probe; control) | Source |
|---|---|---|---|---|
| DV-01 | An input key names no control | Error; errorText `Input contains a parameter "<key>" but there is no such parameter for the tool`; no submit; controls unchanged | `decl-unknown-param-01`; control `decl-unknown-param-04` | S077 `form_mcp_schema.cc:214-219` |
| DV-02 | A valid key is sent together with an unknown key | Whole call rejected with the unknown-parameter Error; the valid key is NOT applied (validate-all, then apply) | `decl-unknown-param-02`; control `decl-unknown-param-04` | S077 `form_mcp_schema.cc:208-241` |
| DV-03 | The key is the control's id, not its name | Rejected as unknown: parameters are keyed by the control name | `decl-unknown-param-03`; control `decl-unknown-param-04` | S077 `form_mcp_schema.cc:1238-1247` |
| DV-04 | A key targets a disabled or readonly control | Absent from inputSchema and rejected as unknown parameter; control unchanged | `decl-disabled-hidden-01`, `decl-disabled-hidden-02`; control `decl-disabled-hidden-04` | S077 `form_mcp_schema.cc:1238-1243` |
| DV-05 | A key targets an `<input type=hidden>` | Absent from inputSchema but NOT unknown: Error `Invalid value "<v>" for parameter <name>` (no validator branch for hidden) | `decl-disabled-hidden-03`; control `decl-disabled-hidden-04` | S077 `form_mcp_schema.cc:246-300` |
| DV-06 | A `required` control is omitted or sent as "" | Fill succeeds, then autosubmit's interactive validation fails: Error `Form validation failed: <name>: Please fill out this field.`; no submit | `decl-missing-required-01`, `decl-missing-required-02`; control `decl-missing-required-04` | S078 `html_form_element.cc:729-751` |
| DV-07 | A required text control receives JSON null | Fill-time Error `Invalid value for parameter required` (unquoted template): null cannot be string-coerced | `decl-missing-required-03`; control `decl-missing-required-04` | S077 `form_mcp_schema.cc:222-231` |
| DV-08 | The top-level input is not a JSON object (array, string, null) | CDP rejects the command (`Invalid parameters`): no invocationId, no toolInvoked, page untouched | `decl-non-scalar-03`, `decl-non-scalar-04`, `decl-non-scalar-05`; control `decl-non-scalar-06` | S079 `WebMCP.pdl:59-69` |
| DV-09 | A number control receives a non-numeric string or a boolean | Fill-time Error `Invalid value "<v>" for parameter n` (boolean quoted as "true"); control left empty | `decl-number-type-03`, `decl-number-type-04`; control `decl-number-type-01` | S077 `form_mcp_schema.cc:321-335` |
| DV-10 | A number control receives a numeric string or a large exponent | Accepted and submitted; the string is coerced ("42") and 1.25e21 is reserialized as `1.25000e+21` | `decl-number-type-02`, `decl-number-type-05`; control `decl-number-type-01` | S077 `form_mcp_schema.cc:49-62` |
| DV-11 | A number violates min, max or step | Filled (field keeps the bad value), then Error `Form validation failed: amount: Value must be …` / `Please enter a valid value. The two nearest valid values are 2 and 5.`; no submit | `decl-number-range-01`, `decl-number-range-02`, `decl-number-range-03`; control `decl-number-range-04` | S078 `html_form_element.cc:729-751` |
| DV-12 | A single select receives a visible label or an absent value | Fill-time Error `Invalid value "<v>" for parameter choice`; only option `value` strings match; selection unchanged | `decl-select-enum-02`, `decl-select-enum-03`; control `decl-select-enum-01` | S077 `form_mcp_schema.cc:390-409` |
| DV-13 | A single select receives the value of a `disabled` option | Accepted, selected and submitted: option disabled state is not filtered (contrast DV-17) | `decl-select-enum-04`; control `decl-select-enum-01` | S077 `form_mcp_schema.cc:397-400` |
| DV-14 | A multiple select receives an array with a non-option member, or a bare string | Error (`Invalid value for parameter colors` / `Invalid value "red" for parameter colors`); no selection change | `decl-select-multiple-02`, `decl-select-multiple-03`; control `decl-select-multiple-01` | S077 `form_mcp_schema.cc:403-425` |
| DV-15 | A single checkbox receives a string (including "on" or its value attribute) | Error `Invalid value "<v>" for parameter <name>`; single checkboxes take booleans only | `decl-checkbox-03`, `decl-checkbox-04`, `decl-checkbox-05`; control `decl-checkbox-01` | S077 `form_mcp_schema.cc:337-343` |
| DV-16 | A radio group receives a value matching no radio | Error `Invalid value "not-an-option" for parameter choice`; nothing checked | `decl-radio-02`; control `decl-radio-01` | S077 `form_mcp_schema.cc:374-388` |
| DV-17 | A radio group receives the value of a `disabled` radio | Rejected like an unknown value: disabled radios are dropped from the control set (contrast DV-13) | `decl-radio-03`; control `decl-radio-01` | S077 `form_mcp_schema.cc:1238-1243` |
| DV-18 | A text value violates `pattern` | Filled, then Error `Form validation failed: q: Please match the requested format.`; no submit | `decl-text-constraints-01`; control `decl-text-constraints-04` | S078 `html_form_element.cc:729-751` |
| DV-19 | A text value violates `minlength`/`maxlength` (len 2 < 3; len 6 > 5) | NOT enforced: Completed and submitted unchanged — too-short/too-long apply only to user edits, not script/agent fills | `decl-text-constraints-02`, `decl-text-constraints-03`; control `decl-text-constraints-04` | S083 `form-control-infrastructure.html:323-327` |
| DV-20 | An email or url control receives a malformed string | Filled, then Error `Form validation failed: email: Please include an '@' …` / `url: Please enter a URL.`; schema has no `format` | `decl-email-url-01`, `decl-email-url-03`; control `decl-email-url-02` | S078 `html_form_element.cc:729-751` |
| DV-21 | A date, time or datetime-local control receives a non-ISO string | Fill-time Error `Invalid value "<v>" for parameter <name>`; nothing filled (sanitizer yields empty) | `decl-date-time-02`, `decl-date-time-03`, `decl-date-time-04`; control `decl-date-time-01` | S077 `form_mcp_schema.cc:302-318` |
| DV-22 | A date/time value lies outside min/max | Filled, then Error `Form validation failed: date: Value must be 12/31/2026 or earlier.` (locale-formatted); no submit | `decl-date-time-05`; control `decl-date-time-01` | S078 `html_form_element.cc:729-751` |
| DV-23 | A range control receives an out-of-range or non-numeric value | Completed and submitted after sanitization: 99 → `10` (max); "not-a-number" → `6` (midpoint 5 snapped to step 2) | `decl-range-color-01`, `decl-range-color-02`; control `decl-range-color-03` | S082 `input.html:3391-3412` |
| DV-24 | A color control receives a CSS name or an unparseable string | Completed: "red" → `#ff0000`; unparseable → `#000000` (opaque black) | `decl-range-color-03`, `decl-range-color-04`, `decl-range-color-05`; control `decl-range-color-01` | S082 `input.html:3667-3678` |
| DV-25 | A value contains CR/LF | textarea normalizes CRLF to LF; a single-line text input strips CR and LF | `decl-textarea-empty-01`; control `decl-textarea-empty-04` | S082 `input.html:1762-1763` |
| DV-26 | A key is omitted | The control keeps its default/pre-filled value (omission is not clearing) | `decl-textarea-empty-03`; control `decl-textarea-empty-04` | S077 `form_mcp_schema.cc:233-241` |
| DV-27 | A key is sent as the empty string | The control is cleared (empty strings pass text validation) | `decl-textarea-empty-02`; control `decl-textarea-empty-04` | S077 `form_mcp_schema.cc:311-313` |

Agent rules derived from the table: send keys by control `name`; send checkboxes as booleans, numbers as JSON
numbers, selects/radios by option `value` (never label); expect disabled/readonly/hidden controls to be
unsettable; do not rely on minlength/maxlength or on select-option `disabled` to constrain an agent; treat a
`Form validation failed` error as "form now holds the rejected values"; treat omission as "leave as is" and
`""` as "clear". Measured counts: 66 cases, 27 decisions — `node .ufo/waves/round-19/measure-c1.mjs <rev>`.

### Registry — round 19

| Name / kind | Entry command (lane root) | Verdict map | Self-test | Pinned values | Write scope / owner |
|---|---|---|---|---|---|
| validation counter / gate | `node .ufo/waves/round-19/measure-c1.mjs REV` | 0 clean/evaluated, 1 failed, 2 could-not-evaluate | same command `--self-test` (fixture mode; receipt `corpus/evidence/round-19/selftests/c1.json`) | `corpus/evidence/round-19/validation/decisions.json`, case/fixture/receipt/body digests | temporary sandbox + stdout only; tabi |
| download binding counter / gate | `node .ufo/waves/round-19/measure-c2.mjs REV` | 0 evaluated, 1 failed, 2 could-not-evaluate | same `--self-test`; receipt `corpus/evidence/round-19/selftests/c2.json` | counter-owned nonce/artifact mutants; `c2-mutants/` under round19 waves | temporary owned browsers/profiles/server + stdout; tabi |
| routed correction counter / gate | `node .ufo/waves/round-19/measure-c3.mjs REV` | 0 all four closed, 1 a closure failed, 2 could-not-evaluate | same `--self-test`; receipt `corpus/evidence/round-19/selftests/c3.json` | B harnesses + QUALITY33–39 + registry specs + isolation ledger | read-only Git + temp isolation checker; tabi |
| writer isolation / gate | `node .ufo/waves/round-19/isolation/check-isolation.mjs` | 0 clean, 1 failed, 2 could-not-evaluate | same `--self-test`; receipt `corpus/evidence/round-19/selftests/isolation.json` | `isolation/ledger.json`, clones/commits/base B | read-only clone Git, temp fixture repos in self-test; tabi |
| validation harness / probe | `node scripts/webmcp-validation-round19.mjs --out NEW_EXTERNAL_PATH` | 0 all cases match, 1 failed, 2 could-not-evaluate/refused | `--cases corpus/evidence/round-19/validation/selftest/cases --fixtures corpus/evidence/round-19/validation/selftest/fixtures --out NEW_EXTERNAL_PATH`; wrong-expectation control `selftest-wrong/` | cases/fixtures, runtime pin154/1.64/24.21, recorded producer digest | own temp browser/server + selected new external receipt; tabi |
| download-bound invoke harness / probe | `node scripts/webmcp-invoke-round19.mjs --out NEW_EXTERNAL_PATH` | 0 pass, 1 failed, 2 could-not-evaluate/abort | counter C2 supplies finite mutants; no standalone self-invocation claimed | 12 case ids/four controls + nonce/artifact-root expectations | own temp browser/server + selected receipt; tabi |

### Round-19 wave-2 corrections — current guidance supersedes the rows named below

The 15 families were fixed before probing; the 27 candidate decisions were selected from observed probes
and declared before counting, not before probing. The candidate population is not its measured admission
count: use the committed final measurement/binding receipts, not the premature count at :2092.

- **DV-05 / :2064 and the hidden-control rule at :2089-2090:** the tested hidden input lacks a nonempty
  `toolparamdescription`; only that shape is absent from the schema and rejected. Described hidden inputs
  enter S077's text-control branch (`form_mcp_schema.cc:1270-1281`), so hidden inputs are not generally
  unsettable. Disabled/readonly controls remain a distinct excluded-control case.
- **DV-13 / :2072:** the disabled option is accepted and selected, and one submit event completes, but
  the fixture's FormData output omits it (`fields: {}`). Selection is not successful-control serialization.
- **DV-15 / :2074 and the note's booleans-only rule:** only `"on"`, `"checkbox-choice"` and `"unrelated"`
  were the rejected string probes. S077 `:71-88,337-342` also accepts integers and case-insensitive
  true/false/1/0 string coercions. JSON booleans are the schema-shaped recommendation, not the complete
  accepted domain. Wave-2 RuntimeCheckbox retained additional `"true"`/`"false"` Completed observations.
- **DV-19 / :2078:** the length result concerns the tested agent/script fills, with source anchors
  S083 `:323-327` for tooLong and `:368-372` for tooShort. It does not establish every input edit path.
- **DV-25 / :2084:** S082 `:1762-1763` anchors single-line input newline stripping; textarea CRLF
  normalization is the observed fixture result, not a proposition proved by that input-element anchor.
- Email/URL native type constraints are enforced at autosubmit for the malformed tested values even
  though their generated schemas have no `format`. Missing `format` is not absence of validation.

#### Registry correction — supersedes :2098-2102 exit, kind, invocation and write-scope cells

C1/C2/C3 are **measurement probes**, not all-or-nothing admission gates: exit 0 means evaluated count.
Read each count and per-item reasons; C3 now refuses reconstructed wave-return snapshots with a false d4,
not a fabricated observation. Normal evaluation/usage errors exit 2. Self-test failures: C1/C3 exit 1,
C2 exits 2. Isolation's 0/1/2 gate map is unchanged, but its clean result checks the ledger/clone data,
not whether a reconstructed status string was observed at wave return.

All four self-tests additionally create/replace `corpus/evidence/round-19/selftests/{c1,c2,c3,isolation}.json`
in the executing repository; run them in a private clone. Normal counter modes use read-only Git and owned
temporary data; C2 additionally owns browser/server processes. No self-test is a read-only lane command.
The validation harness supports only `--cases` and `--out` (plus `--help`), **not `--fixtures`**: fixtures are
the sibling `fixtures/` directory of the selected `cases/` directory. Its smoke command is
`node scripts/webmcp-validation-round19.mjs --cases corpus/evidence/round-19/validation/selftest/cases --out NEW_EXTERNAL_PATH`;
use `selftest-wrong/cases` for the failure control. Case/fixture files must be regular, not symlinks.
Finite counter mutants do not establish resistance to coordinated counter-aware fabrication or all
transient artifact create/delete races. Evidence/reasons: `.ufo/waves/round-19/w2/ScribeCoherence.md`.

### Declarative WebMCP input-validation decision table — corrected (round 19)

This supersedes the earlier round-19 table, row for row. Every runtime answer is limited to the named
fixture and exact probe inputs, fresh initial state and its prevented autosubmit listener. “Submitted”
means the fixture submit event, not a network submission. Source anchors explain the stated branch;
locale messages, DOM values and concrete outputs are additionally backed by the runtime receipt.

| Decision | Condition | Observed outcome | Cases (probe; control) | Source |
|---|---|---|---|---|
| DV-01 | In the pinned unknown-param fixture, precisely decl-unknown-param-01 test: An input key names no control; no other input shape is asserted. | Error; errorText `Input contains a parameter "<key>" but there is no such parameter for the tool`; no submit; controls unchanged | `decl-unknown-param-01`; control `decl-unknown-param-04` | S077 `form_mcp_schema.cc:214-219` |
| DV-02 | In the pinned unknown-param fixture, precisely decl-unknown-param-02 test: A valid key is sent together with an unknown key; no other input shape is asserted. | Fill-time unknown-parameter Error for the tested valid value plus unknown key; no supplied value applied. Validation returns on the first fill error, before the apply loop. | `decl-unknown-param-02`; control `decl-unknown-param-04` | S077 `form_mcp_schema.cc:208-241` |
| DV-03 | In the pinned unknown-param fixture, precisely decl-unknown-param-03 test: The key is the control's id, not its name; no other input shape is asserted. | queryId is rejected while the named query control succeeds in this fixture; custom toolparamname and custom-element naming are not covered. | `decl-unknown-param-03`; control `decl-unknown-param-04` | S077 `form_mcp_schema.cc:1238-1247` |
| DV-04 | In the pinned disabled-hidden fixture, precisely decl-disabled-hidden-01, decl-disabled-hidden-02 test: A key targets a disabled or readonly control; no other input shape is asserted. | Absent from inputSchema and rejected as unknown parameter; control unchanged | `decl-disabled-hidden-01`, `decl-disabled-hidden-02`; control `decl-disabled-hidden-04` | S077 `form_mcp_schema.cc:1238-1243` |
| DV-05 | In the pinned disabled-hidden fixture, precisely decl-disabled-hidden-03 test: A key targets the tested hidden input without a nonempty toolparamdescription; no other input shape is asserted. | Absent from inputSchema but rejected as Invalid value, not unknown; described hidden inputs use a different text-control source branch and are outside this case | `decl-disabled-hidden-03`; control `decl-disabled-hidden-04` | S077 `form_mcp_schema.cc:246-300` |
| DV-06 | In the pinned missing-required fixture, precisely decl-missing-required-01, decl-missing-required-02 test: A `required` control is omitted or sent as ""; no other input shape is asserted. | For the initially empty required text input, both omission and empty string produce submit-time Error including Please fill out this field; no submit event. | `decl-missing-required-01`, `decl-missing-required-02`; control `decl-missing-required-04` | S096 `html_form_element.cc:729-758` |
| DV-07 | In the pinned missing-required fixture, precisely decl-missing-required-03 test: A required text control receives JSON null; no other input shape is asserted. | Fill-time Error: Blink JSONValue-to-text conversion rejects null; the observed error is Invalid value for parameter required. The required attribute is not the rejection cause. | `decl-missing-required-03`; control `decl-missing-required-04` | S077 `form_mcp_schema.cc:49-328` |
| DV-08 | In the pinned non-scalar fixture, precisely decl-non-scalar-03, decl-non-scalar-04, decl-non-scalar-05 test: The top-level input is not a JSON object (array, string, null); no other input shape is asserted. | CDP rejects the command (`Invalid parameters`): no invocationId, no toolInvoked, page untouched | `decl-non-scalar-03`, `decl-non-scalar-04`, `decl-non-scalar-05`; control `decl-non-scalar-06` | S079 `WebMCP.pdl:59-69` |
| DV-09 | In the pinned number-type fixture, precisely decl-number-type-03, decl-number-type-04 test: A number control receives a non-numeric string or a boolean; no other input shape is asserted. | Fill-time Error `Invalid value "<v>" for parameter n` (boolean quoted as "true"); control left empty | `decl-number-type-03`, `decl-number-type-04`; control `decl-number-type-01` | S077 `form_mcp_schema.cc:321-335` |
| DV-10 | In the pinned number-type fixture, precisely decl-number-type-02, decl-number-type-05 test: A number control receives a numeric string or a large exponent; no other input shape is asserted. | Both tested inputs Completed with one prevented submit event: JSON string "42" fills as "42"; JSON number 1.25e21 fills as "1.25000e+21". Other numeric strings/exponents and constraints are not covered. | `decl-number-type-02`, `decl-number-type-05`; control `decl-number-type-01` | S077 `form_mcp_schema.cc:49-62` |
| DV-11 | In the pinned number-range fixture, precisely decl-number-range-01, decl-number-range-02, decl-number-range-03 test: A number violates min, max or step; no other input shape is asserted. | Filled (field keeps the bad value), then Error `Form validation failed: amount: Value must be …` / `Please enter a valid value. The two nearest valid values are 2 and 5.`; no submit | `decl-number-range-01`, `decl-number-range-02`, `decl-number-range-03`; control `decl-number-range-04` | S096 `html_form_element.cc:729-758` |
| DV-12 | In the pinned select-enum fixture, precisely decl-select-enum-02, decl-select-enum-03 test: A single select receives a visible label or an absent value; no other input shape is asserted. | The tested differing label and absent option-value strings are rejected with Invalid value; the option-value control succeeds. Other types or labels equal to values are not covered. | `decl-select-enum-02`, `decl-select-enum-03`; control `decl-select-enum-01` | S077 `form_mcp_schema.cc:390-409` |
| DV-13 | In the pinned select-enum fixture, precisely decl-select-enum-04 test: A single select receives the value of a `disabled` option; no other input shape is asserted. | Accepted and selected; one submit event completes, but the disabled option is omitted from FormData output (fields: {}) | `decl-select-enum-04`; control `decl-select-enum-01` | S077 `form_mcp_schema.cc:397-400` |
| DV-14 | In the pinned select-multiple fixture, precisely decl-select-multiple-02, decl-select-multiple-03 test: A multiple select receives an array with a non-option member, or a bare string; no other input shape is asserted. | The array ["red","invalid"] and scalar "red" produce the two recorded Invalid value errors with colors still []; source-derived coercion and duplicate-item rules are not newly runtime-tested. | `decl-select-multiple-02`, `decl-select-multiple-03`; control `decl-select-multiple-01` | S077 `form_mcp_schema.cc:403-425` |
| DV-15 | In the pinned checkbox fixture, precisely decl-checkbox-03, decl-checkbox-04, decl-checkbox-05 test: A single checkbox receives the tested strings on, checkbox-choice, or unrelated; no other input shape is asserted. | These strings produce Invalid value errors; source ToBoolean also accepts true/false strings and integer coercions, so rejection of every string is not claimed | `decl-checkbox-03`, `decl-checkbox-04`, `decl-checkbox-05`; control `decl-checkbox-01` | S077 `form_mcp_schema.cc:337-343` |
| DV-16 | In the pinned radio fixture, precisely decl-radio-02 test: A radio group receives a value matching no radio; no other input shape is asserted. | Error `Invalid value "not-an-option" for parameter choice`; nothing checked | `decl-radio-02`; control `decl-radio-01` | S077 `form_mcp_schema.cc:374-388` |
| DV-17 | In the pinned radio fixture, precisely decl-radio-03 test: A radio group receives the value of a `disabled` radio; no other input shape is asserted. | The disabled gamma value, with no enabled radio sharing it, produces the recorded Invalid value error; enabled duplicate values and all-disabled groups are not covered. | `decl-radio-03`; control `decl-radio-01` | S077 `form_mcp_schema.cc:1238-1243` |
| DV-18 | In the pinned text-constraints fixture, precisely decl-text-constraints-01 test: A text value violates `pattern`; no other input shape is asserted. | Filled, then Error `Form validation failed: q: Please match the requested format.`; no submit | `decl-text-constraints-01`; control `decl-text-constraints-04` | S096 `html_form_element.cc:729-758` |
| DV-19 | In the pinned text-constraints fixture, precisely decl-text-constraints-02, decl-text-constraints-03 test: A text value violates `minlength`/`maxlength` (len 2 < 3; len 6 > 5); no other input shape is asserted. | NOT enforced: Completed and submitted unchanged — too-short/too-long apply only to user edits, not script/agent fills | `decl-text-constraints-02`, `decl-text-constraints-03`; control `decl-text-constraints-04` | S083 `form-control-infrastructure.html:323-372` |
| DV-20 | In the pinned email-url fixture, precisely decl-email-url-01, decl-email-url-03 test: An email or url control receives a malformed string; no other input shape is asserted. | Filled, then Error `Form validation failed: email: Please include an '@' …` / `url: Please enter a URL.`; schema has no `format` | `decl-email-url-01`, `decl-email-url-03`; control `decl-email-url-02` | S096 `html_form_element.cc:729-758` |
| DV-21 | In the pinned date-time fixture, precisely decl-date-time-02, decl-date-time-03, decl-date-time-04 test: A date, time or datetime-local control receives a non-ISO string; no other input shape is asserted. | The three tested malformed nonempty strings produce fill-time Invalid value errors with controls unchanged; empty strings and every non-ISO spelling are not covered. | `decl-date-time-02`, `decl-date-time-03`, `decl-date-time-04`; control `decl-date-time-01` | S077 `form_mcp_schema.cc:302-318` |
| DV-22 | In the pinned date-time fixture, precisely decl-date-time-05 test: A date/time value lies outside min/max; no other input shape is asserted. | The combined out-of-bounds ISO values fill all four bounded controls and return four native validation messages, Error and no submit event; this is not an isolated single-control test. | `decl-date-time-05`; control `decl-date-time-01` | S096 `html_form_element.cc:729-758` |
| DV-23 | In the pinned range-color fixture, precisely decl-range-color-01, decl-range-color-02 test: A range control receives an out-of-range or non-numeric value; no other input shape is asserted. | Completed and submitted after sanitization: 99 → `10` (max); "not-a-number" → `6` (midpoint 5 snapped to step 2) | `decl-range-color-01`, `decl-range-color-02`; control `decl-range-color-03` | S095 `input.html:3391-3420` |
| DV-24 | In the pinned range-color fixture, precisely decl-range-color-03, decl-range-color-04, decl-range-color-05 test: A color control receives a CSS name or an unparseable string; no other input shape is asserted. | Completed: "red" → `#ff0000`; unparseable → `#000000` (opaque black) | `decl-range-color-03`, `decl-range-color-04`, `decl-range-color-05`; control `decl-range-color-01` | S095 `input.html:3662-3705` |
| DV-25 | In the pinned textarea-empty fixture, precisely decl-textarea-empty-01 test: A value contains CR/LF; no other input shape is asserted. | The tested single-line text input strips CR and LF; textarea CRLF normalization in the same receipt is separately retained own-runtime evidence, not attributed to input.html. | `decl-textarea-empty-01`; control `decl-textarea-empty-04` | S095 `input.html:1762-1763` |
| DV-26 | In the pinned textarea-empty fixture, precisely decl-textarea-empty-03 test: A key is omitted; no other input shape is asserted. | For the tested empty input object, the two optional text/textarea fields keep their prefilled values through one prevented submit event; no implicit reset or arbitrary handler behavior is asserted. | `decl-textarea-empty-03`; control `decl-textarea-empty-04` | S077 `form_mcp_schema.cc:233-241` |
| DV-27 | In the pinned textarea-empty fixture, precisely decl-textarea-empty-02 test: A key is sent as the empty string; no other input shape is asserted. | The tested optional text/textarea fields clear on empty strings and complete; required fields and other control types are not covered. | `decl-textarea-empty-02`; control `decl-textarea-empty-04` | S077 `form_mcp_schema.cc:311-313` |

#### Execution prerequisites and bounded evidence

Run the validation producer only with trusted input trees and receipt-output ancestors that remain
immutable for the entire run. Static symlink/containment checks do not protect against a same-uid actor
replacing ancestors concurrently. New receipts record this prerequisite, per-context effective argv,
feature/resolver decisions, executable-object identity, page-request/WebSocket guard installation, artifact
snapshots before/after context close, and cleanup. These are page-transport controls, not OS-level egress
confinement; all-page download listening and every transient create/delete race remain untested.

The invoke successor's any-new-file predicate applies to explicit run download directories and private
Playwright artifact roots; ordinary profile state is separately inventoried/marker-scanned, not filename
allowlisted. The C2 counter correlates raw command/reply/events with current page/fixture evidence inside
the receipt, defeating the demonstrated nonce-aware no-invoke specimen with untouched raw frames.
All fields remain producer-authored: coordinated falsification of the raw evidence is outside the finite
claim. Full verification receipts and the original claim's unresolved d4/no-harm limits are in SCORECARD.

## Round 20 — source-scoped completion troubleshooting

This deepens the existing declarative WebMCP ground; it acquires no runtime capability.
The selection is a finite sample fixed before drafting, not a coverage denominator or
twelve novel independent branches. Earlier source dossiers held several facts; the new
artifact makes their conditions and limits available in the playbook. Historical r17
autosubmit success/navigation and r19 validation receipts remain their own evidence.

### Declarative WebMCP completion lifecycle — source-scoped (round 20)

Source-only Chromium 154.0.8037.97, assuming this internal declarative-tool path is reached;
not a claim that a browser exposes or executes it. S096 and S100 reuse one retained source
body. Method, history and raw/decoded provenance: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
The counter measures the note's mechanically valid documented rows, not semantic truth,
runtime coverage, branch novelty or this domain's whole-axis score.

| ID | condition | outcome | Source anchor |
|---|---|---|---|
| LC01 | At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. | require_submit_button is true; the autosubmit use counter is incremented only when the attribute is present at entry. | S096:181-186 |
| LC02 | FillFormControls returns a ScriptToolError. | done_callback is run with the error immediately; the running state (is_currently_running_, active submit button, done_callback_) is not set by that call. invocation_id_ is written earlier, at line 178, outside this span. | S096:189-210 |
| LC03 | The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. | FillFormControls returns kMissingRequiredSubmitButton before the FillData call on the same path is reached. | S096:249-258 |
| LC04 | FillFormControls returned no error and the entry-time require_submit_button is true. | submit_button->Focus() and context->PauseExecution() are called; this branch does not run the done callback. The pending outcome is not established here: focus handlers and PauseExecution effects are outside the excerpt. | S096:212-218 |
| LC05 | FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). | form_->PrepareForSubmission(/*event*/ nullptr, submit_button) is called immediately; this callsite alone establishes no submit event, navigation, or completion. | S096:218-221 |
| LC06 | CancelTool is called (it CHECKs is_currently_running_). | CallDoneCallback runs with kToolCancelled and the message Tool execution cancelled by abort signal. | S096:224-229 |
| LC07 | CallDoneCallback is called. | If done_callback_ is null it returns with no state change. If non-null, the callback is invoked (line 266) before the state reset at lines 267-270, which sets is_currently_running_ to false, clears active_submit_button_ and invocation_id_, and is followed by PseudoStateChanged notifications (lines 271-274). At the callback, the reset has not run, so those fields hold pre-completion values unless the callback changes them; the excerpt does not show what the callback does. | S096:261-275 |
| LC08 | HandleWebMcpToolResponse receives a settlement for a tool that is not CurrentlyRunning. | The settlement is ignored: the function returns without calling the done callback. | S096:290-298 |
| LC09 | The tool is still CurrentlyRunning, the respondWith promise resolves with an object, and v8::JSON::Stringify(...).ToLocal(...) returns false. | CallDoneCallback is called with kToolInvocationFailed and the fixed serialization message; this arm returns before the fallback and success callback. It does not classify every non-serializable JavaScript value. | S096:298-319 |
| LC10 | The tool is still CurrentlyRunning and the respondWith promise rejects. | The rejection value is reported through V8ScriptRunner::ReportException, then CallDoneCallback runs with kToolInvocationFailed and the text respondWith promise was rejected. | S096:320-327 |
| LC11 | The tool is still running after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise. | CallDoneCallback runs with kToolInvocationFailed and the programming-error message; no output value is set on that path. | S100:787-815 |
| LC12 | PrepareForSubmission reaches the should_submit branch and executing_tool remains CurrentlyRunning after ScheduleFormSubmission returns. | CallDoneCallback runs with base::ok of a null String, which the source comment describes as a navigation-intent sentinel: internal, and not proof of navigation, success, or any CDP output value. The ok call follows the ScheduleFormSubmission call in the same block and is guarded only by executing_tool remaining CurrentlyRunning; it is not conditioned on navigation being scheduled. The body of ScheduleFormSubmission is outside the retained anchor. | S096:818-830 |

**Use the table without converting calls into outcomes.** Pin the source bytes before
reusing these branches; separate fill-time refusal from running-state entry (LC02–03);
do not interpret focus/pause or PrepareForSubmission as completion (LC04–05); preserve
callback-before-reset ordering and the not-running guard (LC07–10); and distinguish
the internal null-String sentinel from any observed navigation or output (LC12).
The bridge to the r17 landing-document JSON-LD result is outside this source sample,
not a new runtime contradiction established by this round. Reset/removal/re-registration,
other builds and unobserved runtime paths remain outside the sample.

### Registry — round 20

| Name / kind | Entry command (lane root) | Verdict map | Self-test | Pinned values | Write scope / owner |
|---|---|---|---|---|---|
| lifecycle documented-row counter / probe | `node .ufo/waves/round-20/measure-c1.mjs REV` | 0 evaluated count (baseline absent=0); 1 failed validation; 2 could-not-evaluate | `node .ufo/waves/round-20/measure-c1.mjs --selftest` | `corpus/evidence/round-20/selftests/expected.json`; retained source; S096/S100; `.ufo/waves/round-20/measurement-binding.json` | git blobs/stdout only; selftest in-memory fixtures; tabi |
| wave-1 provenance metadata / gate | `node .ufo/waves/round-20/check-wave.mjs --spec .ufo/waves/round-20/w1/spec.json --registry .ufo/waves/round-20/w1/swarm-registry.json --snapshot .ufo/waves/round-20/w1/return.json` | 0 clean; 1 failed; 2 could-not-evaluate | `node .ufo/waves/round-20/check-wave.mjs --selftest` | `corpus/evidence/round-20/wave-check-expected.json`; w1 spec, registry, direct snapshot | read-only metadata; selftest isolated temp fixtures; tabi |
| curation census / probe | `node .ufo/waves/round-20/counts.mjs REV` | 0 counted JSON; 2 could-not-evaluate | none claimed | counted committed SOURCES table and knowledge paths | read-only git/stdout; tabi |
| lesson-history enumeration / probe | `node .ufo/waves/round-20/lesson-history.mjs REV` | 0 enumerated JSON; 2 could-not-evaluate | none claimed | frozen USER lessonDrift predicate at baseline; not complete USER gate | read-only git/stdout; tabi |

The wave gate refuses only its finite metadata shapes. It does not authenticate who
captured a snapshot, establish capture order, certify writer isolation, or prove no harm.
The lesson probe enumerates the lesson predicate without rerunning the inherited red gate.
No new capability row, promotion, retirement, real-site authority or sibling lease is earned.

## Round-20 falsification correction — canonical source guidance

This append supersedes the initial round-20 lifecycle table and its diagnostic/history
wording, including the old note table at lines 29–40 and SKILL table at lines 2217–2228.
Those bytes remain history. The corrected table below is the current guidance and the
counter selects it, not the historical rows. It is still one finite sample, not an
exhaustive inventory, twelve novel branches, a scalar promotion or a runtime capability.

**Evidence class:** source-only Chromium 154.0.8037.97; no new runtime observation in
round 20. Earlier runtime observations are explicitly retained below. A source callsite
is not proof of its end-to-end effect. `CallDoneCallback(...)` denotes a method call;
actual stored-callback delivery and cleanup depend on LC07. These descriptions assume
the named internal branch is reached and its stated CHECKs hold, not that WebMCP is
available in any particular profile or shipping configuration. The source's callees
and page handlers are not silently treated as effect-free.

### Declarative WebMCP completion lifecycle — corrected source-scoped (round 20)

| ID | condition | outcome | Source anchor |
|---|---|---|---|
| LC01 | At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. | The local require_submit_button is true. The autosubmit UseCounter::Count call is in the opposite, false branch; this is a callsite statement, not a per-call telemetry increment claim. | S096:181-186 |
| LC02 | The FillFormControls error result is present after the enclosing CEReactionsScope has closed. | Contains a call to the incoming done_callback with the error, then returns before the assignments at lines 204-210. invocation_id_ was written at line 178 and is not reset on this return path. | S096:189-210 |
| LC03 | The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. | FillFormControls returns kMissingRequiredSubmitButton before the FillData call on the same path is reached. | S096:249-258 |
| LC04 | FillFormControls returned no error and the entry-time require_submit_button is true. | Contains calls to submit_button->Focus() and context->PauseExecution(), but no direct CallDoneCallback call in this branch. Effects inside those callees are not established by this span. | S096:212-218 |
| LC05 | FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). | Contains a direct PrepareForSubmission(nullptr, submit_button) call instead of the focus/pause arm. The callee has submit/response paths and early returns; this call alone guarantees neither completion nor its absence. | S096:218-221 |
| LC06 | CancelTool is entered and its is_currently_running_ CHECK passes. | Calls the CallDoneCallback method with kToolCancelled and literal message Tool execution cancelled by abort signal. Stored-callback delivery and cleanup are conditional as in LC07; the literal does not establish the cancellation trigger. | S096:224-229 |
| LC07 | CallDoneCallback is entered; its done_callback_.is_null() test selects the early-return or held-callback arm. | Null returns before cleanup. Otherwise the code invokes Run(result) before clearing running/button/invocation fields; after Run returns it notifies the form pseudo-state, and the old button pseudo-state only if that old button was non-null. The callback body is outside this span. | S096:261-275 |
| LC08 | HandleWebMcpToolResponse enters with tool->CurrentlyRunning() false. | Returns before resolve/reject handling, without a CallDoneCallback or ReportException call from this function on that arm. | S096:290-298 |
| LC09 | HandleWebMcpToolResponse passed the CurrentlyRunning guard at handler entry, reaches the resolved object arm, and JSON::Stringify(...).ToLocal(...) returns false. | Contains a CallDoneCallback call with kToolInvocationFailed and fixed serialization text, then a return before fallback/success. Stored-callback delivery is conditional as in LC07; no claim is made about which JavaScript objects can reach this arm. | S096:298-319 |
| LC10 | HandleWebMcpToolResponse passed its CurrentlyRunning guard at handler entry and reaches the resolved=false arm. | Contains a ReportException(value) call followed by a CallDoneCallback call with kToolInvocationFailed and fixed text respondWith promise was rejected. The text is not the rejection value; delivery is conditional as in LC07. | S096:320-327 |
| LC11 | PrepareForSubmission reaches its post-dispatch declarative block with executing_tool still running, no promise taken, and should_submit=false. | Contains a CallDoneCallback call with kToolInvocationFailed and fixed site-programming-error text. Whether the stored callback runs follows LC07; this row makes no CDP field or status claim. | S100:787-815 |
| LC12 | The should_submit block is reached; after ScheduleFormSubmission returns executing_tool is non-null and CurrentlyRunning, and the WebMCPEnabled CHECK passes. | Contains CallDoneCallback(base::ok(String())) at line 829. The comment describes the null String as indicating a navigation trigger, but the call is not gated on a scheduling return value. Delivery follows LC07; this row establishes no navigation, success, or CDP output guarantee. | S096:818-830 |

### Source-only diagnostic checklist — not a failure taxonomy

1. LC02: distinguish the incoming callback callsite from a function/API return value;
   its own assignments at 204–210 are skipped, but the earlier invocation-id write is not reset.
2. LC03: `SubmitButton()==null` is the schema accessor result, not proof that the DOM
   contains no visual submit button. Its selection implementation is not claimed here.
3. LC04: focus/pause callsites do not guarantee either completion or non-completion;
   effects inside their callees require separate evidence.
4. LC05: `PrepareForSubmission` may dispatch, complete or return early. The callsite
   does not establish a universal outcome or the absence of a submit event.
5. LC06: the running CHECK must pass. The abort-signal words are a fixed literal,
   not evidence of the cause, a delivered CDP field or a user-visible cancellation event.
6. LC07: the null guard is distinct from LC08's not-running guard. Run precedes cleanup;
   form pseudo-state notification is unconditional after cleanup, old-button notification is conditional.
7. LC09–LC10: distinguish handler-entry running state from callback-time state, method
   callsites from stored-callback delivery, and fixed error text from an arbitrary rejection reason.
8. LC11: an empty promise take is the branch condition, not proof that respondWith was
   never called. No protocol status/output mapping is supplied by this source sample.
9. LC12: `base::ok(String())` is an internal success-typed argument, not a failure class.
   The comment says navigation was triggered; this is not a verified scheduling, landing,
   wire-output or success guarantee. Callee delivery still follows LC07.

`S100:635-842` supplies the additional submit-path context, including the early-return
callsites at 639/647/659/679 and the `submitFromJavaScript` callback at 839–841. The body
of ScheduleFormSubmission is retained in the file but lies outside these registered
anchor ranges, so this sample does not infer its full scheduling semantics. S100 is the
same body as S096/S078: the table's LC11 override and these prose anchors add no publisher.

### History corrections — retained observations, no new execution

- Both committed r17 declarative receipt fixtures use toolautosubmit; the earlier
  sentence about a separate receipt form with a submit button must not imply a
  non-autosubmit receipt. The real `invoke-declarative-form` case and
  `invoke-declarative-navigation-result` control remain historical observations in
  `corpus/evidence/round-17/webmcp-invoke/receipt.json`.
- The r17 probe `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:71-73` first had no
  response for 2500 ms, then a later page requestSubmit produced Completed and page
  output. This is probe-class history, not an indefinitely pending guarantee.
- `.ufo/waves/round-17/w1/C2ProbeFrames.md:70-72` records the plain-form missing-submit
  error. It must not be described as never triggered. The no-handler autosubmit probe
  at `C2ProbeDeclarative.md:78-80` also records navigation and Completed with an empty array.
- r17 `receipt.json` control `invoke-cancel`, `actual.responded`, records Canceled with
  empty errorText on imperative slow-echo. That is not a declarative CancelTool witness;
  a pass-only stdout line alone does not establish the observed payload.
- r19 `corpus/evidence/round-19/validation/receipt.json`, cases
  `decl-unknown-param-01` and `decl-missing-required-01`, stores observed Error with
  submitCount0. The former is fill-time, the latter is the submit-validation path in
  LC05's callee. Expected case blocks are not substituted for those observed fields.
- The r17 landing-document array in `invoke-declarative-navigation-result` is retained.
  This sample does not reconstruct the renderer/browser bridge to it, and neither
  confirms nor contradicts that runtime result from a C++ callsite alone.

### Current gate and measurement boundaries

The lifecycle counter validates source identity, pinned ids/spans, literal quotes,
registered anchor containment and the active note-table rendering. It does not grade
semantic truth, novelty, all Markdown grammar or all Unicode/control-character forms.
It uses JSON.parse semantics; duplicate JSON keys and fenced/comment lookalikes are
not a promised refusal set. Scalar credit requires both exit0 and the expected count;
a count emitted alongside findings is not an admitted result. SKILL's mirror receives
separate review. The exact four counted inputs and counter blob are pinned in
`.ufo/waves/round-20/measurement-binding.json` at final measurement.

The frozen wave-1 metadata gate's canonical entry is
`node .ufo/waves/round-20/check-wave.mjs --frozen .ufo/waves/round-20/w1/frozen`.
This supersedes the earlier registry row's direct-mode evidence command. Direct mode
remains a diagnostic; frozen mode pins every input digest before comparing the expected
verdict. Codes0/1/2 mean matched/failed/could-not-evaluate, with selftest
`node .ufo/waves/round-20/check-wave.mjs --selftest` and expected fixture values in
`corpus/evidence/round-20/wave-check-expected.json`. Its inputs are authored metadata,
not authentication of an observer, membership, actor quiescence or ordering. It is
w1-specific, not a w2 checker; nested marker values and arbitrary path strings are
outside its finite shape proof. The w1 all-actor settlement flags are withdrawn in
`.ufo/waves/round-20/w1/ordering-correction.json`; r19 d4 remains unprovable. The w2
return was frozen before repairs in commit `e0b5d02a6aef76b0d2799d92618f79f1bca40062`.


## Round-21 non-autosubmit lifecycle — observed decision rules

Current note: `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` (S101
own-work runtime evidence; S100 reopened upstream source interpretation).
Source callsites alone are not runtime completion. The recorded experiment uses
Chromium154.0.8037.97, Playwright1.64.0, Node24.21.0 and private loopback fixtures.

| Observed situation | Action / reading | Evidence case |
|---|---|---|
| Filled non-autosubmit form, active pseudo-state | Record a finite no-response window, never an indefinite guarantee | na-pending |
| Later input click or page requestSubmit | Correlate completion by invocationId; isTrusted/agentInvoked do not prove a human submit | na-click, na-requestsubmit |
| Native form.submit | Inspect navigation and landing output independently; old-document submit count can be unavailable (null), not observed zero | na-native-submit |
| Reset or remove this tested form | Retain the observed Canceled event and exact reason; do not generalize to every DOM mutation | na-reset, na-remove |
| Promise rejected / preventDefault then throw | Distinguish rejection from programming-error text; retain handler ordering | na-reject, na-throw |
| Held response promise | Retain intermediate observation and explicit release, then correlated result | na-delayed |
| Required field emptied / autosubmit invalid email | Both are submit-stage validity errors: later page mutation for na-invalid-submit, immediate autosubmit for auto-invalid; neither is initial-fill refusal or validation by JavaScript form.submit() | na-invalid-submit, auto-invalid |

The autosubmit positive control is held-ground evidence (`auto-positive`), not
another novel lifecycle branch. Every case's raw JSON and served HTML are under
`corpus/evidence/round-21/runtime/`; the note supplies exact outcome text and limits.
Reset/removal are observation-only with respect to S100's narrower source anchors.
No real-site, default-profile, human-witness, cross-build or determinism claim follows.

### Round-21 runnable artifacts registry

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| finite lifecycle capture | probe | `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node scripts/webmcp-lifecycle-round21.mjs --out NEW_DIRECTORY` | 0=observed finite run; 1=failed execution; 2=could-not-evaluate usage/aborted; no semantic pass | not a gate; actual run retained | `corpus/evidence/round-21/runtime/receipt.json` producer/environment and raw case digests | new owned output directory and private temporary browser/server state; no external actions | tabi |
| lifecycle observation count | gate | `node .ufo/waves/round-21/measure-c1.mjs REV` | 0=clean/baseline; 1=failed relationships; 2=could-not-evaluate | `node .ufo/waves/round-21/measure-c1.mjs --selftest` | `.ufo/waves/round-21/fixtures/expected.json`, positive-ordered.json, source-carrier.gz; pinned producer and acquisition/artifact hashes | read-only committed Git blobs; selftest disposable isolated Git trees only | tabi |

The gate checks fixed-case completeness, raw invocation/event correlation, artifact
digests, finite windows and recorded cleanup. It does not certify observation
authenticity, all possible producer stubs, source-to-binary equivalence or semantic
truth. A twelve-case count is not a branch-coverage ratio. A missing response in the
recorded window is not an eventual-settlement guarantee. Outside admission remains
the independent closer's duty, not a property conferred by lane-dispatched reviews.

The capture records exact Node producer argv and requested Chromium flags, not the
complete effective browser command line or attested transport. The counter pins the
producer bytes, acquisition record, raw source carrier/body, header associations,
first-literal-form attribute names and causal payload mirrors. Its HTML grammar is
finite, not a general parser (comment/script lookalikes remain outside coverage).
Detailed kernel identity fields and lifecycle meanings receive separate review;
the structural selftest's silent synthetic population is not runtime evidence.

## Round22 — explicit finite lifecycle outcome oracle

Source: reopened own-work S101, `corpus/evidence/round-21/runtime/receipt.json`
and invocation-correlated per-case frames. Current additional note:
`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. This deepens retained
round21 observations; it is not a new browser acquisition or twelve new branches.

| Decision | Required evidence | Refuse |
|---|---|---|
| Structural receipt is internally consistent | Apply fixed case-specific status/output/error predicates independently of mirrored summaries | Inferring semantic agreement merely from digest consistency or all-silent synthetic success |
| Non-autosubmit is pending or later settles | Case-specific finite window and invocation correlation; exact expected terminal class where observed | Silent reset/rejection, wrong status, wrong nonce or unrelated event |
| Native submission navigates | Landing navigation with case nonce; JSON-LD array output; old-document collection unavailable/null | Object/array collapse or unavailable→empty normalization |
| Promise is deliberately held | Intermediate active state and release-before-response sequence | Early completion, missing release or universal eventual-settlement wording |
| Artifact was reviewed | Name exact reviewed producer/artifact identity and chronology | Calling an older W2 review a review of final bytes acquired after W2 returned |
| Failed seat later receives IRC/broadcast | Retain first-terminal failure, wake/activity and later failures separately | Final-status-only history, treating unavailable history as no wakes, or all-actor settlement from a task-return barrier |

The finite oracle expects one pending, five Completed, two Canceled and four
Error cases in this historical acquisition. Exact output shapes, error strings
and raw/summary/producer bindings are persisted, not recomputed from the observed
status. Diagnostic wording is build/locale-scoped. Re-running the oracle checks
retained bytes, not the browser. The old structural gate remains unchanged and
its separate semantic witness/non-author admission remain valid history.

### Round22 runnable artifacts registry

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| finite lifecycle semantic outcome oracle | gate | `node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV` | 0=clean/baseline; 1=failed; 2=could-not-evaluate | `node .ufo/waves/round-22/measure-c1.mjs --selftest` | `corpus/evidence/round-22/semantic-expectations.json`; `.ufo/waves/round-22/fixtures/expected.json`; retained round21 acquisition artifact digests | read-only committed blobs; selftest disposable Git trees only | tabi |
| finite review-chronology/history classifier | gate | `node .ufo/waves/round-22/check-review-chronology.mjs INPUT_JSON` | 0=clean; 1=failed evidence claim; 2=could-not-evaluate | `node .ufo/waves/round-22/check-review-chronology.mjs --selftest` | `.ufo/waves/round-22/debt-expectations.json` | read-only supplied JSON; isolated selftest fixtures only | tabi |

Neither gate authenticates observers, authors, publishers, complete wake history,
hostile-host integrity or general scheduler quiescence. Historical gaps remain
explicitly unavailable/debt. No new capability, shared-profile use, real-site
operation or ownership of sibling orchestration follows from these local checks.

## Errata — round22 axis and encoding (2026-10-25, append-only)

The round22 oracle entry above says the round "deepens" retained ground. That is
the observation content of round21, not this round's claim: round22's C1 is
**operability** (a lowest non-retired tie at 8), 0→12 failure-capable semantic
rows over the same twelve retained observations, with the population unchanged at
12→12 and scalar operability 8→8. The pinned `na-native-submit.post.errors` is now
`null` (absent recorder), the landing branch is the uniform null-means-absent rule,
and `.ufo/waves/round-22/expectation-revision.json` carries the disclosed,
measured-value-neutral revision. Do not cite this round as depth or as a new
browser acquisition.

## Round 24 — gate registry conformance (2026-10-25; append-only; never edit above)

PROTOCOL.md §Gate standard fixes eight row fields (name, gate|probe, entry command, verdict map,
self-test command and spelling, pinned-value path, write scope, owner) and makes a child lane's
`SKILL.md` its registry home. The rows above use five different table shapes and three gates had
no gate-kind row at all (`check-adjacency`, `check-measurement-binding`, `round-evidence-audit` —
the last is the round-23 non-author spot-check's routed defect 1). This block restates the lane's
whole gate set in the canonical eight-column shape. It supersedes earlier rows for the same gate;
no earlier byte is edited. The verdict on the restatement is mechanical:
`node scripts/check-gate-registry.mjs --rev <REV>` → `nonconformant=0` at the round-24 tip and
`nonconformant=3` at baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`.

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| closeout-pin-witness | gate | `node scripts/check-freshness.mjs --worktree` (candidate only) or `node scripts/check-freshness.mjs --witness REV` | 0=clean; 1=failed; 2=could-not-evaluate | `node scripts/check-freshness.mjs --self-test` (cases=12, measured round 24; the earlier "eight isolated CLI cases" figure is superseded) | `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`; immutable baseline `c24eaea14dfc0c4a3848742d31673db5675f9183`; `pins.tsv` rows | read-only repo/public allowlist in normal modes; self-test writes and deletes only its own temporary fixture repository | tabi L1 |
| sources-census | gate | `node scripts/check-sources.mjs [--file REL] [--since YYYY-MM-DD]` | 0=clean; 1=failed; 2=could-not-evaluate (missing, symlinked or non-regular registry; bad args) | `node scripts/check-sources.mjs --self-test` (cases=26, measured round 24; the earlier "25 isolated CLI cases" figure is superseded) | Expected exit/finding table inside `scripts/check-sources.mjs`; first receipt `corpus/evidence/kaika-fleet-round-1/` | read-only over the registry; self-test writes and deletes only its own temporary fixtures | tabi L1 |
| claim-record-discipline | gate | `node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --file fixtures/m2-inference-source-scoped.jsonl` | 0=clean; 1=failed; 2=could-not-evaluate | same entry with `--self-test` only (cases=9/9) | `.ufo/waves/round-12/w1/mistake/expected.json` pins fixture digests and expected code/finding pairs | input read-only; self-test writes only a temporary fixture tree and deletes it | tabi L1 |
| historical-pstack-contract | gate | `node scripts/check-round-contract.mjs` | 0=clean; 1=failed; 2=could-not-evaluate | `node scripts/check-round-contract.mjs --self-test` (cases=38, alias_checks=1); `--witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` compares the pinned legacy script on one fixture | `scripts/check-round-contract.mjs` constants HARD_BASELINE, canonical seed digest, census digest and legacy witness blob; `corpus/evidence/pstack-20261015/baseline-census.tsv` unchanged | production reads committed lane files only; self-test/witness writes isolated temporary fixture trees and removes them | tabi L1 |
| historical-user-contract | gate | `node scripts/check-user-round-contract.mjs` | 0=clean; 1=failed; 2=could-not-evaluate (the inherited six-of-ten `round_count` stays failed, not a compatibility repair verdict) | `node scripts/check-user-round-contract.mjs --self-test` (cases=45); `--diagnostic-witness` and `--count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` retain the shell-count differential | `scripts/check-user-round-contract.mjs` HARD_BASELINE/PSTACK_PIN, canonical seed and exact ROUND-script cutover constants | production committed reads; self-test/witness creates and removes isolated temporary fixture repos | tabi L1 |
| aria-historical-metadata | gate | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0=clean; 1=failed (including semantic failed); 2=could-not-evaluate (including snapshot_tampered and snapshot_unavailable) | `node scripts/check-aria-metadata.mjs --self-test` (cli_cases=36, helpers=4); `--witness` retains the original red→corrected comparison | `corpus/evidence/round-15/metadata/expected-fixtures.json` and `mirror-contract.json`; round-14 expectations and sidecar stay frozen | reads historical sources; self-test creates and removes isolated fixtures and copied snapshot trees; `--derive` writes only its declared evidence output | tabi L1 |
| adjacency-map | gate | `node scripts/check-adjacency.mjs [--at REV] [--fleet DIR] [--json]` | 0=clean; 1=findings; 2=could-not-evaluate | `node scripts/check-adjacency.mjs --self-test` (cases=57, reasons=18) | `scripts/check-adjacency.mjs` reasons table and lane-tip anchor; the adjacency map at `corpus/adjacency.tsv` | read-only over the lane and the named fleet root; self-test creates and removes isolated fixtures | tabi L1 |
| measurement-binding | gate | `node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce]` or `--legacy <round-15 measurements.json>` | 0=clean; 1=failed; 2=could-not-evaluate | `node scripts/check-measurement-binding.mjs --self-test` (cases=76, reasons=13) | `scripts/check-measurement-binding.mjs` expectations table; `--legacy` reads the round-15 measurements file | read-only over committed lane files; `--reproduce` re-runs only the recorded argv of a bound measurement; self-test writes and deletes isolated temp trees | tabi L1 |
| round-evidence-audit | gate | `node scripts/round-evidence-audit.mjs --rev REV --round N --round-cap SEATS [--report PATH] [--policy NAME] [--json]` | 0=clean; 1=failed (one or more findings); 2=could-not-evaluate (usage, IO, unreadable revision, missing round cap); 3=self-test disagreement | `node scripts/round-evidence-audit.mjs --selftest` (cases=13, passed=13) and `--selftest --rev REV --round N --round-cap SEATS` (evidence-keyed repair matrix) | `scripts/round-evidence-audit.mjs` CASES table; `corpus/evidence/round-23/c1-measurements.json`; the fleet round report and wave policy are read by path and digested in every output | stdout/stderr only; reads lane blobs at a revision plus the fleet report and policy; writes nothing | tabi L1 |
| gate-registry-conformance | gate | `node scripts/check-gate-registry.mjs --rev REV [--json]` | 0=clean; 1=failed (one or more nonconformant gates); 2=could-not-evaluate (usage, unreadable revision, git failure); 3=self-test disagreement | `node scripts/check-gate-registry.mjs --selftest` (cases=22, passed=22) | `scripts/check-gate-registry.mjs` CASES table; `corpus/evidence/round-24/c1-measurements.json` | stdout/stderr only; production reads committed git blobs; self-test writes and deletes only its own temporary repositories | tabi L1 |
| selfassessment-counter | gate | `node scripts/check-selfassessment.mjs --rev REV [--json]` | 0=clean; 1=failed (one or more mismatches); 2=could-not-evaluate (usage, unreadable revision, git failure); 3=self-test disagreement | `node scripts/check-selfassessment.mjs --selftest` (cases=13, passed=13) | `scripts/check-selfassessment.mjs` CASES table; `corpus/evidence/round-24/c2-measurements.json` | stdout/stderr only; executes only lane `scripts/` gates with their declared self-test flag, and only `git cat-file -e`/`git show` receipts; self-test writes and deletes only its own temporary repositories | tabi L1 |
## Round 25 — bfcache runtime observation and source-reopen counters (2026-10-25; append-only; never edit above)

Two counters land with this round. C1 (`scripts/check-bfcache-receipt.mjs`) reads the committed
journey receipt at `corpus/evidence/round-25/bfcache/receipt.json` and verifies the restore event
log against the raw event stream: stage-named history step executed via the history index
(`Page.navigateToHistoryEntry`, the CDP history primitive; `Page.goBack` does not exist on this
build — observed -32601), no disabled flag in the effective argv (including
`--disable-features=…BackForwardCache…`), events digest binding, distinct restore events not
exceeding goBack steps, loaderId continuity with the original A navigation, the page witness
(`pageshow.persisted` + surviving JS state), no `Page.backForwardCacheNotUsed` contradiction, and
the history-index drop. C2 (`scripts/check-source-reopen-receipt.mjs`) reads
`corpus/evidence/round-25/freshness/reopened.json`, hashes the committed bytes against each row's
digest, validates this-round fetch dates, and locates each held quote in the stored bytes
(tag-stripped, whitespace-normalized), or validates a this-round superseding row that opens with
`supersedes <id> —`.

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| bfcache-receipt | gate | `node scripts/check-bfcache-receipt.mjs --rev REV [--json]` | 0=clean (receipt present, valid, restores>=1); 1=failed (invalid receipt or restores=0); 2=could-not-evaluate (usage, unreadable revision, git failure, unexpected error) | `node scripts/check-bfcache-receipt.mjs --selftest` (cases=17, passed=17) | `scripts/check-bfcache-receipt.mjs` CASES table; `corpus/evidence/round-25/bfcache/receipt.json` | stdout/stderr only; production reads committed git blobs; self-test writes and deletes only its own temporary repositories | tabi L1 |
| source-reopen-receipt | gate | `node scripts/check-source-reopen-receipt.mjs --rev REV [--json]` | 0=clean (reopened=6, unresolved=0); 1=failed (any unresolved/dup/miscount); 2=could-not-evaluate (usage, unreadable revision, git failure, malformed receipt, unexpected error) | `node scripts/check-source-reopen-receipt.mjs --selftest` (cases=18, passed=18) | `scripts/check-source-reopen-receipt.mjs` CASES table; `corpus/evidence/round-25/freshness/reopened.json` | stdout/stderr only; production reads committed git blobs; self-test writes and deletes only its own temporary repositories | tabi L1 |
## Round 27 — LOG-window extension and decoded-source evidence gate (2026-10-25; append-only; never edit above)

The selfassessment counter's m1 window now covers LOG.md round entries in addition to
SCORECARD.md (frozen round-26 claim C1, executed this round): the same association rule
(own line's scripts, else single-script section, else could-not-evaluate) applies, and the
correction unit is the paragraph — a later paragraph clears an earlier stale mention only
when it names the same script, carries a correction marker, cites the superseded line
(`:LINE`) and states the oracle-correct number in a tally shape. The decoded-source evidence
gate C2 commits the S106 decoded bytes + receipt (`corpus/evidence/round-26/sources/`) to a
mechanical check: receipt parsed at the revision, decoded_sha256 recomputed over the
committed bytes, anchor text required at the recorded line, unique in the file.

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| s106-evidence | gate | `node scripts/check-s106-evidence.mjs --rev REV [--json]` | 0=valid (receipt present, sha_match, anchor_located, anchor_unique, byte_count_match); 1=invalid (receipt present but committed bytes disagree); 2=could-not-evaluate (usage, unreadable revision, receipt or bytes absent, malformed receipt) | `node scripts/check-s106-evidence.mjs --selftest` (cases=4, passed=4) | `scripts/check-s106-evidence.mjs` CASES table; `corpus/evidence/round-26/sources/s106.json` + decoded bytes | stdout/stderr only; production reads committed git blobs at the revision only; self-test writes and deletes only its own temporary repositories | tabi L1 |
| selfassessment-counter | gate | `node scripts/check-selfassessment.mjs --rev REV [--json]` | 0=clean; 1=failed (one or more mismatches); 2=could-not-evaluate (usage, unreadable revision, git failure); 3=self-test disagreement | `node scripts/check-selfassessment.mjs --selftest` (cases=17, passed=17) | `scripts/check-selfassessment.mjs` CASES table; `corpus/evidence/round-24/c2-measurements.json` | stdout/stderr only; executes only lane `scripts/` gates with their declared self-test flag, and only `git cat-file -e`/`git show` receipts; self-test writes and deletes only its own temporary repositories | tabi L1 |
