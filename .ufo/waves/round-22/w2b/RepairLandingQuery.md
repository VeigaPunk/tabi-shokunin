# RepairLandingQuery — post-crash repair D2 attack (round-22, w2b)

**Item:** attack the post-crash repair D2 — `expected urlSearch "?q=$nonce"` now resolves the
embedded token with `encodeURIComponent(nonce)`.
**Reviewed revision:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed).
**Pre-repair checkpoint (contrast):** `0f24164be77e72ba359fe4befdc42d96bc343034`.
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; only this report written).
**Throwaway clone:** `/tmp/tabi-r22-w2b-RepairLandingQuery` (clone at `e3cf4e0`, deleted after the run).
**Node:** `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (v24.21.0). No installs, no browser, no VCS write in the lane/fleet, no delegation, no seat messaging.

---

## 1. What the repair actually changed (verbatim)

`.ufo/waves/round-22/measure-c1.mjs` @ `e3cf4e0`, lines 137-141:

```js
137      // Tokens may sit inside the expected query (`?q=$nonce`), not only as a whole value.
138      const expectedSearch = typeof expected.urlSearch === 'string'
139        ? expected.urlSearch.replaceAll('$nonce', encodeURIComponent(nonce)) : null;
140      if (url.origin !== origin || url.pathname !== expectedPath || url.search !== expectedSearch || url.hash || url.username || url.password)
141        addFinding(findings, 'semantic_navigation', `${id}:${stage}:url`);
```

Before (`0f24164`, line 126) this was `resolveTokens(expected.urlSearch, nonce, inputQ)`, which only
resolves a *whole-value* token, so `"?q=$nonce"` stayed literal and the na-native-submit post state
could never match. The pinned expectation is
`corpus/evidence/round-22/semantic-expectations.json` → case `na-native-submit` → `post.urlSearch = "?q=$nonce"`,
`post.urlPath = "/landing"`, `navigation = "landing"`.

Second, independent landing check that the repair did **not** touch —
`.ufo/waves/round-22/measure-c1.mjs:309-321`:

```js
314      const landing = actionNavigations[0]?.params?.frame?.url;
...
318        validLanding = actionNavigations.length === 1 && url.origin === origin && url.pathname === '/landing' &&
319          url.search === `?q=${encodeURIComponent(nonce)}` && !url.hash;
320      ...
321      if (!validLanding) add('semantic_navigation', 'native-submit-landing');
```

Pins re-verified at `e3cf4e0` (read-only `git show`): expectations digest
`4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` == `measure-c1.mjs:22`;
producer digest `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` == `measure-c1.mjs:23`.
Metric, target 12, and the pinned expectations are unchanged by the repair.

---

## 2. Verdict

**No masking defect found in the D2 token resolution.** Every exactness axis I attacked
(extra params, reordered params, percent-encoding variants, case variants, empty nonce,
`$input` tokens) **fails closed** — the oracle emits a finding and the metric drops to 0.
The repair is strict where it matters and the pre-repair/post-repair diff is minimal and targeted
(§4.1).

Five **real but non-masking** defects/gaps are recorded below, in severity order. All are about the
*strength and coherence of the landing-query claim*, not about the metric being inflated.

---

## 3. Findings

### F1 — MEDIUM — the landing query is asserted against an assumed encoder; the retained server-side observation of that very query is ignored

**Where:** `.ufo/waves/round-22/measure-c1.mjs:138-139` and `:318-319` (both `encodeURIComponent(nonce)`).
**Corpus:** `corpus/evidence/round-21/runtime/receipt.json` → `requests[]`.

The retained receipt already contains the **server-observed** landing request:

```
requests[12] = {"at":1792590710188,"method":"GET","url":"/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4"}
```

(13 requests total: 12 case pages + 1 landing; producer `scripts/webmcp-lifecycle-round21.mjs:131,133,254`
`receipt.requests = requests`). The oracle never reads it: `grep -n "requests" measure-c1.mjs` at
`e3cf4e0` returns **only** the `CASE_IDS` array (line 26) — no reference to `receipt.requests`.

So the D2 claim *"the landing carried the nonce"* is a **reconstruction** of the browser's form
serializer (`encodeURIComponent`) rather than an observation of what was actually put on the wire.
A defect in which the client-visible URL and the received query diverge (rewritten/normalized
query, dropped parameter, a different serialization path) is **invisible to the metric**: the
oracle would still report `value 12`.

**Smallest counterexample (preserving positive):** keep every client-side observation byte-identical
to the retained evidence and change only the retained server-side request line to
`/landing?q=server-side-different-nonce`. The shipped oracle still measures
`value 12 / verdict clean / exit 0` (client-side observation unchanged ⇒ nothing to flag);
the patched oracle below reports `semantic_navigation:na-native-submit:native-submit-landing-request-query`.
**Smallest fix (validated, failure-capable):** in the `expected.navigation === 'landing'` branch
(`measure-c1.mjs:309-326`), compare the retained server request as well. `checkCase` currently does
not receive the receipt-level request log, so the fix is two lines of plumbing plus the check:

```js
// evaluate(): pass the receipt-level request log into checkCase
receiptRequests: Array.isArray(receipt?.requests) ? receipt.requests : null,
// checkCase(): inside the navigation === 'landing' branch
const landingRequests = (receiptRequests || []).filter((row) => typeof row?.url === 'string' && row.url.startsWith('/landing'));
if (landingRequests.length !== 1) add('semantic_navigation', 'native-submit-landing-request-count');
else {
  const observed = new URL(landingRequests[0].url, origin);
  const expectedLandingSearch = expected.post?.urlSearch.replaceAll('$nonce', encodeURIComponent(nonce));
  if (landingRequests[0].method !== 'GET' || observed.search !== expectedLandingSearch)
    add('semantic_navigation', 'native-submit-landing-request-query');
}
```

Executed (patched copy derived mechanically from the shipped file, in the clone):

| probe | mutated input | shipped oracle | patched oracle |
|---|---|---|---|
| P0 control | none | value 12 clean | **value 12 clean** (fix is behavior-preserving) |
| P1 | server request query → `?q=server-side-different-nonce` | value 12 clean (miss) | value 0, `native-submit-landing-request-query` |
| P2 | landing request removed | value 12 clean (miss) | value 0, `native-submit-landing-request-count` |
| P3 | server request `+&x=1` | value 12 clean (miss) | value 0, `native-submit-landing-request-query` |
| P4 | client post URL → `?q=wrong-landing-nonce` | value 0, `semantic_navigation:…:post:url` | value 0, same finding (no regression) |

Caveat to record in the fix: `receipt.requests` is run-global, so the `/landing` filter is only
unambiguous while exactly one case navigates; a second landing case would need per-case attribution
(e.g. by timestamp window or by request→case mapping) before this check generalizes.

---

### F2 — MEDIUM — two independent, divergent sources of truth for the landing query; the pinned expectation is consulted by only one of them

**Where:** `measure-c1.mjs:138-140` (consults the pinned expectation `expected.urlSearch`) vs
`measure-c1.mjs:318-319` (hardcodes `'/landing'` and `` `?q=${encodeURIComponent(nonce)}` `` and never
reads `expected.urlPath` / `expected.urlSearch`).

Consequences:

1. The corpus cannot express a landing shape other than `/landing?q=<nonce>`; a change to the pinned
   expectation would produce a **false** `semantic_navigation` finding rather than a corpus-drift error,
   because the second check would still demand the old shape.
2. The duplication is already error-prone in the exact place this review touched: during fix
   development I first wrote the server-side check against the *case-level* `expected.urlSearch`
   (which does not exist — the query lives at `expected.post.urlSearch`) and the patched oracle
   reported `native-submit-landing-request-query` on the **clean** shipped corpus. The shipped code
   itself does not make this mistake only because it hardcodes the string instead of reading it.

**Smallest fix:** compute the resolved landing expectation once and use it in both checks, e.g. a
shared helper `resolveSearch(expected.post?.urlSearch, nonce, inputQ)` plus `expected.post?.urlPath`,
used by the page-state check (`:138-140`) and by the navigation check (`:318-319`).

---

### F3 — LOW/MEDIUM — the `urlSearch` token vocabulary is `$nonce` only; `$input` (supported everywhere else) is left literal, and the substitution is substring-based

**Where:** `measure-c1.mjs:138-139` (`replaceAll('$nonce', …)`) vs the general resolver
`resolveTokens` at `measure-c1.mjs:59-65` (whole-value `'$nonce'` **and** `'$input'`).

* `$input` inside a query template is never resolved. End-to-end proof (expectation template changed
  to `"?q=$input"`, pinned digest constant updated accordingly in the clone): the **shipped** oracle
  reports `semantic_navigation:na-native-submit:post:url`, value 0 — a permanent false finding, since
  the actual query can never literally be `?q=$input`. With the one-line extension
  (`.replaceAll('$input', encodeURIComponent(inputQ))`) the same corpus measures **value 12 / clean /
  exit 0**. Fail-closed, but a latent false-positive generator for any future landing case whose
  submitted value is not the nonce (the corpus already has a non-nonce `inputQ`: `auto-invalid` → `not-an-email`).
* Substring semantics: `"?q=$nonce&r=$nonce-extra"` → `"?q=<nonce>&r=<nonce>-extra"`, whereas
  `resolveTokens` resolves only whole values. A template that embeds `$nonce` inside a longer token
  would be silently rewritten — a latent false *pass* if such a template ever entered the corpus.

**Smallest fix:** use one shared resolver for all expectation fields, replacing whole tokens only,
e.g. `expected.urlSearch.replace(/\$(nonce|input)(?![A-Za-z0-9_])/g, (m) => encodeURIComponent(m === '$nonce' ? nonce : inputQ))`.

---

### F4 — LOW — `encodeURIComponent` is not the encoder the browser applies to the native GET submit

**Where:** `measure-c1.mjs:139` and `:319`.
**Producer:** `scripts/webmcp-lifecycle-round21.mjs:107` — `<form … action="/landing" method="get">`;
the landing URL is produced by **native form submission**, whose body/query serialization is
`application/x-www-form-urlencoded`. That serializer percent-encodes everything except
`A-Za-z0-9*-._` and encodes space as `+`; `encodeURIComponent` leaves `!'()~` unescaped and encodes
space as `%20`. Divergence set: `! ' ( ) ~` and space.

