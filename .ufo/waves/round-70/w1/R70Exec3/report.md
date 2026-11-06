BOUNDED

# R70Exec3 — tap variants: when a synthetic touch tap clicks, and whether `tapCount` can double-click

Seat R70Exec3, tabi round 70 w1. Scope: falsification probe of the round-70 tap knowledge beyond
the frozen legs — 24 variants, each in its own cold Chromium launch, run twice (48 runs total).
Frozen instruments (`scripts/chrome-cdp-synthtap-round70.mjs`, `scripts/check-synthtap-r70.mjs`,
the battery, `scripts/verify-live-r70.mjs`) and the scored receipt were read only; nothing under
`scripts/` or `corpus/` was edited; no predicate, counter, pin or kill rule is proposed for
amendment. All probe files live in this seat directory.

## Answer

**When does a synthetic touch tap produce `click`?** It is decided by the producer, not by device
capability:

| producer | touch events | `click` |
|---|---|---|
| `Input.synthesizeTapGesture`, `gestureSourceType:'touch'` (or absent) | yes | **never** — plain, touch emulation on, mobile metrics, both, duration 0, tapCount 1/2/3 |
| `Input.synthesizeTapGesture`, mouse source, with `Emulation.setEmitTouchEventsForMouse({enabled:true, configuration:'mobile'})` | yes (converted from mouse: `pointerType:touch`, touch pointer ids) | **yes**, one `detail:1` click per tap |
| `Input.dispatchTouchEvent` touchStart/touchEnd (browser-side injection, no emulation) | yes | **yes**, `detail:1` |

**Does `tapCount` ever yield `dblclick`?** Not through the tap command's own click counting:
mouse-source `tapCount:2` → click details `[1,1]`, `tapCount:3` → `[1,1,1]`, two separate mouse
calls 284–300 ms apart → `[1,1]`; all without `dblclick`, even with a `dblclick` listener on the
target. The exception is again the mouse→touch conversion path: `tapCount:2` under
`setEmitTouchEventsForMouse` yields click details `[1,2]` **and `dblclick`** (taps 116.7 ms
apart), and two converted calls 300.0 ms apart also double-click, while 566.6 ms and 700.1 ms
apart do not. In that path the click count is derived from tap timing, not from `tapCount`.

`gestureSourceType:'pen'` is refused by the handler: CDP `-32602 "Unknown gestureSourceType"`,
zero page events.

No frozen claim is contradicted; the frozen `touch` leg (no click) reproduced in every
touch-source variant. The knowledge note's sentence "`tapCount:2` is not a double-click"
(`corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md`, item 2) is true for the
plain mouse source and **false under `setEmitTouchEventsForMouse`** — a scope limit of that
sentence, not of the scored receipt. Its "Not established" item (touch emulation / mobile
metrics) is now measured for this host/version.

## Instruments (pinned, read-only)

| item | value |
|---|---|
| chromium binary | `/usr/bin/chromium` ELF, `Chromium 155.0.8059.84 Arch Linux`, sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` |
| staged S175 | `.ufo/waves/round-70/sources/synthetic_tap_gesture.cc`, sha256 `ac27658fe7199e01f210bbfb29613ab99a7720fe8e2ecdb100b1a2d3672bd331` |
| staged S174 | `.ufo/waves/round-69/sources/input_handler.cc`, sha256 `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` |
| staged S173 | `.ufo/waves/round-68/sources/Input.pdl` (336 lines), sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` |
| probe | `probe-tap-variants-r70.mjs`, sha256 `a222d43f6a694df8830cbeab69c66cf9ffdbd587ffcee78c89c71bb0a79d7bf7` (self-sha recorded in every pass-2 receipt) |
| summarizer | `summarize-variants-r70.py`, sha256 `10e597069caa03de604e393e391c59bdb7227b95a1ab948c4eb3e4905754a7ad` |
| pass compare | `compare-passes-r70.py` |

