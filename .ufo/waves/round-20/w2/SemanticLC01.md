# SemanticLC01 — round-20 LC01 falsification (wave w2)

- Seat: `TabiR20.SemanticLC01` (leaf; no subagents). Author-side finding; not external closure.
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Checkpoint revision: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Production tree read-only; this file is the only write.
- Row attacked: LC01 in `corpus/evidence/round-20/lifecycle/decisions.json` (record LC01), `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (row line 29; history lines 75-76, 81), and `SKILL.md` (row line 2217; intro 2207-2213).
- Source: `corpus/evidence/round-20/sources/html_form_element.cc` (S096, 1740 lines), read at 174-222, 233-258, 353-463, 635-760, 1126-1137.
- Commands: read-only only. `sha256sum`, `wc`, `cmp`, `zcat`, `git cat-file -t`, `git show <rev>:path` (no index writes), tool `grep`/`read`, and `curl | base64 -d | grep/sed` against the Gitiles tag `154.0.8037.97` (primary source; piped, nothing written). No tests, builds, `measure-c1.mjs`, or selftests were run. No tools were installed or updated.

## 1. Provenance (verified)

| Check | Result |
|---|---|
| Retained body sha256 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`; matches decisions.json `source.sha256`, design.json, design-declared.json |
| Blob at `4ae99816…` | `git show` bytes identical to the working file (`cmp`); the body is committed at the checkpoint |
| Upstream tag 154.0.8037.97 | Gitiles `html_form_element.cc` decodes to the same sha256 |
| r19 retained body | `corpus/evidence/round-19/sources/html_form_element.cc.gz` decodes to identical bytes; "same bytes as r19 S078" holds |
| LC01 span | decisions.json 181-186; design.json and design-declared.json `[181,186]` |
| LC01 quote | `!form_->FastHasAttribute(html_names::kToolautosubmitAttr);` is a literal substring of line 182, has no internal whitespace, and occurs once (line 417 has the call without `!form_->`) |
| Text parity | decisions.json condition and outcome = knowledge row 29 = SKILL.md 2217 (byte-identical) |

## 2. Retained-source facts

- 178: `invocation_id_` written. 179-180: `UseCounter::Count(…kModelContextExecuteDeclarativeTool)`, unconditional. No DOM attribute is read before 182.
- 181-182: `bool require_submit_button = !form_->FastHasAttribute(kToolautosubmitAttr);`
- 183-186: `if (!require_submit_button) { UseCounter::Count(…kModelContextExecuteDeclarativeAutosubmit); }`. This is the only occurrence of that feature in the 1740-line body (grep).
- The flag is a local. It is passed by value at 192 and to `FillFormControls(bool)` at 234, and it is never reassigned (grep hits: 183, 192, 212; 234, 251).
- 212-221: true leads to `Focus()` and `PauseExecution()` (LC04); false leads to `PrepareForSubmission(nullptr, submit_button)` (LC05).
- 251-256: `!*submit_button && require_submit_button` returns `kMissingRequiredSubmitButton` (LC03).

## 3. Field verdicts

No field is summed into a row verdict. Each field stands alone.

