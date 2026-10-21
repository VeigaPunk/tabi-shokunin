# SourceProposalBoundary: round 20, wave 1

Seat: TabiR20.SourceProposalBoundary (leaf, no dispatch). Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Baseline: c49929430d996b016dde2e3a3a5be380f3433fdb.

Question: at each lifecycle decision, where does the pinned declarative explainer (proposal) stop and the Chromium 154 source (S096, implementation) start?

Scope: source-only. No runtime, capability, default-on, shipment, or spec claim.

Tags: [OBS] observed in pinned bytes. [INF] traced in code, not executed. [UNK] outside lane bytes. [RT] lane runtime note, cited, not re-verified. [REG] registry row only, not opened by this seat.

## 0. Axes

- A1 proposal coverage: 17 explainer lifecycle statements and 1 attribute group located (section 2).
- A2 implementation coverage: 13 done-callback call sites, 7 non-completing exits, and 8 trigger sites enumerated in S096 (section 3).
- A3 boundary tagging: 21 boundary rows, each citing both sides and a tag (section 4); 12 LC rows mapped (section 5); 13 unadmitted candidates (section 6).
- A4 pin hygiene: hashes and tracked status checked (section 1).

A move was kept only if it raised an axis without lowering another. No candidate was promoted into the 12 rows.

## 1. Pins and checks

| Check | Result |
|---|---|
| Explainer at 51ed75653aaa7f174f8dbe05d1bc327359bbc57c | sha256 4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28, 213 lines [OBS]. Same sha256 at HEAD cb3d16964ab3e92cfd5f09901ed0504373a906e8; diff exit 0 [OBS]. |
| S096 html_form_element.cc (lane path) | sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916, equal to the design.json pin; 1740 lines [OBS]. |
| Committed status (QUALITY 28) | FAIL. `git ls-files --error-unmatch` rejects S096 and design.json. `git status` at HEAD c49929430d shows untracked corpus/evidence/round-20/ and .ufo/waves/round-20/ [OBS]. The pointer resolves only in the worktree. |
| Registry S031 vs S073 | S073 supersedes S031 and states proposal status, not shipment [REG; bytes match the pin above]. |
| Registry anchor S030 | Cites "README.md line 319" for Future Exploration. At both 51ed756 and cb3d169 the heading is at :311 and the statement at :313-315. Line :319 is "Permissions policy and iframes" [OBS]. |
| Installs or updates | None. Tools used: curl, sha256sum, wc, diff, read-only git. |

Layer ladder (what each layer can and cannot establish):

| Layer | Pin | Establishes | Does not establish |
|---|---|---|---|
| Explainer (proposal) | 51ed756, bytes equal cb3d169 | Intended rules and open questions | Shipment, spec status, 154 behaviour |
| Spec README | 51ed756 | Imperative API is the specified surface; declarative "not part of the specification at this time" (:311-317) [OBS] | Any declarative rule |
| S096 (Chromium 154) | tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d | Flag-gated implementation paths in one file | Default-on state, runtime behaviour, other layers |
| Lane runtime (round-16, round-17) | flags on, loopback | Selected observed cases [RT] | Cases not listed in those notes |

## 2. Proposal lifecycle (explainer at 51ed756)

Self-described proposal: "we propose" (:21-22), "This proposal" (:4). Editors' "Chromium is implementing a loose version ... will conduct testing/trials" (:114-115) states intent, not shipment [OBS; S073 [REG]].

As the proposal states it, the lifecycle has two halves. Registration: attributes set, then a tool is created with a synthesized schema (:55-57; synthesis TBD at :106-115). Invocation: running from "filled out with agent output" (:142-145); without toolautosubmit the submit button is focused and the user submits manually (:49-53); with it the form submits (:49-53); the submit event carries agentInvoked (:159-160); respondWith resolves a response without navigation (:162-164); a navigation response is debated (:117-129). Running ends on four conditions (:147-150).

