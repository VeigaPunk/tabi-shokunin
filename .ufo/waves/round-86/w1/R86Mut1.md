# R86Mut1 — independent mutant sweep, C1 coverage (round 86, wave w1)
Seat `R86Mut1` (leaf mutation tester), lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `57265864`, D `4bd89a80f439`, nonce `tabi-r86-l1-4bd89a80f439`, date 2026-11-08. Read-only on the lane: no commit, no push, no mutating git/jj; only the lane's frozen instruments were read and copied to scratch.
## Instruments (frozen, read-only)
| artifact | sha256 |
|---|---|
| `scripts/check-showpicker-r86.mjs` (counter) | `a41fab46647127cd19d10eeaa6a33ac9d47f4c7b75d69ec169cfc3a71b73370a` |
| `scripts/negatives-showpicker-r86.mjs` (battery) | `b7ddaf7b976a9ae4f2ea1f36c2804abc483071ac04e4b0d79144f16a8e0d89ec` |
| `corpus/evidence/round86/chromium-showpicker/receipt.json` | `035ac3f03e3e3f039b98ac7086a4e8160571db59c4a36cc453fbca119492b64d` |
| driver pin | `5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d` |
| fixture pin in receipt | `94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1` |

Counter and battery hashes match `.ufo/waves/round-86/freeze.txt`; the receipt was never modified (same sha256 after all runs).
## Method
1. Baseline first, in scratch: pristine counter on the real receipt → `verdict clean`, `checkCount 95`; pristine battery → exit 0, `201` cases, `0` failed, coverage `declared 95 / covered 95 / uncovered 0`. Battery wall time 18.4 s.
2. Authored 63 candidate semantic edits of the counter (drop a conjunct, invert a scope, substitute a pin, narrow a check to one token form/leg). One candidate (`g-drop-paramkeys`) was rejected at generation because the grammar law has no `setParams` key-set conjunct (0 textual matches); it was never run. The remaining **62** were written as byte-distinct counter files, each in its own scratch directory **beside an exact copy of the frozen battery** (verified: every copied battery sha256 = `b7ddaf7b…`).
3. Each of the 62 mutants was run on the real receipt first: **62/62 still returned `clean` with 95 checks**, so every edit is a weakening, not a breakage of the honest path.
4. Each mutant was then scored with the frozen battery (201 cases, `--work` isolated per mutant, 18 parallel). Battery exit 0 = survived; exit 1 = killed. `crashed` would be a mutant counter that fails to parse/run or times out; `unapplied` would be an edit whose anchor did not match exactly once.
5. Every battery survivor was re-probed with a **differential witness**: one receipt mutation aimed exactly at the weakened conjunct, run through the pristine counter and through the mutant. `escape` = pristine refuses (`findings`) and mutant accepts (`clean`); `shadowed` = mutant still refuses because a named compensating check catches the same mutation. Witnesses are scratch receipts derived from the real receipt (replay witnesses are derived from the frozen prior1 with fresh launch tokens/devtools ids so only the replay rule differs).

Counts: candidates authored **63**; scored mutants **62**; killed **12**; survived **50** (of which **29 demonstrated whole-counter escapes** and **21 are shadowed** by a named check); crashed **0**; unapplied **0**.

Per-area table:

| area | mutants | killed | survived | escapes | shadowed |
|---|---:|---:|---:|---:|---:|
| accept-grammar | 14 | 5 | 9 | 6 | 3 |
| colour | 8 | 3 | 5 | 0 | 5 |
| witness-search-text | 8 | 2 | 6 | 3 | 3 |
| mode-law | 4 | 0 | 4 | 0 | 4 |
| intercept-law | 4 | 1 | 3 | 0 | 3 |
| answer-law | 8 | 1 | 7 | 5 | 2 |
| new-legs | 13 | 0 | 13 | 12 | 1 |
| replay | 3 | 0 | 3 | 3 | 0 |

