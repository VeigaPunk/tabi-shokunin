# RevCorrection1 — append-only correction drafts, routed defects 1+2 (round 22)

**Verdict: AGREE on both defects.** Every figure re-derived from committed bytes at `a89f193`: whole-payload refusals **24** = W2 13 + W2b 11 (filed "23" superseded); W2b `maxLanes: 65` > policy `waveMaxLanes: 64`; round total **129** > ≤128. Exact append texts for LOG.md, SCORECARD.md and `corpus/lessons/round-23.md` §Corrections are below; each names the superseded figure and leaves filed bytes untouched.

## Findings

- `ls .ufo/waves/round-22/w2-cap-refusal-*.json|wc -l` → **13** (attempts 1–9,11–14); `ls w2b-cap-refusal-*.json|wc -l` → **11** (attempts 1–11; spawn attempt 12 per `w2b-spawn-result.json:"attempt":12`). 13+11=24.
- Every receipt holds one `Background job limit reached (100)` refusal of the whole payload: `grep -c` → 1/file, 24 files; per-file `grep -o …|wc -l` → 64 (W2) / 65 (W2b); seat-refusals 13×64+11×65=1547.
- Attempt-10 note verified: `w2-cap-refusal-11.json` `note` = "attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel died 16:10:51Z before any result; no seat transcripts exist, so 0 seats spent". No `w2-*10*` file exists.
- Counting hazard (why the correct figure needs the canonical glob): `grep -l … w2-*.json|wc -l` → **24** files, but that set mixes 13 canonical receipts with byte-identical duplicate envelopes (`w2-spawn-result.json`==`w2-cap-refusal-01.json` `.text`; `w2-attemptNN-result`==`w2-cap-refusal-NN` `.text` verified for 02,11 incl. identical `at`) plus the acquire-ledger `w2-capacity-events.json` (one `wave-slot.sh acquire` refusal, not a payload refusal).
- A second wrong figure is committed: `grep -rln '14 whole-payload' ` → 9 files (`w2b-spec.json`, `w2b-validation.json`, `w2b-spawn-result.json`, 5 `w2b/*.md` seat reports) — W2 = 13, not 14. Frozen bytes; corrections name, never rewrite.
- `w2b-spec.json maxLanes:65` > `scripts/hyaku/ufo-wave-policy.json` `.sighting.dispatch.swarm.waveMaxLanes:64`; round cap 128 exists only as prose (`scripts/hyaku/lane-addendum.md:42,52`). `w2b-validation.json.policy.waveMaxLanes:100` — the validator graded 65 against a `[64,100]` band, not the policy band; recorded, not cured.
- Round total 129 (W1 64 + W2 0 + W2b 65) is correctly disclosed at `SCORECARD.md:1113`, `corpus/lessons/round-22.md:140`, fleet `.ufo/reports/round-22/tabi.md:191` — but the filed rationale ("validated after W2's 64-seat payload had already been authorized") never names the wave-band violation. Filed "23" sites: `LOG.md:1584`, `SCORECARD.md:1111`, `corpus/lessons/round-22.md:130`, fleet report `:19,:180` (fleet file is outside lane append-only scope; the lane corrections name it).

## Draft — `LOG.md` append (inside the round-23 entry)

```
Round-22 corrections landed this round (routed by the non-author spot-check,
`corpus/lessons/round-22-verifier-spotcheck.md` §Routed defects 1–2): (a) the
"23 whole-payload" refusals figure at `LOG.md:1584` is superseded by **24**
(W2 13 + W2b 11 whole-payload refusals of 64 and 65 seats; W2 attempt 10 is
unrecorded — slot granted 16:10:37Z, kernel dead 16:10:51Z, 0 seats spent, per
`w2-cap-refusal-11.json` `note`). The "14" figure inside `w2b-spec.json` and eight
other round-22 wave files is likewise superseded by 13. Counted over the
canonical `*-cap-refusal-*.json` series only; duplicate result envelopes and the
slot-acquire ledger carry the same payload text and are not events. (b) W2b was
validated at 65 seats > the v1 policy `waveMaxLanes` 64 and the round total 129
> the ≤128 cap; prior authorization does not cure either breach and a degenerate
(0-spawned) wave does not buy a larger replacement — replacement waves stay ≤64
and the round total ≤128. No axis credit; status-neutral record correction only.
```

## Draft — `SCORECARD.md` append (tail; filed rows unchanged)

```
Corrections (append-only): `SCORECARD.md:1111` "23 whole-payload cap refusals"
is superseded by 24 = W2 13 (`w2-cap-refusal-01..14` minus attempt 10, which has
no record) + W2b 11 (`w2b-cap-refusal-01..11`); `grep -c` returns 1 per file.
`SCORECARD.md:1113` is retained and clarified: the 129 > ≤128 overage is a
second breach — W2b's 65 seats also exceeded policy `waveMaxLanes` 64
(`ufo-wave-policy.json`), admitted only under the validator's recorded 100 lane
band. Rule: replacement wave ≤64, round total ≤128; a 0-spawned predecessor does
not widen the band.
```

## Draft — `corpus/lessons/round-23.md` `## Corrections` rows

```
- Refusal arithmetic (routed defect 1): `LOG.md:1584`, `SCORECARD.md:1111`,
  `corpus/lessons/round-22.md:130` and fleet `.ufo/reports/round-22/tabi.md:19,:180`
  "23 whole-payload" → **24** = 13 W2 (attempts 1–9, 11–14; attempt 10 unrecorded —
  `w2-cap-refusal-11.json` `note`) + 11 W2b (attempts 1–11, spawn at 12). Re-run:
  `ls .ufo/waves/round-22/w2-cap-refusal-*.json|wc -l` → 13;
  `ls .ufo/waves/round-22/w2b-cap-refusal-*.json|wc -l` → 11. The "14" text inside
  `w2b-spec.json` et al. is a second superseded figure (13). Detection rule: count
  `*-cap-refusal-*.json` filenames only; identical refusal text in `w2-spawn-result.json`
  and `w2-attemptNN-result.json` is byte-equal envelope duplication, not extra events.
- Wave/round caps (routed defect 2): W2b `maxLanes: 65` > policy `waveMaxLanes: 64`;
  round total 129 > ≤128 (`lane-addendum.md:42,52`; the validator admitted 65 under a
  recorded `waveMaxLanes: 100` band — mechanism, not a cure). Filed docs disclosed only
  the round-total half; this correction names the wave-band half and binds: replacement
  wave ≤64, round ≤128, a degenerate 0-spawned wave buys no larger replacement.
```
