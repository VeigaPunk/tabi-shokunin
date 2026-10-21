# ReviewReturnBoundary: round 20 w1 return, integration ledger, r19 boundary

Seat: TabiR20.ReviewReturnBoundary (reviewer, leaf, no dispatch). Read-only; this file is the only write. Baseline c49929430d996b016dde2e3a3a5be380f3433fdb. Checkpoint 4ae99816b8994fdedc159156d8d9d242dd5c4782 (lane HEAD = master; `git diff --name-only` against it is empty at review time). Times are UTC. Author-side review; not external closure.

## Verdict

Capture-before-import holds, on filesystem evidence. "Full-wave" and "all settled" are assertions that the record does not carry: the return snapshot records names and status only, and one w1 report changed after import. No round-20 text sells current evidence or reconstruction as an r19 repair, and r19 bytes are unchanged. The integration ledger omits committed L1 edits; one committed rendering diverges from its staged source; two committed citations point to absent files.

## Axes

| Axis | Result |
|---|---|
| A1 capture order | PASS |
| A2 snapshot content, observed vs asserted | PARTIAL |
| A3 settlement and completeness | FAIL as asserted (H1) |
| A4 ledger fidelity to committed bytes | PARTIAL (H2, H3) |
| A5 r19 boundary and historical bytes | PASS |
| A6 contract identity across the wave | PARTIAL (H4) |

## High

**H1. Settlement is asserted, not recorded (A2, A3).**
- return.json `all64Settled: true` and outcome.json `allSettledBeforeImport: true` have no per-seat source. The w1 registry (`updatedAt` 09:51:12) has 64 members, all `kind: spawn`. record.json has no completed, settled or terminal token; task-result.json has no `"completed"` token. Nothing in either records seat state after 09:51:12.
- Capture at 10:17:25.170 (birth .179) recorded 84 `??` entries: 4 clone dirs, 10 wave-dir and source entries, 70 w1 files. The 70 equal the w1 files present now minus return.json, ExecFixtures-return.txt and outcome.json (set comparison). CriticIsolation.md line 200 independently counts 84 at 10:17Z.
- ExecFixtures has no report. Its handoff, `w1/ExecFixtures-return.txt`, was created 10:17:47.976, after capture. Completion is inferable only: "duration 26m19s" puts it near 10:17:08–10:17:18 (inference).
- CriticIsolation.md (born 10:03:24) was last written 10:18:34.135: 47 s after importedAt (10:17:47.976) and 69 s after capture. Its body reads "Window: 09:52Z to 10:18Z". Its return-time text is unrecoverable (no hash taken). The other 62 reports were last written by 10:13:40.
- Under QUALITY 48 (a reconstructed or irrecoverable observation stays unprovable), the supportable claim is: 63 reports and the ExecFixtures commit existed at capture; CriticIsolation.md changed after import; no per-seat settlement record exists. Neither field should be cited as closure evidence.

**H2. Integration ledger omits committed edits, and one rendering diverges (A4).**
- integration.json `mainIntegrationChanges` covers decisions.json (round key; LC05; LC09; LC12 quote), the note (heading; S100-anchored caveat; no wire mapping) and the "skill section" (the same LC items). Every decisions.json change matches the 900cf5c→4ae9981 diff exactly.
- Committed but not in the ledger: QUALITY.md criterion 50 (+6), corpus/README.md round-20 section (+18), SCORECARD.md round-20 section (+12), LOG.md round-20 entry (+30), SKILL.md round-20 section (+54, 0 deletions), and a SOURCES search-log line (+2).
- SKILL.md's round-20 section is not the staged `.ufo/waves/round-20/lifecycle-skill-section.txt`. The 12 LC table rows are identical (diff exit 0). The SKILL section adds an H2 wrapper, a rewritten intro, a "Use the table without converting calls into outcomes" paragraph and a "Registry — round 20" table. It drops the staged nine-item "Finite failure checklist", the "Scope limits" paragraph and the staged "Finite sample, not exhaustive coverage" sentence; a search of SKILL.md finds none of these strings. w1/spec.json's ScribeLifecycle item requires "include finite failure checklist". The checklist survives only in the note.
- Two divergent renderings of one section are committed. Record the divergence and its reason in integration.json, or restore the checklist into SKILL.md.

**H3. Committed citations point to artifacts that do not exist (A4).**
- QUALITY.md criterion 50 cites `(lesson: corpus/lessons/round-20.md#mistakes; …)`. No such file exists at 4ae9981; the newest round lesson is round-19.md. QUALITY 28 requires pointers in QUALITY rows to resolve as committed bytes, so the checkpoint fails its own rule. The LOG round-20 entry (lines 1213–1215) calls QUALITY50 "lesson-backed".
- SKILL.md line 2243 pins `.ufo/waves/round-20/measurement-binding.json`. The file is absent in the lane and at 4ae9981.
- Fix: remove the lesson pointer and "lesson-backed" until the one-write lesson lands; drop or create the binding file.

