# AttackInputTypes: null, object, array, and missing fields against the round-22 oracle and debt designs

Read-only attack seat. No tests, builds, linters, smokes, browser, network, or lane writes except this report. Line numbers refer to the snapshot tags below. The drafts were read from the clone working trees; their committed blobs were not verified, so re-check the tags before the parent imports.

## Snapshots read (paths relative to lane root)

| Short | Path | Tag |
|---|---|---|
| ORACLE | `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves/round-22/measure-c1.mjs` | AEE4 (536 lines) |
| ORACLE-EXP | `.ufo/waves/round-22/clones/BuildOracle/corpus/evidence/round-22/semantic-expectations.json` | 011D |
| DEBT | `.ufo/waves/round-22/clones/BuildDebt/.ufo/waves/round-22/check-review-chronology.mjs` | 94A7 (364 lines; first read 66A3; only change is the comment at :220) |
| DEBT-EXP | `.ufo/waves/round-22/clones/BuildDebt/.ufo/waves/round-22/debt-expectations.json` | 5ACC |
| SELFTEST | `.ufo/waves/round-22/clones/BuildSelftest/.ufo/waves/round-22/selftest-c1.mjs` | 73FC (harness only) |
| FROZEN | `.ufo/waves/round-21/measure-c1.mjs` (92BB), `.ufo/waves/round-21/fixtures/expected.json`, `.ufo/waves/round-21/selftest-c1.mjs` | frozen |
| RETAINED | `corpus/evidence/round-21/runtime/receipt.json`, `na-*.json`, `auto-*.json`; `.ufo/waves/round-21/w1-returns.json`, `w2-returns.json`, `w1-failures.json`, `w2-failures.json`, `.ufo/waves/round-21/w2/CounterErrors.md`; `.ufo/waves/round-22/w1/swarm-registry.json`; `.ufo/waves/round-22/round21-closure.json` | retained |

## Axes

- A1: present-but-wrong-type input never throws.
- A2: malformed or missing required input never yields `baseline` or `clean`.
- A3: type faults surface as typed `input_shape`, not as semantic or binding findings.
- A4: retained 12 cases and retained W1/W2 shapes stay accepted or classified correctly.

## Verdict

- No throw found by static trace in ORACLE or DEBT for JSON-typed values. FROZEN `get` (`.ufo/waves/round-21/measure-c1.mjs:58`) does throw. ORACLE replaced it with a non-throwing `bytesOf` (ORACLE :47-51), but that maps null, number, object, and array to "absent". That mapping is the baseline counterexample O-2.
- Silent clean or baseline: ORACLE O-1, O-2, O-3, O-4 (value-neutral, see O-4). DEBT D-1, D-2, D-3, D-5. Highest: O-1 (row-local refusals never reach the verdict).
- Exit-class split: ORACLE maps `input_shape` to exit 1 (:474). DEBT maps it to exit 2 (:214-215, :229). The lane's refusal convention is exit 2 (O-7a).

## Decisions for the lead

1. Refusal class. Recommend `input_shape` and `revision_input` → exit 2 (could-not-evaluate), value 0, in both designs. `semantic_*`, `evidence_binding`, `source_binding`, `case_set` → exit 1. Partial new pair (expectations xor note) stays exit 1, as the spec states.
2. Retained-input absence (receipt, raw, fixtures, producer, execution) → `input_shape`, exit 2. ORACLE currently uses `evidence_binding` at :398.
3. Partial-state id. The export list has no `partial_state`; ORACLE uses `source_binding` at :374-375.
4. FROZEN rows in O-8 must not be copied as round-22 expectations.
5. Upper-bound clock role must not produce `matched` (D-3).
6. Empty `event_history: []` → `event_history_unavailable` (D-2).
7. Value 0 whenever exit ≠ 0 (O-7b).
8. Closed reason vocabulary for `input_shape` (null, object, array, missing, coerced, duplicate-key), following the lane's closed-vocabulary pattern (`scripts/check-measurement-binding.mjs:128-131` FAILURE_REASON).

## Index

