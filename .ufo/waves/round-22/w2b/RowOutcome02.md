# RowOutcome02 — round22 w2b attack on row `na-click`

Revision under attack: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`
("round-22: repair landing-stage oracle defects found by first positive run; retain W2 cap-refusal chain").
All production bytes were read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d…:<path>`;
the lane itself was never modified, and no VCS write, browser run, credential, service or delegation was used.

Scope of this item: the `na-click` row of the repaired oracle
`.ufo/waves/round-22/measure-c1.mjs` measured against
`corpus/evidence/round-22/semantic-expectations.json` (pinned) and the retained raw
`corpus/evidence/round-21/runtime/na-click.json`, over the four named surfaces: exact
status/output/errorText, pre/post page state, navigation, finite response window.

---

## Verdict

**One real defect found.** The `navigation` surface is only enforced *inside the action
window*, so a `Page.frameNavigated` event recorded **before** the action (after the tool
invocation) is invisible to the oracle. A raw that contradicts itself is still counted as a
semantically checked lifecycle row: `value=12`, `exit=0`, `verdict=clean`, `na-click.counted=true`,
`findings=[]`.

The other three named surfaces (exact status/output/errorText, pre/post page state, finite
response window) are **closed**: of 58 coherent raw/receipt mutations, 50 were refused, each
by a named line (table in §4). The 8 that were counted are F1 (k01, k02), F2–F4 residual risk
(k04, k05, k06, k08), one benign case (c27, an extra `toolsAdded` for another tool) and one
intended-window positive (p01: a response inside the action-to-post window but before the
`action-complete` marker) — the last is the intended window semantics, not a defect.

