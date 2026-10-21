# WaveOutScope: round-20 w1 metadata guard, status-path scope and provenance

Seat: TabiR20.WaveOutScope (leaf, no dispatch). Checkpoint 4ae99816b8994fdedc159156d8d9d242dd5c4782 (parent c49929430d996b016dde2e3a3a5be380f3433fdb). Checker `.ufo/waves/round-20/check-wave.mjs` at checkpoint, file sha256 c073c2459266…; expectations `corpus/evidence/round-20/wave-check-expected.json`, file sha256 963762a7675f….

## Constraints honoured

- Read-only except this file. No production edit, no clone, no subagent.
- Checker NOT executed (`check-wave.mjs`, `--selftest`). No tests, builds, formatters.
- Read-only commands only: `git --no-optional-locks` (log, ls-tree, diff, cat-file, bundle list-heads/verify, ls-files, check-ignore), sha256sum, stat, find (mtime), jq filters, comm/diff over sorted lists.
- Tools installed or updated: none.
- Predictions about checker output are [INFERENCE] from reading the code, untested.

## Verdict

1. The checker is a format and self-consistency guard. Its status-scope predicate is lexical and bypassable (F1), and its scope is a whole directory, not a per-seat path set (F2). It is not isolation evidence.
2. The real `return.json` is internally clean. All 84 status entries are untracked porcelain, under allowed prefixes, with no `..`. It is also complete for pre-capture files (V2, V3).
3. Independent evidence (bundle heads, digests, import mtimes, a lane-wide write scan) supports the writer identities and the import-after-capture ordering (V5–V8). It does not support "captured after all 64 settled" (F4). It cannot show that the design or source inputs stayed fixed across the wave (F5).
4. Ledger clone paths and writer heads are stale. Two of four writer clones no longer exist under the lane (F6). The integration record omits five tracked production files (F7).

## Timeline (UTC)

Derived from mtimes, commit dates, and self-reported timestamps. mtimes are corroborative only, never proof of order.

| UTC | Event | Source |
|---|---|---|
| 09:49:12 | preserved source `html_form_element.cc` last modified | stat |
| 09:50:49.198 | swarm registry created | `w1/record.json` createdAt |
| 09:50:49.210 | `before.json` captured (`before-dispatch`) | `before.json` capturedAt, mtime |
| 09:50:49–09:50:59 | 64 spawns; `task-result.json` written, 64 `pending` | dispatch.json and task-result.json mtimes |
| 09:51:12.050 | registry last updated (membership) | record.json updatedAt |
| 10:00:09 | ExecFrozen commits ce92ca3 | CriticIsolation topology table |
| 10:02:31 | `design.json` modified (now 1c9f536e) | stat |
| 10:14:35 | ExecCounter commits 33ebd05 | CriticIsolation F16; bundle head |
| 10:16:44 | ExecFixtures commits 7908955 | CriticIsolation table; bundle head |
| ~10:17:08–10:17:31 | ExecFixtures completion, derived from duration 26m19s | ExecFixtures-return.txt |
| **10:17:25.170** | **`return.json` captured, 84 status entries** | return.json capturedAt |
| 10:17:25.180 | `return.json` written | mtime |
| 10:17:47.95–.98 | bundles, check-wave.mjs, ledger, ExecFixtures-return.txt written (import) | mtimes; ledger importedAt |
| 10:18:34 | CriticIsolation.md last written, after capture | mtime |
| 10:21:23 | integration.json written | mtime |
| 10:21:32 | checkpoint 4ae9981 committed | git |
| 10:21:32.47–10:21:35.22 | first `.jj` writes after return | mtime |
| 10:23:47 | outcome.json written | mtime |
| 10:25–10:27 | clone trees populated under `final-clones/` (copied or rewritten) | mtimes |
| 10:29:33 | ExecFrozen commits 52e46de, after checkpoint | git log |
| 10:30:36 | ExecFixtures commits 7c98405, after checkpoint | git log |

## Finite check versus evidence

