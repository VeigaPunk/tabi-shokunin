# ScribeSkillTable — C1 SKILL.md table draft (round 19, wave 1)

Status: DRAFT. Report file only. No production file, no SKILL.md edit, no probe run, no receipt read.
Seat: TabiR19-2.ScribeSkillTable-4 (leaf, no subagent dispatch).
Date: 2026-10-21. Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Baseline B = 66251bfc1aef393e4aec599e950a8deb867736bb.

Every observed cell below is `TBD-observed`. Nothing here is an outcome. A row earns a count (PLAN C1 (a)-(d)) only when the
round-19 receipt `corpus/evidence/round-19/validation/receipt.json` carries `pass: true` with observed CDP status/error text for
the cited case id, and the cited S### row is opened 2026-10-21 against the Chromium 154.0.8037.97 tag.

## Anchors read for house style and sourcing

- `SKILL.md:1950-1959` — round-17 WebMCP invocation decision rows (4-column style: Question | Answer).
- `SKILL.md:1976-1986` — round-18 browser-harness decision table (Condition | Required behavior / evidence).
- `SKILL.md:1994-1997` — round-18 correction paragraph that this draft will supersede once filled.
- `SKILL.md:1956` — round-17 row "Does Chromium enforce `inputSchema`? No — mismatching input ran `Completed`". This row is an
  imperative-tool observation. The correction below must keep that scope.
- `SKILL.md:2027`, `:2030` — round-18 registry rows naming `webmcp-invoke-round18.mjs` and `measure-c1.mjs` (for cross-reference only).
- `corpus/SOURCES.md:85` — S071 row (opened 2026-10-20; tag 154.0.8037.97; FillData:208-243; html_form_element.cc:192-258;
  model_context.cc:562-565 and 752-811). Status `mined`, tier A.
- `.ufo/waves/round-18/sources/DeclarativeValidation.md` — S071 dossier. Quotes: `form_mcp_schema.cc:216-219` (unknown parameter),
  `form_mcp_schema.cc:224-226` (invalid value), `form_mcp_schema.cc:289-292` (custom elements return true from
  `ValidateParameterData`), `html_form_element.cc:245-247` (object check), `:249`, `:258` (`FillData` call). Dossier states the
  rejection is [INFERENCE] from the call chain, not observed at runtime.
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html` — fixture pattern (form with `toolname`,
  `tooldescription`, `toolautosubmit`; submit listener writes `window.__obs.calls`; `preventDefault()` then `respondWith`).

Source discrepancy to carry forward (not resolved here): SOURCES.md:85 cites `FillData:208-243` and the round-18 lesson cites
`FillData:216-219` for the same unknown-parameter quote. The two ranges nest (216-219 inside 208-243); the S071 dossier states the
same. No conflict in substance; the round-19 row must cite the narrower line range it quotes.

## Draft section (to be inserted after SKILL.md:1997 as a new `###` heading; not inserted)

### Declarative WebMCP input-validation decision table (round 19)

Scope: declarative `<form toolname tooldescription toolautosubmit>` tools only, Chromium 154.0.8037.97, loopback fixtures, flags on
(`WebMCP`, `WebMCPTesting`, `DeclarativeWebmcp` as the harness merges them). Imperative tools are not in this table. Family
fixtures are `corpus/evidence/round-19/validation/fixtures/<family>.html`; cases are `cases/<family>.json` (schema
`tabi-webmcp-validation-cases-v1`). Probe outputs are `probes/<family>.json`. Case-id counts are TBD until each family seat runs its
own throwaway probe.

