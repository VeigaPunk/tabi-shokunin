# MutC1b — C1 drift-ledger build-tool mutation probe

Round 36 attempt 2, wave w2. Target: `.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs` (not the counter). Scratch clone checked out at `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`; the tool bytes were extracted from freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`.

## Baseline

Frozen tool SHA-256: `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` (matches frozen digest). Regeneration succeeded: 307 rows (304 unchanged, 3 moved, 0 stale). Regenerated and committed ledger SHA-256 both `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2`; `diff` was empty (byte-identical).

All actual probes ran the mutated scratch tool against that same lane clone and sibling Git objects, outputting to scratch TSVs. Each generated ledger had the baseline SHA-256 and an empty unified diff against baseline:

| Probe | Single-point mutation | Before tool SHA-256 | After tool SHA-256 | Regenerated ledger SHA-256 | Diff / result |
|---|---|---|---|---|---|
| m1 | Relocation lookup compares raw head/pin line bytes, not trimmed text | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `f52662d3d5a6cd8787da54ef27a399da094af8f6d228397dd6773dfea1d54d93` | `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2` | Empty; mutation insensitive on honest data. All 3 kaidoku relocation rows remained found at :748, :784, :815; each raw cited line had exactly one raw occurrence at head. Mask: no cited-line whitespace difference affects these relocation results. |
| m2 | In the `cited text absent at head` branch, emit `unchanged` instead of `stale` | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `40a3ff37ecee13ab129e28994de845c44d812b72ac2e9e692482996bd9dca95a` | `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2` | Empty; mutation insensitive on honest data. Mask: all 307 rows derive as 304 unchanged / 3 moved / 0 stale, so the branch is never reached. |
| m3 | Remove the optional `(also :N)` secondary-occurrence note | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `c8119b4cf8f8581b57de26cd8e5287eaac0d40956390ae7846fdb510a154b196` | `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2` | Empty; mutation insensitive on honest data. Mask: none of the 3 moved cited strings has a second trimmed occurrence at head; all notes are just `verbatim at :N`. |
| m4 | Remove `musketeer` from the BG vocabulary | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2` | Not applicable: this is a no-op copy, not a valid mutation. The frozen build tool contains no BG vocabulary, `musketeer`, or delta-candidate leg (search count for `musketeer`: 0). It derives drift rows from screen refs and delta pins. BG vocabulary/delta candidate screening is in the counter, outside this assigned target. No delta-candidate conclusion can be attributed to this build tool. |
| m5 | Remove trimming specifically from the unchanged comparison (compare raw pin/head lines) | `c8153a5a6d9e29a3991a0d753c482d2963aaa0e224978386d96ad661c62a2be1` | `f87bd80e06d6aa42b13a6ae19b3daa19f8f1f9f17adec4355f52a488c9f63170` | `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2` | Empty; mutation insensitive on honest data. Although 113 of the cited pin/head line values had leading/trailing whitespace, none changed the derived status under the raw unchanged comparison. |

Every probe exited 0 and printed 307 rows (304 unchanged, 3 moved, 0 stale). The three moved refs remained the same as baseline. `m4` was explicitly not counted as killed/survived because no valid mutation point exists in the assigned tool.

## Restoration and verdict

Mutations and generated files existed only in `/fast/scratch/hyaku/tabi-r36/MutC1b`; the lane checkout was a scratch clone. Frozen tool source remains represented by its extracted pristine copy and its hash above. Scratch directory was removed after evidence capture.

VERDICT finding — m1, m2, m3, and m5 are honest-ledger survivors, masked respectively by raw-identical relocations, zero stale rows, unique moved-text occurrences, and no raw-comparison status changes. m4 is inapplicable to this build tool: BG/delta vocabulary is absent; no smallest correction to the build tool is supported by this probe.
