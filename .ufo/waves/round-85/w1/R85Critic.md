# R85Critic — falsification of C1 origin-determination wording, the no-picker law, and the limit

**Seat:** R85Critic — Tabi round 85 wave w1. Read-only seat; findings only.
**Axes named:** `coverage` (C1, predicate C1-SHOWPICKER-R85) and `operability` (C2, predicate C2-FAMILYWITNESS-R85).
**Scratch:** `/fast/scratch/hyaku/tabi-r85/R85Critic/` (deleted before yield).
**Scored inputs read:** `.ufo/waves/round-85/scored/counter-a.json` (clean, checkCount 87), `battery-a.json` (175 cases, 0 failed, 87/87), `killpower-a.json` (58 mutants, 58 killed, 0 survived, 0 crashed), `witness-a.json` (0 bytes at read time — superseded by direct re-run below), `corpus/evidence/round85/chromium-showpicker/receipt.json` (24 legs, failures []), `scripts/check-showpicker-r85.mjs` @ 6239abdf, `scripts/chrome-cdp-showpicker-round85.mjs` (LEGS @ lines 191–196, fixture IDs `tes/ses/txs` vs `te/se/tx`), `scripts/negatives-showpicker-r84.mjs` @ 9C33 (162-case battery), `scripts/negatives-showpicker-r85.mjs` (175-case battery; new `cross-tel-*` cases at lines 238–243), `scripts/witness-families-r85.mjs` (lines 41–48 FAMILIES), `.ufo/waves/round-84/w1/R84Mut1.md` (§5, 51 survivors).

---

## (1) Origin-determination: the activation confound is real in design, but the receipt DOES pin it — the gap is a missing counterfactual, not a missing field

### What the driver actually does (LEGS table, chrome-cdp-showpicker-round85.mjs lines 191–196)

| leg | target | origin context | priorClick | activationBefore → After (receipt) |
|---|---|---|---|---|
| `sp85-same-origin-tel` | `tes` (same-origin `<input type="tel" id="tes">`) | parent page | `null` | `{false,false} → {false,false}` |
| `sp85-same-origin-search` | `ses` | parent page | `null` | same |
| `sp85-same-origin-text` | `txs` | parent page | `null` | same |
| `sp85-same-origin-tel-activated` | `tes` | parent page | `{at:[360,40], wantTarget:'pad'}` (trusted CDP click) | `{true,true} → {false,true}` |
| `sp85-same-origin-search-activated` | `ses` | parent page | same | same |
| `sp85-same-origin-text-activated` | `txs` | parent page | same | same |
| `sp84-cross-origin-tel` | `te` (child `<input type="tel" id="te">`) | cross-origin iframe | `null` | parent `{false,false} → {true,true}`; child `{false,false} → {true,true}` |
| `sp84-cross-origin-search` | `se` | iframe | `null` | same |
| `sp84-cross-origin-text` | `tx` | iframe | `null` | same |

The **cross-origin** click is not a `priorClick` at all: it is the child's own `go12/go13/go14` button click inside the child origin (`childEvents` = 5 trusted events `pointerdown…click` on `go12`, `act:true`, `at≈116–120`). `activationBefore={false,false} → activationAfter={true,true}` and `childActivationBefore={false,false} → childActivationAfter={true,true}` for all three cross legs (measured from receipt legs `sp84-cross-origin-tel/search/text`).

The **same-origin activated** click is a `priorClick` on the transparent `#pad` div (parent page), granting transient activation in the **parent**; there is no cross-origin element.

### Measured results (receipt, verbatim)

- `sp85-same-origin-tel/search/text`: `showPicker={ok:false, name:'NotAllowedError', message:"…showPicker() requires a user gesture."}`, `chooserWaitMs≈2011–2014`, `firstChooserBackendNodeId=null`.
- `sp85-same-origin-{tel,search,text}-activated`: `showPicker={ok:true, ret:'undefined'}`, `chooserWaitMs≈2009–2013`, `firstChooserBackendNodeId=null` — i.e. returns undefined, **zero** `Page.fileChooserOpened`, zero choosers. `same-origin-no-picker-law` (counter line 654) pins exactly this.
- `sp84-cross-origin-{tel,search,text}`: `childResult={ok:false, name:'SecurityError', message:"…showPicker() called from cross-origin iframe."}`, `chooserWaitMs 0–1`, `childLate=0`.

