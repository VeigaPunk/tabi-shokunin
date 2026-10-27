<!-- corpus entry — tabi-shokunin round 2 (2026-10-14), lane TABI-R2-1 (wave 2; plan: plans/round-2.plan.md:3-11). Method: a single-file fixture page with JS-driven DOM mutation served by `python3 -m http.server` bound 127.0.0.1:19411, captured before/after interaction through CDP on a fresh headless chromium (debug port 19412, loopback), twice with byte-identical methodology (two independent runs: fresh server + fresh browser + same script bytes each), sha256 over screenshots and DOM-shape snapshots; cleanup executed and port closure verified per run. This lane's write scope was this file only — LOG.md append (AGENTS.md:3), coverage row, SKILL distillation left to the integrating round (same pattern as cdp-evidence-patterns.md:1). Scratch artifacts staged at /tmp/tabi-r2-1-capture/ (ephemeral — archive obligation per cdp-evidence-patterns.md:92 applies to this run's bytes too). -->
# Live dynamic-page capture — loopback fixture, CDP before/after, determinism boundary

Scope: PROVINCE.md:9-13 (CDP session discipline + dynamic-page evidence patterns).
Refusals honored (PROVINCE.md:15-19): no external site touched (loopback only —
plan anti-claim plans/round-2.plan.md:8-9, recorded here), no secrets read, no
consequential actions. Admission bar: corpus/QUALITY.md:1-7. Claims below are
observations with anchors, inference, or §7 unknowns. Evidence produced
2026-10-14 on this host; every artifact re-hashed from disk after capture.

## 1. Fixture + harness (observed)

Fixture `site/page.html` — 61 lines / 1,903 bytes, sha256 `21e27aa6…1c99`
(`sha256sum methodology-sha.txt` → all four harness files OK). Single file,
inline CSS+JS, no subresources; the only non-fixture request was the browser's
own `/favicon.ico` probe → 404 (run1/http.log:2-3). Mutation surface:

| region | mechanism | class |
|---|---|---|
| `#status` | setTimeout 150 ms → text `hydrated` (async hydration) | deterministic given a state-wait |
| `#btn` click | count++ → `#count` text + append `li#item-N`; +120 ms setTimeout appends `div#confirm-N` | deterministic given a state-wait |
| `#clock` / `#random` | only `?nondet=on`: texts overwritten every 250 ms (`Date.now()`, `Math.random()`) | time-varying by construction |

Server: `python3 3.14.7 -m http.server 19411 --bind 127.0.0.1` (driver.sh:19);
listen line `LISTEN 0 5 127.0.0.1:19411 users:(("python3",pid=3943063,…))`
(run1/driver.log:10); both fixture URLs served 200 from 127.0.0.1
(run1/http.log:1,4).

Browser: launch driver.sh:24-29; effective child line run1/driver.log:12 — the
host wrapper flags reappear (`--load-extension=~…copy-url`) plus an appended
`--ozone-override-screen-size=800,600`, reproducing round-1 E1
(cdp-evidence-patterns.md:18,30-32); new here: `--disable-background-networking`
(§6).

Wait discipline — all state-based (capture.mjs:114-118,155-163,186-190): poll
`document.title==='TABI-R2-1 fixture' && readyState==='complete'`, then
`#status==='hydrated'`, then per click poll `li==N && #confirm-N present`; two
rAF frames before each screenshot. The confirm div lands 120 ms after the click,
so a fixed sleep would race the mutation; the poll is what certifies the
post-interaction state before the shutter. *(Inference: on a loaded host,
sleep-only capture timing becomes a determinism hazard; not adversarially
tested — §7.4.)*

Viewport pinned: `Emulation.setDeviceMetricsOverride 800×600×1`
(capture.mjs:155) → `innerWidth/innerHeight 800/600`, cssLayoutViewport
800×600, screenshot 800×600 (run1/det.json viewport). This **bypasses**
round-1 §7.2 (cdp-evidence-patterns.md:110 — screenshot 780×493 vs
`--ozone-override-screen-size=800,600` unexplained): pin the metrics explicitly
and the window-metric mystery never enters the capture. It does not explain the
old mismatch.

Methodology pinned by sha256 (methodology-sha.txt): page.html `21e27aa6…1c99`,
capture.mjs `d37d36dd…` (209 lines), driver.sh `8105bed0…` (85 lines),
compare.mjs `e558bd54…` (47 lines). "Byte-identical methodology" is thereby a
sha256 check, and the artifact comparison is mechanical (compare.tsv, produced
by compare.mjs — no hand transcription).