**H4. The contract changed mid-wave, and no seat or snapshot binds the revision (A6).**
- design.json was rewritten in place at 10:02:31.862 (birth 09:49:45), about 11.5 min after the w1 spawn call returned (task-result.json, 09:50:59). design-declared.json (sha 37fa4eab…, born 10:02:19) preserves the earlier copy. The three deltas: LC11 gains `sourceId: S100`; LC12 topic changes; skillRendering changes. Spans are unchanged. Authoritative sha 1c9f536e….
- w1/spec.json (dispatch, 09:50:40) still states "source registry S096" for ExecCounter's item. At least four reports name a design sha: CriticIsolation.md, ExecCounter.md (lines 22–24: read the declared copy, then adopted 1c9f536e), ExecFixtures-return.txt and ExecFrozen.md. The grep output was truncated after ExecFrozen.md and not paged further. Sampled reports cite design.json by path only (e.g., AttackLC01.md line 5).
- return.json records no design sha. The dispatch-time sha is unobserved; design-declared.json is a proxy taken about 13 s before the rewrite.
- Consequence: the w1 reports span two contract revisions. The ledger must say so, or bind each seat to the revision it read.

## Medium

**M1. ScribeLifecycle.md is stale and undisclosed.** The report (written 09:56:23, 15 s after commit fdf9e149) describes fdf9e149 as "current HEAD". Three later commits followed: 2f86841 (09:57:29), b9028815 (10:00:17), 900cf5c (10:05:49). outcome.json reportExceptions lists ExecFixtures and ExecCounter only. Add ScribeLifecycle.

**M2. w2/before.json was rewritten after capture.** capturedAt 10:22:43.861; birth 10:22:43.879; last write 10:23:00.253. The file does not say which write added its timingLimit note. Its own disclosure makes it post-spawn (task-result 10:22:43.838). Treat it as advisory; do not cite it as pre-spawn.

**M3. Validation is overstated.** LOG line 1201 says "Built with64 validated seats." The only validation artifact is w1/registry-label-check.json (exit 0; wave-label equality, 09:51:07). No check-wave run is recorded. SCORECARD line 927 says "mechanically validated"; line 932 says "This is a declaration, not an executed measurement."

**M4. The raw identity is mislabeled.** source-opening.json `rawSha256` ff55d511…/`rawBytes` 91040 describe the decompressed base64 text, not the retained `source-opened.base64.gz` (25397 B, sha 46966f05…). Verified: `gzip -dc` gives 91040 B, sha ff55…; base64-decoding that gives 68278 B, sha 8c8d…. The first retrieval is not captured (disclosed). The earliest observed copy is the blob birth at 09:49:12, before the w1 before snapshot; openedAt 09:52:32 is a recording time.

**M5. L1 decisions have no record.** The orders that fixed design 1c9f536e, required S100 and authorized commit 33ebd05 appear only as quotations in seat reports (CriticIsolation F15–F16; ExecCounter.md). The wave directory has no decision log.

## Low

**L1.** CriticIsolation ran plain git status/diff/log without `--no-optional-locks` (self-disclosed), so the lane index may have been refreshed. No tracked content changed.

**L2.** source-counts-before.json was removed before capture (present in a 06:52 local listing; absent from the return status and now). integration.json calls it a discarded scaffold; no time or actor is recorded.

**L3.** L1-created tooling (lesson-history.mjs, created 10:04:46 per CriticIsolation F6; run-checks.py; counts.mjs) is not attributed in isolation-ledger.json.

**L4.** The four writer clones are gone. Their commit objects survive only in the four bundles, which are tracked in 4ae9981 and all pass `git bundle verify`. Acceptable; the deletion is unrecorded.

**L5.** S100 is a second tier-A row for S096's bytes (rows 99→100; tier A 86→87 per counts-before.json). Its teaches cell disclaims independence; restate the counts in the ledger.

## Observation vs assertion

