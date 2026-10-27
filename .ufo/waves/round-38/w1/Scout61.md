# Scout61 — W1-61

Axes: calibration, coverage. Read-only source/evidence review; no installs or scratch created.

## C1 — baseline control clause is not implemented in the counter

Frozen claim `.ufo/waves/round-38/claims.json:24-28` requires D1-D6 corrections and explicitly says “baseline control must fail.” In `counters/c1-routed-defects.mjs:226-233`, `evaluate` sets predicate using D1-D6 fields, findings count, and no baseline evaluation; the only displayed checks are those terms. The counter has `BASELINE` constant at line 52, but this alone does not execute the predicate at baseline. Thus a report that the frozen C1 predicate is true does not establish the separate baseline-control requirement.

Falsifier: demonstrate a baseline run recorded by this task’s evidence with nonzero exit/failing predicate, or show an explicit baseline invocation in the counter path. Conversely, any clean baseline invocation with predicate met would falsify the baseline-control clause.

## C2 — receipt confirms literal measured outcomes; socket guarantee remains bounded

The committed receipt `corpus/evidence/round-38/playwright-firefox/receipt.json:2-6,158-160,189-191,339-341,370-381` records Playwright 1.64.0, browserVersion 157.0, identical first-shot SHA `3e0c070a…ec56378c` in each run, zero survivors, `binding: true`, aggregate egress observations 0 and survivors 0. This supports the claim’s two-run/hash and observed-zero outcomes. The driver `scripts/playwright-firefox-loopback-round38.mjs:76-83` samples `ss` every 400ms and accumulates non-loopback socket lines; consequently “zero observed” is supported, but it cannot prove no short-lived socket existed between samples. This is a measurement bound, not evidence of positive egress.

A concrete scope limit in the driver (`:73-83`) is that the sampled PID list comes from a process-name grep for `firefox-1555/firefox/firefox`, and the sampler counts only matching lines containing those PID values. The zero result therefore says nothing about traffic via another process or unobserved transient connections. The claim is carefully phrased as zero *observed* non-loopback sockets, so this limitation does not contradict that literal predicate; it would contradict a stronger claim of guaranteed network isolation.

Potential evidence consistency concern: receipt line 5 has `firefoxVersion: null`, while its `browserVersion` is 157.0 (line 6). The knowledge row `corpus/knowledge/playwright-firefox-loopback-round-38.md:7-9` describes Firefox 157.0 and the driver docs at `scripts/playwright-firefox-loopback-round38.mjs:157-160` assign browserVersion from `probe.version()` but initialize firefoxVersion to null. Therefore the stated version evidence is browser-reported version, not an independently populated `firefoxVersion` receipt field. Falsify the distinction by a receipt with firefoxVersion explicitly populated or external binary-version evidence tied to the installed executable.

## Evidence basis / confidence

High confidence for source and receipt fields cited. No LSP device was available in this scout runtime; findings use direct file text, not semantic reference results. I did not execute drivers. Other falsifiers: a baseline-control receipt; an independently instrumented continuous socket capture; or version provenance bound to the Firefox executable.