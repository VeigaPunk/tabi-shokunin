# MutC1b — C1 build-tool probe

Scratch clone at f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7; pristine tool extracted from freeze 2e7b7a8920bff47fae6f75c3d06e48e37767099e. Pristine tool hash `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1`; regenerated ledger was byte-identical to committed ledger (307 rows, 304 unchanged / 3 moved / 0 stale; both SHA-256 `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2`).

All 4 applicable mutations regenerated that exact digest with empty diff:
- m1 raw relocation matching: tool hash `f52662d3d5a6cd8787da54ef27a399da094af8f6d228397dd6773dfea1d54d93`; 3 kaidoku moved lines still found at :748/:784/:815. Mask: exact unique raw occurrences.
- m2 stale-branch inversion (`stale` → `unchanged`): `40a3ff37ecee13ab129e28994de845c44d812b72ac2e9e692482996bd9dca95a`. Mask: 0 stale rows, branch unvisited.
- m3 drop `(also :N)`: `c8119b4cf8f8581b57de26cd8e5287eaac0d40956390ae7846fdb510a154b196`. Mask: no moved cited string has multiple occurrences.
- m5 raw unchanged comparison: `f87bd80e06d6aa42b13a6ae19b3daa19f8f1f9f17adec4355f52a488c9f63170`. Mask: no derived status changed (113 cited pin/head line values had edge whitespace, but no status delta).

m4 is inapplicable, not a valid survivor: frozen tool has no BG vocabulary, `musketeer`, or delta-candidate leg (literal search count 0). Delta candidate screening belongs to the counter, not this assigned tool. The m4 no-op hash remained `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` and ledger unchanged; no claim about delta candidates is made here.

Detailed method, outputs, and diffs: `.ufo/waves/round-36/w2/MutC1b/report.md`.

VERDICT finding — four honest-data survivors are masked by absent triggering conditions; m4 is outside this tool's behavior surface. No smallest correction to the build tool is supported by these probes.
