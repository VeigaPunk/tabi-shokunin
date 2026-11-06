PASS
# R69Mut1 — mutation probe of the frozen C1 counter (fixture battery)

Round 69 / Amendment 46, wave w1. Attack-only probe: 18 single-point mutants of the frozen
adjacency counter, each run through the frozen 19-negative fixture battery. Outcome:
**14 killed, 4 survived, 0 inconclusive**; predictions matched observations 18/18.
Survivors are battery coverage findings — not permission to amend the frozen predicate,
counter or kill rules. No production, lane-root, fleet or sibling file was written.

## Pins (verified before any mutant was generated; unchanged after the probe)

| instrument | sha256 |
|---|---|
| `scripts/check-sibling-matrix-r69.mjs` (frozen counter) | `b62f9c7daebfbd0a1494e9a60a9ee06665574f1f98969ba1c08da0d698c58b20` |
| `scripts/negatives-sibling-matrix-r69.mjs` (frozen battery) | `dac61e1b829003da4ef2b1b1de64ba014f194721d20d7a0597ecb6857394ba92` |

Both match `.ufo/waves/round-69/freeze.txt`. Every per-mutant result JSON carries the
`counterSha256` its run was pinned to; `run-summary.json` repeats it per row together with the
generator's manifest hash (all 18 matched). The frozen source was never modified: re-hashed at
the end of this seat, byte-identical to the pin.

## Method

- `harness/gen-mutants.mjs` reads the frozen bytes (asserts the pin), applies exactly one
  replacement per mutant with an occurrence-count assertion (`split(before).length === 2`) and
  writes `m01.mjs`…`m18.mjs`. `harness/manifest.json` records every before/after string and the
  mutant sha256.
- Each mutant's `diff -u` is exactly one removed + one added line (`diffs/m01.diff`…`m18.diff`);
  change-line counts verified at 1+1 each.
- Detector, identical for pristine, mutated and restored bytes:
  `node scripts/negatives-sibling-matrix-r69.mjs --fixture --counter <counter> --work <scratch>/m<N> --out .ufo/waves/round-69/w1/R69Mut1/m<N>.json`
  Exit 1 = a forgery greened or the positive control failed → mutant **killed**;
  exit 0 = all 19 negatives still refused for their expected id and the positive fixture still
  clean → mutant **survived**; exit 2 = usage (none observed).
- Fixture fleets are 20 tiny git repos built by the battery under
  `/fast/scratch/hyaku/tabi-r69/R69Mut1/m<N>/fleet`; its toplevel assertion ran before the first
  commit. The one witness that commits (`w4`) asserts
  `git -C <copy> rev-parse --show-toplevel` equals that copy before committing.

## Baseline and restoration (same detector, same bytes)

| run | counter sha256 | battery exit | refused/19 | positive | failed |
|---|---|---|---|---|---|
| pristine baseline (`m0-baseline.json`) | `b62f9c7d…c58b20` | 0 | 19/19 | ok | `[]` |
| restored copy (`restore-check.json`, `restored.sha256`) | `b62f9c7d…c58b20` | 0 | 19/19 | ok | `[]` |

Baseline is valid, so every exit 1 below is attributable to the mutation, not the fixture.
Restoration evidence: `restored.sha256` contains the pinned hash, `restore-check.json` is a clean
re-run on those bytes, and the production counter still hashes to the pin.

## Results (full table in `mutants.md`)

| mutant | defect (single-point, counter line) | mutant sha256 | exit | refused/19 | positive | failed negatives | verdict |
|---|---|---|---|---|---|---|---|
| m01 | drop duplicate-lane detection (:75) | `2a3d4831…4b4657b` | 1 | 18/19 | ok | lane-duplicated-contradictory | killed |
| m02 | drop relation vocabulary check (:79) | `cd10c499…e6105` | 1 | 18/19 | ok | relation-out-of-vocab | killed |
| m03 | accept any head (:80) | `98048b47…9439` | 1 | 18/19 | ok | head-not-snapshot | killed |
| m04 | quote checked against whole file, not the cited line (:88) | `2aa00693…f4a92` | 1 | 17/19 | ok | cite-line-absent, quote-off-line | killed |
| m05 | off-by-one line index (:88) | `19f6167e…c121` | 1 | 19/19 | **FAIL** | positive | killed (positive control only) |
| m06 | quote lower bound 3 → 1 word (:93) | `b737b7f8…ac89` | 0 | 19/19 | ok | — | **survived** |
| m07 | quote upper bound 25 → 250 words (:93) | `ab9212d3…d503` | 1 | 18/19 | ok | quote-too-long | killed |
| m08 | drop inbound citation-line reciprocity (:102) | `63454a1f…a276` | 1 | 18/19 | ok | inbound-cite-elsewhere | killed |
| m09 | drop contested rule (:103) | `e84fa2ab…bf36` | 1 | 18/19 | ok | inbound-contested-as-adjacent | killed |
| m10 | drop inbound-relation-none rule (:104) | `1faa7ad4…ebd8` | 1 | 18/19 | ok | inbound-relation-none | killed |
| m11 | drop outbound Refuses routing check (:107) | `c8335ab6…9dc6` | 1 | 18/19 | ok | outbound-relation-none | killed |
| m12 | drop lane-missing loop (:110) | `99a57b93…727f` | 1 | 18/19 | ok | lane-row-dropped | killed |
| m13 | drop mandatory `**Refuses:**` paragraph (:50) | `cd11e97f…06a6` | 1 | 18/19 | ok | refuses-removed | killed |
| m14 | tabi-side minimum 4 → 2 words (:95) | `853a2ce4…fde9` | 0 | 19/19 | ok | — | **survived** |
| m15 | tolerate cite file absent at head (:86) | `9d22200f…7442` | 1 | 18/19 | ok | cite-file-absent | killed |
| m16 | drop matrix header shape check (:61) | `465b2534…0936` | 1 | 18/19 | ok | header-renamed | killed |
| m17 | duplicate detection only when relations disagree (:75) | `4ad14677…6f0c` | 0 | 19/19 | ok | — | **survived** |
| m18 | inbound `tabi` mention matched case-sensitively (:99) | `3b93a62a…4e8` | 0 | 19/19 | ok | — | **survived** |

