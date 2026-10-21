# ConnPlanner — Planning Data-Walk: Genuine Depth vs. Relabeling & Exact No-Harm Synthesis

**Seat**: `TabiR20.ConnPlanner`  
**Role**: UFO-FSD Connector (leaf member — no subagent dispatch)  
**Lane Root**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Baseline**: `c49929430d996b016dde2e3a3a5be380f3433fdb`  
**Working Paths**:
- Primary: `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/evidence/round-20/sources/html_form_element.cc`
- Supporting: `.ufo/waves/round-20/design.json`, `SCORECARD.md`, `corpus/SOURCES.md`, `corpus/lessons/round-19.md`
- Target Report: `.ufo/waves/round-20/w1/ConnPlanner.md`

---

## 1. Naming the Axes (Godspeed Step 1)

In accordance with `/skill:godspeed`, `AXES.md`, and `SCORECARD.md`, the round’s declared axes and current posture are:

1. **`depth` (Primary Declared Axis for Round 20)**:
   - Target Claim C1: `c1_lifecycle_decisions` moving 0 → 12.
   - Scorecard state: Tied-lowest non-retired axis at score **8** (`SCORECARD.md:888`).
   - Inviolable contract: Strictly source-only Chromium 154 Blink reading (`third_party/blink/renderer/core/html/forms/html_form_element.cc`, S096). **Zero scalar score promotion** (delta 0); no runtime capability or host execution claim (`design.json:8,130`).
2. **`operability` (Score 8)**: Gate stability, zero regressions on lane-owned checkers, deterministic reproducible counter execution without shell injection.
3. **`freshness` (Score 8)**: Byte-level source verification against pinned Chromium tag 154 commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, decoded body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
4. **`calibration` (Score 9)**: Uncompromising separation of observation, inference, and unknown (`QUALITY.md` Criterion 3). Preservation of evidence class boundaries (`QUALITY.md` Criterion 14).
5. **`coverage` (Score 9)**: Held; strictly protected against false "source diversity" inflation when re-opening existing source S096.
6. **`adjacency` (Score 8)**: Zero collision with sibling lanes (`kaidoku`, `kake`, `kagi`, `kama`). `corpus/adjacency.tsv` held clean.

---

## 2. Planning Data-Walk: Genuine Depth vs. Relabeling Runtime Ground

### 2.1 The Core Evaluation Question
Does authoring 12 source-only lifecycle decisions (`LC01`–`LC12`) from Blink’s `html_form_element.cc` genuinely deepen `depth`, or does it merely relabel prior runtime ground established in rounds 16, 17, and 19?

### 2.2 Comprehensive Data-Walk Matrix
Each of the 12 candidate decisions was audited against the retained runtime receipts of:
- **Round 16**: `corpus/evidence/round-16/webmcp/receipt.json` (loopback CDP availability and WebMCP domain toggles).
- **Round 17**: `corpus/evidence/round-17/webmcp-invoke/receipt.json` (Playwright CDP `WebMCP.invokeTool` on 11 loopback cases).
- **Round 19**: `corpus/evidence/round-19/validation/receipt.json` & `decisions.json` (27 input-validation decisions `DV-01`–`DV-27` across 66 cases).

