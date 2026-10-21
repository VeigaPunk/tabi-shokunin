# Source S077 re-open at R

Access date: 2026-10-21. R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. I read only S077 and the specifically requested S094/flip evidence, plus the round-19 lesson and S077's used-by note. `corpus/SOURCES.md` was not changed.

## S077 — identity, quote, and row judgment

- **Exact URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
- **Immutable identity:** Gitiles tag JSON resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, matching R's row. Fetch returned HTTP 200; its 68,940-byte TEXT response decoded to 51,703 bytes / 1,440 lines. Decoded SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` — exact match to R's S077 anchor. Retained decoded body: `.ufo/waves/round-19/w2/SourceS077.body.gz` (9,100-byte gzip; decompression rechecked to the same 51,703-byte hash).
- **Round-19 lesson quote check:** `corpus/lessons/round-19.md:33` records the 10-word excerpt `""\" but there is no such parameter for the tool"}));"` at `form_mcp_schema.cc:219`. Re-fetched source line 219 contains the matching C++ error-template tail, `\" but there is no such parameter for the tool"}));`; its continuation starts at line 218. Quote location and decoded-body digest both match. The error text is assembled by the surrounding `StrCat` at lines 218–219.
- **R row fields (SOURCES.md:91):** kind `code`, tier **A**; scope: “Chromium 154 declarative form parameter coercion, per-control validation, error templates, and value/fill branches; not general JSON Schema conformance”; anchors `49-111, 208-490, 930-1093, 1238-1438`; opened `2026-10-21`, status **mined**, recheck **on-release**, used-by `corpus/knowledge/webmcp-declarative-validation-round-19.md`.

## Source-versus-teaches entailment

**Agree with S077's bounded teaching; high confidence.** Direct source reads establish:

- `FillData` rejects an unknown name with `kInvalidInputArguments` at 215–220, and validator failures with the same code at 221–230. The recorded error phrase is present at 219.
- `ValidateParameterData` dispatches by control type at 246–299; custom elements explicitly return true without validation at 289–291; file validation is feature-gated at 293–296.
- `FillData` validates every supplied entry before applying any value (two loops at 211–232 and 234–241). `FillParameterData` routes types to their corresponding fill routines at 451–488; text and number routines call `SetValue` at 933–959. Thus the row's per-control validation and fill-branch claims are source-supported. The wider anchors cover coercion helpers, validation routines, fill routines, and form/control classification.
- The narrow caveat “Source-level only” is correct: this file does not itself establish runtime outcomes or general JSON Schema conformance. Runtime claims need the separate probe/receipt evidence. S077's reference to S071's `FillData:216-219` is a subspan of S071's broader R anchor `FillData:208-243`, not a conflicting source location.

## S094 decision and flip

**Agree with rejecting S094 as the claimed source path; flip the discarded-test lead to the real test file.** The exact guessed path, `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT`, returned HTTP 404. Its first line is `NOT_FOUND: Requested entity was not found` (6 words). The current 233-byte body hashes to `8d57f35cebd2b4f4724f6a04bb48d553f291034b2e5669fde24a9d7b7f0a7b4e`, not the R row's `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. The previously retained 233-byte response at `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` matches the row hash; its Google RPC `request_id` differs from the current response, explaining this non-content-stable 404-body digest drift. Current body retained as `.ufo/waves/round-19/w2/SourceS077.s094-404.txt`.

The replacement lead `html_form_mcp_tool_test.cc` resolves HTTP 200 at the same tag: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc?format=TEXT. Decoded body: 106,254 bytes / 3,602 lines; SHA-256 `944ee9e45eb9c400143a3746296af16fcbfdea3249dec669580b751f0ae27be6`. At lines 396–416, `FillFormControls_UnknownParamFailure` supplies `"unknown": "UNKNOWN"` and expects `FillFormControls` to fail. This is a located test quote supporting a corrected test-source lead; it does not make the nonexistent S094 path valid. Test body retained as `.ufo/waves/round-19/w2/SourceS077.test-evidence.gz` (9,888-byte gzip).

## Method limits

No LSP device was mounted (`xd://lsp` returned “No such tool”); text search was used only to locate symbols/lines, and entailment above is based on directly read source excerpts. No caller trace, build, or test suite was run; the task was source-row verification, not an exported-contract change. No tools were installed.

## Isolation

No production files were created, so no clone, branch, or commit applies. No git write was performed. The only direct LANE writes are this requested report and the seat-owned retained artifacts: `.ufo/waves/round-19/w2/SourceS077.body.gz`, `SourceS077.test-evidence.gz`, and `SourceS077.s094-404.txt`.
