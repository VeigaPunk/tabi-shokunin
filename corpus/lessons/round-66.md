# Round 66 — lesson

Round 66 (attempt 1, Linux host). Two claims, frozen at `b1ecd665508b85b9f94ab155c4cd04bce3e51fee`
after the pre-freeze controls (`4bea87d50950e5030124b14302c53124c4308fc9`) and before any scored
receipt. Base `2816adb359a50c2fd83fa975e39f0650aa189984`. Claim pins: `.ufo/waves/round-66/claims.json`.
Attack evidence: the wave `w1` (13 seats), 5 of 13 attack seats (reviewer 2, critic 1, mutation-tester 2).

- **C1 — adjacency (declared; lowest owned axis, score 8).** Rebind the r62 sibling ledger to the
  live-head snapshot; frozen meter v22 must reach predicate true with zero findings.
  Result: verified on the frozen predicate (40 findings → 0; mechanical-only control stays at 1).
  Axis attribution contested: `R66Critic` F4 and the r65 critic read the move as freshness.
- **C2 — calibration (score 9).** A v3 gate, predicate byte-identical to frozen v2, with two relative-input
  selftest cases; each single-base mutant must go red. Result: verified on the frozen predicate
  (M5a/M5b survive v2 at 12/12 clean → killed at 13/14 red on v3; M5c/M5d also killed).

## Gate

Opened 2026-11-05. Located evidence is named per row. Spot-check: pending (non-author closure).

| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S171 Node.js path API, `path.join` | Admit, tier A, `docs`, scope "path.join segment joining and normalisation (join adds no cwd prefix)" | URL https://nodejs.org/docs/latest-v24.x/api/path.html (canonical https://nodejs.org/api/path.html); accessed 2026-11-05 (`date -I`); anchor `#pathjoinpaths`, first body paragraph; quote (21 words, located at `.ufo/waves/round-66/w1/R66Scout/sources/path-docs.txt`, sha256 `41b69aea…a7d4a4f`, 22,212 B): "The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path." Flip: a claim that a relative input resolves against cwd, or that join refuses `..` escapes, is not grounded by this row (join normalises `..`: see Limits). |
| S157 Node path API (`path.isAbsolute`, `path.delimiter`) | Not re-cited this round | Opened 2026-11-01 in round 47. Not part of this round's gate. |
| Repository-internal fixtures for C1 and C2 | No external row | C1 and C2 predicates are own-work; the gate's own code and committed receipts are the source (`CORPUS` `own-work`). |
| The v2 gate's relative-path comment (`check-receipt-provenance-v2.mjs` lines 9-10) | Reject as a source | The gate's own header is a claim about itself, not evidence. Flip: an external spec for matrix-input resolution. |

## Claims — measured

### C1 — adjacency (ledger currency at live heads)

| Input | Command (argv in `claims.json`) | Predicate | findingCount |
|---|---|---|---|
| r62 ledger, live heads (do-nothing) | `.ufo/waves/round-66/scored/c1-before-r62.json` (exit 1) | false | 40 |
| mechanical-only rebind | `.ufo/waves/round-66/scored/c1-mechanical.json` (exit 1) | false | 1 (`delta-quote-not-whole-line` kake-shokunin:SKILL.md:1358) |
| adjudicated rebind | `.ufo/waves/round-66/scored/c1-after.json` (exit 0) | true | 0 |

Disposition changes r62 → adjudicated: 0 (independently counted by the L1 and by Reviewer). Quote changes: 1
(kake SKILL.md:1358, the whole head line at `d838e744`, disposition kept, reason in `c1/adjudication.md`).
Lane rows changed: 21 (provenance columns). Audit notes changed: 1 (kumitate SCORECARD.md `:1885` → `:1898`).

Verdict on the frozen predicate: **verified** (admission conditions (a) and (c) met; (b) met).
Verdict on the axis: **contested**. `R66Critic` F1/F4: a mechanical copy of the whole residue line, with no adjudication,
reaches the same green. `R66MutTester2`: the meter's disposition check is vocabulary-only; 149 of 149 in-vocabulary
flips survive. Neither result shows adjacency content improved. Recorded as dissent; ruling requested (L0).

### C2 — calibration (relative matrix-input binding)

| Gate / mutant | Selftest (committed receipt) | Exit |
|---|---|---|
| v2 frozen, unmutated | 12/12 clean (`scored/c2-v2-selftest.txt`) | 0 |
| v2 with M5a predicate (before) | 12/12 clean (`controls/mutants/M5a-drop-repo-base.selftest.txt`) | 0 (survives) |
| v2 with M5b predicate (before) | 12/12 clean (`controls/mutants/M5b-drop-matrix-dir-base.selftest.txt`) | 0 (survives) |
| v3 unmutated (after) | 14/14 clean (`scored/c2-v3-selftest.txt`) | 0 |
| v3 M5a | red 13/14 (`scored/c2-M5a-drop-repo-base.txt`) | 1 (killed) |
| v3 M5b | red 13/14 (`scored/c2-M5b-drop-matrix-dir-base.txt`) | 1 (killed) |
| v3 M5c (cwd base) | red 13/14 (`scored/c2-M5c-cwd-not-repo.txt`) | 1 (killed) |
| v3 M5d (absolute only) | red 12/14 (`scored/c2-M5d-absolute-only.txt`) | 1 (killed) |

