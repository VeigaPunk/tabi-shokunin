# Chromium key-event modifier chords — Linux host (round 57)

**Holds:** the Linux host's Chromium 155 headless surface now carries the modifier-chord
domain of the key-event model, witnessed by the page's own DOM state. Measured
2026-11-03 (round 57, capability `chromium-keyevent-modifier-chords-linux`, first-working 57).

source: S153 — Chrome DevTools Protocol `browser_protocol.json`, the
`Input.dispatchKeyEvent` contract: `modifiers` is the bit field
`Alt=1, Ctrl=2, Meta/Command=4, Shift=8` (raw line 14323, 1 hit scoped to the
command block, 5 file-wide — one per Input command that declares a `modifiers`
parameter); `key`/`code`/`text`/`unmodifiedText`/`windowsVirtualKeyCode` carry the
per-event key identity the traces re-derive. Re-opened round 57: `@master` UNMOVED
(1,423,170 B, sha256 `d6737c31…` == the round-56 re-open digest).

source: S161 — W3C UI Events, the `KeyboardEvent` boolean attribute definitions
(§3.5.1): `ctrlKey`/`shiftKey`/`altKey`/`metaKey` (lines 3264/3273/3282/3291,
byte-exact including the `<code class="keycap">` markup). Re-opened round 57:
byte-identical to the registered anchor (920,762 B, sha256 `8ded5eaf…`).

## The measured model

One `--form` run on the loopback form fixture (throwaway profile, throwaway
`HOME`/`XDG_CONFIG_HOME`, `--disable-extensions` — the r56 sentinel amendments are
load-bearing here: the Arch `/usr/bin/chromium` wrapper prepends the user's
`chromium-flags.conf`, which loads the user's own extension and writes the user's
crash DB). Leg order (r57, `receipt.legOrder`):

1. **plain-trace** — the r56 per-key trace on `#field` unchanged (every nonce
   character rides a real keyDown/keyUp; DOM value read back after EVERY keystroke).
2. **end / backspace / restore / tab** — the r56 control legs unchanged: End
   re-anchors the caret with the NEGATIVE EDIT WITNESS (field value read back
   UNCHANGED), Backspace deletes exactly the last character (residue re-derived
   from the nonce) and the removed character is re-typed to an exact restore, Tab
   moves focus field→field2 witnessed by `document.activeElement`.
3. **shift-trace** — the invocation-bound nonce UPPERCASED typed into `#field2`:
   every uppercase letter's key pair RIDES a real Shift keyDown/keyUp (the letter's
   event carries `modifiers: 8` — S153's Shift bit — plus the shifted `key` and
   `text`; digits/hyphen unshifted, `modifiers: 0`, no ride); the DOM value of BOTH
   fields is read back after EVERY keystroke (per-keystroke prefix witnesses on
   both: `#field2` grows the uppercased nonce, `#field` stays the plain nonce).
4. **chord-leg** — three real chords Control/Alt/Meta (bits 2/1/4 per S153) on the
   nonce-derived letter (the first `[a-f]` character of the nonce hex tail) into
   `#field3`, a never-submitted third field with NO name attribute; every delivered
   keydown/keyup lands in the page's own `window.__keylogFull` record with its
   modifier booleans; the bit↔boolean correspondence is measured live
   (2↔`ctrlKey`, 1↔`altKey`, 4↔`metaKey`; `shiftKey` false on the chorded letter);
   `#field3`'s value is read back and recorded EMPTY — the negative witness (a
   modifier chord inserts nothing).
5. **enter-submit (LAST)** — ONE Enter keyDown (`text: "\r"`) from the tabbed-to
   `#field2` drives the implicit submission (S083 §4.10.22.2, the r56 ground). The
   r57 leg order puts Enter LAST, so the submit carries BOTH params:
   `serverSawField == nonce` AND `serverSawField2 == nonce.toUpperCase()` — the
   Shift leg's server-side echo witness (the r56 expectation `serverSawField2==''`
   is structurally impossible in this order; the r57 counter expects the uppercased
   value — a declared strengthening, R57Critic item 1).

The page-side record is TWO recorders: the r56 `window.__keylog` stays KEYDOWN-ONLY
(its 4-entry control slice + window keep r56 semantics) and `window.__keylogFull`
records BOTH keydown and keyup for the whole run (120 entries for a 12-hex nonce —
60 keydowns + 60 keyups; the keydown subsequence is what the counter re-derives
from the nonce plan). Every entry carries
`{type, key, code, keyCode, modifiers, ctrlKey, altKey, metaKey, shiftKey, targetId}`
with `modifiers` the S153 mirror computed from the DOM booleans and `targetId`
naming the focused field (`field` plain+control, `field2` shift leg including the
Shift events, `field3` chord leg).

## Evidence

- Receipt: `corpus/evidence/round57/chromium-modifier-chords/receipt.json`
  (nonce `tabi-r57-6b714a3a7080`, invocation-bound; Chromium 155.0.8059.84 Arch
  Linux; teardown 0 survivors; argv shape-only).
- Per-step PNGs: `a-start` … `h-chord-domain` (8 files beside the receipt).
- Counter: `.ufo/waves/round-57/counters/chromium-receipt-r57.mjs` — green exit 0,
  0 findings, 0 couldNotEvaluate, with `--expect-driver-sha256 e0b1f3f5…` (the
  frozen driver digest; the r57 counter re-derives both traces and the keylog plan
  from the receipt's own nonce and checks the bit↔boolean correspondence per entry).
- Cross-refusals: the r56 counter refuses the r57 receipt (exit 1, 3 findings,
  `schema-wrong` first); the r57 counter refuses the committed r56 receipt
  (exit 1, 7 findings, `schema-wrong` first). Selftests at the frozen bytes:
  counter 70/70, runner `--path-selftest` 13/13.

## Boundary / what this note does NOT hold

- The webview2 rows (r53/r54) stay Windows-bound; this note is the Linux
  Chromium-class twin. The two surfaces' receipts are mutually refused by their
  counters (the generation boundary is enforced in both directions).
- Accelerator-swallowing variants (a page-level `keydown` handler calling
  `preventDefault` on Control/Alt/Meta chords) were NOT probed — the fixture has
  no such handler; the r54 note's boundary applies here too.
- CapsLock as a toggle modifier, non-latin keyboard layouts, and dead-key
  composition are unmeasured on this surface.
- The counter's `idCoverage` gate is not exercised by the mutation seat's five
  mutants (none removes an id from the fixture corpus) — the
  `fixture-id-coverage` check's kill evidence is structural, not mutation-measured.
