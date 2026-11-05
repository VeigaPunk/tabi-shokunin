# R64ExecNeg — independent negative set vs the frozen r64 wheel counter

Seat: executor (attack), Tabi round 64 wave w1. Scope: attack
`.ufo/waves/round-64/counters/chromium-wheel-r64.mjs` with my OWN negative set built
from the receipt schema in `scripts/chrome-cdp-loopback-round64.mjs` and the checks in
the counter. `counters/make-negatives-r64.mjs` was NOT read, imported, or reused.
Only frozen import: `png-r64.mjs` decode/encode (production codec semantics, so pixel
forgeries re-encode exactly the way the counter decodes).

## Method

- Base artifact: committed smoke receipt `.ufo/waves/round-64/controls/smoke/receipt.json`
  (sha256 `7dc5a247…d148`, pinned in claims.json) plus its six committed shots.
- Every case = ONE conceptual change vs the committed receipt/shots (field edit, PNG
  pixel edit, PNG swap, crop, dir content, or invocation flag). Pixel forgeries keep
  `shotSha256`/`shotBytes` truthful so the lie is the pixel, not the bookkeeping.
- Production CLI per case (frozen driver + pinned sha on every run):
  `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs <case>/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot <case> --json`
  Exit 0 = accepted (green), 1 = refused with finding ids, 2 = usage refusal.
- Pre-registered predictions were written into the harness before the first run
  (`results.json.predictedRefusal`); the table below reports observed output only.
- Positive control first: the committed receipt + shots through the same CLI →
  exit 0, findings `[]`. Harness aborts if not green.
- Evidence: every case's receipt + shots retained at
  `.ufo/waves/round-64/w1/R64ExecNeg/work/<case>/`; machine results at `results.json`;
  battery rerunnable with `sh .ufo/waves/round-64/w1/R64ExecNeg/rerun-battery.sh`.

## Forgery table

