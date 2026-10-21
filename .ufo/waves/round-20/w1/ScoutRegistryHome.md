# ScoutRegistryHome — round-20 registry format and registration pattern

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` (= HEAD) · scope: read-only. No counter, gate, self-test, or build was executed. The only write is this file.

Tooling: none installed or updated.

Git note: the first `git status` in this session ran without `GIT_OPTIONAL_LOCKS=0`, so it may have refreshed the lane index stat cache. No other write was made. Later reads used `GIT_OPTIONAL_LOCKS=0`.

## 1. Result

1. **SKILL registry format.** Registries are per-round tables appended to `SKILL.md`. Use the round-19 six-column form for round 20. Append a new section at EOF only. `SKILL.md` is in the append-only set and must keep its baseline bytes as a prefix.
2. **Three registrations are needed.** These are a source-row probe (`counts.mjs`), the lifecycle counter (`measure-c1.mjs`), and the wave provenance gate (`check-wave.mjs`, not yet landed). Each needs a SKILL row. The counter also needs a measurement-binding claim and a `run-checks.py` cohort entry.
3. **Admission blockers.**
   - Every round-20 product and the S096 source bytes are untracked at baseline.
   - No C1 binding manifest exists.
   - The S096 anchor cell does not cover the LC11 decision span.
   - The self-test flag spelling conflicts (`--selftest` vs `--self-test`).
   - The wave check does not yet cover clone isolation (QUALITY 45).

## 2. SKILL registry format (`SKILL.md`)

| Table | Line | Columns | Status |
|---|---|---|---|
| Round 19 registry | `:2094-2103` | Name / kind · Entry command (lane root) · Verdict map · Self-test · Pinned values · Write scope / owner | **Use this.** Most recent. |
| Round 18 registry | `:2020-2032` | 5 columns, no pinned-values column | Precedent only |
| Measurement-binding gate (C1) | `:1836-1847` | Name · Entry · Verdict map · Pinned / checked · Write scope | Existing gate row. **Reuse; add no new binding row.** |
| Round 17 registry | `:1933-1942` | Entry · argv · Verdict map · sha256 | Precedent only |
| Freshness, sources, claim-record, metadata gate registries | `:1555`, `:1610`, `:1653`, `:1751`, `:1792` | Name · Kind/owner · Entry and verdict map · Self-invocation · Baseline or pins · Write scope | Gate-only precedent |

- Exit convention (`:2130-2134`): probe exit 0 means an evaluated count, not a pass. Normal evaluation or usage error is exit 2. The round-19 self-test failure exit is 1.
- **Append-only.** `scripts/check-round-contract.mjs:25` lists `SKILL.md`, `LOG.md`, `corpus/README.md`, and `corpus/QUALITY.md` as append-only. Lines `:316-321` require every baseline byte to remain a prefix at each revision. `scripts/check-freshness.mjs:99` also pins the `SKILL.md` prefix.
- **Not machine-parsed.** A grep over `scripts/` for `SKILL|Registry|registry|measure-c|wave` found no table parser. Registry shape is a convention, enforced only through the append-only prefix check.
- Decision-table house style: `| ID | ... |` tables (`SKILL.md:722`, `:733`). The design's `skillRendering` requires `| ID | condition | outcome | S096:START-END |` under the declared heading, with no pipes inside cells.

## 3. Source-row probe — `.ufo/waves/round-20/counts.mjs` (new this round)

- Entry: `node .ufo/waves/round-20/counts.mjs <40-hex REV>`. 15 lines, no self-test.
- Behavior (`counts.mjs:4,7,11,13-15`): reads `git show REV:corpus/SOURCES.md` and `ls-tree corpus/knowledge/` with `GIT_NO_REPLACE_OBJECTS=1` and `GIT_CONFIG_GLOBAL=/dev/null`. Prints one JSON line `{revision, rows, tiers, statuses, knowledge}`. Exit 2 on a non-40-hex REV or git error.
- Baseline receipt: `.ufo/waves/round-20/counts-before.json` has argv, `producerSha256 fec9a31e…df79`, exit 0. Baseline counts are rows 99 (A86/B4/C9) and statuses mined 71 / queued 19 / rejected 9. Knowledge is 37. The current worktree `counts.mjs` hashes to `fec9a31e…df79`, matching the receipt.
- **Hazards**
  1. `counts.mjs` is untracked. QUALITY 30 cites a producer only when its digest equals the blob registered for the claim, so it must be committed first.
  2. `counts.mjs:11` counts every `| S### |` line in the file. `scripts/check-sources.mjs:262-266` counts rows only inside `## Registry`, and flags others as `row_outside_registry`. The two disagree exactly when the gate fails.
  3. `source-counts-before.json` is prose only ("script recorded in source-counts.mjs before delivery"). No `source-counts.mjs` exists under `.ufo/waves/round-20/`. Cite `counts-before.json` instead.
  4. `census-before.json` cites fleet script `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`. It records exit 0 and W04 duplicate-scope warnings including S096, but no producer digest (QUALITY 30).
