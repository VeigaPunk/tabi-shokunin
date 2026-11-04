# R63ExecDriver — independent reproduction of C1 (coverage)

Seat: `R63ExecDriver`, round 63, wave w1, leaf executor. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(read-only for this seat except my wave dir). Baseline `f098bcf8843c8a5a723a83995352180f897a6ff9`;
instrument/controls freeze `816592612dd2a8073437c595d3fe3c477125cf3c`; lane HEAD at run
`e5325ad8805df86cb0109373d2ac695f558c2a1f` (freeze commit is an ancestor).
Host: Linux 7.2.11-arch1-1 x86_64, node v24.21.0, `/usr/bin/chromium` = `Chromium 155.0.8059.84 Arch Linux`,
`/usr/bin/curl` 8.23.0. No tool install or upgrade was needed or performed (pacman untouched).

Assignment executed: (a) driver pin, (b) two-cold-run stability, (c) frozen counter on each receipt,
(d) survivor/port closure — plus the failing-before controls re-run and attacked (negatives, red-before,
mutant matrix) without rebuilding any committed control.

## 1. What I ran (argv, cwd, exit)

All commands ran with cwd `/fast/scratch/hyaku/tabi-r63/R63ExecDriver` (scratch, deleted before yield).
Full machine-readable copy: `w1/R63ExecDriver/commands.json`.

| id | argv (absolute) | exit |
|---|---|---|
| driver-runA | `node <lane>/scripts/chrome-cdp-loopback-round63.mjs --scratch /fast/scratch/hyaku/tabi-r63/R63ExecDriver/coldA --out <wave>/runA/receipt.json --nonce tabi-r63-r63exec-a --http-port 19493 --cdp-port 19494` | **0** (3781 ms) |
| driver-runB | `node <lane>/scripts/chrome-cdp-loopback-round63.mjs --scratch /fast/scratch/hyaku/tabi-r63/R63ExecDriver/coldB --out <wave>/runB/receipt.json --nonce tabi-r63-r63exec-b --http-port 19495 --cdp-port 19496` | **0** (3784 ms) |
| counter-runA | `node <lane>/.ufo/waves/round-63/counters/chromium-wheel-r63.mjs <wave>/runA/receipt.json --driver <lane>/scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59…c040 --shot <wave>/runA --json` | **0** |
| counter-runB | same with `<wave>/runB/receipt.json --shot <wave>/runB` | **0** |
| counter-selftest | `node <lane>/.ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` | **0** (22 cases) |
| negatives-rerun | `node …/chromium-wheel-r63.mjs <lane>/.ufo/waves/round-63/controls/negatives/n*.json --driver … --expect-driver-sha256 b00efd59…c040 --shot <lane>/.ufo/waves/round-63/controls/smoke --json` (10 invocations) | **1 ×10** |
| old-generation-rerun | `node …/old-generation-r63.mjs --counter <lane>/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs --receipt …/controls/old-generation/r62-lying-receipt.json --driver <lane>/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a…82e0 --shot <lane>/corpus/evidence/round62/chromium-secondary-button --work <scratch>/oldgen` | **0** (demonstrated) |
| mutation-matrix | `node …/mutate-r63.mjs run --counter …/chromium-wheel-r63.mjs --mutants …/mutants-r63.json --driver … --expect-driver-sha256 b00efd59…c040 --live <wave>/runA/receipt.json --shot <wave>/runA --negatives …/controls/negatives --work <scratch>/mutwork --out <wave>/mutation-matrix-r63exec.json` | **0** (`allKilled true`, survived `[]`) |

Both cold runs wrote `0` bytes to driver stderr; both receipts have `failures: []`.
Wave dir convention used here: `<wave>` = `.ufo/waves/round-63/w1/R63ExecDriver/`.

Disclosure: my very first execution of the pair (16:04:17 and 16:04:21) inherited the shell's `set -x`, so
`driver.stderr` captured shell trace text instead of the driver's own stderr. Those artifacts were deleted and
**both cold runs were re-executed cleanly** (16:05:11 / 16:05:15); the reported receipts are the clean pair.
The discarded pair also exited 0 with the identical four PNG hashes, so nothing behavioural is hidden by the redo.

## 2. (a) Driver pin

