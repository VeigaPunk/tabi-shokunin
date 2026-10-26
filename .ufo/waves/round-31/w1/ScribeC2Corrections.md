# C2 correction drafts — ScribeC2Corrections (round 31, w1)

**Verdict.** The nine stale self-test tallies that the frozen v2 `scripts/check-selfassessment.mjs` reports at
`9505a10eb80b2a0b273ebaba3f7f872ad302192d` now have an append-only correction draft each, and the drafts were
proven sufficient in a scratch clone: appending exactly the three delivered files (SKILL.md, corpus/README.md,
SCORECARD.md) and committing produced `mismatches 0`, exit 0, with 0 deleted lines in the four counted documents
and `scripts/` byte-unchanged (`git diff --name-only 9505a10 <probe> -- scripts/` = 0 files). Every stale line is
present in that run's findings as `superseded=true`, so the zero is per-line supersession, not silent suppression.
The drafts carry no lane edit: they are text files for the L1 to append verbatim at the end of each document.

## Deliverables (in `.ufo/waves/round-31/w1/ScribeC2Corrections/`)

| File | Appended to | Content |
|---|---|---|
| `skill-corrections.md` | `SKILL.md` (after line 2580, the round-31 freeze-time `SKILL.md:2545` correction paragraph) | `## Round 31 — corrections (append-only; …)` heading, one measured preamble, eight bullets — one per stale line |
| `readme-corrections.md` | `corpus/README.md` (after line 661) | heading + one bullet for `corpus/README.md:613` |
| `scorecard-1523.md` | `SCORECARD.md` (after line 1564, the round-31 freeze-time corrections section) | heading + one bullet for the routed round-30 defect 1 at `SCORECARD.md:1523` |
| `c2-after-probe.json` | — | full counter output at the probe commit (`mismatches 0`, `counted []`) |
| `probe-transcript.txt` | — | every command, exit code and historical tally behind the attribution |

## The nine stale lines, and why each is stale

All `observed` values are the `cases=` field of the gate's own `<NAME>_SELFTEST` summary line, read at
`9505a10` in the clean clone with `TMPDIR` under scratch.

| Line | Script | claimed → observed | Went stale in | Evidence |
|---|---|---|---|---|
| `SKILL.md:1614` | `scripts/check-sources.mjs` | 25 → 26 | round 1, post-review commit `5cdc976` | probe at `a4115fa` prints `cases=25`; `5cdc976` adds case `row-outside-registry` (25 → 26); blob `3f96058f…5646b` at `5cdc976` is identical to the one at `9505a10` |
| `SKILL.md:2479` | `scripts/check-selfassessment.mjs` | 13 → 30 | round 27 (`fd722a7`), then 28, 29, 31 | `fd722a7` 17 → `b4128c4` 20 → `97be89b` 22 → `9505a10` 30 |
| `SKILL.md:2514` | `scripts/check-s106-evidence.mjs` | 5 → 10 | round 28 (`b4128c4`), then 30 | 5 at `eb23c0b` (round-27 tip) → 7 at `b4128c4` (+ `measured-revision-bytes-match`, `…-mismatch`) → 10 at `38891ca` |
| `SKILL.md:2515` | `scripts/check-selfassessment.mjs` | 17 → 30 | round 28 (`b4128c4`) | 17 at `fd722a7`, 20 at `b4128c4` |
| `SKILL.md:2529` | `scripts/check-s106-evidence.mjs` | 7 → 10 | round 30 (`38891ca`) | 7 at `b4128c4` → 10 (+ `same-length-tamper-invalid`, `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid`) |
| `SKILL.md:2530` | `scripts/check-selfassessment.mjs` | 20 → 30 | round-29 freeze (`97be89b`) | 20 at `b4128c4` → 22 (+ `m1-scorecard-crossdoc-citation-not-superseded`, `m1-log-crossdoc-citation-not-superseded`) |
| `SKILL.md:2543` | `scripts/check-release-pins.mjs` | 20 → 29 | round 30 (`38891ca`) | 20 at `59e8167` (gate creation, round 29) → 29 (+ the nine reason-pinned cases) |
| `SKILL.md:2544` | `scripts/check-s106-evidence.mjs` | 7 → 10 | round 30 (`38891ca`) | same three round-30 cases as `:2529` |
| `corpus/README.md:613` | `scripts/check-selfassessment.mjs` | 17 → 30 | round 28 (`b4128c4`) | row written with the round-27 tally 17; 20 at the round-28 tip |

