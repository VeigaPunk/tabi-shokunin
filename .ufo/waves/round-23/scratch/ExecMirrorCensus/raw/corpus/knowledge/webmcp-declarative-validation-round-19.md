source: S077 — Chromium 154.0.8037.97 `form_mcp_schema.cc` FillData/ValidateParameterData/per-type validators — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT ; retained body `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz` (decoded sha256 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f)
source: S078 — Chromium 154.0.8037.97 `html_form_element.cc` HTMLFormMcpTool (fill call, autosubmit, `Form validation failed`) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT ; body `corpus/evidence/round-19/sources/html_form_element.cc.gz` (8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916)
source: S079 — Chromium 154.0.8037.97 `WebMCP.pdl` (invokeTool `object input`, toolResponded) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl ; body `corpus/evidence/round-19/sources/WebMCP.pdl.gz` (26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff)
source: S082 — WHATWG HTML input element value sanitization — https://html.spec.whatwg.org/multipage/input.html ; body `corpus/evidence/round-19/sources/input.html.gz` (9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4)
source: S083 — WHATWG HTML form control infrastructure (constraints, submission) — https://html.spec.whatwg.org/multipage/form-control-infrastructure.html ; body `corpus/evidence/round-19/sources/form-control-infrastructure.html.gz` (af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92)
source: S091 — Playwright v1.64.0 `browserType.ts` artifact directory (`playwright-artifacts-*` under `os.tmpdir()`) — https://github.com/microsoft/playwright/blob/v1.64.0/packages/playwright-core/src/server/browserType.ts (line 161)
source: own-work — `scripts/webmcp-validation-round19.mjs`, `corpus/evidence/round-19/validation/` (cases, fixtures, probes, `decisions.json`, `receipt.json`)
verified-at: 2026-10-21 (round 19; Chromium 154.0.8037.97, Playwright 1.64.0, Node v24.21.0; loopback fixtures, WebMCP flags on, one fresh context per case)
recheck: on chromium package change — re-run `node scripts/webmcp-validation-round19.mjs --out <new path outside the lane>`; S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d

# Declarative WebMCP input validation on Chromium 154 — measured

## Scope

One build (Chromium 154.0.8037.97, Arch package), loopback fixtures, WebMCP enabled by flags, declarative
`<form toolname … toolautosubmit>` tools invoked through CDP `WebMCP.invokeTool` over Playwright's pipe.
Declarative forms are a Chromium surface, not part of the WebMCP specification (S030; the pinned spec text,
S087, defines no schema validator). Not claimed: real sites, other builds, agent-side clients, forms without
`toolautosubmit`, custom elements (FillData returns `true` for them without validation, S077
`form_mcp_schema.cc:289-291`), file inputs (separate runtime flag).

## Method

Fifteen families of 2–6 cases each (66 cases) were authored by separate wave-1 seats in their own clones,
each first probing the browser and setting expectations to what it observed (raw CDP in
`validation/probes/<family>.json`). The harness re-runs every case in a fresh context, records the derived
inputSchema, `toolInvoked`, `toolResponded`, submit events and post-invoke control state, and compares them
with the case expectation. Integration-time edits are named in the round lesson (field reader for unnamed
controls; checkbox field encoding; two added control cases). The 27 decisions in `validation/decisions.json`
were declared before counting; each has unique probe cases, an in-family success control and a source token
verified inside a retained, sha-pinned body.

## What the build does

1. **Two error classes.** Fill-time `kInvalidInputArguments` (S077 `:208-231`): an unknown key, or a value the
   control's validator rejects. All keys are validated before any is applied (`:210` "If the data isn't valid,
   form control states remain unchanged"), so a mixed valid+invalid call changes nothing. The message is
   `Invalid value "<v>" for parameter <name>` when the JSON value stringifies (string, number, boolean) and
   `Invalid value for parameter <name>` when it does not (null, array, object). Submit-time
   `kToolInvocationFailed` (S078 `:729-751`): values were filled, then autosubmit's interactive validation
   failed; the text is `Form validation failed: ` plus `<name>: <validationMessage>. ` per invalid control, and
   the rejected values stay in the form.
2. **Keys.** Parameters are control `name`s (`GetWebMCPParameterName`); an `id` is unknown. Disabled and
   readonly controls are dropped from the control set (S077 `:1241`) — absent from the schema and rejected as
   unknown. `type=hidden` controls are also absent from the schema but are in the control set with no
   validator, so they fail as `Invalid value` rather than unknown. An unnamed control appears as the `""`
   property and is fillable.