Today this is inert: the producer's nonce is `randomUUID()` (`scripts/webmcp-lifecycle-round21.mjs:156`),
i.e. `[0-9a-f-]`, and the retained server request confirms the byte-level result
(`/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`). For any nonce containing the divergence set the
expectation would be wrong → false `semantic_navigation` (fails closed: the metric drops, it cannot inflate).

**Smallest fix:** encode the expectation with the urlencoded serializer, or ground it on the retained
server request (F1), which removes the assumption entirely.

---

### F5 — LOW — the "landing" exemption is keyed to a magic case id while the navigation branch is keyed to `expected.navigation`

**Where:** `measure-c1.mjs:117` — `const landing = stage === 'post' && id === 'na-native-submit';`
vs `measure-c1.mjs:311` — `if (expected.navigation === 'none') … else { … }`.

The D1/D2 repairs made the absent-vs-empty rules for the landing document (fresh document without
the fixture's nonce/submits/errors recorders) conditional on a **literal case id**, while the very
same semantic property is expressed as `expected.navigation === 'landing'` three dozen lines later.
A second landing case added to the corpus would be judged by the wrong rule (false positives), and
renaming the case would silently change oracle semantics without any corpus change.

**Smallest fix (validated behavior-preserving):** key it on the expectation and plumb the case-level
navigation kind into the validator:

```js
function validatePageState(actual, expected, nonce, inputQ, origin, id, stage, findings, navigation) { …
  const landing = stage === 'post' && navigation === 'landing';   // was: id === 'na-native-submit'
```
call sites `:251-252` pass `expected.navigation`. Executed: the patched oracle (F5 + F1 together)
still measures **value 12 / clean / exit 0** on the shipped corpus, and still catches the client-side
defect (probe P4).

---

## 4. Verified negatives (attack axes that fail closed)

Executed against the **shipped** oracle at `e3cf4e0` in the clone, over the retained round-21
evidence with the acquisition envelope resealed (receipt/execution digests) so only the intended
defect remains. Every probe reports `exit 1 / value 0` unless stated otherwise.

| probe | mutation | shipped oracle result |
|---|---|---|
| control | none | `exit 0 / value 12 / clean`, 12/12 rows `semanticMatch` |
| M1 | landing URL `?q=<nonce>&x=1` (extra param) | `semantic_navigation:na-native-submit:post:url` |
| M2 | landing URL `?x=1&q=<nonce>` (reordered) | `semantic_navigation:na-native-submit:post:url` |
| M3 | landing URL `?q=<nonce with - as %2D>` (percent-encoding variant) | `semantic_navigation:na-native-submit:post:url` |
| M4 | landing URL `?%71=<nonce>` (percent-encoded key) | `semantic_navigation:na-native-submit:post:url` |
| M5 | landing URL `?q=<nonce uppercased>` | `semantic_navigation:na-native-submit:post:url` |
| M6 | **navigation event** URL gets `&x=1` (post observation untouched) | `semantic_navigation:na-native-submit:native-submit-landing` |
| M7 | post observation still shows the fixture document | `semantic_navigation:na-native-submit:post:url` |
| M8 | **empty nonce** (receipt + raw nonce = `""`) | `evidence_binding:…:case-identity-or-fixture` + `input_shape:…:nonce` → value 0 |
| M9 | landing document carries an `errors` key (D1 axis) | `semantic_error:na-native-submit:post:page-errors` |
| M10 | navigation event URL gets `&y=2` | `semantic_navigation:na-native-submit:native-submit-landing` |
| U1 | unit probe of the shipped expression | `"?q=$input"` → literal `"?q=$input"`; `"?q=$nonce&r=$nonce-extra"` → `"…&r=<nonce>-extra"` (F3) |

Notes on the two axes that most plausibly hide a defect:

* **Extra params / reordered params** are caught by *both* landing checks independently (page-state
  `:140` and navigation `:318-319`), so neither can be bypassed by mutating only one side (M6/M10 vs M1/M2).
* **Empty nonce** cannot produce a passing row: `measure-c1.mjs:161` flags
  `evidence_binding:case-identity-or-fixture` (nonce length < 16) and `:169` returns
  `unavailable('nonce')` → `input_shape` → the global `findings.length > 0` block at `:480` forces
  `value 0` for **every** row (M8). There is no path where an empty nonce yields a counted row.

### 4.1 The D2 repair is minimal and targeted

Running the **pre-repair** oracle (`0f24164`'s `measure-c1.mjs`) over the same retained corpus
reproduces exactly the two findings recorded in `.ufo/waves/round-22/post-crash-repair.json`
(`semantic_error:na-native-submit:post:page-errors` = D1, `semantic_navigation:na-native-submit:post:url` = D2)
with 11/12 rows matching and value 0. The D2 hunk therefore changes the behaviour of **exactly one
check on exactly one case**; no other case's expectation (`urlSearch: ""` everywhere else) is touched,
and the pinned expectations/metric/target are untouched.

---

## 5. Commands executed (all inside `/tmp/tabi-r22-w2b-RepairLandingQuery`, deleted afterwards)

| command | exit | result |
|---|---|---|
| `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `value 12`, `verdict clean`, `findings []`, 12/12 rows `semanticMatch: true` |
| `TMPDIR=$PWD/.scratch node .ufo/waves/round-22/selftest-c1.mjs` | 0 | `verdict clean, cases 44, passed 44` (incl. `native-landing-errors`, `native-landing-wrong-query`, `positive`) |
| `node probe-landing-query.mjs` (mine) | 0 | 11 probes, table in §4 |
| `node probe-fix.mjs` (mine; patched copy of the shipped oracle) | 0 | 5 probes, table in F1 |
| `node probe-token.mjs` (mine) | 0 | T1 `value 0` + `semantic_navigation:…:post:url`; T2 (with `$input` resolved) `value 12 clean` |
| `node /tmp/probe-pre.mjs` (mine; `0f24164` oracle over the same corpus) | 0 | `value 0`, findings = {`semantic_error:…:post:page-errors`, `semantic_navigation:…:post:url`} |

**Honest note on the selftest:** the first run aborted with
`git_failed:commit:fatal: unable to write new index file` because `/tmp` was 100 % full
(`128G/128G`, other lanes' artifacts, not mine — my clone is 111 MB). Re-running with `TMPDIR`
pointing inside my own clone succeeded (exit 0, 44/44). This is an environment condition, not an
oracle failure.

**Unrun / out of scope by the lane bounds:** no browser run (forbidden), no re-acquisition of the
round-21 evidence, no re-measurement of the metric under a new browser, no non-author admission.
All claims above rest on (a) the shipped oracle source at `e3cf4e0`, (b) the retained round-21
evidence and pinned corpus in the lane (read-only), and (c) the executed probes above.

---

## 6. Residual risk / verification gaps

1. **The landing claim is client-side only (F1).** Until the server-observed request is checked, the
   metric asserts what the *page* believed about its own URL, not what was transmitted.
2. **The encoder assumption is producer-specific (F4).** The D2 rule is correct only for the
   producer's UUID charset; the corpus cannot currently express a different landing value, so the
   `inputQ`-vs-`$nonce` distinction (already present in the corpus as `auto-invalid`) is untested
   on a landing path.
3. **Token vocabulary asymmetry (F3).** `$input` in a query is a live false-positive source for any
   future landing case; substring substitution is a live false-pass source for any future template
   that embeds `$nonce` inside a longer token.
4. **Single-case coupling (F5).** The landing semantics of the oracle live in one magic id string.
5. **Untested path:** no probe exercised a *redirect* landing (`/landing` → `/landing2`) or a second
   navigation; the oracle requires exactly one landing navigation
   (`actionNavigations.length === 1`, `:318`) — asserted from code reading, not executed.
6. **Author-side fitting risk** (noted by the repair itself, `post-crash-repair.json.honesty`): D2 was
   authored after observing the failing positive. The present review is author-independent evidence
   that the repaired check is strict (all axes fail closed) and that it did not silently widen the
   accepted set: the pre-repair and post-repair oracles differ on exactly one case/one check (§4.1).

## 7. Recommended disposition

The D2 repair is **acceptable as a strict, fail-closed fix** — no masking defect found; the metric
value 12 at `e3cf4e0` is not inflated by it. Recommended follow-ups, in order of value, all
behavior-preserving on the shipped corpus and all validated above:

1. **F1** — ground the landing query on `receipt.requests` (server-observed) in addition to the client URL.
2. **F2** — single source of truth for the resolved landing expectation, shared by `:138-140` and `:318-319`.
3. **F5** — key the landing exemption on `expected.navigation === 'landing'` instead of the case id.
4. **F3** — one shared, whole-token resolver for `urlSearch` (`$nonce` and `$input`).
5. **F4** — encode the expectation with the urlencoded serializer, or let F1 subsume it.

None of these change the metric, the target, or the pinned expectations, and none may be folded into
the round-22 measurement itself (the round is closed for measurement; these are post-w2b repairs).
