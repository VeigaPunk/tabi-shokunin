# R58Counter — C2 frozen counter (r58 generation)

Seat: leaf executor, round 58 wave w1. Assignment: WRITE the frozen C2 counter and its
fixtures; no live data run (the L1 runs the one live pass after the freeze commit). No git/jj
mutation, no corpus write, no /tmp use, no installs (none needed).

## Owned paths (new files; r57 bytes never edited)

| Path | What |
|---|---|
| `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs` | the counter, 83 630 B, sha256 `632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52` (from `--self-check`) |
| `.ufo/waves/round-58/counters/chromium-receipt-r58-fixtures/` | 78 fixture cases + their receipt/PNG/driver-stub inputs |
| `.ufo/waves/round-58/counters/c2-r58counter-selftest.json` | selftest receipt (78/78, allPass true, 49/49 ids) |
| `.ufo/waves/round-58/counters/c2-r58counter-r57-carry.json` | per-case carry proof (70/70 r57 ids green here) |
| `.ufo/waves/round-58/counters/c2-r58counter-smoke-grade.json` | grading of the runner's two live smoke receipts |
| `.ufo/waves/round-58/counters/c2-r58counter-do-nothing.json` | do-nothing control: absent receipt |
| `.ufo/waves/round-58/counters/c2-r58counter-live-shape-probes.json` | swallow checks fired on the runner's own shape |
| `.ufo/waves/round-58/measure/c2-r58counter-refuses-r57.json` | cross-refusal on the COMMITTED r57 receipt |

BASE: `cp .ufo/waves/round-57/counters/chromium-receipt-r57.mjs` then extend. Every r57 finding
id (29 r56 + 14 r57 = 43) is kept with the same semantics — schema, nonce re-derivation,
driver-sha pin, step-PNG pins (now with the IHDR geometry witness), the six-step order, the
step PNG hash loop, the control domain, the r57 modifier domain, the entry-by-entry pageKeylog
plan, cross-refusal behaviour. The six r58 ids are added on top (49 total).

## Behaviour implemented

1. **Schema/refusal.** `SCHEMA = tabi-chrome-cdp-r58`, `NONCE_RE = ^tabi-r58-[0-9a-f]{12}$`.
   A receipt whose schema differs is refused with `schema-wrong` **first** (emission order, not
   just set membership); a receipt that cannot be read/parsed now also records a
   `couldNotEvaluate` entry (`receipt-absent` / `receipt-unreadable` / `receipt-unparseable`)
   in addition to the r56 finding id.
2. **Swallow checks (k1–k5), re-derived from the receipt's own nonce hex tail.** The control
   characters are tail[0], tail[1]; the swallowed insertion is tail[2]; the swallowed chord is
   Control then Enter with S153 bit 2. Recorded values are only ever the subject of the
   comparison.
   * k1 `swallow-control-inserted-wrong`: control block present, `typed` (string or per-char
     array) and `valueAfter` equal the derived pair, both control keydowns exist keyed to the
     derived characters, and the gate is recorded OFF.
   * k2/k3 `swallow-value-changed`: `backspaceSwallow.valueAfter` and `digitSwallow.valueAfter`
     EQUAL the pre-step value (the control `valueAfter`); a prefix relation is not the witness.
   * k3 plan: `digitSwallow.char`/`key` equals the derived third character.
   * k4 `swallow-enter-chord-leak`: `submitted === false`; the Enter keylog entry carries
     modifiers bit 2; `journey.form.serverRequests` has exactly ONE `/echo` row and exactly one
     row whose query carries `field` and `field2` and not `field3`; no row anywhere carries
     `field3`. (`/form` and `/favicon.ico` rows are expected — the count is the `/echo` count,
     not a count of all rows.)
   * `swallow-defaultprevented-missing`: the recorded flag VALUE is wrong (or `cancelable` is
     false) on a swallow-leg entry — TRUE on the swallowed Backspace, insertion and Enter;
     FALSE on the gate-OFF control entries and on the chord's Control keydown (the declared
     swallow set is `{Enter}`).
   * `swallow-plan-mismatch`: no `swallowLeg`; a required block absent; a required keylog entry
     absent from both the block and the pageKeylog continuation; a recorded swallow entry whose
     key/code/keyCode, modifiers bit, booleans or targetId differs from the derivation; a block
     that embeds keydowns none of which is the derived key; a pageKeylog continuation that is
     not EXACTLY the derived six-keydown swallow plan; a recorded gate state contradicting the
     leg's plan.
   * k5 `swallow-recorder-fields-missing`: `fixtureDelta` absent (top-level as the runner writes
     it, form-level also admitted) or not naming cancelable AND defaultPrevented; 
     `witness.allCarryAdditiveFields === false`; any swallow-leg keylog entry lacking either
     boolean field.
3. **PageKeylog.** The r57 entry-by-entry re-derivation is carried. When the record continues
   past the four carried legs, the continuation must equal the derived swallow plan exactly
   (identity, order, modifiers bit, targetId, booleans). An absent continuation is admitted:
   the swallow witnesses are then proven by the per-block entries (declared residual below).
4. **#field3 semantics (carried id, disclosed shift).** The top-level `field3Value`/`field3Final`
   are read AFTER the swallow leg by the frozen runner, so they must equal the derived
   two-character prefix; the post-chord witness `chordLeg.field3ValueAfter` must still be empty
   and the swallow leg must START empty (`swallowLeg.control.valueBefore === ''`). When the
   nonce derives nothing, the r56 clause (`=== ''`) is carried verbatim.
5. **PNG geometry.** Every `steps` entry keeps its sha pin + signature + first-chunk IHDR
   (13-byte IHDR, non-zero width/height); when `stepsExtended` is present its entries are hashed
   the same way (the four swallow shots and the carried shots).
