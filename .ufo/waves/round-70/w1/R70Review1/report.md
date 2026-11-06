FINDINGS

# R70Review1: false-green review of check-synthtap-r70.mjs and negatives-synthtap-r70.mjs

Scope: frozen bytes only, no edits to scripts. Counter sha256 a2ed7619ca6ea165a3877308c3d87c41a27f6b2a7f24a7fca4f879073a39756e; battery sha256 22244a81f9653a3df30cb4dc98b258d9cd09201247e748b97b516bca99b2af3c. Both match freeze.txt (7c42ef25). Real receipt: corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json. Lane: leaf, no delegation. Scratch removed after archiving. Crafted receipts, harness and ablation evidence are beside this file.

## Verified baseline
- Counter on real receipt, `node scripts/check-synthtap-r70.mjs --receipt <real> --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 --json` → exit 0, verdict clean, checkCount 84, findings 0 (baseline-counter.json).
- Battery rerun: `negatives-synthtap-r70.mjs --real <real> --expect-driver-sha256 704efab8…9577 --work <scratch> --laundered {degenerate-js-click,dispatch-mouse,skip-touch}.json` → exit 0, `negatives 95/95 positiveOk=true coverageGap=0 failed=none` (battery-rerun.txt). Matches scored c1-negatives-a.json.
- Producer polarity works: setting predicate false → producer-verdict fires; setting hypothesis to REFUTED or lowercase 'confirmed' → producer-verdict fires. Both polarities fire at the right check.
- legShape is not an independent oracle: a fabricated zero-leg mouse-tap log with legShape.zero rewritten to match passes legshape-consistency, but still fires leg-zero-seq, leg-zero-detail and leg-zero-timing (harness-results.json, zero-fabricated-events).

## False greens (counter exit 0 on a receipt that should be refused)

Each row: crafted file in receipts/, mutation, counter result. All reproduced by running the frozen counter on the file.

| # | Receipt | Mutation | Counter | Where the gap is |
|---|---|---|---|---|
| FG1 | receipts/x-cdp-scroll.json | push `Input.synthesizeScrollGesture` into cdpSendLog | exit 0 clean | scripts/check-synthtap-r70.mjs:95 look-alike regex covers only `Input.(dispatch|insertText|ime|emulateTouch)` and eval/callFunctionOn; other `Input.synthesize*` methods are unread. Comment at :91 says "no look-alike producer". |
| FG2 | receipts/x-cdp-pinch.json | push `Input.synthesizePinchGesture` | exit 0 | same, :95 |
| FG3 | receipts/x-cdp-ignore-input.json | push `Input.setIgnoreInputEvents {ignore:true}` | exit 0 | same, :95; a page-state-altering method is unrecognised. |
| FG4 | receipts/move-forged-start.json | unshift a pointermove event (isTrusted true, clientX 9999, target 'BODY') into leg `start`; set legShape.start.total=1 | exit 0 | :102 drops MOVES from `seq` so move type is never checked; :114 coords filter excludes move types; :115 target filter excludes `pointermove`/`mousemove`. Forged moves are never location- or target-checked. |
| FG5 | receipts/flagship-scroll-plus-move.json | FG1 + FG4 together | exit 0 | Combined. Both gaps stack; the receipt looks like a clean scored run. |
| FG6 | receipts/ts-string-window.json, p-ts-string.json | pointerdown.ts and pointerup.ts set to strings | exit 0 clean | :112 subtracts `up[0].ts - down[0].ts` with JS coercion; no `typeof ts === 'number'` check anywhere. |
| FG7 | receipts/ts-nan-string-click.json | click.ts = 'NaN' | exit 0 | click.ts is never read (:101-116 use only pointerdown/pointerup ts). |
| FG8 | receipts/ts-missing-mousedown.json | delete mousedown.ts | exit 0 | mousedown.ts never read. |
| FG9 | receipts/legs-params-forged.json | legs[1].params.x=999 and legs[7].params.y=999 | exit 0 | `legs` is checked for names (:87) and cdpError/skipped (:113) only; legs[].params is never reconciled to plan (:86) or to cdpSendLog (:94). |
| FG10 | receipts/legs-elapsed-forged.json | legs[1].elapsedMs=999999, legs[7].elapsedMs=-5 | exit 0 | elapsedMs never read. |
| FG11 | receipts/fixture-sweeps-forged.json | fixture='forged-fixture', sweeps=[{survivors:[1,2,3]}] | exit 0 | top-level `fixture` and `sweeps` never read; only `teardown` is (:120-121). |
| FG12 | receipts/serverlog-failed-serve-hidden.json | unshift serverLog row {path:'/', run:<nonce>, status:500} | exit 0 | :76 filters to status 200 before the binding check, so a failed serve of the run's own page is invisible. |
| FG13 | receipts/buttons-field-forged.json | mousedown.buttons = 7 | exit 0 | buttons field never checked (:111 checks only button). |
| FG14 | receipts/pointerdown-detail-forged.json | pointerdown.detail = 7 | exit 0 | detail checked only on click (:104, :111). |
| FG15 | receipts/cross-leg-interleave.json | move the touch leg's events ahead of the mouse leg in the raw log, renumber seq | exit 0 | seq-monotonic (:88) checks numbering only, not that legs appear in plan order in the raw log. |
| FG16 | receipts/nonce-rebrand.json | fully re-branded nonce in nonce, nonceOnPage and serverLog | exit 0 | Declared form-only limit (:4-5). The live verifier is the control here; not run in this review. |

