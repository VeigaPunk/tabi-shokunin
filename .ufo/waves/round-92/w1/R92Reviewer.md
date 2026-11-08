# R92Reviewer — freeze, controls, code review (C1)

Scope: freeze order, instrument bytes, pre-freeze controls (receipt mode only, no chromium), code review of driver/counter/battery, counter `revision` vs claim wording. Leaf seat, no subagents, no commits.

## 1. Freeze order (read-only git, LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin)
- `git log --oneline -4 master`: 4fe08d26 (w1 dispatch) → a87c7176 (scored) → 2bac1048 (freeze) → bdf403ff (base).
- `git merge-base --is-ancestor 2bac104844eb a87c71766bc3` rc=0; `git rev-list --count 2bac104844eb..a87c71766bc3` = 1. Freeze precedes scored.
- Scored commit a87c7176 touches only `.ufo/waves/round-92/scored/*` and the corpus receipt; no script bytes change between freeze and scored.
- Instrument sha256 (`git show <rev>:<path> | sha256sum`), identical at 2bac1048, a87c7176, master, and the working tree, and equal to `controls/instrument-sha256.txt`:
  - scripts/check-iframe-chooser-round92.mjs = d4d84f92…0410efc5
  - scripts/chrome-cdp-iframe-chooser-round92.mjs = 0feca90b…321688 (equals the counting-command pin)
  - scripts/negatives-iframe-chooser-round92.mjs = 1cecfea1…393f

## 2. Pre-freeze controls re-run (receipt mode only; no chromium)
PIN=0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688.

| control | command (abridged) | rc | observed | committed control | verdict |
|---|---|---|---|---|---|
| no-work base | `git -C $LANE cat-file -e bdf403ff:scripts/check-iframe-chooser-round92.mjs` | 128 | fatal: path not in bdf403ff | controls/rc.txt `base-has-counter rc=128` | PASS |
| no-work r91 | counter `--receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json --expect-nonce tabi-r92-donothing --json` | 1 | 198 findings, 21 unique ids | counter-donothing-r91b.json (198 / 21) | PASS |
| positive | counter `--receipt controls/receipt-positive.json --expect-nonce tabi-r92-ctl-pos --json` | 0 | clean, checkCount 93, 0 findings | counter-positive.json | PASS |
| wrong-site | counter `--receipt controls/receipt-wrongsite.json --expect-nonce tabi-r92-ctl-wrongsite --json` | 1 | 25 findings, ids cross-host, child-host, child-url, iframe-target-count, browser-iframe-targets, iframe-target-url, iframe-target-frame, chooser-session, answer-session | counter-wrongsite.json (subset, consistent) | PASS |
| forgery battery | `negatives-iframe-chooser-round92.mjs --receipt controls/receipt-positive.json --expect-nonce tabi-r92-ctl-pos --expect-driver-sha256 $PIN --scratch <scratch>/battery --json` | 0 | 31 cases, 31 ok, failed [] | battery.json (31/31) | PASS |

Re-run outputs saved at `.ufo/waves/round-92/w1/receipts-R92Reviewer/` (positive.json, wrongsite.json, donothing-r91.json, battery.json).
Scored run (read only): `scored/c1-live.json` verdict clean, checkCount 93, nonce tabi-r92-live-63a66abf7529, driverRun status 0, failures 0; `scored/c1-live.rc` = 0. Scored receipt legs X-1..3 and S-1..3 each show: X attached = one iframe target with targetId equal to childFrameId; S attached = []; chooser session iframe (X) / page (S); answer error null; files [["tabi-r92-answer.txt",22]]; one trusted click on `s`.

## 3. Code review — findings
Severity scale: high = counter can be green while a leg statement is false; medium = wording/number gap; low = robustness/cleanup/observability.

F1 (low, counter line 122/124/125). X-arm URL checks read `l.childUrl`, `l.browserIframeTargets[0].url`, and `iframeTargets[0].url` from the same leg object. In `--live` mode these come from Chromium (Target.getTargets, attachedToTarget), so the chain is independent of the counter. In `--receipt` mode a forger who writes all three consistently passes — already declared limit 6. Not a wording falsification.

F2 (low, driver 146-155). `leg.attached` is built from events collected up to the ready loop plus LOAD_WAIT_MS. An iframe attached later would show in `browserIframeTargets` (getTargets at line 155) but not in `attached`, producing a false `iframe-target-count`/`browser-iframe-targets` finding. Fails closed (the counter goes red), not green.