6. **Fixtures.** 78 cases. All 70 r57 cases are carried with the SAME case ids and the SAME
   exact finding sets: each base receipt was relabelled to the r58 schema/nonce (including the
   per-keystroke prefix strings, and the one per-character consequence of the relabel — nonce
   char 7 `7`→`8`, `Digit7`/55→`Digit8`/56) and given a valid nonce-derived swallow leg
   (`swallowLeg`, `fixtureDelta`, `serverRequests`, the pageKeylog continuation, the post-leg
   field3 values) so the carried case still isolates exactly the one r57 check it names. The
   r56-schema receipts (`crossgen-r56-*`) stay at their own schema/nonce (nonce-unusable, no
   injection); `crossgen-r57-receipt-to-r56-counter` keeps the committed r57 schema/nonce and
   now asserts the r58 cross-refusal. Eight new cases: one per new id (six), a
   `do-nothing-no-swallow` control, and a `swallow-pagekeylog-continuation` case. The r58
   fixtures' `green-synthetic`, `green-window-form`, `green-extra-step`, `shot-files-*` and
   `expect-driver-sha-agrees` cases are green under the new domain.
7. The `--shot` contract is unchanged; `--expect-driver-sha256` unchanged; `--self-check` and
   `--selftest` report the r58 schema strings.

## Retained evidence (all commands run, all receipts parse)

| Check | Command | Result |
|---|---|---|
| selftest | `node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs --selftest` | exit 0, `allPass true`, **78 cases, 78 pass**, id coverage 49/49, uncovered [], stray [] → `counters/c2-r58counter-selftest.json` |
| carry proof | r57 counter `--selftest` vs r58 results, compared case by case | **70/70 r57 cases present and green** with their original expected sets → `counters/c2-r58counter-r57-carry.json` |
| cross-refusal (committed bytes) | `node …/chromium-receipt-r58.mjs corpus/evidence/round57/chromium-modifier-chords/receipt.json --driver scripts/chrome-cdp-loopback-round57.mjs --shot corpus/evidence/round57/chromium-modifier-chords --json` | exit 1, findings `[schema-wrong, nonce-shape]`, `schema-wrong` FIRST, `couldNotEvaluate [nonce-unusable]` → `measure/c2-r58counter-refuses-r57.json` |
| do-nothing (absent receipt) | `node …/chromium-receipt-r58.mjs .ufo/waves/round-58/measure/absent-by-construction.json --driver …/driver-stub.mjs --json` | exit 1, `[receipt-missing]`, `couldNotEvaluate [receipt-absent]` → `counters/c2-r58counter-do-nothing.json` |
| live runner smoke grading | `node …/chromium-receipt-r58.mjs .ufo/waves/round-58/runner/smoke{1,2}/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --shot …/smoke{1,2} --json` | exit 1 with **only** `png-missing` (18 pinned PNGs per smoke; the runner retained only receipt.json + smoke-log.json). Nonces `tabi-r58-7313c79d53a3`, `tabi-r58-ee27956ee80f`; **every r57 carried check AND every r58 swallow check passed on these live bytes** (no other finding, `couldNotEvaluate []`) → `counters/c2-r58counter-smoke-grade.json` |
| live-shape mutation probes | 7 single-mutation copies of `runner/smoke1/receipt.json` (scratch, removed) | each produced exactly the expected delta over the control's `png-missing`: dp→`swallow-defaultprevented-missing`; enter modifiers 0→`swallow-plan-mismatch`; second `/echo`→`swallow-enter-chord-leak`; value→`swallow-value-changed`; missing cancelable→`swallow-recorder-fields-missing`; pageKeylog continuation key→`swallow-plan-mismatch`; no leg/no delta→both `swallow-plan-mismatch` + `swallow-recorder-fields-missing` → `counters/c2-r58counter-live-shape-probes.json` |

The two runner smoke receipts are NOT the data receipt; grading them is a pre-freeze sanity
signal only. The live receipt, its PNGs and the pinned driver sha are the L1's data pass.

## Risks / residuals (declared, not hidden)

* **Carried fixtures are relabelled + injected.** They are the only way to keep the 70 r57 ids
  scoring under the r58 schema; the injected swallow leg is nonce-derived and consistent, so a
  carried case still fails for exactly its named r57 defect. The mutation that *creates* each
  carried case is preserved at the receipt level (only the schema/nonce/leg wrapper is new).
* **PageKeylog continuation is admitted absent.** A receipt may omit the swallow section of the
  page record while still proving the swallow through `swallowLeg.*.keylogEntry` copies. The
  per-block entries and the value/flag witnesses are still mandatory; only the global copy is
  optional (the frozen k1–k5 name the per-block/entry witnesses).
* **`stepsExtended` hashing** requires the 12 evidence PNGs beside the receipt (or in `--shot`).
  The claim's after-state commits them; if the L1 invokes the counter against a directory
  without them, `png-missing` is red by design.
* **field3 shift is a disclosed semantic carry**: the top-level `field3Value`/`field3Final` are
  now the typed two-char prefix, not `''`; the negative witnesses moved to
  `chordLeg.field3ValueAfter === ''` and `swallowLeg.control.valueBefore === ''`. A receipt that
  keeps the r57 empty-string convention for the top-level pair is refused (`field3-not-empty`).
* The r57 counter's refusal of the r58 receipt and the live green run are NOT measured here
  (L1's data pass, by instruction). No data receipt, no corpus file and no driver file was
  written or modified by this seat.
* No tool installs. Scratch (`/fast/scratch/hyaku/tabi-r58/R58Counter/`) was used only for
  authoring generators and removed before yielding; every receipt above lives in the lane.
