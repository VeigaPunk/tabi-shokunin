# SourceS081 — independent source reopening at R

## Finding

**Agree with S081's narrowly scoped teaching and tier A; no material source falsification found.** The lesson's quote, location, decoded hash, tag and commit all reproduce. Its two-word quote establishes only the no-selection sentinel; the broader setter/selection teaching is supported by the surrounding implementation and the caller/callback trace below, not by those two words alone. **Keep S081 queued, not mined.** Agree with S094's rejection; no flip is warranted by this reopening.

Axes: **depth** (definition/caller/effect trace), **provenance reproducibility** (exact bytes and locations), **scope/calibration** (implementation versus proposal/specification and source inference versus runtime observation).

Inspected checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). The lane's `refs/heads/master` resolved to R; the assigned rows and lesson gate were also extracted directly with `git show R:<path>`, so this finding is tied to committed bytes rather than assuming a clean working tree. Sources were accessed **2026-10-21**. No browser, runtime/mutation probe, test, build, linter, formatter or suite was run.

## Exact source and byte identity

1. **Exact S081 registry URL**, HTTP 200 at 08:40:35 UTC:
   <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc>
   - Returned Gitiles HTML, **862,146 bytes**, SHA-256 `ec71cc11901d804f4f80b35fe2a7bb205ee65358ad9f3e744d5c8a58251390c1`.
   - This is the rendered view, **not** the decoded-source representation hashed in the lesson.
2. **Exact lesson/gate fetch URL**, HTTP 200 at 08:40:34 UTC:
   <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc?format=TEXT>
   - Gitiles base64 response: **115,240 bytes**, SHA-256 `66510d2d177ab6202c233477b65d1192b7c59e5a658861652b7282c6a1a4363d`.
   - Base64-decoded C++ source: **86,429 bytes; 2,413 lines**; SHA-256 **`c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e`**. Exact match to `corpus/lessons/round-19.md:37` and `w1/SrcSelectFill.gate.json:9`.
3. **Immutable commit cross-check**, HTTP 200:
   <https://chromium.googlesource.com/chromium/src/+/b510e9d7cd3a2fbd78d0ddc42234103206c5f78d/third_party/blink/renderer/core/html/forms/html_select_element.cc?format=TEXT>
   - Both wire bytes and decoded bytes equal the tag fetch above.
   - <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON> independently returned commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (HTTP 200; 2,334 bytes; response SHA-256 `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`). **No immutable-source drift.**

Required retained decoded body: `.ufo/waves/round-19/w2/SourceS081.body.gz` — gzip **19,750 bytes**, gzip SHA-256 `c774a43e95ba975f38ec2320004c6473827180fde22ca3ececbbbcac7d873074`; decompressed identity is the 86,429-byte source above. Compression used gzip mtime 0; a different gzip container hash from wave 1 is not source drift.

## Located quote and registry cells

- **Lesson quote, verbatim:** `return -1;` — **2 whitespace-delimited words**, exactly decoded `html_select_element.cc:882`, inside `HTMLSelectElement::selectedIndex()`. URL: the exact `?format=TEXT` URL above; access **2026-10-21**; decoded SHA-256 `c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e`.
- **Observed context:** lines 871–880 return the first selected option's index; line 882 is reached when the loop finds no selected option. The quote is authentic and relevant but does not, alone, establish why a setter leaves no option selected.
- **Scope at `corpus/SOURCES.md:95`:** Chromium **154.0.8037.97 binding value setter and option-selection mechanics only**, with caller-side validation explicitly assigned to S071. Agree: the target is implementation code at the pinned version, not a WebMCP proposal/specification or cross-browser requirement.
- **Kind/tier:** `code` / **A**. Agree for those implementation mechanics; not independent proof of runtime/CDP behavior, general WebMCP conformance, or another Chromium build.
- **Anchor:** `291–347, 871–887, 1047–1108, 1162–1184, 180–210` at the recorded tag/commit. All are relevant to the claimed chain.
- **Status/opened/recheck/used-by:** **`queued` / `2026-10-21` / `on-release` / `—`** at R. These cells were read explicitly from the committed row. No mined-use path is declared. The lesson's opening-gate entry and `w1/SrcSelectFill.md` dossier document opening/provenance, not a new mined knowledge entry or runtime decision credit. Do not count S081, or other queued rows, as mined. No status or used-by change was made.

