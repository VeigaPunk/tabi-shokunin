# SrcSpecExecute — WebMCP spec: tool execution, errors, annotations (round 17, wave 1)

Seat `TabiR17.SrcSpecExecute-2`. Access date **2026-10-20**. Question: at current
`webmachinelearning/webmcp` main, what does the specification actually normate for
(a) tool execution, (b) `ModelContextClient` / `requestUserInteraction`,
(c) execution error handling, (d) `ToolAnnotations` — and may the round-17 C2 invocation
receipt cite any of it? Every read below was opened this session. Nothing is copied from
the round-16 note; where that note is compared, the comparison is stated as such.

## 1. Identity — what was fetched, at which commit

| Artifact | Fetch command | Observed |
|---|---|---|
| Rendered spec | `curl -sS -o /tmp/webmcp-published.html https://webmachinelearning.github.io/webmcp/` | HTTP 200, 511987 bytes, sha256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` |
| Source `index.bs` at commit | `curl -sS -o /tmp/webmcp-index-51ed7565.bs https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs` | HTTP 200, 91001 bytes, 2053 lines, sha256 `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004` |
| Repo clone | `git clone --filter=blob:none https://github.com/webmachinelearning/webmcp /tmp/webmcp-spec-r17` | `git rev-parse HEAD` → `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`; `git checkout HEAD -- index.bs` gives the same sha256 as the raw fetch (byte-identical) |