| ID | Explainer statement | Lines | Class |
|---|---|---|---|
| P1 | Inserting, removing, or updating these attributes creates a new declarative tool with a synthesized schema | 55-57 | rule; timing unstated |
| P2 | Without toolautosubmit, the browser focuses the submit button and the agent asks the user to check and submit | 49-53 | rule |
| P3 | Reset, or tool declaration change, cancels the in-flight invocation and notifies the agent | 99-104 | rule; no exceptions stated |
| P4 | Input schema synthesis | 106-115 | TBD |
| P5 | respondWith returns a response without navigating | 29-31, 131-132, 162-164 | rule |
| P6 | Navigation response is the first ld+json on the target page | 32-33, 117-129 | debate (issue 135); "technically TBD" (:129); collapsed historical text |
| P7 | Running starts "when the form is being filled out with agent output" | 142-145 | rule; wording admits two readings |
| P8 | Running ends on: reset or removal; respondWith resolves; toolname or tooldescription changed; auto-submitted | 147-150 | rule; four items |
| P9 | :tool-form-active and :tool-submit-active match the running form and its submit button | 135-153 | rule |
| P10 | agentInvoked lets submit handlers react to agent-invoked submissions | 159-160, 170 | rule |
| P11 | respondWith(Promise<any>); preventDefault must be called before respondWith | 162-164, 171 | rule |
| P12 | toolactivated fires after fill, before submit (no toolautosubmit) | 180-183 | rule |
| P13 | toolcancel fires on agent cancel, not on site cancel | 185-188 | rule |
| P14 | Open: do events also fire for imperative calls? Chromium "seems to do that", linked to Chromium main, not 154 | 190-195 | open |
| P15 | Open: do events fire at ModelContext or at the form (issue 126) | 197-200 | open |
| P16 | Open: outputSchema for the respondWith payload (issue 9) | 204-207 | open |
| P17 | Open: are declarative tools in getTools() and executeTool() | 209-213 | TBD |
| A1 | Attributes toolname, tooldescription (analogous to ModelContextTool name and description), toolautosubmit, toolparamdescription; control name becomes the property. No tooltitle | 35-47, 59-67 | rule |

## 3. Implementation lifecycle (S096 at 154.0.8037.97)

Gate: registration checks RuntimeEnabledFeatures::WebMCPEnabled (:354), re-checked at :411. Submit and completion CHECKs at :770, :826, :840. Schema scheduling at :1720. The default state of WebMCPEnabled is not in S096. Registry S074 says no DeclarativeWebmcp runtime feature exists at 154 [REG, not opened].

States traced:

- I0 unregistered: no frame (:359-361), not connected, or name or description missing (:362-369).
- I1 pending: a valid form posts a DOMManipulation task (:402-407). An invalid form unregisters synchronously (:380-399).
- I2 registered: RegisterDeclarativeTool (:457-462); re-created when attributes or schema text differ (:430-460).
- I3 invoked: ExecuteTool (:174-177). A fill error completes at once and never runs (:196-198).
- I4 running, paused (no toolautosubmit): running flag and pseudo-state set (:204-210); submit focused and PauseExecution (:212-217).
- I5 running, submitting: toolautosubmit calls PrepareForSubmission (:218-220); a later submit does the same.
- I6 submit dispatched: agentInvoked equals "running at entry" (:720-722, :769-772).
- I7 awaiting respondWith (:789-806).
- I8 navigation scheduled: done with an ok(null) sentinel (:824-829).
- I9 terminal: CallDoneCallback runs the callback once and clears running, button, invocation, and pseudo-state (:261-275).

Triggers: insert and remove (:470-475, :518-523); attribute change (:1130-1135); association and disassociation (:1194, :1211); children change (:1624); schema gate (:1719-1726).

Done-callback call sites (13, including the sink C-c):

| Site | Line | Trigger | Outcome |
|---|---|---|---|
| C-a | 197 | fill error | error, synchronous, never running |
| C-b | 226 | CancelTool (agent abort) | kToolCancelled "by abort signal" |
| C-c | 266 | CallDoneCallback (sink) | runs callback; clears state |
| C-d | 308 | respondWith resolved, object not JSON-serializable | kToolInvocationFailed |
| C-e | 319 | respondWith resolved | String; objects via JSON.stringify (:303) |
| C-f | 324 | respondWith rejected | kToolInvocationFailed; exception reported |
| C-g | 391 | registration became invalid, not handling submit | kToolCancelled |
| C-h | 449 | redefinition, not handling submit | kToolCancelled |
| C-i | 756 | submit validation failed on a declarative call | kToolInvocationFailed |
| C-j | 808 | preventDefault without respondWith | kToolInvocationFailed |
| C-k | 829 | navigation scheduled | ok(null) sentinel |
| C-l | 841 | form.submit() while running | ok(null) sentinel |
| C-m | 1102 | form reset | kToolCancelled |

