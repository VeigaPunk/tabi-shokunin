HOLDS

# R75Exec1 — Tabi round 75, wave w1: legs (b) and (c) independent verification

Seat: R75Exec1 (executor, leaf). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Base c19a520fdfa574a5c082b09130b7dbfcdd1e99eb; digests commit D = 57f28cf128e69dc40604f3201eab6a843c8e4142. Nothing in the predicate, counter, pins, priors, thresholds or kill rule was proposed for amendment; instruments were attacked by execution only.

## 1. Pinned digest check (freeze.txt)

Command: `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && awk 'NF==2 && $1 ~ /^[0-9a-f]{64}$/ {print $1" "$2}' .ufo/waves/round-75/freeze.txt | while read -r exp p; do act=$(sha256sum "$p" | cut -d' ' -f1); ... done` — exit 0. All 7 pinned files verified byte-identical to freeze.txt (recorded 2026-11-07T02:47:42-03:00 before any scored run):

- scripts/chrome-cdp-dragdrop-round75.mjs = d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 OK
- scripts/check-dragdrop-r75.mjs = 9b370790a97193ff662678b38b957b5cdaab06267092931ab1719bbed31c9270 OK
- scripts/negatives-dragdrop-r75.mjs = 9df82b2eab2adb733123a209b51b596a64d71f552298fe894b33accaac9f0721 OK
- .ufo/waves/round-75/controls/c1/kill-power-r75.mjs = c227da0042465488dc503f2f00381e156e226ee7d850994e1df32cd82833b68f OK
- .ufo/waves/round-75/controls/c1/prior-set.txt = 4d85dfb212d008c3dc6fd873d3102c5ba20c1fa53e6fd65edbce7ed5afd90db7 OK
- .ufo/waves/round-75/claims.json = b6b4183e5e93c99704103e02ca17f0a26b889e70520c8f57cdcbdeb0db8e8f57 OK
- .ufo/waves/round-75/run-scored.sh = 84ae7b486da5bd19c760d5eb9a91d2d615dce04eb5fdfffa92cf1149f43d29b2 OK

Environment: node v24.21.0; /usr/bin/chromium --version = Chromium 155.0.8059.84 Arch Linux (matches the pinned browser). No tools installed or upgraded this session; nothing to record under the install rule.

## 2. Leg (b): independent cold driver run + pinned counter — HOLDS

Driver run (exactly one cold run, ports chosen free immediately before launch, http=56913 cdp=59899):

`TMPDIR=/fast/scratch/hyaku/tabi-r75/R75Exec1/d node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-dragdrop-round75.mjs --scratch /fast/scratch/hyaku/tabi-r75/R75Exec1/d --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-75/w1/R75Exec1/receipt.json --nonce tabi-r75-exec1-57f28cf128e6 --http-port 56913 --cdp-port 59899` — DRIVER_RC=0, elapsed 7.8 s, receipt written, `failures: []`, teardown port probes fixture/devtools closed, postKillSweepCount 0, survivors []. Receipt sha256 b7d7aaff65db70c4a6e1dfe95b7ab45e96fc77694c1584703c908e4a790eaf1b. Driver stdout shows exactly one `Input.dragIntercepted` event (items text/plain "tabi-drag" and text/x-tabi "x1", dragOperationsMask 17) and `bad-type` leg refused with CDP -32602 "Unexpected event type 'dragLeave'".

Counter run (16 PRE priors in prior-set.txt order + the L1 scored receipt as 17th --prior):

`node scripts/check-dragdrop-r75.mjs --receipt .ufo/waves/round-75/w1/R75Exec1/receipt.json --expect-driver-sha256 d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 --expect-nonce tabi-r75-exec1-57f28cf128e6 --prior <16 PRE paths> --prior corpus/evidence/round75/chromium-drag-intercept/receipt.json --json > .ufo/waves/round-75/w1/R75Exec1/counter.json` — COUNTER_RC=0. counter.json: verdict=clean, checkCount=146, findings=[], priorSet length=17 (full --prior list reproduced in .ufo/waves/round-75/w1/R75Exec1/counter.json). No re-run with new ports was needed (rc was 0, not a usage refusal).

Leg (b) predicate: (a)-style cold independent run by R75Exec1, nonce tabi-r75-exec1-57f28cf128e6, counter clean 146 checks with PRE priors plus the (a) receipt as 17th prior — HOLDS as frozen.

## 3. Leg (c): battery and kill power, independently re-run — HOLDS

Battery on the L1 scored receipt (corpus/evidence/round75/chromium-drag-intercept/receipt.json, nonce tabi-r75-l1-57f28cf128e6, 16 PRE priors, 3 --laundered, --work scratch/n --jobs 6):

