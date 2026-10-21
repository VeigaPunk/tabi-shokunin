# SourceS079 — independent source reopening at R

Access date: **2026-10-21**. Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). The read-only lane-master lookup also returned R. Scope: S079, its actual consumer and direct outcome callers, plus the expressly requested S094 rejection. No other queued row was mined or admitted.

Axes examined: **depth** through source identity, located-quote fidelity, source-to-teaching entailment, contract boundaries, and admission/status precision. This is advisory source evidence, not a round verdict or a fresh browser observation.

## Findings

- **Agree** with S079's primary-source identity, tier A, exact-build scope, `mined` status, and `used-by` path. Both recorded decoded source hashes match the independent fetch. The lesson's 17-word quote is verbatim at PDL line 116.
- **Qualify/disagree with a wire-level reading of “null output.”** The emitter passes a C++ null pointer for the optional output argument; the PDL says the field is missing for non-Completed outcomes. The retained R receipt corroborates omission: **32 Error events, zero with an `output` key**, all 32 with `errorText`. It does not show `output: null`. Keep the distinction explicit rather than rejecting the useful source.
- **Qualify “parsed output.”** Success calls the local `ParseJSON` helper, but its definition includes an empty-dictionary case and a string fallback. The row must not be read as guaranteeing an object-valued result or successful JSON parsing. No new runtime exercise of the fallback was performed.
- **Agree with S094's rejection:** the exact attempted URL still returns HTTP 404 and the same six-word first line. Its 233-byte error body has a different SHA only because the request-ID line changed. Agree with the flip **as a condition for admitting a replacement source**, not as rehabilitation of this missing exact URL merely because a differently named test exists.

## 1. Exact URLs and fetched bodies

All requests used `Accept-Encoding: identity`; all observed responses had identity content encoding. The HTML pages below are the two exact URLs in S079. Their `?format=TEXT` companions return Gitiles base64; decoded hashes below refer to source-file bytes, not HTML or base64. Final URLs equaled requested URLs.

### S079 source URLs

**P — exact registry URL:**
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl

**PT — exact lesson/raw-source URL:**
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT

**E — exact second registry URL:**
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc

**ET — emitter raw-source URL:**
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT

| Body | HTTP | Bytes | SHA-256 |
|---|---:|---:|---|
| P HTML | 200 | 48,249 | `742d9720cd8ea102ae3d4ed6ed424ebc5f480f945600d18c72ce5b28b9ab7441` |
| PT as-served base64 | 200 | 5,292 | `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4` |
| PT decoded source | 200 | **3,969** | **`26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`** |
| E HTML | 200 | 114,203 | `69e1e74c04150e1402b1eef86e4988335273102777a9b96e2339d182556ac016` |
| ET as-served base64 | 200 | 11,448 | `0ecdff0035ee606645ebd2b88b3fc73584764e3ac3f1cec96fe14a39c1e11780` |
| ET decoded source | 200 | **8,585** | **`1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475`** |

Both bold decoded hashes equal `corpus/SOURCES.md:93` at R. PT also byte-equals R's decompressed `corpus/evidence/round-19/sources/WebMCP.pdl.gz`; no immutable source-body drift was observed.

Tag identity was independently fetched from:
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON

It returned HTTP 200, 2,334 bytes, SHA-256 `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`, and commit **`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`**, matching S079. The initially requested trailing-slash tree URL, https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/?format=JSON, returned HTTP 200, 12,903 bytes, SHA-256 `491630819aacd712a56d4cc0c61918fecabf3e00c0179718658dd572f4ac7bff`; its tree ID `e096b0852a79b0810dba5cfaa714c95d74908532` matches the commit's tree. A tree ID was not mistaken for the commit ID.

### Supporting direct caller, not another mined row

https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT

HTTP 200; base64 66,824 bytes, SHA-256 `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d`; decoded **50,117 bytes**, SHA-256 **`474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`**. Used only to inspect S079's outcome callers.

## 2. Located quotes and source-to-teaching entailment

Every quote below was located in the independently fetched decoded body on **2026-10-21**. Source labels resolve to the exact URLs and complete body hashes in §1/§5.

