# RowOutcome11 — `auto-positive` row of the repaired C1 oracle: contradictory raw forgeries that still count

Seat: `TabiR22-2.RowOutcome11-12` (reviewer, leaf). Revision under review:
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Author-side falsification, not
non-author admission.

All production bytes were read through
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0…:PATH` or from
a private throwaway clone `/tmp/tabi-r22-w2b-RowOutcome11` (cloned from the lane,
`git checkout e3cf4e0…`, deleted after this report). No browser, no installs, no
delegation, no seat messaging, no VCS mutation of the lane or the fleet. The
only lane write is this report. No tool was installed or updated.

## 1. Axes named

- **A. Response-semantic refusal** — does the oracle refuse a changed
  `status` / `output` / `errorText` on the invocation-correlated response?
- **B. Pre/post page-state refusal** — does it refuse a changed pre-action or
  after-action page state (form/value/submits/errors/focus/url/secureContext)?
- **C. Navigation refusal** — does it refuse a raw that contradicts the pinned
  `navigation` expectation, in the raw event stream as well as in the page URL?
- **D. Finite-response-window refusal** — does it refuse a response that is not
  inside the declared finite window, or that is not ordered after the invocation
  it is correlated with?
- **E. Binding refusal** — does it bind the case schema, the tool declaration
  and the browser-process cleanup/identity evidence it retains?
- **F. Positive preservation** — every proposed fix must leave the pristine
  corpus at `value = 12` and must not change the measured revision.

## 2. Verdict

**The response and page-state dimensions (A, B) are genuinely refusal-capable.
The navigation-event dimension (C), the invocation/response ordering inside the
finite window (D), the tool-declaration and binding dimensions (E) are not:
five coherent, contradictory raw mutations — with digests resealed through the
receipt and the acquisition record exactly the way the lane's own selftest
reseals them — are still counted, and the metric stays at 12.**

This is an actual defect in the instrument, not a malicious-author question.
The pinned note states the contract the instrument must satisfy
(`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:24-25`):

> independent of the evaluated receipt: a coherently changed raw event and
> summary, with corrected digest links, must still fail the case's semantic
> expectation.

The counterexamples below change **only** the retained evidence (the pinned
expectations file cannot change: its digest is pinned at
`.ufo/waves/round-22/measure-c1.mjs:22` and re-checked at `:392-393`), and the
row still counts. The C1 OPERABILITY axis claims *failure-capable* semantic
rows; for the `auto-positive` row it demonstrates that for status/output/
errorText/page-state, and does not demonstrate it for navigation events,
invocation↔response ordering, the tool's autosubmit declaration, the case
schema, or the cleanup evidence.

Nothing here changes the current measurement: the pristine corpus is genuine and
`value = 12` is correct for it. The finding is that the instrument's
failure-capability claim is broader than the refusals it actually performs.

### Refusal matrix (executed, revision `e3cf4e0`, row `auto-positive`)

| Dimension | Mutation | Refused? | Refusing code |
|---|---|---|---|
| A status | `Completed`→`Failed`/`Pending`/`Canceled`/`Error` | yes | `measure-c1.mjs:289,291` (+`:259-260`) |
| A output | `ok`→false / `ok`→`1` / `q`→wrong / `nonce`→wrong / array-collapse / extra key / missing | yes | `:293-296,298` |
| A errorText | `output` replaced by `errorText` (this row expects `output`) | yes | `:294,296,298` |
| B pre/post page state | `value`, `errors`, `formActive`, `formExists`, `focused`, `secureContext`, `nonce`, `submits`, `url` mutated in frame **and** mirror **and** receipt summary | yes | `:112-114`, `:119-120`, `:121-128`, `:129-130`, `:131-145` |
| C navigation (page URL) | post/pre `url` → `/landing`, fragment, other origin, extra query | yes | `:140-141` |
| **C navigation (event)** | **main-frame `Page.frameNavigated` inserted into the raw (to `/landing`, or a reload)** | **NO — counted** | — |
| D window placement | response moved after the pre-action observation | yes | `:259-260`, `:271-276`, `:304-305` |
| D window count | duplicate / deleted response frame | yes | `:289`, `:271` |
| D other invocation | second response with a foreign `invocationId` | yes | `:256` |
| **D ordering** | **response frame moved before the `WebMCP.invokeTool` command** | **NO — counted** | — |
| **E tool declaration** | **`toolsAdded` `annotations.autosubmit` → false / removed** | **NO — counted** | — |
| **E case schema** | **`raw.schema` → `tabi-round21-case-v2`** | **NO — counted** | — |
| **E cleanup/identity** | **`browserPidsSeenAfterClose` non-empty / `browserPidsAtClose` emptied / `processIdentities` emptied** | **NO — counted** | — |
| E case identity | `raw.mode`/`raw.autosubmit` mutated | yes | `:161-168` |
| E receipt identity | receipt `invocationId` mutated | yes | `:229-230` |
| E receipt summary | receipt `after.navigations` claims an absent navigation | yes | `:282` |

## 3. Findings

### F-N1 (high) — A main-frame navigation contradicting `navigation: "none"` is still counted

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:309-326` (the whole navigation
  expectation), against the pinned expectation
  `corpus/evidence/round-22/semantic-expectations.json:173`
  (`"navigation": "none"` for `auto-positive`, case block at `:163-173`).
