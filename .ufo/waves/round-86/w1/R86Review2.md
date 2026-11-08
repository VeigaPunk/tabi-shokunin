# R86Review2 — C2 attack: 12 search/text conjunct cases, attribution & unwitnessed conjuncts

Seat R86Review2 (godspeed; axes: *attributability*, *cannot-fail*, *unwitnessed-conjunct*).
Lane /home/vgpnk/Projects/shokunin/tabi-shokunin; battery scripts/negatives-showpicker-r86.mjs;
counter scripts/check-showpicker-r86.mjs; receipt corpus/evidence/round86/chromium-showpicker/receipt.json.
Scratch /fast/scratch/hyaku/tabi-r86/R86Review2 (removed before yield).

## Measured runs (all mine)

- Committed battery: exit 0, 201 cases, 0 failed, coverage 95/95.
- Witness runner: exit 0; before survivors 3 (`narrow-tel-crossaccess`, `narrow-tel-childseq`,
  `narrow-tel-childact-before`), after survivors 0, killed 12/12, crashed 0, unapplied 0.
- Attribution matrix (12 case receipts x 13 counters: real + 6 full conjunct drops + 6 narrow-tel):
  see §1.
- Extended battery (`FAMILY_MUT` loop widened to search/text/tel/month/week/time/number/range/color/nonfile,
  249 cases): 1 failure — `cross-color-childact-after-dropped` (exit 0, no finding). Root cause §3.

## 1. The 12 cases: mutated field, conjunct, attributable?

Counter loop (check-showpicker-r86.mjs:624-626). Each `<extra>-law` is one AND-chain. The six family
conjuncts are the FAMILIES `from` strings in witness-families-r86.mjs:48-53. Battery FAMILY_MUT
(negatives-showpicker-r86.mjs:265-272) applied per leg:

| case (x2: `search`,`text`) | mutated field on `sp84-cross-origin-<leg>` | counter conjunct that must notice |
|---|---|---|
| `message-unpinned` | `childResult.message` -> `'SecurityError'` | `same(ex.childResult, CHILD_RESULT_LAW[extra])` (whole-object; pins ok+name+message) |
| `childlate-dropped` | `childLate` 0 -> 1 | `ex.childLate === 0` |
| `crossaccess-dropped` | `parentCrossAccess` -> `{contentDocument:'object',windowDocument:'SecurityError'}` | `same(ex.parentCrossAccess, {contentDocument:null,windowDocument:'SecurityError'})` |
| `childseq-dropped` | `childEvents[0].target` -> `'go'` | `same(arr(childEvents).map(type+'@'+target), CHILD_EVENT_SHAPE[extra].seq)` |
| `childact-after-dropped` | `childActivationAfter` -> `{isActive:false,hasBeenActive:true}` | `same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1])` |
| `childact-before-dropped` | `childActivationBefore` -> `{isActive:true,hasBeenActive:true}` | `same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0])` |

Expected id `sp84-cross-origin-<leg>-law`, `alsoAllowed=[]` (negatives:273-277). Verdict: **fire their own id
by their own conjunct — no collateral.** Evidence: for every one of the 12, with `--tree-exempt-sha256`
(the battery's own flag; without it a spurious `prior-set-complete` appears when the receipt under test is
outside the walked trees):

- Real counter: exit 1, ids exactly `[sp84-cross-origin-<leg>-law]`.
- The case's own full-drop counter: exit 0, ids `[]` (silently accepts — the mutation is invisible).
- Each of the other five full-drop counters: exit 1, ids exactly `[sp84-cross-origin-<leg>-law]`.
- The case's own `narrow-tel-*` counter: exit 0, ids `[]`; the other five `narrow-tel-*`: exit 1, own id.
- No other `*-law` id ever appears for any of the 12 under any of the 13 counters.

Attribution is therefore exact (1:1 case <-> conjunct <-> `narrow-tel` family). The 12 extend C2's
narrow-tel kills from leg-count to conjunct-count: each `narrow-tel-*` family is killed by 2 cases
(search+text) rather than by an unrelated id. Witness runner firstFailures confirm:
`narrow-tel-crossaccess -> cross-search-crossaccess-dropped`,
`narrow-tel-childseq -> cross-search-childseq-dropped`,
`narrow-tel-childact-before -> cross-search-childact-before-dropped` (after generation).

Sub-conjunct note: `cross-childseq-dropped` sets `target='go'`; the counter compares `type+'@'+target`, so
this exercises the target half only. The type half (`type` mutation) has no direct case on any loop leg —
but the witness family's weakened form replaces the whole `same(...)` with `length===5`, so target and type
are both unpinned by that mutant and the case kills it through the target half. A type-only value error
(counter keeping a type-agnostic comparison) is not separable here.

## 2. Cases that cannot fail

**None among the 12.** All 12 mutate a field to a value different from the frozen law on their own leg
(receipt values verified: `childResult.message`=SECURITY_ERR full string, `childLate`=0,
`parentCrossAccess.contentDocument`=null, `childEvents[0].target`=`go13`/`go14`,
`childActivationBefore`={false,false}, `childActivationAfter`={true,true}). Each is refused by the real
counter with its own id.

