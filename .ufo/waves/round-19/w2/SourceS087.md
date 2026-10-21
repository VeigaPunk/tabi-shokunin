# SourceS087 — independent reopening at R

Access date: **2026-10-21**. Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R).

Axes: source identity/integrity; quote precision; source-to-teaches entailment; registry/consumer coherence.

## Findings

1. **Agree with S087's source, located quote, scope, tier A and substantive teaching.** HTTP 200; decoded SHA matches the lesson exactly. This is a pinned **Community Group draft**, not Chromium implementation evidence, a W3C Standard, or a declarative-validation contract.
2. **Disagree with S087's `queued` / `used-by: —` metadata at R.** The committed knowledge note already cites S087 substantively at `corpus/knowledge/webmcp-declarative-validation-round-19.md:17-18`. The source is being used, not merely listed in the lesson's opening gate. The lane's recorded precedent explicitly treats a note-body citation as mining (`corpus/SOURCES.md:135`, round-16 wave-2 search log). Recommended L1-only correction: `queued → mined`; `used-by: — → corpus/knowledge/webmcp-declarative-validation-round-19.md`. I changed neither cell.
3. **Gate-quote relevance is narrower than the new row's teaching.** The authentic lesson quote establishes the invocation error definition, not registration-time schema serialization/storage. The registration teaching is supported elsewhere in the same fetched body, as traced below. This is a citation-coverage weakness, not a false quote or false teaching; retain/add the registration anchors when presenting that teaching.
4. **Agree with S094's narrowly scoped HTTP404 rejection; no flip is warranted now.** Its error-body SHA changed solely with the response's request ID. A different resolvable test filename would be separate evidence, not proof that this rejected URL exists.

Confidence: **high** for all four findings. No runtime/browser behavior was tested or inferred from a successful fetch. No other queued source row was reopened or mined.

## Checkpoint binding

At the initial read, `refs/heads/master` resolved to R. Read-only Git object identities matched each inspected working file to its R blob:

| Path at R | Git blob |
|---|---|
| `corpus/SOURCES.md` | `77aaede0098f251f289461f23fcf66f52b42bcf1` |
| `corpus/lessons/round-19.md` | `e76dfde1f6e9e79f510fabd1ea88ee2e6d6fe31e` |
| `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `e0897bf9ca08d18612876dc8db9eb4278b0160ee` |

Findings concern those R bytes, not subsequent integration changes. The registry row is at `corpus/SOURCES.md:101`; the lesson gate is at `corpus/lessons/round-19.md:43`.

## S087 fetch and custody

Exact fetched source URL (**U**):

<https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs>

The row's parenthetical blob-view string abbreviates the hash with an ellipsis; its expanded navigation URL is <https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs>. Source-byte claims here use U, not GitHub's surrounding HTML or the rolling rendered draft.

- Observed fetch: **HTTP 200**, effective URL unchanged, `text/plain; charset=utf-8`, content encoding `identity`; `2026-10-21T08:41:26.713282+00:00`.
- Decoded body: **91,001 bytes**, **2,053 lines**; SHA-256 **`76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`**. Exact match to the round-19 lesson and original dossier; **no immutable-body drift**.
- Required retained body: `.ufo/waves/round-19/w2/SourceS087.body.gz`, **24,192 bytes**; gzip SHA-256 `6e400c632f028b6afc1b515bdcabd82008be67249e578e8507ad21f33165a2c6`. Compression used `mtime=0`; the in-memory gzip round trip reproduced the fetched bytes exactly. Compressed SHA/size need not equal another seat's differently produced gzip.
- Pin metadata independently fetched from <https://api.github.com/repos/webmachinelearning/webmcp/commits/51ed75653aaa7f174f8dbe05d1bc327359bbc57c> on 2026-10-21: HTTP 200; matching full commit; author and committer date both `2026-10-20T14:57:14Z`. Metadata response: 9,400 bytes, SHA-256 `fd5e3c90e6d8849db8942612fe631705ca8aa37c82238ac94cf223184188a044` (metadata JSON, not the source-body digest).

### Located quotations

All following quotations are from **U**, accessed **2026-10-21**, decoded-body SHA-256 **`76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`**. Word counts use whitespace separation; source line-wrap whitespace is collapsed for presentation.

| Quote | Words | Exact source location | Finding |
|---|---:|---|---|
| “The input arguments could not be parsed into a JavaScript Object.” | 11 | `index.bs:277`; enclosing invalid-input/DataError row `276-278`, `#supporting-concepts` | Exact lesson quote, word count and located range hold. It describes parsing/Object-ness, not JSON Schema conformance. |
| “For web developers (non-normative)” | 4 | `index.bs:45`; `.domintro::before` at `44-46` | Explicit status of the DOM introductory summaries. |
| “or if the {{ModelContextTool/inputSchema}} is invalid.” | 6 | `index.bs:714-715`, `#model-context-container` | Present in the DOM intro, not an operational schema-validation step. |
| “it's expected to match the schema described by the tool's {{RegisteredTool/inputSchema}}.” | 11 | `index.bs:733-734`, same section | Caller expectation in that same non-normative introduction. |
| “object inputSchema;” | 2 | `index.bs:1198`, `#model-context-tool` | Optional object-typed dictionary field; unlike required fields beside it, this member lacks `required`. |
| “A JSON Schema object describing the expected input parameters for the tool” | 12 | `index.bs:1239`, member description at `1237-1240` | Schema-description language, not a validation algorithm. |

