# W1-20 — C1/C2 adversarial review

Axes: calibration (C1), coverage (C2). Scope: C2 driver, binding, egress, cleanup; plus C1’s D1–D6 receipt semantics.

## Counterexample (C2): runtime and cleanup evidence are self-reported, and egress sampling misses most of the session

The receipt supports the declared successful fixture interactions (two identical first-shot hashes; each run shows click/evaluate/history commands; zero reported non-loopback connections and survivors), but its egress/cleanup fields are not robust process/session-bound evidence:

- `scripts/playwright-firefox-loopback-round38.mjs:74` captures Firefox PIDs by globally grepping every process whose args contain `firefox-1555/firefox/firefox`, not by associating them with the just-launched `browser` instance. The sampler at lines 77–83 then samples only those IDs every 400ms and counts only sockets returned by `ss -tnp`. A process that starts/connects/exits between samples, or any browser child not matching that global grep, is unobserved. In the committed/untracked receipt `corpus/evidence/round-38/playwright-firefox/receipt.json:153-156,334-337`, both runs have only 2 samples despite each run spanning ~200ms navigation plus subsequent interactions; `nonLoopback: 0` is therefore absence of an observed connection, not evidence of zero egress over the session. The driver also has no DNS-off configuration or network namespace/egress firewall (contrast C2 counter’s stated DNS-off/whole-session approach, `c2-firefox-bidi-v4.mjs:54-57,81-83`; this driver itself is separately claimed in `claims.json:37`).
- Cleanup evidence is similarly bounded: driver lines 131–143 closes browser/server, waits 600ms, then checks survivors by intersecting a process-name grep with the earlier global PID list; receipt lines 189–191 and 370–372 merely repeat zero. This does not establish that all children spawned by either run are gone.

Falsifier for C2’s “zero observed non-loopback sockets / zero survivors” as session-wide guarantees: a short-lived external TCP connection made entirely between sampler ticks, or a Firefox subprocess absent from the initial matching PID set, would leave these fields unchanged. Smallest safe correction: launch with an attributable child/process tree and record that root PID; sample all descendants continuously/with kernel event or enforce loopback-only egress at OS boundary; verify the full process group/cgroup is empty after shutdown. Otherwise weaken the claim to the exact observation interval and PID set, and call it sampled evidence rather than zero egress.

## C1 D1–D6

No counterexample established in this bounded review. The frozen C1 counter’s contract is explicit at `.ufo/waves/round-38/counters/c1-routed-defects.mjs:13-44`, but I did not execute its command or independently rederive each receipt. The current worktree contains untracked round-37/38 artifacts (`git status --short` observed untracked `.ufo/waves/round-37/w1-results.json`, round-38 receipts/knowledge, etc.), while the frozen claim commit is `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`; therefore these working-tree artifacts cannot establish committed-at-REV C1 success. A counter run at the explicit measured revision, with clean-clone receipt outputs, would resolve this boundary.

## C2 positive evidence / scope boundary

Receipt `corpus/evidence/round-38/playwright-firefox/receipt.json:2-6,11-12,158-190,193-191?` reports Playwright 1.64.0, browserVersion 157.0, two equal first-shot SHA-256 values `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, interaction outcomes, and zero counters. Driver source `scripts/playwright-firefox-loopback-round38.mjs:93-130` implements the page actions. The runtime receipt is in the local worktree but not at frozen claim commit (it is untracked); this report does not treat it as frozen-commit evidence. I did not rerun the browser driver.

## Evidence commands

`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`.

`git -C ... status --short` showed the above round artifacts untracked. No installs, production edits, or scratch files were made.
