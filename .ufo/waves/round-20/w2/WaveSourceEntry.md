# WaveSourceEntry: round-20 wave metadata guard, preexisting source entry vs direct w1 before data

- Seat: `TabiR20.WaveSourceEntry`. Leaf member, no subagent dispatch. Read-only except this report.
- Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (parent `c49929430d996b016dde2e3a3a5be380f3433fdb`, committed 2026-10-21 07:21:32 -0300 = 10:21:32Z).
- Method: committed bytes via `git show`/`cat-file`/`ls-tree`; `git bundle list-heads|verify`; `jq`; `sha256sum`; `stat` (birth and mtime) on the lane. `git diff --stat <checkpoint>` was empty for all tracked files under `.ufo/waves/round-20` and `corpus/evidence/round-20`, so working-tree bytes equal the checkpoint for those paths.
- No checker, selftest, runner, build or test was executed. Times are UTC. "Birth" is filesystem birth time; the capture-listing check has 1 s resolution.

## 1. Verdict

1. The asked facet holds on the data. `?? corpus/evidence/round-20/sources/html_form_element.cc` is in both `w1/before.json` and `w1/return.json`, and the source's content chain is verified (P7). The guard's pass on that line is not a false pass.
2. The guard does not prove what its name suggests. It is a presence test on `return.json` alone. It never reads `before.json`, never hashes a file, and cannot see in-place content changes to preexisting untracked files. One such change happened: `.ufo/waves/round-20/design.json` was `??` in both snapshots with an identical line and was rewritten in place at 10:02:31.861 (F1).
3. The guard cannot apply to any wave that starts from the checkpoint. The `??` line it requires is now tracked and absent from live status, and its baseline and phase constants are w1-only. `w2/before.json` has baseline `4ae99816…` and no source line (F2).
4. No committed gate runs the guard on the real w1 inputs. `run-checks.py` runs `check-wave.mjs --selftest` only (F4).
5. The isolation ledger's bundle-level evidence holds. Its commit-level identities are not present in the lane object store (F5).
6. Filesystem birth times support "return before import" by 22.8 s and "no listed file born after capture". They contradict "all 64 settled before capture" for at least one listed report (F6).

## 2. Axes

- A1 Presence of the preexisting source entry: holds.
- A2 Strength of the guard's proof for "preexisting, untracked, unchanged at capture": weak.
- A3 Applicability after the checkpoint: fails for w2.
- A4 Capture and isolation evidence: strong for import-after-return ordering; weak for settlement and for in-wave stability.

## 3. Finite metadata check vs. actual evidence

| Question | What `check-wave.mjs` proves (fields only) | What the artifacts show |
|---|---|---|
| Source entry untracked at return | `status` contains the exact line (checkpoint `:109`) | Same line in before and return. Source birth 09:49:12.344, last write 09:49:12.344 (no later write). Raw, decoded and committed hashes agree (P7). |
| Snapshot captured at the return event | Nothing. `capturedAt` is never read. | `return.json` birth 10:17:25.179, 9 ms after its `capturedAt` 10:17:25.170. No listed file born after the capture second (P2). Import batch born 10:17:47.953 to .976 (P3). |
| Preexisting files unchanged between before and return | Nothing. `before.json` is never read. | `design.json` mtime 10:02:31.861, after before (F1). `swarm-registry.json` rewritten at 09:51:12.050 (dispatch write). `spec.json`, `dispatch.json`, source not rewritten after before. |
| No post-capture edits to listed files | Nothing | `w1/CriticIsolation.md` mtime 10:18:34.135, the only one of the 80 listed files newer than `return.json` (F6). |
| All 64 settled before capture | Nothing. `all64Settled` is never read; the registry has no settle field. | 63 `.md` reports born before capture. ExecFixtures had no report at capture; its only completion record was born 10:17:47.976 (F6). |
| 64 members with nonblank agentIds | Yes (`checkMembers`) | 64 of 64 distinct, equal to `TabiR20.<name>` (P5). |
| Spec and registry wave equality | Yes | `tabi-round-20-w1` in spec, registry, record and label check (P5). |
| Writer isolation | Nothing | Bundles hash-match; writer commits absent from the lane (F5). |
| No tracked change | Status codes and `trackedDiff` string | `trackedDiff` empty in both; every status line `??` (checked by `jq`). |

Hand-traced prediction for the real triple (`spec.json`, `swarm-registry.json`, `return.json`): exit 0. Untested.

