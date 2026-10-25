# RevRegistryRestatement — wave-2 falsification of SKILL.md §"Round 24 — gate registry conformance"

Scope: the eleven restated rows in `SKILL.md:2468-2479` (tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08`),
each checked field-by-field against PROTOCOL.md §"Gate standard" (`/home/vgpnk/Projects/shokunin/PROTOCOL.md:375-424`)
and against the named scripts at the tip; then the supersession claim; then predicate-level mutants
of `scripts/check-gate-registry.mjs` on a scratch fixture (`.ufo/waves/round-24/scratch/RevRegistryRestatement/fx/`,
which reproduces the tip verdict exactly: gates=14 rows=23 nonconformant=0).

All counts below carry the command that produced them. Where a claim failed only because of
environment, the observation is labelled as such.

## Findings by severity

### F1 (HIGH) — `adjacency-map` row's pinned-value path is factually wrong
Row 2475 says: "`scripts/check-adjacency.mjs` reasons table and lane-tip anchor; round-17 adjacency
map at `corpus/knowledge/`". The gate's map constant is `MAP_PATH = 'corpus/adjacency.tsv'`
(`scripts/check-adjacency.mjs:180`, `:1178`). `git ls-tree -r --name-only ad125e85 -- corpus/knowledge
| grep -i adjac` returns **nothing**; `corpus/knowledge/closeout-r11.md` and
`corpus/knowledge/webmcp-invocation-round-17.md` merely mention adjacency in prose. The actual
checked map is `corpus/adjacency.tsv` (present at the tip). The row names a directory that does not
hold the pinned artifact. The instrument cannot see this — its pinned predicate is only
`len>=8 && (/[/.]/ || hex)` (check-gate-registry.mjs:262): a mutant replacing claim-record's pinned
path with `corpus/evidence/never-existed-zz.json` still reports `nonconformant=0` (fixture M3).
Severity HIGH because a required field is wrong on the committed row and nothing flags it.

### F2 (HIGH) — two of the eleven rows omit exit code 3 their own scripts emit; instrument can't see it
PROTOCOL §Verdict: "every other code a gate exits (2, 3, 64, …) is declared in its registry entry".
- `scripts/check-gate-registry.mjs:439`: `process.exit(out.ok ? 0 : 3)` — self-test disagreement
  exits 3, but row 2478's verdict map declares only 0/1/2.
- `scripts/check-selfassessment.mjs:550`: `process.exit(out.ok ? 0 : 3)` — same; row 2479 same omission.
Row 2477 (`round-evidence-audit`) declares `3=self-test disagreement` and is consistent with
`scripts/round-evidence-audit.mjs:975,1007` — proving the convention was applied inconsistently
within the same section. The instrument's verdict predicate tests only codes 0/1/2
(check-gate-registry.mjs:257-261); a mutant deleting `; 3=self-test disagreement` from the
round-evidence-audit row still reports `nonconformant=0` (fixture M1). The other eight gates exit
0/1/2 only (EXIT tables + `exit` scan: no exit codes ≥3 in check-freshness, check-sources,
check-aria-metadata, check-adjacency, check-measurement-binding, check-round-contract,
check-user-round-contract, check-claim-record).

### F3 (HIGH) — "restates the lane's whole gate set" and "three gates had no gate-kind row" are false under the instrument's own derivation
The derived gate set at the tip is 14 (`node scripts/check-gate-registry.mjs --rev ad125e8 --json`
→ `gates:14`), the block restates 11, and the instrument's derivation has two blind spots that make
its `nonconformant=0` cover less than the prose claims:
- **"`Name / kind`"-shaped rows are invisible.** Round-19/20 registries use the header
  `| Name / kind | Entry command (lane root) | ... |` (SKILL.md ~2096, ~2238). `kindOf()` looks for a
  header matching `/kind/i`, finds the *first* cell "Name / kind", reads the name text, and the
  `^(gate|probe)\b` test fails (check-gate-registry.mjs:173-175). So `wave-1 provenance metadata / gate`
  (row 2244) and `writer isolation / gate` (row 2101) — both real gates with `--selftest` and 0/1/2
  exit maps (check-wave.mjs header documents "Canonical frozen gate mode" + exit map;
  check-isolation.mjs row says "same `--self-test`") — are never parsed as gate-kind rows, and being
  outside `scripts/` they're never unioned into the gate set either. The same shape also hides
  round-19's `measure-c1/c2/c3` rows (registered " / gate" counters) and three " / probe" rows.
  Instrument's own docstring claims "legacy row whose kind cell reads `gate / tabi` carries its owner
  after the slash" — it handles kind-after-slash in the Kind column, not name-before-slash in the
  Name column. Fixture M4 (stub `.ufo/waves/round-20/check-wave.mjs` + the real "Name / kind" row)
  leaves `gates=14 nonconformant=0` — invisible.
- **Gates outside `scripts/` named only by invisible rows stay invisible.** The convention scan is
  `path.startsWith("scripts/")` (check-gate-registry.mjs:283); a `check-wave.mjs` under `.ufo/waves/`
  is unioned only if a parseable gate-kind row names it — and the round-19/20 rows don't parse.
So: prose "restates the lane's whole gate set" overclaims (14 derived minus 5+ invisible = the block
covers 11 of ~16 named gates); "three gates had no gate-kind row at all" undercounts — by the
instrument's own parse, check-adjacency, check-measurement-binding, round-evidence-audit PLUS
check-wave, check-isolation, measure-c1, measure-c2, measure-c3 (round-19) had none (≥8, not 3).

### F4 (MEDIUM) — rows 9-11's pinned-value cells name receipts the gates never read
`grep -n corpus/evidence scripts/round-evidence-audit.mjs` → nothing. For
`scripts/check-gate-registry.mjs` and `scripts/check-selfassessment.mjs`, `corpus/evidence` appears
only in comments and fixture strings, not as a read path. Rows 2477-2479 list
`corpus/evidence/round-23/c1-measurements.json` and `corpus/evidence/round-24/c{1,2}-measurements.json`
as pinned-value paths; they are output receipts, not inputs the gate verifies. The only true pins are
the CASES tables in the scripts. Field content misdescribes the pin; the instrument's slash-or-hex
predicate accepts it (F1's M3 mutant). Note: `round-evidence-audit` does digest the fleet
report/policy it reads (`scripts/round-evidence-audit.mjs:953,1074-1078`), so that clause of the row
is accurate.

### F5 (MEDIUM) — `measurement-binding` supersession silently drops a material disclosure
Earlier row (SKILL.md:1840) declared `--self-test` "(runs `scripts/selftest-measurement-binding.mjs`)".
New row 2476 says just `node scripts/check-measurement-binding.mjs --self-test` (cases=76, reasons=13).
The gate delegates the entire self-test to the helper — if the helper is absent it prints
`MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0` (check-measurement-binding.mjs:786-798,
`SELFTEST_SCRIPT` at :107). PROTOCOL §Self-test warns a "helper-only … self-check does not satisfy
this clause"; whether `--self-test`-spawns-helper satisfies it is arguable, but the new row removes
the fact the standard grades, without saying so. (Same pattern at round-21's measure-c1: :158-160
delegates to `selftest-c1.mjs`.)

### F6 (MEDIUM) — field predicates are shape checks, not truth checks (mutant-grounded)
On a fixture reproducing the tip verdict byte-for-byte (gates=14, nonconformant=0):
- M2 self-test flag `--selftest`→`--self-test` on the selfassessment row → `nonconformant=0`;
  the real script refuses it (`node scripts/check-selfassessment.mjs --self-test` → exit 2,
  `unknown argument`). Self-test "command and spelling" is not verified against the script.
- M5 entry `--rev`→`--revision` on the gate-registry row → `nonconformant=0`; the entry predicate is
  `len>=8` only (check-gate-registry.mjs:251).
- M6 owner `tabi L1`→`kengaku L1` → `nonconformant=0`; owner regex is a 5-term substring alternation
  (`/tabi|lane|L1|shokunin|owner/i`, :264) and matches "kengaku **L1**" — an owner that is not this lane.
- M3 pinned → nonexistent path → `nonconformant=0` (see F1).
- M1 drop declared code 3 → `nonconformant=0` (see F2).
The C2 sibling gate covers only a fraction of this: its m1 class scans `SCORECARD.md` only
(check-selfassessment.mjs:27, :194-213) — the registry rows' own `(cases=N)` tallies in SKILL.md are
verified by neither instrument.

### F7 (LOW) — supersession claim holds where rows existed, but the paragraph overreaches
- "It supersedes earlier rows for the same gate" is true for 6 of 11 (freshness, sources,
  claim-record, round-contract, user-contract, aria — instrument shows `rows` 2/2/2/2/3/3 at the
  tip). For check-adjacency, check-measurement-binding, round-evidence-audit there was no earlier
  gate-kind row (the block itself says so — those create, not supersede); check-gate-registry and
  check-selfassessment are new gates. Harmless but imprecise.
- "no earlier byte is edited": `git diff 573c99e..ad125e8 -- SKILL.md | grep -c '^-'` → **0**; 23
  added lines (11 rows + header + separator + preamble). Append-only ✓.
- Earlier-row contradictions: the two real ones (freshness "eight isolated CLI cases"→12; sources
  "25 isolated CLI cases"→26) are **explicitly marked superseded** in the new rows. All other
  surviving earlier verdicts (user 6/10 inherited-failed, aria semantic-failed, the 4-col
  1937-1940 tallies 38/45/76+13/57+18) agree with the new rows. Only F5's disclosure drop is silent.
- `check-gate-registry.mjs` header still says "15 isolated cases" (:8) though it prints
  `cases=22 passed=22` — stale internal comment; the registry row itself is correct.

## Row-by-row field verification (all 11; every count re-run at tip)

| Row (name) | flag exists & spelling | count printed at tip | verdict map complete | pinned path real at tip | verdict |
|---|---|---|---|---|---|
| closeout-pin-witness (check-freshness) | `--self-test` ✓ (:48) | cases=12 ✓ (`FRESHNESS_SELFTEST verdict=clean cases=12`) | 0/1/2 = all exits ✓ | `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json` ✓; `pins.tsv` resolves to `corpus/evidence/fleet-round-1-freshness/pins.tsv` (row names bare filename; script :12 has the real path) | ok except bare-name pin |
| sources-census | `--self-test` ✓ | cases=26 ✓ (`SOURCES_SELFTEST verdict=clean cases=26`) | ✓ | `corpus/evidence/kaika-fleet-round-1/` = 3 tracked files ✓ | ok |
| claim-record-discipline | `--self-test` ✓ | cases=9/9 ✓ (`CLAIM_SELFTEST verdict=clean cases=9/9`); entry `--file` resolves via `dirname(script)` (:24,65), runs clean from lane root (exit 0) | ✓ | `.ufo/waves/round-12/w1/mistake/expected.json` ✓ | ok |
| historical-pstack-contract | `--self-test` ✓ | cases=38 alias_checks=1 ✓ (`ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1`) | ✓ | `corpus/evidence/pstack-20261015/baseline-census.tsv` ✓; `--witness 75e7836…` resolves to a commit ✓ | ok |
| historical-user-contract | `--self-test` ✓ | cases=45 ✓ (`USER_ROUND_CONTRACT_SELFTEST … cases=45`) | ✓ | script constants; `--count-witness bebe2efc…` resolves ✓ | ok |
| aria-historical-metadata | `--self-test` ✓ | `cli_cases=36 helpers=4` ✓ (`ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4`) | 1 covers semantic failed, 2 covers tampered ✓ | `corpus/evidence/round-15/metadata/{expected-fixtures.json,mirror-contract.json}` ✓ | ok |
| adjacency-map | `--self-test` ✓ | cases=57 reasons=18 ✓ (`ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6`) | ✓ | **`corpus/knowledge/` is wrong — map is `corpus/adjacency.tsv`** | **F1** |
| measurement-binding | `--self-test` ✓ (delegates to helper) | cases=76 reasons=13 ✓ | ✓ | script table + round-15 `measurements.json` (`corpus/evidence/round-15/measurements.json` exists ✓) | **F5** (silent drop) |
| round-evidence-audit | `--selftest` ✓ | cases=13 passed=13 ✓ | 0/1/2/3 complete ✓ | CASES table ✓; c1-measurements.json exists but is **not read** | **F4** |
| gate-registry-conformance | `--selftest` ✓ | cases=22 passed=22 ✓ | **omits 3** (script exits 3 on selftest fail) | c1-measurements.json exists but is **not read** | **F2, F4** |
| selfassessment-counter | `--selftest` ✓ | cases=13 passed=13 ✓ | **omits 3** (script exits 3 on selftest fail) | c2-measurements.json exists but is **not read** | **F2, F4** |

## Reproduced claims

- `node scripts/check-gate-registry.mjs --rev ad125e8… --json` → `nonconformant=0, gates=14, rows=23` ✓
- `node scripts/check-gate-registry.mjs --rev 573c99e… --json` → `nonconformant=3` with
  `e1-missing-row` on exactly check-adjacency, check-measurement-binding, round-evidence-audit ✓
- `node scripts/check-gate-registry.mjs --selftest` → `cases=22 passed=22` ✓ (TMPDIR=/dev/shm/tabi24)

## Environment caveat (observation, not a tip defect)

With the host-mandated `TMPDIR=/home/vgpnk/tmp-tabi24`, `check-adjacency.mjs --self-test` goes **red**:
`case git-failed verdict=fail detail=reasons=[map_unreadable] expected=[git_failed]` → `verdict=failed`
exit 1. `/home/vgpnk` is itself a git worktree (`git -C /home/vgpnk rev-parse --show-toplevel` →
`/home/vgpnk`), so the self-test's "plain dir" fixture resolves the enclosing repo and fails with the
wrong reason. Under `TMPDIR=/dev/shm/tabi24` it is `verdict=clean cases=57 reasons=18`. So the
row's tally is correct at the tip; the self-test is brittle to TMPDIR inside any git worktree
(severity: low — a robustness gap in the gate, not a conformance defect in the row).

## Verdict

The eleven rows are largely **true as written** on the eight fields: every named self-test flag
exists with the stated spelling, every printed case count was re-run and matches, and every pinned
path resolves except adjacency's `corpus/knowledge/` (F1). But the instrument that certifies them is
blind to exactly the classes the task names: wrong pinned path (F1/F4), wrong self-test/entry
spelling (F6), wrong owner (F6), missing declared codes ≥3 (F2), and gate-kind rows in the lane's
own "Name / kind" shape plus scripts outside `scripts/` (F3 — the prose's "whole gate set" and
"three gates" counts are wrong under its own derivation). The two new gates this round ships are the
only two rows whose verdict maps are incomplete. The `nonconformant=0` result is therefore real on
the instrument's semantics but does not mean the eleven rows are conformant against PROTOCOL's
letter.

## Verification gaps / residual risk

- check-selfassessment.mjs m1-class only scans SCORECARD.md; registry-row tallies in SKILL.md are
  covered by no instrument (each was re-run by hand here — all matched).
- The "Name / kind" shape hides at least 5 named gates + 3 probes; whether PROTOCOL would count them
  as registered depends on a parse the instrument never performs.
- No install was needed; all commands are stock git + node v24 already on the host.