| Claim in snapshot or ledger | What the checker reads | Independent evidence now | Status |
|---|---|---|---|
| spec.wave = registry.wave | both fields (:72–73) | equal, `tabi-round-20-w1` | verified |
| 64 members with agentId | non-empty map; nonblank string (:82–) | 64 distinct `TabiR20.*` ids; spec items 64, identical name and role; role counts equal outcome.json | ids not confirmed as live agents (untested) |
| baseline | equality (:100) | parent of 4ae9981 = c49929430 | verified |
| phase, observed | equality; `=== true` (:99) | self-asserted; mtimes after capture | no referent |
| capturedAt | not read (header comment, line 7 only) | return.json mtime +10 ms; CriticIsolation's own 10:17Z count is also 84 (sibling, not independent) | consistent |
| all64Settled | not read | no state field in registry or record.json; task-result = spawn record; no ExecFixtures report at capture; sibling text conflicts | unsupported (F4) |
| captureActor | not read | none | no referent |
| writerHeads | not read | bundle heads match all four | verified at capture; later heads differ (F6) |
| preexistingSourceSha256 | presence line only (:109) | = worktree = checkpoint blob 8c8d6796 | verified now; no pre-dispatch digest (F5) |
| status: `??` only, in scope | predicates (:118–132) | jq re-application: 84/84 pass | holds; predicate bypassable (F1) |
| trackedDiff empty | equality (:115) | status has no tracked lines | holds |
| nothing else written before import | not read | pre-capture files listed; post-dispatch lane writes = 10, 5 unenumerated (F7); ignored, collapsed, `.jj` not observable (F2, F5, F10) | partial |
| design.json fixed during wave | not read | sha 1c9f536e = integration.json; mtime 10:02:31 after dispatch; no digest at dispatch | not established (F5) |
| ledger clone paths | not read | all four `clones/` paths dangle | contradicted (F6) |

## Findings

### F1 (Medium): the status-scope predicate is lexical; `..` passes

- check-wave.mjs:130 tests `path.startsWith(prefix)` on the raw porcelain path, with prefixes at :44. Paths `.ufo/waves/round-20/../../../<x>` and `corpus/evidence/round-20/sources/../../../<x>` return true, so no `out_of_scope`.
- The newer ExecFrozen version (52e46de, line 195) keeps the same predicate.
- Real snapshot: no `..` (jq, zero hits), so this does not change the real result.
- Real git porcelain never emits `..`. Exposure is a hand-written or edited snapshot, the case the header says the guard is for.
- Untested by execution; from string semantics. Fix direction: normalize, then reject absolute and `..` segments before the prefix test.

### F2 (Medium): scope is a directory prefix, not per seat; collapsed nested repos are invisible

- :44 admits every untracked path under `.ufo/waves/round-20/`, including all seats' reports, `design.json`, and nested clones. It also admits every path under `corpus/evidence/round-20/sources/`.
- `spec.reportDir` appears only in the fixture (:172). The ledger's `assignedPaths` are never read. `checkWave` reads only `spec.wave`.
- `git status` collapses untracked directories. The four return entries `?? .ufo/waves/round-20/clones/{ExecCounter,ExecFixtures,ExecFrozen,ScribeLifecycle}/` are whole nested repositories, and the snapshot shows none of their contents.
- After capture, clone trees were rewritten under `final-clones/`. 13,901 files there have post-capture mtimes.
- Consequence: an unassigned untracked file in any seat's directory, or a full production-tree copy inside the wave directory, passes.

### F3 (Medium): the reconstruction-marker rule is narrower than its header

- Header (:17–20): "no reconstruction marker may appear outside the status and trackedDiff payloads."
- Code (:101–106, test at :104): top-level keys and top-level string values only. Nested objects and arrays are not scanned. `writerHeads` is an object, so it is skipped.
- Passes today, by reading: `"provenance": {"method": "RECONSTRUCTED from mtimes"}`.
- The newer ExecFrozen version says so explicitly (52e46de line 164: "intentionally a top-level key/string check. Nested metadata is not traversed."). The checkpoint header does not.
- Untested by execution.

