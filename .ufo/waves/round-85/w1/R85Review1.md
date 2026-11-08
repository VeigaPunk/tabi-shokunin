# R85Review1 — C1 attack: re-run the counter, hunt false greens in the six new same-origin legs

Seat: reviewer (read-only), axis `coverage`. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
freeze `5c196152`, nonce `tabi-r85-l1-dbecb1a18905`. Every forgery below was built in scratch
(`/fast/scratch/hyaku/tabi-r85/R85Review1`, deleted) or `/tmp`, never inside the lane. Nothing in
the lane was written; no git/jj mutation; nothing committed.

Tools installed: none.

---

## 0. Verdict on the headline

**CONFIRMED.** The frozen counting command on the receipt at
`corpus/evidence/round85/chromium-showpicker/receipt.json` exits **0**, `verdict: "clean"`,
`checkCount: 87`, `findings: []`.

| binding | expected | measured |
|---|---|---|
| `scripts/chrome-cdp-showpicker-round85.mjs` | `1690c63d…ab8ee` | match |
| `scripts/check-showpicker-r85.mjs` | `6239abdf…c318a` | match |
| `scripts/negatives-showpicker-r85.mjs` | `b58b90c9…03496` | match |
| `scripts/kill-power-r85.mjs` | `d86fc19f…cf77a` | match |
| `scripts/selftest-r85-gates.mjs` | `10388202…7807e` | match |
| `scripts/check-record-drift-r85.mjs` | `1c6f1396…20d84` | match |
| `scripts/witness-families-r85.mjs` | `26c6e82a…e7778` | match |

Receipt: `nonce tabi-r85-l1-dbecb1a18905`, `driverSha256 1690c63d…`, `fixture.sha256 9b71a949…`,
24 legs, `failures: []`. Prior set (1 prior, `prior1.json`, nonce `tabi-r85-prior3-a1`) matched
2/76 events, `absNeed 38`, not refused.

Not re-run by this seat (other legs own them): the two cold driver runs (`R85Exec1`), the battery /
kill-power / selftest numbers (`R85Exec2`). I read `.ufo/waves/round-85/scored/battery-a.json`
(175 cases, 0 failed, coverage 87/87) but did not execute it; treat that as unverified here.

---

## 1. Findings by severity

### MEDIUM-1 — the scored receipt is not committed; the freeze commit carries a *different* receipt

The assignment addresses "the committed scored receipt". It is not committed.

- `git status`: ` M corpus/evidence/round85/chromium-showpicker/receipt.json`, `?? .ufo/waves/round-85/scored/`.
- `git show HEAD:corpus/evidence/round85/chromium-showpicker/receipt.json` yields
  `nonce tabi-r85-probe2-a1`, `fixture.sha256 291c463a…df7f2`, i.e. the pre-freeze **probe** receipt.
- `git log --all -S'tabi-r85-l1-dbecb1a18905' -- corpus/evidence/round85` is empty: the scored bytes
  exist in no commit.

Consequence: a checkout of the freeze commit cannot reproduce the C1 leg — that receipt fails
`nonce-expected` *and* `fixture-hash` against the frozen nonce/fixture. The predicate is satisfied
only by working-tree bytes. This is a cutover obligation for the integration owner, not a counter
defect: the scored receipt must replace the probe receipt **at the same path** and be committed,
because the prior-set walk refuses any second r85-schema receipt in the walked trees
(`prior-set-complete`; measured — a receipt under test placed outside the trees makes the in-tree
receipt report as `outside`). Do not add the scored receipt beside the probe one.

### MEDIUM-2 — `fixture-hash` is self-supplied in the frozen counting command

`claims.json` C1 `countingCommand` passes `--expect-fixture-sha256 <receipt fixture sha256>`, i.e. the
expected value is read out of the receipt under test. `fixture-hash` therefore verifies only
self-consistency plus 64-hex shape; it cannot bind the fixture to the frozen generation. The r85
knowledge note is stronger than the predicate — it hardcodes `9b71a949…2db5d`, which matches.

Mitigating (and why this is not HIGH): the fixture HTML is transitively determined by
`driverSha256` (the r78 template + `PATCH_*` constants live in the pinned driver), the pinned nonce,
and the port-bound child origin, so the true fixture is pinned indirectly. The *command* as written
is nevertheless circular, and `fixture.child.sha256` is only shape-checked
(`/^[0-9a-f]{64}$/`) — never compared to an expected child hash — so the one field naming the
cross-origin half of the fixture, which carries every `SecurityError` law, is unpinned as a field.

