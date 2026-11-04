source: S166, S167
verified-at: 816592612dd2a8073437c595d3fe3c477125cf3c
recheck: `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs .ufo/waves/round-63/controls/smoke/receipt-run1.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot .ufo/waves/round-63/controls/smoke --json` → exit 0, predicate true, 0 findings; plus `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` → exit 0, `TABI_R63_COUNTER_SELFTEST verdict=clean cases=22 passed=22`; plus the two cold-run driver invocations recorded in `receipts/scribe-run1.stdout` / `receipts/scribe-run2.stdout`.

# Chromium wheel/scroll: the Linux page-side wheel domain (round 63 draft)

Round-63 capability `chromium-wheel-scroll-domain-linux`. Question: on the Linux
host's Chromium surface, what does a dispatched wheel delta actually do, and
what does the page observe? Scope: one browser build (Chromium 155.0.8059.84,
Arch Linux), headless, loopback fixture, throwaway profile and throwaway
HOME/XDG. **DRAFT — wave-w1 evidence support for the L1 to integrate; nothing
here is admitted to `corpus/knowledge/` by this seat.**

Every number below is `[measured]` from bytes that exist at the freeze commit
`816592612dd2a8073437c595d3fe3c477125cf3c` or in this wave directory. The
only non-measured statements are marked `[sourced]` and name the registry row
that grounds them.

## 0. Bytes this note is built on

| Artifact | sha256 | Where |
|---|---|---|
| driver `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` | freeze commit; == the C1 claim's driver pin |
| counter `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` | freeze commit |
| smoke receipt run 1 `.ufo/waves/round-63/controls/smoke/receipt-run1.json` | `844f9facd15de4bd6ceb83ef5ae22765486062e66f1ffa241197ab8d2defd48f` | freeze commit |
| smoke receipt run 2 `.ufo/waves/round-63/controls/smoke/receipt-run2.json` | `954cee8a2acaf191c328058ccc60674d300b10e217b1e9c149bf8bd7711b6250` | freeze commit |
| this seat's cold run 1 `receipts/scribe-run1-receipt.json` | `1253be160587114ec58d648735ef22090ca5abd4ca51b73efbaaa8ad4b7a4a43` | this wave dir |
| this seat's cold run 2 `receipts/scribe-run2-receipt.json` | `9a3ba3d3f940646a4bd9572c056e41fef63c819e7f3a0c14b453c0756875dae4` | this wave dir |
| negatives index `.ufo/waves/round-63/controls/negatives/index.json` | `772827c269f081899e0b5899756cb6a94056cdfe19cce7831f27ec590b121fc8` | freeze commit |
| mutation matrix `.ufo/waves/round-63/controls/mutation/matrix.json` | `7e5b4691a9c3188614ed49e320c1291af8ac103ce6ced465fd6f1e88ccd432d0` | freeze commit |
| r62 red-before `.ufo/waves/round-63/controls/old-generation/result.json` | `c1fd449247ab998ec0882246a564e005fbfef5f669a32e5e9bfa9371ada73304` | freeze commit |

## 1. The measured model — six legs, five wheel events `[measured]`

One `Input.dispatchMouseEvent` of type `mouseWheel` with `deltaY: 120` at the
viewport point (200, 300) over the fixture's 3000 px document moves
`window.scrollY` by exactly +120 on this build. The six recorded legs, from
the freeze-commit smoke receipt (`legs`) and identical in this seat's two cold
runs:

| leg | dispatched deltaY | scrollY after settle | wheellog length | wheel event `defaultPrevented` |
|---|---:|---:|---:|---|
| `start` | — | 0 | 0 | — |
| `down1` | +120 | 120 | 1 | false |
| `down2` | +120 | 240 | 2 | false |
| `up1` | −120 | 120 | 3 | false |
| `swallowed` | +120 | **120 (unchanged)** | 4 | **true** |
| `released` | +120 | 240 | 5 | false |

The arithmetic is exact, not approximate, because the launch carries
`--disable-smooth-scrolling` (driver argv) and the driver's settle loop
(`scripts/chrome-cdp-loopback-round63.mjs:240-250`) returns a `window.scrollY`
value only after three consecutive identical reads 40 ms apart.

