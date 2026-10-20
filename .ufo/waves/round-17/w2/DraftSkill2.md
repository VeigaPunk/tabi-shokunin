VERDICT: ISSUES

Attacked: the wave-2 SKILL.md `## Round 17` append draft (`.ufo/waves/round-17/drafts/skill2.md`) against the wave-1 products at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`): gate anchor code and sha256s (C1), user-gate measurement provenance, count provenance (C1/C2/C3), receipt–harness binding (C2), adjacency rows and ruling quotes (C3), freshness why-not, and the jj overrides R1–R10 from `w1/RevSkillJjRule.md`.

## Evidence (grounded; read-only; nothing run that writes)

Checked with `git show M:<path> | sha256sum`, `git diff --name-only 5859243 M`, `git cat-file -t`, `git log`, grep/sed on M blobs, and python3 JSON reads of the receipt. No git write, no jj, no lane file other than the two named outputs. Counters and gates were NOT executed by this seat.

1. Frozen surfaces unchanged 5859243→M (empty diff): `scripts/check-freshness.mjs` (sha256 `93d19637…`), `scripts/webmcp-loopback-round16.mjs`, `corpus/evidence/round-16/webmcp/receipt.json`, `corpus/evidence/fleet-round-1-freshness/pins.tsv`, `corpus/knowledge/browser-surface-census.md`, `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`. `SKILL.md` unchanged (append point `:1892` holds).
2. Identity chain holds: `ROUND_SCRIPT_CURRENT_SHA256` at `scripts/check-user-round-contract.mjs:35` = `1579a794…` = sha256 of `scripts/check-round-contract.mjs` at M.
3. C2 receipt binds to the harness: receipt `producerSha256` = `de62820d…` = sha256 of `scripts/webmcp-invoke-round17.mjs` at M; `verdict pass`, `summary` cases 11/11, controls 4; `runs[]` pids 951249/951978/956298 all `gone`; `externalRequestCount 0`; Chromium `154.0.8037.97`. Receipt sha `0cfaeb7e…` matches `C2Harness.md:9`.
4. C3 data: `corpus/adjacency.tsv` (sha `7319cccc…`) has header + 9 rows: ruled 1, contested-open 2, split-declared 2, refused-route 4. Ruling quote verified at `corpus/lessons/round-16-verifier-spotcheck.md:141-142`; ruling commit `5859243` authored by `protocol-shokunin` (self-venue admissible). Fleet `.ufo/l0-questions.md:62` at `ebeb396f…` is the `tabi | round-17 |` line naming kagi and kake.
5. Lane-tip code present at M: `laneTip` `check-round-contract.mjs:114`, `check-user-round-contract.mjs:160`, `check-measurement-binding.mjs:267` (default `--at` `:941`), `resolveLaneTip` `check-adjacency.mjs:410`. Detached self-test cases exist: `lane_tip_detached_head` `:904`, `detached_head_reads_lane_tip` `:1290`, `lane_tip_detached_off_branch` `selftest-measurement-binding.mjs:462`.
6. Freshness why-not holds: `check-freshness.mjs:49-50` accepts any non-`--` witness, `:65` `%ct`, `:68` ancestry; round/user `protectedPath` now at `:168-177` and `:226-235` (the wave-1 draft's `:102`/`:150` are baseline-era numbers, now stale).
7. Prompt-vs-helper: the helper prints `landed <hash>` (`scripts/hyaku/jj-lane.sh:58-59`, `:252`, `:258`), not `pushed` as R1 of `RevSkillJjRule.md` says — corrected in the draft.

## Findings

F1 [high] User gate measured bytes ≠ M bytes. M's `scripts/check-user-round-contract.mjs` sha256 is `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`. Every recorded user-gate measurement cites `5c30b14c9c112c95a991baa3827bbf659d009db9de3abe1b5de159867ac86bf2` (`w1/GateUserAnchor.md:7`; `w1/C1Counter.md:89`). `568c0421…` appears in no wave-1 report. So user-gate `cases=45`, the C1 user entries and the C1 count=4 were not measured on the bytes committed at M.
   Repair: L1 re-runs at M the user self-test, `--witness`, `--count-witness`, `--diagnostic-witness`, and C1 entries 2, 4, 5, 6, 8 before any user-gate claim. The draft states this in §8 item 1 and records `568c0421…` as the pinned row sha.

F2 [high] Counts at M are unmeasured; recorded counts come from commits not in the lane store. `git cat-file -t` → absent for `7babdfd2…`, `a84459cd…`, `66b80768…`, `8c330c8d…`.
   - C1 `c1_anchor_safe=4`: `w1/C1Counter.md:113` at 7babdfd (user gate `5c30b14c`, see F1).
   - C2 `c2_invocation_held=1`: `w1/C2Counter.md:62` at a84459cd.
   - C3 `c3_adjacency_verified=9`: `w1/C3Counter.md:95-98` at 66b80768; TSV sha `7319cccc…` matches M, checker sha not recorded.
   Repair: L1 runs `node .ufo/waves/round-17/measure-c1.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d` and the c2/c3 counters at M, records the one-line JSON. The draft states no count (§8 item 2). PLAN's "M=4 / M=1 / M=9" are not M measurements.

F3 [medium] Read-only conflict. `jj-lane.sh state` calls `git status --porcelain` (`scripts/hyaku/jj-lane.sh:78`) and moves `.git/index` mtime; `GIT_OPTIONAL_LOCKS=0` does not (`.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:163-182`, F5). The operator prompt tells seats to read `ahead=` from `state` (`.ufo/prompts/tabi-round-17.md:256-283`).
   Repair (in draft §1): status via `GIT_OPTIONAL_LOCKS=0 git status --porcelain`; `state` kept for `ahead=`; L1 rules. Not fixable in SKILL alone.

F4 [medium] Sources S049–S052 are `queued` at M (`corpus/SOURCES.md` rows; S041–S048 mined; S053 rejected). A SKILL row cannot cite them as evidence yet (`PLAN.md` L1 amendments, last bullet).
   Repair (in draft §1): cite JjAuditTabi F1–F3 and the gate code; name S049–S052 as queued; L1 mines them before any row cites them as mined.

F5 [low] Self-test totals are not M measurements: round `cases=38` (`w1/GateRoundAnchor.md` Measurements 3), user `cases=45` (`w1/GateUserAnchor.md` Regression; see F1), binding `cases=76` (`w1/GateBindAnchor.md:50-52`; baseline 59 at `w1/MutBindSelftest.md:26`). Draft §3 labels them as the seats' measurements.

F6 [low] Round-17 measurement manifest absent at M (`corpus/evidence/round-17/measurement-binding.json`). Draft §3 leaves that row `[pending L1]`.

F7 [low] Citation drift from wave-1 drafts fixed in the draft: protectedPath `:102`/`:150` → `:168-177`/`:226-235` at M; `RevSkillJjRule.md` R1 `pushed :111` → `landed :58-59`; R9 `isProduction` cited `:51-57`, the function is at `:51`; `:1341`/`:1346` are in the round-11 append (corrected in R4).

F8 [pass] R2–R10 and the registry argv/verdict maps match the gate sources (argv `check-round-contract.mjs:272-290`, `check-user-round-contract.mjs:361-379`, `check-measurement-binding.mjs:14-17`, `check-adjacency.mjs:1080-1110`, `webmcp-invoke-round17.mjs` usage `:42-50`). C2 decision table copied from the note `:67-78` without widening.

## Repair summary for L1 (before append)

- Pin the sha256 column exactly as the draft's §3 (M values). Do not replace `568c0421…` with `5c30b14c…`.
- Run the three counters and the user-gate re-measurements at M; fill counts only from those outputs.
- Rule F3 (status vs `state`) and F4 (S049–S052 mining) before the append lands.
- Fill the round-17 manifest row when it exists.

## Files written

- `.ufo/waves/round-17/drafts/skill2.md` (the SKILL `## Round 17` append draft, §1–§8)
- `.ufo/waves/round-17/w2/DraftSkill2.md` (this report)

Installs/updates: none. Process: read-only shell (git show/cat-file/log/diff, grep, sed, sha256sum, python3 JSON reads); no sandbox clone was created.