### MEDIUM-3 — "no picker exists for these types" is an inference, not a recorded field (answers (d))

There is no picker-capability field anywhere in the receipt. `__inputs()` in the r78 template
(`scripts/chrome-cdp-filechooser-round78.mjs:196`) records exactly
`{id, tag, type, multiple, webkitdirectory, accept, rect}`; `fixtureInputs` for `tes`/`ses`/`txs` is
`{tag:"input", type:"tel"|"search"|"text", multiple:false, webkitdirectory:false, accept:null, rect}`.

The zero-open expectation is a **hardcoded name set** in the counter
(`NO_PICKER = new Set(['sp85-same-origin-{tel,search,text}-activated'])`,
`check-showpicker-r85.mjs:146`), not gated by any receipt field. What is measured is:
`showPicker()` returned `{ok:true, ret:'undefined'}` and `Page.fileChooserOpened` count is 0.
The r85 note itself concedes the receipt "does not show whether Chromium reached an early return for
the type or failed to find a popup view" — that is exactly right.

So `claims.json` C1's parenthetical "**(no picker exists for these types)**" is prose, not a
measurement, and it appears inside the clause that the claim calls "the measured law". See
MEDIUM-4 for the same sentence.

### MEDIUM-4 — C1 wording overstates in two places

1. **Mechanism.** As above: the law is "undefined + zero choosers", not "no picker exists". The note
   is careful; `claims.json` is not.
2. **"the SecurityError is origin-determined."** The fixture measures a 3-cell design, not 2×2.
   Every cross-origin leg invokes `showPicker()` *inside the child's click handler*
   (`go3`…`go14`), so cross-origin **without** transient activation is never measured — the child
   script has no non-gesture call path. The (cross-origin, no-activation) cell is missing, so
   "origin-determined" is supported only as "origin-determined *given activation*, for these types",
   which is what the note's "same type attribute, activation held constant, origin varied" says.
   Recommendation: soften C1's `type` sentence to the note's formulation, and demote the
   "no picker exists" parenthetical to inference.

Everything else in C1 is exactly what the counter enforces (see §2).

### LOW-1 — per-leg fields the counter accepts unconstrained on the six new legs

Measured clean (`exit 0`, `findings: []`) forgeries, each applied to an `sp85-*` leg while the
receipt under test sat outside the walked trees with the scored receipt content-exempted:

| forged field | value | verdict |
|---|---|---|
| `answer` | a full `{files,setParams,setResult,setError,setSendId}` object on `…-tel-activated` | clean |
| `childResult` | `{ok:false,name:'SecurityError',…}` on `…-tel` | clean |
| `upload` | `{name,size,sha256}` on `…-tel` | clean |
| `childEvents` | one fabricated event | clean |
| `childActivationBefore` | `{isActive:true,…}` | clean |
| `childState` | `{s:[]}` | clean |
| `parentCrossAccess` | cross-access object | clean |
| `leg.fixtureInputs` | `[]` | clean |
| `triggerResult` | `{ok:true}` | clean |
| `chooserWaitMs` | `3000` | clean |
| `triggerResult`/`armResult`/`deferredResult` | any object | clean |
| `showPicker` **extra keys** | `ret` on a failed result; `name`+`message` on an `ok:true` result | clean |

`chooserWaitMs` is range-checked only (`0..3000`); 2014/2013 are the honest values. `showPicker` is
compared field-by-field for the expected fields but never key-closed, so surplus keys pass.

None of these can move the six laws, which rest on four fields that *are* fully pinned:
`showPicker` outcome (name+message / ret), `activationBefore`/`activationAfter`, the
`Page.fileChooserOpened` count, and the send-log shape. The residual risk is evidential hygiene: a
receipt can publish an `upload`/`answer`/`childResult` on a same-origin leg that the counter will
not reject, and a future reader may take those as measured.

### LOW-2 — the receipt's own fixture prose is not bound to the fixture hash

`fixture.patch.{style,body,inputs,state}` are recorded strings that nothing re-derives. Forging
`patch.body` from `type="tel"` to `type="file"` (and separately gutting `patch.style`, and cutting
`patch.inputs` down to `['s']`) all score **clean**: `fixture-hash` compares only
`r.fixture.sha256` to the supplied expectation. So a receipt can describe the page as containing
something other than what was served, while `fixtureInputs` (pinned exactly to `FIXTURE_INPUTS`)
still says `tel`. Since the hash is transitively derivable from the pinned driver + nonce + ports, a
diligent reader *could* recompute and catch this; nothing does. Relevant because the "no picker"
claim leans on the recorded input types.