| # | Field (location) | Verdict | Reason |
|---|---|---|---|
| F1 | "At ExecuteTool entry" (all three) | ENTAILED | 182 is the first DOM-attribute read in ExecuteTool; 178-180 read none. |
| F2 | "the form has no toolautosubmit attribute" | ENTAILED | Presence test. Upstream `Element::FastHasAttribute` (element.h:2822-2829) is `CouldHaveAttribute(name) && HasElementData() && Attributes().Find(name)`. The value is not read, so `toolautosubmit=""` counts as present. The bloom pre-check (element.h:900-902) is a fast reject; that it has no false negatives is [INFERENCE]. |
| F3 | "so require_submit_button is computed true" | ENTAILED | 181-182 compute `!present`. |
| F4 | outcome clause 1, "require_submit_button is true" | ENTAILED, conditional on F2 | Entry-time local; passed by value into FillFormControls; never reassigned. |
| F5 | outcome clause 2 subject, "the autosubmit use counter" | ENTAILED | The single call at 184-185 targets `kModelContextExecuteDeclarativeAutosubmit`. |
| F6 | outcome clause 2 verb, "is incremented" | REWRITE | S096 does not define `UseCounter::Count`, so from S096 alone the effect is UNRESOLVED. Primary upstream (not registered as a source): `Document::CountUse` forwards to the ExecutionContext (document.cc:9910-9913), which reaches `UseCounterImpl::Count` (use_counter_impl.cc:223-241). That returns early with no source frame or when muted. `feature_tracker_.TestAndSet` (use_counter_feature_tracker.cc:38-42) returns the prior state and sets the bit, so repeat calls are no-ops. The effect is a first-use record per feature, not a per-call increment. Committed pages report via ReportMeasurement (use_counter_impl.cc:235, 337-338); pre-commit records flush at commit (166-176). "Incremented" implies per-call counting, which is imprecise. |
| F7 | outcome clause 2 gate, "only when the attribute is present at entry" | ENTAILED at the call site; repo-wide UNRESOLVED | 183-186: the call exists iff the flag is false, iff the attribute is present (F2). Within the retained body this is the only route to the feature. Other Chromium call sites are outside the body and were not searched. |
| F8 | quote | ENTAILED | Literal substring of 182, within the 25-word limit, unique. |
| F9 | startLine 181 / endLine 186 | ENTAILED | Covers the flag (181-182) and the guarded counter (183-186). Excludes the unconditional Tool counter at 179-180, which LC01 does not mention. |
| F10 | Source identity (S096, URL, sha) | ENTAILED | §1. |
| F11 | Scope "source-only; not runtime-observed" | ENTAILED | No corpus receipt covers the flag or the counter. Grep of `corpus/evidence` for `DeclarativeAutosubmit` returns only the retained source. |
| F12 | Callback and null guards | Not claimed by LC01 | §5 lists the guard chain. |
| F13 | Sample limits | ENTAILED | One of 12 rows. Knowledge note 46-52 and SKILL.md 2201-2205 state the finite-sample limit. LC01 makes no exhaustive claim beyond F7's repo-wide scope. |

Per location:
- decisions.json LC01: F1-F5, F7 (call site), F8-F11, and F13 are ENTAILED. F6 needs rewording. Nothing else needs rewording.
- Knowledge row 29: same text and verdicts. History qualifiers are in §7.
- SKILL.md 2217: same text and verdicts. The intro qualifier at 2209-2210 ("assuming this internal declarative-tool path is reached") is ENTAILED.

Suggested S096-only outcome, which keeps F6 out of the claim:
> require_submit_button is true; the autosubmit use-counter call (UseCounter::Count kModelContextExecuteDeclarativeAutosubmit, S096:184-185) runs only when the attribute is present at entry (S096:183).

Optional condition addition, S096-supported: "(presence test; the value is not read at S096:182)". If an effect verb is wanted, register `use_counter_impl.cc` and `use_counter_feature_tracker.cc` with sha256 first. Re-render SKILL.md and the knowledge row from decisions.json after any change (design.json `skillRendering`).

## 4. Callsite vs actual effect

- Callsite (S096): 183-186 only, reached iff the attribute is present at entry.
- Effect (upstream, outside S096): first-use record for that feature in the page's UseCounterImpl tracker. It is a no-op with no source frame, when muted, or on repeat. Committed pages report via `client->DidObserveNewFeatureUsage` (use_counter_impl.cc:337-338, default context). Not fetched: the ExecutionContext-to-UseCounterImpl hop.
- The flag's own effects are downstream and belong to LC03 (251-256 before FillData at 258), LC04 (212-217), and LC05 (218-221). I checked those lines against the source; they are not re-judged here.

## 5. Entry-time predicate, callback and null guards

