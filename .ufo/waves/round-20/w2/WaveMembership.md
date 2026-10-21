# WaveMembership — round-20 metadata guard, membership facet

Seat: `TabiR20.WaveMembership` (leaf, author-side falsification). Read-only except this file.
Basis: checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (committed bytes; worktree bytes match for every file in the digest table). Not executed: `check-wave.mjs`, its `--selftest`, and all tests (lane bounds). Guard behavior statements are static traces of checkpoint source and are marked as such. No tools installed or updated.

## Verdict

1. `check-wave.mjs` does not certify 64-member membership or spec completeness. Its membership rule is: the registry has at least one member and every member has a nonblank string `agentId` (checkpoint lines 81–90). It reads only `spec.wave` from the spec (line 72).
2. Committed w1 data is internally consistent: spec 64 = registry 64 = dispatch 64, names and roles equal. That is an observation of bytes. Nothing in the checkpoint certifies it.
3. "All 64 settled before capture" (`return.json` `all64Settled: true`, `captureActor: "TabiR20 L1"`) is an author assertion. Transcript timing contradicts it for CriticIsolation and places ExecFixtures' delivery after capture. The snapshot's `status` records existence, not settled state.
4. Writer and guard state changed after the checkpoint. Two writer clone heads moved, a revised guard (blob `40fae8d2…`, not checkpoint `c073c245…`) was committed in a clone, and the ledger's clone paths are stale.
5. Permitted wording: "On committed bytes, the w1 registry names equal the 64 spec items. The guard checks only non-empty membership with nonblank agentIds plus return-snapshot shape; it does not certify membership, settle state, or capture order." Not permitted: "64 membership certified", "check-wave verified membership", "all 64 settled per snapshot".

## Digests (committed = worktree; first 16 hex of sha256)

| file | sha256 |
|---|---|
| `.ufo/waves/round-20/check-wave.mjs` (318 lines) | c073c2459266f3df |
| `corpus/evidence/round-20/wave-check-expected.json` | 963762a7675f1f7c |
| `.ufo/waves/round-20/w1/spec.json` | f4270233febe3313 |
| `.ufo/waves/round-20/w1/swarm-registry.json` | a77ad7569eb201bc |
| `.ufo/waves/round-20/w1/before.json` | 859268a60e4dd71f |
| `.ufo/waves/round-20/w1/return.json` | 40e3cb38337aa743 |
| `.ufo/waves/round-20/design.json` (= `designAuthoritativeSha256`) | 1c9f536e329d74fe |

Scope note: `isolation-ledger.json` and `integration.json` are at `.ufo/waves/round-20/`, not under `w1/`. Both are committed and analysed in §4.

## 1. What the guard reads (static trace of checkpoint `check-wave.mjs`)

| Rule | Lines | Reads |
|---|---|---|
| wave_null, wave_mismatch | 71–79 | `spec.wave` (72), `registry.wave` |
| agent_id_missing | 81–90 | `registry.members` non-empty; each member a record with nonblank string `agentId` |
| snapshot_reconstructed | 92–112 | `phase`, `observed`, `baseline` (constant, line 41); top-level keys and top-level string values matching /reconstruct/i (101–106); `status` contains the preserved-source line (107–111); `trackedDiff` is a string |
| tracked_change | after 112 | `trackedDiff` non-empty; any status code other than `??` |
| out_of_scope | 118–132 | status paths under `.ufo/waves/round-20/` or `corpus/evidence/round-20/sources/` (130) |
| output | 146–156 | `schema`, `verdict`, `findings`, `details` only: no input paths, no digests |

Never read: `spec.items`, `spec.maxLanes`, `spec.reportDir`; registry-vs-spec names, count, roles; duplicate agentIds; `kind`; `item`; member report presence; `all64Settled`, `captureActor`, `capturedAt`, `writerHeads`, `preexistingSourceSha256`; registry `updatedAt`.

