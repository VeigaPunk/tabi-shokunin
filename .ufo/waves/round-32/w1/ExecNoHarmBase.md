# ExecNoHarmBase — round 32 / w1 — no-harm baseline at the freeze

## Verdict

At the round-32 freeze commit `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`, in a clean
(`git status --porcelain` = 0 lines) shared clone, every gate named in this seat's matrix is
green: all **8 production gates exit 0** with `clean`/`valid` verdict lines, and **all 20 lane
selftests exit 0** with tallies that match the registry (`bidi 27/27`, `selfassessment 41/41`,
`measurement-binding 76`, `adjacency 57`, `sources 26`, …). The frozen counter bytes are
byte-identical to `claims.json` `frozenDigests` and unchanged since the counter-freeze commit
`5ad1fcbf` (`git diff --name-only 5ad1fcbf HEAD -- <both counters>` = empty). Two claim-counter
"before" readings reproduce the frozen controls exactly: bidi offline `population=0 … exit 1`
and selfassessment `mismatches=18` (3× m4 `active`, 15× m1 stale `41`-case tallies). One gate is
red at the freeze and it is **inherited, not new**: `check-user-round-contract.mjs` production
exits 1 with `finding=history_rewritten detail=Pstack bytes changed: A corpus/lessons/round-18.md`
— the round-18 lesson was added at `530f40a` and then modified at `c0aff23` and `01531da`, so the
gate's added-legacy-lesson leg refuses it; LOG.md:1286/1304/1454/1481 record this red as inherited
and explicitly skipped in rounds 20–31, and LOG.md:1187 rules the refusal growth 1→2 as an
inherited process violation to DOCUMENT. The shrink/grow of that red is the only pre-existing
red in this baseline; nothing else is red, and no lane byte, index, counter or config was touched.

## Provenance

- Lane clone (one live clone, seat-scoped): `/fast/scratch/hyaku/tabi-r32/ExecNoHarmBase/clone`,
  `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin`, `checkout --detach
  4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`; subsequent `git rev-parse HEAD` =
  `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`; `git status --porcelain | wc -l` = `0`.
- `TMPDIR=/fast/scratch/hyaku/tabi-r32/ExecNoHarmBase/tmp` on every run (both selftest suites make
  their own fixture trees there and remove them).
- Counter identity at the clone:
  `sha256sum scripts/check-bidi-runtime.mjs` = `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`;
  `sha256sum scripts/check-selfassessment.mjs` = `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`
  — both equal `claims.json:frozenDigests`; `git diff --name-only
  5ad1fcbfbae947e56ed448c7d24af0632b534e80 HEAD -- scripts/check-bidi-runtime.mjs
  scripts/check-selfassessment.mjs` = empty (0 files).
- No network was used by any command below (the frontier and decision-table gates ran without
  `--live`). No chromium/chromedriver was started by this seat.
- Receipts (verbatim stdout/stderr of every command): `ExecNoHarmBase/receipts/` (36 files +
  `provenance.txt`).

## Matrix — production gates at the freeze

| Gate | Command (cwd = clone) | Verdict line | Exit |
|---|---|---|---|
| gate-registry | `node scripts/check-gate-registry.mjs --rev HEAD` | `GATE_REGISTRY verdict=clean rev=4181fffb… rows=40 gates=22 nonconformant=0 findings=0` | 0 |
| sources | `node scripts/check-sources.mjs` | `SOURCES_GATE verdict=clean rows=122 tiers=A:107,B:6,C:9 status=queued:15,mined:98,rejected:9 findings=0 file=corpus/SOURCES.md` | 0 |
| release-pins | `node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47` | `RELEASE_PINS verdict=clean rev=4181fffb… stable=156.0.8078.47 population=23 resolved=23 unresolved=0 holds=16 drifted=7` | 0 |
| s106-evidence | `node scripts/check-s106-evidence.mjs --rev HEAD` | `S106_EVIDENCE verdict=valid rev=4181fffb… present=true sha_match=true anchor_located=true valid=true` | 0 |
| bfcache-receipt | `node scripts/check-bfcache-receipt.mjs --rev HEAD` | `{"schema":"tabi-bfcache-journey-v1","rev":"4181fffb…","valid":true,"restores":1,"findings":[],"clean":true,"exit":0}` | 0 |
| frontier-admission (offline) | `node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26` | `FRONTIER_ADMISSION verdict=clean … live=false population=2 admitted=2 failing=0` | 0 |
| decision-table (offline) | `node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md` | `DECISION_TABLE verdict=clean … live=false population=13 admitted=13 failing=0` | 0 |
| sources-census | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/tabi-r32/ExecNoHarmBase/clone/corpus/SOURCES.md` | 19 × `file W04 duplicate url … across scopes` then `file ok …/corpus/SOURCES.md` (W04 is an advisory class; no `E`-class finding) | 0 |

`rev=` in each line is the full `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (abbreviated in this
table only); the receipts carry the untruncated lines.

