# SourceS093 — round-19 checkpoint falsification

## Verdict and axes

**AGREE with S093 as tier A, implementation-source evidence, still `queued`; no promotion to `mined`. AGREE with S094's exact-path HTTP404 rejection; no flip.** The immutable implementation/header hashes and S093's located lesson quote reproduce. The S094 error-response hash changes only because its request ID changes, not because the file becomes available.

Axes: fetch/byte provenance; quote-location fidelity; source-to-teaches entailment; registry status/consumer accuracy; implementation-versus-spec/runtime calibration. Access date for all fresh requests: **2026-10-21**.

## Checkpoint and bounded scope

- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- The initial read-only identity commands observed `refs/heads/master = R`. `corpus/SOURCES.md` at R and the working file both had Git blob `77aaede0098f251f289461f23fcf66f52b42bcf1`; `corpus/lessons/round-19.md` both had blob `e76dfde1f6e9e79f510fabd1ea88ee2e6d6fe31e`.
- Audited only registry row **S093** (`corpus/SOURCES.md:107`), its lesson entry (`corpus/lessons/round-19.md:49`), its linked header, and the expressly requested **S094** rejection (`corpus/SOURCES.md:108`; lesson `:51`). No other queued row was promoted or independently reopened as a source audit.
- Read the final PLAN revision at `.ufo/waves/round-19/PLAN.md:139-156`. This is a source audit, not a runtime validation decision or C1 reproduction.

## Exact fresh fetches and retained bytes

Gitiles `format=TEXT` success bodies are base64 carriers. Sizes/hashes below are of the **decoded source**, not HTML, the carrier, or gzip. All requests resolved to their requested URL without a URL change.

| Key | Exact URL | HTTP | Carrier bytes | Decoded/body bytes | SHA-256 of decoded/body bytes | Retained artifact (LANE-relative) |
|---|---|---:|---:|---:|---|---|
| S093 implementation | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 200 | 68,940 | 51,703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `.ufo/waves/round-19/w2/SourceS093.body.gz` |
| S093 header | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.h?format=TEXT | 200 | 12,324 | 9,243 | `e44593c07b6048aec70404aa000e354157f38838d6065984de684629159340f7` | `.ufo/waves/round-19/w2/SourceS093.header.body.gz` |
| S094 attempted path | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT | 404 | 233 | 233 | `6210024a3890f3df48b71376516221f072c2e9997e19493fe71c67a33b381d60` | `.ufo/waves/round-19/w2/SourceS093.rejection.body.gz` |
| Tag identity, supporting metadata | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON | 200 | 2,334 | 2,334 | `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264` | `.ufo/waves/round-19/w2/SourceS093.tag.body.gz` |

The tag metadata's `commit` field is `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, exactly the S093 anchor. The implementation has 1,440 lines; the header has 205. The implementation hash matches both SOURCES and the lesson; the header hash matches `w1/SrcFormSchemaBuild.md:12`. **No immutable-source drift observed.** Gzip metadata is deterministic (`mtime=0`); gzip sizes are respectively 9,062 / 2,141 / 182 / 1,085 bytes.

## Located quotes

Each quotation is at most 25 whitespace-separated words. URLs, date, and decoded hashes are the corresponding entries in the fresh-fetch table above.

| Source | Exact quotation | Words | Exact location | Finding |
|---|---|---:|---|---|
| S093 implementation | “Dates MUST be provided in 'YYYY-MM-DD' format.” | 7 | `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:583`, inside `FormMCPSchema::ComputeDateParameterSchema`, passed to `AddDescription` | **Exact match**, one occurrence; agrees with lesson `:49` and `w1/SrcFormSchemaBuild.gate.json:6-9`. |
| S093 header | “all form control states are left unchanged.” | 7 | `third_party/blink/renderer/core/html/forms/form_mcp_schema.h:49`, `FillData` error-contract comment | Present; a distinct fill-contract comment, not evidence that every schema keyword is enforced. |
| S094 response | “NOT_FOUND: Requested entity was not found” | 6 | Fresh 404 response, first line | Exact match to the lesson's located rejection quote. |