### F4 (High, unresolved): "captured after all 64 settled" has no checked evidence and conflicting sibling text

- The checker never reads `all64Settled`, `captureActor`, or `writerHeads`. `observed` is read only as `=== true`. `capturedAt` appears only in a header comment (line 7). The header lists "after all 64 registry members have settled" as an operational requirement, "not enforced here".
- No artifact records per-seat terminal state at capture. Registry members carry only agentId, item, kind, role (`w1/swarm-registry.json`; `w1/record.json` members have the same four keys). `w1/task-result.json` has 64 progress entries, all `status: "pending"`, `results: []`, `totalDurationMs: 2`. It is a spawn record.
- `w1/ExecFixtures.md` is absent (63 of 64 member reports present). `outcome.json` says "No markdown report". Its return text, `w1/ExecFixtures-return.txt`, was written at 10:17:47.976Z, after capture. It says "Delivery: not auto-delivered; recovered by this snapshot" and `duration="26m19s"`. With spawn activity between 09:50:49 and 09:51:12Z, completion falls between about 10:17:08Z and 10:17:31Z, straddling the 10:17:25.170Z capture. Metadata cannot resolve this.
- `w1/CriticIsolation.md` is listed untracked in return.json but was last written at 10:18:34Z. Its header window is "09:52Z to 10:18Z". Its sequence reads "2. Wait until all 64 seats are terminal" before "3. Take the full-wave snapshot". Its A4 reads "the return boundary is still all 64 seats settled." Read literally, a seat was still writing across the capture instant. This is ambiguous and the metadata does not settle it.
- `outcome.json` (10:23:47Z) asserts `allSettledBeforeImport: true`. That is a self-claim.
- Digest: return.json sha256 = 40e3cb38337aa743…. No artifact written before import records it. The first pin is commit 4ae9981 (10:21:32Z), after import.
- Corroboration only: CriticIsolation's own 10:17Z status count (84 = 4 clone dirs + 63 w1 md + 7 w1 json + 10 wave/source) equals return.json's 84. That seat is not independent of this snapshot.

### F5 (High for isolation claims): status-only capture cannot represent untracked inputs; design revision undocumented at dispatch

- `design.json` is `??` in before.json (09:50:49.21Z) and in return.json. Its mtime is 10:02:31Z. before.json holds no design digest.
- ExecFrozen's ce92ca3 (10:00:09Z) predates the change. ExecFixtures' 7908955 (10:16:44Z) postdates it, and its return says "built against lane design.json sha256 1c9f536e…". ExecFrozen's report (line 51) records the same change (LC11 S100, LC12 topic, skillRendering). Two executors committed against different design revisions. Neither the snapshot nor the ledger records which revision each used.
- `corpus/evidence/round-20/sources/html_form_element.cc` is `??` in before.json and in return.json. before.json holds no digest. Only mtime (09:49:12Z, before 09:50:49Z) supports no post-dispatch change. Return sha, worktree, and checkpoint blob all equal 8c8d6796…, but that equality is after the fact.
- Ignored paths are invisible to `git status` without `--ignored`: 824 lane files (`.jj/` 631; `corpus/evidence/round-13/aria/artifacts/` 190; `.ufo/interactive-sessions/` 3). The mtime scan finds none of the ignored files outside `.jj/` changed after dispatch.

### F6 (Medium): ledger paths and heads are stale; two writer clones are gone from the lane

