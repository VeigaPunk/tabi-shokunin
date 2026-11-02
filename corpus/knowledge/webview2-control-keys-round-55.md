# Webview2 control keys on the form journey — round 55

Round 55 (2026-11-02), Windows host, Edge WebView2 runtime 156.0.4314.58 over raw CDP
through the committed minimal COM host. This note records the key-domain control keys
the r55 runner adds to the r52/r53/r54 per-key traces, and the two measurement lessons
the authoring surfaced.

## The measured model (S153's Input.dispatchKeyEvent contract, seventh re-open)

`scripts/webview2-cdp-loopback-round55.mjs --form` carries the r52 plain typing trace,
the r53 Shift-chord trace and the r54 chord-domain leg (bits 2/1/4 vs the page's own
`window.__keylog` booleans) unchanged, and appends the CONTROL-DOMAIN leg:

- **End** (`key` End, `code` End, VK 35; keyDown+keyUp, no text) — the CARET ANCHOR.
  A mouse click into a NON-empty input places the caret at the click point, NOT at the
  end of the text; the pre-freeze smoke run caught Backspace then deleting a middle
  character (red control `.ufo/waves/round-55/controls/c2-smoke-caret-midtext-red.json`).
  End moves the caret to end-of-line; the DOM value is read back UNCHANGED — a movement
  key edits nothing (the negative edit witness).
- **Backspace** (VK 8; keyDown+keyUp, no text) — the EDIT key. With the caret anchored,
  the field's DOM value read back is the nonce minus EXACTLY its last character
  (re-derived by the r55 counter from the receipt's own nonce). The removed character is
  re-typed (its real keyDown/keyUp pair WITH the text param) and the value witnessed
  RESTORED, so the submitted query stays the invocation-bound pair.
- **Tab** (VK 9; keyDown+keyUp, no text) — the FOCUS key. The page's OWN
  `document.activeElement` witness (read before/after) moves `field` -> `field2`.
- **Enter** (VK 13; ONE keyDown WITH text `\r`, dispatched FROM the tabbed-to field) —
  the KEYBOARD SUBMIT. The implicit submission navigates to
  `/echo?field=<nonce>&mixed=<uppercased nonce>`; the same server-side (fixture served
  log) + client-side (echo page render) pair witnesses it as the r54 button click. The
  form's submit-button presence is load-bearing: the implicit submission fires a click
  at the form's default button — the first submit button in tree order (S083 re-opened
  this round; §4.10.22.2: "hitting the \"enter\" key while a text control is focused
  implicitly submits the form").

The page keylog gains EXACTLY FOUR entries over the r54 plan (End, Backspace, the
restored character, Tab — each with every modifier boolean false). DISCLOSED ASYMMETRY:
the Enter keydown's own DOM record is NOT witnessed — the implicit submission navigates
the document and the keylog dies with it; the SUBMISSION ITSELF is the Enter witness.
The keylog is read after the Tab leg and before the Enter dispatch.

## What the counter (`.ufo/waves/round-55/counters/webview2-receipt-r55.mjs`) re-derives

From the receipt's own nonce alone: the plain trace, the Shift-chord plan, the
chord-domain chords and the COMPLETE page keylog (all four trace plans), the control
residues (`valueAfterBackspace` == nonce[:-1], the restore character's code/VK, the
Tab focus pair, the keylog window +4 anchored at the chord-domain leg's end), and the
echo query. 103 hand-declared fixtures (3 green incl. one declared-cne green + 100
refusals incl. seven new round-55 control-domain cases) assert the EXACT finding-id
set per case. Cross-refusals are symmetric: the r54 counter refuses an r55 receipt,
the r55 counter refuses an r54 receipt (control-domain-missing + keylog-length).

## Lessons recorded

1. **Caret placement is part of the surface model.** `centerOf(id)` clicks + keystrokes
   on an EMPTY field are caret-insensitive (typing appends from position 0) — r52-r54
   never surfaced this. The first caret-SENSITIVE key leg (Backspace) deleted a middle
   character. Any key leg whose meaning depends on the caret must re-anchor the caret
   explicitly and witness the anchor (End + the no-edit value read).
2. **The Enter default action needs the button.** A keyboard-submit witness is only
   honest when the spec contract that makes it work is named (S083 §4.10.22.2) — and
   the form fixture's submit button is part of the fixture contract, not incidental.

Live receipt: `corpus/evidence/round55/webview2-control-keys/receipt.json` (+ 6 per-step
PNGs), nonce `tabi-r55-5a70384367c4b44b`, fresh compile spawned first try (compile bytes
inside the receipt), Edg/156.0.4314.58, teardown sweep 0.