The S093 lesson quote is an **emitted description string** in implementation code. Its capitalized MUST is not itself a W3C normative requirement, a general JSON Schema enforcement guarantee, or a fresh browser rejection observation. The adjacent date builder emits string type and date format (`.cc:578-584`), and explicitly does not emit date minimum/maximum (`:580-581`). The single quote alone would not establish the entire teaches cell; the definition/caller and branch reads below provide that wider source evidence.

## Source-to-teaches entailment

**Observed source text**, with all `.cc`/`.h` anchors referring to the exact fresh bodies above:

| S093 teaches component | Definition/call evidence | Assessment |
|---|---|---|
| Form-derived supported groups produce properties and required metadata | Constructor calls `ProcessForm` (`.cc:117-119`); `ComputeJSON` starts an object, iterates ordered names, calls the named builder, emits a property only on a non-null result, adds names flagged required, then emits properties and required (`:121-151`). Name lookup dispatches through `ComputeParameterSchemaForControls` (`:542-553`). | Supported, including omission of unsupported groups. |
| Listed control-type mappings are implemented | Dispatch has text, date, datetime-local, month, week, time, number, select, range, checkbox, radio, color, custom-element and feature-gated file branches (`:491-539`). Actual builders are `:556-928`; classifiers are `:1270-1438`. Ordinary types generally require a single control; homogeneous checkbox/radio groups admit multiple members (`:1366-1438`). | Supported for this tag and applicable feature gates; not universal browser support. |
| Types and constraints are build-scoped and branch-specific | Text emits string/pattern/description/required (`:556-569`); date/time-related branches emit string/format metadata (`:571-701`); number/range emit numeric bounds and emit multipleOf only for an aligned step base (`:703-731,773-795`). Single checkbox is boolean; grouped checkboxes are unique arrays; radio is string (`:798-851`). Custom schema is parsed from ElementInternals and required is false (`:893-906`); file schema depends on its runtime feature (`:909-928,1357-1363`). | Supported as construction, not a claim that invoking a tool runs an arbitrary JSON Schema validator. |
| Description/required logic | `AddDescription` appends extra context and writes only a nonempty description (`:1095-1108`). Single-control priority is toolparamdescription, label text, then aria-description; groups use the nearest common-ancestor fieldset's toolparamdescription (`:1147-1210`). Labels concatenate with semicolons (`:1219-1235`). Required is set by each builder; checkbox/radio helper accumulates member required state (`:854-872`). | Supported; do not collapse differing per-control logic into a blanket rule. |
| anyOf, not generated oneOf | Built-in choice builders set literal anyOf at `:756,762,827,847` and emit enum alongside it. Select choices use option values as const and textContent as title (`:741-749`); checkbox/radio helper uses values and optional label titles (`:854-872`). Header describes the anyOf helper (`.h:105-121`). Literal search finds four anyOf keys and zero oneOf keys in the complete implementation. | Agree with the row's careful **generated** wording. Internal variable names `one_of` do not change the emitted key. A caller-supplied custom-element schema is passed through (`.cc:893-906`) and can contain its own keywords; absence of generated oneOf must not be generalized to all returned custom schemas. |
| Empty-name behavior differs by element kind | `ProcessForm` skips disabled/read-only form controls but adds remaining controls without an empty-name guard (`:1238-1249`). Its ElementInternals branch adds only nonempty names (`:1250-1255`). Missing-name diagnostics do not delete ordinary controls (`:154-181`); property assembly uses the stored name (`:133-149`). | Supported. An ordinary empty-name property remains possible when its group has a supported builder; the issue report is not an exclusion rule. |

### Exported contract and literal caller trace

- `.h:31,38-50` declares the exported `FormMCPSchema` class and public constructor, `ComputeJSON`, and `FillData`; `.cc:117-151,491-585` supplies the construction definitions and direct intra-file call chain.
- For the caller only, searched the **already retained**, tag-scoped supporting source `corpus/evidence/round-19/sources/html_form_element.cc.gz:html_form_element.cc` for `FormMCPSchema`, `ComputeJSON`, and `ComputeInputSchema`, then read only the matching sections. `HTMLFormElement::HTMLFormMcpTool::ComputeInputSchema` constructs `FormMCPSchema`, calls `ComputeJSON`, and serializes the result (`html_form_element.cc:277-283`). The form's registration/update path calls `ComputeInputSchema` at `:431` and `:460`, and registers the declarative tool at `:462`. This is supporting caller evidence, **not** a new fetch, row admission, or independent S078 audit.
- **LSP unavailable:** `read xd://lsp` returned `No such tool: xd://lsp` and a mounted-device list without lsp. There was no answering server or indexing state to warm/retry. Searches and source reads above are a literal fallback, **not semantic reference/implementation proof** or an exhaustive call-graph claim.

