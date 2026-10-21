# AttackRevision — round-22 W1

Scope: shared C1 oracle and debt design. Question: full-40-hex immutable revision, isolated Git and no-replacement reads, missing blob vs absent baseline. Inspected at the state present during this pass: committed private clones, plus the lane checkout.

Axes: A1 data bound to the revision · A2 code and harness identity · A3 absent vs failed vs unreadable · A4 Git environment isolation · A5 selftest coverage of A1–A4 · A6 debt absence and provenance.

Isolation: read-only file reads and read-only git only, with `env -i` and `GIT_NO_REPLACE_OBJECTS=1 GIT_OPTIONAL_LOCKS=0 GIT_NO_LAZY_FETCH=1 GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`. Not run: tests, selftests, builds, linters, smokes, `measure-c1.mjs`, `run-checks.py`, browser, network. Installed: nothing. Git observed: 2.56.0 (retained probes were 2.55.0).

## Observed state

- Lane HEAD = BASE `5f585773258b33d2d514b00cd0b0775333578db6`. `rev-list --count BASE..HEAD` = 0.
- No `refs/replace/*`. `.git/shallow`, `.git/info/grafts`, `objects/info/alternates` absent. `.git/config` has no `extensions.*`, promisor, `core.hooksPath|fsmonitor|attributesFile`, `diff.*`, `filter.*`, `gpg.*`, `log.*` or `include` keys.
- BASE has 0 entries under `corpus/evidence/round-22` and no `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. The note exists only as an untracked lane file.
- BASE tracks: 25 files under `corpus/evidence/round-21/runtime/`, `.ufo/waves/round-21/runtime-execution-finalized.json`, `scripts/webmcp-lifecycle-round21.mjs`, `.ufo/waves/round-19/final/harm-at-measured.json`.
- `2d5eaaa3c8317bce31e1180b49df4516db35d44b` is an ancestor of BASE. Its tree holds the round-21 acquisition: the two pathspecs `corpus/evidence/round-21/runtime` and `.ufo/waves/round-21/runtime-execution-finalized.json` match 26 paths. `1b5f449ad15525d281fda4558aeef1086f1e4a65` and `e7cf11a810003d4a65cc85bd265f2c17dd65b738` (stored in the expectations' `acquisition` block) are also ancestors of BASE.
- Lane working tree differs from BASE in `corpus/SOURCES.md`.
- Clone HEADs, clean tracked trees: BuildOracle `08762490719909b4be812efd46065b7d4c72de73`; BuildSelftest `81311bade38a8e6b75172bdc7040951413ebc2fe`; BuildDebt `854d5eab484777f3384194cb530dd093869501c4`.

Inspected files and digests (re-observed with `sha256sum`):
- `clones/BuildOracle/.ufo/waves/round-22/measure-c1.mjs` — `3d3a22e47cffc317cbe4e58bf9a0fae7a9ccb647fe895676c202150fe29525c7`
- `clones/BuildOracle/corpus/evidence/round-22/semantic-expectations.json` — `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` (matches BuildOracle.md:15)
- `clones/BuildSelftest/.ufo/waves/round-22/selftest-c1.mjs` — `b45d41bfc7afca0c8b661fcf897cf7c76e340ee538d091ddc3a0f71542b72582` (matches BuildSelftest.md:14)
- `clones/BuildSelftest/.ufo/waves/round-22/fixtures/expected.json` — `8029a0e85bf3d93e592796f98be2480de660377eef6002732dbeab04ad41bcbe`. BuildSelftest.md:15 pins `e4a2c8cb…`, so that report is stale. Its cited commit `1677262f…` is also not HEAD.
- `clones/BuildDebt/.ufo/waves/round-22/check-review-chronology.mjs` — `fb6f2aca3fccd9445417433b8f6a93d9c3e67c38523322683ea0834c7c0c417d`
- Lane `.ufo/waves/round-22/run-checks.py` (uncommitted), `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (uncommitted).

## Direct answer to the assigned question

