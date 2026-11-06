FALSIFIED

# R70Critic — attack on the frozen C1/C2 claims (tabi round 70, w1)

Seat: R70Critic (leaf critic; no delegation). Lane HEAD `bbdbf62f`; base `90b9ff04`; freeze `7c42ef25` (parent `b5d77c4c`); claims sha256 `6746135d…02d33b`. All ten freeze digests recomputed at HEAD and byte-equal (`receipts/pins-actual.txt` vs `receipts/pins-freeze.txt`, sorted diff 0). Write scope: this directory and `/fast/scratch/hyaku/tabi-r70/R70Critic` only; no lane/script/corpus edits; scratch deleted after receipts were copied. Claims are attacked, not amended.

## Verdicts

| claim | verdict | basis |
|---|---|---|
| C1 `chromium-synth-tap-gesture-linux` | **FALSIFIED** (predicate (b)/(d); the physical capability is real) | C1-SYNTHTAP-LIVE (b) can be greened without re-deriving the capability: (A) an inherited `NODE_OPTIONS` preload inside the **real** verifier → exit 0, `pinSource: frozen`, receipts copied from the committed evidence, driver bytes unchanged; (B) a post-pin driver swap → exit 0 with 26/24 ms "runs" and a do-nothing driver. (d) is false at HEAD: `SCORECARD.md` has no tap/round-70 capabilities row (`grep -c -i tap` = 0). Counter (a) and battery (c) do hold: 84 checks clean, 95/95. |
| C2 live verifier for r69 | **HOLDS-WITH-LIMIT** (operability move real; claimed forgery discrimination not general) | The command exists and works (L1 scored exit 0; R70Exec2 independent exit 0; the r69 counter alone accepts a rewritten replay, the verifier executes). But the same env/TOCTOU bypass greens the real C2 verifier with receipts copied from the r69 evidence, and the evidence leg is form-only. The 31/31 controls cover neither. |

## C1 — coverage capability `chromium-synth-tap-gesture-linux`

### C1.1 Novelty: holds

At base `90b9ff04`, `git grep -n -i 'synthesizeTapGesture\|tapCount\|tap gesture' 90b9ff04 -- corpus scripts SCORECARD.md` exits 1 (no hits; `receipts/base-tap-grep-scoped.txt`). The only base hits are raw source dumps under `.ufo/waves/{33,44,50-54,…}/sources/` (e.g. `.ufo/waves/round-44/sources/browser_protocol.json:14808`, `.ufo/waves/round-33/w1/ScribeSrcSession/web_view_impl.cc.dec:2094`); no knowledge note, receipt or capability row. `census/start.txt` has no tap row. The claim's "no prior tabi note, receipt or capability row" is accurate; the command was visible in prior source dumps, so the *new* ground is the measured runtime delivery, not the command's existence. The note now cites S175 (`corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md:1`).

### C1.2 (a) counter and (c) battery: hold

