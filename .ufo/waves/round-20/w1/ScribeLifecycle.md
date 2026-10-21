# ScribeLifecycle — round 20, C1 depth (source-only lifecycle decisions)

## Behavior

Drafted the exact twelve source-only completion-lifecycle decisions (LC01–LC12) pinned to S096 (Chromium 154.0.8037.97 `html_form_element.cc`), with spans as declared in `.ufo/waves/round-20/design.json`. Each row states a source condition and the bounded branch outcome. No row is a runtime claim.

Integrated the L1 IRC: the manifest keeps `source.id` = S096 and the spans/table structure unchanged. The LC11 explanation additionally cites S100 as same-file authority. S100 is bounded anchor extension, not source diversity.

## Current state (after correction 2, commit fdf9e14)

Commits in clone `round20/ScribeLifecycle` on top of baseline c49929430d996b016dde2e3a3a5be380f3433fdb:
- a912b64f5f20099dada5b8817dddc95d5c260192 — initial draft (commit 1)
- fdf9e149611b60d42e2eafabe2a6b0f814669cd7 — corrections (commit 2; current HEAD)

`git diff --name-only c49929430d996b016dde2e3a3a5be380f3433fdb HEAD` lists exactly:
- `corpus/evidence/round-20/lifecycle/decisions.json`
- `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`
- `.ufo/waves/round-20/lifecycle-skill-section.txt`

Untracked and not committed (not assigned outputs): `.ufo/waves/round-20/design.json`, `corpus/evidence/round-20/sources/` (the S096 retained body).

## Gates

- No tests, builds, selftests, or counters run (per assignment; main runs gates once after integration).
- Data consistency only, on my own outputs: `decisions.json` parses; 12 objects; spans equal the design spans; each quote is a literal substring of one source line inside its span (≤11 words); the note table rows and the skill txt table rows are byte-identical (12 rows, 5 pipes each); each manifest condition/outcome equals its txt cells.
- Source integrity: re-fetched the pinned URL, base64-decoded it, reproduced sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1,740 lines.

## Correction 1 (commit fdf9e14 — first revision after IRC scope notes)

Scope notes from TabiR20 applied:
- LC07: callback invoked before the state reset (lines 266 before 267–270); no assertion about state during the callback; no global only-path assertion.
- Completion paths outside the twelve rows are listed and not claimed: tool definition update / unregistration (391–394, 449–451), form reset (1102–1104), submitFromJavaScript (834–843, comment 837–838). The note states the 12 rows are not a complete state machine.
- LC11: operative branch is 807–813; declared span 787–815 kept unchanged in manifest and table; S100 as added authority.
- Runtime: r17 receipt-level autosubmit success and navigation (`invoke-declarative-form`, `invoke-declarative-navigation-result`) stated; the note does not claim all declarative completion paths are untested.

## Correction 2 (commit fdf9e14 — second revision after parent review)

Parent review requested the following. Pre-correction text, for the record:

- **LC04 before:** "The submit button is focused and PauseExecution is called on the model context; the call is left pending for user input. This branch does not run the done callback."
  **after:** "submit_button->Focus() and context->PauseExecution() are called; this branch does not run the done callback. The pending outcome is not established here: focus handlers and PauseExecution effects are outside the excerpt."
- **LC05 before:** "PrepareForSubmission(nullptr, submit_button) runs immediately; the eventual completion is decided by the submit-event branches (LC11, LC12), not by this branch."
  **after:** "PrepareForSubmission(nullptr, submit_button) is called immediately. PrepareForSubmission has its own early returns and validation; this row does not claim a submit event, navigation, or completion."
- **LC07 before:** "If non-null, the callback is invoked (line 266) before the state reset (lines 267-270 clear is_currently_running_, the active submit button, invocation_id_ and the pseudo-states); the source does not show state during the callback."
  **after:** "If non-null, the callback is invoked (line 266) before the state reset: lines 267-270 set is_currently_running_ to false, clear active_submit_button_ and invocation_id_, and then PseudoStateChanged notifications follow (lines 271-274). The source does not show state during the callback."
- **Negative runtime sentence before:** "Not runtime-observed in any retained round-17/19 receipt: LC03, LC07 (post-completion state clearing), LC08 (late settlement), LC09, LC10, and the declarative CancelTool path of LC06."
  **after:** "No new runtime witness is supplied here for LC03, LC07, LC08, LC09, LC10, or the declarative CancelTool path of LC06." Scope: the references reviewed for this note only; no exhaustive sweep of retained receipts was recorded, so no absence claim is made.
- Failure checklist item 3 and the LC01/LC05 and LC04 round-17 bullets were reworded to match (no "pending" or "PauseExecution" overclaim).

Manifest, note table, and skill txt table are identical in render for LC01–LC12 (verified above).

## Findings

- Source branches (bounded): LC02 and LC03 return before running state is set; LC06 and LC10 and LC09 and LC11 and LC12 reach CallDoneCallback on their stated branches; LC08 ignores late settlements; LC04 focus/pause does not run the done callback, with the pending outcome not established by the excerpt.
- Runtime comparison (cited, not re-run): r17 receipts show declarative autosubmit success and navigation completion (`invoke-declarative-form`, `invoke-declarative-navigation-result`). r17 `invoke-cancel` is an imperative cancel, not the declarative CancelTool path. r17 probe notes record the LC11 errorText with no output (probe, one build) and a no-toolautosubmit window with no toolResponded for 2500 ms.
- Open gap: LC12's null-String sentinel vs the r17 landing-document result — the bridging code is outside the retained excerpt; not reconciled.
- S096 = S078 bytes (reuse); S100 = same-file reuse. Neither adds source diversity.

## Out of scope / not done

- No runtime observation, no new capture, no counter (`.ufo/waves/round-20/measure-c1.mjs` is not in my clone and was not authored here).
- No SKILL.md integration; `lifecycle-skill-section.txt` is ready for L1 to splice.
- No subagent dispatch (leaf member).

## Tools

No installs or updates performed.

## Checks for main agent

1. Run the counter once against `corpus/evidence/round-20/lifecycle/decisions.json`.
2. Splice `.ufo/waves/round-20/lifecycle-skill-section.txt` into the SKILL lane (integration owner decides).
3. Decide whether to commit `corpus/evidence/round-20/sources/html_form_element.cc` (currently untracked in the clone).
4. Recheck S096 sha against the URL per the note's recheck command before counter closure.