| ID | Sev | Where | Counterexample (short) | Expected |
|---|---|---|---|---|
| O-1 | HIGH | ORACLE :146-149, :150-151, :162, :460-476 | malformed case row → exit 0, value 11, clean | global `input_shape`, value 0 |
| O-2 | HIGH | ORACLE :367-373, :47-51 | `evaluate(null)`; present null/object/number → baseline | `input_shape`, value 0, exit 2 |
| O-3 | HIGH | ORACLE :373 before :398 | receipt removed, raw present, new pair absent → baseline (CLI) | `input_shape` `acquisition-input-missing`, exit 2 |
| O-4 | MED | ORACLE :431-437 | `startedAt` as one-element array accepted | `input_shape`, exit 2 |
| O-5 | MED | ORACLE :160, :167-174, :261-269, :272, :340-341, :433-440 | type faults reported as semantic/binding | `input_shape`, exit 2 |
| O-6 | LATENT | ORACLE :94-100, :262, :266, :328-329, :22, :379-380 | expectation inner fields unvalidated; masked by pin | `input_shape` schema, exit 2 |
| O-7 | MED | ORACLE :378-389, :470-476, :526-529 | exit class, value on failure, misleading CLI label | exit 2, value 0, closed ids |
| O-8 | MED | FROZEN fixtures/expected.json; FROZEN selftest :62-68 | frozen rows assert exit 1 for null/missing | re-express as `input_shape` exit 2 |
| D-1 | HIGH | DEBT :122-123, :146-149 | missing actor/route → clean | `event_history_unavailable`, exit 2 |
| D-2 | HIGH | DEBT :113-117, :165-168, :269-272 | `event_history: []` → clean | `event_history_unavailable`, exit 2 |
| D-3 | HIGH (soundness) | DEBT :220-224, :270-272; DEBT-EXP row `exact_pre_review_artifact_positive` | upper-bound clock → `matched` | not `matched` |
| D-4 | MED | DEBT :277, :186-187 | object clock echoed into output | `null` or parsed string only |
| D-5 | MED | DEBT :296 | duplicate key, last wins | `input_shape` duplicate-key, exit 2 |
| D-6 | — | DEBT :214-215, :229 vs ORACLE :474 | exit-class conflict | unify (decision 1) |
| D-7 | LATENT | DEBT :339-340; SELFTEST :409-411, :418-419 | `?? null` makes missing equal null | `undefined` fails |
| D-8 | LOW | DEBT :81-92 | missing and malformed both collapse to null | typed, acceptable; record |

## Oracle findings (ORACLE, AEE4)

### O-1 HIGH: row-local refusals never reach the verdict (silent clean)

- Code: `unavailable()` (:146-149) writes only to the row's `local`. The early returns at :150-151 and :162 skip the push at :346. `evaluate` (:460-465) never copies `row.findings` into `findings`. Exit and verdict read only global `findings` (:474-475). `value` counts every non-blocked semantic match (:470-472).
- Counterexample (static trace, not executed). On the retained acquisition, make one case malformed and re-link digests as the spec's tests do: receipt `evidence.sha256`, execution `artifacts`, and `receiptSha256`. Any one of these, applied to `na-pending`: the raw file is JSON `null`; `raw.frames` is `{}`; `raw.frames[0]` is `null`; `receipt.cases[0].nonce` is deleted or under 16 characters. Result: `findings: []`, `exit: 0`, `value: 11`, `verdict: 'clean'`. The input_shape exists only in `rows[0].findings`.
- Stable expectation: global `input_shape`, detail `na-pending:case-evidence-shape` or `na-pending:nonce`; value 0; exit 2 (decision 1); never clean or baseline.
- Bounded preserving positive: unmodified retained acquisition still counts all 12. Also `na-native-submit` (`receipt.json` cases[3]) with `after.submits: null` and no post-action `submits` key stays counted.
- Fix: merge each row's findings into the global list before aggregation.

### O-2 HIGH: present null, number, boolean, object, or array treated as absent, yielding baseline

