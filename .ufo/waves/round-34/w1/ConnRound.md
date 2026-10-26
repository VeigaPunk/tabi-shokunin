# ConnRound — round 34 wave 1 (data-walk and cross-claim check)

**Verdict.** The two claims are causally separable — C1 touches only
`corpus/adjacency.tsv`, the new `corpus/adjacency-screen-skill.tsv` and a new
`SKILL.md` declaration section; C2 touches only `scripts/check-bidi-runtime.mjs`
(self-test cases + fixture-builder options) and new SOURCES rows S130+ — the two
frozen counters read disjoint file sets, so either claim verifies with the other
unlanded (the only shared files, SKILL.md/SCORECARD/LOG, are L1-integrated after
measurement and read by neither counter). Both claims share one structural
weakness: each "new declaration / new case" guard is a presence-and-newness text
check that cannot judge semantics (C1 cannot tell a real overlap from a junk
declaration — its own J3/J4/J5 controls prove the letter passes; C2 counts any
exit-3 `CASE FAIL` as a kill and cannot attribute the failure to the mutated rule),
and both claims explicitly delegate that judgment to wave 2, which is exactly what
the inventory below supplies. One routed defect is unassigned: the round-33
spot-check §5 sub-item **CritScreenCrawlerSplit kake:411 note** appears in no
round-34 item, carried list, or priorClosure detail (all other seven routed defects
map cleanly). Deliverable: `ConnRound/w2-items.md`, 48 wave-2 attack items
(required ≥ 32): 6 per new map row, 18 per screen-reason group per sibling, 13 per
kill case, 3 new-source-row slots, 8 per gate/counter.

## Evidence (commands, exit codes, file:line)

All commands exited 0; no network fetches, no tool installs, no scratch dir
created (one `/tmp` file < 50 MB created and removed), no writes to lane tracked
files, no subagent dispatch, no browser started.

- `read …/round-34/claims.json` — priorClosure at `claims.json:9`; C1 surface/
  controls/feasibility at `:29-47`; C2 at `:49-66`; noHarmRule at `:75`.
- `read …/baseline/c1-candidates.tsv` (67 rows), `c1-pins.json` (21 sibling pins),
  `controls-summary.json`, `measure-at-baseline/` (9 receipt files).
- `wc -l < …/baseline/c1-candidates.tsv` → 67. `awk -F'\t' '{split($1,a,"@");
  l=a[1]; print l,$2}' … | sort | uniq -c` → A 38 (kake 7, kotoba 11, kumitate 5,
  mori 8, tameshi 5, tsukuroi 2), B 29 (kaidoku 9, kagi 4, kake 6, kama 4,
  kasegi 3, kotoba 2, chousa 1); A 38 / B 29 confirmed by
  `awk -F'\t' '$2=="A"{n++} END{print n}'` → 38 and `…"B"…` → 29.
- `wc -l < …/round-33/w1/ConnSiblingScan/leads.tsv` → 42 (header + 41 leads).
- `grep -oE '^\| S[0-9]+' corpus/SOURCES.md | sort -V | tail -3` → S127 S128 S129;
  `git show 59f1b47:corpus/SOURCES.md | grep -oE '^\| S1[3-9][0-9]'` → empty
  (no S130+ rows exist at freeze or in the worktree).
- `git rev-parse --short HEAD` → `59f1b47` (freeze); `git log --oneline -3` →
  59f1b47 / 15dfacc / 6f4053d; `git diff --numstat 15dfacc… 59f1b47…` → added-only
  (deleted 0 across the freeze).
- C1 counter `c1-adjacency-sweep-v2.mjs`: pins `:73-94`; candidates (set A regex,
  set B lead reanchor) `:122-164`; evaluate (mapped-by-text, screened ledger checks,
  newMapped declaration clause) `:207-297`; frozen adj-gate sha `:65`.
- C2 counter `c2-gate-mutants.mjs`: MUTANTS `:52-173` (20 single-point mutants);
  evaluate (pristine/neutral/decoy/twin/mutant/battery) `:201-244`; known residual
  `:35-37`.
- Gate `scripts/check-bidi-runtime.mjs`: CASES `:972-1017`; fixture-builder
  `:1019-1033`; runSelftest runner `:1035-1129` (exit 3 with `CASE FAIL`).
- `scripts/check-adjacency.mjs` header `:44-170` (9 columns, dispositions, ruling
  refs, l0 rules, findings vocabulary).
- Round-33 `MutGateV2.md` results table `:35-56` (survivors M01 M03 M04 M05 M06
  M07 M08 M09 M10 M16 M18 M19; killed M01b M02 M11-M15 M17).
- Round-33 spot-check §Routed defects at
  `corpus/lessons/round-33-verifier-spotcheck.md:153-170`.

## Findings

### 1. Causal separability — independent (no shared editable surface at verification time)

- C1 deliverable: `corpus/adjacency.tsv` (new rows), `corpus/adjacency-screen-skill.tsv`
  (new ledger), `SKILL.md` (`## Round 34 — sibling-overlap declarations` section).
  C1 counter reads: lane at REV (adjacency.tsv, screen ledger, SKILL.md,
  PROVINCE.md, check-adjacency.mjs), lane at BASELINE (leads.tsv), sibling repos at
  pins (`--fleet`, read-only).
- C2 deliverable: `scripts/check-bidi-runtime.mjs` (added self-test cases /
  fixture-builder options) plus SOURCES rows S130+ (sourcing). C2 counter reads:
  gate blob at REV, battery at e6b0a907, a scratch clone at REV.
