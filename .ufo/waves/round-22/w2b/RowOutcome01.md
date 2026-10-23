# RowOutcome01 — falsification of the round-22 C1 oracle, row `na-pending`

**Reviewed revision:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed)
**Target under attack:** `.ufo/waves/round-22/measure-c1.mjs` (the repaired oracle)
**Pinned expectations:** `corpus/evidence/round-22/semantic-expectations.json` (sha256 `4a693dce…b60e1e`, pinned by `measure-c1.mjs:22`)
**Retained raw under attack:** `corpus/evidence/round-21/runtime/na-pending.json`
**Attack dimension:** exact status/output/errorText, pre/post page state, navigation, finite response window
**Verdict type:** author-side falsification, recommendation only — no integration, no lane write except this report.

---

## 1. Verdict

**The row's semantic outcome could not be falsified.** No mutation that changes what the
retained record *says about the outcome* survives the oracle: every terminal-response
channel (raw event, receipt-only summary, foreign invocation, out-of-window event,
param-less event) is refused with a specific finding, and the page-state, submit,
navigation and window contracts are all pinned by the expectations and enforced. 24 of the
36 attacked mutation classes are refused; the 12 that still count clean are itemised below.

**The oracle's completeness is nevertheless weaker than the oracle's own note claims.**
Two identified classes produce a *self-contradictory* corpus that the reviewed oracle
still reports as `value 12 / verdict clean / exit 0`:

* **F1** — the receipt's server-side HTTP request log (`receipt.requests`) is never read
  by the oracle, so a fabricated `GET /landing?q=<case nonce>` **inside the na-pending
  observation window** is counted clean while the same row claims `navigation: "none"`,
  `submits: []` and an active form.
* **F3** — the pre-action navigation history is never checked, so a record that navigates
  the page to a *different* document before the invocation, and then reports the old
  document in both page-state observations, is counted clean.

Five further classes (F2, F4–F7) are provenance/contract fields the oracle never checks
(absolute chronology, loopback origin/port, browser process identity, declared tool
schema/description, raw case schema). Two classes (M18, M25) are by-design or
producer-incoherent and are not defects.

The note's contract — “*a coherently changed raw event and summary, with corrected digest
links, must still fail the case's semantic expectation*”
(`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, “What this adds, and what it does
not”) — holds for the raw/summary channels the oracle reads and **fails for the receipt's
request log and for the pre-action navigation history**.

A verified fix candidate for F1+F3 (2 hunks, 23 added lines) keeps the truth corpus at
`12/clean` and the author's own 44-case selftest at `44/44`, and refuses exactly the new
classes. It is **not** applied to the lane; it is reproduced in §5 for the wave owner.

---

## 2. Method (what was actually executed)

* Private throwaway clone only: `git clone /home/vgpnk/Projects/shokunin/tabi-shokunin` →
  `/home/vgpnk/tmp-agents/tabi-r22-w2b-RowOutcome01`, detached at `e3cf4e0…`, deleted at the
  end. **No lane, fleet, sibling-lane or jj write; no VCS mutation of the lane.**
  (`/tmp` was 100 % full — `ENOSPC` — during the first selftest attempt; the clone and
  `TMPDIR` were therefore placed under `/home/vgpnk/tmp-agents/`.)
* Each mutant: mutate the retained raw/receipt/execution bytes → **reseal the digest chain**
  (`receipt.cases[].evidence.sha256` → `execution.artifacts[*]` → `execution.receiptSha256`)
  → commit in the clone → run `node .ufo/waves/round-22/measure-c1.mjs <mutant-commit>`.
  The oracle reads its inputs from git at that commit (`measure-c1.mjs:507-521`), so the
  mutant commit *is* the evaluated corpus.
* Node `v24.21.0` (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`),
  python3 3.14. **No tool was installed or upgraded** (none needed).

Reproducibility: the mutant generators and their raw JSON result sets were kept outside the
lane at `/home/vgpnk/tmp-agents/harness/attack-row01{,b,c}.py` and
`/home/vgpnk/tmp-agents/attack-results-*.json` (batteries `reviewed-*` = reviewed oracle,
`fix2-*` = the §5 fix candidate). The clone itself was deleted at the end of the item.

