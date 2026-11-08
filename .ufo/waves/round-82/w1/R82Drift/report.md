# R82Drift — C2 control receipts (r82 record-drift counter)

Seat: R82Drift. Counter: `scripts/check-record-drift-r82.mjs` (8 claims), run against a scratch
mirror of the lane at `/fast/scratch/hyaku/tabi-r82/R82Drift/mirror/tabi-shokunin/` (now deleted).
Lane untouched; all outputs in `.ufo/waves/round-82-seats/R82Drift/`.

## Files

| File | Mutation | Exit | mismatches | failed |
|---|---|---|---|---|
| `control-0-baseline.json` | none (mirror as copied) | 0 | 0 | [] |
| `control-1-reversed-correction.json` | lesson `round-82.md` row 6: `23 → 20` directional corrected → `20 → 23` (stale/truth pair fully reversed, both numbers still present) | 0 | 0 | [] |
| `control-2-stale-removed.json` | SCORECARD.md: `(23 words)` → `(20 words)` (one stale statement removed/overwritten) | 1 | 1 | `quote-count-propagation` (`detail: score=false`) |
| `control-3-nonce-swapped.json` | LOG.md: `tabi-r82-l1-5204a0581de5` → `tabi-r82-l1-deadbeef0000` (superseded hex) | 1 | 1 | `r82-identity` |

Each was followed by byte-restore to the copied mirror and a re-run confirming baseline 0 mismatches.

## Verdicts per control

1. **Reversed correction — counter does NOT catch it (exit 0, 0 mismatches).** Proves the counter
   binds only **presence + directional-regex shape**, not direction or truth. The `directional`
   regex `/23.*→.*20|23-word.*20|superseded.*20/i` matches the *correct* sighting in row 6
   (`S223 quote stated as 23 words … the true count is **20 words**`) and row 6b
   (`S223 Gate quote count 20 words`), so flipping the `→` pair leaves every conjunct true
   (`log=q=score=lesson=directional=true`). This confirms the `direction-bound` claim's own
   admission (counter line 93–94: "the counter must refuse a reversed correction … exercised by
   the battery") is load-bearing and NOT discharged by this counter. Attack outcome: **direction
   not bound here; only presence**.
2. **Stale removed — counter binds presence (exit 1, `quote-count-propagation`).** Proves the
   append-only leg: the stale `(23 words)` must still be present in SCORECARD. **Presence bound**;
   the counter does not check that LOG/QUALITY still disagree with the lesson beyond the three
   regex hits.
3. **Nonce swapped — counter binds identity truth (exit 1, `r82-identity`).** Proves the self-drift
   leg compares cited `tabi-r82-l1-<hex>` against `claims.json` nonce suffix: `deadbeef0000` is
   flagged `wrong`. This is a genuine truth binding (r81 routed defect 2's fix), not mere presence —
   it fails on a *wrong* value present, not on a missing one.

## Summary

| Axis | Bound? | Evidence |
|---|---|---|
| Direction (reversed correction refused) | **No** — presence/regex only | Control 1 exit 0 |
| Truth (stated value equals committed value) | **Yes, for identity leg** | Control 3 exit 1 |
| Presence (stale still present) | **Yes** | Control 2 exit 1 |

Net: the counter is a **presence + identity-truth** counter with a **directional-shape** check whose
direction is defeated by multiple co-located true sightings of the pair. Do not claim it proves
direction/truth for the quote-count leg.

Report: .ufo/waves/round-82/w1/R82Drift.md
