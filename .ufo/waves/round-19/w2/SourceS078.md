# SourceS078 — round-19 source falsification

## Result and axes

**S078: agree with Tier A / mined / on-release admission for the stated Chromium-154, source-level scope.** Its exact URL resolves, the lesson quote is verbatim at the stated line, the decoded hash matches R, and its used-by path actually cites it. **Disagree with taking the teaches cell's “empty string” as a precise result contract:** the navigation branch uses `base::ok(String())`, explicitly described by the source as a null-string navigation sentinel. That warrants a precision caveat, not rejecting the source or claiming a browser/CDP result that was not observed.

**S094: agree with rejection; no flip warranted.** The exact registered URL still returns HTTP 404. Its new error-body hash differs only because the request identifier changes, not because the missing code appeared.

Axes: source authority and version binding; byte/quote fidelity; implementation-to-teaching entailment; admission/status calibration. Confidence is **high** for fetched bytes, locations, registration fields, and visible source branches; downstream protocol/runtime behavior was not re-measured.

## Checkpoint and scope

- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Read R's `corpus/SOURCES.md:92,108`, `corpus/lessons/round-19.md:34,51-56`, the declared knowledge note, the retained S078/404 bodies, and only S078-bound decision records. The current ledger, lesson and note were byte-identical to their R blobs when read.
- Reopened S078 only, plus the explicitly requested S094 rejection check. No other queued row was fetched or promoted. The alternate test filename remains an unverified lead.
- Access date for every fetch below: **2026-10-21**. Requests were unauthenticated static HTTPS fetches; no browser/profile, runtime fixture, DevTools endpoint or suite was used.

## Exact fetch evidence

### S078 primary implementation

Exact registered/fetched URL:

https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT

- HTTP **200**, `text/plain; charset=utf-8`; no redirect.
- Gitiles TEXT entity: **91,040 bytes**, SHA-256 `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`.
- Base64-decoded UTF-8 source: **68,278 bytes / 1,740 lines**, SHA-256 **`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`**.
- Decoded bytes equal R's `corpus/evidence/round-19/sources/html_form_element.cc.gz` after decompression. **No immutable-source drift.**
- Newly retained decoded body: `.ufo/waves/round-19/w2/SourceS078.body.gz` (**15,870 compressed bytes**, deterministic gzip without a source filename).

Independent tag-identity metadata URL:

https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON

HTTP **200**; **2,334 bytes**, SHA-256 `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`. The JSON `commit` is **`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`**, exactly the ledger's commit. Retained as `.ufo/waves/round-19/w2/SourceS078.tag.body.gz`.

### Located lesson quote

At `corpus/lessons/round-19.md:34`, the S078 quote is:

> // With the `toolautosubmit` attribute, we immediately submit the form.

**Location:** decoded `html_form_element.cc:219`, at the exact S078 URL above; accessed **2026-10-21**; body SHA-256 **`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`**. Exact full-line match after removing indentation. **9 natural-language words**, or 10 whitespace tokens if the `//` comment delimiter is counted; the lesson's 9-word count is defensible. The executed branch at line 220 corroborates the comment; this is not merely a comment accepted as behavioral proof.

## Contract fields and used-by entailment

| Field at R, `corpus/SOURCES.md:92` | Finding |
|---|---|
| kind `code`, tier `A` | Agree: first-party Chromium implementation at an identified release tag/commit, not a proposal, specification, test result or generic cross-browser contract. |
| scope: Chromium 154 declarative post-fill execution; source-level only | Agree within that boundary. Native input validation, browser flags, navigation success and arbitrary client behavior are not all established by this one file. |
| anchor `html_form_element.cc:174-328,635-842` | These spans contain the fill/submission fork, callback delivery, promise settlement, interactive-validation failure and navigation sentinel. The claimed SHA and tag commit match the new fetch. |
| `mined`, opened `2026-10-21`, recheck `on-release` | Agree. The note uses the source substantively, and an immutable build-specific source should be reconsidered for another Chromium release. |
| used-by `corpus/knowledge/webmcp-declarative-validation-round-19.md` | Exists at R; line 2 identifies S078 and the same body hash; lines 40-42 use its post-fill validation/callback path. Lines 15-20 limit runtime claims to autosubmit fixtures and explicitly exclude forms without autosubmit. |

R's `corpus/evidence/round-19/validation/decisions.json` has **5** S078-bound decisions: **DV-06, DV-11, DV-18, DV-20, DV-22** (IDs at lines 135,265,446,497,550). All bind the fetched body hash and source span 729-751. That span establishes the generic validation-failure construction and delegates the control-specific message to `validationMessage()`. It does **not alone** prove each required/range/pattern/email/date condition or each localized message. Those decisions also declare probe/control cases; their execution was not rerun here. For an anchor intended to include the error enum and callback itself, the complete local span is **729-758**, not merely 729-751.

## Definitions and callers: observed source, not semantic-index proof

The required `lsp` device is **not mounted**: requesting `xd://lsp` returned `No such tool: xd://lsp` and the mounted-device inventory contained no LSP device. There was no answering/cold-indexing server to warm or retry. Literal search located the following definitions/call sites, then their actual source sections were read. This is a bounded textual trace, **not** a complete semantic reference graph.

All source locations below refer to the exact S078 URL, accessed **2026-10-21**, decoded SHA-256 **`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`**.

