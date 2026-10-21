# DV-15 semantic review

## Verdict: DISAGREE — the declared proposition is too broad and its answer is false

The retained Chromium 154 source confirms that a *single-checkbox* validator calls `ToBoolean`, but that helper is not boolean-only. The accepted-value claim in DV-15 (“single checkboxes take booleans only”) is contradicted by the same decoded body. The receipt supports rejection of the three particular strings tested; it does not support a universal claim that strings are rejected.

## Evidence

### Source proposition

S077 is the pinned Chromium `154.0.8037.97` source, opened `2026-10-21`; its recorded decoded-body SHA-256 is `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` (`corpus/SOURCES.md:91`). I independently decompressed the retained `form_mcp_schema.cc.gz`; its decoded SHA-256 matches that value.

At body lines 337–343, `ValidateCheckboxData` says “Single checkboxes are represented as a boolean in the schema.” and returns `ToBoolean(value, unused)` for a one-control name. That describes the schema and validator dispatch—not an exclusive JSON-boolean type rule. The helper at lines 71–92 accepts JSON booleans, values accepted by `AsInteger` (converting nonzero to true and zero to false), and strings equal to `true`/`false` ignoring ASCII case or exactly `1`/`0`; other strings fail. `FillCheckboxData` uses the same conversion to set `checked` (body lines 960–985). Thus `"true"`, `"TRUE"`, `"false"`, `"1"`, `"0"`, and integer values accepted by `AsInteger` are source-accepted; they are not included among DV-15's probes.

The source also explains timing: `FillData` validates every input before applying values and returns on the first invalid input (body lines 208–231). Its string error template is selected only when `ToString` succeeds. Null/array/object inputs are rejected by `ToBoolean` but `ToString` does not stringify them, so the source predicts an unquoted `Invalid value for parameter <name>` error; DV-15 has no null/type probes. These are source-derived, not runtime-reproduced here.

Source citation: [Chromium 154 `form_mcp_schema.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), access date 2026-10-21, decoded SHA-256 above. Exact decision token `ToBoolean(value, unused)` is present in lines 337–343, but that token alone does not reveal the helper's coercion rules; the helper lines must also be considered.

### Runtime proposition in the retained receipt

The receipt identifies Chromium `154.0.8037.97` / Playwright `1.64.0` / Node `24.21.0`. In `receipt.json`:

- `decl-checkbox-03` sends `"checkbox-choice"` for both controls and reports `toolResponded.status=Error`, `Invalid value "checkbox-choice" for parameter withValue`, `submitCount: 0`, and both checkboxes unchecked (`:190–249`).
- `decl-checkbox-04` does the same for `"on"` (`:252–311`).
- `decl-checkbox-05` does the same for `"unrelated"` (`:314–373`).
- The in-family control `decl-checkbox-01` sends boolean `true`, returns `Completed`, submits once, and reports `withoutValue: "on"` and `withValue: "checkbox-choice"` (`:56–123`).

Those are honest observations for the named inputs. They do not establish rejection of *every* string. Each counted failure supplies the same invalid value to both `withoutValue` and `withValue`; the raw receipt reports the first failure on `withValue`. The separately recorded isolated probes in `probes/checkbox.json:96–102` cover each control individually, but they are not the `probeCases` named by DV-15 or records in the committed receipt, so they do not broaden the counter-bound evidence.

### Manifest, prose, IDs, and counter

- `decisions.json:369–393` and `SKILL.md:2074` both state the overbroad condition and “booleans only” answer. The knowledge note repeats “Checkbox (single): booleans only” and gives `"on"`/the control value as rejected (`corpus/knowledge/webmcp-declarative-validation-round-19.md:57–58`). The SKILL's derived instruction “send checkboxes as booleans” (`SKILL.md:2088–2091`) is safe as schema-conforming advice, but should not be read as exhaustive implementation behavior.
- The three probe IDs (`decl-checkbox-03`, `-04`, `-05`) are distinct and occur only under DV-15 in the decisions inventory; `decl-checkbox-01` is an in-family `Completed` control. The manifest's probe-ID uniqueness requirement is checked in `measure-c1.mjs:564–576`, and the case/control family, expected outcome, fresh-vs-committed record and completion checks are in `:635–713`.
- The source binding is strong for identity/integrity: `measure-c1.mjs:579–610` checks S077 status/date, body digest and the token's presence in the declared lines. But this is a literal token check, not semantic entailment. The counter compares case expectations and observations for status, error substring, submit count, and a successful control; it does not parse the free-text condition/answer or notice that `ToBoolean` also accepts values. Therefore it can faithfully reproduce all three failures and still admit the false generalization.

## Exact correction recommended

Replace DV-15's condition with: **“In the checkbox fixture, the tested strings `checkbox-choice` (the explicit value), `on` (the default value), and `unrelated` are rejected for `withValue`.”**

Replace its answer with: **“Each named probe returned `toolResponded: Error` with `Invalid value \"<v>\" for parameter withValue` before submit (`submitCount: 0`). This does not mean strings are categorically rejected: Chromium 154's single-checkbox path also coerces booleans, `AsInteger` values, and the strings `true`/`false` (ASCII-case-insensitive), `1`/`0`; those coercions are source-derived and unprobed in this receipt.”**

Make the same correction in the SKILL table and knowledge-note type summary. Keep “send checkboxes as JSON booleans” only as guidance to follow the declared boolean schema, and clarify that it is not a complete inventory of accepted implementation values. If the decision is intended to state the broader coercion contract, add runtime cases for the accepted coercions and rejected null/non-coercible types; the current case set cannot establish that matrix. Add the helper lines (`71–92`) as an explicit companion source anchor so the decision records the conversion semantics, not only the call site.

## Residual risk and verification gaps

- Null, arrays/objects, integers, and coercible strings were not in the committed checkbox cases; their behavior above is source-derived only. No browser or full C1 counter was run for this semantic review, as assigned.
- LSP is unavailable in this session (`xd://lsp` is not a mounted device); literal search was used only to locate prose mentions. Source semantics were checked from the retained decoded body, not inferred from grep.
- No tools were installed or updated.

## Isolation

Report-only seat: wrote only the assigned report `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/Decision15.md`. No production clone, branch, commit, or production-path modification was made.