# MutC1Counter — C1 mutation probe (tabi round 34, wave w1 = build + first falsifiers)

## Verdict

Twelve single-point mutants of the frozen C1 counter (`.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs`, sha256 `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e`, verified against `claims.json.frozenDigests` before and after) were scored against the five committed C1 controls rebuilt in a seat clone — every rebuilt control tree is byte-identical to the committed baseline trees, and the rebuilt J1 do-nothing receipt is byte-identical to `baseline/c1-J1-do-nothing.json` — and against the do-nothing baseline. The five controls kill 3 of 12 mutants (J4 kills MU02 and MU03; J5 kills MU05); **nine survive: MU01 MU04 MU06 MU07 MU08 MU09 MU10 MU11 MU12**. Follow-up liveness demos show six of the nine are live false-accept gaps — MU01 (target 3→2), MU04 (sibling-token test), MU08 (screen verbatim check), MU09 (same-surface rule), MU12 (maps-candidate check) each accept a gate-clean defective lane that the pristine counter rejects — while MU06 is vacuous (dead code: no frozen set-B lead cites PROVINCE.md), MU07 is a metric-integrity-only risk (candidate set 67→33 with no predicate flip possible on any control), and MU10/MU11 are masked by the gate's folded `duplicate_row` rule (a restated surface+sibling pair is gate-flagged before the counter's baseline-key clause is ever reached). No mutant flips the do-nothing baseline; every mutant evaluated on every run (no exit 2). The lane checkout was never modified: `git status --porcelain` = 0 files and the frozen counter digest is unchanged after the probe.

## Method and commands

Environment: node v24.21.0, git 2.56.0. One live clone per seat: `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` → `checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee` (freeze; TOPLEVEL_OK asserted) → `checkout -q --detach 15dfaccb34601c2d221c78501e2befd8998d600c` (BASELINE) for the control rebuild; all lane scripts ran only in the clone; every git mutation named `-C $S/clone` with toplevel asserted; scratch `S=/fast/scratch/hyaku/tabi-r34/MutC1Counter` with `TMPDIR=$S/tmp`; sibling repos touched read-only at their frozen pins.

1. **Frozen-bytes intake** — `git show 59f1b47:…c1-adjacency-sweep-v2.mjs | sha256sum` → `0dba816c…` ✓; `…baseline/controls.mjs | sha256sum` → `18c95d67…` ✓ (both equal `claims.json.frozenDigests`). `c1-pins.json` taken from the freeze commit (it is not in BASELINE).
2. **Mutants** — `node $S/build/make-mutants.mjs` (exit 0): 12 mutants, each one find/replace asserted to occur exactly once in the pristine bytes (manifest with sha256s in `mutants-manifest.json`). Mutated rule sites (pristine file:line): `:71` NEW_TARGET, `:127` dedupe key, `:148` PROVINCE skip, `:215` baseKeys fold, `:244` screen verbatim, `:246` same-surface, `:268` isNew, `:272` maps-candidate, `:275` new-declaration + sibling-token, `:277` split-declared tabi test.
3. **Control rebuild** — `TMPDIR=… node $S/build/build.mjs` (exit 0, 10 s): mirrors the frozen `controls.mjs` C1 legs (J1 do-nothing, J2 screen-all, J3 junk-noncandidate, J4 existing-tabi-lines, J5 unnamed-sibling-side) with the pristine counter; C2 legs skipped (other seat). All five rebuilt control **tree hashes equal the committed provenance trees** (`controls-rebuild/*.provenance` vs `baseline/c1-J*.provenance`): `21383e57…`, `c6b370c7…`, `8f25da2e…`, `583416ce…`, `02250027…` — the rebuilt commits ARE the committed control commits. Rebuilt J1 counter output is byte-identical to `baseline/c1-J1-do-nothing.json` (diff clean). Control revs recorded in `revs.json` (J2 `2fe7f04f…`, J3 `88dbda97…`, J4 `9993025e…`, J5 `3e7b753b…`; commit hashes differ from the baseline run only by committer timestamp — the trees are identical).
4. **Probe matrix** — `node $S/build/probe.mjs` (exit 0; 65 runs = 13 counters × 5 revs, 108 s): detection semantics — control C detects mutant M iff `predicate(M, C) === true` (the crippled counter accepts the defective lane); J1 must stay `false` for every counter.

## Detection matrix (predicate; F = rejected, T = accepted)

| counter | J1 do-nothing | J2 screen-all | J3 junk-noncandidate | J4 existing-tabi-lines | J5 unnamed-sibling-side | verdict |
|---|---|---|---|---|---|---|
| pristine (calibration) | F | F | F | F | F | rejects all five ✓ (candidates 67, unaccounted 66 at J1) |
| MU01-target-3-to-2 | F | F | F | F | F | **survives** |
| MU02-new-decl-removed | F | F | F | **T** | F | killed by J4 |
| MU03-isNew-inverted | F | F | F | **T** | F | killed by J4 |
| MU04-sibling-token-removed | F | F | F | F | F | **survives** |
| MU05-split-tabi-test-removed | F | F | F | F | **T** | killed by J5 |
| MU06-province-filter-removed | F | F | F | F | F | **survives (vacuous)** |
| MU07-dedupe-key-no-text | F | F | F | F | F | **survives** (candidates 67→33 on every rev) |
| MU08-screen-quote-unchecked | F | F | F | F | F | **survives** |
| MU09-same-surface-unchecked | F | F | F | F | F | **survives** |
| MU10-baseline-fold-dropped | F | F | F | F | F | **survives (gate-masked)** |
| MU11-baseline-key-check-removed | F | F | F | F | F | **survives (gate-masked)** |
| MU12-maps-candidate-check-removed | F | F | F | F | F | **survives** |

