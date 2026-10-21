# WaveTracked: round-20 metadata guard, tracked-diff and status facet

**Scope.** Checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`; baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`. Author-side falsification finding, not external closure. Read-only: no production edits, no clones, no subagents, no execution of `check-wave.mjs` or any selftest, no mutation probes. Traces that I derived by reading code, and did not run, are marked `[static]`. Times are UTC; the file mtimes are local -0300 and were converted.

## Verdict

- For its one intended input, an honest `??`-only status captured before import, the tracked/status logic in `check-wave.mjs` is lexically correct. Every non-`??` porcelain code fails closed, except `T`, which is misclassified.
- As a guard it is weaker than its own header claims. It checks author-written strings from a single snapshot. It never invokes git, never reads `before.json`, never inspects the end state, and never hashes untracked inputs.
- Independent evidence supports the w1 claims that the return was captured before import and that HEAD and the tracked tree were clean at capture. None of that evidence comes from the checker.
- Two claims lack support in the repo: `all64Settled: true` at 10:17:25Z (F5), and that `integration.json` enumerates every tracked change made after capture (F1).

## Findings, ordered by severity

### F1 (High): tracked changes after capture are outside the guard

- End-state diff, `git diff --name-status c4992943 4ae99816`: 96 `A` and 6 `M`. The `M` paths are `LOG.md` (+30/-0), `SCORECARD.md` (+12/-0), `SKILL.md` (+54/-0), `corpus/QUALITY.md` (+6/-0), `corpus/README.md` (+18/-0), and `corpus/SOURCES.md` (+4/-1).
- `jj commit bc3ac5cd` (op log, around 10:21:32Z) took explicit filesets that include all six, so the commit scope is deliberate. Nothing in the repo checks it.
- The five docs were written in one batch at 10:21:01.07 to .08Z (mtimes). `integration.json` (10:21:23Z, `verification: "Not yet run"`) enumerates `decisions.json`, the knowledge note, and the skill section in `mainIntegrationChanges`, S096 and S100 in `sourceAudit`, and `design.json`, `source-opening.json`, and `source-counts-before.json` in `bookkeeping`. It does not enumerate `LOG.md`, `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/README.md`, or the round-20 bullet added to `corpus/SOURCES.md`. `SKILL.md` appears only as "skill section". `ExecFixtures-return.txt:44` left the LOG entry to the integration owner.
- Structural cause: `trackedDiff` and `status` compare against HEAD and the index. Once integration commits, committed tracked changes disappear from both. No rule ever compares the checkpoint to the baseline.
- Historical bytes, checked: `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, and `corpus/README.md` have zero deleted lines, and their hunks are EOF appends at baseline line counts 1192, 922, 2197, 228, and 434. `corpus/SOURCES.md` changed one existing line: the S096 used-by cell, rendered with `git diff --word-diff`, now reads `...round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. The appended text is 58 bytes, and the anchor and teaches cells are unchanged. `integration.json` `sourceAudit.S096.usedByAfter` records this, and `ConnPlanner.md:114` planned it as "used-by append integrity". The edit is permitted, but it is still a mutation of an existing row that no guard checks.

### F2 (High): untracked in-scope inputs are unhashed, and a contract input changed mid-wave

- `before.json` and `return.json` record paths only. Apart from one preexisting blob hash, no untracked input is hashed. A content change to any listed untracked file is therefore invisible to both.
- Concrete case. `.ufo/waves/round-20/design.json` is listed `??` in `before.json` (capturedAt 09:50:49.21Z). Its last write is 10:02:31.86Z, 12 s after `design-declared.json` was written at 10:02:19.03Z. Its authoritative sha is `1c9f536e…`, and the declared copy is `37fa4eab…`. The two differ in substance: `design.json:134` says `SOURCE is decision.sourceId (LC11 S100) or manifest.source.id (S096)`, while `design-declared.json:133` says `S096:START-END`.
- `ExecFixtures-return.txt:16` says the seat built against `1c9f…` and did not use the clone's `37fa…` copy. `CriticIsolation.md:214` logs "design drift (10:04Z)". `dispatch.json` has no design hash (grep for both shas returns only `declaredMaxLanes`). Writers that started before 10:02:31Z may have read the superseded contract, and nothing records which version any seat read.
- `integration.json:53–54` lists the `design.json` change as integration bookkeeping. Its mtime places the write mid-wave, before return. `source-opening.json` (bookkeeping, `integration.json:57–58`) was also rewritten at 10:02:56Z, before return. `swarm-registry.json`, a guard input, was rewritten at 09:51:12Z, after `before.json`.

### F3 (High): the designed before-to-return differential is not implemented

