FALSIFIED

Seat R77Exec1, tabi round 77 w1. All paths lane-relative to /home/vgpnk/Projects/shokunin/tabi-shokunin unless absolute. Digests commit D = dcdf582add5871535dee5ebc07560b020017cf2d.

## Verdict
Predicate leg (b) is FALSIFIED as frozen: the single permitted cold driver run produced a final receipt that the frozen counter refuses with 8 findings (exit 1). Leg (c) re-run independently: battery on the (a) receipt clean; kill power holds. No instrument was amended; no re-run was possible (rc 1 with a written receipt is final by the assignment rule).

## 1. Pinned digests — all 14 verified
- `sha256sum -c .ufo/waves/round-77/freeze.txt` (cwd lane root): exit 0, every entry OK — driver 9954db0703e03aed157c4be9b13f678b1bc1a6240b4bf88491d0e1f5286558a6, counter ac17ff8dda4661e2e6217831158de5e1e19a584f3f7dad918b77faee6bab4aeb, battery 3925fe2a5f772123fd9d707c52829088ab7dcaec8d9aad70265c2528eef103ff, kill-power 795b2eda8fe5812544f2b300330840b797f05a80901c2cd2e2312c9f032037aa, plus the other 10 listed in freeze.txt.
- `git -C <lane> rev-parse --verify dcdf582add5871535dee5ebc07560b020017cf2d^{commit}`: exit 0 ("round-77: digests commit D (freeze.txt) before the scored run").
- `git show D:.ufo/waves/round-77/freeze.txt | sha256sum` = 239a101f63f41890f25efc1a7eedbd8dfbf1225b6b8d662b9906e32e4d23bfb2; `sha256sum .ufo/waves/round-77/freeze.txt` (working tree) = the same 239a101f… — freeze.txt byte-identical to D.

## 2. Leg (b): cold run + counter
Driver, run exactly once, cold (ports 52825/48117 picked free beforehand; TMPDIR and --scratch under /fast/scratch/hyaku/tabi-r77/R77Exec1/d):
`node scripts/chrome-cdp-filechooser-round77.mjs --scratch $S/d --out .ufo/waves/round-77-seats/R77Exec1/receipt.json --nonce tabi-r77-exec1-dcdf582add58 --http-port 52825 --cdp-port 48117` → DRIVER_RC=1. Receipt was written, so it is final and was never edited; rc 1 (not 2) means no re-run was permitted.
Receipt facts (jq, exit 0): nonce tabi-r77-exec1-dcdf582add58, driverSha256 9954db07…, 79 events, 15 plan legs, 16 legMarks, teardown survivors [] with fixture/devtools ports closed (receipt.json:3051-3058); file 71893 bytes, sha256 854c76c172d7ce02b9e455e806b913eb1c318888845034ab8a8cdd72943b3242.

Counter (exact assigned command, --json > .ufo/waves/round-77-seats/R77Exec1/counter.json): COUNTER_RC=1.
counter.json (jq, exit 0): verdict "findings", checkCount 183, findings 8, checks-false 8, priorSet length 20 with 0 duplicate paths, priorSetFile 19 lines sha256 374d5b400186ab6616a5034623b0d38ba5f8673fd00f7b7a376befc1420f1697, walk {trees: [".ufo/waves/round-77", "corpus/evidence/round77"], outside: [], unparsable: []}. Limit block: 20 priors, every one refused:false; max absMatched 0, max gapMatched 2; absNeed 40 and gapNeed 9 on every honest prior (degenerate priors 19/18 and 19/9); maxAbsNeed 40, maxGapNeed 9.

The 8 findings, verbatim from counter.json:
1. leg-pick-single-opened — chooser events [["selectSingle",4]]
2. leg-pick-same-opened — chooser events [["selectSingle",4]]
3. leg-pick-first-only-opened — chooser events [["selectSingle",4]]
4. leg-pick-missing-opened — chooser events [["selectSingle",4]]
5. leg-pick-empty-opened — chooser events [["selectSingle",4]]
6. leg-forward-click-opened — chooser events [["selectSingle",4]]
7. leg-intercept-cancel-opened — chooser events [["selectSingle",4]]
8. producer-verdict — producer predicate false hypothesis "REFUTED"

