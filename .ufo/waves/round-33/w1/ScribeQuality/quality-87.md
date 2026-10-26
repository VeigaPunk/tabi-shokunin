DRAFT — append-only block for corpus/QUALITY.md, to be filed by the L1 after criterion 86
(QUALITY.md has 86 numbered criteria; `grep -cE '^[0-9]+\.' corpus/QUALITY.md` = 86).
Citations to `corpus/lessons/round-33.md` name its assigned sections (`## Gate`, `## Mistakes`) and no
mistake number, because that lesson was being authored concurrently by the ScribeLesson seat; the L1
adds M numbers on filing. Rule-then-red-state order follows criteria 83-86.

## Round 33 additions (append-only; never edit above)

87. A sibling-overlap map answers a frozen sweep only when the sweep's membership rule was fixed before the map was
    edited and every candidate it names ends either mapped by a verified row or screened under one of the closed
    reasons — and no single count is the answer: screening all 47 unaccounted candidates reaches `unaccounted 0` with
    `newMapped 0`, and a map gate that verifies fourteen rows clean leaves those same 47 candidates unaccounted, so
    the round states `mapped`, `screened`, `unaccounted` and the verified-row count together and never one of them as
    "the sweep is answered". Check: `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev <REV> --repo
    <clone> --fleet <fleet> --json` is `predicate` true only with `unaccounted` 0 and `newMapped` >= 4 over
    `adjacency` clean; a `same-surface` screen additionally needs a `surface` naming a mapped-verified row of that
    same sibling, and every screen quote is a verbatim 4-25-word substring of the candidate line. Red state at the
    round-33 freeze: `.ufo/waves/round-33/baseline/c1-J2-screen-all.json` (`screened 47`, `unaccounted 0`,
    `newMapped 0`, predicate false) and `c1-J3-junk-rows.json` (`adjacency` clean, rows 14, verified 14,
    `unaccounted 47`). (source: corpus/lessons/round-33.md §Gate; `.ufo/waves/round-33/claims.json` C1 controls)

88. A new map row covers a candidate only when its two quotes name each other's lane: a `ruled` row's ruling line and
    a `contested-open` row's fleet L0 `tabi | round-<N> |` line name the sibling, and a `split-declared` or
    `refused-route` row carries `tabi` in its sibling quote or the sibling lane token in its tabi quote — because the
    map gate verifies verbatim quotes on both cited lines, not overlap, so "the row verifies clean" is never coverage.
    Red state: `.ufo/waves/round-33/baseline/c1-J4-mislabel-unnamed.json` — four split-declared rows on real kake
    candidate lines whose quotes name neither side verify clean (rows 14, verified 14) and leave `mapped 9`,
    `newMapped 0`, predicate false — and `c1-J3-junk-rows.json`, where four rows on non-candidate sibling lines are
    equally clean and equally worth nothing. (source: corpus/lessons/round-33.md §Mistakes; `.ufo/waves/round-33/
    claims.json` C1 `feasibilityDisclosed`: "a candidate screened with a wrong reason counts as accounted")

89. A gate is said to admit evidence only after a frozen battery scores it on three populations that can move
    independently — honest variants admitted with the admitted count stated, constructions drawn from the gate's own
    prior-era golden output rather than from its current code that must be refused, and a whitelist control that
    accepts only the honest bytes and must fail — because a forgery-only reading passes any gate that exits 1 on
    everything (`forgeriesAccepted 0`, honest H0/H1/H2 false), and a digest whitelist passes both the forgery and the
    honest reading while carrying five 12-hex digest literals and failing its own self-test (exit 3). Red state at the
    round-33 freeze: `.ufo/waves/round-33/baseline/c2-J1-do-nothing.json` (`forgeriesAccepted 8`,
    `acceptedForgeries` F1-F8), `c2-J2-reject-all.json`, `c2-J3-whitelist.json` (`digestLiterals` 5, `selftest` exit
    3, `verdict=failed cases=27 passed=25`). Criterion 86 governs what the admitted count means; this criterion
    governs which populations a forgeriesAccepted number is read against. (source: corpus/lessons/round-33.md §Gate;
    `.ufo/waves/round-33/claims.json` C2 controls; `.ufo/waves/round-32/w1/CritC1Forgery.md` D1-D5)

90. A feasibility sentence — "not reachable without …", "the counter cannot judge …", "the battery cannot catch …" —
    is written only after the cheapest forgery against that instrument has been run, and it names the attack and
    cites its control; a limit stated without a run is a finding, and its fix is an append-only correction that cites
    the stale sentence. Red state: round 32's C1 said the target was "not reachable without a committed receipt of
    two real runs from a driver other than the counter" while four cheap constructions reached admitted 16 (an id
    listed 16 times, one transcript cited as both runs, a driver re-exporting the gate, a synthetic transcript with a
    real first screenshot spliced in), and the frozen file could only be corrected downstream
    (`corpus/lessons/round-32-verifier-spotcheck.md:151`, routed defect 4; `corpus/lessons/round-32.md` M2). Green
    form at round 33: C1 states the counter's blindness to overlap only after the screen-all control ran
    (`c1-J2-screen-all.json`), and C2 states the battery's finiteness only after F1-F8 were built
    (`c2-J1-do-nothing.json`). (source: corpus/lessons/round-33.md §Mistakes, routed defect 4;
    `.ufo/waves/round-33/claims.json` C1/C2 `feasibilityDisclosed`)
