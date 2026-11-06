source: S175 (Chromium 155.0.8059.84 content/common/input/synthetic_tap_gesture.cc, opened 2026-11-06), S174 (input_handler.cc lines 2252-2304 at the same tag), S173 (Input.pdl lines 318-330 at the same tag); runtime receipt corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json
verified-at: 2026-11-06, lane round 70, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, CDP protocol 1.3, loopback fixture, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <short ABS dir> --json (runs the pinned driver twice cold and checks both receipts and the committed one; exit 0 = still true on this host)

# Input.synthesizeTapGesture — measured runtime delivery (round 70)

What a page receives when a CDP client calls `Input.synthesizeTapGesture` on this host, and
which source line explains it. Before this round the lane held only the scroll and wheel input
surfaces (rounds 63-69); the tap command had no note, receipt or capability row.

## Measured (scored run, nonce `tabi-r70-scored-8a468fd6`, receipt sha256 0a51f3a6…d631)

Target: one 200×100 `<button>` at (100,100); every tap at (200,150).

| leg | params | page events in the leg (moves omitted) | click `detail` | press→release |
|---|---|---|---|---|
| mouse | `gestureSourceType:'mouse'` | pointerdown(mouse), mousedown, pointerup(mouse), mouseup, click | 1 | 49.9 ms |
| hold | `mouse, duration:400` | same five | 1 | 400.0 ms |
| double | `mouse, tapCount:2` | the five twice; **no `dblclick`** | 1, 1 | 50 ms each; 50 ms between taps |
| zero | `mouse, tapCount:0` | none; CDP answers success `{}` | — | — |
| default | no `gestureSourceType` | pointerdown(touch), touchstart, pointerup(touch), touchend; **no click** | — | 50 ms |
| touch | `gestureSourceType:'touch'` | same as default | — | 50.1 ms |
| outside | `x:5000` | none; CDP error `-32602 "Position out of bounds"` | — | — |

All events `isTrusted: true`, all on the button, all at clientX 200 / clientY 150. Three
pre-freeze smoke runs and two cold verifier runs (`.ufo/waves/round-70/controls/c1-receipts/`,
`.ufo/waves/round-70/scored/c1-verify-live-L1-run-{a,b}.json`) gave the same sequences.

## What this means for a driver

1. **Default duration is 50 ms and it is real time.** S174 input_handler.cc sets
   `kDefaultDuration = 50` (line 2265); the page sees pointerdown→pointerup 50 ms apart, and
   `duration:400` gives 400 ms. S175 holds the release in `WAITING_TO_RELEASE` until
   `timestamp - start_time_ >= GetDuration()` (lines 112-116); `duration:0` releases in the same
   step (lines 99-106).
2. **`tapCount:2` is not a double-click (plain mouse source, no touch emulation).** The PDL comment says "e.g. 2 for double tap"
   (S173 Input.pdl:326), but the page gets two separate clicks, each `detail:1`, and no
   `dblclick`. The handler queues one new `SyntheticTapGesture` per tap (S174 lines 2297-2304),
   and each gesture creates its own pointer driver on first use (S175 lines 51-53).
   [INFERENCE] The click count is not carried from one gesture to the next because the driver
   is new each time; the measured result (two `detail:1` clicks 50 ms apart) does not depend on
   that explanation. To get a real double-click, use `Input.dispatchMouseEvent` with
   `clickCount:2` on the second press: the round-70 control run with that producer produced
   `detail:2` and a `dblclick` (`.ufo/waves/round-70/controls/c1-receipts/degenerate-dispatch-mouse.json`).
   Scope limit (wave probe R70Exec3, `.ufo/waves/round-70/w1/R70Exec3/report.md`, 24 variants × 2
   passes): `tapCount:3` gives `[1,1,1]`; but with `Emulation.setEmitTouchEventsForMouse({enabled:true,
   configuration:'mobile'})` a mouse-source `tapCount:2` arrives as converted touch taps 116.7 ms
   apart and yields click details `[1,2]` and a `dblclick` — there the count follows tap timing.
3. **No `gestureSourceType` means touch, not "the platform default".** The PDL says the default
   "queries the platform for the preferred input type" (S173 Input.pdl:328-329). The tap
   gesture's constructor rewrites `kDefaultInput` to `kTouchInput` before that query runs
   (S175 lines 22-26), so the query at lines 41-43 never sees `kDefaultInput`. Measured: the
   default leg is identical to the explicit touch leg. (Scroll differs: the round-69 note shows
   a default-source scroll arriving as wheel events.)
4. **A synthetic touch tap does not click on this host.** Pointer and touch events arrive,
   `click` does not. A raw `Input.dispatchTouchEvent` start/end pair does produce a `click`
   (`degenerate-dispatch-mouse.json`, touch legs). So a test that needs a click must use the
   mouse source. R70Exec3 measured the same no-click result with touch emulation on, with
   `mobile:true` metrics, with both, with `duration:0` and with `tapCount` 1-3; a click came only
   from `Input.dispatchTouchEvent` or from a mouse-source tap converted by
   `setEmitTouchEventsForMouse`. Why the synthetic touch path produces no click is not
   established from source here.
5. **`gestureSourceType:'pen'` is refused**: CDP `-32602 "Unknown gestureSourceType"`, no page
   events (R70Exec3; S174 lines 2277-2282 send that error when the string does not map).
6. **`tapCount:0` succeeds with no input** (S174 lines 2285-2289: `if (!count)` sends success
   at once). A driver that checks only the CDP response cannot tell a zero-tap call from a real
   tap.
7. **Out-of-view coordinates fail loudly.** `x:5000` in a 1280-wide view returns
   `-32602 Position out of bounds` (S174 lines 2270-2273) and no event reaches the page.

## How to tell the gesture from a look-alike

A mouse tap through `Input.dispatchMouseEvent` press/release also yields trusted
pointer/mouse/click events, and on the `hold` leg its page events match the gesture's. Only
the CDP send log separates them. The counter therefore requires exactly seven
`Input.synthesizeTapGesture` calls with the frozen parameters and refuses any `Input.dispatch*`
send or any script `click()`/`dispatchEvent` (`scripts/check-synthtap-r70.mjs`,
`no-lookalike-producer`). The receipt counter is not an execution oracle: a replayed receipt
with a rewritten nonce passes it (`.ufo/waves/round-70/controls/c1/counter-accepts-rewrite.out`).
The live check is `scripts/verify-live-r70.mjs`, which draws the nonce and ports itself, runs
the pinned driver twice and refuses that replay.

## Host note — Chromium's singleton socket path

Chromium makes its singleton Unix socket at `$TMPDIR/org.chromium.Chromium.XXXXXX/SingletonSocket`.
The lane's drivers set `TMPDIR` to their scratch directory. When that path is longer than the
107-byte socket-path limit, Chromium stops with `FATAL … process_singleton_posix.cc:313] Socket
path too long` on stderr. Both the round-69 and the round-70 drivers then wait about 240 s for a
page target (a 1600 × 150 ms poll with no child-exit listener) before failing (`no loopback page
target`), observed in the round-70 control run before the verifier gained its scratch-length
guard. R70Exec4 measured the boundary: `TMPDIR` of 62 bytes works (socket 107 bytes), 63 bytes
fails in about 150 ms with SIGABRT (`.ufo/waves/round-70/w1/R70Exec4/report.md`) (lesson `corpus/lessons/round-70.md`, Mistakes). Keep scratch
paths short.

## Not established

- Why the synthetic touch path never clicks (measured, not explained from source).
- Any other Chromium version, headful mode, or a platform where the default source is mouse.
