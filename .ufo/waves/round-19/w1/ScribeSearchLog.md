# Round 19 — SOURCES `## Search log` and `## Paths` draft (ScribeSearchLog)

Date: 2026-10-21. Lane: tabi-shokunin. Seat: TabiR19-2.ScribeSearchLog-4. Scope: draft only; the L1
(TabiR19-2) integrates these bullets into `corpus/SOURCES.md` (append-only `## Search log`; `## Paths`
new entry). No row, status or `used-by` cell is changed by this draft.

## Input state at drafting (observed)

- `.ufo/waves/round-19/w1/` contains `Src*.md`: **0 of 16** present. `Probe*.json`: **0 of 3** present.
  Present files: `assignments.json`, `plan.json`, `spec.json`, `validation.json`, `record.json`,
  `swarm-registry.json`, `dispatch-attempts.json`, `dispatch-result.txt`.
- Every count below is therefore **TBD**. No count is copied from a plan, a prompt or an expectation.
- Seat roster from `assignments.json` and `plan.json` (the 16 Src seats are all `role: scout`):
  - C1 declarative-validation (14 Src): SrcFormSchemaFill, SrcFormSchemaBuild, SrcFormSchemaTests,
    SrcHtmlFormTool, SrcScriptToolError, SrcCdpToolResponded, SrcDeclExplainer, SrcChromeDeclDocs,
    SrcWhatwgConstraints, SrcWhatwgSubmit, SrcJsonSchemaValidation, SrcSelectFill,
    SrcValueSanitization, SrcWebmcpSpecDecl.
  - C2 harness-hazard (2 Src): SrcPwArtifactsDir (Playwright 1.64.0 artifact/download paths; grounds
    G-H4), SrcSignalsChild (Node v24.21.0 SIGINT/SIGHUP and detached-child semantics; grounds G-H1).
  - C2 probes (3, `executor`, runtime observations, not SOURCES rows): ProbeR18Signals (SIGINT/SIGHUP/
    SIGTERM against round-18 invoke), ProbeR18Witness (freshness-witness refusal tokens for G-F6),
    ProbeR18Download (Playwright `<uuid>` artifact under `playwright-artifacts-*`).
  - Note: the brief's "16 Src*/Probe" matches the 16 Src seats; the 3 Probes are additional, so 19
    wave-1 seat reports are expected for this scope.