- Scored receipt `0a51f3a6…d631`: `node scripts/check-synthtap-r70.mjs --receipt corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json --expect-driver-sha256 704efab8…dff9577 --json` → exit 0, `verdict: clean`, 84 checks, no findings (`receipts/c1-scored-counter.json`).
- A receipt with only `nonce`, `nonceOnPage` and `serverLog[].run` rewritten passes the same counter: exit 0, 84 clean (`receipts/c1-forged-receipt.json`, `receipts/c1-forged-counter.json`). This is the counter's declared limit (`controls/c1/counter-accepts-rewrite`); the battery's laundered cases clear the degenerate flag/verdict/recompute legShape but do not rewrite `cdpSendLog` to add fabricated tap calls, so a forger who does that also passes. The counter is form-only by declaration.
- Battery on the scored receipt with the three committed laundered receipts: exit 0, positive clean, 95/95, `coverageGap: []` (`receipts/c1-negatives-battery.json`). A copy of the controls evaluator (the lane evaluator would rewrite `summary.json` outside this seat's write scope) exits 0 with 31/31 rows holding (`receipts/evaluate-controls.out`, `receipts/controls-summary.json`).

### C1.3 (b) live verifier: do-nothing reach (the falsifier)

A clean real run first: `node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <ABS> --json` → exit 0, `predicate: true`, `pinSource: frozen`, no findings, two real runs 12 456 / 12 487 ms, all bindings true, cross-run and evidence agreement true (`receipts/c1-clean-verifier.json`). R70Exec1 independently reproduced this at exit 0 and also ran the driver + counter (`w1/R70Exec1/verify.json`, `w1/R70Exec1/independent-run/`). The capability is real. The predicate is nevertheless not an execution oracle.

**Attack A — cheapest, no lane write, frozen driver bytes unchanged.** The verifier spawns the driver with `spawnSync(process.execPath, [driver, …])` and no `env` option (`scripts/verify-live-r70.mjs:158`), so `NODE_OPTIONS` is inherited. A preload (`receipts/preload-receipt.cjs`) detects the frozen driver's main script, patches `fs.writeFileSync` for the `--out` receipt with a copy of the committed evidence rewritten to the drawn nonce/ports/digest/launch token, and forces exit 0. Run:

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
NODE_OPTIONS="--require <scratch>/preload-receipt.cjs" \
FORGED_TEMPLATE="$PWD/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json" \
node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <short> --json
```

Result (`receipts/c1-env-verifier.json`): exit 0, `predicate: true`, `pinSource: frozen`, `findings: []`, runs 12 614 / 12 657 ms, all bindings true, cross-run/evidence agreement true. The driver's sha256 is `704efab8…dff9577` before **and** after (`scripts/chrome-cdp-synthtap-round70.mjs` never changed); the freeze digests pass. The forged run-a receipt (`receipts/c1-env-forged-run-a.json`) equals the committed evidence on `events`, `legs`, `cdpSendLog`, `legShape` and `teardown`; only `nonce`, `serverLog`, `fixture.origin`, ports, `launchToken`, timestamps and `driverSha256` were rewritten (`receipts/c1-env-forged-vs-evidence.json`). The live run's own receipt was overwritten; the verifier never compares the driver's stdout to the receipt.

**Attack B — pure do-nothing, no browser.** Copy the lane's scripts/evidence to scratch; start the copied verifier; when the evidence counter starts (blocked 2 s by a preload so the swap is deterministic), replace `scripts/chrome-cdp-synthtap-round70.mjs` with `receipts/do-nothing.mjs`; the verifier's pin read happened before the spawn. `receipts/run-attack.sh` + `receipts/preload.cjs` + `receipts/do-nothing.mjs` reproduce it. Result (`receipts/c1-toctou-verifier.json`): exit 0, `predicate: true`, `pinSource: frozen`, no findings, runs **26 / 24 ms**, all bindings true, agreement true; the driver path executes the do-nothing script and the receipts equal the evidence (`receipts/c1-toctou-forged-run-a.json`, `receipts/c1-toctou-vs-evidence.json`). No Chromium is launched by that driver.

Why both pass: the verifier hashes the driver at `scripts/verify-live-r70.mjs:122` and then executes the path at `:158`; it never re-hashes or snapshots the executed bytes. The `driverDigest` binding (`:167`) compares the receipt's claimed digest to the pre-read pin, not to the executed file. `wallMs` is recorded (`:160`) but never checked (R70Review2 F4), so 24 ms is accepted as a run. The claim's limit — "a receipt passes only if it names the executed binary and that binary is the frozen driver" — is false in B (the executed binary is the do-nothing script) and false in A (the executed binary is frozen but the receipt fields are not its own). `pinSource: frozen` is reported in both cases.

The committed controls miss both: `controls/c1/tampered-driver` (and c2) changes the driver **before** the verifier starts (caught by the pin); every forger control uses `--driver`/`--driver-sha256` override, and an override can never exit 0 (`scripts/verify-live-r70.mjs:116,188`); none injects `NODE_OPTIONS` or swaps after the pin read. `override-copy-of-frozen` exit 4 is a policy refusal, not a measurement; `forger-rewrite-full-honest` is refused because the live counter is run with the frozen pin (`:174`, `expectSha = prof.driverSha256`), not because the receipt's content is fabricated (R70Review2's control table). R70Review2 classified the hash-then-spawn race as residual/out-of-model (F6); this reproduction shows it is a **false pass**, not fail-closed.

### C1.4 Leg shapes: holds-with-limit, not overfit to one run

The frozen `SHAPE` (`scripts/check-synthtap-r70.mjs:31-44`) is fit to the host/build/fixture: mouse/default 45–150 ms, hold 395–600 ms, details `1`/`[1,1]`, default/touch `TOUCH_TAP` with no click, outside `-32602`. Observed: scored 49.9/400/50/50/50.1; R70Exec1 independent 49.9/400/50/50/50.1; live a/b 50/400/50.1/49.9/50; our clean verifier runs; R70Exec3's 24 variants (`w1/R70Exec3/summary.txt`) reproduce the frozen config's shapes: `tapCount:2` two detail-1 clicks/no dblclick, `tapCount:3` `[1,1,1]`, `duration:0` immediate, `dispatchMouseEvent clickCount:2` `[1,2]` + dblclick (a different producer, correctly a look-alike). The detail values are source/mechanism-backed (S174/S175), not one-run noise. Limits: the `hold` upper bound 600 ms is the only load-sensitive leg; every observed run is 400.0 and no heavy-load stress was run (shared host); the `default`/`touch` no-click is a measured property of this fixture/config (touch-emulation variants in R70Exec3 differ, and the note's "Not established" section scopes them out). Within "this host's Chromium 155", the shapes are not overfit to a single host run; they are overfit to the declared host/build/config.

### C1.5 (d) SCORECARD row: false at HEAD

`grep -c -i tap SCORECARD.md` = 0; `grep -n 'Round 70' SCORECARD.md` = none; the `## Capabilities` table at `SCORECARD.md:381-385` is the placeholder `— none yet —`; the round-69 table is at `SCORECARD.md:3645-3649`. The knowledge note is committed (`63dcf7c2`) and cites S175, so the note half of (d) holds; the SCORECARD row is absent. Leg (d) is false at `bbdbf62f`. Adding the r70 row is an integration action for the sole integration owner (L1), not a claim amendment; until it lands, the claim's own kill rule "any predicate leg (a)-(d) false at the lane tip" is triggered.

## C2 — operability live verifier for `chromium-synth-scroll-gesture-linux`

### C2.1 Operability move: holds (not bookkeeping)

Before: no verifier for r69, exit 1 `MODULE_NOT_FOUND` (`controls/c2/donothing-base`). After: `node scripts/verify-live-r70.mjs --profile synthscroll-r69 --scratch <ABS> --json` exits 0 with `predicate: true`, `pinSource: frozen` — L1 `scored/c2-verify-live-L1.json`, independent R70Exec2 `w1/R70Exec2/verify.json` exit 0, and our own C2 runs below. The r69 counter alone accepts a rewritten replay (`controls/c2/r69-counter-accepts-rewrite` exit 0; we reproduced the r69 counter clean, 62 checks, on the rewritten receipt `receipts/c2-rewritten-evidence.json`). The verifier executes the pinned r69 driver twice cold on drawn nonces/ports and checks run binding/cross-run — a real execution/authenticity addition, not a re-read of the same receipt. The predicate's independent-seat leg (b) is satisfied in the worktree by R70Exec2; it is not in `scored/`, so the L1 must land or cite it in the closure.

### C2.2 Forgery discrimination: real for the committed classes, not general

The 31/31 controls hold (`receipts/controls-summary.json`, `receipts/evaluate-controls.out`): `forger-replay`/`rewrite` exit 1 with run-binding findings; `forger-rewrite-full-lying` exit 1 `run-a/b-driverDigest`; `-honest` exit 1 `counter-a/b`; `override-copy-of-frozen` exit 4; degenerate wrappers exit 1 `counter-a/b`; `no-run` exit 1; `tampered-driver` exit 2; `scratch-too-long` exit 2; positive exit 0. Three caveats:

1. Every forger control uses the `--driver` override; an override can never exit 0 (`scripts/verify-live-r70.mjs:116,188`). `override-copy-of-frozen` exit 4 is a policy refusal, and the forger rows test the override contract plus the counter, not the scored path.
2. `forger-rewrite-full-honest` is refused by `driver-sha256-pin` because the live counter is called with the frozen pin (`:174`), not because its content is fabricated; the content-level catch is the degenerate trio's counter findings (R70Review2's table).
3. The evidence leg is form-only: replacing the committed r69 evidence with the counter-clean rewritten replay (`controls/c2-receipts/forger-rewrite-run-a.json`; r69 counter 62 checks clean) and running the verifier normally → exit 0 with two real runs 10 556 / 10 421 ms and agreement true (`receipts/c2-rewritten-evidence-verifier.json`). The verifier checks the evidence only through the counter; the live runs are real, so the capability is still re-derived, but exit 0 does not certify evidence provenance. This is R70Review2 F1 for r69.

