# Round 19 W1 — MineMistakes

## Scope and method

Read the requested lesson glob (`corpus/lessons/round-1*.md`), the round-18 non-author spot-check, the round-18 wave-2 reports, and the fleet round-18 report. Compared findings against every `## Mistakes` heading found in the lesson directory: `kaika-fleet-round-1.md` and `round-12.md` through `round-18.md`. The round-18 `## Mistakes` table at `corpus/lessons/round-18.md:103-114` does not contain the routed items below. Round 18 also has a separate Wave-2 mistake-class table at `:154-163`; I treated entries already summarized there as existing lesson coverage, not as newly discovered defects. Some items below are nevertheless described elsewhere in the lesson, but are absent from its formal `## Mistakes` table.

The findings separate current routed gaps from historical wording/count errors already corrected by an append. Evidence below is repository-local; no external-source quote is used. No check was run: the proposed red controls are falsification contracts, not observed outcomes.

## Findings missing from a lesson `## Mistakes` table

### 1. LOG criterion range/count drift

- **Class:** number-drift.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:143-145`; `LOG.md:1059`; `corpus/QUALITY.md:139-165`. LOG names QUALITY 33–38, but QUALITY contains seven additions, 33–39. The subsequent LOG entry separately mentions QUALITY39 at `LOG.md:1078`.
- **Captured-by:** none. QUALITY34 is relevant to prose counts but did not detect or prevent this error.
- **Proposed fix / red case:** append a correction to LOG (leave the old line immutable) that identifies the superseded six-criterion range and states seven criteria, 33–39. Re-derive the count from QUALITY entries whose lesson citation is round 18. A counter must reject a mutant omitting criterion39 or reporting 33–38, and accept the seven-entry set. Round-19 plan C3 d1 specifies this contract.

### 2. Source-note row count was stated at the wrong revision

- **Class:** number-drift.
- **Evidence:** `.ufo/waves/round-18/w2/ConnTrend.md:92`; `corpus/knowledge/source-recheck-round-18.md:11,154-159`. The first-integration note says SOURCES has 57 rows while its integration revision already had 64. The appended §7 explains that 57 refers to baseline B and points to the final measurements. This is a historical error with an explicit final-note correction, not an uncorrected final count.
- **Captured-by:** none as an effective capture. QUALITY34 is the applicable general count rule, but the false unqualified sentence passed it; §7 is the later correction.
- **Proposed fix / red case:** retain the append-only clarification that scopes 57 to B; for any future count, bind the number to a named revision and derive it from that revision's SOURCES registry rows. A red control removes the baseline qualifier or changes the named revision while retaining 57; a second arm verifies 57 at B and 64 at the first-integration revision. The W2 observation identifies the concrete failing revision/value pair.

### 3. Wave-1 production writers bypassed writer isolation

- **Class:** scope.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:146-148`; round-18 report `:13`; `corpus/lessons/round-18.md:133-136`. The lesson discloses that wave-1 writers used disjoint files in the shared lane checkout rather than separate writer worktrees/clones. It is described outside the `## Mistakes` table.
- **Captured-by:** none (the addendum imposed the contract; no QUALITY criterion is recorded as having caught the miss).
- **Proposed fix / red case:** require each production writer to use its assigned clone/branch from B and record commit plus changed paths. Compare lane `git status --porcelain` before/after the wave; any production write in LANE or a changed path outside that writer's assignment must fail. A deliberate one-file LANE write is the red control. Round-19 plan C3 d4 specifies the isolation ledger and unchanged-lane comparison.

### 4. “Retained” wording overstates assertion preservation

- **Class:** scope.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:153-157`; `SCORECARD.md:830`; fleet report `:8` and `:38`; `.ufo/waves/round-18/w2/ReviewHarness.md:42-47`. Eleven case IDs and four control IDs remain, but six of the 15 original checks replace numeric CDP error-code assertions with message-substring assertions because the pipe CDPSession does not expose those numeric codes. The SCORECARD/report wording should preserve the distinction between retaining IDs/pass outcomes and retaining identical assertions.
- **Captured-by:** none for this assertion-level delta.
- **Proposed fix / red case:** correct the scorecard/report sentence to say that IDs and pass status were retained, and state that six assertions changed. Compare the old and new case/control records by ID and expected predicate; accept unchanged IDs/pass statuses with exactly six changed error assertions. A mutant that changes those six predicates but still labels all original checks unchanged must fail. Round-19 plan C3 d2 specifies the IDs/pass-status correction and re-derivation of six.

### 5. H4 scan misses arbitrary Playwright artifact names

- **Class:** survivor.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:149-153`; `corpus/lessons/round-18-verifier-spotcheck.md:72-75`; `.ufo/waves/round-18/w2/DownloadsAfter.md:30-31`. The round-18 predicate scans for the suggested filename; a new `<uuid>` Playwright artifact can evade that name-specific match.
- **Captured-by:** none for the arbitrary-name shape. The round-18 Wave-2 table's H4 replay entry covers browserless receipt replay, not this artifact-name survivor.
- **Proposed fix / red case:** in a counter-owned run, plant a fresh UUID-named file under `processTmpDir/playwright-artifacts-*` and require the harness's scan to report it. The H4 predicate must fail on that mutant even if the suggested filename is absent. Round-19 plan C2 G-H4 requires this shape.

### 6. H4 can credit a pasted record with real browsers present