## Registry disposition at R

| Field | S093 | S094 |
|---|---|---|
| Kind/tier | `code` / `A`: agrees for tag-pinned primary implementation and header, only within the stated construction scope. | `code` / `C`: agrees as a rejected attempted code-source path; the HTTP error supplies no implementation authority. |
| Scope/anchor | Chromium `154.0.8037.97` form-derived input-schema construction only; tag commit, line ranges, and implementation SHA reproduce. | Only the attempted forms-directory filename at this tag; HTTP404 and first-line quote reproduce. No claim that Chromium has no schema tests anywhere. |
| Status/opened/recheck | `queued` / `2026-10-21` / `on-release`: agrees. Fresh opening and the lesson's provenance citation do not imply mining/admission. | `rejected` / `2026-10-21` / `on-release`: agrees. |
| used-by | `—`: deliberately no admitted consumer path, not a missing-file error. Literal S093 search in SKILL, corpus/knowledge, and round-19 validation evidence found no ID citation; the lesson separately records opening. | `corpus/lessons/round-19.md`: exists at R and cites the exact rejected row, URL, first-line quote and historical response SHA at `:51`; status explanation is at `:53-56`. |
| Flip | No recommended status/tier change. Keep queued unless a properly admitted, cited consumer is added by the integrator. | **Flip condition not met.** A resolvable test source with a located quote from that test source is required, with URL/scope/provenance adjusted to the actual file. A quote from `form_mcp_schema.cc` does not qualify a different test file. The alternate test filename in the lesson remains a lead for this audit, not newly mined evidence. |

### S094 dynamic-response drift

Historical retained response `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz:form_mcp_schema_unittest-404.txt` contains request ID `ae2958d1612f4cf1a1b6caf7c52fd969`; the fresh response contains `be425e4133984f0eb1ccc6040cf15b43`. Both are 233-byte NOT_FOUND responses. Substituting only the historical ID into the fresh body yields SHA-256 `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`, **exactly** the lesson/registry historical SHA. Thus this response-body drift is fully accounted for by request metadata; it is not immutable-source drift or evidence for flipping the rejection. Preserve the historical hash as historical and record the fresh hash separately.

## Confidence, limits, and exercised work

- **High confidence**: two successful exact S093 source fetches; decoded hash/size and tag binding; exact seven-word quote at line 583; construction entailment within the inspected source; exact-path S094 404/rejection and request-ID-only hash drift.
- **Unresolved/not claimed**: exhaustive semantic callers (no LSP); external custom-schema contents; real browser behavior, validation enforcement, runtime feature availability, other builds/sites/clients; fresh alternate-test-file evidence. S093 is **implementation**, not a proposal/spec. Other queued sources stay unmined.
- Executed only read-only checkpoint identity commands, bounded source searches/reads, four concurrent HTTP fetches, base64 decode, hashing/counting and retained-body compression. No browser/process probe, mutation probe, build, lint or test suite; no clone or commit needed for this source-only assignment. No tools installed or updated; no service/profile/host mutation, background jobs or delegated agents.
- Production files and SOURCES were not edited. Only the requested report and seat-owned body artifacts were written under LANE.

## Isolation

- Clone path: none — source-only, report/evidence-artifact task; no runtime or mutation probe.
- Branch: none.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`; attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Commit: none — no production changes or git writes.
- Changed paths: `.ufo/waves/round-19/w2/SourceS093.md`, `.ufo/waves/round-19/w2/SourceS093.body.gz`, `.ufo/waves/round-19/w2/SourceS093.header.body.gz`, `.ufo/waves/round-19/w2/SourceS093.rejection.body.gz`, `.ufo/waves/round-19/w2/SourceS093.tag.body.gz`.
