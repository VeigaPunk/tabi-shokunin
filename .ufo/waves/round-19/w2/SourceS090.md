# SourceS090 reopening at R

Access date: 2026-10-21. Scope stayed to S090 and the explicitly requested S094 rejection/lead; no other queued SOURCES rows were mined. `corpus/SOURCES.md` was not changed.

## S090 — agree with the scoped row; do not expand its entailment

Registry URL: <https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.test.ts>

Fetched immutable body URL: <https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.test.ts>

The round-19 lesson's located quote at `corpus/lessons/round-19.md:46` is exact: `Protocol.WebMCP.InvocationStatus.Error, undefined, 'Permission denied', undefined),` (5 words), at `front_end/panels/application/WebMCPView.test.ts:294` (constructor spans 293–294). Accessed 2026-10-21; decoded body SHA-256 `0c3dd754229d4fb2b51d8836cc643a5352e96f93d967d7c5cc74b739a1daded8`; 52,889 bytes. This exactly matches the lesson and the full digest retained in it. The 40-hex commit pins this source; no rolling-source drift observed. The body was fetched and compressed to `.ufo/waves/round-19/w2/SourceS090.body.gz`; gzip integrity passed, and decompression reproduced the same SHA-256.

The source supports the row's narrow claim. In lines 261–317, the status-rendering test manually constructs `Completed`, `Error` (with `Permission denied` as its errorText), and `Canceled` results and captures a view screenshot. In lines 507–562, a separate test manually creates an `Error` result, stubs its symbolized-error getter with a mock stack trace, selects the Output tab, and captures a screenshot. Those are DevTools frontend test fixtures/rendering expectations. They do **not** establish live CDP/backend wire values, actual form-fill error text, or Chromium runtime behavior. The row's code/A tier and its explicit “not live CDP behavior” scope are appropriate.

SOURCES row state at R: opened `2026-10-21`; `status=queued`, `recheck=on-release`, `used-by=—`. The lesson's source table points to `w1/RevDeclErrorSurface.md` and its gate dossier, but the lesson states only selected sources were mined for the round-19 knowledge note; S090 remains queued and has no SOURCES `used-by` path. No status/path flip is supported by this frontend-only fixture evidence.

## S094 — agree with rejection of the exact guessed URL; do not relabel its 404

Exact rejected URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT>

Re-fetched 2026-10-21: HTTP 404. Response line 1 is `NOT_FOUND: Requested entity was not found`; current response body is 233 bytes, SHA-256 `3b6f92036ce3e9cac07ede6129db052c487effb5854ad6c8c4d281d2069a2408`. The retained round-19 evidence `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` is also 233 bytes and matches its recorded SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`; its status and first line match the re-fetch. The response embeds a per-request `request_id`, which differs between captures and accounts for the body-hash drift. Thus the rejection of this exact missing path is correct. **Do not flip S094 itself to mined**: a 404 is not evidence about implementation behavior.

The SOURCES/lesson lead is nevertheless real and relevant as a *separate replacement candidate*, not as a correction to that URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc?format=TEXT>. Fetched and base64-decoded 2026-10-21; decoded body SHA-256 `944ee9e45eb9c400143a3746296af16fcbfdea3249dec669580b751f0ae27be6`; 106,254 bytes. In `html_form_mcp_tool_test.cc:538–566`, `ParameterSchema_TextInput_Required` builds a form with a required control and expects the schema's required list to contain `text2`; line 550 says `String actual = ComputeInputSchema(*form_element);`. This is a Blink implementation unit-test source, not a proposal/spec and not a runtime pass result. It supports flipping the *lead* from unverified to a viable, correctly named test-source candidate if a future source row is warranted; it does not make the rejected `form_mcp_schema_unittest.cc` URL valid. No SOURCES change was made.

## Limits

No other queued rows were evaluated and no build/test suite was run. No LSP endpoint was mounted in the available tool set; no semantic definition/reference or caller claim is made. The source conclusions above are direct, line-anchored reading of the pinned test files and HTTP response.

## Isolation

- Production clone/branch/base/commit/changed paths: not applicable; no production files were created.
- Only direct LANE writes: this assigned report and `.ufo/waves/round-19/w2/SourceS090.body.gz`.
