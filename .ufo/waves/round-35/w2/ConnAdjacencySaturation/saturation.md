# Adjacency axis saturation — planning input (Tabi lane, round 35 w2)

Seat: ConnAdjacencySaturation. Item: is the adjacency axis saturated for this lane? Evidence:
three sweeps (round 33 sibling PROVINCE.md lines; round 34 sibling lines naming tabi + leads;
round 35 browser ground not naming tabi), the committed screen ledgers, the map, the closure
lessons, and the frozen C1 counter definitions.

## Verdict: KEEP (not saturated as a function; the discovery meter on the frozen pool is near-saturated)

The axis's function — *cross-domain awareness: evidence belonging to another domain reported, not
absorbed* (AXES.md:16) — still fires: round 35 found one genuinely new, wave-2-survivable split
(`cdp-bridge-vault-dom-refusal`), the map grew every round (10→13→16→17 rows), the completeness
leg (unaccounted = 0) has held all three rounds, and sibling text churns weekly, so the candidate
universe is not closed. What has saturating is the **discovery meter on a frozen pool**: the
`newMapped >= N` target has been missed three rounds running (4→3, 3→1, 2→1) while yield per
candidate fell 5.8% → 1.5% → 0.26%, and the screen mix is dominated by permanent structural reasons
that cannot convert into rows. Recommendation: **keep the axis and split the claim meter** — a
completeness leg (unaccounted = 0) plus a delta-discovery leg (newMapped >= 1 on refreshed pins
only) — and arm retirement with a falsifiable trigger (below).

## Evidence — the three sweeps

Counts computed from the committed artifacts (commands in the report; exit 0 everywhere).

| | Round 33 | Round 34 | Round 35 |
|---|---|---|---|
| candidate ground | sibling PROVINCE.md lines | sibling lines naming tabi + r33 leads | browser ground not naming tabi |
| candidates | 52 | 67 (38 + 29) | 383 |
| already mapped at baseline | 5 | 1 | 0 |
| new verified map rows (survived w2) | 3 di target 4 — **not met** | 1 counted (row 16) + 2 restored uncounted kaidoku rows; target 3 — **not met** | 1 (row 18, kagi); target 2 — **not met** |
| screens | 44 | 62 declared / 63 committed | 382 |
| screen mix | same-surface 40, nbns 2, third-lane 1, no-claim 1 | declared: same-surface 35, third-lane 23, no-claim 3, nbns 1; committed now: 29 / 30 / 4 / 0 | same-surface 225, nbns 119, third-lane 30, no-claim 8 |
| map rows | 10 → 13 | 13 → 16 | 16 → 17 |

Sources: round-33 lesson `corpus/lessons/round-33.md:99-128` (§C1 admits/rejects, search log
`:274-282`), SCORECARD.md:1828 (disposition); round-34 lesson `corpus/lessons/round-34.md:54-77`
(screens), `:104-118` (w2 final), SCORECARD.md:1902; round-35 lesson `corpus/lessons/round-35.md:55-68`,
integration facts at 083c5c64 (unaccounted 0, newMapped 1, predicate false), counter
`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:61-62` (frozen predicate).

Interpretation, per screen reason (decision rule `SKILL.md:2861-2881`, QUALITY 91/97):
- **same-surface** (225 in r35): the sibling line restates a surface the map already owns — this is
  map coverage *working*, not a discovery failure; it cannot produce rows by definition (QUALITY 91
  last clause).
- **not-browser-sense** (119): regex noise — the frozen BG list (chromium, cdp, musketeer,
  webbridge, burner chrome …) over-matches app names, paths, processes, themes, gate mechanics.
  Tightening the regex would lower noise but creates no rows.
- **third-lane-report** (30): another lane's census/ruling of other lanes' text — un-mappable by
  design (QUALITY 97).
- **no-claim-declared** (8): the sibling explicitly declines the surface — permanent.
So 382/382 round-35 screens land in classes that cannot convert; the only row-producing input is
*new sibling text*.

## Candidate-universe closure

