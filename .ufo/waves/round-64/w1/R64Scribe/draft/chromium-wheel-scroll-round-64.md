---
source: S170, S171
verified-at: 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741
recheck: node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs .ufo/waves/round-64/controls/smoke/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot .ufo/waves/round-64/controls/smoke --json
---

# The wheel/scroll interaction domain on the Linux Chromium surface, generation 2 (round 64)

Round-64 capability `chromium-wheel-scroll-domain-linux`, second declared
generation of the same domain round 63 measured.

Generation 1 (round 63) measured the six-leg scroll arithmetic and its counter
held the receipt internally consistent, but the counter was not an execution
oracle: a hand-authored receipt with four 1×1 PNGs exited 0 with zero findings
(`corpus/lessons/round-63.md` W1). Generation 2 keeps the arithmetic and changes
what a receipt must carry: the counter now decodes the receipt's own PNG bytes
and requires them to be a rendering of *this* run, and the demonstration is a
live re-run of the frozen driver rather than an agreement with a stored receipt.

Written from committed bytes only: the driver
`scripts/chrome-cdp-loopback-round64.mjs` (sha256 `1ff560cc…b92db5`), the frozen
counter `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs` (sha256
`5cc3c8dd…c5f01b7`), the live verifier `scripts/verify-live-r64.mjs` (sha256
`87a1a7c3…61a68a`), and the committed design-time receipts under
`.ufo/waves/round-64/controls/`. Observation, inference and unknown stay
separate; `[measured]` marks a value read from a committed receipt or control
stdout, `[sourced]` a value grounded in a registry row, `[unknown]` a value this
note does not claim.

## §0 As-of table (one command per row)

Every row is re-derivable from the lane root; the `node -p` one-liners print
exactly the value in the middle column.

