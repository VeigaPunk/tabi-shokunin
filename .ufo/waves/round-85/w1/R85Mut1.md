# R85Mut1 — independent conjunct-level mutants of `scripts/check-showpicker-r85.mjs`

Seat: R85Mut1 (leaf mutation tester). Lane `tabi-shokunin`, base `c574d593`, freeze commit
`5c1961525e83efe2682cab389b8995d67c0ab4f0`, D `dbecb1a18905`, nonce `tabi-r85-l1-dbecb1a18905`.
Claims were not amended; this report attacks the frozen predicate and the frozen kill rule.

## Verdict

- **53 independent mutants** written for this seat (not derived from `scripts/kill-power-r85.mjs`):
  `18` aimed at the six r85 same-origin legs / `same-origin-no-picker-law`,
  `14` at the cross-origin family witnesses, `21` elsewhere.
- **KILLED 22 / SURVIVED 31 / CRASHED 0 / UNAPPLIED 0.**
  Survivor count **31**.
- Every survivor was re-measured on a second, independent honest receipt (the live scored receipt):
  verdicts identical, **0 diffs** (see “Corroboration”).
- Survivor classes:
  - **class B — rule enforced only by the dropped conjunct (16 mutants).** The witness receipt is
    accepted by the mutant counter (exit 0). A violating receipt would pass the frozen battery.
  - **class A — redundant conjunct (15 mutants).** The witness is still refused by a sibling
    check, so the mutated conjunct is not isolation-bearing. These are redundancy findings, not
    contract changes.
- Per family: same-origin 18 mutants → 3 killed /
  15 survived (7 class B); cross-origin
  14 → 6 killed / 8 survived
  (5 class B); other 21 → 13 killed /
  8 survived (4 class B).

## Instruments actually run (measured, not assumed)

| item | sha256 |
|---|---|
| counter run under mutation (`scripts/check-showpicker-r85.mjs`, frozen bytes) | `6239abdf7edfdff65229415b654d9d612a74dd88d521264a59a1a175adbc318a` |
| **battery run** (`scripts/negatives-showpicker-r85.mjs`, frozen bytes) | `b58b90c9429fab224664f1f835bab9312252bcd72830e25ddd9752a8fe403496` |
| driver pin (`scripts/chrome-cdp-showpicker-round85.mjs`) | `1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee` |
| honest receipt used for the table (freeze commit `5c196152`, r85 probe run) | `dea00ecab50ebd5811cefc48102acbe5ad433e07585c9e4f4af6046672d03b81` |
| corroboration receipt (live scored run, nonce `tabi-r85-l1-620623a43f74`) | `c22f90f70cc6d510c074d777f19580fe3796aef073ab1eb255dd746a1a41e56a` |

