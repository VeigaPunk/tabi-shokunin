# R69Mut1 — C1 frozen counter, mutation probe (fixture battery)

Verdict: **PASS** — 18 single-point mutants, 14 killed, 4 survived the frozen 19-negative
battery (named coverage gaps, not contract amendments), 0 inconclusive; baseline and restored
bytes clean. Full report: `.ufo/waves/round-69/w1/R69Mut1/report.md`.

## Pins (verified before generation and after the probe)

- `scripts/check-sibling-matrix-r69.mjs` — `b62f9c7daebfbd0a1494e9a60a9ee06665574f1f98969ba1c08da0d698c58b20` (matches freeze.txt; source byte-identical after the probe)
- `scripts/negatives-sibling-matrix-r69.mjs` — `dac61e1b829003da4ef2b1b1de64ba014f194721d20d7a0597ecb6857394ba92`
- Detector: `node scripts/negatives-sibling-matrix-r69.mjs --fixture --counter <bytes> --work <scratch>/m<N> --out <wave>/m<N>.json`
  (exit 1 = killed, 0 = survived, 2 = inconclusive/none observed)

## Results — every result pinned to its counter sha256 (`run-summary.json`, `mutants.md`)

Killed (targeted forgery greened under mutation): m01 duplicate, m02 relation vocab, m03 head,
m04 whole-file quote (2 negatives), m07 quote upper bound, m08 inbound cite, m09 contested rule,
m10 inbound none, m11 outbound routing, m12 lane-missing, m13 Refuses paragraph, m15 absent cite
file, m16 header shape.

Killed by positive control only: **m05** off-by-one line index — the battery reports 19/19
"refused" while the positive is red; lane probe shows the forged (`mori`) row passed and the 19
untouched rows produced the matching id. This is the battery's id-membership criterion
(`negatives-sibling-matrix-r69.mjs:97`) counting a wrong-reason refusal; the positive control is
the real kill. Evidence: `witnesses/m05-lane-probe.json`.

Survived (battery green, 19/19, positive ok; each validated by a forgery the battery never tries —
pristine exit 1 for the named id, mutant exit 0):

- m06 — quote lower bound 3→1 words; gap: no negative for a 2-word on-line quote
- m14 — tabi-side minimum 4→2; gap: no negative for a 1–3-word side (`witnesses/w2`)
- m17 — duplicate only when relations differ; gap: no negative for an exact same-relation duplicate
- m18 — case-sensitive tabi match; gap: no negative for a capitalised `Tabi` mention

Witness receipts: `.ufo/waves/round-69/w1/R69Mut1/witnesses/w1…w4.json` + `summary.json`; diffs:
`.ufo/waves/round-69/w1/R69Mut1/diffs/`; generator/manifest: `.ufo/waves/round-69/w1/R69Mut1/harness/`.

## Restoration / scope

- Restored copy: `restored.sha256` = pin, `restore-check.json` exit 0, 19/19, positive ok.
- No writes outside `.ufo/waves/round-69/w1/R69Mut1/` and scratch; scratch deleted.
- Fixture mode only; no real-mode battery, no `PROVINCE.md`/production byte touched, no scored run,
  no chromium, no network, no installs, no git mutation in the lane.