## Definition, caller and effect trace

**Navigation limitation:** `read xd://lsp` returned **“No such tool”**, with no LSP device in the mounted-device inventory. There was no available server/status endpoint to warm or retry. Literal searches located names; the findings below come from reading the exact pinned definitions/callers, **not** from treating grep as semantic reference proof. This is a relevant-path trace, not a claim to an exhaustive upstream reference graph.

### S081 target: observed implementation facts

| Symbol / exact source lines | Observed code behavior |
|---|---|
| `HTMLSelectElement::Value`, `html_select_element.cc:291–295`; `SelectedOption`, `822–829` | Getter returns the first selected option's value, otherwise the empty string. |
| `setValueForBinding`, `297–309` | Calls `SelectOptionByValue` with `send_events=false`; the function is void and has no unmatched-value error branch. |
| `SelectOptionByValue`, `311–325` | Starts with a null option, tests exact string equality, retains the first matching option and breaks, then delegates even if the option stayed null. |
| `SelectOptionByElement`, `327–347` | Its foreign-owner early return applies only to a non-null option. It supplies deselect-other and dirty flags to `SelectOption`; input/change dispatch is conditional on `send_events`. |
| `SelectOption`, `1047–1108` | Selects a non-null option; with the deselect flag calls `DeselectItemsWithoutValidation(element)` even when `element` is null. Calls the selection-type callback. |
| `DeselectItemsWithoutValidation`, `1162–1184` | For a single menu list, can deselect its cached selected option directly; otherwise clears owned options except the excluded element. A null exclusion preserves no selected option. |
| `selectedIndex`, `871–882` | Returns the first selected index or `-1` when none is selected. |
| `SelectMultipleOptions`, `180–210` | Separate multiple-selection API: snapshots and clears old selections, selects supplied valid list indices, updates validity/presentation, and dispatches input/change when the selected set changed. |
| `ResetToDefaultSelection`, `776–820` | A separate default-selection routine; not called directly by the scalar value-miss path above. |

### Exported binding and relevant callers: independently reopened dependencies

These files were opened only to resolve S081's binding/caller boundary; **no additional SOURCES row was mined or proposed**. All URLs below returned HTTP 200 on **2026-10-21**. Sizes and SHA-256 values are for the base64-decoded bodies.

