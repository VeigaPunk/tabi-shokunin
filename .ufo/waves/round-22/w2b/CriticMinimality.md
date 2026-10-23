# CriticMinimality — round 22 w2b (post-crash), revision e3cf4e0d30bb835532ff44b118c5ad52e09eb76d

Seat: TabiR22-2.CriticMinimality-16 (critic, leaf). Author-side falsification, static only.
Item: minimality of the post-crash repair and of the round's code (`measure-c1.mjs`, `selftest-c1.mjs`,
`check-review-chronology.mjs`): dead branches, duplicate checks, needless complexity.

## Verdict

**No finding changes the measured value.** The metric stays 12 at e3cf4e0 according to the retained 44/44 sandbox receipt. I did not re-run it.
The repair diff is small and targeted: +12/−3 in `measure-c1.mjs`, +12 in `selftest-c1.mjs` and +22 in `fixtures/expected.json`.
Each added control kills a named mutant (`post-crash-repair.json` `mutationProbes`).

The round's code still carries real minimality debt:

- One duplicate check misattributes a finding. **M1** is an actual, fixable bug in finding attribution, not in the value.
- Six checks are strict duplicates, or are dead because the expectations file is digest-pinned.
- The logic for the native-submit landing page now has four separate authorities. The repair added one of them.
- The per-row metric is structurally all-or-nothing, which affects the claim wording.

No item is a tradeoff that the judge must reject. Every item is a fixable defect that does not affect the outcome, except M1, which is a defect in attribution.

Axes named: **A1** dead code, **A2** duplicate checks or authorities, **A3** correct finding attribution, **A4** precision of the claim, **A5** whether controls can detect masking.

## Exercised commands (all read-only; no lane script executed)

| Command | Exit |
|---|---|
| `git -C tabi-shokunin show --stat e3cf4e0…`; `git log --oneline -8 e3cf4e0…`; `git diff --stat 0f24164 e3cf4e0` | 0 |
| `git diff 0f24164 e3cf4e0 -- measure-c1.mjs selftest-c1.mjs fixtures/expected.json` | 0 |
| `git show e3cf4e0:.ufo/waves/round-22/post-crash-repair.json` | 0 |
| `git show e3cf4e0:<round-22 files>` extracted to `/tmp/cm16/` (measure, selftest, chronology checker, run-checks.py, expected.json, debt-expectations.json, semantic-expectations.json, round-21 receipt.json, selftest-repair-sandbox.json) | 0 |
| `sha256sum /tmp/cm16/sem.json`, which gives `4a693dce…60e1e`, equal to `EXPECTATIONS_SHA256` | 0 |
| `node -e` over the extracted **JSON data only**: per-case expectations, selftest mutation-kind usage, chronology selftest assertion paths, per-case findings in the retained sandbox receipt, nonce charset | 0 |
| `git grep` for importers of `measure-c1`/`evaluate`/`INPUT_PATHS`; `grep -n landing` | 0 |
| `git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` | fatal: exists on disk, not in revision |
| `git log --all -- .ufo/waves/round-22/checks-at-e3cf4e0.json` | 0, empty |

**Not run (honest):** I did not run `measure-c1.mjs`, `selftest-c1.mjs`, `check-review-chronology.mjs` or `run-checks.py`. No mutant was executed. Every equivalence claim below rests on code reading plus the retained receipt `selftest-repair-sandbox.json`. That receipt records the selftest at 0f24164 with the repaired oracle. Its oracle hash should equal e3cf4e0's `filesAfter` (`post-crash-repair.json`), but I did not verify that hash.

## Findings

Line numbers refer to `git show e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:.ufo/waves/round-22/<file>`.

### M1 — Duplicate expectation terms in the note-header check misattribute a finding (A2, A3) — actual bug in attribution

- **Where:** `measure-c1.mjs:398-399`
  ```js
  if (firstLine !== SOURCE_HEADER || expectations?.sourceHeader !== SOURCE_HEADER || expectations?.sourceNotePath !== NOTE_PATH)
    addFinding(findings, 'source_binding', 'canonical-S101-first-line');
  ```
