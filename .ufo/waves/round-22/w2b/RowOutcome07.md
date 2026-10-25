# RowOutcome07 — `na-reject` falsification against the repaired round-22 C1 oracle

**Seat:** `TabiR22-2.RowOutcome07-12` (leaf; no dispatch, no seat messaging).
**Reviewed revision:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (read via `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show <rev>:PATH`).
**Lane root:** `/home/vgpnk/Projects/shokunin/tabi-shokunin` — read-only for everything except this report.
**Target instrument:** `.ufo/waves/round-22/measure-c1.mjs` at the reviewed revision.
**Pinned expectation:** `corpus/evidence/round-22/semantic-expectations.json` (`sha256 4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`, pinned inside the oracle at line 24).
**Retained raw under attack:** `corpus/evidence/round-21/runtime/na-reject.json` (`sha256 a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741`).
**Throwaway clone used for execution:** `/tmp/tabi-r22-w2b-RowOutcome07` (clone of the lane, checked out at `e3cf4e0`; deleted after this report). No execution happened in the lane.
**No browser, no network, no REA, no installs, no lane VCS mutation.** Only this report was written into the lane.

---

## 1. Verdict in one paragraph

The **outcome surface** of `na-reject` is genuinely closed by the repaired oracle: exact `status`, exact `errorText`, absence of `output`, the whole pre/post page-state record, the finite response window and the in-window navigation are all failure-capable — 48 of my 65 coherent mutations were refused with named findings, and the primary-axis refusals are cited by exact line in §5. The **binding surface** is not closed: the oracle proves the *fixture file* is unchanged but never proves the *evidence content* came from that fixture, never reads the acquisition's server request log, and scopes `navigation:"none"` to the measured window only. Four counterexamples survive, of which **F1 (nonce substitution) contradicts the pinned fixture while the oracle reports `value 12 / clean / exit 0` and counts the row**. F1–F4 are instrument defects, not malicious-author authenticity: the pinned expectations file is untouched (its digest is checked at line 325), so this is *not* the "author changes both the evidence and the independent expectations" case that `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` explicitly disclaims.

---

## 2. Baseline established before attacking (executed)

The oracle's own `evaluate()` was run against the committed bytes of the reviewed revision:

```
BASELINE {"value":12,"verdict":"clean","exit":0,"findings":[],
  "naReject":{"outcome":"Error","semanticMatch":true,"counted":true,
    "sequence":{"invocation":11,"preAction":12,"action":13,"response":15,"release":null,"postAction":16},
    "findings":[],"rawDigest":"a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741"}}
```

Positive baseline: **12 rows, `clean`, exit 0**, `na-reject` counted with outcome `Error` and response frame seq 15 strictly between the action marker (13) and the post observation (16).

The `na-reject` expectation row (pinned file, `cases[6]`):

| field | pinned value |
|---|---|
| `response` | `{status:"Error", errorText:"respondWith promise was rejected"}` |
| `responseWindow` | `action-to-post` |
| `pre` | `formActive true`, `submitCount 0`, `statuses []`, `errors []`, `focused "go"`, `urlPath "/na-reject"`, `urlSearch ""`, `minMs 250` |
| `post` | `formActive false`, `submitCount 1`, `statuses ["Error"]`, `errors ["Uncaught Error: dummy rejection"]`, `focused "go"`, `urlPath "/na-reject"`, `minMs 500` |
| `navigation` | `none` |
| `fixtureSha256` | `eb23b95526f9cea2dbf73b58e0b5f36b596d61fd361d8e41a1bf30fb6eb7f658` |

**Mutation method.** Every mutation below edits the retained raw (and, where the receipt mirrors it, the receipt), then **reseals the whole chain**: `receipt.cases[na-reject].evidence.sha256` → receipt file digest → `.ufo/waves/round-21/runtime-execution-finalized.json` `receiptSha256` + `artifacts[na-reject.json]` + `artifacts[receipt.json]`. The oracle's own acquisition checks (`acquisition-receipt-digest`, `acquisition-artifact:<path>`) accept the reseal with zero findings, so each counterexample is cryptographically coherent. Re-serialization is byte-stable (the producer wrote `JSON.stringify(v,null,2)+'\n'`), verified by round-trip digest equality.

**Scale:** 65 coherent mutations over three batteries; 64 oracle evaluations (one battery entry, `M-W`, aborted inside my own harness helper, not an oracle finding — the adjacent reorderings `M-G`/`M-T` were exercised); **48 refused**, **16 counted clean** (all enumerated in §3–§4). Every one of the 48 refusals is a *named finding*, not merely a non-zero exit.

