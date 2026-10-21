# DV-06 — semantic falsification

**Verdict: DISAGREE with the current wording.** The two probe cases support the reported outcome for this exact fixture, but the condition overgeneralizes, the cited source only supports the downstream failure branch, and the SKILL row does not reproduce the raw error text exactly.

## Observed proposition

`corpus/evidence/round-19/validation/fixtures/missing-required.html:8-10` defines a `toolautosubmit` form with one initially empty `<input type="text" name="required" required>` and a separate optional input initialized to `optional-default`. The committed receipt reports Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0.

| Case | Input | Raw observed result |
|---|---|---|
| `decl-missing-required-01` | `{}` | `toolResponded.status=Error`; `errorText="Form validation failed: required: Please fill out this field.. "`; `submitCount=0`; fields are `required:""`, `optional:"optional-default"`. |
| `decl-missing-required-02` | `{"required":""}` | Same status, exact errorText, submit count, and field values as case 01. |
| `decl-missing-required-04` (control) | `{"required":"provided-required"}` | `Completed`, `submitCount=1`; required value is `provided-required`, optional remains `optional-default`. |
| `decl-missing-required-03` (null contrast) | `{"required":null}` | Fill-time `Error`, `errorText="Invalid value for parameter required"`, `submitCount=0`; both fields retain their initial values. |

These are fixture-specific, observed runtime facts. The case file and receipt both retain the raw `toolResponded`, schema, submit count, and field state; all four case records say `pass: true`.

## Source entailment and provenance

The manifest’s source object is S078, body `corpus/evidence/round-19/sources/html_form_element.cc.gz`, decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. I decompressed the retained body and independently computed that SHA-256 on 2026-10-21. The cited range `[729,751]` contains token `Form validation failed: ` at line 733 and the abort assignment `should_submit = false;` at line 730. Lines 739-751 build the message from each invalid control’s WebMCP name and `validationMessage()`; line 752 appends `". "`.

Source quotes (each under 25 words): at `html_form_element.cc:729-730`, `if (!skip_validation && !ValidateInteractively()) {` and `should_submit = false;`; at line 733, `error_message.Append("Form validation failed: ");`; at lines 751-752, `error_message.Append(control->validationMessage());` then `error_message.Append(". ");`.

**S078 does not entail the complete DV-06 condition.** It describes what Blink does once interactive validation has failed; it does not establish that an omitted/empty required text control triggers that failure, that omission starts from an empty value, that `""` is accepted by the fill validator, or that every required control/type behaves identically. The runtime cases establish those observations for this fixture. The recorded source range also ends before line 752, so it does not cover the final punctuation currently implied by the answer; extend `source.lines` to `[729,753]` if the citation is intended to cover the whole formatter branch.

S077 supplies the distinct fill-side evidence: retained body `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`, decoded SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` (independently computed on 2026-10-21), URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`. At `form_mcp_schema.cc:208-243`, `FillData` validates supplied entries before applying them; its comment says, `If the data isn't valid, form control states remain unchanged.` At `:302-319`, text conversion rejects values `ToString` cannot convert and the empty-string branch returns true. `ToString` at `:49-68` handles strings, numbers, and booleans, then returns false for other JSON kinds; this is why JSON `null` is not coerced to `""`. S077 establishes the fill distinction, not the HTML required-constraint result.

S078 source URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`; access date 2026-10-21; decoded-body SHA-256 as above. S077 URL and access date are included above. The SKILL’s S078 entry in `corpus/SOURCES.md:92` classifies this as source-level evidence.

## Findings

### Medium — the condition overstates the tested population

`decisions.json` DV-06 says only “A `required` control is omitted or sent as `""`.” The SKILL row at `SKILL.md:2065` repeats that breadth. The tests cover one specifically typed required text input, initially empty, in a `toolautosubmit` form. Case 01 asks about omission *while the control starts empty*; it does not test omission of a pre-populated required control. Omission does not itself clear a value: S077’s fill loops visit supplied entries, and the knowledge note’s text section at `corpus/knowledge/webmcp-declarative-validation-round-19.md:65` correctly says omission leaves the current value. A prefilled required control omitted from input is therefore outside these probe results. Nor do these cases test required checkbox, radio, select, textarea, or custom-element behavior.

The manifest condition also omits `toolautosubmit`, although the answer relies on it. The fixture has that attribute (`fixture:8`); S078’s execution path submits immediately only for that attribute and otherwise focuses/waits for user submission (`html_form_element.cc:181-220`). The knowledge note’s scope at lines 15-20 correctly narrows its results to `toolautosubmit`; the decision condition and SKILL row should match.

**Exact correction:** set the DV-06 condition to: `On the fixture's toolautosubmit form, the initially empty required text input named required is either omitted or supplied as the JSON string "".` This preserves the two observed inputs without implying all required controls, pre-existing values, or non-autosubmit timing.

