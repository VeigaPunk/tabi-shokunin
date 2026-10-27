# CritBuildTool — round 36 w2

## Counterexample and evidence

**No finding: the kama typo is inert for this round.** The tool's PINS entry is `kama: 'e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d'` (tool line 21); the round-35 baseline pin is `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d` (round-35 `c1-pins.json`, line 9), which is the cited 40-hex value. The tool value is 39 hex characters.

Three independent dataflow reasons establish inertness:

1. **Membership only:** `deltaPins` is parsed from the frozen delta-pins JSON (tool lines 60–65), and `drifted` is computed at line 66 as `Object.entries(deltaPins).filter(([s, h]) => h !== PINS[s]).map(([s]) => s)`. PINS is only compared to each delta head to decide whether the sibling key belongs to `drifted`; the pin value itself is not used as a read revision.
2. **Screen refs supply the round-35 pin:** for each screen row, the tool extracts `sib`, `pin`, `path`, and line number from `refRe` at lines 71–74, then reads the old cited file using `${pin}:${path}` at line 76. It does not look up the old revision in PINS. Thus the bad kama string cannot alter the old cited content or its derived status.
3. **Delta heads supply the new revision:** the tool reads the new file using `${deltaPins[sib]}:${path}` at line 81. The round-36 heads therefore come from the delta-pins JSON, not PINS. The typo only makes the comparison `deltaPins.kama !== PINS.kama` true—which is already true for the intended round-35 kama pin versus its round-36 delta head—so kama remains in the drifted set.

**Other 19 values:** compared all keys other than `kama` in the tool's PINS block (lines 14–20 and 22–33) against the same-named keys in `.ufo/waves/round-35/baseline/c1-pins.json` (lines 2–8 and 10–20). All 19 match key-for-key exactly; no second typo found.

**Moved-note shape accepted:** build tool line 87 emits `verbatim at :${reloc[0]}${...}` and, for repeats, appends ` (also :${reloc.slice(1).join(', :')})`. The frozen counter line 438 uses `/:([1-9][0-9]*)\b/.exec(note || '')`, a first-match search, not a start-anchored expression. Therefore the emitted `verbatim at :N (also :N…)` is accepted; the first match captures the relocation line number N. Counter lines 440–443 then validate that first line against the cited text at the delta head.

## Impacted axes

Adjacency: the kama typo does not change the drifted-set membership, screen-ref pin reads, or delta-head reads for this frozen round. Calibration: no defect requiring correction found; the note's first-match semantics match the builder's emitted note format.

VERDICT ok — kama PINS typo is inert for round 36; all other 19 PINS match round 35; emitted moved-note format is accepted by the frozen counter's first-match regex.
