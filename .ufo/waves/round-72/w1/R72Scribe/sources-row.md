Replacement candidate v2 for an S179 row. A row already exists at `corpus/SOURCES.md:193`
(committed in `cfa92fa2`, before this seat was dispatched); the deltas against it are listed at
the bottom. If the L1 keeps the committed row, this file is discardable — the added anchors are
a convenience, not a correction.

| S179 | Chromium 155.0.8059.84 touchpad pinch to ctrl+wheel conversion — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/components/input/touchpad_pinch_event_queue.cc?format=TEXT | code | A | how a trackpad pinch update becomes the ctrl-modified wheel a page sees at this tag: `delta_y = 100 log(scale)` per update, inverted sign at the page, precise-pixel units, begin never converted, one wheel in flight at a time; not Blink's page-scale handling of that wheel and not the synthetic gesture itself (S177) | lines 31-44 (design constraints and `delta_y = 100.0f * log(scale)` on PinchUpdate), 48-60 (ctrl modifier forced, gesture position forwarded, `kScrollByPrecisePixel`, `delta_y`), 113-128 (queued updates coalesce), 166-224 (single in-flight dispatch and the begin/update/end phase mapping); staged `.ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc` sha256 4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73, 239 lines, `?format=TEXT` fetch HTTP 200 at 2026-11-06T20:27:07-03:00 | each pinch update becomes one ctrl+wheel whose deltaY is 100 ln of that update's scale with the sign inverted at the page, and `f(s1*s2)=f(s1)+f(s2)` (line 34) makes the summed deltaY recover 100 ln of the product even when queued updates coalesce into one wheel; the file contains no page-scale term, so dividing the magnitude by page scale is a host measurement it does not source | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md, corpus/lessons/round-72.md |

## Delta against the committed row (`corpus/SOURCES.md:193`)

| cell | committed | this draft |
|---|---|---|
| scope | "how the browser turns a touchpad pinch update into the synthetic ctrl+wheel event a page sees at this tag: deltaY from the update's scale, sign, ctrl modifier, precise-pixel units; not Blink's page-scale handling of that wheel and not the synthetic gesture itself (S177)" | same claim, plus "begin never converted, one wheel in flight at a time" (S179:172-193, 166-170) |
| anchor | lines 31-44, 39-40, 53-60; staged path + sha256; fetched 2026-11-06 | adds 113-128 (coalescing) and 166-224 (dispatch and phase), the 239-line count and the fetch timestamp |
| teaches | "each pinch update becomes one ctrl+wheel whose deltaY is -100 ln(update scale), so a page can sum wheel deltas to recover the gesture's scale factor; it does not say how page scale enters the delivered deltaY" | same, plus the additive identity as the reason coalescing preserves the sum, and "the file contains no page-scale term" as the sharper form of the same limit |
| used-by | knowledge note, lessons/round-72.md | unchanged (both kept) |

Row shape check: 11 cells, identical column order to the registry header at
`corpus/SOURCES.md:13`, no `|` inside any cell.
