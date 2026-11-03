# R61Exec1 — C1 instruments

Axes: adjacency (owned score 8), frozen-delta fidelity, carried-case coverage, bounded snapshot reads, write-scope hygiene.

## Delivered
- counters/c1-adjacency-host-v20.mjs: v19 pure P1/P2/P3 core and all 38 existing selftest cases retained; required --snapshot, r61 default ledgers, optional explicit candidate --audit/--delta, post-audit live-head drift disclosure, unresolvable-head findings, missing-generation-ledger findings.
- counters/rebind-r61.mjs: r59 rebind mechanics and adjudication vocabulary retained; reads sibling bytes at supplied snapshot heads; writes candidates outside corpus only. Default previous dispositions come from corpus/adjacency-host-delta-r59.tsv at --rev. Default metadata output is under --out, avoiding an implicit counter-directory write.
- Exact differing lines: [v19-v20.diff](v19-v20.diff), [r59-r61-rebind.diff](r59-r61-rebind.diff).

## Pins (SHA-256)

- b76d972e47cbb32fc3e9fd21385aaa627aed223e8c54d50a9f55b817920cebc7  .ufo/waves/round-61/counters/c1-adjacency-host-v20.mjs
- 20acefdaa795273d60ced94dc100546c7d4cfc7f798069700f501c96057c2e5d  .ufo/waves/round-61/counters/rebind-r61.mjs
- 0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c  .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs
- 577fef0019362ed102e1b839c77f403ea6fd51dc81dc730311232c03367c3645  .ufo/waves/round-59/adj/rebind-r59.mjs
- d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e  .ufo/waves/round-61/claims.json
- 8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27  .ufo/waves/round-61/c1/snapshot-r61.tsv

## Exercised commands and evidence
Full argv, exit status, stdout and stderr for every externally invoked implementation/smoke command are in [commands.json](commands.json). Fixture git argv and statuses are in selftest.json, results[38].fixtureCommands. No builds, lint or unrelated tests were run.

- Final node v20 --selftest: exit 0, allPass true, cases 42, pass 42. All 38 carried cases plus moved-sibling snapshot green with drift, missing snapshot exit 2, unresolvable head refusal exit 1, and r61 ledger-generation mismatch refusal. Full output: [selftest.json](selftest.json).
- Required rebind smoke at frozen revision 7032914cb5229dc9ce2b867827e6f1ee5db7673b with snapshot-r61: exit 3, 110 unresolved browser-ground hit lines. No candidate audit/delta ledger was written. [rebind-smoke.stderr.txt](rebind-smoke.stderr.txt), [unresolved.json](unresolved.json), [rebind-snapshot.json](rebind-snapshot.json). Rebind stdout is empty; it emits no counts object on this failure path. Snapshot metadata records rosterCount 20; unresolved count is 110.
- Required v20 smoke with those scratch ledger paths: exit 2, explicit ENOENT for missing candidate audit ledger, no counts/predicate output. [meter-smoke.stderr.txt](meter-smoke.stderr.txt). This is NOT a green smoke or a data-pass claim.
- NO-OVERRIDE would read corpus/adjacency-host-audit-r61.tsv and corpus/adjacency-host-delta-r61.tsv at the frozen --rev through git cat-file. Both git cat-file -e commands exit 128: neither exists at that revision. No corpus files were created.
- Initial selftest/rebind invocations each exited 1 due to an authoring-time newline-escape syntax error; corrected before final selftest. All attempted outputs retained in commands.json.

## Gaps, frozen-input findings, deviations
1. Smoke is blocked by 110 new whole-line dispositions not carried from r59. Inventing dispositions would exceed this code-only seat; L1 must supply explicit adjudications to rebind at its data pass. The frozen predicates were not widened and no claim file was edited.
2. Frozen snapshot header is literally lane TAB empty, not documented lane TAB head. Parser explicitly accepts that frozen legacy spelling as well as the documented header; its bytes remain unchanged. This is a disclosed input-format accommodation, not a predicate change.
3. Fixtures use Node fs.mkdtempSync under the assigned scratch rather than a shell D=$(mktemp ...) command. Git initialization is explicitly -C; every later object/ref mutation first asserts rev-parse --show-toplevel equals that fixture directory. No git add, git commit, jj, or external-repository mutations were invoked. Fixture commits are created with commit-tree and objects with hash-object/mktree; all are disposable and removed in finally.
4. Selftest scratch base is intentionally the assigned absolute scratch path; portability elsewhere requires adapting that fixture base. Production runs do not use it.
5. No LSP interface is mounted in this tool inventory; symbol work used source reads. No tools were installed/updated. Observed node during requested checks is v26.12.0, unlike the frozen host description's v24.21.0.
6. The initial exploratory wc/ls/cat/head pipeline exited 0; it was an unnecessary shell-read deviation, with no file writes. A named service was inadvertently selected for that finite read and exited naturally (reported exit 0); no background work remains.

## Parent handoff
Perform adjudication/data-pass integration, then run the frozen v20 and unchanged r60 wide-screen gates at the committed data revision. This seat did not run data-pass gates, mutate claims, or adjudicate unresolved source lines. No chromium or loopback processes were started, so browser teardown receipts are not applicable.

## Self-evaluation
Accuracy 4/5 (42/42 executable cases; smoke honestly red). Completeness 3/5 (requested green candidate smoke unavailable without 110 dispositions). Clarity 4/5 (full receipts linked; command log is long). Actionability 4/5 (unresolved lines and exact data-pass prerequisite retained). Conciseness 4/5 (full details live in artifacts). Overall 3.8/5. Highest-impact next action is L1 adjudication, not a code-side fallback.

Scratch directory removed before yield; retained receipts above replace all scratch evidence references.
