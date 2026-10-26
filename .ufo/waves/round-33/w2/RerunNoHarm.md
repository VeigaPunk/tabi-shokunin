# RerunNoHarm — round 33, w2 (falsify), no-harm re-run

Attacks: the frozen `noHarmRule` of `.ufo/waves/round-33/claims.json` at the integrated lane
revision `042d6d9abf97d567d495652a85eabc851b81adc1` — "every offline gate and self-test of
`.ufo/waves/round-33/measure.sh` noharm that exits 0 at the baseline exits 0", plus the two
structural append-only / numstat clauses. Seat name: RerunNoHarm. Clone:
`/fast/scratch/hyaku/tabi-r33/RerunNoHarm/clone`, `git rev-parse HEAD` =
`042d6d9abf97d567d495652a85eabc851b81adc1`, `git status --porcelain` = 0 at clone time.

## Verdict — holds

No gate that exits 0 at the baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd` is red at
`042d6d9a…`: all 28 commands of the frozen noharm block run with byte-identical command text
(path-normalised) and exit 0 at both pins (`green_at_baseline_red_at_rev=[]`,
`cmd_or_exit_mismatches=0`, receipt `RerunNoHarm/noharm-compare.txt`). Every self-test case
count is unchanged except the declared C2 target (`check-bidi-runtime` 27 → 44 cases); no
count dropped (`any_case_count_dropped=[]`). The six protected prose paths carry
`deleted = 0` (`SKILL.md 128/0`, `SCORECARD.md 111/0`, `LOG.md 152/0`, `corpus/README.md 29/0`,
`corpus/QUALITY.md 55/0`, `corpus/SOURCES.md 3/0`), and the stronger byte-prefix property holds
for every prior prose/data file the round appends to (8/8 PREFIX-OK; `SOURCES.md` is an
in-table row append with zero removed lines). Exactly one file under `scripts/` changed — the
one prior file C2 declares it rewrites, `scripts/check-bidi-runtime.mjs` (+477/−113); the other
33 files under `scripts/` are byte-identical. All four frozen instruments and the pinned adjacency gate
carry their frozen digests both at REV and at the freeze commit `e6b0a907…`; no prior `.ufo`
artifact was modified or deleted. Two advisory notes follow the evidence; neither is a defect.

## What I ran

The frozen `measure.sh` noharm block, verbatim, inside the clone
(`noharm-at-042d6d9.txt`, all 28 lines; exit codes recorded inline as `:: exit=N ::`):

| # | command (as in measure.sh) | baseline | REV |
|---|---|---|---|
| 1 | `check-adjacency.mjs --at <REV> --fleet /home/vgpnk/Projects/shokunin` | 0 | 0 |
| 2 | `check-gate-registry.mjs --rev HEAD` | 0 | 0 |
| 3 | `check-release-pins.mjs --rev HEAD --stable 156.0.8078.47` | 0 | 0 |
| 4 | `check-s106-evidence.mjs --rev HEAD` | 0 | 0 |
| 5 | `check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26` | 0 | 0 |
| 6 | `check-decision-table.mjs --rev HEAD --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md` | 0 | 0 |
| 7 | `check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md` | 0 | 0 |
| 8 | `check-selfassessment.mjs --rev HEAD` | 0 | 0 |
| 9 | `check-sources.mjs` | 0 | 0 |
| 10 | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <clone>/corpus/SOURCES.md` | 0 | 0 |
| 11–27 | the 17 `--self-test` / `--selftest` invocations measure.sh discovers (`check-adjacency`, `check-aria-metadata`, `check-bfcache-receipt`, `check-bidi-runtime`, `check-decision-table`, `check-freshness`, `check-frontier-admission`, `check-gate-mutants`, `check-gate-registry`, `check-measurement-binding`, `check-release-pins`, `check-round-contract`, `check-s106-evidence`, `check-selfassessment`, `check-source-reopen-receipt`, `check-sources`, `check-user-round-contract`) | 0 | 0 |
| 28 | `round-evidence-audit.mjs --selftest` | 0 | 0 |

Baseline column: `.ufo/waves/round-33/baseline/measure-at-baseline/noharm-at-b7d16fb.txt`
(28 lines, all `exit=0`). REV column: `RerunNoHarm/noharm-at-042d6d9.txt` (28 lines, all
`exit=0`). Command text matches after normalising the REV string and the two clone roots;
`cmd_or_exit_mismatches=0`.

Metric deltas (same receipts; all verdicts stay `clean`):

- `ADJACENCY rows=10 verified=10` → `rows=14 verified=14` (the four new kake rows of
  `corpus/adjacency.tsv:12-15` verify).