- **Defect:** the navigation expectation is evaluated **only over the receipt's
  post-action window**:

  ```js
  309  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
  310    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
  311  if (expected.navigation === 'none') {
  312    if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
  ```

  `navEvents` (`:236`) contains **every** `Page.frameNavigated` event in the raw,
  but only the subset inside `receiptCase.after.start … post.seq` is ever tested.
  A navigation anywhere else in the case — before the action, or before the
  receipt's window opens — is never examined. For `auto-positive` the window
  opens at `receiptCase.after.start = 1792590716965` (forced: `start ≥ pre.at`
  and `start ≤ actionFrame.at` are both `1792590716965`, and `post.at -
  start ∈ [500,10000]`), so every earlier navigation is invisible.
- **Smallest counterexample** (one frame inserted into
  `corpus/evidence/round-21/runtime/auto-positive.json`, digests resealed):

  ```json
  { "seq": 12, "at": 1792590716712, "dir": "event", "method": "Page.frameNavigated",
    "params": { "frame": { "id": "F3C0371BCCA1541F1D77BAF77C53116B",
                           "loaderId": "CAFEBABE",
                           "url": "http://127.0.0.1:43143/landing?q=87f23377-4b21-45d9-b50b-2845277ff7d4",
                           "mimeType": "text/html" }, "type": "Navigation" } }
  ```

  inserted before the current `WebMCP.toolResponded` frame (seq 12), the
  following frames' `seq` renumbered 12→13 … 16→17, and the two
  `raw.pageObservations[].seq` mirrors updated (required by `:178-181`).
  Resealing is the same three-step the lane's own selftest performs
  (`selftest-c1.mjs:63-77`): `receipt.cases[auto-positive].evidence.sha256`,
  `execution.artifacts[…/auto-positive.json]`,
  `execution.artifacts[receipt]` and `execution.receiptSha256`.
- **Result (executed):** `value = 12`, `verdict = clean`, `exit = 0`,
  `findings = []`, row `auto-positive` `counted = true`. The oracle reports
  `outcome: "Completed"` and no finding of any kind.
