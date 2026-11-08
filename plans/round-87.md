# Round 87 — plan and narrowing amendments

Base `24765dd9` (lane clean; the round-86 verifier spot-check commit). Two claims: C1 coverage
(`chromium-showpicker-linux` generation r87 — the remaining `accept` token forms) and C2
calibration (the lane-owned record defects the round-86 non-author spot-check routed).

Instruments are the round-86 family retargeted to `r87`, with the grammar table extended by four
legs and the witness runner replaced by the record-drift counter. Pins land in
`.ufo/waves/round-87/freeze.txt`, claims in `.ufo/waves/round-87/claims.json`.

## C1 — `chromium-showpicker-linux` generation r87 (the remaining accept token forms)

Round 86 measured three token forms (`image/*`, `image/png, .txt`, `application/pdf`) and named the
rest of the `accept` grammar frontier. This generation adds one leg per remaining form, each on its
own page input whose `accept` attribute is read back by `window.__inputs()`:

1. `accept="audio/*"` answered with `image/png` bytes (`sp87-accept-audio-png`);
2. `accept="video/*"` answered with `text/plain` bytes (`sp87-accept-video-text`);
3. `accept="image/png,application/pdf"` — a multi-MIME list with no space after the comma, answered
   with `text/plain` (`sp87-accept-multimime-text`);
4. `accept="  image/png ,  .txt  "` — a whitespace variant (leading/trailing spaces and a space
   before the comma), answered with `image/png` (`sp87-accept-whitespace-png`).

The measured law stays the one round 86 stated, now over seven token forms: **`accept` is not a
validator on a programmatic answer** — every delivered file lands in the input's file list with its
bytes, fires trusted `input`+`change`, and the page reads the bytes back; the attribute itself is
read from the page, so the token form is measured, not asserted. The dialog remains unmeasured.

Predicate `C1-SHOWPICKER-R87`:
- (a) the scored receipt `corpus/evidence/round87/chromium-showpicker/receipt.json` scores `clean`
  under `scripts/check-showpicker-r87.mjs` with every pin (driver, fixture, nonce) and the full
  check count;
- (b) the battery (`scripts/negatives-showpicker-r87.mjs`) exits 0 with 0 failed and full coverage;
  kill power (`scripts/kill-power-r87.mjs`) leaves 0 survivors, 0 crashed, 0 unapplied;
- (c) capability row, knowledge note, SKILL registry and the selftest
  (`scripts/selftest-r87-gates.mjs`) green.

Do-nothing controls (frozen before the wave; each is a construction that cannot pass, so the
ordering is not load-bearing — R87Exec3): the round-86 scored receipt under the round-87 counter
exits 1 (superseded generation: `schema`, `plan-frozen`, leg records) and a no-receipt run
exits 2 (`receipt-unreadable`). Neither reaches the target.

Kill rule: any leg false or any axis harmed → NOT verified.

## C2 — calibration: the lane-owned record defects the round-86 spot-check routed

`corpus/lessons/round-86-verifier-spotcheck.md` §6 routed seven defects; five are lane-owned record
defects whose fixes are countable against repo state. `scripts/check-record-drift-r87.mjs` counts,
over exactly five statements, where the lane's records disagree with observed state:

1. **accept-headline** (defect 3): the narrowing swept the distilled copies — `SKILL.md` and
   `plans/round-86.md` no longer carry "never a validator"/"filters the dialog, never a programmatic
   answer", both carry the programmatic-answer scope, and `QUALITY.md` 161 carries the class rule.
2. **mistake-evidence** (defect 4): the two `## Mistakes` rows in `corpus/lessons/round-86.md` no
   longer cite the uncommitted "first two runs"; they point at
   `.ufo/waves/round-86/lesson-proof/README.md`, which states what is retained (the final runner's
   before = 3) and that the transcripts were not retained.
3. **sources-searchlog** (defect 5): `corpus/SOURCES.md` `## Search log` carries the round-86 bounded
   re-opening with its identified/screened/included/excluded counts and access date.
4. **ledger-pointer** (defect 7): the round-86 pre-file ledger's `falsifies-wording` Scribe row names
   `plans/round-86.md §Narrowings`, and that section now carries the accept-headline item.
5. **report-corrections** (defects 1–2): `corpus/lessons/round-87.md` records the round-86 report's
   39→40 findings correction and the S221/S222 carried-not-reopened correction.

