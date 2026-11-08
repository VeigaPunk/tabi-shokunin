# tabi — round 89

L1 `TabiR89`. Base `5a9011635c3bafb64a59a1411c4036bb40438724` (lane clean; the round-88
verifier spot-check commit). The round-88 non-author spot-check admitted r88 C1
(`chromium-showpicker-linux` generation r88) and C2 (the r87 routed defects D1–D4), and routed
two defects to r89: the DOM-parsed normalization frontier (spot-check §7 item 2, and r88's own
`Planned (r89)` line 1), and the R88Mut1 survivor families plus Narrowings 4–7 (spot-check §7
item 1). Claims: C1 coverage — capability `chromium-showpicker-linux` generation r89 (the
DOM-parsed token list); C2 calibration — the r88 spot-check routed defects 1–2 (drift-fixture
causality, the selftest fixture leak, the replay limit block).

D **`061dec8a`** (final freeze; D1 `7bde5e6c2f2d` first freeze, D2 the battery `LEG_ALSO`
repair, D3 the replay-limit consistency move to the limit block, D4 the kill-power from-string
repair + the `accept-domread-law-raw` battery case, D5 the last from-string repair —
`plans/round-89.md` §Re-freeze history). The scored receipt was produced once, at the nonce
`tabi-r89-l1-7bde5e6c2f2d`; every later freeze touched only non-receipt instruments. A pre-freeze
probe run at `tabi-r89-probe1-probe0001` confirmed the driver reaches all 41 legs with 0 failures,
and the two 41-leg probes are the prior set.

Census start: exit 0, 223 rows (`census/start.txt`); end: pending.

## Gate

### Sources — opened this round

The L1 fetched the living WHATWG `common-microsyntaxes.html` on 2026-11-08 (HTTP 200, 121,595
bytes, sha256 `2e9e2cbbe1ed…`, staged at `.ufo/waves/round-89/sources/common-microsyntaxes.html`).