- Missing object, unresolvable revision, unreadable blob: exit 2 in the oracle. `git()` throws on any non-zero status (measure-c1.mjs:487-493), the revision must be full lowercase hex and equal its `^{commit}` resolution (L495-498), and `cat-file` failures throw (L505). This separation is correct.
- Absent path at a readable commit: zero `ls-tree` rows (L501-504). Baseline is correct only when both round-22 inputs are absent (L373).
- Still collapsing absence into baseline or clean: exported `evaluate` on malformed input (F6); the baseline shortcut skipping acquisition (F7); an empty-tree entry (F10); lazy fetch turning a missing object into a fetched one (F8); the debt classifier's empty history (F3); and the helpers listed in F18.
- "Immutable revision" holds for the name (full-hex regex plus rev-parse equality) and, for the oracle's own Git calls, for replacement-free reads. It does not bind code identity (F5), in-commit pins (F1), the L1 cohort and child environment (F4), or lazy fetch (F8).

## Findings

Severity: High = contract-level false result or integration blocker. Medium = bypass with a concrete precondition. Low = hygiene or latent.

### F1 High — Acquisition is self-certified by the commit under test
- Where: measure-c1.mjs L22-23 (in-code pins), L379-380, L401, L403-426. `filesAt` (L494-508) reads every input at the argument revision.
- Counterexample: let F be a commit that scores 12 clean. Let G be a child of F that changes `corpus/evidence/round-21/runtime/na-pending.json` so its outcome differs. G also updates the receipt case digest, the execution JSON's artifact digest and `receiptSha256`, the `na-pending` row of `semantic-expectations.json`, and the `EXPECTATIONS_SHA256` constant. `measure-c1.mjs G` returns exit 0, value 12, verdict clean, findings []. No step consults 2d5eaaa or BASE.
- Stable expectation: a new finding `evidence_binding:acquisition-anchor-mismatch` (exit 1, value 0) for every acquisition path whose blob OID at the measured revision differs from its OID at an anchor recorded outside that commit. Anchor set: the 26 paths at 2d5eaaa plus `scripts/webmcp-lifecycle-round21.mjs`. Anchor OIDs live in run-checks.py and in the L1 record, not in the measure. For G: exit 1, with mismatches on the na-pending raw, receipt and execution paths.
- Residual: the expectations file and the note are new, so no history anchors them. They need an out-of-band digest in the L1 record. A pin inside the measure is circular.
- Preserve: at an integrated commit whose round-22 changes are only measure, selftest, fixtures, note and expectations, every anchored OID equals 2d5eaaa, so 12 clean stays. A descendant that edits only the note body, not line 1, still scores 12.

### F2 High — Integration blocker: the S101 header differs between note and measure; the selftest positive reads the working tree
- Where: measure-c1.mjs L24 `SOURCE_HEADER`. `semantic-expectations.json` `sourceHeader` is byte-identical to L24 (observed by query). Lane `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` line 1 (untracked) reads `source: S101 — corpus/evidence/round-21/runtime/receipt.json and its per-case JSON/HTML; reopened 2026-10-21; retained acquisition .ufo/waves/round-21/runtime-execution-finalized.json`. `evaluate` L382-387 then yields `source_binding:canonical-S101-first-line`. selftest-c1.mjs L49-50 read NOTE and EXPECTATIONS from `ROOT` (working tree). The `positive` row (fixtures/expected.json:5) expects exit 0, value 12.
- Counterexample: commit the note as it now stands. `measure-c1.mjs FULL` returns exit 1 `canonical-S101-first-line`. run-checks `c1-after` (expects 12/clean, run-checks.py L76, L79) goes red, and selftest `positive` goes red.
- Stable expectation: one header constant. The measure compares it byte-for-byte to line 1 of the note at the measured commit, read with `git cat-file blob`. Mismatch gives `source_binding:canonical-S101-first-line`, exit 1. The selftest positive reads the note and expectations from the fixture commit or the integrated commit, never from an unrelated working tree.
- Preserve: any note whose line 1 equals `SOURCE_HEADER` byte-for-byte produces no finding, whatever the rest of the note says.

