# W1-16 — Critic16

Axes: **calibration**, **coverage**. Primary #4 C1 D4 lesson/red-control; bounded C1 counter and C2 driver-source review.

## Falsifiable finding — C1 predicate is false at frozen REV

Command, in lane repo:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Observed exit **1**. JSON output reports `d1.stalePresent=true`, `d1.supersedingCorrection=false`, `d1.w2Absent=true`; D2 recomputes 23 ok / 11 finding / 34 reports, but `d2.stated=null`. This is direct counterexample to C1 predicate at the purported frozen measurement revision: the predicate's D1/D2 gates fail irrespective of later D3-D6 fields. Frozen counter source explicitly requires superseding correction and a stated tally (c1-routed-defects.mjs:14-21, 44); claims.json:24-28 says predicate true at measured REV. Smallest safe correction: do not claim C1 true at this REV; establish/freeze an honest correction and ensure the tally text is present, then remeasure. Do not weaken the predicate.

## C2 source-level no-finding / limitation

Driver source lines 77-82 samples sockets every 400ms and counts only `ss` rows matching the PID list captured at line 74; this establishes bounded sampled observations, not universal “zero observed non-loopback sockets” for all Firefox descendants or intervals. Lines 72-74 capture process IDs by matching executable path, which may omit helper descendants with distinct command lines. Lines 131-142 close browser/server and check process IDs/port closure; the process check is only for PIDs previously captured. This is a falsifier target for the broad reading of the claim, not proof that an actual run leaked: no receipt/runtime run was performed. Smallest correction is to phrase evidence as sampled matching-PID observations, or bind descendant PIDs and monitor all sockets over the run; preserve the current claim only if its intended bound is explicit. C2 claims.json:37,41 require loopback-only/zero observed egress and zero survivors.

No C2 runtime receipt was independently re-run in this attack. No tools installed; scratch not used.
