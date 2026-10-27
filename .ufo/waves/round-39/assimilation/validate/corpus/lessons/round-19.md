# Round 19 — declarative WebMCP validation measured, download evidence bound, routed corrections

Steered round 19, attempt 1, hyaku phase 2, 2026-10-21. Baseline `66251bfc1aef393e4aec599e950a8deb867736bb`. L1 TabiR19-2 holds the
canonical planner seat. Claims: C1 depth (8, lowest tie) — runtime-verified declarative-WebMCP validation
decisions; C2 operability (8, lowest tie) — download-evidence binding properties (artifact-root scan, per-run
nonce) in `scripts/webmcp-invoke-round19.mjs`; C3 calibration (9) — four non-code routed defects (LOG count,
SCORECARD assertion wording, registry wave labels, writer isolation). No exploratory claim. Motivating record:
LOG.md round-19 entry. Pointers beginning `w1/`/`w2/` resolve beneath `.ufo/waves/round-19/`.

## Gate

C1 admits a decision only from the predeclared manifest `corpus/evidence/round-19/validation/decisions.json`
(27 decisions): unique probe cases, an in-family Completed control, observed status/errorText/submitCount
re-checked on a fresh reproduced receipt, and a source token verified inside a sha-pinned retained body cited
by a SOURCES row opened today. Candidates considered: 15 families / 64 seat cases + 2 L1 control cases.
Admitted: 27 decisions. Rejected as decisions (observed, not counted): the unnamed-control `""` property (no
invalid-input contrast), the null-key ordering in `decl-non-scalar-01` (the `text_null` key did not reach
`toolInvoked`; cause unresolved, so no claim), `month` malformed input (no case), custom elements and file
inputs (not exercised). Rejected framings: "Chromium enforces inputSchema" (it enforces per-control
validators and HTML constraints, not JSON Schema; `format` absent), "decisions = rows" (CriticC1Depth).

C2 admits a property only if red under the round-18 harness/counter and green on the round-19 successor with
the mutant rejected. H1 (SIGINT/SIGHUP) and F6 (refusal shapes) are informational coverage: the behaviour was
already present at the baseline (w1/ProbeR18Signals.json, w1/ProbeR18Witness.json), so crediting them would
book counter coverage as runtime operability (CriticC2Operability).

C3 admits a routed defect only when `.ufo/waves/round-19/measure-c3.mjs` re-derives it from committed bytes.

### Sources opened this round