- Entry time: the value is captured at 182 into a by-value local. FillFormControls runs inside `CEReactionsScope` (190-194), where script could change the attribute. The branch at 212 and the check at 251 use the captured value, so "computed at ExecuteTool entry" is exact.
- Distinct predicate, not LC01: the registration snapshot `has_toolautosubmit` (RegisterDeclarativeWebMCPTool 416-417, stored 458, compared 437). AttributeChanged (1130-1135) schedules re-registration through a posted task (ScheduleDeclarativeWebMCPToolRegistration 353-408; posted at 402-406). A rewrite that says "the registered flag" or "later attribute changes" would be NOT-ENTAILED.
- Callback: LC01's span contains no `done_callback` reference. The first move is at 197 (error path) and the store at 210. The flag gates neither.
- Null guards tied to the flag:
  - 250-251: a null button is an error iff the flag is true. On the true branch, 215 `submit_button->Focus()` therefore sees a non-null button; the local is not reassigned after 192. ENTAILED.
  - Flag false (attribute present): a null button reaches 219-220 `PrepareForSubmission(nullptr, submit_button)`. PrepareForSubmission accepts null (704 and 708 ternaries; the CHECKs at 709-711 apply only to behavior-bearing submitters). Null submitters are normal at 587-588 and 872. ENTAILED.
  - 207-209: `if (submit_button)` guards PseudoStateChanged. ENTAILED.
  - Unguarded: 216-217 `ModelContextSupplement::modelContext(...)->PauseExecution()` has no null check. The registration path also dereferences modelContext without a check (427-428, 453, 462). This is outside LC01 (LC04 owner). UNRESOLVED: the non-null contract is outside the body.

## 6. Prior r17/r19 observations (not erased; consistency only)

| Observation | Source | Relation to LC01 | Verdict |
|---|---|---|---|
| invoke-declarative-form pass; page record `toolFormActive: true`, `submitter: "go"` | receipt.stdout.txt:6; receipt.json:4336-4337; fixture invoke-declarative.html:6 (toolautosubmit and button) | Attribute-present branch; PrepareForSubmission with a non-null button (LC05 wiring) | Consistent; receipt-level; no counter data |
| invoke-declarative-navigation-result control pass | receipt.stdout.txt:14; invoke-decl-nav.html:6; webmcp-invocation-round-17.md:63 (toolautosubmit) | Same branch; navigation is LC12 domain | Consistent |
| Buttonless autosubmit: submitter null | C2ProbeDeclarative.md:31, 117 | Present and null button leads to PrepareForSubmission(nullptr, nullptr) | Consistent; probe-level |
| No toolautosubmit: no toolResponded for 2500 ms; page requestSubmit then Completed (f-nosubmit) | C2ProbeDeclarative.md:42-43, 71-73 | Absent leads to LC04 (no done callback in ExecuteTool); completion later via page submit | Consistent; probe-level |
| r19 "Form validation failed", submitCount 0 | missing-required.json:12-13; fixture missing-required.html:8 (toolautosubmit) | Present leads to LC05, ValidateInteractively fails, callback 756-758 | Consistent; attribute-specificity NOT-ENTAILED (§7) |
| Counter receipts | grep of corpus/evidence for `DeclarativeAutosubmit` | none | ENTAILED: no receipt covers LC01's counter |

A non-autosubmit invocation exists only as a round-17 probe (`C2ProbeDeclarative.md`), not as a corpus receipt. My fixture grep agrees with AttackLC04 F7 for round 17: both `<form>` fixtures carry toolautosubmit. I did not re-run AttackLC04's full r18/r19 lookahead.

## 7. Knowledge-note history and SKILL.md adjacent text

