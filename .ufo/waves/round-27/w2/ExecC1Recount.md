# ExecC1Recount — C1 frozen-fit falsification: counter re-derivation, line-citation attack, selftest

Seat: `TabiR27.ExecC1Recount` (leaf, read-only reporter). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Measured tip: `bceb17dd82446a3b7514dd9759ec733673b4ba0d`
(commit `round-27: integrate falsification findings, documentation, report tool and W2 dispatch`).
Claim baseline: `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`. Gate under test:
`scripts/check-selfassessment.mjs`, sha256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` (worktree = tip blob).
No tracked file touched; no git/jj writes; no tool installed (node v24.21.0 pre-existing). Evidence under
`.ufo/waves/round-27/scratch/ExecC1Recount/` (gitignored).

## 1. Baseline counter re-derivation — `--rev 4ad4c77… --json`

Command (exact):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs \
  --rev 4ad4c77eed78bca1a149e65a7ec6a84b5f71c925 --json \
  > .ufo/waves/round-27/scratch/ExecC1Recount/baseline-4ad4c77.json
```

exit **1**, stderr empty. Receipt sha256 `831650a57e17f3b8159fec1d6a207146c2f64ef34f06848e3f38b77ce9bf5963`
— **byte-identical to the committed receipt** `.ufo/waves/round-27/selfassess-baseline-raw.json`
(sha256 `831650a57e17f3b8159fec1d6a207146c2f64ef34f06848e3f38b77ce9bf5963`). Key fields:

| field | value |
|---|---|
| rev | `4ad4c77…` |
| mismatches | **6** |
| superseded | 5 |
| couldNotEvaluate | 89 |
| clean | false |

`counted[]` verbatim (all six), the frozen before-arm exactly:

| # | class | doc | line | claimed | observed |
|---|---|---|---|---|---|
| 1 | m1-selftest-tally | LOG.md | 335 | 4 | 12 |
| 2 | m1-selftest-tally | LOG.md | 391 | 4 | 12 |
| 3 | m1-selftest-tally | LOG.md | 1090 | 66 | 26 |
| 4 | m1-selftest-tally | LOG.md | 1103 | 66 | 26 |
| 5 | m1-selftest-tally | LOG.md | 1664 | 12 | 13 |
| 6 | m3-unlanded-paths | SCORECARD.md | null | "landed" | 6 (live porcelain) |

Claim `before` — "5 LOG-window findings counted at baseline 4ad4c77 (LOG.md:335, :391, :1090, :1103, :1664) +
1 m3 working-tree finding" — reproduces as measured.

**Findings inspection (baseline, `findings[]`).** LOG-window m1 findings at lines 221, 254, 275, 335, 391, 471,
484, 972, 994, 1056, 1079, 1090, 1103, 1664, 1812. Line 254 and 275 claim 12/observed 12 (correct, not counted);
471/484/994/1056/1079/1812 are could-not-evaluate (ambiguous script association); 972 is outside the runnable gate
set. The five counted LOG lines are all genuine stale tallies. **`LOG.md:221` (check-freshness, claimed 8, observed
12) is present in `findings[]` marked `superseded: true` — i.e. the counter is hiding a sixth, genuine stale LOG
tally.** (Details §3.)

## 2. Tip counter — `--rev bceb17d… --json`

Command (exact; plain `--json` without `--rev` is refused — exit 2, `usage: --rev <REV> or --selftest`):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs \
  --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json \
  > .ufo/waves/round-27/scratch/ExecC1Recount/tip-bceb17dd82446a3b7514dd9759ec733673b4ba0d.json
```

exit **1**, stderr empty. Receipt sha256 `2ed1baf33a4ab187ea2fd1347e072706483f08504002a842084e949ae82d63e6`.

| field | value |
|---|---|
| rev | `bceb17d…` |
| mismatches | **1** |
| superseded | 10 |
| couldNotEvaluate | 92 |
| clean | false |

`counted[]` verbatim — **one entry, m3 only**; LOG-window count = 0:

```json
[{ "class": "m3-unlanded-paths", "doc": "SCORECARD.md", "line": null,
   "claimed": "landed", "observed": 6 }]
