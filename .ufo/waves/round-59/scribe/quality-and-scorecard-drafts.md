# Round 59 — QUALITY.md criterion 111 + SCORECARD D10 statement (DRAFT for the L1)

Seat R59Scribe, round 59 wave w1, 2026-11-03. **DRAFT ONLY — this seat wrote nothing in
`corpus/`.** The L1 integrates.

---

## 1. QUALITY.md criterion 111 — the definition-site sweep

**Where it lands.** `corpus/QUALITY.md` is append-only ("never edit above"). The last
numbered criterion is **110** (the full-prefix citation rule, landed in the *Round 56
additions* section). The round-59 criterion therefore takes the number **111** and a new
section header `## Round 59 additions (append-only; never edit above)`, appended after the
*Round 56 additions* block. **No criterion above 110 is edited, renumbered or moved.**

### Draft criterion text (verbatim, ready to land)

```
111. The definition-site sweep rule: a claim that cites a source for a NAMED TERM runs a
     grep for that term's DEFINITION SITE in that source's staged bytes BEFORE the freeze,
     and records the result — a term the cited source does not define may not be cited as
     that source's ground. The sweep looks for a local definition site (a `dfn` /
     `data-dfn` element, a `<dfn>`-wrapped term, an IDL `attribute` declaration, a
     `id="dom-…"` definition id), NOT for a cross-reference anchor; a `ref-for-…` id or a
     link out to another specification is a cross-reference, and the term's definition site
     is in THAT other specification. The sweep's result is recorded as a receipt (the
     commands, the raw line numbers, and the per-occurrence classification:
     definition site / prose / cross-reference / absent). A term whose sweep finds NO
     definition site is a finding, not a failure of the sweep — the sweep's obligation is to
     RUN and to RECORD, and the citation's wording is corrected to name the locus that
     actually defines the term. Red state: the round-58 C2 claim cited S161 (W3C UI Events)
     for `defaultPrevented` and `preventDefault()` and passed freeze with no such sweep; the
     sweep applied to the r58 staged bytes
     (`.ufo/waves/round-58/sources/uievents.html`, 920,762 B, sha256 `8ded5eaf…`) finds
     **no definition site** — all four occurrences of the term in the 920,762-byte document
     resolve to the DOM Standard by reference (raw 2064 the `id="ref-for-dom-event-
     defaultprevented"` cross-reference list item; raw 7924 the external `dfn` panel; raw
     9079 the external `dfn` record with `"external":true`; raw 9878 the anchor-table entry
     whose `"shortname"` is `dom`, not `uievents`), and the `id="dom-defaultprevented"`,
     `data-dfn` and IDL-attribute forms all grep empty. The criterion therefore CAN fail and
     DOES fail on the r58 claim: applying it before the r58 freeze would have rejected the
     citation and forced the corrected wording the r58 knowledge note eventually recorded
     after the fact. GREEN state (the same sweep, this round's terms, over
     `.ufo/waves/round-59/sources/uievents.html` 920,762 B sha256 `8ded5eaf…` and
     `.ufo/waves/round-59/sources/browser_protocol.json` 1,423,170 B sha256 `d6737c31…`):
     `getModifierState` is a local definition site (raw 3327; the anchor table at raw 9799
     marks it `"spec":"uievents","status":"local"`), `key` and `windowsVirtualKeyCode` are
     dispatchKeyEvent parameter definitions (raw 14358 and 14364), and `CapsLock` — the term
     this round's claim turns on — has **no `<dfn>` for the string**: it carries four local
     loci (the state-activation prose at raw 4791, the key-code table row mapping CapsLock to
     20 at raw 6370–6371, the `getModifierState` parameter prose at raw 3574, and the
     `modifierCapsLock` dict-member `<dfn>` at raw 3569 — a local dfn for a DIFFERENT term,
     the `EventModifierInit` initializer, not of the latch). A term with no definition site
     is a finding to record, not a reason to soften the claim; the citation's wording is
     corrected to say what the source actually carries. (source:
     `corpus/lessons/round-59.md` Mistakes — the D9 row — +
     `corpus/lessons/round-58.md` Mistakes row 2; receipts
     `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt` (red) and
     `.ufo/waves/round-59/probes/d9-green-capslock.txt` (green))