- `sha256(<lane>/scripts/chrome-cdp-loopback-round63.mjs)` = **b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040** — equals the claims pin (a).
- `git -C <lane> show 8165926…:scripts/chrome-cdp-loopback-round63.mjs | sha256sum` = the same hash: the pin is
  anchored in the freeze commit, and the worktree copy is byte-identical to it.
- Both receipts self-record `driverSha256` = the pin, and the counter re-hashes the driver at invocation
  (`chromium-wheel-r63.mjs:115-116`) and refuses on mismatch (observed: exit 2, `counter invocation driver pin
  mismatch`, attack t4a).
- All eight claims pins re-verified byte-identical between worktree and freeze blob, at 16:10:12:
  `w1/R63ExecDriver/pin-verification.txt`. No tracked modification touches a frozen path.

## 3. (b) Cold-run comparison — two runs, distinct nonces, distinct port pairs, distinct scratch subdirs

Machine receipt: `w1/R63ExecDriver/stability.json`.

| field | runA | runB | equal |
|---|---|---|---|
| nonce | `tabi-r63-r63exec-a` | `tabi-r63-r63exec-b` | distinct by design |
| origin / ports | `http://127.0.0.1:19493` (cdp 19494) | `http://127.0.0.1:19495` (cdp 19496) | distinct by design |
| launchToken / profile | `b0ef9308e921` | `3b00decbbc8b` | distinct profiles |
| receipt sha256 | `678121b19b794996d20f811a8973926aecbaf2a5c1f70896b4ad5fbb2af2ec4e` | `b7a4d98c28ae496975332cb8a6d2068267ab61123992d7300a5ea494057ba4f9` | differ only via nonce/port/token/ts |
| **legs** (6) | start 0/0, down1 120/1, down2 240/2, up1 120/3, swallowed 120/4, released 240/5 | identical | **yes** |
| **wheellog (5) minus `ts`** | sha256 `fc13902c28bfc8aee73718de49d8ff49de036156f5b1af4bd2f3e806b53a3bbc` | same sha256 | **yes** |
| raw `ts` (why zeroing is needed) | 21.5, 245.40000000596046, 416.69999998807907, 595.9000000059605, 745.3000000119209 | 15, 239.39999997615814, 410, 589.1999999880791, 742.1999999880791 | differ (expected) |
| **pageState** | `{scrollY:240, scrollEvents:4, wheellogLen:5}` | identical | **yes** |
| **PNG sha256 per run** | a/b/c `c8de49678abad8433a822370a92ab3b2b35ac53603d5122193f21d66fdd95b9a`, d `1bc648c80b682620cf2eef31942be3e90ad1b928a2d09580bcf48ea7b7605ce0` | identical, 4/4 | **4 of 4 identical** |
| teardown | `postKillSweepCount 0`, `survivors []`, probes `closed/closed`, curl `7/7` | identical | **yes** |
| sweeps | `preLaunch 0`, `midRun 13`, `postKill 0` | identical | **yes** |
| wheelHypothesis / predicate / failures | `CONFIRMED` / `true` / `[]` | identical | **yes** |

A full JSON path diff between the two receipts yields exactly **12** differing paths, every one of them
expected: `nonce`, `nonceOnPage`, `fixture.origin`, `fixture.sha256` (nonce is inside the fixture template),
`host.argv[2]` (cdp port), `host.argv[4]` (user-data-dir), `host.launchToken`, and the five `wheellog[i].ts`.
**Zero** differences in the four stability fields the claim names.

Corroboration beyond the two required runs: the pre-freeze committed smoke pair (`controls/smoke/receipt-run1.json`,
`receipt-run2.json`, nonces `tabi-r63-smoke-one/two`, ports 19481/19483) carries the same six legs, the same
`pageState {240,4,5}`, the same `sweeps {0,13,0}` and the **same four PNG hashes**. That makes four independent
driver invocations on this host with byte-identical pixels and shape.

## 4. (c) Frozen counter on each receipt

| receipt | exit | predicate | findingCount | findings |
|---|---|---|---|---|
| runA | 0 | true | 0 | `[]` (`runA/counter.json`) |
| runB | 0 | true | 0 | `[]` (`runB/counter.json`) |

Counter selftest: exit 0, `verdict=clean cases=22 passed=22`, `allPass true` (`counter-selftest.stdout`) — the
claim's `selftestCases: 22` reproduces.

Committed controls re-run and attacked (nothing rebuilt, nothing edited):