## Matrix — every lane `--selftest`/`--self-test` (exit 0, tallies)

| Script | Flag | Tally line | Exit |
|---|---|---|---|
| check-adjacency.mjs | `--self-test` | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | 0 |
| check-aria-metadata.mjs | `--self-test` | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` | 0 |
| check-bfcache-receipt.mjs | `--selftest` | `{"schema":"tabi-bfcache-selftest-v1","cases":17,"passed":17,…}` | 0 |
| check-bidi-runtime.mjs | `--selftest` | `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` | 0 |
| check-decision-table.mjs | `--selftest` | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` | 0 |
| check-freshness.mjs | `--self-test` | `FRESHNESS_SELFTEST verdict=clean cases=12` | 0 |
| check-frontier-admission.mjs | `--selftest` | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24` | 0 |
| check-gate-mutants.mjs | `--selftest` | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` | 0 |
| check-gate-registry.mjs | `--selftest` | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` | 0 |
| check-measurement-binding.mjs | `--self-test` | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | 0 |
| check-release-pins.mjs | `--selftest` | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` | 0 |
| check-round-contract.mjs | `--self-test` | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` | 0 |
| check-s106-evidence.mjs | `--selftest` | `S106_SELFTEST verdict=clean cases=10 passed=10` | 0 |
| check-selfassessment.mjs | `--selftest` | `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41` | 0 |
| check-source-reopen-receipt.mjs | `--selftest` | `{"schema":"tabi-source-reopen-selftest-v1","cases":18,"passed":18,…}` | 0 |
| check-sources.mjs | `--self-test` | `SOURCES_SELFTEST verdict=clean cases=26` | 0 |
| check-user-round-contract.mjs | `--self-test` | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` | 0 |
| freshness-witness.mjs | `--self-test` | `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0` | 0 |
| round-evidence-audit.mjs | `--selftest` | `"cases": 13, "passed": 13` (JSON) | 0 |
| selftest-measurement-binding.mjs | — | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | 0 |

Note (seat-side, not a lane defect): the first `check-sources.mjs --selftest` invocation used the
hyphen-less flag, which that gate refuses as `bad_arguments` (`could_not_evaluate`, exit 2). Its
flag is `--self-test`; the corrected run above exits 0 with `cases=26`. The wrong-flag output was
not retained to a file (its log path was reused by the corrected run) and is quoted here verbatim
from the console: `FINDING id=could_not_evaluate fleet=- row=- detail=bad_arguments` /
`SOURCES_GATE verdict=could-not-evaluate rows=0 tiers=A:0,B:0,C:0
status=queued:0,mined:0,rejected:0 findings=1 file=corpus/SOURCES.md`.

## Annex — other offline production modes + the round's own claim counters

| Gate | Command | Verdict line | Exit |
|---|---|---|---|
| source-reopen-receipt | `node scripts/check-source-reopen-receipt.mjs --rev HEAD` | `{"schema":"tabi-source-reopen-v1","rev":"4181fffb…","reopened":6,"resolved":6,"unresolved":0,"findings":[],"clean":true,"exit":0}` | 0 |
| aria-historical-metadata | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | `ARIA_METADATA check verdict=clean findings=28 failed=0 accepted=true … reason=clean` | 0 |
| historical-pstack-contract | `node scripts/check-round-contract.mjs` | `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` | 0 |
| **historical-user-contract** | `node scripts/check-user-round-contract.mjs` | `USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: A\tcorpus/lessons/round-18.md` | **1** |
| adjacency-map | `node scripts/check-adjacency.mjs --at 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 --fleet /home/vgpnk/Projects/shokunin` | `ADJACENCY verdict=clean rows=10 verified=10` | 0 |
| measurement-binding | `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-21/measurement-binding.json --at 2d5eaaa3c8317bce31e1180b49df4516db35d44b` | `MEASUREMENT_BINDING verdict=clean claims=1 bound=1` | 0 |
| C1 before (offline) | `node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md` | `BIDI_RUNTIME verdict=failed … population=0 admitted=0 failing=0 entry=e1-entry-absent live=false` | 1 |
| C2 before | `node scripts/check-selfassessment.mjs --rev HEAD` | `SELFASSESSMENT verdict=failed … mismatches=18 could_not_evaluate=104 superseded=21` | 1 |

