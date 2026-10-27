# W1-59 — C1/C2 source reconnaissance

Axes: calibration, coverage. **Finding: the frozen C1 counter's D6 endpoint test accepts a receipt naming only a short prefix of the measured revision.**

## Concrete counterexample

In `.ufo/waves/round-38/counters/c1-routed-defects.mjs:217-222`, D6 reads the first matching numstat receipt, checks `BASELINE` by full string or 12-character prefix, then considers the revision named when `text.includes(REV.slice(0, 8)) || text.includes(REV)`. Thus any receipt containing the first eight hex digits of REV passes the revision leg, even if it does not identify the full measured commit (and even if the prefix is ambiguous among objects). The predicate at lines 226-233 consumes these booleans without stronger endpoint binding.

This differs from D3's explicit commit-and-ancestor checks (counter lines 51-54 and relevant D3 implementation) and makes D6's claimed `baseline..REV` precision weaker than an exact endpoint assertion. Falsify the D6 precision claim with a numstat text containing `BASELINE` and only `REV.slice(0,8)` but not full REV; it satisfies `namesBaseline`/`namesRev` as implemented. The narrow correction is to require the complete 40-hex REV in the receipt and validate the numstat command/window provenance, rather than accepting an 8-hex mention.

## C2 contextual evidence

The driver source independently exposes a coverage gap: `scripts/playwright-firefox-loopback-round38.mjs:73-83` launches Firefox, takes one immediate global `ps | grep` snapshot keyed to a hard-coded `firefox-1555/firefox/firefox` path, then samples `ss` only for those PIDs every 400ms. There is no nonempty-PID or successful-sample requirement; the generated `pid=()` filter can therefore leave `nonLoopback` at zero vacuously. Cleanup at lines 137-139 counts only those same initially captured PIDs. This finding is scoped to source semantics, not a claim that a particular runtime receipt exhibited the gap.

Evidence read from frozen lane source under `tabi-shokunin`; no files outside this report were changed.