## 2. Capture pair (observed) — the before/after evidence

Run 1 (server pid 3943063, chromium pid 3943064, browser ws uuid `4a239533-…`)
and run 2 (3943695 / 3943696 / `8ce5ace6-…`): fresh profile, same ports, same
script arguments (only `<run>` and `--out` differ).

| artifact | run 1 | run 2 | bytes | dims |
|---|---|---|---|---|
| det-before.png | `c08947dc…802dc1` | `c08947dc…802dc1` | 18,672 | 800×600 |
| det-before2.png (+350 ms idle) | `c08947dc…802dc1` | `c08947dc…802dc1` | 18,672 | 800×600 |
| det-after.png | `7488d544…4b42c7` | `7488d544…4b42c7` | 23,210 | 800×600 |
| det-before.shape.txt | `d85c76fb…8dcab0` | `d85c76fb…8dcab0` | 55 nodes | — |
| det-after.shape.txt | `ba497530…f20714` | `ba497530…f20714` | 65 nodes | — |
| nondet-nd1.png | `1f424dfa…` | `d08b6c74…` | 20,525 / 20,388 | 800×600 |
| nondet-nd2.png (+1,317 ms) | `1090a53b…` | `9add41a9…` | 20,568 / 20,444 | 800×600 |
| nondet shape struct (all 4 captures) | `3f4f9240…34db5` | same | 55 nodes | — |

Full hashes (re-read from run1/det.json, run2/det.json, run1/nondet.json,
run2/nondet.json; disk re-hash matched):

- det-before png `c08947dc1e02f0ea551b3beb42b4a3eb9641347d6d5ae65bebcbba01c0802dc1`
- det-after png `7488d544ed53e0dbc25f9ae3c65c22b609a58c901c8a7b95aeec82ebde4b42c7`
- det-before shape `d85c76fb9d814f93ac821138e76418ca84799090493183c3fa2e75f5238dcab0`
- det-after shape `ba497530f3884d0d445d2ec8190eb743a04b1bcb8379b6214af42ff134f20714`
- struct (before + all nondet) `3f4f9240199be05f5a8de50871128492fcd087c8db9e26941254d283d3734db5`
- struct (after) `c8a8e862afae4071f364d634ed892655d2e941f35f2d599ce52911a7ca36dd68`
- nondet nd1 R1/R2 `1f424dfa…ab8793` / `d08b6c74…d0fd8f18`; nd2 R1/R2 `1090a53b…506ce28` / `9add41a9…da8dc2c2`

Interaction: two real input clicks at the button's rect center
x=66.8046875 y=172.875 — identical coordinates in both runs (run1/det.json
click, run2/det.json click); `Input.dispatchMouseEvent` pressed/released pairs
(capture.mjs:182-183), each followed by the state poll. Post-click probe:
count=2, items=[item-1,item-2], confirms=[confirm-1,confirm-2]
(det.json captures[*].volatile). Screenshots were read back visually
(calibration): before renders count 0 with clock/random `never`; after renders
count 2, two bulleted items, two green `confirmed N` lines — rendering matches
the authored fixture.

DOM-shape delta 55→65 nodes, fully accounted: +2 LI +2 `::marker` pseudo nodes
+2 DIV +4 text nodes. **DOMSnapshot emits pseudo-element nodes**: the list
markers appear as nodes with nodeName `::marker`, and the sparse `pseudoType`
field is hollow-encoded as `{"index":[34,37],"value":[41,41]}` (strings[41] =
`"marker"`), not a plain array — so node counts include display-generated
nodes, and a consumer counting "authored nodes" must classify accordingly.

## 3. The determinism boundary (what was and was not byte-reproducible)

**Byte-reproducible in this environment** (verified twice — two full runs):

1. Fixture bytes (sha pin above).
2. det-before PNG: identical within-run (before vs before2, 350 ms apart) *and*
   across the two independent server+browser processes — the capture operation
   is idempotent on a quiescent page. Extends round-1 E9
   (cdp-evidence-patterns.md:68-73) from a static `data:` URL to an
   HTTP-served page whose DOM was mutated by JS at load time (hydration timer).
3. det-after PNG: identical across runs — byte-identity survives JS-driven DOM
   mutation plus real input events *when the resulting state is fixed*.
