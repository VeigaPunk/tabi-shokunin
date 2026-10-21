# ConnSibling — Adjacency Assessment & Lifecycle Synthesis (Round 20)

**Seat:** `TabiR20.ConnSibling` (leaf member — no subagent dispatch).  
**Role:** UFO-FSD Connector.  
**Lane Root:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`.  
**Baseline:** `c49929430d996b016dde2e3a3a5be380f3433fdb`.  
**Scope:** Assess Declarative WebMCP completion lifecycle source-reading (`html_form_element.cc`, S096) overlap with siblings `kaidoku`, `kake`, and `kagi`. Shared production tree is read-only; only this report is written.

---

## 1. Naming the Axes

Per `AXES.md` and `SCORECARD.md`, the six craft axes governing `tabi-shokunin` are:
1. **Depth:** Verifiable technical detail, decision tables, explicit thresholds, named error signatures, cited sources. *(Round 20 declared target: C1 depth 0→12 completion lifecycle decisions; tied lowest non-retired axis at score 8).*
2. **Coverage:** Fraction of domain surfaces governed (currently score 9).
3. **Operability:** Executable checklists, runbook commands, deterministic verification (currently score 8).
4. **Freshness:** Drift detection, re-verified anchors, recheck records (currently score 8).
5. **Calibration:** Honest gap recognition, evidence grading, anti-claim discipline (currently score 9).
6. **Adjacency:** Cross-domain boundary awareness, reporting vs absorbing sibling scope, clean adjacency mappings (currently score 8).

---

## 2. Assessment of Lifecycle Source-Reading Overlap with Sibling Lanes

The subject of round 20 is source-only reading of Chromium 154 Blink rendering code (`third_party/blink/renderer/core/html/forms/html_form_element.cc`, retained at `corpus/evidence/round-20/sources/html_form_element.cc`, SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines) to extract 12 declarative WebMCP completion lifecycle decisions (`LC01`–`LC12`).

### 2.1 kaidoku-shokunin (Reverse Engineering & Shipped Artifacts)

- **Sibling Domain & Surface:** Reverse engineering of shipped artifacts on this Linux host (native ELF through Ghidra, Electron/ASAR/JS bundles, archives, APKs, PE binaries; `kaidoku-shokunin/PROVINCE.md:3-6`).
- **Overlap Analysis:**
  - `tabi`'s `PROVINCE.md:15` states: **Refuses:** reverse engineering as forensics (→ revenger/kaidoku).
  - In `corpus/adjacency.tsv:3`, this boundary is dispositioned as `refused-route`.
  - In `kaidoku-shokunin/PROVINCE.md:106-107`, `kaidoku`'s Adjacent section explicitly declares:
    `"Source-available reconstruction of ordinary repositories — REA's own anti-trigger (unowned)."`
  - `kaidoku` expressly refuses source repository reading; its tooling and mandate govern binary/artifact forensics without source code.
  - `tabi`'s read of `html_form_element.cc` is an upstream open-source C++ reading from Google Gitiles tag `154.0.8037.97`, classified under `QUALITY.md` Criterion 14 as a source-scoped inference, not binary reverse engineering and not a runtime host observation.
- **Disposition:** **Zero collision.** `tabi` does not decompile or reverse engineer Chromium binaries, and `kaidoku` does not own source-level repository reading. Existing `corpus/adjacency.tsv` row holds unchanged without modification.

### 2.2 kake-shokunin (Web Properties & Publishing)

- **Sibling Domain & Surface:** Web properties & publishing (scopes `ds4cc.com`, `kimi.page/pro` mirrors, GitHub Pages deploys, robots.txt, sitemaps, canonical signals; `kake-shokunin/PROVINCE.md:3`).
- **Overlap Analysis:**
  - Declarative WebMCP in `html_form_element.cc` operates on standard HTML markup authored by web developers: `<form toolname="..." tooldescription="..." toolautosubmit>`.
  - In `LC11` (`html_form_element.cc:808-813`), when a submit handler invokes `preventDefault()` without `respondWith()`, Blink's code explicitly terms this a web author defect:
    `"The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"`.
  - `kake` owns publisher-side placement and authoring guidance (`kake-shokunin/PROVINCE.md:30-31`), while `tabi` refuses web publishing (`tabi-shokunin/PROVINCE.md:16`).
  - In `corpus/adjacency.tsv:6`, this is dispositioned as `split-declared` (`crawler-discipline-vs-publishing`).
  - **Boundary Requirement:** `tabi` must document `LC11` strictly as **browser engine callback semantics** delivered to the client-side tool caller (`CallDoneCallback` with `kToolInvocationFailed` and the verbatim error message), rather than framing it as a site publishing specification or authoring standard for web publishers.
- **Disposition:** **Split-declared boundary holds.** `tabi` owns client-side browser execution and CDP/tool invocation error handling; `kake` owns publisher-side guidance.

### 2.3 kagi-shokunin (Secrets & Vault Ops)

- **Sibling Domain & Surface:** Secrets & vault ops, credential hygiene evidence, session material custody (`kagi-shokunin/PROVINCE.md:3`).
- **Overlap Analysis:**
  - `tabi`'s `PROVINCE.md:16` states: **Refuses:** secrets (→ kagi — session material is shape-only, never content-read).
  - In `corpus/adjacency.tsv:9`, this boundary is dispositioned as `refused-route`.
  - Web forms routinely collect user input and credentials. In `html_form_element.cc`, `FillFormControls` passes `input_arguments` JSON to `FormMCPSchema::FillData(*json_obj)`.
  - In round 20, because the work is strictly source-scoped code reading of Chromium C++ internals without live browser execution or form input, zero credentials or secret tokens are involved.
  - Crucially, `LC07` (`html_form_element.cc:261-275`) demonstrates Blink's tool lifecycle teardown: `CallDoneCallback` immediately sets `is_currently_running_ = false`, clears `active_submit_button_ = nullptr`, and clears `invocation_id_ = std::nullopt`.
- **Disposition:** **Refused-route boundary holds.** `tabi` maintains its shape-only discipline and observes that Blink drops tool invocation state cleanly upon callback completion.

---

## 3. Proposal Synthesis Across Current Round Seats

Reviewing draft findings from active wave seats reveals a critical structural defect and an opportunity for synthesis:
1. **`ScribeGate.md` (Finding F2 — Anchor Gap at LC11):**
   - S096's registered anchor in `corpus/SOURCES.md:110` is:
     `html_form_element.cc:174-328,729-758,818-842`.
   - `design.json` assigns `LC11` (`preventDefault` without `respondWith` programming error) to span `787-815`.
   - Lines `787-815` fall squarely into the gap between `758` and `818`.
   - If `LC11` is integrated without updating `SOURCES.md:110`, C1 fails `QUALITY.md` Criterion 2 ("Every claim carries a source: a measured anchor") and Criterion 12 (opened Tier-A source coverage).
2. **`ScribeChecklist.md` (Decision Span Precision):**
   - Line `787-789` is the boolean gate (`declarative_webmcp_call = executing_tool && executing_tool->CurrentlyRunning()`).
   - Line `790` is `submit_event->TakeRespondWithPromise()`.
   - Lines `807-814` contain the actual decision outcome: if `!should_submit`, Blink invokes `CallDoneCallback` with `ScriptToolErrorCode::kToolInvocationFailed` and the `"The site has a programming error..."` message.
3. **`ScribeMistakes.md` (QUALITY 48 Snapshot Discipline):**
   - Confirms that wave-return status must be an observed before/after listing, not reconstructed from mtimes, keeping verification honest.

---

## 4. The Proposed Move (Godspeed Bounded Move)

### 4.1 Proposed Move
**Close the S096 Anchor Gap and Enforce Client-Side Lifecycle Demarcation for LC11.**

In the L1 integration of Round 20:
1. **Extend S096 Anchor in `corpus/SOURCES.md:110`:**
   Expand the S096 anchor from `174-328,729-758,818-842` to `174-328,729-758,787-815,818-842` (or `174-328,729-842`), ensuring that `LC11` (lines `787-815`, specifically the callback decision at `807-814`) is fully within the registered Tier-A source scope.
2. **Formulate LC11 Decision Record Strictly from the Browser Execution Boundary:**
   In `corpus/evidence/round-20/lifecycle/decisions.json` and `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, define `LC11`'s condition and outcome strictly from the perspective of Blink's tool lifecycle:
   - *Condition:* Declarative tool currently running (`S096:787-788`), `TakeRespondWithPromise()` returns empty (`S096:790`), and `should_submit` is false (`S096:807`).
   - *Outcome:* `CallDoneCallback` is invoked with `kToolInvocationFailed` and diagnostic payload `"The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"` (`S096:808-813`).
   - *Adjacency Guard:* Explicitly note that this error message is a Blink diagnostic delivered to the client tool caller, not an authoring standard prescribed by `tabi` for web publishers (which remains `kake`'s domain).
3. **Harmonize LC07 Cleanup with Kagi Adjacency:**
   Record `LC07`'s outcome as verifying that Blink resets `is_currently_running_ = false`, `active_submit_button_ = nullptr`, and `invocation_id_ = std::nullopt` (`S096:267-270`), proving that tool invocation state does not persist past completion, reinforcing `tabi`'s shape-only / no-retained-data discipline.

### 4.2 Affected Axes
- **Depth (Primary — Improved):** Guarantees that all 12 decisions (`LC01`–`LC12`) map to declared, valid source spans in `SOURCES.md:110`, closing F2 without leaving an unanchored decision row.
- **Adjacency (Maintained & Protected):** Precludes boundary erosion by establishing that source-level Blink analysis does not touch `kaidoku`'s binary RE mandate, does not usurp `kake`'s publisher authoring role, and preserves `kagi`'s credential separation.
- **Calibration (Maintained):** Keeps every decision claim rigorously source-scoped under `QUALITY.md` Criterion 14, making zero unwarranted runtime capability claims.

### 4.3 Risks and Mitigation
- **Risk 1 (Anchor Bloat):** Over-widening the anchor could encompass irrelevant form logic.
  - *Mitigation:* Pin the specific range `787-815` (or tightly `760-842`), which strictly covers `declarative_webmcp_call`, `TakeRespondWithPromise()`, and `should_submit` handling.
- **Risk 2 (Historical Mutation):** Editing historical source rows might trip gate checks.
  - *Mitigation:* S096 is already marked for re-open in round 20 (`ScribeGate.md`); the re-open row update is committed during L1 round integration alongside the round 20 lesson.

### 4.4 Verification Plan
- **Anchor Resolution:** Verify that `node scripts/check-sources.mjs` exits 0 with all spans of `LC01`–`LC12` resolving within S096's anchor.
- **Adjacency Check:** Verify that `node scripts/check-adjacency.mjs` exits 0 with no missing or conflicting rows in `corpus/adjacency.tsv`.
- **Decision Count:** Verify that `node .ufo/waves/round-20/measure-c1.mjs` evaluates all 12 decisions cleanly.

---

## 5. Tooling Record

No packages or tools were installed, updated, or removed in this seat. All reads were performed using read-only repository inspection tools.