## 4. Findings

### F1 (High): a preexisting untracked contract file changed mid-wave, and the status-based guard is blind to it

- `stat`: `design.json` birth 09:49:45.276 (unchanged), mtime 10:02:31.861. Same inode, rewritten in place after `before.json` (09:50:49.210). [INFERENCE: in-place write.]
- `design-declared.json`: birth = mtime = 10:02:19.026, a copy taken 12 s before the rewrite.
- Committed bytes: `design.json` = `1c9f536e…` (matches `integration.json` `designAuthoritativeSha256`). `design-declared.json` = `37fa4eab…` (matches `declaredDesignSha256`).
- `before.json` and `return.json` both list `?? .ufo/waves/round-20/design.json`. Neither records a hash for it.
- Seats saw both versions. ExecCounter.md:22-23: measured against the declared copy, then "read the lane design.json, sha256 1c9f536e… (changed 10:02:31Z)" and adopted S100 for LC11. ExecFixtures-return.txt:16: built against `1c9f536e`, "the clone's 37fa4eab copy was not used". CriticIsolation.md:40, :103, :167-168: same timeline, quoting L1's order.
- Impact: the guard's clean result says nothing about whether the contract was stable during the wave. The change is recorded in `integration.json` only as bookkeeping ("LC11 authority and LC12 topic correction; design-declared retained") with no time, old and new hash, or affected seats. Whether the change is permitted is a governance call. The guard cannot see it either way.

### F2 (High for any w2 use): the guard is w1-bound and stale after the checkpoint

- Checkpoint: `git diff --name-status c49929… 4ae99816… -- corpus/evidence/round-20/sources/` gives `A corpus/evidence/round-20/sources/html_form_element.cc`. Live status for that path is empty (tracked, clean).
- `check-wave.mjs` requires the `??` line (`:43`, `:109-110`). Under the current tracking state, no capture can contain it.
- `ROUND_BASELINE = c49929…` (`:41`) and `RETURN_PHASE` (`:42`) are hard-coded.
- `w2/before.json` (capturedAt 10:22:43.861): phase `dispatch-start-before-integration`, baseline `4ae99816…`, five `??` lines, no source line. `w2` spec and registry carry `tabi-round-20-w2` with 64 members.
- Post-checkpoint `final-clones/ExecFrozen` at `52e46de` (10:29:33Z) rewrites the checker (2 files changed in total with the expectations file, +381 / -116 lines) but keeps `ROUND_BASELINE` (`:47`) and the source-line clause (`:49`, `:173-174`). The lane's `check-wave.mjs` still hashes to `c073c245…`, so this version is not integrated.
- Impact: [INFERENCE from code reading; untested] A truthful w2 return fails the source-line predicate and, if it carries baseline `4ae99816`, the baseline predicate too. Both are reported as `snapshot_reconstructed`. The label turns "file is tracked now" into "reconstructed".

### F3 (Medium): "preexisting" is asserted, not established; the check is presence-only with a broad allowlist

- `check-wave.mjs` never reads `before.json`. `preexistingSourceSha256`, `capturedAt`, `captureActor`, `writerHeads`, `all64Settled` are unread.
- A preexisting untracked source and a same-path file created during the wave look identical to the guard. Only `before.json` could tell them apart, and it is never read.
- `SCOPE_PREFIXES` (`:44`) admits any path under `corpus/evidence/round-20/sources/`. A new untracked file there would pass `out_of_scope` and the source-line check. None exists: none of the 75 added lines between before and return falls under `sources/` (P1).
- The content proof for the source lives outside the guard (P7).

### F4 (Medium): no committed run of the guard on the real w1 inputs

- `run-checks.py:62-63` runs `check-wave.mjs --selftest` only. No cohort entry names `w1/spec.json`, `swarm-registry.json` or `return.json`.
- `w1/registry-label-check.json` is `{"exit":0,"wave":…,"specWave":…}` with no argv or producer digest (ScoutRegistryHome.md:103; ExecFrozen.md:37).
- `integration.json` `verification`: "Not yet run". The 10 expected pins cover fixtures, not the real files.
- Impact: no receipt ties real input digests to a guard result. The hand-traced prediction (exit 0) is untested.

### F5 (Medium): the isolation ledger's bundles verify; its commit identities are not in the lane

