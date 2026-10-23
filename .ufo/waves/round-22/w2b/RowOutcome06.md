# RowOutcome06 — attack row `na-remove` of the round-22 C1 semantic oracle

- **Item**: `na-remove` row of `.ufo/waves/round-22/measure-c1.mjs` (metric `c1_semantically_checked_lifecycle_rows`).
- **Revision under test**: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed). All production code was read with
  `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d…:PATH`; the working tree was never used as the oracle's input.
- **Pinned oracle inputs**: `corpus/evidence/round-22/semantic-expectations.json` (sha256 `4a693dce…`, pinned at
  `measure-c1.mjs:22`), `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (first line pinned at `:399`), producer
  `scripts/webmcp-lifecycle-round21.mjs` (sha256 `bc11e4d6…`, pinned at `:23`).
- **Retained raw under attack**: `corpus/evidence/round-21/runtime/na-remove.json` (blob `1e46835f…`, sha256 `e7e32f5f…`),
  `corpus/evidence/round-21/runtime/na-remove.html` (blob `40a50f92…`, sha256 `af61bae3…`, pinned as
  `expected.fixtureSha256`), `corpus/evidence/round-21/runtime/receipt.json` (blob `59912421…`),
  `.ufo/waves/round-21/runtime-execution-finalized.json` (blob `e76b0d85…`).
- **Method**: author-side falsification. Every mutation was applied to the *raw only*, then **all digest links were resealed**
  (raw → `receipt.cases[].evidence.sha256`; receipt → `runtime-execution-finalized.json.receiptSha256`; all 25
  `runtime-execution-finalized.json.artifacts[*]`), then the lane's own oracle was run over the mutated commit.
  The expectations file, the oracle script, the note and the producer were **never modified** in any run
  (`git diff e3cf4e0… HEAD -- .ufo/waves/round-22/measure-c1.mjs corpus/evidence/round-22/semantic-expectations.json
  corpus/knowledge/… scripts/…` is empty for every mutation commit), so `EXPECTATIONS_SHA256`/`PRODUCER_SHA256` held and
  the oracle under test is byte-identical to the revision's.
- **Execution sandbox**: private throwaway clone. `/tmp` was 100 % full (`/dev/nvme0n1p1 128G 128G 352K 100%`), so the clone
  lives at `/var/tmp/tabi-r22-w2b-RowOutcome06` with a symlink at the assigned path `/tmp/tabi-r22-w2b-RowOutcome06`.
  Node `v24.21.0` (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`). The lane, the fleet repo and
  the lane's git/jj state were not touched; no browser, no services, no delegation, no installs.
- **Command shape** (one per mutation): `node .ufo/waves/round-22/measure-c1.mjs <40-hex mutated-commit>` in the clone;
  exit code is the oracle's own exit. Baseline `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`
  → **exit 0, value 12, verdict `clean`, findings `[]`, na-remove `counted: true, outcome: "Canceled"`**.
  Reseal-only control (digests rewritten, bytes otherwise unchanged) → **exit 0, value 12, clean** (proves the reseal
  procedure itself is neutral).

## Verdict

Outcome and identity dimensions attacked on this row (status/output/errorText, pre/post page state, navigation, finite response
window, plus the case-identity binding that makes those checks mean anything):

| Dimension | Result |
|---|---|
| exact status / output / errorText | **closed** — every status/errorText/output mutation was refused with a dedicated finding |
| pre/post page state | **closed** for every field the expectation pins — each mutation refused |
| finite response window | **closed** for the response's position and cardinality |
| navigation | **open** — the navigation claim is window-scoped, so a retained navigation outside `[after.start, post)` is silently ignored |
| (case identity / evidence binding) | **open** — the case token is never bound to the digest-pinned fixture that hardcodes it |

Two coherent, digest-resealed raw mutations that contradict retained pinned evidence are still counted as
"semantically checked". The metric's *value* (12) is therefore not falsified by this attack, but the na-remove row's
`navigation: "none"` claim and its case identity are not actually verified against the retained evidence.

---

## F1 — `na-remove` navigation claim is window-scoped; a retained navigation is silently ignored (medium)

**Where**: `.ufo/waves/round-22/measure-c1.mjs` at `e3cf4e0d…`
- `:236` `const navEvents = frames.filter((frame) => frame.dir === 'event' && frame.method === 'Page.frameNavigated');`
- `:237` only `navEvents[0]` is consumed (to derive `origin`, `:238-244`).
- `:309-310` `const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) => frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];`
- `:311-312` `if (expected.navigation === 'none') { if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation'); }`
- `:281-282` the receipt cross-check uses the *same* window, so it cannot catch a frame outside it either.

