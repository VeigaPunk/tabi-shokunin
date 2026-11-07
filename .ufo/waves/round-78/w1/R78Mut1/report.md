FINDINGS

# R78Mut1 — semantic mutants of the C1 counter (tabi round 78, wave w1)

## Counts

95 single-edit semantic mutants of `scripts/check-filechooser-r78.mjs`, none force-true, none identical to the 76 frozen entries of `.ufo/waves/round-78/controls/c1/kill-power-r78.mjs`. Validated mechanically before every run: each edit string occurs exactly once in the counter bytes and no `(from,to)` pair equals a frozen pair (`run-mutants.mjs`, `valid=95 invalid=0 frozen=76`).

| anchor | counter sha256 | receipt under test | killed | killed-positive | survived | crashed |
|---|---|---|---|---|---|---|
| current frozen bytes | `4ae2941215b7cad72db4755b32ab78a7077313d98ddce76a617f968792bd518d` (`freeze.txt:2`) | `41779c6e7bf2f6efb4f9f1021e28c87db578861973f94d27c18200ba767f4f53`, nonce `tabi-r78-l1-bf94adaab578` | 46 | 28 | 21 | 0 |
| D-era bytes copied at dispatch | `d3a8fd8714ca3448070dfe4a4355e0725ac97527b070952cc9ae89a5f9e0fe09` | `203dcef9765a74c4c274c0194a506f9189cbb40372758a921bf143e7c7ffd560`, nonce `tabi-r78-l1-d59ca0270c2a` | 46 | 28 | 21 | 0 |