Baseline in the clone, unmutated:

```
node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
  → exit 0, value 12, verdict "clean", findings []
node .ufo/waves/round-22/measure-c1.mjs --selftest
  → exit 0, "clean" 44/44
```

---

## 3. Results (reviewed oracle, revision `e3cf4e0…`)

`row_counted` = the `na-pending` row is counted (`measure-c1.mjs:480-488`); every refused
mutant drives the **global** value to 0 (fail-closed: any finding uncounts all rows).

| # | Mutation (all digests resealed) | Oracle exit / value / verdict | Refusal finding |
|---|---|---|---|
| M01 | fabricate `WebMCP.toolResponded` (Completed) inside the pending window | 1 / 0 / failed | `semantic_status:na-pending:pending-has-response` (+260, +303) |
| M02 | same response, but after the after-action observation | 1 / 0 / failed | `semantic_status:na-pending:pending-has-response` (+303) |
| M03 | response for a foreign invocationId | 1 / 0 / failed | `evidence_binding:na-pending:response-other-invocation` |
| M04 | response only in `receipt.after.responses`, absent from the frames | 1 / 0 / failed | `evidence_binding:na-pending:receipt-raw-summary` |
| **M05** | **rewrite the whole acquisition origin `:43143` → `:45999`** | **0 / 12 / clean** | **— counted (F4)** |
| M06 | shift only na-pending's timestamps (incoherent: other cases fall outside) | 1 / 0 / failed | `evidence_binding:…:frame-outside-acquisition-window` |
| **M07** | **fabricate browser process identity (pids 101–103, empty identities)** | **0 / 12 / clean** | **— counted (F5)** |
| **M08** | **fabricate `GET /landing?q=<na-pending nonce>` in `receipt.requests` at 1792590707345** | **0 / 12 / clean** | **— counted (F1)** |
| M09/M10 | extra navigation with a back-dated timestamp | 1 / 0 / failed | `semantic_timing:na-pending:frame-sequence-or-clock` (clock, not navigation) |
| **M11** | **rewrite the declared tool `description` and `inputSchema`** | **0 / 12 / clean** | **— counted (F6)** |
| **M12** | **rewrite `raw.schema` to `tabi-round21-case-v9`** | **0 / 12 / clean** | **— counted (F7)** |
| M13 | fabricate a `submit` event in both observations | 1 / 0 / failed | `semantic_status:na-pending:pre:submit-event` (+post) |
| M14 | tamper the pre-action input value | 1 / 0 / failed | `semantic_status:na-pending:pre:form-state` |
| M15 | navigation inside the post-action window | 1 / 0 / failed | `semantic_navigation:na-pending:unexpected-post-action-navigation` |
| M16 | blocked-request leak | 1 / 0 / failed | `evidence_binding:na-pending:case-cleanup-or-boundary` |
| M17 | pre-action window 249 ms (below the pinned 250 ms) | 1 / 0 / failed | `semantic_timing:na-pending:finite-summary-windows` |
| M18 | pre-action window exactly 250 ms (truth: 254 ms) | 0 / 12 / clean | — inside the pinned range, by design (not a defect) |
| M19 | fabricate a `release` marker in a non-delayed case | 1 / 0 / failed | `semantic_delayed:na-pending:unexpected-release-marker` |
| M20 | rewrite the invoked tool input | 1 / 0 / failed | `evidence_binding:na-pending:current-invocation-chain` (+`semantic_output:invoked-input`) |
| M21 | receipt `preAction.formActive = false` | 1 / 0 / failed | `semantic_timing:na-pending:finite-summary-windows` |
| M22 | delete the after-action observation | 1 / 0 / failed | `semantic_timing:na-pending:observation-marker-set` (+2) |
| M23 | duplicate `WebMCP.toolInvoked` | 1 / 0 / failed | `evidence_binding:na-pending:current-invocation-chain` |
| M24 | delete the `WebMCP.toolsAdded` event | 1 / 0 / failed | `evidence_binding:na-pending:current-invocation-chain` |
| M25 | terminal response under a method name the producer never emits | 0 / 12 / clean | producer-incoherent (see §6) |
| **N01** | **move the whole acquisition (12 raws + receipt + execution) one day earlier** | **0 / 12 / clean** | **— counted (F2)** |
| N02 | narrow the acquisition window below the other cases' frames | 1 / 0 / failed | `evidence_binding:na-click:frame-outside-acquisition-window` |
| **N03** | **fabricate an off-origin `GET https://example.invalid/collect` inside the window** | **0 / 12 / clean** | **— counted (F1, same class)** |
| N04 | replace the retained fixture bytes | 1 / 0 / failed | `evidence_binding:na-pending:case-identity-or-fixture` |
| N05 | terminal response event with no `params` | 1 / 0 / failed | `evidence_binding:na-pending:response-other-invocation` |
| N06 | strip `invocationId` from the invokeTool result | 1 / 0 / failed | `evidence_binding:na-pending:current-invocation-chain` (+cross-link) |
| N07 | shorten the nonce | 1 / 0 / failed | `evidence_binding:na-pending:case-identity-or-fixture` |
| N08 | swap the pre/post observation labels | 1 / 0 / failed | `evidence_binding:na-pending:page-observation-raw-link` |
| **P01** | **extra navigation to the same path before the invoke (clock-legal)** | **0 / 12 / clean** | **— counted (F3)** |
| **P02** | **extra navigation to `/elsewhere` before the invoke** | **0 / 12 / clean** | **— counted (F3)** |
| **P03** | **extra navigation with a new loaderId before the invoke** | **0 / 12 / clean** | **— counted (F3)** |

