---
source: S166, S167
verified-at: 816592612dd2a8073437c595d3fe3c477125cf3c
recheck: node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs corpus/evidence/round63/chromium-wheel-scroll/receipt.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot corpus/evidence/round63/chromium-wheel-scroll --json
---

# The wheel/scroll interaction domain on the Linux Chromium surface (round 63)

Round-63 capability `chromium-wheel-scroll-domain-linux`. This note is written
from committed bytes only: the driver
`scripts/chrome-cdp-loopback-round63.mjs` (sha256 `b00efd59…a0d6c040`), the
scored receipt `corpus/evidence/round63/chromium-wheel-scroll/receipt.json`,
its cold-run twin under `stability/`, and the frozen counter
`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` (sha256 `08470569…`).
Observation / inference / unknown stay separate; `[measured]` marks a value
taken from the receipt, `[sourced]` a value grounded in a registry row.

## §0 As-of table (one command per row)

| Quantity | Value | Where |
|---|---|---|
| host browser | Chromium 155.0.8059.84 Arch Linux | `receipt.json` `host.chromium` |
| launch argv | headless=new, remote debugging bound to 127.0.0.1, throwaway `--user-data-dir` under scratch, `--disable-extensions`, `--disable-smooth-scrolling` | `receipt.json` `host.argv` |
| scroll legs | 6 (`start`, `down1`, `down2`, `up1`, `swallowed`, `released`) | `receipt.json` `legs` |
| wheel events | 5, shared page sequence 1–5 | `receipt.json` `wheellog` |
| counter verdict | predicate true, 0 findings | `node …/chromium-wheel-r63.mjs … --json` exit 0 |
| cold-run stability | shape equal, 4/4 PNG sha256 identical | `.ufo/waves/round-63/controls/stability-data.json` |

## §1 The measured model — five wheel events, exact scroll arithmetic `[measured]`

One `Input.dispatchMouseEvent` of type `mouseWheel` with `deltaY: 120` at the
viewport point (200, 300) over a 3000 px document moves `window.scrollY` by
exactly +120 on this build. The six recorded legs:

| leg | dispatched deltaY | scrollY after settle | wheellog length | event defaultPrevented |
|---|---:|---:|---:|---|
| `start` | — | 0 | 0 | — |
| `down1` | +120 | 120 | 1 | false |
| `down2` | +120 | 240 | 2 | false |
| `up1` | −120 | 120 | 3 | false |
| `swallowed` | +120 | **120 (unchanged)** | 4 | **true** |
| `released` | +120 | 240 | 5 | false |

The arithmetic is exact, not approximate, because the launch carries
`--disable-smooth-scrolling`: the settle loop (three stable reads 40 ms apart)
returns the same value the wheel produced. `pageState.scrollEvents` = 4 — one
scroll event per wheel that actually scrolled; the swallowed leg produced none.

## §2 The event record shape `[measured]`

Each recorded wheel entry carries: `type: "wheel"`, `seq` (the page's own
monotonic counter, strictly increasing and unique), `ts` (page `timeStamp`),
`deltaX: 0`, `deltaY` as dispatched, `deltaZ: 0`, `deltaMode: 0`,
`ctrlKey/shiftKey/altKey/metaKey: false`, `isTrusted: true`, `cancelable: true`,
`defaultPrevented`, `targetId: "tall"`, and `scrollYAtDispatch` (the scroll
position read inside the handler: 0, 120, 240, 120, 120). The handler is
registered capture-phase with `passive: false`; it calls `preventDefault()` only
while `window.__swallow` is set and then records, so the recorded
`defaultPrevented` is the post-dispatch value of the same event.