| Source / exact location | Verbatim quote | Whitespace-delimited words | Result |
|---|---|---:|---|
| PT, `WebMCP.pdl:116`; SHA `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | Output or error delivered as delivered to the agent. Missing if `status` is anything other than Completed. | **17** | Exact match to `corpus/lessons/round-19.md:35` at R; leading source-comment marker excluded, wording unchanged. |
| PT, `WebMCP.pdl:66`; same decoded SHA | `object input` | 2 | Supports the declared top-level input type, not a general inputSchema validator. |
| ET, `inspector_web_mcp_agent.cc:242`; SHA `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` | `nullptr, error.message,` | 2 | A null pointer argument and forwarded error message; not evidence for JSON `output: null`. |
| ET, `inspector_web_mcp_agent.cc:63`; same decoded SHA | `return protocol::StringValue::create(value);` | 2 | Explicit fallback beyond the row's short “parsed output” description. |

Observed source mapping:

| Teaching / boundary | Located definition | Assessment |
|---|---|---|
| Status vocabulary | PDL `:25-30` declares Completed, Canceled, Error. | Agree for this experimental build contract, not an open-ended vocabulary or a cross-version promise. |
| Event payload | PDL `:109-122` declares required invocationId/status and optional output/errorText/exception. | Agree. The exception declaration is physically at **122**; the row's inclusive `109-123` anchor covers it. |
| Success | `InspectorWebMCPAgent::WebMCPToolResponded`, emitter `:208-218`, forwards the invocation token, Completed, and `ParseJSON(result)`. Both success/failure functions return without emission while disabled. | Agree as conditional source mapping; not unconditional event delivery. |
| Output conversion | Local `ParseJSON`, emitter `:47-64`: null String → empty dictionary; successful parsed protocol value → that value; otherwise original String as a protocol string value. | “Parsed output” needs this qualification. Whether a particular ordinary caller can reach the fallback was not runtime-tested. |
| Failure status | `InspectorWebMCPAgent::WebMCPToolFailed`, emitter `:220-230`, chooses Canceled only for kToolCancelled and Error otherwise. | Agree. This maps the supplied code; it does not prove every cancellation mechanism supplies that code. |
| Failure fields | Emitter `:231-243` wraps an exception only if the optional pair exists and its ScriptValue is nonempty, then passes null output pointer, error.message, and the remote object. | Agree at the C++ argument level; disagree if “sends null output” asserts a wire-level null-valued field. A wrapping attempt is not a separate runtime guarantee of an exception field. |

**Concrete retained evidence for the null/absence distinction:** R's `corpus/evidence/round-19/validation/receipt.json` has SHA-256 `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`. The raw `observed.toolResponded` for `decl-checkbox-03` at lines 220-224 has invocationId, status Error, and errorText only. Inspection of its raw event dictionary found `outputPresent=false`. Across the R receipt, 32 raw Error event dictionaries had zero output keys and 32 errorText keys. These are historical retained observations, **not a rerun**.

The count was evaluated against bytes read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47:corpus/evidence/round-19/validation/receipt.json`, parsed using Python `json.loads` in the foreground eval:

```python
error_events = [c['observed']['toolResponded'] for c in receipt.get('cases', [])
                if isinstance(c.get('observed', {}).get('toolResponded'), dict)
                and c['observed']['toolResponded'].get('status') == 'Error']
len(error_events), sum('output' in e for e in error_events), sum('errorText' in e for e in error_events)
# Observed: (32, 0, 32)
```

A precise replacement teaching would describe the success argument as **ParseJSON's parsed value or fallback**, and the failure argument as **nullptr for optional output (field omitted), forwarded error.message, and an optionally wrapped exception**. This report does not alter the append-only registry; any source-row correction is the integrator's decision.

## 3. Definitions, callers, and semantic-navigation limit

The requested `xd://lsp` discovery returned **“No such tool”**; the mounted-device inventory contained no LSP device. No server could answer definition/references/hover/status, so there was no cold indexing result to treat as absence. Text searches were used only to locate sections, followed by direct source reads. They are **not compiler-resolved semantic proof**.

Read-only caller trace in the fetched `model_context.cc`:

- `ModelContext::OnToolFailed`, `:518-525`, calls the failure probe with no exception, then posts the callback.
- `ModelContext::ExecuteDeclarativeTool`, `:719-746`, calls the success probe only for a non-null successful String; a null String means navigation/new-document response. Errors call the failure probe with no exception.
- `ModelContext::GetCrossDocumentScriptToolResult`, `:651-670`, calls the success probe for the computed result immediately or via the queued callback. `ComputeScriptToolResult`, `:146-181`, constructs a JSON array from successfully parsed response scripts.
- `ModelContext::OnToolExecuted`, `:856-871`, calls success for a successful result, or failure with kToolInvocationFailed and the separate exception pair.
- `ModelContext::CancelTool`, `:613-640`, delegates declarative cancellation to the declarative tool; the imperative branch supplies kToolCancelled through OnToolFailed. No uninspected declarative cancellation branch was claimed to behave identically.

Remaining gap: the generated probe-dispatch bridge between these probe calls and inspector methods was not opened/resolved, and no fresh browser was launched. The direct method bodies and the pinned PDL independently establish the scoped mappings above; no stronger global delivery guarantee is inferred.

## 4. Scope, tier, status, consumer, and source class

At R, `corpus/SOURCES.md:93` is `kind=code`, `tier=A`, `status=mined`, `opened=2026-10-21`, `recheck=on-release`, `used-by=corpus/knowledge/webmcp-declarative-validation-round-19.md`.

