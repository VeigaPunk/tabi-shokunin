# AdjDrift10 — C1 drift re-derivation, chunk of 20 rows (kake / kama / kumitate)

Seat: AdjDrift10 (executor, wave w1, round 36 attempt 1). Milestone C1 / axis adjacency.
Input: `.ufo/waves/round-36/w1-chunks/AdjDrift10.tsv` (20 rows).
Contract read first: `.ufo/waves/round-36/claims.json` (C1 surface/predicate/killRule/feasibilityDisclosed),
pins read: `.ufo/waves/round-36/baseline/c1-delta-pins.json`.

## Result

**20 rows derived, 0 mismatches — every row's independent derivation equals the committed
ledger status in `corpus/adjacency-screen-drift.tsv`.** All 20 are `unchanged`, note `-`.

Receipt: `.ufo/waves/round-36/w1/AdjDrift10/receipt.tsv` (`sibling_ref / my-status / my-note /
ledger-status / agree|MISMATCH`, plus summary `# AdjDrift10: 20 rows, 0 mismatches`).
Exact commands: `.ufo/waves/round-36/w1/AdjDrift10/commands.txt`.

## Method (git objects only, read-only)

For each row `git show <pin>:<path>`, take line `<line>`, trim → CITED. Then
`git show <H>:<path>` with H from `c1-delta-pins.json` for the lane; equal trimmed text at
`<line>` → `unchanged`; otherwise scan the whole head file for a trimmed-text equality →
`moved :N` (all N listed) or `stale`. Missing file/line → `stale: pin line absent` /
`stale: head file absent`. Trim = leading+trailing whitespace on both sides; comparison is
verbatim-equality after trim (the same rule the claim states for moved-row verification).
Ledger rows matched by exact `sibling_ref`; the committed ledger holds exactly one line per
one of my 20 refs (no duplicate `sibling_ref` in the file at all) and no ref of mine is absent.

## Per-lane evidence

| lane | pin (cited) | delta head H | commits pin..H | files changed pin..H |
|---|---|---|---|---|
| kake | 044048597d62f3199494b63b36e90dd57825e350 | 437f53b1f6cd22dbf307f1187f41d1c0850a1ac2 | 32 | 1572 |
| kama | e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d | 3a600d2f729828419aaea34cc402c8b0d20fb720 | 67 | 8268 |
| kumitate | 8d557f85312de4fcc82e09ff735d21436bc3746d | d23892ad44b41e1af63b3edb949d265ca1dd812d | 12 | 578 |

All three pins are commits and are ancestors of their frozen heads (`git merge-base --is-ancestor`
→ yes), so the lanes are genuinely drifted and `unchanged` is a real finding, not a tautology
of comparing a revision with itself.

The six cited files are **blob-identical** between pin and head (`git rev-parse <rev>:<path>`
equal on both sides; `git diff --stat pin..head -- <path>` empty), which is why all 20 rows are
`unchanged`:

- kake `corpus/knowledge/publish-channels.md` (109 lines, blob ae5e6b577e…) — rows 2, 32, 68
- kake `corpus/knowledge/publish-queue.md` (293 lines, 2fbeab366a…) — rows 26, 29, 131
- kake `corpus/knowledge/vault-properties.md` (103 lines, 7435c09c42…) — rows 29, 40, 97
- kama `corpus/knowledge/consumer-registry.md` (413 lines, 9db0d9af48…) — rows 61, 236, 277, 325, 332
- kama `corpus/knowledge/endpoint-identity.md` (218 lines, 430845c64c…) — row 125
- kama `corpus/knowledge/listener-census.md` (398 lines, a857bcac63…) — rows 241, 243, 356
- kumitate `corpus/knowledge/kimi-skills-plugins.md` (581 lines, 3fd9511452…) — rows 6, 218

No cited line is empty or whitespace-only (shortest cited text 23 chars: kama listener-census:241
`# C12 — chrome devtools`), so no row passes by degenerate empty-string equality. Two lines were
hand-read out of `git show` and match the cited text at the same line at head
(kumitate kimi-skills-plugins.md:218 `## ~/.kimi-code/skills/kimi-webbridge`; kama
listener-census.md:241/243 verbatim).

## Instrument self-tests (branch coverage, not part of the chunk)

- `moved` branch: applying my derivation to the three kaidoku rows the frozen claim names
  (`kaidoku-shokunin@49096c7e…:SKILL.md:585/621/652`, H `1ed29de2…`) reproduces **748 / 784 / 815**
  line-for-line — exactly the relocations stated in `claims.json` C1 surface. The moved branch
  is therefore live and agrees with the claim's own derivation.
- `stale` branch negative control: a cited line mutated by one appended token yields no head hit
  → `stale` (expected empty). No natural stale case exists in this chunk.

## Scope / limits

Chunk-bounded: only the 20 assigned rows were re-derived. This seat asserts nothing about the
other 287 drift rows, about the delta screen ledger, or about the counter verdict; it is a
sampling falsifier for C1's "every status equals the honest derivation" sentence.
Disclosed limit inherited from C1: a forger running the same derivation needs no lane work — this
receipt only shows that the committed ledger text equals the honest git-object derivation for
these 20 rows at the frozen delta heads.

No repo mutation: read-only `git show` / `rev-parse` / `diff --stat` / `rev-list` only, all with
`-C <clean sibling repo>`; nothing written outside the seat dir and the deleted scratch root.
No pacman, no tool installs, nothing spawned.

VERDICT ok 20/20 rows agree with the committed ledger (all `unchanged`), 0 mismatches; moved/stale branches self-tested
