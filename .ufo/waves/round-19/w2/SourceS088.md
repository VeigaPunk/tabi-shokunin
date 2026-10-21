# SourceS088 — bounded source reopening at R

## Finding

**AGREE with S088 within its stated frontend-presentation scope; no material falsification.** Both pinned source bodies match their recorded decoded SHA-256 values, and the round-19 lesson's five-word quote is verbatim at the declared line. **Keep S088 queued, used-by `—`; opening a source is not mining it.** **AGREE with S094's HTTP404 rejection**, with the flip condition and response-byte drift qualified below. No registry changes were made.

Axes: quotation/location fidelity; decoded-byte identity; source-to-teaches entailment; scope and registry lifecycle consistency.

Checkpoint inspected: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). Read-only `refs/heads/master` observation also returned R. Registry and lesson evidence was obtained with `git show R:<path>`, not inferred from a moving worktree. Access date for every network fetch below: **2026-10-21**.

## Exact fetched sources and retained bytes

No redirects were observed. Hashes and sizes below describe decoded bodies, not HTTP gzip carriers. For the Gitiles DEPS response, decoding includes base64 decoding after HTTP content decoding.

| Key | Exact URL | HTTP | Decoded bytes | Decoded SHA-256 | Retained body, relative to lane root |
|---|---|---:|---:|---|---|
| V — S088 view | https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts | 200 | 59,794 | `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` | `.ufo/waves/round-19/w2/SourceS088.body.gz` |
| M — S088 related model | https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | 200 | 8,553 | `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` | `.ufo/waves/round-19/w2/SourceS088.model.body.gz` |
| D — build association | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT | 200 | 197,649 | `dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d` | `.ufo/waves/round-19/w2/SourceS088.deps.body.gz` |
| N — S094 attempted path | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT | 404 | 233 | `4e70053b58a712a422f77576ea25fa175c00562baea9621018323d1f249a6dea` | `.ufo/waves/round-19/w2/SourceS088.s094.body.gz` |

V contains 1,515 lines; M contains 261. V and M are commit-addressed implementation code, not rolling documentation, proposals, or specifications. Both match the full hashes in the original response-surface dossier; V also exactly matches `corpus/lessons/round-19.md:44` at R. The model URL resolves the related path explicitly named in S088 at that same commit; it is not an additional queued row.

### Located quotations

Each quote is verbatim, at most 25 whitespace-delimited words. Keys refer to the exact URL, access date, body digest and size above; the counts and declared-line membership were checked against the fetched decoded bodies.

| Key | Quote | Words | Exact source location |
|---|---|---:|---|
| V | `(input.errorText ? createErrorText(input.errorText) : nothing)))}` | 5 | `front_end/panels/application/WebMCPView.ts:1041`; lesson Gate at `corpus/lessons/round-19.md:44` at R |
| M | `call.result = new Result(params.status, params.output, params.errorText, exception);` | 7 | `front_end/models/web_mcp/WebMCPModel.ts:256` |
| D | `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` | 2 | Chromium tag `154.0.8037.97`, `DEPS:424`; dependency use at `DEPS:2215-2216` |
| N | `NOT_FOUND: Requested entity was not found` | 6 | HTTP404 decoded response, line 1 |

The lesson's V quote occurs on line 1041 only. It is a located **fallback arm**, not the complete precedence rule; its enclosing condition is essential to the interpretation.

## Source-to-teaches entailment and caller trace

**Language-server limitation:** `read xd://lsp` returned `No such tool: xd://lsp`; the mounted device list contains no LSP device. No server status, indexing warmup, definition, reference or hover request was available. The trace below is an explicitly literal source inspection using targeted searches and surrounding code, not language-server semantic proof or a claim of exhaustive references.

| S088 assertion | Observed definitions and consumers | Assessment |
|---|---|---|
| Status is separate from payload. | M `Result:21-35` stores `status`, `output`, `errorText`, and the private remote exception separately. M `toolResponded:249-257` looks up an existing call by invocation ID, converts an exception to a remote object when possible, constructs `Result`, and emits `TOOL_RESPONDED`. V `statusString:423-434` selects Error/Canceled/Completed/In Progress using only `call.result?.status`; the status cell calls it at `:561-565`. | **Entailed for this consumer.** No message or error payload is inferred from the status. Unmatched invocation IDs are ignored at M `:250-253`. This does not prove which backend responses are possible. |
| Compact output falls back to errorText. | V `:567-577` renders the compact cells only when no call is selected. At `:575-576`, a result output other than `undefined` is JSON-stringified; otherwise the cell uses `errorText ?? ''`. | **Entailed with the stated compact-view context.** A present `null`, false, zero or empty-string output does not take the errorText fallback. The compact cell does not display the exception. |
| Detail pane prefers a symbolized exception over errorText. | V Output tab `:608-616` passes output, errorText and the symbolization promise to `PayloadWidget`. M `Result.symbolizedError:38-49` lazily requests symbolization, or resolves null when there is no exception. V `PayloadWidget:1088-1105,1115-1122` waits for that promise and updates its view. V `PAYLOAD_DEFAULT_VIEW:984-1045` implements the rendering branches. | **Entailed as an error-display precedence, not an unconditional winner over output.** Full order: defined `valueObject` first; then defined `valueString`; then a truthy resolved symbolized error; then truthy errorText; otherwise nothing. Before symbolization settles, errorText can be displayed; a null symbolized result leaves that fallback. |
| This is Chromium 154-associated frontend code. | D `DEPS:424` pins exactly `66df492aaa0129d090937e933dd44c5389ab24d2`; `:2215-2216` uses it for `src/third_party/devtools-frontend/src`. | **Direct build-source association at 154.0.8037.97.** Not evidence for every Chromium 154 build or for what an independently packaged browser actually loaded. |

