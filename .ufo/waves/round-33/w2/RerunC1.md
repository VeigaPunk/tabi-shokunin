# RerunC1 — independent re-run of the frozen C1 adjacency counter (round 33, w2)

**Verdict: holds (no defect).** I re-ran the frozen C1 counter, taken from the freeze commit's
bytes (`sha256 da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380`, identical in
the freeze tree, at `042d6d9`, and in the lane worktree), against a clean `git clone --shared` of
the lane detached at `042d6d9abf97d567d495652a85eabc851b81adc1`. Two consecutive runs produced
**byte-identical** output (`sha256 4547a1ff…`) with `predicate: true`, `candidates 52, mapped 9,
screened 43, unaccounted 0, newMapped 4, adjacency clean 14/14`, exit 0. Run at
`bf48b81cbb5dd63bd3f5159dcba536ccd577e28e` (the L1's own measurement revision) it reproduces
`.ufo/waves/round-33/measure/c1-at-bf48b81.json` **byte for byte**
(`sha256 681265e87ef225df575a8f178971051604ca3533e188f263f9c6bf2346940481`), same digest as the
committed file. Run at the baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd` it reproduces the
frozen `before` state exactly: `mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency clean
10/10`, predicate false, exit 1. The only byte difference between my `042d6d9` output and the
committed `c1-at-bf48b81.json` is the echoed `rev` field (the counter prints the `--rev` it was
given); every other field is identical under an order-normalised comparison, and the two revisions
carry byte-identical C1 inputs (`corpus/adjacency.tsv`, `corpus/adjacency-screen.tsv`,
`scripts/check-adjacency.mjs` show empty `git diff --numstat` between them). Recorded as an
observation, not a defect.

## What I attacked

One thing: **the reproducibility of the C1 predicate** — that the frozen counter bytes, run
independently at the integration revision in a clean clone, yield the L1's published measurement,
and that the same bytes yield the frozen baseline `before` numbers (so the axis is demonstrably
moved by the lane content, not by the measuring environment).

## Environment

- `node v24.21.0`, `git version 2.56.0`, host UTC `2026-10-26T18:49:16Z`.
- Scratch `S=/fast/scratch/hyaku/tabi-r33/RerunC1` with `TMPDIR=$S/tmp` passed explicitly.
- No tool installs, no network fetches, no browser started.

## Commands and exit codes

Counter bytes from the freeze commit, digest check, clean clone:

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ git show e6b0a9074d434ccc307badd312ae7379d1193fea:.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs | sha256sum
da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380  -            # == claims.json frozenDigests

$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1
$ git -C "$S/clone" rev-parse HEAD
042d6d9abf97d567d495652a85eabc851b81adc1
```

Run 1 and run 2 at the integration revision:

```
$ node c1-adjacency-sweep.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 \
      --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json > run1.json 2> run1.err   # exit 0
$ ... (same) > run2.json 2> run2.err                                                            # exit 0
$ sha256sum run1.json run2.json
4547a1ffb2142f1d31f2219e6a58d1984b223bdeb93e644328684ace3b498c40  run1.json
4547a1ffb2142f1d31f2219e6a58d1984b223bdeb93e644328684ace3b498c40  run2.json
$ cat run1.err run2.err        # empty, both
```

Baseline run:

```
$ node c1-adjacency-sweep.mjs --rev b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd \
      --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json > baseline.json 2> baseline.err
exit 1; baseline.err empty; sha256 3a6952dadf700674b6c9a4431ef356080420ae958740254a5afcf6f712291068
```

Byte comparison against the L1 measurement, and the exact reproduction at `bf48b81`:

```
$ cmp run1.json .../measure/c1-at-bf48b81.json
run1.json .../measure/c1-at-bf48b81.json differ: char 51, line 1        # rev field only, see below
$ node c1-adjacency-sweep.mjs --rev bf48b81cbb5dd63bd3f5159dcba536ccd577e28e \
      --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json > run_bf48b81.json   # exit 0
$ cmp run_bf48b81.json .../measure/c1-at-bf48b81.json && echo BYTE_IDENTICAL_TO_MEASURE
BYTE_IDENTICAL_TO_MEASURE
$ sha256sum run_bf48b81.json .../measure/c1-at-bf48b81.json
681265e87ef225df575a8f178971051604ca3533e188f263f9c6bf2346940481  run_bf48b81.json
681265e87ef225df575a8f178971051604ca3533e188f263f9c6bf2346940481  .../measure/c1-at-bf48b81.json
```

Normalised field comparison (`042d6d9` run vs committed measure, `rev` removed):

```
rev_run:     042d6d9abf97d567d495652a85eabc851b81adc1
rev_measure: bf48b81cbb5dd63bd3f5159dcba536ccd577e28e
equal_excluding_rev: True
run_sha_of_norm:     5345fea0398c3b97f5c6960f9ee0a62b06695bd588f3320898a9e1c4ce070673
measure_norm:        5345fea0398c3b97f5c6960f9ee0a62b06695bd588f3320898a9e1c4ce070673
predicate True True | candidates 52 52 | mapped 9 9 | screened 43 43
unaccounted 0 0 | newMapped 4 4 | adjacency clean 14/14 findings 0 (both)
```

Frozen inputs at the two revisions are identical, so the predicate transfers:

```
$ git diff --numstat bf48b81cbb5dd63bd3f5159dcba536ccd577e28e 042d6d9abf97d567d495652a85eabc851b81adc1 \
      -- corpus/adjacency.tsv corpus/adjacency-screen.tsv scripts/check-adjacency.mjs SKILL.md corpus/QUALITY.md
(empty)
$ git diff --numstat bf48b81..042d6d9
1  0  .ufo/waves/round-33/measure/c1-at-bf48b81.json
0  0  .ufo/waves/round-33/measure/c1-at-bf48b81.stderr
1  0  .ufo/waves/round-33/measure/c2-at-bf48b81.json
0  0  .ufo/waves/round-33/measure/c2-at-bf48b81.stderr
28 0  .ufo/waves/round-33/measure/noharm-at-bf48b81.txt
10 0  .ufo/waves/round-33/measure/provenance-bf48b81.txt
2168 0 .ufo/waves/round-33/measure/selfassessment-at-bf48b81.json
236 0 .ufo/waves/round-33/w2-spec.json
2  0  SCORECARD.md
```

The `SCORECARD.md` delta is the one named one-line correction plus its blank separator
(`SCORECARD.md:1803-1805`), the change the dispatch names.

Counter / gate identity at the revision I ran:

```
$ git show 042d6d9:.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs | sha256sum
da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380   # == frozen
$ sha256sum .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs      # lane worktree
da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380
$ sha256sum "$S/c1-adjacency-sweep.mjs"                              # scratch copy I ran
da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380
$ git show 042d6d9:scripts/check-adjacency.mjs | sha256sum
4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac   # == counter's pinned ADJ_GATE_SHA256
```

The frozen candidate sweep is unchanged and accounts for every line:

```
$ node c1-adjacency-sweep.mjs --list-candidates --fleet /home/vgpnk/Projects/shokunin > cands.txt   # exit 0, 52 lines
$ cmp cands.txt .ufo/waves/round-33/baseline/c1-candidates.tsv && echo CANDIDATES_BYTE_IDENTICAL
CANDIDATES_BYTE_IDENTICAL
```

## Run 1 — `--rev 042d6d9abf97d567d495652a85eabc851b81adc1` (exit 0; run 2 byte-identical)

```json
{
 "schema": "tabi-r33-c1-adjacency-sweep-v1",
 "rev": "042d6d9abf97d567d495652a85eabc851b81adc1",
 "baseline": "b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd",
 "adjGateSha256": "4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac",
 "adjacency": { "verdict": "clean", "rows": 14, "verified": 14, "findings": 0 },
 "candidates": 52,
 "mapped": 9,
 "screened": 43,
 "unaccounted": 0,
 "newMapped": 4,
 "newMappedRows": [
  { "row": 12, "surface": "js-rendering-browser-execution", "sibling": "kake", "disposition": "split-declared" },
  { "row": 13, "surface": "robots-txt-publisher-audit-vs-client-obedience", "sibling": "kake", "disposition": "split-declared" },
  { "row": 14, "surface": "accessibility-browser-at-execution", "sibling": "kake", "disposition": "split-declared" },
  { "row": 15, "surface": "crawl-budget-vs-client-crawl-thresholds", "sibling": "kake", "disposition": "split-declared" }
 ],
 "screenFindings": [],
 "unaccountedKeys": [],
 "perLane": {
  "audio": 0, "chousa": 0, "game-dev-2d": 0, "game-dev-3d": 0, "kagi": 4,
  "kaidoku": 2, "kake": 42, "kama": 0, "kasegi": 0, "kengaku": 1, "kotoba": 1,
  "kotodama": 0, "kumitate": 0, "lore": 0, "mado": 0, "mori": 0, "revenger": 1,
  "souji": 0, "tameshi": 0, "tsukuroi": 1
 },
 "predicate": true
}
```

(`screened` + `mapped` = 43 + 9 = 52 = `candidates`; `perLane` sums to 52; raw one-line bytes in
`RerunC1/run1.json`, sha256 `4547a1ff…`.)

## Baseline — `--rev b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd` (exit 1)

```json
{
 "schema": "tabi-r33-c1-adjacency-sweep-v1",
 "rev": "b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd",
 "baseline": "b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd",
 "adjGateSha256": "4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac",
 "adjacency": { "verdict": "clean", "rows": 10, "verified": 10, "findings": 0 },
 "candidates": 52,
 "mapped": 5,
 "screened": 0,
 "unaccounted": 47,
 "newMapped": 0,
 "newMappedRows": [],
 "screenFindings": [],
 "unaccountedKeys": [
  "kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md:20",
  "kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md:59",
  "kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md:81",
  "kaidoku-shokunin@8b9634ed8253653e7eb994aad9860a624e3b0366:PROVINCE.md:137",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:22",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:23",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:60",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:61",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:72",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:79",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:302",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:303",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:304",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:322",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:323",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:338",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:340",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:342",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:343",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:345",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:347",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:352",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:358",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:359",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:362",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:364",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:367",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:373",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:375",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:376",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:377",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:394",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:396",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:398",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:408",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:410",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:411",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:412",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:418",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:420",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:422",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:431",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:438",
  "kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:440",
  "kengaku-shokunin@7984fd30892b54b1eff01054206ad54fc535021c:PROVINCE.md:54",
  "kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe:PROVINCE.md:73",
  "tsukuroi-shokunin@9cc9aa77e30e0e23de2d4d2697b3b218ada02969:PROVINCE.md:150"
 ],
 "perLane": {
  "audio": 0, "chousa": 0, "game-dev-2d": 0, "game-dev-3d": 0, "kagi": 4,
  "kaidoku": 2, "kake": 42, "kama": 0, "kasegi": 0, "kengaku": 1, "kotoba": 1,
  "kotodama": 0, "kumitate": 0, "lore": 0, "mado": 0, "mori": 0, "revenger": 1,
  "souji": 0, "tameshi": 0, "tsukuroi": 1
 },
 "predicate": false
}
```

This equals `claims.json` `C1.before` field for field (`candidates 52, mapped 5, screened 0,
unaccounted 47, newMapped 0, adjacency clean rows 10 verified 10`), and matches
`.ufo/waves/round-33/baseline/c1-J1-do-nothing.json`. The five baseline-mapped candidates are
`kaidoku:53`, `kake:34`, `kake:39`, `kagi:43`, `revenger:5` (the pre-round map). The baseline
unaccounted list holds `kagi:20/59/81`, `kaidoku:137`, `kengaku:54`, `kotoba:73`, `tsukuroi:150`
and the kake remainder, including `kake:61`, `kake:79`, `kake:304` and `kake:347` — exactly the
cited lines of new rows 12-15 (`corpus/adjacency.tsv` at `042d6d9`) — so the four new rows
demonstrably account for previously unaccounted candidates rather than re-citing already-mapped
lines.

## Invariance probes (all identical to run 1 unless stated)

| Probe | Command shape | Result |
|---|---|---|
| second run, same clone | run 2 | `sha256 4547a1ff…`, exit 0 — identical |
| full independent clone (93 MB `.git`, `git clone` not `--shared`), `clone2` at `042d6d9` | `--repo "$S/clone2"` | `cmp` identical to run 1, exit 0 |
| **dirty** clone2 worktree: appended `JUNK` row to `corpus/adjacency.tsv` and `x` to `corpus/adjacency-screen.tsv` (uncommitted; `M` on both) | `--repo "$S/clone2"` | output identical to run 1, exit 0 → the counter reads git objects at `--rev`, not the worktree, as its header claims; worktree dirt cannot move the predicate |
| alternate `TMPDIR=/tmp/rc1s` | `--repo "$S/clone"` | identical to run 1, exit 0; `ls -A /tmp/rc1s` empty → the scratch copy of `check-adjacency.mjs` is removed on exit |
| `$S/tmp` after all runs | `ls -la` | empty → no `tabi-r33-c1-*` temp dir left |
| non-`--json` mode | same rev | `C1_ADJACENCY_SWEEP predicate=met rev=042d6d9… adjacency=clean candidates=52 mapped=9 screened=43 unaccounted=0 newMapped=4 screenFindings=0`, exit 0 |
| candidate list | `--list-candidates` | 52 lines, byte-identical to `baseline/c1-candidates.tsv` |

## Input-wiring mutants (my own `clone2`, commits inside scratch only)

Two mutants prove the counter is wired to the artefacts at `--rev`, so the reproduced numbers are
the lane content's, not a constant:

- **M1 (`af08ffdda4aff3d7bd16118cab69a0e36092cc56`)** — delete the first data row of
  `corpus/adjacency-screen.tsv` (the `kagi:20` screen). Result: `mapped 9, screened 42,
  unaccounted 1`, `unaccountedKeys ['kagi-shokunin@69b61db…:PROVINCE.md:20']`, `newMapped 4`,
  predicate false, exit 1. Correct reaction.
- **M2 (`dbb38698e8db408afd21c20aaf81f69b0ac04dbd`)** — from `042d6d9`, delete map data row 12
  (`js-rendering-browser-execution`, kake). Result: `adjacency clean 13/13`, `mapped 8, screened 40,
  unaccounted 4`, `newMapped 3` (rows 12-14 renumber), predicate false, exit 1. `screenFindings`
  became `[{row 7,8,22, reason screen-surface-unmapped, detail 'js-rendering-browser-execution kake'}]`:
  three `same-surface` screens bind to the deleted row's surface, which is the counter's coupling of
  the two ledgers working as designed.

Both mutant commits were made after asserting `git -C "$D" rev-parse --show-toplevel` equals `"$D"`
(`/fast/scratch/hyaku/tabi-r33/RerunC1/clone2`), with `-c user.name=RerunC1 -c user.email=RerunC1@scratch.local`.
The lane checkout, its index and its jj state were never written; every lane command was
`git show`/`git diff`/`git log` (read-only) or `node` on a scratch copy.

## Observations (not defects)

1. **One-field byte delta vs the committed measure.** `cmp run1.json measure/c1-at-bf48b81.json`
   differs at char 51 — the `"rev"` value, which the counter echoes from `--rev`. Running the same
   bytes at `bf48b81c` reproduces the committed file byte for byte, and the normalised fields at
   `042d6d9` hash equal, so nothing but the revision id changed. The committed measure was produced
   at `bf48b81c` and committed at `042d6d9`; that is consistent with `git diff --numstat`, which
   shows the measure files as additions at `042d6d9` and C1 inputs unchanged.
2. **`newMapped` = 4 is exactly the target floor**, and all four are `split-declared` kake rows —
   the count carries no margin. Which is what the frozen predicate asks for; the semantic worth of
   each row is wave-2's other seats' object (CritC1Counter, MutC1Counter), not mine. I note only
   that a fifth qualifying row absent, or one row's `tabi` mention edited out, drops the predicate
   to false (M2 shows the shape of that failure).
3. **kake carries 42 of the 52 candidates**, so the sweep is dominated by one sibling; coverage of
   the other 19 pins rests on 10 candidates total. That is a property of the frozen regex and pins,
   not of this run.

## Cleanup, processes, tooling

- Scratch `/fast/scratch/hyaku/tabi-r33/RerunC1` removed after receipts were copied into
  `.ufo/waves/round-33/w2/RerunC1/`; `/tmp/rc1s` removed (verified empty before removal).
- No chromedriver/chromium was started. Final `pgrep -fa 'chromedriver|chromium'` matched no browser
  binary of mine: it returned the pre-existing host `earlyoom … --prefer … chromium` line, a peer's
  `awk` over a diff, and two peer `curl` fetches whose URLs contain `chromium` — none are my
  processes and none are a driver or browser.
- No tools installed or upgraded; no network fetches.
- No lane tracked file, lane index, sibling repo, fleet file or `~/.local/bin` entry was written.

## Deliverable paths

Report: `.ufo/waves/round-33/w2/RerunC1.md`

Receipts under `.ufo/waves/round-33/w2/RerunC1/`:

| File | sha256 | What |
|---|---|---|
| `c1-adjacency-sweep.mjs` | `da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380` | counter bytes from `e6b0a90` that I ran |
| `run1.json`, `run2.json`, `run_fullclone.json`, `run_dirty.json`, `run_alttmp.json` | `4547a1ff…` (all five) | `--rev 042d6d9` outputs, invariance probes |
| `run_bf48b81.json` | `681265e8…` | byte-identical reproduction of the L1 measure |
| `baseline.json` | `3a6952da…` | `--rev b7d16fb8` output, exit 1 |
| `cands.txt` | `ce7eb93e…` | `--list-candidates`, 52 lines, byte-identical to `baseline/c1-candidates.tsv` |
| `mut1.json`, `mut2.json` | `d2949810…`, `ef618274…` | screen-row and map-row wiring mutants, predicate false |
| `run1.err`, `run2.err`, `baseline.err`, `run_bf48b81.err`, `mut1.err`, `mut2.err` | `e3b0c442…` (empty) | stderr, all empty |
| `run1.pretty.json`, `baseline.pretty.json`, `mut1.pretty.json`, `mut2.pretty.json` | — | readability copies only; the raw one-line files above are the evidence |
