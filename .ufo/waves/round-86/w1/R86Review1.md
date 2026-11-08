# R86Review1 — C1 attack: accept-grammar & colour laws (godspeed)

Axes: **forgery resistance** (can a self-consistent rewrite pass?) ×
**discrimination** (does the law measure the claimed token form / call?).
No tool installs (node 24 + python3 already present; `node --version` used as-is).

## 0. Counting command (independently re-run)

```
node scripts/check-showpicker-r86.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round86/chromium-showpicker/receipt.json \
  --expect-driver-sha256 5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d \
  --expect-nonce tabi-r86-l1-4bd89a80f439 \
  --expect-fixture-sha256 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1 \
  --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --json
```
Exit `0`, `verdict clean`, `checkCount 95`, 95/95 checks true, `findings []`.
**Confirmed: `verdict clean, checkCount 95` reproduces from the committed bytes.**

## (a) Three distinct token forms — are the inputs swapped-proof?

`check-showpicker-r86.mjs:665-680` + receipt bytes:
- receipt `fixtureInputs`: `aw → accept "image/*"`, `am → "image/png, .txt"`,
  `ap → "application/pdf"` (type `file` all).
- Each `sp86-accept-*` leg's **own** `fixtureInputs` is byte-identical to the
  receipt-level copy (`leg-fi==receipt-fi? True` for all six legs, verified),
  and `leg.target` matches the GRAMMAR table: wildcard-text/png → `aw`,
  mixed-text/png → `am`, pdf-token-png → `ap` (PLAN 138-142).
- The law reads `desc.accept` from `r.fixtureInputs` (receipt level only) —
  counter line 675 — **not** from the leg's own copy. So per-leg input order in
  the receipt is honest, but the law's binding is one level up.

Forgery probes (mutated receipt copies under `/tmp`, since removed; counter
exit shown, `prior-set-complete` noise excluded — it fires for any file outside
the walked trees):

| probe | result |
|---|---|
| B1 swap `accept` aw↔am at receipt level | `accept-grammar-law` + `fixture-descriptors` fail → caught |
| B2 swap `accept` aw↔am at leg level only | `accept-grammar-law` **passes** (law never reads leg-level copy) |
| B5 PNG bytes on txt leg, `answer.files` kept txt | `leg-sp86-accept-wildcard-text` + `accept-grammar-law` fail → caught |
| N3 fully PNG-consistent on txt leg (answer+state+read+sendlog) | `plan-calls` + leg-shape + grammar fail → caught |

