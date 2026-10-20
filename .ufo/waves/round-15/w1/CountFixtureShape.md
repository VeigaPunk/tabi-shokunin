# CountFixtureShape — USER fixture sequencing and reason isolation (round 15, w1)

Author: TabiR15.CountFixtureShape (leaf, read-only). Author-side audit, not non-author certification.
Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Target: `scripts/check-user-round-contract.mjs` (`writeGoodFixture`, `selfTest`, counting refusals).

## Snapshot and bounds

- The USER gate is under active concurrent edit (`git status`: ` M`). Observed size 1043 → 1060 → 1099 lines during this read; last mtime 2026-10-20 05:05:14. In-progress diff: a `reason` id on `fail()` (`COUNT_REASONS`, six ids), wired into `parseScore`, `runCount`, and `check()`; `receiptOf` / `receiptMatches` (≈756–781) added but **not yet called** by `selfTest`. All anchors below are against this snapshot; re-anchor after the edit settles.
- Read-only. No gate, counter, self-test, build, or browser run. Only `git show`/`ls-tree`-style reads and `sha256sum` on existing files. No installs or upgrades.
- No messages sent. MetadataEnforce / CounterDiagnostics have no exact ids visible in the roster or `history://` listing, so nothing was routed to them.

## Verified-OK (keep)

- Seed digest: normalized four-`[ ]` canonical text hashes to `b45c2ac3…bdab67` = `SHONEN_SEED_SHA256` (`check-user-round-contract.mjs` ≈line 46). `canonical_shonen` positive case therefore matches its seed.
- ROUND script at HEAD and working tree both hash to `8a573b4e…febe942` = `ROUND_SCRIPT_CURRENT_SHA256` (line ≈32).
- Count-witness sequencing: legacy shell gate `bebe2ef` accepts `--pstack-pin` (its argv parser, legacy line 226) and runs `bash -c` with `cwd: root` (legacy line 311). So `join(root, COUNT_WITNESS_MARKER)` observes the same location the legacy arm writes. The marker-removal-between-arms order in `runCountWitness` is correct.
- Good isolation pair: `future_lesson_allowed` (round-2 added, exit 0) vs `future_lesson_mutated_after_commit` (same add, then rewritten in `mutation-2`, exit 1). Only the second commit differs, so the pair isolates the post-add-mutation branch of `lessonDrift`.
- Fixture commit order is well-defined: `writeGoodFixture` (≈631) makes baseline → `work` (round-marker, evidence, lesson) → `measure` (SCORECARD, LOG, report; this is the pin). Every mutation is applied after the pin and committed as `mutation` (and `mutation-2` where used). `measured-against` = `work`, which is an ancestor of pin, so `checkReport` `report_not_after_commit` holds in the fixture.

## Findings (ordered by impact on the C1 claim)

### F1 — Refusal cases are attributed by finding only (high)

- Loop (≈988–1011): `match = exit === test.exit && output.includes('finding=' + test.finding) && !leaked`. `detail` is never checked and `reason` is not checked, although the catch block now prints `reason=` (≈1096–1097) and `detail=`.
- Consequence: every `score_mismatch` refusal passes every `score_mismatch` case, regardless of cause. Affected cases:
  - `count_malicious_tee_refused` (919), `count_malicious_shell_refused` (922), `count_malicious_option_injection_refused` (925): intended cause is the grammar refusal in `parseScore` (≈408, `counting command is not a supported git line count`, reason `unsupported_counting_command`). Nothing asserts that. A later `score_mismatch` would pass.
  - `count_missing_revision_red` (937): intended cause is `runCount` after-measure (≈427, `Counting command failed`, reason `counting_command_failed`), not a parse refusal.
  - `count_wrong_after_red` (943): intended cause is `check()` (≈616, `after measurement does not match`, reason `after_count_mismatch`).
- Proposed tests (exit / finding / reason / detail-substring):
  - tee, shell, option_injection: 1 / score_mismatch / `unsupported_counting_command` / `is not a supported git line count`; keep `noMarker`.
  - count_missing_revision_red: 1 / score_mismatch / `counting_command_failed` / `Counting command failed`.
  - count_wrong_after_red: 1 / score_mismatch / `after_count_mismatch` / `after measurement does not match`.
  - NEW count_before_drift_red: set before=1, after=2 → 1 / score_mismatch / `before_count_mismatch` / `before measurement does not match`. (Order matters: line ≈613 `before === after` must not fire first, so use after=2.)
  - NEW count_equal_before_after_red: before=1, after=1 → 1 / score_mismatch / `score_not_improved` / `before and after are the same`.
  - Negative controls stay as-is: `count_historical_supported`, `count_quoted_supported`, `count_two_stage_supported` (exit 0, clean).
