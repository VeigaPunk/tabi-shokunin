# ConnPlanner — round 21 w1 bounded planning data-walk

Seat: `TabiR21.ConnPlanner` (connector, leaf, read-only). No canonical-plan change, no new claim,
no test/build/browser run. All paths relative to the lane root. No tools installed or updated.

Inputs read: `SCORECARD.md:924-986`, `corpus/README.md:401-464`, shared contract (`.ufo/waves/round-21/w1-spec.json`
`.context` and items BuildRuntime/BuildCounter), `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`,
`.ufo/waves/round-17/w1/C2ProbeDeclarative.md`, `corpus/evidence/round-17/webmcp-invoke/receipt.json`,
`corpus/evidence/round-19/validation/receipt.json` + `fixtures/`, retained S096/S100 body
`corpus/evidence/round-20/sources/html_form_element.cc`, `corpus/SOURCES.md:114`.
Builder clones were at baseline `e7cf11a` with no commits at read time; nothing in them was inspected beyond that.

## Axes

Lowest non-retired tie at 8: depth, operability, freshness, adjacency (`SCORECARD.md:950-951`; coverage9,
calibration9). C1 works **depth** only. Exact obligation (`SCORECARD.md:974-986`): field
`c1_lifecycle_observations` 0→12 from `node .ufo/waves/round-21/measure-c1.mjs REV`, exit0, counter
re-deriving every case from raw correlated frames/digests; scalar depth stays 8; expansion, other axes,
capabilities, saturation8/window3, retirement unchanged.

## Evidence classes (observed ground before r21)

- **Receipt-class, r17**: `invoke-declarative-form` (autosubmit, respondWith → Completed, 0 navigations);
  control `invoke-declarative-navigation-result` (autosubmit, no handler → navigation, Completed with landing output);
  `invoke-cancel` (imperative only); `invoke-after-unregister` (imperative only).
- **Receipt-class, r19**: all 15 fixtures carry `toolautosubmit` (rg count 15/15). Relevant observed:
  `decl-missing-required-01/02` Error `Form validation failed: required: Please fill out this field.. ` submitCount0;
  `decl-email-url-01/03` Error `Form validation failed: …` submitCount0; many Completed submitCount1.
  **No non-autosubmit receipt exists in r17 or r19.**
- **Probe-class, r17** (`C2ProbeDeclarative.md:41-43,71-77`): no-toolautosubmit → no toolResponded for 2500 ms;
  later page `requestSubmit()` → submit `agentInvoked:true`, Completed; preventDefault-without-respondWith →
  Error programming-error text, no `output`.
- **Source-only, r20**: LC01–LC12 on S096/S100, registered anchors `174-328,635-842` (`SOURCES.md:114`).

## Scenario map (12 fixed IDs)

Source lines below are a reading of the retained body for interpretation, not predictions.

| Case | Prior ground | Source branch (cc line) | In S100 anchor? | Redundancy |
|---|---|---|---|---|
| na-pending | r17 probe 2500 ms | LC04 focus/pause, no done callback (212-218) | yes | probe→receipt upgrade only |
| na-click | none (r17 probes used requestSubmit, `submitter` always null) | PrepareForSubmission validation→submit dispatch, agentInvoked set because tool running (720-776) | yes | same branch as na-requestsubmit; distinct only by trusted event + non-null submitter |
| na-requestsubmit | r17 probe (Completed) | same as na-click | yes | probe→receipt upgrade |
| na-native-submit | none | `submitFromJavaScript` → ScheduleFormSubmission, then ok(String()); **no submit event, no validation** (834-842) | yes (r20 caveat, not a row) | new runtime |
| na-reset | none | `reset()` dispatches cancelable reset; if not cancelled and tool present → kToolCancelled `Tool execution cancelled by a form reset` (1077-1110) | **no** | new runtime |
| na-remove | r17 imperative unregister only | `RemovedFrom` → ScheduleDeclarativeWebMCPToolRegistration → if not IsHandlingSubmit → kToolCancelled `…since tool definition was updated`, UnregisterTool (350-400, 486-524) | **no** | new runtime |
| na-reject | r17 imperative reject (errorText "") only | LC10 ReportException + fixed `respondWith promise was rejected` (320-327) | yes | new declarative runtime |
| na-throw | r17 probe preventDefault-without-respondWith | if preventDefault before throw: LC11 programming-error (807-813); if throw first: should_submit true → LC12 navigation | yes | near-redundant with r17 probe if preventDefault first |
| na-delayed | r17 imperative delay probe only | HandleWebMcpToolResponse resolved arm (290-319) after delay | yes | new declarative runtime |
| na-invalid-submit | r19 autosubmit equivalent | ValidateInteractively fail → `Form validation failed: …` (729-758) | yes | same branch and error class as r19 receipt; differs only by page trigger |
| auto-positive | r17 `invoke-declarative-form`, r19 Completed cases | LC05 → submit → respondWith | yes | control; fully held ground |
| auto-invalid | r19 `decl-missing-required-01/02`, `decl-email-url-01/03` | 729-758 via LC05 | yes | control; fully held ground |

