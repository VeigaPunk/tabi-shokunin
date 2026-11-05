# R64Reviewer — attack seat report (tabi round 64, wave w1)

Seat: reviewer (attack). Baseline `6c19979f…`, freeze `0fc68043…`. All 10 frozen pins in
`claims.json` were re-hashed at attack start and match (`sha256sum`, 2026-11-04); no frozen byte
was touched. No tools were installed (PACMAN paused; nothing needed — node v24.21.0 present).
Scratch: `/fast/scratch/hyaku/tabi-r64/R64Reviewer/` (removed before yield; receipts copied to
`.ufo/waves/round-64/w1/R64Reviewer/`). Paths below are relative to the lane repo unless absolute.

## Findings

### H1 — CRITICAL (C1): the live verifier exits 0 with ZERO browser executions — substitute the driver
`scripts/verify-live-r64.mjs` never checks that `--driver` is the frozen driver. It hashes whatever
file the caller names (`verify-live-r64.mjs:40`) and hands that hash to the counter as
`--expect-driver-sha256` (`:51`); the counter's `driver-binding` then just compares the receipt to
those same bytes (`chromium-wheel-r64.mjs:95`), and `fixture-binding` re-renders the fixture from
the same file's source (`:337`). The whole chain is driver-relative, not pin-relative.
Command (evidence `R64Reviewer/E3a.json`, fake driver `R64Reviewer/fake-driver.mjs`):
```
node scripts/verify-live-r64.mjs --scratch /fast/scratch/hyaku/tabi-r64/R64Reviewer/live \
  --driver /fast/scratch/hyaku/tabi-r64/R64Reviewer/fake-driver.mjs \
  --counter .ufo/waves/round-64/counters/chromium-wheel-r64.mjs \
  --evidence /fast/scratch/hyaku/tabi-r64/R64Reviewer/fake/receipt.json \
  --evidence-shots /fast/scratch/hyaku/tabi-r64/R64Reviewer/fake --json
→ exit 0; predicate=true; runs a/b exit 0, counterExit 0/0; crossRun=true; evidence=true; 561 ms
```
The fake driver synthesizes both receipts and six PNGs; it never spawns Chromium — its own
confession (`"fake-driver: no browser was launched…"`) sits in the verifier's output field
`runs[].stderr` next to `predicate: true`, and nothing acts on it.
Boundary: the scored `afterCommand` names the frozen path, so the scored experiment as written is
not attacked. But the "frozen" in the claim is enforced only by the command's literal argv — no
instrument, exit code, or kill-rule executor re-checks the driver bytes against pin `1ff560cc…`.
One edited argv token defeats the entire demonstration.

### H2 — HIGH (C1): cheapest counter-passing forgery: 56 lines / 95 ms; 76 lines / 96 ms standalone
The counter accepts a complete hand-built receipt+shots with no browser, confirming the disclosed
synthesized-rendering limit and pricing it:
- Variant A (`R64Reviewer/forge-a.mjs`, 56 lines): imports the frozen counter's **own exported
  forgery oracle** (`renderFixture`, `drawShot`, `nonceBits`) — the instrument ships its forgery as
  API. `node forge-a.mjs --driver scripts/chrome-cdp-loopback-round64.mjs --nonce tabi-r64-forge-a
  --out …` then frozen counter CLI → **exit 0, findings [], checks 29** in 95 ms.
- Variant B (`R64Reviewer/forge-b.mjs`, 76 lines): independent of counter exports — band/witness
  tables and the nonce-bit rule parsed from the driver source, only the frozen PNG codec imported.
  Counter → **exit 0, findings [], checks 29** in 96 ms.
The "fixture re-rendered from the pinned driver" check binds to `sha(renderFixture(driverSource,
nonce))` — a pure function of bytes anyone can read offline; it authenticates nothing about
execution. Run-binding fields (serverLog, teardown, sweeps, host identity) are receipt-declared
strings the counter cannot falsify.

### H3 — HIGH (C1): claim sentences no command enforces
1. "runs the **frozen** r64 driver twice cold" — unenforced (H1); the verifier records
   `driverSha256` of whatever file was passed.
