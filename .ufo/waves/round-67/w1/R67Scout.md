# R67Scout — C3 primary-source grounding (scrollend event + horizontal scroll clamp)

Seat: R67Scout (scout, leaf; no subagent dispatch). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Scope: read-only on the lane except this seat folder. Read-only git/jj only; no commits; no tooling installed (nothing needed beyond curl/grep/python3 already present).

## What I did
1. Fetched the live CSSOM View spec into the seat folder and hashed it.
2. Fetched the live CSS Overflow 3 spec (the scrollable-overflow bound the clamp depends on) into the seat folder and hashed it.
3. Located the normative scrollend text and the horizontal clamp text, recorded line numbers + section headings + verbatim quotes.
4. Wrote `sources.json` with 8 entries; verified every quote reproduces its recorded line with `grep -n -F` (exactly one hit each).

## Files written (all under the seat folder)
- `.ufo/waves/round-67/w1/R67Scout/sources/cssom-view-live.html` — staged live spec
- `.ufo/waves/round-67/w1/R67Scout/sources/css-overflow-3-live.html` — staged live spec (supporting)
- `.ufo/waves/round-67/w1/R67Scout/sources.json` — the 8 located quotes with {claim, quote, line, section, url, accessed, stagedFile, sha256}
- `.ufo/waves/round-67/w1/R67Scout/report.md` — this file
- `.ufo/waves/round-67/w1/R67Scout.md` — same findings, at the path named in the item ("Report: write your scoped findings to .ufo/waves/round-67/w1/R67Scout.md")

Nothing outside this seat folder was touched. `corpus/SOURCES.md` was NOT written.

## Staged files (sha256, bytes, revision meta)

`curl -sSL --max-time 180 -o <path> https://drafts.csswg.org/cssom-view/` → exit 0
```
sha256  e8f4fbda9555bea51b7e161b3195fec033430e6118f669d3091681b35a71f4a6
bytes   1084848
grep -n 'name="revision"' → 11:  <meta content="909869d6b501d19e4bf632e458848f3c81af425f" name="revision">
```

`curl -sSL --max-time 180 -o <path> https://drafts.csswg.org/css-overflow-3/` → exit 0
```
sha256  5bb17eba9666b5610a12335b6be683e993b0c9f448217dc3c57af3eda10b9dd6
bytes   331909
grep -n 'name="revision"' → 11:  <meta content="909869d6b501d19e4bf632e458848f3c81af425f" name="revision">
```

Both staged files carry the same bikeshed revision id `909869d6b501d19e4bf632e458848f3c81af425f`, so both are the same spec-editor snapshot.

## The two located quotes (the acceptance pair) — grep -n reproduces exactly

### Q1 — when a scrollend event is fired
- file: `sources/cssom-view-live.html`
- line: **4736** (also 4735 and 4737 complete the sentence; the event row starts at 4729)
- section heading above it: `13.3. Event summary` (heading at line 4695; the parent is `13. Events` at line 4549)
- verbatim quote (line 4736, ≤25 words):
  > `or element has been scrolled, the scroll sequence has ended and any scroll offset changes have`

  Plain reading of the full cell (lines 4735–4737): "Fired at the VisualViewport, Document, or element when a scroll is completed: the VisualViewport, viewport, or element has been scrolled, the scroll sequence has ended and any scroll offset changes have been applied."

  The normative trigger itself is the linked definition `scroll completed` at **line 2016**, section `3.1. Scrolling`:
  > "when the scroll position has no more pending updates or translations and the user has completed their gesture."

### Q2 — the horizontal scroll clamp
- file: `sources/cssom-view-live.html`
- line: **2288**
- section heading above it: `4. Extensions to the Window Interface` (heading at line 2055)
- verbatim quote (line 2288, ≤25 words):
  > `Let <var>x</var> be max(0, min(<var>x</var>, <a ...>viewport</a> <a ...>scrolling area</a> width - <var>viewport width</var>)).`

  Plain reading: "Let x be max(0, min(x, viewport scrolling area width - viewport width))."

  The Element-level analogue is at **line 3744**, section `6.1. Element Scrolling Members` ("scroll an element"):
  > "Let x be max(0, min(x, element scrolling area width - element padding edge width))."

  The `scrollLeft` setter that routes into that clamp is at **line 3437**, section `6. Extensions to the Element Interface`:
  > "When setting the scrollLeft attribute these steps must be run:"

