# R67Critic1 — round 67 wave w1 critic report (read-only attacks)

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Base 5400136b. No lane file was edited; no git mutation; no tool installed. Evidence copies: `.ufo/waves/round-67/w1/R67Critic1/evidence/`. Scratch deleted.

Verdict in one line: none of the three do-nothing controls is a valid negative control as the freeze is currently specified. C1's rule is unsatisfiable on the honest ledger; C2's spec-literal guard breaks its own selftest and exit 1 is not discriminating; C3's pin is caller-supplied and its red control is stale.

## Attacks

### C1 (adjacency; v23 conjunct and flip sweep)

**A1. The `no-tabi-ground` clause refuses every honest no-tabi row. The r66 unmutated ledger is red under the rule.**
- v22 forces every delta line-row quote to be a whole BG-hit line: `c1-adjacency-host-v22.mjs:215` (`if (rowFor[6] !== linesArr[ln - 1]) add('delta-quote-not-whole-line'…)`) and `:262-263` (`isHit` ⇒ `add('delta-line-invented')`). So a line row whose quote has zero BG words cannot pass v22.
- Measured on `round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` (awk, column 1 = type, 7 = quote, 8 = disposition, BG list copied from v22:34): 149 line rows; quote contains a BG word in **149/149**: no-tabi-ground 95/95, overlap-declared 5/5, contested-open 49/49.
- Example, row 3 of the ledger: `audio-shokunin  PROVINCE.md:4  …  "soundtrack (motifs, loops, stems, adaptive layers) — verified by headless"  no-tabi-ground`. `headless` is a BG word.
- Simulated v23 (v22 plus the conjunct exactly as the Executor1 spec states it; copy at `evidence/v23sim.mjs`) on the UNMUTATED r66 ledger: exit 1, `predicate False`, `findingCount 95`, all `delta-disposition-evidence` (e.g. `audio-shokunin:PROVINCE.md:4: no-tabi-ground`). Command: `node evidence/v23sim.mjs --rev 5400136b… --repo <lane> --fleet /home/vgpnk/Projects/shokunin --snapshot round-66/measure/snapshot-live-r66.tsv --audit round-66/c1/adjudicated/adjacency-host-audit-r66.tsv --delta round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --json` → exit 1 (`evidence/v23sim-unmutated.json`).
- Do-nothing v22 with the same arguments: exit 0, `predicate true`, `findingCount 0` (`evidence/v22-unmutated.json`). So the frozen meter is green on the honest ledger and the conjunct turns it red.
- Consequence: C1 cannot be green on the r66 ledger under the rule as written. Green would require re-adjudicating the 95 no-tabi rows, or changing the rule. Either is an L1 decision, not a meter detail.

**A2. The flip sweep as worded ("each flipped row refused") counts all 298 flips as kills against a red baseline.**
- First run, predicate-based kill (`predicate !== true`): v23sim 298/298 killed, v22 0/298 killed. This overcounts: the sim's baseline is already red (95 findings).
- Second run, attributable kill (findings after flip > baseline findings, script `evidence/attrib.py`, output `evidence/attrib.stdout`, `evidence/attrib-summary.json`): **v23sim 54 attributable kills** (contested-open→no-tabi-ground 49, overlap-declared→no-tabi-ground 5), **244 red-but-not-attributable**; **v22 0 kills, 298 green-survive**.
- Freeze must define a kill as delta over the unmutated baseline, and must require the 244 non-killed flips (any flip to overlap-declared or contested-open) to stay green. Otherwise the sweep is unfalsifiable.

**A3. A refuse-everything meter scores 298/298 on the sweep; the only positive control that would catch it is impossible under the rule.**
- Under predicate-based kill, any meter that returns red for every delta row kills all 298 flips. The discriminator is the unmutated-green control, and A1 shows that control is red for the v23 rule. So the freeze currently has no non-trivial positive control for C1. The freeze must pin one: either (a) a re-adjudicated ledger in which all no-tabi rows are removed or reclassified (a changed ledger, so a different claim), or (b) a changed rule that the L1 freezes explicitly. Also, `no-tabi-ground` is only reachable by the v22 screen's hits, so the conjunct turns a screen hit into a veto.

