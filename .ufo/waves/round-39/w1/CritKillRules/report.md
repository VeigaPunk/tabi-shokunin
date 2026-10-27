# CritKillRules — round 39

Axes: coverage (C1) and calibration (C2).

## C1: concrete kill-rule counterexamples

- **Unbound/empty owned set admitted (counterexample).** The positive path checks that `tree`/`roots` are nonempty and that `source` contains “children of this node process” (counter lines 100–104), then only checks that each root PID occurs somewhere in `tree` (106–109). It does not parse/verify PID parent relationships or require numeric/unique PID values. Thus fabricated `tree:["x"]`, `roots:[{"pid":"x"}]`, `nodePid:1`, and a matching source string passes this owned-set test while proving no process ownership. This is a concrete true kill condition (unbound set) with no corresponding refusal. Evidence: source lines 100–109.
- **Counterfeit final-sweep agreement (counterexample).** `fs` need only be truthy and not `unavailable`; absent `ss`/`proc` objects yield undefined, which is not `!== 0` at lines 117. So `{finalSweep:{}}` passes the final sweep condition; likewise intermediate `sockets.ss/proc` values are only read for `nonLoopback`, with missing values rejected as undefined (114), but there are no sample counts / timestamps / linkage showing the sweeps were observed. This allows an empty “available” final-sweep record to be accepted. Evidence: lines 112–118.
- **Version not necessarily live-session-bound (counterexample).** The test accepts the literal browserVersion plus userAgent regex and any binary path containing `ms-playwright/firefox-<digits>/` (127–130), without checking that version was obtained from the live session; matching strings can be supplied independently. The kill rule's unbound-version condition therefore has a satisfiable false claim.
- **Other clauses:** run count, refused flags, SHA format/equality, sampleCount >=8, coverageMs >=1000, nonloopback zero, aggregate egress/survivors, portClosed, and refusal of v1 each have explicit checks. Root equality does not establish ancestry. V1 control refusal is based on schema/tree/sample-count and can be refused for those properties alone (65–74); this is appropriate for the known v1 control, but is not proof of all C1 semantics.

## C2: concrete kill-rule counterexamples

- **Fabricated mutant receipt admitted (counterexample).** D4 tests only JSON fields: numeric nonzero `observedExit`, differing sentence, and two distinct 64-hex strings (168–174). It does not bind the hashes to claims bytes, verify a counter invocation/output, or bind the exit to a run. A fabricated receipt with arbitrary unequal hashes and exit 1 satisfies the relevant condition. D4 is included in the predicate (260), so this is an explicit kill-rule miss.
- **Census mismatches can be invisible (counterexample).** D5 compares row count and parsed histograms internally (193–207), but the top-level predicate only requires `receiptRows === counterRows` (261); tier/status equality findings are included via the global zero-findings condition. However the parser silently ignores malformed/unrecognized histogram keys and accepts a line such as `tiers:` that parses to `{}`; equality then depends on mine's histogram, whose parse only populates when split-column count >=10. In particular malformed source table rows counted as rows but skipped in tier/status can be mirrored as absent histograms and pass—receipt does not evidence the demanded census semantics.
- **Numstat receipt window can be forged by substring (counterexample).** D6 uses `text.includes(BASELINE)` and `text.includes(REV)` (219–220), not parsed exact window metadata. A receipt can contain both tokens in unrelated prose and the exact expected diff body; acceptance does not establish that it names the window as the protocol requires.
- **D1-D3 / D7:** D1 uses targeted substring/regex checks and can accept stale/correction-looking unrelated text; D2 tally parser recognizes the stated tally in the remainder of LOG after `indexOf('## Round 38')` (no guard if heading missing, though that then generally fails tally). D3 checks hash strings in section plus ancestry and landing token. D7 compares claim index 1 predicate exactly to the constant. These have lexical/provenance limitations, but no additional concrete false-met case established here beyond the explicit counterexamples above.

## Evidence / commands

Inspected frozen claims and counter source directly:
- `read .../round-39/claims.json` (frozenAt `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81d196caeb8d24551928b883802697aabb`)
- `read .../counters/c1-egress-session-bound.mjs:50-141`
- `read .../counters/c2-routed-defects-v2.mjs:64-265`
- `read .../measure/pre-integration-counters.txt`: C1 at d3232d56 exits 0; C2 at same REV exits 1.
- `read .../measure/census-end.txt` returned `Path ... not found`.

The frozen C1/C2 source files were examined; no fixture was executed. The cited defects are static counterexamples from the conditions above.

VERDICT finding — C1 accepts non-proven process ownership and empty final-sweep objects; C2 accepts fabricated mutant receipts and substring-only numstat windows.