- Code: `get` (:367-370) calls `bytesOf` (:47-51), which returns null for anything except Buffer, string, or Uint8Array. Gate (:373) `!expectationsBytes && !noteBytes` returns `result([],[],0,'baseline',0)`. :368 maps null, array, string, or number `files` to all-absent.
- Counterexamples (API `evaluate`; the CLI only passes Buffers):
  - `evaluate(null)`, `evaluate([])`, `evaluate('x')`.
  - `files[EXP] = null` and `files[NOTE] = null` with the full retained acquisition present.
  - `files[EXP] = {}`, `0`, or `true` with NOTE absent.
  - A test that passes the parsed expectations object instead of bytes.
  - Each returns `baseline`, exit 0, value 0.
- Stable expectation: `input_shape`, detail `files`, `semantic-expectations`, or `oracle-note` as applicable; value 0; exit 2. A present-but-wrong-type value is never absent.
- Bounded preserving positive: keys `undefined` for EXP and NOTE with the retained acquisition complete → baseline 0, exit 0. This is the 5f585773 state.

### O-3 HIGH: baseline gate ignores the retained acquisition (CLI-reachable)

- Code: the gate at :373 runs before any retained-input check. `acquisition-input-missing` at :398 is unreachable whenever the new pair is absent.
- Counterexample: any full 40-hex revision in which `corpus/evidence/round-21/runtime/receipt.json` is missing while raw cases, fixtures, producer, and execution remain, and no round-22 note or expectations exist. Result: `baseline`, exit 0, via `node measure-c1.mjs <rev>`.
- Stable expectation: `input_shape`, detail `acquisition-input-missing`, value 0, exit 2. ORACLE's current id is `evidence_binding` at :398.
- Rule: baseline only when the whole retained acquisition is absent, or complete with the new pair absent. Any partial retained set refuses.
- Bounded preserving positive: 5f585773 (retained complete, new pair absent) → baseline 0, exit 0.

### O-4 MEDIUM: wrong-type envelope dates accepted silently (value-neutral)

- Code: `Date.parse(receipt.startedAt)` and `finishedAt` (:431-432) have no `typeof` check. :437 accepts any finite result.
- Counterexample: `receipt.startedAt: ["2026-10-21T13:51:46.773Z"]`. Node v24.21.0: `Date.parse` of that array is finite, so no finding is raised and the case counts.
- Stable expectation: `input_shape`, detail `receipt.startedAt`, value 0, exit 2.
- Bounded preserving positive: string `"2026-10-21T13:51:46.773Z"` stays accepted. Reuse DEBT `instant()` (`check-review-chronology.mjs:52-78`) for a strict typed parse.

### O-5 MEDIUM: type faults reported as semantic or binding findings, not input_shape

Each item: input → current finding (line) → expected.

- `receiptCase.preAction.windowMs: "254"` → `semantic_timing` (:261-269) → input_shape.
- Raw `frames[k].at: null` → `semantic_timing` (:167-168) → input_shape. FROZEN expects `order_mismatch`, see O-8.
- Raw `pageObservations[k]: null` → `evidence_binding` (:174) → input_shape.
- `receiptCase.invokeError` deleted → `evidence_binding` (:160) → input_shape. Retained: `invokeError: null` present in 12/12 cases.
- `receiptCase.after.submits` deleted → `evidence_binding` (:272) → input_shape.
- Raw `blocked`, `downloads`, or `browserPidsAfter` deleted → `evidence_binding` (:340-341) → input_shape. Retained: all three present in every raw.
- Raw pre or post `value.formActive` deleted with expectation present → `semantic_status` (:112-113) → input_shape.
- `receipt.cases` as an object → `evidence_binding` (:433-438) plus `case_set` per row (:440, :457) → input_shape. Receipt-level type faults already use input_shape (:441-442); case-level should match.
- Bounded preserving positive: the same fields with retained types keep their semantic findings.
- Also `observed = … ?? 'Pending'` (:344) labels a response lacking status as outcome `Pending` in rows. Not counted (matching uses :284 and :289), but misleading.

### O-6 LATENT, masked by digest pin: expectation inner fields are not validated