- **10/10 declared negatives** refuse with exit **1** and the expected single finding each
  (`negatives-rerun.log`): n1/n2 `producer-verdict`, n3 `scroll-arithmetic`, n4 `wheellog-sequence`,
  n5 `delta-y-passthrough`, n6 `cancelation`, n7 `shot-bytes`, n8 `survivors`, n9 `nonce-binding`,
  n10 `launch-guards`. No negative exits 0 and none exits other than 1.
- **Red-before (r62 generation)** reproduced byte-exactly: pristine r62 counter exit 1 with `producer-verdict`
  on the lying receipt (`predicate:true`, `buttonHypothesis:REFUTED`), exact-line `&&`→`||` mutant (site
  `chromium-receipt-r62.mjs:45,9`) exit **0** with `findings []`; `demonstrated: true`, and my regenerated mutant
  sha `be137441bb6f0cc1d80d6a21e4dc522e2a73c03ad61b2793c80398235d4ec3f1` equals the frozen record's
  (`oldgen-rerun.json` vs `controls/old-generation/result.json`).
- **Mutation matrix over my own cold receipt** (`mutation-matrix-r63exec.json`): pristine accepts my live receipt,
  refuses all 10 negatives; all **8/8** exact-line mutants distinguished with **0** survivors, each mutant still
  accepting the live receipt (no blanket refusal): M1 false-greens n1+n2, M2→n3, M3→n4, M4→n5, M5→n6, M6→n7,
  M7→n8, M8→n10. That is C1's mutant target reproduced independently of the L1's scored data receipt.
- Adversarial probes on copies in scratch (never on committed bytes): deltaY tamper→`delta-y-passthrough`;
  one-byte PNG flip→`shot-bytes`; missing PNG→`shot-bytes`; `pageState.scrollY=239`→`page-final-state`;
  duplicate seq→`wheellog-sequence`; extra server path→`server-witness`; `ts=-1`→`trusted-fields`;
  driver byte-flip with the canonical pin→exit 2 pin refusal; driver byte-flip with its own sha as pin→
  `driver-binding`. All exits 1 (or 2) as expected.

## 5. (d) Survivors and ports

`w1/R63ExecDriver/survivors-check.txt` (ps `-eo pid,args`, `ss -ltn`, curl; measured after the last run and again
at end of work): no process matching `R63ExecDriver`, `b0ef9308e921`, `3b00decbbc8b` or the four ports; no
headless/remote-debugging chromium on the host; **no listener** on 19493/19494/19495/19496; curl exit **7** on all
four ports. Only residual TIME-WAIT client sockets remain, which is not a listener. Both receipts self-report
`postKillSweepCount 0`, `survivors []`, `portProbes {closed,closed}`, `postKillCurl {7,7}`.

## 6. Findings by severity

**No finding kills C1 on this host.** Each item below names the frozen file and line it attacks.

**F1 — LOW / evidence strength.** The driver's closure proof can become vacuous. `sweepOnce()` returns
`{error:'ps failed', pids: []}` when `ps` exits non-zero (`scripts/chrome-cdp-loopback-round63.mjs:109`), and
`sweepToZero()` treats that error as "no survivors" and breaks immediately (`…:124`), so `teardown()` records
`postKillSweepCount 0` / `survivors []` (`…:200-204`) and the closure failure branch cannot fire (`…:208`).
The counter then accepts `survivors` and `launch-witness` (`counters/chromium-wheel-r63.mjs:50,52`). Exposure is
bounded because the ports are independently probed and curl'd (`…:203-206`), so a browser still listening on the
two assigned ports is caught; what could slip is a detached process outside the sweep's `ps` view. Not observed
here: `sweeps.midRun = 13` in both runs proves `ps` produced real output inside the same process, and my external
`ps`/`ss`/curl checks were clean. Reported, not repaired.