---

## 3. Findings by severity

### F1 — **HIGH** — the retained evidence is never bound to the **content** of the pinned fixture; a nonce substitution is counted clean

**Where (revision `e3cf4e0`, `.ufo/waves/round-22/measure-c1.mjs`):**
- `:160` `const nonce = receiptCase.nonce;` — the case identity token comes from the **receipt**, which the same attack edits.
- `:166` `raw.fixture?.sha256 !== sha256(fixtureBytes) || raw.fixture.sha256 !== expected.fixtureSha256` — the only fixture check: it proves the fixture **file** is the pinned one and that the raw *self-reports* that digest.
- `:170` `const inputQ = resolveTokens(expected.inputQ, nonce, nonce);` — the pinned `$nonce` tokens in the expectations are resolved against the receipt nonce, never against the fixture.
- `:118-120` (`nonce-state`) — the page observation's `nonce` is compared to that same receipt-derived nonce.

**Why this is a defect, not a tautology.** The pinned expectation for each case carries `fixtureSha256`, i.e. it binds the row to the exact fixture bytes that produced it. The oracle honours the *file* half of that binding and drops the *content* half. The fixture contributes exactly one value to the recorded page state verbatim: `window.observations={nonce:"…"}` (`corpus/evidence/round-21/runtime/na-reject.html:5`, produced by `scripts/webmcp-lifecycle-round21.mjs:105` `fixture()` (called at `:157`), and copied into the observation by `observe()`'s `...window.observations` spread (`:189`). Nothing compares that literal with the raw's `nonce`, so `raw.fixture` remains an **unfalsifiable attestation**: an evidence file can sit next to the correct fixture file and describe a different document.

**Smallest counterexample (executed).** Substitute the case nonce UUID in **13 places in the raw** (`nonce`; `frames[9].params.input.q`; `frames[11].params.input`; `frames[12].value.{nonce,value}`; `frames[16].value.{nonce,value,submits[0].q}`; `pageObservations[0].value.{nonce,value}`; `pageObservations[1].value.{nonce,value,submits[0].q}`) and **5 places in the receipt** (`cases[na-reject].nonce`; `after.submits[0].q`; `after.pageState.{nonce,value,submits[0].q}`), then reseal the three digests. New digests: raw `4ee2553da72c422ebc876dff967b30f253ea2903f0b01782152670e42987ca50`, receipt `3d3096395df40394064dafb1f0b400735fffa8b0121788e87af2fb04901c1a7f`, execution `738fc80f86c60c457501d1862378aebb0c461759eae7ecdcf126c987265997ac`.

Oracle result on the resealed set:

```
oracle verdict: {"value":12,"verdict":"clean","exit":0,"findings":[]}
na-reject row : {"counted":true,"semanticMatch":true,"outcome":"Error","findings":[]}
```

The retained raw now asserts `observations.nonce = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"`, a value the **pinned fixture cannot produce** (`na-reject.html:5` hard-codes `8e99a921-…`), and the oracle reports the row as semantically checked.

**Preserving positive.** The unmutated bytes pass the proposed check, and the check is satisfiable for **all twelve** retained cases, not just this row — measured fixture-embedded nonce vs raw nonce:

```
na-pending equal=true  na-click equal=true  na-requestsubmit equal=true
na-native-submit equal=true  na-reset equal=true  na-remove equal=true
na-reject equal=true  na-throw equal=true  na-delayed equal=true
na-invalid-submit equal=true  auto-positive equal=true  auto-invalid equal=true
```

**Smallest fix (validated in the throwaway clone).** Two lines at `measure-c1.mjs:169`, using the fixture bytes the oracle already reads — no change to the digest-pinned expectations file, no new input:

```js
  // FIX-1: the pinned fixture bytes carry the only value the page observation can
  // report verbatim (window.observations.nonce). Bind the evidence nonce to it.
  const fixtureNonce = /observations=\{nonce:"([^"]+)"/.exec(fixtureBytes?.toString('utf8') ?? '')?.[1] ?? null;
  if (!fixtureNonce || fixtureNonce !== nonce) add('evidence_binding', 'case-identity-or-fixture');
```

Executed result: baseline stays `value 12 / clean / exit 0` (all twelve rows), the F1 counterexample becomes `value 0 / failed / exit 1` with `evidence_binding:na-reject:case-identity-or-fixture`, and the 25 previously-refused page-state/window/binding mutations stay refused (25/25).

**Scope note.** This is *not* the disclaimed "author changes both the evidence and the independent expectations": the expectations file is byte-identical (digest-checked at `:393`) and its `$nonce` placeholders are unchanged; only the evidence side moved. It is also not a claim about author authenticity — it is a claim that the instrument's own `fixtureSha256` binding is only half-implemented.

---

### F2 — **MEDIUM** — the acquisition's server request log is never read; a `/landing` request for this case is counted clean

**Where.** `requests` does not occur anywhere in `measure-c1.mjs` (grep for `requests` over the reviewed revision returns only the `CASE_IDS` string at line 26). The receipt's `requests` array — the producer's own HTTP server log (`scripts/webmcp-lifecycle-round21.mjs` `createServer` handler, `requests.push({at, method, url})`) — is parsed into `receipt` at `:407-409` and then ignored.

**Smallest counterexample (executed).** Append one entry to `receipt.requests`:

```json
{ "at": 1792590713000, "method": "GET", "url": "/landing?q=8e99a921-6728-42cd-82ed-30cd46cf238f" }
```

`at` 1792590713000 lies **inside** `na-reject`'s measured after-window `[1792590712985, 1792590713487)`. Reseal receipt + execution digests. Oracle result: `{"value":12,"verdict":"clean","exit":0,"findings":[]}`, `na-reject` `counted:true`.

**Why it is contradictory.** The pinned expectation for this row is `navigation:"none"`, and the pinned fixture's form is `action="/landing" method="get"` (`na-reject.html:3`). The whole semantic point of the reject terminal is that the rejected submission **never reached** `/landing`. The server log is the authoritative record of whether it did, and here it says the opposite while the oracle certifies "no navigation".

**Preserving positive.** In the genuine receipt the only `/landing` request in the whole log is `{at: 1792590710188, url:"/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4"}` — `8a5839ad-…` is `na-native-submit`'s nonce, not `na-reject`'s. No `/landing` request carries any `navigation:"none"` case's nonce, so a nonce-scoped rule is exactly satisfied by the retained data.

**Smallest fix (validated).** Nonce-scoped, whole-log rule in the `expected.navigation === 'none'` branch (`:315`):

```js
    const landingForCase = (Array.isArray(receipt?.requests) ? receipt.requests : []).filter((item) => {
      if (typeof item?.url !== 'string') return false;
      const [path, query = ''] = item.url.split('?');
      if (path !== '/landing') return false;
      return new URLSearchParams(query).get('q') === nonce;
    });
    if (landingForCase.length !== 0) add('semantic_navigation', 'landing-request-for-case');
```

This needs `receipt` threaded into `checkCase` (signature at `:148`, call site at `:484`) — a two-token change. Executed result: baseline unchanged at 12/clean; the counterexample becomes `value 0 / failed` with `semantic_navigation:na-reject:landing-request-for-case`; all 25 previously-refused mutations stay refused.

**Predecessor.** This is *not* a new finding: `.ufo/waves/round-22/w1/Semantic07.md` §4 **FP-9** predicted exactly this ("server request log not checked for navigation") and it is **still open** at `e3cf4e0`. It is reported here because it is still live, and because this seat's execution confirms the prediction.

---

### F3 — **MEDIUM** — `navigation:"none"` is enforced only inside the measured window

**Where.** `:309-312`:

```js
  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
  if (expected.navigation === 'none') {
    if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
```

The filter is bounded by `after.start` and `post.seq`, so a `Page.frameNavigated` frame **before** the after-window or **after** the post observation is invisible to the check.

**Smallest counterexamples (both executed, both counted clean):**
- `M-H` — append `{"seq":17,"at":1792590713492,"dir":"event","method":"Page.frameNavigated","params":{"frame":{"id":"3140D12E704C21B5F8ED48E670F10946","url":"http://127.0.0.1:43143/landing?q=8e99a921-6728-42cd-82ed-30cd46cf238f"},"type":"Navigation"}}` after the post observation → `value 12 / clean / exit 0`, `na-reject` counted.
- `M-I` — insert the same navigation frame before the pre-action observation → `value 12 / clean / exit 0`, `na-reject` counted.

**Why it matters.** The producer keeps the CDP listener attached until the context closes (`scripts/webmcp-lifecycle-round21.mjs:180`), so late `Page.frameNavigated` frames are producible in a genuine trail, not only by hand. For a `navigation:"none"` row, *any* navigation for that case's nonce contradicts the pinned claim.

**Preserving positive.** Measured over the twelve retained raws: every `navigation:"none"` case has **exactly one** `Page.frameNavigated` frame (the initial load), and `na-native-submit` has exactly two (initial load + `/landing?q=8a5839ad-…`). A trail-wide count of 1 is therefore exactly satisfied by the retained data.

**Smallest fix (validated).** One line in the same branch:

```js
    if (navEvents.length !== 1) add('semantic_navigation', 'unexpected-navigation-in-trail');
```

Executed result: baseline unchanged at 12/clean; `M-H` and `M-I` both become `value 0 / failed` with `semantic_navigation:na-reject:unexpected-navigation-in-trail`; all 25 previously-refused mutations stay refused.

---

### F4 — **LOW/MEDIUM** — the tool-registration event is verified only by name and frame id

**Where.** `:204` (`toolAdds`), `:215-216` (`addedTools`, `lifecycleTools`), `:223-224` (the chain check requires `lifecycleTools.length === 1` and `lifecycleTools[0]?.frameId === treeFrameId` — nothing else about the tool).

**Smallest counterexamples (executed, all counted clean):** rewrite `toolsAdded.params.tools[0].description`; add a second tool to the same event; add a second `toolsAdded` event carrying a second tool; rewrite `inputSchema`; rewrite `backendNodeId`.

**Why it is contradictory.** The pinned fixture declares exactly one declarative tool — `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle">` (`na-reject.html:3`) — and every retained case has exactly one `toolsAdded` event with exactly one tool named `lifecycle` described `Dummy loopback lifecycle`, matching the fixture's `tooldescription` attribute. A raw that claims a different description or a second registered tool cannot have come from that fixture, yet it is counted. The `inputSchema` variant matters beyond cosmetics: the pinned `inputQ:"$nonce"` and the `input: {q: inputQ}` equality at `:226`/`:231` rest on the schema requiring `q`, and a rewritten `required: []` schema would mean the tool could have been invoked with no `q` at all.

**Smallest fix (validated for count and description; schema/backendNodeId remain open).**

```js
  // FIX-4: the pinned fixture declares exactly one declarative tool; the retained
  // registration event must match that declaration (count and description).
  const fixtureDescription = /tooldescription="([^"]*)"/.exec(fixtureBytes?.toString('utf8') ?? '')?.[1] ?? null;
  if (toolAdds.length !== 1 || addedTools.length !== 1 || addedTools[0]?.name !== 'lifecycle' ||
      addedTools[0]?.description !== fixtureDescription)
    add('evidence_binding', 'tool-registration-fixture-mismatch');
```

Executed result: baseline unchanged at 12/clean; description-rewrite, second-tool and second-event variants become `value 0 / failed` with `evidence_binding:na-reject:tool-registration-fixture-mismatch`; the 25 previously-refused mutations stay refused. **Residual:** `inputSchema` and `backendNodeId` remain unverifiable from fixture bytes (the schema is browser-derived, not fixture-literal); pinning them requires re-authoring the digest-pinned expectations file — a larger change than this wave's repair scope, flagged rather than asserted.

---

### F5 — **LOW** — unchecked evidence metadata and an unchecked acquisition stdout

Executed counterexamples, all counted `clean` (`value 12 / exit 0`, `na-reject` counted):

| mutation | what it contradicts | oracle line that should have caught it |
|---|---|---|
| `raw.schema` → `tabi-round21-case-v2` | the raw's own declared schema | none — `raw.schema` is never read |
| `raw.browserPidsAtClose = []` | the producer's close-time process set (`closeOwnedContext`, producer `:72`) | `:349` checks only `browserPidsBefore`/`browserPidsAfter`/`contextClosed`/`closeError`/`blocked`/`downloads` |
| `raw.processIdentities = []`, `processIdentitiesAtLaunch = []`, `browserPidsSeenAfterClose = []` | the launch/close PID-identity evidence | none — never read |
| `raw.browserPidsBefore = [424242]` | the nine real browser PIDs | `:349` only requires a non-empty array of positive integers |
| acquisition `stdout`: `…na-reject pre=0 statuses=Error` → `statuses=Completed` | the acquisition record's **own** independent statement of the measured outcome (`execution.stdout`, `LIFECYCLE_OBSERVED na-reject pre=0 statuses=Error`) | none — `stdout`/`stderr` of the execution record are never compared with the row |

The last one deserves emphasis: the acquisition record already carries a per-case, human-readable statement of the outcome, and the oracle does not cross-check it against the raw it certifies. A one-line edit that makes the acquisition say `statuses=Completed` for this row is counted `clean`.

**Smallest fix (recommended; not executed — flagged honestly).** In `evaluate()`, parse `execution.stdout`'s `LIFECYCLE_OBSERVED <id> pre=<n> statuses=<list>` lines and require them to agree with `rows[i].outcome` and with `expected.pre.statuses` / `expected.post.statuses`; separately require `raw.processIdentities` / `raw.browserPidsAtClose` to be consistent with `raw.browserPidsBefore` (non-empty superset) and `raw.schema` to equal `tabi-round21-case-v1`. **I did not execute these two checks**, so I claim them as a proposal only, not as a validated fix.

---

## 4. Counterexample inventory (all executed against the unmodified reviewed revision)

| id | mutation (raw/receipt, digests resealed) | oracle verdict | first finding |
|---|---|---|---|
| M-A | nonce UUID substituted (13 raw + 5 receipt sites) | **12 / clean / 0 — COUNTED** | — |
| M-H | `/landing` navigation appended after the post observation | **12 / clean / 0 — COUNTED** | — |
| M-I | navigation inserted before the pre observation | **12 / clean / 0 — COUNTED** | — |
| M-J | unknown extra frame (`dir:"note"`) appended | **12 / clean / 0 — COUNTED** | — |
| M-K | `raw.schema` rewritten | **12 / clean / 0 — COUNTED** | — |
| M-L | `browserPidsAtClose` emptied | **12 / clean / 0 — COUNTED** | — |
| M-M | `processIdentities*`, `browserPidsSeenAfterClose` emptied | **12 / clean / 0 — COUNTED** | — |
| M-U | acquisition `stdout` rewritten to `statuses=Completed` | **12 / clean / 0 — COUNTED** | — |
| M-Y | `browserPidsBefore` replaced by an unrelated PID | **12 / clean / 0 — COUNTED** | — |
| FP-9 | `receipt.requests` gains `/landing?q=<nonce>` in-window | **12 / clean / 0 — COUNTED** | — |
| FP-9b | FP-9 + nonce substitution | **12 / clean / 0 — COUNTED** | — |
| TOOLS | `toolsAdded` description rewritten | **12 / clean / 0 — COUNTED** | — |
| TOOLS | second tool in the same event | **12 / clean / 0 — COUNTED** | — |
| TOOLS | second `toolsAdded` event | **12 / clean / 0 — COUNTED** | — |
| TOOLS | `inputSchema` rewritten | **12 / clean / 0 — COUNTED** | — |
| TOOLS | `backendNodeId` rewritten | **12 / clean / 0 — COUNTED** | — |
| M-B | response `errorText` changed | 0 / failed / 1 | `semantic_error:na-reject:exact-error-text-or-output-presence` |
| M-C | response `status` → `Success` | 0 / failed / 1 | `semantic_status:na-reject:outcome-status` |
| M-D | post `errors` emptied | 0 / failed / 1 | `semantic_error:na-reject:post:page-errors` |
| M-E | post `submits[0].isTrusted` false | 0 / failed / 1 | `semantic_status:na-reject:post:submit-event` |
| M-F | post `formActive` true | 0 / failed / 1 | `semantic_status:na-reject:post:form-state` |
| M-G | response moved before the dispatch marker | 0 / failed / 1 | `semantic_timing:na-reject:response-outside-action-window` |
| M-N | post `value` emptied | 0 / failed / 1 | `semantic_status:na-reject:post:form-state` |
| M-O | post URL gains `?x=1` | 0 / failed / 1 | `semantic_navigation:na-reject:post:url` |
| M-P | duplicate response event, same invocation | 0 / failed / 1 | `semantic_status:na-reject:response-count` |
| M-Q | `raw.fixture.sha256` rewritten | 0 / failed / 1 | `evidence_binding:na-reject:case-identity-or-fixture` |
| M-R | post `nonce` key removed | 0 / failed / 1 | `semantic_status:na-reject:post:nonce-state` |
| M-S | pre `formActive` false | 0 / failed / 1 | `semantic_status:na-reject:pre:form-state` |
| M-T | response moved after the post observation | 0 / failed / 1 | `semantic_status:na-reject:finite-window-response-statuses` |
| M-V | receipt `after.responses` disagrees with the raw | 0 / failed / 1 | `evidence_binding:na-reject:receipt-raw-summary` |
| M-X | pre `value` changed | 0 / failed / 1 | `semantic_status:na-reject:pre:form-state` |
| FP-1A | second `toolResponded` after the post marker | 0 / failed / 1 | `semantic_status:na-reject:response-count` |
| FP-2c | response gains an `exception` key | 0 / failed / 1 | `semantic_error:na-reject:exact-error-text-or-output-presence` |
| FP-3B | `errorText` → `""` | 0 / failed / 1 | `semantic_error:na-reject:exact-error-text-or-output-presence` |
| FP-4 | `agentInvoked` false | 0 / failed / 1 | `semantic_status:na-reject:post:submit-event` |
| FP-5 | `release` marker inserted | 0 / failed / 1 | `semantic_delayed:na-reject:unexpected-release-marker` |
| FP-6 | response before the dispatch marker | 0 / failed / 1 | `semantic_timing:na-reject:response-outside-action-window` |
| FP-7 | `toolInvoked` after the pre observation | 0 / failed / 1 | `evidence_binding:na-reject:current-invocation-chain` |
| FP-8 | receipt `after.start` drifted | 0 / failed / 1 | `semantic_timing:na-reject:finite-summary-windows` |
| PS-1…PS-12 | pre/post page state (errors, focused, secureContext, formExists, url path, url port, submit count, submits key, `respondWith`, `active`, duplicated errors, throw-text swap) | 0 / failed / 1 | `semantic_status/semantic_error/semantic_navigation:na-reject:{pre,post}:*` |
| NAV-1 | `/landing` navigation inside the post window | 0 / failed / 1 | `semantic_navigation:na-reject:unexpected-post-action-navigation` |
| NAV-2 | `/na-reject` navigation inside the post window | 0 / failed / 1 | `semantic_navigation:na-reject:unexpected-post-action-navigation` |
| WIN-1 | frame timestamp outside the receipt window | 0 / failed / 1 | `evidence_binding:na-reject:frame-outside-acquisition-window` |
| WIN-2/3/4 | receipt window arithmetic drifted | 0 / failed / 1 | `semantic_timing:na-reject:finite-summary-windows` |
| BIN-1/2/3 | `raw.mode` / `raw.action` / `receipt.invokeError` rewritten | 0 / failed / 1 | `evidence_binding:na-reject:case-identity-or-fixture` |
| BIN-4 | receipt `invocationId` rewritten | 0 / failed / 1 | `evidence_binding:na-reject:current-invocation-chain` |
| BIN-5/6/7 | `contextClosed` false / `downloads` / `blocked` non-empty | 0 / failed / 1 | `evidence_binding:na-reject:case-cleanup-or-boundary` |
| M-W | (post observation reordered before the action) | **not evaluated** | aborted inside my harness helper (`reseq`), not an oracle finding; the adjacent reorderings M-G/M-T were exercised |

Totals: **65 trials, 64 oracle evaluations, 48 refused, 16 counted clean.**

---

## 5. What *is* closed on the primary axes, with the exact refusing lines

For the four axes named in this seat's assignment — exact `status`/`output`/`errorText`, pre/post page state, navigation, finite response window — the repaired oracle at `e3cf4e0` is **failure-capable for `na-reject`**. The refusing code, by line:

| axis | line(s) at `e3cf4e0` | refusal |
|---|---|---|
| exact `status` | `:291` `response.params?.status !== expectedResponse.status` | `semantic_status:…:outcome-status` |
| exact `errorText`, absence of `output`, no extra keys | `:293-299` — `expectedParams` is built from the pinned expectation and compared with `isDeepStrictEqual` over the **whole** params object; `Object.hasOwn(expectedResponse,'errorText')` selects the error branch, else `semantic_output:…:exact-output-shape` | `semantic_error:…:exact-error-text-or-output-presence` |
| response count / foreign invocation | `:289` `matchingResponses.length !== 1`; `:256` any response with a different `invocationId` | `semantic_status:…:response-count`, `evidence_binding:…:response-other-invocation` |
| finite response window | `:304-307` — `responseWindow 'action-to-post'` demands `actionFrame.seq < response.seq < post.seq`; `:258-260` demands the pre-window statuses `[]` and the post-window statuses `["Error"]` | `semantic_timing:…:response-outside-action-window`, `semantic_status:…:finite-window-response-statuses` |
| invocation chain / input | `:215-228` (single `lifecycle` tool, `treeFrameId === initialFrameId`, `sent.seq < result.seq < invoked.seq < pre.seq`), `:229-234` | `evidence_binding:…:current-invocation-chain`, `evidence_binding:…:invocation-id-cross-link`, `semantic_output:…:invoked-input` |
| pre/post page state | `:111-114` (`secureContext`, `formActive`, `formExists`, `value`, `focused`), `:118-120` (`nonce`), `:121-127` (exact submit record incl. `agentInvoked`/`isTrusted`/`q`/`active`/`respondWith`), `:128-130` (exact `errors` array), `:131-144` (origin/path/query/hash/userinfo) | `semantic_status/semantic_error/semantic_navigation:na-reject:{pre,post}:*` |
| observation↔frame mirror | `:181`, `:248-250` | `evidence_binding:…:page-observation-raw-link`, `…:observation-frame-link` |
| action markers / ordering | `:192-200` | `semantic_status:…:action-invocation`, `semantic_timing:…:pre-action-dispatch-post-sequence` |
| receipt↔raw summary | `:262-282` | `evidence_binding:…:receipt-raw-summary`, `…:receipt-navigation-summary`, `semantic_timing:…:finite-summary-windows` |
| delayed/release markers | `:326-342` | `semantic_delayed:…:unexpected-release-marker` |
| cleanup/boundary | `:345-349` | `evidence_binding:…:case-cleanup-or-boundary` |
| in-window navigation | `:309-312` | `semantic_navigation:…:unexpected-post-action-navigation` |

Every W1-named falsification risk that is reachable from the raw/receipt surface is **closed** at `e3cf4e0` — FP-1A (trailing second response) now fails `response-count`, FP-2c (extra `exception` key) fails the params deep-equal, FP-3B (empty `errorText`) fails, FP-4 (`agentInvoked`) fails `submit-event`, FP-5 (`release` marker) fails, FP-6 (response before dispatch) fails, FP-7 (`toolInvoked` after pre) fails the chain, FP-8 (window drift) fails. **FP-9 (request log) is the one W1 risk still open** — see F2.

---

## 6. Validated smallest fix set (executed in the throwaway clone; **not** applied to the lane)

Applied to a copy of `measure-c1.mjs` in `/tmp/tabi-r22-w2b-RowOutcome07` only — the lane was not touched and no commit was made:

| fix | location in the reviewed file | effect | baseline preserved? |
|---|---|---|---|
| FIX-1 fixture-nonce binding | new lines at `:169` | F1 refused: `evidence_binding:na-reject:case-identity-or-fixture` | yes — 12 / clean / exit 0 |
| FIX-2 nonce-scoped `/landing` request rule (+ thread `receipt` into `checkCase`, `:148` / `:484`) | `:315` branch | F2 refused: `semantic_navigation:na-reject:landing-request-for-case` | yes |
| FIX-3 trail-wide navigation count | `:315-325` branch | F3 refused: `semantic_navigation:na-reject:unexpected-navigation-in-trail` | yes (11 of 12 cases have exactly 1 nav frame) |
| FIX-4 tool-registration↔fixture binding | after `:220` | F4 (count + description) refused: `evidence_binding:na-reject:tool-registration-fixture-mismatch` | yes (all 12 cases: 1 event, 1 tool, description = fixture's `tooldescription`) |

Patched-oracle statistics over the same batteries: **56 refused, 8 still counted clean, 25/25 of the page-state/window/binding battery still refused.** The eight still clean are `M-J` (unknown extra frame), `M-K` (`raw.schema`), `M-L` (`browserPidsAtClose`), `M-M` (`processIdentities*`), `M-U` (acquisition `stdout`), `M-Y` (`browserPidsBefore`), `TOOLS inputSchema`, `TOOLS backendNodeId` — i.e. F5 plus the two schema-level residuals of F4.

---

## 7. Residual risk and verification gaps

1. **The repository already holds a stronger corroborator that the oracle ignores.** `.ufo/waves/round-21/final/semantic-contrast-witness.json` records, for `na-reject`, `evidenceSha256 a57b41bd…`, `acquisitionSha256 65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` (the execution record's digest), the responses, the markers, `postSubmits[0].q = 8e99a921-…` and `postUrl`. Any of F1/F2/F3 is caught by that file — but it is **not** in `INPUT_PATHS` (`measure-c1.mjs:38-41`) and no round-22 check script references it (grep over `.ufo/waves/round-22/**/*.py|*.mjs`: no hit). Adding the witness as an oracle input and checking `witness.acquisitionSha256 === sha256(executionBytes)` would anchor the entire chain to a second artifact and is a stronger fix than FIX-1..FIX-4 individually. **Not executed by me** — flagged, not claimed.
2. **The pinned note over-claims.** `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` states: *"Expected statuses and outcome shapes are independent of the evaluated receipt: a coherently changed raw event and summary, with corrected digest links, must still fail the case's semantic expectation."* That holds for the status/output/error/page-state axes (§5) and **fails for the binding axes**: F1, F2, F3 and F4 are each exactly "a coherently changed raw event and summary, with corrected digest links", and each is still counted `clean`. The note's other disclaimer — *"Cryptographic self-consistency is necessary, not an outcome oracle or a guarantee against an author changing both the evidence and the independent expectations"* — does **not** cover these, because the expectations file is untouched and digest-checked at `:393`. The sentence should be narrowed to the outcome axes, or the binding axes should be closed first.
3. **Unverified by me:** the lane's own `selftest-c1.mjs`, the lane's `run-checks.py`, the CLI form `node measure-c1.mjs <40-hex>` (my evaluations called the exported `evaluate(files)` in-process with an in-memory file map — the CLI path `filesAt(revision)` was not exercised, and my patched copy was never run through the lane's selftest fixtures), the producer, and any browser behaviour. The proposed FIX-1..FIX-4 therefore carry a "validated against `evaluate()` on the committed bytes" qualifier only.
4. **Not attempted (out of scope per the seat's bounds):** malicious-author authenticity, general browser semantics, feature requests, the `na-native-submit` landing repair (`D1`/`D2` in `.ufo/waves/round-22/post-crash-repair.json`), and any non-`na-reject` row's semantics — the other eleven rows were only exercised as *positive-preservation* controls for the fixture-nonce, navigation-count and tool-registration rules.
5. **Environmental note (honest):** `/tmp` (a separate 128 GB partition) reached 100 % occupancy from other agents' scratch during this seat's run; one `cp` failed with exit 1 (`No space left on device`) and was retried successfully after space was freed. No evidence was lost and no result above depends on a truncated file. The throwaway clone was deleted after this report was written.
6. **Falsification posture.** These are author-side findings on author-side code; per the seat's acceptance criteria they are reported as instrument defects with counterexamples, not as admissions. Nothing here changes the metric target, the pinned expectations digest, or the retained bytes: the reviewed revision still measures 12/clean, and the defects are in what that instrument fails to *distinguish*, not in the measurement it reports.

---

## 8. Commands executed (exit codes)

| command | exit | note |
|---|---|---|
| `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d…:<path>` (oracle, expectations, receipt, execution, raw, fixture, producer, note, witness, w1 reports, post-crash-repair.json) | 0 | read-only |
| `git -C … grep -l/-c "8e99a921-6728-42cd-82ed-30cd46cf238f" e3cf4e0d…` | 0 | 6 files carry the nonce |
| `git clone /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome07` | 0 | then `git checkout e3cf4e0d…` (0) |
| `node harness.mjs` (battery 1, 25 trials) | 0 | 15 refused, 9 counted clean, 1 harness-side error (M-W) |
| `node harness2.mjs` (battery 2, 15 trials) | 0 | 8 refused, 7 counted clean |
| `node harness3.mjs` (battery 3, 25 trials) | 0 | 25 refused, 0 counted clean |
| `node counterexample.mjs` | 0 | wrote the F1/FP-9 artifacts + unified diffs under `counterexample/` |
| `node harness-p1.mjs` / `harness-p2.mjs` / `harness-p3.mjs` (patched oracle) | 0 | 56 refused, 8 counted clean, 25/25 regression hold |
| `cp .ufo/waves/round-22/measure-c1.mjs ./measure-c1-proposed.mjs` | 1 → 0 | first attempt: `No space left on device`; retried after `/tmp` freed |
| `df -h / /home /tmp`, `du -sh` | 0 | environment diagnosis |

**Not run:** browser, producer (`scripts/webmcp-lifecycle-round21.mjs`), the lane's `selftest-c1.mjs`, `run-checks.py`, `measure-c1.mjs <revision>` CLI form, REA, network, any install.

**Installs / updates:** none. Node was taken from the lane's pinned interpreter `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`; no package manager transaction was needed or performed.

**Report:** `.ufo/waves/round-22/w2b/RowOutcome07.md`