Tally: 5 new runtime (native-submit, reset, remove, reject, delayed); 3 probe→receipt (pending, requestsubmit,
throw); 2 trigger variants of held branches (click, invalid-submit); 2 controls fully held (auto-positive,
auto-invalid). This is consistent with the declared "12 observations, not 12 novel branches"; the count is
not falsified by redundancy, but any novelty framing is.

## Contradictions stated, not smoothed

1. **S100 association gap.** The contract requires the note to carry S100 and "S100 is reopened", but the
   na-reset and na-remove source lines lie outside S100's registered anchors (`SOURCES.md:114`). Citing them as
   S100 without a recorded anchor extension is a wrong-source association. The counter's "note contains each
   id and S100" check cannot detect this: one S100 mention satisfies it.
2. **na-throw ordering is underdetermined by its label.** "submit handler throw (preventDefault)" maps to two
   different branches depending on whether preventDefault ran before the throw.
3. **"Trusted click" vs mechanism.** `element.click()` from page script produces `isTrusted:false`; only
   input-pipeline clicks are trusted. The label claims trust, which is checkable from evidence.
4. **"submits" vs navigation.** `form.submit()` navigates without a submit event; a harness that counts
   navigation as a submit drifts from the frames.

## Proposed move (one, bounded)

The note and its semantic review should tag each case's source interpretation as either *in-anchor S100*
(lines inside 174-328/635-842) or *observation-only*. With the current registry, na-reset and na-remove are
observation-only unless L1 separately authorizes a recorded same-body anchor extension, as r20 did for LC11.
The extension would still be same-body, not source diversity. No count changes, so depth is unharmed. It
improves calibration and quality by removing an unregistered source citation that the counter cannot catch.
Interface findings were messaged to `TabiR21.BuildRuntime` and `TabiR21.BuildCounter`. Both messages
were delivered, but both recipients' wake turns failed (`turn_rate_limit_exceeded`, retry budget exhausted;
replies at 2026-10-21 12:39 UTC). There is no evidence that either builder read them. I did not resend,
to avoid adding capacity pressure. L1 should relay this section and the falsifier list at integration if
the builders' returns do not reflect them.

Risks: an extension is a registry edit and must not be read as new source or expansion. Relabeling to
observation-only must not suppress the observed reset/remove outcomes.

## What falsifies depth credit (0→12)

Any one of these makes the count fall short of an admitted 12, or makes it count something unproven:

- A case lacks an outbound `WebMCP.invokeTool` frame whose id-matched result/error yields the recorded `invocationId`/`invokeError`.
- A counted response's `invocationId` differs from the case's, or a summary response has no correlated raw frame.
- A non-auto action timestamp is not strictly after the invoke result **and** after `preAction.windowMs` elapses, or `preAction.windowMs` ≤ 0.
- na-pending (or any "no response") summary while a matching `toolResponded` lies inside the named window. A late frame after the window is not a contradiction, but it must be retained, not dropped.
- `autosubmit` is not derivable from served fixture bytes (`toolautosubmit` attribute), or the fixture hash does not match the served bytes.
- A nonce is reused or absent from the case's served fixture, invoke input or page observation (no current-run echo).
- The producer sha256 differs from the committed `scripts/webmcp-lifecycle-round21.mjs` blob, or the environment differs from Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 / r19 flags.
- A case shares a context with another case, `cleanup.browserClosed`/`serverClosed` is not true, or a run browser survives.
- Any case ID is missing or duplicated, or there are not exactly 12 cases.
- Counter exit ≠ 0 alongside count 12. A count emitted with findings is not admitted (r20 rule, lifecycle note :182-183).
- A status is fabricated or normalized. An unknown observed status must be retained verbatim.
- Evidence contradicts its label: na-click `isTrusted` false, na-throw with no recorded defaultPrevented-at-throw, or na-delayed `after.windowMs` ≤ the controlled delay.
- The note presents observations as universal semantics, calls script submission human-only, or reads `agentInvoked` as proof of agent-originated submit (r17 probe :103-105).
- na-reset/na-remove interpretation is cited to S100 outside its registered anchors without a recorded extension. This is a semantic-review falsifier the counter cannot see.

## What falsifies expansion staying unchanged (no expansion credit is claimed)

- The new note `corpus/knowledge/webmcp-nonautosubmit-round-21.md` or a note count of 38→39 is presented as new ground. It deepens held declarative-loopback ground, as in r20 (`SCORECARD.md:960-962`).
- A new capability row, a retirement, or a saturation/window change is recorded.
- Any claim reaches the open frontier: real-site WebMCP, agent-side consumption, default profile, another build, or custom elements (`corpus/README.md:408-410,443-445`).
- The S100 reopening or an anchor extension is counted as source diversity or publisher growth.
- The two auto controls, or the probe→receipt upgrades, are described as new branches.

## Verification for L1 (not run here)

After all builders land: `node .ufo/waves/round-21/measure-c1.mjs e7cf11a810003d4a65cc85bd265f2c17dd65b738`
→ metric 0, exit 0; at measured REV → `c1_lifecycle_observations=12`, exit 0; `--selftest`. Then a semantic
review of the note's per-case source tags against `SOURCES.md:114` anchors.
