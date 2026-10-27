# Critic24 — W1-24

Axes: **calibration**, **coverage**.

## Counterexample: C2 receipt's egress and cleanup observations are not a reliable zero-egress/zero-survivor proof

**Evidence:** In `scripts/playwright-firefox-loopback-round38.mjs:74-83`, Firefox PIDs are captured once by matching every process whose command line includes the fixed `firefox-1555/firefox/firefox` string, not by binding PIDs to the just-launched `browser` instance. The periodic socket sampler begins only after that snapshot and queries `ss` every 400 ms; `nonLoopback` counts only sampled lines (lines 77-83). Consequently the recorded `egressNonLoopback: 0` at `corpus/evidence/round-38/playwright-firefox/receipt.json:153-157,380` means no non-loopback socket was seen in the limited samples, not that no egress occurred. The receipt shows only two samples per run (`receipt.json:153-156`), so sockets opened and closed between samples are an explicit counterexample to what a literal “zero non-loopback sockets” would mean. Also, `firefoxPids` can include unrelated concurrent processes with that executable path (line 74), or omit a spawned process whose command line differs; survivor check only tests members of that same initial snapshot (`:137-142`). The reported zero survivors at `receipt.json:189-191,370-372` therefore does not establish cleanup of all descendants created by the run. `server.close()` at driver line 134 is not awaited; `portClosed` is checked immediately after only a fixed 600 ms sleep (lines 135, 140-141), so it is not a robust close-completion witness either.

This does **not** disprove that the recorded two runs performed the interaction steps: the committed receipt records same first-shot hashes at `receipt.json:158,339,375-379`, click/evaluation steps in its command arrays, and loopback request events. It falsifies the stronger C2 predicate component “zero observed non-loopback sockets / zero survivors” as an adequate binding proof: the evidence is a sparse sampler and PID-set-relative check, not exhaustive network/process attribution. The knowledge note itself appropriately limits the result to a host/build-scoped loopback demonstration (`corpus/knowledge/playwright-firefox-loopback-round-38.md:7-9`), but the claim predicate still asserts the zero-socket condition.

**Smallest safe correction:** Narrow the C2 predicate and report language to the actual evidence: “zero non-loopback sockets observed in periodic `ss` samples” and “zero PIDs from the initial matching PID snapshot remained,” explicitly not exhaustive egress/descendant proof. To retain an absolute zero-egress claim, replace sampling with run-bound network isolation/continuous socket event capture and bind browser process-tree identity to the launched context; await server-close completion before asserting port closure.

## C1 review

No additional C1 counterexample established in this bounded review. Its frozen counter at `.ufo/waves/round-38/counters/c1-routed-defects.mjs:178-223` checks the stated D5 histograms and D6 receipt endpoint strings, but those checks are outside my primary focus; I make no independent pass claim for C1. Frozen claim bytes identify C1/C2 predicates and kill rules in `.ufo/waves/round-38/claims.json:17-49`.

## Verification and scope

Read-only inspection at lane HEAD `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`; no runtime rerun, installs, or production edits. Axes impacted: **coverage** (egress/process cleanup observability and provenance), **calibration** (strength of the evidence claim).