**A4. The v22 do-nothing control is green on the r66 ledger, but only with the r66 ledger passed in.**
- `round-66/measure/README-do-nothing.txt` reports v22 at live heads: predicate false, 40 findings. That run used the UNCHANGED r62 ledger at rev 2816adb3. My run used the r66 ledger at rev 5400136b with `--audit/--delta` explicit: exit 0, 0 findings. Both facts are true; the freeze must pin `--audit`, `--delta` and `--snapshot` explicitly, or the control result depends on the argument defaults.

### C2 (calibration; receipt-provenance v3 → v4)

**A5. Red-before is real.** Escape fixture built under scratch: `outside.mjs` beside `repo/`; `repo/controls/matrix-escape.json` with `input.path = "../outside.mjs"` and sha256 of `outside.mjs`; companion `matrix-escape.command.json` and `good.stdout` present; plus an inside control `matrix-inside.json` (`instruments/a.mjs`).
- `node round-66/counters/check-receipt-provenance-v3.mjs --dir <controls> --repo <repo> --json` → **exit 0, `ok: true`, `failures: 0`**. Mechanism: `check-receipt-provenance-v3.mjs:90` candidate `path.join(repo, rel)` = `X/outside.mjs` (escapes), `:91-93` finds and digests it. Red-before confirmed (`evidence/v3-escape.json`).
- v3 selftest, unmodified: exit 0, verdict clean, 14/14 (`evidence/v3-selftest.json`).

**A6. The spec-literal v4 (escape guard on both candidates) breaks v3's own selftest. "No v3 selftest case changed" is unsatisfiable.**
- v3 selftest builds `root/repo` (`check-receipt-provenance-v3.mjs:120`) and `dir = root/controls` (`:124`), so the controls dir is OUTSIDE the repo. Case `matrix-input-relative-dir-base` (`:163`, `negate: true`) expects the dir-relative candidate to be a hit.
- Patched variant A (both candidates guarded, `evidence/v4sim-A-both.mjs`): selftest **exit 1, 13/14, FAIL `matrix-input-relative-dir-base`**. Fixture: exit 1, `[matrix-input "input escapes repo: ../outside.mjs"]`.
- Patched variant C (guard only the repo-base candidate, dir candidate unguarded; `evidence/v4sim-C-repo-only.mjs`): selftest **exit 0, 14/14**; fixture **exit 1, `[matrix-input "input escapes repo: ../outside.mjs"]`**. This is the only variant of the three that passes both gates. The freeze must pin it, or change the case explicitly. Executor2's "there should be none" is wrong.

**A7. Exit 1 plus `matrix-input` is not a discriminating assertion.**
- Variant B (drop the repo-base candidate; `evidence/v4sim-B-drop-repo.mjs`): selftest exit 1, 13/14 (FAIL `matrix-input-relative-repo-base`); fixture **exit 1 with the same check id**, but `[matrix-input "input absent: ../outside.mjs", matrix-input "input absent: instruments/a.mjs"]`. A degenerate fix passes "exit 1 + matrix-input" for the wrong reason.
- Required discriminating assertions (the freeze must pin these, not the exit code): (i) escape matrix → findings equal exactly `[{check:'matrix-input', detail:'input escapes repo: ../outside.mjs'}]`; (ii) the inside control `matrix-inside` → zero findings; (iii) the companion `matrix-escape.command.json` must exist (otherwise `matrix-command` adds a second finding and the count assertion fails for a non-escape reason); (iv) the v3 selftest case set is unchanged, or the one changed case is named in the freeze.

