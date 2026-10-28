# MutC2IdSet — C2 r4 id-set mutation probe (tabi round 42, wave 1)

Seat: `MutC2IdSet` (leaf; one wave item). Role: mutation tester for the frozen C2 checker.
Lane source: `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`
(sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`, 9467 bytes, mtime 1793199804).
No lane bytes were modified; the mutant is a scratch copy.

## Probe

Hypothesis under test: the r4 clause “committed with exactly the 38 ids of the committed
quarantine/slice-ids.txt” is **load-bearing** — a re-adjudication TSV carrying only 33 of the 38
staged ids must be refused, and removing that one clause must flip the verdict on such a TSV
without disabling the other r4 row-validity checks.

Mutation M (scratch copy only): delete the two id-set difference computations and their two
findings (`r4-ids-missing`, `r4-ids-extra`), leaving every other byte identical.
`diff -u` (saved as `mutant.diff`, sha256 `a14691f4…c5c69`):

```
@@ -149,10 +149,9 @@
     const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
     if (dup.length) add('r4-duplicate-ids', `duplicate staged ids: ${[...new Set(dup)].join(',')}`);
     if (sliceIds.length !== 38) add('r4-slice-size', `slice-ids has ${sliceIds.length} ids, expected 38`);
-    const missing = sliceIds.filter((id) => !ids.includes(id));
-    const extra = ids.filter((id) => !sliceIds.includes(id));
-    if (missing.length) add('r4-ids-missing', `tsv misses staged ids: ${missing.join(',')}`);
-    if (extra.length) add('r4-ids-extra', `tsv has unknown ids: ${extra.join(',')}`);
+    // MUTATION M (id-set equality dropped): the r4 requirement "committed with
+    // exactly the 38 ids of the committed quarantine/slice-ids.txt" is no
+    // longer enforced; any TSV whose rows are individually valid is accepted.
     for (const r of rows) {
       if (!VERDICTS.has(r.verdict)) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
       const esize = gitBlobSize(r.evidence);
```

Scope of the mutation is deliberately narrow: `r4-slice-size`, duplicate detection, the verdict
enum, the 200-byte evidence floor, and r1–r3 are untouched.

Mutant sha256: `8dc234f82417974a7762b160b16ec0965acad0066c54103666abb62a5af71edd`.
Pristine sha256 before the probe and after every run: unchanged `b1d05df1…76b4a8`.

## Fixtures

Built by `build-fixtures.py` (sha256 `3be99d0a…191fb`) under
`/fast/scratch/hyaku/tabi-r42/MutC2IdSet/fixtures/<name>/`, each a fresh `git init -q` repo with
exactly one commit; `git -C <fixture> rev-parse --show-toplevel` was checked to equal the fixture
path before commit (all four matched). Every fixture satisfies r1a/r1b (receipt + witness ≥1000
bytes, valid JSON, sha256-bound to the committed measure record), r2 (S146 `rejected`; S148
teaches begins `supersedes S146 — `, 7-word quote that is a verbatim substring of the committed
staged HTML), and r3 (baseline control records an `ls-tree` command and `0`). Only r4 varies.

Slice ids are the real 38 ids from the committed
`.ufo/waves/round-42/quarantine/slice-ids.txt` (F1 slice file sha256 `37351627…e712cf`).

| fixture | commit | TSV rows | r4 variation |
|---|---|---|---|
| `F1-33of38` | `e791ebca1e5cdf64ea92432316b111c091fc4eea` | 33 | TSV omits S102,S124,S153,S171,S176 (primary) |
| `F2-all38` | `80da0c2e561e05e243d75f12ce4ee1a12318e1d3` | 38 | complete id set |
| `F3-bad-verdict` | `40789543e27324309f2b2d29c6c8ade37a73f715` | 33 | same 33 rows; S106 verdict `present-ish` |
| `F4-thin-evidence` | `b7111a13f4bee1015e128e4fdf6908f985a76adc` | 33 | same 33 rows; S106 evidence blob 5 bytes |

F1 TSV sha256 `450bd086db38dfdba1d8d3dd3e71e56b89a737d2d037b61864892308afac4680`;
recomputed directly: `slice n= 38 rows n= 33`, `missing= ['S102','S124','S153','S171','S176']`, `extra= []`.

Runner: `run-matrix.py` (sha256 `0c9d2ec6…fd8e`), which invokes for every fixture

```
node <script> --rev <fixture sha> --repo <fixture path> --json
```

with `--repo` relative to the scratch dir, cwd = scratch dir, pristine = the lane path (read-only)
and mutant = `check-mutant.mjs` in scratch. Every run's stdout, stderr and exit code is preserved
under `out/<fixture>.<variant>.{stdout.json,stderr.txt,exit}` and aggregated in `matrix.json`
(sha256 `af9af270…98f40`).

## Red/green table (observed, not inferred)

| fixture | variant | exit | predicate | findings |
|---|---|---|---|---|
| F1-33of38 | **pristine** | **1** | false | `r4-ids-missing` — “tsv misses staged ids: S102,S124,S153,S171,S176” |
| F1-33of38 | **mutant** | **0** | true | (none) |
| F2-all38 | pristine | 0 | true | (none) |
| F2-all38 | mutant | 0 | true | (none) |
| F3-bad-verdict | pristine | 1 | false | `r4-ids-missing`, `r4-verdict-enum` — “S106: verdict 'present-ish' not in enum” |
| F3-bad-verdict | mutant | 1 | false | `r4-verdict-enum` — “S106: verdict 'present-ish' not in enum” |
| F4-thin-evidence | pristine | 1 | false | `r4-ids-missing`, `r4-evidence-thin` — “S106: evidence .ufo/waves/round-42/evidence/S106.md is 5 bytes (<200)” |
| F4-thin-evidence | mutant | 1 | false | `r4-evidence-thin` — “S106: evidence .ufo/waves/round-42/evidence/S106.md is 5 bytes (<200)” |

Exact F1 outputs:

```
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
    --rev e791ebca1e5cdf64ea92432316b111c091fc4eea --repo fixtures/F1-33of38 --json
{
 "schema": "tabi-r42-routed-defects",
 "rev": "e791ebca1e5cdf64ea92432316b111c091fc4eea",
 "predicate": false,
 "findingCount": 1,
 "findings": [
  { "id": "r4-ids-missing",
   "detail": "tsv misses staged ids: S102,S124,S153,S171,S176" }
 ]
}
exit=1

$ node check-mutant.mjs \
    --rev e791ebca1e5cdf64ea92432316b111c091fc4eea --repo fixtures/F1-33of38 --json
{
 "schema": "tabi-r42-routed-defects",
 "rev": "e791ebca1e5cdf64ea92432316b111c091fc4eea",
 "predicate": true,
 "findingCount": 0,
 "findings": []
}
exit=0
```

## Reading

- **F1 kills the mutant.** Pristine refuses (exit 1, `r4-ids-missing`, naming exactly the five
  omitted ids); the mutant accepts the same committed bytes (exit 0, zero findings). The dropped
  clause is therefore load-bearing for the frozen predicate — without it, a re-adjudication TSV
  covering 33 of 38 staged ids greens C2.
- **F2 shows the mutant is not always-green.** With all 38 rows the mutant and pristine agree
  (exit 0), so F1's split is caused by the id-set clause, not by the mutation disabling the script.
- **F3/F4 show the mutation is narrow.** Both controls stay red under the mutant on their own
  rows' validity grounds (enum, evidence floor); the mutant did not buy blanket acceptance.
- The five ids named by the pristine run match the five rows F1 deliberately omits; no incidental
  `r4-ids-extra`, duplicate, malformed-row or slice-size finding contaminated the result.

Independent context (read-only, `out/real-head-0081bfdb.txt`): at the real repo HEAD
`0081bfdb93b6bd1bf2853bb128996f1a976b7218` the pristine checker emits exactly one finding,
`r4-quarantine-absent` (“…re-adjudication.tsv not committed at REV”, exit 1) — r1a, r1b, r2 and r3
pass on real bytes, and r4 is red at the freeze for absence, not for a short TSV. This is
consistent with the frozen claim text and shows the fixture's synthetic r1–r3 blocks are
shape-faithful to what the real tree satisfies.

Observation (no amendment proposed, counter bytes frozen): r4 binds each row's evidence to *any*
committed blob ≥200 bytes; it does not require the evidence path to name the row's id. That is
exactly the frozen predicate's wording (“evidence path a committed blob >=200 bytes”), so it is
recorded as behaviour, not as a hole.

## Limitations

- Fixture artifacts are synthetic, not round-41 production bytes; the discriminator is the r4
  id-set clause, and the real-HEAD run above shows the other checks already pass on real bytes.
- The mutant retains `r4-slice-size` (38-count of `slice-ids.txt`) because M drops only the
  TSV↔slice equality; F1's slice file carries the real 38 ids, so that retained check cannot
  confound the split.
- Toolchain: node v24.21.0, git 2.56.0. No tools installed or upgraded for this seat (none needed;
  pacman untouched).
- Nothing was written outside this seat directory and the scratch root; all lane, production,
  fleet and sibling repo bytes were read-only. Scratch
  `/fast/scratch/hyaku/tabi-r42/MutC2IdSet/` was deleted before yielding; the copies below are
  the durable evidence.

## Evidence in this directory

`matrix.json`, `fixtures.json`, `check-mutant.mjs`, `mutant.diff`, `build-fixtures.py`,
`run-matrix.py`, `manifest.sha256`, and `out/` (8 runs × cmd/exit/stdout/stderr plus
`real-head-0081bfdb.txt`).

VERDICT ok
