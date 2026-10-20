# BindSelftest — wave 1 report (round 16, C1)

Seat: `TabiR16.BindSelftest-5`. Owned file: `scripts/selftest-measurement-binding.mjs` (new, 16.5 KB, executable).

## What was built

Standalone Node ESM driver (no deps, argv arrays only, `spawnSync` — never a shell) that:

- Resolves the gate path relative to `import.meta.url` (`scripts/check-measurement-binding.mjs`), with a `--gate <path>` escape hatch. Never resolved via cwd.
- Per case: `mkdtempSync` under `os.tmpdir()` → `git init -q -b main` → fixture commits with `-c user.name/-c user.email/-c commit.gpgsign=false` plus `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` pinned to `1700000000 +0000`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`, `GIT_NO_REPLACE_OBJECTS=1`, `TZ=UTC` → `spawnSync(process.execPath, [gate, '--repo', tmp, '--check', <manifest> ...])` with the same minimal env → `rmSync` in `finally` (verified: no temp repos leaked).
- Asserts **exact exit status + exact reason set**: `reason=` tokens parsed per-line from gate stdout, compared as sets (no substring `includes` matching — a wrong/reordered/missing/extra reason fails the case).
- Prints `case=<id> expected_exit= actual_exit= expected_reasons= actual_reasons= PASS|FAIL` per case, `FAIL_DETAIL` lines on **stderr**, and the required last stdout line `MEASUREMENT_BINDING_SELFTEST verdict=clean|failed cases=<n> reasons=<k>`. Exit 0 only if every case passes.

## Case table (41 cases, 13 reasons)

| Case | Expected | Notes |
|---|---|---|
| `clean` | exit 0, no reasons | counter + `counted/` input at rev1, manifest committed at HEAD, `measuredRevision=rev1` |
| `clean_reproduce` | exit 0 | same fixture + `--reproduce`; counter prints `{"c1_binding_contracts":1}` |
| `measured_revision_not_ancestor` | exit 1, that reason | `measuredRevision` = `git commit-tree` child of rev1 on the **identical tree** → real commit, not an ancestor of HEAD, zero counted/counter diff |
| `counter_digest_unrecorded` | exit 1 | `sha256` key omitted from `counter` |
| `counter_digest_mismatch` | exit 1, `{mismatch, counted_input_changed}` | sha recorded = sha(v2 blob); rev1 blob is v1 → mismatch at measured but match at REV, so `changed_since` must NOT fire — isolates the two |
| `counter_changed_since_measurement` | exit 1, `{changed_since, counted_input_changed}` | sha = v1 blob; HEAD blob is v2 |
| `counted_inputs_undeclared` | exit 1 | `countedInputs: []` |
| `counted_input_changed` | exit 1 | `counted/input.txt` rewritten after rev1 |
| `argv_unsupported_missing_rev` | exit 1 | `{REV}` token absent |
| `argv_unsupported_bad_runner` | exit 1 | `argv[0]='/bin/sh'` |
| `argv_unsupported_wrong_path` | exit 1 | `argv[1]='other.mjs'` |
| `counter_failed` | exit 1, `--reproduce` | counter `process.exit(3)` |
| `count_not_reproduced` | exit 1, `--reproduce` | counter prints `c1_binding_contracts:0` vs `after.count:1` |
| `manifest_unreadable` | exit 2 | `--check` path does not exist |
| `manifest_schema_invalid` | exit 2 | wrong `schema` tag |
| `manifest_malformed_json` | exit 2, `manifest_schema_invalid` | unparseable JSON (decided: malformed-JSON lands in the schema-invalid bucket) |
| `revision_unresolved_at` | exit 2 | `--at` = 40-hex nonexistent |
| `revision_unresolved_measured` | exit 2 | `measuredRevision` = 40-hex nonexistent |
| `git_failed` | exit 2 | `--repo` points at a non-repo mkdtemp dir |
| `multi_claim_inputs_undeclared` | exit 1 | C1 clean + C2 with `countedInputs:[]` — per-claim reason routing |
| `legacy_counter_unchanged` | exit 1, `{digest_unrecorded, inputs_undeclared}` | r15-shaped manifest; counter blob identical counterCodeRevision→HEAD → `changed_since` must NOT fire (same-shape positive control for the changed variant) |
| `legacy_counter_changed` | exit 1, all 3 legacy reasons | counter blob rewritten after `counterCodeRevision` |
| `rev_injection_inert` | exit 0 + marker assertion | argv carries `;`, `$(touch INJECTED)`, `` `touch INJECTED2` ``, `&& touch INJECTED3` alongside one valid `{REV}`; after `--reproduce` asserts no `INJECTED*` file exists in repo or tmpdir |

Every negative case ships a `<id>_control` twin: identical unmutated fixture run with identical flags, expected exit 0 / empty reasons (the two legacy cases control each other; injection case doubles as its own positive control). This is the wrong-reason-decoy defense: control proves the fixture shape is clean, and the set-equality assertion proves the gate names exactly the intended reason.

## Observed run output

`node scripts/selftest-measurement-binding.mjs` (against BindCore's gate as of 2026-10-20 11:34): **41/41 PASS**, `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=41 reasons=13`, exit 0 — full transcript run twice, identical results; all 13 vocabulary reasons exercised (`measured_revision_not_ancestor`, `counter_digest_unrecorded`, `counter_digest_mismatch`, `counter_changed_since_measurement`, `counted_inputs_undeclared`, `counted_input_changed`, `argv_unsupported`, `counter_failed`, `count_not_reproduced`, `manifest_unreadable`, `manifest_schema_invalid`, `revision_unresolved`, `git_failed`).

Integration path verified: `node scripts/check-measurement-binding.mjs --self-test` → same table, exit 0 (gate invokes my script correctly).

## C1 counter implications (for MeasureCounters/L1)

- `cases=41` ≥ 12 ✓; all 13 vocabulary reasons exercised ✓; last-line grammar `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=41 reasons=13` matches PLAN §C1 exactly (underscore literal, not hyphen — confirmed against gate's own `MEASUREMENT_BINDING` first line).
- Receipt `corpus/evidence/round-16/binding/selftest.json` needs: exit 0, the summary line, `cases≥12`, every reason exercised, `gateSha256` = gate blob digest at measured REV. Current gate sha256 will shift if BindCore edits; L1 should regenerate the receipt after freeze.

## Coordination / deviations

- Messaged `TabiR16.BindCore-5` re grammar (finding-line shape for exit 2, `{REV}` token position, legacy claim set); BindCore's gate landed conforming to PLAN: exit-2 outcomes emit `reason=` lines, `{REV}` enforced as exactly-one-token, legacy adapts C1+C2 keyed claims. No further alignment needed.
- Adopted ReconGatePatterns advice: per-case mkdtemp with `finally` rmSync, `import.meta.url` path resolution, set-equality reason matching instead of `includes`, stderr FAIL_DETAIL + last-line summary, fixed dates + `commit.gpgsign=false` on fixture commits.
- Judgment calls: malformed JSON counted as `manifest_schema_invalid` (single could-not-evaluate bucket); `counter_digest_mismatch` and `counter_changed_since_measurement` fixtures each also produce `counted_input_changed` because the counter path is inside the diff pathspec — that pairing is contract-implied, not a bug.

## Risks / blockers

- None blocking. If BindCore changes reason tokens or exit semantics later, controls will FAIL loudly — that is the intended falsifier behavior.
- No tool installs this wave. Fixture git calls are pure `git`/`node` already present (git 2.56.0, node v24.21.0).
