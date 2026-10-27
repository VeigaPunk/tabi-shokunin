# MutC1FinalSweep — scoped finding

Probe details and actual JSON/exits are in `.ufo/waves/round-39/w1/MutC1FinalSweep/report.md` and its adjacent evidence files.

The frozen C1 counter fails closed for the challenge to final sweep data: changing run1 `finalSweep.ss.nonLoopback` to `1` while deleting `finalSweep.proc` and aggregate `sockets.proc` produced exit 1, `predicate:false`, findings `run1-egress` and `run1-finalsweep-egress`. Pristine and restored receipts produced exit 0 / `predicate:true`.

A second probe removed only `runs[0].samples[0].proc`. It still produced exit 0 / `predicate:true` / no findings. Thus sample surfaces are checked only in per-run aggregate totals and finalSweep, not required on every sample; this is a coverage finding. Scratch receipt hash before/after restoration matched: `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`.

VERDICT finding — post-close final-sweep mutation is rejected, while an individual sample missing one surface is accepted.