- Code: `expectationShape` (:94-100) requires `plain()` for `pre`, `post`, `delayed`, and `response`, and checks nothing inside them. With `minMs` or `maxMs` undefined, `preMs < undefined` and `preMs > undefined` are both false, so window bounds are skipped (:262, :266, :328-329). With `formActive` undefined on both sides, `undefined !== undefined` is false (:112-113, :264, :329).
- Masking: `EXPECTATIONS_SHA256` (:22; check :379-380) rejects any byte change to `semantic-expectations.json` as `input_shape` today. The gap goes live when the pin is regenerated for an edited file, or when `expectationShape` runs on an unpinned object.
- Counterexample: remove `minMs` from one `pre` block and regenerate the pin → window bounds silently skipped.
- Stable expectation: `input_shape`, detail `semantic-expectations-schema`, value 0, exit 2. Validate every consumed field: numbers for bounds; booleans for `formActive`, `formExists`, `focused`, `formActiveBeforeRelease`; arrays for `errors` and `statuses`; strings for `urlPath` and `urlSearch`; enum for `status`.
- Bounded preserving positive: committed ORACLE-EXP has 12 rows, all inner keys present (verified) → value 12.

### O-7 MEDIUM: exit and value conventions

- (a) Exit class. :378, :381, and :388-389 return `failed`, exit 1. :474 sets exit 1 for any finding. The lane's refusal convention is exit 2: `scripts/check-measurement-binding.mjs:94` (could_not_evaluate, exit 2), `scripts/selftest-measurement-binding.mjs:479-482` ("gate must refuse (exit 2)"), `scripts/check-aria-metadata.mjs:24-26`.
- (b) Value on failure. :470-475 keeps value 11 with exit 1 when one row fails semantics. FROZEN convention is value 0 on any finding (`.ufo/waves/round-21/measure-c1.mjs:57` and `:143`). Recommend value 0 whenever exit ≠ 0.
- (c) CLI catch (:526-529) relabels any non-`revision_input:` exception as `revision_input:evaluation-failed`. Internal faults should not look like revision faults.

### O-8 FROZEN expectations that conflict with typed refusal (do not copy as round-22 rows)

- `.ufo/waves/round-21/fixtures/expected.json`:
  - `nonfinite-clock` (frames[0].at = null) → exit 1, `order_mismatch`.
  - `null-frame-member`, `null-observation-member`, `object-case-id`, `missing-after-shape`, `malformed-present-submits` → exit 1, `case_shape`.
  - Round-22 needs `input_shape`, exit 2, value 0 for each.
- `baseline` row (receipt and note deleted, raw present) → exit 0. In round 22 only the new-pair-absent state is baseline (O-2, O-3).
- Round-21 W2 review `.ufo/waves/round-21/w2/CounterErrors.md` (lines 13-19, 36-38) recommended exit 1 `case_shape` for null members. That conflicts with this typed-refusal requirement. Lead decides (decision 1).
- Coverage gap in FROZEN selftest (`.ufo/waves/round-21/selftest-c1.mjs:62-68`): no row for summary `submits: null` while the raw post has a `submits` array (expected `evidence_binding`, exit 1, value 0). None for deleted `after.submits`, `invokeError`, or `preAction.formActive`.

## Debt findings (DEBT, 94A7)

### D-1 HIGH: missing actor or route → silent clean

- Code: `eventHistory` accepts a missing or null `actor` (:122-123). Peer revival requires `nonempty(event.actor)` (:146-147). Routing requires `route` or `recipient` (:148-149).
- Counterexample: `event_history: [{"seat":"S1","type":"failure"},{"seat":"S1","type":"message"}]`, digests equal, artifact scopes equal, `acquisition.started_at` earlier than `review.observed_at`. No finding, exit 0, `matched_supplied_scope`.
- Stable expectation: `event_history_unavailable`, exit 2. A post-failure message with an unknown sender cannot be classified, so no matched verdict.
- Bounded preserving positive: same input with `"actor":"S2"` → exit 1 `peer_revival_after_failure` (existing DEBT-EXP row).

### D-2 HIGH: empty history treated as available → clean

