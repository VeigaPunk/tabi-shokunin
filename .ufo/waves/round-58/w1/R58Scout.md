# R58Scout — S153 / S161 re-open for C2 (round 58, wave w1)

Read-only recon. **Both registered rows re-opened: they HOLD, no drift.** `S153` @master is UNMOVED against the r57 staged copy; `S161` is byte-identical. No browser was launched, no live data run was attempted, and nothing under `corpus/` was written.

## 1. Fetch guard (R57-S3, binding)

| field | S153 | S161 |
|---|---|---|
| url | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` | `https://www.w3.org/TR/uievents/` |
| http_code | 200 | 200 |
| num_redirects | 0 | 0 |
| url_effective | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` | `https://www.w3.org/TR/uievents/` |
| content_type | `text/plain; charset=utf-8` | `text/html; charset=utf-8` |
| size (bytes) | 1423170 | 920762 |
| final host == cited host | YES (`raw.githubusercontent.com`) | YES (`www.w3.org`) |
| refused | False | False |

Both fetches returned 200 with **zero redirects**, so the final host is the cited host by construction (`raw.githubusercontent.com`, `www.w3.org`); neither fetch is refused. `fetched_at` in both receipts is 2026-11-03T20:06:03Z, taken from the file mtime of the downloaded bytes (UTC).

## 2. Byte comparison — MOVED or UNMOVED

| source | fresh bytes | fresh sha256 | cmp vs r57 staged | registry anchor |
|---|---|---|---|---|
| S153 | 1423170 | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | **identical** | **same** (r56 re-open digest) |
| S161 | 920762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | **identical** | **same** |

**S153 verdict: @master UNMOVED.** 1423170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` == the round-56 RE-OPEN digest `d6737c31…` recorded in the registry cell and == the r57 staged copy (`cmp`: no difference). Relative to the 2026-10-31 original open digest `f60f0c02…` (1,421,620 B) the bytes still carry the already-disclosed r56 drift; **no new drift this round**.

**S161 verdict: byte-identical.** 920762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` == the registered anchor and the r57 staged copy. No drift.

## 3. S161 — the new C2 anchors, located in the fresh bytes

Every quote below is the exact byte span recorded in the receipt: sliced out of the staged bytes by the generator, never retyped, and re-checked by the verifier. Where a span begins mid-line the page's leading indentation is not part of it; internal tabs and newlines are the page's own.

### 3.1 Section: default actions and cancelable keyboard events

- §4.3.4 `Default actions and cancelable keyboard events`, heading raw line 5679, `data-level="4.3.4"`, `id="keys-cancelable-keys"`; whole-section span raw lines 5679–5857.
- The word `cancelable` occurs **once** inside that span — in the heading. The body sentence uses `Canceling`.

### 3.2 PRIMARY quote — the cancelable/default-action sentence (keydown), head clause

- raw lines 5680–5681, **15 tag-stripped words**, **1 hit file-wide**, **1 hit inside the §4.3.4 span**.

```html
<p>Canceling the <a data-link-type="dfn" href="#default-action" id="ref-for-default-action⑤">default action</a> of a <a data-link-type="dfn" href="#keydown" id="ref-for-keydown⑤①"><code>keydown</code></a> event MUST NOT
		affect its respective <a data-link-type="dfn" href="#keyup" id="ref-for-keyup④⑥"><code>keyup</code></a> event
```

### 3.3 Same sentence, tail clause (byte-exact continuation)

- raw lines 5681–5683, **16 words**, **1 hit file-wide**.
- The full sentence is 32 tag-stripped words, over the 25-word bound, so it is recorded as two byte-exact fragments; the head ends at `event`, the tail starts at `it MUST prevent the` on raw line 5681, and the intervening `, but ` belongs to neither fragment.

```html
it MUST prevent the
		respective <a data-link-type="dfn" href="#beforeinput" id="ref-for-beforeinput②⑤"><code>beforeinput</code></a> and <a data-link-type="dfn" href="#input" id="ref-for-input②⑥"><code>input</code></a> (and <a data-link-type="dfn" href="#keypress" id="ref-for-keypress④"><code>keypress</code></a> if
		supported) events from being generated.
```

This is the ground C2's s2/s3 legs need: canceling a keydown's default action prevents the `beforeinput`/`input` events from being generated, i.e. the character never reaches the field — which is exactly what "value UNCHANGED" measures.

### 3.4 Supporting — the `default action` definition and its cancelation clause

- `default action` `<dfn>` at raw line 7413, §12 Glossary (heading raw line 7374).
- Clause raw lines 7420–7422, **13 words**, 1 hit for this exact quote, 1 hit in the §12 span.