| Dependency | Exact URL | Decoded bytes / SHA-256 |
|---|---|---|
| Public declarations | <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.h?format=TEXT> | 26,541 / `40c38fd1c38d4141169c358c2e22cc42480cbdc39afe708089657d35271c7c1c` |
| WebIDL binding | <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.idl?format=TEXT> | 3,120 / `2e401427943a64cacfc558eba3342e07a7cc6a562e3a405f664546632cce9f2c` |
| Selection callbacks | <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/select_type.cc?format=TEXT> | 84,599 / `a71377f80a013f79c9fea46a9b78018d507cf193a90487f70aaa4957fc962491` |
| Declarative caller boundary | <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT> | 51,703 / `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |

- Header `html_select_element.h:123–132` declares `Value`, `valueForBinding`, `setValueForBinding` and both selection helpers; `250` declares the multiple list-index API. IDL `51–52` exposes `selectedIndex` and maps `value` to `valueForBinding`. This is a concrete implementation declaration, not a proposal's desired semantics. Header/IDL filenames were discovered from the pinned forms-directory listing; the target C++ includes its header at line 30.
- `MenuListSelectType::DidSelectOption`, `select_type.cc:922–952`, updates cached option, presentation and validity, and gates input/change dispatch on its flag. `ListBoxSelectType::DidSelectOption`, `1598–1617`, updates anchors only for a non-null option and performs presentation/validity work. Neither of these callback bodies explicitly restores a default option for a null argument. This narrows the apparent default-selection caveat; it is not a live browser observation.
- `FormMCPSchema::FillData`, `form_mcp_schema.cc:208–243`, validates all supplied properties before applying them. `ValidateParameterData:274–276` dispatches select validation; `ValidateSelectData:390–427` checks option membership and rejects malformed/nonmember values (and duplicate requested values for multiple arrays).
- `FillParameterData:472–473` reaches `FillSelectData:1021–1054`. Single-select declarative fill directly calls `SelectOptionByValue` **with events enabled**; multiple-select fill builds indices and invokes `SelectMultipleOptions`. Neither is the scalar binding setter entry point.

**[INFERENCE — source-derived, high confidence]** For a stable select and the normal traced scalar binding path, an absent string match leaves a null option, deselects existing selection, and consequently makes `selectedIndex()` return `-1` (and `Value()` return the empty string). The row's “without a setter error” means the local unmatched-value path has no such rejection; it does **not** mean a declarative WebMCP call accepts an unknown value. That call has separate, earlier validation. A matching scalar selects the first exact option, including when the select is multiple; the separate multiple list-index API rebuilds the set. This is precisely the distinction retained by S081's scope/teaches cells.

## S094: rejection and flip

**Agree with rejection; do not flip now.** Exact attempted URL:

<https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT>

- Reopened **2026-10-21, 08:40:34 UTC**: **HTTP 404**, plain-text response **233 bytes**.
- Verbatim quote: `NOT_FOUND: Requested entity was not found` — **6 words**, response **line 1**; new response SHA-256 **`ef3b9f2917a84c7c9adcaabd9883044eb0fe9c3183771f826c408587c6bf79c0`**.
- The committed retained response at R decodes to **233 bytes**, SHA-256 **`9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`**, exactly the recorded lesson hash. Comparing the two bodies after replacing only the response's `request_id` field makes them byte-identical. Thus the observed error-response hash drift is attributable to a generated request ID, **not** evidence that the missing source file changed or that the original retained hash was false.
- Fresh 404 body retained at `.ufo/waves/round-19/w2/SourceS081.S094-response.txt.gz` (182 gzip bytes; gzip SHA-256 `e80ff4e726ad070f35e96525b18caad44305d089ca4bf0e9a07c49377bd74c65`).
- At R, S094 remains `code` / **C**, scope limited to this attempted path/tag, **rejected**, opened `2026-10-21`, recheck `on-release`, used-by `corpus/lessons/round-19.md` (the rejection gate at line 51). A missing-file response is not tier-A test evidence. This establishes failure of the exact attempted URL, not absence of all form/WebMCP tests.
- **Flip condition:** obtain a resolvable, version-pinned actual test source and a located ≤25-word quote **from that test file**, with decoded body/hash/access evidence supporting the intended test claim. A corrected filename would require a separately opened/corrected row under the append-only contract; it would not make this exact missing filename present. The lesson's `html_form_mcp_tool_test.cc` lead (`round-19.md:55–56`) was not reopened, promoted, or counted here. An implementation quote cannot stand in for a test-file quote.

## Remaining unknowns and limits

- No generated V8 binding binary, live Chromium page, CDP invocation, exception outcome or mutation race was exercised. Arbitrary event-handler/DOM mutations are outside the stable source-path inference; the declarative caller enables events whereas the scalar binding entry does not.
- No complete semantic reference graph was available without LSP. Relevant definitions, declared binding and direct declarative caller were read; literal search results are not represented as exhaustive semantic evidence.
- The two-word lesson quote is a weak standalone summary of the complete teaching. Retain the surrounding anchored chain when explaining the result; do not elevate this queued source into additional runtime-validated decisions or expansion credit.
- No other queued source row was audited/mined, no proposal/specification was treated as implementation, and no registry cell was changed.
- Tools installed/updated: **none**. No process was left running.

## Isolation

- Advisory source scout only; no runtime/mutation probe, sandbox clone, branch or production commit was needed or created.
- Clone: **none**. Branch: **none**. Production commit: **none**. Inspected checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; baseline B `66251bfc1aef393e4aec599e950a8deb867736bb` was not mutated.
- Only direct lane writes: `.ufo/waves/round-19/w2/SourceS081.md`, `SourceS081.body.gz`, `SourceS081.html_select_element.h.gz`, `SourceS081.html_select_element.idl.gz`, `SourceS081.select_type.cc.gz`, `SourceS081.form_mcp_schema.cc.gz`, `SourceS081.S094-response.txt.gz` (all artifacts in that same directory).
- No SOURCES, production source, sibling report/lane, fleet state, domain source tree or git reference was written. No git write operation was run in LANE or elsewhere.
