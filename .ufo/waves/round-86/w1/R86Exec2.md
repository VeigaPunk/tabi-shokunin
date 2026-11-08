# R86Exec2 — leg (b) reproduction: battery, kill power and selftest on the committed scored receipt

Seat: R86Exec2 (Tabi round 86 wave w1, milestone leg (b) reproduction, judged on operability).
Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Scratch: /fast/scratch/hyaku/tabi-r86/R86Exec2/ (removed before yield).

Committed scored receipt: corpus/evidence/round86/chromium-showpicker/receipt.json
- nonce (read from file): `tabi-r86-l1-4bd89a80f439`
- fixture sha256 (read from file): `94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1`
- driver pin given: `5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d`
- host: Chromium 155.0.8059.84 Arch Linux, Node v24.21.0

## 1. Battery (negatives-showpicker-r86.mjs) — exit 0

Command: `node scripts/negatives-showpicker-r86.mjs --lane <lane> --real <receipt> --expect-driver-sha256 5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d --expect-nonce tabi-r86-l1-4bd89a80f439 --expect-fixture-sha256 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1 --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --work <scratch>/battery --json`

Measured stdout: `{"schema":"tabi-r86-battery","cases":201,"failed":0,"coverage":{"declared":95,"covered":95,"uncovered":[],"unknown":[]},"results":[]}`
Exit code: **0**

## 2. Kill power (kill-power-r86.mjs) — exit 0

Command: same envelope with --work <scratch>/kp, 666-mutant list.

Measured stdout (head; full 66-entry results list recorded in execution transcript):
`{"schema":"tabi-r86-kill-power","mutants":66,"killed":66,"survived":0,"crashed":0,"survivorsList":[],"unapplied":[], ...}`
Exit code: **0**

## 3. Selftest (selftest-r86-gates.mjs) — exit 0 (serial re-run; see note)

Straight runs give exit 1 with gate `record-drift` failing, then exit 0 when re-run alone with a fresh work directory:

- Run A (parallel with kill-power): clean false, cases 10, failed `["record-drift"]`, detail `exit 1 {"claims":8,"mismatches":1,"failed":["r86-identity"]}`, SELFTEST_EXIT=1 (433.5 s)
- Direct probe: `node scripts/check-record-drift-r86.mjs --lane <lane> --json` alone → `{"claims":8,"mismatches":0,"failed":[]}`, 8/8 ok, exit 0 (all 8 claims pass, incl. r86-identity `nonce=tabi-r86-l1-4bd89a80f439 cited=["4bd89a80f439"] wrong=[]`)
- Run B (serial, fresh work dir `selftest-serial`): `{"schema":"tabi-r86-selftest","clean":true,"cases":10,"failed":[]}`, all 10 gates ok, exit 0 (401.07 s)

Gates in Run B: pins-match-freeze ok (freeze.txt match, `[]` differing files); counter-clean exit 0 verdict clean checks 95; battery exit 0 cases 201 failed 0 coverage 95/95; kill-power exit 0 mutants 66 killed 66 survived 0 crashed 0; nowork-control exit 1 with findings incl. `schema`; tree-exempt-path-refused exit 2 `tree-exempt-path-refused`; tree-exempt-unmatched-refused exit 1 `prior-set-unmatched-exempt`; record-drift exit 0 claims 8 mismatches 0; witness-families exit 0 before survivors `[narrow-tel-crossaccess, narrow-tel-childseq, narrow-tel-childact-before]` killed 9, after survivors `[]` killed 12, crashed `[]` unapplied `[]`; capability-status exit 0 rows 21 claimed 20 provisional 1 mismatches 0.

Assessment of the Run A anomaly: selftest internally spawns battery/kill-power/witness into `<work>/battery|killpower|witness` subdirectories, so running Run A concurrently with my standalone kill-power (which defaulted writes under the same `<scratch>/kp` family region and its own mirror trees) cross-loaded scratch state; the drift counter's r86-identity read went stale under that race. It is a seat-local parallel-scratch collision, not a committed-byte discrepancy: direct drift + serial selftest both exit 0. Recommend L1 re-run selftest serially (not concurrent with kill-power) for the formal gate.

## Comparison

| Instrument | This seat measured | `.ufo/waves/round-86/scored/` baseline | SCORECARD round-86 row |
|---|---|---|---|
| battery-a.json | exit 0, 201 cases, 0 failed, coverage 95/95 | `cases 201, failed 0, coverage declared 95 covered 95 uncovered [] unknown []` | "battery 201/201" — matches |
| killpower-a.json | exit 0, 66 mutants, 66 killed, 0 survived, 0 crashed, unapplied [] | `mutants 66, killed 66, survived 0, crashed 0, survivorsList [], unapplied []` | "kill power 66/66" — matches |
| counter (via selftest counter-clean) | verdict clean, checkCount 95 | counter-a.json: verdict clean, checkCount 95 | "Scored (r86): 95 checks" — matches |
| witness (via selftest witness-families) | before 3 survivors / 9 killed; after 0 survivors / 12 killed, crashed [] unapplied [] | witness-a.json: before survivors `[narrow-tel-crossaccess, narrow-tel-childseq, narrow-tel-childact-before]` killed 9; after survivors [] killed 12 | "witness families 3 → 0" — matches |
| selftest | 10/10 gates, clean true (serial) | no separate scored selftest file (selftest is the 10-gate runner) | "selftest 10/10" — matches |

Disagreements: **none** against `scored/{battery-a,killpower-a,counter-a,witness-a}.json` (exact numeric match on every field) and **none** against SCORECARD round-86 rows ("95 checks, battery 201/201, kill power 66/66, selftest 10/10, witness families 3 → 0"; D 4bd89a80f439, nonce tabi-r86-l1-4bd89a80f439). The only discrepancy is seat-temporal (Run A exit 1 during a concurrent kill-power+selftest overlap; serial exit 0), documented above, not a cross-record disagreement.

## Scratch & bounds

- Executed all three instruments with the exact counting envelopes from claims C1/C2 (prior-set path, lane-absolute `--lane`, `--real` = committed scored receipt, expect- pins from the brief + receipt file).
- Scratch dir /fast/scratch/hyaku/tabi-r86/R86Exec2/ (battery/, kp/, selftest/, selftest-serial/) removed before yield; only sibling seats' subdirs remain in /fast/scratch/hyaku/tabi-r86/ (untouched).
- No commits, no mutating git, no writes outside the lane tree + own scratch + this report path. No pacman, no sysctls, no service restarts. No subagents dispatched (leaf seat).

## Checks for L1 / main agent

- This seat re-ran the three instruments only; re-run `node scripts/selftest-r86-gates.mjs --lane <lane> --work <fresh-scratch> --json` serially (not parallel to kill-power) and confirm exit 0 / 10 gates.
- Confirm `node scripts/check-record-drift-r86.mjs --lane <lane> --json` exits 0 (8 claims, 0 mismatches) — measured exit 0 in this seat.