`[sourced]` S166 grounds the property semantics only: MDN WheelEvent documents
`deltaY` as "a double representing the vertical scroll amount" and `deltaMode`
as the unit of the delta values. It does not ground the pixel identity of
`deltaMode 0` here, `isTrusted`, `cancelable` or the scroll arithmetic — those
are measured. S167 grounds the witness name: CSSOM View defines the `scrollTop`
attribute getter; this page reads `window.scrollY` (the same scroll position on
the document's scrolling element), so the spec anchors the attribute class, not
the exact accessor used.

## §3 The counter contract `[measured]`

The frozen counter re-derives, from the receipt's own fields:

- legs-shape and the exact arithmetic table of §1 (six named legs, exact values);
- wheellog-count 5, sequence 1–5 strictly increasing with 5 distinct values
  (a contradictory duplicate key is refused);
- deltaY passthrough, `deltaX = deltaZ = 0`, `deltaMode = 0`;
- trusted fields (`isTrusted`, finite `ts`, `cancelable`);
- cancelation pattern (`defaultPrevented` true only on the swallowed leg) and
  target binding (`targetId "tall"`, `scrollYAtDispatch` sequence);
- scroll-event witness (`scrollEvents` in 1..5);
- step records bound to the shot directory: each `steps[i].sha256`/`bytes` must
  match the bytes on disk and the PNG signature and IHDR dimensions must be
  non-zero (a fabricated step label is refused);
- server witness (`/` requested, only `/` and `/favicon.ico` in the log);
- teardown closure (post-kill sweep 0, no survivors, both ports closed, curl
  exit 7 on both), launch witness (pre-launch 0, mid-run > 0, post-kill 0);
- empty `failures`, the producer verdict, and the final page state (240, 5).

Selftest: 22 cases, `verdict=clean`. Declared negatives: ten, each refused with
exit 1 (`.ufo/waves/round-63/controls/negatives-data/`), including BOTH
producer-verdict polarities (`predicate true` with `wheelHypothesis REFUTED`,
and the reverse), a contradictory duplicate `seq`, and a fabricated step label.
Eight exact-line mutants are all distinguished through the production CLI
(`controls/mutation/matrix-data.json`): each accepts the live receipt and
false-greens at least one declared negative the pristine bytes refuse.

## §4 Why the swallowed leg needs its released twin `[measured]`

A page that calls `preventDefault()` on wheel still receives the event
(`cancelable: true`, `defaultPrevented: true`) but the document does not move:
the swallowed leg records the same `scrollY` (120) with a fifth event in the
log. Alone that is ambiguous — a dead listener, a broken wheel dispatch and a
working swallow all look like "no movement". The `released` leg clears the flag
and dispatches the same delta: `scrollY` returns to 240 and the event records
`defaultPrevented: false`. The negative is only evidence with that positive
control behind it.

## §5 Determinism on this build `[measured]`

Two independent cold runs (fresh profiles, scratch dirs and ports; nonces
`tabi-r63-data-one` / `tabi-r63-data-two`) produced identical `legs`, identical
`wheellog` after zeroing `ts`, identical `pageState`, and identical sha256 for
all four PNGs (a/b/c share one hash inside a run because the visible viewport is
unchanged between 120 and 240; `d-release` is the only differing image).
`.ufo/waves/round-63/controls/stability-data.json` carries the comparison and
the exact hashes. The fixture sha256 differs between runs by design: the page
embeds the invocation-bound nonce, so the counter re-substitutes the receipt's
own nonce before hashing the template.

## §6 Closure proof `[measured]`

Every run proves closure, not just exit: pre-launch token sweep 0, mid-run
sweep > 0 (the launch is real), post-kill sweep 0 with an empty survivor list,
`probePort` `closed` on both the fixture and the DevTools ports, and a
post-kill `curl` exit 7 on both ports. A run that leaves a survivor, an open
port, or a curl exit other than 7 records a `teardown-closure` failure and the
counter refuses the receipt.

## §7 Decision table — which surface for which question

| Question | Use | Why |
|---|---|---|
| Does a wheel event reach the page with the dispatched delta? | this driver, `wheellog` fields | page-side recorder, `isTrusted` true |
| Did the page act on the wheel? | `scrollY` before/after with `--disable-smooth-scrolling` | exact arithmetic, no animation |
| Did the page cancel the default action? | swallowed leg + released leg pair | event still delivered; movement suppressed; positive control |
| Is a receipt's after-state re-derivable? | frozen counter, `--shot` re-hash | ten negatives + eight exact-line mutants |
| Is the evidence reproducible? | `compare-stability-r63.mjs` over two cold receipts | shape + PNG byte equality |

## §8 Limits (declared, not hidden)

One browser build (155.0.8059.84) on one host, with `--disable-smooth-scrolling`;
no cross-browser claim, no trackpad/momentum phases, no horizontal scrolling, no
ctrl+wheel zoom, no `scrollend`, no third-party site, no pointer-capture or
scroll-snap interaction. The **fixture origin is loopback only**, but the run is
**not egress-isolated**: the sentinel measured the browser's NetworkService
holding short-lived TCP connections to four non-loopback IPv6 peers in both runs
(within the first second; the fixture server logged only `/` and `/favicon.ico`
from 127.0.0.1), consistent with the lane's round-2 note that loopback is not
no-egress. The profile/scratch guard is lexical (an ancestor symlink would pass
it), and only `HOME`/`XDG_CONFIG_HOME`/`TMPDIR` are redirected — `XDG_CACHE_HOME`,
`XDG_DATA_HOME`, `XDG_STATE_HOME` and `XDG_RUNTIME_DIR` still point at the
operator's directories (no write outside the scratch was confirmed). The counter
validates internal consistency against the invocation-supplied driver pin; it
does not authenticate the receipt — a caller that edits the driver AND supplies
the new digest is outside this claim's boundary (the receipt is unsigned).
`deltaMode 0` is observed, not proven stable across builds.

## §9 History

- 2026-11-04, round 63: first admission attempt for the wheel/scroll domain.
  The pre-freeze probe (`.ufo/waves/round-63/probe/wheel-probe.mjs`) measured the
  three-run determinism that sized the predicate. The frozen predicate verifies,
  but the round's do-nothing standard does not: a hand-written receipt with four
  1×1 PNGs reaches the same target, so **no capability row enters** (the
  knowledge stands on its measured content; the repertoire move waits for a
  receipt bound to the run). See `corpus/lessons/round-63.md` W1.