| Definition/call site | Observed implementation and effect on teaching |
|---|---|
| `HTMLFormElement::RegisterDeclarativeWebMCPTool`, 410-463 | Checks the WebMCP feature, reads the autosubmit attribute, constructs `HTMLFormMcpTool`, and calls `ModelContext::RegisterDeclarativeTool` at 462. This is implemented Chromium machinery, not a proposed declarative surface inferred from a specification. |
| `HTMLFormMcpTool::ExecuteTool`, 174-220; `FillFormControls`, 232-258 | Computes the submit-button requirement as the inverse of autosubmit, calls the fill helper, and returns an input error directly before marking the tool running. After successful fill it saves the callback; the default branch focuses the submit button and pauses execution, while autosubmit calls `PrepareForSubmission` immediately. The stale TODO at 201-203 does not erase the concrete implemented fork at 212-220. |
| `HTMLFormElement::PrepareForSubmission`, 635-680,713-758 | Immediate invocation is an **attempt**, not unconditional successful submission. Frame/reentrancy/disconnection/sandbox/unclosed-control guards can return early without a callback in those local branches. Interactive validation may be skipped for page/form/submitter conditions at 713-715. Otherwise failure sets `should_submit` false and calls back with `kToolInvocationFailed` after constructing each invalid-control message. No value-restoration operation appears in this failure branch. |
| `PrepareForSubmission`, 769-813 | Marks the declarative submit event agent-invoked, dispatches it, and uses the event cancellation state. If there is a response promise, the two `.Then` call sites at 798-806 name `HandleWebMcpToolResponse`; cancellation without a response promise reports a programming-error callback. This supports the **enumerated** handler-error path, not a blanket claim that every JavaScript handler exception becomes a tool error. |
| `HandleWebMcpToolResponse`, 290-328; `HTMLFormMcpTool::CallDoneCallback`, 261-275 | Settlement is ignored when the tool is no longer running. Otherwise object resolution is JSON-stringified, serialization failure and promise rejection return `kToolInvocationFailed`, and other successful values are string-converted before callback delivery. The callback routine clears running/button/invocation state when it has a callback. |
| `PrepareForSubmission`, 818-829; `submitFromJavaScript`, 834-842 | Both schedule submission and deliver `base::ok(String())` if the tool is still running. At 827 the source expressly says **“Return a null string”** (4 quoted words). Therefore the row's “empty string” is lossy terminology; this source does not justify advertising an ordinary empty successful CDP payload or completed navigation. |

**Inference, bounded:** the source supports the note's distinction between fill-time failure and post-fill interactive-validation failure. It also supports default-user-gated versus autosubmit dispatch as implementation knowledge, although the note correctly declines to label the default branch runtime-measured. Remaining downstream gap: the exact transport treatment of the null-string sentinel and complete cross-file `ExecuteTool` caller graph were not independently resolved in this single-row audit. No runtime completion, arbitrary-exception conversion or universal callback guarantee is inferred.

## S094 rejection and flip

Exact registered/fetched URL:

https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT

- Access **2026-10-21**; HTTP **404**, `text/plain; charset=utf-8`; no redirect.
- Raw error body **233 bytes**, SHA-256 **`98d13d5c67329659fe0bab9442aafbaca42c1d4f488ae87478ada74a6f1994e0`**. A 404 body is plain text, not base64 code to decode.
- Located quote, response **line 1**: **“NOT_FOUND: Requested entity was not found”** (**6 words**). This quote is exact; the URL/date/body hash are specified immediately above.
- R's retained previous error body is also 233 bytes and does match its recorded SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. All corresponding lines except **line 7, `request_id`**, are identical. This is request-specific error-envelope drift, not immutable source-code drift or evidence of a newly available test.
- New response retained as `.ufo/waves/round-19/w2/SourceS078.S094-404.body.gz`.
- **Agree** with the rejection and its narrowly scoped Tier C/missing-path status. **Agree with the substance of the flip criterion:** a resolvable, same-tag primary test source must supply its own relevant located quote and retained body. An alternate filename is only a lead; silently substituting it would not make this exact missing URL resolve. It was not fetched or mined here. **No rejected→queued/mined flip is supported by this probe.**

## Exercise and limitations

Exercised only: three static source/metadata HTTP fetches, base64 decoding, SHA-256/size/quote comparisons against R, gzip retention, and direct reading of scoped source and consumers. No build, linter, formatter, harness, browser or full suite ran. No tool was installed or updated. The static reader omitted the Gitiles base64 body; this was reported to `xd://report_issue`, and byte-preserving fetching supplied the retained evidence. No background job or service was started.

## Isolation

- Production clone: **not applicable**; read-only source audit, no runtime/mutation probe.
- Branch: **none**.
- Production base/commit: **none**; observed checkpoint R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (writer baseline B was not mutated).
- Only direct LANE writes: `.ufo/waves/round-19/w2/SourceS078.md`, `.ufo/waves/round-19/w2/SourceS078.body.gz`, `.ufo/waves/round-19/w2/SourceS078.tag.body.gz`, `.ufo/waves/round-19/w2/SourceS078.S094-404.body.gz`.
- No production changes, git writes, delegation, browser/profile access, or source-ledger edits. Disposable decoded-source scratch was removed; retained gzip evidence remains at the paths above.
