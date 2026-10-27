# CritC1Samples — round 39

Axes: coverage; calibration.

A loopback-only TCP fixture opened 21 connections, closing each after 12 ms, with 100 ms `ss -Htn state established` probes for 2.2 s. Result: 1 of 22 probes observed the fixture port. Short-lived connections can evade periodic sampling between ticks. This does not demonstrate non-loopback egress.

Frozen evidence: `claims.json` C1 sets minimum 8 samples and 1000 ms coverage. The frozen C1 counter checks these quantities and aggregate nonLoopback socket counts, but does not check cadence or maximum gap (counter lines 95-121). Therefore the counter cannot reject a receipt solely because short-lived connections could have been missed. It validates receipt data rather than rerunning the live sampler. The frozen pre-integration receipt shows C1 exit 0; this does not establish continuous observation.

Exact command and output are in `.ufo/waves/round-39/w1/CritC1Samples/report.md`. Fixture was loopback-only; scratch directory was removed by EXIT trap; no tools installed.

Smallest safe correction: describe coverage as periodic sampling rather than continuous detection. Continuous detection requires an event/audit source or an explicit maximum-gap guarantee, not merely sample count and elapsed duration.

VERDICT finding — fixture produced 21 short-lived connections with only 1/22 sampled observations; the thresholds do not rule out between-tick blind spots.