| Quantity | Value | Command |
|---|---|---|
| host browser | Chromium 155.0.8059.84 Arch Linux `[measured]` | `node -p 'require("./.ufo/waves/round-64/controls/smoke/receipt.json").host.chromium'` |
| CDP identity | `Chrome/155.0.8059.84`, protocol `1.3` `[measured]` | `node -p 'const r=require("./.ufo/waves/round-64/controls/smoke/receipt.json"); r.host.cdpProduct+" "+r.host.cdpProtocolVersion'` |
| launch argv | 17 entries; `--headless=new`, remote debugging on `127.0.0.1`, throwaway `--user-data-dir` under scratch, `--disable-extensions`, `--disable-smooth-scrolling`, `--force-device-scale-factor=1`, `--window-size=1280,900` `[measured]` | `node -p 'require("./.ufo/waves/round-64/controls/smoke/receipt.json").host.argv.join(" ")'` |
| fixture | sha256 `7386fc4e…7e96b`, origin `http://127.0.0.1:18481`, target `tall`, viewport 1280×900, device scale 1, band height 120 px `[measured]` | `node -p 'JSON.stringify(require("./.ufo/waves/round-64/controls/smoke/receipt.json").fixture)'` |
| scroll legs | 6 legs: `start=0/0 down1=120/1 down2=240/2 up1=120/3 swallowed=120/4 released=240/5` (name=`scrollY`/wheellog length) `[measured]` | `node -p 'const r=require("./.ufo/waves/round-64/controls/smoke/receipt.json"); r.legs.map(l=>l.name+"="+l.scrollY+"/"+l.wheellogLen).join(" ")'` |
| wheel events | 5, shared page sequence 1–5, `deltaY` 120/120/−120/120/120, cancelation on the 4th only (`*`) `[measured]` | `node -p 'const r=require("./.ufo/waves/round-64/controls/smoke/receipt.json"); r.wheellog.map(e=>e.seq+":"+e.deltaY+(e.defaultPrevented?"*":"")).join(" ")'` |
| final page state | `scrollY` 240, `scrollEvents` 4, `wheellogLen` 5 `[measured]` | `node -p 'JSON.stringify(require("./.ufo/waves/round-64/controls/smoke/receipt.json").pageState)'` |
| server log | one `/` request carrying `?run=tabi-r64-smoke-design` with status 200, then `/favicon.ico` with status 404 `[measured]` | `node -p 'const r=require("./.ufo/waves/round-64/controls/smoke/receipt.json"); r.serverLog.map(e=>e.path+"?"+e.query+"="+e.status).join(" ")'` |
| teardown and sweeps | post-kill sweep count 0, no survivors, no sweep error, both ports `closed`, post-kill curl exit 7 on both; sweeps pre-launch 0 / mid-run 13 / post-kill 0 `[measured]` | `node -p 'const r=require("./.ufo/waves/round-64/controls/smoke/receipt.json"); JSON.stringify(r.teardown)+" "+JSON.stringify(r.sweeps)'` |
| counter verdict | predicate true, 0 findings, 29 named checks `[measured]` | `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs .ufo/waves/round-64/controls/smoke/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot .ufo/waves/round-64/controls/smoke --json` |
| counter selftest | verdict `clean`, 31 cases, 31 passed `[measured]` | `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs --selftest --scratch <ABS>` |
| declared negatives | 29 declared, 29 refused, 0 forged green `[measured]` | `node -p 'const m=require("./.ufo/waves/round-64/controls/negatives/matrix.json"); `negatives=${m.negatives} refused=${m.refused} forgedGreen=${m.forgedGreen}`'` |
| exact-line mutants | 16 mutants, 16 applied, 16 killed, 0 surviving, 0 redundant, 16 load-bearing `[measured]` | `node -p 'const m=require("./.ufo/waves/round-64/controls/mutants/matrix.json"); `mutants=${m.mutants} applied=${m.applied} killed=${m.killed} surviving=${m.surviving.length} redundant=${m.redundant.length}`'` |
| live verifier (design control) | two cold runs, both driver exit 0 and counter exit 0, cross-run agreement true, evidence agreement true `[measured]` | `node -p 'const o=JSON.parse(require("fs").readFileSync(".ufo/waves/round-64/controls/live-verify.stdout","utf8")); `predicate=${o.predicate} runs=${o.runs.map(r=>r.exit+"/"+r.counterExit).join(",")} crossRun=${o.agreement.crossRun} evidence=${o.agreement.evidence}`'` |
| live verifier, no-run control | predicate false, finding `live-run-required` `[measured]` | `node -p 'const o=JSON.parse(require("fs").readFileSync(".ufo/waves/round-64/controls/live-no-run.stdout","utf8")); `predicate=${o.predicate} findings=${o.findings}`'` |
| r63 receipt under the r64 counter | predicate false, 14 findings `[measured]` | `node -p 'const o=JSON.parse(require("fs").readFileSync(".ufo/waves/round-64/controls/red-r63-receipt.stdout","utf8")); `predicate=${o.predicate} findings=${o.findingCount}`'` |
| provenance gate, r63 controls | 11 receipts checked, 34 failures (`schema` 11, `stdout-bound` 11, `inputs-bound` 11, `argv-real` 1) `[measured]` | `node -p 'const g=JSON.parse(require("fs").readFileSync(".ufo/waves/round-64/controls/gate-before.stdout","utf8")); `checked=${g.checked} failures=${g.failures} ${JSON.stringify(g.byCheck)}`'` |
| wheel delta unit | CSS pixels `[sourced S170]` | `node -p 'const s=require("fs").readFileSync(".ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl","utf8"); s.slice(8657,8657+53)'` |
| browser identity source | CDP `Browser.getVersion` returns `protocolVersion`, `product`, `revision`, `userAgent`, `jsVersion` `[sourced S171]` | `node -p 'const s=require("fs").readFileSync(".ufo/waves/round-64/w1/R64Scribe/sources/s171-chromium155-Browser.pdl","utf8"); s.slice(7146,7146+118)'` |
| scored after-pass receipt | not yet committed under `corpus/evidence/round64/` at the freeze revision `[unknown]` | `git ls-tree -r --name-only 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741 -- corpus/evidence/round64/` (0 lines) |

