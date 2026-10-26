# MutC2Counter — C2 counter mutation probe (tabi round 34 w1)

**Verdict.** I mutated the frozen C2 counter `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` (frozen sha256 `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82`) with 10 single-point mutants in scratch only, ran each against the four committed controls rebuilt byte-faithfully in my scratch clone (pristine counter reproduces all four committed receipts field-for-field) plus one NEW cheap fixture. Exactly one committed control catches exactly one counter mutant: **J3 find-sniff kills the twin-probe-removal mutant** (predicate flips to TRUE, exit 0). The other **9 mutants survive the committed control set = unguarded clauses**: kill exit-code strength (A), FAIL-line requirement (B), decoy clause (D), neutral clause (E), occurrence check (F), battery clause (G), survivors-filter inversion (H — caught only by my new killNothing fixture, commit `b1496067`, tree `e889dc37`), battery-sha check (I — no reachable flip input: `BATTERY_COMMIT e6b0a907` is content-addressed, so the clause is defense-in-depth only), and timeout (J — a universal rejector, structurally invisible to all-false-state controls). This is a coverage finding about the committed control suite, not a defect in the frozen predicate; no contract change proposed. Lane bytes untouched (sha verified before and after).

## Method

- Scratch: `/fast/scratch/hyaku/tabi-r34/MutC2Counter-2/` (deleted before yield; receipts copied to the output dir first). One live clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee` → exit 0, HEAD `59f1b47aae277e1670e4a824173da8cde7e388ee` (freeze; lane HEAD identical).
- `node prep.mjs` → exit 0: copies the pristine counter (sha256 = frozen digest, asserted), builds 10 mutant copies (`muts/mut-{A..J}.mjs`, each needle asserted to occur exactly once in the pristine bytes), and commits 4 fixtures in the scratch clone per `baseline/controls.mjs` logic (J2 selfhash, J3 find-sniff, J4 reject-all — constructions verbatim from controls.mjs:88-119) plus a NEW J5 killNothing (selftest branch short-circuited to `exit 0`, rule lines untouched so all 20 mutants still apply). Fixture revs/trees in `fixtures.json`; gate bytes at freeze = baseline = `eded1be04a47…61c1` (matches the C2 claim's gate sha).
- `node driver.mjs` → exit 0, wall 217 s: 25 runs = pristine counter × {J1,J2,J3,J4} + 10 mutants × the controls that stress each mutated clause, concurrency 4, each run `TMPDIR=$S/tmp node <counter> --rev <rev> --repo $S/clone --json` (counter exit 0 = predicate true, 1 = false). All stdout/stderr/exit codes in `runs/`.
- No tools installed (node v24.21.0 preexisting); no network fetches; no browser launched; no lane, fleet, or sibling writes.

## Fixture fidelity (pristine counter vs committed receipts)

| run | predicate | pristine/neutral/decoy | killed | survivors | twinsFailing | battery | matches committed |
|---|---|---|---|---|---|---|---|
| pristine-J1 @freeze | false | 0/0/0 | 8 | M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19 | [] | true | c2-J1-do-nothing ✓ (that receipt ran at 15dfaccb; gate bytes identical) |
| pristine-J2 | false | 0/3/3 | 20 | [] | all 20 | true | c2-J2-selfhash ✓ |
| pristine-J3 | false | 0/0/0 | 20 | [] | all 20 | true | c2-J3-find-sniff ✓ |
| pristine-J4 | false | 0/0/0 | 8 | same 12 | [] | false | c2-J4-reject-all ✓ |

## Per-mutant decisions — which control flips to predicate TRUE

| mut | single point (counter file:line) | runs (verdict) | control that flips | verdict |
|---|---|---|---|---|
| A | :225 `killed: t.exit === 3 && …` → `t.exit !== 0 && …` | J1 false, J3 false (identical to pristine runs) | none — every kill in all four controls is exit=3 with ≥1 FAIL (receipt dist tables), so `!==0` never accepts what `===3` rejects | **SURVIVES** (unguarded) |
| B | :225 drop `&& t.failingCases.length > 0` | J1 false, J3 false | none — no control contains an exit-3 selftest without a `CASE … FAIL` line | **SURVIVES** (unguarded) |
| C | :236 twin filter `m.twinExit !== 0` → `false` | J1 false; J2 false (neutral 3 catches); **J3 TRUE exit 0** | **J3 find-sniff** | **KILLED** by committed control |
| D | :241 drop `decoy.exit === 0 &&` | J1 false; J2 false (neutral 3 still catches selfhash) | none — J2 fails neutral AND decoy together | **SURVIVES** |
| E | :241 drop `neutral.exit === 0 &&` | J1 false; J2 false (decoy 3 still catches) | none — same joint-failure redundancy | **SURVIVES** |
| F | :222 `if (n !== 1 …)` → `if (n < 1 …)` | J1 false, J4 false (identical to pristine; unappliable 0 everywhere) | none — every find occurs exactly once in every control gate | **SURVIVES** (unguarded) |
| G | :241 drop `&& battery.predicate === true` | J1 false; J4 false (survivors 12 catch reject-all even with battery false) | none — J4 fails battery AND survivors together | **SURVIVES** |
| H | :235 survivors filter `!m.killed` → `m.killed` | J1 false / J4 false but with inverted survivor lists (the 8 killed ids M01b M02 M11 M12 M13 M14 M15 M17); **J5 TRUE exit 0** (killed 0 → inverted survivors [] → all clauses pass) | none of the four committed; **J5 killNothing (NEW)** flips it | **SURVIVES committed suite**; killed by new fixture |
| I | :209 battery-sha refusal removed | J1 false, J4 false (identical to pristine) | none — unreachable flip: `git show e6b0a907:…` bytes cannot differ from the pinned sha in any clone without a SHA-1 collision; a repo lacking the commit exits 2 either way | **SURVIVES** (clause redundant given commit pin) |
| J | :51 `TIMEOUT_MS 180000` → `200` | J1 false but vacuously: pristine/neutral/decoy exit null (SIGTERM — `runs/J-J1.json` mutants[0] `signal:"SIGTERM"`), killed 0, survivors all 20, battery true | none — all four committed controls are expected-FALSE states, so a wrong-REJECT mutant is invisible by construction; it would also reject a genuine all-20-killed REV (predicate must be TRUE there) and is caught by the real REV measurement | **SURVIVES** (wrong-reject direction unguarded) |

Tally: 10 mutants — 1 killed by a committed control (C, by J3), 1 killed by a new fixture (H, by J5), 8 surviving the committed suite outright (A B D E F G I J).

## Unguarded clauses (coverage findings)

1. **Twin probe is the only probe clause individually pinned** (by J3). Neutral (:241) and decoy (:241) are only *jointly* pinned — J2 fails both at once, so mutants D and E pass the whole committed suite. Pinning each needs a control where exactly one probe fails.
2. **Kill criterion (:225) is pinned only in the too-few-kills direction** (J1/J4 survivors 12). Over-acceptance mutants A (non-3 exit) and B (FAIL-less kill) survive: no committed control contains such a kill. A control whose gate kills via crash/timeout-with-FAIL (exit ≠ 3) and via exit-3-without-FAIL would pin both.
3. **Occurrence check (:222) is pinned by nothing**: no control gate has a find occurring ≠ 1. A gate where some find text occurs twice would pin F.
4. **Battery clause (:241) is only jointly pinned** by J4 (survivors does the catching). A control with battery false and everything else passing would pin G.
5. **Survivors-filter inversion (H)** survives the committed suite with accidentally-correct verdicts but is caught by a trivial fifth control (selftest always exit 0) — cheap to commit if the suite wants inversion coverage.
6. **Battery-sha check (:209) has no reachable flip input** in any clone of the lane (commit pin `e6b0a907` already fixes those bytes); mutant I is a no-op everywhere — defense-in-depth only, not a guard loss.
7. **Wrong-reject mutants (J; also H against a good state) are structurally invisible to the committed suite**, which consists entirely of expected-FALSE states; they are guarded by the actual REV measurement (predicate true required), not by these controls.

Derived, not run: a plain survivors-clause removal (`survivors.length === 0` dropped at :241) would flip J1/J4 to TRUE (their only failing clause there is survivors 12) — the survivors clause is guarded against weakening, unlike its inversion.

## Restoration and hygiene

- Mutants were separate scratch files; the pristine copy was never mutated. `runs/restoration.json`: lane counter sha256 `3cf5eb69…` = scratch pristine sha256 = frozen digest, both `unchanged: true` (verified again after all runs).
- Lane never written; fixture commits only in my scratch clone (`git rev-parse --show-toplevel` asserted = clone before every commit; `-c user.name=MutC2Counter-2 -c user.email=MutC2Counter-2@scratch.local` on every git call).
- Scratch dir removed before yield; receipts copied first.

## Deliverables

- Report: `.ufo/waves/round-34/w1/MutC2Counter.md` (this file)
- `.ufo/waves/round-34/w1/MutC2Counter/verdicts.json` — structured per-mutant verdicts
- `.ufo/waves/round-34/w1/MutC2Counter/fixtures.json` — mutant manifest (needles/replacements/sha256s) + fixture revs/trees
- `.ufo/waves/round-34/w1/MutC2Counter/runs/` — 25 counter runs (`.json` stdout, `.stderr`, exit codes), `summary.json`, `restoration.json`
- `.ufo/waves/round-34/w1/MutC2Counter/prep.mjs`, `driver.mjs` — probe tooling (rerunnable)

Report: .ufo/waves/round-34/w1/MutC2Counter.md
