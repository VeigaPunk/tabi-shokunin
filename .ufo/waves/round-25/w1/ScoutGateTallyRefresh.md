# ScoutGateTallyRefresh — lane gate self-test tally at 9e13666

Seat: L1Tabi25.ScoutGateTallyRefresh (scout, read-only). Date 2026-10-25.

## Verdict

All ten lane gate self-tests pass with the flag each script accepts. Every tally token matches the figure cited in the canonical registry rows (`SKILL.md` lines 2469-2479). Stdout is identical between a lane-cwd run and a `/tmp`-cwd run. strace shows zero writes outside `/tmp`, `/var/tmp` or `/dev`, and every temp dir the runs created was removed.

One isolation caveat: `check-measurement-binding.mjs --self-test` resolves its repo from cwd. From `/tmp` with no `--repo` it fails closed (exit 2, `git_failed`). With `--repo <lane>`, the only extra flag `--self-test` accepts, it is clean (76/13).

## Revision binding (observed)

- Lane HEAD at run time: `c8ef3084c6363f265b9d23285296ab3547654f57`. Its only child of baseline `9e13666` is "round-25: freeze claims, controls, census-before, wave-1 spec", which touches only `.ufo/waves/round-25/**` (7 files).
  Commands: `git log --oneline 9e13666..HEAD`, `git diff --stat 9e13666 HEAD`, `git diff --stat 9e13666 HEAD -- scripts SKILL.md` (empty).
- All ten scripts and `SKILL.md` are byte-identical to baseline. `git rev-parse 9e13666:scripts/<s>.mjs` equals `git hash-object scripts/<s>.mjs` for each one, and `SKILL.md` is `81ae1ff0f710f2c9555cbbafa81b947285f6778e` on both sides. So the runs exercised exactly the bytes at `9e13666`, and no checkout was needed.
- Self-tests build their own fixture repos. Except for the measurement-binding repo resolution, none read lane content that differs between `9e13666` and HEAD.

## Tally table

Runner: `.ufo/waves/round-25/scratch/ScoutGateTallyRefresh/run.sh <label> <cwd>`. Each script runs as
`strace -f -qq -y -s 512 -o <out>/<s>.strace -e trace=openat,open,creat,mkdir,mkdirat,rename,renameat,renameat2,unlink,unlinkat,rmdir,link,linkat,symlink,symlinkat,truncate,chdir,fchdir,clone,clone3,fork,vfork node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/<s>.mjs <flag>`.
Both arms ran concurrently: `lane` with cwd at the lane root, `tmp` with cwd `/tmp`. Exits come from `<out>/exits.tsv`. Tally tokens are the last summary line of stdout; stderr was 0 lines in every run.

| script | flag | exit lane | exit /tmp | tally token | registry cite (SKILL.md) | isolation note |
|---|---|---|---|---|---|---|
| check-gate-registry.mjs | `--selftest` | 0 | 0 | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` | L2478 cases=22, passed=22 ✓ | 42 `/tmp/tabi-gate-registry-*` dirs; 0 outside writes |
| check-selfassessment.mjs | `--selftest` | 0 | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=13 passed=13` | L2479 cases=13, passed=13 ✓ | 42 `/tmp/tabi-selfassessment-*`; 0 outside |
| check-sources.mjs | `--self-test` | 0 | 0 | `SOURCES_SELFTEST verdict=clean cases=26` | L2470 cases=26 ✓ | 2 `/tmp/tabi-sources-selftest-*`; 0 outside |
| check-measurement-binding.mjs | `--self-test` | 0 | **2** (no `--repo`); 0 with `--repo <lane>` | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | L2476 cases=76, reasons=13 ✓ | cwd-dependent repo resolution (below); 152 `/tmp/tabi-binding-selftest-*` + `-norepo-`/`-parent-`; 0 outside |
| round-evidence-audit.mjs | `--selftest` | 0 | 0 | JSON `{"schema":"tabi-round-evidence-audit-v1-selftest","passed":13,"inventoryOk":true,"clean":true}` | L2477 cases=13, passed=13 ✓ | in-memory suite: 0 write-class syscalls |
| check-adjacency.mjs | `--self-test` | 0 | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | L2475 cases=57, reasons=18 ✓ | `/tmp/tabi-adjacency-selftest-*`, `-norepo-*`; 0 outside |
| check-round-contract.mjs | `--self-test` | 0 | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` | L2472 cases=38, alias_checks=1 ✓ | uses `/var/tmp` (`tabi-round-contract-*` ×76, `-alias-`, `-count-witness-`), not `os.tmpdir()`; 0 outside |
| check-user-round-contract.mjs | `--self-test` | 0 | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` | L2473 cases=45 ✓ | uses `/var/tmp` (`tabi-user-round-contract-*` ×70, `-alias-`, `-count-witness-`, `-diagnostic-witness-`); 0 outside |
| check-aria-metadata.mjs | `--self-test` | 0 | 0 | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` (61 `result=PASS`, 0 `result=FAIL`) | L2474 cli_cases=36, helpers=4 ✓ | `/tmp/tabi-r15-aria-metadata-*`, `/tmp/tabi-r15-mirror-witness-*`; 0 outside |
| check-freshness.mjs | `--self-test` | 0 | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` | L2469 cases=12 ✓ | `/tmp/tabi-freshness-selftest-*`; 0 outside |