- Bundles (committed, unchanged): `sha256` matches the ledger for all four (ExecCounter `34934f84…`, ExecFixtures `77ccf1ad…`, ExecFrozen `da0c627f…`, ScribeLifecycle `e9e11480…`). `git bundle verify` passes for all four. Each carries one head `refs/heads/round20/<writer>` equal to the ledger and `writerHeads`. Prerequisite `c49929…` is present.
- Lane object store: `33ebd05`, `7908955`, `ce92ca3`, `900cf5c` are absent (`cat-file`). No `refs/heads/round20/*`. `.ufo/waves/round-20/clones/` does not exist, though the return lists four clone directories. The ledger's clone paths dangle.
- Intermediate identities (`c1dc034` for ExecCounter; `b9028815`, `2f86841`, `fdf9e14`, `a912b64` for ScribeLifecycle) are not bundle heads and are unverified.
- The checkpoint's parent is the baseline, so no writer commit is in the lane's lineage. "Imported" means file copies, born 10:17:47.953 to .976.
- `final-clones/` hold new commits on other branches (`round20/ExecFixturesOracle` at `7c98405`, `round20/ExecFrozenConformance` at `52e46de`). Neither contains the ledger's commits.
- ExecFrozen.md:35 digests match the committed bytes (`check-wave.mjs` `c073c245…`, `wave-check-expected.json` `963762a7…`).
- Impact: only bundle-level provenance is checkable now. Byte equality of the other imported files to their writer commits needs an unbundle into a scratch repository outside the lane. I did not do this, to stay read-only.

### F6 (Medium-High): "all 64 settled before capture" is asserted, and a listed report changed after capture

- `return.json` asserts `all64Settled: true` at 10:17:25.170. No check reads it. Registry members carry only `agentId`, `item`, `kind`, `role`, so settle state is not recorded anywhere.
- `w1/CriticIsolation.md`: birth 10:03:24.899, mtime 10:18:34.135, which is 69 s after `return.json`. It is the only one of the 80 listed files newer than `return.json`. Its header says "Window: 09:52Z to 10:18Z" (`:5`). Its A4 says "the return boundary is still all 64 seats settled" (`:24`). Writer identity of the 10:18:34 write is not recorded. [INFERENCE: seat still active, or an L1 edit after capture; not resolvable from artifacts.]
- ExecFixtures: its only completion record, `w1/ExecFixtures-return.txt` ("completed", duration 26m19s), was born 10:17:47.976 in the import batch, after the capture. It had no `.md` at capture. Its commit `7908955` at 10:16:44Z (CriticIsolation.md:32) predates the capture. Its settle time cannot be placed against 10:17:25 from the artifacts.
- Positive: 63 `.md` reports were born before the capture (P2).
- Impact: `all64Settled` is an unverified assertion, and at least one listed report changed after it.

### F7 (Low): checker defects and overstatements

- Porcelain regex `^([ MADRCU?!]{2}) ` (`:46`) omits `T` (type change). [INFERENCE: git emits `T`; untested.] A `T` line fails closed as `status_not_porcelain_v1`, reported as `snapshot_reconstructed`.
- Label conflation, as in F2.
- `wave-check-expected.json` header says "Independent expectations", and ExecFrozen.md:20 says it was "committed separately". Commit `ce92ca3` contains both files (ExecFrozen.md:33), by one author. They are not independent.
- Capture-flag dependence: the source line exists only under a `-uall` capture. A default `git status` collapses it to `?? corpus/evidence/round-20/sources/`, which is the form ExecFrozen's clone status shows (ExecFrozen.md:36). The checker does not enforce the flag.

### F8 (Low): naming and limits of the before data

- `census-before.json` and `counts-before.json` are absent from `before.json`'s listing and were born after 09:50:49. "Before" describes content, not capture time.
- `before.json` is the only pre-dispatch snapshot and has no hashes. Its birth (09:50:49.208970) precedes its own `capturedAt` (09:50:49.209998) by 1 ms. Sub-ms, not used.
- `swarm-registry.json` birth = mtime = `updatedAt` = 09:51:12.050, the last rewrite, probably atomic [INFERENCE]. The pre-capture listing therefore rests on `createdAt` 09:50:49.198 alone (metadata).
- `dispatch.json` embeds a pre-spawn registry copy with 64 null `agentId`s. Its hash differs from `swarm-registry.json`. Expected; a hazard only if the guard is pointed at it.

## 5. Verified positives