- **Why it is a duplicate:** `expectationShape` already requires both expectation fields (`measure-c1.mjs:81-82`). When they differ, line 394 adds `semantic-expectations-schema` and line 401 returns `failed`.
- **Counterexample (retained, observed):** selftest case `partial-missing-expectations`. It deletes only the expectations file and leaves the note header canonical. Its retained findings are `["source_binding|semantic-expectations-missing", "source_binding|canonical-S101-first-line"]`. The oracle therefore says the note's first line is non-canonical when the note is byte-identical to the positive.
- **Preserving positive:** after the fix, `bad-source-header` still emits `canonical-S101-first-line` (that mutant edits the note). `partial-missing-expectations` still emits `source_binding` through `semantic-expectations-missing`. `positive` is unchanged.
- **Smallest fix:** `if (firstLine !== SOURCE_HEADER)`.

### M2 — The landing page has four authorities; the repair added a fourth instead of unifying (A2)

The native-submit landing is described in four places:

1. A hard-coded id, `stage === 'post' && id === 'na-native-submit'`, at `measure-c1.mjs:117`. It drives nonce absence (`:118-120`) and, after the repair, `errors` absence (`:129`).
2. The expectation field `expected.submitCount === null`, at `:121-122`. It drives `submits` absence. The repair comment at `:115-116` says landing governs the "submit … recorders", but the code uses this trigger instead of `landing`.
3. `expected.navigation === 'landing'`, with a hard-coded `'/landing'` path and `` `?q=${encodeURIComponent(nonce)}` `` query, at `:311-321`.
4. New in the repair: `expected.post.urlPath` and `expected.post.urlSearch` (`"?q=$nonce"`), at `:136-141`.

- **Counterexample:** none under the pin. Only the `na-native-submit` post row has `submitCount: null`, `navigation: 'landing'` and `urlSearch: "?q=$nonce"`. That uniqueness is what makes the authorities redundant: changing the landing contract means editing up to four places, and the digest pin only catches drift in the expectations, not in the hard-coded copies.
- **Preserving positive:** all 12 rows keep the same truth table, because under the pinned file `id === 'na-native-submit' && stage === 'post'` ⇔ `expected.submitCount === null`. The controls `native-submits-empty`, `native-landing-errors` and `native-landing-wrong-query` emit the same ids.
- **Smallest fix:**
  - In `validatePageState`, use `const landing = expected.submitCount === null;`. The submits rule already uses this trigger, so one trigger then covers all three absence rules.
  - At `:318-319`, compare against `expected.post.urlPath` and the resolved `expected.post.urlSearch` instead of the literals.
  - Fix the comment at `:115-116`, or drop it once one trigger covers all three rules.

### M3 — The repair's `!equal(expected.errors, [])` term cannot change any outcome (A1)

- **Where:** `measure-c1.mjs:129`, `landing ? Object.hasOwn(actual, 'errors') || !equal(expected.errors, []) : …`
- **Why it is dead:** `expected` comes from the expectations file, which is pinned to `4a693dce…`. Any expectations whose landing `errors` is not `[]` fails the digest at `:392-393`. That adds a finding, so `blocked` is true at `:480` and the result is value 0, exit 1, `failed`. The term can only append a second finding to a result that has already failed. It never fired in the retained receipt.
- **Counterexample:** expectations with landing `errors: ["x"]`. The result is `failed` because of the digest, whether or not the term exists.
- **Preserving positive:** `native-landing-errors` still emits `semantic_error` through `Object.hasOwn(actual, 'errors')`. That is the probe recorded in `post-crash-repair.json` `mutationProbes[0]`.
- **Smallest fix:** `landing ? Object.hasOwn(actual, 'errors') : !equal(actual.errors, expected.errors)`. This also removes the pinned `[]` being silently reinterpreted as "absent".

### M4 — The repair added a second token convention (A2)