The probe copies the launch/teardown pattern of the frozen driver (fresh per-run `HOME`/XDG,
launch-token process sweep, `--headless=new`, `--window-size=1280,900`,
`--force-device-scale-factor=1`, loopback HTTP fixture, loopback CDP, port pre-probe, teardown
closure proof via `ps` sweep + port probes + `curl` exit 7). It never imports or edits the lane
driver.

## Fixture and method

One page at `http://127.0.0.1:<http-port>/?run=<nonce>`: `<button id=btn>` 200×100 at (100,100)
and `<button id=dbl>` 200×100 at (100,300) with its own `dblclick` listener; a document capture
listener records every `pointer*/mouse*/click/dblclick/touch*` event with `type, seq, leg,
timeStamp, performance.now(), pointerType, pointerId, isPrimary, isTrusted, detail, button,
buttons, clientX/Y, target, defaultPrevented, sourceCapabilities.firesTouchEvents,
touches/changedTouches`. `navigator.maxTouchPoints`, `ontouchstart`, pointer/hover media queries,
`innerWidth/Height`, `devicePixelRatio` and `visualViewport.scale` are snapshotted before and
after the emulation prelude. One variant per browser launch; every CDP request/response is
logged; nonce is re-read from the page and required to match.

Chromium flags are the frozen driver's; scratch `TMPDIR` and profile live under
`/fast/scratch/hyaku/tabi-r70/R70Exec3/s2-<n>` (short enough for the 107-byte singleton-socket
path; the probe refuses scratch paths over 64 chars). Ports per pass-2 run: HTTP 44101–44124,
CDP 44601–44624, all pre-probed free.

All 24 pass-2 receipts: `infraOk:true`, no failures, teardown `postKillSweepCount:0`, port
probes `closed/closed`, post-kill `curl` exit 7/7, page nonce match, `Chrome/155.0.8059.84`,
CDP protocol 1.3.

## Assigned variants (1)–(6)

Sequences omit `pointermove/mousemove/touchmove`; timings are page `e.timeStamp` deltas.

| # | variant | condition | page sequence | clicks (detail) | dblclick | CDP result/error |
|---|---|---|---|---|---|---|
| 1 | `tap3-mouse` | mouse, `tapCount:3` | `[pointerdown(mouse), mousedown, pointerup(mouse), mouseup, click(mouse)]` ×3 | `[1,1,1]` | 0 | `{}` |
| 2 | `duration0-mouse` | mouse, `duration:0` | the five events, **all with the same `timeStamp`** (press→release 0.0 ms; handler wall delta 0.3–0.5 ms) | `[1]` | 0 | `{}` |
| 3 | `touch-emul-on` | `Emulation.setTouchEmulationEnabled{enabled:true,maxTouchPoints:5}` then touch | `pointerdown(touch), touchstart, pointerup(touch), touchend` | `[]` | 0 | `{}` |
| 3b | `touch-emul-both-touch` | touch emulation **and** `setEmitTouchEventsForMouse` then touch | same four touch events | `[]` | 0 | `{}` |
| 3c | `emit-touch-mouse` | `setEmitTouchEventsForMouse{enabled:true,configuration:'mobile'}` then **mouse** source | `pointerdown(touch), touchstart, pointerup(touch), touchend, mousemove, mousedown, mouseup, click(touch)` | `[1]` | 0 | `{}` |
| 4 | `touch-emul-mobile` | touch emulation + `Emulation.setDeviceMetricsOverride{mobile:true,...}` then touch | four touch events (`pointerCoarse:true`, `innerWidth 1280`, `vvScale 1`) | `[]` | 0 | `{}` |
| 5 | `dblclick-listener` | mouse, `tapCount:2`, target `#dbl` with its own listener | the five ×2, taps 83.3 ms apart (`#dbl`) | `[1,1]` | **0** (listener count 0) | `{}` |
| 6 | `pen` | `gestureSourceType:'pen'` | none | `[]` | 0 | **`-32602 Unknown gestureSourceType`** (op 1–2 ms, no page event) |

