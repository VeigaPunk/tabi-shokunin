VERDICT: PASS

# SrcWebTests — Chromium 154 web tests for WebMCP invocation (execute / invoke / abort)

**Question.** What does the Chromium 154 tag's own web-test tree assert about WebMCP
execution, invocation and abort, enough to fix the C2 harness's predicates before it runs?

**Answer.** At tag `154.0.8037.97` upstream asserts an abort-centric page-API contract
(`executeTool`) plus a CDP `invokeTool`/`cancelInvocation` error contract. These are source
assertions, not passing-suite evidence: the two CDP invoke tests have no `-expected.txt`
and `TestExpectations` carries no webmcp or model_context line, so they ground what an
invocation receipt *may predict*, never what this build is shown to do.

## Access (real fetches, 2026-10-20)

- Tag ref resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles
  `+/refs/tags/154.0.8037.97?format=JSON`; identical to the commit S033 records).
- Every file fetched as gitiles `?format=TEXT` (base64), decoded locally. Anchor file
  cross-checked byte-exact: `git hash-object -t blob` = `c18b523adce64a2bb7cdecb8f0a3c975b4a671a7`
  = gitiles blob id for `executeTool-abort.https.html`.
- Canonical tree: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/`
- Probes: `wpt_internal/model-context` 404, `external/wpt/model-context` 404,
  `wpt_internal/webmcp` 200, `external/wpt/webmcp` 200, `inspector-protocol/webmcp` 200,
  `inspector-protocol/model-context` 200, `wpt_internal/webmcp/css` 200. Upstream
  `https://github.com/web-platform-tests/wpt/tree/master/webmcp` 200 — the tag's WPT copy
  is **not** current upstream (contradiction 4).

## Gate (for the L1's `## Gate`)

- Row: S0?? (draft, next id after S040 assigned by L1)
- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html
- Accessed: 2026-10-20
- Location: line 87 of that file at the tag (revision above); file is 8013 bytes, 205 lines.
- Quote (6 words, verbatim): `assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);`
- sha256 (decoded raw bytes): `faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e`
- Second grounding quote, same file line 113: `assert_equals(executionRejectionValue, 'already aborted');`

### Secondary anchors at the same revision (each own sha256)

| File (under `third_party/blink/web_tests/`) | Anchor | sha256 |
|---|---|---|
| `external/wpt/webmcp/imperative/executeTool-invalid-dictionary.https.html` | :31-37, :50-53, :66-69 | `0116c5f6accee05b0e3ac6fc49a3abf446ca35e2e221d13d60811c3494175c40` |
| `external/wpt/webmcp/imperative/unregister-during-executeTool.https.html` | :85, :121 | `2515eb0320970296ffab58d51850f65bc7538263f8acaa7ab54ad7ecd4b4793d` |
| `external/wpt/webmcp/imperative/executeTool-target-navigation.https.html` | :44-49 | `36913e17b7857668ac0b6a86eb86940504bc9dd0b818173c62a888de379dca11` |
| `external/wpt/webmcp/imperative/executeTool-caller-navigate-abort.https.html` | :84-87 | `cbfcf73eb82125b05bd653ee6a72b8d98a918cd42edd052ef150e9c4323f98c8` |
| `external/wpt/webmcp/imperative/executeTool-target-detachment.https.html` | :54-60, :105-111 | `14ca67306624ed44a47ccb0bb4c183695ef5f48ec3cde977af7e85c160914349` |
| `external/wpt/webmcp/imperative/executeTool-signal-cross-origin.https.html` | :68, :120 | `43c8b6bcef08a75cd4ce639c6d1de0eebe3effb55f3944ac86449b4a82086e99` |
| `external/wpt/webmcp/imperative/executeTool-unauthorized-origin.https.html` | :58 | `67f3fdac90bdff8789c26f54d97fd7b533665a5d042273dd2f78cc63c627e186` |
| `external/wpt/webmcp/imperative/executeTool-error-window-onerror.https.html` | :38-44, :67-74 | `554a40fb53eb67e762881ecc044ada3331b7fed3989546a75f560cf2a9f318c4` |
| `external/wpt/webmcp/imperative/permissions-policy.https.html` | :57, :83, :111 | `5796196802a8132bcc6e8c83090b385c5c350499dd01d8f86e4cfc5818ebc97d` |
| `external/wpt/webmcp/declarative/executeTool-abort.https.html` | :56-66 | `0a7d9e466a46aef07a39a3671311549f90a3358ddb4fd3113ce564bf11336393` |
| `inspector-protocol/webmcp/invoke-tool.js` | :38-51, :54-67, :71-85 | `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c` |
| `inspector-protocol/webmcp/cancel-invocation.js` | :42-57 | `f285ffe67f24fbe1572ceea23829420ed3610403e144da807e8f02bff936f867` |
| `wpt_internal/webmcp/abort_registration_gc.https.window.js` | :1-33 | `3843a4c18bf4e8d445d586221965c1a21daa2dcab92f69b4e44850bd68ec2cb1` |
| `wpt_internal/webmcp/custom-element-fill.https.html` | :12, :18 | `fbaf2e2e1de88a99c4570d0cb4ab2b2dab9012d57bdb468d068008ad215bcc5d` |
| `wpt_internal/webmcp/css/tool-active-pseudo-parsing.html` | :5-14 | `efb2b8eb4d5cc03ee0df2bb4b090d9b2d650d95fc456563dae31cf9a6cc65c43` |
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | :27-30, :59-70 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| `third_party/blink/renderer/platform/runtime_enabled_features.json5` | :7023-7050 | `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` |