`expected.navigation` for `na-remove` is `"none"` (`corpus/evidence/round-22/semantic-expectations.json`, case `na-remove`).
The oracle therefore asserts "this case navigated nowhere", but only over the window
`[receiptCase.after.start, post.seq)`. A `Page.frameNavigated` frame retained **after** the final observation (or **before**
the pre-action observation) is never examined: it is not in `actionNavigations`, it is not in `summarizedNavigations`, and it
does not change `navEvents[0]`.

**Smallest counterexample** (raw-only mutation; digests resealed; receipt untouched):
append one producer-shaped frame to `corpus/evidence/round-21/runtime/na-remove.json` after the final observation:

```json
{ "seq": 17, "at": 1792590712555, "dir": "event", "method": "Page.frameNavigated",
  "params": { "frame": { "id": "C5BA845E4E29A378CAAB9A832DC2D46D",
                         "loaderId": "AABBCCDDEEFF00112233445566778899",
                         "url": "http://127.0.0.1:43143/landing?q=6278395f-f2f9-4082-8c53-1279cad1f220",
                         "mimeType": "text/html", "securityOrigin": "http://127.0.0.1:43143" },
              "type": "Navigation" } }
```
plus the reseal (`receipt.cases[na-remove].evidence.sha256` → `f96d3454…`, acquisition `artifacts` + `receiptSha256`).

**Observed**: `node .ufo/waves/round-22/measure-c1.mjs <mutated-commit>` → **exit 0, value 12, verdict `clean`, findings `[]`,
na-remove `counted: true`** — the row still asserts `navigation: "none"` while the retained raw now records a navigation.

**Why the mutation is contradictory, not merely exotic**:
1. The row's own post observation (`frames[15].value.formExists === false`) says the `<form id="f">` was removed by the
   `remove` action (`scripts/webmcp-lifecycle-round21.mjs:217` → `document.querySelector('#f').remove()`; the `action` frame is pushed at `:220`). The fixture's only
   route to `/landing` is that form (`na-remove.html`: `<form … action="/landing" method="get">`, and its submit handler calls
   `e.preventDefault()`). With the form gone there is no way to issue `GET /landing`.
2. The receipt's independent server-side HTTP log (`corpus/evidence/round-21/runtime/receipt.json` → `requests`, produced by
   `scripts/webmcp-lifecycle-round21.mjs:133` `requests.push({at, method, url})`) records exactly one `GET /na-remove`
   (at `1792590711786`) and **no** `GET /landing` for `na-remove`; the only `/landing` entry in the whole acquisition is
   `GET /landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4` at `1792590710188`, which belongs to `na-native-submit`.

**Related variants that also count** (same mechanism, same run results: exit 0, value 12, clean, na-remove counted):
- retained reload navigation **before** the invocation (inserted at `seq 4`, `at 1792590711790`, `loaderId` changed) — the
  retained raw then claims the page was loaded twice, which the request log's single `GET /na-remove` contradicts (and which
  in reality must have produced a second `WebMCP.toolsAdded`; the oracle's `lifecycleTools.length !== 1` check at `:223` only
  bites if the fabricated raw volunteers that second event);
- retained trailing reload to `/na-remove` instead of `/landing`.

**Preserving positive** (the same navigation, placed *inside* the action→post window, is refused):
`node .ufo/waves/round-22/measure-c1.mjs <mutated-commit>` → **exit 1, value 0, verdict `failed`, na-remove `counted: false`**,
findings `semantic_navigation:na-remove:unexpected-post-action-navigation` and
`evidence_binding:na-remove:receipt-navigation-summary`.

**Smallest fix** (one clause in `checkCase`, right after `navEvents` is computed at `:236`): require every navigation frame to be
accounted for by the expectation, e.g.

```js
const unaccounted = navEvents.filter((frame) => frame !== navEvents[0] &&
  !(post && receiptCase.after && frame.at >= receiptCase.after.start && frame.seq < post.seq));
if (unaccounted.length) add('semantic_navigation', `${id}:unaccounted-navigation`);
```
plus, for `expected.navigation === 'none'`, `navEvents.length === 1`. (Alternatively pin the expected origin/port and compare
the retained navigation set against it.)

---

## F2 — the case token is never bound to the digest-pinned fixture that hardcodes it (medium)

