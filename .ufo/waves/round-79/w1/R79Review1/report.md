# R79Review1 — C1 legs (a)–(d): independent re-run, pin re-derivation, false-green hunt

Seat: R79Review1 (read-only reviewer). Reviewed bytes: lane HEAD `3a1209c0` (the wave re-froze to a
new digests commit during this review; the assignment's D `80830674` is now an ancestor). The working
tree has uncommitted scored outputs and a new scored receipt. Scratch
`/fast/scratch/hyaku/tabi-r79/R79Review1` was deleted before yield. No tool installs were needed.

## Verdict

- **(a) PASS on both D's.** The old receipt (nonce `tabi-r79-l1-80830674d421`, file sha
  `6d243c775fe1f95ca75ee6001e584873e3dac3c9f897924a2da674b83a821535`) and the new receipt (nonce
  `tabi-r79-l1-3a1209c0d624`, file sha `bda38512ece0d95a61fa54c2036ca1be3389aedb5e774c96852a9eff80dc30b7`)
  each exit 0, verdict clean, 56 checks, prior set 4. Re-run command used the frozen driver pin and
  each receipt's own fixture sha.
- **(b) FAIL at the target's D; PARTIAL at the new D.** At D `80830674` the frozen counter's
  `--prior` interface did not exempt the scored receipt from `prior-set-complete`, so the claim's
  cold-run command refused honest cold1/cold2 (exit 1, sole finding `prior-set-complete`). The
  executor reproduced this in
  `.ufo/waves/round-79-seats/R79Exec1/score-cold1-assigned-cmd.json` and
  `score-cold2-assigned-cmd.json`. Fixed at `3a1209c0` (counter pin `0dc76277...`); cold1/cold2 now
  score clean with `--prior` alone. At review time only **2** honest cold runs exist; cold3/cold4
  attempt1 had driver failures (`no-response-30000ms Runtime.evaluate` on `sp-cdp-gesture` plus one
  other leg each); retries were in flight; `scored/cold-runs.txt` is **absent**.