3. **Per type.** Number/range: `ValidateNumberData` accepts JSON numbers and numeric strings whose sanitized
   value is non-empty; `"not-a-number"` and `true` fail at fill. The range sanitizer falls back to a default
   instead of emptying, so every tested range input completed: 99 clamps to max `10`, non-numeric becomes the midpoint 5 snapped to step 2 → `6`
   (S082 range state). Number min/max/step violations pass the fill and fail at submit
   (`Value must be greater than or equal to 2.`, `Please enter a valid value. The two nearest valid values are 2
   and 5.`). Large numbers are reserialized (`1.25e+21` → `1.25000e+21`). Date/time/datetime-local: a non-ISO
   string sanitizes to empty and fails at fill; an out-of-range ISO value fills and fails at submit with a
   locale-formatted message. Email/url: malformed strings pass the fill (sanitization keeps them) and fail at
   submit; the derived schema carries no `format`. Color: CSS names are parsed (`red` → `#ff0000`),
   unparseable strings become opaque black `#000000` (S082 colour well). Checkbox (single): booleans only —
   even `"on"` or the control's own value attribute is rejected. Radio: the value must equal an enabled radio's
   value. Select: the option `value` must match (labels are rejected); a `disabled` option is accepted and
   selected because option disabled state is not filtered (contrast radio). Select multiple: an array whose
   members are all option values; a bare string or any non-option member fails.
4. **Text.** `pattern` mismatch fails at submit (`Please match the requested format.`). `minlength`/`maxlength`
   are NOT enforced for agent fills: too-long/too-short apply only to values "last changed by a user edit (as
   opposed to a change made by a script)" (S083 `:323-327`). Text inputs strip CR/LF, textareas normalize CRLF
   to LF (S082 text state "Strip newlines"). Omitting a key leaves the control's current value; `""` clears it.
5. **CDP boundary.** `WebMCP.invokeTool` declares `object input` (S079 `:66`); an array, string or null input is
   refused by the protocol layer (`Invalid parameters`) before Blink, with no invocation id and no page change.

## Decision principles

- Read `toolResponded.status` and `errorText`; a `Form validation failed` error means the form now holds the
  rejected values, a fill-time error means nothing changed.
- Shape inputs from the derived schema but do not trust the schema to describe enforcement: `minimum`/`maximum`
  appear in the schema yet are enforced only at submit; `minlength`/`maxlength`/`format` are not enforced for
  agents at all.
- A page cannot rely on `disabled` options or on length limits to constrain an agent; it can rely on disabled
  or readonly controls being unsettable.

## Download-artifact root (C2 note)

Playwright 1.64.0 launches with an artifacts directory created by
`fs.promises.mkdtemp(path.join(os.tmpdir(), 'playwright-artifacts-'))` (S091 `browserType.ts:161`) and stores
downloads there under a GUID name. A refused-download check must therefore scan that whole directory for any
new file, not search for the suggested filename or a marker; the round-19 invoke successor does this
(`scripts/webmcp-invoke-round19.mjs`, measured by `.ufo/waves/round-19/measure-c2.mjs`).

## Wave-2 correction entry — supersedes the named generalizations above

Source/evidence: `.ufo/waves/round-19/w2/ScribeCoherence.md`, `Decision15.md`, `Decision22.md`,
`SourceS082.md`, `SourceS083.md`, and the `RuntimeCheckbox.*` retained observations.

- The 15 families were selected before probing; the 27 candidate decisions were extracted after
  those probes and declared before counting. Candidate count is not an admission count; the older
  measurement at ea170da3 admitted 24. Final measurements have their own revision-bound receipts.
- **:45-47, hidden inputs:** the rejected fixture input lacks `toolparamdescription`. Nonempty descriptions
  route hidden inputs through S077's text-control path (`:1270-1281`); hidden inputs are not generally
  unsettable. That additional branch was not part of the canonical 66-case cohort.
- **:57-58, checkbox “booleans only”: withdrawn.** Only `"on"`, `"checkbox-choice"` and `"unrelated"`
  were the rejected string probes. S077 `:71-88,337-342` accepts integers and case-insensitive
  true/false/1/0 strings too; the wave-2 supplemental `"true"`/`"false"` calls completed. Prefer JSON
  booleans as schema-shaped input, not as an assertion about every accepted value.