- `killed` = the battery copy fails with a named case (the mutant is detected by an existing witness).
- `killed-positive` = the mutant refuses the honest scored receipt (`positiveOk=false`, the counter's own `findingIds` non-empty): a false refusal, the failure mode the predicate's cold-run leg exists to prevent.
- The survivor set is identical on both anchors. The only cross-pass disagreements were battery flakes (F2), resolved by re-running the affected mutants.
- Baselines: pristine counter exit 0 clean, 186 checks (`baseline-counter-current.json`, `baseline-counter-d-era.json`); pristine battery exit 0 `allOk`, 400/400 cases on the current battery (`baseline-battery-current.json`) and 398/398 on the D-era battery (`baseline-battery-d-era.json`).

## Anchors

- Driver: `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f` (`freeze.txt:1`, the `--expect-driver-sha256` pin), unchanged across both anchors.
- Battery: D-era `724887280cfc11e0c0bd05d6cd07b80c899d7546953465d2cda836d6f7a3ab1a`, current `3387e5f47730327d5c634d9e6276968a33494afec5794bf038f6d16b7cbc0124` (`freeze.txt:3`).
- The lane's instruments were repaired and re-frozen after dispatch (counter mtime 15:28, battery 15:57); I therefore ran the whole sweep twice, on the bytes I copied at 15:15 and on the current frozen bytes, and report both. No lane file was written by this seat: mutants live only in `/fast/scratch/hyaku/tabi-r78/R78Mut1/` and were removed after each run; the lane was read-only throughout.
- Receipts: the D-era scored receipt survives only in my snapshot (`lane/`); the lane's `corpus/evidence/round78/chromium-file-chooser/receipt.json` was replaced twice after D (F1). The current-anchor run uses a byte-identical snapshot of the lane taken at 16:10 (`lane2/`, `41779c6e…`, nonce `tabi-r78-l1-bf94adaab578`), verified clean by the counter before the sweep.

## Findings

### F1 — the predicate's receipt anchor moved after D: three different receipts at one path

- At dispatch my tasking names nonce `tabi-r78-l1-d59ca0270c2a`; the receipt with that nonce is `203dcef9…` (snapshot `lane/`, taken 15:15, `startedAt 2026-11-07T18:06:57.043Z`).
- 15:49: the path held `72bf42d8…`, nonce `tabi-r78-l1-4920e0790fa9`; `.ufo/waves/round-78/scored/c1-counter-a.json` (mtime 15:49) records that nonce and `verdict clean`.
- 16:10: the path holds `41779c6e…`, nonce `tabi-r78-l1-bf94adaab578`.
- Measured: the tasking's counting command with `--expect-nonce tabi-r78-l1-d59ca0270c2a` against the 15:49 receipt makes every mutant run report `positiveFindings ["nonce-expected"]` (95/95 killed-positive) — i.e. the honest receipt is refused with the tasking's nonce (`semantic-mutants-real-INVALID-nonce-drift.json`). The counter's nonce pin is doing exactly what E3 asks; the drift is in the wave's anchor, not in the counter.
- Consequence for the predicate: `(a)` cites "the L1 post-D scored run, nonce tabi-r78-l1-d59ca0270c2a, receipt corpus/evidence/round78/chromium-file-chooser/receipt.json". That file is no longer that receipt. A seat that re-runs the counting command verbatim today gets exit 1 `nonce-expected`. Either the predicate's receipt must be pinned by digest or the nonce in the predicate must follow the re-run.

### F2 — the battery declared one case twice; the race produces false kills

- The D-era battery (`72488728…`) declares `witness-leg-records-error-code-float` twice (identical `add(...)` line). Both cases write `neg-witness-leg-records-error-code-float.case` in the same `--work` dir and run concurrently under `--jobs`; the counter can read a partially written file, so the case fails for reasons unrelated to the mutant under test.
- Measured: three mutants were "killed" by that case in one pass and survived in the other — `sem-fixi-rect-right-edge` (pass 1 killed → pass 2 survived), `sem-legwindow-order-tolerance` (pass 1 killed → pass 2 survived), `sem-gapmin-strict` (pass 2 killed → pass 1 and the current-anchor pass survived). Direct re-run of the fixi-rect mutant: `probe 1 sem-fixi-rect-right-edge exit 0 / positiveOk true / allOk true / failed []` (28.9 s).
- The current battery (`3387e5f4…`) removed the duplicate (its own comment: "the second, byte-identical copy of this witness was removed").
- Consequence: any kill attributed to that case name in a run that used the D-era battery is unreliable. `kill-power-r78.mjs` drives whatever battery sits beside it, so a kill-power run taken before the battery repair (15:57) can have scored a survivor as killed on that case alone; the current battery no longer carries the duplicate. My sweep used a de-duplicated battery copy for the D-era witness work and the current battery (already de-duplicated) for the current-anchor sweep.

### F3 — a JSON-looking non-receipt inside the walked tree refuses every cold run

- At 15:17 the counter on the real lane exited 1 with `prior-set-unparsable`, naming `.ufo/waves/round-78/scored/selftest-r78-gates.out` (`poisoned-real-lane-counter-1517.json`). The file is valid JSON followed by one prose line (`clean=true cases=15 failed=none`), so `JSON.parse` fails and the walk's "looks like JSON" test (first non-blank byte `{`) refuses it.
- The L1 removed it at 15:26 (peer message) and the lane re-checked clean (exit 0, 186 checks).
- Consequence: E2's refuse-not-skip rule is correct, but the walked tree is also the wave's scratch output directory. Any seat that writes a JSON-ish `.out`/`.log` under `.ufo/waves/round-78` refuses every cold run until it is removed. The L1's selftest now writes to `.ufo/waves/round-78-seats/`.

### F4 — a relative `--tree-exempt` silently loses the exemption

- `exemptReal` maps the option through `real(path.isAbsolute(p) ? p : path.join(lane, p))` (`scripts/check-filechooser-r78.mjs:294`). The mutant drops the lane join.
- Two-direction demonstration on a mirror lane holding a copy of the scored receipt at `.ufo/waves/round-78/zz-exempt.json` (`exempt-demo/`):
  - pristine, no `--tree-exempt` → exit 1, `prior-set-complete`, `outside [".ufo/waves/round-78/zz-exempt.json"]` (`p-none.json`);
  - pristine, relative `--tree-exempt .ufo/waves/round-78/zz-exempt.json` → exit 0 clean (`p-rel.json`);
  - pristine, absolute `--tree-exempt <lane>/…` → exit 0 clean (`p-abs.json`);
  - mutant, relative → exit 1 `prior-set-complete` (`m-rel.json`); mutant, absolute → exit 0 clean (`m-abs.json`).
- Consequence: the lane-relative form the code documents is dead in the battery (which always passes an absolute path) and silently fails for any caller that uses it. It refuses rather than accepts, so it is not a false-accept, but it is an untested branch of E2's exemption.

### F5 — 21 survivors: 8 redundant conjuncts, 1 CLI-only, 12 witness-verified

The survivors are coverage findings, not contract breaks: each either duplicates a check that already fires, or sits on a branch no receipt case reaches. The 12 with a witness are killed by a case appended to a battery copy, verified in both directions (pristine battery `allOk`, mutant battery fails exactly that case).

## Survivors

| # | mutant | why it survives | disposition |
|---|---|---|---|
| 1 | `sem-typed-x-integer-to-number` | `typed()` already requires `nullOrInt(e.x)` (`check-filechooser-r78.mjs:372,376`); the mutated `Number.isInteger(e.x)` conjunct is redundant | equivalent |
| 2 | `sem-errOk-message-key-only` | no receipt case carries a non-string `message` | witness `witness-r78mut1-errOk-message-nonstring` |
| 3 | `sem-legrec-interceptresult-null-dropped` | no case sets `interceptResult` on a leg whose intercept is off | witness `witness-r78mut1-interceptresult-on-quiet-leg` |
| 4 | `sem-legrec-opened-node-null-dropped` | `opened===false` with a non-null `openedNode` is untested | witness `witness-r78mut1-unopened-leg-carries-node` |
| 5 | `sem-legrec-set-before-trigger-strict` | `<=` vs `<` differ only at `setSendId === triggerSendId`, where `s.method !== 'DOM.setFileInputFiles'` (`:364`) already fires | equivalent |
| 6 | `sem-node-positive-dropped` | no case relabels an opened node to `0` | witness `witness-r78mut1-node-id-zero` |
| 7 | `sem-node-inputs-ge` | `nodeOf` keys come from `AT_TARGET`/`OPENS` (`:100-101`), which can name at most 4 inputs (s,m,d,k) | equivalent |
| 8 | `sem-fixi-count-ge` | no case adds a sixth page-measured descriptor | witness `witness-r78mut1-sixth-descriptor` |
| 9 | `sem-fixi-rect-right-edge` | no case puts the commanded point exactly on the rect's right edge | witness `witness-r78mut1-point-on-rect-right-edge` |
| 10 | `sem-gapmin-strict` | own gap of exactly 50.0 ms is untested (the battery brackets 50.1 and 49.9) | witness `witness-r78mut1-own-gap-exactly-50` (accept case) |
| 11 | `sem-selection-interceptoff-dropped` | for `intercept-off` both branches push the same `cancel` (`:556-557`); the only other `files===null` click leg is `dir-mode` with `intercept===null` | equivalent |
| 12 | `sem-failures-array-dropped` | no case makes `failures` a non-array | witness `witness-r78mut1-failures-not-array` |
| 13 | `sem-argv-profile-absolute-dropped` | no case makes the profile dir relative | witness `witness-r78mut1-relative-profile-dir` |
| 14 | `sem-devtools-url-includes` | the port conjunct catches every existing case | witness `witness-r78mut1-devtools-url-wrong-port` |
| 15 | `sem-trust-type-dropped` | untrusted positions are pinned by the per-leg `SHAPE` trusted arrays (`:121,123,126,138`) through `leg-*-trusted` | equivalent |
| 16 | `sem-readlaw-sha-dropped` | the dropped check is self-consistency of the counter's own `UPLOAD` constants (`:103,578`); no receipt can change them | equivalent |
| 17 | `sem-walk-exempt-lane-join-dropped` | the battery always passes an absolute `--tree-exempt`, so no battery case reaches the relative branch | CLI demonstration, F4 |
| 18 | `sem-legwindow-order-tolerance` | event times are on the 0.1 ms grid (`:316`), so an order inversion is >= 0.1 ms — beyond the 0.05 tolerance | equivalent |
| 19 | `sem-server-root-status-dropped` | a non-200 `/` row is already caught by `otherRows` (`:226`) | equivalent |
| 20 | `sem-runwindow-upper-inclusive` | no case makes the run exactly 600000 ms | witness `witness-r78mut1-run-window-exactly-600000` |
| 21 | `sem-frame-tree-url-dropped` | no case changes `frameTree.mainFrameUrl` | witness `witness-r78mut1-frame-tree-url` |

## Witnesses (verified in both directions)

Each row: pristine counter + battery copy → `allOk` (the case refuses with the expected id, no extra id); mutated counter + same battery copy → exit 1 with `failed` exactly that case.

| mutant | case | expected id | pristine | mutant |
|---|---|---|---|---|
| `sem-errOk-message-key-only` | `witness-r78mut1-errOk-message-nonstring` | `leg-records` | exit 0, allOk, ids `leg-records, leg-not-file-input-error, not-file-input-law` | exit 1, failed exactly the case |
| `sem-legrec-interceptresult-null-dropped` | `witness-r78mut1-interceptresult-on-quiet-leg` | `leg-records` | exit 0, allOk, ids `leg-records` | exit 1, exact |
| `sem-legrec-opened-node-null-dropped` | `witness-r78mut1-unopened-leg-carries-node` | `leg-records` | exit 0, allOk, ids `leg-records` | exit 1, exact |
| `sem-node-positive-dropped` | `witness-r78mut1-node-id-zero` | `node-binding-law` | exit 0, allOk, ids `node-binding-law` | exit 1, exact |
| `sem-fixi-count-ge` | `witness-r78mut1-sixth-descriptor` | `fixture-descriptors` | exit 0, allOk, ids `fixture-descriptors` | exit 1, exact |
| `sem-fixi-rect-right-edge` | `witness-r78mut1-point-on-rect-right-edge` | `fixture-descriptors` | exit 0, allOk, ids `fixture-descriptors` | exit 1, exact |
| `sem-gapmin-strict` | `witness-r78mut1-own-gap-exactly-50` | accept (clean) | exit 0, allOk, ownGaps 11 | exit 1, exact (mutant ownGaps 10, `replay-event-timeline`) |
| `sem-failures-array-dropped` | `witness-r78mut1-failures-not-array` | `failures-empty` | exit 0, allOk, ids `failures-empty` | exit 1, exact |
| `sem-argv-profile-absolute-dropped` | `witness-r78mut1-relative-profile-dir` | `host-argv` | exit 0, allOk, ids `host-argv` | exit 1, exact |
| `sem-devtools-url-includes` | `witness-r78mut1-devtools-url-wrong-port` | `devtools-port-binding` | exit 0, allOk, ids `devtools-port-binding` | exit 1, exact |
| `sem-runwindow-upper-inclusive` | `witness-r78mut1-run-window-exactly-600000` | `run-window` | exit 0, allOk, ids `run-window` | exit 1, exact |
| `sem-frame-tree-url-dropped` | `witness-r78mut1-frame-tree-url` | `frame-tree` | exit 0, allOk, ids `frame-tree` | exit 1, exact |

Evidence: `witnesses-witness-spec-cur.json` (current frozen bytes, 12/12) and `witnesses-witness-spec-d2.json` (D-era bytes, 12/12).

The witness receipts are crafted by the battery itself (mutate the scored receipt, launder `legShape` from the counter's own re-derivation) and written as `*.case` inside the scratch `--work` dir; nothing is written into the lane's walked trees.

## Reproduce

The harness was scratch-only and is removed with the scratch dir (`/fast/scratch/hyaku/tabi-r78/R78Mut1/`); Appendix B carries every mutant as the exact single `from` -> `to` edit, so the set can be re-applied to `scripts/check-filechooser-r78.mjs` without it.

Method, per mutant: write the mutated counter, the battery and the pinned driver into one scratch dir; run the battery beside it with `--lane <snapshot lane> --real <snapshot receipt> --expect-driver-sha256 0ae89d92… --expect-nonce <the snapshot receipt's nonce> --prior-set <snapshot prior-set> --laundered <the three degenerate receipts> --work <scratch> --json --first-failure`; classify by the battery summary (named failure = killed, `(positive)` with findings = killed-positive, `allOk` = survived, unparsable = crashed). Witness verification appends one `add(...)`/`accept(...)` line to a battery copy and runs both counters against it.

## Appendix — all 95 mutants (current frozen bytes)

| # | mutant | outcome | failed case / positive finding ids |
|---|---|---|---|
| 1 | `sem-typed-ts-positive-dropped` | killed | witness-event-types-ts-negative |
| 2 | `sem-typed-xy-half-null-or` | killed | event-types-half-null-xy |
| 3 | `sem-filetriple-size-positive` | killed-positive | event-types |
| 4 | `sem-typed-read-two-files` | killed | witness-event-types-read-two-files |
| 5 | `sem-typed-x-integer-to-number` | survived | — |
| 6 | `sem-errOk-code-any-number` | killed | witness-leg-records-error-code-float |
| 7 | `sem-errOk-message-key-only` | survived | — |
| 8 | `sem-evshape-aftersend-number` | killed | witness-cdp-event-log-aftersend-float |
| 9 | `sem-legrec-kind-dropped` | killed | leg-records-kind |
| 10 | `sem-legrec-elapsed-num-dropped` | killed | leg-records-elapsed-string |
| 11 | `sem-legrec-interceptresult-null-dropped` | survived | — |
| 12 | `sem-legrec-interceptresult-empty-dropped` | killed | leg-records-intercept-result |
| 13 | `sem-legrec-object-description-dropped` | killed | leg-records-object-description |
| 14 | `sem-legrec-object-subtype-dropped` | killed | witness-leg-records-object-subtype |
| 15 | `sem-legrec-opened-node-null-dropped` | survived | — |
| 16 | `sem-legrec-set-adjacency-loose` | killed | witness-leg-records-set-not-adjacent |
| 17 | `sem-legrec-set-before-trigger-strict` | survived | — |
| 18 | `sem-seq-zero-based` | killed-positive | seq-monotonic |
| 19 | `sem-legwindow-strict-lower` | killed | accept-mark-equal-event-at |
| 20 | `sem-marks-name-length-only` | killed | leg-marks-fabricated-name |
| 21 | `sem-marks-equal-start-strict` | killed | witness-accept-marks-equal-start |
| 22 | `sem-callcount-inputlike-dropped` | killed | chooser-call-count-case-variant,chooser-call-count-emulate-touch |
| 23 | `sem-callcount-navigate-ge` | killed | chooser-call-count-second-navigate |
| 24 | `sem-evlog-chooser-ge` | killed | cdp-event-log-extra-opening |
| 25 | `sem-frame-navs-ge` | killed | witness-frame-binding-second-nav |
| 26 | `sem-node-positive-dropped` | survived | — |
| 27 | `sem-node-inputs-ge` | survived | — |
| 28 | `sem-mode-multiple-to-webkitext` | killed-positive | mode-law |
| 29 | `sem-fixi-count-ge` | survived | — |
| 30 | `sem-fixi-rect-right-edge` | survived | — |
| 31 | `sem-walk-roots-narrow` | killed | prior-set-complete-symlinked-dir,prior-set-complete-uppercase-ext,prior-set-complete-txt-ext,prior-set-complete-nonce-stripped |
| 32 | `sem-walk-brace-heuristic-dropped` | killed | prior-set-unparsable-brace-txt |
| 33 | `sem-walk-receipt-test-dropped` | killed-positive | prior-set-complete |
| 34 | `sem-prior-complete-le-one` | killed | prior-set-complete-omitted,prior-set-complete-symlinked-dir,prior-set-complete-uppercase-ext,prior-set-complete-txt-ext |
| 35 | `sem-plan-length-only` | killed | plan-frozen,plan-frozen-intercept |
| 36 | `sem-quantum-tol-1e-3` | killed | event-time-quantum-bracket-2e-5 |
| 37 | `sem-gapmin-strict` | survived | — |
| 38 | `sem-pairmatch-reuse` | killed | accept-prior-scattered-below-threshold,accept-prior-abs-below-threshold |
| 39 | `sem-pairmatch-and-to-or` | killed | accept-prior-scattered-below-threshold,accept-prior-abs-below-threshold |
| 40 | `sem-timeline-refuse-or-to-and` | killed | replay-timeline-whole-shift-1ms,replay-timeline-whole-shift-100ms |
| 41 | `sem-absneed-floor` | killed | accept-prior-scattered-below-threshold,accept-prior-abs-below-threshold |
| 42 | `sem-owngaps-minus-one` | killed | replay-timeline-own-gap-49.9,replay-timeline-too-few-gaps |
| 43 | `sem-gapmatched-self` | killed-positive | replay-event-timeline |
| 44 | `sem-selection-exclusions-dropped` | killed | chooser-event-binding-opened-count |
| 45 | `sem-selection-multiple-ignored` | killed-positive | selection-law,read-law |
| 46 | `sem-selection-same-inverted` | killed-positive | selection-law,cancel-law,read-law |
| 47 | `sem-selection-dir-cancel-dropped` | killed-positive | selection-law |
| 48 | `sem-selection-interceptoff-dropped` | survived | — |
| 49 | `sem-plan-release-dropped` | killed-positive | chooser-call-params |
| 50 | `sem-plan-intercept-off-dropped` | killed-positive | chooser-call-params |
| 51 | `sem-exprs-late-dropped` | killed-positive | send-log-allowlist |
| 52 | `sem-allowlist-eval-window-prefix` | killed | lookalike-events-push |
| 53 | `sem-allowlist-eval-returnbyvalue-dropped` | killed | allowlist-eval-extra-param |
| 54 | `sem-allowlist-getframetree-dropped` | killed-positive | send-log-allowlist |
| 55 | `sem-allowlist-once-getframetree-dropped` | killed | allowlist-frame-tree-twice |
| 56 | `sem-allowlist-id-ge` | killed | allowlist-id-gap |
| 57 | `sem-failures-array-dropped` | survived | — |
| 58 | `sem-receiptkeys-frametree-dropped` | killed-positive | receipt-fields |
| 59 | `sem-fixture-viewport-dropped` | killed | witness-fixture-viewport |
| 60 | `sem-host-chromium-prefix` | killed | host-chromium-other-build |
| 61 | `sem-argv-profile-absolute-dropped` | survived | — |
| 62 | `sem-devtools-url-includes` | survived | — |
| 63 | `sem-upload-missing-dropped` | killed | upload-missing-name |
| 64 | `sem-nonce-shape-case-insensitive` | killed | nonce-shape |
| 65 | `sem-schema-string-any` | killed | schema |
| 66 | `sem-legshape-obj-any` | killed | legshape-consistency,legshape-fabricated-leg |
| 67 | `sem-trust-set-size-ge` | killed | witness-trust-law-same-leg-twice |
| 68 | `sem-trust-type-dropped` | survived | — |
| 69 | `sem-coordinate-trusted-dropped` | killed-positive | coordinate-law |
| 70 | `sem-readlaw-sha-dropped` | survived | — |
| 71 | `sem-nfil-setresult-dropped` | killed | witness-not-file-input-law-array-result |
| 72 | `sem-node-report-null` | killed-positive | legshape-consistency |
| 73 | `sem-shape-picksame-state` | killed-positive | leg-pick-same-files,leg-pick-same-state |
| 74 | `sem-multiple-table-m-false` | killed-positive | selection-law,cancel-law,read-law |
| 75 | `sem-opens-table-m-to-s` | killed-positive | mode-law,node-binding-law,selection-law,cancel-law,read-law |
| 76 | `sem-attarget-360-to-s` | killed-positive | fixture-descriptors,mode-law,node-binding-law,selection-law,cancel-law,read-law,coordinate-law |
| 77 | `sem-upload-b-type` | killed-positive | selection-law,cancel-law,read-law |
| 78 | `sem-st-svalue-noprefix` | killed-positive | leg-pick-single-state,leg-pick-multiple-state,leg-pick-same-state,leg-pick-first-only-state,leg-pick-missing-state,leg-pick-empty-state,leg-dir-mode-state,leg-accept-ignored-state,leg-forward-click-state,leg-script-click-state,leg-not-file-input-state,leg-intercept-cancel-state,leg-intercept-off-state |
| 79 | `sem-changed-trusted-last-false` | killed-positive | leg-pick-single-trusted,leg-pick-multiple-trusted,leg-pick-first-only-trusted,leg-pick-missing-trusted,leg-accept-ignored-trusted |
| 80 | `sem-fixi-keys-accept-dropped` | killed-positive | fixture-descriptors |
| 81 | `sem-fixiwant-k-accept-null` | killed-positive | fixture-descriptors |
| 82 | `sem-walk-exempt-lane-join-dropped` | survived | — |
| 83 | `sem-plan-press-clickcount-2` | killed-positive | chooser-call-params |
| 84 | `sem-legrec-keys-dropped` | killed | leg-records-extra-key |
| 85 | `sem-typed-eventset-dropped` | killed | event-types-unknown-type |
| 86 | `sem-legwindow-order-tolerance` | survived | — |
| 87 | `sem-chooser-opened-legs-ge` | killed | chooser-event-binding-opened-count |
| 88 | `sem-allowlist-emulation-scale-2` | killed-positive | send-log-allowlist |
| 89 | `sem-server-root-status-dropped` | survived | — |
| 90 | `sem-otherrows-favicon-run-dropped` | killed | server-log-favicon-query |
| 91 | `sem-runwindow-upper-inclusive` | survived | — |
| 92 | `sem-frame-tree-keys-accept-dropped` | killed-positive | frame-tree |
| 93 | `sem-frame-tree-parent-dropped` | killed | frame-tree-parent |
| 94 | `sem-frame-tree-url-dropped` | survived | — |
| 95 | `sem-cancel-legs-two` | killed-positive | cancel-law |
## Seat files

All JSON under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-78-seats/R78Mut1/`:

- `semantic-mutants-cur.json` — 95-mutant sweep on the current frozen bytes (46/28/21).
- `semantic-mutants-snapshot2.json`, `semantic-mutants.json` — the two D-era passes (the cross-pass diff is F2).
- `semantic-mutants-real-INVALID-nonce-drift.json` — the run that exposed F1 (all 95 killed-positive with `nonce-expected`).
- `baseline-counter-current.json`, `baseline-battery-current.json`, `baseline-counter-d-era.json`, `baseline-battery-d-era.json` — pristine baselines.
- `poisoned-real-lane-counter-1517.json` — F3 measurement.
- `exempt-demo/{p-none,p-rel,p-abs,m-rel,m-abs}.json` — F4 two-direction demonstration.
- `witnesses-witness-spec-cur.json`, `witnesses-witness-spec-d2.json` — witness verification on both anchors.
- `gap-exact-50.case` — the accept-case receipt for the exactly-50 ms own gap.

No tool was installed or upgraded for this seat. Scratch (`/fast/scratch/hyaku/tabi-r78/R78Mut1/`) held the mutant copies, the two lane snapshots and the battery work dirs; the lane itself was only read.

## Appendix B — mutant definitions (single edit each: `from` -> `to`)

| # | id | from | to |
|---|---|---|---|
| 1 | `sem-typed-ts-positive-dropped` | `num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0` | `num(e.ts) && num(e.at) && e.at > 0` |
| 2 | `sem-typed-xy-half-null-or` | `&& (e.x === null) === (e.y === null) && (e.x === null) === (e.buttons === null)` | `&& ((e.x === null) === (e.y === null) \|\| (e.x === null) === (e.buttons === null))` |
| 3 | `sem-filetriple-size-positive` | `Number.isInteger(f[1]) && f[1] >= 0` | `Number.isInteger(f[1]) && f[1] > 0` |
| 4 | `sem-typed-read-two-files` | `Array.isArray(e.files) && e.files.length === 1 && fileTriple(e.files[0])` | `Array.isArray(e.files) && e.files.length >= 1 && fileTriple(e.files[0])` |
| 5 | `sem-typed-x-integer-to-number` | `Number.isInteger(e.x) && e.files === null` | `typeof e.x === 'number' && e.files === null` |
| 6 | `sem-errOk-code-any-number` | `Number.isInteger(e.code) && typeof e.message === 'string'` | `typeof e.code === 'number' && typeof e.message === 'string'` |
| 7 | `sem-errOk-message-key-only` | `Number.isInteger(e.code) && typeof e.message === 'string'` | `Number.isInteger(e.code) && 'message' in e` |
| 8 | `sem-evshape-aftersend-number` | `Number.isInteger(e.afterSendId) && EVK[e.method] !== undefined` | `typeof e.afterSendId === 'number' && EVK[e.method] !== undefined` |
| 9 | `sem-legrec-kind-dropped` | `  if (l.kind !== p.kind) bad('kind');\n` | `` |
| 10 | `sem-legrec-elapsed-num-dropped` | `if (!num(l.elapsedMs) \|\| l.elapsedMs < 290) bad('elapsedMs');` | `if (l.elapsedMs < 290) bad('elapsedMs');` |
| 11 | `sem-legrec-interceptresult-null-dropped` | ` \|\| l.interceptResult !== null` | `` |
| 12 | `sem-legrec-interceptresult-empty-dropped` | `l.interceptError !== null \|\| !same(l.interceptResult, {})) bad('intercept send');` | `l.interceptError !== null) bad('intercept send');` |
| 13 | `sem-legrec-object-description-dropped` | ` \|\| tr.description !== 'button#f'` | `` |
| 14 | `sem-legrec-object-subtype-dropped` | ` \|\| tr.subtype !== 'node'` | `` |
| 15 | `sem-legrec-opened-node-null-dropped` | `(l.opened ? !Number.isInteger(l.openedNode) : l.openedNode !== null)` | `(l.opened && !Number.isInteger(l.openedNode))` |
| 16 | `sem-legrec-set-adjacency-loose` | `if (p.kind === 'set-object' && l.setSendId !== l.triggerSendId + 1) bad('set not right after the object lookup');` | `if (p.kind === 'set-object' && l.setSendId <= l.triggerSendId) bad('set not right after the object lookup');` |
| 17 | `sem-legrec-set-before-trigger-strict` | `l.setSendId <= l.triggerSendId)) bad('set before trigger');` | `l.setSendId < l.triggerSendId)) bad('set before trigger');` |
| 18 | `sem-seq-zero-based` | `e.seq === i + 1` | `e.seq === i` |
| 19 | `sem-legwindow-strict-lower` | `return e.at >= w[0] && e.at <= w[1] &&` | `return e.at > w[0] && e.at <= w[1] &&` |
| 20 | `sem-marks-name-length-only` | `const marksOk = same(markNames, ['start', ...LEG_ORDER])` | `const marksOk = markNames.length === LEG_ORDER.length + 1` |
| 21 | `sem-marks-equal-start-strict` | `&& (i === 0 \|\| m.at >= marks[i - 1].at)` | `&& (i === 0 \|\| m.at > marks[i - 1].at)` |
| 22 | `sem-callcount-inputlike-dropped` | `check('chooser-call-count', inputLike.length === 34 && ` | `check('chooser-call-count', ` |
| 23 | `sem-callcount-navigate-ge` | `&& n('Page.navigate') === 1,` | `&& n('Page.navigate') >= 1,` |
| 24 | `sem-evlog-chooser-ge` | `evN('Page.fileChooserOpened') === 10 && evN('Page.frameNavigated') === 1` | `evN('Page.fileChooserOpened') >= 10 && evN('Page.frameNavigated') === 1` |
| 25 | `sem-frame-navs-ge` | `&& navs.length === 1 && isObj(navs[0].params)` | `&& navs.length >= 1 && isObj(navs[0].params)` |
| 26 | `sem-node-positive-dropped` | `nodeVals.every((v) => Number.isInteger(v) && v > 0)` | `nodeVals.every((v) => Number.isInteger(v))` |
| 27 | `sem-node-inputs-ge` | `Object.keys(nodeOf).length === 4` | `Object.keys(nodeOf).length >= 4` |
| 28 | `sem-mode-multiple-to-webkitext` | `(dsc.multiple === true ? 'selectMultiple' : 'selectSingle')` | `(dsc.webkitdirectory === true ? 'selectMultiple' : 'selectSingle')` |
| 29 | `sem-fixi-count-ge` | `if (fixi.length !== 5) fixiBad.push('count ' + fixi.length);` | `if (fixi.length < 5) fixiBad.push('count ' + fixi.length);` |
| 30 | `sem-fixi-rect-right-edge` | `if (!(p.at[0] >= dsc.rect.left && p.at[0] < dsc.rect.left + dsc.rect.width && p.at[1] >= dsc.rect.top && p.at[1] < dsc.rect.top + dsc.rect.height))` | `if (!(p.at[0] >= dsc.rect.left && p.at[0] <= dsc.rect.left + dsc.rect.width && p.at[1] >= dsc.rect.top && p.at[1] < dsc.rect.top + dsc.rect.height))` |
| 31 | `sem-walk-roots-narrow` | `for (const t of ['.ufo/waves/round-78', 'corpus/evidence/round78']) walk(path.join(lane, t));` | `for (const t of ['.ufo/waves/round-78/controls', 'corpus/evidence/round78']) walk(path.join(lane, t));` |
| 32 | `sem-walk-brace-heuristic-dropped` | `if (/\.json$/i.test(name) \|\| /^\s*[[{]/.test(b.subarray(0, 64).toString('utf8'))) unparsable.push(path.relative(lane, p));` | `if (/\.json$/i.test(name)) unparsable.push(path.relative(lane, p));` |
| 33 | `sem-walk-receipt-test-dropped` | `if (isObj(j) && j.schema === SCHEMA && ('nonce' in j \|\| 'events' in j) && rf !== selfReal` | `if (isObj(j) && j.schema === SCHEMA && rf !== selfReal` |
| 34 | `sem-prior-complete-le-one` | `check('prior-set-complete', outside.length === 0` | `check('prior-set-complete', outside.length <= 1` |
| 35 | `sem-plan-length-only` | `check('plan-frozen', same(r.plan, FROZEN)` | `check('plan-frozen', arr(r.plan).length === FROZEN.length` |
| 36 | `sem-quantum-tol-1e-3` | `Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4` | `Math.abs(v * 10 - Math.round(v * 10)) <= 1e-3` |
| 37 | `sem-gapmin-strict` | `if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]);` | `if (at[i] - at[i - 1] > GAP_MIN) g.push(at[i] - at[i - 1]);` |
| 38 | `sem-pairmatch-reuse` | `const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL);` | `const k = y.findIndex((v) => Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL);` |
| 39 | `sem-pairmatch-and-to-or` | `Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL` | `Math.abs(v[0] - e.ts) < TOL \|\| Math.abs(v[1] - e.at) < TOL` |
| 40 | `sem-timeline-refuse-or-to-and` | `refused: (np > 0 && absMatched >= absNeed) \|\| (gp > 0 && gapMatched >= gapNeed)` | `refused: (np > 0 && absMatched >= absNeed) && (gp > 0 && gapMatched >= gapNeed)` |
| 41 | `sem-absneed-floor` | `const absNeed = Math.ceil(FRAC * np - 1e-9)` | `const absNeed = Math.floor(FRAC * np)` |
| 42 | `sem-owngaps-minus-one` | `ownGaps >= MIN_OWN_GAPS && replayIdx === -1` | `ownGaps >= MIN_OWN_GAPS - 1 && replayIdx === -1` |
| 43 | `sem-gapmatched-self` | `const absMatched = pairMatch(a, p), gapMatched = matchCount(gaps(a), gaps(p));` | `const absMatched = pairMatch(a, p), gapMatched = matchCount(gaps(p), gaps(p));` |
| 44 | `sem-selection-exclusions-dropped` | `const selBad = FROZEN.filter((p) => !(p.name === 'pick-same' \|\| p.name === 'pick-empty' \|\| p.name === 'intercept-cancel' \|\| p.name === 'intercept-off'))` | `const selBad = FROZEN.filter((p) => true)` |
| 45 | `sem-selection-multiple-ignored` | `(MULTIPLE[inp] ? p.files : p.files.slice(0, 1)).map(trip)` | `p.files.map(trip)` |
| 46 | `sem-selection-same-inverted` | `if (same(chosen, model[inp])) e.fileEvents.push(['cancel', inp, model[inp]]);` | `if (!same(chosen, model[inp])) e.fileEvents.push(['cancel', inp, model[inp]]);` |
| 47 | `sem-selection-dir-cancel-dropped` | `} else if (p.files === null && p.intercept && p.intercept.cancel === true) e.fileEvents.push(['cancel', inp, model[inp]]);` | `} else if (p.files === null) e.fileEvents.push(['cancel', inp, model[inp]]);` |
| 48 | `sem-selection-interceptoff-dropped` | `} else if (p.kind === 'click' && p.intercept && p.intercept.enabled === false) {` | `} else if (p.kind === 'click' && p.intercept) {` |
| 49 | `sem-plan-release-dropped` | `}], ['Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.at[0], y: p.at[1], button: 'left', buttons: 0, clickCount: 1 }]);` | `}]);` |
| 50 | `sem-plan-intercept-off-dropped` | `if (p.intercept) planCalls.push(['Page.setInterceptFileChooserDialog', p.intercept]);` | `if (p.intercept && p.intercept.enabled) planCalls.push(['Page.setInterceptFileChooserDialog', p.intercept]);` |
| 51 | `sem-exprs-late-dropped` | `'window.__late', ` | `` |
| 52 | `sem-allowlist-eval-window-prefix` | `if (c.method === 'Runtime.evaluate') return same(c.params, { expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression)` | `if (c.method === 'Runtime.evaluate') return same(c.params, { expression: c.params.expression, returnByValue: true }) && (EXPRS.has(c.params.expression) \|\| /^window\.__/.test(c.params.expression))` |
| 53 | `sem-allowlist-eval-returnbyvalue-dropped` | `return same(c.params, { expression: c.params.expression, returnByValue: true }) && EXPRS.has` | `return typeof c.params.expression === 'string' && EXPRS.has` |
| 54 | `sem-allowlist-getframetree-dropped` | `const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree']);` | `const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable']);` |
| 55 | `sem-allowlist-once-getframetree-dropped` | ` && once('Page.getFrameTree')` | `` |
| 56 | `sem-allowlist-id-ge` | `sendLog.every((c, i) => isObj(c) && c.id === i + 1)` | `sendLog.every((c, i) => isObj(c) && c.id >= i + 1)` |
| 57 | `sem-failures-array-dropped` | `check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0` | `check('failures-empty', arr(r.failures).length === 0` |
| 58 | `sem-receiptkeys-frametree-dropped` | `'fixtureInputs', 'frameTree', 'host'` | `'fixtureInputs', 'host'` |
| 59 | `sem-fixture-viewport-dropped` | ` && same(r.fixture.viewport, VIEWPORT)` | `` |
| 60 | `sem-host-chromium-prefix` | `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct` | `String(host.chromium).startsWith('Chromium ') && host.cdpProduct === HOST.cdpProduct` |
| 61 | `sem-argv-profile-absolute-dropped` | ` && path.isAbsolute(profileArg) && path.basename(profileArg) === 'profile-' + tok` | ` && path.basename(profileArg) === 'profile-' + tok` |
| 62 | `sem-devtools-url-includes` | `dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/')` | `dl.url.includes('/devtools/browser/')` |
| 63 | `sem-upload-missing-dropped` | ` && up.missing === MISSING` | `` |
| 64 | `sem-nonce-shape-case-insensitive` | `/^tabi-r78-[a-z0-9-]+$/.test(r.nonce)` | `/^tabi-r78-[a-z0-9-]+$/i.test(r.nonce)` |
| 65 | `sem-schema-string-any` | `check('schema', r.schema === SCHEMA` | `check('schema', typeof r.schema === 'string'` |
| 66 | `sem-legshape-obj-any` | `check('legshape-consistency', same(r.legShape, derived)` | `check('legshape-consistency', isObj(r.legShape)` |
| 67 | `sem-trust-set-size-ge` | `new Set(untrusted.map((e) => e.leg)).size === 2` | `new Set(untrusted.map((e) => e.leg)).size >= 1` |
| 68 | `sem-trust-type-dropped` | `untrusted.every((e) => e.type === 'click' && e.target === 's'` | `untrusted.every((e) => e.target === 's'` |
| 69 | `sem-coordinate-trusted-dropped` | `if (e.x === null \|\| e.isTrusted !== true) return false;` | `if (e.x === null) return false;` |
| 70 | `sem-readlaw-sha-dropped` | ` \|\| (u.hex !== null && sha256(Buffer.from(u.hex, 'hex')) !== u.sha256)` | `` |
| 71 | `sem-nfil-setresult-dropped` | `same(nf.setError, NOT_FILE_INPUT) && nf.setResult === null && ` | `same(nf.setError, NOT_FILE_INPUT) && ` |
| 72 | `sem-node-report-null` | `opened: bound.map((e) => [e.params.mode, e.params.backendNodeId ?? null]),` | `opened: bound.map((e) => [e.params.mode, null]),` |
| 73 | `sem-shape-picksame-state` | `'pick-same': cancelled([['selectSingle', 5]], S2),` | `'pick-same': cancelled([['selectSingle', 5]], S3),` |
| 74 | `sem-multiple-table-m-false` | `const MULTIPLE = { s: false, m: true, d: false, k: false };` | `const MULTIPLE = { s: false, m: false, d: false, k: false };` |
| 75 | `sem-opens-table-m-to-s` | `const OPENS = { s: 's', m: 'm', d: 'd', k: 'k', f: 's' };` | `const OPENS = { s: 's', m: 's', d: 'd', k: 'k', f: 's' };` |
| 76 | `sem-attarget-360-to-s` | `const AT_TARGET = { '160,120': 's', '360,120': 'm', '560,120': 'd', '760,120': 'k', '160,320': 'f' };` | `const AT_TARGET = { '160,120': 's', '360,120': 's', '560,120': 'd', '760,120': 'k', '160,320': 'f' };` |
| 77 | `sem-upload-b-type` | `[B]: { size: 5, sha256: 'ff5d8507b6a72bee2debce2c0054798deaccdc5d8a1b945b6280ce8aa9cba52e', type: 'application/octet-stream'` | `[B]: { size: 5, sha256: 'ff5d8507b6a72bee2debce2c0054798deaccdc5d8a1b945b6280ce8aa9cba52e', type: 'text/plain'` |
| 78 | `sem-st-svalue-noprefix` | `sValue: s.length ? 'C:\\fakepath\\' + s[0][0] : ''` | `sValue: s.length ? s[0][0] : ''` |
| 79 | `sem-changed-trusted-last-false` | `trusted: [true, true, true, true, true, true, true], act: [true, true, true, true, true, false, false]` | `trusted: [true, true, true, true, true, true, false], act: [true, true, true, true, true, false, false]` |
| 80 | `sem-fixi-keys-accept-dropped` | `['accept', 'id', 'multiple', 'rect', 'tag', 'type', 'webkitdirectory']` | `['id', 'multiple', 'rect', 'tag', 'type', 'webkitdirectory']` |
| 81 | `sem-fixiwant-k-accept-null` | `accept: '.png' }, f:` | `accept: null }, f:` |
| 82 | `sem-walk-exempt-lane-join-dropped` | `const exemptReal = new Set(treeExempt.map((p) => real(path.isAbsolute(p) ? p : path.join(lane, p))));` | `const exemptReal = new Set(treeExempt.map((p) => real(p)));` |
| 83 | `sem-plan-press-clickcount-2` | `button: 'left', buttons: 1, clickCount: 1 }], ['Input.dispatchMouseEvent', { type: 'mouseReleased'` | `button: 'left', buttons: 1, clickCount: 2 }], ['Input.dispatchMouseEvent', { type: 'mouseReleased'` |
| 84 | `sem-legrec-keys-dropped` | `if (!same(Object.keys(l).sort(), LEG_KEYS)) bad('keys');` | `` |
| 85 | `sem-typed-eventset-dropped` | ` && EVENT_TYPES.has(e.type)` | `` |
| 86 | `sem-legwindow-order-tolerance` | `(num(events[i - 1].at) && e.at >= events[i - 1].at)` | `(num(events[i - 1].at) && e.at >= events[i - 1].at - 0.05)` |
| 87 | `sem-chooser-opened-legs-ge` | `openedLegs === 10` | `openedLegs >= 10` |
| 88 | `sem-allowlist-emulation-scale-2` | `same(c.params, { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false })` | `same(c.params, { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 2, mobile: false })` |
| 89 | `sem-server-root-status-dropped` | `const servedRoot = slog.filter((s) => isObj(s) && s.path === '/' && s.status === 200);` | `const servedRoot = slog.filter((s) => isObj(s) && s.path === '/');` |
| 90 | `sem-otherrows-favicon-run-dropped` | ` && s.status === 404 && s.run === '' && s.query === '')` | ` && s.status === 404)` |
| 91 | `sem-runwindow-upper-inclusive` | `t1 - t0 < 600000` | `t1 - t0 <= 600000` |
| 92 | `sem-frame-tree-keys-accept-dropped` | `same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameParentId', 'mainFrameUrl'])` | `same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameUrl'])` |
| 93 | `sem-frame-tree-parent-dropped` | ` && ftree.mainFrameParentId === null` | `` |
| 94 | `sem-frame-tree-url-dropped` | ` && ftree.mainFrameUrl === 'about:blank'` | `` |
| 95 | `sem-cancel-legs-two` | `const cancelLegs = ['pick-same', 'intercept-cancel', 'intercept-off'];` | `const cancelLegs = ['pick-same', 'intercept-cancel'];` |
