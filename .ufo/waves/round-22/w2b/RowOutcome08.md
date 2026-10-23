# RowOutcome08 — falsification of row `na-throw` (tabi round-22 / w2b)

- **Reviewed revision:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (read via `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0…:PATH`).
- **Target under attack:** `.ufo/waves/round-22/measure-c1.mjs` (549 lines at that revision) — metric `c1_semantically_checked_lifecycle_rows`.
- **Pinned oracle:** `corpus/evidence/round-22/semantic-expectations.json` (digest pinned at `measure-c1.mjs:22`), row `na-throw` = `mode:"throw"`, `action:"requestSubmit"`, `autosubmit:false`, `responseWindow:"action-to-post"`, `navigation:"none"`, `response:{status:"Error", errorText:"The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"}`, `pre{formActive:true,submitCount:0,statuses:[],errors:[],focused:"go",urlPath:"/na-throw"}`, `post{formActive:false,formExists:true,submitCount:1,statuses:["Error"],errors:["Uncaught Error: dummy submit handler throw"],focused:"go",urlPath:"/na-throw"}`.
- **Retained raw under attack:** `corpus/evidence/round-21/runtime/na-throw.json` (nonce `085b6a21-656a-452a-9a0d-83271e42bc29`, fixture `corpus/evidence/round-21/runtime/na-throw.html`, sha256 `579ab87bfba2cf0acbc954ff4468b6733014ef3fc47ec458a815fb448fb4539e`).
- **Producer (digest-pinned, `measure-c1.mjs:23`):** `scripts/webmcp-lifecycle-round21.mjs`.

## Method (private clone only; lane untouched)

`git clone /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome08`, checkout `e3cf4e0…`. One commit per mutation; the oracle CLI was then run against that commit:

```
node .ufo/waves/round-22/measure-c1.mjs <40-hex-commit>
```

Digests were resealed exactly the way the lane's own harness does it (`.ufo/waves/round-22/selftest-c1.mjs:70-82`): `receipt.cases[].evidence.sha256` ← sha256(mutated raw), `execution.artifacts[rawPath]` ← same, `execution.artifacts[receiptPath]` and `execution.receiptSha256` ← sha256(mutated receipt). No browser, no network, no lane writes. The clone was deleted after the runs (verified absent).

Because `measure-c1.mjs:480-484` blocks **all** rows when any finding exists, a refusal shows up as `verdict:"failed", value:0, exit:1`, and a hole shows up as `verdict:"clean", value:12, exit:0` with `rows[na-throw].counted === true`.

**Result: the outcome semantics of `na-throw` are well defended (24 control mutations refused, listed below), but 6 coherent contradictory mutation classes are still counted as a clean, fully-populated 12/12 metric.** In other words, `c1_semantically_checked_lifecycle_rows` does not distinguish the retained round-21 corpus from a contradicted one for those classes.

---