- **Class:** survivor.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:150-153`; `.ufo/waves/round-18/w2/MutC2.md:17-21`. MutC2 established that a browserless replay is rejected in the later measurement path, but the spot-check identifies a different gap: H4's invocation/response/marker fields are harness-reported, so pasting an older valid download record while real browsers are present can still pass.
- **Captured-by:** none for a record replayed alongside real browser processes; the existing Wave-2 replay check is not this shape.
- **Proposed fix / red case:** generate a fresh per-run nonce in the counter and require it to be echoed by the fixture-observed download record; reject any record with a prior-run nonce. Replay an authentic prior receipt while launching real browsers: H4 must fail on nonce mismatch. A fresh current-run record must remain green. Round-19 plan C2 G-H4 specifies the nonce binding.

### 7. H1 signal coverage and empty-process predicate are insufficient

- **Class:** vacuous.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:68-70,153-154`; `.ufo/waves/round-18/w2/CriticAdmission.md:68-75`. The counted abort is SIGTERM-scoped; SIGINT is used for cleanup only, SIGHUP is not exercised, and “no surviving browser” observes zero on both revisions, so that cleanup subcondition does not establish that a browser existed before signaling.
- **Captured-by:** none for the required SIGINT/SIGHUP and nonempty-pre-signal-process shapes.
- **Proposed fix / red case:** independently start each signal run after a case line, first observe a nonempty run-owned Chromium PID set, then deliver SIGINT or SIGHUP. Require exit 2 with `run_aborted`, no pass/fail receipt, and an empty PID set after. Mutants that never create a browser, swallow either signal, or emit a receipt must fail. Round-19 plan C2 G-H1 specifies these conditions.

### 8. F6 checks only `HEAD` and only an exit code

- **Class:** vacuous.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:154-155`; `.ufo/waves/round-18/w2/CriticAdmission.md:74-75`; `.ufo/waves/round-18/w2/ReviewWrapper.md:35-37,69-73`. The witness may reject several invalid values, but the round-18 counter tries only `--rev HEAD` and does not assert the declared refusal reason.
- **Captured-by:** none for the input-variant/refusal-reason contract.
- **Proposed fix / red case:** counter-probe `HEAD`, `@`, `master`, a 7–12-hex short hash, and an off-branch full hash; require exit 2 and the declared reason token for each, with an allowed full-ancestor control. Mutants that return exit 2 for every input or refuse with the wrong reason must fail. Round-19 plan C2 G-F6 specifies the variants and reason-token check.

### 9. Registry wave and validation actor labels are null

- **Class:** attribution.
- **Evidence:** `corpus/lessons/round-18-verifier-spotcheck.md:158-159`; `.ufo/waves/round-18/w1/swarm-registry.json:1-6`; `.ufo/waves/round-18/w2/swarm-registry.json:1-6`; `.ufo/waves/round-18/w1/validation.json:21-40`. Both registries serialize `wave: null`; the wave-1 validation snapshot embeds `agentId: null` for members. The spot-check says counts and role vectors match and no claim depends on these fields; this is a metadata/traceability defect, not a count defect.
- **Captured-by:** none.
- **Proposed fix / red case:** populate `wave` from the validated wave specification and validation `agentId` from the resolved dispatch identity, rather than copying an incomplete embedded registry projection. A schema/round-contract check must compare these fields to the spec/assignments and reject either null-mutant; round-19 plan C3 d3 specifies non-null wave equality.

## Calibration notes

- The C1 `eligible_rows=58` versus `c1_rows_rechecked=51` difference is not itself a defect: W2 `CriticAdmission.md:60-64` explains that seven newly added S058–S064 rows are eligible at REV but outside the fixed baseline-B cohort. Do not report this as seven missing baseline rechecks.
- `ConnScope.md:75-77` reads “No sibling-owned files changed” as a claim that sibling repositories were frozen. The lesson context at `round-18.md:121-127` is about Tabi not changing/absorbing sibling-owned paths; ConnScope's evidence of independent kaidoku edits does not establish a Tabi-attributed change. I did not classify it as a confirmed mistake.
- The Wave-2 outcome table at `round-18.md:154-163` already records the C1/C2/C3 mutation and source-review findings, including the browserless replay and duplicated TMPDIR-scan finding. I did not re-report those as additional discoveries. The pasted-record-with-real-browsers and the other routed shapes above are distinct residual gaps identified by the non-author spot-check.

## Grep searches used

Per the tooling policy, searches were issued through the `grep` device; the following are faithful command-line forms of the queries (shell `grep` was not run):

```sh
grep -nE '^## Mistakes' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons
grep -nEi '(retains?|registry.{0,30}wave|null.{0,20}wave|QUALITY ?33.?38|QUALITY ?33.?39|seven.{0,30}quality|LOG.{0,30}(count|seven))' /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2 /home/vgpnk/Projects/shokunin/.ufo/reports/round-18/tabi.md /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-18-verifier-spotcheck.md
grep -nEi '(registry.{0,40}wave|null.{0,30}registry|retains? (all|the|[0-9]+)|QUALITY ?33.?38|QUALITY ?33.?39|seven.{0,30}quality|LOG.{0,30}(count|seven))' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons
grep -nEi '(suggested filename|<uuid>|playwright-artifacts|pasted download|SIGHUP|SIGINT|refusal reason|--rev HEAD|short hash|short rev|off.branch)' /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2
```

## Isolation

Read-only scout. No production files, source files, tools, or packages were written or installed. No clone, branch, or commit was created. The sole write was this seat-owned report in LANE.