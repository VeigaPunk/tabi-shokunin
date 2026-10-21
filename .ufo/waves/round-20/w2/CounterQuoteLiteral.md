# CounterQuoteLiteral — quote_mismatch & source-digest precedence review (round 20, w2)

Seat: TabiR20.CounterQuoteLiteral. Scope: attack `quote_mismatch` and source-digest error
precedence; quotes inside exact span; expected pairs checked independent of recomputation;
finite schema coverage. Files: `.ufo/waves/round-20/measure-c1.mjs`,
`.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json` @
4ae99816b8994fdedc159156d8d9d242dd5c4782.

Method: source-only inspection. No code/tests run (lane freeze). Bytes grounded read-only:
`design.json` sha256 `1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da` and
blob sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` both match
their pins, so every quote verification below was done against the pinned bytes. All findings
are mechanical fixture/schema consistency; none is a semantic-truth, depth-scalar, or runtime
claim.

## Findings

### F1 — HIGH: 4 persisted expected pairs cannot be produced by the counter at the pinned commit

`registry_backlink_missing` has exactly two emit sites in `measure-c1.mjs` (grep-confirmed):
line 521 (`checkContractRow` used-by cell) and line 547 (note-level `citesToken` for S096 and
S100). The selftest's `renderNote` unconditionally emits the Sources line
`Sources: ${PIN.sourceId} …; ${PIN.authorityId} …` (PIN.sourceId `S096`, PIN.authorityId
`S100`, selftest-c1.mjs:41-43,65), so the note-level site can never fire in any fixture; the
registry site only fires when `usedBy` is mutated, which only `missing_registry_backlink` and
`s100_backlink_missing` do. Additionally, `checkDecisionAnchor` returns silently when the
cited row is absent (`if (matches.length !== 1) return;`), so `decision_anchor_uncovered`
cannot fire for a source id with no registry row.

Contradicted pairs in `expected.json` (all count 12, exit 1; predicted correct pairs from
hand-derivation):

| case | persisted findings | counter can only emit |
|---|---|---|
| `wrong_source_id` | decision_source_mismatch, **registry_backlink_missing**, source_mismatch | `decision_source_mismatch`, `source_mismatch` |
| `wrong_decision_source_override` | **decision_anchor_uncovered**, decision_source_mismatch, **registry_backlink_missing** | `decision_source_mismatch` |
| `missing_decision_source_override` | decision_anchor_uncovered, decision_source_mismatch, **registry_backlink_missing** | `decision_anchor_uncovered`, `decision_source_mismatch` |
| `forced_s096_lc11` | decision_anchor_uncovered, decision_source_mismatch, **registry_backlink_missing** | `decision_anchor_uncovered`, `decision_source_mismatch` |

Bold entries are impossible for these fixtures. Internal inconsistency proof inside
expected.json itself: `override_table_mismatch` (same LC11 source-removal family, note row
tampered to S100) correctly persists no backlink, and `s100_row_missing` (cited row absent)
correctly persists only `registry_row_invalid` — the same structural situations the four
broken pairs misreport. My model reproduces 30/34 persisted pairs exactly, including these
two controls; only the four above diverge.

Consequence: `--selftest` at the pinned commit fails these 4 cases (4× FAIL_DETAIL,
verdict=failed, exit 1). The persisted pairs are stale or mis-derived, not the counter.
Recommend Main correct the four `findings` arrays to the predicted pairs in the table before
the serial verification, or accept the 4 failures as this finding's confirmation.

### F2 — MEDIUM: the only quote_mismatch red case cannot enforce "exact span"

`quote_mismatch` mutates LC04's quote to `context->PauseExecutionNow();` — grep confirms this
string occurs nowhere in the pinned blob. A mutant that checks the quote against the whole
blob (or any superset of the pinned span) instead of the exact pinned span still emits
quote_mismatch and survives. Recommend one cross-span red case: set LC01's quote to LC09's
`"could not be serialized to JSON")));` — a literal of the blob inside 298-319, outside
LC01's pinned 181-186 (verified against pinned bytes) — expected exactly
`["quote_mismatch"]`, count 12, exit 1. Caveat for fixture choice: LC04 (212-218) and LC05
(218-221) share line 218, so cross-quoting between those two would NOT mismatch; use distant
spans. Already covered elsewhere: `invalid_span_reversed` proves the quote is checked against
the design PIN, not the entry's declared span (a declared-span mutant would add
quote_mismatch there, since `slice(257,249)` is empty).

### F3 — MEDIUM: digest→quote precedence is implemented but unasserted

Literal quote checks are gated on `sourceLines !== null` (verify-then-quote:
`verifiedSourceLines` returns null on absence or digest mismatch; `checkDecision` requires
`sourceLines !== null` for quote_mismatch). Both existing precedence fixtures
(`source_digest_edit`, `source_absent`) keep all quotes valid, so a mutant that drops the
gate and checks quotes against unverified bytes survives: the appended newline lies after
every pinned span, so quotes remain literal in the mutated blob. Recommend one combined red
case: append `'\n'` to the blob AND set LC04's quote to `context->PauseExecutionNow();` →
expected exactly `["source_digest_mismatch"]`, count 12, exit 1. This is the only fixture
shape that kills unverified-source quote checking. (A source-absent + bad-quote variant is
weaker; gate removal there throws and is already caught by `compare`'s throw trap.)

### F4 — LOW: finite schema coverage — 4 of 24 FINDING_IDS unexercised, check is one-directional

Expected vocabulary has 20 reasons, all registered in FINDING_IDS and each exercised by ≥1
case (loadExpected invariants hold). Unexercised: `decision_shape`, `decision_unknown_id`,
`decision_text_invalid`, `table_heading_duplicate`. `loadExpected` enforces
vocabulary ⊆ FINDING_IDS but not FINDING_IDS ⊆ vocabulary, so renaming/removing one of the
four ids — a contract change per the counter header — passes silently. Minimal red cases if
Main wants closure: LC12 id → `LC99` in manifest+row with quote `zzz` →
`["decision_missing","decision_unknown_id","table_row_extra"]` (also pins that
quote_mismatch never fires without a pinned span); LC04 condition containing `|` →
`["decision_text_invalid"]` (rows render identically on both sides, no table findings);
duplicate heading appended after the table → `["table_heading_duplicate"]`; delete LC12's
`quote` key → `["decision_shape"]` (`renderable()` does not require quote, row still
matches). Alternatively extend loadExpected to require vocabulary ≡ FINDING_IDS — contract
decision for Main; either closes the drift hole.

## Verified correct (no action)

- All 12 fixture quotes are literal substrings of their pinned spans in the pinned bytes
  (checked spans 181-186, 189-210, 212-221, 224-229, 249-258, 261-275, 290-327, 787-815,
  818-830); span table matches design.json; fixture pin sha256 matches design.json on disk.
- Precedence semantics as designed: source absent/digest-mismatch suppress quote literal
  checks but NOT anchor-coverage checks (registry-based, blob-independent) — asymmetry is
  intentional and consistent across pairs.
- `invalid_quote_empty` (quote_invalid only, trim gate blocks mismatch) and
  `invalid_quote_26_words` (in-span 26-word literal → quote_invalid only; proves
  quote_invalid does not gate the mismatch check) are correct pairs.
- `quote_mismatch` fixture itself: `context->PauseExecutionNow();` is 1 word (no
  quote_invalid), absent from span 212-218 and from the whole blob → exactly
  `["quote_mismatch"]` is correct for the current counter.

## Residual risk / verification gaps

- I did not execute the selftest (forbidden this wave); F1's four failures are predicted
  from logic, not observed. All other 30 pairs are inspection-derived, not run-confirmed.
- Fixtures are built from the same DECISIONS table preflight-verified against the blob; a
  byte-level drift in the retained blob would surface as exit 2 preflight, not a wrong pair.
- No tool installs were needed; nothing recorded under the tooling directive.

Report path: `.ufo/waves/round-20/w2/CounterQuoteLiteral.md` (this file), lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.