**F2 — INFO / declared boundary (no action).** Receipts are internally consistent, not authenticated. Because the
fixture commitment is recomputable from the public driver (`counters/chromium-wheel-r63.mjs:121` rebuilds the
template with the receipt's own nonce; `:31` compares it), a copy of the smoke body relabelled with a never-run nonce
(`tabi-r63-never-run-xyz`) and a recomputed `fixture.sha256` (`7263e411…`) is **accepted** (exit 0); shot bytes
transplant between runs (runA receipt + runB shots → exit 0) and an arbitrary valid PNG swapped in with the
receipt re-hashed is **accepted** (exit 0). This is exactly C1's `limits` sentence ("does not authenticate the
receipt"); recorded so scoring stays inside the declared boundary.

**F3 — INFO.** The four shots are not leg-discriminating: a/b/c are byte-identical within a run because all three
captures happen at scrollY 120 (`scripts/chrome-cdp-loopback-round63.mjs:265-271`), so the pixels witness two
distinct offsets (120, 240) rather than the six documented legs. C1 only requires cross-run identity, which held
4/4; the leg arithmetic is carried by `legs`/`wheellog`/`pageState`, not by pixels.

**F4 — INFO / provenance.** An unpinned post-freeze helper exists in the frozen counters dir:
`.ufo/waves/round-63/counters/compare-stability-r63.mjs` (untracked, sha256 `39e76c98876824ab95035b8bed921a44ff23889dc9c24758f90068d61a77e3c0`),
together with `controls/stability-data.json` (`472e44f5…`), `controls/counter-data-run1/2.{stdout,stderr}`,
`controls/mutation/matrix-data.json`, `controls/negatives-data/` and `controls/census-{start,end}.txt`, all written
16:03:45–16:03:52 — before my first run, not by this seat. The six pinned instruments are unchanged (section 2),
so no kill rule fires; but if the scored stability comparison runs through that helper, its bytes are not frozen.

**F5 — INFO / provenance.** Concurrent tracked edits landed in the lane during my window:
`SCORECARD.md` (mtime 16:06:51), `SKILL.md` (16:08:57), `corpus/QUALITY.md`, `corpus/README.md`,
`corpus/SOURCES.md` (`git diff --stat`: +102 insertions, append-shaped), plus new untracked
`corpus/knowledge/chromium-wheel-scroll-round-63.md`, `corpus/lessons/round-63.md`, `corpus/evidence/round63/`.
None by this seat (my writes are only `w1/R63ExecDriver/`, its `.md`, and scratch); no pinned byte moved.

## 7. Receipts beside this report (`w1/R63ExecDriver/`)

`commands.json` (every argv/cwd/exit + full artifact hash manifest) · `pin-verification.txt` ·
`stability.json` · `attacks.json` (13 adversarial probes, measured exits/findings) · `runA/{receipt.json,a-wheel-down.png,b-wheel-up.png,c-swallow.png,d-release.png,driver.stdout,driver.stderr,counter.json,counter.stderr}`
· `runB/{same}` · `counter-selftest.stdout|stderr` · `negatives-rerun.log` · `oldgen-rerun.json` ·
`mutation-matrix-r63exec.json|stdout|stderr` · `survivors-check.txt`.

Cited hashes: driver `b00efd59…c040`; counter `08470569…d7178`; receiptA `678121b1…ec4e`; receiptB `b7a4d98c…a4f9`;
wheellog-minus-ts `fc13902c…a3bbc`; PNGs `c8de4967…5b9a` (a,b,c) and `1bc648c8…5ce0` (d); stability
`28065ba5…6b79`; mutant matrix `7e5b4691…32d0`; r62 exact-line mutant `be137441…c3f1`.

Scratch `/fast/scratch/hyaku/tabi-r63/R63ExecDriver/` (5.1 MB) was **deleted** before this report was written;
`ls` of that parent shows no `R63ExecDriver*` entry. No tool was installed.

Skipped, and named as skipped: cross-browser/OS matrix (outside C1's limits); the C2 self-assessment gate (not this
seat); regeneration of the negative set via `make-negatives-r63.mjs` (would rewrite committed controls, forbidden);
the mutant matrix against the L1's scored data receipt (the L1's after-pass — I ran it against my own cold receipt).

VERDICT: **C1 reproduces independently on this host — two cold runs, distinct nonces/ports/scratch, exit 0, predicate true, counter exit 0 with 0 findings on both, legs + wheellog-minus-ts + pageState identical and 4/4 PNG sha256 identical across runs (and across the two pre-freeze smoke runs), teardown clean with no surviving process or listener; the driver pin matches the claims pin and the freeze-commit blob byte-for-byte; the only findings are one LOW evidence-strength gap in the driver's ps-failure path and four disclosed-limit/provenance INFO notes.**
