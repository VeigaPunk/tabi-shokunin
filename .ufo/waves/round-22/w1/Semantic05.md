# Semantic05 — adversarial semantic review of `na-reset` (round 22, W1)

Scope: `na-reset` only. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; paths are lane-relative.
Read-only. No oracle, selftest, build, lint, browser, network, REA, install, or edit was run. `sha256sum` was used for digests only. Sibling clones: directory listings only.

Target: the proposed oracle as specified in the assignment (`measure-c1.mjs` with `evaluate(files)` and `INPUT_PATHS`; `corpus/evidence/round-22/semantic-expectations.json`; findings `semantic_status`, `semantic_output`, `semantic_error`, `semantic_timing`, `semantic_navigation`, `semantic_delayed`, `evidence_binding`, `case_set`, `source_binding`, `input_shape`, `revision_input`). Neither file exists at lane paths yet, so predicates are assessed as the proposal implies them.

Definitions: **FP-accept** = oracle credits an outcome the evidence does not support. **FN-reject** = oracle fails or refuses to credit an outcome the evidence supports.

## 1. Verdict

1. The raw and receipt support the proposed `na-reset` expectation: `Canceled`, errorText `Tool execution cancelled by a form reset`, no output, no submit, no navigation, not delayed, one correlated terminal. No contradiction found among trail, receipt case, author witness row, corrected note row, producer, fixture, and retained S100 body.
2. The finding list states no predicates. Naive implementations of it (status-only, substring errorText, summary-keyed windows, key-presence nonce, mode-keyed status) accept mutations R1–R6, R8, R13, R14 and reject the valid row under R7, R9, R10, R17, R18. Required predicates are in §4.
3. No proposed finding checks the reset's own DOM effect (R15). The metric would credit `na-reset` for semantics the oracle did not test.

## 2. Accepted outcome derived from raw and receipt only

Primary sources: `corpus/evidence/round-21/runtime/na-reset.json` (frames seq 1–16, `pageObservations`) and `corpus/evidence/round-21/runtime/receipt.json` case `na-reset`. The witness was not used for any value.

| Facet | Derived value | Source |
|---|---|---|
| Case | `na-reset`; autosubmit false; action `reset`; mode `success`; nonce `658f0668-98cc-4edb-89c2-a170fec93f00` | na-reset.json:2–7; na-reset.html:5 |
| Invoke | seq 9 `WebMCP.invokeTool`, `input.q` = nonce; seq 10 result; seq 11 `toolInvoked` | trail seq 9–11 |
| Invocation | `B8BA3C97850919D25D5C04338D497F26` in seq 10, 11, 15; receipt; witness | trail; receipt |
| Pre-window | seq 12 observation at `1792590711116`, 252 ms after invoke (`…710864`); `responseCount` 0; `formActive` true; `value` = nonce; `submits` []; `errors` [] | trail seq 12; receipt `preAction` |
| Action | seq 13 `action reset dispatch-started` (`…711116`); seq 14 `action-complete` (`…711117`) | trail seq 13–14; producer:216, :220–222 |
| Terminal | exactly one `WebMCP.toolResponded`: seq 15, `…711117`, params `{invocationId, status:"Canceled", errorText:"Tool execution cancelled by a form reset"}`; **no `output` key** | trail seq 15 (only toolResponded in file) |
| Post-window | seq 16 observation at `…711619`, 503 ms after action; `formActive` false; `value` `""`; url unchanged; `submits` []; `errors` []. Equal to receipt `after.pageState` | trail seq 16; receipt case |
| Submit | none: page counter `submits` [] at seq 12 and 16. The trail records only WebMCP and `Page.frameNavigated` events (producer:180), so DOM submit events are not in the trail | trail; producer:180 |
| Navigation | only `Page.frameNavigated` is seq 3 (initial load, before invoke). Server log: `GET /na-reset` at 710852; next request `GET /na-remove` at 711786; no `/landing` request in [710852, 711619] | trail; `receipt.json` `requests` time-window query |
| Delay | no `release` frame; no `delayed-before-release` marker | trail frame kinds |
| Cleanup | browserPids before 9, at close 9, after 0, seen after close 0; `contextClosed` true; `blocked` []; `downloads` [] | na-reset.json top level |
| Timing | response 1 ms after `action-complete`; both at `…711117`, so order must come from seq, not `at`; 253 ms after invoke | trail seq 14–15 |

