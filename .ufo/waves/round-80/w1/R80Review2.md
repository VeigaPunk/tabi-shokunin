# R80Review2 — C1 battery and kill power: attack report

Seat: R80Review2 (read-only). Lane: `tabi-shokunin`. Base `e2e12ca5`. Scratch
`/fast/scratch/hyaku/tabi-r80/R80Review2` (deleted at yield). Artifacts (JSON) under
`.ufo/waves/round-80-seats/R80Review2/`. The walked trees were never written; every run used a
scratch mirror lane named `tabi-shokunin` so the counter's `lane` binding still matches.

Legend: `$B=/fast/scratch/hyaku/tabi-r80/R80Review2`, `$L=/home/vgpnk/Projects/shokunin/tabi-shokunin`,
`$M2=$B/lane2/tabi-shokunin` (D4 receipt mirror), `$M4=$B/lane4/tabi-shokunin` (D8 receipt mirror),
`$P=$L/.ufo/waves/round-80/controls/c1/prior-set.txt`.

## Pinned state — the lane moved three times during the review

| instrument | D3/D4 (frozen) | D5 | D6 | D8 (HEAD `a1b14284`) |
|---|---|---|---|---|
| `check-showpicker-r80.mjs` | `f22db0ac` | `f22db0ac` | `387ec615` | `90118040` |
| `negatives-showpicker-r80.mjs` | `fe91f6be` (103 cases) | `87bb405d` (103) | `7371dffa` (102) | `7371dffa` (102) |
| `kill-power-r80.mjs` | `45d71e59` (81 mutants) | `45d71e59` (81) | `9aef5c16` (80) | `9aef5c16` (80) |

Receipts snapshotted (in the seat dir): D4 `tabi-r80-l1-b25608296008` fixture `43490c81` (23 paired
events, 2 gaps); D5 `tabi-r80-l1-53ecca8411dc` fixture `ed350e1e` (23, 4 gaps); D6
`tabi-r80-l1-045fccc58817` fixture `2be976df` (23, 3 gaps); D8 `tabi-r80-l1-a1b142849e91` fixture
`171c94c2` (23, 1 gap).

Final state measured on D8: counter exit 0 clean 57 checks (mirror lane **and** real lane), battery
102 cases 0 failed, kill power 80 mutants 80 killed 0 survivors 0 crashed 0 unapplied, bracket
exact. The findings below are the history that produced that state plus what the final state still
does not hold.

## F1 (high) — the frozen bracket did not bracket; the at-threshold case passed for the wrong reason

The battery digest in the original `freeze.txt` (`fe91f6be`) on the clean D4 receipt:

```
node $B/tools-frozen/negatives-showpicker-r80.mjs --lane $M2 \
  --real $M2/corpus/evidence/round80/chromium-showpicker/receipt.json \
  --expect-driver-sha256 cb93935c... --expect-nonce tabi-r80-l1-b25608296008 \
  --expect-fixture-sha256 43490c81... --prior-set $M2/.ufo/waves/round-80/controls/c1/prior-set.txt \
  --work $B/w-frozen2 --json
→ exit 1
{"cases":103,"failed":1,"clean":"clean","coverage":{"declared":57,"covered":57,"uncovered":[],"unknown":[]}}
FAIL replay-below-threshold-accept expect null status 1 ids ["replay-event-timeline"]
```

Bracket numbers, read from the counter's `limit.perPrior` (last prior = the bracket prior):

```
at-threshold (bracketPrior(ctx,10)): {"priorEvents":23,"priorGaps":2,"absMatched":12,"gapMatched":2,"absNeed":12,"gapNeed":2,"refused":true}
below        (bracketPrior(ctx,11)): {"priorEvents":23,"priorGaps":2,"absMatched":11,"gapMatched":2,"absNeed":12,"gapNeed":2,"refused":true}
```

The accept case crosses the abs threshold correctly (11 < 12) and is still refused: `gapMatched 2 >=
gapNeed 2`. That same gap refusal is present in the at-threshold case, so its green does **not**
depend on `absMatched >= absNeed` — the case would be green at `absMatched 11` too, as the accept
case proves. The case comment ("the gap side is broken … so only the pair threshold decides") is
false: the old `bracketPrior` moved only the **first** gap's upper event by +3 ms; the second gap
still matched. This is a case that passes for the wrong reason, and the bracket did not bracket.

The D5/D6/D8 repair (`bracketPrior` breaks every gap and targets an exact matched count) is exact on
every receipt measured:

```
D8: at-threshold {"priorEvents":23,"priorGaps":1,"absMatched":12,"gapMatched":0,"absNeed":12,"gapNeed":1,"refused":true}
D8: below        {"priorEvents":23,"priorGaps":1,"absMatched":11,"gapMatched":0,"absNeed":12,"gapNeed":1,"refused":false}
D5 (4 gaps):     at-threshold absMatched 12 / absNeed 12 / gapMatched 1 / gapNeed 3 → refused; below 11/12 → clean
D6 (3 gaps):     at-threshold 12/12 / gapMatched 1 / gapNeed 3 → refused; below 11/12 → clean
```

## F2 (high) — the counter refused the honest D5 scored receipt on the gap side

```
node $B/tools-live/check-showpicker-r80.mjs --lane $M1 \
  --receipt $M1/corpus/evidence/round80/chromium-showpicker/receipt.json \
  --expect-driver-sha256 cb93935c... --expect-nonce tabi-r80-l1-53ecca8411dc \
  --expect-fixture-sha256 ed350e1e... --prior-set $P --json
→ exit 1
{"verdict":"findings","checkCount":57,"findings":[{"id":"replay-event-timeline",
 "detail":"pair/gap near-match within 0.05 ms of prior #1 {\"priorEvents\":23,\"priorGaps\":1,
 \"absMatched\":0,\"gapMatched\":1,\"absNeed\":12,\"gapNeed\":1,\"refused\":true} …"}]}
```

`absMatched 0`: the run shares **no** event pair with the prior. It is refused because one gap
duration matches: the D5 receipt's gap `153.19999998807907` equals probe2's gap exactly. The L1's
own scored outputs at 19:28 record the same failure: `scored/counter-a.json` verdict `findings`;
`scored/battery-a.json` 100/103 failed (every case carries the extra `replay-event-timeline`);
`scored/killpower-a.json` 80 killed, **1 survived** (`replay-gap-threshold-loose`).

Root cause: each of the three priors has exactly **one** gap, so `gapNeed = ceil(0.75·1) = 1`: any
single matching gap refuses. The driver's fixed waits reproduce ~150 ms gaps across honest runs
(probes: 150.0000000596, 153.19999998807907, 152.4000000357628), so honest refusals are structural,
not rare. This is the predicate-(a) failure the L1 hit, not a forgery.

## F3 (high) — the D6 repair removes the gap rule and both of its tests; the admitted escape is measured

D6 counter (`387ec615`) changed `refused` to `np > 0 && absMatched >= absNeed` and rewrote the limit
sentence to admit: *"A forger who moves fewer events but shifts EVERY event by a constant offset
escapes this rule — that is the limit."* D6 also deleted the battery case `replay-gap-only-refuse`
(103→102) and the kill-power mutant `replay-gap-threshold-loose` (81→80).

Measured escape — prior = the receipt with **every** event shifted +1 ms and fresh launch tokens and
devtools browser ids (so the token/url checks do not fire):

```
D5 counter f22db0ac: verdict findings, [replay-event-timeline],
  {"priorEvents":23,"priorGaps":2,"absMatched":0,"gapMatched":2,"absNeed":12,"gapNeed":2,"refused":true}
D6 counter 387ec615: verdict clean, checkCount 57, findings []
  {"priorEvents":23,"priorGaps":2,"absMatched":0,"gapMatched":2,"absNeed":12,"gapNeed":2,"refused":false}
D8 counter 90118040: verdict clean, checkCount 57, findings []
  {"priorEvents":23,"priorGaps":1,"absMatched":0,"gapMatched":1,"absNeed":12,"gapNeed":1,"refused":false}
```

A constant-offset replay of a prior's timeline is now inside the accepted set of the final
instrument, and neither the battery nor kill power exercises it. The limit sentence is honest; the
instrument is weaker. The repair removed the evidence of the gap-side false positive instead of
separating "gap match on an honest run" from "gap match on a shifted replay".

## F4 (medium) — predicate (c) counts and pins were amended mid-wave

- The predicate text given to this seat: **103 cases**, **81 mutants**.
- `claims.json` at D8: **102 cases**, **80 mutants** (`frozenAt` text rewritten to match).
- Measured: battery `cases 102`, kill-power `mutants 80`.
- Pins changed three times: battery `fe91f6be → 87bb405d → 7371dffa`; kill-power `45d71e59 →
  9aef5c16`; counter `f22db0ac → 387ec615 → 90118040`.