- Code: `eventHistory([])` (:117) yields `status: 'available'` with `seats: []` (:165-168). No findings → exit 0 (:269-272).
- Counterexample: `event_history: []` with matching digests, scopes, and ordering → exit 0, `matched_supplied_scope`, `event_history.status: "available"`.
- Stable expectation: `event_history_unavailable`, exit 2. An empty array certifies nothing about seats. Spec: absent history stays unavailable; no completeness claim.
- Bounded preserving positive: absent key → unavailable, exit 2 (already at :114-115).

### D-3 HIGH (soundness): upper-bound clock role yields `matched`

- Code: :220-224 admit `review_observation_upper_bound` and treat `A <= U` as chronology matched. :270-272 → matched. The comment at :220 says readAt values are upper bounds. DEBT-EXP row `exact_pre_review_artifact_positive` pins `review_clock_role: review_observation_upper_bound` and `scope.status: matched`.
- Argument: U bounds the observation from above, so `A <= U` does not show `A <= observation`. Only `A > U` (a gap) follows soundly.
- Stable expectation: an upper-bound-only input must not yield `matched`. Expected `chronology_unavailable`, exit 2, or an explicit `not_excluded` status. Keep `matched` for exact observation or return clocks only.
- Bounded preserving positive: retained W2 readAt `2026-10-21T13:49:02.529912+00:00` against receipt `startedAt` `2026-10-21T13:51:46.773Z` → A > U → exit 1 `review_scope_gap`. This is sound; keep it, including when digests and scopes are absent (precedence :239-247).

### D-4 MEDIUM: untyped clock echoed into output

- Code: :277 passes `input.review.observed_at` and `input.acquisition.started_at` raw into `makeResult`. They are echoed at :186-187.
- Counterexample: `review.observed_at: {"x":1}` → `chronology_unavailable`, exit 2, but `scope.review_observed_at` is `{"x":1}`.
- Stable expectation: echo only the parsed canonical instant string, or `null`.
- Bounded preserving positive: a valid ISO string echoes unchanged.

### D-5 MEDIUM: duplicate JSON keys silently override

- Code: :296 `JSON.parse`. Node v24.21.0: `JSON.parse('{"a":1,"a":2}')` → `{a:2}`.
- Counterexample: `review.producer_sha256` written twice, first mismatching, last matching → `producerMatch` true.
- Stable expectation: `input_shape` (duplicate key), exit 2. Requires a raw-text key scan before parse.
- Bounded preserving positive: unique keys parse unchanged.

### D-6 exit convention

DEBT returns exit 2 for `input_shape` (:214-215, :229), consistent with the lane vocabulary. ORACLE does not (O-7a). Align ORACLE.

### D-7 LATENT: selftest `?? null` conflates missing with null

- Code: :339-340 `pathValue(actual, path)` then `actualValue ?? null`. Refusal outputs carry no `scope` (:215, :229, :281-282), so `{"scope.review_observed_at": null}` passes vacuously on any refusal. Current rows survive only because they also assert `exit` and `finding`.
- Same idiom in SELFTEST :409-411 and :418-419 (`reportedExit`, `value`, `verdict` with `?? null`). Not analysed further.
- Stable expectation: `undefined` fails every assertion; null matches only an actual null.

### D-8 LOW: `artifactScope` collapses missing and malformed to null

- Code: :81-92 return null for both → `artifact_scope_unavailable`, exit 2. Typed, but loses the input_shape reason. Acceptable; record.

### Confirmed correct (keep)

- Null or malformed digests → `producer_digest_unavailable`, exit 2, never a null === null match (:217-219).
- `instant()` rejects non-strings (:53). Array-wrapped and numeric clocks refused. Null clock → `chronology_unavailable`, exit 2 (:222-224; DEBT-EXP `unknown_clocks`).
- Malformed event fields → invalid → input_shape, exit 2 (:121-123, :228-229).
- Retained wave-returns input (`tabi-round21-wave-returns-v1`) → input_shape, exit 2 (:214). Refused, not guessed.
- Retained 6-digit fraction `2026-10-21T13:15:40.534838+00:00` passes the regex (:54).

