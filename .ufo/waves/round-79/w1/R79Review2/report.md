# R79Review2 — attack on the r79 battery and kill power (C1)

Seat R79Review2, read-only. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Frozen claims `.ufo/waves/round-79/claims.json`; digests commit D = `80830674d421e97bb1c01c836bfbb3dc49687dbc`.
The instruments at D match `freeze.txt`: counter `4072031b…`, battery `8c64f8e0…`, kill-power `48371285…`, driver `e9c87159…`.
Receipt measured: the 80830674 receipt, sha256 `6d243c775fe1f95ca75ee6001e584873e3dac3c9f897924a2da674b83a821535`,
nonce `tabi-r79-l1-80830674d421`, fixture `2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8`.
It was the working-tree receipt when the runs started.

## State change during the review (F12)

- `git rev-parse HEAD` at start: `be533cb28b5286ed3023a2faceae34edafca0c4c`; now: `3a1209c0d624da517c7a0b45249551faa2fae711`
  ("digests commit D (final, wave finding F1)").
- `git status --porcelain` now: `M corpus/evidence/round79/chromium-showpicker/receipt.json`,
  `M .ufo/waves/round-79/scored/c1-counter-a.json`, `M .ufo/waves/round-79/scored/c1-negatives-a.json`,
  `M .ufo/waves/round-79/scored/digests-commit.txt`.
- The current receipt is nonce `tabi-r79-l1-3a1209c0d624`, fixture `32751f032267c30c065e358c69addfeb85ac3a9af3fcdf29cf28a0f627cb5c8e`,
  sha256 `bda38512ece0d95a61fa54c2036ca1be3389aedb5e774c96852a9eff80dc30b7`.
- The counter on the current receipt with the frozen expected nonce/fixture returns findings
  `["nonce-expected","fixture-hash"]` (measured). A verifier must use the 80830674 receipt bytes or the new D's
  receipt with its own nonce/fixture.
- The new D changes the counter (`priorReal` includes the `--prior` receipts); the battery/kill-power digests are
  unchanged. F10 measures the new line's coverage.

## F1 (High) — predicate (c)'s "87 cases" is not the pinned battery's count

Command:

```
node scripts/negatives-showpicker-r79.mjs --lane <lane> --real <80830674 receipt> \
  --expect-driver-sha256 e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933 \
  --expect-nonce tabi-r79-l1-80830674d421 \
  --expect-fixture-sha256 2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8 \
  --prior-set .ufo/waves/round-79/controls/c1/prior-set.txt --work <scratch> --json
```

Output: `{"cases":90,"passed":90,"failed":0,"coverage":{"declared":56,"covered":56,"uncovered":[],"unknown":[]}}`.

`claims.json` `frozenAt` says "battery 87/87 allOk with coverageGap [], kill power 0 survivors
(controls/c1/prefreeze-summary.json)"; C1 leg (c) says "87 cases". The cited
`.ufo/waves/round-79/controls/c1/prefreeze-summary.json` does not exist (`ls .ufo/waves/round-79/controls/c1/`
returns only `prior-set.txt` and `probes/`). The committed scored evidence
`.ufo/waves/round-79/scored/c1-negatives-a.json` says `cases: 90, passed: 90`.

Consequence: leg (c) as written cannot be satisfied by the pinned instrument's own summary, and the claim's cited
control is missing.

## F2 (High) — the "gap rule's INDEPENDENT kill" entry is false

Command: the counter on `battery/cases/replay-gap-only-refuse.json` and
`battery/cases/replay-copy-all-shifted.json` with the prior set.

Output:

- gap-only: `{"priorEvents":37,"priorGaps":1,"absMatched":0,"gapMatched":1,"absNeed":19,"gapNeed":1,"refused":true}`
- all-shifted: `{"absMatched":0,"gapMatched":0,"refused":false}`

The gap side is bracketed independently: a uniform +1 ms shift preserves the gap duration (abs 0, gap 1 → refuse),
and the gap-upper +2 shift breaks it (abs 0, gap 0 → accept). The entry's "an event shift moves both sides at once"
is false for a uniform shift.

## F3 (High) — `MIN_OWN_EVENTS` is not a counter threshold

Command: `grep -rn "MIN_OWN_EVENTS" scripts/ .ufo/waves/round-79/`