2. kill rule 2 clause "runs fewer than two live runs" — structurally unreachable: the loop at
   `verify-live-r64.mjs:73` always pushes exactly two entries; no exit code can observe a
   violation. `target.liveRuns: 2` is dead letter.
3. `target.counterChecks: 29`, `negatives: 29`, `counterSelftestCases: 31` — no command's exit code
   encodes these counts (see H5a/H5b: weakened counter selftests clean at cases=30 exit 0;
   negatives 28/28 refused exit 0). Only humans reading stdout see the count.
4. "requires the committed evidence receipt to agree with its own live run" — enforced, but on
   three shape groups only (legs[name,scrollY,wheellogLen,witnessRgb], wheellog-minus-ts,
   pageState). Demonstrated sharp form (E3a): the evidence receipt's nonce is
   `tabi-r64-evidence-never-run`, different from both live nonces, and `agreement.evidence=true`.
   The committed evidence bytes need never correspond to any executed run — disclosed in limits
   ("does not authenticate the committed evidence bytes"), here confirmed with the exact bypass.
5. kill rule 6's "a mutant refuses the live receipt (blanket refusal is never a kill)" contradicts
   the instrument: `mutate-r64.mjs:122` exits 1 unless `liveAccepted === mutants`, so a blanket
   refusal fails the 'mutants' control. Either the claim's escape hatch is not implemented or the
   tool is over-strict.
Enforced exactly as stated: 29 checks/predicate/findings via counter exit; cross-run agreement
fields; counterExitPerRun 0; negatives forgedGreen=0 + refused==negatives (`make-negatives:92`);
mutants surviving=0 + applied==16 (`mutate-r64:122`); red-before classes (re-verified pristine).