- **Where:** `measure-c1.mjs:138-139` replaces `$nonce` inline as a substring, with `encodeURIComponent`. `resolveTokens` (`:59-65`) stays the whole-value tokenizer for `$nonce` and `$input`, and is used for `value` and outputs. Line 319 contains a third hard-coded form of the same query.
- **Counterexample:** none under the pin. Every retained nonce is a UUID (`[0-9a-f-]`), so `encodeURIComponent` is the identity on the population. The repair also silently dropped `$input` support for `urlSearch`; no pinned row uses it.
- **Preserving positive:** `native-landing-wrong-query` keeps emitting `semantic_navigation`.
- **Smallest fix:** with M2 applied, line 319 reuses the `:138-139` value, which leaves one substring form. Alternatively, fold the substring case into `resolveTokens` for strings. Do this only if the URL-encoding rule moves there explicitly.

### M5 — Duplicate invocation and observation checks in `checkCase` (A2)

Every item in this group fires only together with a broader check of the same id. Where the id differs, it fires only together with a broader `evidence_binding` finding, so the value never changes.

| Lines | Check | Subsumed by | Same id? |
|---|---|---|---|
| `:229-230` | `invocation-id-cross-link` | `:221-222`: the same two disjuncts inside `current-invocation-chain` | yes (`evidence_binding`), a pure duplicate |
| `:245-250` | `observation-frame-link` | `:181` `page-observation-raw-link` (see proof below) | yes (`evidence_binding`), a pure duplicate |
| `:167` (part) | `typeof receiptCase.invocationId !== 'string' \|\| !receiptCase.invocationId` | `:220-221`: `invocationId` is a non-empty string equal to the receipt's | yes (`evidence_binding`) |
| `:231-232` | `invocation-sequence` (`semantic_timing`) | the sequence term at `:227` | no; only re-labels |
| `:233-234` | `invoked-input` (`semantic_output`) | the stricter `equal(…, {q: inputQ})` terms at `:226` | no; only re-labels |
| `:302-303` | `response-outside-finite-pending-case` | `:286-287` `pending-has-response`. Under the pin, `responseWindow === 'none'` ⇔ `response === null` (only `na-pending`) | yes (`semantic_status`). Observed co-firing in retained `status-na-pending`: `finite-window-response-statuses`, `pending-has-response`, `response-outside-finite-pending-case` |
| `:236` | `navEvents` filter | `:213` `initialNavigations`, the identical filter computed twice | — |
| `:161`, `:169` | the `nonce` validity test is written twice | — | — |

Proof for the `observation-frame-link` row: line 181 requires `raw.pageObservations` to deep-equal `{label, at, seq, value}` derived from the observation frames, in frame order. `pre` is the first `pre-action` entry, so the first observation frame labelled `pre-action` is its source. `frames.find(label, seq)` at `:246` returns that same frame, so `at` and `value` are equal by construction. The same holds for `post`.

- **Counterexample (for the pure duplicates):** any raw file that trips `:229-230` or `:245-250` also trips `:219-228` or `:181` with the same id. Deleting the duplicates changes only the detail list.
- **Preserving positive:** all 44 retained controls keep their expected id. None expects `invocation-id-cross-link`, `observation-frame-link` or `response-outside-finite-pending-case` specifically: `checkOracle` matches ids, not details, at `selftest-c1.mjs:382`. `status-na-pending` keeps `semantic_status`.
- **Smallest fix:**
  - Delete `:229-230`, `:245-250`, the `invocationId` clause at `:167` and `:302-303`.
  - Reuse `initialNavigations` for `navEvents`.
  - Hoist the nonce guard so it is tested once.
  - Keep `:231-234` only if the extra category labels are wanted as diagnostics; they never change the value.

### M6 — Shape checks duplicate the digest pin (A2, A5)

