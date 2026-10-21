# WHATWG input value sanitization — C1 source findings

## Retrieval

- **URL:** https://html.spec.whatwg.org/multipage/input.html
- **Access date:** 2026-10-21. Opened the official page after searching for the state algorithms; the decoded response identifies itself at physical line 16 as “Living Standard — Last Updated 20 October 2026”.
- **Decoded response:** 687,515 bytes; SHA-256 `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`.
- **Retained decoded body:** `.ufo/waves/round-19/w1/TabiR19-2.SrcValueSanitization-4.body.gz` (gzip SHA-256 `b223d2fd1b04bffc9babe4e7ea1aeb95201315b9d4808617b00da4418e137f6a`).
- All line numbers below are physical line numbers in that exact decoded HTML response, not rendered-page line numbers. The page is a living standard and does not embed its source commit. GitHub API reported `whatwg/html` HEAD `c6c3055c1287bf50070260d53555d8d6ab530771` on retrieval; I do not assert that the deployment was built from that commit. The response digest pins what was actually opened.

## Observed facts and line map

The WHO/WHATWG scope here is the Standard's input-value semantics, not Chromium 154's implementation. In §4.10.5.4, the `HTMLInputElement.value` IDL setter takes the new value (L5631), sets the dirty-value flag (L5632), then invokes the current type's value-sanitization algorithm if defined (L5633); the post-sanitization value is the value compared with the old value (L5634). Input creation also invokes a defined sanitizer (L1532–1534), and a type-state change invokes the new state's sanitizer (L1551). Thus the predictions below apply when filling follows this `.value` setter path; this source alone does not prove the Chromium declarative `FillData` path or its runtime result.

| Input state (section heading line) | Sanitization / relevant branch in decoded body | Expected value effect from the Standard |
|---|---|---|
| `url` (§4.10.5.1.4, L1932) | L1964–1966: strip newlines, then leading and trailing ASCII whitespace. Constraint validation is separate at L1971–1972. | Trims/strips only; it does not clear a syntactically invalid URL. The separate constraint rule marks a nonempty value that is not a valid absolute URL as a type mismatch. |
| `email`, no `multiple` (§4.10.5.1.5, L2072) | L2113–2115: strip newlines and leading/trailing ASCII whitespace. Separate type-mismatch condition at L2119–2121. | Whitespace normalization only; an invalid address is not erased by this sanitizer. |
| `email`, with `multiple` (same section) | L2166–2173: split on commas, trim each token, retain the possibly empty tokens and order, then join with one comma. Changing `multiple` invokes sanitization at L2186–2187. List validation is separate at L2177–2179. | Normalizes the comma-separated representation; this is not an email-address validation/sanitization-to-empty rule. |
| `date` (§4.10.5.1.7, L2387) | L2427–2428: if not a valid date string, set the value to the empty string. | Invalid date → `""`; valid date stays under this algorithm. |
| `time` (§4.10.5.1.10, L2863) | L2903–2904: if not a valid time string, set the value to the empty string. | Invalid time → `""`. |
| `datetime-local` (§4.10.5.1.11, L3015) | L3059–3061: valid local date-time → a normalized string for the same date/time; otherwise → empty string. | Valid but non-normalized input may change spelling; invalid input → `""`. |
| `number` (§4.10.5.1.12, L3183) | L3228–3229: if not a valid floating-point number, set the value to the empty string. | Invalid number → `""`. |
| `range` (§4.10.5.1.13, L3351) | L3391–3392: invalid floating-point string → best representation of the default range value. The default is minimum plus half the min/max difference, or minimum when max < min (L3398); missing min/max default to 0/100 (L3501–3504). | Invalid range input → default, not empty. With absent bounds the formula yields 50. **[INFERENCE]** That 50 follows arithmetically from the cited defaults/formula. Separate range constraint branches: underflow uses minimum (L3404–3406), overflow uses maximum when max ≥ min (L3410–3411), and a step mismatch is rounded when an eligible number exists (L3415–3420). These are distinct from the sanitizer branch; do not treat them as proof that a particular WebMCP fill path applies them immediately. |
| `color` (§4.10.5.1.14, L3589) | L3602–3603: the state always has a CSS color; user cannot set it empty. The missing/invalid `colorspace` default is Limited sRGB (L3627–3628). Sanitization runs the color-update algorithm (L3662–3663): it reads the content attribute when the dirty flag is false, otherwise the current value (L3672–3675); parse failure becomes opaque black and the value is then serialized (L3676–3678). Serialization makes alpha opaque when `alpha` is absent and uses the selected color space (L3685–3705). | Invalid parsed color → opaque-black color, then a state-dependent serialized color string; not empty. Do not assume the same serialized spelling for every `alpha`/`colorspace` configuration. |

Email and URL therefore differ from the date/time/number clearing branches: trimming is not validation. For email, the Standard places validity in a separate constraint-validation step; for URL it separately checks a nonempty valid absolute URL. Range's invalid-number default and color's parse-failure fallback are the key post-fill distinctions from number.

## Verbatim quotes (4; all ≤25 words)

1. Number — §4.10.5.1.12, L3228–3229 (20 words): “If the value of the element is not a valid floating-point number, then set it to the empty string instead.”
2. Date — §4.10.5.1.7, L2427–2428 (20 words): “If the value of the element is not a valid date string, then set it to the empty string instead.”
3. Range — §4.10.5.1.13, L3391–3392 (17 words; ellipsis marks omitted words): “not a valid floating-point number, then set it to the best representation … of the default value.”
4. Color — §4.10.5.1.14, L3676–3677 (10 words): “If color is failure, then set color to opaque black.”

## Proposed SOURCES row

The registry header is the 11-column contract at `corpus/SOURCES.md:13`. Proposal only; not added to the shared registry (PLAN §Byte-frozen assigns shared edits to L1).

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | HTML Standard, input element — https://html.spec.whatwg.org/multipage/input.html | spec | A | WHATWG value-sanitization semantics for input types number, range, date, time, datetime-local, email, url, color; not Chromium 154 implementation or runtime validation evidence | Living Standard updated 2026-10-20; §§4.10.5.1.4–.5, .7, .10–.14 and 4.10.5.4; fetched 2026-10-21; decoded-body SHA-256 `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`; upstream `whatwg/html` HEAD `c6c3055c1287bf50070260d53555d8d6ab530771` observed, but not verified as deployment build | When the `.value` setter is used, the type's defined sanitizer runs: invalid date/time/number values empty, range uses a min/max-derived default, color parse failure uses opaque black serialization; URL/email normalize whitespace and email `multiple` canonicalizes tokens. This is standards evidence only. | queued | 2026-10-21 | on-release | `corpus/evidence/round-19/validation/cases/*` (proposed use; not yet observed) |

## Unresolved gaps

- No Chromium/WebMCP runtime probe was performed; no claim is made that Chromium 154 `FillData` uses the `.value` setter or produces these exact values. S071 remains separate source-level Chromium evidence.
- The deployed living-standard page exposed its last-updated date, not a build commit. The body SHA-256 is the exact retrieval anchor; the repository HEAD above is contextual, not a proven page-build pin.
- No LSP semantic tracing applies to this external WHATWG specification. Search located the literal HTML lines; semantic claims above come from the opened primary page, not grep output alone.

## Isolation

No production file or clone commit was produced. Only the assigned report and requested retained source body were written under the lane's permitted W1 report/artifact paths.