Predicate `C2-RECORDDRIFT-R87`: `node scripts/check-record-drift-r87.mjs --lane <ABS lane> --json`
exits 0 with `claims 5`, `mismatches 0`; the BEFORE control — the same frozen gate pointed at a
worktree of base `24765dd9` — exits 1 with `mismatches 5`.

Kill rule: after `mismatches != 0` or before `mismatches != 5` → NOT verified.

## Declared limits (pre-freeze)

- **C1 measures acceptance, not filtering.** `DOM.setFileInputFiles` is a programmatic answer; the
  user's dialog is not measured (no UI dialog in headless).
- **The grammar covers seven token forms**, not the whole grammar (multiple MIME tokens with
  parameters, `audio/*`+`video/*` combined lists, case variants stay frontier).
- **A whitespace leg measures the raw attribute string**, not a parsed token list: the counter
  compares the page's `accept` string exactly, so normalization is not inferred.
- **C2 counts five record statements**, not every sentence in the lane; a green gate means those
  five match observed state, nothing more.
- **The round-86 mistake transcripts stay unretained**; C2's fix is a truthful pointer plus the
  class rule, never a reconstructed run.

## Frontier carried (not moved)

- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- `accept` MIME parameters and case variants (`IMAGE/PNG`, `image/png;q=0.9`).
- What a `type=color` call does to the colour popup itself (not a CDP file-chooser event).

## Re-freeze history (instrument family)

- **D1 `efbee055d6b4`** (first freeze): six instruments pinned. The first scored run was taken at
  D1's nonce; the counter then refused honestly on `no-selection-law` because its empty-state key
  list still named the ten pre-r87 inputs, so every leg's `state` shape read as non-empty.
- **D2 `42a489b9d4be`** (re-freeze, pre-report): the `empty` predicate's key list was extended with
  `aa`/`av`/`a2`/`aws`; the scored run was repeated at D2's nonce and every gate re-run on that
  receipt. No predicate, threshold, prior or kill rule changed; both nonces are recorded and the
  records cite D2.
- **D3 `3dd4b0802d67`** (re-freeze, pre-report): the battery's per-leg case map gained the four new
  legs (their generic state mutation tripped `no-selection-law` as an unlisted extra), and the
  `no-selection-empty-dropped` mutant's `from` string was retargeted to the extended key list (it
  was unapplied at D2). The scored run was repeated at D3's nonce and every gate re-run on that
  receipt; predicates, thresholds, priors and kill rules unchanged. Records cite D3.
- **D4 `b1d06cf8db57`** (re-freeze, pre-report): ONLY the selftest runner changed — its
  lane-relative receipt path still named the round-86 receipt (the selftest caught this itself on
  its first green attempt, `counter-clean`/`battery` failing on a receipt from the previous
  generation). The scored receipt and its nonce stay at D3; the selftest at D4 scores the D3
  receipt green (9/9), and every other instrument's pin is unchanged. No predicate, threshold,
  prior or kill rule changed.
- **D5 `c921658c6046`** (re-freeze, post-wave): the drift gate only — its `ledger-pointer`
  statement now requires the repointed `§Narrowings item 9`, and `report-corrections` is a
  directional regex (`says "39 findings"` … `committed control has **40**`), answering R87Critic
  C2-3 and C2-4. The scored receipt, counter, battery and kill-power list are untouched; the
  selftest is re-run at D5 over the D3 receipt.

## Narrowings (post-wave, pre-report — every one reconciled before filing)

1. **The C1 law covers seven token forms, not the whole grammar.** `audio/*`, `video/*`, a
   multi-MIME list and the whitespace variant join the three r86 forms; MIME parameters, case
   variants and combined media lists stay frontier (knowledge note §What a receipt of this shape
   cannot prove).
2. **A cold run's only legitimate finding is the declaration `prior-set-complete`.** The frozen
   counter refuses any in-tree r87 receipt not declared as a prior; the scored receipt is clean
   because it is the receipt under test. Cold-run reproduction is 98/99 true, not 99/99
   (w1/R87Exec1.md §2).
3. **The claims.json C1 counting command carried the superseded D2 nonce** until R87Exec3's §5
   caught it; the pointer was corrected to `tabi-r87-l1-3dd4b0802d67` after the freeze, and no
   predicate, pin or threshold changed (this is a record fix, not an instrument change).
4. **The plan's "controls committed before any score" wording is corrected**: both controls were
   FROZEN before the wave but re-captured after the scored run; each is a construction that cannot
   pass, so ordering is not load-bearing (w1/R87Exec3.md §5).