4. DOM-shape: full shape text (structure + resolved attribute/text values) for
   both det captures; struct-only shape for **every** capture, including the
   live page.
5. Protocol metadata: Browser `Chrome/152.0.7977.82`, Protocol-Version `1.3`
   (run1/json-version.json); viewport-override effects identical
   (run1/det.json ≈ run2/det.json).

**Not byte-reproducible** (measured, not assumed):

1. Live-page screenshots: nd1 vs nd2 differ within-run (clock/random text
   changed) and nd1 vs nd1 differs across runs; the shape *text* differs while
   the *struct* does not — structure-only shape survives liveness, text-value
   shape does not.
2. Session slots, per launch: page target id run1 `16AB794233F7B22EF872C35A5D34520B`
   vs run2 `9B574406A25D7751A819DCDF9042D417`; browser ws uuid per launch
   (json-version.json, run1/driver.log:50 vs run2). Match targets by URL/type,
   never id (round-1 E6, cdp-evidence-patterns.md:48).
3. Wall-clock stamps: atUTC per capture (e.g. 13:48:58.054Z vs 13:49:21.820Z),
   http.log / chromium.log timestamps, and the live fixture's `Date.now()`
   values.
4. Browser background behaviour: the two runs' GCM traces differ under
   identical flags (run1/chromium.log:3-7: 3× PHONE_REGISTRATION_ERROR + 401
   wrong_secret + reset; run2/chromium.log:3-6: 3× PHONE_REGISTRATION_ERROR +
   ConnectionHandler net error −2). Logs are not byte-stable across launches.

**Byte-identity rests on**: same chromium build (152.0.7977.82), same effective
flag set (record the child line — the host wrapper injects flags,
cdp-evidence-patterns.md:18), same viewport override, same fixture bytes, same
capture parameters (`format:"png"`, `captureBeyondViewport:true`,
`DOMSnapshot {computedStyles:[]}` — capture.mjs:114-118), same wait predicates,
same host font rendering (host-scoped; not further measured, §7.3).
Environment-scoped per round-1 E9 caveat (cdp-evidence-patterns.md:72): this
closes that note's §7.8 (cdp-evidence-patterns.md:116) **for fixtures whose
rendered state is deterministic**, and it refutes extending byte-identity to
time-varying DOM text.

## 4. Rules delta — what capturing a live page adds to the envelope

Extends the 9-item re-verifiability envelope (cdp-evidence-patterns.md:79-92)
with what this round earned:

1. **Split the page by determinism class before capturing.** Freeze what can be
   frozen (here: `?nondet=off`), but capture the volatile class too — it is the
   boundary's counterexample. A determinism claim without its counterexample is
   unfalsifiable.
2. **Wait on state, never on time.** Poll for the exact expected post-interaction
   DOM state; the predicates live in the sha-pinned script, so "the capture
   waited correctly" is re-checkable.
3. **Pin the methodology bytes** (fixture + capture script + driver): then
   "same methodology" is a sha256 verification, not a promise.
4. **Pin the viewport explicitly** (`Emulation.setDeviceMetricsOverride`) so
   screenshots carry their own geometry, independent of window-metric quirks.
5. **Idempotence-check the capture operation** (capture twice while idle;
   identical hashes ⇒ pipeline stable; differing ⇒ find what moved).
6. **Loopback ≠ no-egress.** The page and all evidence traffic were loopback-only
   (run1/http.log:1-4), yet the browser logged GCM network attempts in both runs
   (§6) — pair any no-egress claim with the browser log's shape.
7. **Keep the differing pair as evidence.** Document the boundary by measurement
   on both sides.

## 5. Cleanup + closure proof (executed per run)

Kill by discovered PIDs, never by pattern (round-1 `pkill -f` self-match
incident, cdp-evidence-patterns.md:105): driver.sh:61,66-67. Post-kill scans
run1/driver.log:63,65-68 — no survivors; ports not listening; `curl` exit 7 on
both ports — identical lines in run2/driver.log:59,61-64. Run 2 then *reused*
19411/19412 after its own precheck line `ports free` (run2/driver.log:3):
closure is proven twice (direct scan + successful rebinding). Calibration kept:
a first closure check self-matched because the `ps|grep` command line contained
the echo fallback text ("no chromium / http.server processes") — self-match can
come from *other text in the same command line*; verify with an exact-comm scan
(`ps -eo pid,comm,args | awk '$2=="chromium" …'`) in a clean command. Final
global check at write time: no chromium / crashpad_handler / http.server
processes; ports 19411/19412 closed.