**A8. Scope gap: only relative inputs are guarded.** `check-receipt-provenance-v3.mjs:90` keeps `path.isAbsolute(rel) ? [rel]`, and the v4 spec keeps absolute inputs unchanged, so a matrix naming an absolute outside file still binds. The claim must read "relative escape repaired", not "repo escape repaired". The dir-relative candidate (variant C) remains unguarded by design, which the selftest relies on; the freeze must name that as a tradeoff. Not tested: `realpath` (symlink-inside-repo to outside) and a repo path that is itself a symlink. `realpath -- /home/vgpnk/Projects/shokunin/tabi-shokunin` returned the same path, so the lane is not symlinked; the fixture is under /fast and was not tested for this.

### C3 (coverage; hscroll driver, verifier, counter)

**A9. The pin does not bind the driver that produced the receipt. The verifier's trust root is caller-supplied.**
- Driver: `receipt.driverSha256 = sha256(readFileSync(SELF))` at `scripts/chrome-cdp-loopback-round67.mjs:259`. This is a self-report written by the producer; a forged receipt can carry any value. The counter cannot bind receipt→driver from the receipt alone.
- Frozen blob: `git show HEAD:scripts/chrome-cdp-loopback-round67.mjs | sha256sum` = `ac0561ac…70a0`, matching the pin. (HEAD = b5ebbb0c. `git cat-file -t 5400136b…:scripts/chrome-cdp-loopback-round67.mjs` → exit 128, file not in base.)
- Live verifier (`scripts/verify-live-r67.mjs`, untracked, `git status` `??`, in a directory the write scope forbids): the pin is read from the CLI (`:114-115`), compared to the driver file (`:120`), and the same CLI value is passed to the counter (`:144`). The counter's sha is recorded (`:137`) but never compared to a constant.
- Probe (scratch, deleted; outputs `evidence/modified-nonfrozen.json` and `evidence/frozen-wrongpin.json`): copy the driver, append one comment line, sha `888d3e0adf70…`; run `verify-live-r67.mjs --driver <modified> --expect-driver-sha256 888d3e0a… --no-run --json` → **exit 1, findings `['no-run']`**: no `driver-pin` finding. The modified driver passes the pin. With the frozen driver and the modified pin → exit 2, `['driver-pin']`. The pin check binds whatever the caller passes.
- Required: a constant `ac0561ac…70a0` inside the verifier (committed), compared before any spawn, and the counter must hash `--driver` against that constant, not against `receipt.driverSha256` or a CLI value. The live run (spawned by the verifier, nonce chosen by the verifier) is the only path that binds the process; the evidence receipt path is caller-supplied (`:138,:152`).

