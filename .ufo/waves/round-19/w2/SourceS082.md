# SourceS082 — round-19 source falsification

## Result and axes

**Agree with S082 as `spec`, tier A within its declared scope, and `mined`.** The lesson's exact nine-word quote and decoded-body SHA reproduce. **Agree with keeping S094 rejected; no flip is warranted.** Three S082 decision citations are narrower than the complete published answers, and the recheck metadata is inconsistent; these are source-binding/curation findings, not observed browser failures.

Axes: retrieval fidelity; located-quote fidelity; source-to-teaches entailment; scoped authority/status/consumer binding; writer isolation. Confidence: high for the byte/quote/metadata observations below. No round-level judgment or runtime verdict is made.

Inspected checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). Read-only `git show R:<path>` anchored the findings. The inspected SOURCES, lesson, knowledge note, decisions manifest and SKILL bytes also matched R in the lane. PLAN's final contract revision at lines 139–156 was read. Only S082 and the explicitly requested S094 rejection were fetched; other queued rows were not reopened or mined.

## Retrieval and exact quote — observed

Access date for both requests: **2026-10-21**. Requests accepted identity content encoding; hashes below are over the decoded response body, not rendered reader text or gzip bytes.

| Item | S082 |
|---|---|
| Exact requested/final URL | https://html.spec.whatwg.org/multipage/input.html |
| HTTP result | 200; no redirect |
| Decoded body | 687,515 bytes; 6,012 physical HTML lines |
| Decoded SHA-256 | `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` |
| Drift from row, lesson and R's retained source | None: fresh bytes equal the decompressed `corpus/evidence/round-19/sources/input.html.gz` at R |
| Page identity | Physical line 16 says Living Standard, last updated 20 October 2026; HTTP Last-Modified is `Tue, 20 Oct 2026 12:58:32 GMT` |
| Retained fresh body | `.ufo/waves/round-19/w2/SourceS082.body.gz` |
| Retained gzip | 79,833 bytes; SHA-256 `dd22428502e48a80a9f042b0a18e8a13b5dd01c4b88272feb109ad6d0f3708ae` |

The lesson at `corpus/lessons/round-19.md:38` quotes exactly:

> `number</a>, then set it to the empty string instead.`

**Nine whitespace-delimited words**, found on fresh decoded HTML line **3229**, under [§4.10.5.1.12 Number state](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)), value-sanitization algorithm. The conditional begins on line 3228 and continues across the HTML link boundary. The quote is a literal HTML fragment, as disclosed by the lesson, not a complete rendered sentence. Access: 2026-10-21; decoded SHA-256: `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`.

This is a rolling Living Standard URL, not an immutable deployment-commit URL. The row correctly says that the previously observed `whatwg/html` HEAD was **not** verified as the deployed page's build. I did not reopen that repository HEAD or infer build provenance from it. Exact retained bytes, rather than that unverified commit association, establish this retrieval's identity.

## S082 scope, authority, status and teaches

Registry location: `corpus/SOURCES.md:96` at R. The tier contract in `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:26–40` makes tier A scope-specific and `mined` mean cited by at least one `used-by` path.

- **Kind/tier: agree.** WHATWG's own normative input-element algorithms are primary authority for the declared HTML value-sanitization scope. This is a Living Standard, not a WebMCP proposal/explainer and not evidence that Chromium 154 implements every requirement.
- **Scope: agree for the listed input types.** The row expressly excludes Chromium implementation and runtime validation evidence. The fresh source entails the stated sanitizer behavior; it does not establish WebMCP filling, error classification, submission or CDP status.
- **Anchor: agree.** The cited §§4.10.5.1.4–.5, .7, .10–.14 and 4.10.5.4 contain the relevant algorithms, and the captured date/body hash reproduce.
- **Opened/status/used-by: agree.** `opened=2026-10-21`, `status=mined`; `corpus/knowledge/webmcp-declarative-validation-round-19.md` exists at R and cites S082 explicitly at line 4, with substantive uses at lines 50–57 and 64–65. The lesson additionally records the opening at line 38.
- **Recheck: inconsistency, not a source rejection.** The row says `on-release`, while the knowledge note at line 9 separately says S082/S083 Living Standard `180d` and also includes them in `S077–S083 on-release (tag-pinned)`. S082 is not tag-pinned. A single explicit cadence for the rolling standard should be reconciled by the integrator; no SOURCES change was made.

The row's `teaches` is supported by these directly inspected portions of the same fresh [input.html](https://html.spec.whatwg.org/multipage/input.html), accessed 2026-10-21, decoded SHA-256 `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`:

| Teaching | Decoded physical lines | Entailment and boundary |
|---|---|---|
| `.value` setter invokes the current type's defined sanitizer | 5631–5634, §4.10.5.4 | New value, dirty flag, then sanitizer; supports standards semantics, not a Chromium call-path assertion. |
| Invalid date/time/number become empty | Date 2427–2428; time 2903–2904; number 3228–3229 | Directly supported. Local datetime 3059–3061 additionally normalizes valid values and empties invalid ones. |
| Invalid range value uses min/max-derived default | 3391–3398, §4.10.5.1.13 | Directly supported; defaults 0/100 are at 3501–3504. Underflow/overflow and step adjustment are separate rules at 3404–3420. |
| Color parse failure becomes opaque black, then is serialized | 3662–3678, §4.10.5.1.14 | Directly supported. Exact string representation depends on serialization and attributes at 3682–3705. |
| URL/email whitespace normalization; multiple email token canonicalization | URL 1964–1966; email 2113–2115, 2166–2173 | Supported. These sanitizer branches are not validity checks: malformed nonempty strings can survive and be type-mismatched separately. |

## Publication/source binding findings — observed versus inference

The publication chain is `SOURCES.md:96` → the knowledge note's `source:` at line 4 and explanations → `SKILL.md:2082–2084` / `validation/decisions.json` DV-23, DV-24, DV-25. All three decision records name the correct retained body SHA and contain their declared token inside the declared line interval. **Token presence alone is weaker than full-answer entailment.**

1. **DV-23: step outcome lies beyond its bound interval.** `decisions.json:574–598` and `SKILL.md:2082` bind lines 3391–3412 but publish both the max clamp and nonnumeric value becoming `6` after midpoint/step snapping. That interval supplies the invalid-number default, midpoint formula and overflow clamp; it stops before step mismatch rounding/tie-to-positive-infinity at **3415–3420**. The R fixture `validation/fixtures/range-color.html:6` has `min=0`, `max=10`, `step=2`. **[INFERENCE]** Applying the full standard yields midpoint 5, equal candidates 4/6, then 6; the narrower interval cannot explain that last decision. This is an incomplete located-source binding, not an independently observed wrong browser result.
2. **DV-24: parse/fallback is located, exact serialization is not fully located.** `decisions.json:600–625` and `SKILL.md:2083` bind 3667–3678. Those lines parse a CSS color, replace failure with opaque black, and delegate serialization. The published exact `#ff0000` / `#000000` spellings also depend on serialization at **3682–3705**, with the no-alpha / Limited-sRGB branches. The R fixture at `range-color.html:7` supplies neither `alpha` nor `colorspace`. The source supports the row's carefully qualified opaque-black **serialization** teaching; the decision's shorter interval does not independently establish every exact spelling or WebMCP Completed status.
3. **DV-25: input rule does not entail the textarea half, and text is outside S082's enumerated scope.** `decisions.json:627–650` and `SKILL.md:2084` bind only **1762–1763**, the Text/Search input sanitizer, while the answer combines single-line input stripping with textarea CRLF→LF normalization. Those two source lines expressly concern input Text/Search and do not state textarea semantics. The R fixture `textarea-empty.html:6–7` has both a textarea and a text input. S082's scope cell enumerates number/range/date/time/datetime-local/email/url/color, not text or textarea; its cited subsection list also omits the text subsection. Thus this is both a partial decision-source binding and a use beyond the row's stated tier-A scope. The source's input rule is real; it must not be silently treated as textarea authority. No additional source/queued row was opened to repair it.

The knowledge note and SKILL explicitly frame the concrete results as build-scoped measurements backed by own-work receipt/cases, not solely by S082. I did **not** rerun or independently verify that receipt. These findings therefore distinguish missing/narrow explanatory source support from falsification of the recorded runtime outcomes.

## S094 rejection and flip

- **Exact requested/final URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT
- **Access:** 2026-10-21; **HTTP 404**, no redirect; decoded response **233 bytes**.
- **Fresh decoded SHA-256:** `2ec29cf040a86c67f1c056c3aaf91fdd77238b974a3c1c51edb2c97fb3defd4e`.
- **Located quote:** `NOT_FOUND: Requested entity was not found` — **six words**, response line 1; URL and access above; decoded SHA as above.
- **Hash comparison:** R's retained `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` decodes to 233 bytes and the recorded `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. The complete fresh-versus-retained diff changes **only** the `request_id` value on response line 7. This is observed error-envelope variation, not evidence of an immutable source-file change.
- **Agree with rejection:** the exact attempted tag/path still does not resolve; the response is not test-code evidence. Tier C/lead-only and `rejected` at `SOURCES.md:108` are appropriate; `used-by=corpus/lessons/round-19.md` resolves and line 51 records the rejected opening.
- **Flip condition:** a resolvable primary test source with a genuine located quote would justify admitting that test source. The alternate `html_form_mcp_tool_test.cc` filename is merely a lead recorded in the row/lesson and was not fetched here. A different filename cannot silently turn this still-404 exact URL into a mined source; it requires its own correctly anchored source record. **No flip now.**