- Pre-existing rows the seats were told to reuse before proposing new ones (from the seat prompts):
  S020/S030 (WebMCP spec, editors' README), S031/S073 (declarative explainer; S073 cites `main`),
  S041 (154 WebMCP.pdl invokeTool ordering), S042 and S071 (`model_context.cc`, `form_mcp_schema.cc`
  FillData:208-243, imperative vs declarative validation), S074 (runtime_enabled_features), S059
  (Playwright signal handling), S060 (acceptDownloads), S061 (CDPSession), S063/S070 (Node signal
  listener sentence), S051/S052/S065 (git revision contracts for G-F6). New rows are numbered S077+ by the L1.
- No WHATWG, JSON Schema or Playwright-artifact-directory row exists in the registry at B, so the
  standards and artifact-path seats are expected to propose new rows; that expectation is not an
  observation until their Src*.md files land.

## Draft bullet (a) — declarative-WebMCP validation sources

```
- 2026-10-21 · declarative-validation (TabiR19 wave 1: SrcFormSchemaFill, SrcFormSchemaBuild, SrcFormSchemaTests, SrcHtmlFormTool, SrcScriptToolError, SrcCdpToolResponded, SrcDeclExplainer, SrcChromeDeclDocs, SrcWhatwgConstraints, SrcWhatwgSubmit, SrcJsonSchemaValidation, SrcSelectFill, SrcValueSanitization, SrcWebmcpSpecDecl). Question: which Chromium 154.0.8037.97 code paths, tests and documents decide whether a declarative WebMCP argument is validated, coerced, skipped or refused before the form is submitted, which error status reaches the CDP `toolResponded` surface, and which external standards that path does and does not inherit? Searched chromium.googlesource.com at tag 154.0.8037.97 (`third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` and `.h`, `html_form_element.cc`, `html_select_element.cc`, the script-tool/model-context error definitions, web_tests and WPT directories naming webmcp or toolname, `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`), github.com/webmachinelearning/webmcp (`index.bs` and `declarative-api-explainer.md` at a pinned commit), developer.chrome.com/docs/ai/webmcp and its declarative sub-pages, html.spec.whatwg.org (form-control-infrastructure: constraints and form-submission algorithm; input value-sanitization algorithms), and json-schema.org draft 2020-12 validation. Identified TBD, screened TBD, included TBD (proposed S077–S090, numbered at integration; expected reuse of S041, S042, S071, S073, S074 for anchors already held), excluded TBD. Exclusion reasons, per category: duplicate of an existing anchor (reuse, no new row) TBD; anchor not at tag 154.0.8037.97 or not pinned to a commit TBD; secondary restatement of a spec or docs page where the code row already exists TBD; non-normative proposal text cited as a shipment fact TBD; unreadable or sign-in-gated body TBD. Stop: TBD — each seat stops when its branch map is quoted with line or section anchors and its body digest is recorded; no runtime validation claim follows from a source row, because C1 runtime rows come only from the receipt at `corpus/evidence/round-19/validation/receipt.json`.
```

## Draft bullet (b) — C2 harness-hazard sources

```
- 2026-10-21 · harness-hazard (TabiR19 wave 1: SrcPwArtifactsDir, SrcSignalsChild; probes ProbeR18Signals, ProbeR18Witness, ProbeR18Download, recorded as runtime observations, not as SOURCES rows). Question: which primary contracts say where Playwright 1.64.0 writes downloads and artifacts (the G-H4 scan target), and what Node v24.21.0 does on SIGINT and SIGHUP and to detached children (G-H1); and separately, which refusal reasons the round-18 freshness witness emits (G-F6), which the probes measure against repository code rather than an external source. Searched playwright.dev (class-download; class-browsertype `artifactsDir` and `downloadsPath`), github.com/microsoft/playwright at tag v1.64.0 (`packages/playwright-core/src/server` artifact and download code), raw.githubusercontent.com/nodejs/node/v24.21.0 (`doc/api/process.md` signal events; `doc/api/child_process.md`), and, for G-F6, the committed `scripts/freshness-witness.mjs` plus existing rows S051, S052 and S065. Identified TBD, screened TBD, included TBD (proposed rows only for distinct anchors: Playwright artifact-directory naming, SIGHUP, SIGINT terminal semantics, detached/process-group kill; S059, S060, S063 and S070 are reused where the sentence is already held), excluded TBD. Exclusion reasons: restatement of a held row TBD; Node 24.22 or later async clarification outside the pinned scope TBD; probe output cited as a source TBD (probe output is not a source; it is recorded in `.ufo/waves/round-19/w1/Probe*.json`). Stop: TBD — the seat stops once the pinned line anchors are quoted and the probe table has one row per signal and per witness shape; G-F6 has no separate source seat, so its stop rests on the witness code lines the ProbeR18Witness seat cites.
```

## Draft `## Paths` entry — declarative-validation

```
- `declarative-validation` — S0?? (SrcFormSchemaFill) → S0?? (SrcFormSchemaBuild) → S0?? (SrcHtmlFormTool) → S0?? (SrcScriptToolError) → S0?? (SrcCdpToolResponded) → S0?? (SrcFormSchemaTests) → S0?? (SrcSelectFill) → S0?? (SrcValueSanitization) → S0?? (SrcWebmcpSpecDecl) → S0?? (SrcDeclExplainer) → S0?? (SrcChromeDeclDocs) → S0?? (SrcWhatwgConstraints) → S0?? (SrcWhatwgSubmit) → S0?? (SrcJsonSchemaValidation): why this order: the 154-tag Chromium code comes first, so every later claim is checked against the bytes that actually run — the branch map of FillData (`form_mcp_schema.cc`), then what builds the schema it fills from, then the caller that decides whether a failed fill reaches submission (`html_form_element.cc`), then the error channel (ScriptToolError and the CDP `toolResponded` status), which is exactly what the receipt's `expect.status` and `errorTextIncludes` fields read; the upstream tests (`SrcFormSchemaTests`) come after the code map so each asserted input→outcome pair is compared with a branch already mapped; the delegated value setters (`select`, value sanitization) come next because FillData hands them the values and they predict the post-fill `fields` state; the non-normative layer follows (WebMCP spec, the editors' declarative explainer, Chrome's own docs), because S030 and S073 say the declarative surface is outside the spec and only implemented loosely, so these may describe the surface but cannot decide it; the external standards come last (constraint validation, form submission, JSON Schema validation) because they explain why a Chromium outcome differs from what a spec-literal reader would expect and never decide a 154 outcome on their own. Ends at a round-19 knowledge note whose name the L1 chooses (PLAN.md names no file); the C1 runtime rows then cite that note and the receipt.
```

Each `S0??` maps to its seat as shown; the L1 replaces the placeholders with S077+ in the order the seats are
integrated. Reused rows (S041, S042, S071, S073, S074) keep their existing IDs and do not consume a new number.

## Integration notes for the L1

1. Append the two search-log bullets (a) and (b) to `corpus/SOURCES.md` `## Search log` only after the
   16 `Src*.md` files exist and their counts are in hand. Replace every `TBD` in the bullets; do not
   leave a count the seats did not report.
2. Add the `## Paths` entry after the existing `jj-colocated-anchor` line, with placeholders replaced.
3. The `Leads (unopened)` section is out of scope for this draft; any seat-reported lead should be
   appended there by the L1.
4. Counts must be re-derived from the Src files, not copied from this draft. Shape check before landing: identified must equal screened; screened must equal included + excluded; every included S-number must have a registry row with `opened` 2026-10-21.

## Findings (scoped to this draft)

- The round-19 C1 search is a source search for anchors that do not yet exist in the registry; the registry
  already holds S071 (`FillData:208-243`) for the imperative/declarative split, so the 14 C1 seats must add
  new anchors (branch map, error channel, WHATWG rules, JSON Schema keywords) rather than re-cite S071.
- The WebMCP spec and editors' README say the declarative form API is outside the specification (S030; the explainer's schema synthesis is TBD, S031/S073). Chrome's developer docs had not been read at drafting (SrcChromeDeclDocs has no output yet), so the claim that they describe form-attribute semantics is an expectation, not an observation. The draft's bullet (a) therefore records "non-normative" as a distinct exclusion category, separate from "not at tag", so a reviewer can see which exclusions were spec-based.
- The C2 bullet separates two evidence kinds on purpose: sources (Playwright and Node contracts) and probes
  (runtime observations). Probe output must not be counted in `included`. G-F6 has no source seat and is
  stated as such.

## Isolation

- Production files written: none. This is a seat report file only.
- Clone path: n/a (no production file). Branch: n/a. Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (B).
  Commit: n/a.
- Changed paths: `.ufo/waves/round-19/w1/ScribeSearchLog.md` (report file in LANE, the only direct write).
- No jj or git write in LANE; no subagent dispatch (leaf seat); no tool install or update.
