# ExecTallyProbe — C2 tally no-harm probe (round 33, w1)

**Verdict: holds, with one recipe trap and one instrument hole named.** The recipe works and is cheap: when the BiDi
gate's real self-test tally moves (v1 `27/27` → v2 `45/45` in this probe), **exactly two document lines go stale —
`SCORECARD.md:1657` and `SKILL.md:2626` — and exactly one gate goes red: `check-selfassessment` exit 1 with
`mismatches 2`.** `check-gate-registry` stays exit 0 (nonconformant 0) and `check-gate-mutants` stays exit 0
(27/27 fault killed, 13/13 benign survived) at every state, because a tally move adds no gate name and the BiDi gate is
not in the mutant catalogue. Appending two correction lines at the end of those two documents in the round-29/32 style
returns `mismatches 0`, exit 0, with **deleted lines 0** (`6 0 SCORECARD.md`, `6 0 SKILL.md`). Three falsifiers bound the
recipe: a correction written but not committed re-reds the gate through `m3-unlanded-paths` (exit 1, mismatches 1); a
correction in the colon tally shape `` `cases: 45` `` **does not clear anything** (exit 1, mismatches 2); and correcting
SCORECARD.md alone leaves `SKILL.md:2626` standing (exit 1, mismatches 1). None of this moves an axis; it is a no-harm
reading of the calibration counter at a state whose surface (the gate's own selftest tally) is deliberately moved.

## What was attacked

`scripts/check-bidi-runtime.mjs`'s self-test tally — the only prior file C2 rewrites — against
`scripts/check-selfassessment.mjs` (v3, the doc-bound m1 oracle), `scripts/check-gate-registry.mjs` and
`scripts/check-gate-mutants.mjs`. Probe revision chain in the seat's scratch clone of `e6b0a907` (freeze):

| rev | content |
|---|---|
| `e6b0a9074d434ccc307badd312ae7379d1193fea` | freeze: honest state |
| `4f55b036695809eeb79d37fc33c74832966baf3d` | gate stub: `--selftest` prints `cases=45 passed=45`, evaluation path byte-identical to v1 |
| `75bc2bbb34b0fdb4dcdeab9cbd986dc9aed15ebd` | + append-only corrections (SCORECARD.md, SKILL.md), `deleted 0` |

The stub is not a v2 implementation: it inserts eighteen **unconditionally passing** self-test rows immediately before
the summary computation (`probe-stub.patch`), so the printed verdict is the real summary of 45 real rows — `verdict=clean
cases=45 passed=45`, exit 0 — while `evaluate()` and the CLI's non-`--selftest` path are untouched. That is exactly the
shape the L1 needs to read: a moved tally with no behaviour change.

## Evidence (commands, exit codes)

All runs: scratch clone, `TMPDIR=/fast/scratch/hyaku/tabi-r33/ExecTallyProbe/tmp`, node v24.21.0. Full list with exits in
`ExecTallyProbe/commands.txt`; every JSON receipt below is copied there with sha256 in `receipt-sha256.txt`.

| # | command | exit | reading |
|---|---|---|---|
| 1 | `node scripts/check-selfassessment.mjs --rev e6b0a907… --json` | 0 | `mismatches 0` (39 superseded, 107 CNE) — the freeze is calibrated |
| 2 | `node scripts/check-gate-registry.mjs --rev e6b0a907… --json` | 0 | `nonconformant 0` |
| 3 | `node scripts/check-gate-mutants.mjs --rev e6b0a907… --work … --json` | 0 | `fault 27/27`, `benign_killed 0` of 13 |
| 4 | `node scripts/check-bidi-runtime.mjs --selftest` | 0 | `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` |
| 5 | commit stub → `4f55b036`; `--selftest` | 0 | `BIDI_RUNTIME_SELFTEST verdict=clean cases=45 passed=45` |
| 6 | `node scripts/check-selfassessment.mjs --rev 4f55b036… --json` | **1** | `mismatches 2` |
| 7 | `node scripts/check-gate-registry.mjs --rev 4f55b036… --json` | 0 | `nonconformant 0` |
| 8 | `node scripts/check-gate-mutants.mjs --rev 4f55b036… --work … --json` | 0 | `fault 27/27`, `benign_killed 0` of 13 |
| 9 | append corrections, commit → `75bc2bbb`; `git diff --numstat 4f55b036 75bc2bbb` | 0 | `6 0 SCORECARD.md`, `6 0 SKILL.md` (deleted 0) |
| 10 | `node scripts/check-selfassessment.mjs --rev 75bc2bbb… --json` | **0** | `mismatches 0` (41 superseded, 107 CNE) |
| 11 | `node scripts/check-gate-registry.mjs --rev 75bc2bbb… --json` | 0 | `nonconformant 0` |
| 12 | `node scripts/check-gate-mutants.mjs --rev 75bc2bbb… --work … --json` | 0 | `fault 27/27`, `benign_killed 0` of 13 |

### The two findings, exactly

`stub-selfassess.json` (receipt `stale-at-stub.json`) — both `m1-selftest-tally`, `script
scripts/check-bidi-runtime.mjs`, `claimed 27`, `observed 45`, `superseded false`:

- **`SCORECARD.md:1657`** — `` `scripts/check-bidi-runtime.mjs` `--selftest` (27/27). `` (last line of the round-32
  declared-claims section, `SCORECARD.md:1637-1657`).
- **`SKILL.md:2626`** — the round-32 registry row `| bidi-runtime | gate | … |` whose self-test cell reads
  `` `node scripts/check-bidi-runtime.mjs --selftest` (cases=27, passed=27) ``.

No other document moves: `LOG.md` carries no BiDi self-test tally (`grep -n "check-bidi-runtime" LOG.md` → three lines,
none a tally), `corpus/README.md` none, and the `.ufo/waves/round-32/**` mentions are outside the m1 window.

### The correction text that worked (verbatim; `probe-corrections.patch`)

Appended at the **end** of `SCORECARD.md`:

```
## Round 33 — corrections (append-only; each cites the stale line in its own document)

Written when the round-33 C2 gate v2 landed its real tally; the stale lines above stay as written, these lines supersede them.

- `scripts/check-bidi-runtime.mjs` `--selftest` (45/45): correction — supersedes the stale tally at `SCORECARD.md:1657` (v2 adds eighteen cases: the receipt-forgery constructions the round-33 battery freezes plus one case per round-32 w1 MutC1 survivor; the block's prose above is unchanged).
```

Appended at the **end** of `SKILL.md`:

```
## Round 33 — corrections (append-only; each cites the stale line in its own document)

- `scripts/check-bidi-runtime.mjs` `--selftest` (45/45): correction — supersedes the stale tally inside the registry row at
  `SKILL.md:2626`, whose entry command, verdict map, pinned path and write scope are unchanged by v2. The round-33 cases are
  the forgery constructions and the MutC1 survivors, so the row's tally is this one.
```

Why these work, in the counter's own terms (`scripts/check-selfassessment.mjs`): each line names the script
(`SCRIPT_IN_TEXT`), carries a correction marker (`supersed|correct|replace|replac|superseding`, line 256), cites its own
document's line (`citesLine`, line 288, called at 257), and **is itself a measured match** — claimed 45, observed 45 — because the
`(45/45)` fraction satisfies the claim regex at line 216 and the oracle agrees. The SKILL.md line only needs the
paragraph form: `statedTallyNumbers` (line 264) accepts `45/45`, so the wrapped bullet clears line 2626.

## Falsifiers (what breaks the recipe)

| falsifier | command | exit | reading |
|---|---|---|---|
| A — correction written, tree not committed (one line appended to `SCORECARD.md`, `--rev 75bc2bbb`) | `node scripts/check-selfassessment.mjs --rev 75bc2bbb… --json` | **1** | `mismatches 1`: `m3-unlanded-paths`, `round 32`, `observed 1` (`m3-dirty.json`). The newest `## Round 32 — executed disposition` block asserts landed work and any porcelain path contradicts it (line 414). **Commit the corrections, then measure at that commit.** `git checkout -- SCORECARD.md` → 0 paths. |
| B — correction in the colon shape, SCORECARD.md only: `` - `scripts/check-bidi-runtime.mjs` `--selftest` cases: 45 — correction — supersedes the stale tally at `SCORECARD.md:1657`. `` | `node scripts/check-selfassessment.mjs --rev <colon> --json` | **1** | `mismatches 2`, both still stale (`stale-at-colon.json`). The claim regexes at line 216 are `(\d+)-case`, `cases=(\d+)`, `N cases` — **`cases: N` is not a claim**, so the correction line is not a finding, so it cannot supersede. `cases=45` or `45 cases` or `(45/45)` all register; the colon does not. |
| C — SCORECARD.md corrected `(45/45)`, SKILL.md left stale | `node scripts/check-selfassessment.mjs --rev <partial> --json` | **1** | `mismatches 1`, `SKILL.md:2626` 27 vs 45 (`stale-at-partial.json`). One document is not enough; the registry row is the second site. |

## Instrument hole the L1 should know before reading `mismatches 0` as calibration

A moved tally is only an oracle while the gate's own self-test is **clean**: `scripts/check-selfassessment.mjs:190`
turns a nonzero exit or a summary `verdict` other than `clean` into `could-not-evaluate`, not into a measured tally. So a
v2 whose `--selftest` crashes, times out, or prints `verdict=failed` makes every stale document line *disappear from the
mismatch count* — `mismatches 0` with the docs still stating 27. **Source-read, not run in this seat** (the probe's stub
exits 0 by construction): the L1's after-measurement should read the gate's own `BIDI_RUNTIME_SELFTEST` line and its
exit code next to the `mismatches` figure, not the figure alone. C2's frozen battery already requires `selftest exit 0`
for the gate, which covers the same hole from the operability side; this is the calibration-side restatement.

## Recipe for the L1 when v2's real tally lands

1. Land v2 with its real `--selftest`, run it once, read the `<NAME>_SELFTEST verdict=clean cases=N passed=N` line and
   its exit code. That number is the oracle; nothing else in the lane is.
2. `node scripts/check-selfassessment.mjs --rev <v2-commit> --json` → expect exit 1, `mismatches` = the number of stale
   BiDi tally sites. For a tally-only move on today's bytes that is **2** (`SCORECARD.md:1657`, `SKILL.md:2626`); if v2
   also rewrites the registry row's self-test cell text, re-read which lines the findings name rather than trusting 2.
3. Append one correction line per finding at the **end** of the named document, in the shape proven above: script path,
   `--selftest (N/N)`, `correction — supersedes the stale tally at \`DOC.md:LINE\``, a short reason. Never edit the stale
   line; never use `cases: N`.
4. Commit the corrections, then re-measure at that commit: `mismatches 0`, exit 0, and
   `git diff --numstat <freeze> <REV> -- SCORECARD.md SKILL.md LOG.md corpus/README.md` deleted 0.
5. Re-run `check-gate-registry` (0) and `check-gate-mutants` (0) at the same revision: neither should move, and neither did
   here. If `check-gate-mutants` moves, the cause is not the tally — read the catalogue, not the docs.

## Limitations (honest scope)

- The probe's eighteen extra rows pass unconditionally; it proves the **tally plumbing and the doc-correction recipe**,
  not that v2's new cases are strong. Kill coverage of v2 is `check-gate-mutants`' question, and the BiDi gate is not in
  the frozen catalogue (`scripts/gate-mutants.json` covers `check-s106-evidence` and `check-release-pins` only), so
  **the catalogue gives v2 zero kill evidence today** — a w2 item, not this seat's.
- Real v2 may move more than the tally: if it changes the registry row's entry command or its self-test cell text, the
  SKILL.md finding's line text changes but its line number is stable only while nothing above it moves. Append-only
  discipline keeps that true.
- The two falsifier branches B and C were built on detached commits off `4f55b036`; they are probe fixtures, not
  candidates. Everything live stays under `/fast/scratch/hyaku/tabi-r33/ExecTallyProbe/`, now removed.

## Housekeeping

- Scratch `rm -rf -- /fast/scratch/hyaku/tabi-r33/ExecTallyProbe` → gone (receipts copied first).
- No browser started; `pgrep -fa 'chromedriver|chromium'` → one line, `1371 /usr/bin/earlyoom …` (host service, args
  merely mention `chromium`; not mine). No network fetches. No tool installations, no pacman.
- Lane tree untouched; all commits are in the scratch clone (`git -C` named on every call, `4f55b036`, `75bc2bbb`).

## Deliverables

Report: `.ufo/waves/round-33/w1/ExecTallyProbe.md` (this file).
Output dir: `.ufo/waves/round-33/w1/ExecTallyProbe/` — `commands.txt`, `probe-stub.patch`,
`probe-corrections.patch`, `probe-commits.txt`, `probe-head.txt`, `nodever.txt`, `selftest-final.txt`,
`base-{selfassess,registry,mutants}.json`, `stub-{selfassess,registry,mutants}.json`,
`fix-{selfassess,registry,mutants}.json`, `dirty-selfassess.json`, `colon-selfassess.json`,
`partial-selfassess.json`, `stale-at-stub.json`, `stale-at-colon.json`, `stale-at-partial.json`,
`bidi-at-fix.json`, `m3-dirty.json`, `receipt-sha256.txt`.
