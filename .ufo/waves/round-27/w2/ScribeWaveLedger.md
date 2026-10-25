# ScribeWaveLedger — per-seat wave-evidence table skeleton (round 27)

Seat: `TabiR27.ScribeWaveLedger` (scribe, leaf, report-only). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Sources: `w1/swarm-registry.json`
(32 seats) and `w2/swarm-registry.json` (36 seats), both `ufo-swarm-registry-v1`;
roles taken from the registries (`agentId: null` in both, so no agent-level
evidence exists for any seat). Item summaries from each report's title line;
verdicts extracted from each report's tail. Report inventory at drafting:
round 27 w1 has **31** `*.md` reports for 32 registry seats → exactly one seat
has no report (see below). Wave 2 at drafting contains only `swarm-registry.json`
— **0 reports**, all w2 rows marked `pending`.

**Ledger convention:** `verdict` is the tail-stated outcome of the seat's own
report (read-only), not an adjudication by this seat. `dead — no report` marks a
registry seat with no report file on disk. `pending` marks wave-2 seats awaiting
reports.

---

## Wave 1 (round-27/w1) — 32 seats

| Seat | Role | Item summary | Verdict (tail) | Evidence pointer |
|---|---|---|---|---|
| ScoutReverifyLog | scout | (no report) | **dead — no report** | `.ufo/waves/round-27/w1/` has no `ScoutReverifyLog.md` (glob `*ReverifyLog*` → none) |
| ScoutReverifyRfc | scout | Independent re-open of the C3 source (RFC 9110 / entry S107), + addendum second pass | Source re-ground **sound**, confirmed independently (fetch byte-identical to committed blob and live upstream; all cited quote locations resolve; INFERENCE label honest; counter 1 at both revs; census 106→107). Open items are provenance narrative, not quotes: F1 (`ground:`/`Why this matters` overclaim) and F8 (RFC 7538 re-anchor doubtful, B.7 = "None"), both unlanded in worktree | `w1/ScoutReverifyRfc.md` |
| ScoutStagedGround | scout | C3 assimilation set re-adjudicated from primary bytes (S125 / S142 / staged entry) | C3 claim as frozen **met** (counting `git grep -lE '^source: S107 '` → 1; census exit 0; 106→107). S125 refused (E04 duplicate of S102); S142 refused as row — merge into S107; staged entry over-asserts 308 (M1 already landed). Addendum: souji w1 dispatch facts reproduced | `w1/ScoutStagedGround.md` |
| ExecC1Baseline | executor | C1 before-arm re-run + vacuity control | Baseline `mismatches=6` reproduced twice (five LOG-window findings + m3); receipt `observed` field non-reproducible (m3 reads live tree); knockout control specific; selftest 17/17; rev-blob 13/13 | `w1/ExecC1Baseline.md` |
| ExecC1Tip | executor | C1 after-arms re-run + correction-bullet audit | C1 after-arm on counter **PASS** (`mismatches=0` at tip, five baseline LOG findings superseded, selftest 17/17, do-nothing + wrong-number controls bite). Declaration-vs-shipped gaps F1/F2; F7 preamble parenthetical wrong (no verdict effect) | `w1/ExecC1Tip.md` |
| ExecC1Attacks | executor | C1 supersession semantics: attack + counter re-run | Independently confirms the falsification block's four statements; sharper statement: defect = before-number low (5 vs 6) + uncorrected `:221` at tip (count 1); kill rule holds (m1-only, m2/m3 untouched); F6 relative-`--repo` false clean; F3 22-line single-paragraph anatomy | `w1/ExecC1Attacks.md` |
| ExecC2Controls | executor | C2 skip-work controls | Kill-rule false positive **confirmed** (naive grep satisfiable by unrelated text, not evidence-bound; gate itself refuses states a/b/c/d). Prior fixture set re-run independently agrees; revision-relative counter observation reported (not a failure) | `w1/ExecC2Controls.md` |
| ExecC2Reopen | executor | Independent S106 re-open and C2 re-derivation at the repaired tip | Re-derivation reproduces the receipt (`valid=true` at 5577d1b and tip; decoded bytes identical to committed cc). F1: recorded measurement not at tip (recommend one tip run); F2: shortened kill rule in round-27 `claims.json` unreconciled; F3/F4 prose divergences; no blocker | `w1/ExecC2Reopen.md` |
| ExecCensusMirror | executor | C3 (coverage) scratch-mirror census gates reproduced end-to-end | All three gates reproduced: staged S124 → exit 1 E09; `s107-row.txt` → exit 0; real registry → exit 0, **107 rows**, 16 W04, zero E-codes; controls non-vacuous. O2: registry mutated mid-run (worktree S107 row no longer byte-identical to `s107-row.txt`) | `w1/ExecCensusMirror.md` |
| ExecSelftestSweep | executor | Lane gate self-test no-regression sweep (13 named gates) | 13/13 gate selftests green at named tip and HEAD (`check-s106-evidence` 5 cases at HEAD), `nonconformant=0`, wrong-flag controls exit 2; duplicate-seat collision on this report path flagged | `w1/ExecSelftestSweep.md` |
| ExecReportContract | executor | Routed lesson utility — `report-contract.mjs` draft | Utility works: 140-line, zero-dep, deterministic, 10 red/green controls, refuses false-green direction (fenced evidence, duplicate `## SHONEN`, box-count drift); deliberately not landed; not wired into any gate; no blockers | `w1/ExecReportContract.md` |
| ExecQualityGate | executor | C3 artifact mechanical check (entry + S107 row) | Entry front-matter trio, `ground:`, Unknowns, INFERENCE, frozen counting predicate: all pass. One enforceable violation (V1, 34-word quote > cap 25); one fidelity violation under frozen kill-rule wording (V2, note quote resolves only under table-stripped normalization). Registry row S107: **all checks pass** | `w1/ExecQualityGate.md` |
| ScribeLesson27 | scribe | Round-27 lesson (`corpus/lessons/round-27.md`) report-only draft | Independent draft differs from already-landed lesson: landed file cites non-existent `CORPUS.md` rule 2 (draft grounds on measured registry precedent); M3/M4 added beyond item's M1/M2; F4/F5/F6 recorded; L1 to adjudicate | `w1/ScribeLesson27.md` |
| ScribeLOG27 | scribe | Round-27 LOG.md append draft (report-only) | Draft tables carry `<L1 fills>` by instruction; late deltas: wave 2 confirmed dispatched (36 spawn), C2 evidence-of-record still declares C2 failed at `s106.json:25` (append-only correction recommended); housekeeping stray fleet write cleaned | `w1/ScribeLOG27.md` |
| ScribeScorecard27 | scribe | Round-27 SCORECARD blocks (report-only draft, v2) | v2 draft; ordered L1 asks: keep C1 verdict **failed** (zero artefact acknowledged from w1 adversarial reports), fix D11 re-dispatch-not-verbatim, fix D12 erratum, close D2/D4 counts, never ship `Dead seats: <recorded>`; one unreproduced C2 exit-2 observation | `w1/ScribeScorecard27.md` |
| ScribeQuality67 | scribe | Draft QUALITY criteria 67 and 68 (report-only) | Drafts; F1: Q68 instrument `report-contract.mjs` untracked at HEAD; F7: round-25 repaired report fails the bar it motivated; F8: HEAD vs worktree disagree (cases=4 vs 5) — commit criteria with the utility in the same change | `w1/ScribeQuality67.md` |
| ScribeReport27 | scribe | Round-27 report skeleton (round report) | Skeleton refreshed mid-wave; marker rule; conflicts on record kept verbatim (receipt vs tracked prose); `<PENDING: W1/W2 seat outcomes + L0>` | `w1/ScribeReport27.md` |
| SimplifyGateCode | simplifier | YAGNI review of the two round-27 scripts | Trim recommendations with preserved-contract boundaries; flags for critic/L1: C2 marker conjunct (`FEATURE_ENABLED_BY_DEFAULT`) not implemented, supersession citation vacuous (`/:\d+/`), `anchor_located` stricter than frozen wording, `paragraphs()` = blank-line block | `w1/SimplifyGateCode.md` |
| SimplifyEvidence | simplifier | Round-27 committed-evidence sufficiency and size | Evidence sufficient; trim list minimal (empty `w1-validate.err`; duplicate census receipt saves nothing). Cross-scope: C1 receipts record `mismatches=1`/`5`, not 0 — SCORECARD:1396 and LOG:1902 misstate; C2 receipt validates a gate revision no longer shipped | `w1/SimplifyEvidence.md` |
| RevC1FrozenFit | reviewer | Shipped C1 extension vs frozen round-26 predicate | Verdict: **deviation-real**. Association (a) conformant; paragraph unit (b) justified but over-merged (Finding 3 MEDIUM); stated-number extraction (c) carries two real soundness holes (**Findings 1–2 HIGH**: ambient-number pickup defeats frozen skip-work control; `/:\d+/` citation unbound to the stale line), latent at tip. Counter re-runs match committed receipts | `w1/RevC1FrozenFit.md` |
| RevC2Gate | reviewer | C2 gate review vs frozen C2 | **Conforms with flags**: frozen predicate/counter satisfied at tip (`valid=true`, exit 0), every frozen kill-rule path fail-closed exit 2 verified, selftest 5/5 (supersedes frozen 4-case list). Flag M1 content-pinning bypass, L1/L2 disclosure gaps, L3 comment overclaim; nothing blocks admission | `w1/RevC2Gate.md` |
| RevEntryC3 | reviewer | Entry review: `redirect-and-retry-after-semantics.md` | Verdict **ADMIT**: all six checks pass — in-province, grounded on fresh RFC 9110 bytes, quotes located, 308 INFERENCE honest, substantive (junk test PASS). Findings minor/cosmetic only | `w1/RevEntryC3.md` |
| RevSourcesS107 | reviewer | SOURCES.md row S107 vs census contract | No contract violation (v1 locators within tolerance; v2 strictly more accurate). **F1 MEDIUM**: reviewed row mutated mid-review — committed ≠ worktree (commit deliberately, then re-run `check-sources.mjs` and re-hash receipts). F2 locator span nit (4803–4804 outside 4805–4813); F3/F4 INFO | `w1/RevSourcesS107.md` |
| CritC1Supersession | critic | C1 supersession semantics: wrong-clear reproduces on fixtures and is live at LOG.md:221 | Wrong-clear **live** at `LOG.md:221` (cleared by a 183-line paragraph whose only `:N` match is `127.0.0.1:18751`, not 221). Minimal fix = entry-scoped + citation equality; the two windows are not one convention (header claim wrong on three counts); cross-script number laundering proven | `w1/CritC1Supersession.md` |
| CritC3Junk | critic | C3 honesty attack (junk reachability, real-vs-relabelled coverage, anchor cell) | **Improved — narrowly**: entry not junk (7/9 quotes resolve at tip; 308 INFERENCE correctly bounded), but the counter is junk-blind (cannot distinguish entry from a 149-byte filler; both mechanical surfaces pass) and `ground:` is false at tip (worktree one-line fix unlanded). Smallest corrections prioritized | `w1/CritC3Junk.md` |
| CritAssimProcess | critic | Attack on the addendum-§10 conformance of landed C3 | **D1 (medium, landing blocker if committed as-is)**: dirty S107 row edits three immutable cells → item (c) PASS at HEAD becomes FAIL at landing if that diff commits; smallest safe correction = revert `corpus/SOURCES.md`. D2 controls measured true; D3/D4 low | `w1/CritAssimProcess.md` |
| MutC1Gate | mutation-tester | Mutation probe of shipped C1 extension (4 single-point mutants) | All four mutants killed (m1/m2 by selftest; m3/m4 by bounded fixture detectors); m4 survives the frozen suite (coverage gap: no cross-document negative case); restoration verified byte-identical | `w1/MutC1Gate.md` |
| MutC2Gate | mutation-tester | Mutation probe of `scripts/check-s106-evidence.mjs` (C2 gate) | m1–m4 all **KILLED** via fixture detectors; gate's 5-case selftest catches only m1; production data cannot distinguish any mutant; `bytes_path` required-key survives at exit-code granularity; restoration verified | `w1/MutC2Gate.md` |
| ConnSiblingOverlap | connector | Sibling-overlap scan & non-obvious move synthesis | Scan complete; tabi/mado convergence on the six-section report contract observed (do not absorb); proposes dual-boundary redirect verification harness (entry-quote locator + journey invariants); no tracked writes | `w1/ConnSiblingOverlap.md` |
| ConnRedirectSurface | connector | Within-lane consistency & redirect surface synthesis | Within-lane consistent — entry merely extends corpus, zero contradictions; proposes method-rewrite + cross-origin 307/308 guards (depth 8→9, all other axes unharmed) | `w1/ConnRedirectSurface.md` |
| SentScope | sentinel | Round-27 wave-1 scope and safety audit (re-dispatch at tip `5ed6484`) | F1/F2/F8 fleet strays (no lane-authored content in tracked fleet paths); F10 credential sweep clean; F11 fixture deviations (F2 relative-path in fleet repo, F7 loose `/tmp` files); receipts gap (fetch record lacks HTTP status — 13 precedent lines have it); no tracked writes | `w1/SentScope.md` |
| RevStagedProvenance | revenger | Provenance of the staged C3 theme | Provenance verified (bytes, refetch, register, receipts re-run); suggested disposition: add one C3 clause naming S124's round-22 `absent-refused` verdict, record disposition lines for ten unadjudicated in-family rows, quote `absent-defect-register` with a caveat, commit the worktree entry fix | `w1/RevStagedProvenance.md` |

