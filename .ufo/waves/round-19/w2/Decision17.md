# Decision DV-17 — semantic review

**Verdict: DISAGREE with DV-17 as worded; agree with the observed `gamma` case.** The Chromium 154 source and receipt support rejection of the fixture's unique disabled value, but “a radio group receives the value of a disabled radio” is broader than the implemented rule. The actual predicate is whether the coerced input matches any value among the non-disabled controls retained for that parameter.

Axes reviewed: source entailment; decision scope; raw runtime observation; case-ID and counter integrity.

## Findings, by severity

### P2 — The condition overstates the rejection rule; the answer blurs invalid value and unknown parameter

At checkpoint R (`d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; lane `refs/heads/master` resolves to R), the manifest's DV-17 condition is “A radio group receives the value of a `disabled` radio” and its answer says “Rejected like an unknown value.” The SKILL row repeats this. That conclusion is true for the particular fixture's `gamma`: it has enabled `alpha` and `beta`, no enabled `gamma`, and its parameter key `choice` still exists. It is not true for every radio group/value covered by the condition:

- If a disabled radio and an enabled radio share a value, the enabled member remains in `controls_for_name`; `ValidateRadioData` returns true on any matching member. The disabled radio's value is then accepted (the fill applies to the enabled control). This is a source-derived inference, not a browser reproduction.
- If all radios with that name are disabled, `ProcessForm` omits the whole name. An invocation with that key takes the unknown-parameter path, not the invalid-value path. This is also a source-derived inference.
- The current fixture exercises neither boundary: it has two enabled peers and a unique disabled `gamma`.

The answer “like an unknown value” is ambiguous and misleading if read as an unknown **parameter**: this case's `choice` is a known parameter and Chromium returns the invalid-value template. The source has a distinct unknown-key error branch.

**Exact correction recommended** (apply to `decisions.json` DV-17 and the corresponding SKILL table row):

- `condition`: “A radio-group parameter with enabled members receives a string value present only on a disabled radio (no enabled member has that value).”
- `answer` / observed outcome: “For this fixture's unique disabled value `gamma`, `choice` is rejected at fill time with `Invalid value \"gamma\" for parameter choice`; the enum is `[alpha, beta]` and submitCount is 0. A same-valued enabled radio would make that value valid.”
- Prefer the full error string in `outcome.errorTextIncludes` (`Invalid value \"gamma\" for parameter choice`), rather than the current shorter prefix. The case definition already expects the full string.

The knowledge note is narrower and correct at `webmcp-declarative-validation-round-19.md:58-60`: “Radio: the value must equal an enabled radio's value.” But its general statement at `:43-46` (“Disabled and readonly controls … [are] absent from the schema and rejected as unknown”) overgeneralizes for a named group that also has enabled controls: the disabled member is omitted, while the shared name can remain in the schema and an unmatched value fails validation rather than as an unknown key. Qualify that prose to say a disabled/readonly control contributes no member; a parameter is absent/unknown only when no eligible control with that name remains. The SKILL DV-04 row (`SKILL.md:2063`) has the same edge-condition risk if read as applying to a disabled member sharing a name with enabled controls; its two observed cases are separate disabled/readonly controls, not this radio-group shape. The general “disabled controls are unsettable” guidance is safe only as a per-control statement, not a claim that every associated parameter name vanishes.

### P3 — The token-bound source window proves omission, not the whole rejection chain

The source identity is correct: S077 is Chromium tag `154.0.8037.97`, URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`, opened 2026-10-21; decoded body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. I decompressed the retained body with `zcat` and independently obtained the same SHA-256.

Exact retained-source quotes (each under 25 words):

- `if (form_control->IsDisabledOrReadOnly()) { continue; }` — `form_mcp_schema.cc:1240-1242`.
- `if (input.Value() == string) { return true; }` — `form_mcp_schema.cc:382-383`.
- `// If the data isn't valid, form control states remain unchanged.` — `form_mcp_schema.cc:209`.

The source chain is: `ProcessForm` omits disabled controls; the radio validator checks whether the coerced string equals **any retained control**; `FillData` returns `kInvalidInputArguments` on a rejected value before its separate apply loop. This entails the fixture's result, conditional on `gamma` having no enabled peer. The manifest's `source.lines: [1238,1243]` and token `IsDisabledOrReadOnly` are exact and hash-bound, but that narrow window alone proves only exclusion, not the membership comparison or error path. Keep it as the omission anchor and add the validator/error-path anchors (S077 `form_mcp_schema.cc:374-388` and `:208-231`) to the explanatory source citations; the `decisions.json` anchor should not be presented as a standalone proof of the full outcome.

### P3 — The counter is strong for provenance/reproduction, not semantic prose or every raw facet

Static review of `.ufo/waves/round-19/measure-c1.mjs` shows meaningful guards: duplicate probe IDs are rejected (`:564-576`); source-body digest and token-in-lines are checked (`:579-610`); receipt IDs/duplicate IDs are indexed (`:469-481`); case/fixture digests, runtime identity, producer digest and a fresh harness reproduction are checked (`:613-618`, `:804-879`); case outcomes are compared with the manifest and both fresh/committed status, error text and submit count (`:635-713`). This is strong evidence for the declared status/error/submit outcome and its provenance. The counter is not a semantic checker: the SKILL table matcher checks decision/case/source identifiers, not the truth of the condition or answer (`:522-561`). That is why the prose scope defect above is not caught by the count.

For DV-17 specifically, `radio.json:67-77` sets `expect.schema` to enum `[alpha,beta]`, which the harness compares (`scripts/webmcp-validation-round19.mjs:1043-1062`). But `expect.fields` is `null`, so it intentionally skips state comparison; the stored `observed.fields: {"choice":null}` is an observation, not an asserted expectation. The counter's comparable observation also projects only status, errorText and submitCount (`measure-c1.mjs:484-508`), not the stored schema/fields. Thus the current counter does not independently compare every raw committed receipt facet to the fresh run. If the no-state-change observation is intended as a runtime-checked proposition, set this case's expected fields to `{"choice":null}`; otherwise keep it explicitly source-derived. In either case, the source's validate-before-apply path supports the no-change rule.

## Raw runtime proposition and IDs

`receipt.json` case `decl-radio-03` records input `{"choice":"gamma"}`, correlated `toolInvoked`/`toolResponded` invocation IDs, `toolResponded.status: Error`, exact error `Invalid value \"gamma\" for parameter choice`, `submitCount: 0`, schema enum `[alpha,beta]`, post-invoke fields `{choice:null}`, and `pass: true`. This agrees with the *narrow* decision. Its in-family control `decl-radio-01` records valid `beta`, `Completed`, one submit, and `{choice:beta}`, also `pass: true`. `radio.json` declares `fields: null` for the probe, so the receipt's null field is not a checked case assertion.

ID check (read-only enumeration, no C1 counter run): 27/27 decision IDs unique; 66/66 receipt case IDs unique; all 46 probe-ID occurrences are unique across decisions. DV-17's probe `decl-radio-03` and control `decl-radio-01` each identify one receipt case. `decl-radio-01` is deliberately reused as the in-family control for DV-16 and DV-17; controls are not required to be globally unique by the plan's rule, which requires unique **probe** IDs. No duplicate case definition/receipt ID was observed for either DV-17 case.

`ToString` in S077 accepts strings, integers, doubles and booleans (stringifying the latter numeric/boolean values); null/array/object do not stringify. DV-17 probes only the string `gamma`; do not generalize it to null or other JSON types. A convertible value equal to an enabled radio's value can pass. The fill-time error is before the apply phase; the receipt's `submitCount: 0` confirms no submission in this observed case. No claim here is made about submit-time constraint validation.

## Verification gaps

No browser, C1 counter, build or test suite was run, as assigned. LSP status/semantic queries were unavailable: `read xd://lsp` returned “No such tool” (no LSP device is mounted); grep was used only to enumerate prose mentions, not as semantic proof. This review is grounded in the retained source, manifest/cases, current receipt, counter and harness code.

## Isolation

Report-only seat. No clone, branch, commit or production file was created or changed; only this assigned report was written in LANE.