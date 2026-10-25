# CriticRepairFitting — round22 w2b (author-side falsification)

Item: is the move from 0f24164 (value 0) to e3cf4e0 (value 12) fitting the oracle to the data, or redefining a frozen target?
Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. Comparator: `0f24164be77e72ba359fe4befdc42d96bc343034`. Static review only; no lane script executed.

## Verdict

The answer differs for each of the three repairs:

| Defect | Classification | Effect on value |
|---|---|---|
| D2 (query token) | **Genuine instrument bug.** The 0f24164 oracle already had the correct rule elsewhere in the same file. Not fitting. | Necessary, not sufficient |
| D3 (selftest expected finding) | **Genuine selftest fixture bug.** It does not change the measurement. | None |
| D1 (landing `errors`) | **Fitting / silent redefinition.** The pinned file is byte-unchanged, but the code now reads its `errors: []` literal for one row as "recorder absent". The selftest kill-control enforces that inversion. | **Decides 0 vs 12 on its own** |

The measurement blocks all-or-nothing: `measure-c1.mjs:480-485` counts no row if any finding exists. Fixing D2 without D1 would still measure **0**. So the 12 depends entirely on D1, and D1 is the one move that changes what the frozen expectation means.

## F1 — D1 redefines a pinned field in code (high; fitting; the judge must rule)

**Evidence**

- The pin is byte-identical: `corpus/evidence/round-22/semantic-expectations.json` has sha256 `4a693dce…` at both 0f24164 and e3cf4e0. Both landed in commit 0f24164.
- The pinned `na-native-submit.post` row has `"errors": []` and `"submitCount": null`. The same pin therefore encodes "recorder absent" as `null` (submits) and "recorder present, empty" as `[]`.
- The note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:40` (row `na-native-submit`) requires "old-document submits unavailable/null". Its reject column lists **"null-to-empty collapse"**.
- In the producer `scripts/webmcp-lifecycle-round21.mjs`, errors are recorded only by the fixture document: `window.observations={…errors:[]}` and the `error` listener at lines 110-111. The landing page (line 137) has no recorder.
- The retained raw `corpus/evidence/round-21/runtime/na-native-submit.json` after-action value is `{url, secureContext, formExists, formActive, value, focused}`, with no `errors` key. Its frames contain no `Runtime.*` or `Log.*` channel (frame census: Page, WebMCP and observation frames only). Landing-stage page errors are therefore **unobservable** in the retained evidence.
- The repair at e3cf4e0 `.ufo/waves/round-22/measure-c1.mjs:117,129` is `landing ? Object.hasOwn(actual,'errors') || !equal(expected.errors, []) : …`. The pinned `[]` now means "key must be absent". Absence passes as if it satisfied "no errors observed". That is the null-to-empty collapse the note rejects, applied in reverse.

**Smallest counterexample, with a preserving positive.** Both come from the repair's own control set. Results are taken from the retained receipt `.ufo/waves/round-22/selftest-repair-sandbox.json`; I did not re-run them.

- Counterexample: control `native-landing-errors` (`selftest-c1.mjs:217-227`) sets the landing observation to `errors: []`, **literally equal to the pinned expectation**. The repaired oracle emits `semantic_error na-native-submit:post:page-errors`, and `fixtures/expected.json` requires that failure.
- Preserving positive: the retained bytes, which have no `errors` key, measure clean.

So an observation that matches the frozen literal fails, and one that cannot satisfy it passes. A real landing-page exception would also pass, because nothing records it.

**Mitigating context (tradeoff, not exoneration).** The note's required distinction for this row (line 40) is Completed, array output, `/landing` with the case nonce, and old-document submits null. Page errors are not named, so the dimension is arguably not load-bearing. The 0f24164 author also already hardcoded "nonce absent on landing" in code (`0f24164:measure-c1.mjs:115`), so the pin was internally inconsistent at authoring time. That makes `errors: []` most plausibly an authoring slip. Correcting a slip in the code while declaring "pinned expectations unchanged" (`post-crash-repair.json` `unchanged[0]`) is still false provenance: the bytes are unchanged, but the meaning is not. The `honesty` field discloses the fitting risk; it does not disclose that the meaning of a pinned field changed.

**Smallest safe correction.** Make the target change visible where the target lives, then re-review it:

1. Set `cases[na-native-submit].post.errors` to `null` in `semantic-expectations.json`. This mirrors the existing `submitCount: null` convention.
2. Re-pin `EXPECTATIONS_SHA256` at `measure-c1.mjs:22`.
3. Change line 129 to `expected.errors === null ? Object.hasOwn(actual,'errors') : !equal(actual.errors, expected.errors)`, dropping the id special case.
4. Record this in the repair record as an expectation revision authored after observing the data, for non-author review.

Both sides are preserved: the retained bytes still give 12, and `native-landing-errors` still fails, because `errors: []` is present while the pin requires absence.

The alternative is to keep the frozen pin and accept the honest value under it. That is **0** with the current blocking rule; 11 rows are semantically matched. Choosing between these is a target decision for the canonical judge. It is not a defect the code alone can fix.

## F2 — D2 is a genuine bug fix; the 0f24164 oracle disagreed with itself (no defect in the repair)

- At 0f24164, `measure-c1.mjs:133` used `resolveTokens(expected.urlSearch…)`. That only resolves whole-value tokens (lines 59-65), so the pinned `"?q=$nonce"` could match only a literal `?q=$nonce`. No correct native-submit observation could ever pass.
- The same 0f24164 file already checked the landing frame navigation as `url.search === \`?q=${encodeURIComponent(nonce)}\`` at line 313 (`e3cf4e0:318-319`). The repair at `e3cf4e0:138-139` makes the page-state check agree with that pre-existing rule. It is unification, not invention.
- Counterexample attempted: an encoding mismatch. `encodeURIComponent` differs from form-urlencoded serialization, for example for space versus `+`, or `!'()*`. The nonce comes from `randomUUID()` (producer line 156), which yields only hex digits and `-`, so the two are equivalent on this population.
- `String.replaceAll` replacement patterns (`$&`, `$1`) cannot arise, because `encodeURIComponent` escapes `$`.
- Other rows have `urlSearch: ""`, which maps to `""` both before and after the repair, so there is no regression on the other 11 rows.
- Preserving positive: the retained landing URL `…/landing?q=8a5839ad-…` passes. Control `native-landing-wrong-query` fails as expected (from the retained receipt).
- Residual (low): only `$nonce` is substituted inside the string. An embedded `$input` would stay literal, which fails closed and is therefore safe. No fix required.