id | single change | expected refusal (pre-registered) | exit | findings (observed)
---|---|---|---|---
F00-baseline | none (committed bytes) | exit 0, findings [] | 0 | []
F01-schema | schema → `tabi-chrome-cdp-r63` | schema | 1 | schema
F02-nonce-swap | nonce → `tabi-r64-attacker` (nonceOnPage follows) | fixture-binding+nonce-pixels+server-witness | 1 | fixture-binding, nonce-pixels, server-witness
F03-nonce-on-page | nonceOnPage → `tabi-r64-other`, nonce kept | nonce-binding | 1 | nonce-binding
F04-driver-pin | driverSha256 → 64×`d` | driver-binding | 1 | driver-binding
F05-fixture-digest | fixture.sha256 → 64×`e` | fixture-binding | 1 | fixture-binding
F06-origin-port | fixture.origin port 18481 → 12345 | (accept — port never bound) | **0** | [] **FORGED GREEN**
F07-argv-conflict | host.argv += `--force-device-scale-factor=2` (fsf=1 still present) | (accept — subset-only check) | **0** | [] **FORGED GREEN**
F08-argv-drop | host.argv −= `--disable-smooth-scrolling` | launch-guards | 1 | launch-guards
F09-leg-reorder | legs[1] ↔ legs[2] full objects swapped | legs-shape | 1 | legs-shape
F10-scroll-value | legs[2].scrollY 240 → 180 | scroll-arithmetic+scroll-pixels | 1 | scroll-arithmetic (scroll-pixels aliased, see Findings 8)
F11-len-lie | legs[4].wheellogLen 4 → 5 | wheellog-count | 1 | wheellog-count
F12-seq-swap | wheellog[0].seq ↔ wheellog[1].seq | wheellog-sequence | 1 | wheellog-sequence
F13-delta-y | wheellog[1].deltaY 120 → 60 | delta-y-passthrough | 1 | delta-y-passthrough
F14-delta-mode | wheellog[3].deltaMode 0 → 1 | delta-mode-pixels | 1 | delta-mode-pixels
F15-untrusted | wheellog[2].isTrusted true → false | trusted-fields | 1 | trusted-fields
F16-uncancelable | wheellog[3].cancelable true → false | trusted-fields | 1 | trusted-fields
F17-unprevented | wheellog[3].defaultPrevented true → false (scrollEvents untouched) | cancelation+scroll-event-witness | 1 | cancelation, scroll-event-witness
F18-target | wheellog[0].targetId `tall` → `body` | target-binding | 1 | target-binding
F19-at-dispatch | wheellog[1].scrollYAtDispatch 120 → 118 | target-binding | 1 | target-binding
F20-ts-big | wheellog[2].ts 528 → 99999 | (accept — finite ≥ 0 only) | **0** | [] **FORGED GREEN**
F21-ts-negative | wheellog[2].ts 528 → −5 | trusted-fields | 1 | trusted-fields
F22-scroll-events | pageState.scrollEvents 4 → 5 | scroll-event-witness | 1 | scroll-event-witness
F23-final-scroll | pageState.scrollY 240 → 120 | page-final-state | 1 | page-final-state
F24-favicon-drop | serverLog `/favicon.ico` entry deleted (only `/` left) | (accept — every() over 1 entry passes) | **0** | [] **FORGED GREEN**
F25-favicon-200 | serverLog favicon status 404 → 200 | (accept — favicon status unpinned) | **0** | [] **FORGED GREEN**
F26-run-mismatch | serverLog `/` entry run → `tabi-r64-other` | server-witness | 1 | server-witness
F27-extra-path | serverLog += `{path:'/evil.js',status:200,run:nonce}` | server-witness | 1 | server-witness
F28-cdp-product | host.cdpProduct → `HeadlessChrome/155.0.8059.84` | host-identity | 1 | host-identity
F29-chromium-major | host.chromium → `Chromium 156.0.8059.84 Arch Linux` | host-identity | 1 | host-identity
F30-sweep-error | teardown.sweepError null → `ps exited 1` | survivors | 1 | survivors
F31-curl-zero | teardown.postKillCurl.fixture 7 → 0 | closed-ports | 1 | closed-ports
F32-probe-open | teardown.portProbes.devtools `closed` → `open` | closed-ports | 1 | closed-ports
F33-midrun-zero | sweeps.midRun 13 → 0 | launch-witness | 1 | launch-witness
F34-midrun-one | sweeps.midRun 13 → 1 (count falsified, still > 0) | (accept — only > 0 witnessed) | **0** | [] **FORGED GREEN**
F35-failures | failures [] → `[{id:'drive-error',detail:'x'}]` | failures | 1 | failures
F36-predicate-off | predicate true → false | producer-verdict | 1 | producer-verdict
F37-hypothesis-off | wheelHypothesis `CONFIRMED` → `REFUTED` | producer-verdict | 1 | producer-verdict
F38-verdict-both-off | predicate false AND wheelHypothesis REFUTED (honest-looking refutation of clean data — polarity both ways) | producer-verdict | 1 | producer-verdict
F39-launch-token | host.launchToken → `deadbeefcafe` | (accept — token unwitnessed) | **0** | [] **FORGED GREEN**
F40-proto-version | host.cdpProtocolVersion `1.3` → `2.0` | (accept — unwitnessed) | **0** | [] **FORGED GREEN**
F41-stderr-head | host.stderrHead `` → `simulation stable` | (accept — unwitnessed) | **0** | [] **FORGED GREEN**
F42-shot-name | legs[0].shot `start.png` → `other.png` | shot-records+shot-bytes | 1 | shot-records, shot-bytes, nonce-pixels, scroll-pixels, leg-witness (missing file cascades)
F43-digest-lie | legs[0].shotSha256 → 64×`f` (disk bytes untouched) | shot-bytes | 1 | shot-bytes
F44-bytes-lie | legs[0].shotBytes 6332 → 6333 | shot-bytes | 1 | shot-bytes
F45-witness-rgb | legs[5].witnessRgb [160,170,180] → [161,170,180] | leg-witness | 1 | leg-witness
F46-extra-entry | 6th wheellog entry appended (seq 6) | 7 length-clauses | 1 | wheellog-sequence, delta-y-passthrough, delta-mode-pixels, trusted-fields, cancelation, target-binding, scroll-event-witness
F47-drop-entry | wheellog[4] removed (4 entries) | 7 length-clauses | 1 | same 7 as F46
F59-viewport | fixture.deviceScaleFactor 1 → 2 | loopback-origin | 1 | loopback-origin
F48-one-by-one | start.png replaced by 1×1 white PNG | shot-bytes (+pixel cascade) | 1 | shot-bytes, nonce-pixels, scroll-pixels, leg-witness
F49-borrowed-same-scroll | down1.png bytes ← up1.png bytes (same scrollY 120), digest truthful | leg-witness | 1 | leg-witness
F50-borrowed-cross-scroll | released.png bytes ← start.png bytes (scrollY 0 vs 240), digest truthful | scroll-pixels+leg-witness | 1 | scroll-pixels, leg-witness
F51-grid-cell | up1.png nonce-grid cell (row 7, col 31) centre colour inverted, digest truthful | nonce-pixels | 1 | nonce-pixels
F52-band-sample | down2.png band sample (1000,180) → [1,2,3], digest truthful | scroll-pixels | 1 | scroll-pixels
F53-witness-colour | released.png witness point (1000,625) → [0,0,0], digest truthful | leg-witness | 1 | leg-witness
F54-cropped | down2.png cropped to 640×450 top-left, digest truthful | shot-bytes (+sample cascade) | 1 | shot-bytes, scroll-pixels, leg-witness (nonce-pixels PASSES: grid fits the crop)
F57-truncated-json | receipt.json truncated mid-object | exit 2 usage refusal | 2 | — (counter prints `{error:'usage',detail:'receipt unreadable'}`)
F58-empty-shotdir | `--shot` points at an empty dir (committed receipt untouched) | shot-bytes+nonce-pixels+scroll-pixels+leg-witness | 1 | those 4