```html
A <a data-link-type="dfn" href="#default-action" id="ref-for-default-action②②">default
action</a> MAY be cancelled through the invocation of the
<code class="idl"><a data-link-type="idl" href="https://dom.spec.whatwg.org/#dom-event-preventdefault" id="ref-for-dom-event-preventdefault⑦">preventDefault()</a></code> method.
```

### 3.5 SECONDARY quote — `defaultPrevented` attribute

- raw line 2064, **2 words**, **1 hit** in the §3 span (raw lines 2031–2107), **1 hit for this exact quote**. The word `defaultPrevented` appears **5×** in the file: this list item, a dfn-panel entry at line 7924, the dfn-panel id record at 9079, and the external-anchor map entry at 9878 (two on that line).

```html
<code class="idl"><a data-link-type="idl" href="https://dom.spec.whatwg.org/#dom-event-defaultprevented" id="ref-for-dom-event-defaultprevented">defaultPrevented</a></code> attribute
```

### 3.6 SECONDARY quote — `preventDefault()` method

- raw line 2072, **2 words**, **1 hit** in the §3 span, **1 hit** for this exact quote. The string `preventDefault` appears **14×** in the file.

```html
<code class="idl"><a data-link-type="idl" href="https://dom.spec.whatwg.org/#dom-event-preventdefault" id="ref-for-dom-event-preventdefault">preventDefault()</a></code> method
```

### 3.7 Supporting — `keydown` is Cancelable: Yes

- §3.5.6.1 `keydown` event definition, rows raw lines 3745–3752, **7 words**, 5 hits file-wide (the same three-row shape appears in five event tables), **1 hit** in the keydown table span (raw lines 3732–3765).

```html
       <th>Bubbles
       <td>Yes
      <tr>
       <th>Trusted Targets
       <td><code>Element</code>
      <tr>
       <th>Cancelable
       <td>Yes
```

This grounds the `cancelable: true` expectation the r58 recorder records for the swallow-leg keystrokes.

## 4. S153 — the modifiers bit-field sentence

- `$.domains[Input].commands[dispatchKeyEvent].parameters[modifiers]`, JSON `integer`, `optional: true`.
- raw line **14323**, **1 hit inside the dispatchKeyEvent command block** (raw lines 14307–14457), **5 hits file-wide** at raw lines 14300, 14323, 14484, 14594, 14661 — one per Input command (`dispatchDragEvent`, `dispatchKeyEvent`, `dispatchMouseEvent`, `dispatchTouchEvent`, `emulateTouchFromMouseEvent`).

```json
"description": "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",
```

The `\n` between `Shift=8` and `(default: 0).` is the two-character JSON escape as it appears in the file, not a line break. Bits: Alt=1, Ctrl=2, Meta/Command=4, Shift=8 — which is what grounds C2's ONE Ctrl+Enter chord (modifiers bit 2).

## 5. Anchor gaps (read-only opinion; claims.json is not amended)

1. **S161 does not define `defaultPrevented` or `preventDefault()`.** Both are list items in §3 *Basic Event Interfaces* that point at the DOM Standard (`https://dom.spec.whatwg.org/#dom-event-defaultprevented`, `…/#dom-event-preventdefault`); the bytes contain 5 `defaultPrevented` occurrences and none of them is a definition. C2's knowledge-note sentence ("S161 … the cancelable/defaultPrevented/default-action ground") is therefore **partly overstated**: S161 grounds the default-action / cancelation *semantics*, while the two API definitions are external. Confidence: high (byte-level, 5/5 occurrences inspected).
2. **`cancelable` is also an xref only** (§3 list, line 2058). The strongest in-spec ground for `cancelable: true` on the swallow legs is the `keydown` event-definition row recorded in §3.7, not the §3 list item.
3. **s4 has no UI Events ground for Enter→submission.** §4.3.4 speaks only about keydown cancelation suppressing `beforeinput`/`input` generation. Implicit form submission's default action is defined by HTML, not UI Events. s4's "no request" witness therefore rests on fixture-server state plus the *concept* of a default action — which is what the claim already requires — but not on a spec sentence that names Enter or submission.
4. **Capture-before-recorder ordering is not a UI Events rule.** That a capture-phase listener registered earlier runs before a later one on the same node is DOM dispatch order (also external). It is a fixture-implementation condition: if the swallower and the recorder land on different nodes/phases, `defaultPrevented` read by the recorder may not yet be true. The claim's own wording ("registered before the r57 recorder") is the operative condition; the spec does not supply it.
5. **No gap in the S153 ground.** The bit field is verbatim, the command block scoping is exact (1 hit in-block, 5 file-wide, one per Input command), and bit 2 = Ctrl supports the s4 chord.

## 6. The r57 receipt's chord/traces vs claims.json C2 leg design

Facts read from `corpus/evidence/round57/chromium-modifier-chords/receipt.json` (schema `tabi-chrome-cdp-r57`, driver sha256 `e0b1f3f5…`, predicate true):