This does not show the metric value 12 to be false for the retained bytes as they stand. It
shows the instrument is not yet *failure-capable* on the navigation surface, which the oracle
note claims it is (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:24`: "a coherently
changed raw event and summary, with corrected digest links, must still fail the case's semantic
expectation").

---

## F1 (high) — navigation guard is window-scoped; a self-contradictory `na-click` raw is counted

**Where (revision `e3cf4e0d`, `.ufo/waves/round-22/measure-c1.mjs`):**

```
236  const navEvents = frames.filter((frame) => frame.dir === 'event' && frame.method === 'Page.frameNavigated');
237  const firstUrl = navEvents[0]?.params?.frame?.url;
...
309  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
310    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
311  if (expected.navigation === 'none') {
312    if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
```

`navEvents` is computed over the **whole** raw, but only `navEvents[0]` (the initial load,
line 237) and the events inside `[receiptCase.after.start, post.seq)` (lines 309-310) are ever
examined. `receiptCase.after.start` is the action-window start (producer: `actionAt`), so every
navigation between the tool invocation and the action is outside every guard. The only other
consumer of `navEvents` is the receipt cross-check at line 281-282, which uses the same window.

### Smallest counterexample (k02) — one inserted frame

Mutate `corpus/evidence/round-21/runtime/na-click.json` only: insert **one** event frame
between the `WebMCP.toolInvoked` frame (seq 11, `at=1792590708016`) and the `pre-action`
observation (seq 12, `at=1792590708268`), renumber `seq`, and update the two
`pageObservations[].seq` values.

```json
{ "seq": 12, "at": 1792590708200, "dir": "event", "method": "Page.frameNavigated",
  "params": { "frame": { "id": "9967ED1565B1659BFC7B3D6C348C354B",
                         "loaderId": "AABBCCDDEEFF",
                         "url": "http://127.0.0.1:43143/elsewhere" },
              "type": "Navigation" } }
```

Then reseal every digest link exactly as the lane's own selftest does
(`.ufo/waves/round-22/selftest-c1.mjs:63-76`, `resealAcquisition`):

* `corpus/evidence/round-21/runtime/receipt.json` → `cases[na-click].evidence.sha256` = sha256(new raw)
* `.ufo/waves/round-21/runtime-execution-finalized.json` → `artifacts["…/na-click.json"]` = sha256(new raw), `artifacts["…/receipt.json"]` = sha256(new receipt), `receiptSha256` = same

No other byte changes (the expectation file, the note, the fixture HTML and the producer are
untouched, so every digest pin — `EXPECTATIONS_SHA256`, `PRODUCER_SHA256`,
`expectations.fixtureSha256` — still holds).

**Observed oracle result (integrated oracle at `e3cf4e0d`, unmodified):**

```
k02-hidden-navigation-to-other-url   v=12  e=0  COUNTED   findings: (none)
k01-hidden-navigation-before-pre     v=12  e=0  COUNTED   findings: (none)
```

`na-click` row: `counted=true`, `semanticMatch=true`, `outcome="Completed"`, `findings=[]`.

**Why the mutated raw is contradictory (k02, no browser assumption needed).** The producer
records each page observation as `page.evaluate(() => ({ ...window.observations, url: location.href, … }))`
(`scripts/webmcp-lifecycle-round21.mjs`, `observe()`), i.e. `url` is the **current document's**
URL. In k02 the last recorded navigation before the `pre-action` observation is to
`http://127.0.0.1:43143/elsewhere` (seq 12, `at=1792590708200`); the observation two frames
later (`seq 13`, `at=1792590708268`) reports `url = "http://127.0.0.1:43143/na-click"`. The raw
therefore asserts two different current documents at the same point of the case, and the
oracle's own URL check (line 141, `semantic_navigation:…:url`) is satisfied by the stale one.

**Stronger variant (k01)** — the same insertion with `url` = the fixture URL
(`http://127.0.0.1:43143/na-click`, i.e. a reload) is also counted. Its contradiction needs one
step of browser semantics: the retained fixture
`corpus/evidence/round-21/runtime/na-click.html` has `<input name="q" required>` with **no
value attribute**, so the recorded `pre.value = "<nonce>"` can only come from the WebMCP tool
input `{q: nonce}` being written into the field by the tool activation; and `pre.formActive=true`
is `f.matches(':tool-form-active')`. [INFERENCE, from the retained fixture bytes and the
recorded state] a document loaded by the inserted navigation has an empty field and no
tool-activated form, so the `pre-action` observation cannot be true of it. The oracle counts
k01 as well, so the row is counted on a raw whose navigation event contradicts its own
pre-action page state.

**Preserving positive** (what must still be true after the fix):

| Check | Unpatched | Patched |
|---|---|---|
| Unmodified corpus at `e3cf4e0d` (oracle CLI over the revision) | `value=12 exit=0 verdict=clean` | `value=12 exit=0` (b00-baseline, patched oracle) |
| `na-native-submit`'s one legitimate extra navigation (`/landing`) | counted | counted |
| `na-click` response inside the action-to-post window but **before** the `action-complete` marker (p01) | counted | counted (no over-rejection) |
| Lane's own selftest `.ufo/waves/round-22/selftest-c1.mjs` (44 CLI cases over isolated git repos) | `verdict=clean, 44/44 passed, exit 0` | `verdict=clean, 44/44 passed, exit 0` |
| k02 / k01 counterexamples | counted (defect) | refused: `semantic_navigation:na-click:unexpected-post-action-navigation` |

### Smallest fix (3 lines, verified in the throwaway clone, never applied to the lane)

In `.ufo/waves/round-22/measure-c1.mjs`:

```js
  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
+ // every navigation after the initial load that precedes the post-action observation
+ const extraNavigations = navEvents.slice(1).filter((frame) => !post || frame.seq < post.seq);
  if (expected.navigation === 'none') {
-   if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
+   if (actionNavigations.length !== 0 || extraNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
  } else {
    …
-   validLanding = actionNavigations.length === 1 && url.origin === origin && …
+   validLanding = actionNavigations.length === 1 && extraNavigations.length === 1 && url.origin === origin && …
```

Measured with this patch (throwaway copy only): baseline `value=12 exit=0`; k01 and k02 refused
with `semantic_navigation:na-click:unexpected-post-action-navigation`; the post-observation
trailing navigation (k06) still counted; lane selftest still `44/44 clean`.
`na-native-submit` is the only corpus case with a second navigation, so the `landing` branch
needs the added `extraNavigations.length === 1` term — without it that case would still be
counted with an extra unseen navigation.

Weaker variant (not recommended): widen the window start at line 309-310 from
`receiptCase.after.start` to the invocation time (`sent?.at`). It catches k01/k02 but still
admits a navigation between the initial load and the invocation, which also invalidates the
invocation→frame-tree chain that line 214-228 relies on.

---

## F2 (low, benign) — the same window scope admits a navigation *after* the post observation

k06 (one `Page.frameNavigated` frame appended after the `after-action` observation) is counted
by the unmodified oracle and stays counted under the F1 fix. This is *not* a contradiction of
the row's claim (the row's claim covers the action window), so it is recorded as scope
evidence for F1 rather than a defect.

## F3 (low, residual risk — possibly intended) — the receipt's server request log is never bound to the raw

`corpus/evidence/round-21/runtime/receipt.json` carries `requests[]`, the loopback server's own
access log (`{at, method, url}` per GET). The oracle never reads it. Counterexample k05:
append `{ "at": 1792590708300, "method": "GET", "url": "/na-click" }` to `receipt.requests` and
reseal → oracle still reports `value=12 exit=0 clean` with `na-click` counted, even though the
server log then shows a page load **inside the action window**, which contradicts the pinned
`"navigation": "none"` of the `na-click` expectation.

This is *not* filed as a defect, because the oracle note declares the receipt row to be "an
index and summary, not independent corroboration of the raw event"
(`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:33`) and the expectations are "independent
of the evaluated receipt" (line 24). It is residual risk: a contradictory *server-side* witness
is invisible. If the intent is that the receipt is a pure index, say so in the expectation
schema; if the intent is that it is a witness, bind `requests[]` to the raw frames.

## F4 (low, residual risk) — the cleanup-boundary check ignores the leftover-process witness

`.ufo/waves/round-22/measure-c1.mjs:345-349` checks `browserPidsBefore`, `browserPidsAfter`,
`contextClosed`, `closeError`, `blocked`, `downloads` — but not `raw.browserPidsSeenAfterClose`
(browser processes still alive right after `context.close()`) nor `raw.forcedCleanup`.
Counterexample k04: set `raw.browserPidsSeenAfterClose = [1808185]` (a pid that the same raw
lists as closed) → oracle still `value=12 exit=0 clean`, row counted. Counterexample k08:
`receipt.cleanup = {browserClosed:true, serverClosed:true, forcedCleanup:[1234]}` → also
counted. The oracle note already downgrades PID cleanup to "sampled owned-process evidence",
so this is residual risk, not a false claim; but the cleanup check reads as stronger than it is.

## F5 (info, benign) — extra `WebMCP.toolsAdded` events for other tools are ignored

Counterexample c27: insert a second `WebMCP.toolsAdded` event naming a different tool
(`other`) → counted (`value=12 exit=0`). Only tools named `lifecycle` are counted
(line 215-216), so a tool-definition change in the frame is invisible. Not a contradiction of
the `na-click` claim; recorded for completeness.

---

## 4. Closed surfaces — exact refusal lines (all at revision `e3cf4e0d`)

50 coherent mutations were refused. Every mutation below was applied to the raw (and/or the
receipt) with all digest links resealed through the receipt/acquisition records, so the refusal
is semantic, not a digest accident.

**Exact status / output / errorText** (`.ufo/waves/round-22/measure-c1.mjs`)

| Mutation | Refusal line | Finding |
|---|---|---|
| status `Completed`→`Error` (+`errorText`) | 291, 297-298 | `semantic_status:na-click:outcome-status`, `semantic_error:…:exact-error-text-or-output-presence` |
| status →`Canceled` (+`errorText`) | 291, 297-298 | `semantic_status:na-click:outcome-status`, `semantic_output:…:exact-output-shape` |
| `output.nonce` wrong | 295-298 | `semantic_output:na-click:exact-output-shape` |
| `output` dropped | 295-298 | `semantic_output:na-click:exact-output-shape` |
| extra key in the response params | 295-298 | `semantic_output:na-click:exact-output-shape` |
| response params not mirrored into `receipt.after.responses` | 280 | `evidence_binding:na-click:receipt-raw-summary` |

**Pre/post page state** (`validatePageState`, lines 108-145)

| Mutation | Refusal line | Finding |
|---|---|---|
| post `formActive` false→true / `formExists` false / `value` wrong / `focused` wrong / `secureContext` false | 114 | `semantic_status:na-click:post:form-state` |
| post `submits` emptied | 127 | `semantic_status:na-click:post:submit-event` |
| post submit `isTrusted`/`agentInvoked`/`respondWith`/`q`/`active` altered | 127 | `semantic_status:na-click:post:submit-event` |
| post `errors` non-empty | 130 | `semantic_error:na-click:post:page-errors` |
| post `nonce` altered | 120 | `semantic_status:na-click:post:nonce-state` |
| post `url` → other path | 141 | `semantic_navigation:na-click:post:url` |
| pre `formActive`/`value`/`focused` altered | 114 | `semantic_status:na-click:pre:form-state` |
| pre `submits` non-empty | 127 | `semantic_status:na-click:pre:submit-event` |
| pre `errors` non-empty | 130 | `semantic_error:na-click:pre:page-errors` |
| pre `nonce` altered | 120 | `semantic_status:na-click:pre:nonce-state` |
| pre `url` → other path | 141 | `semantic_navigation:na-click:pre:url` |
| observation marker changed in the frame only (not in `pageObservations`) | 181, 250 | `evidence_binding:na-click:page-observation-raw-link` |
| extra observation marker with a new label | 189, 181 | `evidence_binding:na-click:page-observation-raw-link`, `…:observation-marker-set` |

**Navigation**

| Mutation | Refusal line | Finding |
|---|---|---|
| navigation inside the action window | 312 | `semantic_navigation:na-click:unexpected-post-action-navigation` (+281-282) |
| **navigation between the invocation and the action (k01/k02)** | **none** | **counted — F1** |
| navigation after the post observation (k06) | none | counted — F2 (benign) |

**Finite response window**

| Mutation | Refusal line | Finding |
|---|---|---|
| response moved before the action frame | 306-307 | `semantic_timing:na-click:response-outside-action-window` |
| response moved after the post observation | 306-307, 259-260 | `semantic_timing:…:response-outside-action-window`, `semantic_status:…:finite-window-response-statuses` |
| response duplicated | 289 | `semantic_status:na-click:response-count` |
| response for another invocation id | 256 | `evidence_binding:na-click:response-other-invocation` |
| response removed entirely | 289 | `semantic_status:na-click:response-count` |
| response inside the window but before `action-complete` (p01) | none | counted — intended window semantics (preserving positive) |
| pre window shortened below the declared minimum | 276 | `semantic_timing:na-click:finite-summary-windows` |

**Invocation / identity / boundary binding**

| Mutation | Refusal line | Finding |
|---|---|---|
| invoked input `q` altered | 228, 234 | `evidence_binding:na-click:current-invocation-chain`, `semantic_output:…:invoked-input` |
| `WebMCP.toolsAdded` frame removed | 228 | `evidence_binding:na-click:current-invocation-chain` |
| action frame name/phase altered | 198 | `semantic_status:na-click:action-invocation` |
| `action-complete` marker removed | 198 | `semantic_status:na-click:action-invocation` |
| pre-action observation moved after the action | 200 | `semantic_timing:na-click:pre-action-dispatch-post-sequence` |
| fixture HTML altered | 168 | `evidence_binding:na-click:case-identity-or-fixture` |
| frame timestamp outside the acquisition window | 177 | `evidence_binding:na-click:frame-outside-acquisition-window` |
| frame order/clock broken | 175 | `semantic_timing:na-click:frame-sequence-or-clock` |

---

## 5. Verification log (commands and exit codes actually run)

Throwaway clone: `git clone /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome02`,
`git checkout e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane untouched; clone deleted at the end).
Node: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (`v24.21.0`).

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (clone) | 0 | `value=12 exit=0 verdict=clean findings=[]`, all 12 rows `counted=true` — clone is faithful |
| 2 | `node attack.mjs` (59-entry catalogue = 1 identity baseline + 58 mutations, against the integrated `evaluate()`) | 0 | baseline counted; of 58 mutations: 50 refused, 8 counted (k01,k02,k04,k05,k06,k08,c27 + p01 positive) |
| 3 | `node attack2.mjs` (same battery, integrated vs patched oracle) | 0 | patched oracle: k01/k02 refused, everything else unchanged |
| 4 | `node .ufo/waves/round-22/selftest-c1.mjs` (unmodified oracle, clone) | 0 | `verdict=clean cases=44 passed=44` |
| 5 | `node .ufo/waves/round-22/selftest-c1.mjs` (oracle replaced by the F1 patch, clone only) | 0 | `verdict=clean cases=44 passed=44` — no regression |
| 6 | `node emit-counterexample.mjs` + `diff -u` | 0 | byte-exact k02 diff: one 14-line frame inserted, `seq` renumbered, two `pageObservations[].seq` updated |

No lane command was run inside the lane; no `git write`, `jj`, browser, credential, REA, service
or delegation was used; no sibling lane was touched.

## 6. Unrun checks and verification gaps (stated honestly)

* `.ufo/waves/round-22/run-checks.py` (the serial 35-check cohort) was **not** run: it clones the
  lane's fleet parent and needs scratch space, and `/tmp` was 100% full (128 G used, 364 K free)
  because of concurrent lanes. Its result is the already-retained
  `.ufo/waves/round-22/checks-at-e3cf4e0.json` (35/35), which I did not re-verify.
* `/tmp` being full forced one deviation: the lane selftest's own temp roots were redirected with
  `TMPDIR=/home/vgpnk/.cache/tabi-r22-rowout02-tmp` (scratch only, outside the lane and the fleet;
  removed afterwards). The throwaway clone itself stayed at the prescribed
  `/tmp/tabi-r22-w2b-RowOutcome02`.
* The F1 patch was exercised only in the throwaway clone; it is **not** applied to the lane, and I
  make no claim about the lane's next revision.
* The k01 contradiction argument uses one inference (a freshly navigated document cannot keep the
  tool-filled field value / `:tool-form-active`); the k02 contradiction needs no browser
  assumption and is the primary counterexample. Both were verified by the oracle only — no
  browser was run, by rule.
* Not investigated (out of scope for this item): whether the same window-scoping affects the
  other eleven rows' navigation surfaces (`auto-*` rows have no action window at all), the
  `na-delayed` release ordering, and whether `receipt.requests` should be bound at all.

## 7. Explicitly out of scope (not counted as findings)

* **Malicious-author authenticity** — the note already disclaims it ("Cryptographic
  self-consistency is necessary, not an outcome oracle or a guarantee against an author changing
  both the evidence and the independent expectations"); F1 is a defect in the *instrument's
  coverage*, not an accusation about the author.
* **General browser semantics** — that `:tool-form-active` and the tool-input fill behave as the
  retained bytes show is an inference from the fixture, not a conformance claim; Chromium 154
  behaviour was not re-verified (no browser).
* **Feature requests** — binding `receipt.requests[]` (F3) or `browserPidsSeenAfterClose` (F4)
  to the raw is a design choice for the author, filed as residual risk, not as a defect.
* **Coverage, capability, promotion, browser runs, new observations** — no claim is made or
  denied here; the metric, its population (12→12) and the scalar 8 are untouched by this report.

## 8. Tooling

No package was installed or upgraded: the work needed only the node binary already pinned by the
lane (`v24.21.0`) and coreutils/git. No `pacman`, `uv tool`, `cargo` or `npm -g` transaction was
performed, so the operator tooling directive (2026-10-19) has nothing to record.
