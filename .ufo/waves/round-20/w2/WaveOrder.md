# WaveOrder: round-20 wave metadata guard facet

- Seat: TabiR20.WaveOrder (leaf; no dispatch). Author-side finding; not external closure.
- Checkpoint: 4ae99816b8994fdedc159156d8d9d242dd5c4782, parent c49929430d996b016dde2e3a3a5be380f3433fdb. Working-tree round-20 and corpus/evidence/round-20 paths match the checkpoint (`git diff --stat` empty).
- Exercised: read-only `git show`, `ls-tree`, `log`, `cat-file`, `status`, `diff --stat`, `bundle list-heads`; `sha256sum`; `jq` (jaq 3.1.1, preinstalled); file reads; grep.
- Not exercised: `check-wave.mjs` (CLI or `--selftest`), any test, build, formatter, or network fetch. No tool installed or updated. Nothing committed; this file is the only write.

## Axes

1. Coverage: what the guard reads versus what the record says it establishes.
2. Binding: whether artifacts reference each other or their inputs by digest.
3. Order: what anchors time (self-asserted fields versus repo or external anchors).
4. Observer: who produced each artifact, and whether that is recorded.
5. Import fidelity: whether the import ledger shows what entered the production tree.

## Bottom line

- The guard is a finite shape-and-consistency check over self-asserted JSON. Its header (check-wave.mjs:5-8, 10-12), ExecFrozen.md:5, :42, SKILL.md:2248-2249, and isolation-ledger.json `snapshotLimits` disclaim observer and order. Those disclaimers are accurate about what the code reads.
- The record says more than that. LOG.md:1206-1208 states "Captured actual full-wave return ... before the first import", and integration.json:37-43 lists "actual full-wave return snapshot before imports" under `acceptedDissent`. Both rest on fields the guard never reads and on L1's own writes. No anchor outside L1 exists. Git cannot order snapshot against import: the only round-20 commit is 4ae9981, which holds the snapshot and all imports together (`git log -- .ufo/waves/round-20 corpus/evidence/round-20` returns only that commit).
- The independently checkable items (bundle hashes and heads, design and source hashes, checker hashes) all match their claims. They establish content identity, not capture time.

## Finite check versus actual evidence

