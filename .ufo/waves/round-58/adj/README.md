# round 58 / C1 — the v18 adjacency meter generation

v18 is v17 with exactly the frozen declared change set (a)/(b)/(c) and nothing else: (a) the
generation relabel re-binds `AUDIT_REL`/`DELTA_REL` to `corpus/adjacency-host-{audit,delta}-r58.tsv`,
moves every schema string to `tabi-adjacency-host-v18` (die, selftest, run output), names the r58
ledgers in the predicate sentence and round 58 in the usage lines and header; (b) the new
`map-ref-unparseable` selftest case closes the R57MutMeter m4b survivor — a ref with a malformed
line-number suffix (`…:PROVINCE.md:12x`, audited under the same key) must yield exactly the one
finding `map-ref-unparseable`, so the `parseRef` `/^\d+$/ -> /^\d+/` weakening now fails the
selftest instead of passing 18/18 invisibly; (c) the per-case verdict lines are extracted verbatim
into the one named function `caseOk(c, findings, emitted)` used by the run loop, and the new
`harness-guard` case asserts that function's own truth table (`false`, `false`, `true` for
findings-match+predicate-mismatch, findings-match+count-mismatch, all-match), so the R57Reviewer
mG survivor — a harness that drops the predicate/count assertions — now fails
`harness-guard`. No check is dropped or weakened, every v17 selftest case is carried unchanged,
`verify()`/`parseRef()`/`observedStatus()`/`tsvParse()`/`predicateFrom()` are byte-identical to
v17, and the committed diff plus `v18-line-audit.txt` account for all 104 differing lines
(53 (a), 9 (b), 42 (c); zero unaccounted).
