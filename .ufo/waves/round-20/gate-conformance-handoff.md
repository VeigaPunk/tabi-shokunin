# Round-20 frozen wave gate conformance handoff

**Status:** implemented in the L1-authorized same-identity conformance clone. **Untested:** no tests, selftests, builds, linters, or formatters were run; main owns post-integration execution. This is an author-authored metadata guard, not authentication of actor/order/isolation, not independent certification, and not a no-harm proof.

## Commit and scope

- Clone: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-20/final-clones/ExecFrozen`
- Branch: `round20/ExecFrozenConformance`
- Base: `4ae99816b8994fdedc159156d8d9d242dd5c4782`
- Commit: `52e46dee2130dbf0903e744e3952e30bdabdd72a`; author and committer `tabi-shokunin <tabi@shokunin.local>`.
- `git diff --name-only 4ae99816b8994fdedc159156d8d9d242dd5c4782 HEAD` listed exactly:
  - `.ufo/waves/round-20/check-wave.mjs`
  - `corpus/evidence/round-20/wave-check-expected.json`
- Clone status after commit was empty. No push and no changes to production implementation files.

## Frozen gate behavior

`node .ufo/waves/round-20/check-wave.mjs --frozen DIR` reads `DIR/expected.json` and fixed inputs `spec.json`, `registry.json`, `snapshot.json`. Frozen expectation schema is `tabi-r20-frozen-wave-v1`, with exactly three SHA-256 pins under `inputs` (the exact input JSON byte digests) and an `expected` object containing `exit` and sorted unique `findings`.

The gate validates the expectation shape and exact input-pin set, reads each input as a regular non-symlink file, verifies all three byte digests, and only then parses and compares metadata. A digest mismatch exits 2 with finding `snapshot_tampered`. A missing or invalid pin set exits 2 with `frozen_expectation_invalid`. A symlink or non-regular JSON input, including `expected.json`, exits 2 with `input_not_regular`; unreadable/missing files use `input_unreadable`. A readable malformed input JSON uses `input_invalid_json`. A well-formed frozen capture whose metadata result differs from its pin exits 1 with `frozen_expectation_mismatch`; a matching result exits 0. Existing `--spec FILE --registry FILE --snapshot FILE` direct diagnostic mode remains available and does not claim to authenticate capture.

No actual frozen capture data was created; L1 supplies it later. The frozen fixtures built by `--selftest` exist only in temporary directories.

## Selftest coverage

`--selftest` compares CLI exit/findings to the separately committed expectation file using isolated temporary fixtures. The 27 expected cases include:

- Clean, null/mismatched waves; spec wave null and blank; registry wave blank; absent agentId.
- Reconstructed phase, `return-after-integration`, `observed=false` alone, top-level reconstruction marker, tracked diff, out-of-scope path, and absent preserved-source status entry.
- Frozen clean and tampered input; mismatched and unpinned expectation; missing input; symlink and non-regular refusals for each of spec, registry, snapshot and expected JSON.

The reconstruction marker guard checks top-level keys and string values only; nested metadata is not traversed. The existing source-entry requirement and hardcoded round baseline/path scope remain finite author-authored metadata policy, not proof of ordering. Operationally L1 captures directly after all 64 settle and before any clone import; timestamps are not used as ordering evidence.

## Verification and blockers

- No tests or checks were run, per assignment. Main should run `node .ufo/waves/round-20/check-wave.mjs --selftest` once after integration, then use `--frozen DIR` on the actual L1-authored capture directory.
- Frozen gate verifies integrity relative to its authored `expected.json` pin. The checker cannot establish that the capture or expectation was honestly authored, who captured it, or the real-world settle/import order.
- No tools installed or updated.