Non-completing exits in the same flow:

- X-a 637-640: no frame, is_submitting_, or in_user_js_submit_event_. No completion.
- X-b 642-648: not connected (console message). No completion.
- X-c 650-660: sandboxed forms without allow-forms (console message). No completion.
- X-d 678-679: unclosed form control, behind UnclosedFormControlIsInvalidEnabled (:668). No completion.
- X-e 885-887, X-f 893-899, X-g 901-908: returns inside ScheduleFormSubmission (void). Its caller still resolves a running tool with ok(null) (:824-829).

## 4. Boundary table (proposal vs implementation)

Key: AGREE; WORDING (proposal admits two readings); DIFFER; EXTEND (implementation adds end or trigger conditions); IMPL-ONLY (proposal silent); OPEN (proposal lists it as open); UNK (outside lane bytes); CONFLICT.

| BD | Topic | Explainer | S096 | Tag | Basis |
|---|---|---|---|---|---|
| BD-1 | running start | P7: "being filled out" | running set only after fill succeeds (:196-210) | WORDING; low observable effect, since a failed fill never runs | OBS |
| BD-2 | running end | P8: four conditions | 13 sites. Adds agent cancel (226), submit completion by any submit while running (720-722, 789-829), validation failure (756), serialization and rejection (308, 324), preventDefault without respondWith (808), navigation sentinel (829), form.submit (841) | EXTEND | OBS. Click call site is INF; it is not in S096 |
| BD-3 | agentInvoked | P10: "agent-invoked" | true iff a tool is running at PrepareForSubmission entry; event and submitter are not inspected (720-722, 769-772). A user or script submit during pause sets it | DIFFER; possibly intended for pause-then-submit | OBS; live click not run |
| BD-4 | cancel on declaration change | P3: no exceptions | skipped while IsHandlingSubmit (390, 448); reset has no skip (1101-1104) | IMPL-ONLY, asymmetric | OBS |
| BD-5 | trigger set | P8: toolname or tooldescription; P1: "these attributes" | also tooltitle (415, 436, 1132) and toolautosubmit toggles (437). Control association or removal and children change re-register, and cancel on schema-text change (1194, 1211, 1624, 1719-1726, 431-452) | EXTEND | OBS |
| BD-6 | registration timing | P1: no timing | valid: posted task (402-407); invalid: synchronous (380-399). Invocation reads toolautosubmit live (182) while the tool caches it (416-417, 457-458) | IMPL-ONLY | OBS; window untested, INF |
| BD-7 | validity | silent | name and description non-null, connected, frame, flag (354-369); missing name or description reported (330-348, 371-376) | IMPL-ONLY | OBS |
| BD-8 | response payload | P5; P16 open | object via JSON.stringify (300-303); serialization failure (308); primitive via ToString (316-318) | IMPL-ONLY; P16 OPEN | OBS; exact ToString text for undefined or null is UNK |
| BD-9 | navigation response | P6: ld+json under debate | ok(null) sentinel (825-829); no ld+json token anywhere in S096 | OPEN vs IMPL sentinel | OBS. The CDP result "Completed with the new document's result" [RT round-17 note :63] is another layer; registry S097 says output conversion is not a JSON null payload [REG] |
| BD-10 | respondWith vs preventDefault | P11 | CHECK(!should_submit) with an invariant comment (790-794); error when respondWith is absent (807-813) | AGREE on the rule. Enforcement of respondWith without preventDefault is in SubmitEvent, UNK | OBS |
| BD-11 | events | P12-P15 | no dispatch tokens in S096. CancelTool and site cancels share kToolCancelled (226-227 vs 392-393, 450-451, 1103-1104), so P13's agent-only rule cannot be read from S096 | UNK (model_context.cc: registry S042, S097 [REG]); OPEN | OBS (absence) |
| BD-12 | getTools, executeTool | P17: TBD | RegisterDeclarativeTool (462); UnregisterTool (396, 453); no getTools or executeTool token | UNK; OPEN | OBS (absence) |
| BD-13 | schema synthesis | P4: TBD; "loose version" (114-115) | ComputeInputSchema (277-283) and FillData (258) delegate to FormMCPSchema, not in S096 (registry S071, S077, S098 [REG]) | UNK; build-scoped | OBS (delegation) |
| BD-14 | pseudo-classes | P9 | names and state changes (155-165, 204-208, 267-273). :tool-submit-active keys to active_submit_button_ (205, 268-269); completion never compares the submitter to it | AGREE on names; DIFFER on start and end (BD-1, BD-2) | OBS |
| BD-15 | toolautosubmit branch | P2 | 181-182 and 212-221 agree. The TODO at 201-203 describes this same keying in the present tense | AGREE; TODO is stale, do not cite it as a missing branch | OBS |
| BD-16 | no submit button | P2 presupposes one | error before running (249-258) | IMPL-ONLY | OBS |
| BD-17 | reset | P3 | cancel with kToolCancelled and a message (1101-1104) | AGREE on outcome; notification path UNK | OBS |
| BD-18 | attributes | 35-47, 65-67 | tooltitle read (415, 436, 1132), absent from explainer. toolparamdescription absent from S096 (GetWebMCPParameterName at 742 is defined elsewhere) | IMPL-ONLY (tooltitle) | OBS |
| BD-19 | frame gate and removal | silent | frame check (359-361) returns before the synchronous unregister (380-399) | IMPL-ONLY; reach of frameless removal INF | OBS |
| BD-20 | Chromium claims | 114-115, 192-195 | explainer links Chromium main (drc=2af6413c), not the 154 tag | explainer's Chromium claims are not build-scoped | OBS |
| BD-21 | unregistration cancels? | P3, P8 imply cancel on change or removal | declarative: S096 cancels pending work on invalidation or redefinition (390-395, 448-452). Lane round-17 rows say unregistration mid-call does not cancel (round-17 note :74, :87; SKILL :1957), anchored to imperative spec S043 :639-643. The probe's tool type is not stated | UNRECONCILED. No declarative cancel probe in lane; do not cross-cite either way | RT vs OBS |