**Fixed expectation:** status `Canceled`; errorText exactly `Tool execution cancelled by a form reset`; `output` key absent; 0 submits; 0 navigations; not delayed; exactly one terminal for `B8BA…`; pre-window 0 responses; action `reset`. Mode `success` is irrelevant to this row.

**Source corroboration (outside registered anchors):** `.ufo/waves/round-21/sources/html_form_element.cc`
- `reset()` at `:1077–1110`. A cancelable `reset` event returns early on preventDefault (`:1084–1088`; the fixture has no reset listener, `na-reset.html:5–16`). Controls reset (`:1092–1099`). Then `if (active_webmcp_tool_)` calls `CallDoneCallback` with kToolCancelled and text `Tool execution cancelled by a form reset` (`:1101–1104`).
- The exact errorText appears intact only at `:1104`. The CDP literal `Canceled` does not appear in the retained body; `Cancel` matches are `kNotCanceled` at `:776` and `:1085`.
- Registered anchors `174–328` and `635–842` (corrected note:1) exclude `:1077–1110`.

## 3. Bindings checked (sha256 computed; all match)

| Artifact | sha256 | Cross-checks |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-reset.json` | `097b8833…c1` | receipt `:292–293`; finalized `:30`; witness `:245` |
| `corpus/evidence/round-21/runtime/na-reset.html` | `67eca08e…55` | na-reset.json `fixture.sha256`; finalized `:31` |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636…34` | finalized `:21`, `:47`; `final/serial-checks.json:636` |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d6…811` | receipt `producer.sha256`; finalized `:13`; `final/serial-checks.json:635` |
| `.ufo/waves/round-21/sources/html_form_element.cc` | `8c8d6796…916` | corrected note:16–17 decoded hash; `final/serial-checks.json:641` |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c…fe4` | `final/serial-checks.json:644` |

Also matching: nonce identical in raw, receipt, and fixture; invocationId identical in frames 10, 11, 15, receipt, and witness; witness windows 252/503 and markers 12/13/14/16. The only weak witness field is `postNoncePresent` (R16). The producer stdout `LIFECYCLE_OBSERVED na-reset pre=0 statuses=Canceled` (finalized:17) is status-only.

## 4. Risks

Mutations are predicted, not executed. Coherence rule for each: edit the trail frame(s), the matching `pageObservations` entry, and the receipt case together; keep `seq === index+1` and non-decreasing `at` (`measure-c1.mjs:118`); re-hash `na-reset.json` into receipt `:292–293` and finalized `:30`; re-hash `receipt.json` into finalized `:21` and `:47`.

"Old" means the frozen round-21 counter `.ufo/waves/round-21/measure-c1.mjs`, checks at `:104–141`. Grep finds no reference to `errorText`, `Canceled`, or `output` anywhere in that file. It does check window floors (`:138`), summary equality (`:139`), page echo (`:137`), case identity (`:112`), and digest pins (`:108`).

### Status and error

**R1 — FP-accept: errorText not bound to the action.** M1: set frame 15 `errorText` and the receipt response `errorText` to `Tool execution cancelled, since tool definition was updated` (removal text). Status stays Canceled.
- Predicted: `semantic_error` fails only with per-case exact match.
- Old: admits (no errorText predicate; `:139` mirrors responses).
- Naive substring or source-presence binding also admits, because the removal text is intact at `S100:451` (split at `:393–394`).
- Fix: expected errorText keyed by case id, exact equality.

