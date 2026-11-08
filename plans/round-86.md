# Round 86 — plan and narrowing amendments

Base `57265864` (lane clean; r85 verifier spot-check `57265864`). Two claims: C1 coverage
(`chromium-showpicker-linux` generation r86 — the `accept` token grammar matrix and the
same-origin `type=color` arm) and C2 operability (the tel-only witness gap: search/text family
witnesses for the shared cross-origin law block).

Instruments are the r85 family, retargeted to `r86` and extended with six legs; pins land in
`.ufo/waves/round-86/freeze.txt`, claims in `.ufo/waves/round-86/claims.json`.

## C1 — `chromium-showpicker-linux` generation r86 (accept grammar + same-origin colour)

The r85 note named three frontier items; two are measured this generation (the third, a
same-element origin comparison, is not constructible in the loopback fixture and stays frontier):

1. **The `accept` token grammar as a matrix.** Three token forms are placed on the page and read
   back (`window.__inputs()`), and each is answered programmatically through
   `DOM.setFileInputFiles`:
   - `accept="image/*"` answered with `text/plain` bytes and with `image/png` bytes;
   - `accept="image/png, .txt"` (mixed list) answered with `text/plain` and with `image/png`;
   - `accept="application/pdf"` (a MIME token matching neither delivered byte) answered with
     `image/png`.
   The measured law: **`accept` filters the dialog, never a programmatic answer** — all five
   answers land in the input's file list, fire trusted `input`+`change`, and the page reads back
   the delivered bytes (`read` event `hex:` field). The r84 `.png`-token law is the control; the
   r86 matrixes are the wildcard, the mixed list and a non-matching MIME token.
2. **The same-origin `type=color` activated arm.** `showPicker()` on a parent-page `type=color`
   input after a trusted click on the neutral `#pad` returns `undefined`, consumes the transient
   activation, fires no `input`/`change`, and opens **zero** `Page.fileChooserOpened` events —
   the colour picker is not a file chooser, so the law is bounded to that metric (the r85 note's
   zero-chooser narrowing carried forward).

Predicate `C1-SHOWPICKER-R86`:
- (a) the scored receipt scores `clean` under `scripts/check-showpicker-r86.mjs` with every pin
  (driver, fixture, nonce) and the full check count;
- (b) the battery (`scripts/negatives-showpicker-r86.mjs`) exits 0 with 0 failed and full
  coverage; kill power (`scripts/kill-power-r86.mjs`) leaves 0 survivors, 0 crashed, 0 unapplied;
- (c) capability row, knowledge note, SKILL registry and the selftest
  (`scripts/selftest-r86-gates.mjs`) green.

Do-nothing control (committed before any score): the r85 scored receipt under the r86 counter —
it is `/` the r86 plan and refuses on `plan-frozen`/`leg-order`; and a no-receipt run exits 2.
Neither reaches the target.

Kill rule: any leg false or any axis harmed → NOT verified.

## C2 — operability: the tel-only witness gap

R85Mut1's routed defect 3: the six r85 family cases witness each cross-origin law conjunct on the
TEL leg only, so a counter whose law keeps a conjunct for tel and drops it for the other
cross-origin legs survives the battery. Generation r86 adds the same six conjunct witnesses on the
SEARCH and TEXT legs (12 new battery cases) and measures the narrowings with
`scripts/witness-families-r86.mjs`, which applies six conjunct-scoped counter mutations to both
generations — each one keeps its conjunct for `sp84-cross-origin-tel` and drops it everywhere else:

- `narrow-tel-message` — `same(ex.childResult, CHILD_RESULT_LAW[extra])`;
- `narrow-tel-childlate` — `ex.childLate === 0`;
- `narrow-tel-crossaccess` — the `parentCrossAccess` binding;
- `narrow-tel-childseq` — the child-event sequence binding;
- `narrow-tel-childact-after` — `childActivationAfter`;
- `narrow-tel-childact-before` — `childActivationBefore`.

The six r85 conjunct-weakening families are carried as controls.

BEFORE: the round-85 counter scored by the frozen round-85 battery (whose only conjunct witnesses
are tel cases; the search/text cases it does carry cover only childResult, childLate on text and
childActivationAfter on search).
AFTER: the round-86 counter scored by the frozen round-86 battery.

Predicate `C2-FAMILYWITNESS-R86`: `before.survivors == 3` — measured:
`narrow-tel-crossaccess`, `narrow-tel-childseq`, `narrow-tel-childact-before` — and
`after.survivors == 0`, with no crashes and no unapplied families; the six r85 control families stay
killed. The measured before-set is exactly R85Mut1's routed finding.

Kill rule: `after.survivors != 0` or `before.survivors != 3` → NOT verified.

## Declared limits (pre-freeze)

- **C1 measures acceptance, not filtering.** `DOM.setFileInputFiles` is a programmatic answer; the
  law says `accept` is not enforced on that path. What a *user's* dialog would filter is not
  measured (no UI dialog in headless), and is not claimed.
- **The colour arm is a file-chooser metric.** Zero `Page.fileChooserOpened` events do not show
  whether Chromium opened a colour popup; "the colour picker exists" stays an inference from the
  type, and the note says so.
- **The `accept` matrix is three token forms**, not the full grammar (`accept` also supports
  `audio/*`, `video/*`, multiple MIME tokens, and whitespace variants); those stay frontier.