## 5. The 12 LC rows against the proposal

Spans re-read against S096. All 12 match their topics: LC01 181-186; LC02 189-210; LC03 249-258; LC04 212-218; LC05 218-221; LC06 224-229; LC07 261-275; LC08 290-298; LC09 298-319; LC10 320-327; LC11 787-815; LC12 818-830.

| LC | Topic | Explainer relation | Tag |
|---|---|---|---|
| LC01 | autosubmit sets require_submit_button | P2 agrees | AGREE |
| LC02 | fill error returns before running | P7 wording (BD-1) | IMPL-ONLY; WORDING |
| LC03 | missing submit button error | silent (BD-16) | IMPL-ONLY |
| LC04 | focus and pause; not completion | P2 "submit it manually"; P8 omits manual completion (BD-2) | AGREE with P2; EXTEND vs P8 |
| LC05 | autosubmit submits immediately | P2 agrees | AGREE |
| LC06 | CancelTool done-callback | P13 agent-cancel event (UNK) | AGREE on code; event UNK |
| LC07 | CallDoneCallback clears state only with a callback | silent | IMPL-ONLY |
| LC08 | late response ignored when not running | silent | IMPL-ONLY |
| LC09 | object stringify failure | P16 open (BD-8) | IMPL-ONLY |
| LC10 | rejected respondWith | silent | IMPL-ONLY |
| LC11 | preventDefault without respondWith | P11 states only the reverse order (BD-10) | IMPL-ONLY |
| LC12 | navigation returns null sentinel | P6 under debate (BD-9) | OPEN vs IMPL |

## 6. Unadmitted candidates (not among the 12; for the planner only)

