# RowOutcome09 — outcome falsification of the `na-delayed` row of the repaired C1 oracle

Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane HEAD, `refs/heads/master`).
Named item: row `na-delayed` of `.ufo/waves/round-22/measure-c1.mjs` against the pinned contract
`corpus/evidence/round-22/semantic-expectations.json` and the retained raw
`corpus/evidence/round-21/runtime/na-delayed.json`.
Posture: author-side falsification in a private throwaway clone; the lane was never written except
this report; no browser, no installs, no delegation, no seat messaging, no lane VCS mutation.

**Verdict: a coherent contradictory raw mutation IS still counted.** The `na-delayed` row's
delayed-lifecycle observation is validated on five fields (`formActive`, `errors`, `url`, `nonce`,
`value`) but **never on its submit recorder** (`submits`) nor on its document identity
(`secureContext`, `formExists`, `focused`). A raw whose `delayed-before-release` snapshot claims
**no submit was ever dispatched** — or a submit record that contradicts the later cumulative
snapshot — passes every oracle check with all digests resealed, and the metric still reports
`value 12 / verdict clean / exit 0`.

---

## 0. Method, environment, and what was executed

Everything below was run in `/tmp/tabi-r22-w2b-RowOutcome09` (private throwaway clone of the lane,
`git clone --depth 1 --no-checkout file:///home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`). The clone was deleted after the review.

The first clone attempt (full history, 112 MB) could not commit: `/tmp` was at 100 % with 144 MB
free (`fatal: Unable to create '.git/index.lock': No space left on device`). I deleted **only my own**
throwaway clone and recreated it space-efficiently (`--depth 1 --no-checkout`, sparse working tree:
`.git` 16 MB). No other lane's scratch data was touched.

Node: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` → `v24.21.0`.
No packages were installed or upgraded during this review (nothing was needed; **no tool, version,
channel or reason to record**).

### 0.1 Commands and exit codes

| # | Command (cwd = throwaway clone) | Exit | Result |
|---|---|---|---|
| 1 | `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | **0** | `value 12`, `verdict clean`, `findings []`; row `na-delayed` → `outcome Completed`, `semanticMatch true`, `counted true` |
| 2 | `python3 harness.mutate.py none` (control: reseal-only, no semantic change) | **0** | `value 12`, `clean` — resealing machinery is behaviour-neutral |
| 3 | `python3 harness.mutate.py delayed-submits-impossible` | **0** | **`value 12`, `clean`, `findings []` — WRONGLY COUNTED** |
| 4 | `python3 harness.mutate.py delayed-submits-empty` | **0** | **`value 12`, `clean`, `findings []` — WRONGLY COUNTED** |
| 5 | `python3 harness.mutate.py delayed-copy-of-pre` | **0** | **`value 12`, `clean`, `findings []` — WRONGLY COUNTED** |
| 6 | `python3 harness.mutate.py delayed-other-facets` | **0** | **`value 12`, `clean`, `findings []` — WRONGLY COUNTED** |
| 7 | `python3 harness.mutate.py ctl-delayed-formactive-false` | **1** | `value 0`, `failed`, `semantic_delayed na-delayed:active-before-release-and-response-after-release` |
| 8 | `python3 harness.mutate.py ctl-delayed-nonce-wrong` | **1** | `value 0`, `failed`, `semantic_delayed …` |
| 9 | `python3 harness.mutate.py ctl-delayed-errors-present` | **1** | `value 0`, `failed`, `semantic_delayed …` |
| 10 | `python3 harness.mutate.py ctl-delayed-url-wrong` | **1** | `value 0`, `failed`, `semantic_delayed …` |
| 11 | `python3 harness.mutate.py ctl-response-status-error` | **1** | `value 0`, `failed`, `semantic_status na-delayed:finite-window-response-statuses`, `semantic_status na-delayed:outcome-status`, `semantic_output na-delayed:exact-output-shape`, `evidence_binding na-delayed:receipt-raw-summary` |
| 12 | `python3 harness.mutate.py ctl-response-output-wrong` | **1** | `value 0`, `failed`, `semantic_output na-delayed:exact-output-shape` |
| 13 | `python3 harness.mutate.py ctl-response-extra-param` | **1** | `value 0`, `failed`, `semantic_output na-delayed:exact-output-shape` |
| 14 | `python3 harness.mutate.py ctl-response-before-release` | **1** | `value 0`, `failed`, `semantic_delayed …` (response moved to seq 16, release to seq 17) |
| 15 | `python3 harness.mutate.py ctl-post-url-wrong` | **1** | `value 0`, `failed`, `semantic_navigation na-delayed:post:url` (+ `evidence_binding`, `semantic_delayed`) |
| 16 | `python3 harness.mutate.py ctl-post-submits-two` | **1** | `value 0`, `failed`, `semantic_status na-delayed:post:submit-event` |
| 17 | `python3 harness.mutate.py oracle=.ufo/waves/round-22/measure-c1.proposed.mjs::none` | **0** | patched oracle on genuine evidence → `value 12`, `clean` (fix is false-positive-free) |
| 18 | `…::delayed-submits-impossible` / `…::delayed-submits-empty` / `…::delayed-copy-of-pre` / `…::delayed-other-facets` | **1** each | patched oracle → all four mutants now `value 0`, `failed`, `semantic_delayed …` |
| 19 | `…::ctl-response-before-release`, `…::ctl-delayed-formactive-false`, `…::ctl-post-submits-two` | **1** each | patched oracle keeps refusing the controls |