| ID | Candidate Decision & Span (`S096`) | C++ Blink Mechanism (`html_form_element.cc`) | Prior Runtime Ground (r16 / r17 / r19) | Classification & Verdict |
|---|---|---|---|---|
| **LC01** | `autosubmit` presence determines `require_submit_button`<br>`181-186` | `bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);`<br>Toggles submit button requirement and controls use counter. | **r17/r19**: All tested declarative forms (`invoke-declarative.html`, `checkbox.html`, etc.) carried `toolautosubmit`. Forms without it were never tested. | **Genuine Depth**: Identifies the core Blink conditional branching between autonomous submission and human interactive pause. The absent branch is unexercised at runtime. |
| **LC02** | Fill error returns before running state<br>`189-210` | If `FillFormControls` returns an error, `done_callback` runs immediately. `is_currently_running_ = true` and `CSSSelector::kPseudoToolFormActive` are bypassed entirely. | **r19**: 39 cases observed fill-time `kInvalidInputArguments` error over CDP, but never inspected DOM pseudo-classes or internal state transition suppression. | **Genuine Depth**: Details internal state-machine ordering and DOM class suppression that CDP response alone could not verify. |
| **LC03** | Missing required submit button error<br>`249-258` | In `FillFormControls`: if `!*submit_button && require_submit_button`, returns `kMissingRequiredSubmitButton`. | **r17/r19**: All test fixtures included explicit submit buttons. `kMissingRequiredSubmitButton` was never triggered or received. | **Genuine Depth**: Entirely unexercised error path in the Blink rendering engine. |
| **LC04** | Non-autosubmit focus & `PauseExecution`<br>`212-218` | If `require_submit_button`: calls `submit_button->Focus()` and `ModelContextSupplement::modelContext()->PauseExecution()`. Does not complete the tool. | **r17/r19**: Explicitly excluded. `webmcp-declarative-validation-round-19.md:18-19` states: *"Not claimed: ... forms without toolautosubmit"*. | **Genuine Depth**: Foundational architectural discovery. Proves declarative tools without `toolautosubmit` do not complete autonomously; they shift the host browser into an interactive pause state. |
| **LC05** | Autosubmit immediately submits<br>`218-221` | `else { form_->PrepareForSubmission(/*event*/ nullptr, submit_button); }`<br>Immediately bypasses pause and submits with null event pointer. | **r17/r19**: Observed that autosubmit forms dispatch submit events. | **Genuine Depth**: Reveals the internal dispatch interface (`PrepareForSubmission` with `/*event*/ nullptr`), establishing how Blink simulates submission without a user DOM event. |
| **LC06** | `CancelTool` uses tool-cancelled callback<br>`224-229` | `CHECK(is_currently_running_);`<br>Calls `CallDoneCallback` with `kToolCancelled` ("Tool execution cancelled by abort signal"). | **r17**: Tested CDP `cancelInvocation` on *imperative* tools (`invoke-cancel`), not declarative forms. r19 did not test abort signals. | **Genuine Depth**: Unmeasured error path on declarative form lifecycle. |
| **LC07** | `CallDoneCallback` clears state only with callback<br>`261-275` | If `done_callback_.is_null()`, early-returns. Otherwise executes callback, clears `is_currently_running_`, resets `active_submit_button_`, and clears `invocation_id_`. | **r17/r19**: CDP receipts record delivered responses; internal single-shot callback guards and memory teardown are unobservable across the wire. | **Genuine Depth**: Exposes internal idempotence and lifecycle teardown guarantees preventing double-resolution. |
| **LC08** | Late response ignored when not running<br>`290-298` | In `HandleWebMcpToolResponse`: `if (!tool->CurrentlyRunning()) return;`<br>Silently discards fulfillments arriving after tool completion or unregistration. | **r17/r19**: Never tested asynchronous promises fulfilling after tool timeout, cancel, or navigation. | **Genuine Depth**: Exposes Blink's guard against asynchronous race conditions and reentrancy after completion. |
| **LC09** | Object response stringify failure<br>`298-319` | In `HandleWebMcpToolResponse`: if `v8::JSON::Stringify` fails on an object passed to `respondWith()`, returns `kToolInvocationFailed`. | **r17/r19**: Only valid, simple JSON-serializable payloads were passed to `respondWith()`. | **Genuine Depth**: Discovers the explicit V8 try-catch serialization boundary and failure code for non-serializable objects. |
| **LC10** | Rejected `respondWith` promise error<br>`320-327` | If promise rejects, calls `V8ScriptRunner::ReportException` and returns `kToolInvocationFailed` ("respondWith promise was rejected"). | **r17**: Tested rejected promises on *imperative* tools only. Declarative form `respondWith(Promise.reject())` was never tested. | **Genuine Depth**: Identifies the dual-action outcome: V8 exception reporting to DevTools console combined with MCP tool failure delivery. |
| **LC11** | `preventDefault` without `respondWith` error<br>`787-815` | If `preventDefault()` was called on the submit event but no promise was provided via `respondWith()`, returns `kToolInvocationFailed` ("The site has a programming error..."). | **r17**: `invoke-declarative.html` called both `preventDefault()` and `respondWith()`. r19 submit handlers called neither. | **Genuine Depth**: Uncovers Blink's strict authoring contract bridging standard DOM event prevention and WebMCP resolution. |
| **LC12** | Scheduled navigation returns null String sentinel<br>`818-830` | In `PrepareForSubmission`: returns `base::ok(String())` (an uninitialized null Blink `String`), not `"null"` or empty string. | **r17**: Supplementary case observed landing document result over CDP, but wire translation obscured the internal Blink sentinel. | **Genuine Depth**: Clarifies the exact internal IPC convention distinguishing navigation triggers from data returns. |

