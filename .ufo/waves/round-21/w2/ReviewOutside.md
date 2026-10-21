# ReviewOutside

## Findings

### P2 — malformed post-navigation submit data is accepted as unavailable

`.ufo/waves/round-21/measure-c1.mjs:96` treats every non-array `post.value.submits` as `null` via `Array.isArray(...) ? ... : null`; there is no check that the field is genuinely absent. The documented repair is specifically to preserve unavailable post-navigation state as null. The current `na-native-submit` observation is validly unavailable (`corpus/evidence/round-21/runtime/na-native-submit.json`, after-action `pageState` has no `submits`; its receipt summary has `after.submits: null`).

Concrete counterexample: change that after-action value to a present malformed value such as `submits: {"unexpected":true}`, mirror it in the observation frame, `pageObservations`, and `after.pageState`, retain `after.submits: null`, and update the evidence digest in the receipt. The current equality check still derives `null` for the malformed value, while the mirrored state remains equal, so this corruption is not rejected. The existing controls cover deletion as the valid-null case and `[]` as a mismatch (`selftest-c1.mjs:54-61`; `fixtures/expected.json:155-156`), but not a present non-array value. Distinguish absent/unavailable from malformed-present data and add a corresponding negative mutant.

### P2 — action-completion acknowledgement is not correlated to the dispatched action

The producer records the completed action name (`scripts/webmcp-lifecycle-round21.mjs:219-221`). The counter checks that exactly one `action-complete` frame exists and that it is ordered (`.ufo/waves/round-21/measure-c1.mjs:93-95`), but never compares `completed[0].action` with the receipt/action marker. A transcript whose `action-complete.action` is changed to another action, with its evidence digest updated, still satisfies the current acknowledgement check and can count clean. The existing `missing-action-ack` mutant checks only deletion (`selftest-c1.mjs:87-89`; `fixtures/expected.json:167`); add a wrong-action acknowledgement mutant and bind the acknowledgement to the selected action.

## Residual risk

The current bounded acquisition record reports exit 0 and 12 observations; its receipt/raw values reviewed here show the expected case identities and per-case acknowledgements. These findings concern false acceptance of corrupted counter inputs, not a demonstrated mismatch in that acquisition. As the knowledge note states, the counter does not establish authenticity against a malicious artifact author or universal browser semantics.

## Verification gaps

- LSP was unavailable: attempting to read `xd://lsp` returned “No such tool” and the mounted-device list contained no LSP device. Therefore no LSP status, references, definition, or diagnostics were available; text search is not treated as semantic proof.
- No tests, builds, linters, or formatters were run, per the wave bounds. No tools were installed or updated.
- Read-only worktree and staged diffs for the reviewed producer/counter/selftest/fixture/note paths were empty; the review used the current candidate files and bounded-acquisition artifacts. No production files were written.