- **Why it is contradictory (three independent ways, all inside the retained
  evidence):**
  1. The pinned expectation says `navigation: "none"`.
  2. The raw's own later observations still show the pre-navigation document:
     `url = http://127.0.0.1:43143/auto-positive`, `nonce` present,
     `submits[0]` present (`:129-130` and `:112-114` compare the observation
     values, and the forged navigation destroys exactly those recorders — the
     same reasoning the round-22 repair itself relies on for the
     `na-native-submit` landing, `:115-117`).
  3. The **server-side HTTP request log** retained in the same receipt
     (`corpus/evidence/round-21/runtime/receipt.json` → `requests`, produced by
     `scripts/webmcp-lifecycle-round21.mjs:131-133`) shows exactly one GET per
     case and a single `GET /landing?q=8a5839ad-…` at `1792590710188` — for
     `na-native-submit`. There is **no** `GET /landing` for `auto-positive`, so
     a navigation to `/landing` in the raw is refuted by retained, digest-sealed
     evidence in the same file. The oracle never reads `receipt.requests`
     (`grep -n requests .ufo/waves/round-22/measure-c1.mjs` → no hit outside
     `CASE_IDS`), so this independent corroboration is inert.
- **Also counted (same class):** a same-URL **reload** of the main frame
  (new `loaderId`, same `/auto-positive`) — it would also wipe the fixture's
  in-page nonce/submit recorders; and a fully coherent forgery that *also*
  inserts the matching `GET /landing` into `receipt.requests` (the receipt is
  then self-consistent, and the row still counts, because only the raw's own
  navigation count is at issue).
- **Preserving positive:** the pristine corpus still measures
  `value = 12 / verdict clean / exit 0` at `e3cf4e0` — the row is genuine; only
  the instrument's refusal is defective.
- **Smallest fix (validated):** make the navigation expectation case-wide
  instead of window-scoped, at `:309-312`:

  ```js
  const laterNavigations = navEvents.slice(1);   // every navigation after the initial load
  if (expected.navigation === 'none') {
    if (actionNavigations.length !== 0 || laterNavigations.length !== 0)
      add('semantic_navigation', 'unexpected-post-action-navigation');
  ```

  Verified in the throwaway clone: pristine stays `value = 12`; the three
  forged-navigation variants above flip to `refused, value = 0` with
  `semantic_navigation:auto-positive:unexpected-post-action-navigation`. The
  retained corpus supports this: every row has exactly one `Page.frameNavigated`
  event except `na-native-submit`, which has exactly two (initial + landing).
  *Defense in depth (not required for the fix):* bind `receipt.requests` to the
  raw's navigation URLs, so a receipt-only request-log forgery is refused too.

### F-N2 (high) — A response that precedes its own invocation is still counted

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:219-228` (the
  `current-invocation-chain` check) and `:285-301` (the response comparison).
- **Defect:** the oracle verifies the order `sent < commandResult < invoked <
  pre-action` (`:227`) and correlates the response to the invocation by
  `invocationId` (`:255`), but **never compares the response frame's position
  with the invocation frames**. A response that is sequenced *before* the
  `WebMCP.invokeTool` command is accepted, and the oracle's own output prints
  the contradiction it failed to notice.
- **Smallest counterexample:** move the `WebMCP.toolResponded` frame (params
  unchanged) to the position before the `WebMCP.invokeTool` frame, set its
  `"at"` to `1792590716711`, renumber `seq` 1..N, update the two
  `pageObservations[].seq` mirrors; reseal the three digests.
- **Result (executed):** `value = 12`, `verdict = clean`, `exit = 0`,
  `findings = []`, row counted — and the oracle's own row report is
  `sequence = {"invocation": 12, "preAction": 13, "action": 14, "response": 9,
  "release": null, "postAction": 16}`: **the response precedes the invocation
  by three frames and the oracle counts the row as semantically checked.** The
  forged response also falls one millisecond *before* the receipt's declared
  pre-action window opens (`receipt.preAction.start = 1792590716712`), while
  the receipt still claims `preAction.responseCount = 1` — the window's
  response accounting is time-blind (`:271` compares the count against a
  seq-filtered list, not against the window's own bounds).
- **Preserving positive:** pristine corpus `value = 12` unchanged.
- **Smallest fix (validated, two independent options):**
  - *(ordering)* `if (matchingResponses[0] && invokedFrame &&
    !(invokedFrame.seq < matchingResponses[0].seq)) add('semantic_timing',
    'response-before-invocation');` — pristine `12`, the forgery refused.
  - *(window containment)* extend `:271` with
    `(expected.responseWindow === 'pre-action' && beforePre.some((frame) =>
    frame.at < preSummary.start || frame.at > preSummary.end))` — pristine `12`
    (the two `pre-action` rows keep their response inside `[start, end]`; the
    other rows are unaffected because their `responseWindow` is not
    `pre-action`), the forgery refused. The `na-delayed` case keeps its
    post-release response because its expectation is not `pre-action`.

### F-N3 (medium) — The tool's autosubmit declaration is never checked

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:216` (`lifecycleTools` filter)
  and `:219-228` (the only assertions made about the tool object). The word
  `annotations` never appears in the oracle.
