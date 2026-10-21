# RevNative — producer native-submit navigation, old-document loss, landing-vs-respondWith output

Round22 W1 read-only seat. Scope: retained source/raw only (S101 runtime acquisition + S100 source interpretation); no browser run, no tests, no production edits. Report-relative paths below abbreviate `corpus/evidence/round-21/runtime/` unless absolute.

Evidence classes: S101 = own-work retained acquisition (raw CDP/fixture bytes + receipt), re-runnable, not publisher corroboration. S100 = scoped Chromium 154.0.8037.97 source interpretation (`corpus/evidence/round-20/sources/html_form_element.cc`, reopened 2026-10-21); no claim that the Arch build binary equals upstream tagged code.

## 1. Reconstructed native-submit trace (S101 raw)

Raw: `na-native-submit.json` (sha256 `28a20412dc11d4d1ed690b4d80414a359193db491518b32277cff5a12eebc9b5`, bound at `receipt.json:248-249` row `na-native-submit`, lines 187-250). Fixture `na-native-submit.html` sha256 `c95abb9cca63862ad93d580ba121d2aa398d97710b1c7d22692aba3cd2dad186`; form `action="/landing" method="get"`, page script records submit events and (dead code here) preventDefault+respondWith.

| seq | at (ms) | record |
|---|---|---|
| 9-10 | …709930 | `WebMCP.invokeTool` {frameId `3F62022BA8EB4F1C7A8BAD21B535C727`, toolName `lifecycle`, input `q=8a5839ad-…`} → invocationId `0950796B8BFFB4979B8CA2A0ABE34A66` |
| 11 | …709931 | `WebMCP.toolInvoked` (same invocationId) |
| 12 | …710183 | pre-action observation: old document readable — nonce, `submits: []`, `errors: []`, url `/na-native-submit`, formActive true, focused `go` |
| 13-14 | …710183-184 | action `submit` dispatch-started → action-complete; producer line 215: `page.evaluate(() => document.querySelector('#f').submit())` (page-context native `form.submit()`) |
| 15 | …710190 | `Page.frameNavigated` type Navigation to `http://127.0.0.1:43143/landing?q=8a5839ad-…`; loaderId `FBB71EFC87ABEFB92ABCD8A0D73EB280` → `F10DC0860EC568D9B6A6B51607869230`; same frameId (document replaced) |
| 16 | …710196 | `WebMCP.toolResponded` invocationId-matched, status `Completed`, `output: [{"dummy":"landing"}]` — an **array** of one object |
| 17 | …710686 | after-action observation: url `/landing?q=…`, `formExists:false`, `formActive:false`, `value:null`, `focused:""`, and **no `submits`/`errors` keys** (old document's `window.observations` no longer exists to read) |

Receipt row mirrors this: preAction window 253ms `responseCount:0`, formActive true; after window 503ms with one response, `after.submits: null`, one navigation (landing loaderId/url), pageState formExists false.

## 2. Landing output vs respondWith output — the distinction

| dimension | respondWith cases (click / requestSubmit / delayed / auto-positive) | native-submit |
|---|---|---|
| `toolResponded.output` | **object** `{ok:true, nonce:<case nonce>, q:<case nonce>}` — na-click.json:199-202, na-requestsubmit.json:205-208, na-delayed.json:235-238, auto-positive.json:178-181 | **array** `[{"dummy":"landing"}]` — na-native-submit.json seq 16 |
| provenance | fixture handler's `value` delivered via `e.respondWith(Promise.resolve(value))` | the `/landing` document's JSON-LD; producer route `scripts/webmcp-lifecycle-round21.mjs:135-138` serves `<script type="application/ld+json">{"dummy":"landing"}</script>` |
| submit event | recorded in post-action `submits` (`agentInvoked:true`, `isTrusted:true`, `respondWith:"function"`) — na-click.json:219-222, auto-positive.json:192-195 | never recorded: `form.submit()` dispatches no submit event; last old-doc read still `submits: []` |
| navigation | none after initial load (preventDefault); frameNavigated only at initial document (na-click.json:36/114, auto-positive.json:32) | exactly one, to `/landing?q=<nonce>`, new loaderId, **preceding** the response (seq 15 < seq 16) |
| old document | survives and stays readable: formExists true, url unchanged (na-click.json:227-234) | destroyed; post-nav probe omits `submits`/`errors`, receipt `after.submits: null` |
| delay path | na-delayed: response only after explicit `release` frame (na-delayed.json:225) with held observation `delayed-before-release` (line 201) | not applicable — response is navigation-coupled |

Mechanism boundary: S100 (`html_form_element.cc` lines ~824-843; note anchors S100:834-842) shows `submitFromJavaScript()` resolving the running WebMCP tool's done callback with `base::ok(String())` — a null String meaning "navigation triggered". That the CDP `toolResponded` output later equals the landing document's JSON-LD is S101 runtime evidence (response 6ms after frameNavigated, content equals the served landing body); the browser-side landing→output mapping is [INFERENCE from retained correlation], not derivable from the null String alone, and is worded exactly that way in `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`. `Completed` for this row therefore does NOT imply respondWith ran — that is a rejected claim in the note.

## 3. Old-document loss representation

The only honest representation of post-navigation old-document submit state is **null/unavailable**, and the retained acquisition already encodes it that way:

- receipt `after.submits === null` (row lines 187-250), never `[]`;
- raw after-action observation (seq 17) omits the `submits`/`errors` keys entirely — the probe evaluated against the landing document, which has no `window.observations`;
- `value:null`, `formExists:false` — distinct from click's post-action `value` retained and `formExists:true`.

An oracle reading this row must treat null ≠ `[]` ≠ `[{…}]`: null = old document gone (unavailable), `[]` = old document alive with zero submit events observed, `[{…}]` = alive with events. The round21 first-repair wording ("preserves unavailable post-navigation submit state as null rather than zero") and the note's "(null, not observed zero)" fix exactly this trap.

## 4. Bounded oracle constraints proposed for the na-native-submit row

All grounded in retained bytes; none invented. Mapped to the stable exported finding names of the round-22 API.

1. evidence_binding: fixture path+sha256 `c95abb9c…`, raw path+sha256 `28a20412…`, receipt row binding must match the evaluated inputs; digest links recomputed coherently on mutation.
2. case_set/invocation: `invokeTool.input.q === nonce === fixture nonce` (`8a5839ad-fc49-4ed6-8661-501aa2c5c4a4` in retained bytes); one invocationId equal across invokeTool result, toolInvoked, toolResponded.
3. pre window (semantic_timing): finite bounded pre-action window (253ms retained) with `responseCount:0`, `formActive:true`, and pre-action observation containing a **present** `submits: []` (old doc readable — this is what makes the later null loss observable).
4. action: `dispatch-started`+`action-complete` frames for page-context `f.submit()`; no submit event anywhere in the row (submits never grows).
5. navigation (semantic_navigation): exactly one post-action `Page.frameNavigated` (type Navigation) with url `/landing?q=<nonce>`, loaderId different from the initial loaderId, same frameId; its seq strictly precedes the response seq. URL without `q=<nonce>`, missing navigation, or response-before-navigation must fail.
6. outcome (semantic_output/semantic_status): exactly one toolResponded; status `Completed`; output **deep-equal** `[{"dummy":"landing"}]` — array of length 1, element exactly `{dummy:"landing"}`. Any of these must fail: object output `{ok,nonce,q}` (respondWith provenance — the core confusion this row exists to exclude); `[]` or missing output (landing JSON-LD lost must not pass as empty); flipped status.
7. old-document loss (fold into semantic_navigation expectation fields): receipt `after.submits === null`; raw after-action observation MUST NOT contain a `submits` array (keys absent); `formExists:false`, `value:null`, `focused:""`. Null→`[]` mutation must fail (fabricates observed-zero after destruction).
8. timing (semantic_timing): response inside the finite after window (503ms retained), after the navigation; ordering from recorded frame sequence, never inferred from wall timestamps alone.
9. cleanup: `contextClosed:true`, `browserPidsAtClose` equals `processIdentitiesAtLaunch` (nonempty sampled identities), `browserPidsSeenAfterClose: []` — sampled survivor observation, not universal quiescence.

Coherent mutations that today's all-silent structural gate admits and this oracle must reject (each keeps hashes/digest links coherent by construction of the red-test procedure): swap output to the respondWith object; reorder toolResponded before frameNavigated; `after.submits` null→`[]`; landing object dropped to `[]`; status flip Completed→Error/silent. Each lands in semantic_output / semantic_navigation / semantic_status respectively.

## 5. Surviving positive controls (must keep passing under the new oracle)

- **na-click** (`na-click.json`) and **na-requestsubmit** (`na-requestsubmit.json`): Completed + object output `{ok,nonce,q}` + post-action submits `[{agentInvoked:true,isTrusted:true,…}]` + no post-initial navigation + `formExists:true`. Positively pins respondWith-as-output-source against landing semantics.
- **na-delayed** (`na-delayed.json`): object output only after the explicit `release` frame; `delayed-before-release` observation shows submit recorded and no response while form active. Pins respondWith-held timing (semantic_delayed) — distinct from navigation-coupled completion.
- **auto-positive** (`auto-positive.json`): Completed + object output with recorded trusted submit event and no `/landing` navigation — proves Completed-with-object-output also arises on the autosubmit submit-event path, so array-output is not merely "any Completed" but the landing signature.
- **na-native-submit itself** is the sole positive control for landing semantics: array output + response-after-navigation + null old-doc state must pass together; no other retained case exhibits that triple.

## 6. Divergences, risks, confidence

- False-positive risk: an oracle checking only status `Completed` (old structural gate) accepts a respondWith object on this row or accepts click-row bytes on this row's identity — excluded by constraints 5-7.
- False-negative risk: over-tightening to require `submits: []` in the after-action observation would reject the true acquisition (keys absent, not `[]`); constraint 7 states absence explicitly.
- The landing→output mapping's browser-side implementation is unobserved (marked inference, §2); the oracle binds observed frames only. No claim about other browsers, bfcache restore, or cross-origin landing targets; the landing route here is same-origin loopback.
- Reset/remove, reject/throw, invalid-submit rows are outside this seat's surface (separate semantic reviews); their errorTexts were not re-derived here.

Confidence: high on the traced sequence, output-shape contrast, and null-vs-zero representation (directly read retained bytes at the cited paths/lines); the mapping mechanism is the only inference and is labeled as such.

Sources read: `corpus/evidence/round-21/runtime/na-native-submit.{json,html}`, `receipt.json:186-251`, `na-click.json`, `na-requestsubmit.json`, `na-delayed.json`, `auto-positive.json`, `scripts/webmcp-lifecycle-round21.mjs:16-26,134-139,212-223`, `corpus/evidence/round-20/sources/html_form_element.cc:824-853`, `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`.