`node scripts/negatives-dragdrop-r75.mjs --real corpus/evidence/round75/chromium-drag-intercept/receipt.json --expect-driver-sha256 d604552e...8105 --expect-nonce tabi-r75-l1-57f28cf128e6 --prior <16 PRE> --laundered <3 degenerate> --work /fast/scratch/hyaku/tabi-r75/R75Exec1/n --jobs 6 --json > .ufo/waves/round-75/w1/R75Exec1/negatives-a.json` — BATTERY_A_RC=0. negatives-a.json: allOk=true, passed=254, cases=254, failed=0, positiveOk=true, stoppedEarly=false, checkIds=146, refuseCases=246, mustAcceptCases=5, launderedCases=3, isolatedCases=154.

Battery on MY receipt (.ufo/waves/round-75/w1/R75Exec1/receipt.json, nonce tabi-r75-exec1-57f28cf128e6, 16 PRE priors + L1 receipt as 17th prior, same 3 --laundered, --work scratch/nb --jobs 6):

`node scripts/negatives-dragdrop-r75.mjs --real .ufo/waves/round-75/w1/R75Exec1/receipt.json --expect-driver-sha256 d604552e...8105 --expect-nonce tabi-r75-exec1-57f28cf128e6 --prior <16 PRE> --prior corpus/evidence/round75/chromium-drag-intercept/receipt.json --laundered <3 degenerate> --work /fast/scratch/hyaku/tabi-r75/R75Exec1/nb --jobs 6 --json > .ufo/waves/round-75/w1/R75Exec1/negatives-b.json` — BATTERY_B_RC=0. negatives-b.json: allOk=true, passed=254, cases=254, failed=0, positiveOk=true, stoppedEarly=false, checkIds=146, refuseCases=246, mustAcceptCases=5, launderedCases=3, isolatedCases=154.

Kill power on the L1 scored receipt (controls/c1/kill-power-r75.mjs, --lane lane root, 16 PRE priors, 3 --laundered, --work scratch/k --out kill-power-a.json --jobs 5):

`node .ufo/waves/round-75/controls/c1/kill-power-r75.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --real corpus/evidence/round75/chromium-drag-intercept/receipt.json --expect-driver-sha256 d604552e...8105 --expect-nonce tabi-r75-l1-57f28cf128e6 --prior <16 PRE> --laundered <3 degenerate> --work /fast/scratch/hyaku/tabi-r75/R75Exec1/k --out .ufo/waves/round-75/w1/R75Exec1/kill-power-a.json --jobs 5` — KILL_RC=0 (wall 195.8 s). kill-power-a.json: unmutatedExit=0, forceTrue {mutants:146, killed:146}, semantic {mutants:40, killed:40}, survivors=[], crashed=[], holds=true. A crashed battery was never scored as a kill; none crashed.

Leg (c) predicate: battery exit 0 AND kill power holds on the (a) receipt — HOLDS as frozen (independently reproduced by this seat, matching the L1's committed c1-negatives-a.json 254/254 allOk and kill-power holds).

## 4. Files written by this seat (all inside assigned paths)

- .ufo/waves/round-75/w1/R75Exec1/receipt.json (leg b receipt, sha256 b7d7aaff65db70c4a6e1dfe95b7ab45e96fc77694c1584703c908e4a790eaf1b)
- .ufo/waves/round-75/w1/R75Exec1/counter.json
- .ufo/waves/round-75/w1/R75Exec1/negatives-a.json
- .ufo/waves/round-75/w1/R75Exec1/negatives-b.json
- .ufo/waves/round-75/w1/R75Exec1/kill-power-a.json
- .ufo/waves/round-75/w1/R75Exec1/report.md and .ufo/waves/round-75/w1/R75Exec1.md (this report)

Scratch /fast/scratch/hyaku/tabi-r75/R75Exec1 deleted before yield; receipts were copied into the wave dir first. No git/jj mutations anywhere; no host paths touched outside scratch; no subagents spawned.

## 5. Statement on the frozen predicate

Legs (b) and (c) hold exactly as frozen: the independent cold run produced a clean 146-check counter verdict with the 17-prior set, both batteries pass 254/254 with allOk, and kill power holds with 146/146 force-true and 40/40 semantic kills, zero survivors and zero crashes. Leg (d) (capability row 0->1 + knowledge note citing S196-S200) is not this seat's assignment and was not attempted. No predicate, counter, pin, prior, threshold or kill-rule text was amended; the instruments were attacked by execution and held.