**Wave-1 dead-seat note:** `ScoutReverifyLog` is the only registry seat with no
report file; per the ledger convention it is `dead — no report`. All other 31
reports exist and were read at their tail.

---

## Wave 2 (round-27/w2) — 36 seats, 4 reports at final read

| Seat | Role | Item summary | Verdict | Evidence pointer |
|---|---|---|---|---|
| ExecC1Recount | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecC1LineAudit | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecC2Recount | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecC3Recount | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecSeparation | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecFreshAttack1 | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecFreshAttack2 | executor | Fresh receipt-parsing attack on `scripts/check-s106-evidence.mjs` | Findings (a)/(c)/(d) **CONFIRMED fail-closed** (string `anchor.line` → Refusal exit 2; hex-case mismatch flagged but falsely — uppercase digest = same bytes, fail-closed only; missing `anchor` → exit 2, kill rule respected). (b) **CONFIRMED**: trim-equality masks a real whitespace mismatch (LOW, does not create a new fabrication class beyond w1 M1). No blockers | `w2/ExecFreshAttack2.md` |
| ExecFinalTipMeasure | executor | Final-tip claim measurement sweep at `bceb17dd` | C1: `mismatches=1` = m3 only (`observed=2`), 0 LOG-window findings, `LOG.md:221` superseded. C2: `valid=true`, exit 0, all four conjuncts true. C3: row = 1 file, census `tabi ok` 107 rows (106→107). Gate registry: `nonconformant=0`, exit 0 | `w2/ExecFinalTipMeasure.md` |
| ExecW1Verify | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecW2Residual | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecCorpusInvariants | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecRegistryCount | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ExecW1Census | executor | (w2 dispatch) | pending | `w2/` — no report yet |
| ScribeFinalReport | scribe | (w2 dispatch) | pending | `w2/` — no report yet |
| ScribeL0 | scribe | L0-side report-only draft content (open questions, Stale-lane, tool-installs line) | Draft content only — no claim verdicts asserted. Tool-installs enumeration: w1-complete (28/31 report "none"; 3 carry no install statement), w2-pending at drafting; no installs recorded | `w2/ScribeL0.md` |
| ScribeClaimRecordAudit | scribe | (w2 dispatch) | pending | `w2/` — no report yet |
| ScribeWaveLedger | scribe | This report | — (this seat) | `.ufo/waves/round-27/w2/ScribeWaveLedger.md` |
| SimpEntryTrim | simplifier | (w2 dispatch) | pending | `w2/` — no report yet |
| MutC1Log | mutation-tester | (w2 dispatch) | pending | `w2/` — no report yet |
| MutC2Gate | mutation-tester | (w2 dispatch) | pending | `w2/` — no report yet |
| MutSupersessionEdge | mutation-tester | (w2 dispatch) | pending | `w2/` — no report yet |
| RevFrozenFit | reviewer | (w2 dispatch) | pending | `w2/` — no report yet |
| RevQuality67 | reviewer | (w2 dispatch) | pending | `w2/` — no report yet |
| CritClaimHonesty | critic | (w2 dispatch) | pending | `w2/` — no report yet |
| CritCorrectionGaming | critic | (w2 dispatch) | pending | `w2/` — no report yet |
| CritEntryIndependence | critic | (w2 dispatch) | pending | `w2/` — no report yet |
| CritMistakeQuality | critic | (w2 dispatch) | pending | `w2/` — no report yet |
| CritNovelty | critic | (w2 dispatch) | pending | `w2/` — no report yet |
| ScoutW1Findings | scout | (w2 dispatch) | pending | `w2/` — no report yet |
| ScoutRfcIndependent | scout | (w2 dispatch) | pending | `w2/` — no report yet |
| ScoutRegistryIndependent | scout | (w2 dispatch) | pending | `w2/` — no report yet |
| ScoutJunkCount | scout | (w2 dispatch) | pending | `w2/` — no report yet |
| SentFinalScope | sentinel | (w2 dispatch) | pending | `w2/` — no report yet |
| SentReportPath | sentinel | Report-path pre-flight sentinel (round-27 `tabi.md` + `report-contract.mjs`) | Utility verified 6/6 sections + SHONEN 4/4 boxes on equivalent fixture (false-green directions fail red); real draft `ENOENT` at pre-flight — L1 MUST re-run receipt after `ScribeFinalReport` lands. No blockers | `w2/SentReportPath.md` |
| ConnW1W2Patterns | connector | (w2 dispatch) | pending | `w2/` — no report yet |
| ConnAdjacentReport | connector | (w2 dispatch) | pending | `w2/` — no report yet |

**Wave-2 note:** at final read `w2/` holds `swarm-registry.json` plus four
seat reports (`SentReportPath.md`, `ExecFreshAttack2.md`, `ScribeL0.md`,
`ExecFinalTipMeasure.md`) — those rows above are filled; the remaining 31
non-this rows are `pending`. Registry `updatedAt` `2026-10-25T18:17:18Z`;
reportDir `.ufo/waves/round-27/w2`.

---

## Methodology / limits

- Roles: registry `role` fields (w1: 9 executor, 5 scribe, 4 reviewer, 3 scout,
  3 critic, 2 simplifier, 2 mutation-tester, 2 connector, 1 sentinel, 1 revenger
  = 32; w2: 13 executor, 5 critic, 4 scribe, 4 scout, 3 mutation-tester, 2
  reviewer, 2 sentinel, 2 connector, 1 simplifier = 36).
- Verdicts are tail extractions, one line each; full detail lives in each report.
- Read-only reporting: no tracked file touched; no git/jj writes; no peer
  messages; no subagents; no tool installs (nothing needed).
- This ledger is the wave-evidence table skeleton; it does not adjudicate any
  verdict — that is the L1/judge's call.
