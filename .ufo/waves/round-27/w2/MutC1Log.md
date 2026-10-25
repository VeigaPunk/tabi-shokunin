# MutC1Log — C1 LOG-window supersession: four mutation probes (round 27, wave 2)

Seat: `TabiR27.MutC1Log` (mutation-tester, leaf, read-only reporter). Date 2026-10-25.
Artifact attacked: the shipped C1 extension in `scripts/check-selfassessment.mjs` — the LOG.md
supersession predicate at `:316-328` and its number-shape helper `statedTallyNumbers()` at
`:246-254`. Probe copies only; the lane file was never modified.
Revisions: pinned counter rev `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` (per ticket); tip
`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (m4 real-breakage leg only). Both resolve
(`git -C <lane> rev-parse --verify <rev>^{commit}` → echo, one per rev).
Lane gate sha256 before = after: `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab`.
Tooling: none installed or upgraded. `node v24.21.0`, `git 2.56.0` (already present). No external
fetches. No builds/linters/formatters. Scratch root:
`.ufo/waves/round-27/scratch/TabiR27.MutC1Log/` (fixtures, mutants, raw JSON receipts under `out/`).

## 1. Wave-1 findings folded (each mutant names its source)

- **m1** attacks the ordering guard `if (p.start <= f.line) return false;` (`:320`). Wave-1
  `ExecC1Attacks.md` case 17 "(o) correction paragraph placed before the stale line → PASS
  (ordering enforced)"; this probe checks the guard is load-bearing, not decorative.
- **m2** attacks the same-script arm (`:322-323`). Wave-1 `ExecC1Attacks.md` cases 4/5 "(b)
  names different script → PASS"; `CritC1Supersession.md` §1 lists the arm as implemented
  correctly — this probe tries to break that.
- **m3** attacks the number arm `statedTallyNumbers(text).includes(f.observed)` (`:326`).
  Wave-1 `ExecC1Attacks.md` F2 "satisfied by any `\bN/M\b` fraction or any `N-case` phrase
  anywhere in the paragraph" and `CritC1Supersession.md` §1 "the 'oracle-correct number' can
  arrive from an unrelated `13/20`" — this probe measures exactly how far shipped already
  allows, then widens to every bare number.
- **m4** attacks the missing section scope. Wave-1 `ExecC1Attacks.md` F3 (blank-line paragraph
  unit; `LOG.md:1904-1925` is one 22-line paragraph) and `CritC1Supersession.md` §10.1
  (predicate table) motivate asking whether same-section scoping would break anything real.

## 2. Detector (identical for pristine / mutant / restored)

One driver, five targets each: `sh .ufo/waves/round-27/scratch/TabiR27.MutC1Log/run-detector.sh
<gate.mjs> <label> [full|short]`. Runs, each saved as JSON under `out/`:
`node <gate> --repo <repo> --rev <rev> --json` (counting command as frozen) and
`node <gate> --selftest --json` (failure-capable suite). `short` = lane@4ad4c77 + selftest +
six fixtures; `full` adds lane@5ed6484. Fixtures are six throwaway git repos
(`build-fixtures.sh`; every git call `-C "$D"`; `rev-parse --show-toplevel` asserted equal to
`$D` before the first commit; gate `scripts/check-fixture.mjs` prints
`FIXTURE_SELFTEST verdict=clean cases=13 passed=13`, oracle 13):

| fixture | HEAD | LOG.md shape (line numbers of the rev blob) |
|---|---|---|
| fx-order-green | `724e81fa3932558a84537e51799eebf5b1a68464` | stale tally `:7` (12, oracle 13); correction `:9` cites `:7`, same script, `cases: 13` |
| fx-order | `b7c0d581f1d6fc29567d46619548d9559e2a9b60` | correction `:5` cites `:9`; stale tally `:9` (12) — correction BEFORE the stale mention |
| fx-script | `187d2879f1121bf7e0407ec46f27813f1c577253` | stale `:7` in `## Round 23`; correction `:11` in `## Round 24` names only `scripts/check-other.mjs` (present gate, oracle 13) |
| fx-number | `0d33c70e4864fc675748f7c5b4fc15be17ebec49` | stale `:7`; correction `:9` carries only the wrong tally shape `cases: 12` plus bare prose "the true figure is 13" |
| fx-number-frac | `0c0eea5feb761a92bfad23f2d7b9c660904e8bba` | stale `:7`; correction `:9` carries unrelated `13/20` plus wrong `cases: 12` |
| fx-section | `1413290527ad7b8ab1ccf88862a8ab47d0e05957` | stale `:7` in `## Round 23`; legitimate correction `:11` in `## Round 24`, same script, `cases: 13` |