## Killed by the frozen battery (12)
| mutant | area | edit | battery refusal |
|---|---|---|---|
| `b-aa-backendnode` | answer-law | accept-answer-law: accepts any positive backendNodeId instead of the chooser event that armed the answer | `w-cdp-open-backendnode-nonpositive-ok` (expected `cdp-event-log-closed`; exit 1 expected cdp-event-log-closed got ["cdp-event-log-closed","accept-answer-law"] extra ["accept-answer-law"]) |
| `c-act-after-narrow` | colour | same-origin-color-law: accepts any object as post-call activation instead of the consumed transition | `color-law-activation-after` (expected `same-origin-color-law`; exit 1 expected same-origin-color-law got ["activation-law"]) |
| `c-drop-inputchange` | colour | same-origin-color-law: stops requiring zero input/change events on the colour arm | `color-law-input-event` (expected `same-origin-color-law`; exit 1 expected same-origin-color-law got ["leg-sp86-same-origin-color-activated","no-selection-law"]) |
| `c-drop-opened` | colour | same-origin-color-law: stops requiring zero Page.fileChooserOpened events on the colour arm | `same-origin-color-law-opens` (expected `same-origin-color-law`; exit 1 expected same-origin-color-law got ["plan-calls","leg-sp86-same-origin-color-activated","intercept-law"]) |
| `e-skip-cross` | intercept-law | intercept-law: exempts every cross-origin leg from the opened-count check | `intercept-law` (expected `intercept-law`; exit 1 expected intercept-law got ["plan-calls","leg-sp84-cross-origin-nonfile-disabled","order-law"]) |
| `f-search-childseq-drop` | witness-search-text | sp84-cross-origin-search-law: stops pinning the child event sequence on the search leg | `cross-search-childseq-dropped` (expected `sp84-cross-origin-search-law`; exit 0 expected sp84-cross-origin-search-law got []) |
| `f-text-actbefore-drop` | witness-search-text | sp84-cross-origin-text-law: stops pinning child activation-before on the text leg | `cross-text-childact-before-dropped` (expected `sp84-cross-origin-text-law`; exit 0 expected sp84-cross-origin-text-law got []) |
| `g-bytes-drop` | accept-grammar | accept-grammar-law: drops the page-read hex check for every accept form | `accept-grammar-law-bytes` (expected `accept-grammar-law`; exit 0 expected accept-grammar-law got []) |
| `g-state-drop` | accept-grammar | accept-grammar-law: drops the delivered-state check for every accept form | `accept-grammar-law-state` (expected `accept-grammar-law`; exit 1 expected accept-grammar-law got ["leg-sp86-accept-mixed-png","no-selection-law"]) |
| `g-token-drop-am` | accept-grammar | accept-grammar-law: enforces the accept token pin only on the mixed-list (am) rows; the wildcard (aw) and PDF (ap) rows are left unpinned | `accept-grammar-law` (expected `accept-grammar-law`; exit 1 expected accept-grammar-law got ["fixture-descriptors"]); `accept-grammar-law-token` (expected `accept-grammar-law`; exit 1 expected accept-grammar-law got ["fixture-descriptors"]) |
| `g-token-drop-ap` | accept-grammar | accept-grammar-law: enforces the accept token pin only on the PDF (ap) row; the wildcard (aw) and mixed-list (am) rows are left unpinned | `accept-grammar-law` (expected `accept-grammar-law`; exit 1 expected accept-grammar-law got ["fixture-descriptors"]) |
| `g-token-nullable` | accept-grammar | accept-grammar-law: accepts a null/missing accept attribute as matching any token form on every row | `accept-grammar-law` (expected `accept-grammar-law`; exit 1 expected accept-grammar-law got ["fixture-descriptors"]) |

Notes on the kill modes: `g-token-drop-am`, `g-token-drop-ap`, `g-token-nullable`, `g-state-drop` are killed by the battery's expected-id rule (the counter still refuses via `fixture-descriptors`/`leg-sp86-*`/`no-selection-law`, so the expected `accept-grammar-law` id is missing). `b-aa-backendnode` is killed by an **extra** finding: the positivity substitute fires on the `w-cdp-open-backendnode-nonpositive-ok` witness. `e-skip-cross` is the only killed run that also loses battery coverage (94/95; no other case expects `intercept-law`), which is expected for a mutant that removes the sole `intercept-law` case's stimulus response.

## Survivors (50) — full list with the weakened conjunct
`escape` rows are whole-counter coverage holes under an aimed witness; `shadowed` rows are conjunct-level weakenings that the mutant still refuses because another frozen check catches the same mutation. The shadowing ids are measured, not inferred.

