# SOURCES rows ready to paste — S166, S167 (round 63, seat R63Scribe)

Two rows, 11 cells each, no `|` inside any cell. Paste into the `## Registry`
table of `corpus/SOURCES.md` (append-only; do not edit an existing row).
Both rows were checked against the lane's own structural gate on a scratch
clone of the lane at `e5325ad8805df86cb0109373d2ac695f558c2a1f` — see
"Gate evidence" at the bottom.

## S166

```
| S166 | MDN WheelEvent — https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent | docs | B | the delta property semantics of a wheel event only (deltaX, deltaY, deltaZ, deltaMode); not pixel-unit identity, not delivery or cancelation semantics | Instance properties list, the deltaY and deltaMode descriptions, staged .ufo/waves/round-63/sources/s166b-mdn-wheelevent.html lines 1679-1689 (sha256 78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1) | deltaY is the vertical scroll amount and deltaMode names the unit of the delta values, so the receipt records the event's own delta fields | mined | 2026-11-04 | 90d | corpus/knowledge/chromium-wheel-scroll-round-63.md, corpus/lessons/round-63.md |
```

Cells: id `S166`; source `MDN WheelEvent — https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent`;
kind `docs`; tier `B`; scope `the delta property semantics of a wheel event only (deltaX, deltaY, deltaZ, deltaMode); not pixel-unit identity, not delivery or cancelation semantics`;
anchor `Instance properties list, the deltaY and deltaMode descriptions, staged .ufo/waves/round-63/sources/s166b-mdn-wheelevent.html lines 1679-1689 (sha256 78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1)`;
teaches `deltaY is the vertical scroll amount and deltaMode names the unit of the delta values, so the receipt records the event's own delta fields` (24 words);
status `mined`; opened `2026-11-04`; recheck `90d`;
used-by `corpus/knowledge/chromium-wheel-scroll-round-63.md, corpus/lessons/round-63.md`.

Located quote (staged `s166b-mdn-wheelevent.html`, line 1681): "Returns a
`double` representing the vertical scroll amount." — the `deltaY` entry of
the Instance-properties list (line 1679). Companion (line 1689): "Returns an
`unsigned long` representing the unit of the `delta*` values' scroll amount."
— the `deltaMode` entry (line 1687).

## S167

```
| S167 | CSSOM View — https://drafts.csswg.org/cssom-view/ | spec | A | the Element.scrollTop attribute getter definition only; not scroll behavior, smooth scrolling, event semantics or any other CSSOM surface | Extensions to the Element interface, the scrollTop getter steps, staged .ufo/waves/round-63/sources/s167-cssom-view.html line 3357 (sha256 51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99) | scrollTop is an unrestricted double whose getter returns the element's scroll position, so a scroll-position witness is a spec-defined attribute class | mined | 2026-11-04 | 90d | corpus/knowledge/chromium-wheel-scroll-round-63.md, corpus/lessons/round-63.md |
```

Cells: id `S167`; source `CSSOM View — https://drafts.csswg.org/cssom-view/`;
kind `spec`; tier `A`; scope `the Element.scrollTop attribute getter definition only; not scroll behavior, smooth scrolling, event semantics or any other CSSOM surface`;
anchor `Extensions to the Element interface, the scrollTop getter steps, staged .ufo/waves/round-63/sources/s167-cssom-view.html line 3357 (sha256 51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99)`;
teaches `scrollTop is an unrestricted double whose getter returns the element's scroll position, so a scroll-position witness is a spec-defined attribute class` (21 words);
status `mined`; opened `2026-11-04`; recheck `90d`;
used-by `corpus/knowledge/chromium-wheel-scroll-round-63.md, corpus/lessons/round-63.md`.

Located quote (staged `s167-cssom-view.html`, line 3357, §6 "Extensions to the
Element Interface"): "The `scrollTop` attribute, on getting, must return the
result of running these steps:" — followed by the getter steps (element's node
document; zero when the document is not the active document; zero when the
defaultView is null; zero for the root element in quirks mode; the root
element returns `scrollY` on window). The IDL at line 2977 types it
`attribute unrestricted double scrollTop`.

Note: the note's measured accessor is `window.scrollY`, not `scrollTop`. S167
therefore anchors the *attribute class* of a scroll-position witness; the
accessor used here is measured, not sourced.

## Divergence from the working-tree rows (L1 to decide)

At the time this seat read `corpus/SOURCES.md` (working tree, modified but
uncommitted), S166 and S167 were already present there with the same ids,
kinds, tiers, statuses, dates, recheck cadence and used-by cells, but with
two wording differences:

| cell | working-tree text | this seat's row |
|---|---|---|
| S166 anchor | `... fetched 2026-11-04 into .ufo/waves/round-63/sources/s166b-mdn-wheelevent.html (sha256 78bd40dc...)` | adds the line numbers `lines 1679-1689` |
| S167 anchor | `... living CSSWG draft fetched 2026-11-04 into .ufo/waves/round-63/sources/s167-cssom-view.html (sha256 51a7efdb...)` | adds `line 3357` and drops the `living CSSWG draft` wording |

Both variants pass the structural gate. This seat's rows are the line-anchored
ones because the L1 asked for anchors that locate the quote; the L1 may keep
either, but must not paste both (duplicate id).

## Gate evidence (structural gate, on a scratch clone)

Scratch clone of the lane (`git clone --shared`, toplevel verified equal to
the clone dir), with the two rows above substituted into `corpus/SOURCES.md`:

```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=167 tiers=A:149,B:9,C:9 status=queued:15,mined:142,rejected:10 findings=0 file=corpus/SOURCES.md
exit 0
```

The clone also carried the two `used-by` files (the drafted knowledge note and
the round-63 lesson) so the `used_by_uncited` clause could be evaluated
honestly rather than skipped.