- **Defect:** `expected.autosubmit` is bound only to `raw.autosubmit` and
  `receiptCase.autosubmit` (`:161-162`). The *evidence* that the lifecycle tool
  was declared autosubmit — the `toolsAdded` event's
  `params.tools[0].annotations.autosubmit`, which is the browser's report of
  the fixture's `toolautosubmit` attribute — is never read.
- **Smallest counterexample:** in the `toolsAdded` frame change
  `"annotations": {"autosubmit": true}` to `{"autosubmit": false}` (or delete
  the key); reseal.
- **Result (executed):** `value = 12`, `verdict = clean`, `findings = []`, row
  counted — even though the pinned expectation says
  `"autosubmit": true` (`semantic-expectations.json:164`) and the digest-pinned
  fixture `corpus/evidence/round-21/runtime/auto-positive.html` declares
  `toolautosubmit` on the form. The note lists exactly this confusion as a
  reject category for the sibling row (`…oracle-round-22.md:48`,
  "toolautosubmit-guarantees-success") and calls this row a
  "held-ground control" (`:47`); a forged "not autosubmit" declaration now
  passes unnoticed.
- **Smallest fix (validated):** add to `:223`
  `Boolean(lifecycleTools[0]?.annotations?.autosubmit) !== expected.autosubmit ||`
  — pristine `12`; the two forgeries refused. The retained corpus supports it:
  the two `auto-*` rows carry `annotations.autosubmit = true`, the ten `na-*`
  rows carry no autosubmit annotation.

### F-N4 (low-medium) — The per-case raw schema is never checked

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:161-168`. The receipt's schema
  *is* checked (`:446`), the case raw's `schema` field is not: `raw.schema`
  appears nowhere in the oracle.
- **Counterexample:** `"schema": "tabi-round21-case-v1"` →
  `"tabi-round21-case-v2"` in `corpus/evidence/round-21/runtime/auto-positive.json`;
  reseal. **Result (executed):** `value = 12`, `verdict = clean`, `findings = []`,
  row counted — a file that self-declares a different artifact schema is still
  admitted as a `tabi-round21-case-v1` row.
- **Smallest fix (validated):** add `raw.schema !== 'tabi-round21-case-v1' ||`
  to the identity condition at `:161` — pristine `12`, forgery refused (all 12
  retained raws declare that schema).

### F-N5 (low-medium) — Browser-process cleanup and identity evidence is never checked

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:345-349`. Only
  `browserPidsBefore` (non-empty), `browserPidsAfter` (`[]`), `contextClosed`,
  `closeError`, `blocked` and `downloads` are examined.
  `browserPidsAtClose`, `browserPidsSeenAfterClose` and `processIdentities` are
  retained in every raw and are read by nothing.
