# S074: feature declarations as lifecycle-experiment context

**Source opened:** Chromium `154.0.8037.97`, `third_party/blink/renderer/platform/runtime_enabled_features.json5`, lines 7023–7050; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 — accessed 2026-10-21. Decoded SHA-256 observed: `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` (matches S074).

**Located source text (five words total):** L7023 `name: "WebMCP",`; L7033 `"WebMCPTesting"`; L7035 `status: "experimental",`.

**Observed:** The WebMCP declaration lists `WebMCPTesting` in its `implied_by` array and marks WebMCP `experimental`. The exact flag spelling `DeclarativeWebmcp` has no match in the full opened file (case-insensitive search); the file does contain the differently named `WebMCPDeclarativeFileInput` at L7038. These are facts about this pinned declaration file only.

**Round-21 constraint:** Use S074 only as build-pinned declaration context for the fixed 12 finite loopback cases under the specified flags. It supplies no per-case expected response, submit, navigation, or status, and does not establish that a flag was accepted or had an effect. Preserve the receipt's raw case observations; a pending result remains only “no matching response within the named finite interval,” not evidence of feature disablement. S074 also cannot characterize any submission as human-only.

**Unsupported overclaim:** “`DeclarativeWebmcp` is inert/ignored at runtime because it is absent from this JSON5.” The absence establishes only that this file has no exact matching token; it does not establish the token's command-line effect or the runtime availability of declarative tools. Those questions are not answered by S074 and must not be converted into expected outcomes for the 12 scenarios.

**Confidence / remaining unknowns:** High for the pinned-file contents and digest. Whether the experiment's flags take effect, and the actual outcomes of each lifecycle scenario, remain runtime questions for the retained round-21 evidence, not this source.