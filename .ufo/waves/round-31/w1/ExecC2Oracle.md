# ExecC2Oracle — C2 build: the self-test oracle table (round 31, w1)

**Verdict.** In a clean clone at the freeze commit `9505a10eb80b2a0b273ebaba3f7f872ad302192d` every one of the
17 gates the counter itself calls runnable (`^scripts/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$`, 16
`check-*.mjs` + `round-evidence-audit.mjs`, none unmatched) runs its declared self-test with **exit 0** and a clean
summary; 13 of them print a `<NAME>_SELFTEST … cases=N` summary line, 3 print JSON only and are read by the counter's
`"cases":N` fallback, and 1 (`check-aria-metadata`) prints `cli_cases=36 helpers=4`, a tally the oracle's own
grammar cannot see. **Exactly one gate carries a per-case `cases=` token that differs from its summary tally**:
`check-gate-mutants` line 7 embeds a child gate's `cases=2` above its own `cases=12` — the round-30 M8 shape, live in
the tree, and the first `cases`-shaped token in that output is `2`, so a first-token reader would read 2, not 12; the
v2 summary-line rule reads 12 and therefore agrees with the claim. The frozen counter run at REV exits **1** with
**mismatches 9, counted 9**, byte-identical across two runs (superseded 20, couldNotEvaluate 103, clean false) — the
nine stale tallies are exactly the nine frozen in claims.json, each with the claimed token and the observed tally I
verified independently against the gates' own output. Two calibration blind spots are documented below (an
unreadable tally shape and 24 ambiguous claims); neither changes the target, and neither is repaired here.

## Deliverables

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ExecC2Oracle/`
(`SHA256SUMS` covers every file; `COMMANDS.md` holds commands, exit codes, environment, run window)

| File | What |
|---|---|
| `oracle.tsv` | 17 rows, one per gate: flag, exit, verbatim summary line, N, oracle branch + tally, first `cases`-shaped token, every other `cases=` token with its line, prefixed invisible token, agreement flag, note |
| `counter-selfassessment-rev.json` | counter output at REV, run 1 (77238 bytes) |
| `counter-selfassessment-rev-run2.json` | identical run 2, for stability |
| `counted-mismatches.tsv` | the 9 non-superseded observed≠claimed findings |
| `ambiguous-claims.tsv` | the 24 claims reported `could-not-evaluate (ambiguous script association)` with their section, scripts and tallies |
| `logs/<gate>.{out,err,exit}` | raw self-test streams and exit codes, 51 files |

## Commands and exit codes

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                       exit 0
git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d                          exit 0
git -C "$S/clone" rev-parse HEAD                -> 9505a10e…acf3bc                              exit 0
git -C "$S/clone" status --porcelain | wc -l    -> 0                                            exit 0
sha256sum scripts/check-selfassessment.mjs      -> 143d66ff…b2fce  (= claims.json frozenDigests) exit 0
sha256sum scripts/check-decision-table.mjs      -> d15f3bd7…f6832  (= claims.json frozenDigests) exit 0
(cd "$S/clone" && TMPDIR="$S/tmp" timeout 900 node <script> <flag>) >out 2>err                  17/17 exit 0
node scripts/check-selfassessment.mjs --rev 9505a10eb80b2a0b273ebaba3f7f872ad302192d --json       exit 1
```

Run window for the self-tests: `2026-10-26T08:38:26Z .. 2026-10-26T08:38:31Z` (xargs -P 3, TMPDIR=$S/tmp).
Counter runs: `2026-10-26T08:38:05Z` and `2026-10-26T08:40:25Z`; both outputs sha256 `b5ec0f19…dcf84`,
`counted` arrays identical. node v24.21.0. No tool installs or upgrades were made (none needed).

## The oracle table (all 17 gates, exit 0)

| gate | flag | summary line (verbatim) | N | oracle reads | other `cases=` tokens |
|---|---|---|---|---|---|
| check-adjacency | `--self-test` | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | 57 | summary-line 57 | — |
| check-aria-metadata | `--self-test` | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` | **none** | **none → could-not-evaluate** | `cli_cases=36` (no `\b` before `cases`) |
| check-bfcache-receipt | `--selftest` | — (JSON only) | 17 | fallback `"cases":17` | — |
| check-decision-table | `--selftest` | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` | 34 | summary-line 34 | — |
| check-freshness | `--self-test` | `FRESHNESS_SELFTEST verdict=clean cases=12` | 12 | summary-line 12 | — |
| check-frontier-admission | `--selftest` | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24` | 24 | summary-line 24 | — |
| check-gate-mutants | `--selftest` | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` | 12 | summary-line 12 | **L7 `cases=2`** |
| check-gate-registry | `--selftest` | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` | 22 | summary-line 22 | — |
| check-measurement-binding | `--self-test` | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | 76 | summary-line 76 | — |
| check-release-pins | `--selftest` | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` | 29 | summary-line 29 | — |
| check-round-contract | `--self-test` | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` | 38 | summary-line 38 | — |
| check-s106-evidence | `--selftest` | `S106_SELFTEST verdict=clean cases=10 passed=10` | 10 | summary-line 10 | — |
| check-selfassessment | `--selftest` | `SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30` | 30 | summary-line 30 | — |
| check-source-reopen-receipt | `--selftest` | — (JSON only) | 18 | fallback `"cases":18` | — |
| check-sources | `--self-test` | `SOURCES_SELFTEST verdict=clean cases=26` | 26 | summary-line 26 | — |
| check-user-round-contract | `--self-test` | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 …` | 45 | summary-line 45 | — |
| round-evidence-audit | `--selftest` | — (JSON only) | 13 | fallback `"cases":13` | — |