- `ConnHistorical.md:89–95` specifies three rules for the gate: `before.trackedDiff === ""` and `return.trackedDiff === ""`; the delta of status lines between before and return must lie inside the allowed prefixes; and preexisting entries must be byte-identical between before and return.
- `check-wave.mjs` accepts only `--spec`, `--registry`, and `--snapshot` (`parseInputFlags` 288–300, `main` 302–316). `runCheck` (158–168) and `evaluate` (137–144) read three documents and run three per-snapshot checks. `before.json` is never read. The header claims only per-field checks (lines 14–23).
- Consequence: F2's mutation is outside the checker's reach by construction, and "tracked diff empty" is a single-point claim.

### F4 (High for closure; not verifiable from the repo): capture provenance is self-attested

- `return.json` contains `capturedAt`, `captureActor: "TabiR20 L1"`, `status`, and `trackedDiff`. It records no argv, git version, HEAD, index state, or output hash. The checker says so itself (`check-wave.mjs:5–8`), and so does the ledger (`snapshotLimits`).
- The `status` shape is consistent with `git status --porcelain=v1 -uall`: w1 files are listed individually, and the four clone directories are collapsed. That matches the template at `ConnHistorical.md:82–84`, but the command itself is not recorded.
- Independent corroboration is listed in the table below. It shows that HEAD and the tracked tree were consistent at capture. It does not verify the content of the untracked list.
- `LOG.md:1193–1222` describes the snapshot as "actual full-wave return ... before the first import; tracked diff empty". That is stronger than the evidence supports, given F5.

### F5 (Medium–High): "all 64 settled" is contradicted by a write to a listed input after capture

- `w1/CriticIsolation.md` is one of the 84 entries in `return.json` `status`. Its last write is 10:18:34.135Z, 69 s after `capturedAt` 10:17:25.170Z. Its window runs to "10:18Z" (line 5), and its closing instructions (lines 223–231) say "Wait until all 64 seats are terminal" before "Take the full-wave snapshot". Those instructions do not reflect a snapshot already taken at 10:17:25.
- `ExecFixtures-return.txt`, whose header says "recovered by this snapshot", was created at 10:17:47.976Z, 22 s after capture. It is absent from the status. The seat's last commit was 10:16:44Z (`CriticIsolation.md:32`).
- Either a registry member was not terminal at capture, or a report was edited after capture. Either reading contradicts an unqualified `all64Settled: true`, and neither is visible to the checker. The registry itself is sound: 64 members, all `agentId` values non-blank and equal to `"TabiR20."+name`.

### F6 (Medium): the parser omits porcelain letter `T`