The env/TOCTOU bypass applies to C2 on the same code path. `NODE_OPTIONS="--require <scratch>/preload-receipt-r69.cjs"` on the **real** verifier, template = committed r69 evidence, → exit 0, `predicate: true`, `pinSource: frozen`, no findings, runs 10 415 / 10 428 ms; the forged run-a equals the evidence on `events`, `legs`, `cdpSendLog`, `pageState`, `teardown`, `plan` (`receipts/c2-env-vs-evidence.json`); the r69 driver sha is `13ea3f8a…abce3` before and after; the receipt claims that digest; the live run's receipt was overwritten (`receipts/c2-env-verifier.json`, `receipts/c2-env-forged-run-a.json`). The post-pin swap (Attack B) is the same verifier code path with the r69 driver; we did not repeat the full two-run swap for C2 because the C1 reproduction already proves the mechanism (`:122`, `:158`, `:167` are profile-independent). The claim's limit — "the verifier … trusts the frozen driver's own receipt fields … once the executed binary is the frozen driver — the pin is the root of trust" — is not satisfied: in the env attack the fields are not the driver's own; in the TOCTOU the executed binary is not the frozen driver. The committed controls do not cover either, and their subset evaluator would not catch a wrong-reason refusal as long as the expected id is present.

## Impacted axes