Pristine baseline (all targets ran; a failed baseline would make every verdict inconclusive —
none failed):

```
pristine lane-5ed6484 rc=0 mismatches=0 superseded=10 cne=92 counted=[]
pristine lane-4ad4c77 rc=1 mismatches=5 superseded=5 cne=89 counted=[LOG:335:4->12,LOG:391:4->12,LOG:1090:66->26,LOG:1103:66->26,LOG:1664:12->13]
pristine selftest rc=0 selftest cases=17 passed=17 ok=true
pristine fx-fx-order rc=1 counted=[LOG:9:12->13] | fx-order-green rc=0 | fx-script rc=1 counted=[LOG:7:12->13]
pristine fx-number rc=1 counted=[LOG:7:12->13] | fx-number-frac rc=0 superseded=1 | fx-section rc=0 superseded=1
```

Observations: matches wave-1 ground truth (`ExecC1Attacks.md` §6 measured the same 5 counted
LOG findings at `4ad4c77`; tip mismatches=0). Two deltas vs wave-1 numbers are tree-state, not
predicate, differences: my `4ad4c77` run has no m3 term and superseded=5 — m3 reads the live
worktree (`:449-459` of the script), and the porcelain was empty at my run time, whereas wave-1
ran with 46 untracked wave paths. [INFERENCE] identical reasoning for their mismatches=6 vs my 5.

## 3. Verdicts

| mutant | edit (scratch copy only) | decisive detector | verdict |
|---|---|---|---|
| m1 | delete `:320` ordering guard | fx-order 1→0; lane@4ad4c77 counted 5→3 | **KILLED** |
| m2 | `:323` `return namesScript &&` → `return` | fx-script 1→0 | **KILLED** |
| m3 | insert bare-number collector into `statedTallyNumbers` (`:248`) | fx-number 1→0 | **KILLED** |
| m4 | require `secOf(p.start) === secOf(f.line)` (`:316-317,323`) | fx-section 0→1; lane tip 0→5 | **KILLED** |

### m1 — ordering guard (KILLED; load-bearing on fixtures AND real bytes)

Mutation: `m1.mjs` sha256 `e8681be241cd63019f82853d95bda952634492aefc4a5bdeecedef5adb8e92e3`
(pristine `de5d6676…`). Expected per frozen rule ("a later paragraph clears…"): the early
correction at `fx-order:5` must not clear the stale tally at `:9`.
Output: pristine `rc=1 mismatches=1 counted=[LOG:9:12->13]`; mutant
`rc=0 mismatches=0 superseded=1 counted=[]`. The mutant's only semantic change is admitting
earlier paragraphs, so the clearing paragraph is the `:5` correction [INFERENCE from the edit;
not independently attributed].
Real bytes, same command at the pinned rev: pristine counted
`[LOG:335,LOG:391,LOG:1090,LOG:1103,LOG:1664]`, superseded=5; mutant counted
`[LOG:1090,LOG:1103,LOG:1664]`, superseded=7 — two real baseline findings (:335 4→12, :391
4→12) are cleared by a paragraph that precedes them [INFERENCE: the dropped guard is the only
changed condition]. Command: `node m1.mjs --repo <lane> --rev 4ad4c77… --json`.

### m2 — same-script arm (KILLED on fixture; no delta at the pinned rev)

Mutation: `m2.mjs` sha256 `f9af14d6fb8840c05437bcf2d3aafb7e58498583e9eee2ce69337a07c8537a66`.
Expected: a paragraph naming only a different script must not clear.
Output: pristine `fx-script rc=1 counted=[LOG:7:12->13]`; mutant `rc=0 superseded=1 counted=[]`
— the `check-other.mjs` paragraph clears the `check-fixture.mjs` finding.
Real bytes at `4ad4c77`: no change (mutant mismatches=5, superseded=5, same counted list as
pristine; command as above). Observation with sweep: the delta search is the full detector run
(lane rev + all six fixtures + selftest); no real paragraph at the pinned rev carries the
oracle number plus marker plus citation while naming only a foreign script. Kill evidence is
the fixture, exactly the ticketed shape.

### m3 — every-bare-number widening (KILLED; trace answer below)

Mutation: `m3.mjs` sha256 `3c68c2b1cb3b6a47ff91723961454c69e3d9bbab0253fc2035c80bc85d6a3212`;
added line `:248` `for (const m of text.matchAll(/\b(\d+)\b/g)) out.push(Number(m[1]));`.
Expected: a paragraph whose only tally-shaped number is the wrong value must not clear.
Output: pristine `fx-number rc=1 counted=[LOG:7:12->13]`; mutant `rc=0 superseded=1 counted=[]`
— the wrong `cases: 12` shape is present, yet the bare prose "13" clears the finding. The
mutant thereby breaks the frozen wrong-number control (selftest id
`m1-log-wrong-number-correction` guards this shape in-tally-shape only).