### H4 — HIGH (C1 kill rules): what fires first if the counter were weakened
Two weakening classes, both exercised on a scratch copy (`R64Reviewer/`, pristine counter
untouched):
- **Deletion class** (the `leg-witness` check statement + CHECK_IDS entry removed):
  - counter selftest: `verdict=clean cases=30 passed=30`, **exit 0** (E5a; pristine cases=31) —
    kill rule 8's count clause has no machine reader;
  - declared negatives: `negatives=28 refused=28 forgedGreen=0`, **exit 0** (E5b) — rule 5 blind;
  - red-before classes keep their declared exits (E5e: one-by-one/borrowed-shots/no-shots still
    refused; synthetic-rendering still accepted) — rule 7 silent;
  - a receipt whose witness pixel is repainted — refused by pristine (exit 1, `["leg-witness"]`) —
    is **ACCEPTED by the weakened copy (exit 0, findings [])** (E5c) — forged-green through three
    of four in-battery tripwires;
  - **the first failing control is 'mutants'**: `applied=15/16` (M4's find string absent) →
    `mutate-r64` exit 1 (E5d). Rule 6's `applied === mutants` precondition is the real detector.
- **In-place loosening class**: rule 5 fires first in-battery (matching negative accepted →
  `forgedGreen=1` → make-negatives exit 1); selftest also goes red (verdict red → exit 0→1, rule 8
  clean clause fires). This is what the committed negatives/mutants matrices already demonstrate.
- Unreachable/dead clauses: "runs fewer than two live runs" (H3.2); rule 6's blanket-refusal clause
  (contradicted by the tool, H3.5). Rule 1 (pin change) has no in-repo executor — it is enforced
  only by the validator/L1 reading `pins`, plus the C2 gate's `inputs-bound` **if** scored receipts
  name the weakened file at the freeze rev (a drift would then surface as digest mismatches).

### H5 — HIGH (C2): the gate passes fabrication (including a mechanical gap beyond the disclosed limit) and fails honest receipts
- **After-state reachable without work** (E6c, `R64Reviewer/fab/`): 12 receipts for
  `node scripts/verify-live-r64.mjs …` runs that **never happened**, with invented stdout bytes and
  self-consistent digests, inputs bound to the true bytes of `scripts/verify-live-r64.mjs` at the
  freeze rev, plus 2 matrices — one naming a **nonexistent input path**, one carrying a
  **deliberately wrong sha256**:
```
node scripts/check-receipt-provenance.mjs --dir <scratch>/fab --repo . \
  --rev 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741 --require-committed --min-receipts 12 --json
→ exit 0; checked=14 matrices=2 failures=0 ok=true
```
  The disclosed limit covers fabricated receipts; the **matrix gap is mechanical**:
  `checkMatrix` (`check-receipt-provenance.mjs:80`) only tests `path` is a string and `sha256` is
  hex64 — it never opens the named input nor compares the digest. The r63 D4 fix made naming
  mandatory but binding unverified, so "a matrix file must name its input receipt" is enforced as
  format, not fact.
- **Re-derivable but failing** (E6d, `R64Reviewer/d2/`): (a) an honest `node -e "console.log(240)"`
  receipt — actually executed, real exit 0, real stdout digest — fails `inputs-bound` ('no inputs',
  `:59` demands ≥1 input); (b) an honest precondition receipt binding the real `/usr/bin/chromium`
  bytes fails `inputs-bound` 'absent at rev' (the gate binds only repo-relative paths at `rev`).
  The gate over-refuses an honest class it cannot express while under-refusing fabrication.
- Before-state re-derived exactly (E6a): gate over r63 controls at baseline → exit 1, checked=11,
  failures=34, byCheck {schema 11, stdout-bound 11, inputs-bound 11, argv-real 1}. Gate selftest
  clean, cases=9, exit 0 (E6b).

### H6 — LOW (C1 availability): port-allocation race can only turn the pass red, never green
`freePort` (bind 0 → close → return) in the verifier and the driver's bind-precheck have a TOCTOU
window. A co-tenant holding the chosen port forces the frozen driver to exit 2 pre-launch (E6e:
`--http-port 19587` held → `{"error":"usage","detail":"free-port precheck: port 19587 busy"}`,
driver-exit 2; only 2 attempts per run). Under adversarial or merely heavy co-tenancy the live
pass can be flaked (availability), but the race cannot forge a green — the driver refuses busy
ports fail-closed. Structural analysis + single-point empirical demo; no fleet-wide squatting was
attempted.

## Verdict
- **Does C1's target survive a do-nothing control?** As scored (frozen argv), yes: `--no-run`
  exits 1 / `live-run-required` (E3b), pre-seeded scratch dirs are rm -rf'd and cannot inject
  (E3c: `preseeded` marker GONE), red-before classes stay red, and a forged evidence receipt alone
  cannot green the verifier because two live driver runs are structurally required. **But the
  target does not survive a do-nothing attacker who picks the invocation** (H1): green predicate,
  two "live" runs, full agreement, 561 ms, zero browser. The frozen-driver property lives in one
  argv token that no instrument re-checks; recommend the verifier (or counter) reject any
  `--driver` whose sha256 is not the pinned `1ff560cc…`.
- **Is C2's after-state reachable without work?** Yes — demonstrated: 12 never-executed receipts
  pass `--require-committed --min-receipts 12` with 0 failures (H5). "0 failures" certifies
  well-formedness, not occurrence; additionally the gate's matrix-input check cannot bind a
  matrix to its input, and honest input-free commands are structurally unable to pass.

Residual gaps: I did not re-run the real browser live verification (the scored evidence belongs to
the L1; every green run above used the fake driver by design); in-place-loosening detection was
confirmed from the committed matrices plus code, not re-exercised end-to-end.

## Receipts
All under `.ufo/waves/round-64/w1/R64Reviewer/`: attack tools (`forge-a.mjs`, `forge-b.mjs`,
`fake-driver.mjs`, `tamper-witness.mjs`); verifier runs (`E3a.json` green fake-driver pass,
`E3b.json` no-run refusal, `E3c.json` pre-seed wipe); forgeries (`forge-a/`, `forge-b/`, `fake/` =
evidence-never-run, `tampered/`); weakened-counter probes (`E5a.json` selftest cases=30,
`E5b-negatives-matrix.json` 28/28, `E5c-wkn.json`/`E5c-pristine.json` forged-green split,
`E5d-mutants-matrix.json` applied 15/16, `E5e-*.json` red-before stability); gate probes
(`E6a.json` before-state 11/34, `E6c.json` fabricated 14/0 pass, `E6d.json` honest failures,
`fab/`, `d2/`).