- Wiring: `receiptOf` already parses `reason=` and `detail=` from the anchored stderr line. Add `reason` and `detail` fields to each case and replace the `output.includes` match with `receiptMatches(test, receiptOf(result)) && !leaked`. Print the observed `reason`/`detail` on the SELFTEST line so a FAIL is diagnosable.

### F2 — SELFTEST diagnostic lines print values that were not observed (medium; directly within "truthful diagnostics")

- `count_committed_*` line (≈1021): `actual_exit=0` is hard-coded and `expected_finding=clean`, yet the line is printed and then `fail()` on mismatch. On FAIL it reports exit 0 for a run that never exited. Fix: print the observed `before`/`after` against the expected values and drop the fabricated `actual_exit`, or print `actual_exit=n/a` with `applicable=0`.
- `count_witness_comparison` line (≈1033): `actual_exit=${witnessMatch?0:1}` and `top_exit`/`exit` are derived from a boolean, not from a process exit. `expected_finding=clean` is printed although the new arm is expected to yield `score_mismatch`; the expectation is the old arm's, which is ambiguous. Fix: print `old_exit`/`new_exit` (already present) and an explicit `expected_old=clean expected_new=score_mismatch`.
- Per-case line (≈1008): `no_marker=${noMarker ? (leaked?0:1) : 0}` uses `0` for both "not applicable" and "marker leaked". Fix: `no_marker=n/a` when there is no `noMarker`.
- `production_alias_refused` (≈1042): checks only `finding=usage`. Usage failures come from several branches (baseline format, expect range, production override ≈line 280). Add `detail` `Production check uses the fixed baseline` (usage is outside the counting contract, so no reason id).

### F3 — Pre-pin rename case is not a rename case (medium)

- `future_lesson_rename_from_pinned` (976) runs `git mv corpus/lessons/round-1.md corpus/lessons/round-13.md` after the pin. `round-1.md` is baseline-protected (`LEGACY_LESSON` in `protectedPath`, line ≈124). `checkHistory`'s protected loop (302–) therefore fails first with `Protected bytes changed: corpus/lessons/round-1.md`, and the PSTACK diff / `lessonDrift` rename logic is never reached. The name claims coverage the fixture does not give.
- Why it's hard now: `writeGoodFixture` has no hook before the pin, and the pin-diff path (`--no-renames --name-status`, ≈305 HEAD numbering) only sees paths added or changed in pin..HEAD.
- Proposed fixture: give `writeGoodFixture` an optional `beforePin(root)` hook, invoked after `work` and before `measure`, that writes `corpus/lessons/round-2.md`. Then the mutate step runs `git mv corpus/lessons/round-2.md corpus/lessons/round-13.md`. Expected: 1 / history_rewritten / detail substring `corpus/lessons/round-2.md`. Reasoning: pin..HEAD is `A round-13.md` (MDRT-filter empty → not drift) plus `D round-2.md` (status ≠ A → drift). Detail is `Pstack bytes changed: D<TAB>corpus/lessons/round-2.md` (the drifted line keeps its status letter and tab), so assert the path substring only.
- Keep the existing case under a truthful name (e.g., `baseline_lesson_renamed_protected`) with detail `Protected bytes changed: corpus/lessons/round-1.md`.

### F4 — `round_script_cutover` reads live working-tree bytes, unlike its sibling (medium-low; latent)

- Case at 1020: `readFileSync(join(defaultRoot, ROUND_SCRIPT))`. Sibling `round_script_rollback_to_cutover` (946) reads committed bytes via `show(defaultRoot, '1212207…')` and fail-closes on digest mismatch (`could_not_evaluate`, exit 2).
- Today the working tree equals HEAD, so the case passes. If a ROUND gate edit is uncommitted, the case would report `history_rewritten` against the gate, which is a misattributed failure of the fixture input.
- Proposed: `const bytes = show(defaultRoot, 'HEAD', ROUND_SCRIPT); if (!bytes || sha256(bytes) !== ROUND_SCRIPT_CURRENT_SHA256) fail('could_not_evaluate', 'Committed round checker is not the accepted current bytes', 2);`, then write `bytes`.
- Naming hazard: `ROUND_SCRIPT_CUTOVER_SHA256` (≈31) names the archived round-13 intermediate (`1212207`), while the case `round_script_cutover` and the header comment (≈22) call `ROUND_SCRIPT_CURRENT_SHA256` the "cutover". Rename one of them (for example, the case to `round_script_current_accepted`) so reason ids in the matrix do not collide.

### F5 — SHONEN negatives are indistinguishable (medium; reason isolation)

