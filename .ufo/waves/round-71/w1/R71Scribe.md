DRAFTED-WITH-FINDINGS

# R71Scribe — scoped findings (round 71 w1, leaf scribe)

Deliverables (proposals for the integration owner; `SKILL.md` and `SCORECARD.md` untouched):
- `.ufo/waves/round-71/w1/R71Scribe/registry-rows.md` — `## Round 71 gate registry` in the exact
  round-70 8-column schema, four rows: `check-synthpinch-r71` (gate), `negatives-synthpinch-r71`
  (gate battery), `verify-live-r71` (gate, profiles synthscroll-r69 + synthtap-r70),
  `attack-harness.mjs + evaluate-c2.mjs` (gate pair), plus the "instruments without a gate
  verdict (round 71)" paragraph. Every verdict map, exit, pin and write-scope cell is taken from
  the instrument headers at the frozen bytes; the eight instrument digests were re-derived and
  match `freeze.txt`/`claims.json` verbatim.
- `.ufo/waves/round-71/w1/R71Scribe/scorecard-row.md` — `chromium-synth-pinch-gesture-linux`
  row in the round-70 four-column format, built only from the committed pinch receipt
  (`legShape`/`legs`/`events`/`cdpSendLog`) and the L1 scored outputs (clean 87-check counter,
  107/107 battery with 98 isolated cases, 87/87 mutants killed), first-working round 71.
- `.ufo/waves/round-71/w1/R71Scribe/report.md` — full report (provenance table, per-field header
  citations, findings, limits).

Findings:
- S-1 (operability): no round-71 gate has a `--selftest` entry; `scripts/selftest-r70-gates.mjs:3,24`
  accepts only `synthtap|live` and covers r70 instruments only, and the three r71 scripts contain
  no `selftest` occurrence. The drafted rows therefore name the battery, the kill-power control and
  the attack/evaluator controls as the nearest declared exercises instead of inventing a command.
  Repro: `node scripts/selftest-r70-gates.mjs --selftest --scratch /abs --gate synthpinch` → exit 2.
- S-2 (C1 leg (b) red, reported; instruments frozen — not re-run, not amended): the independent
  seat cold run `.ufo/waves/round-71/w1/R71Exec1/counter.json` is `verdict: findings`, 1 finding
  `event-leg-domain` ("events outside the frozen legs: 1"); its receipt seq 575 is a trailing
  trusted zero-delta ctrl wheel tagged `leg:"end"`. `scripts/chrome-cdp-synthpinch-round71.mjs:330`
  labels that window while the scaleFactor-0 gesture is still pumping (driver :183-185, S177
  infinite end time; 4 s bounded wait :199-200, 700 ms settle :325), and
  `scripts/check-synthpinch-r71.mjs:100` refuses any leg outside the frozen 11. The L1 scored
  receipt has 0 `end` events (571 events, last leg `zero`), so (a)/(c) stay green; the ~16 ms
  race makes the seat leg luck-dependent. Repro: `node scripts/check-synthpinch-r71.mjs --receipt
  .ufo/waves/round-71/w1/R71Exec1/receipt.json --expect-driver-sha256
  5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af --json` → exit 1. The scorecard
  row should not be entered until L1 adjudicates this against the C1 kill rule "any predicate leg
  (a)-(d) false at the lane tip".

Not done (out of scope): no edits to `scripts/`, `corpus/`, `controls/`, `SKILL.md` or
`SCORECARD.md`; no git/jj mutation or commit; no Chromium run; no scored re-run; no tool installs.