## Reproduction (run from the seat folder; all exit 0, all single-hit)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-67/w1/R67Scout
grep -n -F 'when the scroll position has no more pending updates or translations and the user has completed their gesture.' sources/cssom-view-live.html   # -> 2016
grep -n -F 'or element has been scrolled, the scroll sequence has ended and any scroll offset changes have' sources/cssom-view-live.html                       # -> 4736
grep -n -F 'event fires because no scrolling occurred.' sources/cssom-view-live.html                                                                                                    # -> 1947
grep -n -F 'Append (<var>target</var>, <code>"scrollend"</code>) to <var>doc</var>' sources/cssom-view-live.html                    # -> 4634
grep -n -F 'Let <var>x</var> be max(0, min(<var>x</var>, <a data-link-type="dfn" href="https://drafts.csswg.org/css2/#viewport%E2%91%A0" id="ref-for-viewport%E2%91%A0③⑥">viewport</a> <a data-link-type="dfn" href="#scrolling-area" id="ref-for-scrolling-area③">scrolling area</a> width - <var>viewport width</var>)).' sources/cssom-view-live.html   # -> 2288
grep -n -F 'Let <var>x</var> be max(0, min(<var>x</var>, <var>element</var> <a data-link-type="dfn" href="#scrolling-area" id="ref-for-scrolling-area①⑦">scrolling area</a> width - <var>element</var> <a data-link-type="dfn" href="https://drafts.csswg.org/css-box-4/#padding-edge" id="ref-for-padding-edge②④">padding edge</a> width)).' sources/cssom-view-live.html   # -> 3744
grep -n -F 'When setting the <code class="idl"><a data-link-type="idl" href="#dom-element-scrollleft" id="ref-for-dom-element-scrollleft④">scrollLeft</a></code> attribute these steps must be run:' sources/cssom-view-live.html   # -> 3437
grep -n -F 'set of things extending outside of that box’s padding edge' sources/css-overflow-3-live.html                              # -> 1611
sha256sum sources/cssom-view-live.html sources/css-overflow-3-live.html
```

Verification script result (python3, in-process): all 8 entries → `OK`, one hit each, recorded line == observed line; both sha256 and byte counts re-read from disk and matched the values recorded in `sources.json`.

## Why these quotes matter for C3 (measured → spec)

Driver facts (read-only, `scripts/chrome-cdp-loopback-round67.mjs`): sha256 `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0` — matches the frozen value in the assignment. Constants: line 48 `VIEWPORT = { width: 1280, height: 900 }`, line 52 `CONTENT_WIDTH = 2280`, line 53 `CONTENT_HEIGHT = 860`, line 50 `BAND_WIDTH = 120`.

- **The clamp value 1000 is spec-derived, not a magic number.** The C3 fixture scrolls the top-level document (`window.scrollX`), so the governing text is Q2 (line 2288): max scrollLeft = viewport scrolling area width − viewport width = 2280 − 1280 = **1000**. That equals the MEASURED `scrollLeft` 1000 on the overscroll and boundary legs, and it is exactly the correction the L1's REFUTED smoke1 receipt was after (a 2240 px container under 19×120 px bands would have given 960; the real 2280 px gives 1000). The counter can therefore assert the clamp as `contentWidth - viewport.width` instead of a hardcoded literal.
- **The boundary leg's missing scrollend has a spec basis.** Line 1947 (`3.1. Scrolling`, note inside "perform a scroll of a viewport"): if the scroll position did not change, no scrollend fires because no scrolling occurred. At the clamp the +120 wheel moves nothing (scrollLeft stays 1000), so no scrollend — matching the MEASURED `scrollendsInLeg` of 0 on the boundary leg and 1 on each real scroll. Line 4634 (`13.2. Scrolling`) shows scrollend is queued as a pending scroll event on the target and fired by "run the scroll steps".
- **Ordering caveat the counter should not assume.** The spec's own issue text (line 4619, `issue-5cebf624`) says "In what order are scrollend events dispatched? Ordered based on scroll start or scroll completion?" — unresolved upstream. Do not encode an ordering assumption about scrollend vs scroll beyond "one scrollend per completed scroll", which is what the spec text at 4735–4737 states.
- **The scrollable-overflow bound itself** (CSS Overflow 3, `2.2. Scrollable Overflow`, line 1611): "The scrollable overflow of a box is the set of things extending outside of that box's padding edge" — the quantity the clamp bounds against.

## Unresolved / caveats
- The spec quote for the *viewport* clamp bounds by "viewport scrolling area width − viewport width"; it does not itself name the horizontal scrollbar width. On this fixture there is no vertical overflow (contentHeight 860 < viewport height 900), so the horizontal scrollbar does not reduce the viewport height; the x-axis bound is unaffected by scrollbar gutter either way. [INFERENCE] the 2280−1280 arithmetic is exact for this fixture.
- I did not run the driver or any counter; this seat produced no measurements. Every "MEASURED" value above is quoted from the assignment's shared facts or from the driver's own source constants — not re-observed by me.
- The bikeshed HTML is the live editors' draft, not a W3C TR; the revision id is recorded so the exact snapshot is reproducible.

## Tooling
None installed or upgraded (curl, grep, sha256sum, python3 already present; pacman is host-paused and no install was needed).
