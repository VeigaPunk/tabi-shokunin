# R57MutMeter — MUTATE-RUN-REVERT probe on the v17 meter

Round 57, wave w1 (the only v1 wave). Seat: R57MutMeter (mutation tester).
Lane base revision: `ef43ececde883cc0368c6c7cfbabe30ef937b717`. Probe run 2026-11-03.

## Target bytes (frozen for this probe)

| item | value |
|---|---|
| meter | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs` |
| sha256 (before probe) | `7305b6726ff5da8060f063422e87dde4de1018e80a08cf98416c2f68b21a6054` (34736 bytes) |
| sha256 (after probe) | `7305b6726ff5da8060f063422e87dde4de1018e80a08cf98416c2f68b21a6054` (identical) |
| pristine selftest | exit 0, `allPass true`, **18/18** cases |
| pristine live run at baseline rev | exit 1, predicate false, 30 findings |

Stability: the v17 file was authored mid-probe; the probe bytes were frozen only after the file
stopped changing (same sha across a ≥60 s poll window, and again after the run). The probe
never reads or writes the repo copy: every mutant is a scratch copy under
`/fast/scratch/hyaku/tabi-r57/R57MutMeter/`, and each mutant differs from pristine by exactly
one non-comment line (verified per mutant with `diff -u`; see `mutant/receipts.json`).

## The live detector at the baseline revision

At `ef43ece` the v17 meter reads `corpus/adjacency-host-audit-r57.tsv` /
`corpus/adjacency-host-delta-r57.tsv`, which do not exist at that revision, so the pristine live
run reports `counts {roster:20, mapRows:16, auditRows:0, deltaLanes:0}` and 30 findings
(`audit-missing` ×16, `roster-lane-uncovered` ×14). That is the expected pre-data state and it
means the live run is a weak discriminator for logic mutants at this revision: the same 30
findings swamp id-level differences. The **selftest is the primary detector** here, per the
seat spec; the live run is recorded for completeness (it also proves each mutant still
executes end-to-end).

## 1. THE ROUTED KILL (r56-closure defect 1 — R56Mutant-m4 survivor)

Mutant **m4-prime**: the shared emission inverted, `predicateFrom(findings)` body
`findings.length === 0` → `findings.length !== 0` (AND→OR class).

- mutant sha256: `a6f8759511a9fcd771c6dcd584a2cd4c35ab22124f224bc644968570e71e11bb`
- `node <mutant> --selftest` → exit **1**, `allPass` **false**, pass **16/18**.
  The two new r57 cases both fail:
  - `predicate-assert-green`: emitted predicate **false** where true is expected (0 findings)
  - `predicate-assert-partial`: emitted predicate **true** where false is expected (1 finding:
    `delta-quote-not-whole-line: mado-shokunin:PROVINCE.md:2`)
- live run (baseline rev): exit **0**, `predicate true`, `findingCount 30` — the inversion would
  admit a 30-finding lane state as green, which is exactly the defect class.
- **Verdict: KILLED-BY-SELFTEST.** The routed fix is live at the frozen bytes; the r56 survivor
  does not survive the v17 selftest. Receipt: `mutant/m4-kill.json`.

## 2. Four fresh mutants (one logic change each)

All run on scratch copies of the same frozen v17 bytes; each was also run once live at the
baseline revision (`--rev ef43ece... --repo …/tabi-shokunin --fleet …/shokunin --json`).
Table as written to `mutant/results.tsv`:

| mutant | change | selftest-verdict | live-verdict | killed-by |
|---|---|---|---|---|
| m1 | drop the `audit-status-mismatch` push | FAIL (exit 1, 15/18) | exit 1, predicate false, 30 findings | status-mismatch-moved, stale-misclaimed, file-absent-misclaimed |
| m2 | make `roster-lane-uncovered` always pass (`if (false && …)`) | FAIL (exit 1, 17/18) | exit 1, predicate false, **16** findings | roster-lane-uncovered |
| m3 | invert the `lane-screen-sha-mismatch` comparison (`!==` → `===`) | FAIL (exit 1, 13/18) | exit 1, predicate false, 30 findings | honest-green, moved-claimed-honestly-green, file-absent-at-head-honest-green, predicate-assert-green, predicate-assert-partial |
| m4b | weaken `parseRef` line regex `/^\d+$/` → `/^\d+/` (any suffix) | **pass 18/18 — SURVIVED** | exit 1, predicate false, 30 findings (byte-identical to pristine live output) | — |

Observations:

- m1, m2, m3 are killed by the selftest at the frozen bytes; no finding required.
- m2's live run drops to 16 findings (the 14 `roster-lane-uncovered` findings vanish) — the
  mutant is visible live at this revision only because the r57 ledgers are absent; that is an
  accident of the pre-data state, not a designed detector.
- m4b's live output is byte-identical to the pristine live output; it is invisible to every
  current detector.

## 3. m4b survivor — coverage finding (not a contract change)

`parseRef` accepts `…:PROVINCE.md:2x` once the `$` anchor is dropped: `Number('2x')` is `NaN`,
the ref stops being rejected as unparseable, and the audit comparison silently reclassifies it.
Measured with one fixture (map ref `mado-shokunin@1111…:PROVINCE.md:2x`, audit row claimed
`stale`):

- pristine: `map-ref-unparseable: …:PROVINCE.md:2x`
- m4b: `audit-note-moved-line: …:2x`, `audit-status-mismatch: …:2x: claimed stale observed moved`

**Exact missing selftest case:** one case that feeds a map row whose ref line field carries a
trailing suffix (e.g. `…:PROVINCE.md:2x`) with any audit row, expecting the single id
`map-ref-unparseable`. Under m4b that id disappears (replaced by `audit-status-mismatch` /
`audit-note-moved-line`), so the case kills the mutant; the current 18 cases never exercise
`parseRef`'s reject path for a well-formed prefix with a bad suffix. Reported as a coverage
finding only — the frozen predicate/scoring is untouched.

## 4. Restoration

- The repo copy of v17 was never edited: sha256 before and after the probe are both
  `7305b672…b21a6054`.
- No mutating git/jj command was run; the only lane writes are the receipts named below.
- All mutant copies live under `/fast/scratch/hyaku/tabi-r57/R57MutMeter/` and that scratch
  root was deleted after the receipts were copied into `mutant/`.
- No tools installed or upgraded for this probe.

## Artifacts

- `mutant/m4-kill.json` — routed-kill receipt (mutant, expected detector, actual output, verdict, restoration evidence).
- `mutant/results.tsv` — the five-mutant table above.
- `mutant/receipts.json` — full detail: pristine/mutant sha256s, per-case selftest results, live-run JSON aggregates, exact mutation diffs.

## Verdict

- C1's declared change (b) behaves as claimed at the frozen bytes: the routed m4' mutant is
  killed by `predicate-assert-green` + `predicate-assert-partial` (16/18), and the inverted
  emission would have admitted a 30-finding state as green.
- Four fresh mutants: 3/4 killed by the selftest; 1 survivor (m4b) with the exact missing case
  named above.