| Claim | Class | Basis |
|---|---|---|
| return precedes first import | Observed | fs birth/mtime: return 10:17:25; bundles 10:17:47.953–.973; lane copies 10:17:47.974–.975; ledger 10:17:47.976 |
| status: 84 `??`, 70 w1 | Observed, corroborated | set comparison with current tree; CriticIsolation 10:17Z count |
| trackedDiff "" | Observed | porcelain status lists no tracked line |
| writerHeads; bundle shas; identities; changedPaths | Observed | bundle list-heads and log; sha256sum; diff --name-status |
| importedAt 10:17:47.976 | Self-stamp | equals the ledger's own write time to about 1 ms |
| beforeIntegration: true | Consistent | timestamps only |
| all64Settled; allSettledBeforeImport | Asserted; contradicted for CriticIsolation.md | H1 |
| captureActor "TabiR20 L1"; observed: true | Asserted | no identity record; check-wave disclaims actor and order (check-wave.mjs lines 6–8) |
| 64 seats; role counts | Observed | registry query; file-name classes |
| dispatchRefusals 0; deadSeats [] | Asserted | no refusal or death record; dispatch counts spawn 64 |
| design shas 1c9f536e, 37fa4eab | Observed | sha256sum; match integration.json |
| S096 bytes (1740 lines, 68278 B, 8c8d…) | Observed | sha256sum, wc, live re-fetch |
| rawSha256 / rawBytes | Observed, mislabeled | M4 |
| "lesson-backed QUALITY50"; "validated seats" | Contradicted / unsupported | H3, M3 |
| "verification not yet run" | Consistent | no run artifact |
| no reconstruction sold as r19 repair | Observed | text: LOG 1206–1208, README 449–452, SKILL 2204–2205, SCORECARD 934; r19 bytes unchanged |

## Verified OK (observed)

- Capture precedes first import: return.json capturedAt 10:17:25.170 (birth .179, mtime .180), with 22.8 s before the first import artifact.
- Writer heads 33ebd05, 7908955, ce92ca3, 900cf5c are present in bundles; commit times 10:00:09–10:16:44 precede capture. Bundle sha256 matches the ledger (4/4); bundle verify is okay (4/4); identities and changedPaths match commit data.
- Production bytes equal the writer commits for measure-c1.mjs (sha fab3bde4…, version 3), selftest-c1.mjs, corpus expected.json (458a9f3f…), check-wave.mjs and wave-check-expected.json.
- design: lane 1c9f536e and declared 37fa4eab match integration.json; spans unchanged across the amendment.
- S096: tracked at 4ae9981 as blob cd7efa45; live re-fetch of the pinned Gitiles URL today reproduces sha 8c8d… and 68278 B.
- SOURCES: the S096 row changed in one cell only (used-by, +58 characters); the S078 row is md5-identical to baseline; the S100 row is present (mined, tier A, teaches "supersedes S096 —").
- r19 knowledge note, round-19 lesson and historical files: none of the 102 checkpoint entries touches corpus/lessons/, scripts/ or corpus/evidence/round-19/. LOG, SKILL, README, QUALITY and SCORECARD changed by append only (0 deletions).
- Role counts (connector 4, critic 6, executor 3, revenger 5, reviewer 16, scout 25, scribe 5) equal outcome.json roles and the report-file name classes.
- LC integration: the LC11 quote is at S096:810; the new LC12 quote at 829 (old quote 827); PrepareForSubmission returns at 639, 647, 659 and 679 are `return;` statements. All quotes sit inside declared spans.
- Scalar depth 8 and "not runtime-observed" wording agree across SCORECARD 927–933, SKILL 2201–2213, README 440–447 and the note's scope.
- Production tree: no tracked change since the checkpoint.

## Checks run (read-only)

- git without index writes (GIT_OPTIONAL_LOCKS=0 where status-like): rev-parse, log, diff --name-status and --numstat, show, ls-tree, cat-file, for-each-ref, bundle verify and list-heads.
- Scratch bare repo under /tmp/r20rv (fetched from the lane and the four bundles) for commit chains and blob diffs; removed afterward.
- sha256sum, wc, stat (mtime and birth), gzip -dc, base64 -d, diff, sort/comm and tr on scratch copies.
- Live primary-source opening: pinned Gitiles URL via curl, base64-decoded, sha256 8c8d… (68278 B).
- Not run (contract): counters, selftests, check-wave, check-sources, builds and tests. No tools installed or updated.

## Not exercised and limits

- Semantic accuracy of the LC rows and counter results were not checked.
- Clone state is no longer observable; writer identities were verified through the bundles only.
- Birth time resets on atomic rewrite (e.g., swarm-registry.json, record.json). Birth bounds are used only for single-write files: return.json, before.json, ExecFixtures-return.txt.
- Return-time text of w1 reports is not recoverable beyond names and mtimes.

## Recommended fixes before serial verification

1. Rescope `all64Settled` and `allSettledBeforeImport` to the recorded facts (H1). Name CriticIsolation.md's post-import write.
2. Add every committed L1 edit to integration.json, and record or reverse the SKILL checklist divergence (H2).
3. Remove the dangling lesson pointer and the "lesson-backed" claim; drop or create measurement-binding.json (H3).
4. Record the two design revisions, and which seats read which where known (H4).
5. Add ScribeLifecycle to reportExceptions; reword "validated seats" and "mechanically validated" (M1, M3).
6. Relabel source-opening.json `rawSha256` as the decompressed base64 text sha (M4).

Report: .ufo/waves/round-20/w2/ReviewReturnBoundary.md
