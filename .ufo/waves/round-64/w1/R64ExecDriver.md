# R64ExecDriver: independent re-run of the frozen r64 wheel/scroll driver

Seat: R64ExecDriver (executor, wave w1, round 64, lane tabi). Assignment: reproduce the live behaviour C1 rests on, from my own scratch, without trusting the L1's runs. No lane file was written except the receipts under `.ufo/waves/round-64/w1/R64ExecDriver/` and this report. Scratch (`/fast/scratch/hyaku/tabi-r64/R64ExecDriver/`) is removed before yield.

## Pin check (before any run)

| Instrument | sha256 observed | claims.json pin | match |
|---|---|---|---|
| `scripts/chrome-cdp-loopback-round64.mjs` | `1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5` | same | yes |
| `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs` | `5cc3c8dd871d8ba38b0bd87b8142c879abf2c3a790392fb7df21c7534c5f01b7` | same | yes |
| `scripts/verify-live-r64.mjs` | `87a1a7c3ec4c39d1e26772285358761cae1a3b2ac5c02ee8db9de7973561a68a` | same | yes |
| `.ufo/waves/round-64/counters/png-r64.mjs` | `3f6a75de4d413cbcc9b8541357dc58502c830ee4b7104cb22a13cca3af5d59f0` | same | yes |

Host: Node v24.21.0; `/usr/bin/chromium` = Chromium 155.0.8059.84 Arch Linux (matches the pinned browser).

## Per-run exit codes and counter findings

Driver invocations (absolute paths, own scratch, free ports checked with `/dev/tcp` first):

```
node .../chrome-cdp-loopback-round64.mjs --scratch <S>/work-a --out <S>/a/receipt.json --nonce tabi-r64-driver-a --http-port 18765 --cdp-port 28080
node .../chrome-cdp-loopback-round64.mjs --scratch <S>/work-b --out <S>/b/receipt.json --nonce tabi-r64-driver-b --http-port 18766 --cdp-port 28081
```

A and B were launched concurrently. Repeat C (determinism probe, nonce `tabi-r64-driver-a`, ports 18767/28082) ran alone afterwards.

| Run | Driver exit | Wall clock | predicate | wheelHypothesis | failures | Counter exit | Counter findings | Counter checks |
|---|---|---|---|---|---|---|---|---|
| A (nonce -a) | 0 | 4.0 s (concurrent with B) | true | CONFIRMED | 0 | 0 | 0 | 29 |
| B (nonce -b) | 0 | 4.0 s (concurrent with A) | true | CONFIRMED | 0 | 0 | 0 | 29 |
| C (nonce -a, repeat, sequential) | 0 | 3.99 s | true | CONFIRMED | 0 | 0 | 0 | 29 |

Counter command (identical for each run, `<RUN>` = a, b, c):

```
node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs <S>/<RUN>/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot <S>/<RUN> --json
```

Counter output for each run: `predicate=true`, `findingCount=0`, `driverSha256=1ff560cc…`, `fixtureSha256=27f31a5a…` (identical across runs). Stderr of both concurrent drivers is empty.

## Cross-run diff (A vs B), field by field

Only nonce-derived fields differ. Everything else is equal.