- **Scope/tier — agree:** upstream build-tagged PDL plus the actual Blink emitter are primary authority for the anchored **154.0.8037.97 source**, not every 154 patch, every deployed browser, or a web standard. The PDL labels the domain experimental at `:7`.
- **Status/consumer — agree:** the named file exists at R, explicitly cites S079 at `:3`, uses its object-input declaration at `:66-67`, and directs clients to status/errorText at `:71-72`. Its existence/citation satisfies mined's used-by requirement. Its SHA at R is `14d20b11e69bf6b2e4a9fe56b9431537bd4b0b163d8a8a62decc71bf3d3c75a1`.
- **Source versus runtime — distinguish:** the PDL is an implementation protocol declaration; the C++ is implementation source. Neither is a proposed declarative API explainer nor normative proof of general JSON Schema enforcement. No queued specification/docs row was promoted by this review.
- **Input-boundary entailment:** PDL `:59-69` supports the command shape. The extra claims in the consumer and `SKILL.md:2067`—Invalid parameters, no invocationId/toolInvoked, unchanged fields—need retained runtime evidence rather than the PDL alone. Reading R's receipt confirmed the three cited non-object cases (`decl-non-scalar-03/04/05`) record those outcomes and `pass:true`; their object control `06` records Completed and one submission. This is receipt inspection, not independent browser reproduction or a C1-counter verdict.
- The lesson's located PDL quote supports output optionality; the additional cancellation/error/exception teaching depends on the **second source's implementation**, not on that one comment alone.

## 5. S094 rejection and flip

Exact attempted URL:
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT

Access **2026-10-21**, HTTP **404**, decoded/as-served plain-text body **233 bytes**, SHA-256 **`c63df9d3310174fa0dd659df0d015a60420b8af75e5690a7b123921e6fa2754c`**.

Located quote, **first response line**, **6 words**:

> NOT_FOUND: Requested entity was not found

The first line exactly matches the quote in `corpus/lessons/round-19.md:51`. Decompressing that lesson's committed evidence at R gives 233 bytes and its recorded SHA **`9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`**. Comparing the two response bodies found their only changed line was `request_id`. A versioned nonexistent file path does not make its generated error-response body immutable; the digest drift does not falsify the historical fetch or change the rejection.

**Rejection — agree, high confidence:** this exact source is unavailable at the pinned path. This is not an absence claim about all form-tool tests.

**Flip — agree with a boundary:** a resolvable actual test source at an authenticated revision, with a ≤25-word located quote genuinely from that file supporting the proposed teaching, would justify admission of that replacement source. Merely naming `html_form_mcp_tool_test.cc`, finding a quote in a different implementation file, or obtaining a 200 page shell is insufficient. A different filename does **not** make this rejected exact URL valid; it belongs in a separately evidenced row. The existing lead was not fetched/mined by this seat.

## 6. Execution limits and retained artifacts

Performed: foreground official-source HTTP fetches, base64 decoding, SHA/byte/quote calculations, read-only git-show/master lookup, source/caller section reads, and scoped inspection of already-committed receipt data. No browser, runtime/mutation probe, build, lint, formatter, or test suite was run. No tools were installed or updated; no background jobs, services, or persistent child processes were started. No SOURCES edits or domain-source mutations occurred.

Required retained decoded PDL: **`.ufo/waves/round-19/w2/SourceS079.body.gz`**. Other seat-owned gzip bodies retain the emitter, caller, exact HTML pages, S094 response, and tag metadata. Gzip containers were written with mtime zero; body hashes above concern decompressed payloads. The read tool treated plain gzip streams as archive listings instead of source text; this was reported through `xd://report_issue`, then decoded scratch copies were created for targeted grep/read. That tooling limitation is not missing source evidence.

Confidence: **high** for HTTP outcomes, exact quote, body identity, declaration/method-body contents, retained-event omission, and used-by citation; **source-level only** for runtime implications. Unresolved: compiler-resolved/generated probe wiring, independent runtime reproduction, and live reachability of the output-parser fallback. None is silently credited as observed runtime behavior.

## Isolation

- Clone path: **none**; this source-only, report-only seat performed no runtime or mutation probe and produced no production file.
- Branch: not applicable; no git write was run.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked/read revision R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Clone commit: **none**; no commit is claimed or fabricated.
- Production changed paths: **none**. `corpus/SOURCES.md` intentionally unchanged.
- Permitted direct lane artifacts: `.ufo/waves/round-19/w2/SourceS079.md`, `SourceS079.body.gz`, `SourceS079.inspector.body.gz`, `SourceS079.model_context.body.gz`, `SourceS079.pdl.html.gz`, `SourceS079.inspector.html.gz`, `SourceS079.S094.body.gz`, `SourceS079.tag.json.gz`, `SourceS079.tag.commit.json.gz` (all filenames after the first share its directory).
- Readable source scratch only: `/fast/scratch/tabi-r19/SourceS079.WebMCP.pdl`, `/fast/scratch/tabi-r19/SourceS079.inspector_web_mcp_agent.cc`, `/fast/scratch/tabi-r19/SourceS079.model_context.cc`. No sandbox clone, branch, production edit, or sibling artifact was created.
