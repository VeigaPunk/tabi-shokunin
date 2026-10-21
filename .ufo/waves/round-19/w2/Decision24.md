# DV-24 semantic review

**Verdict: DISAGREE with the row/prose as currently scoped; agree with the three specific observed string results.** The retained source supports a color-input sanitizer rule, but not the complete WebMCP/runtime claim or the current class-wide wording. The current receipt does show the stated values for these exact cases.

## Findings

### High — C1 can count a wrong answer or edited field output

The counter is strong on several integrity checks: `measure-c1.mjs:564-576` rejects probe IDs reused between decisions; `:579-601` checks the retained body's SHA-256 and token within the declared lines; `:748-802` runs the pinned producer in a fresh clone; and `:635-688` requires matching case definitions and passing committed/fresh records.

It does **not** mechanically verify the answer this decision makes. `parseManifest` (`measure-c1.mjs:303-319`) only requires nonempty `condition` and `answer`; `indexDecisionRows` (`:522-560`) checks that the SKILL row contains IDs and the source-row token, not that its condition/outcome matches the case data. More importantly, `receiptObservation`/`comparableReceiptRecord` (`:484-507`) reduce observations to status, error text, and submit count. The committed/fresh comparison (`:680-703`) therefore ignores the color field values, derived schema, and submit-call/control details that substantiate `"red" → `#ff0000` and the black fallback. A committed receipt can change those raw values while retaining `pass: true` and the same status/error/count and still compare equal. `pass` is trusted rather than recomputed by the counter. Thus C1's counter does not protect DV-24's central value claims or detect an overbroad/incorrect prose answer.

**Correction:** compare the relevant complete observed payload (at minimum each probe's `toolResponded.output.fields.color`, schema, and submit-call observation) between committed and fresh receipts and against case expectations; do not use `pass` as a substitute. Keep the free-text condition/answer under explicit semantic review or bind them to structured, case-specific assertions.

### Medium — the evidence supports these examples, not the current unqualified class claim

The decision record (`decisions.json:601-625`) and SKILL row (`SKILL.md:2083`) say “A color control receives a CSS name or an unparseable string”; the knowledge note (`corpus/knowledge/webmcp-declarative-validation-round-19.md:56-57`) generalizes to “CSS names” and “unparseable strings.” The actual probe set is narrower: case 03 sends the JSON string `"red"`; case 04 sends `"not-a-color"`; case 05 sends `"#12GG56"`. All three are strings on the fixture's default `<input type="color">`, with no `alpha` or `colorspace` attribute. No other CSS name, invalid string, color-space configuration, or non-string value was tested.

The exact receipt/probe observations agree with those examples: each `toolResponded` is `Completed`, `errorText` is null, output and control value are `#ff0000` for `red` and `#000000` for the two invalid strings, and the recorded submit has `agentInvoked: true`, `isTrusted: true`; each summary has `submitCount: 1`. This establishes one agent-invoked submission by the time the response was observed. The records provide no timestamps, so they do not support a finer timing/latency claim.

The source is WHATWG HTML Standard S082, not Chromium/WebMCP implementation evidence. Its sanitizer proposition is: parse the value as a CSS color; on parse failure choose opaque black; then serialize the color well value. The source quote is “If color is failure, then set color to opaque black.” The stored decision anchor ends at line 3678, splitting the quoted phrase from `black` on line 3679 and ending before the serialization algorithm; its token `opaque` is present, but the token-presence check alone does not establish the full result. S082 does not establish that WebMCP accepts any particular JSON type, invokes the setter, submits, or emits `Completed`. The S082 registry description explicitly says “not Chromium 154 implementation or runtime validation evidence.” The receipt, rather than S082, establishes those Chromium-specific observations.

Source verification: `zcat corpus/evidence/round-19/sources/input.html.gz | sha256sum` produced `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`, matching `decisions.json:619` and `SOURCES.md:96`. Source URL: https://html.spec.whatwg.org/multipage/input.html ; accessed/fetched 2026-10-21. Relevant decoded body lines: 3675-3679; the current decision anchor is `[3667, 3678]` with token `opaque`.

**Exact suggested wording** (preserve the current case IDs and outcome, but scope it to the evidence):

- `condition`: `The default color control in decl-range-color receives one of the tested JSON strings: "red", "not-a-color", or "#12GG56".`
- `answer`: `On Chromium 154.0.8037.97 in this fixture, all three returned Completed with errorText null and one agentInvoked submit: "red" → "#ff0000"; "not-a-color" and "#12GG56" → "#000000". These cases do not establish behavior for all CSS names, invalid strings, or non-string inputs.`
- Replace the knowledge-note sentence with the same tested-value scope, then separately say that S082 specifies parse failure → opaque black. Extend the source line anchor through the complete fallback sentence (at least through line 3679); label it as standards rationale, not runtime proof.

### Case IDs and control

The three probe IDs (`decl-range-color-03/04/05`) are distinct and the manifest has no duplicate probe IDs (the JSON duplicate-group query returned 0; the counter also checks this). The case file defines each ID once. The control `decl-range-color-01` is an in-family `Completed` case with one submit and a preserved valid color `#123456`, so it meets the stated success-control rule; it also tests range clamping (`range: 99`), so it is not a color-only contrast. IDs are cross-role reused: DV-23 uses `01/02` as probes and `03` as control, while DV-24 uses `03/04/05` as probes and `01` as control. This does not violate the explicit unique-*probe*-IDs rule, but these are not independent control IDs.

No null, number, boolean, array, or object color inputs appear in DV-24's probes or control. Do not infer null rejection/coercion or general type conversion from this evidence. The current observations support only the exact string inputs above.

## Residual risk and verification gaps

- Other named colors, parser failures, `alpha`/`colorspace` settings, and non-string inputs remain unobserved; the general wording should not be credited as measured coverage.
- I did not run a browser or the full C1 counter, as scoped. I inspected only retained source, existing receipt/probe data, and counter logic.
- The `lsp` device is unavailable in this environment (`xd://lsp` returned “No such tool”); literal search was used only to enumerate the relevant SKILL/knowledge prose, not as semantic proof.

## Isolation

Report-only review. No production files, counters, cases, fixtures, evidence, or source trees were modified; no clone/branch/commit was created. The sole LANE write is this assigned report: `.ufo/waves/round-19/w2/Decision24.md`.
