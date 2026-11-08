# Round 88 — plan and narrowing amendments

Base `f16f992d` (lane clean; the round-87 verifier spot-check commit). Two claims: C1 coverage
(`chromium-showpicker-linux` generation r88 — MIME parameters, case variants, combined lists) and
C2 calibration (the seven SCORECARD selftest tallies the round-87 sweep rewrote, plus the round-87
spot-check's routed defects D1–D4).

Instruments are the round-87 family retargeted to `r88`, with each gate carrying an isolated
`--selftest` mode (D3), and the record-drift gate rewritten to the round-88 statements. Pins
land in `.ufo/waves/round-88/freeze.txt`, claims in `.ufo/waves/round-88/claims.json`.

## C1 — `chromium-showpicker-linux` generation r88 (MIME parameters, case variants, combined lists)

Round 87 measured seven `accept` token forms and named the remainder frontier: `IMAGE/PNG`
(case variant), `image/png;q=0.9` (MIME parameter) and `audio/*,video/*` (combined media-type
list). This generation adds one leg per remaining form, each on its own page input whose `accept`
attribute is read back by `window.__inputs()`:

1. `accept="IMAGE/PNG"` answered with `image/png` bytes (`sp88-accept-case-png`, input `ac`);
2. `accept="audio/*,video/*"` answered with `text/plain` bytes
   (`sp88-accept-audiovideo-text`, input `au`);
3. `accept="image/png;q=0.9"` answered with `image/png` (`sp88-accept-mimeparam-png`, input `amc`).

The measured law stays the one rounds 86–87 stated, now over ten attribute-string values (nine of
them in-grammar; see the narrowing below): **`accept` is not
a validator on a programmatic answer** — every delivered file lands in the input's file list with
its bytes, fires trusted `input`+`change`, and the page reads the bytes back; the attribute
itself is read from the page, so the token form is measured, not asserted. The dialog remains
unmeasured.

Predicate `C1-SHOWPICKER-R88`:
- (a) the scored receipt `corpus/evidence/round88/chromium-showpicker/receipt.json` scores
  `clean` under `scripts/check-showpicker-round88.mjs` with every pin (driver, fixture, nonce)
  and the full check count (99 — the grammar table widens inside `accept-grammar-law`, which
  stays one check);
- (b) the battery (`scripts/negatives-showpicker-round88.mjs`) exits 0 with 0 failed and full
  coverage; kill power (`scripts/kill-power-round88.mjs`) leaves 0 survivors, 0 crashed, 0
  unapplied;
- (c) capability row, knowledge note, SKILL registry and the selftest
  (`scripts/selftest-r88-gates.mjs`) green.

Do-nothing controls (frozen before the wave; each is a construction that cannot pass): the round-87
scored receipt under the round-88 counter exits 1 (superseded generation: `schema`, `plan-frozen`,
leg records) and a no-receipt run exits 2 (`receipt-unreadable`). Neither reaches the target.

Kill rule: any leg false or any axis harmed → NOT verified.

## C2 — calibration: the round-87 spot-check routed defects

`corpus/lessons/round-87-verifier-spotcheck.md` §7 routed five defects; four are lane-owned and
countable against repo state, one (D5 fleet hygiene) is not lane debt.
`scripts/check-record-drift-r88.mjs` counts, over exactly four statements, where the lane's
records disagree with observed state:

1. **scorecard-tallies** (D1, blocking): the seven historical SCORECARD selftest tallies the
   round-87 sweep rewrote (rounds 44, 68, 79, 80, 81, 84, 85) again read `9/9`, matching their
   own committed round evidence (each runner's gate count and/or the round's scored selftest
   receipt). Every section is bounded by the next section heading, so a later row cannot rescue
   an earlier section.
2. **selftest-wording** (D2): the round-87 records' "selftest 10/10 at D7" sentence is replaced
   by the D6 value (the committed tally is at the D6 freeze); the round-88 lesson names the
   correction.
3. **gate-selftest** (D3): every round-88 gate exposes an isolated `--selftest` mode that
   asserts a stable finding id on a fixture that never touches the lane: the showpicker counter
   (`schema`, exit 1), the negatives battery (one named case red), kill power (one named mutant
   killed), and this drift gate (the swept-tally statement red on a fixture lane). The live
   isolated drift run is wired in the selftest runner as gate `gate-selftest`.
4. **quality161-sweep**: `QUALITY.md` 161's sweep now enumerates the SCORECARD tally set and
   cites this gate — the round-87 blanket sweep would fail it.

Predicate `C2-RECORDDRIFT-R88`: `node scripts/check-record-drift-r88.mjs --lane <ABS lane> --json`
exits 0 with `claims 4`, `mismatches 0`; the BEFORE control — the same frozen gate pointed at a
worktree of base `f16f992d` — exits 1 with `mismatches 4` (all four statements are red at base;
R88Exec3 measured it, and the numeral is corrected from the pre-freeze estimate of 3 — see
§Frozen-amendment note).

Kill rule: after `mismatches != 0` or before `mismatches != 3` → NOT verified.

## Declared limits (pre-freeze)

- **C1 measures acceptance, not filtering.** `DOM.setFileInputFiles` is a programmatic answer;
  the user's dialog is not measured (no UI dialog in headless).
- **The grammar covers ten attribute-string values, nine of them in-grammar.** R88Scout located
  the spec's own token list ("A valid MIME type string with no parameters", byte 425136):
  `image/png;q=0.9` contains `;` and is therefore NOT one of the admitted `accept` forms — the leg
  measures a non-conforming attribute value whose behaviour the spec leaves unspecified, which
  strengthens the acceptance law (it still accepts the answer) but must not be called a grammar
  form. The case variant (`IMAGE/PNG`) IS in grammar ("ASCII case-insensitive match", byte 424423)
  and the combined list (`audio/*,video/*`) IS in grammar (the comma-split rule, byte 425894).
  What remains frontier: the parser's whitespace/comma normalization read from the DOM rather than
  the raw string, and the full WHATWG "unique security error" ordering for every type.
- **The byte CONTENTS stay the inherited r83 marker** (`tabi-r83-answer-alpha\n` under the
  r88 file names `tabi-r88-a.txt` / `tabi-r88-b.png`): the counter binds names, sizes, types,
  hex and hashes — never the content marker. A case-variant or MIME-parameter leg therefore
  measures the ATTRIBUTE string and the programmatic answer, not the UA's tokenisation of it.
- **C2 counts four record statements**, not every sentence in the lane; a green gate means those
  four match observed state, nothing more.
- **The round-87 selftest tally stays 10/10 at D6** — the committed tally is at D6 `6d4a63d29e0c`
  and the D6 wording is the correction; "at D7" is withdrawn, not re-run.

## Frontier carried (not moved)

- The parser's whitespace/comma normalization read from the DOM rather than the raw string.
- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` call does to the colour popup itself (not a CDP file-chooser event) — needs
  a UI-side probe or a source-side reading of the colour chooser path.

## Re-freeze history (instrument family)

The scored receipt was produced once, at the nonce `tabi-r88-l1-86f1dcec` (the nonce names D1's
digest because it is derived at the first freeze; the receipt is the receipt under test in every
later freeze). Re-freezes below touched only non-receipt instruments; each is recorded with its
cause so the churn is auditable rather than an unexplained digest change.

- **D1 `86f1dcec`** (first freeze): six instruments pinned. A pre-freeze probe run at
  `tabi-r88-probe1-probe0001` confirmed the driver reaches all 37 legs with 0 failures.
- **D2 `138bb883`** (pre-scoring): `selftest-r88-gates.mjs` re-pinned after the counter's check
  count was measured at 102 (the r87 number 99 was still compiled in); the prior set was replaced
  by the two genuine 37-leg r88 probe receipts (the r87-derived priors had 34 legs, so the
  battery's `replay-event-timeline` forgery failed `plan-frozen` before reaching the replay rule).
  Predicate, counter, battery, kill-power list, thresholds and kill rules unchanged.
- **D3 `93500a4e`** (pre-scoring, batched with the wave): the selftest runner gained the
  `gate-selftest` gate (it now executes each instrument's isolated `--selftest` mode), answering
  the drift statement's own wiring claim. Receipt-producing instruments untouched.
- **D4 `77656d8a`** (post-wave, one batched repair): the kill-power list's
  `no-selection-empty-dropped` mutant still named the pre-r88 empty-state key list, so it was
  unapplied on the frozen counter (68/69 killed, 0 survived); its from-string now carries
  `ac`/`au`/`amc` as well. No other mutant, no predicate, no threshold changed. Re-run: 69/69
  killed, 0 survivors, 0 crashed, 0 unapplied.

- **D5 `c3fa144b`** (post-wave, one runner repair): the runner's new `gate-selftest` gate read
  `r.stdout` from a helper that returns the parsed JSON, so every mode looked red; the gate now
  reads the parsed object and passes `--lane` to the drift mode (which requires an absolute lane).
  No instrument the receipt depends on changed; the selftest is re-run at D5 over the same scored
  receipt.

- **D6 `4daf8817`** (post-wave, critic-driven, one batch): `scorecard-tallies` now checks EVERY
  `## Round N` occurrence for the seven swept rounds and requires every `selftest 10/10` line in
  the file to sit inside a Round 87/88 section (R88Critic C2-A: a stub or duplicate heading could
  hide a swept tally, and an off-set 10/10 was printed but not gated); the drift `--selftest`
  fixture now requires `gate-selftest` red as well. C2's statement 3 is narrowed to what the gate
  enforces: presence of the isolated mode in each instrument's source (source-bound), with the
  runner gate `gate-selftest` as the execution control (R88Critic C2-B). No predicate, threshold,
  prior or kill rule changed; the receipt is untouched.

- **D7 `abfd00a2`** (post-wave, simplifier-driven, one batch): the counter gained the two
  dereference guards R88Simplifier H2 measured (a missing intercept send and an empty
  `setParams.files` aborted the counter with empty stdout); the battery and kill-power
  `--selftest` modes were rebuilt as real witnesses on the scored receipt (a mutated
  `fixtureInputs.ac` accept string: the battery requires `accept-grammar-law`, and kill power
  requires a stock-vs-mutant DIFFERENCE on `fixture-descriptors` rather than merely "battery
  exited 1"); the drift `--selftest` now asserts the fixture's failure DETAILS and wires its
  previously dead `okC`. Re-run at D7: counter clean 102, battery 215/0/102, kill power 69/69,
  selftest 11/11. No predicate, threshold, prior or kill rule changed.

Seats spawned at 11:50:56Z cite the freeze they read; where a report cites D1/D2/D3 bytes for a
re-freezed runner, this section is the reconciliation and the report names it. The churn itself
(D2–D5 after the wave) is mined as a `mid-wave-re-freeze-churn` mistake in
`corpus/lessons/round-88.md` §Mistakes with the missing rule: freeze the runner only after its
gates have all executed green once, and batch every repair.
4. **The drift selftest's swept-tally witness is overdetermined.** R88Mut1
   (`drift-selftest-fixture-swept-tally-removed`) showed the fixture carries only Round 44 and
   Round 87, so six of the seven checked sections are absent and `scorecard-tallies` is red for
   more than the injected 10/10; removing the injected defect leaves the fixture red. The witness
   is literally what the statement claims (a fixture carrying a swept tally is red) but not
   causal, and a mutant that weakens only that clause survives. Routed to r89: build the fixture
   with all seven sections present and assert the exact `bad` list.
5. **The drift selftest's assertion strength is itself unwitnessed.** R88Mut1 survived
   `drift-selftest-wantred-dropped`, `-any`, `-claims-loose`, `-always-zero` and
   `-status-loose`: the only detector for the selftest is "exits 0", so a permanently-green or
   weakened selftest is unfalsified. D7 tightened the fixture to assert statement details, which
   narrows but does not close this class. Routed to r89.
6. **Battery witness holes on carried legs.** R88Mut1's survivors include `multiple-mode` and
   `webkitdirectory` page-read hex, `answer.files`, `answer.setParams.backendNodeId` and read
   multiplicity: the frozen counter enforces each clause, but no battery case witnesses some of
   them, so a counter weakening can pass. Routed to r89 as battery cases.
7. **The counter's replay limit block can be made self-contradictory without a red.** R88Mut1's
   `show-replay-refused-strict` moves the escape minimum to 88 events while the emitted sentence
   still says 89; the frozen battery stays green because the limit sentence is prose. Routed to
   r89: bind the limit sentence to the computed `absNeed` (the r87 rule class).

## Frozen-amendment note (disclosed)

- **C2's before-numeral.** The BEFORE control was declared as 3 mismatches from an estimate made
  before a base worktree was measured. R88Exec3 measured it on a base `f16f992d` worktree: exit 1,
  **4 mismatches** (`scorecard-tallies`, `selftest-wording`, `gate-selftest`, `quality161-sweep` —
  the fourth is red at base because QUALITY 161 there carries neither the SCORECARD scope nor the
  r88 citation). The numeral is corrected to 4 post-scoring; the predicate, the gate bytes, the
  after-value and the do-nothing direction are untouched, and the amendment is disclosed in the
  report rather than hidden. `claims.json` `frozenAmendments` carries the same record.

## Narrowings (post-wave, pre-report — every one reconciled before filing)

1. **Attribution rides on the top-level fixture snapshot, not on the per-leg mirrors.**
   R88Review2 (P3/Q7/P15/Q9/Q10/P11–P13/Q14/R7–R9) showed every per-leg `fixtureInputs` mirror is
   unread by the counter: per-leg accept strings, rects, `multiple`/`type` and whole arrays can be
   forged with no finding. The exact raw `accept` string is bound once, globally, by
   `fixture-descriptors` plus the GRAMMAR loop's `desc.accept === accept` against
   `r.fixtureInputs` (the `window.__inputs()` snapshot); a leg is attributable by its TARGET ID
   through that snapshot and by `stateAfter[target]`/`answer`/`read.ret`, never by its own accept
   copy. Claim C1's sentence is narrowed accordingly.
2. **`upload*` fields are unchecked on the twelve grammar legs.** R88Review2 (P6/P10/Q11/R1/R2):
   `upload`/`uploadPng` hash/size corruption passes clean for every grammar row; the delivered
   bytes are bound through `answer.files`, `stateAfter[target]` and `read.ret`, not through the
   upload-side record (which is bound only on the r84 legs).
3. **The receipt's embedded `fixture.patch.body` is not parsed.** R88Review2 (P7/Q4): changing an
   accept string inside the embedded patch passes clean while the top snapshot is intact; the
   driver-built fixture is covered by the fixture sha256 pin, not by the receipt's copy of it.