### The falsification attempt — and why it fails on fields but succeeds on design

**Fields ruling out activation-as-cause exist and are frozen:**

1. `ACT_LAW` in the counter pins, per leg, the parent `activationBefore/After` pair (lines 259–289): cross legs `{false,false}→{true,true}`, same-origin non-activated `{false,false}→{false,false}`, same-origin activated `{true,true}→{false,true}`.
2. `CHILD_ACT_LAW` pins the child `{false,false}→{true,true}` for every cross leg (witness families explicitly target `childActivationBefore/After` — see §3).
3. `activation-law` check (line 563) refuses any leg whose parent pair deviates; `sp84-cross-origin-*-law` checks refuse any cross leg whose child pair deviates.
4. For `sp85-same-origin-tel-activated`, `activationBefore={isActive:true}` **at call time** (receipt field) — the call was made under transient activation and returned `undefined`, not an error. This is the correct same-origin WITH-activation control.

**The confound, stated precisely:** the C1 wording "the SecurityError is origin-determined" is now true for the ** activated** comparison on *different elements* but is **unproven for the non-activated comparison on the same element**, because:

- The same **input type** (`tel`) exists as two different elements: same-origin `tes` and cross-origin child `te`. They are not the same element, not the same origin, and not the same calling context (parent-direct call vs `go12` click-handler call).
- The `sp85-same-origin-*` (non-activated) and `sp84-cross-origin-*` (activated via `goNN`) legs differ on **two** factors at once: origin **and** activation. A sceptic can attribute the `NotAllowedError` vs `SecurityError` outcome to either.
- What is pinned (and measured) is the **conjunction**: `same-origin + no-activation → NotAllowedError`, `same-origin + activation → undefined + zero choosers`, `cross-origin + activation (in child) → SecurityError`. The **fourth cell** — `cross-origin WITHOUT activation` — does not exist in the receipt, and neither does a same-element counterfactual (`te` called without the `go12` click, or `tes` called from a cross-origin iframe without activation).

**Precise gap to name:** *no leg holds the input element constant while varying origin with activation held constant.* The activated cross-origin leg and the activated same-origin leg share `activationAfter={true,true}` (child) / transient-activation (parent) but call on different elements (`te` vs `tes`) in different execution contexts (iframe child script vs top-page script). The non-activated same-origin leg and the activated cross-origin leg share neither `activationBefore` nor `activationAfter` — they are the confounded pair the C1 prose implicitly compares when it says "same-origin without activation throws NotAllowedError, cross-origin throws SecurityError" in one breath.

**Smallest safe correction (to wording, not to any frozen predicate/counter/pin):** narrow C1's law sentence to the measured conjunction: *"same-origin without activation → NotAllowedError; same-origin with (parent) transient activation → `showPicker()` returns `undefined` with zero `Page.fileChooserOpened` and zero choosers; cross-origin (with child activation via the `goNN` click) → SecurityError."* Do **not** claim the fourth cell or same-element origin-determination — it is inside the frozen limit. The receipt does pin activation as non-causal for the cross-origin SecurityError because the cross legs *are* activated and still throw SecurityError while the same-origin activated legs return undefined; that inference is sound and SHOULD be kept, but it must be worded as *activation-held-constant across origins* (both activated, different elements), not as an unconditional "origin-determined" claim over all activation states.

**Verdict on (1):** C1 as written **overstates** by one cell. The overstatement is fixable by wording alone; the measurements do support origin-determination **when activation is held at "active"** (cross-origin SecurityError despite activation vs same-origin undefined despite activation). No axis is harmed by the landing if the wording is narrowed; as-is, the coverage axis is **mildly harmed** (claim exceeds evidence). [INFERENCE] — the overstatement is calibration, not fabrication: all six legs are measured and pinned, but the prose does not name the input-element switch (`tes` ≠ `te`) or the missing fourth cell.

---

## (2) The `limit` constant-offset escape: printed, demonstrated by the battery itself, and reproduced

### The counter's printed `limit` block (measured from counter-a.json, re-run this seat)