### F3 High — Debt classifier: `event_history: []` is treated as observed history and can exit 0
- Where: clones/BuildDebt `.ufo/waves/round-22/check-review-chronology.mjs` L113-116 (only absent or null is unavailable), L117 (`Array.isArray`), L165-168 (`status:'available', seats:[]`), L228 (key presence), L261-273 (no finding leads to `matched_supplied_scope`, exit 0). `scope_limit` at L209 says completeness is not assessed.
- Counterexample: both sides have equal producer digests and equal artifact scope, chronology is consistent, and `"event_history": []`. Result: exit 0, `matched_supplied_scope`. Remove the key and the result is exit 2 `event_history_unavailable`. A producer whose capture failed writes `[]`. The brief says missing history "stays unavailable, not reconstructed".
- Stable expectation: `event_history: []` gives exit 2 `event_history_unavailable`, or a distinct exit-2 finding such as `event_history_empty_uncertified`. Never exit 0.
- Preserve: absent key and `null` stay exit 2. Non-empty history with a failure followed by a peer message stays exit 1 `peer_revival_after_failure`. Non-empty history with no failure and equal scope stays exit 0, "as supplied".

### F4 High — The L1 harness takes its cohort and child environment from mutable state
- Where: run-checks.py L17-21 (`LANE` is the lane checkout), L45 (cohort read from `LANE/.ufo/waves/round-19/final/harm-at-measured.json`), L48 (`producerSha256 = digest(__file__)`, the lane copy), L49-50 (`cohortSourceSha256` recorded, not compared), L20 (`ENV = dict(os.environ, …)`), with L25, L30-32 and L92 inheriting it.
- Counterexample A: an uncommitted edit in the lane to one cohort row (argv or expected exit) in `harm-at-measured.json`. BASE tracks the committed file, so the immutable source exists. The run executes the edited cohort, and its output records the edited digest as though it were the source.
- Counterexample B: the L1 shell exports `GIT_DIR=/home/vgpnk/Projects/shokunin/.git`. Then `git -C <scratch> switch --detach` (L30) and `branch -f` (L31) resolve the fleet repository and move its HEAD outside the lane. [INFERENCE: GIT_DIR takes precedence over `-C` discovery. Same class as round-18 `measure-c1.mjs:1008` and `.ufo/waves/round-14/w1/SecurityScope.md:52` (E5).] The current shell exports only GIT_EDITOR, GIT_PAGER and GIT_TERMINAL_PROMPT (observed), so this is latent.
- Stable expectation: A: read the cohort with `git cat-file blob <BASE>:.ufo/waves/round-19/final/harm-at-measured.json` (or from the FULL clone) and compare its SHA-256 with a constant pinned in run-checks.py. Mismatch gives could-not-evaluate, exit 2. Producer digest comes from the clone's bytes at FULL. B: ENV becomes an allowlist: PATH with absolute entries only, HOME, LANG=C, TZ=UTC, GIT_CONFIG_NOSYSTEM=1, GIT_CONFIG_GLOBAL=/dev/null, GIT_NO_REPLACE_OBJECTS=1, GIT_NO_LAZY_FETCH=1, GIT_OPTIONAL_LOCKS=0, GIT_TERMINAL_PROMPT=0. Every other GIT_* is dropped.
- Preserve: the committed cohort equals the working-tree copy today, so the pinned digest matches and every historical row runs unchanged.

