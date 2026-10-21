# ScoutOutsideReview — round 20 (TabiR20.ScoutOutsideReview)

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` (detached HEAD; equals `refs/heads/master`).
- Observed: 2026-10-21T09:55Z. Author-side leaf seat: no dispatch, no tests, builds, counters or runtime captures. No production file, clone or Git index was written; only this report was written.
- Scope: round-19 spot-check existence; operator lesson files; routed duties (round 19 not re-audited); primary paths `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/evidence/round-20/sources/html_form_element.cc`.

## 1. Requested checks

### 1.1 Round-19 spot-check: absent

- `corpus/lessons/round19-verifier-spotcheck.md` and `corpus/lessons/round-19-verifier-spotcheck.md`: both absent. A lane-wide glob for `*spotcheck*` (corpus/, .ufo/, round-20 clones) finds rounds 1 and 12–18 only. The newest is `round-18-verifier-spotcheck.md` (tracked).
- Fleet root (`find`, depth 7, `.git` and `node_modules` pruned): `round-19-verifier-spotcheck.md` exists in six sibling lanes (kaidoku, kama, tameshi, mado, tsukuroi, souji), not in tabi. A word-bounded `\btabi\b` search of those six files has no matches, so no sibling spot-check routes a duty to tabi.
- The lane's record says outside closure is pending: `corpus/lessons/round-19.md:198-202`; `SCORECARD.md:872` ("admission withheld"); `SCORECARD.md:921-922`. The fleet README (`README.md:42-43`) requires a non-author spot-check of at least one admission and one rejection. An author-side seat cannot produce it.
- Because no round-19 spot-check exists, no spot-check-routed duty can be read. The duties in section 2 come from the round-19 lesson, `SCORECARD.md`, lane `LOG.md`, and fleet L0 rows.

### 1.2 Operator lesson files: none

- No `corpus/lessons/operator-*` file. No `author: operator` teaching file; the only hits are negative-search statements at `corpus/lessons/round-14.md:52` and `round-15.md:55`.
- Operator-facing artifacts that do exist:
  - `corpus/handoffs/operator-approval-request.md`: tracked, 121 lines, sha256 `94dc63f5…f1ac0aa`, matching the pin in fleet L0 row 25. No resolving row.
  - Fleet `.ufo/l0-questions.md` rows tagged tabi (section 2, D2 and D8).
  - `corpus/lessons/user-20261015-r01..r06.md`: USER-lane rounds (`/user:swarm`), frozen under the USER gate.
- Fleet `LOG.md:801-826` operator directives concern seat model routing, not lesson routing. No tabi duty is found there.

## 2. Routed duties (open or carried; recorded, not re-audited)

| ID | Duty | Evidence | Owner | Status |
|---|---|---|---|---|
| D1 | Non-author spot-check of round 19 (≥1 admit, ≥1 reject) | `README.md:42-43`; `SCORECARD.md:872, 921-922` | external verifier | absent |
| D2 | Owner-approved policy for lesson corrections under the frozen USER gate | `.ufo/l0-questions.md:76` asks "What owner-approved compatibility policy should govern subsequent lesson corrections?" | operator | **open**. Row 77 is an orchestrator ruling ("Main, in-session"), not owner approval. `SCORECARD.md:912-919` calls the disposition "resolved in the fleet L0 queue"; row 76 is still unanswered. |
| D3 | USER refusal set grew `[round-18.md]`→`[round-18.md,round-19.md]` (count 1→2) | `SCORECARD.md:890, 902-904`; `round-19.md:157, 189` ("no-harm is NOT established") | operator (USER gate) | open. Orchestrator grades it "axis unaffected" (`.ufo/waves/round-19/final/l0-ruling.txt`; `SCORECARD.md:912-919`). |
| D4 | Trend verdicts in `round-19.md`: "quality harmed overall" (198-202) is superseded in-file by an orchestrator ruling (204-213) that reads "quality improved" | `round-19.md:189, 198-210` | author | the same lesson says no-harm is not established. Round 20 must not cite "quality improved" as no-harm evidence. |
| D5 | C3 d4: no direct return-time wave snapshot. Return-snapshot-before-integration is planned, not authorized | `SCORECARD.md:892, 908-910`; `LOG.md:1192`; QUALITY 45, 48 | integrator | historical gap unprovable. Round 20 `w1/before.json` is observed (09:50:49Z, trackedDiff empty); the return snapshot is pending. |
| D6 | Writer isolation: 16 source-evidence writers outside the 23-entry ledger; sixth non-scalar control beyond its assignment | `round-19.md:169-172` | author | retained; no complete-isolation claim |
| D7 | Source diversity: S098 queued (same bytes as S077); S099 same PDL as S041 | `round-19.md:166-168`; `SOURCES.md:112-113` | author | S098 queued; no independent-source credit |
| D8 | Tabi L0 rows: 25 (round-5 operator approval), 34 (round-1 namespace and dispatch wording), 62 and 65 (round-17 CDP lease and ruling scope) | `.ufo/l0-questions.md:25, 34, 62, 65`; no later tabi-tagged resolution row | operator | open |
| D9 | Frontier still open: real-site WebMCP; agent-side consumption; custom elements / ElementInternals; forms without toolautosubmit; file inputs; other Chromium builds | `corpus/README.md:407-410` | — | open |
| D10 | Generic S096 error-path citations do not entail HTML constraint or localized messages | `round-19.md:173-176`; QUALITY 47 | — | recorded |
| D11 | Round-18 routed defects 1–4 | `round-18-verifier-spotcheck.md:143-159` → QUALITY 40–45; LOG correction | author | dispositioned in round-19 record; not re-audited |
| D12 | Frozen step-1/step-4 closure-checker certification (protocol/operator debt) | `round-16-verifier-spotcheck.md:46, 153`; round-17 has only a manual table (`round-17-verifier-spotcheck.md:27`) | operator | carried; no frozen-checker run found in round-17–19 records |

## 3. Primary lane paths

### 3.1 `corpus/evidence/round-20/sources/html_form_element.cc` (S096)

Identity: verified.
- Local sha256 `8c8d6796…6916` (1740 lines, 68,278 B) = `design.json:19` pin = `SOURCES.md:110` (S096) = `SOURCES.md:92` (S078).
- Live fetch of the pinned gitiles URL (tag 154.0.8037.97), base64-decoded: sha256 is the same value.
- The committed round-19 retained body `corpus/evidence/round-19/sources/html_form_element.cc.gz` (git HEAD) decodes to the same value. S096 is the same bytes as S078: no new source ground (D7; QUALITY 38).

Tracking: not met.
- `corpus/evidence/round-20/sources/html_form_element.cc` is untracked (`??`). `git ls-files corpus/evidence/round-20` is empty. QUALITY 28 and 38 (own-work bytes bound to a Git object) fail until it is committed.
- Option for the integrator: cite the committed round-19 `.gz` (decode-verified) and drop the duplicate copy.

Decision spans (`design.json:24-121`): all 12 read against the file; each topic matches its code.
- LC01 181–186: `require_submit_button = !FastHasAttribute(toolautosubmit)`. Presence, any value.
- LC02 189–210: error return 196–198 precedes `is_currently_running_ = true` (204).
- LC03 249–258: missing-submit-button return 251–255 precedes `FillData` (258); lines 236–249 show no fill before it. This path fills no control.
- LC04 212–218: focus (215) and `PauseExecution` (217); no callback run.
- LC05 218–221: `PrepareForSubmission(nullptr, submit_button)`.
- LC06 224–229: `CHECK(is_currently_running_)` (225), then `kToolCancelled`.
- LC07 261–275: early return on null callback (263–265); the callback runs (266) before `is_currently_running_ = false` (267).
- LC08 290–298: `CHECK(tool)`; early return when not running (295–297).
- LC09 298–319: stringify-failure arm 307–312.
- LC10 320–327: rejected-promise arm.
- LC11 787–815: promise branch 790–806 with `CHECK(!should_submit)` (794); programming-error arm 807–813.
- LC12 818–830: `base::ok(String())` (829); comment 827–828.

Findings:
- F1 (defect): LC11 (787–815) is outside S096's declared anchors `174-328,729-758,818-842` (`SOURCES.md:110`). It is inside S078's `635-842` (`SOURCES.md:92`). The manifest must cite S078 for LC11, or S096 needs an anchor correction.
- F2 (overreach): LC12's "not JSON null" half is not entailed by S096 818–830. The non-JSON-null output statement is S097 (`inspector_web_mcp_agent.cc:208-243`; `SOURCES.md:111`). Cite S097 for that half or drop it (QUALITY 14, 47).
- F3 (QUALITY 33): S096 says it "supersedes S078" and that navigation returns "a null String sentinel, not an ordinary empty successful CDP payload". S078's row (`SOURCES.md:92`) still says "navigation submission returns an empty string" and its status cell carries no superseded marker. Add the marker in the mutable cell.
- F4 (framing risk): the metric counts rows (`c1_lifecycle_decisions`). Round 19 rejected "decisions = rows" (`round-19.md:19-20`). LC04/LC05 are two arms of one branch (`require_submit_button`); LC08–LC10 are arms of one function. The manifest should define the counting unit and justify each row as a distinct checkable branch; otherwise the claim should say "rows".
- F5: LC07's ordering (callback runs before state clears) is reentrancy-relevant. Note it as source text only.

### 3.2 `corpus/SOURCES.md`
- S078 (line 92): mined; used-by round-19 note; anchors `174-328, 635-842`; carries the "empty string" wording (F3).
- S096 (line 110): mined; used-by round-19 note; anchors `174-328,729-758,818-842` (F1); "supersedes S078".
- S097 (line 111): mined; anchors `47-64,208-243`; the source for F2.
- S098 (line 112): queued; same bytes as S077 (D7). S099 (line 113): mined; same PDL as S041.
- On round-20 admission, the used-by cells for S096/S097 need updating (integrator).

### 3.3 `SKILL.md`
- No round-20 heading yet (no "completion lifecycle" or "round 20" entries). The round-19 corrected table (2146–2181) is current. Its S096 citations (DV-06/11/18/20/22) use `729-758`, inside S096's anchors.
- The source-only qualification at 1994–1997 is superseded at `SKILL.md:2045`. The historical table (2049–2092) is marked historical; leave it.
- Round 20 must add a new heading with new rows. The design's `S096:START-END` form (`design.json:133`) differs from the file-qualified form used in SKILL tables (`S096 html_form_element.cc:181-186`). Consider matching the file-qualified form.

### 3.4 `corpus/README.md`
- Map complete: `diff` of the 37 `corpus/knowledge/*.md` names against README `knowledge/*.md` references → exit 0. QUALITY 11 holds for current notes; the round-20 note needs its row in the same commit.
- Round-19 entry (401–434) lists the note; frontier (407–410) keeps D9 open.
- `README.md:431–434` presents the orchestrator ruling as "current trend grading" while L0 row 76 (D2) is still open. Correct by appended pointer only; do not edit.
- Lines 1–8 are a dated round-3 snapshot: acceptable under QUALITY 11.

### 3.5 `corpus/QUALITY.md`
- All 49 criteria read (228 lines). Binding on round 20: 11 (README row in same commit), 14 (source-only evidence class), 28 (S096 path untracked), 33 (F3), 35 (no-harm receipt binds gates to measured revision), 38 (URL→bytes ✓; bytes→Git object ✗), 43 (re-derive counts before commit), 44 (w1 registries ✓, observed), 45 (clone ledger not yet present), 47 (F2, F4), 48 (no reconstructed snapshots; `before.json` is observed).
- Criterion 10 holds: `corpus/lessons/round-19.md` exists (213 lines).

### 3.6 `design.json` and lane state
- Pins (URL, sha) match S096. Absent, as expected pre-integration: `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `.ufo/waves/round-20/measure-c1.mjs`.
- Tracked tree clean. Round-19 final artifacts tracked (10 files, including `.ufo/waves/round-19/final/l0-ruling.txt`). Untracked round-20: `design.json`, 12 `w1/` files, four clone directories, and the `.cc`.
- HEAD detached at baseline, equal to `refs/heads/master` (consistent with QUALITY 29).
- Round-20 `wave` labels: `tabi-round-20-w1` in `swarm-registry.json`, `spec.json`, `dispatch.json`; `registry-label-check.json` exit 0 (observed, not re-run).

## 4. Commands (read-only except one network read)
- `sha256sum` of the `.cc`.
- `curl -sfL <gitiles URL> | base64 -d | sha256sum` (one network read; exit 0; sha `8c8d6796…6916`).
- `git show HEAD:corpus/evidence/round-19/sources/html_form_element.cc.gz | gunzip | sha256sum` (same sha).
- `git ls-files` and `git status --porcelain=v1 -uall` with `--no-optional-locks`; `git rev-parse`; `git worktree list`.
- `diff` of knowledge-note list vs README references (exit 0; 37 notes, 44 lesson files, 74 evidence dirs).
- `find` (fleet, depth 7) for round-19 spot-check filenames; word-bounded `\btabi\b` search of six sibling spot-checks.

## 5. Not tested / limits
- No counter, gate, self-test, runtime capture or browser run. Round-20 quotes and manifest do not exist, so quote and word-count checks are untested.
- Chromium authenticity is checked only to the extent that the gitiles-served bytes match the pinned sha.
- Round-19 measurements were not re-run or re-audited.

## 6. Tooling
No tools installed or updated. Used existing `curl`, `base64`, `gunzip`, `sha256sum`, `git`, `find`. No pacman.

## 7. Suggested checks for main (after integration; not run here)
1. Commit the S096 bytes (or cite the committed round-19 `.gz`); re-run the sha and gitiles-decode checks.
2. Resolve F1 (LC11 anchor), F2 (S097 cross-cite for LC12), F3 (S078 marker) and F4 (counting unit) before the manifest lands.
3. Keep round-19 lesson and knowledge bytes frozen; corrections as appended blocks, including an appended README pointer for L0 row 76.
4. Capture return snapshots before integration; build the clone ledger (QUALITY 45).
5. Restate D3 in any round-20 no-harm verdict (refusal 2; no-harm not established); do not cite "quality improved" as support (D4).

Report: .ufo/waves/round-20/w1/ScoutOutsideReview.md