- **C1 coverage**: novelty holds and the physical capability is corroborated (scored run, R70Exec1, our clean verifier); the live predicate is not an oracle and (d) is false at the tip. The coverage row should not be read as "the verifier proves the capability" until (d) and the execution binding are fixed.
- **C2 operability**: the 0→1 runnable verifier is a real operability move, not bookkeeping; its output is not a standalone oracle under same-user env/write, so the claimed forgery discrimination is overstated.
- **Calibration**: the 31/31 control set misses post-pin swap, inherited preload, and receipt-vs-stdout divergence; R70Review2 F2 (existedBefore always false), F3 (crossRun naming), F4 (wallMs unchecked) and F6 (hash-then-spawn) are relevant; this reproduction raises F6 from "residual" to "false pass under same-user control".

## Smallest safe correction (next round; no amendment to the frozen claim)

1. **Bind execution to bytes.** After `fs.readFileSync(driver)` and the pin check (`verify-live-r70.mjs:122`), write the exact bytes to a private scratch path and spawn that snapshot; re-hash the snapshot after the runs; do the same for the counter. This closes the post-pin swap and the counter swap.
2. **Sanitize the child environment.** Spawn the driver and counter with an explicit env that excludes `NODE_OPTIONS`, `NODE_PATH`, `LD_PRELOAD`, `LD_LIBRARY_PATH`, `DYLD_*`; refuse (exit 2) if the verifier's own env carries them, or re-exec under `env -i` with only PATH/HOME/TMPDIR. This closes the preload receipt patch.
3. **Cross-check the driver's stdout** against the receipt (devtools browserId/port, `legs[].elapsedMs`, teardown, `startedAt/finishedAt`) and add a `wallMs` lower bound (F4). A preload can patch stdout too, but with 1/2 it raises the bar.
4. **Add negatives** for the post-pin swap, the `NODE_OPTIONS` preload, the evidence swap, and the stdout-vs-receipt mismatch; one negative per new check. The existing `tampered-driver` only covers a pre-run byte change.
5. **Integration:** add the r70 `SCORECARD.md` capabilities row (round-70 section) citing the committed note/S175; record R70Exec2's `w1/R70Exec2/verify.json` and the scored evidence sha in the closure (R70Review2 F1).

Because the claims/instruments are frozen, items 1–4 cannot be applied to this round's verifier; the claim's live leg should not be admitted as an un-forgeable oracle. The physical capability is real; the evidence predicate is not.

## Reproductions and receipts

All probes ran under `/fast/scratch/hyaku/tabi-r70/R70Critic` (deleted after the receipts below were copied); no lane, script, corpus or sibling file was modified. The attack scripts and the evidence copies are beside this report in `receipts/`.

