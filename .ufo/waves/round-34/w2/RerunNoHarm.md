# Round 34 w2 — RerunNoHarm: no-harm rerun of the wave-1 integration

**Verdict: HOLDS (no defect; severity none).** I re-ran the frozen harness
`.ufo/waves/round-34/measure.sh` against the wave-1 integration
`04f9623dde8ad35d470cecf766e421eafbcb47fa` (freeze `59f1b47a…`, baseline `15dfaccb…`) in a clean
`--shared` clone with `HYAKU_SCRATCH` under my own scratch, and the four contractual no-harm clauses
plus the append-only clause all hold: all **28/28** gate/self-test lines that exited 0 at the baseline exit 0
again with the same commands in the same order (`regressions=0`, `non_identical=0`); `check-selfassessment`
reports `clean=true mismatches=0` (baseline 0); the round-33 C1 counter reads `unaccounted=0` over its 52
PROVINCE candidates (52/8/44, `newMapped=3`, `predicate=false` — byte-for-byte the baseline's reading, so the
round-34 relabel and new rows did not disturb it); `sources-census.sh validate` exits 0 (`file ok`); and
`git diff --numstat 15dfaccb 04f9623 -- SKILL.md SCORECARD.md LOG.md corpus/README.md corpus/QUALITY.md
corpus/SOURCES.md corpus/adjacency.tsv` shows a **deleted column of 0 in every row** (30/0, 39/0, 31/0, 78/0,
14/0, 4/0, 4/0). Across the whole wave-1 diff the only non-zero deletions are the two surfaces the claims
permit: `corpus/adjacency-screen.tsv` (4/4, the routed kake relabel) and `scripts/check-bidi-runtime.mjs`
(62/7, test-only — its production half is byte-identical). Everything below is evidence; the four
informational notes in §5 are not defects.

## 1. What I attacked

- The frozen measurement path itself: that the harness, counters and the pinned adjacency gate are the
  frozen bytes, and that the measured tree is a clean clone of the named revision.
- Every baseline-green gate and self-test: that none regressed to non-zero between the baseline and the
  wave-1 integration.
- The calibration surface: `check-selfassessment` mismatches must stay 0 even though six new tally
  corrections and a new knowledge entry landed.
- The round-33 no-harm instrument (52-candidate PROVINCE sweep): `unaccounted` must stay 0.
- Append-only prose: no prior-round byte may be deleted in the seven named documents.
- The two permitted mutations: the kake screen-ledger relabel (only the routed rows, only reasons/notes, each
  listed in the lesson) and the BiDi gate edit (only self-test cases/fixture options; every rule line, i.e.
  every mutant find text, byte-identical).

## 2. Frozen surface first (the run is only as good as this)

| object | digest at REV | expected |
|---|---|---|
| `.ufo/waves/round-34/measure.sh` (invoked from the lane worktree) | `0a11973daf308e6f5af59698568d561e537e6bb3f1959de31ece9fb28a08602c` | `claims.frozenDigests` — equal |
| `.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs` | `0dba816c…a8781e` both "freeze" and "at-rev" | equal (provenance-04f9623.txt) |
| `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` | `3cf5eb69…325b82` both "freeze" and "at-rev" | equal |
| `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs` | `51ace65f…24e812b` | pinned in claims — equal |
| `scripts/check-adjacency.mjs` at REV | `4e2c2a64…324aac` | pinned inside C1 — equal |
| `scripts/check-selfassessment.mjs` at REV | `77b5c8ed…d6c6a9` | unchanged from baseline (provenance) |

Clone provenance (`receipts/provenance-04f9623.txt`): `rev=04f9623dde8ad35d470cecf766e421eafbcb47fa`,
`freeze=59f1b47a…`, `porcelain=0`. Baseline provenance recorded the counters as absent at the baseline rev
(`at-rev e3b0c442…`, the empty-file sha) — expected, they were committed at the freeze, not at the baseline.

## 3. Command, exit codes, and the line-by-line comparison