| Row | URL | Access | Located quote (≤25 words) | Location | sha256 (decoded body) | Dossier |
|---|---|---|---|---|---|---|
| S077 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-21 | ""\" but there is no such parameter for the tool"}));" (10 words) | form_mcp_schema.cc:219 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | w1/SrcFormSchemaFill.md, w1/SrcFormSchemaFill.gate.json |
| S078 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-21 | "// With the `toolautosubmit` attribute, we immediately submit the form." (9 words) | html_form_element.cc:219 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | w1/SrcHtmlFormTool.md, w1/SrcHtmlFormTool.gate.json |
| S079 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT | 2026-10-21 | "Output or error delivered as delivered to the agent. Missing if `status` is anything other than Completed." (17 words) | WebMCP.pdl:116 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | w1/SrcCdpToolResponded.md, w1/SrcCdpToolResponded.gate.json |
| S080 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/script_tool_types.h?format=TEXT | 2026-10-21 | "kInvalidToolName, kInvalidInputArguments, kMissingRequiredSubmitButton, kToolInvocationFailed, kToolCancelled," (5 words) | third_party/blink/renderer/core/script_tools/script_tool_types.h:17-21 | `ee9006f7cc92f6451ff3fc9a0930d55bd291bb27a263c26aa8a7b4d2774ca25d` | w1/SrcScriptToolError.md, w1/SrcScriptToolError.gate.json |
| S081 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc?format=TEXT | 2026-10-21 | "return -1;" (2 words) | html_select_element.cc:882 | `c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e` | w1/SrcSelectFill.md, w1/SrcSelectFill.gate.json |
| S082 | https://html.spec.whatwg.org/multipage/input.html | 2026-10-21 | "number</a>, then set it to the empty string instead." (9 words) | input.html decoded body:3229 — §4.10.5.1.12 Number state, value sanitization algorithm (clause tail; sentence begins on 3228 with "…is not a valid floating-point…") | `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` | w1/SrcValueSanitization.md, w1/SrcValueSanitization.gate.json |
| S083 | https://html.spec.whatwg.org/multipage/form-control-infrastructure.html | 2026-10-21 | "its value was last changed by a user edit (as opposed to a change made by a script)" (16 words) | maxlength constraint, decoded body lines 325-326 (tags stripped) | `af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92` | L1 TabiR19-2 from retained `w1/SrcWhatwgConstraints.body.gz`; dossiers w1/SrcWhatwgConstraints.md, w1/SrcWhatwgSubmit.md |
| S084 | https://json-schema.org/draft/2020-12/json-schema-validation | 2026-10-21 | "The value of format MUST be collected as an annotation, if the implementation" (13 words) | §7.2.1 + decoded body line 2051 | `bc982a03be9ba4e7da597a0f10dc00614aa28dc413e6981186405473981fd267` | w1/SrcJsonSchemaValidation.md, w1/SrcJsonSchemaValidation.gate.json |
| S085 | https://developer.chrome.com/docs/ai/webmcp/declarative-api | 2026-10-21 | "Map elements to a property description within the JSON Schema." (10 words) | §(Optional) Tool parameters; decoded retained body line 4333 (toolparamdescription list item) | `cc00b2e92a1ec0ac24d2a20c118b88e2f9209f7ad092f6521767a2039304cafb` | w1/SrcChromeDeclDocs.md, w1/SrcChromeDeclDocs.gate.json |
| S086 | https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md | 2026-10-21 | "supplies the name of each "property" in the input schema generated for a declarative tool." (15 words) | declarative-api-explainer.md:62 | `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` | w1/SrcDeclExplainer.md, w1/SrcDeclExplainer.gate.json |
| S087 | https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | 2026-10-21 | "The input arguments could not be parsed into a JavaScript Object." (11 words) | index.bs:276-278 (Supporting concepts, tool execution error table) | `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004` | w1/SrcWebmcpSpecDecl.md, w1/SrcWebmcpSpecDecl.gate.json |
| S088 | https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts | 2026-10-21 | "(input.errorText ? createErrorText(input.errorText) : nothing)))}" (5 words) | front_end/panels/application/WebMCPView.ts:1041 (errorText fallback arm of the precedence ternary spanning 1040-1041) | `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` | w1/RevDeclErrorSurface.md, w1/RevDeclErrorSurface.gate.json |
| S089 | https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/generated/protocol.ts | 2026-10-21 | "export const enum InvocationStatus {" (5 words) | front_end/generated/protocol.ts:20223-20227 (enum values Completed/Canceled/Error at 20224-20226) | `2d77790a775f2db3de2842cea1c37509a2fb535d3e737214d8c462a08c47267d` | w1/RevDeclErrorSurface.md, w1/RevDeclErrorSurface.gate.json |
| S090 | https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.test.ts | 2026-10-21 | "Protocol.WebMCP.InvocationStatus.Error, undefined, 'Permission denied', undefined)," (5 words) | front_end/panels/application/WebMCPView.test.ts:294 (invocationId '3' fixture; Result construction spans 293-294) | `0c3dd754229d4fb2b51d8836cc643a5352e96f93d967d7c5cc74b739a1daded8` | w1/RevDeclErrorSurface.md, w1/RevDeclErrorSurface.gate.json |
| S091 | https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/src/server/browserType.ts | 2026-10-21 | "artifactsDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'playwright-artifacts-'));" (5 words) | packages/playwright-core/src/server/browserType.ts:161 | `f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e` | w1/SrcPwArtifactsDir.md, w1/SrcPwArtifactsDir.gate.json |
| S092 | https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md | 2026-10-21 | "On non-Windows platforms, if `options.detached` is set to `true`, the child process will be made the leader of a new process group and session." (24 words) | doc/api/child_process.md §options.detached lines 912-915 | `32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a` | w1/SrcSignalsChild.md, w1/SrcSignalsChild.gate.json |
| S093 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-21 | "Dates MUST be provided in 'YYYY-MM-DD' format." (7 words) | form_mcp_schema.cc:583 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | w1/SrcFormSchemaBuild.md, w1/SrcFormSchemaBuild.gate.json |

