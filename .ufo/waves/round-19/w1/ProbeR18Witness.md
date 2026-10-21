# Round 19 C2 baseline probe — freshness witness

**Observed:** 2026-10-21. **Lane tip:** `66251bfc1aef393e4aec599e950a8deb867736bb` (B). **Witness:** `scripts/freshness-witness.mjs`.

Ran eight `node scripts/freshness-witness.mjs --rev <value>` invocations from a sandbox clone at B. `HEAD`, `@`, `master`, `refs/heads/master`, and the 7-/12-hex prefixes are all non-40-hex arguments. For the off-branch probe, created empty commit `63c61aeadaafb0beb3ab2394937550bb2e54aa86` on `r19/ProbeR18Witness`; `refs/heads/master` remained B. The valid full ancestor probe used B itself.

## Results

Complete stdout/stderr strings for every invocation are retained in [ProbeR18Witness.json](ProbeR18Witness.json). Each refusal has empty stdout and exit 2; the exact stderr is shown here.

| Shape | Revision passed | Exit | Stdout | Stderr / finding |
|---|---|---:|---|---|
| Symbolic `HEAD` | `HEAD` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| Symbolic `@` | `@` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| Symbolic `master` | `master` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| Ref name | `refs/heads/master` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| 7-hex tip prefix | `66251bf` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| 12-hex tip prefix | `66251bfc1aef` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| Off-branch full hash | `63c61aeadaafb0beb3ab2394937550bb2e54aa86` | 2 | empty | `FRESHNESS_WITNESS finding=witness_revision_refused detail=--rev must be an ancestor of refs/heads/master` |
| Valid full ancestor | `66251bfc1aef393e4aec599e950a8deb867736bb` | 0 | `FRESHNESS_WITNESS tip=66251bfc1aef393e4aec599e950a8deb867736bb source=--rev`, 34 `PIN_MATCH` lines, then `FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=66251bfc1aef393e4aec599e950a8deb867736bb baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production` | empty |

## Classification

- **Refused with a declared reason:** all seven refusal cases emit the declared `finding=witness_revision_refused` token. The six symbolic/ref-name/short-hash inputs share the detail `--rev requires a 40-hex commit revision`; the off-branch full hash reports `--rev must be an ancestor of refs/heads/master`.
- **Accepted:** the valid full ancestor B is accepted by the witness and its downstream freshness gate exits 0 with 34/34 pins matched.
- **Refused for an unrelated reason:** none observed.
- **Reason-token granularity:** the witness does not emit distinct `symbolic_rev`, `short_rev`, or `off_branch` finding tokens; it emits the generic `witness_revision_refused` finding and the details above. Thus the input classes are refused for the intended reasons, but this baseline does not provide per-class finding tokens.

## Witness source citations

All anchors below are in the raw witness source body, SHA-256 `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1` (no decoder/transformation). Source URL: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs`; accessed 2026-10-21.

- `revisionPattern` requires 40 lowercase hex characters (`scripts/freshness-witness.mjs:10`); invalid `--rev` values take the refusal at lines 120-122, including `refused('--rev requires a 40-hex commit revision')`.
- `refused` constructs the `witness_revision_refused` finding at lines 21-23; the catch prints the finding and detail to stderr at lines 278-280. This is the token observed for the six syntax/shape failures.
- Full revisions fail ancestry at lines 142-145 when `merge-base --is-ancestor <value> refs/heads/master` does not return success; the emitted detail is `--rev must be an ancestor of refs/heads/master`.
- A valid full hash is returned as `source: '--rev'` at line 146, then the child checker is invoked at lines 259-272. The observed clean gate result is retained in the JSON artifact.

No tools were installed. No build, lint, formatter, or test suite was run; this was the requested behavioral probe.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ProbeR18Witness`
- Branch: `r19/ProbeR18Witness`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `63c61aeadaafb0beb3ab2394937550bb2e54aa86` (empty commit used only to produce the off-branch test revision)
- Changed paths in sandbox commit: none