### Low — SKILL outcome’s literal message is short by one period

`SKILL.md:2065` renders the error as `Please fill out this field.`. The committed raw receipt for both probes is `Form validation failed: required: Please fill out this field.. ` (two periods, then a trailing space): Chromium’s validation message already ends in a period and S078 appends another `". "` at line 752. The case expectation correctly checks for the two-period substring, but the decision registry’s broader `errorTextIncludes` is only `Form validation failed: required:`.

**Exact correction:** say the result includes `Form validation failed: required: Please fill out this field..` (and note the raw value has a trailing space) rather than presenting the one-period form as the observed literal. Preserve `status=Error`, `submitCount=0`, and the observed empty field state.

### Medium — counter enforces evidence linkage, not prose fidelity or semantic entailment

`measure-c1.mjs:564-576` rejects duplicate probe IDs across decisions; a query of the full manifest finds no duplicated probe IDs. DV-06’s probes `decl-missing-required-01` and `-02` are unique. Its control `decl-missing-required-04` is an in-family `Completed` case; it is intentionally shared with DV-07 and is not a probe-ID collision. The counter also rejects duplicate case definitions / receipt records, binds the source row, decoded-body SHA, source line bounds and token (`:579-610`), checks probe expectations and fresh-versus-committed receipt observations (`:635-704`), and requires a completed control (`:706-712`). The producer’s `compareExpectation` checks status, error-text substring, submit count, expected fields, and expected schema (`scripts/webmcp-validation-round19.mjs:1043-1062`); `pass` includes those comparisons (`:1139-1147`). These are substantial mechanical checks for the tested cases.

They do **not** ensure the SKILL condition/answer faithfully describe those cases. `indexDecisionRows` only checks that the row contains probe IDs, control ID, and source-row ID (`measure-c1.mjs:522-561`); it never compares the condition or answer cells to the manifest’s `condition`/`answer`. Likewise, `sourceRejection` proves token presence in a hash-matched line range, not that the token semantically entails the condition. This DV-06 overbreadth and punctuation drift can therefore still be counted. The counter’s fresh/committed comparable receipt projection also retains only status, errorText, and submitCount from `observed` (`:484-507`), relying on `pass` for field/schema validation rather than comparing those raw observations directly across receipts.

**Counter correction:** compare the table’s condition and answer cells to `decisions.json`’s `condition` and `answer`, and report a mismatch reason; retain human semantic review because string equality cannot prove truth. Consider including observed fields/schema in the fresh-versus-committed projection if the counter is intended to verify those receipt facts independently of `pass`.

## Prose consistency, residual risk, and verification gaps

The knowledge note is materially better scoped than DV-06: its scope names loopback `toolautosubmit` forms on Chromium 154; its error-class paragraph at lines 35-42 describes the generic post-fill error path; and lines 65, 71-72 distinguish omission/empty fill behavior and the retained rejected values. The general SKILL introduction at lines 2040-2047 also limits the claimed runtime to the pinned browser and excludes real sites, other builds, agent-side clients, and custom elements. The contradiction is localized to the manifest’s condition and SKILL DV-06 row, plus the row’s one-period rendering; I found no other explicit DV-06 wording in the searched knowledge note or SKILL prose.

No browser, full C1 counter, build, or test suite was run, per assignment. I reviewed the committed receipt and source artifacts only. The LSP device is not mounted in this session: `read xd://lsp` returned `No such tool: xd://lsp` and listed only REA devices; therefore no LSP status/references/definition/diagnostics were available. Literal grep was used only to locate candidate prose; semantic findings above rely on direct reads of the fixture, manifest, cases, receipt, retained source bodies, and counter/harness source.

No tools installed or updated.

## Isolation

- Authorized direct lane write: `.ufo/waves/round-19/w2/Decision06.md` only.
- No production files changed; no sandbox clone, browser run, or counter run was created.
