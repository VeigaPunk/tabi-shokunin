
## Round-33 errata intake — corrections (append-only)

- **Carried-errata arithmetic, `corpus/lessons/round-32.md:98`.** `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`
  holds 43 items: 27 are marked `Carried` (E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33, E35, E37,
  E38), 12 `Corrected here` and 4 `No action`. The disposition table above covers E1–E27 by number and closes seven
  carried items (E16, E21, E22, E23, E24, E26, E27), so the remain-count the table supports is 20 of 27, not 16: the
  12 carried items the line names (E4, E6–E10, E12–E14, E17, E18, E20) plus eight carried items no disposition
  reaches (E28, E30, E31, E32, E33, E35, E37, E38). The line's other four names (E1, E3, E5, E19's `passed=` arm) are
  not carried items.
- **Finding itemization, `corpus/lessons/round-32.md:112-116`.** The freeze reading carries 195 findings: 109 m1,
  77 m2, 9 m4. The paragraph classifies 189 of them (104 refused, 46 m1 matched, 21 m1 cleared, 15 m1 and 3 m4
  counted); the six it omits are matches it does not classify — one m2 command
  (`corpus/evidence/round-23/c1-measurements.json`, claimed = observed = 128) and five m4 round groups whose stated
  `inactive` re-derives (`SCORECARD.md:1126`, `:1215`, `:1277`, `:1333`, `:1382`).
- **Gate quote lengths, `corpus/lessons/round-32.md:17` and `:18`.** By whitespace split the S124 Abstract quote is
  15 words and its §4.1 quote 17, not 16 and 18; the S125 `caps.Set(…)` quote at `:18` is 8 words, and the stated
  "12 tokens" matches no tokenisation of that line (the column's own unit is words). The S126 quote at `:19`
  re-counts to 12 words as stated. `corpus/lessons/round-32-verifier-spotcheck.md:128` records the S124 half.
- **Draft-tree provenance for M4's receipt, `.ufo/waves/round-32/w1/ExecC2Apply/counter-after.json`.** The rev that
  receipt and `verify.txt` name (363be55) does not exist in the lane repo, and no tree digest was recorded. The draft
  is reproducible from committed bytes: applying `ExecC2Apply/corrections.patch` (sha256
  `7a61bfa6855d95d188fb77f7869e954cd308ecdd2a10e3fc45832655d7dfd879`, three files) to the freeze 4181fff yields
  tree `f0d867c3a711f6c7c2176841aff92efef95233d5`, and the frozen counter at that tree reads mismatches 0, clean,
  198 findings — the reading the receipt records.