- Receipt nonce at D8 is `tabi-r80-l1-a1b142849e91`; this seat's predicate names
  `tabi-r80-l1-f9ece6562c94` (D3). The claims phrase `<first 12 of D>` holds only if D = D8.

A reviewer applying the assignment's predicate literally fails (c) on the counts alone; a reviewer
applying `claims.json` at D8 passes. Both readings must be stated in the round record.

## F5 (medium) — the deleted gap mutant was receipt-dependent, not a no-op

`replay-gap-threshold-loose` (`gapMatched >= gapNeed` → `>= gapNeed + 1`):

- 2-gap receipt: killed. Gap-only case `gapMatched 2, gapNeed 2`; the mutant needs 3 → no refusal →
  the case fails → battery exit 1.
- 4-gap receipt: survived. Gap-only case `gapMatched 4, gapNeed 3`; the mutant needs 4 → `4 >= 4`
  still refuses → the case passes and the honest receipt now passes → battery exit 0. Reproduced:

```
node $B/tools-live/kill-power-r80.mjs … --only replay-gap-threshold-loose --json
→ {"mutants":1,"killed":0,"survived":1,"crashed":0,"survivorsList":["replay-gap-threshold-loose"]}
```

The mutant is observable (not a semantic no-op); the battery's gap-only case simply cannot kill it
when `gapMatched == gapNeed + 1`. A case that isolates `gapMatched == gapNeed` would kill it on any
receipt. Deleting the mutant hides the hole.

## F6 (low) — 29 `alsoAllowed` entries never fire

Measured on the D8 battery with the whitelists recorded per case: **no unlisted collateral id in any
case**, and the expected id present in all 102 refusal cases. But 29 whitelisted ids never appear:

- `ports-declared`: `fixture-hash, host-argv, devtools-port-binding, send-log-allowlist` (4)
- `leg-order`: `plan-calls, leg-marks, context-binding` (3)
- `ports-collide`: `host-argv, devtools-port-binding, send-log-allowlist` (3)
- `leg-order`/`ports-declared` aside: `plan-frozen`(plan-calls), `context-binding`(send-log-allowlist),
  `event-leg-window`(leg-sp80-accept-png), `leg-sp80-trigger-then-answer`(no-selection-law, answer-law),
  `twice-gesture-law`(gesture-law), `devtools-port-binding`(host-argv), `teardown-closure`(host-argv),
  `replay-launch-token`(host-argv), `twice-one-chooser`(cdp-event-log-closed),
  `cross-events-trusted`(leg-sp80-cross-origin), `cod-no-chooser`(cross-origin-disabled-law),
  `answer-node`(plan-calls), `trust-pointer-in-showpicker`(leg-sp80-accept-png),
  `context-duplicate`(send-log-allowlist, cdp-event-log-closed), `cdp-open-id-zero`(answer-law),
  `event-before-pre`(leg-sp80-accept-png), `teardown-child-port`(host-argv).

An over-broad whitelist cannot turn a failing case green (the pass predicate requires the expected
id), but it would silently absorb an unrelated finding if one appeared. The lists should be the
measured collateral, not a superset.

## F7 (low) — four diagnostics do not name the failing conjunct; one is misleading

- `fixture-hash`: the detail prints `{sha256, viewport}` — for the `fixture-child-keys` case it prints
  values **equal to the expected ones** while the check failed on the extra `fixture.child` key. The
  message reads as a pass.
- `answer-law`: `answer-bytes`, `answer-node`, `answer-state` share one detail; `upload.sha256` and
  `stateAfter` are not printed, so three different conjuncts are indistinguishable.
