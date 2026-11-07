# R77Exec1 scoped findings — tabi round 77 w1

Verdict: FALSIFIED (predicate leg (b) as frozen). Seat: R77Exec1. Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.

## Measured results

| Step | Command (abridged) | rc | Result |
|---|---|---|---|
| Digests | `sha256sum -c .ufo/waves/round-77/freeze.txt` | 0 | 14/14 OK |
| Digests commit | `git rev-parse --verify dcdf582…^{commit}`; `git show D:freeze.txt \| sha256sum` | 0 | freeze.txt tree sha 239a101f63f41890f25efc1a7eedbd8dfbf1225b6b8d662b9906e32e4d23bfb2 == D blob sha |
| Driver (leg b, once, cold) | `node scripts/chrome-cdp-filechooser-round77.mjs --scratch $S/d --out .ufo/waves/round-77-seats/R77Exec1/receipt.json --nonce tabi-r77-exec1-dcdf582add58 --http-port 52825 --cdp-port 48117` | 1 | receipt final; 79 events, 15 legs, teardown clean |
| Counter (leg b) | `node scripts/check-filechooser-r77.mjs --lane <lane> --receipt <seat receipt> --expect-driver-sha256 9954… --expect-nonce tabi-r77-exec1-dcdf582add58 --prior-set …/prior-set.txt --prior corpus/evidence/round77/chromium-file-chooser/receipt.json --json` | 1 | verdict findings, 183 checks, 8 findings, priorSet 20 |
| Battery (leg c, on (a)) | `node scripts/negatives-filechooser-r77.mjs … --real corpus/…/receipt.json --expect-nonce tabi-r77-l1-dcdf582add58 … --work $S/n --jobs 6 --json` | 0 | allOk true, 336/336, coverageGap [] |
| Battery (on my receipt) | same shape, --real = seat receipt, --expect-nonce tabi-r77-exec1-dcdf582add58 | 1 | allOk false, passed 3, failed 334, cases 336 |
| Kill power (on (a)) | `node .ufo/waves/round-77/controls/c1/kill-power-r77.mjs … --work $S/k --out kill-power-a.json --jobs 6` | 0 | holds true; forceTrue 183/183 killed; semantic 70 (70 killed + 4 killed-positive); 0 survivors, 0 crashed |

## The 8 findings (counter.json, jq exit 0)

Seven `leg-*-opened` findings — pick-single, pick-same, pick-first-only, pick-missing, pick-empty, forward-click, intercept-cancel — each "chooser events [[\"selectSingle\",4]]"; plus `producer-verdict` ("producer predicate false hypothesis \"REFUTED\"").

Checks-false count = 8 of 183; every other check holds (all laws, send-log allow-list, frame binding, replay limits). Limit block: 20 priors, all refused:false; max absMatched 0, max gapMatched 2; absNeed 40 / gapNeed 9 per honest prior.

## Root mechanism (evidence)

- Frozen pins: scripts/check-filechooser-r77.mjs:114,116,117,118,119,123,126 pin the #s chooser backendNodeId to 5 (SHAPE table; compared at :437-438, `want = SHAPE[name]` at :418). Driver LEG_SHAPE carries the same pins, "FILLED FROM THE L1 SHAPE PROBES … backendNodeIds included": scripts/chrome-cdp-filechooser-round77.mjs:434-439; hypothesis/predicate/exit at :462-469.
- My receipt: every #s Page.fileChooserOpened and DOM.setFileInputFiles carries backendNodeId 4, internally consistent — .ufo/waves/round-77-seats/R77Exec1/receipt.json:292, :298, :2947; other inputs unchanged at 7/14/18 (:2956, :3001, :3010).
- Scored L1 receipt: same legs backendNodeId 5 — corpus/evidence/round77/chromium-file-chooser/receipt.json:292, :3206-3210.
- Conclusion: backendNodeId is a per-session Chromium DOM-agent assignment; the freeze pinned the value seen in shape-s1..s3, all 19 priors and the L1 scored run. This cold launch assigned #s=4. The refusal is a pinned-constant brittleness on an unstable identifier, not a failure of any capability law. No amendment proposed (out of bounds); decision belongs to L1.

## Evidence retained

.ufo/waves/round-77-seats/R77Exec1/{receipt.json (sha256 854c76c172d7ce02b9e455e806b913eb1c318888845034ab8a8cdd72943b3242), counter.json, negatives-a.json, negatives-b.json, kill-power-a.json}. Scratch /fast/scratch/hyaku/tabi-r77/R77Exec1 removed; no stray chromium. No installs, no lane source writes, read-only git only.

## Blockers

Leg (b) is final-failed on the written receipt; re-measurement requires an L1 decision (new nonce/wave or freeze amendment) outside this seat's bounds.
