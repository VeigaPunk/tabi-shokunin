# Superseding row for S071 — draft (not written to the registry)

Seat PinS071, round 29 wave w1, 2026-10-26. Trigger: Chromium Dash Stable/Linux
156.0.8078.47 (previous 155.0.8059.84). S071 is pinned at tag 154.0.8037.97 and two of its
three anchored blocks moved; it stays historical and this row carries the 156 reading.

Why S071 and not S077: the frozen `check-release-pins.mjs` resolves a drifted row only through
`entry.superseded_by` naming a row whose `teaches` opens `supersedes S071 —` and whose source
cell carries `refs/tags/156.0.8078.47/`. S077 already supersedes S071 but is itself pinned at
154, so it cannot resolve the drift. This row therefore opens with S071's id and records S077
as the previous supersession in its own text.

Id `S1NN` is a placeholder for the integrator to allocate. `pins/S071/entry.json` ships
`"superseded_by": null` because the template this seat was given fixes that literal shape;
once this row lands with a real id, `entry.superseded_by` must be set to it, otherwise the
counter reports `s1-drift-unsuperseded` for S071 (verdict computed `drifted`, resolved false).

## The row (11 cells)

| S1NN | Declarative input validation at Chromium 156 — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | code | A | Chromium 156 re-pin of the S071 declarative-validation anchor: FillData rejection, form fill and imperative execute re-read at the new tag, source-level | tag 156.0.8078.47; form_mcp_schema.cc:208-243 unchanged, decoded sha256 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f; html_form_element.cc:193-269 was 192-258 with a 10-line detached-document guard inserted at 201-209, decoded sha256 2a96a97b…6102; model_context.cc:561-564 was 562-565 and 748-807 was 752-811 with the const reference on the invocation id dropped at 749, decoded sha256 94d08636…8aa3; dossier .ufo/waves/round-18/sources/DeclarativeValidation.md describes the 154 tag only | supersedes S071 — re-pinned at Chromium 156.0.8078.47: FormMCPSchema::FillData still rejects unknown parameters and invalid supported values, since form_mcp_schema.cc is byte-identical at both tags, the form-fill path now aborts with kToolInvocationFailed when the document was detached while filling, and imperative ExecuteV8Tool still parses JSON without applying a declared inputSchema. S077 had already extended S071 to every validator branch at 154. This is source-derived, not a JSON Schema validator or a runtime probe | mined | 2026-10-26 | on-release | corpus/knowledge/source-recheck-round-18.md, corpus/knowledge/harness-hardening-round-18.md |

## Located quote from the 156.0.8078.47 bytes (13 words)

`third_party/blink/renderer/core/html/forms/html_form_element.cc:204-208`, in
`HTMLFormElement::HTMLFormMcpTool::ExecuteTool` — the guard the 154 anchor did not contain:

> `return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed, "The document was detached while filling out " "the form")));`

## Recheck note per citing knowledge entry

- `corpus/knowledge/source-recheck-round-18.md:172` (the S071 row of its §7 supersession
  table). Substance still holds at 156: form_mcp_schema.cc is byte-identical, so "declarative
  FormMCPSchema::FillData rejects unknown parameters and invalid supported values" and the
  imperative/declarative split are unchanged. What it now gets wrong is locational: it points
  at `sources/DeclarativeValidation.md`, whose call-path line numbers are 154 numbers — the
  quoted `html_form_element.cc:192/237/245-247/249/258` land at 193/248/254-258/260/269 at
  156, and `model_context.cc:562-565` is now 561-564. Its own text carries no line numbers, so
  no sentence in it is false, only unmoored from the tag it was written against.
- `corpus/knowledge/harness-hardening-round-18.md:86-89`. Substance still holds at 156: the
  narrowing of the no-inputSchema-check observation to imperative tools stands, and
  "declarative form input has source-level parameter validation" is still evidenced by the
  identical form_mcp_schema.cc. What it now gets wrong is authority: it treats "Superseding
  S071" as the live statement, while at 156 the live one is this row (S077's extension
  included), and it attributes the validation to no tag at all, so a reader cannot tell the
  claim was checked at 154 only.

## Out of scope here

`corpus/README.md:393` also names S071; it is not a knowledge entry, so it carries no recheck
note. No registry line, knowledge file or README line was edited by this seat.
