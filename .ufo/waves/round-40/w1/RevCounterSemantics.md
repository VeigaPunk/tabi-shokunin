# RevCounterSemantics — round-40 w1 — frozen C1 counter vs its sentence

Seat: RevCounterSemantics (leaf). Milestone: claim-review. Judged axes: coverage, calibration.
Date: 2026-10-27. Fleet root cwd honored; all writes were this report and `/fast/scratch/hyaku/tabi-r40/RevCounterSemantics/` (deleted before yield). No production tree, fleet, sibling, or shokuknow mutation. No tool installs (none needed; pacman guard respected).

## Subject and provenance

Freeze commit `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` (baseline `a1b1e939048885d2793759b7f49b10c5c820d70d`; `git merge-base --is-ancestor` → baseline is ancestor of freeze).

Frozen-bytes identity — `git show <freeze>:<f>` piped to `sha256sum` vs working tree, against `claims.json:frozenDigests`:

| file | frozen == tree | digest |
|---|---|---|
| scripts/playwright-firefox-egress-round39.mjs | yes | `1f8a15f0…545b` (matches claim) |
| scripts/measure-c1-round40.mjs | yes | `a0e564c7…0735` (matches claim) |
| scripts/selftest-measure-c1-round40.mjs | yes | `5a0b702d…5d82` (matches claim) |
| .ufo/waves/round-40/counters/c1-sample-span-v3.mjs | yes | `0b452eac…253c` (matches claim) |

All four files were read whole from freeze bytes. No LSP server/device available in this lane (JS fixture scripts, none indexed); analysis is over complete frozen file bytes plus executable scratch fixtures, not grep fragments.

## Method

1. Static clause mapping of the C1 predicate sentence onto wrapper (`measure-c1-round40.mjs`), driver (`playwright-firefox-egress-round39.mjs --round40`), and counter (`c1-sample-span-v3.mjs`).
2. Executable fixtures in scratch only:
   - **Mutant battery** (36 cases + usage): a minimal valid r40 receipt built from the committed round-39 bytes, mutated one clause at a time, scored by the frozen counter in place.
   - **Wrapper glue**: frozen wrapper bytes with only the `ROOT` literal redirected into scratch, stub driver writing configurable receipts, byte-identical counter copy (fixture-fix note: first run used a `.mjs.real` entry name, which Node refuses to load; rerun with `.mjs` names — G5/P1 results below are from the corrected runs).
   - **Live controls**: the round-39 replay control and the frozen selftest, run verbatim with explicit scratch dirs.