Output: only `scripts/negatives-showpicker-r79.mjs:409` (the `unbracketed` string) and
`.ufo/waves/round-79/scored/c1-negatives-a.json:33` (the same string). No counter or driver constant. The entry
names a threshold the pinned counter does not have.

## F4 (High) — GAP_MIN 50 is bracketed by a crafted prior; GAP_MIN=51 survives the full battery

Command: `node gapbracket3.mjs` (crafted prior P with a single 50.0 ms gap, passed via `--prior`; suffix-shifted
timeline).

Output: `P gaps [50]`, `R50 gaps [50]`, `R499 gaps []`;
R50 `{"absMatched":0,"gapMatched":1,"absNeed":19,"gapNeed":1,"refused":true}` exit 1;
R499 `{"absMatched":0,"gapMatched":0,"refused":false}` exit 0;
R50 under a GAP_MIN=51 counter `{"priorGaps":0,"gapMatched":0,"gapNeed":0,"refused":false}` exit 0.

Command: `node mut.mjs` → GAP_MIN-51 status 0, 90/90.

The priors' gaps are 134.0/148.1/147.1/145.5 ms and the honest receipt's are 92.2/56.0 ms; the entry's "no fixture
leg produces a >= 50 ms inter-event gap" is false. The committed cases do not bracket the threshold; a bracket is
constructible.

## F5 (Medium) — the sweep crosses on the gap side, not the abs threshold; its consistency check is tautological

Command: `node sweep.mjs` (reproduces the battery's sweep construction and prints every prior's counts).

Output: k=17 `{"abs0":19,"gap0":1,"refused":true}`; k=18 `{"abs0":18,"gap0":1,"refused":true}`;
k=21 `{"abs0":15,"gap0":1,"refused":true}`; k=22 `{"abs0":15,"gap0":0,"refused":false}`.
The abs threshold is crossed at k=18; the verdict crosses at k=22 on the gap side (the gap upper gets the extra +1
at k=22). k=0 is `{"abs0":36,"gap0":0}`, not the unshifted copy `{"abs0":37,"gap0":1}`, because the gap upper is
shifted at every k.

The sweep's `wantRefused` is computed from `s0.absMatched >= s0.absNeed || s0.gapMatched >= s0.gapNeed` (the
counter's own printed counts), so "consistent" and `firstAccepted === firstBelow` are tautological with respect to
the threshold arithmetic; the sweep cannot kill a FRAC/GAP_FRAC constant change. The independent abs brackets are
`replay-at-threshold-refuse` `{"absMatched":19,"gapMatched":0,"refused":true}` and
`replay-below-threshold-accept` `{"absMatched":18,"gapMatched":0,"refused":false}`.

The sweep uses `perPrior[0]` only; the counter refuses on any prior. With the committed priors the other
`absMatched` values are 2/0/0, never 19, so the omission is not exercised.

## F6 (Medium) — GAP_FRAC and TOL are not bracketed and not named

Command: `node mut.mjs`

Output: GAP_FRAC-0.9 status 0 (90/90); TOL-0.001 status 0 (90/90); TOL-0.5 status 1 (85 failed);
FRAC-0.9 status 1 (1 failed); FRAC-0.4 status 1 (1 failed); GAP_MIN-149 status 1 (2 failed).

The prior set has one gap, so `gapNeed = ceil(0.75*1) = 1 = ceil(0.9*1)`; GAP_FRAC is a no-op for this prior set.
TOL's tight side is not exercised (all matches are exact or 1 ms off). Neither threshold appears in `unbracketed`.

## F7 (Medium) — kill power holds but cannot name the killing case; no semantic no-op in the 64

Command:

```
node scripts/kill-power-r79.mjs --lane <lane> --real <80830674 receipt> \
  --expect-driver-sha256 e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933 \
  --expect-nonce tabi-r79-l1-80830674d421 \
  --expect-fixture-sha256 2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8 \
  --prior-set .ufo/waves/round-79/controls/c1/prior-set.txt --work <scratch> --json
```

Output: `{"mutants":64,"killed":64,"survived":0,"crashed":0,"survivorsList":[],"unapplied":[]}`;
failed histogram `{1:58, 2:4, 7:1, 87:1}`; every result `first: null`.

Cause: the battery's `--json` summary exposes `results`, not `failures`; the harness reads `j.failures` (the
`failures` key exists only in the non-JSON output). The harness also counts `r.status === 1` as killed without
requiring `j.failed > 0`; a mutant that only breaks the honest baseline would be counted killed with `failed: 0`.
In this run all 64 have `failed > 0`, so the kills are case-based.