Consequences (static trace, not executed):
- A registry of 1, 63, or 65 members (including names absent from the spec), with nonblank agentIds (duplicates allowed), passes the membership rule. Spec content beyond `wave` is not inspected.
- The selftest's clean case is a 2-member registry: `buildFixtures` lines 176–179 (ExecFrozen, CriticClaims), spec fixture `{wave, reportDir}` with no `items` (line 172). `wave-check-expected.json` `positive_clean_triple` expects exit 0. The selftest therefore asserts that 2 members is clean.
- None of the 10 expected cases covers cardinality, missing or extra member, duplicate agentId, or spec items.
- Fairness: the implementation matches the ExecFrozen item text in `w1/spec.json` ("exact nonnull plus post-record member agentIds all nonempty"). A completeness check was never requested. The overclaim risk is downstream, in how the gate is described.
- The committed triple would exit 0 by this trace. [INFERENCE: not executed; main's CLI run is the verification.]

## 2. Committed data (observed; not a certification)

Read-only jq over committed bytes:
- spec: 64 items, 64 unique names, `maxLanes` 64, wave `tabi-round-20-w1`, reportDir `.ufo/waves/round-20/w1`.
- registry: 64 members; `spec_not_in_reg` = [] and `reg_not_in_spec` = []; roles equal spec roles; `kind` all `spawn`; `item` all null; `agentId` = `"TabiR20." + name` for all 64; zero duplicate agentIds; wave equal to spec.
- dispatch.json: `taskCall.tasks` 64, names equal spec; `counts` `{spawn:64, resume:0, total:64}`.
- return.json: status 84 lines; all `??`; all under allowed prefixes; one preserved-source line; 63 `w1/<Name>.md` lines, one for every member except ExecFixtures; 7 other w1 entries (before, dispatch, record, registry-label-check, spec, swarm-registry, task-result).
- No `check-wave`, `isolation-ledger`, `integration.json`, `measure-c1`, `selftest-c1`, or `writer-bundles` entry appears in the return status. Those files were imported after capture, which is consistent with the snapshot-before-import requirement. Ordering from this is inference.

## 3. Settled-at-capture: contradicted or unestablished

Capture: return.json `capturedAt` 2026-10-21T10:17:25.170471Z. The ledger's own `snapshotLimits` reads "author observation of full wave completion; metadata checker does not independently prove capture actor/order." That disclosure is accurate.

Transcript evidence (read-only jq over `~/.omp/agent/sessions/…/TabiR20/TabiR20.<Seat>.jsonl`, 128 TabiR20 transcripts; timestamps are proxies, not terminal events):

| Seat | Evidence | Reading |
|---|---|---|
| CriticIsolation | 14 entries 10:17:32.472Z–10:18:51.736Z: bash verification at 10:17:32 and 10:17:47; `write` to `w1/CriticIsolation.md` at 10:18:34.134Z (mtime 10:18:34.135Z); message to ExecCounter at 10:18:34.139Z. The checkpoint `CriticIsolation.md` (sha256 952d3161…) is that post-capture content. | Not settled at capture. `all64Settled: true` is contradicted for this seat. |
| ExecCounter | 2 entries in window: inbound IRC ack 10:18:34.136Z; assistant reply 10:18:44.138Z. No writes. | Steered only. |
| ExecFixtures | First entry 09:50:59.993Z. Result header: `status="completed" duration="26m19s"`. First two transcript messages mentioning commit 7908955: 10:16:44.860Z and 10:17:18.539Z, so completion ≈10:17:19Z, about 6 s before capture. The result was not in the snapshot. `w1/ExecFixtures-return.txt` (an L1 recovery, "not auto-delivered; recovered by this snapshot") was written at 10:17:47.976Z. Re-engaged later: 112 entries after 10:21Z; commit 7c98405 at 10:30:36Z. | Completion supported by timing; delivery after capture. |
| ExecFrozen | L1-authorized IRC at 10:26:07.387Z ("Scoped same-identity conformance repair … NEW clone"); commit 52e46dee at 10:29:33Z (§4). | Re-engaged after the checkpoint. Not reflected in the registry. |

Scan result: of all 128 TabiR20 transcripts, only CriticIsolation and ExecCounter have entries in [10:17:25.170Z, 10:21:00Z). The other 62 w1 seats show no activity in that window. Their full timelines were not read.

Registry: `updatedAt` 2026-10-21T09:51:12.050Z. Members carry no state field. Re-engagements (ExecFixtures, ExecFrozen, CriticIsolation) are invisible to the registry and to the guard.

The checkpoint commit (10:21:32Z) therefore holds a 10:17:25 return snapshot next to member files written later (`CriticIsolation.md` 10:18:34Z, `ExecFixtures-return.txt` 10:17:47Z).

## 4. Writer and isolation evidence (artifacts; distinct from the guard)

- `writer-bundles/*.bundle`: `git bundle verify` exit 0 for all four. Heads (`list-heads`): ExecCounter 33ebd05…, ExecFixtures 7908955…, ExecFrozen ce92ca3…, ScribeLifecycle 900cf5c…. These match ledger `writers[].commit` and return `writerHeads`. First 16 hex of each bundle sha256 match ledger `bundleSha256`.
- Ledger `changedPaths` equal `assignedPaths` for all four writers.
- Ledger clone paths `.ufo/waves/round-20/clones/<Name>` do not exist. `final-clones/` contains ExecFixtures (HEAD 7c98405b…, branch `round20/ExecFixturesOracle`) and ExecFrozen (HEAD 52e46dee…, branch `round20/ExecFrozenConformance`). No ExecCounter or ScribeLifecycle clone is present. Two current heads differ from the ledger.
- ExecFrozen ledger head ce92ca3… is absent from the lane object store and from the new ExecFrozen clone. It survives only in its bundle.
- ExecFrozen commit 52e46dee (parent 4ae99816, 10:29:33Z) changes `check-wave.mjs` (blob `40fae8d2…`) and `wave-check-expected.json`. Hunk map: `checkWave`, `checkMembers`, `evaluate`, `report` are unchanged. Added: `--frozen DIR` mode pinning SHA-256 of spec, registry, and snapshot in `expected.json`; file-type checks; `buildFixtures` defines 27 fixtures, none for membership; the comment "This is intentionally a top-level key/string check. Nested metadata is not traversed." [INFERENCE from hunk map; not executed.]
- Source: return `preexistingSourceSha256` 8c8d6796… = sha256 of committed `corpus/evidence/round-20/sources/html_form_element.cc` = S096 sha in design.json. Consistent. The guard does not read this field. A `??` line in `git status` does not reflect content; a content change to the untracked file would leave the status line unchanged.
- Return snapshot records writer heads only. It has no per-writer `diff --name-only` or `status -uall`, which CriticIsolation.md:86–90 recommended.
- Committed `design.json` sha256 = `designAuthoritativeSha256` (1c9f536e…); committed `design-declared.json` = `declaredDesignSha256` (37fa4eab…).

## 5. Overclaim inventory

| Location | Claim | Status |
|---|---|---|
| SKILL.md:2244–2249 (working tree) | Live triple documented; "refuses only its finite metadata shapes"; no authentication of capture, order, isolation, or no-harm | Accurate. Omits membership completeness; add it. |
| run-checks.py:62–63 (checkpoint) | `wave-provenance` gate = `check-wave.mjs --selftest` | A PASS proves fixtures, not the w1 triple. Label overstates coverage. |
| ConnPlanner.md:123 | "`check-wave.mjs` validates return snapshot provenance; selftests pass" | Unsupported. Selftest never run (ExecFrozen.md:41); a shape check is not provenance (ExecFrozen.md:5). Correct it. |
| ExecFrozen.md:42 | Does not verify settle order, capture actor, or 64-count against spec items | Accurate, self-disclosed. |
| check-wave.mjs:10–12 | "Operational requirement, not enforced: … after all 64 registry members have settled" | Accurate; not enforced. |
| ScoutRegistryHome.md:100; CriticIsolation.md:195; ConnHistorical.md:39 | 64 members / 64 agentIds / 64 seats dispatched | Accurate observations (§2). Not certifications. |
| ScoutRegistryHome.md:103 | Replacement receipt must record registry path and digest | Unmet: guard output has no paths or digests (146–156). |
| ConnHistorical.md:65 | Return snapshot "must prove" source not mutated or touched | Unmet: guard checks presence only (§4). |
| Search of w1/*.md, SKILL.md, corpus/README.md | Any "64 certified" wording | None found. |

## 6. Wave 2 (this wave)

- w2 spec and registry (data): 64 items, 64 members, names equal, no role mismatch, agentIds pattern-clean, `TabiR20.WaveMembership` present in both.
- No w2 `return.json`. The guard has not run on w2 and cannot yet certify w2 membership.
- The guard's baseline is hard-wired to `c49929430d996b016dde2e3a3a5be380f3433fdb` (line 41). w2 `before.json` records baseline `4ae99816…`. The guard is not parametric and would reject a w2 return snapshot that carries the checkpoint baseline.

## 7. Findings

- **F1 (High, claim boundary).** The guard does not test membership completeness. Its clean fixture is 2 members with no spec items, and its 10 cases cover no cardinality, missing, extra, or duplicate case. Any "64 membership certified" statement derived from `check-wave.mjs` is unsupported. Refs: check-wave.mjs 71–90, 137–144, 172, 176–179; `wave-check-expected.json` `positive_clean_triple`. The 52e46dee revision adds 27 fixtures, still none for membership.
- **F2 (High, settle/capture).** `all64Settled: true` has no supporting capture artifact. It is contradicted for CriticIsolation (post-capture tool work and a report write by that seat). ExecFixtures' result reached disk 22.8 s after capture. The snapshot encodes existence only.
- **F3 (High, integration risk).** Post-checkpoint writer drift: ExecFixtures 7908955→7c98405; ExecFrozen ce92ca3→52e46dee; guard blob c073c245→40fae8d2 (clone only); ExecCounter and ScribeLifecycle clone directories absent; ledger clone paths stale. Main must integrate from recorded heads and bundles, or re-snapshot. The checkpoint ledger is not current writer state.
- **F4 (Medium).** The `wave-provenance` gate runs selftest only (run-checks.py:62–63), while SKILL documents the live triple. The gate label overstates coverage.
- **F5 (Medium, static).** Reconstruction-marker scan is top-level only (101–106). Nested objects or arrays containing "reconstructed" pass. Revision 52e46dee documents this as intentional; the checkpoint and SKILL do not.
- **F6 (Medium).** Guard output carries no input paths or digests (146–156). ScoutRegistryHome.md:103 requirement unmet. Frozen mode in 52e46dee pins hashes in `expected.json` but also emits none.
- **F7 (Low).** Recorded but unchecked: `writerHeads`, `preexistingSourceSha256`, `captureActor`, `capturedAt`, `all64Settled`, registry `updatedAt`. Where this audit checked them they are consistent (§2, §4), but the guard does not check them.
- **F8 (Low).** ConnPlanner.md:123 unsupported claims (see §5).
- **F9 (Medium, wave 2).** Guard hard-wired to the w1 baseline; no w2 return snapshot exists; no w2 membership claim is available from this guard.
- **Info.** Committed w1 data: spec = registry = dispatch = 64; roles equal; agentIds pattern-clean; no duplicates. Not a certification.

## 8. Recommendations (for main; no edits made)

1. Describe the guard everywhere as "return-snapshot shape plus non-empty membership with nonblank agentIds." Do not cite it for 64-membership or settled state.
2. To gate membership in the guard: compare spec item names to registry keys (set equality), require count = `maxLanes`, require unique agentIds, and match role and kind. Add selftest cases for missing, extra, duplicate, and count mismatch, and put `items` in the fixture spec. Main runs `--selftest` once.
3. Correct SKILL.md:2248–2249 to name membership completeness. Relabel or re-scope the run-checks `wave-provenance` entry. Correct ConnPlanner.md:123.
4. Record per-member terminal state and per-writer heads and status in a receipt taken after the last re-engagement. Do not treat one return snapshot as "64 settled."
5. Refresh or annotate `isolation-ledger.json` (clone paths; ExecFixtures and ExecFrozen heads).
6. Audit the revised guard (blob `40fae8d2…`, clone commit 52e46dee) separately. This audit covers checkpoint blob `c073c245…` only.
7. Reproducible membership data check (read-only; not a certification):

   `{ git show 4ae99816b8994fdedc159156d8d9d242dd5c4782:.ufo/waves/round-20/w1/spec.json; git show 4ae99816b8994fdedc159156d8d9d242dd5c4782:.ufo/waves/round-20/w1/swarm-registry.json; } | jq -s -c '.[0] as $s | .[1] as $r | ($s.items|map(.name)) as $sn | ($r.members|keys) as $rn | {spec: ($sn|length), reg: ($rn|length), spec_not_in_reg: ($sn-$rn), reg_not_in_spec: ($rn-$sn)}'`

## 9. Gaps and residual risk

- The guard was not executed. Its behavior statements are static traces. Main should run the CLI and selftest once in the integrated tree.
- Settle timing rests on transcript timestamps, not explicit terminal events. Only transcript windows were read; the other 62 w1 seats were not read in full.
- Bundles: heads, sha256, and `verify` checked. Contents and `changedPaths` were not re-derived (would require importing objects).
- Member report bodies were not read for membership claims beyond the certification-language search.
- Working-tree copies of SKILL.md, ConnPlanner.md, ScoutRegistryHome.md, and CriticIsolation.md were read at read time, not checkpoint bytes.

Commands used (all read-only): `git show`, `cat-file`, `rev-parse`, `log`, `diff`, `bundle list-heads`, `bundle verify`; `sha256sum`; `stat`; `jq` over JSON and transcript JSONL.
No tools installed or updated.