## §1 The measured model — the same six legs, unchanged arithmetic `[measured]`

One `Input.dispatchMouseEvent` of type `mouseWheel` with `deltaY: 120` at the
viewport point (200, 300) over a 3000 px document moves `window.scrollY` by
exactly +120 on this build, because the launch carries
`--disable-smooth-scrolling`: the settle loop (three stable reads 40 ms apart)
returns the value the wheel produced. The six recorded legs:

| leg | dispatched deltaY | scrollY after settle | wheellog length | event defaultPrevented |
|---|---:|---:|---:|---|
| `start` | — | 0 | 0 | — |
| `down1` | +120 | 120 | 1 | false |
| `down2` | +120 | 240 | 2 | false |
| `up1` | −120 | 120 | 3 | false |
| `swallowed` | +120 | **120 (unchanged)** | 4 | **true** |
| `released` | +120 | 240 | 5 | false |

`pageState.scrollEvents` is 4 — one scroll event per wheel that actually moved
the page. The counter requires it to *equal* the number of non-prevented wheel
entries, not merely to fall in 1..5 as generation 1 accepted, so a page-side
contradiction is refused.

## §2 What generation 2 adds — the receipt must carry a rendering of the run `[measured]`

The receipt is no longer free to assert its own state. Three independent pixel
channels and two non-pixel bindings tie the committed PNG bytes to this run.

1. **The nonce grid.** The fixture paints a fixed 32×8 grid of 4×4 px black or
   white cells at (8, 8); the bit pattern is the first 32 bytes of
   `SHA-256(nonce)`, most-significant bit first, so a page cannot invent a
   pattern the counter would accept for another nonce. The counter samples every
   cell's interior pixel for all six shots and requires all 256 bits.
   Independent re-derivation from the committed PNG bytes: 256/256 grid bits
   matched, band colours matched, and the witness pixel matched on every leg.
2. **The scroll-position bands.** The document paints 25 bands of 120 px in six
   exact RGB colours, so at a sample row `y` the visible band index is
   `floor((scrollY + y) / 120)`, and four sample rows at x = 1000 recover the
   leg's scroll position from pixels alone.
3. **The per-leg witness strip.** A fixed 200×50 strip at (900, 600) is
   recoloured per leg from a frozen table (`start` 10/20/30 … `released`
   160/170/180), so each leg's screenshot is distinguishable from every other
   leg's.
4. **The fixture re-render.** `receipt.fixture.sha256` is re-derived by
   rendering the *frozen driver's own* template with the receipt's nonce and
   comparing digests, so a receipt cannot pair a plausible fixture digest with
   a driver that would produce something else.
5. **The server-log run binding.** The fixture server's log must carry an entry
   for `/` with query `?run=<nonce>` and status 200, and no path other than
   `/` and `/favicon.ico` — the origin is bound to the run's own nonce.
6. **The browser identity.** The receipt records the product string and
   protocol version read over CDP `Browser.getVersion`, and the counter requires
   them to agree with the `--version` banner's major version, so the identity
   cannot be asserted independently of the browser that answered.

Generation 1's failure class is refused by the same counter: the r63 receipt
under the r64 counter exits 1 with 14 findings.

## §3 The counter's contract `[measured]`

The frozen counter names 29 checks: `schema`, `nonce-binding`, `driver-binding`,
`fixture-binding`, `loopback-origin`, `launch-guards`, `legs-shape`,
`scroll-arithmetic`, `wheellog-count`, `wheellog-sequence`,
`delta-y-passthrough`, `delta-mode-pixels`, `trusted-fields`, `cancelation`,
`target-binding`, `scroll-event-witness`, `shot-records`, `shot-bytes`,
`nonce-pixels`, `scroll-pixels`, `leg-witness`, `server-witness`,
`host-identity`, `survivors`, `closed-ports`, `launch-witness`, `failures`,
`producer-verdict`, `page-final-state`.