- `legOrder` = `[plain-trace, end, backspace, restore, tab, shift-trace, chord-leg, enter-submit]` (8 legs).
- `chordLeg`: target `field3`, chords Control/Alt/Meta (bits 2/1/4) over the derived letter `b`, `field3ValueAfter` `""`, `booleansMatch: true`; Shift rides the separate `shift-trace` leg.
- `enter-submit`: on `field2`, `submitted: true`, `serverLog` sees `/echo?field=<nonce>&field2=<UPPER>`; `field3Value`/`field3Final` are empty. So `#field3` is already the never-submitted field the claim puts s1–s4 on.
- Keylog entry fields (all 4 windowed entries): `key, code, keyCode, windowsVirtualKeyCode, ctrlKey, altKey, metaKey, shiftKey, targetId` — **no `cancelable`, no `defaultPrevented`**. `scripts/chrome-cdp-loopback-round57.mjs` contains zero occurrences of `cancelable`, `defaultPrevented` or `preventDefault`, confirming the two fields C2 adds are genuinely new recorder state.
- Two keylog surfaces exist in the receipt: `keylog.entries` (4 entries, window 21–25) and `journey.form.pageKeylog` (120 entries, 60 keydowns).

Gaps this exposes (design-level, for the L1 — I cannot amend the frozen claim):

1. **s4 is not falsifiable as written.** "swallow ON → defaultPrevented TRUE and NO submission" is also what a run produces if Ctrl+Enter is not a submission-triggering default action in Chromium at all. There is no swallow-OFF Ctrl+Enter positive control in the frozen step list, so the receipt cannot separate "swallow prevented submission" from "that chord never submits". (`defaultPrevented TRUE` only proves the swallower ran, not that its prevention caused the absence.) The kill rule's "more than one form submission" check does not cover this false-green path.
2. **s2's positive control is on a different field.** The carried `controlDomain.backspace` proves Backspace deletes, but on `#field`; s2 observes `#field3`. s1/s3 are same-field (#field3) and therefore clean.
3. **The kill rule must name the keylog surface.** "the keylog does not carry cancelable/defaultPrevented for the four swallow-leg keystrokes" is ambiguous between `keylog.entries` (windowed, 4 entries in r57) and `journey.form.pageKeylog` (full, 120). If the counter reads the windowed surface, the four swallow legs must fall inside `keylog.window` for the check to mean anything.
4. **Schema bump is required and the cross-refusal expectation is sound.** The r57 counter's `SCHEMA` is `tabi-chrome-cdp-r57` (line 214) and its `schema-wrong` check runs at line 405 before the content checks, so an r58 receipt (`tabi-chrome-cdp-r58`) is refused by the r57 counter on schema first — consistent with the claim's symmetric cross-refusal.

## 7. Artifacts and verification

| path | sha256 |
|---|---|
| `.ufo/waves/round-58/sources/browser_protocol.json` | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` |
| `.ufo/waves/round-58/sources/uievents.html` | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` |
| `.ufo/waves/round-58/scout/reopen-receipt-s153.json` | `253154feabdb534d1c04fbe5dbf94285243f921d65db0b1f62cf13716128d12c` |
| `.ufo/waves/round-58/scout/reopen-receipt-s161.json` | `3f1d2f7b3ec0b8841892fa85e10f484bfd9252d668bb10656bcdf93e89c48948` |
| `.ufo/waves/round-58/scout/reopen-verify.json` | `9349b172677bee65dd4691ab96d814a98326fdc7e62059974256cf42fb38fc92` |

`reopen-verify.json` re-applies the frozen gate's row predicates (f3 fetched-date, f4 fetch-digest incl. byte count, f5 held==located and quote-in-bytes, f6 summary/row counts) plus the R57-S3 guard fields and the quote-level checks (byte-exact occurrence count, recorded raw line, span hit count, ≤25 tag-stripped words) to the receipts **at their cited lane paths**: **95 checks, 0 failed, pass=true**.

`cmp` of both staged copies against `.ufo/waves/round-57/sources/` is recorded inside the verifier as `staged-vs-r57-identical` and `staged-vs-fresh-fetch-identical` — both pass.

## 8. Unknowns

- Whether Chromium 155 treats Ctrl+Enter in a text input as an implicit-submission trigger. Not answerable without a browser; the seat forbids one and the live pass is the L1's. This is the assumption s4 silently depends on (see §6 gap 1).
- Whether the r58 fixture will register the swallower on the same node and phase as the recorder (see §5 gap 4) — an implementation fact at the freeze commit, not a spec question.

Nothing in the two source rows is unresolved: both hold, both are byte-stable, and every recorded quote is byte-exact in the staged bytes.
