# Cross-lane git-object evidence adjacency scan

## Scope and method

Frozen round-37 contract declares adjacency as the current lowest axis (8) and targets C1 digest binding for the round-36 delta-pins JSON and C2 replace-ref refusal plus `GIT_NO_REPLACE_OBJECTS` (claims.json C1/C2, lines 7-15, 27, 51-72). The routed defect notes identify the same two mechanisms (round-36-verifier-spotcheck.md lines 90-97).

Enumerated source files matching `*/.ufo/waves/round-*/counters/*.{mjs,js,py}` across sibling lane repos. This finds only kotodama's Python counter files outside tabi; there are no sibling `.mjs` counters in the requested `counters/*.mjs` path pattern. Inspected kotodama round-74 `accept-c.py` source for the two patterns; this is adjacency reporting only, not a recommendation or fix for that lane.

## Findings

- **(a) frozen JSON read without digest binding: no sibling finding in the inspected counter sources.** Kotodama round-74 `counters/accept-c.py` reads frozen claims bytes via `git show` (line 542), records `frozen_sha256` over those bytes (line 629), and compares the lands claims blob to that digest (lines 1694-1697). Its map blob is also hashed and compared to the frozen map digest (lines 1687-1690). This is evidence against class (a) for this instrument, not a fleet-wide assertion beyond the enumerated counter source files.
- **(b) git reads without replace-object safeguards: kotodama round-74 `counters/accept-c.py:248-255`.** Both `git()` and `git_bytes()` invoke `git -C ...` with no explicit `GIT_NO_REPLACE_OBJECTS` environment and no `--no-replace-objects` option. The reviewed file contains no `refs/replace` enumeration. Its frozen claims read is a git-object read at line 542 through `git_bytes`.
- Other sibling counter source files found: kotodama rounds 72-73 `accept-c.py` and `accept-ca.py`, round-74 `accept-ca.py`, `capture-evidence.py`, and `junk-fixtures.py`. This scan does not classify those older/auxiliary files as production counter instances; no additional class finding is asserted for them here.

## Evidence / limits

The target pattern `*/.ufo/waves/round-*/counters/*.mjs` returned only tabi files, so a literal mjs-only fleet scan yields no sibling candidates. The additional extension-aware enumeration found the kotodama Python counters above. No non-counter tool/script inventory was treated as a counter, and no other lanes' sources were modified.

VERDICT finding sibling replace-object safeguard gap in kotodama round-74 accept-c.py; no sibling frozen-input digest-binding gap found in inspected counters.
