# W1-05 — Reviewer05

## Finding — C1/D6 counter can accept an incorrect numstat window (calibration)

**Counterexample to the verifier, not a claim that the current receipt is wrong:** `.ufo/waves/round-38/counters/c1-routed-defects.mjs:213-222` collects matching receipt names but reads only `names[0]` (line 217). It then marks the window valid when the chosen file contains the baseline hash (or its first 12 characters) anywhere and the measured revision hash (or its first 8 characters) anywhere (lines 219-222). It neither checks an exact `baseline..REV` endpoint declaration nor validates other matching `numstat-at-*.txt` receipts.

Thus, with two matching receipts, a first receipt whose text includes both endpoint strings but whose numstat was generated for a different range, followed by a bad/mismatched receipt, satisfies D6. This is falsifiable by adding a wrong-window matching receipt (or changing the first receipt's actual numstat range while retaining both hash strings) and rerunning the counter: the D6 gate still passes. The frozen claim calls for “numstat window precision,” so its counter does not establish that predicate. At the frozen revision `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`, the measure directory has no committed numstat receipt; this finding is about false-positive acceptance by the counter, not evidence of a currently committed wrong-window receipt.

## C2 — No finding on the stated receipt checks

The receipt `corpus/evidence/round-38/playwright-firefox/receipt.json` records browser version `157.0` (line 6), identical first-shot hashes and `binding: true` (lines 158, 339, 375-380), loopback-only HTTP request URLs (lines 160-187, 341-368), zero sampled non-loopback sockets (lines 153-156, 334-337, 380), zero Firefox survivors (lines 189-191, 370-381), and closed fixture ports (`portClosed: true` in both runs). Driver logic at `scripts/playwright-firefox-loopback-round38.mjs:76-83` records sampled socket observations; consequently I make no claim about unsampled/transient sockets beyond the claim's “zero observed” wording. The new knowledge note at `corpus/knowledge/playwright-firefox-loopback-round-38.md:7-9` limits the result to a host/build-scoped loopback demonstration.

## Verification limits

The frozen claim bytes at the named commit match the current `claims.json` SHA-256 (`90290008aee738cc0362801bb71f96adb44d6434030582716a1e53ff5587185b`). LSP was unavailable in this session (`xd://lsp` returned “No such tool”); checks above use direct artifact/counter evidence, not semantic LSP results. No tooling installed.