```

### Notes for the L1

1. **The red state is a committed receipt, not an assertion.** The red receipt is
   `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt` (authored by R59Probes);
   it carries the verbatim greps, their exit codes, the per-occurrence classification of all
   four occurrences, and the RED verdict. The criterion cites it by full prefix.
2. **The criterion's scope is honest.** The probe receipt's own SCOPE NOTE says it: *"the
   criterion does not say the term must be defined in the cited source; it says a
   definition-site sweep must be RUN."* The draft criterion is written to match that scope —
   the obligation is RUN + RECORD, and the consequence is a wording correction, not a
   prohibition. **Do not strengthen it into "the term must be defined in the cited source"** —
   that would overstate both the criterion and the probe.
3. **The green side is a separate receipt — NOW LANDED** (sha256
   `7e4c71b47ae875c1dbd0017eb90de93ec7ef67425b3cfce2486df3ab2dc453ad`, 32,218 B).
   `.ufo/waves/round-59/probes/d9-green-capslock.txt` (R59Probes) runs the same sweep for
   this round's terms, over the same staged bytes (its own `cmp` of the r59 staged copies
   against the r58 ones exits 0 — no drift this round). Its classification is the
   authority for the round-59 knowledge note's wording. The sweep carries **FOUR terms**,
   each with its own classification — and they must stay **separate**, never collapsed into
   one "found" verdict:

   | Term | Source | The probe's classification | The located locus |
   |---|---|---|---|
   | `getModifierState` | S161 | **DEFINITION SITE FOUND** (a local dfn) | raw **3327** — `<dfn … data-dfn-for="KeyboardEvent" data-dfn-type="method" data-export id="dom-keyboardevent-getmodifierstate">`; the IDL entry at 3160; the anchor table at raw 9799 marks it `"spec":"uievents","status":"local"` |
   | `CapsLock` | S161 | **NO dfn for the string** — the finding, not a failure | four local loci: the latch prose at **4791**, the key-code table row `<td>CapsLock` / `<td>20` at **6370–6371**, the `getModifierState` parameter prose at **3574**, and the `modifierCapsLock` dict-member dfn at **3569** — that last one is a local dfn for a **DIFFERENT term** (an `EventModifierInit` dict-member, the author-supplied *initializer*), not of the latch |
   | `key` | S153 | **DEFINITION SITE FOUND** (dispatchKeyEvent parameter, type string) | raw **14358** (description 14359) inside the `dispatchKeyEvent` block that starts at raw 14307 |
   | `windowsVirtualKeyCode` | S153 | **DEFINITION SITE FOUND** (dispatchKeyEvent parameter, type integer) | raw **14364** (description 14365); the name occurs **once** file-wide, so there is no ambiguity |
   | `GetEventModifiers` (supplementary) | S162 | **DEFINITION SITE FOUND** (the function definition) | raw **92**; **ZERO** CapsLock occurrences in the file (`grep -i capslock` exit 1) — S162 grounds the four-bit channel mapping **only** and is **not** CapsLock ground |

   **This seat's independent byte sweep agrees with the probe on every point** — the same
   definition site (3327), the same four CapsLock loci, the same "no dfn for the string"
   finding, the same zero-CapsLock result in S162. The probe's own per-term verdict is
   **GREEN (3 of 4 terms carry a dfn definition site; CapsLock carries no dfn but four local
   loci)**.

   The middle row is the one that carries the round's honesty: **an absent definition site
   for the latch semantic is a finding to state, not a reason to soften the note** — the
   note must say S161 *states* the latch model in prose while *defining* no toggle state
   machine. The probe's own honest-limits section adds the sentence that matters most for
   the criterion's scope: "A definition site existing does not make the claim's USE of it
   correct; this receipt answers only the criterion's question (does the cited source define
   the term it is cited for)." Note also that S161's **Modifier Keys table is a
   CROSS-REFERENCE** to the external `[UIEvents-Key]` specification (raw 3340, 7531); S161
   does not contain it.

   **A CORRECTION OF RECORD in the green receipt, disclosed in place.** The receipt's first
   write printed the first **file-wide** hit for two terms — `"name": "key"` at raw 3053
   (`EventMetadata.properties`) and `"name": "code"` at raw 2702
   (`InspectorIssue.properties`) — because its line lookup was unscoped; both are unrelated
   domain types, not `dispatchKeyEvent` parameters. This seat's independent byte sweep
   caught it; the probes seat corrected the receipt and re-verified the scoped lines with
   `awk 'NR>=14307 && NR<=14460 && /"name":/ …'`, which yields the 15 parameters in order
   (type 14311, modifiers 14322, timestamp 14328, text 14334, unmodifiedText 14340,
   keyIdentifier 14346, **code 14352, key 14358, windowsVirtualKeyCode 14364**,
   nativeVirtualKeyCode 14370, autoRepeat 14376, isKeypad 14382, isSystemKey 14388,
   location 14394, commands 14400). The receipt keeps the wrong values **only inside the
   correction note that names them**, and its JSON structural parse was always correct.
   **The lesson's Gate rows must cite the SCOPED lines** (code 14352 / key 14358 /
   windowsVirtualKeyCode 14364 / text 14334 / modifiers 14322) — not 3053 / 2702, which
   point at unrelated domain types in the same 1.4 MB file. This seat's drafts already
   carry the scoped lines, which are the same spans its own byte-exact quote verification
   confirmed.
4. **Numbering.** Criterion 111 is next in sequence after 110. If the L1 lands another
   criterion in the same file this round, the numbering is the L1's call; this draft assumes
   111 because 110 is the current maximum.
5. **Round-58 bytes are not edited.** The red state cites the r58 lesson's Mistakes row 2 —
   the criterion is a forward-looking rule, and the r58 lesson keeps its wording.

---

## 2. SCORECARD.md — the D10 statement (capability-only claims hold their axis score)

**Where it lands.** `SCORECARD.md` is cumulative. The round-58 block ends with a
`### Planned / saturation / retired - round 58` section, and the round-58 block carries a
`### Capabilities - round 58` table (the `capabilities:` table's per-round instance) plus a
`### Round 58 - sources, frontier, trend verdicts` section. The round-59 block is the L1's;
this draft supplies the **D10 statement text** the round-59 block must carry.

### Draft statement (verbatim, ready to land)

Where it sits: in the round-59 SCORECARD block, immediately after the C2 capability row
(or in the round-59 sources/frontier/trend section, as a `capability-vs-axis` note). The
L1 chooses the placement; the wording is fixed.

> **Capability vs axis (D10).** C2 is a **capability-only** claim: it adds the capability row
> `chromium-keyevent-delivery-boundary-linux` to the `capabilities:` table and it does **not**
> move any axis score. The **coverage** axis score is **held at 9** because `AXES.md`
> (`## Capabilities — the repertoire table`) keeps the capabilities table **separate from the
> six scored axes** — "The six axes measure the quality of what the skill knows; they do not
> measure what the shokunin can now *do*. `SCORECARD.md` therefore carries a separate
> `capabilities:` table". Repertoire growth is therefore **not** axis movement, and the
> capability row's entry in the `capabilities:` table is **not** an axis move: the coverage
> score is unchanged at 9, and the round-59 C1 claim (adjacency, the lowest owned axis) is
> the round's axis-bearing claim. Read this line before reading a capability row as a score
> change.
>
> **A capability that is a MEASURED NEGATIVE still enters the table on the same terms.** The
> round-59 C2 capability is the delivery-boundary measurement — the surface's events deliver
> while the caps latch flag does not set over CDP. `AXES.md` §Capabilities admits a row on
> the ground that "a capability without a passing demonstration in the round report is
> pre-claiming and does not enter the table": the capability is *what the surface can now do
> and be shown to do* — here, to measure and report the boundary — and the round's
> demonstration is the passing, committed, counter-verified receipt. The row's "what it can
> now do" line must therefore describe the **measurement** (the boundary), not a working
> CapsLock modifier. A negative that is honestly measured and reported is repertoire growth;
> it is not an axis move, and it is not a silent claim that the surface latches CapsLock.

### Notes for the L1

1. **The AXES.md quote is verbatim.** `AXES.md` §Capabilities reads: "The six axes measure the
   quality of what the skill knows; they do not measure what the shokunin can now *do*.
   `SCORECARD.md` therefore carries a separate `capabilities:` table — name → what it can now
   do → evidence pointer → first-working round." The draft quotes only the first two
   sentences; it does not quote the table's column list (not needed for the statement).
2. **The trend reading is the thing being prevented.** D10's routed text: *"This prevents the
   trend reading from mistaking repertoire growth for axis movement."* The draft says so
   explicitly in its closing sentence.
3. **It pairs with the r58 verdict.** The r58 closure already reached the same conclusion
   from the outside ("capability row enters the table, but AXES.md §Capabilities keeps
   capabilities separate from the six scored axes; score held at 9" —
   `corpus/lessons/round-58-verifier-spotcheck.md` §2, axis verdicts table). The round-59
   statement is the **lane's** landing of that reading, not a new claim.
4. **Do not write an axis score into the capability row.** The statement's whole content is
   that no axis score changes; an "improved coverage" cell beside the capability row would
   contradict it.

---

## 3. The D9 lesson row (cross-reference; the prose lives in the round-59 lesson's Mistakes)

The `## Mistakes` table of `corpus/lessons/round-59.md` carries one row per mined mistake
(class · evidence · captured-by · fix). The D9 class is the **landing overstatement** class
the r58 lesson already named ("landing: frozen claim wording overstated its source"), and
round 59's instance is that the sweep is now a **gate** rather than a process rule. Draft
row (the L1 owns the table's final wording; this is the content to carry):

| Class · evidence | Captured-by | Fix |
|---|---|---|
| **landing / gate gap (the D9 class): the definition-site sweep was a process rule, not a gate.** In round 58 the r58 C2 claim cited S161 for `defaultPrevented` / `preventDefault()`, which S161 does not define (they are DOM-Standard cross-references), and the wording gap was only caught after the fact by a lane-dispatched scribe and a sentinel; the capture rule was named in the r58 lesson's Mistakes row 2 but was not a `QUALITY.md` criterion and had not been shown able to fail. Evidence: `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt` — the sweep on the r58 staged bytes finds **no** definition site (four occurrences, all DOM-Standard cross-references; the `id="dom-defaultprevented"`, `data-dfn` and IDL-attribute forms grep empty). | the sweep itself (run this round on the r58 state); the r58 seat caught the overstatement, not the gate | **CLOSED as a gate this round:** landed as `corpus/QUALITY.md` **criterion 111** (the definition-site sweep rule) with the red-before receipt above; the green side is `.ufo/waves/round-59/probes/d9-green-capslock.txt`. The rule's standing form: *run the sweep and record the result before the freeze; a term the cited source does not define is cited to the locus that does.* |

**Caution for the L1:** the D9 row's evidence must name the sweep's **result** (no definition
site found for `defaultPrevented` in S161), **not** a claim that the round-59 sources
define CapsLock latch semantics. Whether they do is the *green* receipt's finding and must be
read before the row is finalized.
