# ExecFrozen — round-20 wave and return-snapshot check

**Verdict:** implemented and committed in the isolated clone. **Untested:** per assignment no tests, builds, or selftests were run. Main runs `--selftest` once after integration.

**Scope:** mistake-repair routine, not a claim. It is a finite, author-authored metadata guard. It reads only the fields a snapshot asserts. It is not an unforgeable observation, not an independent certification, and not a no-harm proof. It cannot prove who captured a snapshot or when. `capturedAt`, mtimes, and other timestamps are never read as ordering evidence.

## Behavior

`node .ufo/waves/round-20/check-wave.mjs --spec FILE --registry FILE --snapshot FILE` prints one JSON line: `{schema:"tabi-r20-wave-check-v1", verdict, findings:[codes], details:[...]}`. Exit 0 clean, 1 findings, 2 input or usage error.

Stable finding codes:

- `wave_null`: `spec.wave` or `registry.wave` is absent, null, or blank.
- `wave_mismatch`: both nonblank but not strictly equal. Not reported when `wave_null` applies.
- `agent_id_missing`: `registry.members` absent or empty, or a member lacks a nonblank string `agentId`.
- `snapshot_reconstructed`: snapshot not an object; `phase` ≠ `return-before-integration`; `observed` ≠ `true`; `baseline` ≠ `c49929430d996b016dde2e3a3a5be380f3433fdb`; any top-level field other than `status`/`trackedDiff` whose key or string value contains "reconstruct" (a key with value `false` is allowed); `status` or `trackedDiff` missing; `status` not porcelain v1; the preexisting entry `?? corpus/evidence/round-20/sources/html_form_element.cc` absent from `status`.
- `tracked_change`: `trackedDiff` non-empty, or any status entry whose code is not `??`.
- `out_of_scope`: any status path (or rename part) outside `.ufo/waves/round-20/` and `corpus/evidence/round-20/sources/`. Quoted paths fail closed.

`--selftest` writes 10 fixtures into a fresh `mkdtemp` directory, runs the CLI on each as a child process, and compares exit and sorted finding codes against `corpus/evidence/round-20/wave-check-expected.json`. That file is hand-written and committed separately. Cases: `positive_clean_triple` (0, none); `wave_null`, `wave_mismatch`, `agent_id_missing`, `snapshot_reconstructed`, `tracked_change`, `out_of_scope` (1, each its own code); `phase_return_after_integration` (1, `snapshot_reconstructed`, per parent steer); `reconstructed_marker` (1, `snapshot_reconstructed`); `preexisting_source_entry_absent` (1, `snapshot_reconstructed`).

**Flag for veto:** `reconstructed_marker` and `preexisting_source_entry_absent`, plus the source-entry presence requirement, go beyond the six named cases and the parent steer. Both are my additions, and each can be removed by editing the checker and the expectations file.

## Capture requirement (operational, not enforced)

Per parent steer, L1 captures the return snapshot directly after all 64 registry members settle and before any clone import. The preexisting untracked source must still be present, and both allowed prefixes apply. Parent reports that since `before.json` (`capturedAt` 2026-10-21T09:50:49.209998+00:00, phase `before-dispatch`) L1 has only added `.ufo/waves/round-20/` bookkeeping. I did not verify that. `before.json` is not a return snapshot and fails the phase check by design.

[INFERENCE] `before.json` lists individual untracked files, which suggests `git status --porcelain=v1 -uall`. A collapsed entry such as `?? corpus/evidence/round-20/sources/` fails the source-entry check, so the failure is closed.

## Retained evidence

- Commit `ce92ca3c26e6f113f03daa51321ee34fb31d92e9` on branch `round20/ExecFrozen`, base `c49929430d996b016dde2e3a3a5be380f3433fdb`. `git log -1` shows author and committer `tabi-shokunin <tabi@shokunin.local>`.
- `git diff --name-only c49929430d996b016dde2e3a3a5be380f3433fdb HEAD` → `.ufo/waves/round-20/check-wave.mjs`, `corpus/evidence/round-20/wave-check-expected.json`.
- Mode of `check-wave.mjs`: 100755, applied by the write tool.
- SHA-256: `check-wave.mjs` `c073c2459266f3df2cfbfac4de606807513cf8fca42e1bb6c7efe7b672b92cbf`; `wave-check-expected.json` `963762a7675f1f7cc563317cd04a80a6a278e3736b98cfb61fce9ab299811e9b`.
- Clone status after commit: only the pre-existing untracked `?? .ufo/waves/round-20/design.json` and `?? corpus/evidence/round-20/sources/`. Nothing else was staged or committed.
- Inputs read but not run through the checker: `w1/spec.json` wave `tabi-round-20-w1`, 64 items. `w1/swarm-registry.json` wave `tabi-round-20-w1`, 64 members, each with an `agentId` string of the form `TabiR20.<name>`, as observed by reading. `w1/registry-label-check.json` `{exit:0, wave:"tabi-round-20-w1", specWave:"tabi-round-20-w1"}`. `w1/record.json` is not a CLI input; I observed `wave` `tabi-round-20-w1` and `registry: null` only.

## Risks and blockers

- Untested. Neither the CLI nor the selftest was executed. Main should run `node .ufo/waves/round-20/check-wave.mjs --selftest` once in the integrated tree, expecting exit 0 and `cases=10 failed=0`.
- The checker does not verify settle order, capture actor, or the 64-member count against spec items.
- Hard-coded constants: round-20 baseline, path prefixes, and the preserved source path.
- Quoted porcelain paths fail closed as `out_of_scope`.

## Isolation and tooling

- Clone: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-20/clones/ExecFrozen`, branch `round20/ExecFrozen`.
- Identity was set per the CriticIsolation note. No `git add -A`, no push, no subagents dispatched.
- No tools installed or updated.
- Design dependency: none read at runtime; no design sha pinned. The checker hard-codes `ROUND_BASELINE` (design `baseline`), the preserved source path (design `source.path`), and the `.ufo/waves/round-20/` prefix. Both design values match in the clone's pre-change copy (sha256 37fa4eabe373cc8cbe36d8d397a325997bd7d30b87be5a523e1e6cb127bd3fa1) and the current lane file (sha256 1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da, mtime 2026-10-21 07:02:31 -0300, i.e. 10:02:31Z). The lane change adds LC11 `sourceId` S100, rewrites LC12 `topic`, and rewrites `skillRendering`; the checker reads none of these. No commit was made after ce92ca3c26e6f113f03daa51321ee34fb31d92e9.