| Cand | Source path | Explainer | Tag |
|---|---|---|---|
| K1 | reset cancels a running invocation (1101-1104) | P3 | AGREE on outcome; strongest candidate |
| K2 | redefinition or removal cancels unless submit is in progress (390-395, 448-452) | P3 | IMPL-ONLY exception |
| K3 | submit validation failure completes a declarative call (729-759, 756) | silent | IMPL-ONLY |
| K4 | any submit while running sets agentInvoked and completes (720-722, 769-772, 825-829) | P10 | DIFFER (BD-3) |
| K5 | form.submit() while running resolves ok(null) for any caller (834-843). Not restricted to submit handlers, although the comment says "from inside a submit handler" | silent | IMPL-ONLY; comment narrower than code |
| K6 | form removed during submit dispatch, no preventDefault: ScheduleFormSubmission returns at 893-899, and the caller still resolves ok(null) (824-829) | P6 implies a navigation | INF: sentinel without navigation |
| K7 | early exits X-a to X-d leave a running invocation pending until reset, removal, or agent CancelTool | silent | INF: untested |
| K8 | completion is not keyed to active_submit_button_ (205, 720-722) | P9 is styling only | OBS (absence) |
| K9 | a schema-text change cancels a running invocation, reached via control association or children change (431-452) | silent on control-driven cancel | OBS |
| K10 | frameless removal skips the synchronous unregister (359-361) | silent | OBS; reach INF |
| K11 | empty toolname or tooldescription: validity tests non-null (369, 421); the issue reporter tests empty (336) | silent | INF: depends on WTF::String bool semantics, outside lane |
| K12 | CancelTool CHECKs running (225); the caller's guard is outside S096 | silent | OBS invariant |
| K13 | non-object respondWith value converted by ScriptValue::ToString (316-318) | silent | UNK exact text |

## 7. Lane runtime cross-reads (cited, not re-verified)

- [RT] invoke-declarative-form (round-17 note :55): agentInvoked true, :tool-form-active matched, respondWith value returned as Completed, loopback, flags on. Covers the agent-invoked respondWith branch (I7, C-e) only.
- [RT] invoke-declarative-navigation-result (round-17 note :63): a toolautosubmit navigation completes with the new document's result. Cross-layer with C-k (BD-9).
- [RT] lifecycle-removal (round-16 note :61): removing the declarative form emits toolsRemoved. Consistent with 396; not a measurement of in-flight cancel.
- [RT] round-17 note :74 and :87: unregistration mid-call does not cancel. This conflicts with BD-21 only if the probe was declarative. Unresolved.
- Among the cases read (round-16 note :58-67; round-17 note :50-64) there is no runtime case for: manual submit while paused, validation failure, declarative reset while running, sandbox or early exits, disconnect during submit, form.submit while running, or respondWith rejection or serialization.

## 8. Not claimed

- No runtime, capability, default-on, shipment, or agent-side claim.
- No spec claim for declarative behaviour. Per SKILL :1872-1878 and :1890, and S030, declarative claims cite S096 and the receipt, never S020.
- K-rows are source-traced candidates, not bugs and not runtime facts. QUALITY 14 applies: this reading supports source-scoped inference only.
- No change to the 12 rows, the depth count, or the manifest.
- Not opened: model_context.cc, inspector_web_mcp_agent.cc, form_mcp_schema.cc, SubmitEvent, the HTMLFormMcpTool header, runtime_enabled_features.json5.

## 9. Handoff to main (not performed here)

1. Commit S096 and design.json before citing them as committed bytes (QUALITY 28, 45). Archive the explainer bytes in-lane, identified by the sha256 in section 1; they are URL-only now.
2. Scribe: correct the S030 anchor (:319 to :311-317). Recheck S046 ranges against the pinned README (Lifecycle at :304; Future Exploration at :311).
3. Resolve BD-21 by checking the tool type in .ufo/waves/round-17/probes/invoke-lifecycle.json before any declarative cancel claim.
4. Planner: if depth should rise beyond 12, K1 to K4 and K6 to K7 are the strongest candidates. None is admitted here.
5. Do not cite S096:201-203 (the TODO) as a missing branch.

Report: .ufo/waves/round-20/w1/SourceProposalBoundary.md