**A10. Paths to a green predicate without a browser; the negatives the counter must refuse.**
Source reviewed in full (`scripts/chrome-cdp-loopback-round67.mjs`, 436 lines).
- (a) catch at `:406` and teardown at `:275-295` push into the same `failures` array that `:432` reads. No catch path leaves `failures` empty; `:431` also reads `pageState` (`{}` initial, `:262`), so a throw before `:405` gives `undefined >= 4` → false. These paths are red. They are not the risk.
- (b) The real gap is the CDP endpoint: `:314` accepts any `/json/list` page whose `webSocketDebuggerUrl` is `ws://127.0.0.1:<devPort>/`; `:318-319` binds only "some process has the launch token in argv" (`sweepOnce`, `:138-151`); `:300` and `:303` run `/usr/bin/chromium` (hard-coded `:107`, `existsSync` only `:108-110`). Any process that serves CDP on devPort after the `:119` precheck and before the real child binds passes every page-side check. Narrow race, not demonstrated **[INFERENCE]**. Negatives: refuse if `host.stderrHead` lacks `DevTools listening on ws://127.0.0.1:<cdpPort>/devtools/browser/`; refuse if `sweeps.midRun < 1` or `sweeps.preLaunch !== 0`; refuse if `host.argv[0] !== '/usr/bin/chromium'`.
- (c) `hscrollHypothesis` at `:431` does NOT check: `serverLog` run binding (header claims it, `:28-29`); `witnessRgb` against the driver's `LEG_WITNESS` table (`:55-58`); `shotSha256` against the PNG bytes; `fixture.sha256`; `host.chromium`/`cdpProduct` non-empty; `teardown` fields; `driverSha256`; `scrollendlog` vs `scrollendsInLeg`. Counter negatives: refuse each.
- (d) Scroll-end conjuncts at `:422` use `>=`, so an extra scrollend in a leg passes. `:431` `scrollEvents >= 4` is aggregate. Counter: refuse per-leg scrollend counts ≠ expected (exact, with boundary = 0).
- (e) Interrupted branch `:296-297`: the SIGINT handler writes `predicate:false` and pushes `interrupted` into `failures`; `interrupted` itself is not in the receipt. Counter: refuse predicate true with any `failures` entry, and refuse `failures` containing `interrupted`. The handler cannot yield green (checked: the handler writes before `:432`).
- (f) Teardown: `:291-292` push into `failures` only when a closure condition fails. A teardown that throws before `:291` leaves `failures` unchanged, and `await teardown()` at `:407` rejects, so no receipt is written. Red, but the counter must treat "no receipt" as red, not as skip.

**A11. The nonce-on-pixels claim is false for the frozen driver's output.**
- Template CSS (`scripts/chrome-cdp-loopback-round67.mjs:187`) styles only `#noncegrid`; the cells emitted at `:225` are `<i style="left:…;top:…">` with no background, size or class rule. Cells are invisible.
- `cmp` of smoke1 vs smoke2 PNGs: `start.png` and all five other legs **byte-identical** across nonces `tabi-r67-smoke-one` and `tabi-r67-smoke-two`, though the SHA-256-derived grid bits differ (128 vs 131 set bits; first 32 bits `11100100001100000010011100111001` vs `11101111110111001000011100110001`).
- Decoded `measure/smoke2/start.png` (1280×900) with `counters/png-r67.mjs`: all 131 bit=1 grid cells sample **[0,0,0]**. Control: witness pixel (1000,620) = [12,24,36] and bands at x=60 → [255,0,0], x=180 → [0,128,0] decode correctly, so the sampler is valid.
- Required: the freeze must drop the pixel-nonce claim, or the counter's grid check is red on every honest run. The counter must not require grid bits from the frozen driver's PNGs.