---

## 2. The six legs under attack — (a) are the two activation arms distinct measurements?

**Yes, and every arm-swap is refused.** Measured forgeries (scratch), with the exact finding ids:

| forgery | what it does | verdict / findings |
|---|---|---|
| A1 | `…-tel` (plain) `showPicker` → `{ok:true,ret:'undefined'}` | exit 1 — `gesture-law`, `intercept-law` |
| A2 | `…-tel-activated` `showPicker` → `NotAllowedError`+`GESTURE_ERR` | exit 1 — `gesture-law`, `same-origin-no-picker-law` |
| A3 | swap all six `showPicker` outcomes between the plain and `-activated` arms | exit 1 — `gesture-law`, `same-origin-no-picker-law`, `intercept-law` |
| A4 | A3 + swap `activationBefore`/`activationAfter` | exit 1 — + `activation-law` |
| A5 | A4 + swap `priorClick` and `pageEvents` | exit 1 — + `plan-frozen`, `leg-sp85-same-origin-{tel,search,text}` ×3, `leg-sp85-same-origin-*-activated` ×3 |
| G1 | rename the two arms in place (records follow names) | exit 1 — `plan-frozen`, `send-log-allowlist`, `plan-calls`, all six `leg-*`, `gesture-law`, `activation-law`, `same-origin-no-picker-law`, `intercept-law` |

There is no receipt that carries the non-activated law in the `-activated` legs (or the reverse) and
scores clean. The arms are also structurally distinct at the CDP layer, not just in the outcome
fields:

- `…-tel` send log has **no** `Input.dispatchMouseEvent`, `priorPressId/priorReleaseId = null`,
  marks `start/pre/show-picker/settle`, activation `{false,false}` before and after.
- `…-tel-activated` send log has `dispatchMouseEvent` `mousePressed` id 15 + `mouseReleased` id 16 at
  `[360,40]`, an `elementFromPoint(360,40).id` probe, a `prior-click` mark, `triggerSendId 19`, and
  activation `{isActive:true,hasBeenActive:true}` → `{false,true}`.

Ordering is enforced too: `plan-calls` requires interception → press → release → trigger-evaluate in
exactly that order for the activated legs, and forbids prior ids entirely on the plain legs
(`prior-ids-without-click`). Phantom prior ids on a plain leg are refused (`plan-calls`), and nulled
prior ids on an activated leg are refused (`plan-calls`). A click on the input instead of `#pad`
(`pageEvent.target → tes`) is refused by `leg-sp85-same-origin-tel-activated`.

## 3. (b) `same-origin-no-picker-law` and `intercept-law` redundancy

