source: S161 (W3C UI Events, https://www.w3.org/TR/uievents/ — §4.3.4 "Default actions and cancelable keyboard events", raw line 5680; §3.5.6.1 keydown, raw 3751–3752 and 3809–3810), S153 (Chrome DevTools Protocol browser_protocol.json, Input.dispatchKeyEvent `modifiers`, raw line 14323), S083 (HTML implicit submission, §4.10.22.2 — already registered, cited for the submit leg only); live witness = corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json
verified-at: 2026-11-03, lane commit 34dc6b9b (C2 live run nonce tabi-r58-75b513ebbf9f, driver sha256 9935ed98…, counter .ufo/waves/round-58/counters/chromium-receipt-r58.mjs sha256 632e62e4…)
recheck: `node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --expect-driver-sha256 9935ed9862af0f5e7ff1d5400790ab9a14d6966e6f5cc713280af6108bd1d324 --shot corpus/evidence/round58/chromium-preventdefault-swallow --json` → exit 0, predicate true; plus the re-fetch and located-quote check in the round-58 lesson `## Gate`

# Chromium: a page's keydown swallower (preventDefault) and what the page records

Round 58 capability `chromium-keyevent-preventdefault-swallow-linux`. Question: when a page
cancels a keydown with `preventDefault()`, what does the keystroke do, and can the page's own
record and the driver's recorded block both witness it? Scope: the Linux host's Chromium 155
headless surface, loopback fixture, throwaway profile. Not a claim about any real site.

## Grounding (what the sources say, located and byte-checked)

- **Default-action cancelation (S161, §4.3.4, raw line 5680).** "Canceling the default action of a
  keydown event MUST NOT affect its respective keyup event." The keydown's cancelation is what
  decides whether the default action runs. This is the normative line the swallow leg rests on.
- **Cancelable keydown (S161, §3.5.6.1, raw 3751–3752).** The keydown event definition carries
  `Cancelable` / `Yes`, so a page-side `cancelable` boolean is spec-defined for keydown.
- **Cancel stops the action (S161, §3.5.6.1, raw 3809–3810).** "If this event is canceled, the
  associated event types MUST NOT be dispatched, and the associated actions MUST NOT be performed."
- **Enter default action (S161, §3.5.6.1, raw 3803–3807).** The Enter key default action MUST be to
  dispatch a click event. Its implicit form-submission half is HTML's (S083 §4.10.22.2), not UI
  Events'.
- **Modifier bits (S153, Input.dispatchKeyEvent `modifiers`, raw 14323).** "Bit field representing
  pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8." The chord leg sends Control+Enter as
  modifiers 2.

**What S161 does NOT define.** `defaultPrevented` and `preventDefault()` are *not* defined in UI
Events. They appear there as cross-references to the DOM Standard (`dom.spec.whatwg.org`). The
round-58 scout's receipt records their definition locus as EXTERNAL (raw line 2064 is a list item
linking out; the glossary at raw 7420–7422 ties cancelation to `preventDefault()` by reference).
Read S161 for the cancelation *semantics*; read the DOM Standard for the method and attribute.
The frozen round-58 claim wording ("S161 … the cancelable/defaultPrevented ground") overstated
this; the lesson's `## Gate` records the correction.

## What the Linux Chromium 155 surface does (measured, not inferred)

Live receipt `corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json`, one run,
the frozen driver, nonce `tabi-r58-75b513ebbf9f`:

| step | page-side witness (the page's own keylog) | driver-recorded block |
|---|---|---|
| control: digits `7`,`5` into #field3, swallow OFF | keyDown cancelable true, defaultPrevented false; value `75` | valueAfter `75`, defaultPrevented false |
| Backspace, swallow ON | keyDown Backspace cancelable true, **defaultPrevented true**; value unchanged `75` | valueBefore=valueAfter `75`, defaultPrevented true |
| digit `b`, swallow ON | keyDown `b` cancelable true, **defaultPrevented true**; value unchanged `75` | valueBefore=valueAfter `75`, defaultPrevented true |
| Control+Enter, swallow ON | Control keyDown modifiers 2, defaultPrevented false; Enter keyDown modifiers 2, cancelable true, **defaultPrevented true** | both keydowns delivered; submitted false |

Consequences measured on this surface: a cancelled keydown is still *delivered* to the page (the
keylog records it, with cancelable true and defaultPrevented true), and its character or
backspace edit does not happen (the value reads back unchanged). The only form submission in the
run is the carried final Enter with swallow OFF: the fixture server logged exactly one `/echo`
request carrying `field` and `field2`, and none for the chord.

**Cross-check of page record against driver block (one-off, measured).** Every one of the six
block entries that carries `cancelable`/`defaultPrevented` has an equal-valued page keylog entry
(6/6, 0 mismatches). Forging one page-keylog `defaultPrevented` in a scratch copy produces 1
mismatch, so the check can fail.

## Limits (stated, not smoothed)

- **The Ctrl+Enter leg has no positive control.** The chord shows defaultPrevented true and no
  submission, but the run does not show the same chord submitting with swallow OFF. "Did not
  submit" therefore cannot yet be separated from "this chord never submits in Chromium". The frozen
  claim forbids amending the step list; this is routed to the next runner generation.
- **The counter does not itself compare page-keylog values.** The frozen counter reads the swallow
  witness from the driver's recorded block and checks the page keylog only for entry presence and
  keys. A forged page `defaultPrevented` alone would not turn the counter red. The equality above
  was measured by an extra check, not by the frozen counter. Routed (R58-S1).
- Only the Linux Chromium 155 headless surface is measured. Not measured: IME composition, repeated
  keys, read-only fields, accelerator-swallowing by the browser UI, any real site.

## Gate

Admitted: the default-action cancelation semantics (S161 §4.3.4, §3.5.6.1 lines above), the S153
modifier bits, the measured swallow table (live receipt). Rejected for this entry: any claim that
S161 itself defines `defaultPrevented` or `preventDefault()` (see above). Spot-check and located
quotes: `corpus/lessons/round-58.md` `## Gate`.
