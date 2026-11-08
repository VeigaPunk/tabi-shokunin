# R84Exec3 — battery, kill power, selftest against scored receipt

Seat: R84Exec3
Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin
Receipt: corpus/evidence/round84/chromium-showpicker/receipt.json
Nonce: tabi-r84-l1-a5bdb15ec9a7
Driver sha256: f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e
Fixture sha256 (from receipt.fixture.sha256): 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a

## Commands run

Battery:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-showpicker-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round84/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 \
  --expect-fixture-sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-84/controls/c1/prior-set.txt \
  --work /fast/scratch/hyaku/tabi-r84/R84Exec3/battery --json
```

Kill power:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/kill-power-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round84/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 \
  --expect-fixture-sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-84/controls/c1/prior-set.txt \
  --work /fast/scratch/hyaku/tabi-r84/R84Exec3/killpower --json
```

Selftest:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-r84-gates.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --work /fast/scratch/hyaku/tabi-r84/R84Exec3/selftest --json
```

## Battery summary

- cases: 156
- failed: 3
- coverage.declared: 80
- coverage.covered: 74
- coverage.uncovered: NOT empty (6 entries)
- coverage.unknown: []

### Failed cases (verbatim)

1. case: `leg-sp84-cross-origin-tel`
   - accept: false
   - expect: `leg-sp84-cross-origin-tel`
   - ok: false
   - detail: `exit 1 expected leg-sp84-cross-origin-tel got ["leg-sp84-cross-origin-tel","no-selection-law"] extra ["no-selection-law"]`

2. case: `leg-sp84-cross-origin-search`
   - accept: false
   - expect: `leg-sp84-cross-origin-search`
   - ok: false
   - detail: `exit 1 expected leg-sp84-cross-origin-search got ["leg-sp84-cross-origin-search","no-selection-law"] extra ["no-selection-law"]`

3. case: `leg-sp84-cross-origin-text`
   - accept: false
   - expect: `leg-sp84-cross-origin-text`
   - ok: false
   - detail: `exit 1 expected leg-sp84-cross-origin-text got ["leg-sp84-cross-origin-text","no-selection-law"] extra ["no-selection-law"]`

### Coverage uncovered (NOT empty)

```
leg-sp84-cross-origin-tel
leg-sp84-cross-origin-search
leg-sp84-cross-origin-text
sp84-cross-origin-tel-law
sp84-cross-origin-search-law
sp84-cross-origin-text-law
```

## Kill power summary

- mutants: 50
- killed: 50
- survived: 0
- crashed: 0
- survivorsList: []
- unapplied: []

Survivors: none. Every mutant killed.

## Selftest summary

- schema: `tabi-r84-selftest`
- clean: false
- cases: 9
- failed gates: `pins-match-freeze`, `record-drift`

### Gate results

1. pins-match-freeze: ok=false, detail: `files whose sha256 differs from freeze.txt: ["scripts/negatives-showpicker-r84.mjs"]`
2. counter-clean: ok=true, detail: `exit 0 {"verdict":"clean","checks":80,"findings":[]}`
3. battery: ok=true, detail: `exit 0 {"cases":162,"failed":0,"coverage":{"declared":80,"covered":80,"uncovered":[],"unknown":[]}}`
4. kill-power: ok=true, detail: `exit 0 {"mutants":50,"killed":50,"survived":0,"crashed":0,"survivors":[]}`
5. nowork-control: ok=true, detail: `exit 1 findings ["schema","nonce-shape",...,"prior-set-complete"]` (truncated in stdout; full list in selftest.json)
6. tree-exempt-path-refused: ok=true, detail: `exit 2 {"schema":"tabi-chrome-cdp-showpicker-r84-counter","verdict":"usage","findings":[{"id":"usage","detail":"tree-exempt-path-refused: the exemption interface is content-bound; pass --tree-exempt-sha256 <hex>"}]}`
7. tree-exempt-unmatched-refused: ok=true, detail: `exit 1 findings ["prior-set-unmatched-exempt"]`
8. record-drift: ok=false, detail: `exit 1 {"claims":10,"mismatches":8,"failed":["r83-accept-correction","r83-png-correction","falsification-scout","record-counts","r83-numbers","census-artifacts","r84-identity","r84-numbers"]}`
9. capability-status: ok=true, detail: `exit 0 {"rows":16,"claimed":15,"provisional":1,"mismatches":0}`

## Interpretation

The lane's own battery run fails 3/156, all the new r84 tel/search/text legs. The counter reports `no-selection-law` as an extra finding beyond the expected leg id, so the battery expects exactly `[leg-id]` but gets `[leg-id, no-selection-law]`. Coverage therefore shows 74/80 with the six tel/search/text law checks uncovered.

Notably, the selftest's internal battery gate passes with 162 cases, 0 failed, 80/80 covered — i.e., the selftest's copy/mirror of the battery behaves differently from a direct lane-tree battery run. The selftest also reports `pins-match-freeze` failing because `scripts/negatives-showpicker-r84.mjs` bytes in the lane differ from freeze.txt — the lane tree bytes have moved since freeze.

Kill power is clean: 50/50 killed, 0 survived, 0 crashed, no unapplied.

No survivors and no crashed mutants to list. Failed cases are the three listed verbatim above.

## No mutation / cleanup notes

- Read-only lane usage; no lane files edited. Scratch copies under /fast/scratch/hyaku/tabi-r84/R84Exec3/ were created and then removed after copying receipts.
- JSON receipts copied to the wave dir: battery.json, killpower.json, selftest.json.

Report: .ufo/waves/round-84/w1/R84Exec3.md
