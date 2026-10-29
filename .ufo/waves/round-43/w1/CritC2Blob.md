# CritC2Blob — C2 r1 type-gate edge classes

**Axis:** calibration. **Outcome:** the commit and annotated-tag edge classes are both refused as non-blobs; no type-gate defect found.

## Commands and observed results

Built two local fixture repositories under `/fast/scratch/hyaku/tabi-r43/CritC2Blob` and ran the frozen checker against their preserved copies. The exact driver invocation was:

```sh
S=/fast/scratch/hyaku/tabi-r43/CritC2Blob
OUTDIR=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritC2Blob
mkdir -p "$S" "$OUTDIR"
trap 'rm -rf -- "$S"' EXIT
GIT_REAL="$(command -v git)" node "$S/build-type-gate-fixtures.mjs" --work "$S" --out "$OUTDIR/type-gate-cases.json"
```

Before each fixture's first commit, `git -C "$D" rev-parse --show-toplevel` matched `$D`. Tool versions observed: Node `v24.21.0`; Git `2.56.0`. The checker file hash was `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743`, matching the frozen claim digest.

Exact checker invocations:

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev 0d8b8daa5ae68aaa3ed44e53372bfc4844ffae68 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritC2Blob/commit-gitlink-fixture-repo --json
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev 320c4bb10f90038257dd8b30f94eeaf453bcb7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritC2Blob/annotated-tag-entry-fixture-repo --json
```

Both invocations exited `1`, returned `"predicate": false`, and included `r1a-not-a-blob`; the exact details were:

- Gitlink to a commit, object size **2429 bytes**: `corpus/evidence/round41/playwright-egress/receipt.json resolves to object type 'commit', frozen sentence requires blob`.
- Mode-100644 entry pointing to an annotated tag, object size **2381 bytes**: `corpus/evidence/round41/playwright-egress/receipt.json resolves to object type 'tag', frozen sentence requires blob`.

Both objects exceed the 1000-byte floor. Traced checker subprocesses issued `cat-file -t REV:<receipt-path>` for each and **did not** issue `cat-file -s REV:<receipt-path>`; the witness path's size query did occur. The result JSON records `checkerIssuedTargetCatFileTypeQuery: true`, `checkerIssuedTargetCatFileSizeQuery: false`, and empty `r1aSizeFindingIds` for both cases. This matches the source order at checker lines 97–101: `requireBlob()` then `continue` on failure, before `gitBlobSize()` and the 1000-byte floor. R4 similarly gates with `requireBlob()` and continues before its size query at lines 178–181.

The tag fixture is deliberately unusual and useful: `git ls-tree` labels the mode-100644 entry `blob`, while `git cat-file -t REV:<path>` resolves its referenced object as `tag`. The frozen checker uses the latter type query, so the mode display does not bypass the gate.

## Evidence

All fixture and output artifacts are under `.ufo/waves/round-43/w1/CritC2Blob/`:

- `type-gate-cases.json` — revisions, object types/sizes, exact checker stdout/stderr, findings, and trace summaries.
- `commit-gitlink-fixture-repo/` and `annotated-tag-entry-fixture-repo/` — preserved fixture repositories.
- `commit-gitlink.git-trace.log`, `annotated-tag-entry.git-trace.log` — checker Git subprocess traces.
- `commit-gitlink.checker-output.json`, `annotated-tag-entry.checker-output.json` — checker outputs and traces.

The first attempt to bundle the deliberately malformed tag-entry repository failed with Git's observed error `object c3c27b761e54c12fbc6bc6f73dcb5e5cc3026339 is a tag, not a blob` / `entry 'receipt.json' ... has blob mode, but is not a blob`. The fixture was preserved as a repository copy instead; checker execution on that copy succeeded as recorded above. The scratch directory was explicitly removed and confirmed absent before completion.

No tools were installed or updated. The fixture intentionally omits unrelated C2 controls, so its overall predicate is false; this test establishes only the requested r1 type-gate behavior, not full C2 calibration acceptance. No frozen checker, counter, or claims bytes were changed.

**Smallest safe correction:** none; retain the existing object-type gate and its before-size ordering.

VERDICT ok both tested non-blob object types are refused before the receipt size floor.