| S094 (rejected) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT | 2026-10-21 | "NOT_FOUND: Requested entity was not found" (6 words) | 404 response first line; retained `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` | `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` | w1/SrcFormSchemaTests.md; L1 re-fetch |

Status at entry: S077, S078, S079, S082, S083, S091 mined (used-by the round-19 knowledge note); the rest
queued; S094 rejected (HTTP404). S077 `supersedes S071 —` (stronger: every validator branch, runtime-verified), S071 stays historical.
Excluded: `form_mcp_schema_unittest.cc` (404 at the tag); `html_form_mcp_tool_test.cc` (the seat's gate quote
came from `form_mcp_schema.cc`, not the test file — kept as a lead); the second WHATWG dossier merged into S083.
No existing row's status/recheck/used-by changed. Census at start: `tabi ok`, exit 0, rows 76.

## Corrections

- `LOG.md:1059` "QUALITY33–38" → QUALITY 33–39 (seven criteria; `corpus/QUALITY.md:140-165`); appended in
  LOG round 19, the old entry unchanged. Count re-derived by command (LOG round-19 entry).
- `SCORECARD.md:830` and the filed round-18 report line 8 ("retains all11 original scenarios") → case IDs and
  pass status retained; 6 of 15 checks dropped numeric CDP codes (five to message substrings, one to a
  nonempty-message check). Recorded as a SCORECARD round-19 line; the filed report is not rewritten.
- Round-18 registries/records `wave: null` (four files) — cause and reproduction in
  `.ufo/waves/round-19/corrections/r18-registry-wave-null.md`.
- Spot-check routed 3 premise check: the round-18 H4 scan matched marker bytes, not the suggested filename
  (w1/ProbeR18Download.md, harness `:745-784`); the gap it named (GUID artifacts, pasted records) is real
  (`.ufo/waves/round-19/c2-mutants/`). H1 SIGINT/SIGHUP and F6 shapes behave correctly at the baseline; the
  gap was counter coverage.

## Mistakes

| Class | Evidence | Captured-by | Fix, including red case |
|---|---|---|---|
| landing | round-18 spot-check routed 2: wave-1 writers in one checkout | addendum §6.2 only; no QUALITY criterion | clone-per-writer + `isolation/check-isolation.mjs` ledger; self-test rejects shared clone, base drift, out-of-scope path, duplicate branch (`corpus/evidence/round-19/selftests/isolation.json`); QUALITY 45 |
| number-drift | `LOG.md:1059` 33–38 vs seven criteria | QUALITY 34 (violated in the round that wrote it) | correction line + C3 d1 counter; its self-test rejects the 33–38 line; QUALITY 43 |
| number-drift | `SCORECARD.md:830` "retained" hid six loosened predicates | none | C3 d2 re-derives 6 = 5 substring + 1 nonempty from both harness sources; wrong-list mutant rejected; QUALITY 43 |
| attribution | round-18 registries `wave: null` | none | correction note; C3 d3 rejects a null/mismatched wave and null agentId; QUALITY 44 |
| survivor | round-18 H4 credited a replayed receipt and a planted GUID artifact (`c2-mutants/`) | QUALITY 25 (insufficient) | round-19 successor scans the artifact root and binds a counter nonce; C2 counter mutants; QUALITY 40 |
| vacuous | H1/F6 credited from SIGTERM-only / literal-HEAD checks | QUALITY 27 | per-signal/per-shape coverage in the C2 counter; QUALITY 41–42 |
| scope | first integration run 55/64: checkbox expectations as booleans vs FormData-like harness fields; unnamed control dropped | none | stated field contract in the harness, seat original retained (`validation/integration/`), full re-run 66/66; QUALITY 46 |
| landing | L1 did not snapshot `git status -uall` at wave-1 return before importing clone files | QUALITY 45 (written this round) | ledger after-state reconstructed from mtimes and marked RECONSTRUCTED; wave-2 snapshot taken at return before any import |
| provider | a probe seat's shell resolved Node 26.12.0 (w1/ProbeR18Download.md); the L1 eval kernel also did | ReviewHarnessGuards (runtime identity) | harness refuses unless Playwright 1.64.0 resolves under Node 24.21.0 (observed `playwright_unresolved` exit 2 under Node 26) |