**R2 — FP-accept: source-string membership is not case semantics.** M2: errorText → `Tool execution cancelled by abort signal`, intact at `S100:228` (inside registered anchors).
- Predicted: `semantic_error` fails (abort is not reset); `source_binding` must not pass on string presence.
- Old: admits.
- Fix: `source_binding` cites the reset path (`S100:1084–1104`) per case, not any S100 string.

**R3 — FP-accept: status-only check.** M3: status → `Completed`, errorText kept (incoherent).
- Predicted: `semantic_status` and `semantic_error` fail.
- Old: admits (no status predicate). Producer stdout `statuses=Canceled` (finalized:17) is status-only and cannot separate reset from remove.

**R4 — FP-accept: silent or mis-correlated terminal.** M4a: delete frame 15, renumber 16→15, receipt `after.responses = []`. M4b: keep frame 15 but set its invocationId to another case's (e.g. na-remove's `622C2C1C9C93235581AB3F8C14A14EC5`) and mirror it in the receipt.
- Predicted: `semantic_status` fails (no terminal correlated to `B8BA…`; Canceled expected). SKILL.md:2418 lists "Silent reset/rejection" as rejected evidence.
- Old: admits both (`:126` checks only responses before invoke; `:139` mirrors).

**R5 — FP-accept: duplicate terminal.** M5: add a second `toolResponded` for `B8BA…` (e.g. Completed with output) at seq 16; post moves to 17; mirror in receipt.
- Predicted: `semantic_status` fails under exactly-one-terminal-in-file, the rule Raw07.md:156–157 states for na-reject.
- Old: admits (no count predicate). An implementation that reads `responses[0]` also admits.

### Output

**R6 — FP-accept: output added to Canceled.** M6: add `"output": {"ok":true,"nonce":"658f0668-98cc-4edb-89c2-a170fec93f00","q":"658f0668-98cc-4edb-89c2-a170fec93f00"}` to frame 15 params and the receipt response.
- Predicted: `semantic_output` fails (Canceled carries no output; page counter shows 0 submits).
- Old: admits (no output predicate).

**R7 — FN-reject: null versus absent.** Valid frame 15 params are `{invocationId, status, errorText}` with no `output` key. A check of `output === null` rejects the valid row.
- Fix: `Object.hasOwn(params, "output") === false`. Raw07.md:134–137 uses the same rule for Error.

### Timing

**R8 — FP-accept: summary windows are not seq-anchored.** The producer defines `after.responses` as all responses with `seq < post.seq` (producer:226), and `preAction.responseCount` as `seq < pre.seq` (`:209–210`). M8: move frame 15 before the pre observation (rotate to index 12; renumber 12–15); set its `at` to `…711116` so `at` stays monotone; set receipt `preAction.responseCount` to 1.
- Predicted: `semantic_timing` fails (terminal before dispatch; pre-window non-empty); `semantic_status` fails.
- Old: admits (`:136` order chain does not include toolResponded; `:139` mirrors).
- An at-only window check (`action.at ≤ responded.at ≤ post.at`) also admits, because `…711116` lies in the inclusive window.
- Fix: seq-based. `dispatch.seq (13) < responded.seq < post.seq (16)`; pre-window responses must be 0.

**R9 — FN-reject: strict `at` ordering.** In the valid trail, `action-complete` (seq 14) and `toolResponded` (seq 15) share `1792590711117`. A strict `at(responded) > at(complete)` rejects the valid row. Old `:118` requires only non-decreasing `at`.