Durations of the lane arm under strace, from `exits.tsv`: gate-registry 662ms, selfassessment 674ms, sources 579ms, measurement-binding 8556ms, round-evidence-audit 27ms, adjacency 4849ms, round-contract 13661ms, user-round-contract 17987ms, aria-metadata 1833ms, freshness 876ms. The two arms ran together and took 49.72s wall.

Not run (out of scope; not a plain self-test): `round-evidence-audit.mjs --selftest --rev REV --round N --round-cap SEATS`. That variant is the evidence-keyed matrix, which needs a fleet report and policy (L2477, second clause).

## /tmp repeat: stability

- Command: for each stdout, `diff <(sed -E 's#/(var/)?tmp/tabi-[A-Za-z0-9._-]+#<TMP>#g' lane/<s>.stdout) <(... tmp/<s>.stdout)`. For measurement-binding the comparison file is `tmp-repo/`.
- Result: `difflines_tmpnorm_only=0` for all ten. The only normalization is random temp-dir names; SHA-256 digests were not masked.
- **measurement-binding from `/tmp`** (observed): `cd /tmp && node .../check-measurement-binding.mjs --self-test` exits 2 with stdout
  `MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0` / `finding claim=- reason=git_failed detail=git rev-parse --show-toplevel failed (status=128) stderr=fatal: not a git repository ...`.
  The source explains this. `main()` calls `runSelfTest(resolveRepo(options.repo))`, and `resolveRepo` falls back to `process.cwd()` (scripts/check-measurement-binding.mjs ~L335-342, L912-922). The parser accepts only `--repo` alongside `--self-test` (`'--self-test accepts only --repo'`).
  `cd /tmp && strace ... node .../check-measurement-binding.mjs --self-test --repo /home/vgpnk/Projects/shokunin/tabi-shokunin` exits 0 with `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13`, and its stdout is identical to the lane arm.
  This is fail-closed, not fail-open. [INFERENCE] The registry entry `node scripts/check-measurement-binding.mjs --self-test` (L2476) is only reproducible when cwd is inside the lane worktree. The other nine scripts resolve the lane from `import.meta.url` and are cwd-independent.

## Writes outside a temp dir

- Method: `node .ufo/waves/round-25/scratch/ScoutGateTallyRefresh/writes.mjs <trace> <initial cwd>`, run over all 21 traces (10 lane, 10 `/tmp`, 1 `tmp-repo`). It tracks per-process cwd through clone/fork, chdir and fchdir, and resolves `AT_FDCWD<path>` and dirfd paths decoded by `strace -y`. It classifies every `openat` with `O_WRONLY|O_RDWR|O_CREAT|O_TRUNC`, every `creat`, `mkdir*`, `unlink*`, `rmdir`, `rename*` target, `link`, `symlink*` and `truncate`. A path counts as temp if it is under `/tmp/`, `/var/tmp/`, `/dev/` or `/proc/`.
- Result: `outside=0` in all 21 traces. Total classified writes per lane trace range from 0 (round-evidence-audit) to 39086 (round-contract).
- Parser cross-check: a raw grep of the same write-class syscalls gives counts at or below the parsed counts (e.g. adjacency 3958 raw vs 4002 parsed; the gap is resumed `<unfinished>` calls). So nothing was dropped. Caveat: the parser keeps failed calls (e.g. `openat /dev/tty O_RDWR = -1 ENXIO` in round-contract), which can only inflate counts, never hide an outside write.
- Cleanup: `grep -oE '/(var/)?tmp/tabi-[A-Za-z0-9._-]+'` over all traces names 408 distinct top-level temp dirs. None exist after the runs (`leftover=0`).
- Lane tree: `git status --porcelain --untracked-files=all` before (7 lines) and after differs only by new `.ufo/waves/round-25/w1/*.md` reports, `swarm-registry.json`, and untracked `scripts/check-bfcache-receipt.mjs` and `scripts/check-source-reopen-receipt.mjs`. `find <lane> -newer marker` also lists sibling scratch trees. None of these come from the traced processes (outside=0); they are concurrent sibling seats' work. HEAD is still `c8ef308`.