Mechanism, with evidence:
- The counter's frozen SHAPE table pins the #s chooser's backendNodeId to 5 in exactly the seven failing legs: scripts/check-filechooser-r77.mjs:114 (pick-single), :116 (pick-same), :117 (pick-first-only), :118 (pick-missing), :119 (pick-empty), :123 (forward-click), :126 (intercept-cancel); the passing inputs keep their pins (#m=7 at :115, #d=14 at :120, #k=18 at :121). The comparison is `same(d.opened, want.opened)` at scripts/check-filechooser-r77.mjs:437 with `want = SHAPE[name]` at :418.
- The driver carries the same pins in LEG_SHAPE, "FILLED FROM THE L1 SHAPE PROBES (lesson-proof/shape-s1..s3 … identical across the 3, backendNodeIds included)": scripts/chrome-cdp-filechooser-round77.mjs:434-439. chooserHypothesis requires legShape equality (:462-464), predicate = hypothesis && failures empty (:465), process.exitCode = predicate ? 0 : 1 (:469) — hence DRIVER_RC=1 with failures [] in the driver's own output.
- In my receipt every #s Page.fileChooserOpened event and the matching DOM.setFileInputFiles call carry backendNodeId 4, internally consistent real Chromium output: .ufo/waves/round-77-seats/R77Exec1/receipt.json:292 (leg record openedNode 4), :298 (setParams backendNodeId 4), :2947 (CDP event backendNodeId 4); the other inputs keep 7/14/18 (:2956, :3001, :3010).
- The scored L1 receipt has 5 for the same legs: corpus/evidence/round77/chromium-file-chooser/receipt.json:292 (openedNode 5), :3206-3210 (opened [["selectSingle",5]]).
- Reading: backendNodeId is a per-session Chromium DOM-agent assignment, not a DOM property; the freeze pinned the value observed in the three shape probes, all 19 walked priors and the L1 scored run. This cold launch assigned #s=4 — one earlier-discovered node shifted while #m/#d/#k stayed 7/14/18. All 175 other checks hold, including every law check (trust/activation/mode/selection/cancel/empty-list/read/not-file-input/intercept/coordinate), the send-log allow-list, frame binding and the replay/limit checks. No capability law failed; what refused the run is the exact-constant pin on an identifier Chromium does not guarantee across launches. Per bounds I did not propose amending the predicate, counter or pins — this is the measured surface leg (b) exists to expose, and the decision belongs to L1.

## 3. Leg (c): independent re-run
- Battery on the (a) receipt: `node scripts/negatives-filechooser-r77.mjs --lane <lane> --real corpus/evidence/round77/chromium-file-chooser/receipt.json --expect-driver-sha256 9954… --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set .ufo/waves/round-77/controls/c1/prior-set.txt --prior .ufo/waves/round-77-seats/R77Exec1/receipt.json --laundered ×3 --work $S/n --jobs 6 --json > negatives-a.json` → NEGA_RC=0. negatives-a.json: allOk true, passed 336, failed [], cases 336, coverageGap [], positiveOk true, launderedCases 3, stoppedEarly false.
- Battery on my receipt: same command shape, --real = .ufo/waves/round-77-seats/R77Exec1/receipt.json, --expect-nonce tabi-r77-exec1-dcdf582add58, --prior = the L1 receipt → NEGB_RC=1. negatives-b.json: allOk false, passed 3, failed 334 (array length, jq exit 0), cases 336, coverageGap [], stoppedEarly false, mustAcceptCases 10, refuseCases 323. The positive control fails with findingIds exactly the receipt's 8 (positive.exit 1), and the per-case attribution cascades from the same pre-existing findings — expected on a non-clean substrate.
- Kill power on the (a) receipt: `node .ufo/waves/round-77/controls/c1/kill-power-r77.mjs --lane <lane> --real corpus/evidence/round77/chromium-file-chooser/receipt.json --expect-driver-sha256 9954… --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set … --prior seat receipt --laundered ×3 --work $S/k --out kill-power-a.json --jobs 6` → KILL_RC=0. kill-power-a.json: holds true, unmutatedExit 0, unmutatedLastExit 0, forceTrue 183 mutants / 183 killed / 0 killed-positive, semantic 70 mutants (70 killed, 4 killed-positive), survivors [], crashed [], guard ok (declaredChecks 183, forceTrueMutants 183, semanticMutants 70).

## 4. Retained evidence
All under .ufo/waves/round-77-seats/R77Exec1/: receipt.json (71893 B, sha256 854c76c1…), counter.json, negatives-a.json, negatives-b.json, kill-power-a.json. Scratch /fast/scratch/hyaku/tabi-r77/R77Exec1 removed after all runs; no stray chromium process holds it (pgrep check, no match). No tool installs were needed. No lane source files were written; git was used read-only (rev-parse/show/log). No git/jj mutations anywhere.

## 5. Risks and blockers
- Leg (b) cannot be re-measured by this seat: the receipt is final by assignment rule; any re-run needs an L1 decision outside my bounds.
- The counter's refusal of my receipt is deterministic — it reproduced identically inside the battery's positive control (negatives-b.json positive.findingIds).
- Host was heavily loaded; the cold run itself took ~9.3 s (receipt startedAt 2026-11-07T14:58:22.683Z → finishedAt 14:58:31.939Z) with clean teardown.