Emulation snapshots: `touch-emul-on` → `maxTouchPoints:5`, `(any-pointer: coarse)` true,
`ontouchstart` still false; `touch-emul-mobile` → additionally `(pointer: coarse)` true,
`innerWidth/Height 1280/900`, `visualViewport.scale 1`, so the tap coordinates are not rescaled;
`emit-touch-mouse` → `maxTouchPoints:0` **(no touch emulation)** yet the page receives
`pointerType:'touch'` events: the conversion is not device capability.

## Every variant, pass 2 (both passes agree; see compare-passes.txt)

| variant | precondition | seq | clicks | dblclick | down→down gaps (ms) | CDP |
|---|---|---|---|---|---|---|
| `tap3-mouse` | — | 15 | `[1,1,1]` | 0 | 83.3, 100.3 | `{}` |
| `duration0-mouse` | — | 5 | `[1]` | 0 | — | `{}` |
| `touch-emul-on` | touch emul | 4 | `[]` | 0 | — | `{}` |
| `touch-emul-mobile` | touch emul + mobile | 4 | `[]` | 0 | — | `{}` |
| `touch-emul-both-touch` | touch emul + emit-mouse | 4 | `[]` | 0 | — | `{}` |
| `dblclick-listener` | — | 10 | `[1,1]` | 0 | 83.3 | `{}` |
| `pen` | — | 0 | `[]` | 0 | — | `-32602 Unknown gestureSourceType` |
| `tap3-touch` | — | 12 | `[]` | 0 | 116.7, 100.0 | `{}` |
| `touch-tapcount2` | — | 8 | `[]` | 0 | 117.0 | `{}` |
| `touch-emul-tapcount2` | touch emul | 8 | `[]` | 0 | 100.1 | `{}` |
| `duration0-touch` | — | 4 | `[]` | 0 | — | `{}` |
| `emit-touch-mouse` | emit-mouse | 7 | `[1]` | 0 | — | `{}` |
| `emit-touch-mouse-duration0` | emit-mouse | 7 | `[1]` (ts delta 0.0 ms) | 0 | — | `{}` |
| `emit-touch-mouse-touch` | emit-mouse | 4 | `[]` | 0 | — | `{}` |
| `emit-touch-mouse-tapcount2` | emit-mouse | 15 | `[1,2]` | **1** | 116.7 | `{}` |
| `emit-touch-mouse-two-calls-200` | emit-mouse, 2 calls | 15 | `[1,2]` | **1** | 300.0 | `{}` ×2 |
| `emit-touch-mouse-two-calls-450` | emit-mouse, 2 calls | 14 | `[1,1]` | 0 | 566.6 | `{}` ×2 |
| `emit-touch-mouse-two-calls-600` | emit-mouse, 2 calls | 14 | `[1,1]` | 0 | 700.1 | `{}` ×2 |
| `mouse-two-calls-200` | — | 10 | `[1,1]` | 0 | 284.2 | `{}` ×2 |
| `touch-emul-mouse-tap` | touch emul | 5 | `[1]` | 0 | — | `{}` |
| `control-dispatch-clickcount2` | — | 11 | `[1,2]` | **1** | 64.2 | 4× `dispatchMouseEvent` `{}` |
| `control-dispatch-clickcount1-twice` | — | 10 | `[1,1]` | 0 | 64.5 | 4× `dispatchMouseEvent` `{}` |
| `control-dispatch-touch-tap` | — | 7 | `[1]` | 0 | — | 2× `dispatchTouchEvent` `{}` |
| `dispatch-touch-tap-emul` | touch emul | 7 | `[1]` | 0 | — | 2× `dispatchTouchEvent` `{}` |