- Not a claim: the design declares only C1. A binding is required only if a count is asserted as a claim (QUALITY 22, 34).

## 4. Lifecycle counter — `measure-c1.mjs` (C1)

- Design (`design.json`): `counter` `.ufo/waves/round-20/measure-c1.mjs`; `manifest` `corpus/evidence/round-20/lifecycle/decisions.json` (content manifest, schema `tabi-webmcp-lifecycle-decisions-v1`); `note` `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
- Argv that the binding gate accepts: `["node", ".ufo/waves/round-20/measure-c1.mjs", "{REV}"]`. Exactly one `{REV}` token is required (`check-measurement-binding.mjs:514-520`).
- Output contract: exactly one JSON line on stdout (`:551-562`). The round-19 precedent is `.ufo/waves/round-19/measure-c1.mjs:1504-1523`, which prints one JSON line and writes `C1_COUNTER_ERROR` to stderr with exit 2 for usage errors.
- `countField` must match `^[A-Za-z_][A-Za-z0-9_]*$` (`:122`). `c1_lifecycle_decisions` passes.
- Baseline arm: the gate reruns the worktree counter at `c4992943…`. The counter must return 0 with exit 0 when the manifest is absent (ExecCounter spec).
- **Self-test spelling conflict.** Round-20 specs and `run-checks.py:62-63` use `--selftest`. Every SKILL row and gate in `scripts/` uses `--self-test` (`SKILL.md:1614`, `:1840`, `:2098`; `measure-c1.mjs:1464` in round 19). Pick one before integration. The `run-checks.py` argv is currently `--selftest`.
- **Two self-test entry points are specified.** ExecCounter may add `--selftest`. ExecFixtures specifies an external `selftest-c1.mjs` with `corpus/evidence/round-20/selftests/expected.json`. The registry must name exactly one canonical command.
- **Binding manifest is absent.** No `measurement-binding.json` exists under round 20. Rounds 18 and 19 use `.ufo/waves/round-N/measurement-binding.json`. Rounds 16 and 17 use `corpus/evidence/round-N/`. The `check-measurement-binding.mjs:33` header is stale. Use `.ufo/waves/round-20/measurement-binding.json`. QUALITY 22 requires this manifest for the C1 count.
- Gate constraints (`check-measurement-binding.mjs`):
  - Every `countedInputs` entry needs a tree entry at `measuredRevision` (`:599-609`). The untracked S096 bytes must be committed at M.
  - No change to `countedInputs` or the counter path between M and REV (`:610-614`).
  - Worktree counter bytes must equal the blob at REV (`:623-638`).
  - Reproduction arms are baseline→0 and REV→12 (`:643-657`).
- If `SKILL.md`, `corpus/SOURCES.md`, or the README are listed as counted inputs, M must be the last commit that touches them. The round-19 C1 claim lists both (`.ufo/waves/round-19/measurement-binding.json:30-31`).
- `run-checks.py:62-63` already registers `('lifecycle', '.ufo/waves/round-20/measure-c1.mjs', '--selftest')`.

### Claim skeleton (fill M and the count after landing)

```json
{
  "schema": "tabi-measurement-binding-v1",
  "round": 20,
  "baseline": "c49929430d996b016dde2e3a3a5be380f3433fdb",
  "claims": [{
    "id": "C1",
    "axis": "depth",
    "counter": {
      "path": ".ufo/waves/round-20/measure-c1.mjs",
      "sha256": "<64-hex blob at M>",
      "argv": ["node", ".ufo/waves/round-20/measure-c1.mjs", "{REV}"],
      "countField": "c1_lifecycle_decisions"
    },
    "countedInputs": [
      "corpus/evidence/round-20/lifecycle/decisions.json",
      "corpus/evidence/round-20/sources/",
      "corpus/knowledge/webmcp-completion-lifecycle-round-20.md",
      "corpus/SOURCES.md"
    ],
    "measuredRevision": "<40-hex M>",
    "before": {"revision": "c49929430d996b016dde2e3a3a5be380f3433fdb", "count": 0},
    "after": {"revision": "<40-hex M>", "count": 12}
  }]
}
```

## 5. Wave provenance — `check-wave.mjs` (ExecFrozen, not yet landed)

- Interface (ExecFrozen spec): `--spec FILE --registry FILE --snapshot FILE`, plus `--selftest`. Finding ids: `wave_null`, `wave_mismatch`, `agent_id_missing`, `snapshot_reconstructed`, `tracked_change`, `out_of_scope`. Expected pairs: `corpus/evidence/round-20/wave-check-expected.json`. The run-checks cohort already includes it at `run-checks.py:63`.
- Exit codes are not in the spec. Propose 0 clean, 1 finding, 2 could-not-evaluate, matching the round-19 registry.
- **Current inputs (verified by read).**
  - `w1/spec.json`, `w1/swarm-registry.json`, and `w1/record.json` each have top-level `wave` = `tabi-round-20-w1`.
  - Registry has 64 members and 0 null or empty `agentId`. Spec has 64 items.
  - `w1/dispatch.json` has top-level `wave`. Its embedded `registry` has keys `[members, path, reportDir, schema]` and no `wave`. Its `agentId` values are null. It is not the registry file (QUALITY 44; `.ufo/waves/round-19/corrections/r18-registry-wave-null.md:3,5,7,23-24`).
- **Check the registry file, not the dispatch object.** Cover `swarm-registry.json` and `record.json`. Round 18 had both with `wave: null`.
- `w1/registry-label-check.json` = `{"exit":0,"wave":"tabi-round-20-w1","specWave":"tabi-round-20-w1"}`. It names no file, argv, or producer digest, so it is not a QUALITY 26/30/44 receipt. Replace it with `check-wave.mjs` output that records the registry path and digest.
- **Snapshot schema.** `w1/before.json` has `phase: "before-dispatch"`, `observed: true`, `baseline`, `status` (porcelain), `trackedDiff: ""`, and `capturedAt: 2026-10-21T09:50:49.209998+00:00`. The return snapshot must be `phase: "return-before-integration"` with the same keys. It must carry no reconstruction marker (QUALITY 48). The round-19 precedent to reject is `.ufo/waves/round-19/isolation/ledger.json:6` (`laneStatusAfterMethod: RECONSTRUCTED`).
- **Status allowlist.** `before.json` already lists `?? corpus/evidence/round-20/sources/html_form_element.cc`. Allow exactly `.ufo/waves/round-20/` and `corpus/evidence/round-20/sources/`. Anything else is `out_of_scope`.
- **Timeline.** `before.json` (09:50:49.209Z) lists the S096 file as untracked. `source-opening.json` records `openedAt` 09:52:32.343Z. Either the file predates the opening receipt or the receipt is a re-open. The receipt should record the first retrieval time.
- **Gap.** QUALITY 45's clone-isolation ledger has no round-20 checker in the cohort. The round-19 precedent is `.ufo/waves/round-19/isolation/check-isolation.mjs` with `tabi-r19-isolation-ledger-v1`. Register a checker or retire the criterion for this round with a reason.

## 6. Source row S096 — `corpus/SOURCES.md`

- Header: `corpus/SOURCES.md:13`, eleven cells: `id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`. The gate requires 13 split fields (`check-sources.mjs:306`). Kinds, tiers, and statuses are at `:26-28`. No pipes inside cells.
- Current S096 row (`:110`): status `mined`, opened `2026-10-21`, recheck `on-release`, used-by `corpus/knowledge/webmcp-declarative-validation-round-19.md`, anchor `html_form_element.cc:174-328,729-758,818-842`.
- **Used-by edit.** Append the new note with `, ` (`check-sources.mjs:329` splits on `,` or `;`). The gate fails `used_by_missing` until the note exists, and `used_by_uncited` unless the note contains the token `S096` (`:231-232`). Land the SOURCES edit and the note in the same commit.
- **Anchor gap (verified).** LC11's decision branch is `html_form_element.cc:807-813`: `else if (!should_submit)` at 807, `CallDoneCallback` at 808-813. The design span is 787-815. Neither lies inside `174-328`, `729-758`, or `818-842`, so LC11 is not covered by the registered anchor. LC01 (181-186), LC12 (825-829), and the other decisions are covered.
- Recommended fix: widen the anchor in place (`174-328,729-758,807-813,818-842`), with no new row and the sha unchanged, and log it in LOG.md. Narrowing is not possible because the decision lines fall outside the anchor. Main decides.
- Decision spans to use: LC11 `807-813` per `ScribeChecklist.md`, rather than the design's loose `787-815`. LC12 `825-829`.

## 7. Row shapes to register

### 7a. SKILL — `### Registry — round 20` (append at EOF)

