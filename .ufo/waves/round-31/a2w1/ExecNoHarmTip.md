# ExecNoHarmTip — round-31 a2w1 no-harm matrix at 4860483 vs freeze 9505a10

## Verdict

**No harm detected.** At lane revision `486048356f0712e4396588c9dab58cd419243120` (wave 1 integrated) every one of the six checks named in `claims.json` `noHarmChecks` is green with the same substantive reading it had at the freeze commit `9505a10eb80b2a0b273ebaba3f7f872ad302192d`, and all 21 registry gate self-tests are green at both revisions with identical case counts and byte-identical output once nondeterministic 40-hex fixture commit ids are normalised (21/21 files identical after normalisation; four differed only in those ids). No gate is green at the freeze and red at the tip. The only reading that changed anywhere is `check-sources`: population 118 → 122 rows, `tiers.A` 103 → 107, `status.mined` 94 → 98 — exactly the four new SOURCES rows S119–S122 this round opened, with 0 deletions anywhere in the wave diff (`15 files changed, 2003 insertions(+)`, `git diff --numstat` shows 0 deleted lines), `scripts/` byte-untouched, and both frozen counter digests matching `claims.json`. A 10-invocation extension sweep beyond the frozen list (every gate with a generic production invocation, run at both revisions) produced no green→red pair: 7 are green→green, 3 are equal-red states that were already red at the freeze.

## Setup (measurement rule)

- Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, seat dir `$S=/fast/scratch/hyaku/tabi-r31/ExecNoHarmTip`, `TMPDIR=$S/tmp`.
- Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120` → HEAD `4860483…`, `git status --porcelain` = 0 lines before the runs and 0 lines after all 21 self-tests, the 6 named checks and the sweep. Every command below ran with cwd = the clone.
- Freeze arm: the w1 matrix `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ExecNoHarmBaseline/` (`noharm-at-freeze.tsv`, `raw/selftest/`, `raw/census.txt`, `raw/registry.json`) plus `raw/selftest/exit.tsv` for per-script exit codes. Where a baseline summary line omitted a field, that field is reported as a "tip-only key" rather than as a change.
- Network: none used by this seat. `check-frontier-admission` reported `live=false`; no `--live` invocation, no HTTPS GET, no fetch receipt written.
- Tool installs: none (node v24.21.0, git 2.56.0 already present; pacman paused host-wide, nothing required).

## 1. claims.json `noHarmChecks` — all six at REV

| Check | exit@freeze | exit@REV | change | reading@freeze (canonical) | reading@REV (canonical) |
|---|---|---|---|---|---|
| check-gate-registry | 0 | 0 | same \| tip-only keys: verdict | findings=0 gates=21 nonconformant=0 rows=38 | findings=0 gates=21 nonconformant=0 rows=38 verdict=clean |
| check-release-pins | 0 | 0 | same \| tip-only keys: verdict | drifted=7 holds=16 population=23 resolved=23 unresolved=0 | drifted=7 holds=16 population=23 resolved=23 unresolved=0 verdict=clean |
| check-s106-evidence | 0 | 0 | same | anchor_located=true present=true sha_match=true valid=true verdict=valid | anchor_located=true present=true sha_match=true valid=true verdict=valid |
| check-frontier-admission | 0 | 0 | same \| tip-only keys: live,verdict | admitted=2 failing=0 population=2 | admitted=2 failing=0 live=false population=2 verdict=clean |
| check-sources | 0 | 0 | delta: rows 118->122; status.mined 94->98; tiers.A 103->107 | findings=0 rows=118 status.mined=94 status.queued=15 status.rejected=9 tiers.A=103 tiers.B=6 tiers.C=9 verdict=clean | findings=0 rows=122 status.mined=98 status.queued=15 status.rejected=9 tiers.A=107 tiers.B=6 tiers.C=9 verdict=clean |
| sources-census | 0 | 0 | same | ecodes=0 ok=true w04=19 | ecodes=0 ok=true w04=19 |

Command shape: `node scripts/… --rev 486048356f0712e4396588c9dab58cd419243120 …`; `sources-census` was `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`. Raw stdout/stderr: `raw/prod/`; exit codes: `raw/prod/exits.tsv`. All eight production invocations (the six checks plus the `--json` arms of registry and frontier-admission) exited 0.

Reading detail beyond the canonical strings:

- `check-gate-registry`: `rows=38 gates=21 nonconformant=0 findings=0` at both revisions. The gate **set** is identical (21 gates, name+script pairs compared from the two `--json` arms — freeze `raw/registry.json` vs tip), and so are the cited SKILL.md row indexes (check-decision-table row 2575, check-selfassessment row 2576 at both, i.e. the freeze commit already carried them and the tip's appended lines did not shift them).
- `check-release-pins`: `population=23 resolved=23 unresolved=0 holds=16 drifted=7`, unchanged.
- `check-s106-evidence`: `present=true sha_match=true anchor_located=true valid=true`, unchanged.
- `check-frontier-admission`: `population=2 admitted=2 failing=0 live=false` — round-30 C2's reading is not disturbed (same two entries: `host-published-rate-limit-headers.md` S117, `rate-limit-policy-fields.md` S116).
- `check-sources`: **the one changed reading**, analysed in §4.
- `sources-census`: output byte-identical to the freeze artifact (`sha256 77a4e8ba…c2f468e` both), 19 `W04` duplicate-url warnings, 0 `E` codes, `tabi ok` line present.

## 2. Every registry gate's `--selftest` (21 gates, both revisions)

| Gate self-test | exit@freeze | exit@REV | cases/ok @freeze | cases/ok @REV | change |
|---|---|---|---|---|---|
| check-adjacency | 0 | 0 | cases=57 allGreen=true | cases=57 allGreen=true | same |
| check-aria-metadata | 0 | 0 | cases=36 allGreen=true | cases=36 allGreen=true | same |
| check-bfcache-receipt | 0 | 0 | cases=17 allGreen=true | cases=17 allGreen=true | same |
| check-decision-table | 0 | 0 | cases=34 allGreen=true | cases=34 allGreen=true | same |
| check-freshness | 0 | 0 | cases=12 allGreen=true | cases=12 allGreen=true | same |
| check-frontier-admission | 0 | 0 | cases=24 allGreen=true | cases=24 allGreen=true | same |
| check-gate-mutants | 0 | 0 | cases=12 allGreen=true | cases=12 allGreen=true | same |
| check-gate-registry | 0 | 0 | cases=22 allGreen=true | cases=22 allGreen=true | same |
| check-measurement-binding | 0 | 0 | cases=76 allGreen=true | cases=76 allGreen=true | same |
| check-release-pins | 0 | 0 | cases=29 allGreen=true | cases=29 allGreen=true | same |
| check-round-contract | 0 | 0 | cases=38 allGreen=true | cases=38 allGreen=true | same |
| check-s106-evidence | 0 | 0 | cases=10 allGreen=true | cases=10 allGreen=true | same |
| check-selfassessment | 0 | 0 | cases=30 allGreen=true | cases=30 allGreen=true | same |
| check-source-reopen-receipt | 0 | 0 | cases=18 allGreen=true | cases=18 allGreen=true | same |
| check-sources | 0 | 0 | cases=26 allGreen=true | cases=26 allGreen=true | same |
| check-user-round-contract | 0 | 0 | cases=45 allGreen=true | cases=45 allGreen=true | same |
| round-evidence-audit | 0 | 0 | cases=13 allGreen=true | cases=13 allGreen=true | same |
| wave-r21-measure-c1 | 0 | 0 | cases=83 allGreen=true | cases=83 allGreen=true | same |
| wave-r22-review-chronology | 0 | 0 | cases=17 allGreen=true | cases=17 allGreen=true | same |
| wave-r22-measure-c1 | 0 | 0 | cases=45 allGreen=true | cases=45 allGreen=true | same |
| wave-r12-claim-record | 0 | 0 | cases=9 allGreen=true | cases=9 allGreen=true | same |

Per-script exit codes at the tip: `raw/selftest/exit.tsv`; freeze: `…/w1/ExecNoHarmBaseline/raw/selftest/exit.tsv`. Flags are the ones the baseline proved work per script (`--self-test` vs `--selftest` differs by gate). All 21 exit 0 at both revisions; `raw/selftest-compare.txt` records the normalised freeze-vs-tip file comparison: 21/21 identical.

## 3. Extension sweep — gates outside the frozen list, run at both revisions

Not in `claims.json`; added because a green→red harm to a gate the frozen list does not name would otherwise be invisible.

| Gate (production mode) | exit@freeze | exit@REV | verdict | reading@freeze | reading@REV |
|---|---|---|---|---|---|
| check-adjacency --at --fleet | 0 | 0 | holds | rows=10 verdict=clean verified=10 | rows=10 verdict=clean verified=10 |
| check-bfcache-receipt --rev | 0 | 0 | holds | clean=true exit=0 findings=n0 restores=1 valid=true | clean=true exit=0 findings=n0 restores=1 valid=true |
| check-source-reopen-receipt --rev | 0 | 0 | holds | clean=true exit=0 findings=n0 reopened=6 resolved=6 unresolved=0 | clean=true exit=0 findings=n0 reopened=6 resolved=6 unresolved=0 |
| check-gate-mutants --rev | 0 | 0 | holds | benign_killed=0 benign_total=13 exit=0 failing=- fault_killed=27 fault_survivors=0 fault_total=27 id=pins-notfound-eq-reorder kind=benign outcome=survived verdict=clean | benign_killed=0 benign_total=13 exit=0 failing=- fault_killed=27 fault_survivors=0 fault_total=27 id=pins-notfound-eq-reorder kind=benign outcome=survived verdict=clean |
| check-freshness --worktree | 0 | 0 | holds | finding=freshness_worktree matched=34 newlines=34 sha256=b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc target=/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md unique=34 verdict=clean | finding=freshness_worktree matched=34 newlines=34 sha256=b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc target=/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md unique=34 verdict=clean |
| check-aria-metadata --check | 0 | 0 | holds | acceptedCorrection=true exit=0 findings=n28 mode=check ok=true originalFindings=n18 | acceptedCorrection=true exit=0 findings=n28 mode=check ok=true originalFindings=n18 |
| check-measurement-binding --check round-18 | 1 | 1 | holds | bound=0 claims=3 detail=paths=corpus/SOURCES.md reason=counted_input_changed verdict=failed | bound=0 claims=3 detail=paths=corpus/SOURCES.md reason=counted_input_changed verdict=failed |
| check-sources worktree | 0 | 0 | holds | findings=0 rows=118 status.mined=94 status.queued=15 status.rejected=9 tiers.A=103 tiers.B=6 tiers.C=9 verdict=clean | findings=0 rows=122 status.mined=98 status.queued=15 status.rejected=9 tiers.A=107 tiers.B=6 tiers.C=9 verdict=clean |
| check-round-contract --witness | 2 | 2 | holds | detail=--witness finding=usage verdict=could-not-evaluate | detail=--witness finding=usage verdict=could-not-evaluate |
| check-user-round-contract --witness | 2 | 2 | holds | detail=Witness finding=witness_failure verdict=could-not-evaluate | detail=Witness finding=witness_failure verdict=could-not-evaluate |

Environment notes:

- The first `check-adjacency` attempt (without `--fleet`) exited 1 at **both** revisions because the sandbox clone has no sibling lane repositories beside it (`sibling_unresolved`, `ruling_unresolved` for `<parent>/kaidoku-shokunin` etc.). Re-run with `--repo <scratch>/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin` (a symlink to the real lane, read-only) → `verdict=clean rows=10 verified=10` at both. The equal-red first attempt is recorded in `raw/sweep/exits.tsv` as `adjacency`.
- `check-round-contract --witness` and `check-user-round-contract --witness` refuse with `could-not-evaluate` at both revisions: the witness arm must be the pinned legacy gate blob (`b2eb8316…`, `9ebe3119…`), not a round revision. Equal refusal, not harm. `check-measurement-binding --check .ufo/waves/round-18/measurement-binding.json` is `verdict=failed` (3 claims `counted_input_changed`, incl. `corpus/SOURCES.md`) identically at both revisions — already red before this round.
- `check-freshness --witness c24eaea14dfc0c4a3848742d31673db5675f9183` (run in both trees) is `verdict=failed finding=witness_too_early` identically: a clock-window condition, not a tree difference.
- `round-evidence-audit` has no generic production mode (it requires `--round`/`--round-cap`), so it is covered by its self-test only, exactly as in the w1 baseline.

## 4. The one reading that changed

`check-sources` (worktree scan, run twice in the sweep and in the named list):

```
freeze: SOURCES_GATE verdict=clean rows=118 tiers=A:103,B:6,C:9 status=queued:15,mined:94,rejected:9 findings=0
tip:    SOURCES_GATE verdict=clean rows=122 tiers=A:107,B:6,C:9 status=queued:15,mined:98,rejected:9 findings=0
```

`git diff 9505a10… 4860483… -- corpus/SOURCES.md` adds exactly four lines — S119 (RFC 9309), S120 (RFC 6585), S121 (GitHub REST rate limits), S122 (GitHub REST best practices) — all `tier A`, all `mined`, no row edited or removed. +4 rows / +4 tier-A / +4 mined accounts for the whole delta. The wave's complete diff is additive: `git diff --numstat` over all 15 changed paths shows 0 deleted lines (`SKILL.md 22/0`, `corpus/README.md 25/0`, `SCORECARD.md 4/0`, `LOG.md` untouched), so no statement the gates read was removed.

## 5. Integrity invariants checked

- `git diff --stat 9505a10… 4860483… -- scripts/` → empty (0 lines): no gate script changed between freeze and tip.
- Frozen counter digests at REV: `sha256sum scripts/check-decision-table.mjs scripts/check-selfassessment.mjs` → `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832` and `143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce`, equal to `claims.json` `frozenDigests`.
- Clone `git status --porcelain` = 0 after the entire matrix (self-tests, production checks and the mutation gate's work dirs all under `TMPDIR`/`$S`).
- Informational (not no-harm rows; the C1/C2 claim counters, offline arms only, JSON written to files, never piped): `check-decision-table --rev REV --baseline 96a2d1a… --entry corpus/knowledge/rate-signal-decision-table.md --json` → exit 0, `population=13 admitted=13 failing=0`; `check-selfassessment --rev REV --json` → exit 0, `mismatches=0 couldNotEvaluate=103`. Both were red at the freeze (entry absent / 9 mismatches), so neither can present as a green→red harm; row-level correctness of the 13 decision-table rows is the C1 attack seat's question, not this seat's.

## 6. Slips recorded (not harm)

- My first self-test pass invoked `wave-r12-claim-record` with `--selftest` → exit 2, `CLAIM_GATE verdict=could-not-evaluate detail=bad_arguments`. The script accepts `--self-test` only (the w1 baseline records the same wrong-flag row). Re-ran with `--self-test` → exit 0, `CLAIM_SELFTEST verdict=clean cases=9/9`, byte-identical to the freeze output. The wrong-flag attempt is kept as a separate row (`wave-r12-claim-record-wrong-flag`) so the record shows the invocation error rather than hiding it.
- The baseline TSV's freeze readings are human summaries, so an absent field cannot be read as a change; those keys are labelled "tip-only keys" in `noharm-at-tip.tsv` (e.g. `verdict=clean`, `live=false`). The substantive counts are present on both sides.

## 7. Artifacts

All under `.ufo/waves/round-31/a2w1/ExecNoHarmTip/`:

- `noharm-at-tip.tsv` — the matrix (37 rows: 6 named checks, 21 gate self-tests, 10 sweep invocations), `sha256 d6e910ac8cea974e1f9046df578ad1ce7658ceb282ac0cbea20f4a50c58934a7`.
- `raw/prod/` — the 8 production invocations (`.out`, `.err`, `exits.tsv`), plus the two informational counter JSONs.
- `raw/selftest/` — 21 gate self-test `.out`/`.err`, `exit.tsv`, and `selftest-compare.txt` (normalised freeze-vs-tip comparison, 21/21 identical).
- `raw/sweep/` — both revisions' outputs for the 10 extension invocations, the two `check-freshness --witness` trees, `exits.tsv`.
- `selftest-runner-tip.sh`, `build-tsv.mjs`, `lib-read.mjs` — the runner and the TSV/reading-comparison code, so the matrix is reproducible byte-for-byte from the raw outputs.

## Blockers

None. No repair was attempted or required: this seat reports findings only.