- **(c) PARTIAL.** Battery 90/90, coverage 56/56 (not the frozen 87); kill power 64/64, 0 survived,
  0 crashed (not the SKILL's 66). The kill-power output is not committed under `scored/`; it exists
  only inside the selftest output.
- **(d) FAIL.** The note cites S216–S218, not S219; the SKILL registry says 88 cases and 66 mutants
  (actual 90 and 64); the committed selftest output (9/9 green) was produced on the pre-re-freeze
  receipt and is stale against the new receipt.

## Pins

All 13 freeze entries re-derived from committed bytes at D `80830674` and at D `3a1209c0`, and from
the working tree: **MATCH**. The freeze.txt self-check (13/13) passes at the new D. The counter pin
changed from `4072031ba8723183f5755e7cfe1b7032160681c0a330c137da9e7a6c537e7815` (old D) to
`0dc76277a870f71d21e0bc4e840246b85831b2dbed6e659ad270df3043cd3f76` (new D). The driver pin
`e9c87159...` is unchanged.

## Attacks

Each forged receipt is under `.ufo/waves/round-79-seats/R79Review1/forgeries/` and was run on the
current counter with its own nonce/fixture, the committed prior set, and the content exemption of the
walked receipt.

**(i) r78 file-chooser receipt.** Exit 1, **51 findings** with the content exemption (52 without it;
the extra is `prior-set-complete` for the walked scored receipt). `schema`, `plan-frozen`, every
`leg-*`, `gesture-law`, `intercept-law` fail. No check is satisfiable by the r78 receipt. PASS.

**(ii) `gesture-law` binding.** It binds the exact error class AND message: a wrong message (B) and a
wrong class (C) each exit 1 with `gesture-law`. PASS.

**(iii) SURVIVING — HIGH.** D: `triggerResult=null` + `triggerError={code:-32000,...}` on every
showpicker leg, with `showPicker`/activation untouched → **exit 0 clean**. D2: only `triggerError`
non-null → **exit 0 clean**. The receipt's own wire field says the trigger send failed; the counter
is clean. `triggerResult`/`triggerError` are in `LEG_KEYS` (counter line 173) but no check binds them
to `showPicker`; `errOk` (line 176) accepts a non-null error object in `leg-records` (line 203).

**(iv) `no-selection-law`.** An observable selection (`stateAfter.s=['picked.png']`, G) and a
`change` event carrying a file (H) each exit 1 with `no-selection-law` + `leg-sp-click-then-show`.
The check proves the absence of observable selection (empty file lists at settle and after dismiss,
no input/change, no files-bearing non-cancel event), not a continuous in-browser proof. Adequate for
the contract; residual snapshot gap only.

**(v) `plan-calls`.** A duplicate trigger expression (F), a missing trigger send (L), and a trigger
send missing `returnByValue` (N) each exit 1 with `plan-calls` (L also `cdp-event-log-closed`). But a
contradictory `triggerResult` (E) → **exit 0 clean**: the send log is checked, the response is not.
`plan-calls` cannot distinguish a real send from a fabricated log entry; the only wire evidence is
ignored. Same root as (iii).

## Other surviving forgeries

- **I — HIGH: fixture self-supplied.** `fixture.sha256` and `fixture.patch` changed to forged values,
  the new sha passed as `--expect-fixture-sha256` → **exit 0 clean**. `fixture-hash` (line 185)
  checks only the receipt's own sha, the viewport, and the key set; `fixture.patch` content is never
  compared to the driver's frozen constants, and the fixture source
  (`scripts/chrome-cdp-filechooser-round78.mjs`) is not in freeze.txt. The fixture pin is circular.
- **J/J2/J3 — HIGH, same class as (iii).** `interceptResult=null` (J), `interceptError={code:-32601,...}`
  (J2), `priorClickError={code:-32000,...}` (J3) each **exit 0 clean**. `errOk` accepts non-null
  errors and no check requires null when the effect is asserted.
- **M — MEDIUM.** The activation probe `Runtime.evaluate` sent with `userGesture:true` → **exit 0
  clean**. `send-log-allowlist` (lines 209/222) validates the expression, not the params, for
  non-trigger evaluates. The receipt shows the probe itself granted activation while the reported
  readings are false/false.

Controls correctly killed: K (`dismissResult` altered → `dismiss-law`), F/L/N (`plan-calls`), G/H
(`no-selection-law`), B/C (`gesture-law`).

## Record discrepancies in the frozen artifacts

- Battery case count: predicate leg (c) and claims `frozenAt` say **87**; SKILL line 3236 says
  **88**; the pinned battery reports **90** (`scored/c1-negatives-a.json`, selftest output). The
  frozen leg (c) count is not the pinned battery's count.
- Kill-power mutant count: SKILL line 3236 says **66**; the pinned kill-power reports **64**
  (selftest output).
- Source citation: predicate leg (d) says the note cites **S216–S219**; the note's `source:` line
  cites S216, S217, S218 only; S219 appears nowhere in the note. SCORECARD says "sourced:
  S216–S218" and "Registry 215 → 218".
- SCORECARD line 3911 says the r78 receipt under the r79 counter yields **52** findings; the
  reproducible count is **51** with the content exemption (52 without it, because the walked scored
  receipt is then an unexempted schema receipt). The "before: no r79 receipt" state would be 51.
- The claims' `frozenAt` "battery 87/87" is stale against the pinned battery at both D's.

## Process finding: the wave re-froze mid-wave

Commit `3a1209c0` changes the counter (the `--prior` fix), freeze.txt, and claims.json, and the
scored receipt was re-run with nonce `tabi-r79-l1-3a1209c0d624` (new D12). The assignment's D
`80830674` and nonce `tabi-r79-l1-80830674d421` are superseded. The amendment fixes a genuine defect
(the `--prior` exemption), but it is an amendment of the frozen counter and pins after the freeze;
the claims at the new D still carry the stale 87 count and the note still lacks S219. The old scored
receipt was overwritten in the walked tree (uncommitted at review time); the committed selftest
output was produced on the old receipt.

## Residual risk / verification gaps

- The cold runs live in `.ufo/waves/round-79-seats/`, outside the counter's walked trees;
  `cold-runs.txt` is absent and only 2 honest cold runs exist at review time. Cold3/cold4 attempt1
  failed at the driver (`no-response-30000ms Runtime.evaluate` on `sp-cdp-gesture`); retries were in
  flight.
- The counter is receipt-reading; the surviving forgeries corrupt fields the receipt itself carries
  as wire evidence, so they are not covered by the stated replay limit. The limit sentence covers
  only the replay escape and the backendNodeId relabel.
- The selftest's `counter-clean` gate reads the receipt's own nonce/fixture (self-supplied), so a
  receipt swap to another honest run would pass; `pins-match-freeze` covers the instruments only.
- C2 counters pass (drift 20 claims/0 mismatches; capability status 12 rows/11 claimed/1
  provisional/0 mismatches), but their scope is the r78 records; the r79 claims' own count drift
  (87/88/90, 66/64) is not covered.
- The `tree-exempt-unmatched-refused` selftest gate passes if the expected finding is present, even
  when the receipt under test also fails `nonce-expected`/`fixture-hash` (observed when the receipt
  was swapped mid-review); it does not assert the finding is the only one.