### Definitions and caller/consumer trace

The `lsp` device is **unavailable**: reading `xd://lsp` returned `No such tool: xd://lsp` and enumerated no mounted LSP device. This was not an empty cold/indexing result. The following is a **literal-source/manual algorithm trace**, not claimed LSP semantic proof.

| Symbol/path in pinned `index.bs` | Observed relevant operation |
|---|---|
| `ModelContextTool`, `1187-1201` | Declares the optional `object inputSchema` and required execute callback. Source metadata at line 5 labels the document `CG-DRAFT`. |
| `ModelContext.registerTool`, full algorithm `753-897` | Guards registration state/name/description/permissions; initializes empty schema storage at `783`; JSON-serializes a present schema at `785-788`, propagating serialization exceptions. The note at `790-802` distinguishes undefined/cyclic serialization failures. |
| Stored tool definition, `849-888` | Stores that string under `tool definition/input schema` at `860-861`, installs execute steps calling `invoke the execute callback` at `863-866`, then inserts the definition into the tool map at `887-888`. This storage evidence extends beyond the registry's first registration range ending at `803`. |
| `ModelContext.getTools`, `987-993` | Parses the stored schema JSON back into `RegisteredTool.inputSchema`, or supplies undefined when absent. The note guarantees JSON syntactic validity, not JSON Schema validity. |
| `ModelContext.executeTool`, `1023-1185` | Defaults omitted input to an ordinary object at `1047-1048`; asserts Object at `1050`; JSON-serializes at `1052-1053`; queues `tool execute steps` at `1174-1176`. Origin/lifecycle/permission checks do not compare input with the schema. |
| `tool execute steps`, `493-545` | Resolves the currently registered tool by name, then calls its stored execute steps at `542-543`. The note at `507-515` explicitly leaves old-arguments/new-schema race behavior to unresolved issue #92; it is not a validator definition. |
| `invoke the execute callback`, `547-583` | JSON-parse failure and parsed non-Object take `invalid input` at `555-560`; successful input proceeds to tool activation and callback invocation at `582-583`, with no schema-comparison operation between them. |
| Error definition/completion, `276-278`, `1146-1155` | `invalid input` maps to `DataError`; completion rejects the page-side promise with the corresponding DOMException name. This is not a declarative CDP `toolResponded` status/error-text contract. |

**[INFERENCE, strongly supported by the complete relevant algorithms]** The pinned draft defines schema serialization/storage and an expected-input description, but no normative JSON-Schema instance validator in this registration/invocation path. That supports S087's narrow teaching. It does **not** establish that a browser, tool callback or agent never validates inputs. A whole-body literal search additionally found zero occurrences of `declarative`, `form tool`, `invalid argument`, or `invalid-argument`; that textual absence is supplementary, not implementation proof. No Chromium source or runtime result was substituted for the draft.

