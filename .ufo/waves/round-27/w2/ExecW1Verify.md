# ExecW1Verify — mechanical verification of wave-1 claims

Seat: read-only verifier; lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Re-runs performed against the live checkout on 2026-10-25. No tool installed or upgraded. Only this report was written; no tracked paths or git state were changed intentionally.

## Axes

- **Reproducibility:** reported counts and selftests reproduce from exact commands.
- **Binding:** results concern the named revision/artifact, not an assumed live state.
- **Coverage:** wave-1 claims with measurable outputs are represented below; claims without commands are explicitly unverifiable.

## Mechanical agree/disagree table

| Seat / artifact | Claimed | Observed | Result |
|---|---|---|---|
| ExecSelftestSweep | 13 named gate selftests clean; C1=17, C2=5; registry nonconformant=0 | Commands below: all named tallies observed as claimed except `check-bfcache-receipt` emitted 17/17; its report claimed 17. Every suite exited 0. Gate registry at `5ed6484` returned `nonconformant=0`, clean=true. | Agree on counts/registry; see C1 note re live m3 |
| ExecC1Baseline / ExecC1Attacks | C1 counter at `4ad4c77`: six mismatches including five LOG; tip invalid due uncorrected `LOG.md:221` | Re-run `node scripts/check-selfassessment.mjs --rev 4ad4c77... --json` reported mismatches=6 (five LOG findings plus live m3). At `f185b4e`, mismatches=5. At `5ed6484`, mismatches=1, sole counted item m3. The `LOG.md:221` finding is marked superseded in shipped output; prior attacks show that the clearance is unsound because the cited later paragraphs do not cite line 221. | Agree with attack's substantive falsification. Counter total is live-tree-dependent. |
| ExecC2Reopen / ExecC2Controls | C2 valid=true; selftest 5/5; missing bytes/receipt fail closed | `node scripts/check-s106-evidence.mjs --rev 5ed6484... --json` returned `present=true, sha_match=true, anchor_located=true, anchor_unique=true, byte_count_match=true, valid=true`. `--selftest` returned 5/5; the selftest includes missing bytes and missing receipt exit 2. | Agree at named revision |
| ExecCensusMirror | S124 staged mirror exit 1 E09; transformed S107 mirror exit 0; real census exit 0/107 rows | Full mirror runs were not repeated here. Real `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi --today 2026-10-25` returned `tabi ok`, 16 W04 warnings, and `CENSUS_EXIT=0`. S107 row count via `git show 5ed6484...:corpus/SOURCES.md | grep -cE '^\\|[[:space:]]*S[0-9]{3,}[[:space:]]*\\|'` returned 107. | Agree for real census; mirror claims not rerun |
| ExecReportContract | report utility accepts fleet round-26 report, 6 sections / SHONEN 4/4 | Re-run `node .../scratch/ExecReportContract/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md` → PASS, 6/6 sections, SHONEN 4/4, exit 0. | Agree |
| RevEntryC3 / RevSourcesS107 / CritC3Junk | one entry cites S107; S107 registry row and entry source assertions | `git grep -lE '^source: S107 ' 5ed6484... -- corpus/knowledge | wc -l` → 1. Count of registry rows from same rev → 107. The review reports disagree about the junk-detection mechanism by design: the frozen count is source-line-only, so junk fixture can satisfy it; the independent critic's fixture demonstrates this. | Agree on counts; counter does not measure quote quality |
| ExecQualityGate / CritAssimProcess | C3 entry/row evaluation | Their reports bind judgments to differing entry states and identify in-flight tracked edits. No automated command in those reports establishes the semantic judgment as an invariant. | Unverifiable as a mechanical verdict; conclusions remain review evidence |
| Other wave-1 reports | Other qualitative/review-only claims | No directly reproducible counting command/selftest/diff count in the report body available for this seat, or claim is a reading rather than a machine output. | Unverifiable (not a disagreement) |

## Selftest re-run evidence

Commands executed from lane root (each exited 0):

| Command | Observed output/tally | Wave-1 claim |
|---|---|---|
| `node scripts/check-adjacency.mjs --self-test` | `cases=57 reasons=18 could_not_evaluate=6` | 57, 18 — agree |
| `node scripts/check-aria-metadata.mjs --self-test` | `cli_cases=36 helpers=4`, JSON ok=true | 36, 4 — agree |
| `node scripts/check-bfcache-receipt.mjs --selftest` | JSON `cases=17 passed=17` | 17/17 — agree |
| `node scripts/check-freshness.mjs --self-test` | `cases=12` | 12 — agree |
| `node scripts/check-gate-registry.mjs --selftest` | clean, 22 cases | 22 — agree |
| `node scripts/check-measurement-binding.mjs --self-test` | `cases=76 reasons=13` | 76, 13 — agree |
| `node scripts/check-round-contract.mjs --self-test` | `cases=38 alias_checks=1` | 38, 1 — agree |
| `node scripts/check-s106-evidence.mjs --selftest` | `cases=5 passed=5` | 5/5 at repaired tip — agree |
| `node scripts/check-selfassessment.mjs --selftest` | `cases=17 passed=17` | 17/17 — agree |
| `node scripts/check-source-reopen-receipt.mjs --selftest` | JSON `cases=18 passed=18` | 18/18 — agree |
| `node scripts/check-sources.mjs --self-test` | `cases=26` | 26 — agree |
| `node scripts/check-user-round-contract.mjs --self-test` | `cases=45` | 45 — agree |
| `node scripts/round-evidence-audit.mjs --selftest` | JSON `cases=13 passed=13` | 13/13 — agree |

`node scripts/check-gate-registry.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json` returned `rows=27`, `nonconformant=0`, `clean=true`.

## Counter and binding notes

The exact C1 counter commands were run at `f185b4e`, `4ad4c77`, and `5ed6484` using `node scripts/check-selfassessment.mjs --rev <REV> --json`. Observed mismatch totals were respectively 5, 6, and 1. At the tip, m3 is a live porcelain-path finding, not rev-bound. The m1 report marks `LOG.md:221` superseded, but CritC1Supersession / ExecC1Attacks measured its clearing paragraph without a matching citation and fixtures where wrong line citations clear findings. Therefore the apparent C1 zero is not supported by the frozen kill rule; this agrees with the falsification reports, not with the original C1 success claim.

C2 tip output was directly re-run and is valid=true. C3 count and registry row count reproduce at `5ed6484`; real external census validation exits 0. These are separate axes: source-line count and census validity do not establish that the entry contains located, non-junk quotes. `CritC3Junk.md` reports an executed junk fixture for that gap.

The real checkout is dirty with sibling changes; `git diff --stat 5ed6484 -- corpus/SOURCES.md corpus/knowledge/redirect-and-retry-after-semantics.md` showed two modified paths. Thus worktree readings must not be substituted for the named committed tip. `git grep` and `git show` above were revision-pinned.

## Exact retained evidence / limits

Evidence is the direct stdout from the command invocations listed above; no outputs were redirected or persisted to scratch. Re-run selftests produced the tallies in the table, the C1 JSON run produced the cited mismatch totals, the S106 JSON run produced the validity fields, the census command printed `tabi ok` and exited 0, and the report utility printed PASS/6-of-6/4-of-4.

Unverified: I did not rerun every scratch-only fixture matrix, all qualitative judgments, or each report's every incidental measurement. Reports without an explicit command/evidence for a numeric assertion are not treated as verified. No builds, linters, formatters, or package installs were run.