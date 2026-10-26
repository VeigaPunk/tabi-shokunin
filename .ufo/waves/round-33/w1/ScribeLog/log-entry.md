<!-- draft: ScribeLog, tabi round 33 w1. Append-only LOG.md skeleton. Placeholders are `<pending measurement>` (after-values) and `<pending ...>` (artifacts that do not exist at the freeze). Strip this comment line on integration. -->

## Round 33 — 2026-10-26 — the sibling-overlap map answers a frozen sweep (adjacency) and the BiDi receipt gate stops admitting forgeries (operability)

Attempt 1. Claims frozen before data at `.ufo/waves/round-33/claims.json` in commit
`e6b0a9074d434ccc307badd312ae7379d1193fea` (baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd`); both counters,
`measure.sh`, the control driver, the 52-line candidate list and every baseline receipt landed in that same freeze
commit — `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` sha256
`da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380`, `c2-bidi-forgery-battery.mjs` sha256
`51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b`, `baseline/controls.mjs` sha256
`2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e`, `measure.sh` sha256
`ca6b830e1c9b685664da7db0ebb30674175c4c95f9fb11f8b2ce75a033784c7e`, with `scripts/check-adjacency.mjs` pinned
inside C1 at sha256 `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` and required to stay
byte-identical at REV (`claims.json:frozenDigests`; the same five digests are the ones
`baseline/measure-at-baseline/provenance-b7d16fb.txt` records). Axes at round start: depth 9, coverage 9,
operability 9, freshness 9, calibration 9, adjacency 8. Lowest non-retired axis adjacency 8 (unique).
Saturation 8 / window 3; stagnation nudge INACTIVE — the round-32 capability row `webdriver-bidi-runtime`
(`SCORECARD.md:1663`, first-working round 32) restarts the window, so round 33 is position 1
(`SCORECARD.md:1694`). The lowest-axis obligation binds, so C1 works adjacency; C2 is the round-32 routed
operability defect (BiDi gate v2), disclosed as an axis move rather than a frontier/capability move.

Controls, scored per claim before any claim data (`.ufo/waves/round-33/baseline/`, `controls-summary.json`; each
capture's `.provenance` names the clone revision and its tree digest, and the control driver is byte-pinned in
`claims.json:frozenDigests` — round-32 routed defect 7):

| Control | Reading | Exit |
|---|---|---|
| c1-J1-do-nothing | candidates 52, mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency clean (rows 10, verified 10) | 1 |
| c1-J2-screen-all | every unaccounted candidate screened `not-browser-sense`, no map row: screened 47, unaccounted 0, newMapped 0 | 1 |
| c1-J3-junk-rows | four split-declared rows on NON-candidate sibling lines; check-adjacency clean on all 14 rows; unaccounted 47, newMapped 0 | 1 |
| c1-J4-mislabel-unnamed | four split-declared rows on kake candidate lines whose quotes name neither side: mapped 9, unaccounted 43, newMapped 0 | 1 |
| c2-J1-do-nothing | honest H0/H1/H2 true at admitted 16, failing 0; forgeriesAccepted 8 (F1–F8); digestLiterals []; selftest exit 0 | 1 |
| c2-J2-reject-all | a gate that exits 1 on every evaluation: forgeriesAccepted 0 but H0/H1/H2 false | 1 |
| c2-J3-whitelist | v1 plus "accept only the honest digests": forgeriesAccepted 0, honest true, digestLiterals 5, selftest exit 3 | 1 |

Readings at the freeze (`.ufo/waves/round-33/baseline/measure-at-baseline/`): `ADJACENCY verdict=clean rows=10
verified=10`, `SELFASSESSMENT verdict=clean … mismatches=0 could_not_evaluate=106 superseded=39`, `SOURCES_GATE
verdict=clean rows=126 tiers=A:111,B:6,C:9 status=queued:15,mined:102,rejected:9 findings=0`, census validate
`file ok`, and 28 of 28 offline gates and self-tests exit 0 (`noharm-at-b7d16fb.txt`); the self-test summary
lines are `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` (exit 0) and `SELFASSESSMENT_SELFTEST
verdict=clean cases=41 passed=41` (exit 0).

C1 adjacency (lowest non-retired axis; no source row, the surface is the lane's own map): the map
`corpus/adjacency.tsv` (round-17, 10 rows, all verified by `scripts/check-adjacency.mjs`) has never been bounded by
a sweep of which sibling province lines it must answer for. The frozen sweep is 52 browser-domain lines in the seven
sibling `PROVINCE.md` files at their frozen pins — kake 42, kagi 4, kaidoku 2, kengaku / kotoba / revenger /
tsukuroi 1 each (`baseline/c1-candidates.tsv`; pins kake `04404859…`, kagi `69b61db4…`, kaidoku `8b9634ed…`,
kengaku `7984fd30…`, kotoba `65a5c7a6…`, revenger `6da884c6…`, tsukuroi `9cc9aa77…`). At the baseline 5 of the 52
are mapped (kake:34, kake:39, kagi:43, kaidoku:53, revenger:5), 0 are screened and 47 are unaccounted. Target:
unaccounted 0 **and** at least 4 new verified map rows that cover a candidate and name the other side (a
contested-open row needs a fleet L0 line `tabi | round-33 | …` naming the sibling — seats draft such lines, only
the L1 files them; a split-declared / refused-route row needs a `sibling_quote` containing `tabi` or a
`tabi_quote` containing the sibling lane) **and** check-adjacency clean. Feasibility disclosed: the counter cannot
judge overlap semantics — four new rows on candidate lines whose quotes name the other side reach newMapped 4
whatever the disposition is worth, and a candidate screened with a wrong reason still counts as accounted; the
semantic guard is wave 2 (one attack per new row and per screen-reason group) and the closure spot-check, not the
counter. Controls J2/J3/J4 show the counter's reading alone is not an overlap judgement.

C2 operability (round-32 routed defect 1): the surface is the receipt leg of `scripts/check-bidi-runtime.mjs`,
v1 at sha256 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`, which accepts all eight
round-32 forgery constructions — F1 golden-splice, F2 duplicate row ids, F3 same transcript path twice, F4 byte
copy at a new path, F5 driver = byte copy of the gate, F6 driver = `export *` re-export of the gate, F7 decorated
`yes (live)` Measured cell, F8 junk `mined` S990 source row — while honest H0 (REV itself), H1 (re-layout of the
two committed transcripts to new paths with the run order swapped) and H2 (the round-32 w2 RerunDriver pair) all
read admitted 16, failing 0. At the baseline F7 is admitted at 15, the other seven at 16. Target: forgeriesAccepted
0 of 8 with H0/H1/H2 still true at admitted 16, the gate's `--selftest` exit 0, and no honest digest (nor a 12-hex
prefix of one) in the gate source. Feasibility disclosed: the battery is finite — a gate can refuse F1–F8 by
construction-specific tells and still admit a smarter forgery (a golden transcript with real-shaped session ids and
distinct bases); wave 2 builds new constructions against v2 and reports survivors as limits, which do not change
the frozen predicate. The `--live` leg is outside this predicate; any live-leg change v2 makes is reported as
no-harm evidence only. Registry rows S127+ opened this round ground v2's session-provenance rule and its live-leg
launch flags (no `--no-sandbox`; bypass the `/usr/bin/chromium` launcher's flags file), and
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` cites them.

Counting commands (counter bytes taken from the freeze commit, `measure.sh <REV> <OUT> <FREEZE>` in a clean clone;
raw outputs under `.ufo/waves/round-33/measure/` before the report):

- C1 — `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev <REV> --json | jq '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}'`
  (the scripted run adds `--repo <clean clone> --fleet /home/vgpnk/Projects/shokunin`).
  Before (freeze tree, `baseline/measure-at-baseline/c1-at-b7d16fb.json`): predicate false, candidates 52, mapped 5,
  screened 0, unaccounted 47, newMapped 0, adjacency `verdict clean, rows 10, verified 10, findings 0`, exit 1.
  After: `<pending measurement>`.
- C2 — `node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev <REV> --json | jq '{predicate,honest,forgeriesAccepted,acceptedForgeries,selftest,digestLiterals}'`.
  Before (`baseline/measure-at-baseline/c2-at-b7d16fb.json`): predicate false, honest `{H0: true, H1: true, H2:
  true}`, forgeriesAccepted 8, acceptedForgeries `[F1…F8]`, selftest exit 0, digestLiterals `[]`, exit 1.
  After: `<pending measurement>`.
- No-harm at REV — the same `measure.sh` run: 28 of 28 offline gates and self-tests exit 0 at the baseline
  (`noharm-at-b7d16fb.txt`), `check-selfassessment` mismatches 0, census exit 0 (126 registry rows), and the six
  prose paths of `claims.json:noHarmRule` append-only (deleted 0). `scripts/check-bidi-runtime.mjs` is the one prior
  file C2 rewrites. At REV: `<pending measurement>`.

Frontier step: SOURCES rows S127+ `<pending: registry 126 → N; each row written only after opening it this round>` —
they ground C2's session-provenance rule and live-leg launch flags; lesson `corpus/lessons/round-33.md` carries
`## Gate` and `## Mistakes` `<pending: the mistake mined is the round-32 claims.json C1 feasibilityDisclosed stated
false as written — routed defect 4, named append-only correction>`, and QUALITY criteria 87+ land with it
`<pending: numbering>`. Routed round-32 defects (`corpus/lessons/round-32-verifier-spotcheck.md` §Routed defects):
(1) gate v2 → C2; (2) calibration counter v4 → **NOT claimed** (`notClaimed`); (3) S125 recheck cadence → curation
(lesson Gate: release-pin receipt entry or a recorded reason for 90d); (4) the round-32 `feasibilityDisclosed`
misstatement → named append-only correction (lesson + SCORECARD), mined as this round's mistake; (5) the wave-2
precision defects (CritNewNumbers 5, CritEntry 10, RevLesson, CritReadmeLog, ConnRoutedLedger 19) → wave-1 errata
scribes disposition each `<pending: errata intake table>`; (6) M9 fix cell → lesson round-33 records it landed
`<pending>`; (7) control provenance → every control of this round is rebuilt by the byte-pinned
`baseline/controls.mjs` from the lane's own baseline commit, and each receipt names the clone commit and tree. The
wave-2 precision errata carried at `corpus/lessons/round-32.md:179-187` are dispositioned by the same wave-1 intake
`<pending>`. Assimilation: none — `claims.json:notClaimed` states the quarantine-first round has not run and is not
started inside this round's two claims.

Waves: w1 (attempt 1, build + first falsifiers) 36 seats — 18 scribe, 5 critic, 4 executor, 3 connector, 2 reviewer,
2 mutation-tester, 1 sentinel, 1 scout (`.ufo/waves/round-33/w1/swarm-registry.json`); w2 (falsify) follows, the L1
holding the planner seat `<pending: w2 seat count and composition>`. Round total `<pending>`; dead seats and each
wave's result are recorded in the round report `<pending>`.

Re-verification result (freshness duty, `AXES.md:14` — every round LOG entry carries one; `claims.json` declares no
freshness claim): `<pending: the held surface re-checked this round with its fetch receipt, or a recorded reason no
re-check was due>`.

Round-33 commit ledger (lane `master`): `b7d16fb8` round-32 verifier spot-check (baseline); `e6b0a907` freeze —
claims, both counters, `measure.sh`, the control driver, the candidate list, the control receipts and the baseline
measurement; the C1 map rows and screen ledger, the C2 gate v2 and its knowledge note, the lesson, QUALITY and the
wave evidence follow and are named in the report `<pending: integration commit ids>`.

Round-33 disposition: `<pending measurement>`.