C2 class decomposition of that 18 (from the same receipt): **3** ×
`m4-nudge-state claimed=inactive observed=active` at `SCORECARD.md:1473`, `:1515`, `:1576`, and
**15** × `m1-selftest-tally` rows whose claimed tally is stale against the gate's own 41-case
output, exactly: `SCORECARD.md:1439 claimed=17`, `:1465 claimed=22`, `:1486 claimed=22`,
`:1564 claimed=30`; `SKILL.md:2479 claimed=13`, `:2515 claimed=17`, `:2530 claimed=20`,
`:2545 claimed=22`, `:2576/2578/2590/2594/2598 claimed=30`; `corpus/README.md:613 claimed=17`,
`:668 claimed=30` — every one `observed=41`. Five further m4 rows read
`claimed=inactive observed=inactive` (agreeing, still printed), 21 m1 rows are `superseded` and 104
findings are `could-not-evaluate`; none of those are counted as mismatches. This reproduces
`baseline/c2-J1-do-nothing` exactly (18 = 3 m4 + 15 m1) and the C1 receipt `c1-J1-do-nothing`
(population 0, admitted 0, exit 1).

Not run, with reason (honesty: an unrun check has not passed):

- `check-freshness.mjs --worktree` and `--witness REV`: both read host-public plugin files
  (`/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/…`) plus committed pins; that is host
  state outside the lane, so its verdict is not a lane-bytes no-harm fact (the registry calls
  `--worktree` "candidate only"). Its selftest is clean (cases=12).
- `round-evidence-audit.mjs` production mode (`--rev REV --round N --round-cap <seats>`): it is
  round-scoped and round 32 has no integrated artifacts yet; its selftest is clean (13/13).
- `check-measurement-binding.mjs` against a *round-32* manifest: no round-32 manifest exists at the
  freeze (only `corpus/evidence/round-17/` and `.ufo/waves/round-17..21/`), so the gate was
  exercised against the newest committed one at its own bound revision (clean, above).

## Findings and risks for the L1

1. **Inherited USER red, one file-specific cause.** `history_rewritten` names
   `corpus/lessons/round-18.md`, whose history is: added `530f40a` (2026-10-20 16:58), then
   `--diff-filter=MDRT` commits `c0aff23` (17:58) and `01531da` (18:04). `lessonDrift` returns the
   drift because the file is absent at `HARD_BASELINE 7f506af` and touched M/D/R/T between
   `PSTACK_PIN 92d700d` and the lane tip (`scripts/check-user-round-contract.mjs:333-342`,
   `:411-418`). This is documented as inherited (LOG.md:1286, :1304, :1454, :1481; ruling at
   LOG.md:1187) — I did **not** repair it and it is outside C1/C2.
2. **Registry/expected-finding text is stale for that gate.** SKILL.md:1678/1800/1938/2473 and
   SCORECARD.md:416 paint the production verdict as `round_count 6/10`; the frozen production
   output is `history_rewritten … round-18.md`, i.e. the gate refuses *before* it ever counts
   (`pstackDrift` runs in `checkHistory`, before `round_count`). Anyone re-running it this round
   must expect exit 1 with `history_rewritten`, not `round_count`. (Calibration observation only;
   not claimed, and no C2 correction covers it.)
3. **Census advisories are stable, not new:** 19 `W04 duplicate url … across scopes` lines, exit 0.
   They are advisories the census classifies as `ok`; no E-class finding at the freeze.
4. **Foreign processes observed, none mine:** `pgrep -fa 'chromedriver|chromium'` at the moment of my
   final check listed `4191529 /usr/bin/chromedriver --port=46741` plus the unrelated `earlyoom`
   line; a later check (after my scratch was deleted) shows a sibling's live BiDi run
   (`1621789 chromedriver --port=36601` and chromium children with
   `--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecPyClient/…`). Those are other seats' processes
   and the list changes between runs; this seat started **no** chromium/chromedriver and killed
   none.
5. No scratch residue: `/fast/scratch/hyaku/tabi-r32/ExecNoHarmBase` (clone, tmp, out) is removed
   after the receipts were copied; receipts are under `ExecNoHarmBase/receipts/`. No tool was
   installed or updated. No lane tracked file, lane index, jj state, fleet repo or sibling lane was
   written; the only writes are this report and the seat output dir.