**Where**: `.ufo/waves/round-22/measure-c1.mjs`
- `:160` `const nonce = receiptCase.nonce;` — the nonce is taken from the *receipt*, which the mutation may rewrite.
- `:161-168` the identity block: `raw.nonce !== receiptCase.nonce` → `evidence_binding:na-remove:case-identity-or-fixture`;
  `:165-166` verify `raw.fixture?.path` and `raw.fixture?.sha256 !== sha256(fixtureBytes) || raw.fixture.sha256 !== expected.fixtureSha256`.
- `:170` `const inputQ = resolveTokens(expected.inputQ, nonce, nonce);` and `:59-64` `resolveTokens` — the expectation's
  `$nonce` / `$input` tokens are resolved against **the raw's own self-declared nonce**.
- `:118-120` `const expectedNonce = landing ? undefined : nonce; … actual.nonce !== expectedNonce` — the page observation's token
  is compared with the raw's own token.

The fixture bytes are certified by digest (`:166` against the pinned `expected.fixtureSha256 = af61bae3…`), and those very bytes
contain the case token literally, twice (`na-remove.html`:
`window.observations={nonce:"6278395f-f2f9-4082-8c53-1279cad1f220",…}` and
`const value={ok:true,nonce:"6278395f-f2f9-4082-8c53-1279cad1f220",q:f.elements.q.value};`).
The oracle verifies the fixture's *digest* but never compares the fixture's *content* with the token the row uses, so the
identity chain for `na-remove` is self-referential: raw ⇄ receipt, with the one artifact that could anchor it (the fixture)
content-blind.

**Smallest counterexample** (raw + receipt; digests resealed; fixture bytes untouched):
replace `6278395f-f2f9-4082-8c53-1279cad1f220` with `11111111-2222-3333-4444-555555555555` in
`corpus/evidence/round-21/runtime/na-remove.json` (top-level `nonce`, the `WebMCP.invokeTool` input `q`, the
`WebMCP.toolInvoked` `input` JSON string, and the `nonce`/`value` fields of both page observations) and in
`corpus/evidence/round-21/runtime/receipt.json` (`cases[na-remove].nonce`, `cases[na-remove].after.pageState.nonce`);
reseal `receipt.cases[na-remove].evidence.sha256` → `04877117…` and the acquisition digests.

**Observed**: `node .ufo/waves/round-22/measure-c1.mjs <mutated-commit>` → **exit 0, value 12, verdict `clean`, findings `[]`,
na-remove `counted: true`** — while the digest-pinned fixture the oracle itself certifies still hardcodes
`6278395f-f2f9-4082-8c53-1279cad1f220`, so the retained row now describes a page token the pinned page could never have had.

**Preserving positives** (both refused, so the refusal machinery works and the gap is exactly the missing content check):
- change the raw's nonce only, receipt untouched → **exit 1, value 0, failed**, findings include
  `evidence_binding:na-remove:case-identity-or-fixture` (`:161`) plus `na-remove:current-invocation-chain`,
  `semantic_output:na-remove:invoked-input`, `semantic_status:na-remove:pre:nonce-state`, `…:post:nonce-state`;
- change the fixture bytes together with the token → **exit 1, value 0, failed**,
  `evidence_binding:na-remove:case-identity-or-fixture` (`:166`, fixture digest vs the pinned expectation).

**Smallest fix** (one clause, `fixtureBytes` is already loaded and digest-verified at `:166`):
`!fixtureBytes.includes(nonce)` → `add('evidence_binding', 'case-identity-or-fixture')` (or pin the literal nonce in
`semantic-expectations.json` instead of the `$nonce` token for the identity-bearing fields).

---

## F3 — the receipt's independent server HTTP log is loaded but never consulted (low)

`corpus/evidence/round-21/runtime/receipt.json` carries `requests[]` — the producer's server-side log of every HTTP request
(`scripts/webmcp-lifecycle-round21.mjs:133`). The oracle parses the receipt (`:443-453` region: schema, producer, environment,
cleanup, timestamps, case order) but never reads `receipt.requests`, so nothing cross-checks the raw's navigation/URL claims
against what the server actually served.

**Counterexample**: append `{"at":1792590712560,"method":"GET","url":"/landing?q=6278395f-f2f9-4082-8c53-1279cad1f220"}`
to `receipt.requests` (reseal) → **exit 0, value 12, clean, na-remove counted** — a request that the real acquisition never
made is accepted without a finding. Symmetrically, this is the channel that would have refuted F1's navigation claims.

**Preserving positive**: nothing in the current oracle refuses a request-log edit; the only reason the F1 counterexample is
contradicted today is that the log is *unused*, not that it is checked.

