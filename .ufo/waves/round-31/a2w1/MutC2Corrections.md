# MutC2Corrections — a2w1 falsifier: mutation test of the C2 landing's appended corrections (round 31, attempt 2, wave a2w1)

## Verdict

The C2 landing's appended-corrections mechanism is **not vacuous**: of the seven tasked mutations applied one at a time to the landed correction bullets in `SKILL.md` / `corpus/README.md` at the integration commit `486048356f0712e4396588c9dab58cd419243120`, **six were killed** by the frozen v2 counter (`scripts/check-selfassessment.mjs`, sha256 `143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce` = `claims.json → frozenDigests`), each bringing back exactly the affected finding(s) and nothing else; the tasked **merge-two-bullets mutation survived** (mismatches stayed 0) — a coverage finding, consistent with the counter's documented paragraph-granular supersession, but it means the one-bullet-per-stale-line presentation is not load-bearing. Pristine baseline at `4860483`: exit 0, `mismatches 0, couldNotEvaluate 103, superseded 29, counted []`, numstat deleted 0 — byte-for-byte the frozen L1 reading; a final pristine re-run after all mutations reproduced it identically (`baseline.json` and `final-pristine.json` share sha256 `aa5a7657f65d6c11596e700bcc043d0ec2fcf2a8e967ef9fe2a7f3fbeff3abbb`). No lane tracked file, lane git index, or lane jj state was touched; every mutation lived in the seat scratch clone and was restored byte-identically.

## Method

