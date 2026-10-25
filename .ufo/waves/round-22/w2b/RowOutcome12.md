# RowOutcome12 — `auto-invalid` row falsification against the repaired round-22 oracle

Review revision: **e3cf4e0d30bb835532ff44b118c5ad52e09eb76d** (round-22: "repair landing-stage oracle defects found by first positive run; retain W2 cap-refusal chain"). Every line reference below is to that revision, read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0…:PATH`. No later repair is claimed or relied on.

Attacked artefacts:

| Artefact | Path | Binding |
|---|---|---|
| Oracle | `.ufo/waves/round-22/measure-c1.mjs` | pristine bytes at the review revision |
| Pinned expectations | `corpus/evidence/round-22/semantic-expectations.json` | `EXPECTATIONS_SHA256 = 4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` (oracle line 22; checked at 392–393) |
| Retained raw | `corpus/evidence/round-21/runtime/auto-invalid.json` | sha256 `28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed` |
| Receipt | `corpus/evidence/round-21/runtime/receipt.json` | `tabi-round21-runtime-v1`, `receiptSha256 = 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| Acquisition | `.ufo/waves/round-21/runtime-execution-finalized.json` | `tabi-round21-experiment-execution-v1`, `artifacts` map of 25 paths |
| Pinned fixture | `corpus/evidence/round-21/runtime/auto-invalid.html` | sha256 `4df781840afdfed1e958e13bd05ad3e9d91ee81c3ab1805affc5014fc4051f6b` |

## Axes and bounded result

Axes named for this seat: (a) exact status/errorText containment for the `auto-invalid` response; (b) pre/post page-state containment; (c) navigation containment; (d) finite response-window containment; (e) invocation↔response correlation; (f) preservation of the genuine 12-row positive population; (g) isolation — all execution inside the private clone, lane untouched.

**Bounded result: five contradictory raw mutations are counted by the pristine oracle; every content mutation of the same row is refused.** The oracle reports `value=12`, `verdict=clean`, `exit=0`, `findings=[]` for all five, i.e. the row is certified as *semantically checked* while its retained transcript says something the pinned expectations and the retained independent evidence contradict. The oracle's refusals are real and correctly anchored (ledger below); the defect is that the refused set does not cover the five contradictions below.

This is a finding about the **oracle's gate**, not about the published corpus. I have no evidence that the retained `auto-invalid` raw at the review revision is untrue — it is internally consistent and every field agrees with the pinned fixture and the pinned expectations. What the five counterexamples establish is that the C1 gate as written certifies rows whose raw contradicts the claim being counted, so `c1_semantically_checked_lifecycle_rows = 12` demonstrates consistency, not semantic correctness of the row.

## Method (all inside the private clone)

