# ExecMismatchProto — throwaway self-assessment mismatch counter, run at baseline 573c99e

Seat: L1Tabi24.ExecMismatchProto (leaf; no delegation). Prototype: `.ufo/waves/round-24/scratch/ExecMismatchProto/mm-counter.mjs` (node, ~200 lines, throwaway).
Measured revision: `573c99e4885382db38babc3a6fc90e77afeb42a6` (baseline/round-23 tip). Doc bytes read from that rev via `git archive 573c99e | tar -x -C scratch/ExecMismatchProto/base`; scripts run from those extracted bytes; m2/m3 run against the live lane worktree.

## Summary
- m1 (SCORECARD.md selftest/N-case tallies vs gate's real self-test tally at the rev): **7 mismatch instances** across 4 scorecard lines.
- m2 (committed evidence receipt exit vs re-run): **0 contradictions** — 30 receipt-command pairs examined, all re-ran to their recorded exit.
- m3 (porcelain path count vs landed-rounds assertion): **no assertion found in scope docs** → disclosed as a null class, not counted. Live porcelain is high and unstable (417 at final measurement, excluding my own scratch) because the wave is mid-flight; see §7.

## m1 findings (claimed → observed; commands that produced `observed`)
All observed tallies come from running the named script at 573c99e bytes (cwd = extracted baseline root):

| # | doc:line | claimed text | observed | command |
|---|---|---|---|---|
| 1 | SCORECARD.md:410 | `SOURCES_SELFTEST verdict=clean cases=25` | 26 cases, verdict clean, exit 0 | `node scripts/check-sources.mjs --self-test` |
| 2 | SCORECARD.md:1138 | "12-case in-memory matrix" | 13 cases | `node scripts/round-evidence-audit.mjs --selftest --json` |
| 3 | SCORECARD.md:1139 | `--selftest` (12/12) | 13/13, clean, exit 0 | same |
| 4 | SCORECARD.md:1151 | `--selftest` 12/12 exit 0 | 13/13 (determined manually — block has no `scripts/…mjs` literal, so the machine scan skipped it; see §6) | same |
| 5 | SCORECARD.md:1183-1184 | "baseline 7 findings / 6 classes, 6/6 repairs, exit 0" | baseline **4 findings / 3 classes** (c1,c3,c6); repair cases **3/6** pass; `"clean": false`; exit **3** | `node scripts/round-evidence-audit.mjs --selftest --rev 03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 --round 22 --round-cap 128 --json` |

m1 also checked `SCORECARD.md:196-197` (`check-freshness.mjs --self-test` → `FRESHNESS_SELFTEST verdict=clean cases=12`, exit 0): **matches** (12 cases, exit 0) — not a finding.

Notes per finding:
1. `check-sources.mjs` at 573c99e has 26 self-test fixtures (counted in-source: `grep -c "name:" scripts/check-sources.mjs` → 26; live run prints 26 `SELFTEST name=` lines). The committed receipts (`corpus/evidence/kaika-fleet-round-1/operability/selftest-receipt.txt`, `…-post-review.txt`) and SCORECARD:410 both record 25; the extra case is `row-outside-registry` (`scripts/check-sources.mjs:69`), which is absent from both receipts. So the scorecard tally and the receipts are stale vs the shipped code — the fixture list grew after they were written.
2/3/4. `round-evidence-audit.mjs` ships a 13-case in-memory matrix (`cases:13, passed:13`, clean). Three scorecard statements still say 12 (`12-case` line 1138, `12/12` line 1139, `12/12` line 1151). This is exactly the routed "three stale 12/12 figures vs the 13-case matrix" defect.
5. The evidence-keyed self-test claim (SCORECARD:1183-1184, restated at 1151 with a truncated rev) does not reproduce: at `03c1b4d…` the gate reports 4 baseline findings over 3 classes and passes only 3 of 6 single-class repair cases, i.e. it disagrees with itself (exit 3 = selftest disagreement). The same command text appears at line 1151 with the rev elided (`--rev …`), which I could not execute (could-not-evaluate; not counted).

## m2 — receipt exits, re-run (0 contradictions)
Scan: `corpus/evidence/**` (baseline bytes) for (a) `$ <cmd>` + `EXIT_CODE=<n>` receipts, (b) JSON records with `command` + `exit`/`exit_code`. Read-only allowlist: `node scripts/*.mjs` limited to `--self-test/--selftest/--worktree/--witness/--rev/--round/--round-cap/--json`; `git log/show/ls-tree/grep/rev-parse/cat-file/status/diff`; `grep/wc/sort/comm/xargs/basename/sed/sha256sum/echo`; no redirection, no `tee`, no browser/network/service commands, no `(...)`, no placeholders (`<…>`/`…`). 30 pairs examined; **every re-run matched its recorded exit** (including the intentionally-red `check-user-round-contract.mjs` record: claimed 1, actual 1).
Notable pairs that matched despite surface risk: `sha256sum browser-{before,after}.png browser-current-{before,after}.png` (records a receipt-relative cwd; re-run first failed from lane root, then matched when retried in the receipt's directory — implementation detail, not a contradiction); `sha256sum /home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/…` (read-only hash of a plugin file outside the lane; matched; note it touches a non-lane path). One pair (`node scripts/check-sources.mjs --self-test`) was transiently blocked earlier by a full `/tmp` (ENOSPC) and passed once space freed — see §7.

=> At the baseline, m2 is a **null class** (no receipt exits contradicted). This matches the frozen C2 narrative, which lists no m2 mismatch among the before=4.

## m3 — porcelain vs landed assertion (null class; measurement caveat)
No landed/clean assertion exists in the scope docs (`SHONEN.md`, `SCORECARD.md`): the only `unlanded` mention (SCORECARD:80) is a disclosure ("unlanded items named"), not a claim of cleanliness; SKILL.md §T1:1346 "worktree clean at the stamp" is historical (round 11) and out of my assigned doc scope. So m3 yields no finding by the defined predicate, and is disclosed as null.
Live porcelain at final measurement (`GIT_OPTIONAL_LOCKS=0 git status --porcelain --untracked-files=all`): **417 non-self-scratch paths** (total 6650; 6233 are my own `scratch/ExecMismatchProto/base` extraction and are excluded; 5 modified tracked, 412 untracked). Modified tracked files: `.ufo/waves/round-23/w2/W2LandedCites.md`, `W2Simplifier.md`, `corpus/evidence/round-19/selftests/{c1,c3,isolation}.json`. The count moved 375→400→405→415→417 during this session (minutes), i.e. it is not stable mid-wave (concurrent seats write untracked files; the round-24 wave files, round-23 leftover assimilation copies, sibling scratch dirs, and stray numeric-named files are all in the untracked set). The frozen claim's "89" was measured at a different instant/state and is not reproducible now.

## Could-not-evaluate (never counted as matches)
- SCORECARD:1140 `--selftest --rev a89f1935… --round 22 --round-cap 128` (6/6 repairs): rev elided with `…` — no executable rev; not run, not counted.
- SCORECARD:1151 evidence-keyed subclaim: same elided-rev situation.
- Blocks naming wave fixtures rather than `scripts/` lane gates (SCORECARD:1083 `selftest-c1.mjs` 45/45, :1084 `run-checks.py` 35/35, :851 "C1 38/38 …" pointing at evidence dir, :621/:691 "ROUND selftest32 … USER29 …" without script paths) are out of m1 scope — they do not name a lane gate script, or name non-`scripts/` files. SCORECARD:976 "target0→12 receipt-bound loopback lifecycle scenario observations" is a claim metric, not a selftest tally — out of scope.

## Ambiguities in claim extraction (for the L1 gate)
1. Block unit definition: I used (a) a full markdown table row when the line is a `|` row, else (b) the contiguous non-empty paragraph. Threshold question: a row without a `scripts/…mjs` literal (SCORECARD:1151) is skipped by the machine scan even though it names `--selftest` and is clearly about the round-23 gate. Recommend the L1 gate also treat `--selftest`/`--self-test` command mentions (without a path) as gate references when the block is in the round's gate-capability/executed-disposition sections.
2. Tally regexes used: `(\d+)/(\d+)`, `cases=(\d+)`, `(\d+)-case`, `cases?: (\d+)`, `(\d+) findings`, `(\d+) classes`, `exit (\d+)`. False-positive risk seen in wide paragraph units: unrelated `X/Y` figures (e.g. "44/44", "34/44" wave censuses on lines 1180-1182) only landed in my scan because earlier versions scanned the whole unit; the final version scans only the selftest-bearing line plus its indented continuation(s), which excludes them.
3. Evidence-keyed self-tests carry two distinct measurements: baseline finding/class counts and repair pass counts. The L1 gate should compare each separately (`6/6 repairs` vs observed `passed/cases`: 3/6).
4. Recorder exit semantics: `round-evidence-audit.mjs --selftest` exits 3 on self-test disagreement (not 0); "exit 0" claims on those lines compare against that.
5. m2 cwd: receipts embed commands relative to their own directory. A re-run must try the lane root then the receipt's directory; otherwise false positives occur (e.g. relative `sha256sum browser-*.png`).
6. m2 "read-only" classification: `node scripts/check-aria-metadata.mjs --derive …` was excluded (it derives/creates artifacts and is not a verification re-run); `--self-test/--witness/--rev/--round/--round-cap/--json` accepted. `node scripts/check-round-contract.mjs` (no flags, production read) accepted.
7. Environment sensitivity: `/tmp` filled to 100% during the session (sibling dirs: 36G `r30fx-kengakuPred`, 3.8G `r30fx-considerthese`, …) made temp-dir-based self-tests fail with ENOSPC (freshness exit 2, sources `cases=0`, aria exit 2). The prototype probes writable `/tmp` and reports ENOSPC-blocked runs as could-not-evaluate, never as mismatches. The L1 gate needs the same guard (and the integrator should ensure `/tmp` headroom or override `TMPDIR`).
8. m3 assertion source is under-specified: SHONEN.md (promotion checklist) never asserts round landing; SCORECARD.md has no clean-worktree claim. If C2's m3 is to fire at baseline, the L1 gate must define where the "landed rounds" assertion lives (candidates observed: SCORECARD:1180 wave/seat census "44/44 reports"; SCORECARD:1162 "landed change ↔ LOG entry bound"; LOG.md:1686 "Landed paths: …"; SKILL.md:1346 "worktree clean at the stamp" (historical, round 11)). Picking a source changes the class from null to active.

## Evidence / commands
- `git archive 573c99e4885382db38babc3a6fc90e77afeb42a6 | tar -x -C scratch/ExecMismatchProto/base`
- `node scripts/round-evidence-audit.mjs --selftest --json` → `{"schema":"tabi-round-evidence-audit-v1-selftest","cases":13,"passed":13,"clean":true}`
- `node scripts/round-evidence-audit.mjs --selftest --rev 03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 --round 22 --round-cap 128 --json` → baselineFindings 4, baselineClasses [c1,c3,c6], cases 6, passed 3, clean false, exit 3
- `node scripts/check-sources.mjs --self-test` → `SOURCES_SELFTEST verdict=clean cases=26` (exit 0)
- `node scripts/check-freshness.mjs --self-test` → `FRESHNESS_SELFTEST verdict=clean cases=12` (exit 0)
- `grep -c "name:" scripts/check-sources.mjs` → 26
- `GIT_OPTIONAL_LOCKS=0 git status --porcelain --untracked-files=all | wc -l` → 6650 raw / 417 net-of-self-scratch at final run
- `df -h /tmp` → 128G, 100% full at the time of the first (failed) selftest runs

## Risks / notes for the L1
- The observed m1 count (7 instances on 4 lines) exceeds the frozen "before: 4" (3× 12/12 + 1× m3). The sources 25/26 and the evidence-keyed 4/3/3-of-6 findings are real at 573c99e and will surface in any gate that runs the same commands; the frozen claim likely under-counts (or the L1 gate scopes m1 to the round-23 capability/disposition blocks only — that scoping is the substitutive decision, and it must be stated publicly).
- Two `round-evidence-audit.mjs` evidence-keyed claims (lines 1151, 1183-1184) describe the same underlying run; count as one root cause if dedup is desired.
- Prototype itself is throwaway; it writes nothing outside `scratch/ExecMismatchProto/` and this report.
