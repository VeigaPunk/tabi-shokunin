# Reviewer12 — W1-12

## Findings

### High — C1 predicate is false at the frozen revision; the claimed corrected state is not evidenced there

I ran the frozen counter against a clean clone at the stated frozen revision:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /fast/scratch/hyaku/tabi-r38/Reviewer12/clone --json
predicate: false
D1: stalePresent=true, supersedingCorrection=false, w2Absent=true
D2: stated=null; recomputed={ok:23,finding:11,error:0,none:0,reports:34}
D3: all six hashes are commits and ancestors, but presentInR38Section=false for all; freezeLandingStated=false
D4: corpus/lessons/round-38.md absent; m3-sentence-mutant.json absent
D5: census-end.txt absent at REV
D6: no numstat receipt under .ufo/waves/round-38/measure
```

The exact frozen revision is a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc (`claims.json` bytes match that commit; digest files also match their frozen digests). At that revision SCORECARD.md:2078 still has the stale “68 seats” line; the counter's correction test requires a later correction (counter `c1-routed-defects.mjs:84-89`). LOG.md at that revision has no `## Round 38` tally/hashes; the counter requires the stated 23/11 tally and hash ledger (`:105-111, 139-154`). The recomputed D2 numbers themselves are correct: 23 ok / 11 finding across 34 reports.

The current worktree has uncommitted +8-line additions in each of SCORECARD.md and LOG.md (`git diff a8e7d50 -- SCORECARD.md LOG.md`); the LOG addition says the frozen-counter verdict remains pending. Those edits do not alter the frozen revision read by the counter. `find` found no round-38 census/numstat/red-control receipt, and `git log --all -- .ufo/waves/round-38/measure/ .ufo/waves/round-38/baseline/` returned no commits. This falsifies C1 as asserted at the frozen REV and directly hits its kill rule (missing correction/receipt). It does not establish what a later, fully integrated revision might show.

### Medium — C2 process ownership/survivor and egress evidence is not bound to the launched browser tree

The driver uses `firefox.launch()` then one global process-table grep to populate PIDs (`scripts/playwright-firefox-loopback-round38.mjs:73-83`); the same name/path grep and captured-PID filter define survivors (`:132-142`). This does not identify the returned browser's process tree. In my bounded two-run re-run, the receipt reported 14 survivors. Observer logs established that these were seven processes from a concurrent, foreign Firefox tree (parent PID 667207, ppid 665938; forkserver/socket/tab/rdd/tab/utility), captured by both runs' global grep; my own run's captured process PIDs exited. No Firefox-1555 processes remained after the runs. Thus the metric can report unrelated processes as survivors, and is not a per-run cleanup proof.

The same run provides direct evidence of the capture gap: my own run1 captured PIDs 670054 (parent), 670299 (forkserver), and 670367 (socket); the observer also saw its tab 670425, rdd 670434, tab 671153, and utility 671908, none in the receipt's run1 PID list. The committed receipt likewise captures only three PIDs per run (run1 `[397394,397786,397834]`; run2 `[401023,401401,401452]`). Its egress/survivor fields therefore apply only to the snapshot-selected PIDs, not a proven complete browser tree. Run1/run2 committed PID sets are disjoint, so I found no direct evidence that the committed receipt itself captured a shared foreign PID.

### Low — C2 engine identity field is unpopulated

The committed receipt says `firefoxVersion: null` and `browserVersion: "157.0"` (`corpus/evidence/round-38/playwright-firefox/receipt.json:4-6`). The driver initializes `firefoxVersion: null`, obtains only `probe.version()`, and never uses its `FIREFOX_BIN` constant (`:17,157-160`). Playwright's installed registry maps Firefox to revision 1555 / version 157.0, and a live launch used the `firefox-1555` binary with `-juggler-pipe`; therefore the installed runtime was observed, but the receipt does not record an executable identity/digest.

## Positive evidence / residual risk

- My two-run re-run reproduced the committed first-shot SHA in both runs: `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`; click, history, evaluation and loopback request steps completed. The committed first-shot binding is reproducible on this host.
- Committed runs report `egress.samples=2`, `lines=1`, `nonLoopback=0` each. Independent observer: 113 full TCP socket-table snapshots across concurrent Firefox-1555 activity, 17 Firefox-owned socket observations, all endpoints 127.0.0.1, zero non-loopback. A separate one-run TCP+UDP observer recorded 12 snapshots, 15 Firefox-owned TCP lines, zero Firefox UDP lines; the driver's receipt reported binding=true, survivors=0, and post-run process count 0. All observed fixture requests were to 127.0.0.1. These support the scoped loopback behavior on this host, not a continuous or general no-egress guarantee.
- Residual: the driver's 400ms sampler is TCP-only (`ss -tnp`) and checks only captured PIDs; it can miss transient sockets and UDP. The independent UDP sample was bounded to one run and 12 snapshots.

No tools were installed. Scratch outputs were removed before handoff.