- `canonicalShonen` (184) returns a boolean. Every SHONEN negative (`shonen_x_any_text` 982, `shonen_unresolvable_pointer` 987, `shonen_tree_pointer` 991, `shonen_blank_box_prose` 995, `shonen_wrong_title` 999, `shonen_extra_box` 1003, `shonen_crlf` 1006, `shonen_double_newline` 1009) is attributed only to `Protected bytes changed: SHONEN.md` (checkHistory, ≈line 292-equivalent in the protected loop). The gate cannot say which rule rejected the bytes, and the self-test cannot assert it.
- `shonen_x_any_text` mutates two properties at once (the box mark and the evidence line). Any one of the two rejections satisfies it. Split it:
  - `shonen_x_mark_only`: only `- [x] SKILL.md…` (rejected at the mark check).
  - `shonen_prose_pointer_only`: `[~]` kept, evidence line replaced by prose with no backticks (rejected at `pointerResolves`).
- Proposed: `canonicalShonen` returns a reason id (closed vocabulary, e.g., `shonen_cr`, `shonen_trailing_newline`, `shonen_mark_not_allowed`, `shonen_pointer_unresolved`, `shonen_prose_under_blank_box`, `shonen_seed_mismatch`, `shonen_extra_content`), and the protected-loop detail becomes `Protected bytes changed: SHONEN.md (canonical: <id>)`. Each negative then asserts its id via F1's mechanism.
- Missing positive: no case covers a canonical SHONEN with all four boxes `[ ]` and no evidence lines. The policy permits it (`canonicalShonen` accepts `[ ]` with no continuation line), so add `canonical_shonen_all_blank`: exit 0 / clean. This also pins the "[~] downgraded to [ ]" shape the review calls intended.

### F6 — Pstack/tamper cases lack path-level attribution (low)

- `pstack_evidence_tamper` (1012), `round_script_tamper` (1016), `round_script_rollback_to_cutover` (946) all expect a generic `history_rewritten`. Their intended causes are distinct drift paths. Assert detail substrings: `corpus/evidence/pstack-20261015/tampered.tsv`, `scripts/check-round-contract.mjs`, and `scripts/check-round-contract.mjs` respectively.
- `short_swarm` (952) → detail `accounts for 31 results`; `missing_gate` (958) → `lesson has no Gate`; `consequential_action` (961) → `contains consequential-action: performed`; `future_lesson_mutated_after_commit` (968) and `historical_lesson_changed` (973) → path substrings `corpus/lessons/round-2.md` and `corpus/lessons/round-1.md`. Each is a single-cause fixture, so the detail assertion costs nothing.

## Proposed test matrix for L1 (run after integration; not run here)

| case | exit | finding | reason | detail substring |
|---|---|---|---|---|
| count_malicious_tee_refused | 1 | score_mismatch | unsupported_counting_command | is not a supported git line count |
| count_malicious_shell_refused | 1 | score_mismatch | unsupported_counting_command | is not a supported git line count |
| count_malicious_option_injection_refused | 1 | score_mismatch | unsupported_counting_command | is not a supported git line count |
| count_missing_revision_red | 1 | score_mismatch | counting_command_failed | Counting command failed |
| count_wrong_after_red | 1 | score_mismatch | after_count_mismatch | after measurement does not match |
| count_before_drift_red (new; before=1, after=2) | 1 | score_mismatch | before_count_mismatch | before measurement does not match |
| count_equal_before_after_red (new; before=1, after=1) | 1 | score_mismatch | score_not_improved | before and after are the same |
| future_lesson_rename_from_pre_pin (new) | 1 | history_rewritten | — | corpus/lessons/round-2.md |
| baseline_lesson_renamed_protected (renamed case) | 1 | history_rewritten | — | corpus/lessons/round-1.md |
| canonical_shonen_all_blank (new positive) | 0 | clean | — | — |
| shonen_x_mark_only / shonen_prose_pointer_only (split) | 1 | history_rewritten | shonen reason id (after F5) | — |
| production_alias_refused | 2 | usage | — | Production check uses the fixed baseline |

Negative controls unchanged: `clean`, `count_historical_supported`, `count_quoted_supported`, `count_two_stage_supported`, `future_lesson_allowed`, `canonical_shonen`, `round_script_cutover`.

## Commands L1 should run after integration (not run by me)

- `node scripts/check-user-round-contract.mjs --self-test` once, after the file stops changing; confirm each SELFTEST line shows the asserted reason/detail.
- `node scripts/check-user-round-contract.mjs` (production) — expected `finding=round_count` with 6 of 10 (not a clean pass).
- Grep the self-test cases for `reason:` / `detail:` coverage to confirm no case still matches on finding alone.

## Residual risk and gaps

- The file is being edited concurrently; findings F1–F6 may already be partly addressed. Re-read before routing.
- `receiptMatches` / `receiptOf` are unexercised until wired; they were read, not run.
- The `reason` vocabulary covers counting refusals only. SHONEN reason ids (F5) are a proposal, not implemented.
- Whether `ROUND_SCRIPT_CUTOVER_SHA256` equals the blob of `1212207` was not verified (I did not recompute it).
- Not verified by execution: every "expected" exit, finding, and detail string above comes from reading the code paths, not from running them.

## Tooling

No installs or updates. No tools added.