Totals: 56 receipt/shot forgeries + 1 invocation forgery (F58) + baseline + 2 legit-odd + 1 CLI demo. forgedGreen = **9** / 56 (46 refused exit 1, 1 refused exit 2):
`F06-origin-port, F07-argv-conflict, F20-ts-big, F24-favicon-drop, F25-favicon-200, F34-midrun-one, F39-launch-token, F40-proto-version, F41-stderr-head`.

Prediction audit: refusal/accept direction correct 56/56 (every predicted refusal was
refused — 46 exit 1, F57 exit 2 as pre-registered; every predicted green was green).
Finding ids matched exactly in 52/56; four
supersets/cascades (F42, F48, F54: undersized/missing shot nulls out every pixel check;
F10: predicted scroll-pixels did NOT fire — aliased, Findings 8). F57 is the exit-2
usage class, not a named check.

## Legit-but-odd pair (opposite direction)

- G01-same-nonce-twice: serverLog carries the same `/?run=<nonce>` entry twice →
  exit 0, findings []. **Verdict right**: the counter binds existence of a `/` entry
  with status 200 and run=nonce; a duplicated entry is still a true log shape and
  nothing in the schema promises uniqueness. (Cross-run nonce reuse is likewise
  unregistered by design — the counter verifies a receipt, not a run registry.)
- G02-extra-unused-png: shot dir gains `bonus.png` (copy of start.png) named by no leg →
  exit 0, findings []. **Verdict right**: the counter loads exactly `legs[i].shot`
  names; an unnamed file is outside the receipt's claim and is never read, so it can
  forge nothing. Corollary worth recording: the counter never enumerates the shot dir;
  completeness comes from the receipt's own leg list + digests, which is sufficient
  here because every named file is byte- and pixel-verified.

## Check census — checks no forgery can reach

None. All 29 named checks were triggered by at least one of my forgeries:
schema (F01), nonce-binding (F03), driver-binding (F04), fixture-binding (F02/F05),
loopback-origin (F59), launch-guards (F08), legs-shape (F09), scroll-arithmetic (F10),
wheellog-count (F11), wheellog-sequence (F12/F46/F47), delta-y-passthrough (F13),
delta-mode-pixels (F14), trusted-fields (F15/F16/F21), cancelation (F17),
target-binding (F18/F19), scroll-event-witness (F17/F22/F46/F47), shot-records (F42),
shot-bytes (F42/F43/F44/F48/F54/F58), nonce-pixels (F02/F42/F48/F51/F58),
scroll-pixels (F42/F48/F50/F52/F54/F58), leg-witness (F42/F45/F48/F49/F50/F53/F54/F58),
server-witness (F02/F26/F27), host-identity (F28/F29), survivors (F30),
closed-ports (F31/F32), launch-witness (F33), failures (F35), producer-verdict
(F36/F37/F38), page-final-state (F23).

## Findings

1. **MEDIUM — server-witness does not pin the favicon entry.** Dropping the
   `/favicon.ico` entry entirely (F24) or lying its status 404 → 200 (F25) both reach
   green, yet every real run of this fixture produces exactly one `/favicon.ico` 404
   (committed smoke log; the fixture server serves no favicon, Chromium always asks).
   The check's `every()` whitelist over remaining entries and its `some()` existential
   over `/` leave the favicon unconstrained, so a receipt describing an impossible
   server transcript is accepted. Evidence:
   `.ufo/waves/round-64/w1/R64ExecNeg/work/F24-favicon-drop/`, `…/F25-favicon-200/`.
   Command: `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs .ufo/waves/round-64/w1/R64ExecNeg/work/F24-favicon-drop/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot .ufo/waves/round-64/w1/R64ExecNeg/work/F24-favicon-drop --json` → exit 0.
2. **LOW — loopback-origin never binds the port.** `fixture.origin` port 18481 → 12345
   stays green (F06): the regex accepts any port and `serverLog` entries carry no
   host/port, so the origin→server binding is nonce-only. A receipt can name a
   different local port than the one that served the run.
   Evidence: `…/work/F06-origin-port/`, same command shape → exit 0.
3. **LOW — launch-guards is subset-only.** Appending `--force-device-scale-factor=2`
   while `--force-device-scale-factor=1` is still present stays green (F07). A receipt
   can thus describe an argv whose re-execution would render at deviceScaleFactor 2
   (Chromium honours the last flag) and would then fail shot-bytes only if actually
   run — the counter itself blesses the contradiction.
   Evidence: `…/work/F07-argv-conflict/` → exit 0.
