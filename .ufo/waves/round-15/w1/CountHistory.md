# CountHistory — round 15

Scope: read-only audit of the USER gate's exact `scripts/check-round-contract.mjs` identities and preservation of its history guard. No gate, counter, test, suite, or browser was run; no source was changed. The mounted tool inventory exposes no LSP device, so anchors below are source line observations, not LSP-derived semantic proof.

Axes: exact byte identities; whether the history check is reached; negative regression coverage.

## Exact digest set: currently narrow and byte-matched

`check-user-round-contract.mjs:14-41,204-225` defines two HEAD-accepted identities and three historical-only identities. The bytes and Git blobs observed independently were:

| Role | Revision | Git blob | SHA-256 |
|---|---|---|---|
| pinned prior | `92d700d6a8aa9855f1e9d2cc8e12c82f762a1367` | `b2eb8316f41cd1039330e45f6739c07c5f11eace` | `7d403cee003c3b49e865d57e034821ea925252efc231b0b22ded62ac5410c398` |
| historical intermediate | `1199150a12f3979672452e2ae49260237e09a76f` | `d871e73d303600fd691691bb45be7087e4a3c3a5` | `6f9eddc74f0e10ac5046ed9ecd99650db4f338c004f5d0e349503b6515a6b299` |
| historical cutover | `1212207fd7fad4adf1df1b3a2bde549235bd144d` | `43db9f4bba56a27114ed116c85f27b80227e74bd` | `8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d` |
| current checker bytes | `HEAD` (`3b49a9c7f53e1583d3dd0aac8e0ae2852d0c1343` blob) | `3b49a9c7f53e1583d3dd0aac8e0ae2852d0c1343` | `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` |

The path-specific `git log` after the pin contains only `1199150…`, `1212207…`, and `ed69b15467cc9d1df994d8bf474c5639b47286bf` (round-14 non-shell cutover); the latter's current file SHA-256 matches the explicit current digest. Thus, in the inspected source, `ROUND_SCRIPT_ARCHIVED_SHA256` is prior + the two intermediates, the history loop admits those plus current, while `ROUND_SCRIPT_ACCEPTED_SHA256` admits only prior + current. No wildcard or extra HEAD identity is present (`:33-40,219-224`).

`checkHistory` pins the production path, diffs the pinned checker paths, and routes changed `scripts/check-round-contract.mjs` through `pstackDrift` → `acceptedRoundScript` (`:240-250,301-312`). For a path that reaches this check, the pinned bytes must match the prior digest; every path-changing commit returned by `git log` must match one of the four explicit digests; HEAD must match prior or current (`:206-224`). This is the intended exact, non-broadened policy.

## Defect: net-zero checker edits bypass the history walk

`checkHistory` calls `pstackDrift` only for rows in `git diff --no-renames --name-status PIN HEAD` (`:305-310`). If the final checker bytes equal the pinned prior bytes, the path is absent from that endpoint diff, so `acceptedRoundScript` is never called. A pin→unknown checker bytes→restore exact prior sequence therefore skips the otherwise-present `git log PIN..HEAD` identity validation. This is a static control-flow defect: it contradicts the comment that any unrecorded checker change fails (`:14-16`) and the function's stated pin-to-HEAD history policy (`:204-224`).

Suggested fix: invoke the exact checker history/HEAD identity validation whenever the production pin is active, independently of whether the checker appears in the endpoint diff; retain the same four history identities and two HEAD identities (do not broaden either set).

Suggested regression: in an isolated history fixture with the exact prior checker bytes already present at the pin, commit an unaccepted checker body, then commit restoration of the exact prior bytes. Assert the USER gate fails with `history_rewritten`. Do not use the current generic fixture unchanged: `writeGoodFixture`'s pin has no checker file (`:614-700`), so adding then restoring prior bytes would still leave an endpoint difference from that fixture pin and would not expose this bypass.

## Coverage gap: only one history-only identity is tested as HEAD

The existing `round_script_rollback_to_cutover` control installs the second intermediate (`1212207…`) as fixture HEAD and expects `history_rewritten` (`:892-897`); random unaccepted bytes also reject and current bytes pass (`:962-969`). The first intermediate (`1199150…`) is not separately asserted as an invalid HEAD. Suggested table-driven negative control: attempt each historical-only digest as HEAD and assert `history_rewritten`, while separately retaining positive history-only use and prior/current HEAD positives. This protects the exact intended distinction if the accepted list is later edited.

No execution evidence is claimed. Main integration should run the authorized checks after all work is integrated.