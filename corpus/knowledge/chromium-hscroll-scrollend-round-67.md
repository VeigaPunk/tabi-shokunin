source: S172 (CSSOM View Module, Editor's Draft rev 909869d6b501d19e4bf632e458848f3c81af425f, section 3.1 Scrolling and section 13.3 Event summary, https://drafts.csswg.org/cssom-view/; staged file sha256 e8f4fbda9555bea51b7e161b3195fec033430e6118f669d3091681b35a71f4a6, accessed 2026-11-05); S166 (MDN WheelEvent, deltaX/deltaMode semantics; registry row, not re-opened this round); own-work: corpus/evidence/round67/chromium-hscroll-scrollend/ (the committed receipt and PNGs of the frozen driver run)
verified-at: e0fc04c2aab996325442b005944ce053832b9ce9 (claim freeze; driver b7cd3b1d6cb3a51dfcfcaa683ec08818b894038da1ab5b6ab65d8df760306d22; counter cf97a68d9ac4 at freeze)
recheck: `node .ufo/waves/round-67/counters/chromium-hscroll-r67.mjs corpus/evidence/round67/chromium-hscroll-scrollend/receipt.json --driver scripts/chrome-cdp-loopback-round67.mjs --expect-driver-sha256 b7cd3b1d6cb3a51dfcfcaa683ec08818b894038da1ab5b6ab65d8df760306d22 --shot corpus/evidence/round67/chromium-hscroll-scrollend --json` (exit 0), and the S172 quotes against the staged file (re-fetch on the CSSOM View release cadence)

# Horizontal wheel and scrollend on Chromium/Linux (round 67)

Scope: one Linux Chromium 155.0.8059.84 build driven over raw CDP on a loopback fixture. This note records what the frozen driver measures, not a general claim about browsers.

## Measured arithmetic (committed receipt)

The fixture is a 2280 px wide page (19 colour bands of 120 px) in a 1280 x 900 viewport, 860 px tall, so only horizontal overflow exists. The maximum horizontal scroll is 2280 - 1280 = 1000.

| leg | wheel deltaX dispatched | scrollX at dispatch | scrollX after | scrollY | scrollend in leg |
|---|---:|---:|---:|---:|---:|
| start | - | - | 0 | 0 | 0 |
| right1 | +120 | 0 | 120 | 0 | 1 |
| right2 | +120 | 120 | 240 | 0 | 1 |
| left1 | -120 | 240 | 120 | 0 | 1 |
| overscroll | +1200 | 120 | 1000 (clamped) | 0 | 1 |
| boundary | +120 | 1000 | 1000 (no move) | 0 | 0 |

Source: `corpus/evidence/round67/chromium-hscroll-scrollend/receipt.json` (`legs`, `wheellog`, `scrollendlog`). The page-side wheel record has deltaY 0, deltaMode 0, isTrusted true, cancelable true and defaultPrevented false on all five wheels; scroll events 4; scrollend events 4.

## Scrollend observations

- Each scrolling leg yields exactly one scrollend. The `scrollendlog` timestamps are spaced about 500 ms apart, which is the driver's leg cadence (settle loop plus a 300 ms drain), so they measure leg order, not the latency from wheel to scrollend. No wheel-to-scrollend latency is claimed.
- The boundary wheel moves nothing and yields no scrollend. This is the negative witness: scrollend follows a scroll sequence, not a wheel event.

## Why the expected maximum was 1000, not 960

An earlier fixture used a 2240 px container under 19 bands of 120 px. The bands overflowed to 2280 px, so the true maximum was 1000. A first expectation of 960 (2240 - 1280) was wrong, and the mismatch is preserved as the committed red receipt `.ufo/waves/round-67/measure/smoke1/receipt.json` (lane commit b5ebbb0c). The scroll maximum is the scrollable overflow, not the nominal container width.

## Negatives and controls (frozen counter)

- Degenerate drivers, each a byte copy of the frozen driver with one edit: no wheel dispatched (`controls/c3/degenerate/M-A-no-wheel`), no scrollend listener (`M-B-no-scrollend`), page overflow hidden (`M-C3-no-overflow`). The frozen counter refuses each receipt (exit 1).
- Equivalent mutant, not a counter gap: a clipped `#wide` (`overflow:hidden` on the container) leaves the window scrollable, so the driver and counter both stay green. It is recorded as equivalent, not as a survivor.
- The counter's 35 declared negatives are all refused (forgedGreen 0); its 13 exact-line mutants are all killed.

## Limits (not claimed)

- No smooth scrolling (`--disable-smooth-scrolling`), no trackpad phases, no horizontal scroll on real sites, no other Chromium builds or platforms.
- The driver pin is supplied by the caller; the frozen value lives in the claim's after-argv (QUALITY 118 limit).
- The driver's own predicate checks no pixels; the counter is what re-derives the nonce grid and band colours (QUALITY 123).