```
| Name / kind | Entry command (lane root) | Verdict map | Self-test | Pinned values | Write scope / owner |
|---|---|---|---|---|---|
| source-row count / probe | `node .ufo/waves/round-20/counts.mjs REV` (REV 40-hex) | 0 counted JSON line; 2 could-not-evaluate (non-40-hex REV, git error); a count, not a verdict | none claimed (probe) | `.ufo/waves/round-20/counts-before.json` producerSha256 `fec9a31e…df79`; baseline rows 99 (A86/B4/C9; mined71/queued19/rejected9), knowledge 37 | read-only git; stdout only; tabi |
| lifecycle counter / probe (C1) | `node .ufo/waves/round-20/measure-c1.mjs REV` | 0 evaluated count (`c1_lifecycle_decisions`; absent baseline manifest = 0); 1 failed (malformed partial state, self-test failure); 2 could-not-evaluate (invalid REV) | `node .ufo/waves/round-20/measure-c1.mjs --selftest`; receipt path to fix (round-19 pattern `corpus/evidence/round-20/selftests/c1.json`); fixed pairs `corpus/evidence/round-20/selftests/expected.json` | `corpus/evidence/round-20/lifecycle/decisions.json`; S096 sha256 `8c8d6796…6916`; counter blob sha256 at measuredRevision; `.ufo/waves/round-20/measurement-binding.json` | private fixture Maps and temp repos; read-only git; tabi |
| wave provenance / gate (exit map proposed) | `node .ufo/waves/round-20/check-wave.mjs --spec SPEC --registry REGISTRY --snapshot SNAPSHOT` | 0 clean; 1 finding (wave_null, wave_mismatch, agent_id_missing, snapshot_reconstructed, tracked_change, out_of_scope); 2 could-not-evaluate | `node .ufo/waves/round-20/check-wave.mjs --selftest`; pairs `corpus/evidence/round-20/wave-check-expected.json`; receipt path to fix | `.ufo/waves/round-20/w1/spec.json`, `swarm-registry.json`, `record.json`, `before.json`, return snapshot | read-only inputs; temp fixtures in selftest; tabi |
```

