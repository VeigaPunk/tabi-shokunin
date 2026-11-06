# R71Scribe report — round 71 w1, seat R71Scribe (leaf)

DRAFTED-WITH-FINDINGS

Seat: R71Scribe, scribe (leaf; no subagents, no delegation). Task: draft the `## Round 71 gate
registry` section for `SKILL.md` and the `chromium-synth-pinch-gesture-linux` row for
`SCORECARD.md`, from the instrument headers and the scored evidence only. No product code, no
judge, no commits, no scored runs.

## 1. Behavior

Read, in this order: `SKILL.md` `## Round 70 gate registry` (column schema and cell style),
the four round-71 instrument headers (`scripts/check-synthpinch-r71.mjs`,
`scripts/negatives-synthpinch-r71.mjs`, `scripts/verify-live-r71.mjs`,
`.ufo/waves/round-71/controls/c2/attack-harness.mjs`, `.ufo/waves/round-71/controls/c2/evaluate-c2.mjs`,
plus `.ufo/waves/round-71/controls/c1/kill-power.mjs` and `evaluate-c1-controls.mjs` for the
non-gate instruments paragraph), `.ufo/waves/round-71/freeze.txt`, `.ufo/waves/round-71/claims.json`,
the committed pinch receipt, and every file under `.ufo/waves/round-71/scored/`.

Drafted (both files are proposals for the integration owner; `SKILL.md` and `SCORECARD.md` were
not edited):

- `.ufo/waves/round-71/w1/R71Scribe/registry-rows.md` — four rows in the exact 8-column round-70
  schema (Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope |
  Owner), plus a "instruments without a gate verdict (round 71)" paragraph matching the round-70
  form.
- `.ufo/waves/round-71/w1/R71Scribe/scorecard-row.md` — one capability row in the round-70
  four-column format (Capability | What it can now do | Evidence pointer | First-working round).

## 2. Gate registry — provenance per field

Every cell is traceable to a header line or a scored file. Header facts used:

- `check-synthpinch-r71.mjs`: usage `--receipt` / optional `--expect-driver-sha256` / `--json`
  (:3-4); exit 0 clean, 1 findings, 2 usage/unreadable (:5); `--list-checks` prints ids and exits
  0 (:58); declares its limit "reads a receipt; it is not an execution oracle" (:10); 87 declared
  ids (:50-57, with the per-leg expansion on :56).
- `negatives-synthpinch-r71.mjs`: isolation rule — a case passes only when the counter exits 1,
  lists the expected id and no undeclared co-firing id (:8-13); positive must exit 0 and coverage
  is enforced (:14-16); laundered degenerate receipts are whole-run forgeries (:17-18); exit
  0/1/2 (:19); absolute `--work` enforced (:31-34); writes only `neg-<case>.json` (:134) and
  `laundered-<kind>.json` (:151) under that work dir.
- `verify-live-r71.mjs`: the four declared bindings (E) environment refusal and allow-listed child
  env, (S) private 0700/0500 snapshot executed and re-hashed, (W) 6 s wall floor, (O) stdout
  binding (:8-20), round-70 contract carried unchanged (:21-23), declared limit (:24-27); exit
  0/1/2/4 (:32-33); write scope "`--scratch` only, never the lane tree" (:34); profile pins and
  wall floors (:51-92).
- `attack-harness.mjs`: six attacks, frozen classification and the R70Critic provenance (:2-27);
  fresh lane copies under `--work` (:95-101); the six attack rows (:115-122); writes
  `<attack>.verifier.json` (:170) and `summary.json` (:175) under `--out`; usage exit 2 (:34-36);
  no other exit is declared (the script returns after writing the summary, so classification is
  data).
- `evaluate-c2.mjs`: predicate C2-EXEC-BOUND and its four conditions (:2-11); frozen allowed
  class/finding sets (:20-27); exit 0/1/2 (:13 declares, :19 and :46 implement).
- `kill-power.mjs` (non-gate control): one forced-true mutant per check id, killed = battery
  exit 1, holds when all mutants are killed and the unmutated copy exits 0 (:2-8).

Pinned values re-derived in this seat (read-only `sha256sum`), all matching `freeze.txt` and
`claims.json` verbatim:

| Instrument | sha256 | matches freeze |
|---|---|---|
| `scripts/chrome-cdp-synthpinch-round71.mjs` | 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af | yes |
| `scripts/check-synthpinch-r71.mjs` | 310fac05b3cb50ee97eff92197467d0f650fb9c17f898c3267c8054b7eef176c | yes (87 checks) |
| `scripts/negatives-synthpinch-r71.mjs` | 830bbb0d33f8286dca94e0dc8003e5a8184a3ca59cf949200be0d0579fe3d14a | yes |
| `scripts/verify-live-r71.mjs` | 61f43596e28fdec78b275de495f252f7881ce9882b9079d7191d84413c73f333 | yes |
| `.ufo/waves/round-71/controls/c2/attack-harness.mjs` | 33e1bd1b98cfcb2748bf0e521a26f9df4d29c63173f348aa8ebe08392d224512 | yes |
| `.ufo/waves/round-71/controls/c2/evaluate-c2.mjs` | 3c3a83dcb37e2fbe048e9206b92567ae7d1e54c73095c1a8fcd82afd1c778716 | yes |
| `.ufo/waves/round-71/controls/c1/kill-power.mjs` | b86fc3d79f9f974e065238cd56d2ae6427aa4359f864b0f1ecd233e22a557b1e | yes |
| `.ufo/waves/round-71/controls/c1/evaluate-c1-controls.mjs` | e34cbf2bd33ec3a275c5360d6cd3ee03d53db40434c4d136ecc243b5e4a749ef | yes |

The committed pinch receipt hashes to
19e3c5b6377eaba100b856a9b6f491da8aa354f6a24adec340ba662f32171ab6 (not itself a freeze pin; its
`driverSha256` field is the pin).

Scored outputs cited by the draft rows (all read, none produced by this seat):

- `scored/c1-counter-a.json` — verdict `clean`, 87 checks, nonce `tabi-r71-scored-189a293f`.
- `scored/c1-negatives-a.json` — `cases 107`, `refusedForExpectedReason 107`, `isolatedCases 98`,
  `checkIds 87`, `coverageGap []`, `allOk true`.
- `scored/c1-kill-power-a.json` — `mutants 87`, `killed 87`, `survivors []`, `holds true`.
- `scored/c2-harness-L1/summary.json` — `falsePass 0`, `notLanded 0`, `positivesOk true`;
  classes P-tap/P-scroll HONEST-PASS, A-env-tap/A-env-scroll REFUSED (`env-injection`),
  B-swap-tap HONEST-PASS, C-swap-run-b-tap REFUSED (`snapshot-mutated`, `run-b-wall-floor`,
  `run-b-stdout-mismatch`).
- `scored/c2-eval-L1.json` — `holds true`, `reasons []`.
- `scored/c2-verify-live-r71-synthscroll-r69.json` / `-synthtap-r70.json` — `predicate true`,
  `findings []`, two runs each (wallMs 10359/10381 and 12386/12349), `agreement.crossRun` and
  `agreement.evidence` true, `pinSource frozen`.

## 3. Scorecard row — measured facts and their source

All numbers in `scorecard-row.md` are read from the committed receipt
(`corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json`, `legShape` / `legs` /
`events` / `cdpSendLog`): in 16 ctrl wheels / 242.5 ms / scale 1→1.999998927116394; out 16 /
242.6 / →1; clamp 16 / 242.5 / stays 1; unit 0 events; default 9 / 125.8 / 1→1.499999761581421;
touch 15 touchmoves / 231.2 ms, 8 non-move non-wheel events, scale unchanged 1.499999761581421; slow 57
touchmoves / 925.0 ms, `slowToTouchSpanRatio 4`; pen and outside `-32602` with 0 events; zero
282 wheels / 4674.1 ms / `no-response-4000ms`; 74 CDP sends, 10 of them
`Input.synthesizePinchGesture`. `First-working round` is round 71 (no prior row covers the
command; r69/r70 rows are scroll/tap only).

The row deliberately cites no wave-seat run: per the task it is built from the scored receipt and
the L1 scored outputs, and the independent seat run is red (finding S-2). The integration owner
should not enter the row until S-2 is adjudicated.

## 4. Findings

### S-1 — the round-71 gates have no `--selftest` entry (operability; blocks a faithful "Self-test" column)