- H1, knowledge line 75: "Round 17 receipt cases used a `toolautosubmit` form and a form with a submit button." → REWRITE. Both r17 declarative forms carry toolautosubmit and a button (fixtures; control confirmed at webmcp-invocation-round-17.md:63). No no-attribute receipt form exists; no-attribute observations are probe-level.
- H2, line 75: ":tool-form-active true during the call" → ENTAILED (receipt.json:4337).
- H3, line 75: "probe notes record a button-less autosubmit form and a no-toolautosubmit form" → ENTAILED (probe 31, 42-43, 117).
- H4, line 75: "consistent with the LC01 branch and the LC05 PrepareForSubmission call" → ENTAILED as consistency; not proof.
- H5, line 75: "no receipt covers LC01's counter" → ENTAILED.
- H6, line 76 (LC04 history): cites only the 2500 ms window and omits probe lines 72-73 (completion after page requestSubmit). Not contradicted; incomplete. Append, do not rewrite.
- H7, line 81: cites S096:729-751. The r19 case cites 729-758, and the callback is at 756-758. Partial range; the text is ENTAILED.
- SKILL.md 2052-2053: "toolautosubmit's interactive constraint validation failed" → NOT-ENTAILED as an attribute-specific mechanism. The validation branch is keyed on `declarative_webmcp_call` (720-722, 729), which is set for any submit while the tool is CurrentlyRunning. The observation on an autosubmit fixture is ENTAILED. A non-autosubmit validation failure is source-supported and untested.

## 8. Wave-1 notes (for the integrator; not LC01 rows)

- AttackLC01.md §5 S3 (line 60): "It is counted when fill errs (196-198), when validation fails (756-758), and when preventDefault errs (807-813)." → NOT-ENTAILED. The only counter call is 184-185. Lines 196-198, 756-758, and 807-813 contain no counter call (grep).
- AttackLC05.md:112: "increments at entry … counts attempts" → NOT-ENTAILED (first-use record, F6).
- AttackLC04.md:111: "The only use counter on this path is kModelContextExecuteDeclarativeAutosubmit" → NOT-ENTAILED. The unconditional Tool counter at 179-180 is on the same path.
- AttackLC03.md:36: the Tool counter "counts attempts" → NOT-ENTAILED, for the same reason as F6.
- AttackLC01.md §9: "Gitiles decoding and r19 gzip identity not re-verified" → now verified (§1).
- AttackLC01.md §8 (citing ScribeGate F1): "retained body is untracked" → the blob is present at 4ae99816, so the committed-checkpoint citation holds. Working-tree tracking was not checked (no `git status` run).
- Design topic (design.json:27) uses "autosubmit" for the attribute `toolautosubmit`. Not in the three renderings; naming only. AttackLC01 §6.1 also names ConnEvidence; not re-checked here.

## 9. Race leads (unverified; out of scope; no reproduction)

- R1: live attribute (182) vs registered snapshot (416-417, 437, 458) between an attribute mutation (1130-1135) and the posted re-registration (402-406). LC01 describes the live read, so the row is unaffected.
- R2: the raw `submit_button` pointer across FillFormControls' fill path (192-215; FillData is in form_mcp_schema.cc, S077, outside S096).
- R3: re-registration cancels an in-flight call (448-452). LC06/LC07 domain.

## 10. Unresolved or not verified

- U1: repo-wide exclusivity of `kModelContextExecuteDeclarativeAutosubmit`. Only the retained body was checked.
- U2: ExecutionContext-to-UseCounterImpl forwarding (not fetched).
- U3: `modelContext` non-null contract and `PauseExecution` (LC04 owner).
- U4: whether any fill path runs script (FillData, outside S096).
- U5: `CouldMatchFilter` body not fetched; bloom no-false-negative is [INFERENCE].
- Runtime: none. Nothing here is a runtime claim. No runtime evidence exists for the flag or the counter.
- Not run: measure-c1.mjs, selftest-c1.mjs. The quote and span checks were done by hand.

## 11. Tools

None installed or updated. Used pre-existing curl, base64, sha256sum, cmp, zcat, git (read-only), and grep.

## 12. Checks for the main agent (not run by me)

- After any manifest edit: re-check the LC01 quote at line 182 and span 181-186.
- If F6 is rewritten: re-render SKILL.md 2217 and knowledge row 29 from decisions.json; run measure-c1.mjs once.
- Append, do not rewrite, the H1 and H6 history corrections in the round-20 knowledge note.

Report: .ufo/waves/round-20/w2/SemanticLC01.md
