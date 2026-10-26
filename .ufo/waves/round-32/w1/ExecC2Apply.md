# ExecC2Apply — C2 build: append-only correction blocks (round 32, w1)

**Verdict.** Done and measured: three append-only correction blocks land at the end of `SCORECARD.md`
(+10 lines), `SKILL.md` (+8) and `corpus/README.md` (+7), **0 deletions**, `LOG.md` untouched, and in a clone of the
freeze commit the frozen v3 counter moves from `mismatches 18, exit 1` (3 `m4-nudge-state` + 15 `m1-selftest-tally`)
to `mismatches 0, clean true, exit 0`, with all 15 m1 and all 3 m4 stale findings individually `superseded: true`
and the two irrelevant classes untouched (`couldNotEvaluate` 104 in both runs; m2/m3 create no finding). The counter
blob at the measured revision is byte-identical to `claims.json` `frozenDigests`, no `scripts/` file changed, and the
three delivered block files are byte-identical to the lines actually appended. One integration risk is flagged below:
the citations are line numbers as of `4181fffb`, so any seat/L1 edit **above** those lines in the same three files
before the corrections are appended invalidates the citations (recoverable by re-running the counter and correcting
four numbers).

## What was measured

| Run | Command (in clone at `4181fffb`, `TMPDIR` under scratch) | Result | Exit |
|---|---|---|---|
| before | `node scripts/check-selfassessment.mjs --rev HEAD --json` | `mismatches 18`, `counted 18`, `superseded 21`, `couldNotEvaluate 104` | **1** |
| after | same, at clone commit `363be55bb36cb77e0dce644c807804e1de1aeb40` | `mismatches 0`, `clean true`, `counted 0`, `superseded 39` (+18), `couldNotEvaluate 104` | **0** |

The 18 counted mismatches before (all from the counter, `counter-before.json`):

```
m1-selftest-tally  SCORECARD.md:1439  claimed 17 -> observed 41
m1-selftest-tally  SCORECARD.md:1465  claimed 22 -> observed 41
m1-selftest-tally  SCORECARD.md:1486  claimed 22 -> observed 41
m1-selftest-tally  SCORECARD.md:1564  claimed 30 -> observed 41
m1-selftest-tally  SKILL.md:2479      claimed 13 -> observed 41
m1-selftest-tally  SKILL.md:2515      claimed 17 -> observed 41
m1-selftest-tally  SKILL.md:2530      claimed 20 -> observed 41
m1-selftest-tally  SKILL.md:2545      claimed 22 -> observed 41
m1-selftest-tally  SKILL.md:2576      claimed 30 -> observed 41
m1-selftest-tally  SKILL.md:2578      claimed 30 -> observed 41
m1-selftest-tally  SKILL.md:2590      claimed 30 -> observed 41
m1-selftest-tally  SKILL.md:2594      claimed 30 -> observed 41
m1-selftest-tally  SKILL.md:2598      claimed 30 -> observed 41
m1-selftest-tally  corpus/README.md:613  claimed 17 -> observed 41
m1-selftest-tally  corpus/README.md:668  claimed 30 -> observed 41
m4-nudge-state    SCORECARD.md:1473  claimed inactive -> observed active
m4-nudge-state    SCORECARD.md:1515  claimed inactive -> observed active
m4-nudge-state    SCORECARD.md:1576  claimed inactive -> observed active
```

