# BuildOracle — round-22 C1 semantic lifecycle oracle

## Scoped implementation

Implemented and committed only these two assigned files in the private clone:

- `.ufo/waves/round-22/measure-c1.mjs`
- `corpus/evidence/round-22/semantic-expectations.json`

Private-clone commit: `08762490719909b4be812efd46065b7d4c72de73` (fixture identity `tabi-fixture <fixture@invalid.local>`).

SHA-256:

- `.ufo/waves/round-22/measure-c1.mjs` — `3d3a22e47cffc317cbe4e58bf9a0fae7a9ccb647fe895676c202150fe29525c7`
- `corpus/evidence/round-22/semantic-expectations.json` — `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`

## Behavior

The new CLI exports `evaluate(files)`, `filesAt(revision)`, and fixed `INPUT_PATHS`. `evaluate` returns the requested round-22 schema/metric, value aliases, verdict, exit, stable findings, and per-case rows. Missing both the new expectation file and note is baseline `0`/exit `0`; a partial expectation/note state fails at `0`; malformed expectation data fails at `0`; a full-hash/Git input failure returns could-not-evaluate/exit `2`. Normal CLI reads only exact regular Git blobs at the supplied full 40-hex commit with isolated Git configuration and `GIT_NO_REPLACE_OBJECTS=1`. `--selftest` dispatches to the sibling `.ufo/waves/round-22/selftest-c1.mjs` using `process.execPath` and inherited stdio/status.

The fixed case table distinguishes: finite pending; click and requestSubmit completion with exact nonce-bound output; native-submit completion with the landing output as an array and unavailable submit state as `null`; reset/removal cancellation with exact error text; rejection, throw, invalid-submit and autosubmit-invalid errors; and autosubmit-positive completion. The delayed case requires the pre-release observation to remain active for a finite interval and its correlated completion to occur after release. All rows validate the current invocation ID/frame/input chain, ordered frame sequence, finite observation windows, receipt-summary-to-raw equality, and action/navigation semantics. A coherent, resealed status mutation is still compared to the fixed expectation and yields the relevant semantic finding.

The expectation bytes are pinned by the counter constant. Producer identity and fixture bytes are fixed; receipt and raw/acquisition artifact hashes are checked relationally through `receipt.evidence.sha256`, `execution.receiptSha256`, and `execution.artifacts` rather than fixed per-case raw digest literals. This preserves coherent mutation sensitivity for the semantic findings. Acquisition metadata retains `measuredRevision: "uncommitted"`; this is a historical own-work measurement and does not authenticate the acquisition, add knowledge, or claim branch coverage. The old round-21 counter was not imported or changed.

## Retained evidence read

Inspected the retained round-21 receipt, all twelve per-case JSON traces, their linked fixture paths/digests, the acquisition execution record, existing lifecycle note, producer, and prior counter implementation. Read the native-submit fixture HTML directly. Raw-frame projections showed the invocation-correlated outcomes and sequence details:

- `na-pending`: no response in the bounded pre/action/post observations; form active before and after.
- `na-click`, `na-requestsubmit`: correlated `Completed` with `{ok:true,nonce,q}`; submit observations recorded.
- `na-native-submit`: `Page.frameNavigated` to `/landing?q=<nonce>` precedes `Completed`; output is `[{"dummy":"landing"}]`; post-navigation submit observation is unavailable, not an empty array.
- `na-reset`, `na-remove`: `Canceled` with distinct reset/removal error text.
- `na-reject`, `na-throw`: `Error` with distinct exact response error text and distinct page error observations.
- `na-delayed`: pre-release marker at sequence 15 shows the form active; release is sequence 16 and the correlated `Completed` response is sequence 17.
- `na-invalid-submit`: `Error` with the exact required-field message and no submit event.
- `auto-positive`, `auto-invalid`: respective correlated `Completed`/`Error` responses occur before the pre-action marker; invalid uses `not-an-email` and the exact native validation text.

The retained acquisition record identifies producer `scripts/webmcp-lifecycle-round21.mjs` at SHA-256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`, acquisition revision `1b5f449ad15525d281fda4558aeef1086f1e4a65`, and `measuredRevision: "uncommitted"`. The note used as interpretation evidence is S101 own-work, not publisher corroboration.

## Risks and blocker

The required new note input, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, was absent from the private clone’s `corpus/knowledge` listing. It is outside the two assigned implementation paths, so it was not created here. Until supplied with the exact canonical first line pinned in the expectation file (`source: S101 — ...`), the oracle correctly emits `source_binding` and credits zero rows. Integration must supply that note before the parent’s measurement gate can count the twelve rows.

No tests, builds, linters, formatters, browser runs, or smokes were run, as directed. No tools were installed or updated.