| Field | A | B | Differs |
|---|---|---|---|
| `nonce` | tabi-r64-driver-a | tabi-r64-driver-b | yes (input) |
| `nonceOnPage` | tabi-r64-driver-a | tabi-r64-driver-b | yes (page-rendered nonce) |
| `fixture.sha256` | 27f31a5a… | d2f956bc… | yes (nonce is in fixture HTML) |
| `fixture.origin` | 127.0.0.1:18765 | 127.0.0.1:18766 | yes (port) |
| `host.argv` (profile dir) | `profile-2aeb7a4144db` | `profile-abdfde1ffd4b` | yes (launch token) |
| `serverLog[0].query/run` | `run=tabi-r64-driver-a` | `run=tabi-r64-driver-b` | yes (nonce) |
| `legs[i].shotSha256` / `shotBytes` (all 6) | differ | differ | yes (nonce grid pixels) |
| `legs[i].name` | start…released | start…released | equal |
| `legs[i].scrollY` | 0,120,240,120,120,240 | same | equal |
| `legs[i].wheellogLen` | 0,1,2,3,4,5 | same | equal |
| `legs[i].witness`, `witnessRgb` | per-leg table | same | equal |
| `wheellog` minus `ts` | 5 entries | identical | equal (0 differing fields) |
| `wheellog[i].ts` | 55.3, 253.2, 453.8, 654.0, 821.9 | differ (timing) | yes (timing, not contract) |
| `pageState` | equal | equal | equal |
| `host.cdpProduct`, `cdpProtocolVersion`, `chromium` | Chrome/155.0.8059.84, 1.3 | same | equal |
| `sweeps`, `teardown` | midRun 13, postKill 0 | same | equal |

Summary: legs, wheellog-minus-ts and pageState are equal across runs (0 differing fields). Everything that differs is derived from the nonce or the port/profile token, or is the wheel timestamp.

## Pixel evidence (my own decoder, PIL, not the counter)

For every leg of runs A and B (12 PNGs, each 1280x900):
- Shot sha256 equals the receipt's `shotSha256`: yes (12/12).
- Nonce grid (8..136 x 8..40, 32x8 cells of 4 px, cell centre at 8+4c+2, 8+4r+2): decodes exactly to the first 256 bits of SHA-256(nonce), MSB first: 12/12 match.
- Witness strip sample at (1000, 625): equals the leg's table colour (start (10,20,30) through released (160,170,180)): 12/12.
- Band formula: for sample rows vy in {60,180,300,420}, colour at (1000, vy) equals `BAND[((vy + scrollY) // 120) % 6]`: 0 failures across all 12 shots.
- Cross-run pixel diff A vs B, per leg: 1888 differing pixels, **all inside the nonce grid box**; 0 outside it. Per leg, the witness and bands are identical across A and B.

Within-run byte uniqueness: the 6 shots of a run are all distinct (6/6). Across runs with different nonces: every leg differs (expected, nonce grid).

## Determinism

Run C used nonce `tabi-r64-driver-a` again, on a different HTTP port, CDP port and profile dir, sequentially. Result:
- All six shot PNGs byte-identical to run A (sha256 and byte count): 6/6.
- `fixture.sha256` identical to A.
- Receipt minus volatile fields (ts, host, serverLog, teardown, fixture) identical to A.

So for a fixed nonce, the PNG bytes are a pure function of the nonce on this host. Nondeterminism observed: only the `ts` timing values in the wheel log. Within a single run the shots differ from each other because the witness strip and bands differ per leg.

## Teardown

Receipt fields (A, B, C identical): `sweeps = {preLaunch 0, midRun 13, postKill 0}`, `teardown = {postKillSweepCount 0, survivors [], sweepError null, portProbes {fixture closed, devtools closed}, postKillCurl {fixture 7, devtools 7}}`.

Independent check after all runs (`ps -eo pid,args`, `ss -ltnp`, `/dev/tcp` probes):
- Processes matching my launch tokens `2aeb7a4144db`, `abdfde1ffd4b`, my scratch path, or `tabi-r64-driver`: **none**.
- Listeners on 18765, 18766, 18767, 28080, 28081, 28082: **none**; all six `/dev/tcp` probes refused.
- Observation (not a defect in this driver): `ps` shows three live `node .../R64MutDriver/mutants/m0*/driver.mjs` processes (PIDs 278424–278426, ports 22104–22113). They belong to a sibling seat's mutation run and are not mine; I did not touch them.

## Findings