- Lane root (read-only): `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Seat scratch: `/fast/scratch/hyaku/tabi-r31/MutC2Corrections-2` (`=$S`; removed after receipts were copied). Node `v24.21.0` (already installed; **no tools installed or upgraded** — nothing needed; pacman untouched).
- One live clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120` → HEAD `4860483…`, `rev-parse --show-toplevel` = the clone (verified before every commit), `status --porcelain` empty (verified per run; the counter's m3 requires it).
- Detector (identical for pristine/mutant/restored), counter JSON always to a file, never piped:
  `TMPDIR=$S TMP=$S TEMP=$S node scripts/check-selfassessment.mjs --rev <mutant-rev> --json > "$S/<probe>.json"` (cwd `=$S/clone`).
- Per mutation: `edit` the appended corrections → `git -C "$D" add` + `git -C "$D" -c user.name=MutC2Corrections-2 -c user.email=mutc2@scratch.local commit` → counter to file → `jq` summary read from the file → `git -C "$D" reset -q --hard 486048356f0712e4396588c9dab58cd419243120` → sha256 both documents. The counter's gate-oracle compares each gate blob at `--rev` with the working copy, so committing before running was required and done.
- Ground truth used to form expectations: the counter's production logic (`m1LogFindings` with `lineOnly=true` for the SKILL.md/corpus/README.md windows; supersession = a later paragraph that names the same script, carries `/supersed|correct/i`, `citesLine(text, doc, f.line)`, and `statedTallyNumbers(text).includes(f.observed)`; `counted = observed ≠ null ∧ observed ≠ claimed ∧ ¬superseded`).

## Baseline (pristine, `4860483`)

```
$ sha256sum "$S/clone/scripts/check-selfassessment.mjs"
143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce   (= claims.json frozenDigests)
$ sha256sum "$S/clone/SKILL.md" "$S/clone/corpus/README.md"
12e3806d6277fcb4de4a324b39ac33412f877c00c3bec5f7b10b5064f5cb4599  SKILL.md
643dcd02ee06b6c1c65d0dac83c2c0385e0a81f2b7a02c275f4033755e59d1b8  corpus/README.md
$ node scripts/check-selfassessment.mjs --rev 486048356f0712e4396588c9dab58cd419243120 --json   # > baseline.json
exit=0   {"mismatches":0,"couldNotEvaluate":103,"superseded":29,"counted":[],"clean":true}
$ git diff --numstat 9505a10eb80b2a0b273ebaba3f7f872ad302192d 486048356f0712e4396588c9dab58cd419243120 -- SKILL.md corpus/README.md SCORECARD.md LOG.md
4 0 SCORECARD.md   22 0 SKILL.md   25 0 corpus/README.md   → deleted=0
```

`git log --stat 9505a10e..4860483` shows no `scripts/` path — the C2 kill rule's scripts-freeze holds at the integration commit. Each tasked citation token occurs exactly once in its document (`SKILL.md:1614` ×1, `corpus/README.md:613` ×1), so a single-bullet mutation has exactly one affected finding.

## Results table

| # | Mutation (receipt label) | Point mutated | Expected | Observed (counter at mutant rev) | Verdict |
|---|---|---|---|---|---|
| mut1 | drop the `SKILL.md:1614` citation (`mut1`) | check-sources bullet, SKILL.md:2588 | 1 mismatch — SKILL.md:1614 (25 vs 26) resurfaces; superseded 29→28; exit 1 | `mismatches 1, couldNotEvaluate 103, superseded 28`, counted `[{SKILL.md, 1614, 25→26}]`, exit 1 | **KILLED** |
| mut2 | cite line off by one, `SKILL.md:1614`→`:1615` (`mut2`) | same bullet | 1 mismatch at 1614; no false finding at 1615 (prose line) | `mismatches 1`, counted `[{SKILL.md, 1614, 25→26}]`, exit 1 | **KILLED** |
| mut3 | state the stale number: `(26/26)`→`(25/25)` (`mut3`) | same bullet | bullet line itself caught (claimed 25, observed 26) while 1614 stays superseded — the paragraph's prose `cases=26` still satisfies `statedTallyNumbers` | `mismatches 1, superseded 29`, counted `[{SKILL.md, 2588, 25→26}]`, exit 1 | **KILLED** (see F2) |
| mut4 | cite `SCORECARD.md:1614` instead (`mut4`) | same bullet | 1 mismatch at 1614 (cross-document citation rejected) | `mismatches 1, superseded 28`, counted `[{SKILL.md, 1614, 25→26}]`, exit 1 | **KILLED** |
| mut5 | remove the script path: `` `scripts/check-sources.mjs` ``→`` `check-sources.mjs` `` (`mut5`) | same bullet | 1 mismatch at 1614; the path-less bullet's own tally degrades to ambiguous association (couldNotEvaluate 103→104) | `mismatches 1, couldNotEvaluate 104, superseded 28`; findings: line 1614 counted, line 2588 `script:null … couldNotEvaluate:"ambiguous script association"`, exit 1 | **KILLED** |
| mut6 | move the paragraph above the stale line (`mut6`) | check-sources bullet cut from the corrections section and inserted directly above the stale registry row (all later lines shift +2) | 9 mismatches — the moved paragraph can no longer supersede (paragraph start ≤ stale line) and every later citation (`:2479 :2514 :2515 :2529 :2530 :2543 :2544`, plus the freeze-time `:2545`) now points 2 lines short | `mismatches 9, superseded 20`, counted lines `1616 2481 2516 2517 2531 2532 2545 2546 2547` (claimed/observed pairs 25→26, 13→30, 5→10, 17→30, 7→10, 20→30, 20→29, 7→10, 22→30), exit 1 | **KILLED** |
| mut7 | merge two bullets into one paragraph (`mut7`) | blank line removed between the s106 `:2529` and selfassessment `:2530` bullets → one 2-line paragraph | tasked expectation: the affected findings come back | `mismatches 0, couldNotEvaluate 103, superseded 29, counted []`, exit 0 | **SURVIVED** (F1) |
| mut8 | (variant of the tasked stale-number mutation, README window) `(30/30)`→`(17/17)` in the `corpus/README.md:613` bullet (`mut8`) | README.md:668 | 2 mismatches — stale row 613 resurfaces (no prose `cases=` fallback in that paragraph) AND the mutated bullet line itself (17 vs 30) | `mismatches 2, superseded 28`, counted `[{corpus/README.md, 613, 17→30}, {corpus/README.md, 668, 17→30}]`, exit 1 | **KILLED** |

## Findings (coverage only — nothing repaired, no contract changed)

- **F1 (survivor, low): bullet structure is not load-bearing.** Merging two adjacent correction bullets into one paragraph leaves the verdict untouched (`mut7`: mismatches 0, superseded 29). The counter's supersession is paragraph-granular by design (m1LogFindings docstring: "the correction unit being a paragraph (Markdown wraps one correction over several lines)"), and the merged paragraph legitimately names both scripts, carries the correction marker, cites both stale lines and states both oracle numbers — so per its own spec this is not a false clean. But it bounds what the counter vouches for: a landing that merged all eight SKILL.md bullets into one paragraph would read exactly as clean as the landed one-bullet-per-line presentation. The distinction the C2 claim rests on is the citations + oracle numbers, not the bullet layout.
- **F2 (nuance, informational): supersession is satisfied by any tally-shaped oracle number anywhere in the paragraph.** mut3 shows the stale line stayed superseded even with the bullet's fraction mutated to `(25/25)`, because the same paragraph's prose `SOURCES_SELFTEST verdict=clean cases=26` feeds `statedTallyNumbers`; the wrong fraction was caught only because the bullet line is itself a scanned tally claim (claimed 25 vs observed 26). Symmetrically, a correction paragraph whose only oracle-shaped token is wrong but which carries the right number in an unrecognized shape (e.g. spelled out) would un-supersede a stale line. In the landed bytes every bullet's fraction is the oracle number and every stale line is correctly superseded, so this is not a defect in the landed state — it is the shape of the next gaming attempt the counter would face.
- **numstat layer (not mutation-tested, deterministic):** every in-place mutation shows as 1 deleted + 1 inserted (mut6: 2/2) in `git diff --numstat 9505a10e… <rev> -- SKILL.md corpus/README.md`, so any of these hypothetical landings would additionally fail the C2 predicate's 0-deleted-lines requirement independent of the counter. The counter's mismatch detection caught the semantic damage on its own in 7/8 probes.

## Restoration evidence

After every probe: `git -C "$D" reset -q --hard 486048356f0712e4396588c9dab58cd419243120`, then hashes — all eight runs and the final state:

```
SKILL.md          12e3806d6277fcb4de4a324b39ac33412f877c00c3bec5f7b10b5064f5cb4599   (= pristine, ×9)
corpus/README.md  643dcd02ee06b6c1c65d0dac83c2c0385e0a81f2b7a02c275f4033755e59d1b8   (= pristine, ×9)
final: porcelain=0  head=486048356f0712e4396588c9dab58cd419243120
final pristine rerun: exit=0 {"mismatches":0,"couldNotEvaluate":103,"superseded":29,"counted":[]}
```

Mutant commit shas (scratch clone only, all reset away): mut1 `15515a26ac5bb6c26fb9100c914a381b9d8122f9`, mut2 `456f8c5995e9983f5a9e840947581ad75488fa96`, mut3 `c3685862a12c21042b989bf5be12afa760307043`, mut4 `0d4b4e508158e31c48e9faa593d94e2f45ea1acd`, mut5 `ee80fc14d292540e1b4b4da358840489e4935b51`, mut6 `3c12847dc76e47c5cedcae8e0177b74b0fc4b766`, mut7 `f0424aeb255ee1ac55734e7b01c718d6f46d959e`, mut8 `677e6e7e368374d8b4ed9ba523e7b5d926c77e95`.

## Commands and exit codes (as run)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120   # exit 0; toplevel/porcelain verified
node scripts/check-selfassessment.mjs --rev 486048356f0712e4396588c9dab58cd419243120 --json > "$S/baseline.json"    # exit=0 (wall ~30 s)
# per probe: edit → commit → run → restore
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 9                                                     # ×8, always true
git -C "$D" add <file> && git -C "$D" -c user.name=MutC2Corrections-2 -c user.email=mutc2@scratch.local commit -q -m "mutN: …"   # ×8, exit 0
TMPDIR=$S TMP=$S TEMP=$S node scripts/check-selfassessment.mjs --rev "$REV" --json > "$S/mutN.json"                 # mut1_exit=1 mut2_exit=1 mut3_exit=1 mut4_exit=1 mut5_exit=1 mut6_exit=1 mut7_exit=0 mut8_exit=1
git -C "$D" reset -q --hard 486048356f0712e4396588c9dab58cd419243120; sha256sum "$D/SKILL.md" "$D/corpus/README.md"  # ×8, pristine hashes back
node scripts/check-selfassessment.mjs --rev 486048356f0712e4396588c9dab58cd419243120 --json > "$S/final-pristine.json"   # final_exit=0
rm -rf "$S"   # after receipts copied and digested
```

No network fetches were needed (no new sources; no `api.github.com`, no credentials, no cookies). No tool installs/upgrades (node `v24.21.0` present; pacman untouched). No lane tracked file, lane git index, lane jj state, fleet repo, sibling lane repo, or `/home/vgpnk/Projects/shokuknow` was modified; read-only git in the lane; all commits and mutations lived in the seat scratch clone and were restored byte-identically.

## Receipts (this directory: `.ufo/waves/round-31/a2w1/MutC2Corrections/`)

`baseline.json`/`.err` (pristine at `4860483`), `mut1…mut8.json`/`.err` (counter output per mutant), `final-pristine.json`/`.err` (post-restoration rerun; byte-identical to `baseline.json`, sha256 `aa5a7657f65d6c11596e700bcc043d0ec2fcf2a8e967ef9fe2a7f3fbeff3abbb`). Seat scratch `/fast/scratch/hyaku/tabi-r31/MutC2Corrections-2` was removed after the receipts were copied.