Raw compat signature (converted and dispatchTouchEvent paths): at `touchend` the page gets
`mousemove, mousedown, mouseup, click` with `firesTouchEvents:true`; `mousedown/mouseup` are
plain `MouseEvent`s (no `pointerType`), `click` is a `PointerEvent` with
`pointerType:'touch'`, `pointerId` = the touch pointer id (2, 3, …), `isPrimary:false`;
`dblclick` is a plain `MouseEvent` with `detail:2`. No `pointerdown(mouse)` precedes them.
`emit-touch-mouse-tapcount2` raw detail sequence: `mousedown:1, click:1, mousedown:2,
click:2, dblclick:2`.

## Controls that make the negatives interpretable

1. **The fixture sees `dblclick`.** `control-dispatch-clickcount2` (two CDP mouse press/release
   pairs on `#dbl`, second press `clickCount:2`, 64.2 ms apart) → click details `[1,2]`,
   `dblclick:1`, the page's own listener count 1. So "no dblclick" in the failed variants is
   not a fixture defect.
2. **Mouse click detail comes from the injected clickCount, not from timing.**
   `control-dispatch-clickcount1-twice` (two `clickCount:1` pairs 64.5 ms apart, same target)
   → `[1,1]`, no `dblclick`. The synth mouse driver injects `clickCount:1` per tap, which is
   why `tapCount` cannot accumulate a double-click even at 83–100 ms spacing; the converted
   path differs because it re-enters the touch compat path, where timing *is* the input.
3. **A touch sequence can click on this host.** `control-dispatch-touch-tap`
   (`Input.dispatchTouchEvent` start/end, no emulation) → `click(touch)` detail 1, with the
   compat mouse events. So the missing click for the tap command's touch source is not the
   element, the CSS (`touch-action: manipulation`), the coordinates, or "headless cannot click
   from touch" — it is the synthetic tap driver's own touch events.
4. **A finer bound on the compat double-tap window.** Converted taps: 116.7 ms and 300.0 ms
   apart double-click; 566.6 ms and 700.1 ms apart do not (two passes each). The window lies
   between ~300 and ~567 ms on this host; the probe does not resolve the exact threshold.

## Source mapping (staged lines only)

- `duration:0` releases on the same dispatch tick: S175 `synthetic_tap_gesture.cc:99-106`
  dispatches press then release at the same `timestamp`. Measured: every one of the five
  events in `duration0-mouse` carries the same `e.timeStamp` (0.0 ms delta), yet the `click`
  is still produced. Touch `duration:0` likewise has a 0.0 ms press→release and still no click.
- Default duration 50 ms: S174 `input_handler.cc:2265` (`kDefaultDuration = 50`), release at
  `start_time_ + GetDuration()` S175:112-116. Measured 49.9–50.1 ms in every 50 ms leg.
- One gesture per tap: S174:2297-2304 queues `count` independent `SyntheticTapGesture`s;
  S175:51-53 creates a new pointer driver on first use. [INFERENCE] This is why the click count
  is not carried; the measured `[1,1]` / `[1,1,1]` does not depend on the explanation.
- Only touch and mouse are implemented: S175:65-66 returns
  `GESTURE_SOURCE_TYPE_NOT_IMPLEMENTED` otherwise. `pen` never reaches that check: the handler
  parser accepts only default/touch/mouse (S174:71-90) and the command fails at S174:2277-2282
  with `InvalidParams("Unknown gestureSourceType")`; the protocol enum is
  `default|touch|mouse` (S173:35-39). Measured error text matches exactly (`-32602`, 1 ms, no
  event). The CDP parser passes unknown enum strings through; the handler is the gate.
- Default source is touch (S175:22-26) — not re-derived here beyond the explicit `touch` legs;
  the frozen `default` leg already covers it.
- `Emulation.setEmitTouchEventsForMouse` is an Emulation-domain setting, not in the staged
  sources. The measured effect is unambiguous (mouse-source tap → `pointerType:touch` events
  with `maxTouchPoints:0` → compat mouse events → click; `tapCount:2` → `[1,2]` + `dblclick`);
  the mechanism (renderer/Blink touch→compat-mouse synthesis with timing-derived click count)
  is [INFERENCE] from the event shape, not read from a staged line.