### F5 Medium — The code that runs is the working-tree file, not the file at the data revision
- Where: measure-c1.mjs L11-12 (`SELF`; `ROOT` from the file's own location). Data comes only from the argument revision (L494-508). The output carries `revision` alone (L522-523). Note line 3 recommends `node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV`, run from the lane. CensusFrontier.md:30 recommends the same.
- Counterexample: in the lane (HEAD = BASE, measure file untracked), change `evaluate` locally to return value 12 and verdict clean. `node .ufo/waves/round-22/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6` then prints clean, value 12, exit 0, with `revision` set to BASE.
- Stable expectation: output carries `measurer: {path, sha256}`. Unless `sha256(SELF)` equals the blob at the same path in the repository's HEAD, the CLI exits 2 `measurer_not_committed` (new). Selftest fixture mode is exempt, because it copies the measure into its own fixture commit (selftest-c1.mjs L49, L389).
- Preserve: run-checks' clone (HEAD = FULL, measure committed) is unchanged. The CLI syntax `measure-c1.mjs FULL40HEXREV` is unchanged.
- Exposure needs a dirty tree or REV ≠ HEAD. The CLI detects neither today.

### F6 Medium — Exported `evaluate()` maps malformed input to baseline 0, exit 0
- Where: measure-c1.mjs L367-370 (`get`), L47-51 (`bytesOf`), L373 (baseline return).
- Counterexamples, each returning `{"verdict":"baseline","exit":0,"value":0}`: `evaluate(undefined)`; `evaluate(null)`; `evaluate([])`; `evaluate({[EXPECTATIONS]: null, [NOTE]: null})`; `evaluate({[EXPECTATIONS]: 42, [NOTE]: {}})`. The CLI cannot reach these, because `filesAt` returns Buffers or throws. `evaluate` is still the exported shared API.
- Stable expectation: a non-plain-object `files` gives exit 2 `input_shape:files`. A present key (`!== undefined`) whose value is not a Buffer, Uint8Array or string gives exit 2 `input_shape:<path>`. "Absent" means only a plain object with `files[path] === undefined`.
- Preserve: `evaluate({})` stays baseline 0, exit 0. `evaluate({[EXPECTATIONS]: Buffer.alloc(0), [NOTE]: Buffer.alloc(0)})` gives exit 1 `input_shape:semantic-expectations-json`, not baseline.

### F7 Medium — The baseline shortcut skips acquisition integrity
- Where: L373 returns before the acquisition checks at L391-426.
- Counterexample: a child of BASE that deletes `corpus/evidence/round-21/runtime/na-pending.json` and changes nothing else gives exit 0, verdict baseline, value 0. Only run-checks' FULL row (`c1-after`) would notice.
- Stable expectation: when both round-22 files are absent, still require the anchored acquisition set to be present and digest-equal to the anchor. Otherwise exit 1 `evidence_binding:acquisition-input-missing`. The code already uses this ID at L398, value 0.
- Preserve: BASE (acquisition intact, round-22 files absent) stays exit 0 baseline 0, so run-checks `c1-before` (L76, expects baseline 0 at BASE) stays green. Pre-round-21 commits would become exit 1. They are not L1 targets.

### F8 Medium — Git environment isolation: lazy fetch and PATH are open
- Where: measure-c1.mjs L479-486 (no `GIT_NO_LAZY_FETCH`; PATH unfiltered) and L488-489 (`cwd: ROOT`). Precedents with the full policy: check-measurement-binding.mjs L186-205 (adds GIT_GRAFT_FILE, GIT_NO_LAZY_FETCH, GIT_LITERAL_PATHSPECS; PATH absolute-only) and round-18 measure-c1.mjs L78-94. BuildSelftest `CLEAN_ENV` (selftest-c1.mjs L27-39) has the same gap.
- Counterexample: a measured repo with a promisor remote and a missing loose input blob. `cat-file blob` fetches on demand, so the result depends on remote state, and the same commit can score 0, 1 or exit 2 across runs. The lane has no promisor config today (observed). For PATH, a relative entry makes `git` resolve against the lane-writable ROOT [INFERENCE: Node resolves the command through the env PATH given to spawnSync]. Absolute user-writable entries remain the known residual (`.ufo/waves/round-14/w1/SecurityScope.md:51`, E4).
- Stable expectation: add `GIT_NO_LAZY_FETCH=1` (a missing object gives exit 2 `revision_input:git-object-unavailable`, deterministically), `GIT_LITERAL_PATHSPECS=1`, `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`, `TZ=UTC`. Filter PATH to absolute entries.
- Preserve: complete local repositories (lane, clone) give identical output. The exit-2 mapping at L491 is unchanged.

### F9 Medium — The selftest misses every property this question names
- Where: BuildSelftest `fixtures/expected.json` L43-44 has only `revision-short` (`deadbeef`) and `revision-missing` (all zeros). A grep found no replacement-ref, inherited-GIT_DIR, structural-entry, missing-object, blob/tree/tag-as-REV, uppercase or 64-hex case. Precedents to copy: round-18 `measure-c1.mjs:1008` (`inherited GIT_DIR redirection ignored`), `:1009` (`replace-ref baseline poison ignored`) and the poison env at `:741-753`. `.ufo/waves/round-19/w1/ReviewC1Contract.md:35-39` flagged the same gap.
- Stable expectation (exit plus finding):
  - `replace-ref-commit`, `replace-ref-tree`, `replace-ref-expectations-blob`: exit 0, unchanged value (12 on the positive). Ignored, not refused.
  - `inherited-git-dir`: exit 0, unchanged.
  - `input-symlink`, `input-gitlink`, `input-dir-with-children`, `missing-loose-input-object`: exit 2 `revision_input`.
  - `rev-blob-oid`, `rev-tree-oid`, `rev-uppercase`, `rev-64hex`: exit 2 `revision_input`. `rev-annotated-tag`: exit 2 `revision_input:commit-identity-mismatch`.
  - `input-empty-tree`: exit 2, after F10's fix.
- Preserve: every existing case keeps its expectation.

### F10 Low — An empty-tree entry at an input path is invisible to `ls-tree -r`
- Where: measure-c1.mjs L501 (`ls-tree -r -z`), and L504 (the `allowed` check rejects only listed children).
- Counterexample [INFERENCE, not run]: the expectations path is an empty-tree entry and the note is absent. No row appears for that path, so the result is baseline 0, exit 0. With the note present, the result is exit 1 `semantic-expectations-missing` where exit 2 is correct.
- Stable expectation: exact-path, non-recursive lookup for each input: `ls-tree -z REV -- <path>`. Precedents: check-user-round-contract.mjs L247-255 (`committedBlob`), check-measurement-binding.mjs L371-384 (`treeEntry`). Zero rows means absent. A row that is not a 100644 or 100755 blob gives exit 2 `revision_input:non-regular-or-unlisted-blob`.
- Preserve: absent paths and regular blobs behave as today.

### F11 Low — The acquisition set is not enforced as a set
- Where: measure-c1.mjs L36-41 (fixed list), L403-404.
- Counterexample: a REV that adds `corpus/evidence/round-21/runtime/na-pending-copy.json` produces no finding. BASE's runtime directory holds 25 files (observed).
- Stable expectation: `ls-tree -r -z REV -- corpus/evidence/round-21/runtime` must equal the 25 anchored names, or exit 1 `evidence_binding:acquisition-artifact-set`.
- Preserve: today's 25 files produce no finding.

### F12 Low — "baseline" names three different things
- Where: expectations `acquisition.baseline = e7cf11a…` (round-21's baseline). The check at L88-89. The verdict `baseline` (L373, L475) means round-22 BASE 5f58…. The spec's "baseline0" is a third use.
- Risk: a gate that compares "baseline" across artifacts can bind the wrong commit. Both e7cf11a and 1b5f449 are ancestors of BASE, so the confusion is plausible.
- Stable: rename the acquisition field (for example `priorRevision`), or keep it and document it. run-checks already binds `before` to BASE explicitly (L76).
- Preserve: no behaviour change.

### F13 Low — Output carries no code or input identity beyond `revision`
- Where: L522-523.
- Stable: add `measurer.sha256` (F5) and `inputs: {path: blobOID}` for INPUT_PATHS at REV, so the L1 record can compare them with the anchor (F1). Additive only.

### F14 Medium (debt) — The debt verdict ignores provenance, and the input is not digested
- Where: check-review-chronology.mjs L91-96 (provenance enum), L189-205 (provenance copied to output only), L213-279 (`classify` never reads it), L285-293 (reads a local path), L171-210 (no input digest in the output).
- Counterexample: both sides carry `provenance: "claimed_in_receipt"`, with equal digests and a benign non-empty history. Exit 0, `matched_supplied_scope`. The output says `claimed-in-receipt` and the verdict is unchanged.
- Stable expectation: exit 0 requires both sides to be `read_at_revision`, with equal digests and a revision equal to the L1 revision. Otherwise exit 2 `scope_unverified` (new). Output adds `input: {path, sha256}`.
- Preserve: both sides `read_at_revision` with equal digests and non-empty history gives exit 0. The brief's "exact pre-review artifact positive" must use `read_at_revision`.

### F15 Medium — The known-red production gate is a record, not an assertion
- Where: run-checks.py L51-52 (`skipped`, `knownExit: 1`), L63-67 (excluded from the cohort), L106 (verdict over `runs` only). `harm-at-measured.json` records exit 1 for `check-user-round-contract-production` (observed).
- Counterexample: at FULL the production USER gate exits 0 (repaired) or 2 (broken). The verdict is still `clean`.
- Stable expectation: run it with `expectedExit: 1` and a pinned finding. Any other result gives failed. Alternatively, a verdict `clean-with-known-red`, distinct from `clean`.
- Preserve: an unchanged known red passes, labelled as such.

### F16 Low — Sandbox status comes from the fresh clone
- Where: run-checks.py L61-62 and L105 (`git(lane, 'status', …)`, where `lane` is the clone).
- Counterexample: the lane is dirty (`corpus/SOURCES.md`, untracked round-22 files), yet the status fields are clean by construction.
- Stable: record lane status from `LANE`, labelled as lane state, or drop the claim.
- Preserve: the measurement itself reads committed bytes only.

### F17 Low — Advice noise under the lane's env policy
- Observed in this session: `git log`, `ls-tree` and `rev-list` run with `GIT_GRAFT_FILE=/dev/null` printed `advice.graftFileDeprecated` hints to stderr, though no `info/grafts` exists. Retained probes were on 2.55.0.
- Stable: parse stdout and exit codes only. Do not assert empty stderr unless `-c advice.graftFileDeprecated=false` is set.

### F18 Medium (copy hazard) — Helpers that turn Git failure into "absent"; do not copy
- scripts/check-measurement-binding.mjs L373-378 `treeEntry`: non-zero `ls-tree` returns null.
- scripts/check-adjacency.mjs L574-579: the same.
- `.ufo/waves/round-17/measure-c2.mjs` L141-153 `blob()`: a stderr regex (`does not exist|exists on disk, but not in|Not a valid object name|invalid object name|bad revision`) returns null. An absent object produces "Not a valid object name" (observed: `.ufo/waves/round-16/w2/AttackRepairSandbox.md:35-36`), so an absent revision reads as an absent path.
- `.ufo/waves/round-18/measure-c1.mjs` L127-131 `showBlob`: any non-zero returns null.
- scripts/check-round-contract.mjs L162-166 `list` and L193-200 `regularBlob`; scripts/check-user-round-contract.mjs L220-224 `list` and L247-255 `committedBlob`: non-zero returns `[]` or false.
- Retained consequences: `.ufo/waves/round-15/w2/AttackMissingRevision.md` (an absent object reported as tampering; a blob-id revision exits 128, probed). `.ufo/waves/round-15/w1/CountReasonGrammar.md:60` (`ls-tree` on the all-zero object exits 128; masking that as 0 is the regression to avoid).
- Stable: one classifier. `rev-parse`, `ls-tree` and `cat-file` non-zero give exit 2. Zero rows give absent. No stderr-regex classification.
- Preserve: the oracle's `git()` (L487-493) already does this. Keep it.

## Already correct — preserve

- `filesAt`: full lowercase 40-hex regex (L495-496). `rev-parse --verify --end-of-options REV^{commit}` must equal the input (L497-498). Any Git failure gives exit 2 (L491). Only 100644 and 100755 blobs are read, as Buffers (L503-505). No shell.
- `evaluate`: baseline only when both round-22 files are absent (L373), which keys on the new pair and not on the round-21 receipt (matching CriticOracle.md:187-188, a peer report). Partial gives exit 1 (L374-375, L388-389). Producer and expectations digests are pinned (L379-380, L401). Receipt and artifact digests are checked (L417-423). Blocking findings suppress counting (L467-473).
- `gitEnv` is an explicit object, so GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE cannot leak in (L479-486).
- `--selftest` dispatches to `selftest-c1.mjs` (L515-518). run-checks rows L68-74 agree, and BuildOracle.md:19 says the same. Resolved; keep the row.

## Stable expectation table (for BuildSelftest and L1)

| State at REV | Exit | Finding | Current code |
|---|---|---|---|
| BASE 5f58…: round-22 files absent, acquisition intact | 0 | baseline, value 0 | pass |
| BASE with `na-pending.json` removed, round-22 files absent | 1 | `evidence_binding:acquisition-input-missing` | **0 baseline (F7)** |
| expectations present, note absent (or reverse) | 1 | `source_binding` | pass |
| note line 1 ≠ `SOURCE_HEADER` | 1 | `source_binding:canonical-S101-first-line` | pass; the lane note fails (F2) |
| 39-hex, uppercase, 64-hex, all-zero REV | 2 | `revision_input` | pass |
| blob-OID or tree-OID REV | 2 | `revision_input` | pass [INFERENCE] |
| annotated tag OID REV | 2 | `revision_input:commit-identity-mismatch` | pass [INFERENCE] |
| input loose object missing | 2 | `revision_input:git-object-unavailable` | pass; **lazy fetch can change it (F8)** |
| input symlink, gitlink, directory with children | 2 | `revision_input:non-regular-or-unlisted-blob` | pass |
| input is an empty-tree entry | 2 | `revision_input:non-regular-or-unlisted-blob` | **absent (F10)** |
| `evaluate(undefined)`, or null values | 2 | `input_shape` | **baseline 0 (F6)** |
| replacement refs on commit, tree or blob | value unchanged | none | env holds; **untested (F9)** |
| inherited `GIT_DIR` | value unchanged | none | env holds; **untested (F9)** |
| extra file under round-21 runtime | 1 | `evidence_binding:acquisition-artifact-set` | **no finding (F11)** |
| debt: `event_history: []` | 2 | `event_history_unavailable` | **exit 0 (F3)** |

## Verification gaps and residual trust

- Not run: measure, selftest, run-checks, any git write, any replacement, lazy-fetch or GIT_DIR experiment. Everything above comes from reading files and from read-only git.
- [INFERENCE] items, not run: `rev-parse` on tree, blob and tag OIDs; `ls-tree -r` on an empty tree; GIT_DIR precedence over `-C`; Node's PATH lookup; `git show` applying textconv by default. Round-18 `measure-c1.mjs:128` passes `--no-textconv` to `git show`, and the current oracle uses `cat-file blob`, so it needs no change.
- Trust boundary: a single commit that rewrites code, data and in-commit pins cannot be detected from inside that commit (F1, F5). The only non-circular anchors are out-of-band: 2d5eaaa and BASE in history, and the L1 record. Peer report `.ufo/waves/round-22/w1/CriticAuth.md:63` says 5f58… equals origin/master and is recorded in the fleet MANIFEST. I did not re-verify that.
- Stale peer pins: `.ufo/waves/round-22/w1/BuildSelftest.md:14-15` (expected.json digest and commit `1677262f…`) do not match the current clone (`8029a0e8…`, `81311bad…`).