`harness.mutate.py` (throwaway, `/tmp/tabi-r22-w2b-RowOutcome09/harness.mutate.py`) is reproduced in
§5 so the counterexample is reproducible without my clone.

---

## 1. What the pinned contract says about `na-delayed`

`corpus/evidence/round-22/semantic-expectations.json` (pinned; sha256
`4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`, pinned in code at
`measure-c1.mjs:22`), case `na-delayed` at lines 136–148:

```
144  "pre":  { … "submitCount": 0, "statuses": [], "errors": [], "focused": "go", "urlPath": "/na-delayed", "urlSearch": "" },
145  "post": { … "submitCount": 1, "statuses": ["Completed"], "errors": [], "focused": "go", "urlPath": "/na-delayed", "urlSearch": "" },
146  "navigation": "none",
147  "delayed": { "minMs": 250, "maxMs": 10000, "formActiveBeforeRelease": true, "responseBeforeRelease": false }
```

The delayed facet declares exactly four things: the release delay window, that the form is still
active before the release, and that the response did not arrive before the release.
`expectationShape` (`measure-c1.mjs:100`) only requires `plain(row.delayed)` — the facet's *shape*,
never its content.

## 2. What the retained raw actually says

`corpus/evidence/round-21/runtime/na-delayed.json` (sha256
`146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2`, identical to
`receipt.cases[na-delayed].evidence.sha256` and to
`.ufo/waves/round-21/runtime-execution-finalized.json → artifacts[…na-delayed.json]`):

| role | seq | at (ms) | citation |
|---|---|---|---|
| pre-action observation | 12 | 1792590714847 | `:167–183`; `submits: []` at `:174` |
| action (`requestSubmit`, `dispatch-started`) | 13 | 1792590714847 | `:184–190` |
| action-complete | 14 | 1792590714848 | `:191–196` |
| **delayed-before-release observation** | **15** | **1792590715100** | **`:197–221`**; `submits` = **one** record `{agentInvoked:true, isTrusted:true, q:<nonce>, active:true, respondWith:"function"}` at **`:204–212`** |
| release marker | 16 | 1792590715100 | `:222–226` |
| response (`WebMCP.toolResponded`, `status:"Completed"`, `output:{ok:true,nonce,q}`) | 17 | 1792590715100 | `:227–241` |
| after-action observation | 18 | 1792590715602 | `:242–266`; `submits` = the same one record at `:249–257`, `formActive:false` at `:262` |

`pageObservations` mirrors the frames (`:268–…`): `pre-action` `:269–284` (`submits: []` `:275`),
`delayed-before-release` `:285–309` (`submits` `:291–299`), `after-action` `:310–…`.

### 2.1 Why the delayed snapshot *must* contain exactly that submit record

The fixture `corpus/evidence/round-21/runtime/na-delayed.html` (sha256 pinned by
`expectation.fixtureSha256`) is:

```html
f.addEventListener('submit',e=>{
 observations.submits.push({agentInvoked:e.agentInvoked,isTrusted:e.isTrusted,q:f.elements.q.value,
                            active:f.matches(':tool-form-active'),respondWith:typeof e.respondWith});
 e.preventDefault();
 …
 else if(mode==='delayed') e.respondWith(new Promise(resolve=>{window.release=()=>resolve(value)}));
});
```

The submit handler pushes into the **append-only** `observations.submits` array **synchronously
inside the submit event**, and `requestSubmit()` dispatches that event synchronously. The producer
`scripts/webmcp-lifecycle-round21.mjs:223` then does:

```
if (mode === 'delayed') { await sleep(250); await observe('delayed-before-release'); frame('release', {}); await bounded(page.evaluate(() => window.release()), …); }
```

So at the `delayed-before-release` marker (250 ms **after** action-complete) the recorder must
already hold exactly **one** submit record with `respondWith:"function"` (the handler calls
`e.respondWith(...)` unconditionally) and `q` = the input value = the nonce; and the release — and
therefore the tool response — can only follow it. Three invariants follow and are all violated by
the counterexamples below:

* **(I1)** `delayed.submits.length === 1` (the submit was dispatched before the release).
* **(I2)** `delayed.submits` is a **prefix** of `post.submits` (the recorder only ever grows), and in
  fact byte-equal to it here.
* **(I3)** the delayed snapshot's document identity (`secureContext`, `formExists`) equals the
  post-action snapshot's, because the oracle itself establishes that no navigation occurred in the
  action window (`measure-c1.mjs:310–312`).

Cross-check over the whole retained corpus (all 12 rows): the append-only recorder is
prefix-consistent in every row, and `delayed.submits` is byte-equal to `post.submits` in
`na-delayed`. So the invariants above hold for genuine evidence and are not fitted to the mutant.

---

## 3. Findings

### F1 — HIGH — `delayed-before-release.submits` is never verified; a raw claiming *no submit was dispatched* is counted

**Where:** `.ufo/waves/round-22/measure-c1.mjs:328–340` (the `expected.delayed` block) and
`measure-c1.mjs:251–252` (where `validatePageState` is applied **only** to `pre` and `post`).

The block verifies `delayed.value.formActive` (`:336`), `delayed.value.errors` (`:338`),
`delayed.value.url` (`:339`), `delayed.value.nonce` and `delayed.value.value` (`:339`), the release
marker count/position (`:333–335`), and the response-after-release ordering (`:337–338`).
**`delayed.value.submits` is never read anywhere in the file** (`grep -n "submits" measure-c1.mjs`
matches only the pre/post paths at `:122`, `:127` and the receipt summary at `:279`). The one field
that distinguishes a *held submit* from *no submit at all* — the whole point of the `na-delayed`
lifecycle — is unchecked.

**Smallest counterexample (counted, must not be):** in
`corpus/evidence/round-21/runtime/na-delayed.json`, set the `delayed-before-release` observation
(`:197–221`, mirrored at `:285–309`) to a copy of the `pre-action` observation, i.e.
`value.submits = []`, then reseal the chain:

1. `corpus/evidence/round-21/runtime/na-delayed.json` → new bytes
2. `corpus/evidence/round-21/runtime/receipt.json` → `cases[na-delayed].evidence.sha256` = sha256(new raw)
3. `.ufo/waves/round-21/runtime-execution-finalized.json` → `artifacts["…/na-delayed.json"]` = sha256(new raw),
   `artifacts["…/receipt.json"]` = sha256(new receipt), `receiptSha256` = sha256(new receipt)

**Observed:** `node .ufo/waves/round-22/measure-c1.mjs <mutant-rev>` → **exit 0, `value 12`,
`verdict clean`, `findings []`**; the `na-delayed` row reports `counted true`, `semanticMatch true`,
`outcome Completed`. The mutated raw is byte-identical to the retained one except that the
`delayed-before-release` snapshot no longer contains the submit record; every digest the oracle
checks (`na-delayed:receipt-raw-digest`, `acquisition-artifact:…`, `acquisition-receipt-digest`)
passes, i.e. the mutation is fully resealed and fully coherent with the receipt/acquisition record.

