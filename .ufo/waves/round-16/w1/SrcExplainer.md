# SrcExplainer-5 — WebMCP explainer read (r16 / C2 source seat)

Seat: `TabiR16.SrcExplainer-5` (leaf scout, read-only outside my Report).
Access date for every quote below: **2026-10-20**. Fetch method: `git clone` over HTTPS
(not the web UI), so every `file:line` is a repo-relative path at the pinned commit.
No tool installed or upgraded (git/grep/awk/sed/sha256sum already present; zero installs recorded).

## Answer in brief

1. **Anchor** — `webmachinelearning/webmcp` HEAD on `main` is
   `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, author+committer date
   `2026-10-20T12:53:18+03:00`, subject `Add new editor (#352)`; `git ls-remote origin HEAD
   refs/heads/main` returned the same SHA for both, so the clone is the branch tip, not a stale mirror.
2. **Entry object** — the explainer's tool dictionary is
   `{ name, description, inputSchema, execute }`; registration options are `{ signal, exposedTo }`;
   `getTools` options `{ fromOrigins }`; `executeTool` options `{ signal }`. Fields `title`,
   `annotations`, `toolactivated`/`toolcancel` appear only in `index.bs`, not in the explainer.
3. **Method names** — `document.modelContext.registerTool(tool, options)`,
   `document.modelContext.getTools(options)`, `document.modelContext.executeTool(tool, inputObject, options)`,
   plus the `toolchange` event. **No** `navigator.modelContext`, **no** `provideContext()`,
   **no** `createTool`, **no** `unregisterTool` anywhere at HEAD (`*.md` or `index.bs`).
4. **Browser implementation status** — **yes**, but not inside README prose: README delegates to a
   separate `implementation-status.md`, which lists Chrome 149 Origin Trial, Edge 150 Origin Trial,
   Brave (Leo) experimental, ChatGPT Desktop supported, Meta Ray-Ban "coming soon",
   Firefox/Safari only standards-position tracking. This is the strongest C2 citation for
   "upstream claims shipping implementation", and it is *stale relative to the host* (Chromium 154).

## Method (exact commands, observed output)

```
$ git clone --depth 1 https://github.com/webmachinelearning/webmcp /tmp/webmcp-src-explainer
$ cd /tmp/webmcp-src-explainer && git rev-parse HEAD
cb3d16964ab3e92cfd5f09901ed0504373a906e8
$ git log -1 --format='%H%n%ad%n%s' --date=iso-strict
cb3d16964ab3e92cfd5f09901ed0504373a906e8
2026-10-20T12:53:18+03:00
Add new editor (#352)
$ git ls-remote origin HEAD refs/heads/main
cb3d16964ab3e92cfd5f09901ed0504373a906e8	HEAD
cb3d16964ab3e92cfd5f09901ed0504373a906e8	refs/heads/main
$ git fetch --deepen=300 -q ; git rev-parse --is-shallow-repository ; git rev-list --count HEAD
false
172
```

Local clock at read time: `date -u` → `2026-10-20T14:31:06Z`; the commit is ~4h38m old at access.

Content anchors (sha256 of the blobs I quote):

| file | sha256 |
|---|---|
| `README.md` | `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` |
| `implementation-status.md` | `555b564af51df41c43f75ee887343d9a64c2728da00c8e5eb35102afd312a828` |
| `docs/service-workers.md` | `5a811973bee7c0c96e66a35990a0fe42d2547395698bd50b501da65e646b622a` |
| `declarative-api-explainer.md` | `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` |
| `index.bs` (spec, cross-check only) | `dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39` |

Repository map of prose (`find . -name '*.md' -not -path './.git/*'`): `README.md` (549 lines, the
explainer), `implementation-status.md` (46), `declarative-api-explainer.md` (213),
`continuations-explainer.md` (267), `security-privacy-questionnaire.md`, `docs/service-workers.md`
(272), `CONTRIBUTING.md`, `LICENSE.md`. **`docs/` contains exactly one file** — there is no
`docs/*.md` family beyond `service-workers.md`. The normative spec is `index.bs` at the same commit.

## 1. API surface asserted by the explainer

### 1.1 Namespace: `document.modelContext`

- `README.md:268` — "WebMCP introduces an imperative API on the web platform under `document.modelContext`."
- `README.md:272` — "A Model Context Provider registers tools by calling the `document.modelContext.registerTool()` method."

The namespace is *changed upstream*, not merely cosmetic: commit `c7b5c70` "Move the `modelContext`
getter to `Document` (#184)" (2026-05-27) moved the getter off `Navigator` in `index.bs`
(`git show --stat c7b5c70` → `index.bs | 62 ++++----`, 16 insertions / 46 deletions), and at HEAD
`git grep -n 'navigator.modelContext' HEAD -- .` returns nothing. This matches the L1 pre-probe
(`document.modelContext` present, `'modelContext' in navigator` false) — the explainer and Chromium
154 agree on the namespace, so the C2 note must cite `document.modelContext`, never `navigator`.

### 1.2 Methods (exact names, arity, and the line that proves each)

| Method | Explainer evidence | Signature shown |
|---|---|---|
| `registerTool` | `README.md:277` `await document.modelContext.registerTool({`; prose `README.md:272` | `registerTool(tool, options?)` |
| `getTools` | `README.md:360` `const tools = await document.modelContext.getTools();`; prose `README.md:354` | `getTools(options?)` |
| `executeTool` | `README.md:383-386` `document.modelContext.executeTool(addTodoTool, { text: "Buy groceries" })` | `executeTool(tool, inputObject?, options?)` |
| `toolchange` (event) | `README.md:418` `document.modelContext.addEventListener("toolchange", …)` | event on `document.modelContext` |

- `README.md:354` — "Once tools are registered, in-page agents can discover and invoke them using `getTools()` and `executeTool()`." (19 words)
- `README.md:375` — "An agent executes a discovered `RegisteredTool` by passing the tool dictionary and input arguments along to `document.modelContext.executeTool()`." (17 words)
- `README.md:349` — "Receive the `toolchange` event on its `document.modelContext` when the tool is registered or unregistered." (16 words)

There is **no** `unregisterTool()`: `README.md:306` — "Tools can be unregistered at any time by
aborting the signal." (`registerTool` options carry the `AbortSignal`; `README.md:300`
`}, { signal: controller.signal });`). Git history confirms the name was deleted, not renamed:
`90daeee` "Remove `unregisterTool()` from proposal explainer (#156)". A C2 harness must drive
removal through `AbortController.abort()`, not through a method call — this is exactly the
"unregister/abort/removal → `toolsRemoved`" case in the C2 harness contract.

### 1.3 Example tool names in the explainer (useful as fixture realism)

`filter-templates` (`README.md:122-135`), `order-prints` (`:146-160`), `get-dresses` (`:170-184`),
`show-dresses` (`:185-188`), `filter-products` (`:189-192`), `get-trybot-statuses` (`:230-236`),
`get-trybot-failure-snippet` (`:238-251`), `add-todo` (`:277-300`), `share-location` (`:340-344`).
All are kebab-case, matching the CDP sample in the L1 probe (`name:"search"`).

## 2. Entry object (the tool dictionary)

What the explainer documents, taken from the canonical example (`README.md:277-300`) and prose:

| Field | Evidence | Notes |
|---|---|---|
| `name` | `README.md:278` `name: "add-todo",` | unique id; duplicate name → rejected promise (`index.bs:689-690`) |
| `description` | `README.md:279` `description: "Add a new item to the user's active todo list",` | natural language |
| `inputSchema` | `README.md:280-286` `inputSchema: { type: "object", properties: { text: {...} }, required: ["text"] }` | JSON Schema object |
| `execute` | `README.md:287` `async execute({ text }) {` | receives `(inputObject, options)`; may return a promise |

Return shape in the canonical example (`README.md:291-298`) is MCP-style:
`return {` / `content: [` / `{ type: "text", text: … }` — i.e. `{ content: [ { type: "text", text } ] }`.

Registration options (`2nd` argument):

| Option | Evidence | Meaning |
|---|---|---|
| `signal` | `README.md:300` `}, { signal: controller.signal });` | abort ⇒ unregister (`README.md:302-306`) |
| `exposedTo` | `README.md:344` `}, { exposedTo: ["https://trusted-partner.example"] });` | origin allow-list for cross-origin frames (`README.md:335-347`) |

Query options and result object:

- `getTools` option `fromOrigins` — `README.md:371` `fromOrigins: ["https://trusted-partner.example"]`;
  prose `README.md:356` — "Each object contains the tool's `name`, `description`, `inputSchema`, `origin`, and owner `window`." (12 words)
- `executeTool` third argument `{ signal }` — `README.md:401-405`
  (`{ text: "Buy groceries" }, { signal: controller.signal }`), and `README.md:411` says the
  callback receives that signal as `options.signal`.

### 2.1 Cross-check against the normative IDL at the same commit (secondary, not the assigned target)

`index.bs` agrees on names and adds members the explainer omits:

- `index.bs:670-679` — `[Exposed=Window, SecureContext] interface ModelContext : EventTarget` with
  `registerTool`, `getTools`, `executeTool`, and `ontoolchange` / `ontoolactivated` / `ontoolcancel`.
- `index.bs:1169-1178` — `dictionary ModelContextTool { required DOMString name; USVString title;
  required DOMString description; object inputSchema; required ToolExecuteCallback execute;
  ToolAnnotations annotations; };`
- `index.bs:1180-1185` — `ToolAnnotations { readOnlyHint, untrustedContentHint, consequentialHint, debugging }`.
- `index.bs:1266-1269` — `ModelContextRegisterToolOptions { sequence<USVString> exposedTo; AbortSignal signal; }`.
- `index.bs:1286-1288` — `ModelContextGetToolOptions { sequence<USVString> fromOrigins; }`.
- `index.bs:1304-1306` — `ModelContextExecuteToolOptions { AbortSignal signal; }`.
- `index.bs:1320-1331` — `RegisteredTool { name, title, description, inputSchema, window, origin, annotations }`.
- `index.bs:651-655` — `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }`.

**Explainer-vs-spec deltas (observed, both at `cb3d1696`)**: grep over `README.md` returns
**zero** hits for `annotations`, `ToolAnnotations`, `toolactivated`, `toolcancel`, `ontool*`, and the
only `title` hit (`README.md:141`) is prose in the yard-sale story, not a tool field. Conversely
`index.bs:674` types `executeTool` as `Promise<DOMString>` while the explainer's examples log/return
structured objects (`README.md:291-298`, `README.md:343` `execute() { return { office: "Building 4" }; }`).
I did not investigate which is authoritative — record as a textual divergence, not a bug claim.

## 3. Does it state browser implementation status? — Yes, in a delegated document

`README.md:7` — "See [Implementation Status](implementation-status.md) for browser and agent support" (9 words).
README prose itself makes **no** browser-status claim, and it names no browser vendor except at
`README.md:427` (`grep -i 'chrome|edge|brave|safari|firefox|origin trial'` → that line only), which is a
link to Chrome's best-practices guide — guidance, not status.

`implementation-status.md` (46 lines) is the status page, per target:

| Target | Line | Verbatim (≤25 words) |
|---|---|---|
| Brave | `:9` | "Experimental support is added to [Leo AI chat](https://brave.com/leo/)." |
| ChatGPT Desktop | `:15` | "WebMCP is supported in [ChatGPT Desktop](https://chatgpt.com/download/)." |
| Chrome | `:19` | "An [Origin Trial](https://developer.chrome.com/blog/ai-webmcp-origin-trial) is live in Chrome 149." |
| Chrome (local dev flag) | `:21` | "…enable the `about:flags#enable-webmcp-testing` flag." (7 words with the link) |
| Edge | `:29` | "An [Origin Trial](<edge origin-trials URL, elided>) is live in Edge 150." → `:31` "Refer to Chrome implementation status for platform support." |
| Firefox | `:35-36` | tracking links only (`mozilla/standards-positions#1412`, Bugzilla 2018306) — no shipping claim |
| Meta Ray-Ban Display | `:40`, `:42` | "WebMCP for [Web Apps](…) is coming soon"; "It is off by default and enabled per device" |
| Safari | `:46` | WebKit standards-position issue link only — no shipping claim |

C2-relevant readings of that page:

- Upstream's own claim is **Origin Trial**, i.e. behind a Chrome flag/OT token, not enabled-by-default
  shipping. That is consistent with the L1 pre-probe (flags required; no flag ⇒ no
  `document.modelContext`, no `WebMCP.toolsAdded`).
- The page names Chrome **149** / Edge **150**; the host runs Chromium **154.0.8037.97**. Status is
  therefore behind the artifact under test by five milestones — the C2 note must present the source
  claim and the host observation as two facts, not "source says 154".
- The local-dev flag named by the source is `about:flags#enable-webmcp-testing`
  (`implementation-status.md:21`). The L1 probe used
  `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`.
  `[INFERENCE]` `WebMCPTesting` is the command-line counterpart of the `enable-webmcp-testing` flag
  (name correspondence only; I did not open Chromium source or `chrome://flags` this session, so this
  mapping is unverified).
- The page carries no date stamp. Last three edits: `57d396f` 2026-09-29 (Meta Ray-Ban),
  `2092f25` 2026-09-04 (local-development flag), `55fb7ee` 2026-09-02 (agent support).
  `git log -S'live in Chrome 149' -- implementation-status.md` returns only `c3a63b2` 2026-08-12
  ("Add implementation-status.md to track browser implementation status (#235)"), i.e. the Chrome
  claim has not been revised since the file was created. Read it as an origin-trial-scope claim,
  not a current-version pin.

## 4. Declarative API status (matters for the C2 divergence row)

- `README.md:317` — "WebMCP is currently focused on the imperative `document.modelContext.registerTool()` API described above, which is what the specification defines." (17 words)
- `README.md:319` — "A declarative counterpart, which would let the browser synthesize tool definitions from HTML `<form>` elements, is being explored separately." (19 words)
- `README.md:319` also states it "is not part of the specification at this time."

Verified at HEAD: `grep -n -E 'toolname|tooldescription|toolautosubmit|toolparamdescription|Declarative' index.bs`
→ **no output**; the declarative API is genuinely absent from the normative spec. Cause is commit
`14ae813` "Remove declarative API from the spec for now (#338)", 2026-10-08, which touched
`README.md` and `index.bs` (`git show --stat 14ae813` → 15 insertions / 50 deletions) and rewrote the
README section from "### Declarative API" to "### Future Exploration: Declarative API".

The declarative explainer still documents the attribute names a fixture would need:
`declarative-api-explainer.md:38-41`

```html
<form
  toolname="Search flights"
  tooldescription="This form searches flights and displays [...]"
  toolautosubmit>
```

- `declarative-api-explainer.md:44-47` — "The `toolname` attribute is analogous to the imperative API's `ModelContextTool#name`" (12 words); `tooldescription` ≡ `ModelContextTool#description`.
- `declarative-api-explainer.md:64-67` — "we introduce the `toolparamdescription` attribute for form control elements" (10 words).
- `declarative-api-explainer.md:55-57` — "When forms with these attributes are inserted, removed, or these attributes are updated, the form creates a new declarative WebMCP tool" (24 words).
- `declarative-api-explainer.md:108-112` — schema-synthesis algorithms are "TBD"; `:114` — "Chromium is implementing a loose version of this and will conduct testing/trials" (13 words).
- `declarative-api-explainer.md:117-119` — response channel "currently under debate" (issue #135); `:159-173` adds `SubmitEvent.agentInvoked` and `respondWith()`; `:175-178` adds `toolactivated`/`toolcancel` "fired at the `ModelContext` object".

Consequence for C2: the explainer (README) says declarative is **not** in the spec, while Chromium
154 implements `DeclarativeWebmcp` and emits `WebMCP.toolsAdded` for `toolname` forms (L1 pre-probe;
I did not run the probe). That is a source-vs-implementation divergence the note must state, with
`README.md:319` / `declarative-api-explainer.md:114` as the source side.

## 5. Ancillary docs (same commit), for completeness

- `docs/service-workers.md:136` — "Service workers have a new `modelContext` object available in their global scope" (12 words), "the service worker counterpart of the `document.modelContext` object specified in the main WebMCP explainer" (16 words). Code: `docs/service-workers.md:224` `self.modelContext.registerTool({` with `async execute(params, options)` and `options.sessionId` (`:228-232`). No new method names beyond `registerTool`.
- `continuations-explainer.md:193` — `modelContext.resumeTool(` with `execute(input, options)` and `options.invocation.requestToken()` (`:170-187`). `resumeTool` is a **proposal-only** name: `git grep -l -- resumeTool HEAD -- .` returns exactly one file, `HEAD:continuations-explainer.md` (8 hits); zero occurrences in `README.md`, `index.bs`, `docs/`, or `implementation-status.md`. Do not cite it as current API.
- `security-privacy-questionnaire.md:104` — one API mention, no new method names: "`registerTool()` throws `InvalidStateError` for inactive documents, duplicate names, or invalid name/description" (11 words), then `NotAllowedError` when the `"tools"` Permissions Policy is disallowed, `SecurityError` for non-trustworthy `exposedTo` origins, and `TypeError` when `inputSchema` serialization fails. Wording differs from `README.md:333` ("will return a promise rejected with `NotAllowedError`") — same condition, "throws" vs "promise rejected"; recorded as a phrasing delta, not a semantic claim.
- Rejected design, explicitly not the API: `README.md:481-493` "Alternatives Considered §3 Event-Based Tool Execution (`'toolcall'`)", showing `document.agent.addEventListener('toolcall', …)` at `README.md:486` — "Another alternative was to handle tool execution exclusively via window-level events" (13 words). `document.agent` does not exist in the spec; treat it as a historical strawman only.

## 6. Negative findings (bounded to repo `/tmp/webmcp-src-explainer` at `cb3d1696`, full clone)

Measured with `for t in createTool unregisterTool 'navigator.modelContext' provideContext resumeTool; do
printf '%-24s ' "$t"; git grep -n -- "$t" HEAD -- . | wc -l; done`:

| token | tree-wide hits at HEAD |
|---|---|
| `createTool` | 0 |
| `unregisterTool` | 0 |
| `navigator.modelContext` | 0 |
| `provideContext` | 0 |
| `resumeTool` | 8 — all `continuations-explainer.md` (`git grep -l` → one file) |

- `navigator.modelContext`: **0 occurrences** (`git grep -n 'navigator.modelContext' HEAD -- .` → empty).
- `provideContext` / `clearContext`: **0 occurrences** at HEAD in `*.md`/`*.bs`; existed historically,
  removed by `fe84c67` "Remove `provideContext()` and `clearContext()` (#132)", 2026-03-05.
- `createTool`: **0 occurrences** anywhere in the tree.
- `unregisterTool`: **0 occurrences**; removed by `90daeee` (#156).
- `docs/` holds exactly one document (`service-workers.md`); there is no `docs/*.md` set to sweep.
- `index.bs` has no declarative attributes at HEAD (verified by grep, §4).

## 7. Limits and residual unknowns

- I read prose and IDL; I did not read the ~88 KB `index.bs` end-to-end, only the `ModelContext`
  interface, its dictionaries, and the `Document.modelContext` partial. Algorithm text is unread.
- "Browser implementation status" is answered from `implementation-status.md` only. That page cites
  external URLs (Chrome blog, chromestatus, Edge trial, Bugzilla, WebKit positions) which I did **not**
  open — those primary rows belong to a source seat that opens them; do not upgrade them to "opened"
  on my authority.
- The `WebMCPTesting` ↔ `enable-webmcp-testing` flag mapping is `[INFERENCE]` (§3).
- Why `index.bs:674` declares `Promise<DOMString>` for `executeTool` while examples return objects is
  **unresolved**; no issue/commit was traced for it.
- The L1 Chromium-154 probe results quoted in PLAN.md are **not** my observation; I re-state them only
  as L1-provided context and did not run a browser this session.
- `implementation-status.md` has no in-file date; its claims can only be time-anchored through git
  (§3 gives the commits). A note writer quoting it must carry that commit anchor, otherwise the
  "Chrome 149" line reads as current.

## 8. Confidence

High (direct `file:line` at a verified remote HEAD, full-history clone, digests recorded) for:
namespace, method list and arities, entry-object fields, the absence of the legacy names, the
delegation of implementation status to `implementation-status.md`, and the declarative-API removal
from the spec at `14ae813`.
Medium for anything about external browsers (source-stated only, external links unopened).
No source row should be mined from this seat beyond the already-assigned S020/S002 re-opens; this
report is evidence for L1's C2 note and for the WebmcpFixtures/Harness seats choosing names
(`document.modelContext`, `registerTool`, abort-based unregister, `{name,description,inputSchema,execute}`,
`toolname`/`tooldescription`).
