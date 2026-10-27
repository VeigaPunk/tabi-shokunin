# Critic26 — W1-26

Axes: **coverage**, **calibration**. Frozen claim bytes are at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`.

## C2 counterexample: egress observation is not bound to this run

**Evidence:** In `scripts/playwright-firefox-loopback-round38.mjs` lines 73–83, `firefox.launch()` starts a browser, but the PID list at line 74 is populated by searching *all* processes whose command line contains the literal `firefox-1555/firefox/firefox`; it does not derive the PID(s) from the returned Playwright browser/process. The `ss` sampling at lines 77–82 filters sockets to that global name-match list, and line 81 counts a line as loopback if it contains `127.0.0.1` or `::1` anywhere. Thus a renamed/alternate executable or a changed command-line layout can leave the launched browser outside the sampled PID set; unrelated matching Firefox instances can instead be included. The receipt's `egress.nonLoopback=0` (receipt lines 153–157) then does not establish the claimed zero egress for the browser under test. This is a concrete measurement-boundary defect, not evidence that this observed run actually emitted non-loopback traffic.

The same driver only records `egress.samples`/`lines` and `nonLoopback` (lines 76–84), with no positive minimum sample count or assertion that the launched browser PID set was nonempty. Hence a zero-socket/empty-PID run can report zero egress vacuously. Receipt line 5 also leaves `firefoxVersion: null`, although browserVersion is separately present as 157.0 (lines 4–6); this weakens explicit engine-version provenance, though not the screenshot hash itself.

**Falsifier / bounded check:** C2's egress clause would be falsified by one established non-loopback TCP connection owned by a PID proven to be a child of the launched browser during the run, or by evidence the launch PID is absent from `firefoxPids` / the sampler performs zero samples. The existing receipt reports no raw sample timestamps, owned PID-to-launch binding, or per-sample socket evidence, so it cannot independently rule these out. No rerun was needed to identify the instrumentation gap.

**Smallest safe correction:** obtain process identity from the launched Playwright process (or enumerate and validate its descendant tree), require the expected browser PID set nonempty, and fail closed if sampling never occurs; inspect remote peer endpoints structurally rather than regex-matching the entire `ss` line. Record the derived launch PID/tree and sample count in the receipt. Do not claim this demonstrates actual egress in the frozen run.

## C1

No additional falsifiable C1 finding established in this review; no C1 tally/control/census/numstat rerun performed. The above issue impacts **coverage** (C2's stated egress capability predicate), and secondarily **calibration** because the zero is not a well-bound measurement. No tools installed.