---

## 4. Findings (severity order)

### F1 — MEDIUM — the receipt's server-side request log is never cross-checked, so a contradictory navigation inside the pending window is counted clean

* **Revision / path / line:** `e3cf4e0…`, `.ufo/waves/round-22/measure-c1.mjs`
  * `receipt.requests` is **never referenced** anywhere in the oracle (grep over the file
    at `e3cf4e0…`: the only "request" hit is the case id `'na-requestsubmit'` at line 26).
  * The receipt envelope check `measure-c1.mjs:446-451` validates `schema`, `cases`,
    `producer`, `environment`, `cleanup` and the two timestamps — **not `requests`**.
  * The navigation contract is enforced only from CDP frames: `measure-c1.mjs:309-312`
    (`actionNavigations`, restricted to `at >= receiptCase.after.start && seq < post.seq`)
    and `:321`/`:324-325` (landing validity/order); the receipt's own navigation *summary*
    is cross-checked against the frames at `:281-282` — but the server log is a third,
    independent channel and is skipped.
* **Smallest counterexample (digests resealed):** five lines added to
  `corpus/evidence/round-21/runtime/receipt.json` — one server-log entry inside the
  na-pending observation window — plus the two resealed digest lines in
  `.ufo/waves/round-21/runtime-execution-finalized.json`. The raw
  `na-pending.json` is **byte-identical** to the retained truth.

  ```diff
   { "at": 1792590707069, "method": "GET", "url": "/na-pending" },
  +{ "at": 1792590707345, "method": "GET", "url": "/landing?q=5956c381-7675-4fe7-a6b4-990d7cf866f9" },
   { "at": 1792590708004, "method": "GET", "url": "/na-click" },
  ```
  (mutant commit `2e680c2a886574f81aab08914bf99ed23186f15f`)

  The oracle answers `exit 0, value 12, verdict "clean", findings []`, the `na-pending`
  row is **counted** with `outcome "Pending"`, while the corpus now asserts that the
  loopback server served a **landing navigation with this case's nonce** inside the very
  window in which the row claims `navigation: "none"`, `submits: []`, an active form and
  an unchanged URL. The same class also survives with an off-origin request (N03,
  `2de67c757b2152dc247792eba73a1eebefba4b3e`) although the raw claims `blocked: []` — the
  producer aborts and records every non-loopback request, so the two channels contradict.
* **Preserving positive:** the truth corpus must stay `12/clean`; in particular the truth's
  own `GET /landing?q=8a5839ad-…` (at 1792590710188) belongs to `na-native-submit`
  (`navigation: "landing"`) and must stay accepted. Verified: with the fix in §5 the truth
  corpus remains `exit 0 / 12 / clean` and the author's 44-case selftest remains 44/44.