The measurement-binding gate already has its row at `SKILL.md:1838-1840`. Reference it; do not add a second row.

### 7b. SKILL — decision table (heading verbatim from `design.json`)

```
### Declarative WebMCP completion lifecycle — source-scoped (round 20)
| ID | condition | outcome | S096:START-END |
|---|---|---|---|
| LC01 | <condition, no pipes> | <outcome, no pipes> | S096:181-186 |
```

### 7c. Binding manifest claim — see section 4.

### 7d. S096 row — change two cells only

```
anchor:  html_form_element.cc:174-328,729-758,807-813,818-842
used-by: corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md
```

### 7e. `corpus/README.md` — append `## Round 20 — …` (APPEND_ONLY)

```
| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-completion-lifecycle-round-20.md` | <source-only completion lifecycle, not runtime> | S096; `corpus/evidence/round-20/lifecycle/decisions.json`; `.ufo/waves/round-20/measure-c1.mjs` |
```

Model: `corpus/README.md:401-405`. Also add a frontier line, and re-derive the knowledge count with `counts.mjs` at the commit (QUALITY 11, 34, 43). Expected knowledge count is 38 [INFERENCE: 37 + one note].

### 7f. `LOG.md` — append one entry per change (`AGENTS.md:3`)

Header pattern: `## Round 20 — <lane>, 2026-10-21 (<qualifier>)` (model: `LOG.md:1086`). Cite the commands and their output. Include the S096 anchor widening, if chosen.

