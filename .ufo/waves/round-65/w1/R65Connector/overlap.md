# R65Connector sibling-overlap scan (round 65, wave w1, read-only)

Scope: the 20 sibling lanes under /home/vgpnk/Projects/shokunin/*-shokunin (tabi-shokunin skipped), each PROVINCE.md and SKILL.md. Terms: receipt, provenance, adjacency, matrix, mutation. Rows below are one per sibling that claims a ground, with the strongest hit; secondary hits are in the report.

chousa | chousa-shokunin/SKILL.md:100 | research-gate round-38 counters: receipts bound to gate sha via verify-receipts.py (RECEIPT_BINDING_MATCH) | C2
kagi | kagi-shokunin/PROVINCE.md:72 | corpus/adjacency.tsv declares ownership partition rows; scope-gate.sh checks them fail-closed | C1 (name and ledger shape only; partitions, not per-key dispositions). Also C2 via SKILL.md:465 receipt_sha256 custody
kaidoku | kaidoku-shokunin/SKILL.md:988 | receipt-validate checks receipt digest, pin and binding, plus mid-run drift | C2
kake | kake-shokunin/SKILL.md:538 | receipt-replay gate re-derives c1/c2 receipts at a named revision against embedded digests | C2
kama | kama-shokunin/SKILL.md:313 | receipt-tip binding: every receipt cited by the round record must bind to the tip | C2 (revision binding; no input sha pin)
kasegi | kasegi-shokunin/SKILL.md:155-156 | submission package verifier: per-artifact sha256, same-digest redaction receipts, custodian chain | C2 (near; package gate, not a matrix input)
kengaku | kengaku-shokunin/PROVINCE.md:100 | R75-C2 receipt-attribution primitive; reports sibling argv-digest replay as a distinct mechanism | C2 (near; also owns its own tripwire mutation test, PROVINCE.md:483)
kotoba | kotoba-shokunin/SKILL.md:471 | check_scoped_rules: provenance-authenticating arms; round-62 arm audit counts survivors | C2 (near; cedes mutation method to tameshi, SKILL.md:14)
kumitate | kumitate-shokunin/SKILL.md:646 | receipt-bind gate: receipt tool_sha256 hashed from git show at the named revision | C2
mado | mado-shokunin/SKILL.md:804 | mado-frozen-provenance probe: mapped snapshot lines and source digests equal the round-17 index | C2 (near; probe, not a gate on matrix inputs)
mori | mori-shokunin/PROVINCE.md:655 | receipt provenance grammar: counter-sha256 headers verified against path bytes at the receipt revision | C2
revenger | revenger-shokunin/SKILL.md:54 | receipt_ok conjuncts include fixture_sha256==expected_hash, with forged-receipt controls | C2
tameshi | tameshi-shokunin/PROVINCE.md:3-4 | owns the reusable method: hermetic suites and mutation testing; never edits sibling gate code | C2 (method only; no receipt binding)
tsukuroi | tsukuroi-shokunin/SKILL.md:2482 | adjacency-overlap gate anchors six sibling-overlap rows OV1-OV6 via immutable Git reads | C1 (name only; anchor counts, not ledger dispositions)

Non-overlap (scanned, no ground claimed on the terms above): audio, game-dev-2d, game-dev-3d, kotodama, lore, souji. Their hits are own-output provenance, removal receipts, label gates, or source provenance.

siblings-with-overlap: 14
