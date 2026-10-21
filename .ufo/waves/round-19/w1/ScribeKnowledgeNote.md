source: S030
source: S031
source: S042
source: S043
source: S071
source: S073
source: S074
source: S041
source: S077-S0NN (round-19 validation rows; opened 2026-10-21; not yet minted — see §Method)
verified-at: pending (round 19 DRAFT; set to the receipt's run date at integration; Chromium 154.0.8037.97, Playwright 1.64.0, Node v24.21.0, loopback fixtures only)
recheck: on chromium package change; S042/S071/S041/S074 on-release (tag-pinned at 154.0.8037.97); S030/S031/S073 on-release (editors' repo, pinned to the commit cited in SOURCES.md); S077+ on-release

# Declarative WebMCP input validation on Chromium 154 — loopback decision table (round 19)

**Status: DRAFT skeleton. Locally measured: not yet.** Every per-family finding below is `TBD` until
`corpus/evidence/round-19/validation/receipt.json` exists with `pass: true` for the case that backs it.
Nothing in this draft is a runtime claim. The only runtime-grade facts it carries are the round-17
receipt rows named in §Scope, cited by their own receipt, not re-measured here.

This note answers one question: **when a page declares a tool through an HTML form
(`toolautosubmit`, `tooldescription`, `toolname`) and an agent invokes it over CDP, which invalid
inputs does Chromium 154 reject before the page's own code runs, and what exact status and error text
does the invoker observe?** It extends `knowledge/webmcp-invocation-round-17.md`, whose decision
table answers "input is never checked against `inputSchema`" for imperative tools only, and it
supersedes the round-17 row's universal reading through S071.

## Scope and boundary

What the note covers:

- One Chromium build: `154.0.8037.97` at `/usr/bin/chromium` (launcher; the executable it execs is
  recorded in the receipt's `.runtime.observed.chromium`, as in round 17).
- One driver: Playwright `1.64.0` with `context.newCDPSession(page)` over Playwright's pipe. No TCP
  DevTools port (see `knowledge/harness-hardening-round-18.md` §Rules, rule 3).
- Loopback fixtures only, served from `http://127.0.0.1:<ephemeral>`, with `--host-resolver-rules`
  denying every other host and `externalRequestCount` recorded as zero.
- Flags as in round 17: `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`
  and `--enable-blink-features=WebMCP,WebMCPTesting`. S074 records that `DeclarativeWebmcp` has no
  entry in the 154 `runtime_enabled_features.json5`, so the token's effect is itself a runtime
  question; the round-17 receipt's `declarative-form` case (`invoke-declarative-form`, `pass`) is the
  only existing evidence that a declarative tool is reachable under these flags.
- Private temporary profile, private TMPDIR and HOME. The operator's Chrome profile is not touched.

What the note does **not** cover is listed in §What is NOT claimed. In particular: no real site, no
default profile, no agent-side consumer, no Chromium other than 154.0.8037.97.

**Declarative is not spec.** The WebMCP editors state that the declarative form API is outside the
specification (S030, `README.md` line 319, §Future Exploration: Declarative API). Every row below is
implementation evidence of one build. A row may cite the spec only for the imperative `executeTool`
behaviour that S043 defines. It may never cite S043 or S030 as the source of a declarative
validation rule.

**Two sources disagree on the scope of input validation; this note takes the narrower reading.**
S042 says `input is never checked against inputSchema` for the 154 Blink invoke path. S071, which
supersedes S042, narrows that claim to imperative tools: the imperative `ExecuteV8Tool` parses JSON and
does not apply the declared schema, while the declarative `FillData` path rejects unknown parameter
names and invalid supported values before the tool executes (S071 `form_mcp_schema.cc:208-243`;
`corpus/SOURCES.md:85`). The round-17 imperative observation (`invoke-input-schema-mismatch`, `Completed`
with `echo:undefined`) stays valid for imperative tools. It is not evidence about declarative tools.

## Method

### Source basis (opened; quotes ≤25 words, anchored)

| Row | What it establishes | Anchor (exact) | Status |
|---|---|---|---|
| S071 | Declarative unknown-parameter rejection | `form_mcp_schema.cc:216-219` in `FormMCPSchema::FillData`: `return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments, StrCat({"Input contains a parameter \"", parameter_name, "\" but there is no such parameter for the tool"}));` | mined (round 18); decoded sha256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`; dossier `.ufo/waves/round-18/sources/DeclarativeValidation.md` |
| S071 | Declarative invalid-value rejection | `form_mcp_schema.cc:224-226`: `return ScriptToolError(ScriptToolErrorCode::kInvalidInputArguments, StrCat({"Invalid value \"", string_value, "\" for parameter ", parameter_name}));` | mined (round 18), same dossier |
| S071 | Order of checks | Unknown names checked at `:214-220`, invalid values at `:221-231`, values applied only after both loops pass at `:234-241` | mined (round 18), same dossier |
| S071 | Call path to the check | `webmcp_handler.cc:58-116` → `local_frame_mojo_handler.cc:987-1000` → `model_context.cc:528`, `:562-565` → `:695` → `:719` → `html_form_element.cc:174, 192, 237, 245-249, 258` → `form_mcp_schema.cc:208-243` | mined (round 18); static chain, [INFERENCE] until observed |
| S042 (superseded by S071) | Imperative invoke path has no `inputSchema` check | `model_context.cc:748-811` | mined; supersession recorded in SOURCES |
| S031 / S073 | The proposal leaves form-to-schema synthesis TBD; Chromium "is implementing a loose version and will conduct testing/trials" | `declarative-api-explainer.md` lines 108-115 at `51ed7565` | mined; S073 says this is not a shipment assertion |
| S074 | `DeclarativeWebmcp` absent from the 154 runtime-features file | `runtime_enabled_features.json5` lines 7023-7050 | mined; absence alone does not prove inertness |

The S071 dossier records one finite counterexample by reading only: a declarative form tool with
`<input name="x">` invoked with `input: {"y":1}` should reach the unknown-parameter rejection and not
execute. That is a static prediction. It becomes a receipt row only when a case observes it.

### Harness and receipt (planned, not yet written)

- Harness: `scripts/webmcp-validation-round19.mjs` (single writer, owned by the family/executor seats
  through the L1 integration). It reuses round 18's guarded launch: pinned Playwright, pipe CDP,
  host-resolver deny, `acceptDownloads: false`, signal abort exit 2, and one idempotent cleanup.
- Cases: `corpus/evidence/round-19/validation/cases/<family>.json`, schema
  `tabi-webmcp-validation-cases-v1`. Each case has `expect.status` (`toolResponded.status` or
  `no-response`), `expect.errorTextIncludes`, `expect.submitCount`, `expect.fields` (post-invoke form
  state), and `expect.schema` (dot-path values in the `toolsAdded` input schema).
- Fixtures: `corpus/evidence/round-19/validation/fixtures/<family>.html`, loopback only, one
  `<form toolname toolautosubmit>` per tool, a submit listener that records `{agentInvoked, isTrusted,
  fields}` into `window.__obs.calls`, and `event.respondWith(...)` after `preventDefault()` (pattern:
  `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html`).
- Receipt: `corpus/evidence/round-19/validation/receipt.json`, schema
  `tabi-webmcp-validation-receipt-v1`. Per case: `{id, family, input, expected, observed, pass}`.
  Runtime identity and the producer sha256 are recorded in the receipt, not restated in prose.
- Exit codes: `0` all pass, `1` any case failed, `2` could not evaluate.

### Families

Eleven family seats each own one slice of the decision space. Slugs are assigned by the case files,
not by this note. Each family is a `TBD` section in §Per-family findings.

Planned families: checkbox, missing-required, radio, text-constraints, email-url, range,
date-time, disabled-hidden, non-scalar, number-type, textarea-empty.

Family seats write probes under `corpus/evidence/round-19/validation/probes/<family>.json` (raw
`toolsAdded` schema, `invokeTool` reply, `toolResponded` params, form state). Their probes are
throwaway inputs. A probe is never a finding; only the receipt is.

### How a row enters the SKILL decision table

A row counts toward the round-19 target only if all four hold:

1. It sits in `SKILL.md` under the heading `### Declarative WebMCP input-validation decision table
   (round 19)`.
2. It names at least one case id whose receipt entry has `pass: true` and the observed CDP status
   and error text.
3. It cites an `S###` row opened 2026-10-21 whose source is a Chromium 154.0.8037.97 file, or other
   primary source, with a line anchor.
4. The receipt's producer sha256 equals the blob of `scripts/webmcp-validation-round19.mjs` at the
   revision under test, and the runtime identity is Chromium 154.0.8037.97, Playwright 1.64.0, Node
   v24.21.0.

Counter: `node .ufo/waves/round-19/measure-c1.mjs REV` → `c1_validation_rows`. Target ≥ 12.

## Per-family findings

Every family below is `TBD`. The heading carries the question the family answers; the body is filled
from that family's receipt rows only.

### Checkbox — TBD

Question: how does the declarative path treat a boolean-like control (`checked`, multi-valued name)
when the invoker sends a scalar, an array, or an unknown value? Observed: TBD. Receipt cases: TBD.
Source: TBD (cite `form_mcp_schema.cc` `ValidateParameterData` branch for the control type; not read
in this draft).

### Missing required — TBD

Question: does the path reject an omitted parameter whose input has `required` set? The S071 quoted
rejections cover unknown names and invalid supported values, and do not name a missing-required
rejection. So the observed outcome is the finding, whether it is a rejection, a silent default, or
execution with `undefined`. Observed: TBD.

### Radio — TBD

Question: a radio group with one declared name accepts which values? Observed: TBD.

### Text constraints — TBD

Question: do `maxlength`, `minlength`, `pattern` and `required` on a text control change the outcome,
or does the validator check only the value's parse? Observed: TBD. [INFERENCE] from S071's FillData
description: the check is against the form-derived parameter map, not a JSON Schema validator
(`DeclarativeValidation.md` §Claim supported and limits).

### Email and URL — TBD

Question: do `type=email` and `type=url` controls reject a value the browser's own constraint
validation would reject? Observed: TBD. Note that the S071 path checks `ValidateParameterData`, which
is type-specific, so these two types are the ones most likely to differ from the generic text row.

### Range — TBD

Question: does `min`/`max`/`step` on `type=range` or `type=number` reject an out-of-range value? Observed:
TBD.

### Date and time — TBD

Question: do `type=date`, `type=time`, `type=datetime-local` reject a value not in the browser's
normalized format? Observed: TBD.

### Disabled and hidden — TBD

Question: does a `disabled` or `hidden` control appear in the parameter map, and if so does an invoker's
value for it get rejected as an unknown parameter or accepted? Observed: TBD. This family matters
because the parameter map is form-derived: a control the page hides may still be a parameter.

### Non-scalar — TBD

Question: what does the path do with an object or array value for a scalar control? Observed: TBD.
The S071 dossier records that `ParseJSON` then an object check run before `FillData` (`html_form_element.cc:245-247`).
So a non-object top-level input is rejected earlier than any per-field check. Observed: TBD.

### Number type — TBD

Question: does a `type=number` control accept a string that is numeric, a number with leading zeros,
or `NaN`/`Infinity`-spelled strings? Observed: TBD.

### Textarea and empty — TBD

Question: does an empty `<textarea>` submit as `""`, as absent, or as its default text? Observed: TBD.
Empty-string handling is a separate row from the missing-parameter row above, because the parameter
map may hold the name either way.

## Decision principles

These govern how a row is written. They are rules the families and the L1 apply, not outcomes.

1. **Observed status and error text, never a numeric code.** The round-18 harness records CDPSession
   failures from actual `session.send` rejections (round-18 harness note §Wave-2 clarifications). A row
   quotes `toolResponded.status` and the observed `errorText` substring. It never quotes a numeric
   protocol code the harness did not see.
2. **Per tool kind.** Imperative and declarative are different rows. A declarative row never reuses
   the imperative `invoke-input-schema-mismatch` observation, and an imperative row never reuses S071.
3. **Source is a prediction until a case observes it.** A static rejection in the S071 chain is
   written as `[INFERENCE]` until a `pass: true` case shows the status and text. A passing case with
   the wrong status is a failed expectation, not a supporting row.
4. **Expectations are what Chromium 154 did.** The fixture's `expect` is set from the family seat's
   probe output, not from what the seat expected the build to do. A probe that disagrees with the
   source is recorded as a disagreement, not as a fixture bug to silently repair.
5. **Absence is a row.** A control type whose invalid value is accepted is a row with the observed
   `Completed` and the `fields` state. An omitted row would hide the boundary.
6. **Unknown-parameter and invalid-value are distinct rows.** They are distinct rejections in S071
   (`:216-219` and `:224-226`) and the receipt must show which error text fired.
7. **Form state is evidence.** After invoke the harness reads the form's post-invoke element states.
   A value that was rejected must leave the form unchanged; a value that was accepted must match the
   `fields` the page's `respondWith` returned.

## What is NOT claimed

- **Not a JSON Schema validator.** The S071 check is against the form-derived parameter map. Any
  constraint that is not a form-control attribute is outside the claim, unless a case shows it.
- **Not spec behaviour.** S030 places declarative forms outside the specification; S031/S073 say
  form-to-schema synthesis is TBD in the proposal.
- **Not agent-side.** A test harness drives CDP. Whether a real agent would send the same inputs is
  unobserved.
- **Not other builds.** Chromium 152 and any later version are untested. A change to the browser
  binary invalidates every row (see the recheck line above).
- **Not real sites.** Only loopback fixtures owned by the test are invoked. No external request is
  recorded.
- **Not the default profile.** Runs use a private temporary profile.
- **Not Chromium's full type matrix.** Controls the families do not cover are not described; the
  note does not infer their behaviour from the covered ones.
- **Not a rule for `toolautosubmit` absent.** Forms that do not declare `toolautosubmit` are outside
  the families and outside the claim.
- **Not the navigation case.** A declarative tool that navigates is a separate control
  (`invoke-declarative-navigation-result`, round 17 supplementary) and not a validation row.

## Cross-references

- `knowledge/webmcp-invocation-round-17.md`: the invocation predecessor; its decision table row
  "Chromium validated the input against `inputSchema`" is answered "no" for imperative tools, and its
  `invoke-declarative-form` case is the existing declarative reachability evidence.
- `knowledge/harness-hardening-round-18.md`: the harness rules this round's harness inherits.
- `corpus/SOURCES.md` rows S030, S031, S041, S042, S043, S071, S073, S074.
- `.ufo/waves/round-18/sources/DeclarativeValidation.md`: the S071 dossier with the full call chain
  and the normalizer used for offsets.