- `check-wave.mjs:46`: `PORCELAIN_LINE = /^([ MADRCU?!]{2}) (.+)$/`. The git-status documentation (https://git-scm.com/docs/git-status) lists `T` as "file type changed (regular file, symbolic link or submodule)", valid in both X and Y positions.
- `[static]` A line ` T corpus/SOURCES.md` fails the match and is emitted as `snapshot_reconstructed` with `status_not_porcelain_v1` (line 123). Line 124 then `continue`s, so `tracked_change` (127) and `out_of_scope` (129–132) never fire for it. The verdict is still `findings`, so this is not a silent pass, but the wrong rule fires and the scope check is skipped.

### F7 (Low for honest capture; Medium if snapshots are forged): the scope test is a prefix test on an unnormalized path

- `check-wave.mjs:130` uses `path.startsWith(prefix)`, with no normalization.
- `[static]` The line `?? .ufo/waves/round-20/../../LOG.md` names a tracked file. Its code is `??`, so it does not trip `tracked_change`, and its path begins with the prefix, so it does not trip `out_of_scope`. A snapshot containing it would come back clean. Real git never emits `..` segments, so this matters only if the snapshot is forged, which the checker's own threat model (author-written text) does not exclude.

### F8 (Medium): nested clones collapse to one `??` line, so edits inside them are invisible

- `return.json` lists `?? .ufo/waves/round-20/clones/{ExecCounter,ExecFixtures,ExecFrozen,ScribeLifecycle}/`. Tracked edits inside those nested repositories cannot appear in `trackedDiff` or `status`. The clones are now gone (`clones/` is absent), so that cannot be checked again. The isolation claim therefore rests on the bundles, not on the guard.
- The same blind spot is present now. `final-clones/{ExecCounter,ExecFixtures,ExecFrozen}/` each contain a `.git` directory, and `final-clones/` was last modified at 10:34:25Z.

### F9 (Medium): selftest does not exercise the status-level tracked rule; expectations share an author

- `buildFixtures` sets `trackedDiff` only for the `tracked_change` case (`check-wave.mjs:203`), and `wave-check-expected.json:11` expects only that case. There is no fixture for ` M`, ` D`, or ` T` status lines, for an out-of-scope tracked line, for `..` traversal, or for a duplicated key.
- Duplicate keys are accepted. `readJson` uses `JSON.parse` (line 57), which keeps the last duplicate. `[static]` `{"trackedDiff":"x","trackedDiff":""}` passes. The artifacts are clean: `return.json` and `before.json` each contain exactly one `trackedDiff` and one `status` key, checked with grep.
- The expectations file says "Independent expectations", yet `isolation-ledger.json:53–60` assigns both `check-wave.mjs` and `wave-check-expected.json` to ExecFrozen. `ExecFrozen.md:20` says the expectations are "committed separately", but both are in commit `ce92ca3`.
- Adjacent note, outside this facet: the marker scan covers top-level keys and top-level strings only (lines 101–106). Nested objects and arrays are not scanned.

### F10 (Low): the guard is single-use, because its constants are hard-wired

- `ROUND_BASELINE` (line 41) is `c4992943`. `PRESERVED_SOURCE_LINE` (line 43) requires `?? corpus/evidence/round-20/sources/html_form_element.cc`, but that path is tracked at `4ae99816`.
- `w2/before.json` (capturedAt 10:22:43.86Z) has `baseline` `4ae99816`. As written, the checker would reject any post-checkpoint snapshot on `baseline=` and `preexisting_source_entry_absent`. This wave cannot be validated by this checker without editing it.

## Claims against evidence

| Claim | What the checker proves | Independent evidence I found | Not established |
|---|---|---|---|
| Return precedes import | Nothing (`capturedAt` is never read) | `return.json` mtime 10:17:25.18; import burst 10:17:47.95–.98; `isolation-ledger` `importedAt` 10:17:47.976; no jj op and no HEAD move in between | Capture method. The checker's header disclaims timestamps as proof (lines 6–8). |
| `trackedDiff` empty at return | Equals `""` | `git reflog`: HEAD = c4992943 from 09:29:04 until 10:21:32Z. `jj op log`: no operations between about 09:28 and 10:20Z. `CriticIsolation.md:199`: `git diff` and `--cached` both empty at 10:17Z. Worktree and index clean now (exit 0 both). | The command, and any untracked-content change (F2). |
| `status` has only in-scope `??` entries | Prefix and code only | 84 entries, matching `CriticIsolation.md:200` at 10:17Z. All 80 non-clone paths are tracked at `4ae99816`, so they were untracked at capture. The preserved source's blob sha `8c8d…6916` equals the recorded `preexistingSourceSha256`. | Contents of listed files, and the post-capture write to `CriticIsolation.md` (F5). |
| No tracked change in the shipped state beyond what integration recorded | Not checked | 102 paths differ from baseline; 6 `M`; 5 of the 6 not enumerated in `integration.json` (F1) | Whether those edits were all intended. The additions look intended; I did not audit their wording. |
| Writer isolation and bundle integrity | Not checked | Bundle sha256 values equal the ledger's (all four). `git bundle verify` passes for each, with prerequisite `c4992943`, and heads equal `writerHeads`. Checkpoint blob hashes match hashes recorded in the writer and critic reports: `measure-c1.mjs` 5af9654f / sha fab3bde4 (30974 B; `CriticIsolation.md:205`), `selftests/expected.json` sha 458a9f3f (8522 B; `CriticIsolation.md:206`), `check-wave.mjs` sha c073c245 and `wave-check-expected.json` sha 963762a7 (`ExecFrozen.md:35`). | Writer commit objects are absent from the production object store (`git cat-file -t` fails for 33ebd05, 7908955, ce92ca3, and 900cf5c). The clones are deleted, so commit-level identity cannot be checked in this lane. |
| All 64 seats settled before capture | Registry has 64 members with non-blank `agentId`s | Contradicted for `CriticIsolation` by its post-capture write (F5) | Terminal state of each seat at 10:17:25Z |

Verified clean, `[static]`: `return.json` has no non-`??` line; every `??` path is in scope; the preserved source line is present exactly; `trackedDiff` is `""`; `phase`, `observed`, and `baseline` are correct; no reconstruction marker appears in a top-level key or string. By reading, the checker should exit 0 on `return.json`. I did not run it. As F9 and F10 show, a clean result here certifies very little.

## Timeline (UTC)

| Time | Event | Source |
|---|---|---|
| 09:29:04 | Baseline `c4992943` becomes HEAD | git reflog; jj op "point bookmark master" |
| 09:50:49.21 | `before.json` (phase `before-dispatch`): 9 status entries, `trackedDiff` `""` | `before.json` |
| 09:51:12 | `swarm-registry.json` rewritten, after `before.json` | mtime |
| 09:51–09:54 | `census-before`, `counts-before`, `counts.mjs`, `run-checks.py` created | mtimes; absent from `before.json` |
| 10:02:19 / 10:02:31 | `design-declared.json` (37fa…), then `design.json` (1c9f…) | mtimes; sha256 |
| 10:02:56 | `source-opening.json` rewritten | mtime |
| 10:16:44 | ExecFixtures commit `7908955` | `CriticIsolation.md:32` |
| 10:17:25.17 | `return.json` `capturedAt`; 84 status entries; `trackedDiff` `""` | `return.json` |
| 10:17:47.95–.98 | Import burst: 4 bundles, `measure-c1.mjs`, `selftest-c1.mjs`, `check-wave.mjs`, `selftests/expected.json`, `wave-check-expected.json`, `ExecFixtures-return.txt`, `isolation-ledger.json` | mtimes; ledger |
| 10:18:34.14 | `CriticIsolation.md` last write, listed in the return status | mtime; file |
| 10:19:14 | `decisions.json`, knowledge note, `lifecycle-skill-section.txt` rewritten | mtimes |
| 10:20:16 | `SKILL.md` rewritten | mtime |
| 10:21:01 | `LOG.md`, `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md` written in one batch | mtimes |
| 10:21:23 | `integration.json` written; verification "Not yet run" | mtime; file |
| 10:21:32 | Commit `bc3ac5cd` with explicit filesets; HEAD = `4ae99816` | jj op log; reflog |
| after 10:21:32 | `jj git push` of master; `origin/master` = `4ae9981` now | jj op log; `git rev-parse` |
| 10:19–10:21 | First `jj file track` of round-20 paths (jj auto-track disabled) | jj op log |
| 10:22:43.86 | `w2/before.json` (`dispatch-start-before-integration`, baseline `4ae99816`) | file |
| 10:23:47 | `w1/outcome.json` created (untracked) | mtime |
| 10:29:44 / 10:31:00 | `gate-conformance-handoff.md` / `fixture-oracle-handoff.md` created | mtimes |
| 10:34:25 | `final-clones/` last modified; contains nested `.git` repositories | mtime; find |

The lane is jj-colocated (`.jj/` with `jj 0.45.1`), so git status is a derived view. Before 10:19Z, jj had not tracked any round-20 path, so the return snapshot is a git-only view.

## Post-checkpoint candidate (out of assignment, grep only)

`final-clones/ExecFrozen` at `52e46de` changes `check-wave.mjs` by 470 lines. It adds a `--frozen DIR` mode that pins three input digests (lines 53, 290–291). That pins the snapshot inputs after they are fixed, so it guards against later tampering, not against a dishonest capture. It does not close F1–F3 or F6–F10. `PORCELAIN_LINE` (52) is unchanged and still omits `T`. The scope test (195) is still a prefix test. No `before` reference exists in the file. `ROUND_BASELINE` (47) and `PRESERVED_SOURCE_LINE` (49) are unchanged. `JSON.parse` (112, 384) still accepts duplicate keys. It adds CRLF tolerance on the preserved-line match (173). Its selftest was not run.

## Checks for main to run (none run by me)

1. `node .ufo/waves/round-20/check-wave.mjs --selftest` against the checkpoint. It passes the existing ten cases and does not exercise F6–F9.
2. Before integration, add fixtures for ` M` and ` T` in scope and out of scope, for `?? .ufo/waves/round-20/../../LOG.md`, and for a duplicated `trackedDiff`. `[static]` These should fail today.
3. Add an end-state check: `git diff --name-status c49929430d996b016dde2e3a3a5be380f3433fdb <final HEAD>` must equal an enumerated list. The five unlisted docs must be added to `integration.json` or justified.
4. Verify bundle contents at blob level by unbundling into a scratch repository outside production. I did not do this because it writes objects.
5. Record which design version each writer read, because the mid-wave change to `design.json` (F2) affects which contract each writer used.

## Limits

- Read-only. Nothing was executed. Traces are `[static]`. Timestamps are used only as corroboration, because the checker's header rejects them as proof.
- Git was invoked with `--no-optional-locks`. `jj` was invoked with `--ignore-working-copy` for `op log`, so no working-copy snapshot was taken.
- F5 rests on file mtimes and on the content of `CriticIsolation.md`. The repo cannot show whether the seat was terminal at 10:17:25Z.

## Tooling

No installs or updates. Used existing `git`, `jj 0.45.1` (`/home/vgpnk/.local/bin/jj`, read-only), coreutils (`stat`, `find -printf`, `sha256sum`, `wc`), and the git-status documentation at https://git-scm.com/docs/git-status.