F3 (low, driver 165-177, S arm). The S arm evaluates the child on the page session with `contextId` = the LAST `Runtime.executionContextCreated` with `auxData.frameId === childFrameId && isDefault`, filtered by `e.sessionId === ps`, using `.pop()`. If the child context is re-created after load, the newest default context is used, which is the live document. If none exists the leg throws (`no default execution context`) and records a finding. Fails closed. The X arm evaluates on the iframe session without contextId, which is the iframe target's default context. No green-while-false path found.

F4 (neutral, counter 116/121). X requires exactly one attached target of type `iframe`; the filter ignores other attached types (workers etc.). The statement says "exactly one attached `iframe` target" and does not forbid other types, so the counter is not wider than the wording.

F5 (low, driver 202-206, cleanup). Cleanup sends SIGTERM and waits at most 3 s for `exit`, then removes `leg-<id>` unconditionally. There is no SIGKILL fallback. If Chromium ignores SIGTERM, the profile is deleted while the process may still be alive, and the process is not checked. The scored run exited with `driverRun.status` 0, which supports the normal path, but this seat did not observe the process table after that run, so no clean-removal claim is made here. Operability risk, not a claim breach.

F6 (low, counter 73-75, port cleanup). The counter removes `<scratch>/driver` after the child run, and the driver's `freePort` precheck covers only the start state. Nothing asserts that the three ports are free when the run ends. Nothing in the frozen wording depends on this.

F7 (low, observability; not a wording issue). The counter's `revision` is `git rev-parse master` at count time (counter line 52-53). Plan §Record item 7 states this. claims.json does NOT mention `revision`, and the claim statement does not depend on it. Substance is identical between plan and claims.json for the claim: the plan's list (schema, nonce, driver pin, chromium contains 155.0.8059.84, crossHost localhost, reps 3, answer {name,size 22}, failures [], leg set {X-1..3,S-1..3}, per-leg error null, child/parent URL hosts and ports) matches counter lines 90-136. Consequence: the frozen control `counter-positive.json` records revision bdf403ff, while this seat's re-run records 4fe08d26, so committed control output does not reproduce byte-for-byte. That is expected and declared, not a defect.

F8 (checked, no finding). Counter line 66 refuses to run the driver when sha mismatches (verdict findings, driver-pin). Counter lines 57 and 92 require file sha = pin = receipt pin, so a swapped driver cannot pass in `--live`. Battery case `driver-sha-forged` kills a forged receipt.

## 4. Verdict C1
VERDICT C1: neutral
- Evidence: `.ufo/waves/round-92/controls/counter-positive.json`, `.ufo/waves/round-92/controls/battery.json`, `.ufo/waves/round-92/scored/c1-live.json`, `.ufo/waves/round-92/w1/receipts-R92Reviewer/*.json`.
- The frozen statement (plans/round-92.md §Claim, claims.json `statement`) and the counter's checks describe the same conjunction. Declared limits 1-6 are restated in claims.json. No artifact I reproduced shows the statement false or wider than the counter's number (93 checks, 0 findings on the scored run).
- Caveat: this seat verified the receipt-mode path and the freeze bytes. It did not run `--live` (no port triple assigned; the Chromium runs are for the lane owner's scored run).

## 5. Checks run (exit codes)
- `git -C $LANE log --oneline -4 master` (ok); `git merge-base --is-ancestor 2bac104844eb a87c71766bc3` rc 0; `git rev-list --count 2bac104844eb..a87c71766bc3` → 1.
- `git show <rev>:<path> | sha256sum` for 3 scripts at 2bac1048, a87c7176, master: all match instrument-sha256.txt.
- `git cat-file -e bdf403ff:scripts/check-iframe-chooser-round92.mjs` rc 128.
- Counter `--receipt` positive rc 0; wrongsite rc 1; r91 donothing rc 1 (198 findings / 21 ids); battery rc 0 (31/31).

## 6. Cleanup and tooling
- Scratch `/fast/scratch/hyaku/tabi-r92/R92Reviewer` created for battery output, removed before yield (`rm -rf` rc 0).
- This seat launched no chromium and was assigned no port triple. `pgrep -f "remote-debugging-port=.*R92Reviewer"` is empty.
- Live chromium processes visible during the review (CDP port 19203, scratch `/fast/scratch/hyaku/tabi-r92/R92Critic2/live3/`) belong to seat R92Critic2. Not touched.
- No tools installed or updated. No commits, no git mutation.
