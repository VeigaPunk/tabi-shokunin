# WHATWG constraint-validation source (C1 depth)

## Retrieval identity

- **URL:** https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints
- **Access date:** 2026-10-21; public GET retrieval succeeded.
- **Page snapshot:** header says “Living Standard — Last Updated 20 October 2026” (fetched body line 16). No commit/revision identifier is shown in that page header.
- **Decoded response-body bytes:** 466,321; **SHA-256:** `af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92`.
- **Retained body:** `tabi-shokunin/.ufo/waves/round-19/w1/SrcWhatwgConstraints.body.gz` (gzip size 61,795 bytes; decompression preserves the decoded response body above).
- The line references below are in that retained, digest-identified HTML body.

## Relevant line map

| Body lines | Section / branch or statement | Relevance and limit |
|---|---|---|
| 2149 | §4.10.21 `Constraints`, the requested `#constraints` anchor | Locates the full constraints section. |
| 2153–2159 | §4.10.21.1: submittable elements are candidates except when barred; example: a `datalist` ancestor | The static algorithm below filters on candidacy. |
| 2172–2175 | Introductory list of validity states; explicitly says these definitions are non-normative summaries and other parts specify exact applicability | Important qualifier: do not treat this overview as the complete type-specific validity algorithm. |
| 2177–2184 | `valueMissing`: missing value with `required`; `select` and radio-group rules defer to their sections; custom elements can set the flag via `setValidity()` | Grounds the requested missing-value state, with control-specific qualification. |
| 2185–2191 | `typeMismatch`: arbitrary-user-input control value has incorrect Email/URL syntax; custom-element flag setting is also described | Grounds the requested syntax state. |
| 2192–2198 | `patternMismatch`: value fails the `pattern` attribute; custom-element flag setting is also described | Grounds the requested pattern state. |
| 2217–2223 | `rangeUnderflow`: nonempty value is below `min`; custom-element flag setting is also described | Grounds the requested lower-bound state. |
| 2231–2237 | `stepMismatch`: value does not fit `step` rules; custom-element flag setting is also described | Grounds the requested step state. |
| 2250–2255 | A disabled element can still carry validity states; an element satisfies constraints iff it suffers from none of the listed states | Distinguishes exposed state from whether submission-time validation will report a problem. |
| 2264–2271 | §4.10.21.2 defines “statically validate the constraints” for a form and its positive/negative result | Begins the form-level algorithm; it is conditional on the user agent being required to run it. |
| 2273–2279 | Builds the form-owner control list in tree order; skips non-candidates and controls satisfying constraints; collects the remainder as invalid | The explicit candidate and validity branches. |
| 2280–2290 | Empty invalid list returns positive; otherwise fires cancelable `invalid` events and returns negative with the unhandled-invalid list | Event cancellation affects which invalid controls are returned, not whether a control was initially collected as invalid. |
| 2293–2312 | Interactive validation first calls static validation; if negative, reports at least one unhandled problem (with user-agent presentation discretion) | Separate interactive behavior; not a declaration that every value-fill operation invokes validation. |
| 2329–2343; 2419–2438 | Constraint-validation API’s `ValidityState` booleans and their mapping to the corresponding conditions; IDL includes `valueMissing`, `typeMismatch`, `patternMismatch`, `rangeUnderflow`, and `stepMismatch` | Publicly exposed state vocabulary and per-state meaning. |
| 2441–2456 | `check validity steps`: candidate and invalid → fire `invalid`, return false; otherwise true; `checkValidity()` runs those steps | Explicit API-triggered check, distinct from WebMCP input assignment. |

## Verbatim source quotations

1. > “The definitions below are non-normative; other parts of this specification define more precisely when each state applies or does not.”  
   §4.10.21.1, body lines 2172–2175.
2. > “When a control that allows arbitrary user input has a value that is not in the correct syntax (Email, URL).”  
   §4.10.21.1, `typeMismatch`, body lines 2185–2186.
3. > “When a control has a value that doesn't fit the rules given by the step attribute.”  
   §4.10.21.1, `stepMismatch`, body lines 2231–2233.
4. > “When the user agent is required to statically validate the constraints of form element form, it must run the following steps”  
   §4.10.21.2, body lines 2267–2271.

## Comparison boundary and proposed registry entry

This is primary HTML-standard evidence for native form-control validity states, the `ValidityState` API, and the user-agent form static/interactive validation algorithms. The state-definition list itself is explicitly non-normative overview, and the source directs exact applicability to other specification sections. These sections do **not** establish that WebMCP declarative `FillData` invokes static or interactive HTML validation, nor that its accepted input is equivalent to native constraint validity. The existing S071 source dossier separately records `FillData`’s parameter-name/value checks and assignment order (`.ufo/waves/round-18/sources/DeclarativeValidation.md:24,37–38`); a comparison should keep those checks separate unless Chromium implementation or probe evidence establishes an actual linkage.

Proposed one-row addition (11 columns; placeholder ID intentionally left for L1 allocation):

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | HTML Standard, Constraints — WHATWG — https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints | spec | A | Native HTML form-control validity states, `ValidityState`, and static/interactive validation algorithms; not WebMCP `FillData` behavior | Living Standard, page header Last Updated 20 October 2026 (no commit shown); §4.10.21.1–.3, especially `#constraints`, `#definitions`, `#constraint-validation`, body lines 2149, 2172–2255, 2264–2312, 2329–2456 | Supplies the native HTML validity vocabulary and form-validation control flow for comparison; does not prove WebMCP fill runs those algorithms | queued | 2026-10-21 | on-release | — |

No tools were installed or updated.