Refused correctly (not false greens): tap-call-params swap, outside-claimed-success, dup-pointerup, zero-fabricated-events, hold-forged-fast-release, clientx-string, serverlog-foreign-run, event-leg-domain, legname-fabricated, target-forged-click, pointertype-capital-touch, leg-outside-plan, and the three polarity cases.

Severity: FG1-FG5 breach the "no look-alike producer" intent (comment at :91). FG4-FG5 accept forged trusted pointermove events. FG6-FG8 accept unconstrained timestamp types. FG9-FG14 are unread fields. None of FG1-FG16 is present in the scored receipt, which is clean. These are receipt-form gaps in a counter whose declared limit is "form only"; the live verifier is the authority for an actual run.

## Battery: wrong-reason audit

Membership check (`findingIds.includes(expect)`) means a case passes if the expected id appears alongside any other id. I checked this by ablation: I removed one sub-predicate at a time from a copy of the counter (never the repo file), ran the frozen battery against it, and recorded whether the battery still goes green. A case that isolates its check must make the battery fail when that check is removed.

| Ablated sub-predicate (frozen counter line) | Battery result on ablated counter | Verdict |
|---|---|---|
| double second-tap timing (:112) | fails on double-second-tap-timing | isolated |
| producer predicate `r.predicate===true` (:123) | fails on producer-verdict-polarity | isolated |
| producer hypothesis `synthTapHypothesis==='CONFIRMED'` (:123) | fails on producer-hypothesis-polarity | isolated |
| devtools stderr `host.stderrHead.includes(dl.url)` (:83) | fails on devtools-stderr-absent | isolated |
| mousedown/mouseup `button===0` (:111) | fails on mouse-detail-button | isolated |
| run window `t1 > t0` (:84) | fails on run-window | isolated |
| **error-branch `leg.skipped === false` (:113)** | **battery 95/95 still green (allOk=true)** | **NOT isolated: untested mutation** |

FB1 (the battery gap): no battery case sets `skipped=true` on a leg that has an expected error. The only skipped case is `touch-skipped`, which takes the `want.error===null` branch at :113, not the ablated branch. The frozen counter catches outside.skipped=true with leg-outside-error (receipts/p-outside-skipped.json: exit 1), but ablating only that conjunct leaves the battery green. Repro: copy scripts/check-synthtap-r70.mjs, delete ` && leg.skipped === false` from the error-branch of the line at :113, run the frozen battery against that copy; it passes 95/95. Evidence: ablation/summary.skiperr.json and ablation/check-synthtap-r70.skiperr.mjs.

Not run: the other ~77 check groups were not ablated individually, so "every case isolates its check" is not established. The seven ablations above are a sample. For all other battery cases I verified only the membership test, not wrong-reason passage.

## Residual risk and verification gaps
- The battery exercises none of FG1-FG16 (no case for extra Input.synthesize* methods, move events, string timestamps, legs[].params, elapsedMs, fixture/sweeps, non-200 serverLog rows, buttons field, pointerdown detail, cross-leg order). These gaps are real but do not change the scored clean result, because the scored receipt does not contain them.
- Remaining authority: the forged-replay control in controls/c2 and the live verifier. This review did not run verify-live-r70.mjs and makes no claim about it.
- The driverSha256 pin only checks the self-reported hash (:78). That is the declared form-only limit, recorded here for completeness.
- No frozen claim, predicate, counter or kill rule was proposed for amendment; findings are recorded against the frozen counter as-is.

## Reproduction
- Counter false greens: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-synthtap-r70.mjs --receipt .ufo/waves/round-70/w1/R70Review1/receipts/<name>.json --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 --json`. Expected exit 1 for every receipt; observed exit 0 for FG1-FG16 receipts.
- Battery gap FB1: create a copy of the counter with the `leg.skipped === false` conjunct removed from the error-branch of the line at :113, then run the frozen battery against that copy. Observed: 95/95 pass; recorded in ablation/summary.skiperr.json.
- Full crafted set: `node harness.mjs` (writes into a scratch `work/` directory, not into the repo); results in harness-results.json. Battery rerun output: battery-rerun.txt.

## Findings by severity
1. FB1 (medium): battery has no case isolating the `leg.skipped === false` error-branch conjunct at :113; a counter with that conjunct removed passes the frozen battery. Fix would be a new case (not a claim edit): outside.skipped=true with cdpError set → expect leg-outside-error.
2. FG1-FG3 (medium): look-alike producer check at :95 misses other Input.synthesize* and page-state Input methods.
3. FG4-FG5 (medium): forged pointermove events with isTrusted true and a non-button target are accepted (:102, :114, :115).
4. FG6-FG8 (low-medium): timestamps not type-checked; string ts coerces silently at :112; click and mousedown ts unread.
5. FG9-FG15 (low): unread receipt fields (legs[].params, elapsedMs, fixture, sweeps, buttons, pointerdown detail, serverLog non-200 rows) and cross-leg raw-order unchecked.
6. FG16 (declared, out of counter scope): form-only nonce rebrand; the control is the live verifier.
