# W1-15 — Reviewer15

Axes: calibration (primary), coverage. Attack: C1 D3 LOG hash verification.

## Finding — C1 D3 is vulnerable to Git replacement refs

`.ufo/waves/round-38/counters/c1-routed-defects.mjs:148-149` checks each hard-coded round-37 hash with plain `git cat-file -t <hash>` and `git merge-base --is-ancestor <hash> <REV>`. Neither invocation disables replacement-object lookup nor refuses replacement refs. Consequently, a repository with `refs/replace/<round37-hash>` can cause Git's object/ancestry queries to inspect substituted objects rather than the frozen commit objects, while D3 records the hash as present/commit/ancestor. This is especially relevant because D3's acceptance condition depends on the authenticity of the commit identity; a replacement ref can change how Git resolves the object without changing the hash text present in LOG.md. Falsifier: rerun D3 against a clean clone with a replacement ref for one listed round-37 hash pointing to a non-ancestor commit; the counter must reject or explicitly refuse the repository. Fix evidence should use `GIT_NO_REPLACE_OBJECTS=1` for both calls and/or enumerate/refuse replacement refs before evaluating.

## Bounded baseline check

Ran `node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json`; exit 1 as expected at the frozen claim commit. Output reported D1 correction absent and D2 stated tally absent; it recomputed 34 reports as 23 ok / 11 finding. This is baseline evidence, not evidence of the post-change claim predicate.

No C2 runtime falsification attempted; no runtime receipt was available in the frozen baseline. No installs or repository mutations performed.