| Artifact | Kind | What it establishes | Authenticates observer or order? | Status in record |
|---|---|---|---|---|
| check-wave.mjs CLI on w1 inputs | finite shape check | wave equality, nonblank agentIds, reconstruction words, phase/observed/baseline, status prefixes | No | never run on real inputs (ExecFrozen.md:3, :37, :41; integration.json:65) |
| `--selftest`, 10 fixtures | code checked against expectations | fixtures and expectations agree | No | not run; expectations and code are in one commit (ce92ca3) by one seat |
| return.json | self-asserted snapshot | phase/observed/baseline labels; porcelain list; writerHeads; source sha | No: captureActor, capturedAt, all64Settled are never read | consistent with the other records (see verified list) |
| before.json | self-asserted snapshot | path list at 2026-10-21T09:50:49.209998+00:00; no digests | No | read by no gate |
| swarm-registry.json, spec.json | self-asserted registry and spec | 64 members, names and roles match spec | No | consistent |
| isolation-ledger.json | self-asserted import ledger | writer commits, bundle hashes, importedAt, beforeIntegration true | No | bundle hashes and heads match; writer objects and clones absent from the lane |
| integration.json | self-asserted L1 record | design sha claims; post-import main edits; acceptedDissent | No: no timestamps, no edit hashes | design shas match |
| writer-bundles/*.bundle | artifacts | writer heads and content | Content identity only | sha256 and heads match ledger |

## Findings

### F1 (High, order): capture-before-import rests on self-asserted fields; the record's closure is stronger than the evidence

- Order anchors in the record, all self-written: return.json capturedAt 10:17:25.170471Z; isolation-ledger importedAt 10:17:47.976068Z (22.8 s later); return.json phase "return-before-integration"; observed true; captureActor "TabiR20 L1"; all64Settled true; checkpoint commit 07:21:32-03:00 (10:21:32Z).
- check-wave.mjs never references captureActor, all64Settled, or capturedAt in code (grep: capturedAt appears only in the header comment, line 7). The header states the timing rule is "Operational requirement, not enforced here" (lines 10-12).
- ConnHistorical.md:89-102 proposed a differential gate (before versus return; return.capturedAt must precede integration timestamps, ConnHistorical.md:120). None of it is implemented: the CLI takes only --spec, --registry, --snapshot; before.json is never read; no timestamp is compared.
- integration.json:42 marks the proposal "accepted". What was accepted is a phase label, not a gate.
- Corroboration exists but is not independent. The return status has 84 entries, all `??`; it lacks every writer deliverable (check-wave.mjs, measure-c1.mjs, isolation-ledger.json, integration.json, writer-bundles/, decisions.json, wave-check-expected.json, lifecycle-skill-section.txt). That is consistent with pre-import capture, but the file is L1's own write.
- Remedy: before any import, write the sha256 of return.json into the isolation ledger. Commit the snapshot alone on the baseline before any integration commit, so ordering becomes a commit-graph fact (commit dates are still self-set). Append a correction to LOG.md and integration.json rather than editing them.

### F2 (High, binding): no artifact is bound to another artifact or to its inputs

- return.json keys: all64Settled, baseline, captureActor, capturedAt, observed, phase, preexistingSourceSha256, status, trackedDiff, writerHeads. No wave, registry, spec, or digest. The guard never compares the snapshot to spec or registry.
- isolation-ledger.json `before` and `directReturn` are path strings with no sha256. before.json keys are baseline, capturedAt, observed, phase, status, trackedDiff; no digest.
- The check output (`report()`) is {schema, verdict, findings, details}. It records no input path or digest. ScoutRegistryHome.md:103 asked for "check-wave.mjs output that records the registry path and digest"; this was not implemented.
- Consequences: an edit to return.json after import is invisible to the ledger. By code reading (not run), a snapshot from another run at the same baseline (c49929...) passes against w1 inputs, because nothing ties it to w1.
- Remedy: ledger records sha256 of return.json, before.json, spec.json, swarm-registry.json. Check output echoes input paths, digests, and the checker's own digest. Snapshot carries the wave id, checked against spec.wave.

### F3 (Medium, coverage): the registered gate never runs the checker on the real wave

- run-checks.py:62-63 registers `check-wave.mjs --selftest` only (expectedExit 0). The CLI row at SKILL.md:2244 names the w1 files as its entry command; no registered run executes it.
- The only committed mentions of the gate's output schema are the code (check-wave.mjs:39) and ExecFrozen.md:9. No receipt exists (`git grep` for `tabi-r20-wave-check-v1` and `wave-provenance` finds only code, run-checks.py, and reports).
- Expected by contract that main runs it later; any receipt it produces should carry input digests (F2).

### F4 (Medium, completeness): registry membership, count, and spec correspondence are not checked

- checkMembers only requires a nonblank string agentId on each member. spec.items is never read; only spec.wave is. No count check. By code reading (not run), a registry with one nonblank member passes, and so does one with 64 wrong names. ExecFrozen.md:42 discloses "does not verify ... the 64-member count against spec items."
- record.json (a second copy of the registry) is not an input. ScoutRegistryHome.md:99-102 asked for both files.
- Actual data is consistent, verified: spec item names and registry keys share sha256 5e5dd0d2...; name+role sha256 772cb305... for both; 64 and 64; 0 duplicate agentIds; 0 blank or non-string agentIds; record.json members equal swarm-registry.json members (sha256 28720538...). The current data passes for reasons outside the guard.

### F5 (Medium, order): "all 64 settled" has no machine-recorded per-seat completion

- task-result.json is the spawn receipt: details.results is []; 64 progress entries, all status "pending", all durationMs 0; async state "running" (job TabiR20.ExecCounter). Verified.
- dispatch.json and swarm-registry.json carry agentId null at dispatch and no completion times.
- ExecFixtures-return.txt reports `status="completed" duration="26m19s"` with no start time. It is absent from the return status, so it did not exist at capture. Its start is bounded only by the registry (last write 09:51:12.050Z). For completion to precede capture at 10:17:25.170Z, its start must be at or before 09:51:06.170Z. The record does not show that. [INFERENCE from the stated duration.]
- Seat-authored windows (for example CriticIsolation.md:5 "Window: 09:52Z to 10:18Z") are prose and unauthenticated.
- Result: all64Settled is an unread boolean with no independent support.

### F6 (Medium, reconstruction): the marker scan is shallow, and the header claims more than the code does

- check-wave.mjs (the loop in checkSnapshot) scans only top-level keys and top-level string values. Nested objects and arrays are not scanned. The header says "no reconstruction marker may appear outside the status and trackedDiff payloads."
- Concrete pass (by code reading, not run): a snapshot identical to return.json except that writerHeads is `{"note": "reconstructed from mtimes"}` passes. writerHeads is the only field carrying commit identities, and it is nested.
- The round-19 spelling (`laneStatusAfterMethod: RECONSTRUCTED`, a top-level string) is the one form caught. A reconstruction with the right keys and no marker passes. The disclaimer "not an unforgeable observation" covers this, but "no reconstruction marker" is narrower than the header claims.

### F7 (Medium, binding): the reported mid-wave design change is invisible to the guard; the before/return differential cannot be computed

- design.json is not the declared copy. Its sha256 1c9f536e... matches integration.json designAuthoritativeSha256; design-declared.json sha256 37fa4eab... matches declaredDesignSha256 (both verified). Seat reports say the lane file was rewritten at 10:02:31Z, after dispatch (ExecFrozen.md:51; CriticIsolation.md F6). That timing is mtime-based and was not re-derived here. No record gives the design.json bytes at dispatch.
- Writers used different copies: ExecFixtures-return.txt:16 "built against lane design.json sha256 1c9f536e... The clone's 37fa4eab... copy was not used"; ExecFrozen.md:51 "no design dependency beyond baseline and source.path"; CriticIsolation.md F15 reports ExecCounter read the declared copy for spans and 1c9f536e for the LC11 sourceId.
- before.json lists design.json only as a path; return.json has no design sha. ConnHistorical.md rule 3 (preexisting entries byte-identical between before and return) cannot be evaluated from either snapshot, and the shipped guard never reads before.json.
- Result: per seat reports, the contract changed between dispatch and return. No metadata records which version each writer used.

### F8 (Medium, import fidelity): the import ledger does not show what entered production; the writer evidence is bundles only

- isolation-ledger.json gives per-writer commit, changedPaths, bundleSha256, and one importedAt. It has no per-path import record and no production blob hashes.
- integration.json:19-36 lists post-import main edits (decisions.json "remove uncontracted round key"; knowledge note; skill section "LC05 callsite only; LC09 ToLocal-failure arm only ... LC12 operative code quote") with no hashes and no pre-edit digests. The production decisions.json has keys decisions, schema, scope, source, with no round key: consistent with the edit, but not provable from the ledger.
- Writer commit objects are absent from the lane object database. `git cat-file -t` fails for all four heads (33ebd05, 7908955, ce92ca3, 900cf5c), and none is an ancestor of 4ae9981. The clones/ directory named in the ledger no longer exists. CriticIsolation.md F12 warned "Fetch by SHA before any rm -rf of clones"; the record has no fetch receipt.
- Verified: each bundle's sha256 equals ledger bundleSha256 (ExecCounter 34934f84..., ExecFixtures 77ccf1ad..., ExecFrozen da0c627f..., ScribeLifecycle e9e11480...). `git bundle list-heads` heads equal the ledger commits and return.writerHeads (4 of 4). Bundles were not unpacked and `git bundle verify` was not run.
- Result: writer-to-production equivalence cannot be checked from the record. Only the bundle contents can be checked, once unpacked.

### F9 (Low, coverage): the path-scope check is a raw string-prefix test

- checkSnapshot tests `path.startsWith(prefix)` after only a quote check. No normalization. `.ufo/waves/round-20/../../../x` passes out_of_scope. Git porcelain would never emit `..`, but the check exists for hand-written snapshots, so it fails open on the class it guards.
- The directory-level allowance also admits any untracked output under `.ufo/waves/round-20/`. A writer that writes measure-c1.mjs into the lane instead of its clone passes. CriticIsolation.md F5 documents the same blind spot.

### F10 (Low, observer): producer and observer are undocumented; the snapshot differs from the planner's template

- captureActor is free text "TabiR20 L1". L1 is also the sole integration owner (spec.json context: "L1 holds planner and sole integration owner"). Observer and integrator are one actor.
- All four writers and L1 share one commit identity, `tabi-shokunin <tabi@shokunin.local>` (isolation-ledger identities; CriticIsolation.md F3). Authorship does not identify a seat.
- ConnPlanner.md:149-166 proposes a node script writing {phase, observed, baseline, status, trackedDiff, capturedAt} with `capturedAt: new Date().toISOString()`. The committed return.json adds all64Settled, captureActor, writerHeads, preexistingSourceSha256. Its timestamps (return, before, ledger, source-opening) use microseconds with +00:00 (the form Python's datetime.isoformat emits). The registry uses milliseconds with Z (the JS form). [INFERENCE] The snapshot was not produced by the planner's template as written; the producer is not recorded.
- ConnPlanner.md:123 says check-wave "validates return snapshot provenance." It validates field shape only.

### F11 (Low, record accuracy): cross-check discrepancies in committed text

- ExecFrozen.md:37 says w1/record.json shows `registry: null`. The committed record.json has no registry key (verified: keys are createdAt, members, path, reportDir, schema, updatedAt, wave).
- ExecCounter.md:10 (committed) says HEAD c1dc034. Git and the ledger say 33ebd05 (CriticIsolation.md F16). outcome.json (untracked; not in checkpoint) acknowledges "initial markdown predates final commit," but the committed report is stale.
- The expectations file's scope ("Independent expectations") and LOG.md:1213 ("independent fixture expectations") overstate independence. Both files were authored by ExecFrozen in commit ce92ca3 (isolation-ledger assignedPaths and changedPaths).
- outcome.json and ExecFixtures-return.txt postdate the snapshot (both absent from its status). The snapshot is not the closing state of w1, and the record does not say when those files were written.

### F12 (Low, testing): several guard branches have no fixture

- The 10 fixtures cover the six named codes plus phase, reconstructed-marker, and source-entry. Not exercised by any fixture: baseline mismatch alone; missing trackedDiff; non-porcelain status line; quoted path; `..` path; nested marker; membership or count mismatch; duplicate agentIds. [Reasoned from code.]
- By trace, the 10 expectations match the code's output for each fixture. Not run; main's run is the check.

## Verified consistent (content identity only)

- Writer heads: return.writerHeads equals the ledger commit equals the bundle head, for all four writers.
- Bundle sha256 equals ledger bundleSha256 for all four bundles.
- design.json sha256 1c9f536e... equals integration.json designAuthoritativeSha256; design-declared.json 37fa4eab... equals declaredDesignSha256.
- S096 source sha256 8c8d6796... equals return.preexistingSourceSha256, design.json source.sha256, source-opening.json decodedSha256, and the committed blob (`git show | sha256sum`).
- check-wave.mjs sha256 c073c245... and wave-check-expected.json sha256 963762a7... equal the values ExecFrozen.md:35 reports.
- spec.json items: 64; swarm-registry.json members: 64; same names and roles; wave "tabi-round-20-w1" on spec, registry, and record.
- outcome.json (untracked; not in the checkpoint) role counts (executor 3, scribe 5, scout 25, reviewer 16, connector 4, critic 6, revenger 5) equal the registry's role counts.
- return.json status: 84 entries, all `??` (4 clone directories, 63 w1 reports, 7 w1 JSONs, 10 wave and source entries); this matches CriticIsolation.md's 10:17Z count. It contains no check-wave, ledger, integration, outcome, or ExecFixtures-return entry.

## Residual risk

- The guard catches reconstruction only when it carries a top-level marker (the round-19 spelling). It checks phase and observed as written. A careful reconstruction with the right keys passes, and nothing ties the snapshot to the repo state or to this wave.
- Capture-before-import, observer identity, and the "all 64 settled" premise rest on L1's assertion. No external anchor exists.
- Writer-to-production equivalence for the four writers cannot be checked from the lane now that clones and writer objects are gone. Only the bundles remain.

## Verification gaps

- check-wave.mjs was not run (CLI or `--selftest`); fixture results are a code trace, not an execution.
- Bundles were not unpacked; `git bundle verify` was not run.
- Seat-reported commit times (CriticIsolation.md F4, F16) and design.json mtimes (ExecFrozen.md:51; CriticIsolation.md F6) were not re-derived; the lane objects needed for that are absent.
- Source bytes were not re-fetched from Gitiles (outside this facet).

## Smallest corrections

1. Bind before import: sha256 of return.json (and of `git status --porcelain=v1 -uall`) into isolation-ledger.json; snapshot committed alone before any integration commit.
2. Check output echoes input paths, sha256 of spec, registry, and snapshot, and of check-wave.mjs. Snapshot carries wave id, checked against spec.wave. Count equals spec.items count, with name-set equality.
3. Either read captureActor and all64Settled (type and presence) or drop them from the snapshot so the file does not imply a check.
4. Scan nested values recursively for markers, or narrow the header claim to top-level fields.
5. Normalize paths before prefix tests: reject `..`, absolute paths, and backslashes.
6. Record the sha256 of each design file each writer read, and the mid-wave rewrite (time and digest), in the ledger.
7. Before deleting clones, fetch each writer head into a non-master ref in the lane (or keep bundles with verified heads), and record the fetch.
8. Append corrections to LOG.md and integration.json (do not edit historical bytes): "capture timing is self-asserted; ordering is not independently evidenced."
