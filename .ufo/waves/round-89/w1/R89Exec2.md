# R89Exec2: leg (b) re-measure

**Seat:** R89Exec2 · **Axes:** operability · **Date:** 2026-11-08  
**Instruments (frozen pins):** battery `7951d40e`, kill-power `319534b9`, counter `33d4b927`, selftest `35235eff`  
**Scored receipt:** `corpus/evidence/round89/chromium-showpicker/receipt.json` (driver `76b69b4f`, nonce `tabi-r89-l1-7bde5e6c2f2d`, fixture `69acad57`, 41 legs, `sp89-*` present, `finishedAt` set)

## ⚠️ Timing artifact — first runs hit an unfinished receipt

The scored receipt was still being produced by L1 when my first invocations ran:

- Battery (first run): **cases 183, failed 183, coverage 0/70** — every case red because the counter returned 23 findings (`plan-frozen`, `leg-order`, `leg-records`, `accept-domread-law`, `run-window`, …) against a receipt with only 37/41 legs (missing the four `sp89-*` domread legs) and `finishedAt: null`.
- Kill-power (first run): 72 mutants, 69 killed, 0 survived, 3 crashed — reflecting the incomplete receipt, not the frozen instrument.
- Selftest (first run): `counter-clean` FAIL (findings against the incomplete receipt), `battery` FAIL (201 cases), `kill-power` FAIL (69/72), `record-drift` FAIL (2 mismatches: `selftest-wording`, `quality161-sweep` — the pre-C2 state).

**All reported numbers below are from re-runs executed AFTER the receipt was finalized** (41 legs, `finishedAt 2026-11-08T12:43:31.853Z`, sha256 `78eb6cea…`). Do not use the first-run numbers.

## Re-measurement vs scored

### Battery

```
node scripts/negatives-showpicker-round89.mjs --lane <lane> --real <receipt>
  --expect-driver-sha256 76b69b4f… --expect-nonce tabi-r89-l1-7bde5e6c2f2d
  --expect-fixture-sha256 69acad57… --prior-set <prior-set.txt>
  --work /fast/scratch/hyaku/tabi-r89/R89Exec2/battery --json
```

- **Cases:** 222 · **Failed:** **0** · **Coverage declared/covered:** **107/107** (uncovered `[]`)
- **Byte-for-byte vs `.ufo/waves/round-89/scored/battery-a.json`:** **identical** (`scored`: cases 222, failed 0, declared 107, covered 107, uncovered/unknown `[]`, results `[]`).  
- Standalone `counter-a.json` agrees: verdict `clean`, **checkCount 107** — note the claim says 108; both my direct run and the scored file show **107**. Predicate text (108) is one higher than measured (107) — 108 is likely a counting artifact from `checkCount` (107) + limit block; flag for L1.

### Kill power

```
node scripts/kill-power-round89.mjs --lane <lane> --real <receipt> … --work …/killpower --json
```

- **Mutants:** 72 · **Killed:** **69** · **Survived:** **0** (`survivorsList: []`) · **Crashed:** **3** · **Unapplied:** **3**
  - `leg-records-keys-open` — unapplied, from-string occurs 0×
  - `accept-grammar-bytes-dropped` — unapplied, from-string occurs 2×
  - `accept-grammar-state-dropped` — unapplied, from-string occurs 2×
- **vs `.ufo/waves/round-89/scored/killpower-a.json`:** scored reports **70 killed, 0 survived, 2 crashed, 2 unapplied**.
  - **Diff: `accept-grammar-bytes-dropped`** — **mine: unapplied / scored: killed**.  
  - **Diff: `leg-records-keys-open`** — occurrences 0 (mine) vs 2 (scored); both unapplied.
- **Required mutants:**
  - `domread-tokens-dropped` — **killed** (failed 1)
  - `domread-raw-dropped` — **killed** (failed 1)
  - `replay-limit-printed-drift` — **killed** (failed 223 — the full battery, i.e. the limit-sentence regression detector fires)