- **Where:** `measure-c1.mjs:80-101` (`expectationShape`) compares literal values: the acquisition revision `1b5f449…`, baseline `e7cf11a…`, `outputPath`, `receiptSchema`, and the environment including `FLAGS` (`:30-35`, used only here). The same expectations bytes are pinned by `EXPECTATIONS_SHA256` (`:22`, `:392`).
- **Why it is redundant:** any object that passes shape but differs from the pinned bytes already fails through the digest finding (blocked, value 0). The literal-value checks therefore cannot change any outcome, and no control can detect their removal.
  - Retained `malformed-expectations` shows `input_shape|semantic-expectations-digest` together with `-schema`. `checkOracle` accepts `input_shape` from either.
  - Re-pinning needs edits in two places: the digest and the literals.
  - The *type* checks (`Array.isArray(cases)`, plain rows) are still needed as crash guards before `checkCase`.
- **Counterexample:** delete the `FLAGS`/environment equality at `:92`. The pinned positive still gives 12. Every expectations mutant still fails through the digest, and `malformed-expectations` still passes.
- **Preserving positive:** `positive` gives 12; `malformed-expectations` and `partial-missing-expectations` keep their ids.
- **Smallest fix:** keep only the structural type checks in `expectationShape`; delete the literal-value comparisons and `FLAGS`. Alternatively, return `failed` right after a digest mismatch and keep only the type checks.

### M7 — Unreachable verdict arm; the metric is all-or-nothing (A1, A4)

- **Where:** `measure-c1.mjs:480-487`
- **Why:**
  - Every row-local finding is copied into the global `findings` (`:154`, `:353`).
  - So `findings` empty ⇒ every row has `semanticMatch` ⇒ value = `expectations.cases.length`, which `expectationShape` forces to 12 (`:93`).
  - And `findings` non-empty ⇒ value 0.
  - So value ∈ {0, 12}. The `'baseline'` arm of `value ? 'clean' : 'baseline'` at `:487` is unreachable, because baseline already returned at `:384`.
  - `row.counted = !blocked && row.semanticMatch` reduces to `!blocked`.
- **Claim impact (A4, not a bug):** the 12 rows can each fail, but the counter cannot report 1 to 11. "0→12 semantically checked rows" is one pass/fail verdict over 12 rows; it does not count rows independently.
- **Counterexample:** a single-row defect (retained `native-landing-errors`) gives value 0, not 11.
- **Preserving positive:** `positive` gives 12 `clean`; `baseline` gives 0 `baseline` via `:384`.
- **Smallest fix:** drop the `'baseline'` arm (`verdict = exit ? 'failed' : 'clean'`) and set `counted = !blocked`. Alternatively, keep the code and state the all-or-nothing semantics in the claim text.

### M8 — Dead API remnants: in-memory `evaluate` inputs (A1)

- **Where:**
  - `measure-c1.mjs:38` `export const INPUT_PATHS` and `:372` `export function evaluate`. Neither has an importer in the revision (`git grep`); the selftest drives the CLI.
  - `:47-51` `bytesOf` string/`Uint8Array` branches.
  - `:374-375` the non-object `files` guard.
  - `:382-386` the `non-byte-oracle-input` path.
- **Why:** the only producer of `files` is `filesAt` (`:507-521`), which returns a null-prototype map containing only Buffers from `git cat-file`. So "present" ⇔ "bytes non-null", and those branches cannot fire.
- **Counterexample:** none reachable via the CLI.
- **Preserving positive:** all 44 controls run through the CLI and are unaffected.
- **Smallest fix:** drop both `export` keywords. Reduce `bytesOf` to the Buffer case, or inline `files[path] ?? null`. Delete `:374-375` and `:382-386`.

### M9 — Selftest dead or redundant code (A1)