- **Counterexamples (each resealed separately, all counted):**
  - `"browserPidsSeenAfterClose": []` → `[1810050]` — the raw then claims the
    browser process was still alive after close, contradicting
    `browserPidsAfter: []` and `contextClosed: true`.
  - `"browserPidsAtClose": [9 pids]` → `[]` — the raw then claims no browser
    process existed at close, contradicting `browserPidsBefore`.
  - `"processIdentities": [9 entries]` → `[]` — the pid→startTicks identity
    evidence (the thing that makes the PID list trustworthy) is gone.
  All three leave `value = 12`, `verdict = clean`, `findings = []`.
- **Smallest fix (validated):** extend `:345-349` with
  `!equal(raw.browserPidsAtClose, raw.browserPidsBefore) ||`,
  `!equal(raw.browserPidsSeenAfterClose, []) ||` and
  `!Array.isArray(raw.processIdentities) || raw.processIdentities.length !== raw.browserPidsBefore.length`
  — pristine `12`; the three forgeries refused (all 12 retained raws have
  `pidsAtClose = 9 = pidsBefore`, `pidsSeenAfterClose = 0`, `identities = 9`).

### F-N6 (low) — The receipt's server-side request log and the receipt's `mode` are never used

- **Where:** `.ufo/waves/round-22/measure-c1.mjs:443-456` (receipt envelope) and
  `:161-168` (case identity).
- **Defect:** `receipt.requests` — the fixture server's own HTTP log
  (`scripts/webmcp-lifecycle-round21.mjs:131-133`), the one *independent*
  corroboration of navigation in the whole evidence set — is never read. So is
  `receiptCase.mode`.