## F1 — HIGH: the row's nonce is never bound to the pinned fixture bytes, so the whole row can be re-labelled

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:160` (`const nonce = receiptCase.nonce;`), `:161-168` (case-identity block; `:166-167` pin only the *digest* of the fixture file), `:170` (`const inputQ = resolveTokens(expected.inputQ, nonce, nonce);`), `:112-127` (every page-state comparison is made against that nonce).
- **Why it is a real hole, not a fiction:** the producer templates the nonce **into the fixture bytes** (`scripts/webmcp-lifecycle-round21.mjs:110`: `window.observations={nonce:${JSON.stringify(nonce)},…}`), and the oracle pins that fixture file twice (`expected.fixtureSha256` in the digest-pinned expectations, and `sha256(fixtureBytes)` at `measure-c1.mjs:166-167`). So the oracle asserts "this run used exactly this fixture" but never asserts "the fixture's embedded nonce is the nonce in the evidence". The pinned `na-throw.html` contains `nonce:"085b6a21-656a-452a-9a0d-83271e42bc29"` twice; the mutated evidence claims a different nonce, which the pinned fixture could never have produced.
- **Smallest counterexample** (raw + receipt only; fixture bytes untouched, digests resealed):
  ```
  # in corpus/evidence/round-21/runtime/na-throw.json  and  corpus/evidence/round-21/runtime/receipt.json
  replace every "085b6a21-656a-452a-9a0d-83271e42bc29" with "00000000-dead-4000-8000-000000000000"
  # fixture file untouched; its pinned digest still matches
  ```
  Observed (fresh clone, commit `0655405f3a22d3959505b0f368027bcc2ea3f2c2`):
  `cli_exit=0 verdict=clean value=12 findings=[] na-throw.counted=true na-throw.semanticMatch=true`
  and in the mutated evidence: `raw.nonce = 00000000-dead-4000-8000-000000000000`, `tool input q = {"q":"00000000-dead-4000-8000-000000000000"}`, `post.nonce = 00000000-dead-4000-8000-000000000000`, `receipt.nonce = 00000000-dead-4000-8000-000000000000`, while `fixture.sha256` is still `579ab87b…39e` and the fixture text still carries the original nonce.
- **Preserving positive:** pristine `e3cf4e0…` measures `clean / value 12 / exit 0` with all 12 rows counted; the shipped `measure-c1.mjs --selftest` at `e3cf4e0…` reports `verdict:"clean", cases:44, passed:44` (exit 0) in the clone.
- **Smallest fix** (one clause inside the existing identity block at `measure-c1.mjs:161-168`):
  ```js
  !fixtureBytes.includes(nonce) ||
  ```
  → emits `evidence_binding:na-throw:case-identity-or-fixture`. This preserves the positive for **all 12** rows: I verified that every retained fixture contains its receipt nonce (`na-pending`…`auto-invalid`: nonce-in-fixture = True for all 12).

## F2 — MEDIUM-HIGH: `navigation:"none"` is only enforced *inside* the observation window; a retained post-action navigation is invisible

- **Where:** `measure-c1.mjs:309-312` (`actionNavigations = navEvents.filter(frame => frame.at >= receiptCase.after.start && frame.seq < post.seq)` → `unexpected-post-action-navigation`), and `:281` (the receipt's own navigation summary uses the same `seq < post.seq` cut).
- **Why it is a real hole:** the producer records **every** `Page.frameNavigated` event into the raw frames (`scripts/webmcp-lifecycle-round21.mjs:180` registers the CDP listener for the whole case) but windows the receipt summary identically (`scripts/webmcp-lifecycle-round21.mjs:226`). A navigation that lands after the `after-action` observation is therefore retained in the raw, and is excluded from both the oracle's check and the receipt summary — while the expectation for `na-throw` says `navigation:"none"`, `post.urlPath:"/na-throw"`.
- **Smallest counterexample** (raw only; receipt `after.navigations` stays `[]`, which is exactly what the producer would emit for this run):
  ```js
  raw.frames.push({ seq: 17, at: 1792590714419 + 1, dir: 'event', method: 'Page.frameNavigated',
    params: { frame: { id: 'F997389D2C55CAA9A6B8821493E1B74C',
      url: 'http://127.0.0.1:43143/landing?q=085b6a21-656a-452a-9a0d-83271e42bc29',
      mimeType: 'text/html' }, type: 'Navigation' } });
  ```
  Observed (fresh clone, commit `6ce04776144e3af5dce08394dc277fdd423b39d0`): `cli_exit=0 verdict=clean value=12 findings=[] na-throw.counted=true`. The retained raw now contains a navigation to `/landing?q=…` — the very outcome that distinguishes the `na-native-submit` row — while the oracle certifies `navigation:"none"`.
- **Preserving positive / no-harm:** the in-window case is already refused today (control **X7** below: `semantic_navigation:na-throw:unexpected-post-action-navigation`), and the `na-native-submit` landing branch (`:313-322`) is untouched by the fix, so that row keeps counting 12.
- **Smallest fix** (in the `expected.navigation === 'none'` branch at `:311-312`):
  ```js
  if (navEvents.some((frame) => frame.seq > (actionFrame?.seq ?? -1)))
    add('semantic_navigation', 'unexpected-post-action-navigation');
  ```
  (keep the existing windowed check as well, so the error detail stays identical for the in-window case).

## F3 — MEDIUM: the receipt's HTTP request log is never read, so a retained `GET /landing` cannot contradict `navigation:"none"`

- **Where:** `corpus/evidence/round-21/runtime/receipt.json` has a top-level `requests` array (13 entries, produced by `scripts/webmcp-lifecycle-round21.mjs:254` `receipt.requests = requests`), including `{"method":"GET","url":"/na-throw"}` for this case and, for `na-native-submit`, `{"method":"GET","url":"/landing?q=8a5839ad-…"}`. `measure-c1.mjs` contains **zero** reads of `receipt.requests` (grep over the 549-line file matches only the unrelated string `na-requestsubmit` at `:26`).
- **Smallest counterexample** (receipt only; digests resealed):
  ```js
  receipt.requests.push({ at: 1792590714420, method: 'GET', url: '/landing?q=085b6a21-656a-452a-9a0d-83271e42bc29' });
  ```
  Observed: `cli_exit=0 verdict=clean value=12 findings=[] na-throw.counted=true` — the retained HTTP log now shows the case fetched `/landing`, and the oracle still certifies "no navigation".
- **Preserving positive:** the pristine request log has exactly one request per case and no `/landing` for `na-throw`; the `na-native-submit` row owns the only `/landing` request, so the check below does not touch it.
- **Smallest fix:** for rows whose `expected.navigation === 'none'`, require that no request recorded for that case's window starts with `/landing`; the request log is already time-stamped (`at`) and the case windows are already computed at `:264-276`.

## F4 — MEDIUM-LOW: `raw.browserPidsSeenAfterClose` is never read, although the producer records it and the receipt's cleanup claim is checked

- **Where:** the producer sets it at `scripts/webmcp-lifecycle-round21.mjs:87` (`evidence.browserPidsSeenAfterClose = late;`); `measure-c1.mjs:345-349` checks `browserPidsBefore`, `browserPidsAfter`, `contextClosed`, `closeError`, `blocked`, `downloads` — but **not** `browserPidsSeenAfterClose` (0 occurrences in the file), while `receipt.cleanup.browserClosed === true` *is* checked (`:449`).
- **Smallest counterexample** (raw only): `raw.browserPidsSeenAfterClose = [1809431];` → observed `cli_exit=0 verdict=clean value=12 findings=[] na-throw.counted=true`. A retained claim of a surviving browser process is counted, contradicting the receipt's `cleanup.browserClosed:true` that the oracle does check.
- **Preserving positive:** in the pristine corpus `browserPidsSeenAfterClose` is `[]` for all cases, so the added clause keeps the positive at 12.
- **Smallest fix:** in the `case-cleanup-or-boundary` block (`:345-349`) add `|| !equal(raw.browserPidsSeenAfterClose, []) ||`.

## F5 — LOW: `raw.schema` and the process-identity arrays are never validated

- **Where:** 0 occurrences of `raw.schema`, `processIdentities`, `processIdentitiesAtLaunch`, `browserPidsAtClose` in `measure-c1.mjs`; the producer writes `schema:'tabi-round21-case-v1'` (`scripts/webmcp-lifecycle-round21.mjs:161`) and the identity arrays (`:170`, `:87-92`).
- **Smallest counterexamples:** `raw.schema = 'tabi-round21-case-v1-forged'` → `clean/12`; and `raw.browserPidsBefore = [1,2,3]` with `processIdentitiesAtLaunch = [{pid:1,startTicks:'1'}]` and `processIdentities`/`browserPidsAtClose` rewritten to match → `clean/12` (only "non-empty array of positive integers" is required by `:345-347`).
- **Preserving positive:** pristine values satisfy both proposed checks.
- **Smallest fix:** `if (raw.schema !== 'tabi-round21-case-v1') add('evidence_binding','case-identity-or-fixture');` plus a check that `processIdentitiesAtLaunch` covers `browserPidsBefore`.

## F6 — LOW: page-observation value key sets are not constrained, so an observation may carry a field that contradicts the pinned expectation

- **Where:** `measure-c1.mjs:107-145` (`validatePageState`) checks the keys it knows (`secureContext/formActive/formExists/value/focused` at `:112-114`, `nonce` at `:119`, `submits` at `:121-127`, `errors` at `:129`, `url` at `:132-144`) but never asserts the observation's **key set**. The producer's shape is fixed (`scripts/webmcp-lifecycle-round21.mjs:189`: `{...window.observations, url, secureContext, formExists, formActive, value, focused}` over `window.observations = {nonce, submits, errors}`).
- **Smallest counterexample** (raw post observation + receipt `after.pageState`, both resealed): add `"statuses": ["Completed"]` to the `after-action` observation value. The pinned expectation says `post.statuses === ["Error"]`; the oracle derives statuses only from the CDP response frames (`:258-260`), never from the observation. Observed: `cli_exit=0 verdict=clean value=12 findings=[] na-throw.counted=true`.
- **Preserving positive:** pristine observations carry exactly the producer's nine keys, so a key-set assertion keeps the positive at 12.
- **Smallest fix:** assert the observation value's key set equals `{nonce, submits, errors, url, secureContext, formExists, formActive, value, focused}` (with the `na-native-submit` landing exception already handled at `:117-119`), or, if a `statuses` key is tolerated, cross-check it against the frame-derived statuses (`:258-260`).

---

## Controls — what the oracle *does* refuse (all with digests resealed)

| # | Mutation (row `na-throw` unless noted) | Oracle finding | Refusing code (revision `e3cf4e0…`) |
|---|---|---|---|
| X1 | response `status` `Error`→`Completed` (+ `output`) | `semantic_status:…:outcome-status`, `semantic_error:…:exact-error-text-or-output-presence`, `semantic_status:…:finite-window-response-statuses` | `:291`, `:296-298`, `:258-260` |
| X2 | `errorText` reworded | `semantic_error:…:exact-error-text-or-output-presence` | `:293-298` (exact `equal(response.params, expectedParams)`) |
| L | extra `output` key added to the response params | `semantic_error:…:exact-error-text-or-output-presence` | `:293-298` |
| X3 | `post.errors` reworded | `semantic_error:…:post:page-errors` | `:129` |
| X4 | `post.formActive` → `true` | `semantic_status:…:post:form-state` | `:112-114` |
| T | `post.formExists` → `false` | `semantic_status:…:post:form-state` | `:112-114` |
| N | `post.secureContext` → `false` | `semantic_status:…:post:form-state` | `:112` |
| I | `post.focused` → `""` | `semantic_status:…:post:form-state` | `:114` |
| X5 | `post.submits` → `[]` | `semantic_status:…:post:submit-event` | `:124-127` |
| J | `pre.submits` → one entry | `semantic_status:…:pre:submit-event` | `:124-127` |
| S | `pre.nonce` key deleted | `semantic_status:…:pre:nonce-state` | `:119` |
| X6 | `post.url` gains `?x=1` | `semantic_navigation:…:post:url` | `:140` |
| X7 | `Page.frameNavigated` inserted **inside** the window | `semantic_navigation:…:unexpected-post-action-navigation`, `evidence_binding:…:receipt-navigation-summary` | `:309-312`, `:281` |
| X8 | response frame deleted | `semantic_status:…:response-count`, `semantic_status:…:finite-window-response-statuses` | `:289`, `:258-260` |
| X12 | response frame moved before the action | `semantic_timing:…:response-outside-action-window`, `semantic_timing:…:frame-sequence-or-clock` | `:306-307`, `:174-175` |
| M | response frame `at` set after the post observation | `semantic_timing:…:frame-sequence-or-clock` | `:174-175` |
| X9 | `raw.mode` → `reject` | `evidence_binding:…:case-identity-or-fixture` | `:164-168` |
| X11 | nonce changed in the raw only (receipt untouched) | `evidence_binding:…:case-identity-or-fixture` (+8 more) | `:160-168` |
| P | receipt `invocationId` forged | `evidence_binding:…:invocation-id-cross-link`, `…:current-invocation-chain` | `:229-230`, `:222-228` |
| Q | receipt `preAction.windowMs` forged | `semantic_timing:…:finite-summary-windows` | `:264-276` |
| R | `raw.downloads` non-empty | `evidence_binding:…:case-cleanup-or-boundary` | `:345-349` |
| X10 | fixture bytes edited (`throw`→`success`) | `evidence_binding:acquisition-artifact:…na-throw.html`, `evidence_binding:…:case-identity-or-fixture` | `:433-436`, `:166-167` |
| — | expectations file edited | `input_shape:…:semantic-expectations-digest` (global block) | `:392-393`, `:22` |
| — | producer file edited | `evidence_binding:…:producer-digest` | `:414`, `:23` |
| — | receipt digest not resealed | `evidence_binding:…:acquisition-receipt-digest` | `:430-431` |

Also verified as **positive controls**: the metric is computed from exactly one pinned revision — the CLI accepts only a 40-hex commit, re-resolves it with `rev-parse --verify` and rejects an identity mismatch (`:507-512`), the producer is digest-pinned (`:23`), the expectations file is digest-pinned (`:22`), and the oracle note's first line must equal the pinned `source:` header (`:397-399`). No rerouting or second runtime was observed.

Historical cross-check (exercised in the clone): the pre-repair oracle at `0f24164be77e72ba359fe4befdc42d96bc343034` measured `failed / value 0 / exit 1` with `semantic_error:na-native-submit:post:page-errors` and `semantic_navigation:na-native-submit:post:url`; the repaired oracle at `e3cf4e0…` measures `clean / value 12 / exit 0` over the same retained corpus. The 0→12 transition is reproducible.

## Commands exercised (all inside `/tmp/tabi-r22-w2b-RowOutcome08`, since deleted)

| Command | Exit | Result |
|---|---|---|
| `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `verdict:clean value:12 findings:[]`, all 12 rows `counted:true` |
| `node .ufo/waves/round-22/measure-c1.mjs 0f24164…` with the `0f24164` oracle script | 1 | `verdict:failed value:0`, findings `semantic_error:na-native-submit:post:page-errors`, `semantic_navigation:na-native-submit:post:url` |
| `node .ufo/waves/round-22/measure-c1.mjs --selftest` (at `e3cf4e0…`) | 0 | `verdict:clean cases:44 passed:44`; the `positive` case expects `value:12 clean` and passes |
| `node .ufo/waves/round-22/measure-c1.mjs <mutated-commit>` × 30 mutation commits | 0 for the 6 hole classes, 1 for all 24 controls | see tables above |