| # | mutant | area | weakened conjunct | witness evidence |
|---:|---|---|---|---|
| 1 | `b-aa-answerfiles-drop` | answer-law | accept-answer-law: stops checking answer.files | escape; pristine flags `accept-answer-law`; mutant exit 0 clean |
| 2 | `b-aa-readcount-drop` | answer-law | accept-answer-law: stops requiring exactly one page read | shadowed; mutant still flags `leg-sp84-accept-answer` |
| 3 | `b-aa-setresult-drop` | answer-law | accept-answer-law: stops requiring the exact {} setResult | escape; pristine flags `accept-answer-law`; mutant exit 0 clean |
| 4 | `b-aa-sha-drop` | answer-law | accept-answer-law: pins upload name/size but drops the upload sha256 | escape; pristine flags `accept-answer-law`; mutant exit 0 clean |
| 5 | `b-aa-state-drop` | answer-law | accept-answer-law: stops pinning the delivered k-input state | shadowed; mutant still flags `leg-sp84-accept-answer`, `no-selection-law` |
| 6 | `b-am-backendnode` | answer-law | accept-mime-answer-law: accepts any positive backendNodeId instead of the arming chooser event | escape; pristine flags `accept-mime-answer-law`; mutant exit 0 clean |
| 7 | `b-am-hex-drop` | answer-law | accept-mime-answer-law: pins uploadPng name/size/sha256 but drops its hex bytes | escape; pristine flags `accept-mime-answer-law`; mutant exit 0 clean |
| 8 | `c-drop-act-before` | colour | same-origin-color-law: stops pinning the pre-call activation state | shadowed; mutant still flags `activation-law` |
| 9 | `c-drop-cos-empty` | colour | same-origin-color-law: stops requiring the colour input state to stay empty | shadowed; mutant still flags `leg-sp86-same-origin-color-activated`, `no-selection-law` |
| 10 | `c-drop-ret` | colour | same-origin-color-law: stops requiring showPicker() to return the string "undefined" | shadowed; mutant still flags `gesture-law` |
| 11 | `c-ok-substitute` | colour | same-origin-color-law: accepts a missing/undefined ok flag (only rejects explicit false) | shadowed; mutant still flags `gesture-law` |
| 12 | `c-ret-substitute` | colour | same-origin-color-law: accepts any string return value instead of "undefined" | shadowed; mutant still flags `gesture-law` |
| 13 | `d-drop-descriptor` | mode-law | mode-law: stops requiring the page-measured descriptor to exist before choosing the expected mode | shadowed; mutant still flags `fixture-descriptors` |
| 14 | `d-first-open-only` | mode-law | mode-law: checks only the first chooser event of a leg, not every open | shadowed; mutant still flags `leg-sp84-second-chooser-answer` |
| 15 | `d-multiple-nullable` | mode-law | mode-law: treats a missing `multiple` attribute as multiple instead of single | shadowed; mutant still flags `fixture-descriptors` |
| 16 | `d-skip-new-targets` | mode-law | mode-law: exempts the three r86 accept-grammar inputs (aw/am/ap) from the mode check | shadowed; mutant still flags `leg-sp86-accept-wildcard-text` |
| 17 | `e-click-tautology` | intercept-law | intercept-law: makes the expected opened count for the click-while-open/second-chooser legs equal to whatever was observed | shadowed; mutant still flags `leg-sp84-click-while-open`, `click-while-open-law` |
| 18 | `e-nopicker-tautology` | intercept-law | intercept-law: makes the expected opened count for NO_PICKER legs equal to whatever was observed | shadowed; mutant still flags `plan-calls`, `leg-sp85-same-origin-tel-activated`, `same-origin-no-picker-law` |
| 19 | `e-skip-new-legs` | intercept-law | intercept-law: exempts the five r86 accept-grammar legs from the opened-count check | shadowed; mutant still flags `plan-calls`, `leg-sp86-accept-wildcard-png` |
| 20 | `f-result-message-only` | witness-search-text | cross-origin extra laws: pin only childResult.message, dropping ok/name (a wrong `name` with `ok:false` now passes; an `ok:true` result is still caught by intercept-law) | escape; pristine flags `sp84-cross-origin-search-law`; mutant exit 0 clean |
| 21 | `f-search-count-drop` | witness-search-text | sp84-cross-origin-search-law: stops requiring exactly five child events on the search leg | shadowed; mutant still flags `sp84-cross-origin-search-law` |
| 22 | `f-search-trust-drop` | witness-search-text | sp84-cross-origin-search-law: stops requiring child iframe events to be trusted on the search leg only | escape; pristine flags `sp84-cross-origin-search-law`; mutant exit 0 clean |
| 23 | `f-search-zeroopen-skip` | witness-search-text | sp84-cross-origin-search-law: stops requiring zero Page.fileChooserOpened events on the search leg | shadowed; mutant still flags `plan-calls`, `leg-sp84-cross-origin-search`, `intercept-law` |
| 24 | `f-text-act-drop` | witness-search-text | sp84-cross-origin-text-law: stops requiring child iframe events to be activation-bearing on the text leg only | escape; pristine flags `sp84-cross-origin-text-law`; mutant exit 0 clean |
| 25 | `f-text-count-drop` | witness-search-text | sp84-cross-origin-text-law: stops requiring exactly five child events on the text leg | shadowed; mutant still flags `sp84-cross-origin-text-law` |
| 26 | `g-bytes-narrow` | accept-grammar | accept-grammar-law: skips the page-read hex check on the two wildcard image/* (aw) rows, leaving the mixed and PDF rows pinned | escape; pristine flags `accept-grammar-law`; mutant exit 0 clean |
| 27 | `g-drop-answer-files` | accept-grammar | accept-grammar-law: stops checking the answer.files list delivered by DOM.setFileInputFiles | escape; pristine flags `accept-grammar-law`; mutant exit 0 clean |
| 28 | `g-drop-backendnode` | accept-grammar | accept-grammar-law: stops pinning the DOM.setFileInputFiles backendNodeId to the chooser event that armed the answer | escape; pristine flags `accept-grammar-law`; mutant exit 0 clean |
| 29 | `g-drop-paramslength` | accept-grammar | accept-grammar-law: stops requiring exactly one file in the delivered file list | shadowed; mutant still flags `plan-calls` |
| 30 | `g-drop-readcount` | accept-grammar | accept-grammar-law: stops requiring exactly one page read of the delivered bytes | shadowed; mutant still flags `leg-sp86-accept-wildcard-text` |
| 31 | `g-drop-seterror` | accept-grammar | accept-grammar-law: stops requiring setError === null on the answer | escape; pristine flags `accept-grammar-law`; mutant exit 0 clean |
| 32 | `g-fixture-accept-unpinned` | accept-grammar | fixture-descriptors: stops pinning the accept attribute of every fixture input (descriptor match ignores accept) | escape; pristine flags `fixture-descriptors`; mutant exit 0 clean |
| 33 | `g-setresult-substitute` | accept-grammar | accept-grammar-law: accepts any object as setResult instead of the exact {} CDP result | escape; pristine flags `accept-grammar-law`; mutant exit 0 clean |
| 34 | `g-state-narrow` | accept-grammar | accept-grammar-law: skips the delivered-state check on the two wildcard image/* (aw) rows, leaving the mixed and PDF rows pinned | shadowed; mutant still flags `leg-sp86-accept-mixed-png`, `accept-grammar-law`, `no-selection-law` |
| 35 | `h-activation-skip` | new-legs | activation-law: exempts every sp85/sp86 leg from the parent activation transition check | escape; pristine flags `activation-law`; mutant exit 0 clean |
| 36 | `h-cdp-event-skip` | new-legs | cdp-event-log-closed: exempts every sp86 accept leg from the CDP event-log shape/binding check | escape; pristine flags `cdp-event-log-closed`; mutant exit 0 clean |
| 37 | `h-eventtypes-skip` | new-legs | event-types: lets malformed page events pass when targeted at the new inputs (aw/am/ap/cos) | escape; pristine flags `event-types`; mutant exit 0 clean |
| 38 | `h-eventwindow-skip` | new-legs | event-leg-window: exempts every sp86 leg from the event-window ordering check | escape; pristine flags `event-leg-window`; mutant exit 0 clean |
| 39 | `h-gesture-skip` | new-legs | gesture-law: exempts every sp86 leg from the frozen showPicker outcome check | escape; pristine flags `gesture-law`; mutant exit 0 clean |
| 40 | `h-legmarks-skip` | new-legs | leg-marks: exempts every sp86 leg from mark names/order/lateAfterClose validation | escape; pristine flags `leg-marks`; mutant exit 0 clean |
| 41 | `h-legrecords-skip` | new-legs | leg-records: exempts every sp86 leg from record key/error/chooser-wait validation | escape; pristine flags `leg-records`; mutant exit 0 clean |
| 42 | `h-noselection-skip` | new-legs | no-selection-law: exempts every sp86 leg from the empty-state / no-file-event check | escape; pristine flags `no-selection-law`; mutant exit 0 clean |
| 43 | `h-plan-calls-skip` | new-legs | plan-calls: exempts every sp86 leg from the frozen CDP call-sequence check | escape; pristine flags `plan-calls`; mutant exit 0 clean |
| 44 | `h-quantum-skip` | new-legs | event-time-quantum: lets events targeted at the new inputs (aw/am/ap/cos) sit off the 0.1 ms grid | escape; pristine flags `event-time-quantum`; mutant exit 0 clean |
| 45 | `h-sendlog-skip` | new-legs | send-log-allowlist: exempts every sp86 leg from the allowlisted send-log check | escape; pristine flags `send-log-allowlist`; mutant exit 0 clean |
| 46 | `h-seq-skip` | new-legs | seq-monotonic: exempts every sp86 leg from the 1..N sequence check | escape; pristine flags `seq-monotonic`; mutant exit 0 clean |
| 47 | `h-trust-skip` | new-legs | trust-law: lets page events targeted at the new inputs (aw/am/ap/cos) be untrusted | shadowed; mutant still flags `leg-sp86-accept-wildcard-png` |
| 48 | `r-frac-tighten` | replay | replay-event-timeline: raises the near-match fraction from 0.5 to 0.9 (a forger must move far more events before refusal) | escape; pristine flags `replay-event-timeline`; mutant exit 0 clean |
| 49 | `r-need-plus-one` | replay | replay-event-timeline: raises the required match count by one, so an exact prior copy no longer trips the refusal | escape; pristine flags `replay-event-timeline`; mutant exit 0 clean |
| 50 | `r-strict-compare` | replay | replay-event-timeline: refuses only when absMatched is strictly greater than absNeed (boundary forgery passes) | escape; pristine flags `replay-event-timeline`; mutant exit 0 clean |

## What the 29 escapes cover (valuable findings)
1. **accept-grammar-law**: the battery never mutates `answer.files`, `answer.setParams.backendNodeId`, `answer.setResult`, or `answer.setError` on a grammar leg, and never mutates the `aw` wildcard row's page-read hex. It also never mutates the `accept` attribute of input `k` (the grammar matrix only covers `aw/am/ap`). Six escapes: `g-drop-answer-files`, `g-drop-backendnode`, `g-setresult-substitute`, `g-drop-seterror`, `g-bytes-narrow`, `g-fixture-accept-unpinned`.
2. **answer laws on the r84 legs**: `answer.files`, `setResult`, upload `sha256` (accept-answer) and `setParams.backendNodeId` + `uploadPng.hex` (accept-mime) are unpinned by every battery case. Five escapes: `b-aa-answerfiles-drop`, `b-aa-setresult-drop`, `b-aa-sha-drop`, `b-am-backendnode`, `b-am-hex-drop`.
3. **search/text witnesses**: the frozen six-family mutations cover message, childLate, crossAccess, event sequence, and both child activation fields, but not child `isTrusted`, child `act`, or `childResult.name` with `ok:false`. Three escapes: `f-search-trust-drop`, `f-text-act-drop`, `f-result-message-only`.
4. **new sp86 legs / whole checks**: twelve whole-check exemptions escape (`activation-law`, `cdp-event-log-closed`, `event-types`, `event-leg-window`, `gesture-law`, `leg-marks`, `leg-records`, `no-selection-law` dismiss-state conjunct, `plan-calls`, `event-time-quantum`, `send-log-allowlist`, `seq-monotonic`). For each, the battery has no case whose *expected id* is that check from an sp86-leg mutation: a few ids (activation-law, gesture-law, no-selection-law, event-leg-window) can appear as tolerated extras on the colour/grammar cases, but they are never required, so the exemption is invisible to the battery. Every exemption accepts a clean receipt under its aimed witness. This is the largest coverage gap: the per-leg frozen shape pins state/`seq` types/trusted/act/files/opened, but not activation transitions, CDP send/event payloads, marks, answer send ids, showPicker return values, or event timing fields.
5. **replay-event-timeline**: the battery's forgery is an exact prior copy (121/121 matched events), so it still refuses when `FRAC` is raised to 0.9, when the refusal comparison is made strict (`>`), or when `absNeed` is raised by one. Aimed forgeries at 71/121 and 61/121 matched events escape all three mutants while the pristine counter refuses: `r-frac-tighten`, `r-strict-compare`, `r-need-plus-one`. These are measured battery-coverage boundaries; the frozen limit/refusal predicate was attacked locally in scratch, not amended or proposed for amendment.

## Shadowed survivors (21) and their compensating checks
| mutant | weakened conjunct | compensating check(s) observed |
|---|---|---|
| `b-aa-readcount-drop` | accept-answer-law: stops requiring exactly one page read | `leg-sp84-accept-answer` |
| `b-aa-state-drop` | accept-answer-law: stops pinning the delivered k-input state | `leg-sp84-accept-answer`, `no-selection-law` |
| `c-drop-act-before` | same-origin-color-law: stops pinning the pre-call activation state | `activation-law` |
| `c-drop-cos-empty` | same-origin-color-law: stops requiring the colour input state to stay empty | `leg-sp86-same-origin-color-activated`, `no-selection-law` |
| `c-drop-ret` | same-origin-color-law: stops requiring showPicker() to return the string "undefined" | `gesture-law` |
| `c-ok-substitute` | same-origin-color-law: accepts a missing/undefined ok flag (only rejects explicit false) | `gesture-law` |
| `c-ret-substitute` | same-origin-color-law: accepts any string return value instead of "undefined" | `gesture-law` |
| `d-drop-descriptor` | mode-law: stops requiring the page-measured descriptor to exist before choosing the expected mode | `fixture-descriptors` |
| `d-first-open-only` | mode-law: checks only the first chooser event of a leg, not every open | `leg-sp84-second-chooser-answer` |
| `d-multiple-nullable` | mode-law: treats a missing `multiple` attribute as multiple instead of single | `fixture-descriptors` |
| `d-skip-new-targets` | mode-law: exempts the three r86 accept-grammar inputs (aw/am/ap) from the mode check | `leg-sp86-accept-wildcard-text` |
| `e-click-tautology` | intercept-law: makes the expected opened count for the click-while-open/second-chooser legs equal to whatever was observed | `leg-sp84-click-while-open`, `click-while-open-law` |
| `e-nopicker-tautology` | intercept-law: makes the expected opened count for NO_PICKER legs equal to whatever was observed | `plan-calls`, `leg-sp85-same-origin-tel-activated`, `same-origin-no-picker-law` |
| `e-skip-new-legs` | intercept-law: exempts the five r86 accept-grammar legs from the opened-count check | `plan-calls`, `leg-sp86-accept-wildcard-png` |
| `f-search-count-drop` | sp84-cross-origin-search-law: stops requiring exactly five child events on the search leg | `sp84-cross-origin-search-law` |
| `f-search-zeroopen-skip` | sp84-cross-origin-search-law: stops requiring zero Page.fileChooserOpened events on the search leg | `plan-calls`, `leg-sp84-cross-origin-search`, `intercept-law` |
| `f-text-count-drop` | sp84-cross-origin-text-law: stops requiring exactly five child events on the text leg | `sp84-cross-origin-text-law` |
| `g-drop-paramslength` | accept-grammar-law: stops requiring exactly one file in the delivered file list | `plan-calls` |
| `g-drop-readcount` | accept-grammar-law: stops requiring exactly one page read of the delivered bytes | `leg-sp86-accept-wildcard-text` |
| `g-state-narrow` | accept-grammar-law: skips the delivered-state check on the two wildcard image/* (aw) rows, leaving the mixed and PDF rows pinned | `leg-sp86-accept-mixed-png`, `accept-grammar-law`, `no-selection-law` |
| `h-trust-skip` | trust-law: lets page events targeted at the new inputs (aw/am/ap/cos) be untrusted | `leg-sp86-accept-wildcard-png` |

The mode-law and intercept-law probes on the new legs (`d-skip-new-targets`, `e-skip-new-legs`, `d-drop-descriptor`, `d-first-open-only`, `d-multiple-nullable`, `e-click-tautology`, `e-nopicker-tautology`) all survive the battery but are shadowed by `fixture-descriptors`, the per-leg frozen shapes, `click-while-open-law`, or `same-origin-no-picker-law`; no whole-counter escape was found. The five colour-law survivors are all shadowed by `gesture-law` (return/ok), `activation-law` (before-state), `no-selection-law` + `leg-sp86-same-origin-color-activated` (state), i.e. the colour law is redundant under the current counter. Two count probes on search/text are shadowed by the same law's own sequence conjunct.
## Restoration / bounds evidence
- Lane counter and battery hashes re-read after all runs: `a41fab46…` and `b7ddaf7b…` (unchanged; match freeze.txt). No lane file was written. The fixture receipt remained `035ac3f0…`. A final pristine battery re-run after every mutant/witness probe returned exit 0, 201 cases, 0 failed, coverage 95/95 (declared 95 / covered 95 / uncovered 0).
- All mutants lived under `/fast/scratch/hyaku/tabi-r86/R86Mut1/`; every battery copy there was verified byte-identical to the frozen battery. The scratch tree (including witness receipts and `mutant-manifest.json`) was removed before this seat yielded; no scratch is left behind.
- No `pacman`, no host service/sysctl changes, no fleet-repo writes, no git/jj mutations, no subagents. No tool installs were needed.

## Mutant hashes (scratch manifest, for audit)
```
5ccab593970b1bdbdfe4156b12c47779e57ddae3e33771cbfb55bfc78b16297d  b-aa-answerfiles-drop
522b4f31c301ccc55b12aea518b8e0d9ec9f5bfe238c50bb52c0fa10469189d6  b-aa-backendnode
1bd626ed0cf1e28bf261315c5b159b91407704a10974e8c0d4bdf9d863aea5d3  b-aa-readcount-drop
7ad4ad049352b4260209319cb3bc176da786f9e4906aa963cb6e86b449e83141  b-aa-setresult-drop
6e87815424b19768cd103affc18877109567b97a8b96d598710c52bae59248c7  b-aa-sha-drop
a8ae1c4e32e6d42b2f5d0a69dc464cf8883c1ca009c5282ff5a47b7029ed3200  b-aa-state-drop
051fc86534fe9cfce0554ea48452cdfc24a2ae379a647f3ae340d8c26e0182c6  b-am-backendnode
97691560d1d34199c74cd315614e9346792d0fccab04034f58fd6a339417e11c  b-am-hex-drop
fb2b5fdc4ca17e2279f6f334a2807e8d9fa3efc0985edcd0f05f2e1738462164  c-act-after-narrow
f9c94b8be275febeaa0c7ad072096ac34cab3182446731195d82fdf2b50f9201  c-drop-act-before
78da0b2508b39a9cb8b14f477c7f4578c0c2ef1e55c4d2a5890dc0ce0f73a3f1  c-drop-cos-empty
371e63925203a3aea94ecfb98b650dbe9bc716fe0c608a14274ebcaa0d11f89e  c-drop-inputchange
66f172d21f9c436fd6b22f2d8eca4368a6e8accf086ba1e5f7bd77b108b82747  c-drop-opened
a66d28059d6f8e603ce50d86b992befe791d9789e3548cb5db6aaee09335169b  c-drop-ret
d2bf9f0f790dbe5e6ea413767f12a94210ac26fab6dcd59058964f3a396b4e01  c-ok-substitute
d863d364c6a9a97c070e1c27fb894d9837bcb1c159ae5d9433394894604c157e  c-ret-substitute
5b983471884d10131f8a53e54a171861f79f022b7fa8255c12759d44ee90d37f  d-drop-descriptor
cd7218ad5647b8589d496611ca08d564d534ba6b76c647bddf014e45818bf826  d-first-open-only
38617c5825a2838950e2515b3a9816f9736f676b9c3c592248450aa30e300c1b  d-multiple-nullable
5e899edcdb3960311cb075e6e2955842ab60ce2d5dda1b4efb37da166d4b0561  d-skip-new-targets
0b9002f73005573db8b94f6fbddb39b4f06e9f926729c1be979ffef4ae8b20d7  e-click-tautology
39fb1e89f32730fd0a5ebe305295c47c08c8c62781f314bc8306fe68e82d258b  e-nopicker-tautology
7aa0e6c997205e4a08af16fe3b158ce3a3cae3d09adf53e286db8ea38c7114c0  e-skip-cross
aa175960941603b373921331674e2062fca5b4846b461117ce960a1d5751f5a6  e-skip-new-legs
624b6b054775c22d4a9105f440345862087485a53a60da8e133df5a96295aea5  f-result-message-only
81f9e0d9383b10ba77720529cf1278cd77ec3ac6838eac6a255bd1431ec79620  f-search-childseq-drop
4e50bea2856fea17b674cef3e5aea103b2c10e26e123aa1ff79f88146b5f584f  f-search-count-drop
1059e2e96ccf20e43859abd4e2924424d3518ec160ce05e7d74e117ceb7c1dcc  f-search-trust-drop
0a49758462c62a9285fc047e258ea8c931e5ad8a09f9b262dd4f22f154d3bfae  f-search-zeroopen-skip
2abdc10ea707b100dfd01efe1c17c03a57868272cbd6b70d80154a9fe496f71f  f-text-act-drop
fb8ce900809357de586fa9acb8ebab6f40f2a02f506aea5512bbffb61e565aeb  f-text-actbefore-drop
d283d47cf50662bbd4296c3ad7d67a971fd0e41474edeba7bcfdefd2d20be818  f-text-count-drop
496e85f6333d03845743a1a4b1fe6b00c8e9be5725fdc84a1f58511c35834745  g-bytes-drop
0e8177eec60f17783b41f763110f8e1b9a8c43e9066e72abb9ef11c77b732a3d  g-bytes-narrow
c355a764ad95ad692f28234bc1541cde0aa5e0f3e9a53371d9ef9d5c3c5d53f7  g-drop-answer-files
93ee5c0f7558d2b1900e33ba1c527cbbaea5cc171a0c76167672420472606c50  g-drop-backendnode
39cf7a0fe3a491b6df9fae4fa605bfb893984b6aa76fbe63997a0c397a59a3f7  g-drop-paramslength
bc53303558a4c9f197bbbb915bb3182ebb69122bf48e380eb768be1d70adba03  g-drop-readcount
8a4dc9f40296308be0e37c86a3785afd539d598304c8e01bfe0c8aa47931429d  g-drop-seterror
3eafe0e0b5d8b65cda22a5d1cb9682e8bb5f28563b5da13c640d8f3bf8885e29  g-fixture-accept-unpinned
b6b55e6505e5d76e6fd6c71290b6cb12e6aa9e12e784e1a57f19f8e6f938f41d  g-setresult-substitute
1e9fdcab7a52894bb77afaba44d653d4661c03fa1d4c8406b609935b740a7380  g-state-drop
69aa098d2d6604e154d1de56435d3e7d013fef03370838939c2e46a26815dffd  g-state-narrow
a7af2f1c14471199a6ecf256ab0fbbf2d707483eeb73bf379b42b9ecf6ebfd46  g-token-drop-am
3eb2cc4062c7fe2b4ed7d140149ab2d0368f88c5e3d911b011c63c9e4a8c13fb  g-token-drop-ap
0990c267e27a5b76585d6a2da0b5b8caba66b37b8cbf4c972210379ec2ffb6f4  g-token-nullable
01c2b87b7ae943ab5ad8e7665e4f79cbfdac02f62a05a7ee59937932ab885457  h-activation-skip
c9077df4bbc23018e99be9bca064d47948289cc095d0958d6670fc30ecb62035  h-cdp-event-skip
0919d0d32f7e98d97955771dc01c4b18d7d0302e6af0a364a9a67a18b31b5eb4  h-eventtypes-skip
d18a28560c37f2e3225e20580e6edc5e37cf8351c33d486fd63954e804f539b2  h-eventwindow-skip
69a6645a00d6b45f31597a82bdbd1d422960129ad2abd9e910e166054a2b93ac  h-gesture-skip
4a8e65d6623bbf8a4409e648f63dc2fd80dbc7888568bbd2b7b52fabc40a5ba1  h-legmarks-skip
404f4f28fad3d68cb96e6e70f5f3a5e447122fc7867fce640ccfb63ca238d2b5  h-legrecords-skip
f0e260b9fe0cca288d4ffc7f8965e1e07bf83cf22b663859a2ccd1430ca0db2a  h-noselection-skip
410f2bd620ddaf08e73f5f2218e4430ce10267945e16e7187e9be531f4f5215b  h-plan-calls-skip
6fff034f671d51856af9672e899f5121548657f13e4aab236f8a115cee69c0b8  h-quantum-skip
a43ee2e11898376623c2b6db8db723babfb9f3715b5cbf9dda815f9767798ab8  h-sendlog-skip
45d3c0e829363b03b17b2ef471ebccdac71ee0734818125ede8a3f168080e0ef  h-seq-skip
538bbb6dbc983cb10e5ead4c68e7da6e2d2cb99c6cd0213358cb868b6ee4f39d  h-trust-skip
83e7648035f2b01660abaa65268046e3ccc918ee062b15f4442835e92e4a60c0  r-frac-tighten
1384804b79c65db522267eaa0f856f65769380224361ddeaf2f4ec7a5173f4e6  r-need-plus-one
86f1e3c3f779ab56ddb07ae2e17cf520684c8237eb3091b6213f036aa5ac0555  r-strict-compare
```