```json
{
  "sentence": "refuse when absMatched >= ceil(0.5 * prior events); the escape minimum is priorEvents - absNeed + 1 moved events. The gap side is reported, not a refusal: this driver's fixed waits reproduce gap durations across honest runs, so a gap match is a driver artifact. A forger who moves fewer events but shifts EVERY event by a constant offset escapes this rule — that is the limit.",
  "tolerance": 0.05,
  "gapMin": 50,
  "ownEvents": 76,
  "ownGaps": 3,
  "perPrior": [{ "priorEvents": 76, "priorGaps": 2, "absMatched": 2, "gapMatched": 0, "absNeed": 38, "gapNeed": 2, "escapeEvents": 39, "refused": false }]
}
```

Source: `scripts/check-showpicker-r85.mjs` lines 27–34 (frozen sentence) and line 761 (the `limit` block). The rule: `pairs()` flattens *all* legs' `pageEvents` to `{ts, at}` pairs; `pairMatch` counts pairs whose `(ts, at)` both fall within `TOL=0.05` of a prior pair; `refuse` iff `absMatched >= ceil(0.5 * priorEvents)`. A **constant shift** moves every pair by the same vector, so `absMatched` drops to (near) zero: gaps are invariant under constant shift, and the gap side is **reported, never a refusal** (by the sentence's own rationale).

### Reproduction (this seat, direct counter run)

I copied the scored receipt, added exactly `+2.0` to every `pageEvents[].ts` and `pageEvents[].at` (far beyond `TOL 0.05`), and ran the frozen counter:

```
shifted copy written
exit=1   # prior-set-complete only (receipt outside lane tree counts the real receipt as outside)
verdict findings  checks[replay-event-timeline]=true (PASS)
limit perPrior=[{priorEvents:76, priorGaps:2, absMatched:0, gapMatched:0, absNeed:38, gapNeed:2, escapeEvents:39, refused:false}]
findings=[prior-set-complete … /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round85/chromium-showpicker/receipt.json]
findings[0] does NOT mention replay-event-timeline
```

`replay-event-timeline` **passes** (`true`) on a receipt whose every page event was shifted by a constant — the escape fires exactly as the `limit` block names it. The only finding is the `prior-set-complete` guard firing because the forged receipt lives outside the lane tree (it counts the real receipt as an unlisted in-tree receipt); that is a lane-tree-walk artefact, not a replay refusal. The battery itself demonstrates the same property: `accept('accept-retimed', … { e.ts+1; e.at+1 })` (`negatives-showpicker-r85.mjs:253`, identical in r84:242) is a **must-accept** case — the battery *requires* acceptance of a constant-shifted copy.

**Kernel of the falsification:** the "escape minimum" `39 = 76 − 38 + 1` is the minimum *number of events* that must be moved to evade; the constant-offset escape moves **all 76** by a tiny amount and evades without crossing that minimum in the match-count sense. The `limit` block therefore **correctly discloses** the escape — prose in the counter is honest. But C1's coverage claim (incl. kill rule "any leg false … → NOT verified") does not tell the reader that replay protection is **relational-to-tolerance, not absolute**: after the disclosed offset, `absMatched=0`. C1 SHOULD be read with that disclosure attached.

**Wording that must be attached (narrowing, not amendment):** any downstream consumer quoting "frozen counter exits 0 clean at checkCount 87" as replay-proofing MUST append: *"a forger shifting every page event by a constant escapes `replay-event-timeline` by design (measured: +2.0 uniform shift → `replay-event-timeline` true, `absMatched` 0)."*

**Verdict on (2):** the `limit` is honestly printed and honestly measured — it is a **property of the counter** (numbers: `priorEvents 76`, `absNeed 38`, `escapeEvents 39`, `tolerance 0.05`, `gapMin 50`), not of the battery. The battery's `accept-retimed` case merely *witnesses* the property. Any claim of replay protection that omits the disclosure is a calibration defect; the frozen claim itself (claims.json `limit`) does carry the disclosure, so **no axis is harmed** by the landing itself — only by downstream quoting.

---

## (3) C2 "3 of 6 families alive under the frozen r84 battery": a property of the r84 **counter bytes + battery legs**, not of either alone