**The exact sink arithmetic** — where each dispatched delta lands, and what
the page's own counters say at each sink:

| sink | dispatched deltaY | scrollY before | scrollY after | net | `scrollYAtDispatch` recorded in the event | `defaultPrevented` at that event | page `scroll` events so far |
|---|---:|---:|---:|---:|---:|---|---:|
| 1 `down1` | +120 | 0 | 120 | +120 | 0 | false | 1 |
| 2 `down2` | +120 | 120 | 240 | +120 | 120 | false | 2 |
| 3 `up1` | −120 | 240 | 120 | −120 | 240 | false | 3 |
| 4 `swallowed` | +120 | 120 | 120 | **0** | 120 | **true** | 3 (unchanged) |
| 5 `released` | +120 | 120 | 240 | +120 | 120 | false | 4 |

`pageState.scrollEvents` = 4 while five wheel events were delivered: the
swallowed leg produced **no** scroll event, and the released leg restored
movement with the same +120 delta that the swallowed leg dropped. That
released leg is the positive control that makes the swallowed leg evidence
rather than an ambiguity (see §4).

## 2. The page-side recorder shape `[measured]`

The fixture page installs one capture-phase, non-passive `wheel` listener
(driver lines 157-164). Each of the five recorded entries carries: `type`
`"wheel"`; `seq` (the page's own counter, 1..5, strictly increasing and
unique); `ts` (the page's `event.timeStamp`); `deltaX` 0; `deltaY` as
dispatched (120, 120, −120, 120, 120); `deltaZ` 0; `deltaMode` 0;
`ctrlKey`/`shiftKey`/`altKey`/`metaKey` all false; `isTrusted` true;
`cancelable` true; `defaultPrevented` (false, false, false, **true**, false);
`targetId` `"tall"`; and `scrollYAtDispatch` (0, 120, 240, 120, 120) — the
scroll position read *inside* the handler.

Two page-side facts the counter also binds: the recorder's `defaultPrevented`
is the **post-dispatch** value of the same event (the handler calls
`preventDefault()` before recording when `window.__swallow` is set), and the
listener is registered `{ capture: true, passive: false }`, which is what lets
`preventDefault()` take effect at all.

`[sourced]` S166 (MDN WheelEvent, tier B/docs) grounds the *field semantics*
only: `deltaY` is documented as "a double representing the vertical scroll
amount" and `deltaMode` as "an unsigned long representing the unit of the
`delta*` values' scroll amount" (staged `.ufo/waves/round-63/sources/
s166b-mdn-wheelevent.html`, Instance-properties list, lines 1679-1689). It
grounds that a receipt records the event's own delta fields rather than
inferring them. It grounds nothing about `deltaMode 0` being pixels here, nor
`isTrusted`, nor `cancelable`, nor the scroll arithmetic — those are measured.

`[sourced]` S167 (CSSOM View, tier A/spec) grounds the *witness class* only:
`Element.scrollTop` is an `unrestricted double` whose getter "must return the
result of running these steps" (staged `.ufo/waves/round-63/sources/
s167-cssom-view.html`, §6 "Extensions to the Element Interface", IDL line
2977, getter steps line 3357). This page reads `window.scrollY`, not
`scrollTop`; the spec anchors the attribute class, not the accessor used.

## 3. The counter contract `[measured]`

The frozen counter re-derives, from the receipt's own fields
(`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs:28-55`): the schema and
the nonce binding (receipt nonce == page nonce); the driver digest binding; the
fixture template digest binding (re-derived from the driver source with the
receipt's own nonce substituted); the loopback origin and the `tall` target;
the four launch guards; the six named legs in order with the exact scroll
table and the exact wheellog-length table; the wheellog sequence (1..5,
strictly increasing, five distinct values); the deltaY passthrough
(120, 120, −120, 120, 120); `deltaX` = `deltaZ` = `deltaMode` = 0; the trusted
fields (`type`, `isTrusted`, finite non-negative `ts`, `cancelable`); the
cancelation pattern (`defaultPrevented` true on the swallowed leg only); the
target binding (`targetId` `"tall"` and the `scrollYAtDispatch` sequence
0, 120, 240, 120, 120); the scroll-event witness (an integer in 1..5); the four
step records bound to the four shot files on disk, each re-hashed from
`--shot` and required to carry the PNG signature and non-zero IHDR
dimensions; the server witness (`/` requested, and no path other than `/` and
`/favicon.ico`); the teardown closure (post-kill sweep 0, empty survivor
list, both ports `closed`, post-kill `curl` exit 7 on both); the launch
witness (pre-launch 0, mid-run > 0, post-kill 0); empty `failures`; the
producer verdict (`predicate` true **and** `wheelHypothesis` `CONFIRMED`); and
the final page state (240, 5).

- **Selftest: 22 cases, clean.** Re-run by this seat:
  `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` →
  exit 0, `verdict=clean cases=22 passed=22`
  (`receipts/scribe-counter-selftest.json`).
- **Ten declared negatives, each refused with exit 1 and its own finding.**
  Re-run by this seat on the freeze-commit set
  `.ufo/waves/round-63/controls/negatives/`: n1 and n2 →
  `['producer-verdict']` (the producer-verdict polarity in *both*
  directions), n3 → `['scroll-arithmetic']`, n4 → `['wheellog-sequence']`,
  n5 → `['delta-y-passthrough']`, n6 → `['cancelation']`, n7 →
  `['shot-bytes']`, n8 → `['survivors']`, n9 → `['nonce-binding']`, n10 →
  `['launch-guards']`. Each control is a one-field edit of the freeze-commit
  smoke receipt, so a refusal is attributable to that field.
- **Eight exact-line mutants, all distinguished, none surviving.** Re-run by
  this seat through the production CLI
  (`counters/mutate-r63.mjs run`, receipt
  `receipts/scribe-matrix-rerun.json`): exit 0, `pristineAcceptsLive` true,
  `pristineRefusesAll` true, `mutantCount` 8, `survived` `[]`,
  `allKilled` true. The distinguished map (mutant → the declared negative it
  false-greens, byte-identical to the freeze-commit matrix):

  | mutant | check | site (line, col) | false-greens |
  |---|---|---|---|
  | M1-producer-and-to-or | `producer-verdict` | 54, 9 | n1-lying-producer-true-refuted, n2-lying-producer-false-confirmed |
  | M2-drop-scroll-arithmetic | `scroll-arithmetic` | 37, 32 | n3-scroll-arithmetic |
  | M3-drop-sequence-uniqueness | `wheellog-sequence` | 40, 9 | n4-duplicate-seq |
  | M4-drop-delta-y | `delta-y-passthrough` | 41, 28 | n5-delta-y |
  | M5-drop-cancelation | `cancelation` | 44, 28 | n6-swallow-not-canceled |
  | M6-drop-shot-bytes | `shot-bytes` | 48, 3 | n7-fabricated-step-label |
  | M7-drop-teardown-survivors | `survivors` | 50, 9 | n8-teardown-survivor |
  | M8-drop-launch-guards | `launch-guards` | 33, 41 | n10-launch-guard |

  M1 is the class the r62 generation could not see: the AND→OR polarity flip
  at the producer-verdict line is caught by *both* polarity negatives, so it
  cannot false-green.

## 4. Why the swallowed leg needs its released twin `[measured]`

A page that calls `preventDefault()` on a wheel event still receives the
event (`cancelable: true`, `defaultPrevented: true`, `isTrusted: true`) but
the document does not move: the swallowed leg records the same `scrollY` (120)
with a fifth event in the log and no new scroll event. Alone that is
ambiguous — a dead listener, a broken wheel dispatch and a working swallow
all look like "no movement". The `released` leg clears the flag and dispatches
the same delta: `scrollY` returns to 240 and the event records
`defaultPrevented: false`. The negative is evidence only with that positive
control behind it. Both legs are in the same page, the same profile and the
same run.

## 5. Determinism on this build `[measured]`

Two independent cold runs by this seat — fresh scratch directories, fresh
throwaway profiles, fresh ports (19731/19732 and 19841/19842), nonces
`tabi-r63-scribe-one` and `tabi-r63-scribe-two` — produced identical `legs`,
identical `wheellog` after zeroing `ts`, identical `pageState`, and identical
sha256 for all four PNGs. The same holds between the two freeze-commit smoke
receipts and between them and this seat's runs: the four PNG digests are
`c8de49678abad8433a822370a92ab3b2b35ac53603d5122193f21d66fdd95b9a`
(a, b, c) and `1bc648c80b682620cf2eef31942be3e90ad1b928a2d09580bcf48ea7b7605ce0`
(d) — i.e. **two** distinct images, not four (see §6, Limits).

The fixture digest differs between runs by design: the page embeds the
invocation-bound nonce, so the counter re-substitutes the receipt's own nonce
before hashing the template.

## 6. Teardown and closure proof `[measured]`

Every run proves closure, not just a green exit: the pre-launch launch-token
sweep finds 0 processes, the mid-run sweep finds 13 (the launch is real), the
post-kill sweep finds 0 with an empty survivor list, `probePort` reports
`closed` for both the fixture port and the DevTools port, and a post-kill
`curl` to both ports exits 7 (connection refused). A run that leaves a
survivor, an open port or a curl exit other than 7 records a
`teardown-closure` failure and the counter refuses the receipt. The server
witness shows the fixture server saw exactly `/` and `/favicon.ico` — the
fixture page was fetched once and no third-party resource was requested.

## 7. Limits (declared, not hidden)

- **One browser, one build, one host.** Chromium 155.0.8059.84 on Arch Linux,
  headless (`--headless=new`). Not measured: any other browser, any other
  build, any other OS.
- **`--disable-smooth-scrolling` is on.** The exact ±120 arithmetic is a
  property of that launch flag. With smooth scrolling the same dispatch would
  not land on an integer pixel at settle time, and this note says nothing
  about that case.
- **No cross-browser claim.** Not measured: Firefox, WebKit, Edge, any
  non-Chromium engine.
- **No trackpad or momentum.** Only `mouseWheel` deltas were dispatched. Not
  measured: trackpad phases, inertial/momentum scrolling, wheel-speed
  acceleration, fractional deltas.
- **No horizontal scrolling.** The fixture scrolls vertically only; `deltaX`
  was 0 at every event and was never driven non-zero.
- **No ctrl+wheel zoom.** `ctrlKey` was false at every event; the browser's
  zoom-on-ctrl-wheel path was never exercised.
- **No `scrollend`.** The page observes `scroll` events only.
- **No scroll snapping, no real site, no pointer capture.** Not measured.
- **The receipt is not authenticated.** The counter validates internal
  consistency against the invocation-supplied driver pin; a caller who edits
  the driver *and* supplies the new digest is outside this note's boundary.
  This seat's own probes show exactly where that boundary bites: the counter
  does not re-derive the modifier booleans, the browser build string, the
  viewport, the scroll-event count, or the `declaredStepNames` list (see the
  report's findings).
- **The four shots carry two distinct images.** `a-wheel-down`,
  `b-wheel-up` and `c-swallow` are byte-identical (all three captures happen
  at `scrollY` 120); only `d-release` (at 240) differs. So the PNG witness
  distinguishes the released leg from the other three, and the *digests* of
  the other three are interchangeable on disk — the byte-identity is a
  property of the fixture, not an extra piece of evidence.
- **The page's own `scroll` count is a range, not a value.** The counter
  accepts 1..5 scroll events (`:46`) while the measured value is 4; the
  "the swallowed leg scrolled nothing" fact is therefore carried by the
  scroll-arithmetic and cancelation checks, not by the scroll-event counter.

## 8. Gate

Admitted into this draft: S166 scoped to delta-field semantics, S167 scoped to
the `Element.scrollTop` getter definition, the measured leg table and sink
arithmetic, the recorder shape, the counter contract (22/10/8), the closure
proof, and the limits above. Rejected as over-claims: any reading of S166 as
a pixel-unit or delivery guarantee, any reading of S167 as a cancelation or
smooth-scrolling authority, and the rejected candidate with its flip condition
in `gate-candidates.md` in this directory. Source-quote locations and the
admit/reject reasoning for both rows are in `sources-rows.md` in this
directory.

Proposed landing path (NOT written by this seat):
`corpus/knowledge/chromium-wheel-scroll-round-63.md`.
