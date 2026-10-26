<!-- draft: ScribeLog, tabi round 33 w1. SCORECARD.md append-only section. Placeholders: `<pending measurement>` = after-value; `<pending …>` = artifact that does not exist at the freeze. Strip this comment line on integration. -->

## Round 33 — declared claims (frozen before data)

Baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd`; claims, both counters, `measure.sh`, the control driver, the
52-line candidate list and every baseline receipt frozen in `e6b0a9074d434ccc307badd312ae7379d1193fea` before any
claim data (`.ufo/waves/round-33/claims.json`, receipts `.ufo/waves/round-33/baseline/`). Frozen counter bytes:
`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` sha256
`da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380`, `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`
sha256 `51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b`, `.ufo/waves/round-33/baseline/controls.mjs`
sha256 `2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e`,
`.ufo/waves/round-33/measure.sh` sha256 `ca6b830e1c9b685664da7db0ebb30674175c4c95f9fb11f8b2ce75a033784c7e`;
`scripts/check-adjacency.mjs` is pinned inside C1 at sha256
`4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` and must not move at REV. Every
after-measurement runs `.ufo/waves/round-33/measure.sh <REV> <OUT> <FREEZE>` in a clean clone of the named lane
revision, the two counters taken from the FREEZE commit rather than the worktree (`claims.json:measurementRule`).

Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. Lowest non-retired
axis adjacency 8 (unique). Saturation 8 / window 3; stagnation nudge inactive — the round-32 capability row
`webdriver-bidi-runtime` (`SCORECARD.md:1663`, first-working round 32) restarts the window, so round 33 is position 1
(`SCORECARD.md:1694`). The lowest-axis obligation binds: C1 works adjacency, and C2 is the round-32 routed
operability defect (BiDi gate v2), not a frontier/capability move. No capability row enters the table this round.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 adjacency (lowest non-retired axis; surface `corpus/adjacency.tsv`, round-17 map of 10 verified rows, plus the new screen ledger `corpus/adjacency-screen.tsv`) | `c1-adjacency-sweep.mjs` + `jq` projection (verbatim below) | candidates 52, mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency clean (rows 10, verified 10), predicate false, exit 1 (`baseline/measure-at-baseline/c1-at-b7d16fb.json`) | unaccounted 0 AND newMapped >= 4 AND check-adjacency clean at REV |
| C2 operability (round-32 routed defect 1: BiDi gate v2) | `c2-bidi-forgery-battery.mjs` + `jq` projection (verbatim below) | forgeriesAccepted 8 of 8 (F1–F8), honest H0/H1/H2 true at admitted 16 and failing 0, digestLiterals [], gate self-check exit 0, predicate false, exit 1 (`baseline/measure-at-baseline/c2-at-b7d16fb.json`) | forgeriesAccepted 0 with H0/H1/H2 true at admitted 16 and failing 0, gate self-check exit 0, digestLiterals [] |

Counting commands, verbatim (both take a 40-hex `--rev`; the scripted measurement adds
`--repo <clean clone> --fleet /home/vgpnk/Projects/shokunin` for C1 and `--repo <clean clone>` for C2):

```
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev <REV> --json | jq '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}'
node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev <REV> --json | jq '{predicate,honest,forgeriesAccepted,acceptedForgeries,selftest,digestLiterals}'
```

Command that shows each surface unmoved at the baseline: the same two counters at `b7d16fb8` read unaccounted 47 /
newMapped 0 (`.ufo/waves/round-33/baseline/c1-J1-do-nothing.json`) and forgeriesAccepted 8 of 8
(`.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`), both exit 1, while `ADJACENCY verdict=clean rows=10
verified=10` already holds — the map's own gate is green with 47 of 52 sibling browser-domain lines unaccounted.

Controls, scored per claim before any claim data (`.ufo/waves/round-33/baseline/controls-summary.json`; seven controls,
all exit 1, each capture's `.provenance` naming its clone revision and tree, the driver byte-pinned in
`claims.json:frozenDigests`): c1-J2-screen-all — every unaccounted candidate screened `not-browser-sense` reaches
unaccounted 0 with newMapped 0; c1-J3-junk-rows — four split-declared rows on NON-candidate sibling lines leave
newMapped 0 although check-adjacency verifies all 14 rows, so quote verification is not overlap; c1-J4-mislabel-unnamed
— four split-declared rows on kake candidate lines whose quotes name neither side give mapped 9 and newMapped 0;
c2-J2-reject-all — a gate exiting 1 on every evaluation gives forgeriesAccepted 0 with H0/H1/H2 false;
c2-J3-whitelist — v1 plus an honest-digest whitelist gives forgeriesAccepted 0 and honest true but five digest literals
and a nonzero gate self-check.

Feasibility disclosed, in the frozen claim's own terms. C1: the counter cannot judge overlap semantics — four new rows
on candidate lines whose quotes name the other side reach newMapped 4 whatever their disposition is worth, and a
candidate screened with a wrong reason still counts as accounted; the semantic guard is wave 2 (one attack per new row
and per screen-reason group) and the closure spot-check. A contested-open row additionally needs a fleet L0 line
`tabi | round-33 | …` naming the sibling — seats draft such lines, only the L1 files them — and a split-declared or
refused-route row needs a `sibling_quote` containing `tabi` or a `tabi_quote` containing the sibling lane. C2: the
battery is finite — a gate can refuse F1–F8 by construction-specific tells and still admit a smarter forgery (a golden
transcript with real-shaped session ids and distinct bases); wave 2 builds new constructions against v2 and reports
survivors as limits, which do not change the frozen predicate, and the `--live` leg is outside the predicate (any
live-leg change v2 makes is no-harm evidence only).

Falsifiers on record. C1 is falsified by a candidate that is a real overlap and is screened, by a new row whose quote
does not name the other side (the counter refuses it), or by a row on a non-candidate (not counted). C2 is falsified by
any of F1–F8 still accepted, by an honest receipt refused, by a digest literal in the gate source, or by a nonzero gate
self-check.

Sources and routing: `claims.json` declares no source row for either claim's predicate; the frontier step opens SOURCES
rows S127+ this round (registry 126 at the baseline, `baseline/census-start.txt`: `SOURCES_GATE verdict=clean rows=126
tiers=A:111,B:6,C:9 findings=0`) to ground C2's session-provenance rule and its live-leg launch flags, and
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` cites them `<pending: row ids>`. Routed round-32 defects:
`corpus/lessons/round-32-verifier-spotcheck.md` §Routed defects 1 → C2, 2 → not claimed (`notClaimed`: calibration
counter v4), 3 → curation (S125 recheck cadence), 4 → named append-only correction mined as this round's mistake, 5 →
wave-1 errata intake, 6 → lesson round-33 records the M9 fix landed, 7 → the byte-pinned control driver plus
commit-and-tree provenance on every control receipt. The wave-2 precision errata at `corpus/lessons/round-32.md:179-187`
are dispositioned by the same intake `<pending: errata table>`. Assimilation: none (`claims.json:notClaimed`).

No-harm clause for the disposition (`claims.json:noHarmRule`): at REV every offline gate and self-check of
`.ufo/waves/round-33/measure.sh` that exits 0 at the baseline (28 of 28, `baseline/measure-at-baseline/noharm-at-b7d16fb.txt`)
still exits 0; `check-selfassessment` mismatches stay 0; census exits 0; and every prior-round prose byte of `SKILL.md`,
`SCORECARD.md`, `LOG.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md` is append-only (deleted 0 from
the baseline). `scripts/check-bidi-runtime.mjs` is the one prior file C2 rewrites.

Round-33 disposition: `<pending measurement>`.
