# BuildDebt — review chronology and supplied-history classifier

## Implemented

Assigned implementation is in the private clone only:

- `.ufo/waves/round-22/check-review-chronology.mjs`
- `.ufo/waves/round-22/debt-expectations.json`

The CLI accepts one local JSON input or `--selftest`. It compares exact producer SHA-256s, the exact artifact-scope path, receipt path/digest, and a non-empty set of per-artifact paths/digests; it also compares acquisition start with the supplied review clock and preserves whether that clock is a `review_return` or `review_observation_upper_bound`. Any known producer/artifact mismatch or acquisition after the review observation yields `review_scope_gap` (exit 1). Missing artifact, receipt, or per-artifact digests are `artifact_scope_unavailable` (exit 2); matching producer identity by itself cannot yield a positive result. Unknown clocks and missing event history also remain unavailable (exit 2). The positive verdict is limited to `matched_supplied_scope` and requires matching supplied scope, a non-late acquisition, and supplied event history.

Provenance is emitted as `claimed-in-receipt` or `read-at-revision`, copied from the input rather than verified. Supplied event records remain in per-seat input order, retain every provided event (including all failures and following messages/activities), and expose first terminal separately from latest status-bearing event. Missing history produces `status: unavailable` and `seats: null`; it is not reconstructed. Event patterns are limited to the supplied records and do not certify wake/dispatch authority or global completeness.

The independent expectation file declares 14 isolated-input cases: absent event history; peer activity after failure; broadcast routing; late failure; chronology gap; exact pre-observation positive; unknown clocks; differing producer; same-producer path mismatch; receipt-digest mismatch; per-artifact-digest mismatch; missing artifact digest; missing receipt digest; and producer-only match with unknown artifact scope. `--selftest` writes its inputs under a fresh temporary directory and checks each expected exit/finding (plus selected status/provenance assertions). **The selftest was not run.** No build, test, lint, formatter, smoke, or actual-input classifier invocation was run.

## Retained chronology evidence

- `.ufo/waves/round-21/runtime-execution-bounded.json:11-14` records the earlier producer SHA-256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` and start `2026-10-21T13:07:01.895287+00:00`.
- `.ufo/waves/round-21/w2-returns.json:4-12` records snapshot `readAt` `2026-10-21T13:49:02.529912+00:00`; its seat object shows name/role/latestOutput, not an individual return clock. `.ufo/waves/round-22/w1/ConnProvince.md:52-54` independently notes the absence of per-seat clocks.
- `.ufo/waves/round-21/runtime-execution-finalized.json:12-14,21-22,47` records final producer SHA-256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`, wrapper start `2026-10-21T13:51:46.597742+00:00`, receipt digest `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`, and the first case artifact digest `f17fe86f9fe8c6ba0e9d71303d7d23cfc7518a0e9e6288a55d0b5f37047b796e`.
- `corpus/evidence/round-21/runtime/receipt.json:3-6,53-56` records receipt start `2026-10-21T13:51:46.773Z`, the same final producer digest, and that first case path/digest.
- `.ufo/waves/round-21/history/runtime-v4/receipt.json:3-6,45,53-56` retains the earlier producer/receipt's first case at the same logical case path, with different digest `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` and loopback port 35363; the final receipt reports port 43143 at `corpus/evidence/round-21/runtime/receipt.json:45`.

**[INFERENCE]** The retained W2 snapshot precedes the final receipt's acquisition start, and the bounded and final producer/case identities differ. Supplying those facts must therefore produce `review_scope_gap`; W2 findings remain scoped to the earlier bytes. This is a chronology/scope classification only, not authenticated settlement. No filesystem mtimes, Git commit/author times, `history://`, or old counter output were used as evidence.

## Limits and blockers

The checker reads only its caller-supplied JSON; it does not read Git, receipts, browser state, dispatch state, or a history service. Therefore an input's provenance labels and digests are not authenticated against underlying files. Incomplete artifact identity fails unavailable rather than being inferred from producer equality. Event classifications describe only the supplied ordered records; they do not establish that the event history is complete. No blocker to the assigned implementation remains.

Private-clone commit (fixture identity `r20 <r20@example.invalid>`): `854d5eab484777f3384194cb530dd093869501c4`.

Committed path digests:

- `.ufo/waves/round-22/check-review-chronology.mjs` — SHA-256 `fb6f2aca3fccd9445417433b8f6a93d9c3e67c38523322683ea0834c7c0c417d`
- `.ufo/waves/round-22/debt-expectations.json` — SHA-256 `06dc77b9867cdda441d4f90a63d06750bf340baa68612a36dc5f56414e72214d`

Report: `.ufo/waves/round-22/w1/BuildDebt.md`