All sha256 values are abbreviated here; `mutants.md` and `run-summary.json` carry the full 64-hex
digest per row, and `harness/manifest.json` carries the generator-side digest that each result may
be checked against.

## Kill accounting

- 13 mutants were killed by the *targeted* forgery: m01 (contradictory duplicate), m02
  (out-of-vocab relation), m03 (non-snapshot head), m04 (whole-file quote; also drops the
  line-existence check, so two negatives fire), m07 (26-word quote), m08 (inbound answered on the
  wrong line), m09 (contested sibling labelled adjacent), m10 (inbound sibling labelled none),
  m11 (Refuses lane labelled none), m12 (dropped lane row), m13 (`Refuses:` unparsable),
  m15 (absent cite file), m16 (renamed header). Each greened its own negative under the mutation
  and stayed red under pristine bytes.
- m05 was killed **only by the positive control**: under the off-by-one, all 20 valid rows fail
  `quote-off-line`, so the battery's negative criterion (expected id *present anywhere* in the
  run, `negatives-sibling-matrix-r69.mjs:97`) is satisfied incidentally and it reports 19/19
  "refused" while `positiveOk=false`. Lane-scoped probe on the battery's own forgery file
  (`witnesses/m05-lane-probe.json`): pristine → 1 finding, lane `mori`; m05 → 19 findings on the
  other 19 lanes and **no `mori` finding** — the forged lane passed, exactly the "refused for the
  wrong reason" pattern. The kill is real, but it rests on the positive control, not on forgery
  detection.
- No mutant both greened a forgery and kept the positive clean.

## Surviving mutants → four named battery coverage gaps

Each survivor was validated against a hand-built forgery that the frozen contract forbids and the
battery does not contain (`witnesses/w1…w4.json`, `witnesses/summary.json`; the driver is archived
as `witnesses/probe.mjs` exactly as it ran — it reads the scratch fixture tree, which is deleted). Pattern: pristine exits 1 for the named id, mutant exits 0 clean.

| id | forgery the battery never tries | pristine | mutant | gap |
|---|---|---|---|---|
| m06 | quote of 2 verbatim words on the cited line (contract: 3..25) | exit 1 `quote-length` | exit 0 | no negative for the quote *lower* bound |
| m14 | tabi side of 2 words (contract: ≥ 4); battery only uses `—` (1 word) | exit 1 `tabi-side-empty` | exit 0 | no negative for 1–3-word sides |
| m17 | exact duplicate row with the *same* relation (contract: one row per lane); battery only duplicates with a flipped relation | exit 1 `duplicate-lane` | exit 0 | no negative for same-relation duplicates |
| m18 | sibling PROVINCE writes `Tabi` capitalised; row says none (battery mentions are lowercase only) | exit 1 `inbound-relation-none` | exit 0 | no negative for case-varied tabi mentions |

W4 also carries its own positive control (same capitalised sibling with the row kept `adjacent`):
pristine exit 0, so the witness kill is not an artefact of the edit.

These are coverage findings only. I do not propose amending any predicate, counter behaviour or
kill rule; the frozen claims remain as recorded. If the owners ever extend the battery, the four
witness files above are drop-in negative shapes.

## Honest limits

- Fixture mode only. I did not run the real-mode battery, did not touch `PROVINCE.md`, and make no
  claim about the scored tip. `--fixture` builds its own 20-lane snapshot, so the frozen
  `sibling-heads-r69.tsv` is not read by this probe.
- No scored C1/C2 run, no chromium, no network, no host/service changes, no package installs.
  Fixture git repos live only under scratch; the lane's git state was read-only.
- Scratch `/fast/scratch/hyaku/tabi-r69/R69Mut1/` is deleted after copying receipts here.

## Reproduction

```
# baseline
node scripts/negatives-sibling-matrix-r69.mjs --fixture \
  --counter scripts/check-sibling-matrix-r69.mjs \
  --work /fast/scratch/hyaku/tabi-r69/R69Mut1/m0 \
  --out .ufo/waves/round-69/w1/R69Mut1/m0-baseline.json
# a mutant: regenerate from harness/manifest.json (asserted unique replacement) then
node scripts/negatives-sibling-matrix-r69.mjs --fixture \
  --counter <scratch>/m01.mjs --work <scratch>/m01 \
  --out .ufo/waves/round-69/w1/R69Mut1/m01.json
```