`-activated` leg + one `Page.fileChooserOpened` (the battery's `same-origin-activated-opens-none`):

```
exit 1 — plan-calls, leg-sp85-same-origin-tel-activated, same-origin-no-picker-law, intercept-law
```

So the law **does** fire, and `intercept-law` **does** double-refuse: `intercept-law` computes
`want = 0` through the `NO_PICKER` branch (`check-showpicker-r85.mjs:651`) while `opens === 1`, and
`same-origin-no-picker-law` independently requires zero opens. The double-refusal is honest
redundancy (defence in depth), but it means the battery case cannot attribute a failure to one law:
attribution has to come from kill-power, which has both `same-origin-no-picker-want-dropped`
(the `want` ternary) and `same-origin-no-picker-law-dropped` (the law's zero-open conjunct) as
separate mutants. That is adequate for C2, but C1's leg (b) should not cite that battery case as a
witness for the law alone.

Plain leg + one chooser refuses with `plan-calls`, `leg-sp85-same-origin-tel`, `intercept-law` and
correctly does **not** invoke `same-origin-no-picker-law` (that law is scoped to the three activated
leg names).

## 4. (c) the three error pins are distinct and jointly pinned

Distinct strings, verified byte-for-byte:

```
GESTURE_ERR   …showPicker() requires a user gesture.
IMMUTABLE_ERR …cannot be used on immutable controls.
SECURITY_ERR  …showPicker() called from cross-origin iframe.
```

A receipt cannot swap them undetected:

| forgery | findings |
|---|---|
| plain `tel` message → `IMMUTABLE_ERR` | `gesture-law` |
| plain `tel` message → `SECURITY_ERR` | `gesture-law` |
| plain `tel` → `InvalidStateError` + `IMMUTABLE_ERR` | `gesture-law` |
| plain `tel` → `SecurityError` + `SECURITY_ERR` | `gesture-law` |
| plain `tel` → `NotAllowedError` + `"x"` | `gesture-law` |
| order-law leg (`sp84-same-origin-nonfile-disabled`) message → `GESTURE_ERR` | `gesture-law`, `order-law` |
| cross-origin `tel` `childResult.message` → `GESTURE_ERR` or `"x"` | `sp84-cross-origin-tel-law` |

Same-origin legs pin name **and** message on `SP_LAW`; cross-origin legs pin the whole
`childResult` via `same(...)` against `CHILD_RESULT_LAW`, so the name cannot move without the
message. The pins are genuinely three-way.

## 5. (d) is the "no picker" claim supported by a field?

**Inference.** See MEDIUM-3. Summary of what exists:

- `fixtureInputs` schema: 7 keys, none of them picker/popup capability.
- `NO_PICKER` is a hardcoded leg-name set in the counter, not a receipt-driven predicate.
- The measured facts are `ret:'undefined'` and zero chooser events.
- The receipt's own fixture prose (`patch.body`) is not bound to the recorded hash (LOW-2), so even
  the "these inputs are `tel`/`search`/`text`" premise is carried by `fixtureInputs` alone, whose
  truth rests on the driver's `__inputs()` read-back.

## 6. What the counter does NOT enforce about the new legs

1. Any per-leg field other than `showPicker`, `activationBefore/After`, `pageEvents`, `cdpEventLog`,
   `cdpSendLog`, `marks`, `priorPressId/ReleaseId`, `triggerSendId`, `intercept*`, `stateAfter`
   (addressed shape, file lists empty), `argv`, `teardown`, `serverLog` — see LOW-1.
2. Key-closure of `showPicker` (surplus keys pass).
3. Any binding between `fixture.patch.*` text and `fixture.sha256` (LOW-2).
4. Any expected value for `fixture.child.sha256` (shape only).
5. `chooserWaitMs` beyond `0..3000`.
6. The mechanism behind the zero-chooser result (early return vs no popup view) — unobservable in
   this instrument, and the note says so.
7. The (cross-origin, no-activation) cell — no such leg exists, so "origin-determined" is a
   three-cell result (MEDIUM-4).

## 7. Does C1's wording overstate?

Yes, by exactly two steps, both fixable without touching a predicate, counter, pin or kill rule:

- it states "no picker exists for these types" as a measured law (it is an inference from
  `undefined` + zero choosers), and
- it states "the SecurityError is origin-determined" over a design that never varies origin at
  *zero* activation.

The two sentences the counter actually enforces — same-origin without activation throws
`NotAllowedError` with the gesture message; same-origin with activation returns `undefined` and
opens zero choosers — are true of the receipt and fully pinned, including the activation transition
`{true,true} → {false,true}` (activation consumed) and the five pad pointer events.

## 8. Residual risk and verification gaps

- **Generic receipt forgery.** Everything above is a receipt-level attack; the counter still trusts
  a receipt that no browser produced apart from its replay/identity/structure bindings and the
  printed limit (constant-offset escape, `backendNodeId` relabelling). Not re-tested here.
- **Not run by this seat:** the driver (cold runs), the battery, kill power, selftest, drift counter,
  witness families. Any statement about those in this report is read from `.ufo/waves/round-85/scored/`
  or from the instruments' source, not measured.
- **Prior set is one probe receipt** (`tabi-r85-prior3-a1`, 24 legs, same shape). It cannot detect a
  forgery that regenerates a fresh timeline; `ownEvents 76`, `absNeed 38`, 2 events matched.
- **Committed-state gap** (MEDIUM-1) is the one thing in this report that is true of the *wave's
  current state* rather than of the instrument: until the integration commit lands the scored
  receipt at the expected path, C1 is unreproducible from history.

## 9. Cheap fixes, in order

1. Commit the scored receipt over the probe receipt at
   `corpus/evidence/round85/chromium-showpicker/receipt.json` (and `.ufo/waves/round-85/scored/`).
2. Put the literal `9b71a949…2db5d` into `claims.json` C1's `countingCommand` (the note already has
   it), and either pin `fixture.child.sha256` or stop calling `fixture-hash` a fixture pin.
3. Rewrite C1's `type` sentence to the note's formulation: "...returns `undefined` and opens no
   chooser; no picker UI is observed for these types in this fixture (inference, not a recorded
   field)", and drop "origin-determined" to "origin-determined given transient activation, for these
   types" until the fourth cell is measured.