* **Smallest fix:** cross-check the server log against each case's window (verified patch,
  §5): require `Array.isArray(receipt.requests)` in the envelope (`:446-451`), pass
  `receipt.requests` into `checkCase` (`:148`, call site `:473-476`), and refuse any request served
  inside `[preAction.start, after.end]` whose URL is neither `/${id}` nor — for
  `navigation: "landing"` cases only — a `/landing` path
  (`semantic_navigation:na-pending:server-request-log-contradicts-case`).

### F3 — MEDIUM — the pre-action navigation history is never checked, so self-contradictory navigation records count clean

* **Revision / path / line:** `e3cf4e0…`, `.ufo/waves/round-22/measure-c1.mjs`
  * `navEvents` is built at `:236`; only `navEvents[0]` is inspected (`:237-244`, to derive
    `origin`); `actionNavigations` at `:309-310` is restricted to the **post-action**
    window, so navigations recorded **before** the action are never examined.
  * The page-state URL check at `:140` compares the observation URL against the *pinned
    expectation*, never against the record's own navigation history.
* **Smallest counterexample:** one extra `Page.frameNavigated` event inserted before the
  `WebMCP.invokeTool` frame, with a clock-legal `at` and a resynchronised `seq`:
  * P02 (`bfaade9323aa2e3762e5c65a6e2ae95d80b83cb9`) points that frame at
    `http://127.0.0.1:43143/elsewhere`, while **both** page-state observations still report
    `http://127.0.0.1:43143/na-pending` — a record that contradicts itself.
  * P01/P03 add a same-path reload / a new loaderId.
  * Oracle: `exit 0, value 12, verdict "clean"`, row counted, in all three cases.
* **Preserving positive:** truth corpus `12/clean` and the author's 44-case selftest 44/44
  must both hold; the truth has exactly **one** navigation before the post observation for
  all eleven `navigation: "none"` cases, and two for `na-native-submit` (already covered by
  `:321`/`:324-325`). Verified with the fix in §5.
* **Smallest fix:** for `expected.navigation === 'none'`, require
  `navEvents.filter((frame) => frame.seq < post.seq).length === 1`
  (`semantic_navigation:na-pending:unexpected-pre-action-navigation`); the landing case
  keeps its existing, stricter checks. Verified patch, §5.

### F2 — MEDIUM-LOW — the absolute acquisition chronology is self-asserted and unpinned

* **Revision / path / line:** `e3cf4e0…`, `measure-c1.mjs:443-445` derives
  `receiptStart`/`receiptEnd` from `receipt.startedAt`/`finishedAt` — the same mutable
  receipt — and `:176-177` only requires the frames to fall inside that self-declared
  window. The pinned expectations pin `acquisition.revision/baseline/measuredRevision/
  outputPath/exit` (`corpus/evidence/round-22/semantic-expectations.json:10-18`) but **no
  timestamp**, and the acquisition-identity block (`:425-431`) does not compare the
  execution record's `startedAt`/`finishedAt` either.
* **Smallest counterexample:** shift every case raw's frame times, every receipt case
  window, every request timestamp, `receipt.startedAt/finishedAt` and
  `execution.startedAt/finishedAt` by exactly −1 day (coherent and internally consistent;
  mutant `63b89f4a8879254fb05e894c7bfd72c03a855edd`). Oracle: `exit 0, value 12,
  verdict "clean"`. The corpus then claims the historical acquisition ran on
  2026-10-20T13:51:46Z, while the retained truth and the oracle note's own
  `verified-at: 2026-10-21` header say 2026-10-21T13:51:46Z.
* **Preserving positive:** truth corpus `12/clean`, selftest 44/44 (both hold under the
  fix candidate, which leaves this class untouched).