- `GATE_REGISTRY rows=40 gates=22 nonconformant=0` → `rows=41 gates=22 nonconformant=0`.
- `RELEASE_PINS population=23 resolved=23 holds=16 drifted=7` — unchanged.
- `DECISION_TABLE population=13 admitted=13 failing=0` — unchanged (live=false both).
- `SELFASSESSMENT mismatches=0 could_not_evaluate=106 superseded=39` →
  `mismatches=0 could_not_evaluate=115 superseded=41`.
- `SOURCES_GATE rows=126 tiers=A:111` → `rows=129 tiers=A:114`, `findings=0` both.
- `BIDI_RUNTIME population=16 admitted=16 failing=0` → `population=17 admitted=16 failing=0
  unmeasured=1 distinct=16` (see probe 1).

## Append-only and numstat evidence

Required six (deleted must be 0) — `git diff --numstat b7d16fb… 042d6d9a… -- <paths>`, exit 0:

```
152  0  LOG.md
111  0  SCORECARD.md
128  0  SKILL.md
55   0  corpus/QUALITY.md
29   0  corpus/README.md
3    0  corpus/SOURCES.md
```

Byte-prefix test (baseline blob `sha256` == `sha256` of the first `len(baseline)` bytes of the
REV blob) → append-only in the strict sense, not merely zero-deletion:

```
PREFIX-OK   SKILL.md                                         base=269274 rev=282102
PREFIX-OK   SCORECARD.md                                     base=140634 rev=151435
PREFIX-OK   LOG.md                                           base=170419 rev=185925
PREFIX-OK   corpus/README.md                                 base=75782  rev=78498
PREFIX-OK   corpus/QUALITY.md                                base=43717  rev=49307
PREFIX-OK   corpus/adjacency.tsv                             base=3831   rev=5329
PREFIX-OK   corpus/knowledge/webdriver-bidi-runtime-round-32.md base=21454 rev=25151
PREFIX-OK   corpus/lessons/round-32.md                       base=20476  rev=22819
```

`corpus/SOURCES.md` fails a whole-file prefix test by construction (S127–S129 are rows appended
inside the table at `corpus/SOURCES.md:141-143`, before the `## Paths` trailer); the property
that matters is proven directly: `git diff -U0` over that file has `removed-lines=0` — a pure
addition hunk, no prior byte touched.

Every other prior file the round changed (`--diff-filter=MDR`, non-`.ufo`):

| file | + | − |
|---|---|---|
| `corpus/adjacency.tsv` | 4 | 0 |
| `corpus/knowledge/webdriver-bidi-runtime-round-32.md` | 39 | 0 |
| `corpus/lessons/round-32.md` | 25 | 0 |
| `scripts/check-bidi-runtime.mjs` | 477 | 113 |

Prior `.ufo` files modified/deleted: `count=0` (the whole wave-1 evidence tree is additive only —
no measurement receipt was rewritten after the fact). Non-`.ufo` deletions: `0`. Non-`.ufo`
additions: `corpus/adjacency-screen.tsv`, `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`,
`corpus/lessons/round-33.md`.

Instrument integrity (REV vs freeze commit `e6b0a90…` vs `claims.json` `frozenDigests`):

```
c1-adjacency-sweep.mjs   da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380  (== frozen)
c2-bidi-forgery-battery  51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b  (== frozen)
measure.sh               ca6b830e1c9b685664da7db0ebb30674175c4c95f9fb11f8b2ce75a033784c7e  (== frozen)
baseline/controls.mjs    2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e  (== frozen)
scripts/check-adjacency.mjs 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac (== pin in C1)
```

## Coverage-integrity probes (things exit codes alone do not catch)

