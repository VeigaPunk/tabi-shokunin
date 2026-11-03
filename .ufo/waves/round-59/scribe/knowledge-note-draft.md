# Draft — `corpus/knowledge/chromium-capslock-boundary-round-59.md`

Seat R59Scribe, round 59 wave w1, 2026-11-03. **DRAFT ONLY — this seat wrote nothing in
`corpus/`.** The L1 integrates; the L1 owns the file's landing and its final wording.

**Re-anchored** to the L1's **pre-data** restatement of C2
(`.ufo/waves/round-59/claims.json` → `preDataCorrection.c2Restatement`, disclosed in the
claims' own field; commits `8e740a08` + `a40822d9` + `03f64a39`). The original frozen C2
asserted a caps **latch** sequence (`getModifierState('CapsLock')` false → true → held →
false). The L1's restatement records that this sequence is **UNREACHABLE on the declared
surface** and restates C2 as the **measured-negative delivery-boundary** claim, capability
`chromium-keyevent-delivery-boundary-linux`, evidence directory
`corpus/evidence/round59/chromium-capslock-boundary/`.

**The note name changes** accordingly: `chromium-capslock-boundary-round-59.md`, NOT
`chromium-capslock-toggle-round-59.md`. (The registry used-by extension in
`scribe/usedby-oldnew.txt` names the **boundary** note; the `-toggle-` name is void.)

Cells the L1 fills from the live run are marked `L1-at-data`. Cells the L1 fills from the
S162 fetch are marked `L1-at-S162`. Everything else is either (a) a ground this seat located
and byte-checked in the **staged bytes**, with the raw line numbers, or (b) a shape copied
from the r58 note (`corpus/knowledge/chromium-preventdefault-swallow-round-58.md`).

---

## The draft

````markdown
source: S161 (W3C UI Events specification — https://www.w3.org/TR/uievents/ — §3.5.1 Interface KeyboardEvent, the `getModifierState(keyArg)` method definition at raw line 3327; §4.3.1 "Modifier keys" (heading `id="keys-modifiers"`, `data-level="4.3.1"`) at raw lines 4785–4792 for the latch semantics; §7.3.3 "Fixed virtual key codes" at raw lines 6370–6371 for the CapsLock virtual key code 20), S153 (Chrome DevTools Protocol browser_protocol.json, `Input.dispatchKeyEvent` (the command block starts at raw line 14307) → the `code` / `key` / `windowsVirtualKeyCode` / `text` parameter names and descriptions at raw lines 14352–14353, 14358–14359, 14364–14365 and 14334–14335, and the `modifiers` bit-field at raw lines 14322–14323), S162 (Chromium source — `content/browser/devtools/protocol/input_handler.cc` — the `GetEventModifiers` bit-mapping ground; NEW row, opened this round: the fetch-guard fields are in `.ufo/waves/round-59/sources/s162-fetch-receipt.json` (final host `chromium.googlesource.com` == the cited host, `num_redirects 0`, HTTP 200; the `?format=TEXT` response is base64 — transport 119,284 B sha256 `847c531e…` — staged DECODED at `.ufo/waves/round-59/sources/input_handler.cc`, 89,463 B sha256 `72cf0d1d…`; the located quote at raw line 92); live witness = `corpus/evidence/round59/chromium-capslock-boundary/receipt.json` (L1-at-data: the exact path the live run writes)
verified-at: 2026-11-03, this round (L1-at-data: the lane commit the live run and the counter green are recorded at; the driver sha256 `L1-at-data`, the counter sha256 `L1-at-data`, the nonce `L1-at-data`)
recheck: `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs corpus/evidence/round59/chromium-capslock-boundary/receipt.json --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 <L1-at-data> --shot corpus/evidence/round59/chromium-capslock-boundary --json` → exit 0, predicate true, findings [], couldNotEvaluate []; plus the re-fetch and located-quote check in the round-59 lesson `## Gate` (S161 recheck `on-release`, S153 recheck `90d` — the two rows' registered recheck intervals, unchanged; S162's recheck interval `L1-at-S162`)
````

### Question and scope

> Round 59 capability `chromium-keyevent-delivery-boundary-linux`. Question: when a CapsLock
> keypress is delivered to a page over CDP on the Linux host's Chromium 155 headless surface,
> **where exactly is the boundary** — does the *event* arrive, and does the *modifier state*
> change? The answer this round measures is a **negative on the latch**: the events arrive,
> and the latch flag does not set. Scope: the Linux host's Chromium 155 headless surface,
> loopback fixture, throwaway profile, throwaway HOME/XDG. **Not a claim about any real
> site**, and not a claim about the webview2 surface (which stays Windows-bound).

**Why this is worth a note.** The r57 planned residual asked for "CapsLock as a toggle
modifier". The round executes that question and reports the honest answer: **over this CDP
surface the caps latch is not reachable**. The value of the negative is that it separates two
different failures that look identical from the outside — *"the event was never delivered"*
and *"the event was delivered but the modifier state cannot be set through this channel"* —
and it names the channel's limit: the CDP modifiers field has **no CapsLock bit**.

### Grounding (what the sources say, located and byte-checked)

- **The latch semantics — S161 §4.3.1 "Modifier keys" (raw lines 4785–4792; the heading is
  `<h4 … data-level="4.3.1" id="keys-modifiers">`).** The section separates the two kinds of
  modifier: *"Some modifiers are activated while the key is being pressed down or maintained
  pressed such as Alt, Control, Shift, AltGraph, or Meta. Other modifiers are activated
  depending on their state such as CapsLock, NumLock, or ScrollLock. Change in the state
  happens when the modifier key is being pressed down."* This is the spec's model of the
  CapsLock latch: **a state change**, not a held-down key. It is what the round measures the
  surface against.
- **The page's read surface — S161 §3.5.1 Interface KeyboardEvent, the `getModifierState(keyArg)`
  method definition (raw line 3327):** `<dt><dfn class="dfn-paneled idl-code"
  data-dfn-for="KeyboardEvent" data-dfn-type="method" data-export
  id="dom-keyboardevent-getmodifierstate"><code>getModifierState(keyArg)</code></dfn>`. This
  is a **local definition site** (the term's own `<dfn>` with a `dom-…` definition id, marked
  `data-export`), not a cross-reference — unlike `defaultPrevented` in the r58 note, which
  S161 does **not** define (see the D9 note below). The same staged bytes carry the
  `EventModifierInit.modifierCapsLock` dict-member definition (raw line 3569,
  `id="dom-eventmodifierinit-modifiercapslock"`), whose own text says that
  `getModifierState()` "when provided with the parameter `CapsLock` must return `true`" (raw
  3574) — the spec's own statement that CapsLock is a *getModifierState-queryable* modifier
  state. **That dfn is a local definition of a DIFFERENT term** — the `EventModifierInit`
  *initializer*, not the latch; it is listed here as one of S161's four CapsLock loci and is
  kept out of the round's measured claim (see Limits).
- **The key code — S161 §7.3.3 "Fixed virtual key codes" (raw lines 6370–6371).** The table
  of keys whose virtual key code does not usually change with the layout lists
  `CapsLock` → **20** — the value the capability's `windowsVirtualKeyCode: 20` matches.
- **The CDP channel and its width — S153, `Input.dispatchKeyEvent` (the command block starts
  at raw 14307).** The `modifiers` parameter (name at raw 14322, description at 14323) is a
  *bit field* — "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4,
  Shift=8" — and **there is no CapsLock bit in it**. The `code` (name raw 14352, description
  14353), `key` (name 14358, description 14359), `windowsVirtualKeyCode` (name 14364,
  description 14365) and `text` (name 14334, description 14335) parameters describe *what
  key* is being delivered, not *what modifier state* results. That asymmetry is the boundary
  this round measures.
- **The implementation-side mapping — S162 (Chromium source,
  `content/browser/devtools/protocol/input_handler.cc`): the `GetEventModifiers` function.**
  This is the ground for *why* the field has only four bits: the CDP handler maps the
  browser's modifier state onto exactly the four documented bits and **ignores every other
  bit**. The definition is at raw line 92 (`int GetEventModifiers(int modifiers,`, 1
  occurrence file-wide); the four branches are raw 103–104 (`& 1` -> `kAltKey`), 105–106
  (`& 2` -> `kControlKey`), 107–108 (`& 4` -> `kMetaKey`), 109–110 (`& 8` -> `kShiftKey`),
  each a 1-hit pattern file-wide.
  `L1-at-S162` — the row's anchor cell is the L1's to write; the guard fields it needs are
  already measured and committed in `.ufo/waves/round-59/sources/s162-fetch-receipt.json`
  (final host `chromium.googlesource.com` == the cited host, `num_redirects 0`, HTTP 200;
  transport 119,284 B base64 sha256 `847c531e…`; staged decoded 89,463 B sha256
  `72cf0d1d…`). **This seat invented no digest, byte count or anchor for S162**; it
  measured the staged bytes and cross-verified the runner's independent copy
  byte-for-byte (`cmp` rc=0).
  **WHAT S162 DOES NOT SAY.** The staged S162 bytes contain **no** CapsLock constant at all:
  a case-insensitive sweep for "caps" over all 89,463 bytes returns **0** hits, and
  `kCapsLockOn` is **0** hits in the file. The Blink-internal caps-lock flag lives in a
  *different* Chromium header that is not staged and not in the registry. So S162 grounds
  **"the CDP channel has four modifier bits and no CapsLock branch"** — a structural
  statement about the channel — and the caps-flag half of this round's finding is the
  **measured absence** (the page's own `getModifierState('CapsLock')` reading), not a
  cited Blink constant. **This note makes no claim about Blink's internal flag.**

### What the Linux Chromium 155 surface does (measured, not inferred)

Live receipt `corpus/evidence/round59/chromium-capslock-boundary/receipt.json`
(L1-at-data: the exact path the live run writes), one run, the frozen driver, nonce
`L1-at-data`:

| step | page-side witness (the page's own record) | field value read back |
|---|---|---|
| before the first CapsLock press | `getModifierState('CapsLock')` **false** | `L1-at-data` |
| CapsLock keyDown (key `CapsLock`, code `CapsLock`, windowsVirtualKeyCode **20**, **no text**) | **delivered**: key `CapsLock`, code `CapsLock`, keyCode **20**, cancelable **true**, defaultPrevented **false**; `getModifierState('CapsLock')` **false** | `L1-at-data` (unchanged — CapsLock inserts no character) |
| CapsLock keyUp (same parameters) | **delivered** with the same shape; `getModifierState('CapsLock')` **false** | `L1-at-data` |
| the nonce-derived letters (r52-style: per-char derived code / windowsVirtualKeyCode, `text` = the char) | **delivered**; `getModifierState('CapsLock')` **still false** | `L1-at-data` (the letters' prefix witnesses) |
| the second CapsLock keyDown + keyUp | **delivered**; `getModifierState('CapsLock')` **false** | `L1-at-data` |
| the final nonce-derived letters | **delivered**; `getModifierState('CapsLock')` **false** | `L1-at-data` |

**The boundary, measured from both sides.**

- **The delivered-shape witness (the positive half):** every CapsLock and letter event
  **reaches the page** with the full shape — key, code, keyCode 20 for CapsLock,
  `cancelable: true`, `defaultPrevented: false`. The event is not swallowed and not
  filtered.
- **The persistent-absence witness (the negative half):** `getModifierState('CapsLock')`
  reads **false on every recorded event** — down, up, and every subsequent letter. The
  modifier state does **not** latch, and it does not latch across the letters either.

The two halves together are what separate *"not delivered"* from *"delivered, state not
settable over this channel"*. A receipt that carried only the absence would not distinguish
them, and a receipt that carried only the delivered shape would look like a working
CapsLock.

### The disclosed CDP injection limit

The **text** of a keystroke is driver-controlled: `Input.dispatchKeyEvent` carries a `text`
parameter (raw line 14334), and the driver chooses it. So "the letter that appeared" is a
statement about the driver, not about the browser. The **delivered shape** is
browser-mediated — the page records what the browser actually delivered. And the **caps
flag** is browser-internal state the page reads back through its own
`getModifierState('CapsLock')` call at the time of each event; the driver neither computes
nor injects it. This is why the capability's witness is the **modifier-state sequence** plus
the **delivered shape**, and why the r59 counter's page-vs-block cross-check (D1) exists: a
witness that rested on driver-side state would be forgeable.

### The D4 positive control (closing the r58 s4 gap)

The r58 note disclosed that the Ctrl+Enter chord had no swallow-OFF positive control, so
"did not submit" could not be separated from "this chord never submits here". Round 59
closes that gap in the **runner generation**: a second form page `/form2`, same fixture
shape, **no swallower**, served by the same fixture server. The **same** Ctrl+Enter chord on
form2's field **does** submit form2 to `/echo2`. The invariant is **exactly one `/echo` AND
exactly one `/echo2`** — the two forms submit independently, and form1's single-submission
invariant from r58 is unchanged. The control is witnessed **client-side** (navigation / URL)
and **server-side** (the served log).

### The D1 / D2 counter checks (closing R58-S1 / D2)

The r59 counter generation closes two r58 gaps:

- **D1 — the page-vs-block cross-check.** Every swallow-block entry's
  `(key, cancelable, defaultPrevented)` triple must match an entry in the page keylog **by
  value**, not positionally; a mismatch is the finding `keylog-flag-mismatch`. The r58
  counter did not compare the page's flags at all, which the r58 sentinel proved live (its
  F1 leg — the page keylog forged to say the swallowed Backspace was *not* prevented — exited
  **0, predicate true**).
  **The rule's own limit, measured:** an existence-by-value check protects exactly the
  entries the witness rests on — forging the swallowed **Backspace** or the **Enter** turns
  it red — but a forge on one of the **non-unique** control entries (the control digits 7 and
  5, the Control modifier) leaves it green, because an equal-valued twin survives. A check
  that also matched per-window occurrence counts, or matched the keyDown only, would be
  strictly stronger.
- **D2 — the step-plan check.** The counter embeds the r59 driver's **declared step list**
  and requires the receipt's recorded steps to equal it exactly; missing, extra or reordered
  steps are the finding `step-plan-mismatch`. A file-only counter cannot otherwise tell a
  forged-but-consistent receipt from the committed one.
- **CapsLock-boundary checks in the same generation.** The delivered shape on every
  CapsLock and letter event; `capsLatchExpected: false` asserted against the receipt's named
  expectation — **any true is a finding**; the form2 leg's exactly-one-`/echo2` with the
  nonce parameter.

### Limits (stated, not smoothed)

- **L1-at-data — the note's own limits paragraph.** The L1 fills this from the live run:
  the surfaces *not* measured (a physical CapsLock press on a desktop session, IME
  composition, a real site, the webview2 surface, the browser's own UI behaviour) and any
  residual the r59 counter's selftests did not close.
- **The negative is scoped to this channel.** The round measures that the latch is **not
  reachable over CDP key injection** on this surface. It does **not** measure that the
  browser cannot latch CapsLock — a physical CapsLock press, a different input route, or a
  different browser may latch. The claim is a **delivery-boundary** claim about *this*
  surface and *this* channel, and the note says so.
- **The mechanism is attributed to the sources, not to a re-derivation.** The round-59
  measure is *that* the flag does not set; *why* is grounded in S153's four-bit field and
  S162's `GetEventModifiers` mapping (four bits, no CapsLock branch). This seat did not
  read the Chromium source tree and makes no claim beyond what S162's located quote
  carries. **In particular, this note does NOT claim that Blink holds a caps-lock bit
  (`kCapsLockOn`, `1<<9`) that CDP cannot set:** that constant is **absent** from the
  staged S162 bytes (0 hits for "caps" in 89,463 bytes) and lives in a header that is not
  staged and not in the registry. The note's boundary claim rests on the **structural**
  fact (the CDP channel exposes four modifier bits and no CapsLock branch) plus the
  **measured** absence (the page's own reading), both of which are sourced.
- **The `modifiers` bit field cannot express the latch at all.** CapsLock has no bit in
  S153's Alt=1 / Ctrl=2 / Meta=4 / Shift=8 field (raw 14323). A counter or a note that read
  the modifiers mask for the CapsLock state would read a permanent false — which is
  consistent with the measured absence, but is **not** the evidence for it: the evidence is
  the page's own `getModifierState('CapsLock')` reading.
- **Not measured:** the `EventModifierInit.modifierCapsLock` **initializer** path (S161
  §3.5.3, raw 3569) — that is the *author-supplied* way to make `getModifierState('CapsLock')`
  return true on a synthetic event, and it is a different mechanism from the browser's own
  latch. The round measures the latch path's boundary, not the initializer.
- **The counter's page-vs-block check is not a total one.** The existence-by-value rule
  catches a contradicted **swallow** (the Backspace and the Enter) but is **masked** on the
  three **non-unique** control entries, where an equal-valued twin survives. The check
  therefore protects exactly the entries this note's witness rests on; it does not assert the
  control entries' flags on its own.

### What S161 does and does not define here (the D9 note)

Read this before reading the Grounding section as more than it says. The per-term
classification below is the round-59 definition-site sweep's, recorded in
`.ufo/waves/round-59/probes/d9-green-capslock.txt` (sha256 `7e4c71b4…`, 32,218 B) and
independently re-verified by this seat's byte sweep against the same staged bytes — the two
agree on every term.

- **S161 DOES define `getModifierState`** — a local `<dfn>` with the definition id
  `dom-keyboardevent-getmodifierstate` (raw line 3327), marked `data-export`, with the
  interface's IDL entry at raw 3160; the spec's own anchor table at raw 9799 marks the term
  `"spec":"uievents","status":"local"`. The definition-site sweep for this term finds a
  **definition site**.
- **S161 states the CapsLock latch semantics in normative prose — it does NOT define a
  CapsLock term.** §4.3.1 "Modifier keys" (raw lines 4785–4792) names CapsLock among the
  modifiers "activated depending on their state" and says "Change in the state happens when
  the modifier key is being pressed down". That is prose **in a normative section**, not a
  `<dfn>`-marked term definition: **there is no `<dfn>` for the string "CapsLock" anywhere
  in S161.** The sweep records four local loci for the term — the state-activation prose at
  raw 4791, the key-code table row mapping CapsLock to 20 at raw 6370–6371, the
  `getModifierState` parameter prose at raw 3574, and the `modifierCapsLock` dict-member
  `<dfn>` at raw 3569 — and the last of those is a local dfn for a **DIFFERENT term** (an
  `EventModifierInit` dict-member: the author-supplied *initializer*), **not** of the latch.
  The note says exactly this, and the note's CapsLock claim is therefore **prose-grounded
  plus measured**, never dfn-grounded.
- **S161 does NOT define `defaultPrevented` or `preventDefault()`** — those are
  DOM-Standard cross-references (the r58 note's own correction, and the red-before receipt
  `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt`: the sweep over the r58
  staged bytes finds **no** definition site, all four occurrences resolving to the DOM
  Standard by reference). The round-59 note therefore makes **no** claim resting on S161 for
  those terms.
- **A term whose sweep finds no definition site is a finding, not a failure of the sweep**;
  and the sweep's own scope, quoted from the red-before receipt: "the criterion does not say
  the term must be defined in the cited source; it says a definition-site sweep must be
  RUN." The green receipt adds the companion caution: "A definition site existing does not
  make the claim's USE of it correct; this receipt answers only the criterion's question
  (does the cited source define the term it is cited for)."

### Gate

Admitted: the S161 re-open's located grounds (the §3.5.1 `getModifierState` definition site
at raw 3327; the §4.3.1 state-activation prose at raw 4791; the §7.3.3 CapsLock virtual key
code 20 at raw 6370–6371); the S153 re-open's `Input.dispatchKeyEvent` parameter and
modifiers-bit-field descriptions (raw 14322/14334/14352/14358/14364); the S162 open (the
`GetEventModifiers` bit-mapping ground at raw 92 — the four-bit mapping and no CapsLock
branch); the measured **negative**: the delivered-shape witness together with the
persistent-absence witness, on the live receipt. **Rejected for this entry:** the original
frozen C2's latch sequence (`getModifierState('CapsLock')` false → true → held → false) — it
is unreachable on this surface and is superseded by the L1's pre-data restatement (see
`.ufo/waves/round-59/claims.json` → `preDataCorrection.c2Restatement`); any claim that S161
*defines* the CapsLock latch semantics as a `<dfn>`-marked term (there is **no** `<dfn>` for
the string "CapsLock"; the semantics are stated in normative prose and the modifier's own
dfn is the `EventModifierInit` initializer, a different term); any claim resting on S161 for
`defaultPrevented` / `preventDefault()`; any claim that **S162 is CapsLock ground** (the
staged S162 bytes contain zero CapsLock occurrences — S162 grounds the four-bit channel
mapping only); and any claim that the browser cannot latch CapsLock at all — the round
measures the **CDP channel's** boundary, not the browser's capability. Spot-check and
located quotes: `corpus/lessons/round-59.md` `## Gate`.
````

---

## Notes for the L1

1. **The Grounding section cites only what S161, S153 and S162 define**, per the D9 lesson
   (the r58 class: a claim citing a source for a named term where the source does not define
   it). Every S161 and S153 ground in the draft was located and byte-checked by this seat in
   the **staged bytes**; the raw line numbers are given so the L1's own re-check is
   mechanical. The S162 ground is a **slot** — no invented digest, byte count or anchor.
2. **The D9 note inside the draft is the honesty section**, and it now carries three
   separate classifications (`getModifierState` = definition site; the CapsLock latch =
   normative prose; `GetEventModifiers` = the function definition on S162). If
   `.ufo/waves/round-59/probes/d9-green-capslock.txt` classifies any term differently, **the
   note follows the probe** — read it before landing.
3. **The measured model is a negative and the note says so in its first paragraph.** The
   "why this is worth a note" paragraph is the note's argument for admitting a negative as
   knowledge: it separates *not delivered* from *delivered-but-not-settable*, which the r57
   residual was after. Keep it — without it a reader sees a failing capability and not a
   measured boundary.
4. **The `L1-at-data` and `L1-at-S162` cells are the live run's and the S162 fetch's facts.**
   They are not stylistic placeholders — do not land them unfilled.
5. **Shape follows the r58 note**: `source:` / `verified-at:` / `recheck:` header trio, then
   the question-and-scope line, then Grounding, then the measured table, then Limits, then
   Gate. The r58 note's per-step table is two columns (page-side witness / driver-recorded
   block); round 59's is two columns (page-side record / field value read back) because the
   witness is the page's own record.
6. **The note's file path** is `corpus/knowledge/chromium-capslock-boundary-round-59.md`, and
   the round's lesson is `corpus/lessons/round-59.md` — the two paths the registry's used-by
   extension names (see `scribe/usedby-oldnew.txt`). **Both must exist on disk before the L1
   edits `SOURCES.md`**, or the fleet census emits `E11 used-by path missing on disk`.
7. **The capability name** is `chromium-keyevent-delivery-boundary-linux` (the restated
   frozen claim's axis field), **first-working 59**.