(Each of the 15 m1 lines names `scripts/check-selfassessment.mjs` on its own line, so each is line-associated; the
oracle is the gate's own `SELFASSESSMENT_SELFTEST … cases=41` summary, exit 0.)

## Evidence (commands verbatim, exit codes as observed)

```
$ git -C "$D" rev-parse --show-toplevel          # D=/fast/scratch/hyaku/tabi-r32/ExecC2Apply/clone
D ... -> toplevel-ok
$ git -C "$D" checkout --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6   # exit 0
$ TMPDIR=... node scripts/check-selfassessment.mjs --rev HEAD --json > base.json       # exit=1  (18 mismatches)
$ git -C "$D" -c user.name=ExecC2Apply -c user.email=ExecC2Apply@scratch.local commit -qam "c2: append-only round-32 corrections ..."   # exit 0
$ git -C "$D" rev-parse HEAD
363be55bb36cb77e0dce644c807804e1de1aeb40
$ git -C "$D" status --porcelain | wc -l          # 0
$ TMPDIR=... node scripts/check-selfassessment.mjs --rev HEAD --json > after.json      # exit=0  (0 mismatches, clean true)
$ git -C "$D" diff --numstat 4181fffb… HEAD -- SKILL.md corpus/README.md SCORECARD.md LOG.md
10      0       SCORECARD.md
8       0       SKILL.md
7       0       corpus/README.md
$ git -C "$D" diff --name-only 4181fffb… HEAD -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs
(empty, exit 0)
$ git -C "$D" show HEAD:scripts/check-selfassessment.mjs | sha256sum
77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9   # == claims.json frozenDigests
$ git -C "$D" show HEAD:scripts/check-bidi-runtime.mjs | sha256sum
2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393   # == claims.json frozenDigests
$ git -C "$D" diff -U0 4181fffb… HEAD -- <the three docs> | grep -E '^(@@|\+\+\+)'
+++ b/SCORECARD.md
@@ -1603,0 +1604,10 @@        (single hunk, EOF, additions only)
+++ b/SKILL.md
@@ -2627,0 +2628,8 @@
+++ b/corpus/README.md
@@ -705,0 +706,7 @@
$ diff <(appended lines) <(blank separator + delivered block)   # per doc
SCORECARD.md vs scorecard-block.md -> exit=0; SKILL.md vs skill-block.md -> exit=0; corpus/README.md vs readme-block.md -> exit=0
$ git -C "$D" diff 4181fffb… HEAD -- <the three docs> | grep -c 'nudge inactive'   # 0, grep exit 1
$ node -e '…' counter-after.json    # all15_m1_superseded=true all3_m4_superseded=true
```

Full evidence transcript: `.ufo/waves/round-32/w1/ExecC2Apply/verify.txt`; raw counter stdout:
`counter-before.json` / `counter-after.json`; the exact patch: `corrections.patch`.

## Deliverables (in `.ufo/waves/round-32/w1/ExecC2Apply/`)

- `scorecard-block.md` — the SCORECARD.md block (heading + one line carrying script, `--selftest` (41/41), marker and
  all four `SCORECARD.md:N` citations, because the SCORECARD m1 window is line-based; + one paragraph per stale nudge
  statement citing `SCORECARD.md:1473`, `:1515`, `:1576` with `nudge was active` and the derived inputs: six axes at
  round start, saturation 8 / window 3, last capability entry round 25).
- `skill-block.md` — the SKILL.md block (one paragraph, since the SKILL window is paragraph-based, citing all nine
  `SKILL.md:N` lines with script, marker and 41).
- `readme-block.md` — the corpus/README.md block (one paragraph citing `corpus/README.md:613` and `:668`).
- `counter-after.json` — final frozen-counter JSON at the measured revision.

The blocks are verbatim what was appended; each file's appended lines diff clean against them (exit 0 above).

## Method notes (why the shapes are what they are)

- **SCORECARD m1 is line-based.** `m1Findings` marks a stale tally superseded only by a *later line* that names the
  same script, carries the oracle-correct number, contains `supersed|correct|replace`, and cites the stale line with
  its own document name (`citesLine` requires `SCORECARD.md:N`, not a bare `:N`). Hence one line, four citations.
- **SKILL/corpus README m1 are paragraph-based and `lineOnly`.** A tally associates only with scripts on its own
  line, and a *paragraph* starting after the stale line must name the script, carry the marker, cite the stale line in
  the same document and state 41 through a tally shape (`41/41`). Hence one paragraph with all citations; each
  paragraph line was kept free of stray tally shapes so no new stale or ambiguous finding is created.
- **m4 is paragraph-based.** The clearing paragraph needs `supersed|correct`, `SCORECARD.md:N`, and the literal
  `nudge was active`. The phrase `nudge was active` is deliberately past-tense: the m4 statement scanner matches only
  `nudge [is] active|inactive`, so the corrections themselves create no new statement. The corrections block heading
  (`## Round 32 — …`) opens a round-32 group with no `Axes at round start:` and no statement, so it yields no m4
  finding either. The phrase `nudge inactive` appears nowhere in the appended bytes (`grep -c` → 0).
- Trigger phrases the blocks avoid on purpose: `Axes at round start:` and `First-working round:` (which would feed
  the m4 input parser), and the word `cases` next to a number outside the intended `--selftest` (41/41) tally.

## Risks / integration notes

1. **Line-number citations are pinned to `4181fffb`.** If any edit lands *above* SCORECARD:1439/1465/1486/1564,
   SKILL:2479–2598, README:613/668 before these blocks are appended, the counter will report those tallies
   uncited again. Mitigation: after integration, re-run
   `node scripts/check-selfassessment.mjs --rev <REV> --json`; if any of the 18 reappears, shift the matching
   `DOC:N` numbers in the appended correction line/paragraph (all citations sit in one line for SCORECARD and one
   paragraph each for SKILL/README, so it is a four-number / nine-number / two-number edit) and re-run.
2. The corrections were validated in a clone commit, not in the lane; the lane tip at `4181fffb` is the base, so the
   append is byte-reproducible from `corrections.patch`.
3. `m3-unlanded-paths` contributes nothing only while the lane tree is clean at the measured revision; the appended
   blocks must be committed (the L1 lands them), not left in the working tree.
4. No blocker. No `scripts/` change, no lane file edited by this seat outside the clone, no browser started
   (`pgrep -fa 'chromedriver|chromium'` shows only siblings' sessions whose `--user-data-dir` is
   `/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…` plus two pre-existing host chromedriver `--port` processes —
   **none owned by this seat**), no tool installs or upgrades performed, network unused.

Report: this file. Output dir: `.ufo/waves/round-32/w1/ExecC2Apply/`.