Predicate-code identity: `diff v2 v3` is two added lines inside the selftest array (`.ufo/waves/round-66/c2/v2-v3.diff`;
`R66Reviewer2` F-1, F-3, F-4).

Verdict on the frozen predicate: **verified**.

## Mistakes

Each row: class · evidence · captured-by · fix. A fix counts only with its red state shown.

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `number-drift` (round 65, routed D1) | `.ufo/waves/round-65/w1/R65Executor1/selftest.stdout` reports `"cases": 46`; the r65 report and LOG say 47; the live v22 selftest at `4bea87d5`-era HEAD reports 47/47 (`.ufo/waves/round-66/controls/v22-selftest-r66.json`). | none | Fresh selftest stdout captured and committed. Red state: committed 46 ≠ claimed 47. Green state: 47/47. The r65 file is not rewritten; the correction is this entry (errata below). |
| `scope` (own, v2 relative-input branch untested) | v2 selftest has 12 cases and no relative positive case; 27 of 33 matrix files under `round-65/`/`round-66/` name a relative input (`R66Critic` F9). Red state: M5a and M5b clean 12/12 (`controls/mutants/*.selftest.txt`). | none | v3 adds the two relative cases. Green state: each mutant red 13/14 (`scored/c2-*.txt`). |
| `vacuous` (kill evidence stale, own) | `R66MutTester1.md` reported all four relative mutants surviving (exit 0) with "cases=12" because it read v3 before R66Executor2 added its two cases. Its table is superseded. | none | L1 re-measured on the final committed v3 bytes (`scored/c2-*.txt`): the survivor table does not stand. Red state: 12-case table; green state: 14-case kills. |
| `stale-premise` (own, claim sourcing) | The round's draft said C2 "rests on the S-next row". `R66Critic` F8: the row grounds `path.join` semantics only, not the kill. | none | Gate and knowledge note state the join semantics as the only sourced fact; the kill rests on the executed fixtures. |
| `scope` (axis label, own) | The C1 move is a ledger currency rebind; `R66Critic` F4 reads it as freshness, and the r65 critic read the same surface as calibration. The round declared adjacency. | none | Kept as dissent, not re-declared after freeze. Ruling requested. QUALITY criterion 121 records the rule for next rounds. |
| `vacuous` (meter, disposition blind) | `R66MutTester2.md` sweep: 298 flips over 149 line rows, all exit 0 or 1; 149 of 149 in-vocabulary flips survive. Only out-of-vocabulary values are refused. | none | Recorded as a meter limit; QUALITY criterion 122. No instrument repair in this round (routed). |

## Errata — round 65

- Round 65's report and LOG state the v22 selftest is 47/47; the committed `w1/R65Executor1/selftest.stdout`
  reads 46. The live selftest (`.ufo/waves/round-66/controls/v22-selftest-r66.json`) reads 47/47 at the r66 base. The
  r65 files are not rewritten; this is the append-only correction.
- Round 65's frontier S140/S141 rows read "Reject (held)" while their registry status is `mined`. "Reject (held)"
  means not cited this round; `rejected` is reserved for sources rejected as sources (round-65 D4). Recorded here.

## Frontier and limits

- **Gate defect (routed to round 67).** The v2/v3 gate accepts a relative input that escapes `--repo`: `path.join`
  normalises `..`, so `../outside.mjs` from `X/repo` binds to `X/outside.mjs` (`R66Critic` F7; `matrix-esc.json` ok true,
  exit 0; missing-path control exit 1). Not repaired here: a repair changes the predicate and needs its own claim.
- **Meter limit (routed).** The adjacency meter does not check disposition content (`R66MutTester2`). A future claim
  needs a disposition-correctness control, not a vocabulary check.
- **Ledger drift (disclosed).** kama, kengaku and kotoba moved after the snapshot head; the meter's drift field is
  disclosure-only and reports them. The scored snapshot is the pinned measurement.
- **Relative-input coverage.** v3 has one positive case per base. A fixture resolving under both bases is not in the selftest.

## Wave and disposition

One v1 wave `w1`, 13 seats: scout 1, connector 1, executor 3, scribe 2, reviewer 2, critic 1, mutation-tester 2,
sentinel 1. Attack seats 5 of 13 (38 %). The L1 holds the planner seat. Dead seats: none (`.ufo/waves/round-66/w1-results.json`).
Residual call: none. Tools installed: none. Assimilation: none (`considerthese/` absent; the r57 quarantine register shift is unresolved).