- **:59-60, disabled select:** the option is selected and a submit event completes, but the fixture's
  FormData output omits it (`fields: {}`). Selected, submitted-event, and serialized are distinct facts.
- **:53-55, date/time:** `decl-date-time-05` sets all four bounded controls outside their configured
  bounds at once; all values remain filled, four native validation messages are returned, and no
  submit event occurs. No isolated one-field range experiment is claimed. S078 describes the generic
  validation-error path, not the locale message or every range constraint.
- **:73-75, “format not enforced”: withdrawn.** The tested length limits do not block agent/script fills.
  Email/URL schemas omit `format`, but their native type constraints reject malformed inputs at autosubmit.
- **:64-65, text/textarea source boundary:** input.html's Text/Search algorithm supports single-line
  newline stripping only; textarea CRLF normalization is retained as the fixture's runtime observation,
  not attributed to those input-element lines. Range step-rounding additionally needs input.html
  `:3415-3420`; exact color serialization needs `:3682-3705`, beyond the original abbreviated anchors.
- **:9, recheck:** S077–S079 and S091 are version-pinned source openings; S082/S083 are dated rolling
  Living Standard snapshots, not Chromium-tag-pinned sources. Their registry cadence remains on-release;
  the conflicting 180d annotation above is superseded, not a registry transition.
- S087's registration/spec proposition was already consumed in :17-18; its registry status is now mined
  and used-by names this note. That is source curation, not another runtime capability.

Runtime claims remain one pinned Chromium build on loopback fixtures. A source token existing in an
anchored body does not prove the whole natural-language decision; semantic reviews and these explicit
scope corrections are separate evidence from the numerical counter.

Additional current source qualifications (opened 2026-10-21):

- **S095**, https://html.spec.whatwg.org/multipage/input.html, decoded body
  `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`: supersedes S082's
  incomplete Text/Search/range/color scope and anchors, as recorded in `w2/SourceS082.md`.
- **S096**, Chromium 154 `html_form_element.cc`, same retained body as S078: supersedes the
  ordinary-empty-string reading of S078. Navigation's callback uses a **null String sentinel**;
  a source return is not evidence of completed navigation or an ordinary empty CDP output.
- **S097**, Chromium 154 `inspector_web_mcp_agent.cc:47-64,208-243`, decoded body
  `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475`, supersedes S079's
  abbreviated output description. Success parses JSON or falls back to a string; failure passes a
  null optional-output pointer, so the output field is **omitted**, not JSON `null`.
- **:48-53:** number and range do not share every rejection branch. Number accepts an empty string
  to clear; JSON string `"42"` remains string input and fills text `"42"`, while only the tested
  JSON number `1.25e21` is observed formatted as `"1.25000e+21"`. There is no universal numeric
  string/exponent successful-submission promise; native constraints still run afterward.
- **:35-42:** every supplied entry must pass fill validation before any apply call. The first fill
  error returns early; it need not visit all keys. HTML constraint-invalid values are a later,
  non-rollback stage. “Mixed valid+invalid” there means **fill-invalid**.
- **:59-61:** multiple-select validation requires an array whose scalar-converted option values are
  distinct and present; duplicate/coercion extensions are source-derived, not additional canonical
  runtime cases. A visible label equal to its value is not intrinsically invalid.
- **:81-85:** S091's artifact location applies with no artifactsDir/downloadsPath overrides. Scanning
  artifact roots is tabi evidence policy derived from that placement, not an upstream mandate.

Every corrected decision is now explicitly restricted to its named probe inputs and fixture. Preconditions
such as enabled native controls, no novalidate bypass, the fixture's initial values, no intervening handler
mutation, and its prevented submit listener are not universal browser guarantees. The corrected SKILL table
is the canonical rendering of `validation/decisions.json`; older rows remain visible historical text.

S099 (same Chromium-tag PDL URL/body as source S079 above, `WebMCP.pdl:59-69,109-123`) is the current
canonical-identity row for the `object input` declaration used in :66-67; it explicitly reuses S041 bytes.
S098 similarly qualifies the queued schema-construction reading as S077 implementation reuse. Neither is
claimed as an independent new publisher/source. Original rows remain historical; see round-19 Gate.