### Re-run (this seat, stdout)

```
node scripts/witness-families-r85.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --work /fast/scratch/hyaku/tabi-r85/R85Critic/wit --json
BEFORE {'families': 6, 'survivors': ['cross-access-dropped', 'cross-childseq-dropped', 'cross-childact-before-dropped'], 'killed': 3, 'crashed': [], 'unapplied': []}
AFTER  {'families': 6, 'survivors': [], 'killed': 6, 'crashed': [], 'unapplied': []}
cross-message-unpinned      before killed (1 fail, first cross-origin-tel-message)    after killed (2)
cross-childlate-dropped     before killed (1 fail, first cross-origin-text-late)     after killed (2)
cross-access-dropped        before SURVIVED (162 cases, 0 failed)                    after killed (1, cross-tel-crossaccess)
cross-childseq-dropped      before SURVIVED (162 cases, 0 failed)                    after killed (1, cross-tel-childseq)
cross-childact-after-dropped before killed (1 fail, cross-origin-search-activation)  after killed (2)
cross-childact-before-dropped before SURVIVED (162 cases, 0 failed)                  after killed (1, cross-tel-childact-before)
```

The six `from → to` weakenings are `witness-families-r85.mjs:41–48` and apply **inside the per-`extra` extras-loop** (`check(extra + '-law', …)` in both r84:558 and r85:589):

- `cross-message-unpinned`: `same(ex.childResult, CHILD_RESULT_LAW[extra])` → ok+name only.
- `cross-childlate-dropped`: `&& ex.childLate === 0` → dropped.
- `cross-access-dropped`: `same(ex.parentCrossAccess, {contentDocument:null, windowDocument:'SecurityError'})` → `isObj(...)`.
- `cross-childseq-dropped`: `same(seq)` → `length===5`.
- `cross-childact-after-dropped`: `same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1])` → `isObj(...)`.
- `cross-childact-before-dropped`: `same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0])` → `isObj(...)`.

### Why 3 survive in r84 — and which "would carry the case"

The r84 battery (162 cases) carries cases for childLate (`cross-origin-text-late`, line 176; `w-cross-nonfile-childlate-dropped`, line 295 for the **nonfile** leg), access (`cross-origin-nonfile-law`, line 157 for the **nonfile** leg), seq (`w-cross-nonfile-child-act-dropped`, line 292 for nonfile), childActAfter (`cross-origin-search-activation`, line 175), childActBefore (`w-cross-nonfile-childact-before-dropped`, line 294 for nonfile), etc. **But every one of the three surviving families' r84 cases targets `sp84-cross-origin-nonfile` (checked by the separate `cross-origin-nonfile-law` line 547), not the extras loop (line 558) that the weakening edits.** A receipt mutation on `sp84-cross-origin-nonfile` cannot fail the extras-loop check; the weakened extras-loop stays green on the real receipt, and the battery exits 0 (162 cases, 0 failed) — survivor-by-scope-mismatch, not survivor-by-missing-dimension.

The r85 battery adds `cross-tel-*` cases (lines 238–243) that mutate `sp84-cross-origin-tel` — an **extras-loop** leg — for exactly the five dimensions; the sixth (`message-unpinned`) was already killed via `cross-origin-tel-message` (line 174). After: 0 survivors (measured above), kill-power 58/58 confirms.

### What that implies about r84 routed-defect accounting

**C2's "3 of 6" understates how much of the dimension was already covered and overstates the battery as the locus of the defect.** The honest decomposition: of the 51 R84Mut1 survivors, the three extras-loop conjuncts were already bound by conjuncts in the *counter* (the extras-loop line requires access/seq/childActBefore) — the defect was **case-scope**: the battery bound those conjuncts only through `sp84-cross-origin-nonfile`, never through an extras-loop leg. C2 prose ("the frozen r84 battery leaves 3 of the 6 families alive") describes the *survival*; the *fix* the r85 battery lands is adding extras-loop-leg cases (`cross-tel-*`), not adding new conjuncts to the counter. Wording that says "the r84 battery was insufficient in dimension" would be false for access/seq/childActBefore — the dimension existed in the nonfile leg.

