# Coverage-map and capability rows ready to paste (round 63, seat R63Scribe)

Both rows are drafts for the L1 to integrate; this seat edited nothing in
`corpus/` or `SCORECARD.md`.

## 1. `corpus/README.md` coverage row

House shape for this file is a three-column table `| Note | Holds | Sources |`
under a `## Round NN coverage addition — …` heading, appended (the file is
append-only; the round-58 addition is the nearest precedent). Paste:

```
## Round 63 coverage addition — the Chromium wheel/scroll domain (2026-11-04, Linux host)

Append-only. One new knowledge note on ground the map did not hold; the row is
written because the file exists, and the capability enters only with the
round's frozen predicate.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/chromium-wheel-scroll-round-63.md` | The Linux Chromium wheel/scroll domain: a dispatched `mouseWheel` delta reaches the page as a trusted, cancelable `wheel` event (deltaY passthrough 120/120/−120/120/120, deltaX 0, deltaMode 0) and moves `window.scrollY` by exactly the dispatched pixel delta under `--disable-smooth-scrolling` (legs 0 → 120 → 240 → 120); a capture-phase `preventDefault` leg DELIVERS the event (`cancelable` true, `defaultPrevented` true) while the scroll position does not move, and the released leg restores movement as the positive control; two cold runs carry identical legs / wheellog-minus-ts / pageState and identical PNG sha256; the frozen counter refuses ten declared negatives and kills eight exact-line source mutants through the production CLI. Limits named: one browser build on one host, `--disable-smooth-scrolling` on, no cross-browser, trackpad, horizontal, ctrl+wheel-zoom or `scrollend` claim, and the receipt is not authenticated. | S166 (delta field semantics), S167 (the `Element.scrollTop` getter class); measured receipt `corpus/evidence/round63/chromium-wheel-scroll/receipt.json` plus `stability/receipt-run2.json`; counter `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` |
```

Cells in the row (3): the note path in backticks; the "Holds" prose above;
the "Sources" cell above. No `|` appears inside any cell.

## 2. `SCORECARD.md` capability-table row

House shape is the four-column table
`| Capability | What it can now do | Evidence pointer | First-working round |`.
Paste into the round-63 capabilities table:

```
| `chromium-wheel-scroll-domain-linux` | Drive `mouseWheel` deltas over raw CDP into a page-side wheel recorder with exact scroll arithmetic, a page-cancelled leg (event delivered, movement suppressed) and its released positive control, plus a counter that refuses ten declared negatives and kills eight exact-line source mutants through the production CLI | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs corpus/evidence/round63/chromium-wheel-scroll/receipt.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot corpus/evidence/round63/chromium-wheel-scroll --json` | 63 |
```

First-working round is `63`; the evidence pointer is the C1 claim's own
after-command (`claims.json`, `claims[0].afterCommand`), copied verbatim so
the row and the claim cannot drift apart.

## Evidence pointer, read back

The after-command re-run by this seat on the scored data receipt
(`corpus/evidence/round63/chromium-wheel-scroll/receipt.json`,
sha256 `3aa3ce40b49eb2e3516cfb82923eae8761f3a9ba052a3da4cc58764164ad28a1`)
returned exit 0 with `predicate: true`, `findingCount: 0`. On the
freeze-commit smoke receipts the same command shape returns exit 0 with the
same verdict (`844f9fac…` and `954cee8a…`).