J3 detects no single mutant: its junk rows are rejected by BOTH the maps-candidate clause (`:272`) and the split-declared tabi test (`:277`) plus the gate flag — defense in depth.

## Liveness demos (`build/demos.mjs`, exit 0; receipts `demos/`)

Each demo commits one minimal defective lane on the clone and scores it with pristine + the mutant:

| demo | construction (gate verdict clean unless noted) | pristine | mutant | flip |
|---|---|---|---|---|
| D1-two-new-rows | 2 new split-declared rows + 64 valid screens | F (newMapped 2 < 3) | MU01 **T** exit 0 (newMapped 2 ≥ 2) | ✓ |
| D2-unnamed-decls | 3 new rows whose NEW tabi declarations never name the sibling | F (newMapped 0) | MU04 **T** exit 0 (newMapped 3) | ✓ |
| D3-junk-screen | 3 real rows + leftover candidate screened with a non-verbatim quote | F (unaccounted 1, screenFindings 1) | MU08 **T** exit 0 (unaccounted 0, newMapped 3) | ✓ |
| D4-unmapped-surface | 3 real rows + leftover screened same-surface citing `no-such-surface-xyz` | F (unaccounted 1, screenFindings 1) | MU09 **T** exit 0 (unaccounted 0, newMapped 3) | ✓ |
| D5-restated-pair | row restating baseline pair `cdp-live-target-census kama` | F | MU11 F (gate flags `duplicate_row` — folded surface+sibling pair; adjacency failed under both) | ✗ masked |
| D6-noncandidate-rows | 3 `refused-route` rows on non-candidate sibling SKILL.md:3 lines + 66 screens | F (newMapped 0) | MU12 **T** exit 0 (newMapped 3) | ✓ |

Demo honesty note: an earlier demo round used `ruled` rows with `-` ruling_ref and a sibling-side `ruling_quote`; the gate rejected those (`ruling_ref_invalid` / ruling-quote venue rules, `scripts/check-adjacency.mjs:131-141`) and D5's first build crashed on a `win(text,'tabi')` needle absent from a set-B-only candidate line — both fixed before the runs above; the rejected-round receipts were overwritten by the final run.

## Guard gaps the closure should know

1. **The target boundary is unpinned** (MU01): no control approaches newMapped 2 vs 3; a lane delivering only 2 new rows passes a weakened counter. A 2-vs-3 boundary control would pin `:71`.
2. **The sibling-token clause has no dedicated control** (MU04): every control's tabi side happens to name its sibling; declarations that never name the other lane are accepted. J5 tests the *sibling-side* quote, not the *tabi-side* token.
3. **Screen-quality clauses are combinable-only** (MU08, MU09): junk screens alone can never reach predicate true (newMapped 0 gates it), but combined with 3 real rows they hide an unaccounted line. A control stacking 3 real rows + one junk screen would pin both.
4. **Rows mapping nothing are single-pinned by J6-absence** (MU12): only the maps-candidate clause (`:272`) rejects non-candidate rows once the disposition test is satisfied; D6 shows a clean-verdict acceptance.
5. **Candidate-set construction is unpinned** (MU06 vacuous, MU07 metric-only): no lead cites PROVINCE.md so the `:148` skip is dead code today; the dedupe key (`:127`) changes the set 67→33 and poisons 31-33 screens with `screen-not-a-candidate` findings without ever flipping a predicate — a false-reject/metric-integrity risk, not a false-accept.
6. **Baseline-key clauses are double-layered** (MU10, MU11): the gate's folded `duplicate_row` (`check-adjacency.mjs:149-150`) blocks restated pairs before the counter clauses matter, and all 13 baseline surfaces are fold-normal, so MU10 is inert on this map state. Not false-accept-live, but the counter clauses are currently unredundant paper.

## Provenance, integrity, disclosures

- Frozen counter sha256 before probe `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e`, after probe (lane file) identical; lane `git status --porcelain` = 0. All mutants lived and died under `/fast/scratch/hyaku/tabi-r34/MutC1Counter` (clone removed with the scratch below).
- No tool installs or upgrades; no network fetches; no browser launches; no subagent dispatch; no lane/sibling/fleet writes beyond the seat output dir and report named below.
- Commands and exit codes are quoted in §Method; raw outputs in the receipts directory.

## Deliverables

- Report: `.ufo/waves/round-34/w1 = build + first falsifiers/MutC1Counter.md` (this file)
- Receipts: `.ufo/waves/round-34/w1 = build + first falsifiers/MutC1Counter/` — `controls-rebuild/` (per-control .json/.stderr/.provenance), `demos/` (per-demo counter outputs), `probe-results.json`, `verdicts.json`, `demo-results.json`, `build-summary.json`, `revs.json`, `mutants-manifest.json`, `c1-candidates.tsv`, `c1.mjs` (pristine bytes copy)
- Scratch `/fast/scratch/hyaku/tabi-r34/MutC1Counter` deleted after receipt copy (clone included).