## 6. Egress observation under `--disable-background-networking`

Despite the flag, both runs logged `google_apis/gcm` registration errors —
run1/chromium.log:3-7 (3× PHONE_REGISTRATION_ERROR, `401 … wrong_secret`,
`Failed to log in to GCM`), run2/chromium.log:3-6 (3× PHONE_REGISTRATION_ERROR,
`ConnectionHandler failed with net error: -2`). Observation only: the flag did
not stop the GCM registration machinery from attempting/logging traffic in
these runs; whether packets actually left the host is not measurable from
client logs (§7.1). This narrows round-1 §7.7 (cdp-evidence-patterns.md:115,
flag untested): in this configuration the flag alone is *not* sufficient for a
no-egress claim.

## 7. Unknowns (do not convert to claims without a new probe)

1. Packet-level truth of the GCM attempts (§6) — client-log evidence only.
2. Why the two runs' GCM failure modes differ (401 wrong_secret vs net error
   −2) under identical flags.
3. Generality of byte-identity beyond this host/build/font stack — only
   chromium 152.0.7977.82 on this host measured (cdp-evidence-patterns.md:72
   caveat stands).
4. Behaviour under load: all captures landed ~250-350 ms after settle; a
   loaded/slow host's timing envelope (poll timeouts, rAF delays) untested.
5. `pseudoType` / `pseudoIdentifier` hollow-array decoding beyond the two
   `::marker` samples (§2).
6. Round-1 §7.2 (780×493) itself remains unexplained; this note provides a
   bypass only.
7. Real-site pages (third-party JS, webfonts, animation) — untested by rule this
   round (external-site anti-claim, plans/round-2.plan.md:8-9).

## 8. Errata (append-only — never edit above blocks)

*(none yet)*

Appended 2026-10-14 (tabi round 4, lane ERR-B — errata sweep; re-run transcripts
staged `/tmp/w4-erb-b-sweep/`, byte-prefix proof `/tmp/w4-erb-b-append-proof/`,
both volatile). Entries below supersede the placeholder above; nothing above is
edited. Pre-append sha256 of this file:
`56224aa8843007381d325e900008cb76a9fb85d2b18b52d3d4b5e7c1bd1597de`. The
post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, fresh re-run] VERIFIED — round-2 methodology pins held a third
  round.** fixture `21e27aa6619a…1c99` (`page.html`, 1,903 B), `capture.mjs`
  `d37d36dd92d0…`, `driver.sh` `8105bed02840…`, `compare.mjs` `e558bd547c58…`
  (`/tmp/tabi-r2-1-capture/`, intact); ports 19411/19412 closed; no
  chromium/python3 survivors.
- **[2026-10-14, state change] daemon DOWN 16:21:07Z** (pid 3934817 gone;
  `/status` exit 7; it answered through 16:08:33Z). No claim above depends on
  it — all captures were daemon-independent loopback CDP, and no round-3/4
  scratch carries a 10086 hit (grep). Cause unmeasured.
- **[2026-10-14, §7 status] no movement.** item 7 (`--disable-background-networking`
  vs GCM) open; item 6 (780×493) still explained-by-bypass only; items 1-5, 8
  unchanged. Scratch remains `/tmp`-staged — archive obligation stands
  (`cdp-evidence-patterns.md:92`).

Appended 2026-10-14 (tabi round 5, lane B5-3 — pin refresh; derivation pass 17:01–17:06Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `f97c10238907c0ef5a93db9b68694e5ca430eb47a55d451777226a77441969bb`. The post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, pin refresh] VERIFIED — §1 methodology 4/4; file pin + r2 blob held.** `/tmp/tabi-r2-1-capture/methodology-sha.txt` re-checked: page.html `21e27aa6…1c99`, capture.mjs `d37d36dd…`, driver.sh `8105bed0…`, compare.mjs `e558bd54…` — all match §1. This note's hash → `f97c10238907…` (= the §Pins value); round-2 blob still `56224aa88430` (`git show 5d2e95d:corpus/knowledge/live-dynamic-capture.md | sha256sum`). Same-day-later pass — a strictly-later-date re-derivation remains open (round-5 plan clause (c)).