# R85Exec2 — leg (b): battery, kill power, selftest vs committed scored receipt

Seat: R85Exec2 (leaf, operability). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Base c574d593, freeze 5c1961525e83efe2682cab389b8995d67c0ab4f0, D dbecb1a18905, nonce tabi-r85-l1-dbecb1a18905. No tool installs (pacman paused; none needed). Scratch /fast/scratch/hyaku/tabi-r85/R85Exec2/{b,k,s} created and deleted before yield.

## Receipt pins used
- Receipt: corpus/evidence/round85/chromium-showpicker/receipt.json
- nonce (from receipt): `tabi-r85-l1-dbecb1a18905`
- driverSha256 (from receipt): `1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee` (= freeze.txt line 1, scripts/chrome-cdp-showpicker-round85.mjs)
- fixture.sha256 (from receipt): `9b71a94904c4ca52473a4ecf66f25fe8fd6e405e3cec022bb4a47e0f7532db5d`
- prior-set: .ufo/waves/round-85/controls/c1/prior-set.txt

## 1. Battery (negatives-showpicker-r85.mjs) — GREEN
Command: `node scripts/negatives-showpicker-r85.mjs --lane <lane> --real <receipt> --expect-driver-sha256 1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee --expect-nonce tabi-r85-l1-dbecb1a18905 --expect-fixture-sha256 9b71a94904c4ca52473a4ecf66f25fe8fd6e405e3cec022bb4a47e0f7532db5d --prior-set .ufo/waves/round-85/controls/c1/prior-set.txt --work /fast/scratch/hyaku/tabi-r85/R85Exec2/b --json`

- Exit code: 0
- JSON: {"schema":"tabi-r85-battery","cases":175,"failed":0,"coverage":{"declared":87,"covered":87,"uncovered":[],"unknown":[]},"results":[]}
- Numbers: **175 cases / 0 failed / coverage 87/87** — matches frozen C1 predicate.

## 2. Kill power (kill-power-r85.mjs) — GREEN
Command: `node scripts/kill-power-r85.mjs` with same flags, `--work .../k --json`

- Exit code: 0
- JSON (summary): {"schema":"tabi-r85-kill-power","mutants":58,"killed":58,"survived":0,"crashed":0,"survivorsList":[],"unapplied":[]}
- Numbers: **58 mutants / 58 killed / 0 survived / 0 crashed / unapplied []** — matches frozen C1 kill power (58/0/0). New mutants `same-origin-no-picker-law-dropped` (failed 1) and `same-origin-no-picker-want-dropped` (failed 161) both killed.

## 3. Selftest (selftest-r85-gates.mjs) — RED (8/9 gates green, 1 red)
Command: `node scripts/selftest-r85-gates.mjs --lane <lane> --work .../s --json`

- Exit code: 1
- clean: false, cases 9, failed: ["record-drift"]
- Gates (ok/finding):
  1. pins-match-freeze — ok=true — "files whose sha256 differs from freeze.txt: []"
  2. counter-clean — ok=true — "exit 0 {\"verdict\":\"clean\",\"checks\":87,\"findings\":[]}"
  3. battery — ok=true — "exit 0 {\"cases\":175,\"failed\":0,\"coverage\":{\"declared\":87,\"covered\":87,\"uncovered\":[],\"unknown\":[]}}"
  4. kill-power — ok=true — "exit 0 {\"mutants\":58,\"killed\":58,\"survived\":0,\"crashed\":0,\"survivors\":[]}"
  5. **nowork-control** — ok=true — "exit 1 findings [\"schema\",\"nonce-shape\",\"nonce-expected\",\"driver-pin\",\"fixture-hash\",\"plan-frozen\",\"leg-order\",\"leg-records\",\"context-binding\",\"send-log-allowlist\",\"plan-calls\",\"cdp-event-log-closed\",\"leg-sp83-cross-origin-nonfile\",\"leg-sp83-cross-origin-nonfile-disabled\",\"leg-sp83-cross-origin-color\",\"leg-sp83-cross-origin-month\",\"leg-sp83-cross-origin-week\",\"leg-sp83-cross-origin-time\",\"leg-sp83-same-origin-nonfile-disabled\",\"leg-sp83-webkitdirectory-answer\",\"leg-sp83-accept-answer\",\"leg-sp83-click-while-open\",\"leg-sp83-cross-origin-number\",\"leg-sp83-cross-origin-range\",\"leg-sp83-multiple-mode\",\"leg-sp83-accept-mime-answer\",\"leg-sp83-second-chooser-answer\",\"gesture-law\",\"activation-law\",\"cross-origin-nonfile-law\",\"order-law\",\"sp84-cross-origin-color-law\",\"sp84-cross-origin-month-law\",\"sp84-cross-origin-week-law\",\"sp84-cross-origin-time-law\",\"sp84-cross-origin-number-law\",\"sp84-cross-origin-range-law\",\"sp84-cross-origin-tel-law\",\"sp84-cross-origin-search-law\",\"sp84-cross-origin-text-law\",\"webkitdirectory-answer-law\",\"accept-answer-law\",\"click-while-open-law\",\"multiple-mode-law\",\"accept-mime-answer-law\",\"second-chooser-answer-law\",\"no-selection-law\",\"same-origin-no-picker-law\",\"intercept-law\",\"fixture-descriptors\",\"prior-set-complete\"]"
  6. tree-exempt-path-refused — ok=true — exit 2 usage finding on tree-exempt-path-refused
  7. tree-exempt-unmatched-refused — ok=true — "exit 1 findings [\"prior-set-unmatched-exempt\"]"
  8. **record-drift — ok=FALSE — exit 1 {"claims":8,"mismatches":6,"failed":["family-witnesses","accept-grammar-frontier","r85-numbers","census-artifacts","r85-identity","witness-instrument"]}**
  9. capability-status — ok=true — "exit 0 {\"rows\":17,\"claimed\":16,\"provisional\":1,\"mismatches\":0}"

### Red gate detail
**Gate `record-drift` is RED.** Exact finding from `scripts/check-record-drift-r85.mjs` (via selftest): `exit 1 {"claims":8,"mismatches":6,"failed":["family-witnesses","accept-grammar-frontier","r85-numbers","census-artifacts","r85-identity","witness-instrument"]}`. That is 6 of 8 record claims mismatch. The selftest detail does not unpack per-claim drift values; I did not run check-record-drift-r85.mjs standalone (out of my leg (b) assignment — leg (c)/witness seats own those artifacts). No instrument was weakened or edited.

## Risks / blockers
- **record-drift red blocks a fully-clean selftest**: 6 mismatched record claims (family-witnesses, accept-grammar-frontier, r85-numbers, census-artifacts, r85-identity, witness-instrument) at claims=8. Needs L1 disposition — refresh the record artifacts or waive with evidence. Battery, kill power, and counter-clean (87 checks) are green against the committed receipt, so the measurement core is sound; the drift is in the surrounding record/documentation surface.
- No other blockers. No instrument edits, no predicate/counter/pin/threshold changes proposed — attacked them as instructed; the measurement instruments held.