## What this falsifies and what survives

- **Survives, reproduced twice**: the frozen touch leg's shape (four touch events, no click) in
  all touch-source variants; the frozen `tapCount:2` behaviour for the plain mouse source
  (`[1,1]`, no `dblclick`); the PDL/`tapCount` mismatch is real (the command loops, it does not
  send a double-click clickCount).
- **Bounded, not amended**: "a synthetic touch tap does not click" holds only for the tap
  command's touch source. A synthetic tap that clicks exists (`dispatchTouchEvent`; and the
  converted mouse path), so any driver rule of the form "touch producers cannot click" is
  false; the correct rule names the producer/path.
- **Falsified as stated**: "`tapCount:2` is not a double-click" fails under
  `setEmitTouchEventsForMouse`, where `tapCount:2` produces `[1,2]` + `dblclick`; the converted
  path's click count is timing-derived, so `tapCount` is not even the relevant input there.
- **Newly established** (the note listed it as unknown): touch emulation and mobile metrics do
  not change the tap command's touch delivery or its missing click; `ontouchstart` stays false
  while `maxTouchPoints`/media queries change.
- **Still open**: why the synthetic touch driver's events skip the click/compat path. The probe
  narrows it to the event injection itself — same element, same coordinates, same host, and
  devtools-injected touch via `dispatchTouchEvent` does click — but the staged sources do not
  contain the pointer-driver/Blink code, so the internal reason is not established here.

## Limits

- One host, one Chromium build (`155.0.8059.84 Arch Linux`), headless only, one 1280×900 page,
  two button elements, no real touchscreen, `deviceScaleFactor 1`, no scrollbars.
- Emulation variants use `configuration:'mobile'` for `setEmitTouchEventsForMouse` and
  `maxTouchPoints:5`; other configurations were not measured.
- Double-tap window bracketed, not resolved (300.0 ms fires, 566.6 ms does not).
- Timing fields differ between passes only within scheduler jitter (press→release ≤ 2.5 ms,
  tap gaps ≤ 17 %); all semantic fields are identical for all 24 variants
  (`compare-passes-r70.py` exit 0: `semantic_or_tolerance_diffs=0`).
- The first pass (`receipts/`) grew variants while running and therefore has mixed
  `probeSha256` values; the second pass (`receipts2/`, all `a222d43f…`) is the primary
  evidence and the two passes agree on every semantic field.

## Reproduction

Pass-2 command shape (one cold browser per variant; ports must be free, scratch must be short):

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
P=.ufo/waves/round-70/w1/R70Exec3
node $P/probe-tap-variants-r70.mjs --list
TMPDIR=/fast/scratch/hyaku/tabi-r70/R70Exec3 \
node $P/probe-tap-variants-r70.mjs --variant touch-emul-mobile \
  --scratch /fast/scratch/hyaku/tabi-r70/R70Exec3/s2-4 \
  --out $P/receipts2/touch-emul-mobile.json --http-port 44104 --cdp-port 44604