Clone: `git clone /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome12`, checked out at `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. The lane was never modified (`git -C … status --porcelain` shows only the wave's own pre-existing untracked artefacts; no VCS write, no `jj` write, no lane script run). The clone was deleted after the runs.

Each mutation edits the retained raw (and the receipt only where the mutation is semantically about receipt-held facts), then **reseals the whole acquisition chain** so that the mutation is not merely a stale-digest artefact:

1. `corpus/evidence/round-21/runtime/auto-invalid.json` bytes → new sha256;
2. `receipt.json` `cases[auto-invalid].evidence.sha256` ← that digest → receipt bytes re-serialised → new receipt sha256;
3. `runtime-execution-finalized.json` `artifacts["…/auto-invalid.json"]` ← raw digest, `artifacts["…/receipt.json"]` ← receipt digest, `receiptSha256` ← receipt digest;
4. the mutated tree is committed in the clone and the oracle is run against that commit (`filesAt(revision)`), so the evaluation uses exactly the resealed bytes.

**Baseline (pristine oracle, pristine corpus):** `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` → process exit **0**, `value=12`, `verdict=clean`, `findings=[]`, `auto-invalid.counted=true`, `semanticMatch=true`, `sequence={invocation:11, preAction:13, action:14, response:12, release:null, postAction:16}`.

## Result table (pristine oracle bytes, resealed digests)

| # | Mutation of `auto-invalid.json` | Contradiction it asserts | Oracle exit | value | row counted | Finding emitted |
|---|---|---|---|---|---|---|
| F1 | move the `WebMCP.toolResponded` frame **before** the `WebMCP.invokeTool` command | the tool answered an invocation that had not been issued yet | 0 | 12 | **true** | none |
| F2 | inject one extra `Page.frameNavigated` (sub-frame) inside the receipt's own `preAction` window | a navigation the retained server request log refutes | 0 | 12 | **true** | none |
| F3 | inject one extra `Page.frameNavigated` (main frame, reload) inside the `preAction` window | a navigation that contradicts both the request log and the retained page state | 0 | 12 | **true** | none |
| F4 | `WebMCP.toolsAdded` `annotations.autosubmit: true → false` | the tool was **not** autosubmit, contradicting the pinned fixture's `toolautosubmit` and the expectation's `autosubmit:true` | 0 | 12 | **true** | none |
| F5 | rotate the case nonce in raw + receipt + page state | the observations came from a page the pinned fixture never produced | 0 | 12 | **true** | none |

Reproducible artefacts of the five accepted mutations. The commit ids are **transient**: they exist only in the throwaway clone, which is deleted at the end of this seat. The mutated raw bytes are byte-reproducible, so the raw digests below identify each mutation exactly, and the harness steps are in the method section above.

| Finding | clone commit | mutated `auto-invalid.json` sha256 |
|---|---|---|
| F1 | `80801901…` | `ef6b18b564ff6c85da252394faa77ae5dadf94c182dc21c878e09fef26cd9d4b` |
| F2 | `658ee5ea…` | `0f77f975cbb6213332541b59ddc94dae2dde3e00d7ccd3d749e3a0488a0d17d7` |
| F3 | `6c3ac99e…` | `805ebb2b6fa89c3abcc3dbebccacf6569775ee985b9539db6149f4a873f429b9` |
| F4 | `77931521…` | `5cef398f8316faf9cb101d1da2c10ecbbc300c1d6d346dc04630bd83a84cb745` |
| F5 | `f0f13019…` | `5990afa6c81509d70f0d9f84abf7a83117062e34454a584e60e18485736742af` |

---

## F1 — the response may precede the invocation it is credited to (High)

**Anchors (review revision).**

- `.ufo/waves/round-22/measure-c1.mjs:2–3` — the metric's own contract: *"Counts only retained round-21 rows whose finite, **invocation-correlated** outcome matches the independent round-22 oracle."*
- `measure-c1.mjs:219–228` (`current-invocation-chain`) orders `sent → commandResult → invoked → pre`; it never involves the response.
- `measure-c1.mjs:231–232` (`invocation-sequence`) is the only response-adjacent ordering check, and it too covers only `sent/commandResult/invoked`.
- `measure-c1.mjs:254–260` computes `matchingResponses` and both finite windows by **seq only**; `measure-c1.mjs:285–307` checks response *content* and the `pre-action` window bound (`seq >= pre.seq` at 304–305) but never a lower bound against the invocation.
- Consequently the oracle never requires `response.seq > invoked.seq`: the only temporal constraint on the response is "before the pre-action observation".

**Smallest counterexample.** In `corpus/evidence/round-21/runtime/auto-invalid.json`, move the existing `WebMCP.toolResponded` frame (seq 12, `at=1792590717647`) to sit **before** the `WebMCP.invokeTool` command frame (seq 9, `at=1792590717645`), set its `at` to `1792590717645`, and renumber `seq`. Diff (raw only; receipt/acquisition digests resealed as described):

```diff
     {
       "seq": 9,
       "at": 1792590717645,
+      "dir": "event",
+      "method": "WebMCP.toolResponded",
+      "params": {
+        "invocationId": "1CB23F49E89D91801A20D1C7DA8CB811",
+        "status": "Error",
+        "errorText": "Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "
+      }
+    },
+    {
+      "seq": 10,
+      "at": 1792590717645,
       "dir": "sent",
       "command": 4,
       "method": "WebMCP.invokeTool",
```

The mutated raw now reads: the browser *answered* invocation `1CB23F49…` (seq 9) **three frames before** the `WebMCP.invokeTool` command that issues that very invocation id (seq 10), and before the `WebMCP.toolInvoked` event (seq 12) that announces it. No browser can produce that ordering: the invocation id does not exist until the command result at seq 11 returns it.

Observed: `exit=0`, `value=12`, `verdict=clean`, `findings=[]`, `auto-invalid.counted=true`, `sequence={invocation:12, response:9, …}` — the oracle's own `sequence` block reports the response **before** the invocation while still certifying the row.

**Preserving positive.** The genuine retained raw has `response.seq=12 > invoked.seq=11`; any fix of this shape must leave it counted. Verified below (patched oracle at the pristine revision: `value=12`, `clean`).

**Smallest fix** (one line, inserted after `measure-c1.mjs:256`):

```js
if (invoked && matchingResponses.some((frame) => frame.seq <= invoked.seq)) add('semantic_timing', 'response-before-invocation');
```

Refuses F1 (`semantic_timing auto-invalid:response-before-invocation`), preserves the pristine 12-row positive — verified in the fix-verification section.

---

## F2 — a navigation inside the receipt's own pre-action window is invisible, and the retained request log that refutes it is never read (High)

**Anchors.**

- `measure-c1.mjs:309–312` — for `expected.navigation === 'none'` the oracle inspects **only** `actionNavigations`, filtered by `frame.at >= receiptCase.after.start && frame.seq < post.seq`, i.e. the post-action window only. The expectation `corpus/evidence/round-22/semantic-expectations.json` for `auto-invalid` states `"navigation": "none"`, i.e. the case claims *no* navigation.
- `corpus/evidence/round-21/runtime/receipt.json` → `requests[]` is the producer's **server-side** request log (`scripts/webmcp-lifecycle-round21.mjs:132–143`). For `auto-invalid` it contains exactly one entry: `{"at":1792590717633,"method":"GET","url":"/auto-invalid"}` — no second request for that case (the only `/landing` entry in the log is `1792590710188 /landing?q=8a5839ad-…`, which belongs to `na-native-submit`).
- The oracle never reads that log: `grep -n "annotations\|\.requests\|processIdentities\|browserPidsSeenAfterClose\|forcedCleanup" measure-c1.mjs` returns **no match** (exit 1). The receipt's `requests`, `processIdentities`, `browserPidsSeenAfterClose` and `forcedCleanup` fields are retained evidence that the oracle does not consult at all.

**Smallest counterexample.** Inject one `Page.frameNavigated` event into the raw at `at=1792590717645` — inside the receipt's own `preAction` window `[1792590717645, 1792590717898]` — with a sub-frame id and the fixture URL, then renumber `seq`:

```diff
+    {
+      "dir": "event",
+      "method": "Page.frameNavigated",
+      "params": {
+        "frame": {
+          "id": "SUBFRAME0000000000000000000000000000",
+          "loaderId": "0BADC0DE000000000000000000000000",
+          "url": "http://127.0.0.1:43143/auto-invalid",
+          "mimeType": "text/html",
+          "secureContextType": "SecureLocalhost"
+        },
+        "type": "Navigation"
+      },
+      "at": 1792590717645,
+      "seq": 10
+    },
```

The retained server log proves this navigation never happened (only one `GET /auto-invalid` was ever served for this case), yet the row whose expectation says `navigation: "none"` is counted as semantically checked. The main-frame variant (same injection with the real frame id, i.e. a reload) is also counted (F3) and additionally contradicts the retained page state: a reload of `/auto-invalid` re-serves the pinned fixture, whose `q` input carries no `value` attribute, so the recorded pre/post `value:"not-an-email"` could not survive it.

Observed: `exit=0`, `value=12`, `verdict=clean`, `findings=[]`, `auto-invalid.counted=true`.

**Preserving positive.** Across the whole corpus only `na-native-submit` has more than one navigation event (2: initial + landing); every `navigation:"none"` case has exactly 1. A fix that requires "no navigation outside the post-action window" therefore preserves all 12 rows — verified below.

**Smallest fix** (one line, inserted after `measure-c1.mjs:312`):

```js
if (navEvents.length !== 1) add('semantic_navigation', 'navigation-outside-action-window');
```

Refuses F2 and F3, preserves the pristine 12-row positive — verified below. (A stricter alternative is to cross-check `receipt.requests` against the raw's navigations; that reuses already-retained independent evidence but needs the request-log ↔ navigation mapping, so the one-line form above is the smaller change.)

---

## F3 — the row's `autosubmit` classification is never checked against the browser-observable tool declaration (Medium)

**Anchors.**

- `measure-c1.mjs:162` — the only autosubmit binding: `raw.autosubmit !== expected.autosubmit || receiptCase.autosubmit !== expected.autosubmit`. Both sides are **producer-written case metadata** (`scripts/webmcp-lifecycle-round21.mjs:161`, `227`), not browser output.
- `measure-c1.mjs:215–228` — `addedTools` / `lifecycleTools` are read for name and `frameId` only. The word `annotations` never appears in the oracle file (verified by grep, no match).
- `corpus/evidence/round-21/runtime/auto-invalid.html` (digest-pinned at `4df781840afd…`) declares `toolautosubmit` on the form; the expectation row states `"autosubmit": true` and `"responseWindow": "pre-action"`.

**Smallest counterexample.** One line in the raw's `WebMCP.toolsAdded` payload:

```diff
             "annotations": {
-              "autosubmit": true
+              "autosubmit": false
             },
```

The raw now states that the tool registered by the browser is **not** autosubmit, while the digest-pinned fixture it was served from declares `toolautosubmit` and the pinned expectation asserts `autosubmit: true`. The oracle compares only the producer's own `autosubmit` field, so the browser-observable declaration — the one fact that could contradict the row's classification — is never examined. Observed: `exit=0`, `value=12`, `verdict=clean`, `findings=[]`, `auto-invalid.counted=true`.

**Preserving positive.** In the retained corpus the `annotations` object exists only for the two autosubmit cases (`auto-positive`, `auto-invalid`, both `autosubmit: true`); the ten `na-*` cases have no `annotations` key at all. A boolean comparison therefore preserves all 12 rows.

**Smallest fix** (one line, inserted after `measure-c1.mjs:216`):

```js
if (Boolean(lifecycleTools[0]?.annotations?.autosubmit) !== expected.autosubmit) add('semantic_status', 'tool-autosubmit-annotation');
```

Refuses F4, preserves the pristine 12-row positive — verified below.

---

## F4 — the raw's nonce is never checked against the digest-pinned fixture bytes (Medium)

**Anchors.**

- `measure-c1.mjs:161` — `raw.nonce !== nonce` binds the raw to the **receipt**.
- `measure-c1.mjs:119–120` — the page state's `nonce` must equal that same raw nonce.
- `measure-c1.mjs:166` — the fixture is bound **only by digest**: `raw.fixture?.sha256 !== sha256(fixtureBytes) || raw.fixture.sha256 !== expected.fixtureSha256`. The fixture's *content* is never parsed, so the nonce literal it embeds (`window.observations={nonce:"ff88f4bf-…"}`) is never compared with the nonce the observations report.

**Smallest counterexample.** Replace the nonce with `11111111-2222-3333-4444-555555555555` in `raw.nonce`, in both observation frames' `value.nonce`, in both `pageObservations[].value.nonce`, and in `receipt.cases[auto-invalid].nonce` (+ `after.pageState.nonce`); reseal digests. The raw then claims page observations whose nonce the pinned fixture never emits, i.e. the retained observations cannot have come from the pinned fixture — yet the fixture digest still matches, because the fixture was not touched. Observed: `exit=0`, `value=12`, `verdict=clean`, `findings=[]`, `auto-invalid.counted=true`.

**Preserving positive.** Every one of the 12 retained fixtures embeds its case nonce (verified: `nonce in fixture` is `True` for all 12 cases), so a fixture↔nonce check preserves the whole population.

**Smallest fix** (one line, inserted after `measure-c1.mjs:169`):

```js
if (fixtureBytes && !fixtureBytes.toString('utf8').includes(nonce)) add('evidence_binding', 'nonce-not-in-fixture');
```

Refuses F5, preserves the pristine 12-row positive — verified below.

---

## F5 — the metric is all-or-nothing (Low / robustness, no separate counterexample)

`measure-c1.mjs:480–484`:

```js
const blocked = findings.length > 0;
for (const row of rows) { row.counted = !blocked && row.semanticMatch; if (row.counted) value++; }
```

`checkCase` merges every per-case finding into the global `findings` array (line 353), so one false-positive in **any** of the 12 rows drives `value` to 0 for all of them. That is a safe direction for a falsification gate, but it makes the published 0→12 number fragile: a single future repair of one row's semantics silently collapses the whole C1 metric rather than the one row. The lane's own selftest (`selftest-c1.mjs`) is not affected by this observation. No counterexample is offered here because the behaviour is intentional-looking, not contradictory.

---

## Refusal ledger — what the pristine oracle *does* refuse (with exact anchors)

Each of the following was executed against the pristine oracle with resealed digests and was **refused** (process exit 1, `value=0`, `verdict=failed`). This is the preserving side of the row's gate and it is correctly implemented.

| Mutation | Finding(s) | Refusing anchor |
|---|---|---|
| `errorText` drifts by one character | `semantic_error auto-invalid:exact-error-text-or-output-presence` + `evidence_binding auto-invalid:receipt-raw-summary` | `measure-c1.mjs:293–299` (exact `errorText` equality) and `:277–280` (receipt `after.responses` vs raw) |
| response `status` `Error → Completed` | `semantic_status auto-invalid:outcome-status`, `semantic_status auto-invalid:finite-window-response-statuses`, `semantic_error …`, `evidence_binding …receipt-raw-summary` | `:291`, `:259–260`, `:296–298`, `:277` |
| response moved **after** the pre-action observation | `semantic_timing auto-invalid:autosubmit-not-before-pre-action` (+ `finite-window-response-statuses`, `finite-summary-windows`) | `:304–305`, `:259–260`, `:268–276` |
| a second `toolResponded` added | `semantic_status auto-invalid:response-count` (+ 3 more) | `:289`, `:256`, `:259–260` |
| page state claims a submit occurred (frames + observation mirror + receipt summary all made self-consistent) | `semantic_status auto-invalid:pre:submit-event`, `…:post:submit-event` | `:121–128` (`submit-event`) |
| page state claims the input was empty (self-consistent across frames/mirror/receipt) | `semantic_status auto-invalid:pre:form-state`, `…:post:form-state` | `:112–114` |
| invoke input drifts to a valid e-mail | `evidence_binding auto-invalid:current-invocation-chain`, `semantic_output auto-invalid:invoked-input` | `:226`, `:233–234` |
| a navigation inside the **post-action** window | `semantic_navigation auto-invalid:unexpected-post-action-navigation` (+ `receipt-navigation-summary`) | `:311–312`, `:281–282` |
| the pinned fixture file is edited | `evidence_binding auto-invalid:case-identity-or-fixture` + `acquisition-artifact:…/auto-invalid.html` | `:166`, `:433–435` |
| the same `errorText` drift **without** resealing | `evidence_binding auto-invalid:receipt-raw-digest` + `acquisition-artifact:…/auto-invalid.json` | `:471–472`, `:433–435` |

The expectations file itself is digest-pinned (`measure-c1.mjs:22`, checked at `:392–393`), so the pinned row cannot be edited to match a mutated raw without producing `input_shape semantic-expectations-digest`.

---

## Fix verification (patched oracle, clone only — the lane oracle is untouched)

A copy of the oracle carrying the four one-line fixes of F1–F4 was generated in the clone (`.ufo/waves/round-22/measure-c1-patched.mjs`, four insertions, no other change) and run against the same revisions:

| Revision evaluated | Pristine oracle | Patched oracle |
|---|---|---|
| `e3cf4e0` (pristine corpus) | exit 0, `value=12`, clean | **exit 0, `value=12`, clean** ← preserving positive preserved |
| `80801901` (F1 response before invocation) | exit 0, `value=12`, clean | exit 1, `value=0`, `semantic_timing auto-invalid:response-before-invocation` |
| `658ee5ea` (F2 sub-frame navigation) | exit 0, `value=12`, clean | exit 1, `value=0`, `semantic_navigation auto-invalid:navigation-outside-action-window` |
| `6c3ac99e` (F3 main-frame navigation) | exit 0, `value=12`, clean | exit 1, `value=0`, `semantic_navigation auto-invalid:navigation-outside-action-window` |
| `77931521` (F4 autosubmit annotation false) | exit 0, `value=12`, clean | exit 1, `value=0`, `semantic_status auto-invalid:tool-autosubmit-annotation` |
| `f0f13019` (F5 nonce rotated) | exit 0, `value=12`, clean | exit 1, `value=0`, `evidence_binding auto-invalid:nonce-not-in-fixture` |

Each fix therefore refuses its own counterexample **and** leaves the genuine 12-row population counted; the four fixes are independent single-line insertions and can be taken separately.

## Residual risk and verification gaps

- **Honest scope.** The corpus at the review revision may well be truthful; nothing here shows the published `auto-invalid` observations are false. The finding is that the C1 gate cannot tell a truthful raw from a contradictory one in five specific respects, so `c1_semantically_checked_lifecycle_rows = 12` is a consistency count, not a semantic-correctness demonstration. Any downstream claim of the form "C1 proves the auto-invalid lifecycle outcome" inherits that weakness.
- **Unrun checks (stated, not claimed).** No browser was run; no new acquisition, coverage, capability, depth, scalar or promotion is claimed. The oracle's `--selftest` path (`measure-c1.mjs --selftest` → `selftest-c1.mjs`) was **not** executed in this seat, so I do not claim anything about the lane's 35/35 or 33/35 receipt counts; my results are from the oracle CLI only. I did not execute `scripts/webmcp-lifecycle-round21.mjs` (no browser, no credentials, out of bounds). I did not test mutations on the other 11 rows: F1–F5 are demonstrated on `auto-invalid` only, though the anchors quoted are shared code paths, so the same gaps are expected on `auto-positive` (identical autosubmit/window shape) and on the `na-*` rows (shared navigation and window code).
- **Not tested.** Whether the injected navigations of F2/F3 are *browser*-impossible as well as log-refuted was not determined; the contradiction used here is against the retained independent request log, which needs no browser-semantics assumption. Whether the producer could ever emit a response before an invocation (it cannot — `scripts/webmcp-lifecycle-round21.mjs:203–205` awaits the invoke result before any response frame exists) is a property of the producer, not a guarantee the oracle enforces.
- **Out of scope, explicitly.** (a) No accusation of malicious authoring: every contradiction above was introduced by me in a throwaway clone; the retained corpus is untouched and internally consistent. (b) General browser/WebMCP semantics, autosubmit behaviour, and what Chromium "really" does are not adjudicated here. (c) Feature requests (e.g. re-running the acquisition, adding an independent attestation) are not filed. (d) The historical W1 wake and W2 chronology repairs are unclaimed conformance work and are not touched by this report.
- **Housekeeping.** The throwaway clone `/tmp/tabi-r22-w2b-RowOutcome12` was deleted after these runs. No tool was installed or upgraded for this seat, so there is no tool/version/channel/reason entry to record.

## Commands run (all inside the clone; exit codes as observed)

| Command | Exit | Result |
|---|---|---|
| `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `value=12`, `clean`, `findings=[]` |
| same, at commit of mutation F1 | 0 | `value=12`, `clean`, row counted |
| same, at commit of mutation F2 | 0 | `value=12`, `clean`, row counted |
| same, at commit of mutation F3 | 0 | `value=12`, `clean`, row counted |
| same, at commit of mutation F4 | 0 | `value=12`, `clean`, row counted |
| same, at commit of mutation F5 | 0 | `value=12`, `clean`, row counted |
| same, at commits of the 10 refusal mutations | 1 | `value=0`, `failed`, findings as listed in the ledger |
| `node .ufo/waves/round-22/measure-c1-patched.mjs e3cf4e0…` | 0 | `value=12`, `clean` (preserving positive) |
| `node .ufo/waves/round-22/measure-c1-patched.mjs <each attack commit>` | 1 | `value=0`, `failed`, one targeted finding each |

Node: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (v24.21.0), the lane's own pinned interpreter.

Report path: `.ufo/waves/round-22/w2b/RowOutcome12.md` (absolute: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/w2b/RowOutcome12.md`).
