# SourceS085 — round-19 source falsification

## Finding

**AGREE with S085 at attacked checkpoint `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R): official documentation, scoped Tier A, queued, not mined.** The lesson's ten-word quote is exact at its recorded line and section. The original retained body's decoded SHA matches the registry and lesson. A fresh fetch has whole-response byte drift, but its complete article is byte-identical to the original; the changes are outside the article. Nothing here establishes Chromium 154 runtime validation behavior.

**AGREE with S094's rejection; no flip is warranted.** Its exact tagged URL still returns HTTP 404. The rejection-body SHA changes only because its request ID changes. A missing guessed filename does not establish absence of tests generally.

Confidence: **high** for fetch identity, located quote, documentation entailment and status boundaries. No implementation or runtime conclusion was inferred from this documentation.

## Scope, method and checkpoint

- Axes: exact-byte provenance; quote/location fidelity; scope/authority calibration; source-to-teaches entailment; reproducibility.
- Reopened only S085, plus the explicitly requested S094 rejection check. No other queued row was mined or promoted.
- Read the PLAN including its final revision at lines 139–156. In particular, retained source identity is separate from runtime decision evidence.
- Lane master resolved to R. `corpus/SOURCES.md` at R and on disk both had Git blob `77aaede0098f251f289461f23fcf66f52b42bcf1`; `corpus/lessons/round-19.md` both had blob `e76dfde1f6e9e79f510fabd1ea88ee2e6d6fe31e`. Thus the cited row/lesson text was the attacked checkpoint, not an uncommitted replacement.
- Original compressed bodies were also read directly from R with read-only `git show`; their decompressed hashes were computed, rather than trusting the dossier's declarations.
- The two exact URLs were fetched concurrently with Python standard-library HTTP requests, `Accept-Encoding: identity`, and no credentials. Both responses reported identity content encoding. No browser, CDP session, runtime/mutation probe, build, linter or test suite was launched.
- Mounted `xd://` inventory exposed no `lsp` device/server route. Literal searches located Markdown cross-references only; they are not semantic proof of implementation definitions or callers. No exported source-code contract was changed or adjudicated here.
- No tools were installed or updated.

## S085 — source identity and located quotation