**A12. The committed "red" control does not exercise the frozen predicate.**
- `measure/smoke1/receipt.json`: `driverSha256 ac72249e…` (not the pin), `predicate false`, `hscrollHypothesis REFUTED`, `failures []`. Its legs are `scrollLeft 0,120,240,120,1000,1000`, `scrollendsInLeg 0,1,1,1,1,0` (the same values as the green smoke2).
- Re-evaluating the frozen predicate's conjuncts on smoke1's own fields (shape, wheel entries, boundary zero, nonceOnPage, scrollEvents ≥ 4, scrollY 0; reimplemented in Python, `ts`-finite check not evaluated): **all true → CONFIRMED**. So smoke1's REFUTED came from an earlier driver's expectation (the spec's "960 first assumed"), not from the frozen predicate.
- Consequence: no committed receipt shows the frozen predicate refusing anything. The counter's selftest must forge red cases by mutating the frozen green receipt (overscroll 960; boundary scrollend 1; wheel deltaX sign; witnessRgb; shot hash; serverLog run; failures non-empty) and require `predicate false` for each.

**A13. Live-verifier agreement covers too little.** `scripts/verify-live-r67.mjs:90-95` `measured()` compares only legs (name, scrollLeft, scrollY, scrollends), wheel deltaX, and page scroll/scrollend counts. It does not compare PNG hashes, witness colours, nonce, serverLog or driverSha256, so cross-run and evidence-to-live agreement cannot detect a changed screenshot.

## Do-nothing controls (falsification status)
- C1 do-nothing (frozen v22 on r66 unmutated): exit 0, predicate true, 0 findings (reaches target). Its sweep kill count is 0/298. This is a finding (A2/A3), not a pass.
- C2 do-nothing (v3 on escape fixture): exit 0, ok true (reaches target; red-before confirmed).
- C3 do-nothing (committed smoke1/smoke2): smoke2 CONFIRMED is a real green; smoke1 REFUTED is stale (A12). There is no valid red control for the frozen predicate.

## Freeze must answer before scoring
1. C1: resolve the `no-tabi-ground` contradiction (A1, A3): re-adjudicate, or change the rule; pin the unmutated-green positive control.
2. C1: define kills as delta over baseline; require the 244 non-killed flips to stay green (A2).
3. C2: pin variant C (repo-base guard only) or name the changed selftest case; pin exact detail `input escapes repo: ../outside.mjs`, exact findings set, inside control, companion receipt (A6, A7).
4. C2: scope the claim to relative escape; name the dir-candidate tradeoff (A8).
5. C3: hard-code the driver pin in the verifier and counter; hash `--driver` against it; drop CLI pins (A9).
6. C3: counter negatives for each path in A10 (c)-(f), including stderrHead, midRun, serverLog run binding, per-leg scrollend exactness.
7. C3: drop or reword the pixel-nonce claim (A11).
8. C3: replace smoke1 as the red control with mutation-forged receipts under the frozen predicate (A12).
9. C3: decide on `scripts/verify-live-r67.mjs` (untracked, in a forbidden directory) before the L1 commits anything (A9).

## Commands and exit codes
- `node round-65/counters/c1-adjacency-host-v22.mjs --rev 5400136b… --repo <lane> --fleet /home/vgpnk/Projects/shokunin --snapshot round-66/measure/snapshot-live-r66.tsv --audit …audit-r66.tsv --delta …delta-r66.tsv --json` → 0 (predicate true, 0 findings).
- `node evidence/v23sim.mjs …same args…` → 1 (95 findings).
- Flip sweep (python, `evidence/attrib.py`): v22 298 green-survive; v23sim 54 attributable kills, 244 red-but-not-attributable.
- `node round-66/counters/check-receipt-provenance-v3.mjs --dir <escape controls> --repo <escape repo> --json` → 0 (ok true).
- `node …v3… --selftest --scratch <scratch> --json` → 0 (14/14).
- `node evidence/v4sim-A-both.mjs --selftest …` → 1 (13/14); `--dir … --json` → 1.
- `node evidence/v4sim-C-repo-only.mjs --selftest …` → 0 (14/14); `--dir …` → 1 (escape finding).
- `node evidence/v4sim-B-drop-repo.mjs --selftest …` → 1 (13/14); `--dir …` → 1 (`input absent`).
- `node scripts/verify-live-r67.mjs … --driver <modified> --expect-driver-sha256 <modified sha> --no-run --json` → 1 (findings `no-run`).
- Same with frozen driver and wrong pin → 2 (`driver-pin`).
- `git show HEAD:scripts/chrome-cdp-loopback-round67.mjs | sha256sum` → ac0561ac…70a0.
- `git cat-file -t 5400136b…:scripts/chrome-cdp-loopback-round67.mjs` → 128 (absent at base).
- `git status --porcelain -- scripts/` → `?? scripts/verify-live-r67.mjs`.
- `cmp smoke1/start.png smoke2/start.png` → identical (and the other five legs).
- `node evidence/grid-probe.mjs` → grid bit=1 cells: 131, colour [0,0,0]; witness [12,24,36].

Tools installed: none. Scratch `$HYAKU_SCRATCH/tabi-r67/R67Critic1` deleted. No lane file written, no git mutation.
