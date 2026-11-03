# Keydown `cancelable`: what the round-59 receipt records, and four forgeries a gate must refuse

Draft for `corpus/knowledge/keyevent-cancelable-forgery-round-60.md`. Pre-data: states only the frozen predicate, the pre-data ground, and the committed round-59 receipt. No round-60 result is stated here. Claim C2: `.ufo/waves/round-60/claims.json`.

Question: a keydown's `cancelable` value decides whether the page can cancel the keystroke. A receipt gate that reads a CapsLock keydown must refuse a receipt whose `cancelable` is false, missing, or inconsistent with the page's own record. What does the spec say `cancelable` is, what does the committed live receipt record, and which forgeries must the gate refuse?

Scope: the Linux Chromium loopback surface measured in round 59. Not a claim about any real site, and not a claim that Chromium's internal CapsLock constant is sourced (see Limits).

## 1. What `cancelable` means for a keydown (spec ground)

- **Definition site, DOM Standard (S163).** The `cancelable` attribute of `Event` is a definition site: the `dfn` with id `dom-event-cancelable` (raw line 1450, dfn-for `Event`, dfn type `attribute`). Its getter steps are the located sentence "The bubbles and cancelable attributes must return the values they were initialized to." (raw 1449–1451, tag-stripped). The WebIDL member `readonly attribute boolean cancelable;` is the interface declaration (raw 1032 in the staged bytes).
- **Canceled-flag rule, DOM Standard (S163).** The body of the local dfn `set-the-canceled-flag` (raw 1454, `data-noexport`) sets the canceled flag only when the attribute is true: "if event's cancelable attribute value is true and event's in passive listener flag is unset, then set event's canceled flag, and do nothing otherwise." (raw 1454–1457, tag-stripped, 24 words). Scout's receipt classifies this hit as a cross-reference; this draft reads it as the body of a local dfn, and the disagreement is flagged for the L1 (see the report).
- **Keydown row, UI Events (S161).** Two located rows carry keydown `Cancelable` as `Yes`: the §3.1 list-table row (raw 2227, `keydown Sync Yes Element KeyboardEvent Yes`, Scout receipt) and the §3.5.6.1 keydown definition table (`Cancelable` / `Yes` at raw 3751–3752). Both are table cells, prose-grounded, not dfns. The keydown dfn is at raw 3732.
- **Default-action rule, UI Events (S161, prose).** §4.3.4 states: "Canceling the default action of a keydown event MUST NOT affect its respective keyup event" (raw 5680). A keydown cancel does not cancel the keyup, which is why the receipt checks the keyup separately.
- **Staged bytes and hashes.** S163: `https://dom.spec.whatwg.org/`, staged `.ufo/waves/round-60/sources/dom.html`, 2,714,595 B, sha256 `9b797e18…` (full digest in the Scout receipt `sources/s163-fetch-receipt.json`). S161: staged `.ufo/waves/round-60/sources/uievents.html`, 920,762 B, sha256 `8ded5eaf…`, byte-identical to the registered S161 anchor.

Classification (sweep per QUALITY criterion 111): `cancelable` on `Event` is a definition site (S163 raw 1450). `Cancelable: Yes` for keydown is a table cell (S161 raw 3752), prose-grounded. `defaultPrevented` and `preventDefault()` are not defined in UI Events (see `corpus/knowledge/chromium-preventdefault-swallow-round-58.md`); they are cited from the DOM Standard only.

## 2. What the round-59 committed live receipt records

Source: `corpus/evidence/round59/chromium-capslock-boundary/receipt.json` (the committed live pass; 18 PNGs in the same directory; `corpus/lessons/round-59.md` Measurements). Values read from the committed file:

| where in the receipt | events | `cancelable` | `defaultPrevented` | `capsLock` | keyCode |
|---|---|---|---|---|---|
| `capslockTrace.press1.keydownEntry` / `keyupEntry` | CapsLock down / up | true / true | false / false | false / false | 20 / 20 |
| `capslockTrace.press2.keydownEntry` / `keyupEntry` | CapsLock down / up | true / true | false / false | false / false | 20 / 20 |
| `capslockTrace.letters1` (f, b) and `letters2` (a, f) | letter keyDown | true (all four) | false (all four) | false (all four) | — |
| `journey.form.pageKeylog` | every recorded keydown and keyup | boolean true on all 148 | — | — | — |

Two further facts from the same file:

- The latch sequence (`capslockTrace.latch`) has 13 entries, all false, with `allFalse: true`. The page's caps flag never set on this surface.
- `journey.form.capsLockLeg.trace` has 12 entries and carries **no** `cancelable` field. The `cancelable` values for the CapsLock and letter events live in `capslockTrace`, not in the leg trace. A gate that reads only the leg trace would not see `cancelable` at all.

Consequence measured on this surface: a CapsLock keydown is delivered to the page as cancelable, and the page's own keylog records the same value the driver's trace records for the same event.