## Gate-registry rows in SKILL.md

Command as asked: `grep -n 'gate / tabi' SKILL.md`, on a working-tree blob identical to baseline. It returns **8 rows, 6 distinct names**:

| line | name |
|---|---|
| 1559 | closeout-pin-witness |
| 1614 | sources-census |
| 1657 | claim-record-discipline |
| 1677 | historical-pstack-contract |
| 1678 | historical-user-contract |
| 1755 | aria-historical-metadata |
| 1800 | historical-user-contract (supersedes 1678) |
| 1801 | aria-historical-metadata (supersedes 1755) |

The duplicate count comes from `git show 9e13666:SKILL.md | grep 'gate / tabi' | awk -F'|' '{gsub(/ /,"",$2);print $2}' | sort | uniq -c | awk '$1>1'`, which lists the two names that appear twice.

This grep only matches the legacy `gate / tabi` kind spelling, so it undercounts the registry. Two fuller views:

- **Canonical consolidated table** (header at L2467, `| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |`) has 11 `gate` rows, L2469-2479: closeout-pin-witness, sources-census, claim-record-discipline, historical-pstack-contract, historical-user-contract, aria-historical-metadata, adjacency-map, measurement-binding, round-evidence-audit, gate-registry-conformance, selfassessment-counter.
  Command: `git show 9e13666:SKILL.md | grep -nE '^\| *[A-Za-z0-9`._/-]+ *\| *(gate|probe)( / [a-z]+)? *\|'`. Total kind rows from that command: 19 = 8 legacy + 11 canonical.
- **The gate's own derivation**: `cd /tmp && node .../check-gate-registry.mjs --rev 9e13666759bcf30665abec84dec13adefc1fa86a --json` exits 0 with `"rows": 23`, 14 gates, `"nonconformant": 0`, `"clean": true`. Its 14 gates are the 10 `scripts/` gates plus 4 wave-local ones: `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs`, `.ufo/waves/round-21/measure-c1.mjs`, `.ufo/waves/round-22/check-review-chronology.mjs` and `.ufo/waves/round-22/measure-c1.mjs`. [INFERENCE] The 23 rows include gate rows from all three canonical-header tables (L2388, L2433, L2467) plus the legacy rows, under its latest-row-wins rule.

## Observed vs inference vs unknown

- Observed: exits, tally tokens, stdout equality, strace write classification, temp cleanup, the three registry counts above.
- Inference: measurement-binding's registry command needs the lane as cwd. The 23-row composition is inferred from the header lines, not enumerated row by row.
- Unknown: whether the scorecard rows cite the `grep 'gate / tabi'` count (8) or the gate's own count (23 rows / 14 gates). Integrators should cite the one the row's command actually produces.

## Tooling

No installs or updates. `bc` is absent (my first runner used it for timing), so timing uses bash arithmetic instead. Nothing was filed; pacman guard respected. `strace 7.2` and `node v24.21.0` were already present.

## Scratch (throwaway)

`.ufo/waves/round-25/scratch/ScoutGateTallyRefresh/`: `run.sh`, `writes.mjs`, `lane/`, `tmp/`, `tmp-repo/` (stdout, stderr, strace, exits.tsv), status before and after, `tempdirs.txt`. A first launch with detached `&` subshells was reaped before any script ran and left no output. All processes from the final runs ran in the foreground and exited.