- `isolation-ledger.json` `writers[].clone` points to `…/round-20/clones/<writer>` for all four. `clones/` is absent. `final-clones/` (populated 10:25–10:27Z) holds ExecFixtures and ExecFrozen only. ExecCounter and ScribeLifecycle clones do not exist under the lane. Their bundles are the only surviving copies (verified, V6).
- writerHeads and ledger identities are pre-checkpoint heads. Post-checkpoint commits exist in surviving clones: ExecFrozen 52e46de (10:29:33Z; check-wave.mjs and wave-check-expected.json; 2 files, +381/−116) and ExecFixtures 7c98405 (10:30:36Z; selftest-c1.mjs and expected.json; 2 files, +50/−4). They appear only in handoffs (`fixture-oracle-handoff.md`, `gate-conformance-handoff.md`), not in the ledger, integration, or return.
- Lane file versus clone HEAD differ for all four assigned files: check-wave.mjs c073c245… vs 40fae8d2…; wave-check-expected.json 963762a7… vs 2dc7c858…; selftest-c1.mjs 5804cf6a… vs e06e0dd2…; selftests/expected.json 458a9f3f… vs b52e5a2a….
- ExecCounter identity c1dc034 (ledger) cannot be checked now. The clone is gone and the bundle head list shows only 33ebd05.

### F7 (Medium): integration record omits five tracked production files; one citation dangles

- Post-dispatch mtime scan of the lane, excluding `.git`, `.jj`, and the wave directory, finds exactly ten files: LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md, corpus/README.md, corpus/SOURCES.md, corpus/evidence/round-20/lifecycle/decisions.json, corpus/evidence/round-20/selftests/expected.json, corpus/evidence/round-20/wave-check-expected.json, corpus/knowledge/webmcp-completion-lifecycle-round-20.md.
- `integration.json` `mainIntegrationChanges` lists decisions.json, the knowledge note, and "skill section" only. LOG.md (+30), SCORECARD.md (+12), corpus/QUALITY.md (+6), corpus/README.md (+18), and corpus/SOURCES.md (+5/−1) appear in no integration or ledger record. CriticIsolation's F8 says the same: "no writer owns these".
- corpus/QUALITY.md item 50 cites `corpus/lessons/round-20.md#mistakes`. That file does not exist (`test -e` → missing). The wave contract says the round-20 lesson is written only after final findings. The checkpoint therefore commits a citation to a path that does not exist.

### F8 (Low-Medium): the selftest is self-referential; "independent" is false

- wave-check-expected.json `scope` says "Independent expectations for … --selftest." The ledger assigns that file and check-wave.mjs to the same seat, ExecFrozen (ce92ca3). Same author.
- The fixtures take constants from the checker itself: ROUND_BASELINE (:41), RETURN_PHASE (:42), PRESERVED_SOURCE_LINE (:43) feed the positive fixture. A wrong constant would produce a matching fixture, so selftest cannot detect one. The constants are correct now: baseline equals the parent of 4ae9981, and phase and status line match return.json.
- `w1/registry-label-check.json` (`{"exit": 0, …}`) records no command, inputs, or digest, and repeats only the wave-equality check. It is not evidence.

### F9 (Medium, process): two checker versions; the lane runs the older one

- Lane (4ae9981): c073c245…, the version analysed here. ExecFrozen clone HEAD (52e46de, 10:29:33Z) adds `--frozen DIR`, with SHA-256 pins of the three inputs, symlink and regular-file checks, and a `snapshot_tampered` finding. The pins live in `expected.json`, which the same seat authors, so they are only as anchored as the commit that contains them.
- The newer version keeps F1 (line 195) and the narrowed marker scan (F3). It still does not read `all64Settled`, `captureActor`, `writerHeads`, `items`, or `reportDir` outside its fixture.
- `gate-conformance-handoff.md` describes 52e46de as the gate commit. The lane runs c073c245. Main must decide which is the gate.

### F10 (Low): `.jj` state changed after capture; actor not recorded; status cannot see it

- `.jj/.gitignore` is `/*`, so `git status` cannot see `.jj/`. The first jj write after return is 10:21:32.466Z, about half a second after checkpoint commit 10:21:32Z. The last is 10:21:35.22Z.
- The post-dispatch and post-return `.jj` file sets are identical. No jj write occurred in the 09:50–10:17 window.
- The actor is not recorded. The contract forbids seats from writing jj state, and no metadata says whether L1 is exempt.

## Verified (held under attack)