3. No live Firefox/browser run (live measurement is the counting command's claim pass; this seat is scratch-fixtures-only by assignment).

## 1. Predicate clause coverage — every clause is actually checked

| predicate clause | enforced by | fixture evidence |
|---|---|---|
| invokes driver for exactly two runs | wrapper hardcodes `--runs 2`; driver ROUND40 exits 64 unless `runs===2`; counter `runs.length!==2` → `run-set` | battery P (1 run), Q (3 runs), X (empty) all exit 1 |
| fresh 64-hex nonce | wrapper `crypto.randomBytes(32).toString('hex')` per invocation; driver regex; counter regex on expectedNonce | glue G1 record captured fresh nonce per wrapper run; battery V (63-hex) exit 1 |
| receipt AND each run carry that nonce | counter `receipt.runNonce` + every `runs[i].runNonce`; wrapper pre-check `nonceMatches` | battery U, U2 exit 1; glue G2 (stale top) and G6 (stale run) both `fresh-run-nonce-mismatch` |
| >=8 strictly increasing samples | counter `sample-count`, `sample-order` | battery B (7), Y (missing), Z (null entry), Z2 (string t), Z3 (non-array) exit 1 |
| first-to-last observed span >=1000ms | counter `ts.at(-1)-ts[0]<1000`; driver live FailClosed below 1000 (4 s deadline) | battery D1 (999 ms) exit 1, D2 (exactly 1000 ms) exit 0 — calibrated to `>=` |
| both ss+proc available, positive ticks, every sample and final sweep | counter `usable()` per `['ss','proc']` per sample + `finalSweep`; driver ROUND40 fail-closed on any null surface | battery E/F/F2/H exit 1; selftest's 4 unavailable mutants refused (rerun live, below) |
| all observed nonLoopback zero | counter per-sample and final-sweep `nonLoopback!==0` | battery G (`-egress`), G2 (non-finite), H2 (final egress) exit 1 |
| per-run owned tree nonempty | counter `owned.tree` nonempty array; driver aborts empty at launch | battery I, I2 exit 1 |
| identical firstShotSha256 | counter 64-hex each + `runs[0]===runs[1]` | battery N, O exit 1 |
| zero survivors | counter `survivors===0 && survivorPids.length===0`; driver post-close `/proc` sweep | battery J, K exit 1 |
| closed fixture port | counter `portClosed===true`; driver ROUND40 live `ss -Hlt` scan, refuses open/unverifiable | battery L, L2 (`'true'` string) exit 1 |
| browserVersion bound | counter nonempty string per run; driver `browser.version()` live | battery M, M2 exit 1 |
| round-39 receipt refused | counter (nonce absent + spans below target) — reproduced, see §3 | control exit 1; span-only variant exit 1 |

No predicate clause is unchecked. Three clauses (survivors, closed port, run identity) are necessarily receipt-attested at counter level and are enforced live by the frozen driver (`ss -Hlt` port scan; `existsSync(/proc/<pid>)` survivor sweep; owned-root regex `ms-playwright/firefox-\d+` over children of the node process).

## 2. Malformed receipts vs exit 0

**Through the frozen measured command: none found.** The receipt at `--out` can only be driver-written: wrapper refuses a pre-existing output before any spawn (live probe L2: exit 1 `output-already-exists`, scratch dir never created), driver writes with flag `wx`; wrapper exit 0 requires driverExit 0 (G3: valid receipt but driver exit 3 → wrapper exit 1) AND counterExit 0 (G5: scoring logic runs, predicate true, counter process exit 1 → wrapper exit 1) AND `counter.predicate===true` (battery: valid receipt exit 0; all 30 clause mutants exit 1). Wrapper exit codes: 64 usage (L1), 2 on unreadable receipt (G4: driver writes nothing, exit 0 → `driver-receipt-unreadable`), 1 on every refusal. Nonce threading verified end-to-end (G1 stub-driver record shows the fresh nonce the wrapper passed; same nonce validates at the counter).

**Through the counter standalone: two acceptances of internally inconsistent input** (finding, low; both unreachable via the counting command because only the frozen driver writes the scored file and it recomputes aggregates from the same observations it just wrote):

- **W (exit 0, predicate true)**: receipt with top-level `egressNonLoopback: 5`, `survivors: 2`, `binding: false` while every per-sample/per-run field is clean. The counter never reads the receipt-level aggregates, so a self-contradictory receipt scores true.
- **F3 (exit 0, predicate true)**: `ticks: 0.5` satisfies "positive ticks" (`Number.isFinite && > 0`). Negative (`-2`) and zero are refused; the frozen driver only ever emits integer `ticks: 1`, so the sentence's literal wording is not violated, but a non-integer tick count is not a physical observation.

Battery detail (case → exit, findings): A0 valid → 0/[] · B → 1/[sample-count, sample-span] · C → 1/[sample-order] · D1 → 1/[sample-span] · D2 → 0/[] · E/F/F2 → 1/[sample1-ss-unavailable] · F3 → 0/[] · G → 1/[sample1-ss-egress] · G2 → 1/[sample1-ss-unavailable] · H → 1/[final-proc-unavailable] · H2 → 1/[final-ss-egress] · I/I2 → 1/[owned-empty] · J/K → 1/[survivors] · L/L2 → 1/[port-open] · M/M2 → 1/[version] · N → 1/[shot-hash, shot-hash-diff] · O → 1/[shot-hash-diff] · P/Q/R/X → 1/[run-set] · S → 1/[run1-refused] · T → 1/[schema] · U/U2/V → 1/[run-nonce-mismatch] · W → 0/[] · Y/Z3 → 1/[sample-count, sample-span] · Z → 1/[sample-order, sample3-ss-unavailable, sample3-proc-unavailable] · Z2 → 1/[sample-order] · missing `--nonce` → 64 usage. Full machine output: scratch `work/battery-results.json` (deleted with scratch; cases reproducible from this report).

## 3. Round-39 negative control — genuinely below target: YES

From the committed receipt bytes (`corpus/evidence/round-39/playwright-egress/receipt.json`, sha256 of scored bytes `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`): schema `tabi-pw-firefox-egress-receipt-v2`; **no `runNonce` field anywhere**; run1 9 samples span **799 ms** (1793120277811→…278610), run2 8 samples span **701 ms** (…280014→…280715), strictly increasing; survivors 0; portClosed true; browserVersion "157.0"; identical firstShot hashes; owned tree 5. The claims `before` text ("lacks a current invocation nonce … spans of 799 ms and 701 ms") matches the bytes exactly.

Reproduced with the exact control command and a fresh nonce (`732669e9…0f47`): `node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs corpus/evidence/round-39/playwright-egress/receipt.json --nonce <fresh>` → **exit 1**, `nonceMatched:false`, findings `["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]` — matches the recorded control receipt `.ufo/waves/round-40/controls/c1-round39-replay-v3.json`.

Span-independence (the "genuinely" part): a scratch copy of the same bytes with ONLY schema and nonces patched to valid values (timestamps untouched) → **exit 1**, findings exactly `["run1-sample-span","run2-sample-span"]`. The refusal is intrinsic to the observed spans being below 1000 ms, not an artifact of nonce absence. Boundary calibration agrees with the predicate at 1000 ms exactly (D1/D2) and with the driver's live FailClosed threshold.

Selftest control: `node scripts/selftest-measure-c1-round40.mjs <scratch>` → **7/7 passed, exit 0** (`{"cases":7,"passed":7,"failures":[]}`), matching `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json`; the synthetic positive is parser-only (counter accepts a hand-built receipt, as designed) and the wrapper refused the pre-existing synthetic output before any browser start (`scratchCreated:false`).

## Findings

1. **[low] Counter accepts internally contradictory receipts (standalone only).** Top-level `egressNonLoopback`/`survivors`/`binding` are unscored (case W, exit 0). Not reachable through `measure-c1-round40` (sole writer is the frozen driver; wrapper refuses pre-existing output). Hardening only; the sentence's operative clauses are per-observation and all enforced.
2. **[low] "Positive ticks" admits any finite >0, including fractions** (case F3, exit 0; `ticks: 0.5` passes). Literal-predicate-conformant; driver emits only `ticks: 1`. Tightening to integer >0 would close it without widening the predicate.

No clause is unenforced; no malformed receipt reaches exit 0 through the counting command; the negative control is genuinely below target.

## Residual risk and verification gaps

- The wrapper records `driverSha256` but does not assert it against `claims.frozenDigests`; provenance relies on external digest checks (performed here: all four match freeze and tree). A negligible TOCTOU window exists between the wrapper's hash and its `spawnSync` of the driver.
- Survivor/port/identity clauses are driver-attested in the receipt; the counter cannot re-derive them post-hoc. Verified as live checks in frozen driver code only.
- Driver's `portClosed` substring scan (`line.includes(':'+port)`) can false-positive on a superset port string (e.g. fixture `:4311` vs listener `:43115`) — fail-closed direction only (spurious refusal), never a false pass.
- No live browser run performed in this lane (by assignment); the live-run claim pass is exercised by the counting command itself, not re-executed here.

## VERDICT

VERDICT finding — frozen counter enforces every predicate clause and the measured-command path admits no malformed receipt at exit 0, and the round-39 negative control is genuinely below target (799/701 ms verified from committed bytes, refusal reproduced, span-independence proven); two low-severity counter-standalone hardening gaps found (unscored receipt-level aggregates; fractional ticks accepted), both unreachable via the counting command.

Report: .ufo/waves/round-40/w1/RevCounterSemantics/report.md