## Adjacency

No sibling file touched. w1/ConnSiblingWebmcp.md: no sibling holds declarative-WebMCP validation ground
(kaidoku: passive inventory only). L0 lines (tabi round 17: "the-musketeer" CDP lease; ruling reach to
revenger/kama) remain unanswered (w1/ConnL0Status.md); no claim depends on them.

## Seats

Wave 1: 72 seats (scout19/executor26/scribe8/reviewer7/connector6/critic3/revenger2/sentinel1), registry
`.ufo/waves/round-19/w1/swarm-registry.json` (`wave` = `tabi-round-19-w1`). The L1 holds the planner seat;
ConnPlannerWalk carried the planning data-walk. No dead seat. Three job-cap refusals spawned nothing; the
unchanged payload spawned all 72 on attempt 4 (`w1/dispatch-attempts.json`). Same-identity follow-ups: 17
source seats wrote gate JSONs; ExecMeasureC1/C2/C3 and ExecValidationHarness revised their own artifacts in
their own clones.

## Gate correction — continuation writer TabiR19, same held round/attempt

Inherited: committed round-19 checkpoint `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, its wave-1 evidence,
producers, 66-case receipt, 27-candidate manifest and drafted wave-2 specification. Only wave-2 metadata
was untracked at continuation entry. No r18 work was redone. The stale coordinator is parked by Main.
Inherited counts are historical until reproduced; rejected inherited **interpretations** are named below,
not erased. No inherited artifact was silently discarded.

The statement “Admitted: 27” in the initial Gate was premature: the retained ea170da3 measurement was 24,
while wave-2 CriticSeparability subsequently measured 27 at d5cf4d7. Final repaired bytes require their own
measurement. Fifteen families were fixed before probing; 27 decisions were selected after observing probes
and declared before counting. This supersedes “predeclared” where it implied before-probe decisions and
“every validator branch, runtime-verified”: custom elements/files and untested branches remain excluded.

Wave-2 semantic reviews found finite results supported but universal prose overbroad. The manifest and a
new canonical corrected SKILL table explicitly name the exact probe cases for every decision. The old
table is historical, not current guidance. Specific corrections: string-boolean checkbox coercion (DV15),
described hidden inputs (DV05), disabled-option FormData omission (DV13), numeric string versus JSON-number
formatting (DV10), combined four-control date probe (DV22), enabled radio duplicate values (DV17), native
email/URL validation despite absent schema format, optional text clearing/omission, and source-versus-runtime
newline evidence. `ScribeCoherence.md` and the 27 `Decision*.md` reports carry exact source/receipt reasons.

S087 transition: **status queued→mined; used-by —→corpus/knowledge/webmcp-declarative-validation-round-19.md;
recheck unchanged on-release**. Its proposition was already consumed in the note. No other old row's mutable
cells changed. S095–S097 are new supersession rows, not in-place edits of immutable cells:

| Row | Opened URL | Access | Located quote (≤25 words) | Location / retained fresh body |
|---|---|---|---|---|
| S095 | https://html.spec.whatwg.org/multipage/input.html | 2026-10-21 | Strip newlines from the value. | Text/Search 1762-1763; w2/SourceS082.body.gz; decoded sha256 9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4 |
| S096 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-21 | Return a null string | comment at 827; w2/SourceS078.body.gz; decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 |
| S097 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT | 2026-10-21 | nullptr, error.message, | 242; w2/SourceS079.inspector.body.gz; decoded sha256 1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475 |
| S098 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-21 | Dates MUST be provided in 'YYYY-MM-DD' format. | 583; w2/SourceS093.body.gz; decoded sha256 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f |
| S099 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | 2026-10-21 | object input | 66; w2/SourceS079.body.gz; decoded sha256 26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff |

S095 supplies input Text/Search scope and completes range-step/color-serialization anchors; no textarea
authority is invented. S096 corrects navigation's null String sentinel; S097 distinguishes omitted output
from JSON null and records ParseJSON fallback. The source reports reopened their exact primary URLs.
S083's original quote is 18 whitespace words, not 16 (still ≤25); :84's “wave-2 snapshot taken” was future
tense written as evidence and is withdrawn for the inherited checkpoint.

C3 d4 remains **unprovable — missing direct wave-1 return-time snapshot evidence**. The clone/branch/commit
ledger demonstrates scoped writer provenance, but reconstructed status from mtimes cannot establish the
missing observation. The revised C3 counter refuses that reconstruction. Main explicitly affirmed this
honest limit. A later wave snapshot does not retroactively close d4.

## Continuation mistakes and failure-capable repairs

| Class | Evidence | Captured-by | Fix / observed red case |
|---|---|---|---|
| scope | w2/Decision15.md, RuntimeCheckbox.md and supplemental coercion receipts | QUALITY14/27 insufficiently applied | `"true"` and `"false"` each Completed twice, falsifying “booleans only”; finite corrected table, QUALITY47 |
| reference-drift | w2/Decision02.md, Decision10.md, Decision14.md | QUALITY25/30 | counter previously omitted fields/schema/raw response and prose fidelity; strengthened comparisons and corresponding isolated self-test mutants |
| vacuous | w2/MutateC3.md d1-count survivor | QUALITY43 | six-criteria correction was still credited; new exact-cardinality rejection and self-test |
| attribution | w1 reconstructed after-status; w2/ScribeCoherence E07 and MutateC3 d4-clean survivor | QUALITY45 | refuse reconstruction, keep d4 unprovable; QUALITY48; no historical status fabricated |
| survivor | w2/CriticSeparability.md R-C2 normal profile metadata false positive | QUALITY40 | purpose-classify browser state versus download/artifact roots, preserve arbitrary UUID-file refusal; no filename allowlist |
| reference-drift | w2 runtime seats and SentinelValidation: unsupported --fixtures exits 2 | registry command accuracy | corrected native --cases/--out command, sibling regular fixture copies; no new CLI |
| landing | w2/CriticNoHarm NH1: frozen USER refused lessons grow round18→round18+round19 in inherited ancestry | inherited USER lessonDrift | irrecoverable historical M event; no rewrite/rebase/frozen-gate relaxation. Exit equality is not a no-harm proof |
| attribution | w2/CriticNoHarm NH2: punctuation hid source reuse in S079/S093 | source identity/QUALITY38 | disclose shared canonical identities and distinguish S041 protocol/S077 implementation reuse; no source-diversity credit |
| number-drift | w2/ScribeCoherence E13 | QUALITY46 | 9 first-run failures = five checkbox encoding + four disabled-hidden reader mismatches, not nine checkbox failures; QUALITY49 |
| provider | w2/MutateC1 failed_precondition weekly usage quota; SentinelInvoke cyber_policy | wave death rule | dead seats retained by name/error, never replaced; unexecuted attacks remain unexecuted |

No counter, self-test, report, or lane-dispatched review substitutes for the fresh non-author closure.
Quality/no-harm verdicts must explicitly retain both the missing d4 observation and the expanded legacy
USER lesson-history refusal, even if all historical gate exit codes equal the baseline.

S098/S099 additionally supersede S093/S079's punctuation-dependent identities: they explicitly reuse
S077 implementation/S041 protocol bytes. This is corrected curation, **not** independent-source growth.
S098 stays queued; S099 is mined by the current note's protocol-input qualification.
ReviewIsolation additionally found 16 source-evidence writers outside the 23-entry production ledger and
the L1's sixth non-scalar control beyond its seat's 2–5-case assignment. Both are retained conformance
defects; no retroactive waiver or complete-isolation claim is made. The six-case file remains because the
new in-family success control is real, attributed, and necessary for the C1 contrast, not fabricated.
DV07's null-specific source span now includes conversion/fill/text validation (49–328), and its outcome
requires the parameter-specific error. DV19 covers both tooLong and tooShort anchors; S095 supplies the
completed range/color spans. Generic S096 error-path citations do not independently entail each HTML
constraint or localized message: those are finite runtime observations.

## Measured outcome and trend limits

Fresh execution evidence (main L1, after all implementation handoffs): self-tests39/40/26/7 all exit0,
then repaired validation producer66/66, zero findings. Before/after commands at
`f5032f34e3d39da636708199b0f22a838325bbdc` give C1 0→27, C2 0→2, C3 0→3, all evaluated exit0
(`corpus/evidence/round-19/measurements/final.json`). The unchanged nonce-aware no-invoke mutant formerly
credited2 now gives0 with rawInvokeCount0/rawToolRespondedCount0 and both observed predicates false
(`.ufo/waves/round-19/final/noinvoke-mutant-after.json`). It is a finite raw-correlation repair, not proof
against coordinated fabrication of all fields.

The serial inherited gate set retains23/23 exits, including the inherited USER1. Its first error is still
round18, but the source-derived refusal-set comparison exposes round19 too; no-harm is NOT established.
C3 target4 is still **unprovable — missing return-time snapshot evidence**, compounded by the source-writer
inventory omission. Neither a new current snapshot nor another clone count repairs that historical gap.

The continuation's wave-2 return snapshot is actual, but was captured **after** L1 had already integrated
independent corrections while pinned-R read-only seats ran. It is named
`isolation/w2-return-after-L1-integration.txt`, not passed off as the promised pre-integration snapshot.
That missed ordering is an additional author conformance defect; it does not change or authenticate d4.

Author trend assessment: **expansion improved** (runtime-held validation ground);
**quality harmed overall** (legacy history compatibility refusal grew despite technical/prose repairs);
**discernment improved, bounded** (previous outside disagreements and current dissent become explicit
lesson-backed criteria/corrections; d4 remains unprovable and current outside admit/reject closure is
pending). This trade prevents an admission assertion. No promotion boxes are self-checked as non-author.

## L0 ruling — current trend disposition

Main's orchestrator ruling (`.ufo/waves/round-19/final/l0-ruling.txt`) supersedes the preceding
quality-harmed/axis-harm inference from the frozen USER refusal. It is inherited lane-side conformance
debt with **axes unaffected**; no gate/history edit is authorized or performed and the refusal stays two.
The L0 question is resolved-by-ruling. Current author trends therefore read **expansion improved,
quality improved, discernment improved (bounded)**: new runtime-held ground, semantic/provenance repairs
and reproducible finite guards, and lesson-backed disagreements. No current non-author admission is
claimed, and C3 d4 is still **unprovable — missing direct return-time snapshot evidence**. Main authorizes
progression on repaired claims without turning reconstructed evidence into an observation.