The three sweeps partition sibling text along the two membership predicates:
- round 33: PROVINCE.md (all lines),
- round 34: SKILL.md/corpus lines that name tabi + the r33 lead set,
- round 35: SKILL.md/corpus lines on browser ground that do not name tabi.
The remaining cell (neither names tabi nor matches browser ground) is out of adjacency scope by
definition. Discovery over a given snapshot is therefore enumerable and now essentially exhausted:
the round-35 w1 boundary scan independently reread the 383 lines and defended no second row
(round-35 lesson `:60-65`), and every w1 chunk seat reported `newMapped 0` for its chunk except the
single kagi row (AdjKagi1, AdjKagi2-4, AdjKaidoku1-9 receipts). The snapshot is closed; only
sibling churn reopens it.

## AXES.md answer — retire / split / keep

- **Retire: no.** Wrong-fit would require the map to be complete for all sources *and* static.
  Counter-evidence: sibling lanes committed new corpus text within this round (kaidoku r10/r18
  files, tsukuroi v2 files, kagi knowledge entries are days old); two contested-open surfaces
  (musketeer lease, cdp-live-target-census) remain unmapped pending fleet rulings; the round-35
  sweep still surfaced a real new split. Retiring would delete a live obligation, not a dead one.
- **Split: defensible, but as a meter split, not an axis split.** The axis bundles two objectives
  with different signals: completeness (unaccounted = 0 — met 3/3 rounds) and discovery (newMapped
  bars — missed 3/3 rounds). A sub-axis split would let discovery carry an honest bar (e.g. yield
  per delta candidate) while completeness keeps the maintenance function. AXES.md:36-38 allows
  splitting with reason; if the lane prefers, record **adjacency-completeness** and
  **adjacency-discovery** as sub-axes in SCORECARD. The claim machinery changes little: the v3
  counter already reports both legs.
- **Keep: recommended.** Keep one axis; change the claim shape (next round, below). The axis is
  still the lowest (8), still obligated, still movable.

## What a next-round claim can still move (falsifiable)

Proposed C1 shape for round 36:
> At pins refreshed to the round-36 snapshot (same machinery, updated `c1-pins.json`), unaccounted
> = 0 AND every delta candidate — sibling lines added/changed since the round-35 pins — is mapped or
> screened with a closed reason AND newMapped >= 1 among delta candidates.

- It moves the **completeness** leg against churn (the freshness-flavoured half of adjacency): a
  measure that sibling text edited after the pins is still accounted for.
- It moves the **discovery** leg on genuinely new text: one surviving new row per delta pool is an
  honest, reachable bar (the r35 pool itself produced one).
- Falsifiable retirement trigger: if two consecutive rounds at refreshed pins show (a) zero delta
  candidates, or (b) newMapped = 0 with every delta screened and no reclassification, the axis is
  genuinely saturated — then retire it and record the reason in SCORECARD per AXES.md. Also: if a
  next round re-runs the identical 383-line pool at the *same* pins, expected newMapped = 0; any
  nonzero read falsifies this report's "snapshot closed" claim (it would mean a mappable line was
  missed by the w1 chunks — an integration defect, not saturation).

## Notes / risks for the L1

1. The round-34 screen ledger as committed disagrees with the closure lesson: lesson says 62 rows
   (same-surface 35, third-lane 23, no-claim 3, nbns 1); the file today holds 63 data rows
   (29/30/4/0). Reconcile before citing round-34 screen mix in any future claim.
2. C1's frozen predicate failure (`newMapped >= 2` vs 1) is a meter miss, not an axis death read
   the lesson's own honesty reading (round-35 lesson `:66-68`): "with one possible exception,
   already answered by the existing sixteen rows" — that is exactly the near-saturation signal, not
   a zero.
3. The two contested-open rows cannot be moved by sweeps; a fleet ruling (l0-questions 62/65) is a
   separate, still-open way to progress adjacency.
4. If the meter is split, update the SCORECARD planned row (append-only correction) — the frozen
   round-35 claims are untouched.