- **Revision**: commit `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`, authored
  `2026-10-20 10:57:14 -0400`, *"Discuss general agent ecosystem risks and link to agent
  security guidance (#334)"*. Parent `cb3d16964ab3e92cfd5f09901ed0504373a906e8`
  (*"Add new editor (#352)"*, `2026-10-20 12:53:18 +0300`) is the revision the round-16
  seat read.
- The rendered page carries `<meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c"
  name="revision">` and `<time class="dt-updated" datetime="2026-10-20">20 October
  2026</time>`, status `CG-DRAFT` ("Draft Community Group Report"). The page has no
  in-body commit link; the `<meta name="revision">` is its binding. Since the meta
  revision equals the cloned commit, the page and the clone are the same content today.
- **Delta since S020's recorded revision** `f14762e6`:
  `git diff --stat f14762e..HEAD -- index.bs` → `56 insertions(+), 0 deletions`.
  Breakdown: `cb3d169` adds one `Editor:` line; `51ed756` adds 55 lines (bibliography
  entries `AGENTICWEB-WG`, `CHROME-AGENT-SECURITY`, `CHROME-SECURE-TOOLS` plus security
  prose at `index.bs:1632-1645`). **No algorithm line changed** between S020's anchor and
  this commit.
- Temp clone and downloads removed after use (`rm -rf /tmp/webmcp-spec-r17 …`). No browser
  launched by this seat.

## 2. Normative surface at this commit (section numbering from the rendered TOC)

| Section | Content | `index.bs` lines |
|---|---|---|
| §4.1 Extensions to Document | `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }` | 663-686 (IDL 674-678, attribute at 676) |
| §4.2 ModelContext Interface | `registerTool`, `getTools`, `executeTool`; `ontoolchange`, `ontoolactivated`, `ontoolcancel` | 688-1185 (IDL 692-702) |
| §4.2.1 ModelContextTool | `ModelContextTool`, `ToolAnnotations`, `ToolExecuteCallbackOptions`, `ToolExecuteCallback` | 1187-1270 |
| §4.2.6 RegisteredTool | the dictionary returned by `getTools` (`RegisteredTool`) | 1337-1390 |
| §4.3 Events | three handler/event pairs; `ToolActivatedEvent`, `ToolCancelEvent` | 1391-1455 |
| §4.4 Permissions policy | feature `tools`, default allowlist `'self'` | 1457-1461 |
| §5.1 Event loop integration | browser agent's `AI agent queue`; `webmcp task source` | 1465-1476 |
| §5.2 Page observations | **non-normative** implementer example (`perform an observation`) | 1478-1584 |

Absent at this commit, verified by count, not by memory:

```
$ grep -c "ModelContextClient\|requestUserInteraction" index.bs   → 0
$ grep -ci declarative index.bs                                    → 0
```

- `ModelContextClient` / `requestUserInteraction` removed by
  `067a1c90b5364b02742ef6ce40e5cf5a6497b445` (2026-06-11, *"Remove `ModelContextClient`
  for now (#205)"*).
- The declarative-API section was removed by
  `14ae813cc4e9fe0d39313f4b1ee5b231746731ad` (2026-10-08, *"Remove declarative API from
  the spec for now (#338)"*). S030's README statement still stands; the spec no longer
  even carries the one-line TODO stub.

## 3. The tool execution algorithm, as written

### 3.1 Entry: `executeTool` (§4.2, `index.bs:1023-1185`)

Signature (`index.bs:697`):

```
Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject, optional ModelContextExecuteToolOptions options = {});
```

Steps, in order (line anchors):

1. Caller must be fully active, else `InvalidStateError` (`1030-1031`).
2. Caller must be allowed to use the `tools` policy feature, else `NotAllowedError`
   (`1033-1034`).
3. `tool.origin` must parse to a non-opaque origin, else `NotSupportedError`
   (`1036-1044`).
4. Omitted `inputObject` becomes `OrdinaryObjectCreate(%Object.prototype%)` (`1047-1048`).
5. Input is **serialized to a JSON string** before dispatch; a throw rejects with that
   exception (`1052-1053`).
6. Target document must have a non-null navigable, else `InvalidStateError` (`1062-1063`).
7. Optional execution-time `signal`: already-aborted rejects with its reason (`1071-1072`);
   otherwise abort steps reject the promise and cancel the pending execution (`1077-1081`).
8. **Same-traversable requirement**: if the target document's traversable navigable is not
   the caller's, reject `InvalidStateError`; `Issue(#227)` leaves cross-tab execution open
   (`1085-1092`).
9. `NotFoundError` for three cases, deliberately indistinguishable: origin mismatch
   (`1098-1100`), tool name absent (`1107-1109`), tool not exposed to caller origin
   (`1113-1116`). The note at `1118-1122` states this prevents origin probing/enumeration.
10. Builds `completionSteps` (`1124-1156`), records a `pending tool execution` keyed by a
    fresh `uuid` (`1157-1172`), then queues one task on the **target** window to run the
    `tool execute steps` (`1174-1176`). This is the **only** dispatch site in the spec.
11. Returns the promise (`1183`).

Note at `1178-1181`: a not-fully-active target merely queues the execution until it leaves
the bf-cache.

### 3.2 `tool execute steps` (`index.bs:492-545`)

Tool-map lookup on the target's `model context`; absent → `tool not found` (`504-505`).
Note `507-515`: existence is protected against the unregister/execute race; a
unregister-then-re-register with the same name and a *new* schema is **not** protected
(issue #92) — the old input may be applied to the new tool's schema.

### 3.3 `invoke the execute callback` (`index.bs:547-621`)

1. Parse `inputArguments` as JSON; a parse throw → `invalid input` (`555-557`).
2. Parse result must be an Object; otherwise `invalid input` (`559-560`). **This is the
   whole input validation.** The spec never compares the input to `inputSchema`.
3. Fires `toolactivated` (`ModelContext/toolactivated`) before calling the callback
   (`562-564`).
4. Creates an `AbortController` in the target realm and records a
   `local pending tool execution` keyed by `uuid` (`566-576`).
5. Calls `execute(inputObject, {signal})` — `ToolExecuteCallbackOptions` (`577-583`,
   IDL `1210-1214`).
6. Fulfilled → if the local pending entry still exists, serialize to JSON; a throw →
   `unserializable result` (block `587-606`, branch `601-605`); else run completion with the string (`606`).
7. Rejected → optionally `report a warning to the console`; if the entry still exists,
   remove it and complete with `tool rejected` (`607-620`). No exception object, message
   or stack is forwarded.
8. The local map may be missing the `uuid` when a cancellation won the race; that branch
   returns silently (`593`, `615-616`; race note `1133-1140`).

### 3.4 Completion (`index.bs:1124-1156`)

Exactly one of result/error is non-null (`1127`); remove the pending entry (`1143-1144`);
resolve with the JSON string (`1146-1147`) or reject with a `DOMException` **named** by the
error's corresponding exception name (`1149-1151`). Note `1153-1155`: forwarding only the
error value, not the target's exception, prevents leaking provider internals or stack
traces across origins.

### 3.5 Unregistration does not cancel an execution (`index.bs:623-658`)

`unregister a tool` removes the map entry and notifies other documents. Note `639-643`:
"Unregistering a tool does not cancel an execution that has already invoked its
{{ToolExecuteCallback}}" — the registration-time signal controls availability; the
execution-time `options.signal` controls one invocation's lifetime. §4.2 exposes no
`unregisterTool()` method at this commit; removal is via the registration `signal`.

### 3.6 Navigation / unload (`index.bs:383-423`)

Unloading document cleanup, per document: if it is the **target** of a pending execution,
complete with `target document unloaded` (`405-408`); if it is the **caller**, cancel the
pending execution (`413-415`). Cancellation aborts the callback's signal and fires
`toolcancel` (`371-377`).

### 3.7 Error taxonomy (§3, `index.bs:260-301`)

| Value | Meaning | Caller-visible `DOMException` | Lines |
|---|---|---|---|
| `tool not found` | not registered in the target Document | `NotFoundError` | 272-274 |
| `invalid input` | input could not be parsed into a JS Object | `DataError` | 276-278 |
| `tool rejected` | `execute` returned a rejected promise | `OperationError` | 280-282 |
| `unserializable result` | result could not be serialized to a JSON string | `OperationError` | 284-286 |
| `target document unloaded` | target Document unloaded mid-execution | `AbortError` | 288-290 |

Note `293-301`: these are realm-agnostic spec values, not web-exposed objects; the caller
sees only the exception name. The table covers **platform-defined** failures only; author
failures may be reported inside the response JSON string (`299-301`).

## 4. `ModelContextClient` / `requestUserInteraction` — removed, and what stands in

Commit `067a1c9` (2026-06-11, PR #205) deleted the interface and its callback:

```diff
-callback ToolExecuteCallback = Promise<any> (object input, ModelContextClient client);
+callback ToolExecuteCallback = Promise<any> (object input);
…
-[Exposed=Window, SecureContext]
-interface ModelContextClient {
-  Promise<any> requestUserInteraction(UserInteractionCallback callback);
-};
```

At `51ed7565` there is **no page-callable user-interaction API**. The spec's only
confirmation surface is advisory and agent-side:

- `ToolAnnotations.consequentialHint` (`1266`, mitigation `2005-2012`) tells the client a
  tool "performs a consequential action"; the client "can selectively enforce mandatory
  user confirmation prompts" — a client policy, not a page API.
- §6.2 (`1632-1637`) states outright that a malicious site "can omit or misrepresent
  those hints".

Consequence for this lane: any C2 case or note text that expects the page to ask the user
(or that cites `requestUserInteraction`) is testing a revision retired four months before
this round. Do not add such a case; if a confirmation is exercised, it is browser/agent
behaviour, build-scoped.

## 5. `ToolAnnotations` (§4.2.1, `index.bs:1203-1208`, prose `1256-1269`)

All four are `boolean` defaulting to `false`; the spec assigns them no validation and no
enforcement:

| Field | Stated meaning | Line |
|---|---|---|
| `readOnlyHint` | tool does not modify state, only reads | 1260 |
| `untrustedContentHint` | the tool's **output** contains data untrusted from the registrant's perspective | 1263 |
| `consequentialHint` | execution results in significant, real-world, or non-reversible actions (booking a flight, transferring money) | 1266 |
| `debugging` | tool is for developer tooling, not end-user interaction | 1269 |

The registration algorithm stores `null` when no annotations object is supplied (`868-869`)
and otherwise copies each bit into an internal `annotations` struct (`872-882`); `getTools`
re-serializes them into `RegisteredTool.annotations` (`1001-1010`). The values never change
what `executeTool` does.

## 6. What the spec does not define — the C2 crux

- §5.1 puts the browser agent on a parallel `AI agent queue` (`1465-1476`); §5.2 is
  explicitly **non-normative** (`1478-1484`: "This section is non-normative. It contains an
  example of infrastructure…").
- The observation algorithm yields a per-`Document` `tool map` and leaves exposure
  implementation-defined (`1524-1575`). The note at `1570-1572` (rendered: "Despite the name
  of this API (i.e., WebMCP), this specification does not prescribe the format in which
  tools are exposed to the browser agent.") is the decisive sentence: **no transport, no
  CDP domain, no agent-side invocation algorithm**.
- Therefore the CDP `WebMCP.invokeTool` → `toolInvoked` → `toolResponded` sequence observed
  in round 16 (S035; `corpus/knowledge/webmcp-chromium-loopback-round-16.md`) is a
  **Chromium build surface**, never spec text. A C2 receipt may cite this row only for the
  page-side algorithm (what `execute` receives, what error name a failure maps to); its
  wire shape must be bound to the build's own `/json/protocol` and the raw frames.
- Conversely, the spec path a receipt *can* use for a page-side witness is `executeTool`
  from a same-traversable document; anything cross-tab is rejected by §3.1 step 8.

## 7. Facts this row supports (C2; C1 is not supported)

C2 = capability `webmcp-cdp-invocation` as committed evidence. Each fact names the plan's
case id it constrains. "C1" is the jj lane-tip program: **this source yields no C1 fact**
(no fact about VCS anchoring is in a browser spec); see §8 for the rationale-only note.

| # | Fact (anchored) | Constrains |
|---|---|---|
| F1 | `executeTool` is the spec's only invocation path; the single dispatch of the tool callback is `index.bs:1174-1176`, inside `executeTool` (`1023-1185`) | `invoke-imperative-success` |
| F2 | Cross-traversable invocation is rejected with `InvalidStateError` (`1085-1092`); frame/tab boundaries are not a spec surface | `invoke-iframe-frameid`, `invoke-navigation-pending` |
| F3 | Input is only JSON-parsed and required to be an Object (`555-560`); the spec never compares it to `inputSchema`. A "schema mismatch" result is the page's own choice, and a page throw is reported in the response JSON (`299-301`) | `invoke-input-schema-mismatch` — the predicate must not claim spec-level schema validation |
| F4 | Unknown/unregistered tool and a non-exposed tool both yield `NotFoundError` (`504-505`, `272-274`, `1113-1116`), intentionally indistinguishable (`1118-1122`) | `invoke-unknown-tool`, `invoke-after-unregister` |
| F5 | A rejected `execute` promise yields `OperationError`; only an optional console warning is kept (`607-620`, `280-282`) | `invoke-imperative-rejects` |
| F6 | A non-JSON-serializable return yields `OperationError` (`599-605`, `284-286`) | `invoke-imperative-success` — predicates must compare JSON text, not object identity |
| F7 | Cross-realm failures surface as a DOMException **name only**; no message or stack (`294-297`, `1149-1155`) | every error case — predicates must match `name`, not text |
| F8 | Navigation of the target completes the call with `target document unloaded` → `AbortError` (`405-408`, `288-290`); caller navigation cancels (`413-415`); cancellation aborts the callback signal and fires `toolcancel` (`371-377`) | `invoke-navigation-pending` |
| F9 | `toolactivated` fires before `execute` runs (`562-564`); `toolcancel` fires on cancellation (`371-377`); `toolchange` only on registry changes (§4.3 `1391-1411`) | `invoke-imperative-throws`, `invoke-navigation-pending` |
| F10 | Unregistering does not cancel an in-flight execution (`639-643`); the execution-time signal does (`1067-1081`) | `invoke-after-unregister` |
| F11 | Four hint booleans exist and default false (`1203-1208`, `1256-1269`); the spec says a site can omit or misrepresent them (`1635-1637`). No case may assert a hint's truth | any "consequential/read-only" claim |
| F12 | Declarative form tools, `ModelContextClient`, and `requestUserInteraction` are absent at this commit (grep 0; removal commits `14ae813`, `067a1c9`) | `invoke-declarative-form` (Chromium-only fixture), `invoke-flags-off-control` (spec has no flags or availability defaults) |
| F13 | Pending executions live in a map keyed by `uuid`, mutated in parallel, with an explicit local/global desync note (`304-329`, `1133-1140`); no ordering or serialization of concurrent calls is required | `invoke-concurrent-ids` |
| F14 | Permissions policy feature `tools` has default allowlist `'self'` (`1457-1461`); the registration/execution paths reject with `NotAllowedError` when disallowed (`1033-1034`, `763-764`) | `invoke-iframe-frameid`, opaque/ sandboxed-frame controls |

[INFERENCE] F5/F9 treatment of a **synchronous throw** inside `execute`: the spec says
"invoking" the callback (`582`), and per WebIDL `invoke` converts a synchronous throw into
a rejected promise, so it lands on `tool rejected` too. The WebIDL clause itself was not
opened this round; keep `invoke-imperative-throws` and `invoke-imperative-rejects` as two
cases but let each predicate record what it observed rather than assume identical text.

## 8. Contradictions and drift vs the round-16 note and the registry

1. **Round-16 note: no contradiction, one strengthening.** Its spec-vs-build table rows
   still hold at `51ed7565`: `executeTool` takes `optional object` (`697`); declarative is
   outside the spec (now with *no* spec stub at all); `ontoolchange`/`ontoolactivated`/
   `ontoolcancel` are §4.3 (`1391-1455`); `requestUserInteraction` is not claimed anywhere
   in that note, and it is still absent. The note's statement that the receipt invokes no
   tool (`:127`) is unchanged by this source: the spec cannot supply an invocation witness;
   only the round-17 harness can.
2. **S020 (`corpus/SOURCES.md:34`)**: anchor is `CG-DRAFT 2026-10-16, revision f14762e6`;
   the page now serves meta revision `51ed7565` (2026-10-20). Since `f14762e..HEAD` adds
   only one editor line and 55 security/bibliography lines, S020's quoted claim holds; no
   supersedes row is needed. Record the drift in the round's search log, not by editing
   S020 in place.
3. **S030 (`corpus/SOURCES.md`)**: README.md:319 at `51ed7565` is byte-identical to the
   quoted line at `cb3d169` — "but it is not part of the specification at this time."
   Declarative removal from `index.bs` (`14ae813`) predates both reads, so no drift.
4. **Task premise vs current text**: the assignment names
   `ModelContextClient`/`requestUserInteraction` as a section to open. It exists in the
   repository's *history* only (removed 2026-06-11, `067a1c9`); at current main the tokens
   occur zero times. Recorded here so the round does not cite a retired API.
5. **S037 (MCP tools)** says WebMCP and MCP share only `name`, `description`,
   `inputSchema` vocabulary. WebMCP now also carries `ToolAnnotations` with four booleans.
   [INFERENCE] whether MCP's own annotations overlap by name was **not** verified this
   round (S037 was not reopened); treat the S037 cell as incomplete rather than false, and
   do not upgrade it without opening the MCP page.
6. **Round-16 note's "§4.3 requires …"** and this row's §4.3 agree. The note's case table
   ("declarative-form-tool", "lifecycle-removal") describes Chromium behaviour, which this
   row neither confirms nor denies; no browser was launched.

## 9. Proposed registry row (draft — L1 assigns the id after S040)

11 cells; the census' `awk -F'|'` split gives NF 13. No `|` inside any cell. `status` is `mined` **only
after** `corpus/knowledge/webmcp-invocation-round-17.md` exists at the evaluated revision
(the census' used-by existence check); if L1 writes the row earlier, use `queued` and flip
in the same commit that lands the note.

```
| S0?? | WebMCP index.bs — tool execution, errors, annotations — https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | spec | A | normative WebMCP tool execution, execution-error mapping and ToolAnnotations at one commit | commit 51ed75653aaa7f174f8dbe05d1bc327359bbc57c (2026-10-20), §4.2 executeTool lines 1023-1185, §3 error table lines 260-301 | Agent-side invocation is not specified — the draft fixes only in-page executeTool and its DOMException names — so an invocation receipt is build-scoped, never spec-derived | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |
```

Not a supersedes row: S020 stays the published-page row; this row pins the normative text
at a 40-hex so algorithm quotes cannot drift with the page. If L1 prefers one row, fold
these anchors into S020's replacement and keep that replacement's `teaches` opening with
`supersedes S020 —`.

### Gate entry (round lesson `## Gate`, rows opened table)

| Row | URL | Located quote | Location / identity |
|---|---|---|---|
| S0?? | https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | "Despite the name of this API (i.e., WebMCP), this specification does not prescribe the format in which tools are exposed to the browser agent." | §5.2 Page observations note, `index.bs:1570-1572` at commit `51ed7565`; raw sha256 `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`; rendered page `https://webmachinelearning.github.io/webmcp/` sha256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`, meta revision `51ed7565…` |

Quote is 24 words, verbatim from the rendered page's text (the source line wraps and
contains `[=browser agent=]` link markup between "the" and "browser agent"). Access date
2026-10-20. `verifies-at` for the note: 2026-10-20.

## 10. Search-log line for the L1 (SOURCES.md §Search log)

- 2026-10-20 · round-17 WebMCP execution/error/annotation spec read (SrcSpecExecute).
  Question: what does the spec normate for tool execution, user interaction, error
  mapping and annotations, and can a C2 invocation receipt cite it? Searched
  `webmachinelearning.github.io/webmcp`, the `webmachinelearning/webmcp` repository at
  main (commit log, `index.bs`, `README.md`), and three removal commits named in §2/§4.
  Identified 2 fetch targets; screened 2; included 1 new row; excluded 0. One lead not
  opened: the declarative API explainer (`declarative-api-explainer.md`) — its content is
  S031's territory and was not needed to answer this question. Stop: the execution,
  error and annotation text is normative and complete at one commit; the remaining gap
  (what Chromium 154 actually does) is runtime evidence owned by C2Probe*/C2Harness, not
  more reading.

## 11. Limits

- One commit, one page snapshot. The page is rebuilt per push; the sha256 pins only the
  2026-10-20 fetch.
- No browser launched; nothing here asserts Chromium 154 implements `executeTool`,
  the annotations, or the event set. Round-16 probes observed only `ontoolchange` on the
  154 prototype, which remains a build fact.
- `ToolExecuteCallbackOptions` (`1210-1214`) is spec text; the round-16 probe found 154's
  `executeTool` requires a JSON-string second argument where the spec takes an object
  (`697`) — that divergence is untouched by this row.
- No MCP document reopened ($7 item 5); no declarative explainer reopened.
- The two temp files and the `--filter=blob:none` clone were deleted after the reads.

Files written: `.ufo/waves/round-17/sources/SpecExecute.md` (this file),
`.ufo/waves/round-17/w1/SrcSpecExecute.md` (report).