## 3. Why the round-59 counter is not enough

The canonical round-59 counter (`.ufo/waves/round-59/counters/chromium-receipt-r59.mjs`) was run over two forged copies of the committed receipt by `.ufo/waves/round-59/measure/f6-probe.py` (outputs `.ufo/waves/round-59/measure/f6-probe/RESULT.txt`):

- A: first CapsLock keydownEntry with `cancelable: false` → exit 0, `findings []`.
- B: the same entry with `cancelable` deleted → exit 0, `findings []`.

Mutant C6 (remove the `cancelable` presence and value checks) survived with 91/91 still green (`corpus/lessons/round-59.md` Mistakes 1). Round-59 Mistakes 1 records that the frozen rule's missing-field kill did not reach the `cancelable` key; the false value is the same failure class. Round 60 claim C2 is a new counter generation with its own predicate; it does not re-declare the round-59 capability.

## 4. The four forged probe classes the round-60 gate must refuse

The frozen probe set is F = {A, B, D, E} (claims.json C2). Probes D and E are generated by `.ufo/waves/round-60/measure/f-probes-r60.py` from the committed live receipt; this note states only their frozen definitions.

| probe | forgery (frozen wording) | why a receipt gate must refuse it |
|---|---|---|
| A | first CapsLock keydownEntry `cancelable: false` (the r59 probe A) | A keydown with `cancelable` false cannot carry a canceled flag (S163 raw 1454–1457). The committed live keydown reads `cancelable: true` on this surface, and S161's keydown rows say `Cancelable` `Yes` (raw 2227 list table; raw 3751–3752 definition table). A gate that accepts `false` accepts a keystroke the page could not have cancelled. |
| B | the same entry with the `cancelable` key deleted (the r59 probe B) | S163 says the getter returns the initialized value (raw 1449–1451), so `cancelable` is a boolean that is present on every real `Event`. A missing key is not a shape the attribute can produce. Round 59 measured this greened on the canonical counter. |
| D | a CapsLock trace entry whose `cancelable` disagrees with the page keylog entry it cites | The trace and the page keylog both record one delivered event. A disagreement means one record is not the event it cites. The round-58 note measured the equality check on six entries (6/6 equal) and showed a single forged page value turns it red (`corpus/knowledge/chromium-preventdefault-swallow-round-58.md`, Limits). |
| E | a CapsLock trace entry with the `type` key deleted | `type` is what makes an entry a keydown or a keyup (S161 keydown dfn, raw 3732). An entry without it cannot be assigned to the keydown/keyup pair the caps latch is read against. |

Each of the four must return exit 1 with a finding of the cancelable or trace-shape class. The live receipt must return exit 0 with no findings (claim C2, after-command).

## 5. The residual the claim discloses

A byte-perfect replica of the committed live receipt passes every shape check by construction. The counter cannot tell a replica from the live pass. Genuineness of such a receipt rests on the committed live run and its driver hash, not on the counter. This is the disclosed residual of claim C2 (kill K5), the same residual round 59 disclosed for its counter (`corpus/lessons/round-59.md` Limits and Corrections D2).

## 6. Limits (stated, not smoothed)

- The caps-latch half is measured on this one Linux surface only. Blink's internal `kCapsLockOn` constant is not sourced: S162 (Chromium `input_handler.cc`, tag 155.0.8059.84) covers only the four-bit CDP modifier mapping (raw 92–110), and the staged bytes contain no CapsLock occurrence (`corpus/lessons/round-59.md` Gate, Reject row).
- `cancelable` is observed on keydown and keyup through the page keylog and the driver trace. Behaviour on IME composition, repeated keys, read-only fields, or any real site is not measured.
- Probes D and E are generated mechanically from the committed receipt and are not themselves evidence of any browser behaviour.
- Round-60 outcomes are measured after the instrument freeze and are not recorded in this draft.

## 7. Sources cited

- S161 — W3C UI Events, https://www.w3.org/TR/uievents/ (keydown list-table row raw 2227; keydown definition table raw 3751–3752; §4.3.4 raw 5680; sha256 `8ded5eaf…`, byte-identical to the registered anchor).
- S163 — DOM Standard, https://dom.spec.whatwg.org/ (`dom-event-cancelable` raw 1450; canceled-flag body raw 1454–1457; sha256 `9b797e18…`, staged 2,714,595 B; Scout receipt HTTP 200, 0 redirects).
- S162 — Chromium `input_handler.cc` at 155.0.8059.84 (four-bit modifier mapping; no CapsLock branch).
- S153 — CDP `browser_protocol.json` (`Input.dispatchKeyEvent` modifiers, four bits).
- Committed evidence: `corpus/evidence/round59/chromium-capslock-boundary/receipt.json`; `corpus/lessons/round-59.md`; `corpus/knowledge/chromium-preventdefault-swallow-round-58.md`.
