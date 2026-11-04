# R62MutC1 — C1 adjacency mutation probe

## Result

All five declared mutants **killed** by the unchanged frozen v21 selftest. Pristine baseline: **44/44, exit 0**. Each restored file: **44/44, exit 0**, byte-identical to the source pin. No frozen instrument was edited. This is lane-authored evidence support, not an outside admission or a third claim.

Source: `.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs`

SHA256 before and after: `b845973c0f16433b05080829cf66641df303cffa09a9dc291d1773b9b9c8afa6`.

Baseline revision: `57b29bade4b05b03cdb8fa151daec90ac9b1a29c`; declared freeze: `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`. All six instrument/snapshot hashes still match instrument-pins.json; exact input pins and final hashes are in `R62MutC1/kills.json`.

## Mutants and named failure attribution

| Mutant | Active-code transform | Detector output | Verdict |
|---|---|---|---|
| M1 live head source | `makeSibRefGit` reads `HEAD:path` instead of `snapshotHead:path` | exit 1; 42/44; `moved-sibling-snapshot-green-with-drift` and `strict-header-green` fail | killed |
| M2 drop drift disclosure | `runAt` emits empty drift instead of `discloseDrift` | exit 1; 43/44; moved-sibling case fails | killed |
| M3 missing-snapshot fallback | remove CLI refusal; absent snapshot acquires live heads | exit 1; 43/44; `missing-snapshot-exits-2` fails | killed |
| M4 ignore unresolvable head | omit `snapshotFindings` from emitted findings | exit 1; 43/44; `unresolvable-head-refused` fails | killed |
| M5 drop audit duplicate rule | retain first-row indexing but omit duplicate finding | exit 1; 43/44; `audit-duplicate` fails | killed |

The failures concern the named behavior, not syntax or unsupported transforms:

- M1: the snapshot-green fixture instead evaluates changed live CDP content: SHA, lines, hits and missing-line findings; predicate false, child exit 1. Snapshot metadata and drift still name distinct old/live heads, isolating the byte-source defect.
- M2: child exit 0, predicate true, zero findings, **drift=[]**; only required drift disclosure is absent.
- M3: missing snapshot evaluates via live heads with child exit **1**, not required exit **2**, and empty stderr. It emits a live-head snapshot and semantic findings rather than refusing missing input.
- M4: bad zero head still produces child exit 1 through a file-SHA finding, but **no unresolvable-head finding** and unresolvableHead=0. The assertion detects the removed rule, not merely nonzero status.
- M5: duplicate audit case becomes predicate true with zero findings, so the required audit-duplicate finding is absent.

## Commands and receipts

Runtime: Node `v24.21.0`; no installations or updates.

Pristine command (exit 0):

`node /fast/scratch/hyaku/tabi-r62/R62MutC1/c1-adjacency-host-v21.pristine.mjs --selftest`

For each `M1` through `M5`, same bounded command before restoration (exit 1) and after exact restoration (exit 0):

`node /fast/scratch/hyaku/tabi-r62/R62MutC1/MN.mjs --selftest`

Execution/capture harness (exit 0):

`python /fast/scratch/hyaku/tabi-r62/R62MutC1/probe.py`

Five independent probes ran concurrently. The frozen selftest creates unique guarded fixtures under its declared `R62V21Selftest` root and removes its own fixture directories. No lane VCS mutations, clones, browser runs or production edits occurred.

Durable artifact directory: `.ufo/waves/round-62/w1/R62MutC1/`:

- `kills.json`: exact argv/cwd, exit codes, per-mutant changed/restored hashes, failed assertion evidence, source/input pins and final frozen hashes.
- `MN.diff` and `MN.mutant.mjs`: exact applied differences and mutated bytes.
- `MN.mutated.stdout.json` / `.stderr.txt`, and corresponding `MN.restored.*`: complete detector outputs. Top-level stderr is empty; expected child refusal stderr appears within selftest JSON.
- `baseline-selftest.out` / `.err` and `c1-adjacency-host-v21.pristine.mjs`: baseline output and frozen source bytes.
- `probe.py`: executed bounded capture/restoration harness.
- `cleanup.txt`: own scratch deletion receipt.

No passing after-pass on real committed ledgers is asserted here; no unanswered kaidoku overlap ruling is settled by these probes. Controls and frozen contracts remain unchanged.

## Self-evaluation

Accuracy 4/5: actual per-case outputs and hashes are supplied; fixture probes do not certify live data. Completeness 5/5: five declared mutants, baseline and five restored detectors, exact diffs and complete outputs. Clarity 4/5: one shared fixture case has a compound name, so subclause attribution is spelled out above. Actionability 5/5: full argv and executable artifacts are provided. Conciseness 4/5: raw receipts deliberately retain repetitive fixture command logs. Overall 4.4/5. Improvement: consumers should use the summary table before the full logs; do not interpret this evidence as lane-wide acceptance. User-agreement self-check: limited to the requested mutation probe.

Report: .ufo/waves/round-62/w1/R62MutC1.md