**Smallest safe correction:** C2 SHOULD read: *"3 of the 6 families survived under the frozen r84 counter+battery because the r84 battery bound those conjuncts only via `sp84-cross-origin-nonfile`, never via an extras-loop leg; the r85 battery adds extras-loop (`sp84-cross-origin-tel`) cases that now kill all six."* The current C2 wording is not false but is **incomplete about the locus** (counter-leg scope vs battery).

**Property question, answered:** "3 of 6" is a property of the **composition** of the r84 counter bytes (which conjuncts bind which legs) and the r84 battery (which leg each case mutates) — not of the battery alone, and not of the counter alone. Applying the same three weakenings to the r85 counter *with the r84 battery* would still leave a survivor set; applying them to the r84 counter *with the r85 battery* kills all six — so the battery delta is the causally sufficient fix in this wave.

---

## (4) Any axis harmed?

- **coverage (C1):** as-is (sentence: "the measured law is that the SecurityError is origin-determined"), **mildly harmed** — §1's fourth cell is missing and the input-element switch (`tes` ≠ `te`) is undisclosed. Fix = narrow wording only. No frozen predicate, counter, pin, prior, threshold or kill rule is proposed for amendment (per bounds).
- **operability (C2):** **not harmed** — the before/after witness numbers (measured: 3→0), the six case ids (`cross-tel-message-unpinned/-childlate/-crossaccess/-childseq/-childact-after/-childact-before` @ negatives-showpicker-r85.mjs:238–243), and kill-power 58/58 are all re-derived. The only defect is the missing "which locus" sentence (§3) — a calibration nit, not an unsound claim.
- **No-prior precedents harmed:** the `limit` disclosure (§2) is printed inside the counter and must travel with any quotation of C1/C2; the wave itself carries it verbatim in claims.json.

---

## Measured ids and numbers (reproducible from this seat)

- Counter: `checkCount=87, verdict=clean, findings=[]` (counter-a.json; re-run this seat identical).
- Battery: `cases 175, failed 0, coverage 87/87` (battery-a.json).
- Kill-power: `mutants 58, killed 58, survived 0, crashed 0` (killpower-a.json). Relevant mutants: `cross-childlate-dropped, cross-access-dropped, cross-childseq-dropped, cross-message-unpinned, cross-childact-after-dropped, cross-childact-before-dropped, same-origin-no-picker-law-dropped, same-origin-no-picker-want-dropped` — all killed.
- Witness (re-run this seat): `before.survivors=[cross-access-dropped, cross-childseq-dropped, cross-childact-before-dropped] (162 cases each, 0 failed), after.survivors=[] (each killed, 1–2 failures, first: cross-tel-crossaccess / cross-tel-childseq / cross-tel-childact-before)`.
- Limit block: `priorEvents 76, absNeed 38, escapeEvents 39, tolerance 0.05, gapMin 50, ownEvents 76, ownGaps 3`; constant-offset test `+2.0 → replay-event-timeline true, absMatched 0, refused false` (exit 1 only from prior-set-complete because the forged copy sits outside the lane tree).
- Receipt cells: `NotAllowedError` (3), `undefined+zero choosers` (3), `SecurityError` (3 cross legs) — `sp85-same-origin-{tel,search,text}(-activated)`, `sp84-cross-origin-{tel,search,text}`.
- Activation cells: cross `childActivationBefore={false,false}, childActivationAfter={true,true}` (all 3); same-origin non-activated `{false,false}→{false,false}`; same-origin activated `{true,true}→{false,true}` (activationBefore carries `isActive:true` at call time).

## Wording that must be narrowed (final)

1. **C1 law sentence** → add the conjunction qualifier and the element switch ( §1 correction above).
2. **C1 replay-adjacent claims** → attach the constant-offset disclosure (§2) wherever "counter clean at 87" is quoted as protection.
3. **C2 locus sentence** → name the scope mismatch (extras-loop vs nonfile leg) so "battery defect" is not read as "counter missing conjunct" (§3). The conjuncts were always in the counter; the battery lacked extras-loop cases.

No proposal to amend any predicate, counter, pin, prior, threshold or kill rule is made — we attack the frozen claims; the corrections are prose-only.