python3 $P/summarize-variants-r70.py $P/receipts2/*.json
python3 $P/compare-passes-r70.py
```

The full pass-2 loop used `i=1..24`, HTTP `44100+i`, CDP `44600+i`, scratch `s2-$i`, in the
variant order of `--list` (which matches the table above). Exit codes: pass-2 all 24 × 0
(`infraOk`), `compare-passes-r70.py` 0.

## Evidence inventory (pass-2 receipts, all `infraOk:true`)

| receipt | sha256 |
|---|---|
| `tap3-mouse.json` | `35b19be1b837fdbb13ce4bdd4b9031564247063ce3a3fe0c72739a46ba543a5e` |
| `duration0-mouse.json` | `aba997c8ee566e45c5c32c21b70d23df4e41fd276ff0bb467502624d60282095` |
| `duration0-touch.json` | `af0ccdead26ad7ce46172dd4bbe2e2c95aef7d5dcfe9632160cb4f4d4e113583` |
| `touch-emul-on.json` | `929727edba9bdcccfa439107d7a6f2851a05dfdcef2be2ad457f8dfd0e049479` |
| `touch-emul-mobile.json` | `967d0792442d6fb7af5f06baffe4064dca8b813e1cff78780fb0f9fa15c73b21` |
| `touch-emul-both-touch.json` | `a123f2d4931cddaf24317b64ee1781d8aab3031d0b85a94b450a12d38396bf03` |
| `touch-emul-mouse-tap.json` | `004eef50cc3a4e929f98c794853f6d67726ae946a8327ebde3f8270e91eff358` |
| `dblclick-listener.json` | `276f2148beb7fa11342c92f52828846dce7d64bb4bb4f56e370bc704d5feb8f6` |
| `pen.json` | `28aeedb36a013608688c705135afa2b5d8f8f6ab632ffe41d9b85ae09a64e989` |
| `tap3-touch.json` | `9b2fe5b1407895bb672248d63d2eddd0a1862865e3b0d282660f58b33dfb5075` |
| `touch-tapcount2.json` | `e2e77dd71dce307e8b5b6f68cbbf269c732fcbc0f29192e7314a99267f583bae` |
| `touch-emul-tapcount2.json` | `bb319181c6951038318affef02b03cb3bbb8bcc0670e276391182c7c1fd29de9` |
| `emit-touch-mouse.json` | `1bed34e3278e49d05d57c5b757740ea1e800059bc6b8776622304916fc562e8b` |
| `emit-touch-mouse-duration0.json` | `0993e387d179ca7577e37aef776da0e46b0cb52a7ad587388f903999ca048ed3` |
| `emit-touch-mouse-touch.json` | `70dbbff22b517b1a822a76f9eb8bec8304ebef6b95385924fa3bf4ae9f70a9e9` |
| `emit-touch-mouse-tapcount2.json` | `3282385512f9033d3f1776297e4499e6929b6bd4932f768b962b5026c9cfb59e` |
| `emit-touch-mouse-two-calls-200.json` | `f915eb3c1ba5980c2b23390c38a79ec50924617df8817e57d1d8a9673f4d0299` |
| `emit-touch-mouse-two-calls-450.json` | `864a3bd54eb993d8dc14b1855862063a7a66c173bbc384902b0cf842af315e0a` |
| `emit-touch-mouse-two-calls-600.json` | `28d5d4bad02f02eed240fa5818566a9e77c5a2bd31fc57ef4d9c57181caa6050` |
| `mouse-two-calls-200.json` | `d0180cf4a5c7e13fed6ee3ab8567396abff89481694ab119e3966c7be87b8c32` |
| `control-dispatch-clickcount2.json` | `d583b4615c27d325dfa138198bcc4ad3d2af0e9d7fae82e5db0c1375790b844c` |
| `control-dispatch-clickcount1-twice.json` | `8d10f267523c7cfc0914ba93665d0693f0db84ce5cf3751fe5ca00d1e55ee91c` |
| `control-dispatch-touch-tap.json` | `362760d0ceb1eb5fdb00467f6df960af03df03076b31e26ffe502011d989f909` |
| `dispatch-touch-tap-emul.json` | `3044da65c8e533eeb92df1b16f1f283690de2d769c352011ed97779f8d312612` |

Also in this directory: `receipts/` (pass 1, 24 receipts, mixed probe hashes),
`summary-pass1.txt/.json`, `summary-pass2.txt/.json`, `compare-passes.txt` (exit 0, 24/24
semantic agreement), `run-logs/`, `run-logs2/` (per-run stdout), `probe-tap-variants-r70.mjs`,
`summarize-variants-r70.py`, `compare-passes-r70.py`.

## Cleanup

Scratch `/fast/scratch/hyaku/tabi-r70/R70Exec3/` is deleted after the receipts were copied into
this directory; no process outlives the runs (teardown closure proven per receipt). No
production, lane-root, fleet, `scripts/` or `corpus/` file was created, edited or deleted.
