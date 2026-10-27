# RevC2Receipt scoped findings

Replayed the receipt command against frozen counter revision `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`. The frozen claims blob SHA-256 is `40740f82aee080b9a1cd2c002d31c8f36455622c8b37b95bb03e101086fcc009`, matching the receipt; mutant SHA-256 is `a2ba6eea5164f70cc2a87302df5e23147937631c9a2c31a71b4686f3011cf11e`, also matching. Actual replay exit was 1 and output included `d7-sentence-mismatch`. Predicate token/count comparison confirms the differing `23 ok 11 finding` / `23 ok 12 finding` clause, but structural comparison after normalizing that predicate did not establish equality of all remaining claims content. The worktree claims file SHA differs from frozen commit content. Full evidence and exact replay output: `.ufo/waves/round-39/w1/RevC2Receipt/report.md`.

VERDICT finding — replay confirms refusal and d7; the whole fixture's only-difference invariant is not established.
