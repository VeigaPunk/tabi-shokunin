# tabi — round 82 (attempt 2): plan and amendment

L1 `TabiR82a2`. This file records the one §8 amendment this round required (narrowing of C2
leg (b)). The frozen claims themselves are in `.ufo/waves/round-82/claims.json`; this file is
the pointer the falsification ledger's `narrowing` column resolves to.

## Frozen claims (as frozen)

- C1 `C1-SHOWPICKER-R82` (coverage, capability `chromium-showpicker-linux` generation r82):
  legs (a) scored run clean 64 checks, (b) battery 70/70 + kill power 46/46, (c) row/note/
  registry/selftest. Counting command: `check-showpicker-r82` on
  `corpus/evidence/round82/chromium-showpicker/receipt.json`.
- C2 `C2-RECORDDRIFT-R82` (calibration, record drift): legs (a) drift counter 0 mismatches,
  (b) quote-count propagation 23→20 **directional** + wave files + dead seats + lands-last,
  (c) r82 identity/numbers. Counting command: `check-record-drift-r82`.

## Amendment 1 (this round) — narrowing of C2 leg (b)

**Finding:** `.ufo/waves/round-82/w1/R82Drift/report.md` control 1 — reversing the lesson's
`23 → 20` to `20 → 23` (both numbers still present) → counter **exit 0, 0 mismatches**.
Independently reproduced by `R82Scribe` (reversing, removing both arrows, or rewriting
`c2-controls.json`'s `"refused"` → all exit 0). The `directional` regex
`/23.*→.*20|23-word.*20|superseded.*20/i` is satisfied by the stale quotation's own text, so
direction is not what is tested; the `direction-bound` leg greps the controls file for the
word `reversed` and never re-executes the control; the committed `c2-controls.json` asserts
`"refused": true` while R82Drift's control-1 record shows nothing refused.

**Narrowed wording:** C2 leg (b) is filed as verifying **propagation and presence** of the
23→20 correction (stale strings present in LOG/QUALITY/SCORECARD; lesson names the superseded
count and the truth `20 words`; S223 cited; the directional shape present), plus
`wave-files-committed`, `dead-seats-named`, `report-lands-last`, `r81-verdicts-preserved`,
`r82-identity` (byte-bound), and `r82-numbers` (64 checks bound to SCORECARD/LOG/lesson).
**Not verified** (withdrawn from the claim, not filed wider): that a reversed correction
would be refused. Before→after is unchanged: 4 mismatches → 0.

**Pulled in with the same amendment:** the committed lesson's "before: 7 mismatches" (twice)
is wrong — `lesson-proof/c2-before.json` records **4** (and SCORECARD counted 4). The correction
is recorded here (7 → 4, directional); the frozen lesson is append-only so the stale count
stays readable with this note as its correction.

**Routed to r83:** rewrite `check-record-drift-r83` so that (i) the directional check anchors
on the correction cell (`23 → 20` with the arrow between the two tokens, not anywhere in the
file), and (ii) `direction-bound` re-executes the reversed-correction control on a scratch
copy instead of grepping `c2-controls.json` for a word. The counter is frozen, so this is a
next-round edit.

## Pre-frozen reach (for the record)

- The counter's live legs: `type=color` exempt (returns undefined, no chooser), month/week/time
  SecurityError, r81 six laws carried, second chooser shares `backendNodeId` (11; measured limit
  — R82Exec3 probe). The frontier is `type=number`/`range`, second-chooser answer attribution,
  and the `accept` token grammar.