- **`selftest-c1.mjs:120-121`, the `successfulOutput` native branch `[{dummy:'landing'}]`:** this function is reached only from `wrongStatus`, either by insertion (`na-pending`) or by non-Completed→Completed conversion. `na-native-submit` is Completed and goes through the Completed→Error branch (`:144-147`), so the native branch is unreachable for the 44 cases. Fix: delete the conditional.
- **`selftest-c1.mjs:378-379`, `expected.value === null` arm:** no case in `fixtures/expected.json` has `value: null`; all are 0 or 12. Fix: delete.
- **`selftest-c1.mjs:47` and `:412`:** identity `Object.fromEntries(Object.entries(x).map(([p, b]) => [p, b]))`. Fix: `{ ...x }`.
- **`selftest-c1.mjs:249`:** in `delayed-active-false`, `syncFrames(raw)` after manually syncing `observation.value` and `marker.value`. No frame is reordered, so it is a no-op. Fix: drop the call or the manual copy.
- **Duplicate control:** `duplicate-case` and `missing-case` give identical retained finding sets (`case_set|receipt-case-order-or-set`, `case_set|auto-invalid:receipt-row-missing`, `input_shape|auto-invalid:case-evidence-shape`). The duplicate row is a clone of the first, so the dedupe in `measure-c1.mjs:460` (`!casesById.has`) has no observable effect. One control does not cover a distinct branch.

### M10 — Chronology checker redundancies (A1, A2)

- **`check-review-chronology.mjs:313-320` `pathValue`:** both special cases are identity operations in JS. `x['length']` already returns the length for arrays and strings, and `arr['0']` ≡ `arr[0]`. Fix: `path.split('.').reduce((c, s) => c?.[s], value)`. Preserving positive: the 17 debt cases' assertion paths (`event_history.seats.0.events.length`, `findings.1`, …) resolve identically.
- **`:216` and `:233`:** inline object literals that are byte-for-byte `failure('input_shape')`. Fix: `return failure('input_shape')`.
- **`:286` `failure(finding, exit = 2)`:** no caller passes `exit` (`:295-307`, `:363`). Fix: drop the parameter.
- **`:42`:** `Object.keys(value).sort(compareText)` ≡ `.sort()` (both are UTF-16 code-unit order). Keep `compareText` only for the artifact sort (`:93`).
- **`:180-181`:** `scope.status` re-derives the same gap/unavailable lattice that `scopeGap` (`:243`) and the verdict chain already compute. Fix: pass `scopeGap` in and derive from it.
- **Not dead, but unexercised:** the `producer_digest_unavailable` verdict arm (`:253-256`). Every one of the 17 debt cases supplies both producer digests. Deleting that arm would let a null-producer input fall through to `matched_supplied_scope`, exit 0. Minimality must **not** remove it. A one-case control (omit `acquisition.producer_sha256`, expect exit 2) would make it detectable.

## Masking class (A5) — the repair corrected the symptom, not the matcher

- **Defect D3 (`post-crash-repair.json`):** a negative control passed only because a different check emitted the expected id. The repair fixed one fixture. The matcher, `ids.includes(expected.finding)` at `selftest-c1.mjs:382`, is unchanged, even though the same file already uses exact-set matching for the legacy checker (`:402`, `JSON.stringify(ids) === JSON.stringify(expected.findings)`). That is two conventions in one file.
- **Proof that masking is still live:** under `includes`, the M6 literal checks and the M3 term cannot be detected by any control.
- **Smallest fix:** give each case an exact `findings` array (ids, sorted) and use the legacy comparison. This is a larger fixture edit, and it overlaps RepairMaskedFixture's item.

## Checked and clean (no finding)

- The selftest mutation switch has no unused or unknown kinds: the switch kinds and `expected.json` kinds have identical sets.
- The `native-landing-wrong-query` regex no-op risk is self-detecting. If `?q=` were absent, the mutant would equal the positive and the control would fail.
- Each repair mutation reseals the raw file, receipt and execution artifacts (`changeCase`, then `resealAcquisition`), so no stale `evidence_binding` appears. The retained receipt confirms single-id findings for both new controls.

## Out of scope / for other seats

- `checks-at-e3cf4e0.json` (35/35), cited in the wave context, is not in revision e3cf4e0 and has no history in any ref (`git log --all` is empty). It exists only on disk. This is evidence binding, not minimality.
- Authenticity against a malicious author, browser semantics and feature requests: none raised.

## Tooling

No tools were installed or upgraded. I used the existing `git`, `sha256sum` and the lane Node at `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, only to run `-e` over extracted JSON data.