- P1. Return status (84 entries) contains before status (9 entries). 75 added lines, all under the two allowed prefixes, none under `sources/`.
- P2. All 80 untracked files listed in `return.json` have birth at or before the capture second. The only file born in that second and unlisted is `return.json` itself (birth 10:17:25.179).
- P3. Import batch births: ExecCounter.bundle .953, measure-c1.mjs .955, selftest-c1.mjs .960, check-wave.mjs .966, decisions.json .974, isolation-ledger.json .975, knowledge note .975, ExecFixtures-return.txt .976 (all 10:17:47.xxx). That is 22.8 s after capture. The ledger's `importedAt` 10:17:47.976068 matches, so `beforeIntegration: true` is supported.
- P4. `writerHeads` equal the ledger commits (4 of 4). Commit times from CriticIsolation.md (critic-reported, not object-verified): ExecFrozen 10:00:09Z, ExecCounter 10:14:35Z, ScribeLifecycle 10:05:49Z, ExecFixtures 10:16:44Z. All precede the capture.
- P5. Spec: 64 items. Registry: 64 members, identical name sets and role pairs, 64 distinct `agentId`s equal to `TabiR20.<name>`, no blanks, all `kind: spawn`. `record.json` members hash-equal the registry (`28720538…`). Wave label `tabi-round-20-w1` in spec, registry, record and label check.
- P6. The 10 pins in `wave-check-expected.json` match the checkpoint code path (hand-traced, not executed). Positive case gives exit 0 with no findings. Each negative fixture produces exactly its listed code.
- P7. Source chain. `source-opened.base64.gz` → gunzip → sha256 `ff55d511…` = `source-opening.json` `rawSha256`. Base64-decoded → sha256 `8c8d6796…6916` = `decodedSha256` = `return.json` `preexistingSourceSha256` = committed blob content (blob `cd7efa45…`). The source predates the 09:52:32 opening receipt (birth 09:49:12), which resolves the ScoutRegistryHome.md:106 timeline question.
- P8. ExecFrozen.md:35 digests match committed bytes (see F5).

## 6. Recommendations for main (not executed here)

1. Do not apply `check-wave.mjs` to w2 as-is. Parameterize wave, baseline and source-entry requirement per spec, or scope the source-entry clause to w1 and record the decision in `integration.json`.
2. Run the guard once on the real triple. Archive argv, input sha256s and output as a receipt. Expected exit 0, untested.
3. Hash every preexisting untracked wave input at before and at return: `design.json`, `swarm-registry.json`, `spec.json`, `dispatch.json`, the source. Record the `design.json` change (time, old and new hash, reason, seats affected) in `integration.json`.
4. Resolve F6: record per-seat terminal timestamps, and identify the writer of the 10:18:34 `CriticIsolation.md` write.
5. Unbundle the four writer bundles into a scratch repository outside the lane. Check commit parents (including `c1dc034`, `b9028815`, `2f86841`, `fdf9e14`, `a912b64`) and blob equality with the imported files.
6. Record decisions on the `preexisting_source_entry_absent` veto (ExecFrozen.md:22) and on the `sources/` directory allowlist (F3). `integration.json` has neither.
7. Add `T` to the porcelain regex. Give the absent-source condition its own finding code. Remove "independent" and "committed separately" wording.

## 7. Untested and limits

- Nothing was executed: no checker, selftest, runner, build or test. Hand traces (F2, F4, P6) are untested.
- Writer-commit contents and intermediate identities cannot be verified without unbundling (F5).
- Births and mtimes are observations. A deliberate `utime` edit would defeat them. They are used as supporting evidence only.
- "Settled" (F6) cannot be resolved from the artifacts.

## 8. Tooling and side effects

- No tools installed or updated.
- Commands: git, read-only (`show`, `cat-file`, `ls-tree`, `log`, `rev-parse`, `diff`, `bundle list-heads|verify`, `for-each-ref`, `reflog`, `count-objects`, `worktree list`, `grep`); `jq`; `sha256sum`; `base64`; `gunzip`; `stat`; `find`; `comm`, `sort`, `wc`, `cut`; `date`.
- Early in the session I ran `git status --short` and `git diff --stat` without `--no-optional-locks`. Those may have refreshed the index stat cache. No content changed. Later status calls used `--no-optional-locks`.
- Scratch files written to `/tmp/r20_*.$$` and removed. No repository file was written except this report.