- Pins: `receipts/pins-actual.txt`, `receipts/pins-freeze.txt` (sorted diff 0), `receipts/pins-diff.txt` (unsorted order note).
- C1 scored counter: `receipts/c1-scored-counter.json`; forged-nonce counter: `receipts/c1-forged-counter.json`; battery: `receipts/c1-negatives-battery.json`; controls evaluator copy: `receipts/evaluate-controls.out`, `receipts/controls-summary.json`.
- C1 clean verifier: `receipts/c1-clean-verifier.json`. C1 env attack: `receipts/c1-env-verifier.json`, `receipts/c1-env-forged-run-{a,b}.json`, `receipts/c1-env-forged-vs-evidence.json`, `receipts/preload-receipt.cjs`. C1 TOCTOU: `receipts/c1-toctou-verifier.json`, `receipts/c1-toctou-forged-run-{a,b}.json`, `receipts/c1-toctou-vs-evidence.json`, `receipts/run-attack.sh`, `receipts/preload.cjs`, `receipts/do-nothing.mjs`.
- C2 env attack: `receipts/c2-env-verifier.json`, `receipts/c2-env-forged-run-{a,b}.json`, `receipts/c2-env-vs-evidence.json`, `receipts/preload-receipt-r69.cjs`. C2 rewritten evidence: `receipts/c2-rewritten-evidence-verifier.json`, `receipts/c2-rewritten-evidence.json`.
- Leg (d) / novelty: `receipts/scorecard-tap-count.txt` (0, exit 1), `receipts/scorecard-round70-heading.txt`, `receipts/lane-head.txt` (HEAD `bbdbf62f`; note at HEAD exit 0), `receipts/base-tap-grep.txt`, `receipts/base-tap-grep-scoped.txt` (exit 1).
- Command lines (paths shortened; the verifier draws its own ports and nonces):
  - `node scripts/check-synthtap-r70.mjs --receipt corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 --json` → 0.
  - `node scripts/negatives-synthtap-r70.mjs --real <scored> --expect-driver-sha256 704e… --work <ABS> --laundered controls/c1-receipts/degenerate-{js-click,dispatch-mouse,skip-touch}.json --json` → 0.
  - `node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <short ABS> --json` → 0 (clean; `c1-clean-verifier.json`).
  - `NODE_OPTIONS="--require <ABS>/preload-receipt.cjs" FORGED_TEMPLATE=<scored> node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <short ABS> --json` → 0 (`c1-env-verifier.json`).
  - TOCTOU: copy the lane scripts/evidence to scratch; run the copied verifier; on the evidence-counter child (blocked by `preload.cjs`), `cp do-nothing.mjs <lane-copy>/scripts/chrome-cdp-synthtap-round70.mjs`; `run-attack.sh` is the executable form → 0 (`c1-toctou-verifier.json`).
  - C2: `node scripts/verify-live-r70.mjs --profile synthscroll-r69 --scratch <short ABS> --json` → 0 (L1/R70Exec2); `NODE_OPTIONS="--require <ABS>/preload-receipt-r69.cjs" FORGED_TEMPLATE=corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json node scripts/verify-live-r70.mjs --profile synthscroll-r69 --scratch <short ABS> --json` → 0 (`c2-env-verifier.json`); rewritten evidence: replace the copy's r69 evidence with `controls/c2-receipts/forger-rewrite-run-a.json` and run the copied verifier normally → 0 (`c2-rewritten-evidence-verifier.json`).

## Honest limits

- The clean physical capability is real: our clean verifier exit 0 (two real 12.4 s runs), R70Exec1's independent verifier + driver + counter (all exit 0), R70Exec3's variants, the scored receipt's 84 clean checks and the 95/95 battery. The attack does not show the capability is absent; it shows the live predicate can be satisfied without re-deriving it.
- The env attack requires the verifier's caller to set `NODE_OPTIONS` (a same-user environment control); the TOCTOU requires a same-user write to the driver path between the pin read and the spawn (and a restore, since the verifier does not re-hash). A passive receipt file cannot pass the verifier: the `--driver` override exits 4, and the counter alone is form-only by declaration.
- The `hold` upper timing bound (600 ms) was not stress-tested under heavy load; all observed values were 400.0. The `default`/`touch` no-click is measured for this fixture/config, not explained.
- The lane's `evaluate-controls.mjs` was not run in place (it rewrites `controls/summary.json`, outside this seat's write scope); a copy was run and exits 0 with 31/31. The lane's committed `summary.json` says 31/31.
- The SCORECARD row may be added by the L1 before adjudication; this finding is at HEAD `bbdbf62f`. The independent-seat verifier outputs are in the untracked `w1/` tree; the L1 is the sole integration owner and must land/cite them.
