# w2 seat report — ConnAdjacencySaturation (round 35, tabi lane)

## Verdict: holds — the axis is NOT saturated; KEEP it, and split the claim meter (completeness vs delta-discovery)

Evidence across the three sweeps shows the adjacency *function* still moving — the map grew every
round (10→13→16→17 rows), the completeness leg (unaccounted 0) held 3/3 rounds, round 35 produced a
genuinely new, wave-2-targeted split row (`cdp-bridge-vault-dom-refusal`, kagi SKILL.md:40), and
sibling text churns weekly, so the candidate universe is not closed. What has saturating is the
*discovery meter on a frozen pool*: `newMapped` targets were missed three rounds running (4→3,
3→1, 2→1), yield per candidate fell 5.8% → 1.5% → 0.26%, and all 382 round-35 screens land in
permanent structural classes that cannot convert into rows (same-surface 225, nbns 119,
third-lane 30, no-claim 8). No defect found in the mapping work itself; the counter's predicate
(false at 083c5c64: newMapped 1 < 2) is a meter miss on a closed snapshot.

## Evidence (commands, exit codes, file:line)

Commands (all exit 0, run in the lane checkout at 083c5c6):

```
wc -l .ufo/waves/round-35/baseline/c1-candidates.tsv            → 383
cut -f2 corpus/adjacency-screen-browser.tsv | sort | uniq -c    → 225 same-surface / 119 not-browser-sense / 30 third-lane-report / 8 no-claim-declared (+ header "reason")
awk -F'\t' 'NR>1{n[$7]++} END{for(k in n) print n[k],k}' corpus/adjacency.tsv → 9 split-declared / 4 contested-open / 3 refused-route / 1 ruled (17 data rows)
cut -f2 corpus/adjacency-screen.tsv | sort | uniq -c           → 40 same-surface / 2 not-browser-sense / 1 third-lane-report / 1 no-claim-declared (44 rows)
cut -f2 corpus/adjacency-screen-skill.tsv | sort | uniq -c     → 29 same-surface / 30 third-lane-report / 4 no-claim-declared / 0 not-browser-sense (63 rows)
git log --oneline -1                                          → 083c5c6 round-35: w1 integration (…)
```

Reads (read tool, file:line):
- Frozen claim: `.ufo/waves/round-35/claims.json:33-38` (C1 surface/predicate/target/killRule), `:18` (lowest axis adjacency 8), `:36` `newMapped >= 2`.
- Counter definitions: `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:22-62` (frozen candidate/mapped/screened/newMapped definitions; predicate at `:61-62`).
- Map gate: `scripts/check-adjacency.mjs:44-103` (9 columns, dispositions, ruling refs).
- Decision rule: `SKILL.md:2861-2881`; QUALITY 87-91 `corpus/QUALITY.md:532-590`, 97 `:670-675`, 98-100 `:679-702`.
- Round 33 closure: `corpus/lessons/round-33.md:99-128` (4 admitted → 3 after w2 withdrawal of kake:347; 43→44 screens), SCORECARD.md:1828 (not met, newMapped 3 < 4).
- Round 34 closure: `corpus/lessons/round-34.md:54-77` (62 screens declared: 35/23/3/1), `:104-118` (w2 final: newMapped 1 < 3; two kaidoku rows restored uncounted), SCORECARD.md:1902.
- Round 35 closure: `corpus/lessons/round-35.md:55-68` (382 screens, 1 map row; "Reading the frozen target honestly: newMapped >= 2 needs a second row the integrator would defend; there is none"), integration fact at 083c5c64 (unaccounted 0, newMapped 1, predicate false).
- `.ufo/waves/round-35/w2/ConnAdjacencySaturation/saturation.md` (planning input: verdict, three-sweep table, universe closure, retire/split/keep answer, falsifiable next-round claim, risks).
- Axes contract: `/home/vgpnk/Projects/shokunin/AXES.md:16` (axis definition), `:36-38` (saturates → retire or split, recorded in SCORECARD with reason).

## Deliverables

- `corpus/../.ufo/waves/round-35/w2/ConnAdjacencySaturation/saturation.md` (planning input: verdict, three-sweep table, universe closure, retire/split/keep answer, falsifiable next-round claim, risks).
- This report: `.ufo/waves/round-35/w2/ConnAdjacencySaturation.md`.

Scratch `/fast/scratch/hyaku/tabi-r35/ConnAdjacencySaturation/` created and removed on exit (no scratch files persisted). No lane tracked file, no fleet file, no browser/driver was written/launched by this seat.