* **Smallest fix:** add `acquisition.startedAt` / `acquisition.finishedAt` (and the
  execution record's) to the pinned expectations and compare them in the acquisition check
  at `:425-431`. This changes the pinned file, so `EXPECTATIONS_SHA256` (`measure-c1.mjs:22`)
  must be bumped and the selftest fixtures re-run — a wave-owner decision, not a reviewer
  edit.

### F4 — LOW — the loopback origin/port is self-certified (tautological check)

* `measure-c1.mjs:236-244` derives `origin` from the raw's **own** first navigation;
  `:140` then compares `url.origin` against that same derived value — a tautology.
* Counterexample M05 (`a8bde3e94942f7d874085e642e6d7116190b2996`): rewrite the navigation
  URL, the frame-tree URL and both page-state URLs from `:43143` to `:45999` (plus the
  receipt's `after.pageState`) → `exit 0, 12, clean`. The truth's origin is
  `http://127.0.0.1:43143`.
* Preserving positive: truth corpus `12/clean`.
* Smallest fix: pin `urlOrigin` per case in the expectations and compare at `:140`
  (requires the `EXPECTATIONS_SHA256` bump above). A weaker coherence-only variant
  (frame-tree URL vs navigation URL) would **not** catch M05, because the mutant changes
  both consistently — the pin is the effective fix.

### F5 — LOW — browser process identity is unchecked

* `measure-c1.mjs:345-349` checks only `browserPidsBefore` (non-empty, positive integers),
  `browserPidsAfter === []`, `contextClosed === true`, no `closeError`, `blocked === []`,
  `downloads === []`. `browserPidsAtClose`, `browserPidsSeenAfterClose`,
  `processIdentities` and `processIdentitiesAtLaunch` are **never read**.
* Counterexample M07 (`8a5652c448866059de37b475daa408433061b6ef`): `browserPidsBefore =
  [101,102,103]`, `browserPidsAtClose = []`, `processIdentities = []`,
  `browserPidsSeenAfterClose = [999]` → `exit 0, 12, clean`.
* Preserving positive: the truth's nine pids all carry a `startTicks` identity and
  `browserPidsAtClose === browserPidsBefore` (producer `scripts/webmcp-lifecycle-round21.mjs:39-41`).
* Smallest fix: require every pid in `browserPidsBefore` to appear in `processIdentities`
  with a `startTicks` string, and `browserPidsAtClose ⊆ browserPidsBefore`
  (`evidence_binding:na-pending:case-cleanup-or-boundary`). Note the oracle's own note
  already declares “PID cleanup remains sampled owned-process evidence”, so this is
  hardening, not a contract violation.

### F6 — LOW — the declared tool contract is never checked

* `measure-c1.mjs:215-216` keeps the `toolsAdded` tools whose `name === 'lifecycle'` and
  uses only `frameId` (`:223-224`); `description` and `inputSchema` are never compared.
  The pinned `inputQ: "$nonce"` is checked only against the *sent* input (`:226`) and the
  `toolInvoked` input (`:218`, `:233-234`).
* Counterexample M11 (`1a84752547f1c389210e575f1825787a647e6250`): the tool's
  `description` becomes “Fabricated description” and its `inputSchema` becomes
  `{"type":"object","properties":{}}` → `exit 0, 12, clean`. The expectation's input
  contract (a required string property `q`) is therefore unverified against the tool's own
  declaration.
* Preserving positive: the truth tool declares `required: ["q"]` with `q.type === "string"`.
* Smallest fix: inside the invocation-chain block (`:219-228`) require the declared
  `inputSchema.required` to contain `q` with type `string`, and the sent input's key set to
  equal the declared property set (`semantic_output:na-pending:declared-tool-schema`).

### F7 — VERY LOW — the raw case schema is never checked

* `measure-c1.mjs:157` validates only `plain(raw)`, `Array.isArray(raw.frames)`,
  `Array.isArray(raw.pageObservations)` and `raw.frames.every(plain)`; `raw.schema` is
  never compared to `'tabi-round21-case-v1'` (written by
  `scripts/webmcp-lifecycle-round21.mjs:161`).
* Counterexample M12 (`8f81af6084c874e546ef7d6986fe36ce8d9119be`): `raw.schema =
  "tabi-round21-case-v9"` → `exit 0, 12, clean`.
* Preserving positive: the truth raw's schema is `tabi-round21-case-v1`.
* Smallest fix: one clause at `:157` — `raw.schema !== 'tabi-round21-case-v1'` →
  `evidence_binding:na-pending:case-identity-or-fixture`.

---

## 5. Verified fix candidate (F1 + F3) — reproduced, **not applied to the lane**

Clone commit `0d779dfd008212597b6b2828e85e4f5b192ccd1b` (parent `e3cf4e0…`),
`.ufo/waves/round-22/measure-c1.mjs`, 2 hunks, +23/−2 lines:

1. `checkCase` signature (`:148`) takes `requests`; the call site (patched `:485-490`) passes
   `receipt.requests`; the receipt envelope (`:446-451`) requires `Array.isArray(receipt.requests)`.
2. New check in `checkCase`: every request served inside `[preSummary.start, afterSummary.end]`
   must be the case's own document, or a `/landing` path for the landing case →
   `semantic_navigation:na-pending:server-request-log-contradicts-case`.
3. New check in `checkCase`: for `expected.navigation === 'none'`, exactly one navigation may
   precede the post observation →
   `semantic_navigation:na-pending:unexpected-pre-action-navigation`.

Verification executed on that candidate (all in the throwaway clone):

```
node .ufo/waves/round-22/measure-c1.mjs e3cf4e0…   → exit 0, value 12, verdict clean, findings []
node .ufo/waves/round-22/measure-c1.mjs --selftest  → exit 0, "clean" 44/44
```

* M08 → refused (`semantic_navigation:na-pending:server-request-log-contradicts-case`).
* N03 → refused (same finding).
* P01, P02, P03 → refused (`semantic_navigation:na-pending:unexpected-pre-action-navigation`).
* Every previously refused mutant stays refused with the same finding ids; the still-counting
  set shrinks from {M05, M07, M08, M11, M12, M18, M25, N01, N03, P01, P02, P03} to
  {M05, M07, M11, M12, M18, M25, N01} (F2, F4–F7 remain, each with the smallest fix in §4).
* The truth's own `GET /landing?q=8a5839ad-…` inside `na-native-submit`'s window is still
  accepted (that case is `navigation: "landing"`), so the positive is preserved.

---

## 6. Confirmed refusals for the row's own semantic contract (the “confirm none” half)

No contradictory mutation of the *outcome* survives. The exact refusal sites in
`.ufo/waves/round-22/measure-c1.mjs` at `e3cf4e0…`:

* **No response / pending:** `:256` (`response-other-invocation` — refuses *any*
  `WebMCP.toolResponded` event, matched or foreign), `:287`
  (`pending-has-response`), `:302-303` (`response-outside-finite-pending-case`),
  `:259-260` (`finite-window-response-statuses`, both windows must be `[]`).
* **Response content (status/output/errorText):** `:285-301`
  (`:287` null-expectation branch, `:291` `outcome-status`, `:296-299`
  `exact-output-shape` / `exact-error-text-or-output-presence`).
* **Receipt summary vs raw:** `:277-280` (`receipt-raw-summary` — responses, pageState,
  submits), `:281-282` (`receipt-navigation-summary`).
* **Invocation chain:** `:219-228` (`current-invocation-chain`: one invoke, one result,
  one `toolInvoked`, matching frameId/toolName/input, `invoked.seq < pre.seq`),
  `:229-230` (`invocation-id-cross-link`), `:233-234` (`invoked-input`).
* **Pre/post page state:** `:112-114` (`form-state`: `secureContext`, `formActive`,
  `formExists`, `value`, `focused`), `:119-120` (`nonce-state`), `:121-127`
  (`submit-observation` / `submit-event`), `:129-130` (`page-errors`), `:140-141` (`url`),
  `:143` (`url-invalid`).
* **Navigation:** `:244` (`initial-loopback-navigation`), `:309-312`
  (`unexpected-post-action-navigation`), `:314-321` (`native-submit-landing`),
  `:322-325` (`landing-before-completion`).
* **Finite windows:** `:268-276` (`finite-summary-windows`: `preSummary.end === pre.at`,
  `windowMs` consistency, `[minMs,maxMs]`, containment in the acquisition window,
  `sent.at <= preSummary.start`, `actionFrame/completeFrame` inside the after window),
  `:176-177` (`frame-outside-acquisition-window`), `:174-175` (`frame-sequence-or-clock`),
  `:199-200` (`pre-action-dispatch-post-sequence`), `:189-190` (`observation-marker-set`),
  `:181` (`page-observation-raw-link`), `:248-250` (`observation-frame-link`).
* **Delayed/release:** `:328-340` (`active-before-release-and-response-after-release`),
  `:341-343` (`unexpected-release-marker`).
* **Case identity / fixture / bindings:** `:161-168` (`case-identity-or-fixture`, incl. the
  fixture digest at `:166`), `:152-158` (`case-evidence-shape`, `nonce`, `input_shape`),
  `:468-472` (raw/fixture presence, `receipt-raw-digest`), `:414` (`producer-digest`),
  `:430-436` (acquisition receipt/artifact digests), `:446-451`
  (`receipt-acquisition-envelope`), `:452-453` (`receipt-case-order-or-set`).
* **Boundary / cleanup:** `:345-349` (`case-cleanup-or-boundary`).
* **Fail-closed aggregation:** `:480-488` — any finding sets `blocked`, which uncounts
  **every** row and returns `value 0, exit 1`; the row-level `counted` flag is
  `!blocked && semanticMatch` (`:483`).

**Not defects / out of scope for this item**

* **M18** (pre-action window exactly 250 ms; truth 254 ms) — inside the pinned expectation
  range `[250, 10000]`; the range is the expectation, so accepting 250 ms is by design.
  Worth recording: the truth's 254 ms sits 4 ms above the floor, so the “finite window”
  claim for this row rests on ≈757 ms of observation in total.
* **M25** (a terminal response under a method name the producer never emits) — the pinned
  producer subscribes to exactly `['WebMCP.toolsAdded','WebMCP.toolInvoked',
  'WebMCP.toolResponded','Page.frameNavigated']`
  (`scripts/webmcp-lifecycle-round21.mjs:41`), so such a corpus is not producible by the
  pinned acquisition. Recorded as a robustness note only (the oracle keys on the literal
  method string).
* Malicious-author authenticity, publisher authentication, browser semantics, coverage and
  promotion questions are outside this row-scoped item and are not claimed either way.

---

## 7. Residual risk and verification gaps

* **Residual risk after the F1+F3 fix:** the acquisition's absolute chronology (F2), the
  loopback origin/port (F4), the browser process identity (F5), the declared tool contract
  (F6) and the raw case schema (F7) remain unverified. None of them changes the *outcome*
  the row asserts; all of them would let a rewritten corpus keep reporting `12/clean`.
  F2 and F4 need a pinned-expectations change (digest bump + selftest re-run), F5–F7 are
  local oracle checks.
* **Verification gaps (unrun, stated honestly):**
  * No browser, Chromium, Playwright or network execution of any kind (forbidden here and
    unnecessary: the corpus is historical and revision-bound). The producer was read, not
    re-run.
  * The other eleven rows were **not** attacked; this item is row `na-pending` only. The
    fixes in §5 were validated against the whole corpus and the whole 44-case selftest, but
    no per-row attack battery was run for the other rows.
  * `.ufo/waves/round-22/run-checks.py` was **not** run (it is the wave owner's serial
    check driver and expects the real fleet tree, not a private clone); the checks this
    review did run are the oracle CLI and the oracle's own `--selftest`, both listed in §2
    and §5 with their exit codes.
  * The first `--selftest` attempt failed with `ENOSPC` in `/tmp` (host `/tmp` at 100 %);
    it was re-run with `TMPDIR` on `/home` and returned 44/44. The failure was
    environmental, not an oracle defect.
  * No claim is made about the correctness of the *retained acquisition itself*, about
    Chromium 154.0.8037.97 behaviour, or about the round-21 producer's own honesty.

## 8. Tools

No package was installed, upgraded or downgraded for this item; the host `/tmp` filesystem
being full (`ENOSPC`) was worked around by relocating the throwaway clone and `TMPDIR` to
`/home/vgpnk/tmp-agents/` (a private path, removed afterwards). Node `v24.21.0` and
python3 `3.14` were used as found. The lane, the fleet repo, sibling lanes, the lane Git
index and lane jj state were **not** written to; the only file written in the lane is this
report.