| Question | Observed on Chromium 154 loopback (flags on) | Case ids | Source (S###, file:lines) |
|---|---|---|---|
| Does `invokeTool` with a key that names no form control reach the page, or is it refused before execution? (family: unknown-param) | TBD-observed (status / errorText / submitCount / fields) | decl-unknown-param-nn (count TBD) | S071 form_mcp_schema.cc:216-219 (source only; runtime row S077+ TBD) |
| Does an omitted control marked `required` make the call fail or still submit? (family: missing-required) | TBD-observed | decl-missing-required-nn (count TBD) | S077+ TBD (no S row yet; S071 FillData:208-243 does not evidence a required check) |
| Is a non-numeric string for `<input type=number>` rejected by `FillData` or passed through? (family: number-type) | TBD-observed | decl-number-type-nn (count TBD) | S071 form_mcp_schema.cc:224-226 (invalid-value path; type-specific) plus S077+ TBD |
| Is a value outside `min`/`max` on `<input type=number>` rejected or executed? (family: number-range) | TBD-observed | decl-number-range-nn (count TBD) | S077+ TBD (range check not yet located in the dossier) |
| Is a value absent from a `<select>` option list rejected? (family: select-enum) | TBD-observed | decl-select-enum-nn (count TBD) | S071 form_mcp_schema.cc:224-226 plus S077+ TBD |
| Does a `<select multiple>` accept an array, a single string, or reject both? (family: select-multiple) | TBD-observed | decl-select-multiple-nn (count TBD) | S077+ TBD |
| What value does `<input type=checkbox>` receive: boolean, `on`, or absent when unchecked? (family: checkbox) | TBD-observed | decl-checkbox-nn (count TBD) | S077+ TBD |
| Does a radio group reduce to one selected value, and is a value outside the group rejected? (family: radio) | TBD-observed | decl-radio-nn (count TBD) | S077+ TBD |
| Do `maxlength` and `pattern` on a text control reject an over-long or non-matching value? (family: text-constraints) | TBD-observed | decl-text-constraints-nn (count TBD) | S077+ TBD |
| Does `type=email` or `type=url` reject a malformed string before execution? (family: email-url) | TBD-observed | decl-email-url-nn (count TBD) | S071 form_mcp_schema.cc:221-231 (type-specific ValidateParameterData; line range TBD) plus S077+ TBD |
| Does `type=date` or `type=datetime-local` reject a non-ISO string? (family: date-time) | TBD-observed | decl-date-time-nn (count TBD) | S077+ TBD |
| Does `type=range` or `type=color` reject an out-of-step or non-hex value? (family: range-color) | TBD-observed | decl-range-color-nn (count TBD) | S077+ TBD |
| Does a JSON object or array sent for a scalar control get refused, coerced, or passed through? (family: non-scalar) | TBD-observed | decl-non-scalar-nn (count TBD) | S071 html_form_element.cc:245-247 (object check) plus form_mcp_schema.cc:208-243; S077+ TBD |
| Is a `disabled` or `hidden` control's value accepted, ignored, or refused? (family: disabled-hidden) | TBD-observed | decl-disabled-hidden-nn (count TBD) | S077+ TBD |
| Does an empty `<textarea>` with `required` or an empty string value run, or get refused? (family: textarea-empty) | TBD-observed | decl-textarea-empty-nn (count TBD) | S077+ TBD |
| Does a custom element control (no `ValidateParameterData` type) bypass per-type checks? | TBD-observed (expected per source: no per-type check, `form_mcp_schema.cc:289-292` returns true; not observed) | decl-custom-element-nn (count TBD; optional row, not a PLAN family) | S071 form_mcp_schema.cc:289-292 (source only; [INFERENCE] until observed) |

Reading rules for this table:

- `TBD-observed` means no probe has run. Do not read it as pass, fail, or unsupported.
- A row counts toward C1 only if the cited case id has `pass: true` in the receipt with observed status or error text.
- Source cells are source-level evidence. They do not prove runtime behaviour. Any row whose only source is S071 remains
  `[INFERENCE]` until observed.
- Only the unknown-parameter and invalid-value rows have located source lines in S071. The other families need new S077+ rows
  (opened 2026-10-21, tag 154.0.8037.97, file:lines quoted) before their Source cell can be filled.

**Correction to the round-18 note at :1994-1997 (DRAFT; supersedes only after the receipt lands with `pass: true` on the cited case ids):**

The round-17 row at `:1956` and the round-18 note at `:1994-1997` describe Chromium's schema enforcement. The measured mismatch in
round 17 was an imperative tool (ran `Completed`), so that observation stays imperative-only. For declarative form tools, source
S071 (`form_mcp_schema.cc:216-219`, `:224-226`) shows `FillData` rejecting unknown parameter names and invalid supported values before
execution. Until the round-19 receipt records the cited case ids as observed, the round-18 wording "source-level evidence, not a new
runtime validation probe" stands. Once they are observed, replace it with: declarative unknown-parameter and invalid-value rejection
observed on Chromium 154 loopback (case ids TBD), other control families as the table records, custom-element controls not
type-checked per S071 `:289-292` (source; observation TBD). It does not establish JSON Schema compliance for imperative tools, and it
does not establish behaviour outside the flags-on loopback fixture.

## Open items before this draft can land

1. Family seats (one per PLAN family) run their own throwaway probes and return `probes/<family>.json` plus case entries. Until
   then every Observed cell stays `TBD-observed`.
2. S077+ source rows for: required-check, number range, select multiple, checkbox, radio, text constraints, date/time, range/color,
   disabled/hidden, textarea. Each needs a located quote at tag 154.0.8037.97 and an `opened` of 2026-10-21. SOURCES.md is
   append-only and L1 writes it; this seat does not edit it.
3. Replace each `(count TBD)` with the case ids the family seat actually declares. Do not pre-fill counts.
4. Insert the section into SKILL.md (append-only) only through the L1 from this draft.

## Isolation

No production file was written. This is a report file in the lane, the only permitted direct write under PLAN §Writer isolation.
No clone was created. No git or jj command was run. No browser was launched. No tool was installed or updated.

- Clone path: none (report-only seat)
- Branch: none
- Base: 66251bfc1aef393e4aec599e950a8deb867736bb (lane baseline, unchanged)
- Commit: none
- Changed paths: `.ufo/waves/round-19/w1/ScribeSkillTable.md` (this file, new)