For every gate where the oracle takes the summary line, `oracle_tally == N` (13/13). The 3 JSON gates' fallback
`"cases":N` equals their `"passed"` field.

**The one differing per-case token.** `logs/check-gate-mutants.out:7`:
`CASE id=pristine-not-clean-could-not-evaluate … refusal=pristine self-test of scripts/toy-gate.mjs is not clean
(exit=3 cases=2 passed=1 timed_out=false failing=broken) PASS`. It precedes the summary line (line 13) and is the
**first** `cases`-shaped token in the output. Two documents state the gate's live tally — `SKILL.md:2558`
(`cases=12, passed=12`) and `SCORECARD.md:1527` (`12/12`) — so a first-token reader would report a false mismatch
(2 vs 12) on both; the v2 summary-line rule reads 12 and both are measured clean (`observed 12 = claimed 12`,
not superseded). No other gate's non-summary output contains a `cases=` token at all (16/17 gates: none).

## The 9 findings (observed ≠ claimed, not superseded) — `counted-mismatches.tsv`

| doc:line | claimed token | claimed | observed | gate |
|---|---|---|---|---|
| SKILL.md:1614 | `25 isolated CLI cases` | 25 | 26 | check-sources |
| SKILL.md:2479 | `cases=13` | 13 | 30 | check-selfassessment |
| SKILL.md:2514 | `cases=5` | 5 | 10 | check-s106-evidence |
| SKILL.md:2515 | `cases=17` | 17 | 30 | check-selfassessment |
| SKILL.md:2529 | `7 cases` | 7 | 10 | check-s106-evidence |
| SKILL.md:2530 | `20 cases` | 20 | 30 | check-selfassessment |
| SKILL.md:2543 | `cases=20` | 20 | 29 | check-release-pins |
| SKILL.md:2544 | `cases=7` | 7 | 10 | check-s106-evidence |
| corpus/README.md:613 | `cases=17` | 17 | 30 | check-selfassessment |

Identical to claims.json §C2 `before`, doc, line, claimed and observed, including the direction (claimed < observed
in all nine). Every observed value equals the gate's own tally in the table above — the counter and my direct runs
agree on 9/9. 174 findings total: 9 counted, 20 superseded, 103 could-not-evaluate, 42 measured-and-matching.

## Risks and blind spots (reported, not repaired)

1. **A tally shape neither grammar reads.** `check-aria-metadata` summarizes as `cli_cases=36 helpers=4`; the
   summary regex requires `\bcases`, and `_` is a word character, so the oracle reports *could-not-evaluate
   ("self-test printed no tally")*, never a comparison. The claim grammars have the same gap, so the two documents
   that state this tally produce **no finding at all** (checked: zero findings at `SKILL.md:2474` and
   `SCORECARD.md:1199`). Both statements are correct today (36 CLI + 4 helper cases, matching the run), but they are
   unmeasured: a future drift in that gate would be invisible to this counter.
2. **24 claims are could-not-evaluate ("ambiguous script association")** — `ambiguous-claims.tsv`. 8 match a gate
   named in their own section (so they would pass if associated); 16 match none, and inspection shows they are
   historical or quoted text, not present-tense claims: LOG.md round entries recording tallies of their day
   (`LOG.md:471` `cases=4`, `:484` `cases=25`), quoted pre-hardening receipts (`corpus/README.md:358` `43 cases`,
   `:359` `59 cases`), scripts outside the gate set (`webmcp-*`, `freshness-witness`), and the round-30 correction
   prose at `SCORECARD.md:1555/1556`, which **quotes** `cases=12 passed=12` and `cases=2 passed=1`. That last pair is
   a second live M8 trap: the `cases=2` in SCORECARD.md:1556 would be a false mismatch against check-gate-mutants if
   the line were associated; only the ambiguity rule keeps it out of the count. `SKILL.md:2579` (new round-31
   section) contains `22-case` as historicizing prose about the pre-v2 tally and is likewise ambiguous, correctly
   not counted.
3. **3 claims name scripts outside the runnable set** (`selftest-measurement-binding.mjs`, `freshness-witness.mjs`,
   `webmcp-invoke-round18.mjs`) — no oracle exists for them by design.
4. Nothing in the target is disturbed: the C2 predicate is `mismatches = 0` after append-only corrections; the
   freeze-time reading is 9 and the oracle's mapping from cited line to gate is unambiguous for all nine.

## Axes (Godspeed)

Cheap iterations kept: split-stream re-run to make tally extraction exact rather than interleaved; a second identical
counter run to prove the reading is stable; extraction of each stale line's claim token to confirm the claimed
numbers; an enumeration of the 103 could-not-evaluate findings to locate the counter's coverage boundary. No move
was kept that weakened a reading; nothing in the lane, the fleet repo, `scripts/` or any sibling lane was written.