- `cross-origin-law`: the activation conjunct is not printed (`cross-child-act`'s detail is identical
  to `cross-access-only`'s).
- `trust-law`: one sentence for two conjuncts (untrusted event vs pointer event in a show-picker leg).

Kill power proves each conjunct is load-bearing (separate mutants, all killed); only the diagnostics
are weak.

## F8 (low, latent) — `bracketNeed` counts events the counter does not pair

`bracketNeed(r)` sums `arr(l.pageEvents).length`; the counter's `np` counts events with numeric `ts`
**and** `at`. All four measured receipts have 23/23, so the bracket is exact today; a receipt with an
event lacking `ts`/`at` would make the at-threshold prior land below `absNeed` and the refuse case
would fail.

## F9 (medium, fixed at D8) — a seat's prose report poisoned the walk

D6 counter on the **real** lane:

```
node $B/tools-wt/check-showpicker-r80.mjs --lane $L --receipt $L/corpus/evidence/round80/.../receipt.json … --json
→ exit 1, findings: [nonce-expected, fixture-hash, prior-set-unparsable]
  detail: files … that carry the schema and do not parse (refused, not skipped):
  .ufo/waves/round-80/w1/R80Exec3/report.md, .ufo/waves/round-80/w1/R80Exec3.md
```

Those two report files quote the receipt's `schema` value. The battery's prior-set cases run on a
mirror lane that copies only `controls/c1`, so they cannot catch this; only the `honest` case (real
lane) can. D8's counter (`90118040`) restricts the unparsable rule to `.json` files or files whose
first non-space byte is `{`; re-measured on the real lane: `verdict clean, checkCount 57`. Note for
every seat: a prose report in `w1/` that quotes the schema value is a receipt-shaped file to the
pre-D8 counter.

## Direct answers to the four questions

1. **Does every refusal case fail for the id it names, or can a case pass because a collateral check
   fired?** Every refusal case fails for the id it names: 0 cases with the expected id absent across
   the 102 D8 cases, and each detail names the mutated field. No case passes on collateral alone —
   the battery's pass predicate requires the expected id. The defect is the opposite direction (F1):
   the frozen at-threshold case was green for a reason unrelated to the threshold it names. F7 lists
   four checks whose detail cannot tell a reader which conjunct failed.
2. **Does the replay bracket cross at the arithmetic threshold?** On the final instrument, yes:
   `absMatched 12 / absNeed 12` refuses, `absMatched 11 / absNeed 12` accepts, with the gap side
   reported (`gapMatched 0–1` vs `gapNeed 1–3`). On the originally frozen instrument, no: the accept
   case is refused by the gap side and the at-threshold case's green is gap-driven (F1).
3. **Are any kill-power mutants semantic no-ops?** None. All 80 (and all 81 before D6) are
   weakenings/inversions of live checks; `unapplied []` proves each `from` occurred exactly once, and
   every mutant is killed by a case whose name matches the mutated rule (D8 attribution: 80/80, e.g.
   `fixture-child-dropped <- fixture-child-keys`, `ports-distinct-dropped <- ports-collide`,
   `replay-token-any <- replay-launch-token`, `prior-set-schema-any <- foreign-schema-in-walk-ignored`).
   The one receipt-dependent survivor (F5) was observable, not a no-op, and was deleted rather than
   fixed.
4. **Are the `alsoAllowed` lists hiding a real finding?** Not in the measured run: no unlisted
   collateral id appeared, and every listed collateral id is coherent with its mutation (e.g.
   `ports-declared` also fires `context-binding` and `cdp-event-log-closed` because the cross-origin
   context origin and the chooser frame binding are built from `ports.child`). 29 entries are dead
   (F6) — a latent masking risk, not a present one.

## Residual risk

- The D8 replay rule accepts constant-offset replays of a prior's timeline (F3, measured). The limit
  sentence states it; the battery does not test it and kill power does not cover it.
- The gap side of the replay rule is now reported but never refuses, and both of its tests were
  deleted. A future regression there is invisible to the battery and to kill power.
- Predicate (c)'s counts are 102/80 in the lane's `claims.json` and 103/81 in this seat's predicate
  text (F4). The round record must say which reading is authoritative.
- The receipt is a live target: it was rewritten four times during this review (D4→D5→D6→D8 nonces).
  Any verdict must cite the receipt nonce, fixture sha256 and instrument digests together.

## Verification gaps

- I did not run predicate (b) (cold-run acceptance) or the C2 drift counter — outside this seat.
- No browser was run: every measurement is on committed/snapshotted receipts and the committed
  instruments.
- The D8 receipt was captured at 22:36:18Z; if the L1 re-runs, the nonce/fixture change and the (a)
  measurement must be repeated.
- Kill power was run on a scratch mirror lane; the real lane was only read (F9).

## Artifacts (`.ufo/waves/round-80-seats/R80Review2/`)

`counter-d8-clean.json`, `counter-d8-real.json`, `battery-d8.json`, `killpower-d8.json`,
`counter-d6-clean.json`, `battery-d6.json`, `killpower-d6.json`, `battery-d6-details.json`,
`counter-snapshot-clean.json`, `battery-d5.json`, `killpower-live.json`, `battery-frozen2.json`,
`battery-live2.json`, `battery-details2.json`, `counter-predicate-nonce.json`,
`counter-real-lane.json`, `receipt-{snapshot,d6-snapshot,d8-snapshot}.json`,
`prior-bracket-{11,12}.json`, `prior-d8-offset1.json`, `prior-forge-offset.json`.