Working-tree counter and battery bytes equal the freeze pins, so no working-tree/freeze divergence
had to be substituted. The only delta between the freeze commit and the current working-tree
`freeze.txt` is `scripts/check-record-drift-r85.mjs` (another seat's edit); none of the instruments
this seat mutated or ran is affected, and the counter/battery/kill-power hashes below are identical
to the freeze commit's. The scored receipt `corpus/evidence/round85/chromium-showpicker/receipt.json`
was being rewritten in place by a concurrent seat during this sweep (observed: 24 legs → hash
`d5b1cb25…` clean at 87; then a 14-leg, `finishedAt:null` partial at hash `2aef5a29…`; then the
settled run `c22f90f70cc6d510…`). To keep every mutant measured against **identical bytes**, the table
runs on the freeze-commit receipt (`dea00eca…`, 24 legs, clean at 87 checks under the frozen counter)
inside a scratch mirror lane; the settled live receipt was then used as a second honest receipt and
reproduced every verdict (0 diffs).

Battery invocation (per mutant, identical argument set):

```
node negatives-showpicker-r85.mjs --lane <scratch>/tabi-shokunin --real <lane>/corpus/evidence/round85/chromium-showpicker/receipt.json \
  --expect-driver-sha256 1690c63d… --expect-nonce tabi-r85-probe2-a1 \
  --expect-fixture-sha256 291c463accbafd48563915af43dfed92a530756c0539b8f1e0454dcaa69df7f2 \
  --prior-set <lane>/.ufo/waves/round-85/controls/c1/prior-set.txt --work <scratch>/work --json
```

Baseline on the pristine counter, same bytes: `cases 175, failed 0, coverage declared 87 / covered 87,
uncovered []`, exit 0. Every SURVIVED row below is a green battery (`cases 175, failed 0, 87/87`) on
the honest receipt; every KILLED row is battery exit 1.

Each mutant is a single-string semantic edit of the frozen counter source; `node --check` passed for
all 53 mutated sources; all 53 mutant digests are distinct and differ from the pinned counter digest
(the per-mutant digest is in the machine summary described at the end).

## Full mutant table

| # | mutant | family | weakened conjunct (edit) | verdict | evidence |
|---|---|---|---|---|---|
| 1 | `so-no-picker-text-leg-dropped` | same-origin | same-origin-no-picker-law: the text member is no longer a witness (tel+search only) | **SURVIVED** | witness `so-no-picker-text-leg-dropped.json` (sha256 `72ce19130f0e2e55…`) |
| 2 | `so-no-picker-search-leg-dropped` | same-origin | same-origin-no-picker-law: the search member is no longer a witness (tel+text only) | **SURVIVED** | witness `so-no-picker-search-leg-dropped.json` (sha256 `c80859f03066e360…`) |
| 3 | `so-no-picker-ret-superset` | same-origin | same-origin-no-picker-law: accept ANY string ret instead of the measured 'undefined' | **SURVIVED** | witness `so-no-picker-ret-superset.json` (sha256 `52b4dbb701fa8219…`) |
| 4 | `so-no-picker-ok-dropped` | same-origin | same-origin-no-picker-law: the showPicker.ok conjunct is dropped | **SURVIVED** | witness `so-no-picker-ok-dropped.json` (sha256 `3911f838c2066b95…`) |
| 5 | `so-no-picker-opens-at-most-one` | same-origin | same-origin-no-picker-law: zero-open weakened to at-most-one | **KILLED** | battery case(s): `same-origin-activated-opens-none` (failed=1) |
| 6 | `so-no-picker-opens-conjunct-deleted` | same-origin | same-origin-no-picker-law: the zero-open conjunct is deleted entirely | **KILLED** | battery case(s): `same-origin-activated-opens-none` (failed=1) |
| 7 | `so-intercept-okcall-obj-only` | same-origin | intercept-law: a non-cross showPicker that merely exists counts as a successful call | **KILLED** | battery case(s): `schema, lane, nonce-shape …` (failed=161) |
| 8 | `so-intercept-skip-nonactivated-legs` | same-origin | intercept-law: the three non-activated sp85 legs no longer have their chooser count pinned | **SURVIVED** | witness `so-intercept-skip-nonactivated-legs.json` (sha256 `ade9b2448dee51bd…`) |
| 9 | `so-gesture-notallowed-message-unpinned` | same-origin | gesture-law: the NotAllowedError message pin (the six r85 non-activated legs' error text) is dropped | **SURVIVED** | witness `so-gesture-notallowed-message-unpinned.json` (sha256 `0601ef84855aab3c…`) |
| 10 | `so-gesture-notallowed-name-any` | same-origin | gesture-law: any error name is accepted where the law expects NotAllowedError | **SURVIVED** | witness `so-gesture-notallowed-name-any.json` (sha256 `7e5f7b6dc204f4c4…`) |
| 11 | `so-legshape-trusted-dropped-for-legs` | same-origin | leg-<sp85-*>: per-leg isTrusted sequence no longer compared on the six r85 legs | **SURVIVED** | witness `so-legshape-trusted-dropped-for-legs.json` (sha256 `bc09c118c97cf737…`) |
| 12 | `so-legshape-act-dropped-for-legs` | same-origin | leg-<sp85-*>: per-leg activation stamp no longer compared on the six r85 legs | **SURVIVED** | witness `so-legshape-act-dropped-for-legs.json` (sha256 `6ffde1ccc91fa9aa…`) |
| 13 | `so-legshape-opened-dropped-for-legs` | same-origin | leg-<sp85-*>: per-leg chooser mode list no longer compared on the six r85 legs | **SURVIVED** | witness `so-legshape-opened-dropped-for-legs.json` (sha256 `c80859f03066e360…`) |
| 14 | `so-prior-id-order-dropped-for-legs` | same-origin | plan-calls: the prior press/release ordering on the six r85 legs is no longer checked | **SURVIVED** | witness `so-prior-id-order-dropped-for-legs.json` (sha256 `65e78ce09ac6dada…`) |
| 15 | `so-seq-monotonic-dropped-for-legs` | same-origin | seq-monotonic: the six r85 legs' page-event seq is unpinned | **SURVIVED** | witness `so-seq-monotonic-dropped-for-legs.json` (sha256 `5295eb37f93c1bd1…`) |
| 16 | `so-context-childid-dropped-for-legs` | same-origin | context-binding: a non-null childContextId on the six r85 legs is accepted | **SURVIVED** | witness `so-context-childid-dropped-for-legs.json` (sha256 `ab140f1470dcc0e9…`) |
| 17 | `so-host-argv-token-shape-dropped-for-legs` | same-origin | host-argv: the launch-token hex shape is unpinned on the six r85 legs | **SURVIVED** | witness `so-host-argv-token-shape-dropped-for-legs.json` (sha256 `2400f8b430973df0…`) |
| 18 | `so-plan-frozen-priorclick-dropped` | same-origin | plan-frozen: leg.priorClick no longer compared to the frozen plan (the six r85 activated legs' activation trigger) | **SURVIVED** | witness `so-plan-frozen-priorclick-dropped.json` (sha256 `c8250de54b8a2634…`) |
| 19 | `cy-childlate-narrow-tel-only` | cross-origin | sp84-cross-origin-*-law: childLate pin kept for tel only (8 witnesses dropped) | **KILLED** | battery case(s): `cross-origin-text-late` (failed=1) |
| 20 | `cy-childseq-narrow-tel-only` | cross-origin | sp84-cross-origin-*-law: child event target sequence kept for tel only | **SURVIVED** | witness `cy-childseq-narrow-tel-only.json` (sha256 `ff01fd090e23446c…`) |
| 21 | `cy-crossaccess-narrow-tel-only` | cross-origin | sp84-cross-origin-*-law: the parentCrossAccess SecurityError witness kept for tel only | **SURVIVED** | witness `cy-crossaccess-narrow-tel-only.json` (sha256 `ec3911270b843ad1…`) |
| 22 | `cy-childact-before-narrow-tel-only` | cross-origin | sp84-cross-origin-*-law: child activation-before kept for tel only | **SURVIVED** | witness `cy-childact-before-narrow-tel-only.json` (sha256 `8d3eccacbdfa995a…`) |
| 23 | `cy-childact-after-narrow-tel-only` | cross-origin | sp84-cross-origin-*-law: child activation-after kept for tel only | **KILLED** | battery case(s): `cross-origin-search-activation` (failed=1) |
| 24 | `cy-childresult-message-narrow-tel-only` | cross-origin | sp84-cross-origin-*-law: SecurityError message text pinned for tel only (color stays exact) | **SURVIVED** | witness `cy-childresult-message-narrow-tel-only.json` (sha256 `e478589a4ce8b610…`) |
| 25 | `cy-kid-childevents-count-loose` | cross-origin | sp84-cross-origin-*-law: exactly-five child events weakened to at-least-five | **SURVIVED** | witness `cy-kid-childevents-count-loose.json` (sha256 `7035e2dcab0d45f2…`) |
| 26 | `cy-nonfile-childevents-count-loose` | cross-origin | cross-origin-nonfile-law: exactly-five child events weakened to at-least-five | **SURVIVED** | witness `cy-nonfile-childevents-count-loose.json` (sha256 `a50747bff70b3821…`) |
| 27 | `cy-order-childevents-count-loose` | cross-origin | order-law: exactly-five child events weakened to at-least-five | **SURVIVED** | witness `cy-order-childevents-count-loose.json` (sha256 `7a57deca4759863e…`) |
| 28 | `cy-kid-istrusted-any` | cross-origin | sp84-cross-origin-*-law: child isTrusted boolean weakened to any boolean value | **SURVIVED** | witness `cy-kid-istrusted-any.json` (sha256 `567aa730cb073a23…`) |
| 29 | `cy-nonfile-childact-dropped` | cross-origin | cross-origin-nonfile-law: the child act conjunct is dropped | **KILLED** | battery case(s): `w-cross-nonfile-child-act-dropped` (failed=1) |
| 30 | `cy-nonfile-chooser-at-most-one` | cross-origin | cross-origin-nonfile-law: zero chooser events weakened to at-most-one | **KILLED** | battery case(s): `cross-nonfile-chooser` (failed=1) |
| 31 | `cy-nonfile-crossaccess-dropped` | cross-origin | cross-origin-nonfile-law: the parentCrossAccess SecurityError witness is dropped | **KILLED** | battery case(s): `cross-origin-nonfile-law` (failed=1) |
| 32 | `cy-kid-childlate-nonnegative` | cross-origin | sp84-cross-origin-*-law: childLate zero pin weakened to a non-negative bound | **KILLED** | battery case(s): `cross-origin-text-late, cross-tel-childlate` (failed=2) |
| 33 | `ot-event-quantum-at-dropped` | other | event-time-quantum: the event.at grid is no longer checked | **SURVIVED** | witness `ot-event-quantum-at-dropped.json` (sha256 `00b78ef16239c75c…`) |
| 34 | `ot-event-window-upper-dropped` | other | event-leg-window: the settle upper bound is dropped | **SURVIVED** | witness `ot-event-window-upper-dropped.json` (sha256 `9d46099bae5bd831…`) |
| 35 | `ot-run-window-upper-relaxed` | other | run-window: the 600 s upper bound relaxed to 6000 s | **KILLED** | battery case(s): `w-runwindow-upper-dropped` (failed=1) |
| 36 | `ot-server-root-count-loose` | other | server-log-binding: exactly one root request weakened to at least one | **KILLED** | battery case(s): `w-server-root-count-open` (failed=1) |
| 37 | `ot-child-server-min-loose` | other | child-server-log-binding: at-least-one child.html request weakened to at-least-zero | **KILLED** | battery case(s): `w-childserver-min-dropped` (failed=1) |
| 38 | `ot-host-node-major-loose` | other | host-node: exact major version weakened to >= 18 | **SURVIVED** | witness `ot-host-node-major-loose.json` (sha256 `fff0142cb348affb…`) |
| 39 | `ot-driver-pin-length-only` | other | driver-pin: exact driver digest weakened to 64 hex-ish characters (length only) | **KILLED** | battery case(s): `driver-pin` (failed=1) |
| 40 | `ot-fixture-child-sha-any` | other | fixture-hash: the child fixture digest pin weakened to any string | **KILLED** | battery case(s): `w-fixture-childsha-any` (failed=1) |
| 41 | `ot-cdp-open-mode-any-string` | other | cdp-event-log-closed: the chooser mode enum weakened to any string | **SURVIVED** | witness `ot-cdp-open-mode-any-string.json` (sha256 `9ca1e847ae2fc731…`) |
| 42 | `ot-replay-token-shape-loose` | other | replay-launch-token: the 12-hex token shape weakened to any string | **SURVIVED** | witness `ot-replay-token-shape-loose.json` (sha256 `98e4e58080521fe2…`) |
| 43 | `ot-dismiss-cancel-conjunct-dropped` | other | dismiss-law: the no-page-cancel conjunct is dropped | **SURVIVED** | witness `ot-dismiss-cancel-conjunct-dropped.json` (sha256 `6c19c66768136418…`) |
| 44 | `ot-intercept-opens-upper-only` | other | intercept-law: fewer choosers than expected is now accepted (equality -> >) | **SURVIVED** | witness `ot-intercept-opens-upper-only.json` (sha256 `b88f3f02d2fed738…`) |
| 45 | `ot-trees-evidence-dropped` | other | prior-set-complete: the corpus/evidence/round85 tree is no longer walked | **KILLED** | battery case(s): `schema, lane, nonce-shape …` (failed=172) |
| 46 | `ot-marks-monotonic-dropped` | other | leg-marks: the monotonic mark-time conjunct is dropped | **KILLED** | battery case(s): `w-marks-monotonic-dropped` (failed=1) |
| 47 | `ot-no-selection-dismiss-length-dropped` | other | no-selection-law: the dismiss-state emptiness (length 0) conjunct is dropped | **SURVIVED** | witness `ot-no-selection-dismiss-length-dropped.json` (sha256 `0601dee545cf03ba…`) |
| 48 | `ot-sendlog-child-expr-dropped` | other | send-log-allowlist: child-context expressions are no longer allowlisted | **KILLED** | battery case(s): `w-sendlog-child-expr-any` (failed=1) |
| 49 | `ot-ctx-default-dropped` | other | context-binding: the child context no longer has to be the default context | **KILLED** | battery case(s): `w-ctx-default-dropped` (failed=1) |
| 50 | `ot-leg-records-wait-loose` | other | leg-records: chooserWaitMs ceiling relaxed from 3000 to 30000 | **KILLED** | battery case(s): `w-leg-wait-unbounded` (failed=1) |
| 51 | `ot-fixture-viewport-obj-only` | other | fixture-hash: the viewport pin weakened to 'is an object' | **KILLED** | battery case(s): `w-fixture-viewport-dropped` (failed=1) |
| 52 | `ot-ports-min-loose` | other | ports-declared: the privileged-port floor (>= 1024) dropped | **KILLED** | battery case(s): `w-ports-min-dropped` (failed=1) |
| 53 | `ot-exempt-all-walked-files` | other | prior-set-complete: every walked file becomes exempt regardless of the named digest | **KILLED** | battery case(s): `prior-set-complete` (failed=1) |

## Survivor witnesses — pristine vs mutant on the same bytes

For every survivor the smallest receipt that exercises the dropped conjunct was built from the honest
receipt (one field edit) and run through **both** counters on the identical witness file.
Class **B** = the mutant accepts the witness (exit 0) — the rule is enforced only by the dropped
conjunct. Class **A** = the mutant still refuses, via the sibling checks listed — redundant conjunct.
`sha256` is the first 16 hex of the witness bytes (the same file for both runs).

| mutant | class | smallest witness edit | witness sha256 | pristine | mutant |
|---|---|---|---|---|---|
| `so-no-picker-text-leg-dropped` | A | one `Page.fileChooserOpened` event appended to `sp85-same-origin-text-activated` | 72ce19130f0e2e55… | 1/findings ["plan-calls", "leg-sp85-same-origin-text-activated", "same-origin-no-picker-law", "intercept-law"] | 1/findings ["plan-calls", "leg-sp85-same-origin-text-activated", "intercept-law"] |
| `so-no-picker-search-leg-dropped` | A | one `Page.fileChooserOpened` event appended to `sp85-same-origin-search-activated` | c80859f03066e360… | 1/findings ["plan-calls", "leg-sp85-same-origin-search-activated", "same-origin-no-picker-law", "intercept-law"] | 1/findings ["plan-calls", "leg-sp85-same-origin-search-activated", "intercept-law"] |
| `so-no-picker-ret-superset` | A | `sp85-same-origin-tel-activated.showPicker.ret = 'object'` | 52b4dbb701fa8219… | 1/findings ["gesture-law", "same-origin-no-picker-law"] | 1/findings ["gesture-law"] |
| `so-no-picker-ok-dropped` | A | `sp85-same-origin-tel-activated.showPicker = {ok:false, ret:'undefined'}` | 3911f838c2066b95… | 1/findings ["gesture-law", "same-origin-no-picker-law"] | 1/findings ["gesture-law"] |
| `so-intercept-skip-nonactivated-legs` | A | one chooser event appended to `sp85-same-origin-text` | ade9b2448dee51bd… | 1/findings ["plan-calls", "leg-sp85-same-origin-text", "intercept-law"] | 1/findings ["plan-calls", "leg-sp85-same-origin-text"] |
| `so-gesture-notallowed-message-unpinned` | B | `sp85-same-origin-text.showPicker.message` replaced | 0601ef84855aab3c… | 1/findings ["gesture-law"] | 0/clean [] |
| `so-gesture-notallowed-name-any` | B | `sp85-same-origin-search.showPicker.name = 'TypeError'` | 7e5f7b6dc204f4c4… | 1/findings ["gesture-law"] | 0/clean [] |
| `so-legshape-trusted-dropped-for-legs` | A | `sp85-same-origin-tel-activated.pageEvents[0].isTrusted = false` | bc09c118c97cf737… | 1/findings ["leg-sp85-same-origin-tel-activated", "trust-law"] | 1/findings ["trust-law"] |
| `so-legshape-act-dropped-for-legs` | B | `sp85-same-origin-tel-activated.pageEvents[0].act = false` | 6ffde1ccc91fa9aa… | 1/findings ["leg-sp85-same-origin-tel-activated"] | 0/clean [] |
| `so-legshape-opened-dropped-for-legs` | A | one chooser event appended to `sp85-same-origin-search-activated` | c80859f03066e360… | 1/findings ["plan-calls", "leg-sp85-same-origin-search-activated", "same-origin-no-picker-law", "intercept-law"] | 1/findings ["plan-calls", "same-origin-no-picker-law", "intercept-law"] |
| `so-prior-id-order-dropped-for-legs` | B | `priorReleaseId = priorPressId` on `sp85-same-origin-tel-activated` | 65e78ce09ac6dada… | 1/findings ["plan-calls"] | 0/clean [] |
| `so-seq-monotonic-dropped-for-legs` | B | `sp85-same-origin-tel-activated.pageEvents[0].seq = 99` | 5295eb37f93c1bd1… | 1/findings ["seq-monotonic"] | 0/clean [] |
| `so-context-childid-dropped-for-legs` | B | `childContextId = 'CTX-X'` on `sp85-same-origin-tel-activated` | ab140f1470dcc0e9… | 1/findings ["context-binding"] | 0/clean [] |
| `so-host-argv-token-shape-dropped-for-legs` | A | `launchToken = 'zzzzzzzzzzzz'` (+ profile rename) on `sp85-same-origin-tel-activated` | 2400f8b430973df0… | 1/findings ["host-argv", "replay-launch-token"] | 1/findings ["replay-launch-token"] |
| `so-plan-frozen-priorclick-dropped` | B | `priorClick = null` on `sp85-same-origin-search-activated` | c8250de54b8a2634… | 1/findings ["plan-frozen"] | 0/clean [] |
| `cy-childseq-narrow-tel-only` | B | `sp84-cross-origin-search.childEvents[0].target = 'go99'` | ff01fd090e23446c… | 1/findings ["sp84-cross-origin-search-law"] | 0/clean [] |
| `cy-crossaccess-narrow-tel-only` | B | `sp84-cross-origin-month.parentCrossAccess.contentDocument = 'object'` | ec3911270b843ad1… | 1/findings ["sp84-cross-origin-month-law"] | 0/clean [] |
| `cy-childact-before-narrow-tel-only` | B | `sp84-cross-origin-week.childActivationBefore = {isActive:true, hasBeenActive:true}` | 8d3eccacbdfa995a… | 1/findings ["sp84-cross-origin-week-law"] | 0/clean [] |
| `cy-childresult-message-narrow-tel-only` | B | `sp84-cross-origin-search.childResult.message = 'SecurityError'` | e478589a4ce8b610… | 1/findings ["sp84-cross-origin-search-law"] | 0/clean [] |
| `cy-kid-childevents-count-loose` | A | a 6th child event appended to `sp84-cross-origin-tel` | 7035e2dcab0d45f2… | 1/findings ["sp84-cross-origin-tel-law"] | 1/findings ["sp84-cross-origin-tel-law"] |
| `cy-nonfile-childevents-count-loose` | A | a 6th child event appended to `sp84-cross-origin-nonfile` | a50747bff70b3821… | 1/findings ["cross-origin-nonfile-law"] | 1/findings ["cross-origin-nonfile-law"] |
| `cy-order-childevents-count-loose` | A | a 6th child event appended to `sp84-cross-origin-nonfile-disabled` | 7a57deca4759863e… | 1/findings ["order-law"] | 1/findings ["order-law"] |
| `cy-kid-istrusted-any` | B | `sp84-cross-origin-color.childEvents[0].isTrusted = false` | 567aa730cb073a23… | 1/findings ["sp84-cross-origin-color-law"] | 0/clean [] |
| `ot-event-quantum-at-dropped` | B | one page event's `at` shifted `+0.05` ms (off the 0.1 ms grid) | 00b78ef16239c75c… | 1/findings ["event-time-quantum"] | 0/clean [] |
| `ot-event-window-upper-dropped` | B | last `sp84-accept-answer` page event `at = settle + 100` | 9d46099bae5bd831… | 1/findings ["event-leg-window"] | 0/clean [] |
| `ot-host-node-major-loose` | B | `host.node = 'v25.0.0'` | fff0142cb348affb… | 1/findings ["host-node"] | 0/clean [] |
| `ot-cdp-open-mode-any-string` | A | chooser `mode = 'bogus'` on `sp84-accept-answer` | 9ca1e847ae2fc731… | 1/findings ["cdp-event-log-closed", "leg-sp84-accept-answer", "mode-law"] | 1/findings ["leg-sp84-accept-answer", "mode-law"] |
| `ot-replay-token-shape-loose` | A | `launchToken = 'zzzzzzzzzzzz'` (+ profile rename) on `sp84-accept-answer` | 98e4e58080521fe2… | 1/findings ["host-argv", "replay-launch-token"] | 1/findings ["host-argv"] |
| `ot-dismiss-cancel-conjunct-dropped` | A | one `cancel` page event appended to `sp84-accept-answer` | 6c19c66768136418… | 1/findings ["event-leg-window", "leg-sp84-accept-answer", "cancel-law", "dismiss-law"] | 1/findings ["event-leg-window", "leg-sp84-accept-answer", "cancel-law"] |
| `ot-intercept-opens-upper-only` | A | the `Page.fileChooserOpened` event removed from `sp84-accept-answer` | b88f3f02d2fed738… | 1/findings ["plan-calls", "leg-sp84-accept-answer", "accept-answer-law", "intercept-law"] | 1/findings ["plan-calls", "leg-sp84-accept-answer", "accept-answer-law"] |
| `ot-no-selection-dismiss-length-dropped` | B | `sp84-cross-origin-range.stateAfterDismiss.s = [['a',1,'text/plain','']]` | 0601dee545cf03ba… | 1/findings ["no-selection-law"] | 0/clean [] |

Class A witnesses and the sibling check that still refuses them:

- `so-no-picker-text-leg-dropped` → still refused by ["plan-calls", "leg-sp85-same-origin-text-activated", "intercept-law"]
- `so-no-picker-search-leg-dropped` → still refused by ["plan-calls", "leg-sp85-same-origin-search-activated", "intercept-law"]
- `so-no-picker-ret-superset` → still refused by ["gesture-law"]
- `so-no-picker-ok-dropped` → still refused by ["gesture-law"]
- `so-intercept-skip-nonactivated-legs` → still refused by ["plan-calls", "leg-sp85-same-origin-text"]
- `so-legshape-trusted-dropped-for-legs` → still refused by ["trust-law"]
- `so-legshape-opened-dropped-for-legs` → still refused by ["plan-calls", "same-origin-no-picker-law", "intercept-law"]
- `so-host-argv-token-shape-dropped-for-legs` → still refused by ["replay-launch-token"]
- `cy-kid-childevents-count-loose` → still refused by ["sp84-cross-origin-tel-law"]
- `cy-nonfile-childevents-count-loose` → still refused by ["cross-origin-nonfile-law"]
- `cy-order-childevents-count-loose` → still refused by ["order-law"]
- `ot-cdp-open-mode-any-string` → still refused by ["leg-sp84-accept-answer", "mode-law"]
- `ot-replay-token-shape-loose` → still refused by ["host-argv"]
- `ot-dismiss-cancel-conjunct-dropped` → still refused by ["event-leg-window", "leg-sp84-accept-answer", "cancel-law"]
- `ot-intercept-opens-upper-only` → still refused by ["plan-calls", "leg-sp84-accept-answer", "accept-answer-law"]

## Survivor families by class (what the frozen battery cannot see)

**Class B — unenforced in isolation (16):**

- `so-gesture-notallowed-message-unpinned` — witness accepted; the dropped rule (`gesture-law`) is the only enforcement.
- `so-gesture-notallowed-name-any` — witness accepted; the dropped rule (`gesture-law`) is the only enforcement.
- `so-legshape-act-dropped-for-legs` — witness accepted; the dropped rule (`leg-sp85-same-origin-tel-activated`) is the only enforcement.
- `so-prior-id-order-dropped-for-legs` — witness accepted; the dropped rule (`plan-calls`) is the only enforcement.
- `so-seq-monotonic-dropped-for-legs` — witness accepted; the dropped rule (`seq-monotonic`) is the only enforcement.
- `so-context-childid-dropped-for-legs` — witness accepted; the dropped rule (`context-binding`) is the only enforcement.
- `so-plan-frozen-priorclick-dropped` — witness accepted; the dropped rule (`plan-frozen`) is the only enforcement.
- `cy-childseq-narrow-tel-only` — witness accepted; the dropped rule (`sp84-cross-origin-search-law`) is the only enforcement.
- `cy-crossaccess-narrow-tel-only` — witness accepted; the dropped rule (`sp84-cross-origin-month-law`) is the only enforcement.
- `cy-childact-before-narrow-tel-only` — witness accepted; the dropped rule (`sp84-cross-origin-week-law`) is the only enforcement.
- `cy-childresult-message-narrow-tel-only` — witness accepted; the dropped rule (`sp84-cross-origin-search-law`) is the only enforcement.
- `cy-kid-istrusted-any` — witness accepted; the dropped rule (`sp84-cross-origin-color-law`) is the only enforcement.
- `ot-event-quantum-at-dropped` — witness accepted; the dropped rule (`event-time-quantum`) is the only enforcement.
- `ot-event-window-upper-dropped` — witness accepted; the dropped rule (`event-leg-window`) is the only enforcement.
- `ot-host-node-major-loose` — witness accepted; the dropped rule (`host-node`) is the only enforcement.
- `ot-no-selection-dismiss-length-dropped` — witness accepted; the dropped rule (`no-selection-law`) is the only enforcement.

**Class A — redundant conjunct (15):**

- `so-no-picker-text-leg-dropped` — `same-origin-no-picker-law` duplicated by ["plan-calls", "leg-sp85-same-origin-text-activated", "intercept-law"].
- `so-no-picker-search-leg-dropped` — `same-origin-no-picker-law` duplicated by ["plan-calls", "leg-sp85-same-origin-search-activated", "intercept-law"].
- `so-no-picker-ret-superset` — `same-origin-no-picker-law` duplicated by ["gesture-law"].
- `so-no-picker-ok-dropped` — `same-origin-no-picker-law` duplicated by ["gesture-law"].
- `so-intercept-skip-nonactivated-legs` — `intercept-law` duplicated by ["plan-calls", "leg-sp85-same-origin-text"].
- `so-legshape-trusted-dropped-for-legs` — `leg-sp85-same-origin-tel-activated` duplicated by ["trust-law"].
- `so-legshape-opened-dropped-for-legs` — `leg-sp85-same-origin-search-activated` duplicated by ["plan-calls", "same-origin-no-picker-law", "intercept-law"].
- `so-host-argv-token-shape-dropped-for-legs` — `host-argv` duplicated by ["replay-launch-token"].
- `cy-kid-childevents-count-loose` — `sp84-cross-origin-tel-law` duplicated by ["sp84-cross-origin-tel-law"].
- `cy-nonfile-childevents-count-loose` — `cross-origin-nonfile-law` duplicated by ["cross-origin-nonfile-law"].
- `cy-order-childevents-count-loose` — `order-law` duplicated by ["order-law"].
- `ot-cdp-open-mode-any-string` — `cdp-event-log-closed` duplicated by ["leg-sp84-accept-answer", "mode-law"].
- `ot-replay-token-shape-loose` — `replay-launch-token` duplicated by ["host-argv"].
- `ot-dismiss-cancel-conjunct-dropped` — `dismiss-law` duplicated by ["event-leg-window", "leg-sp84-accept-answer", "cancel-law"].
- `ot-intercept-opens-upper-only` — `intercept-law` duplicated by ["plan-calls", "leg-sp84-accept-answer", "accept-answer-law"].

For the three `childEvents.length === 5` weakenings the refusing id is the same check: its
`childEvents` sequence conjunct refuses the 6-event witness, so the count conjunct is subsumed
inside the check, not witnessed by any battery case (none of the 175 cases changes a child event
count).

## Notable individual findings

- The six r85 same-origin legs' **`NotAllowedError` pin is unwitnessed per member**: dropping the
  message pin (`so-gesture-notallowed-message-unpinned`) or the name pin
  (`so-gesture-notallowed-name-any`) leaves a green battery, and the mutant accepts a receipt whose
  `sp85-same-origin-text` / `-search` call throws a different error name/message. No battery case
  mutates the showPicker outcome of the three non-activated sp85 legs.
- `same-origin-no-picker-law`'s zero-open conjunct is **witnessed for `tel` only** (the battery case
  `same-origin-activated-opens-none` targets tel); dropping the `search` or `text` member survives.
  Those two are class A: the mutated law no longer refuses a chooser opened on that leg, but
  `intercept-law` still does — the law itself is not the enforcer for search/text.
- Per-leg shape for the six r85 legs: dropping `act`, `opened`, or `trusted` for `sp85-*` legs
  survives; `act` is a class B hole (a page event stamped with the wrong activation flag is accepted).
- The six legs' `seq`, `childContextId`, prior-click ordering, and the frozen-plan `priorClick` field
  are enforced **only** by the conjunct this seat dropped (class B).
- Cross-origin family witnesses: each r85 family weakening got exactly **one** witness, always on
  `sp84-cross-origin-tel` (`cross-tel-*`), except `childLate` (also `cross-origin-text-late`) and
  `childActivationAfter` (also `cross-origin-search-activation`). So dropping `childResult` message,
  `childEvents` target sequence, `parentCrossAccess` or `childActivationBefore` **for the other eight
  legs** survives, and the mutant accepts a violating receipt (class B); narrowing `childLate` and
  `childActivationAfter` was killed by their second witness. Dropping the child-event `isTrusted`
  pin (any boolean accepted) survives for **all nine** legs: no battery case flips a child event's
  `isTrusted`. `childEvents.length === 5` is redundant with the sequence pin (class A) for all three
  call sites.
- `host-node` is pinned by equality only from below: `>= 24` survives (a `v25` receipt is accepted).
  The same one-sided-pin shape elsewhere was killed by its own case (`server-log-binding` `>= 1` by
  `w-server-root-count-open`, `intercept-law` `opens > want` by `cross-nonfile-chooser`, the
  launch-token shape by `host-argv` when `replay-launch-token`'s shape is loosened).
- `prior-set-complete` walks only `.ufo/waves/round-85` and `corpus/evidence/round85`; this mutant
  was killed by the exemption interface (an unmatched exemption digest is refused), not by a stray
  receipt in the evidence tree. That is a kill by contract, not by a walk witness — the evidence
  tree itself is still only covered incidentally.

## Corroboration on the live scored receipt

Same 53 mutants, `--real` = live scored receipt `c22f90f70cc6d510c074d777f19580fe3796aef073ab1eb255dd746a1a41e56a` (nonce `tabi-r85-l1-620623a43f74`, fixture
`0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a`), same frozen battery bytes: **22 killed / 31 survived /
0 crashed**, survivor set identical to the table above (0 verdict diffs).

## Lane integrity / restoration

- No lane file was modified. Counter, battery and kill-power hashes re-read after the sweep equal the
  freeze pins (`6239abdf…`, `b58b90c9…`, `d86fc19f…`); the lane receipt churn observed above is
  another seat's write, not this seat's.
- All mutants, batteries, mirror lanes and witnesses lived under
  `/fast/scratch/hyaku/tabi-r85/R85Mut1/` (copies only). The scratch tree was deleted after this
  report was written; nothing was committed, staged or pushed, and no host service or sysctl was
  touched.
- Tool installs: none (no pacman/uv/npx/binary install was needed or attempted).

## Machine-readable evidence (paths only; scratch is disposable)

Before deletion the scratch held `run4/summary.json` (per-mutant outcome, mutated digest, battery
cases/coverage, killing cases), `wit/witnesses.json` (per-survivor witness digest, pristine and
mutant verdict + finding ids) and `mutants.json` (the 53 `(name, from, to)` edits). The table above
is a faithful transcription of those files.