## Method, limits and remaining unknowns

Search preceded reading. Literal registry/reference search located the relevant sections; checkpoint content was inspected with read-only Git access. `xd://lsp` returned **No such tool**, with no LSP device among mounted tools, so there was no available server to warm up or retry. HTML normative algorithms and Markdown/JSON publication links were traced by direct source inspection and literal fallback, not represented as LSP-semantic proof. No implementation symbol/caller conclusion is claimed.

Remaining unknowns: deployed WHATWG build commit; independent Chromium runtime reproduction; a correctly opened/quoted test-source alternative for S094; textarea authority outside this S082-only source opening. None prevents the observed quote/hash/status findings. No builds, lint, test suites, browser launch or mutation probes were run. No tools were installed or updated.

## Follow-up — exact source excerpts for L1 (2026-10-21)

These excerpts reuse the already freshly fetched body; no additional network request, production change or runtime probe was made. All are exact visible-text substrings after stripping HTML markup and joining source-line whitespace, with no editorial ellipses or changed punctuation. Each is at most 25 whitespace-delimited words.

Common source URL: **https://html.spec.whatwg.org/multipage/input.html**. Access date: **2026-10-21**. Decoded body: **687,515 bytes**; SHA-256 **`9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`**. Retained body: `.ufo/waves/round-19/w2/SourceS082.body.gz`. Line ranges below are physical lines in that decoded body.

| Subject | Exact quotation | Words | Decoded-body lines / section anchor |
|---|---|---:|---|
| Text/Search newline stripping | `Strip newlines from the value.` | 5 | **1762–1763**, [§4.10.5.1.2 Text/Search](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)), value-sanitization algorithm |
| Range step rounding (opening clause) | `When the element is suffering from a step mismatch, the user agent must round the element's value to the nearest number` | 21 | **3415–3416**, [§4.10.5.1.13 Range](https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)); full constrained rounding rule is **3415–3420** |
| Range equal-distance tie | `If two numbers match these constraints, then user agents must use the one nearest to positive infinity.` | 17 | **3419–3420**, [§4.10.5.1.13 Range](https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)) |
| Color serialization, absent-alpha opacity | `If element's alpha attribute is not specified, then set color's alpha component to be fully opaque.` | 16 | **3685–3686**, [serialize a color well control color](https://html.spec.whatwg.org/multipage/input.html#serialize-a-color-well-control-color); full algorithm **3682–3705** |
| Color serialization, HTML-compatible branch | `If element's alpha attribute is not specified, then set htmlCompatible to true.` | 12 | **3692–3693**, [serialize a color well control color](https://html.spec.whatwg.org/multipage/input.html#serialize-a-color-well-control-color); enclosing Limited-sRGB condition **3687–3688** |
| Color serialization, return rule | `Return the result of serializing color. If htmlCompatible is true, then do so with HTML-compatible serialization requested.` | 17 | **3703–3705**, [serialize a color well control color](https://html.spec.whatwg.org/multipage/input.html#serialize-a-color-well-control-color) |

**Binding boundaries:** the range opening quote is a clause, not the complete rounding condition: lines 3417–3418 retain the non-step-mismatching and min/max eligibility requirements. The tie quote supplies the missing reason for choosing 6 rather than 4 when the eligible midpoint neighbors are equal-distance. The color algorithm delegates the exact CSS serialization representation to its linked CSS algorithm; these quotations establish the local opacity/HTML-compatible selection and delegation, not an independently opened CSS-source proof. Text/Search stripping is input authority only: **no textarea-normalization authority is supplied by lines 1762–1763**. This supports L1's proposed S095 Text/Search scope expansion; S095 itself was not created or inspected by this seat, and the textarea half remains separately attributed to own-runtime evidence as L1 specified.

## Isolation

- Clone: not created; this was a read-only source/metadata audit, with no runtime/mutation probe.
- Branch: none. Base inspected: R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (baseline B remains `66251bfc1aef393e4aec599e950a8deb867736bb`).
- Clone commit: none; no Git writes or production edits.
- Production changed paths: none. SOURCES was never changed.
- Only lane writes: `.ufo/waves/round-19/w2/SourceS082.md` and `.ufo/waves/round-19/w2/SourceS082.body.gz`.