## Draft registry row (13 pipe fields, no `|` inside cells)

| S0?? | Chromium 154 web tests for WebMCP invocation (WPT imperative suite plus inspector-protocol harness) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html | code | A | Invocation, abort and error semantics upstream asserts at tag 154.0.8037.97, build-scoped | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), executeTool-abort.https.html:87 and :113, inspector-protocol/webmcp/invoke-tool.js:38-51, WebMCP.pdl:68 | Upstream asserts caller abort rejects with the caller's reason and fires toolcancel, unregistering mid-execution still resolves, and CDP invokeTool returns an invocationId that toolResponded echoes | queued | 2026-10-20 | on-release | — |

Bookkeeping note for L1: keep `queued` until `corpus/knowledge/webmcp-invocation-round-17.md`
exists, then flip to `mined` with `used-by` = that path (the census fails a `mined` row whose
`used-by` path is absent). Proposed tier **A** scoped to "what the 154-tag test tree asserts",
kind **code**, recheck **on-release** (the tree is build-pinned; T4 shows upstream drift).

## Facts this row supports for C2 (each with its own anchor)

| # | Fact | Anchor | Status |
|---|---|---|---|
| F1 | Caller abort order is fixed: tool starts, `toolactivated`, execution rejects, target signal aborts, `toolcancel`; rejection value equals the caller's abort reason and the target sees a DOMException `AbortError` | executeTool-abort.https.html:87-90 | observed (test text) |
| F2 | An already-aborted signal rejects `executeTool` in the same microtask (synchronously), never running the tool | executeTool-abort.https.html:104-113 | observed |
| F3 | Two concurrent `executeTool` calls on one tool get independent signals; aborting one rejects only it, with the exact reason | executeTool-abort.https.html:187-194 | observed |
| F4 | `executeTool` input is a JSON **string** (`'{}'`) throughout; invalid JSON rejects `UnknownError` | executeTool-abort.https.html:26,66,106; executeTool-invalid-dictionary.https.html:50-53 | observed |
| F5 | Omitting the tool dictionary's required `origin` member rejects `TypeError`; a fabricated non-existent tool rejects `UnknownError` | executeTool-invalid-dictionary.https.html:31-37, :66-69 | observed |
| F6 | Unregistering the target tool mid-execution does **not** abort it and does not reject: the pending promise still resolves to the tool's result | unregister-during-executeTool.https.html:85, :121 | observed |
| F7 | Target-document navigation or detachment while executing rejects `UnknownError`; caller-document navigation aborts the target's `options.signal` | executeTool-target-navigation.https.html:44-49; executeTool-target-detachment.https.html:105-111; executeTool-caller-navigate-abort.https.html:84-87 | observed |
| F8 | A cross-origin iframe caller's abort reason is routed to the parent as `AbortError`; an unauthorized parent execution rejects `UnknownError` | executeTool-signal-cross-origin.https.html:68, :120; executeTool-unauthorized-origin.https.html:58 | observed |
| F9 | A throwing tool or a non-serializable (circular) return rejects `UnknownError` and must **not** fire a window `error` event | executeTool-error-window-onerror.https.html:38-44, :67-74 | observed |
| F10 | Without `allow="tools"`, iframe `getTools`/`executeTool` reject `NotAllowedError`; registration fails after navigation to an uncovered origin | permissions-policy.https.html:57, :83, :111 | observed |
| F11 | Declarative tools: aborting `executeTool` fires `toolcancel` and clears `:tool-form-active` and `:tool-submit-active` on the form and control | declarative/executeTool-abort.https.html:24-27, :47-66 | observed |
| F12 | CDP `invokeTool` returns `invocationId`; `toolResponded` carries the matching id; unknown tool name and invalid `frameId` each return an error; a throwing tool still yields an `invocationId` and a `toolResponded` with status/exception | inspector-protocol/webmcp/invoke-tool.js:38-51, :54-67, :71-85 | observed |
| F13 | `cancelInvocation` with an unknown id errors, with a live id succeeds, and a second cancel of the same id errors; the first invocation's `toolResponded` still arrives | inspector-protocol/webmcp/cancel-invocation.js:42-57 | observed |
| F14 | The 154 PDL says the `invokeTool` response precedes tool events, and `toolResponded.status` is `Completed`/`Canceled`/`Error` with `output` untrusted (prompt-injection risk) | WebMCP.pdl:68, :27-30, :112-123 | observed |
| F15 | Aborting a registration signal after a major GC still unregisters the tool, so re-registering the same name succeeds | wpt_internal/webmcp/abort_registration_gc.https.window.js:1-33 | observed |
| F16 | 154 carries a form-associated-custom-element declarative surface (`setToolParamSchema`, `toolFillCallback`) gated by `WebMCPFormAssociatedCustomElements` | custom-element-fill.https.html:12 and :18; runtime_enabled_features.json5:7043-7046 | observed |

