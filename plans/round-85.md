# Round 85 — plan and narrowing amendments

Base `c574d593` (lane clean). Two claims, frozen before the wave: C1 coverage
(`chromium-showpicker-linux` generation r85) and C2 operability (the r84 survivor-family
witnesses). Instruments frozen in `.ufo/waves/round-85/freeze.txt` (sha256
`620623a43f74…`), claims in `.ufo/waves/round-85/claims.json` (nonce
`tabi-r85-l1-620623a43f74`, D `620623a43f74`).

## C1 — `chromium-showpicker-linux` generation r85 (six same-origin legs)

The r84 note's named frontier was "a same-origin `type=tel`/`search`/`text` trigger (error or
silent no-op) for contrast with the cross-origin path". Generation r85 adds exactly that, twice:
three legs with no transient activation and three after a real trusted click on the neutral
`#pad`, on parent-page inputs `#tes`/`#ses`/`#txs`. Twenty-four legs total.

Predicate `C1-SHOWPICKER-R85`:
- (a) the scored receipt scores `clean` at checkCount **87** under `scripts/check-showpicker-r85.mjs`
  with every pin (driver `1690c63d…`, fixture `0b012937…`, nonce `tabi-r85-l1-620623a43f74`);
- (b) the battery (`scripts/negatives-showpicker-r85.mjs`) exits 0 with **175** cases, 0 failed and
  coverage **87/87**; kill power (`scripts/kill-power-r85.mjs`) kills **58** mutants with 0 survivors,
  0 crashed, 0 unapplied;
- (c) capability row, knowledge note, SKILL registry and the selftest (`scripts/selftest-r85-gates.mjs`)
  green.

Do-nothing control (committed before the score): `.ufo/waves/round-85/controls/c1/nowork-r84-under-r85.json`
— the r84 scored receipt under the r85 counter: exit 1, verdict `findings`, **81** checks (not 87),
22 findings including `schema`, `plan-frozen`, `leg-order`. A no-receipt run exits 2. Neither reaches
the target.

Kill rule: any leg false or any axis harmed → NOT verified.

## C2 — operability: the r84 survivor-family witnesses

`scripts/witness-families-r85.mjs` applies six single-conjunct weakenings of the cross-origin law
block — the classes R84Mut1's independent sweep routed to r85 — to the round-84 counter and to the
round-85 counter, and scores each with that generation's frozen battery:
`cross-message-unpinned`, `cross-childlate-dropped`, `cross-access-dropped`,
`cross-childseq-dropped`, `cross-childact-after-dropped`, `cross-childact-before-dropped`.

Measured BEFORE (frozen r84 D battery): **3 of the 6 survive** (`access`, `childseq`,
`childact-before`); the other three are already killed by the r84 D battery's
`cross-origin-tel-message` / `cross-origin-text-late` / `cross-origin-search-activation` cases.
Measured AFTER (frozen r85 battery): **0 of 6 survive**. Predicate `C2-FAMILYWITNESS-R85`:
`before.survivors == 3` and `after.survivors == 0`, no crashes, no unapplied families.

Kill rule: `after.survivors != 0` or `before.survivors == 0` → NOT verified.

## Declared limits

- **C1's origin/activation confound.** The cross-origin arms call `showPicker()` from a trusted click
  inside the child frame; the non-activated same-origin arms do not. Activation is therefore held
  constant only by the `-activated` arms, and the comparison there varies the ELEMENT (parent `#tes`
  vs child `#te`), not a single element's origin. The claim says "same type attribute, activation
  held constant, origin varied", never "same element".
- **C1's no-picker mechanism.** The receipt records `undefined` and zero chooser events; it does not
  show whether Chromium returned early for the type or found no popup view. This is stated in the
  knowledge note and is not claimed.
- **C2's family set is six classes, not the full 51-family census.** A killed family means the frozen
  battery notices that ONE weakened conjunct, not that the battery is conjunct-complete.
- **The r84 D battery already carried three of the six cases.** R84Mut1 ran the freeze-commit battery
  (`828dfcb7…`), not the final D bytes (`42fcfedc…`); the D repair added the tel-message, text-late
  and search-activation cases. The honest before-value is therefore 3, not 6, and the r84 lesson's
  "51 survivors routed to r85" is a property of the freeze-commit battery.

## Frontier carried (not moved)

The `accept` MIME-token and `image/*` grammar legs are still unmeasured (r84 spot-check routed
defect 2); the r85 note names them as frontier with flips. `image/png` as a MIME token, `image/*`
and mixed lists each need their own leg and their own answer bytes.

## Re-freeze history (instrument family)

- **D1 `dbecb1a18905`** (freeze commit `5c19615`): the first freeze. Ten wave seats were briefed at
  D1 and their reports cite it.
- **D2 `620623a43f74`**: re-frozen before any record was scored. `scripts/check-record-drift-r85.mjs`
  carried an off-by-one family mapping — it looked for the WITNESS family names
  (`cross-message-unpinned`) in the battery, where the battery's case ids are
  `cross-tel-message-unpinned`; the drift gate therefore read `family-witnesses` red on a battery
  that does contain all six cases. The fix adds the family→case map. No record had been scored
  against D1's drift counter (the first drift run is the one that found the mapping), the driver,
  counter, battery, kill-power, selftest and witness bytes are unchanged D1→D2, and the scored
  receipt was re-executed at the D2 nonce `tabi-r85-l1-620623a43f74` (fixture `0b012937…`). The D1
  receipt is superseded, never edited. Seat reports that quote D1 are pre-amendment evidence and are
  recorded as such.

## Narrowings (post-wave, pre-report)