1. **The `BIDI_RUNTIME` population shift 16 → 17 is an accounting fix, not a coverage loss.**
   Baseline v1 kept only `yes` cells in the population —
   `scripts/check-bidi-runtime.mjs:508` at `b7d16fb…`:
   `const rows = (parseTable(entryText) || []).filter((r) => (r.cells[3] || "").toLowerCase() === "yes");`
   — so the entry's 17-row table
   (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:67-83`) was measured as 16 rows and the
   `no` row R16 (`…-round-32.md:82`, `no — no BiDi command`) was invisible. v2 counts every table
   row (`scripts/check-bidi-runtime.mjs:728`) and reports it
   (`:861` `out.unmeasured = …`) — hence `population=17 admitted=16 failing=0 unmeasured=1` at
   REV, exit 0. The admitted set is unchanged (`ROW id=R1..R15,R17 admitted`, `R16 … unmeasured`,
   printed by my run). The shift is disclosed at
   `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:291` ("accepted at population 17, admitted
   16, failing 0 (R16 is the one `no` row, now counted…)"). Verdict on this item: holds.
2. **The +9 `could_not_evaluate` and +15 findings are additive only.** Set-diff of the
   selfassessment findings (`RerunNoHarm/selfassessment-setdiff.txt`): `new_finding_keys=15`,
   `gone_finding_keys=0`; all 15 are new `m1-selftest-tally`/`m4-nudge-state` entries in the
   appended prose of `LOG.md`, `SKILL.md`, `SCORECARD.md`, `corpus/README.md`;
   `rev_evaluated_unequal_and_unsuperseded=0`. So the `SCORECARD.md` correction added at
   `042d6d9a…` (+2/−0) is additive and the bf48b81 mismatch 1 is genuinely gone at REV
   (`mismatches=0`), not masked.
3. **No silent narrowing of the gate set.** `scripts/` holds 34 files at the baseline; exactly 1
   differs at REV; therefore every unchanged gate still measures the same thing it measured at
   the baseline (their exit codes alone would not prove this).
4. **The live leg of the bidi gate is green at REV** — [peer receipt, not my run]
   `.ufo/waves/round-33/w2/RerunLiveV2/{A1,A2,B,B2,B3,B4}.json` all read
   `schema=tabi-bidi-runtime-v2 rev=042d6d9a… live=true population=17 admitted=16 failing=0
   clean=true`. This is the leg the frozen noharm block runs only with `live=false`, so v2's
   live-launch change (real binary, no `--no-sandbox`, throwaway HOME/XDG, no caller-TMPDIR
   fallback) does not cost the lane a working capability.

## Advisory notes (not defects; no axis harmed)

- **A1 — an inexact sentence in the L1's own reading (informational).** The wave brief states
  "the only change between the two revisions besides measure files" for `bf48b81c… → 042d6d9a…`.
  `git diff --numstat bf48b81 042d6d9a` also shows `.ufo/waves/round-33/w2-spec.json` (+236/−0)
  — the wave-2 seat spec. It is orchestration data (read only by
  `scripts/round-evidence-audit.mjs` fixtures), not a lane evidence surface, and no gate's
  verdict depends on it; the participial claim is nonetheless false as written by one file.
  Worth a one-line precision fix where that sentence is recorded, on the round-32 M-series
  pattern (claim text must match the diff).
- **A2 — scope note, now closed by a peer receipt.** My frozen comparison runs the bidi gate
  `live=false` at both pins; the live leg is verified only by RerunLiveV2's receipts (probe 4)
  and, indirectly, by `.ufo/waves/round-33/w1/SentinelLiveLeg/live-L2.exit` (`L2 exit=0`: a v1
  copy with `--no-sandbox` removed starts on this host). I did not run a browser; owner of that
  leg is SentinelLiveV2.

## Hygiene

- One clone per seat, `--shared` off the lane, detached at REV, `status --porcelain` = 0 when
  created (receipts `git-facts.txt` §env). All git reads in the lane were read-only
  (`git diff/show/ls-tree/rev-parse`), no writes to the lane, the fleet, or any sibling repo.
- No browser or driver started by this seat: `pgrep -fa 'chromedriver|chromium'` shows only
  `/usr/bin/earlyoom …` (a host process, not mine). Nothing to kill.
- Scratch `/fast/scratch/hyaku/tabi-r33/RerunNoHarm` deleted after the receipts were copied
  (receipts listed below survive in the lane output dir).
- No tool installs or upgrades were needed.

## Deliverables

- Report: `.ufo/waves/round-33/w2/RerunNoHarm.md` (this file)
- `.ufo/waves/round-33/w2/RerunNoHarm/noharm-at-042d6d9.txt` — full 28-command noharm run at REV
- `.ufo/waves/round-33/w2/RerunNoHarm/noharm-compare.txt` — per-command baseline↔REV exit and
  command-text comparison, metric deltas, self-test case-count comparison
- `.ufo/waves/round-33/w2/RerunNoHarm/selfassessment-at-042d6d9.json` — `--rev HEAD --json` at REV
- `.ufo/waves/round-33/w2/RerunNoHarm/selfassessment-setdiff.txt` — finding-set diff vs the
  baseline JSON
- `.ufo/waves/round-33/w2/RerunNoHarm/git-facts.txt` — numstat, prefix test, instrument digests,
  gate-set diff, `bf48b81 → REV` delta, all with exit codes