**Why the mutated raw is contradictory, not merely different:** the fixture's submit handler
(`na-delayed.html`) pushes into `observations.submits` synchronously inside the submit event, and
`requestSubmit()` returns only after that event has been dispatched (the raw's own `action-complete`
frame, seq 14, at 1792590714848, precedes the delayed marker at 1792590715100). A snapshot taken
250 ms later that still shows `submits: []` is impossible for that fixture, and it contradicts the
row's own `post` snapshot (`submitCount: 1`, `na-delayed.json:249–257`) under the append-only
recorder. The mutated raw therefore says "the submit had not been dispatched yet when the tool
response was still pending" — the exact opposite of the delayed-lifecycle semantics the metric
claims to have checked.

**Stronger variant (also counted):** `delayed.submits = [{agentInvoked:false, isTrusted:false,
q:"not-the-nonce", active:false, respondWith:"undefined"}]` — a submit record that the fixture
cannot produce (`respondWith` is always a function there; `q` is always the input value) and that
contradicts the `post` snapshot record field-by-field. Also counted: `value 12 / clean / exit 0`
(command #3 above).

**Preserving positive (nearby mutations that ARE refused, proving the block is not vacuous):**

| control | refused at | finding id | command |
|---|---|---|---|
| `delayed.formActive = false` | `measure-c1.mjs:336` | `semantic_delayed` | #7 |
| `delayed.nonce` wrong | `:339` | `semantic_delayed` | #8 |
| `delayed.errors` non-empty | `:338` | `semantic_delayed` | #9 |
| `delayed.url` ≠ `post.url` | `:339` | `semantic_delayed` | #10 |
| response moved before the release marker | `:337–338` | `semantic_delayed` | #14 |
| response `status` → `Error` | `:291`, `:260`, `:298` | `semantic_status`, `semantic_output` | #11 |
| response `output` reshaped | `:295–298` | `semantic_output` | #12 |
| response carries an extra param | `:295–298` | `semantic_output` | #13 |
| `post.url` path changed | `:140` (`validatePageState`) | `semantic_navigation` | #15 |
| `post.submits` length 2 | `:127` | `semantic_status` | #16 |

**Smallest fix (validated):** in `measure-c1.mjs:333–340`, extend the delayed condition with the
recorder/document-identity comparison — one clause, no change to the pinned expectations file:

```js
        delayed.value?.url !== post?.value?.url || delayed.value?.nonce !== nonce || delayed.value?.value !== nonce ||
+       !Array.isArray(delayed.value?.submits) || !equal(delayed.value?.submits, post?.value?.submits) ||
+       delayed.value?.secureContext !== post?.value?.secureContext || delayed.value?.formExists !== post?.value?.formExists)
       add('semantic_delayed', 'active-before-release-and-response-after-release');
```

Validation of that patch in the throwaway clone (`measure-c1.proposed.mjs`, commands 17–19):
genuine `e3cf4e0` → `value 12 / clean` (no false positive); `delayed-submits-impossible`,
`delayed-submits-empty`, `delayed-copy-of-pre`, `delayed-other-facets` → all `value 0 / failed` with
`semantic_delayed`; all controls still refused. `equal(delayed.value.submits, post.value.submits)`
is satisfied byte-for-byte by the genuine row (`na-delayed.json:204–212` vs `:249–257`), so the fix
preserves the honest positive.

Lane-idiomatic pinning (recommended, mirrors the repair pattern used for
`native-landing-errors`): add a selftest mutation kind `delayed-submits-empty` in
`.ufo/waves/round-22/selftest-c1.mjs` (the `delayed-active-false` kind at `:241–251` is the exact
template — it already touches `observation.value.submits`), plus the matching
`.ufo/waves/round-22/fixtures/expected.json` entry, so the new clause cannot silently regress.

### F2 — MEDIUM — the delayed snapshot's document identity (`secureContext`, `formExists`, `focused`) is unchecked

**Where:** same block, `measure-c1.mjs:328–340`; `validatePageState` is applied only to `pre` and
`post` (`:251–252`).

**Counterexample (counted):** set `delayed-before-release.value.secureContext = false`,
`formExists = false`, `focused = "somewhere-else"` and reseal. Observed: **exit 0, `value 12`,
`clean`** (command #6). The resulting raw claims the document lost its secure context and its form
and that focus moved to an element that does not exist — between two snapshots the oracle itself
proves were the *same document* (no navigation in the action window, `measure-c1.mjs:310–312`), and
whose `secureContext` is `true` before (`:177` frame / `:278` `pageObservations`) and after
(`:260` frame / `:326` `pageObservations`). `secureContext`
cannot change within a document; this raw is impossible and is counted.

**Preserving positive:** `delayed.formActive` false, wrong `nonce`, non-empty `errors`, wrong `url`
are all refused (commands #7–#10) — the block is not vacuous, it is simply blind to the remaining
three fields of the same snapshot.

**Smallest fix:** the two clauses already added under F1 (`secureContext`/`formExists` vs `post`)
close this; `focused` may be added as `delayed.value?.focused !== post?.value?.focused` (genuine
value `"go"` in both snapshots, `na-delayed.json:219` and `:264`).

### F3 — LOW — the pinned contract's `delayed.responseBeforeRelease` is declared but never read

**Where:** `corpus/evidence/round-22/semantic-expectations.json:147` declares
`"responseBeforeRelease": false`; `measure-c1.mjs` never mentions it (`grep -n responseBeforeRelease
.ufo/waves/round-22/measure-c1.mjs` → no match; only `formActiveBeforeRelease` is read, at `:336`),
and `expectationShape` (`:100`) accepts the facet on shape alone.

The rule "the response must arrive after the release" is therefore hardcoded in the implementation
(`:337–338`) instead of being driven by the pinned contract. Today the two agree, so this is not a
wrong count; it is an **unenforced declaration in the pinned file** — the contract asserts a facet
that no code reads, and a future flip of that flag would be silently ignored (the oracle would keep
enforcing the hardcoded inverse). This also means the repair's "pinned expectations unchanged"
property buys nothing here: a contract field nobody reads cannot protect the row.

**Smallest fix (no pin change needed — the value is already `false`):** drive the check from the
contract, e.g. replace the hardcoded `matchingResponses.some((frame) => frame.seq <= release.seq)`
at `:337` with `expected.delayed.responseBeforeRelease === false && matchingResponses.some(...)`,
and add `responseBeforeRelease` to the shape check at `:100`
(`typeof row.delayed.responseBeforeRelease === 'boolean'`), so the flag becomes load-bearing and a
contract change is observable.

---

## 4. What the oracle *does* refuse for this row (exact lines, for the record)

| facet asked by the ticket | enforcement | line(s) | control exercised |
|---|---|---|---|
| exact response status | `response.params.status !== expectedResponse.status` → `semantic_status outcome-status` | `measure-c1.mjs:291` | #11 |
| exact response output shape | deep-equal of `response.params` against `{invocationId,status,output}` → `semantic_output exact-output-shape` | `:295–298` | #12, #13 |
| exact `errorText` | `errorText` branch → `semantic_error exact-error-text-or-output-presence` | `:296–297` | (not applicable to `na-delayed`: its contract row has no `errorText`) |
| exactly one response for the invocation | `matchingResponses.length !== 1` → `semantic_status response-count`; foreign invocation ids → `evidence_binding response-other-invocation` | `:289`, `:256` | — |
| finite pre/post response window | `statuses(beforePre) / statuses(beforePost)` vs contract → `semantic_status finite-window-response-statuses` | `:259–260` | #11 |
| response inside the action→post window | `frame.seq <= actionFrame.seq \|\| frame.seq >= post.seq` → `semantic_timing response-outside-action-window` | `:306–307` | #14 |
| pre-action page state | `validatePageState` → `semantic_status form-state / nonce-state / submit-event`, `semantic_error page-errors`, `semantic_navigation url` | `:107–148`, `:251` | #15, #16 |
| post-action page state | `validatePageState` (incl. `submitCount:1` → `submits` byte-equal) | `:127`, `:252` | #16 |
| navigation (`"none"`) | navigations inside the action window → `semantic_navigation unexpected-post-action-navigation` | `:310–312` | (not triggered: `na-delayed` has no navigation to remove; `ctl-post-url-wrong` changes the *observed* url instead) |
| release ordering / held response | `completeFrame.seq < delayed.seq < release.seq`, no response at/before release | `:333–338` | #14 |
| digest / cross-link binding | receipt↔raw↔execution digests, invocation-id chain, observation↔frame link | `:168` (case identity + fixture digest), `:176–177` (acquisition window), `:181` (`pageObservations`↔observation-frames link), `:190` (observation marker set), `:228`/`:230` (invocation chain + id cross-link), `:250` (observation↔frame link), `:256` (foreign invocation id), `:430–431` (receipt digest), `:432–435` (per-artifact digests), `:472` (row↔receipt raw digest) | all resealed mutants passed these (hence `findings []`) |

**Not enforced (the gap):** the delayed snapshot's `submits`, `secureContext`, `formExists`,
`focused` (F1, F2) and the contract's `responseBeforeRelease` flag (F3).

---

## 5. Reproduction recipe (self-contained; my clone was deleted)

```bash
git clone --depth 1 --no-checkout file:///home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome09
cd /tmp/tabi-r22-w2b-RowOutcome09
git reset --mixed HEAD                       # index = tree, worktree empty
git checkout -q HEAD -- .ufo/waves/round-22/measure-c1.mjs \
  corpus/evidence/round-21/runtime/na-delayed.json \
  corpus/evidence/round-21/runtime/receipt.json \
  .ufo/waves/round-21/runtime-execution-finalized.json
```

Mutation (the whole counterexample; `raw` = parsed `na-delayed.json`):

```python
import hashlib, json, copy
sha = lambda b: hashlib.sha256(b).hexdigest()
dump = lambda o: (json.dumps(o, indent=2, ensure_ascii=False) + "\n").encode()

raw = json.load(open("corpus/evidence/round-21/runtime/na-delayed.json"))
f  = next(x for x in raw["frames"] if x.get("dir")=="observation" and x.get("label")=="delayed-before-release")
o  = next(x for x in raw["pageObservations"] if x.get("label")=="delayed-before-release")
f["value"]["submits"] = []                  # <-- the single contradicting byte change
o["value"] = copy.deepcopy(f["value"])      # keep pageObservations == observation frames
raw_bytes = dump(raw); open("corpus/evidence/round-21/runtime/na-delayed.json","wb").write(raw_bytes)

rec = json.load(open("corpus/evidence/round-21/runtime/receipt.json"))
next(c for c in rec["cases"] if c["id"]=="na-delayed")["evidence"]["sha256"] = sha(raw_bytes)
rec_bytes = dump(rec); open("corpus/evidence/round-21/runtime/receipt.json","wb").write(rec_bytes)

ex = json.load(open(".ufo/waves/round-21/runtime-execution-finalized.json"))
ex["artifacts"]["corpus/evidence/round-21/runtime/na-delayed.json"] = sha(raw_bytes)
ex["artifacts"]["corpus/evidence/round-21/runtime/receipt.json"]      = sha(rec_bytes)
ex["receiptSha256"]                                                  = sha(rec_bytes)
open(".ufo/waves/round-21/runtime-execution-finalized.json","wb").write(dump(ex))
```

Then `git add` the three files, commit, and run
`node .ufo/waves/round-22/measure-c1.mjs <new-rev>` → **exit 0, `value 12`, `verdict clean`**.

Recorded digests of the `delayed-copy-of-pre` mutant (throwaway clone, revision
`232496870de1b809972074c4e281bf30d8ed3d96`, deleted with the clone):

| artifact | sha256 |
|---|---|
| `corpus/evidence/round-21/runtime/na-delayed.json` (mutated) | `be87656f64d1ab7c8a0908f64559dd6765424aad6f27acc3e567ffd518cfdce9` |
| `corpus/evidence/round-21/runtime/receipt.json` (mutated) | `9eb9fb0ff2e06f21fd285b6fd1f46e120e7a36edc537cf33cc515ebd3a552694` |
| `.ufo/waves/round-21/runtime-execution-finalized.json` (mutated) | `4013a3696dcec603b5c5e7162d77c0dc3f14b37f172cfeb60c2118f9a05c0c50` |

Base (unmutated, at `e3cf4e0`): raw `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2`,
receipt `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`,
execution `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`,
pinned expectations `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`.

---

## 6. Scope separation (per the ticket)

* **Real defect (author-side):** F1 (high), F2 (medium), F3 (low) — the `na-delayed` row's
  delayed-lifecycle evidence is under-verified in `measure-c1.mjs:328–340`, and the pinned contract
  under-specifies the delayed facet (`semantic-expectations.json:147`).
* **Not defects (out of my named item / out of scope):** the general "malicious-author authenticity"
  question, browser semantics, and any feature request. I did not evaluate the other 11 rows, the
  C1 metric definition beyond this row, the W2 cap-refusal chain, or the historical W1 chronology
  repairs; they are named as *unclaimed conformance work* in the assignment.
* **Not a finding:** the pinned expectations file's `delayed` facet is minimal by design; F1/F2 are
  therefore partly a *contract* gap. If the author treats the pinned file as immutable, the
  implementation-side clauses in §3/F1 are sufficient on their own (validated) and touch no pinned
  byte.

## 7. Residual risk and verification gaps (honest)

1. **The whole-cohort serial runner was not exercised on a mutant revision.**
   `.ufo/waves/round-22/run-checks.py` was read (`LANE`, `BASE 5f58577…`, it clones the lane into a
   scratch dir) but **not run** against a mutant revision: it needs a full clone of the lane and
   `/tmp` was at 100 % capacity (see §0). Consequence: I have *not* observed whether the lane's own
   serial check suite would flag the mutant. Since the suite's c1 step is this same oracle and its
   selftest mutates the *oracle*, not the *evidence*, I expect it to report `35/35` on the mutant
   as well — but that is an inference, not a measurement.
2. **The selftest was not run** (not required by the item): `selftest-c1.mjs` mutation kinds
   `delayed-early-response` (`:229`) and `delayed-active-false` (`:241`) cover the release ordering
   and `formActive`; there is **no** kind covering the delayed submit recorder, which is exactly why
   the gap survived the repair's own control set. This is a static reading of the kinds, not a run.
3. **Only the `na-delayed` row was attacked.** The same class of gap (no cross-observation
   recorder-consistency rule) plausibly applies to the other 11 rows' `pre`/`post` pairs; a
   prefix-consistency rule across observations would cover the whole cohort. Not measured here.
4. **The proposed fix was validated on the pinned evidence only.** The patched oracle was run
   against genuine `e3cf4e0` (12/12 clean) and against the nine mutants/controls listed in §0.1.
   It was **not** run against the lane's selftest or the full check suite, so its interaction with
   `fixtures/expected.json` control expectations is unverified.
5. **No browser, no new acquisition, no service, no credential** was used (out of scope by the
   bounds); all conclusions are from the retained round-21 bytes plus the pinned round-22 contract.
6. **Tooling:** no install or upgrade was performed or needed (nothing to record). Node was the
   lane-pinned `v24.21.0` at
   `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`.
7. **Lane hygiene:** the only lane write is this report. The throwaway clone
   `/tmp/tabi-r22-w2b-RowOutcome09` was deleted after the review; the lane's git index, jj state and
   history were not mutated (all commits were made in the throwaway clone only).

## 8. Bottom line for the L1 integrator

The repaired oracle at `e3cf4e0` does refuse the status/output/page-state/navigation/window
mutations of `na-delayed` (ten controls, all correctly caught with the exact findings listed in §4).
It does **not** refuse the raw that denies the delayed submit dispatch, nor the raw that corrupts
the delayed snapshot's document identity: both are counted, with `value 12 / verdict clean /
exit 0`, with every digest resealed through the receipt and the acquisition record. Until
`measure-c1.mjs:333–340` compares the delayed observation's `submits` (and `secureContext`/
`formExists`) with the after-action snapshot, the `na-delayed` row certifies a delayed-lifecycle
observation whose most distinguishing fact — that the trusted, agent-invoked submit was dispatched
before the response was released — is unchecked, and the C1 metric `c1_semantically_checked_lifecycle_rows`
overstates semantic coverage for that row.
