# README coverage row — round 64 (wave 1, seat R64Scribe) — DRAFT for the L1 to append

Append-only. The row is written because the note file exists
(`corpus/knowledge/chromium-wheel-scroll-round-64.md`); the capability enters
only with the round's frozen predicate and the scored after-pass receipt, which
this row does not assert.

## Block to append to `corpus/README.md`

Place it after the round-63 coverage block (the file's last section), under a
new heading matching the lane's per-round convention:

```markdown
## Round 64 coverage addition — the Chromium wheel/scroll domain, generation 2 (2026-11-04, Linux host)

Append-only. One new knowledge note on ground the map did not hold; the row is
written because the file exists, and the capability enters only with the
round's scored after-pass receipt.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/chromium-wheel-scroll-round-64.md` | The wheel/scroll domain, generation 2 of the r64 capability `chromium-wheel-scroll-domain-linux`: the same six-leg scroll arithmetic as r63 (0 → 120 → 240 → 120, with a capture-phase `preventDefault` leg that delivers the event while the position does not move and a released leg restoring it), but the receipt is bound to a rendering of the run — a 32×8 nonce grid in page pixels whose bits are the first 32 bytes of `SHA-256(nonce)`, 120 px bands whose exact RGB at four sample rows encodes the leg's scroll position, a per-leg witness strip, a fixture digest the counter re-renders from the pinned driver, a server-log entry carrying `?run=<nonce>` with status 200, and the browser identity read over CDP `Browser.getVersion`; six shots, one per leg, decoded from committed PNG bytes; the frozen counter names 29 checks with one declared negative each, refuses 29 of them and kills 16 exact-line mutants; the demonstration is `scripts/verify-live-r64.mjs`, which runs the frozen driver twice cold and requires both runs counter-clean, mutually agreeing, and agreeing with the committed evidence receipt — with the declared limit that the counter is synthesis-equivalent (a synthesized rendering passes it), so the verifier, not the receipt's acceptance, is the capability's demonstration; loopback fixture only, one build, one host, `--disable-smooth-scrolling` | S170 (CDP Input domain at build tag 155.0.8059.84: the wheel delta is expressed in CSS pixels), S171 (CDP Browser domain at build tag 155.0.8059.84: `Browser.getVersion` reports `protocolVersion` and `product`); measured receipt `.ufo/waves/round-64/controls/smoke/receipt.json` with its six shot PNGs; counter `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs`; verifier `scripts/verify-live-r64.mjs` |
```

## Notes for the L1

1. **Sources cell.** The Sources column names the two new registry rows by id
   (`S170`, `S171`) plus the committed measurement paths, in the same shape as
   the round-63 row above it, which names `S166`, `S167` and the round-63
   evidence paths.
2. **Coverage-map completeness.** The map is not required to list every note,
   but QUALITY criterion 11 asks that a map either list every current note or
   state its snapshot date and the exact open row-count gap in the same commit
   as each admit. Measured at the freeze revision
   `0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741`: 75 notes under
   `corpus/knowledge/`, 71 of them named in the README, so **4 notes are
   unmapped** — `knowledge/chrome-cdp-loopback-round-45.md`,
   `knowledge/chromium-control-keys-round-56.md`,
   `knowledge/webview2-control-keys-round-55.md` and
   `knowledge/webview2-modifier-domain-round-54.md` (the four `diff` `<`
   lines). Re-derive with

   ```sh
   diff <(ls corpus/knowledge/*.md | sed 's|corpus/||' | sort) \
        <(grep -o 'knowledge/[a-z0-9.-]*\.md' corpus/README.md | sort -u)
   ```

   and state the gap in the same commit that appends this row. The exact count
   must be re-derived at the L1's revision, not copied from here.
3. **Round-63 row is historical.** The round-63 row keeps its own wording and
   its own `S166, S167` sources; this row does not rewrite it. The generation-2
   row is additive.