1. `HYAKU_SCRATCH=$S/hs .ufo/waves/round-34/measure.sh 04f9623dde8ad35d470cecf766e421eafbcb47fa $S/out 59f1b47aae277e1670e4a824173da8cde7e388ee` → **exit 0**, `measured 04f9623` (139 s).
2. `node $S/cmp/compare.mjs <baseline>/measure-at-baseline/noharm-at-15dfacc.txt $S/out/noharm-at-04f9623.txt` → **exit 0**, `SUMMARY lines_base=28 lines_cur=28 regressions=0 non_identical=0`. The comparator normalises only the `--at <REV>` / `--rev <40-hex>` hashes, the cascade baseline pin and the scratch clone path (which necessarily differ between the two runs), then requires identical command text and identical exit codes line by line.
3. `diff` of the two files after the same normalisation → **exit 1** (differences exist; enumerated in `receipts/noharm-normalized.diff`): besides the revision hash each summary echoes, exactly four content deltas, all expected and all still exit 0:
   - line 01 `ADJACENCY verdict=clean rows=13 verified=13` → `rows=17 verified=17` (map 13→17 rows);
   - line 09 `SOURCES_GATE … rows=129 tiers=A:114 … mined:105` → `rows=133 tiers=A:118 … mined:109` (S130–S133);
   - line 14 `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44` → `cases=56 passed=56`;
   - line 08 `SELFASSESSMENT … mismatches=0 could_not_evaluate=115 superseded=42` → `mismatches=0 could_not_evaluate=116 superseded=48`.

All 28 rerun lines (`receipts/noharm-at-04f9623.txt`, exit codes also in `provenance-04f9623.txt`):

```
01 check-adjacency.mjs --at <REV> --fleet …   exit=0  (clean rows=17 verified=17)
02 check-gate-registry.mjs --rev HEAD         exit=0  (clean rows=42 gates=22 nonconformant=0)
03 check-release-pins.mjs --stable 156.0.8078.47 exit=0 (population=23 resolved=23 holds=16 drifted=7)
04 check-s106-evidence.mjs --rev HEAD         exit=0  (valid)
05 check-frontier-admission.mjs --since 2026-10-26 exit=0 (clean population=2 admitted=2)
06 check-decision-table.mjs --baseline 96a2d1a3… exit=0 (clean population=13 admitted=13)
07 check-bidi-runtime.mjs --baseline d805d1d6… exit=0 (clean population=17 admitted=16)
08 check-selfassessment.mjs --rev HEAD        exit=0  (clean mismatches=0)
09 check-sources.mjs                          exit=0  (clean rows=133)
10 sources-census.sh validate --file <clone>/corpus/SOURCES.md exit=0 (file ok)
11 check-adjacency.mjs --self-test            exit=0  (cases=57)
12 check-aria-metadata.mjs --self-test        exit=0
13 check-bfcache-receipt.mjs --selftest       exit=0  (cases=17 passed=17)
14 check-bidi-runtime.mjs --selftest          exit=0  (cases=56 passed=56)
15 check-decision-table.mjs --selftest        exit=0  (cases=34)
16 check-freshness.mjs --self-test            exit=0  (cases=12)
17 check-frontier-admission.mjs --selftest    exit=0  (cases=24)
18 check-gate-mutants.mjs --selftest          exit=0  (cases=12)
19 check-gate-registry.mjs --selftest         exit=0  (cases=22)
20 check-measurement-binding.mjs --self-test  exit=0  (cases=76)
21 check-release-pins.mjs --selftest          exit=0  (cases=29)
22 check-round-contract.mjs --self-test       exit=0  (cases=38)
23 check-s106-evidence.mjs --selftest         exit=0  (cases=10)
24 check-selfassessment.mjs --selftest        exit=0  (cases=41)
25 check-source-reopen-receipt.mjs --selftest exit=0  (cases=18)
26 check-sources.mjs --self-test              exit=0  (cases=26)
27 check-user-round-contract.mjs --self-test  exit=0  (cases=45)
28 round-evidence-audit.mjs --selftest        exit=0  (cases=13)
```

## 4. The named clauses, checked directly

