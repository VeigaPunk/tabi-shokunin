# Exec12 — round 28 wave 1: C2 do-nothing control & LOG.md:221 finding

Seat: Exec12 (leaf). Item: run the current selfassessment counter at baseline and tip; report the LOG.md:221 finding; cite the frozen claims path. No implementation performed (claim-attack reporting only).

## Frozen claims cited
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (line 12, claim C2): "before":"tip presently reports a false-clear of LOG.md:221 per corpus/lessons/round-27-verifier-spotcheck.md:15"; "control":"Do-nothing control reproduces the known false-clear at LOG.md:221; frozen counter target cannot be reached without changing matcher behavior." C2 target: "LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest contains both red false-clear and green exact citation cases."

## Revisions (observation)
- `git rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; `git cat-file -t eb23c0b…` → `commit`; `git merge-base --is-ancestor eb23c0b… HEAD` → exit 0. **Tip == baseline** (single revision). `git status --porcelain` shows only `?? .ufo/waves/round-28/` (untracked wave scaffold incl. claims.json and this report/scratch).

## Do-nothing control runs (observation; rev pinned eb23c0b…)
| Run | Command | mismatches | clean | superseded | couldNotEvaluate | exit |
|---|---|---|---|---|---|---|
| baseline | `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | 1 | false | 10 | 92 | 1 |
| tip | same with `--rev HEAD` | 1 | false | 10 | 92 | 1 |
| clone baseline | run inside `git clone` of HEAD at scratch/Exec12/dnclone | 0 | true | 10 | 92 | 0 |
| clone tip | same, `--rev HEAD` | 0 | true | 10 | 92 | 0 |

- Baseline vs tip outputs in the lane differ only in `m3-unlanded-paths.observed` (15 vs 18): m3 reads live `git status --porcelain`; the count grows as my own scratch/report files land in the untracked round-28 wave dir. All m1/m2/M including the LOG.md:221 entry are byte-identical. In the clean clone, baseline and tip outputs are byte-identical (`cmp` clean, both exit 0).
- Conclusion: do-nothing control reproduces the known false-clear — in a clean checkout of the frozen revision the counter reports `clean=true, mismatches=0` while LOG.md:221 still holds a stale tally.

## LOG.md:221 finding (observation)
Counter JSON entry (identical in all runs): `{"class":"m1-selftest-tally","doc":"LOG.md","line":221,"script":"scripts/check-freshness.mjs","claimed":8,"observed":12,"superseded":true,"lineText":"  exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,"}`.
- The tally text is the committed LOG.md:221 blob (worktree LOG.md equals blob; no tracked modifications). Quote: "`FRESHNESS_SELFTEST verdict=clean cases=8`" (LOG.md:221).
- `superseded=true` ⇒ the stale tally (claimed 8 vs measured 12) is excluded from `mismatches`. The C2 target ("LOG.md:221 appears as a mismatch unless an exact-line correction cites it") is therefore **unmet** at baseline: 221 is not a mismatch.

## Mechanism (observation of matcher source + inference)
`scripts/check-selfassessment.mjs` lines 319-327: a stale finding f is cleared when ANY later paragraph (a) names the same script, (b) matches `/supersed|correct/i`, (c) matches `/:\d+/` — any colon-number token anywhere — and (d) states f.observed in a tally shape. Condition (c) is not anchored to `f.line`.
- Correction bullets at LOG.md:1904-1919 ("Correction (supersedes LOG.md:335)" … :391/:1090/:1103/:1863) all name `scripts/check-freshness.mjs` and state `cases: 12`; under rule (c) any of them satisfies the citation predicate for line 221 though none cites :221. (Inference: the counter exposes only the boolean; the firing paragraph is not identified in output. The round-27 verifier note — LOG.md:1930-1932 — states: "accepts any colon-number token as the cited superseded line. It therefore marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221.") - Negative sweep: `grep ':221' LOG.md` matches only the defect-narrative paragraph (LOG.md ~1929-1934); no correction bullet "supersedes LOG.md:221" exists anywhere in LOG.md.

## Selftest baseline (observation)
`node scripts/check-selfassessment.mjs --selftest --json` (rev-independent, applies to current script bytes) → cases=17, passed=17, exit 0. Existing citation cases: `m1-log-stale-then-corrected` (green exact-citation control, present), `m1-log-wrong-number-correction` (red wrong-number, present), `m1-stale-then-superseded` (SCORECARD green). **No red unrelated-citation fixture exists** — the C2 target's "red false-clear case" is absent pre-implementation.

## C2 status at baseline
- Before matches claims.before: false-clear of LOG.md:221 reproduced.
- After target unmet: LOG.md:221 superseded (not a mismatch); selftest lacks the red unrelated-citation case (green exact-citation control present).

## Environment
- No tool installs/updates (nothing installed; no pacman transaction). Node v24.21.0.
- Scratch artifacts: `.ufo/waves/round-28/scratch/Exec12/{baseline.json,tip.json,baseline2.json,tip2.json,clone-baseline.json,clone-tip.json,selftest.json,dnclone/}`.
- No lane tracked files modified; read-only git.