Semantic no-ops: none in the 64. Every `from` string occurs exactly once (`unapplied: []`), and every `to` changes a
live comparison; the battery kills each. The unlisted threshold mutants in F4/F6 survive, so the 0-survivor claim is
scoped to the listed mutants.

## F8 (Low) — over-broad `alsoAllowed` lists

Command: instrumented battery dump + `attrib.json` comparison.

Output: 16 refusal cases name 44 allowlist entries that never fire in the reference run; examples:
`replay-copy-unshifted` 12 unused, `replay-gap-only-refuse` 10 unused, `replay-at-threshold-refuse` 6 unused,
`ports-declared` 2, `intercept-refused-opened` 2. No case passes on collateral alone: every expected id is present
and its finding detail names the mutated field (the 84 non-mirror cases were re-run and inspected). The over-broad
lists would mask a future regression where those checks fire on the same mutation.

## F9 (Low) — chooserWaitMs 3001 is bracketed by one line

Command: the counter on the 80830674 receipt with `sp-click-then-show.chooserWaitMs = 3000 / 3001`.

Output: 3000 clean; 3001 findings `["leg-records"]` (detail `"leg records: "`). The `unbracketed` entry and
`brackets.chooserWaitMs.refuseAt` call it unbracketed/not exercised; it is constructible.

## F10 (High, new D) — the F1 counter change is not covered by the battery

The new D (`3a1209c0`) changes the counter's `priorReal` to include the `--prior` receipts. The battery and
kill-power are unchanged (digests `8c64f8e0`/`48371285`).

Command: the battery against the new counter with the new receipt (nonce `tabi-r79-l1-3a1209c0d624`,
fixture `32751f03…`) → 90/90, exit 0.

Command: the reverse mutant (`priorReal` without `extraPriors`) against the same battery → 90/90, exit 0
(survivor).

No battery case passes a `--prior` receipt that sits in a walked tree; the `prior-set-complete` case uses an
unlisted receipt, which the new counter still refuses. The new line has no kill-power mutant. The cold-run command
(leg b) may cover it via the selftest, but the predicate (c)'s battery/kill power do not.

## F11 (Medium) — claim evidence files cited but absent

- `claims.json` `frozenAt` cites `controls/c1/prefreeze-summary.json`: absent (`ls .ufo/waves/round-79/controls/c1/`
  → `prior-set.txt`, `probes/`).
- C1 leg (b) cites `scored/cold-runs.txt`: absent (`find .ufo/waves/round-79 .ufo/waves/round-79-seats -name
  cold-runs.txt` → nothing).
- `run-scored-r79.sh` writes `scored/c1-killpower-a.json` and `scored/c2-after.json`; the scored dir contains only
  `c1-counter-a.json`, `c1-negatives-a.json`, `digests-commit.txt`, `selftest-r79-gates.out`.

## Residual risk / verification gaps

- The mirror-lane cases (`prior-set-complete`, `prior-set-unparsable`, `prior-set-unmatched-exempt`,
  `foreign-schema-in-walk-ignored`, `honest-tree-exempt-sha256`) were run by the battery and passed; I did not
  independently re-run them because the mirror lane is rebuilt per case and the final state is not reproducible.
  Their ids are in the battery's results.
- The kill-power's 64/64 is against the 80830674 receipt; the new D's counter should be re-run (the new D's battery
  is 90/90; the reverse mutant survives).
- The sweep's `perPrior[0]` model vs the any-prior OR; the committed priors' other `absMatched` values are 2/0/0.
- The over-broad allowlists (F8).

## Evidence

The JSON evidence is in `.ufo/waves/round-79-seats/R79Review2/`: `battery-r79.json`, `killpower-r79.json`,
`attrib-r79.json`, `sweep-r79.json`, `unlisted-mutants-r79.json`, `counter-honest-r79.json`, `cases-dump-r79.json`,
`newd-battery-r79.json`, `newd-reverse-mutant-r79.json`, `gap-bracket-prior.json`, `gap-bracket-r50.json`,
`gap-bracket-r499.json`, `chooser-wait-3000.json`, `chooser-wait-3001.json`, and the scripts.
Scratch `/fast/scratch/hyaku/tabi-r79/R79Review2` deleted after copying.