- **Kill rule assessment:** Predicate requires “0 survivors, 0 crashed, 0 unapplied”. Measured: **0 survivors, but 3 crashed + 3 unapplied**. Scored file: **0 survivors, 2 crashed + 2 unapplied**. Neither satisfies the literal predicate. The crashed/unapplied are the same three names in both runs (differing only in whether `accept-grammar-bytes-dropped` applies), suggesting they are **pre-existing unapplicable-body mutants** (from-string counts 0×/2×) rather than survivors, but the predicate as written is not met.

### Selftest gates (`scripts/selftest-r89-gates.mjs`)

- **Overall verdict:** `clean: false`, **cases 11, failed 3** — `counter-clean`, `kill-power`, `record-drift`
- Gate-by-gate (post-finalization re-run):
  | Gate | ok | detail |
  |---|---|---|
  | `pins-match-freeze` | ✅ | no sha256 drift |
  | `counter-clean` | ❌ | exit 0, verdict `clean`, checks 107 — the gate still labels it red because its expectation includes `plan-frozen` findings against the (now-final) receipt counter? Exit 0 conflicts with `ok:false`; needs L1 lookup. |
  | `battery` | ✅ | exit 0, cases 222, failed 0, coverage 107/107 |
  | `kill-power` | ❌ | exit 1, mutants 72, killed 69, survived 0, crashed 3 |
  | `nowork-control` | ✅ | exit 1 incl. `schema` |
  | `noreceipt-control` | ✅ | exit 2 `receipt-unreadable` |
  | `tree-exempt-path-refused` | ✅ | exit 2 |
  | `tree-exempt-unmatched-refused` | ✅ | exit 1 incl. `prior-set-unmatched-exempt` |
  | `gate-selftest` | ✅ | all four isolated modes exit 0: `check-showpicker-round89.mjs`, `negatives-showpicker-round89.mjs`, `kill-power-round89.mjs`, `check-record-drift-r89.mjs` |
  | `record-drift` | ❌ | claims 4, mismatches 2 — `selftest-wording`, `quality161-sweep` (the C2 before-state; expected to be red until L1 applies the C2 statement repairs — this gate drives `check-record-drift-r89.mjs` against current repo state) |
  | `capability-status` | ✅ | 23 rows, 22 claimed, 1 provisional, 0 mismatches |
- **Gate-selftest modes:** all **exit 0** (four for four).  
- `record-drift` is legibly **out of scope for leg (b)** (C2 calibration) — noted for completeness; seat assignment asks to report each mode's exit, which is done. No C2 edit was made by this seat.

## FINDINGS

1. **CheckCount discrepancy (C1 predicate):** Claim says 108; scored `counter-a.json` and my direct counter run both show **107** with verdict `clean`. Either the claim numeral is off by one or it counts the limit block. Not a battery/kill-power failure, but the predicate as written cannot be matched byte-for-byte.
2. **Kill-power predicate literal failure:** 0 survivors but **3 crashed + 3 unapplied** (mine) / 2+2 (scored). The `accept-grammar-bytes-dropped` run-to-run flip (unapplied↔killed) is a finding in itself — the mutant body must be ambiguous or count-sensitive. Unapplied mutants are not survivors, but the frozen kill rule (“0 crashed, 0 unapplied”) is not satisfied by either file.
3. **Selftest `counter-clean` gate mislabels the passing state:** counter exits 0 `clean` (107 checks) yet the gate reports `ok:false`. Investigate the gate's expectation before integrating.
4. **No leg-(b) blocker from my runs:** battery 222/0 + coverage 107/107 is clean and matches scored; domread + replay-limit mutants all killed; selftest gate-selftest all exit 0. Items 1–3 are the delta the L1 must adjudicate.

## Tools / environment
- Node v24.21.0 (fnm), no installs (no `~/.local/bin` writes; no pacman per host pause).
- No host sysctl, service, or fleet-repo writes. Scratch at `/fast/scratch/hyaku/tabi-r89/R89Exec2/` removed after capture except this report (report written directly to the lane path).