**R10 — FN-reject: `complete.seq ≤ responded.seq` over-constrains.** `.ufo/waves/round-22/w1/Raw07.md:151` requires `complete.seq <= responded.seq`. The producer records CDP events through an independent listener (producer:180) and records `action-complete` only after awaiting the evaluate promise (`:221–222`). No barrier orders the two streams, so the observed order (14 then 15) is one observation, not a guarantee [INFERENCE from code]. The sound invariant is `dispatch-started (13) < responded`: that frame is recorded synchronously at `:220`, with no await before it, so no CDP event can be recorded earlier [INFERENCE from single-threaded recording].
- Positive control (not run): swap seq 14 and 15 with `at` unchanged. Should pass under the sound invariant; fails under Raw07.md:151. Old admits (`:136` requires only `completed.seq < post.seq`).

**R11 — Limit: floors are not outcome evidence.** `pre.windowMs ≥ 250` and `after.windowMs ≥ 500` are producer sleeps (producer:207, :224). na-reset's 252 and 503 satisfy them by construction. The producer defines no ceiling; a ceiling would be invented and must not be added.

**R12 — Limit: finite trail.** The trail ends at seq 16. The case JSON is saved after `closeOwnedContext` (producer:230–233), and the saved file holds no frame recorded during close. "No terminal" is claimable only within the recorded trail, not "never".

### Navigation, page state, and binding

**R13 — FP-accept: summary navigation filter.** `after.navigations` keeps only `Page.frameNavigated` with `at ≥ actionAt` (producer:226). M13: insert a `Page.frameNavigated` (url `http://127.0.0.1:43143/na-reset`) between seq 11 and 12 with `at` `…710990` (between invoke and dispatch). Summary stays `[]`.
- Predicted: `semantic_navigation` fails if it scans frames by seq between invoke and post.
- Old: admits (`:139` uses the same `at` filter).

**R14 — FP-accept: no server-log cross-check.** M14: add a `Page.frameNavigated` to `/landing?q=658f0668-…` after dispatch and mirror it in receipt `navigations`; leave `receipt.requests` unchanged.
- Predicted: `semantic_navigation` or `evidence_binding` should fail on the mismatch with the request log (no `/landing` in [710852, 711619]).
- Old: admits (no request-log check).

**R15 — FP-accept: gap, no reset-effect predicate.** M15: set frame 16 `value` to the nonce and `formActive` to true (also `pageObservations` and receipt `after.pageState`). Keep Canceled and errorText.
- Predicted: no proposed finding fails.
- Old: admits (`:137` checks post nonce only, not post `value`; `:139` mirrors).
- Basis: `reset()` clears controls (`S100:1092–1099`, outside anchors), so the reset-specific expectation is `value === ""`. `CallDoneCallback` clears running state and notifies pseudo-state (`S100:261–275`, inside anchors), so `formActive === false` follows any terminal callback. That part is generic to Canceled, not reset-specific.
- Fix: add a reset-effect predicate, or scope Values12 so `na-reset` is not credited for DOM effect.

**R16 — Weak check in witness.** `.ufo/waves/round-21/final/semantic-witness-command.json:5` computes `postNoncePresent` as `'nonce' in post['value']` (key presence). Witness `:285` shows true. The key exists on every fixture page because `observe()` spreads `window.observations` (producer:189); the landing page lacks it (witness `:232`, false). It does not test value equality or DOM echo. Keep the witness out of the oracle's `INPUT_PATHS`. Old `:137` equality is stronger.

**R17 — FN-reject: mode-keyed status.** na-reset `mode` is `success` (na-reset.json:7; producer:19). A status table keyed on mode predicts Completed and rejects the valid row. Raw07.md:73–74 derives status from the declared mode table; that template fails here. Fix: key status by action (reset or remove → Canceled).

**R18 — FN-reject: registered-anchor-only source binding.** Reset text and path lie outside registered anchors (`S100:1077–1110`). Requiring anchor coverage would reject the valid row. Corrected note:20–21 and row :36, and SKILL.md:2383, already classify reset as observation-only. Expectation text should say so, not claim anchor support.