- **Counterexamples (resealed, both counted):**
  - Insert `{ "at": 1792590716712, "method": "GET", "url":
    "/landing?q=87f23377-4b21-45d9-b50b-2845277ff7d4" }` into
    `receipt.requests` with the raw untouched: the receipt then claims a
    navigation the raw does not contain, and the row is still counted.
  - `receipt.cases[auto-positive].mode`: `"success"` → `"failure"`: the receipt
    and the raw then disagree about the case's mode, and the row is still
    counted (`raw.mode` is checked at `:163`, the receipt's copy is not).
- **Smallest fix:** compare `receiptCase.mode` with `expected.mode` in the
  identity condition (`:161-168`), and cross-check the raw's navigation URLs
  against `receipt.requests` (which would have refused F-N1's forgery without
  any change to the raw).

## 4. Negative results — what the oracle does refuse, with the exact lines

- **Response status** (`Completed`→`Failed`/`Pending`/`Canceled`/`Error`, with
  the receipt's `after.responses` kept consistent): `semantic_status:
  auto-positive:outcome-status` ← `:291`; also
  `semantic_status:auto-positive:finite-window-response-statuses` ← `:259-260`.
- **Response output** (`ok`→false, `ok`→`1`, `q`→wrong, `nonce`→wrong,
  object→array collapse, extra key, missing `output`):
  `semantic_output:auto-positive:exact-output-shape` ← `:293-296,298`
  (the whole `params` object is deep-compared against
  `{invocationId, status, output}`).
- **`errorText` in place of `output`** (this row's expectation has no
  `errorText`): `semantic_output:auto-positive:exact-output-shape` ← `:294,296`.
  (The mirrored `semantic_error` branch at `:297` belongs to the
  `errorText`-bearing rows — `auto-invalid`, `na-reject`, `na-throw`,
  `na-reset`, `na-remove`, `na-invalid-submit` — which are out of this seat's
  scope; the lane's own selftest exercises that branch
  (`fixtures/expected.json` → `missing-error-text-*`, `finding:
  "semantic_error"`). I did not re-run those rows.)
- **Pre/post page state** (frame value, its `pageObservations` mirror and the
  receipt's `after.pageState`/`after.submits` all mutated together, so only
  `validatePageState` can refuse): `pre/post:form-state` ← `:112-114`;
  `pre/post:nonce-state` ← `:117-120`; `pre/post:submit-event` ← `:121-128`;
  `pre/post:page-errors` ← `:129-130`; `pre/post:url` ← `:131-145`.
  Adding an *unknown* key to the observation value is not refused (`:107-146`
  compares nine named keys and ignores the rest) — not a contradiction, so not
  a finding.
- **Page-state URL** → `/landing`, `#fragment`, other origin, extra query:
  `pre/post:url` ← `:140-141` (origin, path, search, hash, credentials).
- **Finite-window placement/count**: response moved after the pre-action
  observation → `semantic_timing:auto-positive:autosubmit-not-before-pre-action`
  ← `:304-305`, plus `finite-window-response-statuses` ← `:259-260` and
  `finite-summary-windows` ← `:271-276`; duplicated or deleted response →
  `semantic_status:auto-positive:response-count` ← `:289`; response for a
  foreign invocation → `evidence_binding:auto-positive:response-other-invocation`
  ← `:256`.
- **Case identity**: `raw.mode`, `raw.autosubmit`, a changed fixture digest, a
  wrong `invocationId` → `evidence_binding:auto-positive:case-identity-or-fixture`
  ← `:161-168`; receipt `invocationId` → `current-invocation-chain` /
  `invocation-id-cross-link` ← `:219-230`; receipt `after.navigations` claiming
  an absent navigation → `receipt-navigation-summary` ← `:282`; emptied
  `browserPidsBefore` → `case-cleanup-or-boundary` ← `:345-349`.
- **Positive control**: `node .ufo/waves/round-22/measure-c1.mjs
  e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` → `exit 0`,
  `value = 12`, `verdict = "clean"`, `findings = []`, 12 of 12 rows `counted`.
- **Lane selftest** (in the throwaway clone): `node
  .ufo/waves/round-22/measure-c1.mjs --selftest` → `exit 0`,
  `cases 44, passed 44, verdict clean`. The selftest's negative-control matrix
  (`fixtures/expected.json`) covers status, output, errorText, native-submit
  landing/submits/errors, delayed timing, short windows, case-set, header,
  producer/acquisition/raw digests, malformed inputs and the legacy oracle —
  **but no navigation-event insertion for a `navigation: "none"` row, no
  response-before-invocation reordering, no autosubmit-annotation mutation, no
  case-schema mutation and no cleanup/identity mutation.** The holes above are
  therefore not covered by the wave's own negative controls either.

## 5. Smallest fixes, as one patch (all validated in the throwaway clone)

Each fix was applied alone to a copy of the oracle and the full battery re-run.
Every fix keeps the pristine corpus at `value = 12 / clean / exit 0` and refuses
its target forgery:

| Fix | Location | Effect |
|---|---|---|
| `const laterNavigations = navEvents.slice(1);` and test it in the `navigation === 'none'` branch | `:309-312` | refuses F-N1 (3 forgery shapes) |
| `if (matchingResponses[0] && invokedFrame && !(invokedFrame.seq < matchingResponses[0].seq)) add('semantic_timing','response-before-invocation');` | after `:254` | refuses F-N2 (ordering variant) |
| `(expected.responseWindow === 'pre-action' && beforePre.some((frame) => frame.at < preSummary.start || frame.at > preSummary.end))` | `:271` | refuses F-N2 (window variant) |
| `Boolean(lifecycleTools[0]?.annotations?.autosubmit) !== expected.autosubmit` | `:223` | refuses F-N3 |
| `raw.schema !== 'tabi-round21-case-v1'` | `:161` | refuses F-N4 |
| `!equal(raw.browserPidsAtClose, raw.browserPidsBefore)`, `!equal(raw.browserPidsSeenAfterClose, [])`, `processIdentities.length !== browserPidsBefore.length` | `:345-349` | refuses F-N5 |
| `receiptCase.mode !== expected.mode`; bind `receipt.requests` to the raw's navigations | `:161-168`, `:236-244` | refuses F-N6 |

Applying the first six together leaves only non-contradictory mutations counted
(an extra unknown page-state key, a foreign second tool, an emptied
`inputSchema.required`, a response stamped at the same millisecond as the
pre-action snapshot, and a receipt `mode` typo) — none of which contradicts a
pinned expectation.

## 6. Residual risk and verification gaps

- **Risk that survives every fix listed above:** the raw's `frames` are trusted
  for their *content* but the corpus is still the author's own acquisition; the
  oracle is a self-consistency instrument over retained bytes, not a publisher
  authentication. The note already disclaims that
  (`…oracle-round-22.md:26-27`, `:113-114`), so this is not a new finding — but
  it means the C1 claim must stay worded as "semantically checked rows over
  retained round-21 observations", not as authenticity.
- **Not verified here:** the other eleven rows' semantics (this seat's scope is
  the `auto-positive` row). F-N1/F-N2/F-N3 are structurally per-case and would
  apply to every row (each row has its own `navigation`, `responseWindow` and
  tool declaration); F-N4/F-N5/F-N6 are per-case fields. A full-cohort run of
  the same batteries is unclaimed here.
- **Not run:** no browser, no new acquisition, no `run-checks.py` cohort rerun,
  no fleet-level gate, no SCORECARD/LOG edit. The lane's own `run-checks.py`
  needs a fleet clone and the two serial cohort receipts already retained
  (`.ufo/waves/round-22/checks-at-e3cf4e0.json`, 35/35) were not recomputed.
- **Environment note:** `/tmp` reached 100% full during this seat (other
  seats' throwaway directories); the clone was retried after space was
  released. No file outside my throwaway clone and this report was written.

## 7. Reproduction recipe (harness deleted with the clone)

1. `git clone /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome11`
   and `git checkout e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`.
2. Load the oracle's `INPUT_PATHS` from the working tree, mutate
   `corpus/evidence/round-21/runtime/auto-positive.json` in memory, and
   re-serialize with `JSON.stringify(obj, null, 2) + '\n'` (verified
   byte-identical to the retained files: raw
   `62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe`,
   receipt
   `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`,
   execution
   `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`).
3. Reseal: `receipt.cases[auto-positive].evidence.sha256 = sha256(raw)`,
   `execution.artifacts[raw path] = sha256(raw)`,
   `execution.artifacts[receipt path] = sha256(receipt)`,
   `execution.receiptSha256 = sha256(receipt)`.
4. Call the exported `evaluate(files)` from
   `.ufo/waves/round-22/measure-c1.mjs` and read `result.rows.find(r =>
   r.id === 'auto-positive').counted` and `result.value`.

## 8. Commands executed (all inside the throwaway clone)

| Command | Exit | Result |
|---|---|---|
| `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `value 12`, `verdict clean`, 12/12 rows counted |
| `node .ufo/waves/round-22/measure-c1.mjs --selftest` | 0 | `cases 44, passed 44, verdict clean` |
| `node harness/battery2.mjs` (A-series + R-series, pristine oracle) | 0 | 56 mutations: **16 counted**, 40 refused |
| `node harness/battery3.mjs` (page state, fully resealed) | 0 | 18 refused, 1 non-contradictory mutation counted |
| `node harness/battery4.mjs` (response status/output/errorText, fully resealed) | 0 | 14 refused, 0 counted |
| `node harness/census.mjs` | 0 | per-row invariants used to validate the proposed fixes |
| `node harness/battery2.mjs` against each patched oracle variant (F1, F2, F3, F4, F5, F1F2F3F4F5) | 0 | every patched variant keeps pristine at 12 and refuses its target forgery |

No tool was installed or updated; `node` was the lane's own
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`
(v24.21.0).

Report: .ufo/waves/round-22/w2b/RowOutcome11.md