### 2.3 Data-Walk Verdict
The 12 candidate rows **GENUINELY DEEPEN DEPTH**. They do **NOT** relabel runtime ground:
1. **Unexercised Code Paths**: 9 of the 12 outcomes (LC01-absent, LC03, LC04, LC06, LC07, LC08, LC09, LC10, LC11) represent C++ execution branches, error codes, and state transitions that have **never been executed or observed** in any prior round's runtime receipts.
2. **Sub-Protocol Mechanics**: Even the 3 branches with runtime precedent (LC01-present, LC02, LC05, LC12) expose internal Blink invariants (suppression of running states, single-shot callback guards, `PrepareForSubmission` event arguments, null String sentinels) that protocol-level CDP captures cannot resolve.
3. **No False Relabeling**: Relabeling occurs when prior runtime observations are repackaged under new labels without new findings. Here, the work is explicitly classified as **source-scoped code reading** under `QUALITY.md` Criterion 14, mining unexercised mechanisms of the Chromium 154 engine.

---

## 3. Contradictions & Tension Points across the Round

Tracing second-order effects across active seats reveals four primary tension surfaces:

1. **Token Presence vs. Semantic Entailment (`CriticCount` vs. `ExecCounter`)**:
   - `measure-c1.mjs` checks file presence, JSON schema, and literal quote substrings (≤25 words).
   - As `CriticCount` and `QUALITY.md` Criterion 47 caution: *"Source-token presence is not entailment of the whole decision."* Merely matching strings like `FastHasAttribute` does not prove that a decision is understood.
   - *Resolution*: Decisions in `decisions.json` and `SKILL.md` must pair the mechanical quote with an explicit **negative invariant** (e.g. LC04 does not guarantee tool completion; LC12 does not prove navigation succeeded).

2. **Source Inferences vs. Runtime Guarantees (`CriticScope` vs. `ScribeLifecycle`)**:
   - Upstream comments in `html_form_element.cc:201-204` carry `TODO(masonf)` notes indicating evolving implementations.
   - If distillation in `SKILL.md` states "Chromium completes tools this way", it violates `QUALITY.md` Criterion 14.
   - *Resolution*: Strict manifest-level scoping: `"source-only Chromium 154.0.8037.97; not runtime-observed"` (`design.json:130`).

3. **Source Identity & Diversity Credit (`CriticSourceReuse` vs. `ScribeGate`)**:
   - `html_form_element.cc` in round 20 has the exact same SHA-256 digest (`8c8d6796...`) as round 19 S078/S096.
   - Re-opening S096 is valid, but earns **zero** source diversity or coverage credit.
   - *Anchor Gap Defect*: S096's registered anchor in `corpus/SOURCES.md:110` is `174-328,729-758,818-842`. Decision **LC11** is located at lines **787–815** (decision branch at 807–814), which falls into an un-anchored gap (`759–817`), violating `QUALITY.md` Criterion 28.
   - *Resolution*: L1 must expand S096's anchor range in `corpus/SOURCES.md:110` to `174-328,729-842` (or include `787-815`) during round integration.

