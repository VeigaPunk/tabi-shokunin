---
source: S153, S167, S166
verified-at: 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741
recheck: node scripts/verify-live-r64.mjs --scratch <ABS> --driver scripts/chrome-cdp-loopback-round64.mjs --counter .ufo/waves/round-64/counters/chromium-wheel-r64.mjs --evidence corpus/evidence/round64/chromium-wheel-scroll/receipt.json --evidence-shots corpus/evidence/round64/chromium-wheel-scroll --json
---

# The wheel/scroll interaction domain on the Linux Chromium surface, generation 2 (round 64)

Round-64 capability `chromium-wheel-scroll-domain-linux`, second declared
generation. Generation 1 (round 63) measured the same six legs but its receipt was
only internally consistent: a hand-written receipt with four 1×1 PNGs satisfied
it, so the capability could not be demonstrated. This generation binds the receipt
to a rendering of the run and moves the demonstration to a live re-run.

Written from committed bytes only: the driver
`scripts/chrome-cdp-loopback-round64.mjs`, the counter
`.ufo/waves/round-64/counters/chromium-wheel-r64.mjs`, the verifier
`scripts/verify-live-r64.mjs`, and the scored receipt
`corpus/evidence/round64/chromium-wheel-scroll/receipt.json` with its shot bytes.
Observation / inference / unknown stay separate; `[measured]` marks a value read
from a receipt, `[sourced]` a value grounded in a registry row.

## §0 As-of table (one command per row)

| Quantity | Value | Where |
|---|---|---|
| host browser | Chromium 155.0.8059.84 Arch Linux `[measured]` | `receipt.json` `host.chromium` |
| CDP identity | `Chrome/155.0.8059.84`, protocol 1.3 `[measured]` | `receipt.json` `host.cdpProduct` (from `Browser.getVersion`) |
| launch argv | headless=new, remote debugging bound to 127.0.0.1, throwaway `--user-data-dir` under scratch, `--disable-extensions`, `--disable-smooth-scrolling`, `--force-device-scale-factor=1`, `--window-size=1280,900` | `receipt.json` `host.argv` |
| viewport | 1280×900 at device scale 1, screenshots 1280×900 `[measured]` | `receipt.json` `fixture.viewport`; decoded PNG dimensions |
| scroll legs | 6 (`start`, `down1`, `down2`, `up1`, `swallowed`, `released`), one screenshot each | `receipt.json` `legs` |
| wheel events | 5, shared page sequence 1–5, `deltaMode 0` `[measured]` | `receipt.json` `wheellog` |
| delta unit | CSS pixels `[sourced S153]` | CDP `Input.dispatchMouseEvent.deltaY` |
| screenshot bound | viewport only unless `captureBeyondViewport` `[sourced S153]` | CDP `Page.captureScreenshot` |
| counter verdict | predicate true, 0 findings, 29 named checks | `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs … --json` |
| live verdict | two cold runs, both counter-clean, mutually agreeing and agreeing with the evidence receipt | `node scripts/verify-live-r64.mjs … --json` |

## §1 The measured model — six legs, exact scroll arithmetic `[measured]`

One `Input.dispatchMouseEvent` of type `mouseWheel` with `deltaY: 120` at the
viewport point (200, 300) over a 3000 px document moves `window.scrollY` by
exactly +120 on this build, because the launch carries
`--disable-smooth-scrolling`. Each leg records its scroll position, the page's
wheel-log length, the witness colour it painted and its screenshot:

| leg | dispatched deltaY | scrollY after settle | wheellog length | event defaultPrevented |
|---|---:|---:|---:|---|
| `start` | — | 0 | 0 | — |
| `down1` | +120 | 120 | 1 | false |
| `down2` | +120 | 240 | 2 | false |
| `up1` | −120 | 120 | 3 | false |
| `swallowed` | +120 | **120 (unchanged)** | 4 | **true** |
| `released` | +120 | 240 | 5 | false |

`pageState.scrollEvents` is 4 — one scroll event per wheel that actually moved the
page. The counter requires it to equal the number of non-prevented wheel entries,
not merely to fall in 1..5 (generation 1 accepted any value in that range, so a
page-side contradiction could pass).

## §2 The run binding — what the screenshot must prove `[measured]`

The fixture renders three things the counter decodes from the committed PNG
bytes, at integer coordinates, with no anti-aliasing:

1. **The nonce grid.** A fixed 32×8 grid of 4×4 px black/white cells at (8, 8).
   The bit pattern is the first 32 bytes of `SHA-256(nonce)`, MSB-first, so the
   page cannot paint a pattern the counter would accept for another nonce. The
   counter samples each cell centre and compares all 256 bits for all six shots.
2. **The scroll bands.** The document paints 25 bands of 120 px in six exact RGB
   colours. At a sample row `y`, the visible band index is
   `floor((scrollY + y) / 120)`, so four sample rows at x = 1000 recover the
   leg's scroll position from pixels alone.
3. **The per-leg witness strip.** A fixed 200×50 strip at (900, 600) is
   recoloured per leg from a frozen table (`start` 10/20/30 … `released`
   160/170/180), so each leg's screenshot is distinguishable from every other
   leg's.

The receipt also records `fixture.sha256`, which the counter re-derives by
rendering the frozen driver's template with the receipt's own nonce, and the
server log entry that carries `?run=<nonce>` with status 200, which binds the
origin to a listening fixture server for that run.

## §3 What the counter refuses `[measured]`

Against the committed smoke receipt, the declared negatives (one per named
check) are all refused, and four r63-class forgeries exit 1: a hand-written
receipt with six 1×1 PNGs (`red-one-by-one`), six shots borrowed from one leg
(`red-borrowed-shots`), a receipt with no shot bytes (`red-no-shots`), and the
r63 receipt itself (`red-r63-receipt`). The sixteen exact-line mutants are each
killed by their matching negative.

## §4 Limits — declared, not hidden

- **The counter is not an execution oracle.** A synthesized 1280×900 rendering of
  the fixture passes every pixel check (committed control
  `red-synthetic-rendering`, exit 0). Synthesis is as cheap as rendering for a
  flat-colour fixture, so receipt acceptance is evidence quality, never proof
  that the surface ran.
- **The demonstration is the live verifier.** `scripts/verify-live-r64.mjs` runs
  the frozen driver twice cold in its own scratch, requires both receipts to pass
  the counter, requires the two runs to agree on legs / wheellog-minus-timestamp /
  pageState, and requires the evidence receipt to agree with its own live run. Its
  `--no-run` mode exits 1 with `live-run-required` — the round's no-work control.
- **Scope.** Loopback fixture only, one browser build on one Linux host, with
  `--disable-smooth-scrolling`. Horizontal scrolling, `scrollend`,
  trackpad/momentum phases, ctrl+wheel zoom, cross-browser deltas and
  third-party sites are not held.
- **Egress.** The fixture origin is loopback; the run is not egress-isolated —
  Chromium's own background traffic reached non-loopback peers in the round-63
  sentinel measurement. The counter cannot see this.