## F3 — D3 corrected the fixture but not the matcher that hid it (low; hardening)

- At 0f24164, every one of the 39 data-bearing controls also carried the positive's own `semantic_error` and `semantic_navigation` findings (`selftest-pre-repair-0f24164.json`). Matching uses `ids.includes(expected.finding)` (`e3cf4e0:selftest-c1.mjs:383`), so `native-submits-empty → semantic_navigation` passed even though its real case finding was `semantic_status` (`na-native-submit:post:submit-observation`).
- The repair corrected that one expected value. The subset matcher that allowed it is unchanged.
- With a clean positive, the remaining risk is a control passing on the right id but the wrong detail. For example, `native-landing-wrong-query` would pass on `url-missing` or `url-invalid` instead of `url`.
- Smallest fix: in `checkOracle`, also require some finding whose `detail` starts with `${mutation.caseId}:` when `caseId` is set, or store the exact expected `detail` in `fixtures/expected.json`. The positive control (no findings) is unaffected.

## F4 — Duplicate landing authority (low; maintainability)

- `measure-c1.mjs:117` decides "landing" with `id === 'na-native-submit'`. The same file uses the pinned `expected.navigation === 'landing'` at line 311, and `expectationShape` validates that field at line 99. The repair widened the hardcoded authority from one dimension (nonce) to two (nonce and errors).
- Counterexample (hypothetical under the fixed pin): a second `navigation: 'landing'` row would get frame-navigation landing checks but no landing page-state rules.
- Smallest fix: pass `row.navigation` into `validatePageState` and use `stage === 'post' && navigation === 'landing'`. The output on the retained data is unchanged.

## F5 — Evidence of the kill-controls and mutation probes (provenance)

- The two `mutationProbes` in `post-crash-repair.json:51-60` ("landing ? false" and "accept any ?q=") exist only as inline prose. No stdout or receipt artifact is committed for them (`git grep` at e3cf4e0 finds them only in that file). Their logic is consistent with the controls: each mutant removes exactly the check the matching new control exercises. Treat them as unreceipted claims.
- `checks-at-e3cf4e0.json` (35/35, `c1-after` value 12, oracle hash `47176aed…`) is **untracked in the working tree, not part of e3cf4e0**: `git show` of it at e3cf4e0 exited 128. It names the right revision and producer hashes, but it is not committed evidence.
- The repair record's `filesBefore` and `filesAfter` sha256 values match the committed blobs at 0f24164 and e3cf4e0 exactly (verified).
- Structural note: the selftest positive is the retained round-21 runtime bytes themselves (`selftest-c1.mjs:56-58`). The only positive control is the population being measured. Every repair that turns the positive green fits that population by construction, so the kill-controls are the only independent safeguard. Under F1, one of them enforces the inverted reading.

## Impacted axes

- **C1 operability:** the 12 depends on F1.
- **Provenance:** the "pinned expectations unchanged" claim (F1, F5).
- **No regression** on the other 11 rows: D1 and D2 only affect `na-native-submit` post-stage branches, or are no-ops for `urlSearch: ""`.
- Depth, scalar and population are untouched by this repair.

Out of scope: malicious-author authenticity (the note, line 26, already disclaims it), general browser error semantics, and adding a CDP `Runtime` error channel (that would be a feature/new acquisition).

## Commands exercised (all read-only; no lane script, browser, install or VCS write)

| Command | Exit |
|---|---|
| `git -C tabi-shokunin log --oneline -5 e3cf4e0` and `diff --stat 0f24164 e3cf4e0` | 0 |
| `git show e3cf4e0:.ufo/waves/round-22/measure-c1.mjs` (full; plus 0f24164 grep of lines 115/126/133/305/313) | 0 |
| `git show {0f24164,e3cf4e0}:corpus/evidence/round-22/semantic-expectations.json \| sha256sum` (both `4a693dce…`) | 0 |
| `git show e3cf4e0:corpus/evidence/round-21/runtime/na-native-submit.json \| python3` (observation and frame census) | 0 |
| `git show e3cf4e0:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`; producer grep | 0 |
| `git show e3cf4e0:.ufo/waves/round-22/{selftest-c1.mjs,fixtures/expected.json,selftest-pre-repair-0f24164.json,selftest-repair-sandbox.json} \| python3` | 0 |
| `sha256sum` of the three repaired files at both revisions (matches `filesBefore`/`filesAfter`) | 0 |
| `git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` (untracked; read from disk instead) | 128 (pipeline exit 1) |
| `git grep` at e3cf4e0 for mutation-probe receipts | 0 |

**Not run:** `measure-c1.mjs <rev>`, `--selftest`, and the proposed corrections. Every pass or fail result cited above comes from retained receipts, not my own execution.

No tools were installed or updated.