**4.1 Calibration — mismatches 0.** `receipts/selfassessment-fields.txt`: baseline
`clean=true mismatches=0 findings=220 couldNotEvaluate=115 superseded=42 counted=[]`; at REV
`clean=true mismatches=0 findings=231 couldNotEvaluate=116 superseded=48 counted=[]`. The 11 added findings
are the five `SCORECARD.md:1887/1889/1890/1891/1892` 56/56 corrections, five `SKILL.md:2941…2946`
corrections and the round-34 `m4-nudge-state` (`SCORECARD.md:1867` claimed=inactive observed=inactive —
corroborating the claims' "stagnation nudge INACTIVE"); none is a live mismatch.

**4.2 Round-33 C1 (no-harm leg).** `receipts/counter-fields.txt`: at REV
`candidates=52 mapped=8 screened=44 unaccounted=0 newMapped=3 adjacency=clean screenFindings=[]` — the same
counts as `baseline/measure-at-baseline/r33c1-at-15dfacc.json` (only the `rev`/`baseline` fields and the map's
row count 13→17 differ), `predicate=false` in both, exit 1 in both (the round-33
target was `newMapped>=4` and the baseline never met it). The clause ("keeps unaccounted 0") holds; the
four screen-ledger relabels did not invalidate a single round-33 screen row (`screenFindings=[]`), and the four
new map rows did not create a round-33-visible mapping.

**4.3 Census.** Line 10 of the rerun, exit 0, `file\tok\t<clone>/corpus/SOURCES.md` — the clone at REV.

**4.4 Append-only.** `receipts/numstat-seven-paths.tsv`: `30 0 LOG.md`, `39 0 SCORECARD.md`, `31 0 SKILL.md`,
`78 0 corpus/QUALITY.md`, `14 0 corpus/README.md`, `4 0 corpus/SOURCES.md`, `4 0 corpus/adjacency.tsv` —
deleted 0 for all seven. Whole-diff scan (`receipts/numstat-nonzero-deletions.txt`): only
`4 4 corpus/adjacency-screen.tsv` and `62 7 scripts/check-bidi-runtime.mjs`, both inside the permitted envelope
below. The three round-32/33 documents named in the integration facts are append-only too:
`corpus/knowledge/webdriver-bidi-runtime-round-32.md` 13/0, `corpus/lessons/round-32.md` 15/0.

**4.5 The kake screen-ledger relabel is the routed one.** `receipts/screen-ledger-column-deltas.txt`: 45 rows
before and after, exactly 4 rows changed — file lines 31, 35, 39, 42 = kake
`PROVINCE.md:396`, `:411`, `:422`, `:440`. Column deltas: `:396`/`:422`/`:440` change
`reason,surface,note` (no-claim-declared/`-` → same-surface on `robots-txt-publisher-audit-vs-client-obedience`,
`crawler-discipline-vs-publishing`, `crawler-discipline-vs-publishing` respectively); `:411` changes **note
only**. No `quote` and no `sibling_ref` changed anywhere, so the verbatim-quote and reference invariants are
untouched. All four rows are listed in `corpus/lessons/round-34.md:133-135` ("rows 31, 35, 39, 42 relabelled
(kake `PROVINCE.md:396` → same-surface robots-txt…, `:411` note, `:422`/`:440` → same-surface
crawler-discipline…)"), and both items sit inside round-33 routed defect 5
(`corpus/lessons/round-33-verifier-spotcheck.md:166-167`: "CritScreenOthers: relabel kake 396/422/440 …
CritScreenCrawlerSplit: kake:411 note").

**4.6 The BiDi gate edit is test-only, and every rule line survives.** The whole production half — every byte
before the `// ---- self-test` marker, line 871 in both revisions — is **byte-identical**:
`ecfccb73eab4bbd76b704fef6b1e5ed2ffd71bded1131daadd48103ed8d319ea` at the baseline and at REV
(`receipts/gate-production-half.txt`). The 8 hunks (`receipts/gate-hunk-headers.txt`) all fall after that
marker: `goldenLines` gains the `bWsSessionSegment` hook (`:878`, `:882`), `lessonsDoc` gains the
`bGateRowNoSha` option (`:948-955`), the twelve `v3-a-*`/`v3-b-*` CASES are appended (`:1020+`), and
`runSelftest` threads the option and adds the `detailIncludes` comparison (`:1092`, `:1157-1163`). All **20**
frozen mutant find texts (`baseline/c2-mutant-finds.json`) still occur **exactly once** at REV —
`not_exactly_once=0` (`receipts/find-texts-at-rev.txt`), independently corroborated by the C2 counter's
`unappliable=[]`. So "rule lines stay byte-identical" holds, and no mutant find text was reworded.

## 5. Observations (informational — no action required for this verdict)

1. **Frozen wording is narrower than the routed item.** `claims.noHarmRule` says the round-33 ledger "may
   change only by the routed relabel of its kake 396/422/440 rows"; the integration also touched row 35
   (`:411`, note-only). The parenthetical citation of round-33 routed defect 5 covers it (defect 5 names the
   `:411` note) and the round lesson lists it, so the clause holds as written with the parenthetical; the literal
   three-row list does not. Fixing the shorthand at the next freeze would remove the ambiguity.
2. **One new could-not-evaluate.** The measure moved `could_not_evaluate` 115→116: the new
   `SKILL.md:2941` (a 56/56 correction line) resolves to `couldNotEvaluate: "ambiguous script association"`.
   It is a blind spot of the calibration instrument, not a mismatch (`mismatches=0`), but the L1 may want the
   next such line to name its script unambiguously.
3. **`superseded` 42→48** is the six stale tallies that were still live at the baseline
   (`SCORECARD.md:1784/1787/1805`, `SKILL.md:2817/2894/2907`; the older `SCORECARD.md:1657`/`SKILL.md:2626`
   were already superseded) now superseded by the ten new 56/56 correction lines
   (`SCORECARD.md:1887/1889-1892`, `SKILL.md:2941/2943-2946`) — append-only corrections, as designed.
4. **Lane worktree was dirty before I ran** (`git -C <lane> status --porcelain` → 10 entries:
   `M corpus/lessons/round-34.md` plus untracked `.ufo/waves/round-34/w1-results.json`, `w2-*`, `w2/`, …).
   None of it is mine; the measurement used a fresh `--shared` clone checked out at REV (`porcelain=0`), so the
   numbers above are the commit's, not the worktree's. The wave-1 commit itself is the measured object.

Context only (not a no-harm condition, and not judged here — the C1/C2 attack seats own these): at REV the
frozen counters read C1 `predicate=true` (`unaccounted=0`, `newMapped=4`, adjacency clean 17/17, `screenFindings=0`)
and C2 `predicate=true` (`killed=20`, `survivors=[]`, `unappliable=[]`, `twinsFailing=[]`, pristine/neutral/decoy
exit 0, round-33 forgery battery `true`). I record them as facts of the same run; I do not endorse them.

## 6. Limits

- No-harm here is exit-based: a gate can keep exit 0 while asserting less. I did not re-derive the semantic
  content of the four new map rows (C1 critics), the kill quality of the twelve new cases (C2 seats), or the
  truth of any declaration line — only that the instruments stayed green, frozen, and append-only.
- `sources-census.sh` was run only through `measure.sh` (exit 0, `file ok`); I did not re-run it standalone
  with other flags.
- No network fetches, no browser, no tool installs; nothing was written outside my scratch and this output dir
  (lane tracked files untouched — the worktree dirt predates this seat).

## 7. Deliverables

- Report: `.ufo/waves/round-34/w2/RerunNoHarm.md`
- Receipts: `.ufo/waves/round-34/w2/RerunNoHarm/receipts/` (`SHA256SUMS` lists 23 files), including
  `commands.md`, `provenance-04f9623.txt`, `noharm-at-04f9623.txt`, `noharm-normalized.diff`,
  `compare.mjs`, `baseline-compact.txt`, `c1-at-04f9623.json`, `c2-at-04f9623.json`,
  `r33c1-at-04f9623.json`, `selfassessment-at-04f9623.json`, `selfassessment-fields.txt`,
  `counter-fields.txt`, `numstat-seven-paths.tsv`, `numstat-all.tsv`, `numstat-nonzero-deletions.txt`,
  `digests.tsv`, `find-texts-at-rev.txt`, `gate-production-half.txt`, `gate-hunk-headers.txt`,
  `screen-ledger-column-deltas.txt`, and the three empty `.stderr` files (c1/c2/r33c1 clean).
- Scratch `/fast/scratch/hyaku/tabi-r34/RerunNoHarm` removed after the receipts were copied.
