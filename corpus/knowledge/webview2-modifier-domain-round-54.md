# webview2 modifier-domain chords with a page-side DOM witness (round 54)

- source: S153 (ChromeDevTools/devtools-protocol `json/browser_protocol.json`,
  re-opened byte-identical a SIXTH time this round, sha256
  `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` == the
  registered anchor; the located ground is the `Input.dispatchKeyEvent`
  `modifiers` parameter description "Bit field representing pressed modifier
  keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0)." — the r53
  ground, this round extended from Shift=8 to the OTHER THREE bits) AND
  S161 NEW this round (W3C UI Events, https://www.w3.org/TR/uievents/, sha256
  `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`; the
  located ground: §5.3 KeyboardEvent attribute definitions — "true if the
  Control (control) key modifier was active." for `ctrlKey`, with the
  altKey/metaKey/shiftKey definitions alongside — the DOM booleans the
  page-side witness carries).
- verified-at: 2026-11-02, live run on the WebView2 runtime
  156.0.4314.58 (`Edg/156.0.4314.58`), receipt
  `corpus/evidence/round54/webview2-modifier-chords/receipt.json`
  (nonce `tabi-r54-6da3859c91bdfddb`), counter
  `.ufo/waves/round-54/counters/webview2-receipt-r54.mjs` green
  (exit 0, 0 findings, couldNotEvaluate []); cross-refusals symmetric
  (the r53 counter refuses the r54 receipt with 5 findings; the r54 counter
  refuses the committed r53 receipt with 7 findings incl.
  `chord-domain-missing` and `keylog-missing`).
- recheck: on the next runner-generation round (or if a Chromium-class
  runtime changes the Input-domain or DOM-event behavior); both anchors are
  byte-pinned, so protocol/spec drift is detectable by sha.

## What the surface can now do (capability `webview2-modifier-domain-chords-windows`)

The r52 plain per-key trace and the r53 Shift-chord trace are carried
unchanged; the form fill gains the CHORD-DOMAIN leg — the remaining three
modifier bits of S153's bit field, witnessed by the PAGE'S OWN event record:

- The form fixture page (`/form.html`) carries an inline keydown recorder: a
  page-side script pushes every DOM keydown's
  `{key, code, ctrlKey, altKey, metaKey, shiftKey, keyCode}` onto
  `window.__keylog` as it is delivered. The runner reads the complete record
  back after the fill (`journey.form.pageKeylog`); the counter re-derives the
  whole expected record from the receipt's own nonce and compares entry by
  entry — CDP dispatch and DOM delivery must agree INDEPENDENTLY.
- The chord leg focuses a THIRD field (`#field3` — no `name` attribute, so it
  is never submitted) and dispatches three real modifier chords: Control
  (`modifiers: 2`), Alt (`modifiers: 1`), Meta (`modifiers: 4` — S153's bit
  field; Shift=8 rode in r53). Each chord is 4 key events: the modifier's
  keyDown, the derived letter's keyDown with NO text param (a modifier chord
  inserts nothing), the letter's keyUp, the modifier's keyUp — 12 total.
  The derived letter is the first `[a-f]` character of the nonce's hex tail
  (counter-re-derivable; `d` for the data receipt's nonce).
- The page's own record of each chord is read back into the receipt
  (`journey.form.chordDomain.chords[].domEvents`, two entries per chord: the
  modifier's own keydown then the letter's keydown). MEASURED bit↔boolean
  correspondence: bit 2 ↔ `ctrlKey: true`, bit 1 ↔ `altKey: true`, bit 4 ↔
  `metaKey: true`, `shiftKey: false` throughout, with the modifier keys'
  own keydowns delivered as `key: 'Control'/'Alt'/'Meta'`,
  `code: 'ControlLeft'/'AltLeft'/'MetaLeft'`, keyCode 17/18/91, and the
  letter's keydown carrying `ctrlKey`/`altKey`/`metaKey` per its chord —
  exactly the S153 bits mapped onto the S161 DOM booleans.
- `#field3`'s DOM value stays EMPTY after all three chords — the negative
  witness (a modifier chord inserts no text; no `text` param was sent).
- The keylog window over the leg is exactly +6 (three chords × two recorded
  keydowns); the full record for the data receipt is 70 entries (25 plain
  keydowns + 11 shifted letters × 2 + 14 unshifted × 1 + 6 chord-domain
  keydowns), matched entry-by-entry by the counter.
- The GET submit carries the same two parameters as r53
  (`?field=<nonce>&mixed=<uppercased>` — `#field3` is not submitted),
  witnessed SERVER-SIDE (fixture served log) and CLIENT-SIDE (echo page).

## Host-condition notes carried this round

- The per-blob spawn-verdict condition (the r53 standing note) RECURRED at
  the data run: the data scratch's fresh compile was refused at spawn
  (UNKNOWN, errno -4094; the blocked run's full stderr is committed at
  `.ufo/waves/round-54/controls/c2-live-run1-spawn-unknown.txt` — the
  round-54 committed-stderr convention applied at the round that cites it).
  The documented class fix was applied: the scratch was seeded with the
  already-proven blob from the round-open smoke run and the runner's
  reuse-if-exists branch disclosed it
  (`{"step": "host-exe-reused"}` + `hostExeSha256`/`hostCsSha256` pins — the
  receipt's disclosure shape; NOTE: it is a step plus two pins, not a
  `compileReuse` key — the r53 lesson's prose name-leftover, corrected of
  record this round). The smoke run itself was a FRESH compile that spawned
  first try (`controls/hostexe-fresh-compile-spawn-verdict.json`, stderr
  committed) — the verdict class is stochastic per blob, as disclosed.
- The meter generation rebind (v14) fixed a v13 instrument-output
  name-leftover: v13's run-output JSON emitted `schema:
  "tabi-adjacency-host-v12"` while its die/selftest/sentence strings said
  v13; v14 emits v14 in all four places (found by diff review; the same
  class as the routed D2 lesson-prose drift).

## Decision table — dispatching a modifier chord via CDP

| You want | Dispatch | The DOM receives (measured) |
|---|---|---|
| a plain character | keyDown `{modifiers: 0, key: c, text: c, code, windowsVirtualKeyCode: vk}` + keyUp | keydown `{key: c, code, shiftKey: false, …, keyCode: vk}`; text inserted |
| a shifted character (r53) | Shift keyDown `{modifiers: 8, key: 'Shift', code: 'ShiftLeft', vk 16}` → letter keyDown `{modifiers: 8, key: C, text: C, …}` → letter keyUp → Shift keyUp | keydown `{key: 'Shift', code: 'ShiftLeft', shiftKey: true, keyCode: 16}` then keydown `{key: C, shiftKey: true, keyCode: vk(C)}`; shifted char inserted |
| a Ctrl/Alt/Meta chord (r54) | modifier keyDown `{modifiers: 2/1/4, key: 'Control'/'Alt'/'Meta', code: 'ControlLeft'/'AltLeft'/'MetaLeft', vk 17/18/91}` → letter keyDown `{modifiers: 2/1/4, key: c, NO text, …}` → letter keyUp → modifier keyUp | keydown `{key: 'Control'/'Alt'/'Meta', ctrlKey/altKey/metaKey: true, keyCode: 17/18/91}` then keydown `{key: c, ctrlKey/altKey/metaKey: true, shiftKey: false, keyCode: vk(c)}`; NOTHING inserted |
| proof the chord reached the page | install a page-side keydown recorder BEFORE the dispatch (the fixture's own script) and read `window.__keylog` back after | the page's own record — independent of the driver's dispatch log; compare entry by entry |