1. **[High, calibration/freeze] The counter's `--expect-driver-sha256` pin is never enforced.** Evidence: `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs` lines 326 (parse), 330 (hex-format only), 335 (`driverSha256 = sha(driverSource)` from `--driver`), 346 (`verify(receipt, { driverSha256, fixtureSha256, shots })`). `expectDriver` is never passed to `verify` or compared to `driverSha256`. Command: `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs <S>/a/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 0000000000000000000000000000000000000000000000000000000000000000 --shot <S>/a --json`. Observed: exit **0**, `predicate: true`, `findings: []`, with the wrong pin (copy at `.ufo/waves/round-64/w1/R64ExecDriver/counter-a-wrongpin.json`). The counter's own `driver-binding` check only confirms the receipt's `driverSha256` equals the sha of whatever file is passed as `--driver`. Impact: the pin flag gives false assurance; a substituted driver passes the counter if the receipt was generated by it.
2. **[Medium, freeze] The live verifier derives its own "expected" pin from the driver it runs.** Evidence: `scripts/verify-live-r64.mjs` line 40 (`const driverSha = sha(fs.readFileSync(driver))`), line 41 (recorded as output), line 51 (passed back to the counter as `--expect-driver-sha256 driverSha`). The claims.json pin `1ff560cc…` is not referenced anywhere in the verifier, so the verifier is self-referential: any driver file passed via `--driver` passes the pin check. Command: `grep -n "expect\|1ff560cc\|sha256" scripts/verify-live-r64.mjs`. Currently the driver bytes do match the pin (checked above), so no present claim is invalidated, but the C1 kill rule "Any frozen pin changes after freeze" is not machine-enforced by any tool I read. The pin is only verifiable by a manual `sha256sum` comparison against claims.json.
3. **[Low, scope note] Frozen counter's `driver-binding` check does not reference the pin.** Evidence: `chromium-wheel-r64.mjs` line 95. Same root cause as finding 1; listed for the L1 to know the check's real semantics.
4. **[Info] PNG and receipt determinism is confirmed for a fixed nonce.** Repeat run C is byte-identical to run A in shots and in all non-volatile receipt fields, on a different port and profile. No defect.
5. **[Info] Wall clock.** One cold driver run takes about 4.0 s on this host (A, B concurrent: 4.0 s each; C sequential: 3.99 s), including Chromium startup. The driver's 1600 × 150 ms page-wait budget is therefore far from being exercised.
6. **[Info] Not run by me.** `scripts/verify-live-r64.mjs` as a whole, the counter selftest, the negatives and the mutants were outside this seat's assignment and were not executed.

No tools were installed or upgraded. Nothing was committed, pushed or stashed. No frozen file was edited.

## Verdict

**Reproducible: yes, by an independent party.** Two cold runs from my own scratch, with different nonces, both exit 0, both pass the frozen counter (29 checks, 0 findings), both show `wheelHypothesis CONFIRMED` and `predicate true`. Their legs, wheellog-minus-ts and pageState are equal (0 differing fields). The pixel evidence decodes as claimed for both runs: nonce grid equal to SHA-256(nonce) bits, witness strip equal to the frozen table, band colours equal to the scroll-position formula. Teardown is clean: no survivors, all four ports closed.

**Pin enforcement: not reproducible as a gate.** The driver pin matches claims.json. However, the counter and the live verifier never compare against that pin (findings 1–3), so the frozen-pin kill rule cannot be detected by the frozen tooling. I rate C1's demonstration as independently reproduced, with a calibration gap in pin enforcement that the L1 should record against C1.

## Receipts

Under `.ufo/waves/round-64/w1/R64ExecDriver/` (220 KB, 34 files):
- `run-a/`, `run-b/`, `run-c/`: `receipt.json`, `server-log.json`, the six leg PNGs, and `fixture.html` (for a and b).
- `counter-a.json`, `counter-b.json`, `counter-c.json`: frozen counter JSON outputs.
- `counter-a-wrongpin.json`: counter output with the all-zero pin (finding 1).
- `a.stdout`, `b.stdout`, `a.stderr`, `b.stderr`: driver stdout and stderr (stderr empty).

## Checks for the main agent to run

- `sha256sum` of the four instruments against the claims.json pins (the values above).
- `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs <receipt> --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 0000…0000 --shot <dir> --json` to confirm finding 1 yourself.