### Registry fields and entailment

- **Kind `spec`, tier `A`: agree within scope.** It is editors' primary CG-draft source at a full commit. Internal normative algorithms are not a W3C Standard or evidence of Chromium implementation conformance.
- **Scope/anchors: agree.** `#model-context-container` and `#model-context-tool` resolve to the cited registration and dictionary text. For the explicit storage assertion, `849-888` is the stronger additional location.
- **Teaches: agree with the normative/non-normative distinction.** Serialization errors are not schema-invalidity semantics; parser/Object errors are not keyword/instance validation. The separate existing invocation anchor need not be promoted into a declarative rule.
- **Opened `2026-10-21`, recheck `on-release`: agree as recorded access/cadence.** This audit reopened the exact pinned revision; a future draft revision would be a different source snapshot.
- **Status/used-by: metadata discrepancy.** `queued` and `—` conflict with the substantive S087 citation in the R knowledge note at `17-18`. The lesson gate at line 43 also records opening, but that alone was not used to infer mining. No other queued row's status is adjudicated here.
- **Lesson entailment:** the located gate quote proves its specific invocation-error sentence. It does not by itself prove the new registration teaching. The inspected registration/storage/callback chain above does support the broader narrow-scope teaching; no new runtime-validation claim follows.

## S094 rejection and flip boundary — bounded requested check

Exact fetched URL:

<https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT>

Access **2026-10-21**, observed `2026-10-21T08:41:27.360084+00:00`: **HTTP 404**, unchanged effective URL; `text/plain; charset=utf-8`, identity encoding. This is a plaintext error response, **not** a base64-encoded C++ source file despite `format=TEXT`.

- Exact quote: “NOT_FOUND: Requested entity was not found” — **6 words**, error body **line 1**. The detailed error reports object-not-found on line 4.
- Response body: **233 bytes**, SHA-256 **`5d141e8ca1cb2dabd243e4e9abdf105cbc6635e7c4b03adb469526026b91ced5`**.
- Recorded lesson/registry error SHA: `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. The retained original response's line-7 request ID was `ae2958d1612f4cf1a1b6caf7c52fd969`; this response's was `ab2de10328a1417b8c240e2804b1206a`. Replacing **only** that ID in the current bytes reproduced the recorded SHA exactly. This is request-specific error-page drift, not drift of an immutable source body.
- **Agree** with rejected/tier-C treatment for this attempted URL and with the lesson's located error quote (`corpus/lessons/round-19.md:51`; registry `corpus/SOURCES.md:108`). It establishes no code/test behavior and does not imply that Chromium lacks tests elsewhere.
- **Flip condition:** this exact pinned URL returning successfully decoded test source with an independently located relevant quote would overturn this URL's failure-based rejection. A different file such as the named `html_form_mcp_tool_test.cc` lead requires its own verified quote/source identity and separate admission; it would not make the original guessed path exist. That lead was not reopened here; **no flip now**.

## Limits and operations

Remaining unknowns are implementation/runtime schema-validation behavior and any replacement test-file evidence; neither is answered by this draft or by an HTTP404. No browser/profile was opened, no runtime/mutation probe or suite was run, no process was left running, and no tools were installed/updated. `read` could not open the valid retained gzip as a compressed stream and returned an empty archive directory; this tooling inconsistency was reported through `xd://report_issue`. Exact numbered source review used a disposable decoded copy, not the URL reader's wrapper-adjusted line positions. That scratch copy was removed after review. Source security examples containing instruction-like attack text were treated as data only; none was executed or followed.

## Isolation

- Clone: **none**; report-only public-source inspection, no production or runtime/mutation work.
- Branch: not applicable.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`; attacked source checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Clone commit: none; no commit was created and no lane Git write was performed.
- Lane paths written only: `.ufo/waves/round-19/w2/SourceS087.md`, `.ufo/waves/round-19/w2/SourceS087.body.gz`.
- `corpus/SOURCES.md`, production files and all other seats' artifacts intentionally unchanged by this seat.