`scripts/selftest-r70-gates.mjs:3,24` accepts only `synthtap|live` and hard-codes the r70
instruments/receipts; the three round-71 scripts contain no `selftest` occurrence at all
(`grep -c selftest scripts/check-synthpinch-r71.mjs scripts/negatives-synthpinch-r71.mjs
scripts/verify-live-r71.mjs` → 0/0/0). Consequence: the round-70 registry style ("Self-test:
`node scripts/selftest-rXX-gates.mjs …`") cannot be reproduced for r71; the draft rows name the
battery, the kill-power control and the attack/evaluator controls as the nearest declared
exercises and say so explicitly. Nothing in the r71 verifier's Chromium-free refusal paths
(`env-injection`, `exec-argv`, `driver-pin`, `counter-pin`, `scratch-path-too-long`, `--no-run`)
has an automated self-test in this generation (the paths are Chromium-free, so a future
`selftest-r71-gates.mjs` could exercise them the way `selftest-r70-gates.mjs:42-54` does for r70). A `selftest-r71-gates.mjs` would be a new file,
not an amendment to a frozen byte; that call is L1's (this seat may not write `scripts/`).
Reproduction: `node scripts/selftest-r70-gates.mjs --selftest --scratch /abs --gate synthpinch`
→ usage exit 2.

### S-2 — C1 leg (b) is red on the independent seat cold run (`event-leg-domain`), a frozen-instrument race

Observed (not re-run): `.ufo/waves/round-71/w1/R71Exec1/counter.json` — `verdict: "findings"`,
`checkCount: 87`, one finding `{id: "event-leg-domain", detail: "events outside the frozen legs:
1"}`; its receipt `.ufo/waves/round-71/w1/R71Exec1/receipt.json` is clean of producer-fault
(`predicate true`, `synthPinchHypothesis CONFIRMED`, `driverSha256 5318780c…22af`, same 11 legs,
in/out/clamp wheel spans 249.9/250.0/241.6 ms). The offending event is seq 575,
`{type:"wheel", leg:"end", ts:13449.4, ctrlKey:true, deltaY:0, deltaMode:0, isTrusted:true}`.
The committed L1 receipt has 0 events outside the legs (571 events; last event leg `zero` at
13368.6), so legs (a)/(c) are green.

Mechanism, from the frozen bytes: `scripts/chrome-cdp-synthpinch-round71.mjs:330` relabels the
page leg to `"end"` after the leg loop, while the `zero`-leg gesture is still running on the
browser side — the driver's own comment (:183-185, S177:162-174) says the scaleFactor-0 touchpad
gesture's end time is infinite and the command never answers, so it bounds the wait at 4000 ms
(:199-200, :322) and then settles 700 ms (:325) and reads the scale. The ghost wheel pump is still
ticking (~16.6 ms apart in the seat receipt: 13416.1, 13432.7, 13449.4) when the label changes, so
one tick can land on the far side of it; `scripts/check-synthpinch-r71.mjs:100` refuses any event
whose leg is not one of the 11 frozen names. Whether a green run happens is therefore a timing
race: the L1 scored run missed the trailing tick, the seat run did not.

Reproduction (read-only; counter on a receipt already on disk):
`node scripts/check-synthpinch-r71.mjs --receipt .ufo/waves/round-71/w1/R71Exec1/receipt.json --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af --json`
→ exit 1, finding `event-leg-domain` (1 event).

Freeze consequence, reported verbatim, not adjudicated: `claims.json` C1 kill rule "any predicate
leg (a)-(d) false at the lane tip" and "the scored run is red: no further scored runs to fish for
green". The seat run was a scored leg (b); this seat did not re-run it. Instruments are frozen and
must not be amended — L1 must decide how the claim stands. Options are outside this seat's
authority (the counter/driver bytes may not change; a new instrument generation is a round
decision).

## 5. Out of scope / not done

- No edit to `scripts/`, `corpus/`, `.ufo/waves/round-71/controls/`, `SKILL.md`, or
  `SCORECARD.md`; no git/jj mutation, commit or push; no Chromium run; no rerun of any scored
  step; no tool installs (nothing installed this seat).
- Not drafted: the knowledge note S176-S178 that C1 leg (d) also requires (outside this seat's
  deliverable), and no change to any `Report`-adjacent lane file.

## 6. Limits of this report

The registry and scorecard drafts are proposals checked against headers and scored files; they
were not rendered in `SKILL.md`/`SCORECARD.md`, and no table-column checker was run over them
(no registry checker exists for round 71; the r68 `check-instrument-registry-r68.mjs` reads
`SKILL.md` only). S-2 is a report of an existing seat output; the underlying race was not
re-executed here. The C2 pair's discrimination controls are cited from their evaluated summaries,
not re-run.
