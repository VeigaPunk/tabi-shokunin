# Round-19 source reopening: S086 and S094

Access date: 2026-10-21. The lane tip `refs/heads/master` was `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R).

## S086 — agree; keep queued, no scope expansion

**Exact registry URL:** https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md  
**Fetched pinned body:** https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md (same commit, access 2026-10-21).  
**Identity:** immutable commit `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`; decoded bytes 10,417; SHA-256 `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28`. This matches the S086 registry anchor and the round-19 lesson. Retained body: `.ufo/waves/round-19/w2/SourceS086.body.gz` (4,116 compressed bytes).

**Located quote (15 words):** “supplies the name of each \"property\" in the input schema generated for a declarative tool.” Source `declarative-api-explainer.md:62`; round-19 lesson `corpus/lessons/round-19.md:42` records the same quote and digest.

**Registry classification at R:** kind `docs`, tier `A`, status `queued`, opened `2026-10-21`, recheck `on-release`; scope is “Editors' proposal-level form-to-input-schema mapping and its open status; not normative spec semantics, Chromium build behavior, or runtime validation.” The SOURCES preamble says tier is scoped to the row's scope, not global. `used-by` is `—` (no knowledge-note path); the lesson separately records the W1 audit artifacts `w1/SrcDeclExplainer.md` and `w1/SrcDeclExplainer.gate.json`.

**Entailment:** the quote directly supports form-control `name` → input-schema property name. Source lines 65–67 explicitly map `toolparamdescription` to a property's description. The only concrete `required` evidence is the equivalence example (`required` array at line 81 and HTML `required` attributes at 91–92); it does not state a general required/validation algorithm. Lines 108–115 mark input/select schema synthesis as TODO/TBD and describe Chromium's loose implementation/trials as the proposal's status, not proof of shipped-build behavior. The response topic is under debate at line 119; related proposal details remain open at lines 202–213. Thus the row's limited proposal-level `teaches` claim is supported. Do not use S086 as normative spec semantics, Chromium 154 implementation evidence, or runtime-validation evidence.

## S094 — agree with rejection; no flip

**Exact URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT (access 2026-10-21). A fresh request returned HTTP 404. Its first-line quote is “NOT_FOUND: Requested entity was not found” (6 words; response line 1), matching the lesson's location/quote and the current registry rationale.

The retained round-19 error body decompresses to 233 bytes and independently hashes to the row/lesson digest `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. The fresh 404 body is also 233 decoded bytes, but hashes to `ea10c63ab75c31241647a3516738b093aec558bf917718fec0113fd6c7d8b495`; this is observed response-body drift, not an immutable-source digest. The unchanged 404 and first line support the rejection of this guessed filename. **Decision: agree; keep S094 rejected and do not flip it.** The `html_form_mcp_tool_test.cc` mention remains a lead, not an admitted/reopened source in this bounded check.

## Method and bounds

Read only the S086/S094 rows and their round-19 lesson entries, checked the pinned S086 body and the exact S094 endpoint, and reviewed PLAN.md's final revision section. No other queued source was evaluated or fetched. The `lsp` device is not mounted here (`xd://lsp` reported no such tool); grep only located row IDs, and findings above are based on direct row, lesson, and source-body reads. No tools were installed; no tests or runtime probes were run. SOURCES was not changed.

## Isolation

No production/source edits, runtime or mutation probe, clone, or Git write. Only direct lane writes: this seat-owned report and `.ufo/waves/round-19/w2/SourceS086.body.gz`.