**Verdict (a):** the six legs genuinely carry three distinct token forms and
the delivered bytes follow the leg target (`stateAfter[aw/am/ap]`, trusted
`input`/`change` with `files`, `read` ret = `hex:…`). Inputs cannot be
swapped against each other and still pass — the GRAMMAR table pins
`(name, target, accept, file)` and `answer.setParams.backendNodeId` must equal
`nodeReport[name][0]` (the leg's own `Page.fileChooserOpened` backendNodeId, 18).
Severity: **info** — no false-green here. Flip condition: a mutant whose
`PLAN.target`/`fixtureInputs.accept` and the `GRAMMAR` rows all move together
— that is a frozen-code change, not a receipt forgery.

## (b) Weakest conjunct of `accept-grammar-law`

The law checks: `answer.files`, `answer.setParams.files[0]` basename,
`setParams.backendNodeId === nodeReport[name][0]`, `setResult {}`, `setError null`,
`stateAfter[target]`, exactly one `read` with `ret === 'hex:'+f.hex`, and
`desc.accept === accept` (receipt-level).

Every one of these is **a forger-settable receipt field** — nothing is
recomputed from the page at counter time (the counter "reads a receipt";
see its LIMIT block). The hierarchy of weakness:

1. **`desc.accept` (receipt-level `fixtureInputs`) is the weakest.** It is the
   only place the token form is "measured", yet the counter never reads the
   leg's own `fixtureInputs`, the `window.__inputs()` send-log expression, or
   the fixture HTML. B2 proved it: a leg whose own descriptor claims
   `application/pdf` while the receipt-level says `image/*` passes. Worse,
   `desc.accept` and `FIXTURE_INPUTS` are the *same constant* the law compares
   against, so any forger controls both sides consistently. The `upload`/
   `uploadPng` content hash is **not** a conjunct of this law at all
   (N2: `upload → null` on a wildcard leg still passed the full counter —
   caught nowhere else either, since only `sp84-*` legs check `upload`).

2. Next-weakest: `read ret` hex and `stateAfter` are two copies of the same
   bytes; a forger sets both consistently (N4/N3 only failed because
   `plan-calls` pinned the send-log's `files[0]` basename to the frozen
   `PLAN.files` per leg — that **non-law** check is what actually binds the
   byte payload to the leg, not `accept-grammar-law` itself).

**Sharper kill of the law as written:** I could not make the full counter pass
with swapped inputs, but only because of *sibling* checks (`plan-calls`,
`leg-<name>` LEG_SHAPE, `fixture-descriptors`). `accept-grammar-law` in
isolation only proves: "receipt says accept X on input T, and a receipt-file
`answer` with the right basename lands in `stateAfter[T]` with matching hex".
It does **not** prove the browser enforced / ignored anything. That is exactly
the `limit` block's admission ("the accept law is an ACCEPTANCE law:
DOM.setFileInputFiles bypasses the dialog"), so this is **by-design low
severity**; the measured law ("accept never filters a programmatic answer")
is genuinely unmeasured at the dialog layer. Flip condition: any receipt
where `answer`/`stateAfter`/`read` agree but the dialog would have filtered —
the counter cannot see it (conceded in `limit`).

**Finding [LOW] (b):** weakest conjunct = `desc.accept` (receipt-level,
forge-consistently-settable, leg-level descriptor unchecked, `upload` absent).
*Concrete flip:* forge `r.fixtureInputs[aw].accept` and `GRAMMAR` row together
(frozen-code edit) → law passes with any token form. As a receipt-only
forgery it is currently caught, but only by sibling checks, not by this law.

## (c) Colour zero-chooser — distinguishable from never-called?

Receipt leg `sp86-same-origin-color-activated` (all values quoted from
`receipt.json`):
- `showPicker: {ok: true, ret: "undefined"}`, `triggerSendId: 19`,
  `triggerResult: {value: {ok: true, ret: "undefined"}}`.
- `cdpSendLog[19]` (id 19) is `Runtime.evaluate` with expression
  `(function(){ try { var r = document.getElementById("cos").showPicker(); … })()`
  — the wrapper for target `cos`, pinned by `wrapperFor()` + `plan-calls`.
- `activationBefore {isActive:true, hasBeenActive:true}` →
  `activationAfter {isActive:false, hasBeenActive:true}` (consumed).
- `stateAfter.cos = []`, `pageEvents` = exactly the 5 prior-click pointer
  events, no `input`/`change`; `cdpEventLog` has 0 `Page.fileChooserOpened`.

Forgery probes: `showPicker → null` ⇒ `gesture-law` + `same-origin-color-law`
fail; `activationAfter.isActive → true` ⇒ `activation-law` + colour law fail;
appending one `fileChooserOpened` ⇒ colour law + `intercept-law` +
`cdp-event-log-closed` fail. So the never-called leg **is** ruled out — by
`showPicker.ok/ret`, `activationBefore/After`, and `triggerSendId`→send-log
wrapper coherence (`plan-calls`: `leg.triggerSendId !== trig.id` binds the id).

Slack remaining: the law's `isObj(col.showPicker) && ok && ret==='undefined'`
conjuncts are pure receipt fields; a forger who keeps the wrapper expression
in the send log (required by `plan-calls`/`send-log-allowlist` anyway) and
writes the ok object consistent with it passes **without the browser ever
running** — the colour law cannot tell a real `showPicker()` return from a
typed-in one, since the return value lives only in `showPicker`/`triggerResult`
(which no check cross-binds: `showPicker` is wrapper output, never compared
to `triggerResult.value`). **Finding [LOW] (c):** `showPicker !== triggerResult`
is an unbound gap; flip = set `showPicker {ok:true, ret:'undefined'}` while
`triggerResult` says Error → passes law (caught by `gesture-law` only, which
reads the same forged field). The zero-chooser + activation-consumed halves
are well-bound. No false-green on the committed bytes.

## (d) Does `mode-law` / `intercept-law` fire on the colour leg?

- **`mode-law` (601-611): does NOT fire, vacuously.** `if (opens.length === 0)
  continue;` — the colour leg opens 0, so mode is never compared. If I forged
  one `fileChooserOpened` with `mode: selectMultiple` on the colour leg,
  `mode-law` **did** fire (`cos` has `multiple: false` → wants `selectSingle`),
  alongside 5 other checks. So the law *would* catch a multiple-mode colour
  open; with zero opens it is structurally blind — correct, since there is no
  mode to check.
- **`intercept-law` (711-725): fires and passes by count, not by mode.** It
  computes `want = NO_PICKER.has(name) ? 0 : …` where `NO_PICKER` (line 152)
  includes `sp86-same-origin-color-activated` → `want 0`, `opens 0` ⇒ pass.
  The C3 forgery (one open) failed `intercept-law` with `opened-1-want-0`.
  So interception-gating is enforced for the colour leg via the `NO_PICKER`
  set — but note `same-origin-no-picker-law` (line 721) lists only the
  tel/search/text trio; the colour zero-open is enforced **only** through
  `intercept-law` + `same-origin-color-law` + LEG_SHAPE. That is a
  single-point-of-failure widening vs the trio: drop the colour name from
  `NO_PICKER` and `intercept-law` would demand 1 open while the colour law
  demands 0 — the two would contradict (caught, but only by their fight).
  **Finding [INFO] (d):** no defect; the asymmetry is load-bearing-by-absence.

## Severity summary

| # | Severity | Finding |
|---|---|---|
| 1 | INFO | Counting command reproduces `clean / 95` from committed bytes. |
| 2 | INFO (a) | Three token forms are genuinely distinct and target-bound; input swap is caught (by sibling checks + GRAMMAR table). |
| 3 | **LOW** (b) | Weakest conjunct = receipt-level `desc.accept` (leg-level descriptor never read; `upload` absent). Law's payload-binding actually comes from `plan-calls`, not the law. Conceded dialog-bypass in `limit`. |
| 4 | **LOW** (c) | Never-called is ruled out; but `showPicker` vs `triggerResult.value` are unbound — a typed-in `{ok,ret}` passes the colour law. |
| 5 | INFO (d) | `mode-law` vacuous on colour (no opens); `intercept-law` enforces zero via `NO_PICKER`; colour lacks the trio's dedicated no-picker check. |

**Concrete flips:** (3) frozen `GRAMMAR`+`FIXTURE_INPUTS` move together;
(4) `{showPicker ok, triggerResult Error}` inconsistency passes the colour law;
any signature is unmeasured by construction (counter reads a receipt).

--- 
*Measured; no commits; scratch `/tmp/r86rev` removed. Tools: node 24, python3
(verbatim, no installs).*