### 7g. `run-checks.py` cohort — already registered

`run-checks.py:62-63` already lists `lifecycle` and `wave-provenance` with `--selftest`. Keep the flag spelling aligned with 7a.

## 8. Hazards, ordered by admission impact

1. **Untracked bytes (blocking).** At baseline, `git ls-tree` of `corpus/evidence/round-20` and `.ufo/waves/round-20` returns nothing. These are untracked: the S096 source, `counts.mjs`, `counts-before.json`, `run-checks.py`, `design.json`, and all `w1/*` products. QUALITY 28 and 30 require committed bytes before any receipt or claim can cite them.
2. **No C1 binding manifest (blocking).** QUALITY 22 requires `check-measurement-binding.mjs --check .ufo/waves/round-20/measurement-binding.json --at <HEAD> --reproduce` to exit 0. The design does not name this manifest.
3. **LC11 anchor gap.** Widen the S096 anchor before citing LC11 (section 6).
4. **Self-test spelling.** `--selftest` in `run-checks.py` vs `--self-test` everywhere else. Pick one.
5. **Wave check.** `check-wave.mjs` has not landed. `registry-label-check.json` lacks provenance. The QUALITY 45 ledger checker is absent from the cohort.
6. **Unreproducible receipts.** `source-counts-before.json` has no producer. `census-before.json` has no producer digest for the fleet script.
7. **Counter vs gate scope.** `counts.mjs` counts rows anywhere in the file. The gate counts only inside `## Registry`. Note this in the SKILL row.
8. **Counted inputs edited after M.** If the round edits SKILL, SOURCES, or the README after M, the binding fails `counted_input_changed`.

## 9. Checks for main to run once after integration (not run by this scout)

- `node .ufo/waves/round-20/measure-c1.mjs --selftest`
- `node .ufo/waves/round-20/check-wave.mjs --selftest`
- `node .ufo/waves/round-20/measure-c1.mjs <M>` and `node .ufo/waves/round-20/counts.mjs <HEAD>`
- `node scripts/check-sources.mjs` (expect rows 99, findings 0)
- `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-20/measurement-binding.json --at <HEAD> --reproduce`
- `node scripts/check-round-contract.mjs --witness <REV>` (append-only prefixes)
- `python3 .ufo/waves/round-20/run-checks.py <FULL_REV> <NEW_OUTPUT_JSON>`

## 10. Untested

Every statement above comes from reading source and receipts, plus read-only `git`, `sha256sum`, and JSON-path reads of wave files. No counter, gate, self-test, or runner was executed. Clone contents were not read beyond listing.