## Retained-shape facts (jq and grep verified; must stay accepted)

- R-1: `receipt.json` cases[3] `na-native-submit` has `after.submits: null`. Its post observation has no `submits` or `nonce` keys; its pre observation has both. FROZEN `unavailable-null-positive` expects exit 0, value 12.
- R-2: response keys are status-conditional. Completed `{invocationId, output, status}`, no `errorText`. Canceled and Error `{errorText, invocationId, status}`, no `output`. A schema that requires one key set for every response refuses retained cases.
- R-3: `invokeError: null` is present in 12/12 cases. Missing is not null.
- R-4: `closeError` is absent from every retained raw (grep: no matches). Do not require it.
- R-5: empty `latestOutput.text` appears in 30 W1 seats (equal to `terminalNoOutputCount` 30, `.ufo/waves/round-21/w1-failures.json:40`) and 5 W2 seats. That is terminal no-output, not missing content. Failed seats that still carry text: W1 BuildRuntime (154 chars), BuildCounter (864); W2 SemanticNaNativeSubmit (1193 chars, invalid_prompt, `w2-failures.json:10`). A text-emptiness heuristic misses them. Failure must come from notices, not text.
- R-6: W1 and W2 seats carry only `{name, role, latestOutput}`: no `events`, no digests, no clocks. `latestOutput` is an object in 64/64 seats per wave. Event history is absent for every retained seat → `event_history_unavailable`, never reconstructed.
- R-7: `.ufo/waves/round-22/w1/swarm-registry.json` spawn members have `item: null` in 64/64. Legitimate null.
- R-8: W2 chronology: readAt `13:49:02.529912+00:00` precedes receipt `startedAt` `13:51:46.773Z` → gap (D-3 positive).

## Crash and throw check

- ORACLE (AEE4): none found by static trace for JSON-typed values. `Date.parse`, `new URL`, and `JSON.parse` are guarded or inside try.
- FROZEN: `get` (:58) throws for null, number, boolean, or object (Node probe: `Buffer.from(null|5|{})` TypeError). `sha(get(path))` (:70) throws when execution metadata matches a present-`undefined` PREFIX key, because `createHash.update(null)` is a TypeError. Do not reuse either.
- DEBT (94A7): none found. `evaluatePath` wraps everything in try (:285-305).
- SELFTEST (73FC): `text(undefined)` → `Buffer.from(undefined)` throws (Node probe). Reached from `readJson` (:42) and `resealAcquisition` (:57, :65). A mutation that deletes a required file crashes the harness instead of producing a typed case result.

## Verification exercised

- Static reads of the drafts and FROZEN files at the tags above. DEBT re-read after it changed (66A3 → 94A7).
- Read-only jq and grep over retained JSON.
- Node v24.21.0 literal probes, no lane code executed:
  - `Date.parse(null)`, `Date.parse({})`, `Date.parse(1792590707081)` → NaN.
  - `Date.parse(['2026-10-21T13:51:46.773Z'])` → finite.
  - `Date.parse('2026-10-21T13:15:40.534838+00:00')` → finite.
  - `new Date(null).getTime()` → 0.
  - `1792590710183 - null` → 1792590710183; `- "1792590709930"` → 253; `- [1792590709930]` → 253.
  - `Buffer.from(null)`, `Buffer.from(5)`, `Buffer.from({})`, `Buffer.from(undefined)` → throw. `Buffer.from([])`, `Buffer.from('')` → truthy.
  - `createHash('sha256').update(null)` → throws.
  - `JSON.stringify(undefined)` → undefined. `isDeepStrictEqual(undefined, null)` → false. `isDeepStrictEqual({}, {a: undefined})` → false. `isDeepStrictEqual(undefined, undefined)` → true.
  - `JSON.parse('{"a":1,"a":2}')` → `{a:2}`.
  - `for…of null` and `for…of {}` → throw. `Number.isSafeInteger('1792590707081')` → false.
- Not run: any test, build, linter, formatter, smoke, browser, or network action.

## Installs or updates

None.