## Residual risk and verification gaps

1. **Scope.** These are oracle-enforcement defects in the counterfactual: the metric value at the pinned revision is honest and reproducible (`clean/12`), and nothing here shows the retained round-21 corpus to be wrong. What is not supported is the *enforcement* (the "failure-capable durable enforcement" wording of `.ufo/waves/round-22/claim-classification.json`): for F1–F6 a contradicted corpus still measures 12/12 clean.
2. **Not run / cannot run here.** No browser was launched (out of scope); no claim about actual Chromium/WebMCP behaviour was made. The lane's own serial runner `.ufo/waves/round-22/run-checks.py` was **not** executed in the clone (it resolves lane-relative cohort receipts and the fleet environment); only the oracle CLI and its shipped selftest were run. `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` was not re-derived against the raw corpus (only its pinned first-line header was checked, via the CLI's `source_binding` gate).
3. **Blast radius of a fix.** `measure-c1.mjs:480-484` blocks *every* row when any single finding exists, so each proposed check must be added in a way that cannot fire on the pristine corpus; for F1 I verified all 12 fixtures embed their nonce, and for F2/F3/F4 the pristine values are `[]`/absent as required.
4. **Cross-row generality.** All six classes were exercised on `na-throw` only; the same code paths serve the other 11 rows, so the same holes are expected there — that is other seats' scope, not verified here.
5. **Author-authenticity questions** (whether the round-21 run really happened as recorded) are out of scope for this seat and were not assessed; only the oracle's ability to refuse a contradictory retained corpus was tested.

## Smallest fix, consolidated (one line each)

| Finding | One-line addition | Location |
|---|---|---|
| F1 | `!fixtureBytes.includes(nonce) \|\|` in the identity condition | `measure-c1.mjs:161-168` |
| F2 | `if (navEvents.some((f) => f.seq > (actionFrame?.seq ?? -1))) add('semantic_navigation','unexpected-post-action-navigation');` | `measure-c1.mjs:311-312` |
| F3 | for `expected.navigation === 'none'`, reject any receipt request for `/landing` in the case window | new clause near `measure-c1.mjs:265-276` |
| F4 | `\|\| !equal(raw.browserPidsSeenAfterClose, [])` | `measure-c1.mjs:345-349` |
| F5 | `if (raw.schema !== 'tabi-round21-case-v1') add('evidence_binding','case-identity-or-fixture');` | `measure-c1.mjs:161-168` |
| F6 | assert the observation key set (producer shape) / cross-check an observation `statuses` key against `:258-260` | `measure-c1.mjs:107-145` |

Report path: `.ufo/waves/round-22/w2b/RowOutcome08.md` (absolute: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/w2b/RowOutcome08.md`).