```

**Live m3 state.** `git -C <lane> status --porcelain --untracked-files=all | wc -l` snapshotted immediately after
the run → **6**, matching `m3.observed = 6`. m3 is a live-tree probe: `git status` porcelain count at the instant of
the run, independent of `--rev` (also observed: the same run's earlier inline capture reported m3 observed = 2;
the saved receipt later read 6). The C1 tip integer 0 is only reachable on a clean tree; every wave-time run exits
1 via the m3 floor. LOG-window m1 findings at tip (17 total): 221 (8→12, `superseded=true`), 254, 275 (both
correct 12=12), 335, 391, 1090, 1103, 1664 (all `superseded=true`), 471, 484, 994, 1056, 1079, 1812, 1863,
1864 (could-not-evaluate ambiguous), 972 (outside gate set).

## 3. Line-citation attack — false clear of LOG.md:221 by unrelated paragraph 265-447

`LOG.md:221` (rev blob, identical at baseline and tip): "`--self-test` → `FRESHNESS_SELFTEST verdict=clean
cases=8`". Oracle measured 12 → genuine stale tally. **No line anywhere in LOG.md cites :221:**
`git show <rev>:LOG.md | grep -nc ':221'` → **0** at baseline 4ad4c77; at tip the only `:221` token is in the
integrated falsification note at `LOG.md:1931` (not a correction — it names no script, so it cannot clear under the
shipped rule).

Replica of the shipped supersession predicate (verbatim code lifted from `check-selfassessment.mjs:246-330`,
run in `scratch/ExecC1Recount/analyze.mjs`) enumerates the clearing paragraphs for every measured LOG finding:

| rev | finding | shipped superseded | clearing paragraph(s) | paragraph citation set | contains `f.line`? |
|---|---|---|---|---|---|
| 4ad4c77 | **221** | **true** | 265-447 | `{16, 28, 18751}` | **no** |
| 4ad4c77 | 335, 391, 1090, 1103, 1664 | false | — | — | n/a (not cleared) |
| bceb17d | **221** | **true** | 265-447; 1904-1925 | `{16,28,18751}`; `{335,335,391,391,1090,1090,1103,1103,1863,1863}` | **no** |
| bceb17d | 335, 391, 1090, 1103 | true | 1904-1925 (merged block) | same 10-token set | yes (by token coincidence) |
| bceb17d | 1664 | true | 1845-1864 | `{1664}` | yes |

Paragraph 265-447 — a 183-line, 2026-10-15 round entry with zero blank lines inside — satisfies all four shipped
conjuncts for :221 without once naming line 221: it names `scripts/check-freshness.mjs` (1 line), carries the
marker "Corrected" (2 lines), supplies colon-numbers only from a timestamp `2026-10-15T05:16:28Z` (`:16`, `:28`)
and a loopback port `http://127.0.0.1:18751/page.html` (`:18751`), and supplies the oracle 12 via the prose
"12-case self-invocation". None of those tokens is a line citation; the citation conjunct
(`/:\d+/.test(text)`, `check-selfassessment.mjs:325`) is satisfied by any colon-number anywhere in the paragraph.

**Strict fit (declared rule: the correction must cite the superseded line).** With citation equality (paragraph's
citation set must contain `f.line`), the same replica gives: baseline **6 of 6** LOG findings stand (221 included)
→ strict baseline LOG count is **6, not 5**; tip 221 stands → strict tip LOG count is **1, not 0**. The four
round-27 dispositions still clear (their merged block 1904-1925 happens to contain their numbers), and 1664 clears
legitimately via 1845-1864.

## 4. Selftest

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs --selftest
```

→ `CASE … PASS` ×17, `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`, **exit 0**. Expected 17 — met.
The four frozen failureCapable LOG cases are present and green (`m1-log-stale-tally`, `m1-log-stale-then-corrected`,
`m1-log-wrong-number-correction`, `m1-log-ambiguous-section-not-counted`). No case varies the cited line, so the
125:- hole in §3 ships green.

## 5. Verdict — frozen fit fails

1. **Claim before-arm is one short under the declared rule.** The counter reports 5 LOG findings at baseline; the
   declared predicate (citation equality) yields **6** — `LOG.md:221` is a real, uncorrected stale tally that the
   counter force-clears via paragraph 265-447. `before: 5` is an artifact of the unbound `/:\d+/` citation arm.
2. **The apparent zero at tip is unsound.** `after: mismatches=0` (LOG window) holds only because 221 is cleared by
   paragraphs that never cite it; the strict tip count is **1** LOG finding (221). The tip's literal `mismatches`
   never reads 0 in a wave-time tree anyway: live m3 adds one finding (observed 6 at this run, exit 1).
3. The kill-rule letter ("counter at baseline reported zero LOG-window findings → wrong; measured 5, not 0") is
   not triggered — the defect is the reverse: the counter reports 5, the truth under the frozen rule is 6, and the
   count is reached by a false clear, not by honest measurement.
4. Sufficiency note: a citation-equality fix alone preserves all five dispositions (335/391/1090/1103 via the merged
   block, 1664 via 1845-1864) and leaves exactly 221 standing → tip LOG count 1. This matches the w1 seats
   (`ExecC1Attacks`, `CritC1Supersession`).

Observed vs claim table:

| arm | claim | measured (shipped) | measured (strict frozen predicate) |
|---|---|---|---|
| baseline LOG-window findings | 5 | 5 | **6** (221 + 5) |
| baseline total mismatches | — | 6 (5 LOG + m3) | 7 (6 LOG + m3) |
| tip LOG-window findings | 0 | 0 | **1** (221) |
| tip total mismatches | 0 (clean tree) | 1 (m3 live) | 2 (221 + m3) |
| selftest cases | 13 → 17 | 17/17, exit 0 | 17/17 |

## 6. Method / evidence index (all under `scratch/ExecC1Recount/`)

- `baseline-4ad4c77.json` (sha256 `831650a57e17f3b8159fec1d6a207146c2f64ef34f06848e3f38b77ce9bf5963`) — baseline
  receipt, byte-identical to committed `selfassess-baseline-raw.json`.
- `tip-bceb17dd82446a3b7514dd9759ec733673b4ba0d.json` — tip receipt.
- `analyze.mjs` — shipped-predicate replica (verbatim regexes from `check-selfassessment.mjs:246-330`); output
  quoted in §3.
- Direct greps: `git show <rev>:LOG.md | grep -nc ':221'` → 0 (baseline) / 1 (tip, falsification note line 1931
  only); `sed -n '265,447p'` token scans for script/marker/colon-numbers/whole numbers; `sed -n '1904,1925p'`
  bullet scan; tip LOG line count 1947; `git status --porcelain --untracked-files=all | wc -l` → 6 at tip run.

Limits: no C2/C3 work; no claim or code changes; m3 numbers are labeled with the tree state at run time; tip
measurements are at `bceb17d`, which postdates the w1 baseline `5ed6484`.