**Smallest fix**: after `:236`, cross-check the retained navigation URLs against `receipt.requests` (e.g. every `Page.frameNavigated`
to a same-origin path must have a matching `GET` entry in the log, and every `/landing` entry in the log must be explained by a
recorded navigation of the owning case).

---

## F4 — the page-observation schema is unconstrained; contradictory extra keys are accepted (low)

`validatePageState` (`:107-149`) checks the fields the expectation pins but never constrains the *key set* of the observation
value; the producer's observation shape is fixed (`scripts/webmcp-lifecycle-round21.mjs:189`:
`{...window.observations, url, secureContext, formExists, formActive, value, focused}`).

**Counterexample**: add `"toolRegistered": true` to the post-action observation (frame + `pageObservations` + the receipt's
`after.pageState` copy, resealed) — i.e. the row now asserts the tool was still registered after the removal — →
**exit 0, value 12, clean, na-remove counted**.

**Preserving positive**: changing a *pinned* field instead (`formExists`/`formActive` → true, `value` → the nonce,
`focused` → `"go"`) → **exit 1, value 0, failed**, `semantic_status:na-remove:post:form-state`.

**Smallest fix**: assert the observation value's key set equals the producer's set
(`['nonce','submits','errors','url','secureContext','formExists','formActive','value','focused']`) before the field comparisons.

---

## F5 — the response window's lower bound is the dispatch-started marker, not the completed action (informational)

`:306` `if (expected.responseWindow === 'action-to-post' && matchingResponses.some((frame) => !actionFrame || !post || frame.seq <= actionFrame.seq || frame.seq >= post.seq))`.
The lower bound is the `action` frame (`phase: "dispatch-started"`, `na-remove.json` `seq 13`), not the `action-complete` frame
(`seq 14`) that marks the completion of `document.querySelector('#f').remove()`.

**Counterexample**: move the `WebMCP.toolResponded` frame between the action and action-complete frames → **exit 0, value 12,
clean, na-remove counted** — i.e. the "tool definition was updated" cancellation can be placed before the removal is known to
have completed.

I do **not** claim this is a contradiction: the producer starts `page.evaluate(...)` *before* pushing the `action` frame
(`scripts/webmcp-lifecycle-round21.mjs:217` then `:220` `frame('action', …)`), so the DOM mutation and the cancellation event
can legitimately race ahead of the `action-complete` marker. It is a limitation of the window's lower bound, not a false pass.
The smallest tightening, if the producer's ordering is ever fixed, is to use `completeFrame.seq` as the lower bound.

---

## F6 — the loopback origin/port is self-declared by the raw (informational)

`:236-244` derive `origin` from the raw's *first* navigation frame (`navEvents[0]`), and every URL check in
`validatePageState` (`:132-146`) is relative to that self-declared origin. Nothing in the pinned corpus states the port.

**Counterexample**: change `127.0.0.1:43143` → `127.0.0.1:55555` in the `na-remove` raw (nav frame + both observations) and in the
receipt's `after.pageState` (reseal) → **exit 0, value 12, clean, na-remove counted**. No retained artifact contradicts the new
port (the request log records paths only), so this is a residual-risk note rather than a contradiction.

---

## Confirmed refusals (the dimensions that *are* closed), with exact code lines

Every mutation below is raw-only + resealed, run as `node .ufo/waves/round-22/measure-c1.mjs <mutated-commit>`;
all produced **exit 1, value 0, verdict `failed`, na-remove `counted: false`**.