## 3. The one cannot-fail found — and why it does not indict the 12

Extended battery (every cross-origin leg x all six families) fails exactly once:
`cross-color-childact-after-dropped` exits 0 with no finding. `FAMILY_MUT.childact-after` sets
`{isActive:false,hasBeenActive:true}`. For `sp84-cross-origin-color` that IS the frozen law value
(`CHILD_ACT_LAW['sp84-cross-origin-color'][1] = {isActive:false,hasBeenActive:true}`, line 325) — colour
inputs have no picker, so activation stays inactive, unlike every other loop leg ({true,true}). The
mutation is a no-op: the receipt already equals the value it writes. Same trap if `childact-before`
had been run against a {true,true} law value {it is {false,false} — fires fine). The six families were
authored for the SecurityError legs; colour's divergent activation law is the exception. The frozen C2
claim scopes the witnesses to search/text, where the values all differ — so the frozen 12 are clean.
The colour gap is a battery-construction hazard for any future extension, not a defect in the 12.

## 4. Conjuncts the 12 (and the battery) still leave unwitnessed

Within the counter's `<extra>-law` AND-chain (9 loop legs: color, month, week, time, number, range,
tel, search, text; plus `cross-origin-nonfile-law` and `order-law` share the shape):

| conjunct | search/text (the 12) | battery-wide |
|---|---|---|
| `childResult` whole-object | witnessed (`message-unpinned`; plus pre-existing `cross-origin-{search,text}-law`) | witnessed on every loop leg (ok-flip cases) |
| `childActivationAfter` | witnessed (search pre-existing + generated) | tel, search, nonfile witnessed; month/week/time/number/range/color: **no case** |
| `childActivationBefore` | witnessed (generated only) | tel, nonfile witnessed; **month/week/time/number/range/color: no case** |
| `parentCrossAccess` | witnessed (generated only) | tel, nonfile witnessed; **month/week/time/number/range/color: no case** |
| child-event seq (`type@target`) | witnessed (generated only, target half) | tel witnessed; **month/week/time/number/range/color/search/text-only-that? — search/text witnessed via the 12; month/week/time/number/range/color: no case** |
| `childLate === 0` | witnessed (text pre-existing, search generated) | tel, text, nonfile, nonfile-disabled witnessed; **month/week/time/number/range/color: no case** |
| zero `Page.fileChooserOpened` | **NOT witnessed by any of the 12** (no opens-push case on search/text) | only nonfile (`cross-nonfile-chooser`) exercises it inside a `*-law` check; no loop leg (tel/search/text/month/...) has an opens-push witness for its own `*-law` id |
| `childEvents.length === 5` | not witnessed (no case truncates `childEvents`) | **no case on any leg** (mutations keep length 5) |
| `every isTrusted && act` | not witnessed (no `isTrusted=false` mutation) | only `act=false` on month (`w-extras-…`) and nonfile (`w-cross-nonfile-child-act-dropped`); **no `isTrusted=false` case anywhere** for childEvents |

So: search/text coverage of the six C2 families is complete; the remaining holes are (a) the zero-open
conjunct on all nine loop legs, (b) `length===5` and `isTrusted` on all of them, (c) the month/week/time/
number/range/color legs' non-`childResult` conjuncts (only `childResult` + one `act=false` on month).

## 5. Residual risk

- **Collider via shared check ids.** Attribution was verified for these 12 only under the 12-corpus
  candidate mutant set (six family conjuncts). A mutant that drops a *different kind* of conjunct
  (e.g. zero-open, length, isTrusted) while still refusing these receipts through its own surviving
  conjuncts would also pass the battery — but it would be killed by the 12 only if it drops one of the
  six. Collateral risk is bounded: each case's receipt keeps every other conjunct at its law value, so
  a collateral kill would have to fire the same id through a *different* conjunct on the *same* leg —
  measured absent for these six families (own-drop silences, other-drops fire). I did not run the full
  66-mutant kill-power list against these 12 receipts; witness runner's 12-family kill is the bound.
- **Colour activation trap (§3)** generalizes: any future per-leg extension of `FAMILY_MUT` must check
  the mutated value differs from that leg's law value, or the case silently cannot fail.
- **Type-half of childseq** is unseparated (§1 note).
- Methodology caveat: attribution counters are line-replaced clones of the frozen counter, not the frozen
  kill-power mutants; occurrence counts verified =1 for each `from` string.

## Verdict

The 12 search/text cases **fire their own id by their own conjunct** — individually attributable,
no collateral, no cannot-fail. They close the tel-only gap completely (3 survivors -> 0). The extended
run's single cannot-fail is on colour (no-op mutation), outside the frozen claim's scope. Unwitnessed:
zero-open, `length===5`, `isTrusted` conjuncts on loop legs; non-`childResult` conjuncts on
month/week/time/number/range/color; seq type-half.

## Tooling

None installed. node v24.21.0 used as-is.
