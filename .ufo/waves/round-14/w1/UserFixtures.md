# UserFixtures — round-14 w1 report (read-only analysis of scripts/check-user-round-contract.mjs)

Author seat: TabiR14.UserFixtures. Scope: fixture expectations, script-cutover invariant, and tests C1 needs so it cannot bless arbitrary checker edits. No checks, builds, self-tests, or witness runs were executed. No files were edited except this report. No tools were installed or upgraded.

Pointers are `scripts/check-user-round-contract.mjs:LINE` relative to tabi-shokunin unless noted.

## 1. Axes

- A. Operability / execution surface (C1 core): whether lane-authored SCORECARD text can run shell code.
- B. Pin and cutover integrity: whether an edit to the user gate itself is detected by any check.
- C. Count semantics parity: whether a replacement reproduces the historical `bash -c` pipeline results.
- D. Fixture coverage: which failure branches the self-test actually exercises.

## 2. Findings

### F1 (high, axis A): lane-authored command still runs through bash
- `parseScore` gates the command only with `command.startsWith('git ')` and `/[;&`<>\n\\]|\$[({]/` (line 304). Not blocked: `|`, `||`, `(`, `)`, `{`, `}`, `"`, `'`, `#`, `\r`, `$VAR`, globs.
- `runCount` runs `spawnSync('bash', ['-c', command], { cwd: root, timeout: 30000 })` (line 311). It is called for the baseline arm (line 494) and the measured arm (line 495).
- Injection proof by reading: a SCORECARD command `git ls-tree -r --name-only <measured> | (touch PWNED) | wc -l` passes the regex and the `git ` prefix. The `measured` substitution at line 492 still succeeds, so execution happens at line 494 before any count comparison.
- Consequence: the blocklist is not an execution barrier. C1 must stop passing the string to a shell, not extend the blocklist.

### F2 (high, axis B): the user gate's own bytes are unpinned
- `USER_SCRIPT` (line 30) and `LEGACY_USER_GATE_BLOB` (line 31) are used only by `witness()` (lines 629–634). `scripts/check-user-round-contract.mjs` is absent from `PSTACK_PATHS` (lines 49–58), `protectedPath` (lines 100–109), `pstackDrift` (lines 204–215), and `APPEND_ONLY` (line 48).
- Result: `check()` and `--self-test` never detect an edit to this file. Self-test runs the edited file against fixtures, so a weakened gate passes its own self-test.
- A self-referential in-file digest is impossible (the file's bytes contain its own hash). The only non-circular pin lives outside this file.

### F3 (high, axis B/scope): the round-gate cutover allows exactly two digests
- `ROUND_SCRIPT = 'scripts/check-round-contract.mjs'` (line 17). `acceptedRoundScript` (lines 176–189) accepts HEAD bytes only when the digest is `ROUND_SCRIPT_CUTOVER_SHA256` (line 22) or `ROUND_SCRIPT_PRIOR_SHA256` (line 21). The pinned prior bytes must hash to the prior digest (line 183).
- The comment at lines 14–16 and 18–20 states this is the one accepted tooling cutover (committed at 1212207f). A third digest fails `history_rewritten` (lines 204–205, 270).
- Consequence: any C1 edit to `scripts/check-round-contract.mjs` changes the digest to a third value and turns production into `history_rewritten`. The `round_script_tamper` self-test (lines 734–737) already asserts this. Line 3 says the production pstack checker "stays unchanged."
- Decision needed from Main/L1: "both legacy gates" can include the round gate only with a newly authorized cutover, which this checker cannot express without editing the round gate. Recommended default: C1 changes only `scripts/check-user-round-contract.mjs`. This report does not verify the sha256 values (no checks run).

### F4 (medium, axis C): exact count semantics that a replacement must reproduce
- Current result is the status of the last pipeline stage (`wc`). Therefore:
  - `git grep` no-match (exit 1) yields count `0`, not an error. A direct spawn that treats non-zero as failure breaks this and changes the failure message from `score_mismatch` "after measurement does not match" to "Counting command failed".
  - A failing `git ls-tree`/`git grep` (bad rev, exit 128) also yields `0` silently, because the downstream stage returns 0.
  - `wc -l` counts newline-terminated matched lines; output is `stdout.trim()` compared as a string to `before`/`after` (line 494–495).
  - Measured substitution is `replaceAll(score.measured, options.baseline)` (line 492); a measured hash absent from the command is rejected (line 493), which is untested (F7).
- Git-binary output (for example `Binary file … matches` from `git grep -h`) counts as a line. A JS re-implementation of `git grep` would differ; C1 must spawn git for the first stage and keep its output bytes.
- Decision for L1: keep the silent-0 on git failure to preserve exact semantics, with a parity test pinning it, or fail closed. Either way, record the choice. Recommended: preserve and pin with a test, because changing it is a semantic change outside C1 scope.

### F5 (medium, axis A/C): the grammar must accept exactly the historical forms
- Six committed user-round commands (SCORECARD.md lines 332–378; `user-20261015-r01` through `r06`), all of the form `git ls-tree -r --name-only <sha> | grep <pattern> | wc -l`. r03 (SCORECARD.md line 353 region) adds a second stage `| grep boundary/ | grep '.txt' | wc -l` (`.txt` is BRE, `.` matches any character). Also `grep corpus/knowledge/user-public-observation.md` (r04) uses unescaped `.`.
- Fixture form (line 580): `git grep -h '^marker: admitted-user-round$' <sha> -- round-marker.txt | wc -l`. The clean fixture must keep passing (witness depends on it, lines 648–657).
- A grammar that escapes `.` as a literal changes counts (for example `boundary/a-txt` matches `.txt`). Test T5 below pins this.

### F6 (medium, scope fact): production round count mismatch at HEAD
- `check()` requires `options.expect` rounds (line 476). Production defaults to 10 (line 218), and production forces `expect === 10` (line 237). `corpus/lessons` lists six `user-20261015-r0N` lessons (r01–r06), and SCORECARD has six `user-round:` entries (r01–r06). Evidence directories exist for r07 (`corpus/evidence/user-20261015-r07/`) without a lesson or SCORECARD entry.
- Consequence: production `check` at HEAD fails `round_count` (6 ≠ 10) before any C1 change. L1 must not expect `USER_ROUND_CONTRACT verdict=clean` from the production run. C1 must not change the `10` scalar to make it pass.

### F7 (medium, axis D): self-test gaps
Self-test has 20 fixture cases plus one alias case (`cases.length + 1` = 21 `SELFTEST` lines, line 778). Missing coverage:
- No command-grammar or injection case; no `missing_score`, `score_mismatch`, or "measured hash absent" case (lines 297–307, 493–495).
- No `evidence_moved` (line 435), `report_commit`/`report_not_after_commit`/`report_shonen` (lines 401–408), `round_count`/`round_sequence` (lines 476–479), `public_observation` (lines 439–469), `swarm_evidence`/DROPOUT/GAP (lines 379–392).
- `checkPublic` only enforces "found ≥1" when `expect === 10` (line 468); self-test runs `--expect 1`, so the zero-found branch is never exercised.
- Alias guard (line 237) is exercised only through `expect !== 10`; the `baseline !== HARD` and `pstackPin` clauses are untested.
- Witness mode is not in self-test; negative witness (other gate blob, lines 631–634) is untested.
- All four `shonen_*` negatives (lines 700–729) resolve to `history_rewritten` through the same first-loop branch (lines 250–251), so they do not distinguish the first-loop branch from the pstack branch (line 206). They still do cover `canonicalShonen` mutations.
- The harness (lines 743–765) checks only exit code and finding text. It has no side-effect assertion, which F1 tests need.

### F8 (low, scope): external validator is an unpinned trust input
- `VALIDATOR` is an absolute path outside the repo (line 33), spawned with `cwd: /home/vgpnk/Projects/ufo-fsd-alpha` (lines 337–342). The clean fixture's `short_swarm` pass depends on its `plan` output. Its bytes are not pinned by this checker. Record it in the round-14 evidence if the user gate is to be trusted.

### F9 (low): error handling
- `runCount` timeout (30 s, line 311) returns `result.error` and is reported as `score_mismatch` (line 312), not as an evaluation failure (`could_not_evaluate`, exit 2).
- `show(...).toString('utf8')` at lines 481–484 throws a `TypeError` on a missing SCORECARD/LOG/lesson and exits 2 with the `could_not_evaluate` finding and a non-descriptive detail.

### F10 (info, not C1): public-capture bypass
- `checkPublic` skips any capture whose `class` is not `public-observation` or whose `consequential !== false` (lines 447–448) without counting or rejecting it. A non-GET, consequential capture is ignored rather than failed, which matters only when `expect === 10` and no other capture qualifies. Record as residual; do not fix under C1 unless assigned.

## 3. Required tests for C1 (none executed; each names expected result)

Add a side-effect assertion hook to the harness (for example `assert(root)` evaluated after the run) so injection cases can prove non-execution.

- T1 injection not executed (must-have). Fixture = clean fixture with SCORECARD `command:` replaced by payloads, each containing the measured hash:
  - `git ls-tree -r --name-only <m> | (touch <root>/PWNED) | wc -l`
  - `git grep -h x <m> -- none || touch <root>/PWNED`
  - `git ls-tree -r --name-only <m> | wc -l && touch <root>/PWNED` (already blocked by `&`; keep as regression)
  Expected: exit 1, `finding=missing_score`, and `<root>/PWNED` absent.
- T2 out-of-grammar argv rejected before execution: `git -c core.pager=<x> ...`, `git grep -O<prog> ...`, `sh -c ...`, `git ... | sh`, and a `\r` inside the command. Expected: `missing_score`, no side effect.
- T3 historical grammar accepted, parity with legacy oracle: golden table containing the fixture form (line 580), the six production forms (SCORECARD lines 336–378), and the r03 two-stage form. Expected: exit 0, identical before/after integers as the legacy bash gate on the same repo.
- T4 no-match is count 0, not failure: `before: 0`, `after: 1`, pattern matching nothing. Expected: exit 1, `score_mismatch`, detail contains "after measurement does not match" and not "Counting command failed".
- T5 BRE dot semantics: fixture path `boundary/a-txt` with command `... | grep '.txt' | wc -l`. Expected count includes it (parity with legacy bash count).
- T6 measured substitution: (a) command without the measured hash → `missing_score` (line 493); (b) measured hash twice → both replaced in the baseline arm; parity with legacy.
- T7 git-error parity (differential only): nonexistent 40-hex measured rev. Expected: new count equals legacy count (0) and no exception. Decision in F4 governs the expected value.
- T8 witness: (a) `--witness <rev whose gate blob != 18e2c79…>` → exit 2, `witness_failure`; (b) `--witness <pre-C1 rev with legacy blob>` → `USER_ROUND_CONTRACT_WITNESS ... result=PASS` with new script as the new arm.
- T9 alias guard matrix: alias of defaultRoot with each of `--expect 10 --pstack-pin <hex>`, `--baseline <other 40-hex>`, `--expect 1` → exit 2, `finding=usage`.
- T10 public and swarm negatives (optional for C1, required if C1 claims full gate coverage): hash mismatch on `dom.txt`; `localhost` URL; POST request; DROPOUT seat; `..` evidence path.
- T11 differential parity harness (L1, outside selftest): for an identical repo copy, legacy gate (blob 18e2c79…) and new gate must agree on exit, finding, and every `ROUND` line for all inputs except the T1/T2 payloads, which must be rejected by the new gate only. Any other divergence is a C1 defect.

## 4. Cutover invariant and how C1 avoids blessing arbitrary edits

- No in-repo test can detect an edit to `scripts/check-user-round-contract.mjs`, because self-test and production both run the edited bytes (F2). Mitigation must be external.
- Recommended: L1 records `git rev-parse HEAD:scripts/check-user-round-contract.mjs` and `sha256sum` of the committed file in the round-14 wave evidence (a file C1 does not touch) and verifies equality after the final commit. Record the old legacy blob (18e2c79…) as the prior value.
- Do not add the post-C1 digest into the user gate itself (circular). Do not add the user gate to `PSTACK_PATHS` without a cutover constant, since that would need a digest the file cannot contain.
- Round gate is governed by F3; leave `scripts/check-round-contract.mjs` untouched unless Main authorizes a new cutover.

## 5. Commands L1 should run after all seats land (not run by this seat)

Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` after committing the C1 change (production reads committed `HEAD` but also the working-tree script):
- `node --check scripts/check-user-round-contract.mjs`
- `node scripts/check-user-round-contract.mjs --self-test` (expect 21 `SELFTEST` lines and `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=21`, plus the T1–T9 additions)
- `git rev-parse HEAD:scripts/check-user-round-contract.mjs` and `git hash-object scripts/check-user-round-contract.mjs` (must match; record both)
- `git rev-parse <rev>:scripts/check-user-round-contract.mjs` for a candidate witness rev, to find a rev whose blob is `18e2c79…`, then `node scripts/check-user-round-contract.mjs --witness <rev>` (expect `result=PASS`)
- Production: `node scripts/check-user-round-contract.mjs` (expect `round_count` failure per F6; record it, do not treat as clean)
- Differential (T11): `git archive HEAD | tar -x -C /var/tmp/ufo-r14-diff`, extract legacy gate with `git show 18e2c79…:scripts/check-user-round-contract.mjs` into a temp file, and run both gates with `--repo /var/tmp/ufo-r14-diff --baseline 7f506affa55f6fb892d3c8073c75151c998bdf2c --expect 6 --pstack-pin 92d700d6a8aa9855f1e9d2cc8e12c82f762a1367` (expect-6 is not canonical, so the production refusal applies only to the default root; this copy is a different path, so `sameRoot` is false). Compare stdout and exit.

Note: with `--repo` pointing at the extracted copy, `production` is false, so the pstack pin is honored (line 259).

## 6. Decisions requested (not blocking this report)

1. Confirm C1 scope excludes `scripts/check-round-contract.mjs` (F3), or authorize a new cutover.
2. Choose F4 git-failure semantics (preserve silent 0 with pin, or fail closed).
3. Acknowledge F6: production is not clean at HEAD (6 of 10 user rounds).

## 7. Tooling

No tools installed, upgraded, or removed. Reads only: `scripts/check-user-round-contract.mjs`, `SCORECARD.md` (user-round blocks), `corpus/lessons` and `corpus/evidence` listings.

## 8. Coordination

Message to UserCounter sent via agent message summarizing F1, F2, T1–T3, and the round-gate constraint in F3.