**R19 — Scope over-claim: unencoded preconditions.** The reset path has no `IsHandlingSubmit()` guard (`S100:1101–1105`), unlike removal (`S100:390`, `:448`). A reset during a held respondWith would plausibly also cancel [INFERENCE; no such row exists]. na-reset is valid because page-counter submits are [] at seq 12 and 16, and the fixture has no reset listener (`na-reset.html:5–16`). Encode these preconditions. SKILL.md:2375 already says "do not generalize to every DOM mutation".

**R20 — FP-accept if the header check is weakened: superseded note.** `corpus/knowledge/webmcp-nonautosubmit-round-21.md:1` also begins `source: S101` and repeats the na-reset row (`:36`). It has no S100 URL token, which `measure-c1.mjs:100` requires; the corrected note carries it (corrected:1). A first-line-only check would admit the superseded note. Keep `measure-c1.mjs:27` and `:99–100`.

**R21 — FP-accept: mirrored summaries and pins.** The producer derives `after.*` and `preAction.*` from frames (producer:209–210, :226), and the receipt mirrors them. SKILL.md:2417 says to apply predicates "independently of mirrored summaries". A coherent raw+receipt edit passes any check that reads only the receipt. Hash pins are independent only if `.ufo/waves/round-21/runtime-execution-finalized.json` is in `INPUT_PATHS` (`measure-c1.mjs:28` already names it).

## 5. Coverage of the proposed findings

| Finding | Covers | Gap |
|---|---|---|
| `semantic_status` | R3, R4, R5 | must key on action (R17); exactly-one terminal (R5) |
| `semantic_output` | R6 | key absent, not null (R7) |
| `semantic_error` | R1, R2 | exact per-case text; not substring; not source presence |
| `semantic_timing` | R8, R9 | seq-based; not `complete ≤ responded` (R10); no ceiling (R11) |
| `semantic_navigation` | R13, R14 | scan frames by seq; cross-check request log |
| `semantic_delayed` | not applicable | no release frame; no delay inferred from pre-window |
| `evidence_binding` | R21 | finalized pins in `INPUT_PATHS`; page echo nonce (`measure-c1.mjs:114`, `:137`) |
| `source_binding` | R2, R18 | case-specific; out-of-anchor allowed and labelled |
| `case_set`, `input_shape`, `revision_input` | input `q` = nonce matches the tool schema (trail seq 5, 9) | none for this row |
| **none** | R15 | add reset-effect predicate |

## 6. Checks performed and not performed

Performed (read-only):
- Frames 1–16 and `pageObservations` of `na-reset.json`; receipt case, `producer`, `cleanup`, `caseIds`; `requests` time-window query; receipt-versus-trail response query.
- `sha256sum` of six artifacts (§3).
- Full `na-reset.html`.
- Producer `:19`, `:176–262`.
- Retained S100 body `:224–229`, `:254–283`, `:372–463`, `:1045–1117`; greps for `Canceled` and cancel and reset strings.
- `measure-c1.mjs:25–29`, `:92–141`, and grep for predicates.
- Witness `final/semantic-contrast-witness.json:241–293`; `final/semantic-witness-command.json:5`.
- Corrected and superseded notes, `:1–3`, `:14–21`, `:36`, `:103–104`.
- SKILL.md `:2375`, `:2383`, `:2417–2427`.
- `Raw07.md:148–157`; `round21-closure.json:48`, `:57`.

Not performed: no oracle run, selftest, build, lint, or test; no mutation applied; no browser, CDP, network, or REA; no edits, commits, or installs. Tooling directive: nothing installed or updated.

Limits: [INFERENCE] tags mark R10 (event ordering), R19 (cancel while submit pending), and R12 (post-trail silence). No source-to-binary equivalence is claimed (corrected note:14–17). Diagnostic wording is build-scoped (SKILL.md:2427). The proposed `measure-c1.mjs` and `semantic-expectations.json` were not present at lane paths, so this review applies to the API as specified in the assignment.