- Exact requested and final URL: <https://developer.chrome.com/docs/ai/webmcp/declarative-api>.
- Access date: **2026-10-21**, fresh response obtained at **08:41:27.882327 UTC**.
- HTTP status: **200**; content type: `text/html; charset=utf-8`; no redirect to another source.
- The page identifies publication as May 18, 2026 and its last update as September 25, 2026. It is rolling Chrome documentation, not an immutable Chromium tag or normative specification.
- Lesson quotation: **“Map elements to a property description within the JSON Schema.”** — **10 words**.
- Exact locator: [§(Optional) Tool parameters](https://developer.chrome.com/docs/ai/webmcp/declarative-api#optional_tool_parameters), decoded HTML **line 4333**, in the `toolparamdescription` list item. The heading is at line 4328. The quotation appears at line 4333 in both the original and fresh body.
- Local claim under review: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-19.md:41`; matching source gate: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SrcChromeDeclDocs.gate.json:3-10`.

| Body identity | Decoded bytes | Decoded SHA-256 |
|---|---:|---|
| Original retained body at R | 153,277 | `cc00b2e92a1ec0ac24d2a20c118b88e2f9209f7ad092f6521767a2039304cafb` |
| Fresh response retained by this seat | 153,281 | `eb620db0f685a5c94f6f9df17a1710bdf3e9886bee12e46b987e0f838433b544` |

Original retained artifact: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SrcChromeDeclDocs.body.gz`.

Required fresh retained artifact: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/SourceS085.body.gz`; deterministic gzip, 20,067 compressed bytes, compressed SHA-256 `62f1e329c51694fbd193c0eea2a64a98b965ed373f103b3a302a1f4471badd7f`. Decode the gzip before checking the response-body hash above.

### Observed drift, not a quote failure

Both decoded responses contain 5,013 lines. Only **lines 5002 and 5007** differ: the script nonce, and the site application-loader configuration/feature flags. The fresh response is four bytes longer. The entire `<article>…</article>` region, fresh lines **3906–4554**, is identical in both captures: **33,270 bytes**, SHA-256 `b229bfffdb2cd5b798ad6242debe6f896ace91c2dfc5ba08dac487f32488f20e`.

Consequently the original whole-body digest is authentic for the retained original capture but does not reproduce against this fresh rolling response. This is an observed byte mismatch, not an immutable-source integrity failure or documentation-content change. Do not overwrite the original capture's digest with the fresh digest as though they described one body.

## S085 — row cells and source-vs-teaches entailment

The row is at `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md:99`. All line locators below refer to the fresh decoded HTML; the article is identical in the original capture.

| Row element / teaching atom | Observed support | Assessment |
|---|---|---|
| Source and kind `docs` | Exact official Chrome documentation URL returns the declarative API article. | **Agree.** Documentation, not implementation code or an editors' proposal. |
| Tier `A` | First-party Chrome explanation of its own documented form attributes and submission API. | **Agree only within the stated documentation scope.** Tier does not turn this into a Chromium-154 conformance guarantee or normative standard. |
| Scope excludes build-specific invocation validation | Page documents annotations, one generated schema, and submit handling; it provides no build-pinned validator/error matrix. | **Agree.** Exact per-control rejections, CDP statuses and error text require separate implementation/runtime evidence. |
| `toolname` / `tooldescription` registration | §Tool registration, heading line 4310, attribute descriptions lines 4315–4316; removal/unregistration statement line 4326. | **Entailed as documented API behavior.** |
| `toolparamdescription`, label and aria fallback | §(Optional) Tool parameters, line 4333 gives the property-description role, associated-label fallback excluding labelable descendants, then `aria-description` when no label exists. | **Entailed.** The lesson's short quote proves the description mapping; the rest of that same paragraph supports the separately stated fallback. |
| One generated schema example | Example form and generated JSON at lines 4336–4404; generated-schema introduction line 4357. Shows text fields and the required select's enum/const/title/description metadata. | **Entailed as an example only.** Not a complete control-to-schema algorithm and not proof that every schema constraint is enforced at invocation. |
| `toolautosubmit` | §Submit the form, heading line 4405; manual-submit alternative and autosubmit/navigation wording lines 4410–4412. | **Entailed as documented flow.** Not independently runtime-tested here. |
| App-authored submit response | `agentInvoked` at line 4415; `respondWith`, serialization and prior `preventDefault` at lines 4417–4421. Sample's page-defined validation branch at lines 4429–4433. | **Entailed.** The custom validation function/promise is application code, not a standardized browser rejection payload. |
| No general runtime schema-validation/error contract | The complete article and sample do not define a general validator algorithm, required rejection statuses or standardized validation-error shape. | **Agree within this page.** This is not a claim that other Chrome sources contain no such contract. |
| Anchor / opened / recheck | Last-update date remains 2026-09-25; recorded sections and quote exist; accessed again on 2026-10-21. Row says `on-release`. | **Agree with the captured anchor/date.** Rolling responses can drift independently of a browser release, as observed here. |
| Status `queued`; used-by `—` | Lesson lines 53–54 explicitly leave the remaining opened sources queued. Literal search found no S085 or exact-URL reference in `corpus/knowledge`, `SKILL.md`, or round-19 validation evidence. | **Agree.** An opening/quotation ledger is not mining into knowledge. Do not promote this row or count it as an additional runtime validation decision. |

The source's stated experimental posture is also visible: the article links an origin trial/Intent to Experiment and warns of future changes (§Engage and share feedback, line 4483). That does not make this page an implementation artifact. Its documented API claims remain distinct from a proposal's intended semantics and from observed Chromium behavior.

## S094 — rejection, retained error body and flip condition

- Exact requested and final URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT>.
- Access date: **2026-10-21**, fresh response obtained at **08:41:27.903509 UTC**.
- HTTP status: **404**; content type: `text/plain; charset=utf-8`; **233 decoded bytes**.
- Located quote: **“NOT_FOUND: Requested entity was not found”** — **6 words**, error-response **line 1**.
- Local registry/lesson anchors: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md:108`; `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-19.md:51,54-56`.

| Body identity | Decoded SHA-256 |
|---|---|
| Original rejection capture at R, 233 bytes | `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` |
| Fresh rejection capture, 233 bytes | `a2002d452852d71ea5e9f8369fd9520770c8ff51a6f1ca5827f0783f2bea024e` |

The only changed line is **line 7, `request_id`**. The status and located rejection quote are unchanged. The error body is request-specific, even though the attempted source URL contains a Chromium tag; do not describe this response as immutable source code.

Original rejection artifact: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz`.

Fresh rejection artifact retained for reproducibility: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/SourceS085.S094.body.gz`; 183 compressed bytes, compressed SHA-256 `8e20ca940b7a0aa60dcbea69c7a4c1647db57154491013619473972ef6419862`.

**Decision:** retain `rejected`, Tier C, attempted-path-only scope. Its used-by path `corpus/lessons/round-19.md` resolves to the rejection record, not admitted test evidence. **Flip condition:** a resolvable tagged test-file body with an exact located quotation from that test file and a decoded body identity. A different filename must be identified as different evidence; a quote from `form_mcp_schema.cc` cannot establish what a test file asserts. The lesson already preserves that distinction at lines 55–56. No alternative file was fetched or mined in this assignment, and the exact rejected URL did not meet the flip condition.

## Remaining unknowns and limits

- No Chromium implementation, CDP outcome or runtime validation guarantee is established by S085. The row correctly excludes that scope.
- Future rolling-page content may change; the fresh retained response and article comparison bind only this access.
- This S094 re-fetch establishes the current failure of the exact tagged path, not an exhaustive test inventory or the validity of the alternative-file lead.
- No SOURCES status, used-by field, knowledge entry, lesson or production file was modified.

## Isolation

- Clone path: **N/A — read-only source scout; no runtime/mutation probe or production file.**
- Branch: **N/A**; commit: **N/A — no Git write or clone commit**.
- Baseline context: `66251bfc1aef393e4aec599e950a8deb867736bb`; inspected checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Changed paths, all explicitly permitted seat-owned report/artifacts under LANE: `.ufo/waves/round-19/w2/SourceS085.md`, `.ufo/waves/round-19/w2/SourceS085.body.gz`, `.ufo/waves/round-19/w2/SourceS085.S094.body.gz`.