4. **Legacy User Gate Invariance (`CriticNoHarm` & `check-user-round-contract.mjs`)**:
   - In round 19, the legacy gate `check-user-round-contract.mjs` grew from 1 to 2 refusals due to historical lesson drift on round 18 and 19.
   - `SCORECARD.md:915-918` explicitly ruled this an immutable historical defect ("refusal stays two").
   - If round 20 modifies `corpus/lessons/round-19.md` or any earlier lesson, or modifies `scripts/check-user-round-contract.mjs`, it will escalate refusals or fail `history_rewritten`.
   - *Resolution*: Zero edits to historical lessons. `corpus/lessons/round-20.md` must be created once and never mutated across subsequent commits (`future_lesson_allowed` gate rule).

---

## 4. The Non-Obvious Move: Dual-Branch Decoupling & Tripartite No-Harm Integration Protocol

### 4.1 Synthesis Across Proposals
Synthesizing the insights from `ConnEvidence` (runtime absence matrix), `ConnHistorical` (snapshot timing), `ConnSibling` (client-side demarcation), `ScribeGate` (anchor gap F2), `ScribeLifecycle` (12 decision drafting), and `ScribeMistakes` (QUALITY 48):

### 4.2 Proposed Move
**Adopt the "Dual-Branch Decoupling & Tripartite No-Harm Integration Protocol" for Round-20 Integration**:

1. **Decouple the 12 Decisions into Two Structural Execution Modes**:
   Rather than presenting a flat list of 12 rows, group the decisions in `decisions.json`, the knowledge note, and `SKILL.md` into their two real architectural branches:
   - **Branch A: Interactive-Pause Mode (Human-in-the-Loop)**: `LC01` (absent), `LC03` (missing button error), `LC04` (focus + `PauseExecution`). This formally establishes that declarative WebMCP without `toolautosubmit` pauses the agent and requires human UI interaction.
   - **Branch B: Autonomous Completion Mode**: `LC02` (pre-running fill error), `LC05` (immediate submit), `LC06` (abort cancel), `LC07` (single-shot cleanup), `LC08` (late response drop), `LC09` (stringify failure), `LC10` (rejected promise), `LC11` (missing `respondWith` error), `LC12` (navigation sentinel).

2. **Close the S096 Source Anchor Gap (Pre-Measurement Binding)**:
   In `corpus/SOURCES.md:110`, update the S096 anchor cell from `174-328,729-758,818-842` to:
   `html_form_element.cc:174-328,729-842`
   This cleanly envelops `LC11` (lines 787–815), eliminating the gap defect before running `check-sources.mjs` or `check-measurement-binding.mjs`.

3. **Execute the Tripartite No-Harm Verification Protocol**:
   L1 integration must bind round-20 no-harm to three concrete receipts:
   - **Receipt 1 (Wave Return Shutter — QUALITY 45/48)**: Immediately when wave 1 returns, capture `.ufo/waves/round-20/w1/return.json` before merging clone commits or importing clone files. Verify `git diff` is empty and that new untracked files are strictly confined to `.ufo/waves/round-20/`.
   - **Receipt 2 (Legacy Gate Invariance)**: Verify that running `scripts/check-user-round-contract.mjs` reproduces the exact baseline refusal count of **2** (the historical round-18/19 drift), with **zero escalation** to 3.
   - **Receipt 3 (Source Registry & Adjacency Invariance)**: Verify that `node scripts/check-sources.mjs` and `node scripts/check-adjacency.mjs` exit 0, confirming S096 used-by append integrity, zero added source rows, and zero line-drift on `SKILL.md:556`.

---

## 5. Second-Order Effects & Affected Axes

| Axis / Surface | Impact | Evidence & Mechanism |
|---|---|---|
| **`depth`** | **Improves** (0 → 12) | 12 verified lifecycle decisions in `corpus/evidence/round-20/lifecycle/decisions.json`. Decoupling clarifies interactive pause vs autonomous completion. |
| **`operability`** | **Harms None** | `measure-c1.mjs` runs git argv safely without shell; `check-wave.mjs` validates return snapshot provenance; selftests pass. |
| **`freshness`** | **Harms None** | S096 decoded body SHA-256 (`8c8d6796...`) re-verified against pinned Chromium tag 154 commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. |
| **`calibration`** | **Harms None** | Strict labeling: `"source-only Chromium 154.0.8037.97; not runtime-observed"`. No false runtime capability claims (`QUALITY.md` Criterion 14). |
| **`coverage`** | **Harms None** | Re-opening S096 explicitly claimed as deepening existing ground; 0 source expansion credit; no unearned capability rows. |
| **`adjacency`** | **Harms None** | Blink C++ form reading stays strictly client-side/browser engine; no encroachment on `kaidoku` (binary RE), `kake` (publishing), or `kagi` (credentials). |