Freeze-time tallies measured for the drafts (declared flags, `TMPDIR` set, all exit 0):

```
SOURCES_SELFTEST      verdict=clean cases=26
SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30
S106_SELFTEST         verdict=clean cases=10 passed=10
RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29
```

## Requirements the drafts satisfy, and the traps avoided

The counter (`m1LogFindings` with `lineOnly=true` for SKILL.md and corpus/README.md) clears a stale tally only
when a later non-blank paragraph (a) names the same `scripts/<gate>.mjs`, (b) matches `/supersed|correct/i`,
(c) cites the same document and a line containing the stale line via `citesLine`, and (d) contains the observed
number in a shape `statedTallyNumbers` recognises. Each draft bullet:

- names exactly one script and cites exactly its own line, so no bullet can clear a different script's finding;
- states the observed number as `` `--selftest` (N/N) `` (or `` `--self-test` (26/26) `` for check-sources), which
  both satisfies (d) and, because `claims[0]` is the only claim the counter compares, keeps the bullet itself clean
  (`claimed == observed`);
- deliberately spells every *stale* figure as a bare numeral with no tally shape ("the figure 13"), because a bullet
  that restated a stale figure as `13/13` or `13 cases` would create a fresh mismatch at its own line — the
  `c2-J3-uncited-correction` and `c2-J4-wrong-doc-citation` controls show the window is literal about both.

`citesLine` requires `corpus/README.md:N` (not `README.md:N`) for the corpus document; `readme-corrections.md`
uses `corpus/README.md:613`. `scorecard-1523.md` uses `SCORECARD.md:1523`.

## Routed round-30 defect 1 (`SCORECARD.md:1523`)

`scorecard-1523.md` restates the row's sentence as measured, and I read the receipts directly rather than taking
the numbers from the routed text:
`.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt:130` =
`SELFASSESSMENT verdict=failed rev=0ffc6ea01fea2… mismatches=3 could_not_evaluate=92 superseded=15`, and
`.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt:1` =
`{"mismatches":1,"counted":[{"class":"m1-selftest-tally","doc":"SCORECARD.md","line":1527,"claimed":12,"observed":2}]}`.
So the residual 1 at `d3cd62a1` is exactly the `SCORECARD.md:1527` pairing, read as 12 against 2 — the round-30
counter took the first `cases` token and a per-case refusal message in the gate-mutants self-test output shadowed
that gate's own summary line (`GATE_MUTANTS_SELFTEST … cases=12 passed=12`, observed separately at `9505a10`,
exit 0). The paragraph intentionally carries **no** tally shape: it names
`scripts/check-gate-mutants.mjs` and could otherwise register as a claim on that script. Verified inert — the
probe run reports `counted: []` with the paragraph appended.

## Commands run (all in the scratch clone, `git status --porcelain` = 0 before the probe commit)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q 9505a10…   -> HEAD 9505a10, clean
git show 9505a10:scripts/check-selfassessment.mjs | sha256sum            -> 143d66ff…db2fce = claims.json frozenDigests
node scripts/check-sources.mjs --self-test                               -> cases=26, exit 0
node scripts/check-selfassessment.mjs --selftest                         -> cases=30 passed=30, exit 0
node scripts/check-s106-evidence.mjs --selftest                          -> cases=10 passed=10, exit 0
node scripts/check-release-pins.mjs --selftest                           -> cases=29 passed=29, exit 0
node scripts/check-selfassessment.mjs --rev e92a6b548b8b66b7b8bf24b89ec19a03e91c6546 --json
                                                                         -> exit 0, mismatches 0, clean true, counted [],
                                                                            29 findings superseded=true (all nine stale lines among them)
git diff --numstat 9505a10 e92a6b5 -- SKILL.md corpus/README.md SCORECARD.md LOG.md
                                                                         -> 15 0 / 7 0 / 4 0; deleted total 0