- **C2's narrowing set is six conjunct-scoped mutants**, not every leg-scoped narrowing a mutation
  tester can write; a killed family means the frozen battery notices that ONE conjunct on the
  search/text legs.
- **The witness runner's BEFORE generation is r85**, not r84: r85's battery already kills the six
  r84 family classes and three of the six conjunct narrowings (those a search/text case existed
  for), so the honest before-value for the new families is 3, not 6.

## Frontier carried (not moved)

- A same-element origin comparison (an input reachable from both origins via a `postMessage`
  proxy) — not constructible in the current loopback fixture.
- The full `accept` grammar (`audio/*`, `video/*`, multi-MIME lists, whitespace variants) beyond
  the three forms measured here.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event).

## Re-freeze history (instrument family)

- **D1 `0e7bb7e08cac`** (first freeze): seven instruments pinned; the scored generation run was taken
  at D1's own (superseded) nonce identifier and its receipt scored clean (95 checks).
- **D2 `4bd89a80f439`** (re-freeze, pre-report): `scripts/check-record-drift-r86.mjs` as first frozen
  carried a quoting error in its new `accept-grammar-measured` claim (`SyntaxError: Unexpected
  identifier`) and could not run at all; the drift gate therefore had no green state. The line was
  repaired and the battery-generator claim rewritten to check the generator plus the scored battery's
  size/coverage instead of literal case names (the 12 search/text witnesses are generated from
  `FAMILY_MUT` × `['search','text']`, so a literal-source check would be vacuous). The scored run was
  repeated at D2's nonce and every gate re-run on that receipt; no claim predicate, counter byte, pin
  of another instrument, prior or threshold changed. Both nonces are recorded; the report and records
  cite D2.

## Narrowings (post-wave, pre-report — every one reconciled before filing)

1. **`accept-grammar-law` is receipt-level.** Its weakest conjunct is the receipt-level
   `fixtureInputs[target].accept`; the leg's own descriptor copy is never read, and the delivered
   `upload`/`uploadPng` hashes are not conjuncts of this law at all. What actually binds the payload
   to a leg is `plan-calls` (the send log's `DOM.setFileInputFiles` files[0] against the frozen PLAN),
   not the law. A forger who keeps the send log honest cannot swap the attribute, but a forger who
   moves the frozen `GRAMMAR`/`FIXTURE_INPUTS` constants together would pass — that is a code change,
   not a receipt forgery. Artifact: `w1/R86Review1.md` §(b), probe B2.
2. **`showPicker` and `triggerResult.value` are unbound.** The colour law (and `gesture-law`) read the
   `showPicker` field; no check cross-binds it to `triggerResult`. A receipt that types in
   `{ok:true, ret:'undefined'}` while `triggerResult` says otherwise passes the colour law. The
   zero-chooser and activation-consumed halves are well bound. Artifact: `w1/R86Review1.md` §(c).
3. **The 12-case witness set is 4× minimal.** Three cases on one non-tel extras leg (e.g.
   `cross-search-{crossaccess,childseq,childact-before}-dropped`) would move the claim's 3 → 0 with a
   third of the cases; the full search+text set buys symmetry and defense-in-depth, not necessity.
   The causal test agrees: the three survivors are exactly the three conjuncts for which the r85
   battery carries no non-tel case. Artifacts: `w1/R86Critic.md` Q4, `w1/R86Exec3.md` §3.
4. **Loop-leg conjuncts still unwitnessed.** No case exercises the `Page.fileChooserOpened`-count
   zero-open conjunct on the nine loop legs, `childEvents.length === 5`, or `isTrusted` at all; the
   month/week/time/number/range/color legs are witnessed only on `childResult`. A narrowing that
   drops one of those conjuncts survives the battery. Artifact: `w1/R86Review2.md` §4.
5. **29 whole-counter escapes in an independent sweep.** R86Mut1 authored 63 candidate mutants,
   scored 62; 12 killed, 50 survived, of which 29 are demonstrated whole-counter escapes (an aimed
   receipt mutation that the pristine counter refuses and the mutant accepts) and 21 are shadowed by
   a named check. The frozen 66-mutant list is fully killed, so `kill power 66/66` means the FROZEN
   list is killed by the FROZEN battery — it does not mean single-conjunct weakening is refused.
   Escapes concentrate in `accept-answer-law`, the new-leg laws and the replay threshold margins.
   Artifact: `w1/R86Mut1.md` §Survivors.
6. **Cold runs are law-complete but not `clean`.** Two fresh-nonce cold runs agree on every law
   check and fail only `prior-set-complete` (an undeclared in-tree receipt); leg (a)'s scored run is
   the run under the exemption. Artifact: `w1/R86Exec1.md`.
7. **The before-value's mechanism is narrower than "six unwitnessed conjuncts".** The r85 battery
   already kills three of the six narrowings (childResult on search/text, `childLate` on text,
   `childActivationAfter` on search); the honest before-value is 3, and the three survivors are the
   conjuncts with no non-tel case. Artifacts: `w1/R86Critic.md` Q3, `w1/R86Exec3.md` §3.
8. **Conjunct-completeness is not established.** Closing the tel-only gap for the nine loop legs does
   not witness the number/range/month/week/time/color legs' non-`childResult` conjuncts; the same
   mutant class remains alive there until they are witnessed.