- V1. 4ae9981's parent is c49929430…, equal to `ROUND_BASELINE` (git).
- V2. Real `return.json`: 84 status lines, all `??`, all porcelain-v1, all under `.ufo/waves/round-20/` or the preserved source. No `..`, no quoted paths, no tracked lines. The preserved-source line is present exactly. trackedDiff is empty. Checker predicates re-applied as a read-only jq filter, not by running the checker.
- V3. Completeness: every file under `.ufo/waves/round-20/` with mtime at or before return.json is listed by the snapshot, excluding the relocated clone trees. The only exception is return.json itself (10:17:25.180Z).
- V4. Snapshot paths exist at capture. Now only the four `clones/` directories are missing.
- V5. Import ordering from mtimes and ledger importedAt: bundles 10:17:47.954–.973Z, check-wave.mjs 10:17:47.966Z, ledger and ExecFixtures-return 10:17:47.976Z, all after capture. Corroborative only.
- V6. Bundles: sha256 equals ledger `bundleSha256` for all four. `git bundle list-heads` equals writerHeads (33ebd05, 7908955, ce92ca3, 900cf5c). `git bundle verify` on ExecFrozen is OK and requires c49929430.
- V7. Preexisting source sha256 8c8d6796… is identical in worktree, return.json, and the blob at 4ae9981.
- V8. Design digests equal integration.json: 1c9f536e… authoritative, 37fa4eab… declared.
- V9. Registry: 64 members, 64 distinct `TabiR20.*` agentIds. Spec items (64) have identical name and role. Role counts equal outcome.json.
- V10. 4ae9981 commits no clone gitlinks (`ls-tree` under `clones/` is empty).
- V11. Checkpoint diff for writer outputs equals ledger `changedPaths` for all four writers (8 files).
- V12. Checker constants ROUND_BASELINE, RETURN_PHASE, PRESERVED_SOURCE_LINE match real values.
- V13. The 824 ignored lane files show no post-dispatch mtime change outside `.jj/`.

## Not established or untested

- Terminal state of each seat at 10:17:25.170Z (F4). Metadata cannot settle it.
- Content of untracked inputs (design.json, html_form_element.cc, S096 source) at dispatch (F5).
- Actor and order of any post-capture write. Only the self-asserted `captureActor` exists.
- c1dc034 (ExecCounter first commit). Clone gone; bundle head list does not reach it.
- Whether registry agentIds are live, reachable agents.
- Checker results (`check-wave.mjs`, `--selftest`). Not run, per instruction. The expected exit 0 for the real snapshot is an [INFERENCE] from reading.
- Upstream Chromium hash of `html_form_element.cc`. Not re-fetched; outside this facet.
- Field-level phase, observed, agentId, wave-null checks. Sibling w2 seats cover those; this report covers path scope and provenance only.

## Hand-off to main (for the one serial verification)

- Treat a clean checker result as format evidence only. Do not cite it as isolation or capture proof.
- Choose one checker before any run: 4ae9981 (c073c245…) or 52e46de. The lane copy is not the one the handoff describes.
- Before any further import, write a digest of return.json and of every untracked input into a pre-import artifact. The current pin (4ae9981) is post hoc.
- Record the four clone states (two gone) and the post-checkpoint heads 52e46de and 7c98405 in the ledger.
- Add the five unenumerated tracked files to integration.json. Remove the `corpus/lessons/round-20.md` citation or land that file with the lesson.
- Checks to run once, not run here:
  - `node .ufo/waves/round-20/check-wave.mjs --selftest`
  - `node .ufo/waves/round-20/check-wave.mjs --spec .ufo/waves/round-20/w1/spec.json --registry .ufo/waves/round-20/w1/swarm-registry.json --snapshot .ufo/waves/round-20/w1/return.json`, predicted exit 0
  - `git status --porcelain=v1 --ignored --untracked-files=all` for the lane, to expose collapsed and ignored paths

Report: .ufo/waves/round-20/w2/WaveOutScope.md