git diff --name-only 9505a10 e92a6b5 -- scripts/                          -> 0 files
```

Probe commit: `e92a6b548b8b66b7b8bf24b89ec19a03e91c6546` inside `$HYAKU_SCRATCH/tabi-r31/ScribeC2Corrections/clone`
only (`-c user.name=ScribeC2Corrections -c user.email=ScribeC2Corrections@scratch.local`); the clone was removed
after `c2-after-probe.json` and `probe-transcript.txt` were copied out. An earlier probe (`ab6f47c`) ran the first
draft of `scorecard-1523.md` and also read `mismatches 0`; grounding that paragraph in the round-30 receipts changed
its text, so the final delivered text was re-appended to a fresh clone and re-measured as above.

## Findings for the L1

1. **Append position is load-bearing.** All three files must go at the very end of their document. Any insertion
   above a cited line shifts every later citation; the `c2-J2-delete-lines` control (mismatches 1, numstat 9
   deleted) is exactly that failure. `SKILL.md` already ends with the freeze-time `SKILL.md:2545` correction
   paragraph — the round-31 corrections section must follow it, not precede it.
2. **`scripts/check-sources.mjs` accepts `--self-test`, not `--selftest`.** `--selftest` yields
   `SOURCES_GATE verdict=could-not-evaluate detail=bad_arguments`, exit 2. The counter derives the flag from the
   script (`SELF_TEST_FLAG`) and is unaffected; a human re-measuring `SKILL.md:1614` is not.
3. **`SKILL.md:1614`'s figure has been wrong since round 1.** The script blob is byte-identical from `5cdc976`
   (round-1 post-review, which added `row-outside-registry`) through `9505a10`, so 25 → 26 is not a round-31
   effect and the line was stale against its own gate for the whole life of the value it states.
4. **`SOURCES_SELFTEST` prints no `passed=` field.** The v2 oracle regex
   `<NAME>_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)` reads it correctly; any future counter item that expects
   `passed=N` on every gate summary would refuse this one.
5. **30 cases = 28 `CASES` ids + 2 runner cases.** `runSelftest` pushes `refusal-bad-rev-syntax` and
   `refusal-unresolvable-rev` outside the `CASES` array (same at 22 = 20 ids + 2). The 22 → 30 delta is eight new
   `CASES` ids, matching claims.json; re-deriving 30 from the array length would read 28.
6. **`SCORECARD.md:1527` reading 12 → 24 at the probe is pre-existing, not new.** That line states two tallies and
   names two scripts; the counter pairs its first claim with `scripts/check-frontier-admission.mjs` (24), and the
   finding is already superseded at the freeze — it is not among the nine. `scripts/check-gate-mutants.mjs` prints
   `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` at `9505a10`.
7. **The freeze-time correction paragraph carries a latent claim token: do not reflow it.** `SKILL.md:2580` reads
   "22-case tally on that line was the gate's own count…". In this probe it is `could-not-evaluate`
   (`SKILL.md:2579 22->null`) only because the script name sits on the previous line — the round-31 windows associate
   a tally with scripts named on its own line. Join those two lines into one and the `22-case` token becomes a claim
   of 22 against an observed 30, i.e. a new mismatch created by an edit to a correction paragraph.
8. **Other `null`-observed rows are not mismatches.** The same probe lists `SKILL.md:1886, 2027, 2028, 2092, 2471`
   and `corpus/README.md:358, 359, 422` as claim rows with `observed: null` (could-not-evaluate: no script on the
   line, script outside the runnable set, or an unreadable target). They are outside the predicate's `mismatches`
   count and predate this round; they are not C2 work.

## Limits / out of scope

- No lane file, lane index, lane jj state or fleet repo was touched; the only writes are this report, this output
  directory, and the deleted scratch clone. Revisions `a4115fa`, `5cdc976`, `fd722a7`, `b4128c4`, `97be89b`,
  `5577d1b`, `eb23c0b`, `59e8167`, `38891ca`, `96a2d1a` were read via `git show` only.
- No network fetch, no runtime claim, no build/lint/formatter run, no tool installed or upgraded.
- The C2 predicate is not claimed here: it needs the L1's own clean checkout of the measured REV with the frozen
  counter bytes. This seat supplies drafts plus one scratch demonstration that they reach `mismatches 0`.
- The numbers in `scorecard-1523.md` are read from the round-30 measure files themselves
  (`.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt:130` `mismatches=3`;
  `.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt:1` residual 1, `SCORECARD.md:1527 claimed 12 observed 2`),
  not from the routed-defect sentence; `corpus/lessons/round-30-verifier-spotcheck.md` §Routed defects 1 is cited
  as the routing, and M8 as the cause.
- The nine corrections are drafts. They do not by themselves satisfy C2: the claim is verified only by the L1's
  clean checkout of the measured REV with the frozen counter bytes, plus the zero-deleted-lines condition.
  Nothing under `scripts/` was changed in the probe (`git diff --name-only … -- scripts/` = 0 files), so the
  frozen digests still match.
