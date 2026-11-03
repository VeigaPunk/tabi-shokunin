# Round 61 integration disposition

The original claims remain exactly as frozen at 7032914c. No replacement predicate is admitted.

C1: K4 cannot pass the frozen snapshot header (`lane<TAB>`). The L1 temporarily repaired that header during review, before recording the correction; Sentinel and Critic correctly flagged frozen-input drift. The original snapshot is restored byte-exact. The repair survives separately as `c1/snapshot-r61-header-repair-candidate.tsv` (same 20 heads). It is candidate work, NOT a pass on the frozen claim. The wide-screen clause is independently reachable with the old instrument after that header repair; its stale-row-control premise was wrong without --verify-rows.

C2: runner/counter interface initially diverged (mixed recorder versus pointer-only recorder, missing shared sequence, legacy journey requirements). Integration split pointer/mouse recorders with page-stamped seq and added a pointer-schema path. Nonce acceptance changed from 12 to 16 hex after seats had begun scoring. These are substantive instrument/receipt-shape changes; pre-data wording cannot erase that history. Final selftest 129/129 and path-selftest 129/129 are local regression results, not frozen-claim admission. Earlier seat mutation pins do NOT certify final integrated code. No capability row is admitted this round.

Final code pins: measure/instrument-pins.json. Retained checks: measure/counter-selftest-final.txt, counter-path-selftest-final.txt, v20-selftest-final.json, v20-list-observed-final.json. Old seat outputs remain intact and identify the exact bytes tested.

A fresh committed live pointer run may demonstrate the integrated artifact. It does not retroactively cure the frozen claims, nor close the critic's named forgery residuals.
