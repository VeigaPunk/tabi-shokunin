# Reviewer11 — W1-11

Axes: calibration, coverage.

## Finding — C1 D6 does not establish the claimed numstat endpoints (calibration)

The frozen counter's D6 check accepts endpoint substrings, not a numstat diff whose actual range is baseline..REV. In `.ufo/waves/round-38/counters/c1-routed-defects.mjs:211-222`, it picks the first matching receipt name (lines 213-218), then sets `namesBaseline` if the file contains either the full baseline hash or merely its first 12 characters (line 220), and sets `namesRev` if it contains merely the first 8 characters of REV (line 221). It never parses or validates the numstat command/header or verifies that the diff was computed between those endpoints. Consequently a receipt for an unrelated range can pass D6 if its text mentions those prefixes; because `out.predicate` only checks these booleans (`:226-233`), this can satisfy the D6 predicate while the claimed endpoint property is false. `git ls-tree` file listing plus a misleading/stale receipt is the falsifier; a D6 implementation that parses an exact command/header and checks the two full endpoint identities would close this gap. This is a concrete weakness in the frozen acceptance instrument, not evidence that a particular post-freeze receipt was forged.

## C2 bounded attack — no additional literal-predicate counterexample

The driver at `scripts/playwright-firefox-loopback-round38.mjs:76-83` samples `ss` every 400ms and counts only matching Firefox PID socket lines. This cannot prove absence of unsampled or short-lived non-loopback connections, but the frozen predicate explicitly says “zero observed non-loopback sockets”; that limitation alone does not falsify its literal wording. Cleanup closes the browser and clears the sampler at `:131-135`, then checks captured Firefox PIDs at `:137-142`; no independent post-freeze runtime receipt was available in the frozen `measure/` directory, so I make no run/binding/cleanup claim. This is a residual evidence gap, not a falsification of the two-run predicate. The relevant runtime check to falsify C2 would be a captured non-loopback socket during a run, differing first-shot hashes, or a captured surviving browser process.

No installs or scratch files used. The requested LSP device was not available in this tool session; citations above are direct source reads, not semantic LSP results.