4. **LOW — launch-witness is presence-only.** `sweeps.midRun` 13 → 1 stays green (F34);
   the count is falsifiable down to any positive value. Evidence: `…/work/F34-midrun-one/` → exit 0.
5. **LOW — wheellog timestamps are unwitnessed beyond finite ≥ 0.** `ts` 528 → 99999 is
   green (F20); `ts` −5 is refused (F21). Consistent with the C1 design declaration
   that cross-run agreement excludes `wheellog-minus-ts`, but the counter's own green
   surface does include falsified timestamps. Evidence: `…/work/F20-ts-big/` → exit 0.
6. **LOW — three host fields are unwitnessed.** `host.launchToken` (F39),
   `host.cdpProtocolVersion` (F40), `host.stderrHead` (F41): arbitrary rewrites stay
   green. None is load-bearing for the domain claim, but a forged receipt can populate
   them with anything. Evidence: `…/work/F39-launch-token/`, `…/F40-proto-version/`,
   `…/F41-stderr-head/` → all exit 0.
7. **LOW (advisory, CLI surface) — `--expect-driver-sha256` is never compared.** The
   counter parses the flag and hex-checks it, then ignores it: running the committed
   receipt with `--expect-driver-sha256 000…0` exits 0 (C01 in results.json).
   driver-binding still ties the receipt to the bytes of whatever `--driver` file is
   passed, so the scored path is safe (verify-live computes and passes the sha of the
   driver it runs), but standalone counter use would bless a receipt built against a
   rogue driver file if the caller skips the pin comparison. Exact command:
   `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs .ufo/waves/round-64/controls/smoke/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 0000000000000000000000000000000000000000000000000000000000000000 --shot .ufo/waves/round-64/controls/smoke --json` → exit 0.
8. **INFO — scroll-pixels aliases ΔscrollY = 60 at the fixed sample column.** For
   scrollY 180 vs 240, all four samples at x=1000, y∈{60,180,300,420} map to band
   indices 2,3,4,5 in both cases (`floor((scrollY+y)/120)`), so F10's lie was refused
   by scroll-arithmetic alone; the pixel witness adds no independent signal for 60 px
   shifts at these sample points (120 px shifts are caught).
9. **INFO — nonce-pixels is not a completeness witness.** A 640×450 crop keeps the
   entire 136×40 nonce grid, so F54 still passes nonce-pixels; refusal comes from
   shot-bytes dimensions + out-of-range band/witness samples. Cell sampling also only
   reads each 4×4 cell's centre pixel.
10. **INFO — wheellog-count pins fields, not the array.** Adding/removing a wheellog
    entry leaves wheellog-count green (per-leg `wheellogLen` fields still match the
    constants); refusal arrives via the six `wl.length === 5` clauses plus
    scroll-event-witness (F46/F47, 7 findings each).
11. **INFO — legs array order is presentation.** A full-object swap of legs[1]/legs[2]
    is refused by legs-shape alone (F09); all content-keyed checks stay green because
    each object carries consistent name/shot/digest fields. Correct behaviour for an
    order-sensitive schema.

Honesty notes: baseline positive control ran green before the battery (exit 0,
findings []); frozen pins re-hashed after all runs and unchanged (driver
`1ff560cc…2db5`, counter `5cc3c8dd…01b7`, png `3f6a75de…f0`, smoke receipt
`7dc5a247…d148` — all equal to claims.json pins). No tooling installed (node v24.21.0
already present; no pacman use). All scratch under `/fast/scratch/hyaku/tabi-r64/R64ExecNeg/`,
removed before yield; the retained evidence above was copied into the lane first.

## Verdict

The counter holds the measured domain: **no single-change forgery fakes the wheel/scroll
physics, the scroll-encoded pixels, the nonce grid, the per-leg witness, the run-bound
server log nonce, or the driver/fixture digests** — 0/56 domain forgery, and the r63
failure classes (1×1 PNG, borrowed shots, missing shots) are re-refused by the
production CLI in this harness (F48/F49/F50/F58). The acceptance surface is not empty
for provenance metadata: **forgedGreen = 9**, all single-field provenance lies (favicon
transcript ×2 [the one check-level gap worth a next-generation fix], origin port,
argv superset, midRun count, ts, launchToken, cdpProtocolVersion, stderrHead); 2
MEDIUM + 7 LOW, nothing HIGH. All 29 checks are reachable by negative evidence; the
declared-matrix target forgedGreen = 0 is untouched by this result (that matrix is the
frozen generator's own set), but an independent set demonstrates the counter accepts
impossible server transcripts — recommend pinning the favicon entry (presence + 404)
in any next generation of this counter.