- Intersection: none. Neither counter reads SKILL.md/SCORECARD/LOG (L1 files,
  written after measurement). Both must be landed before `measure.sh` runs both, but
  either predicate is computable with the other claim unlanded.
- Hygiene (enforces the separation): C1 must not touch `scripts/check-bidi-runtime.mjs`
  or `corpus/SOURCES.md` (would perturb C2's surface and the no-harm byte checks);
  C2 must not touch `corpus/adjacency*.tsv` or `SKILL.md`. Both additions must stay
  append-only under noHarmRule (`claims.json:75`; numstat deleted 0 for SKILL.md,
  SOURCES.md, adjacency.tsv). Residual coupling is only L1-integrational: if wave-1
  ScoutAssimilation also appends to SKILL.md/SOURCES.md, merge order is L1's — not a
  verification dependency.

### 2. Cross-claim weakness — shared pattern (presence/newness guards, semantics-free)

- Both guards are letter-checks: C1's "new declaration" = a tabi line absent at
  baseline that contains a quote naming the sibling (counter `:270-279`); C2's "new
  case" = any selftest exit 3 with a `CASE FAIL` line (counter `:27-29`). Neither
  can judge whether the declaration/case is true, substantive, or attributable.
- C1's own controls prove the letter passes without substance: J3 (junk
  non-candidate rows: 3 of 4 verify), J4 (existing tabi lines + split-declared:
  newMapped 0), J5 (unnamed sibling side: newMapped 0) — `claims.json:43-45`; the
  counter's feasibilityDisclosed states it "cannot judge overlap semantics" and
  delegates to wave 2 (`claims.json:47`).
- C2 discloses the same for itself: the counter's known residual (a self-test that
  reads its own source and checks a whitespace-normalised find text passes every
  probe; the guard is the wave-2 code read) — `c2-gate-mutants.mjs:35-37`. The
  generic form of the weakness: a case that fails on global state unrelated to the
  mutated rule still registers as a kill.
- Recycling blind spots: C1's `isNew` compares per-file line sets (`:267-268`) — a
  declaration moved verbatim from another tabi file still counts as new in the target
  file; C2 has no newness check at all (the counter never verifies cases are novel —
  L1/wave-2 review does).
- Parallel breadth minima (±3 rows; 20/20 killed) are satisfiable without depth, and
  both claims disclose boundary infeasibility in advance (M04/M05 mutual redundancy —
  `MutGateV2.md:64`; the kotoba split ad "never reached tabi's scope" — candidate
  tsv row 11 and `claims.json:47`). Failure shape to protect: "target missed, not
  narrowed" (honest) vs "symptom solved" (defect).

### 3. Routed defects — seven mapped, one unassigned

| spot-check item (round-33-verifier-spotcheck.md:153-170) | round-34 assignment | status |
|---|---|---|
| 1 adjacency carried claim | → C1 (claims.json:9(1)) | assigned |
| 2 operability battery v2 | → C2 survivor half (20 mutants; M10 included); randomised-subject battery + CritForgeV2B/C remain limits, not claimed | assigned |
| 3 calibration counter v4 | → notClaimed (intentional) | assigned |
| 4 integration hygiene | → L1 rule (check-selfassessment before each integration commit; QUALITY criterion drafted) | assigned |
| 5 ReopenS128 locators / CritScreenOthers relabel / CritErrataLanded lows / 404 receipts-by-body | → wave-1 errata intake (carried; 404 receipts via QUALITY criteria) | assigned |
| 6 S125 cadence | → curation (carried) | assigned |
| 7 M3 residual | → this round's controls read sibling pins from baseline/c1-pins.json (exists, 21 pins), never branch heads (claims.json:9(7)) | assigned |
| **5 sub-item: CritScreenCrawlerSplit kake:411 note** | **named in no round-34 item, no carried list, no priorClosure detail** | **unassigned** |

Wave-2 scope must therefore still cover the kake 396/422/440 relabel (CritScreenOthers)
AND the distinct kake:411 note (CritScreenCrawlerSplit), and verify the relabel does
not absorb 411.

### 4. Data-walk grounding (§ the 67 candidates)

- Candidate counts per lane/set (exact; no header row in the TSV): see Evidence.
- Baseline state: mapped 1 (kama listener-census.md:355, row 11), screened 0,
  unaccounted 66 — matches `claims.json:36`.
- Set-B anchors: leads.tsv rows carry their own commits; for kaidoku
  (fa6a8a3f vs pin 0b15c8b2) and kasegi (9a10b02f vs pin d65d823e) these differ
  from the round-34 pins, so screen rows must use the exact frozen candidate key
  (W-G2, W-S17 in the inventory).
- SOURCES: max S129 at freeze; S130+ do not exist yet — C2's sourcing rows are
  genuinely opened this round (W-N1..W-N3).

## Deliverables

- Report: `.ufo/waves/round-34/w1/ConnRound.md` (this file)
- Wave-2 attack inventory: `.ufo/waves/round-34/w1/ConnRound/w2-items.md`
  (48 items; §1 new map rows, §2 screen-reason groups per sibling, §3 kill cases,
  §4 new source rows, §5 gates/counters)

## Honesty notes

- No unrun check is claimed; every number above comes from the listed commands
  (all exit 0) or file reads.
- No tools installed/upgraded (nothing was needed); no network fetch performed; no
  clone created (reads only); no `/tmp` residue (temp file removed); no lane file
  written by this seat.