| Mutation | Refusing finding | Code line |
|---|---|---|
| response `status` → `Completed` (+`output`) | `semantic_status:na-remove:outcome-status`; `semantic_error:na-remove:exact-error-text-or-output-presence`; `semantic_status:na-remove:finite-window-response-statuses` | `:291`, `:296-298`, `:259-260` |
| `errorText` → `"Tool execution cancelled"` | `semantic_error:na-remove:exact-error-text-or-output-presence` | `:296-298` |
| `errorText` dropped, `output` added | `semantic_error:na-remove:exact-error-text-or-output-presence` | `:292-299` |
| post `formExists`/`formActive` → true | `semantic_status:na-remove:post:form-state` | `:112-114` |
| post `value` → nonce | `semantic_status:na-remove:post:form-state` | `:113` |
| post `focused` → `"go"` | `semantic_status:na-remove:post:form-state` | `:114` |
| pre `value` → `"not-the-nonce"` | `semantic_status:na-remove:pre:form-state` | `:113` |
| post `errors` → non-empty | `semantic_error:na-remove:post:page-errors` | `:129-130` |
| post `submits` → one submit | `semantic_status:na-remove:post:submit-event` | `:121-127` |
| post `url` → `/landing?q=…` | `semantic_navigation:na-remove:post:url` | `:131-145` |
| response frame moved before the action | `semantic_timing:na-remove:response-outside-action-window` | `:306-307` |
| response frame moved after the post observation | `semantic_timing:na-remove:response-outside-action-window`; `semantic_status:na-remove:finite-window-response-statuses` | `:306-307`, `:259-260` |
| second `toolResponded` for another invocation | `evidence_binding:na-remove:response-other-invocation` | `:256` |
| navigation inside the action→post window | `semantic_navigation:na-remove:unexpected-post-action-navigation`; `evidence_binding:na-remove:receipt-navigation-summary` | `:311-312`, `:281-282` |
| `release` marker added (na-remove has no delayed expectation) | `semantic_delayed:na-remove:unexpected-release-marker` | `:341-342` |
| receipt `after.responses` emptied | `evidence_binding:na-remove:receipt-raw-summary` | `:277-280` |
| receipt `preAction` window 10 ms | `semantic_timing:na-remove:finite-summary-windows` | `:268-276` |
| frame timestamp outside the acquisition window | `evidence_binding:na-remove:frame-outside-acquisition-window` | `:176-177` |
| receipt window shrunk below the frames | `evidence_binding:na-remove:frame-outside-acquisition-window`; `semantic_timing:na-remove:finite-summary-windows` | `:176-177`, `:268-276` |
| fixture bytes changed | `evidence_binding:na-remove:case-identity-or-fixture` | `:166` |
| `raw.fixture.sha256` changed | `evidence_binding:na-remove:case-identity-or-fixture` | `:166` |
| `raw.mode` → `throw` / `raw.action` → `reset` / `raw.id` → `na-reset` | `evidence_binding:na-remove:case-identity-or-fixture` | `:161-163` |
| raw nonce changed, receipt untouched | `evidence_binding:na-remove:case-identity-or-fixture` (+6 more) | `:161` |

## Residual risk and verification gaps

- **No browser, no new acquisition.** Everything above is author-side falsification over the immutable bytes of
  `e3cf4e0d…`; nothing here re-runs Chromium 154 or re-measures the retained population. The C1 target remains "12 rows over the
  same retained round-21 observations"; this attack does not change the population, only the strength of the `na-remove` claim.
- **F1 and F2 do not change the metric value** (12 → 12); they show that the `na-remove` row's `navigation: "none"` and its case
  identity are not verified against the retained evidence. The metric's *number* is therefore not falsified here; the row's
  *meaning* is weaker than "the retained round-21 observation of `na-remove`" suggests.
- **Out of scope, not reported as bugs**: malicious-author authenticity (the oracle note itself disclaims it — "Cryptographic
  self-consistency is necessary, not an outcome oracle or a guarantee against an author changing both the evidence and the
  independent expectations"), general browser semantics, and feature requests.
- **Not checked (other seats' scope)**: whether F1/F2/F3/F4 reproduce for the other eleven rows — I attacked only `na-remove`.
- **Not verified**: that the mutated commits are byte-identical to the revision in every file the oracle does *not* read
  (e.g. `scripts/`), and that the `receipt.requests` semantics I relied on are the producer's (verified by reading
  `scripts/webmcp-lifecycle-round21.mjs:133` and `:188-190` at `e3cf4e0d…`, not by re-running it).
- **Sandbox deviation**: the assigned clone path `/tmp/tabi-r22-w2b-RowOutcome06` is a symlink to
  `/var/tmp/tabi-r22-w2b-RowOutcome06` because `/tmp` was 100 % full. The clone is deleted on completion.
- **Tooling**: no installs or upgrades were needed (node v24.21.0 was already present); nothing was added or changed on the host.

## Smallest fix set (if the row is to be claimed as verified)

1. `measure-c1.mjs:236` — account for **every** retained `Page.frameNavigated` frame (F1), or pin the expected navigation set.
2. `measure-c1.mjs:166` — require the digest-verified fixture bytes to contain the case nonce (F2).
3. `measure-c1.mjs` receipt handling — cross-check `receipt.requests` against the retained navigation set (F3).
4. `measure-c1.mjs:107` — constrain the page-observation key set to the producer's shape (F4).

Each is a one-clause change in `checkCase` and none of them changes the expectations file, the producer, or the retained corpus.

Report: .ufo/waves/round-22/w2b/RowOutcome06.md