1. **C1's origin-determination is narrowed to "given activation".** R85Critic and R85Review1 both
   measured that the fixture is a 3-cell design: every cross-origin leg invokes `showPicker()` inside
   the child's own click handler, so the (cross-origin, NO activation) cell is never measured, and the
   same-origin and cross-origin arms are different ELEMENTS (`#tes` in the parent vs `#te` in the
   child frame). The law the counter enforces is the conjunction: same-origin without activation →
   `NotAllowedError`; same-origin with a trusted click → `undefined` + zero choosers; cross-origin with
   the child's click → `SecurityError`. Narrowed wording: origin-determined **given activation, for
   these types, with the type attribute held constant**. The fourth cell and a same-element
   counterfactual stay frontier. Artifact: `w1/R85Critic.md` §1, `w1/R85Review1.md` §1 MEDIUM-4.
2. **"no picker exists for these types" is an inference, not a measurement.** The receipt records
   `{ok:true, ret:'undefined'}` and zero `Page.fileChooserOpened`; no field names picker capability,
   and the counter's zero-open expectation for the `-activated` arms is a hardcoded leg-name set
   (`NO_PICKER`). The measured law is "returns undefined and opens no chooser"; the mechanism stays
   unmeasured and is named as such in the note. Artifact: `w1/R85Review1.md` §1 MEDIUM-3, §5.
3. **`fixture.child.sha256` is shape-checked only.** `fixture-hash` compares `fixture.sha256` against
   the expected value, but `fixture.child.sha256` only matches `/^[0-9a-f]{64}$/`; and
   `claims.json`'s counting command carries the fixture pin as a `<receipt fixture sha256>` template
   slot (the SCORECARD row hardcodes the real value). The cross-origin half of the fixture is
   transitively pinned by `driverSha256` + nonce + child port, not by its own hash. Not repaired this
   round: the counter is frozen. Artifact: `w1/R85Review1.md` §1 MEDIUM-2.
4. **C2's six witnesses are not six new trigger classes.** R85Review2 measured that
   `cross-tel-message-unpinned` is byte-identical to the pre-existing `cross-origin-tel-message`
   mutation (`childLate`/`childact-after` likewise via `cross-origin-text-late` and
   `cross-origin-search-activation`); the genuinely new trigger classes are `cross-tel-crossaccess`,
   `cross-tel-childseq`, `cross-tel-childact-before`, and those are exactly the three families the
   frozen r84 battery leaves alive. The after-value stays 0/6 killed; the NOVELTY is three cases, and
   the causal test (battery minus the six) reproduces the same three survivors. Artifacts:
   `w1/R85Review2.md` §1–§3, `w1/R85Exec3.md` §2.
5. **Process: the scored receipt was re-executed mid-wave.** D1→D2 re-froze the instrument family
   while the wave was running, so seats reading the live evidence path saw two different nonces:
   R85Exec2 scored the D1 receipt (its `record-drift` gate red because the records were mid-update),
   and R85Review2 recovered the D1 receipt from scratch after the live file changed. Neither is a
   measurement defect — every law check is identical across D1 and D2 — but the L1 should not
   overwrite a live evidence path during a wave. The scored evidence is the L1's post-freeze run:
   selftest 9/9 green at D2, `scored/selftest.json`.
6. **Cold runs cannot be `clean` while the in-tree scored receipt exists.** R85Exec1's two cold runs
   pass every law check and fail only `prior-set-complete` (an undeclared in-tree receipt), which is
   the counter refusing to call a run clean while a same-schema receipt in the walked trees is not a
   declared prior. Leg (a) is the scored run under the exemption; leg (b)'s cold runs are
   law-complete evidence, not clean verdicts. Artifact: `w1/R85Exec1.md` §Risk.
7. **C1's kill-power reach is the frozen list, not conjunct resistance.** R85Mut1's independent
   73-mutant sweep of `check-showpicker-r85.mjs` reports 22 killed and **31 case-level survivors** on
   the same honest receipt. The survivors are structural, not random: individual members of
   `same-origin-no-picker-law` (dropping the search or text member), the `NotAllowedError` message
   and name pins on the six new legs, and the per-leg shape fields (`trusted`/`act`/`opened`/`seq`/
   `priorPressId` order, launch-token shape) as applied to the `sp85-*` legs only. Narrowed: kill
   power 58/58 means the FROZEN mutant list is killed by the FROZEN battery; the battery does not
   detect every single-conjunct weakening of the new-leg laws. Survivor families are routed to r86.
   Artifact: `w1/R85Mut1.md`.
8. **C2's family witnesses are tel-only.** Three of R85Mut1's survivors narrow a cross-origin law to
   the tel leg (`cy-childseq-narrow-tel-only`, `cy-crossaccess-narrow-tel-only`,
   `cy-childact-before-narrow-tel-only`, `cy-childresult-message-narrow-tel-only`) and the battery
   still exits 0, because every `cross-tel-*` case mutates the tel leg. Narrowed: the six cases
   witness the weakening on ONE leg each; a law narrowed to that leg survives. Artifact:
   `w1/R85Mut1.md`.
9. **The zero-chooser metric is a FILE-chooser metric.** R85Scout located that the spec's
   "show the picker, if applicable" step and Chromium's type dispatch both key on the type, but that
   Chromium's `TextFieldInputType` path still issues an embedder request for the datalist/autofill
   dropdown (`OpenTextDataListChooser`). `Page.fileChooserOpened` counts FILE choosers only, so
   "zero choosers" cannot distinguish "no popup of any kind" from "no file chooser". The r85 fixture
   inputs carry no `list` attribute and the fixture has no `<datalist>`, so the measurement is
   consistent with the sources — but the law is bounded to the file-chooser metric. Artifact:
   `w1/R85Scout.md` §3.