- **S224** — WHATWG §2.3.8, the set of comma-separated tokens. Located quote: "tokens each
  separated from the next by a single U+002C COMMA character (,), where tokens consist of any
  string of zero or more characters, neither beginning nor ending with ASCII whitespace." This
  is the normative ground for the DOM-parsed token list: split on commas, surrounding ASCII
  whitespace does not count as part of the token (the lane's lowercasing is disclosed as its
  own normalization, not the spec's).

Identified 1 / screened 1 / included 1 / excluded 0 for NEW rows. The round-89 `## Search log`
entry is added at `corpus/SOURCES.md` (this round's bounded re-opening).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-89.md` (cites S224, S223, S219,
S216 and the r88 carrier rows).

Rejected (with flip conditions):

- **"The domread leg measures Chromium's own tokenization"** — the tokens are the page's own
  `window.__inputs()` output (the fixture's split/trim/lowercase), not Chromium's internal
  parsing; the dialog is unmeasured. Flip: a dialog-observable harness.
- **"The settle re-read is counter-verified"** — the counter binds the `domRead` data, not the
  `Runtime.evaluate` that produced it (R89Review2 finding F1). Flip: a plan-calls requirement
  for the settle evaluate on domread legs.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Report corrections carried into this round (round-88 spot-check §2, defects D2)

- The round-88 records' "selftest 10/10 at D7" wording is corrected to the D6 value: the
  committed tally is at the D6 freeze (`6d4a63d29e0c`), and the round-88 lesson's scored line
  and this SCORECARD's r88 row now carry "10/10 at D6" (the D7 freeze changed the drift
  gate's item-heading/directional checks only, never the selftest). This lesson names the
  correction explicitly, so the drift gate's `selftest-wording` statement holds.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-89/claims.json` (nonce `tabi-r89-l1-7bde5e6c2f2d`,
receipt D `7bde5e6c2f2d`; instrument freeze D1 `7bde5e6c2f2d`). Scored: counter clean **107** checks;
battery **223** cases / 0 failed / coverage 107/107; kill power **72** mutants / 72 killed /
0 survivors / 0 crashed / 0 unapplied; selftest **11/11**; record drift **3 → 0**.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `stale-seed-count` — the selftest runner's `counter-clean` gate carried the round-88 literal `checkCount === 102` (copied with the file) and never went green at any r89 freeze (108 at D1, 107 at D3+) | `scripts/selftest-r89-gates.mjs:55`; `w1/R89Critic.md` F9; `w1/R89Scribe.md` F1; `w1/R89Simplifier.md` §1 | the r88 lesson's own rule (freeze only after a full selftest run on the exact bytes) was not applied to the runner, only to the receipt instruments | the literal is set to the counter's measured 107 and re-run green at the final freeze; the r90 rule: the runner's expected count is derived from one scored run in the same commit, never copied |
| `mid-wave-re-freeze-churn` — five instrument edits (D2–D5) after the wave spawned, each triggered by a defect a seat then measured: the battery LEG_ALSO gap, the replay-limit check that no receipt mutation can trip, three kill-power from-strings, the survivor raw case | `plans/round-89.md` §Re-freeze history; `w1/R89Exec2.md` (kill power 3 unapplied), `w1/R89Simplifier.md` (F4/F5), `w1/R89Sentinel.md` S1/S9 | none — the freeze committed before the full battery + kill-power + selftest batch had executed green once on the exact bytes | all repairs batched per trigger and disclosed with digests; r90 rule: freeze only after the three-way scorer (counter + battery + kill power + selftest) runs green on the exact bytes, and let one post-wave repair batch be the maximum |
| `frozen-control-numeral` — C2's before-value was declared as 2 mismatches; the base-worktree measurement gives 3 (`gate-selftest` joins because the r89 scripts are absent at base) | `w1/R89Exec3.md` (base `5a901163`: exit 1, 3 mismatches); `scored/drift-before.json` | the freeze checked the predicate but not that the before-value came from an executed control | numeral corrected post-scoring to the measured 3 and disclosed in `claims.json` `frozenAmendments` + `plans/round-89.md` §Frozen-amendment note (that section does not exist; the disclosure is the `frozenAmendments` entry, as corrected in §Corrections item 2) |
| `selftest-witness-vacuity` — the drift `--selftest` fixture was red for absent records rather than the injected defect, and the two vacuity spots in `negatives` (no sp89 `LEG_ALSO`) and `kill-power` (three unapplied from-strings) let the family report green on a red battery | `w1/R89Simplifier.md` F4/F5 (measured tables); `w1/R89Mut1.md` §1 (the original battery is red at baseline: 4 failed, 5 uncovered) | the `gate-selftest` gate only required exit 0 | rebuilt as real witnesses at D2–D5 (the four domread `LEG_ALSO` entries, the three unique from-strings, the `accept-domread-law-raw` case); the drift fixture now carries all seven swept sections and asserts the causal `bad` list |

## Corrections carried by round 90 (append-only; the round-89 records above are not rewritten)

The round-89 non-author spot-check (`corpus/lessons/round-89-verifier-spotcheck.md` §7) routed six
defects; round 90 repairs the record here, and `scripts/check-record-drift-round90.mjs` counts the
statements. Nothing below alters a frozen predicate, counter, pin, prior, threshold or kill rule.

1. **Claim sweep (D1).** `claims.json` C2 `type` item (3) and leg (c)'s fixture-leak clause are
   false of the final instruments: the replay-limit invariant is `limit.replayConsistency`, a
   computed boolean in the `limit` block (D3 removed the numbered check; `scripts/check-showpicker-round89.mjs:943`
   records why), and the fixture-tree removal was verified by a manual `ls`, not a scripted check
   (the prefix is `tabi-`, not `tapi-`). A `frozenAmendments` entry now names both.
   `plans/round-89.md` §C2 item 3 keeps its frozen text (the amendment's `field` now names it); this
   correction is the live statement.
2. **Narrowing pointers (D2).** The two C1 `falsifies-wording` rows in
   `.ufo/waves/round-89/claim-falsification.tsv` point at `plans/round-89.md §Narrowings`, which
   does not exist. The real amendment locations are the `## Round 89` narrowing block in
   `SCORECARD.md`, the §Re-freeze history D3/D4 entries in `plans/round-89.md`, and the knowledge
   note's `## Limits the wave established (r89)`. Corrected rows are appended to the ledger with
   the `C1/R89*-corrected` prefix; the original rows stay.
3. **Census and source attribution (D3).** Round 89's end census is 224 rows, exit 0
   (`.ufo/waves/round-89/census/end.txt`); the "223 rows" figure was the pre-S224 count. The
   "S223/S219 re-opened in place" attribution describes the **round-88** re-opening
   (`corpus/lessons/round-88.md` §Gate), not a round-89 one; round 89 opened S224 only. The S224
   Gate quote below is the ≤25-word located quote, and the search-log quote is verbatim.
   - S224 (WHATWG HTML §2.3.8, `dfn id=set-of-comma-separated-tokens`, fetched 2026-11-08,
     121,595 B, sha256 `2e9e2cbbe1ed`): "tokens consist of any string of zero or more characters,
     neither beginning nor ending with ASCII whitespace" (17 words).
4. **Leak enforcement (D4).** The round-89 claim that the drift `--selftest` removes its fixture
   tree is narrowed: the round-89 gate removed the tree it created in the same process, but no
   check could fail on a leaked tree. Round 90's witness is
   `.ufo/waves/round-90/scored/leak-witness.json`: the gate's `--selftest` run on the committed
   bytes exits 0 with `fixtureAbsent: true`, and a copy whose removal call is dead-branched exits 1
   with `fixtureAbsent: false`. The r90 drift statement reads that artifact against the frozen pin;
   there is no battery case for this class (the battery mutates receipts, not subprocesses).
5. **Revision naming (D5).** `scored/drift-a.json` was written at 10:13 -03:00, before the last
   `SCORECARD.md` (10:19:34) and `SKILL.md` (10:19:40) writes; the "measured at `b7513f81`" line
   names a revision later than the run. The four predicates were re-derived at `57783d47` by the
   spot-check and hold; the after-run revision is the 10:13 worktree, not the branch tip.
6. **Report author date (D6).** The round-89 report commit's author date (09:46:35) predates the
   lane work it cites. Round 90's report commit uses a clean author date (the committer time).

## Corrections carried by round 91 (append-only; the round-89 records above are not rewritten)

The round-90 non-author spot-check (`corpus/lessons/round-90-verifier-spotcheck.md` §8 items 3
and 8) found two append-only defects in this lesson and one in `corpus/QUALITY.md`. Round 91
records the corrections here; the round-89 text above stays byte-unchanged.

1. **Append-only discipline (defect 3, lesson side).** The `frozen-control-numeral` row above was
   **extended in place** (the parenthetical naming `plans/round-89.md` §Frozen-amendment note and
   the §Corrections item 2 pointer was added to the row itself) while this file's round-90 block
   says "the round-89 records above are not rewritten". This block is the named correction: the
   extension is disclosed, and no further in-place edit is made.
2. **Append-only discipline (defect 3, QUALITY side).** `corpus/QUALITY.md` criterion 161 was
   **rewritten in place** (its green-state citation moved from the r89 gate to the r90 gate)
   rather than superseded by a new row. Criterion 164 in `corpus/QUALITY.md` now supersedes 161's
   green-state citation and names this correction.
3. **S224 Gate quote length (defect 8).** The original S224 Gate quote in the round-90 block above
   is **31 words**, over the contract's 25-word ceiling. It is kept verbatim as the original
   evidence; the counted quote is the **17-word** replacement in item 3 of that block ("tokens
   consist of any string of zero or more characters, neither beginning nor ending with ASCII
   whitespace"), which the round-90 scout re-located at the `id=set-of-comma-separated-tokens` dfn
   (2026-11-08, 121,595 B, sha256 `2e9e2cbbe1ed`). The over-length original is marked here, not
   rewritten.