The event-to-render connection is visible in V `#webMCPModelAdded:847-852`: `TOOL_RESPONDED` schedules `requestUpdate`. V `performUpdate:904-907` reads model calls; V `:608-616` supplies the selected call's result to the output widget. M `Call:53-59` declares optional `result?: Result`; M `WebMCPModel:148-157` registers itself as the WebMCP dispatcher. These are implementation consumers of the protocol, not a normative WebMCP specification or declarative-input-validation producer.

## Scope, tier, status and used-by

At R, `corpus/SOURCES.md:102` records **kind `code`, tier A, status `queued`, opened `2026-10-21`, recheck `on-release`, used-by `—`**. All are defensible for this official pinned implementation source within its explicitly limited frontend rendering scope. Tier A does not expand that scope into backend payload guarantees or runtime observations.

The lesson Gate records an opened source and its quotation; the lesson's status paragraph keeps this row queued. Bounded literal searches of the R versions of `SKILL.md`, `corpus/knowledge/webmcp-declarative-validation-round-19.md`, and `corpus/evidence/round-19/validation/decisions.json` found no `S088`, `WebMCPView.ts`, `RevDeclErrorSurface`, `symbolized`, or `errorText fallback` reference. That is a bounded textual usage check, not a whole-repository semantic reference proof. It supports leaving `used-by` empty and awarding no mined/validation-decision credit to S088. No other queued row was reopened or promoted.

**Disagreement threshold for S088:** using this row to assert that invalid declarative input always produces a particular CDP errorText, exception, or status would exceed the source; likewise, saying a symbolized exception beats a defined output would contradict V `:1036-1041`. Neither overclaim is present in the row's scoped reading, so no status or tier flip is warranted.

## S094 rejection and flip

**AGREE:** the exact attempted test URL returned HTTP404 with the located six-word NOT_FOUND line. This supports rejection of **that path at that tag only**, not absence of declarative-form tests elsewhere. `corpus/SOURCES.md:108` at R limits the scope appropriately; it records tier C, rejected, opened `2026-10-21`, recheck `on-release`, and used-by `corpus/lessons/round-19.md`, which exists at R and contains the rejection Gate.

**Byte drift is real but not a source-content change.** R's retained `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` decodes to 233 bytes and SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`, matching the old ledger. The new response remains 233 bytes but has SHA-256 `4e70053b58a712a422f77576ea25fa175c00562baea9621018323d1f249a6dea`. Comparing both decoded responses after normalizing only the quoted `request_id` value yields byte equality: the request ID is the sole difference. A commit/tag-addressed missing resource does not make its generated error response byte-immutable. Preserve the historical hash as historical evidence; do not claim equality with this refetch.

**Flip condition:** the same exact URL must resolve to an actual test source with a located relevant quote before reversing this exact-path rejection. The existing row's broader lead, `html_form_mcp_tool_test.cc`, could justify a separately sourced admission after its own exact URL/body/quote is verified; its existence alone would not make the rejected `_unittest.cc` path real. That lead was not fetched or mined here.

## Exercised evidence and remaining unknowns

Exercised: four bounded HTTP fetches; decoded-body hashing and retention; exact quotation/line checks; R registry/lesson reads; targeted literal definition/consumer inspection; build DEPS pin check; historical-versus-current 404 request-ID comparison. No browser, CDP invocation, runtime/mutation probe, build, lint, formatter or test suite ran. No tool was installed or updated; no service or background job was started.

Remaining unknowns: actual backend event values for a particular invalid declarative form, live DevTools rendering and symbolization success, and deployment identity of a separately packaged frontend. None is established by S088, and none is required to uphold its bounded presentation teaching. Confidence: **high** for byte identity, located quotes, explicit source branches and S094 rejection; **unestablished** for those runtime/backend extensions.

## Isolation

- Clone: none; this was a read-only source investigation, with no runtime or mutation probe and no production file edits.
- Branch: none.
- Base inspected: R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (baseline B remains `66251bfc1aef393e4aec599e950a8deb867736bb`).
- Commit: none; no git write was performed.
- Direct lane writes: `.ufo/waves/round-19/w2/SourceS088.md`, `SourceS088.body.gz`, `SourceS088.model.body.gz`, `SourceS088.deps.body.gz`, `SourceS088.s094.body.gz` under the same w2 directory only.
- Disposable decoded evidence: `/tmp/SourceS088-4urh1vbp/`. `corpus/SOURCES.md` and all production files were intentionally unchanged.