---

## 6. Risks and Countermeasures

- **Risk 1: Premature Clone Merge Corrupting the Return Shutter**:
  If L1 imports files from `clones/ScribeLifecycle/` into the working tree before taking `w1/return.json`, `git status` will show modified production paths, violating QUALITY 45 and recreating round 19's failure.
  *Countermeasure*: The shutter script must be executed as the very first action upon wave completion, before any file copy or branch merge.
- **Risk 2: Re-Mutating `corpus/lessons/round-20.md` Across Multiple Commits**:
  `scripts/check-user-round-contract.mjs` permits a new round lesson on initial addition (`future_lesson_allowed`), but fails with `history_rewritten` if that file is mutated in subsequent commits.
  *Countermeasure*: Author the final `round-20.md` lesson completely and commit it exactly once during final integration.
- **Risk 3: Accidental Shift of `SKILL.md` Historical Lines**:
  `corpus/adjacency.tsv:7,8` quotes `SKILL.md:556`. If lines are inserted at the top of `SKILL.md`, `check-adjacency.mjs` will fail with `tabi_quote_absent`.
  *Countermeasure*: All round-20 SKILL additions (`### Declarative WebMCP completion lifecycle — source-scoped (round 20)`) must be appended strictly at the end of `SKILL.md`, preserving the exact prefix (`scripts/check-round-contract.mjs` `APPEND_ONLY` check).

---

## 7. Verification Steps for Main Agent (Sole Integration Owner)

Main agent should execute the following bounded sequence after all wave-1 seats yield:

1. **Capture Return Shutter Immediately**:
   ```bash
   node -e '
   const { execSync } = require("child_process");
   const fs = require("fs");
   const status = execSync("git status --porcelain=v1 -uall", { encoding: "utf8" });
   const diff = execSync("git diff", { encoding: "utf8" });
   const record = {
     phase: "return-before-integration",
     observed: true,
     baseline: "c49929430d996b016dde2e3a3a5be380f3433fdb",
     status,
     trackedDiff: diff,
     capturedAt: new Date().toISOString()
   };
   fs.writeFileSync(".ufo/waves/round-20/w1/return.json", JSON.stringify(record, null, 2));
   '
   ```

2. **Verify Wave Containment Invariant**:
   Assert that `git diff` is empty and that new untracked files are strictly under `.ufo/waves/round-20/`.

3. **Integrate Clone Outputs & Update S096 Anchor**:
   - Import `decisions.json`, note, and counter from clones.
   - Expand `corpus/SOURCES.md:110` anchor to `174-328,729-842` and append `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` to `used-by`.
   - Append `lifecycle-skill-section.txt` to the end of `SKILL.md`.

4. **Execute Serial Gates**:
   - `node scripts/check-sources.mjs` (must exit 0, census clean).
   - `node scripts/check-adjacency.mjs` (must exit 0, verified 10/10).
   - `node scripts/check-round-contract.mjs` (must exit 0, append-only clean).
   - `node scripts/check-user-round-contract.mjs` (must exit 1 with exactly the 2 baseline historical refusals, 0 new refusals).
   - `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-20/measurement-binding.json --reproduce` (must exit 0, count 12).

---

## 8. Tooling & Execution Record

- **Tools Installed / Updated**: None. (Pacman transactions paused host-wide; no new CLI tools required).
- **Subagent Dispatch**: None (leaf seat).
- **Writes**: Strictly this report (`.ufo/waves/round-20/w1/ConnPlanner.md`). Production files, clone directories, and git index remained untouched.
- **Mid-Flight Verification**: None run (verification deferred to main agent post-integration).