Each check has one declared negative; all 29 are refused with the expected
finding and no forged green. Sixteen exact-line mutants of the counter — one
per check family, from `M1-cancelation-drop` to `M16-scroll-arithmetic-drop` —
are each killed: the mutant accepts the live receipt and accepts its matching
negative, so no mutant is redundant and none survives. The counter's own
selftest runs 31 cases and is clean (29 negatives plus a positive control).

## §4 The demonstration is a live re-run, not an agreement `[measured]`

`scripts/verify-live-r64.mjs` runs the frozen driver twice cold in its own
scratch with distinct nonces (`tabi-r64-live-a`, `tabi-r64-live-b`), runs the
frozen counter over each run's receipt and shot bytes, requires the two runs to
agree on legs / wheellog-minus-timestamp / pageState, and requires the
committed evidence receipt to agree with its own live run. The committed design
control reports both runs at driver exit 0 and counter exit 0 with cross-run and
evidence agreement true. Its `--no-run` mode is the round's do-nothing control:
it exits 1 with the finding `live-run-required`, so the target is unreachable
without executing the browser.

## §5 Closure proof `[measured]`

Every run proves closure, not just exit: pre-launch token sweep 0, mid-run
sweep 13 (> 0, so the launch is real), post-kill sweep 0 with an empty survivor
list and a null sweep error, `probePort` `closed` on both the fixture and the
DevTools ports, and a post-kill `curl` exit 7 on both ports. A survivor, an open
port, or a curl exit other than 7 records a `teardown-closure` failure and the
counter refuses the receipt.

## §6 Limits (declared, not hidden)

- **The counter is synthesis-equivalent, not an execution oracle.** A synthesized
  1280×900 rendering drawn from the fixture geometry satisfies every pixel
  check: the committed control `red-synthetic-rendering` exits 0 with predicate
  true and zero findings. Synthesis is as cheap as rendering for a flat-colour
  fixture, so *receipt acceptance is evidence quality, never proof that the
  surface ran*. The demonstration is the live verifier
  (`scripts/verify-live-r64.mjs`), which re-runs the frozen driver and whose
  `--no-run` control is refused.
- **The verifier proves the surface behaves as measured on this host with these
  instruments.** It does not authenticate the committed evidence bytes, and its
  runs use the same driver it verifies, so a driver that lies would be run
  faithfully and lie faithfully.
- **Scope.** Loopback fixture only; one browser build (Chromium 155.0.8059.84)
  on one Linux host, with `--disable-smooth-scrolling`. No cross-browser claim,
  no trackpad or momentum phase, no horizontal scroll, no ctrl+wheel zoom, no
  `scrollend`, no scroll snapping, no third-party site.
- **The receipt is unsigned.** The binding is internal-consistency plus
  pixel-binding against the frozen driver; it is not a signature over the
  bytes.
- **The delta unit is a protocol statement, not a measured scroll distance.**
  The wheel delta is expressed in CSS pixels `[sourced S170]`, which is why the
  fixture's 120 px bands and the dispatched delta share a unit; how far a delta
  scrolls is measured here, and only here.
- **Freshness.** The build-scoped protocol rows S170 and S171 are pinned to
  Chromium tag 155.0.8059.84 and are re-opened `on-release`; the CDP
  `browser_protocol.json` at `@master` is a different, moving artifact.
- **Egress.** The fixture origin is loopback, but a loopback origin is not an
  egress-isolated run: the round-63 sentinel measured Chromium's own
  background traffic reaching non-loopback peers. This round's counter cannot
  see that.

## §7 History

- 2026-11-04, round 64: second declared generation of the wheel/scroll domain.
  Generation 1's receipt was internally consistent but a hand-written receipt
  with four 1×1 PNGs reached the same target (`corpus/lessons/round-63.md` W1);
  generation 2 binds the receipt to a rendering of the run and moves the
  demonstration to a live re-run. The counter's synthesis limit is declared, not
  hidden: a synthesized rendering still passes it, so the verifier, not the
  counter, is the capability's demonstration.