5. **Kill-power's `results` array order is not stable across runs** (8 concurrent workers); the
   mutant set, outcomes, `failed` counts and k/s/c/unapplied totals are (w1/R87Exec2.md §Findings).

6. **The "read from the page" clause is receipt-level, not instrument-enforced (R87Review2 F1/F2).**
   The scored receipt contains the 34 `window.__inputs()` calls and every per-leg descriptor copy
   is deep-equal to the top-level (verified by the reviewer), but the counter does not REQUIRE the
   call and never reads `fixture.patch.*`. The sentence narrows to: the scored receipt records the
   attribute read, and the counter enforces the descriptor/answer/read facts; the act itself and
   the served-DOM source rest on the driver pin, the fixture sha and the reviewer's check.
7. **Per-leg `fixtureInputs` copies are dead data (R87Review2 F3).** The accept fact is bound
   through the top-level snapshot (copied from the first leg's read), not through each leg's own
   copy; the honest receipt has 0/34 divergent copies, but the per-leg copy is not independently
   attributable.
8. **Answer source inventory and path are not bound (R87Review2 F4/F5).** What is bound is the
   delivered name/size/type, the read hex and the send-log lexical equality; the receipt's
   `upload*` inventories and a same-basename source-directory transplant are unbound and move no
   delivered byte.

9. **The driver/fixture pins are declaration-level (R87Review1 F1).** `driver-pin` and
   `fixture-hash` compare receipt fields to the CLI pins; the counter never reads instrument bytes
   or re-computes the fixture from the served HTML. Leg (a)'s sentence narrows to: the receipt
   DECLARES the pinned strings and the scored run was produced by the pinned driver (the
   reviewer's independent `--expect-driver-sha256` + the driver's own `driverSha256`); the counter
   does not prove provenance. The fixture hash is run-specific (it embeds the child-origin port).
10. **Per-leg accept descriptors are not checked; the fact is bound at the top level
    (R87Review1 F2).** The four new legs' own `fixtureInputs` copies can disagree with the
    top-level snapshot without a finding (same class as narrowing 7); 99/99 check-id coverage is
    not contradicted, but the per-leg location is unwitnessed.
11. **A `read` event's `isTrusted` is a fixture-authored literal (R87Review1 F3).** The page's
    read handler records `isTrusted: true`; `trust-law` enforces the recorded value, not a browser
    trust fact for the synthetic `read` event.

12. **The selftest's `capability-status` gate runs an instrument outside the freeze pin table
    (R87Exec2 F3).** `scripts/check-capability-status.mjs` is not one of the six pinned files and
    the selftest does not hash-assert it; its bytes are fixed only by HEAD. "Selftest green" is
    therefore nine gates, eight of which run pinned instruments.

13. **C2 statements (4) and (5) were repaired, not merely narrowed (R87Critic C2-3/C2-4).**
    (4) is enforced as "the round-86 ledger row names `§Narrowings item 9` and the section carries
    the accept-headline item": the row was repointed and the gate now requires `item 9`. (5) is
    enforced as a directional regex (`says "39 findings"` … `committed control has **40**`); the
    inverted-record counterexample the Critic ran against the first gate now fails it (D5). The
    before-value still counts the complete record fix, including the two files introduced this
    round (R87Exec3 §1).
- **D6 `6d4a63d29e0c`** (re-freeze, post-wave): the selftest gained a tenth gate,
  `noreceipt-control`, which runs the counter against an absent receipt and asserts exit 2 with
  `receipt-unreadable`, answering R87Sentinel F3 (the exit-2 control was static, not re-executed).
  Nothing else changed; the selftest is re-run at D6 over the D3 receipt.

14. **The new grammar rows do not bind every answer field (R87Mut1 S07/S08/S12/S11).** Four
    whole-counter escapes survive the frozen battery: the grammar law's `setParams.backendNodeId`
    echo, full `answer.files` equality (only `length === 1` is bound), `setResult`/`setError`, and
    an extra `read` event (caught by the per-leg seq check, not the law). The law still binds the
    delivered name/size/type, the read hex and the input/change/read event tuples; those four
    echos are unbound and are routed to the next generation.
15. **The selftest's counter gate takes its expected identity from the receipt it grades
    (R87Sentinel F6).** `driver-pin`, `nonce-expected` and `fixture-hash` are satisfied by
    construction inside the selftest; the round's identity is bound by the explicit-pins standalone
    run (`scored/counter-a.json`) and by `pins-match-freeze`. The harness self-reference is a
    known limit of "selftest green", not of the claim.