**Does shipped already allow this? Trace of `statedTallyNumbers` (`:246-254`).** It collects,
in order: both numbers of any `` `--self-test` N/N `` (`:248`), `N-case` (`:249`),
`cases: N` / `cases=N` (`:250`), `N cases` (`:251`), and — not in the frozen tally-shape list —
**any bare `N/M` fraction** (`:252`). Measured consequence (`fx-number-frac`, pristine):
`rc=0 superseded=1` — an unrelated `13/20 spot checks` already satisfies the oracle-number arm
even alongside a wrong `cases: 12`. This confirms wave-1 F2 (`ExecC1Attacks.md` case 15/g′ and
`CritC1Supersession.md` fixture-d) on an independent fixture. What shipped does NOT accept is
the number arriving only as bare prose (`fx-number`, pristine `rc=1`); that residue is exactly
the mutant's delta. Answer: **partially already-allowed — fraction and case-phrase routes yes
(shipped, `:252` among others), plain bare text no.**

### m4 — same-section restriction (KILLED; yes, something real breaks — at the tip)

Mutation: `m4.mjs` sha256 `a7293060ef187fe1380445203dad027b21079f219e4a43fe74e255f7643d6fcd`;
adds section-boundary scoping (`:316-317`) and the same-section test (`:323`).
Fixture: pristine `fx-section rc=0 superseded=1` → mutant `rc=1 counted=[LOG:7:12->13]`. The
frozen rule has no same-section clause ("a later paragraph clears an earlier stale mention…",
`claims[0].declared`), and the append-only LOG convention is precisely a later round section
correcting an earlier one — the mutant forbids the convention.
Real bytes: at the pinned rev `4ad4c77`, no change (mutant mismatches=5, superseded=5, same
counted list — the only shipped clearance there, `:221` via the intra-preamble paragraph
`:265-447`, is same-section, so the restriction is behavior-preserving at the baseline).
At the tip `5ed6484`: pristine `rc=0 mismatches=0 superseded=10` vs mutant
`rc=1 mismatches=5 superseded=5 counted=[LOG:335:4->12,LOG:391:4->12,LOG:1090:66->26,LOG:1103:66->26,LOG:1664:12->13]`.
All five dispositions break: the round-27 correction block sits in a different `##` section
than every stale mention it clears. So the answer to "does anything real break?" is **yes at
the tip (the frozen after-arm mismatches=0 dies, 0→5), no at the pinned baseline** — measured,
both with the same detector.

## 4. Coverage finding: the shipped failure-capable suite kills none of the four

`node <gate> --selftest --json` → `cases=17 passed=17 ok=true` under pristine AND under all
four mutants (rc=0 each). No case places a correction before the stale line, names a foreign
script, carries a wrong tally shape beside a bare correct number, or spans sections — the four
guards are untested, so the declared kill-rule surface ("m1-log-* cases") cannot detect any of
these predicate breakages. A surviving mutant is a coverage finding, not a contract change:
the four red shapes above are the missing cases.

## 5. Restoration evidence

- Mutant copies (scratch only): hashes in §3. Pristine copy and lane file:
  `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` before and after all runs.
- `cp <lane>/scripts/check-selfassessment.mjs restored.mjs && cmp pristine.mjs restored.mjs` →
  IDENTICAL; sha256(restored) = `de5d6676…`.
- Restored re-run on the decisive fixture: `node restored.mjs --repo <scratch>/repos/fx-order
  --rev b7c0d581f1d6fc29567d46619548d9559e2a9b60 --json` → rc=1, output byte-identical to the
  pristine run (`diff -q` clean).
- Lane untouched: `git -C <lane> status --porcelain -- scripts/ | wc -l` → `0`.

## 6. Limits and non-claims

- All outputs are from the listed commands; JSON receipts: `out/<label>-<target>.json` for
  every run quoted above. m3 counted terms vary with the live worktree (noted in §2) and are
  excluded from every verdict; verdicts rest on the LOG-window counted lists, superseded
  counts, and exit codes of identical commands on identical inputs.
- [INFERENCE] items are labeled inline (paragraph attribution for m1's real-bytes clears).
- Nothing landed in tracked files; no git/jj writes anywhere; no sibling lanes, fleet repo, or
  `/home/vgpnk/Projects/shokuknow` touched; no messaging beyond this report.