Confidence: all F1-F16 are read from the pinned bytes above (not run). None of them is a
runtime observation of this host's `/usr/bin/chromium`; the C2 harness must re-observe.

## Contradictions and qualifications

1. **r16 note, Events row (build lags spec).** The note says the 154 prototype has
   `ontoolchange` but no `ontoolactivated`/`ontoolcancel`. The 154 tests listen for
   `toolactivated` and `toolcancel` **on `window`** during `executeTool`
   (executeTool-abort.https.html:36-44,64; declarative/executeTool-abort.https.html:29,47).
   These are event dispatch targets, not IDL `on*` attributes, so the note is not false but
   is under-specified: either the events fire at `window` (and the note's "build lags spec"
   row needs narrowing) or those tests cannot pass at 154. The harness should record which
   target (`window` vs `document.modelContext`) delivered each event.
2. **S034 (runtime features) is incomplete.** It teaches "implied by WebMCPTesting at 154".
   The real `implied_by` list at 154 is three names — `WebMCPDeclarativeFileInput`,
   `WebMCPFormAssociatedCustomElements`, `WebMCPTesting` (runtime_enabled_features.json5:
   7030-7033), with the first two declared at :7037-7046. S034's sha `99b92e67…1d2b` matches
   the tag's file exactly, so this is a description gap, not drift.
3. **S035 (main PDL) must not be read as 154.** The 154 PDL (`26e62f29…a37ff`) differs from
   main (`f386bcfd…f99f`, S035's sha) only by main's extra `debugging` annotation
   (pdl:19-23 region). Anchor line numbers also differ: `invokeTool` is at :59 at 154,
   inside S035's cited 47-54 range only by accident. A build-scoped row is required.
4. **The tag's WPT copy is not current upstream.** `webmcp/imperative/executeTool-abort.https.html`
   upstream master is 11904 bytes vs 8013 at the tag, and upstream dispatches
   `toolactivated`/`toolcancel` at `document.modelContext` instead of `window`. Citing WPT
   master would describe different assertions; only the tag is the build's evidence.
5. **Suite gating is not proven.** `external/wpt/webmcp/imperative/WEB_FEATURES.yml:2`
   declares `document-modelcontext`, but no Blink runtime feature maps to that kebab token
   at 154 (grep of runtime_enabled_features.json5 yields only the four `WebMCP*` names).
   The token is WPT metadata, not a usable Chromium flag; do not cite it as one.
6. **Not-passing caveat.** `TestExpectations` at the tag has no `webmcp`/`model_context` line
   (9357-line file grepped), and `inspector-protocol/webmcp/invoke-tool.js` and
   `cancel-invocation.js` ship **without** `-expected.txt` (unlike `list-tools.js` and
   `execute-declarative-tool-crash.js`). So F12/F13 are assertions upstream wrote, not runs
   upstream retains.

## C1

No support. A Chromium test tree cannot bear on lane-tip anchoring of tabi's own gates;
`measure-c1` must not cite this row. The only shared principle — never certify a mutable ref
— is proven by the C1 fixtures, not by this source.

## Sweep (for the record)

Directories tried at the tag: `wpt_internal/model-context` 404, `external/wpt/model-context`
404, `wpt_internal/webmcp` 200 (5 entries plus `css/`), `external/wpt/webmcp` 200
(`declarative/`, `imperative/`, `resources/`, `META.yml`, `idlharness.https.window.js`),
`inspector-protocol/webmcp` 200 (12 entries), `inspector-protocol/model-context` 200 (2
entries, issue text only), `wpt_internal/webmcp/css` 200. No non-loopback navigation, no
browser launched, nothing installed (`npx`/`uv`/pacman untouched).

## Files written

- `.ufo/waves/round-17/w1/SrcWebTests.md` (this file)

Fetches were made into `/tmp` scratch directories and removed after the sweep; every byte
cited above is reproducible from the tag URL and sha256 at the stated revision.
